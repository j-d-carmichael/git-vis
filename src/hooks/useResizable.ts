import { useState, useCallback, useEffect, useRef } from 'react'

interface UseResizableOptions {
  direction: 'horizontal' | 'vertical'
  initialSize: number // percentage
  minSize?: number // pixels
  maxSize?: number // pixels
  containerRef: React.RefObject<HTMLElement | null>
}

export function useResizable({
  direction,
  initialSize,
  minSize = 50,
  maxSize,
  containerRef,
}: UseResizableOptions) {
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const startPos = useRef(0)
  const startSize = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startPos.current = direction === 'vertical' ? e.clientY : e.clientX
    startSize.current = size
  }, [direction, size])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const containerSize = direction === 'vertical' ? rect.height : rect.width

      const currentPos = direction === 'vertical' ? e.clientY : e.clientX
      const delta = currentPos - startPos.current
      const deltaPercent = (delta / containerSize) * 100

      let newSize = startSize.current + deltaPercent

      // Apply min/max constraints
      const minPercent = (minSize / containerSize) * 100
      const maxPercent = maxSize ? (maxSize / containerSize) * 100 : 100 - minPercent

      newSize = Math.max(minPercent, Math.min(maxPercent, newSize))
      setSize(newSize)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, direction, minSize, maxSize, containerRef])

  return {
    size,
    isDragging,
    handleMouseDown,
    dividerProps: {
      onMouseDown: handleMouseDown,
      className: `
        ${direction === 'vertical' ? 'h-1.5 cursor-row-resize w-full' : 'w-1.5 cursor-col-resize h-full'}
        bg-gv-border hover:bg-gv-accent/50 active:bg-gv-accent transition-colors flex-shrink-0
        ${isDragging ? 'bg-gv-accent' : ''}
      `,
    },
  }
}
