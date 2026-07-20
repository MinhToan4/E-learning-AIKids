import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'

type SystemInfo = {
  service: string
  time: string
  counts: {
    courses: number
    quests: number
    classes: number
    activeSessions: number
    pendingApprovals: number
    usersByRole: Record<string, number>
  }
}

type AdminUser = {
  id: string
  role: string
  email: string | null
  nickname: string | null
  active: boolean
  level: number
  xp: number
  createdAt: string
}

type CourseOverview = {
  id: string
  title: string
  status: string
  questCount: number
  quests: Array<{ id: string; order: number; title: string; videoUrl: string | null }>
}

export function AdminPage() {
  const [tab, setTab] = useState<'system' | 'users' | 'courses'>('system')
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [courses, setCourses] = useState<CourseOverview[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    role: 'teacher' as 'parent' | 'teacher' | 'admin',
    email: '',
    password: '',
    nickname: '',
  })
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  async function load() {
    setError(null)
    if (tab === 'system') {
      const data = await api<{ system: SystemInfo }>('/api/admin/system')
      setSystem(data.system)
    } else if (tab === 'users') {
      const data = await api<{ users: AdminUser[] }>('/api/admin/users')
      setUsers(data.users)
    } else {
      const data = await api<{ courses: CourseOverview[] }>('/api/admin/courses')
      setCourses(data.courses)
    }
  }

  useEffect(() => {
    void load().catch((e) =>
      setError(e instanceof Error ? e.message : 'Không tải được'),
    )
  }, [tab])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setMsg('Đã tạo tài khoản')
      setForm({ role: 'teacher', email: '', password: '', nickname: '' })
      if (tab === 'users') await load()
      else setTab('users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo user')
    }
  }

  async function toggleActive(u: AdminUser) {
    await api(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !u.active }),
    })
    setMsg(u.active ? 'Đã vô hiệu hóa' : 'Đã kích hoạt lại')
    await load()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
            CMS · Quản trị
          </p>
          <h1 className="font-display text-3xl text-text">Hệ thống & tài khoản</h1>
          <p className="text-sm text-muted">
            Quản lý người dùng, theo dõi sức khỏe hệ thống, xem catalog từ SQL.
          </p>
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

      <div className="flex flex-wrap gap-2 rounded-2xl bg-brand-50 p-1">
        {(
          [
            ['system', 'Hệ thống'],
            ['users', 'Tài khoản'],
            ['courses', 'Khóa học'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-extrabold transition',
              tab === id
                ? 'bg-white text-brand-600 shadow-soft'
                : 'text-muted hover:text-text',
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

      {tab === 'system' && system && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Khóa học', system.counts.courses],
            ['Bài giảng', system.counts.quests],
            ['Lớp học', system.counts.classes],
            ['Phiên active', system.counts.activeSessions],
            ['Chờ duyệt', system.counts.pendingApprovals],
          ].map(([label, value]) => (
            <div key={String(label)} className="ui-card p-4">
              <p className="text-xs font-bold uppercase text-muted">{label}</p>
              <p className="font-display text-3xl text-brand-600">{value}</p>
            </div>
          ))}
          <div className="ui-card p-4 sm:col-span-2 lg:col-span-3">
            <p className="mb-2 text-xs font-bold uppercase text-muted">Theo vai trò</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(system.counts.usersByRole).map(([role, n]) => (
                <span
                  key={role}
                  className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-600"
                >
                  {role}: {n}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              Cập nhật: {new Date(system.time).toLocaleString('vi-VN')} · {system.service}
            </p>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="ui-card overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border bg-brand-50/80">
                <tr>
                  <th className="px-4 py-3 font-extrabold">Người dùng</th>
                  <th className="px-4 py-3 font-extrabold">Vai trò</th>
                  <th className="px-4 py-3 font-extrabold">Trạng thái</th>
                  <th className="px-4 py-3 font-extrabold" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <p className="font-bold">{u.nickname ?? '—'}</p>
                      <p className="text-xs text-muted">{u.email ?? u.id.slice(0, 10)}</p>
                    </td>
                    <td className="px-4 py-3 font-bold capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-extrabold',
                          u.active
                            ? 'bg-mint-100 text-success'
                            : 'bg-coral-100 text-danger',
                        )}
                      >
                        {u.active ? 'Active' : 'Off'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        className="!min-h-9 !px-3 !text-xs"
                        onClick={() => void toggleActive(u)}
                      >
                        {u.active ? 'Tắt' : 'Bật'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form className="ui-card flex flex-col gap-3 p-4" onSubmit={createUser}>
            <h2 className="font-display text-xl">Tạo tài khoản</h2>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Vai trò
              <select
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value as 'parent' | 'teacher' | 'admin',
                  }))
                }
              >
                <option value="teacher">Giảng viên</option>
                <option value="parent">Phụ huynh</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Email
              <input
                type="email"
                required
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Mật khẩu
              <input
                type="password"
                required
                minLength={8}
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Tên hiển thị
              <input
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={form.nickname}
                onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
              />
            </label>
            <Button type="submit">Tạo</Button>
          </form>
        </div>
      )}

      {tab === 'courses' && (
        <div className="flex flex-col gap-3">
          {courses.map((c) => (
            <div key={c.id} className="ui-card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl">{c.title}</h2>
                <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-extrabold text-sky-600">
                  {c.status} · {c.questCount} bài
                </span>
              </div>
              <ul className="space-y-1 text-sm">
                {c.quests.map((q) => (
                  <li
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50/60 px-3 py-2"
                  >
                    <span className="font-bold">
                      #{q.order} {q.title}
                    </span>
                    <span className="max-w-full truncate text-xs text-muted">
                      {q.videoUrl ? `🎬 ${q.videoUrl}` : 'Chưa có video'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
