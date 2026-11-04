import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountMenu from './AccountMenu'
import type { Session } from './useSession'

const session: Session = {
  user: null,
  available: true,
  signInWithEmail: vi.fn(async () => {}),
  signInWithProvider: vi.fn(async () => {}),
  signOut: vi.fn(async () => {}),
}

async function open(props = session) {
  render(<AccountMenu session={props} />)
  await userEvent.click(screen.getByRole('button', { name: /entrar|cuenta/i }))
}

describe('AccountMenu', () => {
  it('without supabase shows local-only and no sign-in buttons', async () => {
    await open({ ...session, available: false })
    expect(screen.getByText(/solo local/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /google/i })).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/email/i)).not.toBeInTheDocument()
  })

  it('shows email field, Google and GitHub buttons when available', async () => {
    await open()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
  })

  it('submitting a valid email sends the magic link and confirms', async () => {
    const signInWithEmail = vi.fn(async () => {})
    await open({ ...session, signInWithEmail })
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'ana@example.com{Enter}')
    expect(signInWithEmail).toHaveBeenCalledWith('ana@example.com')
    expect(await screen.findByText(/revisa tu correo/i)).toBeInTheDocument()
  })

  it('rejects an invalid email without calling the API', async () => {
    const signInWithEmail = vi.fn(async () => {})
    await open({ ...session, signInWithEmail })
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'nope{Enter}')
    expect(signInWithEmail).not.toHaveBeenCalled()
  })

  it('signed in: shows the email and a sign-out button', async () => {
    const signOut = vi.fn(async () => {})
    await open({ ...session, user: { email: 'ana@example.com' }, signOut })
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))
    expect(signOut).toHaveBeenCalled()
  })
})
