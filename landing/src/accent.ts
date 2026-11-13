import { useSyncExternalStore } from 'react'
import { DEFAULT_ACCENT, onAccent } from '@/features/prefs/accent'
import { field } from '~/field/scenes'

/** Names for the app's quick accents, in the order of ACCENTS. */
export const ACCENT_NAMES = ['Naranja', 'Ámbar', 'Lima', 'Turquesa', 'Cielo', 'Violeta', 'Rosa']

let current: string = DEFAULT_ACCENT
const listeners = new Set<() => void>()

/** Repaints the whole page in another accent, as the app's Settings do: the CSS and the particles take it. */
export function setAccent(hex: string) {
  current = hex
  const root = document.documentElement.style
  root.setProperty('--accent', hex)
  root.setProperty('--on-accent', onAccent(hex))
  field.accent = hex
  listeners.forEach((l) => l())
}

export function useAccent(): string {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => current,
  )
}
