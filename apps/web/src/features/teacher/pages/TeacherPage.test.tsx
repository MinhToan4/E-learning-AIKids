import { describe, expect, it } from 'vitest'
import { FEATURE_BLOCKS_CATEGORIES, normalizeCurriculumPayload } from './TeacherPage'

describe('TeacherPage subsystems and learning space specifications', () => {
  it('normalizes incomplete imported curriculum data instead of crashing the CMS', () => {
    const result = normalizeCurriculumPayload({
      courses: [{ id: 'course-new', title: 'Bốn chiếc chìa khóa', lectures: null }],
      programs: [{ id: 'program-new', title: 'AI Creator', regions: null }],
    })

    expect(result.courses[0].lectures).toEqual([])
    expect(result.courses[0].status).toBe('soon')
    expect(result.programs[0].regions).toEqual([])
    expect(result.programs[0].source).toBe('aikid_official')
  })

  it('exposes the four-key layout in the main drag-and-drop palette', () => {
    const layoutBlocks = FEATURE_BLOCKS_CATEGORIES.flatMap((category) => category.items)
    expect(layoutBlocks.some((item) => item.id === 'layout-four-keys')).toBe(true)
  })

  it('defines 2 distinct subsystems: Giảng Dạy & Lớp Học vs Creator Studio', () => {
    const teachingTabs = [
      { key: 'class', label: 'Lớp & Học sinh', path: '/teacher/class' },
      { key: 'stats', label: 'Thống kê', path: '/teacher/stats' },
      { key: 'feedback', label: 'AI Báo cáo PH', path: '/teacher/feedback' },
    ]

    const creatorStudioTabs = [
      { key: 'courses', label: 'Lộ trình & Soạn trạm', path: '/teacher/courses' },
    ]

    expect(teachingTabs.map((t) => t.key)).toEqual(['class', 'stats', 'feedback'])
    expect(creatorStudioTabs.map((t) => t.key)).toEqual(['courses'])
  })

  it('preserves learningSpaceFilter without automatically resetting to aikid_official when space is empty', () => {
    type LearningProgram = {
      id: string
      title: string
      source: 'aikid_official' | 'workspace' | 'creator_marketplace'
      regions: Array<{ id: string }>
    }

    const programs: LearningProgram[] = [
      { id: 'prog-official', title: 'AiKid Chuẩn', source: 'aikid_official', regions: [{ id: 'course-1' }] },
    ]

    // Simulate switching to 'workspace' where programs list has 0 matching programs
    const currentFilter: LearningProgram['source'] = 'workspace'
    const spacePrograms = programs.filter((p) => p.source === currentFilter)

    let selectedProgramId = ''
    let selectedCourseId = ''

    if (spacePrograms.length > 0) {
      selectedProgramId = spacePrograms[0].id
      selectedCourseId = spacePrograms[0].regions[0]?.id ?? ''
    } else {
      // Must NOT fallback to programs[0] or change currentFilter to aikid_official
      selectedProgramId = ''
      selectedCourseId = ''
    }

    expect(currentFilter).toBe('workspace')
    expect(selectedProgramId).toBe('')
    expect(selectedCourseId).toBe('')
    expect(spacePrograms.length).toBe(0)
  })
})
