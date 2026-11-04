import { useT } from '../i18n'
import type { Task } from './types'
import './tasks.css'

const MAX_SHOWN = 10

/** The task list as a quiet read-only column beside the clock while focus mode has everything else hidden. */
export default function FocusTasks({ tasks }: { tasks: Task[] }) {
  const t = useT()
  if (!tasks.length) return null
  const label = t('tasks.pending', { n: tasks.filter((k) => !k.done).length })
  return (
    <aside className="focus-tasks" aria-label={label}>
      <div className="lbl">{label}</div>
      <ul>
        {tasks.slice(0, MAX_SHOWN).map((k, i) => (
          <li key={k.id} className={k.done ? 'dn' : k.active ? 'on' : undefined} aria-current={k.active || undefined}>
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            <span>{k.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
