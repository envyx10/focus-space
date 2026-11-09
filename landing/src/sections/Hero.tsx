import { useLayoutEffect, useRef } from 'react'
import { ACCENTS } from '@/features/prefs/accent'
import { ACCENT_NAMES, setAccent, useAccent } from '~/accent'
import { APP_URL } from '~/config'
import { gsap, MOTION } from '~/motion/gsap'

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const accent = useAccent()

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION, () => {
      const q = gsap.utils.selector(root)
      // a dry wipe, line by line, left to right: the headline is printed, not floated in
      gsap.fromTo(q('.hero__title .line'), { clipPath: 'inset(-0.25em 100% -0.25em 0)' }, { clipPath: 'inset(-0.25em 0% -0.25em 0)', duration: 0.9, stagger: 0.14, delay: 0.25, ease: 'power4.inOut' })
      gsap.from(q('[data-in]'), { autoAlpha: 0, duration: 0.6, stagger: 0.06, delay: 0.9, ease: 'none' })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} id="top" className="hero" data-scene="hero" aria-labelledby="hero-title">
      <p className="hero__hint lbl" data-in>
        La esfera real de la app · sigue al cursor
        <br />
        Desplaza para entrar
      </p>

      <div className="hero__copy">
        <h1 id="hero-title" className="hero__title h-xl">
          <span className="line">Una sala tranquila</span> <span className="line">
            para tu <em>atención.</em>
          </span>
        </h1>
        <div className="hero__row">
        <p className="body" data-in>
          Focus/Space pone tareas, un Pomodoro, sonidos ambientales y radio lofi en una sola pantalla, en una pestaña del navegador. Sin cuenta, sin configurar nada.
        </p>
        <div className="hero__actions" data-in>
          <a className="box box--solid" href={APP_URL}>
            Abrir la app ↗
          </a>
        </div>
        </div>
      </div>

      <div className="hero__controls" data-in>
        <div className="ctl">
          <span className="lbl">Luz</span>
          <div className="dots" role="radiogroup" aria-label="Color de resalte">
            {ACCENTS.map((hex, i) => (
              <button key={hex} type="button" role="radio" aria-checked={accent === hex} aria-label={ACCENT_NAMES[i]} className="dot" style={{ background: hex }} onClick={() => setAccent(hex)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
