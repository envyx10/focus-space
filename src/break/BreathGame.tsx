import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import { breathAt, breathing, type Breath } from './breath'
import './break.css'

type Props = {
  /** Break time left, shown the whole time so the guide never hides the timer. */
  remaining?: string
  /** The break is over: the guide stops and says so before closing. */
  ended?: boolean
  /** Opened as the panel's Breathe view: no header of its own, the panel's top bar stays to switch back. */
  mode?: boolean
  onClose: () => void
}

/** Guided diaphragmatic breathing: follow the square, nothing to press or score. */
export default function BreathGame({ remaining, ended = false, mode = false, onClose }: Props) {
  const t = useT()
  const [breath, setBreath] = useState<Breath>(() => breathAt(0))
  const closeBtn = useRef<HTMLButtonElement>(null)
  // The particle sphere breathes when it is running; otherwise a flat accent square does.
  const [sphere] = useState(() => breathing.sphere)

  // Focus inside the panel so Esc reaches it (the Breathe view leaves focus on the button that opened it).
  useEffect(() => {
    if (!mode) closeBtn.current?.focus()
  }, [mode])

  useEffect(() => {
    if (ended) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const b = breathAt(now - t0)
      breathing.size = b.size
      setBreath(b)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      breathing.size = null
    }
  }, [ended])

  return (
    <div
      className={`br${sphere ? ' has-sphere' : ''}${mode ? ' is-mode' : ''}`}
      role={mode ? 'region' : 'dialog'}
      aria-label={t('break.title')}
      onKeyDown={(e) => e.key === 'Escape' && (e.preventDefault(), onClose())}
    >
      {!mode && (
        <header className="br-head">
          <div>
            <div className="num">02</div>
            <div className="lbl">{t('break.title')}</div>
            <div className="br-left" aria-label={t('break.left', { time: remaining ?? '' })}>
              {remaining}
            </div>
          </div>
          <button ref={closeBtn} className="br-close" onClick={onClose} title={t('break.close')}>
            {t('break.closeShort')}
            <Icon name="close" />
          </button>
        </header>
      )}

      {ended ? (
        <p className="br-end" role="status">
          {t('break.ended')}
        </p>
      ) : (
        <div className="br-pad">
          <span className="br-stage" aria-hidden>
            {!sphere && <span className="br-square" style={{ ['--s' as string]: 0.2 + breath.size * 0.8 }} />}
          </span>
          <p className="br-cue" aria-live="polite">
            {t(breath.phase === 'in' ? 'break.inhale' : 'break.exhale')}
            <span className="br-count" aria-hidden>
              {breath.left}
            </span>
          </p>
        </div>
      )}

      <footer className="br-foot">
        <p className="br-hint">{t('break.how')}</p>
        <p className="br-score">{t('break.breaths', { n: breath.count })}</p>
      </footer>
    </div>
  )
}
