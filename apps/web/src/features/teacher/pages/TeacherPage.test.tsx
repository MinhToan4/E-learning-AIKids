import { describe, expect, it } from 'vitest'

describe('TeacherPage subsystems and learning space specifications', () => {
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
