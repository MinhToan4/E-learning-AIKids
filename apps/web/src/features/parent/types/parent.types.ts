export type Approval = {
  id: string
  status: string
  destination: string
  shareStatus: string
  project: { id: string; title: string; kind: string; thumbnail: string }
  child: { id: string; nickname: string | null }
}

export type Child = {
  id: string
  nickname: string | null
  ageBand?: string | null
  avatarId: string | null
  level: number
  xp: number
  active: boolean
  hasPin?: boolean
  allowAiCreate?: boolean
  allowPhoto?: boolean
  allowExport?: boolean
  completedQuests?: number
  totalStars?: number
  projectCount?: number
}

export type ConsentEvent = {
  id: string
  policyVersion: string
  locale: string
  method: string
  beforeState: Record<string, boolean>
  afterState: Record<string, boolean>
  createdAt: string
}

export type HouseholdSub = {
  planCode: string
  planName: string
  status: string
  maxChildren: number
  maxOpenCoursesPerChild: number
  childCount: number
  seatsRemaining: number
  features: string[]
  currentPeriodEnd: string | null
}

export type PlanRow = {
  code: string
  name: string
  tagline: string
  maxChildren: number
  maxOpenCoursesPerChild: number
  priceMonthly: number
  currency: string
  features: string[]
}

export type ChildPlanUsage = {
  id: string
  nickname: string | null
  openCourses: number
}

export type QuestProg = {
  id: string
  order: number
  title: string
  status: string
  stars: number
  videoUrl: string | null
}

export type ChildProgress = {
  child: { id: string; nickname: string | null; level: number; xp: number }
  courseId: string | null
  courses: Array<{ id: string; title: string; shortTitle: string; ageLabel: string }>
  summary: {
    completed: number
    total: number
    totalStars: number
    currentPhase: string | null
  }
  insights: {
    strengths: string[]
    nextFocus: string | null
    outcomes: string[]
  }
  quests: QuestProg[]
}

export type ParentProfileData = {
  phone: string | null
  preferredLanguage: string
  notificationPrefs: Record<string, unknown>
  maxChildren: number
}

export type TabKey = 'dashboard' | 'kids' | 'approvals' | 'plan' | 'profile'

export type CourseItem = {
  id: string
  title: string
  shortTitle: string
  ageLabel: string
  ageTrack: string
  tagline: string
  coverImage: string | null
  enrolled: boolean
  parentAllowed: boolean | null
  accessPolicy: string
  priceAmountMinor: string
  priceCurrency: string
}

export type CoursePaymentState = {
  publicId: string
  status: 'pending' | 'succeeded' | 'failed' | 'unknown'
}
