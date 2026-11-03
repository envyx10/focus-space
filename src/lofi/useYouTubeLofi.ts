import { useCallback, useEffect, useRef, useState } from 'react'

// Live streams, in order. Lofi Girl's streams refuse embedding (YouTube error 150), so they aren't listed.
// Checked 2026-10-30: Chillhop "lofi hip hop radio", Chillhop Radio, "1 A.M Study Session".
export type Station = { id: string; name: string; title: string }
export const STATIONS: Station[] = [
  { id: '7NOSDKb0HlU', name: 'Chillhop', title: 'beats to relax /\nstudy to' },
  { id: '5yx6BWlEVcY', name: 'Chillhop Radio', title: 'chill beats /\nall day' },
  { id: 'lTRiuFIWV54', name: '1 A.M Study', title: 'late night /\nstudy session' },
]
export const LOFI_VIDEO_IDS = STATIONS.map((s) => s.id)
const READY_TIMEOUT_MS = 8000

export type LofiStatus = 'loading' | 'ready' | 'unavailable'

type YTPlayer = {
  playVideo(): void
  pauseVideo(): void
  cueVideoById(id: string): void
  loadVideoById(id: string): void
  setVolume(v: number): void
  destroy(): void
}

type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string
      width: number
      height: number
      playerVars: Record<string, number>
      events: {
        onReady: () => void
        onError: (e: { data: number }) => void
        onStateChange: (e: { data: number }) => void
      }
    },
  ) => YTPlayer
  PlayerState: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YTNamespace> | null = null

function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  apiPromise ??= new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT!)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.onerror = () => {
      apiPromise = null
      reject(new Error('YouTube API blocked'))
    }
    document.head.appendChild(s)
  })
  return apiPromise
}

export function useYouTubeLofi(volume: number, initialStation = 0) {
  const [status, setStatus] = useState<LofiStatus>('loading')
  const [playing, setPlaying] = useState(false)
  const [station, setStation] = useState(initialStation < STATIONS.length ? initialStation : 0)
  const player = useRef<YTPlayer | null>(null)
  const volumeRef = useRef(volume)
  volumeRef.current = volume
  const stationRef = useRef(station)
  stationRef.current = station
  const playingRef = useRef(false)
  playingRef.current = playing
  // Streams that already failed in a row; when every station has failed the radio is unavailable.
  const failed = useRef(0)

  useEffect(() => {
    let cancelled = false
    const host = document.createElement('div')
    // Offscreen player: only the audio matters. YouTube won't initialise players smaller than 200×200.
    host.setAttribute('aria-hidden', 'true')
    host.style.cssText = 'position:fixed;left:-400px;top:0;width:200px;height:200px;opacity:0;pointer-events:none'
    const mount = document.createElement('div')
    host.appendChild(mount)
    document.body.appendChild(host)

    const timeout = setTimeout(() => !cancelled && setStatus((s) => (s === 'loading' ? 'unavailable' : s)), READY_TIMEOUT_MS)

    loadApi()
      .then((YT) => {
        if (cancelled) return
        player.current = new YT.Player(mount, {
          videoId: STATIONS[stationRef.current].id,
          width: 200,
          height: 200,
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1 },
          events: {
            onReady: () => {
              if (cancelled) return
              clearTimeout(timeout)
              player.current?.setVolume(Math.round(volumeRef.current * 100))
              setStatus('ready')
            },
            // An ended or embed-blocked stream errors after onReady: fall through to the next one.
            onError: () => {
              if (cancelled) return
              failed.current++
              if (failed.current < STATIONS.length) {
                const next = (stationRef.current + 1) % STATIONS.length
                setStation(next)
                player.current?.cueVideoById(STATIONS[next].id)
              } else setStatus('unavailable')
            },
            onStateChange: (e) => {
              if (cancelled) return
              if (e.data === YT.PlayerState.PLAYING) failed.current = 0
              setPlaying(e.data === YT.PlayerState.PLAYING)
            },
          },
        })
      })
      .catch(() => !cancelled && setStatus('unavailable'))

    return () => {
      cancelled = true
      clearTimeout(timeout)
      player.current?.destroy()
      player.current = null
      host.remove()
    }
  }, [])

  useEffect(() => {
    player.current?.setVolume(Math.round(volume * 100))
  }, [volume])

  const toggle = useCallback(() => {
    const p = player.current
    if (!p) return
    if (playing) p.pauseVideo()
    else p.playVideo()
  }, [playing])

  const select = useCallback((i: number) => {
    const next = ((i % STATIONS.length) + STATIONS.length) % STATIONS.length
    failed.current = 0
    setStation(next)
    // Keep playing if it was playing: loadVideoById starts at once, cueVideoById waits for play.
    if (playingRef.current) player.current?.loadVideoById(STATIONS[next].id)
    else player.current?.cueVideoById(STATIONS[next].id)
  }, [])

  return { status, playing, toggle, station, select }
}
