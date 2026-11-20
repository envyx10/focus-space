import { useEffect, useRef, useState } from 'react'
import { Split } from '~/ui/Split'

// The app's shortcuts (src/features/settings/options.ts): never fired while typing or with a modifier held.
const KEYS: { k: string; match: string[]; label: string }[] = [
  { k: 'Espacio', match: [' '], label: 'Iniciar / pausar el temporizador' },
  { k: 'N', match: ['n', 'N'], label: 'Nueva tarea' },
  { k: 'M', match: ['m', 'M'], label: 'Silenciar todo' },
  { k: 'C', match: ['c', 'C'], label: 'Modo calma: la esfera y el grano se apartan' },
  { k: 'F', match: ['f', 'F'], label: 'Modo focus · Esc para salir' },
  { k: '?', match: ['?'], label: 'Abrir / cerrar ajustes' },
]

const NOTES = [
  ['A prueba de recargas', 'La fase en marcha se guarda con su hora de fin. Cerrar la pestaña no la pierde y en segundo plano no se desfasa.'],
  ['Respira en los descansos', 'Una invitación discreta a una guía de respiración: 4 segundos dentro, 6 fuera. La esfera se llena y se vacía contigo.'],
  ['65.536 partículas', 'Detrás del reloj (32.400 en equipos de 4 núcleos o menos), simuladas en la GPU. Siguen cada canal y el ritmo de la radio.'],
  ['Sin cuenta, sin rastro', 'Funciona al momento y guarda en tu navegador; la cuenta solo añade sincronización. Ni analíticas ni seguimiento.'],
  ['Accesible', 'Roles y etiquetas reales, deslizadores con teclado y un temporizador legible por lectores de pantalla.'],
  ['Español e inglés', 'Empieza en el idioma de tu navegador y lo recuerda. Código FSL-1.1-MIT, sonidos CC0.'],
]

const typing = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)

export default function Details() {
  const [lit, setLit] = useState(-1)
  const root = useRef<HTMLElement>(null)
  const visible = useRef(false)

  // While this chapter is on screen, pressing a shortcut lights its key (and does nothing else here).
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.2 })
    if (root.current) io.observe(root.current)
    const onKey = (e: KeyboardEvent) => {
      if (!visible.current || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return
      const i = KEYS.findIndex((k) => k.match.includes(e.key))
      if (i >= 0) setLit(i)
    }
    addEventListener('keydown', onKey)
    return () => {
      io.disconnect()
      removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <section ref={root} id="details" className="details" data-scene="details" aria-labelledby="details-title">
      <div className="details__head stack">
        <p className="lbl" data-reveal>
          [ 05 ] Los detalles
        </p>
        <Split as="h2" id="details-title" text="Hecha para concentrarse." className="h-xl" />
      </div>

      {/* every shortcut and what it does, always in view; pressing one on the keyboard lights its cell */}
      <div className="keys" data-reveal>
        <p className="lbl">
          Atajos de la app<span className="keys__hint"> · pulsa uno para probarlo</span>
        </p>
        <dl className="keys__grid">
          {KEYS.map((k, i) => (
            <div key={k.k} className={`keycell${lit === i ? ' is-lit' : ''}`} onMouseEnter={() => setLit(i)}>
              <dt>
                <kbd className={i === 0 ? 'key key--wide' : 'key'}>{k.k}</kbd>
              </dt>
              <dd>{k.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ol className="notes">
        {NOTES.map(([t, b], i) => (
          <li key={t} className="note" data-reveal>
            <span className="lbl">
              <b>{String(i + 1).padStart(2, '0')}</b> — {t}
            </span>
            <p className="body">{b}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
