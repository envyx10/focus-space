import { useState } from 'react'
import { REPO_URL } from '~/config'

// The README's quick start, verbatim.
const STEPS = ['git clone https://github.com/envyx10/focus-space.git', 'cd focus-space', 'bun install', 'bun run dev']

/** For the people who would rather read the code: the real four commands, and a copy button. */
export default function Local() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard
      ?.writeText(STEPS.join('\n'))
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      })
      .catch(() => {})
  }

  return (
    <section id="local" className="local" data-scene="local" aria-labelledby="local-title">
      <div className="stack">
        <p className="lbl" data-reveal>
          [ 07 ] En local
        </p>
        <h2 id="local-title" className="h-l" data-reveal>
          Cuatro comandos <em>y es tuya.</em>
        </h2>
        <p className="body" data-reveal>
          Necesitas Bun. Abre <b>localhost:5173</b> y ya está: tareas y preferencias viven en tu navegador. Para sincronizar entre dispositivos, añade un proyecto gratuito de Supabase.
        </p>
        <a className="box" href={REPO_URL} data-reveal>
          Ver el código ↗
        </a>
      </div>
      <div className="term" data-reveal>
        <div className="term__bar lbl">
          <span>[ Terminal ]</span>
          <button type="button" className="term__copy" onClick={copy}>
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>
        <pre>
          <code>
            {STEPS.map((s) => (
              <span key={s} className="term__line">
                <span className="term__prompt" aria-hidden="true">
                  ${' '}
                </span>
                {s}
                {'\n'}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </section>
  )
}
