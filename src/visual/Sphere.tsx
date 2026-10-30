import { useEffect, useRef } from 'react'
import { fibonacciSphere, smooth } from './sphereMath'

type Levels = { bass: number; high: number }
type Props = { getLevels: () => Levels | null }

const POINTS = fibonacciSphere(1600)
const FG = '236,235,230'
const ACCENT = 'rgba(255,75,31,.95)'

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, lv: Levels) {
  ctx.clearRect(0, 0, w, h)
  const cx = w * 0.68
  const cy = h * 0.48
  const R = Math.min(w, h) * 0.34 * (1 + lv.bass * 0.12)
  const ry = t * 0.25
  const rx = 0.35
  const unit = Math.min(w, h) / 600
  for (const [px, py, pz] of POINTS) {
    // "bristle": surface noise driven by the high band (rain hiss)
    const n = Math.sin(px * 6 + t * 2) * Math.cos(py * 5 - t * 1.4) * lv.high * 0.35
    const x = px * (1 + n)
    const y = py * (1 + n)
    const z = pz * (1 + n)
    const X = x * Math.cos(ry) - z * Math.sin(ry)
    let Z = x * Math.sin(ry) + z * Math.cos(ry)
    const Y = y * Math.cos(rx) - Z * Math.sin(rx)
    Z = y * Math.sin(rx) + Z * Math.cos(rx)
    const s = 2.2 / (2.2 + Z)
    const depth = (1 - Z) / 2
    ctx.fillStyle = depth > 0.82 && n > 0.04 ? ACCENT : `rgba(${FG},${0.12 + depth * 0.75})`
    const size = (1.2 + depth * 2.6) * unit
    ctx.fillRect(cx + X * R * s, cy + Y * R * s, size, size)
  }
}

export default function Sphere({ getLevels }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const levelsRef = useRef(getLevels)
  levelsRef.current = getLevels

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const lv: Levels = { bass: 0, high: 0 }
    let raf = 0

    const fit = () => {
      const r = canvas.getBoundingClientRect()
      const d = devicePixelRatio || 1
      const w = Math.round(r.width * d)
      const h = Math.round(r.height * d)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }

    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame)
      if (document.hidden) return
      const t = ms / 1000
      const live = levelsRef.current()
      const idle = !live || (live.bass < 0.01 && live.high < 0.01)
      // Without ambient audio (e.g. only the YouTube lofi plays) the sphere breathes on its own.
      const target = idle ? { bass: (0.5 + 0.5 * Math.sin(t * 0.6)) * 0.3, high: 0.08 } : live
      lv.bass = smooth(lv.bass, target.bass)
      lv.high = smooth(lv.high, target.high)
      fit()
      draw(ctx, canvas.width, canvas.height, t, lv)
    }

    if (still) {
      fit()
      draw(ctx, canvas.width, canvas.height, 0, { bass: 0.1, high: 0.08 })
    } else raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={ref} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
}
