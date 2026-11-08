import { asPriority, makeTask } from './transfer'
import type { Task } from './types'

/**
 * Tasks as a Word document and back, with no library: a .docx is a ZIP of a few XML files.
 *
 * Each task is a "Heading 1" (its title), a grey line with its state, priority and date, then its description as it
 * was written (Markdown), one paragraph per line. Reading takes the same shape back, so a document edited in Word,
 * LibreOffice or Google Docs imports with those edits: every Heading 1 starts a task, the paragraphs under it are its
 * description.
 */

export type DocxLabels = { title: string; exported: string; done: string; pending: string; priority: string; high: string; medium: string; low: string }

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

// ---------------------------------------------------------------- ZIP (stored, no compression: the files are small)

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(data: Uint8Array): number {
  let c = 0xffffffff
  for (const b of data) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

export function zip(files: Record<string, string>): Uint8Array {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  for (const [path, text] of Object.entries(files)) {
    const name = enc.encode(path)
    const data = enc.encode(text)
    const crc = crc32(data)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // UTF-8 names
    local.setUint32(14, crc, true)
    local.setUint32(18, data.length, true)
    local.setUint32(22, data.length, true)
    local.setUint16(26, name.length, true)
    parts.push(new Uint8Array(local.buffer), name, data)
    const dir = new DataView(new ArrayBuffer(46))
    dir.setUint32(0, 0x02014b50, true)
    dir.setUint16(4, 20, true)
    dir.setUint16(6, 20, true)
    dir.setUint16(8, 0x0800, true)
    dir.setUint32(16, crc, true)
    dir.setUint32(20, data.length, true)
    dir.setUint32(24, data.length, true)
    dir.setUint16(28, name.length, true)
    dir.setUint32(42, offset, true)
    central.push(new Uint8Array(dir.buffer), name)
    offset += 30 + name.length + data.length
  }
  const size = central.reduce((n, p) => n + p.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, central.length / 2, true)
  end.setUint16(10, central.length / 2, true)
  end.setUint32(12, size, true)
  end.setUint32(16, offset, true)
  const all = [...parts, ...central, new Uint8Array(end.buffer)]
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of all) {
    out.set(p, at)
    at += p.length
  }
  return out
}

/** The text of the named files in a ZIP. Stored and deflated entries (what Word and others write). */
export async function unzip(buf: ArrayBuffer, wanted: string[]): Promise<Record<string, string>> {
  const v = new DataView(buf)
  let eocd = -1
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('not a zip')
  const count = v.getUint16(eocd + 10, true)
  let p = v.getUint32(eocd + 16, true)
  const dec = new TextDecoder()
  const out: Record<string, string> = {}
  for (let n = 0; n < count && p + 46 <= buf.byteLength; n++) {
    if (v.getUint32(p, true) !== 0x02014b50) break
    const method = v.getUint16(p + 10, true)
    const size = v.getUint32(p + 20, true)
    const nameLen = v.getUint16(p + 28, true)
    const extraLen = v.getUint16(p + 30, true)
    const commentLen = v.getUint16(p + 32, true)
    const local = v.getUint32(p + 42, true)
    const name = dec.decode(new Uint8Array(buf, p + 46, nameLen))
    p += 46 + nameLen + extraLen + commentLen
    if (!wanted.includes(name)) continue
    const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true)
    const raw = new Uint8Array(buf, start, size)
    if (method === 0) out[name] = dec.decode(raw)
    else if (method === 8) out[name] = await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text()
  }
  return out
}

// ---------------------------------------------------------------- writing

