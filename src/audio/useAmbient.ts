import { useCallback, useEffect, useRef, useState } from 'react'
import { CHANNEL_IDS, type ChannelId } from './channels'
import { createEngine, type Engine } from './engine'
import { bandLevels } from './levels'
import { loadPrefs, savePrefs, type Prefs } from '../prefs/prefs'

export function useAmbient() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)
  const engineRef = useRef<Engine | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const freq = useRef<Uint8Array<ArrayBuffer> | null>(null)

  useEffect(() => savePrefs(prefs), [prefs])

  useEffect(() => {
    if (typeof AudioContext === 'undefined') return
    const ctx = new AudioContext()
    const engine = createEngine(ctx, prefs.variants)
    for (const id of CHANNEL_IDS) engine.setVolume(id, prefs.volumes[id])
    ctxRef.current = ctx
    engineRef.current = engine
    freq.current = new Uint8Array(engine.analyser.frequencyBinCount)

    // Browsers keep audio suspended until a user gesture; the first one anywhere starts the saved mix.
    const detach = () => {
      removeEventListener('pointerdown', unlock)
      removeEventListener('keydown', unlock)
    }
    const unlock = () => {
      engine.resume().catch(() => {})
      detach()
    }
    addEventListener('pointerdown', unlock)
    addEventListener('keydown', unlock)
    return () => {
      detach()
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

  const setLofiVolume = useCallback((v: number) => setPrefs((p) => ({ ...p, lofiVolume: v })), [])
  const setScene = useCallback((scene: string) => setPrefs((p) => ({ ...p, scene })), [])
  const setFont = useCallback((font: string) => setPrefs((p) => ({ ...p, font })), [])

  const getLevels = useCallback(() => {
    const engine = engineRef.current
    const ctx = ctxRef.current
    if (!engine || !ctx || !freq.current || ctx.state !== 'running') return null
    engine.analyser.getByteFrequencyData(freq.current)
    return bandLevels(freq.current, ctx.sampleRate, engine.analyser.fftSize)
  }, [])

  return { prefs, setVolume, setVariant, setLofiVolume, setScene, setFont, getLevels }
}
