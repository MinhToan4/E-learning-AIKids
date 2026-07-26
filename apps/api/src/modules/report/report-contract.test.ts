import { describe, expect, it } from 'vitest'
import { findMissingReportSections } from './report-contract.js'

describe('findMissingReportSections', () => {
  it('reports missing required sections without treating zero progress as missing', () => {
    expect(
      findMissingReportSections(
        {
          student: { nickname: 'MựcCon' },
          courses: [{ completionPercent: 0 }],
          assessments: [],
          competency: [],
          portfolio: [],
          teacherFeedback: [],
          strengths: [],
          development: [],
          nextSteps: ['Bắt đầu bài đầu tiên'],
          credentials: [],
        },
        [
          'student',
          'courses',
          'assessments',
          'teacher_feedback',
          'next_steps',
        ],
      ),
    ).toEqual(['assessments', 'teacher_feedback'])
  })
})
