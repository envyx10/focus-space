import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useI18n, useT } from '../i18n'
import Icon from '../lib/Icon'
import { useTaskDraft } from '../tasks/draft'
import { Detail } from '../tasks/TasksFocus'
import { MAX_TEXT, UNDO_MS } from '../tasks/TasksPanel'
import { exportHtml, exportJson, exportWord, IMPORT_ACCEPT, readTasksFile } from '../tasks/files'
import PriorityTag from '../tasks/PriorityTag'
import type { Task } from '../tasks/types'
import type { useTasks } from '../tasks/useTasks'
import { haptic } from './platform'
import Sheet from './Sheet'
import { useLargeTitle } from './useLargeTitle'

/** Keeps the gesture on this element even if the finger slides off it. A pointer that is already gone throws: ignore. */
const capture = (el: Element, id: number) => {
  try {
    el.setPointerCapture(id)
  } catch {
    // the pointer ended before the gesture locked
  }
}

type Props = {
  tasks: ReturnType<typeof useTasks>
  synced: boolean
  /** "Do now" goes straight to the Focus tab, where the task now is. */
  onFocus: () => void
}

// The undo notice stays longer than on desktop: a phone may be away from the hand, and a keyboard user needs time to reach it.
const UNDO_MOBILE_MS = Math.max(UNDO_MS, 12000)

// How far a row must travel before letting go acts (px), and the axis lock (px).
const ARM = 84
const LOCK = 8
const num = (i: number) => String(i + 1).padStart(2, '0')

type RowProps = {
  task: Task
  n: number
  onOpen: () => void
  onToggle: () => void
  onDelete: () => void
}

/** A task row. Swipe right to complete (or reopen), left to delete; tap opens the task. The number is the checkbox. */
function Row({ task, n, onOpen, onToggle, onDelete }: RowProps) {
  const t = useT()
  const li = useRef<HTMLLIElement>(null)
  const fg = useRef<HTMLDivElement>(null)
  const g = useRef<{ x: number; y: number; id: number; locked: boolean; dx: number; armed: boolean } | null>(null)
  const swiped = useRef(false)

  const show = (dx: number) => {
    if (!fg.current || !li.current) return
    fg.current.style.transform = dx ? `translateX(${dx}px)` : ''
    li.current.dataset.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : ''
    li.current.dataset.armed = Math.abs(dx) >= ARM ? 'yes' : ''
  }
  const settle = () => {
    li.current?.classList.remove('is-swiping')
    show(0)
  }

  return (
    <li
      ref={li}
      className={`m-row${task.done ? ' is-done' : ''}${task.active && !task.done ? ' is-active' : ''}`}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        g.current = { x: e.clientX, y: e.clientY, id: e.pointerId, locked: false, dx: 0, armed: false }
      }}
      onPointerMove={(e) => {
        const s = g.current
        if (!s || s.id !== e.pointerId) return
        const dx = e.clientX - s.x
        if (!s.locked) {
          const dy = Math.abs(e.clientY - s.y)
          if (dy > LOCK && dy > Math.abs(dx)) return void (g.current = null) // scrolling the list
          if (Math.abs(dx) < LOCK) return
          s.locked = true
          capture(e.currentTarget, e.pointerId)
          e.currentTarget.classList.add('is-swiping')
        }
        // 1:1 up to the arm point, then it resists
        const a = Math.abs(dx)
        s.dx = Math.sign(dx) * (a <= ARM ? a : ARM + (a - ARM) * 0.35)
        const armed = a >= ARM
        if (armed !== s.armed) {
          s.armed = armed
          if (armed) haptic(6)
        }
        show(s.dx)
      }}
      onPointerUp={() => {
        const s = g.current
        g.current = null
        if (!s?.locked) return
        swiped.current = true
        setTimeout(() => (swiped.current = false), 0)
        if (s.dx >= ARM) {
          settle()
          haptic(10)
          onToggle()
        } else if (s.dx <= -ARM) {
          li.current?.classList.add('is-leaving')
          show(-(li.current?.offsetWidth ?? 400))
          setTimeout(onDelete, 160)
        } else settle()
      }}
      onPointerCancel={() => {
        g.current = null
        settle()
      }}
    >
      <div className="m-row-bg" aria-hidden>
        <span className="m-row-bg-done">
          <Icon name="check" />
          {task.done ? t('tasks.markPending') : t('tasks.markDone')}
        </span>
        <span className="m-row-bg-del">
          {t('tasks.delete')}
          <Icon name="trash" />
        </span>
      </div>
      <div ref={fg} className="m-row-fg">
        <button
          data-check={task.id}
          className="m-check"
          role="checkbox"
          aria-checked={task.done}
          aria-label={t('tasks.complete', { text: task.text })}
          onClick={() => {
            if (swiped.current) return
            haptic(10)
            onToggle()
          }}
        >
          <span className="m-check-box">{task.done ? <Icon name="check" /> : num(n)}</span>
        </button>
        <button className="m-row-main" onClick={() => !swiped.current && onOpen()} aria-label={t('m.openTask', { text: task.text })}>
          <span className="m-row-text">
            <PriorityTag priority={task.priority} />
            {task.text}
          </span>
          {((task.active && !task.done) || task.description?.trim()) && (
            <span className="m-row-meta">
              {task.active && !task.done && <span className="acc">{t('tasks.focus.statusNow')}</span>}
              {task.description?.trim() && <span>{t('tasks.focus.hasNotes')}</span>}
            </span>
          )}
        </button>
        <span className="m-row-chev" aria-hidden>
          <Icon name="next" />
        </span>
      </div>
    </li>
  )
}

