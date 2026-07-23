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

// ── Student nav split: pinned bar + drawer ───────────────────
const studentPinnedNav = [
  { to: '/home',        label: 'Nhà',     icon: NavHomeIcon        },
  { to: '/world',       label: 'Học',     icon: NavWorldIcon       },
  { to: '/creative',    label: 'Xưởng',   icon: NavCreativeIcon    },
  { to: '/leaderboard', label: 'Tiến bộ', icon: NavLeaderboardIcon },
]
const studentDrawerNav = [
  { to: '/achievements', label: 'Huy hiệu', icon: NavBadgeIcon   },
  { to: '/backpack',     label: 'Ba lô',    icon: NavBackpackIcon },
  { to: '/profile',      label: 'Hồ sơ',    icon: NavProfileIcon },
]
// Full list for desktop sidebar (all 7 unchanged)
const studentNav = [
  { to: '/home',         label: 'Nhà',      icon: NavHomeIcon        },
  { to: '/world',        label: 'Học',      icon: NavWorldIcon       },
  { to: '/creative',     label: 'Xưởng',    icon: NavCreativeIcon    },
  { to: '/leaderboard',  label: 'Tiến bộ',  icon: NavLeaderboardIcon },
  { to: '/achievements', label: 'Huy hiệu', icon: NavBadgeIcon       },
  { to: '/backpack',     label: 'Ba lô',    icon: NavBackpackIcon    },
  { to: '/profile',      label: 'Hồ sơ',    icon: NavProfileIcon     },
]

// ── Desktop sidebar nav (vertical) ───────────────────────────
function DesktopSideNav({ nav }: { nav: RoleNavItem[] }) {
  return (
    <nav className="role-nav" aria-label="Điều hướng khu vực">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn('role-nav-link', isActive && 'role-nav-link-active')
          }
        >
          <span className="role-nav-icon" aria-hidden="true">
            <Icon size={26} />
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// ── Adult bottom nav item ─────────────────────────────────────
function AdultBottomLink({
  to,
  label,
  icon: Icon,
  end,
  tone,
}: RoleNavItem & { tone: string }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn('adult-bottom-link', `adult-bottom-link-${tone}`, isActive && 'adult-bottom-link-active')
      }
    >
      <span className="adult-bottom-icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <span>{label}</span>
    </NavLink>
  )
}

