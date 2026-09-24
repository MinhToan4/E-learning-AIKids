import { environment } from '@/shared/config/environment'
import { createUuid } from '../uuid'
import { ApiError, clearAccessToken, setAccessToken, type User, type CourseSummary } from '../api'

export type GatewayRequest = { path: string; options: RequestInit }

export function jsonBody(options: RequestInit): Record<string, unknown> {
  if (typeof options.body !== 'string') return {}
  try {
    return JSON.parse(options.body) as Record<string, unknown>
  } catch {
    return {}
  }
}

export function withJson(options: RequestInit, body: Record<string, unknown>): RequestInit {
  return { ...options, body: JSON.stringify(body) }
}

export function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function uniqueCourseLessons(lessons: Array<Record<string, unknown>>) {
  const seen = new Set<string>()
  return lessons.filter((lesson, index) => {
    const order = Number(lesson.order ?? lesson.position)
    const slug = String(lesson.slug ?? '').trim()
    const id = String(lesson.id ?? '').trim()
    const title = String(lesson.title ?? '').trim().toLocaleLowerCase('vi')
    // A few LMS projections return one row per lesson phase. In that shape the
    // row ids differ, while the station order/slug stays the same.
    const key = slug
      ? `slug:${slug}`
      : Number.isFinite(order) && order > 0
        ? `order:${order}`
        : id
          ? `id:${id}`
          : `title:${title || index}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function galleryMetadata(value: unknown): Record<string, unknown> {
  if (typeof value !== 'string') return recordValue(value)
  try {
    return recordValue(JSON.parse(value))
  } catch {
    return {}
  }
}

export function firstText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return ''
}

export function normalizeCreativeKind(value: unknown, generated: boolean): string {
  const raw = String(value ?? '').trim().toLowerCase().replace(/_/g, '-')
  if (/comic|panel|story-page/.test(raw)) return 'comic'
  if (/story|text/.test(raw)) return 'story'
  if (/character|avatar/.test(raw)) return 'character'
  if (/art|drawing|sketch/.test(raw)) return 'art'
  if (/video/.test(raw)) return 'video'
  if (/image|photo|picture/.test(raw)) return generated ? 'generated-image' : 'image'
  return generated ? 'generated-image' : 'image'
}

export function normalizeShareStatus(value: unknown): string {
  const status = String(value ?? '').trim().toLowerCase().replace(/_/g, '-')
  if (['approved', 'public', 'shared', 'published'].includes(status)) return 'approved'
  if (['pending', 'requested', 'pending-approval', 'awaiting-approval'].includes(status)) {
    return 'pending'
  }
  return 'private'
}

export function browserMediaUrl(value: unknown): string {
  const url = String(value ?? '')
  return url.startsWith('sb://')
    ? `${environment.storagePublicUrl}/${url.slice('sb://'.length)}`
    : url
}

export function normalizeGalleryItem(row: Record<string, unknown>) {
  const metadata = galleryMetadata(row.metadata)
  const tags = [
    ...(Array.isArray(row.tags) ? row.tags : []),
    ...(Array.isArray(metadata.tags) ? metadata.tags : []),
  ].map((tag) => String(tag).toLowerCase())
  const jobId = firstText(
    row.jobId,
    row.generationJobId,
    metadata.jobId,
    metadata.generationJobId,
  )
  const rawKind = firstText(
    metadata.creativeKind,
    row.creativeKind,
    metadata.contentType,
    row.contentType,
    metadata.assetType,
    row.assetType,
    row.type,
  )
  const purpose = firstText(metadata.purpose, row.purpose).toLowerCase()
  const generated = Boolean(jobId) || tags.some((tag) => tag.includes('generated'))
  const kind = normalizeCreativeKind(rawKind || tags.join(' '), generated)
  const comicPage = kind === 'comic' || tags.some((tag) =>
    /comic[-_: ]?(page|panel)|story[-_: ]?page/.test(tag),
  )
  const isProject =
    purpose === 'creative_workshop' ||
    Boolean(firstText(metadata.creativeKind, row.creativeKind)) ||
    comicPage ||
    kind === 'story'
  const outputUrls = Array.isArray(row.outputUrls)
    ? row.outputUrls
    : Array.isArray(metadata.outputUrls)
      ? metadata.outputUrls
      : []
  const url = browserMediaUrl(firstText(
    row.thumbnail,
    row.thumbnailUrl,
    row.imageUrl,
    row.url,
    row.outputUrl,
    outputUrls[0],
    metadata.thumbnail,
    metadata.imageUrl,
    metadata.url,
  ))
  return {
    id: firstText(row.id, row.libraryItemId, row.mediaId),
    title: firstText(
      metadata.title,
      row.title,
      metadata.originalName,
      row.originalName,
      metadata.name,
      row.name,
    ) || 'Sản phẩm sáng tạo',
    kind,
    url,
    content: firstText(metadata.content, row.content, metadata.text, row.text),
    shareStatus: normalizeShareStatus(
      row.shareStatus ?? row.status ?? metadata.shareStatus ?? metadata.status,
    ),
    questId: firstText(metadata.questId, row.questId) || null,
    jobId: jobId || null,
    createdAt: firstText(row.createdAt, metadata.createdAt),
    isProject,
  }
}

export function mapUser(raw: Record<string, unknown>): User {
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

export function mapCourse(raw: Record<string, unknown>): CourseSummary {
  const metadata = (raw.metadata && typeof raw.metadata === 'object'
    ? raw.metadata
    : {}) as Record<string, unknown>
  const versions = Array.isArray(raw.versions) ? raw.versions : []
  const modules = versions[0] && typeof versions[0] === 'object' &&
    Array.isArray((versions[0] as Record<string, unknown>).modules)
    ? (versions[0] as { modules: Array<Record<string, unknown>> }).modules
    : []
  const nestedLessons = modules.flatMap((module) =>
    Array.isArray(module.lessons)
      ? module.lessons as Array<Record<string, unknown>>
      : [],
  )
  const directLessons = (['lectures', 'lessons', 'quests', 'stations'] as const)
    .map((key) => raw[key])
    .find(Array.isArray) as Array<Record<string, unknown>> | undefined
  const lessons = uniqueCourseLessons(
    nestedLessons.length > 0 ? nestedLessons : (directLessons ?? []),
  )
  const count = recordValue(raw._count)
  const declaredQuestCount = Math.max(0, ...[
    raw.questCount, raw.stationCount, raw.lessonCount, raw.lectureCount,
    raw.questsCount, raw.stationsCount, raw.lessonsCount, raw.lecturesCount,
    raw.totalStations, raw.totalLessons,
    metadata.questCount, metadata.stationCount, metadata.lessonCount,
    count.lessons, count.lectures, count.quests, count.stations,
  ].map(Number).filter(Number.isFinite))
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
    questCount: Math.max(lessons.length, declaredQuestCount),
    enrolled: false,
    quests: lessons.map((lesson, index) => ({
      id: String(lesson.id ?? ''),
      order: Number(lesson.order ?? lesson.position ?? index + 1),
      title: String(lesson.title ?? ''),
      accent: String(metadata.accent ?? '#7c3aed'),
      practiceKind: String(lesson.lessonType ?? 'lesson'),
      stage: 'learn',
      slug: (lesson as any).slug ? String((lesson as any).slug) : undefined,
      access: (lesson as any).access ?? ((lesson as any).metadata as any)?.access,
    })),
  }
}

export function mapQuest(rawQuest: Record<string, unknown>) {
  return {
    ...rawQuest,
    slug: (rawQuest as any).slug ? String((rawQuest as any).slug) : undefined,
    access: (rawQuest as any).access ?? ((rawQuest as any).metadata as any)?.access,
  }
}

export function mapAssessmentAttempt(raw: Record<string, unknown>) {
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
