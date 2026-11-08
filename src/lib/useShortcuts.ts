import { useEffect, useRef } from 'react'

export type ShortcutHandlers = {
  /** Space on something that isn't a control. */
  toggleTimer: () => void
  newTask: () => void
  mute: () => void
  calm: () => void
  immersive: () => void
  settings: () => void
  escape: () => void
}

const TYPING = new Set(['TEXTAREA', 'SELECT'])
// Inputs you don't type into: after clicking a switch or slider the focus stays there, and the app keys must still work.
const NOT_TEXT = new Set(['checkbox', 'radio', 'range', 'button', 'submit', 'file', 'color'])

/** True when a key press belongs to the thing being typed into, not to the app. */
export function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLInputElement | null
  if (!el) return false
  if (el.tagName === 'INPUT') return !NOT_TEXT.has(el.type)
  return TYPING.has(el.tagName) || el.isContentEditable
}

/**
 * App-wide keys. They never fire while typing, with a modifier held, or (for Space) on a focused
 * button or slider, so a browser shortcut or a normal keyboard activation is never hijacked.
 */
export function useShortcuts(handlers: ShortcutHandlers): void {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // e.repeat: a held key would toggle the timer, fullscreen or mute dozens of times a second.
      if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      const h = ref.current
      if (e.key === 'Escape') return h.escape()
      if (e.key === ' ') {
        const el = e.target as HTMLElement | null
        if (el && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT' || el.getAttribute('role') === 'slider' || el.getAttribute('role') === 'checkbox')) return
        e.preventDefault()
        return h.toggleTimer()
      }
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          return h.newTask()
        case 'm':
          return h.mute()
        case 'c':
          return h.calm()
        case 'f':
          return h.immersive()
        case '?':
          return h.settings()
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])
}
