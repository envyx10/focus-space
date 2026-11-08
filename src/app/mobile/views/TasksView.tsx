import { useEffect, useRef, useState, type FormEvent } from 'react'
import Sheet from '@/app/mobile/components/Sheet'
import TaskMenuSheet from '@/app/mobile/components/TaskMenuSheet'
import TaskRow from '@/app/mobile/components/TaskRow'
import { useLargeTitle } from '@/app/mobile/hooks/useLargeTitle'
import { haptic } from '@/app/mobile/platform'
import TaskDetail from '@/features/tasks/components/TaskDetail'
import { MAX_TEXT, UNDO_MS } from '@/features/tasks/constants'
import { readTasksFile } from '@/features/tasks/export/files'
import { useTaskDraft } from '@/features/tasks/hooks/useTaskDraft'
import type { TasksApi } from '@/features/tasks/hooks/useTasks'
import type { Task } from '@/features/tasks/types'
import { useT } from '@/i18n'
import Icon from '@/shared/ui/Icon'

type Props = {
  tasks: TasksApi
  synced: boolean
  /** "Do now" goes straight to the Focus tab, where the task now is. */
  onFocus: () => void
}

// The undo notice stays longer than on desktop: a phone may be away from the hand, and a keyboard user needs time to reach it.
const UNDO_MOBILE_MS = Math.max(UNDO_MS, 12000)

