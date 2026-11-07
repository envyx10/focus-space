import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

type Drag = {
  id: string
  from: number
  to: number
  dy: number
  startY: number
  /** Where each sortable row was when the drag started, measured once so moving rows never shift the maths. */
  tops: number[]
  heights: number[]
}

/** The index the dragged row would land on: how many of the other rows have their middle above its middle. */
export function dropIndex(tops: number[], heights: number[], from: number, dy: number): number {
  const mid = tops[from] + heights[from] / 2 + dy
  let to = 0
  for (let i = 0; i < tops.length; i++) if (i !== from && tops[i] + heights[i] / 2 < mid) to++
  return to
}

/**
 * Reordering by dragging a handle (mouse, pen or touch) or with the arrow keys on it. Rows taking part carry
 * `data-sortable`; while dragging, the others slide aside to show where the row will land, and nothing is saved
 * until it is dropped. Escape cancels.
 */
export function useDragSort(list: () => HTMLElement | null, move: (id: string, to: number) => void) {
  const [drag, setDrag] = useState<Drag | null>(null)
  const current = useRef<Drag | null>(null)
  const update = (d: Drag | null) => {
    current.current = d
    setDrag(d)
  }

  useEffect(() => {
    if (!drag) return
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && update(null)
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [drag])

  const handle = (id: string, index: number, count: number) => ({
    'data-grip': id,
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button !== 0) return
      const rows = [...(list()?.querySelectorAll<HTMLElement>('[data-sortable]') ?? [])].map((r) => r.getBoundingClientRect())
      try {
        // Keeps the moves coming to the handle even when the pointer leaves it.
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        // pointer already gone: the drag still works while it stays over the handle
      }
      update({ id, from: index, to: index, dy: 0, startY: e.clientY, tops: rows.map((r) => r.top), heights: rows.map((r) => r.height) })
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = current.current
      if (!d || d.id !== id) return
      const dy = e.clientY - d.startY
      update({ ...d, dy, to: dropIndex(d.tops, d.heights, d.from, dy) })
    },
    onPointerUp() {
      const d = current.current
      update(null)
      if (d && d.id === id && d.to !== d.from) move(id, d.to)
    },
    onPointerCancel() {
      update(null)
    },
    onKeyDown(e: KeyboardEvent<HTMLElement>) {
      const step = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0
      if (!step) return
      e.preventDefault()
      e.stopPropagation()
      const to = index + step
      if (to < 0 || to >= count) return
      move(id, to)
      // The row is re-rendered in its new place; keep the keyboard on its handle.
      requestAnimationFrame(() => list()?.querySelector<HTMLElement>(`[data-grip="${id}"]`)?.focus())
    },
  })

  /** The offset for row `index` while something is being dragged. */
  const style = (index: number): CSSProperties | undefined => {
    if (!drag) return undefined
    if (index === drag.from) return { transform: `translateY(${drag.dy}px)` }
    const h = drag.heights[drag.from]
    if (drag.from < index && index <= drag.to) return { transform: `translateY(${-h}px)` }
    if (drag.to <= index && index < drag.from) return { transform: `translateY(${h}px)` }
    return undefined
  }

  return { dragging: drag?.id ?? null, handle, style }
}
