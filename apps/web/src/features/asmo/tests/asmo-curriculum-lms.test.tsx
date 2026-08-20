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

describe('ASMO 5 Island Regions Thematic Specs & Authentic Assets', () => {
  it('defines unique metadata, background and world scene for all 5 regions', () => {
    const islandKeys = ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5']
    islandKeys.forEach((key) => {
      const theme = ASMO_ISLAND_THEMES[key]
      expect(theme).toBeDefined()
      expect(theme.name).toBeTruthy()
      expect(theme.shortTitle).toBeTruthy()
      expect(theme.englishName).toBeTruthy()
      expect(theme.tagline).toBeTruthy()
      expect(theme.badgeName).toBeTruthy()
      expect(theme.background).toBeTruthy()
      expect(theme.scene).toBeTruthy()
      expect(theme.ribbon).toBeTruthy()
      expect(theme.pose).toBeTruthy()
      expect(theme.chest.name).toBeTruthy()
      expect(theme.chest.bonusXp).toBeGreaterThan(0)
      expect(theme.meeQuotes.length).toBeGreaterThanOrEqual(3)
    })

    // Verify 5 distinct region names and titles
    expect(ASMO_ISLAND_THEMES['stage-1'].name).toContain('VÙNG 1: L1')
    expect(ASMO_ISLAND_THEMES['stage-1'].shortTitle).toContain('Phép Cộng & Trừ')

    expect(ASMO_ISLAND_THEMES['stage-2'].name).toContain('VÙNG 2: L2')
    expect(ASMO_ISLAND_THEMES['stage-2'].shortTitle).toContain('Phép Nhân & Chia')

    expect(ASMO_ISLAND_THEMES['stage-3'].name).toContain('VÙNG 3: L3')
    expect(ASMO_ISLAND_THEMES['stage-3'].shortTitle).toContain('Phân Số Pizza')

    expect(ASMO_ISLAND_THEMES['stage-4'].name).toContain('VÙNG 4: L4')
    expect(ASMO_ISLAND_THEMES['stage-4'].shortTitle).toContain('Thời Gian Đồng Hồ')

    expect(ASMO_ISLAND_THEMES['stage-5'].name).toContain('VÙNG 5: L5')
    expect(ASMO_ISLAND_THEMES['stage-5'].shortTitle).toContain('Không Gian 3D')
  })

  it('exports valid official AI Kids mascot image reference', () => {
    expect(MEE_FLAT_CLAY_MASCOT).toBe('/assets/aikid-ui/mascot-original/course-wave.webp')
  })
})

describe('ASMO Floating Islands & LMS UI Components (100% Original AI Kids World Map)', () => {
  it('renders AsmoIslandWorldMap detailed trail view with Scene Hero, Ribbon, Winding Trail, and Mèo Mee Companion', () => {
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

    // 1. Check Header Cảnh Quan (Scene Hero)
    expect(markup).toContain('course-map-hero')
    expect(markup).toContain('course-map-heading')
    expect(markup).toContain('course-map-scene')
    expect(markup).toContain('course-map-scene-art')
    expect(markup).toContain('course-map-scene-cat')
    expect(markup).toContain('aikid-cat-character')
    expect(markup).toContain('VÙNG 1: L1 · Thế Giới Phép Cộng &amp; Phép Trừ')

    // 2. Check Thẻ Ruy Băng Tiến Độ (Course Map Ribbon)
    expect(markup).toContain('course-map-ribbon')
    expect(markup).toContain('course-map-ribbon-main')
    expect(markup).toContain('course-map-next-ticket')
    expect(markup).toContain('cute-progress')
    expect(markup).toContain('course-map-stats')
    expect(markup).toContain('world-station-path')

    // 3. Check Cung Đường Mòn Uốn Lượn (Course Station Map)
    expect(markup).toContain('course-station-map')
    expect(markup).toContain('course-station-canvas')
    expect(markup).toContain('course-game-path-road')
    expect(markup).toContain('course-game-path-dashes')
    expect(markup).toContain('course-game-stations')
    expect(markup).toContain('quest-node')
    expect(markup).toContain('quest-node-caption')

    // 4. Check Mèo Mee companion standing at current station
    expect(markup).toContain('Cùng Mee chinh phục Trạm 1 nhé! 🐾')

    // 5. Check Treasure Chest at end of journey
    expect(markup).toContain('Rương Táo Vàng Phép Thuật')
  })

  it('renders AsmoIslandWorldMap 5-region overview when viewMode is world', () => {
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
          viewMode: 'world',
        }),
      ),
    )

    // Check World Overview structure
    expect(markup).toContain('world-region-card')
    expect(markup).toContain('world-region-scene')
    expect(markup).toContain('world-region-art')
    expect(markup).toContain('world-region-scene-cat')
    expect(markup).toContain('world-region-ribbon')
    expect(markup).toContain('world-region-road')
    expect(markup).toContain('5 Vùng Đảo Toán Học Diệu Kỳ')
    expect(markup).toContain('VÙNG 1: L1')
    expect(markup).toContain('VÙNG 2: L2')
    expect(markup).toContain('VÙNG 3: L3')
    expect(markup).toContain('VÙNG 4: L4')
    expect(markup).toContain('VÙNG 5: L5')
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
    expect(markup).toContain('VÙNG 1: L1')
    expect(markup).toContain('course-map-hero')
    expect(markup).toContain('course-station-map')
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
