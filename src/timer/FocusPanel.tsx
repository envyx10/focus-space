import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Phase, TimerMode } from './timer'
import type { TimerStatus } from './useTimer'
import './focus.css'

type Props = {
  remainingMs: number
  running: boolean
  status: TimerStatus
  mode: TimerMode
  phase: Phase
  freeMinutes: number
  activeTaskText: string | null
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onExtend: () => void
  onModeChange: (m: TimerMode) => void
  onFreeMinutes: (min: number) => void
  now: Date
  /** Bumped by the Space shortcut: does what the main button does. */
  toggleSignal?: number
  sceneControl?: ReactNode
  children?: ReactNode
}

const PHASE_LABEL: Record<Phase, string> = { work: 'Focus', short: 'Descanso', long: 'Descanso largo' }
const pad = (n: number) => String(n).padStart(2, '0')

export default function FocusPanel(p: Props) {
  // Opens on the local time; a running timer (e.g. after a reload) takes the stage instead.
  const [clock, setClock] = useState(!p.running)
  const total = Math.ceil(p.remainingMs / 1000)
  const hhmm = `${pad(p.now.getHours())}:${pad(p.now.getMinutes())}`
  const [big, small] = clock
    ? [pad(p.now.getHours()), pad(p.now.getMinutes())]
    : [pad(Math.floor(total / 60)), pad(total % 60)]
  const label = clock ? 'Hora local' : p.mode === 'free' ? 'Tiempo libre' : PHASE_LABEL[p.phase]
  // A phase with time already spent is worth a second thought before it is thrown away.
  const inProgress = p.running || p.status === 'paused'
  const sure = (what: string) => !inProgress || window.confirm(`${what} Se perderá el tiempo de esta fase.`)
  const pick = (m: TimerMode) => {
    if (m !== p.mode && !sure('¿Cambiar de modo?')) return
    setClock(false)
    p.onModeChange(m)
  }
  const start = () => {
    setClock(false)
    if (!p.running) p.onStart()
  }
  const live = useRef({ clock, running: p.running, start, pause: p.onPause })
  live.current = { clock, running: p.running, start, pause: p.onPause }
  const lastSignal = useRef(p.toggleSignal)
  useEffect(() => {
    if (p.toggleSignal === lastSignal.current) return
    lastSignal.current = p.toggleSignal
    const l = live.current
    if (l.running && !l.clock) l.pause()
    else l.start()
  }, [p.toggleSignal])

  return (
    <div className="focus">
      <div className="focus-bg">{p.children}</div>

      <div className="focus-top">
        <div>
          <div className="num">02</div>
          <div className="lbl">{label}</div>
          {/* the other clock, small: local time over a timer, or a running timer over the time */}
          {!clock ? (
            <div className="mini-clock" aria-label="Hora local">
              {hhmm}
            </div>
          ) : (
            p.running && (
              <div className="mini-clock" aria-label="Temporizador">
                {pad(Math.floor(total / 60))}:{pad(total % 60)}
              </div>
            )
          )}
        </div>
        <div className="focus-right">
          {p.sceneControl}
          <div className="seg-row">
            {!clock && p.mode === 'free' && (
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
              <button aria-pressed={clock} onClick={() => setClock(true)}>
                Hora
              </button>
              <button aria-pressed={!clock && p.mode === 'pomodoro'} onClick={() => pick('pomodoro')}>
                Pomodoro
              </button>
              <button aria-pressed={!clock && p.mode === 'free'} onClick={() => pick('free')}>
                Libre
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="big" role="timer" aria-label={clock ? `Son las ${hhmm}` : `${big} minutos ${small} segundos`}>
        <span data-part="min">{big}</span>
        <span className={`colon${p.running || clock ? ' blink' : ''}`} aria-hidden>
          <i />
          <i />
        </span>
        <span data-part="sec" className="sec">
          {small}
        </span>
        <sup>{clock ? pad(p.now.getSeconds()) : 'MIN'}</sup>
      </div>

      <div className="focus-meta">
        <span>{p.activeTaskText ?? <span className="focus-dim">Sin tarea activa</span>}</span>
        <span className="actions">
          {!clock && (
            <button className="btn" onClick={() => sure('¿Reiniciar?') && p.onReset()}>
              ↺ Reiniciar
            </button>
          )}
          {!clock && p.mode === 'pomodoro' && (
            <>
              <button className="btn" onClick={p.onExtend} title="Añadir 5 minutos a esta fase">
                +5 min
              </button>
              <button className="btn" onClick={p.onSkip} title="Saltar a la siguiente fase">
                ⏭ Saltar
              </button>
            </>
          )}
          {p.running && !clock ? (
            <button className="btn primary" onClick={p.onPause}>
              ❚❚ Pausar
            </button>
          ) : (
            <button className="btn primary" onClick={start}>
              {p.running ? '▶ Temporizador' : p.status === 'waiting' ? `▶ Empezar ${label.toLowerCase()}` : p.status === 'paused' ? '▶ Seguir' : '▶ Iniciar'}
            </button>
          )}
        </span>
      </div>
    </div>
  )
}
