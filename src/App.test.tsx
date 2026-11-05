import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { PREFS_KEY } from './prefs/prefs'

describe('App', () => {
  it('renders the five grid regions', () => {
    const { container } = render(<App />)
    for (const region of ['header', 'tasks', 'focus', 'mixer', 'lofi']) {
      expect(container.querySelector(`[data-region="${region}"]`)).toBeInTheDocument()
    }
  })

  it('the phone tab bar picks which lower panel shows', async () => {
    const { container } = render(<App />)
    const app = container.querySelector('.app')!
    expect(app).toHaveAttribute('data-tab', 'tasks')
    await userEvent.click(screen.getByRole('button', { name: 'Sonidos' }))
    expect(app).toHaveAttribute('data-tab', 'mixer')
    expect(screen.getByRole('button', { name: 'Sonidos' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('stays dark even when a light theme was saved (light mode is switched off)', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, theme: 'light' }))
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.queryByRole('button', { name: /tema claro/i })).not.toBeInTheDocument()
  })

  it('with the breathing invite turned off, the clock panel still shows the task line', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, breakGame: false }))
    render(<App />)
    expect(screen.getByText('Sin tarea activa')).toBeInTheDocument()
  })
})
