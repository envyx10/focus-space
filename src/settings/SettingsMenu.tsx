import { useEffect, useRef, useState, type ReactNode } from 'react'
import { LANGS, useI18n, type Key } from '../i18n'
import Icon from '../lib/Icon'
import { askNotificationPermission, chime, CHIMES, notificationsSupported, type Chime } from '../timer/alerts'
import { DEFAULT_CONFIG, type TimerConfig } from '../timer/timer'
import { LIMITS } from '../timer/timerStore'
import { formatDuration, rangeMs, streak, type Stats } from '../stats/stats'
import { ACCENTS } from '../prefs/accent'
import { TEXT_SCALES, type Prefs, type TextScale } from '../prefs/prefs'
import MixerSlots from './MixerSlots'
import type { ChannelId } from '../audio/channels'
import './settings.css'

const MIN = 60_000

export const PRESETS: { label: string; cfg: Pick<TimerConfig, 'work' | 'short' | 'long'> }[] = [
  { label: '25 / 5', cfg: { work: 25 * MIN, short: 5 * MIN, long: 15 * MIN } },
  { label: '50 / 10', cfg: { work: 50 * MIN, short: 10 * MIN, long: 20 * MIN } },
  { label: '90 / 20', cfg: { work: 90 * MIN, short: 20 * MIN, long: 30 * MIN } },
]

/** The key is shown as is, except the space bar, which has a name in each language. */
export const SHORTCUTS: [string, Key][] = [
  ['key.space', 'key.space.desc'],
  ['N', 'key.n.desc'],
  ['M', 'key.m.desc'],
  ['C', 'key.c.desc'],
  ['F', 'key.f.desc'],
  ['?', 'key.help.desc'],
]

const SCALE_LABEL: Record<TextScale, string> = { m: 'A', l: 'A+', xl: 'A++' }

type Props = {
  prefs: Prefs
  config: TimerConfig
  stats: Stats
  today: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfig: (c: TimerConfig) => void
  onChime: (v: number) => void
  onChimeSound: (s: Chime) => void
  onNotify: (on: boolean) => void
  onCalm: (on: boolean) => void
  onBreakGame: (on: boolean) => void
  onMuted: (on: boolean) => void
  onTextScale: (s: TextScale) => void
  onAccent: (hex: string) => void
  onSaveScene: (name: string) => void
  onApplyScene: (name: string) => void
  onDeleteScene: (name: string) => void
  onImmersive: () => void
  onSlots: (slots: ChannelId[]) => void
}

/** One group of settings: a quiet label, then rows. */
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="set-group" aria-label={title}>
      <h3>{title}</h3>
      <div className="set-rows">{children}</div>
    </section>
  )
}

