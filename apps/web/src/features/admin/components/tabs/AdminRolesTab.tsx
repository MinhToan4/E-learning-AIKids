import { useState, useEffect, useMemo, useCallback } from 'react'
import { cn } from '@/shared/lib/cn'
import { api } from '@/shared/lib/api'
import { UserManagementNav } from '../UserManagementNav'
import type { SystemInfo, RoleDefinition, PermissionCategory, PermissionItem } from '../../types'

// ── Định nghĩa Danh mục Quyền hạn Chuẩn ────────────────────────
export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  { key: 'curriculum', name: 'Giáo trình & Khóa học', icon: '🎓' },
  { key: 'classroom', name: 'Lớp học & Học sinh', icon: '🏫' },
  { key: 'users', name: 'Người dùng & Phân quyền', icon: '👥' },
  { key: 'billing', name: 'Tài chính & Thu ngân', icon: '💳' },
  { key: 'system', name: 'Kỹ thuật & AI Studio', icon: '🤖' },
]

export const PERMISSION_ITEMS: PermissionItem[] = [
  // 🎓 Giáo trình & Khóa học
  { key: 'curriculum.view', name: 'Xem giáo trình', description: 'Xem cấu trúc môn học, đảo và trạm', category: 'curriculum' },
  { key: 'curriculum.create', name: 'Tạo đảo/khóa', description: 'Tạo khóa học mới và các chặng đảo', category: 'curriculum' },
  { key: 'curriculum.edit', name: 'Soạn trạm & nội dung', description: 'Chỉnh sửa chi tiết bài giảng, câu hỏi AI và câu đố', category: 'curriculum' },
  { key: 'curriculum.publish', name: 'Bật/tắt xuất bản', description: 'Kích hoạt mở khóa trạm học hoặc gỡ bài', category: 'curriculum' },
  { key: 'curriculum.delete', name: 'Xóa/lưu trữ giáo trình', description: 'Lưu trữ hoặc xóa bỏ học liệu', category: 'curriculum' },

  // 🏫 Lớp học & Học sinh
  { key: 'classroom.view', name: 'Xem danh sách lớp', description: 'Xem danh sách lớp học và hồ sơ học sinh', category: 'classroom' },
  { key: 'classroom.manage', name: 'Tạo lớp & cấp mã', description: 'Mở lớp mới và phát hành mã tham gia', category: 'classroom' },
  { key: 'classroom.add_student', name: 'Thêm/gỡ học sinh', description: 'Xếp học sinh vào lớp hoặc chuyển lớp', category: 'classroom' },
  { key: 'classroom.grade', name: 'Chấm điểm & báo cáo', description: 'Theo dõi tiến độ, chấm bài và gửi tin nhắn phụ huynh', category: 'classroom' },

  // 👥 Người dùng & Phân quyền
  { key: 'users.view', name: 'Xem người dùng & gia đình', description: 'Tra cứu danh sách tài khoản và liên kết Phụ huynh - Con', category: 'users' },
  { key: 'users.edit', name: 'Sửa thông tin tài khoản', description: 'Cập nhật email, biệt danh, mật khẩu phụ', category: 'users' },
  { key: 'users.assign_role', name: 'Gán vai trò & quyền hạn', description: 'Thay đổi chức vụ và cấp đặc quyền', category: 'users' },
  { key: 'users.disable', name: 'Khóa/mở tài khoản', description: 'Tạm đình chỉ hoặc mở lại quyền truy cập', category: 'users' },

  // 💳 Tài chính & Thu ngân
  { key: 'billing.view', name: 'Xem doanh thu & đơn hàng', description: 'Báo cáo tài chính, lịch sử giao dịch gói học', category: 'billing' },
  { key: 'billing.pos', name: 'Duyệt đơn VietQR tại quầy', description: 'Xác nhận thanh toán thủ công và kích hoạt ngay', category: 'billing' },
  { key: 'billing.config', name: 'Cấu hình giá gói & nạp AI', description: 'Thiết lập bảng giá gói 129k và hạn mức AI tokens', category: 'billing' },

  // 🤖 Kỹ thuật & AI Studio
  { key: 'system.ai_routing', name: 'Cấu hình model & AI routing', description: 'Chỉ định model Gemini/Claude, fallback và quota', category: 'system' },
  { key: 'system.logs', name: 'Xem nhật ký bảo mật', description: 'Theo dõi login audit, lỗi runtime và an toàn dữ liệu', category: 'system' },
  { key: 'system.manage_roles', name: 'Quản trị phân quyền (RBAC)', description: 'Hiệu chỉnh ma trận phân quyền hệ thống', category: 'system' },
]

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    key: 'platform_admin',
    name: 'Quản Trị Viên Tối Cao',
    description: 'Toàn quyền điều hành toàn bộ hạ tầng LMS, người dùng, tài chính và cấu hình AI Studio.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    isSystem: true,
  },
  {
    key: 'curriculum_lead',
    name: 'Trưởng Ban Chuyên Môn',
    description: 'Chủ trì thiết kế nội dung khóa học, phê duyệt xuất bản bài học và giám sát chất lượng giảng dạy.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    isSystem: true,
  },
  {
    key: 'teacher',
    name: 'Giáo Viên Giảng Dạy',
    description: 'Quản lý lớp học phụ trách, xếp học sinh, chấm điểm và biên soạn nội dung bổ trợ.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    isSystem: true,
  },
  {
    key: 'parent',
    name: 'Phụ Huynh Học Sinh',
    description: 'Theo dõi lộ trình học tập của con, nhận báo cáo kết quả và quản lý gói thanh toán học phí.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    isSystem: true,
  },
  {
    key: 'student',
    name: 'Học Sinh',
    description: 'Tham gia khám phá các trạm bài học, tương tác gia sư AI, làm bài tập và nhận huy hiệu thưởng.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    isSystem: true,
  },
]

