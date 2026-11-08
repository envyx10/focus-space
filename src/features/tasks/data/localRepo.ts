import { PRIORITIES, type Priority, type Task, type TaskRepo } from '@/features/tasks/types'
import { isRecord } from '@/shared/lib/storage'

export const TASKS_KEY = 'focus-space:tasks:v1'
/** Copies of a stored list this version could not read, kept before anything is written over it. */
export const RESCUE_PREFIX = 'focus-space:tasks:rescue:'

/** The browser refused to store the tasks (private mode, storage full or blocked). They are still in memory. */
export class LocalSaveError extends Error {
  constructor(cause: unknown) {
    super('localStorage write failed', { cause })
    this.name = 'LocalSaveError'
  }
}

export function isTask(v: unknown): v is Task {
  return (
    isRecord(v) &&
    typeof v.id === 'string' &&
    typeof v.text === 'string' &&
    typeof v.done === 'boolean' &&
    typeof v.active === 'boolean' &&
    typeof v.createdAt === 'string' &&
    (v.description === undefined || typeof v.description === 'string') &&
    (v.position === undefined || (typeof v.position === 'number' && Number.isFinite(v.position))) &&
    (v.priority === undefined || v.priority === null || PRIORITIES.includes(v.priority as Priority))
  )
}

function getRaw(): string | null {
  try {
    return localStorage.getItem(TASKS_KEY)
  } catch {
    return null
  }
}

/** Keeps a copy of unreadable data under its own key (once per distinct content), so no later write can destroy it. */
function rescue(raw: string): void {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(RESCUE_PREFIX) && localStorage.getItem(k) === raw) return
    }
    localStorage.setItem(RESCUE_PREFIX + Date.now(), raw)
  } catch {
    // nowhere to copy it: the write below will fail the same way and report it
  }
}

/**
 * The stored array exactly as it is, unknown entries included: writes only ever replace or drop the task they touch,
 * so an entry this version can't read (corrupt, or from a newer version) is carried along untouched.
 */
function readAll(): unknown[] {
  const raw = getRaw()
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // fall through
  }
  rescue(raw)
  return []
}

function writeAll(all: unknown[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(all))
  } catch (e) {
    throw new LocalSaveError(e)
  }
}

let persistAsked = false
/** Asks the browser not to evict this site's storage when space runs low. Once per load, on the first save. */
function askPersist(): void {
  if (persistAsked) return
  persistAsked = true
  navigator.storage
    ?.persisted?.()
    .then((yes) => yes || navigator.storage.persist?.())
    .catch(() => {})
}

export const localRepo: TaskRepo = {
  async list() {
    return readAll().filter(isTask)
  },
  async save(t) {
    const all = readAll()
    const i = all.findIndex((x) => isRecord(x) && x.id === t.id)
    // Fields a newer version added survive an edit made here.
    if (i === -1) all.push(t)
    else all[i] = { ...(all[i] as object), ...t }
    writeAll(all)
    askPersist()
  },
  async remove(id) {
    writeAll(readAll().filter((x) => !(isRecord(x) && x.id === id)))
  },
  // Another tab of the app changed the tasks.
  subscribe(onChange) {
    const onStorage = (e: StorageEvent) => (e.key === TASKS_KEY || e.key === null) && onChange()
    addEventListener('storage', onStorage)
    return () => removeEventListener('storage', onStorage)
  },
}
