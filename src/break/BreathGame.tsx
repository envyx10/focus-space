import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import { breathAt, type Breath } from './breath'
import './break.css'

type Props = {
  /** Break time left, shown the whole time so the guide never hides the timer. */
  remaining: string
  /** The break is over: the guide stops and says so before closing. */
  ended: boolean
  onClose: () => void
}

/** Guided diaphragmatic breathing: follow the square, nothing to press or score. */
export default function BreathGame({ remaining, ended, onClose }: Props) {
  const t = useT()
  const [breath, setBreath] = useState<Breath>(() => breathAt(0))
  const closeBtn = useRef<HTMLButtonElement>(null)

  // Focus inside the panel so Esc reaches it.
  useEffect(() => closeBtn.current?.focus(), [])

  useEffect(() => {
    if (ended) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      setBreath(breathAt(now - t0))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ended])

  return (
    <div className="br" role="dialog" aria-label={t('break.title')} onKeyDown={(e) => e.key === 'Escape' && (e.preventDefault(), onClose())}>
      <header className="br-head">
        <div>
          <div className="num">02</div>
          <div className="lbl">{t('break.title')}</div>
          <div className="br-left" aria-label={t('break.left', { time: remaining })}>
            {remaining}
          </div>
        </div>
        <button ref={closeBtn} className="br-close" onClick={onClose} title={t('break.close')}>
          {t('break.closeShort')}
          <Icon name="close" />
        </button>
      </header>

      {ended ? (
        <p className="br-end" role="status">
          {t('break.ended')}
        </p>
      ) : (
        <div className="br-pad">
          <span className="br-stage" aria-hidden>
            <span className="br-square" style={{ ['--s' as string]: 0.2 + breath.size * 0.8 }} />
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
