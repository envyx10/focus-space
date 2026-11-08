import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TasksPanel from './TasksPanel'
import { localRepo } from './localRepo'
import { dropIndex } from './useDragSort'
import { byPriority, rank, reorder, sortTasks, useTasks } from './useTasks'
import type { Task } from './types'

const at = (min: number) => new Date(Date.UTC(2026, 9, 30, 9, min)).toISOString()
const task = (id: string, min: number, extra: Partial<Task> = {}): Task => ({ id, text: id, done: false, active: false, createdAt: at(min), ...extra })
const ids = (tasks: Task[]) => tasks.map((t) => t.id)
/** Applies what reorder() says to save, the way useTasks does. */
const apply = (tasks: Task[], id: string, to: number) => {
  const changed = new Map(reorder(tasks, id, to).map((t) => [t.id, t]))
  return sortTasks(tasks.map((t) => changed.get(t.id) ?? t))
}

describe('reorder', () => {
  const list = [task('a', 0), task('b', 1), task('c', 2), task('d', 3)]

  it('moves a task up, down, to the top and to the bottom, saving only that task', () => {
    expect(ids(apply(list, 'c', 0))).toEqual(['c', 'a', 'b', 'd'])
    expect(ids(apply(list, 'a', 2))).toEqual(['b', 'c', 'a', 'd'])
    expect(ids(apply(list, 'b', 3))).toEqual(['a', 'c', 'd', 'b'])
    expect(reorder(list, 'c', 1)).toHaveLength(1)
  })

  it('does nothing when the task stays where it is, is done or does not exist', () => {
    expect(reorder(list, 'b', 1)).toEqual([])
    expect(reorder([...list, task('x', 4, { done: true })], 'x', 0)).toEqual([])
    expect(reorder(list, 'nope', 0)).toEqual([])
  })

  it('only moves among pending tasks: finished ones stay at the end', () => {
    const mixed = [task('a', 0), task('done', 1, { done: true }), task('b', 2)]
    expect(ids(apply(mixed, 'b', 0))).toEqual(['b', 'a', 'done'])
  })

  it('a task added after a move still lands at the end', () => {
    const moved = apply(list, 'd', 0)
    expect(ids(sortTasks([...moved, task('new', 10)]))).toEqual(['d', 'a', 'b', 'c', 'new'])
  })

  it('renumbers every pending task once there is no room left between two neighbours', () => {
    let tasks = [task('a', 0, { position: 1 }), task('b', 0, { position: 1 + Number.EPSILON }), task('c', 0, { position: 5 })]
    const saved = reorder(tasks, 'c', 1)
    expect(saved).toHaveLength(3)
    tasks = apply(tasks, 'c', 1)
    expect(ids(tasks)).toEqual(['a', 'c', 'b'])
    expect(new Set(tasks.map(rank)).size).toBe(3)
  })

  it('survives many moves to the same spot', () => {
    let tasks = list
    for (let i = 0; i < 200; i++) tasks = apply(tasks, tasks[3].id, 1)
    expect(new Set(tasks.map(rank)).size).toBe(4)
    expect(tasks).toHaveLength(4)
  })
})

describe('dropIndex', () => {
  const tops = [0, 40, 80, 120]
  const heights = [40, 40, 40, 40]
  it('lands where the middle of the dragged row is', () => {
    expect(dropIndex(tops, heights, 0, 0)).toBe(0)
    expect(dropIndex(tops, heights, 0, 50)).toBe(1)
    expect(dropIndex(tops, heights, 0, 500)).toBe(3)
    expect(dropIndex(tops, heights, 3, -95)).toBe(1)
    expect(dropIndex(tops, heights, 3, -500)).toBe(0)
  })
})

describe('useTasks.move', () => {
  it('saves the new order so it survives a reload', async () => {
    const h = renderHook(() => useTasks(localRepo))
    await waitFor(() => expect(h.result.current.loaded).toBe(true))
    for (const text of ['uno', 'dos', 'tres']) {
      await act(() => h.result.current.add(text))
      await new Promise((r) => setTimeout(r, 2))
    }
    const tres = h.result.current.tasks[2]
    await act(() => h.result.current.move(tres.id, 0))
    expect(h.result.current.tasks.map((t) => t.text)).toEqual(['tres', 'uno', 'dos'])
    expect(sortTasks(await localRepo.list()).map((t) => t.text)).toEqual(['tres', 'uno', 'dos'])
  })
})

