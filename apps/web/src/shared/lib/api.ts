const API_BASE = (import.meta.env.VITE_API_URL ?? 'https://dev-hub.storymee.com')
  .replace(/\/$/, '')
const TOKEN_KEY = 'storymee.access_token'

export function getAccessToken(): string | null {
  return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const request = normalizeGatewayRequest(path, options)
  const headers = new Headers(request.options.headers)
  const token = getAccessToken()
  if (request.options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const url = `${API_BASE}${request.path}`

  let res: Response
  try {
    res = await fetch(url, {
      ...request.options,
      headers,
    })
  } catch (e) {
    // Browser "Failed to fetch" = network / CORS / API offline
    const raw = e instanceof Error ? e.message : String(e)
    const offline =
      /failed to fetch|networkerror|load failed|network request failed/i.test(
        raw,
      )
    throw new ApiError(
      0,
      offline
        ? 'Ôi, có vẻ mạng đang ngủ quên rồi! 🌙 Kiểm tra Wi-Fi rồi thử lại nhé.'
        : 'Mạng hơi bận chút. Chờ một xíu rồi thử lại nhé! 😊',
      { cause: raw, path: request.path, base: API_BASE },
    )
  }

  let data: unknown = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    // 401 on /me during bootstrap is normal when logged out — still throw for callers
    const msg =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error: string }).error)
        : typeof data === 'object' && data && 'message' in data
          ? String((data as { message: string }).message)
          : res.statusText || 'Có lỗi xảy ra'
    throw new ApiError(res.status, msg, data)
  }
  const normalized = normalizeGatewayResponse(path, data)
  return normalized as T
}

type GatewayRequest = { path: string; options: RequestInit }

function jsonBody(options: RequestInit): Record<string, unknown> {
  if (typeof options.body !== 'string') return {}
  try {
    return JSON.parse(options.body) as Record<string, unknown>
  } catch {
    return {}
  }
}

function withJson(options: RequestInit, body: Record<string, unknown>): RequestInit {
  return { ...options, body: JSON.stringify(body) }
}

function normalizeGatewayRequest(path: string, options: RequestInit): GatewayRequest {
  const body = jsonBody(options)
  const direct: Record<string, string> = {
    '/api/auth/me': '/api/v1/account/me',
    '/api/auth/logout': '/api/v1/account/logout',
    '/api/auth/forgot-password': '/api/v1/account/forgot-password',
    '/api/auth/reset-password': '/api/v1/account/reset-password',
    '/api/auth/change-password': '/api/v1/account/me/password',
    '/api/courses': '/api/v1/lms/courses',
    '/api/enrollments': '/api/v1/lms/enrollments',
    '/api/notifications': '/api/v1/notifications',
    '/api/notifications/read-all': '/api/v1/notifications/read-all',
    '/api/notifications/preferences': '/api/v1/notifications/preferences',
    '/api/notifications/devices': '/api/v1/notifications/devices',
  }
  if (path === '/api/auth/login/student') {
    return {
      path: '/api/v1/account/login',
      options: withJson(options, {
        login: body.nickname,
        username: body.nickname,
        password: body.password ?? body.pin,
      }),
    }
  }
  if (path === '/api/auth/login/adult') {
    return {
      path: '/api/v1/account/login',
      options: withJson(options, {
        login: body.email,
        email: body.email,
        password: body.password,
      }),
    }
  }
  if (path === '/api/auth/register/adult') {
    return {
      path: '/api/v1/account/register',
      options: withJson(options, {
        email: body.email,
        password: body.password,
        name: body.nickname,
        asParent: true,
        parentalConsentAccepted: body.parentalConsentAccepted === true,
      }),
    }
  }
  if (path === '/api/auth/reset-password') {
    return {
      path: direct[path],
      options: withJson(options, {
        token: body.token,
        newPassword: body.password,
      }),
    }
  }
  if (path === '/api/auth/change-password') {
    return {
      path: direct[path],
      options: withJson(options, {
        oldPassword: body.currentPassword,
        newPassword: body.newPassword,
      }),
    }
  }
  const course = path.match(/^\/api\/courses\/([^/?]+)$/)
  if (course) {
    return { path: `/api/v1/lms/courses/${encodeURIComponent(course[1])}`, options }
  }
  const notificationRead = path.match(/^\/api\/notifications\/([^/]+)\/read$/)
  if (notificationRead) {
    return {
      path: `/api/v1/notifications/${encodeURIComponent(notificationRead[1])}/read`,
      options: { ...options, method: 'POST' },
    }
  }
  const queryIndex = path.indexOf('?')
  const barePath = queryIndex >= 0 ? path.slice(0, queryIndex) : path
  const query = queryIndex >= 0 ? path.slice(queryIndex) : ''
  if (direct[barePath]) {
    return { path: `${direct[barePath]}${query}`, options }
  }
  throw new ApiError(
    501,
    'Tính năng này đang được chuyển sang StoryMee Backend.',
    { code: 'FEATURE_NOT_AVAILABLE', legacyPath: path },
  )
}

