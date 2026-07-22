const API_BASE = import.meta.env.VITE_API_URL ?? ''

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
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let url = path
  if (API_BASE && API_BASE !== '/api') {
    url = `${API_BASE}${path}`
  }

  let res: Response
  try {
    res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
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
      { cause: raw, path, base: API_BASE || '(same origin)' },
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

  return data as T
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
  quests: Array<{
    id: string
    order: number
    title: string
    accent: string
    practiceKind: string
    stage?: string
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
      gameConfig?: { cards?: string[] }
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
