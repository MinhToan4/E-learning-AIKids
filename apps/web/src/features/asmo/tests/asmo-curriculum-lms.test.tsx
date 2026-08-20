import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  ASMO_LMS_STAGES,
  getLmsProgress,
  saveLmsLessonCompletion,
  isLessonUnlocked,
  getStageStats,
  resetLmsProgress,
} from '../data/asmo-curriculum-lms'
import { AsmoCurriculumRoadmapPage } from '../pages/AsmoCurriculumRoadmapPage'
import {
  AsmoIslandWorldMap,
  ASMO_ISLAND_THEMES,
  MEE_FLAT_CLAY_MASCOT,
} from '../components/AsmoIslandWorldMap'
import { AsmoInteractiveLessonModal } from '../components/AsmoInteractiveLessonModal'

describe('ASMO Curriculum LMS Dataset & Logic', () => {
  beforeEach(() => {
    resetLmsProgress()
  })

  it('contains exactly 5 sequential math stages', () => {
    expect(ASMO_LMS_STAGES).toHaveLength(5)
    expect(ASMO_LMS_STAGES.map((s) => s.stageNumber)).toEqual([1, 2, 3, 4, 5])
    expect(ASMO_LMS_STAGES[0].title).toContain('Phép Cộng')
    expect(ASMO_LMS_STAGES[1].title).toContain('Phép Nhân')
    expect(ASMO_LMS_STAGES[2].title).toContain('Phân Số')
    expect(ASMO_LMS_STAGES[3].title).toContain('Thời Gian')
    expect(ASMO_LMS_STAGES[4].title).toContain('Không Gian 3D')
  })

  it('has 23 comprehensive interactive lessons with complete 4-stage pedagogy', () => {
    const allLessons = ASMO_LMS_STAGES.flatMap((s) => s.lessons)
    expect(allLessons).toHaveLength(23)

    allLessons.forEach((lesson) => {
      expect(lesson.id).toBeTruthy()
      expect(lesson.title).toBeTruthy()
      expect(lesson.subtitle).toBeTruthy()
      expect(lesson.icon).toBeTruthy()
      expect(lesson.xpReward).toBeGreaterThanOrEqual(50)
      expect(lesson.visualType).toBeTruthy()

      // 1. Visual Theory
      expect(lesson.theory.title).toBeTruthy()
      expect(lesson.theory.summary).toBeTruthy()
      expect(lesson.theory.keyTakeaways.length).toBeGreaterThan(0)

      // 2. Mèo Mee Tips
      expect(lesson.meeTip.pose).toBeTruthy()
      expect(lesson.meeTip.quote).toBeTruthy()
      expect(lesson.meeTip.storyAdvice).toBeTruthy()

      // 3. Hands-on Practice
      expect(lesson.interactivePractice.instruction).toBeTruthy()
      expect(lesson.interactivePractice.taskType).toBeTruthy()
      expect(lesson.interactivePractice.successFeedback).toBeTruthy()

      // 4. Quiz
      expect(lesson.quiz.questionTitle).toBeTruthy()
      expect(lesson.quiz.questionText).toBeTruthy()
      expect(lesson.quiz.options).toHaveLength(4)
      expect(lesson.quiz.options.some((o) => o.isCorrect)).toBe(true)
      expect(lesson.quiz.correctExplanation).toBeTruthy()
    })
  })

  it('correctly calculates initial unlocked state', () => {
    const progress = getLmsProgress()
    expect(progress.totalStars).toBe(0)
    expect(progress.totalXp).toBe(0)

    // Lesson 1.1 should be unlocked initially
    const lesson1_1 = ASMO_LMS_STAGES[0].lessons[0]
    expect(isLessonUnlocked(lesson1_1, progress)).toBe(true)

    // Lesson 1.2 should be locked before completing lesson 1.1
    const lesson1_2 = ASMO_LMS_STAGES[0].lessons[1]
    expect(isLessonUnlocked(lesson1_2, progress)).toBe(false)
  })

  it('saves lesson completion and unlocks subsequent lessons', () => {
    const lesson1_1 = ASMO_LMS_STAGES[0].lessons[0]
    const updated = saveLmsLessonCompletion(lesson1_1.id, 3, lesson1_1.xpReward)

    expect(updated.lessons[lesson1_1.id].completed).toBe(true)
    expect(updated.lessons[lesson1_1.id].stars).toBe(3)
    expect(updated.totalStars).toBe(3)
    expect(updated.totalXp).toBe(lesson1_1.xpReward)

    // Now lesson 1.2 should be unlocked
    const lesson1_2 = ASMO_LMS_STAGES[0].lessons[1]
    expect(isLessonUnlocked(lesson1_2, updated)).toBe(true)
  })

  it('computes stage statistics correctly', () => {
    const progress = getLmsProgress()
    const stats1 = getStageStats('stage-1', progress)
    expect(stats1.totalLessons).toBe(5)
    expect(stats1.maxStars).toBe(15)
    expect(stats1.completedLessons).toBe(0)
    expect(stats1.isUnlocked).toBe(true)
  })
})

