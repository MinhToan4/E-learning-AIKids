import type { AccessContext, User } from './api'

export const RBAC_STORAGE_KEY = 'aikids_admin_role_permissions'
const LEGACY_STORAGE_KEY = 'storymee_rbac_permissions_v1'

export const ALL_PERMISSIONS = [
  // 🎓 Giáo trình & Khóa học
  'curriculum.view',
  'curriculum.create',
  'curriculum.edit',
  'curriculum.publish',
  'curriculum.delete',

  // 🏫 Lớp học & Học sinh
  'classroom.view',
  'classroom.manage',
  'classroom.add_student',
  'classroom.grade',

  // 👥 Người dùng & Phân quyền
  'users.view',
  'users.edit',
  'users.assign_role',
  'users.disable',

  // 💳 Tài chính & Thu ngân
  'billing.view',
  'billing.pos',
  'billing.config',

  // 🤖 Kỹ thuật & AI Studio
  'system.ai_routing',
  'system.logs',
  'system.manage_roles',
] as const

export type AppPermission = (typeof ALL_PERMISSIONS)[number]

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  platform_admin: [...ALL_PERMISSIONS],
  admin: [...ALL_PERMISSIONS],
  curriculum_lead: [
    'curriculum.view',
    'curriculum.create',
    'curriculum.edit',
    'curriculum.publish',
    'classroom.view',
    'users.view',
  ],
  teacher: [
    'classroom.view',
    'classroom.manage',
    'classroom.add_student',
    'classroom.grade',
    'curriculum.view',
    'curriculum.edit',
  ],
  parent: [
    'curriculum.view',
    'classroom.view',
    'billing.view',
  ],
  student: [
    'curriculum.view',
  ],
}

/**
 * Đọc cấu hình quyền tùy chỉnh từ localStorage (do trang /admin/roles lưu)
 * Nếu chưa có hoặc parse lỗi, trả về từ DEFAULT_ROLE_PERMISSIONS[role] || []
 */
export function getRolePermissions(role: string): string[] {
  const normalizedRole = role === 'admin' ? 'platform_admin' : role
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw =
        window.localStorage.getItem(RBAC_STORAGE_KEY) ||
        window.localStorage.getItem(LEGACY_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed[normalizedRole])) {
            return parsed[normalizedRole] as string[]
          }
          if (Array.isArray(parsed[role])) {
            return parsed[role] as string[]
          }
        }
      }
    }
  } catch {
    // Fallback nếu không có hoặc parse lỗi
  }
  return (
    DEFAULT_ROLE_PERMISSIONS[normalizedRole] ||
    DEFAULT_ROLE_PERMISSIONS[role] ||
    []
  )
}

type UserWithPlatformRoles = User & {
  platformRoles?: string[]
}

/**
 * Tập hợp quyền hiệu lực từ user.role, user.platformRoles (nếu có), và context.permissions (nếu có).
 * Nếu user có vai trò admin hoặc platform_admin, cấp full quyền quản trị.
 */
export function getEffectivePermissions(
  user: UserWithPlatformRoles | null,
  context?: AccessContext | null,
): Set<string> {
  const effective = new Set<string>()
  if (!user) return effective

  const isSuperAdmin =
    user.role === 'admin' ||
    user.platformRoles?.includes('platform_admin') ||
    context?.roles?.includes('platform_admin') ||
    context?.actor === 'admin'

  if (isSuperAdmin) {
    for (const perm of ALL_PERMISSIONS) {
      effective.add(perm)
    }
    return effective
  }

  // 1. Quyền từ user.role
  if (user.role) {
    const rolePerms = getRolePermissions(user.role)
    for (const perm of rolePerms) {
      effective.add(perm)
    }
  }

  // 2. Quyền từ platformRoles (nếu có)
  if (Array.isArray(user.platformRoles)) {
    for (const pRole of user.platformRoles) {
      const pPerms = getRolePermissions(pRole)
      for (const perm of pPerms) {
        effective.add(perm)
      }
    }
  }

  // 3. Quyền từ context (roles & explicit permissions)
  if (context) {
    if (Array.isArray(context.roles)) {
      for (const cRole of context.roles) {
        const cPerms = getRolePermissions(cRole)
        for (const perm of cPerms) {
          effective.add(perm)
        }
      }
    }
    if (Array.isArray(context.permissions)) {
      for (const perm of context.permissions) {
        effective.add(perm)
      }
    }
  }

  return effective
}

/**
 * Kiểm tra người dùng có quyền cụ thể hay không
 */
export function hasPermission(
  user: UserWithPlatformRoles | null,
  context: AccessContext | null | undefined,
  permission: string,
): boolean {
  if (!user) return false
  const effective = getEffectivePermissions(user, context)
  return effective.has(permission)
}

/**
 * Kiểm tra người dùng có ít nhất một trong các quyền được yêu cầu
 */
export function hasAnyPermission(
  user: UserWithPlatformRoles | null,
  context: AccessContext | null | undefined,
  permissions: string[],
): boolean {
  if (!user || permissions.length === 0) return false
  const effective = getEffectivePermissions(user, context)
  return permissions.some((perm) => effective.has(perm))
}

/**
 * Kiểm tra người dùng có tất cả các quyền được yêu cầu
 */
export function hasAllPermissions(
  user: UserWithPlatformRoles | null,
  context: AccessContext | null | undefined,
  permissions: string[],
): boolean {
  if (!user || permissions.length === 0) return false
  const effective = getEffectivePermissions(user, context)
  return permissions.every((perm) => effective.has(perm))
}
