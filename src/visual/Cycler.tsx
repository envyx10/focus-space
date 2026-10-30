type Option = { id: string; label: string }
type Props = { label: string; noun: string; options: Option[]; value: string; onChange: (id: string) => void }

/** "ESCENA ‹ 01/06 Esfera ›": steps through a short list of looks. */
export default function Cycler({ label, noun, options, value, onChange }: Props) {
  const i = Math.max(0, options.findIndex((o) => o.id === value))
  const go = (d: number) => onChange(options[(i + d + options.length) % options.length].id)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <span className="focus-ctl cycler">
      <span className="lbl">{label}</span>
      <button onClick={() => go(-1)} aria-label={`${noun[0].toUpperCase()}${noun.slice(1)} anterior`}>
        ‹
      </button>
      <span className="on">
        {pad(i + 1)}/{pad(options.length)}
      </span>
      <span className="cycler-name">{options[i].label}</span>
      <button onClick={() => go(1)} aria-label={`Siguiente ${noun}`}>
        ›
      </button>
    </span>
  )
}
