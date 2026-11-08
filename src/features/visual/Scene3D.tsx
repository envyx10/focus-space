import { useEffect, useRef } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, HalfFloatType, PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3, WebGLRenderer } from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import { breathing } from '@/features/break/breath'
import { hexToRgb } from '@/features/prefs/accent'
import { particleFragment, particleVertex } from '@/features/visual/shaders/particles'
import { positionShader, velocityShader } from '@/features/visual/shaders/simulation'
import { useLatest } from '@/shared/hooks/useLatest'
import { BREATH_Y, CAMERA_Z, COUNT, FOV, SIDE, SPHERE_SPAN, STEP, scattered, sphereTexture } from './particles'
import { follow, smooth } from './sphereMath'

type Levels = { bass: number; high: number }
type Props = {
  getLevels: () => Levels | null
  /** Highlight colour: the glowing particles take it. */
  accent: string
  /** Stop simulating and drawing (the phone shell's Focus tab is not on screen). The particles resume where they were. */
  paused?: boolean
}

export default function Scene3D({ getLevels, accent, paused = false }: Props) {
  const pausedRef = useLatest(paused)
  // Redraws at once when the accent changes, even while paused.
  const redraw = useRef<(() => void) | null>(null)
  useEffect(() => redraw.current?.(), [accent])
  const host = useRef<HTMLDivElement>(null)
  const levelsRef = useLatest(getLevels)
  const accentRef = useLatest(accent)

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
    // Many phone GPUs can't draw into 32-bit float textures, only 16-bit ones: without this the simulation
    // never advances there. Half floats are plenty for positions on a unit sphere.
    if (!renderer.extensions.has('EXT_color_buffer_float')) {
      if (!renderer.extensions.has('EXT_color_buffer_half_float')) {
        renderer.dispose()
        canvas.remove()
        return
      }
      gpu.setDataType(HalfFloatType)
    }
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
      uFill: { value: -2 },
      uFillMix: { value: 0 },
      uAccent: { value: new Vector3(...hexToRgb(accentRef.current)) },
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

    // Reduced motion: no gathering flight, no beat bursts and no following the pointer, but it still turns slowly
    // with a faint current, so it reads as alive instead of a frozen picture.
    const gentle = matchMedia('(prefers-reduced-motion: reduce)').matches
    // The breathing guide's breath. Reduced motion included: opened on purpose, it swells and shrinks the sphere as
    // much as the flat square it replaces would have moved.
    const breath = () => breathing.size
    const view = { w: 1, h: 1, x: 0, baseX: 0, y: 0, baseY: 0 }
    const aim = () => camera.setViewOffset(view.w, view.h, view.x * view.w, view.y * view.h, view.w, view.h)
    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      const pr = Math.min(devicePixelRatio || 1, 2)
      renderer.setPixelRatio(pr)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      if (matchMedia('(max-width: 1023px)').matches) {
        // Phone: centred, 80% of the panel's width but never taller than 90% of its height (landscape, tablets).
        Object.assign(view, { w: width, h: height, x: 0, baseX: 0, y: breath() === null ? 0 : BREATH_Y, baseY: 0 })
        camera.zoom = Math.min(0.8 * width, 0.9 * height) / (SPHERE_SPAN * height)
      } else {
        // Scene centre at 68% / 48% of the panel, beside the clock.
        Object.assign(view, { w: width, h: height, x: breath() === null ? -0.18 : 0, baseX: -0.18, y: breath() === null ? 0.02 : BREATH_Y, baseY: 0.02 })
        camera.zoom = 1
      }
      aim()
      camera.updateProjectionMatrix()
      uniforms.uPixelRatio.value = pr * 1.08 // dots grow with the sphere so it stays as dense
      // Resizing the canvas throws its picture away, and until something is drawn again phones show the old
      // frame stretched to the new shape (turning the phone flattened the sphere). Redraw straight away.
      if (ready) draw()
    }
    let ready = false
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

    const step = (t: number) => {
      sim.uTime.value = t
      gpu.compute()
    }
    const draw = () => {
      uniforms.tPosition.value = gpu.getCurrentRenderTarget(posVar).texture
      uniforms.tVelocity.value = gpu.getCurrentRenderTarget(velVar).texture
      uniforms.uAccent.value.set(...hexToRgb(accentRef.current))
      renderer.render(three, camera)
    }

    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame)
      if (document.hidden) return
      // Paused: skip the work, and restart the clock so the first frame back doesn't jump by the time away.
      if (pausedRef.current) return void (last = ms)
      const elapsed = Math.min(0.25, (ms - last) / 1000)
      last = ms
      const t = ms / 1000
      const live = gentle ? null : levelsRef.current()
      const idle = !live || (live.bass < 0.01 && live.high < 0.01)
      const goal = idle ? { bass: gentle ? 0.04 : (0.5 + 0.5 * Math.sin(t * 0.5)) * 0.15, high: 0.04 } : live
      lv.bass = follow(lv.bass, goal.bass)
      lv.high = follow(lv.high, goal.high)
      sim.uFlow.value = 0.14 + lv.bass * 0.9 + lv.high * 0.3
      sim.uStir.value *= Math.pow(0.35, elapsed)
      // fade in over ~2.5 s of real time while the particles assemble
      uniforms.uIntro.value = Math.min(1, uniforms.uIntro.value + elapsed / 2.5)
      // fixed-size steps keep the simulation stable even when the tab is throttled
      const steps = Math.max(1, Math.min(4, Math.round(elapsed / STEP)))
      for (let i = 0; i < steps; i++) step(t)
      if (!gentle) {
        tilt.x = smooth(tilt.x, pointer.x)
        tilt.y = smooth(tilt.y, pointer.y)
      }
      spin += elapsed * (0.08 + lv.bass * 0.12)
      points.rotation.set(0.35 + tilt.y, spin + tilt.x, 0)
      // Breathing guide open: the sphere moves to the centre and swells and shrinks with the breath.
      const b = breath()
      // sized against the panel's height: at most half of it at the top of the in-breath, about a quarter at the bottom
      const fit = 0.44 / (SPHERE_SPAN * camera.zoom)
      points.scale.setScalar(smooth(points.scale.x, b === null ? 1 : fit * (0.55 + b * 0.45)))
      // fill line from just under the sphere (empty) to just over it (full)
      if (b !== null) uniforms.uFill.value = b * 2.7 - 1.35
      uniforms.uFillMix.value = smooth(uniforms.uFillMix.value, b === null ? 0 : 1)
      // and rises a little, so the cue under it reads on the paper, not over the dots
      const x = smooth(view.x, b === null ? view.baseX : 0)
      const y = smooth(view.y, b === null ? view.baseY : BREATH_Y)
      if (Math.abs(x - view.x) + Math.abs(y - view.y) > 1e-4) {
        view.x = x
        view.y = y
        aim()
        camera.updateProjectionMatrix()
      }
      draw()
    }

    // The sphere is the breathing guide, reduced motion included: there it only swells and shrinks with the breath,
    // like the flat square it replaces, without drifting.
    breathing.sphere = true
    // iOS drops WebGL contexts when the phone sleeps or runs short of memory: the square beats a blank panel.
    const onLost = () => (breathing.sphere = false)
    canvas.addEventListener('webglcontextlost', onLost)
    if (gentle) {
      // start already settled on the shape instead of gathering into it
      sim.uStir.value = 0
      for (let i = 0; i < 240; i++) step(i * STEP)
      uniforms.uIntro.value = 1
    }
    redraw.current = draw
    ready = true
    draw()
    raf = requestAnimationFrame(frame)

    return () => {
      canvas.removeEventListener('webglcontextlost', onLost)
      breathing.sphere = false
      redraw.current = null
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
  }, [accentRef, levelsRef, pausedRef])

  return <div ref={host} style={{ position: 'absolute', inset: 0 }} />
}
