import { environment } from '@/shared/config/environment'
import {
  normalizeGatewayRequest,
  normalizeGatewayResponse,
  type GatewayRequest,
} from './gateway-normalizers'

export { normalizeGatewayRequest, normalizeGatewayResponse }
export type { GatewayRequest }

const API_BASE = environment.apiBaseUrl
const TOKEN_KEY = 'storymee.access_token'
const SHARED_TOKEN_COOKIE = 'storymee_shared_token'
export const AUTH_UNAUTHORIZED_EVENT = 'storymee:auth-unauthorized'

function sharedCookieDomain(): string {
  if (typeof window === 'undefined') return ''
  return window.location.hostname.toLowerCase().endsWith('.aikid.vn')
    ? '; Domain=.aikid.vn'
    : ''
}

function readSharedTokenCookie(): string | null {
  if (typeof document === 'undefined') return null
  const prefix = `${SHARED_TOKEN_COOKIE}=`
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix))
  if (!entry) return null
  try {
    return decodeURIComponent(entry.slice(prefix.length)) || null
  } catch {
    return null
  }
}

function writeSharedTokenCookie(token: string): void {
  if (typeof document === 'undefined') return
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? '; Secure'
    : ''
  document.cookie = `${SHARED_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=2592000; SameSite=Lax${sharedCookieDomain()}${secure}`
}

function clearSharedTokenCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SHARED_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${sharedCookieDomain()}`
  // Also clear any old host-only cookie left by a previous deployment.
  document.cookie = `${SHARED_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function gatewayUrl(path: string): string {
  return `${API_BASE}${path}`
}

export function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return readSharedTokenCookie()
  const sharedToken = readSharedTokenCookie()
  if (sharedToken) {
    localStorage.setItem(TOKEN_KEY, sharedToken)
    return sharedToken
  }
  const localToken = localStorage.getItem(TOKEN_KEY)
  if (localToken) writeSharedTokenCookie(localToken)
  return localToken
}

export function setAccessToken(token: string): void {
  clearResponseCache()
  if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token)
  writeSharedTokenCookie(token)
}

export function clearAccessToken(): void {
  clearResponseCache()
  if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY)
  clearSharedTokenCookie()
}

export async function fetchRemoteBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Không tải được tệp (HTTP ${response.status}).`)
  return response.blob()
}

/** Download an authenticated binary through the same StoryMee Hub boundary. */
export async function downloadAuthorizedBlob(
  path: string,
  signal?: AbortSignal,
): Promise<Blob> {
  const request = {
    path: path.replace(/\/(?=\?|$)/, ''),
    options: {
      headers: { Accept: 'application/octet-stream' },
      signal,
    } satisfies RequestInit,
  }
  const headers = new Headers(request.options.headers)
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}${request.path}`, {
      ...request.options,
      headers,
      credentials: 'omit',
    })
  } catch (cause) {
    if (signal?.aborted) throw cause
    throw new ApiError(0, 'Không tải được tệp. Vui lòng kiểm tra kết nối mạng.')
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearAccessToken()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
      }
    }
    throw new ApiError(
      response.status,
      `Không tải được tệp (HTTP ${response.status}).`,
    )
  }
  return response.blob()
}

/**
 * The only browser-to-storage write boundary. The upload URL must be issued by
 * StoryMee Hub and remain on the configured StoryMee storage origin. Auth
 * tokens and cookies are intentionally never forwarded.
 */
