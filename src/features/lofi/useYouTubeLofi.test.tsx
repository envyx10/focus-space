import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useYouTubeLofi } from './useYouTubeLofi'

const PLAYING = 1
const PAUSED = 2

/** A stand-in for YouTube's player that, like iOS, ignores setVolume: only play and pause change what is heard. */
function fakeYouTube() {
  const calls: string[] = []
  let events: { onReady: () => void; onStateChange: (e: { data: number }) => void } | null = null
  class Player {
    constructor(_el: HTMLElement, opts: { events: typeof events }) {
      events = opts.events
      queueMicrotask(() => events?.onReady())
    }
    playVideo() {
      calls.push('play')
      events?.onStateChange({ data: PLAYING })
    }
    pauseVideo() {
      calls.push('pause')
      events?.onStateChange({ data: PAUSED })
    }
    setVolume(v: number) {
      calls.push(`volume ${v}`)
    }
    cueVideoById() {}
    loadVideoById() {}
    destroy() {}
  }
  window.YT = { Player, PlayerState: { PLAYING } } as unknown as Window['YT']
  return calls
}

describe('useYouTubeLofi', () => {
  let calls: string[]
  beforeEach(() => {
    calls = fakeYouTube()
  })
  afterEach(() => {
    delete window.YT
    vi.restoreAllMocks()
  })

  const ready = async (volume = 0.6, muted = false) => {
    const hook = renderHook(({ v, m }) => useYouTubeLofi(v, 0, m), { initialProps: { v: volume, m: muted } })
    await waitFor(() => expect(hook.result.current.status).toBe('ready'))
    return hook
  }

  it('pauses the stream when its volume goes down to 0 and picks up again when it comes back', async () => {
    const hook = await ready()
    act(() => hook.result.current.toggle())
    expect(hook.result.current.playing).toBe(true)

    hook.rerender({ v: 0, m: false })
    expect(calls.at(-1)).toBe('pause')
    expect(hook.result.current.playing).toBe(false)

    hook.rerender({ v: 0.3, m: false })
    expect(calls.at(-1)).toBe('play')
    expect(hook.result.current.playing).toBe(true)
  })

  it('treats a volume that rounds to 0 as silence', async () => {
    const hook = await ready()
    act(() => hook.result.current.toggle())
    hook.rerender({ v: 0.004, m: false })
    expect(hook.result.current.playing).toBe(false)
  })

  it('does not resume a stream the user paused themselves', async () => {
    const hook = await ready()
    hook.rerender({ v: 0, m: false })
    hook.rerender({ v: 0.5, m: false })
    expect(calls).not.toContain('play')
  })

  it('pressing play at volume 0 waits for the sound instead of playing out loud', async () => {
    const hook = await ready(0)
    act(() => hook.result.current.toggle())
    expect(calls).not.toContain('play')

    hook.rerender({ v: 0.4, m: false })
    expect(calls.at(-1)).toBe('play')
  })

  it('muting everything still pauses and unmuting resumes', async () => {
    const hook = await ready()
    act(() => hook.result.current.toggle())
    hook.rerender({ v: 0.6, m: true })
    expect(hook.result.current.playing).toBe(false)
    hook.rerender({ v: 0.6, m: false })
    expect(hook.result.current.playing).toBe(true)
  })
})
