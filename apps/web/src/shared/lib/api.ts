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
    '/api/gamification/streak': '/api/v1/gamification/me/streak',
    '/api/gamification/achievements': '/api/v1/gamification/me/achievements',
    '/api/gamification/daily-mission': '/api/v1/gamification/me/missions',
    '/api/gamification/profile': '/api/v1/gamification/me',
    '/api/gamification/class-celebration':
      '/api/v1/gamification/me/celebration',
  }
  if (path === '/api/gamification/check-in') {
    return {
      path: '/api/v1/gamification/me/streak',
      options: { ...options, method: 'GET', body: undefined },
    }
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
  if (path === '/api/auth/login/child-profile') {
    return {
      path: '/api/v1/account/family/child-login',
      options: withJson(options, {
        familyCode: body.familyCode,
        childId: body.childId,
        pin: body.pin,
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
  const courseProgress = path.match(/^\/api\/progress\/([^/?]+)$/)
  if (courseProgress) {
    return {
      path: `/api/v1/lms/compat/courses/${encodeURIComponent(courseProgress[1])}/progress`,
      options,
    }
  }
  const quest = path.match(/^\/api\/quests\/([^/?]+)$/)
  if (quest) {
    return {
      path: `/api/v1/lms/compat/quests/${encodeURIComponent(quest[1])}`,
      options,
    }
  }
  const lessonAction = path.match(
    /^\/api\/progress\/([^/?]+)\/(start|advance|practice|check)$/,
  )
  if (lessonAction) {
    const headers = new Headers(options.headers)
    if (lessonAction[2] === 'check' && !headers.has('Idempotency-Key')) {
      headers.set('Idempotency-Key', crypto.randomUUID())
    }
    return {
      path: `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonAction[1])}/${lessonAction[2]}`,
      options: { ...options, headers },
    }
  }
  if (path === '/api/parent/children') {
    return {
      path: '/api/v1/account/family/children',
      options: options.method === 'POST'
        ? withJson(options, {
          name: body.nickname,
          ageBand: '9-12',
          avatarUrl: body.avatarId,
          language: 'vi',
          allowAiCreate: true,
        })
        : options,
    }
  }
  if (path === '/api/parent/family-login-code') {
    return { path: '/api/v1/account/family/login-code', options }
  }
  const child = path.match(/^\/api\/parent\/children\/([^/?]+)$/)
  if (child) {
    return {
      path: `/api/v1/account/family/children/${encodeURIComponent(child[1])}`,
      options: options.method === 'PATCH'
        ? withJson(options, {
          name: body.nickname,
          avatarUrl: body.avatarId,
        })
        : options,
    }
  }
  const childPin = path.match(/^\/api\/parent\/children\/([^/?]+)\/pin$/)
  if (childPin) {
    return {
      path: `/api/v1/account/family/children/${encodeURIComponent(childPin[1])}/pin`,
      options,
    }
  }
  const childProgress = path.match(
    /^\/api\/parent\/children\/([^/?]+)\/progress(?:\?.*)?$/,
  )
  if (childProgress) {
    return {
      path: `/api/v1/lms/family/children/${encodeURIComponent(childProgress[1])}/enrollments`,
      options,
    }
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
  if (path === '/api/auth/login/child-profile') {
    const token = String(payload.token ?? payload.accessToken ?? '')
    if (token) setAccessToken(token)
    const child = recordValue(payload.child)
    return {
      user: mapUser({
        ...child,
        actor: 'child',
        name: child.name,
        parentId: recordValue(payload.parent).id,
        onboarded: true,
      }),
    }
  }
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
  if (path === '/api/parent/children' && Array.isArray(payload.children)) {
    return {
      children: payload.children.map((item) => {
        const row = item as Record<string, unknown>
        return {
          ...row,
          nickname: row.name ? String(row.name) : null,
          avatarId: row.avatarUrl ? String(row.avatarUrl) : null,
          active: true,
          level: Number(row.level ?? 1),
          xp: Number(row.xp ?? 0),
          hasPin: row.hasPin === true,
        }
      }),
    }
  }
  if (/^\/api\/parent\/children\/[^/?]+$/.test(path) && payload.child) {
    const row = payload.child as Record<string, unknown>
    return {
      child: {
        ...row,
        nickname: row.name ? String(row.name) : null,
        avatarId: row.avatarUrl ? String(row.avatarUrl) : null,
      },
    }
  }
  if (/^\/api\/parent\/children\/[^/?]+\/progress/.test(path)) {
    const rows = Array.isArray(payload.enrollments)
      ? payload.enrollments as Array<Record<string, unknown>>
      : []
    const selectedId = new URLSearchParams(path.split('?')[1] ?? '').get('courseId')
    const selected = rows.find((row) => String(row.courseId) === selectedId) ?? rows[0]
    const progress = selected && Array.isArray(selected.progress)
      ? selected.progress as Array<Record<string, unknown>>
      : []
    const course = selected && typeof selected.course === 'object'
      ? selected.course as Record<string, unknown>
      : {}
    return {
      child: { id: path.split('/')[4], nickname: null, level: 1, xp: 0 },
      courseId: selected ? String(selected.courseId ?? '') : null,
      courses: rows.map((row) => {
        const item = recordValue(row.course)
        const metadata = recordValue(item.metadata)
        return {
          id: String(row.courseId ?? item.id ?? ''),
          title: String(item.title ?? ''),
          shortTitle: String(item.shortTitle ?? item.title ?? ''),
          ageLabel: String(metadata.ageLabel ?? ''),
        }
      }),
      summary: {
        completed: progress.filter((row) => row.status === 'completed').length,
        total: progress.length,
        totalStars: progress.reduce((sum, row) => sum + Number(row.stars ?? 0), 0),
        currentPhase: progress.find((row) => row.status === 'in_progress')?.phase ?? null,
      },
      insights: { strengths: [], nextFocus: null, outcomes: [] },
      quests: progress.map((row, index) => ({
        id: String(row.lessonId ?? ''),
        order: index + 1,
        title: `Trạm ${index + 1}`,
        status: String(row.status ?? 'locked'),
        stars: Number(row.stars ?? 0),
        videoUrl: null,
      })),
    }
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
  if (path === '/api/gamification/streak' || path === '/api/gamification/check-in') {
    return {
      current: Number(payload.currentStreak ?? 0),
      longest: Number(payload.longestStreak ?? 0),
    }
  }
  if (path === '/api/gamification/achievements') {
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(payload.achievements)
        ? payload.achievements
        : []
    return {
      achievements: rows.map((item) => {
        const row = item as Record<string, unknown>
        const definition = (
          row.achievement && typeof row.achievement === 'object'
            ? row.achievement
            : row
        ) as Record<string, unknown>
        const unlock = (
          row.unlock && typeof row.unlock === 'object'
            ? row.unlock
            : row
        ) as Record<string, unknown>
        return {
          type: String(definition.key ?? row.achievementKey ?? ''),
          title: String(definition.title ?? ''),
          description: String(definition.description ?? ''),
          icon: String(definition.icon ?? '🏅'),
          requiredValue: Number(definition.threshold ?? 1),
          unlocked: row.unlocked === true || Boolean(row.unlockedAt),
          unlockedAt: unlock.unlockedAt ? String(unlock.unlockedAt) : null,
        }
      }),
    }
  }
  if (path === '/api/gamification/daily-mission') {
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(payload.missions)
        ? payload.missions
        : []
    const daily = rows.find((item) => {
      const row = item as Record<string, unknown>
      const mission = (row.mission ?? row) as Record<string, unknown>
      return mission.cadence === 'daily'
    }) as Record<string, unknown> | undefined
    if (!daily) return { mission: null }
    const mission = (daily.mission ?? daily) as Record<string, unknown>
    return {
      mission: {
        title: String(mission.title ?? ''),
        description: String(mission.description ?? ''),
        xpReward: Number(mission.xpReward ?? 0),
        action: { label: 'Học ngay', route: '/home' },
      },
    }
  }
  if (path === '/api/gamification/class-celebration') {
    return { celebration: payload }
  }
  return payload
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
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
