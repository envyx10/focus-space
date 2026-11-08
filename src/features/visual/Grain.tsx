import { useEffect, useRef } from 'react'

const TILE = 256

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

/** A still layer of fine grain: it only keeps the dark background from looking flat, so it never moves. */
export default function Grain() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const pattern = ctx.createPattern(noiseTile(), 'repeat')!

    const draw = () => {
      // Device pixels: CSS-pixel grain gets upscaled on HiDPI screens and blurs the text underneath.
      const dpr = devicePixelRatio || 1
      canvas.width = Math.round(innerWidth * dpr)
      canvas.height = Math.round(innerHeight * dpr)
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    draw()
    addEventListener('resize', draw)
    return () => removeEventListener('resize', draw)
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
        opacity: 0.02,
      }}
    />
  )
}
