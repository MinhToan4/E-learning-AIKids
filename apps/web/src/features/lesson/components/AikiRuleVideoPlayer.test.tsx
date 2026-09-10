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
    expect(markup).toContain('w-full aspect-video')
    expect(markup).toContain('1. TÌNH HUỐNG')
    expect(markup).toContain('Xem lại video')
    expect(markup).toContain('Nghe AKI đọc quy tắc')
    expect(markup).not.toContain('Toàn màn hình')
  })

  it('renders interactive quiz on stage 1', () => {
    const rule = AIKI_RULES_DATA[0]
    const markup = renderToStaticMarkup(
      createElement(AikiRuleVideoPlayer, { rule, activeSlideIndex: 1 })
    )

    expect(markup).toContain('Bức của Zico')
    expect(markup).toContain('Bức của Sonet')
  })

  it('hides live subtitles overlay on stage 4 to prevent overlapping text', () => {
    const rule = AIKI_RULES_DATA[0]
    const markup = renderToStaticMarkup(
      createElement(AikiRuleVideoPlayer, { rule, activeSlideIndex: 4 })
    )

    // Center celebration card exists
    expect(markup).toContain('Chúc mừng Hiệp Sĩ Sáng Tạo AIKI!')
    expect(markup).toContain('Lời dặn của Mèo AKI')
    // Live subtitles badge should NOT be rendered
    expect(markup).not.toContain('5. CHỐT')
  })

  it('renders YouTube iframe when rule.videoUrl is a valid YouTube link', () => {
    const ruleWithYoutube = {
      ...AIKI_RULES_DATA[0],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }
    const markup = renderToStaticMarkup(
      createElement(AikiRuleVideoPlayer, { rule: ruleWithYoutube })
    )

    expect(markup).toContain('<iframe')
    expect(markup).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    expect(markup).toContain('enablejsapi=1')
    expect(markup).toContain('playsinline=1')
  })

  it('renders pause quiz prompt over YouTube iframe when on stage 1 without answer', () => {
    const ruleWithYoutube = {
      ...AIKI_RULES_DATA[0],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }
    const markup = renderToStaticMarkup(
      createElement(AikiRuleVideoPlayer, {
        rule: ruleWithYoutube,
        activeSlideIndex: 1,
        selectedAnswer: null,
      })
    )

    expect(markup).toContain('Tạm dừng câu đố!')
    expect(markup).toContain('bên bảng tương tác')
  })

  it('hides pause quiz prompt when correct answer is selected on stage 1', () => {
    const ruleWithYoutube = {
      ...AIKI_RULES_DATA[0],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }
    const markup = renderToStaticMarkup(
      createElement(AikiRuleVideoPlayer, {
        rule: ruleWithYoutube,
        activeSlideIndex: 1,
        selectedAnswer: 1,
      })
    )

    expect(markup).not.toContain('Tạm dừng câu đố!')
  })
})

