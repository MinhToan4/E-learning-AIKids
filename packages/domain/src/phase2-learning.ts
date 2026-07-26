export type AgeBand = '6_8' | '9_11' | '11_plus'

export function ageBandForBirthDate(
  birthDate: Date,
  asOf = new Date(),
): AgeBand {
  if (
    Number.isNaN(birthDate.getTime()) ||
    Number.isNaN(asOf.getTime()) ||
    birthDate.getTime() > asOf.getTime()
  ) {
    throw new Error('Invalid child birth date')
  }

  let age = asOf.getUTCFullYear() - birthDate.getUTCFullYear()
  const birthdayHasPassed =
    asOf.getUTCMonth() > birthDate.getUTCMonth() ||
    (asOf.getUTCMonth() === birthDate.getUTCMonth() &&
      asOf.getUTCDate() >= birthDate.getUTCDate())
  if (!birthdayHasPassed) age -= 1

  if (age < 6 || age > 17) {
    throw new Error('Unsupported child birth date')
  }
  if (age <= 8) return '6_8'
  if (age <= 11) return '9_11'
  return '11_plus'
}

export type CoursePathStatus =
  | 'completed'
  | 'active'
  | 'available'
  | 'locked'

export type CoursePathReason =
  | 'completed'
  | 'in_progress'
  | 'manual_override'
  | 'manual_block'
  | 'not_entitled'
  | 'age_mismatch'
  | 'not_available_yet'
  | 'prerequisite_incomplete'
  | 'requirements_met'

export interface CoursePathInput {
  id: string
  title: string
  entitled: boolean
  completionPercent: number
  allowedAgeBands: readonly AgeBand[]
  prerequisites: readonly string[]
  availableFrom: Date | null
  manuallyAllowed: boolean | null
}

export interface CoursePathResult extends CoursePathInput {
  status: CoursePathStatus
  reasonCode: CoursePathReason
  missingPrerequisites: string[]
}

export function buildCoursePathway(
  courses: readonly CoursePathInput[],
  context: { ageBand: AgeBand; now?: Date },
): CoursePathResult[] {
  const now = context.now ?? new Date()
  const completionByCourse = new Map(
    courses.map((course) => [
      course.id,
      Math.max(0, Math.min(100, course.completionPercent)),
    ]),
  )

  return courses.map((course) => {
    const completionPercent = Math.max(
      0,
      Math.min(100, course.completionPercent),
    )
    const base = { ...course, completionPercent, missingPrerequisites: [] }

    // Historical completion is durable even when a later curriculum version
    // changes prerequisites or age targeting.
    if (completionPercent >= 100) {
      return { ...base, status: 'completed', reasonCode: 'completed' }
    }
    if (course.manuallyAllowed === false) {
      return { ...base, status: 'locked', reasonCode: 'manual_block' }
    }
    if (course.manuallyAllowed === true) {
      return { ...base, status: 'available', reasonCode: 'manual_override' }
    }
    if (!course.entitled) {
      return { ...base, status: 'locked', reasonCode: 'not_entitled' }
    }
    if (!course.allowedAgeBands.includes(context.ageBand)) {
      return { ...base, status: 'locked', reasonCode: 'age_mismatch' }
    }
    if (course.availableFrom && course.availableFrom.getTime() > now.getTime()) {
      return { ...base, status: 'locked', reasonCode: 'not_available_yet' }
    }

    const missingPrerequisites = course.prerequisites.filter(
      (courseId) => (completionByCourse.get(courseId) ?? 0) < 100,
    )
    if (missingPrerequisites.length > 0) {
      return {
        ...base,
        status: 'locked',
        reasonCode: 'prerequisite_incomplete',
        missingPrerequisites,
      }
    }
    if (completionPercent > 0) {
      return { ...base, status: 'active', reasonCode: 'in_progress' }
    }
    return { ...base, status: 'available', reasonCode: 'requirements_met' }
  })
}

export interface LearningResume {
  percent: number
  positionSeconds: number
  sectionId: string | null
  occurredAt: Date
}

export function mergeLearningResume(
  current: LearningResume | null,
  incoming: LearningResume,
): LearningResume {
  const normalizedIncoming = {
    percent: Math.max(0, Math.min(100, incoming.percent)),
    positionSeconds: Math.max(0, incoming.positionSeconds),
    sectionId: incoming.sectionId,
    occurredAt: incoming.occurredAt,
  }
  if (!current) return normalizedIncoming

  const incomingIsNewer =
    normalizedIncoming.occurredAt.getTime() > current.occurredAt.getTime()
  return {
    percent: Math.max(current.percent, normalizedIncoming.percent),
    positionSeconds: incomingIsNewer
      ? normalizedIncoming.positionSeconds
      : current.positionSeconds,
    sectionId: incomingIsNewer
      ? normalizedIncoming.sectionId
      : current.sectionId,
    occurredAt: incomingIsNewer
      ? normalizedIncoming.occurredAt
      : current.occurredAt,
  }
}
