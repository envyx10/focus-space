import { MAX_DESC, MAX_TEXT } from '@/features/tasks/constants'
import { PRIORITIES, type Priority, type Task } from '@/features/tasks/types'
import { isRecord } from '@/shared/lib/storage'

const MAX_TASKS = 500

export function serializeTasks(tasks: Task[]): string {
  return JSON.stringify(
    {
      app: 'focus-space',
      tasks: tasks.map(({ text, done, createdAt, description, priority }) => ({ text, done, createdAt, ...(description ? { description } : {}), ...(priority ? { priority } : {}) })),
    },
    null,
    2,
  )
}

export const asPriority = (v: unknown): Priority | undefined => (PRIORITIES.includes(v as Priority) ? (v as Priority) : undefined)

/** A task from imported fields, or null when it has no text. Always a new id; long text is cut to what the app stores. */
export function makeTask(text: string, done: boolean, createdAt?: string, description?: string, priority?: Priority): Task | null {
  const clean = text.trim().slice(0, MAX_TEXT)
  if (!clean) return null
  // Always ISO: it sorts as text and Postgres accepts it, which a loose Date.parse string may not.
  const when = new Date(createdAt && !Number.isNaN(Date.parse(createdAt)) ? createdAt : Date.now()).toISOString()
  const task: Task = { id: crypto.randomUUID(), text: clean, done, active: false, createdAt: when }
  if (description?.trim()) task.description = description.slice(0, MAX_DESC)
  if (priority) task.priority = priority
  return task
}

/** At most the number of tasks one import may add. */
export const capImport = (tasks: Task[]) => tasks.slice(0, MAX_TASKS)

/** Reads a file this app exported, or a plain list with one task per line. Imported tasks always get new ids. */
export function parseImport(raw: string): Task[] {
  const out: Task[] = []
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    json = undefined
  }
  // A lone "42" or "true" is valid JSON but just a one-line list.
  if (!Array.isArray(json) && !isRecord(json)) json = undefined
  const list = Array.isArray(json) ? json : isRecord(json) && Array.isArray(json.tasks) ? json.tasks : null
  if (list) {
    for (const x of list) {
      const t =
        typeof x === 'string'
          ? makeTask(x, false)
          : isRecord(x) && typeof x.text === 'string'
            ? makeTask(x.text, x.done === true, typeof x.createdAt === 'string' ? x.createdAt : undefined, typeof x.description === 'string' ? x.description : undefined, asPriority(x.priority))
            : null
      if (t) out.push(t)
    }
  } else if (json === undefined) {
    for (const line of raw.split(/\r?\n/)) {
      const m = /^\s*(?:[-*]\s*)?(?:\[( |x|X)\]\s*)?(.*)$/.exec(line)
      const t = m && makeTask(m[2], m[1]?.toLowerCase() === 'x')
      if (t) out.push(t)
    }
  }
  return capImport(out)
}
