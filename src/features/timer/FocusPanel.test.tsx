import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FocusPanel from './FocusPanel'

const base = {
  running: false,
  status: 'idle' as const,
  onSkip: () => {},
  onExtend: () => {},
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
  it('the Breathe view opens the guide in the panel and any other view closes it', async () => {
    render(<FocusPanel {...base} remainingMs={60_000} activeTaskText={null} />)
    await userEvent.click(screen.getByRole('button', { name: 'Respirar' }))
    expect(await screen.findByRole('region', { name: 'Respirar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Respirar' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Hora' })).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(screen.getByRole('button', { name: 'Hora' }))
    expect(screen.queryByRole('region', { name: 'Respirar' })).not.toBeInTheDocument()
  })

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
    await userEvent.click(screen.getByRole('button', { name: /^iniciar$/i }))
    expect(onStart).toHaveBeenCalled()
    expect(screen.getByLabelText('Hora local')).toBeInTheDocument() // starting from the clock opens the timer
    rerender(<FocusPanel {...base} running remainingMs={60_000} activeTaskText={null} />)
    expect(screen.getByRole('button', { name: /pausar/i })).toBeInTheDocument()
  })

  it('asks before throwing away a phase in progress, and does nothing if declined', async () => {
    const onReset = vi.fn()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<FocusPanel {...base} running status="running" remainingMs={60_000} activeTaskText={null} onReset={onReset} />)
    await userEvent.click(screen.getByRole('button', { name: 'Pomodoro' }))
    await userEvent.click(screen.getByRole('button', { name: /reiniciar/i }))
    expect(confirm).toHaveBeenCalled()
    expect(onReset).not.toHaveBeenCalled()
    confirm.mockReturnValue(true)
    await userEvent.click(screen.getByRole('button', { name: /reiniciar/i }))
    expect(onReset).toHaveBeenCalled()
    confirm.mockRestore()
  })

  it('does not ask when nothing has been spent', async () => {
    const onReset = vi.fn()
    const confirm = vi.spyOn(window, 'confirm')
    render(<FocusPanel {...base} remainingMs={60_000} activeTaskText={null} onReset={onReset} />)
    await userEvent.click(screen.getByRole('button', { name: 'Pomodoro' }))
    await userEvent.click(screen.getByRole('button', { name: /reiniciar/i }))
    expect(confirm).not.toHaveBeenCalled()
    expect(onReset).toHaveBeenCalled()
    confirm.mockRestore()
  })

  it('offers +5 min and skip in Pomodoro', async () => {
    const onSkip = vi.fn()
    const onExtend = vi.fn()
    render(<FocusPanel {...base} remainingMs={60_000} activeTaskText={null} onSkip={onSkip} onExtend={onExtend} />)
    await userEvent.click(screen.getByRole('button', { name: 'Pomodoro' }))
    await userEvent.click(screen.getByRole('button', { name: '+5 min' }))
    await userEvent.click(screen.getByRole('button', { name: /saltar/i }))
    expect(onExtend).toHaveBeenCalled()
    expect(onSkip).toHaveBeenCalled()
  })

  it('the Space signal starts, then pauses, like the main button', () => {
    const onStart = vi.fn()
    const onPause = vi.fn()
    const props = { ...base, remainingMs: 60_000, activeTaskText: null, onStart, onPause }
    const { rerender } = render(<FocusPanel {...props} toggleSignal={0} />)
    rerender(<FocusPanel {...props} toggleSignal={1} />)
    expect(onStart).toHaveBeenCalledTimes(1)
    rerender(<FocusPanel {...props} running status="running" toggleSignal={1} />)
    rerender(<FocusPanel {...props} running status="running" toggleSignal={2} />)
    expect(onPause).toHaveBeenCalledTimes(1)
  })
})
