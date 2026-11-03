import { useCallback, useEffect, useRef, useState } from 'react'
import type { Task, TaskRepo } from './types'

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt.localeCompare(b.createdAt))
}

export function useTasks(repo: TaskRepo) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
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

  // Optimistic: the UI updates first; if persisting fails, roll back to what the repo really holds.
  const persist = useCallback(
    async (work: () => Promise<unknown>) => {
      try {
        await work()
        setError(false)
      } catch {
        setError(true)
        await reload().catch(() => {})
      }
    },
    [reload],
  )

  const commit = useCallback(
    async (next: Task[]) => {
      const prev = new Map(tasksRef.current.map((t) => [t.id, t]))
      show(next)
      await persist(() => Promise.all(next.filter((t) => prev.get(t.id) !== t).map((t) => repo.save(t))))
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

  const remove = useCallback(
    async (id: string) => {
      show(tasksRef.current.filter((t) => t.id !== id))
      await persist(() => repo.remove(id))
    },
    [repo, persist],
  )

  // Puts a deleted task back exactly as it was (undo).
  const restore = useCallback(
    async (task: Task) => {
      if (tasksRef.current.some((t) => t.id === task.id)) return
      await commit([...tasksRef.current, task])
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

  return { tasks, loaded, error, reload, add, toggle, edit, remove, setActive, restore, clearDone, addMany }
}
