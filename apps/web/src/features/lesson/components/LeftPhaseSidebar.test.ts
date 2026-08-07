import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LeftPhaseSidebar } from './LeftPhaseSidebar'

describe('LeftPhaseSidebar', () => {
  it('renders 4 phase buttons with proper title attributes', () => {
    const markup = renderToStaticMarkup(
      createElement(LeftPhaseSidebar, {
        currentPhase: 'learn',
        maxUnlockedPhase: 'learn',
        onPhaseSelect: () => {},
        guideCopy: { eyebrow: 'Hi', title: 'Test', body: 'Test', pose: 'welcome' as const }
      })
    )

    expect(markup).toContain('title="Khám phá"')
    expect(markup).toContain('title="Thử cùng Mee"')
    expect(markup).toContain('title="Tự tay làm"')
    expect(markup).toContain('title="Thử thách"')
  })

  it('disables phases beyond maxUnlockedPhase', () => {
    const markup = renderToStaticMarkup(
      createElement(LeftPhaseSidebar, {
        currentPhase: 'learn',
        maxUnlockedPhase: 'game',
        onPhaseSelect: () => {},
        guideCopy: { eyebrow: 'Hi', title: 'Test', body: 'Test', pose: 'welcome' as const }
      })
    )

    // 'learn' (idx 0) unlocked, 'game' (idx 1) unlocked
    // 'practice' (idx 2) disabled, 'check' (idx 3) disabled
    // Check that disabled is present in markup for locked steps
    expect(markup).toContain('cursor-not-allowed')
    expect(markup).toContain('disabled=""')
  })

  it('highlights the current active phase', () => {
    const markup = renderToStaticMarkup(
      createElement(LeftPhaseSidebar, {
        currentPhase: 'game',
        maxUnlockedPhase: 'practice',
        onPhaseSelect: () => {},
        guideCopy: { eyebrow: 'Hi', title: 'Test', body: 'Test', pose: 'welcome' as const }
      })
    )

    expect(markup).toContain('bg-brand-500')
    expect(markup).toContain('animate-pop')
  })
})
