import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TasksPanel from './TasksPanel'
import type { Task } from './types'
// Loaded up front so the view's lazy import resolves at once instead of racing the test timeouts.
import './Markdown'

const noop = async () => {}
const task = (id: string, text: string, extra: Partial<Task> = {}): Task => ({ id, text, done: false, active: false, createdAt: '2026-10-30T09:00:00.000Z', ...extra })
const base = { add: noop, toggle: noop, edit: noop, remove: noop, setActive: noop }

describe('tasks full screen', () => {
  it('opens from the panel, shows the description formatted, edits it raw and closes with Esc', async () => {
    render(<TasksPanel tasks={[task('1', 'Uno', { description: 'notas **de** uno' })]} synced describe={noop} {...base} />)
    await userEvent.click(screen.getByRole('button', { name: /Pantalla completa/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect((await screen.findByText('de')).tagName).toBe('STRONG')
    expect(screen.queryByLabelText('Descripción de la tarea')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(screen.getByLabelText('Descripción de la tarea')).toHaveValue('notas **de** uno')
    expect(screen.getByLabelText('Descripción de la tarea')).toHaveFocus()
    await userEvent.click(screen.getByRole('button', { name: 'Ver' }))
    expect((await screen.findByText('de')).tagName).toBe('STRONG')
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

  it('imports a .md file after what is already written, and refuses other files', async () => {
    const describe = vi.fn(noop)
    render(<TasksPanel tasks={[task('1', 'Uno', { description: 'antes' })]} synced describe={describe} {...base} />)
    await userEvent.click(screen.getByRole('button', { name: /Pantalla completa/ }))
    const picker = screen.getByRole('dialog').querySelector<HTMLInputElement>('input[type=file]')!
    await userEvent.upload(picker, new File(['## Nuevo\r\ntexto'], 'notas.md', { type: 'text/markdown' }))
    expect((await screen.findByRole('heading', { name: 'Nuevo' })).tagName).toBe('H2')
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(screen.getByLabelText('Descripción de la tarea')).toHaveValue('antes\n\n## Nuevo\ntexto')
    fireEvent.drop(screen.getByRole('article'), { dataTransfer: { files: [new File(['x'], 'foto.png')], types: ['Files'] } })
    expect(await screen.findByText('Solo archivos .md, .markdown o .txt')).toBeInTheDocument()
  })

  it('has no full-screen button without a describe handler', () => {
    render(<TasksPanel tasks={[]} synced {...base} />)
    expect(screen.queryByRole('button', { name: /Pantalla completa/ })).not.toBeInTheDocument()
  })
})
