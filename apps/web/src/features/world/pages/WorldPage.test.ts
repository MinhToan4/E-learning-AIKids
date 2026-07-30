import { describe, expect, it } from 'vitest'
import { isPathwayCourseVisible } from './WorldPage'

type PathwayCourseInput = Parameters<typeof isPathwayCourseVisible>[0]

function course(
  overrides: Partial<PathwayCourseInput>,
): PathwayCourseInput {
  return {
    id: 'course-1',
    title: 'AI cơ bản',
    shortTitle: 'Khởi đầu',
    status: 'available',
    reasonCode: 'requirements_met',
    completionPercent: 0,
    missingPrerequisites: [],
    coverImage: null,
    enrolled: false,
    ...overrides,
  }
}

describe('World pathway enrollment visibility', () => {
  it('uses canonical enrollment and keeps active/completed legacy pathway rows visible', () => {
    expect(isPathwayCourseVisible(course({ enrolled: true }))).toBe(true)
    expect(isPathwayCourseVisible(course({ status: 'active' }))).toBe(true)
    expect(isPathwayCourseVisible(course({ status: 'completed' }))).toBe(true)
    expect(isPathwayCourseVisible(course({ status: 'available' }))).toBe(false)
    expect(isPathwayCourseVisible(course({ status: 'locked' }))).toBe(false)
  })
})
