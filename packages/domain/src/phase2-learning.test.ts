import { describe, expect, it } from 'vitest'
import {
  ageBandForBirthDate,
  buildCoursePathway,
  mergeLearningResume,
  type CoursePathInput,
} from './phase2-learning.js'

describe('phase 2 age policy', () => {
  const asOf = new Date('2026-07-26T00:00:00.000Z')

  it('derives the three customer age bands from the child profile', () => {
    expect(ageBandForBirthDate(new Date('2019-07-27'), asOf)).toBe('6_8')
    expect(ageBandForBirthDate(new Date('2015-07-26'), asOf)).toBe('9_11')
    expect(ageBandForBirthDate(new Date('2013-01-01'), asOf)).toBe('11_plus')
  })

  it('rejects dates that cannot represent a child profile', () => {
    expect(() =>
      ageBandForBirthDate(new Date('2027-01-01'), asOf),
    ).toThrow('birth date')
  })
})

describe('phase 2 course pathway', () => {
  const courses: CoursePathInput[] = [
    {
      id: 'course-a',
      title: 'Khóa A',
      entitled: true,
      completionPercent: 100,
      allowedAgeBands: ['9_11'],
      prerequisites: [],
      availableFrom: null,
      manuallyAllowed: null,
    },
    {
      id: 'course-b',
      title: 'Khóa B',
      entitled: true,
      completionPercent: 0,
      allowedAgeBands: ['9_11'],
      prerequisites: ['course-a'],
      availableFrom: null,
      manuallyAllowed: null,
    },
    {
      id: 'course-c',
      title: 'Khóa C',
      entitled: false,
      completionPercent: 0,
      allowedAgeBands: ['9_11'],
      prerequisites: [],
      availableFrom: null,
      manuallyAllowed: null,
    },
  ]

  it('opens a course only when entitlement, age, time and prerequisites pass', () => {
    const result = buildCoursePathway(courses, {
      ageBand: '9_11',
      now: new Date('2026-07-26T00:00:00.000Z'),
    })

    expect(result.find((row) => row.id === 'course-a')?.status).toBe('completed')
    expect(result.find((row) => row.id === 'course-b')).toMatchObject({
      status: 'available',
      reasonCode: 'requirements_met',
    })
    expect(result.find((row) => row.id === 'course-c')).toMatchObject({
      status: 'locked',
      reasonCode: 'not_entitled',
    })
  })

  it('returns a safe reason and honors an audited manual override', () => {
    const blocked = buildCoursePathway(
      [
        {
          ...courses[1]!,
          prerequisites: ['missing-course'],
          manuallyAllowed: null,
        },
      ],
      { ageBand: '9_11', now: new Date('2026-07-26T00:00:00.000Z') },
    )
    expect(blocked[0]).toMatchObject({
      status: 'locked',
      reasonCode: 'prerequisite_incomplete',
    })

    const overridden = buildCoursePathway(
      [{ ...courses[1]!, prerequisites: ['missing-course'], manuallyAllowed: true }],
      { ageBand: '9_11', now: new Date('2026-07-26T00:00:00.000Z') },
    )
    expect(overridden[0]).toMatchObject({
      status: 'available',
      reasonCode: 'manual_override',
    })
  })
})

describe('offline learning progress merge', () => {
  it('never lets an older/offline event reduce server completion', () => {
    const merged = mergeLearningResume(
      {
        percent: 80,
        positionSeconds: 420,
        sectionId: 'section-4',
        occurredAt: new Date('2026-07-26T10:00:00.000Z'),
      },
      {
        percent: 45,
        positionSeconds: 220,
        sectionId: 'section-2',
        occurredAt: new Date('2026-07-26T09:00:00.000Z'),
      },
    )

    expect(merged).toMatchObject({
      percent: 80,
      positionSeconds: 420,
      sectionId: 'section-4',
    })
  })

  it('uses the newest position while keeping completion monotonic', () => {
    const merged = mergeLearningResume(
      {
        percent: 80,
        positionSeconds: 420,
        sectionId: 'section-4',
        occurredAt: new Date('2026-07-26T10:00:00.000Z'),
      },
      {
        percent: 60,
        positionSeconds: 610,
        sectionId: 'section-6',
        occurredAt: new Date('2026-07-26T11:00:00.000Z'),
      },
    )

    expect(merged).toMatchObject({
      percent: 80,
      positionSeconds: 610,
      sectionId: 'section-6',
      occurredAt: new Date('2026-07-26T11:00:00.000Z'),
    })
  })
})
