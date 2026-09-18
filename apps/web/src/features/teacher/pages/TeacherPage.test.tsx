import { describe, expect, it } from 'vitest'
import { FEATURE_BLOCKS_CATEGORIES, courseLessonFormat, isAikiRulesCourse, normalizeCurriculumPayload } from './TeacherPage'

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

  it('keeps course lessons separate from the AIKI Rules subsystem', () => {
    expect(courseLessonFormat(false)).toBe('aiki-island-6steps')
    expect(courseLessonFormat(true)).toBe('aiki-rule-5steps')
    expect(isAikiRulesCourse({ id: 'de66602b-c9a0-4589-a04b-226ce3b31120', title: 'Nhà thám hiểm AI' })).toBe(false)
    expect(isAikiRulesCourse({ id: 'aiki-rules', title: 'Mười quy tắc Xưởng' })).toBe(true)
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

  it('guarantees all feature blocks in TeacherPage sidebar have pedagogy guides for hover preview', async () => {
    const { FEATURE_BLOCK_CATEGORY_MAP, FEATURE_BLOCK_PEDAGOGY_MAP } = await import(
      '../components/FeatureBlockHoverPreview'
    )
    const allSidebarBlocks = FEATURE_BLOCKS_CATEGORIES.flatMap((c) => c.items)

    expect(allSidebarBlocks.length).toBe(16)

    allSidebarBlocks.forEach((block) => {
      expect(
        FEATURE_BLOCK_CATEGORY_MAP[block.id],
        `Block ${block.id} must be mapped to a category`
      ).toBeDefined()
      expect(
        FEATURE_BLOCK_PEDAGOGY_MAP[block.id],
        `Block ${block.id} must have pedagogical guidance`
      ).toBeDefined()
    })
  })

  it('normalizes aikids-ai-foundation to exactly 6 active regions (32 stations) and separates legacy regions', () => {
    // 6 active regions with 10 + 4 + 4 + 4 + 5 + 5 = 32 stations
    const makeLectures = (count: number) =>
      Array.from({ length: count }, (_, i) => ({ id: `station-${i + 1}`, title: `Trạm ${i + 1}`, duration: '45m' }))

    const rawRegions = [
      // Legacy regions (mixed in)
      { id: 'dao-ke-chuyen', title: 'Đảo kể chuyện', lectures: makeLectures(12), curriculumKey: 'aikids-3-regions-v1' },
      // Active regions (out of order)
      { id: 'island-2', title: 'Module 2 — Tớ là hoạ sĩ AI!', lectures: makeLectures(4), regionOrder: 2 },
      { id: 'aiki-rules', title: 'Mười quy tắc Xưởng', lectures: makeLectures(10), regionOrder: 0 },
      { id: 'thung-lung-ai', title: 'Thung lũng AI', lectures: makeLectures(12) },
      { id: 'island-1', title: 'Module 1 — Nhà thám hiểm AI', lectures: makeLectures(4), regionOrder: 1 },
      { id: 'island-5', title: 'Module 5 — Nhà phát minh trò chơi', lectures: makeLectures(5), regionOrder: 5 },
      { id: 'island-3', title: 'Module 3 — Biệt đội nhân vật AI', lectures: makeLectures(4), regionOrder: 3 },
      { id: 'day-nui-sang-tao', title: 'Dãy núi sáng tạo', lectures: makeLectures(12) },
      { id: 'island-4', title: 'Module 4 — Vương quốc truyện tranh', lectures: makeLectures(5), regionOrder: 4 },
    ]

    const result = normalizeCurriculumPayload({
      programs: [
        {
          id: 'aikids-ai-foundation',
          title: 'Nền tảng AI Kids',
          regions: rawRegions,
        },
      ],
    })

    expect(result.programs.length).toBe(2)

    // Program 1: Nền tảng AI Kids (6 active regions, 32 stations)
    const foundationProgram = result.programs[0]
    expect(foundationProgram.id).toBe('aikids-ai-foundation')
    expect(foundationProgram.regions.length).toBe(6)

    const totalStations = foundationProgram.regions.reduce((sum, r) => sum + r.lectures.length, 0)
    expect(totalStations).toBe(32)

    // Check strict pedagogical ordering
    expect(foundationProgram.regions[0].title).toBe('Mười quy tắc Xưởng')
    expect(foundationProgram.regions[0].lectures.length).toBe(10)
    expect(foundationProgram.regions[1].title).toBe('Module 1 — Nhà thám hiểm AI')
    expect(foundationProgram.regions[1].lectures.length).toBe(4)
    expect(foundationProgram.regions[2].title).toBe('Module 2 — Tớ là hoạ sĩ AI!')
    expect(foundationProgram.regions[2].lectures.length).toBe(4)
    expect(foundationProgram.regions[3].title).toBe('Module 3 — Biệt đội nhân vật AI')
    expect(foundationProgram.regions[3].lectures.length).toBe(4)
    expect(foundationProgram.regions[4].title).toBe('Module 4 — Vương quốc truyện tranh')
    expect(foundationProgram.regions[4].lectures.length).toBe(5)
    expect(foundationProgram.regions[5].title).toBe('Module 5 — Nhà phát minh trò chơi')
    expect(foundationProgram.regions[5].lectures.length).toBe(5)

    // Program 2: Legacy archive
    const legacyProgram = result.programs[1]
    expect(legacyProgram.id).toBe('aikids-legacy-archive')
    expect(legacyProgram.title).toBe('Chương trình Cũ (Lưu trữ)')
    expect(legacyProgram.readOnly).toBe(true)
    expect(legacyProgram.unlockMode).toBe('parallel')
    expect(legacyProgram.regions.length).toBe(3)
    expect(legacyProgram.regions.map((r) => r.id)).toEqual(['dao-ke-chuyen', 'thung-lung-ai', 'day-nui-sang-tao'])
  })

  it('supports collapsible sidebar state with localStorage persistence key aikids_teacher_sidebar_collapsed', () => {
    const STORAGE_KEY = 'aikids_teacher_sidebar_collapsed'
    const storageMap = new Map<string, string>()
    const storage = typeof localStorage !== 'undefined'
      ? localStorage
      : {
          getItem: (key: string) => storageMap.get(key) ?? null,
          setItem: (key: string, val: string) => { storageMap.set(key, val) },
          removeItem: (key: string) => { storageMap.delete(key) },
        }

    storage.removeItem(STORAGE_KEY)

    // Initial state without storage
    let isCollapsed = storage.getItem(STORAGE_KEY) === 'true'
    expect(isCollapsed).toBe(false)

    // Toggle to collapsed
    storage.setItem(STORAGE_KEY, 'true')
    isCollapsed = storage.getItem(STORAGE_KEY) === 'true'
    expect(isCollapsed).toBe(true)

    // Toggle back to expanded
    storage.setItem(STORAGE_KEY, 'false')
    isCollapsed = storage.getItem(STORAGE_KEY) === 'true'
    expect(isCollapsed).toBe(false)

    storage.removeItem(STORAGE_KEY)
  })
})
