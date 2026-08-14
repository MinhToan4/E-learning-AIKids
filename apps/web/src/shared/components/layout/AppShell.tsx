import { Suspense, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { prefetchRoute } from '@/app/route-prefetch'

import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { api } from '@/shared/lib/api'
import { ParentGateModal } from '@/features/parent/components/ParentGateModal'
import {
  CmsAiIcon,
  CmsAnalyticsIcon,
  CmsBillingIcon,
  CmsClassesIcon,
  CmsCoursesIcon,
  CmsLecturesIcon,
  CmsLogsIcon,
  CmsLogoutIcon,
  CmsOverviewIcon,
  CmsUsersIcon,
} from '@/shared/components/icons/CmsIcons'
import { NavHomeIcon, NavProfileIcon, NavWorldIcon } from '@/shared/components/icons/KidNavIcons'
import {
  KidBackpackImageIcon,
  KidBadgeImageIcon,
  KidEventImageIcon,
  KidHomeImageIcon,
  KidProfileImageIcon,
  KidProgressImageIcon,
  KidStorybookImageIcon,
  KidWorldImageIcon,
} from '@/shared/components/icons/KidImageIcons'
import {
  ParentApprovalIcon,
  ParentDashboardIcon,
  ParentKidsIcon,
  ParentLearningIcon,
  ParentPlanIcon,
  ParentProfileIcon,
} from '@/shared/components/icons/ParentIcons'
import { ParentHomeIcon } from '@/shared/components/icons/ParentHomeIcon'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { cn } from '@/shared/lib/cn'
import { designerAssets } from '@/shared/config/assets'
import { useAuth } from '@/shared/store/auth'
import { readRewardEquipment } from '@/features/rewards/reward-equipment'
import { profilePageThemeStyle } from '@/features/rewards/student-theme'

type NavIcon = React.ComponentType<{ size?: number; className?: string }>

type RoleNavItem = {
  to: string
  label: string
  icon: NavIcon
  end?: boolean
}

type StudentFeatureTone = 'brand' | 'sky' | 'mint' | 'sun' | 'coral'

type StudentNavItem = RoleNavItem & {
  tone: StudentFeatureTone
}

function RouteContentFallback() {
  return <div className="mx-auto w-full max-w-7xl p-4" role="status" aria-live="polite"><div className="ui-skeleton h-8 w-56 rounded-xl" /><div className="ui-skeleton mt-5 h-48 rounded-3xl" /><span className="sr-only">Đang tải nội dung trang</span></div>
}

function RouteOutlet() {
  return <Suspense fallback={<RouteContentFallback />}><Outlet /></Suspense>
}

function studentFeatureTone(pathname: string): StudentFeatureTone {
  if (pathname.startsWith('/world') || pathname.startsWith('/course') || pathname.startsWith('/lesson')) return 'sky'
  if (pathname.startsWith('/progress') || pathname.startsWith('/leaderboard')) return 'mint'
  if (pathname.startsWith('/achievements') || pathname.startsWith('/backpack')) return 'sun'
  if (pathname.startsWith('/events') || pathname.startsWith('/storybook')) return 'coral'
  return 'brand'
}

function aikidStudentBackground(pathname: string): CSSProperties {
  const image = pathname.startsWith('/creative')
    ? designerAssets.lobby.bgArt
    : pathname.startsWith('/profile') || pathname.startsWith('/backpack')
      ? designerAssets.lobby.bgCharacter
      : designerAssets.lobby.bgHome

  return {
    backgroundColor: 'var(--student-page-bg)',
    backgroundImage: `linear-gradient(180deg, rgb(255 255 255 / 10%), var(--student-page-wash) 72%), url("${image}")`,
    backgroundPosition: 'top center, top center',
    backgroundRepeat: 'no-repeat, no-repeat',
    backgroundSize: 'cover, max(100%, 76rem) auto',
  }
}

function useLogoutAction() {
  const logout = useAuth((state) => state.logout)
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
      navigate('/', { replace: true })
    }
  }

  return { handleLogout, loggingOut }
}

