import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatest } from '@/shared/hooks/useLatest'

// Live streams, in order. Lofi Girl's streams refuse embedding (YouTube error 150), so they aren't listed.
// Checked 2026-10-30: Chillhop "lofi hip hop radio", Chillhop Radio, "1 A.M Study Session".
export type Station = { id: string; name: string; title: string }
export const STATIONS: Station[] = [
  { id: '7NOSDKb0HlU', name: 'Chillhop', title: 'beats to relax /\nstudy to' },
  { id: '5yx6BWlEVcY', name: 'Chillhop Radio', title: 'chill beats /\nall day' },
  { id: 'lTRiuFIWV54', name: '1 A.M Study', title: 'late night /\nstudy session' },
  // Added 2026-11-04, one per mood; all report playableInEmbed:true.
  { id: 'blAFxjhg62k', name: 'Coffee Shop Radio', title: 'jazzy beats /\ncoffee shop' },
  { id: 'i6WzngxTnBA', name: 'Chillhop Late Night', title: 'dreamy beats /\nlate night vibes' },
  { id: 'uWzSqdcfPZw', name: 'STEEZYASFUCK', title: 'slow beats /\nto sleep to' },
  { id: 'zBRFf8gAsR8', name: 'Calm Lofi Room', title: 'rain & waves /\nrainy café' },
  { id: 'Fo5BDohM9Fo', name: 'bits & hits', title: 'rpg beats /\ngaming lofi' },
  { id: 'TfmECBzmOn4', name: 'Lofi Fruits', title: 'upbeat lofi /\nhip hop radio' },
  // Added 2026-11-04; oEmbed returns 200, so embedding is allowed. A third-party 24/7 stream: if it goes down the radio skips to the next station.
  { id: 'wqayWHJciTk', name: 'kno Music', title: 'disney piano /\nbedtime' },
  // Added 2026-11-05: live and embeddable when checked (isLiveNow, playableInEmbed). Older city pop streams on YouTube are offline or block embedding.
  { id: 'vZ-Q7lM5Sv8', name: 'Citypop Radio', title: '80s japanese /\ncity pop disco' },
]
const READY_TIMEOUT_MS = 8000
const RETRY_MS = 60_000

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
      host: string
      playerVars: Record<string, number | string>
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

export function useYouTubeLofi(volume: number, initialStation = 0, muted = false) {
  const [status, setStatus] = useState<LofiStatus>('loading')
  const [playing, setPlaying] = useState(false)
  const [station, setStation] = useState(initialStation < STATIONS.length ? initialStation : 0)
  const player = useRef<YTPlayer | null>(null)
  const volumeRef = useLatest(muted ? 0 : volume)
  const stationRef = useLatest(station)
  const playingRef = useLatest(playing)
  // Streams that already failed in a row; when every station has failed the radio is unavailable.
  const failed = useRef(0)
  const retry = useRef<ReturnType<typeof setTimeout>>(undefined)
  // The user asked for sound: a stream that dies while playing hands over to the next one playing, not paused.
  const wanted = useRef(false)

  useEffect(() => {
    let cancelled = false
    const host = document.createElement('div')
    // Offscreen player: only the audio matters. YouTube won't initialise players smaller than 200×200.
    host.setAttribute('aria-hidden', 'true')
    // ...and out of the Tab order: a hidden iframe must not take the keyboard focus (or pull it out of a dialog).
    host.inert = true
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
          // youtube-nocookie.com: no tracking cookies until the user presses play.
          host: 'https://www.youtube-nocookie.com',
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, origin: location.origin },
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
                if (wanted.current) player.current?.loadVideoById(STATIONS[next].id)
                else player.current?.cueVideoById(STATIONS[next].id)
              } else {
                setStatus('unavailable')
                // A network blip fails every station in a row: try again later instead of giving up until a reload.
                clearTimeout(retry.current)
                retry.current = setTimeout(() => {
                  failed.current = 0
                  setStatus('ready')
                }, RETRY_MS)
              }
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
      clearTimeout(retry.current)
      player.current?.destroy()
      player.current = null
      host.remove()
    }
  }, [stationRef, volumeRef])

  useEffect(() => {
    player.current?.setVolume(Math.round((muted ? 0 : volume) * 100))
  }, [volume, muted])

  // iOS ignores setVolume, so silence (muting everything, or the radio's own volume down to 0) must pause the
  // stream; bringing the sound back resumes only what the silence paused.
  const silent = muted || Math.round(volume * 100) === 0
  const silentRef = useLatest(silent)
  const pausedByMute = useRef(false)
  useEffect(() => {
    const p = player.current
    if (!p) return
    if (silent && playingRef.current) {
      pausedByMute.current = true
      p.pauseVideo()
    } else if (!silent && pausedByMute.current) {
      pausedByMute.current = false
      p.playVideo()
    }
  }, [playingRef, silent])

  const toggle = useCallback(() => {
    const p = player.current
    if (!p) return
    if (playing) {
      pausedByMute.current = false
      wanted.current = false
      p.pauseVideo()
    } else if (silentRef.current) {
      // Play pressed with no sound to hear: it would play out loud on iOS. It starts as soon as the sound comes back.
      pausedByMute.current = !pausedByMute.current
      wanted.current = pausedByMute.current
    } else {
      pausedByMute.current = false
      wanted.current = true
      p.playVideo()
    }
  }, [playing, silentRef])

  const select = useCallback((i: number) => {
    const next = ((i % STATIONS.length) + STATIONS.length) % STATIONS.length
    failed.current = 0
    setStation(next)
    // Keep playing if it was playing: loadVideoById starts at once, cueVideoById waits for play.
    if (playingRef.current) player.current?.loadVideoById(STATIONS[next].id)
    else player.current?.cueVideoById(STATIONS[next].id)
  }, [playingRef])

  return { status, playing, toggle, station, select }
}

export type Lofi = ReturnType<typeof useYouTubeLofi>
