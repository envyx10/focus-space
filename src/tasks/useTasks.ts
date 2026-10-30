import { useCallback, useEffect, useRef, useState } from 'react'
import type { Task, TaskRepo } from './types'

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt.localeCompare(b.createdAt))
}

export function useTasks(repo: TaskRepo) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  const reload = useCallback(async () => {
    const list = await repo.list()
    tasksRef.current = sortTasks(list)
    setTasks(tasksRef.current)
    setLoaded(true)
  }, [repo])

  useEffect(() => {
    setLoaded(false)
    reload().catch(() => setLoaded(true))
  }, [reload])

  // Optimistic: update the UI first, then persist only the tasks that changed.
  const commit = useCallback(
    async (next: Task[]) => {
      const prev = new Map(tasksRef.current.map((t) => [t.id, t]))
      tasksRef.current = sortTasks(next)
      setTasks(tasksRef.current)
      await Promise.all(next.filter((t) => prev.get(t.id) !== t).map((t) => repo.save(t)))
    },
    [repo],
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
      tasksRef.current = tasksRef.current.filter((t) => t.id !== id)
      setTasks(tasksRef.current)
      await repo.remove(id)
    },
    [repo],
  )

  return { tasks, loaded, reload, add, toggle, edit, remove, setActive }
}
