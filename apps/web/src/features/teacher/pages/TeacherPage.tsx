/**
 * TeacherPage ΓÇö Full redesign with:
 * - Route-controlled tabs (prop `tab` from App.tsx)
 * - Toast popup notifications
 * - ConfirmDialog
 * - Complete course creation flow: course ΓåÆ lectures ΓåÆ edit ΓåÆ publish
 * - Full-width layout (CmsShell handles sidebar)
 */
import { useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Paginator } from '@/shared/components/ui/Paginator'
import { useToast } from '@/shared/hooks/useToast'
import { usePagination } from '@/shared/hooks/usePagination'
import { api, type LectureRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import { CourseAuthoringWizard } from '../components/CourseAuthoringWizard'
import { LectureAuthoringForm } from '../components/LectureAuthoringForm'
import {
  PRACTICE_OPTIONS,
  courseDraftReadiness,
  lectureDraftReadiness,
  type CourseDraft,
} from '../lib/authoring'
import {
  CmsAnalyticsIcon,
  CmsCoursesIcon,
  CmsLecturesIcon,
  CmsUsersIcon,
} from '@/shared/components/icons/CmsIcons'

// ΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
  gameType?: string
  gameInstruction?: string
  gameOutcome?: string
  gameCards?: string[]
  practiceInstruction?: string
  product?: string
  checkQuestion?: string
  checkOptions?: string[]
  correctIndex?: number
  checkExplain?: string
}

type CourseLectures = {
  id: string
  title: string
  shortTitle: string
  status: string
  ageTrack?: string
  courseKey?: string
  lectures: Lecture[]
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

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const PHASE_LABELS: Record<string, string> = {
  learn: 'Kh├ím ph├í',
  game: 'Tr├▓ ch╞íi',
  practice: 'S├íng tß║ío',
  check: 'Thß╗¡ t├ái',
}

function formatActivity(value: string | null): string {
  if (!value) return 'Ch╞░a bß║»t ─æß║ºu'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

const initialLectureForm = () => ({
  id: '',
  title: '',
  skill: '',
  hook: '',
  practiceKind: 'journal',
  videoUrl: '',
  concept: '',
  example: '',
  reward: '',
  duration: '25ΓÇô35 ph├║t',
  goalsText: '',
  gameType: 'pick',
  gameInstruction: '',
  gameOutcome: '',
  gameCardsText: '',
  practiceInstruction: '',
  product: '',
  checkQuestion: '',
  checkOption1: '',
  checkOption2: '',
  checkOption3: '',
  correctIndex: '0',
  checkExplain: '',
})

// ΓöÇΓöÇ Stat card ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

// ΓöÇΓöÇ Status badge ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold',
      status === 'open' ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning'
    )}>
      {status === 'open' ? '─Éang mß╗ƒ' : '─Éang ß║⌐n'}
    </span>
  )
}

