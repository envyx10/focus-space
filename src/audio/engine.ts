import { channel, CHANNEL_IDS, type ChannelId } from './channels'

const FADE_S = 0.4
// setTargetAtTime reaches ~95% after 3 time constants
const TAU = FADE_S / 3

type Voice = { el: HTMLAudioElement; gain: GainNode }

export type Engine = {
  setVolume(ch: ChannelId, v: number): void
  setVariant(ch: ChannelId, variantId: string): void
  /** Silences the whole mix without touching the per-channel volumes. */
  setMuted(muted: boolean): void
  resume(): Promise<void>
  analyser: AnalyserNode
}

export function createEngine(
  ctx: AudioContext,
  initialVariants: Record<ChannelId, string>,
  makeAudio: (src: string) => HTMLAudioElement = (src) => new Audio(src),
): Engine {
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 1024
  const master = ctx.createGain()
  master.connect(ctx.destination)
  analyser.connect(master)

  const volumes = Object.fromEntries(CHANNEL_IDS.map((id) => [id, 0])) as Record<ChannelId, number>
  const variants = { ...initialVariants }
  const channelGain = {} as Record<ChannelId, GainNode>
  const voices = new Map<string, Voice>()
  const pauseTimers = new Map<string, ReturnType<typeof setTimeout>>()
  let started = false

  for (const id of CHANNEL_IDS) {
    const g = ctx.createGain()
    g.gain.value = 0
    g.connect(analyser)
    channelGain[id] = g
  }

  // Elements are created lazily so silent channels never download their loop.
  function voice(ch: ChannelId, variantId: string): Voice {
    const key = `${ch}:${variantId}`
    let v = voices.get(key)
    if (!v) {
      const src = channel(ch).variants.find((x) => x.id === variantId)!.src
      const el = makeAudio(src)
      el.loop = true
      el.preload = 'auto'
      const gain = ctx.createGain()
      gain.gain.value = 0
      ctx.createMediaElementSource(el).connect(gain)
      gain.connect(channelGain[ch])
      v = { el, gain }
      voices.set(key, v)
    }
    return v
  }

  function fadeIn(ch: ChannelId, variantId: string) {
    const key = `${ch}:${variantId}`
    clearTimeout(pauseTimers.get(key))
    const v = voice(ch, variantId)
    v.gain.gain.setTargetAtTime(1, ctx.currentTime, TAU)
    v.el.play().catch(() => {})
  }

  function fadeOut(ch: ChannelId, variantId: string) {
    const key = `${ch}:${variantId}`
    const v = voices.get(key)
    if (!v) return
    v.gain.gain.setTargetAtTime(0, ctx.currentTime, TAU)
    clearTimeout(pauseTimers.get(key))
    // Pause once faded so silent loops cost no CPU.
    pauseTimers.set(key, setTimeout(() => v.el.pause(), FADE_S * 1000 + 100))
  }

  function sync(ch: ChannelId) {
    channelGain[ch].gain.setTargetAtTime(volumes[ch], ctx.currentTime, TAU / 2)
    if (!started) return
    if (volumes[ch] > 0) fadeIn(ch, variants[ch])
    else fadeOut(ch, variants[ch])
  }

  return {
    analyser,
    setMuted(muted) {
      master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, TAU)
    },
    setVolume(ch, v) {
      const clamped = Math.min(1, Math.max(0, v))
      const wasAudible = volumes[ch] > 0
      volumes[ch] = clamped
      if (wasAudible !== clamped > 0 || !started) sync(ch)
      else channelGain[ch].gain.setTargetAtTime(clamped, ctx.currentTime, TAU / 2)
    },
    setVariant(ch, variantId) {
      if (variants[ch] === variantId) return
      const old = variants[ch]
      variants[ch] = variantId
      if (!started || volumes[ch] === 0) return
      fadeOut(ch, old)
      fadeIn(ch, variantId)
    },
    async resume() {
      if (ctx.state !== 'running') await ctx.resume()
      if (started) return
      started = true
      for (const id of CHANNEL_IDS) sync(id)
    },
  }
}
