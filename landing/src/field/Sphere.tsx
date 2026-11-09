import { useEffect, useRef, useState } from 'react'

/** Mounts the app's sphere after the first paint: the words are on screen before three.js arrives. */
export default function Sphere() {
  const host = useRef<HTMLDivElement>(null)
  const [webgl, setWebgl] = useState(true)

  useEffect(() => {
    let cleanup: (() => void) | null = null
    let cancelled = false
    const t = setTimeout(() => {
      import('./AppSphere').then(({ mountSphere }) => {
        if (cancelled || !host.current) return
        cleanup = mountSphere(host.current)
        if (!cleanup) setWebgl(false)
      })
    }, 60)
    return () => {
      cancelled = true
      clearTimeout(t)
      cleanup?.()
    }
  }, [])

  return <div ref={host} className={webgl ? 'sphere' : 'sphere sphere--static'} aria-hidden="true" />
}
