import { useCallback, useEffect, useState } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export type Provider = 'google' | 'github'

export type Session = {
  user: { email?: string } | null
  available: boolean
  signInWithEmail(email: string): Promise<void>
  signInWithProvider(p: Provider): Promise<void>
  signOut(): Promise<void>
}

export function useSession(client: SupabaseClient | null): Session & { user: User | null } {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!client) return
    client.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data } = client.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [client])

  const signInWithEmail = useCallback(
    async (email: string) => {
      if (!client) return
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin } })
      if (error) throw error
    },
    [client],
  )

  const signInWithProvider = useCallback(
    async (provider: Provider) => {
      if (!client) return
      const { error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin } })
      if (error) throw error
    },
    [client],
  )

  const signOut = useCallback(async () => {
    await client?.auth.signOut()
  }, [client])

  return { user, available: client !== null, signInWithEmail, signInWithProvider, signOut }
}
