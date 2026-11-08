import { useEffect } from 'react'
import { useT, type T } from '../i18n'
import type { Phase, TimerMode } from './timer'

export const CHIMES = ['campana', 'cuenco', 'marimba', 'digital'] as const
export type Chime = (typeof CHIMES)[number]

// Synthesised tones: [frequency Hz, start s, length s] per note.
const NOTES: Record<Exclude<Chime, 'campana'>, { wave: OscillatorType; notes: [number, number, number][] }> = {
  cuenco: { wave: 'sine', notes: [[220, 0, 4], [528, 0, 3.2], [880, 0, 1.8]] },
  marimba: { wave: 'triangle', notes: [[523, 0, 0.7], [659, 0.14, 0.7], [784, 0.28, 1.1]] },
  digital: { wave: 'square', notes: [[1046, 0, 0.12], [1046, 0.2, 0.12], [1046, 0.4, 0.12]] },
}

let ctx: AudioContext | null = null
let bell: HTMLAudioElement | null = null
const bellAudio = () => (bell ??= new Audio('/sounds/chime.mp3'))

/**
 * iOS only lets sound start inside a tap, and the chime plays later, from the timer. Called from Start: the context
 * and the bell element get unlocked there (a silent play), so they may sound when the phase ends.
 */
export function primeChime(): void {
  try {
    ctx ??= new AudioContext()
    void ctx.resume()
    const a = bellAudio()
    a.muted = true
    Promise.resolve(a.play())
      .then(() => a.pause())
      .catch(() => {})
      .finally(() => {
        a.muted = false
        a.currentTime = 0
      })
  } catch {
    // no audio here: the chime just stays silent
  }
}

export function chime(volume: number, sound: Chime = 'campana'): void {
  if (volume <= 0) return
  if (sound === 'campana') {
    const a = bellAudio()
    a.currentTime = 0
    a.volume = volume
    Promise.resolve(a.play()).catch(() => {})
    return
  }
  try {
    ctx ??= new AudioContext()
    void ctx.resume()
    const { wave, notes } = NOTES[sound]
    const peak = volume * (wave === 'square' ? 0.08 : 0.3) // square waves sound far louder at the same gain
    for (const [freq, at, len] of notes) {
      const t = ctx.currentTime + at
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = wave
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(peak, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + len)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + len)
    }
  } catch {
    // no Web Audio: the phase still ends, just silently
  }
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

export const phaseLabel = (t: T, mode: TimerMode, phase: Phase): string => t(mode === 'free' ? 'phase.free' : `phase.${phase}`)

const BASE_TITLE = 'Focus/Space'
const pad = (n: number) => String(n).padStart(2, '0')

/** Puts the countdown in the tab title while it runs, so it is visible from any other tab. */
export function useTabTitle(running: boolean, remainingMs: number, label: string, waiting: boolean): void {
  const t = useT()
  const total = Math.ceil(remainingMs / 1000)
  const clock = `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
  useEffect(() => {
    document.title = running ? `${clock} · ${label} — ${BASE_TITLE}` : waiting ? `● ${t('alert.ready', { phase: label })} — ${BASE_TITLE}` : BASE_TITLE
  }, [running, clock, label, waiting, t])
  useEffect(() => () => void (document.title = BASE_TITLE), [])
}
