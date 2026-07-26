import type { AgeBand } from './phase2-learning.js'

export function detectScheduleConflicts(
  proposed: { start: Date; end: Date },
  existing: Array<{ id: string; start: Date; end: Date }>,
): string[] {
  return existing
    .filter(
      (slot) =>
        proposed.start.getTime() < slot.end.getTime() &&
        proposed.end.getTime() > slot.start.getTime(),
    )
    .map((slot) => slot.id)
}

export function evaluatePlacementCompatibility(
  learner: { ageBand: AgeBand; level: number },
  cohort: {
    allowedAgeBands: AgeBand[]
    minLevel: number
    maxLevel: number
    currentSize: number
    capacity: number
    status: string
  },
) {
  const reasons: Array<'capacity' | 'age_band' | 'level' | 'status'> = []
  if (cohort.currentSize >= cohort.capacity) reasons.push('capacity')
  if (!cohort.allowedAgeBands.includes(learner.ageBand)) reasons.push('age_band')
  if (learner.level < cohort.minLevel || learner.level > cohort.maxLevel) {
    reasons.push('level')
  }
  if (cohort.status !== 'open') reasons.push('status')
  return { compatible: reasons.length === 0, reasons }
}
