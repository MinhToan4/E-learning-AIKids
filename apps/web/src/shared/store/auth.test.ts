import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  clearAccessToken: vi.fn(),
  disconnectFirebaseSession: vi.fn().mockResolvedValue(undefined),
  signInWithFirebasePassword: vi.fn().mockResolvedValue('firebase-id-token'),
  registerWithFirebasePassword: vi.fn(),
  changeFirebasePassword: vi.fn(),
  clearOfflineLearningData: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/shared/lib/api', () => ({
  api: mocks.api,
  clearAccessToken: mocks.clearAccessToken,
}))

vi.mock('@/shared/lib/firebase-client', () => ({
  disconnectFirebaseSession: mocks.disconnectFirebaseSession,
  signInWithFirebasePassword: mocks.signInWithFirebasePassword,
  registerWithFirebasePassword: mocks.registerWithFirebasePassword,
  changeFirebasePassword: mocks.changeFirebasePassword,
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

  it('signs adults in with Firebase and exchanges the ID token for an account session', async () => {
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
      .loginAdult('admin@example.test', 'example-password')

    expect(user.role).toBe('admin')
    expect(mocks.signInWithFirebasePassword).toHaveBeenCalledWith(
      'admin@example.test',
      'example-password',
    )
    expect(mocks.api).toHaveBeenNthCalledWith(
      1,
      '/api/auth/login/firebase',
      {
        method: 'POST',
        body: JSON.stringify({
          idToken: 'firebase-id-token',
          role: 'parent',
        }),
      },
    )
  })

  it('logs in adults with a username directly via core account API', async () => {
    mocks.api
      .mockResolvedValueOnce({
        user: {
          id: 'admin-1',
          role: 'admin',
          email: null,
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
        contexts: [
          {
            id: 'platform:admin-1',
            type: 'platform',
            label: 'Quản trị AIKid',
            defaultRoute: '/admin',
            actor: 'admin',
            roles: ['admin'],
            permissions: ['platform.admin'],
          },
        ],
        active: null,
      })
      .mockResolvedValueOnce({ accessToken: 'admin-token' })

    const user = await useAuth
      .getState()
      .loginAdult('storymee-admin', 'admin-password')

    expect(user.role).toBe('admin')
    expect(mocks.signInWithFirebasePassword).not.toHaveBeenCalled()
    expect(mocks.api).toHaveBeenNthCalledWith(
      1,
      '/api/auth/login/adult',
      {
        method: 'POST',
        body: JSON.stringify({ login: 'storymee-admin', password: 'admin-password' }),
      },
    )
  })

  it('fails closed and clears learner state when the JWT expires', () => {
    useAuth.setState({
      user: {
        id: 'child-1',
        role: 'student',
        email: null,
        nickname: 'Mây',
        avatarId: null,
        level: 2,
        xp: 20,
        onboarded: true,
        goal: null,
        parentId: 'parent-1',
        classId: null,
      },
    })

    useAuth.getState().expireSession()

    expect(useAuth.getState().user).toBeNull()
    expect(useAuth.getState().error).toContain('hết hạn')
    expect(mocks.clearAccessToken).toHaveBeenCalled()
    expect(mocks.clearOfflineLearningData).toHaveBeenCalled()
  })

  it('creates the credential in Firebase and sends only its token to core Account', async () => {
    const sendVerification = vi.fn().mockResolvedValue(undefined)
    mocks.registerWithFirebasePassword.mockResolvedValueOnce({
      idToken: 'new-firebase-token',
      sendVerification,
    })
    mocks.api
      .mockResolvedValueOnce({
        user: {
          id: 'parent-1', role: 'parent', email: 'parent@example.test', nickname: 'An',
          avatarId: null, level: 1, xp: 0, onboarded: true, goal: null,
          parentId: null, classId: null,
        },
      })
      .mockResolvedValueOnce({ contexts: [], active: null })

    await useAuth.getState().registerAdult(
      'parent@example.test', 'example-password', 'parent', 'An', true,
    )

    expect(mocks.registerWithFirebasePassword)
      .toHaveBeenCalledWith('parent@example.test', 'example-password')
    expect(mocks.api).toHaveBeenNthCalledWith(1, '/api/auth/login/firebase', {
      method: 'POST',
      body: JSON.stringify({
        idToken: 'new-firebase-token',
        role: 'parent',
        registration: true,
        nickname: 'An',
        parentalConsentAccepted: true,
        termsAccepted: true,
      }),
    })
    expect(sendVerification).toHaveBeenCalled()
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
