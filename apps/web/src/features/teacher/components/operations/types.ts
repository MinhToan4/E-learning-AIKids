export type Learner = {
  id: string
  nickname: string | null
  ageBand: string
  level: number
  completedLessons: number
  totalPlatformLessons: number
  latestObservation: {
    body: string
    status: string
    updatedAt: string
  } | null
}

export type ConsoleClass = {
  id: string
  name: string
  code: string
  classType: string
  capacity: number
  status: string
  course: { id: string; title: string; shortTitle: string } | null
  nextSession: {
    id: string
    title: string
    startsAt: string
    endsAt: string
  } | null
  learners: Learner[]
}

export type ConsoleData = {
  pendingReviews: number
  alerts: { configurationRequired: boolean; reason: string }
  classes: ConsoleClass[]
}

export type CourseOption = { id: string; title: string }

export type TeacherObservation = {
  id: string
  studentId: string
  courseId: string | null
  body: string
  strengthsJson: string[]
  developmentJson: string[]
  scorePercent: number | null
  status: 'draft' | 'published'
  version: number
  updatedAt: string
}

export type RubricCriterion = { id: string; label: string; maxPoints: number }

export type Review = {
  id: string
  status: string
  version: number
  feedback: string | null
  rubricScores: Record<string, number>
  student: { id: string; nickname: string | null }
  assessment: { id: string; title: string; courseId: string }
  attemptId: string
  attemptNumber: number
  maxAttempts: number
  points: number
  question: {
    type: string
    prompt: { stem?: string }
    rubric: { criteria?: RubricCriterion[] }
  }
  response: Record<string, unknown>
  artifact: { snapshotJson?: unknown } | null
}

export type Session = {
  id: string
  classId: string
  title: string
  startsAt: string
  endsAt: string
  status: string
  attendanceFinalizedAt: string | null
}

export type ScheduleClass = { id: string; name: string; sessions: Session[] }

export type AttendanceStudent = { id: string; nickname: string | null }

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export type AttendanceRecord = {
  studentId: string
  status: AttendanceStatus
  note: string | null
  version: number
}

export type AttendanceData = {
  session: Session & { attendance: AttendanceRecord[] }
  students: AttendanceStudent[]
}

export type ReportPolicy = {
  id: string
  code: string
  version: number
  periodDays: number
  timezone: string
  requireApproval: boolean
  deliveryChannels: string[]
  template: { name: string; requiredSections: string[] }
}

export type TeacherReport = {
  id: string
  studentId: string
  status: string
  version: number
  periodStart: string
  periodEnd: string
  missingSections: string[]
  student: { nickname: string | null }
  template: { name: string }
  deliveries: Array<{ channel: string; status: string; lastError: string | null }>
}

export type Section = 'overview' | 'grading' | 'attendance' | 'reports'

export function splitValues(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((row) => row.trim())
    .filter(Boolean)
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
