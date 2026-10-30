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
    const e = createEngine(ctx as unknown as AudioContext, { rain: 'suave', fire: 'hoguera', cafe: 'cafeteria', wind: 'suave' }, audio.factory)
    expect(() => e.setVolume('rain', 0.65)).not.toThrow()
    expect(audio.made.every((a) => a.play.mock.calls.length === 0)).toBe(true)
    await e.resume()
    expect(ctx.resume).toHaveBeenCalled()
    const rain = audio.made.find((a) => a.src.endsWith('/sounds/rain-suave.wav'))!
    expect(rain.loop).toBe(true)
    expect(rain.play).toHaveBeenCalled()
    expect(audio.made.some((a) => a.src.includes('fire'))).toBe(false)
  })

  it('setVariant switches the playing element of an audible channel', async () => {
    const ctx = fakeCtx()
    const audio = fakeAudio()
    const e = createEngine(ctx as unknown as AudioContext, { rain: 'suave', fire: 'hoguera', cafe: 'cafeteria', wind: 'suave' }, audio.factory)
    e.setVolume('rain', 0.5)
    await e.resume()
    e.setVariant('rain', 'tormenta')
    const storm = audio.made.find((a) => a.src.endsWith('/sounds/rain-tormenta.wav'))!
    expect(storm.play).toHaveBeenCalled()
  })
})
