import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useShortcuts, type ShortcutHandlers } from './useShortcuts'

const fns = (): ShortcutHandlers => ({ toggleTimer: vi.fn(), newTask: vi.fn(), mute: vi.fn(), calm: vi.fn(), immersive: vi.fn(), settings: vi.fn(), escape: vi.fn() })

function Host({ h }: { h: ShortcutHandlers }) {
  useShortcuts(h)
  return (
    <div>
      <input aria-label="campo" />
      <button>botón</button>
    </div>
  )
}

describe('useShortcuts', () => {
  it('fires on the page, but never while typing', async () => {
    const h = fns()
    const { getByLabelText } = render(<Host h={h} />)
    await userEvent.keyboard('m')
    expect(h.mute).toHaveBeenCalledTimes(1)
    await userEvent.click(getByLabelText('campo'))
    await userEvent.keyboard('mnc i')
    expect(h.mute).toHaveBeenCalledTimes(1)
    expect(h.toggleTimer).not.toHaveBeenCalled()
  })

  it('Space toggles the timer on the page but leaves a focused button alone', async () => {
    const h = fns()
    const { getByRole } = render(<Host h={h} />)
    await userEvent.keyboard(' ')
    expect(h.toggleTimer).toHaveBeenCalledTimes(1)
    getByRole('button').focus()
    await userEvent.keyboard(' ')
    expect(h.toggleTimer).toHaveBeenCalledTimes(1)
  })

  it('ignores keys pressed with a modifier', async () => {
    const h = fns()
    render(<Host h={h} />)
    await userEvent.keyboard('{Control>}n{/Control}')
    expect(h.newTask).not.toHaveBeenCalled()
  })
})
