import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import MixerBar from './audio/MixerBar'
import { beatPulse, mergeLevels } from './audio/pulse'
import { useAmbient } from './audio/useAmbient'
import Header from './layout/Header'
import LofiBlock from './lofi/LofiBlock'
import { STATIONS, useYouTubeLofi } from './lofi/useYouTubeLofi'
import AccountMenu from './auth/AccountMenu'
import { supabase } from './auth/supabase'
import { useSession } from './auth/useSession'
import Icon from './lib/Icon'
import { useShortcuts } from './lib/useShortcuts'
import { onAccent } from './prefs/accent'
import SettingsMenu from './settings/SettingsMenu'
import { addFocus, loadStats, saveStats } from './stats/stats'
import FocusTasks from './tasks/FocusTasks'
import BreakCorner from './break/BreakCorner'
import TasksPanel from './tasks/TasksPanel'
import { useTaskRepo } from './tasks/useTaskRepo'
import { useTasks } from './tasks/useTasks'
import { useI18n } from './i18n'
import { phaseLabel, useTabTitle } from './timer/alerts'
import FocusPanel from './timer/FocusPanel'
import { todayKey } from './timer/timerStore'
import { useTimer } from './timer/useTimer'
import Grain from './visual/Grain'
import Cycler from './visual/Cycler'
import { TYPEFACES } from './visual/typefaces'
import { useTypeface } from './visual/useTypeface'
import { useTheme } from './prefs/useTheme'
import { MOBILE_QUERY, MOBILE_TABS, useMediaQuery, type MobileTab } from './mobile/platform'

// three.js is ~150 kB gzip: load it after the first paint so the clock and tasks appear instantly.
const Scene3D = lazy(() => import('./visual/Scene3D'))
// The phone shell is its own chunk: desktop never downloads it, phones fetch it right after the first paint.
const MobileApp = lazy(() => import('./mobile/MobileApp'))

const ZOOM = { m: 1, l: 1.15, xl: 1.3 }

const initialTab = (): MobileTab => {
  const tab = new URLSearchParams(location.search).get('tab')
  return MOBILE_TABS.find((x) => x === tab) ?? 'focus'
}

