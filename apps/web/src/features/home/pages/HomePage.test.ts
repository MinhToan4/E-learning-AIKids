import { describe, expect, it } from 'vitest'
import type { CourseSummary } from '@/shared/lib/api'
import { coursesWithEnrollments } from './HomePage'

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
})
