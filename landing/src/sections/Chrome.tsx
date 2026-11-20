import { APP_URL, chapterOf, CHAPTERS } from '~/config'
import type { SceneId } from '~/field/scenes'

// The app's particle count (src/features/visual/particles.ts), worked out here so three.js stays out of the first load.
const SIDE = (navigator.hardwareConcurrency ?? 8) <= 4 || matchMedia('(pointer: coarse)').matches ? 180 : 256
const POINTS = (SIDE * SIDE).toLocaleString('es-ES')

/**
 * The instrument around the page, fixed in the corners: name and readings top left, the way in top right,
 * and the chapter index down the left edge.
 */
export default function Chrome({ scene }: { scene: SceneId }) {
  const at = Math.max(0, chapterOf(scene))
  const chapter = CHAPTERS[at]

  return (
    <>
      <a className="skip" href="#features">
        Saltar a las funciones
      </a>
      <header className={scene === 'hero' ? 'chrome' : 'chrome is-quiet'}>
        <div className="chrome__id">
          <a href="#top" className="chrome__mark" aria-label="Focus/Space, volver al inicio">
            FOCUS<span className="accent">/</span>SPACE
          </a>
          <p className="lbl" aria-hidden="true">
            {chapter.n} · {chapter.name}
            <br />
            {POINTS} partículas en la GPU
            <br />
            Una sala tranquila para concentrarte
          </p>
        </div>
        <nav className="chrome__nav lbl" aria-label="Principal">
          <a className="link" href="#features">
            Funciones
          </a>
          <a className="link" href="#details">
            Detalles
          </a>
          <a className="link chrome__app" href={APP_URL}>
            Abrir app <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <nav className="rail" aria-label="Capítulos">
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.anchor}>
              <a href={`#${c.anchor}`} className={i === at ? 'is-on' : undefined} aria-current={i === at ? 'true' : undefined}>
                <span className="rail__n">{c.n}</span>
                <span className="rail__name lbl">{c.name}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
