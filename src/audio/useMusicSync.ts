import { useCallback, useEffect, useRef, useState } from 'react'
import { bandLevels } from './levels'
import { transient } from './pulse'
import { NoAudioShared, startTabCapture, type TabCapture } from './tabCapture'

export type SyncState = 'off' | 'on' | 'no-audio' | 'denied' | 'unsupported'

const supported = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia

/** Toggles tab-audio capture and exposes its levels for the 3D. */
export function useMusicSync() {
  const [state, setState] = useState<SyncState>(() => (supported() ? 'off' : 'unsupported'))
  const capture = useRef<TabCapture | null>(null)
  const freq = useRef<Uint8Array<ArrayBuffer> | null>(null)

  const stop = useCallback(() => {
    capture.current?.stop()
    capture.current = null
    setState('off')
  }, [])

  const toggle = useCallback(async () => {
    if (capture.current) return stop()
    try {
      const c = await startTabCapture(undefined, undefined, () => {
        capture.current = null
        setState('off')
      })
      capture.current = c
      freq.current = new Uint8Array(c.analyser.frequencyBinCount)
      setState('on')
    } catch (e) {
      setState(e instanceof NoAudioShared ? 'no-audio' : 'denied')
    }
  }, [stop])

  useEffect(() => () => capture.current?.stop(), [])

  const bassState = useRef({ avg: 0 })
  const highState = useRef({ avg: 0 })

  const getLevels = useCallback(() => {
    const c = capture.current
    if (!c || !freq.current) return null
    c.analyser.getByteFrequencyData(freq.current)
    const raw = bandLevels(freq.current, c.analyser.context.sampleRate, c.analyser.fftSize)
    const [b, bass] = transient(bassState.current, raw.bass)
    const [h, high] = transient(highState.current, raw.high)
    bassState.current = b
    highState.current = h
    return { bass, high }
  }, [])

  return { state, toggle, getLevels }
}
