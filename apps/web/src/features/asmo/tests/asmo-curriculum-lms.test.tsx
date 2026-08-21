import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  ASMO_LMS_STAGES,
  getLmsProgress,
  saveLmsLessonCompletion,
  isLessonUnlocked,
  getStageStats,
  resetLmsProgress,
  getLessonPracticeChallenges,
  verifyPracticeChallenge,
} from '../data/asmo-curriculum-lms'
import { AsmoCurriculumRoadmapPage } from '../pages/AsmoCurriculumRoadmapPage'
import { AsmoCurriculumLessonPage } from '../pages/AsmoCurriculumLessonPage'
import {
  AsmoIslandWorldMap,
  ASMO_ISLAND_THEMES,
  MEE_FLAT_CLAY_MASCOT,
} from '../components/AsmoIslandWorldMap'
import { AsmoInteractiveLessonModal } from '../components/AsmoInteractiveLessonModal'
import { AsmoInteractivePracticeWorkspace } from '../components/AsmoInteractivePracticeWorkspace'

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

  it('renders AsmoCurriculumLessonPage fullscreen standard page with 4 Math & Olympic Phase Tabs, Visualizer, and Sidebar', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/curriculum/lesson/s1-apples'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/asmo/curriculum/lesson/:lessonId',
            element: createElement(AsmoCurriculumLessonPage),
          }),
        ),
      ),
    )

    // 1. Compact Hero Header & Badges
    expect(markup).toContain('Trạm 1:')
    expect(markup).toContain('Gộp Táo')
    expect(markup).toContain('Sản phẩm của trạm:')
    expect(markup).toContain('Sao của trạm')
    expect(markup).toContain('+50 XP')

    // 2. Compact 1-Row Stepper Tabs
    expect(markup).toContain('1. 📖 Khám phá')
    expect(markup).toContain('2. 💡 Mẹo Mee')
    expect(markup).toContain('3. 🎮 Thực hành')
    expect(markup).toContain('4. 🏆 Thử tài')

    // 3. Main Stage Visualizer for Elementary (Visual-First Canvas)
    expect(markup).toContain('🐱 Mèo Mee: Bé hãy chạm vào hình ảnh để xem điều kỳ diệu nhé!')
    expect(markup).toContain('Giỏ A (Táo Đỏ):')
    expect(markup).toContain('Giỏ B (Táo Xanh):')
    expect(markup).toContain('quả táo tổng cộng')
    expect(markup).toContain('Bí Kíp Nhìn Hình:')
    expect(markup).not.toContain('Trọng Tâm Kiến Thức Bài Học')
    expect(markup).not.toContain('🌟 Ghi Nhớ Nhanh:')

    // 4. Streamlined Sidebar Assistant Mèo Mee (Checklist removed)
    expect(markup).toContain('Mee đang hỗ trợ: Con làm được! 🐾')
    expect(markup).toContain('💡 Gợi ý cho con')
    expect(markup).toContain('🎯 Mục tiêu bài học')
    expect(markup).toContain('Phần thưởng trạm')
    expect(markup).not.toContain('Hành trình trạm')

    // 5. Action Buttons
    expect(markup).toContain('🎓 Về bản đồ')
    expect(markup).toContain('Tiếp tục: Mẹo Mèo Mee')
  })

  it('renders AsmoCurriculumLessonPage for Secondary stage with formula theory card and key takeaways', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/curriculum/lesson/s4-analog-clock'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/asmo/curriculum/lesson/:lessonId',
            element: createElement(AsmoCurriculumLessonPage),
          }),
        ),
      ),
    )

    expect(markup).toContain('Trọng Tâm Kiến Thức Bài Học')
    expect(markup).toContain('🌟 Ghi Nhớ Nhanh:')
    expect(markup).toContain('Chỉnh Giờ:')
  })

  it('renders fallback error message when lessonId does not exist', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/curriculum/lesson/non-existent-lesson-id'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/asmo/curriculum/lesson/:lessonId',
            element: createElement(AsmoCurriculumLessonPage),
          }),
        ),
      ),
    )

    expect(markup).toContain('Không tìm thấy bài học ASMO')
    expect(markup).toContain('Quay về Bản Đồ 5 Vùng Đảo')
  })
})

