import { describe, expect, it } from 'vitest'
import { LOOP_S, RECIPES, SYNTH_PREFIX, synthesize, toWav } from './synth'

const SR = 8000
const rendered = Object.fromEntries(Object.keys(RECIPES).map((name) => [name, synthesize(SYNTH_PREFIX + name, SR)]))

const rms = (x: Float32Array) => Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length)
/** Rising zero crossings: roughly the frequency times the length. */
const crossings = (x: Float32Array) => {
  let n = 0
  for (let i = 1; i < x.length; i++) if (x[i - 1] < 0 && x[i] >= 0) n++
  return n
}

describe('synth', () => {
  it.each(Object.keys(RECIPES))('%s renders a full, audible, unclipped stereo loop', (name) => {
    const [l, r] = rendered[name]
    expect(l).toHaveLength(LOOP_S * SR)
    expect(r).toHaveLength(LOOP_S * SR)
    for (const ch of [l, r]) {
      expect(ch.every(Number.isFinite)).toBe(true)
      expect(ch.reduce((m, v) => Math.max(m, Math.abs(v)), 0)).toBeLessThanOrEqual(0.95)
    }
    expect(rms(l) + rms(r)).toBeGreaterThan(0.05)
  })

  it.each(Object.keys(RECIPES))('%s loops with no click at the seam', (name) => {
    for (const ch of rendered[name]) {
      let biggest = 0
      for (let i = 1; i < ch.length; i++) biggest = Math.max(biggest, Math.abs(ch[i] - ch[i - 1]))
      // The jump from the last sample back to the first is no bigger than the steps inside the loop.
      expect(Math.abs(ch[0] - ch[ch.length - 1])).toBeLessThanOrEqual(biggest * 1.05)
    }
  })

  it('binaural beats put a slightly higher tone in the right ear', () => {
    const [l, r] = rendered['tones-alfa']
    expect(crossings(l)).toBeCloseTo(200 * LOOP_S, -1)
    expect(crossings(r) - crossings(l)).toBeCloseTo(10 * LOOP_S, -1)
  })

  it('spatial sounds really move between the ears', () => {
    const [l, r] = rendered['spatial-orbita']
    const quarter = (LOOP_S * SR) / 4
    const left = (a: number) => rms(l.subarray(a, a + SR)) / rms(r.subarray(a, a + SR))
    // A quarter of the way round (4 s of 16 s) it is on the right; three quarters, on the left.
    expect(left(quarter / 2 - SR / 2)).toBeLessThan(0.5)
    expect(left((quarter * 3) / 2 - SR / 2)).toBeGreaterThan(2)
  })

  it('the headache sounds keep out of the high frequencies', () => {
    for (const name of ['migraine-oscuro', 'migraine-oleaje', 'migraine-zumbido']) {
      const [l] = rendered[name]
      let diff = 0
      for (let i = 1; i < l.length; i++) diff += (l[i] - l[i - 1]) ** 2
      // The sample-to-sample change is tiny next to the signal: almost no energy up high.
      expect(Math.sqrt(diff / l.length) / rms(l), name).toBeLessThan(0.15)
    }
  })

  it('renders the same sound every time', () => {
    expect(synthesize(`${SYNTH_PREFIX}migraine-oleaje`, SR)[0]).toEqual(rendered['migraine-oleaje'][0])
  })

  it('refuses an unknown recipe', () => {
    expect(() => synthesize(`${SYNTH_PREFIX}nope`, SR)).toThrow()
  })

  it('writes a stereo 16-bit WAV of the asked length', async () => {
    const blob = toWav(rendered['tones-432'], SR, 2)
    const bytes = new DataView(await blob.arrayBuffer())
    const text = (o: number) => String.fromCharCode(...new Uint8Array(bytes.buffer, o, 4))
    expect(text(0)).toBe('RIFF')
    expect(text(8)).toBe('WAVE')
    expect(bytes.getUint16(22, true)).toBe(2)
    expect(bytes.getUint32(24, true)).toBe(SR)
    expect(bytes.getUint32(40, true)).toBe(2 * SR * 4)
    expect(blob.type).toBe('audio/wav')
  })
})
