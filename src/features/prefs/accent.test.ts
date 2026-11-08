import { describe, expect, it } from 'vitest'
import { DEFAULT_ACCENT, hexToRgb, isHex, onAccent } from './accent'
import { loadPrefs, PREFS_KEY } from './prefs'

describe('accent', () => {
  it('only accepts #rrggbb', () => {
    expect(isHex('#ff4b1f')).toBe(true)
    expect(isHex('#FF4B1F')).toBe(true)
    for (const bad of ['ff4b1f', '#f40', 'red', '#gg0000', '', 3, null]) expect(isHex(bad)).toBe(false)
  })

  it('splits a hex into 0..1 channels', () => {
    expect(hexToRgb('#ff0000')).toEqual([1, 0, 0])
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
  })

  it('picks readable text for the colour behind it', () => {
    expect(onAccent('#ff4b1f')).toBe('#0b0b0b') // the default orange keeps the dark text it always had
    expect(onAccent('#ffb000')).toBe('#0b0b0b')
    expect(onAccent('#1e3a8a')).toBe('#ecebe6')
    expect(onAccent('#000000')).toBe('#ecebe6')
    expect(onAccent('#ffffff')).toBe('#0b0b0b')
  })

  it('loads the saved colour, lowercased, and falls back to the default for junk', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ accent: '#38BDF8' }))
    expect(loadPrefs().accent).toBe('#38bdf8')
    localStorage.setItem(PREFS_KEY, JSON.stringify({ accent: 'javascript:alert(1)' }))
    expect(loadPrefs().accent).toBe(DEFAULT_ACCENT)
    localStorage.clear()
    expect(loadPrefs().accent).toBe(DEFAULT_ACCENT)
  })
})
