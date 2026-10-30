import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Cycler from './Cycler'
import { SCENES } from './scenes'

const props = { label: 'Escena', noun: 'escena', options: SCENES }

describe('Cycler', () => {
  it('shows position and name of the current option', () => {
    render(<Cycler {...props} value="ondas" onChange={() => {}} />)
    expect(screen.getByText('03/06')).toBeInTheDocument()
    expect(screen.getByText('Ondas')).toBeInTheDocument()
  })

  it('next and previous wrap around', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<Cycler {...props} value="giroscopio" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /siguiente escena/i }))
    expect(onChange).toHaveBeenLastCalledWith('esfera')
    rerender(<Cycler {...props} value="esfera" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /escena anterior/i }))
    expect(onChange).toHaveBeenLastCalledWith('giroscopio')
  })
})
