import { useEffect, useRef } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  PerspectiveCamera,
  Points,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import { noiseGlsl } from './shaders/noise'
import { hexToRgb } from '../prefs/accent'
import { fibonacciSphere, follow, smooth } from './sphereMath'

type Levels = { bass: number; high: number }
type Props = {
  getLevels: () => Levels | null
  /** Highlight colour: the glowing particles take it. */
  accent: string
  /** Light page: CSS inverts the canvas into ink, which reads paler than light on black, so the dots get denser. */
  light?: boolean
}

// 256² = 65 536 particles, simulated entirely on the GPU (position + velocity textures).
const SIDE = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 8) <= 4 ? 180 : 256
const COUNT = SIDE * SIDE
const CAMERA_Z = 5.3
const FOV = 30 // 30° (was 35°): the sphere a touch bigger
// Share of the frame height the unit sphere spans at CAMERA_Z (~0.717).
const SPHERE_SPAN = Math.tan(Math.asin(1 / CAMERA_Z)) / Math.tan((FOV / 2) * (Math.PI / 180))
const STEP = 1 / 60

// Velocity: a spring towards the particle's spot on the shape + a curl-noise current. The
// current is what draws the silky streams; beats turn it up.
const velocityShader = /* glsl */ `
  uniform float uTime;
  uniform float uDelta;
  uniform float uFlow;
  uniform float uStir;
  uniform sampler2D tTarget;
  ${noiseGlsl}

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 posSeed = texture2D(texturePosition, uv);
    vec3 pos = posSeed.xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    vec3 target = texture2D(tTarget, uv).xyz;

    vec3 spring = (target - pos) * mix(5.5, 1.2, uStir);
    vec3 flow = curl(pos * 0.85 + vec3(0.0, uTime * 0.06, uTime * 0.025)) * (uFlow + uStir * 1.6);
    vel += (spring + flow) * uDelta;
    vel *= pow(0.04, uDelta); // strong damping: smooth, never jittery
    gl_FragColor = vec4(vel, 1.0);
  }
`

const positionShader = /* glsl */ `
  uniform float uDelta;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 p = texture2D(texturePosition, uv);
    vec3 v = texture2D(textureVelocity, uv).xyz;
    gl_FragColor = vec4(p.xyz + v * uDelta, p.w);
  }
`

const renderVertex = /* glsl */ `
  attribute vec2 aRef;
  uniform sampler2D tPosition;
  uniform sampler2D tVelocity;
  uniform float uPixelRatio;
  uniform float uIntro;
  uniform float uLight;
  varying float vAlpha;
  varying float vHeat;
  varying float vAccent;
  varying float vRim;

  void main() {
    vec4 p = texture2D(tPosition, aRef);
    vec3 v = texture2D(tVelocity, aRef).xyz;
    vec4 mv = modelViewMatrix * vec4(p.xyz, 1.0);
    gl_Position = projectionMatrix * mv;
    float seed = p.w;
    gl_PointSize = (0.7 + seed * seed * 0.8) * uPixelRatio * (${CAMERA_Z.toFixed(1)} / -mv.z);
    float depth = clamp((${(CAMERA_Z + 1.4).toFixed(1)} + mv.z) / 2.8, 0.0, 1.0); // 1 = nearest
    // Lights fixed to the camera, so the sphere turns under them: a soft key from the upper
    // left and a warm back light grazing the lower right edge. Unlit side stays near-dark.
    vec3 n = normalize(mat3(modelViewMatrix) * p.xyz);
    // Light page: the canvas is inverted, so density reads as ink, not light. Turning the key to the opposite side
    // puts the ink on the shadow side, like pencil shading, instead of a photographic negative.
    vec3 keyDir = uLight > 0.5 ? vec3(0.6, -0.55, 0.6) : vec3(-0.6, 0.55, 0.6);
    float key = smoothstep(-0.15, 1.0, dot(n, normalize(keyDir)));
    // only particles already on the shell catch the warm light: no orange specks while gathering
    float onShell = 1.0 - smoothstep(0.04, 0.25, abs(length(p.xyz) - 1.0));
    vRim = pow(max(dot(n, normalize(vec3(0.75, -0.45, -0.5))), 0.0), 2.0) * onShell * uIntro * uIntro;
    vAlpha = 0.05 + depth * depth * 0.22 + key * key * 0.6 + vRim * 0.4;
    // no motion-colour while the field first assembles: it would read as stray orange sparks
    vHeat = smoothstep(0.35, 1.6, length(v)) * uIntro * uIntro;
    vAccent = step(0.965, fract(seed * 91.7));
  }
`

