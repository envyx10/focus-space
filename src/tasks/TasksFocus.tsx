import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import type { Task } from './types'
import './tasksFocus.css'

const MAX_TEXT = 500
const MAX_DESC = 5000
const SAVE_MS = 600

type Actions = {
  toggle: (id: string) => Promise<void>
  edit: (id: string, text: string) => Promise<void>
  describe: (id: string, description: string) => Promise<void>
  setActive: (id: string | null) => Promise<void>
}

/** One task, big: its title and a long free-form description. Remounted (key) for each task, so drafts never leak between them. */
function Detail({ task, ...a }: { task: Task } & Actions) {
  const t = useT()
  const [title, setTitle] = useState(task.text)
  const [desc, setDesc] = useState(task.description ?? '')
  const saved = useRef(task.description ?? '')
  const latest = useRef(desc)
  latest.current = desc
  const describe = useRef(a.describe)
  describe.current = a.describe

  const flush = () => {
    if (latest.current === saved.current) return
    saved.current = latest.current
    describe.current(task.id, latest.current)
  }

  // Autosave shortly after typing stops, and once more when leaving the task or the view.
  useEffect(() => {
    const id = setTimeout(flush, SAVE_MS)
    return () => clearTimeout(id)
  }, [desc])
  useEffect(() => flush, [])

  return (
    <section className={`tf-detail${task.done ? ' dn' : ''}`}>
      <input
        className="tf-title"
        aria-label={t('tasks.focus.titleLabel')}
        maxLength={MAX_TEXT}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          if (title.trim() && title !== task.text) a.edit(task.id, title)
          else setTitle(task.text)
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      <textarea
        className="tf-desc"
        aria-label={t('tasks.focus.descLabel')}
        placeholder={t('tasks.focus.descPlaceholder')}
        maxLength={MAX_DESC}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onBlur={flush}
      />
      <div className="tf-actions">
        <button className="btn" onClick={() => a.toggle(task.id)}>
          {task.done ? t('tasks.markPending') : t('tasks.markDone')}
        </button>
        {!task.done && (
          <button className="btn" onClick={() => a.setActive(task.active ? null : task.id)}>
            {task.active ? t('tasks.removeNow') : t('tasks.doNow')}
          </button>
        )}
      </div>
    </section>
  )
}

type Props = { tasks: Task[]; onClose: () => void } & Actions

/** Full-screen task view: the list on the left, the selected task with its description on the right. */
export default function TasksFocus({ tasks, onClose, ...actions }: Props) {
  const t = useT()
  const [selected, setSelected] = useState(() => tasks.find((k) => k.active)?.id ?? tasks[0]?.id)
  const current = tasks.find((k) => k.id === selected) ?? tasks[0]
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    root.current?.focus()
    return () => prev?.focus?.()
  }, [])

  return (
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
        <div>
          <div className="num">01</div>
          <div className="lbl">{t('tasks.pending', { n: tasks.filter((k) => !k.done).length })}</div>
        </div>
        <button className="exit-immersive tf-close" onClick={onClose}>
          {t('immersive.exit')}
        </button>
      </header>
      <div className="tf-body">
        <ul className="tf-list" aria-label={t('tasks.focus.listLabel')}>
          {tasks.map((k, i) => (
            <li key={k.id}>
              <button
                className={`tf-item${k.id === current?.id ? ' sel' : ''}${k.done ? ' dn' : ''}${k.active ? ' on' : ''}`}
                aria-current={k.id === current?.id || undefined}
                onClick={() => setSelected(k.id)}
              >
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <span className="tf-item-text">{k.text}</span>
                {k.description && <span className="tf-dot" title={t('tasks.focus.hasNotes')} aria-label={t('tasks.focus.hasNotes')} />}
              </button>
            </li>
          ))}
        </ul>
        {current ? <Detail key={current.id} task={current} {...actions} /> : <p className="tf-empty">{t('tasks.focus.empty')}</p>}
      </div>
    </div>
  )
}
