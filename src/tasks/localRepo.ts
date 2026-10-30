import { isRecord, readJSON, writeJSON } from '../lib/storage'
import type { Task, TaskRepo } from './types'

export const TASKS_KEY = 'focus-space:tasks:v1'

export function isTask(v: unknown): v is Task {
  return (
    isRecord(v) &&
    typeof v.id === 'string' &&
    typeof v.text === 'string' &&
    typeof v.done === 'boolean' &&
    typeof v.active === 'boolean' &&
    typeof v.createdAt === 'string'
  )
}

function read(): Task[] {
  const raw = readJSON(TASKS_KEY)
  return Array.isArray(raw) ? raw.filter(isTask) : []
}

export const localRepo: TaskRepo = {
  async list() {
    return read()
  },
  async save(t) {
    const all = read()
    const i = all.findIndex((x) => x.id === t.id)
    if (i === -1) all.push(t)
    else all[i] = t
    writeJSON(TASKS_KEY, all)
  },
  async remove(id) {
    writeJSON(
      TASKS_KEY,
      read().filter((x) => x.id !== id),
    )
  },
}

export function clearLocalTasks(): void {
  writeJSON(TASKS_KEY, [])
}
