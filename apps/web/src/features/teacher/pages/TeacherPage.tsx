import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { api, type LectureRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'

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
  }>
}

type Tab = 'class' | 'courses' | 'lectures' | 'stats'

export function TeacherPage() {
  const [tab, setTab] = useState<Tab>('class')
  const [classInfo, setClassInfo] = useState<{ name: string; code: string } | null>(
    null,
  )
  const [students, setStudents] = useState<StudentRow[]>([])
  const [courses, setCourses] = useState<CourseLectures[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selected, setSelected] = useState<Lecture | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [hook, setHook] = useState('')
  const [skill, setSkill] = useState('')
  const [practiceKind, setPracticeKind] = useState('intro')
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newStudent, setNewStudent] = useState('')
  const [classForm, setClassForm] = useState({ name: '', code: '' })
  const [stats, setStats] = useState<ClassStats | null>(null)
  const [progressDetail, setProgressDetail] = useState<{
    nickname: string | null
    quests: Array<{ title: string; status: string; stars: number }>
  } | null>(null)
  const [newCourse, setNewCourse] = useState({
    id: '',
    title: '',
    shortTitle: '',
    tagline: '',
    description: '',
    productLabel: 'Sản phẩm khóa',
    ageLabel: '6–8 tuổi',
  })
  const [newLecture, setNewLecture] = useState({
    id: '',
    title: '',
    skill: 'Kỹ năng mới',
    hook: 'Chào con!',
    practiceKind: 'intro',
  })
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  async function loadClass() {
    const data = await api<{
      class: { name: string; code: string } | null
      students: StudentRow[]
    }>('/api/teacher/class')
    setClassInfo(data.class)
    setStudents(data.students)
  }

  async function loadLectures() {
    const data = await api<{ courses: CourseLectures[] }>('/api/teacher/lectures')
    setCourses(data.courses)
    if (!selectedCourseId && data.courses[0]) {
      setSelectedCourseId(data.courses[0].id)
    }
  }

  async function loadStats() {
    const data = await api<{ stats: ClassStats | null }>('/api/teacher/class/stats')
    setStats(data.stats)
  }

  useEffect(() => {
    void (async () => {
      try {
        setError(null)
        if (tab === 'class') await loadClass()
        else if (tab === 'stats') await loadStats()
        else await loadLectures()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi')
      }
    })()
  }, [tab])

  const activeCourse = courses.find((c) => c.id === selectedCourseId)
  const lectures = activeCourse?.lectures ?? []

  function pickLecture(l: Lecture) {
    setSelected(l)
    setVideoUrl(l.videoUrl ?? '')
    setTitle(l.title)
    setHook(l.hook)
    setSkill(l.skill ?? '')
    setPracticeKind(l.practiceKind)
    setMsg(null)
  }

  async function saveLecture(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setError(null)
    try {
      const data = await api<{ lecture: Lecture }>(
        `/api/teacher/lectures/${selected.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            title,
            hook,
            skill: skill || undefined,
            practiceKind,
            videoUrl: videoUrl.trim() === '' ? null : videoUrl.trim(),
          }),
        },
      )
      setSelected({ ...selected, ...data.lecture })
      setMsg('Đã lưu bài giảng')
      await loadLectures()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được')
    }
  }

  async function saveClass(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const name = (classForm.name || classInfo?.name || '').trim()
    const code = (classForm.code || classInfo?.code || '').trim().toUpperCase()
    if (name.length < 2 || code.length < 3) {
      setError('Tên lớp và mã lớp không hợp lệ')
      return
    }
    try {
      await api('/api/teacher/class', {
        method: 'POST',
        body: JSON.stringify({ name, code }),
      })
      setMsg('Đã lưu lớp học')
      setClassForm({ name: '', code: '' })
      await loadClass()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được lớp')
    }
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/api/teacher/class/students', {
        method: 'POST',
        body: JSON.stringify({ nickname: newStudent.trim() }),
      })
      setNewStudent('')
      setMsg('Đã thêm học sinh vào lớp')
      await loadClass()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thêm được')
    }
  }

  async function removeStudent(id: string) {
    try {
      await api(`/api/teacher/class/students/${id}`, { method: 'DELETE' })
      setMsg('Đã gỡ học sinh khỏi lớp')
      await loadClass()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gỡ được')
    }
  }

  async function viewProgress(studentId: string) {
    try {
      const data = await api<{
        student: { nickname: string | null }
        progress: Array<{
          questTitle: string
          status: string
          stars: number
        }>
      }>(`/api/teacher/students/${studentId}/progress`)
      setProgressDetail({
        nickname: data.student.nickname,
        quests: data.progress.map((p) => ({
          title: p.questTitle,
          status: p.status,
          stars: p.stars,
        })),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải tiến trình')
    }
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await api('/api/teacher/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...newCourse,
          coverFrom: '#6d5efc',
          coverTo: '#3dbfff',
          accent: '#6d5efc',
          skillsJson: '[]',
        }),
      })
      setMsg('Đã tạo khóa (status: soon). Thêm bài giảng rồi mở open.')
      setNewCourse({
        id: '',
        title: '',
        shortTitle: '',
        tagline: '',
        description: '',
        productLabel: 'Sản phẩm khóa',
        ageLabel: '6–8 tuổi',
      })
      await loadLectures()
      setTab('lectures')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo khóa')
    }
  }

  async function patchCourseStatus(courseId: string, status: 'open' | 'soon') {
    try {
      await api(`/api/teacher/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setMsg(status === 'open' ? 'Đã mở khóa cho học sinh' : 'Đã ẩn khóa (soon)')
      await loadLectures()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật khóa')
    }
  }

  async function createLecture(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCourseId) return
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
        }),
      })
      setMsg('Đã tạo bài giảng')
      setNewLecture({
        id: '',
        title: '',
        skill: 'Kỹ năng mới',
        hook: 'Chào con!',
        practiceKind: 'intro',
      })
      await loadLectures()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo bài')
    }
  }

  async function archiveLecture(questId: string) {
    try {
      await api(`/api/teacher/lectures/${questId}`, { method: 'DELETE' })
      setMsg('Đã ẩn bài (soft-archive)')
      setSelected(null)
      await loadLectures()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không ẩn được')
    }
  }

  async function restoreLecture(questId: string) {
    try {
      await api(`/api/teacher/lectures/${questId}/restore`, { method: 'POST' })
      setMsg('Đã khôi phục bài')
      await loadLectures()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không khôi phục')
    }
  }

  async function moveLecture(questId: string, dir: -1 | 1) {
    const ids = lectures.map((l) => l.id)
    const i = ids.indexOf(questId)
    const j = i + dir
    if (i < 0 || j < 0 || j >= ids.length) return
    const next = [...ids]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    try {
      await api('/api/teacher/lectures/reorder', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourseId,
          orderedQuestIds: next,
        }),
      })
      await loadLectures()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không sắp xếp')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-500">
            CMS · Giảng viên · Phase 5
          </p>
          <h1 className="font-display text-3xl">Quản lý lớp & nội dung</h1>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            await logout()
            navigate('/')
          }}
        >
          Đăng xuất
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-sky-100/60 p-1">
        {(
          [
            ['class', 'Lớp & học sinh'],
            ['courses', 'Khóa học'],
            ['lectures', 'Bài giảng'],
            ['stats', 'Thống kê'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-extrabold transition',
              tab === id ? 'bg-white text-sky-600 shadow-soft' : 'text-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm text-success">{msg}</p>
      )}
      {error && (
        <p className="rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {tab === 'class' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          {!classInfo ? (
            <form className="ui-card flex flex-col gap-3 p-4 lg:col-span-2" onSubmit={saveClass}>
              <h2 className="font-display text-xl">Tạo lớp học</h2>
              <p className="text-sm text-muted">
                Mỗi giảng viên có một lớp. Học sinh join bằng mã lớp hoặc bạn thêm theo biệt danh.
              </p>
              <input
                className="min-h-11 rounded-xl border-2 border-border px-3"
                placeholder="Tên lớp (vd Lớp Sao Sáng)"
                value={classForm.name}
                onChange={(e) => setClassForm((c) => ({ ...c, name: e.target.value }))}
                required
                minLength={2}
              />
              <input
                className="min-h-11 rounded-xl border-2 border-border px-3 font-mono uppercase"
                placeholder="Mã lớp (vd STAR-8)"
                value={classForm.code}
                onChange={(e) =>
                  setClassForm((c) => ({ ...c, code: e.target.value.toUpperCase() }))
                }
                required
                minLength={3}
                pattern="[A-Za-z0-9-]+"
              />
              <Button type="submit">Tạo lớp</Button>
            </form>
          ) : (
            <>
              <div className="ui-card overflow-x-auto">
                <p className="border-b border-border px-4 py-3 text-sm">
                  {classInfo.name} · Mã lớp <strong>{classInfo.code}</strong>
                </p>
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-sky-50/80">
                    <tr>
                      <th className="px-4 py-2">Biệt danh</th>
                      <th className="px-4 py-2">Cấp / XP</th>
                      <th className="px-4 py-2">Tiến trình</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-t border-border/60">
                        <td className="px-4 py-2 font-bold">{s.nickname}</td>
                        <td className="px-4 py-2">
                          Lv{s.level} · {s.xp} XP
                        </td>
                        <td className="px-4 py-2 text-xs text-muted">
                          {s.completedQuests} trạm · {s.totalStars}⭐ ·{' '}
                          {s.projectCount} dự án
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button
                            variant="ghost"
                            className="!min-h-8 !px-2 !text-xs"
                            onClick={() => void viewProgress(s.id)}
                          >
                            Chi tiết
                          </Button>
                          <Button
                            variant="ghost"
                            className="!min-h-8 !px-2 !text-xs text-danger"
                            onClick={() => void removeStudent(s.id)}
                          >
                            Gỡ
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3">
                <form className="ui-card flex flex-col gap-3 p-4" onSubmit={addStudent}>
                  <h2 className="font-display text-xl">Thêm học sinh</h2>
                  <input
                    className="min-h-11 rounded-xl border-2 border-border px-3"
                    placeholder="Biệt danh"
                    value={newStudent}
                    onChange={(e) => setNewStudent(e.target.value)}
                    required
                  />
                  <Button type="submit">Thêm vào lớp</Button>
                </form>
                <form className="ui-card flex flex-col gap-2 p-4" onSubmit={saveClass}>
                  <p className="text-xs font-bold uppercase text-muted">Đổi tên / mã lớp</p>
                  <input
                    className="min-h-9 w-full rounded-xl border border-border px-2 text-sm"
                    placeholder="Tên lớp"
                    value={classForm.name || classInfo.name}
                    onChange={(e) =>
                      setClassForm((c) => ({
                        ...c,
                        name: e.target.value,
                        code: c.code || classInfo.code,
                      }))
                    }
                  />
                  <input
                    className="min-h-9 w-full rounded-xl border border-border px-2 font-mono text-sm uppercase"
                    placeholder="Mã"
                    value={classForm.code || classInfo.code}
                    onChange={(e) =>
                      setClassForm((c) => ({
                        ...c,
                        code: e.target.value.toUpperCase(),
                        name: c.name || classInfo.name,
                      }))
                    }
                  />
                  <Button type="submit" variant="secondary" className="!min-h-9 !text-xs">
                    Cập nhật lớp
                  </Button>
                </form>
              </div>
              {progressDetail && (
                <div className="ui-card p-4 lg:col-span-2">
                  <h3 className="font-display text-lg">
                    Tiến trình · {progressDetail.nickname}
                  </h3>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">
                    {progressDetail.quests.map((q, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span>{q.title}</span>
                        <span className="text-muted">
                          {q.status} · {q.stars}⭐
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'courses' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="ui-card p-4">
            <h2 className="font-display mb-3 text-xl">Danh sách khóa</h2>
            <ul className="space-y-2">
              {courses.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50/80 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-extrabold">
                      {c.shortTitle}{' '}
                      <span className="text-xs font-normal text-muted">
                        {c.ageTrack} · {c.status}
                      </span>
                    </p>
                    <p className="text-xs text-muted">
                      {c.lectures.length} bài · {c.id}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      className="!min-h-8 !text-xs"
                      variant="secondary"
                      onClick={() => {
                        setSelectedCourseId(c.id)
                        setTab('lectures')
                      }}
                    >
                      Bài giảng
                    </Button>
                    <Button
                      className="!min-h-8 !text-xs"
                      variant="ghost"
                      onClick={() =>
                        void patchCourseStatus(
                          c.id,
                          c.status === 'open' ? 'soon' : 'open',
                        )
                      }
                    >
                      {c.status === 'open' ? 'Ẩn' : 'Mở'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <form className="ui-card flex flex-col gap-2 p-4" onSubmit={createCourse}>
            <h2 className="font-display text-xl">Tạo khóa mới</h2>
            <input
              className="min-h-10 rounded-xl border-2 border-border px-3 font-mono text-sm"
              placeholder="id-slug (vd l1-k7-demo)"
              value={newCourse.id}
              onChange={(e) =>
                setNewCourse((c) => ({ ...c, id: e.target.value.toLowerCase() }))
              }
              required
              pattern="[a-z0-9-]+"
            />
            <input
              className="min-h-10 rounded-xl border-2 border-border px-3"
              placeholder="Tiêu đề"
              value={newCourse.title}
              onChange={(e) => setNewCourse((c) => ({ ...c, title: e.target.value }))}
              required
            />
            <input
              className="min-h-10 rounded-xl border-2 border-border px-3"
              placeholder="Tên ngắn"
              value={newCourse.shortTitle}
              onChange={(e) =>
                setNewCourse((c) => ({ ...c, shortTitle: e.target.value }))
              }
              required
            />
            <input
              className="min-h-10 rounded-xl border-2 border-border px-3"
              placeholder="Tagline"
              value={newCourse.tagline}
              onChange={(e) =>
                setNewCourse((c) => ({ ...c, tagline: e.target.value }))
              }
              required
            />
            <textarea
              className="min-h-20 rounded-xl border-2 border-border px-3 py-2 text-sm"
              placeholder="Mô tả"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse((c) => ({ ...c, description: e.target.value }))
              }
              required
            />
            <Button type="submit">Tạo (status soon)</Button>
          </form>
        </div>
      )}

      {tab === 'lectures' && (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr_300px]">
          <div className="ui-card p-3">
            <p className="mb-2 text-xs font-bold uppercase text-muted">Khóa</p>
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCourseId(c.id)}
                className={cn(
                  'mb-1 w-full rounded-xl px-2 py-2 text-left text-sm font-bold',
                  selectedCourseId === c.id
                    ? 'bg-sky-100 text-sky-700'
                    : 'hover:bg-sky-50',
                )}
              >
                {c.shortTitle}
              </button>
            ))}
          </div>
          <div className="ui-card p-3">
            <p className="mb-2 text-xs font-bold uppercase text-muted">
              Bài · {activeCourse?.title}
            </p>
            <ul className="space-y-1">
              {lectures.map((l, idx) => (
                <li
                  key={l.id}
                  className={cn(
                    'flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm',
                    selected?.id === l.id ? 'bg-brand-50' : '',
                    l.archived ? 'opacity-50' : '',
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left font-bold"
                    onClick={() => pickLecture(l)}
                  >
                    {l.order}. {l.title}
                    {l.archived ? ' [ẩn]' : ''}
                  </button>
                  <button
                    type="button"
                    className="text-xs text-muted"
                    disabled={idx === 0}
                    onClick={() => void moveLecture(l.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="text-xs text-muted"
                    disabled={idx === lectures.length - 1}
                    onClick={() => void moveLecture(l.id, 1)}
                  >
                    ↓
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-4 flex flex-col gap-2 border-t border-border pt-3"
              onSubmit={createLecture}
            >
              <p className="text-xs font-bold">Thêm bài</p>
              <input
                className="min-h-9 rounded-lg border border-border px-2 font-mono text-xs"
                placeholder="id-slug"
                value={newLecture.id}
                onChange={(e) =>
                  setNewLecture((n) => ({
                    ...n,
                    id: e.target.value.toLowerCase(),
                  }))
                }
                required
              />
              <input
                className="min-h-9 rounded-lg border border-border px-2 text-sm"
                placeholder="Tiêu đề"
                value={newLecture.title}
                onChange={(e) =>
                  setNewLecture((n) => ({ ...n, title: e.target.value }))
                }
                required
              />
              <select
                className="min-h-9 rounded-lg border border-border px-2 text-sm"
                value={newLecture.practiceKind}
                onChange={(e) =>
                  setNewLecture((n) => ({ ...n, practiceKind: e.target.value }))
                }
              >
                {[
                  'intro',
                  'journal',
                  'sketch',
                  'character',
                  'style',
                  'chips',
                  'ai_pick',
                  'story',
                  'comic',
                  'video',
                  'detective',
                ].map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <Button type="submit" className="!min-h-9 !text-xs">
                Tạo bài
              </Button>
            </form>
          </div>
          <div className="ui-card p-4">
            {selected ? (
              <form className="flex flex-col gap-2" onSubmit={saveLecture}>
                <h2 className="font-display text-lg">{selected.id}</h2>
                <label className="text-xs font-bold">
                  Tiêu đề
                  <input
                    className="mt-1 min-h-10 w-full rounded-xl border-2 border-border px-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>
                <label className="text-xs font-bold">
                  Hook
                  <textarea
                    className="mt-1 min-h-16 w-full rounded-xl border-2 border-border px-2 py-1"
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                  />
                </label>
                <label className="text-xs font-bold">
                  Skill
                  <input
                    className="mt-1 min-h-10 w-full rounded-xl border-2 border-border px-2"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                  />
                </label>
                <label className="text-xs font-bold">
                  practiceKind
                  <select
                    className="mt-1 min-h-10 w-full rounded-xl border-2 border-border px-2"
                    value={practiceKind}
                    onChange={(e) => setPracticeKind(e.target.value)}
                  >
                    {[
                      'intro',
                      'journal',
                      'sketch',
                      'character',
                      'style',
                      'chips',
                      'ai_pick',
                      'story',
                      'comic',
                      'video',
                      'detective',
                      'palette',
                      'reflect',
                    ].map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold">
                  Video URL
                  <input
                    className="mt-1 min-h-10 w-full rounded-xl border-2 border-border px-2 text-xs"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <Button type="submit">Lưu</Button>
                {selected.archived ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void restoreLecture(selected.id)}
                  >
                    Khôi phục
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-danger"
                    onClick={() => void archiveLecture(selected.id)}
                  >
                    Ẩn bài (archive)
                  </Button>
                )}
              </form>
            ) : (
              <p className="text-sm text-muted">Chọn một bài để chỉnh.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <div className="ui-card p-5">
          {!stats ? (
            <p className="text-muted">Chưa có lớp hoặc dữ liệu thống kê.</p>
          ) : (
            <>
              <h2 className="font-display text-2xl">
                {stats.className} · {stats.code}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                {[
                  ['Học sinh', stats.studentCount],
                  ['Trạm hoàn thành', stats.totalCompletedQuests],
                  ['Quest đang mở', stats.openQuestCount],
                  ['Dự án', stats.projectCount],
                ].map(([l, v]) => (
                  <div key={String(l)} className="rounded-2xl bg-sky-50 p-3">
                    <p className="text-xs font-bold uppercase text-muted">{l}</p>
                    <p className="font-display text-2xl text-sky-600">{v}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-4 space-y-1 text-sm">
                {stats.students.map((s) => (
                  <li
                    key={s.id}
                    className="flex justify-between rounded-xl bg-white px-3 py-2 border border-border"
                  >
                    <span className="font-bold">{s.nickname}</span>
                    <span className="text-muted">
                      Lv{s.level} · {s.xp} XP · {s.completedQuests} trạm
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
