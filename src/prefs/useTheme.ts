import { useEffect, useState } from 'react'
import type { Theme } from './prefs'

const LIGHT_QUERY = '(prefers-color-scheme: light)'
const systemLight = () => globalThis.matchMedia?.(LIGHT_QUERY).matches ?? false

/** Resolves 'system' against the OS setting (live) and applies the result to <html data-theme> and the browser bar colour. */
export function useTheme(pref: Theme): 'dark' | 'light' {
  const [sysLight, setSysLight] = useState(systemLight)
  useEffect(() => {
    const m = globalThis.matchMedia?.(LIGHT_QUERY)
    if (!m) return
    const on = () => setSysLight(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  const theme = pref === 'system' ? (sysLight ? 'light' : 'dark') : pref
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme === 'light' ? '#f2f1ec' : '#0b0b0b')
  }, [theme])
  return theme
}
