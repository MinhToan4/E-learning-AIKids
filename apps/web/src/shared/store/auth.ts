import { create } from 'zustand'
import {
  api,
  ApiError,
  clearAccessToken,
  getAccessToken,
  type AccessContext,
  type AccountAccess,
  type User,
} from '@/shared/lib/api'
import {
  changeFirebasePassword,
  disconnectFirebaseSession,
  registerWithFirebasePassword,
  signInWithFirebasePassword,
} from '@/shared/lib/firebase-client'
import { clearOfflineLearningData } from '@/shared/lib/offline-storage'
import { clearApiCache } from '@/shared/lib/api-cache'
import { clearStudentProgressionCache } from '@/shared/lib/query-client'

const PARENT_HANDOFF_SESSION_KEY = 'aikids.parent-handoff'

function readParentHandoff(): boolean {
  try {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PARENT_HANDOFF_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writeParentHandoff(active: boolean): void {
  try {
    if (typeof sessionStorage === 'undefined') return
    if (active) sessionStorage.setItem(PARENT_HANDOFF_SESSION_KEY, '1')
    else sessionStorage.removeItem(PARENT_HANDOFF_SESSION_KEY)
  } catch {
    // Session storage may be unavailable in hardened/private browser modes.
  }
}

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
  refreshMe: () => Promise<User | null>
  loginStudent: (nickname: string, second?: string | undefined) => Promise<User>
  /** Parent hands device to an owned child profile (ends parent session). */
  enterAsChild: (childId: string) => Promise<User>
  loginAdult: (login: string, password: string, role?: 'parent' | 'teacher') => Promise<User>
  /** After GIS credential verified by API — set session user */
  setSessionUser: (user: User) => void
  completeFirebaseSignIn: (
    idToken: string,
    options: { role: 'parent'; registration?: { nickname?: string; parentalConsentAccepted: boolean } },
  ) => Promise<User>
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
  if ((access.platformRoles?.length ?? 0) > 0 || role === 'admin') {
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
  const orgSlug = host.endsWith('.aikid.vn') && host !== 'app.aikid.vn' && host !== 'play.aikid.vn'
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

async function hydrateAdultAccess(user: User, sessionAccess?: AccountAccess) {
  // Học sinh / trẻ em đăng nhập bằng username không có staff/parent context.
  // Không được gọi /api/auth/access (sẽ bị backend chặn lỗi 403 PARENT_ONLY).
  if (user.role === 'student') {
    return { user, access: null, activeContext: null }
  }
  const access = sessionAccess ?? await api<AccountAccess>('/api/auth/access')
  const context = preferredContext(access, user.role)
  if (!context) return { user, access, activeContext: null }
  // Returning users already have their selected context persisted server-side.
  // Re-selecting it repeats the whole access query set, writes the same row and
  // issues a second JWT, adding a full request waterfall to every login.
  if (access.active?.contextId !== context.id) {
    await api('/api/auth/context', {
      method: 'POST',
      body: JSON.stringify({ contextId: context.id }),
    })
  }
  return {
    user: { ...user, role: roleForContext(context) },
    access,
    activeContext: context,
  }
}

async function exchangeFirebaseSession(
  idToken: string,
  options: { role: 'parent'; registration?: { nickname?: string; parentalConsentAccepted: boolean } },
) {
  const { user, access } = await api<{ user: User; access?: AccountAccess }>('/api/auth/login/firebase', {
    method: 'POST',
    body: JSON.stringify({
      idToken,
      role: 'parent',
      ...(options.registration
        ? {
            registration: true,
            nickname: options.registration.nickname,
            parentalConsentAccepted: options.registration.parentalConsentAccepted,
            termsAccepted: true,
          }
        : {}),
    }),
  })
  return hydrateAdultAccess(user, access)
}

export function resolveLoginAlias(login: string): string {
  const trimmed = login.trim()
  if (trimmed.includes('@')) {
    return trimmed
  }
  if (trimmed.toLowerCase() === 'storymee-admin') {
    return 'admin@storymee.com'
  }
  return `${trimmed.toLowerCase()}@storymee.vn`
}

export function formatFirebaseError(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error
    ? String((error as { code?: unknown }).code ?? '')
    : ''
  if (code === 'auth/network-request-failed') {
    return 'Kết nối đang gián đoạn. Bạn thử lại sau nhé.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Bạn đã thử nhiều lần. Vui lòng chờ một chút rồi thử lại.'
  }
  if (code === 'auth/user-disabled') {
    return 'Tài khoản này chưa thể đăng nhập. Vui lòng liên hệ hỗ trợ.'
  }
  if ([
    'auth/invalid-credential',
    'auth/invalid-login-credentials',
    'auth/user-not-found',
    'auth/wrong-password',
    'auth/invalid-email',
  ].includes(code)) {
    return 'Thông tin đăng nhập chưa đúng. Bạn kiểm tra lại nhé.'
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Chưa thể đăng nhập. Bạn thử lại nhé.'
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  access: null,
  activeContext: null,
  loading: true,
  error: null,
  // WHY: false theo mặc định — icon Ba / Mẹ sẽ ẩn cho mọi luồng login thông thường
  enteredFromParent: readParentHandoff(),

  setUser: (u) => {
    if (!u || u.role !== 'student') writeParentHandoff(false)
    set({
      user: u,
      ...(!u || u.role !== 'student' ? { enteredFromParent: false } : {}),
    })
  },

  expireSession: () => {
    writeParentHandoff(false)
    clearStudentProgressionCache(get().user?.id)
    clearAccessToken()
    clearApiCache()
    void clearPreviousLearnerData()
    void disconnectFirebase()
    void Promise.resolve(api('/api/auth/logout', { method: 'POST' })).catch(() => undefined)
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
      const { user, access } = await api<{ user: User; access?: AccountAccess }>('/api/auth/me')
      if (user.role === 'student') {
        set({ user, access: null, activeContext: null, loading: false, enteredFromParent: readParentHandoff() })
        return
      }
      writeParentHandoff(false)
      set({ ...(await hydrateAdultAccess(user, access)), loading: false, enteredFromParent: false })
    } catch (error) {
      if (
        import.meta.env.DEV &&
        typeof window !== 'undefined' &&
        (window.location.search.includes('preview') ||
          window.location.search.includes('guest') ||
          (typeof localStorage !== 'undefined' && localStorage.getItem('aikids.dev_preview') === 'true'))
      ) {
        const devStudent: User = {
          id: 'dev-student-bo',
          role: 'student',
          email: null,
          name: 'Bo Bo',
          nickname: 'Bo Bo',
          avatarId: null,
          level: 3,
          xp: 450,
          onboarded: true,
          goal: null,
          parentId: null,
          classId: null,
        }
        set({
          user: devStudent,
          access: null,
          activeContext: null,
          loading: false,
          error: null,
          enteredFromParent: false,
        })
        return
      }

      if (error instanceof ApiError && error.status === 401) {
        clearAccessToken()
        set({
          user: null,
          access: null,
          activeContext: null,
          loading: false,
          error: null, // Khách chưa đăng nhập là bình thường, TUYỆT ĐỐI KHÔNG gán lỗi hết hạn!
          enteredFromParent: false,
        })
        return
      }
      // A network/5xx failure does not prove that the credential is invalid.
      // Keep the token so the user can retry instead of being incorrectly
      // bounced to login (and then seeing the old page again via Back/BFCache).
      set({
        user: null,
        access: null,
        activeContext: null,
        loading: false,
        error: 'Chưa thể kiểm tra phiên đăng nhập. Vui lòng thử lại.',
        enteredFromParent: false,
      })
    }
  },

  refreshMe: async () => {
    const current = get().user
    if (!current) return null
    const { user } = await api<{ user: User }>('/api/auth/me')
    // A late response must never replace a session that changed meanwhile.
    if (get().user?.id === current.id && user.id === current.id) set({ user })
    return user
  },

  loginStudent: async (nickname) => {
    set({ error: null })
    writeParentHandoff(false)
    const { user } = await api<{ user: User }>('/api/auth/login/student', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    })
    if (get().user?.id !== user.id) {
      clearStudentProgressionCache(get().user?.id)
      await clearPreviousLearnerData()
      clearApiCache()
    }
    // WHY: loginStudent là con tự đăng nhập — KHÔNG phải từ phụ huynh chuyển sang
    set({ user, access: null, activeContext: null, error: null, enteredFromParent: false })
    return user
  },

  enterAsChild: async (childId) => {
    set({ error: null })
    const { user } = await api<{ user: User }>(
      '/api/auth/login/child-profile',
      {
        method: 'POST',
        body: JSON.stringify({ childId }),
      },
    )
    if (get().user?.id !== user.id) {
      clearStudentProgressionCache(get().user?.id)
      await clearPreviousLearnerData()
      clearApiCache()
    }
    // WHY: enteredFromParent = true là flag duy nhất phân biệt phiên này với loginStudent.
    // Không dùng parentId vì học sinh tự đăng nhập cũng có parentId.
    writeParentHandoff(true)
    set({ user, access: null, activeContext: null, error: null, enteredFromParent: true })
    return user
  },

  loginAdult: async (login, password) => {
    set({ error: null })
    const trimmedLogin = login.trim()
    const resolvedEmail = resolveLoginAlias(trimmedLogin)
    try {
      await clearPreviousLearnerData()
      let hydrated
      try {
        // Password login is owned by Account Hub/Supabase and must create the
        // HttpOnly server session directly. Requiring Firebase first locks out
        // valid legacy/DB accounts that have not been mirrored to Firebase.
        const { user, access } = await api<{ user: User; access?: AccountAccess }>('/api/auth/login/adult', {
          method: 'POST',
          body: JSON.stringify({ login: trimmedLogin, password }),
        })
        hydrated = await hydrateAdultAccess(user, access)
      } catch (error) {
        // Firebase-only accounts remain supported during the account migration,
        // but a network/5xx Hub failure must not be disguised as bad credentials.
        if (!(error instanceof ApiError) || error.status !== 401) throw error
        const idToken = await signInWithFirebasePassword(resolvedEmail, password)
        hydrated = await exchangeFirebaseSession(idToken, { role: 'parent' })
      }
      set({ ...hydrated, error: null })
      return hydrated.user
    } catch (error) {
      set({ error: formatFirebaseError(error) })
      throw error
    }
  },

  completeFirebaseSignIn: async (idToken, options) => {
    set({ error: null })
    await clearPreviousLearnerData()
    const hydrated = await exchangeFirebaseSession(idToken, options)
    set({ ...hydrated, error: null })
    return hydrated.user
  },

  setSessionUser: (user) => {
    if (get().user?.id !== user.id) clearStudentProgressionCache(get().user?.id)
    void clearPreviousLearnerData()
    if (user.role !== 'student') writeParentHandoff(false)
    set({ user, access: null, activeContext: null, error: null, enteredFromParent: false })
  },

  registerAdult: async (email, password, role, nickname, parentalConsentAccepted) => {
    set({ error: null })
    const firebase = await registerWithFirebasePassword(email, password)
    let hydrated
    try {
      hydrated = await exchangeFirebaseSession(firebase.idToken, {
        role,
        registration: { nickname, parentalConsentAccepted },
      })
    } catch (error) {
      if ('rollback' in firebase && typeof firebase.rollback === 'function') {
        await firebase.rollback().catch(() => undefined)
      } else {
        await disconnectFirebase().catch(() => undefined)
      }
      throw error
    }
    await firebase.sendVerification().catch(() => undefined)
    await clearPreviousLearnerData()
    set({ ...hydrated, error: null })
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
    await changeFirebasePassword(currentPassword, newPassword)
  },

  logout: async () => {
    try {
      await disconnectFirebase()
      await api('/api/auth/logout', { method: 'POST' })
    } finally {
      writeParentHandoff(false)
      clearStudentProgressionCache(get().user?.id)
      await clearPreviousLearnerData()
      clearAccessToken()
      clearApiCache()
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

if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { __AUTH_STORE__: typeof useAuth }).__AUTH_STORE__ = useAuth
}
