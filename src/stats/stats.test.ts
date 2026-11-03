import { describe, expect, it } from 'vitest'
import { addFocus, formatDuration, loadStats, rangeMs, saveStats, STATS_KEY, streak } from './stats'

const MIN = 60_000
const d = (n: number) => ({ focusMs: n * MIN, sessions: 1 })

describe('stats', () => {
  it('accumulates per day and ignores empty additions', () => {
    let s = addFocus({}, '2026-10-30', 25 * MIN, 1)
    s = addFocus(s, '2026-10-30', 25 * MIN, 1)
    expect(s['2026-10-30']).toEqual({ focusMs: 50 * MIN, sessions: 2 })
    expect(addFocus(s, '2026-10-30', 0, 0)).toBe(s)
  })

  it('sums the last N days including today', () => {
    const s = { '2026-10-30': d(30), '2026-10-25': d(60), '2026-10-20': d(99) }
    expect(rangeMs(s, '2026-10-30', 7)).toBe(90 * MIN)
  })

  it('streak counts back from today, or from yesterday while today is still empty', () => {
    expect(streak({ '2026-10-30': d(5), '2026-10-29': d(5), '2026-10-28': d(5), '2026-10-26': d(5) }, '2026-10-30')).toBe(3)
    expect(streak({ '2026-10-29': d(5), '2026-10-28': d(5) }, '2026-10-30')).toBe(2)
    expect(streak({ '2026-10-20': d(5) }, '2026-10-30')).toBe(0)
  })

  it('drops very old days and survives corrupt storage', () => {
    const s = addFocus({ '2025-01-01': d(1) }, '2026-10-30', MIN, 1)
    expect(s['2025-01-01']).toBeUndefined()
    localStorage.setItem(STATS_KEY, '{"2026-10-30":{"focusMs":"x"},"bad":1,"2026-10-29":{"focusMs":5,"sessions":1}}')
    expect(loadStats()).toEqual({ '2026-10-29': { focusMs: 5, sessions: 1 } })
    saveStats({ '2026-10-30': d(1) })
    expect(loadStats()['2026-10-30']).toBeDefined()
  })

  it('formats durations', () => {
    expect(formatDuration(25 * MIN)).toBe('25 min')
    expect(formatDuration(85 * MIN)).toBe('1 h 25')
  })
})
