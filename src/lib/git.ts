import type { Commit, Branch, Remote, FileStatus, GitResult } from '../types/git'

async function git(repoPath: string, args: string[]): Promise<GitResult> {
  return window.gitApi.execute(repoPath, args)
}

export async function getCommits(repoPath: string, limit = 100): Promise<Commit[]> {
  // Format: hash|parents|author|email|timestamp|message|refs
  const format = '%H|%P|%an|%ae|%at|%s|%D'
  const result = await git(repoPath, [
    'log',
    '--all',
    `--max-count=${limit}`,
    `--format=${format}`,
    '--topo-order',
  ])

  if (result.code !== 0) {
    console.error('git log failed:', result.stderr)
    return []
  }

  const commits: Commit[] = []
  const lines = result.stdout.trim().split('\n').filter(Boolean)

  for (const line of lines) {
    const parts = line.split('|')
    if (parts.length < 6) continue

    const hash = parts[0]
    const parents = parts[1] ? parts[1].split(' ') : []
    const author = parts[2]
    const email = parts[3]
    const timestamp = parseInt(parts[4], 10)
    const message = parts[5]
    const refsStr = parts[6] || ''
    const refs = refsStr ? refsStr.split(', ').map(r => r.trim()).filter(Boolean) : []

    commits.push({
      hash,
      shortHash: hash.substring(0, 7),
      parents,
      author,
      email,
      timestamp,
      message,
      refs,
      lane: 0, // Will be computed later
    })
  }

  // Compute lanes for graph visualization
  return computeLanes(commits)
}

function computeLanes(commits: Commit[]): Commit[] {
  const lanes: Map<string, number> = new Map()
  const activeLanes: (string | null)[] = []

  for (const commit of commits) {
    // Find or assign lane for this commit
    let lane = lanes.get(commit.hash)
    
    if (lane === undefined) {
      // Find first available lane
      lane = activeLanes.findIndex(l => l === null || l === commit.hash)
      if (lane === -1) {
        lane = activeLanes.length
        activeLanes.push(commit.hash)
      }
    }

    commit.lane = lane

    // Clear this lane
    activeLanes[lane] = null

    // Assign lanes to parents
    for (let i = 0; i < commit.parents.length; i++) {
      const parentHash = commit.parents[i]
      if (!lanes.has(parentHash)) {
        if (i === 0) {
          // First parent continues in same lane
          lanes.set(parentHash, lane)
          activeLanes[lane] = parentHash
        } else {
          // Other parents get new lanes
          let newLane = activeLanes.findIndex(l => l === null)
          if (newLane === -1) {
            newLane = activeLanes.length
            activeLanes.push(parentHash)
          } else {
            activeLanes[newLane] = parentHash
          }
          lanes.set(parentHash, newLane)
        }
      }
    }
  }

  return commits
}

export async function getBranches(repoPath: string): Promise<Branch[]> {
  const branches: Branch[] = []

  // Get current branch
  const headResult = await git(repoPath, ['rev-parse', '--abbrev-ref', 'HEAD'])
  const currentBranch = headResult.code === 0 ? headResult.stdout.trim() : ''

  // Get local branches
  const localResult = await git(repoPath, [
    'branch',
    '--format=%(refname:short)|%(objectname:short)|%(upstream:short)',
  ])

  if (localResult.code === 0) {
    for (const line of localResult.stdout.trim().split('\n').filter(Boolean)) {
      const [name, hash, upstream] = line.split('|')
      branches.push({
        name,
        hash,
        upstream: upstream || undefined,
        isCurrent: name === currentBranch,
        isRemote: false,
      })
    }
  }

  // Get remote branches
  const remoteResult = await git(repoPath, [
    'branch',
    '-r',
    '--format=%(refname:short)|%(objectname:short)',
  ])

  if (remoteResult.code === 0) {
    for (const line of remoteResult.stdout.trim().split('\n').filter(Boolean)) {
      const [name, hash] = line.split('|')
      // Skip HEAD references
      if (name.includes('HEAD')) continue
      branches.push({
        name,
        hash,
        isCurrent: false,
        isRemote: true,
      })
    }
  }

  return branches
}

