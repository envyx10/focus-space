import { useState, type FormEvent, type ReactNode } from 'react'
import { LANGS, useI18n } from '../i18n'
import Icon from '../lib/Icon'
import type { useAmbient } from '../audio/useAmbient'
import type { useSession } from '../auth/useSession'
import { ACCENTS } from '../prefs/accent'
import { TEXT_SCALES, type TextScale } from '../prefs/prefs'
import { PRESETS, SHORTCUTS } from '../settings/SettingsMenu'
import { formatDuration, rangeMs, streak, type Stats } from '../stats/stats'
import { askNotificationPermission, chime, CHIMES, notificationsSupported } from '../timer/alerts'
import { DEFAULT_CONFIG, type TimerConfig } from '../timer/timer'
import { LIMITS } from '../timer/timerStore'
import { TYPEFACES } from '../visual/typefaces'
import { haptic } from './platform'
import Slider from './Slider'
import { useLargeTitle } from './useLargeTitle'

const MIN = 60_000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SCALE_LABEL: Record<TextScale, string> = { m: 'A', l: 'A+', xl: 'A++' }

type Props = {
  ambient: ReturnType<typeof useAmbient>
  config: TimerConfig
  onConfig: (c: TimerConfig) => void
  stats: Stats
  today: string
  session: ReturnType<typeof useSession>
  onImmersive: () => void
}

function Group({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`m-group ${className}`} aria-label={title}>
      <h2 className="m-group-h">{title}</h2>
      <div className="m-rows">{children}</div>
    </section>
  )
}

function Toggle({ label, hint, checked, disabled, onChange }: { label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className={`m-rowset m-toggle${disabled ? ' is-disabled' : ''}`}>
      <span className="m-rowset-label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input
        className="m-switch"
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          haptic(6)
          onChange(e.target.checked)
        }}
      />
    </label>
  )
}

/** A whole number with − and + around it: typing digits on a phone is the slow path, so it is optional. */
function Stepper({ label, value, limits, onCommit }: { label: string; value: number; limits: readonly [number, number]; onCommit: (v: number) => void }) {
  const t = useI18n().t
  const set = (v: number) => onCommit(Math.min(limits[1], Math.max(limits[0], v)))
  return (
    <div className="m-rowset">
      <span className="m-rowset-label">{label}</span>
      <span className="m-num" role="group" aria-label={label}>
        <button aria-label={t('m.less', { what: label })} disabled={value <= limits[0]} onClick={() => set(value - 1)}>
          −
        </button>
        <input
          key={value}
          type="number"
          inputMode="numeric"
          enterKeyHint="done"
          min={limits[0]}
          max={limits[1]}
          defaultValue={value}
          aria-label={label}
          onBlur={(e) => {
            const n = Math.round(Number(e.target.value))
            if (Number.isFinite(n) && n !== value) set(n)
            else e.target.value = String(value)
          }}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        <button aria-label={t('m.more', { what: label })} disabled={value >= limits[1]} onClick={() => set(value + 1)}>
          +
        </button>
      </span>
    </div>
  )
}

function Seg<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T | null; onChange: (id: T) => void }) {
  return (
    <span className="m-seg is-small" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </span>
  )
}

function Account({ session }: { session: Props['session'] }) {
  const t = useI18n().t
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const run = async (fn: () => Promise<void>, ok: string | null) => {
    try {
      await fn()
      setMsg(ok)
    } catch {
      setMsg(t('account.offline'))
    }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const clean = email.trim()
    if (!EMAIL_RE.test(clean)) return setMsg(t('account.invalidEmail'))
    run(() => session.signInWithEmail(clean), t('account.linkSent'))
  }

  return (
    <Group title={t('account.title')}>
      {!session.available ? (
        <p className="m-rowset m-note">{t('account.localMode')}</p>
      ) : session.user ? (
        <>
          <div className="m-rowset">
            <span className="m-rowset-label">
              {session.user.email}
              <small>{t('account.syncing')}</small>
            </span>
            <Icon name="user" />
          </div>
          <button className="m-rowset m-link" onClick={() => run(session.signOut, null)}>
            {t('account.signOut')}
          </button>
        </>
      ) : (
        <>
          <p className="m-rowset m-note">{t('m.accountPitch')}</p>
          <form className="m-rowset m-inline-form" onSubmit={submit}>
            <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" enterKeyHint="send" placeholder={t('account.emailPlaceholder')} aria-label={t('account.emailLabel')} value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit">{t('account.sendLink')}</button>
          </form>
          <button className="m-rowset m-link" onClick={() => run(() => session.signInWithProvider('google'), null)}>
            {t('account.google')}
            <Icon name="out" />
          </button>
          <button className="m-rowset m-link" onClick={() => run(() => session.signInWithProvider('github'), null)}>
            {t('account.github')}
            <Icon name="out" />
          </button>
        </>
      )}
      {msg && (
        <p className="m-rowset m-note is-accent" role="status">
          {msg}
        </p>
      )}
    </Group>
  )
}

