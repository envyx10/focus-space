import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MixerBar from './MixerBar'
import { DEFAULT_PREFS } from '../prefs/prefs'

describe('MixerBar', () => {
  it('clicking channel name cycles variant', async () => {
    const onVariant = vi.fn()
    const { rerender } = render(<MixerBar prefs={DEFAULT_PREFS} onVolume={() => {}} onVariant={onVariant} />)
    await userEvent.click(screen.getByRole('button', { name: /lluvia/i }))
    expect(onVariant).toHaveBeenCalledWith('rain', 'ventana')
    const prefs = { ...DEFAULT_PREFS, variants: { ...DEFAULT_PREFS.variants, rain: 'tienda' } }
    rerender(<MixerBar prefs={prefs} onVolume={() => {}} onVariant={onVariant} />)
    await userEvent.click(screen.getByRole('button', { name: /lluvia/i }))
    expect(onVariant).toHaveBeenLastCalledWith('rain', 'suave')
  })

  it('shows volume as 00–100 and exposes a slider', () => {
    render(<MixerBar prefs={DEFAULT_PREFS} onVolume={() => {}} onVariant={() => {}} />)
    const slider = screen.getByRole('slider', { name: /volumen lluvia/i })
    expect(slider).toHaveAttribute('aria-valuenow', '65')
    expect(screen.getByText('65')).toBeInTheDocument()
  })

  it('arrow keys change the volume in steps of 5', async () => {
    const onVolume = vi.fn()
    render(<MixerBar prefs={DEFAULT_PREFS} onVolume={onVolume} onVariant={() => {}} />)
    screen.getByRole('slider', { name: /volumen lluvia/i }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onVolume).toHaveBeenCalledWith('rain', 0.7)
    await userEvent.keyboard('{ArrowLeft}')
    expect(onVolume).toHaveBeenLastCalledWith('rain', 0.6)
  })
})