export default function TasksView({ tasks: api, synced, onFocus }: Props) {
  const { t, lang } = useI18n()
  const { tasks } = api
  const [draft, setDraft] = useTaskDraft()
  const [openId, setOpenId] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  const [showDone, setShowDone] = useState(true)
  const [undo, setUndo] = useState<Task[] | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [holdUndo, setHoldUndo] = useState(false)
  const file = useRef<HTMLInputElement>(null)
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

  const importFile = async (f: File | undefined) => {
    if (!f) return
    const found = await readTasksFile(f)
    await api.addMany(found)
    setUndo(null)
    setNote(found.length ? t('tasks.imported', { n: found.length }) : t('tasks.importedNone'))
    if (file.current) file.current.value = ''
  }

  const toastText = undo ? (undo.length > 1 ? t('tasks.deletedMany', { n: undo.length }) : t('tasks.deleted')) : (note ?? '')

  const row = (task: Task, n: number) => <Row key={task.id} task={task} n={n} onOpen={() => setOpenId(task.id)} onToggle={() => toggle(task.id)} onDelete={() => del(task)} />

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
          <Detail
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

      <Sheet open={menu} onClose={() => setMenu(false)} title={t('m.listMenu')}>
        <div className="m-menu">
          <button
            disabled={done.length === 0}
            onClick={() => {
              const gone = done
              api.clearDone()
              setUndo(gone)
              setMenu(false)
            }}
          >
            {t('tasks.clearDone', { n: done.length })}
          </button>
          <button
            disabled={!canSort}
            onClick={() => {
              api.sortByPriority()
              setMenu(false)
            }}
          >
            {t('tasks.sortPriority')}
          </button>
          {[
            { label: t('m.exportWord'), run: () => exportWord(tasks, t, lang) },
            { label: t('m.exportHtml'), run: () => exportHtml(tasks, t, lang) },
            { label: t('m.exportJson'), run: () => exportJson(tasks) },
          ].map((x) => (
            <button
              key={x.label}
              disabled={tasks.length === 0}
              onClick={() => {
                x.run()
                setMenu(false)
              }}
            >
              {x.label}
            </button>
          ))}
          <button onClick={() => file.current?.click()}>{t('tasks.import')}</button>
          <input
            ref={file}
            type="file"
            accept={IMPORT_ACCEPT}
            hidden
            aria-label={t('tasks.importLabel')}
            onChange={(e) => {
              setMenu(false)
              importFile(e.target.files?.[0])
            }}
          />
        </div>
      </Sheet>
    </div>
  )
}
