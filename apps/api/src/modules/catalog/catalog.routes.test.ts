import { describe, expect, it } from 'vitest'
import { parseCourseRecognition } from './catalog.routes.js'

describe('parseCourseRecognition', () => {
  it('returns null for legacy or malformed metadata', () => {
    expect(parseCourseRecognition(null)).toBeNull()
    expect(parseCourseRecognition('{}')).toBeNull()
    expect(parseCourseRecognition('{broken')).toBeNull()
  })

  it('keeps complete recognition metadata', () => {
    const value = {
      issuer: 'AI Kids Creator Academy',
      credential: 'Huy hiệu hoàn thành',
      finalAssessment: 'Hoàn thành sản phẩm cuối khóa',
      frameworks: [{ code: 'K1', title: 'Khung tham chiếu' }],
      disclaimer: 'Không phải chứng nhận của cơ quan quản lý nhà nước.',
    }
    expect(parseCourseRecognition(JSON.stringify(value))).toEqual(value)
  })
})
