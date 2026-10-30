import { describe, expect, it } from 'vitest'
import { DEFAULT_PREFS, loadPrefs, PREFS_KEY, savePrefs } from './prefs'

describe('prefs', () => {
  it('defaults: every ambient channel silent until the user raises it', () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
    expect(DEFAULT_PREFS.volumes).toEqual({ rain: 0, fire: 0, cafe: 0, wind: 0 })
  })

  it('falls back on corrupt JSON', () => {
    localStorage.setItem(PREFS_KEY, '{nope')
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
  })

  it('fills missing keys from defaults', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, volumes: { rain: 0.2 } }))
    const p = loadPrefs()
    expect(p.volumes).toEqual({ rain: 0.2, fire: 0, cafe: 0, wind: 0 })
    expect(p.variants).toEqual(DEFAULT_PREFS.variants)
  })

  it('rejects out-of-range volumes and unknown variants', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, volumes: { rain: 7 }, variants: { rain: 'lava' } }))
    const p = loadPrefs()
    expect(p.volumes.rain).toBe(0)
    expect(p.variants.rain).toBe('suave')
  })


  it('typeface defaults to Syne and rejects unknown ids', () => {
    expect(loadPrefs().font).toBe('syne')
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, font: 'mono' }))
    expect(loadPrefs().font).toBe('mono')
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, font: 'comic' }))
    expect(loadPrefs().font).toBe('syne')
  })

  it('round-trips', () => {
    const p = { ...DEFAULT_PREFS, lofiVolume: 0.3 }
    savePrefs(p)
    expect(loadPrefs().lofiVolume).toBe(0.3)
  })
})
