import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './api'
import {
  profileAvatarUpdateBody,
  updateMyProfileAvatar,
  validateProfileAvatarFile,
} from './media-api'

describe('profile avatar upload validation', () => {
  it('accepts a small browser-safe image', () => {
    const file = new File(['avatar'], 'avatar.webp', { type: 'image/webp' })
    expect(() => validateProfileAvatarFile(file)).not.toThrow()
  })

  it('rejects executable image formats and oversized files', () => {
    const svg = new File(['<svg/>'], 'avatar.svg', { type: 'image/svg+xml' })
    expect(() => validateProfileAvatarFile(svg)).toThrow(/JPG, PNG hoặc WebP/)

    const large = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      'large.png',
      { type: 'image/png' },
    )
    expect(() => validateProfileAvatarFile(large)).toThrow(/nhỏ hơn 5 MB/)
  })

  it('uses media ID as the stable identity with a URL migration fallback', () => {
    expect(profileAvatarUpdateBody({
      mediaId: 'media_01JABC',
      url: 'https://storage.storymee.com/avatar.webp',
    })).toEqual({
      avatarMediaId: 'media_01JABC',
      avatarUrl: 'https://storage.storymee.com/avatar.webp',
    })
    expect(profileAvatarUpdateBody({
      url: 'https://storage.storymee.com/legacy.webp',
    })).toEqual({
      avatarUrl: 'https://storage.storymee.com/legacy.webp',
    })
  })

  it('falls back only for a legacy schema rejection', async () => {
    const request = vi.fn()
      .mockRejectedValueOnce(new ApiError(422, 'unknown avatarMediaId'))
      .mockResolvedValueOnce({})

    await updateMyProfileAvatar({
      mediaId: 'media_01JABC',
      url: 'https://storage.storymee.com/avatar.webp',
    }, request)

    expect(request).toHaveBeenNthCalledWith(1, {
      avatarMediaId: 'media_01JABC',
      avatarUrl: 'https://storage.storymee.com/avatar.webp',
    })
    expect(request).toHaveBeenNthCalledWith(2, {
      avatarUrl: 'https://storage.storymee.com/avatar.webp',
    })
  })

  it.each([401, 403])('fails closed for HTTP %s', async (status) => {
    const request = vi.fn().mockRejectedValue(new ApiError(status, 'denied'))
    await expect(updateMyProfileAvatar({
      mediaId: 'media_other_family',
      url: 'https://storage.storymee.com/avatar.webp',
    }, request)).rejects.toMatchObject({ status })
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('uploads directly with a Hub-issued session and finalizes it', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce({
        uploadId: 'upload_01',
        mediaId: 'media_01',
        uploadUrl: 'https://storage.storymee.com/uploads/signed',
        uploadHeaders: { 'Content-Type': 'image/webp' },
        expiresAt: '2026-07-31T10:30:00Z',
      })
      .mockResolvedValueOnce({
        asset: {
          id: 'media_01',
          mediaId: 'media_01',
          url: 'https://storage.storymee.com/avatar.webp',
        },
      })
    const upload = vi.fn().mockResolvedValue(undefined)
    const file = new File(['avatar'], 'avatar.webp', { type: 'image/webp' })

    const { uploadProfileAvatar } = await import('./media-api')
    await expect(uploadProfileAvatar(file, { request, upload })).resolves.toEqual({
      id: 'media_01',
      mediaId: 'media_01',
      url: 'https://storage.storymee.com/avatar.webp',
    })
    expect(upload).toHaveBeenCalledWith(
      'https://storage.storymee.com/uploads/signed',
      file,
      { 'Content-Type': 'image/webp' },
    )
    expect(request).toHaveBeenNthCalledWith(
      2,
      '/api/v1/media/upload-sessions/upload_01/finalize',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('waits on the Ubuntu backend until German-storage derivatives are ready', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce({
        uploadId: 'upload_processing',
        mediaId: 'media_processing',
        uploadUrl: 'https://storage.storymee.com/uploads/signed',
        expiresAt: '2026-07-31T10:30:00Z',
      })
      .mockResolvedValueOnce({
        asset: {
          id: 'media_processing',
          mediaId: 'media_processing',
          status: 'processing',
        },
      })
      .mockResolvedValueOnce({
        asset: {
          id: 'media_processing',
          mediaId: 'media_processing',
          status: 'ready',
          variants: {
            display: {
              url: 'https://storage.storymee.com/user-media/display.webp',
            },
            thumbnail: {
              url: 'https://storage.storymee.com/user-media/thumbnail.webp',
            },
          },
        },
      })
    const upload = vi.fn().mockResolvedValue(undefined)
    const wait = vi.fn().mockResolvedValue(undefined)
    const onStage = vi.fn()
    const file = new File(['avatar'], 'avatar.webp', { type: 'image/webp' })
    const { uploadProfileAvatar } = await import('./media-api')

    await expect(uploadProfileAvatar(file, {
      request,
      upload,
      wait,
      onStage,
    })).resolves.toEqual({
      id: 'media_processing',
      mediaId: 'media_processing',
      url: 'https://storage.storymee.com/user-media/display.webp',
      thumbnailUrl: 'https://storage.storymee.com/user-media/thumbnail.webp',
    })
    expect(wait).toHaveBeenCalledWith(1_000)
    expect(request).toHaveBeenNthCalledWith(
      3,
      '/api/v1/media/upload-sessions/upload_processing',
    )
    expect(onStage.mock.calls.map(([stage]) => stage)).toEqual([
      'creating_session',
      'uploading',
      'processing',
    ])
  })

  it.each(['failed', 'rejected'])(
    'does not equip an avatar when processing is %s',
    async (status) => {
      const request = vi.fn()
        .mockResolvedValueOnce({
          uploadId: 'upload_unsafe',
          mediaId: 'media_unsafe',
          uploadUrl: 'https://storage.storymee.com/uploads/signed',
          expiresAt: '2026-07-31T10:30:00Z',
        })
        .mockResolvedValueOnce({
          asset: {
            id: 'media_unsafe',
            mediaId: 'media_unsafe',
            status,
          },
        })
      const file = new File(['avatar'], 'avatar.webp', { type: 'image/webp' })
      const { uploadProfileAvatar } = await import('./media-api')

      await expect(uploadProfileAvatar(file, {
        request,
        upload: vi.fn().mockResolvedValue(undefined),
        wait: vi.fn().mockResolvedValue(undefined),
      })).rejects.toThrow(/chưa đạt yêu cầu an toàn/)
      expect(request).toHaveBeenCalledTimes(2)
    },
  )

  it.each([404, 405, 501])('uses legacy upload only for HTTP %s', async (status) => {
    const request = vi.fn()
      .mockRejectedValueOnce(new ApiError(status, 'not implemented'))
      .mockResolvedValueOnce({
        asset: {
          id: 'legacy_01',
          mediaId: 'legacy_01',
          url: 'https://storage.storymee.com/legacy.webp',
        },
      })
    const upload = vi.fn()
    const file = new File(['avatar'], 'avatar.webp', { type: 'image/webp' })
    const { uploadProfileAvatar } = await import('./media-api')

    await expect(uploadProfileAvatar(file, { request, upload })).resolves
      .toMatchObject({ id: 'legacy_01' })
    expect(upload).not.toHaveBeenCalled()
    expect(request).toHaveBeenNthCalledWith(
      2,
      '/api/media/upload',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it.each([401, 403, 413, 429, 500])(
    'does not downgrade session errors for HTTP %s',
    async (status) => {
      const request = vi.fn().mockRejectedValue(new ApiError(status, 'failed'))
      const upload = vi.fn()
      const file = new File(['avatar'], 'avatar.webp', { type: 'image/webp' })
      const { uploadProfileAvatar } = await import('./media-api')

      await expect(uploadProfileAvatar(file, { request, upload })).rejects
        .toMatchObject({ status })
      expect(request).toHaveBeenCalledTimes(1)
      expect(upload).not.toHaveBeenCalled()
    },
  )
})
