import { useLayoutEffect, useRef } from 'react'
import { APP_URL, REPO_URL } from '~/config'
import { gsap, MOTION } from '~/motion/gsap'

/** The close: the name, set as large and heavy as the screen allows, and the way in. */
export default function Enter() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION, () => {
      const q = gsap.utils.selector(root)
      gsap
        .timeline({ scrollTrigger: { trigger: q('.mark')[0], start: 'top 85%', once: true } })
        .fromTo(q('.mark__word'), { clipPath: 'inset(-0.25em 100% -0.25em -0.3em)' }, { clipPath: 'inset(-0.25em -0.3em -0.25em -0.3em)', duration: 0.9, stagger: 0.12, ease: 'power4.inOut' })
        .from(q('.mark__slash'), { scaleY: 0, duration: 1, ease: 'expo.inOut' }, 0.2)
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} id="enter" className="enter" data-scene="enter" aria-labelledby="enter-title">
      <h2 id="enter-title" className="mark" aria-label="Focus/Space">
        <span className="mark__word" aria-hidden="true">
          <span>Focus</span>
        </span>
        <span className="mark__slash" aria-hidden="true" />
        <span className="mark__word" aria-hidden="true">
          <span>Space</span>
        </span>
      </h2>

      <div className="enter__row">
        <div className="stack">
          <p className="lbl" data-reveal>
            [ 07 ] Entra
          </p>
          <p className="h-l" data-reveal>
            Entra en <em>tu espacio.</em>
          </p>
          <p className="body" data-reveal>
            Sin cuenta. Sin instalar nada. Una pestaña, y empiezas.
          </p>
        </div>
        <div className="enter__actions" data-reveal>
          <a className="box box--solid" href={APP_URL}>
            <span className="tri" aria-hidden="true" /> Abrir Focus/Space
          </a>
          <a className="box" href={REPO_URL}>
            Código ↗
          </a>
        </div>
      </div>

      <footer className="footer">
        <div className="footer__cell footer__id">
          <p className="footer__mark">
            FOCUS<span className="accent">/</span>SPACE
          </p>
          <p className="body">Una sala tranquila para concentrarte, en una pestaña del navegador. Hecha para sesiones largas.</p>
        </div>
        <div className="footer__cell">
          <p className="lbl">[ Entrar ]</p>
          <ul className="footer__list">
            <li>
              <a className="link" href={APP_URL}>
                Abrir la app ↗
              </a>
            </li>
            <li>
              <a className="link" href={REPO_URL}>
                Código en GitHub ↗
              </a>
            </li>
            <li>
              <a className="link" href={`${REPO_URL}/issues`}>
                Ideas y errores ↗
              </a>
            </li>
          </ul>
        </div>
        <div className="footer__cell">
          <p className="lbl">[ Hecha con ]</p>
          <ul className="footer__list">
            <li>React · Three.js + GLSL</li>
            <li>Web Audio API</li>
            <li>Sonidos CC0 de Freesound</li>
          </ul>
        </div>
        <div className="footer__cell">
          <p className="lbl">[ Tus datos ]</p>
          <ul className="footer__list">
            <li>Sin analíticas ni seguimiento</li>
            <li>Todo en tu navegador</li>
            <li>Español · English</li>
          </ul>
        </div>
        <div className="footer__base lbl">
          <span>© 2026 Pablo Gil Diaz</span>
          <a className="link" href={`${REPO_URL}/blob/main/LICENSE`}>
            Código FSL-1.1-MIT
          </a>
          <a className="link" href="#top">
            Volver arriba ↑
          </a>
        </div>
      </footer>
    </section>
  )
}
