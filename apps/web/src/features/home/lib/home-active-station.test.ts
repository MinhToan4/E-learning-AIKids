// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { resolveNextActiveStation } from './home-active-station'
import { ISLAND_CURRICULUM_LESSONS } from '@/features/lesson/data/island-curriculum-registry'
import type { CourseSummary } from '@/shared/lib/api'

describe('resolveNextActiveStation', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      key: (_i: number) => null,
      length: store.size,
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    store.clear()
  })

  const mockCourses: CourseSummary[] = [
    {
      id: 'dao-1',
      title: 'Đảo 1: Khám Phá',
      shortTitle: 'Đảo 1: Khám Phá',
      tagline: '',
      description: '',
      coverFrom: '#fff',
      coverTo: '#fff',
      accent: '#f97316',
      coverImage: null,
      ageLabel: '9–12 tuổi',
      ageTrack: 'L2',
      durationLabel: '4 trạm',
      productLabel: 'Khóa học',
      status: 'active',
      enrolled: true,
      recommended: true,
      skills: [],
      questCount: 4,
      completedCount: 0,
      totalStars: 0,
      progressPct: 25,
      quests: [],
    },
    {
      id: 'dao-2',
      title: 'Đảo 2: Họa Sĩ',
      shortTitle: 'Đảo 2: Họa Sĩ',
      tagline: '',
      description: '',
      coverFrom: '#fff',
      coverTo: '#fff',
      accent: '#f97316',
      coverImage: null,
      ageLabel: '9–12 tuổi',
      ageTrack: 'L2',
      durationLabel: '4 trạm',
      productLabel: 'Khóa học',
      status: 'active',
      enrolled: true,
      recommended: false,
      skills: [],
      questCount: 4,
      completedCount: 0,
      totalStars: 0,
      progressPct: 0,
      quests: [],
    },
  ]

  const withCompleted = (courses: CourseSummary[], lessonIds: string[]): CourseSummary[] => [
    {
      ...courses[0],
      quests: lessonIds.map((id, index) => ({
        id,
        order: index + 1,
        title: id,
        status: 'completed',
        stars: 3,
      })) as any,
    },
    ...courses.slice(1),
  ]

  it('resolves to Lesson 1.1 when student has no completed lessons', () => {
    const active = resolveNextActiveStation(mockCourses, 'Bé Bo')

    expect(active.stationLabel).toBe('Bài 1.1')
    expect(active.islandNumber).toBe(1)
    expect(active.islandSlug).toBe('dao-1')
    expect(active.route).toBe('/world/dao-1/lesson/bai-1-1-mot-tu-hay-nam-tu')
    expect(active.catDialogue).toContain('Bé Bo')
    expect(active.catDialogue).toContain('Một từ hay năm từ?')
    expect(active.isAllCompleted).toBe(false)
  })

  it('ignores stale browser progress when backend reports a fresh learner', () => {
    store.set('aikids:child-fresh:aikids_lesson_completed_bai-1-1', 'true')
    store.set('aikids:child-fresh:aikids_lesson_stars_bai-1-1', '3')

    const freshCourses = mockCourses.map((course) => ({ ...course, progressPct: 0 }))
    const active = resolveNextActiveStation(freshCourses, 'Bé Mới', 'child-fresh')

    expect(active.stationLabel).toBe('Bài 1.1')
    expect(active.progressPct).toBe(0)
  })

  it('resolves to Lesson 1.2 when Lesson 1.1 is completed by the backend', () => {
    const active = resolveNextActiveStation(withCompleted(mockCourses, ['bai-1-1']), 'Bé Bo')

    expect(active.stationLabel).toBe('Bài 1.2')
    expect(active.route).toBe('/world/dao-1/lesson/bai-1-2-bon-chiec-chia-khoa')
    expect(active.catDialogue).toContain('Bốn chiếc chìa khóa vàng')
  })

  it('resolves to Lesson 1.3 when Lesson 1.1 and 1.2 are completed', () => {
    const active = resolveNextActiveStation(
      withCompleted(mockCourses, ['bai-1-1', 'bai-1-2-bon-chiec-chia-khoa']),
      'Bé Bo',
    )

    expect(active.stationLabel).toBe('Bài 1.3')
    expect(active.route).toBe('/world/dao-1/lesson/bai-1-3-um-ba-la-bien-hinh')
    expect(active.catDialogue).toContain('Úm ba la biến hình')
  })

  it('resolves to Lesson 1.4 with 75% progress when Lessons 1.1, 1.2, 1.3 are completed', () => {
    const active = resolveNextActiveStation(
      withCompleted(mockCourses, [
        'bai-1-1',
        'bai-1-2-bon-chiec-chia-khoa',
        'bai-1-3-um-ba-la-bien-hinh',
      ]),
      'Bé Bo',
    )

    expect(active.stationLabel).toBe('Bài 1.4')
    expect(active.islandNumber).toBe(1)
    expect(active.progressPct).toBe(75)
    expect(active.catDialogue).toContain('Trạm cuối Đảo 1 rồi')
  })

  it('moves to Island 2 (Lesson 2.1) when all Island 1 lessons are completed', () => {
    const active = resolveNextActiveStation(
      withCompleted(mockCourses, [
        'bai-1-1',
        'bai-1-2-bon-chiec-chia-khoa',
        'bai-1-3-um-ba-la-bien-hinh',
        'bai-1-4',
      ]),
      'Bé Bo',
    )

    expect(active.islandNumber).toBe(2)
    expect(active.islandSlug).toBe('dao-2')
    expect(active.stationLabel).toBe('Bài 2.1')
    expect(active.route).toContain('/world/dao-2/lesson/')
    expect(active.catDialogue).toContain('Đảo Họa Sĩ')
  })

  it('recognizes completed lessons through course quests array', () => {
    const coursesWithQuests: CourseSummary[] = [
      {
        ...mockCourses[0],
        quests: [
          { id: 'bai-1-1', status: 'completed' },
          { id: 'bai-1-2-bon-chiec-chia-khoa', status: 'completed' },
        ] as any,
      },
    ]

    const active = resolveNextActiveStation(coursesWithQuests, 'Mimi')

    expect(active.stationLabel).toBe('Bài 1.3')
    expect(active.catDialogue).toContain('Mimi')
  })

  it('handles the edge case when all 22 lessons are completed', () => {
    const active = resolveNextActiveStation(
      withCompleted(mockCourses, ISLAND_CURRICULUM_LESSONS.map((lesson) => lesson.id)),
      'Nhà Thám Hiểm',
    )

    expect(active.isAllCompleted).toBe(true)
    expect(active.progressPct).toBe(100)
    expect(active.stationLabel).toBe('Xuất sắc')
    expect(active.catDialogue).toContain('Nhà Thám Hiểm AI kiệt xuất')
  })

  describe('Subscription Gate (Đảo Tiên Quyết vs 5 Đảo Sáng Tạo)', () => {
    const lockedCourses: CourseSummary[] = [
      {
        ...mockCourses[0],
        status: 'locked',
        enrolled: false,
      },
      {
        ...mockCourses[1],
        status: 'locked',
        enrolled: false,
      },
    ]

    it('shows Rule 1 of Đảo Tiên Quyết when Island 1 is locked and child has no completed rules', () => {
      const active = resolveNextActiveStation(lockedCourses, 'Bé Bo', 'child-unpaid')

      expect(active.stationLabel).toBe('Quy tắc 1')
      expect(active.islandTitle).toBe('Đảo Tiên Quyết')
      expect(active.islandNumber).toBe(0)
      expect(active.islandSlug).toBe('muoi-quy-tac-xuong-sang-tao')
      expect(active.lessonSlug).toBe('rule-1')
      expect(active.route).toBe('/world/program/aikid_official?island=muoi-quy-tac-xuong-sang-tao')
      expect(active.catDialogue).toContain('Bé Bo')
      expect(active.catDialogue).toContain('Quy tắc 1')
      expect(active.progressPct).toBe(0)
      expect(active.isAllCompleted).toBe(false)
    })

    it('advances to Rule 2 when Rule 1 is completed for unpaid child', () => {
      const active = resolveNextActiveStation(
        withCompleted(lockedCourses, ['rule-1']),
        'Bé Bo',
        'child-unpaid',
      )

      expect(active.stationLabel).toBe('Quy tắc 2')
      expect(active.lessonSlug).toBe('rule-2')
      expect(active.progressPct).toBe(10) // 1/10
    })

    it('shows unlock subscription card when all 10 Golden Rules are completed but Island 1 is locked', () => {
      const active = resolveNextActiveStation(
        withCompleted(lockedCourses, Array.from({ length: 10 }, (_, index) => `rule-${index + 1}`)),
        'Bé Bo',
        'child-unpaid',
      )

      expect(active.stationLabel).toBe('Mở khóa')
      expect(active.stationTitle).toBe('Mở khóa 5 Khóa Học Sáng Tạo')
      expect(active.stationDesc).toContain('10 Quy Tắc Vàng')
      expect(active.islandTitle).toBe('Đảo Khám Phá')
      expect(active.route).toBe('/parent/plan')
      expect(active.progressPct).toBe(100)
      expect(active.isAllCompleted).toBe(false)
    })

    it('shows Island 1 Lesson 1.1 immediately when Island 1 is unlocked / enrolled', () => {
      const active = resolveNextActiveStation(mockCourses, 'Bé Bo', 'child-paid')

      expect(active.stationLabel).toBe('Bài 1.1')
      expect(active.islandNumber).toBe(1)
      expect(active.islandSlug).toBe('dao-1')
      expect(active.route).toBe('/world/dao-1/lesson/bai-1-1-mot-tu-hay-nam-tu')
    })
  })
})