function Minutes({ label, value, limits, onCommit }: { label: string; value: number; limits: readonly [number, number]; onCommit: (v: number) => void }) {
  return (
    <label className="set-row">
      <span>{label}</span>
      <input
        className="set-num"
        key={value}
        type="number"
        min={limits[0]}
        max={limits[1]}
        defaultValue={value}
        onBlur={(e) => {
          const n = Math.round(Number(e.target.value))
          if (!Number.isFinite(n)) return
          const clamped = Math.min(limits[1], Math.max(limits[0], n))
          if (clamped !== value) onCommit(clamped)
          else e.target.value = String(value)
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </label>
  )
}

function Switch({ label, hint, checked, disabled, onChange }: { label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className={`set-row set-toggle${disabled ? ' is-off' : ''}`}>
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input className="set-switch" type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export default function SettingsMenu(p: Props) {
  const { t, lang, setLang } = useI18n()
  const { open, onOpenChange, config: cfg, prefs } = p
  const [sceneName, setSceneName] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) onOpenChange(false)
    }
    addEventListener('pointerdown', close)
    addEventListener('keydown', close)
    return () => {
      removeEventListener('pointerdown', close)
      removeEventListener('keydown', close)
    }
  }, [open, onOpenChange])

  const setMin = (key: 'work' | 'short' | 'long', min: number) => p.onConfig({ ...cfg, [key]: min * MIN })
  const preset = PRESETS.findIndex((x) => x.cfg.work === cfg.work && x.cfg.short === cfg.short && x.cfg.long === cfg.long)
  const week = rangeMs(p.stats, p.today, 7)
  const today = p.stats[p.today]
  const days = streak(p.stats, p.today)
  const customized = JSON.stringify(cfg) !== JSON.stringify(DEFAULT_CONFIG)

  const toggleNotify = async (on: boolean) => {
    if (!on) {
      setMsg(null)
      return p.onNotify(false)
    }
    const ok = await askNotificationPermission()
    setMsg(ok ? null : t('settings.notifyDenied'))
    p.onNotify(ok)
  }

  return (
    <div className="set" ref={root}>
      <button className="set-btn" aria-expanded={open} aria-haspopup="dialog" title={t('settings.openHint')} onClick={() => onOpenChange(!open)}>
        {t('settings.open')}
        <Icon name="gear" />
      </button>
      {open && (
        <div className="set-panel" role="dialog" aria-label={t('settings.title')}>
          <header className="set-head">
            <div>
              <div className="num">04</div>
              <div className="lbl">{t('settings.title')}</div>
            </div>
            <button className="set-close" onClick={() => onOpenChange(false)} aria-label={t('settings.closeLabel')} title={t('settings.closeHint')}>
              {t('settings.close')}
              <Icon name="close" />
            </button>
          </header>

          <Group title={t('settings.pomodoro')}>
            <div className="set-row">
              <span>{t('settings.rhythm')}</span>
              <span className="set-seg" role="group" aria-label={t('settings.presets')}>
                {PRESETS.map((x, i) => (
                  <button key={x.label} aria-pressed={preset === i} onClick={() => p.onConfig({ ...cfg, ...x.cfg })}>
                    {x.label}
                  </button>
                ))}
              </span>
            </div>
            <Minutes label={t('settings.focusMin')} value={cfg.work / MIN} limits={LIMITS.work} onCommit={(v) => setMin('work', v)} />
            <Minutes label={t('settings.shortMin')} value={cfg.short / MIN} limits={LIMITS.short} onCommit={(v) => setMin('short', v)} />
            <Minutes label={t('settings.longMin')} value={cfg.long / MIN} limits={LIMITS.long} onCommit={(v) => setMin('long', v)} />
            <Minutes label={t('settings.longEvery')} value={cfg.longEvery} limits={LIMITS.longEvery} onCommit={(v) => p.onConfig({ ...cfg, longEvery: v })} />
            <Switch label={t('settings.autoNext')} checked={cfg.autoNext} onChange={(on) => p.onConfig({ ...cfg, autoNext: on })} />
            <Switch label={t('settings.breakGame')} checked={prefs.breakGame} onChange={p.onBreakGame} />
            {customized && (
              <button className="set-act" onClick={() => p.onConfig(DEFAULT_CONFIG)}>
                {t('settings.reset')}
              </button>
            )}
          </Group>

          <Group title={t('settings.alerts')}>
            <label className="set-row set-stack">
              <span>
                {t('settings.chime')}
                <output>{prefs.chimeVolume === 0 ? t('settings.chimeOff') : `${Math.round(prefs.chimeVolume * 100)} %`}</output>
              </span>
              <input
                className="set-range"
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(prefs.chimeVolume * 100)}
                style={{ ['--v' as string]: `${Math.round(prefs.chimeVolume * 100)}%` }}
                aria-label={t('settings.chimeLabel')}
                onChange={(e) => p.onChime(Number(e.target.value) / 100)}
              />
            </label>
            <div className="set-row set-stack">
              <span>{t('settings.chimeSound')}</span>
              <span className="set-seg" role="group" aria-label={t('settings.chimeSound')}>
                {CHIMES.map((s) => (
                  <button
                    key={s}
                    aria-pressed={prefs.chimeSound === s}
                    onClick={() => {
                      p.onChimeSound(s)
                      chime(prefs.chimeVolume, s)
                    }}
                  >
                    {t(`chime.${s}`)}
                  </button>
                ))}
              </span>
            </div>
            <button className="set-act" disabled={prefs.chimeVolume === 0} onClick={() => chime(prefs.chimeVolume, prefs.chimeSound)}>
              {t('settings.chimeTest')}
            </button>
            <Switch
              label={t('settings.notify')}
              hint={notificationsSupported() ? undefined : t('settings.notifyNA')}
              checked={prefs.notify}
              disabled={!notificationsSupported()}
              onChange={toggleNotify}
            />
            <p className="set-note">{t('settings.notifyNote')}</p>
            {msg && (
              <p className="set-note set-warn" role="status">
                {msg}
              </p>
            )}
          </Group>

          <Group title={t('settings.screen')}>
            <div className="set-row">
              <span>{t('settings.language')}</span>
              <span className="set-seg" role="group" aria-label={t('settings.language')}>
                {LANGS.map((l) => (
                  <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </span>
            </div>
            <Switch label={t('settings.calm')} checked={prefs.calm} onChange={p.onCalm} />
            <div className="set-row">
              <span>{t('settings.textSize')}</span>
              <span className="set-seg" role="group" aria-label={t('settings.textSize')}>
                {TEXT_SCALES.map((s) => (
                  <button key={s} aria-pressed={prefs.textScale === s} onClick={() => p.onTextScale(s)}>
                    {SCALE_LABEL[s]}
                  </button>
                ))}
              </span>
            </div>
            <div className="set-row">
              <span>{t('settings.accent')}</span>
              <span className="set-accent" role="group" aria-label={t('settings.accent')}>
                {ACCENTS.map((c) => (
                  <button key={c} className="set-swatch" style={{ background: c }} aria-label={c} aria-pressed={prefs.accent === c} onClick={() => p.onAccent(c)} />
                ))}
                <input className="set-color" type="color" value={prefs.accent} title={t('settings.accentCustom')} aria-label={t('settings.accentCustom')} onChange={(e) => p.onAccent(e.target.value.toLowerCase())} />
              </span>
            </div>
            <button
              className="set-act"
              onClick={() => {
                onOpenChange(false)
                p.onImmersive()
              }}
            >
              {t('settings.immersive')}
            </button>
          </Group>

          <Group title={t('settings.sound')}>
            <Switch label={t('settings.muteAll')} checked={prefs.muted} onChange={p.onMuted} />
            <p className="set-note">{t('settings.slotsNote')}</p>
            <MixerSlots slots={prefs.slots} variants={prefs.variants} onSlots={p.onSlots} />
            <form
              className="set-row set-scene"
              onSubmit={(e) => {
                e.preventDefault()
                p.onSaveScene(sceneName)
                setSceneName('')
              }}
            >
              <input value={sceneName} maxLength={24} placeholder={t('settings.mixName')} aria-label={t('settings.mixLabel')} onChange={(e) => setSceneName(e.target.value)} />
              <button type="submit" disabled={!sceneName.trim()}>
                {t('settings.mixSave')}
              </button>
            </form>
            {prefs.scenes.map((s) => (
              <div className="set-row set-scene-item" key={s.name}>
                <button onClick={() => p.onApplyScene(s.name)} title={t('settings.mixApply')}>
                  {s.name}
                </button>
                <button className="set-x" aria-label={t('settings.mixDelete', { name: s.name })} title={t('tasks.delete')} onClick={() => p.onDeleteScene(s.name)}>
                  <Icon name="close" />
                </button>
              </div>
            ))}
          </Group>

          <Group title={t('settings.stats')}>
            <dl className="set-list">
              <div>
                <dt>{t('settings.today')}</dt>
                <dd>
                  {formatDuration(today?.focusMs ?? 0)} · {t('settings.sessions', { n: today?.sessions ?? 0 })}
                </dd>
              </div>
              <div>
                <dt>{t('settings.week')}</dt>
                <dd>{formatDuration(week)}</dd>
              </div>
              <div>
                <dt>{t('settings.streak')}</dt>
                <dd>
                  {t(days === 1 ? 'settings.day' : 'settings.days', { n: days })}
                </dd>
              </div>
            </dl>
          </Group>

          <Group title={t('settings.shortcuts')}>
            <dl className="set-list set-keys">
              {SHORTCUTS.map(([k, d]) => (
                <div key={k}>
                  <dt>
                    <kbd>{k.startsWith('key.') ? t(k) : k}</kbd>
                  </dt>
                  <dd>{t(d)}</dd>
                </div>
              ))}
            </dl>
          </Group>

          <Group title={t('settings.about')}>
            <p className="set-note">{t('settings.aboutNote')}</p>
            <a className="set-act" href="/licenses.txt" target="_blank" rel="noopener">
              {t('settings.aboutLicenses')}
            </a>
            <a className="set-act" href="https://github.com/envyx10/focus-space" target="_blank" rel="noopener noreferrer">
              {t('settings.aboutSource')}
            </a>
          </Group>
        </div>
      )}
    </div>
  )
}
