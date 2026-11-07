import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import type { Task } from './types'
import './tasksFocus.css'

// The Markdown renderer only loads once a formatted description is shown.
const Markdown = lazy(() => import('./Markdown'))

const MAX_TEXT = 500
export const MAX_DESC = 20000
const SAVE_MS = 600

type Actions = {
  add: (text: string) => Promise<void>
  toggle: (id: string) => Promise<void>
  edit: (id: string, text: string) => Promise<void>
  describe: (id: string, description: string) => Promise<void>
  setActive: (id: string | null) => Promise<void>
}

const num = (i: number) => String(i + 1).padStart(2, '0')

/** One task as a page: its title and a long free-form description. Remounted (key) per task, so drafts never leak between them. */
export function Detail({ task, index, ...a }: { task: Task; index: number } & Omit<Actions, 'add'>) {
  const t = useT()
  const [title, setTitle] = useState(task.text)
  const [desc, setDesc] = useState(task.description ?? '')
  // What the store last got: "saving" is derived from it, never set inside an effect (an effect that sets state on
  // every keystroke chains synchronous renders while typing fast, and React drops keystrokes past its update limit).
  const [savedText, setSavedText] = useState(task.description ?? '')
  // A task with notes opens formatted; Edit shows the raw text. An empty one is always the editor.
  const [editing, setEditing] = useState(!task.description?.trim())
  const area = useRef<HTMLTextAreaElement>(null)
  const picker = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<'' | 'type' | 'size'>('')
  const saved = useRef(task.description ?? '')
  const latest = useRef(desc)
  latest.current = desc
  const describe = useRef(a.describe)
  describe.current = a.describe

  const flush = () => {
    if (latest.current === saved.current) return
    saved.current = latest.current
    setSavedText(latest.current)
    describe.current(task.id, latest.current)
  }
  const saving = desc !== savedText

  // Autosave shortly after typing stops, and once more when leaving the task or the view.
  useEffect(() => {
    if (desc === saved.current) return
    const id = setTimeout(flush, SAVE_MS)
    return () => clearTimeout(id)
  }, [desc])
  useEffect(() => flush, [])
  // Closing the tab, reloading or switching away saves at once: the timer above would never get to run.
  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && flush()
    addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  const commitTitle = () => {
    if (title.trim() && title !== task.text) a.edit(task.id, title)
    else setTitle(task.text)
  }

  const showEditor = editing || !desc.trim()
  const startEditing = () => {
    flushSync(() => setEditing(true))
    area.current?.focus()
  }

  // A .md file (picked or dropped) is added after what is already written, never over it.
  const importFile = async (file: File) => {
    if (!/\.(md|markdown|txt)$/i.test(file.name)) return setImportError('type')
    const text = (await file.text()).replace(/\r\n?/g, '\n')
    const next = latest.current.trim() ? `${latest.current.trimEnd()}\n\n${text}` : text
    if (next.length > MAX_DESC) return setImportError('size')
    setImportError('')
    setDesc(next)
    setEditing(false)
  }

  const status = task.done ? t('tasks.focus.statusDone') : task.active ? t('tasks.focus.statusNow') : t('tasks.focus.statusPending')

  return (
    <article
      className={`tf-detail${task.done ? ' dn' : ''}`}
      onDragOver={(e) => e.dataTransfer.types.includes('Files') && e.preventDefault()}
      onDrop={(e) => {
        const file = e.dataTransfer.files[0]
        if (!file) return
        e.preventDefault()
        importFile(file)
      }}
    >
      <div className="tf-meta">
        <span className="num">{num(index)}</span>
        <span className={`lbl${task.active && !task.done ? ' acc' : ''}`}>{status}</span>
        <span className="tf-tools">
          <button className="tf-mode" onClick={() => picker.current?.click()}>
            {t('tasks.focus.import')}
          </button>
          <input
            ref={picker}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) importFile(file)
            }}
          />
          {desc.trim() && (
            <button className="tf-mode" onClick={showEditor ? () => setEditing(false) : startEditing}>
              {showEditor ? t('tasks.focus.view') : t('tasks.edit')}
            </button>
          )}
        </span>
      </div>
      <textarea
        className="tf-title"
        rows={1}
        aria-label={t('tasks.focus.titleLabel')}
        maxLength={MAX_TEXT}
        value={title}
        onChange={(e) => setTitle(e.target.value.replace(/\n/g, ' '))}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
      />
      {showEditor ? (
        <textarea
          ref={area}
          className="tf-desc"
          aria-label={t('tasks.focus.descLabel')}
          placeholder={t('tasks.focus.descPlaceholder')}
          maxLength={MAX_DESC}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={flush}
        />
      ) : (
        <div className="tf-desc tf-rendered" onDoubleClick={startEditing}>
          <Suspense fallback={<p>{desc}</p>}>
            <Markdown text={desc} />
          </Suspense>
        </div>
      )}
      <footer className="tf-foot">
        <span className="lbl" role="status">
          {importError
            ? t(importError === 'type' ? 'tasks.focus.importType' : 'tasks.focus.importSize', { n: MAX_DESC })
            : saving
              ? t('tasks.focus.saving')
              : desc
                ? t('tasks.focus.saved')
                : ''}
        </span>
        <span className="tf-actions">
          <button className="btn" onClick={() => a.toggle(task.id)}>
            {task.done ? t('tasks.markPending') : t('tasks.markDone')}
          </button>
          {!task.done && (
            <button className={`btn${task.active ? '' : ' primary'}`} onClick={() => a.setActive(task.active ? null : task.id)}>
              {!task.active && <Icon name="right" />}
              {task.active ? t('tasks.removeNow') : t('tasks.doNow')}
            </button>
          )}
        </span>
      </footer>
    </article>
  )
}

