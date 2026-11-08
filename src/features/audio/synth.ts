/**
 * Sounds made in the browser instead of recorded: soft noises and tones for headaches, binaural beats and pure
 * frequencies, and sounds that move around the head. Each recipe renders a stereo loop of LOOP_S seconds that
 * repeats with no seam: tones and movements complete whole cycles in it, and noise is cross-faded into its own start.
 * No file is downloaded and nothing here is a third party's work.
 */

export const SYNTH_PREFIX = 'synth:'
/** Every frequency is a multiple of 1/LOOP_S Hz and every movement divides LOOP_S, so the loop closes on itself. */
export const LOOP_S = 32

type Buf = Float32Array<ArrayBuffer>
export type Stereo = [Buf, Buf]
type Recipe = (sr: number, rand: () => number) => Stereo

const TAU = Math.PI * 2

/** Small seeded generator: the same sound every time, and testable. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Pink noise (−3 dB per octave), Paul Kellet's filter. */
function pink(n: number, rand: () => number): Buf {
  const out = new Float32Array(n)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < n; i++) {
    const w = rand() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.969 * b2 + w * 0.153852
    b3 = 0.8665 * b3 + w * 0.3104856
    b4 = 0.55 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.016898
    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
    b6 = w * 0.115926
  }
  return out
}

/** Brown noise (−6 dB per octave): leaky integration of white noise. */
function brown(n: number, rand: () => number): Buf {
  const out = new Float32Array(n)
  let last = 0
  for (let i = 0; i < n; i++) {
    last = (last + 0.02 * (rand() * 2 - 1)) / 1.02
    out[i] = last * 3.5
  }
  return out
}

/** One-pole low-pass, in place. Run twice for a gentler, darker slope. */
function lowpass(x: Buf, hz: number, sr: number): Buf {
  const a = 1 - Math.exp((-TAU * hz) / sr)
  let y = x[0]
  for (let i = 0; i < x.length; i++) x[i] = y += a * (x[i] - y)
  return x
}

/**
 * A noise rendered `fade` samples longer than the loop, folded so its tail fades into its head (equal power, as the
 * two ends are unrelated): the last sample of the loop leads straight into the first.
 */
function loopNoise(make: (n: number) => Buf, n: number, fade: number): Buf {
  const long = make(n + fade)
  const out = long.slice(0, n)
  for (let i = 0; i < fade; i++) {
    const w = i / fade
    out[i] = long[i] * Math.sin((w * Math.PI) / 2) + long[n + i] * Math.cos((w * Math.PI) / 2)
  }
  return out
}

const sine = (n: number, hz: number, sr: number, amp = 1, phase = 0) => {
  // Recursive sine: two multiplies a sample instead of Math.sin, and still exact enough over a whole loop.
  const out = new Float32Array(n)
  const k = (TAU * hz) / sr
  const c = 2 * Math.cos(k)
  let y1 = amp * Math.sin(phase - k)
  let y2 = amp * Math.sin(phase - 2 * k)
  for (let i = 0; i < n; i++) {
    const y = c * y1 - y2
    y2 = y1
    y1 = y
    out[i] = y
  }
  return out
}

/** Scales the loop to a steady loudness (RMS) so it sits with the recordings, and keeps peaks under full scale. */
function level([l, r]: Stereo, rms: number): Stereo {
  let sum = 0
  let peak = 0
  for (let i = 0; i < l.length; i++) {
    sum += l[i] * l[i] + r[i] * r[i]
    peak = Math.max(peak, Math.abs(l[i]), Math.abs(r[i]))
  }
  const now = Math.sqrt(sum / (2 * l.length)) || 1
  const g = Math.min(rms / now, 0.95 / (peak || 1))
  for (let i = 0; i < l.length; i++) {
    l[i] *= g
    r[i] *= g
  }
  return [l, r]
}

const mono = (x: Buf): Stereo => [x, x.slice()]

/** Binaural beat: a slightly different pure tone in each ear; the brain hears the difference as a slow pulse. */
const binaural = (beat: number, carrier = 200): Recipe => (sr) => {
  const n = LOOP_S * sr
  return level([sine(n, carrier, sr), sine(n, carrier + beat, sr)], 0.12)
}