export default function TasksView({ tasks: api, synced, onFocus }: Props) {
  const t = useT()
  const { tasks } = api
  const [draft, setDraft] = useTaskDraft()
  const [openId, setOpenId] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  const [showDone, setShowDone] = useState(true)
  const [undo, setUndo] = useState<Task[] | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [holdUndo, setHoldUndo] = useState(false)
  const list = useRef<HTMLDivElement>(null)
  const added = useRef(false)
  const { compact, onScroll } = useLargeTitle()

  const pending = tasks.filter((k) => !k.done)
  const done = tasks.filter((k) => k.done)
  const openIndex = tasks.findIndex((k) => k.id === openId)
  const open = openIndex >= 0 ? tasks[openIndex] : null
  // Where the open task sits among the pending ones, for Move up / Move down (dragging would fight the row swipes).
  const openPlace = open && !open.done ? pending.indexOf(open) : -1
  const canSort = pending.length > 1 && pending.some((k) => k.priority)

  // Each delete restarts the clock; it waits while the notice has focus or a finger on it.
  useEffect(() => {
    if (!undo || holdUndo) return
    const id = setTimeout(() => setUndo(null), UNDO_MOBILE_MS)
    return () => clearTimeout(id)
  }, [undo, holdUndo])

  // A task just added from the composer scrolls into view (it lands at the end of the list).
  useEffect(() => {
    if (!added.current) return
    added.current = false
    const rows = list.current?.querySelectorAll('.m-list:first-of-type > .m-row')
    rows?.[rows.length - 1]?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }, [tasks])

  useEffect(() => {
    if (!note) return
    const id = setTimeout(() => setNote(null), 4000)
    return () => clearTimeout(id)
  }, [note])

  // Deletes pile up while the notice is up, so Undo brings back all of them, not just the last one.
  const del = (task: Task) => {
    api.remove(task.id)
    setNote(null)
    setUndo((u) => [...(u ?? []), task])
  }

  // Ticking a box moves the row to the other list (a new element): keep the focus on its box.
  const toggle = (id: string) => {
    api.toggle(id)
    requestAnimationFrame(() => list.current?.querySelector<HTMLElement>(`[data-check="${id}"]`)?.focus({ preventScroll: true }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    added.current = true
    api.add(draft)
    setDraft('')
    haptic(6)
  }

  const importFile = async (f: File) => {
    const found = await readTasksFile(f)
    await api.addMany(found)
    setUndo(null)
    setNote(found.length ? t('tasks.imported', { n: found.length }) : t('tasks.importedNone'))
  }

  const toastText = undo ? (undo.length > 1 ? t('tasks.deletedMany', { n: undo.length }) : t('tasks.deleted')) : (note ?? '')

  const row = (task: Task, n: number) => <TaskRow key={task.id} task={task} n={n} onOpen={() => setOpenId(task.id)} onToggle={() => toggle(task.id)} onDelete={() => del(task)} />

  return (
    <div className="m-screen">
      <header className={`m-bar${compact ? ' is-compact' : ''}`}>
        <span className="m-bar-title" aria-hidden={!compact}>
          {t('tabs.tasks')}
        </span>
        <button className="m-icon-btn m-bar-end" onClick={() => setMenu(true)} aria-label={t('m.listMenu')}>
          <Icon name="more" />
        </button>
      </header>

      <div ref={list} className="m-scroll" onScroll={onScroll}>
        <div className="m-large">
          <span className="num">02</span>
          <h1>{t('tabs.tasks')}</h1>
          <p className="lbl">
            {t('tasks.pending', { n: pending.length })} · {synced ? t('m.synced') : t('m.localOnly')}
          </p>
        </div>

        {api.error && (
          <p className="m-alert" role="alert">
            {api.localError ? t('tasks.saveErrorLocal') : t('tasks.saveError')}
          </p>
        )}

        {tasks.length === 0 ? (
          <div className="m-empty">
            <span className="m-empty-mark" aria-hidden />
            <p className="m-empty-title">{t('m.tasksEmpty')}</p>
            <p className="m-empty-hint">{t('m.tasksEmptyHint')}</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && <ul className="m-list">{pending.map((k, i) => row(k, i))}</ul>}
            {pending.length === 0 && <p className="m-all-done">{t('m.allDone')}</p>}
            {done.length > 0 && (
              <section className="m-done">
                <button className="m-section-toggle" aria-expanded={showDone} onClick={() => setShowDone((s) => !s)}>
                  <span>{t('m.completed', { n: done.length })}</span>
                  <Icon name={showDone ? 'up' : 'down'} />
                </button>
                {showDone && <ul className="m-list">{done.map((k, i) => row(k, i))}</ul>}
              </section>
            )}
            <p className="m-gesture-hint">{t('m.swipeHint')}</p>
          </>
        )}
      </div>

      {/* Always mounted, so screen readers announce each change (a live region created with its text is often missed). */}
      <p className="m-sr" role="status">
        {toastText}
      </p>
      {(undo || note) && (
        <div className="m-toast" onFocus={() => setHoldUndo(true)} onBlur={() => setHoldUndo(false)} onPointerEnter={() => setHoldUndo(true)} onPointerLeave={() => setHoldUndo(false)}>
          <span aria-hidden>{toastText}</span>
          {undo && (
            <button
              onClick={() => {
                undo.forEach((k) => api.restore(k))
                setUndo(null)
                setHoldUndo(false)
                haptic(8)
              }}
            >
              {t('tasks.undo')}
            </button>
          )}
        </div>
      )}

      <form className="m-composer" onSubmit={submit}>
        <span className="m-composer-plus" aria-hidden>
          <Icon name="plus" />
        </span>
        <input
          data-new-task
          placeholder={t('m.newTask')}
          aria-label={t('tasks.newLabel')}
          maxLength={MAX_TEXT}
          enterKeyHint="enter"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="m-composer-add" disabled={!draft.trim()} aria-label={t('m.addTask')}>
          <Icon name="right" />
        </button>
      </form>

      <Sheet
        open={open !== null}
        onClose={() => setOpenId(null)}
        full
        title={t('m.taskTitle')}
        actions={
          open && (
            <>
            {openPlace >= 0 && pending.length > 1 && (
              <>
                <button className="m-icon-btn" disabled={openPlace === 0} aria-label={t('m.moveUp')} onClick={() => api.move(open.id, openPlace - 1)}>
                  <Icon name="up" />
                </button>
                <button className="m-icon-btn" disabled={openPlace === pending.length - 1} aria-label={t('m.moveDown')} onClick={() => api.move(open.id, openPlace + 1)}>
                  <Icon name="down" />
                </button>
              </>
            )}
            <button
              className="m-icon-btn is-danger"
              aria-label={t('tasks.deleteLabel', { text: open.text })}
              onClick={() => {
                del(open)
                setOpenId(null)
              }}
            >
              <Icon name="trash" />
            </button>
            </>
          )
        }
      >
        {open && (
          <TaskDetail
            key={open.id}
            task={open}
            index={open.done ? done.indexOf(open) : pending.indexOf(open)}
            toggle={async (id) => {
              // Marking it done is the end of this task: back to the list, which shows it ticked.
              const finishing = !open.done
              await api.toggle(id)
              if (finishing) {
                haptic(10)
                setOpenId(null)
              }
            }}
            edit={api.edit}
            describe={api.describe}
            prioritize={api.prioritize}
            setActive={async (id) => {
              await api.setActive(id)
              if (id) {
                setOpenId(null)
                onFocus()
              }
            }}
          />
        )}
      </Sheet>

      <TaskMenuSheet
        open={menu}
        onClose={() => setMenu(false)}
        tasks={tasks}
        canSort={canSort}
        onClearDone={() => {
          setUndo(done)
          api.clearDone()
        }}
        onSort={api.sortByPriority}
        onImport={importFile}
      />
    </div>
  )
}
