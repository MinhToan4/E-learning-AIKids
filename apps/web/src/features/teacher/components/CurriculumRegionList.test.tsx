import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CurriculumRegionList } from './CurriculumRegionList'
import type { LearningProgram } from '../types'

describe('CurriculumRegionList Component', () => {
  const mockProgram: LearningProgram = {
    id: 'prog-ai-kid',
    title: 'Khám Phá Sáng Tạo AI',
    description: 'Chương trình gồm 3 vùng học liên hoàn từ cơ bản đến nâng cao.',
    source: 'aikid_official',
    unlockMode: 'sequential',
    readOnly: false,
    regions: [
      {
        id: 'reg-1',
        title: 'Vùng 1: Nhập môn AI và 4 chiếc chìa khóa',
        shortTitle: '4 Chìa Khóa',
        tagline: 'Làm quen với AI qua hình ảnh ngộ nghĩnh',
        status: 'open',
        ageTrack: '1-2',
        lectures: [
          { id: 'l-1', courseId: 'reg-1', order: 1, title: 'Trạm 1: Chào AKI', archived: false, accent: 'brand', videoUrl: null, skill: 'Tư duy', reward: '10', duration: '15m', hook: '', practiceKind: 'prompt_lab' },
          { id: 'l-2', courseId: 'reg-1', order: 2, title: 'Trạm 2: Đố vui', archived: false, accent: 'brand', videoUrl: null, skill: 'Tư duy', reward: '10', duration: '15m', hook: '', practiceKind: 'prompt_lab' },
        ],
      },
      {
        id: 'reg-2',
        title: 'Vùng 2: Xưởng Sáng Tạo Tranh AI',
        shortTitle: 'Xưởng Tranh',
        tagline: 'Tự tay vẽ tranh và kể chuyện bằng AI',
        status: 'soon',
        lectures: [
          { id: 'l-3', courseId: 'reg-2', order: 1, title: 'Trạm 1: Tạo Prompt', archived: false, accent: 'brand', videoUrl: null, skill: 'Tư duy', reward: '10', duration: '15m', hook: '', practiceKind: 'prompt_lab' },
        ],
      },
    ],
  }

  it('renders program header, regions list, and action buttons', () => {
    const html = renderToStaticMarkup(
      <CurriculumRegionList
        program={mockProgram}
        onSelectRegion={() => {}}
        onEditRegion={() => {}}
        onOpenCreateRegion={() => {}}
        onOpenScriptGenerator={() => {}}
        onBackToPrograms={() => {}}
      />
    )

    expect(html).toContain('Khám Phá Sáng Tạo AI')
    expect(html).toContain('2 vùng · 3 trạm kiến thức')
    expect(html).toContain('Mở lần lượt từng vùng')
    expect(html).toContain('Vùng 1')
    expect(html).toContain('4 Chìa Khóa')
    expect(html).toContain('Đang mở')
    expect(html).toContain('2 Trạm học')
    expect(html).toContain('Vùng 2')
    expect(html).toContain('Xưởng Tranh')
    expect(html).toContain('Đang ẩn')
    expect(html).toContain('Quản lý Trạm học ➔')
    expect(html).toContain('+ Thêm vùng')
  })

  it('renders empty state when a program has 0 regions', () => {
    const emptyProgram: LearningProgram = {
      ...mockProgram,
      regions: [],
    }

    const html = renderToStaticMarkup(
      <CurriculumRegionList
        program={emptyProgram}
        onSelectRegion={() => {}}
        onEditRegion={() => {}}
        onOpenCreateRegion={() => {}}
        onOpenScriptGenerator={() => {}}
        onBackToPrograms={() => {}}
      />
    )

    expect(html).toContain('Chương trình này chưa có Vùng học nào')
    expect(html).toContain('+ Thêm vùng đầu tiên')
  })
})