describe('TasksPanel reordering', () => {
  const noop = async () => {}
  const actions = { add: noop, toggle: noop, edit: noop, remove: noop, setActive: noop }
  const tasks = [task('a', 0), task('b', 1), task('c', 2, { done: true })]

  it('offers a handle on pending tasks only, and arrows move with it', async () => {
    const move = vi.fn(noop)
    render(<TasksPanel tasks={tasks} synced {...actions} move={move} />)
    const grips = screen.getAllByRole('button', { name: /^Mover/ })
    expect(grips).toHaveLength(2)
    expect(grips[0]).toHaveAccessibleName('Mover a, 1 de 2. Las flechas arriba y abajo la mueven')
    grips[0].focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(move).toHaveBeenCalledWith('a', 1)
    await userEvent.keyboard('{ArrowUp}')
    expect(move).toHaveBeenCalledTimes(1)
  })

  it('drops a dragged task where it is released', () => {
    const move = vi.fn(noop)
    render(<TasksPanel tasks={[task('a', 0), task('b', 1), task('d', 3)]} synced {...actions} move={move} />)
    const rows = document.querySelectorAll<HTMLElement>('[data-sortable]')
    rows.forEach((r, i) => (r.getBoundingClientRect = () => ({ top: i * 40, height: 40 }) as DOMRect))
    const grip = screen.getAllByRole('button', { name: /^Mover/ })[0]
    fireEvent.pointerDown(grip, { button: 0, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(grip, { clientY: 110, pointerId: 1 })
    expect(rows[0]).toHaveClass('drag')
    fireEvent.pointerUp(grip, { pointerId: 1 })
    expect(move).toHaveBeenCalledWith('a', 2)
  })

  it('Escape cancels a drag without moving anything', () => {
    const move = vi.fn(noop)
    render(<TasksPanel tasks={tasks} synced {...actions} move={move} />)
    const grip = screen.getAllByRole('button', { name: /^Mover/ })[0]
    fireEvent.pointerDown(grip, { button: 0, clientY: 0, pointerId: 1 })
    fireEvent.pointerMove(grip, { clientY: 200, pointerId: 1 })
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.pointerUp(grip, { pointerId: 1 })
    expect(move).not.toHaveBeenCalled()
  })

  it('no handle without a move action or with a single pending task', () => {
    const { unmount } = render(<TasksPanel tasks={tasks} synced {...actions} />)
    expect(screen.queryByRole('button', { name: /^Mover/ })).not.toBeInTheDocument()
    unmount()
    render(<TasksPanel tasks={[task('a', 0)]} synced {...actions} move={noop} />)
    expect(screen.queryByRole('button', { name: /^Mover/ })).not.toBeInTheDocument()
  })
})

describe('byPriority', () => {
  const apply = (tasks: Task[]) => {
    const changed = new Map(byPriority(tasks).map((t) => [t.id, t]))
    return sortTasks(tasks.map((t) => changed.get(t.id) ?? t))
  }

  it('puts high, medium, low, then none first, keeping the order within each and leaving finished tasks at the end', () => {
    const tasks = [task('a', 0), task('b', 1, { priority: 'low' }), task('c', 2, { priority: 'high' }), task('d', 3, { done: true, priority: 'high' }), task('e', 4, { priority: 'medium' }), task('f', 5, { priority: 'high' }), task('g', 6, { priority: null })]
    expect(ids(apply(tasks))).toEqual(['c', 'f', 'e', 'b', 'a', 'g', 'd'])
  })

  it('saves nothing when the list is already in that order', () => {
    const sorted = apply([task('a', 0, { priority: 'high' }), task('b', 1)])
    expect(byPriority(sorted)).toEqual([])
  })
})
