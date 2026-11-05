import { channel, CHANNEL_IDS, type ChannelId } from './channels'

const FADE_S = 0.4
// setTargetAtTime reaches ~95% after 3 time constants
const TAU = FADE_S / 3

/**
 * One recording of a channel. Loops play from a decoded AudioBuffer, not an <audio loop> element: the element
 * leaves a gap at every turn with mp3 and can be paused behind our back by the OS (media keys, headphones,
 * other apps), which left channels silent until a reload.
 */
type Voice = { src: string; gain: GainNode; source: AudioBufferSourceNode | null; wanted: boolean; stopTimer?: ReturnType<typeof setTimeout> }

export type Engine = {
  setVolume(ch: ChannelId, v: number): void
  setVariant(ch: ChannelId, variantId: string): void
  /** Silences the whole mix without touching the per-channel volumes. */
  setMuted(muted: boolean): void
  /** Starts (or restarts, after the browser or OS suspended it) the audio. Safe to call on every user gesture. */
  resume(): Promise<void>
  analyser: AnalyserNode
}

export type LoadBuffer = (src: string) => Promise<AudioBuffer>

export function createEngine(ctx: AudioContext, initialVariants: Record<ChannelId, string>, load?: LoadBuffer): Engine {
  const fetchAndDecode: LoadBuffer = async (src) => {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`${src}: ${res.status}`)
    return ctx.decodeAudioData(await res.arrayBuffer())
  }
  const loadBuffer = load ?? fetchAndDecode

  const analyser = ctx.createAnalyser()
  analyser.fftSize = 1024
  const master = ctx.createGain()
  master.connect(ctx.destination)
  analyser.connect(master)

  const volumes = Object.fromEntries(CHANNEL_IDS.map((id) => [id, 0])) as Record<ChannelId, number>
  const variants = { ...initialVariants }
  const channelGain = {} as Record<ChannelId, GainNode>
  const voices = new Map<string, Voice>()
  // Decoded loops are big (~20 MB a minute), so only the ones playing are kept; a failed load is retried next time.
  const buffers = new Map<string, Promise<AudioBuffer>>()
  let started = false

  for (const id of CHANNEL_IDS) {
    const g = ctx.createGain()
    g.gain.value = 0
    g.connect(analyser)
    channelGain[id] = g
  }

  function buffer(src: string): Promise<AudioBuffer> {
    let p = buffers.get(src)
    if (!p) {
      p = loadBuffer(src)
      p.catch(() => buffers.delete(src))
      buffers.set(src, p)
    }
    return p
  }

  function voice(ch: ChannelId, variantId: string): Voice {
    const key = `${ch}:${variantId}`
    let v = voices.get(key)
    if (!v) {
      const gain = ctx.createGain()
      gain.gain.value = 0
      gain.connect(channelGain[ch])
      v = { src: channel(ch).variants.find((x) => x.id === variantId)!.src, gain, source: null, wanted: false }
      voices.set(key, v)
    }
    return v
  }

  function fadeIn(ch: ChannelId, variantId: string) {
    const v = voice(ch, variantId)
    clearTimeout(v.stopTimer)
    v.wanted = true
    if (v.source) {
      v.gain.gain.setTargetAtTime(1, ctx.currentTime, TAU)
      return
    }
    buffer(v.src)
      .then((buf) => {
        if (!v.wanted || v.source) return
        const s = ctx.createBufferSource()
        s.buffer = buf
        s.loop = true
        s.connect(v.gain)
        // Start anywhere in the loop, so the same sound never opens the same way twice.
        s.start(0, Math.random() * buf.duration)
        v.source = s
        v.gain.gain.cancelScheduledValues(ctx.currentTime)
        v.gain.gain.setValueAtTime(0, ctx.currentTime)
        v.gain.gain.setTargetAtTime(1, ctx.currentTime, TAU)
      })
      .catch(() => {}) // network or decode error: the channel stays silent, the next fade-in retries
  }

  function fadeOut(ch: ChannelId, variantId: string) {
    const v = voices.get(`${ch}:${variantId}`)
    if (!v) return
    v.wanted = false
    v.gain.gain.setTargetAtTime(0, ctx.currentTime, TAU)
    clearTimeout(v.stopTimer)
    // Once faded, stop and let the decoded loop go, so silent channels cost neither CPU nor memory.
    v.stopTimer = setTimeout(() => {
      v.source?.stop()
      v.source?.disconnect()
      v.source = null
      buffers.delete(v.src)
    }, FADE_S * 1000 + 100)
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
      if (ctx.state !== 'running') await ctx.resume().catch(() => {})
      if (started) return
      started = true
      for (const id of CHANNEL_IDS) sync(id)
    },
  }
}
