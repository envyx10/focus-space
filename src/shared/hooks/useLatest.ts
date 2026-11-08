import { useLayoutEffect, useRef, type RefObject } from 'react'

/**
 * A ref that always holds the latest `value`, for callbacks that live longer than one render (timers, listeners,
 * animation frames). Updated after each commit, before any effect runs, never during render.
 */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value)
  useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}
