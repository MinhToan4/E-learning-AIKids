/**
 * TeacherPage — Full redesign with:
 * - Route-controlled tabs (prop `tab` from App.tsx)
 * - Toast popup notifications
 * - ConfirmDialog
 * - Complete course creation flow: course → lectures → edit → publish
 * - Full-width layout (CmsShell handles sidebar)
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useToast } from '@/shared/hooks/useToast'
import { api, type LectureRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'

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

const PRACTICE_KINDS = ['intro','journal','sketch','character','style','chips','ai_pick','story','comic','video','detective','palette','reflect','match','drag','spin']

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
function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <span className="text-lg">{icon}</span>
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
      {status === 'open' ? '🟢 Mở' : '🟡 Ẩn'}
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
  const [newCourse, setNewCourse] = useState({
    id: '', title: '', shortTitle: '', tagline: '', description: '',
    productLabel: '', ageTrack: 'L1', courseKey: 'K1', durationLabel: '8 tuần',
    skillsText: '', outcomesText: '', credential: '', finalAssessment: '',
  })

  // Lectures state
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selected, setSelected] = useState<Lecture | null>(null)
  const [editForm, setEditForm] = useState(initialLectureForm)
  const [newLecture, setNewLecture] = useState(initialLectureForm)
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
    try {
      await api('/api/teacher/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...newCourse,
          ageLabel: newCourse.ageTrack === 'L2' ? '9–11 tuổi' : '6–8 tuổi',
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
      navigate('/teacher/lectures')
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không tạo khóa', 'error') }
  }

  async function patchCourseStatus(courseId: string, status: 'open' | 'soon') {
    try {
      await api(`/api/teacher/courses/${courseId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      showToast(status === 'open' ? '🟢 Đã mở khóa cho học sinh' : '🟡 Đã ẩn khóa', 'success')
      await loadLectures()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi cập nhật khóa', 'error') }
  }

  async function createLecture(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCourseId) { showToast('Chọn khóa học trước', 'error'); return }
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
          concept: newLecture.concept,
          example: newLecture.example,
          reward: newLecture.reward,
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
                      <td className="px-4 py-2 text-xs text-muted">{s.completedQuests} trạm · {s.totalStars}⭐ · {s.projectCount} dự án</td>
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
                  <button type="button" className="text-xs text-muted" onClick={() => setProgressDetail(null)}>✕</button>
                </div>
                <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                  {progressDetail.quests.length === 0 ? (
                    <li className="text-muted">Chưa hoàn thành trạm nào</li>
                  ) : progressDetail.quests.map((q, i) => (
                    <li key={i} className="flex justify-between gap-2 rounded-lg bg-brand-50/50 px-2 py-1">
                      <span className="truncate">{q.title}</span>
                      <span className="shrink-0 text-muted">{q.status} · {q.stars}⭐</span>
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

  // Courses tab — full course creation flow
  const coursesTab = (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      {/* Course list */}
      <div className="ui-card overflow-hidden">
        <div className="border-b border-border/60 px-4 py-3">
          <h2 className="font-display text-xl">Danh sách khóa học</h2>
          <p className="text-xs text-muted">Tạo khóa → Thêm bài giảng → Chuyển "Mở" để học sinh thấy</p>
        </div>
        {courses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted">Chưa có khóa nào. Tạo khóa đầu tiên bên cạnh →</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {courses.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{c.shortTitle || c.title}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-muted">{c.id} · {c.ageTrack ?? '—'} · {c.lectures.length} bài</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="!min-h-8 !text-xs"
                    variant="secondary"
                    onClick={() => { setSelectedCourseId(c.id); navigate('/teacher/lectures') }}
                  >
                    Bài giảng
                  </Button>
                  <Button
                    className="!min-h-8 !text-xs"
                    variant="ghost"
                    onClick={() => void patchCourseStatus(c.id, c.status === 'open' ? 'soon' : 'open')}
                  >
                    {c.status === 'open' ? 'Ẩn' : 'Mở'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create course form */}
      <form className="ui-card flex flex-col gap-3 p-5" onSubmit={(e) => void createCourse(e)}>
        <h2 className="font-display text-xl">Tạo khóa mới</h2>
        <p className="text-xs text-muted">Sau khi tạo, thêm bài giảng rồi mở "Mở" để học sinh thấy.</p>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          ID slug (duy nhất, vd l1-k7-ai-art)
          <input className="min-h-10 rounded-xl border-2 border-border px-3 font-mono text-sm normal-case" placeholder="l1-k7-ten-khoa" value={newCourse.id} onChange={(e) => setNewCourse((c) => ({ ...c, id: e.target.value.toLowerCase() }))} required pattern="[a-z0-9-]+" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Tiêu đề đầy đủ
          <input className="min-h-10 rounded-xl border-2 border-border px-3 normal-case" placeholder="Tên khóa học" value={newCourse.title} onChange={(e) => setNewCourse((c) => ({ ...c, title: e.target.value }))} required />
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Tên ngắn (hiển thị thẻ)
          <input className="min-h-10 rounded-xl border-2 border-border px-3 normal-case" placeholder="Tên ngắn" value={newCourse.shortTitle} onChange={(e) => setNewCourse((c) => ({ ...c, shortTitle: e.target.value }))} required />
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Tagline (câu mô tả ngắn)
          <input className="min-h-10 rounded-xl border-2 border-border px-3 normal-case" placeholder="Học AI sáng tạo cùng bạn bè!" value={newCourse.tagline} onChange={(e) => setNewCourse((c) => ({ ...c, tagline: e.target.value }))} required />
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Mô tả chi tiết
          <textarea className="min-h-24 rounded-xl border-2 border-border px-3 py-2 text-sm normal-case font-normal" placeholder="Mô tả khóa học..." value={newCourse.description} onChange={(e) => setNewCourse((c) => ({ ...c, description: e.target.value }))} required />
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Nhóm tuổi
          <select className="min-h-10 rounded-xl border-2 border-border px-2 normal-case" value={newCourse.ageTrack} onChange={(e) => setNewCourse((c) => ({ ...c, ageTrack: e.target.value }))}>
            <option value="L1">6–8 tuổi · Khám phá có hướng dẫn</option>
            <option value="L2">9–11 tuổi · Sáng tạo và kiểm chứng</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
            Chặng K
            <select className="min-h-10 rounded-xl border-2 border-border px-2 normal-case" value={newCourse.courseKey} onChange={(e) => setNewCourse((c) => ({ ...c, courseKey: e.target.value }))}>
              {['K1','K2','K3','K4','K5','K6'].map((key) => <option key={key}>{key}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
            Thời lượng
            <input className="min-h-10 rounded-xl border-2 border-border px-3 normal-case" value={newCourse.durationLabel} onChange={(e) => setNewCourse((c) => ({ ...c, durationLabel: e.target.value }))} required />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Sản phẩm cuối khóa
          <textarea className="min-h-16 rounded-xl border-2 border-border px-3 py-2 text-sm normal-case font-normal" placeholder="Ví dụ: Bộ truyện 4 khung có bản nháp, bản sửa và phần giải thích" value={newCourse.productLabel} onChange={(e) => setNewCourse((c) => ({ ...c, productLabel: e.target.value }))} required />
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Con sẽ học được gì · mỗi dòng một kỹ năng
          <textarea className="min-h-24 rounded-xl border-2 border-border px-3 py-2 text-sm normal-case font-normal" value={newCourse.skillsText} onChange={(e) => setNewCourse((c) => ({ ...c, skillsText: e.target.value }))} required placeholder={'Lập dàn ý câu chuyện\nKiểm tra và sửa kết quả tạo ra'} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Kết quả quan sát được · mỗi dòng một kết quả
          <textarea className="min-h-24 rounded-xl border-2 border-border px-3 py-2 text-sm normal-case font-normal" value={newCourse.outcomesText} onChange={(e) => setNewCourse((c) => ({ ...c, outcomesText: e.target.value }))} required placeholder={'Hoàn thành sản phẩm cuối khóa\nGiải thích được lựa chọn và điểm cần cải thiện'} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Ghi nhận hoàn thành
          <input className="min-h-10 rounded-xl border-2 border-border px-3 normal-case" value={newCourse.credential} onChange={(e) => setNewCourse((c) => ({ ...c, credential: e.target.value }))} required placeholder="Huy hiệu Nhà sáng tạo truyện có trách nhiệm" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
          Cách đánh giá cuối khóa
          <textarea className="min-h-20 rounded-xl border-2 border-border px-3 py-2 text-sm normal-case font-normal" value={newCourse.finalAssessment} onChange={(e) => setNewCourse((c) => ({ ...c, finalAssessment: e.target.value }))} required placeholder="Con trình bày sản phẩm, thử một tình huống khó và sửa theo phản hồi." />
        </label>
        <p className="rounded-2xl bg-sky-50 px-3 py-2 text-xs leading-relaxed text-muted">
          Đơn vị ghi nhận: <strong>AI Kids Creator Academy</strong>. Khóa chỉ có thể mở sau khi đã có bài học và đủ thông tin đánh giá.
        </p>
        <Button type="submit">Tạo bản nháp khóa học</Button>
      </form>
    </div>
  )

  // Lectures tab — full 3-column CMS
  const lecturesTab = (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr_320px]">
      {/* Col 1: Course selector */}
      <div className="ui-card p-3">
        <p className="mb-2 text-xs font-extrabold uppercase text-muted">Chọn khóa học</p>
        {courses.length === 0 ? (
          <p className="text-xs text-muted">Chưa có khóa. <button type="button" className="font-bold text-sky-600 underline" onClick={() => navigate('/teacher/courses')}>Tạo khóa</button></p>
        ) : courses.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setSelectedCourseId(c.id); setSelected(null) }}
            className={cn('mb-1 w-full rounded-xl px-2 py-2.5 text-left text-sm font-bold transition',
              selectedCourseId === c.id ? 'bg-sky-100 text-sky-700' : 'hover:bg-sky-50 text-muted'
            )}
          >
            <span className="block truncate">{c.shortTitle || c.title}</span>
            <span className="text-xs font-normal text-muted">{c.lectures.length} bài · <StatusBadge status={c.status} /></span>
          </button>
        ))}
      </div>

      {/* Col 2: Lecture list + create form */}
      <div className="ui-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-extrabold uppercase text-muted">
            Bài giảng{activeCourse ? ` · ${activeCourse.shortTitle}` : ''}
          </p>
          {activeCourse && (
            <div className="flex items-center gap-2">
              <StatusBadge status={activeCourse.status} />
              <Button
                variant="ghost"
                className="!min-h-7 !px-2 !text-xs"
                onClick={() => void patchCourseStatus(activeCourse.id, activeCourse.status === 'open' ? 'soon' : 'open')}
              >
                {activeCourse.status === 'open' ? 'Ẩn khóa' : 'Mở khóa'}
              </Button>
            </div>
          )}
        </div>

        {!selectedCourseId ? (
          <p className="text-sm text-muted">Chọn khóa học bên trái</p>
        ) : lectures.length === 0 ? (
          <p className="text-sm text-muted">Chưa có bài giảng nào. Thêm bên dưới.</p>
        ) : (
          <ul className="mb-3 space-y-1">
            {lectures.map((l, idx) => (
              <li key={l.id} className={cn('flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm transition',
                selected?.id === l.id ? 'bg-brand-50 border border-brand-500/30' : 'hover:bg-sky-50/50',
                l.archived ? 'opacity-50' : ''
              )}>
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => pickLecture(l)}>
                  <span className="font-bold">{l.order}. {l.title}</span>
                  {l.archived && <span className="ml-1 text-xs text-muted">[ẩn]</span>}
                  {l.videoUrl && <span className="ml-1 text-xs text-success">🎬</span>}
                  <span className="ml-2 text-xs text-muted">{l.practiceKind}</span>
                </button>
                <button type="button" className="shrink-0 text-xs text-muted disabled:opacity-30" disabled={idx === 0} onClick={() => void moveLecture(l.id, -1)}>↑</button>
                <button type="button" className="shrink-0 text-xs text-muted disabled:opacity-30" disabled={idx === lectures.length - 1} onClick={() => void moveLecture(l.id, 1)}>↓</button>
              </li>
            ))}
          </ul>
        )}

        {/* Create lecture form */}
        {selectedCourseId && (
          <form className="border-t border-border pt-3" onSubmit={(e) => void createLecture(e)}>
            <p className="mb-2 text-xs font-extrabold uppercase text-muted">Thêm bài giảng mới</p>
            <div className="flex flex-col gap-2">
              <input className="min-h-9 rounded-lg border border-border px-2 font-mono text-xs" placeholder="id-slug (vd bai-1-gioi-thieu)" value={newLecture.id} onChange={(e) => setNewLecture((n) => ({ ...n, id: e.target.value.toLowerCase() }))} required pattern="[a-z0-9-]+" />
              <input className="min-h-9 rounded-lg border border-border px-2 text-sm" placeholder="Tiêu đề bài" value={newLecture.title} onChange={(e) => setNewLecture((n) => ({ ...n, title: e.target.value }))} required />
              <input className="min-h-9 rounded-lg border border-border px-2 text-sm" placeholder="Kỹ năng quan sát được" value={newLecture.skill} onChange={(e) => setNewLecture((n) => ({ ...n, skill: e.target.value }))} required />
              <input className="min-h-9 rounded-lg border border-border px-2 text-sm" placeholder="Câu chuyện mở đầu nhiệm vụ" value={newLecture.hook} onChange={(e) => setNewLecture((n) => ({ ...n, hook: e.target.value }))} required />
              <select className="min-h-9 rounded-lg border border-border px-2 text-sm" value={newLecture.practiceKind} onChange={(e) => setNewLecture((n) => ({ ...n, practiceKind: e.target.value }))}>
                {PRACTICE_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <textarea className="min-h-16 rounded-lg border border-border px-2 py-1 text-xs" placeholder="Mục tiêu · mỗi dòng một mục tiêu" value={newLecture.goalsText} onChange={(e) => setNewLecture((n) => ({ ...n, goalsText: e.target.value }))} required />
              <textarea className="min-h-20 rounded-lg border border-border px-2 py-1 text-xs" placeholder="Ý chính trẻ cần hiểu" value={newLecture.concept} onChange={(e) => setNewLecture((n) => ({ ...n, concept: e.target.value }))} required minLength={10} />
              <textarea className="min-h-16 rounded-lg border border-border px-2 py-1 text-xs" placeholder="Ví dụ gần gũi với trẻ" value={newLecture.example} onChange={(e) => setNewLecture((n) => ({ ...n, example: e.target.value }))} required />

              <details className="rounded-xl border border-border bg-sky-50/40 p-3" open>
                <summary className="cursor-pointer text-xs font-extrabold uppercase text-sky-700">Game tương tác</summary>
                <div className="mt-3 flex flex-col gap-2">
                  <select className="min-h-9 rounded-lg border border-border px-2 text-sm" value={newLecture.gameType} onChange={(e) => setNewLecture((n) => ({ ...n, gameType: e.target.value }))}>
                    <option value="pick">Chọn manh mối</option>
                    <option value="detective">Thám tử</option>
                    <option value="match">Ghép cặp</option>
                    <option value="order">Xếp thứ tự</option>
                    <option value="spin">Vòng quay</option>
                  </select>
                  <textarea className="min-h-16 rounded-lg border border-border px-2 py-1 text-xs" placeholder="Hướng dẫn chơi rõ ràng" value={newLecture.gameInstruction} onChange={(e) => setNewLecture((n) => ({ ...n, gameInstruction: e.target.value }))} required />
                  <input className="min-h-9 rounded-lg border border-border px-2 text-xs" placeholder="Điều trẻ hiểu sau trò chơi" value={newLecture.gameOutcome} onChange={(e) => setNewLecture((n) => ({ ...n, gameOutcome: e.target.value }))} required />
                  <textarea className="min-h-16 rounded-lg border border-border px-2 py-1 text-xs" placeholder="Thẻ chơi · mỗi dòng một thẻ, tối thiểu 2" value={newLecture.gameCardsText} onChange={(e) => setNewLecture((n) => ({ ...n, gameCardsText: e.target.value }))} required />
                </div>
              </details>

              <details className="rounded-xl border border-border bg-mint-100/30 p-3" open>
                <summary className="cursor-pointer text-xs font-extrabold uppercase text-success">Thực hành và sản phẩm</summary>
                <div className="mt-3 flex flex-col gap-2">
                  <textarea className="min-h-20 rounded-lg border border-border px-2 py-1 text-xs" placeholder="Nhiệm vụ thực hành từng bước" value={newLecture.practiceInstruction} onChange={(e) => setNewLecture((n) => ({ ...n, practiceInstruction: e.target.value }))} required />
                  <input className="min-h-9 rounded-lg border border-border px-2 text-xs" placeholder="Sản phẩm cần lưu sau bài" value={newLecture.product} onChange={(e) => setNewLecture((n) => ({ ...n, product: e.target.value }))} required />
                  <input className="min-h-9 rounded-lg border border-border px-2 text-xs" placeholder="Phần thưởng phù hợp" value={newLecture.reward} onChange={(e) => setNewLecture((n) => ({ ...n, reward: e.target.value }))} required />
                </div>
              </details>

              <details className="rounded-xl border border-border bg-sun-100/30 p-3" open>
                <summary className="cursor-pointer text-xs font-extrabold uppercase text-warning">Thử tài cuối bài</summary>
                <div className="mt-3 flex flex-col gap-2">
                  <textarea className="min-h-16 rounded-lg border border-border px-2 py-1 text-xs" placeholder="Câu hỏi kiểm tra hiểu bài" value={newLecture.checkQuestion} onChange={(e) => setNewLecture((n) => ({ ...n, checkQuestion: e.target.value }))} required />
                  {[1, 2, 3].map((number) => {
                    const key = `checkOption${number}` as 'checkOption1' | 'checkOption2' | 'checkOption3'
                    return <input key={key} className="min-h-9 rounded-lg border border-border px-2 text-xs" placeholder={`Lựa chọn ${number}`} value={newLecture[key]} onChange={(e) => setNewLecture((n) => ({ ...n, [key]: e.target.value }))} required />
                  })}
                  <label className="text-xs font-bold text-muted">Đáp án đúng
                    <select className="ml-2 min-h-9 rounded-lg border border-border px-2" value={newLecture.correctIndex} onChange={(e) => setNewLecture((n) => ({ ...n, correctIndex: e.target.value }))}>
                      <option value="0">Lựa chọn 1</option><option value="1">Lựa chọn 2</option><option value="2">Lựa chọn 3</option>
                    </select>
                  </label>
                  <textarea className="min-h-16 rounded-lg border border-border px-2 py-1 text-xs" placeholder="Giải thích sau khi trả lời" value={newLecture.checkExplain} onChange={(e) => setNewLecture((n) => ({ ...n, checkExplain: e.target.value }))} required />
                </div>
              </details>
              <Button type="submit" className="!min-h-11 !text-xs">Tạo bài học đầy đủ 4 trạm</Button>
            </div>
          </form>
        )}
      </div>

      {/* Col 3: Edit selected lecture */}
      <div className="ui-card p-4">
        {selected ? (
          <form className="flex flex-col gap-3" onSubmit={(e) => void saveLecture(e)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg leading-tight">{selected.title}</h2>
                <p className="font-mono text-xs text-muted">{selected.id}</p>
              </div>
              <button type="button" className="text-xs text-muted" onClick={() => setSelected(null)}>✕</button>
            </div>

            <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
              Tiêu đề
              <input className="min-h-10 w-full rounded-xl border-2 border-border px-2 normal-case" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
              Hook (câu mở đầu)
              <textarea className="min-h-16 w-full rounded-xl border-2 border-border px-2 py-1 text-sm normal-case font-normal" value={editForm.hook} onChange={(e) => setEditForm((f) => ({ ...f, hook: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
              Kỹ năng
              <input className="min-h-10 w-full rounded-xl border-2 border-border px-2 normal-case" value={editForm.skill} onChange={(e) => setEditForm((f) => ({ ...f, skill: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
              Loại thực hành
              <select className="min-h-10 w-full rounded-xl border-2 border-border px-2 normal-case" value={editForm.practiceKind} onChange={(e) => setEditForm((f) => ({ ...f, practiceKind: e.target.value }))}>
                {PRACTICE_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-extrabold uppercase text-muted">
              🎬 Video URL (HTTPS)
              <input className="min-h-10 w-full rounded-xl border-2 border-border px-2 font-mono text-xs normal-case" value={editForm.videoUrl} onChange={(e) => setEditForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://..." />
            </label>
            {editForm.videoUrl && (
              <p className="rounded-xl bg-mint-100 px-2 py-1 text-xs text-success">✅ Video đã có</p>
            )}

            <details className="rounded-xl border border-border bg-sky-50/50 p-3" open>
              <summary className="cursor-pointer text-xs font-extrabold uppercase text-sky-700">Nội dung khám phá</summary>
              <div className="mt-3 flex flex-col gap-2">
                <textarea className="min-h-20 rounded-xl border-2 border-border px-2 py-1 text-sm" value={editForm.goalsText} onChange={(e) => setEditForm((f) => ({ ...f, goalsText: e.target.value }))} placeholder="Mỗi dòng một mục tiêu" required />
                <textarea className="min-h-24 rounded-xl border-2 border-border px-2 py-1 text-sm" value={editForm.concept} onChange={(e) => setEditForm((f) => ({ ...f, concept: e.target.value }))} placeholder="Ý chính trẻ cần hiểu" required minLength={10} />
                <textarea className="min-h-20 rounded-xl border-2 border-border px-2 py-1 text-sm" value={editForm.example} onChange={(e) => setEditForm((f) => ({ ...f, example: e.target.value }))} placeholder="Ví dụ gần gũi" required />
              </div>
            </details>

            <details className="rounded-xl border border-border bg-brand-50/50 p-3">
              <summary className="cursor-pointer text-xs font-extrabold uppercase text-brand-700">Trò chơi tương tác</summary>
              <div className="mt-3 flex flex-col gap-2">
                <select className="min-h-10 rounded-xl border-2 border-border px-2 text-sm" value={editForm.gameType} onChange={(e) => setEditForm((f) => ({ ...f, gameType: e.target.value }))}>
                  <option value="pick">Chọn manh mối</option><option value="detective">Thám tử</option><option value="match">Ghép cặp</option><option value="order">Xếp thứ tự</option><option value="sort">Phân loại</option><option value="drag">Kéo thả</option><option value="spin">Vòng quay</option>
                </select>
                <textarea className="min-h-20 rounded-xl border-2 border-border px-2 py-1 text-sm" value={editForm.gameInstruction} onChange={(e) => setEditForm((f) => ({ ...f, gameInstruction: e.target.value }))} placeholder="Hướng dẫn chơi" required minLength={10} />
                <input className="min-h-10 rounded-xl border-2 border-border px-2 text-sm" value={editForm.gameOutcome} onChange={(e) => setEditForm((f) => ({ ...f, gameOutcome: e.target.value }))} placeholder="Điều trẻ hiểu sau trò chơi" required />
                <textarea className="min-h-20 rounded-xl border-2 border-border px-2 py-1 text-sm" value={editForm.gameCardsText} onChange={(e) => setEditForm((f) => ({ ...f, gameCardsText: e.target.value }))} placeholder="Mỗi dòng một thẻ chơi" required />
              </div>
            </details>

            <details className="rounded-xl border border-border bg-mint-100/30 p-3">
              <summary className="cursor-pointer text-xs font-extrabold uppercase text-success">Thực hành và sản phẩm</summary>
              <div className="mt-3 flex flex-col gap-2">
                <textarea className="min-h-24 rounded-xl border-2 border-border px-2 py-1 text-sm" value={editForm.practiceInstruction} onChange={(e) => setEditForm((f) => ({ ...f, practiceInstruction: e.target.value }))} placeholder="Nhiệm vụ thực hành từng bước" required minLength={10} />
                <input className="min-h-10 rounded-xl border-2 border-border px-2 text-sm" value={editForm.product} onChange={(e) => setEditForm((f) => ({ ...f, product: e.target.value }))} placeholder="Sản phẩm trẻ sẽ hoàn thành" required />
              </div>
            </details>

            <details className="rounded-xl border border-border bg-sun-100/30 p-3">
              <summary className="cursor-pointer text-xs font-extrabold uppercase text-warning">Thử tài cuối bài</summary>
              <div className="mt-3 flex flex-col gap-2">
                <textarea className="min-h-20 rounded-xl border-2 border-border px-2 py-1 text-sm" value={editForm.checkQuestion} onChange={(e) => setEditForm((f) => ({ ...f, checkQuestion: e.target.value }))} placeholder="Câu hỏi kiểm tra" required />
                {([1, 2, 3] as const).map((number) => {
                  const key = `checkOption${number}` as const
                  return <input key={key} className="min-h-10 rounded-xl border-2 border-border px-2 text-sm" value={editForm[key]} onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={`Lựa chọn ${number}`} required />
                })}
                <select className="min-h-10 rounded-xl border-2 border-border px-2 text-sm" value={editForm.correctIndex} onChange={(e) => setEditForm((f) => ({ ...f, correctIndex: e.target.value }))} aria-label="Đáp án đúng">
                  <option value="0">Đúng: lựa chọn 1</option><option value="1">Đúng: lựa chọn 2</option><option value="2">Đúng: lựa chọn 3</option>
                </select>
                <textarea className="min-h-20 rounded-xl border-2 border-border px-2 py-1 text-sm" value={editForm.checkExplain} onChange={(e) => setEditForm((f) => ({ ...f, checkExplain: e.target.value }))} placeholder="Giải thích nhẹ nhàng sau khi trả lời" required />
              </div>
            </details>

            <Button type="submit">Lưu đầy đủ 4 trạm</Button>

            <div className="border-t border-border pt-2">
              {selected.archived ? (
                <Button type="button" variant="secondary" className="w-full" onClick={() => void restoreLecture(selected.id)}>
                  ♻️ Khôi phục bài
                </Button>
              ) : (
                <Button type="button" variant="ghost" className="w-full text-danger" onClick={() => setArchiveTarget(selected)}>
                  🙈 Ẩn bài (archive)
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-center">
            <span className="text-4xl">👈</span>
            <p className="text-sm text-muted">Chọn một bài giảng để chỉnh sửa</p>
          </div>
        )}
      </div>
    </div>
  )

  // Stats tab
  const statsTab = (
    <div className="ui-card p-5">
      <h2 className="font-display mb-4 text-xl">Thống kê lớp học</h2>
      {!stats ? (
        <p className="text-muted">Chưa có lớp hoặc dữ liệu thống kê.</p>
      ) : (
        <>
          <p className="mb-4 font-bold">{stats.className} · <span className="font-mono text-sky-600">{stats.code}</span></p>
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <StatCard label="Học sinh" value={stats.studentCount} icon="👧" />
            <StatCard label="Trạm hoàn thành" value={stats.totalCompletedQuests} icon="⭐" />
            <StatCard label="Quest đang mở" value={stats.openQuestCount} icon="🎯" />
            <StatCard label="Dự án" value={stats.projectCount} icon="🎨" />
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
