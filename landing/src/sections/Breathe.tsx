import { useEffect, useRef, useState } from 'react'
import { breathAt, EXHALE_MS, INHALE_MS, type Breath } from '@/features/break/breath'
import { field } from '~/field/scenes'

// The app's own reasons (src/i18n/locales/es/settings.ts, break.why.*), shortened.
const WHY = [
  ['Unas 6 por minuto', 'A este ritmo, respiración y pulso entran en sintonía y aumenta la variabilidad del ritmo cardíaco.'],
  ['Soltar más largo que tomar', 'Al espirar, el corazón se ralentiza un poco. Alargar la salida, 6 s frente a 4, potencia ese freno.'],
  ['Por la nariz, fuera por la boca', 'La nariz obliga a ir despacio; soltar con los labios entreabiertos alarga la salida sin esfuerzo.'],
]

/**
 * The breathing guide the app offers in a break, running on the app's own clock (breath.ts: 4 s in, 6 s out).
 * While it runs, the sphere behind swells and empties with each breath, as it does in the app.
 */
export default function Breathe() {
  const [b, setB] = useState<Breath | null>(null)
  const started = useRef(0)
  const running = b !== null

  useEffect(() => {
    if (!running) return
    let raf = 0
    const tick = (now: number) => {
      // leaving the chapter ends the guide: the sphere goes back to its size elsewhere
      if (field.scene !== 'breathe') {
        field.breath = null
        return setB(null)
      }
      const next = breathAt(now - started.current)
      field.breath = next.size
      setB((cur) => (cur === null || (cur.phase === next.phase && cur.left === next.left && cur.count === next.count) ? cur : next))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  useEffect(
    () => () => {
      field.breath = null
    },
    [],
  )

  const toggle = () => {
    if (b) {
      setB(null)
      field.breath = null
      return
    }
    started.current = performance.now()
    setB(breathAt(0))
  }

  return (
    <section id="breathe" className="breathe" data-scene="breathe" aria-labelledby="breathe-title">
      <div className="stack breathe__copy">
        <p className="lbl" data-reveal>
          [ 04 ] Respira
        </p>
        <h2 id="breathe-title" className="h-l" data-reveal>
          Un respiro entre bloques. <em>Seis por minuto.</em>
        </h2>
        <p className="body" data-reveal>
          En los descansos, la app te invita a una guía de respiración: con el abdomen, unas seis veces por minuto. La esfera se llena y se vacía contigo. Pruébala aquí.
        </p>
        <div className="breathe__ctl" data-reveal>
          <button type="button" className={`box${b ? '' : ' box--solid'}`} onClick={toggle} aria-pressed={!!b}>
            {b ? 'Parar' : 'Respirar'}
          </button>
          <p className="breathe__now" aria-live="polite">
            {b ? (
              <>
                <span className="breathe__phase">{b.phase === 'in' ? 'Inspira' : 'Suelta'}</span>
                <span className="breathe__left">{b.left}</span>
                <span className="lbl">
                  {b.phase === 'in' ? 'por la nariz' : 'despacio, por la boca'} · {b.count} respiraciones
                </span>
              </>
            ) : (
              <span className="lbl">
                Inspira {INHALE_MS / 1000} s · suelta {EXHALE_MS / 1000} s · 2 a 5 minutos bastan
              </span>
            )}
          </p>
        </div>
      </div>

      <ol className="why">
        {WHY.map(([t, d]) => (
          <li key={t} data-reveal>
            <h3 className="h-s">{t}</h3>
            <p className="body">{d}</p>
          </li>
        ))}
      </ol>
      <p className="breathe__note lbl" data-reveal>
        Un ejercicio de relajación, no un tratamiento médico. Si te mareas, vuelve a tu ritmo.
      </p>
    </section>
  )
}
