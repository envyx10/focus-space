import { fibonacciSphere } from './sphereMath'

/**
 * One point cloud. Coordinates are in "scene units" (the sphere has radius 1); the renderer
 * rotates them, applies perspective `persp / (persp + z)` and scales to the panel.
 */
export type Layer = {
  positions: number[]
  /** rotation speed multiplier around Y (negative = opposite direction) */
  spin?: number
  /** perspective distance: lower = stronger perspective */
  persp?: number
  /** extra tilt towards the viewer (radians), applied after the spin so the shape turns in place */
  tilt?: number
  /** how much the far side fades out (1 = sphere-like shell, lower keeps open shapes readable) */
  fade?: number
  /** how audio deforms it: 'radial' bristles outwards (rain), 'wave' ripples Y like a surface */
  mode?: 'radial' | 'wave'
}

export type SceneDef = { id: string; label: string; build: () => Layer[] }

const TAU = Math.PI * 2

function rotateX(pts: number[], a: number): number[] {
  const out: number[] = []
  for (let i = 0; i < pts.length; i += 3) {
    const [x, y, z] = [pts[i], pts[i + 1], pts[i + 2]]
    out.push(x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a))
  }
  return out
}

function rotateZ(pts: number[], a: number): number[] {
  const out: number[] = []
  for (let i = 0; i < pts.length; i += 3) {
    const [x, y, z] = [pts[i], pts[i + 1], pts[i + 2]]
    out.push(x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z)
  }
  return out
}

/** Thin band of points on a circle of radius r in the XZ plane. */
function ring(n: number, r: number, width = 0.06): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU
    const rr = r + (Math.random() - 0.5) * width
    out.push(Math.cos(a) * rr, (Math.random() - 0.5) * 0.015, Math.sin(a) * rr)
  }
  return out
}

function torus(n: number, R: number, r: number): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const u = Math.random() * TAU
    const v = Math.random() * TAU
    out.push((R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u))
  }
  return out
}

function plane(cols: number, rows: number, w: number, d: number): number[] {
  const out: number[] = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) out.push((i / (cols - 1) - 0.5) * w, 0, (j / (rows - 1) - 0.5) * d)
  }
  return out
}

function galaxy(n: number, arms: number): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const t = Math.pow(Math.random(), 0.7)
    const r = 0.08 + t * 1.3
    const arm = (i % arms) * (TAU / arms)
    const a = arm + r * 2.6 + (Math.random() - 0.5) * 0.5 * (1 - t * 0.5)
    const thickness = 0.12 * (1 - t) + 0.02
    out.push(Math.cos(a) * r, (Math.random() - 0.5) * thickness, Math.sin(a) * r)
  }
  return out
}

function lattice(per: number, size: number): number[] {
  const out: number[] = []
  for (let i = 0; i < per; i++)
    for (let j = 0; j < per; j++)
      for (let k = 0; k < per; k++) out.push(...[i, j, k].map((v) => (v / (per - 1) - 0.5) * size))
  return out
}

export const SCENES: SceneDef[] = [
  {
    id: 'esfera',
    label: 'Esfera',
    build: () => [
      { positions: fibonacciSphere(4200).flat() },
      // flatter perspective for the ring, otherwise its near side balloons out of the panel
      { positions: rotateX(ring(900, 1.3), 1.15), spin: -0.6, persp: 5 },
    ],
  },
  { id: 'toro', label: 'Toro', build: () => [{ positions: torus(5200, 0.9, 0.34), spin: 0.8, tilt: 0.75, persp: 3.5, fade: 0.45 }] },
  { id: 'ondas', label: 'Ondas', build: () => [{ positions: plane(110, 46, 3.2, 1.8), spin: 0, tilt: 0.45, persp: 3, mode: 'wave', fade: 0.6 }] },
  { id: 'galaxia', label: 'Galaxia', build: () => [{ positions: galaxy(6000, 3), spin: 0.6, tilt: 0.55, persp: 4, fade: 0.3 }] },
  { id: 'reticula', label: 'Retícula', build: () => [{ positions: lattice(13, 1.55), spin: 0.8, persp: 3, fade: 0.55 }] },
  {
    id: 'giroscopio',
    label: 'Giroscopio',
    build: () => [
      { positions: rotateX(ring(800, 1.15, 0.03), 1.2), spin: 1, persp: 4 },
      { positions: rotateZ(rotateX(ring(700, 0.95, 0.03), 0.3), 0.9), spin: -0.8, persp: 4 },
      { positions: rotateZ(ring(600, 0.75, 0.03), -0.7), spin: 0.6, persp: 4 },
      { positions: fibonacciSphere(500).flat().map((v) => v * 0.18) },
    ],
  },
]
