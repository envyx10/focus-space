import { describe, expect, it } from 'vitest'
import { formatCountdown, formatDateKey, formatTime, pad2 } from './format'

describe('format', () => {
  it('pads to two digits', () => {
    expect(pad2(7)).toBe('07')
    expect(pad2(42)).toBe('42')
  })

  it('rounds a countdown up to the next second', () => {
    expect(formatCountdown(61_000)).toBe('01:01')
    expect(formatCountdown(59_001)).toBe('01:00')
    expect(formatCountdown(0)).toBe('00:00')
  })

  it('formats local time and day keys', () => {
    const d = new Date(2026, 0, 5, 9, 3)
    expect(formatTime(d)).toBe('09:03')
    expect(formatDateKey(d)).toBe('2026-01-05')
  })
})
