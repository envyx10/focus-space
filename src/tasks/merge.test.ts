import { describe, expect, it } from 'vitest'
import { mergeTasks } from './merge'
import type { Task } from './types'

const t = (id: string, text: string, extra: Partial<Task> = {}): Task => ({
  id,
  text,
  done: false,
  active: false,
  createdAt: '2026-10-30T09:00:00.000Z',
  ...extra,
})

describe('mergeTasks', () => {
  it('union by id, remote wins', () => {
    const out = mergeTasks([t('a', 'local'), t('b', 'B')], [t('a', 'remote'), t('c', 'C')])
    expect(out.map((x) => [x.id, x.text]).sort()).toEqual([
      ['a', 'remote'],
      ['b', 'B'],
      ['c', 'C'],
    ])
  })

  it('same text is not duplicated', () => {
    const out = mergeTasks([t('l', ' Leer ')], [t('r', 'leer')])
    expect(out.map((x) => x.id)).toEqual(['r'])
  })

  it('at most one active, remote preferred', () => {
    const out = mergeTasks([t('l', 'local', { active: true })], [t('r', 'remote', { active: true })])
    expect(out.filter((x) => x.active).map((x) => x.id)).toEqual(['r'])
  })

  it('keeps a local active task when remote has none', () => {
    const out = mergeTasks([t('l', 'local', { active: true })], [t('r', 'remote')])
    expect(out.filter((x) => x.active).map((x) => x.id)).toEqual(['l'])
  })

  it("a local duplicate (same text) hands its notes to the account's copy instead of losing them", () => {
    const out = mergeTasks([t('l', 'Leer', { description: 'mis notas' })], [t('r', 'leer'), t('s', 'Otra', { description: 'ya' })])
    expect(out.map((x) => [x.id, x.description])).toEqual([
      ['r', 'mis notas'],
      ['s', 'ya'],
    ])
  })
})
