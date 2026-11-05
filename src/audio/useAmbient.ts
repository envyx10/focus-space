import { useCallback, useEffect, useRef, useState } from 'react'
import { CHANNEL_IDS, type ChannelId } from './channels'
import { createEngine, type Engine } from './engine'
import { bandLevels } from './levels'
import { loadPrefs, MAX_SCENES, savePrefs, type Prefs, type Scene, type TextScale, type Theme } from '../prefs/prefs'
import type { Chime } from '../timer/alerts'

export function useAmbient() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)
  const engineRef = useRef<Engine | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const freq = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const prefsRef = useRef(prefs)
  prefsRef.current = prefs

  useEffect(() => savePrefs(prefs), [prefs])

  useEffect(() => {
    if (typeof AudioContext === 'undefined') return
    const ctx = new AudioContext()
    const engine = createEngine(ctx, prefs.variants)
    for (const id of CHANNEL_IDS) engine.setVolume(id, prefs.volumes[id])
    engine.setMuted(prefs.muted)
    ctxRef.current = ctx
    engineRef.current = engine
    freq.current = new Uint8Array(engine.analyser.frequencyBinCount)

    // Browsers keep audio suspended until a user gesture, and the OS can suspend it again later (sleep, a headset
    // change, a call, a phone tab in the background). Every gesture and every return to the tab wakes it; resume()
    // does nothing when it is already running.
    const wake = () => {
      engine.resume().catch(() => {})
    }
    const onVisible = () => document.visibilityState === 'visible' && wake()
    addEventListener('pointerdown', wake)
    addEventListener('keydown', wake)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      removeEventListener('pointerdown', wake)
      removeEventListener('keydown', wake)
      document.removeEventListener('visibilitychange', onVisible)
      ctx.close().catch(() => {})
    }
    // Engine is created once; later pref changes are pushed through setVolume/setVariant.
  }, [])

  const setVolume = useCallback((ch: ChannelId, v: number) => {
    engineRef.current?.setVolume(ch, v)
    setPrefs((p) => ({ ...p, volumes: { ...p.volumes, [ch]: v } }))
  }, [])

  const setVariant = useCallback((ch: ChannelId, id: string) => {
    engineRef.current?.setVariant(ch, id)
    setPrefs((p) => ({ ...p, variants: { ...p.variants, [ch]: id } }))
  }, [])

  const setSlots = useCallback((slots: ChannelId[]) => {
    // A channel taken off the mixer fades out instead of playing on where it can't be turned down.
    const gone = prefsRef.current.slots.filter((id) => !slots.includes(id) && prefsRef.current.volumes[id] > 0)
    for (const id of gone) engineRef.current?.setVolume(id, 0)
    setPrefs((p) => ({ ...p, slots, volumes: { ...p.volumes, ...Object.fromEntries(gone.map((id) => [id, 0])) } }))
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    engineRef.current?.setMuted(muted)
    setPrefs((p) => ({ ...p, muted }))
  }, [])

  const saveScene = useCallback((name: string) => {
    const clean = name.trim().slice(0, 24)
    if (!clean) return
    setPrefs((p) => {
      const scene: Scene = { name: clean, volumes: p.volumes, variants: p.variants }
      const rest = p.scenes.filter((s) => s.name !== clean)
      return { ...p, scenes: [...rest, scene].slice(-MAX_SCENES) }
    })
  }, [])

  const applyScene = useCallback((name: string) => {
    const scene = prefsRef.current.scenes.find((s) => s.name === name)
    if (!scene) return
    for (const id of CHANNEL_IDS) {
      engineRef.current?.setVariant(id, scene.variants[id])
      engineRef.current?.setVolume(id, scene.volumes[id])
    }
    setPrefs((p) => ({ ...p, volumes: scene.volumes, variants: scene.variants }))
  }, [])

  const deleteScene = useCallback((name: string) => setPrefs((p) => ({ ...p, scenes: p.scenes.filter((s) => s.name !== name) })), [])

  const setLofiVolume = useCallback((v: number) => setPrefs((p) => ({ ...p, lofiVolume: v })), [])
  const setFont = useCallback((font: string) => setPrefs((p) => ({ ...p, font })), [])
  const setChimeVolume = useCallback((chimeVolume: number) => setPrefs((p) => ({ ...p, chimeVolume })), [])
  const setChimeSound = useCallback((chimeSound: Chime) => setPrefs((p) => ({ ...p, chimeSound })), [])
  const setNotify = useCallback((notify: boolean) => setPrefs((p) => ({ ...p, notify })), [])
  const setCalm = useCallback((calm: boolean) => setPrefs((p) => ({ ...p, calm })), [])
  const setTextScale = useCallback((textScale: TextScale) => setPrefs((p) => ({ ...p, textScale })), [])
  const setTheme = useCallback((theme: Theme) => setPrefs((p) => ({ ...p, theme })), [])
  const setAccent = useCallback((accent: string) => setPrefs((p) => ({ ...p, accent })), [])
  const setLofiStation = useCallback((lofiStation: number) => setPrefs((p) => ({ ...p, lofiStation })), [])

  const getLevels = useCallback(() => {
    const engine = engineRef.current
    const ctx = ctxRef.current
    if (!engine || !ctx || !freq.current || ctx.state !== 'running') return null
    engine.analyser.getByteFrequencyData(freq.current)
    return bandLevels(freq.current, ctx.sampleRate, engine.analyser.fftSize)
  }, [])

  return {
    prefs,
    setVolume,
    setVariant,
    setSlots,
    setMuted,
    saveScene,
    applyScene,
    deleteScene,
    setLofiVolume,
    setFont,
    setChimeVolume,
    setChimeSound,
    setNotify,
    setCalm,
    setTextScale,
    setLofiStation,
    setAccent,
    setTheme,
    getLevels,
  }
}
