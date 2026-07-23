import { create } from 'zustand'
import {
  api,
  clearAccessToken,
  type AccessContext,
  type AccountAccess,
  type User,
} from '@/shared/lib/api'
import { disconnectFirebaseSession } from '@/shared/lib/firebase-client'

async function disconnectFirebase(): Promise<void> {
  await disconnectFirebaseSession().catch(() => undefined)
}

type AuthState = {
  user: User | null
  access: AccountAccess | null
  activeContext: AccessContext | null
  loading: boolean
  error: string | null
  bootstrap: () => Promise<void>
  loginStudent: (
    nickname: string,
    opts: { pin: string },
  ) => Promise<User>
  /** Parent hands device to child (ends parent session) */
  enterAsChild: (childId: string, pin?: string) => Promise<User>
  loginAdult: (login: string, password: string) => Promise<User>
  /** After GIS credential verified by API — set session user */
  setSessionUser: (user: User) => void
  registerAdult: (
    email: string,
    password: string,
    role: 'parent',
    nickname: string | undefined,
    parentalConsentAccepted: boolean,
  ) => Promise<User>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  logout: () => Promise<void>
  patchMe: (data: Partial<Pick<User, 'onboarded' | 'goal' | 'nickname' | 'avatarId'>>) => Promise<User>
  setUser: (u: User | null) => void
  selectContext: (contextId: string) => Promise<AccessContext>
}

function roleForContext(context: AccessContext): User['role'] {
  if (context.actor === 'admin') return 'admin'
  if (context.actor === 'teacher' || context.actor === 'org_admin') return 'teacher'
  if (context.actor === 'org_student') return 'student'
  return 'parent'
}

function preferredContext(access: AccountAccess): AccessContext | null {
  const host = typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase()
  const orgSlug = host.endsWith('.aikid.vn') && host !== 'app.aikid.vn'
    ? host.slice(0, -'.aikid.vn'.length)
    : null
  return (
    (orgSlug
      ? access.contexts.find((context) => context.organizationSlug === orgSlug)
      : undefined) ??
    access.contexts.find((context) => context.id === access.active?.contextId) ??
    access.contexts[0] ??
    null
  )
}

async function hydrateAdultAccess(user: User) {
  const access = await api<AccountAccess>('/api/auth/access')
  const context = preferredContext(access)
  if (!context) return { user, access, activeContext: null }
  await api('/api/auth/context', {
    method: 'POST',
    body: JSON.stringify({ contextId: context.id }),
  })
  return {
    user: { ...user, role: roleForContext(context) },
    access,
    activeContext: context,
  }
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  access: null,
  activeContext: null,
  loading: true,
  error: null,

  setUser: (u) => set({ user: u }),

  bootstrap: async () => {
    set({ loading: true, error: null })
    try {
      const { user } = await api<{ user: User }>('/api/auth/me')
      if (user.role === 'student') {
        set({ user, access: null, activeContext: null, loading: false })
        return
      }
      set({ ...(await hydrateAdultAccess(user)), loading: false })
    } catch {
      set({ user: null, access: null, activeContext: null, loading: false })
    }
  },

  loginStudent: async (nickname, opts) => {
    set({ error: null })
    const { user } = await api<{ user: User }>('/api/auth/login/student', {
      method: 'POST',
      body: JSON.stringify({
        nickname,
        pin: opts.pin,
      }),
    })
    set({ user, access: null, activeContext: null })
    return user
  },

  enterAsChild: async (childId, pin) => {
    set({ error: null })
    await disconnectFirebase()
    if (!pin) {
      throw new Error('Ba/mẹ cần đặt mã PIN 6 số cho hồ sơ con trước khi vào học.')
    }
    const code = await api<{ familyCode: string }>(
      '/api/parent/family-login-code',
    )
    const { user } = await api<{ user: User }>(
      '/api/auth/login/child-profile',
      {
        method: 'POST',
        body: JSON.stringify({
          familyCode: code.familyCode,
          childId,
          pin,
        }),
      },
    )
    set({ user, access: null, activeContext: null })
    return user
  },

  loginAdult: async (login, password) => {
    set({ error: null })
    const { user } = await api<{ user: User }>('/api/auth/login/adult', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    })
    const hydrated = await hydrateAdultAccess(user)
    set(hydrated)
    return hydrated.user
  },

  setSessionUser: (user) => set({ user, access: null, activeContext: null, error: null }),

  registerAdult: async (email, password, role, nickname, parentalConsentAccepted) => {
    set({ error: null })
    const { user } = await api<{ user: User }>('/api/auth/register/adult', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        role,
        nickname,
        parentalConsentAccepted,
      }),
    })
    const hydrated = await hydrateAdultAccess(user)
    set(hydrated)
    return hydrated.user
  },

  forgotPassword: async (email) => {
    await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  resetPassword: async (token, password) => {
    await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  },

  changePassword: async (currentPassword, newPassword) => {
    await api('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  logout: async () => {
    try {
      await disconnectFirebase()
      await api('/api/auth/logout', { method: 'POST' })
    } finally {
      clearAccessToken()
      set({ user: null, access: null, activeContext: null })
    }
  },

  patchMe: async (data) => {
    const { user } = await api<{ user: User }>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    set({ user })
    return user
  },

  selectContext: async (contextId) => {
    const access = get().access
    const user = get().user
    const context = access?.contexts.find((item) => item.id === contextId)
    if (!context || !user) throw new Error('Workspace không khả dụng')
    await api('/api/auth/context', {
      method: 'POST',
      body: JSON.stringify({ contextId }),
    })
    set({
      activeContext: context,
      user: { ...user, role: roleForContext(context) },
      access: access
        ? { ...access, active: { mode: context.type, contextId: context.id, organizationId: context.organizationId } }
        : null,
    })
    return context
  },
}))
