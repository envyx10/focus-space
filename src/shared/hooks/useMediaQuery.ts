import { useSyncExternalStore } from 'react'

/** A media query as React state. Without matchMedia (tests, very old browsers) it is false: the desktop tree. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = globalThis.matchMedia?.(query)
      mq?.addEventListener?.('change', onChange)
      return () => mq?.removeEventListener?.('change', onChange)
    },
    () => globalThis.matchMedia?.(query).matches ?? false,
    () => false,
  )
}
