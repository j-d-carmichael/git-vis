import { useStore } from '../../store/useStore'

export function Header() {
  const repoPath = useStore((state) => state.repoPath)
  const currentBranch = useStore((state) => state.currentBranch)
  const refresh = useStore((state) => state.refresh)
  const pull = useStore((state) => state.pull)
  const push = useStore((state) => state.push)
  const isLoading = useStore((state) => state.isLoading)

  const repoName = repoPath?.split('/').pop() || 'Repository'

  const handlePull = async () => {
    const result = await pull()
    if (!result.success) {
      alert(`Pull failed: ${result.error}`)
    }
  }

  const handlePush = async () => {
    const result = await push()
    if (!result.success) {
      alert(`Push failed: ${result.error}`)
    }
  }

  return (
    <header className="h-11 bg-gv-bg-tertiary border-b border-gv-border flex items-center px-4 gap-3 no-select">
      {/* Repository name */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-gv-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span className="font-semibold text-gv-text text-sm">{repoName}</span>
      </div>

      <div className="w-px h-5 bg-gv-border" />

      {/* Current branch */}
      <div className="flex items-center gap-2 px-2.5 py-1 bg-gv-accent/10 rounded border border-gv-accent/30">
        <svg className="w-4 h-4 text-gv-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-sm font-medium text-gv-accent">{currentBranch}</span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handlePull}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gv-text bg-gv-bg-secondary hover:bg-gv-bg-hover border border-gv-border rounded transition-colors disabled:opacity-50"
          title="Pull"
        >
          <svg className="w-3.5 h-3.5 text-gv-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          Pull
        </button>

        <button
          onClick={handlePush}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gv-text bg-gv-bg-secondary hover:bg-gv-bg-hover border border-gv-border rounded transition-colors disabled:opacity-50"
          title="Push"
        >
          <svg className="w-3.5 h-3.5 text-gv-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Push
        </button>

        <div className="w-px h-5 bg-gv-border mx-1" />

        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center justify-center w-8 h-8 text-gv-text-muted hover:text-gv-text hover:bg-gv-bg-hover rounded transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>
  )
}
