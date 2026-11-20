import { AdditiveBlending, BufferAttribute, BufferGeometry, HalfFloatType, Matrix4, PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3, WebGLRenderer } from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import { hexToRgb } from '@/features/prefs/accent'
import { CAMERA_Z, COUNT, FOV, SIDE, STEP, scattered, sphereTexture } from '@/features/visual/particles'
import { particleFragment as appFragment, particleVertex } from '@/features/visual/shaders/particles'
import { follow, smooth } from '@/features/visual/sphereMath'
import { field, type SceneId } from './scenes'
import { positionShader, velocityShader } from './sim'

type Place = { cx: number; cy: number; d: number; phone: { cy: number; d: number } }
// chapter 04: the sphere stays behind the clock, at the centre of the room, as in the app
const feature: Place = { cx: 0.525, cy: 0.5, d: 0.62, phone: { cy: 0.5, d: 0.3 } }

/** Where the sphere stands in each chapter that shows it: centre (share of the viewport), diameter (share of its height). */
export const PLACES: Partial<Record<SceneId, Place & { trail?: number }>> = {
  hero: { cx: 0.5, cy: 0.33, d: 0.44, phone: { cy: 0.27, d: 0.34 }, trail: 1 },
  'f-timer': feature,
  'f-tasks': feature,
  'f-sound': feature,
  'f-focus': feature,
  'f-personal': feature,
  'f-mobile': feature,
  breathe: { cx: 0.7, cy: 0.42, d: 0.62, phone: { cy: 0.26, d: 0.36 } },
}
// The details and the close leave the stage to the words.

// The app's fragment shader, a touch brighter: here the sphere has the whole black page to itself.
const particleFragment = appFragment.replace('uniform float uIntro;', 'uniform float uIntro; uniform float uGain;').replace('* 0.7 * uIntro', '* uGain * uIntro')

/**
 * The app's sphere (same particles, same GPU simulation, same shaders) drawn on a canvas the size of the
 * window, so its currents never hit an edge. It glides between chapters; the pointer parts it.
 * Returns a cleanup, or null without usable WebGL.
 */
