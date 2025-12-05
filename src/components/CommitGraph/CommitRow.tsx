import type { Commit } from '../../types/git'

const ROW_HEIGHT = 36

// Generate a consistent color based on author name
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-red-500',
]

function getAuthorColor(author: string): string {
  let hash = 0
  for (let i = 0; i < author.length; i++) {
    hash = author.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(author: string): string {
  const parts = author.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return author.slice(0, 2).toUpperCase()
}

interface CommitRowProps {
  commit: Commit
  index: number
}

export function CommitRow({ commit, index }: CommitRowProps) {
  const date = new Date(commit.timestamp * 1000)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Parse refs to identify branches and tags
  const localBranches = commit.refs.filter(
    (ref) => !ref.startsWith('tag:') && ref !== 'HEAD' && !ref.startsWith('origin/')
  )
  const remoteBranches = commit.refs.filter(
    (ref) => ref.startsWith('origin/')
  )
  const isHead = commit.refs.some((ref) => ref.includes('HEAD'))

  const initials = getInitials(commit.author)
  const avatarColor = getAuthorColor(commit.author)

  return (
    <div
      className="flex items-center px-2 hover:bg-gv-bg-hover transition-colors cursor-pointer group"
      style={{ height: ROW_HEIGHT }}
    >
      {/* Graph space - left empty for SVG overlay */}
      <div className="w-32 flex-shrink-0" />

      {/* Commit message and refs */}
      <div className="flex-1 flex items-center gap-1.5 min-w-0 pr-2">
        {/* Branch/ref badges */}
        {localBranches.slice(0, 1).map((ref) => (
          <span
            key={ref}
            className="flex-shrink-0 px-2 py-0.5 text-[11px] font-medium rounded-sm bg-gv-branch-4/20 text-gv-branch-4 border border-gv-branch-4/30"
            title={ref}
          >
            {ref}
          </span>
        ))}
        {remoteBranches.slice(0, 1).map((ref) => (
          <span
            key={ref}
            className="flex-shrink-0 px-2 py-0.5 text-[11px] font-medium rounded-sm bg-gv-remote/20 text-gv-remote border border-gv-remote/30"
            title={ref}
          >
            {ref.replace('origin/', '')}
          </span>
        ))}
        {(localBranches.length + remoteBranches.length) > 2 && (
          <span className="flex-shrink-0 text-[11px] text-gv-text-muted">
            +{localBranches.length + remoteBranches.length - 2}
          </span>
        )}

        {/* HEAD indicator */}
        {isHead && (
          <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-gv-head/20 text-gv-head border border-gv-head/30">
            HEAD
          </span>
        )}

        {/* Commit message */}
        <span className="text-[13px] text-gv-text truncate ml-1" title={commit.message}>
          {commit.message}
        </span>
      </div>

      {/* Author with avatar */}
      <div className="w-40 flex-shrink-0 flex items-center gap-2 pr-2">
        <div
          className={`w-6 h-6 rounded-full ${avatarColor} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
          title={commit.author}
        >
          {initials}
        </div>
        <span className="text-[13px] text-gv-text-muted truncate">
          {commit.author.split(' ')[0]}
        </span>
      </div>

      {/* Date */}
      <div className="w-32 flex-shrink-0 text-[12px] text-gv-text-muted text-right pr-2">
        {formattedDate}
      </div>
    </div>
  )
}

export { ROW_HEIGHT }
