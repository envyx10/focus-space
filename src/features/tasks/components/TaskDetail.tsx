import { lazy, Suspense, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { MAX_DESC, MAX_TEXT } from '@/features/tasks/constants'
import { useAutosave } from '@/features/tasks/hooks/useAutosave'
import type { Priority, Task } from '@/features/tasks/types'
import { useT } from '@/i18n'
import { pad2 } from '@/shared/lib/format'
import Icon from '@/shared/ui/Icon'
import PriorityPicker from './PriorityPicker'

// The Markdown renderer only loads once a formatted description is shown.
const Markdown = lazy(() => import('./Markdown'))

const SAVE_MS = 600
const NOTES_FILE = /\.(md|markdown|txt)$/i

export type TaskActions = {
  toggle: (id: string) => Promise<void>
  edit: (id: string, text: string) => Promise<void>
  describe: (id: string, description: string) => Promise<void>
  setActive: (id: string | null) => Promise<void>
  prioritize?: (id: string, priority: Priority | null) => Promise<void>
}

type Props = { task: Task; index: number } & TaskActions

/** One task as a page: its title and a long free-form description. Remounted (key) per task, so drafts never leak between them. */
export default function TaskDetail({ task, index, toggle, edit, describe, setActive, prioritize }: Props) {
  const t = useT()
  const [title, setTitle] = useState(task.text)
  const [desc, setDesc] = useState(task.description ?? '')
  // A task with notes opens formatted; Edit shows the raw text. An empty one is always the editor.
  const [editing, setEditing] = useState(!task.description?.trim())
  const [importError, setImportError] = useState<'' | 'type' | 'size'>('')
  const area = useRef<HTMLTextAreaElement>(null)
  const picker = useRef<HTMLInputElement>(null)
  const { flush, saving } = useAutosave(desc, (text) => describe(task.id, text), SAVE_MS)

  const commitTitle = () => {
    if (title.trim() && title !== task.text) edit(task.id, title)
    else setTitle(task.text)
  }

  const showEditor = editing || !desc.trim()
  const startEditing = () => {
    flushSync(() => setEditing(true))
    area.current?.focus()
  }

  // A .md file (picked or dropped) is added after what is already written, never over it.
  const importFile = async (file: File) => {
    if (!NOTES_FILE.test(file.name)) return setImportError('type')
    const text = (await file.text()).replace(/\r\n?/g, '\n')
    const next = desc.trim() ? `${desc.trimEnd()}\n\n${text}` : text
    if (next.length > MAX_DESC) return setImportError('size')
    setImportError('')
    setDesc(next)
    setEditing(false)
  }

  const status = task.done ? t('tasks.focus.statusDone') : task.active ? t('tasks.focus.statusNow') : t('tasks.focus.statusPending')
  const footNote = importError
    ? t(importError === 'type' ? 'tasks.focus.importType' : 'tasks.focus.importSize', { n: MAX_DESC })
    : saving
      ? t('tasks.focus.saving')
      : desc
        ? t('tasks.focus.saved')
        : ''

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
        <span className="num">{pad2(index + 1)}</span>
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
      {prioritize && <PriorityPicker value={task.priority ?? null} onChange={(p) => prioritize(task.id, p)} />}
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
          {footNote}
        </span>
        <span className="tf-actions">
          <button className="btn" onClick={() => toggle(task.id)}>
            {task.done ? t('tasks.markPending') : t('tasks.markDone')}
          </button>
          {!task.done && (
            <button className={`btn${task.active ? '' : ' primary'}`} onClick={() => setActive(task.active ? null : task.id)}>
              {!task.active && <Icon name="right" />}
              {task.active ? t('tasks.removeNow') : t('tasks.doNow')}
            </button>
          )}
        </span>
      </footer>
    </article>
  )
}
