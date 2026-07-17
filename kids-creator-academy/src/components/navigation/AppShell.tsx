import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Backpack,
  Compass,
  HelpCircle,
  Map,
  Sparkles,
  UserRound,
  Users,
  Shield,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDemoStore } from '@/store/demo-store'
import { AVATARS, MASCOT_SRC } from '@/data/mock'
import { ToastViewport } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'

const studentNav = [
  { to: '/world', label: 'Thế giới', icon: Map },
  { to: '/quest/character', label: 'Nhiệm vụ', icon: Compass },
  { to: '/studio/prompt', label: 'Xưởng', icon: Sparkles },
  { to: '/backpack', label: 'Ba lô', icon: Backpack },
  { to: '/profile', label: 'Hồ sơ', icon: UserRound },
]

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const role = useDemoStore((s) => s.currentRole)
  const child = useDemoStore((s) => s.child)
  const helperOpen = useDemoStore((s) => s.helperOpen)
  const setHelperOpen = useDemoStore((s) => s.setHelperOpen)
  const setRole = useDemoStore((s) => s.setRole)
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const addToast = useDemoStore((s) => s.addToast)

  const bare =
    location.pathname === '/' ||
    location.pathname.startsWith('/welcome') ||
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
          <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-5 md:block">
            <div className="mb-8 flex items-center gap-3">
              <img src={MASCOT_SRC} alt="" className="size-10" />
              <div>
                <p className="font-display text-lg font-semibold">Creator Academy</p>
                <p className="text-sm text-muted">
                  {role === 'parent' ? 'Khu vực phụ huynh' : 'Khu vực giáo viên'}
                </p>
              </div>
            </div>
            <nav aria-label="Điều hướng người lớn" className="space-y-1">
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
                      'flex min-h-12 items-center rounded-xl px-3 text-sm font-semibold transition-colors',
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
            <div className="mt-8 space-y-2 border-t border-border pt-4">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  setRole('student')
                  navigate('/world')
                }}
              >
                Về chế độ học sinh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => {
                  resetDemo()
                  addToast({
                    type: 'info',
                    title: 'Đã reset demo',
                    description: 'Dữ liệu mẫu đã trở lại ban đầu.',
                  })
                  navigate('/welcome')
                }}
              >
                Reset demo
              </Button>
            </div>
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:px-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                {role === 'parent' ? (
                  <Shield className="size-4 text-brand-500" aria-hidden />
                ) : (
                  <GraduationCap className="size-4 text-brand-500" aria-hidden />
                )}
                Chế độ người lớn — ít gamification, rõ ràng hơn
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setRole('student')
                    navigate('/world')
                  }}
                >
                  Học sinh
                </Button>
              </div>
            </header>
            <main id="main" className="flex-1 p-4 md:p-8">
              <Outlet />
            </main>
          </div>
        </div>
        <ToastViewport />
      </div>
    )
  }

  return (
    <div className="min-h-dvh">
      <a href="#main" className="skip-link">
        Bỏ qua đến nội dung chính
      </a>
      <div className="mx-auto flex min-h-dvh max-w-[1440px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-[88px] shrink-0 flex-col items-center border-r border-border/70 bg-surface/90 py-4 xl:flex">
          <img src={MASCOT_SRC} alt="" className="mb-6 size-12" />
          <nav aria-label="Điều hướng học sinh" className="flex flex-1 flex-col gap-2">
            {studentNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex w-[72px] flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-bold transition-colors',
                    isActive
                      ? 'bg-brand-100 text-brand-600'
                      : 'text-muted hover:bg-bg hover:text-text',
                  )
                }
              >
                <Icon className="size-5" aria-hidden />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border/70 bg-surface/85 px-4 py-3 backdrop-blur-md md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <img src={MASCOT_SRC} alt="" className="size-9 xl:hidden" />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold text-text md:text-xl">
                  AI Kids Creator Academy
                </p>
                <p className="truncate text-sm text-muted">
                  Xin chào {child.nickname} · XP {child.xp}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="soft"
                size="sm"
                onClick={() => setHelperOpen(!helperOpen)}
                aria-expanded={helperOpen}
              >
                <HelpCircle className="size-4" aria-hidden />
                <span className="hidden sm:inline">Trợ giúp</span>
              </Button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-border bg-white p-1.5 pr-3 shadow-soft"
              >
                <img src={avatar.src} alt="" className="size-9 rounded-xl" />
                <span className="hidden text-sm font-bold sm:inline">{child.nickname}</span>
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
            <main
              id="main"
              className="min-w-0 flex-1 px-4 py-5 pb-28 md:px-6 md:py-6 xl:pb-6"
            >
              <Outlet />
            </main>

            {/* Helper panel desktop */}
            <aside
              className={cn(
                'hidden w-[300px] shrink-0 border-l border-border/70 bg-surface/80 p-5 xl:block',
                !helperOpen && 'xl:hidden',
              )}
              aria-label="Bảng gợi ý"
            >
              <HelperContent />
            </aside>
          </div>
        </div>
      </div>

      {/* Helper drawer tablet */}
      {helperOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-[#24304A]/40"
            aria-label="Đóng trợ giúp"
            onClick={() => setHelperOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[70dvh] overflow-auto rounded-t-[1.5rem] bg-surface p-5 shadow-clay">
            <HelperContent />
            <Button className="mt-4" fullWidth variant="secondary" onClick={() => setHelperOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      ) : null}

      {/* Bottom nav tablet/mobile */}
      <nav
        aria-label="Điều hướng dưới"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur xl:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
          {studentNav.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold',
                    isActive ? 'bg-brand-100 text-brand-600' : 'text-muted',
                  )
                }
              >
                <Icon className="size-5" aria-hidden />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Demo adult entry - subtle */}
      <div className="pointer-events-none fixed bottom-20 right-3 z-30 hidden md:bottom-6 xl:block">
        <button
          type="button"
          onClick={() => {
            setRole('parent')
            navigate('/parent/overview')
          }}
          className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white/90 px-3 py-2 text-xs font-semibold text-muted shadow-soft hover:text-text"
        >
          <Users className="size-3.5" aria-hidden />
          Demo: Phụ huynh
        </button>
      </div>

      <ToastViewport />
    </div>
  )
}

function HelperContent() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <img src={MASCOT_SRC} alt="" className="size-14" />
        <div>
          <p className="font-display text-lg font-semibold">Robot Mực Màu</p>
          <p className="text-sm text-muted">Trợ lý sáng tạo an toàn</p>
        </div>
      </div>
      <ul className="space-y-3 text-sm text-text">
        <li className="rounded-2xl bg-brand-50 p-3">
          Mỗi màn hình chỉ có <strong>một việc chính</strong>. Nhìn nút lớn nhất trước nhé!
        </li>
        <li className="rounded-2xl bg-mint-100/70 p-3">
          AI có thể sai. Con được <strong>chọn, sửa hoặc bỏ</strong> kết quả.
        </li>
        <li className="rounded-2xl bg-sun-100/80 p-3">
          Không dùng tên thật, số điện thoại hay địa chỉ trong câu chuyện.
        </li>
      </ul>
    </div>
  )
}
