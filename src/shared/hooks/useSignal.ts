import { useEffect, useEffectEvent, useRef } from 'react'

/** Runs `onSignal` each time `signal` changes after the first render: a counter bumped elsewhere (a shortcut) as an event. */
export function useSignal(signal: number | undefined, onSignal: () => void): void {
  const run = useEffectEvent(onSignal)
  const last = useRef(signal)
  useEffect(() => {
    if (signal === last.current) return
    last.current = signal
    run()
  }, [signal])
}
