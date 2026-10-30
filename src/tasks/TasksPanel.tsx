import { useState } from 'react'
import type { Task } from './types'
import './tasks.css'

type Props = {
  tasks: Task[]
  synced: boolean
  add: (text: string) => Promise<void>
  toggle: (id: string) => Promise<void>
  edit: (id: string, text: string) => Promise<void>
  remove: (id: string) => Promise<void>
  setActive: (id: string | null) => Promise<void>
}

function Row({ task, index, ...a }: { task: Task; index: number } & Omit<Props, 'tasks' | 'synced' | 'add'>) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.text)

  return (
    <li className={`tk${task.done ? ' dn' : ''}${task.active ? ' on' : ''}`}>
      <button
        className="tk-box"
        role="checkbox"
        aria-checked={task.done}
        aria-label={`Completar ${task.text}`}
        onClick={() => a.toggle(task.id)}
      >
        {String(index + 1).padStart(2, '0')}
      </button>
      {editing ? (
        <input
          className="tk-edit"
          autoFocus
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
        <span
          className="tk-text"
          onDoubleClick={() => {
            setDraft(task.text)
            setEditing(true)
          }}
        >
          {task.text}
        </span>
      )}
      <span className="tk-act">
        {!task.done && (
          <button
            aria-label={task.active ? 'Quitar tarea activa' : 'Marcar como activa'}
            className="tk-arrow"
            onClick={() => a.setActive(task.active ? null : task.id)}
          >
            →
          </button>
        )}
        <button aria-label={`Borrar ${task.text}`} className="tk-del" onClick={() => a.remove(task.id)}>
          ×
        </button>
      </span>
    </li>
  )
}

export default function TasksPanel({ tasks, synced, add, ...actions }: Props) {
  const [draft, setDraft] = useState('')
  const pending = tasks.filter((t) => !t.done).length

  return (
    <div className="tasks">
      <div className="num">01</div>
      <div className="lbl">Pendientes / {pending}</div>
      <ul className="tk-list">
        {tasks.map((t, i) => (
          <Row key={t.id} task={t} index={i} {...actions} />
        ))}
        <li className="tk tk-new">
          <span className="tk-box">+</span>
          <input
            placeholder="+ Nueva tarea"
            aria-label="Nueva tarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) {
                add(draft)
                setDraft('')
              }
            }}
          />
        </li>
      </ul>
      {!synced && <p className="tasks-note">Guardado solo en este navegador · Inicia sesión para sincronizar</p>}
    </div>
  )
}
