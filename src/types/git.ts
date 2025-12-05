export interface GitResult {
  stdout: string
  stderr: string
  code: number
}

export interface Commit {
  hash: string
  shortHash: string
  parents: string[]
  author: string
  email: string
  timestamp: number
  message: string
  refs: string[]
  lane: number
}

export interface Branch {
  name: string
  hash: string
  upstream?: string
  isCurrent: boolean
  isRemote: boolean
}

export interface Remote {
  name: string
  fetchUrl: string
  pushUrl: string
}

export interface FileStatus {
  path: string
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked'
  staged: boolean
  oldPath?: string
}

declare global {
  interface Window {
    gitApi: {
      execute: (repoPath: string, args: string[]) => Promise<GitResult>
      openFolderDialog: () => Promise<string | null>
      isRepo: (path: string) => Promise<boolean>
    }
  }
}

export {}
