import { useCallback, useEffect, useRef, useState } from 'react'
import { chime, notifyPhase, phaseLabel } from './alerts'
import { advance, extend, initialState, pause, remaining, reset, skip, start, withConfig, type TimerConfig, type TimerMode, type TimerState } from './timer'
import { loadTimerStore, saveTimerStore, todayKey } from './timerStore'

const MIN = 60_000
const EXTEND_MS = 5 * MIN

export type TimerStatus = 'running' | 'paused' | 'waiting' | 'idle'

type Options = {
  chimeVolume: number
  notify: boolean
  /** Focus time completed (Pomodoro work blocks, free sessions), for the stats. */
  onFocus?: (focusedMs: number, sessions: number) => void
}

export function useTimer({ chimeVolume, notify, onFocus }: Options) {
  const [store, setStore] = useState(() => loadTimerStore(todayKey()))
  const [state, setState] = useState<TimerState>(() => store.timer ?? initialState('pomodoro', store.freeMinutes * MIN, store.config))
  const [now, setNow] = useState(() => Date.now())
  // A phase ended and the next waits for the user (auto-start off).
  const [awaiting, setAwaiting] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state
  const opts = useRef({ chimeVolume, notify, onFocus })
  opts.current = { chimeVolume, notify, onFocus }

  useEffect(() => saveTimerStore({ ...store, timer: state }), [store, state])

  useEffect(() => {
    if (state.endsAt === null) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      const s = stateRef.current
      const r = advance(s, t)
      if (r.phasesEnded === 0) return
      const o = opts.current
      chime(o.chimeVolume)
      if (o.notify) notifyPhase(`${phaseLabel(r.state.mode, s.phase)} terminado`, r.state.mode === 'free' ? 'Sesión completada.' : `Siguiente: ${phaseLabel(r.state.mode, r.state.phase)}`)
      if (r.focusedMs > 0 || r.focusSessions > 0) o.onFocus?.(r.focusedMs, r.focusSessions)
      const worked = r.state.completedWork - s.completedWork
      if (worked > 0) setStore((st) => ({ ...st, completedWork: st.completedWork + worked }))
      setAwaiting(r.state.endsAt === null)
      stateRef.current = r.state
      setState(r.state)
    }, 250)
    return () => clearInterval(id)
  }, [state.endsAt])

  const startT = useCallback(() => {
    const t = Date.now()
    setNow(t)
    setAwaiting(false)
    setState((s) => start(s, t))
  }, [])
  const pauseT = useCallback(() => setState((s) => pause(s, Date.now())), [])
  const resetT = useCallback(() => {
    setAwaiting(false)
    setState((s) => reset(s))
  }, [])
  const skipT = useCallback(() => {
    const t = Date.now()
    setNow(t)
    setAwaiting(false)
    setState((s) => skip(s, t))
  }, [])
  const extendT = useCallback(() => {
    setAwaiting(false)
    setState((s) => extend(s, EXTEND_MS))
  }, [])
  const setMode = useCallback(
    (m: TimerMode) => {
      setAwaiting(false)
      setState((s) => (s.mode === m ? s : initialState(m, store.freeMinutes * MIN, store.config)))
    },
    [store.freeMinutes, store.config],
  )
  const setFreeMinutes = useCallback((min: number) => {
    setStore((st) => ({ ...st, freeMinutes: min }))
    setState((s) => (s.mode === 'free' && s.endsAt === null ? initialState('free', min * MIN, s.cfg) : s))
  }, [])
  const setConfig = useCallback((config: TimerConfig) => {
    setStore((st) => ({ ...st, config }))
    setState((s) => withConfig(s, config))
  }, [])

  const running = state.endsAt !== null
  const status: TimerStatus = running ? 'running' : awaiting ? 'waiting' : state.pausedRemainingMs < state.durationMs ? 'paused' : 'idle'

  return {
    state,
    remainingMs: remaining(state, now),
    running,
    status,
    awaiting,
    config: store.config,
    freeMinutes: store.freeMinutes,
    sessionNumber: store.completedWork + 1,
    start: startT,
    pause: pauseT,
    reset: resetT,
    skip: skipT,
    extend: extendT,
    setMode,
    setFreeMinutes,
    setConfig,
  }
}
