import { describe, expect, it } from 'vitest'
import { SCENES } from './scenes'

describe('SCENES', () => {
  it('has the six scenes in order', () => {
    expect(SCENES.map((s) => s.id)).toEqual(['esfera', 'toro', 'ondas', 'galaxia', 'reticula', 'giroscopio'])
  })

  it.each(SCENES.map((s) => [s.id, s] as const))('%s builds finite points inside the frame', (_id, scene) => {
    const layers = scene.build()
    expect(layers.length).toBeGreaterThan(0)
    for (const layer of layers) {
      expect(layer.positions.length % 3).toBe(0)
      expect(layer.positions.length / 3).toBeGreaterThan(300)
      // keeps the projected scene inside the focus panel
      for (const v of layer.positions) {
        expect(Number.isFinite(v)).toBe(true)
        expect(Math.abs(v)).toBeLessThanOrEqual(1.7)
      }
    }
  })
})
