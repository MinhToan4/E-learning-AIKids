import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/lib/api'

const mocks = vi.hoisted(() => ({
  api: vi.fn().mockResolvedValue({}),
  clearAccessToken: vi.fn(),
  getAccessToken: vi.fn(() => 'test-token'),
  clearApiCache: vi.fn(),
  disconnectFirebaseSession: vi.fn().mockResolvedValue(undefined),
  signInWithFirebasePassword: vi.fn().mockResolvedValue('firebase-id-token'),
  registerWithFirebasePassword: vi.fn(),
  changeFirebasePassword: vi.fn(),
  clearOfflineLearningData: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/shared/lib/api', () => ({
  api: mocks.api,
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
    }
  },
  clearAccessToken: mocks.clearAccessToken,
  getAccessToken: mocks.getAccessToken,
  clearApiCache: mocks.clearApiCache,
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

  it('signs parents in through Account Hub and creates the server session', async () => {
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
    expect(mocks.signInWithFirebasePassword).not.toHaveBeenCalled()
    expect(mocks.api).toHaveBeenNthCalledWith(
      1,
      '/api/auth/login/adult',
      {
        method: 'POST',
        body: JSON.stringify({ login: 'admin@example.test', password: 'example-password' }),
      },
    )
  })

  it('uses access returned by the Account Hub session without a second request', async () => {
    mocks.api.mockResolvedValueOnce({
      user: {
        id: 'parent-1', role: 'parent', email: 'parent@example.test', nickname: 'Parent',
        avatarId: null, level: 1, xp: 0, onboarded: true, goal: null,
        parentId: null, classId: null,
      },
      access: {
        contexts: [{
          id: 'family:parent-1', type: 'family', label: 'Gia đình của tôi',
          defaultRoute: '/parent', actor: 'parent', roles: ['parent'], permissions: [],
        }],
        active: { mode: 'family', contextId: 'family:parent-1' },
        personas: ['parent'],
        platformRoles: [],
      },
    })

    const user = await useAuth.getState().loginAdult('parent@example.test', 'example-password')

    expect(user.role).toBe('parent')
    expect(useAuth.getState().activeContext?.id).toBe('family:parent-1')
    expect(mocks.api).toHaveBeenCalledTimes(1)
  })

  it('skips querying /api/auth/access when a student logs in via loginAdult', async () => {
    mocks.api.mockResolvedValueOnce({
      user: {
        id: 'student-1',
        role: 'student',
        email: null,
        nickname: 'Bé Bo',
        avatarId: null,
        level: 2,
        xp: 150,
        onboarded: true,
        goal: null,
        parentId: 'parent-1',
        classId: null,
      },
    })

    const user = await useAuth.getState().loginAdult('bebo', 'password123')

    expect(user.role).toBe('student')
    expect(useAuth.getState().access).toBeNull()
    expect(useAuth.getState().activeContext).toBeNull()
    expect(mocks.api).toHaveBeenCalledTimes(1)
    expect(mocks.api).not.toHaveBeenCalledWith('/api/auth/access')
  })

  it('passes account usernames unchanged to the unified Account Hub login', async () => {
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

  it('does not reselect an already-active parent context after Firebase login', async () => {
    mocks.api
      .mockResolvedValueOnce({
        user: {
          id: 'parent-1', role: 'parent', email: 'parent@example.test', nickname: 'Parent',
          avatarId: null, level: 1, xp: 0, onboarded: true, goal: null,
          parentId: null, classId: null,
        },
      })
      .mockResolvedValueOnce({
        personas: ['parent'],
        platformRoles: [],
        active: { mode: 'family', contextId: 'family:parent-1' },
        contexts: [{
          id: 'family:parent-1', type: 'family', label: 'Gia đình của tôi',
          defaultRoute: '/parent', actor: 'parent', roles: ['parent'],
          permissions: ['family.children.manage'],
        }],
      })

    const user = await useAuth.getState().loginAdult('parent@example.test', 'valid-password')

    expect(user.role).toBe('parent')
    expect(useAuth.getState().activeContext?.id).toBe('family:parent-1')
    expect(mocks.api).toHaveBeenCalledTimes(2)
    expect(mocks.api).not.toHaveBeenCalledWith(
      '/api/auth/context',
      expect.anything(),
    )
  })

  it('supports a Supabase account that has not been mirrored to Firebase', async () => {
    mocks.api
      .mockResolvedValueOnce({
        user: {
          id: 'legacy-1', role: 'parent', email: 'legacy@example.test', nickname: 'Legacy Parent',
          avatarId: null, level: 1, xp: 0, onboarded: true, goal: null,
          parentId: null, classId: null,
        },
      })
      .mockResolvedValueOnce({ contexts: [], active: null })

    const user = await useAuth.getState().loginAdult('legacy@example.test', 'legacy-password')
    expect(user.id).toBe('legacy-1')
    expect(mocks.signInWithFirebasePassword).not.toHaveBeenCalled()
  })

  it('falls back to Firebase only when Account Hub rejects the password account', async () => {
    mocks.api
      .mockRejectedValueOnce(new ApiError(401, 'Account not found'))
      .mockResolvedValueOnce({
        user: {
          id: 'parent-1', role: 'parent', email: 'parent@example.test', nickname: 'Parent',
          avatarId: null, level: 1, xp: 0, onboarded: true, goal: null,
          parentId: null, classId: null,
        },
        access: { contexts: [], active: null, personas: ['parent'], platformRoles: [] },
      })

    const user = await useAuth.getState().loginAdult('parent@example.test', 'valid-password')

    expect(user.role).toBe('parent')
    expect(mocks.signInWithFirebasePassword).toHaveBeenCalledWith('parent@example.test', 'valid-password')
    expect(mocks.api).toHaveBeenNthCalledWith(2, '/api/auth/login/firebase', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'firebase-id-token', role: 'parent' }),
    })
  })

  it('fails closed when both Account Hub and Firebase reject credentials', async () => {
    mocks.api.mockRejectedValueOnce(new ApiError(401, 'Invalid credentials'))
    mocks.signInWithFirebasePassword.mockRejectedValueOnce({ code: 'auth/invalid-credential' })

    await expect(
      useAuth.getState().loginAdult('admin@example.test', 'wrong-password'),
    ).rejects.toMatchObject({ code: 'auth/invalid-credential' })

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
    expect(mocks.clearApiCache).toHaveBeenCalled()
    expect(mocks.clearOfflineLearningData).toHaveBeenCalled()
    expect(mocks.disconnectFirebaseSession).toHaveBeenCalled()
    expect(mocks.api).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
  })

  it('clears an invalid session when bootstrap receives 401 without reporting session expiration', async () => {
    mocks.api.mockRejectedValueOnce(new ApiError(401, 'Expired'))

    await useAuth.getState().bootstrap()

    expect(useAuth.getState().user).toBeNull()
    expect(useAuth.getState().loading).toBe(false)
    expect(useAuth.getState().error).toBeNull()
    expect(mocks.clearAccessToken).toHaveBeenCalled()
  })

  it('does not erase the token or report logout on a temporary bootstrap failure', async () => {
    mocks.api.mockRejectedValueOnce(new ApiError(503, 'Unavailable'))

    await useAuth.getState().bootstrap()

    expect(useAuth.getState().user).toBeNull()
    expect(useAuth.getState().loading).toBe(false)
    expect(useAuth.getState().error).toContain('kiểm tra phiên')
    expect(mocks.clearAccessToken).not.toHaveBeenCalled()
  })

  it('falls back to dev student session on bootstrap failure when preview query is present in DEV', async () => {
    window.history.pushState({}, '', '/home?preview=true')
    try {
      mocks.api.mockRejectedValueOnce(new ApiError(401, 'Unauthorized'))

      await useAuth.getState().bootstrap()

      expect(useAuth.getState().user).toEqual(
        expect.objectContaining({
          id: 'dev-student-bo',
          role: 'student',
          nickname: 'Bo Bo',
          name: 'Bo Bo',
          level: 3,
          xp: 450,
          onboarded: true,
          avatarId: null,
        }),
      )
      expect(useAuth.getState().loading).toBe(false)
      expect(useAuth.getState().error).toBeNull()
    } finally {
      window.history.pushState({}, '', '/')
    }
  })

  it('falls back to dev student session when localStorage dev_preview flag is true', async () => {
    const storage = new Map<string, string>([['aikids.dev_preview', 'true']])
    const originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, val: string) => storage.set(key, val),
        removeItem: (key: string) => storage.delete(key),
      },
      configurable: true,
      writable: true,
    })
    try {
      mocks.api.mockRejectedValueOnce(new ApiError(500, 'Server Error'))

      await useAuth.getState().bootstrap()

      expect(useAuth.getState().user?.id).toBe('dev-student-bo')
      expect(useAuth.getState().loading).toBe(false)
    } finally {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
        writable: true,
      })
    }
  })

  it('refreshes the server-owned avatar without browser storage', async () => {
    useAuth.setState({
      user: {
        id: 'child-1', role: 'student', email: null, nickname: 'Mây',
        avatarId: 'avatar-robot', level: 2, xp: 20, onboarded: true,
        goal: null, parentId: 'parent-1', classId: null,
      },
    })
    mocks.api.mockResolvedValueOnce({
      user: {
        ...useAuth.getState().user,
        avatarId: 'https://media.aikid.vn/avatar-new.webp',
      },
    })

    await useAuth.getState().refreshMe()

    expect(mocks.api).toHaveBeenCalledWith('/api/auth/me')
    expect(useAuth.getState().user?.avatarId).toBe('https://media.aikid.vn/avatar-new.webp')
  })

  it('clears API cache and session tokens upon logout', async () => {
    useAuth.setState({
      user: {
        id: 'adult-1',
        role: 'parent',
        email: 'parent@example.test',
        nickname: 'Parent',
        avatarId: null,
        level: 1,
        xp: 0,
        onboarded: true,
        goal: null,
        parentId: null,
        classId: null,
      },
      access: null,
      activeContext: null,
    })

    mocks.api.mockResolvedValueOnce({})

    await useAuth.getState().logout()

    expect(useAuth.getState().user).toBeNull()
    expect(mocks.clearAccessToken).toHaveBeenCalled()
    expect(mocks.clearApiCache).toHaveBeenCalled()
    expect(mocks.clearOfflineLearningData).toHaveBeenCalled()
    expect(mocks.disconnectFirebaseSession).toHaveBeenCalled()
    expect(mocks.api).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
  })

  it('creates the parent credential in Firebase and exchanges its token', async () => {
    const sendVerification = vi.fn().mockResolvedValue(undefined)
    mocks.registerWithFirebasePassword.mockResolvedValueOnce({ idToken: 'new-firebase-token', sendVerification })
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

    expect(mocks.registerWithFirebasePassword).toHaveBeenCalledWith('parent@example.test', 'example-password')
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

  it('rolls back and disconnects Firebase if session exchange fails during registration', async () => {
    const rollback = vi.fn().mockResolvedValue(undefined)
    mocks.registerWithFirebasePassword.mockResolvedValueOnce({
      idToken: 'new-firebase-token',
      sendVerification: vi.fn(),
      rollback,
    })
    mocks.api.mockRejectedValueOnce(new ApiError(409, 'Email already exists in database'))

    await expect(
      useAuth.getState().registerAdult(
        'parent@example.test', 'example-password', 'parent', 'An', true,
      ),
    ).rejects.toThrow('Email already exists in database')

    expect(rollback).toHaveBeenCalled()
  })

  it('disconnects Firebase session if exchange fails and rollback is not provided', async () => {
    mocks.registerWithFirebasePassword.mockResolvedValueOnce({
      idToken: 'new-firebase-token',
      sendVerification: vi.fn(),
    })
    mocks.api.mockRejectedValueOnce(new ApiError(500, 'Server error'))

    await expect(
      useAuth.getState().registerAdult(
        'parent@example.test', 'example-password', 'parent', 'An', true,
      ),
    ).rejects.toThrow('Server error')

    expect(mocks.disconnectFirebaseSession).toHaveBeenCalled()
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

  it('exposes __AUTH_STORE__ on window in DEV environment for browser testing/tools', () => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      expect((window as unknown as { __AUTH_STORE__: typeof useAuth }).__AUTH_STORE__).toBe(useAuth)
    }
  })

  it('enters as child without PIN and sets enteredFromParent flag', async () => {
    mocks.api.mockResolvedValueOnce({
      user: {
        id: 'child-1',
        role: 'student',
        email: null,
        nickname: 'Bé Mây',
        avatarId: 'cat',
        level: 3,
        xp: 120,
        onboarded: true,
        goal: null,
        parentId: 'parent-1',
        classId: null,
      },
    })

    const child = await useAuth.getState().enterAsChild('child-1')

    expect(child.id).toBe('child-1')
    expect(mocks.api).toHaveBeenCalledWith('/api/auth/login/child-profile', {
      method: 'POST',
      body: JSON.stringify({ childId: 'child-1' }),
    })
    expect(useAuth.getState().enteredFromParent).toBe(true)
    expect(useAuth.getState().user?.nickname).toBe('Bé Mây')
  })

})
