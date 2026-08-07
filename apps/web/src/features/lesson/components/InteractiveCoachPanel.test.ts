import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { InteractiveCoachPanel } from './InteractiveCoachPanel'

describe('InteractiveCoachPanel', () => {
  const defaultGuideCopy = {
    eyebrow: 'MẸO NHỎ KHỞI ĐỘNG',
    title: 'Học thật vui cùng Mee',
    body: 'Xem video hoặc làm theo hướng dẫn bên dưới nhé!',
    pose: 'welcome' as const,
  }

  it('renders guide copy title, eyebrow, and body correctly', () => {
    const markup = renderToStaticMarkup(
      createElement(InteractiveCoachPanel, {
        guideCopy: defaultGuideCopy,
      }),
    )
    expect(markup).toContain('MẸO NHỎ KHỞI ĐỘNG')
    expect(markup).toContain('Học thật vui cùng Mee')
    expect(markup).toContain('Xem video hoặc làm theo hướng dẫn bên dưới nhé!')
    expect(markup).toContain('Gợi ý')
  })

  it('renders LectureVideo when videoUrl is provided', () => {
    const markup = renderToStaticMarkup(
      createElement(InteractiveCoachPanel, {
        guideCopy: defaultGuideCopy,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoTitle: 'Video Bài Học',
      }),
    )
    expect(markup).toContain('Video Bài Học')
    expect(markup).toContain('Xem lại')
  })

  it('does not render LectureVideo or "Xem lại" button when videoUrl is missing', () => {
    const markup = renderToStaticMarkup(
      createElement(InteractiveCoachPanel, {
        guideCopy: defaultGuideCopy,
        videoUrl: null,
      }),
    )
    expect(markup).not.toContain('Xem lại')
  })
})
