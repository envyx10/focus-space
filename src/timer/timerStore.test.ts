import { describe, expect, it } from 'vitest'
import { loadTimerStore, saveTimerStore, TIMER_KEY } from './timerStore'

describe('timerStore', () => {
  it('defaults when empty', () => {
    expect(loadTimerStore('2026-10-30')).toEqual({ day: '2026-10-30', completedWork: 0, freeMinutes: 25 })
  })

  it('survives corrupt storage', () => {
    localStorage.setItem(TIMER_KEY, '{nope')
    expect(loadTimerStore('2026-10-30').completedWork).toBe(0)
  })

  it('keeps today count, resets on a new day but keeps free minutes', () => {
    saveTimerStore({ day: '2026-10-30', completedWork: 3, freeMinutes: 50 })
    expect(loadTimerStore('2026-10-30').completedWork).toBe(3)
    expect(loadTimerStore('2026-10-31')).toEqual({ day: '2026-10-31', completedWork: 0, freeMinutes: 50 })
  })
})
