export type TimerMode = 'pomodoro' | 'free'
export type Phase = 'work' | 'short' | 'long'

const MIN = 60_000
export const POMODORO = { work: 25 * MIN, short: 5 * MIN, long: 15 * MIN, longEvery: 4 }

export type TimerState = {
  mode: TimerMode
  phase: Phase
  durationMs: number
  /** Wall-clock end of the running phase; null while paused or stopped. */
  endsAt: number | null
  pausedRemainingMs: number
  completedWork: number
  freeMs: number
}

export function initialState(mode: TimerMode, freeMs = 25 * MIN): TimerState {
  const durationMs = mode === 'free' ? freeMs : POMODORO.work
  return { mode, phase: 'work', durationMs, endsAt: null, pausedRemainingMs: durationMs, completedWork: 0, freeMs }
}

export function start(s: TimerState, now: number): TimerState {
  if (s.endsAt !== null || s.pausedRemainingMs <= 0) return s
  return { ...s, endsAt: now + s.pausedRemainingMs }
}

export function pause(s: TimerState, now: number): TimerState {
  if (s.endsAt === null) return s
  return { ...s, endsAt: null, pausedRemainingMs: remaining(s, now) }
}

export function reset(s: TimerState): TimerState {
  return { ...initialState(s.mode, s.freeMs), completedWork: s.completedWork }
}

export function remaining(s: TimerState, now: number): number {
  return s.endsAt === null ? s.pausedRemainingMs : Math.max(0, s.endsAt - now)
}

function nextPhase(s: TimerState): { phase: Phase; completedWork: number } {
  if (s.phase !== 'work') return { phase: 'work', completedWork: s.completedWork }
  const completedWork = s.completedWork + 1
  return { phase: completedWork % POMODORO.longEvery === 0 ? 'long' : 'short', completedWork }
}

// Computes from wall-clock time, so a throttled background tab catches up across several phases at once.
export function advance(s: TimerState, now: number): { state: TimerState; phasesEnded: number } {
  let state = s
  let phasesEnded = 0
  while (state.endsAt !== null && state.endsAt <= now) {
    phasesEnded++
    if (state.mode === 'free') {
      state = { ...state, endsAt: null, pausedRemainingMs: 0 }
      break
    }
    const next = nextPhase(state)
    const durationMs = POMODORO[next.phase]
    state = { ...state, ...next, durationMs, pausedRemainingMs: durationMs, endsAt: state.endsAt + durationMs }
  }
  return { state, phasesEnded }
}
