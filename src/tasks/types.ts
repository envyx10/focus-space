export type Task = {
  id: string
  text: string
  done: boolean
  active: boolean
  createdAt: string
  /** Longer notes for the task; written in the full-screen view. */
  description?: string
  /** Where the user dragged it in the list. Unset until it is moved: then createdAt decides. */
  position?: number
}

export interface TaskRepo {
  list(): Promise<Task[]>
  save(t: Task): Promise<void>
  remove(id: string): Promise<void>
  /** Calls back when the tasks change somewhere else (another tab); returns the unsubscribe. */
  subscribe?(onChange: () => void): () => void
}
