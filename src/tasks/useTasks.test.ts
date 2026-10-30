import { describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useTasks } from './useTasks'
import { localRepo } from './localRepo'

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