export async function uploadToStoryMeeStorage(
  uploadUrl: string,
  body: Blob,
  uploadHeaders: Record<string, string> = {},
): Promise<void> {
  let target: URL
  try {
    target = new URL(uploadUrl)
  } catch {
    throw new Error('StoryMee trả về địa chỉ upload không hợp lệ.')
  }

  if (target.origin !== environment.storagePublicUrl) {
    throw new Error('Địa chỉ upload không thuộc StoryMee Storage.')
  }

  const headers = new Headers(uploadHeaders)
  headers.delete('authorization')
  headers.delete('cookie')
  if (!headers.has('Content-Type') && body.type) {
    headers.set('Content-Type', body.type)
  }

  const response = await fetch(target, {
    method: 'PUT',
    body,
    headers,
    credentials: 'omit',
    redirect: 'error',
  })
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Không tải được tệp lên StoryMee Storage (HTTP ${response.status}).`,
    )
  }
}

export class ApiError extends Error {
  status: number
  body: unknown
  code: string | null
  field: string | null
  requestId: string | null
  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
    const details = body && typeof body === 'object' ? body as Record<string, unknown> : {}
    this.code = typeof details.code === 'string' ? details.code : null
    this.field = typeof details.field === 'string' ? details.field : null
    this.requestId = typeof details.requestId === 'string'
      ? details.requestId
      : typeof details.request_id === 'string' ? details.request_id : null
  }
}

const inFlightGetRequests = new Map<string, Promise<unknown>>()
const getResponseCache = new Map<string, { expiresAt: number; value: unknown }>()

function responseCacheTtl(path: string): number {
  if (path.startsWith('/api/courses/')) return 15_000
  if (path.startsWith('/api/learning/pathway')) return 30_000
  if (path.startsWith('/api/learning/age-policy')) return 300_000 // 5 phút policy tuổi tĩnh
  if (path.startsWith('/api/progress/')) return 15_000
  if (path.startsWith('/api/parent/plans') || path.startsWith('/api/parent/subscription')) return 60_000
  if (path.startsWith('/api/notifications')) return 15_000 // debounce 15s tránh spam request khi đổi tab
  if (path.startsWith('/api/admin/legend-studio')) return 30_000
  if (path.startsWith('/api/gamification/catalog')) return 60_000
  if (path === '/api/gamification/achievements') return 15_000
  if (path === '/api/courses' || path === '/api/enrollments') return 15_000
  if (path.startsWith('/api/gamification/profile') || path.startsWith('/api/gamification/storybook') || path.startsWith('/api/gamification/streak')) return 10_000
  if (path.startsWith('/api/parent/children') || path.startsWith('/api/teacher/class')) return 10_000
  if (path.startsWith('/api/schedule') || path.startsWith('/api/reports') || path.startsWith('/api/competency-map') || path.startsWith('/api/credentials')) return 10_000
  if (path === '/api/admin/system' || path === '/api/admin/analytics') return 10_000
  return 0
}

function clearResponseCache() {
  getResponseCache.clear()
}

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
  if (!canDedupe) {
    // A mutation can change several projections (catalog, achievements and
    // profile) at once. Clear the small in-memory GET cache rather than risk
    // showing data from before the mutation.
    if (method !== 'GET') clearResponseCache()
    return executeApi<T>(legacyPath, options)
  }

  const key = `${getAccessToken() ?? 'anonymous'}:${legacyPath}`
  const cached = getResponseCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value as T)
  if (cached) getResponseCache.delete(key)
  const pending = inFlightGetRequests.get(key)
  if (pending) return pending as Promise<T>

  const request = executeApi<T>(legacyPath, options)
  inFlightGetRequests.set(key, request)
  void request.finally(() => {
    if (inFlightGetRequests.get(key) === request) {
      inFlightGetRequests.delete(key)
    }
  }).catch(() => undefined)
  const ttl = responseCacheTtl(legacyPath)
  if (ttl > 0) {
    void request.then((value) => {
      getResponseCache.set(key, { expiresAt: Date.now() + ttl, value })
    }).catch(() => undefined)
  }
  return request
}

api.get = function <T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  return api<T>(path, { ...options, method: 'GET' })
}

api.post = function <T = unknown>(path: string, body?: unknown, options: RequestInit = {}): Promise<T> {
  const isJson = body !== undefined && !(body instanceof FormData) && typeof body !== 'string'
  return api<T>(path, {
    ...options,
    method: 'POST',
    body: isJson ? JSON.stringify(body) : (body as BodyInit | undefined),
  })
}

api.put = function <T = unknown>(path: string, body?: unknown, options: RequestInit = {}): Promise<T> {
  const isJson = body !== undefined && !(body instanceof FormData) && typeof body !== 'string'
  return api<T>(path, {
    ...options,
    method: 'PUT',
    body: isJson ? JSON.stringify(body) : (body as BodyInit | undefined),
  })
}

api.delete = function <T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  return api<T>(path, { ...options, method: 'DELETE' })
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
    // A JWT can expire while a route is already mounted. Fail closed and let
    // the auth store return the shared device to login instead of leaving a
    // child-facing screen populated with a gateway implementation error.
    if (res.status === 401 && token) {
      clearAccessToken()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
      }
    }
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
  /** Consent capabilities — populated from JWT for child sessions only.
   * For non-child sessions these are always undefined (treat as unrestricted). */
  allowAiCreate?: boolean
  allowPhoto?: boolean
  /** When true (DB allowExport=true = sharing ENABLED), student can see share button.
   * When false (DB allowExport=false = sharing HIDDEN), share button is hidden. */
  allowExport?: boolean
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
  /** Cover image for the learn phase hero banner */
  coverImage?: string | null
  coverImageAlt?: string | null
  /** Rich media attachments on the quest */
  media?: Array<{ id?: string; type: string; url: string; alt?: string; caption?: string }> | null
  /** Lecture video URL from API/SQL — not hardcoded in FE */
  videoUrl?: string | null
  goals: string[]
  learnCards: Array<{
    id: string
    title: string
    body: string
    tip: string
    kind: string
    layout?: 'text' | 'split' | 'visual-grid' | 'storyboard' | string
    visualItems?: Array<{
      label: string
      text: string
      tone?: 'brand' | 'sky' | 'mint' | 'sun' | 'coral' | string
      shot?: string
      duration?: string
      sound?: string
      direction?: string
    }>
    /** Optional card illustration */
    imageUrl?: string | null
    imageAlt?: string | null
    videoUrl?: string | null
    optionImages?: string[]
    optionLabels?: string[]
    optionDescs?: string[]
    dialogueLines?: Array<{
      id: string
      speaker: string
      role: 'left' | 'right' | 'center'
      text: string
    }>
    additionalImages?: Array<{
      id: string
      url: string
      alt: string
      caption?: string
    }>
    compareData?: {
      leftTitle?: string
      leftText?: string
      leftImage?: string
      rightTitle?: string
      rightText?: string
      rightImage?: string
    }
    compareImages?: { left: string; right: string }
    enabledModules?: string[]
    contentBlocks?: Array<import('@/features/teacher/lib/authoring').StageBlockItem>
    mee?: {
      readText?: string
      audioUrl?: string
      voiceProvider?: 'vertex'
      gesture?: 'presentation' | 'point-left' | 'point-right' | 'think' | 'idea' | 'celebrate'
      autoRead?: boolean
    }
  }>
  check: Array<{
    id: string
    question: string
    options: string[]
    /** Nội dung sư phạm do LMS cung cấp; frontend không tự suy luận lời giải. */
    mee?: {
      readText?: string
      strategy?: string
      hints?: string[]
      gesture?: 'presentation' | 'point-left' | 'point-right' | 'think' | 'idea' | 'celebrate'
      autoRead?: boolean
    }
  }>
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
      steps?: string[]
      successCriteria?: string[]
      reflectionPrompt?: string
      practiceConfig?: {
        activityType?: string
        prompt?: string
        cards?: Array<{ id: string; title: string; description: string }>
      }
    }>
  }
  sixStageJourney?: LessonSixStageJourney
}

export interface SixStageGoal {
  id: string
  title: string
  goalText: string
  imageUrl: string
  speech: string
  keyPoints: string[]
}

export interface SixStageConfirmOption {
  id: string
  text: string
  imageUrl?: string
  keyItems?: { label: string; color: string }[]
}

export interface SixStageConfirmGoal {
  id: string
  question: string
  options: SixStageConfirmOption[]
  correctIndex: number
  explanation: string
  speech: string
}

export interface SixStageVideoTimestamp {
  label: string
  startSec: number
  endSec: number
  speech?: string
}

export interface SixStageVideo {
  id: string
  title: string
  videoUrl: string
  durationSec: number
  posterUrl?: string
  timestamps?: SixStageVideoTimestamp[]
}

export interface SixStageQuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  visualUrl?: string
}

export interface SixStageQuiz {
  id: string
  title: string
  questions: SixStageQuizQuestion[]
  passScore: number
}

export interface SixStageWorkflowStep {
  step: number
  title: string
  akiSpeech: string
  quickPrompt: string
  instruction: string
}

export interface SixStagePracticePartDef {
  partNumber: number
  title: string
  icon?: string
  iconImage?: string
  emoji?: string
}

export interface SixStageFourKeysOptions {
  what?: string[]
  how?: string[]
  action?: string[]
  where?: string[]
}

export interface SixStagePractice {
  id: string
  title: string
  subjectName: string
  badge: string
  illustrationType: string
  lockedFeatures: string[]
  akiMotto: string
  maxAttempts: number
  workflowSteps: SixStageWorkflowStep[]
  sampleUrl?: string
  practiceParts?: SixStagePracticePartDef[]
  fourKeysOptions?: SixStageFourKeysOptions
}

export interface SixStageRewardBadge {
  name: string
  iconUrl?: string
  stars: number
  xp: number
}

export interface SixStageCompletion {
  id: string
  title: string
  congratsMessage: string
  rewardBadge: SixStageRewardBadge
  nextLessonSlug?: string
}

export interface LessonSixStageJourney {
  stage1_goal: SixStageGoal
  stage2_confirmGoal: SixStageConfirmGoal
  stage3_video: SixStageVideo
  stage4_quiz: SixStageQuiz
  stage5_practice: SixStagePractice
  stage6_completion: SixStageCompletion
  /** Optional author-defined blocks appended to each native six-stage screen. */
  stageContentBlocks?: Record<string, unknown[]>
  /** CMS block schema version. Version 2 stores the goal stage as one unified canvas. */
  stageBlockEditorVersion?: number
}


export type AchievementRow = {
  type: string
  title: string
  description: string
  icon: string
  category?: string
  requiredValue: number
  currentValue?: number
  points?: number
  rewardLabel?: string
  rewardAssetId?: string
  imageUrl?: string
  seriesKey?: string
  milestones?: Array<{
    threshold: number
    label?: string
    description?: string
    imageUrl?: string
    metric?: string
    operator?: string
    points?: number
    rewardLabel?: string
    rewardAssetId?: string
    unlocked?: boolean
    unlockedAt?: string | null
  }>
  hidden?: boolean
  unlocked: boolean
  unlockedAt: string | null
}

export type NotificationRow = {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  data: Record<string, unknown> | null
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
  learnCards?: Array<{
    id: string
    title: string
    body: string
    tip: string
    kind: string
    layout: 'text' | 'split' | 'visual-grid' | 'storyboard'
    visualItems: Array<{
      label: string
      text: string
      tone?: 'brand' | 'sky' | 'mint' | 'sun' | 'coral'
      shot?: string
      duration?: string
      sound?: string
      direction?: string
    }>
    imageUrl?: string
    imageAlt?: string
    videoUrl?: string
    mee?: {
      readText?: string
      audioUrl?: string
      voiceProvider?: 'vertex'
      gesture?: 'presentation' | 'point-left' | 'point-right' | 'think' | 'idea' | 'celebrate'
      autoRead?: boolean
    }
  }>
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

// ── Multi-Provider AI Engine & Policy Types & APIs ──────────
export interface AiProviderCatalogItem {
  id: string
  displayName: string
  kind: string
  capabilities: string[]
  aliases?: string[]
  status: string
  defaultModels?: Record<string, string>
  allowedOnPlan?: boolean
}

export interface AiPlanPolicy {
  allowedProviders?: string[]
  defaultImageRoute?: string[]
  note?: string
}

export interface AiProviderPolicyResponse {
  planProviderPolicy: Record<string, AiPlanPolicy>
  disabledImageProviders: string[]
  sdkApiKey?: string
  geminiApiKey?: string
  vertexApiKey?: string
  vertexProjectId?: string
  vertexLocation?: string
  universalNegativePrompt?: string
  videoProvider?: string
  llmProvider?: string
  imageProvider?: string
  imageConfig?: {
    provider?: string
    aspectRatio?: string
    resolution?: string
    stylePreset?: string
    autoCompressWebp?: boolean
    promptPrefix?: string
    promptSuffix?: string
    autoWrapPrompt?: boolean
  }
}

export interface AiProvidersResponse {
  catalog: AiProviderCatalogItem[]
  planProviderPolicy?: Record<string, AiPlanPolicy>
  plan?: {
    plan?: string
    remaining?: number
    allowedProviders?: string[]
    defaultImageRoute?: string[]
  } | null
  imageRoute?: {
    preferred?: string | null
    routeLabel?: string
    chain?: Array<{
      providerId: string
      credentialSource: string
      hasCredentials: boolean
      projectId?: string | null
    }>
  }
}

export async function fetchAiProviders(query?: { preferred?: string; userId?: string }): Promise<AiProvidersResponse> {
  const searchParams = new URLSearchParams()
  if (query?.preferred) searchParams.set('preferred', query.preferred)
  if (query?.userId) searchParams.set('userId', query.userId)
  const qs = searchParams.toString() ? `?${searchParams.toString()}` : ''
  return api<AiProvidersResponse>(`/api/v1/jobs/providers${qs}`)
}

export async function fetchAiProviderPolicy(): Promise<AiProviderPolicyResponse> {
  return api<AiProviderPolicyResponse>('/api/v1/jobs/providers/policy')
}

export async function updateAiProviderPolicy(data: {
  planProviderPolicy?: Record<string, AiPlanPolicy>
  disabledImageProviders?: string[]
  sdkApiKey?: string
  geminiApiKey?: string
  vertexApiKey?: string
  vertexProjectId?: string
  vertexLocation?: string
  universalNegativePrompt?: string
  videoProvider?: string
  llmProvider?: string
  [key: string]: unknown
}): Promise<AiProviderPolicyResponse> {
  return api<AiProviderPolicyResponse>('/api/v1/jobs/providers/policy', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function saveProviderApiKey(provider: string, apiKey: string): Promise<{ success: boolean; maskedHint?: string }> {
  const cleanKey = apiKey.trim()
  const payload: Record<string, unknown> = {
    apiKey: cleanKey,
    provider,
  }
  if (provider === 'vidtory-sdk') payload.sdkApiKey = cleanKey
  if (provider === 'gemini-native') payload.geminiApiKey = cleanKey
  if (provider === 'vertex') payload.vertexApiKey = cleanKey
  if (provider === 'openai') payload.openaiApiKey = cleanKey

  await api<unknown>('/api/v1/jobs/providers/policy', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return {
    success: true,
    maskedHint: cleanKey.length > 8 ? `${cleanKey.slice(0, 5)}••••${cleanKey.slice(-4)}` : '••••',
  }
}