const clock = (ms: number) => {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function App() {
  const { t } = useI18n()
  const ambient = useAmbient()
  const { prefs } = ambient
  // Light mode is switched off for now: whatever was saved, the app stays dark.
  useTheme('dark')
  const [stats, setStats] = useState(loadStats)
  useEffect(() => saveStats(stats), [stats])
  const timer = useTimer({
    chimeVolume: prefs.chimeVolume,
    chimeSound: prefs.chimeSound,
    notify: prefs.notify,
    onFocus: (ms, sessions) => setStats((s) => addFocus(s, todayKey(), ms, sessions)),
  })
  const lofi = useYouTubeLofi(prefs.lofiVolume, prefs.lofiStation, prefs.muted)
  const session = useSession(supabase)
  const { repo, synced } = useTaskRepo(supabase, session.user)
  const tasks = useTasks(repo)
  const activeTask = tasks.tasks.find((t) => t.active)
  const displayFont = useTypeface(prefs.font)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const lofiPlaying = useRef(lofi.playing)
  lofiPlaying.current = lofi.playing

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [immersive, setImmersive] = useState(false)
  // Below 1024 px the phone shell (src/mobile) takes over: its own screens, the same hooks and state.
  const mobile = useMediaQuery(MOBILE_QUERY)
  // A home-screen shortcut (manifest.webmanifest) opens straight on a tab: /?tab=tasks
  const [mobileTab, setMobileTab] = useState<MobileTab>(initialTab)
  const [toggleSignal, setToggleSignal] = useState(0)

  useTabTitle(timer.running, timer.remainingMs, phaseLabel(t, timer.state.mode, timer.state.phase), timer.status === 'waiting')

  const enterImmersive = useCallback(() => {
    setImmersive(true)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }, [])
  const exitImmersive = useCallback(() => {
    setImmersive(false)
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }, [])
  // Leaving fullscreen with the browser's own Esc also leaves immersion.
  useEffect(() => {
    const onChange = () => !document.fullscreenElement && setImmersive(false)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Closing or reloading the tab while a task's text is being edited: blur commits it before the page goes.
  useEffect(() => {
    const onHide = () => (document.activeElement as HTMLElement | null)?.blur?.()
    addEventListener('pagehide', onHide)
    return () => removeEventListener('pagehide', onHide)
  }, [])

  // On the phone shell, single-key shortcuts wait while a sheet (a modal) is open: Space must not start the timer behind it.
  const free = (fn: () => void) => () => (mobile && document.querySelector('.m-sheet-root') ? undefined : fn())
  useShortcuts({
    toggleTimer: free(() => setToggleSignal((n) => n + 1)),
    newTask: free(() => document.querySelector<HTMLInputElement>('[data-new-task]')?.focus()),
    mute: free(() => ambient.setMuted(!prefs.muted)),
    calm: free(() => ambient.setCalm(!prefs.calm)),
    immersive: free(() => (immersive ? exitImmersive() : enterImmersive())),
    settings: () => (mobile ? setMobileTab((tab) => (tab === 'settings' ? 'focus' : 'settings')) : setSettingsOpen((o) => !o)),
    escape: () => (immersive ? exitImmersive() : setSettingsOpen(false)),
  })

  // What the 3D follows: the ambient channels, plus a synthetic lofi groove while the stream plays
  // (YouTube's iframe audio can't be analysed).
  const getLevels = useCallback(() => {
    const groove = lofiPlaying.current ? beatPulse(performance.now() / 1000) : null
    return mergeLevels(ambient.getLevels(), null, groove)
  }, [ambient.getLevels])

  const zoom = ZOOM[prefs.textScale]
  const onStation = (i: number) => {
    lofi.select(i)
    ambient.setLofiStation(((i % STATIONS.length) + STATIONS.length) % STATIONS.length)
  }

  if (mobile) {
    return (
      <Suspense fallback={null}>
      <MobileApp
        tab={mobileTab}
        onTab={setMobileTab}
        style={{ ...displayFont, '--accent': prefs.accent, '--on-accent': onAccent(prefs.accent) } as CSSProperties}
        timer={timer}
        tasks={tasks}
        synced={synced}
        ambient={ambient}
        lofi={lofi}
        onStation={onStation}
        session={session}
        stats={stats}
        today={todayKey(now)}
        now={now}
        scene={
          !prefs.calm && (
            <Suspense fallback={null}>
              {/* paused off the Focus tab: no 60 fps simulation nobody sees */}
              <Scene3D getLevels={getLevels} accent={prefs.accent} paused={mobileTab !== 'focus'} />
            </Suspense>
          )
        }
        immersive={immersive}
        onImmersive={enterImmersive}
        onExitImmersive={exitImmersive}
        toggleSignal={toggleSignal}
      />
      </Suspense>
    )
  }

  return (
    <div className="app" style={{ ...displayFont, '--zoom': zoom, '--accent': prefs.accent, '--on-accent': onAccent(prefs.accent) } as CSSProperties} data-immersive={immersive || undefined} data-muted={prefs.muted || undefined}>
      <header className="region-header" data-region="header">
        <Header
          sessionNumber={timer.sessionNumber}
          now={now}
          status={timer.status}
          muteSlot={
            // The label flips with the state, so no aria-pressed; aria-label keeps a name on phones, where the label is hidden.
            <button className="hd-mute" aria-label={prefs.muted ? t('mute.on') : t('mute.off')} title={t('mute.hint')} onClick={() => ambient.setMuted(!prefs.muted)}>
              <span className="hd-mute-label">{prefs.muted ? t('mute.on') : t('mute.off')}</span>
              <Icon name={prefs.muted ? 'muted' : 'sound'} />
            </button>
          }
          settingsSlot={
            <SettingsMenu
              prefs={prefs}
              config={timer.config}
              stats={stats}
              today={todayKey(now)}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
              onConfig={timer.setConfig}
              onChime={ambient.setChimeVolume}
              onChimeSound={ambient.setChimeSound}
              onNotify={ambient.setNotify}
              onCalm={ambient.setCalm}
              onBreakGame={ambient.setBreakGame}
              onMuted={ambient.setMuted}
              onTextScale={ambient.setTextScale}
              onAccent={ambient.setAccent}
              onSaveScene={ambient.saveScene}
              onApplyScene={ambient.applyScene}
              onDeleteScene={ambient.deleteScene}
              onImmersive={enterImmersive}
              onSlots={ambient.setSlots}
            />
          }
          accountSlot={<AccountMenu session={session} />}
        />
      </header>
      <section className="region-tasks" data-region="tasks">
        <TasksPanel
          tasks={tasks.tasks}
          synced={synced}
          saveError={tasks.error}
          localError={tasks.localError}
          add={tasks.add}
          toggle={tasks.toggle}
          edit={tasks.edit}
          describe={tasks.describe}
          remove={tasks.remove}
          setActive={tasks.setActive}
          move={tasks.move}
          restore={tasks.restore}
          clearDone={tasks.clearDone}
          addMany={tasks.addMany}
        />
      </section>
      <main className="region-focus" data-region="focus">
        <FocusPanel
          remainingMs={timer.remainingMs}
          running={timer.running}
          status={timer.status}
          mode={timer.state.mode}
          phase={timer.state.phase}
          freeMinutes={timer.freeMinutes}
          activeTaskText={activeTask?.text ?? null}
          taskSlot={
            // undefined, not false, when off: the panel falls back to the task line only on null/undefined
            prefs.breakGame ? (
              <BreakCorner
                inBreak={timer.state.mode === 'pomodoro' && timer.state.phase !== 'work' && (timer.status === 'running' || timer.status === 'paused')}
                breakId={`${timer.sessionNumber}-${timer.state.phase}`}
                remaining={clock(timer.remainingMs)}
                fallback={activeTask?.text ?? <span className="focus-dim">{t('focus.noTask')}</span>}
              />
            ) : undefined
          }
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          onSkip={timer.skip}
          onExtend={timer.extend}
          onModeChange={timer.setMode}
          onFreeMinutes={timer.setFreeMinutes}
          now={now}
          toggleSignal={toggleSignal}
          sceneControl={<Cycler
              label={t('type.label')}
              options={TYPEFACES.map((f) => ({ id: f.id, label: f.id === 'suiza' ? t('typeface.suiza') : f.label }))}
              value={prefs.font}
              onChange={ambient.setFont}
            />}
        >
          {!prefs.calm && (
            <Suspense fallback={null}>
              <Scene3D getLevels={getLevels} accent={prefs.accent} />
            </Suspense>
          )}
        </FocusPanel>
        {immersive && <FocusTasks tasks={tasks.tasks} />}
        {immersive && (
          <button className="exit-immersive" onClick={exitImmersive}>
            {t('immersive.exit')}
          </button>
        )}
      </main>
      <section className="region-mixer" data-region="mixer">
        <MixerBar prefs={prefs} onVolume={ambient.setVolume} onVariant={ambient.setVariant} onSlots={ambient.setSlots} />
      </section>
      <section className="region-lofi" data-region="lofi">
        <LofiBlock
          status={lofi.status}
          playing={lofi.playing}
          volume={prefs.lofiVolume}
          onToggle={lofi.toggle}
          onVolume={ambient.setLofiVolume}
          station={lofi.station}
          onStation={onStation}
        />
      </section>
      {!prefs.calm && <Grain />}
    </div>
  )
}
