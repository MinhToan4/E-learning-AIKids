import { Link, Navigate } from 'react-router'
import { hasAnyPermission } from '@/shared/lib/rbac'
import { useAuth } from '@/shared/store/auth'
import type { User } from '@/shared/lib/api'
import { designerAssets } from '@/shared/config/assets'

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
  if (role === 'parent') return '/parent'
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

  if (!user && error) {
    if (!error || error.includes('hết hạn') || error.includes('401') || error.includes('Unauthorized')) {
      return <Navigate to="/login" replace />
    }
    return (
      <main className="flex min-h-dvh items-center justify-center bg-page px-4 py-10">
        <section className="ui-card w-full max-w-lg p-7 text-center shadow-clay border border-amber-200/80" role="alert">
          <img
            src={designerAssets.catPoses.welcome}
            alt="Mèo AIKI"
            className="mx-auto mb-4 h-28 object-contain"
          />
          <h1 className="font-display text-2xl text-ink">Chưa kết nối được phiên học</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <div className="mt-6 flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              className="ui-btn ui-btn-primary w-full sm:w-auto h-11 px-5 whitespace-nowrap"
              onClick={() => void bootstrap()}
            >
              Thử kết nối lại
            </button>
            <Link to="/login" className="ui-btn ui-btn-secondary w-full sm:w-auto h-11 px-5 whitespace-nowrap">
              Đăng nhập lại
            </Link>
            <Link to="/" className="ui-btn ui-btn-ghost w-full sm:w-auto h-11 px-5 whitespace-nowrap">
              Về trang giới thiệu
            </Link>
          </div>
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
