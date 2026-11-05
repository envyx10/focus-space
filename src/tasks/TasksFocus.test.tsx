import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TasksPanel from './TasksPanel'
import type { Task } from './types'

const noop = async () => {}
const task = (id: string, text: string, extra: Partial<Task> = {}): Task => ({ id, text, done: false, active: false, createdAt: '2026-10-30T09:00:00.000Z', ...extra })
const base = { add: noop, toggle: noop, edit: noop, remove: noop, setActive: noop }

describe('tasks full screen', () => {
  it('opens from the panel, shows the description and closes with Esc', async () => {
    render(<TasksPanel tasks={[task('1', 'Uno', { description: 'notas de uno' })]} synced describe={noop} {...base} />)
    await userEvent.click(screen.getByRole('button', { name: /Pantalla completa/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Descripción de la tarea')).toHaveValue('notas de uno')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('saves the description when you leave the field', async () => {
    const describe = vi.fn(noop)
    render(<TasksPanel tasks={[task('1', 'Uno')]} synced describe={describe} {...base} />)
    await userEvent.click(screen.getByRole('button', { name: /Pantalla completa/ }))
    await userEvent.type(screen.getByLabelText('Descripción de la tarea'), 'hola')
    await userEvent.click(screen.getByRole('button', { name: 'Marcar como hecha' }))
    expect(describe).toHaveBeenCalledWith('1', 'hola')
  })

  it('has no full-screen button without a describe handler', () => {
    render(<TasksPanel tasks={[]} synced {...base} />)
    expect(screen.queryByRole('button', { name: /Pantalla completa/ })).not.toBeInTheDocument()
  })
})
