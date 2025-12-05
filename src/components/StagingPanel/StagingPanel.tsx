import { useState, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { FileList } from './FileList'
import { useResizable } from '../../hooks/useResizable'

export function StagingPanel() {
  const stagedFiles = useStore((state) => state.stagedFiles)
  const unstagedFiles = useStore((state) => state.unstagedFiles)
  const stageAll = useStore((state) => state.stageAll)
  const unstageAll = useStore((state) => state.unstageAll)
  const commit = useStore((state) => state.commit)
  const currentBranch = useStore((state) => state.currentBranch)

  const [commitMessage, setCommitMessage] = useState('')
  const [isCommitting, setIsCommitting] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const { size: unstagedSize, dividerProps } = useResizable({
    direction: 'vertical',
    initialSize: 50,
    minSize: 80,
    containerRef,
  })

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      alert('Please enter a commit message')
      return
    }

    setIsCommitting(true)
    const result = await commit(commitMessage)
    setIsCommitting(false)

    if (result.success) {
      setCommitMessage('')
    } else {
      alert(`Commit failed: ${result.error}`)
    }
  }

  const totalChanges = stagedFiles.length + unstagedFiles.length

  return (
    <aside className="w-80 bg-gv-bg-secondary border-l border-gv-border flex flex-col overflow-hidden no-select">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gv-border bg-gv-bg-tertiary flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gv-text-muted">{totalChanges} file changes on</span>
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-gv-accent/20 text-gv-accent border border-gv-accent/30">
            {currentBranch}
          </span>
        </div>
      </div>

      {/* Resizable file sections */}
      <div ref={containerRef} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Unstaged files */}
        <div 
          className="flex flex-col min-h-0 overflow-hidden"
          style={{ height: `${unstagedSize}%` }}
        >
          <div className="flex items-center justify-between px-5 py-3.5 bg-gv-bg-tertiary/50 flex-shrink-0 border-b border-gv-border/50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gv-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs font-semibold text-gv-text uppercase tracking-wide">
                Unstaged Files
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gv-warning/20 text-gv-warning">
                {unstagedFiles.length}
              </span>
            </div>
            {unstagedFiles.length > 0 && (
              <button
                onClick={stageAll}
                className="px-2.5 py-1 text-[11px] font-medium rounded bg-gv-success text-white hover:bg-gv-success/80 transition-colors"
              >
                Stage All
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto bg-gv-bg/30 py-3 px-3">
            <FileList files={unstagedFiles} type="unstaged" />
          </div>
        </div>

        {/* Resizable divider */}
        <div {...dividerProps} />

        {/* Staged files */}
        <div 
          className="flex flex-col min-h-0 overflow-hidden"
          style={{ height: `${100 - unstagedSize}%` }}
        >
          <div className="flex items-center justify-between px-5 py-3.5 bg-gv-bg-tertiary/50 flex-shrink-0 border-b border-gv-border/50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gv-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold text-gv-text uppercase tracking-wide">
                Staged Files
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gv-success/20 text-gv-success">
                {stagedFiles.length}
              </span>
            </div>
            {stagedFiles.length > 0 && (
              <button
                onClick={unstageAll}
                className="px-2.5 py-1 text-[11px] font-medium rounded bg-gv-danger-muted text-white hover:bg-gv-danger transition-colors"
              >
                Unstage All
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto bg-gv-bg/30 py-3 px-3">
            <FileList files={stagedFiles} type="staged" />
          </div>
        </div>
      </div>

      {/* Commit section */}
      <div className="border-t-2 border-gv-border p-4 space-y-3 bg-gv-bg-tertiary flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-gv-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-xs font-semibold text-gv-text uppercase tracking-wide">Commit</span>
        </div>
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Type a message to commit..."
          className="w-full h-20 px-3 py-2.5 bg-gv-bg border border-gv-border rounded-md text-sm text-gv-text placeholder-gv-text-muted resize-none focus:outline-none focus:border-gv-accent focus:ring-1 focus:ring-gv-accent/50"
        />
        <button
          onClick={handleCommit}
          disabled={isCommitting || stagedFiles.length === 0 || !commitMessage.trim()}
          className="w-full py-2.5 bg-gv-success hover:bg-gv-success/90 text-white rounded-md font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gv-text-muted flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isCommitting ? 'Committing...' : `Commit ${stagedFiles.length} file${stagedFiles.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </aside>
  )
}
