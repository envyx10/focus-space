import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'
import Slider from '@/app/mobile/components/Slider'
import { PREFS_KEY } from '@/features/prefs/prefs'

/** A phone: the mobile query matches; `coarse` decides whether a focused field counts as the keyboard being up. */
function phone({ coarse = false } = {}) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('max-width: 1023px') || (coarse && query.includes('pointer: coarse')),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

/** The phone shell is a lazy chunk: wait for its tab bar. */
async function renderPhone() {
  const r = render(<App />)
  await screen.findByRole('navigation', { name: 'Paneles' }, { timeout: 3000 })
  return r
}

const tab = (name: string) => within(screen.getByRole('navigation', { name: 'Paneles' })).getByRole('button', { name: new RegExp(name) })
const view = (id: string) => document.querySelector(`[data-view="${id}"]`)!

// A finger: pointer events as a touch screen sends them.
const touch = (el: Element, type: 'pointerDown' | 'pointerMove' | 'pointerUp', x: number, y = 100) => fireEvent[type](el, { pointerId: 3, pointerType: 'touch', clientX: x, clientY: y, button: 0 })

describe('mobile shell', () => {
  beforeEach(() => {
    // calm: no WebGL in jsdom
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 1, calm: true }))
  })
  afterEach(() => {
    // @ts-expect-error jsdom has no matchMedia of its own
    delete window.matchMedia
    vi.useRealTimers()
  })

  it('mounts its own four tabs instead of the desktop grid, starting on Focus', async () => {
    phone()
    const { container } = await renderPhone()
    expect(container.querySelector('.app')).not.toBeInTheDocument()
    expect(container.querySelector('.m-app')).toBeInTheDocument()
    for (const name of ['Foco', 'Tareas', 'Sonidos', 'Ajustes']) expect(tab(name)).toBeInTheDocument()
    expect(tab('Foco')).toHaveAttribute('aria-current', 'page')
    expect(view('focus')).toHaveAttribute('data-active')
    // the other tabs stay mounted (they keep their scroll and drafts) but are out of reach
    expect(view('tasks')).toHaveAttribute('inert')
  })

  it('switches tabs from the tab bar', async () => {
    phone()
    await renderPhone()
    await userEvent.click(tab('Sonidos'))
    expect(tab('Sonidos')).toHaveAttribute('aria-current', 'page')
    expect(view('sound')).toHaveAttribute('data-active')
    expect(view('focus')).not.toHaveAttribute('data-active')
  })

  it('adds a task from the composer and counts it on the tab', async () => {
    phone()
    await renderPhone()
    await userEvent.click(tab('Tareas'))
    const box = within(view('tasks') as HTMLElement).getByRole('textbox', { name: 'Nueva tarea' })
    await userEvent.type(box, 'Llamar a Marta{Enter}')
    expect(await within(view('tasks') as HTMLElement).findByText('Llamar a Marta')).toBeInTheDocument()
    expect(box).toHaveValue('')
    expect(tab('Tareas')).toHaveTextContent('1')
  })

  it('swiping a row right completes it; left deletes it and offers Undo', async () => {
    phone()
    await renderPhone()
    await userEvent.click(tab('Tareas'))
    const tasks = within(view('tasks') as HTMLElement)
    await userEvent.type(tasks.getByRole('textbox', { name: 'Nueva tarea' }), 'Uno{Enter}')
    await userEvent.type(tasks.getByRole('textbox', { name: 'Nueva tarea' }), 'Dos{Enter}')
    const row = (text: string) => tasks.getByText(text).closest('li')!

    touch(row('Uno'), 'pointerDown', 50)
    touch(row('Uno'), 'pointerMove', 80)
    touch(row('Uno'), 'pointerMove', 180)
    touch(row('Uno'), 'pointerUp', 180)
    expect(await tasks.findByRole('checkbox', { name: /Uno/, checked: true })).toBeInTheDocument()

    vi.useFakeTimers({ shouldAdvanceTime: true })
    touch(row('Dos'), 'pointerDown', 300)
    touch(row('Dos'), 'pointerMove', 270)
    touch(row('Dos'), 'pointerMove', 150)
    touch(row('Dos'), 'pointerUp', 150)
    await act(() => vi.advanceTimersByTimeAsync(200))
    expect(tasks.queryByText('Dos')).not.toBeInTheDocument()
    fireEvent.click(tasks.getByRole('button', { name: 'Deshacer' }))
    expect(await tasks.findByText('Dos')).toBeInTheDocument()
  })

  it('a vertical drag over a row is a scroll: nothing happens to the task', async () => {
    phone()
    await renderPhone()
    await userEvent.click(tab('Tareas'))
    const tasks = within(view('tasks') as HTMLElement)
    await userEvent.type(tasks.getByRole('textbox', { name: 'Nueva tarea' }), 'Quieta{Enter}')
    const row = tasks.getByText('Quieta').closest('li')!
    touch(row, 'pointerDown', 50, 100)
    touch(row, 'pointerMove', 55, 140)
    touch(row, 'pointerMove', 200, 300)
    touch(row, 'pointerUp', 200, 300)
    expect(tasks.getByRole('checkbox', { name: /Quieta/ })).toHaveAttribute('aria-checked', 'false')
  })

  it('opens a task as a sheet, and Escape closes it', async () => {
    phone()
    await renderPhone()
    await userEvent.click(tab('Tareas'))
    const tasks = within(view('tasks') as HTMLElement)
    await userEvent.type(tasks.getByRole('textbox', { name: 'Nueva tarea' }), 'Con notas{Enter}')
    await userEvent.click(tasks.getByRole('button', { name: 'Abrir Con notas' }))
    const sheet = await screen.findByRole('dialog', { name: 'Tarea' })
    expect(within(sheet).getByRole('textbox', { name: 'Título de la tarea' })).toHaveValue('Con notas')
    fireEvent.keyDown(sheet, { key: 'Escape' })
    await act(() => new Promise((r) => setTimeout(r, 450)))
    expect(screen.queryByRole('dialog', { name: 'Tarea' })).not.toBeInTheDocument()
  })

  it('a running Pomodoro follows you to the other tabs as a mini timer you can pause', async () => {
    phone()
    await renderPhone()
    await userEvent.click(screen.getByRole('button', { name: 'Pomodoro' }))
    await userEvent.click(screen.getByRole('button', { name: /Iniciar/ }))
    expect(document.querySelector('.m-mini')).not.toBeInTheDocument()
    await userEvent.click(tab('Tareas'))
    const mini = document.querySelector('.m-mini') as HTMLElement
    expect(mini).toBeInTheDocument()
    expect(within(mini).getByText(/^2[45]:\d\d$/)).toBeInTheDocument()
    await userEvent.click(within(mini).getByRole('button', { name: 'Pausar' }))
    expect(within(mini).getByRole('button', { name: 'Seguir' })).toBeInTheDocument()
  })

  it('resetting a phase in progress asks first, in a sheet', async () => {
    phone()
    await renderPhone()
    await userEvent.click(screen.getByRole('button', { name: 'Pomodoro' }))
    await userEvent.click(screen.getByRole('button', { name: /Iniciar/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
    const ask = await screen.findByRole('dialog', { name: '¿Reiniciar?' })
    await userEvent.click(within(ask).getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('button', { name: /Pausar/ })).toBeInTheDocument()
  })

  it('hides the tab bar while typing on a touch screen (the keyboard is up)', async () => {
    phone({ coarse: true })
    const { container } = await renderPhone()
    await userEvent.click(tab('Tareas'))
    const shell = container.querySelector('.m-app')!
    expect(shell).not.toHaveAttribute('data-kb')
    act(() => (within(view('tasks') as HTMLElement).getByRole('textbox', { name: 'Nueva tarea' }) as HTMLInputElement).focus())
    expect(shell).toHaveAttribute('data-kb')
  })

  it('undo brings back every task deleted while the notice is up (beta: only the last one came back)', async () => {
    phone()
    await renderPhone()
    await userEvent.click(tab('Tareas'))
    const tasks = within(view('tasks') as HTMLElement)
    for (const name of ['Uno', 'Dos', 'Tres']) await userEvent.type(tasks.getByRole('textbox', { name: 'Nueva tarea' }), `${name}{Enter}`)
    vi.useFakeTimers({ shouldAdvanceTime: true })
    for (const name of ['Uno', 'Dos']) {
      const row = tasks.getByText(name).closest('li')!
      touch(row, 'pointerDown', 300)
      touch(row, 'pointerMove', 270)
      touch(row, 'pointerMove', 150)
      touch(row, 'pointerUp', 150)
      await act(() => vi.advanceTimersByTimeAsync(200))
    }
    expect(tasks.getAllByText('2 tareas borradas').length).toBeGreaterThan(0)
    fireEvent.click(tasks.getByRole('button', { name: 'Deshacer' }))
    expect(await tasks.findByText('Uno')).toBeInTheDocument()
    expect(tasks.getByText('Dos')).toBeInTheDocument()
  })

  it('the text size setting scales the phone UI', async () => {
    phone()
    const { container } = await renderPhone()
    await userEvent.click(tab('Ajustes'))
    await userEvent.click(within(view('settings') as HTMLElement).getByRole('button', { name: 'A++' }))
    expect((container.querySelector('.m-app') as HTMLElement).style.getPropertyValue('--m-ts')).toBe('1.25')
  })
})

describe('touch slider', () => {
  const setup = () => {
    const onChange = vi.fn()
    render(<Slider value={0} onChange={onChange} label="Volumen" />)
    const s = screen.getByRole('slider', { name: 'Volumen' })
    s.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 44, right: 200, bottom: 44, x: 0, y: 0, toJSON() {} })
    return { s, onChange }
  }

  it('a vertical swipe scrolls past it without touching the value', () => {
    const { s, onChange } = setup()
    touch(s, 'pointerDown', 20, 10)
    touch(s, 'pointerMove', 22, 40)
    touch(s, 'pointerMove', 120, 90)
    touch(s, 'pointerUp', 120, 90)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('a tap jumps to that point (no drag needed, WCAG 2.5.7)', () => {
    const { s, onChange } = setup()
    touch(s, 'pointerDown', 150, 10)
    touch(s, 'pointerUp', 150, 10)
    expect(onChange).toHaveBeenLastCalledWith(0.75)
  })

  it('a tap right after a scroll does nothing (it only meant to stop the list)', () => {
    const { s, onChange } = setup()
    fireEvent.scroll(document)
    touch(s, 'pointerDown', 150, 10)
    touch(s, 'pointerUp', 150, 10)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('a sideways drag follows the finger', () => {
    const { s, onChange } = setup()
    touch(s, 'pointerDown', 20, 10)
    touch(s, 'pointerMove', 100, 12)
    expect(onChange).toHaveBeenLastCalledWith(0.5)
  })

  it('arrow keys step by 5 %', () => {
    const { s, onChange } = setup()
    fireEvent.keyDown(s, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(0.05)
  })
})
