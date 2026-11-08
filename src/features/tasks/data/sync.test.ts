import { describe, expect, it } from 'vitest'
import type { Task, TaskRepo } from '@/features/tasks/types'
import { localRepo } from './localRepo'
import { moveLocalIntoRemote } from './sync'

const t = (id: string, text = id): Task => ({ id, text, done: false, active: false, createdAt: '2026-10-30T09:00:00.000Z' })

function memoryRepo(initial: Task[] = [], onSave?: () => Promise<void>): TaskRepo & { all: Task[] } {
  const all = [...initial]
  return {
    all,
    async list() {
      return [...all]
    },
    async save(x) {
      await onSave?.()
      const i = all.findIndex((y) => y.id === x.id)
      if (i === -1) all.push(x)
      else all[i] = x
    },
    async remove(id) {
      const i = all.findIndex((y) => y.id === id)
      if (i !== -1) all.splice(i, 1)
    },
  }
}

describe('moveLocalIntoRemote', () => {
  it('a task added locally while the merge is running is not lost', async () => {
    await localRepo.save(t('a'))
    let injected = false
    const remote = memoryRepo([], async () => {
      if (!injected) {
        injected = true
        await localRepo.save(t('late'))
      }
    })
    await moveLocalIntoRemote(localRepo, remote)
    expect(remote.all.map((x) => x.id).sort()).toEqual(['a', 'late'])
    expect(await localRepo.list()).toEqual([])
  })

  it('a failed remote save keeps every local task', async () => {
    await localRepo.save(t('a'))
    const remote = memoryRepo([], async () => {
      throw new Error('offline')
    })
    await expect(moveLocalIntoRemote(localRepo, remote)).rejects.toThrow('offline')
    expect((await localRepo.list()).map((x) => x.id)).toEqual(['a'])
  })
})
