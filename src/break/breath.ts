/**
 * Paced diaphragmatic breathing at about 6 breaths a minute: 4 s in through the nose, 6 s out slowly through the
 * mouth. This is the resonance-frequency rate used in clinical breathing and HRV-biofeedback protocols
 * (Lehrer & Gevirtz), and the longer out-breath is the part that brings the calming (parasympathetic) response.
 */
export const INHALE_MS = 4000
export const EXHALE_MS = 6000
const CYCLE_MS = INHALE_MS + EXHALE_MS

export type Breath = {
  phase: 'in' | 'out'
  /** Square size 0..1. */
  size: number
  /** Whole seconds left in this phase, for the countdown. */
  left: number
  /** Breaths completed so far. */
  count: number
}

/**
 * Hand-off between the breathing guide and the particle sphere, which live in different React trees.
 * `sphere`: the sphere is animating (not calm mode, WebGL ok, motion allowed), so the guide can use it.
 * `size`: the guide's breath, 0..1, or null when no guide is open.
 * shortcut: a module-level singleton, fine for one sphere and one guide; a context if either ever multiplies.
 */
export const breathing: { sphere: boolean; size: number | null } = { sphere: false, size: null }

const ease = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2

export function breathAt(ms: number): Breath {
  const t = Math.max(0, ms)
  const count = Math.floor(t / CYCLE_MS)
  const c = t % CYCLE_MS
  if (c < INHALE_MS) return { phase: 'in', size: ease(c / INHALE_MS), left: Math.ceil((INHALE_MS - c) / 1000), count }
  return { phase: 'out', size: 1 - ease((c - INHALE_MS) / EXHALE_MS), left: Math.ceil((CYCLE_MS - c) / 1000), count }
}
