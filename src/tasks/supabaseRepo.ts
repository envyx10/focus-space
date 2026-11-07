import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task, TaskRepo } from './types'

type Row = { id: string; text: string; done: boolean; active: boolean; created_at: string; description?: string | null; position?: number | null }

const toTask = (r: Row): Task => ({ id: r.id, text: r.text, done: r.done, active: r.active, createdAt: r.created_at, ...(r.description ? { description: r.description } : {}), ...(typeof r.position === 'number' ? { position: r.position } : {}) })

export function supabaseRepo(client: SupabaseClient, userId: string): TaskRepo {
  const table = () => client.from('tasks')
  return {
    async list() {
      const { data, error } = await table().select('*').eq('user_id', userId).order('created_at')
      if (error) throw error
      return (data as Row[]).map(toTask)
    },
    async save(t) {
      const { error } = await table().upsert({
        id: t.id,
        user_id: userId,
        text: t.text,
        done: t.done,
        active: t.active,
        created_at: t.createdAt,
        // Only sent once a task has had a description, so accounts that haven't run the description migration keep syncing.
        ...(t.description !== undefined ? { description: t.description } : {}),
        // Same for the order: only sent once a task has been dragged, so accounts without the position column keep working.
        ...(t.position !== undefined ? { position: t.position } : {}),
      })
      if (error) throw error
    },
    async remove(id) {
      const { error } = await table().delete().eq('id', id).eq('user_id', userId)
      if (error) throw error
    },
  }
}
