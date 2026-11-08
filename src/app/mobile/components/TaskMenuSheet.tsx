import { useRef } from 'react'
import { exportHtml, exportJson, exportWord, IMPORT_ACCEPT } from '@/features/tasks/export/files'
import type { Task } from '@/features/tasks/types'
import { useI18n } from '@/i18n'
import Sheet from './Sheet'

type Props = {
  open: boolean
  onClose: () => void
  tasks: Task[]
  /** More than one pending task and at least one with a priority. */
  canSort: boolean
  onClearDone: () => void
  onSort: () => void
  onImport: (file: File) => void
}

/** The list's "…" menu: clear the done tasks, sort by priority, export and import. Every choice closes it. */
export default function TaskMenuSheet({ open, onClose, tasks, canSort, onClearDone, onSort, onImport }: Props) {
  const { t, lang } = useI18n()
  const file = useRef<HTMLInputElement>(null)
  const doneCount = tasks.filter((k) => k.done).length
  const then = (run: () => unknown) => () => {
    run()
    onClose()
  }
  const exports = [
    { label: t('m.exportWord'), run: () => exportWord(tasks, t, lang) },
    { label: t('m.exportHtml'), run: () => exportHtml(tasks, t, lang) },
    { label: t('m.exportJson'), run: () => exportJson(tasks) },
  ]

  return (
    <Sheet open={open} onClose={onClose} title={t('m.listMenu')}>
      <div className="m-menu">
        <button disabled={doneCount === 0} onClick={then(onClearDone)}>
          {t('tasks.clearDone', { n: doneCount })}
        </button>
        <button disabled={!canSort} onClick={then(onSort)}>
          {t('tasks.sortPriority')}
        </button>
        {exports.map((x) => (
          <button key={x.label} disabled={tasks.length === 0} onClick={then(x.run)}>
            {x.label}
          </button>
        ))}
        <button onClick={() => file.current?.click()}>{t('tasks.import')}</button>
        <input
          ref={file}
          type="file"
          accept={IMPORT_ACCEPT}
          hidden
          aria-label={t('tasks.importLabel')}
          onChange={(e) => {
            const picked = e.target.files?.[0]
            e.target.value = ''
            onClose()
            if (picked) onImport(picked)
          }}
        />
      </div>
    </Sheet>
  )
}
