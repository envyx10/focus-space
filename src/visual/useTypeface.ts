import { useEffect, useState, type CSSProperties } from 'react'
import { fontHref, typeface, type Typeface } from './typefaces'

/** Resolves once the face's stylesheet is in and its glyphs are downloaded (or failed: never blocks). */
function loadFace(t: Typeface): Promise<unknown> {
  const linkId = `font-${t.id}`
  let link = document.getElementById(linkId) as HTMLLinkElement | null
  const sheet = new Promise<void>((done) => {
    if (link?.sheet) return done()
    if (!link) {
      link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = fontHref(t)
      document.head.appendChild(link)
    }
    link.addEventListener('load', () => done(), { once: true })
    link.addEventListener('error', () => done(), { once: true })
  })
  return sheet.then(() => document.fonts?.load(`${t.italic ? 'italic ' : ''}${t.weight} 1em '${t.family}'`)).catch(() => {})
}

/**
 * Loads the chosen display face on demand and returns the CSS variables that apply it.
 * The previous face stays on screen until the new one is ready, so the clock never flashes the fallback
 * font with the new face's scale and tracking (the "jump" when switching).
 */
export function useTypeface(id: string): CSSProperties {
  const wanted = typeface(id)
  const [t, setT] = useState(wanted)

  useEffect(() => {
    let alive = true
    loadFace(wanted).then(() => alive && setT(wanted))
    return () => {
      alive = false
    }
  }, [wanted])

  return {
    '--display': `'${t.family}', ${t.fallback}`,
    '--display-weight': t.weight,
    '--display-style': t.italic ? 'italic' : 'normal',
    '--display-tracking': t.letterSpacing,
    '--display-scale': t.scale,
  } as CSSProperties
}
