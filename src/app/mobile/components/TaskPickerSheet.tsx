import { haptic } from '@/app/mobile/platform'
import type { Task } from '@/features/tasks/types'
import { useT } from '@/i18n'
import Icon from '@/shared/ui/Icon'
import Sheet from './Sheet'

type Props = {
  open: boolean
  onClose: () => void
  tasks: Task[]
  setActive: (id: string | null) => Promise<void>
  /** Go to the Tasks tab (from the empty list). */
  onOpenTasks: () => void
}

/** Picks the task to work on from the pending ones, or clears it. */
export default function TaskPickerSheet({ open, onClose, tasks, setActive, onOpenTasks }: Props) {
  const t = useT()
  const pending = tasks.filter((k) => !k.done)
  const active = pending.find((k) => k.active)

  const choose = (id: string | null) => {
    setActive(id)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('m.pickTaskTitle')} kicker={<span className="num">01</span>}>
      {pending.length === 0 ? (
        <div className="m-empty is-compact">
          <p>{t('m.noPending')}</p>
          <button
            className="m-btn is-primary"
            onClick={() => {
              onClose()
              onOpenTasks()
            }}
          >
            {t('m.goToTasks')}
          </button>
        </div>
      ) : (
        <ul className="m-pick-list">
          {pending.map((k) => (
            <li key={k.id}>
              <button
                className={k.active ? 'is-on' : undefined}
                aria-pressed={!!k.active}
                onClick={() => {
                  haptic()
                  choose(k.active ? null : k.id)
                }}
              >
                <span className="m-pick-text">{k.text}</span>
                <Icon name={k.active ? 'check' : 'right'} />
              </button>
            </li>
          ))}
          {active && (
            <li>
              <button className="m-pick-none" onClick={() => choose(null)}>
                {t('tasks.removeNow')}
              </button>
            </li>
          )}
        </ul>
      )}
    </Sheet>
  )
}
