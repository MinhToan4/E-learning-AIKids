export type LessonPlanDraft = {
  goal: string
  activities: string
  materials: string
  notes: string
}

function nonEmptyLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function buildLessonPlan(draft: LessonPlanDraft) {
  const goal = draft.goal.trim()
  const activities = nonEmptyLines(draft.activities)
  const materials = nonEmptyLines(draft.materials)
  const notes = draft.notes.trim()

  return {
    ...(goal ? { goal } : {}),
    ...(activities.length > 0 ? { activities } : {}),
    ...(materials.length > 0 ? { materials } : {}),
    ...(notes ? { notes } : {}),
  }
}
