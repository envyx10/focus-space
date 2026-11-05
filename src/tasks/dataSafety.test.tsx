import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { localRepo, RESCUE_PREFIX, TASKS_KEY } from './localRepo'
import TasksPanel from './TasksPanel'
import { useTasks } from './useTasks'
import type { Task } from './types'

// Without an account the browser is the only copy: none of these may lose a word.
const task = (id: string, extra: Partial<Task> = {}): Task => ({ id, text: id, done: false, active: false, createdAt: '2026-10-30T09:00:00.000Z', ...extra })
const stored = () => JSON.parse(localStorage.getItem(TASKS_KEY) ?? '[]')
const rescued = () => Object.keys(localStorage).filter((k) => k.startsWith(RESCUE_PREFIX))

async function hook() {
  const h = renderHook(() => useTasks(localRepo))
  await waitFor(() => expect(h.result.current.loaded).toBe(true))
  return h
}

afterEach(() => vi.restoreAllMocks())

describe('local data never lost', () => {
  it('unreadable storage is copied aside before the first write replaces it', async () => {
    localStorage.setItem(TASKS_KEY, '[{"id":"a","text":"mis notas"')
    await localRepo.save(task('b'))
    expect(rescued().map((k) => localStorage.getItem(k))).toEqual(['[{"id":"a","text":"mis notas"'])
    // once per distinct content, not on every write
    await localRepo.save(task('c'))
    expect(rescued()).toHaveLength(1)
  })

  it('entries this version cannot read, and fields it does not know, are carried through writes', async () => {
    localStorage.setItem(TASKS_KEY, JSON.stringify([{ id: 'future', shape: 'v2' }, { ...task('a'), color: 'red' }]))
    await localRepo.save({ ...task('a'), text: 'editada' })
    await localRepo.remove('nothing')
    expect(stored()).toEqual([{ id: 'future', shape: 'v2' }, { ...task('a'), text: 'editada', color: 'red' }])
  })

  it('a refused write keeps the change on screen, reports it, and saves it on the retry', async () => {
    const h = await hook()
    await act(() => h.result.current.add('a'))
    const id = h.result.current.tasks[0].id
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    await act(() => h.result.current.describe(id, 'apuntes largos'))
    expect(h.result.current.tasks[0].description).toBe('apuntes largos')
    expect(h.result.current.localError).toBe(true)
    setItem.mockRestore()
    // any later change (or the timed retry) writes the pending task too
    await act(() => h.result.current.add('b'))
    expect(stored().find((t: Task) => t.id === id).description).toBe('apuntes largos')
    expect(h.result.current.localError).toBe(false)
  })

  it('another tab’s change shows here, so this tab can’t write a stale copy over it', async () => {
    const h = await hook()
    await act(() => h.result.current.add('a'))
    const [a] = stored()
    localStorage.setItem(TASKS_KEY, JSON.stringify([{ ...a, description: 'escrito en la otra pestaña' }]))
    act(() => void dispatchEvent(new StorageEvent('storage', { key: TASKS_KEY })))
    await waitFor(() => expect(h.result.current.tasks[0].description).toBe('escrito en la otra pestaña'))
    await act(() => h.result.current.edit(a.id, 'nuevo título'))
    expect(stored()[0]).toMatchObject({ text: 'nuevo título', description: 'escrito en la otra pestaña' })
  })

  it('a note typed just before the tab closes is saved on pagehide', async () => {
    const describe = vi.fn(async () => {})
    const noop = async () => {}
    render(<TasksPanel tasks={[task('1')]} synced describe={describe} add={noop} toggle={noop} edit={noop} remove={noop} setActive={noop} />)
    await userEvent.click(screen.getByRole('button', { name: /Pantalla completa/ }))
    fireEvent.change(screen.getByLabelText('Descripción de la tarea'), { target: { value: 'última línea' } })
    expect(describe).not.toHaveBeenCalled()
    dispatchEvent(new Event('pagehide'))
    expect(describe).toHaveBeenCalledWith('1', 'última línea')
  })

  it('"Limpiar hechas" can be undone', async () => {
    const restore = vi.fn(async () => {})
    const noop = async () => {}
    render(<TasksPanel tasks={[task('a', { done: true }), task('b', { done: true }), task('c')]} synced add={noop} toggle={noop} edit={noop} remove={noop} setActive={noop} restore={restore} clearDone={noop} />)
    await userEvent.click(screen.getByRole('button', { name: /Limpiar hechas/ }))
    expect(screen.getByRole('status')).toHaveTextContent('2 tareas borradas')
    await userEvent.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(restore.mock.calls.map(([t]) => (t as Task).id)).toEqual(['a', 'b'])
  })

  it('a half-typed new task survives a reload', async () => {
    const noop = async () => {}
    const props = { tasks: [], synced: true, add: noop, toggle: noop, edit: noop, remove: noop, setActive: noop }
    const first = render(<TasksPanel {...props} />)
    await userEvent.type(screen.getByPlaceholderText('+ Nueva tarea'), 'comprar pan')
    first.unmount()
    render(<TasksPanel {...props} />)
    expect(screen.getByPlaceholderText('+ Nueva tarea')).toHaveValue('comprar pan')
  })
})
