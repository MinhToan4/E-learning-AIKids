import { useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Backpack,
  HelpCircle,
  Home,
  LogOut,
  PlayCircle,
  Star,
  UserRound,
  Shield,
  GraduationCap,
  Trophy,
  LayoutDashboard,
  Users,
  FolderOpen,
  ShieldCheck,
  Settings2,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDemoStore } from '@/store/demo-store'
import { AVATARS, MASCOT_SRC, questRoute } from '@/data/mock'
import { getCourse } from '@/data/courses'
import { ToastViewport } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { computeQuestStatuses } from '@/lib/quests'

/** Student nav — labels short, icons clear */
/**
 * Nav labels must match real destinations (no vague “Chơi”).
 * “Nhiệm vụ” = open the next/available quest or studio task.
 */
const studentNav = [
  { to: '/world', label: 'Bản đồ', icon: Home, match: (p: string) => p.startsWith('/world') },
  {
    to: '/quest/character',
    label: 'Nhiệm vụ',
    icon: PlayCircle,
    match: (p: string) =>
      p.startsWith('/quest') ||
      p.startsWith('/studio') ||
      p.startsWith('/challenge'),
  },
  {
    to: '/stars',
    label: 'Thành tích',
    icon: Trophy,
    match: (p: string) => p.startsWith('/stars'),
  },
  {
    to: '/backpack',
    label: 'Ba lô',
    icon: Backpack,
    match: (p: string) => p.startsWith('/backpack') || p.startsWith('/portfolio'),
  },
  {
    to: '/profile',
    label: 'Hồ sơ',
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
  const stars = useDemoStore((s) => s.stars)
  const helperOpen = useDemoStore((s) => s.helperOpen)
  const setHelperOpen = useDemoStore((s) => s.setHelperOpen)
  const setRole = useDemoStore((s) => s.setRole)
  const logout = useDemoStore((s) => s.logout)
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const addToast = useDemoStore((s) => s.addToast)
  const completed = useDemoStore((s) => s.completedQuestIds)
  const currentQuestId = useDemoStore((s) => s.currentQuestId)
  const selectedCourseId = useDemoStore((s) => s.selectedCourseId)

  const nextQuest = useMemo(() => {
    const course = getCourse(selectedCourseId)
    const statuses = computeQuestStatuses(
      completed,
      currentQuestId,
      course.quests,
    )
    return (
      statuses.find((q) => q.status === 'in_progress' || q.status === 'available') ??
      statuses.find((q) => q.status !== 'locked')
    )
  }, [completed, currentQuestId, selectedCourseId])

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

  /* ── Adult: professional full-bleed shell, sidebar flush left ── */
  if (isAdult) {
    const adultLinks =
      role === 'parent'
        ? [
            { to: '/parent/overview', label: 'Tổng quan', icon: LayoutDashboard },
            { to: '/parent/approvals', label: 'Duyệt chia sẻ', icon: ShieldCheck },
            { to: '/parent/privacy', label: 'Quyền riêng tư', icon: Settings2 },
          ]
        : [
            { to: '/teacher/overview', label: 'Tổng quan lớp', icon: LayoutDashboard },
            { to: '/teacher/students', label: 'Học sinh', icon: Users },
            { to: '/teacher/projects', label: 'Dự án', icon: FolderOpen },
          ]

    return (
      <div className="flex min-h-dvh w-full bg-[#F4F6FA]">
        <a href="#main" className="skip-link">
          Bỏ qua đến nội dung chính
        </a>

        {/* Flush-left professional sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-[240px] shrink-0 flex-col border-r border-slate-200 bg-[#0F172A] text-slate-100 lg:flex">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
            {role === 'parent' ? (
              <Shield className="size-8 text-sky-400" aria-hidden />
            ) : (
              <GraduationCap className="size-8 text-violet-300" aria-hidden />
            )}
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">
                Creator Academy
              </p>
              <p className="text-xs text-slate-400">
                {role === 'parent' ? 'Cổng phụ huynh' : 'Cổng giáo viên'}
              </p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Menu người lớn">
            {adultLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/12 text-white'
                      : 'text-slate-300 hover:bg-white/6 hover:text-white',
                  )
                }
              >
                <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="space-y-1 border-t border-white/10 p-3">
            <button
              type="button"
              className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm text-slate-300 hover:bg-white/6"
              onClick={() => {
                setRole('student')
                navigate(isLoggedIn ? '/world' : '/login')
              }}
            >
              Về học sinh
            </button>
            <button
              type="button"
              className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm text-slate-300 hover:bg-white/6"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              <LogOut className="size-4" aria-hidden />
              Đăng xuất
            </button>
            <button
              type="button"
              className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-xs text-slate-500 hover:bg-white/6"
              onClick={() => {
                resetDemo()
                addToast({ type: 'info', title: 'Đã reset demo' })
                navigate('/welcome')
              }}
            >
              Reset demo
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {role === 'parent' ? 'Phụ huynh' : 'Giáo viên'} · Demo
              </p>
              <p className="text-sm font-semibold text-slate-800">
                Học sinh theo dõi: {child.nickname}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Mobile adult nav */}
              <div className="flex gap-1 lg:hidden">
                {adultLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg px-2.5 py-1.5 text-xs font-semibold',
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600',
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setRole('student')
                  navigate('/world')
                }}
              >
                Chế độ học sinh
              </Button>
            </div>
          </header>
          <main id="main" className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
        <ToastViewport />
      </div>
    )
  }

  /* ── Student: sidebar flush left (lg+), bottom nav mobile, full-bleed stage ── */
  const goNext = () => {
    if (!nextQuest) {
      navigate('/world')
      return
    }
    navigate(questRoute(nextQuest.id))
  }

  return (
    <div className="flex min-h-dvh w-full">
      <a href="#main" className="skip-link">
        Bỏ qua đến nội dung chính
      </a>

      {/* Edge-docked playful sidebar */}
      <aside
        className="sticky top-0 z-40 hidden h-dvh w-[92px] shrink-0 flex-col items-center border-r border-brand-100 bg-white/95 py-4 shadow-[6px_0_28px_rgba(109,94,252,0.08)] backdrop-blur-sm xl:flex 2xl:w-[104px]"
        aria-label="Thanh bên học sinh"
      >
        <img
          src="/assets/mascot-hero.jpg"
          alt=""
          className="mb-4 size-12 rounded-2xl object-cover shadow-soft ring-2 ring-brand-100 2xl:size-14"
          width={56}
          height={56}
        />
        <nav className="flex flex-1 flex-col items-center gap-1.5" aria-label="Menu chính">
          {studentNav.map(({ to, label, icon: Icon, match }) => {
            const target =
              label === 'Nhiệm vụ' && nextQuest ? questRoute(nextQuest.id) : to
            const active = match(location.pathname)
            return (
              <NavLink
                key={label}
                to={target}
                title={
                  label === 'Nhiệm vụ'
                    ? nextQuest
                      ? `Mở nhiệm vụ: ${nextQuest.title}`
                      : 'Danh sách nhiệm vụ'
                    : label
                }
                className={cn(
                  'flex w-[76px] flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-bold transition-colors duration-150 2xl:w-[88px]',
                  active
                    ? 'bg-brand-100 text-brand-600'
                    : 'text-muted hover:bg-brand-50 hover:text-text',
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="text-center leading-tight">{label}</span>
              </NavLink>
            )
          })}
        </nav>
        <button
          type="button"
          onClick={() => setHelperOpen(true)}
          className="mt-2 flex w-[76px] cursor-pointer flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold text-muted hover:bg-sun-100 hover:text-text"
        >
          <HelpCircle className="size-5" aria-hidden />
          Trợ giúp
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white/95 px-3 py-2.5 backdrop-blur-sm sm:px-5 lg:px-6">
          <img
            src={MASCOT_SRC}
            alt=""
            className="size-9 xl:hidden"
            width={36}
            height={36}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg text-text">
              Xin chào, {child.nickname}
            </p>
            <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-muted">
              <span className="inline-flex items-center gap-0.5 text-sun-400">
                <Star className="size-3.5 fill-sun-400" aria-hidden />
                {stars} sao
              </span>
              <span>{child.xp} XP</span>
              {nextQuest ? (
                <span className="hidden truncate sm:inline">
                  · Đang mở: {nextQuest.title}
                </span>
              ) : null}
            </p>
          </div>
          <Button size="sm" className="hidden sm:inline-flex" onClick={goNext}>
            {nextQuest ? `Làm: ${nextQuest.title}` : 'Về bản đồ'}
          </Button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white p-1 pr-2.5 shadow-soft"
            aria-label="Hồ sơ"
          >
            <img src={avatar.src} alt="" className="size-9 rounded-lg" width={36} height={36} />
            <span className="hidden text-sm font-bold md:inline">{child.nickname}</span>
          </button>
        </header>

        {/* Full-width stage — use almost entire viewport next to sidebar */}
        <main
          id="main"
          className="min-h-0 flex-1 px-3 py-5 pb-28 sm:px-5 sm:py-6 lg:px-8 lg:py-7 xl:pb-8 2xl:px-10"
        >
          <Outlet />
        </main>
      </div>

      {helperOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-[#2a3352]/40"
            aria-label="Đóng gợi ý"
            onClick={() => setHelperOpen(false)}
          />
          <div className="absolute bottom-20 left-3 right-3 max-h-[65dvh] overflow-auto rounded-[1.5rem] bg-white p-5 shadow-clay safe-pb sm:left-auto sm:right-6 sm:top-20 sm:bottom-auto sm:w-80 xl:left-[100px]">
            <div className="mb-3 flex items-center gap-3">
              <img src={MASCOT_SRC} alt="" className="size-12" />
              <div>
                <p className="font-display text-lg">Robot Mực Màu</p>
                <p className="text-sm text-muted">Gợi ý nhanh</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm font-semibold text-text">
              <li className="rounded-xl bg-brand-50 p-3">
                <strong>Bản đồ</strong> = xem 8 nhiệm vụ. Nút tím = việc cần làm ngay.
              </li>
              <li className="rounded-xl bg-mint-100 p-3">
                <strong>Nhiệm vụ</strong> = mở bài đang làm (ghép thẻ, truyện, video…).
              </li>
              <li className="rounded-xl bg-sun-100 p-3">
                Kéo thẻ vào ô cùng loại, hoặc chạm <strong>Chọn</strong> rồi chạm ô trống.
              </li>
            </ul>
            <Button className="mt-3" fullWidth onClick={goNext}>
              {nextQuest ? `Làm nhiệm vụ: ${nextQuest.title}` : 'Về bản đồ'}
            </Button>
            <Button
              className="mt-2"
              fullWidth
              variant="secondary"
              onClick={() => setHelperOpen(false)}
            >
              Đóng
            </Button>
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Menu dưới"
        className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-white/95 px-1 pt-1 backdrop-blur-sm safe-pb xl:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between">
          {studentNav.map(({ to, label, icon: Icon, match }) => {
            const target =
              label === 'Nhiệm vụ' && nextQuest ? questRoute(nextQuest.id) : to
            const active = match(location.pathname)
            return (
              <li key={label} className="flex-1">
                <NavLink
                  to={target}
                  className={cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold',
                    active ? 'bg-brand-100 text-brand-600' : 'text-muted',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
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
