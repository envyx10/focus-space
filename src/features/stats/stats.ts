import { todayKey } from '@/features/timer/timerStore'
import { pad2 } from '@/shared/lib/format'
import { isRecord, readJSON, writeJSON } from '@/shared/lib/storage'

export const STATS_KEY = 'focus-space:stats'
const KEEP_DAYS = 120

export type DayStats = { focusMs: number; sessions: number }
export type Stats = Record<string, DayStats>

const DAY = 86_400_000
const dayKey = (d: Date) => todayKey(d)
const daysAgo = (today: string, n: number) => dayKey(new Date(new Date(`${today}T12:00:00`).getTime() - n * DAY))

export function loadStats(): Stats {
  const raw = readJSON(STATS_KEY)
  const out: Stats = {}
  if (!isRecord(raw)) return out
  for (const [day, v] of Object.entries(raw)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !isRecord(v)) continue
    if (typeof v.focusMs === 'number' && typeof v.sessions === 'number' && v.focusMs >= 0 && v.sessions >= 0) out[day] = { focusMs: v.focusMs, sessions: v.sessions }
  }
  return out
}

export function saveStats(s: Stats): void {
  writeJSON(STATS_KEY, s)
}

export function addFocus(s: Stats, day: string, focusMs: number, sessions: number): Stats {
  if (focusMs <= 0 && sessions <= 0) return s
  const cur = s[day] ?? { focusMs: 0, sessions: 0 }
  const next = { ...s, [day]: { focusMs: cur.focusMs + focusMs, sessions: cur.sessions + sessions } }
  const keep = daysAgo(day, KEEP_DAYS)
  for (const k of Object.keys(next)) if (k < keep) delete next[k]
  return next
}

export function rangeMs(s: Stats, today: string, days: number): number {
  let total = 0
  for (let i = 0; i < days; i++) total += s[daysAgo(today, i)]?.focusMs ?? 0
  return total
}

/** Consecutive days with focus, counting back from today (or from yesterday if today is still empty). */
export function streak(s: Stats, today: string): number {
  let i = (s[today]?.focusMs ?? 0) > 0 ? 0 : 1
  let n = 0
  while ((s[daysAgo(today, i)]?.focusMs ?? 0) > 0) {
    n++
    i++
  }
  return n
}

export function formatDuration(ms: number): string {
  const min = Math.round(ms / 60_000)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${pad2(min % 60)}`
}
