import { describe, expect, it } from 'vitest'
import { fontHref, TYPEFACES } from './typefaces'

describe('TYPEFACES', () => {
  it('offers five display typefaces', () => {
    expect(TYPEFACES.map((t) => t.id)).toEqual(['suiza', 'grotesk', 'syne', 'mono', 'unbounded'])
  })

  it('builds a Google Fonts URL for the family and weight it needs', () => {
    const syne = TYPEFACES.find((t) => t.id === 'syne')!
    expect(fontHref(syne)).toBe('https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap')
  })

  it('can still ask for an italic face', () => {
    const italic = { id: 'x', label: 'X', family: 'Instrument Serif', weight: 400, italic: true, letterSpacing: '0', scale: 1, fallback: 'serif' }
    expect(fontHref(italic)).toBe('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&display=swap')
  })
})
