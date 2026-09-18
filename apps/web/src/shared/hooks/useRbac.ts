import { useMemo, useCallback } from 'react'
import { useAuth } from '@/shared/store/auth'
import { hasPermission, hasAnyPermission, getEffectivePermissions } from '@/shared/lib/rbac'

export function useRbac() {
  const user = useAuth((s) => s.user)
  const activeContext = useAuth((s) => s.activeContext)

  const permissions = useMemo(
    () => Array.from(getEffectivePermissions(user, activeContext)),
    [user, activeContext],
  )

  const can = useCallback(
    (perm: string) => hasPermission(user, activeContext, perm),
    [user, activeContext],
  )

  const canAny = useCallback(
    (perms: string[]) => hasAnyPermission(user, activeContext, perms),
    [user, activeContext],
  )

  return {
    user,
    role: user?.role,
    permissions,
    can,
    canAny,
    isPlatformAdmin: user?.role === 'admin' || can('system.manage_roles'),
    isTeacher: user?.role === 'teacher' || can('classroom.manage'),
    isParent: user?.role === 'parent',
    isStudent: user?.role === 'student',
  }
}