// ── Bảng phân quyền mặc định chuẩn mực ────────────────────────
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  platform_admin: PERMISSION_ITEMS.map((p) => p.key),
  curriculum_lead: [
    'curriculum.view',
    'curriculum.create',
    'curriculum.edit',
    'curriculum.publish',
    'curriculum.delete',
    'classroom.view',
    'users.view',
    'system.logs',
  ],
  teacher: [
    'curriculum.view',
    'curriculum.edit',
    'classroom.view',
    'classroom.manage',
    'classroom.add_student',
    'classroom.grade',
  ],
  parent: [
    'curriculum.view',
    'billing.view',
    'billing.pos',
  ],
  student: [
    'curriculum.view',
  ],
}

const STORAGE_KEY = 'aikids_admin_role_permissions'
const LEGACY_STORAGE_KEY = 'storymee_rbac_permissions_v1'

export function AdminRolesTab() {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'catalog'>('matrix')
  const [permissions, setPermissions] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ROLE_PERMISSIONS
  })

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    let isMounted = true
    void api<{ system: SystemInfo }>('/api/admin/system')
      .then((res) => {
        if (isMounted && res?.system) {
          setSystemInfo(res.system)
        }
      })
      .catch(() => {
        // Silent catch fallback
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleToggle = (roleKey: string, permKey: string) => {
    setPermissions((prev) => {
      const currentPerms = prev[roleKey] || []
      const hasPerm = currentPerms.includes(permKey)
      const nextPerms = hasPerm
        ? currentPerms.filter((p) => p !== permKey)
        : [...currentPerms, permKey]
      return {
        ...prev,
        [roleKey]: nextPerms,
      }
    })
  }

  const handleSave = () => {
    try {
      const serialized = JSON.stringify(permissions)
      localStorage.setItem(STORAGE_KEY, serialized)
      localStorage.setItem(LEGACY_STORAGE_KEY, serialized)
      setSavedSuccess('Đã lưu cấu hình ma trận phân quyền thành công!')
      setTimeout(() => setSavedSuccess(null), 3500)
    } catch {
      setSavedSuccess('Lưu thất bại. Vui lòng thử lại.')
      setTimeout(() => setSavedSuccess(null), 3500)
    }
  }

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục phân quyền về giá trị mặc định?')) {
      setPermissions(DEFAULT_ROLE_PERMISSIONS)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      setSavedSuccess('Đã khôi phục phân quyền mặc định!')
      setTimeout(() => setSavedSuccess(null), 3500)
    }
  }

  const filteredItems = useMemo(() => {
    if (filterCategory === 'all') return PERMISSION_ITEMS
    return PERMISSION_ITEMS.filter((p) => p.category === filterCategory)
  }, [filterCategory])

  const getUserCountForRole = useCallback(
    (roleKey: string) => {
      if (!systemInfo?.counts?.usersByRole) return 0
      const counts = systemInfo.counts.usersByRole
      if (roleKey === 'platform_admin') return counts.admin || 0
      if (roleKey === 'student') return (counts.student || 0) + (counts.child || 0)
      return counts[roleKey] || 0
    },
    [systemInfo],
  )

  return (
    <div className="space-y-6">
      <UserManagementNav activeTab="roles" />

      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-brand-950 sm:text-2xl">
            Quản Lý Vai Trò & Ma Trận Phân Quyền (RBAC)
          </h2>
          <p className="mt-1 text-sm text-muted">
            Quy định quyền hạn truy cập chức năng cho từng cấp độ người dùng trong hệ thống đào tạo StoryMee AIKids.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 rounded-2xl bg-brand-50 p-1.5 border border-brand-100">
          <button
            type="button"
            onClick={() => setActiveSubTab('matrix')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all',
              activeSubTab === 'matrix'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-brand-600 hover:text-brand-900',
            )}
          >
            <span>📊</span>
            <span>Ma Trận Quyền Hạn</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('catalog')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all',
              activeSubTab === 'catalog'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-brand-600 hover:text-brand-900',
            )}
          >
            <span>🛡️</span>
            <span>Danh Mục Vai Trò</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm font-black text-emerald-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{savedSuccess}</span>
          </div>
        </div>
      )}

      {/* SUBTAB 1: MA TRẬN QUYỀN HẠN (PERMISSIONS MATRIX) */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          {/* Action Bar & Category Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-brand-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Lọc nhóm:</span>
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition',
                  filterCategory === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100',
                )}
              >
                Tất cả ({PERMISSION_ITEMS.length})
              </button>
              {PERMISSION_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setFilterCategory(cat.key)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5',
                    filterCategory === cat.key
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-brand-50 text-brand-700 hover:bg-brand-100',
                  )}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-coral-200 bg-coral-50 px-4 py-2 text-xs font-black text-coral-700 hover:bg-coral-100 transition"
              >
                Khôi phục mặc định
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-black text-white hover:bg-brand-700 transition shadow-md shadow-brand-500/20 active:scale-95"
              >
                💾 Lưu thay đổi
              </button>
            </div>
          </div>

          {/* Matrix Grid Table */}
          <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-sm">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-brand-100 bg-brand-50/60 text-xs font-black text-brand-900">
                  <th className="py-3.5 px-4 w-72">Quyền Hạn / Chức Năng</th>
                  {ROLE_DEFINITIONS.map((role) => (
                    <th key={role.key} className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-extrabold">{role.name}</span>
                        <span className="text-[10px] font-normal text-muted">
                          ({(permissions[role.key] || []).length} quyền)
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50 text-sm">
                {PERMISSION_CATEGORIES.map((cat) => {
                  const categoryPerms = filteredItems.filter((p) => p.category === cat.key)
                  if (categoryPerms.length === 0) return null

                  return (
                    <tr key={`cat-header-${cat.key}`} className="bg-brand-50/30">
                      <td colSpan={1 + ROLE_DEFINITIONS.length} className="p-0">
                        <div className="flex items-center gap-2 border-b border-t border-brand-100 bg-brand-50/50 px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-800">
                          <span className="text-base">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                        <table className="w-full border-collapse">
                          <tbody>
                            {categoryPerms.map((perm) => (
                              <tr
                                key={perm.key}
                                className="border-b border-brand-50/80 hover:bg-brand-50/40 transition-colors"
                              >
                                <td className="py-3 px-4 w-72">
                                  <div className="font-bold text-brand-950 text-xs">{perm.name}</div>
                                  <div className="text-[11px] text-muted">{perm.description}</div>
                                  <code className="text-[10px] text-brand-500 font-mono">{perm.key}</code>
                                </td>
                                {ROLE_DEFINITIONS.map((role) => {
                                  const isChecked = (permissions[role.key] || []).includes(perm.key)
                                  const isPlatformAdmin = role.key === 'platform_admin'
                                  return (
                                    <td key={role.key} className="py-3 px-3 text-center">
                                      <label className="inline-flex cursor-pointer items-center justify-center p-1">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          disabled={isPlatformAdmin}
                                          onChange={() => handleToggle(role.key, perm.key)}
                                          className={cn(
                                            'h-5 w-5 rounded-md border-brand-300 text-brand-600 focus:ring-brand-500 transition cursor-pointer',
                                            isPlatformAdmin && 'opacity-60 cursor-not-allowed',
                                          )}
                                          title={
                                            isPlatformAdmin
                                              ? 'Quản trị viên tối cao luôn có mọi quyền'
                                              : `Bật/tắt ${perm.name} cho ${role.name}`
                                          }
                                        />
                                      </label>
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DANH MỤC VAI TRÒ (ROLES CATALOG) */}
      {activeSubTab === 'catalog' && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ROLE_DEFINITIONS.map((role) => {
            const rolePerms = permissions[role.key] || []
            const userCount = getUserCountForRole(role.key)

            return (
              <div
                key={role.key}
                className="flex flex-col justify-between rounded-3xl border border-brand-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        'rounded-xl border px-3 py-1 text-xs font-black',
                        role.badgeColor,
                      )}
                    >
                      {role.name}
                    </span>
                    <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                      {userCount} người dùng
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    {role.description}
                  </p>

                  <div className="mt-4 border-t border-brand-100 pt-4">
                    <div className="flex items-center justify-between text-xs font-bold text-brand-900">
                      <span>Đặc quyền kích hoạt:</span>
                      <span className="font-extrabold text-brand-600">
                        {rolePerms.length} / {PERMISSION_ITEMS.length}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {rolePerms.slice(0, 5).map((pKey) => {
                        const item = PERMISSION_ITEMS.find((p) => p.key === pKey)
                        return (
                          <span
                            key={pKey}
                            className="rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700"
                          >
                            ✓ {item?.name || pKey}
                          </span>
                        )
                      })}
                      {rolePerms.length > 5 && (
                        <span className="rounded-lg bg-brand-100/60 px-2 py-0.5 text-[11px] font-bold text-brand-800">
                          +{rolePerms.length - 5} quyền khác
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-brand-50 pt-3 text-[11px] text-muted">
                  <span>Mã vai trò: <code className="font-mono font-bold text-brand-700">{role.key}</code></span>
                  {role.isSystem && (
                    <span className="font-bold text-brand-500">Mặc định hệ thống</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
