import { describe, expect, it } from 'vitest'
import { bandLevels } from './levels'

describe('bandLevels', () => {
  it('silence is zero', () => {
    expect(bandLevels(new Uint8Array(512))).toEqual({ bass: 0, high: 0 })
  })

  it('full low bins → bass 1, high 0', () => {
    // 48 kHz / 1024 fft → 46.875 Hz per bin; bins 0..5 are < 250 Hz
    const d = new Uint8Array(512)
    for (let i = 0; i < 6; i++) d[i] = 255
    expect(bandLevels(d)).toEqual({ bass: 1, high: 0 })
  })

  it('full high bins → high 1, bass 0', () => {
    const d = new Uint8Array(512)
    for (let i = 43; i < 512; i++) d[i] = 255
    expect(bandLevels(d)).toEqual({ bass: 0, high: 1 })
  })
})
