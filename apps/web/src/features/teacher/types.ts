import type { LectureRow } from '@/shared/lib/api'
import type { LearnCardDraft } from './lib/authoring'

export type StudentRow = {
  id: string
  nickname: string | null
  level: number
  xp: number
  completedQuests: number
  totalStars: number
  projectCount: number
}

export type Lecture = LectureRow & {
  archived?: boolean
  stage?: string
  skill?: string
  reward?: string
  duration?: string
  accent?: string
  goals?: string[]
  concept?: string
  example?: string
  learnCards?: LearnCardDraft[]
  gameType?: string
  gameInstruction?: string
  gameOutcome?: string
  gameCards?: string[]
  gameConfig?: {
    selectionMode?: 'required' | 'student_choice'
    allowedTypes?: string[]
    difficulty?: 'gentle' | 'steady' | 'challenge'
    lobby?: unknown
    catalog?: unknown
    runnerLevels?: unknown
    patrolWaves?: unknown
  }
  practiceInstruction?: string
  product?: string
  practiceSteps?: string[]
  successCriteria?: string[]
  reflectionPrompt?: string
  practiceConfig?: { activityType?: string; prompt?: string; cards?: Array<{ id: string; title: string; description: string }> }
  checkQuestion?: string
  checkOptions?: string[]
  correctIndex?: number
  checkExplain?: string
  checkQuestions?: Array<{ id?: string; prompt: string; options: string[]; answer: number; explain: string }> | null
}

export type CourseLectures = {
  id: string
  title: string
  shortTitle: string
  status: string
  ageTrack?: string
  courseKey?: string
  scopeType?: 'global' | 'organization' | 'personal'
  programSource?: 'aikid_official' | 'workspace' | 'creator_marketplace'
  tagline?: string
  description?: string
  productLabel?: string
  durationLabel?: string
  skills?: string[]
  outcomes?: string[]
  credential?: string
  finalAssessment?: string
  regionUnlockMode?: 'sequential' | 'parallel'
  readOnly?: boolean
  isGatekeeper?: boolean
  lectures: Lecture[]
}

export type LearningProgram = {
  id: string
  title: string
  description: string
  source: 'aikid_official' | 'workspace' | 'creator_marketplace'
  unlockMode: 'sequential' | 'parallel'
  readOnly: boolean
  imageUrl?: string
  regions: CourseLectures[]
}

export type CurriculumPayload = { courses?: unknown; programs?: unknown }

export type CourseReadiness = {
  ready: boolean
  issues: string[]
  stations: Array<{ id: string; title: string; ready: boolean; missing: string[] }>
}

export type ClassStats = {
  className: string
  code: string
  studentCount: number
  totalCompletedQuests: number
  openQuestCount: number
  projectCount: number
  students: Array<{
    id: string
    nickname: string | null
    level: number
    xp: number
    completedQuests: number
    currentQuest: string | null
    currentPhase: string | null
    lastActiveAt: string | null
    needsSupport: boolean
    supportReason: string | null
  }>
}

export type ProgressDetail = {
  nickname: string | null
  quests: Array<{ title: string; status: string; stars: number }>
}

export type TeacherTab = 'class' | 'courses' | 'lectures' | 'stats' | 'feedback'

export type FeatureBlockItem = {
  id: string
  name: string
  icon: string
  desc: string
  badge?: string
  color: string
}
