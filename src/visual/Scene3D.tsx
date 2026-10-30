import { useEffect, useRef } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { sceneTargets } from './scenes'
import { easeInOut, follow, lerpInto, smooth } from './sphereMath'

type Levels = { bass: number; high: number }
type Props = { scene: string; getLevels: () => Levels | null }

const COUNT = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 8) <= 4 ? 22_000 : 40_000
const MORPH_SECONDS = 1.9
const CAMERA_Z = 5.3

// Ashima Arts 3D simplex noise (MIT), used to build a divergence-free curl flow field.
const noiseGlsl = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  vec3 potential(vec3 p) {
    return vec3(snoise(p), snoise(p + vec3(31.4, 17.2, 5.9)), snoise(p + vec3(-11.3, 47.7, 23.1)));
  }
  vec3 curl(vec3 p) {
    const float e = 0.12;
    vec3 dx = vec3(e, 0.0, 0.0), dy = vec3(0.0, e, 0.0), dz = vec3(0.0, 0.0, e);
    vec3 px0 = potential(p - dx), px1 = potential(p + dx);
    vec3 py0 = potential(p - dy), py1 = potential(p + dy);
    vec3 pz0 = potential(p - dz), pz1 = potential(p + dz);
    return vec3(
      (py1.z - py0.z) - (pz1.y - pz0.y),
      (pz1.x - pz0.x) - (px1.z - px0.z),
      (px1.y - px0.y) - (py1.x - py0.x)
    ) / (2.0 * e);
  }
`

const vertexShader = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec4 aRand; // x: size, y: phase, z: accent, w: flow speed
  uniform float uTime;
  uniform float uMorph;
  uniform float uScatter;
  uniform float uBass;
  uniform float uHigh;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vAccent;
  ${noiseGlsl}

  void main() {
    vec3 base = mix(aFrom, aTo, uMorph);
    // Particles drift along a slow curl-noise current; beats and scene changes stir it up.
    vec3 flow = curl(base * 1.1 + vec3(0.0, uTime * 0.07 * (0.6 + aRand.w), uTime * 0.03));
    // curl magnitude runs ~0..3: calm drift at rest, real turbulence only on beats and morphs
    float amp = 0.006 + uBass * 0.035 + uScatter * 0.3;
    vec3 p = base + flow * amp;
    p *= 1.0 + uBass * 0.07;
    // high band (rain, hats) makes the surface shimmer
    p += normalize(base + 1e-4) * sin(uTime * 7.0 + aRand.y * 40.0) * uHigh * 0.025;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = (0.45 + aRand.x * 0.9) * (1.0 + uBass * 0.5);
    gl_PointSize = size * uPixelRatio * (9.0 / -mv.z);
    // nearer particles brighter: reads as depth through the bloom
    vAlpha = clamp(1.25 - (-mv.z - ${CAMERA_Z - 1.4}) / 2.8, 0.12, 1.0);
    vAccent = aRand.z;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uBass;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    float core = exp(-d2 * 22.0);
    vec3 warm = vec3(0.96, 0.94, 0.9);
    vec3 accent = vec3(1.0, 0.32, 0.13);
    vec3 col = mix(warm, accent, vAccent);
    float a = core * vAlpha * (0.26 + uBass * 0.35 + vAccent * 0.45);
    gl_FragColor = vec4(col * a, 1.0);
  }
`

/** Random cloud the particles assemble from on first load. */
function scattered(n: number): Float32Array {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const r = 2.2 + Math.random() * 1.6
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    out.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3)
  }
  return out
}

