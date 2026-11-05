import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import { readJSON, writeJSON } from '../lib/storage'
import { breathAt, NO_SCORE, percent, scoreStep, type Breath } from './breath'
import './break.css'

export const BEST_KEY = 'focus-space:breath-best'

type Props = {
  /** Break time left, shown the whole time so the game never hides the timer. */
  remaining: string
  /** The break is over: the game stops and says so before closing. */
  ended: boolean
  onClose: () => void
}

const readBest = () => {
  const b = readJSON(BEST_KEY)
  return typeof b === 'number' ? b : 0
}

export default function BreathGame({ remaining, ended, onClose }: Props) {
  const t = useT()
  const [breath, setBreath] = useState<Breath>(() => breathAt(0))
  const [score, setScore] = useState(NO_SCORE)
  const [best, setBest] = useState(readBest)
  const held = useRef(false)
  const pad = useRef<HTMLButtonElement>(null)

  useEffect(() => pad.current?.focus(), [])

  useEffect(() => {
    if (ended) return
    let raf = 0
    const t0 = performance.now()
    let last = t0
    const tick = (now: number) => {
      const b = breathAt(now - t0)
      // Read everything now: the updater runs later, after `last` has moved on.
      const dt = now - last
      const isHeld = held.current
      last = now
      setBreath(b)
      setScore((s) => scoreStep(s, isHeld, b.phase, dt))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ended])

  // Keep the best score once a round has lasted long enough to mean something (one full breath).
  const pct = percent(score)
  useEffect(() => {
    if (score.totalMs >= 10_000 && pct > best) {
      setBest(pct)
      writeJSON(BEST_KEY, pct)
    }
  }, [pct, score.totalMs, best])

  const hold = (on: boolean) => (held.current = on)

  return (
    <div className="br" role="dialog" aria-label={t('break.title')} onKeyDown={(e) => e.key === 'Escape' && (e.preventDefault(), onClose())}>
      <header className="br-head">
        <span>{t('break.left', { time: remaining })}</span>
        <button className="br-close" onClick={onClose} aria-label={t('break.close')}>
          <Icon name="close" />
        </button>
      </header>

      {ended ? (
        <p className="br-end" role="status">
          {t('break.ended')}
        </p>
      ) : (
        <>
          <button
            ref={pad}
            className={`br-pad${breath.phase === 'in' ? ' is-in' : ''}`}
            aria-label={t('break.pad')}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              hold(true)
            }}
            onPointerUp={() => hold(false)}
            onPointerCancel={() => hold(false)}
            onKeyDown={(e) => {
              if (e.key !== ' ' && e.key !== 'Enter') return
              e.preventDefault()
              hold(true)
            }}
            onKeyUp={() => hold(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className="br-circle" style={{ ['--s' as string]: 0.35 + breath.size * 0.65 }} />
            <span className="br-cue" aria-live="polite">
              {t(breath.phase === 'in' ? 'break.inhale' : 'break.exhale')}
            </span>
          </button>
          <p className="br-hint">{t('break.hint')}</p>
        </>
      )}

      <footer className="br-score">
        <span>{t('break.score', { pct })}</span>
        <span>{t('break.best', { pct: best })}</span>
      </footer>
    </div>
  )
}
