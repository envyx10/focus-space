import { useState } from 'react'
import { useI18n } from '../i18n'
import { exportHtml, exportJson, exportWord } from './files'
import type { Task } from './types'

/**
 * "Exportar", which opens its three formats right after it in the same row: Word, a web page (any computer opens
 * it, prints it or saves it as PDF) and the JSON copy. Picking one downloads it and folds the row back.
 */
export default function ExportMenu({ tasks, className }: { tasks: Task[]; className?: string }) {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  if (!tasks.length) return null
  const pick = (run: () => unknown) => () => {
    setOpen(false)
    run()
  }
  const formats = [
    { label: t('tasks.exportWord'), hint: t('tasks.exportWordLabel'), run: () => exportWord(tasks, t, lang) },
    { label: t('tasks.exportHtml'), hint: t('tasks.exportHtmlLabel'), run: () => exportHtml(tasks, t, lang) },
    { label: t('tasks.exportJson'), hint: t('tasks.exportJsonLabel'), run: () => exportJson(tasks) },
  ]
  return (
    <>
      <button
        className={className}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          // Esc folds the formats back first (the full-screen view would close on it otherwise).
          if (e.key === 'Escape' && open) {
            e.stopPropagation()
            setOpen(false)
          }
        }}
      >
        {t('tasks.export')}
      </button>
      {open &&
        formats.map((f) => (
          <button key={f.label} className={`${className ?? ''} export-format`.trim()} title={f.hint} aria-label={`${f.label}: ${f.hint}`} onClick={pick(f.run)}>
            {f.label}
          </button>
        ))}
    </>
  )
}
