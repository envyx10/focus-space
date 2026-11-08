import { useEffect, useState } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { localRepo } from '@/features/tasks/data/localRepo'
import { supabaseRepo } from '@/features/tasks/data/supabaseRepo'
import { moveLocalIntoRemote } from '@/features/tasks/data/sync'
import type { TaskRepo } from '@/features/tasks/types'

/** Local repo while signed out; on sign-in, folds browser tasks into the account and switches to Supabase. */
export function useTaskRepo(client: SupabaseClient | null, user: User | null): { repo: TaskRepo; synced: boolean } {
  // The account's repo once the browser's tasks are safely in it, for the user it was made for.
  const [remote, setRemote] = useState<{ userId: string; repo: TaskRepo } | null>(null)
  const userId = user?.id ?? null

  useEffect(() => {
    if (!client || !userId) return
    let cancelled = false
    const repo = supabaseRepo(client, userId)
    moveLocalIntoRemote(localRepo, repo).then(
      () => !cancelled && setRemote({ userId, repo }),
      // Network or RLS failure: stay on local tasks rather than lose them.
      () => !cancelled && setRemote(null),
    )
    return () => {
      cancelled = true
      // Signed out (or another user): the next sign-in folds the browser's tasks in again before syncing.
      setRemote(null)
    }
  }, [client, userId])

  return client && userId && remote?.userId === userId ? { repo: remote.repo, synced: true } : { repo: localRepo, synced: false }
}
