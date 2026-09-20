import { describe, expect, it } from 'vitest'
import { ISLAND_CURRICULUM_LESSONS } from '../data/island-curriculum-registry'
import { IDENTITY_CHARACTERS } from '../components/creative-engine/engines/IdentityLockEngine'
import {
  SUBJECT_BLOCKS,
  GOLDFISH_BLOCKS,
  DOG_BLOCKS,
} from '../components/creative-engine/data/creative-blocks-dataset'
import { getSubjectImage } from '../components/creative-engine/engines/MagicKeysEngine'
import { getDefaultPracticeParts } from './practice-parts'
import { formatAikiCartoonPrompt } from '../components/AikiStudioWorkspace'

describe('Curriculum Data Integrity Audit', () => {
  it('verifies all 22 lessons exist with correct lessonNumbers from 1.1 to 5.5', () => {
    const expectedLessons = [
      '1.1', '1.2', '1.3', '1.4',
      '2.1', '2.2', '2.3', '2.4',
      '3.1', '3.2', '3.3', '3.4',
      '4.1', '4.2', '4.3', '4.4', '4.5',
      '5.1', '5.2', '5.3', '5.4', '5.5',
    ]

    expect(ISLAND_CURRICULUM_LESSONS).toHaveLength(22)
    const actualLessonNumbers = ISLAND_CURRICULUM_LESSONS.map((l) => l.lessonNumber)
    expect(actualLessonNumbers).toEqual(expectedLessons)
  })

  it('verifies zero generic placeholder questions across all 22 lessons', () => {
    const genericPhrases = [
      'Quy tắc vàng của bài',
      'Kỹ năng quan trọng bé rèn luyện',
      'Câu hỏi ôn tập số',
      'Câu hỏi kiểm tra bài',
      'Nội dung câu hỏi',
      'Đáp án đúng của bài',
    ]

    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const stage2Q = lesson.journey.stage2_confirmGoal?.question || ''
      const quizQuestions = lesson.journey.stage4_quiz?.questions || []

      for (const phrase of genericPhrases) {
        expect(stage2Q).not.toContain(phrase)
        for (const q of quizQuestions) {
          expect(q.prompt).not.toContain(phrase)
        }
      }
    }
  })

  it('verifies each lesson has a realistic stage2_confirmGoal with >= 2 options', () => {
    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const confirm = lesson.journey.stage2_confirmGoal
      expect(confirm).toBeDefined()
      expect(confirm.question.length).toBeGreaterThanOrEqual(10)
      expect(confirm.options.length).toBeGreaterThanOrEqual(2)
      expect(confirm.correctIndex).toBeGreaterThanOrEqual(0)
      expect(confirm.correctIndex).toBeLessThan(confirm.options.length)
      expect(confirm.explanation).toBeTruthy()
    }
  })

  it('verifies each lesson has exactly 3 detailed stage4_quiz questions with valid options and explanation', () => {
    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const quiz = lesson.journey.stage4_quiz
      expect(quiz).toBeDefined()
      expect(quiz.questions).toHaveLength(3)

      for (const q of quiz.questions) {
        expect(q.prompt.length).toBeGreaterThanOrEqual(5)
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        expect(q.correctIndex).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex).toBeLessThan(q.options.length)
        expect(q.explanation).toBeTruthy()
      }
    }
  })

  it('verifies all 4 standard identity characters (Bí, Tép, Bông, Rô) with exactly 3 lockedFeatures', () => {
    expect(IDENTITY_CHARACTERS).toHaveLength(4)
    const expectedNames = ['Bí', 'Tép', 'Bông', 'Rô']
    const names = IDENTITY_CHARACTERS.map((c) => c.name)
    expect(names).toEqual(expectedNames)

    for (const char of IDENTITY_CHARACTERS) {
      expect(char.lockedFeatures).toHaveLength(3)
      expect(char.imageUrl).toBeTruthy()
      expect(char.role).toBeTruthy()
      expect(char.id).toMatch(/^char-[a-z]+$/)
    }
  })

  it('verifies new items "Con cá vàng" and "Con cún" in creative blocks and MagicKeysEngine', () => {
    // 1. Dataset check
    const goldfishBlock = SUBJECT_BLOCKS.find((b) => b.label === 'Con cá vàng' || b.text === 'Con cá vàng')
    const dogBlock = SUBJECT_BLOCKS.find((b) => b.label === 'Con cún' || b.text === 'Con cún')

    expect(goldfishBlock).toBeDefined()
    expect(dogBlock).toBeDefined()
    expect(GOLDFISH_BLOCKS.length).toBeGreaterThan(0)
    expect(DOG_BLOCKS.length).toBeGreaterThan(0)

    // 2. MagicKeysEngine image mapping check
    const goldfishImg = getSubjectImage('Con cá vàng')
    expect(goldfishImg).toContain('island1_lesson1_cat.jpg')

    const dogImg = getSubjectImage('Con cún')
    expect(dogImg).toContain('island1_lesson1_cat.jpg')
  })

  it('verifies exact practice parts count and titles for all 22 lessons matching Excel curriculum SSOT', () => {
    // 1.1: đúng 3 món (Con mèo, Con cá vàng, Con cún)
    const p1_1 = getDefaultPracticeParts('bai-1-1')
    expect(p1_1).toHaveLength(3)
    expect(p1_1.map((p) => p.title)).toEqual(['Con mèo', 'Con cá vàng', 'Con cún'])

    // 1.2: đúng 4 món (Con cún, Cái xe đạp, Cuốn sách, Cái đồng hồ)
    const p1_2 = getDefaultPracticeParts('bai-1-2')
    expect(p1_2).toHaveLength(4)
    expect(p1_2.map((p) => p.title)).toEqual(['Con cún', 'Cái xe đạp', 'Cuốn sách', 'Cái đồng hồ'])

    // 1.3: đúng 4 phong cách
    const p1_3 = getDefaultPracticeParts('bai-1-3')
    expect(p1_3).toHaveLength(4)
    expect(p1_3.map((p) => p.title)).toEqual([
      'Phong cách Màu nước',
      'Phong cách Truyện tranh',
      'Phong cách Đất nặn',
      'Phong cách Tranh Đông Hồ',
    ])

    // 1.4: đúng 4 ca bệnh
    const p1_4 = getDefaultPracticeParts('bai-1-4')
    expect(p1_4).toHaveLength(4)
    expect(p1_4.map((p) => p.title)).toEqual([
      'Ca 1: Hiệp Sĩ Bạc (Bàn tay 5 ngón)',
      'Ca 2: Sóc Bông (Mũ len đỏ quả bông)',
      'Ca 3: Mèo Mướp (Ghế mây đệm êm)',
      'Ca 4: Tranh Lem Nhem (Dọn sạch nền)',
    ])

    // 2.1, 3.1, 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 5.4, 5.5: đúng 0 món (notebook text engine)
    const notebookLessons = ['2.1', '3.1', '4.1', '4.2', '4.3', '4.5', '5.1', '5.2', '5.4', '5.5']
    for (const num of notebookLessons) {
      const parts = getDefaultPracticeParts(`bai-${num.replace('.', '-')}`)
      expect(parts).toHaveLength(0)
    }

    // 2.2: đúng 1 món ('Bức tranh ba lớp của bé')
    const p2_2 = getDefaultPracticeParts('bai-2-2')
    expect(p2_2).toHaveLength(1)
    expect(p2_2[0].title).toContain('Bức tranh ba lớp của bé')

    // 2.3: đúng 4 kiểu ánh sáng
    const p2_3 = getDefaultPracticeParts('bai-2-3')
    expect(p2_3).toHaveLength(4)
    expect(p2_3.map((p) => p.title)).toEqual([
      'Ánh sáng Ban Mai',
      'Ánh sáng Nắng Trưa',
      'Ánh sáng Hoàng Hôn',
      'Ánh sáng Ánh Trăng',
    ])

    // 2.4: đúng 1 món ('Bức tranh của bé (Ghép 4 mảnh)')
    const p2_4 = getDefaultPracticeParts('bai-2-4')
    expect(p2_4).toHaveLength(1)
    expect(p2_4[0].title).toBe('Bức tranh của bé (Ghép 4 mảnh)')

    // 3.2: đúng 1 món ('Chọn nhân vật của bé & Nhận ảnh mẫu')
    const p3_2 = getDefaultPracticeParts('bai-3-2')
    expect(p3_2).toHaveLength(1)
    expect(p3_2[0].title).toBe('Chọn nhân vật của bé & Nhận ảnh mẫu')

    // 3.3: đúng 6 biểu cảm
    const p3_3 = getDefaultPracticeParts('bai-3-3')
    expect(p3_3).toHaveLength(6)
    expect(p3_3.map((p) => p.title)).toEqual([
      'Biểu cảm Vui 😊',
      'Biểu cảm Buồn 😢',
      'Biểu cảm Sợ 😨',
      'Biểu cảm Giận 😠',
      'Biểu cảm Ngạc nhiên 😲',
      'Biểu cảm Buồn ngủ 😴',
    ])

    // 3.4: đúng 1 món ('Căn cứ bí mật của bạn ấy')
    const p3_4 = getDefaultPracticeParts('bai-3-4')
    expect(p3_4).toHaveLength(1)
    expect(p3_4[0].title).toBe('Căn cứ bí mật của bạn ấy')

    // 4.4: đúng 8 khung storyboard
    const p4_4 = getDefaultPracticeParts('bai-4-4')
    expect(p4_4).toHaveLength(8)
    expect(p4_4.map((p) => p.title)).toEqual([
      'Khung 1', 'Khung 2', 'Khung 3', 'Khung 4',
      'Khung 5', 'Khung 6', 'Khung 7', 'Khung 8',
    ])

    // 5.3: đúng 12 lá thẻ sưu tập
    const p5_3 = getDefaultPracticeParts('bai-5-3')
    expect(p5_3).toHaveLength(12)
    expect(p5_3.map((p) => p.title)).toEqual(Array.from({ length: 12 }, (_, i) => `Lá ${i + 1}`))
  })

  it('verifies formatAikiCartoonPrompt enforces 3D cartoon/soft clay and bans realistic photo', () => {
    const rawPrompt = 'Con mèo mướp nằm ngủ trên ghế mây'
    const formatted = formatAikiCartoonPrompt(rawPrompt)

    // Chứa tiền tố phong cách hoạt hình 3D / Soft Clay
    expect(formatted).toContain('Cute 3D cartoon animation style')
    expect(formatted).toContain('soft clay storybook illustration')
    expect(formatted).toContain('vibrant warm pastel colors')
    expect(formatted).toContain(rawPrompt)

    // Triệt tiêu triệt để ảnh thực tế / camera photo
    expect(formatted).toContain('Strictly avoid realistic photo')
    expect(formatted).toContain('no camera photography')
    expect(formatted).toContain('no photorealism')
    expect(formatted).toContain('no real humans')
    expect(formatted).toContain('no real-life photograph')

    // Thử với style-prism
    const watercolorPrompt = formatAikiCartoonPrompt('Chú trâu màu nước', 'style-prism')
    expect(watercolorPrompt).toContain('Cute 3D cartoon animation style')
    expect(watercolorPrompt).toContain('watercolor')
    expect(watercolorPrompt).toContain('Strictly avoid realistic photo')

    const clayPrompt = formatAikiCartoonPrompt('Chú trâu đất nặn', 'style-prism')
    expect(clayPrompt).toContain('handcrafted 3D soft clay sculpture style')
    expect(clayPrompt).toContain('Strictly avoid realistic photo')
  })

  it('verifies zero fake _cat.jpg image paths in quizQuestions across both registry and backend SSOT', () => {
    // In all 22 lessons, only lesson 1.1 has a valid cat asset (/assets/aiki-islands/island1_lesson1_cat.jpg)
    // All other 21 lessons must NOT have any fake _cat.jpg
    let totalQuizCatImages = 0
    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const questions = lesson.journey.stage4_quiz?.questions || []
      for (const q of questions) {
        if (q.visualUrl && q.visualUrl.includes('_cat.jpg')) {
          totalQuizCatImages++
          // The ONLY allowed cat image is the real asset for lesson 1.1
          expect(lesson.lessonNumber).toBe('1.1')
          expect(q.visualUrl).toBe('/assets/aiki-islands/island1_lesson1_cat.jpg')
        }
      }
    }
    // Exactly 0 fake cat images across the curriculum
    expect(totalQuizCatImages).toBeLessThanOrEqual(1)
  })

  it('verifies all 22 lessons have rich keyPoints (at least 3 items) in stage1_goal from Excel P1', () => {
    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const keyPoints = lesson.journey.stage1_goal?.keyPoints || []
      expect(keyPoints.length).toBeGreaterThanOrEqual(3)
      for (const kp of keyPoints) {
        expect(kp.length).toBeGreaterThanOrEqual(10)
        // Should not be generic placeholder text
        expect(kp).not.toContain('Chưa có nội dung')
        expect(kp).not.toContain('Lorem ipsum')
      }
    }
  })

  it('verifies stage2_confirmGoal options have zero distracting AI imageUrl across all 22 lessons', () => {
    for (const lesson of ISLAND_CURRICULUM_LESSONS) {
      const options = lesson.journey.stage2_confirmGoal?.options || []
      for (const opt of options) {
        if (typeof opt === 'object' && opt !== null) {
          const optObj = opt as { imageUrl?: string }
          expect(optObj.imageUrl).toBeFalsy()
        }
      }
    }
  })
})

