import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the five grid regions', () => {
    const { container } = render(<App />)
    for (const region of ['header', 'tasks', 'focus', 'mixer', 'lofi']) {
      expect(container.querySelector(`[data-region="${region}"]`)).toBeInTheDocument()
    }
  })
})
