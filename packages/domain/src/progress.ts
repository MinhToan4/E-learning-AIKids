import type { Phase, QuestNode, QuestStatus } from './types.js'

export interface QuestProgressState {
  questId: string
  status: QuestStatus
  phase: Phase
  stars: number
  xpEarned: number
}

export interface CourseProgressView {
  courseId: string
  quests: Array<QuestNode & { progress: QuestProgressState }>
  totalStars: number
  totalXp: number
  completedCount: number
}

/**
 * Compute unlock status for a quest based on ordered predecessors.
 * Quest 0 starts available; each next unlocks when previous is completed.
 */
export function computeQuestStatus(
  order: number,
  completedOrders: Set<number>,
  existing?: QuestStatus,
): QuestStatus {
  if (existing === 'completed') return 'completed'
  if (existing === 'in_progress') return 'in_progress'
  if (order === 1 || order === 0) {
    // first quest (order 1) always available if not completed
    return existing === 'available' || !existing ? 'available' : existing
  }
  const prevOrder = order - 1
  if (completedOrders.has(prevOrder)) {
    return existing === 'locked' || !existing ? 'available' : existing
  }
  return 'locked'
}

/**
 * Build map of quest statuses for an ordered list.
 */
export function buildQuestStatuses(
  quests: Pick<QuestNode, 'id' | 'order'>[],
  progressByQuest: Map<string, QuestProgressState>,
): Map<string, QuestStatus> {
  const completedOrders = new Set<number>()
  for (const q of quests) {
    const p = progressByQuest.get(q.id)
    if (p?.status === 'completed') completedOrders.add(q.order)
  }

  const result = new Map<string, QuestStatus>()
  const sorted = [...quests].sort((a, b) => a.order - b.order)
  for (const q of sorted) {
    const existing = progressByQuest.get(q.id)?.status
    result.set(q.id, computeQuestStatus(q.order, completedOrders, existing))
  }
  return result
}

/**
 * Stars from check accuracy (kid-friendly: never 0 shame — minimum 1 if they finish).
 * 3 = perfect, 2 = mostly right, 1 = tried and finished.
 */
export function scoreStars(correct: number, total: number): number {
  if (total <= 0) return 1
  const ratio = correct / total
  if (ratio >= 1) return 3
  if (ratio >= 0.5) return 2
  return 1
}

export function xpForStars(stars: number): number {
  if (stars >= 3) return 30
  if (stars >= 2) return 20
  return 12
}

export function nextPhase(current: Phase): Phase | 'done' {
  if (current === 'learn') return 'practice'
  if (current === 'practice') return 'check'
  return 'done'
}

/**
 * Whether student may enter a quest (available or in_progress or completed for review).
 */
export function canEnterQuest(status: QuestStatus): boolean {
  return status === 'available' || status === 'in_progress' || status === 'completed'
}

/**
 * Transition after completing a phase.
 */
export function advancePhase(
  current: Phase,
): { phase: Phase; complete: boolean } {
  const n = nextPhase(current)
  if (n === 'done') return { phase: 'check', complete: true }
  return { phase: n, complete: false }
}
