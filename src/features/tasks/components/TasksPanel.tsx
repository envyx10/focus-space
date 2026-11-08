import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useT } from '@/i18n'
import Icon from '@/shared/ui/Icon'
import { isTypingTarget } from '@/shared/hooks/useShortcuts'
import ExportMenu from './ExportMenu'
import { useTaskDraft } from '@/features/tasks/hooks/useTaskDraft'
import { IMPORT_ACCEPT, readTasksFile } from '@/features/tasks/export/files'
import PriorityTag from './PriorityTag'
import TasksFocus from './TasksFocus'
import { MAX_TEXT, UNDO_MS } from '@/features/tasks/constants'
import type { Priority, Task } from '@/features/tasks/types'
import { useDragSort } from '@/features/tasks/hooks/useDragSort'
import '@/features/tasks/styles/list.css'
import { pad2 } from '@/shared/lib/format'

// Matches the CHECK on tasks.text in supabase/schema.sql.
const focusNewTask = () => document.querySelector<HTMLInputElement>('[data-new-task]')?.focus()

type Props = {
  tasks: Task[]
  synced: boolean
  saveError?: boolean
  /** The browser refused to store (private mode, full disk): nothing is lost yet, but it is only in memory. */
  localError?: boolean
  add: (text: string) => Promise<void>
  toggle: (id: string) => Promise<void>
  edit: (id: string, text: string) => Promise<void>
  describe?: (id: string, description: string) => Promise<void>
  remove: (id: string) => Promise<void>
  setActive: (id: string | null) => Promise<void>
  /** Puts a pending task at another index among the pending ones (drag or arrow keys). */
  move?: (id: string, to: number) => Promise<void>
  restore?: (task: Task) => Promise<void>
  clearDone?: () => Promise<void>
  addMany?: (tasks: Task[]) => Promise<void>
  /** Sets (or with null, takes away) a task's priority. */
  prioritize?: (id: string, priority: Priority | null) => Promise<void>
  /** Reorders the pending tasks high, medium, low, then none. */
  sortByPriority?: () => Promise<void>
}

type Sort = { grip: ReturnType<ReturnType<typeof useDragSort>['handle']>; style?: CSSProperties; dragging: boolean; total: number }
type RowProps = { task: Task; index: number; onDelete: (task: Task) => void; sort?: Sort } & Pick<Props, 'toggle' | 'edit' | 'setActive'>

function Row({ task, index, onDelete, sort, ...a }: RowProps) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.text)
  const startEdit = () => {
    setDraft(task.text)
    setEditing(true)
  }

  return (
    <li
      className={`tk${task.done ? ' dn' : ''}${task.active ? ' on' : ''}${sort?.dragging ? ' drag' : ''}`}
      data-sortable={sort ? '' : undefined}
      style={sort?.style}
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
        {pad2(index + 1)}
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
          <PriorityTag priority={task.priority} />
          {task.text}
        </span>
      )}
      <span className="tk-act">
        {sort && !editing && (
          <button
            {...sort.grip}
            className="tk-grip"
            aria-label={t('tasks.moveLabel', { text: task.text, n: index + 1, total: sort.total })}
            title={t('tasks.move')}
          >
            <Icon name="grip" />
          </button>
        )}
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

export default function TasksPanel({ tasks, synced, saveError, localError, add, restore, clearDone, addMany, describe, move, prioritize, sortByPriority, ...actions }: Props) {
  const t = useT()
  const listRef = useRef<HTMLUListElement>(null)
  const sorter = useDragSort(() => listRef.current, (id, to) => move?.(id, to))
  const [full, setFull] = useState(false)
  // A half-typed task survives a reload or a closed tab.
  const [draft, setDraft] = useTaskDraft()
  // What the last delete took away (one task, or every finished one), for Deshacer.
  const [undo, setUndo] = useState<Task[] | null>(null)
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
      undo.forEach((k) => restore(k))
      setUndo(null)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [undo, restore])

  const del = (task: Task) => {
    actions.remove(task.id)
    if (restore) setUndo([task])
  }

  // Sorting only makes sense with two or more pending tasks and at least one priority among them.
  const canSort = sortByPriority && pending > 1 && tasks.some((k) => !k.done && k.priority)

  const importFile = async (f: File | undefined) => {
    if (!f || !addMany) return
    const found = await readTasksFile(f)
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
      <ul className={`tk-list${sorter.dragging ? ' sorting' : ''}`} ref={listRef}>
        {tasks.map((t, i) => (
          <Row
            key={t.id}
            task={t}
            index={i}
            onDelete={del}
            toggle={actions.toggle}
            edit={actions.edit}
            setActive={actions.setActive}
            // Pending tasks come first, so a pending task's index is also its place among the pending ones.
            sort={move && !t.done && pending > 1 ? { grip: sorter.handle(t.id, i, pending), style: sorter.style(i), dragging: sorter.dragging === t.id, total: pending } : undefined}
          />
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
          {undo.length > 1 ? t('tasks.deletedMany', { n: undo.length }) : t('tasks.deleted')}
          <button
            onClick={() => {
              undo.forEach((k) => restore(k))
              setUndo(null)
            }}
          >
            {t('tasks.undo')}
          </button>
        </p>
      )}
      {saveError && (
        <p className="tasks-note acc" role="alert">
          {localError ? t('tasks.saveErrorLocal') : t('tasks.saveError')}
        </p>
      )}
      {(clearDone || addMany || canSort) && (
        <div className="tasks-tools">
          {clearDone && done > 0 && <button onClick={() => {
            const gone = tasks.filter((k) => k.done)
            clearDone()
            if (restore) setUndo(gone)
          }}>{t('tasks.clearDone', { n: done })}</button>}
          {canSort && <button onClick={() => sortByPriority?.()}>{t('tasks.sortPriority')}</button>}
          <ExportMenu tasks={tasks} />
          {addMany && <button onClick={() => file.current?.click()}>{t('tasks.import')}</button>}
          <input ref={file} type="file" accept={IMPORT_ACCEPT} hidden aria-label={t('tasks.importLabel')} onChange={(e) => importFile(e.target.files?.[0])} />
        </div>
      )}
      {note && (
        <p className="tasks-note" role="status">
          {note}
        </p>
      )}
      {!synced && <p className="tasks-note">{t('tasks.localOnly')}</p>}
      {full && describe && (
        <TasksFocus
          tasks={tasks}
          add={add}
          describe={describe}
          toggle={actions.toggle}
          edit={actions.edit}
          setActive={actions.setActive}
          move={move}
          prioritize={prioritize}
          sortByPriority={canSort ? sortByPriority : undefined}
          addMany={addMany}
          onClose={() => setFull(false)}
        />
      )}
    </div>
  )
}
