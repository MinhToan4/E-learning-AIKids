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

function WorkspaceSwitcher({ compact = false }: { compact?: boolean }) {
  const access = useAuth((state) => state.access)
  const active = useAuth((state) => state.activeContext)
  const selectContext = useAuth((state) => state.selectContext)
  const user = useAuth((state) => state.user)

  const handleSelect = async (val: string) => {
    if (val === 'current') return

    const context = await selectContext(val)
    const isAikidHost =
      window.location.hostname === 'app.aikid.vn' ||
      window.location.hostname.endsWith('.aikid.vn')
    if (isAikidHost) {
      const host =
        context.type === 'organization' && context.organizationSlug
          ? `${context.organizationSlug}.aikid.vn`
          : 'app.aikid.vn'
      window.location.assign(`https://${host}${context.defaultRoute}`)
      return
    }
    window.location.assign(context.defaultRoute)
  }

  if (compact) {
    return (
      <div className="flex w-full flex-col items-center gap-1 py-1">
        <label className="text-[10px] font-extrabold uppercase text-muted tracking-tight text-center">
          ─Éß╗òi TK
        </label>
        <select
          className="w-[4.5rem] rounded-xl border border-border/80 bg-white px-1 py-1 text-center font-bold text-[11px] text-text shadow-sm transition hover:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-400"
          value={active?.id || 'current'}
          onChange={(e) => {
            const val = e.target.value
            void handleSelect(val)
            e.target.value = active?.id || 'current'
          }}
          title="Chuyß╗ân ─æß╗òi t├ái khoß║ún"
        >
          {active && <option value={active.id}>{active.label}</option>}
          <option value="current">{user?.role === "parent" ? (active ? "≡ƒÅí Vß╗ü Ba/Mß║╣" : "TK Ba/Mß║╣") : "C├í nh├ón"}</option>
          {access?.contexts
            .filter((c) => c.id !== active?.id)
            .map((context) => (
              <option key={context.id} value={context.id}>
                {context.label}
              </option>
            ))}
        </select>
      </div>
    )
  }

  return (
    <label className="mx-3 mt-auto mb-3 block text-xs font-bold text-muted">
      Chuyß╗ân ─æß╗òi t├ái khoß║ún
      <select
        className="mt-1 w-full rounded-xl border border-border bg-white px-2 py-2 text-sm text-text shadow-sm transition hover:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-400"
        value={active?.id || 'current'}
        onChange={(e) => {
          const val = e.target.value
          void handleSelect(val)
          e.target.value = active?.id || 'current'
        }}
      >
        {active && <option value={active.id}>{active.label}</option>}
        <option value="current">{user?.role === "parent" ? (active ? "≡ƒÅí Vß╗ü t├ái khoß║ún Ba/Mß║╣" : "T├ái khoß║ún Ba/Mß║╣") : "T├ái khoß║ún c├í nh├ón"}</option>
        {access?.contexts
          .filter((c) => c.id !== active?.id)
          .map((context) => (
            <option key={context.id} value={context.id}>
              {context.label}
            </option>
          ))}
      </select>
    </label>
  )
}

// ΓöÇΓöÇ Student nav split: pinned bar + drawer ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const studentPinnedNav = [
  { to: '/home',        label: 'Nh├á',     icon: NavHomeIcon        },
  { to: '/world',       label: 'Hß╗ìc',     icon: NavWorldIcon       },
  { to: '/creative',    label: 'X╞░ß╗ƒng',   icon: NavCreativeIcon    },
  { to: '/leaderboard', label: 'Tiß║┐n bß╗Ö', icon: NavLeaderboardIcon },
]
const studentDrawerNav = [
  { to: '/achievements', label: 'Huy hiß╗çu', icon: NavBadgeIcon   },
  { to: '/backpack',     label: 'Ba l├┤',    icon: NavBackpackIcon },
  { to: '/profile',      label: 'Hß╗ô s╞í',    icon: NavProfileIcon },
]
// Full list for desktop sidebar (all 7 unchanged)
const studentNav = [
  { to: '/home',         label: 'Nh├á',      icon: NavHomeIcon        },
  { to: '/world',        label: 'Hß╗ìc',      icon: NavWorldIcon       },
  { to: '/creative',     label: 'X╞░ß╗ƒng',    icon: NavCreativeIcon    },
  { to: '/leaderboard',  label: 'Tiß║┐n bß╗Ö',  icon: NavLeaderboardIcon },
  { to: '/achievements', label: 'Huy hiß╗çu', icon: NavBadgeIcon       },
  { to: '/backpack',     label: 'Ba l├┤',    icon: NavBackpackIcon    },
  { to: '/profile',      label: 'Hß╗ô s╞í',    icon: NavProfileIcon     },
]

