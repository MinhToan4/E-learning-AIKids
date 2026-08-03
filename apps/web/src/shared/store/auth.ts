import { create } from 'zustand'
import {
  api,
  clearAccessToken,
  type AccessContext,
  type AccountAccess,
  type User,
} from '@/shared/lib/api'
import { disconnectFirebaseSession } from '@/shared/lib/firebase-client'
import { clearOfflineLearningData } from '@/shared/lib/offline-storage'

async function disconnectFirebase(): Promise<void> {
  await disconnectFirebaseSession().catch(() => undefined)
}

// Offline grants and progress belong to one learner; clear on every session
// switch so a shared device does not leak one child's data to another.
async function clearPreviousLearnerData(): Promise<void> {
  await clearOfflineLearningData().catch(() => undefined)
}

type AuthState = {
  user: User | null
  access: AccountAccess | null
  activeContext: AccessContext | null
  loading: boolean
  error: string | null
  /**
   * WHY: true chỉ khi phụ huynh dùng luồng "Ba / Mẹ → Chuyển sang con" (enterAsChild).
   * Con tự đăng nhập bằng nickname sẽ luôn là false.
   * Đây là SSOT duy nhất để quyết định có hiển thị icon Ba / Mẹ trên Sidebar hay không.
   */
  enteredFromParent: boolean
  bootstrap: () => Promise<void>
  loginStudent: (
    nickname: string,
    second?: string | undefined,
    opts?: { pin?: string },
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
  expireSession: () => void
}

function roleForContext(context: AccessContext): User['role'] {
  if (context.actor === 'admin') return 'admin'
  if (context.actor === 'teacher' || context.actor === 'org_admin') return 'teacher'
  if (context.actor === 'org_student') return 'student'
  return 'parent'
}

function contextForAccountRole(
  access: AccountAccess,
  role: User['role'],
): AccessContext | undefined {
  // Platform assignments are the authorization SSOT for administrators. An
  // admin may also own a family persona, while users.role can remain `parent`.
  // Never let a previously persisted family context downgrade that account
  // immediately after login.
  if ((access.platformRoles?.length ?? 0) > 0) {
    return access.contexts.find((context) => context.actor === 'admin')
  }
  if (role === 'teacher') {
    return access.contexts.find(
      (context) =>
        context.actor === 'teacher' || context.actor === 'org_admin',
    )
  }
  if (role === 'parent') {
    return access.contexts.find((context) => context.actor === 'parent')
  }
  return undefined
}

function preferredContext(
  access: AccountAccess,
  role: User['role'],
): AccessContext | null {
  const host = typeof window === 'undefined' ? '' : window.location.hostname.toLowerCase()
  const orgSlug = host.endsWith('.aikid.vn') && host !== 'app.aikid.vn'
    ? host.slice(0, -'.aikid.vn'.length)
    : null
  return (
    (orgSlug
      ? access.contexts.find((context) => context.organizationSlug === orgSlug)
      : undefined) ??
    contextForAccountRole(access, role) ??
    access.contexts.find((context) => context.id === access.active?.contextId) ??
    access.contexts[0] ??
    null
  )
}

async function hydrateAdultAccess(user: User) {
  const access = await api<AccountAccess>('/api/auth/access')
  const context = preferredContext(access, user.role)
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
  // WHY: false theo mặc định — icon Ba / Mẹ sẽ ẩn cho mọi luồng login thông thường
  enteredFromParent: false,

  setUser: (u) => set({ user: u }),

  expireSession: () => {
    clearAccessToken()
    void clearPreviousLearnerData()
    set({
      user: null,
      access: null,
      activeContext: null,
      loading: false,
      error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      enteredFromParent: false,
    })
  },

  bootstrap: async () => {
    set({ loading: true, error: null })
    try {
      const { user } = await api<{ user: User }>('/api/auth/me')
      if (user.role === 'student') {
        // WHY: bootstrap tức là tự đăng nhập (refresh trình duyệt), không phải từ phụ huynh
        set({ user, access: null, activeContext: null, loading: false, enteredFromParent: false })
        return
      }
      set({ ...(await hydrateAdultAccess(user)), loading: false, enteredFromParent: false })
    } catch {
      set({ user: null, access: null, activeContext: null, loading: false, enteredFromParent: false })
    }
  },

  loginStudent: async (nickname, _second, opts) => {
    set({ error: null })
    const { user } = await api<{ user: User }>('/api/auth/login/student', {
      method: 'POST',
      body: JSON.stringify({
        nickname,
        ...(opts?.pin ? { pin: opts.pin } : {}),
      }),
    })
    // WHY: loginStudent là con tự đăng nhập — KHÔNG phải từ phụ huynh chuyển sang
    set({ user, access: null, activeContext: null, enteredFromParent: false })
    return user
  },

  enterAsChild: async (childId, pin) => {
    set({ error: null })
    await disconnectFirebase()
    if (!pin) {
      throw new Error('Ba / Mẹ cần đặt mã PIN 6 số cho hồ sơ con trước khi vào học.')
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
    // WHY: enteredFromParent = true là flag duy nhất phân biệt phiên này với loginStudent.
    // Không dùng parentId vì học sinh tự đăng nhập cũng có parentId.
    set({ user, access: null, activeContext: null, enteredFromParent: true })
    return user
  },

  loginAdult: async (login, password) => {
    set({ error: null })
    // WHY: normalizeGatewayRequest maps '/api/auth/login/adult' → '/api/v1/account/login'
    // The bare '/api/auth/login' has no mapping and would throw ApiError 501.
    const { user } = await api<{ user: User }>('/api/auth/login/adult', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    })
    await clearPreviousLearnerData()
    const hydrated = await hydrateAdultAccess(user)
    set(hydrated)
    return hydrated.user
  },

  setSessionUser: (user) => {
    void clearPreviousLearnerData()
    set({ user, access: null, activeContext: null, error: null })
  },

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
    await clearPreviousLearnerData()
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
      await clearPreviousLearnerData()
      clearAccessToken()
      set({ user: null, access: null, activeContext: null, enteredFromParent: false })
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
