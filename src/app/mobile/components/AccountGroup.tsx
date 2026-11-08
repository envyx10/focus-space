import { useState } from 'react'
import { useAccountActions } from '@/features/auth/useAccountActions'
import type { Session } from '@/features/auth/useSession'
import { useT } from '@/i18n'
import Icon from '@/shared/ui/Icon'
import { Group } from './SettingsControls'

/** The account as the first settings group: local mode, signed in (and syncing), or the ways to sign in. */
export default function AccountGroup({ session }: { session: Session }) {
  const t = useT()
  const [email, setEmail] = useState('')
  const account = useAccountActions(session)

  return (
    <Group title={t('account.title')}>
      {!session.available ? (
        <p className="m-rowset m-note">{t('account.localMode')}</p>
      ) : session.user ? (
        <>
          <div className="m-rowset">
            <span className="m-rowset-label">
              {session.user.email}
              <small>{t('account.syncing')}</small>
            </span>
            <Icon name="user" />
          </div>
          <button className="m-rowset m-link" onClick={account.signOut}>
            {t('account.signOut')}
          </button>
        </>
      ) : (
        <>
          <p className="m-rowset m-note">{t('m.accountPitch')}</p>
          <form
            className="m-rowset m-inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              account.signInWithEmail(email)
            }}
          >
            <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" enterKeyHint="send" placeholder={t('account.emailPlaceholder')} aria-label={t('account.emailLabel')} value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit">{t('account.sendLink')}</button>
          </form>
          <button className="m-rowset m-link" onClick={() => account.signInWithProvider('google')}>
            {t('account.google')}
            <Icon name="out" />
          </button>
          <button className="m-rowset m-link" onClick={() => account.signInWithProvider('github')}>
            {t('account.github')}
            <Icon name="out" />
          </button>
        </>
      )}
      {account.message && (
        <p className="m-rowset m-note is-accent" role="status">
          {account.message}
        </p>
      )}
    </Group>
  )
}
