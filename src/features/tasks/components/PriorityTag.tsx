import type { Priority } from '@/features/tasks/types'
import { useT } from '@/i18n'

/** The priority as a small word before the title ("ALTA"), so it reads without relying on colour. */
export default function PriorityTag({ priority }: { priority?: Priority | null }) {
  const t = useT()
  if (!priority) return null
  const name = t(`tasks.priority.${priority}`)
  return (
    <span className={`pri pri-${priority}`} title={t('tasks.priorityOf', { p: name })}>
      {name}
    </span>
  )
}
