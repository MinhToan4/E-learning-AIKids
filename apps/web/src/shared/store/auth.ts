import { create } from 'zustand'
import { api, type User } from '@/shared/lib/api'

type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
  bootstrap: () => Promise<void>
  loginStudent: (nickname: string, avatarId: string) => Promise<User>
  loginAdult: (email: string, password: string) => Promise<User>
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

  loginStudent: async (nickname, avatarId) => {
    set({ error: null })
    const { user } = await api<{ user: User }>('/api/auth/login/student', {
      method: 'POST',
      body: JSON.stringify({ nickname, avatarId, createIfMissing: true }),
    })
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

  logout: async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } finally {
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
