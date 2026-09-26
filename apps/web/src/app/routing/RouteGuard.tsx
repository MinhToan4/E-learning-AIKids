import { Navigate } from 'react-router'
import { getAccessToken } from '@/shared/lib/api'
import { hasAnyPermission } from '@/shared/lib/rbac'
import { useAuth } from '@/shared/store/auth'
import type { User } from '@/shared/lib/api'

export function RouteFallback() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="ui-skeleton h-14 w-14 rounded-2xl" />
      <p className="font-display text-xl text-brand-500">Đang mở cổng sao…</p>
      <p className="text-sm text-muted">Chờ một chút nhé</p>
    </div>
  )
}

function homeFor(role: User['role']) {
  if (role === 'admin') return '/admin'
  if (role === 'teacher') return '/teacher'
  if (role === 'parent') return '/kids'
  return '/home'
}

type RouteGuardProps = {
  children: React.ReactNode
  roles?: Array<User['role']>
  permissions?: string[]
  requireOnboarded?: boolean
}

export function RouteGuard({
  children,
  roles,
  permissions,
  requireOnboarded = false,
}: RouteGuardProps) {
  const user = useAuth((state) => state.user)
  const activeContext = useAuth((state) => state.activeContext)
  const loading = useAuth((state) => state.loading)
  const error = useAuth((state) => state.error)
  const bootstrap = useAuth((state) => state.bootstrap)

  if (loading) return <RouteFallback />
  if (!user && getAccessToken() && error) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-page px-4 py-10">
        <section className="ui-card w-full max-w-lg p-7 text-center" role="alert">
          <h1 className="font-display text-2xl text-ink">Chưa kết nối được phiên học</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <button
            type="button"
            className="ui-btn ui-btn-primary mt-5"
            onClick={() => void bootstrap()}
          >
            Thử kết nối lại
          </button>
        </section>
      </main>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />
  }
  if (permissions?.length && !hasAnyPermission(user, activeContext, permissions)) {
    return <Navigate to={homeFor(user.role)} replace />
  }
  if (requireOnboarded && user.role === 'student' && !user.onboarded) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}
