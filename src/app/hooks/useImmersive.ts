import { useCallback, useEffect, useState } from 'react'

/** Focus mode: everything but the clock hides, and the page goes fullscreen where the browser allows it. */
export function useImmersive() {
  const [immersive, setImmersive] = useState(false)

  const enter = useCallback(() => {
    setImmersive(true)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }, [])

  const exit = useCallback(() => {
    setImmersive(false)
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }, [])

  // Leaving fullscreen with the browser's own Esc also leaves immersion.
  useEffect(() => {
    const onChange = () => !document.fullscreenElement && setImmersive(false)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  return { immersive, enter, exit }
}
