import { useT } from '@/i18n'
import { SHORTCUTS } from './options'

/** The keyboard shortcuts as a definition list: the key, then what it does. */
export default function ShortcutList({ className }: { className: string }) {
  const t = useT()
  return (
    <dl className={className}>
      {SHORTCUTS.map(([key, desc]) => (
        <div key={key}>
          <dt>
            <kbd>{key.startsWith('key.') ? t(key) : key}</kbd>
          </dt>
          <dd>{t(desc)}</dd>
        </div>
      ))}
    </dl>
  )
}
