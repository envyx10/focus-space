import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react'

/** Below this width the app mounts the mobile shell instead of the desktop grid (the desktop grid needs 1024 px). */
export const MOBILE_QUERY = '(max-width: 1023px)'

export const MOBILE_TABS = ['focus', 'tasks', 'sound', 'settings'] as const
export type MobileTab = (typeof MOBILE_TABS)[number]

/** A media query as React state. Without matchMedia (tests, very old browsers) it is false: the desktop tree. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = globalThis.matchMedia?.(query)
      mq?.addEventListener?.('change', onChange)
      return () => mq?.removeEventListener?.('change', onChange)
    },
    () => globalThis.matchMedia?.(query).matches ?? false,
    () => false,
  )
}

const EDITABLE = new Set(['TEXTAREA', 'SELECT'])
const NOT_TEXT = new Set(['checkbox', 'radio', 'range', 'button', 'submit', 'file', 'color'])

function isEditable(el: Element | null): boolean {
  if (!el) return false
  if (el.tagName === 'INPUT') return !NOT_TEXT.has((el as HTMLInputElement).type)
  return EDITABLE.has(el.tagName) || (el as HTMLElement).isContentEditable
}

/**
 * The software keyboard. iOS keeps the layout viewport and slides the visual one; Android (with
 * interactive-widget=resizes-content) shrinks both. Measuring innerHeight against visualViewport only works on iOS,
 * so "open" is read from what has focus on a touch screen, and the visible box comes from visualViewport.
 * While it is open the shell is sized to the visible box (--vvh, --vvt), so the composer and sheets sit right on top
 * of the keyboard on both systems.
 */
export function useKeyboard(shell: RefObject<HTMLElement | null>): boolean {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const coarse = globalThis.matchMedia?.('(pointer: coarse)').matches ?? false
    const vv = globalThis.visualViewport
    const measure = () => {
      const node = shell.current
      if (!node || !vv) return
      node.style.setProperty('--vvh', `${vv.height}px`)
      node.style.setProperty('--vvt', `${vv.offsetTop}px`)
    }
    const typing = () => {
      const el = document.activeElement
      return coarse && !!el && el.isConnected && isEditable(el)
    }
    let closing = 0
    let watch = 0
    const sync = () => {
      clearTimeout(closing)
      const on = typing()
      setOpen(on)
      measure()
      // iOS scrolls the window to reveal a focused field even in a fixed layout; put it back once the keyboard is gone.
      if (!on && (scrollX || scrollY)) scrollTo(0, 0)
      // A field removed while focused (a sheet closing on Enter) fires no focusout in WebKit: keep checking while up.
      clearInterval(watch)
      if (on) watch = window.setInterval(() => !typing() && sync(), 400)
    }
    sync()
    document.addEventListener('focusin', sync)
    // Leaving a field: wait before giving the layout back. The keyboard takes ~250 ms to go down anyway, and a tap
    // that blurred the field (Undo, Save) must land before the tab bar reappears and moves everything under the finger.
    const out = () => {
      clearTimeout(closing)
      closing = window.setTimeout(sync, 280)
    }
    document.addEventListener('focusout', out)
    vv?.addEventListener('resize', measure)
    vv?.addEventListener('scroll', measure)
    return () => {
      clearTimeout(closing)
      clearInterval(watch)
      document.removeEventListener('focusin', sync)
      document.removeEventListener('focusout', out)
      vv?.removeEventListener('resize', measure)
      vv?.removeEventListener('scroll', measure)
    }
  }, [shell])

  return open
}

/** A short tick on Android when an action lands. iOS Safari has no Vibration API, so it is a no-op there. */
export function haptic(ms = 8): void {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // some browsers throw without a user gesture; feedback is optional
  }
}

export const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