export function mountSphere(host: HTMLElement): (() => void) | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)
  const fail = () => {
    renderer.dispose()
    canvas.remove()
    return null
  }

  const gpu = new GPUComputationRenderer(SIDE, SIDE, renderer)
  if (!renderer.extensions.has('EXT_color_buffer_float')) {
    if (!renderer.extensions.has('EXT_color_buffer_half_float')) return fail()
    gpu.setDataType(HalfFloatType)
  }
  const pos0 = gpu.createTexture()
  ;(pos0.image.data as Float32Array).set(scattered(COUNT))
  const velVar = gpu.addVariable('textureVelocity', velocityShader, gpu.createTexture())
  const posVar = gpu.addVariable('texturePosition', positionShader, pos0)
  gpu.setVariableDependencies(velVar, [posVar, velVar])
  gpu.setVariableDependencies(posVar, [posVar, velVar])
  const target = sphereTexture()
  const sim = {
    uTime: { value: 0 },
    uDelta: { value: STEP },
    uFlow: { value: 0.25 },
    uStir: { value: 1 },
    uPointer: { value: new Vector3(99, 99, 99) },
    uPush: { value: 0 },
    uTrail: { value: 0 },
    uTrailDir: { value: new Vector3(1, 0, 0) },
    tTarget: { value: target },
  }
  Object.assign(velVar.material.uniforms, sim)
  Object.assign(posVar.material.uniforms, { uDelta: sim.uDelta, uTrail: sim.uTrail, uTrailDir: sim.uTrailDir, tTarget: sim.tTarget })
  if (gpu.init() !== null) return fail()

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
    uFill: { value: -2 },
    uFillMix: { value: 0 },
    uGain: { value: 1.3 },
    uAccent: { value: new Vector3(...hexToRgb(field.accent)) },
  }
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
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

  const gentle = matchMedia('(prefers-reduced-motion: reduce)')
  const half = { w: 1, h: 1 }
  const resize = () => {
    const pr = Math.min(devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pr)
    renderer.setSize(innerWidth, innerHeight, false)
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    half.h = Math.tan((FOV / 2) * (Math.PI / 180)) * CAMERA_Z
    half.w = half.h * camera.aspect
  }
  resize()
  addEventListener('resize', resize)

  const hand = { x: 0, y: 0, moved: -1e9, inside: false }
  const onMove = (e: PointerEvent) => {
    hand.x = (e.clientX / innerWidth) * 2 - 1
    hand.y = -(e.clientY / innerHeight) * 2 + 1
    hand.moved = performance.now()
    hand.inside = true
  }
  const onLeave = () => (hand.inside = false)
  addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)

  const ray = new Vector3()
  const inverse = new Matrix4()
  const where = { x: 0, y: 0, r: 0.5, vis: 0, set: false }
  const lv = { bass: 0, high: 0 }
  const tilt = { x: 0, y: 0 }
  let spin = 0
  let raf = 0
  let last = performance.now()

  const step = (t: number) => {
    sim.uTime.value = t
    gpu.compute()
  }
  if (gentle.matches) {
    sim.uStir.value = 0
    for (let i = 0; i < 240; i++) step(i * STEP)
  }

  const frame = (ms: number) => {
    raf = requestAnimationFrame(frame)
    if (document.hidden) return void (last = ms)
    const dt = Math.min(0.1, (ms - last) / 1000)
    last = ms
    const calm = gentle.matches
    const place = PLACES[field.scene]

    // where it stands: diameter as a share of the window height (capped by the width on phones)
    if (place) {
      const phone = innerWidth <= 820
      const p = phone ? { cx: 0.5, ...place.phone } : place
      const d = Math.min(p.d, phone ? (0.86 * innerWidth) / innerHeight : Infinity)
      const tx = (p.cx - 0.5) * 2 * half.w
      const ty = -(p.cy - 0.5) * 2 * half.h
      // the breathing guide: from a little over half its size on the out-breath to full on the in-breath
      const tr = d * half.h * (field.breath === null ? 1 : 0.55 + 0.45 * field.breath)
      const k = !where.set || calm ? 1 : 1 - Math.exp(-dt * 2.2)
      where.x += (tx - where.x) * k
      where.y += (ty - where.y) * k
      // the breath is followed closely (it is already eased); moves between chapters glide
      where.r += (tr - where.r) * (field.breath === null ? k : 1 - Math.exp(-dt * 10))
      where.set = true
    }
    where.vis += ((place ? 1 : 0) - where.vis) * (calm ? 1 : 1 - Math.exp(-dt * 3))
    if (where.vis < 0.01 && !place) return void renderer.clear()

    const t = ms / 1000
    // no sound on the page: the app's idle breath, a slow swell of the current
    const goal = { bass: calm ? 0.04 : (0.5 + 0.5 * Math.sin(t * 0.5)) * 0.15, high: 0.04 }
    lv.bass = follow(lv.bass, goal.bass)
    lv.high = follow(lv.high, goal.high)
    sim.uFlow.value = 0.14 + lv.bass * 0.9 + lv.high * 0.3
    sim.uStir.value *= Math.pow(0.35, dt)
    sim.uTrail.value += ((place?.trail && !calm ? 1 : 0) - sim.uTrail.value) * 0.05
    uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + dt / 2.5)

    if (!calm) {
      tilt.x = smooth(tilt.x, hand.inside ? hand.x * 0.3 : 0)
      tilt.y = smooth(tilt.y, hand.inside ? -hand.y * 0.18 : 0)
    }
    spin += dt * (0.08 + lv.bass * 0.12)
    points.position.set(where.x, where.y, 0)
    points.scale.setScalar(where.r)
    points.rotation.set(0.35 + tilt.y, spin + tilt.x, 0)
    points.updateMatrixWorld()
    inverse.copy(points.matrixWorld).invert()
    // the trail blows to the right of the screen whatever way the sphere has turned
    sim.uTrailDir.value.set(1, 0.08, 0).transformDirection(inverse)

    const moving = !calm && hand.inside && ms - hand.moved < 700
    sim.uPush.value += ((moving ? 1 : 0) - sim.uPush.value) * 0.08
    if (sim.uPush.value > 0.01) {
      ray.set(hand.x, hand.y, 0.5).unproject(camera).sub(camera.position).normalize()
      sim.uPointer.value.copy(camera.position).addScaledVector(ray, -camera.position.z / ray.z)
      points.worldToLocal(sim.uPointer.value)
    }

    const steps = Math.max(1, Math.min(4, Math.round(dt / STEP)))
    for (let i = 0; i < steps; i++) step(t)
    const pr = Math.min(devicePixelRatio || 1, 2)
    // dots grow with the sphere, as in the app, so it stays as dense at any size
    uniforms.uPixelRatio.value = pr * 1.08 * Math.max(0.7, where.r / 0.72)
    uniforms.uAccent.value.set(...hexToRgb(field.accent))
    uniforms.tPosition.value = gpu.getCurrentRenderTarget(posVar).texture
    uniforms.tVelocity.value = gpu.getCurrentRenderTarget(velVar).texture
    material.opacity = where.vis
    uniforms.uGain.value = 1.3 * where.vis
    renderer.render(three, camera)
  }
  raf = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(raf)
    removeEventListener('resize', resize)
    removeEventListener('pointermove', onMove)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    target.dispose()
    gpu.dispose()
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    canvas.remove()
  }
}
