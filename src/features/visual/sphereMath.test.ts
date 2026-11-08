import { describe, expect, it } from 'vitest'
import { fibonacciSphere, follow, smooth } from './sphereMath'

describe('fibonacciSphere', () => {
  it('returns n unit points spanning y from 1 to -1', () => {
    const pts = fibonacciSphere(1600)
    expect(pts).toHaveLength(1600)
    for (const [x, y, z] of pts) expect(Math.hypot(x, y, z)).toBeCloseTo(1, 9)
    expect(pts[0][1]).toBe(1)
    expect(pts[1599][1]).toBe(-1)
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
