// Every answer comes from the project's README: nothing promised here that the app does not do.
const QA: [string, string][] = [
  ['¿Necesito una cuenta?', 'No. Funciona al momento y guarda en tu navegador. La cuenta es opcional y solo añade sincronización entre dispositivos.'],
  [
    '¿Dónde se guardan mis tareas?',
    'En tu navegador. Si inicias sesión, se sincronizan con tu cuenta; la primera vez se fusionan con las del navegador (en un conflicto gana la copia remota y se descartan los duplicados).',
  ],
  ['¿Por qué no suena nada al abrirla?', 'Los navegadores bloquean el audio hasta que tocas la página. Haz clic en cualquier sitio una vez y empezará tu mezcla guardada.'],
  [
    '¿Los sonidos son grabaciones?',
    'Los ambientes son grabaciones reales con licencia CC0. Los sonidos de frecuencias, espaciales y suaves para la migraña se generan en el navegador; binaurales y espaciales necesitan auriculares.',
  ],
  ['¿Funciona en el móvil?', 'Sí. Por debajo de 1024 px pasa a una sola columna con controles a todo el ancho, y puedes añadirla a tu pantalla de inicio como una app.'],
  [
    '¿Puedo usarla o alojarla yo?',
    'Sí, para ti, tu equipo o tu empresa. El código es FSL-1.1-MIT: cualquier uso salvo un producto comercial que compita con ella, y cada versión pasa a MIT a los dos años.',
  ],
  ['¿Qué se carga de fuera?', 'Solo dos cosas: las tipografías del reloj, desde Google Fonts, y la radio lofi, un reproductor oficial de YouTube. Ni analíticas ni seguimiento.'],
]

export default function Faq() {
  return (
    <section id="faq" className="faq" data-scene="faq" aria-labelledby="faq-title">
      <div className="stack faq__head">
        <p className="lbl" data-reveal>
          [ 06 ] Preguntas
        </p>
        <h2 id="faq-title" className="h-l" data-reveal>
          Lo que suele <em>preguntarse.</em>
        </h2>
      </div>
      <div className="faq__list">
        {QA.map(([q, a], i) => (
          <details key={q} className="qa" data-reveal open={i === 0}>
            <summary>
              <span className="lbl">{String(i + 1).padStart(2, '0')}</span>
              <span className="h-s">{q}</span>
              <span className="qa__sign" aria-hidden="true" />
            </summary>
            <p className="body">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
