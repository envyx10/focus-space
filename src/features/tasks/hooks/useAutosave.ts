import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Saves `value` shortly after it stops changing, and at once when the page hides or the component goes. Returns
 * `flush` (save now, e.g. on blur) and whether there is something not yet handed to `save`. "Saving" is derived from
 * what was last saved, never set inside an effect: an effect setting state on every keystroke chains synchronous
 * renders while typing fast, and React drops keystrokes past its update limit.
 */
export function useAutosave(value: string, save: (value: string) => void, delayMs: number) {
  const [savedValue, setSavedValue] = useState(value)
  const saved = useRef(value)
  const latest = useRef(value)
  const saveRef = useRef(save)
  useLayoutEffect(() => {
    latest.current = value
    saveRef.current = save
  })

  const flush = useCallback(() => {
    if (latest.current === saved.current) return
    saved.current = latest.current
    setSavedValue(latest.current)
    saveRef.current(latest.current)
  }, [])

  useEffect(() => {
    if (value === saved.current) return
    const id = setTimeout(flush, delayMs)
    return () => clearTimeout(id)
  }, [value, flush, delayMs])

  // Closing the tab, reloading or switching away saves at once: the timer above would never get to run.
  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && flush()
    addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onHide)
      flush()
    }
  }, [flush])

  return { flush, saving: value !== savedValue }
}
