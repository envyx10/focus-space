import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
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

const pad = (n: number) => String(n).padStart(2, '0')

export default function FocusPanel(p: Props) {
  const t = useT()
  // Opens on the local time; a running timer (e.g. after a reload) takes the stage instead.
  const [clock, setClock] = useState(!p.running)
  const total = Math.ceil(p.remainingMs / 1000)
  const hhmm = `${pad(p.now.getHours())}:${pad(p.now.getMinutes())}`
  const [big, small] = clock
    ? [pad(p.now.getHours()), pad(p.now.getMinutes())]
    : [pad(Math.floor(total / 60)), pad(total % 60)]
  const phaseName = p.mode === 'free' ? t('phase.free') : t(`phase.${p.phase}`)
  const label = clock ? t('focus.localTime') : phaseName
  // A phase with time already spent is worth a second thought before it is thrown away.
  const inProgress = p.running || p.status === 'paused'
  const sure = (ask: string) => !inProgress || window.confirm(t('focus.confirmLoss', { ask }))
  const pick = (m: TimerMode) => {
    if (m !== p.mode && !sure(t('focus.confirmMode'))) return
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
            <div className="mini-clock" aria-label={t('focus.localTime')}>
              {hhmm}
            </div>
          ) : (
            p.running && (
              <div className="mini-clock" aria-label={t('focus.timer')}>
                {pad(Math.floor(total / 60))}:{pad(total % 60)}
              </div>
            )
          )}
        </div>
        <div className="focus-right">
          {p.sceneControl}
          <div className="seg-row">
            {!clock && p.mode === 'free' && (
              <div className="stepper" role="group" aria-label={t('focus.minutes')}>
                <button aria-label={t('focus.lessMinutes')} onClick={() => p.onFreeMinutes(Math.max(1, p.freeMinutes - 5))}>
                  −
                </button>
                <span>{t('focus.min', { n: p.freeMinutes })}</span>
                <button aria-label={t('focus.moreMinutes')} onClick={() => p.onFreeMinutes(Math.min(240, p.freeMinutes + 5))}>
                  +
                </button>
              </div>
            )}
            <div className="seg" role="group" aria-label={t('focus.modeGroup')}>
              <button aria-pressed={clock} onClick={() => setClock(true)}>
                {t('focus.modeClock')}
              </button>
              <button aria-pressed={!clock && p.mode === 'pomodoro'} onClick={() => pick('pomodoro')}>
                {t('focus.modePomodoro')}
              </button>
              <button aria-pressed={!clock && p.mode === 'free'} onClick={() => pick('free')}>
                {t('focus.modeFree')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="big" role="timer" aria-label={clock ? t('focus.nowIs', { time: hhmm }) : t('focus.clockLabel', { min: big, sec: small })}>
        <span data-part="min">{big}</span>
        <span className="colon" aria-hidden>
          <i />
          <i />
        </span>
        <span data-part="sec" className="sec">
          {small}
        </span>
        <sup>{clock ? pad(p.now.getSeconds()) : t('focus.unitMin')}</sup>
      </div>

      <div className="focus-meta">
        <span>{p.activeTaskText ?? <span className="focus-dim">{t('focus.noTask')}</span>}</span>
        <span className="actions">
          {!clock && (
            <button className="btn" onClick={() => sure(t('focus.confirmReset')) && p.onReset()}>
              {t('focus.reset')}
            </button>
          )}
          {!clock && p.mode === 'pomodoro' && (
            <>
              <button className="btn" onClick={p.onExtend} title={t('focus.extendHint')}>
                {t('focus.extend')}
              </button>
              <button className="btn" onClick={p.onSkip} title={t('focus.skipHint')}>
                <Icon name="skip" />
                {t('focus.skip')}
              </button>
            </>
          )}
          {p.running && !clock ? (
            <button className="btn primary" onClick={p.onPause}>
              <Icon name="pause" />
              {t('focus.pause')}
            </button>
          ) : (
            <button className="btn primary" onClick={start}>
              <Icon name="play" />
              {p.running
                ? t('focus.timerBtn')
                : p.status === 'waiting'
                  ? t('focus.startPhase', { phase: phaseName.toLowerCase() })
                  : p.status === 'paused'
                    ? t('focus.resume')
                    : t('focus.start')}
            </button>
          )}
        </span>
      </div>
    </div>
  )
}
