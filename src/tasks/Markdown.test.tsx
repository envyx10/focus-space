import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Markdown from './Markdown'

const html = (text: string) => render(<Markdown text={text} />).container

describe('Markdown', () => {
  it('formats inline marks and keeps snake_case intact', () => {
    const c = html('**negrita**, *cursiva*, ~~tachado~~, `npm run dev` y mi_variable_larga')
    expect(c.querySelector('strong')).toHaveTextContent('negrita')
    expect(c.querySelector('em')).toHaveTextContent('cursiva')
    expect(c.querySelector('s')).toHaveTextContent('tachado')
    expect(c.querySelector('code')).toHaveTextContent('npm run dev')
    expect(c).toHaveTextContent('mi_variable_larga')
  })

  it('makes links clickable in a new tab, but never javascript: ones', () => {
    const c = html('[docs](https://vite.dev), https://example.com/a. y [malo](javascript:alert(1))')
    const links = [...c.querySelectorAll('a')]
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['https://vite.dev', 'https://example.com/a'])
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer')
    expect(c).toHaveTextContent('malo')
  })

  it('renders code blocks verbatim, without formatting inside', () => {
    const c = html('```\nconst a = **b**\n<script>x</script>\n```')
    expect(c.querySelector('pre code')?.textContent).toBe('const a = **b**\n<script>x</script>')
    expect(c.querySelector('strong, script')).toBeNull()
  })

  it('renders headings, lists, checkboxes, quotes and rules', () => {
    const c = html('# Plan\n- uno\n- dos\n\n1. a\n2. b\n\n- [x] hecho\n- [ ] falta\n\n> cita\n\n---\nlínea 1\nlínea 2')
    expect(c.querySelector('h2')).toHaveTextContent('Plan')
    expect(c.querySelectorAll('ul')[0].children).toHaveLength(2)
    expect(c.querySelectorAll('ol li')).toHaveLength(2)
    expect([...c.querySelectorAll<HTMLInputElement>('input[type=checkbox]')].map((i) => i.checked)).toEqual([true, false])
    expect(c.querySelector('blockquote')).toHaveTextContent('cita')
    expect(c.querySelector('hr')).not.toBeNull()
    expect(c.querySelector('p br')).not.toBeNull()
  })
})
