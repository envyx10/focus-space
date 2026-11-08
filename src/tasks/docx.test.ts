import { describe, expect, it } from 'vitest'
import { docxToTasks, tasksToDocx, unzip, zip, type DocxLabels } from './docx'
import type { Task } from './types'

const ES: DocxLabels = { title: 'Focus/Space — Tareas', exported: 'Exportado el 8/11/2026', done: 'Hecha', pending: 'Pendiente', priority: 'Prioridad', high: 'Alta', medium: 'Media', low: 'Baja' }

const task = (text: string, extra: Partial<Task> = {}): Task => ({ id: text, text, done: false, active: false, createdAt: '2026-10-30T09:00:00.000Z', ...extra })

describe('docx', () => {
  it('zips and unzips text files (stored)', async () => {
    const z = zip({ 'a.txt': 'hola ñ', 'dir/b.xml': '<x/>' })
    expect(await unzip(z.buffer as ArrayBuffer, ['dir/b.xml', 'a.txt'])).toEqual({ 'a.txt': 'hola ñ', 'dir/b.xml': '<x/>' })
  })

  it('round-trips title, state, priority, date and the whole Markdown description', async () => {
    const desc = '## Pasos\n\n- uno **importante**\n- dos\n\n\tsangrado & <raro>\n```js\nconst a = 1\n```'
    const tasks = [task('Preparar Q4', { description: desc, priority: 'high' }), task('Llamar', { done: true }), task('Media hora de lectura', { priority: 'low' })]
    const blob = tasksToDocx(tasks, ES)
    const back = await docxToTasks(await blob.arrayBuffer())
    expect(back.map(({ text, done, description, priority, createdAt }) => ({ text, done, description, priority, createdAt }))).toEqual([
      { text: 'Preparar Q4', done: false, description: desc, priority: 'high', createdAt: '2026-10-30T00:00:00.000Z' },
      { text: 'Llamar', done: true, description: undefined, priority: undefined, createdAt: '2026-10-30T00:00:00.000Z' },
      // "Media" in the title is not read as the priority
      { text: 'Media hora de lectura', done: false, description: undefined, priority: 'low', createdAt: '2026-10-30T00:00:00.000Z' },
    ])
    // fresh ids, never the exported ones
    expect(back.every((k) => !tasks.some((t) => t.id === k.id))).toBe(true)
  })

  it('reads a document written elsewhere: any "heading 1" starts a task, a translated style id still counts', async () => {
    const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    const doc = `<w:document xmlns:w="${W}"><w:body>
      <w:p><w:r><w:t>Intro que no es tarea</w:t></w:r></w:p>
      <w:p><w:pPr><w:pStyle w:val="Ttulo1"/></w:pPr><w:r><w:t>Comprar pan</w:t></w:r></w:p>
      <w:p><w:r><w:t>integral</w:t></w:r><w:r><w:delText>borrado</w:delText></w:r></w:p>
    </w:body></w:document>`
    const styles = `<w:styles xmlns:w="${W}"><w:style w:styleId="Ttulo1"><w:name w:val="heading 1"/></w:style></w:styles>`
    const z = zip({ 'word/document.xml': doc, 'word/styles.xml': styles })
    const back = await docxToTasks(z.buffer as ArrayBuffer)
    expect(back.map((k) => [k.text, k.description])).toEqual([['Comprar pan', 'integral']])
  })
})
