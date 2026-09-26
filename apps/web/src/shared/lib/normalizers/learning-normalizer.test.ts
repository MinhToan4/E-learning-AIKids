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
})
