import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CHANNELS } from './channels'

describe('channels', () => {
  it('every variant has its loop in public/sounds', () => {
    for (const ch of CHANNELS) for (const v of ch.variants) expect(existsSync(`public${v.src}`), v.src).toBe(true)
  })
})
