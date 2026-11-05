import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import { channel, CHANNEL_IDS, type ChannelId } from '../audio/channels'
import { DEFAULT_SLOTS, moveSlot, replaceSlot } from '../prefs/prefs'

const PREVIEW_MS = 3000

type Props = {
  slots: ChannelId[]
  variants: Record<ChannelId, string>
  onSlots: (slots: ChannelId[]) => void
}

/** Pick which channel fills each mixer square, and in what order. Drag with a mouse; arrows for touch and keyboard. */
export default function MixerSlots({ slots, variants, onSlots }: Props) {
  const t = useT()
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const preview = useRef<{ el: HTMLAudioElement; timer: ReturnType<typeof setTimeout> } | null>(null)

  const stopPreview = () => {
    if (!preview.current) return
    clearTimeout(preview.current.timer)
    preview.current.el.pause()
    preview.current = null
  }
  useEffect(() => stopPreview, [])

  const play = (id: ChannelId) => {
    stopPreview()
    const src = channel(id).variants.find((v) => v.id === variants[id])?.src ?? channel(id).variants[0].src
    const el = new Audio(src)
    el.volume = 0.5
    el.play().catch(() => {})
    preview.current = { el, timer: setTimeout(stopPreview, PREVIEW_MS) }
  }

  const isDefault = slots.join() === DEFAULT_SLOTS.join()

  return (
    <>
      <ol className="set-slots" aria-label={t('settings.slots')}>
        {slots.map((id, i) => {
          const name = t(`channel.${id}`)
          return (
            <li
              key={id}
              className={`set-row set-slot${dragFrom === i ? ' is-drag' : ''}`}
              draggable
              onDragStart={(e) => {
                setDragFrom(i)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(e) => dragFrom !== null && e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (dragFrom !== null) onSlots(moveSlot(slots, dragFrom, i))
                setDragFrom(null)
              }}
              onDragEnd={() => setDragFrom(null)}
            >
              <span className="set-slot-n" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <select value={id} aria-label={t('settings.slot', { n: i + 1 })} onChange={(e) => onSlots(replaceSlot(slots, i, e.target.value as ChannelId))}>
                {CHANNEL_IDS.map((c) => (
                  <option key={c} value={c}>
                    {t(`channel.${c}`)}
                  </option>
                ))}
              </select>
              <button className="set-x" aria-label={t('settings.slotPreview', { name })} title={t('settings.slotPreview', { name })} onClick={() => play(id)}>
                <Icon name="play" />
              </button>
              <button className="set-x" disabled={i === 0} aria-label={t('settings.slotUp', { name })} onClick={() => onSlots(moveSlot(slots, i, i - 1))}>
                ↑
              </button>
              <button className="set-x" disabled={i === slots.length - 1} aria-label={t('settings.slotDown', { name })} onClick={() => onSlots(moveSlot(slots, i, i + 1))}>
                ↓
              </button>
            </li>
          )
        })}
      </ol>
      {!isDefault && (
        <button className="set-act" onClick={() => onSlots(DEFAULT_SLOTS)}>
          {t('settings.slotsReset')}
        </button>
      )}
    </>
  )
}
