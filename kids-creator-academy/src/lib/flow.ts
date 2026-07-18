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
    // After image + quiz → comic (NOT back to prompt)
    nextPath: '/studio/comic',
    completeQuestIds: ['detective', 'world-build', 'plot'],
    nextQuestId: 'comic',
  },
  'ch-after-detective': {
    nextPath: '/studio/comic',
    completeQuestIds: [],
    nextQuestId: 'comic',
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

/** Main create path for demo (skips empty generic steps when already making product) */
export const MAIN_CREATE_PATH = [
  '/quest/character',
  '/studio/prompt',
  '/studio/compare',
  '/challenge/ch-after-prompt',
  '/studio/comic',
  '/studio/video',
  '/portfolio/star-cat',
] as const
