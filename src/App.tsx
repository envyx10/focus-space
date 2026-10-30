import { lazy, Suspense, useCallback, useRef } from 'react'
import MixerBar from './audio/MixerBar'
import { beatPulse, mergeLevels } from './audio/pulse'
import { useMusicSync } from './audio/useMusicSync'
import { useAmbient } from './audio/useAmbient'
import Header from './layout/Header'
import LofiBlock from './lofi/LofiBlock'
import { useYouTubeLofi } from './lofi/useYouTubeLofi'
import AccountMenu from './auth/AccountMenu'
import { supabase } from './auth/supabase'
import { useSession } from './auth/useSession'
import TasksPanel from './tasks/TasksPanel'
import { useTaskRepo } from './tasks/useTaskRepo'
import { useTasks } from './tasks/useTasks'
import FocusPanel from './timer/FocusPanel'
import { useTimer } from './timer/useTimer'
import Grain from './visual/Grain'
import Cycler from './visual/Cycler'
import { TYPEFACES } from './visual/typefaces'
import { useTypeface } from './visual/useTypeface'

// three.js is ~150 kB gzip: load it after the first paint so the clock and tasks appear instantly.
const Scene3D = lazy(() => import('./visual/Scene3D'))

export default function App() {
  const timer = useTimer()
  const ambient = useAmbient()
  const lofi = useYouTubeLofi(ambient.prefs.lofiVolume)
  const session = useSession(supabase)
  const { repo, synced } = useTaskRepo(supabase, session.user)
  const tasks = useTasks(repo)
  const activeTask = tasks.tasks.find((t) => t.active)
  const displayFont = useTypeface(ambient.prefs.font)
  const music = useMusicSync()
  const lofiPlaying = useRef(lofi.playing)
  lofiPlaying.current = lofi.playing

  // What the 3D follows: ambient channels + the real music when the tab is shared,
  // otherwise a synthetic lofi groove while the stream plays.
  const getLevels = useCallback(() => {
    const live = music.getLevels()
    const groove = !live && lofiPlaying.current ? beatPulse(performance.now() / 1000) : null
    return mergeLevels(ambient.getLevels(), live, groove)
  }, [ambient.getLevels, music.getLevels])

  return (
    <div className="app" style={displayFont}>
      <header className="region-header" data-region="header">
        <Header sessionNumber={timer.sessionNumber} now={new Date()} accountSlot={<AccountMenu session={session} />} />
      </header>
      <section className="region-tasks" data-region="tasks">
        <TasksPanel
          tasks={tasks.tasks}
          synced={synced}
          saveError={tasks.error}
          add={tasks.add}
          toggle={tasks.toggle}
          edit={tasks.edit}
          remove={tasks.remove}
          setActive={tasks.setActive}
        />
      </section>
      <main className="region-focus" data-region="focus">
        <FocusPanel
          remainingMs={timer.remainingMs}
          running={timer.running}
          mode={timer.state.mode}
          phase={timer.state.phase}
          freeMinutes={timer.freeMinutes}
          activeTaskText={activeTask?.text ?? null}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          onModeChange={timer.setMode}
          onFreeMinutes={timer.setFreeMinutes}
          sceneControl={
            <Cycler label="Tipo" noun="tipografía" options={TYPEFACES} value={ambient.prefs.font} onChange={ambient.setFont} />
          }
        >
          <Suspense fallback={null}>
            <Scene3D getLevels={getLevels} />
          </Suspense>
        </FocusPanel>
      </main>
      <section className="region-mixer" data-region="mixer">
        <MixerBar prefs={ambient.prefs} onVolume={ambient.setVolume} onVariant={ambient.setVariant} />
      </section>
      <section className="region-lofi" data-region="lofi">
        <LofiBlock
          status={lofi.status}
          playing={lofi.playing}
          volume={ambient.prefs.lofiVolume}
          onToggle={lofi.toggle}
          onVolume={ambient.setLofiVolume}
          sync={music.state}
          onSync={music.toggle}
        />
      </section>
      <Grain />
    </div>
  )
}
