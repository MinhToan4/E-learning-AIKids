export type StudentRow = {
  id: string
  nickname: string | null
  level: number
  xp: number
  completedQuests: number
  totalStars: number
  projectCount: number
}

export type ClassStatsStudent = {
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
}

export type ClassStats = {
  className: string
  code: string
  studentCount: number
  totalCompletedQuests: number
  openQuestCount: number
  projectCount: number
  students: ClassStatsStudent[]
}

export type ClassInfo = {
  id: string
  name: string
  code: string
}

export type StudentProgressData = {
  student: { nickname: string | null }
  progress: Array<{ questTitle: string; status: string; stars: number }>
}

export interface ClassManagementConsoleProps {
  canManageClass?: boolean
}

export const AVATAR_BG_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-sky-100 text-sky-700 border-sky-200',
]

export function getAvatarColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_BG_COLORS[Math.abs(hash) % AVATAR_BG_COLORS.length]
}