// ── Student bottom drawer (Huy hiệu / Ba lô / Hồ sơ) ───────────
function StudentDrawer() {
  const [open, setOpen] = useState(false)

  // Close drawer on navigate
  const handleNav = () => setOpen(false)

  // Check if any drawer route is active
  const drawerPaths = studentDrawerNav.map((n) => n.to)
  const anyDrawerActive = drawerPaths.some((p) => window.location.pathname.startsWith(p))

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1.5px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer sheet — slide up */}
      <div
        className={cn(
          'student-drawer-sheet',
          open ? 'student-drawer-open' : 'student-drawer-closed',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Bộ sưu tập của con"
      >
        <div className="student-drawer-handle" aria-hidden="true" />
        <p className="student-drawer-title">✨ Bộ sưu tập của con</p>
        <nav className="student-drawer-grid" aria-label="Bộ sưu tập">
          {studentDrawerNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNav}
              className={({ isActive }) =>
                cn('student-drawer-item', isActive && 'student-drawer-item-active')
              }
            >
              <span className="student-drawer-icon" aria-hidden="true">
                <Icon size={26} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Pinned bottom bar */}
      <nav
        className="student-bottom-nav"
        aria-label="Điều hướng chính"
      >
        {studentPinnedNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'student-nav-link min-h-[3.75rem] flex-1 gap-0 rounded-xl px-0.5 py-1 text-[10px]',
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

        {/* More button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Đóng bộ sưu tập' : 'Mở bộ sưu tập'}
          className={cn(
            'student-nav-link min-h-[3.75rem] flex-1 gap-0 rounded-xl px-0.5 py-1 text-[10px]',
            (open || anyDrawerActive) && 'student-nav-link-active',
          )}
        >
          <span className="student-nav-icon !h-8 !w-9 !rounded-xl" aria-hidden="true">
            {open ? (
              // X icon when open
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <line x1="6" y1="6" x2="16" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="16" y1="6" x2="6" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            ) : (
              // Bag / collection icon when closed
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="8" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.9" />
                <path d="M7.5 8V6.5a3.5 3.5 0 0 1 7 0V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                <circle cx="11" cy="13.5" r="1.5" fill="currentColor" />
              </svg>
            )}
          </span>
          {open ? 'Đóng' : 'Khác'}
        </button>
      </nav>
    </>
  )
}

// ── Admin drawer (⊕ button opens full menu overlay) ──────────
function AdminDrawer({
  nav,
  pinnedNav,
  tone,
}: {
  nav: RoleNavItem[]
  pinnedNav: RoleNavItem[]
  tone: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer sheet slides up from bottom */}
      <div
        className={cn(
          'admin-drawer-sheet',
          open ? 'admin-drawer-sheet-open' : 'admin-drawer-sheet-closed',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Tất cả tiện ích quản trị"
      >
        {/* Handle bar */}
        <div className="admin-drawer-handle" aria-hidden="true" />

        <p className="admin-drawer-title">Tiện ích quản trị</p>

        <nav className="admin-drawer-grid" aria-label="Điều hướng quản trị">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn('admin-drawer-item', isActive && 'admin-drawer-item-active')
              }
            >
              <span className="admin-drawer-icon" aria-hidden="true">
                <Icon size={24} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom bar: pinned items + ⊕ toggle */}
      <nav
        className={cn('adult-bottom-nav', `adult-bottom-nav-${tone}`)}
        aria-label="Điều hướng chính"
      >
        {pinnedNav.map((item) => (
          <AdultBottomLink key={item.to} {...item} tone={tone} />
        ))}

        {/* ⊕ More button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Đóng menu' : 'Mở tất cả tiện ích'}
          className={cn('adult-bottom-more', open && 'adult-bottom-more-open')}
        >
          <span className="adult-bottom-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.8" />
              <line
                x1="11" y1="6.5" x2="11" y2="15.5"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{ transformOrigin: '11px 11px', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}
              />
              <line
                x1="6.5" y1="11" x2="15.5" y2="11"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{ transformOrigin: '11px 11px', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}
              />
            </svg>
          </span>
          <span>{open ? 'Đóng' : 'Thêm'}</span>
        </button>
      </nav>
    </>
  )
}

// ── Simple adult bottom nav (parent / teacher) ────────────────
function AdultBottomNav({
  nav,
  tone,
}: {
  nav: RoleNavItem[]
  tone: string
}) {
  return (
    <nav
      className={cn('adult-bottom-nav', `adult-bottom-nav-${tone}`)}
      aria-label="Điều hướng chính"
    >
      {nav.map((item) => (
        <AdultBottomLink key={item.to} {...item} tone={tone} />
      ))}
    </nav>
  )
}

// ── CmsShell: Teacher / Admin ─────────────────────────────────
function CmsShell({
  nav,
  pinnedNav,
  brandTo,
  roleLabel,
  tone,
}: {
  nav: RoleNavItem[]
  pinnedNav?: RoleNavItem[]
  brandTo: string
  roleLabel: string
  tone: 'teacher' | 'admin'
}) {
  const isAdmin = tone === 'admin'

  return (
    <div className={`role-shell role-tone-${tone} min-h-dvh md:pl-60`}>
      {/* Desktop sidebar */}
      <aside className="role-rail fixed inset-y-0 left-0 z-30 hidden w-60 flex-col md:flex">
        <div className="role-brand">
          <NavLink to={brandTo} aria-label={`Trang chính ${roleLabel}`}>
            <BrandLogo size="md" />
          </NavLink>
          <p>{roleLabel}</p>
        </div>
        <DesktopSideNav nav={nav} />
        <WorkspaceSwitcher />
      </aside>

      {/* Mobile top bar (brand only, no nav) */}
      <header className="role-mobile-topbar md:hidden">
        <NavLink to={brandTo} aria-label={`Trang chính ${roleLabel}`}>
          <BrandLogo size="sm" />
        </NavLink>
        <span className="role-mobile-topbar-label">{roleLabel}</span>
      </header>

      {/* Main content — extra bottom padding so bottom nav doesn't cover content */}
      <main className="page-enter mx-auto min-w-0 max-w-[1440px] px-3 py-5 pb-[max(5.5rem,calc(5rem+env(safe-area-inset-bottom,0px)))] sm:px-5 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        {isAdmin && pinnedNav ? (
          <AdminDrawer nav={nav} pinnedNav={pinnedNav} tone={tone} />
        ) : (
          <AdultBottomNav nav={nav} tone={tone} />
        )}
      </div>
    </div>
  )
}

