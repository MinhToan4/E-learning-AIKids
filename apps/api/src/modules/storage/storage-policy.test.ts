import { describe, expect, it } from 'vitest'
import { buildObjectPath, validateUpload } from './storage-policy.js'

describe('direct upload policy', () => {
  const userId = '11111111-1111-4111-8111-111111111111'
  const objectId = '22222222-2222-4222-8222-222222222222'

  it('generates an owner-scoped path and ignores the original file name', () => {
    expect(buildObjectPath({ userId, objectId, purpose: 'portfolio', mime: 'image/webp' }))
      .toBe(`users/${userId}/portfolio/${objectId}.webp`)
  })

  it('rejects executable MIME types and oversized avatars', () => {
    expect(() => validateUpload({ purpose: 'portfolio', mime: 'application/x-msdownload', size: 10 }))
      .toThrow('Định dạng')
    expect(() => validateUpload({ purpose: 'avatar', mime: 'image/png', size: 6 * 1024 * 1024 }))
      .toThrow('Kích thước')
  })
})
