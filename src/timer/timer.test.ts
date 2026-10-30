import { describe, expect, it } from 'vitest'
import { advance, initialState, pause, POMODORO, remaining, start } from './timer'

const MIN = 60_000

describe('timer', () => {
  it('pomodoro starts with 25 min work', () => {
    const s = start(initialState('pomodoro'), 0)
    expect(s.phase).toBe('work')
    expect(remaining(s, 0)).toBe(25 * MIN)
  })

  it('work → short break after 25 min', () => {
    const r = advance(start(initialState('pomodoro'), 0), 25 * MIN)
    expect(r.state.phase).toBe('short')
    expect(r.phasesEnded).toBe(1)
    expect(r.state.completedWork).toBe(1)
    expect(remaining(r.state, 25 * MIN)).toBe(5 * MIN)
  })

  it('4th work block leads to long break', () => {
    const s = { ...start(initialState('pomodoro'), 0), completedWork: 3 }
    const r = advance(s, 25 * MIN)
    expect(r.state.phase).toBe('long')
    expect(r.state.durationMs).toBe(POMODORO.long)
    expect(r.state.durationMs).toBe(15 * MIN)
  })

  it('background tab: one tick crossing several phases', () => {
    const r = advance(start(initialState('pomodoro'), 0), (25 + 5 + 10) * MIN)
    expect(r.state.phase).toBe('work')
    expect(r.state.completedWork).toBe(1)
    expect(r.phasesEnded).toBe(2)
    expect(remaining(r.state, (25 + 5 + 10) * MIN)).toBe(15 * MIN)
  })

  it('pause keeps remaining', () => {
    const s = pause(start(initialState('pomodoro'), 0), MIN)
    expect(remaining(s, 999_999)).toBe(24 * MIN)
    expect(remaining(start(s, 2_000_000), 2_000_000)).toBe(24 * MIN)
  })

  it('free mode stops at zero', () => {
    const r = advance(start(initialState('free', 10 * MIN), 0), 11 * MIN)
    expect(r.state.endsAt).toBeNull()
    expect(remaining(r.state, 11 * MIN)).toBe(0)
    expect(r.phasesEnded).toBe(1)
  })

  it('advance on a paused timer does nothing', () => {
    const s = initialState('pomodoro')
    expect(advance(s, 99 * MIN)).toEqual({ state: s, phasesEnded: 0 })
  })
})
