import { describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useTasks } from './useTasks'
import { localRepo } from './localRepo'
import type { Task, TaskRepo } from './types'

const task = (id: string): Task => ({ id, text: id, done: false, active: false, createdAt: '2026-10-30T09:00:00.000Z' })

async function setup() {
  const h = renderHook(() => useTasks(localRepo))
  await waitFor(() => expect(h.result.current.loaded).toBe(true))
  return h
}

describe('useTasks', () => {
  it('adding empty or whitespace text does nothing', async () => {
    const { result } = await setup()
    await act(() => result.current.add('   '))
    expect(result.current.tasks).toHaveLength(0)
  })

  it('add trims and persists', async () => {
    const { result } = await setup()
    await act(() => result.current.add('  Leer 20 páginas '))
    expect(result.current.tasks[0].text).toBe('Leer 20 páginas')
    expect(await localRepo.list()).toHaveLength(1)
  })

  it('setActive leaves at most one active', async () => {
    const { result } = await setup()
    await act(() => result.current.add('a'))
    await act(() => result.current.add('b'))
    const [a, b] = result.current.tasks
    await act(() => result.current.setActive(a.id))
    await act(() => result.current.setActive(b.id))
    expect(result.current.tasks.filter((t) => t.active).map((t) => t.id)).toEqual([b.id])
    await act(() => result.current.setActive(null))
    expect(result.current.tasks.some((t) => t.active)).toBe(false)
  })

  it('done tasks sort after pending ones and lose active', async () => {
    const { result } = await setup()
    await act(() => result.current.add('a'))
    await act(() => result.current.add('b'))
    const a = result.current.tasks[0]
    await act(() => result.current.setActive(a.id))
    await act(() => result.current.toggle(a.id))
    expect(result.current.tasks.map((t) => t.text)).toEqual(['b', 'a'])
    expect(result.current.tasks[1].active).toBe(false)
  })

  it('a slow reload from a previous repo never overwrites the current one', async () => {
    let releaseSlow: (v: Task[]) => void = () => {}
    const slow: TaskRepo = { list: () => new Promise((r) => (releaseSlow = r)), save: async () => {}, remove: async () => {} }
    const fast: TaskRepo = { list: async () => [task('local')], save: async () => {}, remove: async () => {} }
    const h = renderHook(({ repo }) => useTasks(repo), { initialProps: { repo: slow } })
    h.rerender({ repo: fast })
    await waitFor(() => expect(h.result.current.tasks.map((t) => t.id)).toEqual(['local']))
    await act(async () => releaseSlow([task('account')]))
    expect(h.result.current.tasks.map((t) => t.id)).toEqual(['local'])
  })

  it('a failed save rolls back to what the repo holds and reports the error', async () => {
    const repo: TaskRepo = {
      list: async () => [],
      save: async () => {
        throw new Error('offline')
      },
      remove: async () => {},
    }
    const h = renderHook(() => useTasks(repo))
    await waitFor(() => expect(h.result.current.loaded).toBe(true))
    await act(() => h.result.current.add('se pierde'))
    expect(h.result.current.tasks).toEqual([])
    expect(h.result.current.error).toBe(true)
  })

  it('edit and remove', async () => {
    const { result } = await setup()
    await act(() => result.current.add('a'))
    const id = result.current.tasks[0].id
    await act(() => result.current.edit(id, 'nuevo'))
    expect(result.current.tasks[0].text).toBe('nuevo')
    await act(() => result.current.remove(id))
    expect(result.current.tasks).toHaveLength(0)
  })
})
