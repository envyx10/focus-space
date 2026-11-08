import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { formatDay } from '../layout/Header'
import { sky, type Now } from '../layout/Weather'
import Icon from '../lib/Icon'
import type { Task } from '../tasks/types'
import type { TimerMode } from '../timer/timer'
import type { useTimer } from '../timer/useTimer'
import BreakCorner from '../break/BreakCorner'
import { haptic } from './platform'
import { phaseName as nameOf } from './labels'
import Sheet from './Sheet'

const BreathGame = lazy(() => import('../break/BreathGame'))

type Props = {
  timer: ReturnType<typeof useTimer>
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

const pad = (n: number) => String(n).padStart(2, '0')
type Confirm = { ask: string; run: () => void }

export default function FocusView({ timer, now, weather = null, tasks, setActive, scene, breakGame, muted, onMute, immersive, onImmersive, onExitImmersive, toggleSignal, onOpenTasks }: Props) {
  const { t, lang } = useI18n()
  const { state, running, status, remainingMs } = timer
  const mode = state.mode
  // Opens on the timer: on a phone the app is opened to start a session (the local time is one tap away, "Hora").
  const [clock, setClock] = useState(false)
  const [breathe, setBreathe] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [picker, setPicker] = useState(false)
  const [chrome, setChrome] = useState(false)

  const total = Math.ceil(remainingMs / 1000)
  const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  const [big, small] = clock ? [pad(now.getHours()), pad(now.getMinutes())] : [pad(Math.floor(total / 60)), pad(total % 60)]
  const phaseName = nameOf(t, mode, state.phase)
  const cfg = timer.config
  // The rhythm in one line, figures first: "25 min foco · 5 descanso · largo cada 4".
  const n = (v: number) => <b>{v}</b>
  const hint = clock ? (
    <span>{t('m.hint.clock')}</span>
  ) : mode === 'free' ? (
    <>
      <span>
        {n(timer.freeMinutes)} {t('m.rhythm.min')}
      </span>
      <span>{t('m.rhythm.noBreaks')}</span>
    </>
  ) : (
    <>
      <span>
        {n(cfg.work / 60000)} {t('m.rhythm.focus')}
      </span>
      <span>
        {n(cfg.short / 60000)} {t('m.rhythm.break')}
      </span>
      <span>
        {t('m.rhythm.long')} {n(cfg.longEvery)}
      </span>
    </>
  )
  const active = tasks.find((k) => k.active && !k.done)
  const pending = tasks.filter((k) => !k.done)
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

  const live = useRef({ clock, running, start, pause })
  live.current = { clock, running, start, pause }
  const lastSignal = useRef(toggleSignal)
  useEffect(() => {
    if (toggleSignal === lastSignal.current) return
    lastSignal.current = toggleSignal
    const l = live.current
    if (l.running && !l.clock) l.pause()
    else l.start()
  }, [toggleSignal])

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
    const id = setTimeout(() => setChrome(false), 3500)
    return () => clearTimeout(id)
  }, [chrome])

  const primaryLabel = running && !clock ? t('focus.pause') : running ? t('focus.timerBtn') : status === 'waiting' ? t('focus.startPhase', { phase: phaseName.toLowerCase() }) : status === 'paused' ? t('focus.resume') : t('focus.start')
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
          <span>{t('header.session', { n: pad(timer.sessionNumber) })}</span>
          <span className={status === 'running' ? 'acc' : 'm-dim'}>{t(`status.${status}`)}</span>
          {/* the other clock: local time over a timer, or the running timer over the local time */}
          {!clock ? <span className="m-dim" aria-label={t('focus.localTime')}>{hhmm}</span> : running && <span className="acc">{pad(Math.floor(total / 60))}:{pad(total % 60)}</span>}
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
            {!clock && mode === 'free' && (
              <div className="m-stepper" role="group" aria-label={t('focus.minutes')}>
                <button aria-label={t('focus.lessMinutes')} onClick={() => timer.setFreeMinutes(Math.max(1, timer.freeMinutes - 5))}>
                  −
                </button>
                <span>{t('focus.min', { n: timer.freeMinutes })}</span>
                <button aria-label={t('focus.moreMinutes')} onClick={() => timer.setFreeMinutes(Math.min(240, timer.freeMinutes + 5))}>
                  +
                </button>
              </div>
            )}
            <p className="m-hint">{hint}</p>
          </div>

          <div className="m-clock">
            <div className="m-clock-digits" role="timer" aria-label={clock ? t('focus.nowIs', { time: hhmm }) : t('focus.clockLabel', { min: big, sec: small })}>
              <span>{big}</span>
              <span className="colon" aria-hidden>
                <i />
                <i />
              </span>
              <span className="sec">{small}</span>
              <sup>{clock ? pad(now.getSeconds()) : t('focus.unitMin')}</sup>
            </div>
          </div>

          <div className="m-focus-foot" inert={immersive}>
            <div className="m-task-line">
              {breakGame ? (
                <BreakCorner
                  inBreak={mode === 'pomodoro' && state.phase !== 'work' && (status === 'running' || status === 'paused')}
                  breakId={`${timer.sessionNumber}-${state.phase}`}
                  remaining={`${pad(Math.floor(total / 60))}:${pad(total % 60)}`}
                  fallback={chip}
                />
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
              <button className="m-primary" onClick={running && !clock ? pause : start}>
                <Icon name={running && !clock ? 'pause' : 'play'} />
                {primaryLabel}
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

      <Sheet open={confirm !== null} onClose={() => setConfirm(null)} title={confirm?.ask ?? ''} kicker={<span className="lbl">{t('m.confirmKicker')}</span>}>
        <p className="m-sheet-text">{t('m.confirmBody')}</p>
        <div className="m-sheet-buttons">
          <button className="m-btn" onClick={() => setConfirm(null)}>
            {t('m.cancel')}
          </button>
          <button
            className="m-btn is-primary"
            onClick={() => {
              confirm?.run()
              setConfirm(null)
            }}
          >
            {t('m.continue')}
          </button>
        </div>
      </Sheet>

      <Sheet open={picker} onClose={() => setPicker(false)} title={t('m.pickTaskTitle')} kicker={<span className="num">01</span>}>
        {pending.length === 0 ? (
          <div className="m-empty is-compact">
            <p>{t('m.noPending')}</p>
            <button
              className="m-btn is-primary"
              onClick={() => {
                setPicker(false)
                onOpenTasks()
              }}
            >
              {t('m.goToTasks')}
            </button>
          </div>
        ) : (
          <ul className="m-pick-list">
            {pending.map((k) => (
              <li key={k.id}>
                <button
                  className={k.active ? 'is-on' : undefined}
                  aria-pressed={!!k.active}
                  onClick={() => {
                    haptic()
                    setActive(k.active ? null : k.id)
                    setPicker(false)
                  }}
                >
                  <span className="m-pick-text">{k.text}</span>
                  {k.active ? <Icon name="check" /> : <Icon name="right" />}
                </button>
              </li>
            ))}
            {active && (
              <li>
                <button
                  className="m-pick-none"
                  onClick={() => {
                    setActive(null)
                    setPicker(false)
                  }}
                >
                  {t('tasks.removeNow')}
                </button>
              </li>
            )}
          </ul>
        )}
      </Sheet>
    </div>
  )
}
