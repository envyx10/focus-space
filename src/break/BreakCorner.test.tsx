import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BreakCorner from './BreakCorner'

describe('BreakCorner', () => {
  it('invites only during a break, and a dismissed invite stays away for that break only', async () => {
    const { rerender } = render(<BreakCorner inBreak={false} breakId="1-short" remaining="5:00" />)
    expect(screen.queryByText('¿Respiramos un rato?')).not.toBeInTheDocument()
    rerender(<BreakCorner inBreak breakId="1-short" remaining="5:00" />)
    await userEvent.click(screen.getByRole('button', { name: 'Ahora no' }))
    expect(screen.queryByText('¿Respiramos un rato?')).not.toBeInTheDocument()
    rerender(<BreakCorner inBreak breakId="2-short" remaining="5:00" />)
    expect(screen.getByText('¿Respiramos un rato?')).toBeInTheDocument()
  })

  it('opens the game with the break time visible, and announces the end of the break', async () => {
    const { rerender } = render(<BreakCorner inBreak breakId="1-short" remaining="4:12" />)
    await userEvent.click(screen.getByText('¿Respiramos un rato?'))
    expect(await screen.findByRole('dialog', { name: 'Respirar' })).toBeInTheDocument()
    expect(screen.getByLabelText('Descanso · quedan 4:12')).toBeInTheDocument()
    rerender(<BreakCorner inBreak={false} breakId="1-short" remaining="0:00" />)
    expect(screen.getByRole('status')).toHaveTextContent('Se acabó el descanso. Vuelta al foco')
  })

  it('Esc closes the game', async () => {
    render(<BreakCorner inBreak breakId="1-short" remaining="4:12" />)
    await userEvent.click(screen.getByText('¿Respiramos un rato?'))
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
