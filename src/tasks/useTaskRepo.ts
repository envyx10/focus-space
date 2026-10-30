import { useEffect, useState } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { localRepo } from './localRepo'
import { supabaseRepo } from './supabaseRepo'
import { moveLocalIntoRemote } from './sync'
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
    moveLocalIntoRemote(localRepo, remote).then(() => {
      if (!cancelled) setState({ repo: remote, synced: true })
    }, () => {
      // Network or RLS failure: stay on local tasks rather than lose them.
      if (!cancelled) setState({ repo: localRepo, synced: false })
    })
    return () => {
      cancelled = true
    }
  }, [client, userId])

  return state
}
