import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CurriculumProgramList } from './CurriculumProgramList'
import type { LearningProgram } from '../types'

describe('CurriculumProgramList Component', () => {
  const mockPrograms: LearningProgram[] = [
    {
      id: 'prog-1',
      title: 'Hiệp Sĩ AI Nhí',
      description: 'Chương trình khai phóng tư duy AI toàn diện cho trẻ',
      source: 'aikid_official',
      unlockMode: 'sequential',
      readOnly: false,
      regions: [
        {
          id: 'reg-1',
          title: 'Vùng 1: Nhập Môn',
          shortTitle: 'Nhập môn',
          status: 'open',
          lectures: [
            { id: 'lec-1', courseId: 'reg-1', order: 1, title: 'Trạm 1', archived: false, accent: 'brand', videoUrl: null, skill: 'Tư duy', reward: '10', duration: '15m', hook: '', practiceKind: 'prompt_lab' },
            { id: 'lec-2', courseId: 'reg-1', order: 2, title: 'Trạm 2', archived: false, accent: 'brand', videoUrl: null, skill: 'Tư duy', reward: '10', duration: '15m', hook: '', practiceKind: 'prompt_lab' },
          ],
        },
      ],
    },
    {
      id: 'prog-2',
      title: 'Trường Tiểu Học Alpha AI',
      description: 'Giáo án AI dành riêng cho khối tiểu học trường Alpha',
      source: 'workspace',
      unlockMode: 'parallel',
      readOnly: false,
      regions: [],
    },
  ]

  it('renders learning spaces and programs in the selected space', () => {
    const html = renderToStaticMarkup(
      <CurriculumProgramList
        programs={mockPrograms}
        selectedSpace="aikid_official"
        onSelectSpace={() => {}}
        onSelectProgram={() => {}}
        onOpenCreateProgram={() => {}}
        onOpenScriptGenerator={() => {}}
        onOpenRulePicker={() => {}}
      />
    )

    expect(html).toContain('Cấp 1: Chương Trình Học')
    expect(html).toContain('AiKid chính thức')
    expect(html).toContain('Trường học')
    expect(html).toContain('Học tự do')
    expect(html).toContain('Hiệp Sĩ AI Nhí')
    expect(html).toContain('1 Vùng học')
    expect(html).toContain('2 Trạm')
    expect(html).toContain('Mở tuần tự')
    expect(html).toContain('Quản lý các Vùng ➔')
    // Does not show workspace programs when space is aikid_official
    expect(html).not.toContain('Trường Tiểu Học Alpha AI')
  })

  it('renders workspace programs when selectedSpace is workspace', () => {
    const html = renderToStaticMarkup(
      <CurriculumProgramList
        programs={mockPrograms}
        selectedSpace="workspace"
        onSelectSpace={() => {}}
        onSelectProgram={() => {}}
        onOpenCreateProgram={() => {}}
        onOpenScriptGenerator={() => {}}
        onOpenRulePicker={() => {}}
      />
    )

    expect(html).toContain('Trường Tiểu Học Alpha AI')
    expect(html).toContain('Mở song song')
    expect(html).not.toContain('Hiệp Sĩ AI Nhí')
  })

  it('renders empty state message when no programs exist in the selected space', () => {
    const html = renderToStaticMarkup(
      <CurriculumProgramList
        programs={mockPrograms}
        selectedSpace="creator_marketplace"
        onSelectSpace={() => {}}
        onSelectProgram={() => {}}
        onOpenCreateProgram={() => {}}
        onOpenScriptGenerator={() => {}}
        onOpenRulePicker={() => {}}
      />
    )

    expect(html).toContain('Chưa có chương trình nào trong không gian Học tự do')
    expect(html).toContain('+ Tạo giáo trình')
  })
})
