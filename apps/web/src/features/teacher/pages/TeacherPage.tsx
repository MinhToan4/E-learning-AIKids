/**
 * TeacherPage — Full redesign with:
 * - Route-controlled tabs (prop `tab` from App.tsx)
 * - Toast popup notifications
 * - ConfirmDialog
 * - Complete course creation flow: course → lectures → edit → publish
 * - Full-width layout (CmsShell handles sidebar)
 */
import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useToast } from '@/shared/hooks/useToast'
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
  learn: 'Khám phá',
  game: 'Trò chơi',
  practice: 'Sáng tạo',
  check: 'Thử tài',
}

function formatActivity(value: string | null): string {
  if (!value) return 'Chưa bắt đầu'
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
  duration: '25–35 phút',
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

// ── Stat card ────────────────────────────────────────────────
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

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold',
      status === 'open' ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning'
    )}>
      {status === 'open' ? 'Đang mở' : 'Đang ẩn'}
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
    productLabel: '', ageTrack: 'L1', courseKey: 'K1', durationLabel: '8 tuần',
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

  const { toasts, showToast, dismissToast } = useToast()
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  // ── Load data ────────────────────────────────────────────
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
        showToast(e instanceof Error ? e.message : 'Lỗi tải dữ liệu', 'error')
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [tab])

  const activeCourse = courses.find((c) => c.id === selectedCourseId)
  const lectures = activeCourse?.lectures ?? []

  // ── Handlers ─────────────────────────────────────────────
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
      showToast(`Bài học còn thiếu: ${missing.slice(0, 3).join(', ')}`, 'error')
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
      showToast('Đã lưu bài giảng', 'success')
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không lưu được', 'error') }
  }

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

  async function createCourse(e: React.FormEvent) {
    e.preventDefault()
    const readiness = courseDraftReadiness(newCourse)
    if (!readiness.complete) {
      const missing = readiness.steps.flatMap((item) => item.missing)
      showToast(`Khóa học còn thiếu: ${missing.slice(0, 3).join(', ')}`, 'error')
      return
    }
    try {
      await api('/api/teacher/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...newCourse,
          ageLabel: newCourse.ageTrack === 'L2' ? '10–11 tuổi' : '8–9 tuổi',
          skills: splitLines(newCourse.skillsText),
          outcomes: splitLines(newCourse.outcomesText),
          coverFrom: '#6d5efc', coverTo: '#3dbfff', accent: '#6d5efc', skillsJson: '[]',
        }),
      })
      showToast('Đã tạo khóa học. Thêm bài giảng rồi mở "open" để học sinh thấy.', 'success')
      setNewCourse({
        id: '', title: '', shortTitle: '', tagline: '', description: '',
        productLabel: '', ageTrack: 'L1', courseKey: 'K1', durationLabel: '8 tuần',
        skillsText: '', outcomesText: '', credential: '', finalAssessment: '',
      })
      await loadLectures()
      setSelectedCourseId(newCourse.id)
      navigate('/teacher/lectures')
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không tạo khóa', 'error') }
  }

  async function patchCourseStatus(courseId: string, status: 'open' | 'soon') {
    try {
      await api(`/api/teacher/courses/${courseId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      showToast(status === 'open' ? 'Đã mở khóa cho học sinh' : 'Đã ẩn khóa', 'success')
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi cập nhật khóa', 'error') }
  }

  async function createLecture(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCourseId) { showToast('Chọn khóa học trước', 'error'); return }
    const readiness = lectureDraftReadiness(newLecture)
    if (!readiness.complete) {
      const missing = readiness.steps.flatMap((item) => item.missing)
      showToast(`Bài học còn thiếu: ${missing.slice(0, 3).join(', ')}`, 'error')
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
      showToast('Đã tạo bài giảng', 'success')
      setNewLecture(initialLectureForm())
      setCreatingLecture(false)
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không tạo bài', 'error') }
  }

  async function archiveLecture() {
    if (!archiveTarget) return
    try {
      await api(`/api/teacher/lectures/${archiveTarget.id}`, { method: 'DELETE' })
      showToast('Đã ẩn bài giảng (soft-archive)', 'success')
      setArchiveTarget(null)
      setSelected(null)
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

  // ── Tab content ──────────────────────────────────────────
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
          <h2 className="font-display text-xl">Tạo lớp học</h2>
          <p className="text-sm text-muted">Mỗi giảng viên có một lớp. Học sinh join bằng mã lớp.</p>
          <input className="min-h-11 rounded-xl border-2 border-border px-3" placeholder="Tên lớp (vd Lớp Sao Sáng)" value={classForm.name} onChange={(e) => setClassForm((c) => ({ ...c, name: e.target.value }))} required minLength={2} />
          <input className="min-h-11 rounded-xl border-2 border-border px-3 font-mono uppercase" placeholder="Mã lớp (vd STAR-8)" value={classForm.code} onChange={(e) => setClassForm((c) => ({ ...c, code: e.target.value.toUpperCase() }))} required minLength={3} pattern="[A-Za-z0-9-]+" />
          <Button type="submit">Tạo lớp</Button>
        </form>
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
            <div className="overflow-x-auto">
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
                  {students.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">Chưa có học sinh nào</td></tr>
                  ) : students.map((s) => (
                    <tr key={s.id} className="border-t border-border/40">
                      <td className="px-4 py-2 font-bold">{s.nickname}</td>
                      <td className="px-4 py-2 text-sm">Lv{s.level} · {s.xp} XP</td>
                      <td className="px-4 py-2 text-xs text-muted">{s.completedQuests} trạm · {s.totalStars} sao · {s.projectCount} sản phẩm</td>
                      <td className="px-4 py-2 text-right">
                        <Button variant="ghost" className="!min-h-8 !px-2 !text-xs" onClick={() => void viewProgress(s.id)}>Chi tiết</Button>
                        <Button variant="ghost" className="!min-h-8 !px-2 !text-xs text-danger" onClick={() => setRemoveTarget(s)}>Gỡ</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar actions */}
          <div className="flex flex-col gap-4">
            <form className="ui-card flex flex-col gap-3 p-4" onSubmit={(e) => void addStudent(e)}>
              <h2 className="font-display text-lg">Thêm học sinh</h2>
              <p className="text-xs text-muted">Nhập đúng biệt danh học sinh đã đăng ký</p>
              <input className="min-h-11 rounded-xl border-2 border-border px-3" placeholder="Biệt danh" value={newStudent} onChange={(e) => setNewStudent(e.target.value)} required />
              <Button type="submit">Thêm vào lớp</Button>
            </form>
            <form className="ui-card flex flex-col gap-2 p-4" onSubmit={(e) => void saveClass(e)}>
              <p className="text-xs font-extrabold uppercase text-muted">Đổi tên / mã lớp</p>
              <input className="min-h-9 w-full rounded-xl border border-border px-2 text-sm" placeholder="Tên lớp" value={classForm.name || classInfo.name} onChange={(e) => setClassForm((c) => ({ ...c, name: e.target.value, code: c.code || classInfo!.code }))} />
              <input className="min-h-9 w-full rounded-xl border border-border px-2 font-mono text-sm uppercase" placeholder="Mã lớp" value={classForm.code || classInfo.code} onChange={(e) => setClassForm((c) => ({ ...c, code: e.target.value.toUpperCase(), name: c.name || classInfo!.name }))} />
              <Button type="submit" variant="secondary" className="!min-h-9 !text-xs">Cập nhật lớp</Button>
            </form>

            {/* Progress detail popup */}
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
    </div>
  )


  const coursesTab = (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(460px,0.9fr)]">
      <section className="ui-card h-fit overflow-hidden" aria-labelledby="course-list-title">
        <div className="border-b border-border/60 bg-white px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="course-list-title" className="font-display text-xl text-text">Khóa học của bạn</h2>
              <p className="mt-1 text-sm text-muted">Chọn đúng việc cần làm tiếp theo cho từng khóa.</p>
            </div>
            <p className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">{courses.length} khóa học</p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-display text-lg text-text">Bắt đầu khóa học đầu tiên</p>
            <p className="mt-1 text-sm text-muted">Biểu mẫu bên cạnh chia nội dung thành ba bước ngắn.</p>
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
                      <p className="mt-1 text-sm text-muted">{course.ageTrack === 'L2' ? '10–11 tuổi' : '8–9 tuổi'} · {activeLectures.length} bài đang dùng</p>
                    </div>
                    <p className={cn('rounded-full px-3 py-1 text-xs font-bold', canPublish ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning')}>
                      {canPublish ? 'Sẵn sàng kiểm tra' : 'Cần thêm bài học'}
                    </p>
                  </div>

                  <ol className="mt-4 grid gap-2 sm:grid-cols-3" aria-label={`Tiến trình của ${course.title}`}>
                    <li className="rounded-xl bg-mint-100/60 px-3 py-2 text-sm font-bold text-success">1. Thông tin đã có</li>
                    <li className={cn('rounded-xl px-3 py-2 text-sm font-bold', canPublish ? 'bg-mint-100/60 text-success' : 'bg-sun-50 text-warning')}>2. {canPublish ? 'Đã có bài học' : 'Thêm bài học'}</li>
                    <li className={cn('rounded-xl px-3 py-2 text-sm font-bold', course.status === 'open' ? 'bg-mint-100/60 text-success' : 'bg-sky-50 text-sky-700')}>3. {course.status === 'open' ? 'Đang mở cho học sinh' : 'Kiểm tra và mở khóa'}</li>
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
                      {canPublish ? 'Quản lý bài học' : 'Thêm bài học đầu tiên'}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={!canPublish && course.status !== 'open'}
                      onClick={() => void patchCourseStatus(course.id, course.status === 'open' ? 'soon' : 'open')}
                    >
                      {course.status === 'open' ? 'Ẩn khỏi học sinh' : 'Mở cho học sinh'}
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
    <div className="grid items-start gap-5 md:grid-cols-[280px_minmax(0,1fr)]">{/* md: 768px tablet — was lg:1024px */}
      <aside className="ui-card overflow-hidden lg:sticky lg:top-5" aria-label="Chọn khóa học và bài học">
        <div className="border-b border-border bg-sky-50/60 p-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold text-text">
            Khóa học đang soạn
            <select
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(event.target.value)
                setSelected(null)
                setCreatingLecture(false)
              }}
            >
              <option value="">Chọn một khóa học</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.shortTitle || course.title}</option>)}
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
                <span className="text-xs font-bold text-muted">{lectures.filter((lecture) => !lecture.archived).length} bài đang dùng</span>
              </div>
              <Button
                className="mt-3 w-full"
                onClick={() => {
                  setSelected(null)
                  setNewLecture(initialLectureForm())
                  setCreatingLecture(true)
                }}
              >
                Thêm bài học
              </Button>
            </div>

            {lectures.length === 0 ? (
              <div className="p-5 text-center">
                <p className="font-bold text-text">Chưa có bài học</p>
                <p className="mt-1 text-sm text-muted">Tạo bài đầu tiên theo bốn trạm ở khu vực bên cạnh.</p>
              </div>
            ) : (
              <ol className="divide-y divide-border/60" aria-label="Danh sách bài học">
                {lectures.map((lecture, index) => (
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
                      <span className="block text-xs font-bold text-muted">Bài {index + 1}{lecture.archived ? ' · Đang ẩn' : ''}</span>
                      <span className="mt-0.5 block font-bold text-text">{lecture.title}</span>
                      <span className="mt-1 block text-xs text-muted">{PRACTICE_OPTIONS.find((option) => option.id === lecture.practiceKind)?.label ?? 'Hoạt động sáng tạo'}{lecture.videoUrl ? ' · Có video' : ''}</span>
                    </button>
                    <div className="mt-1 flex justify-end gap-1">
                      <button type="button" className="min-h-11 rounded-lg px-3 text-xs font-bold text-muted hover:bg-sky-50 disabled:opacity-30" disabled={index === 0} onClick={() => void moveLecture(lecture.id, -1)} aria-label={`Đưa ${lecture.title} lên trước`}>Lên</button>
                      <button type="button" className="min-h-11 rounded-lg px-3 text-xs font-bold text-muted hover:bg-sky-50 disabled:opacity-30" disabled={index === lectures.length - 1} onClick={() => void moveLecture(lecture.id, 1)} aria-label={`Đưa ${lecture.title} xuống sau`}>Xuống</button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </aside>

      <main className="min-w-0">
        {creatingLecture && selectedCourseId ? (
          <LectureAuthoringForm
            value={newLecture}
            onChange={setNewLecture}
            onSubmit={(event) => void createLecture(event)}
            submitLabel="Tạo bài học"
            idEditable
            onCancel={() => setCreatingLecture(false)}
          />
        ) : selected ? (
          <LectureAuthoringForm
            value={editForm}
            onChange={setEditForm}
            onSubmit={(event) => void saveLecture(event)}
            submitLabel="Lưu thay đổi"
            onCancel={() => setSelected(null)}
            secondaryActions={selected.archived ? (
              <Button type="button" variant="secondary" onClick={() => void restoreLecture(selected.id)}>Khôi phục bài học</Button>
            ) : (
              <Button type="button" variant="ghost" className="text-danger" onClick={() => setArchiveTarget(selected)}>Ẩn bài học</Button>
            )}
          />
        ) : activeCourse ? (
          <section className="ui-card p-8 text-center">
            <p className="font-display text-2xl text-text">{activeCourse.shortTitle || activeCourse.title}</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Chọn một bài bên trái để chỉnh sửa, hoặc thêm bài mới. Mỗi bài cần đủ bốn trạm: Khám phá, Trò chơi, Sáng tạo và Thử tài.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button onClick={() => setCreatingLecture(true)}>Thêm bài học</Button>
              <Button
                variant="secondary"
                disabled={lectures.filter((lecture) => !lecture.archived).length === 0}
                onClick={() => void patchCourseStatus(activeCourse.id, activeCourse.status === 'open' ? 'soon' : 'open')}
              >
                {activeCourse.status === 'open' ? 'Ẩn khỏi học sinh' : 'Mở cho học sinh'}
              </Button>
            </div>
          </section>
        ) : (
          <section className="ui-card p-8 text-center">
            <p className="font-display text-xl text-text">Chọn một khóa học để bắt đầu</p>
          </section>
        )}
      </main>
    </div>
  )

  // Stats tab
  const statsTab = (
    <div className="ui-card min-w-0 p-5">{/* min-w-0 ensures inner overflow-x-auto works */}
      <h2 className="font-display mb-4 text-xl">Thống kê lớp học</h2>
      {!stats ? (
        <p className="text-muted">Chưa có lớp hoặc dữ liệu thống kê.</p>
      ) : (
        <>
          <p className="mb-4 font-bold">{stats.className} · <span className="font-mono text-sky-600">{stats.code}</span></p>
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <StatCard label="Học sinh" value={stats.studentCount} icon={<CmsUsersIcon />} />
            <StatCard label="Trạm hoàn thành" value={stats.totalCompletedQuests} icon={<CmsAnalyticsIcon />} />
            <StatCard label="Bài học đang mở" value={stats.openQuestCount} icon={<CmsLecturesIcon />} />
            <StatCard label="Sản phẩm" value={stats.projectCount} icon={<CmsCoursesIcon />} />
          </div>
          <div className="mb-4 rounded-2xl bg-sun-100/50 px-4 py-3 text-sm leading-relaxed text-text">
            <strong>{stats.students.filter((student) => student.needsSupport).length} học sinh nên được hỏi thăm.</strong>{' '}
            Gợi ý dựa trên tiến độ gần đây, không dùng để xếp hạng hay đánh giá trẻ.
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border">
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
              {stats.students.map((s) => (
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
    class: 'Lớp & Học sinh',
    courses: 'Khóa học',
    lectures: 'Bài giảng',
    stats: 'Thống kê',
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-500">CMS · Giảng viên</p>
          <h1 className="font-display text-2xl text-text">{tabTitles[tab]}</h1>
        </div>
        <Button variant="ghost" onClick={async () => { await logout(); navigate('/') }}>
          Đăng xuất
        </Button>
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
    </div>
  )
}
