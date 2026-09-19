import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Link } from 'react-router'
import { createPortal } from 'react-dom'
import { Search, Plus, X } from 'lucide-react'
import { UserManagementNav } from '../UserManagementNav'
import { Button } from '@/shared/components/ui/Button'
import { Paginator } from '@/shared/components/ui/Paginator'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { usePagination } from '@/shared/hooks/usePagination'
import { useAuth } from '@/shared/store/auth'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { UserAuthBadges } from '../AdminUiHelpers'
import {
  ROLE_LABELS,
  groupUsersByFamilyList,
  type AdminUser,
  type DisplayAdminUser,
} from '../../types'

type EditUserModalProps = {
  target: AdminUser | null
  isSelf?: boolean
  form: { nickname: string; role: AdminUser['role']; email: string; newPassword: string }
  onChange: React.Dispatch<
    React.SetStateAction<{ nickname: string; role: AdminUser['role']; email: string; newPassword: string }>
  >
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  onSyncClaims: (userId: string) => Promise<void>
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Quản trị viên: Toàn quyền quản trị hệ thống LMS, người dùng, tài chính và AI.',
  teacher: 'Giáo viên: Quản lý lớp học, chấm điểm, theo dõi học sinh và soạn bài giảng trạm học.',
  curriculum_lead: 'Trưởng ban chuyên môn: Toàn quyền thiết kế giáo trình, xuất bản khóa học và giám sát chất lượng.',
  parent: 'Phụ huynh: Theo dõi tiến độ học của con và thanh toán gói cước.',
  student: 'Học sinh: Trải nghiệm học tập, làm nhiệm vụ và khám phá các trạm bài giảng.',
}

