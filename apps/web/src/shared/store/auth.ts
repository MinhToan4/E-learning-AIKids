import { create } from 'zustand'
import { api, clearAccessToken, type User } from '@/shared/lib/api'
import { disconnectFirebaseSession } from '@/shared/lib/firebase-client'

async function disconnectFirebase(): Promise<void> {
  await disconnectFirebaseSession().catch(() => undefined)
}

type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
  bootstrap: () => Promise<void>
  loginStudent: (
    nickname: string,
    password: string,
  ) => Promise<User>
  /** Parent hands device to child (ends parent session) */
  enterAsChild: (childId: string, pin?: string) => Promise<User>
  loginAdult: (email: string, password: string) => Promise<User>
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
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (u) => set({ user: u }),

  bootstrap: async () => {
    set({ loading: true, error: null })
    try {
      const { user } = await api<{ user: User }>('/api/auth/me')
      set({ user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  loginStudent: async (nickname, password) => {
    set({ error: null })
    // Parent provisions child — no public auto-create
    const { user } = await api<{ user: User }>('/api/auth/login/student', {
      method: 'POST',
      body: JSON.stringify({
        nickname,
        password,
      }),
    })
    set({ user })
    return user
  },

  enterAsChild: async (childId, pin) => {
    set({ error: null })
    await disconnectFirebase()
    const { user } = await api<{ user: User }>(
      `/api/parent/children/${childId}/enter`,
      {
        method: 'POST',
        body: JSON.stringify(pin ? { pin } : {}),
      },
    )
    set({ user })
    return user
  },

  loginAdult: async (email, password) => {
    set({ error: null })
    const { user } = await api<{ user: User }>('/api/auth/login/adult', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    set({ user })
    return user
  },

  setSessionUser: (user) => set({ user, error: null }),

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
    set({ user })
    return user
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
      set({ user: null })
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
}))
