import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const engine = {
  setVolume: vi.fn(),
  setVariant: vi.fn(),
  setMuted: vi.fn(),
  resume: vi.fn(async () => {}),
  analyser: { frequencyBinCount: 8 },
}
vi.mock('./engine', () => ({ createEngine: () => engine }))

const { useAmbient } = await import('./useAmbient')

type Nav = Navigator & { audioSession?: { type: string } }

describe('useAmbient on phones', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal(
      'AudioContext',
      class {
        state = 'suspended'
        close = async () => {}
      },
    )
    ;(navigator as Nav).audioSession = { type: 'auto' }
    engine.resume.mockClear()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    delete (navigator as Nav).audioSession
  })

  it.each(['pointerup', 'touchend', 'click'])('wakes the audio on %s, where a touch counts as a gesture', (type) => {
    renderHook(() => useAmbient())
    dispatchEvent(new Event(type))
    expect(engine.resume).toHaveBeenCalled()
  })

  it('switches iOS to media playback only once a sound is turned on', () => {
    const { result } = renderHook(() => useAmbient())
    // just opening the page must not stop the music another app is playing
    expect((navigator as Nav).audioSession?.type).toBe('auto')
    act(() => result.current.setVolume('rain', 0))
    expect((navigator as Nav).audioSession?.type).toBe('auto')
    act(() => result.current.setVolume('rain', 0.5))
    expect((navigator as Nav).audioSession?.type).toBe('playback')
  })

  it('a mix saved with sounds on asks for media playback straight away', () => {
    localStorage.setItem('focus-space:prefs', JSON.stringify({ v: 1, volumes: { rain: 0.4 } }))
    renderHook(() => useAmbient())
    expect((navigator as Nav).audioSession?.type).toBe('playback')
  })
})
