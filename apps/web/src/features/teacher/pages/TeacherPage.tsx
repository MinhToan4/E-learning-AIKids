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

type CourseLectures = {
  id: string
  title: string
  shortTitle: string
  status: string
  lectures: LectureRow[]
}

export function TeacherPage() {
  const [tab, setTab] = useState<'class' | 'lectures'>('class')
  const [classInfo, setClassInfo] = useState<{
    name: string
    code: string
  } | null>(null)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [courses, setCourses] = useState<CourseLectures[]>([])
  const [selected, setSelected] = useState<LectureRow | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [hook, setHook] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newStudent, setNewStudent] = useState('')
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
    const data = await api<{ courses: CourseLectures[] }>(
      '/api/teacher/lectures',
    )
    setCourses(data.courses)
  }

  useEffect(() => {
    void (async () => {
      try {
        setError(null)
        if (tab === 'class') await loadClass()
        else await loadLectures()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi')
      }
    })()
  }, [tab])

  function pickLecture(l: LectureRow) {
    setSelected(l)
    setVideoUrl(l.videoUrl ?? '')
    setTitle(l.title)
    setHook(l.hook)
    setMsg(null)
  }

  async function saveLecture(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setError(null)
    try {
      const data = await api<{ lecture: LectureRow }>(
        `/api/teacher/lectures/${selected.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            title,
            hook,
            videoUrl: videoUrl.trim() === '' ? null : videoUrl.trim(),
          }),
        },
      )
      setSelected(data.lecture)
      setMsg('Đã lưu bài giảng (kèm URL video)')
      await loadLectures()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được')
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-500">
            CMS · Giảng viên
          </p>
          <h1 className="font-display text-3xl">
            {tab === 'class' ? 'Lớp học' : 'Bài giảng & video'}
          </h1>
          {classInfo && tab === 'class' && (
            <p className="text-muted">
              {classInfo.name} · Mã: <strong>{classInfo.code}</strong>
            </p>
          )}
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
            ['lectures', 'Bài giảng'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-extrabold',
              tab === id
                ? 'bg-white text-brand-600 shadow-soft'
                : 'text-muted',
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
        <p className="text-danger" role="alert">
          {error}
        </p>
      )}

      {tab === 'class' && (
        <>
          <form
            className="ui-card flex flex-wrap items-end gap-3 p-4"
            onSubmit={addStudent}
          >
            <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm font-bold">
              Thêm học sinh (biệt danh)
              <input
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={newStudent}
                onChange={(e) => setNewStudent(e.target.value)}
                placeholder="MựcCon"
                required
              />
            </label>
            <Button type="submit">Thêm vào lớp</Button>
          </form>

          <div className="ui-card overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-border bg-brand-50/80">
                <tr>
                  <th className="px-4 py-3 font-extrabold">Học sinh</th>
                  <th className="px-4 py-3 font-extrabold">Cấp</th>
                  <th className="px-4 py-3 font-extrabold">Trạm xong</th>
                  <th className="px-4 py-3 font-extrabold">Sao</th>
                  <th className="px-4 py-3 font-extrabold">Tác phẩm</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="px-4 py-3 font-bold">{s.nickname}</td>
                    <td className="px-4 py-3">{s.level}</td>
                    <td className="px-4 py-3">{s.completedQuests}</td>
                    <td className="px-4 py-3">{s.totalStars}</td>
                    <td className="px-4 py-3">{s.projectCount}</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-muted">
                      Chưa có học sinh trong lớp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">
            Bảng lớp chỉ dùng nickname — không xếp hạng công khai toàn hệ thống.
          </p>
        </>
      )}

      {tab === 'lectures' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-3">
            {courses.map((c) => (
              <div key={c.id} className="ui-card p-4">
                <h2 className="mb-2 font-display text-xl">{c.title}</h2>
                <ul className="space-y-1">
                  {c.lectures.map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => pickLecture(l)}
                        className={cn(
                          'flex w-full flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition',
                          selected?.id === l.id
                            ? 'bg-brand-100 ring-2 ring-brand-500'
                            : 'bg-brand-50/50 hover:bg-brand-50',
                        )}
                      >
                        <span className="font-bold">
                          #{l.order} {l.title}
                        </span>
                        <span className="text-xs text-muted">
                          {l.videoUrl ? '🎬 Có video' : 'Chưa có video'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <form className="ui-card flex flex-col gap-3 p-4" onSubmit={saveLecture}>
            <h2 className="font-display text-xl">
              {selected ? 'Sửa bài giảng' : 'Chọn một bài'}
            </h2>
            {!selected ? (
              <p className="text-sm text-muted">
                Chọn bài bên trái để chỉnh tiêu đề, hook và URL video bài giảng.
              </p>
            ) : (
              <>
                <p className="text-xs text-muted">ID: {selected.id}</p>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Tiêu đề
                  <input
                    className="min-h-11 rounded-xl border-2 border-border px-3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Hook (lời chào)
                  <textarea
                    className="min-h-20 rounded-xl border-2 border-border px-3 py-2"
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  URL video bài giảng
                  <input
                    type="url"
                    className="min-h-11 rounded-xl border-2 border-border px-3"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://cdn.example.com/lectures/...."
                  />
                </label>
                <p className="text-xs text-muted">
                  Lưu trên PostgreSQL/Supabase — FE chỉ hiển thị URL từ API.
                </p>
                <Button type="submit">Lưu bài giảng</Button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
