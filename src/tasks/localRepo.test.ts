import { describe, expect, it } from 'vitest'
import { localRepo, TASKS_KEY } from './localRepo'
import type { Task } from './types'

const t = (id: string, text = id): Task => ({ id, text, done: false, active: false, createdAt: '2026-10-30T09:00:00.000Z' })

describe('localRepo', () => {
  it('round-trips tasks', async () => {
    await localRepo.save(t('a'))
    await localRepo.save(t('b'))
    expect((await localRepo.list()).map((x) => x.id)).toEqual(['a', 'b'])
  })

  it('save updates an existing task in place', async () => {
    await localRepo.save(t('a'))
    await localRepo.save({ ...t('a'), done: true })
    const list = await localRepo.list()
    expect(list).toHaveLength(1)
    expect(list[0].done).toBe(true)
  })

  it('remove deletes by id', async () => {
    await localRepo.save(t('a'))
    await localRepo.save(t('b'))
    await localRepo.remove('a')
    expect((await localRepo.list()).map((x) => x.id)).toEqual(['b'])
  })

  it('survives corrupt storage', async () => {
    localStorage.setItem(TASKS_KEY, '{nope')
    await expect(localRepo.list()).resolves.toEqual([])
  })

  it('drops malformed entries', async () => {
    localStorage.setItem(TASKS_KEY, JSON.stringify([t('a'), { id: 3 }, null]))
    expect((await localRepo.list()).map((x) => x.id)).toEqual(['a'])
  })
})
