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
import { useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { Search, AlertCircle, RefreshCw } from 'lucide-react'
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
import { TeacherFeedbackPanel } from '../components/TeacherFeedbackPanel'
import {
  PRACTICE_OPTIONS,
  serializeLectureGameConfig,
} from '../lib/authoring'
import {
  CmsAnalyticsIcon,
  CmsCoursesIcon,
  CmsLecturesIcon,
  CmsUsersIcon,
} from '@/shared/components/icons/CmsIcons'

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

export type TeacherTab = 'class' | 'courses' | 'lectures' | 'stats'

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
  return (
    <div className="ui-card flex flex-col items-center gap-4 p-8 text-center" role="alert">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
        <AlertCircle size={28} className="text-danger" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-lg text-text">Không tải được dữ liệu</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{message}</p>
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
  const [lectureDraftDirty, setLectureDraftDirty] = useState(false)
  const [pendingLectureAction, setPendingLectureAction] = useState<(() => void) | null>(null)
  const [courseModalMode, setCourseModalMode] = useState<'none' | 'create' | 'edit'>('none')
  const [courseModalCourse, setCourseModalCourse] = useState<CourseLectures | null>(null)
  const [courseReadiness, setCourseReadiness] = useState<CourseReadiness | null>(null)
  const [checkingCourse, setCheckingCourse] = useState(false)

  // ── UI state ──────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ── Search / filter state ──────────────────────────────────
  const [studentSearch, setStudentSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [learningSpaceFilter, setLearningSpaceFilter] = useState<LearningProgram['source']>('aikid_official')
  const [lectureSearch, setLectureSearch] = useState('')
  const [lectureArchiveFilter, setLectureArchiveFilter] = useState<'' | 'active' | 'archived'>('')
  const [statsSearch, setStatsSearch] = useState('')
  const [statsSupportFilter, setStatsSupportFilter] = useState<'' | 'needs' | 'ok'>('')

  const { toasts, showToast, dismissToast } = useToast()
  const role = useAuth((s) => s.user?.role)
  const canManageClass = role === 'teacher'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

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
    const data = await api<{ courses: CourseLectures[]; programs: LearningProgram[] }>('/api/teacher/lectures')
    setCourses(data.courses)
    setPrograms(data.programs ?? [])
    const requestedProgramId = searchParams.get('programId')
    const requestedCourseId = searchParams.get('courseId')
    const requestedCourseProgram = data.programs?.find((program) =>
      program.regions.some((region) => region.id === requestedCourseId),
    )
    const requestedProgram = data.programs?.find((program) => program.id === requestedProgramId)
      ?? requestedCourseProgram
      ?? data.programs?.[0]
    if (requestedProgram) setLearningSpaceFilter(requestedProgram.source)
    const nextProgramId = requestedProgram?.id ?? ''
    const requestedCourse = data.courses.find((course) => course.id === requestedCourseId)
    const nextCourse = requestedCourse ?? requestedProgram?.regions[0] ?? data.courses[0]
    const nextCourseId = nextCourse?.id ?? ''
    setSelectedProgramId(nextProgramId)
    setSelectedCourseId(nextCourseId)

    // Direct menu entry must establish the same context as the "Biên soạn"
    // button. This also makes refresh/deep links deterministic.
    if ((!requestedProgramId || !requestedCourseId) && nextProgramId && nextCourseId) {
      setSearchParams({ programId: nextProgramId, courseId: nextCourseId }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const loadStats = useCallback(async () => {
    const data = await api<{ stats: ClassStats | null }>('/api/teacher/class/stats')
    setStats(data.stats)
  }, [])

  const runLoad = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      if (tab === 'class') await loadClass()
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
  const classTab = (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {!classInfo ? (
        canManageClass ? (
          <form className="ui-card flex flex-col gap-4 p-5 lg:col-span-2" onSubmit={(e) => void saveClass(e)}>
            <h2 className="font-display text-xl">Tạo lớp học</h2>
            <p className="text-sm text-muted">Mỗi giảng viên có một lớp. Học sinh tham gia bằng mã lớp.</p>
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
                  <p className="text-xs text-muted">Nhập đúng biệt danh học sinh đã đăng ký</p>
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
            {progressDetail && (
              <div className="ui-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-display text-base">Tiến trình · {progressDetail.nickname}</h3>
                  <button type="button" className="min-h-11 rounded-lg px-3 text-sm font-bold text-muted hover:bg-sky-50" aria-label="Đóng chi tiết tiến trình" onClick={() => setProgressDetail(null)}>Đóng</button>
                </div>
                <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                  {progressDetail.quests.length === 0 ? (
                    <li className="text-muted">Chưa hoàn thành trạm nào</li>
                  ) : progressDetail.quests.map((q, i) => (
                    <li key={i} className="flex justify-between gap-2 rounded-lg bg-brand-50/50 px-2 py-1">
                      <span className="truncate">{q.title}</span>
                      <span className="shrink-0 text-muted">{q.status} · {q.stars} sao</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
      {classInfo && (
        <div className="lg:col-span-2">
          <TeacherFeedbackPanel
            classes={[{ id: classInfo.id ?? '', name: classInfo.name, learners: students }]}
            showToast={showToast}
          />
        </div>
      )}
    </div>
  )

  // ── Tab: Khóa học ─────────────────────────────────────────
  const visiblePrograms = programs.filter((program) => {
    const query = courseSearch.trim().toLocaleLowerCase('vi')
    const searchable = `${program.title} ${program.description} ${program.regions.map((region) => region.title).join(' ')}`.toLocaleLowerCase('vi')
    return program.source === learningSpaceFilter && (!query || searchable.includes(query))
  })
  const focusedProgram = visiblePrograms.find((program) => program.id === selectedProgramId) ?? visiblePrograms[0]

  const coursesTab = (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_380px]">
      <section className="ui-card h-fit overflow-hidden" aria-labelledby="course-list-title">
        <div className="border-b border-border/60 bg-white px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="course-list-title" className="font-display text-xl text-text">Chương trình học</h2>
              <p className="mt-1 text-sm text-muted">Mỗi chương trình gồm một hoặc nhiều vùng; mỗi vùng chứa các trạm học.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <Button
                type="button"
                id="open-course-modal-btn"
                onClick={() => { setCourseModalMode('create'); setCourseModalCourse(null) }}
              >
                Tạo giáo trình
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative">
              <span className="sr-only">Tìm giáo trình</span>
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="min-h-11 w-full rounded-xl border-2 border-border bg-white pl-10 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Tìm chương trình hoặc vùng…" />
            </label>
            <div className="flex min-h-11 items-center rounded-xl border-2 border-border bg-sky-50 px-3 text-sm font-bold text-sky-800">
              {learningSpaceFilter === 'aikid_official' ? 'Nền tảng AiKid' : learningSpaceFilter === 'workspace' ? 'Trường học' : 'Học tập tự do'}
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Không gian học tập">
            {([
              ['aikid_official', 'Nền tảng AiKid', 'Giáo trình chính thức'],
              ['workspace', 'Trường học', 'Theo workspace'],
              ['creator_marketplace', 'Học tập tự do', 'Giáo viên & gia đình'],
            ] as const).map(([source, label, caption]) => {
              const count = programs.filter((program) => program.source === source).length
              const selected = learningSpaceFilter === source
              return <button
                key={source}
                type="button"
                role="tab"
                aria-selected={selected}
                className={cn('min-h-16 rounded-xl border-2 px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus', selected ? 'border-sky-400 bg-sky-50 text-sky-800 shadow-soft' : 'border-border bg-white text-text hover:border-sky-200')}
                onClick={() => {
                  setLearningSpaceFilter(source)
                  const firstProgram = programs.find((program) => program.source === source)
                  const firstCourse = firstProgram?.regions[0]
                  setSelectedProgramId(firstProgram?.id ?? '')
                  setSelectedCourseId(firstCourse?.id ?? '')
                  setSearchParams(firstProgram
                    ? { programId: firstProgram.id, ...(firstCourse ? { courseId: firstCourse.id } : {}) }
                    : {})
                }}
              >
                <span className="flex items-center justify-between gap-2 font-extrabold"><span>{label}</span><span className="rounded-full bg-white px-2 py-0.5 text-xs text-muted">{count}</span></span>
                <span className="mt-0.5 block text-xs font-bold text-muted">{caption}</span>
              </button>
            })}
          </div>
        </div>

        {programs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-display text-lg text-text">Bắt đầu khóa học đầu tiên</p>
            <p className="mt-1 text-sm text-muted">Biểu mẫu bên cạnh chia nội dung thành ba bước ngắn.</p>
          </div>
        ) : visiblePrograms.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-display text-lg text-text">Chưa có chương trình trong không gian này</p>
            <p className="mt-1 text-sm text-muted">Chương trình của trường hoặc giáo viên sẽ xuất hiện tại đây sau khi được phân phối.</p>
          </div>
        ) : (
          <ul className="grid gap-3 p-4 md:grid-cols-2">
            {visiblePrograms.map((program) => {
              const stationCount = program.regions.reduce((sum, region) => sum + region.lectures.filter((lecture) => !lecture.archived).length, 0)
              const isFocused = focusedProgram?.id === program.id
              return (
                <li key={program.id} className={cn('overflow-hidden rounded-2xl border-2 transition', isFocused ? 'border-sky-400 bg-sky-50/70 shadow-soft' : 'border-border bg-white hover:border-sky-200')}>
                  <img src={programArtwork(program)} alt="" loading="lazy" className="aspect-[3/2] w-full border-b border-border object-cover" aria-hidden="true" />
                  <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg text-text">{program.title}</h3>
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700">{program.regions.length} vùng</span>
                        <span className="rounded-full bg-mint-50 px-2 py-0.5 text-xs font-bold text-success">{program.source === 'aikid_official' ? 'AiKid chính thức' : program.source === 'workspace' ? 'Trường học' : 'Học tự do'}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{program.description || 'Chương trình học gồm các vùng và trạm được sắp xếp.'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                    <span className="text-sm font-bold text-success">{stationCount} trạm · {program.unlockMode === 'sequential' ? 'Lần lượt' : 'Song song'}</span>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const firstCourse = program.regions[0]
                        setSelectedProgramId(program.id)
                        setSelectedCourseId(firstCourse?.id ?? '')
                        setSearchParams({ programId: program.id, ...(firstCourse ? { courseId: firstCourse.id } : {}) })
                      }}
                    >
                      {isFocused ? 'Đang xem' : 'Xem chi tiết'}
                    </Button>
                  </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <aside className="ui-card h-fit overflow-hidden xl:sticky xl:top-5" aria-labelledby="curriculum-workflow-title">
        {focusedProgram ? <>
          <div className="border-b border-border bg-sky-50/60 p-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-sky-700">Chương trình đang chọn</p>
            <h2 id="curriculum-workflow-title" className="mt-1 font-display text-2xl text-text">{focusedProgram.title}</h2>
            <p className="mt-1 text-sm text-muted">{focusedProgram.regions.length} vùng trong cùng một hành trình học</p>
          </div>
          <div className="space-y-4 p-5">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
              <label className="grid gap-1.5 text-sm font-bold text-text">
                Cách mở các vùng trong lộ trình
                <select
                  className="min-h-11 rounded-xl border-2 border-border bg-white px-3 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  value={focusedProgram.unlockMode}
                  disabled={focusedProgram.readOnly}
                  onChange={(event) => void api(`/api/teacher/programs/${encodeURIComponent(focusedProgram.id)}/unlock-mode`, {
                    method: 'PATCH',
                    body: JSON.stringify({ regionUnlockMode: event.target.value }),
                  }).then(() => loadLectures()).then(() => showToast('Đã cập nhật cách mở lộ trình', 'success')).catch((error) => showToast(error instanceof Error ? error.message : 'Không thể cập nhật lộ trình', 'error'))}
                >
                  <option value="parallel">Mở song song các vùng</option>
                  <option value="sequential">Mở lần lượt từng vùng</option>
                </select>
              </label>
              <p className="mt-2 text-xs leading-relaxed text-muted">{focusedProgram.readOnly ? 'Chương trình tham khảo chỉ được xem.' : (focusedProgram.unlockMode === 'sequential' ? 'Học sinh hoàn thành vùng trước để mở vùng tiếp theo.' : 'Học sinh có thể chọn các vùng trong chương trình song song.')}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted">Các vùng trong chương trình</p>
              <ol className="space-y-2">
                {focusedProgram.regions.map((region, index) => {
                  const stationCount = region.lectures.filter((lecture) => !lecture.archived).length
                  return <li key={region.id} className="rounded-xl border border-border bg-white p-3">
                    <div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-extrabold text-brand-700">{index + 1}</span><div className="min-w-0"><p className="font-bold text-text">{region.shortTitle || region.title}</p><p className="text-xs text-muted">{stationCount} trạm · {region.status === 'open' ? 'Đang mở' : 'Đang ẩn'}</p></div></div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button variant="secondary" className="!min-h-9 !text-xs" onClick={() => navigate(`/teacher/lectures?courseId=${encodeURIComponent(region.id)}&programId=${encodeURIComponent(focusedProgram.id)}`)}>Trạm học</Button>
                      {!region.readOnly && <Button variant="ghost" className="!min-h-9 !text-xs" onClick={() => { setCourseModalMode('edit'); setCourseModalCourse(region) }}>Sửa vùng</Button>}
                    </div>
                  </li>
                })}
              </ol>
            </div>
          </div>
        </> : <div className="p-6 text-center text-muted">Không tìm thấy giáo trình phù hợp.</div>}
      </aside>
    </div>
  )

  // ── Tab: Trạm học ─────────────────────────────────────────
  const lecturesTab = (
    <div className="grid items-start gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="ui-card overflow-hidden lg:sticky lg:top-[4.5rem]" aria-label="Chọn giáo trình và trạm học">
        <div className="border-b border-border bg-sky-50/60 p-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold text-text">
            Khóa học đang soạn
            <select
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              value={selectedCourseId}
              onChange={(event) => {
                const courseId = event.target.value
                const program = programs.find((item) => item.regions.some((region) => region.id === courseId))
                runLectureAction(() => {
                  setSelectedCourseId(courseId)
                  if (program) setSelectedProgramId(program.id)
                  setSearchParams(courseId
                    ? { courseId, ...(program ? { programId: program.id } : {}) }
                    : {})
                  closeLectureEditor()
                })
              }}
            >
              <option value="">Chọn một giáo trình</option>
              {editableCourses.length > 0 && (
                <optgroup label="Giáo trình được phép biên soạn">
                  {editableCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.shortTitle || course.title}{course.ageTrack ? ` · ${course.ageTrack}` : ''}{course.programSource === 'aikid_official' ? ' · AiKid chính thức' : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              {referenceCourses.length > 0 && (
                <optgroup label="Thư viện AiKid — chỉ xem">
                  {referenceCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.shortTitle || course.title}{course.ageTrack ? ` · ${course.ageTrack}` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>
        </div>

        {!activeCourse ? (
          <div className="p-5 text-center">
            <p className="text-sm text-muted">Chọn khóa học để xem và sắp xếp bài.</p>
            <Button className="mt-3" variant="secondary" onClick={() => navigate('/teacher/courses')}>Tạo khóa học</Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={activeCourse.status} />
                <span className="text-xs font-bold text-muted">{lectures.filter((lecture) => !lecture.archived).length} trạm đang dùng</span>
              </div>
              {activeCourse.readOnly ? (
                <p className="mt-3 rounded-xl bg-sun-50 px-3 py-2 text-xs font-bold text-warning">Giáo trình AiKid tham khảo · Không thể thêm hoặc sửa trạm.</p>
              ) : (
                <Button
                  className="mt-3 w-full"
                  id="open-lecture-drawer-btn"
                  onClick={() => {
                    runLectureAction(() => {
                      setDrawerMode('create')
                      setDrawerLecture(null)
                    })
                  }}
                >
                  + Thêm trạm học
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2 border-b border-border/60 px-3 py-3">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                  <Search size={17} aria-hidden="true" />
                </span>
                <input
                  type="search"
                  aria-label="Tìm trạm học"
                  placeholder="Tìm trạm học..."
                  value={lectureSearch}
                  onChange={(e) => setLectureSearch(e.target.value)}
                  className="w-full min-h-10 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Lọc trạm học theo trạng thái"
                  className="flex-1 min-h-9 rounded-xl border-2 border-border bg-white px-2 text-xs font-bold"
                  value={lectureArchiveFilter}
                  onChange={(e) => setLectureArchiveFilter(e.target.value as '' | 'active' | 'archived')}
                >
                  <option value="">Tất cả</option>
                  <option value="active">Đang hiện</option>
                  <option value="archived">Đang ẩn</option>
                </select>
                {(lectureSearch || lectureArchiveFilter) && (
                  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">{filteredLectures.length} trạm</span>
                )}
                {(lectureSearch || lectureArchiveFilter) && (
                  <button type="button" className="text-xs font-bold text-muted underline shrink-0" onClick={() => { setLectureSearch(''); setLectureArchiveFilter('') }}>Xóa</button>
                )}
              </div>
            </div>

            {lectures.length === 0 ? (
              <div className="p-5 text-center">
                <p className="font-display text-xl text-text">Chưa có trạm học</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">Tạo trạm đầu tiên với đủ bốn pha: Khám phá → Thử cùng Mee → Tự tay làm → Thử thách.</p>
                {!activeCourse?.readOnly && (
                  <Button className="mt-4" onClick={() => { setDrawerMode('create'); setDrawerLecture(null) }}>
                    Tạo trạm đầu tiên
                  </Button>
                )}
              </div>
            ) : filteredLectures.length === 0 ? (
              <div className="p-5 text-center">
                <p className="font-bold text-text">Không có bài khớp bộ lọc</p>
                <button type="button" className="mt-2 text-sm font-bold text-brand-500 underline" onClick={() => { setLectureSearch(''); setLectureArchiveFilter('') }}>Xóa bộ lọc</button>
              </div>
            ) : (
              <ol className="divide-y divide-border/60" aria-label="Danh sách trạm học">
                {lecturesPag.slice.map((lecture) => {
                  const index = lectures.indexOf(lecture)
                  return (
                    <li
                      key={lecture.id}
                      className={cn(
                        'rounded-xl p-2 transition',
                        lecture.archived ? 'bg-orange-50 ring-1 ring-orange-200' : '',
                      )}
                    >
                      <button
                        type="button"
                        className={cn(
                          'min-h-11 w-full rounded-xl px-3 py-2 text-left transition',
                          drawerLecture?.id === lecture.id && drawerMode !== 'none'
                            ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                            : lecture.archived ? 'hover:bg-orange-100' : 'hover:bg-sky-50',
                        )}
                        onClick={() => {
                          runLectureAction(() => {
                            setDrawerMode('edit')
                            setDrawerLecture(lecture)
                          })
                        }}
                        aria-label={`Chỉnh sửa ${lecture.title}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="block text-xs font-bold text-muted">Trạm {index + 1}</span>
                          {lecture.archived && (
                            <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs font-extrabold text-orange-700">
                              🔴 Đang ẩn
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 block font-bold text-text truncate">{lecture.title}</span>
                        <span className="mt-1 block text-xs text-muted">{PRACTICE_OPTIONS.find((option) => option.id === lecture.practiceKind)?.label ?? 'Hoạt động sáng tạo'}{lecture.videoUrl ? ' · Có video' : ''}</span>
                      </button>
                      {/* WHY: readOnly → chỉ hiện nút Xem (không sửa/ẩn) để tránh 403.
                           Editable courses → hiện đủ Lên/Xuống/Sửa/Ẩn như bình thường. */}
                      <div className="mt-1 flex items-center justify-between gap-1">
                        {activeCourse?.readOnly ? (
                          // System course: teacher chỉ được xem nội dung
                          <button
                            type="button"
                            className={cn('min-h-9 rounded-lg px-3 text-xs font-bold hover:bg-sky-50', drawerLecture?.id === lecture.id && drawerMode !== 'none' ? 'text-sky-600 bg-sky-50' : 'text-sky-600')}
                            onClick={() => runLectureAction(() => { setDrawerMode('edit'); setDrawerLecture(lecture) })}
                            aria-label={`Xem ${lecture.title}`}
                          >👁 Xem</button>
                        ) : (
                          // Editable course: đủ action buttons
                          <>
                            <div className="flex gap-1">
                              <button type="button" className="min-h-9 rounded-lg px-2 text-xs font-bold text-muted hover:bg-sky-50 disabled:opacity-30" disabled={index === 0} onClick={() => void moveLecture(lecture.id, -1)} aria-label={`Đưa ${lecture.title} lên trước`}>↑ Lên</button>
                              <button type="button" className="min-h-9 rounded-lg px-2 text-xs font-bold text-muted hover:bg-sky-50 disabled:opacity-30" disabled={index === lectures.length - 1} onClick={() => void moveLecture(lecture.id, 1)} aria-label={`Đưa ${lecture.title} xuống sau`}>↓ Xuống</button>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                className={cn('min-h-9 rounded-lg px-2 text-xs font-bold hover:bg-brand-50', drawerLecture?.id === lecture.id && drawerMode !== 'none' ? 'text-brand-600 bg-brand-50' : 'text-brand-600')}
                                onClick={() => runLectureAction(() => { setDrawerMode('edit'); setDrawerLecture(lecture) })}
                                aria-label={`Sửa ${lecture.title}`}
                              >✏️ Sửa</button>
                              {lecture.archived ? (
                                <button type="button" className="min-h-9 rounded-lg px-2 text-xs font-extrabold text-white bg-green-500 hover:bg-green-600 transition" onClick={() => void restoreLecture(lecture.id)} aria-label={`Bật lại ${lecture.title}`}>🟢 Bật lại</button>
                              ) : (
                                <button type="button" className="min-h-9 rounded-lg px-2 text-xs font-bold text-danger hover:bg-red-50" onClick={() => setArchiveTarget(lecture)} aria-label={`Ẩn ${lecture.title}`}>🔴 Ẩn</button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
            <Paginator
              page={lecturesPag.page} totalPages={lecturesPag.totalPages}
              totalItems={filteredLectures.length} pageSize={10}
              onPrev={lecturesPag.prev} onNext={lecturesPag.next} onGoTo={lecturesPag.goTo}
            />
          </>
        )}
      </aside>

      <main className="min-w-0" style={{ display: 'flex', flexDirection: 'column' }}>
        {drawerMode !== 'none' && selectedCourseId ? (
          // WHY: key = lecture id (edit) hoặc '__new__' (create) — buộc React unmount+remount LectureDrawer
          // khi giáo viên chuyển sang bài khác hoặc vào create mode.
          // Nếu không có key, draft state bên trong bị giữ lại từ lần mount trước (React useState chỉ init 1 lần).
          <LectureDrawer
            key={drawerMode === 'edit' ? (drawerLecture?.id ?? '__edit__') : '__new__'}
            inline
            courseId={selectedCourseId}
            readOnly={!!activeCourse?.readOnly}
            archived={drawerMode === 'edit' && !!drawerLecture?.archived}
            onArchive={() => drawerLecture && setArchiveTarget(drawerLecture)}
            onRestore={() => drawerLecture && void restoreLecture(drawerLecture.id)}
            onDirtyChange={setLectureDraftDirty}
            lecture={drawerMode === 'edit' && drawerLecture
              ? {
                  id: drawerLecture.id,
                  title: drawerLecture.title,
                  skill: drawerLecture.skill ?? '',
                  hook: drawerLecture.hook ?? '',
                  practiceKind: (drawerLecture.practiceKind as import('../lib/authoring').LectureDraft['practiceKind']) ?? 'journal',
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  questionCount: typeof (drawerLecture.gameConfig as any)?.questionCount === 'number'
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? (drawerLecture.gameConfig as any).questionCount as number
                    : 6,
                  practiceInstruction: drawerLecture.practiceInstruction ?? '',
                  product: drawerLecture.product ?? '',
                  practiceStepsText: (drawerLecture.practiceSteps ?? []).join('\n'),
                  successCriteriaText: (drawerLecture.successCriteria ?? []).join('\n'),
                  reflectionPrompt: drawerLecture.reflectionPrompt ?? '',
                  practiceConfigText: (drawerLecture.practiceConfig?.cards ?? []).map((card) => `${card.title} | ${card.description}`).join('\n'),
                  checkQuestions: Array.isArray((drawerLecture.gameConfig as Record<string, unknown>)?.checkQuestions)
                    ? (drawerLecture.gameConfig as Record<string, unknown>).checkQuestions as import('../lib/authoring').CheckQuestion[]
                    : (drawerLecture.checkQuestion ? [{
                        id: 'legacy-0',
                        prompt: drawerLecture.checkQuestion ?? '',
                        options: [
                          drawerLecture.checkOptions?.[0] ?? '',
                          drawerLecture.checkOptions?.[1] ?? '',
                          drawerLecture.checkOptions?.[2] ?? '',
                        ].filter((o) => o.length > 0),
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
        ) : activeCourse ? (
          <section className="ui-card p-8 text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📚</div>
            <p className="font-display text-2xl text-text">{activeCourse.shortTitle || activeCourse.title}</p>
            {activeCourse.readOnly ? (
              // WHY: Global courses chỉ giảng viên admin mới chỉnh được — hiển thị rõ để tránh nhầm lẫn
              <p className="mx-auto mt-3 max-w-sm rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 ring-1 ring-amber-200">
                👀 Khóa học hệ thống — chỉ xem, không thể chỉnh sửa
              </p>
            ) : (
              <>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  Chọn một trạm bên trái để chỉnh sửa, hoặc tạo trạm mới. Mỗi trạm cần đủ bốn pha đúng như học sinh nhìn thấy trên frontend.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button
                    onClick={() => {
                      setDrawerMode('create')
                      setDrawerLecture(null)
                    }}
                  >
                    + Thêm trạm học
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={checkingCourse || lectures.filter((lecture) => !lecture.archived).length === 0}
                    onClick={() => void patchCourseStatus(activeCourse.id, activeCourse.status === 'open' ? 'soon' : 'open')}
                  >
                    {checkingCourse ? 'Đang kiểm tra...' : activeCourse.status === 'open' ? 'Ẩn khỏi học sinh' : 'Mở cho học sinh'}
                  </Button>
                </div>
              </>
            )}
          </section>
        ) : (
          <section className="ui-card p-8 text-center">
            <p className="text-sm text-muted">Chọn giáo trình từ cột bên để xem các trạm học.</p>
          </section>
        )}
      </main>
    </div>
  )

  // ── Tab: Thống kê ─────────────────────────────────────────
  const statsTab = (
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
          <div className="mb-4 rounded-2xl bg-sun-100/50 px-4 py-3 text-sm leading-relaxed text-text">
            <strong>{statStudents.filter((student) => student.needsSupport).length} học sinh nên được hỏi thăm.</strong>{' '}
            Gợi ý dựa trên tiến độ gần đây, không dùng để xếp hạng hay đánh giá trẻ.
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
                  <tr key={s.id} className={cn('border-b border-border/40', s.needsSupport && 'bg-sun-50')}>
                    <td className="px-3 py-2 font-bold">{s.nickname}</td>
                    <td className="px-3 py-2">{s.completedQuests}</td>
                    <td className="px-3 py-2">
                      <span className="block max-w-52 truncate font-semibold">{s.currentQuest ?? 'Chưa bắt đầu'}</span>
                      {s.currentPhase && <span className="text-xs text-muted">{PHASE_LABELS[s.currentPhase] ?? 'Đang thực hiện'}</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted">{formatActivity(s.lastActiveAt)}</td>
                    <td className="px-3 py-2">
                      {s.needsSupport
                        ? <button type="button" className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold text-warning" onClick={() => void viewProgress(s.id)}>Xem để hỗ trợ</button>
                        : <span className="text-xs font-semibold text-success">Đang tiến triển tốt</span>}
                      {s.supportReason && <span className="mt-1 block max-w-48 text-xs text-muted">{s.supportReason}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginator
              page={statsPag.page} totalPages={statsPag.totalPages}
              totalItems={filteredStatStudents.length} pageSize={15}
              onPrev={statsPag.prev} onNext={statsPag.next} onGoTo={statsPag.goTo}
            />
          </div>
          <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border sm:hidden">
            {statsPag.slice.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Không có học sinh khớp bộ lọc</p>
            ) : statsPag.slice.map((s) => (
              <article key={s.id} className={cn('space-y-3 px-4 py-4', s.needsSupport && 'bg-sun-50')}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold">{s.nickname}</p>
                  <span className="shrink-0 text-xs font-bold text-muted">{s.completedQuests} trạm</span>
                </div>
                <div className="rounded-xl bg-white/70 px-3 py-2">
                  <p className="text-sm font-semibold">{s.currentQuest ?? 'Chưa bắt đầu'}</p>
                  <p className="mt-1 text-xs text-muted">{s.currentPhase ? PHASE_LABELS[s.currentPhase] ?? 'Đang thực hiện' : 'Chưa có hoạt động'} · {formatActivity(s.lastActiveAt)}</p>
                </div>
                {s.needsSupport ? (
                  <Button variant="secondary" className="w-full" onClick={() => void viewProgress(s.id)}>Xem để hỗ trợ</Button>
                ) : (
                  <p className="text-xs font-semibold text-success">Đang tiến triển tốt</p>
                )}
                {s.supportReason && <p className="text-xs text-muted">{s.supportReason}</p>}
              </article>
            ))}
            <Paginator
              page={statsPag.page} totalPages={statsPag.totalPages}
              totalItems={filteredStatStudents.length} pageSize={15}
              onPrev={statsPag.prev} onNext={statsPag.next} onGoTo={statsPag.goTo}
            />
          </div>
        </>
      )}
    </div>
  )

  const tabTitles: Record<TeacherTab, string> = {
    class: 'Lớp & Học sinh',
    courses: 'Khóa học',
    lectures: 'Trạm học',
    stats: 'Thống kê',
  }

  function tabContent() {
    if (loading) return loadingEl
    if (loadError) return <ErrorPanel message={loadError} onRetry={() => void runLoad()} />
    switch (tab) {
      case 'class': return classTab
      case 'courses': return coursesTab
      case 'lectures': return lecturesTab
      case 'stats': return statsTab
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-500">CMS · Giảng viên</p>
          <h1 className="font-display text-2xl text-text">{tabTitles[tab]}</h1>
        </div>
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
    </div>
  )
}
