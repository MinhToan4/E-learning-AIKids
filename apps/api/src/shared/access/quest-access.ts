/**
 * Resolve whether a student may enter a quest (unlock chain).
 * Shared by start / advance / practice / check so progression cannot be skipped.
 */
import { buildQuestStatuses, canEnterQuest, type QuestStatus } from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'

export async function resolveStudentQuestStatus(
  userId: string,
  questId: string,
): Promise<
  | { ok: true; status: QuestStatus; courseId: string; questOrder: number }
  | { ok: false; reason: 'not_found' | 'locked' }
> {
  const quest = await prisma.quest.findUnique({ where: { id: questId } })
  if (!quest) return { ok: false, reason: 'not_found' }

  const courseQuests = await prisma.quest.findMany({
    where: { courseId: quest.courseId },
    orderBy: { order: 'asc' },
  })
  const rows = await prisma.questProgress.findMany({
    where: {
      userId,
      questId: { in: courseQuests.map((q) => q.id) },
    },
  })
  const progressMap = new Map(
    rows.map((r) => [
      r.questId,
      {
        questId: r.questId,
        status: r.status as QuestStatus,
        phase: r.phase as 'learn' | 'practice' | 'check',
        stars: r.stars,
        xpEarned: r.xpEarned,
      },
    ]),
  )
  const statuses = buildQuestStatuses(
    courseQuests.map((q) => ({ id: q.id, order: q.order })),
    progressMap,
  )
  const status = statuses.get(questId) ?? 'locked'
  if (!canEnterQuest(status)) {
    return { ok: false, reason: 'locked' }
  }
  return {
    ok: true,
    status,
    courseId: quest.courseId,
    questOrder: quest.order,
  }
}
