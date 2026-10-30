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
}

describe('FocusPanel', () => {
  it('renders minutes solid, seconds outlined', () => {
    const { container } = render(<FocusPanel {...base} remainingMs={24 * 60_000 + 13_000} activeTaskText="Terminar informe Q3" />)
    expect(container.querySelector('[data-part=min]')).toHaveTextContent('24')
    expect(container.querySelector('[data-part=sec]')).toHaveTextContent('13')
    expect(screen.getByText('Terminar informe Q3')).toBeInTheDocument()
  })

  it('play button starts, and shows pause while running', async () => {
    const onStart = vi.fn()
    const { rerender } = render(<FocusPanel {...base} remainingMs={60_000} activeTaskText={null} onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: /^▶ iniciar$/i }))
    expect(onStart).toHaveBeenCalled()
    rerender(<FocusPanel {...base} running remainingMs={60_000} activeTaskText={null} />)
    expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument()
  })
})
