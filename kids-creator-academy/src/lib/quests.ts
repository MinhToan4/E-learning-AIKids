import { getCourse } from '@/data/courses'
import type { Quest, QuestStatus } from '@/types'

/** Pure helper — safe for useMemo. Never call inside a Zustand selector. */
export function computeQuestStatuses(
  completedQuestIds: string[],
  currentQuestId: string | null,
  quests?: Quest[],
): Quest[] {
  const list = quests ?? getCourse('course-comic').quests
  const completed = new Set(completedQuestIds)
  return list.map((q, index) => {
    if (completed.has(q.id)) return { ...q, status: 'completed' as QuestStatus }
    const prevDone = index === 0 || completed.has(list[index - 1].id)
    if (prevDone) {
      if (currentQuestId === q.id) return { ...q, status: 'in_progress' as QuestStatus }
      return { ...q, status: 'available' as QuestStatus }
    }
    return { ...q, status: 'locked' as QuestStatus }
  })
}
