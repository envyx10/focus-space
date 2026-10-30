import { describe, expect, it, vi } from 'vitest'
import { NoAudioShared, startTabCapture } from './tabCapture'

function track(kind: 'audio' | 'video') {
  return { kind, stop: vi.fn(), addEventListener: vi.fn() }
}

function fakeCtx() {
  const analyser = { fftSize: 0, connect: vi.fn() }
  const source = { connect: vi.fn(), disconnect: vi.fn() }
  return {
    analyser,
    source,
    ctx: {
      destination: {},
      createAnalyser: vi.fn(() => analyser),
      createMediaStreamSource: vi.fn(() => source),
      close: vi.fn(async () => {}),
    },
  }
}

function media(tracks: ReturnType<typeof track>[]) {
  return {
    getDisplayMedia: vi.fn(async () => ({
      getTracks: () => tracks,
      getAudioTracks: () => tracks.filter((t) => t.kind === 'audio'),
      getVideoTracks: () => tracks.filter((t) => t.kind === 'video'),
    })),
  }
}

describe('startTabCapture', () => {
  it('asks for this tab with audio, drops the video and analyses without playing it back', async () => {
    const video = track('video')
    const audio = track('audio')
    const m = media([video, audio])
    const f = fakeCtx()
    const capture = await startTabCapture(m as unknown as MediaDevices, () => f.ctx as unknown as AudioContext)
    const opts = (m.getDisplayMedia.mock.calls[0] as unknown[])[0] as Record<string, unknown>
    expect(opts.audio).toBeTruthy()
    expect(opts.preferCurrentTab).toBe(true)
    expect(video.stop).toHaveBeenCalled()
    expect(f.source.connect).toHaveBeenCalledWith(f.analyser)
    // never routed to the speakers: that would double the music
    expect(f.analyser.connect).not.toHaveBeenCalled()
    capture.stop()
    expect(audio.stop).toHaveBeenCalled()
    expect(f.ctx.close).toHaveBeenCalled()
  })

  it('fails with NoAudioShared and releases everything when the user did not tick "share audio"', async () => {
    const video = track('video')
    const f = fakeCtx()
    await expect(startTabCapture(media([video]) as unknown as MediaDevices, () => f.ctx as unknown as AudioContext)).rejects.toBeInstanceOf(
      NoAudioShared,
    )
    expect(video.stop).toHaveBeenCalled()
    expect(f.ctx.createMediaStreamSource).not.toHaveBeenCalled()
  })
})
