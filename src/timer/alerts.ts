import { useEffect } from 'react'
import type { Phase, TimerMode } from './timer'

export function chime(volume: number): void {
  if (volume <= 0) return
  const a = new Audio('/sounds/chime.mp3')
  a.volume = volume
  a.play().catch(() => {})
}

export function notificationsSupported(): boolean {
  return typeof Notification !== 'undefined'
}

/** Asks the browser for permission; only ever called from the user switching the option on. */
export async function askNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  return (await Notification.requestPermission()) === 'granted'
}

export function notifyPhase(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, silent: true })
  } catch {
    // some mobile browsers only allow notifications from a service worker
  }
}

const LABEL: Record<Phase, string> = { work: 'Focus', short: 'Descanso', long: 'Descanso largo' }
export const phaseLabel = (mode: TimerMode, phase: Phase): string => (mode === 'free' ? 'Tiempo libre' : LABEL[phase])

const BASE_TITLE = 'Focus/Space'
const pad = (n: number) => String(n).padStart(2, '0')

/** Puts the countdown in the tab title while it runs, so it is visible from any other tab. */
export function useTabTitle(running: boolean, remainingMs: number, label: string, waiting: boolean): void {
  const total = Math.ceil(remainingMs / 1000)
  const clock = `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
  useEffect(() => {
    document.title = running ? `${clock} · ${label} — ${BASE_TITLE}` : waiting ? `● ${label} listo — ${BASE_TITLE}` : BASE_TITLE
  }, [running, clock, label, waiting])
  useEffect(() => () => void (document.title = BASE_TITLE), [])
}
