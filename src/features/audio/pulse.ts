type Levels = { bass: number; high: number }

// Typical lofi hip hop tempo. The YouTube stream can't be analysed (cross-origin iframe), so
// without tab capture the 3D follows this synthetic groove instead of the real track.
export const PULSE_BPM = 80

/** Kick on every beat (accented on the one of each bar) and a hi-hat on the off-beat. */
export function beatPulse(t: number, bpm = PULSE_BPM): Levels {
  const phase = t / (60 / bpm)
  const beat = Math.floor(phase)
  const kick = Math.exp(-(phase - beat) * 5) * (beat % 4 === 0 ? 1 : 0.7)
  const off = (phase + 0.5) % 1
  const hat = Math.exp(-off * 12) * 0.45 + 0.05
  return { bass: Math.min(1, kick), high: Math.min(1, hat) }
}

/** Louder of each band across sources; null when no source is active. */
export function mergeLevels(...sources: (Levels | null)[]): Levels | null {
  const live = sources.filter((s): s is Levels => s !== null)
  if (!live.length) return null
  return { bass: Math.max(...live.map((s) => s.bass)), high: Math.max(...live.map((s) => s.high)) }
}