const renderFragment = /* glsl */ `
  uniform float uIntro;
  uniform float uGain;
  uniform vec3 uAccent;
  varying float vAlpha;
  varying float vHeat;
  varying float vAccent;
  varying float vRim;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float disc = 1.0 - smoothstep(0.32, 0.5, d); // crisp dot, just antialiased
    vec3 warm = vec3(0.86, 0.85, 0.81);
    vec3 ember = uAccent;
    // fast-moving particles and a few seeds glow in the accent colour: motion reads as colour
    vec3 col = mix(warm, ember, max(max(vHeat * 0.85, vAccent * uIntro), vRim * 0.85));
    float a = min(1.0, disc * vAlpha * (0.5 + vHeat * 0.4) * 0.7 * uIntro * uGain);
    gl_FragColor = vec4(col * a, a); // premultiplied
  }
`

function scattered(n: number): Float32Array {
  const out = new Float32Array(n * 4)
  for (let i = 0; i < n; i++) {
    // close to the shape: a short, calm gather instead of a long fast flight
    const r = 1.4 + Math.random() * 0.8
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    out.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th), Math.random()], i * 4)
  }
  return out
}

// One particle per spot on the sphere, a hair of radial depth so it reads as a shell, not a grid.
function sphereTexture(): DataTexture {
  const data = new Float32Array(COUNT * 4)
  fibonacciSphere(COUNT).forEach(([x, y, z], i) => {
    const r = 1 + (Math.random() - 0.5) * 0.03
    data.set([x * r, y * r, z * r, 1], i * 4)
  })
  const t = new DataTexture(data, SIDE, SIDE, RGBAFormat, FloatType)
  t.needsUpdate = true
  return t
}

