import { describe, expect, it } from 'vitest'
import type { CourseSummary } from '@/shared/lib/api'
import { courseBadge, coursesWithEnrollments } from './HomePage'

const course = (id: string): CourseSummary => ({
  id,
  title: id,
  shortTitle: id,
  tagline: '',
  description: '',
  accent: '#fff',
  coverImage: null,
  ageTrack: 'L2',
  ageLabel: '9–11 tuổi',
  durationLabel: '',
  productLabel: '',
  status: 'open',
  enrolled: false,
  recommended: false,
  coverFrom: '#fff',
  coverTo: '#fff',
  questCount: 0,
  skills: [],
  quests: [],
})

describe('coursesWithEnrollments', () => {
  it('shows only canonical active/completed LMS enrollments as enrolled', () => {
    const result = coursesWithEnrollments(
      [course('ai'), course('film'), course('new')],
      [
        {
          courseId: 'ai',
          status: 'active',
          progress: [
            { status: 'completed', stars: 3 },
            { status: 'available', stars: 0 },
          ],
        },
        { courseId: 'film', status: 'completed', progress: [{ status: 'completed', stars: 2 }] },
      ],
    )

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'ai', enrolled: true, completedCount: 1, questCount: 2, totalStars: 3, progressPct: 50 }),
      expect.objectContaining({ id: 'film', enrolled: true, completedCount: 1, progressPct: 100 }),
      expect.objectContaining({ id: 'new', enrolled: false, progressPct: 0 }),
    ]))
  })

  it('uses canonical pathway stations when the pathway does not expose legacy progress', () => {
    const result = coursesWithEnrollments(
      [course('ai')],
      [{
        courseId: 'ai',
        status: 'active',
        stations: [
          { status: 'completed', stars: 3 },
          { status: 'in_progress', stars: 1 },
        ],
      }],
    )

    expect(result[0]).toMatchObject({
      enrolled: true,
      completedCount: 1,
      questCount: 2,
      totalStars: 4,
      progressPct: 50,
    })
  })
})

describe('courseBadge', () => {
  it('turns internal course keys into a short child-facing level label', () => {
    expect(courseBadge({ ...course('course-123'), courseKey: 'l2-k7-hieu-va-dung-ai' })).toBe('L2')
    expect(courseBadge(course('l1-k7-ai-ban-cua-em'))).toBe('L1')
  })
})
