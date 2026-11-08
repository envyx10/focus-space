import type { Task } from '@/features/tasks/types'
import type { T } from '@/i18n'
import { capImport, parseImport, serializeTasks } from './transfer'

const today = () => new Date().toISOString().slice(0, 10)

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** The words a Word or web export is written with, in the app's language. */
function labels(t: T, lang: string) {
  return {
    lang,
    title: t('tasks.word.title'),
    exported: t('tasks.word.exported', { date: new Date().toLocaleDateString(lang) }),
    done: t('tasks.focus.statusDone'),
    pending: t('tasks.focus.statusPending'),
    priority: t('tasks.priority'),
    high: t('tasks.priority.high'),
    medium: t('tasks.priority.medium'),
    low: t('tasks.priority.low'),
  }
}

export function exportJson(tasks: Task[]): void {
  download(new Blob([serializeTasks(tasks)], { type: 'application/json' }), 'focus-space-tareas.json')
}

/** A Word copy of the tasks: titles, state, priority and full descriptions. The writer only loads when asked for. */
export async function exportWord(tasks: Task[], t: T, lang: string): Promise<void> {
  const { tasksToDocx } = await import('./docx')
  download(tasksToDocx(tasks, labels(t, lang)), `focus-space-tareas-${today()}.docx`)
}

/** The same as a web page, for computers without Word: any browser opens it, prints it or saves it as PDF. */
export async function exportHtml(tasks: Task[], t: T, lang: string): Promise<void> {
  const { tasksToHtml } = await import('./html')
  download(tasksToHtml(tasks, labels(t, lang)), `focus-space-tareas-${today()}.html`)
}

/** The tasks JSON a page from exportHtml carries (see DATA_ID in html.tsx), or null for any other page. */
function htmlData(html: string): string | null {
  return new DOMParser().parseFromString(html, 'text/html').getElementById('focus-space-tasks')?.textContent ?? null
}

/** Tasks from a picked file: a Word document (ours or any with "Heading 1" titles), our web page, this app's JSON, or a plain list. */
export async function readTasksFile(f: File): Promise<Task[]> {
  if (/\.docx$/i.test(f.name)) {
    const { docxToTasks } = await import('./docx')
    return capImport(await docxToTasks(await f.arrayBuffer()).catch(() => []))
  }
  const text = await f.text()
  if (/\.html?$/i.test(f.name)) {
    const data = htmlData(text)
    return data ? parseImport(data) : []
  }
  return parseImport(text)
}

export const IMPORT_ACCEPT = '.docx,.html,.htm,.json,.txt,.md,text/plain,text/html,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