export default function Scene3D({ getLevels, accent, light = false }: Props) {
  const lightRef = useRef(light)
  lightRef.current = light
  const host = useRef<HTMLDivElement>(null)
  const levelsRef = useRef(getLevels)
  levelsRef.current = getLevels
  const accentRef = useRef(accent)
  accentRef.current = accent

  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: WebGLRenderer
    try {
      // Transparent canvas, no post-processing: the panel keeps its own background (no grey haze).
      renderer = new WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' })
    } catch {
      return // no WebGL (old GPU, tests): the panel just shows the clock
    }
    renderer.setClearColor(0x000000, 0)
    const canvas = renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
    el.appendChild(canvas)

    const gpu = new GPUComputationRenderer(SIDE, SIDE, renderer)
    const pos0 = gpu.createTexture()
    ;(pos0.image.data as Float32Array).set(scattered(COUNT))
    const vel0 = gpu.createTexture()
    const velVar = gpu.addVariable('textureVelocity', velocityShader, vel0)
    const posVar = gpu.addVariable('texturePosition', positionShader, pos0)
    gpu.setVariableDependencies(velVar, [posVar, velVar])
    gpu.setVariableDependencies(posVar, [posVar, velVar])
    const target = sphereTexture()
    const sim = {
      uTime: { value: 0 },
      uDelta: { value: STEP },
      uFlow: { value: 0.25 },
      uStir: { value: 1 },
      tTarget: { value: target },
    }
    Object.assign(velVar.material.uniforms, sim)
    posVar.material.uniforms.uDelta = sim.uDelta
    if (gpu.init() !== null) {
      // float render targets unsupported: show nothing rather than garbage
      renderer.dispose()
      canvas.remove()
      return
    }

    const refs = new Float32Array(COUNT * 2)
    for (let i = 0; i < COUNT; i++) refs.set([((i % SIDE) + 0.5) / SIDE, (Math.floor(i / SIDE) + 0.5) / SIDE], i * 2)
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(COUNT * 3), 3))
    geometry.setAttribute('aRef', new BufferAttribute(refs, 2))
    const uniforms = {
      tPosition: { value: gpu.getCurrentRenderTarget(posVar).texture },
      tVelocity: { value: gpu.getCurrentRenderTarget(velVar).texture },
      uPixelRatio: { value: 1 },
      uIntro: { value: 0 },
      uGain: { value: 1 },
      uLight: { value: 0 },
      uAccent: { value: new Vector3(...hexToRgb(accent)) },
    }
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: renderVertex,
      fragmentShader: renderFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      premultipliedAlpha: true,
    })
    const points = new Points(geometry, material)
    points.frustumCulled = false
    const three = new Scene()
    three.add(points)
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 50)
    camera.position.set(0, 0, CAMERA_Z)

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      const pr = Math.min(devicePixelRatio || 1, 2)
      renderer.setPixelRatio(pr)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      if (matchMedia('(max-width: 1023px)').matches) {
        // Phone: centred, 80% of the panel's width but never taller than 90% of its height (landscape, tablets).
        camera.setViewOffset(width, height, 0, 0, width, height)
        camera.zoom = Math.min(0.8 * width, 0.9 * height) / (SPHERE_SPAN * height)
      } else {
        // Scene centre at 68% / 48% of the panel, beside the clock.
        camera.setViewOffset(width, height, -0.18 * width, 0.02 * height, width, height)
        camera.zoom = 1
      }
      camera.updateProjectionMatrix()
      uniforms.uPixelRatio.value = pr * 1.08 // dots grow with the sphere so it stays as dense
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const pointer = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / innerWidth - 0.5) * 0.6
      pointer.y = (e.clientY / innerHeight - 0.5) * 0.35
    }
    addEventListener('pointermove', onMove)

    const lv: Levels = { bass: 0, high: 0 }
    const tilt = { x: 0, y: 0 }
    let spin = 0
    let raf = 0
    let last = performance.now()
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches

    const step = (t: number) => {
      sim.uTime.value = t
      gpu.compute()
    }
    const draw = () => {
      uniforms.tPosition.value = gpu.getCurrentRenderTarget(posVar).texture
      uniforms.tVelocity.value = gpu.getCurrentRenderTarget(velVar).texture
      uniforms.uAccent.value.set(...hexToRgb(accentRef.current))
      uniforms.uGain.value = lightRef.current ? 2.2 : 1
      uniforms.uLight.value = lightRef.current ? 1 : 0
      renderer.render(three, camera)
    }

    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame)
      if (document.hidden) return
      const elapsed = Math.min(0.25, (ms - last) / 1000)
      last = ms
      const t = ms / 1000
      const live = levelsRef.current()
      const idle = !live || (live.bass < 0.01 && live.high < 0.01)
      const goal = idle ? { bass: (0.5 + 0.5 * Math.sin(t * 0.5)) * 0.15, high: 0.04 } : live
      lv.bass = follow(lv.bass, goal.bass)
      lv.high = follow(lv.high, goal.high)
      sim.uFlow.value = 0.14 + lv.bass * 0.9 + lv.high * 0.3
      sim.uStir.value *= Math.pow(0.35, elapsed)
      // fade in over ~2.5 s of real time while the particles assemble
      uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + elapsed / 2.5)
      // fixed-size steps keep the simulation stable even when the tab is throttled
      const steps = Math.max(1, Math.min(4, Math.round(elapsed / STEP)))
      for (let i = 0; i < steps; i++) step(t)
      tilt.x = smooth(tilt.x, pointer.x)
      tilt.y = smooth(tilt.y, pointer.y)
      spin += elapsed * (0.08 + lv.bass * 0.12)
      points.rotation.set(0.35 + tilt.y, spin + tilt.x, 0)
      draw()
    }

    if (still) {
      // settle the particles onto the shape, then hold a single frame
      sim.uStir.value = 0
      for (let i = 0; i < 240; i++) step(i * STEP)
      uniforms.uIntro.value = 1
      draw()
    } else raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      ro.disconnect()
      target.dispose()
      gpu.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [])

  return <div ref={host} style={{ position: 'absolute', inset: 0 }} />
}
