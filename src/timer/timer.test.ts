import { describe, expect, it } from 'vitest'
import { advance, extend, initialState, pause, POMODORO, remaining, skip, start, withConfig } from './timer'

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
    // and Start runs a fresh session instead of doing nothing
    const again = start(r.state, 12 * MIN)
    expect(again.endsAt).toBe(22 * MIN)
  })

  it('advance on a paused timer does nothing', () => {
    const s = initialState('pomodoro')
    expect(advance(s, 99 * MIN)).toEqual({ state: s, phasesEnded: 0, focusedMs: 0, focusSessions: 0 })
  })
})

describe('timer controls', () => {
  it('autoNext off: the next phase waits, paused, for the user', () => {
    const cfg = { ...POMODORO, autoNext: false }
    const r = advance(start(initialState('pomodoro', 25 * MIN, cfg), 0), 30 * MIN)
    expect(r.phasesEnded).toBe(1)
    expect(r.state.phase).toBe('short')
    expect(r.state.endsAt).toBeNull()
    expect(remaining(r.state, 30 * MIN)).toBe(5 * MIN)
  })

  it('uses the configured durations', () => {
    const cfg = { ...POMODORO, work: 50 * MIN, short: 10 * MIN }
    const r = advance(start(initialState('pomodoro', 25 * MIN, cfg), 0), 50 * MIN)
    expect(r.state.phase).toBe('short')
    expect(remaining(r.state, 50 * MIN)).toBe(10 * MIN)
  })

  it('reports the focus time completed, not the breaks', () => {
    const r = advance(start(initialState('pomodoro'), 0), (25 + 5 + 25) * MIN)
    expect(r.focusSessions).toBe(2)
    expect(r.focusedMs).toBe(50 * MIN)
    expect(advance(start(initialState('free', 40 * MIN), 0), 41 * MIN).focusedMs).toBe(40 * MIN)
  })

  it('extend adds time whether running or paused', () => {
    expect(remaining(extend(start(initialState('pomodoro'), 0), 5 * MIN), 0)).toBe(30 * MIN)
    expect(remaining(extend(initialState('pomodoro'), 5 * MIN), 0)).toBe(30 * MIN)
  })

  it('skip jumps to the next phase, keeps running, and does not count a skipped work block', () => {
    const s = skip(start(initialState('pomodoro'), 0), 10 * MIN)
    expect(s.phase).toBe('short')
    expect(s.completedWork).toBe(0)
    expect(remaining(s, 10 * MIN)).toBe(5 * MIN)
    expect(skip(initialState('pomodoro'), 0).endsAt).toBeNull()
    expect(skip({ ...initialState('pomodoro'), phase: 'short' }, 0).phase).toBe('work')
  })

  it('new durations apply at once to an untouched phase, not to one in progress', () => {
    const cfg = { ...POMODORO, work: 50 * MIN }
    expect(remaining(withConfig(initialState('pomodoro'), cfg), 0)).toBe(50 * MIN)
    const going = start(initialState('pomodoro'), 0)
    expect(remaining(withConfig(going, cfg), 0)).toBe(25 * MIN)
    expect(withConfig(going, cfg).cfg.work).toBe(50 * MIN)
  })
})
