import { create } from 'zustand'
import type { Commit, Branch, Remote, FileStatus } from '../types/git'
import * as git from '../lib/git'

interface GitStore {
  // Repository state
  repoPath: string | null
  isLoading: boolean
  error: string | null

  // Git data
  commits: Commit[]
  branches: Branch[]
  remotes: Remote[]
  stagedFiles: FileStatus[]
  unstagedFiles: FileStatus[]
  currentBranch: string

  // Actions
  openRepository: (path: string) => Promise<void>
  refresh: () => Promise<void>
  stageFile: (path: string) => Promise<void>
  unstageFile: (path: string) => Promise<void>
  stageAll: () => Promise<void>
  unstageAll: () => Promise<void>
  commit: (message: string) => Promise<{ success: boolean; error?: string }>
  push: () => Promise<{ success: boolean; error?: string }>
  pull: () => Promise<{ success: boolean; error?: string }>
  checkoutBranch: (branchName: string) => Promise<{ success: boolean; error?: string }>
  setError: (error: string | null) => void
}

export const useStore = create<GitStore>((set, get) => ({
  repoPath: null,
  isLoading: false,
  error: null,
  commits: [],
  branches: [],
  remotes: [],
  stagedFiles: [],
  unstagedFiles: [],
  currentBranch: '',

  openRepository: async (path: string) => {
    set({ isLoading: true, error: null })

    try {
      const isRepo = await window.gitApi.isRepo(path)
      if (!isRepo) {
        set({ error: 'Not a valid Git repository', isLoading: false })
        return
      }

      set({ repoPath: path })
      await get().refresh()
    } catch (err) {
      set({ error: String(err), isLoading: false })
    }
  },

  refresh: async () => {
    const { repoPath } = get()
    if (!repoPath) return

    set({ isLoading: true })

    try {
      const [commits, branches, remotes, status, currentBranch] = await Promise.all([
        git.getCommits(repoPath),
        git.getBranches(repoPath),
        git.getRemotes(repoPath),
        git.getStatus(repoPath),
        git.getCurrentBranch(repoPath),
      ])

      const stagedFiles = status.filter(f => f.staged)
      const unstagedFiles = status.filter(f => !f.staged)

      set({
        commits,
        branches,
        remotes,
        stagedFiles,
        unstagedFiles,
        currentBranch,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      set({ error: String(err), isLoading: false })
    }
  },

  stageFile: async (path: string) => {
    const { repoPath, refresh } = get()
    if (!repoPath) return
    await git.stageFile(repoPath, path)
    await refresh()
  },

  unstageFile: async (path: string) => {
    const { repoPath, refresh } = get()
    if (!repoPath) return
    await git.unstageFile(repoPath, path)
    await refresh()
  },

  stageAll: async () => {
    const { repoPath, refresh } = get()
    if (!repoPath) return
    await git.stageAll(repoPath)
    await refresh()
  },

  unstageAll: async () => {
    const { repoPath, refresh } = get()
    if (!repoPath) return
    await git.unstageAll(repoPath)
    await refresh()
  },

  commit: async (message: string) => {
    const { repoPath, refresh } = get()
    if (!repoPath) return { success: false, error: 'No repository open' }
    const result = await git.commit(repoPath, message)
    if (result.success) await refresh()
    return result
  },

  push: async () => {
    const { repoPath, refresh } = get()
    if (!repoPath) return { success: false, error: 'No repository open' }
    const result = await git.push(repoPath)
    if (result.success) await refresh()
    return result
  },

  pull: async () => {
    const { repoPath, refresh } = get()
    if (!repoPath) return { success: false, error: 'No repository open' }
    const result = await git.pull(repoPath)
    if (result.success) await refresh()
    return result
  },

  checkoutBranch: async (branchName: string) => {
    const { repoPath, refresh } = get()
    if (!repoPath) return { success: false, error: 'No repository open' }
    const result = await git.checkoutBranch(repoPath, branchName)
    if (result.success) await refresh()
    return result
  },

  setError: (error: string | null) => set({ error }),
}))
