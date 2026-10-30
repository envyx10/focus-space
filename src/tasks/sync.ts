import { mergeTasks } from './merge'
import type { TaskRepo } from './types'

/**
 * Folds the browser-only tasks into the account. Each local task is removed only after the
 * account holds it, and the loop picks up tasks added while a pass was uploading.
 */
export async function moveLocalIntoRemote(local: TaskRepo, remote: TaskRepo): Promise<void> {
  for (let pass = 0; pass < 5; pass++) {
    const pending = await local.list()
    if (!pending.length) return
    const current = await remote.list()
    const before = new Map(current.map((t) => [t.id, t]))
    const merged = mergeTasks(pending, current)
    for (const t of merged) if (before.get(t.id) !== t) await remote.save(t)
    for (const t of pending) await local.remove(t.id)
  }
}
