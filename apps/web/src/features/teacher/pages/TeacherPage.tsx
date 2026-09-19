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
import { useEffect, useState, useCallback, useMemo, useRef, type ReactNode, Suspense, lazy } from 'react'
import { Search, AlertCircle, RefreshCw, Puzzle, ListOrdered, Sparkles, Plus, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, Target, Columns2, Image, BookOpen } from 'lucide-react'

import { FeatureBlockHoverPreview } from '../components/FeatureBlockHoverPreview'
import type { FeatureBlockItem } from '../types'
export type { FeatureBlockItem }

export const FEATURE_BLOCKS_CATEGORIES: Array<{
  category: string
  icon: string
  items: FeatureBlockItem[]
}> = [
  {
    category: 'Bố Cục & Cột Nội Dung',
    icon: '📐',
    items: [
      { id: 'layout-text', name: '1 Cột Văn Bản (Full Width)', icon: '📖', desc: 'Văn bản lớn ở giữa màn hình hoặc toàn chiều rộng', color: 'border-slate-200 bg-slate-50/80 text-slate-950' },
      { id: 'layout-split', name: '2 Cột: 1 Ảnh + 1 Chữ (50/50)', icon: '📰', desc: 'Chữ bên trái, ảnh bên phải', badge: 'Chuẩn', color: 'border-blue-200 bg-blue-50/80 text-blue-950' },
      { id: 'layout-two-text', name: '2 Cột: 2 Văn Bản Song Song', icon: '📄', desc: 'Hai cột văn bản song song không kèm ảnh', badge: '2 Cột', color: 'border-sky-200 bg-sky-50/80 text-sky-950' },
      { id: 'layout-grid', name: '3 Cột: Lưới 3 Ô Thẻ (Grid 3)', icon: '🍱', desc: 'Phân loại ví dụ hoặc 3 ý tưởng', color: 'border-purple-200 bg-purple-50/80 text-purple-950' },
      { id: 'layout-four-keys', name: '1 Ảnh + 4 Thẻ Chìa Khóa / Đặc Điểm', icon: '🔑', desc: 'Bộ 4 chìa khóa: Cái gì · Trông thế nào · Làm gì · Ở đâu', badge: 'Trọng tâm', color: 'border-amber-200 bg-gradient-to-r from-sky-50 via-amber-50 to-rose-50 text-slate-950' },
      { id: 'practice-workflow', name: 'Quy Trình 4 Bước Thao Tác', icon: '🪜', desc: 'Bốn bước thao tác có thể sắp xếp', badge: 'Thực hành', color: 'border-mint-200 bg-mint-50/80 text-mint-950' },
    ],
  },
  {
    category: 'Hình Ảnh & Đa Phương Tiện',
    icon: '🖼️',
    items: [
      { id: 'versus-ab', name: '2 Ảnh Đối Đầu A/B (So Sánh Tranh)', icon: '🖼️', desc: 'Chọn tranh đúng sai, đối kháng A/B', badge: 'Hot', color: 'border-amber-200 bg-amber-50/80 text-amber-950' },
      { id: 'images', name: 'Bộ Sưu Tập Ảnh (Gallery)', icon: '📸', desc: 'Minh họa đa ảnh kèm chú thích chi tiết', color: 'border-teal-200 bg-teal-50/80 text-teal-950' },
      { id: 'video', name: 'Video Bài Giảng', icon: '🎬', desc: 'Video MP4 / YouTube tự phát có mốc tua', color: 'border-indigo-200 bg-indigo-50/80 text-indigo-950' },
      { id: 'voice', name: 'Giọng Đọc Mèo AIKI & Lipsync', icon: '🎙️', desc: 'Mèo AIKI đọc bài với cử chỉ ngộ nghĩnh', color: 'border-rose-200 bg-rose-50/80 text-rose-950' },
    ],
  },
  {
    category: 'Khối Tương Tác & Sư Phạm',
    icon: '💡',
    items: [
      { id: 'layout-callout', name: 'Hộp Ghi Nhớ Nổi Bật (Callout)', icon: '💡', desc: 'Khung bo cong nhấn mạnh thông điệp, mẹo học', badge: 'Mẹo', color: 'border-amber-200 bg-amber-50/80 text-amber-950' },
      { id: 'compare', name: 'Bảng So Sánh 2 Cột (AI vs Con Người)', icon: '⚖️', desc: 'Đối chiếu AI vs Bộ não sáng tạo của con', color: 'border-purple-200 bg-purple-50/80 text-purple-950' },
      { id: 'dialogue', name: 'Kịch Bản Comic Phân Vai', icon: '💬', desc: 'Hội thoại bong bóng Zico / Sonet / AIKI', badge: 'Mới', color: 'border-sky-200 bg-sky-50/80 text-sky-950' },
      { id: 'layout-formula', name: 'Công Thức KaTeX', icon: '🔤', desc: 'Toán học & tư duy công thức trực quan', color: 'border-indigo-200 bg-indigo-50/80 text-indigo-950' },
      { id: 'poster', name: 'Poster Quy Tắc Vàng', icon: '📜', desc: 'Banner quy tắc to bản phong cách cuộn giấy', color: 'border-emerald-200 bg-emerald-50/80 text-emerald-950' },
      { id: 'layout-confirm-option', name: 'Thẻ Phương Án Trả Lời (A/B/C)', icon: '🔘', desc: 'Phương án trả lời câu hỏi: Ảnh đơn hoặc Text + Ảnh', badge: 'Khóa học', color: 'border-emerald-200 bg-emerald-50/80 text-emerald-950' },
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
import { CourseFormModal } from '../components/CourseFormModal'
import { TeacherFeedbackPanel } from '../components/TeacherFeedbackPanel'
import { CourseVisualRoadmap } from '../components/CourseVisualRoadmap'
import { CurriculumBreadcrumbs, type CurriculumLevel } from '../components/CurriculumBreadcrumbs'
import { CurriculumProgramList } from '../components/CurriculumProgramList'
import { CurriculumRegionList } from '../components/CurriculumRegionList'
import { ClassManagementConsole } from '../components/ClassManagementConsole'

// Lazy-loaded heavy authoring components (Code Splitting)
const LectureDrawer = lazy(() =>
  import('../components/LectureDrawer').then((m) => ({ default: m.LectureDrawer }))
)
const ScriptCourseGeneratorModal = lazy(() =>
  import('../components/ScriptCourseGeneratorModal').then((m) => ({ default: m.ScriptCourseGeneratorModal }))
)
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
  curriculumKey?: string
  regionOrder?: number
  slug?: string
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
  badgeRewardId?: string
  issuerTitle?: string
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
    curriculumKey: typeof source.curriculumKey === 'string' ? source.curriculumKey : undefined,
    regionOrder: typeof source.regionOrder === 'number' ? source.regionOrder : undefined,
    slug: typeof source.slug === 'string' ? source.slug : undefined,
    lectures: Array.isArray(source.lectures)
      ? source.lectures.filter((lecture): lecture is Lecture => Boolean(lecture && typeof lecture === 'object' && typeof lecture.id === 'string'))
      : [],
  }
}

const LEGACY_3_REGIONS_SLUGS = new Set(['thung-lung-ai', 'dao-ke-chuyen', 'day-nui-sang-tao'])

function getRegionSortKey(r: CourseLectures): number {
  const t = (r.title || '').toLowerCase()
  const k = (r.courseKey || r.id || r.slug || '').toLowerCase()
  if (t.includes('mười quy tắc') || t.includes('10 quy tắc') || k.includes('rules') || k.includes('quy-tac')) return 0
  if (t.includes('module 1') || t.includes('thám hiểm') || k.includes('island-1') || k.includes('tham-hiem')) return 1
  if (t.includes('module 2') || t.includes('hoạ sĩ') || t.includes('hoa si') || k.includes('island-2') || k.includes('hoa-si')) return 2
  if (t.includes('module 3') || t.includes('nhân vật') || t.includes('nhan vat') || k.includes('island-3') || k.includes('nhan-vat')) return 3
  if (t.includes('module 4') || t.includes('truyện tranh') || t.includes('truyen tranh') || k.includes('island-4') || k.includes('truyen-tranh')) return 4
  if (t.includes('module 5') || t.includes('trò chơi') || t.includes('tro choi') || k.includes('island-5') || k.includes('tro-choi')) return 5
  if (typeof r.regionOrder === 'number') return r.regionOrder
  return 999
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

        const isFoundationProgram =
          source.id === 'aikids-ai-foundation' ||
          (typeof source.title === 'string' && source.title.includes('Nền tảng AI Kids'))

        if (isFoundationProgram) {
          const activeRegions: CourseLectures[] = []
          const legacyRegions: CourseLectures[] = []

          for (const region of regions) {
            const slug = region.slug || region.courseKey || region.id || ''
            const isLegacy =
              LEGACY_3_REGIONS_SLUGS.has(slug) ||
              region.curriculumKey === 'aikids-3-regions-v1' ||
              (typeof region.title === 'string' &&
                (region.title.includes('Thung lũng AI') ||
                  region.title.includes('Đảo kể chuyện') ||
                  region.title.includes('Dãy núi sáng tạo')))

            if (isLegacy) {
              legacyRegions.push(region)
            } else {
              activeRegions.push(region)
            }
          }

          activeRegions.sort((a, b) => getRegionSortKey(a) - getRegionSortKey(b))

          const mainProgram: LearningProgram = {
            ...source,
            id: source.id,
            title: typeof source.title === 'string' && source.title.trim() ? source.title : 'Nền tảng AI Kids',
            description: typeof source.description === 'string' ? source.description : '',
            source: source.source === 'workspace' || source.source === 'creator_marketplace' ? source.source : 'aikid_official',
            unlockMode: source.unlockMode === 'parallel' ? 'parallel' : 'sequential',
            readOnly: Boolean(source.readOnly),
            regions: activeRegions,
          }

          const result: LearningProgram[] = [mainProgram]

          if (legacyRegions.length > 0) {
            const legacyProgram: LearningProgram = {
              id: 'aikids-legacy-archive',
              title: 'Chương trình Cũ (Lưu trữ)',
              description: 'Các khoá học và trạm kiến thức phiên bản cũ được lưu trữ.',
              source: 'aikid_official',
              unlockMode: 'parallel',
              readOnly: true,
              regions: legacyRegions,
            }
            result.push(legacyProgram)
          }

          return result
        }

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

const MINI_RAIL_CATEGORIES: Array<{
  name: string
  icon: typeof Columns2
  color: string
  short: string
  alias?: string
}> = [
  { name: 'Bố Cục & Cột Nội Dung', icon: Columns2, color: 'text-sky-600', short: 'Bố cục' },
  { name: 'Hình Ảnh & Đa Phương Tiện', icon: Image, color: 'text-purple-600', short: 'Media' },
  { name: 'Khối Tương Tác & Sư Phạm', icon: Sparkles, color: 'text-amber-600', short: 'Tương tác' },
]

function getCategorySvgIcon(categoryName: string, size = 14) {
  switch (categoryName) {
    case 'Bố Cục & Cột Nội Dung':
      return <Columns2 size={size} className="text-sky-600" />
    case 'Hình Ảnh & Đa Phương Tiện':
      return <Image size={size} className="text-purple-600" />
    case 'Khối Tương Tác & Sư Phạm':
      return <Sparkles size={size} className="text-amber-600" />
    default:
      return <Sparkles size={size} className="text-brand-600" />
  }
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

  const coursesRef = useRef(courses)
  coursesRef.current = courses
  const studentsRef = useRef(students)
  studentsRef.current = students
  const statsRef = useRef(stats)
  statsRef.current = stats

  // ── Drawer / Modal state ──────────────────────────────────
  // WHY: Dùng drawer thay vì form inline để giáo viên thấy danh sách trong khi edit
  const [drawerMode, setDrawerMode] = useState<'none' | 'create' | 'edit'>('none')
  const [drawerLecture, setDrawerLecture] = useState<Lecture | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aikids_teacher_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('aikids_teacher_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }
  const [lectureDraftDirty, setLectureDraftDirty] = useState(false)
  const [pendingLectureAction, setPendingLectureAction] = useState<(() => void) | null>(null)
  const [courseModalMode, setCourseModalMode] = useState<'none' | 'create' | 'edit'>('none')
  const [courseModalCourse, setCourseModalCourse] = useState<CourseLectures | null>(null)
  const [courseReadiness, setCourseReadiness] = useState<CourseReadiness | null>(null)
  const [checkingCourse, setCheckingCourse] = useState(false)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Bố Cục & Cột Nội Dung': true,
    'Hình Ảnh & Đa Phương Tiện': true,
    'Khối Tương Tác & Sư Phạm': true,
  })
  const toggleCategory = useCallback((catName: string) => {
    setOpenCategories((prev) => ({ ...prev, [catName]: !prev[catName] }))
  }, [])
  const [hoveredBlock, setHoveredBlock] = useState<{ item: FeatureBlockItem; rect: DOMRect; category?: string } | null>(null)

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
    ?? programs.flatMap((p) => p.regions).find((r) => r.id === selectedCourseId)
  const editableCourses = courses.filter((course) => !course.readOnly)
  const referenceCourses = courses.filter((course) => course.readOnly)
  const lectures = activeCourse?.lectures ?? []
  const isCurrentCourseRule = isAikiRulesCourse(activeCourse)

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
      setSelectedProgramId(requestedProgram.id)
      const requestedCourse = data.courses.find((course) => course.id === requestedCourseId)
        ?? requestedProgram.regions.find((r) => r.id === requestedCourseId)

      if (requestedCourseId && requestedCourse) {
        setSelectedCourseId(requestedCourse.id)
        if (!requestedProgramId) {
          const nextProgramId = requestedProgram.id
          const nextCourseId = requestedCourse.id
          setSearchParams({ programId: nextProgramId, courseId: nextCourseId }, { replace: true })
        }
      } else {
        setSelectedCourseId('')
      }
      return
    }

    // Tôn trọng triệt để learningSpaceFilter hiện tại, KHÔNG fallback reset về aikid_official
    const currentSpace = learningSpaceFilterRef.current
    const spacePrograms = allPrograms.filter((p) => p.source === currentSpace)

    if (selectedProgramId && spacePrograms.some((p) => p.id === selectedProgramId)) {
      const prog = spacePrograms.find((p) => p.id === selectedProgramId)
      if (selectedCourseId && !prog?.regions.some((r) => r.id === selectedCourseId)) {
        setSelectedCourseId('')
        setSearchParams({ programId: selectedProgramId }, { replace: true })
      }
    } else {
      setSelectedProgramId('')
      setSelectedCourseId('')
      if (requestedProgramId || requestedCourseId) {
        setSearchParams({}, { replace: true })
      }
    }
  }, [searchParams, setSearchParams, selectedProgramId, selectedCourseId])

  const loadStats = useCallback(async () => {
    const data = await api<{ stats: ClassStats | null }>('/api/teacher/class/stats')
    setStats(data.stats)
  }, [])

  const runLoad = useCallback(async () => {
    // SWR (Stale-While-Revalidate): Nếu đã có dữ liệu trước đó, không set loading = true gây giật màn hình
    const hasExistingData = (tab === 'class' || tab === 'feedback')
      ? studentsRef.current.length > 0
      : tab === 'stats'
        ? statsRef.current !== null
        : coursesRef.current.length > 0

    if (!hasExistingData) {
      setLoading(true)
    }
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
    return <ClassManagementConsole canManageClass={canManageClass} />
  }

  const handleSelectProgram = (programId: string) => {
    runLectureAction(() => {
      setSelectedProgramId(programId)
      setSelectedCourseId('')
      setSearchParams({ programId }, { replace: true })
      closeLectureEditor()
    })
  }

  const focusedProgram = useMemo(() => {
    if (!selectedProgramId) return null
    return programs.find((program) => program.id === selectedProgramId) ?? null
  }, [programs, selectedProgramId])

  const handleSelectRegion = (regionId: string) => {
    runLectureAction(() => {
      setSelectedCourseId(regionId)
      const progId = selectedProgramId || focusedProgram?.id || ''
      if (progId) {
        setSearchParams({ programId: progId, courseId: regionId }, { replace: true })
      } else {
        setSearchParams({ courseId: regionId }, { replace: true })
      }
      closeLectureEditor()
    })
  }

  const handleOpenRuleCourse = useCallback(() => {
    const ruleCourse = courses.find((c) => isAikiRulesCourse(c))
      || programs.flatMap((p) => p.regions).find((r) => isAikiRulesCourse(r))
    if (!ruleCourse) return
    const parentProg = programs.find((p) => p.regions.some((r) => r.id === ruleCourse.id))
    runLectureAction(() => {
      if (parentProg) {
        setSelectedProgramId(parentProg.id)
        setLearningSpaceFilter(parentProg.source)
        learningSpaceFilterRef.current = parentProg.source
        setSelectedCourseId(ruleCourse.id)
        setSearchParams({ programId: parentProg.id, courseId: ruleCourse.id }, { replace: true })
      } else {
        setSelectedCourseId(ruleCourse.id)
        setSearchParams({ courseId: ruleCourse.id }, { replace: true })
      }
      closeLectureEditor()
    })
  }, [courses, programs, runLectureAction, closeLectureEditor, setSearchParams])

  const currentLevel = useMemo<CurriculumLevel>(() => {
    if (drawerMode !== 'none' && selectedCourseId) return 4
    if (selectedProgramId && selectedCourseId) return 3
    if (selectedProgramId) return 2
    return 1
  }, [drawerMode, selectedCourseId, selectedProgramId])

  const handleNavigateLevel = (targetLevel: 1 | 2 | 3) => {
    runLectureAction(() => {
      closeLectureEditor()
      if (targetLevel === 1) {
        setSelectedProgramId('')
        setSelectedCourseId('')
        setSearchParams({}, { replace: true })
      } else if (targetLevel === 2) {
        setSelectedCourseId('')
        if (selectedProgramId) {
          setSearchParams({ programId: selectedProgramId }, { replace: true })
        }
      }
    })
  }

  const handleBackLevel = () => {
    if (currentLevel === 4) {
      runLectureAction(closeLectureEditor)
    } else if (currentLevel === 3) {
      runLectureAction(() => {
        setSelectedCourseId('')
        if (selectedProgramId) {
          setSearchParams({ programId: selectedProgramId }, { replace: true })
        } else {
          setSearchParams({}, { replace: true })
        }
      })
    } else if (currentLevel === 2) {
      runLectureAction(() => {
        setSelectedProgramId('')
        setSelectedCourseId('')
        setSearchParams({}, { replace: true })
      })
    }
  }

  // ── Tab: Lộ trình & Trạm học (Mô hình 4 Cấp độ Độc Lập) ────
  function renderCurriculumWorkspace() {
    return (
      <div className="flex flex-col gap-5">
        {/* Thanh Breadcrumbs điều hướng 4 cấp độ thông minh */}
        <CurriculumBreadcrumbs
          currentLevel={currentLevel}
          programTitle={focusedProgram?.title}
          regionTitle={activeCourse?.shortTitle || activeCourse?.title}
          stationTitle={drawerLecture?.title}
          onBack={handleBackLevel}
          onNavigateLevel={handleNavigateLevel}
        />

        {/* CẤP 1: Chương trình học & Không gian học tập */}
        {currentLevel === 1 && (
          <CurriculumProgramList
            programs={programs}
            selectedSpace={learningSpaceFilter}
            onSelectSpace={(space) => {
              setLearningSpaceFilter(space)
              learningSpaceFilterRef.current = space
            }}
            onSelectProgram={handleSelectProgram}
            onOpenCreateProgram={() => {
              setCourseModalMode('create')
              setCourseModalCourse(null)
            }}
            onOpenScriptGenerator={() => setShowScriptModal(true)}
            onOpenRulePicker={handleOpenRuleCourse}
          />
        )}

        {/* CẤP 2: Quản lý Vùng học / Học phần */}
        {currentLevel === 2 && focusedProgram && (
          <CurriculumRegionList
            program={focusedProgram}
            onSelectRegion={handleSelectRegion}
            onEditRegion={(region) => {
              setCourseModalMode('edit')
              setCourseModalCourse(region)
            }}
            onOpenCreateRegion={() => {
              setCourseModalMode('create')
              setCourseModalCourse(null)
            }}
            onOpenScriptGenerator={() => setShowScriptModal(true)}
            onBackToPrograms={() => handleNavigateLevel(1)}
          />
        )}

        {/* CẤP 3: Bản đồ Trạm học (Station Roadmap) */}
        {currentLevel === 3 && activeCourse && (
          <div className="flex flex-col gap-5">
            {/* Header tóm tắt Vùng đang chọn */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 text-xs font-black text-white shadow-2xs">
                  3
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base font-black text-slate-900">
                      {activeCourse.shortTitle || activeCourse.title}
                    </h3>
                    <StatusBadge status={activeCourse.status} />
                  </div>
                  <p className="text-xs text-muted font-bold mt-0.5">
                    {focusedProgram ? `${focusedProgram.title} · ` : ''}
                    {lectures.filter((l) => !l.archived).length} trạm học đang hoạt động
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!activeCourse.readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseModalMode('edit')
                      setCourseModalCourse(activeCourse)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                  >
                    <span>✏️ Sửa thông tin vùng</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dải cuộn nhanh các Vùng thuộc cùng chương trình */}
            {focusedProgram && focusedProgram.regions.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                <span className="text-[11px] font-black text-slate-500 whitespace-nowrap pl-1">
                  Đổi vùng nhanh:
                </span>
                {focusedProgram.regions.map((region, rIdx) => {
                  const isSelected = region.id === selectedCourseId
                  const stationCount = region.lectures.filter((l) => !l.archived).length
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => handleSelectRegion(region.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap border',
                        isSelected
                          ? 'border-emerald-500 bg-emerald-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
                      )}
                    >
                      <span>Vùng {rIdx + 1}: {region.shortTitle || region.title}</span>
                      <span className={cn('rounded-full px-1.5 py-0.2 text-[10px] font-black', isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600')}>
                        {stationCount}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Banner Đảo Tiên Quyết Quy Tắc Vàng nếu là khóa học quy tắc */}
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
                      Vùng 1 cửa ngõ bắt buộc. Bấm vào từng trạm bên dưới để mở Focus Studio biên soạn trạm quy tắc.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <CourseVisualRoadmap
              courseTitle={activeCourse.shortTitle || activeCourse.title}
              courseDescription={activeCourse.description}
              stations={lectures}
              readOnly={!!activeCourse.readOnly}
              onSelectStation={(stationId) => {
                const target = lectures.find((l) => l.id === stationId)
                if (target) {
                  runLectureAction(() => {
                    setDrawerMode('edit')
                    setDrawerLecture(target)
                  })
                }
              }}
              onAddStation={() => {
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
        )}

        {/* CẤP 4: Focus Studio Soạn Trạm (Áp dụng Lazy Loading LectureDrawer) */}
        {currentLevel === 4 && selectedCourseId && (
          <div className={cn("grid items-start gap-4 transition-all duration-300", isSidebarCollapsed ? "md:grid-cols-[56px_minmax(0,1fr)]" : "md:grid-cols-[320px_minmax(0,1fr)]")}>
            {/* Sidebar Trái: Khối tính năng */}
            <aside className={cn("shrink-0 sticky top-20 h-[calc(100vh-6rem)] flex flex-col rounded-3xl border-2 border-brand-200/80 bg-white/95 shadow-clay-xs backdrop-blur-xs overflow-hidden transition-all duration-300", isSidebarCollapsed ? "w-14 max-w-[56px]" : "w-full max-w-[320px]")} aria-label="Thanh công cụ Focus Studio">
              {isSidebarCollapsed ? (
                <div className="flex flex-col items-center py-3 gap-2.5 h-full bg-brand-50/50">
                  <button
                    type="button"
                    onClick={toggleSidebarCollapsed}
                    className="p-2 rounded-xl bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 shadow-2xs transition cursor-pointer"
                    title="Mở rộng menu Khối Tính Năng"
                    aria-label="Mở rộng menu Khối Tính Năng"
                  >
                    <PanelLeftOpen size={16} />
                  </button>
                  <div className="w-8 h-px bg-border/80 my-0.5" />
                  <div className="flex flex-col items-center gap-2 w-full px-1">
                    {MINI_RAIL_CATEGORIES.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => {
                            setOpenCategories((prev) => ({
                              ...prev,
                              [cat.name]: true,
                              ...(cat.alias ? { [cat.alias]: true } : {}),
                            }))
                            setIsSidebarCollapsed(false)
                          }}
                          className="group relative flex size-9 items-center justify-center rounded-xl bg-white border border-border/80 shadow-2xs hover:border-brand-300 hover:bg-brand-50/80 hover:scale-105 transition cursor-pointer"
                          title={`${cat.name} (Click để mở rộng)`}
                          aria-label={cat.name}
                        >
                          <Icon size={16} className={cn(cat.color, "transition group-hover:scale-110")} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b border-border bg-brand-50/60 px-3.5 py-2.5 shrink-0 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="grid size-7 place-items-center rounded-lg bg-brand-600 text-white shadow-2xs shrink-0">
                        <Puzzle size={15} />
                      </span>
                      <h3 className="font-extrabold text-xs text-brand-950 truncate tracking-wide">
                        🧩 Khối Tính Năng
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={toggleSidebarCollapsed}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-brand-800 hover:bg-white border border-transparent hover:border-border transition cursor-pointer shrink-0 shadow-2xs"
                      title="Thu gọn menu khối tính năng"
                      aria-label="Thu gọn menu khối tính năng"
                    >
                      <PanelLeftClose size={16} />
                    </button>
                  </div>

                  {/* Thư viện khối tính năng kéo thả */}
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-2.5 p-2 custom-scrollbar" aria-label="Thư viện khối tính năng">
                  <div className="rounded-lg border border-brand-200 bg-brand-50/70 p-2 text-xs text-brand-900 shadow-2xs shrink-0">
                    <p className="font-extrabold flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-900">
                      <Sparkles size={11} className="text-brand-600" />
                      Kéo thả khối nội dung
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-brand-800">
                      Kéo thẻ hoặc click <strong>+ Thêm</strong> để chèn vào chặng.
                    </p>
                  </div>

                  {FEATURE_BLOCKS_CATEGORIES.map((category) => {
                    const isOpen = openCategories[category.category] ?? true
                    const visibleItems = category.items
                    return (
                      <div key={category.category} className="rounded-xl border border-border/80 bg-white/80 overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.category)}
                          className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-left bg-slate-50 hover:bg-slate-100/90 transition cursor-pointer border-b border-border/40"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="shrink-0">{getCategorySvgIcon(category.category, 14)}</span>
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
                          <div className="p-1.5 flex flex-col gap-1.5 bg-slate-50/40">
                            {visibleItems.map((item) => (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => {
                                  setHoveredBlock(null)
                                  e.dataTransfer.setData('text/plain', item.id)
                                  e.dataTransfer.effectAllowed = 'copy'
                                }}
                                onMouseEnter={(e) => {
                                  setHoveredBlock({
                                    item,
                                    rect: e.currentTarget.getBoundingClientRect(),
                                    category: category.category,
                                  })
                                }}
                                onMouseLeave={() => setHoveredBlock(null)}
                                className={cn(
                                  "group min-h-[46px] py-1.5 px-2.5 rounded-xl border flex items-center justify-between gap-2 hover:shadow-xs transition cursor-grab active:cursor-grabbing hover:scale-[1.01]",
                                  item.color
                                )}
                                title={`Kéo thả hoặc click + Thêm: ${item.name} (${item.desc})`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-base shrink-0">{item.icon}</span>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs font-black leading-snug break-words line-clamp-2">
                                      {item.name}
                                    </span>
                                    {item.badge && (
                                      <span className="w-fit mt-0.5 rounded bg-white/90 border border-current px-1 py-0 text-[8px] font-black uppercase tracking-wider">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.dispatchEvent(
                                      new CustomEvent('aikids:add-feature-block', { detail: { blockId: item.id } })
                                    )
                                  }}
                                  className="shrink-0 flex items-center gap-0.5 rounded-lg bg-white/90 hover:bg-white border border-current px-2 py-1 text-[10px] font-black shadow-2xs transition active:scale-95 cursor-pointer"
                                  title={`Thêm ${item.name} vào chặng`}
                                >
                                  <Plus size={11} />
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

              {/* Card xem trước bố cục mini và hướng dẫn sư phạm khi hover vào khối tính năng */}
              <FeatureBlockHoverPreview
                block={hoveredBlock?.item ?? null}
                anchorRect={hoveredBlock?.rect ?? null}
                categoryName={hoveredBlock?.category}
              />
            </>
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

              {/* LectureDrawer with Suspense lazy loading */}
              <Suspense
                fallback={
                  <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-white p-8">
                    <RefreshCw className="animate-spin text-brand-500" size={32} />
                    <p className="text-xs font-bold text-muted">Đang mở Focus Studio soạn trạm...</p>
                  </div>
                }
              >
                <LectureDrawer
                  key={selectedCourseId ? `${selectedCourseId}-${drawerMode}` : '__drawer__'}
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
                    // Course lessons always use the 6-stage learning journey.
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
                  } : null}
                  onSaved={() => void loadLectures()}
                  onClose={closeLectureEditor}
                />
              </Suspense>
            </main>
          </div>
        )}
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
    courses: 'CMS · XƯỞNG SOẠN THẢO TRẠM HỌC (Quests & Blocks)',
    lectures: 'CMS · XƯỞNG SOẠN THẢO TRẠM HỌC (Quests & Blocks)',
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
    { key: 'courses', label: 'Xưởng Soạn Trạm Học', path: '/teacher/courses', icon: CmsLecturesIcon, desc: 'Biên soạn trạm học, AI Script Studio & Canvas kéo thả' },
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

  const isCurriculumWorkspace = tab === 'courses' || tab === 'lectures'

  return (
    <div className="flex flex-col gap-5">
      {/* Page header: Hallmark Soft-Clay Hero Banner */}
      <header className="rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-xs font-black text-sky-700">
              <BookOpen size={13} /> {isCurriculumWorkspace ? 'XƯỞNG SOẠN THẢO BÀI GIẢNG 3 CẤP' : 'KHÔNG GIAN GIẢNG VIÊN & LỚP HỌC'}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {tabTitles[tab] || 'Studio'}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-text tracking-tight">
            {isCurriculumWorkspace
              ? 'Xưởng Soạn Thảo Trạm Học (Quests & Blocks)'
              : tabTitles[tab]}
          </h1>
          <p className="text-xs text-muted max-w-2xl">
            {isCurriculumWorkspace
              ? 'Biên soạn nội dung bài giảng, kịch bản trạm học tương tác và kiểm duyệt chất lượng bài học AIKids.'
              : 'Theo dõi tình hình học tập, quản lý học sinh, giao bài tập và đồng hành cùng phụ huynh.'}
          </p>
        </div>

        {/* Thanh điều hướng Header: Phân định rạch ròi 2 phân hệ độc lập */}
        <nav aria-label="Điều hướng CMS Giảng viên" className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-white/95 p-1.5 shadow-2xs backdrop-blur-xs">
          {isCurriculumWorkspace ? (
            /* Phân hệ 1: Studio Biên Soạn — Chỉ phục vụ tạo bài giảng, lộ trình & trạm học */
            <div className="flex items-center gap-1.5 flex-wrap rounded-xl bg-amber-50/70 p-1 border border-amber-200/80">
              <button
                type="button"
                onClick={() => {
                  setCourseModalMode('create')
                  setCourseModalCourse(null)
                }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer bg-white text-amber-900 border border-amber-200 hover:bg-amber-100 shadow-2xs"
              >
                <span>+ Tạo Khóa Học Mới</span>
              </button>
              <button
                type="button"
                onClick={() => setShowScriptModal(true)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer bg-amber-500 text-white shadow-2xs hover:bg-amber-600"
              >
                <span>✨ AI Tạo Kịch Bản</span>
              </button>
              <button
                type="button"
                onClick={handleOpenRuleCourse}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer bg-white text-amber-900 border border-amber-200 hover:bg-amber-100 shadow-2xs"
              >
                <span>📜 10 Quy Tắc Vàng</span>
              </button>
              <div className="hidden sm:block h-6 w-px bg-amber-200/80 mx-1" />
              <button
                type="button"
                onClick={() => navigate('/teacher/class')}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-amber-900 hover:bg-white/80 hover:text-amber-950"
                title="Chuyển sang phân hệ Quản lý Lớp học & Học sinh"
              >
                <span>🏫 Sang Quản lý Lớp học</span>
              </button>
            </div>
          ) : (
            /* Phân hệ 2: Quản Lý Lớp Học & Học Sinh — Chuyên theo dõi tiến độ, thống kê, báo cáo phụ huynh */
            <div className="flex items-center gap-1 flex-wrap rounded-xl bg-slate-50/90 p-1 border border-border/60">
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
              <div className="hidden sm:block h-6 w-px bg-border/80 mx-1" />
              <button
                type="button"
                onClick={() => navigate('/teacher/courses')}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-brand-700 hover:bg-brand-50 hover:text-brand-900"
                title="Chuyển sang phân hệ Studio Biên Soạn Bài Giảng"
              >
                <span>🎨 Sang Studio Biên Soạn</span>
              </button>
            </div>
          )}
        </nav>
      </header>

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
                badgeRewardId: (courseModalCourse as any)?.badgeRewardId ?? 'badge-title-explorer',
                issuerTitle: (courseModalCourse as any)?.issuerTitle ?? 'AI Kids Creator Academy',
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

      {/* ── ScriptCourseGeneratorModal (Lazy) ────────────────────── */}
      {showScriptModal && (
        <Suspense fallback={null}>
          <ScriptCourseGeneratorModal
            isOpen={showScriptModal}
            onClose={() => setShowScriptModal(false)}
            onApplyGeneratedCourse={handleApplyGeneratedCourse}
          />
        </Suspense>
      )}
    </div>
  )
}
