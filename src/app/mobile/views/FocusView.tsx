import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import ConfirmSheet, { type Confirmation } from '@/app/mobile/components/ConfirmSheet'
import RhythmHint from '@/app/mobile/components/RhythmHint'
import TaskPickerSheet from '@/app/mobile/components/TaskPickerSheet'
import { phaseName as nameOf } from '@/app/mobile/labels'
import { haptic } from '@/app/mobile/platform'
import BreakCorner from '@/features/break/BreakCorner'
import type { Task } from '@/features/tasks/types'
import ClockDigits from '@/features/timer/ClockDigits'
import FreeMinutesStepper from '@/features/timer/FreeMinutesStepper'
import { startLabel } from '@/features/timer/labels'
import type { TimerMode } from '@/features/timer/timer'
import type { Timer } from '@/features/timer/useTimer'
import { sky, type Now } from '@/features/weather/api'
import { useI18n } from '@/i18n'
import { useSignal } from '@/shared/hooks/useSignal'
import { formatCountdown, formatDay, formatTime, pad2 } from '@/shared/lib/format'
import Icon from '@/shared/ui/Icon'

const BreathGame = lazy(() => import('@/features/break/BreathGame'))

/** How long "Exit" stays on screen in immersive mode after a tap. */
const CHROME_MS = 3500

type Props = {
  timer: Timer
  now: Date
  /** The weather where the phone is (App reads it once for both layouts); null until known or without permission. */
  weather?: Now | null
  tasks: Task[]
  setActive: (id: string | null) => Promise<void>
  /** The particle sphere (or nothing in calm mode). */
  scene: ReactNode
  /** Settings › "breathing in the breaks": the invite takes the task line's place during a Pomodoro break. */
  breakGame: boolean
  muted: boolean
  onMute: () => void
  immersive: boolean
  onImmersive: () => void
  onExitImmersive: () => void
  /** Bumped by the Space shortcut (iPad with a keyboard): does what the main button does. */
  toggleSignal: number
  /** Go to the Tasks tab (from the empty task picker). */
  onOpenTasks: () => void
}

