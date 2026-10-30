import { describe, expect, it } from 'vitest'
import { SCENES, sceneTargets } from './scenes'

describe('sceneTargets', () => {
  it.each(SCENES.map((s) => s.id))('%s resamples to exactly n finite points inside the frame', (id) => {
    const t = sceneTargets(id, 40_000)
    expect(t).toBeInstanceOf(Float32Array)
    expect(t.length).toBe(120_000)
    for (const v of t) {
      expect(Number.isFinite(v)).toBe(true)
      expect(Math.abs(v)).toBeLessThanOrEqual(1.75)
    }
  })

  it('falls back to the sphere for an unknown id', () => {
    expect(sceneTargets('nope', 10).length).toBe(30)
  })
})

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
