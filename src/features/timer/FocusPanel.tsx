import { lazy, Suspense, useState, type ReactNode } from 'react'
import { useT } from '@/i18n'
import { useSignal } from '@/shared/hooks/useSignal'
import { formatCountdown, formatTime } from '@/shared/lib/format'
import Icon from '@/shared/ui/Icon'
import ClockDigits from './ClockDigits'
import FreeMinutesStepper from './FreeMinutesStepper'
import { phaseLabel, startLabel } from './labels'
import type { Phase, TimerMode } from './timer'
import type { TimerStatus } from './useTimer'
import './focus.css'

const BreathGame = lazy(() => import('@/features/break/BreathGame'))

type Props = {
  remainingMs: number
  running: boolean
  status: TimerStatus
  mode: TimerMode
  phase: Phase
  freeMinutes: number
  activeTaskText: string | null
  /** Takes the task line's place when given (the break invite and game live there). */
  taskSlot?: ReactNode
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
  /** Day and weather, shown under the label on phones only (their header has no room for it). */
  dateSlot?: ReactNode
  children?: ReactNode
}

export default function FocusPanel(p: Props) {
  const t = useT()
  // Opens on the local time; a running timer (e.g. after a reload) takes the stage instead.
  const [clock, setClock] = useState(!p.running)
  // Breathing view: the guide takes the panel for as long as you like; the timer keeps going underneath.
  const [breathe, setBreathe] = useState(false)
  const phaseName = phaseLabel(t, p.mode, p.phase)
  const label = breathe ? t('break.title') : clock ? t('focus.localTime') : phaseName
  // A phase with time already spent is worth a second thought before it is thrown away.
  const inProgress = p.running || p.status === 'paused'
  const sure = (ask: string) => !inProgress || window.confirm(t('focus.confirmLoss', { ask }))
  const pick = (m: TimerMode) => {
    if (m !== p.mode && !sure(t('focus.confirmMode'))) return
    setClock(false)
    setBreathe(false)
    p.onModeChange(m)
  }
  const start = () => {
    setClock(false)
    setBreathe(false)
    if (!p.running) p.onStart()
  }
  useSignal(p.toggleSignal, () => (p.running && !clock ? p.onPause() : start()))

  return (
    <div className="focus">
      <div className="focus-bg">{p.children}</div>

      <div className="focus-top">
        <div>
          <div className="num">02</div>
          <div className="lbl">{label}</div>
          {p.dateSlot && <div className="focus-date">{p.dateSlot}</div>}
          {/* the other clock, small: local time over a timer, or a running timer over the time */}
          {!clock ? (
            <div className="mini-clock" aria-label={t('focus.localTime')}>
              {formatTime(p.now)}
            </div>
          ) : (
            p.running && (
              <div className="mini-clock" aria-label={t('focus.timer')}>
                {formatCountdown(p.remainingMs)}
              </div>
            )
          )}
        </div>
        <div className="focus-right">
          {p.sceneControl}
          <div className="seg-row">
            {!clock && p.mode === 'free' && (
              <FreeMinutesStepper className="stepper" minutes={p.freeMinutes} onChange={p.onFreeMinutes} />
            )}
            <div className="seg" role="group" aria-label={t('focus.modeGroup')}>
              <button aria-pressed={!breathe && clock} onClick={() => (setClock(true), setBreathe(false))}>
                {t('focus.modeClock')}
              </button>
              <button aria-pressed={!breathe && !clock && p.mode === 'pomodoro'} onClick={() => pick('pomodoro')}>
                {t('focus.modePomodoro')}
              </button>
              <button aria-pressed={!breathe && !clock && p.mode === 'free'} onClick={() => pick('free')}>
                {t('focus.modeFree')}
              </button>
              <button aria-pressed={breathe} onClick={() => setBreathe(true)}>
                {t('focus.modeBreathe')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ClockDigits className="big" showTime={clock} remainingMs={p.remainingMs} now={p.now} />

      <div className="focus-meta">
        <span>{p.taskSlot ?? p.activeTaskText ?? <span className="focus-dim">{t('focus.noTask')}</span>}</span>
        <span className="actions">
          {!clock && (
            <button className="btn" onClick={() => sure(t('focus.confirmReset')) && p.onReset()}>
              <Icon name="reset" />
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
              {startLabel(t, p.status, phaseName)}
            </button>
          )}
        </span>
      </div>
      {breathe && (
        <Suspense fallback={null}>
          <BreathGame mode onClose={() => setBreathe(false)} />
        </Suspense>
      )}
    </div>
  )
}
