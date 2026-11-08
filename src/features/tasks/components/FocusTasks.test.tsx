import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Task } from '@/features/tasks/types'
import FocusTasks from './FocusTasks'

const task = (id: string, text: string, over: Partial<Task> = {}): Task => ({ id, text, done: false, active: false, createdAt: '2026-11-04T09:00:00Z', ...over })

describe('FocusTasks', () => {
  it('lists the tasks read-only, marking the active one and counting the pending', () => {
    render(<FocusTasks tasks={[task('1', 'Hecha', { done: true }), task('2', 'En curso', { active: true }), task('3', 'Pendiente')]} />)
    expect(screen.getByText('Pendientes / 2')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('En curso').closest('li')).toHaveAttribute('aria-current', 'true')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('renders nothing without tasks', () => {
    const { container } = render(<FocusTasks tasks={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
