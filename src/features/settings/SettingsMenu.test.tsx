import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_PREFS } from '@/features/prefs/prefs'
import { DEFAULT_CONFIG } from '@/features/timer/timer'
import SettingsMenu from './SettingsMenu'

const MIN = 60_000

describe('About', () => {
  it('links to the licenses served with the app and to the source', () => {
    setup()
    expect(screen.getByRole('link', { name: /licen[cs]/i })).toHaveAttribute('href', '/licenses.txt')
    expect(screen.getByRole('link', { name: /source|fuente/i })).toHaveAttribute('href', 'https://github.com/envyx10/focus-space')
  })
})

function setup(over: Partial<Parameters<typeof SettingsMenu>[0]> = {}) {
  const fns = {
    onOpenChange: vi.fn(),
    onConfig: vi.fn(),
    onChime: vi.fn(),
    onChimeSound: vi.fn(),
    onNotify: vi.fn(),
    onCalm: vi.fn(),
    onMuted: vi.fn(),
    onTextScale: vi.fn(),
    onAccent: vi.fn(),
    onSaveScene: vi.fn(),
    onApplyScene: vi.fn(),
    onDeleteScene: vi.fn(),
    onImmersive: vi.fn(),
    onSlots: vi.fn(),
    onBreakGame: vi.fn(),
  }
  render(<SettingsMenu prefs={DEFAULT_PREFS} config={DEFAULT_CONFIG} stats={{}} today="2026-10-30" open {...fns} {...over} />)
  return fns
}

describe('SettingsMenu', () => {
  it('stays closed until opened', () => {
    setup({ open: false })
    expect(screen.queryByRole('dialog', { name: 'Ajustes' })).not.toBeInTheDocument()
  })

  it('presets set the three durations at once', async () => {
    const f = setup()
    await userEvent.click(screen.getByRole('button', { name: '50 / 10' }))
    expect(f.onConfig).toHaveBeenCalledWith({ ...DEFAULT_CONFIG, work: 50 * MIN, short: 10 * MIN, long: 20 * MIN })
  })

  it('a typed duration is clamped to the allowed range', () => {
    const f = setup()
    const input = screen.getByLabelText(/^Focus/)
    fireEvent.change(input, { target: { value: '9999' } })
    fireEvent.blur(input)
    expect(f.onConfig).toHaveBeenCalledWith({ ...DEFAULT_CONFIG, work: 180 * MIN })
  })

  it('auto-start, calm, mute and text size reach their handlers', async () => {
    const f = setup()
    await userEvent.click(screen.getByLabelText(/siguiente fase automáticamente/i))
    expect(f.onConfig).toHaveBeenCalledWith({ ...DEFAULT_CONFIG, autoNext: false })
    await userEvent.click(screen.getByLabelText(/modo calma/i))
    expect(f.onCalm).toHaveBeenCalledWith(true)
    await userEvent.click(screen.getByLabelText(/silenciar todo/i))
    expect(f.onMuted).toHaveBeenCalledWith(true)
    await userEvent.click(screen.getByRole('button', { name: 'A+' }))
    expect(f.onTextScale).toHaveBeenCalledWith('l')
  })

  it('the accent colour comes from a swatch or the colour input', async () => {
    const f = setup()
    expect(screen.getByRole('button', { name: '#ff4b1f' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: '#38bdf8' }))
    expect(f.onAccent).toHaveBeenCalledWith('#38bdf8')
    fireEvent.change(screen.getByLabelText('Elegir otro color'), { target: { value: '#123ABC' } })
    expect(f.onAccent).toHaveBeenCalledWith('#123abc')
  })

  it('picks the end-of-phase tone', async () => {
    const f = setup()
    expect(screen.getByRole('button', { name: 'Campana' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Marimba' }))
    expect(f.onChimeSound).toHaveBeenCalledWith('marimba')
  })

  it('the chime can be turned off', () => {
    const f = setup()
    fireEvent.change(screen.getByLabelText('Volumen del aviso'), { target: { value: '0' } })
    expect(f.onChime).toHaveBeenCalledWith(0)
  })

  it('saves a named mix, and lists and applies saved ones', async () => {
    const mix = { name: 'Examen', volumes: DEFAULT_PREFS.volumes, variants: DEFAULT_PREFS.variants }
    const f = setup({ prefs: { ...DEFAULT_PREFS, scenes: [mix] } })
    await userEvent.type(screen.getByLabelText('Nombre de la mezcla'), 'Noche{Enter}')
    expect(f.onSaveScene).toHaveBeenCalledWith('Noche')
    await userEvent.click(screen.getByRole('button', { name: 'Examen' }))
    expect(f.onApplyScene).toHaveBeenCalledWith('Examen')
  })

  it('mixer squares: replace one (swapping duplicates), reorder with arrows and restore defaults', async () => {
    const f = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Cuadrado 1' }))
    await userEvent.click(screen.getByRole('option', { name: 'Fuego' }))
    expect(f.onSlots).toHaveBeenLastCalledWith(['fire', 'rain', ...DEFAULT_PREFS.slots.slice(2)])
    await userEvent.click(screen.getByRole('button', { name: 'Bajar Lluvia' }))
    expect(f.onSlots).toHaveBeenLastCalledWith(['fire', 'rain', ...DEFAULT_PREFS.slots.slice(2)])
    expect(screen.getByRole('button', { name: 'Subir Lluvia' })).toBeDisabled()
    expect(screen.queryByText('Restaurar cuadrados por defecto')).not.toBeInTheDocument()
  })

  it('offers restoring the default squares once they changed', async () => {
    const f = setup({ prefs: { ...DEFAULT_PREFS, slots: ['asmr', ...DEFAULT_PREFS.slots.slice(1)] } })
    await userEvent.click(screen.getByText('Restaurar cuadrados por defecto'))
    expect(f.onSlots).toHaveBeenCalledWith(DEFAULT_PREFS.slots)
  })

  it('shows today, the last 7 days and the streak', () => {
    setup({ stats: { '2026-10-30': { focusMs: 85 * MIN, sessions: 3 }, '2026-10-29': { focusMs: 25 * MIN, sessions: 1 } } })
    expect(screen.getByText('1 h 25 · 3 sesiones')).toBeInTheDocument()
    expect(screen.getByText('1 h 50')).toBeInTheDocument()
    expect(screen.getByText('2 días')).toBeInTheDocument()
  })
})
