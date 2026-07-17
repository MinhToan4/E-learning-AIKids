import { useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Backpack,
  HelpCircle,
  Home,
  LogOut,
  PlayCircle,
  UserRound,
  Shield,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDemoStore } from '@/store/demo-store'
import { AVATARS, MASCOT_SRC, questRoute } from '@/data/mock'
import { ToastViewport } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { computeQuestStatuses } from '@/lib/quests'

/** Max 4 primary destinations — clearer for ages 8–11 (NN/g: simple nav) */
const studentNav = [
  { to: '/world', label: 'Nhà', icon: Home, match: (p: string) => p.startsWith('/world') },
  {
    to: '/quest/character',
    label: 'Làm tiếp',
    icon: PlayCircle,
    match: (p: string) => p.startsWith('/quest') || p.startsWith('/studio'),
  },
  {
    to: '/backpack',
    label: 'Ba lô',
    icon: Backpack,
    match: (p: string) => p.startsWith('/backpack') || p.startsWith('/portfolio'),
  },
  {
    to: '/profile',
    label: 'Tôi',
    icon: UserRound,
    match: (p: string) => p.startsWith('/profile'),
  },
]

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const role = useDemoStore((s) => s.currentRole)
  const isLoggedIn = useDemoStore((s) => s.isLoggedIn)
  const child = useDemoStore((s) => s.child)
  const helperOpen = useDemoStore((s) => s.helperOpen)
  const setHelperOpen = useDemoStore((s) => s.setHelperOpen)
  const setRole = useDemoStore((s) => s.setRole)
  const logout = useDemoStore((s) => s.logout)
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const addToast = useDemoStore((s) => s.addToast)
  const completed = useDemoStore((s) => s.completedQuestIds)
  const currentQuestId = useDemoStore((s) => s.currentQuestId)

  const nextQuest = useMemo(() => {
    const statuses = computeQuestStatuses(completed, currentQuestId)
    return (
      statuses.find((q) => q.status === 'in_progress' || q.status === 'available') ??
      statuses.find((q) => q.status !== 'locked')
    )
  }, [completed, currentQuestId])

  const bare =
    location.pathname === '/' ||
    location.pathname.startsWith('/welcome') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/onboarding')

  const isAdult = role === 'parent' || role === 'teacher'
  const avatar = AVATARS.find((a) => a.id === child.avatarId) ?? AVATARS[0]

  if (bare) {
    return (
      <>
        <a href="#main" className="skip-link">
          Bỏ qua đến nội dung chính
        </a>
        <Outlet />
        <ToastViewport />
      </>
    )
  }

  if (isAdult) {
    return (
      <div className="min-h-dvh bg-bg">
        <a href="#main" className="skip-link">
          Bỏ qua đến nội dung chính
        </a>
        <div className="mx-auto flex min-h-dvh max-w-[1440px]">
          <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-5 md:flex md:flex-col">
            <div className="mb-8 flex items-center gap-3">
              <img src={MASCOT_SRC} alt="" className="size-11" width={44} height={44} />
              <div>
                <p className="font-display text-lg">Creator Academy</p>
                <p className="text-sm text-muted">
                  {role === 'parent' ? 'Phụ huynh' : 'Giáo viên'}
                </p>
              </div>
            </div>
            <nav aria-label="Điều hướng người lớn" className="flex-1 space-y-1">
              {(role === 'parent'
                ? [
                    { to: '/parent/overview', label: 'Tổng quan' },
                    { to: '/parent/approvals', label: 'Duyệt chia sẻ' },
                    { to: '/parent/privacy', label: 'Quyền riêng tư' },
                  ]
                : [
                    { to: '/teacher/overview', label: 'Tổng quan lớp' },
                    { to: '/teacher/students', label: 'Học sinh' },
                    { to: '/teacher/projects', label: 'Dự án' },
                  ]
              ).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-12 items-center rounded-2xl px-3 text-sm font-extrabold transition-colors duration-150',
                      isActive
                        ? 'bg-brand-100 text-brand-600'
                        : 'text-muted hover:bg-bg hover:text-text',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  setRole('student')
                  navigate(isLoggedIn ? '/world' : '/login')
                }}
              >
                Chế độ học sinh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                <LogOut className="size-4" aria-hidden />
                Đăng xuất
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => {
                  resetDemo()
                  addToast({ type: 'info', title: 'Đã reset demo' })
                  navigate('/welcome')
                }}
              >
                Reset demo
              </Button>
            </div>
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 py-3 page-pad">
              <div className="flex items-center gap-2 text-sm font-bold text-muted">
                {role === 'parent' ? (
                  <Shield className="size-4 text-brand-500" aria-hidden />
                ) : (
                  <GraduationCap className="size-4 text-brand-500" aria-hidden />
                )}
                <span className="hidden sm:inline">Chế độ người lớn</span>
              </div>
              <div className="flex gap-2 md:hidden">
                <Button size="sm" variant="secondary" onClick={() => navigate('/login')}>
                  Đổi vai
                </Button>
              </div>
            </header>
            <main id="main" className="flex-1 p-4 page-pad md:p-8">
              <Outlet />
            </main>
          </div>
        </div>
        <ToastViewport />
      </div>
    )
  }

  const goNext = () => {
    if (!nextQuest) {
      navigate('/world')
      return
    }
    navigate(questRoute(nextQuest.id))
  }

  return (
    <div className="min-h-dvh">
      <a href="#main" className="skip-link">
        Bỏ qua đến nội dung chính
      </a>
      <div className="mx-auto flex min-h-dvh max-w-[1400px]">
        {/* Desktop rail — 4 items only */}
        <aside className="hidden w-[92px] shrink-0 flex-col items-center border-r border-border/80 bg-white/90 py-4 xl:flex">
          <img src={MASCOT_SRC} alt="" className="mb-5 size-12" width={48} height={48} />
          <nav aria-label="Điều hướng học sinh" className="flex flex-1 flex-col gap-2">
            {studentNav.map(({ to, label, icon: Icon, match }) => {
              const target = label === 'Làm tiếp' && nextQuest ? questRoute(nextQuest.id) : to
              const active = match(location.pathname)
              return (
                <NavLink
                  key={label}
                  to={target}
                  className={cn(
                    'flex w-[76px] flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-extrabold transition-colors duration-150',
                    active
                      ? 'bg-brand-100 text-brand-600'
                      : 'text-muted hover:bg-brand-50 hover:text-text',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  <span>{label}</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border/70 bg-white/90 px-3 py-2.5 backdrop-blur-sm page-pad sm:px-5 sm:py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <img src={MASCOT_SRC} alt="" className="size-9 xl:hidden" width={36} height={36} />
              <div className="min-w-0">
                <p className="truncate font-display text-base text-text sm:text-lg">
                  Xin chào, {child.nickname}!
                </p>
                <p className="truncate text-xs font-bold text-muted sm:text-sm">
                  {child.xp} XP · Hành trình Mèo Sao
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button
                variant="soft"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setHelperOpen(!helperOpen)}
                aria-expanded={helperOpen}
              >
                <HelpCircle className="size-4" aria-hidden />
                Gợi ý
              </Button>
              <Button size="sm" onClick={goNext} className="hidden md:inline-flex">
                Làm tiếp
              </Button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-border bg-white p-1 pr-2 shadow-soft sm:pr-3"
                aria-label="Mở hồ sơ"
              >
                <img src={avatar.src} alt="" className="size-9 rounded-xl" width={36} height={36} />
                <span className="hidden text-sm font-extrabold sm:inline">{child.nickname}</span>
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
            <main
              id="main"
              className="min-w-0 flex-1 px-3 py-4 pb-32 page-pad sm:px-5 sm:py-5 xl:pb-8"
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {helperOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-[#2a3352]/40"
            aria-label="Đóng gợi ý"
            onClick={() => setHelperOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[70dvh] overflow-auto rounded-t-[1.75rem] bg-white p-5 shadow-clay safe-pb sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-20 sm:max-h-[min(70dvh,28rem)] sm:w-80 sm:rounded-[1.5rem]">
            <HelperContent nextTitle={nextQuest?.title} onNext={goNext} />
            <Button className="mt-4" fullWidth variant="secondary" onClick={() => setHelperOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Menu dưới"
        className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-white/95 px-1 pt-1 backdrop-blur-sm safe-pb xl:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
          {studentNav.map(({ to, label, icon: Icon, match }) => {
            const target = label === 'Làm tiếp' && nextQuest ? questRoute(nextQuest.id) : to
            const active = match(location.pathname)
            return (
              <li key={label} className="flex-1">
                <NavLink
                  to={target}
                  className={cn(
                    'flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-extrabold sm:text-[11px]',
                    active ? 'bg-brand-100 text-brand-600' : 'text-muted',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  <span>{label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <ToastViewport />
    </div>
  )
}

function HelperContent({
  nextTitle,
  onNext,
}: {
  nextTitle?: string
  onNext: () => void
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <img src={MASCOT_SRC} alt="" className="size-14" width={56} height={56} />
        <div>
          <p className="font-display text-lg">Robot Mực Màu</p>
          <p className="text-sm text-muted">Gợi ý từng bước</p>
        </div>
      </div>
      <ul className="space-y-2.5 text-sm font-semibold text-text">
        <li className="rounded-2xl bg-brand-50 p-3">
          Nhìn nút <strong>Làm tiếp</strong> — đó là việc quan trọng nhất.
        </li>
        <li className="rounded-2xl bg-mint-100/80 p-3">
          AI có thể sai. Con được <strong>chọn lại</strong> thoải mái.
        </li>
        <li className="rounded-2xl bg-sun-100 p-3">
          Không ghi tên thật, số điện thoại hay địa chỉ.
        </li>
      </ul>
      {nextTitle ? (
        <Button className="mt-4" fullWidth onClick={onNext}>
          Làm: {nextTitle}
        </Button>
      ) : null}
    </div>
  )
}