export default function FocusView({ timer, now, weather = null, tasks, setActive, scene, breakGame, muted, onMute, immersive, onImmersive, onExitImmersive, toggleSignal, onOpenTasks }: Props) {
  const { t, lang } = useI18n()
  const { state, running, status, remainingMs } = timer
  const mode = state.mode
  // Opens on the timer: on a phone the app is opened to start a session (the local time is one tap away, "Hora").
  const [clock, setClock] = useState(false)
  const [breathe, setBreathe] = useState(false)
  const [confirm, setConfirm] = useState<Confirmation | null>(null)
  const [picker, setPicker] = useState(false)
  const [chrome, setChrome] = useState(false)

  const phaseName = nameOf(t, mode, state.phase)
  const active = tasks.find((k) => k.active && !k.done)
  const inProgress = running || status === 'paused'

  // A phase with time already spent asks first, in a sheet instead of the browser's confirm().
  const sure = (ask: string, run: () => void) => (inProgress ? setConfirm({ ask, run }) : run())
  const pick = (m: TimerMode | 'clock') => {
    setBreathe(false)
    if (m === 'clock') return setClock(true)
    const go = () => {
      setClock(false)
      if (m !== mode) timer.setMode(m)
    }
    if (m !== mode) sure(t('focus.confirmMode'), go)
    else go()
  }
  const start = () => {
    setClock(false)
    setBreathe(false)
    haptic(12)
    if (!running) timer.start()
  }
  const pause = () => {
    haptic(8)
    timer.pause()
  }
  const pauses = running && !clock

  useSignal(toggleSignal, () => (pauses ? pause() : start()))

  // Escape (a keyboard on a tablet) leaves the breathing view, like its "Done" button.
  useEffect(() => {
    if (!breathe) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.querySelector('.m-sheet-root') && setBreathe(false)
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [breathe])

  // Immersive: the controls hide; a tap on the screen brings "Exit" back for a few seconds.
  useEffect(() => {
    if (!chrome) return
    const id = setTimeout(() => setChrome(false), CHROME_MS)
    return () => clearTimeout(id)
  }, [chrome])

  const label = breathe ? t('break.title') : clock ? t('focus.localTime') : phaseName
  const chip = (
    <button className={`m-task-chip${active ? ' has-task' : ''}`} onClick={() => setPicker(true)}>
      <span className="m-task-chip-k">{active ? t('m.workingOn') : t('m.pickTask')}</span>
      <span className="m-task-chip-v">{active ? active.text : t('focus.noTask')}</span>
      <Icon name="next" />
    </button>
  )

  return (
    <div className={`m-focus${breathe ? ' is-breathing' : ''}`} onClick={() => immersive && setChrome(true)}>
      <div className="m-stage-bg">{scene}</div>

      <header className="m-focus-top" inert={immersive}>
        <div className="m-focus-id">
          <span className="num">01</span>
          <span className="lbl">{label}</span>
        </div>
        {/* Not a live region: it holds a running clock. Status changes are announced by the hidden line below. */}
        <p className="m-sr" role="status">
          {t(`status.${status}`)}
        </p>
        <div className="m-focus-status">
          <span>{t('header.session', { n: pad2(timer.sessionNumber) })}</span>
          <span className={status === 'running' ? 'acc' : 'm-dim'}>{t(`status.${status}`)}</span>
          {/* the other clock: local time over a timer, or the running timer over the local time */}
          {!clock ? (
            <span className="m-dim" aria-label={t('focus.localTime')}>
              {formatTime(now)}
            </span>
          ) : (
            running && <span className="acc">{formatCountdown(remainingMs)}</span>
          )}
        </div>
        {/* the day and the weather where the phone is, which the desktop shows in its header */}
        <p className="m-focus-day m-dim">
          {formatDay(now, lang)}
          {weather && ` · ${weather.temp}° ${t(`weather.${sky(weather.code)}`)}`}
        </p>
        <div className="m-focus-tools">
          <button className={`m-tool${muted ? ' is-on' : ''}`} onClick={onMute} aria-label={muted ? t('mute.on') : t('mute.off')} aria-pressed={muted}>
            <Icon name={muted ? 'muted' : 'sound'} />
          </button>
          <button className={`m-tool has-label${breathe ? ' is-on' : ''}`} onClick={() => setBreathe((b) => !b)} aria-pressed={breathe}>
            <Icon name={breathe ? 'close' : 'breathe'} />
            {breathe ? t('m.breatheDone') : t('focus.modeBreathe')}
          </button>
          <button className="m-tool" onClick={onImmersive} aria-label={t('m.immersive')}>
            <Icon name="fullscreen" />
          </button>
        </div>
      </header>

      {!breathe && (
        <>
          <div className="m-modes" inert={immersive}>
            <div className="m-seg" role="group" aria-label={t('focus.modeGroup')}>
              <button aria-pressed={!clock && mode === 'pomodoro'} onClick={() => pick('pomodoro')}>
                {t('focus.modePomodoro')}
              </button>
              <button aria-pressed={!clock && mode === 'free'} onClick={() => pick('free')}>
                {t('focus.modeFree')}
              </button>
              <button aria-pressed={clock} onClick={() => pick('clock')}>
                {t('focus.modeClock')}
              </button>
            </div>
            {!clock && mode === 'free' && <FreeMinutesStepper className="m-stepper" minutes={timer.freeMinutes} onChange={timer.setFreeMinutes} />}
            <p className="m-hint">
              <RhythmHint timer={timer} showTime={clock} />
            </p>
          </div>

          <div className="m-clock">
            <ClockDigits className="m-clock-digits" showTime={clock} remainingMs={remainingMs} now={now} />
          </div>

          <div className="m-focus-foot" inert={immersive}>
            <div className="m-task-line">
              {breakGame ? (
                <BreakCorner inBreak={timer.inBreak} breakId={`${timer.sessionNumber}-${state.phase}`} remaining={formatCountdown(remainingMs)} fallback={chip} />
              ) : (
                chip
              )}
            </div>
            <div className="m-actions">
              {!clock && (
                <button className="m-sq-btn" onClick={() => sure(t('focus.confirmReset'), timer.reset)} aria-label={t('focus.reset')}>
                  <Icon name="reset" />
                </button>
              )}
              {!clock && mode === 'pomodoro' && (
                <>
                  <button className="m-sq-btn m-sq-text" onClick={timer.extend} aria-label={t('focus.extendHint')}>
                    {t('focus.extend')}
                  </button>
                  <button className="m-sq-btn" onClick={timer.skip} aria-label={t('focus.skipHint')}>
                    <Icon name="skip" />
                  </button>
                </>
              )}
              <button className="m-primary" onClick={pauses ? pause : start}>
                <Icon name={pauses ? 'pause' : 'play'} />
                {pauses ? t('focus.pause') : startLabel(t, status, phaseName)}
              </button>
            </div>
          </div>
        </>
      )}

      {breathe && (
        <div className="m-breath-host">
          <Suspense fallback={null}>
            <BreathGame mode onClose={() => setBreathe(false)} />
          </Suspense>
        </div>
      )}

      {immersive && (
        <button className={`m-exit-immersive${chrome ? ' is-shown' : ''}`} onClick={(e) => (e.stopPropagation(), onExitImmersive())}>
          <Icon name="close" />
          {t('m.exitImmersive')}
        </button>
      )}

      <ConfirmSheet confirm={confirm} onClose={() => setConfirm(null)} />
      <TaskPickerSheet open={picker} onClose={() => setPicker(false)} tasks={tasks} setActive={setActive} onOpenTasks={onOpenTasks} />
    </div>
  )
}
