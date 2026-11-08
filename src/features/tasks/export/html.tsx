import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Task } from '@/features/tasks/types'
import { serializeTasks } from './transfer'

/**
 * Tasks as one self-contained web page: opens in any browser with nothing installed, prints or saves as PDF from
 * there, and carries this app's JSON inside so importing it brings the tasks back exactly.
 */

export type HtmlLabels = { lang: string; title: string; exported: string; done: string; pending: string; priority: string; high: string; medium: string; low: string }

/** Where the page keeps the tasks for importing: a JSON block browsers never run. files.ts reads it back by this id. */
const DATA_ID = 'focus-space-tasks'

/** A description's Markdown as HTML, drawn with the React the app already runs (no server renderer to download). */
function markdownHtml(text: string): string {
  const box = document.createElement('div')
  const root = createRoot(box)
  flushSync(() => root.render(<ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>))
  const html = box.innerHTML
  root.unmount()
  return html
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const STYLE = `
:root { color-scheme: light; }
body { font: 15px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1b1b1b; background: #fff; max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }
h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: -0.02em; }
.meta { color: #777; font-size: 12px; margin: 0 0 20px; }
section { border-top: 1px solid #e3e3e3; padding: 18px 0 6px; break-inside: avoid-page; }
h2 { font-size: 19px; margin: 0 0 4px; }
section.done > h2 { color: #888; text-decoration: line-through; }
.pri { display: inline-block; margin-right: 8px; padding: 0 5px; border: 1px solid currentColor; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; vertical-align: 3px; }
.pri-high { color: #d13b12; } .pri-medium { color: #555; } .pri-low { color: #999; }
.desc { overflow-wrap: anywhere; }
.desc h1, .desc h2, .desc h3, .desc h4 { font-size: 16px; margin: 14px 0 4px; }
.desc img { max-width: 100%; }
.desc pre { background: #f5f5f5; padding: 10px 12px; overflow-x: auto; }
.desc code { font: 13px ui-monospace, Consolas, monospace; }
.desc table { border-collapse: collapse; } .desc th, .desc td { border: 1px solid #ddd; padding: 4px 8px; }
@media print { body { padding: 0; } }
`

export function tasksToHtml(tasks: Task[], l: HtmlLabels): Blob {
  const sections = tasks.map((k) => {
    const tag = k.priority ? `<span class="pri pri-${k.priority}">${esc(l[k.priority])}</span>` : ''
    const meta = [k.done ? `☑ ${l.done}` : `☐ ${l.pending}`, ...(k.priority ? [`${l.priority}: ${l[k.priority]}`] : []), k.createdAt.slice(0, 10)].map(esc).join(' · ')
    // react-markdown never renders raw HTML and drops javascript: links, so a description can't inject anything here.
    const desc = k.description?.trim() ? `<div class="desc">${markdownHtml(k.description)}</div>` : ''
    return `<section${k.done ? ' class="done"' : ''}><h2>${tag}${esc(k.text)}</h2><p class="meta">${meta}</p>${desc}</section>`
  })
  // "<" escaped so no text inside the JSON can close the script block.
  const data = serializeTasks(tasks).replace(/</g, '\\u003c')
  const page = `<!doctype html>
<html lang="${esc(l.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(l.title)}</title><style>${STYLE}</style></head>
<body><h1>${esc(l.title)}</h1><p class="meta">${esc(l.exported)}</p>
${sections.join('\n')}
<script type="application/json" id="${DATA_ID}">${data}</script>
</body></html>`
  return new Blob([page], { type: 'text/html;charset=utf-8' })
}
