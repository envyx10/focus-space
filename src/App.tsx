import Header from './layout/Header'
import Grain from './visual/Grain'

export default function App() {
  return (
    <div className="app">
      <header className="region-header" data-region="header">
        <Header sessionNumber={1} now={new Date()} accountSlot={<span>Cuenta ↗</span>} />
      </header>
      <section className="region-tasks" data-region="tasks" />
      <main className="region-focus" data-region="focus" />
      <section className="region-mixer" data-region="mixer" />
      <section className="region-lofi" data-region="lofi" />
      <Grain />
    </div>
  )
}
