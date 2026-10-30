import { useRef } from 'react'
import { CHANNELS, nextVariant, type Channel, type ChannelId } from './channels'
import type { Prefs } from '../prefs/prefs'
import './mixer.css'

type Props = {
  prefs: Prefs
  onVolume: (ch: ChannelId, v: number) => void
  onVariant: (ch: ChannelId, variantId: string) => void
}

const STEP = 0.05
const round = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 100) / 100

function Strip({ ch, volume, variant, onVolume, onVariant }: { ch: Channel; volume: number; variant: string } & Omit<Props, 'prefs'>) {
  const drag = useRef<{ x: number; v: number } | null>(null)
  const pct = Math.round(volume * 100)
  const variantLabel = ch.variants.find((x) => x.id === variant)?.label

  return (
    <div
      className={`mx${volume > 0 ? ' live' : ''}`}
      role="slider"
      tabIndex={0}
      aria-label={`Volumen ${ch.label}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${pct} %, ${variantLabel}`}
      onKeyDown={(e) => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? STEP : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -STEP : 0
        if (!d) return
        e.preventDefault()
        onVolume(ch.id, round(volume + d))
      }}
      onWheel={(e) => onVolume(ch.id, round(volume + (e.deltaY < 0 ? STEP : -STEP)))}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return
        drag.current = { x: e.clientX, v: volume }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current) return
        const w = e.currentTarget.getBoundingClientRect().width || 1
        onVolume(ch.id, round(drag.current.v + (e.clientX - drag.current.x) / w))
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <button className="mx-name" onClick={() => onVariant(ch.id, nextVariant(ch.id, variant))} aria-label={`${ch.label}: ${variantLabel}. Cambiar variante`}>
        {ch.label}
        <span className="mx-variant">{variantLabel} ↻</span>
      </button>
      <b>{String(pct).padStart(2, '0')}</b>
      <div className="mx-line" style={{ ['--v' as string]: `${pct}%` }} />
    </div>
  )
}

export default function MixerBar({ prefs, onVolume, onVariant }: Props) {
  return (
    <div className="mixer">
      {CHANNELS.map((ch) => (
        <Strip key={ch.id} ch={ch} volume={prefs.volumes[ch.id]} variant={prefs.variants[ch.id]} onVolume={onVolume} onVariant={onVariant} />
      ))}
    </div>
  )
}
