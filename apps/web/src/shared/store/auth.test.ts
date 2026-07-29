import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  clearAccessToken: vi.fn(),
  disconnectFirebaseSession: vi.fn().mockResolvedValue(undefined),
  clearOfflineLearningData: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/shared/lib/api', () => ({
  api: mocks.api,
  clearAccessToken: mocks.clearAccessToken,
}))

vi.mock('@/shared/lib/firebase-client', () => ({
  disconnectFirebaseSession: mocks.disconnectFirebaseSession,
}))

vi.mock('@/shared/lib/offline-storage', () => ({
  clearOfflineLearningData: mocks.clearOfflineLearningData,
}))

import { useAuth } from './auth'

describe('auth store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.setState({
      user: null,
      access: null,
      activeContext: null,
      loading: false,
      error: null,
    })
  })

  it('uses the adult login contract for admin, parent and teacher accounts', async () => {
    mocks.api
      .mockResolvedValueOnce({
        user: {
          id: 'adult-1',
          role: 'admin',
          email: 'admin@example.test',
          nickname: 'Admin',
          avatarId: null,
          level: 1,
          xp: 0,
          onboarded: true,
          goal: null,
          parentId: null,
          classId: null,
        },
      })
      .mockResolvedValueOnce({
        contexts: [],
        active: null,
      })

    const user = await useAuth
      .getState()
      .loginAdult('storymee-admin', 'example-password')

    expect(user.role).toBe('admin')
    expect(mocks.api).toHaveBeenNthCalledWith(
      1,
      '/api/auth/login/adult',
      {
        method: 'POST',
        body: JSON.stringify({
          login: 'storymee-admin',
          password: 'example-password',
        }),
      },
    )
  })
})
