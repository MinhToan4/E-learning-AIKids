import { NavLink, Outlet } from 'react-router-dom'
import { Backpack, Home, Map, UserRound } from 'lucide-react'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'

const studentNav = [
  { to: '/home', label: 'Nhà', icon: Home },
  { to: '/world', label: 'Làm tiếp', icon: Map },
  { to: '/backpack', label: 'Ba lô', icon: Backpack },
  { to: '/profile', label: 'Tôi', icon: UserRound },
]

export function AppShell() {
  const user = useAuth((s) => s.user)

  if (user?.role === 'parent') {
    return (
      <div className="min-h-dvh">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <BrandLogo size="sm" />
            <nav className="flex gap-2">
              <NavLink
                className="ui-btn ui-btn-ghost min-h-10 px-3 text-sm"
                to="/parent"
              >
                Duyệt chia sẻ
              </NavLink>
              <NavLink
                className="ui-btn ui-btn-ghost min-h-10 px-3 text-sm"
                to="/parent/kids"
              >
                Con của tôi
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="page-enter mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    )
  }

  if (user?.role === 'teacher') {
    return (
      <div className="min-h-dvh">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <BrandLogo size="sm" />
            <NavLink
              className="ui-btn ui-btn-ghost min-h-10 px-3 text-sm"
              to="/teacher"
            >
              Lớp học
            </NavLink>
          </div>
        </header>
        <main className="page-enter mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-24 md:pb-8 md:pl-[5.5rem]">
      <aside className="fixed left-0 top-0 z-30 hidden h-dvh w-[5.5rem] flex-col items-center gap-2 border-r border-border/70 bg-white/90 py-4 backdrop-blur md:flex">
        {/* Logo wordmark: no border, no rounded box — tall enough to read */}
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

      <main className="page-enter mx-auto max-w-5xl px-4 py-5">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border/80 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
        {studentNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex min-h-14 min-w-16 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold text-muted transition-colors duration-150',
                isActive && 'bg-brand-50 text-brand-600',
              )
            }
          >
            <Icon size={22} strokeWidth={2.4} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