describe('ASMO 5 Floating Islands Thematic Specs & Flat Clay Assets', () => {
  it('defines unique thematic metadata and Flat Clay images for all 5 islands', () => {
    const islandKeys = ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5']
    islandKeys.forEach((key) => {
      const theme = ASMO_ISLAND_THEMES[key]
      expect(theme).toBeDefined()
      expect(theme.islandName).toBeTruthy()
      expect(theme.englishName).toBeTruthy()
      expect(theme.tagline).toBeTruthy()
      expect(theme.badgeName).toBeTruthy()
      expect(theme.image).toContain('/assets/asmo-islands/')
      expect(theme.chest.name).toBeTruthy()
      expect(theme.chest.bonusXp).toBeGreaterThan(0)
      expect(theme.islandDecorIcons.length).toBeGreaterThanOrEqual(5)
      expect(theme.meeQuotes.length).toBeGreaterThanOrEqual(3)
    })

    // Verify 5 distinct island names and flat clay images
    expect(ASMO_ISLAND_THEMES['stage-1'].islandName).toContain('Đảo Táo Đỏ')
    expect(ASMO_ISLAND_THEMES['stage-1'].image).toBe('/assets/asmo-islands/island_apple_forest.jpg')

    expect(ASMO_ISLAND_THEMES['stage-2'].islandName).toContain('Vương Quốc Bánh Ngọt')
    expect(ASMO_ISLAND_THEMES['stage-2'].image).toBe('/assets/asmo-islands/island_sweet_bakery.jpg')

    expect(ASMO_ISLAND_THEMES['stage-3'].islandName).toContain('Quần Đảo Phân Số Pizza')
    expect(ASMO_ISLAND_THEMES['stage-3'].image).toBe('/assets/asmo-islands/island_pizza_fractions.jpg')

    expect(ASMO_ISLAND_THEMES['stage-4'].islandName).toContain('Cao Nguyên Đồng Hồ')
    expect(ASMO_ISLAND_THEMES['stage-4'].image).toBe('/assets/asmo-islands/island_clock_sky.jpg')

    expect(ASMO_ISLAND_THEMES['stage-5'].islandName).toContain('Thành Phố Pha Lê 3D')
    expect(ASMO_ISLAND_THEMES['stage-5'].image).toBe('/assets/asmo-islands/island_crystal_olympic.jpg')
  })

  it('exports valid Flat Clay Mee Mascot Guide asset', () => {
    expect(MEE_FLAT_CLAY_MASCOT).toBe('/assets/asmo-islands/mee_flat_clay_guide.jpg')
  })
})

describe('ASMO Floating Islands & LMS UI Components', () => {
  it('renders AsmoIslandWorldMap detailed trail view with Flat Clay Mèo Mee companion and S-path', () => {
    const progress = getLmsProgress()
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(AsmoIslandWorldMap, {
          selectedStageId: 'stage-1',
          onSelectStage: () => {},
          progress,
          onOpenLesson: () => {},
        }),
      ),
    )

    // Check Island 1 Header & Flat Clay Scenery Image
    expect(markup).toContain('Đảo Táo Đỏ')
    expect(markup).toContain('Rừng Phép Cộng Trừ')
    expect(markup).toContain('Apple Forest Island')
    expect(markup).toContain('/assets/asmo-islands/island_apple_forest.jpg')

    // Check Winding Path elements
    expect(markup).toContain('pathGradient')
    expect(markup).toContain('🐾')

    // Check Flat Clay Mèo Mee companion presence & avatar
    expect(markup).toContain('Mèo Mee Cổ Vũ')
    expect(markup).toContain('Cùng Mee chinh phục bài này nhé bé ơi!')
    expect(markup).toContain('/assets/asmo-islands/mee_flat_clay_guide.jpg')

    // Check lesson nodes
    expect(markup).toContain('Gộp Táo')
    expect(markup).toContain('Bắt Đầu')

    // Check final treasure chest
    expect(markup).toContain('Rương Táo Vàng Phép Thuật')
  })

  it('renders AsmoCurriculumRoadmapPage with 5 Floating Islands Map and Mee Guide avatar', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/curriculum'] },
        createElement(AsmoCurriculumRoadmapPage),
      ),
    )

    expect(markup).toContain('Chinh Phục 5 Chặng Toán Học Olympic Cùng Mèo Mee')
    expect(markup).toContain('5 Vùng Đảo Thế Giới')
    expect(markup).toContain('Đảo Táo Đỏ')
    expect(markup).toContain('Mèo Mee Cổ Vũ')
    expect(markup).toContain('/assets/asmo-islands/mee_flat_clay_guide.jpg')
  })

  it('renders AsmoInteractiveLessonModal with 4 pedagogical steps', () => {
    const lesson = ASMO_LMS_STAGES[0].lessons[0]
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(AsmoInteractiveLessonModal, {
          lesson,
          isOpen: true,
          onClose: () => {},
          onCompleteLesson: () => {},
        }),
      ),
    )

    expect(markup).toContain('1. Lý Thuyết Trực Quan')
    expect(markup).toContain('2. Bí Kíp Mèo Mee')
    expect(markup).toContain('3. Thực Hành Tương Tác')
    expect(markup).toContain('4. Thử Thách Quiz')
    expect(markup).toContain('Gộp Táo')
  })
})
