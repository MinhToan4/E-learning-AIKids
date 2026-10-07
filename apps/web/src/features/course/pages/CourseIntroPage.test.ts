import { describe, expect, it } from 'vitest'
import { ApiError } from '@/shared/lib/api'
import {
  courseSkills,
  courseStartError,
  hasActiveCourseEnrollment,
} from './CourseIntroPage'

describe('courseSkills', () => {
  it('keeps skills returned by the course contract', () => {
    expect(courseSkills({ skills: ['Đặt câu hỏi rõ ràng'] })).toEqual([
      'Đặt câu hỏi rõ ràng',
    ])
  })

  it.each([{ skills: undefined }, { skills: null }, { skills: [] }])(
    'falls back when an older course projection omits skills',
    (course) => {
      expect(courseSkills(course)).toEqual([
        'An toàn và trách nhiệm khi sáng tạo với AI',
      ])
    },
  )
})

describe('course enrollment state', () => {
  it('matches the canonical course UUID instead of the route slug', () => {
    expect(hasActiveCourseEnrollment(
      [{ courseId: 'course-uuid', status: 'active' }],
      { id: 'course-uuid' },
    )).toBe(true)
  })

  it('does not unlock inactive enrollment rows', () => {
    expect(hasActiveCourseEnrollment(
      [{ courseId: 'course-uuid', status: 'cancelled' }],
      { id: 'course-uuid' },
    )).toBe(false)
  })

  it('explains when a parent must select the course', () => {
    expect(courseStartError(new ApiError(403, 'Error', {
      code: 'PARENT_SELECTION_REQUIRED',
    }))).toContain('Ba / Mẹ')
  })
})
