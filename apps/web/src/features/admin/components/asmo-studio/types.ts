import type {
  AsmoExam,
  AsmoGrade,
  AsmoSubject,
  AsmoCurriculumWeek,
} from '@/features/asmo/types'
import type { AsmoExamAuditResult } from '@/features/asmo/lib/asmo-audit-engine'

export type AsmoStudioTab = 'exams' | 'curriculum' | 'audit' | 'analytics'

export type ExamWithStatus = AsmoExam & {
  isPublished: boolean
}

export type StudentSubmission = {
  id: string
  studentName: string
  studentGrade: number
  examId: string
  examTitle: string
  subject: AsmoSubject
  score: number
  totalPoints: number
  scorePct: number
  isPassed: boolean
  durationMinutes: number
  submittedAt: string
}

export type CommonMistakeQuestion = {
  questionId: string
  examCode: string
  topicName: string
  questionText: string
  wrongRatePct: number
  wrongAttemptsCount: number
  commonPitfall: string
}

export type AsmoCurriculumWeekItem = AsmoCurriculumWeek & {
  meeTip?: {
    quote: string
    storyAdvice: string
  }
  solutionSteps?: string[]
  commonPitfall?: string
}

export interface AsmoStudioMetrics {
  totalExams: number
  publishedCount: number
  draftCount: number
  avgPassScore: string
}

export interface AsmoAuditBreakdown {
  katexErrors: number
  mathInconsistencies: number
  pedagogicalWarnings: number
  taxonomyIssues: number
}

export interface AsmoStudioExamsTabProps {
  exams: ExamWithStatus[]
  filteredExams: ExamWithStatus[]
  paginatedExams: ExamWithStatus[]
  metrics: AsmoStudioMetrics
  searchQuery: string
  onSearchChange: (q: string) => void
  filterSubject: 'all' | AsmoSubject
  onFilterSubjectChange: (s: 'all' | AsmoSubject) => void
  filterGrade: 'all' | number
  onFilterGradeChange: (g: 'all' | number) => void
  filterStatus: 'all' | 'published' | 'draft'
  onFilterStatusChange: (s: 'all' | 'published' | 'draft') => void
  onResetFilters: () => void
  onTogglePublish: (examId: string) => void
  onEditExam: (exam: ExamWithStatus) => void
  onOpenQuestions: (exam: ExamWithStatus) => void
  examPage: number
  examTotalPages: number
  onPrevPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
}

export interface AsmoStudioCurriculumTabProps {
  curriculumWeeks: AsmoCurriculumWeekItem[]
  filteredWeeks: AsmoCurriculumWeekItem[]
  curriculumSubject: 'all' | AsmoSubject
  onCurriculumSubjectChange: (s: 'all' | AsmoSubject) => void
  curriculumGrade: 'all' | number
  onCurriculumGradeChange: (g: 'all' | number) => void
  onOpenCreateWeek: () => void
  onGenerateAllTips: () => void
  onOpenImportModal: () => void
  onExportCurriculum: () => void
  onResetCurriculum: () => void
  onEditWeek: (week: AsmoCurriculumWeekItem) => void
  onPreviewGen: (week: AsmoCurriculumWeekItem) => void
  onDeleteWeek: (week: AsmoCurriculumWeekItem) => void
}

export interface AsmoStudioAuditTabProps {
  exams: ExamWithStatus[]
  auditResults: Array<{ exam: ExamWithStatus; result: AsmoExamAuditResult }>
  healthScore: number
  auditBreakdown: AsmoAuditBreakdown
  auditTimestamp: string
  isAuditingAll: boolean
  isRepairingAll: boolean
  repairingExamId: string | null
  repairedExamIds: Set<string>
  onRunFullAudit: () => void
  onRepairAllExams: () => void
  onQuickRepair: (exam: AsmoExam) => void
  onOpenAuditDetail: (exam: AsmoExam) => void
}

export interface AsmoStudioAnalyticsTabProps {
  submissions?: StudentSubmission[]
  commonMistakes?: CommonMistakeQuestion[]
}

export interface CurriculumWeekEditModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: AsmoCurriculumWeekItem
  isNew?: boolean
  onSave: (week: AsmoCurriculumWeekItem) => void
}

export interface CurriculumImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (items: AsmoCurriculumWeekItem[], mode: 'replace' | 'append') => void
  onDownloadTemplate: () => void
}

export interface CurriculumGeneratorPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  week: AsmoCurriculumWeekItem
  initialGenerated: {
    quote: string
    storyAdvice: string
    solutionSteps: string[]
    commonPitfall: string
  }
  onApply: (data: {
    quote: string
    storyAdvice: string
    solutionSteps: string[]
    commonPitfall: string
  }) => void
}

export interface RegulationEditModalProps {
  isOpen: boolean
  exam: ExamWithStatus | null
  onClose: () => void
  onSave: (e: React.FormEvent<HTMLFormElement>) => void
}

export interface QuestionsDetailModalProps {
  isOpen: boolean
  exam: ExamWithStatus | null
  onClose: () => void
}
