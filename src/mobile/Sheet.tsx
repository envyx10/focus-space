import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '../i18n'
import Icon from '../lib/Icon'

type Props = {
  open: boolean
  onClose: () => void
  /** Visible title; also the dialog's accessible name. */
  title: string
  /** Small accent label over the title ("01", a status). */
  kicker?: ReactNode
  /** Extra buttons in the header, left of Close. */
  actions?: ReactNode
  /** Takes the whole height (task detail) instead of fitting its content. */
  full?: boolean
  children: ReactNode
}

const EXIT_MS = 380
// Dismiss when dragged past this share of the sheet's height, or flicked faster than this (px/ms).
const DISTANCE = 0.3
const VELOCITY = 0.5

/**
 * Bottom sheet: slides up over the shell, dims what is behind and makes it inert. Drag the handle or the header down
 * to dismiss (finger-tracked, with a flick), tap the backdrop, press Close or Escape.
 * Drawn inside .m-app, which follows the visible viewport, so the keyboard pushes the sheet up instead of covering it.
 */
export default function Sheet({ open, onClose, title, kicker, actions, full = false, children }: Props) {
  const t = useT()
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; t: number; dy: number } | null>(null)
  const close = useRef(onClose)
  close.current = onClose
  const titleId = useId()

  useEffect(() => {
    if (open) {
      setMounted(true)
      // two frames: the panel must be painted off-screen once before it can slide in
      let b = 0
      const a = requestAnimationFrame(() => (b = requestAnimationFrame(() => setShown(true))))
      return () => {
        cancelAnimationFrame(a)
        cancelAnimationFrame(b)
      }
    }
    setShown(false)
    const id = setTimeout(() => setMounted(false), EXIT_MS)
    return () => clearTimeout(id)
  }, [open])

  // Focus in, everything behind inert, focus back where it was on close.
  useEffect(() => {
    if (!mounted || !open) return
    const prev = document.activeElement as HTMLElement | null
    const host = root.current?.parentElement
    const behind = [...(host?.children ?? [])].filter((el): el is HTMLElement => el instanceof HTMLElement && el !== root.current && !el.inert && !el.classList.contains('m-sheet-root'))
    behind.forEach((el) => (el.inert = true))
    // A form sheet starts in its field ([data-autofocus]); anything else takes the focus on the sheet itself.
    const first = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current
    first?.focus({ preventScroll: true })
    return () => {
      behind.forEach((el) => (el.inert = false))
      // The opener may be gone (a deleted or completed task): then the current tab keeps the focus.
      // (WebKit doesn't focus a tapped button, so the opener can also be <body>.)
      const back = prev && prev !== document.body && prev.isConnected ? prev : document.querySelector<HTMLElement>('.m-tab[aria-current="page"]')
      back?.focus?.({ preventScroll: true })
    }
  }, [mounted, open])

  if (!mounted) return null
  const host = document.querySelector('.m-app') ?? document.body

  const grab = {
    onPointerDown: (e: ReactPointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input, textarea')) return
      drag.current = { y: e.clientY, t: performance.now(), dy: 0 }
      e.currentTarget.setPointerCapture(e.pointerId)
      panel.current?.classList.add('is-dragging')
    },
    onPointerMove: (e: ReactPointerEvent) => {
      const d = drag.current
      if (!d || !panel.current) return
      const raw = e.clientY - d.y
      // past the top it resists, like a rubber band
      d.dy = raw > 0 ? raw : raw * 0.15
      panel.current.style.transform = `translateY(${d.dy}px)`
    },
    onPointerUp: () => {
      const d = drag.current
      drag.current = null
      const el = panel.current
      if (!d || !el) return
      el.classList.remove('is-dragging')
      const v = d.dy / Math.max(1, performance.now() - d.t)
      el.style.transform = ''
      if (d.dy > el.offsetHeight * DISTANCE || (d.dy > 24 && v > VELOCITY)) close.current()
    },
    onPointerCancel: () => {
      drag.current = null
      panel.current?.classList.remove('is-dragging')
      if (panel.current) panel.current.style.transform = ''
    },
  }

  return createPortal(
    <div ref={root} className={`m-sheet-root${shown ? ' is-shown' : ''}`}>
      <div className="m-sheet-backdrop" onClick={() => close.current()} aria-hidden />
      <div
        ref={panel}
        className={`m-sheet${full ? ' is-full' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            close.current()
          }
        }}
      >
        <div className="m-sheet-grab" {...grab}>
          <span className="m-sheet-handle" aria-hidden />
          <header className="m-sheet-head">
            <div className="m-sheet-titles">
              {kicker && <div className="m-sheet-kicker">{kicker}</div>}
              <h2 id={titleId}>{title}</h2>
            </div>
            <div className="m-sheet-actions">
              {actions}
              <button className="m-icon-btn" onClick={() => close.current()} aria-label={t('m.close')}>
                <Icon name="close" />
              </button>
            </div>
          </header>
        </div>
        <div className="m-sheet-body">{children}</div>
      </div>
    </div>,
    host,
  )
}
