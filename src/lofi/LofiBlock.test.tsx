import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LofiBlock from './LofiBlock'

const base = { playing: false, volume: 0.6, onToggle: () => {}, onVolume: () => {}, sync: 'off' as const, onSync: () => {} }

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

  it('sync button starts syncing the 3D with the music, and turns it off when live', async () => {
    const onSync = vi.fn()
    const { rerender } = render(<LofiBlock {...base} status="ready" onSync={onSync} />)
    const btn = screen.getByRole('button', { name: /sincronizar 3d con la música/i })
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(btn)
    expect(onSync).toHaveBeenCalled()
    rerender(<LofiBlock {...base} status="ready" sync="on" onSync={onSync} />)
    expect(screen.getByRole('button', { name: /sincronizar 3d con la música/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('explains when the tab audio was not shared', () => {
    render(<LofiBlock {...base} status="ready" sync="no-audio" />)
    expect(screen.getByText(/marca .*compartir audio/i)).toBeInTheDocument()
  })

  it('arrow keys on the volume change it in steps of 5', async () => {
    const onVolume = vi.fn()
    render(<LofiBlock {...base} status="ready" onVolume={onVolume} />)
    screen.getByRole('slider', { name: /volumen lofi/i }).focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(onVolume).toHaveBeenCalledWith(0.65)
  })
})
