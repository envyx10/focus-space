import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Markdown from './Markdown'

const html = (text: string) => render(<Markdown text={text} />).container

describe('Markdown', () => {
  it('formats inline marks and keeps snake_case intact', () => {
    const c = html('**negrita**, *cursiva*, ~~tachado~~, `npm run dev` y mi_variable_larga')
    expect(c.querySelector('strong')).toHaveTextContent('negrita')
    expect(c.querySelector('em')).toHaveTextContent('cursiva')
    expect(c.querySelector('del')).toHaveTextContent('tachado')
    expect(c.querySelector('code')).toHaveTextContent('npm run dev')
    expect(c).toHaveTextContent('mi_variable_larga')
  })

  it('makes links clickable in a new tab, but never javascript: ones', () => {
    const c = html('[docs](https://vite.dev), https://example.com/a y [malo](javascript:alert(1))')
    const links = [...c.querySelectorAll('a')]
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['https://vite.dev', 'https://example.com/a', ''])
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('never renders raw HTML', () => {
    const c = html('<script>alert(1)</script><img src=x onerror=alert(1)>\n\n<b>hola</b>')
    expect(c.querySelector('script, img, b')).toBeNull()
  })

  it('highlights fenced code by language and keeps it verbatim', () => {
    const c = html('```js\nconst a = **b**\n```')
    expect(c.querySelector('pre code')?.textContent).toBe('const a = **b**\n')
    expect(c.querySelector('pre .hljs-keyword')).toHaveTextContent('const')
    expect(c.querySelector('strong')).toBeNull()
  })

  it('renders a .md file: headings, nested and task lists, tables, quotes, images', () => {
    const c = html(
      '# Plan\n\n- uno\n  - uno.a\n- dos\n\n- [x] hecho\n- [ ] falta\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n> cita\n\n![logo](https://example.com/l.png)',
    )
    expect(c.querySelector('h1')).toHaveTextContent('Plan')
    expect(c.querySelector('li ul li')).toHaveTextContent('uno.a')
    expect([...c.querySelectorAll<HTMLInputElement>('input[type=checkbox]')].map((i) => i.checked)).toEqual([true, false])
    expect(c.querySelectorAll('td')).toHaveLength(2)
    expect(c.querySelector('blockquote')).toHaveTextContent('cita')
    expect(c.querySelector('img')).toHaveAttribute('alt', 'logo')
  })
})