function mapUser(raw: Record<string, unknown>): User {
  const actor = String(raw.actor ?? raw.role ?? 'parent')
  const role: User['role'] =
    actor === 'child' ? 'student' :
      actor === 'teacher' ? 'teacher' :
        actor === 'admin' ? 'admin' : 'parent'
  return {
    id: String(raw.id ?? raw.userId ?? ''),
    role,
    email: raw.email ? String(raw.email) : null,
    nickname: raw.name ? String(raw.name) : raw.nickname ? String(raw.nickname) : null,
    avatarId: raw.avatarUrl ? String(raw.avatarUrl) : null,
    level: Number(raw.level ?? 1),
    xp: Number(raw.xp ?? 0),
    onboarded: raw.onboarded !== false,
    goal: raw.goal ? String(raw.goal) : null,
    parentId: raw.parentId ? String(raw.parentId) : null,
    classId: raw.organizationId ? String(raw.organizationId) : null,
  }
}

function mapCourse(raw: Record<string, unknown>): CourseSummary {
  const metadata = (raw.metadata && typeof raw.metadata === 'object'
    ? raw.metadata
    : {}) as Record<string, unknown>
  const versions = Array.isArray(raw.versions) ? raw.versions : []
  const modules = versions[0] && typeof versions[0] === 'object' &&
    Array.isArray((versions[0] as Record<string, unknown>).modules)
    ? (versions[0] as { modules: Array<Record<string, unknown>> }).modules
    : []
  const lessons = modules.flatMap((module) =>
    Array.isArray(module.lessons)
      ? module.lessons as Array<Record<string, unknown>>
      : [],
  )
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    shortTitle: String(raw.shortTitle ?? raw.title ?? ''),
    tagline: String(metadata.tagline ?? raw.description ?? ''),
    description: String(raw.description ?? ''),
    coverFrom: String(metadata.coverFrom ?? '#7c3aed'),
    coverTo: String(metadata.coverTo ?? '#4f46e5'),
    accent: String(metadata.accent ?? '#7c3aed'),
    coverImage: metadata.coverImage ? String(metadata.coverImage) : null,
    ageLabel: String(raw.ageBand ?? metadata.ageLabel ?? '8–15 tuổi'),
    ageTrack: raw.ageBand ? String(raw.ageBand) : undefined,
    courseKey: raw.slug ? String(raw.slug) : undefined,
    durationLabel: String(metadata.durationLabel ?? ''),
    productLabel: String(metadata.productLabel ?? 'Khóa học StoryMee'),
    status: 'published',
    recommended: metadata.recommended === true,
    skills: Array.isArray(metadata.skills) ? metadata.skills.map(String) : [],
    outcomes: Array.isArray(metadata.outcomes) ? metadata.outcomes.map(String) : [],
    questCount: lessons.length ||
      Number((versions[0] as { _count?: { modules?: number } } | undefined)?._count?.modules ?? 0),
    enrolled: false,
    quests: lessons.map((lesson, index) => ({
      id: String(lesson.id ?? ''),
      order: index + 1,
      title: String(lesson.title ?? ''),
      accent: String(metadata.accent ?? '#7c3aed'),
      practiceKind: String(lesson.lessonType ?? 'lesson'),
      stage: 'learn',
    })),
  }
}