/** A pure tone with a soft octave below, so it is not a bare whistle. */
const tone = (hz: number): Recipe => (sr) => {
  const n = LOOP_S * sr
  const x = sine(n, hz, sr)
  const low = sine(n, hz / 2, sr, 0.5)
  for (let i = 0; i < n; i++) x[i] += low[i]
  return level(mono(x), 0.1)
}

/**
 * Moves a mono sound around the listener. `x` in −1…1 is left…right; `z` in −1…1 is behind…in front: behind is
 * muffled, the way the outer ear dulls sound from the back. Equal-power panning keeps the loudness steady.
 */
function place(dry: Buf, sr: number, pos: (t: number) => { x: number; z: number }): Stereo {
  const dull = lowpass(lowpass(dry.slice(), 900, sr), 900, sr)
  const l = new Float32Array(dry.length)
  const r = new Float32Array(dry.length)
  for (let i = 0; i < dry.length; i++) {
    const { x, z } = pos(i / sr)
    const back = Math.max(0, -z) * 0.7
    const s = dry[i] * (1 - back) + dull[i] * back
    l[i] = s * Math.sqrt((1 - x) / 2)
    r[i] = s * Math.sqrt((1 + x) / 2)
  }
  return [l, r]
}

/** Soft bell strikes placed around the head, written into the loop with wrap-around so none is cut at the seam. */
function chimes(sr: number, rand: () => number): Stereo {
  const n = LOOP_S * sr
  const l = new Float32Array(n)
  const r = new Float32Array(n)
  // Pentatonic, low and warm; no strike is sharp: each note swells in over 40 ms.
  const notes = [196, 220, 261.625, 293.665, 329.625, 392, 440]
  const partials = [
    [1, 1],
    [2.76, 0.35],
    [5.4, 0.12],
  ]
  for (let t = 0.5; t < LOOP_S; t += 1.6 + rand() * 1.6) {
    const f = notes[Math.floor(rand() * notes.length)]
    const angle = rand() * TAU
    const x = Math.sin(angle)
    const z = Math.cos(angle)
    const back = Math.max(0, -z) * 0.6
    const gl = Math.sqrt((1 - x) / 2) * (1 - back * 0.5)
    const gr = Math.sqrt((1 + x) / 2) * (1 - back * 0.5)
    const len = Math.floor(5 * sr)
    const start = Math.floor(t * sr)
    const amp = 0.5 + rand() * 0.5
    // Each partial is a recursive sine (two multiplies a sample) with its own exponential decay folded in.
    const note = new Float32Array(len)
    for (const [m, a] of partials) {
      const w = (TAU * f * m) / sr
      const decay = Math.exp(-(1.1 + m * 0.6) / sr)
      const c = 2 * Math.cos(w) * decay
      const d2 = decay * decay
      let y1 = 0
      let y2 = (-a * Math.sin(w)) / decay
      for (let i = 0; i < len; i++) {
        const y = c * y1 - d2 * y2
        y2 = y1
        y1 = y
        note[i] += y
      }
    }
    const attack = 0.04 * sr
    for (let i = 0; i < len; i++) {
      const v = note[i] * Math.min(1, i / attack) * amp
      const k = (start + i) % n
      l[k] += v * gl
      r[k] += v * gr
    }
  }
  return level([l, r], 0.08)
}

const fadeOf = (sr: number) => 2 * sr

