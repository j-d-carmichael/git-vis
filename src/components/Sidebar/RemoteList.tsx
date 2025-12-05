import { useState } from 'react'
import { useStore } from '../../store/useStore'

export function RemoteList() {
  const remotes = useStore((state) => state.remotes)
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border-t border-gv-border flex-shrink-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-5 py-3.5 text-xs font-semibold text-gv-text-muted hover:bg-gv-bg-hover transition-colors uppercase tracking-wide border-b border-gv-border/50"
      >
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <svg className="w-4 h-4 text-gv-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
        Remotes
        <span className="ml-auto text-gv-text-secondary">{remotes.length}</span>
      </button>

      {expanded && (
        <div className="py-2 px-3">
          {remotes.map((remote) => (
            <div
              key={remote.name}
              className="px-3 py-2 text-sm hover:bg-gv-bg-hover rounded transition-colors"
            >
              <div className="flex items-center gap-2 text-gv-text">
                <svg className="w-4 h-4 text-gv-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="font-medium">{remote.name}</span>
              </div>
              <div className="ml-6 text-[11px] text-gv-text-muted truncate mt-0.5" title={remote.fetchUrl}>
                {remote.fetchUrl}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
