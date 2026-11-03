import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FocusPanel from './FocusPanel'

const base = {
  running: false,
  mode: 'pomodoro' as const,
  phase: 'work' as const,
  freeMinutes: 25,
  onStart: () => {},
  onPause: () => {},
  onReset: () => {},
  onModeChange: () => {},
  onFreeMinutes: () => {},
  now: new Date(2026, 9, 30, 9, 5, 7),
}

describe('FocusPanel', () => {
  it('opens on the local time: hours solid, minutes grey, no reset button', () => {
    const { container } = render(<FocusPanel {...base} remainingMs={60_000} activeTaskText={null} />)
    expect(screen.getByRole('timer', { name: 'Son las 09:05' })).toBeInTheDocument()
    expect(container.querySelector('[data-part=min]')).toHaveTextContent('09')
    expect(container.querySelector('[data-part=sec]')).toHaveTextContent('05')
    expect(screen.getByRole('button', { name: 'Hora' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: /reiniciar/i })).not.toBeInTheDocument()
  })

  it('choosing Pomodoro swaps the clock for the timer and moves the time up, smaller', async () => {
    const onModeChange = vi.fn()
    const { container } = render(<FocusPanel {...base} remainingMs={24 * 60_000} activeTaskText={null} onModeChange={onModeChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Pomodoro' }))
    expect(onModeChange).toHaveBeenCalledWith('pomodoro')
    expect(container.querySelector('[data-part=min]')).toHaveTextContent('24')
    expect(screen.getByLabelText('Hora local')).toHaveTextContent('09:05')
    await userEvent.click(screen.getByRole('button', { name: 'Hora' }))
    expect(screen.getByRole('timer', { name: 'Son las 09:05' })).toBeInTheDocument()
  })

  it('shows the timer straight away when one is already running', () => {
    const { container } = render(<FocusPanel {...base} running remainingMs={3 * 60_000} activeTaskText={null} />)
    expect(container.querySelector('[data-part=min]')).toHaveTextContent('03')
  })

  it('renders minutes solid, seconds outlined', async () => {
    const { container } = render(<FocusPanel {...base} remainingMs={24 * 60_000 + 13_000} activeTaskText="Terminar informe Q3" />)
    await userEvent.click(screen.getByRole('button', { name: 'Pomodoro' }))
    expect(container.querySelector('[data-part=min]')).toHaveTextContent('24')
    expect(container.querySelector('[data-part=sec]')).toHaveTextContent('13')
    expect(screen.getByText('Terminar informe Q3')).toBeInTheDocument()
  })

  it('play button starts, and shows pause while running', async () => {
    const onStart = vi.fn()
    const { rerender } = render(<FocusPanel {...base} remainingMs={60_000} activeTaskText={null} onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: /^▶ iniciar$/i }))
    expect(onStart).toHaveBeenCalled()
    expect(screen.getByLabelText('Hora local')).toBeInTheDocument() // starting from the clock opens the timer
    rerender(<FocusPanel {...base} running remainingMs={60_000} activeTaskText={null} />)
    expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument()
  })
})
