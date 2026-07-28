import { describe, expect, it } from 'vitest'
import { buildLessonPlan } from './scheduling'

describe('buildLessonPlan', () => {
  it('builds the object expected by the scheduling API from teacher-friendly fields', () => {
    expect(
      buildLessonPlan({
        goal: '  Hiểu cách viết prompt rõ ràng  ',
        activities: 'Khởi động\nThực hành theo cặp',
        materials: '  Thẻ prompt mẫu ',
        notes: '',
      }),
    ).toEqual({
      goal: 'Hiểu cách viết prompt rõ ràng',
      activities: ['Khởi động', 'Thực hành theo cặp'],
      materials: ['Thẻ prompt mẫu'],
    })
  })

  it('does not persist blank list items or optional fields', () => {
    expect(
      buildLessonPlan({
        goal: 'Ôn tập',
        activities: '\nThảo luận\n \n',
        materials: '',
        notes: '   ',
      }),
    ).toEqual({
      goal: 'Ôn tập',
      activities: ['Thảo luận'],
    })
  })
})
