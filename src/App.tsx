import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import MixerBar from './audio/MixerBar'
import { beatPulse, mergeLevels } from './audio/pulse'
import { useAmbient } from './audio/useAmbient'
import Header, { formatDay } from './layout/Header'
import Weather, { useWeather } from './layout/Weather'
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

// three.js is ~150 kB gzip: load it after the first paint so the clock and tasks appear instantly.
const Scene3D = lazy(() => import('./visual/Scene3D'))

const ZOOM = { m: 1, l: 1.15, xl: 1.3 }

const clock = (ms: number) => {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const MOBILE_TABS = ['tasks', 'mixer', 'lofi'] as const
type MobileTab = (typeof MOBILE_TABS)[number]

export default function App() {
  const { t, lang } = useI18n()
  const weather = useWeather()
  const ambient = useAmbient()
  const { prefs } = ambient
  // Light mode is switched off for now: whatever was saved, the app stays dark.
  useTheme('dark')
  const [stats, setStats] = useState(loadStats)
  useEffect(() => saveStats(stats), [stats])
  const timer = useTimer({
    // "Mute all" covers the end-of-phase chime too.
    chimeVolume: prefs.muted ? 0 : prefs.chimeVolume,
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
  // Phones show one of the lower panels at a time, picked from the bottom tab bar (CSS hides the bar on desktop).
  const [mobileTab, setMobileTab] = useState<MobileTab>('tasks')
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

  useShortcuts({
    toggleTimer: () => setToggleSignal((n) => n + 1),
    newTask: () => document.querySelector<HTMLInputElement>('[data-new-task]')?.focus(),
    mute: () => ambient.setMuted(!prefs.muted),
    calm: () => ambient.setCalm(!prefs.calm),
    immersive: () => (immersive ? exitImmersive() : enterImmersive()),
    settings: () => setSettingsOpen((o) => !o),
    escape: () => (immersive ? exitImmersive() : setSettingsOpen(false)),
  })

  // What the 3D follows: the ambient channels, plus a synthetic lofi groove while the stream plays
  // (YouTube's iframe audio can't be analysed).
  const getLevels = useCallback(() => {
    const groove = lofiPlaying.current ? beatPulse(performance.now() / 1000) : null
    return mergeLevels(ambient.getLevels(), null, groove)
  }, [ambient.getLevels])

  const zoom = ZOOM[prefs.textScale]

  return (
    <div className="app" style={{ ...displayFont, '--zoom': zoom, '--accent': prefs.accent, '--on-accent': onAccent(prefs.accent) } as CSSProperties} data-immersive={immersive || undefined} data-muted={prefs.muted || undefined} data-tab={mobileTab}>
      <header className="region-header" data-region="header">
        <Header
          sessionNumber={timer.sessionNumber}
          now={now}
          weather={weather}
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
          prioritize={tasks.prioritize}
          sortByPriority={tasks.sortByPriority}
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
          dateSlot={
            <>
              {formatDay(now, lang)} <Weather now={weather} />
            </>
          }
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
          onStation={(i) => {
            lofi.select(i)
            ambient.setLofiStation(((i % STATIONS.length) + STATIONS.length) % STATIONS.length)
          }}
        />
      </section>
      <nav className="m-tabs" aria-label={t('tabs.label')}>
        {MOBILE_TABS.map((id) => (
          <button
            key={id}
            aria-pressed={mobileTab === id}
            onClick={() => {
              setMobileTab(id)
              requestAnimationFrame(() => document.querySelector(`[data-region="${id}"]`)?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' }))
            }}
          >
            {t(`tabs.${id}`)}
          </button>
        ))}
      </nav>
      {!prefs.calm && <Grain />}
    </div>
  )
}
