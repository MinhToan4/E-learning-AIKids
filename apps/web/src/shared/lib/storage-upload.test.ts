import { afterEach, describe, expect, it, vi } from 'vitest'
import { uploadToStoryMeeStorage } from './api'

describe('StoryMee direct storage upload', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects a signed URL on another origin before sending the file', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(uploadToStoryMeeStorage(
      'https://attacker.example/upload',
      new Blob(['avatar'], { type: 'image/webp' }),
    )).rejects.toThrow(/không thuộc StoryMee Storage/)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uploads without credentials or authorization headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await uploadToStoryMeeStorage(
      'https://storage.storymee.com/uploads/signed',
      new Blob(['avatar'], { type: 'image/webp' }),
      {
        Authorization: 'must-not-leak',
        'X-Upload-Token': 'storage-scoped-token',
      },
    )

    const [, options] = fetchMock.mock.calls[0] as [URL, RequestInit]
    const headers = new Headers(options.headers)
    expect(options.credentials).toBe('omit')
    expect(options.redirect).toBe('error')
    expect(headers.has('Authorization')).toBe(false)
    expect(headers.get('X-Upload-Token')).toBe('storage-scoped-token')
    expect(headers.get('Content-Type')).toBe('image/webp')
  })
})
