import type { ReactNode } from 'react'
import type { Phase, TimerMode } from './timer'
import './focus.css'

type Props = {
  remainingMs: number
  running: boolean
  mode: TimerMode
  phase: Phase
  freeMinutes: number
  activeTaskText: string | null
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onModeChange: (m: TimerMode) => void
  onFreeMinutes: (min: number) => void
  children?: ReactNode
}

const PHASE_LABEL: Record<Phase, string> = { work: 'Focus', short: 'Descanso', long: 'Descanso largo' }

export default function FocusPanel(p: Props) {
  const total = Math.ceil(p.remainingMs / 1000)
  const min = String(Math.floor(total / 60)).padStart(2, '0')
  const sec = String(total % 60).padStart(2, '0')
  const label = p.mode === 'free' ? 'Tiempo libre' : PHASE_LABEL[p.phase]

  return (
    <div className="focus">
      <div className="focus-bg">{p.children}</div>

      <div className="focus-top">
        <div>
          <div className="num">02</div>
          <div className="lbl">{label}</div>
        </div>
        <div className="focus-ctl">
          <button className={p.mode === 'pomodoro' ? 'on' : ''} onClick={() => p.onModeChange('pomodoro')}>
            Pomodoro
          </button>
          <button className={p.mode === 'free' ? 'on' : ''} onClick={() => p.onModeChange('free')}>
            Libre
          </button>
          {p.mode === 'free' && (
            <label className="focus-free">
              <input
                type="number"
                min={1}
                max={240}
                value={p.freeMinutes}
                aria-label="Minutos"
                onChange={(e) => {
                  const v = Math.round(Number(e.target.value))
                  if (v >= 1 && v <= 240) p.onFreeMinutes(v)
                }}
              />
              min
            </label>
          )}
        </div>
      </div>

      <div className="big" role="timer" aria-label={`${min} minutos ${sec} segundos`}>
        <span data-part="min">{min}</span>
        <span className={`colon${p.running ? ' blink' : ''}`} aria-hidden>
          <i />
          <i />
        </span>
        <span data-part="sec" className="sec">
          {sec}
        </span>
        <sup>MIN</sup>
      </div>

      <div className="focus-meta">
        <span>{p.activeTaskText ?? <span className="focus-dim">Sin tarea activa</span>}</span>
        <span className="focus-ctl">
          {p.running ? (
            <button onClick={p.onPause}>❚❚ Pausar</button>
          ) : (
            <button className="acc" onClick={p.onStart}>
              ▶ Iniciar
            </button>
          )}
          <button onClick={p.onReset}>↺ Reiniciar</button>
        </span>
      </div>
    </div>
  )
}
