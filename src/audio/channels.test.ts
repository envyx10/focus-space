import { describe, expect, it } from 'vitest'
import { CHANNELS } from './channels'

const files = Object.keys(import.meta.glob('../../public/sounds/*.mp3')).map((p) => p.replace('../../public', ''))

describe('channels', () => {
  it('every variant has its loop in public/sounds', () => {
    for (const ch of CHANNELS) for (const v of ch.variants) expect(files, v.src).toContain(v.src)
  })
})
