import { describe, expect, it } from 'vitest'
import { breathAt, EXHALE_MS, INHALE_MS, NO_SCORE, percent, scoreStep } from './breath'

describe('breath', () => {
  it('inhales then exhales, growing and shrinking the circle, and loops', () => {
    expect(breathAt(0)).toMatchObject({ phase: 'in', size: 0 })
    expect(breathAt(INHALE_MS / 2).size).toBeCloseTo(0.5)
    expect(breathAt(INHALE_MS)).toMatchObject({ phase: 'out', size: 1 })
    expect(breathAt(INHALE_MS + EXHALE_MS)).toEqual(breathAt(0))
  })

  it('scores holding on the inhale and letting go on the exhale', () => {
    let s = scoreStep(NO_SCORE, true, 'in', 1000)
    s = scoreStep(s, true, 'out', 1000)
    s = scoreStep(s, false, 'out', 2000)
    expect(s).toEqual({ matchedMs: 3000, totalMs: 4000 })
    expect(percent(s)).toBe(75)
    expect(percent(NO_SCORE)).toBe(0)
  })
})
