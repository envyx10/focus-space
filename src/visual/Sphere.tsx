import { useEffect, useRef } from 'react'
import {
  AdditiveBlending,
  BufferGeometry,
  Camera,
  Float32BufferAttribute,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { fibonacciSphere, smooth } from './sphereMath'

type Levels = { bass: number; high: number }
type Props = { getLevels: () => Levels | null }

const SPHERE_POINTS = 4200
const RING_POINTS = 900
const RING_RADIUS = 1.3
const RING_TILT = 1.15

// All projection happens in the shader in CSS pixels, mirroring the approved mockup's math:
// rotate, perspective-scale by 2.2/(2.2+z), place at 68%/48% of the panel.
const vertexShader = /* glsl */ `
  attribute vec2 aRand;
  uniform float uTime;
  uniform float uBass;
  uniform float uHigh;
  uniform float uRadius;
  uniform float uPixelRatio;
  uniform float uSpin;
  uniform float uPersp;
  uniform vec2 uTilt;
  uniform vec2 uCenter;
  uniform vec2 uRes;
  varying float vDepth;
  varying float vNoise;
  varying float vTwinkle;

  void main() {
    // Tiny per-point radius jitter breaks the spiral moiré of a perfect Fibonacci lattice.
    vec3 p = position * (1.0 + (aRand.x - 0.5) * 0.035);
    float n = sin(p.x * 6.0 + uTime * 2.0) * cos(p.y * 5.0 - uTime * 1.4) * uHigh * 0.35;
    p *= 1.0 + n;
    float ry = uTime * 0.25 * uSpin + uTilt.x;
    float rx = 0.35 + uTilt.y;
    float X = p.x * cos(ry) - p.z * sin(ry);
    float Z = p.x * sin(ry) + p.z * cos(ry);
    float Y = p.y * cos(rx) - Z * sin(rx);
    Z = p.y * sin(rx) + Z * cos(rx);
    float s = uPersp / (uPersp + Z);
    float depth = clamp((1.0 - Z / length(position)) / 2.0, 0.0, 1.0);
    vec2 px = uCenter + vec2(X, Y) * uRadius * (1.0 + uBass * 0.12) * s;
    gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);
    gl_PointSize = (1.2 + depth * 2.4) * (0.65 + aRand.y * 0.7) * uPixelRatio;
    vDepth = depth;
    vNoise = n;
    vTwinkle = 0.75 + 0.25 * sin(uTime * (0.6 + aRand.y * 1.4) + aRand.x * 40.0);
  }
`

const fragmentShader = /* glsl */ `
  varying float vDepth;
  varying float vNoise;
  varying float vTwinkle;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = 1.0 - smoothstep(0.28, 0.5, d);
    bool hot = vDepth > 0.82 && vNoise > 0.04;
    vec3 color = hot ? vec3(1.0, 0.294, 0.122) : vec3(0.925, 0.922, 0.902);
    // Back hemisphere fades out so the front reads as a crisp shell.
    float alpha = hot ? 0.95 : (0.04 + vDepth * vDepth * 0.8) * vTwinkle;
    gl_FragColor = vec4(color * alpha * disc, 1.0);
  }
`

function randomPairs(n: number): number[] {
  return Array.from({ length: n * 2 }, Math.random)
}

/** Thin tilted band of points orbiting the sphere. */
function ringPositions(n: number): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const r = RING_RADIUS + (Math.random() - 0.5) * 0.06
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    const y = (Math.random() - 0.5) * 0.015
    // tilt around X
    out.push(x, y * Math.cos(RING_TILT) - z * Math.sin(RING_TILT), y * Math.sin(RING_TILT) + z * Math.cos(RING_TILT))
  }
  return out
}

export default function Sphere({ getLevels }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const levelsRef = useRef(getLevels)
  levelsRef.current = getLevels

  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return // no WebGL (old GPU, tests): the panel just shows the clock
    }
    renderer.setClearColor(0x000000, 0)
    const canvas = renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
    el.appendChild(canvas)

    const shared = {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uHigh: { value: 0 },
      uRadius: { value: 1 },
      uPixelRatio: { value: 1 },
      uTilt: { value: new Vector2() },
      uCenter: { value: new Vector2() },
      uRes: { value: new Vector2(1, 1) },
    }
    // persp: the ring gets flatter perspective, otherwise its near side balloons out of the panel.
    const makeLayer = (positions: number[], count: number, spin: number, persp: number) => {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
      geometry.setAttribute('aRand', new Float32BufferAttribute(randomPairs(count), 2))
      const material = new ShaderMaterial({
        uniforms: { ...shared, uSpin: { value: spin }, uPersp: { value: persp } },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        blending: AdditiveBlending,
      })
      const points = new Points(geometry, material)
      points.frustumCulled = false
      return points
    }
    const sphere = makeLayer(fibonacciSphere(SPHERE_POINTS).flat(), SPHERE_POINTS, 1, 2.2)
    const ring = makeLayer(ringPositions(RING_POINTS), RING_POINTS, -0.6, 5)
    const scene = new Scene()
    scene.add(sphere, ring)
    const camera = new Camera()

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      const pr = Math.min(devicePixelRatio || 1, 2)
      renderer.setPixelRatio(pr)
      renderer.setSize(width, height, false)
      shared.uPixelRatio.value = pr
      shared.uRes.value.set(width, height)
      shared.uCenter.value.set(width * 0.68, height * 0.48)
      shared.uRadius.value = Math.min(width, height) * 0.3
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    // Subtle parallax: the sphere leans towards the cursor.
    const pointer = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / innerWidth - 0.5) * 0.5
      pointer.y = (e.clientY / innerHeight - 0.5) * 0.3
    }
    addEventListener('pointermove', onMove)

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const lv: Levels = { bass: 0, high: 0 }
    let raf = 0
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
      shared.uTime.value = t
      shared.uBass.value = lv.bass
      shared.uHigh.value = lv.high
      shared.uTilt.value.set(smooth(shared.uTilt.value.x, pointer.x), smooth(shared.uTilt.value.y, pointer.y))
      renderer.render(scene, camera)
    }

    if (still) {
      shared.uBass.value = 0.1
      shared.uHigh.value = 0.08
      renderer.render(scene, camera)
    } else raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      ro.disconnect()
      for (const layer of [sphere, ring]) {
        layer.geometry.dispose()
        ;(layer.material as ShaderMaterial).dispose()
      }
      renderer.dispose()
      canvas.remove()
    }
  }, [])

  return <div ref={host} style={{ position: 'absolute', inset: 0 }} />
}
