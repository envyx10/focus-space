import { useT } from '@/i18n'
import Icon from '@/shared/ui/Icon'
import { STATIONS, type LofiStatus } from './useYouTubeLofi'
import './lofi.css'
import { pad2 } from '@/shared/lib/format'

type Props = {
  status: LofiStatus
  playing: boolean
  volume: number
  onToggle: () => void
  onVolume: (v: number) => void
  station?: number
  onStation?: (i: number) => void
}

const STEP = 0.05
const round = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 100) / 100

export default function LofiBlock({ status, playing, volume, onToggle, onVolume, station = 0, onStation }: Props) {
  const t = useT()
  const pct = Math.round(volume * 100)
  const unavailable = status === 'unavailable'
  const current = STATIONS[station] ?? STATIONS[0]

  return (
    <div className={`pl${unavailable ? ' off' : ''}`}>
      <div className="pl-row">
        <button className="pl-play" onClick={onToggle} disabled={status !== 'ready'} aria-label={playing ? t('lofi.pauseLabel') : t('lofi.play')}>
          <Icon name={playing ? 'pause' : 'play'} />
          {t('lofi.radio')}
        </button>
        <span>
          {unavailable ? t('lofi.unavailable') : status === 'loading' ? t('lofi.loading') : playing ? t('lofi.playing') : t('lofi.paused')}
          {onStation && !unavailable && (
            <button
              className="pl-station"
              aria-label={t('lofi.station', { name: current.name })}
              title={t('lofi.stationHint', { name: current.name })}
              onClick={() => onStation(station + 1)}
            >
              {t('lofi.next', { n: station + 1, total: STATIONS.length })}
              <Icon name="next" />
            </button>
          )}
        </span>
      </div>
      <div className="pl-mid">
        <div className="pl-title">
          {current.title.split('\n').map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </div>
      </div>
      <div
        className="pl-vol"
        role="slider"
        tabIndex={0}
        aria-label={t('lofi.volume')}
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
        <span>{t('lofi.vol', { n: pad2(pct) })}</span>
        <i style={{ ['--v' as string]: `${pct}%` }} />
      </div>
    </div>
  )
}
