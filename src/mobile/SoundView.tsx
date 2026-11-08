import { useState, type FormEvent } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import { channel, CHANNEL_IDS, nextVariant, type ChannelId } from '../audio/channels'
import type { useAmbient } from '../audio/useAmbient'
import { STATIONS, type useYouTubeLofi } from '../lofi/useYouTubeLofi'
import { haptic } from './platform'
import Sheet from './Sheet'
import Slider from './Slider'
import { useLargeTitle } from './useLargeTitle'

type Props = {
  ambient: ReturnType<typeof useAmbient>
  lofi: ReturnType<typeof useYouTubeLofi>
  onStation: (i: number) => void
}

function ChannelRow({ id, ambient }: { id: ChannelId; ambient: Props['ambient'] }) {
  const t = useT()
  const { prefs } = ambient
  const ch = channel(id)
  const volume = prefs.volumes[id]
  const variant = prefs.variants[id]
  const name = t(`channel.${id}`)
  const variantLabel = t(`variant.${id}.${variant}`)
  const pct = Math.round(volume * 100)

  // One quiet row per sound: name and recording on the left, the level on the right, the slider under them.
  // Nothing framed, so rows of different text lengths still line up; the accent only appears on what is playing.
  return (
    <li className={`m-ch${volume > 0 ? ' is-live' : ''}`}>
      <div className="m-ch-head">
        {/* the name switches the sound on (at half) or off: one tap, no dragging needed */}
        <button className="m-ch-name" aria-pressed={volume > 0} onClick={() => (haptic(6), ambient.setVolume(id, volume > 0 ? 0 : 0.5))}>
          {name}
        </button>
        <span className="m-ch-pct" aria-hidden>
          {volume > 0 ? pct : t('m.off')}
        </span>
      </div>
      <div className="m-ch-body">
        {ch.variants.length > 1 ? (
          <button className="m-ch-variant" onClick={() => ambient.setVariant(id, nextVariant(id, variant))} aria-label={t('mixer.changeVariant', { channel: name, variant: variantLabel })}>
            {variantLabel}
            <Icon name="next" />
          </button>
        ) : (
          <span className="m-ch-variant is-static">{variantLabel}</span>
        )}
        <Slider value={volume} onChange={(v) => ambient.setVolume(id, v)} label={t('mixer.volume', { channel: name })} valueText={t('mixer.valueText', { pct, variant: variantLabel })} />
      </div>
    </li>
  )
}

