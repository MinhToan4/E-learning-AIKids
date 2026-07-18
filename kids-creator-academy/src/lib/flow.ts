/**
 * Canonical student learning path for course-comic (and shared quest ids).
 * Prevents loops like: quiz → detective → /studio/prompt again.
 */
import { getCourse } from '@/data/courses'
import { questRoute } from '@/data/mock'
import { CHALLENGES } from '@/data/challenges'

export type ChallengeDef = (typeof CHALLENGES)[number] & {
  /** Explicit next screen after quiz — do not derive only from afterQuestId+1 */
  nextPath?: string
  /** Quests to mark complete when finishing this challenge */
  completeQuestIds?: string[]
  /** Quest id to set as current after challenge */
  nextQuestId?: string
}

/** Enriched challenge map (keeps CHALLENGES data, adds routing) */
export const CHALLENGE_FLOW: Record<
  string,
  { nextPath: string; completeQuestIds: string[]; nextQuestId: string }
> = {
  'ch-after-character': {
    nextPath: '/quest/world-build',
    completeQuestIds: [],
    nextQuestId: 'world-build',
  },
  'ch-after-prompt': {
    // After image + quiz → story outline → comic (NOT back to prompt)
    nextPath: '/studio/story',
    completeQuestIds: ['detective', 'world-build'],
    nextQuestId: 'plot',
  },
  'ch-after-detective': {
    nextPath: '/studio/story',
    completeQuestIds: [],
    nextQuestId: 'plot',
  },
}

export function resolveChallengeExit(challengeId: string): {
  nextPath: string
  completeQuestIds: string[]
  nextQuestId: string
} {
  const flow = CHALLENGE_FLOW[challengeId]
  if (flow) return flow

  const ch = CHALLENGES.find((c) => c.id === challengeId)
  if (!ch) {
    return { nextPath: '/world', completeQuestIds: [], nextQuestId: '' }
  }
  const course = getCourse('course-comic')
  const idx = course.quests.findIndex((q) => q.id === ch.afterQuestId)
  const next = course.quests[idx + 1]
  return {
    nextPath: next ? questRoute(next.id) : '/world',
    completeQuestIds: [],
    nextQuestId: next?.id ?? '',
  }
}

/**
 * Main create path: each station = lesson shell (theory → practice → quiz).
 * Practice routes sit inside each lesson; listed here for smoke navigation.
 */
export const MAIN_CREATE_PATH = [
  '/lesson/character',
  '/lesson/prompt-lab',
  '/studio/prompt',
  '/lesson/detective',
  '/studio/compare',
  '/lesson/plot',
  '/studio/story',
  '/lesson/comic',
  '/studio/comic',
  '/lesson/cinema',
  '/studio/video',
  '/portfolio/star-cat',
] as const

export type StoryOutline = {
  opening: string
  problem: string
  ending: string
  title: string
}

export const STORY_OPENINGS = [
  { id: 'o1', label: 'Một buổi sáng trên hành tinh kẹo…', emoji: '🌅' },
  { id: 'o2', label: 'Trong thư viện mây, hai bạn gặp nhau…', emoji: '📚' },
  { id: 'o3', label: 'Tàu vũ trụ vừa đáp xuống…', emoji: '🚀' },
]

export const STORY_PROBLEMS = [
  { id: 'p1', label: 'Máy tạo cầu vồng bị hỏng!', emoji: '🌈' },
  { id: 'p2', label: 'Bản đồ ánh sáng bị mất!', emoji: '🗺️' },
  { id: 'p3', label: 'Cầu vồng bị kẹt trong đám mây!', emoji: '☁️' },
]

export const STORY_ENDINGS = [
  { id: 'e1', label: 'Hai bạn sửa máy và cầu vồng trở lại.', emoji: '✨' },
  { id: 'e2', label: 'Mọi người cùng vui mừng dưới cầu vồng.', emoji: '🎉' },
  { id: 'e3', label: 'Bạn robot được khen là anh hùng tí hon.', emoji: '🏅' },
]

/** Map 3-beat story → 4 comic panels (kids storyboard) */
export function storyToPanelHints(outline: {
  opening: string
  problem: string
  ending: string
  title: string
}): { panel: number; label: string; beat: string; tip: string }[] {
  const o = outline.opening || 'Mở đầu…'
  const p = outline.problem || 'Sự cố…'
  const e = outline.ending || 'Kết thúc…'
  return [
    {
      panel: 1,
      label: 'Mở màn',
      beat: o,
      tip: 'Giới thiệu nhân vật + nơi chốn',
    },
    {
      panel: 2,
      label: 'Sự cố',
      beat: p,
      tip: 'Cho thấy vấn đề bất ngờ',
    },
    {
      panel: 3,
      label: 'Hành động',
      beat: `Thử giải quyết: ${p}`,
      tip: 'Nhân vật làm gì để cứu tình huống?',
    },
    {
      panel: 4,
      label: 'Kết',
      beat: e,
      tip: 'Kết thúc vui + bài học nhỏ',
    },
  ]
}
