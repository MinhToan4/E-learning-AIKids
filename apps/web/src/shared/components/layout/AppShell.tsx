import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { ParentGateModal } from '@/features/parent/components/ParentGateModal'
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
import {
  NavBackpackIcon,
  NavBadgeIcon,
  NavCreativeIcon,
  NavHomeIcon,
  NavLeaderboardIcon,
  NavProfileIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'
import {
  ParentApprovalIcon,
  ParentDashboardIcon,
  ParentKidsIcon,
  ParentPlanIcon,
  ParentProfileIcon,
} from '@/shared/components/icons/ParentIcons'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/shared/store/auth'

type NavIcon = React.ComponentType<{ size?: number; className?: string }>

type RoleNavItem = {
  to: string
  label: string
  icon: NavIcon
  end?: boolean
}

function WorkspaceSwitcher() {
  const access = useAuth((state) => state.access)
  const active = useAuth((state) => state.activeContext)
  const selectContext = useAuth((state) => state.selectContext)
  if (!access || access.contexts.length < 2 || !active) return null

  return (
    <label className="mx-3 mt-auto mb-3 block text-xs font-bold text-muted">
      Workspace
      <select
        className="mt-1 w-full rounded-xl border border-border bg-white px-2 py-2 text-sm text-text"
        value={active.id}
        onChange={async (event) => {
          const context = await selectContext(event.target.value)
          const isAikidHost = window.location.hostname === 'app.aikid.vn' ||
            window.location.hostname.endsWith('.aikid.vn')
          if (isAikidHost) {
            const host = context.type === 'organization' && context.organizationSlug
              ? `${context.organizationSlug}.aikid.vn`
              : 'app.aikid.vn'
            window.location.assign(`https://${host}${context.defaultRoute}`)
            return
          }
          window.location.assign(context.defaultRoute)
        }}
      >
        {access.contexts.map((context) => (
          <option key={context.id} value={context.id}>
            {context.label}
          </option>
        ))}
      </select>
    </label>
  )
}

const studentNav = [
  { to: '/home', label: 'Nhà', icon: NavHomeIcon },
  { to: '/world', label: 'Học', icon: NavWorldIcon },
  { to: '/creative', label: 'Xưởng', icon: NavCreativeIcon },
  { to: '/leaderboard', label: 'Tiến bộ', icon: NavLeaderboardIcon },
  { to: '/achievements', label: 'Huy hiệu', icon: NavBadgeIcon },
  { to: '/backpack', label: 'Ba lô', icon: NavBackpackIcon },
  { to: '/profile', label: 'Hồ sơ', icon: NavProfileIcon },
]

function RoleNavigation({
  nav,
  mobile = false,
}: {
  nav: RoleNavItem[]
  mobile?: boolean
}) {
  return (
    <nav
      className={mobile ? 'role-mobile-nav' : 'role-nav'}
      aria-label="Điều hướng khu vực"
    >
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn('role-nav-link', mobile && 'role-nav-link-mobile', isActive && 'role-nav-link-active')
          }
        >
          <span className="role-nav-icon" aria-hidden="true">
            <Icon size={mobile ? 23 : 26} />
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function AdultChrome({
  children,
  nav,
  brandTo,
}: {
  children?: React.ReactNode
  nav: RoleNavItem[]
  brandTo: string
}) {
  return (
    <div className="role-shell role-tone-parent min-h-dvh lg:pl-60">
      <aside className="role-rail fixed inset-y-0 left-0 z-30 hidden w-60 flex-col lg:flex">
        <div className="role-brand">
          <NavLink to={brandTo} aria-label="Trang chính phụ huynh">
            <BrandLogo size="md" />
          </NavLink>
          <p>Góc phụ huynh</p>
        </div>
        <RoleNavigation nav={nav} />
        <WorkspaceSwitcher />
      </aside>

      <div className="role-mobile-chrome lg:hidden">
        <header className="role-mobile-header">
          <NavLink to={brandTo} aria-label="Trang chính phụ huynh">
            <BrandLogo size="sm" />
          </NavLink>
          <span>Phụ huynh</span>
        </header>
        <RoleNavigation nav={nav} mobile />
      </div>

      <main className="page-enter mx-auto max-w-6xl px-3 py-5 sm:px-5 sm:py-6">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}

function CmsShell({
  nav,
  brandTo,
  roleLabel,
  tone,
}: {
  nav: RoleNavItem[]
  brandTo: string
  roleLabel: string
  tone: 'teacher' | 'admin'
}) {
  return (
    <div className={`role-shell role-tone-${tone} min-h-dvh md:pl-60`}>
      <aside className="role-rail fixed inset-y-0 left-0 z-30 hidden w-60 flex-col md:flex">
        <div className="role-brand">
          <NavLink to={brandTo} aria-label={`Trang chính ${roleLabel}`}>
            <BrandLogo size="md" />
          </NavLink>
          <p>{roleLabel}</p>
        </div>
        <RoleNavigation nav={nav} />
        <WorkspaceSwitcher />
      </aside>

      <div className="role-mobile-chrome md:hidden">
        <header className="role-mobile-header">
          <NavLink to={brandTo} aria-label={`Trang chính ${roleLabel}`}>
            <BrandLogo size="sm" />
          </NavLink>
          <span>{roleLabel}</span>
        </header>
        <RoleNavigation nav={nav} mobile />
      </div>

      <main className="page-enter mx-auto min-w-0 max-w-[1440px] px-3 py-5 sm:px-5">
        <Outlet />
      </main>
    </div>
  )
}

export function AppShell() {
  const user = useAuth((s) => s.user)
  const activeContext = useAuth((s) => s.activeContext)
  const [gateOpen, setGateOpen] = useState(false)

  if (user?.role === 'parent') {
    return (
      <AdultChrome
        brandTo="/parent"
        nav={[
          { to: '/kids', label: 'Cho con học', icon: NavWorldIcon },
          { to: '/parent', label: 'Tổng quan', icon: ParentDashboardIcon, end: true },
          { to: '/parent/kids', label: 'Con của tôi', icon: ParentKidsIcon },
          { to: '/parent/plan', label: 'Gói học', icon: ParentPlanIcon },
          { to: '/parent/approvals', label: 'Chờ duyệt', icon: ParentApprovalIcon },
          { to: '/parent/profile', label: 'Hồ sơ', icon: ParentProfileIcon },
        ]}
      />
    )
  }

  if (activeContext?.actor === 'org_admin') {
    return (
      <CmsShell
        brandTo="/organization"
        roleLabel={activeContext.label}
        tone="teacher"
        nav={[
          { to: '/organization', label: 'Tổng quan', icon: CmsOverviewIcon, end: true },
          { to: '/teacher', label: 'Lớp học', icon: CmsClassesIcon },
          { to: '/teacher/courses', label: 'Khóa học', icon: CmsCoursesIcon },
          { to: '/teacher/lectures', label: 'Bài giảng', icon: CmsLecturesIcon },
          { to: '/teacher/stats', label: 'Thống kê', icon: CmsAnalyticsIcon },
        ]}
      />
    )
  }

  if (user?.role === 'teacher') {
    return (
      <CmsShell
        brandTo="/teacher"
        roleLabel="Giáo viên"
        tone="teacher"
        nav={[
          { to: '/teacher', label: 'Lớp học', icon: CmsClassesIcon, end: true },
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
        roleLabel="Quản trị"
        tone="admin"
        nav={[
          { to: '/admin', label: 'Tổng quan', icon: CmsOverviewIcon, end: true },
          { to: '/admin/analytics', label: 'Phân tích', icon: CmsAnalyticsIcon },
          { to: '/admin/logs', label: 'Nhật ký', icon: CmsLogsIcon },
          { to: '/admin/users', label: 'Tài khoản', icon: CmsUsersIcon },
          { to: '/admin/sessions', label: 'Phiên đăng nhập', icon: CmsSessionsIcon },
          { to: '/admin/courses', label: 'Khóa học', icon: CmsCoursesIcon },
          { to: '/admin/ai', label: 'AI Vidtory', icon: CmsAiIcon },
          { to: '/teacher', label: 'Giao diện giáo viên', icon: CmsClassesIcon },
        ]}
      />
    )
  }

  const hasParent = Boolean(user?.parentId)

  const location = useLocation()
  const isCreative = location.pathname.startsWith('/creative')

  return (
    <div className="min-h-dvh pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:pb-8 md:pl-[6rem]">
      <aside className="student-rail fixed left-0 top-0 z-30 hidden h-dvh w-24 flex-col items-center gap-1.5 border-r border-border/70 py-4 md:flex">
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
                'student-nav-link w-[4.5rem]',
                isActive && 'student-nav-link-active',
              )
            }
          >
            <span className="student-nav-icon" aria-hidden="true">
              <Icon size={27} />
            </span>
            {label}
          </NavLink>
        ))}

        {hasParent && (
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            aria-label="Gọi ba mẹ"
            title="Ba/Mẹ ơi!"
            className="mt-auto flex w-16 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-extrabold text-amber-500 transition-all hover:scale-105 hover:bg-amber-50"
          >
            <span className="text-2xl leading-none" aria-hidden="true">🏡</span>
            <span>Ba/Mẹ</span>
          </button>
        )}
      </aside>

      <div className="fixed right-3 top-3 z-40 flex items-center gap-2 sm:right-4 md:right-6">
        {hasParent && (
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            aria-label="Gọi ba mẹ"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-xl shadow-sm transition hover:bg-amber-100 md:hidden"
          >
            <span aria-hidden="true">🏡</span>
          </button>
        )}
        <NotificationBell />
      </div>

      {isCreative ? (
        <main className="mx-auto max-w-[1440px] px-2 py-2 sm:px-4">
          <Outlet />
        </main>
      ) : (
        <main className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
          <Outlet />
        </main>
      )}

      <nav
        className="student-bottom-nav fixed inset-x-0 bottom-0 z-30 flex justify-around px-1 py-1.5 safe-pb md:hidden"
        aria-label="Điều hướng chính"
      >
        {studentNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'student-nav-link min-h-[3.75rem] min-w-0 flex-1 gap-0 rounded-xl px-0.5 py-1 text-[11px]',
                isActive && 'student-nav-link-active',
              )
            }
          >
            <span className="student-nav-icon !h-8 !w-9 !rounded-xl" aria-hidden="true">
              <Icon size={23} />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <ParentGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </div>
  )
}
