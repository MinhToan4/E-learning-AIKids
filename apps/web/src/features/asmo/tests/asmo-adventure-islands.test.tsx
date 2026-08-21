import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import {
  AsmoAdventureIslandCard,
  ASMO_ISLAND_GRADES,
  ASMO_STATION_META,
} from '../components/AsmoAdventureIslandCard'
import { ASMO_LMS_STAGES, getLmsProgress } from '../data/asmo-curriculum-lms'
import { ASMO_ISLAND_THEMES } from '../components/AsmoIslandWorldMap'
import { AsmoHubPage } from '../pages/AsmoHubPage'

describe('ASMO 5 Adventure Islands & Winding Trail Stations', () => {
  const mockProgress = getLmsProgress()

  it('renders all 5 Adventure Island themes and grade tiers properly', () => {
    // Stage 1: 🍎 Đảo Táo Đỏ & Rừng Phép Cộng Trừ (Khối 1 – 2)
    const stage1 = ASMO_LMS_STAGES[0]
    const markup1 = renderToStaticMarkup(
      createElement(AsmoAdventureIslandCard, {
        stage: stage1,
        progress: mockProgress,
        onSelectStage: () => {},
        onOpenLesson: () => {},
      }),
    )
    expect(markup1).toContain('VÙNG 1')
    expect(markup1).toContain('Khối 1 – 2')
    expect(markup1).toContain('Đảo Táo Đỏ &amp; Rừng Phép Cộng Trừ')
    expect(markup1).toContain('Thả Táo Gộp 10')
    expect(markup1).toContain('Bấm Nổ Bóng Trừ')
    expect(markup1).toContain('Cầu Vồng Tròn 10')
    expect(markup1).toContain('Rương Táo Vàng Phép Thuật')
    expect(markup1).toContain('Đặt Chân Lên Đảo &amp; Khám Phá Trạm ➔')

    // Stage 2: 🍰 Vương Quốc Bánh Ngọt & Phép Nhân Chia (Khối 2 – 3)
    const stage2 = ASMO_LMS_STAGES[1]
    const markup2 = renderToStaticMarkup(
      createElement(AsmoAdventureIslandCard, {
        stage: stage2,
        progress: mockProgress,
        onSelectStage: () => {},
        onOpenLesson: () => {},
      }),
    )
    expect(markup2).toContain('VÙNG 2')
    expect(markup2).toContain('Khối 2 – 3')
    expect(markup2).toContain('Vương Quốc Bánh Ngọt &amp; Phép Nhân Chia')
    expect(markup2).toContain('Khay Bánh Nhân')
    expect(markup2).toContain('Bảng Nhân 2–5')
    expect(markup2).toContain('Bảng Nhân 6–9')
    expect(markup2).toContain('Đĩa Chia Kẹo')
    expect(markup2).toContain('Phép Chia Có Dư')
    expect(markup2).toContain('Rương Bánh Kem Hoàng Gia')

    // Stage 3: 🍕 Quần Đảo Pizza Phân Số Biển Khơi (Khối 4 – 5)
    const stage3 = ASMO_LMS_STAGES[2]
    const markup3 = renderToStaticMarkup(
      createElement(AsmoAdventureIslandCard, {
        stage: stage3,
        progress: mockProgress,
        onSelectStage: () => {},
        onOpenLesson: () => {},
      }),
    )
    expect(markup3).toContain('VÙNG 3')
    expect(markup3).toContain('Khối 4 – 5')
    expect(markup3).toContain('Quần Đảo Phân Số Pizza Biển Khơi')
    expect(markup3).toContain('Lát Cắt Pizza')
    expect(markup3).toContain('So Sánh Phân Số')
    expect(markup3).toContain('Cộng Trừ Phân Số')
    expect(markup3).toContain('Phân Số Một Số')
    expect(markup3).toContain('Rương Phô Mai Hải Tặc Vàng')

    // Stage 4: ⏰ Cao Nguyên Thời Gian & Cân Thăng Bằng (Khối 3 – 6)
    const stage4 = ASMO_LMS_STAGES[3]
    const markup4 = renderToStaticMarkup(
      createElement(AsmoAdventureIslandCard, {
        stage: stage4,
        progress: mockProgress,
        onSelectStage: () => {},
        onOpenLesson: () => {},
      }),
    )
    expect(markup4).toContain('VÙNG 4')
    expect(markup4).toContain('Khối 3 – 6')
    expect(markup4).toContain('Cao Nguyên Đồng Hồ &amp; Thời Gian Trên Mây')
    expect(markup4).toContain('Xem Đồng Hồ Kim')
    expect(markup4).toContain('Thời Gian Trôi')
    expect(markup4).toContain('Cân Thăng Bằng')
    expect(markup4).toContain('Rương Đồng Hồ Vượt Thời Gian')

    // Stage 5: 🧊 Thành Phố Pha Lê 3D & Lâu Đài Olympic (Khối 6 – 12)
    const stage5 = ASMO_LMS_STAGES[4]
    const markup5 = renderToStaticMarkup(
      createElement(AsmoAdventureIslandCard, {
        stage: stage5,
        progress: mockProgress,
        onSelectStage: () => {},
        onOpenLesson: () => {},
      }),
    )
    expect(markup5).toContain('VÙNG 5')
    expect(markup5).toContain('Khối 6 – 12')
    expect(markup5).toContain('Thành Phố Pha Lê 3D &amp; Lâu Đài Olympic')
    expect(markup5).toContain('Đếm Khối 3D Tầng')
    expect(markup5).toContain('Gấp Hộp 3D Nets')
    expect(markup5).toContain('Mê Cung Toạ Độ')
    expect(markup5).toContain('Đố Que Diêm 3D')
    expect(markup5).toContain('Đấu Trường ASMO')
    expect(markup5).toContain('Rương Cúp Vàng Olympic Tối Thượng')
  })

  it('renders AsmoHubPage with all new adventure island filters and visual components', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(AsmoHubPage),
      ),
    )

    // Verify 5 Segmentation Filters
    expect(markup).toContain('🎯 Theo Lớp Đang Chọn')
    expect(markup).toContain('🎒 Tiểu Học (Đảo 1, 2, 3)')
    expect(markup).toContain('🏫 THCS (Đảo 3, 4, 5)')
    expect(markup).toContain('🎓 THPT (12 Chuyên Đề 3D)')
    expect(markup).toContain('🗺️ Toàn Cảnh 5 Vùng Đảo')

    // Verify Island elements on Hub Page
    expect(markup).toContain('5 Vùng Đảo Diệu Kỳ')
    expect(markup).toContain('Đảo Táo Đỏ &amp; Rừng Phép Cộng Trừ')
    expect(markup).toContain('Đặt Chân Lên Đảo &amp; Khám Phá Trạm ➔')
    expect(markup).toContain('Vào Học Ngay ➔')
  })

  it('validates all station metadata icons and labels across all 5 stages', () => {
    for (const stage of ASMO_LMS_STAGES) {
      expect(ASMO_ISLAND_GRADES[stage.id]).toBeDefined()
      for (const lesson of stage.lessons) {
        const meta = ASMO_STATION_META[lesson.id]
        expect(meta).toBeDefined()
        expect(meta.shortTitle.length).toBeGreaterThan(0)
        expect(meta.icon.length).toBeGreaterThan(0)
        expect(meta.numberLabel.length).toBeGreaterThan(0)
      }
    }
  })
})
