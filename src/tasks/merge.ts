import type { Task } from './types'

const norm = (s: string) => s.trim().toLowerCase()

/** Folds the browser-only tasks into the account's tasks on first sign-in. Remote always wins conflicts. */
export function mergeTasks(local: Task[], remote: Task[]): Task[] {
  const remoteIds = new Set(remote.map((t) => t.id))
  const remoteTexts = new Set(remote.map((t) => norm(t.text)))
  const extra = local.filter((t) => !remoteIds.has(t.id) && !remoteTexts.has(norm(t.text)))
  const merged = [...remote, ...extra]
  const activeId = merged.find((t) => t.active)?.id
  return merged.map((t) => (t.active && t.id !== activeId ? { ...t, active: false } : t))
}
