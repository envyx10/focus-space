import { useState } from 'react'

const TILE = 180

/** A tile of luminance noise, made once in the browser: no image to download. */
function noiseTile(): string {
  const c = document.createElement('canvas')
  c.width = c.height = TILE
  const ctx = c.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(TILE, TILE)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL('image/png')
}

/**
 * The room: a flat dark ground with CRT scanlines, and the film grain over it. The grain jumps a few frames a
 * second, like film; reduced motion keeps it still. It sits under the text, never over it: blending a layer
 * over text makes Chrome on Windows drop subpixel antialiasing.
 */
export default function Atmosphere() {
  const [grain] = useState(noiseTile)
  return (
    <>
      <div className="atmo" aria-hidden="true" />
      {/* above the particles (they get the film too), below the words */}
      <div className="grain" aria-hidden="true">
        <div style={grain ? { backgroundImage: `url(${grain})` } : undefined} />
      </div>
    </>
  )
}
