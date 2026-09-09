import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AikiRuleVideoPlayer } from './AikiRuleVideoPlayer'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'

describe('AikiRuleVideoPlayer', () => {
  it('renders video player with 16:9 box, slide dialogue and timeline', () => {
    const rule = AIKI_RULES_DATA[0]
    const markup = renderToStaticMarkup(
      createElement(AikiRuleVideoPlayer, { rule })
    )

    expect(markup).toContain('data-testid="aiki-rule-video-player"')
    expect(markup).toContain('aspect-video')
    expect(markup).toContain('1. TÌNH HUỐNG')
    expect(markup).toContain('Xem lại video')
    expect(markup).toContain('Nghe AKI đọc quy tắc')
  })
})
