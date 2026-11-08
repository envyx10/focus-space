import type { Priority, Task } from './types'

/** Where a task sits: the place it was dragged to, or else when it was created (so new tasks land at the end). */
export const rank = (t: Task): number => t.position ?? Date.parse(t.createdAt)

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || rank(a) - rank(b) || a.createdAt.localeCompare(b.createdAt))
}

/** Gap left between neighbours when a task goes to either end of the list, or when the list is renumbered. */
const STEP = 1024

/**
 * The tasks to save so that pending task `id` ends up at index `to` among the pending ones. Normally only the moved
 * task changes (it takes a position between its new neighbours); when there is no room left between them, every
 * pending task is renumbered.
 */
export function reorder(tasks: Task[], id: string, to: number): Task[] {
  const pending = sortTasks(tasks).filter((t) => !t.done)
  const from = pending.findIndex((t) => t.id === id)
  if (from === -1) return []
  const rest = pending.filter((t) => t.id !== id)
  const at = Math.max(0, Math.min(to, rest.length))
  if (at === from) return []
  const before = rest[at - 1]
  const after = rest[at]
  const position = !before ? rank(after) - STEP : !after ? rank(before) + STEP : (rank(before) + rank(after)) / 2
  if ((!before || position > rank(before)) && (!after || position < rank(after))) return [{ ...pending[from], position }]
  rest.splice(at, 0, pending[from])
  return rest.map((t, i) => ({ ...t, position: (i + 1) * STEP }))
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
const priorityRank = (t: Task) => (t.priority ? PRIORITY_RANK[t.priority] : 3)

/**
 * The tasks to save so the pending ones read high, medium, low, then none; within each, the current order stays.
 * A one-off sort: dragging afterwards still works, and new tasks still land at the end.
 */
export function byPriority(tasks: Task[]): Task[] {
  const pending = sortTasks(tasks).filter((t) => !t.done)
  const sorted = [...pending].sort((a, b) => priorityRank(a) - priorityRank(b))
  if (sorted.every((t, i) => t === pending[i])) return []
  return sorted.flatMap((t, i) => (t.position === (i + 1) * STEP ? [] : [{ ...t, position: (i + 1) * STEP }]))
}
