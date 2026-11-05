import { describe, expect, it } from 'vitest'
import { breathAt, EXHALE_MS, INHALE_MS } from './breath'

describe('breath', () => {
  it('6 breaths a minute: 4 s in, 6 s out, a longer out-breath', () => {
    expect((60_000 / (INHALE_MS + EXHALE_MS))).toBe(6)
    expect(EXHALE_MS).toBeGreaterThan(INHALE_MS)
  })

  it('grows on the in-breath, shrinks on the out-breath, counts down and counts breaths', () => {
    expect(breathAt(0)).toEqual({ phase: 'in', size: 0, left: 4, count: 0 })
    expect(breathAt(INHALE_MS / 2).size).toBeCloseTo(0.5)
    expect(breathAt(3500).left).toBe(1)
    expect(breathAt(INHALE_MS)).toEqual({ phase: 'out', size: 1, left: 6, count: 0 })
    expect(breathAt(INHALE_MS + EXHALE_MS)).toEqual({ phase: 'in', size: 0, left: 4, count: 1 })
  })
})
