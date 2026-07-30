export type CourseAgeGroup = {
  id: string
  label: string
}

type CourseAgeSource = {
  ageTrack: string
  ageLabel: string
}

function minimumAge(label: string): number {
  const value = Number(label.match(/\d+/)?.[0])
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}

export function courseAgeGroupId(course: CourseAgeSource): string {
  return course.ageTrack.trim() || course.ageLabel.trim()
}

export function buildCourseAgeGroups(
  courses: readonly CourseAgeSource[],
): CourseAgeGroup[] {
  const labelsByGroup = new Map<string, string>()

  for (const course of courses) {
    const id = courseAgeGroupId(course)
    const label = course.ageLabel.trim() || id
    if (!id || !label) continue

    const current = labelsByGroup.get(id)
    // A track may contain narrower labels. The earliest DB age label is the
    // clearest name for the track without encoding age bands in the frontend.
    if (!current || minimumAge(label) < minimumAge(current)) {
      labelsByGroup.set(id, label)
    }
  }

  return [...labelsByGroup.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort(
      (left, right) =>
        minimumAge(left.label) - minimumAge(right.label) ||
        left.label.localeCompare(right.label, 'vi'),
    )
}
