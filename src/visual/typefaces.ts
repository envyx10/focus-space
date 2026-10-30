/** Typefaces for the clock only. Everything else stays in Inter Tight. */
export type Typeface = {
  id: string
  label: string
  family: string
  weight: number
  italic?: boolean
  /** tracking tuned per face so digits neither touch nor drift apart */
  letterSpacing: string
  /** size factor so every face spans roughly the same width (measured "25:00" + colon + MIN) */
  scale: number
  fallback: string
}

export const TYPEFACES: Typeface[] = [
  { id: 'suiza', label: 'Suiza', family: 'Inter Tight', weight: 700, letterSpacing: '-0.045em', scale: 1, fallback: 'sans-serif' },
  { id: 'grotesk', label: 'Grotesk', family: 'Space Grotesk', weight: 600, letterSpacing: '-0.05em', scale: 1.1, fallback: 'sans-serif' },
  { id: 'syne', label: 'Syne', family: 'Syne', weight: 700, letterSpacing: '-0.03em', scale: 0.91, fallback: 'sans-serif' },
  { id: 'editorial', label: 'Editorial', family: 'Instrument Serif', weight: 400, italic: true, letterSpacing: '-0.02em', scale: 1.44, fallback: 'serif' },
  { id: 'mono', label: 'Mono', family: 'JetBrains Mono', weight: 700, letterSpacing: '-0.06em', scale: 1.1, fallback: 'monospace' },
  { id: 'unbounded', label: 'Unbounded', family: 'Unbounded', weight: 600, letterSpacing: '-0.04em', scale: 0.85, fallback: 'sans-serif' },
]

export function fontHref(t: Typeface): string {
  const axis = t.italic ? 'ital@1' : `wght@${t.weight}`
  return `https://fonts.googleapis.com/css2?family=${t.family.replace(/ /g, '+')}:${axis}&display=swap`
}

export function typeface(id: string): Typeface {
  return TYPEFACES.find((t) => t.id === id) ?? TYPEFACES[0]
}
