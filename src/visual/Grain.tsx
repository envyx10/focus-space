import { useEffect, useRef } from 'react'

const REFRESH_EVERY = 6
const TILE = 256
const TILES = 4

function noiseTile(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = TILE
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(TILE, TILE)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255
    d[i] = d[i + 1] = d[i + 2] = v
    d[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c
}

export default function Grain() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    // A few pre-generated tiles shown with random offsets: animated grain at ~zero CPU per frame.
    const patterns = Array.from({ length: TILES }, () => ctx.createPattern(noiseTile(), 'repeat')!)
    let frame = 0
    let raf = 0

    const draw = () => {
      // Device pixels: CSS-pixel grain gets upscaled on HiDPI screens and blurs the text underneath.
      const dpr = devicePixelRatio || 1
      const w = Math.round(innerWidth * dpr)
      const h = Math.round(innerHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      const dx = Math.floor(Math.random() * TILE)
      const dy = Math.floor(Math.random() * TILE)
      ctx.setTransform(1, 0, 0, 1, -dx, -dy)
      ctx.fillStyle = patterns[(frame / REFRESH_EVERY) % TILES | 0]
      ctx.fillRect(dx, dy, w, h)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
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
        // Behind the content, without blend modes: a layer composited over text makes Chrome on
        // Windows drop ClearType, which is what made every glyph look soft.
        zIndex: 0,
        opacity: 0.04,
      }}
    />
  )
}
