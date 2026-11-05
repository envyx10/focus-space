import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import { isTypingTarget } from '../lib/useShortcuts'
import TasksFocus from './TasksFocus'
import { parseImport, serializeTasks } from './transfer'
import type { Task } from './types'
import './tasks.css'

// Matches the CHECK on tasks.text in supabase/schema.sql.
const MAX_TEXT = 500
const UNDO_MS = 8000
const focusNewTask = () => document.querySelector<HTMLInputElement>('[data-new-task]')?.focus()

type Props = {
  tasks: Task[]
  synced: boolean
  saveError?: boolean
  add: (text: string) => Promise<void>
  toggle: (id: string) => Promise<void>
  edit: (id: string, text: string) => Promise<void>
  describe?: (id: string, description: string) => Promise<void>
  remove: (id: string) => Promise<void>
  setActive: (id: string | null) => Promise<void>
  restore?: (task: Task) => Promise<void>
  clearDone?: () => Promise<void>
  addMany?: (tasks: Task[]) => Promise<void>
}

type RowProps = { task: Task; index: number; onDelete: (task: Task) => void } & Pick<Props, 'toggle' | 'edit' | 'setActive'>

function Row({ task, index, onDelete, ...a }: RowProps) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.text)
  const startEdit = () => {
    setDraft(task.text)
    setEditing(true)
  }

  return (
    <li
      className={`tk${task.done ? ' dn' : ''}${task.active ? ' on' : ''}`}
      onKeyDown={(e) => {
        // Supr/Retroceso on any of the row's buttons deletes it; never while editing its text.
        if ((e.key !== 'Delete' && e.key !== 'Backspace') || editing) return
        e.preventDefault()
        onDelete(task)
        focusNewTask()
      }}
    >
      <button
        className="tk-box"
        role="checkbox"
        aria-checked={task.done}
        aria-label={t('tasks.complete', { text: task.text })}
        title={task.done ? t('tasks.markPending') : t('tasks.markDone')}
        onClick={() => a.toggle(task.id)}
      >
        {String(index + 1).padStart(2, '0')}
      </button>
      {editing ? (
        <input
          className="tk-edit"
          autoFocus
          maxLength={MAX_TEXT}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            setEditing(false)
            if (draft.trim() && draft !== task.text) a.edit(task.id, draft)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') {
              setDraft(task.text)
              setEditing(false)
            }
          }}
        />
      ) : (
        <span className="tk-text" onDoubleClick={startEdit}>
          {task.text}
        </span>
      )}
      <span className="tk-act">
        {!task.done && (
          <button
            aria-label={task.active ? t('tasks.removeActive') : t('tasks.setActive')}
            title={task.active ? t('tasks.removeNow') : t('tasks.doNow')}
            className="tk-arrow"
            onClick={() => a.setActive(task.active ? null : task.id)}
          >
            <Icon name="right" />
          </button>
        )}
        {!editing && (
          <button aria-label={t('tasks.editLabel', { text: task.text })} title={t('tasks.edit')} className="tk-pen" onClick={startEdit}>
            <Icon name="edit" />
          </button>
        )}
        <button aria-label={t('tasks.deleteLabel', { text: task.text })} title={t('tasks.delete')} className="tk-del"
          onClick={(e) => {
            onDelete(task)
            // detail 0 = activated with Enter/Space, so keep the keyboard flow going.
            if (!e.detail) focusNewTask()
          }}
        >
          <Icon name="close" />
        </button>
      </span>
    </li>
  )
}