function normalizeGatewayResponse(path: string, data: unknown): unknown {
  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const payload = (body.data && typeof body.data === 'object'
    ? body.data
    : body) as Record<string, unknown>
  if (path.startsWith('/api/auth/login/') || path === '/api/auth/register/adult') {
    const token = String(payload.token ?? payload.accessToken ?? body.token ?? body.accessToken ?? '')
    if (token) setAccessToken(token)
    const rawUser = (payload.user ?? body.user ?? payload) as Record<string, unknown>
    return { user: mapUser(rawUser) }
  }
  if (path === '/api/auth/me' && (payload.user || payload.id)) {
    return { user: mapUser((payload.user ?? payload) as Record<string, unknown>) }
  }
  if (path === '/api/auth/logout') clearAccessToken()
  if (path === '/api/courses' && Array.isArray(payload.courses)) {
    return {
      courses: payload.courses.map((course) =>
        mapCourse(course as Record<string, unknown>)),
    }
  }
  if (/^\/api\/courses\/[^/?]+$/.test(path) && payload.course) {
    return { course: mapCourse(payload.course as Record<string, unknown>) }
  }
  if (path.startsWith('/api/notifications')) {
    if (Array.isArray(payload.items)) {
      return {
        notifications: payload.items.map((item) => {
          const row = item as Record<string, unknown>
          return { ...row, read: Boolean(row.readAt) }
        }),
        unreadCount: Number(payload.unreadCount ?? 0),
      }
    }
  }
  return payload
}

export type User = {
  id: string
  role: 'student' | 'parent' | 'teacher' | 'admin'
  email: string | null
  nickname: string | null
  avatarId: string | null
  level: number
  xp: number
  onboarded: boolean
  goal: string | null
  parentId: string | null
  classId: string | null
}

export type CourseSummary = {
  id: string
  title: string
  shortTitle: string
  tagline: string
  description: string
  coverFrom: string
  coverTo: string
  accent: string
  coverImage: string | null
  ageLabel: string
  ageTrack?: string
  courseKey?: string
  durationLabel: string
  productLabel: string
  status: string
  recommended: boolean
  skills: string[]
  outcomes?: string[]
  recognition?: {
    issuer: string
    credential: string
    finalAssessment: string
    frameworks: Array<{ code: string; title: string }>
    disclaimer: string
  }
  questCount: number
  enrolled: boolean
  /** Number of completed quests for enrolled users (0 for unenrolled) */
  completedCount?: number
  /** Total stars earned for enrolled users */
  totalStars?: number
  /** Progress percentage 0-100 for enrolled users */
  progressPct?: number
  quests: Array<{
    id: string
    order: number
    title: string
    accent: string
    practiceKind: string
    stage?: string
    status?: string
  }>
}

export type QuestDetail = {
  id: string
  courseId: string
  order: number
  title: string
  skill: string
  reward: string
  duration: string
  hook: string
  accent: string
  practiceKind: string
  stage?: string
  /** Lecture video URL from API/SQL — not hardcoded in FE */
  videoUrl?: string | null
  goals: string[]
  learnCards: Array<{
    id: string
    title: string
    body: string
    tip: string
    kind: string
  }>
  check: Array<{ id: string; question: string; options: string[] }>
  chips: Record<
    string,
    Array<{ id: string; slot: string; label: string; emoji: string; description?: string }>
  > | null
  stations?: {
    stage: string
    stations: Array<{
      id: string
      kind: string
      title?: string
      durationMin?: number
      practiceKind?: string
      gameType?: string
      gameConfig?: {
        cards?: string[]
        groups?: unknown
        rounds?: unknown
        pairs?: unknown
        placements?: unknown
      }
      content?: string
      instruction?: string
      outcome?: string
      product?: string
    }>
  }
}

export type AchievementRow = {
  type: string
  title: string
  description: string
  icon: string
  requiredValue: number
  unlocked: boolean
  unlockedAt: string | null
}

export type NotificationRow = {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  data: string | null
  createdAt: string
}


export type LectureRow = {
  id: string
  courseId: string
  order: number
  title: string
  skill: string
  reward: string
  duration: string
  hook: string
  accent: string
  practiceKind: string
  videoUrl: string | null
  archived?: boolean
  stage?: string
}

export type QuestProgress = {
  id: string
  order: number
  title: string
  skill: string
  reward: string
  duration: string
  hook: string
  accent: string
  practiceKind: string
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  phase: 'learn' | 'game' | 'practice' | 'check'
  stars: number
  xpEarned: number
}
