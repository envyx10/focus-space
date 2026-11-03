import { describe, expect, it, vi } from 'vitest'
import { createEngine } from './engine'

function fakeCtx() {
  const node = () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { value: 0, setTargetAtTime: vi.fn(function (this: { value: number }, v: number) { this.value = v }) },
  })
  return {
    state: 'suspended',
    currentTime: 0,
    sampleRate: 48_000,
    destination: {},
    resume: vi.fn(async function (this: { state: string }) { this.state = 'running' }),
    createGain: vi.fn(node),
    createAnalyser: vi.fn(() => ({ ...node(), fftSize: 0, frequencyBinCount: 512, getByteFrequencyData: vi.fn() })),
    createMediaElementSource: vi.fn(node),
  }
}

function fakeAudio() {
  const made: { src: string; play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>; loop: boolean }[] = []
  const factory = (src: string) => {
    const a = { src, loop: false, crossOrigin: '', play: vi.fn(async () => {}), pause: vi.fn() }
    made.push(a)
    return a as unknown as HTMLAudioElement
  }
  return { made, factory }
}

describe('engine', () => {
  it('setVolume before resume does not throw nor play; resume() resumes ctx and starts audible channels', async () => {
    const ctx = fakeCtx()
    const audio = fakeAudio()
    const e = createEngine(ctx as unknown as AudioContext, { rain: 'suave', fire: 'hoguera', cafe: 'cafeteria', wind: 'suave', keys: 'azul' }, audio.factory)
    expect(() => e.setVolume('rain', 0.65)).not.toThrow()
    expect(audio.made.every((a) => a.play.mock.calls.length === 0)).toBe(true)
    await e.resume()
    expect(ctx.resume).toHaveBeenCalled()
    const rain = audio.made.find((a) => a.src.endsWith('/sounds/rain-suave.mp3'))!
    expect(rain.loop).toBe(true)
    expect(rain.play).toHaveBeenCalled()
    expect(audio.made.some((a) => a.src.includes('fire'))).toBe(false)
  })

  it('setVariant switches the playing element of an audible channel', async () => {
    const ctx = fakeCtx()
    const audio = fakeAudio()
    const e = createEngine(ctx as unknown as AudioContext, { rain: 'suave', fire: 'hoguera', cafe: 'cafeteria', wind: 'suave', keys: 'azul' }, audio.factory)
    e.setVolume('rain', 0.5)
    await e.resume()
    e.setVariant('rain', 'tormenta')
    const storm = audio.made.find((a) => a.src.endsWith('/sounds/rain-tormenta.mp3'))!
    expect(storm.play).toHaveBeenCalled()
  })
})

describe('engine mute', () => {
  it('mutes through the master gain and leaves channel volumes alone', async () => {
    const ctx = fakeCtx()
    const audio = fakeAudio()
    const e = createEngine(ctx as unknown as AudioContext, { rain: 'suave', fire: 'hoguera', cafe: 'cafeteria', wind: 'suave', keys: 'azul' }, audio.factory)
    e.setVolume('rain', 0.5)
    await e.resume()
    const master = ctx.createGain.mock.results[0].value
    e.setMuted(true)
    expect(master.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, expect.any(Number))
    e.setMuted(false)
    expect(master.gain.setTargetAtTime).toHaveBeenLastCalledWith(1, 0, expect.any(Number))
  })
})
