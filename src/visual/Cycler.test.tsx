import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Cycler from './Cycler'
import { TYPEFACES } from './typefaces'

const props = { label: 'Tipo', options: TYPEFACES }

describe('Cycler', () => {
  it('shows position and name of the current option', () => {
    render(<Cycler {...props} value="syne" onChange={() => {}} />)
    expect(screen.getByText('03/06')).toBeInTheDocument()
    expect(screen.getByText('Syne')).toBeInTheDocument()
  })

  it('next and previous wrap around', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<Cycler {...props} value="unbounded" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /siguiente tipografía/i }))
    expect(onChange).toHaveBeenLastCalledWith('suiza')
    rerender(<Cycler {...props} value="suiza" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /tipografía anterior/i }))
    expect(onChange).toHaveBeenLastCalledWith('unbounded')
  })
})
