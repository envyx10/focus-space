/** Guided breathing: inhale while holding, exhale while released. The score is how much of the time the two matched. */

export const INHALE_MS = 4000
export const EXHALE_MS = 6000
const CYCLE_MS = INHALE_MS + EXHALE_MS

export type Breath = { phase: 'in' | 'out'; /** 0..1 through the current phase */ progress: number; /** circle size 0..1 */ size: number }

const ease = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2

export function breathAt(ms: number): Breath {
  const t = ((ms % CYCLE_MS) + CYCLE_MS) % CYCLE_MS
  if (t < INHALE_MS) {
    const progress = t / INHALE_MS
    return { phase: 'in', progress, size: ease(progress) }
  }
  const progress = (t - INHALE_MS) / EXHALE_MS
  return { phase: 'out', progress, size: 1 - ease(progress) }
}

export type Score = { matchedMs: number; totalMs: number }
export const NO_SCORE: Score = { matchedMs: 0, totalMs: 0 }

/** Adds `dt` ms of play; holding during an inhale or letting go during an exhale counts as matched. */
export function scoreStep(s: Score, held: boolean, phase: Breath['phase'], dt: number): Score {
  const ok = held === (phase === 'in')
  return { matchedMs: s.matchedMs + (ok ? dt : 0), totalMs: s.totalMs + dt }
}

export const percent = (s: Score) => (s.totalMs ? Math.round((s.matchedMs / s.totalMs) * 100) : 0)
