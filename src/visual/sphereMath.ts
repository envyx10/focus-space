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

/** Exponential moving average step, so audio spikes don't make the sphere jitter. */
export function smooth(current: number, target: number): number {
  return current + (target - current) * EMA
}
