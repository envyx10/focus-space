import { describe, expect, it, vi } from 'vitest'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TasksPanel from './TasksPanel'
import { localRepo } from './localRepo'
import { useTasks } from './useTasks'
import type { Task } from './types'

const task = (id: string, extra: Partial<Task> = {}): Task => ({ id, text: id, done: false, active: false, createdAt: '2026-10-30T09:00:00.000Z', ...extra })
const noop = async () => {}

describe('delete, undo and clean up', () => {
  it('restore puts a deleted task back as it was, and never duplicates it', async () => {
    const h = renderHook(() => useTasks(localRepo))
    await waitFor(() => expect(h.result.current.loaded).toBe(true))
    await act(() => h.result.current.add('repasar'))
    const t = h.result.current.tasks[0]
    await act(() => h.result.current.remove(t.id))
    expect(h.result.current.tasks).toHaveLength(0)
    await act(() => h.result.current.restore(t))
    await act(() => h.result.current.restore(t))
    expect(h.result.current.tasks).toEqual([t])
    expect(await localRepo.list()).toEqual([t])
  })

  it('clearDone removes only the finished tasks; addMany skips known ids', async () => {
    const h = renderHook(() => useTasks(localRepo))
    await waitFor(() => expect(h.result.current.loaded).toBe(true))
    await act(() => h.result.current.addMany([task('a', { done: true }), task('b')]))
    await act(() => h.result.current.addMany([task('b'), task('c')]))
    expect(h.result.current.tasks.map((t) => t.id).sort()).toEqual(['a', 'b', 'c'])
    await act(() => h.result.current.clearDone())
    expect(h.result.current.tasks.map((t) => t.id).sort()).toEqual(['b', 'c'])
    expect((await localRepo.list()).map((t) => t.id).sort()).toEqual(['b', 'c'])
  })

  it('panel offers Deshacer after deleting, and calls restore with that task', async () => {
    const remove = vi.fn(noop)
    const restore = vi.fn(noop)
    render(<TasksPanel tasks={[task('x')]} synced add={noop} toggle={noop} edit={noop} remove={remove} setActive={noop} restore={restore} />)
    await userEvent.click(screen.getByRole('button', { name: 'Borrar x' }))
    expect(remove).toHaveBeenCalledWith('x')
    await userEvent.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(restore).toHaveBeenCalledWith(expect.objectContaining({ id: 'x' }))
    expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
  })

  it('the pencil button edits without a double click', async () => {
    const edit = vi.fn(noop)
    render(<TasksPanel tasks={[task('x')]} synced add={noop} toggle={noop} edit={edit} remove={noop} setActive={noop} />)
    await userEvent.click(screen.getByRole('button', { name: 'Editar x' }))
    await userEvent.type(screen.getByDisplayValue('x'), 'y{Enter}')
    expect(edit).toHaveBeenCalledWith('x', 'xy')
  })

  it('shows "Limpiar hechas" only when something is done', () => {
    const props = { synced: true, add: noop, toggle: noop, edit: noop, remove: noop, setActive: noop, clearDone: noop }
    const { rerender } = render(<TasksPanel tasks={[task('a')]} {...props} />)
    expect(screen.queryByRole('button', { name: /limpiar hechas/i })).not.toBeInTheDocument()
    rerender(<TasksPanel tasks={[task('a', { done: true })]} {...props} />)
    expect(screen.getByRole('button', { name: 'Limpiar hechas (1)' })).toBeInTheDocument()
  })
})
