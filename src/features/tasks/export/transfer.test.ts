import { describe, expect, it } from 'vitest'
import type { Task } from '@/features/tasks/types'
import { parseImport, serializeTasks } from './transfer'

const task = (text: string, done = false): Task => ({ id: crypto.randomUUID(), text, done, active: true, createdAt: '2026-10-30T09:00:00.000Z' })

describe('task transfer', () => {
  it('round-trips an export with fresh ids and no active task', () => {
    const src = [task('uno'), task('dos', true)]
    const back = parseImport(serializeTasks(src))
    expect(back.map((t) => [t.text, t.done])).toEqual([['uno', false], ['dos', true]])
    expect(back.every((t) => !t.active && !src.some((s) => s.id === t.id))).toBe(true)
  })

  it('reads a plain list, with markdown checkboxes and bullets', () => {
    const back = parseImport('- [ ] repasar\n* [x] hecho\n\nsuelta\n')
    expect(back.map((t) => [t.text, t.done])).toEqual([['repasar', false], ['hecho', true], ['suelta', false]])
  })

  it('reads a one-line file that happens to be valid JSON, and stores dates as ISO', () => {
    expect(parseImport('42').map((t) => t.text)).toEqual(['42'])
    expect(parseImport('true').map((t) => t.text)).toEqual(['true'])
    const [t] = parseImport(JSON.stringify([{ text: 'a', createdAt: 'Jan 5, 2020 10:00:00 UTC' }]))
    expect(t.createdAt).toBe('2020-01-05T10:00:00.000Z')
  })

  it('ignores junk entries and caps the length of a task', () => {
    const back = parseImport(JSON.stringify([{ text: 'x'.repeat(900) }, { nope: 1 }, 5, '  ', 'ok']))
    expect(back).toHaveLength(2)
    expect(back[0].text).toHaveLength(500)
  })
})
