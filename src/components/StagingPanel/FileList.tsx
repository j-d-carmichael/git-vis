import { useStore } from '../../store/useStore'
import type { FileStatus } from '../../types/git'

interface FileListProps {
  files: FileStatus[]
  type: 'staged' | 'unstaged'
}

const STATUS_CONFIG: Record<FileStatus['status'], { color: string; bg: string; label: string }> = {
  modified: { color: 'text-gv-warning', bg: 'bg-gv-warning/20', label: 'M' },
  added: { color: 'text-gv-success', bg: 'bg-gv-success/20', label: 'A' },
  deleted: { color: 'text-gv-danger', bg: 'bg-gv-danger/20', label: 'D' },
  renamed: { color: 'text-gv-branch-2', bg: 'bg-gv-branch-2/20', label: 'R' },
  untracked: { color: 'text-gv-text-muted', bg: 'bg-gv-text-muted/20', label: '?' },
}

export function FileList({ files, type }: FileListProps) {
  const stageFile = useStore((state) => state.stageFile)
  const unstageFile = useStore((state) => state.unstageFile)

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gv-text-muted">
        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-xs">No {type} files</span>
      </div>
    )
  }

  const handleAction = (path: string) => {
    if (type === 'unstaged') {
      stageFile(path)
    } else {
      unstageFile(path)
    }
  }

  return (
    <div className="space-y-1">
      {files.map((file) => {
        const fileName = file.path.split('/').pop() || file.path
        const directory = file.path.includes('/')
          ? file.path.substring(0, file.path.lastIndexOf('/'))
          : ''
        const config = STATUS_CONFIG[file.status]

        return (
          <div
            key={file.path}
            className="group flex items-center gap-2 px-3 py-2 hover:bg-gv-bg-hover transition-colors cursor-pointer border-l-2 border-transparent hover:border-gv-accent rounded-r"
            onClick={() => handleAction(file.path)}
          >
            {/* Status indicator */}
            <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded ${config.color} ${config.bg}`}>
              {config.label}
            </span>

            {/* File icon */}
            <svg className="w-4 h-4 text-gv-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-gv-text truncate" title={file.path}>
                {fileName}
              </div>
              {directory && (
                <div className="text-[11px] text-gv-text-muted truncate">
                  {directory}
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              className={`opacity-0 group-hover:opacity-100 px-2.5 py-1 text-[11px] font-medium rounded transition-all ${
                type === 'unstaged'
                  ? 'bg-gv-success/20 text-gv-success hover:bg-gv-success hover:text-white'
                  : 'bg-gv-danger/20 text-gv-danger hover:bg-gv-danger hover:text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleAction(file.path)
              }}
            >
              {type === 'unstaged' ? 'Stage' : 'Unstage'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
