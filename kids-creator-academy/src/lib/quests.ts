import { QUESTS } from '@/data/mock'
import type { Quest, QuestStatus } from '@/types'

/** Pure helper — safe for useMemo. Never call inside a Zustand selector. */
export function computeQuestStatuses(
  completedQuestIds: string[],
  currentQuestId: string | null,
): Quest[] {
  const completed = new Set(completedQuestIds)
  return QUESTS.map((q, index) => {
    if (completed.has(q.id)) return { ...q, status: 'completed' as QuestStatus }
    const prevDone = index === 0 || completed.has(QUESTS[index - 1].id)
    if (prevDone) {
      if (currentQuestId === q.id) return { ...q, status: 'in_progress' as QuestStatus }
      return { ...q, status: 'available' as QuestStatus }
    }
    return { ...q, status: 'locked' as QuestStatus }
  })
}