// ΓöÇΓöÇ Desktop sidebar nav (vertical) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function DesktopSideNav({ nav }: { nav: RoleNavItem[] }) {
  return (
    <nav className="role-nav" aria-label="─Éiß╗üu h╞░ß╗¢ng khu vß╗▒c">
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

// ΓöÇΓöÇ Adult bottom nav item ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

// ΓöÇΓöÇ Student bottom drawer (Huy hiß╗çu / Ba l├┤ / Hß╗ô s╞í) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

      {/* Drawer sheet ΓÇö slide up */}
      <div
        className={cn(
          'student-drawer-sheet',
          open ? 'student-drawer-open' : 'student-drawer-closed',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Bß╗Ö s╞░u tß║¡p cß╗ºa con"
      >
        <div className="student-drawer-handle" aria-hidden="true" />
        <p className="student-drawer-title">Γ£¿ Bß╗Ö s╞░u tß║¡p cß╗ºa con</p>
        <nav className="student-drawer-grid" aria-label="Bß╗Ö s╞░u tß║¡p">
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
        aria-label="─Éiß╗üu h╞░ß╗¢ng ch├¡nh"
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
          aria-label={open ? '─É├│ng bß╗Ö s╞░u tß║¡p' : 'Mß╗ƒ bß╗Ö s╞░u tß║¡p'}
          className={cn(
            'student-nav-link min-h-[3.75rem] flex-1 gap-0 rounded-xl px-0.5 py-1 text-[10px]',
            (open || anyDrawerActive) && 'student-nav-link-active',
          )}
        >
          <span className="student-nav-icon !h-8 !w-9 !rounded-xl" aria-hidden="true">
            {open ? (
              // ├ù when open
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
          {open ? '─É├│ng' : 'Kh├íc'}
        </button>
      </nav>
    </>
  )
}

// ΓöÇΓöÇ Admin drawer (Γèò button opens full menu overlay) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
        aria-label="Tß║Ñt cß║ú tiß╗çn ├¡ch quß║ún trß╗ï"
      >
        {/* Handle bar */}
        <div className="admin-drawer-handle" aria-hidden="true" />

        <p className="admin-drawer-title">Tiß╗çn ├¡ch quß║ún trß╗ï</p>

        <nav className="admin-drawer-grid" aria-label="─Éiß╗üu h╞░ß╗¢ng quß║ún trß╗ï">
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

      {/* Bottom bar: pinned items + Γèò toggle */}
      <nav
        className={cn('adult-bottom-nav', `adult-bottom-nav-${tone}`)}
        aria-label="─Éiß╗üu h╞░ß╗¢ng ch├¡nh"
      >
        {pinnedNav.map((item) => (
          <AdultBottomLink key={item.to} {...item} tone={tone} />
        ))}

        {/* Γèò More button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? '─É├│ng menu' : 'Mß╗ƒ tß║Ñt cß║ú tiß╗çn ├¡ch'}
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
          <span>{open ? '─É├│ng' : 'Th├¬m'}</span>
        </button>
      </nav>
    </>
  )
}

// ΓöÇΓöÇ Simple adult bottom nav (parent / teacher) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
      aria-label="─Éiß╗üu h╞░ß╗¢ng ch├¡nh"
    >
      {nav.map((item) => (
        <AdultBottomLink key={item.to} {...item} tone={tone} />
      ))}
    </nav>
  )
}

// ΓöÇΓöÇ CmsShell: Teacher / Admin ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
          <NavLink to={brandTo} aria-label={`Trang ch├¡nh ${roleLabel}`}>
            <BrandLogo size="md" />
          </NavLink>
          <p>{roleLabel}</p>
        </div>
        <DesktopSideNav nav={nav} />
        <WorkspaceSwitcher />
      </aside>

      {/* Mobile top bar (brand only, no nav) */}
      <header className="role-mobile-topbar md:hidden">
        <NavLink to={brandTo} aria-label={`Trang ch├¡nh ${roleLabel}`}>
          <BrandLogo size="sm" />
        </NavLink>
        <span className="role-mobile-topbar-label flex-1">{roleLabel}</span>
        <div className="w-[5rem]">
          <WorkspaceSwitcher compact />
        </div>
      </header>

      {/* Main content ΓÇö extra bottom padding so bottom nav doesn't cover content */}
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

// ΓöÇΓöÇ AdultChrome: Parent ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
          <NavLink to={brandTo} aria-label="Trang ch├¡nh phß╗Ñ huynh">
            <BrandLogo size="md" />
          </NavLink>
          <p>G├│c phß╗Ñ huynh</p>
        </div>
        <DesktopSideNav nav={nav} />
        <WorkspaceSwitcher />
      </aside>

      {/* Mobile top bar */}
      <header className="role-mobile-topbar lg:hidden">
        <NavLink to={brandTo} aria-label="Trang ch├¡nh phß╗Ñ huynh">
          <BrandLogo size="sm" />
        </NavLink>
        <span className="role-mobile-topbar-label flex-1">Phß╗Ñ huynh</span>
        <div className="w-[5rem]">
          <WorkspaceSwitcher compact />
        </div>
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

// ΓöÇΓöÇ AppShell root ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export function AppShell() {
  const user = useAuth((s) => s.user)
  const activeContext = useAuth((s) => s.activeContext)
  const [gateOpen, setGateOpen] = useState(false)

  if (user?.role === 'parent') {
    return (
      <AdultChrome
        brandTo="/parent"
        nav={[
          { to: '/kids', label: 'Cho con hß╗ìc', icon: NavWorldIcon },
          { to: '/parent', label: 'Tß╗òng quan', icon: ParentDashboardIcon, end: true },
          { to: '/parent/kids', label: 'Con cß╗ºa t├┤i', icon: ParentKidsIcon },
          { to: '/parent/plan', label: 'G├│i hß╗ìc', icon: ParentPlanIcon },
          { to: '/parent/approvals', label: 'Chß╗¥ duyß╗çt', icon: ParentApprovalIcon },
          { to: '/parent/profile', label: 'Hß╗ô s╞í', icon: ParentProfileIcon },
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
          { to: '/organization', label: 'Tß╗òng quan', icon: CmsOverviewIcon, end: true },
          { to: '/teacher', label: 'Lß╗¢p hß╗ìc', icon: CmsClassesIcon },
          { to: '/teacher/courses', label: 'Kh├│a hß╗ìc', icon: CmsCoursesIcon },
          { to: '/teacher/lectures', label: 'B├ái giß║úng', icon: CmsLecturesIcon },
          { to: '/teacher/stats', label: 'Thß╗æng k├¬', icon: CmsAnalyticsIcon },
        ]}
      />
    )
  }

  if (user?.role === 'teacher') {
    return (
      <CmsShell
        brandTo="/teacher"
        roleLabel="Gi├ío vi├¬n"
        tone="teacher"
        nav={[
          { to: '/teacher', label: 'Lß╗¢p hß╗ìc', icon: CmsClassesIcon, end: true },
          { to: '/teacher/courses', label: 'Kh├│a hß╗ìc', icon: CmsCoursesIcon },
          { to: '/teacher/lectures', label: 'B├ái giß║úng', icon: CmsLecturesIcon },
          { to: '/teacher/stats', label: 'Thß╗æng k├¬', icon: CmsAnalyticsIcon },
        ]}
      />
    )
  }

  if (user?.role === 'admin') {
    const allNav: RoleNavItem[] = [
      { to: '/admin', label: 'Tß╗òng quan', icon: CmsOverviewIcon, end: true },
      { to: '/admin/analytics', label: 'Ph├ón t├¡ch', icon: CmsAnalyticsIcon },
      { to: '/admin/logs', label: 'Nhß║¡t k├╜', icon: CmsLogsIcon },
      { to: '/admin/users', label: 'T├ái khoß║ún', icon: CmsUsersIcon },
      { to: '/admin/sessions', label: 'Phi├¬n', icon: CmsSessionsIcon },
      { to: '/admin/courses', label: 'Kh├│a hß╗ìc', icon: CmsCoursesIcon },
      { to: '/admin/ai', label: 'AI Vidtory', icon: CmsAiIcon },
      { to: '/teacher', label: 'Gi├ío vi├¬n', icon: CmsClassesIcon },
    ]
    // Show only the most-used items in the pinned bar; the rest live in the drawer
    const pinnedNav: RoleNavItem[] = [
      { to: '/admin', label: 'Tß╗òng quan', icon: CmsOverviewIcon, end: true },
      { to: '/admin/users', label: 'T├ái khoß║ún', icon: CmsUsersIcon },
      { to: '/admin/logs', label: 'Nhß║¡t k├╜', icon: CmsLogsIcon },
    ]
    return (
      <CmsShell
        brandTo="/admin"
        roleLabel="Quß║ún trß╗ï"
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
          aria-label="Vß╗ü trang nh├á"
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
            aria-label="Gß╗ìi ba mß║╣"
            title="Ba/Mß║╣ ╞íi!"
            className="mt-auto flex w-16 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-extrabold text-amber-500 transition-all hover:scale-105 hover:bg-amber-50"
          >
            <span className="text-2xl leading-none" aria-hidden="true">≡ƒöÆ</span>
            <span>Ba/Mß║╣</span>
          </button>
        )}
        
      </aside>

      <div className="fixed right-3 top-3 z-40 flex items-center gap-2 sm:right-4 md:right-6">
        {hasParent && (
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            aria-label="Gß╗ìi ba mß║╣"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-xl shadow-sm transition hover:bg-amber-100 md:hidden"
          >
            <span aria-hidden="true">≡ƒöÆ</span>
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

      {/* Mobile student bottom nav ΓÇö StudentDrawer handles pinned bar + sheet */}
      <div className="md:hidden">
        <StudentDrawer />
      </div>


      <ParentGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </div>
  )
}
