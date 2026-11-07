import { useCallback, useRef, useState, type UIEvent } from 'react'

/** iOS-style large title: once it scrolls away (past `threshold` px), the compact bar title shows. */
export function useLargeTitle(threshold = 52) {
  const [compact, setCompact] = useState(false)
  const last = useRef(false)
  const onScroll = useCallback(
    (e: UIEvent<HTMLElement>) => {
      const c = e.currentTarget.scrollTop > threshold
      if (c === last.current) return
      last.current = c
      setCompact(c)
    },
    [threshold],
  )
  return { compact, onScroll }
}
