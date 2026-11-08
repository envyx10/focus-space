import { useEffect, useEffectEvent, type RefObject } from 'react'

/** While `open`, a press outside `root` or the Escape key calls `onDismiss`: how popovers close. */
export function useDismiss(root: RefObject<HTMLElement | null>, open: boolean, onDismiss: () => void): void {
  const dismiss = useEffectEvent(onDismiss)
  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) dismiss()
    }
    addEventListener('pointerdown', close)
    addEventListener('keydown', close)
    return () => {
      removeEventListener('pointerdown', close)
      removeEventListener('keydown', close)
    }
  }, [root, open])
}
