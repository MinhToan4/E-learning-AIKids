import { describe, expect, it } from 'vitest'
import { ISLAND_CURRICULUM_LESSONS } from '../data/island-curriculum-registry'
import { IDENTITY_CHARACTERS } from '../components/creative-engine/engines/IdentityLockEngine'
import {
  SUBJECT_BLOCKS,
  GOLDFISH_BLOCKS,
  DOG_BLOCKS,
} from '../components/creative-engine/data/creative-blocks-dataset'
import { getSubjectImage } from '../components/creative-engine/engines/MagicKeysEngine'

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
})
