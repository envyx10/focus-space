import { useState } from 'react'
import { STATIONS } from '@/features/lofi/useYouTubeLofi'

// The mix in the app's own screenshots: rain at the window, fire in the hearth, the blue-switch keyboard.
const MIX: [string, string, number][] = [
  ['Lluvia', 'Ventana', 45],
  ['Fuego', 'Chimenea', 20],
  ['Café', 'Cafetería', 0],
  ['Viento', 'Bosque', 0],
  ['Teclado', 'Cherry azul', 30],
]

/**
 * The app's lofi radio block, as the app draws it: the live label, the state, the station switch (the app's
 * real stations, in its order), the station's title set large, the volume. Nothing plays here: the page loads
 * no YouTube, so it stays "en pausa", but the switch walks through the real list.
 */
function Radio() {
  const [i, setI] = useState(2)
  const st = STATIONS[i]
  return (
    <div className="radio">
      <div className="radio__row">
        <span className="radio__live">
          <span aria-hidden="true">▶</span> Radio lofi — en directo
        </span>
        <span className="radio__state">
          En pausa
          <button type="button" className="radio__next" aria-label={`Cambiar de emisora. Ahora: ${st.name}`} onClick={() => setI((i + 1) % STATIONS.length)}>
            Emisora {i + 1}/{STATIONS.length} · siguiente <span aria-hidden="true">›</span>
          </button>
        </span>
      </div>
      <p className="radio__title" aria-live="polite">
        {st.title.split('\n').map((line, k) => (
          <span key={line}>
            {k > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
      <div className="radio__vol">
        <span>Vol 60</span>
        <i>
          <b />
        </i>
      </div>
    </div>
  )
}

/** The mixer strip and the radio, piece 3 of the walk. `state` is its place in the walk (lit, seen, ahead). */
export default function Sound({ state }: { state: string }) {
  return (
        <div className={`fz fz--sound${state}`} data-step="f-sound" data-reveal>
          <div className="mixhead">
            <p className="lbl">{'>>> Sonido'}</p>
            <h3 className="h-s">
              Tu propio fondo, <em>mezclado a mano.</em>
            </h3>
          </div>
          <ul className="mix">
            {MIX.map(([name, variant, v]) => (
              <li key={name} className={v ? 'is-on' : undefined}>
                <span className="mix__name">
                  {name} <span className="lbl">{variant}</span>
                </span>
                <b>{String(v).padStart(2, '0')}</b>
                <i style={{ transform: `scaleX(${v / 100})` }} />
              </li>
            ))}
          </ul>
          <Radio />
        </div>
  )
}
