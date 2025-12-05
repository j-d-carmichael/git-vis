import { useStore } from '../../store/useStore'
import { CommitRow } from './CommitRow'
import { GraphCanvas } from './GraphCanvas'

export function CommitGraph() {
  const commits = useStore((state) => state.commits)
  const isLoading = useStore((state) => state.isLoading)

  if (isLoading && commits.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gv-bg">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-gv-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-gv-text-muted">Loading commits...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gv-bg">
      {/* Header */}
      <div className="flex items-center h-8 px-2 border-b border-gv-border bg-gv-bg-tertiary text-[11px] font-semibold text-gv-text-muted uppercase tracking-wider no-select">
        <div className="w-32 pl-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Graph
        </div>
        <div className="flex-1">Commit Message</div>
        <div className="w-40 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Author
        </div>
        <div className="w-32 pr-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Date / Time
        </div>
      </div>

      {/* Commit list */}
      <div className="flex-1 overflow-y-auto relative">
        {/* SVG graph overlay */}
        <GraphCanvas commits={commits} />

        {/* Commit rows */}
        <div className="relative">
          {commits.map((commit, index) => (
            <CommitRow key={commit.hash} commit={commit} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
