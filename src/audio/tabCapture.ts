/** The user shared the tab but left "Also share tab audio" unticked. */
export class NoAudioShared extends Error {}

export type TabCapture = { analyser: AnalyserNode; stop: () => void }

/**
 * Captures this tab's own audio (including the YouTube iframe, which can't be analysed directly)
 * so the 3D can follow the real music. Needs the browser's share dialog: Chrome/Edge/Brave desktop.
 */
export async function startTabCapture(
  media: MediaDevices = navigator.mediaDevices,
  makeCtx: () => AudioContext = () => new AudioContext(),
  onEnded?: () => void,
): Promise<TabCapture> {
  const stream = await media.getDisplayMedia({
    video: true, // required by the API; dropped right away
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
    systemAudio: 'exclude',
  } as DisplayMediaStreamOptions)
  for (const t of stream.getVideoTracks()) t.stop()

  const audio = stream.getAudioTracks()
  if (!audio.length) {
    for (const t of stream.getTracks()) t.stop()
    throw new NoAudioShared('No se compartió el audio de la pestaña')
  }

  const ctx = makeCtx()
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 1024
  // Analysed only, never connected to the speakers: the tab already plays it.
  const source = ctx.createMediaStreamSource(stream)
  source.connect(analyser)

  let stopped = false
  const stop = () => {
    if (stopped) return
    stopped = true
    for (const t of stream.getTracks()) t.stop()
    source.disconnect()
    ctx.close().catch(() => {})
  }
  // The user can also end the share from the browser's own "Stop sharing" bar.
  audio[0].addEventListener('ended', () => {
    stop()
    onEnded?.()
  })
  return { analyser, stop }
}
