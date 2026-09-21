import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LessonInteractiveSidebar } from './LessonInteractiveSidebar'

describe('LessonInteractiveSidebar', () => {
  const defaultGuideCopy = {
    eyebrow: 'Hiệp Sĩ Sáng Tạo',
    title: 'Học Quy Tắc 1 Cùng Mèo AIKI',
    body: 'Chào con! Hôm nay hãy cùng AIKI khám phá quy tắc sáng tạo đầu tiên nhé!',
    pose: 'guide' as const,
  }

  const sampleStages = [
    { id: 'stage-1', label: 'Tình Huống' },
    { id: 'stage-2', label: 'Câu Đố Của AIKI' },
    { id: 'stage-3', label: 'Khắc Ghi Quy Tắc 1' },
    { id: 'stage-4', label: 'Bí Quyết Tư Duy' },
    { id: 'stage-5', label: 'Lời Dặn & Nhận Cúp' },
  ]

  it('renders mini MeeTutorAvatar in AIKI speech bubble', () => {
    const markup = renderToStaticMarkup(
      createElement(LessonInteractiveSidebar, {
        guideCopy: defaultGuideCopy,
        phase: 'learn',
        maxUnlockedPhase: 'learn',
        stages: sampleStages,
        currentStageIndex: 0,
      })
    )

    expect(markup).toContain('Lời thoại của AIKI')
    expect(markup).toContain('border-amber-300 bg-amber-100')
    expect(markup).toContain('DỪNG LẠIII')
  })

  it('renders Knight Quest & Tip Card at the bottom with 5 segments and contextual tip for stage 0', () => {
    const markup = renderToStaticMarkup(
      createElement(LessonInteractiveSidebar, {
        guideCopy: defaultGuideCopy,
        phase: 'learn',
        maxUnlockedPhase: 'learn',
        stages: sampleStages,
        currentStageIndex: 0,
        liveStars: 3,
      })
    )

    expect(markup).toContain('Tiến độ Hiệp Sĩ Quy Tắc')
    expect(markup).toContain('3 Sao')
    expect(markup).toContain('Để ý kỹ: Tìm chi tiết khiến bức tranh của Sonet và Zico khác nhau nhé!')
    expect(markup).toContain('Chặng trước')
    expect(markup).toContain('Chặng sau')
  })

  it('renders contextual tips for stage 1 and stage 4', () => {
    const markupStage1 = renderToStaticMarkup(
      createElement(LessonInteractiveSidebar, {
        guideCopy: defaultGuideCopy,
        phase: 'learn',
        maxUnlockedPhase: 'learn',
        stages: sampleStages,
        currentStageIndex: 1,
      })
    )
    expect(markupStage1).toContain('Bấm chọn tranh: Chọn bức tranh thể hiện ý tưởng độc nhất của con!')

    const markupStage4 = renderToStaticMarkup(
      createElement(LessonInteractiveSidebar, {
        guideCopy: defaultGuideCopy,
        phase: 'learn',
        maxUnlockedPhase: 'learn',
        stages: sampleStages,
        currentStageIndex: 4,
      })
    )
    expect(markupStage4).toContain('Tuyên thệ: Nhận cúp Hiệp Sĩ và sẵn sàng cho bài tiếp theo!')
    expect(markupStage4).toContain('Nhận Cúp')
  })

  it('renders stage 1 quiz and interactive options cleanly without popup', () => {
    const markup = renderToStaticMarkup(
      createElement(LessonInteractiveSidebar, {
        guideCopy: defaultGuideCopy,
        phase: 'learn',
        maxUnlockedPhase: 'learn',
        stages: sampleStages,
        currentStageIndex: 1,
      })
    )
    expect(markup).toContain('Câu Đố Của AIKI')
    expect(markup).toContain('Bức nào mới đúng yêu cầu của cô? Bấm chọn đi nào!')
    expect(markup).not.toContain('Thu nhỏ box')
  })

  it('renders collapsed Soft Clay minimal state with Hỗ trợ AIKI, stars, and expand pill', () => {
    const markup = renderToStaticMarkup(
      createElement(LessonInteractiveSidebar, {
        guideCopy: defaultGuideCopy,
        phase: 'learn',
        maxUnlockedPhase: 'learn',
        stages: sampleStages,
        currentStageIndex: 0,
        isCollapsed: true,
        liveStars: 2,
      })
    )

    expect(markup).toContain('w-[76px] sm:w-[84px]')
    expect(markup).toContain('Hỗ trợ AIKI')
    expect(markup).toContain('2/3')
    expect(markup).toContain('Tiến độ')
    expect(markup).toContain('Mở')
  })

  it('renders stage 4 commitment checkbox with (+1 ⭐) bonus label', () => {
    const markup = renderToStaticMarkup(
      createElement(LessonInteractiveSidebar, {
        guideCopy: defaultGuideCopy,
        phase: 'learn',
        maxUnlockedPhase: 'learn',
        stages: sampleStages,
        currentStageIndex: 4,
        hasCommitted: false,
        onToggleCommit: () => {},
      })
    )

    expect(markup).toContain('Con hứa luôn nghĩ ý tưởng của mình trước khi nhờ AI ✨ (+1 ⭐)')
  })
})
