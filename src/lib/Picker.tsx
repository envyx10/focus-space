import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import './picker.css'

export type PickerOption<T extends string> = { id: T; label: string }

type Props<T extends string> = {
  value: T
  options: PickerOption<T>[]
  onChange: (id: T) => void
  /** Accessible name of the trigger. */
  label: string
  /** Which way the list opens: up for things near the bottom of the screen. */
  placement?: 'up' | 'down'
  className?: string
}

const ROWS = 7

/**
 * A listbox styled with the app's tokens, in place of the native <select>, whose open list the browser draws in its
 * own (unthemeable) style. Fixed positioning so scrolling or clipped parents (the mixer scrolls sideways) don't cut it.
 */
export default function Picker<T extends string>({ value, options, onChange, label, placement = 'down', className = '' }: Props<T>) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState<CSSProperties>({})
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const id = useId()
  const rows = Math.min(ROWS, options.length)
  const current = options.find((o) => o.id === value)

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) trigger.current?.focus()
  }
  const pick = (i: number) => {
    if (options[i].id !== value) onChange(options[i].id)
    close()
  }

  useLayoutEffect(() => {
    if (!open || !trigger.current) return
    const r = trigger.current.getBoundingClientRect()
    const w = list.current?.offsetWidth ?? 0
    const h = (list.current?.offsetHeight ?? 0) + 12
    const left = Math.max(8, Math.min(r.left, innerWidth - w - 8))
    // Flip when the preferred side has no room.
    const up = placement === 'up' ? r.top >= h || r.top > innerHeight - r.bottom : innerHeight - r.bottom < h && r.top > innerHeight - r.bottom
    setPos(up ? { left, bottom: innerHeight - r.top + 6 } : { left, top: r.bottom + 6 })
    list.current?.focus()
  }, [open, placement])

  useEffect(() => {
    if (!open) return
    const outside = (e: PointerEvent) => {
      const t = e.target as Node
      if (!list.current?.contains(t) && !trigger.current?.contains(t)) close(false)
    }
    // The list is placed against the trigger once; if the page moves, it would float away.
    const away = (e: Event) => !list.current?.contains(e.target as Node) && close(false)
    addEventListener('pointerdown', outside)
    addEventListener('scroll', away, true)
    addEventListener('resize', away)
    return () => {
      removeEventListener('pointerdown', outside)
      removeEventListener('scroll', away, true)
      removeEventListener('resize', away)
    }
  }, [open])

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.id === value)))
    setOpen(true)
  }

  const onListKey = (e: KeyboardEvent) => {
    const last = options.length - 1
    const move: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rows, ArrowLeft: -rows }
    if (e.key in move) setActive((a) => Math.min(last, Math.max(0, a + move[e.key])))
    else if (e.key === 'Home') setActive(0)
    else if (e.key === 'End') setActive(last)
    else if (e.key === 'Enter' || e.key === ' ') pick(active)
    else if (e.key === 'Escape' || e.key === 'Tab') close(e.key === 'Escape')
    else if (e.key.length === 1) {
      // Type-ahead: jump to the next option starting with that letter.
      const k = e.key.toLowerCase()
      const n = options.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(k))
      const i = n !== -1 ? n : options.findIndex((o) => o.label.toLowerCase().startsWith(k))
      if (i !== -1) setActive(i)
      else return
    } else return
    e.preventDefault()
    e.stopPropagation() // Escape and Space must not reach the app shortcuts
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={`pk-trigger ${className}`}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            openList()
          }
        }}
      >
        <span className="pk-value">{current?.label ?? value}</span>
        <svg className="pk-chevron" viewBox="0 0 16 16" aria-hidden="true">
          <path d={open === (placement === 'down') ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'} />
        </svg>
      </button>
      {open && (
        <div
          ref={list}
          id={id}
          className={`pk-list pk-${placement}`}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${id}-${active}`}
          tabIndex={-1}
          style={{ ...pos, ['--rows' as string]: rows }}
          onKeyDown={onListKey}
        >
          {options.map((o, i) => (
            <div
              key={o.id}
              id={`${id}-${i}`}
              role="option"
              aria-selected={o.id === value}
              className={`pk-opt${i === active ? ' is-active' : ''}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
