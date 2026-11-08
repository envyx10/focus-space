import { useRef } from 'react'

/** Keeps the gesture on this element even if the finger slides off it. A pointer that is already gone throws: ignore. */
const capture = (el: Element, id: number) => {
  try {
    el.setPointerCapture(id)
  } catch {
    // the pointer ended before the gesture locked
  }
}

type Props = {
  /** 0..1 */
  value: number
  onChange: (v: number) => void
  label: string
  valueText?: string
  /** Light track on the accent card (the radio). */
  onAccent?: boolean
  disabled?: boolean
}

// When the page last scrolled. A tap right after a fling only meant to stop it: it must not set a volume.
let lastScroll = 0
if (typeof window !== 'undefined') addEventListener('scroll', () => (lastScroll = performance.now()), { capture: true, passive: true })
const SETTLE_MS = 250

const STEP = 0.05
const LOCK_PX = 6
const round = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 100) / 100

/**
 * A horizontal slider for fingers, inside lists that scroll vertically.
 * touch-action: pan-y leaves vertical panning to the browser; the first few pixels decide the axis: sideways takes the
 * slider (it follows the finger), up or down is a scroll and the value never moves. A tap jumps to that point
 * (WCAG 2.5.7: no drag required), except right after a scroll, when the tap only meant to stop the list.
 * Keyboard: arrows, Home, End.
 */
export default function Slider({ value, onChange, label, valueText, onAccent = false, disabled = false }: Props) {
  const g = useRef<{ x: number; y: number; id: number; locked: boolean; settled?: boolean } | null>(null)
  const pct = Math.round(value * 100)

  const at = (el: HTMLElement, x: number) => {
    const r = el.getBoundingClientRect()
    return round((x - r.left) / (r.width || 1))
  }

  return (
    <div
      className={`m-slider${onAccent ? ' on-accent' : ''}${disabled ? ' is-disabled' : ''}`}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      style={{ ['--v' as string]: `${pct}%` }}
      onKeyDown={(e) => {
        if (disabled) return
        const k = e.key
        const next = k === 'ArrowRight' || k === 'ArrowUp' ? value + STEP : k === 'ArrowLeft' || k === 'ArrowDown' ? value - STEP : k === 'Home' ? 0 : k === 'End' ? 1 : null
        if (next === null) return
        e.preventDefault()
        onChange(round(next))
      }}
      onPointerDown={(e) => {
        if (disabled) return
        // a mouse or pen is precise: it may jump straight to where it pressed
        if (e.pointerType === 'mouse') {
          capture(e.currentTarget, e.pointerId)
          g.current = { x: e.clientX, y: e.clientY, id: e.pointerId, locked: true }
          onChange(at(e.currentTarget, e.clientX))
          return
        }
        g.current = { x: e.clientX, y: e.clientY, id: e.pointerId, locked: false, settled: performance.now() - lastScroll > SETTLE_MS }
      }}
      onPointerMove={(e) => {
        const s = g.current
        if (!s || s.id !== e.pointerId) return
        if (!s.locked) {
          const dx = Math.abs(e.clientX - s.x)
          const dy = Math.abs(e.clientY - s.y)
          if (dy > LOCK_PX && dy > dx) return void (g.current = null) // a scroll: let it go
          if (dx < LOCK_PX) return
          s.locked = true
          capture(e.currentTarget, e.pointerId)
          e.currentTarget.classList.add('is-active')
        }
        onChange(at(e.currentTarget, e.clientX))
      }}
      onPointerUp={(e) => {
        const s = g.current
        g.current = null
        e.currentTarget.classList.remove('is-active')
        // a tap: no axis was ever locked and the finger barely moved
        if (s && !s.locked && s.settled && Math.abs(e.clientX - s.x) < LOCK_PX && Math.abs(e.clientY - s.y) < LOCK_PX) onChange(at(e.currentTarget, e.clientX))
      }}
      onPointerCancel={(e) => {
        g.current = null
        e.currentTarget.classList.remove('is-active')
      }}
    >
      <span className="m-slider-track" aria-hidden>
        <span className="m-slider-fill" />
        <span className="m-slider-thumb" />
      </span>
    </div>
  )
}
