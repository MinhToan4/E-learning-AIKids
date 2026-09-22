import { describe, expect, it } from 'vitest'
import { avatarImage } from './avatars'

describe('avatarImage', () => {
  it('keeps canonical remote and gateway avatar URLs', () => {
    expect(avatarImage('https://media.aikid.vn/avatar.webp')).toBe('https://media.aikid.vn/avatar.webp')
    expect(avatarImage('/api/v1/media/avatar/child-1')).toBe('/api/v1/media/avatar/child-1')
  })

  it('resolves catalog avatar ids', () => {
    expect(avatarImage('avatar-robot')).toBeTruthy()
  })
})
