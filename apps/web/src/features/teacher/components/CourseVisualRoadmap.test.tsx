import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CourseVisualRoadmap } from './CourseVisualRoadmap'

describe('CourseVisualRoadmap Component', () => {
  const mockStations = [
    {
      id: 'st-1',
      courseId: 'c-1',
      order: 1,
      accent: 'brand',
      videoUrl: null,
      title: 'Khám Phá Thế Giới AI',
      skill: 'Tư duy phản biện',
      hook: 'Bắt đầu hành trình cùng Mèo AKI',
      duration: '15 phút',
      reward: '50 XP',
      learnCards: [{ id: 'lc-1', title: 'Tình huống' }],
      checkQuestions: [{ id: 'cq-1', prompt: 'Hỏi', options: ['A', 'B'], answer: 0, explain: 'Vì' }],
      archived: false,
    },
    {
      id: 'st-2',
      courseId: 'c-1',
      order: 2,
      accent: 'brand',
      videoUrl: null,
      title: 'Bí Mật Quy Tắc Vàng',
      skill: 'An toàn mạng',
      hook: 'Luôn hỏi ý kiến cha mẹ',
      learnCards: [],
      checkQuestions: [],
      archived: false,
    },
    {
      id: 'st-3',
      courseId: 'c-1',
      order: 3,
      accent: 'brand',
      videoUrl: null,
      title: 'Trạm Ẩn Tạm Thời',
      archived: true,
    },
  ]

  it('renders station cards with correct titles and order numbers', () => {
    const html = renderToStaticMarkup(
      <CourseVisualRoadmap
        courseTitle="Khóa Học Thử Nghiệm"
        courseDescription="Mô tả khóa học"
        stations={mockStations}
        onSelectStation={() => {}}
        onAddStation={() => {}}
        onOpenScriptGenerator={() => {}}
      />
    )

    expect(html).toContain('Khóa Học Thử Nghiệm')
    expect(html).toContain('Khám Phá Thế Giới AI')
    expect(html).toContain('Bí Mật Quy Tắc Vàng')
    expect(html).toContain('Trạm 1')
    expect(html).toContain('Trạm 2')
    expect(html).toContain('Trạm 3')
    expect(html).toContain('Tư duy phản biện')
    expect(html).toContain('Bắt đầu hành trình cùng Mèo AKI')
  })

  it('displays readiness status badges: Sẵn sàng, Cần nội dung, Đang ẩn', () => {
    const html = renderToStaticMarkup(
      <CourseVisualRoadmap
        courseTitle="Khóa Học Thử Nghiệm"
        stations={mockStations}
        onSelectStation={() => {}}
        onAddStation={() => {}}
      />
    )

    expect(html).toContain('Sẵn sàng')
    expect(html).toContain('Cần nội dung')
    expect(html).toContain('Đang ẩn')
  })

  it('renders quick action buttons: Thêm trạm mới, Tạo từ kịch bản AI', () => {
    const html = renderToStaticMarkup(
      <CourseVisualRoadmap
        courseTitle="Khóa Học Thử Nghiệm"
        stations={mockStations}
        onSelectStation={() => {}}
        onAddStation={() => {}}
        onOpenScriptGenerator={() => {}}
      />
    )

    expect(html).toContain('Tạo từ kịch bản AI')
    expect(html).toContain('+ Thêm trạm mới')
  })

  it('renders empty state when there are no stations', () => {
    const html = renderToStaticMarkup(
      <CourseVisualRoadmap
        courseTitle="Khóa Học Trống"
        stations={[]}
        onSelectStation={() => {}}
        onAddStation={() => {}}
        onOpenScriptGenerator={() => {}}
      />
    )

    expect(html).toContain('Chưa có trạm học nào trong lộ trình')
    expect(html).toContain('Nhập kịch bản AI')
    expect(html).toContain('+ Thêm trạm đầu tiên')
  })

  it('renders filter tabs and separates active vs archived stations sections', () => {
    const html = renderToStaticMarkup(
      <CourseVisualRoadmap
        courseTitle="Khóa Học Thử Nghiệm"
        stations={mockStations}
        onSelectStation={() => {}}
        onAddStation={() => {}}
        onToggleArchiveStation={() => {}}
      />
    )

    // Tabs
    expect(html).toContain('Tất cả (3)')
    expect(html).toContain('🟢 Đang mở (2)')
    expect(html).toContain('📦 Đã ẩn (1)')

    // Archived station section header & warning badge
    expect(html).toContain('TRẠM CŨ / ĐÃ ẨN KHỎI HỌC SINH (1)')
    expect(html).toContain('🚫 ĐÃ ẨN KHỎI HỌC SINH')
    expect(html).toContain('Khôi phục')
  })
})