export default function SoundView({ ambient, lofi, onStation }: Props) {
  const t = useT()
  const { prefs } = ambient
  const [more, setMore] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const { compact, onScroll } = useLargeTitle()
  const others = CHANNEL_IDS.filter((id) => !prefs.slots.includes(id))
  // A saved mix can play a sound that isn't a favourite: those stay listed under the favourites while they play.
  const playingOthers = others.filter((id) => prefs.volumes[id] > 0)
  const station = STATIONS[lofi.station] ?? STATIONS[0]
  const unavailable = lofi.status === 'unavailable'
  const lofiPct = Math.round(prefs.lofiVolume * 100)

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    ambient.saveScene(name)
    setName('')
    setSaving(false)
    haptic(8)
  }

  return (
    <div className={`m-screen${prefs.muted ? ' is-muted' : ''}`}>
      <header className={`m-bar${compact ? ' is-compact' : ''}`}>
        <span className="m-bar-title" aria-hidden={!compact}>
          {t('tabs.mixer')}
        </span>
        <button className={`m-pill m-bar-end${prefs.muted ? ' is-on' : ''}`} aria-pressed={prefs.muted} onClick={() => (haptic(), ambient.setMuted(!prefs.muted))}>
          <Icon name={prefs.muted ? 'muted' : 'sound'} />
          {prefs.muted ? t('mute.on') : t('m.muteAll')}
        </button>
      </header>

      <div className="m-scroll" onScroll={onScroll}>
        <div className="m-large">
          <span className="num">03</span>
          <h1>{t('tabs.mixer')}</h1>
          <p className="lbl">{t('m.soundSub')}</p>
        </div>

        <section className={`m-radio${unavailable ? ' is-off' : ''}`} aria-label={t('tabs.lofi')}>
          <div className="m-radio-top">
            <span className="m-radio-k">{t('lofi.radio')}</span>
            <span className="m-radio-state">
              {unavailable ? t('lofi.unavailable') : lofi.status === 'loading' ? t('lofi.loading') : lofi.playing ? t('lofi.playing') : t('lofi.paused')}
            </span>
          </div>
          <p className="m-radio-title">
            {station.title.split('\n').map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <p className="m-radio-station">
            {station.name} · {lofi.station + 1}/{STATIONS.length}
          </p>
          <div className="m-radio-controls">
            <button className="m-radio-btn" disabled={unavailable} onClick={() => onStation(lofi.station - 1)} aria-label={t('m.prevStation')}>
              <Icon name="prev" />
            </button>
            <button className="m-radio-play" disabled={lofi.status !== 'ready'} onClick={() => (haptic(), lofi.toggle())} aria-label={lofi.playing ? t('lofi.pauseLabel') : t('lofi.play')}>
              <Icon name={lofi.playing ? 'pause' : 'play'} />
            </button>
            <button className="m-radio-btn" disabled={unavailable} onClick={() => onStation(lofi.station + 1)} aria-label={t('lofi.station', { name: station.name })}>
              <Icon name="next" />
            </button>
          </div>
          <div className="m-radio-vol">
            <span>{t('lofi.vol', { n: String(lofiPct).padStart(2, '0') })}</span>
            <Slider value={prefs.lofiVolume} onChange={ambient.setLofiVolume} label={t('lofi.volume')} onAccent={!unavailable} disabled={unavailable} />
          </div>
        </section>

        <section className="m-group">
          <h2 className="m-group-h">{t('m.ambient')}</h2>
          <ul className="m-ch-list">
            {[...prefs.slots, ...playingOthers].map((id) => (
              <ChannelRow key={id} id={id} ambient={ambient} />
            ))}
          </ul>
          <button className="m-section-toggle" aria-expanded={more} onClick={() => setMore((m) => !m)}>
            <span>{t('m.moreSounds', { n: others.length - playingOthers.length })}</span>
            <Icon name={more ? 'up' : 'down'} />
          </button>
          {more && (
            <ul className="m-ch-list">
              {others
                .filter((id) => !playingOthers.includes(id))
                .map((id) => (
                  <ChannelRow key={id} id={id} ambient={ambient} />
                ))}
            </ul>
          )}
        </section>

        <section className="m-group">
          <h2 className="m-group-h">{t('m.mixes')}</h2>
          {prefs.scenes.length === 0 && <p className="m-group-note">{t('m.mixesEmpty')}</p>}
          <ul className="m-mixes">
            {prefs.scenes.map((s) => (
              <li key={s.name} className="m-mix">
                <button className="m-mix-apply" onClick={() => (haptic(), ambient.applyScene(s.name))} aria-label={`${t('settings.mixApply')}: ${s.name}`}>
                  {s.name}
                </button>
                <button className="m-mix-x" onClick={() => ambient.deleteScene(s.name)} aria-label={t('settings.mixDelete', { name: s.name })}>
                  <Icon name="close" />
                </button>
              </li>
            ))}
          </ul>
          <button className="m-btn is-wide" onClick={() => setSaving(true)}>
            <Icon name="plus" />
            {t('m.saveMix')}
          </button>
        </section>
      </div>

      <Sheet open={saving} onClose={() => setSaving(false)} title={t('m.saveMix')}>
        <form className="m-form" onSubmit={save}>
          <label className="m-field">
            <span className="lbl">{t('settings.mixLabel')}</span>
            <input data-autofocus value={name} maxLength={24} placeholder={t('settings.mixName')} enterKeyHint="done" onChange={(e) => setName(e.target.value)} />
          </label>
          <button type="submit" className="m-btn is-primary is-wide" disabled={!name.trim()}>
            {t('settings.mixSave')}
          </button>
        </form>
      </Sheet>
    </div>
  )
}
