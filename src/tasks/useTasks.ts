import { useCallback, useEffect, useRef, useState } from 'react'
import { LocalSaveError } from './localRepo'
import type { Task, TaskRepo } from './types'

const RETRY_MS = 10_000

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

export function useTasks(repo: TaskRepo) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  // The browser itself refused to store (not a network failure): what's on screen is the only copy until a retry works.
  const [localError, setLocalError] = useState(false)
  // Tasks changed in memory whose last write failed: written again with the next change or retry.
  const unsaved = useRef(new Set<string>())
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks
  // Bumped on every repo switch so a slow list() from the previous repo (e.g. the account
  // after signing out) can never overwrite the current one.
  const generation = useRef(0)

  const show = (next: Task[]) => {
    tasksRef.current = sortTasks(next)
    setTasks(tasksRef.current)
  }

  const reload = useCallback(async () => {
    const gen = generation.current
    const list = await repo.list()
    if (gen !== generation.current) return
    show(list)
    setLoaded(true)
  }, [repo])

  useEffect(() => {
    generation.current++
    setLoaded(false)
    reload().catch(() => setLoaded(true))
  }, [reload])

  // Optimistic: the UI updates first. If the account can't be reached, roll back to what it really holds;
  // if the browser can't store, never roll back (that would throw away the only copy): keep it and retry.
  const persist = useCallback(
    async (work: () => Promise<unknown>, ids: string[] = []) => {
      try {
        await work()
        ids.forEach((id) => unsaved.current.delete(id))
        if (!unsaved.current.size) {
          setError(false)
          setLocalError(false)
        }
      } catch (e) {
        setError(true)
        if (e instanceof LocalSaveError) {
          ids.forEach((id) => unsaved.current.add(id))
          setLocalError(true)
          return
        }
        await reload().catch(() => {})
      }
    },
    [reload],
  )

  const commit = useCallback(
    async (next: Task[]) => {
      const prev = new Map(tasksRef.current.map((t) => [t.id, t]))
      show(next)
      const changed = next.filter((t) => prev.get(t.id) !== t || unsaved.current.has(t.id))
      await persist(() => Promise.all(changed.map((t) => repo.save(t))), changed.map((t) => t.id))
    },
    [repo, persist],
  )

  const add = useCallback(
    async (text: string) => {
      const clean = text.trim()
      if (!clean) return
      const t: Task = { id: crypto.randomUUID(), text: clean, done: false, active: false, createdAt: new Date().toISOString() }
      await commit([...tasksRef.current, t])
    },
    [commit],
  )

  const toggle = useCallback(
    (id: string) =>
      commit(tasksRef.current.map((t) => (t.id === id ? { ...t, done: !t.done, active: t.done ? t.active : false } : t))),
    [commit],
  )

  const edit = useCallback(
    async (id: string, text: string) => {
      const clean = text.trim()
      if (!clean) return
      await commit(tasksRef.current.map((t) => (t.id === id ? { ...t, text: clean } : t)))
    },
    [commit],
  )

  // Another tab changed the tasks: show its version, unless this tab holds changes it couldn't store yet.
  useEffect(
    () =>
      repo.subscribe?.(() => {
        if (!unsaved.current.size) reload().catch(() => {})
      }),
    [repo, reload],
  )

  // While the browser refuses to store, keep trying: freeing space (or leaving private mode limits) saves everything.
  useEffect(() => {
    if (!localError) return
    const id = setInterval(() => commit(tasksRef.current), RETRY_MS)
    return () => clearInterval(id)
  }, [localError, commit])

  const describe = useCallback(
    (id: string, description: string) =>
      commit(tasksRef.current.map((t) => (t.id === id && (t.description ?? '') !== description ? { ...t, description } : t))),
    [commit],
  )

  const setActive = useCallback(
    (id: string | null) =>
      commit(
        tasksRef.current.map((t) => {
          const active = t.id === id && !t.done
          return t.active === active ? t : { ...t, active }
        }),
      ),
    [commit],
  )

  // Drag (or Alt+arrow) a pending task to another place among the pending ones.
  const move = useCallback(
    async (id: string, to: number) => {
      const changed = new Map(reorder(tasksRef.current, id, to).map((t) => [t.id, t]))
      if (changed.size) await commit(tasksRef.current.map((t) => changed.get(t.id) ?? t))
    },
    [commit],
  )

  const remove = useCallback(
    async (id: string) => {
      show(tasksRef.current.filter((t) => t.id !== id))
      await persist(() => repo.remove(id))
    },
    [repo, persist],
  )

  // Puts a deleted task back as it was (undo), except "active" if another task took that over meanwhile.
  const restore = useCallback(
    async (task: Task) => {
      if (tasksRef.current.some((t) => t.id === task.id)) return
      const back = task.active && tasksRef.current.some((t) => t.active) ? { ...task, active: false } : task
      await commit([...tasksRef.current, back])
    },
    [commit],
  )

  const clearDone = useCallback(async () => {
    const done = tasksRef.current.filter((t) => t.done)
    if (!done.length) return
    show(tasksRef.current.filter((t) => !t.done))
    await persist(() => Promise.all(done.map((t) => repo.remove(t.id))))
  }, [repo, persist])

  const addMany = useCallback(
    async (incoming: Task[]) => {
      const have = new Set(tasksRef.current.map((t) => t.id))
      const fresh = incoming.filter((t) => !have.has(t.id))
      if (fresh.length) await commit([...tasksRef.current, ...fresh])
    },
    [commit],
  )

  return { tasks, loaded, error, localError, reload, add, toggle, edit, describe, move, remove, setActive, restore, clearDone, addMany }
}
