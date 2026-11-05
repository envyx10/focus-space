import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Picker from './Picker'

const options = [
  { id: 'rain', label: 'Lluvia' },
  { id: 'fire', label: 'Fuego' },
  { id: 'asmr', label: 'ASMR' },
]

describe('Picker', () => {
  it('Tab closes the list and moves on from its button, not back to the top of the page', async () => {
    render(
      <>
        <Picker value="rain" options={options} onChange={() => {}} label="Sonido" />
        <button>Siguiente</button>
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sonido' }))
    expect(screen.getByRole('listbox')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toHaveFocus()
  })

  it('letters typed in the open list never reach the app shortcuts, matching or not', async () => {
    const app = vi.fn()
    addEventListener('keydown', app)
    render(<Picker value="rain" options={options} onChange={() => {}} label="Sonido" />)
    await userEvent.click(screen.getByRole('button', { name: 'Sonido' }))
    await userEvent.keyboard('fm')
    removeEventListener('keydown', app)
    expect(app).not.toHaveBeenCalled()
    expect(screen.getByRole('option', { name: 'Fuego' })).toHaveClass('is-active')
  })
})
