import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, initialState, start } from './timer'
import { loadTimerStore, parseConfig, saveTimerStore, TIMER_KEY } from './timerStore'

const MIN = 60_000

describe('timerStore', () => {
  it('defaults when empty', () => {
    expect(loadTimerStore('2026-10-30')).toEqual({ day: '2026-10-30', completedWork: 0, freeMinutes: 25, config: DEFAULT_CONFIG, timer: null })
  })

  it('survives corrupt storage', () => {
    localStorage.setItem(TIMER_KEY, '{nope')
    expect(loadTimerStore('2026-10-30').completedWork).toBe(0)
  })

  it('keeps today count, resets on a new day but keeps free minutes', () => {
    saveTimerStore({ day: '2026-10-30', completedWork: 3, freeMinutes: 50, config: DEFAULT_CONFIG, timer: null })
    expect(loadTimerStore('2026-10-30').completedWork).toBe(3)
    expect(loadTimerStore('2026-10-31')).toMatchObject({ day: '2026-10-31', completedWork: 0, freeMinutes: 50 })
  })

  it('brings back a running timer after a reload', () => {
    const running = start(initialState('pomodoro'), 1_000_000)
    saveTimerStore({ day: '2026-10-30', completedWork: 0, freeMinutes: 25, config: DEFAULT_CONFIG, timer: running })
    const back = loadTimerStore('2026-10-30').timer
    expect(back).toEqual(running)
    expect(back?.endsAt).toBe(1_000_000 + 25 * MIN)
  })

  it('drops a corrupt saved timer instead of crashing', () => {
    localStorage.setItem(TIMER_KEY, JSON.stringify({ day: '2026-10-30', timer: { mode: 'pomodoro', phase: 'nope', durationMs: 5 } }))
    expect(loadTimerStore('2026-10-30').timer).toBeNull()
  })

  it('rejects out-of-range durations but keeps valid ones', () => {
    expect(parseConfig({ work: 50 * MIN, short: 999 * MIN, long: 'x', longEvery: 1, autoNext: false })).toEqual({
      ...DEFAULT_CONFIG,
      work: 50 * MIN,
      autoNext: false,
    })
  })
})
