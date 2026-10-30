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
  sceneControl?: ReactNode
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
        <div className="focus-right">
          {p.sceneControl}
          <div className="seg-row">
            {p.mode === 'free' && (
              <div className="stepper" role="group" aria-label="Minutos">
                <button aria-label="Menos minutos" onClick={() => p.onFreeMinutes(Math.max(1, p.freeMinutes - 5))}>
                  −
                </button>
                <span>{p.freeMinutes} min</span>
                <button aria-label="Más minutos" onClick={() => p.onFreeMinutes(Math.min(240, p.freeMinutes + 5))}>
                  +
                </button>
              </div>
            )}
            <div className="seg" role="group" aria-label="Modo del temporizador">
              <button aria-pressed={p.mode === 'pomodoro'} onClick={() => p.onModeChange('pomodoro')}>
                Pomodoro
              </button>
              <button aria-pressed={p.mode === 'free'} onClick={() => p.onModeChange('free')}>
                Libre
              </button>
            </div>
          </div>
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
        <span className="actions">
          <button className="btn" onClick={p.onReset}>
            ↺ Reiniciar
          </button>
          {p.running ? (
            <button className="btn primary" onClick={p.onPause}>
              ❚❚ Pausar
            </button>
          ) : (
            <button className="btn primary" onClick={p.onStart}>
              ▶ Iniciar
            </button>
          )}
        </span>
      </div>
    </div>
  )
}
