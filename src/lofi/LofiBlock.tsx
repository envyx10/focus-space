import type { SyncState } from '../audio/useMusicSync'
import type { LofiStatus } from './useYouTubeLofi'
import './lofi.css'

type Props = {
  status: LofiStatus
  playing: boolean
  volume: number
  onToggle: () => void
  onVolume: (v: number) => void
  sync: SyncState
  onSync: () => void
}

const SYNC_LABEL: Record<SyncState, string> = {
  off: '3D ↯ Sincronizar',
  on: '3D ● En directo',
  'no-audio': 'Marca «Compartir audio de la pestaña»',
  unsupported: 'Tu navegador no permite capturar audio',
  denied: '3D ↯ Sincronizar',
}

const STEP = 0.05
const round = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 100) / 100

export default function LofiBlock({ status, playing, volume, onToggle, onVolume, sync, onSync }: Props) {
  const pct = Math.round(volume * 100)
  const unavailable = status === 'unavailable'

  return (
    <div className={`pl${unavailable ? ' off' : ''}`}>
      <div className="pl-row">
        <button className="pl-play" onClick={onToggle} disabled={status !== 'ready'} aria-label={playing ? 'Pausar lofi' : 'Reproducir lofi'}>
          {playing ? '❚❚' : '▶'} Lofi radio — live
        </button>
        <span>{unavailable ? 'No disponible' : status === 'loading' ? 'Cargando…' : playing ? 'Sonando' : 'En pausa'}</span>
      </div>
      <div className="pl-mid">
        <div className="pl-title">
          beats to relax /<br />
          study to
        </div>
        <button
          className={`pl-sync${sync === 'on' ? ' on' : ''}`}
          aria-pressed={sync === 'on'}
          aria-label="Sincronizar 3D con la música"
          title="Comparte el audio de esta pestaña para que el 3D siga la música real"
          onClick={onSync}
          disabled={sync === 'unsupported'}
        >
          {SYNC_LABEL[sync]}
        </button>
      </div>
      <div
        className="pl-vol"
        role="slider"
        tabIndex={0}
        aria-label="Volumen lofi"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        onKeyDown={(e) => {
          const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? STEP : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -STEP : 0
          if (!d) return
          e.preventDefault()
          onVolume(round(volume + d))
        }}
        onWheel={(e) => onVolume(round(volume + (e.deltaY < 0 ? STEP : -STEP)))}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          onVolume(round((e.clientX - r.left) / (r.width || 1)))
        }}
      >
        <span>Vol {String(pct).padStart(2, '0')}</span>
        <i style={{ ['--v' as string]: `${pct}%` }} />
      </div>
    </div>
  )
}
