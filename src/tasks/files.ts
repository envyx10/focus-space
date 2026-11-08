import type { T } from '../i18n'
import { capImport, parseImport, serializeTasks } from './transfer'
import type { Task } from './types'

const today = () => new Date().toISOString().slice(0, 10)

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function exportJson(tasks: Task[]): void {
  download(new Blob([serializeTasks(tasks)], { type: 'application/json' }), 'focus-space-tareas.json')
}

/** A Word copy of the tasks: titles, state, priority and full descriptions. The writer only loads when asked for. */
export async function exportWord(tasks: Task[], t: T, lang: string): Promise<void> {
  const { tasksToDocx } = await import('./docx')
  const blob = tasksToDocx(tasks, {
    title: t('tasks.word.title'),
    exported: t('tasks.word.exported', { date: new Date().toLocaleDateString(lang) }),
    done: t('tasks.focus.statusDone'),
    pending: t('tasks.focus.statusPending'),
    priority: t('tasks.priority'),
    high: t('tasks.priority.high'),
    medium: t('tasks.priority.medium'),
    low: t('tasks.priority.low'),
  })
  download(blob, `focus-space-tareas-${today()}.docx`)
}

/** Tasks from a picked file: a Word document (ours or any with "Heading 1" titles), this app's JSON, or a plain list. */
export async function readTasksFile(f: File): Promise<Task[]> {
  if (/\.docx$/i.test(f.name)) {
    const { docxToTasks } = await import('./docx')
    return capImport(await docxToTasks(await f.arrayBuffer()).catch(() => []))
  }
  return parseImport(await f.text())
}

export const IMPORT_ACCEPT = '.docx,.json,.txt,.md,text/plain,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
