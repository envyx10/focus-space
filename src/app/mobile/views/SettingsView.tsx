import AccountGroup from '@/app/mobile/components/AccountGroup'
import { Group, Seg, Stepper, Toggle } from '@/app/mobile/components/SettingsControls'
import Slider from '@/app/mobile/components/Slider'
import { useLargeTitle } from '@/app/mobile/hooks/useLargeTitle'
import type { Ambient } from '@/features/audio/useAmbient'
import type { AuthSession } from '@/features/auth/useSession'
import { ACCENTS } from '@/features/prefs/accent'
import { TEXT_SCALES } from '@/features/prefs/prefs'
import { isCustomized, MIN, presetIndex, PRESETS, SCALE_LABEL } from '@/features/settings/options'
import ShortcutList from '@/features/settings/ShortcutList'
import { useNotifyToggle } from '@/features/settings/useNotifyToggle'
import { formatDuration, rangeMs, streak, type Stats } from '@/features/stats/stats'
import { chime, CHIMES, notificationsSupported } from '@/features/timer/alerts'
import { DEFAULT_CONFIG, type TimerConfig } from '@/features/timer/timer'
import { LIMITS } from '@/features/timer/timerStore'
import { TYPEFACES } from '@/features/visual/typefaces'
import { LANGS, useI18n } from '@/i18n'
import Icon from '@/shared/ui/Icon'

type Props = {
  ambient: Ambient
  config: TimerConfig
  onConfig: (c: TimerConfig) => void
  stats: Stats
  today: string
  session: AuthSession
  onImmersive: () => void
}

export default function SettingsView({ ambient, config: cfg, onConfig, stats, today: todayKey, session, onImmersive }: Props) {
  const { t, lang, setLang } = useI18n()
  const { prefs } = ambient
  const notify = useNotifyToggle(ambient.setNotify)
  const { compact, onScroll } = useLargeTitle()
  const preset = presetIndex(cfg)
  const customized = isCustomized(cfg)
  const day = stats[todayKey]
  const days = streak(stats, todayKey)
  const setMin = (key: 'work' | 'short' | 'long', min: number) => onConfig({ ...cfg, [key]: min * MIN })

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

        <AccountGroup session={session} />

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
          <Toggle label={t('settings.notify')} hint={notificationsSupported() ? t('settings.notifyNote') : t('settings.notifyNA')} checked={prefs.notify} disabled={!notificationsSupported()} onChange={notify.toggle} />
          {notify.message && (
            <p className="m-rowset m-note is-accent" role="status">
              {notify.message}
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
          <ShortcutList className="m-keys" />
        </Group>

        <p className="m-foot-note">Focus/Space</p>
      </div>
    </div>
  )
}
