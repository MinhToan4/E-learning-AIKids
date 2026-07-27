import { beforeEach, describe, expect, it, vi } from 'vitest'

const { apiMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
}))

vi.mock('@/shared/config/environment', () => ({
  environment: { isLocalApi: true },
}))

vi.mock('./api', () => ({
  api: apiMock,
  fetchRemoteBlob: vi.fn(),
  openAuthorizedStream: vi.fn(),
}))

import {
  generateCreativeImage,
  generateCreativeStory,
  saveCreativeImage,
  saveCreativeStory,
} from './creative-api'

describe('creative API in standalone Docker mode', () => {
  beforeEach(() => {
    apiMock.mockReset()
  })

  it('saves the sketch then generates a persisted child-owned image', async () => {
    apiMock
      .mockResolvedValueOnce({
        asset: {
          id: '11111111-1111-4111-8111-111111111111',
          url: 'data:image/png;base64,AAAA',
        },
      })
      .mockResolvedValueOnce({
        asset: {
          id: '22222222-2222-4222-8222-222222222222',
          url: 'https://cdn.example.test/art.png',
        },
      })

    const output = await generateCreativeImage({
      kind: 'art',
      title: 'Khu vườn của con',
      prompt: 'Một khu vườn vui vẻ',
      imageDataUrl: 'data:image/png;base64,AAAA',
      details: { styleId: 'watercolor' },
    })

    expect(apiMock).toHaveBeenNthCalledWith(
      1,
      '/api/creative/sketch',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('sketchDataUrl'),
      }),
    )
    expect(apiMock).toHaveBeenNthCalledWith(
      2,
      '/api/creative/create',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(
          '11111111-1111-4111-8111-111111111111',
        ),
      }),
    )
    expect(output).toEqual({
      url: 'https://cdn.example.test/art.png',
      assetId: '22222222-2222-4222-8222-222222222222',
      persisted: true,
    })

    await saveCreativeImage(output, {
      purpose: 'creative_workshop',
      creativeKind: 'art',
    })
    expect(apiMock).toHaveBeenCalledTimes(2)
  })

  it('uses the standalone story route and does not save the same project twice', async () => {
    apiMock.mockResolvedValueOnce({
      content: 'Ngày xưa có một chú mèo tốt bụng.',
      project: {
        id: '33333333-3333-4333-8333-333333333333',
      },
    })

    const output = await generateCreativeStory(
      'Viết truyện thiếu nhi về một chú mèo tốt bụng.',
      'Truyện mèo tốt bụng',
    )

    expect(apiMock).toHaveBeenCalledWith(
      '/api/creative/create',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"kind":"story"'),
      }),
    )
    expect(output).toEqual({
      content: 'Ngày xưa có một chú mèo tốt bụng.',
      projectId: '33333333-3333-4333-8333-333333333333',
      persisted: true,
    })

    await saveCreativeStory(output, {
      purpose: 'creative_workshop',
      creativeKind: 'story',
      title: 'Truyện mèo tốt bụng',
    })
    expect(apiMock).toHaveBeenCalledTimes(1)
  })
})
