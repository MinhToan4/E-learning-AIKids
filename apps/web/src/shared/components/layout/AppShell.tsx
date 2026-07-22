import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { ParentGateModal } from '@/features/parent/components/ParentGateModal'
import {
  NavBackpackIcon,
  NavBadgeIcon,
  NavHomeIcon,
  NavLeaderboardIcon,
  NavProfileIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'
import {
  CmsAiIcon,
  CmsAnalyticsIcon,
  CmsClassesIcon,
  CmsCoursesIcon,
  CmsLecturesIcon,
  CmsLogsIcon,
  CmsOverviewIcon,
  CmsSessionsIcon,
  CmsUsersIcon,
} from '@/shared/components/icons/CmsIcons'

const studentNav = [
  { to: '/home', label: 'Nhà', icon: NavHomeIcon },
  { to: '/world', label: 'Học', icon: NavWorldIcon },
  { to: '/leaderboard', label: 'Tiến bộ', icon: NavLeaderboardIcon },
  { to: '/achievements', label: 'Huy hiệu', icon: NavBadgeIcon },
  { to: '/backpack', label: 'Ba lô', icon: NavBackpackIcon },
  { to: '/profile', label: 'Tôi', icon: NavProfileIcon },
]

/**
 * AdultChrome — top header + centered max-width content.
 * Used for parent role (less dense, needs max-w for reading comfort).
 */
function AdultChrome({
  children,
  nav,
  brandTo,
}: {
  children?: React.ReactNode
  nav: Array<{ to: string; label: string; end?: boolean }>
  brandTo: string
}) {
  return (
    <div className="min-h-dvh safe-pt">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 px-3 py-3 backdrop-blur sm:px-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <NavLink to={brandTo} className="min-w-0 shrink" aria-label="Trang chính">
            <BrandLogo size="sm" />
          </NavLink>
          <nav className="flex max-w-[70%] flex-wrap justify-end gap-1 sm:gap-2">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'ui-btn ui-btn-ghost min-h-10 px-2 text-xs sm:px-3 sm:text-sm',
                    isActive && 'bg-brand-50 text-brand-600',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="page-enter mx-auto max-w-5xl px-3 py-5 sm:px-4 sm:py-6">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}

/**
 * CmsShell — full-width CMS layout.
 * Left sidebar fixed, content uses all remaining width.
 * Used for teacher + admin roles (dense, data-heavy).
 */
function CmsShell({
  nav,
  brandTo,
  accentClass = 'text-brand-600',
  activeBg = 'bg-brand-50',
}: {
  nav: Array<{
    to: string
    label: string
    icon?: React.ComponentType<{ size?: number }>
    end?: boolean
  }>
  brandTo: string
  accentClass?: string
  activeBg?: string
}) {
  return (
    <div className="flex min-h-dvh">
      {/* Sidebar */}
      <aside
        className="sticky top-0 hidden h-dvh w-52 shrink-0 flex-col border-r border-border/60 bg-white/95 shadow-soft md:flex"
        style={{ zIndex: 30 }}
      >
        <div className="flex h-14 items-center border-b border-border/40 px-4">
          <NavLink to={brandTo} aria-label="Trang chủ CMS">
            <BrandLogo size="sm" />
          </NavLink>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors',
                  isActive
                    ? `${activeBg} ${accentClass}`
                    : 'text-muted hover:bg-brand-50/60 hover:text-text',
                )
              }
            >
              {item.icon && <item.icon size={20} />}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Top bar mobile */}
      <div className="fixed left-0 right-0 top-0 z-20 flex h-12 items-center justify-between border-b border-border/60 bg-white/95 px-4 backdrop-blur md:hidden">
        <NavLink to={brandTo} aria-label="Trang chủ CMS">
          <BrandLogo size="sm" />
        </NavLink>
        <span className="text-xs font-extrabold uppercase tracking-wide text-muted">CMS</span>
      </div>

      {/* Main content — full width */}
      <main className="page-enter min-w-0 flex-1 px-4 py-5 pt-16 md:pt-5">
        <Outlet />
      </main>
    </div>
  )
}

