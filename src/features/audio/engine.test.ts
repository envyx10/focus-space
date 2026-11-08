import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PREFS } from '@/features/prefs/prefs'
import { createEngine } from './engine'

function fakeCtx() {
  const param = () => ({
    value: 0,
    setTargetAtTime: vi.fn(function (this: { value: number }, v: number) {
      this.value = v
    }),
    setValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  })
  const node = () => ({ connect: vi.fn(), disconnect: vi.fn(), gain: param() })
  const sources: { buffer: { src: string; duration: number }; loop: boolean; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] = []
  const ctx = {
    state: 'suspended',
    currentTime: 0,
    destination: {},
    resume: vi.fn(async function (this: { state: string }) {
      this.state = 'running'
    }),
    createGain: vi.fn(node),
    createAnalyser: vi.fn(() => ({ ...node(), fftSize: 0, frequencyBinCount: 512, getByteFrequencyData: vi.fn() })),
    createBufferSource: vi.fn(() => {
      const s = { ...node(), buffer: null as never, loop: false, start: vi.fn(), stop: vi.fn() }
      sources.push(s)
      return s
    }),
  }
  return { ctx, sources }
}

const load = vi.fn(async (src: string) => ({ src, duration: 60 }) as unknown as AudioBuffer)
const flush = () => new Promise((r) => setTimeout(r, 0))

afterEach(() => {
  vi.useRealTimers()
  load.mockClear()
})

describe('engine', () => {
  it('loads nothing before the first gesture; resume() starts audible channels as gapless loops at a random point', async () => {
    const { ctx, sources } = fakeCtx()
    const e = createEngine(ctx as unknown as AudioContext, DEFAULT_PREFS.variants, load)
    e.setVolume('rain', 0.65)
    expect(load).not.toHaveBeenCalled()
    await e.resume()
    await flush()
    expect(ctx.resume).toHaveBeenCalled()
    expect(load).toHaveBeenCalledWith('/sounds/rain-suave.mp3')
    expect(load).toHaveBeenCalledTimes(1) // silent channels are never fetched
    expect(sources).toHaveLength(1)
    expect(sources[0].loop).toBe(true)
    const [when, offset] = sources[0].start.mock.calls[0]
    expect(when).toBe(0)
    expect(offset).toBeGreaterThanOrEqual(0)
    expect(offset).toBeLessThan(60)
  })

  it('setVariant swaps the playing loop, and the old one is stopped and released once faded', async () => {
    vi.useFakeTimers()
    const { ctx, sources } = fakeCtx()
    const e = createEngine(ctx as unknown as AudioContext, DEFAULT_PREFS.variants, load)
    e.setVolume('rain', 0.5)
    await e.resume()
    await vi.advanceTimersByTimeAsync(0)
    e.setVariant('rain', 'tormenta')
    await vi.advanceTimersByTimeAsync(0)
    expect(sources.map((s) => s.buffer.src)).toEqual(['/sounds/rain-suave.mp3', '/sounds/rain-tormenta.mp3'])
    expect(sources[0].stop).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(600)
    expect(sources[0].stop).toHaveBeenCalled()
    // switching back decodes again (memory is only held for what plays)
    e.setVariant('rain', 'suave')
    await vi.advanceTimersByTimeAsync(0)
    expect(load).toHaveBeenLastCalledWith('/sounds/rain-suave.mp3')
  })

  it('turning a sound down and up again within the fade keeps the same loop playing', async () => {
    vi.useFakeTimers()
    const { ctx, sources } = fakeCtx()
    const e = createEngine(ctx as unknown as AudioContext, DEFAULT_PREFS.variants, load)
    e.setVolume('fire', 0.5)
    await e.resume()
    await vi.advanceTimersByTimeAsync(0)
    e.setVolume('fire', 0)
    await vi.advanceTimersByTimeAsync(200)
    e.setVolume('fire', 0.3)
    await vi.advanceTimersByTimeAsync(1000)
    expect(sources).toHaveLength(1)
    expect(sources[0].stop).not.toHaveBeenCalled()
  })

  it('a failed load leaves the channel silent and is retried on the next fade-in', async () => {
    const { ctx, sources } = fakeCtx()
    const flaky = vi.fn().mockRejectedValueOnce(new Error('offline')).mockImplementation(load)
    const e = createEngine(ctx as unknown as AudioContext, DEFAULT_PREFS.variants, flaky)
    e.setVolume('wind', 0.5)
    await e.resume()
    await flush()
    expect(sources).toHaveLength(0)
    e.setVolume('wind', 0)
    e.setVolume('wind', 0.5)
    await flush()
    expect(flaky).toHaveBeenCalledTimes(2)
    expect(sources).toHaveLength(1)
  })

  it('resume() after the browser suspended the context brings it back', async () => {
    const { ctx } = fakeCtx()
    const e = createEngine(ctx as unknown as AudioContext, DEFAULT_PREFS.variants, load)
    await e.resume()
    ctx.state = 'suspended'
    await e.resume()
    expect(ctx.resume).toHaveBeenCalledTimes(2)
    expect(ctx.state).toBe('running')
  })
})

describe('engine mute', () => {
  it('mutes through the master gain and leaves channel volumes alone', async () => {
    const { ctx } = fakeCtx()
    const e = createEngine(ctx as unknown as AudioContext, DEFAULT_PREFS.variants, load)
    e.setVolume('rain', 0.5)
    await e.resume()
    const master = ctx.createGain.mock.results[0].value
    e.setMuted(true)
    expect(master.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, expect.any(Number))
    e.setMuted(false)
    expect(master.gain.setTargetAtTime).toHaveBeenLastCalledWith(1, 0, expect.any(Number))
  })
})
