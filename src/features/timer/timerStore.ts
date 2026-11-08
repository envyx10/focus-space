import { formatDateKey } from '@/shared/lib/format'
import { isRecord, readJSON, writeJSON } from '@/shared/lib/storage'
import { DEFAULT_CONFIG, type Phase, type TimerConfig, type TimerMode, type TimerState } from './timer'

export const TIMER_KEY = 'focus-space:timer'
export type TimerStore = {
  day: string
  completedWork: number
  freeMinutes: number
  config: TimerConfig
  /** Last timer state, so a reload or a closed tab doesn't lose a running phase. */
  timer: TimerState | null
}

const MODES: TimerMode[] = ['pomodoro', 'free']
const PHASES: Phase[] = ['work', 'short', 'long']
const num = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const ms = (x: unknown, min: number, max: number, fallback: number) => (num(x) && x >= min && x <= max ? x : fallback)

const MIN = 60_000
export const LIMITS = { work: [1, 180], short: [1, 60], long: [1, 90], longEvery: [2, 10] } as const

export function parseConfig(raw: unknown): TimerConfig {
  const r = isRecord(raw) ? raw : {}
  return {
    work: ms(r.work, LIMITS.work[0] * MIN, LIMITS.work[1] * MIN, DEFAULT_CONFIG.work),
    short: ms(r.short, LIMITS.short[0] * MIN, LIMITS.short[1] * MIN, DEFAULT_CONFIG.short),
    long: ms(r.long, LIMITS.long[0] * MIN, LIMITS.long[1] * MIN, DEFAULT_CONFIG.long),
    longEvery: Number.isInteger(r.longEvery) && (r.longEvery as number) >= LIMITS.longEvery[0] && (r.longEvery as number) <= LIMITS.longEvery[1] ? (r.longEvery as number) : DEFAULT_CONFIG.longEvery,
    autoNext: typeof r.autoNext === 'boolean' ? r.autoNext : DEFAULT_CONFIG.autoNext,
  }
}

function parseTimer(raw: unknown, cfg: TimerConfig): TimerState | null {
  if (!isRecord(raw)) return null
  if (!MODES.includes(raw.mode as TimerMode) || !PHASES.includes(raw.phase as Phase)) return null
  if (!num(raw.durationMs) || raw.durationMs <= 0 || !num(raw.pausedRemainingMs) || raw.pausedRemainingMs < 0) return null
  if (!(raw.endsAt === null || num(raw.endsAt)) || !num(raw.completedWork) || !num(raw.freeMs)) return null
  return {
    mode: raw.mode as TimerMode,
    phase: raw.phase as Phase,
    durationMs: raw.durationMs,
    endsAt: raw.endsAt as number | null,
    pausedRemainingMs: raw.pausedRemainingMs,
    completedWork: raw.completedWork,
    freeMs: raw.freeMs,
    cfg,
  }
}

export function loadTimerStore(today: string): TimerStore {
  const raw = readJSON(TIMER_KEY)
  const r = isRecord(raw) ? raw : {}
  const freeMinutes = typeof r.freeMinutes === 'number' && r.freeMinutes >= 1 ? r.freeMinutes : 25
  const sameDay = r.day === today && typeof r.completedWork === 'number'
  const config = parseConfig(r.config)
  return { day: today, completedWork: sameDay ? (r.completedWork as number) : 0, freeMinutes, config, timer: parseTimer(r.timer, config) }
}

export function saveTimerStore(s: TimerStore): void {
  writeJSON(TIMER_KEY, s)
}

export function todayKey(d = new Date()): string {
  return formatDateKey(d)
}
