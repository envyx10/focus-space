import type { Task } from './types'

const norm = (s: string) => s.trim().toLowerCase()

/**
 * Folds the browser-only tasks into the account's tasks on first sign-in. Remote always wins conflicts, but a local
 * task dropped as a duplicate (same text) hands its notes to the account's copy when that one has none, so they
 * aren't lost when the local copy is deleted.
 */
export function mergeTasks(local: Task[], remote: Task[]): Task[] {
  const remoteIds = new Set(remote.map((t) => t.id))
  const remoteTexts = new Set(remote.map((t) => norm(t.text)))
  const fresh = local.filter((t) => !remoteIds.has(t.id))
  const extra = fresh.filter((t) => !remoteTexts.has(norm(t.text)))
  const withNotes = remote.map((r) => {
    const twin = r.description ? undefined : fresh.find((l) => l.description && norm(l.text) === norm(r.text))
    return twin ? { ...r, description: twin.description } : r
  })
  const merged = [...withNotes, ...extra]
  const activeId = merged.find((t) => t.active)?.id
  return merged.map((t) => (t.active && t.id !== activeId ? { ...t, active: false } : t))
}
