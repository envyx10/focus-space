import { isRecord } from '../lib/storage'
import type { Task } from './types'

const MAX_TEXT = 500
const MAX_TASKS = 500

export function serializeTasks(tasks: Task[]): string {
  return JSON.stringify({ app: 'focus-space', tasks: tasks.map(({ text, done, createdAt }) => ({ text, done, createdAt })) }, null, 2)
}

function make(text: string, done: boolean, createdAt?: string): Task | null {
  const clean = text.trim().slice(0, MAX_TEXT)
  if (!clean) return null
  const when = createdAt && !Number.isNaN(Date.parse(createdAt)) ? createdAt : new Date().toISOString()
  return { id: crypto.randomUUID(), text: clean, done, active: false, createdAt: when }
}

/** Reads a file this app exported, or a plain list with one task per line. Imported tasks always get new ids. */
export function parseImport(raw: string): Task[] {
  const out: Task[] = []
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    json = undefined
  }
  const list = Array.isArray(json) ? json : isRecord(json) && Array.isArray(json.tasks) ? json.tasks : null
  if (list) {
    for (const x of list) {
      const t = typeof x === 'string' ? make(x, false) : isRecord(x) && typeof x.text === 'string' ? make(x.text, x.done === true, typeof x.createdAt === 'string' ? x.createdAt : undefined) : null
      if (t) out.push(t)
    }
  } else if (json === undefined) {
    for (const line of raw.split(/\r?\n/)) {
      const m = /^\s*(?:[-*]\s*)?(?:\[( |x|X)\]\s*)?(.*)$/.exec(line)
      const t = m && make(m[2], m[1]?.toLowerCase() === 'x')
      if (t) out.push(t)
    }
  }
  return out.slice(0, MAX_TASKS)
}
