import { NavLink, Outlet } from 'react-router-dom'
import { Award, Backpack, Home, Map, Trophy, UserRound } from 'lucide-react'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

const studentNav = [
  { to: '/home', label: 'Nhà', icon: Home },
  { to: '/world', label: 'Học', icon: Map },
  { to: '/leaderboard', label: 'Xếp hạng', icon: Trophy },
  { to: '/achievements', label: 'Huy hiệu', icon: Award },
  { to: '/backpack', label: 'Ba lô', icon: Backpack },
  { to: '/profile', label: 'Tôi', icon: UserRound },
]

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
      <AdultChrome
        brandTo="/teacher"
        nav={[{ to: '/teacher', label: 'CMS lớp học', end: true }]}
      />
    )
  }

  if (user?.role === 'admin') {
    return (
      <AdultChrome
        brandTo="/admin"
        nav={[
          { to: '/admin', label: 'Quản trị', end: true },
          { to: '/teacher', label: 'Xem CMS GV' },
        ]}
      />
    )
  }

  // Student shell — desktop rail + mobile bottom nav
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
                'flex w-16 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold text-muted transition-colors duration-150',
                isActive && 'bg-brand-50 text-brand-600',
              )
            }
          >
            <Icon size={22} strokeWidth={2.4} />
            {label}
          </NavLink>
        ))}
      </aside>

      <div className="fixed right-3 top-3 z-40 flex items-center gap-2 sm:right-4 md:right-6">
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
                'flex min-h-14 min-w-[3.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold text-muted transition-colors duration-150 xs:text-[11px]',
                isActive && 'bg-brand-50 text-brand-600',
              )
            }
          >
            <Icon size={22} strokeWidth={2.4} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
