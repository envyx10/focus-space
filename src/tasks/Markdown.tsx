import { Fragment, type ReactNode } from 'react'

// Only these schemes become clickable: a `javascript:` link in a synced description must never run.
const SAFE_URL = /^(https?:|mailto:)/i
// `code` · [text](url) · bare URL · **bold** · ~~strike~~ · *italic* · _italic_ (not inside words like snake_case)
const INLINE =
  /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<]*[^\s<.,;:!?)\]'"])|\*\*(.+?)\*\*|~~(.+?)~~|(?<![\w*])\*(?![\s*])(.+?)(?<!\s)\*(?!\w)|(?<!\w)_(?![\s_])(.+?)(?<!\s)_(?!\w)/g
const LIST = /^\s*(?:([-*+])|(\d+)[.)])\s+(?:\[([ xX])\]\s+)?(.*)$/
const BLOCK_START = /^(```|#{1,3}\s|>|(-{3,}|\*{3,})\s*$)/

const link = (href: string, children: ReactNode, key: number) =>
  SAFE_URL.test(href) ? (
    <a key={key} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <span key={key}>{children}</span>
  )

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of s.matchAll(INLINE)) {
    const at = m.index
    if (at > last) out.push(s.slice(last, at))
    if (m[1]) out.push(<code key={at}>{m[1]}</code>)
    else if (m[2]) out.push(link(m[3], inline(m[2]), at))
    else if (m[4]) out.push(link(m[4], m[4], at))
    else if (m[5]) out.push(<strong key={at}>{inline(m[5])}</strong>)
    else if (m[6]) out.push(<s key={at}>{inline(m[6])}</s>)
    else out.push(<em key={at}>{inline(m[7] ?? m[8])}</em>)
    last = at + m[0].length
  }
  if (last < s.length) out.push(s.slice(last))
  return out
}

/** Lines kept as typed: each newline is a line break, like in the editor. */
const lines = (ls: string[]) => ls.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>)

/**
 * The description, formatted: a small Markdown subset rendered straight to React elements (never as HTML, so nothing typed can inject markup).
 * shortcut: no nested lists, tables or images; reach for a real Markdown library if those are asked for.
 */
export default function Markdown({ text }: { text: string }) {
  const src = text.split('\n')
  const blocks: ReactNode[] = []
  for (let i = 0; i < src.length; ) {
    const line = src[i]
    const key = i
    if (line.startsWith('```')) {
      const body: string[] = []
      for (i++; i < src.length && !src[i].startsWith('```'); i++) body.push(src[i])
      i++
      blocks.push(
        <pre key={key}>
          <code>{body.join('\n')}</code>
        </pre>,
      )
    } else if (/^#{1,3}\s/.test(line)) {
      const level = line.indexOf(' ')
      const H = (['h2', 'h3', 'h4'] as const)[level - 1]
      blocks.push(<H key={key}>{inline(line.slice(level + 1).trim())}</H>)
      i++
    } else if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key} />)
      i++
    } else if (line.startsWith('>')) {
      const quote: string[] = []
      for (; i < src.length && src[i].startsWith('>'); i++) quote.push(src[i].replace(/^>\s?/, ''))
      blocks.push(<blockquote key={key}>{lines(quote)}</blockquote>)
    } else if (LIST.test(line)) {
      const items: RegExpMatchArray[] = []
      for (let m; i < src.length && (m = src[i].match(LIST)); i++) items.push(m)
      const List = items[0][2] ? 'ol' : 'ul'
      blocks.push(
        <List key={key} start={List === 'ol' ? Number(items[0][2]) : undefined}>
          {items.map((m, j) => (
            <li key={j} className={m[3] ? 'md-check' : undefined}>
              {m[3] && <input type="checkbox" checked={m[3] !== ' '} disabled aria-label={m[4]} />}
              <span className={m[3] && m[3] !== ' ' ? 'md-done' : undefined}>{inline(m[4])}</span>
            </li>
          ))}
        </List>,
      )
    } else if (!line.trim()) {
      i++
    } else {
      const para: string[] = []
      for (; i < src.length && src[i].trim() && !BLOCK_START.test(src[i]) && !LIST.test(src[i]); i++) para.push(src[i])
      blocks.push(<p key={key}>{lines(para)}</p>)
    }
  }
  return <div className="md">{blocks}</div>
}
