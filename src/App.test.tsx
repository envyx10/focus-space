import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { PREFS_KEY } from './prefs/prefs'

describe('App', () => {
  it('renders the five grid regions', () => {
    const { container } = render(<App />)
    for (const region of ['header', 'tasks', 'focus', 'mixer', 'lofi']) {
      expect(container.querySelector(`[data-region="${region}"]`)).toBeInTheDocument()
    }
  })

  it('the desktop grid has no phone tab bar (phones get their own shell, src/mobile)', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.app')).toBeInTheDocument()
    expect(container.querySelector('.m-app')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Paneles' })).not.toBeInTheDocument()
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
