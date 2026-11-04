import { useT } from '../i18n'
import Icon from '../lib/Icon'

type Option = { id: string; label: string }
type Props = { label: string; options: Option[]; value: string; onChange: (id: string) => void }

/** "‹  TIPO 03/05 SYNE  ›": a bordered strip, like the mode switch under it, that steps through a short list of looks. */
export default function Cycler({ label, options, value, onChange }: Props) {
  const t = useT()
  const i = Math.max(0, options.findIndex((o) => o.id === value))
  const go = (d: number) => onChange(options[(i + d + options.length) % options.length].id)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <span className="cycler">
      <button onClick={() => go(-1)} aria-label={t('type.prev')}>
        <Icon name="prev" />
      </button>
      <span className="cycler-mid">
        <span className="cycler-label">{label}</span>
        <span className="cycler-count">
          {pad(i + 1)}/{pad(options.length)}
        </span>
        <span className="cycler-name">{options[i].label}</span>
      </span>
      <button onClick={() => go(1)} aria-label={t('type.next')}>
        <Icon name="next" />
      </button>
    </span>
  )
}
