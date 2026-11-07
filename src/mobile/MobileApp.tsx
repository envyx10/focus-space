import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useT } from '../i18n'
import Icon, { type IconName } from '../lib/Icon'
import type { useAmbient } from '../audio/useAmbient'
import type { useSession } from '../auth/useSession'
import type { useYouTubeLofi } from '../lofi/useYouTubeLofi'
import type { Stats } from '../stats/stats'
import type { useTasks } from '../tasks/useTasks'
import type { useTimer } from '../timer/useTimer'
import FocusView from './FocusView'
import { phaseName } from './labels'
import { haptic, MOBILE_TABS, useKeyboard, type MobileTab } from './platform'
import SettingsView from './SettingsView'
import SoundView from './SoundView'
import TasksView from './TasksView'
import './mobile.css'


const TAB_ICON: Record<MobileTab, IconName> = { focus: 'timer', tasks: 'list', sound: 'wave', settings: 'gear' }
const TAB_LABEL: Record<MobileTab, string> = { focus: 'm.tab.focus', tasks: 'tabs.tasks', sound: 'tabs.mixer', settings: 'settings.title' }
const TEXT_SCALE = { m: 1, l: 1.12, xl: 1.25 }

type Props = {
  tab: MobileTab
  onTab: (tab: MobileTab) => void
  /** Accent, display font and their contrast colours: the same variables the desktop grid gets. */
  style: CSSProperties
  timer: ReturnType<typeof useTimer>
  tasks: ReturnType<typeof useTasks>
  synced: boolean
  ambient: ReturnType<typeof useAmbient>
  lofi: ReturnType<typeof useYouTubeLofi>
  onStation: (i: number) => void
  session: ReturnType<typeof useSession>
  stats: Stats
  today: string
  now: Date
  scene: ReactNode
  immersive: boolean
  onImmersive: () => void
  onExitImmersive: () => void
  toggleSignal: number
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The phone app: four full-screen tabs (Focus, Tasks, Sound, Settings) over a bottom tab bar, a mini timer that keeps
 * the running Pomodoro in sight from the other tabs, and sheets for everything secondary. Every tab stays mounted, so
 * each keeps its scroll and drafts, like a native tab bar. All state comes from App's hooks, shared with desktop.
 */
export default function MobileApp(p: Props) {
  const t = useT()
  const shell = useRef<HTMLDivElement>(null)
  const keyboard = useKeyboard(shell)
  const { timer, ambient, lofi } = p
  const { prefs } = ambient
  const pending = p.tasks.tasks.filter((k) => !k.done).length
  const soundOn = !prefs.muted && (lofi.playing || Object.values(prefs.volumes).some((v) => v > 0))
  const showMini = p.tab !== 'focus' && !p.immersive && (timer.status === 'running' || timer.status === 'paused' || timer.status === 'waiting')
  const total = Math.ceil(timer.remainingMs / 1000)
  const phase = phaseName(t, timer.state.mode, timer.state.phase)

  // The platform layer (no tap flash, no pull-to-refresh, fixed root) only while the phone shell is mounted:
  // the desktop page keeps its own behaviour.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.shell = 'mobile'
    return () => {
      delete root.dataset.shell
    }
  }, [])

  const go = (tab: MobileTab) => {
    if (tab === p.tab) {
      // Tapping the current tab scrolls it back to the top, as on iOS and Android.
      shell.current?.querySelector(`[data-view="${tab}"] .m-scroll`)?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    haptic(4)
    p.onTab(tab)
  }

  return (
    <div
      ref={shell}
      className="m-app"
      style={{ ...p.style, '--m-ts': TEXT_SCALE[prefs.textScale] } as CSSProperties}
      data-kb={keyboard || undefined}
      data-immersive={p.immersive || undefined}
      data-mini={showMini || undefined}
      data-calm={prefs.calm || undefined}
    >
      <div className="m-views">
        {MOBILE_TABS.map((id) => (
          <section key={id} className={`m-view m-view-${id}`} data-view={id} data-active={p.tab === id || undefined} inert={p.tab !== id} aria-label={t(TAB_LABEL[id])}>
            {id === 'focus' && (
              <FocusView
                timer={timer}
                now={p.now}
                tasks={p.tasks.tasks}
                setActive={p.tasks.setActive}
                scene={p.scene}
                breakGame={prefs.breakGame}
                muted={prefs.muted}
                onMute={() => ambient.setMuted(!prefs.muted)}
                immersive={p.immersive}
                onImmersive={p.onImmersive}
                onExitImmersive={p.onExitImmersive}
                toggleSignal={p.toggleSignal}
                onOpenTasks={() => p.onTab('tasks')}
              />
            )}
            {id === 'tasks' && <TasksView tasks={p.tasks} synced={p.synced} onFocus={() => p.onTab('focus')} />}
            {id === 'sound' && <SoundView ambient={ambient} lofi={lofi} onStation={p.onStation} />}
            {id === 'settings' && (
              <SettingsView
                ambient={ambient}
                config={timer.config}
                onConfig={timer.setConfig}
                stats={p.stats}
                today={p.today}
                session={p.session}
                onImmersive={() => {
                  p.onTab('focus')
                  p.onImmersive()
                }}
              />
            )}
          </section>
        ))}
      </div>

      {showMini && (
        <div className={`m-mini${timer.running ? ' is-running' : ''}`}>
          <button className="m-mini-main" onClick={() => go('focus')} aria-label={t('m.backToTimer', { phase, time: `${pad(Math.floor(total / 60))}:${pad(total % 60)}` })}>
            <span className="m-mini-dot" aria-hidden />
            <span className="m-mini-phase">{phase}</span>
            <span className="m-mini-time">
              {pad(Math.floor(total / 60))}:{pad(total % 60)}
            </span>
          </button>
          <button
            className="m-mini-btn"
            onClick={() => {
              haptic(8)
              if (timer.running) timer.pause()
              else timer.start()
            }}
            aria-label={timer.running ? t('focus.pause') : t('focus.resume')}
          >
            <Icon name={timer.running ? 'pause' : 'play'} />
          </button>
        </div>
      )}

      <nav className="m-tabbar" aria-label={t('tabs.label')}>
        {MOBILE_TABS.map((id) => (
          <button key={id} className="m-tab" aria-current={p.tab === id ? 'page' : undefined} onClick={() => go(id)}>
            <span className="m-tab-icon">
              <Icon name={TAB_ICON[id]} />
              {id === 'tasks' && pending > 0 && <span className="m-badge">{pending > 99 ? '99+' : pending}</span>}
              {id === 'sound' && soundOn && <span className="m-live-dot" aria-label={t('m.soundOn')} />}
              {id === 'focus' && timer.running && p.tab !== 'focus' && <span className="m-live-dot" aria-label={t('status.running')} />}
            </span>
            <span className="m-tab-label">{t(TAB_LABEL[id])}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
