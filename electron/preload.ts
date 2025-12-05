import { contextBridge, ipcRenderer } from 'electron'

export interface GitResult {
  stdout: string
  stderr: string
  code: number
}

contextBridge.exposeInMainWorld('gitApi', {
  execute: (repoPath: string, args: string[]): Promise<GitResult> =>
    ipcRenderer.invoke('git:execute', repoPath, args),

  openFolderDialog: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:openFolder'),

  isRepo: (path: string): Promise<boolean> =>
    ipcRenderer.invoke('git:isRepo', path),
})
