import { useEffect, useState } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { clearLocalTasks, localRepo } from './localRepo'
import { mergeTasks } from './merge'
import { supabaseRepo } from './supabaseRepo'
import type { TaskRepo } from './types'

/** Local repo while signed out; on sign-in, folds browser tasks into the account and switches to Supabase. */
export function useTaskRepo(client: SupabaseClient | null, user: User | null): { repo: TaskRepo; synced: boolean } {
  const [state, setState] = useState<{ repo: TaskRepo; synced: boolean }>({ repo: localRepo, synced: false })
  const userId = user?.id ?? null

  useEffect(() => {
    if (!client || !userId) {
      setState({ repo: localRepo, synced: false })
      return
    }
    let cancelled = false
    const remote = supabaseRepo(client, userId)
    ;(async () => {
      const [local, current] = await Promise.all([localRepo.list(), remote.list()])
      if (local.length) {
        const before = new Map(current.map((t) => [t.id, t]))
        const merged = mergeTasks(local, current)
        await Promise.all(merged.filter((t) => before.get(t.id) !== t).map((t) => remote.save(t)))
        // Only clear the browser copy once the account holds it.
        clearLocalTasks()
      }
      if (!cancelled) setState({ repo: remote, synced: true })
    })().catch(() => {
      // Network or RLS failure: stay on local tasks rather than lose them.
      if (!cancelled) setState({ repo: localRepo, synced: false })
    })
    return () => {
      cancelled = true
    }
  }, [client, userId])

  return state
}