type Props = { tasks: Task[]; onClose: () => void } & Actions

/**
 * Full-screen tasks: same grid as the app (list in the first four columns, the selected task as a page in the other eight),
 * drawn over everything and in the browser's fullscreen, like focus mode.
 */
export default function TasksFocus({ tasks, onClose, add, ...actions }: Props) {
  const t = useT()
  const [selected, setSelected] = useState(() => tasks.find((k) => k.active)?.id ?? tasks.find((k) => !k.done)?.id ?? tasks[0]?.id)
  const [draft, setDraft] = useState('')
  const pickNewest = useRef(false)
  const root = useRef<HTMLDivElement>(null)
  const index = Math.max(0, tasks.findIndex((k) => k.id === selected))
  const current = tasks[index]
  const pending = tasks.filter((k) => !k.done).length
  const close = useRef(onClose)
  close.current = onClose

  // A task just added from here opens at once.
  useEffect(() => {
    if (!pickNewest.current) return
    pickNewest.current = false
    const newest = tasks.reduce<Task | undefined>((a, k) => (!a || k.createdAt > a.createdAt ? k : a), undefined)
    if (newest) setSelected(newest.id)
  }, [tasks])

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
      else if (reached) close.current()
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
        <button className="tf-close" onClick={onClose}>
          {t('immersive.exit')}
        </button>
      </header>

      <aside className="tf-side">
        <div className="num">01</div>
        <div className="lbl">{t('tasks.pending', { n: pending })}</div>
        <ul className="tf-list" aria-label={t('tasks.focus.listLabel')}>
          {tasks.map((k, i) => (
            <li key={k.id}>
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
                <span className="tf-n">{num(i)}</span>
                <span className="tf-item-text">{k.text}</span>
                {k.description?.trim() && <span className="tf-dot" title={t('tasks.focus.hasNotes')} aria-label={t('tasks.focus.hasNotes')} />}
              </button>
            </li>
          ))}
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
                  pickNewest.current = true
                  add(draft)
                  setDraft('')
                }
              }}
            />
          </li>
        </ul>
      </aside>

      <main className="tf-main">
        {current ? <Detail key={current.id} task={current} index={index} {...actions} /> : <p className="tf-empty">{t('tasks.focus.empty')}</p>}
      </main>
    </div>
  )

  // Into .app, not inside the tasks column: above every region, and still under the app's accent and text-size variables.
  return createPortal(view, document.querySelector('.app') ?? document.body)
}
