import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import Sheet from '../mobile/Sheet'
import { breathAt, breathing, EXHALE_MS, INHALE_MS, type Breath } from './breath'
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

const WHY = ['diaphragm', 'pace', 'exhale', 'nose', 'time'] as const


/** Guided diaphragmatic breathing: follow the sphere (or the square), nothing to press or score. */
export default function BreathGame({ remaining, ended = false, mode = false, onClose }: Props) {
  const t = useT()
  const [breath, setBreath] = useState<Breath>(() => breathAt(0))
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [why, setWhy] = useState(false)
  // Inside the phone shell the explanation opens in its bottom sheet (modal, drag to dismiss); desktop keeps its panel.
  const [phone] = useState(() => typeof document !== 'undefined' && !!document.querySelector('.m-app'))
  // The particle sphere breathes when it is running; otherwise a flat accent square does. Re-read every frame:
  // calm mode can take the sphere away (or bring it back) while the guide is open.
  const [sphere, setSphere] = useState(() => breathing.sphere)
  const secs = (breath.phase === 'in' ? INHALE_MS : EXHALE_MS) / 1000

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
      setSphere(breathing.sphere)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      breathing.size = null
    }
  }, [ended])

  const whyBody = (
    <>
      <dl>
        {WHY.map((k) => (
          <div key={k}>
            <dt>{t(`break.why.${k}.t`)}</dt>
            <dd>{t(`break.why.${k}.b`)}</dd>
          </div>
        ))}
      </dl>
      <p className="br-why-note">{t('break.why.note')}</p>
      <p className="br-why-src">{t('break.why.src')}</p>
    </>
  )

  return (
    <div
      className={`br${sphere ? ' has-sphere' : ''}${mode ? ' is-mode' : ''}`}
      role={mode ? 'region' : 'dialog'}
      aria-label={t('break.title')}
      // Esc closes the explanation first, then the guide.
      onKeyDown={(e) => e.key === 'Escape' && (e.preventDefault(), why ? setWhy(false) : onClose())}
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
          <div className="br-cue">
            <p aria-live="polite">
              <span className="br-verb">{t(breath.phase === 'in' ? 'break.inhale' : 'break.exhale')}</span>
              <span className="br-manner">{t(breath.phase === 'in' ? 'break.inhaleHow' : 'break.exhaleHow')}</span>
            </p>
            {/* One square per second of this phase (4 in, 6 out), lit as the seconds pass: the clock's colon square. */}
            <span className="br-secs" aria-hidden>
              {Array.from({ length: secs }, (_, i) => (
                <i key={i} className={i < secs - breath.left + 1 ? 'on' : undefined} />
              ))}
            </span>
          </div>
        </div>
      )}

      <footer className="br-foot">
        <div className="br-how">
          <p className="br-how-lead">{t('break.howLead')}</p>
          <p className="br-hint">{t('break.how')}</p>
        </div>
        <div className="br-side">
          <p className="br-score">
            <b>{breath.count}</b>
            <span>{t('break.breaths')}</span>
          </p>
          <button className="br-why-btn" aria-expanded={why} aria-controls="br-why" onClick={() => setWhy(!why)}>
            {t('break.why')}
            <Icon name={phone ? 'next' : why ? 'close' : 'up'} />
          </button>
        </div>
      </footer>

      {why && !phone && (
        <section id="br-why" className="br-why" aria-label={t('break.whyTitle')}>
          <header className="br-why-head">
            <h3>{t('break.whyTitle')}</h3>
            <button className="br-why-x" aria-label={t('break.whyClose')} title={t('break.whyClose')} onClick={() => setWhy(false)}>
              <Icon name="close" />
            </button>
          </header>
          {whyBody}
        </section>
      )}
      {phone && (
        <Sheet open={why} onClose={() => setWhy(false)} title={t('break.whyTitle')}>
          <div id="br-why" className="br-why-sheet">
            {whyBody}
          </div>
        </Sheet>
      )}
    </div>
  )
}