// ── AdultChrome: Parent ───────────────────────────────────────
function AdultChrome({
  nav,
  brandTo,
}: {
  nav: RoleNavItem[]
  brandTo: string
}) {
  return (
    <div className="role-shell role-tone-parent min-h-dvh lg:pl-60">
      {/* Desktop sidebar */}
      <aside className="role-rail fixed inset-y-0 left-0 z-30 hidden w-60 flex-col lg:flex">
        <div className="role-brand">
          <NavLink to={brandTo} aria-label="Trang chính phụ huynh">
            <BrandLogo size="md" />
          </NavLink>
          <p>Góc phụ huynh</p>
        </div>
        <DesktopSideNav nav={nav} />
        <WorkspaceSwitcher />
      </aside>

      {/* Mobile top bar */}
      <header className="role-mobile-topbar lg:hidden">
        <NavLink to={brandTo} aria-label="Trang chính phụ huynh">
          <BrandLogo size="sm" />
        </NavLink>
        <span className="role-mobile-topbar-label">Phụ huynh</span>
      </header>

      {/* Main */}
      <main className="page-enter mx-auto max-w-6xl px-3 py-5 pb-[max(5.5rem,calc(5rem+env(safe-area-inset-bottom,0px)))] sm:px-5 sm:py-6 lg:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <AdultBottomNav nav={nav} tone="parent" />
      </div>
    </div>
  )
}

// ── AppShell root ─────────────────────────────────────────────
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
    const allNav: RoleNavItem[] = [
      { to: '/admin', label: 'Tổng quan', icon: CmsOverviewIcon, end: true },
      { to: '/admin/analytics', label: 'Phân tích', icon: CmsAnalyticsIcon },
      { to: '/admin/logs', label: 'Nhật ký', icon: CmsLogsIcon },
      { to: '/admin/users', label: 'Tài khoản', icon: CmsUsersIcon },
      { to: '/admin/sessions', label: 'Phiên', icon: CmsSessionsIcon },
      { to: '/admin/courses', label: 'Khóa học', icon: CmsCoursesIcon },
      { to: '/admin/ai', label: 'AI Vidtory', icon: CmsAiIcon },
      { to: '/teacher', label: 'Giáo viên', icon: CmsClassesIcon },
    ]
    // Show only the most-used items in the pinned bar; the rest live in the drawer
    const pinnedNav: RoleNavItem[] = [
      { to: '/admin', label: 'Tổng quan', icon: CmsOverviewIcon, end: true },
      { to: '/admin/users', label: 'Tài khoản', icon: CmsUsersIcon },
      { to: '/admin/logs', label: 'Nhật ký', icon: CmsLogsIcon },
    ]
    return (
      <CmsShell
        brandTo="/admin"
        roleLabel="Quản trị"
        tone="admin"
        nav={allNav}
        pinnedNav={pinnedNav}
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

      {/* Mobile student bottom nav — StudentDrawer handles pinned bar + sheet */}
      <div className="md:hidden">
        <StudentDrawer />
      </div>


      <ParentGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </div>
  )
}
