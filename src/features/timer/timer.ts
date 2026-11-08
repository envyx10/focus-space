export type TimerMode = 'pomodoro' | 'free'
export type Phase = 'work' | 'short' | 'long'

const MIN = 60_000

export type TimerConfig = {
  work: number
  short: number
  long: number
  longEvery: number
  /** false: when a phase ends the next one waits, paused, for the user to start it. */
  autoNext: boolean
}

export const DEFAULT_CONFIG: TimerConfig = { work: 25 * MIN, short: 5 * MIN, long: 15 * MIN, longEvery: 4, autoNext: true }

export type TimerState = {
  mode: TimerMode
  phase: Phase
  durationMs: number
  /** Wall-clock end of the running phase; null while paused or stopped. */
  endsAt: number | null
  pausedRemainingMs: number
  completedWork: number
  freeMs: number
  cfg: TimerConfig
}

export function initialState(mode: TimerMode, freeMs = 25 * MIN, cfg: TimerConfig = DEFAULT_CONFIG): TimerState {
  const durationMs = mode === 'free' ? freeMs : cfg.work
  return { mode, phase: 'work', durationMs, endsAt: null, pausedRemainingMs: durationMs, completedWork: 0, freeMs, cfg }
}

export function start(s: TimerState, now: number): TimerState {
  if (s.endsAt !== null) return s
  // A finished free session sits at zero: starting again runs a fresh one instead of doing nothing.
  const ms = s.pausedRemainingMs > 0 ? s.pausedRemainingMs : s.durationMs
  return { ...s, pausedRemainingMs: ms, endsAt: now + ms }
}

export function pause(s: TimerState, now: number): TimerState {
  if (s.endsAt === null) return s
  return { ...s, endsAt: null, pausedRemainingMs: remaining(s, now) }
}

export function reset(s: TimerState): TimerState {
  return { ...initialState(s.mode, s.freeMs, s.cfg), completedWork: s.completedWork }
}

export function remaining(s: TimerState, now: number): number {
  return s.endsAt === null ? s.pausedRemainingMs : Math.max(0, s.endsAt - now)
}

/** Adds time to the current phase, running or not. */
export function extend(s: TimerState, ms: number): TimerState {
  return s.endsAt === null
    ? { ...s, durationMs: s.durationMs + ms, pausedRemainingMs: s.pausedRemainingMs + ms }
    : { ...s, durationMs: s.durationMs + ms, endsAt: s.endsAt + ms }
}

function nextPhase(s: TimerState): { phase: Phase; completedWork: number } {
  if (s.phase !== 'work') return { phase: 'work', completedWork: s.completedWork }
  const completedWork = s.completedWork + 1
  return { phase: completedWork % s.cfg.longEvery === 0 ? 'long' : 'short', completedWork }
}

/** Jumps to the next Pomodoro phase now. Skipping a work block doesn't count it as done. Free mode just resets. */
export function skip(s: TimerState, now: number): TimerState {
  if (s.mode === 'free') return reset(s)
  const phase: Phase = s.phase === 'work' ? (s.completedWork % s.cfg.longEvery === s.cfg.longEvery - 1 ? 'long' : 'short') : 'work'
  const durationMs = s.cfg[phase]
  const moved = { ...s, phase, durationMs, pausedRemainingMs: durationMs, endsAt: null }
  return s.endsAt === null ? moved : { ...moved, endsAt: now + durationMs }
}

/** Applies new durations. A phase that hasn't started yet picks them up at once; one in progress keeps its own. */
export function withConfig(s: TimerState, cfg: TimerConfig): TimerState {
  const untouched = s.endsAt === null && s.pausedRemainingMs === s.durationMs
  if (s.mode !== 'pomodoro' || !untouched) return { ...s, cfg }
  return { ...s, cfg, durationMs: cfg[s.phase], pausedRemainingMs: cfg[s.phase] }
}

export type Advance = {
  state: TimerState
  phasesEnded: number
  /** Time-in-focus completed along the way: Pomodoro work blocks and free sessions. */
  focusedMs: number
  focusSessions: number
}

// Computes from wall-clock time, so a throttled background tab catches up across several phases at once.
export function advance(s: TimerState, now: number): Advance {
  let state = s
  let phasesEnded = 0
  let focusedMs = 0
  let focusSessions = 0
  while (state.endsAt !== null && state.endsAt <= now) {
    phasesEnded++
    if (state.mode === 'free' || state.phase === 'work') {
      focusedMs += state.durationMs
      focusSessions++
    }
    if (state.mode === 'free') {
      state = { ...state, endsAt: null, pausedRemainingMs: 0 }
      break
    }
    const next = nextPhase(state)
    const durationMs = state.cfg[next.phase]
    if (!state.cfg.autoNext) {
      state = { ...state, ...next, durationMs, pausedRemainingMs: durationMs, endsAt: null }
      break
    }
    state = { ...state, ...next, durationMs, pausedRemainingMs: durationMs, endsAt: state.endsAt + durationMs }
  }
  return { state, phasesEnded, focusedMs, focusSessions }
}
