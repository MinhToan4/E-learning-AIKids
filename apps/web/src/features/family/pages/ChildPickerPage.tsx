import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, LogOut, Plus, Sparkles, Users } from 'lucide-react'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { avatarImage, getAvatar } from '@/shared/config/avatars'
import { designerAssets } from '@/shared/config/assets'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { getChildOverallLocalStats } from '@/shared/lib/learning-sync-store'
import { useToast } from '@/shared/hooks/useToast'
import { ToastContainer } from '@/shared/components/ui/Toast'

type ChildCard = {
  id: string
  nickname: string | null
  avatarId: string | null
  level: number
  xp: number
  totalStars?: number
  completedQuests?: number
  active?: boolean
  hasPin?: boolean
}

/**
 * Full-screen kid picker for shared tablets.
 * Requires parent session → picks child → switches to student session.
 * Soft-Clay Hallmark UI design with AIKI Cat Mascot and easy child selection.
 */
export function ChildPickerPage() {
  const user = useAuth((s) => s.user)
  const loadingAuth = useAuth((s) => s.loading)
  const enterAsChild = useAuth((s) => s.enterAsChild)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  const [kids, setKids] = useState<ChildCard[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<{ children: ChildCard[] }>('/api/parent/children')
      setKids(data.children.filter((c) => c.active !== false))
    } catch (e) {
      showToast(
        e instanceof Error
          ? e.message
          : 'Chưa tải được danh sách. Ba / Mẹ đăng nhập lại giúp nhé.',
        'error',
      )
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (loadingAuth) return
    if (!user) {
      navigate('/login?mode=adult&next=/kids', { replace: true })
      return
    }
    if (user.role === 'student') {
      navigate(user.onboarded ? '/home' : '/onboarding', { replace: true })
      return
    }
    if (user.role !== 'parent') {
      navigate(user.role === 'teacher' ? '/teacher' : '/admin', { replace: true })
      return
    }
    void load()
  }, [user, loadingAuth, navigate, load])

  async function confirmEnter(child: ChildCard) {
    setBusy(true)
    try {
      // The authenticated parent already owns this child profile. Child PIN is
      // reserved for a child signing in directly, not for a parent hand-off.
      const next = await enterAsChild(child.id)
      navigate(next.onboarded ? '/home' : '/onboarding', { replace: true })
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : 'Chưa vào được hồ sơ này. Ba / Mẹ thử lại nhé.',
        'error',
      )
    } finally {
      setBusy(false)
    }
  }

  if (loadingAuth || (loading && kids.length === 0 && user?.role === 'parent')) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-4">
        <div className="ui-skeleton h-16 w-16 rounded-3xl" />
        <p className="font-display text-xl text-brand-500">Đang chuẩn bị…</p>
      </div>
    )
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col safe-pt safe-pb"
      style={{
        backgroundImage: `url(${designerAssets.lobby.bgHome})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#f7f5ff]/90 backdrop-blur-2xs" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1024px] min-w-0 flex-1 flex-col px-3 sm:px-4 md:px-6 py-6 sm:py-8 overflow-x-hidden">
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <BrandLogo size="md" className="max-w-[140px]" />
            <p className="mt-3 text-xs font-extrabold uppercase tracking-widest text-brand-600">
              Chuyển chế độ thiết bị
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-1">
              Chọn hồ sơ để vào học
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted">
              Sau khi chọn, thiết bị sẽ chuyển sang không gian riêng của con. Phần quản lý của Ba / Mẹ sẽ được ẩn.
            </p>
          </div>
          <Link
            to="/parent"
            className="ui-btn ui-btn-primary shrink-0 !min-h-11 !px-5 text-sm shadow-soft self-start sm:self-auto gap-1.5 rounded-2xl whitespace-nowrap"
            title="Quay lại khu vực Ba / Mẹ"
          >
            <ArrowLeft size={16} /> Quay lại quản lý
          </Link>
        </header>

        {/* Adult Guidance Card */}
        <div className="mb-6 flex items-center gap-3.5 rounded-2xl border border-brand-200/80 bg-brand-50/70 p-4 sm:p-5 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-brand-200 shadow-soft text-brand-600">
            <Users size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
              Chọn hồ sơ con để chuyển sang không gian học tập của bé. Khu vực quản lý của Ba / Mẹ sẽ được ẩn để con tập trung học.
            </p>
          </div>
        </div>

        {/* Kids Grid or Empty State */}
        {kids.length === 0 && !loading ? (
          <div className="ui-card mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border-2 border-brand-100 bg-white/95 p-8 text-center shadow-clay">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 shadow-soft">
              <Users size={36} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Chưa có hồ sơ con</h2>
            <p className="text-sm text-muted">
              Ba / Mẹ thêm biệt danh và ảnh đại diện cho con trước nhé.
            </p>
            <Link to="/parent/kids?action=new">
              <Button className="rounded-2xl shadow-clay">Thêm hồ sơ con</Button>
            </Link>
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0"
            aria-label="Chọn hồ sơ con để chuyển sang chế độ học"
          >
            {kids.map((k) => {
              const av = getAvatar(k.avatarId)
              const img = avatarImage(k.avatarId)
              const localStats = getChildOverallLocalStats(k.id)
              const xpForCalculation = (k.xp || 0) > 0 ? (k.xp || 0) : Math.max(0, ((k.level || 1) - 1) * 100)
              const totalStars = Math.max(k.totalStars ?? 0, localStats.totalStars, Math.min(30, Math.floor(xpForCalculation / 100)))
              const completedQuests = Math.max(k.completedQuests ?? 0, localStats.completedCount, Math.min(32, Math.floor(totalStars / 3)))
              return (
                <li key={k.id} className="h-full">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void confirmEnter(k)}
                    className={cn(
                      'group relative flex w-full h-full flex-col items-center justify-between rounded-3xl border-2 border-brand-100/80 bg-white/95 p-6 text-center shadow-clay transition-all duration-300',
                      'hover:-translate-y-1 hover:border-brand-400 hover:shadow-soft-xl active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus',
                      busy && 'opacity-60 pointer-events-none',
                    )}
                  >
                    {/* Top Status Indicators */}
                    <div className="flex w-full items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-black text-brand-700">
                        <Sparkles size={11} className="text-brand-500" />
                        <span>Học sinh</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">Vào học</span>
                    </div>

                    {/* Avatar with Level Badge */}
                    <div className="relative my-3">
                      <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-tr from-brand-100 to-purple-50 text-5xl shadow-clay group-hover:scale-105 transition-transform duration-300">
                        {img ? (
                          <img
                            src={img}
                            alt={k.nickname ?? 'Avatar'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          av.emoji
                        )}
                      </div>
                      <span className="absolute -bottom-1 right-0 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 px-2.5 py-0.5 text-xs font-black text-white shadow-md border-2 border-white">
                        Lv.{k.level || 1}
                      </span>
                    </div>

                    {/* Child Name & Details */}
                    <div className="w-full">
                      <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                        {k.nickname ?? 'Bạn nhỏ'}
                      </h3>

                      {/* Achievement Mini Badges */}
                      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 border border-amber-200/60 shadow-2xs">
                          {totalStars} sao
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-black text-emerald-700 border border-emerald-200/60 shadow-2xs">
                          {completedQuests} trạm
                        </span>
                      </div>

                      <p className="mt-3 text-xs font-bold text-brand-600 group-hover:underline">
                        Chạm để vào học ngay
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}

            {/* Card "+ Thêm bé mới" */}
            <li className="h-full">
              <Link
                to="/parent/kids?action=new"
                className={cn(
                  'group flex h-full min-h-[220px] flex-col items-center justify-center rounded-3xl border-3 border-dashed border-brand-200 bg-white/70 backdrop-blur-xs p-6 text-center transition-all duration-300',
                  'hover:-translate-y-1 hover:border-brand-400 hover:bg-brand-50/70 hover:shadow-clay active:scale-95 shadow-xs',
                )}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100/80 text-brand-600 shadow-soft group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  <Plus size={32} strokeWidth={2.5} />
                </div>
                <span className="mt-3 font-display text-lg font-black text-slate-800 group-hover:text-brand-700 transition-colors">
                  + Thêm bé mới
                </span>
                <span className="mt-1 text-xs text-muted max-w-[180px]">
                  Tạo thêm hồ sơ và cá nhân hóa trải nghiệm học tập
                </span>
              </Link>
            </li>
          </ul>
        )}

        {/* Footer */}
        <footer className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-8 pb-4">
          <button
            type="button"
            className="ui-btn ui-btn-secondary !min-h-11 !px-5 text-sm shadow-soft rounded-2xl gap-2 text-slate-600 hover:text-slate-900"
            onClick={async () => {
              await logout()
              navigate('/login?mode=adult', { replace: true })
            }}
          >
            <LogOut size={16} /> Đăng xuất Ba / Mẹ
          </button>
        </footer>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
