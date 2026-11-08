import { useRef, useState } from 'react'
import { useT } from '@/i18n'
import { useDismiss } from '@/shared/hooks/useDismiss'
import Icon from '@/shared/ui/Icon'
import { useAccountActions } from './useAccountActions'
import type { Session } from './useSession'
import './account.css'

export default function AccountMenu({ session }: { session: Session }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const account = useAccountActions(session)
  useDismiss(root, open, () => setOpen(false))

  return (
    <div className="acct" ref={root}>
      <button className="acct-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {session.user ? t('account.user') : t('account.guest')}
        <Icon name={session.user ? 'user' : 'out'} />
      </button>
      {open && (
        <div className="acct-panel" role="dialog" aria-label={t('account.title')}>
          <div className="num">03</div>
          <div className="lbl">{t('account.title')}</div>

          {!session.available ? (
            <p className="acct-row">{t('account.localMode')}</p>
          ) : session.user ? (
            <>
              <p className="acct-row">{session.user.email}</p>
              <p className="acct-row acct-dim">{t('account.syncing')}</p>
              <button className="acct-row acct-act" onClick={account.signOut}>
                {t('account.signOut')}
              </button>
            </>
          ) : (
            <>
              <form
                className="acct-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  account.signInWithEmail(email)
                }}
              >
                <input type="email" placeholder={t('account.emailPlaceholder')} aria-label={t('account.emailLabel')} value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit">{t('account.sendLink')}</button>
              </form>
              <button className="acct-row acct-act" onClick={() => account.signInWithProvider('google')}>
                {t('account.google')}
              </button>
              <button className="acct-row acct-act" onClick={() => account.signInWithProvider('github')}>
                {t('account.github')}
              </button>
            </>
          )}
          {account.message && <p className="acct-row acct-msg">{account.message}</p>}
        </div>
      )}
    </div>
  )
}
