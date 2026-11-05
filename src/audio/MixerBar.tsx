import { useRef } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import Picker from '../lib/Picker'
import { channel, CHANNEL_IDS, nextVariant, type Channel, type ChannelId } from './channels'
import { replaceSlot, type Prefs } from '../prefs/prefs'
import './mixer.css'

type Props = {
  prefs: Prefs
  onVolume: (ch: ChannelId, v: number) => void
  onVariant: (ch: ChannelId, variantId: string) => void
  /** Puts another sound in the squares (swapping if it is already shown). */
  onSlots: (slots: ChannelId[]) => void
}

const STEP = 0.05
const round = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 100) / 100

type StripProps = { ch: Channel; volume: number; variant: string; onSwap?: (id: ChannelId) => void } & Pick<Props, 'onVolume' | 'onVariant'>

function Strip({ ch, volume, variant, onSwap, onVolume, onVariant }: StripProps) {
  const drag = useRef<{ x: number; v: number; moved: boolean } | null>(null)
  const pct = Math.round(volume * 100)
  const t = useT()
  const chLabel = t(`channel.${ch.id}`)
  const variantLabel = t(`variant.${ch.id}.${variant}`)

  return (
    <div className={`mx${volume > 0 ? ' live' : ''}`}>
      <div className="mx-name">
        {/* The channel name is the picker: change which sound this square plays, right here. */}
        {onSwap ? (
          <Picker
            className="mx-swap"
            value={ch.id}
            options={CHANNEL_IDS.map((id) => ({ id, label: t(`channel.${id}`) }))}
            onChange={onSwap}
            label={t('mixer.swap', { channel: chLabel })}
            placement="up"
          />
        ) : (
          <span>{chLabel}</span>
        )}
        <button className="mx-variant" onClick={() => onVariant(ch.id, nextVariant(ch.id, variant))} aria-label={t('mixer.changeVariant', { channel: chLabel, variant: variantLabel })}>
          {variantLabel}
          <Icon name="refresh" />
        </button>
      </div>
      {/* Sibling of the button: ARIA sliders make their children presentational. */}
      <div
        className="mx-slider"
        role="slider"
        tabIndex={0}
        aria-label={t('mixer.volume', { channel: chLabel })}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={t('mixer.valueText', { pct, variant: variantLabel })}
        onKeyDown={(e) => {
          const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? STEP : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -STEP : 0
          if (!d) return
          e.preventDefault()
          onVolume(ch.id, round(volume + d))
        }}
        onWheel={(e) => onVolume(ch.id, round(volume + (e.deltaY < 0 ? STEP : -STEP)))}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, v: volume, moved: false }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          if (Math.abs(e.clientX - drag.current.x) > 3) drag.current.moved = true
          const w = e.currentTarget.getBoundingClientRect().width || 1
          onVolume(ch.id, round(drag.current.v + (e.clientX - drag.current.x) / w))
        }}
        onPointerUp={(e) => {
          // A plain click (no drag) jumps to where it landed on the line.
          if (drag.current && !drag.current.moved) {
            const r = e.currentTarget.getBoundingClientRect()
            onVolume(ch.id, round((e.clientX - r.left) / (r.width || 1)))
          }
          drag.current = null
        }}
        onPointerCancel={() => (drag.current = null)}
      >
        <b>{String(pct).padStart(2, '0')}</b>
        <div className="mx-line" style={{ ['--v' as string]: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function MixerBar({ prefs, onVolume, onVariant, onSlots }: Props) {
  const t = useT()
  // A saved mix may play a channel that has no square; it shows up at the end so it can still be turned down.
  const shown = [...prefs.slots, ...CHANNEL_IDS.filter((id) => !prefs.slots.includes(id) && prefs.volumes[id] > 0)].map(channel)
  const silent = shown.every((ch) => prefs.volumes[ch.id] === 0)
  return (
    <div className="mixer">
      {silent && !prefs.muted && (
        <p className="mx-hint" aria-live="polite">
          {t('mixer.silent')}
        </p>
      )}
      <div className="mx-strips">
        {shown.map((ch, i) => (
          <Strip
            key={ch.id}
            ch={ch}
            volume={prefs.volumes[ch.id]}
            variant={prefs.variants[ch.id]}
            onSwap={i < prefs.slots.length ? (id) => onSlots(replaceSlot(prefs.slots, i, id)) : undefined}
            onVolume={onVolume}
            onVariant={onVariant}
          />
        ))}
      </div>
    </div>
  )
}
