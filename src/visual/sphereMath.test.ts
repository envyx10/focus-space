import { describe, expect, it } from 'vitest'
import { easeInOut, fibonacciSphere, follow, lerpInto, smooth } from './sphereMath'

describe('fibonacciSphere', () => {
  it('returns n unit points spanning y from 1 to -1', () => {
    const pts = fibonacciSphere(1600)
    expect(pts).toHaveLength(1600)
    for (const [x, y, z] of pts) expect(Math.hypot(x, y, z)).toBeCloseTo(1, 9)
    expect(pts[0][1]).toBe(1)
    expect(pts[1599][1]).toBe(-1)
  })
})

describe('morph', () => {
  it('eases in and out between 0 and 1', () => {
    expect(easeInOut(0)).toBe(0)
    expect(easeInOut(1)).toBe(1)
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 9)
    expect(easeInOut(0.1)).toBeLessThan(0.1)
    expect(easeInOut(-1)).toBe(0)
    expect(easeInOut(2)).toBe(1)
  })

  it('freezes the in-flight positions so a new switch starts from where particles are', () => {
    const from = new Float32Array([0, 0, 0, 1, 1, 1])
    const to = new Float32Array([2, 2, 2, 3, 3, 3])
    const out = new Float32Array(6)
    lerpInto(out, from, to, 0.25)
    expect([...out]).toEqual([0.5, 0.5, 0.5, 1.5, 1.5, 1.5])
  })
})

describe('follow', () => {
  it('attacks fast and releases slowly, so beats punch without jitter', () => {
    const up = follow(0, 1)
    const down = 1 - follow(1, 0)
    expect(up).toBeCloseTo(0.55, 9)
    expect(down).toBeCloseTo(0.08, 9)
  })
})

describe('smooth', () => {
  it('moves 15% towards the target each frame', () => {
    expect(smooth(0, 1)).toBeCloseTo(0.15, 9)
    expect(smooth(1, 1)).toBe(1)
  })
})
