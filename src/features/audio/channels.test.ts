import { describe, expect, it } from 'vitest'
import { CHANNELS } from './channels'
import { RECIPES, SYNTH_PREFIX } from './synth'

const files = Object.keys(import.meta.glob('/public/sounds/*.mp3')).map((p) => p.replace('/public', ''))

describe('channels', () => {
  it('every variant has its loop in public/sounds, or a recipe if it is generated', () => {
    for (const ch of CHANNELS)
      for (const v of ch.variants) {
        if (v.src.startsWith(SYNTH_PREFIX)) expect(RECIPES, v.src).toHaveProperty([v.src.slice(SYNTH_PREFIX.length)])
        else expect(files, v.src).toContain(v.src)
      }
  })

  it('every generated recipe belongs to a channel variant', () => {
    const used = CHANNELS.flatMap((c) => c.variants.map((v) => v.src))
    for (const name of Object.keys(RECIPES)) expect(used).toContain(SYNTH_PREFIX + name)
  })
})
