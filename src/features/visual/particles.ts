import { DataTexture, FloatType, RGBAFormat } from 'three'
import { fibonacciSphere } from './sphereMath'

// 256² = 65 536 particles, simulated entirely on the GPU (position + velocity textures).
// Fewer particles on weak CPUs and on touch devices (phones: battery).
export const SIDE = typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency ?? 8) <= 4 || globalThis.matchMedia?.('(pointer: coarse)').matches) ? 180 : 256
export const COUNT = SIDE * SIDE
export const CAMERA_Z = 5.3
export const FOV = 30
/** How far the sphere rises in the breathing guide (fraction of the panel's height). */
export const BREATH_Y = 0.16
/** Share of the frame height the unit sphere spans at CAMERA_Z (~0.717). */
export const SPHERE_SPAN = Math.tan(Math.asin(1 / CAMERA_Z)) / Math.tan((FOV / 2) * (Math.PI / 180))
/** Fixed simulation step: keeps it stable even when the tab is throttled. */
export const STEP = 1 / 60

/** Starting positions close to the shape: a short, calm gather instead of a long fast flight. w is a per-particle seed. */
export function scattered(n: number): Float32Array {
  const out = new Float32Array(n * 4)
  for (let i = 0; i < n; i++) {
    const r = 1.4 + Math.random() * 0.8
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    out.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th), Math.random()], i * 4)
  }
  return out
}

/** One particle per spot on the sphere, a hair of radial depth so it reads as a shell, not a grid. */
export function sphereTexture(): DataTexture {
  const data = new Float32Array(COUNT * 4)
  fibonacciSphere(COUNT).forEach(([x, y, z], i) => {
    const r = 1 + (Math.random() - 0.5) * 0.03
    data.set([x * r, y * r, z * r, 1], i * 4)
  })
  const t = new DataTexture(data, SIDE, SIDE, RGBAFormat, FloatType)
  t.needsUpdate = true
  return t
}
