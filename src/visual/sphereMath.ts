const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const EMA = 0.15

/** Evenly spread unit vectors on a sphere (Fibonacci lattice), from the north pole down. */
export function fibonacciSphere(n: number): [number, number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const th = i * GOLDEN_ANGLE
    return [Math.cos(th) * r, y, Math.sin(th) * r]
  })
}

/** Cubic ease-in-out, clamped to 0..1. */
export function easeInOut(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

/** out = from + (to - from) * t, element-wise. */
export function lerpInto(out: Float32Array, from: Float32Array, to: Float32Array, t: number): void {
  for (let i = 0; i < out.length; i++) out[i] = from[i] + (to[i] - from[i]) * t
}

/** Envelope follower: jumps towards louder levels (beats punch) and eases back down. */
export function follow(current: number, target: number): number {
  return current + (target - current) * (target > current ? 0.55 : 0.08)
}

/** Exponential moving average step, so audio spikes don't make the sphere jitter. */
export function smooth(current: number, target: number): number {
  return current + (target - current) * EMA
}
