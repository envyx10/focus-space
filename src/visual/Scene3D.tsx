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
import { SCENES, type SceneDef } from './scenes'
import { follow, smooth } from './sphereMath'

type Levels = { bass: number; high: number }
type Props = { scene: string; getLevels: () => Levels | null }

// All projection happens in the shader in CSS pixels, mirroring the approved mockup's math:
// rotate, perspective-scale by persp/(persp+z), place at 68%/48% of the panel.
const vertexShader = /* glsl */ `
  attribute vec2 aRand;
  uniform float uTime;
  uniform float uBass;
  uniform float uHigh;
  uniform float uRadius;
  uniform float uPixelRatio;
  uniform float uSpin;
  uniform float uPersp;
  uniform float uExtent;
  uniform float uWave;
  uniform float uLayerTilt;
  uniform float uFade;
  uniform vec2 uTilt;
  uniform vec2 uCenter;
  uniform vec2 uRes;
  varying float vDepth;
  varying float vNoise;
  varying float vTwinkle;

  void main() {
    // Tiny per-point jitter breaks the moiré of perfectly regular lattices.
    vec3 p = position * (1.0 + (aRand.x - 0.5) * 0.035);
    float n;
    if (uWave > 0.5) {
      // surface: rolling swell driven by bass, fine ripple driven by the high band (rain)
      n = sin(p.x * 2.2 + uTime * 1.1 + p.z * 1.5) * (0.1 + uBass * 0.25)
        + sin(p.x * 6.0 - uTime * 1.7 + p.z * 4.0) * (0.02 + uHigh * 0.12);
      p.y += n;
    } else {
      // volume: "bristle" outwards with the high band
      n = sin(p.x * 6.0 + uTime * 2.0) * cos(p.y * 5.0 - uTime * 1.4) * uHigh * 0.35;
      p *= 1.0 + n;
    }
    float ry = uTime * 0.25 * uSpin + uTilt.x;
    float rx = 0.35 + uLayerTilt + uTilt.y;
    float X = p.x * cos(ry) - p.z * sin(ry);
    float Z = p.x * sin(ry) + p.z * cos(ry);
    float Y = p.y * cos(rx) - Z * sin(rx);
    Z = p.y * sin(rx) + Z * cos(rx);
    float s = uPersp / (uPersp + Z);
    float depth = mix(1.0, clamp((1.0 - Z / uExtent) / 2.0, 0.0, 1.0), uFade);
    vec2 px = uCenter + vec2(X, Y) * uRadius * (1.0 + uBass * 0.16) * s;
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
    // Far side fades out so the near side reads as a crisp shape.
    float alpha = hot ? 0.95 : (0.04 + vDepth * vDepth * 0.8) * vTwinkle;
    gl_FragColor = vec4(color * alpha * disc, 1.0);
  }
`

type Shared = {
  uTime: { value: number }
  uBass: { value: number }
  uHigh: { value: number }
  uRadius: { value: number }
  uPixelRatio: { value: number }
  uTilt: { value: Vector2 }
  uCenter: { value: Vector2 }
  uRes: { value: Vector2 }
}

function buildLayers(def: SceneDef, shared: Shared): Points[] {
  return def.build().map((layer) => {
    const count = layer.positions.length / 3
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(layer.positions, 3))
    geometry.setAttribute('aRand', new Float32BufferAttribute(Array.from({ length: count * 2 }, Math.random), 2))
    const material = new ShaderMaterial({
      // shared uniform objects: the render loop updates them once for every layer
      uniforms: {
        ...shared,
        uSpin: { value: layer.spin ?? 1 },
        uPersp: { value: layer.persp ?? 2.2 },
        uExtent: { value: extent(layer.positions) },
        uWave: { value: layer.mode === 'wave' ? 1 : 0 },
        uLayerTilt: { value: layer.tilt ?? 0 },
        uFade: { value: layer.fade ?? 1 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      blending: AdditiveBlending,
    })
    const points = new Points(geometry, material)
    points.frustumCulled = false
    return points
  })
}

function extent(positions: number[]): number {
  let m = 0
  for (let i = 0; i < positions.length; i += 3) m = Math.max(m, Math.hypot(positions[i], positions[i + 1], positions[i + 2]))
  return m || 1
}

export default function Scene3D({ scene, getLevels }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const levelsRef = useRef(getLevels)
  levelsRef.current = getLevels

  const stage = useRef<{ three: Scene; shared: Shared; draw: () => void } | null>(null)

  // One renderer for the component's lifetime: creating a WebGL context per scene switch can
  // stall Chrome's GPU process for seconds.
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

    const shared: Shared = {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uHigh: { value: 0 },
      uRadius: { value: 1 },
      uPixelRatio: { value: 1 },
      uTilt: { value: new Vector2() },
      uCenter: { value: new Vector2() },
      uRes: { value: new Vector2(1, 1) },
    }
    const three = new Scene()
    const camera = new Camera()
    const draw = () => renderer.render(three, camera)
    stage.current = { three, shared, draw }

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

    // Subtle parallax: the scene leans towards the cursor.
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
      // Without ambient audio (e.g. only the YouTube lofi plays) the scene breathes on its own.
      const target = idle ? { bass: (0.5 + 0.5 * Math.sin(t * 0.6)) * 0.3, high: 0.08 } : live
      lv.bass = follow(lv.bass, target.bass)
      lv.high = follow(lv.high, target.high)
      shared.uTime.value = t
      shared.uBass.value = lv.bass
      shared.uHigh.value = lv.high
      shared.uTilt.value.set(smooth(shared.uTilt.value.x, pointer.x), smooth(shared.uTilt.value.y, pointer.y))
      draw()
    }

    if (still) {
      shared.uBass.value = 0.1
      shared.uHigh.value = 0.08
    } else raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      ro.disconnect()
      stage.current = null
      renderer.dispose()
      canvas.remove()
    }
  }, [])

  // Swap only the point clouds when the scene changes.
  useEffect(() => {
    const st = stage.current
    if (!st) return
    const def = SCENES.find((s) => s.id === scene) ?? SCENES[0]
    const layers = buildLayers(def, st.shared)
    st.three.add(...layers)
    st.draw()
    return () => {
      st.three.remove(...layers)
      for (const layer of layers) {
        layer.geometry.dispose()
        ;(layer.material as ShaderMaterial).dispose()
      }
    }
  }, [scene])

  return <div ref={host} style={{ position: 'absolute', inset: 0 }} />
}