export function AppShell() {
  const user = useAuth((s) => s.user)

  if (user?.role === 'parent') {
    return (
      <AdultChrome
        brandTo="/parent"
        nav={[
          { to: '/kids', label: 'Cho con học' },
          { to: '/parent', label: 'Tổng quan', end: true },
          { to: '/parent/kids', label: 'Con' },
          { to: '/parent/plan', label: 'Gói' },
          { to: '/parent/approvals', label: 'Duyệt' },
          { to: '/parent/profile', label: 'Hồ sơ' },
        ]}
      />
    )
  }

  if (user?.role === 'teacher') {
    return (
      <CmsShell
        brandTo="/teacher"
        accentClass="text-sky-600"
        activeBg="bg-sky-50"
        nav={[
          { to: '/teacher', label: 'Lớp & Học sinh', icon: CmsClassesIcon, end: true },
          { to: '/teacher/courses', label: 'Khóa học', icon: CmsCoursesIcon },
          { to: '/teacher/lectures', label: 'Bài giảng', icon: CmsLecturesIcon },
          { to: '/teacher/stats', label: 'Thống kê', icon: CmsAnalyticsIcon },
        ]}
      />
    )
  }

  if (user?.role === 'admin') {
    return (
      <CmsShell
        brandTo="/admin"
        accentClass="text-brand-600"
        activeBg="bg-brand-50"
        nav={[
          { to: '/admin', label: 'Tổng quan', icon: CmsOverviewIcon, end: true },
          { to: '/admin/analytics', label: 'Analytics', icon: CmsAnalyticsIcon },
          { to: '/admin/logs', label: 'Login Logs', icon: CmsLogsIcon },
          { to: '/admin/users', label: 'Tài khoản', icon: CmsUsersIcon },
          { to: '/admin/sessions', label: 'Phiên', icon: CmsSessionsIcon },
          { to: '/admin/courses', label: 'Khóa học', icon: CmsCoursesIcon },
          { to: '/admin/ai', label: 'AI Vidtory', icon: CmsAiIcon },
          { to: '/teacher', label: '→ Xem CMS GV', icon: CmsClassesIcon },
        ]}
      />
    )
  }

  // Student shell — desktop rail + mobile bottom nav
  const [gateOpen, setGateOpen] = useState(false)
  const hasParent = Boolean(user?.parentId)

  return (
    <div className="min-h-dvh pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 md:pl-[5.5rem]">
      <aside className="fixed left-0 top-0 z-30 hidden h-dvh w-[5.5rem] flex-col items-center gap-2 border-r border-border/70 bg-white/90 py-4 backdrop-blur md:flex">
        <NavLink
          to="/home"
          className="mb-3 flex w-full items-center justify-center px-2"
          aria-label="Về trang nhà"
        >
          <BrandLogo size="md" className="max-w-[4.75rem]" />
        </NavLink>
        {studentNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex w-16 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-extrabold text-muted transition-all duration-150 hover:scale-105',
                isActive && 'bg-brand-50 text-brand-600 shadow-sm',
              )
            }
          >
            <Icon size={26} />
            {label}
          </NavLink>
        ))}

        {/* Parent Gate button — desktop rail, only for students with a parent */}
        {hasParent && (
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            aria-label="Gọi ba mẹ"
            title="Ba/Mẹ ơi!"
            className="mt-auto flex w-16 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-extrabold text-amber-500 transition-all hover:bg-amber-50 hover:scale-105"
          >
            <span className="text-2xl leading-none">🏡</span>
            <span>Ba/Mẹ</span>
          </button>
        )}
      </aside>

      <div className="fixed right-3 top-3 z-40 flex items-center gap-2 sm:right-4 md:right-6">
        {/* Parent Gate button — mobile top-right, only for students with a parent */}
        {hasParent && (
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            aria-label="Gọi ba mẹ"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-xl shadow-sm transition hover:bg-amber-100 md:hidden"
          >
            🏡
          </button>
        )}
        <NotificationBell />
      </div>

      <main className="page-enter mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-5">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border/80 bg-white/95 px-1 py-1.5 backdrop-blur safe-pb md:hidden"
        aria-label="Điều hướng chính"
      >
        {studentNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex min-h-14 min-w-[3.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-extrabold text-muted transition-all duration-150 xs:text-[11px]',
                isActive && 'bg-brand-50 text-brand-600',
              )
            }
          >
            <Icon size={24} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Parent Gate Modal — child-to-parent handoff */}
      <ParentGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </div>
  )
}
