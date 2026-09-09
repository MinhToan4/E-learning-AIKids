import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router'
import { describe, it, expect, beforeEach } from 'vitest'
import { RulesRoadmapPage } from '../pages/RulesRoadmapPage'
import { RuleLearningPage } from '../pages/RuleLearningPage'
import { RuleAuthoringDrawer } from '../components/RuleAuthoringDrawer'
import { AikiRuleWorkspace } from '../components/AikiRuleWorkspace'
import { AIKI_RULES_DATA } from '../data/rules-data'

describe('RulesRoadmapPage Component', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  it('renders header, title, badges, and 10 rules according to Image 1', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/rules'] },
        createElement(Routes, null, createElement(Route, { path: '/rules', element: createElement(RulesRoadmapPage) })),
      ),
    )

    // Header checks
    expect(markup).toContain('Phần 1 · Mười quy tắc của Xưởng')
    expect(markup).toContain('8 - 11 tuổi')
    expect(markup).toContain('Miễn phí trọn đời')
    expect(markup).toContain('Nhà sáng tạo')

    // 10 Rules check
    expect(markup).toContain('Lộ trình 10 Quy Tắc Vàng')
    expect(markup).toContain('Hãy nghĩ ý tưởng của cậu')
    expect(markup).toContain('Nội dung là do cậu viết')
    expect(markup).toContain('Bài tập ở trường là của cậu')

    // Progress bar check
    expect(markup).toContain('mở lần lượt từng cái một')

    // 3 Cards of AKI check
    expect(markup).toContain('AKI Nhắn Con')
    expect(markup).toContain('Mười quy tắc này ngắn thôi, xem một loáng là xong')
    expect(markup).toContain('Bộ sưu tập Poster Vàng')
    expect(markup).toContain('Đủ 10 tấm là con in được cả bộ, ký tên rồi dán ở bàn học')
    expect(markup).toContain('Vì sao phải xem hết?')
    expect(markup).toContain('Mười quy tắc này quay lại ở mọi bài thực hành trong Khoá học')
  })
})

describe('RuleLearningPage Component', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  it('renders full-screen split layout with video column and AKI interaction column according to Image 2-5', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/rules/1'] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/rules/:ruleId', element: createElement(RuleLearningPage) }),
        ),
      ),
    )

    // Header check
    expect(markup).toContain('Mười quy tắc')
    expect(markup).toContain('QUY TẮC 1 / 10')
    expect(markup).toContain('8 - 11 tuổi')
    expect(markup).toContain('Câu 1/2')

    // Big Rule Title check
    expect(markup).toContain('Hãy nghĩ ý tưởng của cậu, rồi mới chia sẻ với AKI nhé!')

    // Left Column: Video & Controls check
    expect(markup).toContain('Xem lại video')
    expect(markup).toContain('Nghe AKI đọc quy tắc')
    expect(markup).toContain('Video nằm yên ở đây suốt bài — con xem lại lúc nào cũng được')

    // Right Column: AKI Interaction check
    expect(markup).toContain('Ôn lại một chút nhé')
    expect(markup).toContain('Sai cũng không sao, con thử lại được')
    expect(markup).toContain('Trong câu chuyện của Zico và Sonet')
    expect(markup).toContain('Vì Sonet đã tự nghĩ ý tưởng')
    expect(markup).toContain('Trả lời')
    expect(markup).toContain('AKI mách nhỏ')
  })
})

describe('RuleAuthoringDrawer Component', () => {
  it('renders CMS drawer with tabs for video, review questions and poster rewards', () => {
    const rule = AIKI_RULES_DATA[0]
    const markup = renderToStaticMarkup(
      createElement(RuleAuthoringDrawer, {
        rule,
        isOpen: true,
        onClose: () => {},
      }),
    )

    expect(markup).toContain('CMS Soạn Thảo Quy Tắc Vàng')
    expect(markup).toContain('Quy tắc 1: Nghĩ ý tưởng trước khi hỏi AI')
    expect(markup).toContain('Video &amp; Giọng Đọc')
    expect(markup).toContain('Bộ Câu Hỏi Ôn Tập')
    expect(markup).toContain('Poster Vàng Thưởng')
    expect(markup).toContain('Tiêu đề lớn của Quy tắc')
  })
})

describe('AikiRuleWorkspace direct integration', () => {
  it('renders correctly for Rule 2 with custom backUrl', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/lesson/rule-2'] },
        createElement(AikiRuleWorkspace, {
          ruleId: 2,
          courseId: 'aiki-rules',
          backUrl: '/world/aiki-rules',
        }),
      ),
    )

    expect(markup).toContain('QUY TẮC 2 / 10')
    expect(markup).toContain('Nội dung là do cậu viết')
    expect(markup).toContain('↺ Xem lại video')
    expect(markup).toContain('🎙️ Nghe AKI đọc quy tắc')
    expect(markup).toContain('Ôn lại một chút nhé')
  })

  it('strictly adheres to Soft Clay / Hallmark Craft SSOT and has zero dark theme remnants', () => {
    const roadmapMarkup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/rules'] },
        createElement(Routes, null, createElement(Route, { path: '/rules', element: createElement(RulesRoadmapPage) })),
      ),
    )

    const workspaceMarkup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/rules/1'] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/rules/:ruleId', element: createElement(RuleLearningPage) }),
        ),
      ),
    )

    const darkHexCodes = ['#141224', '#181530', '#221c44', '#1b1736', '#2a244d']
    darkHexCodes.forEach((hex) => {
      expect(roadmapMarkup).not.toContain(hex)
      expect(workspaceMarkup).not.toContain(hex)
    })

    // Soft Clay pastel classes
    expect(roadmapMarkup).toContain('bg-[#f3f0ff]')
    expect(roadmapMarkup).toContain('shadow-clay')
    expect(roadmapMarkup).toContain('rounded-3xl')
    expect(roadmapMarkup).toContain('border-border')

    expect(workspaceMarkup).toContain('bg-[#f3f0ff]')
    expect(workspaceMarkup).toContain('shadow-clay')
    expect(workspaceMarkup).toContain('rounded-3xl')
    expect(workspaceMarkup).toContain('border-border')

    // Split screen layout preservation
    expect(workspaceMarkup).toContain('lg:col-span-7')
    expect(workspaceMarkup).toContain('lg:col-span-5')
  })
})

