import { useEffect, useRef, useState } from 'react'
import type { Session } from './useSession'
import './account.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AccountMenu({ session }: { session: Session }) {
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
      setMsg('No se pudo conectar. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="acct" ref={root}>
      <button className="acct-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {session.user ? 'Cuenta ●' : 'Cuenta ↗'}
      </button>
      {open && (
        <div className="acct-panel" role="dialog" aria-label="Cuenta">
          <div className="num">03</div>
          <div className="lbl">Cuenta</div>

          {!session.available ? (
            <p className="acct-row">Modo solo local: tus tareas se guardan en este navegador.</p>
          ) : session.user ? (
            <>
              <p className="acct-row">{session.user.email}</p>
              <p className="acct-row acct-dim">Tus tareas se sincronizan entre dispositivos.</p>
              <button className="acct-row acct-act" onClick={() => run(session.signOut, null)}>
                Cerrar sesión →
              </button>
            </>
          ) : (
            <>
              <form
                className="acct-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  const clean = email.trim()
                  if (!EMAIL_RE.test(clean)) return setMsg('Escribe un email válido.')
                  run(() => session.signInWithEmail(clean), 'Revisa tu correo: te hemos enviado un enlace.')
                }}
              >
                <input type="email" placeholder="Tu email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit">Enviar enlace →</button>
              </form>
              <button className="acct-row acct-act" onClick={() => run(() => session.signInWithProvider('google'), null)}>
                Continuar con Google →
              </button>
              <button className="acct-row acct-act" onClick={() => run(() => session.signInWithProvider('github'), null)}>
                Continuar con GitHub →
              </button>
            </>
          )}
          {msg && <p className="acct-row acct-msg">{msg}</p>}
        </div>
      )}
    </div>
  )
}
