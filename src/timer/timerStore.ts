import { isRecord, readJSON, writeJSON } from '../lib/storage'

export const TIMER_KEY = 'focus-space:timer'
export type TimerStore = { day: string; completedWork: number; freeMinutes: number }

export function loadTimerStore(today: string): TimerStore {
  const raw = readJSON(TIMER_KEY)
  const r = isRecord(raw) ? raw : {}
  const freeMinutes = typeof r.freeMinutes === 'number' && r.freeMinutes >= 1 ? r.freeMinutes : 25
  const sameDay = r.day === today && typeof r.completedWork === 'number'
  return { day: today, completedWork: sameDay ? (r.completedWork as number) : 0, freeMinutes }
}

export function saveTimerStore(s: TimerStore): void {
  writeJSON(TIMER_KEY, s)
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
