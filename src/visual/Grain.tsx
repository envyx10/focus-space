import { useEffect, useRef } from 'react'

const REFRESH_EVERY = 6

export default function Grain() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let raf = 0

    const draw = () => {
      const w = innerWidth
      const h = innerHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      const img = ctx.createImageData(w, h)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255
        d[i] = d[i + 1] = d[i + 2] = v
        d[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
    }

    const loop = () => {
      if (!document.hidden && frame % REFRESH_EVERY === 0) draw()
      frame++
      raf = requestAnimationFrame(loop)
    }

    if (still) draw()
    else raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50,
        opacity: 0.045,
        mixBlendMode: 'overlay',
      }}
    />
  )
}
