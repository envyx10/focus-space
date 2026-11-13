import { useState } from 'react'
import { PRESETS } from '@/features/settings/options'
import { DEFAULT_CONFIG } from '@/features/timer/timer'

const MIN = 60_000
const EVERY = DEFAULT_CONFIG.longEvery // a long break after every 4 focus blocks, as in the app

type Block = { kind: 'work' | 'short' | 'long'; min: number }

/** One full Pomodoro cycle with the app's own presets: four focus blocks, three short breaks, one long. */
function cycle(i: number): Block[] {
  const { work, short, long } = PRESETS[i].cfg
  const out: Block[] = []
  for (let k = 1; k <= EVERY; k++) {
    out.push({ kind: 'work', min: work / MIN })
    out.push(k === EVERY ? { kind: 'long', min: long / MIN } : { kind: 'short', min: short / MIN })
  }
  return out
}

const hm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`)

/** The rhythm of a session, drawn to scale: pick one of the app's presets and the cycle redraws itself. */
export default function Rhythm() {
  const [p, setP] = useState(0)
  const blocks = cycle(p)
  const total = blocks.reduce((a, b) => a + b.min, 0)
  const focus = blocks.filter((b) => b.kind === 'work').reduce((a, b) => a + b.min, 0)

  return (
    <section id="rhythm" className="rhythm" data-scene="rhythm" aria-labelledby="rhythm-title">
      <div className="rhythm__head">
        <div className="stack">
          <p className="lbl" data-reveal>
            [ 03 ] El ritmo
          </p>
          <h2 id="rhythm-title" className="h-xl" data-reveal>
            Trabaja en bloques. <em>Descansa a tiempo.</em>
          </h2>
        </div>
        <div className="stack rhythm__pick" data-reveal>
          <p className="body">
            Un ciclo Pomodoro completo, a escala: cuatro bloques de foco y un descanso largo al final. Elige un ritmo de la app y míralo cambiar.
          </p>
          <div className="seg" role="radiogroup" aria-label="Ritmo">
            {PRESETS.map((x, i) => (
              <button key={x.label} type="button" role="radio" aria-checked={p === i} className="seg__btn" onClick={() => setP(i)}>
                {x.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ol className="cycle" data-reveal aria-label={`Ciclo de ${hm(total)}: ${blocks.map((b) => `${b.min} min de ${b.kind === 'work' ? 'foco' : 'descanso'}`).join(', ')}`}>
        {blocks.map((b, i) => (
          <li key={i} className={`cycle__b cycle__b--${b.kind}`} style={{ flexGrow: b.min }} aria-hidden="true">
            <span className="cycle__min">{b.min}</span>
            <span className="lbl">{b.kind === 'work' ? 'Foco' : b.kind === 'long' ? 'Descanso largo' : 'Pausa'}</span>
          </li>
        ))}
      </ol>

      <dl className="tally" data-reveal>
        <div>
          <dt className="lbl">Foco</dt>
          <dd>{hm(focus)}</dd>
        </div>
        <div>
          <dt className="lbl">Descanso</dt>
          <dd>{hm(total - focus)}</dd>
        </div>
        <div>
          <dt className="lbl">Ciclo completo</dt>
          <dd>{hm(total)}</dd>
        </div>
        <div>
          <dt className="lbl">Y además</dt>
          <dd className="tally__note">+5 min, saltar fase, o que la siguiente espere a que la empieces tú.</dd>
        </div>
      </dl>
    </section>
  )
}
