/**
 * Course progression helpers — next station, active index, replay.
 * Keeps adventure map + lesson shell in sync (no random jumps to /world).
 */
import { getCourse } from '@/data/courses'
import { questRoute } from '@/data/mock'
import { computeQuestStatuses } from '@/lib/quests'

export function getCourseQuests(courseId: string) {
  return getCourse(courseId).quests
}

/** First incomplete station (available / in_progress), or null if course 100% */
export function getActiveQuest(
  courseId: string,
  completedQuestIds: string[],
  currentQuestId: string | null,
) {
  const statuses = computeQuestStatuses(
    completedQuestIds,
    currentQuestId,
    getCourseQuests(courseId),
  )
  return (
    statuses.find((q) => q.status === 'in_progress' || q.status === 'available') ??
    null
  )
}

/** Index of active incomplete station; if all done → last index */
export function getActiveAdventureIndex(
  courseId: string,
  completedQuestIds: string[],
  currentQuestId: string | null,
): number {
  const quests = getCourseQuests(courseId)
  const statuses = computeQuestStatuses(
    completedQuestIds,
    currentQuestId,
    quests,
  )
  const activeIdx = statuses.findIndex(
    (q) => q.status === 'in_progress' || q.status === 'available',
  )
  if (activeIdx >= 0) return activeIdx
  return Math.max(0, quests.length - 1)
}

export function isCourseComplete(
  courseId: string,
  completedQuestIds: string[],
): boolean {
  const quests = getCourseQuests(courseId)
  if (!quests.length) return false
  return quests.every((q) => completedQuestIds.includes(q.id))
}

/** Next quest after `questId` in the selected course, or null if last */
export function getNextQuestAfter(courseId: string, questId: string) {
  const quests = getCourseQuests(courseId)
  const idx = quests.findIndex((q) => q.id === questId)
  if (idx < 0 || idx >= quests.length - 1) return null
  return quests[idx + 1]
}

/** Where “Chặng tiếp theo” should go — NEVER dump mid-course to catalog */
export function nextLessonPath(courseId: string, questId: string): string {
  const next = getNextQuestAfter(courseId, questId)
  if (!next) return '/world?view=adventure&courseDone=1'
  return questRoute(next.id)
}

export function lessonPath(
  questId: string,
  step?: 'theory' | 'practice' | 'quiz',
) {
  if (step) return `/lesson/${questId}?step=${step}`
  return `/lesson/${questId}`
}
