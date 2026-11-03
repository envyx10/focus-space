import { useEffect, useRef, useState } from 'react'
import { parseImport, serializeTasks } from './transfer'
import type { Task } from './types'
import './tasks.css'

// Matches the CHECK on tasks.text in supabase/schema.sql.
const MAX_TEXT = 500
const UNDO_MS = 8000

type Props = {
  tasks: Task[]
  synced: boolean
  saveError?: boolean
  add: (text: string) => Promise<void>
  toggle: (id: string) => Promise<void>
  edit: (id: string, text: string) => Promise<void>
  remove: (id: string) => Promise<void>
  setActive: (id: string | null) => Promise<void>
  restore?: (task: Task) => Promise<void>
  clearDone?: () => Promise<void>
  addMany?: (tasks: Task[]) => Promise<void>
}

type RowProps = { task: Task; index: number; onDelete: (task: Task) => void } & Pick<Props, 'toggle' | 'edit' | 'setActive'>

function Row({ task, index, onDelete, ...a }: RowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.text)
  const startEdit = () => {
    setDraft(task.text)
    setEditing(true)
  }

  return (
    <li className={`tk${task.done ? ' dn' : ''}${task.active ? ' on' : ''}`}>
      <button
        className="tk-box"
        role="checkbox"
        aria-checked={task.done}
        aria-label={`Completar ${task.text}`}
        title={task.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
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
            aria-label={task.active ? 'Quitar tarea activa' : 'Marcar como activa'}
            title={task.active ? 'Quitar de «Ahora»' : 'Hacer ahora'}
            className="tk-arrow"
            onClick={() => a.setActive(task.active ? null : task.id)}
          >
            →
          </button>
        )}
        {!editing && (
          <button aria-label={`Editar ${task.text}`} title="Editar" className="tk-pen" onClick={startEdit}>
            ✎
          </button>
        )}
        <button aria-label={`Borrar ${task.text}`} title="Borrar" className="tk-del" onClick={() => onDelete(task)}>
          ×
        </button>
      </span>
    </li>
  )
}

export default function TasksPanel({ tasks, synced, saveError, add, restore, clearDone, addMany, ...actions }: Props) {
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
    setNote(found.length ? `${found.length} tareas importadas` : 'No se encontró ninguna tarea en el archivo')
    if (file.current) file.current.value = ''
  }

  return (
    <div className="tasks">
      <div className="num">01</div>
      <div className="lbl">Pendientes / {pending}</div>
      <ul className="tk-list">
        {tasks.map((t, i) => (
          <Row key={t.id} task={t} index={i} onDelete={del} toggle={actions.toggle} edit={actions.edit} setActive={actions.setActive} />
        ))}
        <li className="tk tk-new">
          <span className="tk-box">+</span>
          <input
            data-new-task
            placeholder="+ Nueva tarea"
            aria-label="Nueva tarea"
            maxLength={MAX_TEXT}
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
      {undo && restore && (
        <p className="tasks-undo" role="status">
          Tarea borrada
          <button
            onClick={() => {
              restore(undo)
              setUndo(null)
            }}
          >
            Deshacer
          </button>
        </p>
      )}
      {saveError && (
        <p className="tasks-note acc" role="alert">
          No se pudo guardar el último cambio · revisa tu conexión
        </p>
      )}
      {(clearDone || addMany) && (
        <div className="tasks-tools">
          {clearDone && done > 0 && <button onClick={() => clearDone()}>Limpiar hechas ({done})</button>}
          {tasks.length > 0 && <button onClick={exportTasks}>Exportar</button>}
          {addMany && <button onClick={() => file.current?.click()}>Importar</button>}
          <input ref={file} type="file" accept=".json,.txt,.md,text/plain,application/json" hidden aria-label="Importar tareas" onChange={(e) => importFile(e.target.files?.[0])} />
        </div>
      )}
      {note && (
        <p className="tasks-note" role="status">
          {note}
        </p>
      )}
      {!synced && <p className="tasks-note">Guardado solo en este navegador · Inicia sesión para sincronizar</p>}
    </div>
  )
}