describe('ASMO Multi-Level Practice Lab & Diagnostic Verification Engine', () => {
  it('generates exactly 3 sequential interactive challenges (Level 1, 2, 3) for all 23 lessons', () => {
    const allLessons = ASMO_LMS_STAGES.flatMap((s) => s.lessons)
    expect(allLessons).toHaveLength(23)

    allLessons.forEach((lesson) => {
      const challenges = getLessonPracticeChallenges(lesson)
      expect(challenges).toHaveLength(3)
      expect(challenges[0].level).toBe(1)
      expect(challenges[0].levelLabel).toContain('Thử thách 1')
      expect(challenges[0].instruction).toBeTruthy()
      expect(challenges[0].successFeedback).toBeTruthy()

      expect(challenges[1].level).toBe(2)
      expect(challenges[1].levelLabel).toContain('Thử thách 2')
      expect(challenges[1].instruction).toBeTruthy()

      expect(challenges[2].level).toBe(3)
      expect(challenges[2].levelLabel).toContain('Thử thách 3')
      expect(challenges[2].instruction).toBeTruthy()
    })
  })

  it('accurately verifies apple_drop multi-level practice challenges with diagnostic feedback', () => {
    const appleLesson = ASMO_LMS_STAGES[0].lessons[0] // s1-apples

    // Challenge 1: 3 apples A + 4 apples B = 7
    const ch1Wrong = verifyPracticeChallenge(appleLesson, 0, { applesA: 2, applesB: 4 })
    expect(ch1Wrong.isCorrect).toBe(false)
    expect(ch1Wrong.feedback).toContain('Giỏ A đang có 2 quả đỏ')

    const ch1Correct = verifyPracticeChallenge(appleLesson, 0, { applesA: 3, applesB: 4 })
    expect(ch1Correct.isCorrect).toBe(true)
    expect(ch1Correct.feedback).toContain('3 quả đỏ + 4 quả xanh = 7 quả táo')

    // Challenge 2: Missing addend (5 + 3 = 8)
    const ch2Wrong = verifyPracticeChallenge(appleLesson, 1, { applesA: 5, applesB: 1 })
    expect(ch2Wrong.isCorrect).toBe(false)
    expect(ch2Wrong.feedback).toContain('Tổng hiện tại đang là 6 quả')

    const ch2Correct = verifyPracticeChallenge(appleLesson, 1, { applesA: 5, applesB: 3 })
    expect(ch2Correct.isCorrect).toBe(true)
    expect(ch2Correct.feedback).toContain('5 quả đỏ + 3 quả xanh = đúng 8 quả')

    // Challenge 3: Free sum 10
    const ch3Wrong = verifyPracticeChallenge(appleLesson, 2, { applesA: 4, applesB: 4 })
    expect(ch3Wrong.isCorrect).toBe(false)
    expect(ch3Wrong.feedback).toContain('tổng hai giỏ bằng đúng 10 quả táo')

    const ch3Correct = verifyPracticeChallenge(appleLesson, 2, { applesA: 6, applesB: 4 })
    expect(ch3Correct.isCorrect).toBe(true)
    expect(ch3Correct.feedback).toContain('10 quả táo')
  })

  it('accurately verifies balloon_pop practice challenges', () => {
    const balloonLesson = ASMO_LMS_STAGES[0].lessons[1] // s1-balloons

    // Challenge 1: Pop 4 balloons
    const ch1Wrong = verifyPracticeChallenge(balloonLesson, 0, { poppedBalloons: [1, 2] })
    expect(ch1Wrong.isCorrect).toBe(false)
    expect(ch1Wrong.feedback).toContain('Bé mới nổ 2 quả bóng')

    const ch1Correct = verifyPracticeChallenge(balloonLesson, 0, { poppedBalloons: [1, 2, 3, 4] })
    expect(ch1Correct.isCorrect).toBe(true)
    expect(ch1Correct.feedback).toContain('10 - 4 = 6 quả bóng')

    // Challenge 2: Pop to target 3 remaining (pop 7)
    const ch2Correct = verifyPracticeChallenge(balloonLesson, 1, { poppedBalloons: [1, 2, 3, 4, 5, 6, 7] })
    expect(ch2Correct.isCorrect).toBe(true)
    expect(ch2Correct.feedback).toContain('10 - 7 = 3 quả bóng')
  })

  it('accurately verifies cake_tray practice challenges', () => {
    const cakeLesson = ASMO_LMS_STAGES[1].lessons[0] // s2-cake-tray

    // Challenge 1: 3 rows x 4 cols
    const ch1Wrong = verifyPracticeChallenge(cakeLesson, 0, { cakeRows: 2, cakeCols: 2 })
    expect(ch1Wrong.isCorrect).toBe(false)
    expect(ch1Wrong.feedback).toContain('Khay bánh đang có 2 hàng và 2 cột')

    const ch1Correct = verifyPracticeChallenge(cakeLesson, 0, { cakeRows: 3, cakeCols: 4 })
    expect(ch1Correct.isCorrect).toBe(true)
    expect(ch1Correct.feedback).toContain('3 hàng × 4 cột = 12 chiếc bánh')

    // Challenge 2: 4 rows x 5 cols = 20
    const ch2Correct = verifyPracticeChallenge(cakeLesson, 1, { cakeRows: 4, cakeCols: 5 })
    expect(ch2Correct.isCorrect).toBe(true)
    expect(ch2Correct.feedback).toContain('20 chiếc bánh')

    // Challenge 3: Product = 24 (4x6 or 3x8)
    const ch3Correct = verifyPracticeChallenge(cakeLesson, 2, { cakeRows: 4, cakeCols: 6 })
    expect(ch3Correct.isCorrect).toBe(true)
    expect(ch3Correct.feedback).toContain('24 chiếc bánh')
  })

  it('accurately verifies candy_division and div_remainder practice challenges', () => {
    const candyLesson = ASMO_LMS_STAGES[1].lessons[3] // s2-candy-split

    const ch1Correct = verifyPracticeChallenge(candyLesson, 0, { candyTotal: 12, candyPlates: 3 })
    expect(ch1Correct.isCorrect).toBe(true)
    expect(ch1Correct.feedback).toContain('12 : 3 = 4 cái kẹo')

    const ch2Correct = verifyPracticeChallenge(candyLesson, 1, { candyTotal: 15, candyPlates: 3 })
    expect(ch2Correct.isCorrect).toBe(true)
    expect(ch2Correct.feedback).toContain('15 : 3 = 5 cái kẹo')
  })

  it('accurately verifies pizza_fraction practice challenges', () => {
    const pizzaLesson = ASMO_LMS_STAGES[2].lessons[0] // s3-pizza-fractions

    const ch1Correct = verifyPracticeChallenge(pizzaLesson, 0, { pizzaSlices: 8, pizzaShaded: 3 })
    expect(ch1Correct.isCorrect).toBe(true)
    expect(ch1Correct.feedback).toContain('3/8 chiếc bánh pizza')

    const ch2Correct = verifyPracticeChallenge(pizzaLesson, 1, { pizzaSlices: 4, pizzaShaded: 2 })
    expect(ch2Correct.isCorrect).toBe(true)
    expect(ch2Correct.feedback).toContain('1/2 nửa chiếc bánh')
  })

  it('accurately verifies analog_clock practice challenges', () => {
    const clockLesson = ASMO_LMS_STAGES[3].lessons[0] // s4-analog-clock

    const ch1Correct = verifyPracticeChallenge(clockLesson, 0, { clockHour: 8, clockMinute: 15 })
    expect(ch1Correct.isCorrect).toBe(true)
    expect(ch1Correct.feedback).toContain('8:15')

    const ch2Correct = verifyPracticeChallenge(clockLesson, 1, { clockHour: 3, clockMinute: 30 })
    expect(ch2Correct.isCorrect).toBe(true)
    expect(ch2Correct.feedback).toContain('3:30')
  })

  it('accurately verifies make10 multi-level practice challenges with 3 distinct levels', () => {
    const make10Lesson = ASMO_LMS_STAGES[0].lessons[2] // s1-make10

    const challenges = getLessonPracticeChallenges(make10Lesson)
    expect(challenges).toHaveLength(3)
    expect(challenges[0].title).toContain('Khởi Động')
    expect(challenges[0].taskConfig.numbers).toEqual([1, 9, 3, 7])
    expect(challenges[1].title).toContain('3 Cặp')
    expect(challenges[1].taskConfig.numbers).toEqual([2, 8, 4, 6, 5, 5])
    expect(challenges[2].title).toContain('Dãy Số')
    expect(challenges[2].taskConfig.numbers).toEqual([1, 3, 5, 7, 9])

    // Challenge 1: 4 numbers [1, 9, 3, 7] -> 2 pairs: (1, 9) and (3, 7)
    // indices 0 & 1 -> values 1 & 9; indices 2 & 3 -> values 3 & 7
    const ch1Wrong = verifyPracticeChallenge(make10Lesson, 0, { pairedMake10: [[0, 1]] })
    expect(ch1Wrong.isCorrect).toBe(false)
    expect(ch1Wrong.feedback).toContain('1/2 cặp bạn thân')

    const ch1Correct = verifyPracticeChallenge(make10Lesson, 0, { pairedMake10: [[0, 1], [2, 3]] })
    expect(ch1Correct.isCorrect).toBe(true)
    expect(ch1Correct.feedback).toContain('1 + 9 = 10 và 3 + 7 = 10')

    // Challenge 2: 6 numbers [2, 8, 4, 6, 5, 5] -> 3 pairs
    // indices [0, 1] -> (2,8), [2, 3] -> (4,6), [4, 5] -> (5,5)
    const ch2Wrong = verifyPracticeChallenge(make10Lesson, 1, { pairedMake10: [[0, 1], [2, 3]] })
    expect(ch2Wrong.isCorrect).toBe(false)
    expect(ch2Wrong.feedback).toContain('2/3 cặp')

    const ch2Correct = verifyPracticeChallenge(make10Lesson, 1, { pairedMake10: [[0, 1], [2, 3], [4, 5]] })
    expect(ch2Correct.isCorrect).toBe(true)
    expect(ch2Correct.feedback).toContain('3 cặp bạn thân: (2, 8), (4, 6) và (5, 5)')

    // Challenge 3: 5 numbers [1, 3, 5, 7, 9] -> pair (1,9) and (3,7), leftover 5, sum 25
    // indices [0, 4] -> (1,9), [1, 3] -> (3,7)
    const ch3Wrong = verifyPracticeChallenge(make10Lesson, 2, { pairedMake10: [[0, 4]] })
    expect(ch3Wrong.isCorrect).toBe(false)
    expect(ch3Wrong.feedback).toContain('1/2 cặp tròn 10')

    const ch3Correct = verifyPracticeChallenge(make10Lesson, 2, { pairedMake10: [[0, 4], [1, 3]] })
    expect(ch3Correct.isCorrect).toBe(true)
    expect(ch3Correct.feedback).toContain('10 + 10 + 5 = 25')
  })

  it('renders AsmoInteractivePracticeWorkspace with make10 dynamic balls and challenge step indicators', () => {
    const make10Lesson = ASMO_LMS_STAGES[0].lessons[2]
    const markup = renderToStaticMarkup(
      createElement(AsmoInteractivePracticeWorkspace, {
        lesson: make10Lesson,
        onCompleteAllChallenges: () => {},
        onAdvanceToQuiz: () => {},
      }),
    )

    // Check challenge progress header & 3 pills
    expect(markup).toContain('Phòng Thực Hành Tương Tác Đa Cấp Độ')
    expect(markup).toContain('Thử thách 1/3:')
    expect(markup).toContain('Ghép Cặp Tròn 10 Khởi Động')
    expect(markup).toContain('Thử thách 1')
    expect(markup).toContain('Thử thách 2')
    expect(markup).toContain('Thử thách 3')
    expect(markup).toContain('Bé hãy bấm chọn 2 quả bóng có tổng bằng 10')
    expect(markup).toContain('Ghép lại')
    expect(markup).toContain('Kiểm Tra Kết Quả Thử Thách')
  })

  it('renders AsmoCurriculumLessonPage with 5 Rainbow Make10 friend pairs in Explore tab', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/curriculum/lesson/s1-make10'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/asmo/curriculum/lesson/:lessonId',
            element: createElement(AsmoCurriculumLessonPage),
          }),
        ),
      ),
    )

    // Check 5 Rainbow Pair model
    expect(markup).toContain('CẦU VỒNG 5 CẶP BẠN THÂN TRÒN 10')
    expect(markup).toContain('1 + 9 = 10')
    expect(markup).toContain('2 + 8 = 10')
    expect(markup).toContain('3 + 7 = 10')
    expect(markup).toContain('4 + 6 = 10')
    expect(markup).toContain('5 + 5 = 10')
    expect(markup).toContain('Xem Cả 5 Cặp')
    expect(markup).toContain('Mèo Mee Cổ Vũ Bạn Thân:')
    expect(markup).toContain('Ứng Dụng Olympic ASMO Tính Nhanh:')
  })

  it('renders AsmoInteractivePracticeWorkspace with 3 challenge step indicators and without pre-baked results', () => {
    const appleLesson = ASMO_LMS_STAGES[0].lessons[0]
    const markup = renderToStaticMarkup(
      createElement(AsmoInteractivePracticeWorkspace, {
        lesson: appleLesson,
        onCompleteAllChallenges: () => {},
        onAdvanceToQuiz: () => {},
      }),
    )

    // Check challenge progress header & 3 pills
    expect(markup).toContain('Phòng Thực Hành Tương Tác Đa Cấp Độ')
    expect(markup).toContain('Thử thách 1/3:')
    expect(markup).toContain('Gộp Táo Khởi Động')
    expect(markup).toContain('Thử thách 1')
    expect(markup).toContain('Thử thách 2')
    expect(markup).toContain('Thử thách 3')

    // Check manipulative controls
    expect(markup).toContain('Giỏ A (Táo Đỏ):')
    expect(markup).toContain('Giỏ B (Táo Xanh):')
    expect(markup).toContain('Thêm')
    expect(markup).toContain('Kiểm Tra Kết Quả Thử Thách')
    expect(markup).toContain('Đặt lại thao tác')

    // Ensure NO pre-baked success celebration banner is shown initially
    expect(markup).not.toContain('XUẤT SẮC BÉ ƠI! BẠN ĐÃ VƯỢT QUA THỬ THÁCH')
  })
})

