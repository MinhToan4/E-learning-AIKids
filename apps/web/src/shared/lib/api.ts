import { environment } from '@/shared/config/environment'
import { createUuid } from './uuid'

const API_BASE = environment.apiBaseUrl
const TOKEN_KEY = 'storymee.access_token'

export function gatewayUrl(path: string): string {
  return `${API_BASE}${path}`
}

export function getAccessToken(): string | null {
  return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY)
}

export async function fetchRemoteBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Không tải được tệp (HTTP ${response.status}).`)
  return response.blob()
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

const inFlightGetRequests = new Map<string, Promise<unknown>>()

export function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Browser-restored links may retain a trailing slash; normalize before
  // routing and before deriving the in-flight request cache key.
  const legacyPath = path.replace(/\/(?=\?|$)/, '')
  const method = (options.method ?? 'GET').toUpperCase()
  const canDedupe =
    method === 'GET' &&
    options.body === undefined &&
    options.headers === undefined &&
    options.signal === undefined
  if (!canDedupe) return executeApi<T>(legacyPath, options)

  const key = `${getAccessToken() ?? 'anonymous'}:${legacyPath}`
  const pending = inFlightGetRequests.get(key)
  if (pending) return pending as Promise<T>

  const request = executeApi<T>(legacyPath, options)
  inFlightGetRequests.set(key, request)
  void request.finally(() => {
    if (inFlightGetRequests.get(key) === request) {
      inFlightGetRequests.delete(key)
    }
  }).catch(() => undefined)
  return request
}

async function executeApi<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  const request = normalizeGatewayRequest(path, options)
  const headers = new Headers(request.options.headers)
  const token = getAccessToken()
  if (request.options.body &&
      !(request.options.body instanceof FormData) &&
      !headers.has('Content-Type')) {
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
      credentials: 'omit',
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

export async function openAuthorizedStream(
  path: string,
  signal?: AbortSignal,
): Promise<Response> {
  const headers = new Headers({ Accept: 'text/event-stream' })
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(gatewayUrl(path), { headers, signal })
  if (!response.ok) {
    throw new ApiError(response.status, `Không mở được luồng cập nhật (HTTP ${response.status}).`)
  }
  return response
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
  if (path.startsWith('/api/v1/')) return { path, options }

  const direct: Record<string, string> = {
    '/api/auth/me': '/api/v1/account/me',
    '/api/auth/logout': '/api/v1/account/logout',
    '/api/auth/forgot-password': '/api/v1/account/forgot-password',
    '/api/auth/reset-password': '/api/v1/account/reset-password',
    '/api/auth/change-password': '/api/v1/account/me/password',
    '/api/auth/access': '/api/v1/account/me/access',
    '/api/auth/context': '/api/v1/account/me/contexts/select',
    '/api/auth/tenant': '/api/v1/account/tenant/resolve',
    '/api/courses': '/api/v1/lms/courses',
    '/api/enrollments': '/api/v1/lms/enrollments',
    '/api/learning/pathway': '/api/v1/lms/compat/pathway',
    '/api/notifications': '/api/v1/notifications',
    '/api/notifications/read-all': '/api/v1/notifications/read-all',
    '/api/notifications/preferences': '/api/v1/notifications/preferences',
    '/api/gamification/streak': '/api/v1/gamification/me/streak',
    '/api/gamification/achievements': '/api/v1/gamification/me/achievements',
    '/api/gamification/storybook': '/api/v1/gamification/me/storybook',
    '/api/gamification/social/graph': '/api/v1/gamification/me/social/graph',
    '/api/gamification/social/feed': '/api/v1/gamification/me/social/feed',
    '/api/gamification/social/discover': '/api/v1/gamification/me/social/discover',
    '/api/gamification/social/invites/pending-review': '/api/v1/gamification/me/social/invites/pending-review',
    '/api/gamification/daily-mission': '/api/v1/gamification/me/missions',
    '/api/gamification/profile': '/api/v1/gamification/me',
    '/api/gamification/class-celebration':
      '/api/v1/gamification/me/celebration',
    '/api/gamification/catalog': '/api/v1/gamification/catalog',
  }
  if (path === '/api/gamification/check-in') {
    return {
      path: '/api/v1/gamification/me/streak',
      options: { ...options, method: 'GET', body: undefined },
    }
  }
  if (path.startsWith('/api/gamification/catalog?')) {
    return { path: path.replace('/api/gamification/catalog', '/api/v1/gamification/catalog'), options }
  }
  if (path.startsWith('/api/admin/legend-studio')) {
    return {
      path: path.replace('/api/admin/legend-studio', '/api/v1/gamification/admin/studio'),
      options,
    }
  }
  const gamificationMeAction = path.match(
    /^\/api\/gamification\/(storybook\/chapters\/[^/?]+\/claim|rewards\/equipment\/[^/?]+|social\/invites(?:\/accept)?|social\/invites\/[^/?]+\/review|social\/connections\/[^/?]+(?:\/favorite)?|social\/activities\/[^/?]+\/reaction)$/,
  )
  if (gamificationMeAction) {
    return {
      path: `/api/v1/gamification/me/${gamificationMeAction[1]}`,
      options,
    }
  }
  if (path === '/api/profile/settings') {
    return { path: '/api/v1/account/profiles/me/settings', options }
  }
  const publicProfile = path.match(/^\/api\/public\/profiles\/([^/?]+)$/)
  if (publicProfile) {
    return {
      path: `/api/v1/account/profiles/${encodeURIComponent(publicProfile[1])}`,
      options,
    }
  }
  if (path === '/api/account/workspaces') {
    return { path: '/api/v1/account/workspaces', options }
  }
  const workspaceGrants = path.match(/^\/api\/account\/workspaces\/([^/?]+)\/grants$/)
  if (workspaceGrants) {
    return {
      path: `/api/v1/account/workspaces/${encodeURIComponent(workspaceGrants[1])}/grants`,
      options,
    }
  }
  const sharedWorkspace = path.match(/^\/api\/public\/workspaces\/([^/?]+)$/)
  if (sharedWorkspace) {
    return {
      path: `/api/v1/account/shared-workspaces/${encodeURIComponent(sharedWorkspace[1])}`,
      options,
    }
  }
  if (path === '/api/parent/plans') {
    return { path: '/api/v1/billing/plans', options }
  }
  if (path === '/api/parent/subscription') {
    if ((options.method ?? 'GET').toUpperCase() === 'POST') {
      const plan = String(body.planCode ?? '')
      const headers = new Headers(options.headers)
      const key = `aikids-plan-${plan}-${createUuid()}`
      headers.set('Idempotency-Key', key)
      return {
        path: '/api/v1/billing/me/checkout',
        options: {
          ...withJson(options, { plan, idempotencyKey: key }),
          headers,
        },
      }
    }
    return { path: '/api/v1/billing/me/subscription', options }
  }
  if (path === '/api/media/refs' || path === '/api/backpack') {
    const activeIpId = typeof window !== 'undefined' ? localStorage.getItem('storymee_active_ip_id') : null
    const ipSuffix = activeIpId ? `?ipId=${encodeURIComponent(activeIpId)}` : ''
    return { path: `/api/v1/media/gallery${ipSuffix}`, options }
  }
  if (path === '/api/projects') {
    const activeIpId = typeof window !== 'undefined' ? localStorage.getItem('storymee_active_ip_id') : null
    const ipSuffix = activeIpId ? `?ipId=${encodeURIComponent(activeIpId)}` : ''
    return { path: `/api/v1/media/gallery${ipSuffix}`, options }
  }
  const projectShare = path.match(/^\/api\/projects\/([^/?]+)\/request-share$/)
  if (projectShare) {
    return {
      path: `/api/v1/media/gallery/${encodeURIComponent(projectShare[1])}/request-share`,
      options,
    }
  }
  if (path === '/api/media/upload') {
    return { path: '/api/v1/media/upload?permanent=1&assetType=aikids', options }
  }
  if (path === '/api/media/promote') {
    return { path: '/api/v1/media/gallery/promote', options }
  }
  if (path === '/api/admin/system' || path === '/api/admin/analytics') {
    return { path: '/api/v1/system/aikids/admin/summary', options }
  }
  if (/^\/api\/admin\/users(?:\/[^/?]+)?(?:\?.*)?$/.test(path) ||
      /^\/api\/admin\/login-logs(?:\?.*)?$/.test(path)) {
    const isAdminUserPatch = /^\/api\/admin\/users\/[^/?]+$/.test(path) &&
      (options.method ?? 'GET').toUpperCase() === 'PATCH'
    return {
      path: path.replace('/api/admin', '/api/v1/account/admin'),
      options: path === '/api/admin/users' &&
        (options.method ?? 'GET').toUpperCase() === 'POST'
        ? withJson(options, { ...body, name: body.nickname })
        : isAdminUserPatch
          ? withJson(options, {
            ...body,
            name: body.nickname,
            role: body.role === 'student' ? 'user' : body.role,
          })
          : options,
    }
  }
  if (/^\/api\/admin\/courses(?:\/[^/?]+)?$/.test(path)) {
    return {
      path: path.replace('/api/admin', '/api/v1/lms/aikids/admin'),
      options,
    }
  }
  if (path === '/api/admin/settings/vidtory') {
    const method = (options.method ?? 'GET').toUpperCase()
    if (method === 'GET') {
      return { path: '/api/v1/jobs/providers/policy', options }
    }
    if (method === 'DELETE') {
      return {
        path: '/api/v1/jobs/providers/policy',
        options: withJson({ ...options, method: 'PUT' }, {
          planProviderPolicy: {},
          disabledImageProviders: [],
        }),
      }
    }
    const routing = recordValue(body.routing)
    const image = recordValue(routing.image)
    const video = recordValue(routing.video)
    const imageModels = Array.isArray(image.models)
      ? image.models as Array<Record<string, unknown>>
      : []
    const videoModels = Array.isArray(video.models)
      ? video.models as Array<Record<string, unknown>>
      : []
    const enabled = [...imageModels, ...videoModels]
      .filter((model) => model.enabled !== false)
      .map((model) => String(model.modelId ?? '').trim())
      .filter(Boolean)
    return {
      path: '/api/v1/jobs/providers/policy',
      options: withJson({ ...options, method: 'PUT' }, {
        planProviderPolicy: {
          aikids: {
            allowedProviders: [...new Set(enabled)],
            defaultImageRoute: imageModels
              .filter((model) => model.enabled !== false)
              .map((model) => String(model.modelId ?? '').trim())
              .filter(Boolean),
          },
        },
      }),
    }
  }
  if (path === '/api/auth/login/student') {
    return {
      path: '/api/v1/account/family/child-login',
      options: withJson(options, {
        familyCode: body.familyCode,
        nickname: body.nickname,
        pin: body.pin,
      }),
    }
  }
  if (path === '/api/auth/google/config') {
    return { path: '/api/v1/account/auth/google/config', options }
  }
  if (path === '/api/auth/firebase/config') {
    return { path: '/api/v1/account/auth/firebase/config', options }
  }
  if (path === '/api/auth/firebase/custom-token') {
    return { path: '/api/v1/account/auth/firebase/custom-token', options }
  }
  if (path === '/api/auth/login/firebase') {
    return { path: '/api/v1/account/auth/firebase/google', options }
  }
  if (path === '/api/auth/login/google') {
    return { path: '/api/v1/account/auth/google', options }
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
        login: body.login ?? body.email,
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
    /^\/api\/progress\/([^/?]+)\/(start|advance|practice|check|check-answer)$/,
  )
  if (lessonAction) {
    const headers = new Headers(options.headers)
    if (lessonAction[2] === 'check' && !headers.has('Idempotency-Key')) {
      headers.set('Idempotency-Key', createUuid())
    }
    return {
      path: `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonAction[1])}/${lessonAction[2]}`,
      options: { ...options, headers },
    }
  }
  if (path === '/api/parent/children') {
    const childPin = typeof body.pin === 'string' ? body.pin.trim() : ''
    return {
      path: '/api/v1/account/family/children',
      options: options.method === 'POST'
        ? withJson(options, {
          name: body.nickname,
          ageBand: '9-12',
          avatarUrl: body.avatarId,
          language: 'vi',
          allowAiCreate: true,
          // core-account creates a users row together with the child profile.
          // PIN is the only credential exposed by AiKid; use an opaque internal
          // password until the dedicated PIN endpoint enables child login.
          password: childPin || createUuid(),
        })
        : options,
    }
  }
  if (path === '/api/parent/family-login-code') {
    return { path: '/api/v1/account/family/login-code', options }
  }
  if (path === '/api/parent/profile') {
    return { path: '/api/v1/account/parent-profile', options }
  }
  if (path === '/api/parent/gate/verify') {
    return { path: '/api/v1/account/family/gate-verify', options }
  }
  if (/^\/api\/parent\/approvals(?:\?.*)?$/.test(path)) {
    return {
      path: path.replace('/api/parent/approvals', '/api/v1/media/gallery/share-requests'),
      options,
    }
  }
  const approvalDecision = path.match(/^\/api\/parent\/approvals\/([^/?]+)\/decide$/)
  if (approvalDecision) {
    return {
      path: `/api/v1/media/gallery/share-requests/${encodeURIComponent(approvalDecision[1])}/decide`,
      options,
    }
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
  const childCourses = path.match(
    /^\/api\/parent\/children\/([^/?]+)\/courses$/,
  )
  if (childCourses) {
    return {
      path: `/api/v1/lms/family/children/${encodeURIComponent(childCourses[1])}/courses`,
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
  if (path === '/api/teacher/class' ||
      path === '/api/teacher/class/stats' ||
      path === '/api/teacher/class/students' ||
      path === '/api/teacher/lectures' ||
      path === '/api/teacher/lectures/reorder' ||
      path === '/api/teacher/courses' ||
      /^\/api\/teacher\/class\/students\/[^/?]+$/.test(path) ||
      /^\/api\/teacher\/students\/[^/?]+\/progress$/.test(path) ||
      /^\/api\/teacher\/lectures\/[^/?]+(?:\/restore)?$/.test(path) ||
      /^\/api\/teacher\/courses\/[^/?]+$/.test(path)) {
    return {
      path: path.replace('/api/teacher', '/api/v1/lms/aikids/teacher'),
      options,
    }
  }
  const legacyUrl = new URL(path, 'https://storymee.local')
  const studentId = legacyUrl.searchParams.get('studentId')
  if (legacyUrl.pathname === '/api/learning/pathway') {
    return {
      path: studentId
        ? `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/pathway`
        : '/api/v1/lms/me/pathway',
      options,
    }
  }
  if (legacyUrl.pathname === '/api/competency-map') {
    return {
      path: studentId
        ? `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/competency-map`
        : '/api/v1/lms/me/competency-map',
      options,
    }
  }
  if (legacyUrl.pathname === '/api/credentials') {
    return {
      path: studentId
        ? `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/credentials`
        : '/api/v1/lms/me/credentials',
      options,
    }
  }
  if (legacyUrl.pathname === '/api/reports' && studentId) {
    return {
      path: `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/reports`,
      options,
    }
  }
  if (legacyUrl.pathname === '/api/schedule' && studentId) {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear() + 1, now.getMonth(), 1)
    return {
      path: `/api/v1/lms/family/children/${encodeURIComponent(studentId)}/schedule?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
      options,
    }
  }
  if (legacyUrl.pathname === '/api/schedule/placement-requests') {
    const childProfileId = studentId ?? String(body.studentId ?? '')
    if (childProfileId) {
      const status = legacyUrl.searchParams.get('status')
      return {
        path: `/api/v1/lms/family/children/${encodeURIComponent(childProfileId)}/placement-requests${status ? `?status=${encodeURIComponent(status)}` : ''}`,
        options: (options.method ?? 'GET').toUpperCase() === 'POST'
          ? withJson(options, {
              courseId: body.courseId,
              requestedLevel: body.requestedLevel,
              availability: { slots: body.availability },
              reason: body.reason || 'Parent requested class placement',
            })
          : options,
      }
    }
  }
  if (legacyUrl.pathname === '/api/schedule/reschedule-requests') {
    const childProfileId = String(body.studentId ?? '')
    if (childProfileId) {
      return {
        path: `/api/v1/lms/family/children/${encodeURIComponent(childProfileId)}/reschedule-requests`,
        options: withJson(options, {
          sessionId: body.sessionId,
          preferredStartsAt: body.preferredStartsAt,
          preferredEndsAt: body.preferredEndsAt,
          reason: body.reason,
        }),
      }
    }
  }
  const lessonNotes = legacyUrl.pathname.match(
    /^\/api\/learning\/quests\/([^/]+)\/notes$/,
  )
  if (lessonNotes) {
    return {
      path: `/api/v1/lms/lessons/${encodeURIComponent(lessonNotes[1])}/notes`,
      options: (options.method ?? 'GET').toUpperCase() === 'POST'
        ? withJson(options, {
            body: body.body,
            anchor: body.anchorType === 'section'
              ? { sectionId: body.anchorValue }
              : {},
          })
        : options,
    }
  }
  const lessonBookmarks = legacyUrl.pathname.match(
    /^\/api\/learning\/quests\/([^/]+)\/bookmarks$/,
  )
  if (lessonBookmarks) {
    return {
      path: `/api/v1/lms/lessons/${encodeURIComponent(lessonBookmarks[1])}/bookmarks`,
      options: (options.method ?? 'GET').toUpperCase() === 'POST'
        ? withJson(options, {
            anchorKey: `${String(body.anchorType ?? 'section')}:${String(body.anchorValue ?? '')}`,
            label: body.label,
          })
        : options,
    }
  }
  const lessonNote = legacyUrl.pathname.match(
    /^\/api\/learning\/notes\/([^/]+)$/,
  )
  if (lessonNote) {
    return {
      path: `/api/v1/lms/notes/${encodeURIComponent(lessonNote[1])}`,
      options,
    }
  }
  const lessonBookmark = legacyUrl.pathname.match(
    /^\/api\/learning\/bookmarks\/([^/]+)$/,
  )
  if (lessonBookmark) {
    return {
      path: `/api/v1/lms/bookmarks/${encodeURIComponent(lessonBookmark[1])}`,
      options,
    }
  }
  const lessonResume = legacyUrl.pathname.match(
    /^\/api\/learning\/quests\/([^/]+)\/resume$/,
  )
  if (lessonResume) {
    return {
      path: `/api/v1/lms/lessons/${encodeURIComponent(lessonResume[1])}/resume`,
      options,
    }
  }
  const offlineGrant = legacyUrl.pathname.match(
    /^\/api\/learning\/quests\/([^/]+)\/offline-manifest$/,
  )
  if (offlineGrant) {
    return {
      path: `/api/v1/lms/lessons/${encodeURIComponent(offlineGrant[1])}/offline-grants`,
      options,
    }
  }
  const offlineSync = legacyUrl.pathname.match(
    /^\/api\/learning\/quests\/([^/]+)\/offline-sync$/,
  )
  if (offlineSync) {
    const events = Array.isArray(body.events)
      ? body.events.map((event) => ({
          ...recordValue(event),
          eventType: 'progress',
        }))
      : []
    return {
      path: '/api/v1/lms/offline-progress/sync',
      options: withJson(options, {
        grantId: body.grantId,
        deviceId: body.deviceId,
        events,
      }),
    }
  }
  const courseAssessments = legacyUrl.pathname.match(
    /^\/api\/assessments\/course\/([^/]+)$/,
  )
  if (courseAssessments) {
    return {
      path: `/api/v1/lms/courses/${encodeURIComponent(courseAssessments[1])}/assessments`,
      options,
    }
  }
  const assessmentAttempt = legacyUrl.pathname.match(
    /^\/api\/assessments\/([^/]+)\/attempts$/,
  )
  if (assessmentAttempt) {
    return {
      path: `/api/v1/lms/assessments/${encodeURIComponent(assessmentAttempt[1])}/attempts`,
      options,
    }
  }
  const attemptResult = legacyUrl.pathname.match(
    /^\/api\/assessment-attempts\/([^/]+)\/result$/,
  )
  if (attemptResult) {
    return {
      path: `/api/v1/lms/assessment-attempts/${encodeURIComponent(attemptResult[1])}`,
      options,
    }
  }
  const attemptAction = legacyUrl.pathname.match(
    /^\/api\/assessment-attempts\/([^/]+)\/(responses\/[^/]+|submit)$/,
  )
  if (attemptAction) {
    const isSubmit = attemptAction[2] === 'submit'
    return {
      path: `/api/v1/lms/assessment-attempts/${encodeURIComponent(attemptAction[1])}/${attemptAction[2]
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`,
      options: withJson(options, isSubmit
        ? {
            clientSubmissionId: body.clientSubmissionId,
            version: body.attemptVersion,
          }
        : {
            response: body.response,
            version: body.responseVersion,
          }),
    }
  }
  // WHY: AgeExperienceProvider calls /api/learning/age-policy to fetch per-student
  // UI density, copy tone and permission policy from core-lms-api via the gateway.
  if (path.startsWith('/api/learning/age-policy')) {
    const agePolicyUrl = new URL(path, 'https://storymee.local')
    const childProfileId = agePolicyUrl.searchParams.get('studentId')
    return {
      path: childProfileId
        ? `/api/v1/lms/family/children/${encodeURIComponent(childProfileId)}/age-policy`
        : '/api/v1/lms/me/age-policy',
      options,
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
  const dataObj = (raw.data && typeof raw.data === 'object' ? raw.data : {}) as Record<string, unknown>
  const unwrapped = (raw.child ?? dataObj.child ?? raw.user ?? dataObj.user ?? dataObj ?? raw) as Record<string, unknown>
  const actor = String(unwrapped.actor ?? unwrapped.role ?? raw.actor ?? raw.role ?? 'parent')
  const role: User['role'] =
    actor === 'child' || actor === 'student' ? 'student' :
      actor === 'teacher' ? 'teacher' :
        actor === 'admin' ? 'admin' : 'parent'

  const nameVal = unwrapped.name ?? unwrapped.nickname ?? unwrapped.childName ?? unwrapped.loginUsername ?? raw.name ?? raw.nickname
  const nameStr = nameVal ? String(nameVal) : null

  return {
    id: String(unwrapped.id ?? unwrapped.userId ?? raw.id ?? raw.userId ?? ''),
    role,
    email: unwrapped.email ? String(unwrapped.email) : raw.email ? String(raw.email) : null,
    nickname: nameStr,
    name: nameStr,
    avatarId: unwrapped.avatarId ? String(unwrapped.avatarId) : unwrapped.avatarUrl ? String(unwrapped.avatarUrl) : raw.avatarId ? String(raw.avatarId) : raw.avatarUrl ? String(raw.avatarUrl) : null,
    level: Number(unwrapped.level ?? raw.level ?? 1),
    xp: Number(unwrapped.xp ?? raw.xp ?? 0),
    onboarded: unwrapped.onboarded !== false && raw.onboarded !== false,
    goal: unwrapped.goal ? String(unwrapped.goal) : raw.goal ? String(raw.goal) : null,
    parentId: unwrapped.parentId ? String(unwrapped.parentId) : raw.parentId ? String(raw.parentId) : null,
    classId: unwrapped.organizationId ? String(unwrapped.organizationId) : raw.organizationId ? String(raw.organizationId) : null,
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
    ageTrack: metadata.ageTrack
      ? String(metadata.ageTrack)
      : raw.ageTrack
        ? String(raw.ageTrack)
        : raw.ageBand
          ? String(raw.ageBand)
          : undefined,
    courseKey: raw.slug ? String(raw.slug) : raw.courseKey ? String(raw.courseKey) : undefined,
    durationLabel: String(metadata.durationLabel ?? ''),
    productLabel: String(metadata.productLabel ?? 'Khóa học StoryMee'),
    status: 'open',
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

function mapAssessmentAttempt(raw: Record<string, unknown>) {
  const items = Array.isArray(raw.items)
    ? raw.items as Array<Record<string, unknown>>
    : []
  return {
    ...raw,
    items: items.map((item) => {
      const response = recordValue(item.response)
      return {
        ...item,
        response: item.response
          ? {
              ...response,
              responseJson: response.response ?? response.responseJson ?? {},
            }
          : null,
      }
    }),
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
  if (path === '/api/auth/context') {
    const token = String(payload.accessToken ?? payload.token ?? '')
    if (token) setAccessToken(token)
    return payload
  }
  if (path === '/api/parent/gate/verify') {
    const token = String(payload.token ?? payload.accessToken ?? '')
    if (token) setAccessToken(token)
    return {
      user: mapUser(recordValue(payload.user)),
      message: String(payload.message ?? 'Parent password verified'),
    }
  }
  if (path === '/api/parent/profile') {
    return {
      profile: {
        ...recordValue(payload.profile),
        maxChildren: Number(recordValue(payload.profile).maxChildren ?? 0),
      },
    }
  }
  if (/^\/api\/parent\/approvals(?:\?.*)?$/.test(path)) {
    return {
      approvals: Array.isArray(payload.approvals) ? payload.approvals : [],
    }
  }
  if (path === '/api/admin/system') return { system: payload.system }
  if (path === '/api/admin/analytics') return { analytics: payload.analytics }
  if (/^\/api\/admin\/users(?:\?.*)?$/.test(path)) {
    const rows = Array.isArray(body.data) ? body.data as Array<Record<string, unknown>> : []
    return {
      users: rows.map((row) => ({
        ...row,
        nickname: row.name ? String(row.name) : null,
        level: Number(row.level ?? 1),
        xp: Number(row.xp ?? 0),
      })),
    }
  }
  if (path === '/api/admin/login-logs' &&
      (body.data && typeof body.data === 'object') &&
      'deleted' in recordValue(body.data)) {
    const deleted = Number(recordValue(body.data).deleted ?? 0)
    return { deleted, message: `Đã xóa ${deleted} bản ghi đăng nhập` }
  }
  if (/^\/api\/admin\/login-logs(?:\?.*)?$/.test(path)) {
    const rows = Array.isArray(body.data) ? body.data as Array<Record<string, unknown>> : []
    const byOutcome = rows.reduce<Record<string, number>>((summary, row) => {
      const outcome = String(row.outcome ?? 'unknown')
      summary[outcome] = (summary[outcome] ?? 0) + 1
      return summary
    }, {})
    return {
      logs: rows.map((row) => ({
        ...row,
        email: row.login ?? null,
        ipAddress: row.ip ?? null,
        reason: null,
      })),
      summary: {
        total: rows.length,
        byOutcome,
        windowHours: 24 * 30,
        purgedAt: new Date().toISOString(),
      },
    }
  }
  if (path === '/api/admin/courses') {
    const rows = Array.isArray(payload.courses)
      ? payload.courses as Array<Record<string, unknown>>
      : []
    return {
      courses: rows.map((row) => {
        const mapped = mapCourse(row)
        const lectures = Array.isArray(row.lectures)
          ? row.lectures as Array<Record<string, unknown>>
          : []
        return {
          ...row,
          ageLabel: mapped.ageLabel,
          ageTrack: mapped.ageTrack,
          enrollmentCount: Number(row.enrollmentCount ?? 0),
          questCount: lectures.length,
          quests: lectures,
        }
      }),
    }
  }
  if (path === '/api/admin/settings/vidtory') {
    const policy = recordValue(payload.planProviderPolicy)
    const aikids = recordValue(policy.aikids)
    const imageRoute = Array.isArray(aikids.defaultImageRoute)
      ? aikids.defaultImageRoute.map(String)
      : []
    const providers = Array.isArray(aikids.allowedProviders)
      ? aikids.allowedProviders.map(String)
      : imageRoute
    const imageModels = imageRoute.map((modelId, index) => ({
      modelId,
      weight: index === 0 ? 100 : 0,
      percent: index === 0 ? 100 : 0,
      enabled: true,
    }))
    const videoModels = providers
      .filter((provider) => !imageRoute.includes(provider))
      .map((modelId, index) => ({
        modelId,
        weight: index === 0 ? 100 : 0,
        percent: index === 0 ? 100 : 0,
        enabled: true,
      }))
    const routing = {
      baseURL: 'StoryMee Hub → Job API → Media Rotation',
      image: {
        aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
        resolution: '1K',
        models: imageModels,
      },
      video: {
        aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
        duration: 6,
        models: videoModels,
      },
    }
    return {
      configured: providers.length > 0,
      maskedHint: providers.length ? `${providers.length} provider route(s)` : null,
      source: 'core-job-api',
      routing,
      imagePercents: imageModels,
      videoPercents: videoModels,
    }
  }
  if (path === '/api/parent/plans') {
    const rows = Array.isArray(body.data) ? body.data as Array<Record<string, unknown>> : []
    return {
      plans: rows.map((row) => ({
        code: String(row.id ?? ''),
        name: String(row.name ?? ''),
        tagline: String(row.tagline ?? ''),
        maxChildren: Number(row.maxChildren ?? 0),
        maxOpenCoursesPerChild: Number(row.maxOpenCoursesPerChild ?? 0),
        priceMonthly: Number(row.amountMinor ?? 0),
        currency: String(row.currency ?? 'vnd').toUpperCase(),
        features: Array.isArray(row.features) ? row.features.map(String) : [],
      })),
    }
  }
  if (path === '/api/parent/subscription') {
    const subscription = recordValue(payload.subscription ?? payload)
    const plan = recordValue(subscription.planDef)
    const planCode = String(subscription.plan ?? plan.id ?? 'free')
    const maxChildren = Number(plan.maxChildren ?? 0)
    return {
      subscription: {
        planCode,
        planName: String(plan.name ?? planCode),
        status: String(subscription.status ?? 'pending'),
        maxChildren,
        maxOpenCoursesPerChild: Number(plan.maxOpenCoursesPerChild ?? 0),
        childCount: 0,
        seatsRemaining: maxChildren,
        features: Array.isArray(plan.features) ? plan.features.map(String) : [],
        currentPeriodEnd: subscription.expiresAt
          ? String(subscription.expiresAt)
          : null,
      },
      message: typeof body.message === 'string' ? body.message : '',
      checkout: body.checkout,
    }
  }
  if (path === '/api/media/refs' || path === '/api/backpack') {
    const rows = Array.isArray(payload.items)
      ? payload.items as Array<Record<string, unknown>>
      : []
    const assets = rows.flatMap((row) => {
      const metadata = recordValue(row.metadata)
      if (metadata.purpose === 'creative_workshop' || metadata.creativeKind) return []
      const url = browserMediaUrl(row.imageUrl ?? row.url)
      return [{
        id: String(row.id ?? ''),
        type: String(metadata.assetType ?? 'image'),
        name: String(metadata.originalName ?? 'Sản phẩm sáng tạo'),
        thumbnail: url,
        url,
        private: true,
        questId: metadata.questId ? String(metadata.questId) : null,
        createdAt: String(row.createdAt ?? ''),
      }]
    })
    return path === '/api/media/refs' ? { assets } : { assets }
  }
  if (path === '/api/projects') {
    const rows = Array.isArray(payload.items)
      ? payload.items as Array<Record<string, unknown>>
      : []
    return {
      projects: rows.flatMap((row) => {
        const metadata = recordValue(row.metadata)
        if (metadata.purpose !== 'creative_workshop' && !metadata.creativeKind) return []
        return [{
          id: String(row.id ?? ''),
          title: String(metadata.originalName ?? 'Sản phẩm sáng tạo'),
          kind: String(metadata.creativeKind ?? metadata.assetType ?? 'image'),
          thumbnail: browserMediaUrl(row.imageUrl),
          content: String(metadata.content ?? ''),
          shareStatus: String(metadata.shareStatus ?? 'private'),
        }]
      }),
    }
  }
  if (path === '/api/media/upload') {
    const item = recordValue(payload.libraryItem)
    const url = String(payload.url ?? payload.imageUrl ?? '')
    return {
      asset: {
        id: String(item.id ?? ''),
        url,
        mediaId: String(item.id ?? ''),
        storageBackend: 'storymee-media',
      },
    }
  }
  if (path === '/api/courses' && Array.isArray(payload.courses)) {
    return {
      courses: payload.courses.map((course) => {
        const raw = course as Record<string, unknown>
        const mapped = mapCourse(raw)
        return {
          ...mapped,
          // Preserve server-side enrollment & progress — mapCourse hardcodes enrolled=false
          enrolled: Boolean(raw.enrolled),
          questCount: raw.questCount != null ? Number(raw.questCount) : mapped.questCount,
          completedCount: Number(raw.completedCount ?? 0),
          progressPct: Number(raw.progressPct ?? 0),
        }
      }),
    }
  }
  if (/^\/api\/learning\/pathway(?:\?.*)?$/.test(path) &&
      Array.isArray(payload.courses)) {
    // A pathway is the child's enrolled learning list. Keep this defensive
    // filter while older LMS deployments may still return the public catalog.
    const courses = payload.courses
      .filter((course) => {
        const raw = course as Record<string, unknown>
        return raw.enrolled === true ||
          raw.status === 'active' ||
          raw.status === 'completed'
      })
      .map((course) => {
      const raw = course as Record<string, unknown>
      const mapped = mapCourse(raw)
      const enrolled = raw.enrolled === true
      const progressPct = Number(
        raw.completionPercent ?? raw.progressPct ?? 0,
      )
      const completed = progressPct >= 100
      const canonicalStatus =
        raw.status === 'active' || raw.status === 'completed'
          ? raw.status
          : null
      const isEnrolled =
        enrolled ||
        canonicalStatus === 'active' ||
        canonicalStatus === 'completed'
      return {
        id: mapped.id,
        title: mapped.title,
        shortTitle: mapped.shortTitle,
        enrolled: isEnrolled,
        status:
          canonicalStatus ??
          (completed ? 'completed' : enrolled ? 'active' : 'available'),
        reasonCode: completed
          ? 'completed'
          : canonicalStatus === 'active' || enrolled
            ? 'in_progress'
            : 'requirements_met',
        completionPercent: progressPct,
        missingPrerequisites: [],
        coverImage: mapped.coverImage,
        // Every row has already passed the canonical enrollment filter above.
        // Keep this explicit because pathway consumers must not infer access
        // from presentation status alone.
      }
      })
    const recommended = courses.find((course) => course.status === 'active') ??
      courses.find((course) => course.status === 'available') ??
      null
    const firstRaw = payload.courses[0] as Record<string, unknown> | undefined
    return {
      student: {
        nickname: null,
        ageBand: String(firstRaw?.ageBand ?? '8-11'),
      },
      policy: { label: 'Lộ trình học AI theo tiến độ của con' },
      recommendedCourseId: recommended?.id ?? null,
      courses,
    }
  }
  if (/^\/api\/courses\/[^/?]+$/.test(path) && payload.course) {
    const raw = payload.course as Record<string, unknown>
    return {
      course: {
        ...mapCourse(raw),
        enrolled: raw.enrolled === true,
        enrollmentId: raw.enrollmentId ? String(raw.enrollmentId) : null,
        enrollmentSource: raw.enrollmentSource ? String(raw.enrollmentSource) : null,
      },
    }
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
        order: Number(row.order ?? index + 1),
        title: String(row.title ?? `Trạm ${index + 1}`),
        skill: String(row.skill ?? ''),
        reward: String(row.reward ?? ''),
        duration: String(row.duration ?? ''),
        hook: String(row.hook ?? ''),
        accent: String(row.accent ?? ''),
        practiceKind: String(row.practiceKind ?? ''),
        status: String(row.status ?? 'locked'),
        phase: String(row.phase ?? 'learn'),
        stars: Number(row.stars ?? 0),
        xpEarned: Number(row.xpEarned ?? 0),
        videoUrl: typeof row.videoUrl === 'string' ? row.videoUrl : null,
      })),
    }
  }
  if (/^\/api\/parent\/children\/[^/?]+\/courses$/.test(path)) {
    const child = recordValue(payload.child)
    const courses = Array.isArray(payload.courses)
      ? payload.courses as Array<Record<string, unknown>>
      : []
    return {
      child: {
        id: String(child.id ?? ''),
        nickname: child.name ? String(child.name) : null,
        ageBand: child.ageBand ? String(child.ageBand) : null,
      },
      courses: courses.map((row) => {
        const mapped = mapCourse(row)
        return {
          id: mapped.id,
          title: mapped.title,
          shortTitle: mapped.shortTitle,
          ageLabel: mapped.ageLabel,
          ageTrack: mapped.ageTrack ?? '',
          tagline: mapped.tagline,
          coverImage: mapped.coverImage,
          enrolled: row.enrolled === true,
          parentAllowed:
            typeof row.parentAllowed === 'boolean'
              ? row.parentAllowed
              : null,
        }
      }),
      enrolled: payload.enrolled,
      enrollment: payload.enrollment,
    }
  }
  if (/^\/api\/learning\/pathway(?:\?.*)?$/.test(path)) {
    const source = recordValue(payload.pathway ?? payload)
    const courses = Array.isArray(source.courses)
      ? source.courses as Array<Record<string, unknown>>
      : []
    const recommended =
      courses.find((course) => course.status === 'active') ??
      courses.find((course) => course.status === 'available')
    return {
      ...source,
      student: {
        ...recordValue(source.student),
        ageBand: String(
          recordValue(source.student).ageBand ?? source.ageBand ?? '',
        ),
      },
      policy: source.policy ?? null,
      recommendedCourseId:
        source.recommendedCourseId ?? recommended?.id ?? null,
      courses: courses.map((course) => ({
        ...course,
        shortTitle: String(course.shortTitle ?? course.title ?? ''),
        coverImage: course.coverImage ? String(course.coverImage) : null,
      })),
    }
  }
  if (/^\/api\/learning\/quests\/[^/]+\/notes$/.test(path)) {
    const notes = Array.isArray(payload.notes)
      ? payload.notes as Array<Record<string, unknown>>
      : []
    return {
      notes: notes.map((note) => {
        const anchor = recordValue(note.anchor)
        return {
          ...note,
          anchorType: anchor.sectionId ? 'section' : 'lesson',
          anchorValue: String(anchor.sectionId ?? anchor.blockId ?? ''),
        }
      }),
    }
  }
  if (/^\/api\/learning\/quests\/[^/]+\/bookmarks$/.test(path)) {
    const bookmarks = Array.isArray(payload.bookmarks)
      ? payload.bookmarks as Array<Record<string, unknown>>
      : []
    return {
      bookmarks: bookmarks.map((bookmark) => {
        const [anchorType, ...anchorParts] = String(
          bookmark.anchorKey ?? '',
        ).split(':')
        return {
          ...bookmark,
          anchorType: anchorType || 'section',
          anchorValue: anchorParts.join(':'),
        }
      }),
    }
  }
  if (/^\/api\/learning\/quests\/[^/]+\/offline-manifest$/.test(path)) {
    const grant = recordValue(payload.grant)
    const manifest = recordValue(grant.manifest)
    const lesson = recordValue(manifest.lesson)
    const metadata = recordValue(lesson.metadata)
    const stations = Array.isArray(lesson.stations) ? lesson.stations : []
    const media = Array.isArray(metadata.media)
      ? metadata.media.map(String)
      : []
    return {
      manifest: {
        grantId: String(grant.id ?? ''),
        questId: String(lesson.id ?? ''),
        contentVersion: Number(grant.contentVersion ?? 1),
        expiresAt: String(grant.expiresAt ?? ''),
        lesson: {
          title: String(lesson.title ?? ''),
          hook: String(metadata.hook ?? ''),
          skill: String(metadata.skill ?? ''),
          learnCards: Array.isArray(metadata.learnCards)
            ? metadata.learnCards
            : [],
          stations,
        },
        media,
      },
    }
  }
  if (/^\/api\/learning\/quests\/[^/]+\/offline-sync$/.test(path)) {
    const sync = recordValue(payload.sync)
    return {
      sync: {
        ...sync,
        duplicate: Number(sync.duplicates ?? sync.duplicate ?? 0),
      },
    }
  }
  if (/^\/api\/schedule\?/.test(path)) {
    const sessions = Array.isArray(payload.sessions)
      ? payload.sessions as Array<Record<string, unknown>>
      : []
    const byClassroom = new Map<string, Array<Record<string, unknown>>>()
    for (const session of sessions) {
      const classroomId = String(session.classroomId ?? 'unassigned')
      const rows = byClassroom.get(classroomId) ?? []
      rows.push(session)
      byClassroom.set(classroomId, rows)
    }
    return {
      classes: [...byClassroom.entries()].map(([id, rows]) => ({
        id,
        name: 'Lớp học',
        classType: 'group',
        teacher: { nickname: null },
        course: null,
        sessions: rows.map((session) => ({
          ...session,
          quest: session.lessonId
            ? { id: String(session.lessonId), title: String(session.title ?? '') }
            : null,
        })),
      })),
    }
  }
  if (/^\/api\/schedule\/placement-requests(?:\?.*)?$/.test(path)) {
    const requests = Array.isArray(payload.requests)
      ? payload.requests as Array<Record<string, unknown>>
      : []
    return {
      requests: requests.map((request) => ({
        ...request,
        course: {
          id: String(request.courseId ?? ''),
          title: 'Khóa học',
        },
        targetClass: null,
      })),
    }
  }
  if (/^\/api\/assessments\/[^/]+\/attempts$/.test(path)) {
    return {
      attempt: mapAssessmentAttempt(recordValue(payload.attempt)),
    }
  }
  if (/^\/api\/assessment-attempts\/[^/]+\/responses\/[^/]+$/.test(path)) {
    const response = recordValue(payload.response)
    return {
      saved: {
        responseVersion: Number(response.version ?? 0),
      },
    }
  }
  if (/^\/api\/assessment-attempts\/[^/]+\/submit$/.test(path)) {
    return {
      attempt: mapAssessmentAttempt(recordValue(payload.attempt)),
    }
  }
  if (/^\/api\/assessment-attempts\/[^/]+\/result$/.test(path)) {
    const attempt = mapAssessmentAttempt(recordValue(payload.attempt))
    const items = Array.isArray(attempt.items)
      ? attempt.items as Array<Record<string, unknown>>
      : []
    return {
      result: {
        ...attempt,
        responses: items.map((item) => {
          const response = recordValue(item.response)
          return {
            question: recordValue(item.question),
            points: Number(item.points ?? 0),
            ratio: null,
            feedback:
              typeof response.feedback === 'string'
                ? response.feedback
                : null,
          }
        }),
      },
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
      lastActivityDate: payload.lastActivityDate ? String(payload.lastActivityDate) : null,
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
    const progress = Number(daily.progress ?? 0)
    const target = Math.max(1, Number(mission.target ?? 1))
    const completedAt = daily.completedAt ? String(daily.completedAt) : null
    const claimedAt = daily.claimedAt ? String(daily.claimedAt) : null
    return {
      mission: {
        key: String(mission.key ?? ''),
        periodKey: String(daily.periodKey ?? ''),
        title: String(mission.title ?? ''),
        description: String(mission.description ?? ''),
        xpReward: Number(mission.xpReward ?? 0),
        progress,
        target,
        completedAt,
        claimedAt,
        action: {
          label: completedAt ? 'Xem hành trình' : progress > 0 ? 'Tiếp tục học' : 'Học ngay',
          route: '/world',
        },
      },
    }
  }
  if (path === '/api/gamification/class-celebration') {
    return { celebration: payload }
  }
  // WHY: AgeExperienceProvider expects { ageBand, status, policy } — pass through
  // whatever the gateway returns for age-policy (already in correct shape from core-lms-api).
  if (path.startsWith('/api/learning/age-policy')) {
    return payload
  }
  return payload
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function browserMediaUrl(value: unknown): string {
  const url = String(value ?? '')
  return url.startsWith('sb://')
    ? `${environment.storagePublicUrl}/${url.slice('sb://'.length)}`
    : url
}

export type User = {
  id: string
  role: 'student' | 'parent' | 'teacher' | 'admin'
  email: string | null
  name?: string | null
  nickname: string | null
  avatarId: string | null
  level: number
  xp: number
  onboarded: boolean
  goal: string | null
  parentId: string | null
  classId: string | null
}

export type AccessContext = {
  id: string
  type: 'family' | 'personal_teacher' | 'personal_student' | 'organization' | 'platform'
  label: string
  defaultRoute: string
  actor: 'parent' | 'teacher' | 'org_admin' | 'org_student' | 'admin'
  organizationId?: string
  organizationSlug?: string
  roles: string[]
  permissions: string[]
}

export type AccountAccess = {
  personas: string[]
  platformRoles: string[]
  contexts: AccessContext[]
  active?: {
    mode: string
    contextId?: string | null
    organizationId?: string | null
  }
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
        lobby?: unknown
        catalog?: unknown
        runnerLevels?: unknown
        patrolWaves?: unknown
        selectionMode?: 'required' | 'student_choice'
        allowedTypes?: string[]
        difficulty?: 'gentle' | 'steady' | 'challenge'
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
