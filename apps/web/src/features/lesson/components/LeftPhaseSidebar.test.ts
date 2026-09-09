import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LeftPhaseSidebar } from './LeftPhaseSidebar'

describe('LeftPhaseSidebar', () => {
  it('renders the character and guide copy', () => {
    const markup = renderToStaticMarkup(
      createElement(LeftPhaseSidebar, {
        guideCopy: { eyebrow: 'Hi', title: 'Test Title', body: 'Test Body', pose: 'welcome' as const },
        phase: 'learn',
        maxUnlockedPhase: 'practice',
        goals: ['Hiểu mục tiêu'],
        product: 'Một sản phẩm nhỏ',
      })
    )

    expect(markup).toContain('Test Title')
    expect(markup).toContain('Test Body')
    expect(markup).toContain('Hành trình trạm')
    expect(markup).toContain('Mục tiêu của con')
    expect(markup).toContain('Một sản phẩm nhỏ')
    expect(markup).toContain('data-pose="welcome"')
    expect(markup).toContain('Mee đang chào con')
  })

  it('renders decluttered 2 blocks when stages is provided for AIKI rule', () => {
    const markup = renderToStaticMarkup(
      createElement(LeftPhaseSidebar, {
        guideCopy: {
          eyebrow: 'Mee kể con nghe',
          title: 'Tình huống bất ngờ!',
          body: 'Cùng xem Zico và Sonet đang tranh luận điều gì nhé!',
          pose: 'guide' as const,
        },
        phase: 'learn',
        maxUnlockedPhase: 'learn',
        goals: ['Không nên hiển thị'],
        product: 'Không nên hiển thị',
        stages: [
          { id: '1', label: '1. Tình huống' },
          { id: '2', label: '2. Câu đố của AIKI' },
          { id: '3', label: '3. Quy tắc' },
          { id: '4', label: '4. Giải thích' },
          { id: '5', label: '5. Chốt' },
        ],
        currentStageIndex: 0,
      })
    )

    // Khối 1: Bạn Mèo AIKI
    expect(markup).toContain('Tình huống bất ngờ!')
    expect(markup).toContain('Cùng xem Zico và Sonet đang tranh luận điều gì nhé!')
    expect(markup).toContain('Mee đang hỗ trợ')

    // Khối 2: Hành trình 5 chặng
    expect(markup).toContain('Hành trình trạm')
    expect(markup).toContain('1. Tình huống')
    expect(markup).toContain('2. Câu đố của AIKI')
    expect(markup).toContain('3. Quy tắc')
    expect(markup).toContain('4. Giải thích')
    expect(markup).toContain('5. Chốt')
    expect(markup).toContain('Đang học')
    expect(markup).toContain('Tiếp theo')

    // BỎ HOÀN TOÀN: gợi ý, các nút bấm phụ, mục tiêu của con
    expect(markup).not.toContain('Gợi ý cho con')
    expect(markup).not.toContain('Mee gợi ý')
    expect(markup).not.toContain('Mee đọc')
    expect(markup).not.toContain('Mục tiêu của con')
    expect(markup).not.toContain('Không nên hiển thị')
  })

  it('renders collapsed dock mode with mini avatar and expand action', () => {
    const markup = renderToStaticMarkup(
      createElement(LeftPhaseSidebar, {
        guideCopy: { eyebrow: 'Hi', title: 'Test Title', body: 'Test Body', pose: 'welcome' as const },
        phase: 'learn',
        maxUnlockedPhase: 'practice',
        goals: ['Mục tiêu'],
        isCollapsed: true,
      })
    )

    expect(markup).toContain('Mở rộng trợ lý Mee')
    expect(markup).toContain('w-[68px] sm:w-[76px]')
  })
})
