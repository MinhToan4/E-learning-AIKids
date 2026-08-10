import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LeftPhaseSidebar } from './LeftPhaseSidebar'

describe('LeftPhaseSidebar', () => {
  it('renders the character and guide copy', () => {
    const markup = renderToStaticMarkup(
      createElement(LeftPhaseSidebar, {
        guideCopy: { eyebrow: 'Hi', title: 'Test Title', body: 'Test Body', pose: 'welcome' as const }
      })
    )

    expect(markup).toContain('Test Title')
    expect(markup).toContain('Test Body')
  })
})