export const RECIPES: Record<string, Recipe> = {
  // Headache: dark, steady, nothing sharp or sudden.
  'migraine-oscuro': (sr, rand) => {
    const n = LOOP_S * sr
    return level(mono(loopNoise((m) => lowpass(lowpass(brown(m, rand), 250, sr), 250, sr), n, fadeOf(sr))), 0.1)
  },
  'migraine-oleaje': (sr, rand) => {
    // Swells every 8 s: about seven and a half a minute, a slow breathing pace.
    const n = LOOP_S * sr
    const x = loopNoise((m) => lowpass(lowpass(pink(m, rand), 500, sr), 500, sr), n, fadeOf(sr))
    for (let i = 0; i < n; i++) x[i] *= 0.35 + 0.65 * (0.5 - 0.5 * Math.cos((TAU * i) / (8 * sr)))
    return level(mono(x), 0.09)
  },
  'migraine-zumbido': (sr, rand) => {
    const n = LOOP_S * sr
    const bed = loopNoise((m) => lowpass(lowpass(brown(m, rand), 180, sr), 180, sr), n, fadeOf(sr))
    const a = sine(n, 110, sr)
    const b = sine(n, 165, sr, 0.6)
    const c = sine(n, 220, sr, 0.25)
    for (let i = 0; i < n; i++) {
      const breathe = 0.8 + 0.2 * Math.sin((TAU * i) / (16 * sr))
      a[i] = (a[i] + b[i] + c[i]) * breathe * 0.5 + bed[i] * 0.6
    }
    return level(mono(a), 0.09)
  },
  // Frequencies. Binaural beats only work with headphones.
  'tones-delta': binaural(2, 150),
  'tones-theta': binaural(6),
  'tones-alfa': binaural(10),
  'tones-beta': binaural(16),
  'tones-432': tone(432),
  'tones-528': tone(528),
  // Spatial: also best with headphones.
  'spatial-orbita': (sr, rand) => {
    // Airy noise circling the head once every 16 s.
    const n = LOOP_S * sr
    const dry = loopNoise((m) => lowpass(pink(m, rand), 4000, sr), n, fadeOf(sr))
    return level(place(dry, sr, (t) => ({ x: Math.sin((TAU * t) / 16), z: Math.cos((TAU * t) / 16) })), 0.09)
  },
  'spatial-campanas': chimes,
  'spatial-vaiven': (sr, rand) => {
    // A warm hum and air drifting from one side to the other and back every 32 s.
    const n = LOOP_S * sr
    const air = loopNoise((m) => lowpass(lowpass(pink(m, rand), 1200, sr), 1200, sr), n, fadeOf(sr))
    const hum = sine(n, 98, sr, 0.5)
    const fifth = sine(n, 147, sr, 0.25)
    for (let i = 0; i < n; i++) air[i] = air[i] + hum[i] + fifth[i]
    return level(place(air, sr, (t) => ({ x: Math.sin((TAU * t) / LOOP_S) * 0.9, z: 0.3 })), 0.09)
  },
}

/** Renders the loop behind a `synth:<channel>-<variant>` source. */
export function synthesize(src: string, sampleRate: number): Stereo {
  const name = src.slice(SYNTH_PREFIX.length)
  const recipe = RECIPES[name]
  if (!recipe) throw new Error(`no synth recipe for ${src}`)
  let seed = 0
  for (const c of name) seed = (Math.imul(seed, 31) + c.charCodeAt(0)) | 0
  return recipe(sampleRate, mulberry32(seed))
}

/** The same loop as a 16-bit WAV, for places that play a URL (the preview in Settings). */
export function toWav([l, r]: Stereo, sampleRate: number, seconds = l.length / sampleRate): Blob {
  const n = Math.min(l.length, Math.round(seconds * sampleRate))
  const data = new DataView(new ArrayBuffer(44 + n * 4))
  const str = (o: number, s: string) => [...s].forEach((c, i) => data.setUint8(o + i, c.charCodeAt(0)))
  str(0, 'RIFF')
  data.setUint32(4, 36 + n * 4, true)
  str(8, 'WAVEfmt ')
  data.setUint32(16, 16, true)
  data.setUint16(20, 1, true)
  data.setUint16(22, 2, true)
  data.setUint32(24, sampleRate, true)
  data.setUint32(28, sampleRate * 4, true)
  data.setUint16(32, 4, true)
  data.setUint16(34, 16, true)
  str(36, 'data')
  data.setUint32(40, n * 4, true)
  for (let i = 0; i < n; i++) {
    data.setInt16(44 + i * 4, Math.max(-1, Math.min(1, l[i])) * 0x7fff, true)
    data.setInt16(46 + i * 4, Math.max(-1, Math.min(1, r[i])) * 0x7fff, true)
  }
  return new Blob([data.buffer], { type: 'audio/wav' })
}
