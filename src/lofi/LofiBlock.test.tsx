import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LofiBlock from './LofiBlock'

const base = { playing: false, volume: 0.6, onToggle: () => {}, onVolume: () => {} }

describe('LofiBlock', () => {
  it('shows "No disponible" and disables play when unavailable', () => {
    render(<LofiBlock {...base} status="unavailable" />)
    expect(screen.getByText('No disponible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reproducir lofi/i })).toBeDisabled()
  })

  it('toggle calls onToggle', async () => {
    const onToggle = vi.fn()
    render(<LofiBlock {...base} status="ready" onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('button', { name: /reproducir lofi/i }))
    expect(onToggle).toHaveBeenCalled()
  })

  it('shows pause label while playing', () => {
    render(<LofiBlock {...base} status="ready" playing />)
    expect(screen.getByRole('button', { name: /pausar lofi/i })).toBeInTheDocument()
  })

  it('arrow keys on the volume change it in steps of 5', async () => {
    const onVolume = vi.fn()
    render(<LofiBlock {...base} status="ready" onVolume={onVolume} />)
    screen.getByRole('slider', { name: /volumen lofi/i }).focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(onVolume).toHaveBeenCalledWith(0.65)
  })
})
