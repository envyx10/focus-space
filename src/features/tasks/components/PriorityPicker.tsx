import { PRIORITIES, type Priority } from '@/features/tasks/types'
import { useT } from '@/i18n'

type Props = {
  value: Priority | null
  onChange: (priority: Priority | null) => void
}

/** None, high, medium or low, as a row of toggle buttons. */
export default function PriorityPicker({ value, onChange }: Props) {
  const t = useT()
  return (
    <div className="tf-pri" role="group" aria-label={t('tasks.priority')}>
      <span className="lbl">{t('tasks.priority')}</span>
      {([null, ...PRIORITIES] as const).map((p) => (
        <button
          key={p ?? 'none'}
          className={p ? `pri-${p}` : undefined}
          aria-pressed={value === p}
          aria-label={p ? undefined : t('tasks.priority.none')}
          title={p ? undefined : t('tasks.priority.none')}
          onClick={() => onChange(p)}
        >
          {p ? t(`tasks.priority.${p}`) : '—'}
        </button>
      ))}
    </div>
  )
}
