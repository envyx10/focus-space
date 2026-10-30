import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('shows zero-padded session and date', () => {
    render(<Header sessionNumber={3} now={new Date('2026-10-30T09:00:00')} accountSlot={null} />)
    expect(screen.getByText(/Sesión 03/)).toBeInTheDocument()
    expect(screen.getByText('Vie 30.10')).toBeInTheDocument()
  })
})
