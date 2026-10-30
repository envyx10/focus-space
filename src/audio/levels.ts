const BASS_MAX_HZ = 250
const HIGH_MIN_HZ = 2000

function mean(d: Uint8Array, from: number, to: number): number {
  if (to <= from) return 0
  let sum = 0
  for (let i = from; i < to; i++) sum += d[i]
  return sum / (to - from) / 255
}

/** Average energy (0..1) of the bass (<250 Hz) and high (>2 kHz) bands of an AnalyserNode frequency frame. */
export function bandLevels(freq: Uint8Array, sampleRate = 48_000, fftSize = 1024): { bass: number; high: number } {
  const binHz = sampleRate / fftSize
  const bassEnd = Math.min(freq.length, Math.ceil(BASS_MAX_HZ / binHz))
  const highStart = Math.min(freq.length, Math.ceil(HIGH_MIN_HZ / binHz))
  return { bass: mean(freq, 0, bassEnd), high: mean(freq, highStart, freq.length) }
}