// XML 1.0 can't hold most control characters, even escaped.
// eslint-disable-next-line no-control-regex
const xml = (s: string) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function para(text: string, style?: string): string {
  const pPr = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''
  if (!text) return `<w:p>${pPr}</w:p>`
  const runs = text
    .split('\t')
    .map((s) => (s ? `<w:t xml:space="preserve">${xml(s)}</w:t>` : ''))
    .join('<w:tab/>')
  return `<w:p>${pPr}<w:r>${runs}</w:r></w:p>`
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="60" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="60"/></w:pPr><w:rPr><w:b/><w:sz w:val="44"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="40"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="30"/></w:rPr></w:style><w:style w:type="paragraph" w:customStyle="1" w:styleId="FsMeta"><w:name w:val="Focus Space meta"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:spacing w:after="160"/></w:pPr><w:rPr><w:color w:val="808080"/><w:sz w:val="18"/></w:rPr></w:style></w:styles>`

const day = (iso: string) => iso.slice(0, 10)

/** `l.exported` is the finished line under the title ("Exported on 8/11/2026"). */
export function tasksToDocx(tasks: Task[], l: DocxLabels): Blob {
  const body = [para(l.title, 'Title'), para(l.exported, 'FsMeta')]
  for (const k of tasks) {
    body.push(para(k.text, 'Heading1'))
    const meta = [k.done ? `☑ ${l.done}` : `☐ ${l.pending}`, ...(k.priority ? [`${l.priority}: ${l[k.priority]}`] : []), day(k.createdAt)]
    body.push(para(meta.join(' · '), 'FsMeta'))
    for (const line of (k.description ?? '').replace(/\r\n?/g, '\n').split('\n')) body.push(para(line))
  }
  const files = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    'word/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'word/styles.xml': STYLES,
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W}"><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`,
  }
  return new Blob([zip(files) as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

// ---------------------------------------------------------------- reading

/** A paragraph's text: runs, tabs and line breaks, leaving out deleted (tracked) text and tab-stop definitions. */
function text(p: Element): string {
  let s = ''
  for (const el of p.getElementsByTagNameNS(W, '*')) {
    if (hasAncestor(el, p, ['pPr', 'rPr', 'del'])) continue
    if (el.localName === 't') s += el.textContent ?? ''
    else if (el.localName === 'tab') s += '\t'
    else if (el.localName === 'br' || el.localName === 'cr') s += '\n'
  }
  return s
}

function hasAncestor(el: Element, stop: Element, names: string[]): boolean {
  for (let a = el.parentElement; a && a !== stop; a = a.parentElement) if (a.namespaceURI === W && names.includes(a.localName)) return true
  return false
}

const styleOf = (p: Element) => {
  for (const c of p.children) {
    if (c.localName !== 'pPr') continue
    for (const s of c.children) if (s.localName === 'pStyle') return s.getAttributeNS(W, 'val') ?? s.getAttribute('w:val') ?? ''
  }
  return ''
}

const PRIORITY_WORDS: [RegExp, 'high' | 'medium' | 'low'][] = [
  [/\b(alta|high)\b/i, 'high'],
  [/\b(media|medium)\b/i, 'medium'],
  [/\b(baja|low)\b/i, 'low'],
]

/** The tasks in a Word document: each "Heading 1" is one, with the paragraphs under it as its description. */
export async function docxToTasks(buf: ArrayBuffer): Promise<Task[]> {
  const files = await unzip(buf, ['word/document.xml', 'word/styles.xml'])
  if (!files['word/document.xml']) return []
  const parse = (s: string) => new DOMParser().parseFromString(s, 'application/xml')
  // Style ids are translated in some Word versions ("Ttulo1"); the names of built-in styles never are.
  const names = new Map<string, string>()
  if (files['word/styles.xml']) {
    for (const s of parse(files['word/styles.xml']).getElementsByTagNameNS(W, 'style')) {
      const id = s.getAttributeNS(W, 'styleId') ?? ''
      const name = [...s.children].find((c) => c.localName === 'name')
      names.set(id, (name?.getAttributeNS(W, 'val') ?? '').toLowerCase())
    }
  }
  const isHeading = (id: string) => id === 'Heading1' || names.get(id) === 'heading 1'
  const isMeta = (id: string) => id === 'FsMeta' || names.get(id) === 'focus space meta'

  type Draft = { title: string; meta?: string; lines: string[] }
  const drafts: Draft[] = []
  for (const p of parse(files['word/document.xml']).getElementsByTagNameNS(W, 'p')) {
    const style = styleOf(p)
    const line = text(p)
    if (isHeading(style)) {
      drafts.push({ title: line.replace(/\s+/g, ' ').trim(), lines: [] })
      continue
    }
    const cur = drafts[drafts.length - 1]
    if (!cur) continue // the document's title and date
    if (cur.meta === undefined && !cur.lines.length && (isMeta(style) || /^[☐☑]/.test(line.trim()))) cur.meta = line
    else cur.lines.push(line)
  }

  const out: Task[] = []
  for (const d of drafts) {
    const meta = d.meta ?? ''
    const lines = d.lines.join('\n').replace(/^\n+|\s+$/g, '')
    const priority = asPriority(PRIORITY_WORDS.find(([re]) => re.test(meta.replace(/^[^·]*·/, '')))?.[1])
    const task = makeTask(d.title, meta.includes('☑'), /\d{4}-\d{2}-\d{2}/.exec(meta)?.[0], lines, priority)
    if (task) out.push(task)
  }
  return out
}
