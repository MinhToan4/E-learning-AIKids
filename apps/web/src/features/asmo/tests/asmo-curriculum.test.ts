import { describe, it, expect } from 'vitest'
import {
  ASMO_SUBJECTS,
  ASMO_GRADES,
  ASMO_CURRICULUM_WEEKS,
} from '../data/asmo-curriculum'
import { ASMO_SAMPLE_EXAMS } from '../data/asmo-sample-exams'

describe('ASMO Curriculum & Datasets', () => {
  it('covers all 3 subjects (Math, Science, English)', () => {
    expect(ASMO_SUBJECTS.math).toBeDefined()
    expect(ASMO_SUBJECTS.science).toBeDefined()
    expect(ASMO_SUBJECTS.english).toBeDefined()

    expect(ASMO_SUBJECTS.math.name).toContain('Toán')
    expect(ASMO_SUBJECTS.science.name).toContain('Khoa Học')
    expect(ASMO_SUBJECTS.english.name).toContain('Tiếng Anh')
  })

  it('contains valid grades 1 to 12 across 3 educational tiers', () => {
    expect(ASMO_GRADES).toHaveLength(12)
    expect(ASMO_GRADES.map((g) => g.grade)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(ASMO_GRADES.filter((g) => g.tier === 'primary')).toHaveLength(5)
    expect(ASMO_GRADES.filter((g) => g.tier === 'secondary')).toHaveLength(4)
    expect(ASMO_GRADES.filter((g) => g.tier === 'high')).toHaveLength(3)
  })

  it('contains structured curriculum weeks with key competencies', () => {
    expect(ASMO_CURRICULUM_WEEKS.length).toBeGreaterThan(0)
    ASMO_CURRICULUM_WEEKS.forEach((week) => {
      expect(week.week).toBeGreaterThan(0)
      expect(week.title).toBeTruthy()
      expect(week.keyCompetencies.length).toBeGreaterThan(0)
    })
  })

  it('has verified sample exams with questions and valid answer keys', () => {
    expect(ASMO_SAMPLE_EXAMS.length).toBeGreaterThan(0)
    ASMO_SAMPLE_EXAMS.forEach((exam) => {
      expect(exam.id).toBeTruthy()
      expect(exam.questions.length).toBeGreaterThan(0)
      expect(exam.durationMinutes).toBeGreaterThan(0)
      exam.questions.forEach((q) => {
        expect(q.id).toBeTruthy()
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        expect(q.correctAnswer).toBeTruthy()
        expect(q.explanation).toBeTruthy()
        expect(q.meeHint).toBeTruthy()
      })
    })
  })
})