export default function TasksPanel({ tasks, synced, saveError, add, restore, clearDone, addMany, describe, ...actions }: Props) {
  const t = useT()
  const [full, setFull] = useState(false)
  const [draft, setDraft] = useState('')
  const [undo, setUndo] = useState<Task | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const pending = tasks.filter((t) => !t.done).length
  const done = tasks.length - pending

  useEffect(() => {
    if (!undo) return
    const id = setTimeout(() => setUndo(null), UNDO_MS)
    return () => clearTimeout(id)
  }, [undo])

  // Ctrl/Cmd+Z brings the deleted task back while the undo notice is up; a field with text keeps its own undo.
  useEffect(() => {
    if (!undo || !restore) return
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== 'z') return
      if (isTypingTarget(e.target) && (e.target as HTMLInputElement).value) return
      e.preventDefault()
      restore(undo)
      setUndo(null)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [undo, restore])

  const del = (task: Task) => {
    actions.remove(task.id)
    if (restore) setUndo(task)
  }

  const exportTasks = () => {
    const url = URL.createObjectURL(new Blob([serializeTasks(tasks)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'focus-space-tareas.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const importFile = async (f: File | undefined) => {
    if (!f || !addMany) return
    const found = parseImport(await f.text())
    await addMany(found)
    setNote(found.length ? t('tasks.imported', { n: found.length }) : t('tasks.importedNone'))
    if (file.current) file.current.value = ''
  }

  return (
    <div className="tasks">
      <div className="tasks-head">
        <div>
          <div className="num">01</div>
          <div className="lbl">{t('tasks.pending', { n: pending })}</div>
        </div>
        {describe && (
          <button className="tasks-expand" aria-label={t('tasks.focus.open')} title={t('tasks.focus.open')} onClick={() => setFull(true)}>
            <Icon name="expand" />
          </button>
        )}
      </div>
      <ul className="tk-list">
        {tasks.map((t, i) => (
          <Row key={t.id} task={t} index={i} onDelete={del} toggle={actions.toggle} edit={actions.edit} setActive={actions.setActive} />
        ))}
        <li className="tk tk-new">
          {/* the placeholder already starts with "+" */}
          <span className="tk-box" aria-hidden />
          <input
            data-new-task
            placeholder={t('tasks.new')}
            aria-label={t('tasks.newLabel')}
            maxLength={MAX_TEXT}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // ↑ jumps to the last task's delete button: Enter or Supr deletes it.
              if (e.key === 'ArrowUp') e.currentTarget.closest('ul')?.querySelector<HTMLElement>('.tk:nth-last-child(2) .tk-del')?.focus()
              // Backspace on an empty box deletes the whole last task; a held key never chains deletes (undo only keeps one).
              if (e.key === 'Backspace' && !e.repeat && !draft && tasks.length) del(tasks[tasks.length - 1])
              if (e.key === 'Enter' && draft.trim()) {
                add(draft)
                setDraft('')
              }
            }}
          />
        </li>
      </ul>
      {undo && restore && (
        <p className="tasks-undo" role="status">
          {t('tasks.deleted')}
          <button
            onClick={() => {
              restore(undo)
              setUndo(null)
            }}
          >
            {t('tasks.undo')}
          </button>
        </p>
      )}
      {saveError && (
        <p className="tasks-note acc" role="alert">
          {t('tasks.saveError')}
        </p>
      )}
      {(clearDone || addMany) && (
        <div className="tasks-tools">
          {clearDone && done > 0 && <button onClick={() => clearDone()}>{t('tasks.clearDone', { n: done })}</button>}
          {tasks.length > 0 && <button onClick={exportTasks}>{t('tasks.export')}</button>}
          {addMany && <button onClick={() => file.current?.click()}>{t('tasks.import')}</button>}
          <input ref={file} type="file" accept=".json,.txt,.md,text/plain,application/json" hidden aria-label={t('tasks.importLabel')} onChange={(e) => importFile(e.target.files?.[0])} />
        </div>
      )}
      {note && (
        <p className="tasks-note" role="status">
          {note}
        </p>
      )}
      {!synced && <p className="tasks-note">{t('tasks.localOnly')}</p>}
      {full && describe && (
        <TasksFocus tasks={tasks} add={add} describe={describe} toggle={actions.toggle} edit={actions.edit} setActive={actions.setActive} onClose={() => setFull(false)} />
      )}
    </div>
  )
}
