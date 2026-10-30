export type Task = { id: string; text: string; done: boolean; active: boolean; createdAt: string }

export interface TaskRepo {
  list(): Promise<Task[]>
  save(t: Task): Promise<void>
  remove(id: string): Promise<void>
}
