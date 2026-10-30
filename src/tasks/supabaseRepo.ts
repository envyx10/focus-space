import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task, TaskRepo } from './types'

type Row = { id: string; text: string; done: boolean; active: boolean; created_at: string }

const toTask = (r: Row): Task => ({ id: r.id, text: r.text, done: r.done, active: r.active, createdAt: r.created_at })

export function supabaseRepo(client: SupabaseClient, userId: string): TaskRepo {
  const table = () => client.from('tasks')
  return {
    async list() {
      const { data, error } = await table().select('id,text,done,active,created_at').order('created_at')
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
      })
      if (error) throw error
    },
    async remove(id) {
      const { error } = await table().delete().eq('id', id)
      if (error) throw error
    },
  }
}
