import { useState, useMemo, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { useResizable } from '../../hooks/useResizable'
import type { Branch } from '../../types/git'

interface TreeNode {
  name: string
  fullPath: string
  isFolder: boolean
  isCurrent?: boolean
  children: Map<string, TreeNode>
}

function buildBranchTree(branches: Branch[]): TreeNode {
  const root: TreeNode = { name: '', fullPath: '', isFolder: true, children: new Map() }
  
  for (const branch of branches) {
    const parts = branch.name.split('/')
    let current = root
    let pathSoFar = ''
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part
      const isLast = i === parts.length - 1
      
      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          fullPath: branch.name,
          isFolder: !isLast,
          isCurrent: isLast ? branch.isCurrent : undefined,
          children: new Map(),
        })
      }
      current = current.children.get(part)!
    }
  }
  return root
}

interface BranchTreeItemProps {
  node: TreeNode
  depth: number
  onCheckout: (name: string) => void
  isRemote?: boolean
}

function BranchTreeItem({ node, depth, onCheckout, isRemote }: BranchTreeItemProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.size > 0
  // Base padding of 12px, then 20px per depth level for clear hierarchy
  const paddingLeft = 12 + depth * 20

  if (node.isFolder && hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 py-1.5 text-sm text-gv-text-muted hover:bg-gv-bg-hover hover:text-gv-text transition-colors"
          style={{ paddingLeft }}
        >
          <svg
            className={`w-3 h-3 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <svg className="w-4 h-4 text-gv-warning flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <span className="truncate">{node.name}</span>
        </button>
        {expanded && (
          <div className="relative">
            {/* Tree line */}
            <div 
              className="absolute top-0 bottom-2 w-px bg-gv-border"
              style={{ left: paddingLeft + 6 }}
            />
            {Array.from(node.children.values()).map((child) => (
              <BranchTreeItem
                key={child.name}
                node={child}
                depth={depth + 1}
                onCheckout={onCheckout}
                isRemote={isRemote}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Leaf node (actual branch)
  return (
    <button
      onClick={() => !isRemote && onCheckout(node.fullPath)}
      className={`w-full flex items-center gap-2 py-1.5 text-sm transition-colors ${
        node.isCurrent
          ? 'text-gv-accent bg-gv-accent/10'
          : isRemote
          ? 'text-gv-text-muted hover:bg-gv-bg-hover hover:text-gv-text'
          : 'text-gv-text hover:bg-gv-bg-hover'
      }`}
      style={{ paddingLeft }}
    >
      <svg
        className={`w-4 h-4 flex-shrink-0 ${node.isCurrent ? 'text-gv-accent' : isRemote ? 'text-gv-remote' : 'text-gv-branch-4'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span className="truncate">{node.name}</span>
      {node.isCurrent && (
        <span className="ml-auto mr-2 px-1.5 py-0.5 text-[10px] font-medium bg-gv-accent text-white rounded">HEAD</span>
      )}
    </button>
  )
}

export function BranchList() {
  const branches = useStore((state) => state.branches)
  const checkoutBranch = useStore((state) => state.checkoutBranch)
  const [localExpanded, setLocalExpanded] = useState(true)
  const [remoteExpanded, setRemoteExpanded] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const { size: localSize, dividerProps } = useResizable({
    direction: 'vertical',
    initialSize: 50,
    minSize: 60,
    containerRef,
  })

  const localBranches = branches.filter((b) => !b.isRemote)
  const remoteBranches = branches.filter((b) => b.isRemote)

  const localTree = useMemo(() => buildBranchTree(localBranches), [localBranches])
  const remoteTree = useMemo(() => buildBranchTree(remoteBranches), [remoteBranches])

  const handleCheckout = async (branchName: string) => {
    const result = await checkoutBranch(branchName)
    if (!result.success) {
      alert(`Checkout failed: ${result.error}`)
    }
  }

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
      {/* Local branches */}
      <div className="flex flex-col overflow-hidden" style={{ height: `${localSize}%` }}>
        <button
          onClick={() => setLocalExpanded(!localExpanded)}
          className="w-full flex items-center gap-2 px-5 py-3.5 text-xs font-semibold text-gv-text-muted hover:bg-gv-bg-hover transition-colors uppercase tracking-wide flex-shrink-0 border-b border-gv-border/50"
        >
          <svg
            className={`w-3 h-3 transition-transform ${localExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <svg className="w-4 h-4 text-gv-branch-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Local
          <span className="ml-auto text-gv-text-secondary">{localBranches.length}</span>
        </button>

        {localExpanded && (
          <div className="flex-1 overflow-y-auto py-3 px-3">
            {Array.from(localTree.children.values()).map((node) => (
              <BranchTreeItem
                key={node.name}
                node={node}
                depth={0}
                onCheckout={handleCheckout}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resizable divider */}
      <div {...dividerProps} />

      {/* Remote branches */}
      <div className="flex flex-col overflow-hidden" style={{ height: `${100 - localSize}%` }}>
        <button
          onClick={() => setRemoteExpanded(!remoteExpanded)}
          className="w-full flex items-center gap-2 px-5 py-3.5 text-xs font-semibold text-gv-text-muted hover:bg-gv-bg-hover transition-colors uppercase tracking-wide flex-shrink-0 border-b border-gv-border/50"
        >
          <svg
            className={`w-3 h-3 transition-transform ${remoteExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <svg className="w-4 h-4 text-gv-remote" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          Remote
          <span className="ml-auto text-gv-text-secondary">{remoteBranches.length}</span>
        </button>

        {remoteExpanded && (
          <div className="flex-1 overflow-y-auto py-3 px-3">
            {Array.from(remoteTree.children.values()).map((node) => (
              <BranchTreeItem
                key={node.name}
                node={node}
                depth={0}
                onCheckout={handleCheckout}
                isRemote
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
