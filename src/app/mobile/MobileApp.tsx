import { lazy, Suspense, useEffect, useRef, type CSSProperties } from 'react'
import type { AppState } from '@/app/hooks/useAppState'
import { useT } from '@/i18n'
import MiniTimer from './components/MiniTimer'
import TabBar from './components/TabBar'
import { haptic, useKeyboard } from './platform'
import { MOBILE_TABS, TAB_LABEL, type MobileTab } from './tabs'
import FocusView from './views/FocusView'
import SettingsView from './views/SettingsView'
import SoundView from './views/SoundView'
import TasksView from './views/TasksView'
import './styles/index.css'

const Scene3D = lazy(() => import('@/features/visual/Scene3D'))

const TEXT_SCALE = { m: 1, l: 1.12, xl: 1.25 }

type Props = {
  app: AppState
  tab: MobileTab
  onTab: (tab: MobileTab) => void
}

/**
 * The phone app: four full-screen tabs (Focus, Tasks, Sound, Settings) over a bottom tab bar, a mini timer that keeps
 * the running Pomodoro in sight from the other tabs, and sheets for everything secondary. Every tab stays mounted, so
 * each keeps its scroll and drafts, like a native tab bar. All state comes from App's hooks, shared with desktop.
 */
export default function MobileApp({ app, tab, onTab }: Props) {
  const t = useT()
  const shell = useRef<HTMLDivElement>(null)
  const keyboard = useKeyboard(shell)
  const { timer, ambient, prefs, tasks, immersive } = app
  const showMini = tab !== 'focus' && !immersive.immersive && (timer.status === 'running' || timer.status === 'paused' || timer.status === 'waiting')

  // The platform layer (no tap flash, no pull-to-refresh, fixed root) only while the phone shell is mounted:
  // the desktop page keeps its own behaviour.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.shell = 'mobile'
    return () => {
      delete root.dataset.shell
    }
  }, [])

  const go = (next: MobileTab) => {
    if (next === tab) {
      // Tapping the current tab scrolls it back to the top, as on iOS and Android.
      shell.current?.querySelector(`[data-view="${next}"] .m-scroll`)?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    haptic(4)
    onTab(next)
  }

  const scene = !prefs.calm && (
    <Suspense fallback={null}>
      {/* paused off the Focus tab: no 60 fps simulation nobody sees */}
      <Scene3D getLevels={app.getLevels} accent={prefs.accent} paused={tab !== 'focus'} />
    </Suspense>
  )

  return (
    <div
      ref={shell}
      className="m-app"
      style={{ ...app.themeStyle, '--m-ts': TEXT_SCALE[prefs.textScale] } as CSSProperties}
      data-kb={keyboard || undefined}
      data-immersive={immersive.immersive || undefined}
      data-mini={showMini || undefined}
      data-calm={prefs.calm || undefined}
    >
      <div className="m-views">
        {MOBILE_TABS.map((id) => (
          <section key={id} className={`m-view m-view-${id}`} data-view={id} data-active={tab === id || undefined} inert={tab !== id} aria-label={t(TAB_LABEL[id])}>
            {id === 'focus' && (
              <FocusView
                timer={timer}
                now={app.now}
                weather={app.weather}
                tasks={tasks.tasks}
                setActive={tasks.setActive}
                scene={scene}
                breakGame={prefs.breakGame}
                muted={prefs.muted}
                onMute={() => ambient.setMuted(!prefs.muted)}
                immersive={immersive.immersive}
                onImmersive={immersive.enter}
                onExitImmersive={immersive.exit}
                toggleSignal={app.toggleSignal}
                onOpenTasks={() => onTab('tasks')}
              />
            )}
            {id === 'tasks' && <TasksView tasks={tasks} synced={app.synced} onFocus={() => onTab('focus')} />}
            {id === 'sound' && <SoundView ambient={ambient} lofi={app.lofi} onStation={app.selectStation} />}
            {id === 'settings' && (
              <SettingsView
                ambient={ambient}
                config={timer.config}
                onConfig={timer.setConfig}
                stats={app.stats}
                today={app.today}
                session={app.session}
                onImmersive={() => {
                  onTab('focus')
                  immersive.enter()
                }}
              />
            )}
          </section>
        ))}
      </div>

      {showMini && <MiniTimer timer={timer} onOpen={() => go('focus')} />}

      <TabBar
        tab={tab}
        onTab={go}
        pending={tasks.tasks.filter((k) => !k.done).length}
        soundOn={!prefs.muted && (app.lofi.playing || Object.values(prefs.volumes).some((v) => v > 0))}
        timerRunning={timer.running}
      />
    </div>
  )
}
