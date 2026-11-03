import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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

  it('variant button is not inside the slider (ARIA sliders hide their children from screen readers)', () => {
    render(<MixerBar prefs={DEFAULT_PREFS} onVolume={() => {}} onVariant={() => {}} />)
    const slider = screen.getByRole('slider', { name: /volumen lluvia/i })
    expect(slider.contains(screen.getByRole('button', { name: /lluvia/i }))).toBe(false)
  })

  it('shows volume as 00–100 and exposes a slider', () => {
    const prefs = { ...DEFAULT_PREFS, volumes: { ...DEFAULT_PREFS.volumes, rain: 0.65 } }
    render(<MixerBar prefs={prefs} onVolume={() => {}} onVariant={() => {}} />)
    const slider = screen.getByRole('slider', { name: /volumen lluvia/i })
    expect(slider).toHaveAttribute('aria-valuenow', '65')
    expect(screen.getByText('65')).toBeInTheDocument()
  })

  it('arrow keys change the volume in steps of 5', async () => {
    const onVolume = vi.fn()
    const prefs = { ...DEFAULT_PREFS, volumes: { ...DEFAULT_PREFS.volumes, rain: 0.65 } }
    render(<MixerBar prefs={prefs} onVolume={onVolume} onVariant={() => {}} />)
    screen.getByRole('slider', { name: /volumen lluvia/i }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onVolume).toHaveBeenCalledWith('rain', 0.7)
    await userEvent.keyboard('{ArrowLeft}')
    expect(onVolume).toHaveBeenLastCalledWith('rain', 0.6)
  })
})

describe('MixerBar interaction', () => {
  it('a plain click on the line jumps to that position, a drag stays relative', () => {
    const onVolume = vi.fn()
    render(<MixerBar prefs={{ ...DEFAULT_PREFS, volumes: { ...DEFAULT_PREFS.volumes, rain: 0.2 } }} onVolume={onVolume} onVariant={() => {}} />)
    const slider = screen.getByRole('slider', { name: /volumen lluvia/i })
    slider.getBoundingClientRect = () => ({ left: 100, width: 200, top: 0, right: 300, bottom: 0, height: 0, x: 100, y: 0, toJSON() {} })
    slider.setPointerCapture = () => {}
    fireEvent.pointerDown(slider, { clientX: 250, pointerId: 1 })
    fireEvent.pointerUp(slider, { clientX: 250, pointerId: 1 })
    expect(onVolume).toHaveBeenLastCalledWith('rain', 0.75)
    onVolume.mockClear()
    fireEvent.pointerDown(slider, { clientX: 150, pointerId: 1 })
    fireEvent.pointerMove(slider, { clientX: 170, pointerId: 1 })
    fireEvent.pointerUp(slider, { clientX: 170, pointerId: 1 })
    expect(onVolume).toHaveBeenCalledTimes(1)
    expect(onVolume).toHaveBeenCalledWith('rain', 0.3)
  })

  it('nudges the first-time user only while everything is silent', () => {
    const { rerender } = render(<MixerBar prefs={DEFAULT_PREFS} onVolume={() => {}} onVariant={() => {}} />)
    expect(screen.getByText(/todo en silencio/i)).toBeInTheDocument()
    rerender(<MixerBar prefs={{ ...DEFAULT_PREFS, volumes: { ...DEFAULT_PREFS.volumes, fire: 0.1 } }} onVolume={() => {}} onVariant={() => {}} />)
    expect(screen.queryByText(/todo en silencio/i)).not.toBeInTheDocument()
  })
})
