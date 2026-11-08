import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '@/features/tasks/types'
import TasksPanel from './TasksPanel'

const noop = async () => {}
const actions = { add: noop, toggle: noop, edit: noop, remove: noop, setActive: noop }
const task = (id: string, text: string, extra: Partial<Task> = {}): Task => ({
  id,
  text,
  done: false,
  active: false,
  createdAt: '2026-10-30T09:00:00.000Z',
  ...extra,
})

describe('TasksPanel', () => {
  it('shows local-only notice when not synced', () => {
    render(<TasksPanel tasks={[]} synced={false} {...actions} />)
    expect(screen.getByText('Guardado solo en este navegador · Inicia sesión para sincronizar')).toBeInTheDocument()
  })

  it('hides the notice when synced', () => {
    render(<TasksPanel tasks={[]} synced {...actions} />)
    expect(screen.queryByText(/Guardado solo en este navegador/)).not.toBeInTheDocument()
  })

  it('shows a save error and limits text to the 500 chars the database accepts', () => {
    render(<TasksPanel tasks={[]} synced saveError {...actions} />)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar')
    expect(screen.getByPlaceholderText('+ Nueva tarea')).toHaveAttribute('maxLength', '500')
  })

  it('↑ from the new-task box then Supr deletes the last task', async () => {
    const remove = vi.fn(noop)
    render(<TasksPanel tasks={[task('1', 'Uno'), task('2', 'Dos')]} synced {...actions} remove={remove} />)
    await userEvent.click(screen.getByPlaceholderText('+ Nueva tarea'))
    await userEvent.keyboard('{ArrowUp}{Delete}')
    expect(remove).toHaveBeenCalledWith('2')
    expect(screen.getByPlaceholderText('+ Nueva tarea')).toHaveFocus()
  })

  it('↑ lands on the last delete button, and Enter on it deletes', async () => {
    const remove = vi.fn(noop)
    render(<TasksPanel tasks={[task('1', 'Uno'), task('2', 'Dos')]} synced {...actions} remove={remove} />)
    await userEvent.click(screen.getByPlaceholderText('+ Nueva tarea'))
    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('button', { name: 'Borrar Dos' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(remove).toHaveBeenCalledWith('2')
    expect(screen.getByPlaceholderText('+ Nueva tarea')).toHaveFocus()
  })

  it('Backspace in the empty new-task box deletes the last task, but not while typing', async () => {
    const remove = vi.fn(noop)
    render(<TasksPanel tasks={[task('1', 'Uno'), task('2', 'Dos')]} synced {...actions} remove={remove} />)
    await userEvent.click(screen.getByPlaceholderText('+ Nueva tarea'))
    await userEvent.keyboard('ab{Backspace}{Backspace}')
    expect(remove).not.toHaveBeenCalled()
    await userEvent.keyboard('{Backspace}')
    expect(remove).toHaveBeenCalledWith('2')
  })

  it('Ctrl+Z after a delete restores the task', async () => {
    const restore = vi.fn(noop)
    render(<TasksPanel tasks={[task('1', 'Uno')]} synced {...actions} restore={restore} />)
    await userEvent.click(screen.getByPlaceholderText('+ Nueva tarea'))
    await userEvent.keyboard('{Backspace}{Control>}z{/Control}')
    expect(restore).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }))
    expect(screen.queryByText('Tarea borrada')).not.toBeInTheDocument()
  })

  it('Ctrl+Z in a field with text is left to the field', async () => {
    const restore = vi.fn(noop)
    render(<TasksPanel tasks={[task('1', 'Uno')]} synced {...actions} restore={restore} />)
    await userEvent.click(screen.getByPlaceholderText('+ Nueva tarea'))
    await userEvent.keyboard('{Backspace}ab{Control>}z{/Control}')
    expect(restore).not.toHaveBeenCalled()
  })

  it('numbers rows and counts pending', () => {
    render(<TasksPanel tasks={[task('1', 'Uno'), task('2', 'Dos', { done: true })]} synced {...actions} />)
    expect(screen.getAllByRole('checkbox').map((c) => c.textContent)).toEqual(['01', '02'])
    expect(screen.getByText('Pendientes / 1')).toBeInTheDocument()
  })

  it('Enter in the new-task input adds and clears it', async () => {
    const add = vi.fn(noop)
    render(<TasksPanel tasks={[]} synced {...actions} add={add} />)
    const input = screen.getByPlaceholderText('+ Nueva tarea')
    await userEvent.type(input, 'Revisar PR{Enter}')
    expect(add).toHaveBeenCalledWith('Revisar PR')
    expect(input).toHaveValue('')
  })

  it('double-click edits, Escape cancels', async () => {
    const edit = vi.fn(noop)
    render(<TasksPanel tasks={[task('1', 'Uno')]} synced {...actions} edit={edit} />)
    await userEvent.dblClick(screen.getByText('Uno'))
    const field = screen.getByDisplayValue('Uno')
    await userEvent.type(field, ' más{Escape}')
    expect(edit).not.toHaveBeenCalled()
    expect(screen.getByText('Uno')).toBeInTheDocument()
  })
})
