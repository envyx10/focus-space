import Header from './layout/Header'
import FocusPanel from './timer/FocusPanel'
import { useTimer } from './timer/useTimer'
import Grain from './visual/Grain'

export default function App() {
  const timer = useTimer()

  return (
    <div className="app">
      <header className="region-header" data-region="header">
        <Header sessionNumber={timer.sessionNumber} now={new Date()} accountSlot={<span>Cuenta ↗</span>} />
      </header>
      <section className="region-tasks" data-region="tasks" />
      <main className="region-focus" data-region="focus">
        <FocusPanel
          remainingMs={timer.remainingMs}
          running={timer.running}
          mode={timer.state.mode}
          phase={timer.state.phase}
          freeMinutes={timer.freeMinutes}
          activeTaskText={null}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          onModeChange={timer.setMode}
          onFreeMinutes={timer.setFreeMinutes}
        />
      </main>
      <section className="region-mixer" data-region="mixer" />
      <section className="region-lofi" data-region="lofi" />
      <Grain />
    </div>
  )
}
