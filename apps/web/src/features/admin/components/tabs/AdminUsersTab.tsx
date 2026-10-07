import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router'
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

import { EditUserModal } from '../modals/EditUserModal'
import { CreateUserModal } from '../modals/CreateUserModal'


export function AdminUsersTab() {
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
  const [groupByFamily, setGroupByFamily] = useState(false)

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
    role: 'parent' as 'parent' | 'student',
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

    // Chỉ hiển thị học sinh và phụ huynh
    list = list.filter(
      (u) =>
        u.role === 'student' ||
        u.role === 'child' ||
        u.role === 'parent' ||
        Boolean(u.guardianParent) ||
        (u.children && u.children.length > 0),
    )

    if (groupByFamily) {
      return groupUsersByFamilyList(list)
    }

    return list as DisplayAdminUser[]
  }, [users, userSearch, userActiveFilter, userAuthFilter, groupByFamily])

  const stats = useMemo(() => {
    const students = users.filter((u) => u.role === 'student' || u.role === 'child').length
    const parents = users.filter((u) => u.role === 'parent').length
    const active = users.filter((u) => u.active).length
    const inactive = users.filter((u) => !u.active).length
    return { students, parents, active, inactive }
  }, [users])

  const usersPag = usePagination(filteredUsers, 15)

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/api/admin/users', { method: 'POST', body: JSON.stringify(createForm) })
      showToast(`Đã tạo tài khoản ${createForm.email}`, 'success')
      setShowCreateModal(false)
      setCreateForm({ role: 'parent', email: '', password: '', nickname: '' })
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
      <section className="ui-card flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4" aria-label="Tổng quan học sinh và phụ huynh">
        <div className="mr-auto">
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">Quản lý Gia đình & Học tập</p>
          <p className="font-display text-xl text-slate-900">{filteredUsers.length} tài khoản</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          <strong>{stats.students}</strong>
          <span className="text-muted">Học sinh</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          <strong>{stats.parents}</strong>
          <span className="text-muted">Phụ huynh</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-mint-500" />
          <strong>{stats.active}</strong>
          <span className="text-muted">Hoạt động</span>
        </div>
        {stats.inactive > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-coral-500" />
            <strong>{stats.inactive}</strong>
            <span className="text-muted">Đã khóa</span>
          </div>
        )}
        <Button onClick={() => setShowCreateModal(true)} className="ml-auto flex items-center gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" aria-hidden="true" /> Thêm tài khoản
        </Button>
      </section>

      {/* ── 4-Cards Domain Navigation ── */}
      <UserManagementNav activeTab="users" />

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
            <option value="">Tất cả học sinh & phụ huynh</option>
            <option value="student">Học sinh</option>
            <option value="parent">Phụ huynh</option>
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

          <button
            type="button"
            onClick={() => setGroupByFamily((prev) => !prev)}
            className={cn(
              'flex items-center gap-1.5 min-h-11 rounded-xl px-3.5 py-2 text-xs font-extrabold transition border-2 cursor-pointer select-none',
              groupByFamily
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-white text-ink border-border hover:border-brand-300 hover:bg-brand-50/50',
            )}
            aria-pressed={groupByFamily}
            title="Gom nhóm tài khoản theo gia đình"
          >
            <span aria-hidden="true">👨‍👩‍👧</span>
            <span>Gom nhóm Gia đình</span>
          </button>

          {(userSearch || roleFilter || userActiveFilter || userAuthFilter || groupByFamily) && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
              {filteredUsers.length} / {users.length} tài khoản
            </span>
          )}

          {(userSearch || roleFilter || userActiveFilter || userAuthFilter || groupByFamily) && (
            <button
              type="button"
              className="text-xs font-bold text-muted underline cursor-pointer"
              onClick={() => {
                setUserSearch('')
                setRoleFilter('')
                setUserActiveFilter('')
                setUserAuthFilter('')
                setGroupByFamily(false)
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
                <th className="px-4 py-3 font-extrabold">Người dùng / Gia đình</th>
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
                    className={cn(
                      'border-b border-border/40 hover:bg-brand-50/30 transition-colors',
                      u.isChildInFamily && 'bg-slate-50/60',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className={cn('flex items-start gap-2', u.isChildInFamily && 'pl-5')}>
                        {u.isChildInFamily && (
                          <span
                            className="text-brand-400 font-bold text-base select-none mt-0.5"
                            title="Tài khoản con"
                          >
                            ↳
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold">{u.name ?? u.nickname ?? '—'}</p>
                            {u.isChildInFamily && (
                              <span className="rounded-full bg-purple-100 text-purple-700 px-1.5 py-0.2 text-[10px] font-bold">
                                Con
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted">{u.email ?? u.id.slice(0, 10)}</p>
                          {(u.role === 'student' || u.role === 'child') && u.guardianParent && (
                            <div className="mt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setUserSearch(u.guardianParent?.email || u.guardianParent?.name || '')
                                  setRoleFilter('')
                                }}
                                className="inline-flex items-center gap-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 px-2 py-0.5 text-xs font-semibold transition cursor-pointer text-left"
                                title={`Tìm phụ huynh: ${u.guardianParent.name || u.guardianParent.email}`}
                              >
                                <span aria-hidden="true">👨‍👧</span>
                                <span>
                                  Phụ huynh: <strong>{u.guardianParent.name || u.guardianParent.email}</strong>
                                </span>
                              </button>
                            </div>
                          )}
                          {u.role === 'parent' && u.children && u.children.length > 0 && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 text-xs font-semibold">
                              <span aria-hidden="true">👶</span>
                              <span>
                                {u.children.length} con: {u.children.map((c) => c.name).join(', ')}
                              </span>
                            </div>
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
                className={cn(
                  'px-4 py-3 transition-colors',
                  u.isChildInFamily && 'bg-slate-50/60 pl-6 border-l-4 border-brand-300',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-1.5">
                      {u.isChildInFamily && (
                        <span
                          className="text-brand-400 font-bold text-base select-none mt-0.5"
                          title="Tài khoản con"
                        >
                          ↳
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-bold text-sm">{u.name ?? u.nickname ?? '—'}</p>
                          {u.isChildInFamily && (
                            <span className="shrink-0 rounded-full bg-purple-100 text-purple-700 px-1.5 py-0.2 text-[10px] font-bold">
                              Con
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted">{u.email ?? u.id.slice(0, 10)}</p>
                        {(u.role === 'student' || u.role === 'child') && u.guardianParent && (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setUserSearch(u.guardianParent?.email || u.guardianParent?.name || '')
                                setRoleFilter('')
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 px-2 py-0.5 text-xs font-semibold transition cursor-pointer text-left"
                              title={`Tìm phụ huynh: ${u.guardianParent.name || u.guardianParent.email}`}
                            >
                              <span aria-hidden="true">👨‍👧</span>
                              <span>
                                Phụ huynh:{' '}
                                <strong>{u.guardianParent.name || u.guardianParent.email}</strong>
                              </span>
                            </button>
                          </div>
                        )}
                        {u.role === 'parent' && u.children && u.children.length > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 text-xs font-semibold">
                            <span aria-hidden="true">👶</span>
                            <span>
                              {u.children.length} con: {u.children.map((c) => c.name).join(', ')}
                            </span>
                          </div>
                        )}
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

      {/* ── Modal Tạo tài khoản Gia đình mới ─────────────────── */}
      <CreateUserModal
        open={showCreateModal}
        form={createForm}
        onChange={setCreateForm}
        onSubmit={(e) => void createUser(e)}
        onClose={() => setShowCreateModal(false)}
      />


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
