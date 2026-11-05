import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

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

  it('the header button flips between dark and light', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar a tema claro' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