function EditUserModal({
  target,
  isSelf = false,
  form,
  onChange,
  onSubmit,
  onClose,
  onSyncClaims,
}: EditUserModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)
  const [syncingClaims, setSyncingClaims] = useState(false)

  useEffect(() => {
    if (target) {
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [target])

  useEffect(() => {
    if (!target) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [target, onClose])

  if (!target) return null

  async function handleSyncClaims() {
    if (!target) return
    setSyncingClaims(true)
    try {
      await onSyncClaims(target.id)
    } finally {
      setSyncingClaims(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(20,26,48,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        className="ui-card w-full max-w-md overflow-y-auto p-6"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              Sửa tài khoản
            </p>
            <h2 id="edit-user-title" className="font-display text-xl text-text">
              {target.nickname ?? target.email ?? target.id.slice(0, 10)}
            </h2>
            <p className="mt-0.5 text-xs text-muted font-mono">{target.id.slice(0, 16)}…</p>
          </div>
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-bold text-muted hover:bg-brand-50 cursor-pointer"
            onClick={onClose}
            aria-label="Đóng hộp thoại chỉnh sửa"
          >
            ✕
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Tên hiển thị
            <input
              ref={firstInputRef}
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.nickname}
              onChange={(e) => onChange((f) => ({ ...f, nickname: e.target.value }))}
              placeholder={target.nickname ?? '—'}
            />
          </label>

          <div className="flex flex-col gap-1.5 text-sm font-bold">
            <label htmlFor="user-role-select" className="text-text">
              Vai trò
            </label>
            <select
              id="user-role-select"
              disabled={isSelf}
              className={cn(
                'min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400',
                isSelf && 'cursor-not-allowed bg-slate-100 opacity-80',
              )}
              value={form.role}
              onChange={(e) => onChange((f) => ({ ...f, role: e.target.value as AdminUser['role'] }))}
            >
              <option value="teacher">Giáo viên</option>
              <option value="curriculum_lead">Trưởng ban chuyên môn</option>
              <option value="admin">Quản trị viên</option>
            </select>
            {isSelf && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs font-bold text-amber-800">
                🛡️ Bạn không thể tự đổi vai trò của chính mình để tránh mất quyền Quản trị hệ thống.
              </p>
            )}
            <div className="rounded-xl bg-brand-50/60 p-2.5 text-xs font-medium text-brand-800 border border-brand-100/80">
              <span className="font-bold">Đặc quyền: </span>
              {ROLE_DESCRIPTIONS[form.role] ?? 'Chưa xác định đặc quyền cụ thể cho vai trò này.'}
            </div>
          </div>

          {target.role !== 'student' && (
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Email
              <input
                type="email"
                autoComplete="email"
                className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
                value={form.email}
                onChange={(e) => onChange((f) => ({ ...f, email: e.target.value }))}
                placeholder={target.email ?? 'email@example.com'}
              />
              <span className="text-xs font-normal text-muted">
                Để trống nếu không muốn thay đổi
              </span>
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.newPassword}
              onChange={(e) => onChange((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="Để trống nếu không đổi mật khẩu"
            />
            <span className="text-xs font-normal text-muted">
              Tối thiểu 8 ký tự. Để trống để giữ nguyên mật khẩu.
            </span>
          </label>

          <div className="rounded-2xl border-2 border-border/80 bg-brand-50/40 p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-brand-600 mb-3">
              Thông tin Xác thực & Firebase
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted font-bold">Firebase Auth:</span>
                <div className="text-right">
                  {target.isFirebaseLinked || target.firebaseUid ? (
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2 py-0.5 font-extrabold text-success">
                        ✓ Đã liên kết
                      </span>
                      {target.firebaseUid && (
                        <p className="mt-1 font-mono text-[11px] text-muted break-all select-all">
                          UID: {target.firebaseUid}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-bold text-muted">
                      Chưa liên kết
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-muted font-bold">Google Sign-in:</span>
                {target.isGoogleLinked || target.googleSub ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 font-extrabold text-sky-700">
                    🔵 Đã liên kết
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-bold text-muted">
                    Chưa liên kết
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-muted font-bold">Tên đăng nhập alias:</span>
                {target.loginUsername ? (
                  <code className="rounded bg-brand-100/70 px-2 py-0.5 font-mono font-bold text-brand-800">
                    {target.loginUsername}
                  </code>
                ) : (
                  <span className="text-muted italic">—</span>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="secondary"
                disabled={syncingClaims}
                onClick={() => void handleSyncClaims()}
                className="w-full text-xs font-bold"
              >
                {syncingClaims
                  ? 'Đang đồng bộ Custom Claims...'
                  : '⚡ Đồng bộ Custom Claims lên Firebase'}
              </Button>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3 border-t border-border/60 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu thay đổi</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export function AdminStaffTab() {
  const { user: currentUser } = useAuth()
  const { toasts, showToast, dismissToast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const isSelf = (targetId: string) => Boolean(currentUser?.id && currentUser.id === targetId)

  // Filters
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [userActiveFilter, setUserActiveFilter] = useState<'' | 'active' | 'inactive'>('')
  const [userAuthFilter, setUserAuthFilter] = useState<'' | 'firebase' | 'google' | 'local'>('')

  // Modals & form
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({
    nickname: '',
    role: 'student' as AdminUser['role'],
    email: '',
    newPassword: '',
  })

  // Create form modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    role: 'teacher' as 'teacher' | 'curriculum_lead' | 'admin',
    email: '',
    password: '',
    nickname: '',
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const q = roleFilter ? `?role=${encodeURIComponent(roleFilter)}` : ''
      const data = await api<{ users: AdminUser[] }>(`/api/admin/users${q}`)
      setUsers(data.users)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tải danh sách tài khoản', 'error')
    } finally {
      setLoading(false)
    }
  }, [roleFilter, showToast])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    let list = users

    if (userSearch.trim()) {
      const q = userSearch.toLowerCase()
      list = list.filter(
        (u) =>
          (u.email ?? '').toLowerCase().includes(q) ||
          (u.nickname ?? '').toLowerCase().includes(q) ||
          (u.name ?? '').toLowerCase().includes(q) ||
          (u.loginUsername ?? '').toLowerCase().includes(q),
      )
    }

    if (userActiveFilter === 'active') {
      list = list.filter((u) => u.active)
    } else if (userActiveFilter === 'inactive') {
      list = list.filter((u) => !u.active)
    }

    if (userAuthFilter === 'firebase') {
      list = list.filter((u) => u.isFirebaseLinked || u.firebaseUid || u.authProviders?.includes('firebase'))
    } else if (userAuthFilter === 'google') {
      list = list.filter(
        (u) =>
          u.isGoogleLinked ||
          u.googleSub ||
          u.authProviders?.includes('google') ||
          u.authProviders?.includes('google.com') ||
          u.authProviders?.includes('firebase_google'),
      )
    } else if (userAuthFilter === 'local') {
      list = list.filter((u) => u.loginUsername || (!u.isFirebaseLinked && !u.firebaseUid))
    }

    // Chỉ giữ người dùng thuộc nhóm Cán bộ & Quản trị
    list = list.filter(
      (u) =>
        u.role === 'admin' ||
        u.role === 'teacher' ||
        u.role === 'curriculum_lead' ||
        (u.platformRoles && u.platformRoles.length > 0),
    )

    return list as DisplayAdminUser[]
  }, [users, userSearch, userActiveFilter, userAuthFilter])

  const stats = useMemo(() => {
    const admins = users.filter((u) => u.role === 'admin' || (u.platformRoles && u.platformRoles.length > 0)).length
    const curriculum = users.filter((u) => u.role === 'curriculum_lead').length
    const teachers = users.filter((u) => u.role === 'teacher').length
    const active = users.filter((u) => u.active).length
    return { admins, curriculum, teachers, active }
  }, [users])

  const usersPag = usePagination(filteredUsers, 15)

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/api/admin/users', { method: 'POST', body: JSON.stringify(createForm) })
      showToast(`Đã tạo tài khoản ${createForm.email}`, 'success')
      setShowCreateModal(false)
      setCreateForm({ role: 'teacher', email: '', password: '', nickname: '' })
      await fetchUsers()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể tạo tài khoản', 'error')
    }
  }

  async function toggleActive(u: AdminUser) {
    if (isSelf(u.id)) {
      showToast('Không thể vô hiệu hóa tài khoản của chính mình', 'error')
      return
    }
    try {
      await api(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !u.active }),
      })
      showToast(`Đã ${u.active ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản ${u.email ?? u.nickname}`, 'success')
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, active: !item.active } : item)),
      )
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể cập nhật trạng thái', 'error')
    }
  }

  async function softDeleteUser() {
    if (!deleteTarget) return
    if (isSelf(deleteTarget.id)) {
      showToast('Không thể xóa tài khoản của chính mình', 'error')
      setDeleteTarget(null)
      return
    }
    try {
      await api(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' })
      showToast(`Đã xóa tài khoản ${deleteTarget.email ?? deleteTarget.nickname}`, 'success')
      setDeleteTarget(null)
      await fetchUsers()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể xóa tài khoản', 'error')
    }
  }

  async function patchUser(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    if (isSelf(editTarget.id) && editForm.role !== 'admin') {
      showToast('Không thể tự hạ cấp quyền Quản trị của chính bạn', 'error')
      return
    }
    try {
      const payload: Record<string, string> = { nickname: editForm.nickname, role: editForm.role }
      if (editForm.email && editForm.email !== editTarget.email) payload.email = editForm.email
      if (editForm.newPassword) payload.password = editForm.newPassword
      await api(`/api/admin/users/${editTarget.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      showToast(`Đã cập nhật ${editTarget.nickname ?? editTarget.email}`, 'success')
      setEditTarget(null)
      await fetchUsers()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể cập nhật', 'error')
    }
  }

  async function syncFirebaseClaims(userId: string) {
    try {
      const data = await api<{ message?: string }>(`/api/admin/users/${userId}/sync-firebase-claims`, {
        method: 'POST',
      })
      showToast(data?.message ?? 'Đã đồng bộ Custom Claims lên Firebase thành công!', 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Đồng bộ claims thất bại', 'error')
    }
  }


  return (
    <div className="space-y-4">
      {/* ── KPI Metric Header Overview ── */}
      <section className="ui-card flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4" aria-label="Tổng quan cán bộ và quản trị">
        <div className="mr-auto">
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">Đội ngũ Vận hành & Chuyên môn</p>
          <p className="font-display text-xl text-slate-900">{filteredUsers.length} cán bộ</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          <strong>{stats.admins}</strong>
          <span className="text-muted">Quản trị viên</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
          <strong>{stats.curriculum}</strong>
          <span className="text-muted">Ban chuyên môn</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          <strong>{stats.teachers}</strong>
          <span className="text-muted">Giáo viên</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-mint-500" />
          <strong>{stats.active}</strong>
          <span className="text-muted">Hoạt động</span>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="ml-auto flex items-center gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" aria-hidden="true" /> Thêm cán bộ
        </Button>
      </section>

      {/* ── 4-Cards Domain Navigation ── */}
      <UserManagementNav activeTab="staff" />

      {/* ── Full-width Table Card ── */}
      <section className="ui-card overflow-hidden border border-border shadow-xs">

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <div className="relative flex-1 min-w-[200px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              <Search size={17} aria-hidden="true" />
            </span>
            <input
              type="search"
              aria-label="Tìm tài khoản"
              placeholder="Tìm tên, email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-8 text-sm outline-none transition focus:border-brand-400"
            />
            {userSearch && (
              <button
                type="button"
                onClick={() => setUserSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            aria-label="Lọc tài khoản theo vai trò"
            className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold bg-white"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả cán bộ & quản trị</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="curriculum_lead">Trưởng ban chuyên môn</option>
            <option value="teacher">Giáo viên</option>
          </select>

          <select
            aria-label="Lọc tài khoản theo trạng thái"
            className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold bg-white"
            value={userActiveFilter}
            onChange={(e) => setUserActiveFilter(e.target.value as '' | 'active' | 'inactive')}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>

          <select
            aria-label="Lọc tài khoản theo nguồn xác thực"
            className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold bg-white"
            value={userAuthFilter}
            onChange={(e) =>
              setUserAuthFilter(e.target.value as '' | 'firebase' | 'google' | 'local')
            }
          >
            <option value="">Tất cả nguồn</option>
            <option value="firebase">Đã lên Firebase</option>
            <option value="google">Dùng Google</option>
            <option value="local">Nội bộ / Alias</option>
          </select>

          {(userSearch || roleFilter || userActiveFilter || userAuthFilter) && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
              {filteredUsers.length} / {users.length} cán bộ
            </span>
          )}

          {(userSearch || roleFilter || userActiveFilter || userAuthFilter) && (
            <button
              type="button"
              className="text-xs font-bold text-muted underline cursor-pointer"
              onClick={() => {
                setUserSearch('')
                setRoleFilter('')
                setUserActiveFilter('')
                setUserAuthFilter('')
              }}
            >
              Xóa bộ lọc
            </button>
          )}

          {loading && users.length > 0 && (
            <span className="ml-auto text-xs font-bold text-brand-400 animate-pulse">
              Đang cập nhật…
            </span>
          )}
        </div>

        {/* ── Desktop table (md+) ─────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-brand-50/80">
              <tr>
                <th className="px-4 py-3 font-extrabold">Cán bộ / Nhân sự</th>
                <th className="px-4 py-3 font-extrabold">Vai trò</th>
                <th className="px-4 py-3 font-extrabold">Phương thức xác thực</th>
                <th className="px-4 py-3 font-extrabold">Trạng thái</th>
                <th className="w-48 px-4 py-3 text-right font-extrabold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {usersPag.slice.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    {users.length === 0 ? 'Không có tài khoản nào' : 'Không có tài khoản khớp bộ lọc'}
                  </td>
                </tr>
              ) : (
                usersPag.slice.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border/40 hover:bg-brand-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-700 text-xs shadow-sm">
                          {(u.name ?? u.nickname ?? u.email ?? 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-text truncate">{u.name ?? u.nickname ?? '—'}</p>
                          <p className="text-xs text-muted truncate">{u.email ?? u.id.slice(0, 10)}</p>
                          {u.loginUsername && (
                            <span className="inline-block mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                              @{u.loginUsername}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold">{ROLE_LABELS[u.role] ?? u.role}</span>
                        {u.platformRoles?.includes('superadmin') && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-800">
                            👑 Superadmin
                          </span>
                        )}
                        {u.platformRoles?.includes('platform_admin') && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-extrabold text-purple-700">
                            🛡️ Platform Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <UserAuthBadges user={u} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-extrabold',
                          u.active ? 'bg-mint-100 text-success' : 'bg-coral-100 text-danger',
                        )}
                      >
                        {u.active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          className="!min-h-8 !px-2.5 !text-xs"
                          onClick={() => {
                            setEditTarget(u)
                            setEditForm({
                              nickname: u.nickname ?? '',
                              role: u.role as AdminUser['role'],
                              email: u.email ?? '',
                              newPassword: '',
                            })
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="secondary"
                          className={cn(
                            "!min-h-8 !px-2.5 !text-xs",
                            u.active ? "text-amber-700 hover:bg-amber-50" : "text-emerald-700 hover:bg-emerald-50"
                          )}
                          disabled={isSelf(u.id)}
                          title={isSelf(u.id) ? 'Không thể vô hiệu hóa tài khoản của chính mình' : ''}
                          onClick={() => void toggleActive(u)}
                        >
                          {u.active ? 'Tắt' : 'Bật'}
                        </Button>
                        {u.active && !isSelf(u.id) ? (
                          <Button
                            variant="ghost"
                            className="!min-h-8 !px-2.5 !text-xs text-danger hover:bg-rose-50"
                            onClick={() => setDeleteTarget(u)}
                          >
                            Xóa
                          </Button>
                        ) : (
                          <span className="inline-block w-[46px]" aria-hidden="true" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile card list (<md) ──────────────────────────── */}
        <div className="md:hidden divide-y divide-border/40">
          {usersPag.slice.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              {users.length === 0 ? 'Không có tài khoản nào' : 'Không có tài khoản khớp bộ lọc'}
            </p>
          ) : (
            usersPag.slice.map((u) => (
              <div
                key={u.id}
                className="px-4 py-3 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-700 text-xs shadow-sm">
                        {(u.name ?? u.nickname ?? u.email ?? 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-sm">{u.name ?? u.nickname ?? '—'}</p>
                        <p className="truncate text-xs text-muted">{u.email ?? u.id.slice(0, 10)}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                      {u.platformRoles?.includes('superadmin') && (
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-800">
                          👑 Superadmin
                        </span>
                      )}
                      {u.platformRoles?.includes('platform_admin') && (
                        <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-extrabold text-purple-700">
                          🛡️ Platform Admin
                        </span>
                      )}
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-extrabold',
                          u.active ? 'bg-mint-100 text-success' : 'bg-coral-100 text-danger',
                        )}
                      >
                        {u.active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <UserAuthBadges user={u} />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditTarget(u)
                        setEditForm({
                          nickname: u.nickname ?? '',
                          role: u.role as AdminUser['role'],
                          email: u.email ?? '',
                          newPassword: '',
                        })
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="secondary"
                      className={cn(
                        u.active ? "text-amber-700 hover:bg-amber-50" : "text-emerald-700 hover:bg-emerald-50"
                      )}
                      disabled={isSelf(u.id)}
                      title={isSelf(u.id) ? 'Không thể vô hiệu hóa tài khoản của chính mình' : ''}
                      onClick={() => void toggleActive(u)}
                    >
                      {u.active ? 'Tắt' : 'Bật'}
                    </Button>
                    {u.active && !isSelf(u.id) && (
                      <Button
                        variant="ghost"
                        className="text-danger"
                        onClick={() => setDeleteTarget(u)}
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Paginator
          page={usersPag.page}
          totalPages={usersPag.totalPages}
          totalItems={filteredUsers.length}
          pageSize={15}
          onPrev={usersPag.prev}
          onNext={usersPag.next}
          onGoTo={usersPag.goTo}
        />
      </section>

      {/* ── Modal Tạo Cán bộ mới ────────────────────────────── */}
      {showCreateModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(20,26,48,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-staff-user-title"
            className="ui-card w-full max-w-md overflow-y-auto p-6"
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brand-600">Thêm nhân sự mới</p>
                <h2 id="create-staff-user-title" className="font-display text-xl font-bold text-text">Tạo Cán bộ / Quản trị</h2>
              </div>
              <button
                type="button"
                className="min-h-10 shrink-0 rounded-lg px-2.5 text-sm font-bold text-muted hover:bg-brand-50 cursor-pointer"
                onClick={() => setShowCreateModal(false)}
                aria-label="Đóng hộp thoại tạo cán bộ"
              >
                ✕
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={(e) => void createUser(e)}>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Vai trò cán bộ
                <select
                  className="min-h-11 rounded-xl border-2 border-border px-3 bg-white outline-none focus:border-brand-400"
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, role: e.target.value as typeof createForm.role }))
                  }
                >
                  <option value="teacher">🧑‍🏫 Giáo viên giảng dạy (quản lý lớp & chấm điểm)</option>
                  <option value="curriculum_lead">🎓 Trưởng ban chuyên môn (biên soạn giáo trình)</option>
                  <option value="admin">⚙️ Quản trị viên (toàn quyền hệ thống & phân quyền)</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Email công vụ
                <input
                  type="email"
                  required
                  placeholder="canbo@storymee.vn"
                  className="min-h-11 rounded-xl border-2 border-border px-3 bg-white outline-none focus:border-brand-400 text-sm"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Mật khẩu khởi tạo (tối thiểu 8 ký tự)
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="min-h-11 rounded-xl border-2 border-border px-3 bg-white outline-none focus:border-brand-400 text-sm"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Tên hiển thị / Chức danh
                <input
                  placeholder="Thầy Nguyễn Văn A / Ban Chuyên Môn Toán"
                  className="min-h-11 rounded-xl border-2 border-border px-3 bg-white outline-none focus:border-brand-400 text-sm"
                  value={createForm.nickname}
                  onChange={(e) => setCreateForm((f) => ({ ...f, nickname: e.target.value }))}
                />
              </label>

              <div className="mt-2 flex items-center justify-end gap-2.5 border-t border-border/70 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="shadow-sm">
                  Xác nhận tạo cán bộ
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Dialog xác nhận xóa ──────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Soft-delete "${deleteTarget?.email ?? deleteTarget?.nickname}"?`}
        description="Tài khoản sẽ bị vô hiệu hóa và tất cả phiên đăng nhập bị thu hồi."
        confirmLabel="Xóa"
        danger
        onConfirm={() => void softDeleteUser()}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Modal Sửa người dùng ─────────────────────────────── */}
      <EditUserModal
        target={editTarget}
        isSelf={editTarget ? isSelf(editTarget.id) : false}
        form={editForm}
        onChange={setEditForm}
        onSubmit={(e) => void patchUser(e)}
        onClose={() => setEditTarget(null)}
        onSyncClaims={syncFirebaseClaims}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
