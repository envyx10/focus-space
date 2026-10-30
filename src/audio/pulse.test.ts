import { describe, expect, it } from 'vitest'
import { beatPulse, mergeLevels, PULSE_BPM, transient } from './pulse'

const beat = 60 / PULSE_BPM

describe('beatPulse', () => {
  it('kicks on the beat and decays before the next one', () => {
    const onBeat = beatPulse(beat * 1).bass
    const late = beatPulse(beat * 1.8).bass
    expect(onBeat).toBeGreaterThan(0.5)
    expect(late).toBeLessThan(onBeat * 0.3)
  })

  it('accents the first beat of every bar of four', () => {
    expect(beatPulse(0).bass).toBeGreaterThan(beatPulse(beat).bass)
    expect(beatPulse(beat * 4).bass).toBeCloseTo(beatPulse(0).bass, 5)
  })

  it('stays within 0..1', () => {
    for (let t = 0; t < 10; t += 0.013) {
      const { bass, high } = beatPulse(t)
      expect(bass).toBeGreaterThanOrEqual(0)
      expect(bass).toBeLessThanOrEqual(1)
      expect(high).toBeGreaterThanOrEqual(0)
      expect(high).toBeLessThanOrEqual(1)
    }
  })
})

describe('transient', () => {
  it('turns a steady loud level into a calm output and a sudden kick into a spike', () => {
    let state = { avg: 0 }
    let out = 0
    for (let i = 0; i < 200; i++) [state, out] = transient(state, 0.7)
    const steady = out
    ;[state, out] = transient(state, 0.95)
    expect(steady).toBeLessThan(0.3)
    expect(out).toBeGreaterThan(steady + 0.4)
    expect(out).toBeLessThanOrEqual(1)
  })
})

describe('mergeLevels', () => {
  it('takes the louder of each band and ignores missing sources', () => {
    expect(mergeLevels({ bass: 0.2, high: 0.7 }, null, { bass: 0.5, high: 0.1 })).toEqual({ bass: 0.5, high: 0.7 })
    expect(mergeLevels(null, null)).toBeNull()
  })
})