export function TeacherPage({ tab }: { tab: TeacherTab }) {
  // Class state
  const [classInfo, setClassInfo] = useState<{ id?: string; name: string; code: string } | null>(null)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [progressDetail, setProgressDetail] = useState<ProgressDetail | null>(null)
  const [classForm, setClassForm] = useState({ name: '', code: '' })
  const [newStudent, setNewStudent] = useState('')
  const [removeTarget, setRemoveTarget] = useState<StudentRow | null>(null)

  // Courses state
  const [courses, setCourses] = useState<CourseLectures[]>([])
  const [newCourse, setNewCourse] = useState<CourseDraft>({
    id: '', title: '', shortTitle: '', tagline: '', description: '',
    productLabel: '', ageTrack: 'L1', courseKey: 'K1', durationLabel: '8 tuß║ºn',
    skillsText: '', outcomesText: '', credential: '', finalAssessment: '',
  })

  // Lectures state
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selected, setSelected] = useState<Lecture | null>(null)
  const [editForm, setEditForm] = useState(initialLectureForm)
  const [newLecture, setNewLecture] = useState(initialLectureForm)
  const [creatingLecture, setCreatingLecture] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<Lecture | null>(null)

  // Stats state
  const [stats, setStats] = useState<ClassStats | null>(null)

  // Loading
  const [loading, setLoading] = useState(false)

  // ΓöÇΓöÇ Search / filter state ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const [studentSearch, setStudentSearch] = useState('')
  const [lectureSearch, setLectureSearch] = useState('')
  const [lectureArchiveFilter, setLectureArchiveFilter] = useState<'' | 'active' | 'archived'>('')
  const [statsSearch, setStatsSearch] = useState('')
  const [statsSupportFilter, setStatsSupportFilter] = useState<'' | 'needs' | 'ok'>('')

  const { toasts, showToast, dismissToast } = useToast()
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  // Derive lectures BEFORE pagination hooks to avoid TDZ with `const`
  const activeCourse = courses.find((c) => c.id === selectedCourseId)
  const lectures = activeCourse?.lectures ?? []

  // ΓöÇΓöÇ Filtered arrays (client-side search) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ΓöÇΓöÇ Pagination ΓÇö one hook per data-heavy list ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const studentsPag = usePagination(filteredStudents, 15)
  const lecturesPag = usePagination(filteredLectures, 10)
  const statsPag = usePagination(filteredStatStudents, 15)

  // ΓöÇΓöÇ Load data ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const loadClass = useCallback(async () => {
    const data = await api<{ class: { id: string; name: string; code: string } | null; students: StudentRow[] }>('/api/teacher/class')
    setClassInfo(data.class)
    setStudents(data.students)
  }, [])

  const loadLectures = useCallback(async () => {
    const data = await api<{ courses: CourseLectures[] }>('/api/teacher/lectures')
    setCourses(data.courses)
    if (!selectedCourseId && data.courses[0]) {
      setSelectedCourseId(data.courses[0].id)
    }
  }, [selectedCourseId])

  const loadStats = useCallback(async () => {
    const data = await api<{ stats: ClassStats | null }>('/api/teacher/class/stats')
    setStats(data.stats)
  }, [])

  useEffect(() => {
    setLoading(true)
    const run = async () => {
      try {
        if (tab === 'class') await loadClass()
        else if (tab === 'stats') await loadStats()
        else await loadLectures()
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Lß╗ùi tß║úi dß╗» liß╗çu', 'error')
      } finally {
        setLoading(false)
      }
    }
    void run()
    // loadClass / loadStats / loadLectures are stable useCallback refs ΓÇö safe to include
  }, [tab, loadClass, loadStats, loadLectures, showToast])

  // ΓöÇΓöÇ Handlers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  function pickLecture(l: Lecture) {
    setSelected(l)
    setEditForm({
      ...initialLectureForm(),
      id: l.id,
      title: l.title,
      hook: l.hook,
      skill: l.skill ?? '',
      reward: l.reward ?? '',
      duration: l.duration ?? '',
      practiceKind: l.practiceKind,
      videoUrl: l.videoUrl ?? '',
      goalsText: (l.goals ?? []).join('\n'),
      concept: l.concept ?? '',
      example: l.example ?? '',
      gameType: l.gameType ?? 'pick',
      gameInstruction: l.gameInstruction ?? '',
      gameOutcome: l.gameOutcome ?? '',
      gameCardsText: (l.gameCards ?? []).join('\n'),
      practiceInstruction: l.practiceInstruction ?? '',
      product: l.product ?? '',
      checkQuestion: l.checkQuestion ?? '',
      checkOption1: l.checkOptions?.[0] ?? '',
      checkOption2: l.checkOptions?.[1] ?? '',
      checkOption3: l.checkOptions?.[2] ?? '',
      correctIndex: String(l.correctIndex ?? 0),
      checkExplain: l.checkExplain ?? '',
    })
  }

  async function saveLecture(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    const readiness = lectureDraftReadiness(editForm)
    if (!readiness.complete) {
      const missing = readiness.steps.flatMap((item) => item.missing)
      showToast(`B├ái hß╗ìc c├▓n thiß║┐u: ${missing.slice(0, 3).join(', ')}`, 'error')
      return
    }
    try {
      const data = await api<{ lecture: Lecture }>(`/api/teacher/lectures/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editForm.title,
          hook: editForm.hook,
          skill: editForm.skill || undefined,
          practiceKind: editForm.practiceKind,
          videoUrl: editForm.videoUrl.trim() === '' ? null : editForm.videoUrl.trim(),
          reward: editForm.reward,
          duration: editForm.duration,
          goals: splitLines(editForm.goalsText),
          concept: editForm.concept,
          example: editForm.example,
          gameType: editForm.gameType,
          gameInstruction: editForm.gameInstruction,
          gameOutcome: editForm.gameOutcome,
          gameCards: splitLines(editForm.gameCardsText),
          practiceInstruction: editForm.practiceInstruction,
          product: editForm.product,
          checkQuestion: editForm.checkQuestion,
          checkOptions: [editForm.checkOption1, editForm.checkOption2, editForm.checkOption3],
          correctIndex: Number(editForm.correctIndex),
          checkExplain: editForm.checkExplain,
        }),
      })
      setSelected({ ...selected, ...data.lecture })
      showToast('─É├ú l╞░u b├ái giß║úng', 'success')
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng l╞░u ─æ╞░ß╗úc', 'error') }
  }

  async function saveClass(e: React.FormEvent) {
    e.preventDefault()
    const name = (classForm.name || classInfo?.name || '').trim()
    const code = (classForm.code || classInfo?.code || '').trim().toUpperCase()
    if (name.length < 2 || code.length < 3) { showToast('T├¬n lß╗¢p v├á m├ú lß╗¢p kh├┤ng hß╗úp lß╗ç', 'error'); return }
    try {
      await api('/api/teacher/class', { method: 'POST', body: JSON.stringify({ name, code }) })
      showToast('─É├ú l╞░u lß╗¢p hß╗ìc', 'success')
      setClassForm({ name: '', code: '' })
      await loadClass()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng l╞░u ─æ╞░ß╗úc lß╗¢p', 'error') }
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/api/teacher/class/students', { method: 'POST', body: JSON.stringify({ nickname: newStudent.trim() }) })
      setNewStudent('')
      showToast('─É├ú th├¬m hß╗ìc sinh v├áo lß╗¢p', 'success')
      await loadClass()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng th├¬m ─æ╞░ß╗úc. Kiß╗âm tra biß╗çt danh hß╗ìc sinh.', 'error') }
  }

  async function removeStudent() {
    if (!removeTarget) return
    try {
      await api(`/api/teacher/class/students/${removeTarget.id}`, { method: 'DELETE' })
      showToast('─É├ú gß╗í hß╗ìc sinh khß╗Åi lß╗¢p', 'success')
      setRemoveTarget(null)
      await loadClass()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Kh├┤ng gß╗í ─æ╞░ß╗úc', 'error')
      setRemoveTarget(null)
    }
  }

  async function viewProgress(studentId: string) {
    try {
      const data = await api<{ student: { nickname: string | null }; progress: Array<{ questTitle: string; status: string; stars: number }> }>(`/api/teacher/students/${studentId}/progress`)
      setProgressDetail({ nickname: data.student.nickname, quests: data.progress.map((p) => ({ title: p.questTitle, status: p.status, stars: p.stars })) })
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng tß║úi tiß║┐n tr├¼nh', 'error') }
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault()
    const readiness = courseDraftReadiness(newCourse)
    if (!readiness.complete) {
      const missing = readiness.steps.flatMap((item) => item.missing)
      showToast(`Kh├│a hß╗ìc c├▓n thiß║┐u: ${missing.slice(0, 3).join(', ')}`, 'error')
      return
    }
    try {
      // Capture the course id from the draft BEFORE resetting the form
      const createdId = newCourse.id.trim()
      await api('/api/teacher/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...newCourse,
          ageLabel: newCourse.ageTrack === 'L2' ? '10ΓÇô11 tuß╗òi' : '8ΓÇô9 tuß╗òi',
          skills: splitLines(newCourse.skillsText),
          outcomes: splitLines(newCourse.outcomesText),
          coverFrom: '#6d5efc', coverTo: '#3dbfff', accent: '#6d5efc', skillsJson: '[]',
        }),
      })
      showToast('─É├ú tß║ío kh├│a hß╗ìc. Th├¬m b├ái giß║úng rß╗ôi mß╗ƒ "open" ─æß╗â hß╗ìc sinh thß║Ñy.', 'success')
      setNewCourse({
        id: '', title: '', shortTitle: '', tagline: '', description: '',
        productLabel: '', ageTrack: 'L1', courseKey: 'K1', durationLabel: '8 tuß║ºn',
        skillsText: '', outcomesText: '', credential: '', finalAssessment: '',
      })
      await loadLectures()
      // Use the id captured before reset so the Lectures tab pre-selects the new course
      if (createdId) setSelectedCourseId(createdId)
      navigate('/teacher/lectures')
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng tß║ío kh├│a', 'error') }
  }

  async function patchCourseStatus(courseId: string, status: 'open' | 'soon') {
    try {
      await api(`/api/teacher/courses/${courseId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      showToast(status === 'open' ? '─É├ú mß╗ƒ kh├│a cho hß╗ìc sinh' : '─É├ú ß║⌐n kh├│a', 'success')
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lß╗ùi cß║¡p nhß║¡t kh├│a', 'error') }
  }

  async function createLecture(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCourseId) { showToast('Chß╗ìn kh├│a hß╗ìc tr╞░ß╗¢c', 'error'); return }
    const readiness = lectureDraftReadiness(newLecture)
    if (!readiness.complete) {
      const missing = readiness.steps.flatMap((item) => item.missing)
      showToast(`B├ái hß╗ìc c├▓n thiß║┐u: ${missing.slice(0, 3).join(', ')}`, 'error')
      return
    }
    try {
      await api('/api/teacher/lectures', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourseId,
          id: newLecture.id.trim(),
          title: newLecture.title.trim(),
          skill: newLecture.skill,
          hook: newLecture.hook,
          practiceKind: newLecture.practiceKind,
          videoUrl: newLecture.videoUrl.trim() || undefined,
          concept: newLecture.concept,
          example: newLecture.example,
          reward: newLecture.reward.trim() || undefined,
          duration: newLecture.duration,
          goals: splitLines(newLecture.goalsText),
          gameType: newLecture.gameType,
          gameInstruction: newLecture.gameInstruction,
          gameOutcome: newLecture.gameOutcome,
          gameCards: splitLines(newLecture.gameCardsText),
          practiceInstruction: newLecture.practiceInstruction,
          product: newLecture.product,
          checkQuestion: newLecture.checkQuestion,
          checkOptions: [
            newLecture.checkOption1,
            newLecture.checkOption2,
            newLecture.checkOption3,
          ],
          correctIndex: Number(newLecture.correctIndex),
          checkExplain: newLecture.checkExplain,
        }),
      })
      showToast('─É├ú tß║ío b├ái giß║úng', 'success')
      setNewLecture(initialLectureForm())
      setCreatingLecture(false)
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng tß║ío b├ái', 'error') }
  }

  async function archiveLecture() {
    if (!archiveTarget) return
    try {
      await api(`/api/teacher/lectures/${archiveTarget.id}`, { method: 'DELETE' })
      showToast('─É├ú ß║⌐n b├ái giß║úng (soft-archive)', 'success')
      setArchiveTarget(null)
      setSelected(null)
      await loadLectures()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Kh├┤ng ß║⌐n ─æ╞░ß╗úc', 'error')
      setArchiveTarget(null)
    }
  }

  async function restoreLecture(questId: string) {
    try {
      await api(`/api/teacher/lectures/${questId}/restore`, { method: 'POST' })
      showToast('─É├ú kh├┤i phß╗Ñc b├ái giß║úng', 'success')
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng kh├┤i phß╗Ñc ─æ╞░ß╗úc', 'error') }
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
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng sß║»p xß║┐p ─æ╞░ß╗úc', 'error') }
  }

  // ΓöÇΓöÇ Tab content ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const loadingEl = (
    <div className="flex h-40 items-center justify-center">
      <div className="ui-skeleton h-10 w-48 rounded-2xl" />
    </div>
  )

  // Class tab
  const classTab = (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {!classInfo ? (
        <form className="ui-card flex flex-col gap-4 p-5 lg:col-span-2" onSubmit={(e) => void saveClass(e)}>
          <h2 className="font-display text-xl">Tß║ío lß╗¢p hß╗ìc</h2>
          <p className="text-sm text-muted">Mß╗ùi giß║úng vi├¬n c├│ mß╗Öt lß╗¢p. Hß╗ìc sinh join bß║▒ng m├ú lß╗¢p.</p>
          <input className="min-h-11 rounded-xl border-2 border-border px-3" placeholder="T├¬n lß╗¢p (vd Lß╗¢p Sao S├íng)" value={classForm.name} onChange={(e) => setClassForm((c) => ({ ...c, name: e.target.value }))} required minLength={2} />
          <input className="min-h-11 rounded-xl border-2 border-border px-3 font-mono uppercase" placeholder="M├ú lß╗¢p (vd STAR-8)" value={classForm.code} onChange={(e) => setClassForm((c) => ({ ...c, code: e.target.value.toUpperCase() }))} required minLength={3} pattern="[A-Za-z0-9-]+" />
          <Button type="submit">Tß║ío lß╗¢p</Button>
        </form>
      ) : (
        <>
          {/* Student table */}
          <div className="ui-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <p className="font-bold">{classInfo.name}</p>
                <p className="text-xs text-muted">M├ú lß╗¢p: <strong className="font-mono">{classInfo.code}</strong></p>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-600">{students.length} hß╗ìc sinh</span>
            </div>
            {/* Student search bar */}
            <div className="flex flex-col gap-2 border-b border-border/60 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-4">
              <div className="relative w-full min-w-0 flex-1 sm:min-w-[180px]">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">≡ƒöì</span>
                <input
                  type="search"
                  placeholder="T├¼m biß╗çt danh..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full min-h-10 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
                />
              </div>
              {studentSearch && (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">{filteredStudents.length} / {students.length}</span>
              )}
              {studentSearch && (
                <button type="button" className="text-xs font-bold text-muted underline" onClick={() => setStudentSearch('')}>X├│a</button>
              )}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-sky-50/80">
                  <tr>
                    <th className="px-4 py-2 font-extrabold">Biß╗çt danh</th>
                    <th className="px-4 py-2 font-extrabold">Cß║Ñp / XP</th>
                    <th className="px-4 py-2 font-extrabold">Tiß║┐n tr├¼nh</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {studentsPag.slice.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">{students.length === 0 ? 'Ch╞░a c├│ hß╗ìc sinh n├áo' : 'Kh├┤ng c├│ hß╗ìc sinh khß╗¢p t├¼m kiß║┐m'}</td></tr>
                  ) : studentsPag.slice.map((s) => (
                    <tr key={s.id} className="border-t border-border/40">
                      <td className="px-4 py-2 font-bold">{s.nickname}</td>
                      <td className="px-4 py-2 text-sm">Lv{s.level} ┬╖ {s.xp} XP</td>
                      <td className="px-4 py-2 text-xs text-muted">{s.completedQuests} trß║ím ┬╖ {s.totalStars} sao ┬╖ {s.projectCount} sß║ún phß║⌐m</td>
                      <td className="px-4 py-2 text-right">
                        <Button variant="ghost" className="!min-h-8 !px-2 !text-xs" onClick={() => void viewProgress(s.id)}>Chi tiß║┐t</Button>
                        <Button variant="ghost" className="!min-h-8 !px-2 !text-xs text-danger" onClick={() => setRemoveTarget(s)}>Gß╗í</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-border/60 sm:hidden">
              {studentsPag.slice.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">{students.length === 0 ? 'Ch╞░a c├│ hß╗ìc sinh n├áo' : 'Kh├┤ng c├│ hß╗ìc sinh khß╗¢p t├¼m kiß║┐m'}</p>
              ) : studentsPag.slice.map((s) => (
                <article key={s.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{s.nickname}</p>
                    <span className="shrink-0 rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">Lv{s.level} ┬╖ {s.xp} XP</span>
                  </div>
                  <p className="text-xs text-muted">{s.completedQuests} trß║ím ┬╖ {s.totalStars} sao ┬╖ {s.projectCount} sß║ún phß║⌐m</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" className="w-full" onClick={() => void viewProgress(s.id)}>Chi tiß║┐t</Button>
                    <Button variant="ghost" className="w-full text-danger" onClick={() => setRemoveTarget(s)}>Gß╗í khß╗Åi lß╗¢p</Button>
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
            <form className="ui-card flex flex-col gap-3 p-4" onSubmit={(e) => void addStudent(e)}>
              <h2 className="font-display text-lg">Th├¬m hß╗ìc sinh</h2>
              <p className="text-xs text-muted">Nhß║¡p ─æ├║ng biß╗çt danh hß╗ìc sinh ─æ├ú ─æ─âng k├╜</p>
              <input className="min-h-11 rounded-xl border-2 border-border px-3" placeholder="Biß╗çt danh" value={newStudent} onChange={(e) => setNewStudent(e.target.value)} required />
              <Button type="submit">Th├¬m v├áo lß╗¢p</Button>
            </form>
            <form className="ui-card flex flex-col gap-2 p-4" onSubmit={(e) => void saveClass(e)}>
              <p className="text-xs font-extrabold uppercase text-muted">─Éß╗òi t├¬n / m├ú lß╗¢p</p>
              <input className="min-h-9 w-full rounded-xl border border-border px-2 text-sm" placeholder="T├¬n lß╗¢p" value={classForm.name || classInfo.name} onChange={(e) => setClassForm((c) => ({ ...c, name: e.target.value, code: c.code || classInfo!.code }))} />
              <input className="min-h-9 w-full rounded-xl border border-border px-2 font-mono text-sm uppercase" placeholder="M├ú lß╗¢p" value={classForm.code || classInfo.code} onChange={(e) => setClassForm((c) => ({ ...c, code: e.target.value.toUpperCase(), name: c.name || classInfo!.name }))} />
              <Button type="submit" variant="secondary" className="!min-h-9 !text-xs">Cß║¡p nhß║¡t lß╗¢p</Button>
            </form>

            {/* Progress detail popup */}
            {progressDetail && (
              <div className="ui-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-display text-base">Tiß║┐n tr├¼nh ┬╖ {progressDetail.nickname}</h3>
                  <button type="button" className="min-h-11 rounded-lg px-3 text-sm font-bold text-muted hover:bg-sky-50" aria-label="─É├│ng chi tiß║┐t tiß║┐n tr├¼nh" onClick={() => setProgressDetail(null)}>─É├│ng</button>
                </div>
                <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                  {progressDetail.quests.length === 0 ? (
                    <li className="text-muted">Ch╞░a ho├án th├ánh trß║ím n├áo</li>
                  ) : progressDetail.quests.map((q, i) => (
                    <li key={i} className="flex justify-between gap-2 rounded-lg bg-brand-50/50 px-2 py-1">
                      <span className="truncate">{q.title}</span>
                      <span className="shrink-0 text-muted">{q.status} ┬╖ {q.stars} sao</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )


  const coursesTab = (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(460px,0.9fr)]">
      <section className="ui-card h-fit overflow-hidden" aria-labelledby="course-list-title">
        <div className="border-b border-border/60 bg-white px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="course-list-title" className="font-display text-xl text-text">Kh├│a hß╗ìc cß╗ºa bß║ín</h2>
              <p className="mt-1 text-sm text-muted">Chß╗ìn ─æ├║ng viß╗çc cß║ºn l├ám tiß║┐p theo cho tß╗½ng kh├│a.</p>
            </div>
            <p className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">{courses.length} kh├│a hß╗ìc</p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-display text-lg text-text">Bß║»t ─æß║ºu kh├│a hß╗ìc ─æß║ºu ti├¬n</p>
            <p className="mt-1 text-sm text-muted">Biß╗âu mß║½u b├¬n cß║ính chia nß╗Öi dung th├ánh ba b╞░ß╗¢c ngß║»n.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {courses.map((course) => {
              const activeLectures = course.lectures.filter((lecture) => !lecture.archived)
              const canPublish = activeLectures.length > 0
              return (
                <li key={course.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg text-text">{course.shortTitle || course.title}</h3>
                        <StatusBadge status={course.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted">{course.ageTrack === 'L2' ? '10ΓÇô11 tuß╗òi' : '8ΓÇô9 tuß╗òi'} ┬╖ {activeLectures.length} b├ái ─æang d├╣ng</p>
                    </div>
                    <p className={cn('rounded-full px-3 py-1 text-xs font-bold', canPublish ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning')}>
                      {canPublish ? 'Sß║╡n s├áng kiß╗âm tra' : 'Cß║ºn th├¬m b├ái hß╗ìc'}
                    </p>
                  </div>

                  <ol className="mt-4 grid gap-2 sm:grid-cols-3" aria-label={`Tiß║┐n tr├¼nh cß╗ºa ${course.title}`}>
                    <li className="rounded-xl bg-mint-100/60 px-3 py-2 text-sm font-bold text-success">1. Th├┤ng tin ─æ├ú c├│</li>
                    <li className={cn('rounded-xl px-3 py-2 text-sm font-bold', canPublish ? 'bg-mint-100/60 text-success' : 'bg-sun-50 text-warning')}>2. {canPublish ? '─É├ú c├│ b├ái hß╗ìc' : 'Th├¬m b├ái hß╗ìc'}</li>
                    <li className={cn('rounded-xl px-3 py-2 text-sm font-bold', course.status === 'open' ? 'bg-mint-100/60 text-success' : 'bg-sky-50 text-sky-700')}>3. {course.status === 'open' ? '─Éang mß╗ƒ cho hß╗ìc sinh' : 'Kiß╗âm tra v├á mß╗ƒ kh├│a'}</li>
                  </ol>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedCourseId(course.id)
                        setSelected(null)
                        setCreatingLecture(!canPublish)
                        navigate('/teacher/lectures')
                      }}
                    >
                      {canPublish ? 'Quß║ún l├╜ b├ái hß╗ìc' : 'Th├¬m b├ái hß╗ìc ─æß║ºu ti├¬n'}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={!canPublish && course.status !== 'open'}
                      onClick={() => void patchCourseStatus(course.id, course.status === 'open' ? 'soon' : 'open')}
                    >
                      {course.status === 'open' ? 'ß║¿n khß╗Åi hß╗ìc sinh' : 'Mß╗ƒ cho hß╗ìc sinh'}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <CourseAuthoringWizard value={newCourse} onChange={setNewCourse} onSubmit={(event) => void createCourse(event)} />
    </div>
  )


  const lecturesTab = (
    <div className="grid items-start gap-5 md:grid-cols-[280px_minmax(0,1fr)]">{/* md: 768px tablet ΓÇö was lg:1024px */}
      <aside className="ui-card overflow-hidden lg:sticky lg:top-5" aria-label="Chß╗ìn kh├│a hß╗ìc v├á b├ái hß╗ìc">
        <div className="border-b border-border bg-sky-50/60 p-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold text-text">
            Kh├│a hß╗ìc ─æang soß║ín
            <select
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(event.target.value)
                setSelected(null)
                setCreatingLecture(false)
              }}
            >
              <option value="">Chß╗ìn mß╗Öt kh├│a hß╗ìc</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.shortTitle || course.title}</option>)}
            </select>
          </label>
        </div>

        {!activeCourse ? (
          <div className="p-5 text-center">
            <p className="text-sm text-muted">Chß╗ìn kh├│a hß╗ìc ─æß╗â xem v├á sß║»p xß║┐p b├ái.</p>
            <Button className="mt-3" variant="secondary" onClick={() => navigate('/teacher/courses')}>Tß║ío kh├│a hß╗ìc</Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={activeCourse.status} />
                <span className="text-xs font-bold text-muted">{lectures.filter((lecture) => !lecture.archived).length} b├ái ─æang d├╣ng</span>
              </div>
              <Button
                className="mt-3 w-full"
                onClick={() => {
                  setSelected(null)
                  setNewLecture(initialLectureForm())
                  setCreatingLecture(true)
                }}
              >
                Th├¬m b├ái hß╗ìc
              </Button>
            </div>

            {/* Lecture search + archive filter */}
            <div className="flex flex-col gap-2 border-b border-border/60 px-3 py-3">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">≡ƒöì</span>
                <input
                  type="search"
                  placeholder="T├¼m b├ái hß╗ìc..."
                  value={lectureSearch}
                  onChange={(e) => setLectureSearch(e.target.value)}
                  className="w-full min-h-10 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="flex-1 min-h-9 rounded-xl border-2 border-border bg-white px-2 text-xs font-bold"
                  value={lectureArchiveFilter}
                  onChange={(e) => setLectureArchiveFilter(e.target.value as '' | 'active' | 'archived')}
                >
                  <option value="">Tß║Ñt cß║ú</option>
                  <option value="active">Γ£à ─Éang hiß╗çn</option>
                  <option value="archived">≡ƒöÆ ─Éang ß║⌐n</option>
                </select>
                {(lectureSearch || lectureArchiveFilter) && (
                  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">{filteredLectures.length} b├ái</span>
                )}
                {(lectureSearch || lectureArchiveFilter) && (
                  <button type="button" className="text-xs font-bold text-muted underline shrink-0" onClick={() => { setLectureSearch(''); setLectureArchiveFilter('') }}>X├│a</button>
                )}
              </div>
            </div>

            {lectures.length === 0 ? (
              <div className="p-5 text-center">
                <p className="font-bold text-text">Ch╞░a c├│ b├ái hß╗ìc</p>
                <p className="mt-1 text-sm text-muted">Tß║ío b├ái ─æß║ºu ti├¬n theo bß╗æn trß║ím ß╗ƒ khu vß╗▒c b├¬n cß║ính.</p>
              </div>
            ) : filteredLectures.length === 0 ? (
              <div className="p-5 text-center">
                <p className="font-bold text-text">Kh├┤ng c├│ b├ái khß╗¢p bß╗Ö lß╗ìc</p>
                <button type="button" className="mt-2 text-sm font-bold text-brand-500 underline" onClick={() => { setLectureSearch(''); setLectureArchiveFilter('') }}>X├│a bß╗Ö lß╗ìc</button>
              </div>
            ) : (
              <ol className="divide-y divide-border/60" aria-label="Danh s├ích b├ái hß╗ìc">
                {lecturesPag.slice.map((lecture) => {
                  // Global index for move-up/down and display number
                  const index = lectures.indexOf(lecture)
                  return (
                    <li key={lecture.id} className={cn('p-3', lecture.archived && 'opacity-60')}>
                      <button
                        type="button"
                        className={cn(
                          'min-h-11 w-full rounded-xl px-3 py-2 text-left transition',
                          selected?.id === lecture.id && !creatingLecture ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-200' : 'hover:bg-sky-50',
                        )}
                        onClick={() => {
                          setCreatingLecture(false)
                          pickLecture(lecture)
                        }}
                      >
                        <span className="block text-xs font-bold text-muted">B├ái {index + 1}{lecture.archived ? ' ┬╖ ─Éang ß║⌐n' : ''}</span>
                        <span className="mt-0.5 block font-bold text-text">{lecture.title}</span>
                        <span className="mt-1 block text-xs text-muted">{PRACTICE_OPTIONS.find((option) => option.id === lecture.practiceKind)?.label ?? 'Hoß║ít ─æß╗Öng s├íng tß║ío'}{lecture.videoUrl ? ' ┬╖ C├│ video' : ''}</span>
                      </button>
                      <div className="mt-1 flex justify-end gap-1">
                        <button type="button" className="min-h-11 rounded-lg px-3 text-xs font-bold text-muted hover:bg-sky-50 disabled:opacity-30" disabled={index === 0} onClick={() => void moveLecture(lecture.id, -1)} aria-label={`─É╞░a ${lecture.title} l├¬n tr╞░ß╗¢c`}>L├¬n</button>
                        <button type="button" className="min-h-11 rounded-lg px-3 text-xs font-bold text-muted hover:bg-sky-50 disabled:opacity-30" disabled={index === lectures.length - 1} onClick={() => void moveLecture(lecture.id, 1)} aria-label={`─É╞░a ${lecture.title} xuß╗æng sau`}>Xuß╗æng</button>
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

      <main className="min-w-0">
        {creatingLecture && selectedCourseId ? (
          <LectureAuthoringForm
            value={newLecture}
            onChange={setNewLecture}
            onSubmit={(event) => void createLecture(event)}
            submitLabel="Tß║ío b├ái hß╗ìc"
            idEditable
            onCancel={() => setCreatingLecture(false)}
          />
        ) : selected ? (
          <LectureAuthoringForm
            value={editForm}
            onChange={setEditForm}
            onSubmit={(event) => void saveLecture(event)}
            submitLabel="L╞░u thay ─æß╗òi"
            onCancel={() => setSelected(null)}
            secondaryActions={selected.archived ? (
              <Button type="button" variant="secondary" onClick={() => void restoreLecture(selected.id)}>Kh├┤i phß╗Ñc b├ái hß╗ìc</Button>
            ) : (
              <Button type="button" variant="ghost" className="text-danger" onClick={() => setArchiveTarget(selected)}>ß║¿n b├ái hß╗ìc</Button>
            )}
          />
        ) : activeCourse ? (
          <section className="ui-card p-8 text-center">
            <p className="font-display text-2xl text-text">{activeCourse.shortTitle || activeCourse.title}</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Chß╗ìn mß╗Öt b├ái b├¬n tr├íi ─æß╗â chß╗ënh sß╗¡a, hoß║╖c th├¬m b├ái mß╗¢i. Mß╗ùi b├ái cß║ºn ─æß╗º bß╗æn trß║ím: Kh├ím ph├í, Tr├▓ ch╞íi, S├íng tß║ío v├á Thß╗¡ t├ái.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button onClick={() => setCreatingLecture(true)}>Th├¬m b├ái hß╗ìc</Button>
              <Button
                variant="secondary"
                disabled={lectures.filter((lecture) => !lecture.archived).length === 0}
                onClick={() => void patchCourseStatus(activeCourse.id, activeCourse.status === 'open' ? 'soon' : 'open')}
              >
                {activeCourse.status === 'open' ? 'ß║¿n khß╗Åi hß╗ìc sinh' : 'Mß╗ƒ cho hß╗ìc sinh'}
              </Button>
            </div>
          </section>
        ) : (
          <section className="ui-card p-8 text-center">
            <p className="font-display text-xl text-text">Chß╗ìn mß╗Öt kh├│a hß╗ìc ─æß╗â bß║»t ─æß║ºu</p>
          </section>
        )}
      </main>
    </div>
  )

  // Stats tab
  const statsTab = (
    <div className="ui-card min-w-0 p-3 sm:p-5">{/* min-w-0 ensures inner overflow-x-auto works */}
      <h2 className="font-display mb-4 text-xl">Thß╗æng k├¬ lß╗¢p hß╗ìc</h2>
      {!stats ? (
        <p className="text-muted">Ch╞░a c├│ lß╗¢p hoß║╖c dß╗» liß╗çu thß╗æng k├¬.</p>
      ) : (
        <>
          <p className="mb-4 font-bold">{stats.className} ┬╖ <span className="font-mono text-sky-600">{stats.code}</span></p>
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <StatCard label="Hß╗ìc sinh" value={stats.studentCount} icon={<CmsUsersIcon />} />
            <StatCard label="Trß║ím ho├án th├ánh" value={stats.totalCompletedQuests} icon={<CmsAnalyticsIcon />} />
            <StatCard label="B├ái hß╗ìc ─æang mß╗ƒ" value={stats.openQuestCount} icon={<CmsLecturesIcon />} />
            <StatCard label="Sß║ún phß║⌐m" value={stats.projectCount} icon={<CmsCoursesIcon />} />
          </div>
          {/* Stats search + support filter */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[200px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">≡ƒöì</span>
              <input
                type="search"
                placeholder="T├¼m hß╗ìc sinh..."
                value={statsSearch}
                onChange={(e) => setStatsSearch(e.target.value)}
                className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
              />
            </div>
            <select
              className="min-h-11 w-full rounded-xl border-2 border-border bg-white px-3 text-sm font-bold sm:w-auto"
              value={statsSupportFilter}
              onChange={(e) => setStatsSupportFilter(e.target.value as '' | 'needs' | 'ok')}
            >
              <option value="">Tß║Ñt cß║ú</option>
              <option value="needs">ΓÜá∩╕Å Cß║ºn hß╗ù trß╗ú</option>
              <option value="ok">Γ£à Tiß║┐n triß╗ân tß╗æt</option>
            </select>
            {(statsSearch || statsSupportFilter) && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">{filteredStatStudents.length} / {statStudents.length} hß╗ìc sinh</span>
            )}
            {(statsSearch || statsSupportFilter) && (
              <button type="button" className="text-xs font-bold text-muted underline" onClick={() => { setStatsSearch(''); setStatsSupportFilter('') }}>X├│a bß╗Ö lß╗ìc</button>
            )}
          </div>
          <div className="mb-4 rounded-2xl bg-sun-100/50 px-4 py-3 text-sm leading-relaxed text-text">
            <strong>{statStudents.filter((student) => student.needsSupport).length} hß╗ìc sinh n├¬n ─æ╞░ß╗úc hß╗Åi th─âm.</strong>{' '}
            Gß╗úi ├╜ dß╗▒a tr├¬n tiß║┐n ─æß╗Ö gß║ºn ─æ├óy, kh├┤ng d├╣ng ─æß╗â xß║┐p hß║íng hay ─æ├ính gi├í trß║╗.
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="border-b border-border bg-sky-50/60">
              <tr>
                <th className="px-3 py-2 font-extrabold">Hß╗ìc sinh</th>
                <th className="px-3 py-2 font-extrabold">Trß║ím ho├án th├ánh</th>
                <th className="px-3 py-2 font-extrabold">─Éang hß╗ìc</th>
                <th className="px-3 py-2 font-extrabold">Hoß║ít ─æß╗Öng gß║ºn nhß║Ñt</th>
                <th className="px-3 py-2 font-extrabold">Gß╗úi ├╜ hß╗ù trß╗ú</th>
              </tr>
            </thead>
            <tbody>
              {statsPag.slice.map((s) => (
                <tr key={s.id} className={cn('border-b border-border/40', s.needsSupport && 'bg-sun-50')}>
                  <td className="px-3 py-2 font-bold">{s.nickname}</td>
                  <td className="px-3 py-2">{s.completedQuests}</td>
                  <td className="px-3 py-2">
                    <span className="block max-w-52 truncate font-semibold">{s.currentQuest ?? 'Ch╞░a bß║»t ─æß║ºu'}</span>
                    {s.currentPhase && <span className="text-xs text-muted">{PHASE_LABELS[s.currentPhase] ?? '─Éang thß╗▒c hiß╗çn'}</span>}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{formatActivity(s.lastActiveAt)}</td>
                  <td className="px-3 py-2">
                    {s.needsSupport
                      ? <button type="button" className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold text-warning" onClick={() => void viewProgress(s.id)}>Xem ─æß╗â hß╗ù trß╗ú</button>
                      : <span className="text-xs font-semibold text-success">─Éang tiß║┐n triß╗ân tß╗æt</span>}
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
              <p className="px-4 py-8 text-center text-sm text-muted">Kh├┤ng c├│ hß╗ìc sinh khß╗¢p bß╗Ö lß╗ìc</p>
            ) : statsPag.slice.map((s) => (
              <article key={s.id} className={cn('space-y-3 px-4 py-4', s.needsSupport && 'bg-sun-50')}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold">{s.nickname}</p>
                  <span className="shrink-0 text-xs font-bold text-muted">{s.completedQuests} trß║ím</span>
                </div>
                <div className="rounded-xl bg-white/70 px-3 py-2">
                  <p className="text-sm font-semibold">{s.currentQuest ?? 'Ch╞░a bß║»t ─æß║ºu'}</p>
                  <p className="mt-1 text-xs text-muted">{s.currentPhase ? PHASE_LABELS[s.currentPhase] ?? '─Éang thß╗▒c hiß╗çn' : 'Ch╞░a c├│ hoß║ít ─æß╗Öng'} ┬╖ {formatActivity(s.lastActiveAt)}</p>
                </div>
                {s.needsSupport ? (
                  <Button variant="secondary" className="w-full" onClick={() => void viewProgress(s.id)}>Xem ─æß╗â hß╗ù trß╗ú</Button>
                ) : (
                  <p className="text-xs font-semibold text-success">─Éang tiß║┐n triß╗ân tß╗æt</p>
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

  const tabContent = () => {
    if (loading) return loadingEl
    switch (tab) {
      case 'class': return classTab
      case 'courses': return coursesTab
      case 'lectures': return lecturesTab
      case 'stats': return statsTab
      default: return null
    }
  }

  const tabTitles: Record<TeacherTab, string> = {
    class: 'Lß╗¢p & Hß╗ìc sinh',
    courses: 'Kh├│a hß╗ìc',
    lectures: 'B├ái giß║úng',
    stats: 'Thß╗æng k├¬',
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-500">CMS ┬╖ Giß║úng vi├¬n</p>
          <h1 className="font-display text-2xl text-text">{tabTitles[tab]}</h1>
        </div>
        <Button variant="ghost" onClick={async () => { await logout(); navigate('/') }}>
          ─É─âng xuß║Ñt
        </Button>
      </div>

      {/* Tab content */}
      {tabContent()}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!removeTarget}
        title={`Gß╗í "${removeTarget?.nickname}" khß╗Åi lß╗¢p?`}
        description="Hß╗ìc sinh sß║╜ rß╗¥i lß╗¢p. Tiß║┐n tr├¼nh hß╗ìc kh├┤ng bß╗ï mß║Ñt."
        confirmLabel="Gß╗í"
        danger
        onConfirm={() => void removeStudent()}
        onCancel={() => setRemoveTarget(null)}
      />
      <ConfirmDialog
        open={!!archiveTarget}
        title={`ß║¿n b├ái "${archiveTarget?.title}"?`}
        description="Hß╗ìc sinh sß║╜ kh├┤ng thß║Ñy b├ái n├áy. Tiß║┐n tr├¼nh v├á dß╗» liß╗çu ─æ╞░ß╗úc giß╗» nguy├¬n."
        confirmLabel="ß║¿n b├ái"
        danger
        onConfirm={() => void archiveLecture()}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  )
}
