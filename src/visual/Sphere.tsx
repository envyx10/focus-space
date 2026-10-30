import { useEffect, useRef } from 'react'
import { BufferGeometry, Camera, Float32BufferAttribute, Points, Scene, ShaderMaterial, Vector2, WebGLRenderer } from 'three'
import { fibonacciSphere, smooth } from './sphereMath'

type Levels = { bass: number; high: number }
type Props = { getLevels: () => Levels | null }

const POINT_COUNT = 4200

// All projection happens in the shader in CSS pixels, mirroring the approved mockup's math:
// rotate, perspective-scale by 2.2/(2.2+z), place at 68%/48% of the panel.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBass;
  uniform float uHigh;
  uniform float uRadius;
  uniform float uPixelRatio;
  uniform vec2 uCenter;
  uniform vec2 uRes;
  varying float vDepth;
  varying float vNoise;

  void main() {
    vec3 p = position;
    float n = sin(p.x * 6.0 + uTime * 2.0) * cos(p.y * 5.0 - uTime * 1.4) * uHigh * 0.35;
    p *= 1.0 + n;
    float ry = uTime * 0.25;
    float rx = 0.35;
    float X = p.x * cos(ry) - p.z * sin(ry);
    float Z = p.x * sin(ry) + p.z * cos(ry);
    float Y = p.y * cos(rx) - Z * sin(rx);
    Z = p.y * sin(rx) + Z * cos(rx);
    float s = 2.2 / (2.2 + Z);
    float depth = (1.0 - Z) / 2.0;
    vec2 px = uCenter + vec2(X, Y) * uRadius * (1.0 + uBass * 0.12) * s;
    gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);
    gl_PointSize = (1.5 + depth * 2.3) * uPixelRatio;
    vDepth = depth;
    vNoise = n;
  }
`

const fragmentShader = /* glsl */ `
  varying float vDepth;
  varying float vNoise;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = 1.0 - smoothstep(0.3, 0.5, d);
    bool hot = vDepth > 0.82 && vNoise > 0.04;
    vec3 color = hot ? vec3(1.0, 0.294, 0.122) : vec3(0.925, 0.922, 0.902);
    // Back hemisphere fades out so the front reads as a crisp shell.
    float alpha = hot ? 0.95 : 0.05 + vDepth * vDepth * 0.95;
    gl_FragColor = vec4(color, disc * alpha);
  }
`

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

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(fibonacciSphere(POINT_COUNT).flat(), 3))
    const uniforms = {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uHigh: { value: 0 },
      uRadius: { value: 1 },
      uPixelRatio: { value: 1 },
      uCenter: { value: new Vector2() },
      uRes: { value: new Vector2(1, 1) },
    }
    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthTest: false })
    const points = new Points(geometry, material)
    points.frustumCulled = false
    const scene = new Scene()
    scene.add(points)
    const camera = new Camera()

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      const pr = Math.min(devicePixelRatio || 1, 2)
      renderer.setPixelRatio(pr)
      renderer.setSize(width, height, false)
      uniforms.uPixelRatio.value = pr
      uniforms.uRes.value.set(width, height)
      uniforms.uCenter.value.set(width * 0.68, height * 0.48)
      uniforms.uRadius.value = Math.min(width, height) * 0.34
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

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
      uniforms.uTime.value = t
      uniforms.uBass.value = lv.bass
      uniforms.uHigh.value = lv.high
      renderer.render(scene, camera)
    }

    if (still) {
      uniforms.uBass.value = 0.1
      uniforms.uHigh.value = 0.08
      renderer.render(scene, camera)
    } else raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [])

  return <div ref={host} style={{ position: 'absolute', inset: 0 }} />
}