function SidebarLogoutButton() {
  const { handleLogout, loggingOut } = useLogoutAction()

  return (
    <div className="role-sidebar-footer">
      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={loggingOut}
        className="role-nav-link role-sidebar-logout"
      >
        <span className="role-nav-icon" aria-hidden="true">
          <CmsLogoutIcon size={20} />
        </span>
        <span>{loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}</span>
      </button>
    </div>
  )
}

function MobileLogoutButton() {
  const { handleLogout, loggingOut } = useLogoutAction()

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={loggingOut}
      className="adult-bottom-link"
      aria-label={loggingOut ? 'Đang đăng xuất' : 'Đăng xuất'}
    >
      <span className="adult-bottom-icon" aria-hidden="true">
        <CmsLogoutIcon size={21} />
      </span>
      <span>{loggingOut ? 'Đang thoát…' : 'Đăng xuất'}</span>
    </button>
  )
}



// ── Student nav split: pinned bar + drawer ───────────────────
const studentPinnedNav: StudentNavItem[] = [
  { to: '/home',        label: 'Nhà',     icon: KidHomeImageIcon, tone: 'brand' },
  { to: '/world',       label: 'Học',     icon: KidWorldImageIcon, tone: 'sky' },
  { to: '/progress', label: 'Tiến bộ', icon: KidProgressImageIcon, tone: 'mint' },
]
const studentDrawerNav: StudentNavItem[] = [
  { to: '/events',       label: 'Sự kiện', icon: KidEventImageIcon, tone: 'coral' },
  { to: '/storybook',    label: 'Huyền thoại', icon: KidStorybookImageIcon, tone: 'coral' },
  { to: '/achievements', label: 'Huy hiệu', icon: KidBadgeImageIcon, tone: 'sun' },
  { to: '/backpack',     label: 'Ba lô',    icon: KidBackpackImageIcon, tone: 'sun' },
  { to: '/profile',      label: 'Hồ sơ',    icon: KidProfileImageIcon, tone: 'brand' },
]
// Cấp độ là trang chi tiết mở theo ngữ cảnh từ Hồ sơ, không phải đích điều hướng chính.
const studentNav: StudentNavItem[] = [
  ...studentPinnedNav,
  ...studentDrawerNav.slice(0, 1),
  ...studentDrawerNav.slice(2, 3),
  ...studentDrawerNav.slice(1, 2),
  ...studentDrawerNav.slice(3),
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
          onPointerEnter={() => prefetchRoute(to)}
          onFocus={() => prefetchRoute(to)}
          className={({ isActive }) =>
            cn('role-nav-link', isActive && 'role-nav-link-active')
          }
        >
          <span className="role-nav-icon" aria-hidden="true">
            <Icon size={23} />
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
      onPointerEnter={() => prefetchRoute(to)}
      onFocus={() => prefetchRoute(to)}
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
  const { handleLogout, loggingOut } = useLogoutAction()

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
        <p className="student-drawer-title">Bộ sưu tập của con</p>
        <nav className="student-drawer-grid" aria-label="Bộ sưu tập">
          {studentDrawerNav.map(({ to, label, icon: Icon, tone }) => (
            <NavLink
              key={to}
              to={to}
              data-feature-tone={tone}
              onPointerEnter={() => prefetchRoute(to)}
              onFocus={() => prefetchRoute(to)}
              onClick={handleNav}
              className={({ isActive }) =>
                cn('student-drawer-item', isActive && 'student-drawer-item-active')
              }
            >
              <span className="student-drawer-icon" aria-hidden="true">
                <Icon size={38} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="student-drawer-item student-drawer-logout"
          >
            <span className="student-drawer-icon" aria-hidden="true">
              <CmsLogoutIcon size={23} />
            </span>
            <span>{loggingOut ? 'Đang thoát…' : 'Đăng xuất'}</span>
          </button>
        </nav>
      </div>

      {/* Pinned bottom bar */}
      <nav
        className="student-bottom-nav"
        aria-label="Điều hướng chính"
      >
        {studentPinnedNav.map(({ to, label, icon: Icon, tone }) => (
          <NavLink
            key={to}
            to={to}
            data-feature-tone={tone}
            onPointerEnter={() => prefetchRoute(to)}
            onFocus={() => prefetchRoute(to)}
            className={({ isActive }) =>
              cn(
                'student-nav-link min-h-[3.75rem] flex-1 gap-0 rounded-xl px-0.5 py-1 text-[10px]',
                isActive && 'student-nav-link-active',
              )
            }
          >
            <span className="student-nav-icon !h-8 !w-9 !rounded-xl" aria-hidden="true">
              <Icon size={30} />
            </span>
            <span className="student-nav-label">{label}</span>
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
              // × when open
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <line x1="6" y1="6" x2="16" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="16" y1="6" x2="6" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            ) : (
              // + icon when closed
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9.5" stroke="currentColor" strokeWidth="1.8" />
                <line x1="11" y1="6.5" x2="11" y2="15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="6.5" y1="11" x2="15.5" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
  menuTitle = 'Tiện ích quản trị',
  menuAriaLabel = 'Tất cả tiện ích quản trị',
}: {
  nav: RoleNavItem[]
  pinnedNav: RoleNavItem[]
  tone: string
  menuTitle?: string
  menuAriaLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const { handleLogout, loggingOut } = useLogoutAction()

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
        aria-label={menuAriaLabel}
      >
        {/* Handle bar */}
        <div className="admin-drawer-handle" aria-hidden="true" />

        <p className="admin-drawer-title">{menuTitle}</p>

        <nav className="admin-drawer-grid" aria-label={menuAriaLabel}>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onPointerEnter={() => prefetchRoute(to)}
              onFocus={() => prefetchRoute(to)}
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
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="admin-drawer-item"
          >
            <span className="admin-drawer-icon" aria-hidden="true">
              <CmsLogoutIcon size={22} />
            </span>
            <span>{loggingOut ? 'Đang thoát…' : 'Đăng xuất'}</span>
          </button>
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
      <MobileLogoutButton />
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
        <SidebarLogoutButton />
      </aside>

      {/* Mobile top bar (brand only, no nav) */}
      <header className="role-mobile-topbar md:hidden">
        <NavLink to={brandTo} aria-label={`Trang chính ${roleLabel}`}>
          <BrandLogo size="sm" />
        </NavLink>
        <span className="role-mobile-topbar-label flex-1">{roleLabel}</span>
      </header>

      {/* Main content — extra bottom padding so bottom nav doesn't cover content */}
      <main className="page-enter mx-auto min-w-0 max-w-[1440px] px-3 py-5 pb-[max(5.5rem,calc(5rem+env(safe-area-inset-bottom,0px)))] sm:px-5 md:pb-6">
        <RouteOutlet />
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
        <SidebarLogoutButton />
      </aside>

      {/* Mobile top bar */}
      <header className="role-mobile-topbar lg:hidden">
        <NavLink to={brandTo} aria-label="Trang chính phụ huynh">
          <BrandLogo size="sm" />
        </NavLink>
        <span className="role-mobile-topbar-label flex-1">Phụ huynh</span>
      </header>

      {/* Main */}
      <main className="page-enter mx-auto max-w-6xl px-3 py-5 pb-[max(5.5rem,calc(5rem+env(safe-area-inset-bottom,0px)))] sm:px-5 sm:py-6 lg:pb-6">
        <RouteOutlet />
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <AdminDrawer
          nav={nav}
          pinnedNav={nav.filter((item) => ['/kids', '/parent', '/parent/kids'].includes(item.to))}
          tone="parent"
          menuTitle="Tiện ích phụ huynh"
          menuAriaLabel="Tất cả tiện ích phụ huynh"
        />
      </div>
    </div>
  )
}

// ── AppShell root ─────────────────────────────────────────────
export function AppShell() {
  const user = useAuth((s) => s.user)
  const activeContext = useAuth((s) => s.activeContext)
  const enteredFromParent = useAuth((s) => s.enteredFromParent)
  const location = useLocation()
  const { handleLogout, loggingOut } = useLogoutAction()

  const [gateOpen, setGateOpen] = useState(false)
  const [profileTheme, setProfileTheme] = useState(() =>
    user ? readRewardEquipment(user.id).theme : undefined,
  )

  useEffect(() => {
    const syncTheme = () => {
      setProfileTheme(user ? readRewardEquipment(user.id).theme : undefined)
    }
    syncTheme()
    window.addEventListener('aikids:reward-equipped', syncTheme)
    return () => window.removeEventListener('aikids:reward-equipped', syncTheme)
  }, [user?.id])

  if (user?.role === 'parent') {
    return (
      <AdultChrome
        brandTo="/parent"
        nav={[
          { to: '/kids', label: 'Cho con học', icon: NavWorldIcon },
          { to: '/parent', label: 'Tổng quan', icon: ParentDashboardIcon, end: true },
          { to: '/parent/kids', label: 'Con của tôi', icon: ParentKidsIcon },
          { to: '/parent/learning', label: 'Học tập', icon: ParentLearningIcon },
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
          { to: '/teacher/lectures', label: 'Trạm học', icon: CmsLecturesIcon },
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
          { to: '/teacher/lectures', label: 'Trạm học', icon: CmsLecturesIcon },
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
      { to: '/admin/courses', label: 'Khóa học', icon: CmsCoursesIcon },
      { to: '/admin/legends', label: 'Huyền thoại & Reward', icon: CmsAiIcon },
      { to: '/admin/billing', label: 'Gói & Thanh toán', icon: CmsBillingIcon },
      { to: '/admin/ai', label: 'AI Vidtory', icon: CmsAiIcon },
      { to: '/teacher/courses', label: 'Biên soạn', icon: CmsCoursesIcon },
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

  // WHY: Dùng enteredFromParent thay vì user?.parentId vì học sinh tự login cũng có parentId.
  // Icon Ba / Mẹ chỉ xuất hiện khi phụ huynh chủ động dùng luồng "Chuyển sang con".
  const showParentButton = enteredFromParent
  const isCreative = location.pathname.startsWith('/creative')
  const featureTone = studentFeatureTone(location.pathname)

  return (
    <div
      className="aikid-student-shell min-h-dvh bg-fixed pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:pb-8 md:pl-[6rem]"
      data-feature-tone={featureTone}
      style={location.pathname.startsWith('/profile') && profileTheme
        ? profilePageThemeStyle(profileTheme)
        : aikidStudentBackground(location.pathname)}
    >
      <aside className="student-rail fixed left-0 top-0 z-30 hidden h-dvh w-24 flex-col items-center gap-1.5 border-r border-border/70 py-4 md:flex">
        <NavLink
          to="/home"
          className="mb-3 flex w-full items-center justify-center px-2"
          aria-label="Về trang nhà"
        >
          <BrandLogo size="md" className="max-w-[4.75rem]" />
        </NavLink>
        <nav className="student-rail-nav" aria-label="Điều hướng học sinh">
          {studentNav.map(({ to, label, icon: Icon, tone }) => (
            <NavLink
              key={to}
              to={to}
              data-feature-tone={tone}
              onPointerEnter={() => prefetchRoute(to)}
              onFocus={() => prefetchRoute(to)}
              className={({ isActive }) =>
                cn(
                  'student-nav-link w-[4.5rem]',
                  isActive && 'student-nav-link-active',
                )
              }
            >
              <span className="student-nav-icon" aria-hidden="true">
                <Icon size={28} />
              </span>
              <span className="student-nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="student-rail-footer">
          {showParentButton && (
            <button
              type="button"
              onClick={() => setGateOpen(true)}
              aria-label="Gọi ba mẹ"
              title="Ba / Mẹ ơi!"
              className="flex w-16 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-extrabold text-amber-500 transition-all hover:scale-105 hover:bg-amber-50"
            >
              <ParentHomeIcon size={28} />
              <span>Ba / Mẹ</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="student-nav-link student-rail-logout w-[4.5rem]"
          >
            <span className="student-nav-icon" aria-hidden="true">
              <CmsLogoutIcon size={22} />
            </span>
            <span>{loggingOut ? 'Đang thoát…' : 'Đăng xuất'}</span>
          </button>
        </div>
        
      </aside>

      <div className="fixed right-3 top-3 z-40 flex items-center gap-2 sm:right-4 md:right-6">
        {showParentButton && (
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            aria-label="Gọi ba mẹ"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-xl shadow-sm transition hover:bg-amber-100 md:hidden"
          >
            <ParentHomeIcon size={24} />
          </button>
        )}
        <NotificationBell />
      </div>

      {isCreative ? (
        <main className="mx-auto max-w-[1440px] px-2 py-2 sm:px-4">
          <RouteOutlet />
        </main>
      ) : (
        <main className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
          <RouteOutlet />
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