export default function SettingsView({ ambient, config: cfg, onConfig, stats, today: todayKey, session, onImmersive }: Props) {
  const { t, lang, setLang } = useI18n()
  const { prefs } = ambient
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null)
  const { compact, onScroll } = useLargeTitle()
  const preset = PRESETS.findIndex((x) => x.cfg.work === cfg.work && x.cfg.short === cfg.short && x.cfg.long === cfg.long)
  const customized = JSON.stringify(cfg) !== JSON.stringify(DEFAULT_CONFIG)
  const day = stats[todayKey]
  const days = streak(stats, todayKey)
  const setMin = (key: 'work' | 'short' | 'long', min: number) => onConfig({ ...cfg, [key]: min * MIN })

  const toggleNotify = async (on: boolean) => {
    if (!on) {
      setNotifyMsg(null)
      return ambient.setNotify(false)
    }
    const ok = await askNotificationPermission()
    setNotifyMsg(ok ? null : t('settings.notifyDenied'))
    ambient.setNotify(ok)
  }

  return (
    <div className="m-screen">
      <header className={`m-bar${compact ? ' is-compact' : ''}`}>
        <span className="m-bar-title" aria-hidden={!compact}>
          {t('settings.title')}
        </span>
      </header>
      <div className="m-scroll" onScroll={onScroll}>
        <div className="m-large">
          <span className="num">04</span>
          <h1>{t('settings.title')}</h1>
        </div>

        <Account session={session} />

        <Group title={t('settings.screen')}>
          <div className="m-rowset">
            <span className="m-rowset-label">{t('settings.textSize')}</span>
            <Seg label={t('settings.textSize')} options={TEXT_SCALES.map((s) => ({ id: s, label: SCALE_LABEL[s] }))} value={prefs.textScale} onChange={ambient.setTextScale} />
          </div>
          <Toggle label={t('settings.calm')} hint={t('m.calmHint')} checked={prefs.calm} onChange={ambient.setCalm} />
          <div className="m-rowset">
            <span className="m-rowset-label">{t('settings.language')}</span>
            <Seg label={t('settings.language')} options={LANGS.map((l) => ({ id: l, label: l.toUpperCase() }))} value={lang} onChange={setLang} />
          </div>
          <div className="m-rowset m-stack">
            <span className="m-rowset-label">{t('settings.accent')}</span>
            <span className="m-swatches" role="group" aria-label={t('settings.accent')}>
              {ACCENTS.map((c) => (
                <button key={c} className="m-swatch" style={{ background: c }} aria-label={c} aria-pressed={prefs.accent === c} onClick={() => ambient.setAccent(c)} />
              ))}
              <label className="m-swatch is-custom" title={t('settings.accentCustom')}>
                <input type="color" value={prefs.accent} aria-label={t('settings.accentCustom')} onChange={(e) => ambient.setAccent(e.target.value.toLowerCase())} />
                <Icon name="plus" />
              </label>
            </span>
          </div>
          <div className="m-rowset m-stack">
            <span className="m-rowset-label">{t('type.label')}</span>
            <span className="m-fonts" role="group" aria-label={t('type.label')}>
              {TYPEFACES.map((f) => (
                <button key={f.id} aria-pressed={prefs.font === f.id} onClick={() => ambient.setFont(f.id)}>
                  {f.id === 'suiza' ? t('typeface.suiza') : f.label}
                </button>
              ))}
            </span>
          </div>
          <button className="m-rowset m-link" onClick={onImmersive}>
            {t('m.fullscreen')}
            <Icon name="fullscreen" />
          </button>
        </Group>

        <Group title={t('settings.pomodoro')}>
          <div className="m-rowset m-stack">
            <span className="m-rowset-label">{t('settings.rhythm')}</span>
            <Seg label={t('settings.presets')} options={PRESETS.map((x, i) => ({ id: String(i), label: x.label }))} value={preset >= 0 ? String(preset) : null} onChange={(i) => onConfig({ ...cfg, ...PRESETS[Number(i)].cfg })} />
          </div>
          <Stepper label={t('m.focusMin')} value={cfg.work / MIN} limits={LIMITS.work} onCommit={(v) => setMin('work', v)} />
          <Stepper label={t('settings.shortMin')} value={cfg.short / MIN} limits={LIMITS.short} onCommit={(v) => setMin('short', v)} />
          <Stepper label={t('settings.longMin')} value={cfg.long / MIN} limits={LIMITS.long} onCommit={(v) => setMin('long', v)} />
          <Stepper label={t('settings.longEvery')} value={cfg.longEvery} limits={LIMITS.longEvery} onCommit={(v) => onConfig({ ...cfg, longEvery: v })} />
          <Toggle label={t('settings.autoNext')} checked={cfg.autoNext} onChange={(on) => onConfig({ ...cfg, autoNext: on })} />
          <Toggle label={t('settings.breakGame')} checked={prefs.breakGame} onChange={ambient.setBreakGame} />
          {customized && (
            <button className="m-rowset m-link" onClick={() => onConfig(DEFAULT_CONFIG)}>
              {t('settings.reset')}
            </button>
          )}
        </Group>

        <Group title={t('settings.alerts')}>
          <div className="m-rowset m-stack">
            <span className="m-rowset-label m-split">
              {t('settings.chime')}
              <output>{prefs.chimeVolume === 0 ? t('settings.chimeOff') : `${Math.round(prefs.chimeVolume * 100)} %`}</output>
            </span>
            <Slider value={prefs.chimeVolume} onChange={ambient.setChimeVolume} label={t('settings.chimeLabel')} />
          </div>
          <div className="m-rowset m-stack">
            <span className="m-rowset-label">{t('settings.chimeSound')}</span>
            <Seg
              label={t('settings.chimeSound')}
              options={CHIMES.map((s) => ({ id: s, label: t(`chime.${s}`) }))}
              value={prefs.chimeSound}
              onChange={(s) => {
                ambient.setChimeSound(s)
                chime(prefs.chimeVolume, s)
              }}
            />
          </div>
          <button className="m-rowset m-link" disabled={prefs.chimeVolume === 0} onClick={() => chime(prefs.chimeVolume, prefs.chimeSound)}>
            {t('settings.chimeTest')}
          </button>
          <Toggle label={t('settings.notify')} hint={notificationsSupported() ? t('settings.notifyNote') : t('settings.notifyNA')} checked={prefs.notify} disabled={!notificationsSupported()} onChange={toggleNotify} />
          {notifyMsg && (
            <p className="m-rowset m-note is-accent" role="status">
              {notifyMsg}
            </p>
          )}
        </Group>


        <Group title={t('settings.stats')}>
          <dl className="m-stats">
            <div>
              <dt>{t('settings.today')}</dt>
              <dd>{formatDuration(day?.focusMs ?? 0)}</dd>
              <dd className="m-dim">{(day?.sessions ?? 0) === 1 ? t('m.oneSession') : t('settings.sessions', { n: day?.sessions ?? 0 })}</dd>
            </div>
            <div>
              <dt>{t('settings.week')}</dt>
              <dd>{formatDuration(rangeMs(stats, todayKey, 7))}</dd>
            </div>
            <div>
              <dt>{t('settings.streak')}</dt>
              <dd>{t(days === 1 ? 'settings.day' : 'settings.days', { n: days })}</dd>
            </div>
          </dl>
        </Group>

        <Group title={t('settings.shortcuts')} className="m-only-keyboard">
          <dl className="m-keys">
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

        <p className="m-foot-note">Focus/Space</p>
      </div>
    </div>
  )
}
