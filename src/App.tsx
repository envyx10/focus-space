import MixerBar from './audio/MixerBar'
import { useAmbient } from './audio/useAmbient'
import Header from './layout/Header'
import LofiBlock from './lofi/LofiBlock'
import { useYouTubeLofi } from './lofi/useYouTubeLofi'
import { localRepo } from './tasks/localRepo'
import TasksPanel from './tasks/TasksPanel'
import { useTasks } from './tasks/useTasks'
import FocusPanel from './timer/FocusPanel'
import { useTimer } from './timer/useTimer'
import Grain from './visual/Grain'
import Sphere from './visual/Sphere'

export default function App() {
  const timer = useTimer()
  const ambient = useAmbient()
  const lofi = useYouTubeLofi(ambient.prefs.lofiVolume)
  const tasks = useTasks(localRepo)
  const activeTask = tasks.tasks.find((t) => t.active)

  return (
    <div className="app">
      <header className="region-header" data-region="header">
        <Header sessionNumber={timer.sessionNumber} now={new Date()} accountSlot={<span>Cuenta ↗</span>} />
      </header>
      <section className="region-tasks" data-region="tasks">
        <TasksPanel
          tasks={tasks.tasks}
          synced={false}
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
        >
          <Sphere getLevels={ambient.getLevels} />
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
        />
      </section>
      <Grain />
    </div>
  )
}
