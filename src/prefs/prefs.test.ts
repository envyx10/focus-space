import { describe, expect, it } from 'vitest'
import { DEFAULT_PREFS, loadPrefs, PREFS_KEY, savePrefs } from './prefs'

describe('prefs', () => {
  it('defaults: every ambient channel silent until the user raises it', () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
    expect(Object.values(DEFAULT_PREFS.volumes).every((v) => v === 0)).toBe(true)
  })

  it('falls back on corrupt JSON', () => {
    localStorage.setItem(PREFS_KEY, '{nope')
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
  })

  it('fills missing keys from defaults', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, volumes: { rain: 0.2 } }))
    const p = loadPrefs()
    expect(p.volumes).toEqual({ ...DEFAULT_PREFS.volumes, rain: 0.2 })
    expect(p.variants).toEqual(DEFAULT_PREFS.variants)
  })

  it('rejects out-of-range volumes and unknown variants', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, volumes: { rain: 7 }, variants: { rain: 'lava' } }))
    const p = loadPrefs()
    expect(p.volumes.rain).toBe(0)
    expect(p.variants.rain).toBe('suave')
  })


  it('typeface defaults to Mono and rejects unknown ids', () => {
    expect(loadPrefs().font).toBe('mono')
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, font: 'grotesk' }))
    expect(loadPrefs().font).toBe('grotesk')
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, font: 'comic' }))
    expect(loadPrefs().font).toBe('mono')
  })

  it('a saved typeface that no longer exists falls back to the default', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, font: 'editorial' }))
    expect(loadPrefs().font).toBe('mono')
  })

  it('round-trips', () => {
    const p = { ...DEFAULT_PREFS, lofiVolume: 0.3 }
    savePrefs(p)
    expect(loadPrefs().lofiVolume).toBe(0.3)
  })
})

describe('prefs added from the beta feedback', () => {
  it('new options default to the old behaviour', () => {
    const p = loadPrefs()
    expect(p).toMatchObject({ chimeVolume: 0.4, notify: false, calm: false, muted: false, textScale: 'm', lofiStation: 0, scenes: [] })
  })

  it('keeps a saved scene, trimming junk and unknown variants', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ v: 1, scenes: [{ name: ' Examen ', volumes: { rain: 0.5, fire: 9 }, variants: { rain: 'tienda', wind: 'lava' } }, { name: '' }, 3], textScale: 'huge', chimeVolume: 4 }),
    )
    const p = loadPrefs()
    expect(p.scenes).toEqual([{ name: 'Examen', volumes: { ...DEFAULT_PREFS.volumes, rain: 0.5 }, variants: { ...DEFAULT_PREFS.variants, rain: 'tienda' } }])
    expect(p.textScale).toBe('m')
    expect(p.chimeVolume).toBe(0.4)
  })
})
