/**
 * TeacherPage — Route-controlled tabs with inline tab navigation bar.
 *
 * WHY tab nav bar inside component (not just sidebar):
 * - Sidebar is hidden on mobile behind a hamburger menu → tabs look broken
 * - User sees page content but has no visible way to switch sections
 * - Adding a sticky tab bar inside fixes mobile UX and mirrors admin pattern
 *
 * Tabs: class | courses | lectures | stats
 * RBAC: teacher (full write) + admin (read-only on class operations)
 */
import { useEffect, useState, useCallback, useMemo, useRef, type ReactNode } from 'react'
import { Search, AlertCircle, RefreshCw, Puzzle, ListOrdered, Sparkles, Plus, ChevronDown, ChevronRight } from 'lucide-react'

type FeatureBlockItem = {
  id: string
  name: string
  icon: string
  desc: string
  badge?: string
  color: string
}

export const FEATURE_BLOCKS_CATEGORIES: Array<{
  category: string
  icon: string
  items: FeatureBlockItem[]
}> = [
  {
    category: 'Khối Chuẩn Khóa Học',
    icon: '🧱',
    items: [
      { id: 'course-text', name: 'Nội Dung Bài Học', icon: '📖', desc: 'Tiêu đề, nội dung và ghi nhớ của chặng', badge: 'Khóa học', color: 'border-brand-200 bg-brand-50/80 text-brand-950' },
      { id: 'course-four-keys', name: 'Bộ 4 Chìa Khóa', icon: '🔑', desc: 'Một bộ gồm Cái gì · Trông thế nào · Làm gì · Ở đâu', badge: 'Khóa học', color: 'border-amber-200 bg-amber-50/80 text-amber-950' },
    ],
  },
  {
    category: 'Kể Chuyện & Bài Giảng',
    icon: '📚',
    items: [
      { id: 'versus-ab', name: '2 Ảnh Đối Đầu A/B', icon: '🖼️', desc: 'Chọn tranh đúng sai, đối kháng A/B', badge: 'Hot', color: 'border-amber-200 bg-amber-50/80 text-amber-950' },
      { id: 'dialogue', name: 'Kịch Bản Phân Vai Comic', icon: '💬', desc: 'Hội thoại bong bóng Zico / Sonet / AIKI', badge: 'Mới', color: 'border-sky-200 bg-sky-50/80 text-sky-950' },
      { id: 'compare', name: 'Bảng So Sánh 2 Cột', icon: '⚖️', desc: 'Đối chiếu AI vs Bộ não sáng tạo', color: 'border-purple-200 bg-purple-50/80 text-purple-950' },
      { id: 'poster', name: 'Poster Quy Tắc Vàng', icon: '📜', desc: 'Banner quy tắc to bản, lưu về máy', color: 'border-emerald-200 bg-emerald-50/80 text-emerald-950' },
      { id: 'gallery', name: 'Bộ Sưu Tập Ảnh', icon: '📸', desc: 'Minh họa đa ảnh kèm chú thích chi tiết', color: 'border-teal-200 bg-teal-50/80 text-teal-950' },
      { id: 'video', name: 'Video Bài Giảng', icon: '🎬', desc: 'Video MP4 / YouTube tự phát', color: 'border-indigo-200 bg-indigo-50/80 text-indigo-950' },
      { id: 'voice', name: 'Giọng Đọc & Lipsync', icon: '🎙️', desc: 'Mèo AIKI đọc bài với cử chỉ ngộ nghĩnh', color: 'border-rose-200 bg-rose-50/80 text-rose-950' },
    ],
  },
  {
    category: 'Bố Cục & Văn Bản',
    icon: '📐',
    items: [
      { id: 'layout-text', name: '1 Cột Tập Trung', icon: '📖', desc: 'Văn bản lớn ở giữa', color: 'border-slate-200 bg-slate-50/80 text-slate-950' },
      { id: 'layout-split', name: '2 Cột Chữ + Media', icon: '📰', desc: 'Chữ bên trái, ảnh bên phải', badge: 'Chuẩn', color: 'border-blue-200 bg-blue-50/80 text-blue-950' },
      { id: 'layout-grid', name: 'Lưới 3 Ô Thẻ', icon: '🍱', desc: 'Phân loại ví dụ/ý tưởng', color: 'border-purple-200 bg-purple-50/80 text-purple-950' },
      { id: 'layout-four-keys', name: 'Bố Cục 4 Chìa Khóa', icon: '🔑', desc: '4 ô Cái gì · Trông thế nào · Làm gì · Ở đâu', badge: 'Template', color: 'border-sky-200 bg-gradient-to-r from-sky-50 via-amber-50 to-rose-50 text-slate-950' },
      { id: 'layout-callout', name: 'Hộp Ghi Nhớ Nổi Bật', icon: '💡', desc: 'Khung bo cong nhấn mạnh', badge: 'Mẹo', color: 'border-amber-200 bg-amber-50/80 text-amber-950' },
      { id: 'layout-storyboard', name: 'Chuỗi Storyboard', icon: '🎬', desc: '3 cảnh tuần tự', color: 'border-emerald-200 bg-emerald-50/80 text-emerald-950' },
      { id: 'layout-formula', name: 'Công Thức KaTeX', icon: '🔤', desc: 'Toán học trực quan', color: 'border-indigo-200 bg-indigo-50/80 text-indigo-950' },
    ],
  },
  {
    category: 'Game Engine Bài Học',
    icon: '🎮',
    items: [
      { id: 'data-runner', name: 'Data Runner', icon: '🏃', desc: 'Chạy vượt chướng ngại vật nhặt từ khóa', badge: 'Engine', color: 'border-blue-200 bg-blue-50/80 text-blue-950' },
      { id: 'truth-patrol', name: 'Truth Patrol', icon: '🚀', desc: 'Bắn thiên thạch fake news / quét sự thật', badge: 'Engine', color: 'border-cyan-200 bg-cyan-50/80 text-cyan-950' },
      { id: 'battle-math', name: 'Battle Math', icon: '⚔️', desc: 'Đấu trí toán học thần tốc cùng AIKI', badge: 'Engine', color: 'border-violet-200 bg-violet-50/80 text-violet-950' },
      { id: 'blockly', name: 'Blockly Code', icon: '🧩', desc: 'Lập trình kéo thả logic tư duy máy tính', badge: 'Engine', color: 'border-orange-200 bg-orange-50/80 text-orange-950' },
    ],
  },
  {
    category: 'Game Engine Thực Hành',
    icon: '🎨',
    items: [
      { id: 'practice-brief', name: 'Đề Bài Thực Hành', icon: '🎯', desc: 'Mục tiêu, sản phẩm và chi tiết bắt buộc', badge: 'Thực hành', color: 'border-amber-200 bg-amber-50/80 text-amber-950' },
      { id: 'practice-workflow', name: 'Quy Trình 4 Bước', icon: '🪜', desc: 'Bốn bước thao tác có thể sắp xếp', badge: 'Thực hành', color: 'border-mint-200 bg-mint-50/80 text-mint-950' },
      { id: 'practice-ai-studio', name: 'Xưởng Tạo Tranh AI', icon: '🎨', desc: 'Game engine ghép 4 chìa khóa và tạo sản phẩm', badge: 'Engine', color: 'border-brand-200 bg-brand-50/80 text-brand-950' },
    ],
  },
  {
    category: 'Luyện Tập & Đánh Giá',
    icon: '🎯',
    items: [
      { id: 'quiz', name: 'Câu Đố Trắc Nghiệm', icon: '❓', desc: 'Kiểm tra nhanh kiến thức vừa khám phá', color: 'border-pink-200 bg-pink-50/80 text-pink-950' },
      { id: 'ordering', name: 'Kéo Thả Thứ Tự', icon: '🔄', desc: 'Sắp xếp quy trình và các bước thực hiện', color: 'border-yellow-200 bg-yellow-50/80 text-yellow-950' },
      { id: 'pledge', name: 'Bản Cam Kết Hiệp Sĩ', icon: '🛡️', desc: 'Lời hứa danh dự của Hiệp Sĩ Sáng Tạo AI', badge: 'Ý nghĩa', color: 'border-mint-200 bg-mint-50/80 text-mint-950' },
    ],
  },
]
import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { Paginator } from '@/shared/components/ui/Paginator'
import { useToast } from '@/shared/hooks/useToast'
import { usePagination } from '@/shared/hooks/usePagination'
import { api, type LectureRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import { designerAssets, programArtworkHint } from '@/shared/config/assets'
import { LectureDrawer } from '../components/LectureDrawer'
import { CourseFormModal } from '../components/CourseFormModal'
import { RuleAuthoringDrawer } from '@/features/rules/components/RuleAuthoringDrawer'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import type { AikiRule } from '@/features/rules/types'
import { TeacherFeedbackPanel } from '../components/TeacherFeedbackPanel'
import { CourseVisualRoadmap } from '../components/CourseVisualRoadmap'
import { ScriptCourseGeneratorModal } from '../components/ScriptCourseGeneratorModal'
import type { ScriptAnalysisResult } from '../lib/script-analyzer'
import {
  PRACTICE_OPTIONS,
  serializeLectureGameConfig,
} from '../lib/authoring'

import {
  CmsAnalyticsIcon,
  CmsCoursesIcon,
  CmsFeedbackIcon,
  CmsLecturesIcon,
  CmsUsersIcon,
} from '@/shared/components/icons/CmsIcons'

export function courseLessonFormat(isRuleCourse: boolean) {
  return isRuleCourse ? 'aiki-rule-5steps' as const : 'aiki-island-6steps' as const
}

export function isAikiRulesCourse(course?: { id: string; title: string; isGatekeeper?: boolean } | null) {
  if (!course) return false
  const id = course.id.toLowerCase()
  const title = course.title.toLowerCase()
  return Boolean(
    course.isGatekeeper ||
    id === 'aiki-rules' ||
    id.includes('rule') ||
    title.includes('quy tắc') ||
    title.includes('quy tac') ||
    title.includes('module 0')
  )
}

// ── Types ───────────────────────────────────────────────────
type StudentRow = {
  id: string
  nickname: string | null
  level: number
  xp: number
  completedQuests: number
  totalStars: number
  projectCount: number
}

type Lecture = LectureRow & {
  archived?: boolean
  stage?: string
  skill?: string
  reward?: string
  duration?: string
  accent?: string
  goals?: string[]
  concept?: string
  example?: string
  learnCards?: import('../lib/authoring').LearnCardDraft[]
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

type CourseLectures = {
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

type LearningProgram = {
  id: string
  title: string
  description: string
  source: 'aikid_official' | 'workspace' | 'creator_marketplace'
  unlockMode: 'sequential' | 'parallel'
  readOnly: boolean
  imageUrl?: string
  regions: CourseLectures[]
}

type CurriculumPayload = { courses?: unknown; programs?: unknown }

function normalizeCourseLectures(value: unknown): CourseLectures | null {
  if (!value || typeof value !== 'object') return null
  const source = value as Partial<CourseLectures>
  if (typeof source.id !== 'string' || !source.id.trim()) return null
  return {
    ...source,
    id: source.id,
    title: typeof source.title === 'string' && source.title.trim() ? source.title : 'Khóa học chưa đặt tên',
    shortTitle: typeof source.shortTitle === 'string' ? source.shortTitle : '',
    status: typeof source.status === 'string' ? source.status : 'soon',
    lectures: Array.isArray(source.lectures)
      ? source.lectures.filter((lecture): lecture is Lecture => Boolean(lecture && typeof lecture === 'object' && typeof lecture.id === 'string'))
      : [],
  }
}

/** Chặn dữ liệu import thiếu mảng làm sập toàn bộ CMS; quyền ghi vẫn do Hub kiểm soát. */
export function normalizeCurriculumPayload(payload: CurriculumPayload): { courses: CourseLectures[]; programs: LearningProgram[] } {
  const courses = Array.isArray(payload.courses)
    ? payload.courses.map(normalizeCourseLectures).filter((course): course is CourseLectures => Boolean(course))
    : []
  const programs = Array.isArray(payload.programs)
    ? payload.programs.flatMap((value) => {
        if (!value || typeof value !== 'object') return []
        const source = value as Partial<LearningProgram>
        if (typeof source.id !== 'string' || !source.id.trim()) return []
        const regions = Array.isArray(source.regions)
          ? source.regions.map(normalizeCourseLectures).filter((course): course is CourseLectures => Boolean(course))
          : []
        const program: LearningProgram = {
          ...source,
          id: source.id,
          title: typeof source.title === 'string' && source.title.trim() ? source.title : 'Chương trình chưa đặt tên',
          description: typeof source.description === 'string' ? source.description : '',
          source: source.source === 'workspace' || source.source === 'creator_marketplace' ? source.source : 'aikid_official',
          unlockMode: source.unlockMode === 'parallel' ? 'parallel' : 'sequential',
          readOnly: Boolean(source.readOnly),
          regions,
        }
        return [program]
      })
    : []
  return { courses, programs }
}

type CourseReadiness = {
  ready: boolean
  issues: string[]
  stations: Array<{ id: string; title: string; ready: boolean; missing: string[] }>
}

function programArtwork(program: LearningProgram) {
  return programArtworkHint({ id: program.id, title: program.title, imageUrl: program.imageUrl })
}

type ClassStats = {
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

type ProgressDetail = {
  nickname: string | null
  quests: Array<{ title: string; status: string; stars: number }>
}

export type TeacherTab = 'class' | 'courses' | 'lectures' | 'stats' | 'feedback'

const PHASE_LABELS: Record<string, string> = {
  learn: 'Khám phá',
  game: 'Trò chơi',
  practice: 'Sáng tạo',
  check: 'Thử tài',
}

function formatActivity(value: string | null): string {
  if (!value) return 'Chưa bắt đầu'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

// ── Sub-components ────────────────────────────────────────────
function StatCard({ label, value, icon }: { label: string; value: number | string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <span aria-hidden="true">{icon}</span>
      </div>
      <p className="font-display text-3xl text-sky-600">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold',
      status === 'open' ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning'
    )}>
      {status === 'open' ? 'Đang mở' : 'Đang ẩn'}
    </span>
  )
}

// WHY: ErrorPanel dùng thay toast cho lỗi API nghiêm trọng —
// toast tự biến mất trong 3s, user không kịp đọc khi tab trống.
function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  const displayMsg = message.includes('ZodError') || message.includes('validation') || message.includes('Expected')
    ? 'Dữ liệu phản hồi không đúng định dạng. Vui lòng thử lại.'
    : message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')
      ? 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng rồi thử lại.'
      : message
  return (
    <div className="ui-card flex flex-col items-center gap-4 p-8 text-center" role="alert">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
        <AlertCircle size={28} className="text-danger" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-lg text-text">Không tải được dữ liệu</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{displayMsg}</p>
      </div>
      <Button variant="secondary" onClick={onRetry} className="gap-2">
        <RefreshCw size={15} aria-hidden="true" />
        Thử lại
      </Button>
    </div>
  )
}


// ── Main component ────────────────────────────────────────────
export function TeacherPage({ tab }: { tab: TeacherTab }) {
  // ── Class state ───────────────────────────────────────────
  const [classInfo, setClassInfo] = useState<{ id?: string; name: string; code: string } | null>(null)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [progressDetail, setProgressDetail] = useState<ProgressDetail | null>(null)
  const [classForm, setClassForm] = useState({ name: '', code: '' })
  const [newStudent, setNewStudent] = useState('')
  const [removeTarget, setRemoveTarget] = useState<StudentRow | null>(null)

  // ── Courses state ─────────────────────────────────────────
  const [courses, setCourses] = useState<CourseLectures[]>([])
  const [programs, setPrograms] = useState<LearningProgram[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState('')
  // ── Lectures state ────────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [archiveTarget, setArchiveTarget] = useState<Lecture | null>(null)

  // ── Stats state ───────────────────────────────────────────
  const [stats, setStats] = useState<ClassStats | null>(null)

  // ── Drawer / Modal state ──────────────────────────────────
  // WHY: Dùng drawer thay vì form inline để giáo viên thấy danh sách trong khi edit
  const [drawerMode, setDrawerMode] = useState<'none' | 'create' | 'edit'>('none')
  const [drawerLecture, setDrawerLecture] = useState<Lecture | null>(null)
  const [sidebarAuthoringMode, setSidebarAuthoringMode] = useState<'blocks' | 'stations'>('blocks')
  const [lectureDraftDirty, setLectureDraftDirty] = useState(false)
  const [pendingLectureAction, setPendingLectureAction] = useState<(() => void) | null>(null)
  const [courseModalMode, setCourseModalMode] = useState<'none' | 'create' | 'edit'>('none')
  const [courseModalCourse, setCourseModalCourse] = useState<CourseLectures | null>(null)
  const [courseReadiness, setCourseReadiness] = useState<CourseReadiness | null>(null)
  const [checkingCourse, setCheckingCourse] = useState(false)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Kể Chuyện & Bài Giảng': true,
    'Bố Cục & Văn Bản': true,
    'Mini-Game Engine': false,
    'Luyện Tập & Đánh Giá': false,
  })
  const toggleCategory = useCallback((catName: string) => {
    setOpenCategories((prev) => ({ ...prev, [catName]: !prev[catName] }))
  }, [])

  // ── Golden Rules CMS Drawer State ─────────────────────────
  const [selectedRuleForDrawer, setSelectedRuleForDrawer] = useState<AikiRule | null>(null)
  const [showRulePickerModal, setShowRulePickerModal] = useState(false)

  // ── AI Script Generator state ─────────────────────────────
  const [showScriptModal, setShowScriptModal] = useState(false)

  // ── UI state ──────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ── Search / filter state ──────────────────────────────────
  const [studentSearch, setStudentSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [learningSpaceFilter, setLearningSpaceFilter] = useState<LearningProgram['source']>('aikid_official')
  const learningSpaceFilterRef = useRef<LearningProgram['source']>(learningSpaceFilter)

  useEffect(() => {
    learningSpaceFilterRef.current = learningSpaceFilter
  }, [learningSpaceFilter])
  const [lectureSearch, setLectureSearch] = useState('')
  const [lectureArchiveFilter, setLectureArchiveFilter] = useState<'' | 'active' | 'archived'>('')
  const [statsSearch, setStatsSearch] = useState('')
  const [statsSupportFilter, setStatsSupportFilter] = useState<'' | 'needs' | 'ok'>('')

  const { toasts, showToast, dismissToast } = useToast()
  const role = useAuth((s) => s.user?.role)
  const canManageClass = role === 'teacher'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const handleApplyGeneratedCourse = useCallback((result: ScriptAnalysisResult) => {
    const timestamp = Date.now()
    const newCourseId = `course-ai-${timestamp}`
    const newProgramId = `program-ai-${timestamp}`

    const generatedLectures: Lecture[] = result.stations.map((st, i) => ({
      id: `quest-ai-${timestamp}-${i + 1}`,
      courseId: newCourseId,
      order: i + 1,
      accent: 'brand',
      videoUrl: null,
      title: st.title,
      skill: st.skill,
      hook: st.hook,
      duration: st.duration,
      reward: st.reward,
      gameType: st.gameType,
      gameInstruction: st.gameInstruction,
      practiceKind: st.practiceKind as any,
      practiceInstruction: st.practiceInstruction,
      product: st.product,
      learnCards: st.learnCards as any,
      checkQuestions: st.checkQuestions as any,
      status: 'open',
      archived: false,
    }))

    const newCourse: CourseLectures = {
      id: newCourseId,
      title: result.courseTitle,
      shortTitle: result.courseTitle.slice(0, 24),
      status: 'soon',
      programSource: 'workspace',
      description: result.courseDescription,
      skills: result.stations.map((s) => s.skill),
      lectures: generatedLectures,
    }

    const newProgram: LearningProgram = {
      id: newProgramId,
      title: result.courseTitle,
      description: result.courseDescription,
      source: 'workspace',
      unlockMode: 'sequential',
      readOnly: false,
      regions: [newCourse],
    }

    setCourses((prev) => [newCourse, ...prev])
    setPrograms((prev) => [newProgram, ...prev])
    setSelectedProgramId(newProgramId)
    setSelectedCourseId(newCourseId)
    setLearningSpaceFilter('workspace')

    // Chuyển sang tab courses với course mới
    navigate(`/teacher/courses?courseId=${newCourseId}&programId=${newProgramId}`)
    showToast(`🎉 Đã tạo lộ trình "${result.courseTitle}" với ${generatedLectures.length} trạm học từ kịch bản AI!`, 'success')
  }, [navigate, showToast])

  const runLectureAction = useCallback((action: () => void) => {
    if (lectureDraftDirty) setPendingLectureAction(() => action)
    else action()
  }, [lectureDraftDirty])

  const closeLectureEditor = useCallback(() => {
    setDrawerMode('none')
    setDrawerLecture(null)
    setLectureDraftDirty(false)
  }, [])

  // Derive lectures BEFORE pagination hooks to avoid TDZ with `const`
  const activeCourse = courses.find((c) => c.id === selectedCourseId)
  const editableCourses = courses.filter((course) => !course.readOnly)
  const referenceCourses = courses.filter((course) => course.readOnly)
  const lectures = activeCourse?.lectures ?? []
  const isCurrentCourseRule = isAikiRulesCourse(activeCourse)

  const openRuleDrawerForStation = useCallback((stationIndex: number) => {
    const safeIdx = Math.max(0, Math.min(9, stationIndex))
    const rule = AIKI_RULES_DATA[safeIdx] || AIKI_RULES_DATA[0]
    setSelectedRuleForDrawer(rule)
  }, [])

  // ── Filtered arrays (client-side search) ────────────────────
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students
    const q = studentSearch.toLowerCase()
    return students.filter((s) => s.nickname?.toLowerCase().includes(q))
  }, [students, studentSearch])

  const filteredLectures = useMemo(() => {
    let list = lectures
    if (lectureArchiveFilter === 'active') list = list.filter((l) => !l.archived)
    if (lectureArchiveFilter === 'archived') list = list.filter((l) => l.archived)
    if (lectureSearch) {
      const q = lectureSearch.toLowerCase()
      list = list.filter((l) => l.title.toLowerCase().includes(q))
    }
    return list
  }, [lectures, lectureSearch, lectureArchiveFilter])

  const statStudents = stats?.students ?? []
  const filteredStatStudents = useMemo(() => {
    let list = statStudents
    if (statsSupportFilter === 'needs') list = list.filter((s) => s.needsSupport)
    if (statsSupportFilter === 'ok') list = list.filter((s) => !s.needsSupport)
    if (statsSearch) {
      const q = statsSearch.toLowerCase()
      list = list.filter((s) => s.nickname?.toLowerCase().includes(q))
    }
    return list
  }, [statStudents, statsSearch, statsSupportFilter])

  // ── Pagination — one hook per data-heavy list ─────────────────
  const studentsPag = usePagination(filteredStudents, 15)
  const lecturesPag = usePagination(filteredLectures, 10)
  const statsPag = usePagination(filteredStatStudents, 15)

  // ── Load data ────────────────────────────────────────────
  const loadClass = useCallback(async () => {
    const data = await api<{ class: { id: string; name: string; code: string } | null; students: StudentRow[] }>('/api/teacher/class')
    setClassInfo(data.class)
    setStudents(data.students)
  }, [])

  const loadLectures = useCallback(async () => {
    const rawData = await api<CurriculumPayload>('/api/teacher/lectures')
    const data = normalizeCurriculumPayload(rawData)
    setCourses(data.courses)
    const allPrograms = data.programs
    setPrograms(allPrograms)
    const requestedProgramId = searchParams.get('programId')
    const requestedCourseId = searchParams.get('courseId')
    const requestedCourseProgram = allPrograms.find((program) =>
      program.regions.some((region) => region.id === requestedCourseId),
    )
    const requestedProgram = allPrograms.find((program) => program.id === requestedProgramId)
      ?? requestedCourseProgram

    if (requestedProgram) {
      setLearningSpaceFilter(requestedProgram.source)
      learningSpaceFilterRef.current = requestedProgram.source
      const nextProgramId = requestedProgram.id
      const requestedCourse = data.courses.find((course) => course.id === requestedCourseId)
      const nextCourse = requestedCourse ?? requestedProgram.regions[0] ?? data.courses[0]
      const nextCourseId = nextCourse?.id ?? ''
      setSelectedProgramId(nextProgramId)
      setSelectedCourseId(nextCourseId)
      if ((!requestedProgramId || !requestedCourseId) && nextProgramId && nextCourseId) {
        setSearchParams({ programId: nextProgramId, courseId: nextCourseId }, { replace: true })
      }
      return
    }

    // Tôn trọng triệt để learningSpaceFilter hiện tại, KHÔNG fallback reset về aikid_official
    const currentSpace = learningSpaceFilterRef.current
    const spacePrograms = allPrograms.filter((p) => p.source === currentSpace)

    if (spacePrograms.length > 0) {
      const nextProgram = spacePrograms.find((p) => p.id === selectedProgramId) ?? spacePrograms[0]
      const requestedCourse = data.courses.find((course) => course.id === requestedCourseId)
      const nextCourse = requestedCourse ?? nextProgram.regions[0]
      const nextCourseId = nextCourse?.id ?? ''
      setSelectedProgramId(nextProgram.id)
      setSelectedCourseId(nextCourseId)
      if (nextProgram.id && nextCourseId) {
        setSearchParams({ programId: nextProgram.id, courseId: nextCourseId }, { replace: true })
      }
    } else {
      setSelectedProgramId('')
      setSelectedCourseId('')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, selectedProgramId])

  const loadStats = useCallback(async () => {
    const data = await api<{ stats: ClassStats | null }>('/api/teacher/class/stats')
    setStats(data.stats)
  }, [])

  const runLoad = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      if (tab === 'class' || tab === 'feedback') await loadClass()
      else if (tab === 'stats') await loadStats()
      else await loadLectures()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Lỗi tải dữ liệu'
      // WHY: Đặt loadError THAY VÌ chỉ toast — toast biến mất sau 3s,
      // user không thấy và nghĩ tab trống là do không có data.
      setLoadError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [tab, loadClass, loadStats, loadLectures, showToast])

  useEffect(() => {
    void runLoad()
    // runLoad thay đổi khi tab thay đổi — an toàn.
  }, [runLoad])

  // ── Handlers ─────────────────────────────────────────────
  async function saveClass(e: React.FormEvent) {
    e.preventDefault()
    const name = (classForm.name || classInfo?.name || '').trim()
    const code = (classForm.code || classInfo?.code || '').trim().toUpperCase()
    if (name.length < 2 || code.length < 3) { showToast('Tên lớp và mã lớp không hợp lệ', 'error'); return }
    try {
      await api('/api/teacher/class', { method: 'POST', body: JSON.stringify({ name, code }) })
      showToast('Đã lưu lớp học', 'success')
      setClassForm({ name: '', code: '' })
      await loadClass()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không lưu được lớp', 'error') }
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/api/teacher/class/students', { method: 'POST', body: JSON.stringify({ nickname: newStudent.trim() }) })
      setNewStudent('')
      showToast('Đã thêm học sinh vào lớp', 'success')
      await loadClass()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không thêm được. Kiểm tra biệt danh học sinh.', 'error') }
  }

  async function removeStudent() {
    if (!removeTarget) return
    try {
      await api(`/api/teacher/class/students/${removeTarget.id}`, { method: 'DELETE' })
      showToast('Đã gỡ học sinh khỏi lớp', 'success')
      setRemoveTarget(null)
      await loadClass()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không gỡ được', 'error')
      setRemoveTarget(null)
    }
  }

  async function viewProgress(studentId: string) {
    try {
      const data = await api<{ student: { nickname: string | null }; progress: Array<{ questTitle: string; status: string; stars: number }> }>(`/api/teacher/students/${studentId}/progress`)
      setProgressDetail({ nickname: data.student.nickname, quests: data.progress.map((p) => ({ title: p.questTitle, status: p.status, stars: p.stars })) })
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không tải tiến trình', 'error') }
  }

  async function patchCourseStatus(courseId: string, status: 'open' | 'soon') {
    if (status === 'open') {
      setCheckingCourse(true)
      try {
        const readiness = await api<CourseReadiness>(`/api/teacher/courses/${courseId}/readiness`)
        if (!readiness.ready) {
          setCourseReadiness(readiness)
          return
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Không kiểm tra được mức độ hoàn thiện', 'error')
        return
      } finally {
        setCheckingCourse(false)
      }
    }
    try {
      await api(`/api/teacher/courses/${courseId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      showToast(status === 'open' ? 'Đã mở khóa cho học sinh' : 'Đã ẩn khóa', 'success')
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi cập nhật khóa', 'error') }
  }

  async function archiveLecture() {
    if (!archiveTarget) return
    try {
      await api(`/api/teacher/lectures/${archiveTarget.id}`, { method: 'DELETE' })
      showToast('Đã ẩn bài giảng (soft-archive)', 'success')
      // WHY: nếu bài đang ẩn là bài đang mở trong editor, đóng drawer để tránh bị kẹt.
      if (drawerLecture?.id === archiveTarget.id) {
        setDrawerMode('none')
        setDrawerLecture(null)
      }
      setArchiveTarget(null)
      await loadLectures()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không ẩn được', 'error')
      setArchiveTarget(null)
    }
  }

  async function restoreLecture(questId: string) {
    try {
      await api(`/api/teacher/lectures/${questId}/restore`, { method: 'POST' })
      showToast('Đã khôi phục bài giảng', 'success')
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không khôi phục được', 'error') }
  }

  async function moveLecture(questId: string, dir: -1 | 1) {
    const ids = lectures.map((l) => l.id)
    const i = ids.indexOf(questId)
    const j = i + dir
    if (i < 0 || j < 0 || j >= ids.length) return
    const next = [...ids];
    [next[i], next[j]] = [next[j]!, next[i]!]
    try {
      await api('/api/teacher/lectures/reorder', { method: 'POST', body: JSON.stringify({ courseId: selectedCourseId, orderedQuestIds: next }) })
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không sắp xếp được', 'error') }
  }

  // ── Loading skeleton ──────────────────────────────────────
  const loadingEl = (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải dữ liệu">
      <div className="ui-skeleton h-32 rounded-2xl" />
      <div className="ui-skeleton h-48 rounded-2xl" />
    </div>
  )

  // ── Tab: Lớp học ──────────────────────────────────────────
  function renderClass() {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {!classInfo ? (
        canManageClass ? (
          <form className="ui-card flex flex-col gap-4 p-5 lg:col-span-2" onSubmit={(e) => void saveClass(e)}>
            <h2 className="font-display text-xl">Tạo lớp học</h2>
            <label className="grid gap-1 text-sm font-bold">
              Tên lớp
              <input className="min-h-11 rounded-xl border-2 border-border px-3" placeholder="Ví dụ: Lớp Sao Sáng" value={classForm.name} onChange={(e) => setClassForm((c) => ({ ...c, name: e.target.value }))} required minLength={2} />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Mã lớp
              <input className="min-h-11 rounded-xl border-2 border-border px-3 font-mono uppercase" placeholder="Ví dụ: STAR-8" value={classForm.code} onChange={(e) => setClassForm((c) => ({ ...c, code: e.target.value.toUpperCase() }))} required minLength={3} pattern="[A-Za-z0-9-]+" />
            </label>
            <Button type="submit">Tạo lớp</Button>
          </form>
        ) : (
          <EmptyState
            title="Chưa có lớp để theo dõi"
            description="Khi giáo viên tạo lớp, dữ liệu vận hành sẽ xuất hiện tại đây."
          />
        )
      ) : (
        <>
          {/* Student table */}
          <div className="ui-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <p className="font-bold">{classInfo.name}</p>
                <p className="text-xs text-muted">Mã lớp: <strong className="font-mono">{classInfo.code}</strong></p>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-600">{students.length} học sinh</span>
            </div>
            {/* Student search bar */}
            <div className="flex flex-col gap-2 border-b border-border/60 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-4">
              <div className="relative w-full min-w-0 flex-1 sm:min-w-[180px]">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                  <Search size={17} aria-hidden="true" />
                </span>
                <input
                  type="search"
                  aria-label="Tìm học sinh trong lớp"
                  placeholder="Tìm biệt danh..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full min-h-10 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
                />
              </div>
              {studentSearch && (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">{filteredStudents.length} / {students.length}</span>
              )}
              {studentSearch && (
                <button type="button" className="text-xs font-bold text-muted underline" onClick={() => setStudentSearch('')}>Xóa</button>
              )}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-sky-50/80">
                  <tr>
                    <th className="px-4 py-2 font-extrabold">Biệt danh</th>
                    <th className="px-4 py-2 font-extrabold">Cấp / XP</th>
                    <th className="px-4 py-2 font-extrabold">Tiến trình</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {studentsPag.slice.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">{students.length === 0 ? 'Chưa có học sinh nào' : 'Không có học sinh khớp tìm kiếm'}</td></tr>
                  ) : studentsPag.slice.map((s) => (
                    <tr key={s.id} className="border-t border-border/40">
                      <td className="px-4 py-2 font-bold">{s.nickname}</td>
                      <td className="px-4 py-2 text-sm">Lv{s.level} · {s.xp} XP</td>
                      <td className="px-4 py-2 text-xs text-muted">{s.completedQuests} trạm · {s.totalStars} sao · {s.projectCount} sản phẩm</td>
                      <td className="px-4 py-2 text-right">
                        <Button variant="ghost" className="!min-h-8 !px-2 !text-xs" onClick={() => void viewProgress(s.id)}>Chi tiết</Button>
                        {canManageClass && (
                          <Button variant="ghost" className="!min-h-8 !px-2 !text-xs text-danger" onClick={() => setRemoveTarget(s)}>Gỡ</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-border/60 sm:hidden">
              {studentsPag.slice.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">{students.length === 0 ? 'Chưa có học sinh nào' : 'Không có học sinh khớp tìm kiếm'}</p>
              ) : studentsPag.slice.map((s) => (
                <article key={s.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{s.nickname}</p>
                    <span className="shrink-0 rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">Lv{s.level} · {s.xp} XP</span>
                  </div>
                  <p className="text-xs text-muted">{s.completedQuests} trạm · {s.totalStars} sao · {s.projectCount} sản phẩm</p>
                  <div className={cn('grid gap-2', canManageClass && 'grid-cols-2')}>
                    <Button variant="secondary" className="w-full" onClick={() => void viewProgress(s.id)}>Chi tiết</Button>
                    {canManageClass && (
                      <Button variant="ghost" className="w-full text-danger" onClick={() => setRemoveTarget(s)}>Gỡ khỏi lớp</Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <Paginator
              page={studentsPag.page} totalPages={studentsPag.totalPages}
              totalItems={filteredStudents.length} pageSize={15}
              onPrev={studentsPag.prev} onNext={studentsPag.next} onGoTo={studentsPag.goTo}
            />
          </div>

          {/* Sidebar actions */}
          <div className="flex flex-col gap-4">
            {canManageClass ? (
              <>
                <form className="ui-card flex flex-col gap-3 p-4" onSubmit={(e) => void addStudent(e)}>
                  <h2 className="font-display text-lg">Thêm học sinh</h2>
                  <label className="grid gap-1 text-sm font-bold">
                    Biệt danh học sinh
                    <input className="min-h-11 rounded-xl border-2 border-border px-3" placeholder="Nhập đúng biệt danh" value={newStudent} onChange={(e) => setNewStudent(e.target.value)} required />
                  </label>
                  <Button type="submit">Thêm vào lớp</Button>
                </form>
                <form className="ui-card flex flex-col gap-2 p-4" onSubmit={(e) => void saveClass(e)}>
                  <p className="text-xs font-extrabold uppercase text-muted">Đổi tên / mã lớp</p>
                  <label className="grid gap-1 text-xs font-bold text-muted">
                    Tên lớp
                    <input className="min-h-9 w-full rounded-xl border border-border px-2 text-sm text-text" value={classForm.name || classInfo.name} onChange={(e) => setClassForm((c) => ({ ...c, name: e.target.value, code: c.code || classInfo!.code }))} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-muted">
                    Mã lớp
                    <input className="min-h-9 w-full rounded-xl border border-border px-2 font-mono text-sm uppercase text-text" value={classForm.code || classInfo.code} onChange={(e) => setClassForm((c) => ({ ...c, code: e.target.value.toUpperCase(), name: c.name || classInfo!.name }))} />
                  </label>
                  <Button type="submit" variant="secondary" className="!min-h-9 !text-xs">Cập nhật lớp</Button>
                </form>
              </>
            ) : (
              <section className="ui-card p-4 text-sm text-muted">
                <h2 className="font-display text-lg text-text">Chế độ theo dõi</h2>
                <p className="mt-1">
                  Việc thêm, gỡ học sinh và đổi mã lớp thuộc giáo viên phụ trách.
                </p>
              </section>
            )}

            {/* Progress detail panel */}
            {progressDetail && (() => {
              const ruleQuests = progressDetail.quests.filter((q) => {
                const t = q.title.toLowerCase()
                return t.includes('quy tắc') || t.includes('quy tac') || t.includes('rule')
              })
              const isRuleDone = ruleQuests.length > 0
                ? ruleQuests.every((q) => q.status === 'completed')
                : progressDetail.quests.some((q) => q.status === 'completed')
              const stuckQuest = progressDetail.quests.find((q) => q.status === 'in_progress' || q.status === 'available')
              return (
                <div className="ui-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base">Tiến trình · {progressDetail.nickname}</h3>
                    <button type="button" className="min-h-9 rounded-lg px-2.5 text-xs font-bold text-muted hover:bg-sky-50 cursor-pointer" aria-label="Đóng chi tiết tiến trình" onClick={() => setProgressDetail(null)}>Đóng</button>
                  </div>

                  {/* Trạng thái Đảo Tiên Quyết */}
                  <div className={cn(
                    "flex items-center gap-2 rounded-xl p-2.5 text-xs font-black",
                    isRuleDone
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border border-amber-200 bg-amber-50 text-amber-900"
                  )}>
                    <span>{isRuleDone ? '🛡️ Đã hoàn thành Đảo Quy Tắc Vàng AIKI (Huy hiệu Hiệp Sĩ)' : '⏳ Chưa hoàn thành Đảo Quy Tắc — Chưa mở khóa thế giới sáng tạo'}</span>
                  </div>

                  {/* Trạm đang kẹt / trạm đang học */}
                  {stuckQuest && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-2.5 text-xs font-bold text-rose-900">
                      <span>📍 Đang kẹt / học tại: <strong>{stuckQuest.title}</strong></span>
                    </div>
                  )}

                  <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                    {progressDetail.quests.length === 0 ? (
                      <li className="text-muted text-xs">Chưa hoàn thành trạm nào</li>
                    ) : progressDetail.quests.map((q, i) => (
                      <li key={i} className="flex justify-between gap-2 rounded-lg bg-brand-50/50 px-2 py-1 text-xs">
                        <span className="truncate">{q.title}</span>
                        <span className="shrink-0 text-muted">{q.status} · {q.stars} sao</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}

  const handleSelectProgram = (programId: string) => {
    runLectureAction(() => {
      setSelectedProgramId(programId)
      const prog = programs.find((p) => p.id === programId)
      const firstCourse = prog?.regions[0]
      if (firstCourse) {
        setSelectedCourseId(firstCourse.id)
        setSearchParams({ programId, courseId: firstCourse.id }, { replace: true })
      } else {
        setSelectedCourseId('')
        setSearchParams({ programId }, { replace: true })
      }
      closeLectureEditor()
    })
  }

  const visiblePrograms = useMemo(() => {
    return programs.filter((program) => {
      const query = courseSearch.trim().toLocaleLowerCase('vi')
      const searchable = `${program.title} ${program.description} ${program.regions.map((region) => region.title).join(' ')}`.toLocaleLowerCase('vi')
      return program.source === learningSpaceFilter && (!query || searchable.includes(query))
    })
  }, [programs, courseSearch, learningSpaceFilter])

  const focusedProgram = useMemo(() => {
    return visiblePrograms.find((program) => program.id === selectedProgramId) ?? visiblePrograms[0]
  }, [visiblePrograms, selectedProgramId])

  const handleSelectRegion = (regionId: string) => {
    runLectureAction(() => {
      setSelectedCourseId(regionId)
      setSearchParams({ programId: selectedProgramId || focusedProgram?.id || '', courseId: regionId }, { replace: true })
      closeLectureEditor()
    })
  }

  // ── Tab: Lộ trình & Trạm học (Hợp nhất Courses + Lectures - 3 Cấp độ) ────
  function renderCurriculumWorkspace() {
    return (
      <div className="flex flex-col gap-5">
      {/* CẤP 1: Chọn Chương trình (Program) */}
      <section className="rounded-3xl border-2 border-border/80 bg-white p-4 sm:p-5 shadow-xs" aria-labelledby="program-tier-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-100 text-xs font-black text-brand-700">
              1
            </span>
            <div>
              <h2 id="program-tier-title" className="font-display text-base font-black text-text">
                Cấp 1: Chương Trình Học (Learning Program)
              </h2>
              <p className="text-[11px] text-muted font-bold">
                Chọn không gian và giáo trình khung để quản lý lộ trình
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              id="open-course-modal-btn"
              variant="secondary"
              className="!min-h-9 !text-xs font-black border-brand-300 bg-white text-brand-800 hover:bg-brand-50 shadow-2xs cursor-pointer"
              onClick={() => { setCourseModalMode('create'); setCourseModalCourse(null) }}
            >
              <Plus size={13} />
              <span>Tạo giáo trình</span>
            </Button>

            <Button
              type="button"
              className="!min-h-9 !text-xs font-black shadow-xs gap-1.5 cursor-pointer"
              onClick={() => setShowScriptModal(true)}
            >
              <Sparkles size={14} />
              <span>🪄 Tạo từ kịch bản AI</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="!min-h-9 !text-xs font-black border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-2xs gap-1.5 cursor-pointer"
              onClick={() => setShowRulePickerModal(true)}
            >
              <span>🛡️ Soạn 10 Quy Tắc Vàng</span>
            </Button>
          </div>
        </div>

        {/* 3 Không gian học tập */}
        <div className="mt-3.5 grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Không gian học tập">
          {([
            ['aikid_official', 'AiKid chính thức', 'Nền tảng chính thức'],
            ['workspace', 'Trường học', 'Theo trường & lớp'],
            ['creator_marketplace', 'Học tự do', 'Giáo viên & gia đình'],
          ] as const).map(([source, label, caption]) => {
            const count = programs.filter((p) => p.source === source).length
            const isSelected = learningSpaceFilter === source
            return (
              <button
                key={source}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setLearningSpaceFilter(source)
                  learningSpaceFilterRef.current = source
                  const progsInSpace = programs.filter((p) => p.source === source)
                  const firstProg = progsInSpace[0]
                  const firstReg = firstProg?.regions[0]
                  setSelectedProgramId(firstProg?.id ?? '')
                  setSelectedCourseId(firstReg?.id ?? '')
                  if (firstProg) {
                    setSearchParams({ programId: firstProg.id, ...(firstReg ? { courseId: firstReg.id } : {}) }, { replace: true })
                  } else {
                    setSearchParams({}, { replace: true })
                  }
                  closeLectureEditor()
                }}
                className={cn(
                  'rounded-2xl border-2 p-3 text-left transition cursor-pointer flex items-center justify-between gap-2',
                  isSelected
                    ? 'border-brand-500 bg-brand-50/80 text-brand-950 shadow-xs ring-2 ring-brand-200'
                    : 'border-border bg-slate-50/50 text-text hover:border-brand-200 hover:bg-white'
                )}
              >
                <div>
                  <span className="block font-black text-xs">{label}</span>
                  <span className="block text-[10px] text-muted font-semibold mt-0.5">{caption}</span>
                </div>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-black',
                  isSelected ? 'bg-brand-500 text-white' : 'bg-white border border-border text-muted'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Chọn cụ thể Program trong không gian */}
        {visiblePrograms.length > 0 ? (
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50/80 border border-border/80 px-3.5 py-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <span className="text-xs font-black text-slate-700 whitespace-nowrap">Chương trình đang chọn:</span>
              <select
                className="min-h-9 flex-1 rounded-xl border border-border bg-white px-3 text-xs font-extrabold text-slate-900 outline-none focus:border-brand-500 cursor-pointer"
                value={focusedProgram?.id ?? ''}
                onChange={(e) => handleSelectProgram(e.target.value)}
              >
                {visiblePrograms.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.title} ({prog.regions.length} vùng · {prog.regions.reduce((sum, r) => sum + r.lectures.filter((l) => !l.archived).length, 0)} trạm)
                  </option>
                ))}
              </select>
            </div>

            {focusedProgram && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black">
                  {focusedProgram.unlockMode === 'sequential' ? 'Mở lần lượt từng vùng' : 'Mở song song các vùng'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3.5 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-6 sm:p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-2xs mb-3">
              <Sparkles size={24} />
            </div>
            <h3 className="font-display text-base font-black text-slate-900">
              {learningSpaceFilter === 'workspace'
                ? 'Chưa có chương trình nào trong không gian Trường học'
                : learningSpaceFilter === 'creator_marketplace'
                  ? 'Chưa có chương trình nào trong không gian Học tự do'
                  : 'Chưa có chương trình nào trong không gian AiKid chính thức'}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs font-bold text-muted leading-relaxed">
              {learningSpaceFilter === 'workspace'
                ? 'Chưa có chương trình nào trong không gian Trường học. Bấm "+ Tạo giáo trình" hoặc "🪄 Tạo từ kịch bản AI" để bắt đầu tạo giáo trình cho trường của bạn.'
                : 'Bấm "+ Tạo giáo trình" hoặc "🪄 Tạo từ kịch bản AI" để bắt đầu tạo giáo trình cho không gian này.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                className="!min-h-10 text-xs font-black border-brand-300 bg-white text-brand-800 hover:bg-brand-50 shadow-xs cursor-pointer"
                onClick={() => { setCourseModalMode('create'); setCourseModalCourse(null) }}
              >
                <Plus size={14} />
                <span>+ Tạo giáo trình</span>
              </Button>
              <Button
                type="button"
                className="!min-h-10 text-xs font-black shadow-xs gap-1.5 cursor-pointer"
                onClick={() => setShowScriptModal(true)}
              >
                <Sparkles size={14} />
                <span>🪄 Tạo từ kịch bản AI</span>
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* CẤP 2: Chọn Vùng (Region / Course thuộc Program) */}
      {focusedProgram ? (
        <section className="rounded-3xl border-2 border-brand-200 bg-gradient-to-b from-brand-50/40 via-white to-white p-4 sm:p-5 shadow-xs space-y-3" aria-labelledby="region-tier-title">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand-500 text-xs font-black text-white shadow-2xs">
                2
              </span>
              <div>
                <h3 id="region-tier-title" className="font-display text-sm font-black text-brand-950 uppercase tracking-wide">
                  Cấp 2: Chọn Vùng / Học Phần ({focusedProgram.regions.length} vùng)
                </h3>
                <p className="text-[10px] text-muted font-bold">
                  Bấm vào thẻ Vùng nằm ngang bên dưới để chuyển Bản đồ Trạm học
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeCourse && !activeCourse.readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setCourseModalMode('edit')
                    setCourseModalCourse(activeCourse)
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  <span>✏️ Sửa thông tin vùng</span>
                </button>
              )}
            </div>
          </div>

          {/* Thanh tab Vùng nằm ngang nổi bật */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
            {focusedProgram.regions.map((region, rIdx) => {
              const isSelected = region.id === selectedCourseId
              const stationCount = region.lectures.filter((l) => !l.archived).length
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => handleSelectRegion(region.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap border-2',
                    isSelected
                      ? 'border-brand-500 bg-white text-brand-900 shadow-md ring-4 ring-brand-200/70 scale-[1.02]'
                      : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-white hover:border-brand-300'
                  )}
                >
                  <span className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-black',
                    isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700'
                  )}>
                    {rIdx + 1}
                  </span>
                  <div className="text-left">
                    <span className="block truncate max-w-[180px]">{region.shortTitle || region.title}</span>
                    <span className={cn(
                      'block text-[10px] font-bold',
                      isSelected ? 'text-brand-600' : 'text-muted'
                    )}>
                      {stationCount} trạm · {region.status === 'open' ? 'Đang mở' : 'Đang ẩn'}
                    </span>
                  </div>
                </button>
              )
            })}

            {!focusedProgram.readOnly && (
              <button
                type="button"
                onClick={() => {
                  setCourseModalMode('create')
                  setCourseModalCourse(null)
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black text-brand-700 bg-brand-50/80 hover:bg-brand-100 border-2 border-dashed border-brand-300 transition cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} />
                <span>+ Thêm vùng</span>
              </button>
            )}
          </div>
        </section>
      ) : null}

      {/* CẤP 3: Bản đồ Trạm học thuộc Vùng đang chọn (CourseVisualRoadmap) & Focus Studio */}
      <section className="space-y-4" aria-labelledby="stations-tier-title">
        {drawerMode !== 'none' && selectedCourseId ? (
          /* Focus Studio Kéo Thả */
          <div className="grid items-start gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
            {/* Sidebar Trái: Khối tính năng hoặc Danh sách trạm */}
            <aside className="ui-card overflow-hidden lg:sticky lg:top-[4.5rem] w-full" aria-label="Thanh công cụ Focus Studio">
              <div className="border-b border-border bg-brand-50/60 p-3">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setSidebarAuthoringMode('blocks')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer",
                      sidebarAuthoringMode === 'blocks' ? "bg-white text-brand-700 shadow-xs" : "text-muted hover:text-text"
                    )}
                  >
                    <Puzzle size={13} />
                    <span>🧩 Khối Tính Năng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarAuthoringMode('stations')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer",
                      sidebarAuthoringMode === 'stations' ? "bg-white text-brand-700 shadow-xs" : "text-muted hover:text-text"
                    )}
                  >
                    <ListOrdered size={13} />
                    <span>📑 Trạm ({lectures.length})</span>
                  </button>
                </div>
              </div>

              {sidebarAuthoringMode === 'blocks' ? (
                /* Thư viện khối tính năng kéo thả */
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-210px)] p-2" aria-label="Thư viện khối tính năng">
                  <div className="rounded-lg border border-brand-200 bg-brand-50/70 p-2 text-xs text-brand-900 shadow-2xs">
                    <p className="font-extrabold flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-900">
                      <Sparkles size={11} className="text-brand-600" />
                      Kéo thả khối nội dung
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-brand-800">
                      Kéo thẻ hoặc click <strong>+ Thêm</strong> để chèn vào chặng.
                    </p>
                  </div>

                  {FEATURE_BLOCKS_CATEGORIES.map((category) => {
                    const isOpen = openCategories[category.category] ?? category.category === 'Khối Chuẩn Khóa Học'
                    const visibleItems = isCurrentCourseRule
                      ? category.items
                      : category.items.filter((item) => item.id !== 'voice')
                    return (
                      <div key={category.category} className="rounded-xl border border-border/80 bg-white/80 overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.category)}
                          className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-left bg-slate-50 hover:bg-slate-100/90 transition cursor-pointer border-b border-border/40"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs shrink-0">{category.icon}</span>
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide truncate">
                              {category.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-muted">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-white rounded-full border border-border/70 text-slate-600">
                              {visibleItems.length}
                            </span>
                            {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="p-1.5 flex flex-col gap-1 bg-slate-50/40">
                            {visibleItems.map((item) => (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', item.id)
                                  e.dataTransfer.effectAllowed = 'copy'
                                }}
                                className={cn(
                                  "group flex h-9 items-center justify-between gap-1.5 rounded-lg border px-2 text-xs transition-all shadow-2xs cursor-grab active:cursor-grabbing hover:shadow-xs hover:scale-[1.01]",
                                  item.color
                                )}
                                title={`Kéo thả hoặc click + Thêm: ${item.name} (${item.desc})`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <span className="text-sm shrink-0">{item.icon}</span>
                                  <span className="font-bold text-[11px] truncate leading-tight">{item.name}</span>
                                  {item.badge && (
                                    <span className="rounded bg-white/90 border border-current px-1 py-0 text-[8px] font-black uppercase tracking-wider shrink-0">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.dispatchEvent(
                                      new CustomEvent('aikids:add-feature-block', { detail: { blockId: item.id } })
                                    )
                                  }}
                                  className="shrink-0 flex items-center gap-0.5 rounded bg-white/90 hover:bg-white border border-current px-1.5 py-0.5 text-[10px] font-black shadow-2xs transition active:scale-95 cursor-pointer"
                                  title={`Thêm ${item.name} vào chặng`}
                                >
                                  <Plus size={10} />
                                  <span>Thêm</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Danh sách các trạm trong sidebar */
                <div className="flex flex-col gap-2 p-2 max-h-[calc(100vh-210px)] overflow-y-auto">
                  {lectures.map((l, i) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        if (isCurrentCourseRule) {
                          openRuleDrawerForStation(i)
                          return
                        }
                        runLectureAction(() => {
                          setDrawerMode('edit')
                          setDrawerLecture(l)
                        })
                      }}
                      className={cn(
                        "w-full text-left p-2 rounded-xl text-xs font-bold transition cursor-pointer border",
                        drawerLecture?.id === l.id
                          ? "bg-brand-50 border-brand-300 text-brand-900 shadow-2xs"
                          : "bg-white border-border/70 hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className="block text-[10px] text-muted font-black">Trạm {i + 1}</span>
                      <span className="block truncate font-extrabold text-slate-900">{l.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            {/* Nội dung chính Focus Studio */}
            <main className="min-w-0 flex flex-col gap-3">
              {/* Quick Nav Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 via-sky-50 to-white px-4 py-2.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => runLectureAction(closeLectureEditor)}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-2xs hover:border-brand-300 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <span>◄ Quay lại Bản đồ Trạm học</span>
                  </button>

                  <div className="hidden sm:block h-5 w-px bg-border/80" />

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted hidden md:inline">Đang soạn:</span>
                    <select
                      className="rounded-xl border border-brand-300 bg-white px-3 py-1.5 text-xs font-black text-brand-900 outline-none focus:ring-2 focus:ring-brand-200 cursor-pointer max-w-[240px] truncate"
                      value={drawerLecture?.id ?? ''}
                      onChange={(e) => {
                        const targetId = e.target.value
                        if (isCurrentCourseRule) {
                          const stIdx = lectures.findIndex((l) => l.id === targetId)
                          openRuleDrawerForStation(stIdx >= 0 ? stIdx : 0)
                          return
                        }
                        const target = lectures.find((l) => l.id === targetId)
                        if (target) {
                          runLectureAction(() => {
                            setDrawerMode('edit')
                            setDrawerLecture(target)
                          })
                        }
                      }}
                    >
                      {lectures.map((l, i) => (
                        <option key={l.id} value={l.id}>
                          Trạm {i + 1}: {l.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={lectures.findIndex((l) => l.id === drawerLecture?.id) <= 0}
                    onClick={() => {
                      const currIdx = lectures.findIndex((l) => l.id === drawerLecture?.id)
                      if (currIdx > 0) {
                        const prev = lectures[currIdx - 1]
                        runLectureAction(() => {
                          setDrawerMode('edit')
                          setDrawerLecture(prev)
                        })
                      }
                    }}
                    className="flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  >
                    <span>◀ Trạm trước</span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      lectures.findIndex((l) => l.id === drawerLecture?.id) < 0 ||
                      lectures.findIndex((l) => l.id === drawerLecture?.id) >= lectures.length - 1
                    }
                    onClick={() => {
                      const currIdx = lectures.findIndex((l) => l.id === drawerLecture?.id)
                      if (currIdx >= 0 && currIdx < lectures.length - 1) {
                        const next = lectures[currIdx + 1]
                        runLectureAction(() => {
                          setDrawerMode('edit')
                          setDrawerLecture(next)
                        })
                      }
                    }}
                    className="flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  >
                    <span>Trạm sau ▶</span>
                  </button>
                </div>
              </div>

              {/* LectureDrawer */}
              <LectureDrawer
                key={drawerMode === 'edit' ? (drawerLecture?.id ?? '__edit__') : '__new__'}
                inline
                courseId={selectedCourseId}
                readOnly={!!activeCourse?.readOnly}
                archived={drawerMode === 'edit' && !!drawerLecture?.archived}
                onArchive={() => drawerLecture && setArchiveTarget(drawerLecture)}
                onRestore={() => drawerLecture && void restoreLecture(drawerLecture.id)}
                onDirtyChange={setLectureDraftDirty}
                lecture={drawerMode === 'edit' && drawerLecture ? {
                  id: drawerLecture.id,
                  title: drawerLecture.title,
                  skill: drawerLecture.skill ?? '',
                  hook: drawerLecture.hook ?? '',
                  // Course lessons always use the 6-stage learning journey. The
                  // 5-card shape alone is not evidence of an AIKI Rule because
                  // legacy course lessons also persisted five generic cards.
                  lessonFormat: courseLessonFormat(isCurrentCourseRule),
                  sixStageJourney: (drawerLecture as any).sixStageJourney ?? (drawerLecture.gameConfig as any)?.sixStageJourney ?? (drawerLecture as any).metadata?.sixStageJourney,
                  metadata: (drawerLecture as any).metadata,
                  videoUrl: drawerLecture.videoUrl ?? '',
                  concept: drawerLecture.concept ?? '',
                  example: drawerLecture.example ?? '',
                  learnCards: drawerLecture.learnCards ?? [],
                  reward: drawerLecture.reward ?? '',
                  duration: drawerLecture.duration ?? '',
                  goalsText: (drawerLecture.goals ?? []).join('\n'),
                  gameType: drawerLecture.gameType ?? 'math-kids',
                  gameMode: (drawerLecture.gameConfig?.selectionMode as 'required' | 'student_choice') ?? 'required',
                  gameAllowedTypes: drawerLecture.gameConfig?.allowedTypes ?? [drawerLecture.gameType ?? 'math-kids'],
                  gameDifficulty: (drawerLecture.gameConfig?.difficulty as 'gentle' | 'steady' | 'challenge') ?? 'steady',
                  gameInstruction: drawerLecture.gameInstruction ?? '',
                  gameOutcome: drawerLecture.gameOutcome ?? '',
                  gameCardsText: (drawerLecture.gameCards ?? []).join('\n'),
                  gameStructuredText: serializeLectureGameConfig(drawerLecture.gameType ?? '', drawerLecture.gameConfig),
                  questionCount: typeof (drawerLecture.gameConfig as any)?.questionCount === 'number' ? (drawerLecture.gameConfig as any).questionCount : 6,
                  practiceKind: (drawerLecture.practiceKind ?? 'prompt_lab') as any,
                  practiceInstruction: drawerLecture.practiceInstruction ?? '',
                  product: drawerLecture.product ?? '',
                  practiceStepsText: (drawerLecture.practiceSteps ?? []).join('\n'),
                  successCriteriaText: (drawerLecture.successCriteria ?? []).join('\n'),
                  reflectionPrompt: drawerLecture.reflectionPrompt ?? '',
                  practiceConfigText: (drawerLecture.practiceConfig?.cards ?? []).map((c) => `${c.title} | ${c.description}`).join('\n'),
                  checkQuestions: Array.isArray((drawerLecture.gameConfig as any)?.checkQuestions)
                    ? (drawerLecture.gameConfig as any).checkQuestions
                    : (drawerLecture.checkQuestion ? [{
                        id: 'legacy-0',
                        prompt: drawerLecture.checkQuestion ?? '',
                        options: [drawerLecture.checkOptions?.[0] ?? '', drawerLecture.checkOptions?.[1] ?? '', drawerLecture.checkOptions?.[2] ?? ''].filter((o) => o.length > 0),
                        answer: drawerLecture.correctIndex ?? 0,
                        explain: drawerLecture.checkExplain ?? '',
                      }] : []),
                  checkQuestion: drawerLecture.checkQuestion ?? '',
                  checkOption1: drawerLecture.checkOptions?.[0] ?? '',
                  checkOption2: drawerLecture.checkOptions?.[1] ?? '',
                  checkOption3: drawerLecture.checkOptions?.[2] ?? '',
                  correctIndex: String(drawerLecture.correctIndex ?? 0),
                  checkExplain: drawerLecture.checkExplain ?? '',
                }
              : null
            }
            onSaved={() => void loadLectures()}
            onClose={closeLectureEditor}
          />
        </main>
      </div>
        ) : activeCourse ? (
          <div className="flex flex-col gap-5">
            {isCurrentCourseRule && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 shadow-sm animate-pop">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-xl">
                    🛡️
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-amber-950">
                      Đảo Tiên Quyết: Mười Quy Tắc Vàng của Xưởng sáng tạo
                    </h3>
                    <p className="text-xs font-semibold text-amber-800 mt-0.5">
                      Vùng 1 cửa ngõ bắt buộc. Bấm vào từng trạm bên dưới để mở Form biên soạn Quy Tắc tinh gọn (RuleAuthoringDrawer).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRulePickerModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-500 px-3.5 py-2 text-xs font-black text-white hover:bg-amber-600 transition shadow-xs cursor-pointer"
                >
                  <span>📜 Chọn trong 10 Quy Tắc Vàng</span>
                </button>
              </div>
            )}

            <CourseVisualRoadmap
              courseTitle={activeCourse.shortTitle || activeCourse.title}
              courseDescription={activeCourse.description}
              stations={lectures}
              readOnly={!!activeCourse.readOnly}
              onSelectStation={(stationId) => {
                if (isCurrentCourseRule) {
                  const stIdx = lectures.findIndex((l) => l.id === stationId)
                  openRuleDrawerForStation(stIdx >= 0 ? stIdx : 0)
                  return
                }
                const target = lectures.find((l) => l.id === stationId)
                if (target) {
                  runLectureAction(() => {
                    setDrawerMode('edit')
                    setDrawerLecture(target)
                  })
                }
              }}
              onAddStation={() => {
                if (isCurrentCourseRule) {
                  const nextIdx = Math.min(9, lectures.length)
                  openRuleDrawerForStation(nextIdx)
                  return
                }
                runLectureAction(() => {
                  setDrawerMode('create')
                  setDrawerLecture(null)
                })
              }}
              onToggleArchiveStation={(station) => {
                if (station.archived) {
                  void restoreLecture(station.id)
                } else {
                  setArchiveTarget(station)
                }
              }}
              onMoveStation={(stationId, dir) => {
                void moveLecture(stationId, dir)
              }}
              onOpenScriptGenerator={() => setShowScriptModal(true)}
            />

            {!activeCourse.readOnly && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 shadow-2xs">
                <div className="flex items-center gap-2">
                  <StatusBadge status={activeCourse.status} />
                  <span className="text-xs font-bold text-muted">
                    {activeCourse.status === 'open' ? 'Học sinh đang có thể truy cập lộ trình này' : 'Lộ trình đang được ẩn với học sinh'}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  className="text-xs font-extrabold cursor-pointer"
                  disabled={checkingCourse || lectures.filter((lecture) => !lecture.archived).length === 0}
                  onClick={() => void patchCourseStatus(activeCourse.id, activeCourse.status === 'open' ? 'soon' : 'open')}
                >
                  {checkingCourse ? 'Đang kiểm tra...' : activeCourse.status === 'open' ? 'Ẩn khỏi học sinh' : 'Mở cho học sinh'}
                </Button>
              </div>
            )}
          </div>
        ) : visiblePrograms.length > 0 ? (
          <section className="ui-card p-8 text-center">
            <p className="text-sm text-muted">Chọn giáo trình từ cột bên để xem các trạm học.</p>
          </section>
        ) : null}
      </section>
    </div>
    )
  }

  // ── Tab: Thống kê ─────────────────────────────────────────
  function renderStats() {
    return (
      <div className="ui-card min-w-0 p-3 sm:p-5">
      <h2 className="font-display mb-4 text-xl">Thống kê lớp học</h2>
      {!stats ? (
        <EmptyState
          title="Chưa có dữ liệu thống kê"
          description="Hãy tạo lớp học và thêm học sinh để xem thống kê tiến trình tại đây."
        />
      ) : (
        <>
          <p className="mb-4 font-bold">{stats.className} · <span className="font-mono text-sky-600">{stats.code}</span></p>
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <StatCard label="Học sinh" value={stats.studentCount} icon={<CmsUsersIcon />} />
            <StatCard label="Trạm hoàn thành" value={stats.totalCompletedQuests} icon={<CmsAnalyticsIcon />} />
            <StatCard label="Bài học đang mở" value={stats.openQuestCount} icon={<CmsLecturesIcon />} />
            <StatCard label="Sản phẩm" value={stats.projectCount} icon={<CmsCoursesIcon />} />
          </div>
          {/* Stats search + support filter */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[200px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                <Search size={17} aria-hidden="true" />
              </span>
              <input
                type="search"
                aria-label="Tìm học sinh trong thống kê"
                placeholder="Tìm học sinh..."
                value={statsSearch}
                onChange={(e) => setStatsSearch(e.target.value)}
                className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
              />
            </div>
            <select
              aria-label="Lọc học sinh cần hỗ trợ"
              className="min-h-11 w-full rounded-xl border-2 border-border bg-white px-3 text-sm font-bold sm:w-auto"
              value={statsSupportFilter}
              onChange={(e) => setStatsSupportFilter(e.target.value as '' | 'needs' | 'ok')}
            >
              <option value="">Tất cả</option>
              <option value="needs">Cần hỗ trợ</option>
              <option value="ok">Tiến triển tốt</option>
            </select>
            {(statsSearch || statsSupportFilter) && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">{filteredStatStudents.length} / {statStudents.length} học sinh</span>
            )}
            {(statsSearch || statsSupportFilter) && (
              <button type="button" className="text-xs font-bold text-muted underline" onClick={() => { setStatsSearch(''); setStatsSupportFilter('') }}>Xóa bộ lọc</button>
            )}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="border-b border-border bg-sky-50/60">
                <tr>
                  <th className="px-3 py-2 font-extrabold">Học sinh</th>
                  <th className="px-3 py-2 font-extrabold">Trạm hoàn thành</th>
                  <th className="px-3 py-2 font-extrabold">Đang học</th>
                  <th className="px-3 py-2 font-extrabold">Hoạt động gần nhất</th>
                  <th className="px-3 py-2 font-extrabold">Gợi ý hỗ trợ</th>
                </tr>
              </thead>
              <tbody>
                {statsPag.slice.map((s) => (
                  <tr key={s.id} className={cn('border-b border-border/40 transition hover:bg-gray-50/40', s.needsSupport && 'bg-sun-50/30')}>
                    <td className="px-4 py-3 font-bold">{s.nickname}</td>
                    <td className="px-4 py-3 text-center text-muted">{s.completedQuests}</td>
                    <td className="px-4 py-3">
                      <span className="block font-medium">{s.currentQuest ?? '—'}</span>
                      {s.currentPhase && <span className="text-xs text-muted">{PHASE_LABELS[s.currentPhase] ?? 'Đang thực hiện'}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatActivity(s.lastActiveAt)}</td>
                    <td className="px-4 py-3">
                      {s.needsSupport
                        ? <button type="button" className="rounded-lg border border-warning/20 bg-white px-3 py-1 text-xs font-bold text-warning shadow-sm hover:bg-warning/10" onClick={() => void viewProgress(s.id)}>Cần xem</button>
                        : <span className="px-2 text-xs font-semibold text-success">Ổn</span>}
                      {s.supportReason && <span className="mt-1 block max-w-48 text-xs text-muted">{s.supportReason}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border p-2">
            <Paginator
              page={statsPag.page} totalPages={statsPag.totalPages}
              totalItems={filteredStatStudents.length} pageSize={15}
              onPrev={statsPag.prev} onNext={statsPag.next} onGoTo={statsPag.goTo}
            />
            </div>
          </div>
        </>
      )}
    </div>
    )
  }

  // ── Tab: Nhận xét cho phụ huynh ─────────────────────────────
  function renderFeedback() {
    return (
      <div className="flex flex-col gap-4">
        <div className="ui-card border-l-4 border-l-brand-400 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Hướng dẫn</p>
          <p className="mt-1 text-sm text-muted">
            Viết nhận xét cho từng học sinh — phụ huynh sẽ thấy sau khi bạn “Gửi nhận xét”.
            Nhận xét ở trạng thái <strong>Nháp</strong> chưa hiển thị với phụ huynh.
          </p>
        </div>
        {classInfo ? (
          <TeacherFeedbackPanel
            classes={[{ id: classInfo.id ?? '', name: classInfo.name, learners: students }]}
            showToast={showToast}
          />
        ) : (
          <div className="ui-card flex flex-col items-center gap-3 p-8 text-center">
            <p className="font-display text-lg text-text">Chưa có lớp học</p>
            <p className="max-w-md text-sm text-muted">
              Tạo lớp học trước, sau đó viết nhận xét cho từng học sinh tại đây.
            </p>
            <Button variant="primary" onClick={() => navigate('/teacher/class')} className="mt-2">
              Tạo lớp học ngay
            </Button>
          </div>
        )}
      </div>
    )
  }

  const tabTitles: Record<TeacherTab, string> = {
    class: 'Lớp học & Học sinh',
    courses: 'Creator Studio · Lộ trình & Biên soạn trạm',
    lectures: 'Creator Studio · Lộ trình & Biên soạn trạm',
    stats: 'Thống kê & Phân tích học tập',
    feedback: 'AI Nhận xét & Báo cáo phụ huynh',
  }

  // Nhóm 1: Giảng Dạy & Lớp Học (AiKid Chính Thức)
  const teachingNavTabs = [
    { key: 'class', label: 'Lớp & Học sinh', path: '/teacher/class', icon: CmsUsersIcon, desc: 'Theo dõi tiến độ, Đảo Quy Tắc & hỗ trợ học sinh' },
    { key: 'stats', label: 'Thống kê', path: '/teacher/stats', icon: CmsAnalyticsIcon, desc: 'Phân tích tổng quan và dữ liệu học tập' },
    { key: 'feedback', label: 'AI Báo cáo PH', path: '/teacher/feedback', icon: CmsFeedbackIcon, desc: 'Nhận xét học tập và gửi báo cáo phụ huynh' },
  ] as const

  // Nhóm 2: Studio Sáng Tạo & Bán Khóa Học Riêng (Creator Studio)
  const creatorStudioNavTabs = [
    { key: 'courses', label: 'Lộ trình & Soạn trạm', path: '/teacher/courses', icon: CmsCoursesIcon, desc: 'Biên soạn trạm học, AI Script Studio & Canvas kéo thả' },
  ] as const

  function tabContent() {
    if (loading) return loadingEl
    if (loadError) return <ErrorPanel message={loadError} onRetry={() => void runLoad()} />
    switch (tab) {
      case 'class': return renderClass()
      case 'courses':
      case 'lectures':
        return renderCurriculumWorkspace()
      case 'stats': return renderStats()
      case 'feedback': return renderFeedback()
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-500">
            {tab === 'courses' || tab === 'lectures'
              ? 'CMS · Studio Sáng Tạo & Biên Soạn Khóa Học'
              : 'CMS · Giảng Dạy & Lớp Học (AiKid Chính Thức)'}
          </p>
          <h1 className="font-display text-2xl text-text">{tabTitles[tab]}</h1>
        </div>

        {/* Thanh tab inline trên đầu trang: Phân định rõ 2 phân hệ */}
        <nav aria-label="Điều hướng CMS Giảng viên" className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-white/95 p-1.5 shadow-2xs backdrop-blur-xs">
          {/* Nhóm 1: Giảng Dạy & Lớp Học */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-50/90 p-1 border border-border/60">
            <span className="hidden xl:inline-block px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
              🏫 Giảng Dạy
            </span>
            {teachingNavTabs.map((item) => {
              const Icon = item.icon
              const isActive = tab === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  title={item.desc}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer',
                    isActive
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'text-muted hover:bg-white hover:text-text'
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Vách ngăn phân cách giữa 2 phân hệ */}
          <div className="hidden sm:block h-6 w-px bg-border/80 my-auto" />

          {/* Nhóm 2: Studio Sáng Tạo & Bán Khóa Học Riêng (Creator Studio) */}
          <div className="flex items-center gap-1 rounded-xl bg-amber-50/70 p-1 border border-amber-200/80">
            <span className="hidden xl:inline-block px-2 text-[10px] font-black uppercase tracking-wider text-amber-700">
              🎨 Creator Studio
            </span>
            {creatorStudioNavTabs.map((item) => {
              const Icon = item.icon
              const isActive = tab === 'courses' || tab === 'lectures'
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  title={item.desc}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer',
                    isActive
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-amber-900 hover:bg-white hover:text-amber-950'
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase",
                    isActive ? "bg-white text-amber-900" : "bg-amber-200/80 text-amber-900"
                  )}>
                    Studio
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Tab content */}
      {tabContent()}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!removeTarget}
        title={`Gỡ "${removeTarget?.nickname}" khỏi lớp?`}
        description="Học sinh sẽ rời lớp. Tiến trình học không bị mất."
        confirmLabel="Gỡ"
        danger
        onConfirm={() => void removeStudent()}
        onCancel={() => setRemoveTarget(null)}
      />
      <ConfirmDialog
        open={!!archiveTarget}
        title={`Ẩn bài "${archiveTarget?.title}"?`}
        description="Học sinh sẽ không thấy bài này. Tiến trình và dữ liệu được giữ nguyên."
        confirmLabel="Ẩn bài"
        danger
        onConfirm={() => void archiveLecture()}
        onCancel={() => setArchiveTarget(null)}
      />
      <ConfirmDialog
        open={!!pendingLectureAction}
        title="Bỏ thay đổi và chuyển sang nội dung khác?"
        description="Trạm hiện tại có nội dung chưa lưu. Nếu tiếp tục, các thay đổi này sẽ bị mất."
        confirmLabel="Bỏ thay đổi"
        cancelLabel="Tiếp tục soạn"
        danger
        onConfirm={() => {
          const action = pendingLectureAction
          setPendingLectureAction(null)
          setLectureDraftDirty(false)
          action?.()
        }}
        onCancel={() => setPendingLectureAction(null)}
      />

      <AdventureModal
        open={!!courseReadiness}
        tone="guidance"
        eyebrow="Kiểm tra trước khi mở"
        title="Giáo trình còn nội dung cần hoàn thiện"
        description="Hoàn thành các mục dưới đây rồi mở lại cho học sinh. Dữ liệu được kiểm tra trực tiếp từ backend."
        showMascot={false}
        onClose={() => setCourseReadiness(null)}
        actions={<Button variant="secondary" onClick={() => setCourseReadiness(null)}>Đóng checklist</Button>}
      >
        <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1 text-left">
          {courseReadiness?.stations.map((station, index) => (
            <article key={station.id} className={cn('rounded-2xl border-2 p-4', station.ready ? 'border-mint-200 bg-mint-50' : 'border-sun-200 bg-sun-50')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Trạm {index + 1}</p>
                  <h3 className="mt-1 font-display text-lg text-text">{station.title}</h3>
                </div>
                {station.ready ? (
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-extrabold text-success">Đã đủ nội dung</span>
                ) : (
                  <button
                    type="button"
                    className="min-h-11 rounded-xl border border-brand-200 bg-white px-4 text-sm font-extrabold text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    onClick={() => {
                      const lecture = lectures.find((item) => item.id === station.id)
                      if (!lecture) return
                      setCourseReadiness(null)
                      if (isCurrentCourseRule) {
                        const stIdx = lectures.findIndex((l) => l.id === station.id)
                        openRuleDrawerForStation(stIdx >= 0 ? stIdx : 0)
                        return
                      }
                      runLectureAction(() => { setDrawerLecture(lecture); setDrawerMode('edit') })
                    }}
                  >
                    Sửa trạm này
                  </button>
                )}
              </div>
              {!station.ready && (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {station.missing.map((item) => <li key={item} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-text">Còn thiếu: {item}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      </AdventureModal>


      {/* ── CourseFormModal ──────────────────────────────────────── */}
      {courseModalMode !== 'none' && (
        <CourseFormModal
          hasExistingGatekeeper={courses.some((c) => c.id === 'aiki-rules' || c.title.toLowerCase().includes('quy tắc'))}
          course={courseModalMode === 'edit' && courseModalCourse
            ? {
                id: courseModalCourse.id,
                title: courseModalCourse.title,
                shortTitle: courseModalCourse.shortTitle ?? '',
                tagline: courseModalCourse.tagline ?? '',
                description: courseModalCourse.description ?? '',
                productLabel: courseModalCourse.productLabel ?? '',
                ageTrack: courseModalCourse.ageTrack ?? '',
                courseKey: courseModalCourse.courseKey ?? '',
                durationLabel: courseModalCourse.durationLabel ?? '',
                skillsText: (courseModalCourse.skills ?? []).join('\n'),
                outcomesText: (courseModalCourse.outcomes ?? []).join('\n'),
                credential: courseModalCourse.credential ?? '',
                finalAssessment: courseModalCourse.finalAssessment ?? '',
              }
            : null
          }
          onSaved={(newCourseId) => {
            void loadLectures()
            if (newCourseId) setSelectedCourseId(newCourseId)
          }}
          onClose={() => { setCourseModalMode('none'); setCourseModalCourse(null) }}
        />
      )}

      {/* ── Rule Picker Modal (Chọn 1 trong 10 Quy Tắc để soạn) ────────── */}
      {showRulePickerModal && (
        <AdventureModal
          open={showRulePickerModal}
          title="🛡️ Chọn Quy Tắc Vàng để biên soạn (10 Quy Tắc AIKid)"
          onClose={() => setShowRulePickerModal(false)}
        >
          <div className="space-y-3 p-1">
            <p className="text-xs text-slate-600 font-medium">
              Chọn quy tắc cần cập nhật video bài giảng, kịch bản đọc của AKI, poster hoặc bộ câu hỏi ôn tập 2 câu:
            </p>
            <div className="grid gap-2 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
              {AIKI_RULES_DATA.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setShowRulePickerModal(false)
                    setSelectedRuleForDrawer(r)
                  }}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-amber-400 hover:bg-amber-50/60 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 font-black text-xs text-amber-900">
                    {r.id}
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-700">{r.code}</span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{r.shortTitle}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{r.goal}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </AdventureModal>
      )}

      {/* ── RuleAuthoringDrawer ──────────────────────────────────── */}
      <RuleAuthoringDrawer
        rule={selectedRuleForDrawer}
        isOpen={!!selectedRuleForDrawer}
        onClose={() => setSelectedRuleForDrawer(null)}
        onSave={(updatedRule) => {
          showToast(`✅ Đã lưu Quy tắc ${updatedRule.id}: ${updatedRule.shortTitle}`, 'success')
        }}
      />

      {/* ── ScriptCourseGeneratorModal ───────────────────────────── */}
      <ScriptCourseGeneratorModal
        isOpen={showScriptModal}
        onClose={() => setShowScriptModal(false)}
        onApplyGeneratedCourse={handleApplyGeneratedCourse}
      />
    </div>
  )
}
