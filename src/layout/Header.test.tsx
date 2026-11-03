import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('shows zero-padded session and date', () => {
    render(<Header sessionNumber={3} now={new Date('2026-10-30T09:00:00')} accountSlot={null} />)
    expect(screen.getByText(/Sesión 03/)).toBeInTheDocument()
    expect(screen.getByText('Vie 30.10')).toBeInTheDocument()
  })

  it('reflects the real timer state instead of always saying "En curso"', () => {
    const { rerender } = render(<Header sessionNumber={1} now={new Date()} status="idle" accountSlot={null} />)
    expect(screen.getByText('Parado')).toBeInTheDocument()
    rerender(<Header sessionNumber={1} now={new Date()} status="running" accountSlot={null} />)
    expect(screen.getByText('En curso')).toBeInTheDocument()
    rerender(<Header sessionNumber={1} now={new Date()} status="paused" accountSlot={null} />)
    expect(screen.getByText('En pausa')).toBeInTheDocument()
  })
})
