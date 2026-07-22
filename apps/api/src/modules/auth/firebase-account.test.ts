import { describe, expect, it } from 'vitest'
import { assertFirebaseAccountRole } from './firebase-account.js'

describe('Firebase account policy', () => {
  it('keeps student authentication on the nickname/PIN flow', () => {
    expect(() => assertFirebaseAccountRole('student')).toThrow(
      'Hồ sơ học sinh không đăng nhập bằng StoryMee',
    )
  })

  it.each(['parent', 'teacher', 'admin'])(
    'allows an existing %s account to link Firebase identity',
    (role) => {
      expect(() => assertFirebaseAccountRole(role)).not.toThrow()
    },
  )
})
