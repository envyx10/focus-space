import { useEffect, type CSSProperties } from 'react'
import { fontHref, typeface } from './typefaces'

/** Loads the chosen display face on demand and returns the CSS variables that apply it. */
export function useTypeface(id: string): CSSProperties {
  const t = typeface(id)

  useEffect(() => {
    const linkId = `font-${t.id}`
    if (document.getElementById(linkId)) return
    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = fontHref(t)
    document.head.appendChild(link)
  }, [t])

  return {
    '--display': `'${t.family}', ${t.fallback}`,
    '--display-weight': t.weight,
    '--display-style': t.italic ? 'italic' : 'normal',
    '--display-tracking': t.letterSpacing,
    '--display-scale': t.scale,
  } as CSSProperties
}
