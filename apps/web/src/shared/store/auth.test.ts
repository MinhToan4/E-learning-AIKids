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

  it('selects the platform context for an admin that also has a parent persona', async () => {
    mocks.api
      .mockResolvedValueOnce({
        user: {
          id: 'admin-parent-1',
          role: 'parent',
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
        personas: ['parent'],
        platformRoles: ['platform_admin'],
        active: {
          mode: 'family',
          contextId: 'family:admin-parent-1',
        },
        contexts: [
          {
            id: 'family:admin-parent-1',
            type: 'family',
            label: 'Gia đình của tôi',
            defaultRoute: '/parent',
            actor: 'parent',
            roles: ['parent'],
            permissions: ['family.children.manage'],
          },
          {
            id: 'platform:admin-parent-1',
            type: 'platform',
            label: 'Quản trị AIKid',
            defaultRoute: '/admin',
            actor: 'admin',
            roles: ['platform_admin'],
            permissions: ['platform.admin'],
          },
        ],
      })
      .mockResolvedValueOnce({
        accessToken: 'platform-token',
      })

    const user = await useAuth
      .getState()
      .loginAdult('storymee-admin', 'example-password')

    expect(user.role).toBe('admin')
    expect(useAuth.getState().activeContext?.actor).toBe('admin')
    expect(mocks.api).toHaveBeenNthCalledWith(
      3,
      '/api/auth/context',
      {
        method: 'POST',
        body: JSON.stringify({ contextId: 'platform:admin-parent-1' }),
      },
    )
  })
})
