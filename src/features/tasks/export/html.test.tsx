import { describe, expect, it } from 'vitest'
import type { Task } from '@/features/tasks/types'
import { readTasksFile } from './files'
import { tasksToHtml, type HtmlLabels } from './html'

const ES: HtmlLabels = { lang: 'es', title: 'Focus/Space — Tareas', exported: 'Exportado el 8/11/2026', done: 'Hecha', pending: 'Pendiente', priority: 'Prioridad', high: 'Alta', medium: 'Media', low: 'Baja' }
const task = (text: string, extra: Partial<Task> = {}): Task => ({ id: text, text, done: false, active: false, createdAt: '2026-10-30T09:00:00.000Z', ...extra })

describe('web page export', () => {
  const tasks = [
    task('Preparar <Q4>', { priority: 'high', description: '## Pasos\n\n- uno **importante**\n\n<script>alert(1)</script> [x](javascript:alert(1)) </script>' }),
    task('Llamar', { done: true }),
  ]

  it('reads as a page: titles, state, priority and the formatted description, with nothing that can run', async () => {
    const html = await tasksToHtml(tasks, ES).text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    expect([...doc.querySelectorAll('section > h2')].map((h) => h.textContent)).toEqual(['AltaPreparar <Q4>', 'Llamar'])
    expect(doc.querySelector('section .meta')?.textContent).toBe('☐ Pendiente · Prioridad: Alta · 2026-10-30')
    expect(doc.querySelector('.desc strong')?.textContent).toBe('importante')
    // the only script is the JSON data block, and no link points at javascript:
    expect([...doc.querySelectorAll('script')].map((s) => s.type)).toEqual(['application/json'])
    expect(doc.querySelector('a[href^="javascript"]')).toBeNull()
  })

  it('imports back exactly what was exported', async () => {
    const file = new File([await tasksToHtml(tasks, ES).text()], 'tareas.html', { type: 'text/html' })
    const back = await readTasksFile(file)
    expect(back.map(({ text, done, description, priority }) => ({ text, done, description, priority }))).toEqual(
      tasks.map(({ text, done, description, priority }) => ({ text, done, description, priority })),
    )
  })

  it('finds nothing to import in any other web page', async () => {
    expect(await readTasksFile(new File(['<html><body><h1>Hola</h1></body></html>'], 'otra.html'))).toEqual([])
  })
})