export default function Scene3D({ scene, getLevels }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const levelsRef = useRef(getLevels)
  levelsRef.current = getLevels
  const morphTo = useRef<((id: string) => void) | null>(null)
  const pending = useRef(scene)

  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    } catch {
      return // no WebGL (old GPU, tests): the panel just shows the clock
    }
    // Pure black survives any colour-space conversion in the post chain; `screen` blending then
    // lets the panel's own background show through and the particles only add light.
    renderer.setClearColor(0x000000, 1)
    const canvas = renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen'
    el.appendChild(canvas)

    const from = scattered(COUNT)
    const to = sceneTargets(pending.current, COUNT)
    const rand = new Float32Array(COUNT * 4)
    for (let i = 0; i < COUNT; i++) {
      rand.set([Math.random() ** 2, Math.random(), Math.random() < 0.055 ? 1 : 0, Math.random()], i * 4)
    }
    const geometry = new BufferGeometry()
    // `position` is required by three for bounds; the shader only reads aFrom/aTo.
    geometry.setAttribute('position', new BufferAttribute(to, 3))
    const fromAttr = new BufferAttribute(from, 3)
    const toAttr = new BufferAttribute(to, 3)
    geometry.setAttribute('aFrom', fromAttr)
    geometry.setAttribute('aTo', toAttr)
    geometry.setAttribute('aRand', new BufferAttribute(rand, 4))

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uScatter: { value: 0 },
      uBass: { value: 0 },
      uHigh: { value: 0 },
      uPixelRatio: { value: 1 },
    }
    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    const points = new Points(geometry, material)
    points.frustumCulled = false
    const three = new Scene()
    three.add(points)

    const camera = new PerspectiveCamera(35, 1, 0.1, 50)
    camera.position.set(0, 0, CAMERA_Z)
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(three, camera))
    // threshold keeps the sparse cloud dark; only dense shells and accents glow
    const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.7, 0.5, 0.22)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      const pr = Math.min(devicePixelRatio || 1, 1.75)
      renderer.setPixelRatio(pr)
      renderer.setSize(width, height, false)
      composer.setPixelRatio(pr)
      composer.setSize(width, height)
      uniforms.uPixelRatio.value = pr * (height / 700)
      camera.aspect = width / height
      // Place the scene's centre at 68% / 48% of the panel, beside the clock.
      camera.setViewOffset(width, height, -0.18 * width, 0.02 * height, width, height)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    // Morph state: progress 0..1 from `from` to `to`.
    let progress = 0
    const frozen = new Float32Array(COUNT * 3)
    morphTo.current = (id: string) => {
      lerpInto(frozen, from, to, easeInOut(progress))
      from.set(frozen)
      to.set(sceneTargets(id, COUNT))
      fromAttr.needsUpdate = true
      toAttr.needsUpdate = true
      progress = 0
    }

    const pointer = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / innerWidth - 0.5) * 0.6
      pointer.y = (e.clientY / innerHeight - 0.5) * 0.35
    }
    addEventListener('pointermove', onMove)

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const lv: Levels = { bass: 0, high: 0 }
    const tilt = { x: 0, y: 0 }
    let raf = 0
    let last = performance.now()
    let spin = 0
    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame)
      if (document.hidden) return
      // Real elapsed time (capped at 0.5 s): a throttled tab must still finish its morph.
      const dt = Math.min(0.5, (ms - last) / 1000)
      last = ms
      const t = ms / 1000
      progress = Math.min(1, progress + dt / MORPH_SECONDS)
      const live = levelsRef.current()
      const idle = !live || (live.bass < 0.01 && live.high < 0.01)
      // Without audio the field breathes on its own.
      const target = idle ? { bass: (0.5 + 0.5 * Math.sin(t * 0.6)) * 0.25, high: 0.05 } : live
      lv.bass = follow(lv.bass, target.bass)
      lv.high = follow(lv.high, target.high)
      tilt.x = smooth(tilt.x, pointer.x)
      tilt.y = smooth(tilt.y, pointer.y)
      spin += dt * (0.1 + lv.bass * 0.15)
      points.rotation.set(0.35 + tilt.y, spin + tilt.x, 0)
      uniforms.uTime.value = t
      uniforms.uMorph.value = easeInOut(progress)
      uniforms.uScatter.value = Math.sin(Math.PI * progress) * (progress < 1 ? 1 : 0)
      uniforms.uBass.value = lv.bass
      uniforms.uHigh.value = lv.high
      bloom.strength = 0.55 + lv.bass * 0.8
      composer.render()
    }

    if (still) {
      progress = 1
      uniforms.uMorph.value = 1
      composer.render()
    } else raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      ro.disconnect()
      morphTo.current = null
      geometry.dispose()
      material.dispose()
      bloom.dispose()
      composer.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [])

  // Scene switch: particles swirl out of the current shape and reassemble into the new one.
  useEffect(() => {
    if (pending.current === scene) return
    pending.current = scene
    morphTo.current?.(scene)
  }, [scene])

  return <div ref={host} style={{ position: 'absolute', inset: 0 }} />
}
