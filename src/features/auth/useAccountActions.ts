import { useState } from 'react'
import { useT } from '@/i18n'
import type { Provider, Session } from './useSession'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Sign-in and sign-out with one status line: the link was sent, the address is wrong, or the account is unreachable. */
export function useAccountActions(session: Session) {
  const t = useT()
  const [message, setMessage] = useState<string | null>(null)

  const run = async (action: () => Promise<void>, done: string | null) => {
    try {
      await action()
      setMessage(done)
    } catch {
      setMessage(t('account.offline'))
    }
  }

  return {
    message,
    signInWithEmail(email: string) {
      const clean = email.trim()
      if (!EMAIL_RE.test(clean)) return setMessage(t('account.invalidEmail'))
      run(() => session.signInWithEmail(clean), t('account.linkSent'))
    },
    signInWithProvider: (provider: Provider) => run(() => session.signInWithProvider(provider), null),
    signOut: () => run(session.signOut, null),
  }
}
