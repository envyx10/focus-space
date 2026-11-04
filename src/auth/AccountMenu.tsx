import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import Icon from '../lib/Icon'
import type { Session } from './useSession'
import './account.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AccountMenu({ session }: { session: Session }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) setOpen(false)
    }
    addEventListener('pointerdown', close)
    addEventListener('keydown', close)
    return () => {
      removeEventListener('pointerdown', close)
      removeEventListener('keydown', close)
    }
  }, [open])

  const run = async (fn: () => Promise<void>, ok: string | null) => {
    try {
      await fn()
      setMsg(ok)
    } catch {
      setMsg(t('account.offline'))
    }
  }

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
              <button className="acct-row acct-act" onClick={() => run(session.signOut, null)}>
                {t('account.signOut')}
              </button>
            </>
          ) : (
            <>
              <form
                className="acct-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  const clean = email.trim()
                  if (!EMAIL_RE.test(clean)) return setMsg(t('account.invalidEmail'))
                  run(() => session.signInWithEmail(clean), t('account.linkSent'))
                }}
              >
                <input type="email" placeholder={t('account.emailPlaceholder')} aria-label={t('account.emailLabel')} value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit">{t('account.sendLink')}</button>
              </form>
              <button className="acct-row acct-act" onClick={() => run(() => session.signInWithProvider('google'), null)}>
                {t('account.google')}
              </button>
              <button className="acct-row acct-act" onClick={() => run(() => session.signInWithProvider('github'), null)}>
                {t('account.github')}
              </button>
            </>
          )}
          {msg && <p className="acct-row acct-msg">{msg}</p>}
        </div>
      )}
    </div>
  )
}
