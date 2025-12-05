import { useMemo } from 'react'
import type { Commit } from '../../types/git'
import { ROW_HEIGHT } from './CommitRow'

const LANE_WIDTH = 16
const NODE_RADIUS = 5
const GRAPH_PADDING = 12

// Colors for different lanes
const LANE_COLORS = [
  '#22d3ee', // cyan
  '#a78bfa', // purple
  '#fb923c', // orange
  '#4ade80', // green
  '#f472b6', // pink
  '#facc15', // yellow
  '#60a5fa', // blue
  '#f87171', // red
]

interface GraphCanvasProps {
  commits: Commit[]
}

interface GraphLine {
  fromX: number
  fromY: number
  toX: number
  toY: number
  color: string
  isMerge: boolean
}

export function GraphCanvas({ commits }: GraphCanvasProps) {
  const { lines, nodes, maxLane } = useMemo(() => {
    const commitMap = new Map<string, { index: number; commit: Commit }>()
    commits.forEach((commit, index) => {
      commitMap.set(commit.hash, { index, commit })
    })

    const lines: GraphLine[] = []
    const nodes: { x: number; y: number; color: string; isHead: boolean }[] = []
    let maxLane = 0

    commits.forEach((commit, index) => {
      const lane = commit.lane
      maxLane = Math.max(maxLane, lane)

      const x = GRAPH_PADDING + lane * LANE_WIDTH
      const y = index * ROW_HEIGHT + ROW_HEIGHT / 2
      const color = LANE_COLORS[lane % LANE_COLORS.length]
      const isHead = commit.refs.some((ref) => ref.includes('HEAD'))

      nodes.push({ x, y, color, isHead })

      // Draw lines to parents
      commit.parents.forEach((parentHash, parentIndex) => {
        const parent = commitMap.get(parentHash)
        if (!parent) return

        const parentX = GRAPH_PADDING + parent.commit.lane * LANE_WIDTH
        const parentY = parent.index * ROW_HEIGHT + ROW_HEIGHT / 2
        const parentColor = LANE_COLORS[parent.commit.lane % LANE_COLORS.length]

        // Use parent's color for the line
        const lineColor = parentIndex === 0 ? color : parentColor

        lines.push({
          fromX: x,
          fromY: y,
          toX: parentX,
          toY: parentY,
          color: lineColor,
          isMerge: parentIndex > 0,
        })
      })
    })

    return { lines, nodes, maxLane }
  }, [commits])

  const svgWidth = GRAPH_PADDING * 2 + (maxLane + 1) * LANE_WIDTH
  const svgHeight = commits.length * ROW_HEIGHT

  return (
    <svg
      className="absolute top-0 left-4 pointer-events-none"
      width={svgWidth}
      height={svgHeight}
      style={{ minWidth: svgWidth }}
    >
      {/* Draw lines first (behind nodes) */}
      {lines.map((line, i) => {
        // For merge commits or lane changes, draw a curved path
        if (line.fromX !== line.toX) {
          const midY = (line.fromY + line.toY) / 2
          const path = `M ${line.fromX} ${line.fromY} C ${line.fromX} ${midY}, ${line.toX} ${midY}, ${line.toX} ${line.toY}`
          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={line.color}
              strokeWidth={2}
              opacity={0.8}
            />
          )
        }
        // Straight line for same lane
        return (
          <line
            key={i}
            x1={line.fromX}
            y1={line.fromY}
            x2={line.toX}
            y2={line.toY}
            stroke={line.color}
            strokeWidth={2}
            opacity={0.8}
          />
        )
      })}

      {/* Draw nodes on top */}
      {nodes.map((node, i) => (
        <g key={i}>
          {/* Outer glow for HEAD */}
          {node.isHead && (
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_RADIUS + 3}
              fill="none"
              stroke={node.color}
              strokeWidth={2}
              opacity={0.4}
            />
          )}
          {/* Node circle */}
          <circle
            cx={node.x}
            cy={node.y}
            r={NODE_RADIUS}
            fill={node.color}
            stroke="#1a1a2e"
            strokeWidth={2}
          />
        </g>
      ))}
    </svg>
  )
}
