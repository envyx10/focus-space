import { useCallback, useEffect, useRef, useState } from 'react'
import { advance, initialState, pause, remaining, reset, start, type TimerMode, type TimerState } from './timer'
import { loadTimerStore, saveTimerStore, todayKey } from './timerStore'

const MIN = 60_000

function chime() {
  const a = new Audio('/sounds/chime.mp3')
  a.volume = 0.4
  a.play().catch(() => {})
}

export function useTimer() {
  const [store, setStore] = useState(() => loadTimerStore(todayKey()))
  const [state, setState] = useState<TimerState>(() => initialState('pomodoro', store.freeMinutes * MIN))
  const [now, setNow] = useState(() => Date.now())
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => saveTimerStore(store), [store])

  useEffect(() => {
    if (state.endsAt === null) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      const s = stateRef.current
      const r = advance(s, t)
      if (r.phasesEnded === 0) return
      chime()
      const worked = r.state.completedWork - s.completedWork
      if (worked > 0) setStore((st) => ({ ...st, completedWork: st.completedWork + worked }))
      stateRef.current = r.state
      setState(r.state)
    }, 250)
    return () => clearInterval(id)
  }, [state.endsAt])

  const startT = useCallback(() => {
    const t = Date.now()
    setNow(t)
    setState((s) => start(s, t))
  }, [])
  const pauseT = useCallback(() => setState((s) => pause(s, Date.now())), [])
  const resetT = useCallback(() => setState((s) => reset(s)), [])
  const setMode = useCallback(
    (m: TimerMode) => setState((s) => (s.mode === m ? s : initialState(m, store.freeMinutes * MIN))),
    [store.freeMinutes],
  )
  const setFreeMinutes = useCallback((min: number) => {
    setStore((st) => ({ ...st, freeMinutes: min }))
    setState((s) => (s.mode === 'free' && s.endsAt === null ? initialState('free', min * MIN) : s))
  }, [])

  return {
    state,
    remainingMs: remaining(state, now),
    running: state.endsAt !== null,
    freeMinutes: store.freeMinutes,
    sessionNumber: store.completedWork + 1,
    start: startT,
    pause: pauseT,
    reset: resetT,
    setMode,
    setFreeMinutes,
  }
}
