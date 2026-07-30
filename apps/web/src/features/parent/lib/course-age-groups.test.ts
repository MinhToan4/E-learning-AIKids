import { describe, expect, it } from 'vitest'
import { buildCourseAgeGroups } from './course-age-groups'

describe('buildCourseAgeGroups', () => {
  it('derives and sorts groups from course data instead of frontend constants', () => {
    expect(buildCourseAgeGroups([
      { ageTrack: 'L2', ageLabel: '10–11 tuổi' },
      { ageTrack: 'L1', ageLabel: '8–9 tuổi' },
      { ageTrack: 'L3', ageLabel: '11+ tuổi' },
      { ageTrack: 'L2', ageLabel: '9–11 tuổi' },
      { ageTrack: 'L1', ageLabel: '6–8 tuổi' },
    ])).toEqual([
      { id: 'L1', label: '6–8 tuổi' },
      { id: 'L2', label: '9–11 tuổi' },
      { id: 'L3', label: '11+ tuổi' },
    ])
  })

  it('uses the database age label when no track metadata exists', () => {
    expect(buildCourseAgeGroups([
      { ageTrack: '', ageLabel: '12–15 tuổi' },
    ])).toEqual([{ id: '12–15 tuổi', label: '12–15 tuổi' }])
  })
})
