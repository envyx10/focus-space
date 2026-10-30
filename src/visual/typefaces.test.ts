import { describe, expect, it } from 'vitest'
import { fontHref, TYPEFACES } from './typefaces'

describe('TYPEFACES', () => {
  it('offers six display typefaces', () => {
    expect(TYPEFACES.map((t) => t.id)).toEqual(['suiza', 'grotesk', 'syne', 'editorial', 'mono', 'unbounded'])
  })

  it('builds a Google Fonts URL for the family and weight it needs', () => {
    const syne = TYPEFACES.find((t) => t.id === 'syne')!
    expect(fontHref(syne)).toBe('https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap')
    const editorial = TYPEFACES.find((t) => t.id === 'editorial')!
    expect(fontHref(editorial)).toBe('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&display=swap')
  })
})
