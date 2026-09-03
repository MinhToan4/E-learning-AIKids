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

import { resolveLoginAlias, useAuth } from './auth'

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

  describe('resolveLoginAlias', () => {
    it('resolves storymee-admin to admin@storymee.com case-insensitively', () => {
      expect(resolveLoginAlias('storymee-admin')).toBe('admin@storymee.com')
      expect(resolveLoginAlias('StoryMee-Admin')).toBe('admin@storymee.com')
      expect(resolveLoginAlias('  STORYMEE-ADMIN  ')).toBe('admin@storymee.com')
    })

    it('retains email addresses as-is after trimming', () => {
      expect(resolveLoginAlias('admin@example.test')).toBe('admin@example.test')
      expect(resolveLoginAlias('  user@domain.vn  ')).toBe('user@domain.vn')
    })

    it('defaults non-email usernames to @storymee.vn alias', () => {
      expect(resolveLoginAlias('teacher1')).toBe('teacher1@storymee.vn')
      expect(resolveLoginAlias('Teacher_Anna')).toBe('teacher_anna@storymee.vn')
      expect(resolveLoginAlias('  user123  ')).toBe('user123@storymee.vn')
    })
  })

  it('signs adults in with normal email via Firebase and exchanges the ID token', async () => {
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

  it('automatically resolves storymee-admin to admin@storymee.com and calls signInWithFirebasePassword', async () => {
    mocks.api
      .mockResolvedValueOnce({
        user: {
          id: 'admin-1',
          role: 'admin',
          email: 'admin@storymee.com',
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
    expect(mocks.signInWithFirebasePassword).toHaveBeenCalledWith(
      'admin@storymee.com',
      'admin-password',
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

  it('falls back to /api/auth/login/adult if Firebase authentication fails with recoverable error', async () => {
    mocks.signInWithFirebasePassword.mockRejectedValueOnce({
      code: 'auth/user-not-found',
      message: 'User not found in Firebase',
    })

    mocks.api
      .mockResolvedValueOnce({
        user: {
          id: 'legacy-user-1',
          role: 'parent',
          email: 'legacy@example.test',
          nickname: 'Legacy Parent',
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
      .loginAdult('legacy@example.test', 'legacy-password')

    expect(user.id).toBe('legacy-user-1')
    expect(mocks.signInWithFirebasePassword).toHaveBeenCalledWith(
      'legacy@example.test',
      'legacy-password',
    )
    expect(mocks.api).toHaveBeenNthCalledWith(
      1,
      '/api/auth/login/adult',
      {
        method: 'POST',
        body: JSON.stringify({ login: 'legacy@example.test', password: 'legacy-password' }),
      },
    )
  })

  it('sets store error and rejects when Firebase login fails and fallback also fails', async () => {
    mocks.signInWithFirebasePassword.mockRejectedValueOnce({
      code: 'auth/invalid-credential',
      message: 'Invalid credentials',
    })
    mocks.api.mockRejectedValueOnce(new Error('Core account API rejected credentials'))

    await expect(
      useAuth.getState().loginAdult('admin@example.test', 'wrong-password'),
    ).rejects.toMatchObject({
      code: 'auth/invalid-credential',
    })

    expect(useAuth.getState().error).toBe('Thông tin đăng nhập chưa đúng. Bạn kiểm tra lại nhé.')
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