export async function getRemotes(repoPath: string): Promise<Remote[]> {
  const result = await git(repoPath, ['remote', '-v'])
  if (result.code !== 0) return []

  const remotes: Map<string, Remote> = new Map()

  for (const line of result.stdout.trim().split('\n').filter(Boolean)) {
    const match = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/)
    if (!match) continue

    const [, name, url, type] = match
    let remote = remotes.get(name)
    if (!remote) {
      remote = { name, fetchUrl: '', pushUrl: '' }
      remotes.set(name, remote)
    }

    if (type === 'fetch') remote.fetchUrl = url
    if (type === 'push') remote.pushUrl = url
  }

  return Array.from(remotes.values())
}

export async function getStatus(repoPath: string): Promise<FileStatus[]> {
  const result = await git(repoPath, ['status', '--porcelain=v2'])
  if (result.code !== 0) return []

  const files: FileStatus[] = []

  for (const line of result.stdout.trim().split('\n').filter(Boolean)) {
    if (line.startsWith('1 ')) {
      // Ordinary changed entry
      const parts = line.split(' ')
      const xy = parts[1]
      const path = parts.slice(8).join(' ')

      const indexStatus = xy[0]
      const workTreeStatus = xy[1]

      // Staged changes
      if (indexStatus !== '.') {
        files.push({
          path,
          status: parseStatus(indexStatus),
          staged: true,
        })
      }

      // Unstaged changes
      if (workTreeStatus !== '.') {
        files.push({
          path,
          status: parseStatus(workTreeStatus),
          staged: false,
        })
      }
    } else if (line.startsWith('2 ')) {
      // Renamed/copied entry
      const parts = line.split('\t')
      const headerParts = parts[0].split(' ')
      const xy = headerParts[1]
      const newPath = parts[1]
      const oldPath = parts[2]

      if (xy[0] !== '.') {
        files.push({
          path: newPath,
          oldPath,
          status: 'renamed',
          staged: true,
        })
      }
    } else if (line.startsWith('? ')) {
      // Untracked
      const path = line.substring(2)
      files.push({
        path,
        status: 'untracked',
        staged: false,
      })
    }
  }

  return files
}

function parseStatus(char: string): FileStatus['status'] {
  switch (char) {
    case 'M': return 'modified'
    case 'A': return 'added'
    case 'D': return 'deleted'
    case 'R': return 'renamed'
    default: return 'modified'
  }
}

export async function stageFile(repoPath: string, path: string): Promise<boolean> {
  const result = await git(repoPath, ['add', path])
  return result.code === 0
}

export async function unstageFile(repoPath: string, path: string): Promise<boolean> {
  const result = await git(repoPath, ['restore', '--staged', path])
  return result.code === 0
}

export async function stageAll(repoPath: string): Promise<boolean> {
  const result = await git(repoPath, ['add', '-A'])
  return result.code === 0
}

export async function unstageAll(repoPath: string): Promise<boolean> {
  const result = await git(repoPath, ['reset', 'HEAD'])
  return result.code === 0
}

export async function commit(repoPath: string, message: string): Promise<{ success: boolean; error?: string }> {
  const result = await git(repoPath, ['commit', '-m', message])
  if (result.code === 0) {
    return { success: true }
  }
  return { success: false, error: result.stderr || result.stdout }
}

export async function push(repoPath: string): Promise<{ success: boolean; error?: string }> {
  const result = await git(repoPath, ['push'])
  if (result.code === 0) {
    return { success: true }
  }
  return { success: false, error: result.stderr || result.stdout }
}

export async function pull(repoPath: string): Promise<{ success: boolean; error?: string }> {
  const result = await git(repoPath, ['pull'])
  if (result.code === 0) {
    return { success: true }
  }
  return { success: false, error: result.stderr || result.stdout }
}

export async function getCurrentBranch(repoPath: string): Promise<string> {
  const result = await git(repoPath, ['rev-parse', '--abbrev-ref', 'HEAD'])
  return result.code === 0 ? result.stdout.trim() : ''
}

export async function checkoutBranch(repoPath: string, branchName: string): Promise<{ success: boolean; error?: string }> {
  const result = await git(repoPath, ['checkout', branchName])
  if (result.code === 0) {
    return { success: true }
  }
  return { success: false, error: result.stderr || result.stdout }
}
