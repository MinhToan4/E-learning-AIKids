import { describe, expect, it } from 'vitest'
import {
  normalizeLearningGatewayRequest,
  normalizeLearningGatewayResponse,
} from './learning-normalizer'

describe('learning gateway notification routes', () => {
  it('preserves notification list query parameters on the gateway route', () => {
    expect(normalizeLearningGatewayRequest('/api/notifications?limit=15')).toEqual({
      path: '/api/v1/notifications?limit=15',
      options: {},
    })
  })
})

describe('backpack overview route', () => {
  it('loads one gallery payload and splits assets from projects locally', () => {
    expect(normalizeLearningGatewayRequest('/api/backpack/overview')).toEqual({
      path: '/api/v1/media/gallery?limit=50&includeTotal=0',
      options: {},
    })

    expect(normalizeLearningGatewayResponse('/api/backpack/overview', {
      items: [
        { id: 'asset-1', title: 'Ảnh đại diện', url: '/avatar.webp', type: 'image' },
        {
          id: 'project-1',
          title: 'Tranh của Bo',
          url: '/project.webp',
          metadata: { purpose: 'creative_workshop', creativeKind: 'image' },
        },
      ],
    })).toMatchObject({
      assets: [{ id: 'asset-1' }],
      projects: [{ id: 'project-1', title: 'Tranh của Bo' }],
    })
  })

  it('correctly classifies aikid character and play creations as projects', () => {
    expect(normalizeLearningGatewayResponse('/api/backpack/overview', {
      items: [
        {
          id: 'char-1',
          name: 'Chú Mèo Vàng',
          url: '/cat.webp',
          tags: ['product:aikid', 'kind:character', 'child:bo-123'],
          metadata: { assetType: 'aikid-character', originalName: 'Chú Mèo Vàng' },
        },
        {
          id: 'art-1',
          name: 'Tranh màu nước',
          url: '/art.webp',
          tags: ['product:aikid', 'child:bo-123'],
          metadata: { creativeKind: 'art', purpose: 'creative_workshop' },
        },
      ],
    })).toMatchObject({
      assets: [],
      projects: [
        { id: 'char-1', title: 'Chú Mèo Vàng', kind: 'character' },
        { id: 'art-1', title: 'Tranh màu nước', kind: 'art' },
      ],
    })
  })
})
