import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MAX_TEXT } from '@/features/tasks/constants'
import { IMPORT_ACCEPT, readTasksFile } from '@/features/tasks/export/files'
import { useDragSort } from '@/features/tasks/hooks/useDragSort'
import type { Task } from '@/features/tasks/types'
import { useT } from '@/i18n'
import { pad2 } from '@/shared/lib/format'
import Icon from '@/shared/ui/Icon'
import ExportMenu from './ExportMenu'
import PriorityTag from './PriorityTag'
import TaskDetail, { type TaskActions } from './TaskDetail'
import '@/features/tasks/styles/focus.css'

type Actions = TaskActions & { add: (text: string) => Promise<void> }

type Props = {
  tasks: Task[]
  onClose: () => void
  /** Puts a pending task at another index among the pending ones (drag or arrow keys on its handle). */
  move?: (id: string, to: number) => Promise<void>
  sortByPriority?: () => Promise<void>
  addMany?: (tasks: Task[]) => Promise<void>
} & Actions

/**
 * Full-screen tasks: same grid as the app (list in the first four columns, the selected task as a page in the other eight),
 * drawn over everything and in the browser's fullscreen, like focus mode.
 */
export default function TasksFocus({ tasks, onClose, add, move: moveTask, sortByPriority, addMany, ...actions }: Props) {
  const t = useT()
  const listRef = useRef<HTMLUListElement>(null)
  const sorter = useDragSort(() => listRef.current, (id, to) => moveTask?.(id, to))
  const file = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState(() => tasks.find((k) => k.active)?.id ?? tasks.find((k) => !k.done)?.id ?? tasks[0]?.id)
  const [draft, setDraft] = useState('')
  // A task just added from here opens as soon as it shows up in the list.
  const [pickNewest, setPickNewest] = useState(false)
  const [seen, setSeen] = useState(tasks)
  const root = useRef<HTMLDivElement>(null)
  const index = Math.max(0, tasks.findIndex((k) => k.id === selected))
  const current = tasks[index]
  const pending = tasks.filter((k) => !k.done).length
  const closeOnExit = useEffectEvent(onClose)

  if (tasks !== seen) {
    setSeen(tasks)
    if (pickNewest) {
      setPickNewest(false)
      const newest = tasks.reduce<Task | undefined>((a, k) => (!a || k.createdAt > a.createdAt ? k : a), undefined)
      if (newest) setSelected(newest.id)
    }
  }

  // Into the browser's fullscreen on open; leaving it (the browser's own Esc) leaves the view too.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    root.current?.focus()
    // The panels underneath are out of reach (Tab, screen readers) while the view is open.
    const behind = [...(root.current?.parentElement?.children ?? [])].filter((el): el is HTMLElement => el !== root.current && el instanceof HTMLElement && !el.inert)
    behind.forEach((el) => (el.inert = true))
    const entered = !document.fullscreenElement
    if (entered) document.documentElement.requestFullscreen?.().catch(() => {})
    // Only a fullscreen that was really reached closes the view when it ends (a refused or bounced request must not).
    let reached = !!document.fullscreenElement
    const onChange = () => {
      if (document.fullscreenElement) reached = true
      else if (reached) closeOnExit()
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      behind.forEach((el) => (el.inert = false))
      if (entered && document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
      prev?.focus?.()
    }
  }, [])

  const move = (by: number) => {
    const next = tasks[Math.min(tasks.length - 1, Math.max(0, index + by))]
    if (!next) return
    setSelected(next.id)
    root.current?.querySelector<HTMLElement>(`[data-task="${next.id}"]`)?.focus()
  }

  const view = (
    <div
      ref={root}
      className="tf"
      role="dialog"
      aria-modal="true"
      aria-label={t('tasks.focus.title')}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onClose()
        }
      }}
    >
      <header className="tf-head">
        <span className="tf-brand">{t('tasks.focus.title')}</span>
        <span className="tf-head-tools">
          <ExportMenu tasks={tasks} className="tf-close" />
          {addMany && (
            <button className="tf-close" onClick={() => file.current?.click()} title={t('tasks.focus.importTasksLabel')}>
              {t('tasks.focus.importTasks')}
            </button>
          )}
          {addMany && <input
            ref={file}
            type="file"
            accept={IMPORT_ACCEPT}
            hidden
            aria-label={t('tasks.focus.importTasksLabel')}
            onChange={async (e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (!f || !addMany) return
              const found = await readTasksFile(f)
              await addMany(found)
              setNote(found.length ? t('tasks.imported', { n: found.length }) : t('tasks.importedNone'))
            }}
          />}
          <button className="tf-close" onClick={onClose}>
            {t('immersive.exit')}
          </button>
        </span>
      </header>

      <aside className="tf-side">
        <div className="num">01</div>
        <div className="lbl">{t('tasks.pending', { n: pending })}</div>
        {(sortByPriority || note) && (
          <div className="tf-side-tools">
            {sortByPriority && <button onClick={() => sortByPriority()}>{t('tasks.sortPriority')}</button>}
            {note && <span role="status">{note}</span>}
          </div>
        )}
        <ul className={`tf-list${sorter.dragging ? ' sorting' : ''}`} ref={listRef} aria-label={t('tasks.focus.listLabel')}>
          {tasks.map((k, i) => {
            // Pending tasks come first, so a pending task's index is also its place among the pending ones.
            const sortable = moveTask && !k.done && pending > 1
            return (
            <li key={k.id} data-sortable={sortable ? '' : undefined} style={sortable ? sorter.style(i) : undefined} className={sorter.dragging === k.id ? 'drag' : undefined}>
              <button
                data-task={k.id}
                className={`tf-item${k.id === current?.id ? ' sel' : ''}${k.done ? ' dn' : ''}${k.active ? ' on' : ''}`}
                aria-current={k.id === current?.id || undefined}
                onClick={() => setSelected(k.id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    move(e.key === 'ArrowDown' ? 1 : -1)
                  }
                }}
              >
                <span className="tf-n">{pad2(i + 1)}</span>
                <span className="tf-item-text">
                  <PriorityTag priority={k.priority} />
                  {k.text}
                </span>
                {k.description?.trim() && <span className="tf-dot" title={t('tasks.focus.hasNotes')} aria-label={t('tasks.focus.hasNotes')} />}
              </button>
              {sortable && (
                <button
                  {...sorter.handle(k.id, i, pending)}
                  className="tf-grip"
                  aria-label={t('tasks.moveLabel', { text: k.text, n: i + 1, total: pending })}
                  title={t('tasks.move')}
                >
                  <Icon name="grip" />
                </button>
              )}
            </li>
            )
          })}
          <li className="tf-new">
            <span className="tf-n" aria-hidden />
            <input
              placeholder={t('tasks.new')}
              aria-label={t('tasks.newLabel')}
              maxLength={MAX_TEXT}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draft.trim()) {
                  setPickNewest(true)
                  add(draft)
                  setDraft('')
                }
              }}
            />
          </li>
        </ul>
      </aside>

      <main className="tf-main">
        {current ? <TaskDetail key={current.id} task={current} index={index} {...actions} /> : <p className="tf-empty">{t('tasks.focus.empty')}</p>}
      </main>
    </div>
  )

  // Into .app, not inside the tasks column: above every region, and still under the app's accent and text-size variables.
  return createPortal(view, document.querySelector('.app') ?? document.body)
}
