/**
 * Curriculum station model — maps courses/ lesson blocks:
 * Video → Game → Practice → Check (+ stage ideate|produce).
 */

export type StationKind = 'video' | 'game' | 'practice' | 'check'

export type GameType =
  | 'match'
  | 'drag'
  | 'spin'
  | 'sort'
  | 'order'
  | 'detective'
  | 'pick'
  | 'combine'
  | 'compare'
  | 'place'

export type PracticeKind =
  | 'intro'
  | 'character'
  | 'style'
  | 'chips'
  | 'story'
  | 'detective'
  | 'comic'
  | 'video'
  | 'journal'
  | 'palette'
  | 'match'
  | 'drag'
  | 'spin'
  | 'sketch'
  | 'ai_pick'
  | 'reflect'

export type LessonStage = 'ideate' | 'produce'

export type AgeTrack = 'L1' | 'L2'

export const AGE_TRACKS = {
  L1: {
    id: 'L1' as const,
    label: '8–9 tuổi',
    ageMin: 8,
    ageMax: 9,
    ageLabel: '8–9 tuổi',
    description: 'Level 1 · Khám phá có hướng dẫn — học qua thử nghiệm và sổ tay',
  },
  L2: {
    id: 'L2' as const,
    label: '10–11 tuổi',
    ageMin: 10,
    ageMax: 11,
    ageLabel: '10–11 tuổi',
    description: 'Level 2 · Sáng tạo tự chủ — làm dự án và bảo vệ quyết định',
  },
} as const

export const COURSE_KEYS = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'] as const
export type CourseKey = (typeof COURSE_KEYS)[number]

export const COURSE_KEY_TITLES: Record<CourseKey, string> = {
  K1: 'Vẽ Thế Giới Tưởng Tượng',
  K2: 'Thiết Kế Nhân Vật',
  K3: 'Kể Chuyện',
  K4: 'Truyện Tranh',
  K5: 'Đạo Diễn Chuyển Động',
  K6: 'Phim Ngắn Đầu Tay',
}

export const PRACTICE_KINDS: readonly PracticeKind[] = [
  'intro',
  'character',
  'style',
  'chips',
  'story',
  'detective',
  'comic',
  'video',
  'journal',
  'palette',
  'match',
  'drag',
  'spin',
  'sketch',
  'ai_pick',
  'reflect',
] as const

export function isPracticeKind(v: string): v is PracticeKind {
  return (PRACTICE_KINDS as readonly string[]).includes(v)
}

export function isAgeTrack(v: string): v is AgeTrack {
  return v === 'L1' || v === 'L2'
}

export function isCourseKey(v: string): v is CourseKey {
  return (COURSE_KEYS as readonly string[]).includes(v)
}

/** Stable course id: l1-k1-the-gioi */
export function courseIdFor(track: AgeTrack, key: CourseKey, slug: string): string {
  return `${track.toLowerCase()}-${key.toLowerCase()}-${slug}`
}

export interface LessonStation {
  id: string
  kind: StationKind
  /** Minutes, curriculum-aligned */
  durationMin?: number
  title?: string
  /** Exact curriculum copy shown to the child. */
  content?: string
  instruction?: string
  outcome?: string
  product?: string
  /** video */
  videoUrl?: string | null
  /** game */
  gameType?: GameType
  gameConfig?: Record<string, unknown>
  /** practice */
  practiceKind?: PracticeKind
  practiceConfig?: Record<string, unknown>
  /** check — optional override; else quest.checkJson */
  questionIds?: string[]
}

export interface StationsPayload {
  stage: LessonStage
  stations: LessonStation[]
}

const STATION_KINDS: StationKind[] = ['video', 'game', 'practice', 'check']

/**
 * Parse stations JSON from DB. Returns null if empty/invalid so callers fall back
 * to legacy learn → practice → check flow.
 */
export function parseStationsJson(
  raw: string | null | undefined,
): StationsPayload | null {
  if (!raw || !raw.trim()) return null
  try {
    const data = JSON.parse(raw) as unknown
    if (!data || typeof data !== 'object') return null
    const obj = data as Record<string, unknown>
    const stage = obj.stage === 'produce' ? 'produce' : 'ideate'
    const stationsRaw = obj.stations
    if (!Array.isArray(stationsRaw) || stationsRaw.length === 0) return null
    const stations: LessonStation[] = []
    for (const s of stationsRaw) {
      if (!s || typeof s !== 'object') continue
      const row = s as Record<string, unknown>
      const kind = String(row.kind ?? '') as StationKind
      if (!STATION_KINDS.includes(kind)) continue
      const id = String(row.id ?? `${kind}-${stations.length + 1}`)
      stations.push({
        id,
        kind,
        durationMin:
          typeof row.durationMin === 'number' ? row.durationMin : undefined,
        title: typeof row.title === 'string' ? row.title : undefined,
        content: typeof row.content === 'string' ? row.content : undefined,
        instruction:
          typeof row.instruction === 'string' ? row.instruction : undefined,
        outcome: typeof row.outcome === 'string' ? row.outcome : undefined,
        product: typeof row.product === 'string' ? row.product : undefined,
        videoUrl:
          typeof row.videoUrl === 'string' || row.videoUrl === null
            ? (row.videoUrl as string | null)
            : undefined,
        gameType: row.gameType as GameType | undefined,
        gameConfig:
          row.gameConfig && typeof row.gameConfig === 'object'
            ? (row.gameConfig as Record<string, unknown>)
            : undefined,
        practiceKind: isPracticeKind(String(row.practiceKind ?? ''))
          ? (row.practiceKind as PracticeKind)
          : undefined,
        practiceConfig:
          row.practiceConfig && typeof row.practiceConfig === 'object'
            ? (row.practiceConfig as Record<string, unknown>)
            : undefined,
        questionIds: Array.isArray(row.questionIds)
          ? row.questionIds.map(String)
          : undefined,
      })
    }
    if (stations.length === 0) return null
    return { stage, stations }
  } catch {
    return null
  }
}

/** Default 4-station curriculum block when only practiceKind is known. */
export function defaultStationsForPractice(
  practiceKind: PracticeKind | string,
  opts?: { stage?: LessonStage; videoUrl?: string | null },
): StationsPayload {
  const stage = opts?.stage ?? (practiceKind === 'ai_pick' || practiceKind === 'chips' ? 'produce' : 'ideate')
  return {
    stage,
    stations: [
      {
        id: 'st-video',
        kind: 'video',
        durationMin: 3,
        videoUrl: opts?.videoUrl ?? null,
        title: 'Xem video',
      },
      {
        id: 'st-game',
        kind: 'game',
        durationMin: 5,
        gameType: 'pick',
        title: 'Game ghi nhớ',
      },
      {
        id: 'st-practice',
        kind: 'practice',
        durationMin: 8,
        practiceKind: isPracticeKind(practiceKind)
          ? practiceKind
          : 'journal',
        title: 'Thực hành',
      },
      {
        id: 'st-check',
        kind: 'check',
        durationMin: 2,
        title: 'Kiểm tra nhanh',
      },
    ],
  }
}

export function resolveStations(
  stationsJson: string | null | undefined,
  practiceKind: string,
  videoUrl?: string | null,
): StationsPayload {
  return (
    parseStationsJson(stationsJson) ??
    defaultStationsForPractice(practiceKind, { videoUrl })
  )
}
