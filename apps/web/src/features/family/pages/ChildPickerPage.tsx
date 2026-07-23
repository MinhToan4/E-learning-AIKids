import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { avatarImage, getAvatar } from '@/shared/config/avatars'
import { designerAssets } from '@/shared/config/assets'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { PinPadModal } from '@/shared/components/ui/PinPadModal'
import { useToast } from '@/shared/hooks/useToast'
import { ToastContainer } from '@/shared/components/ui/Toast'

type ChildCard = {
  id: string
  nickname: string | null
  avatarId: string | null
  level: number
  xp: number
  active?: boolean
  hasPin?: boolean
}

/**
 * Full-screen kid picker for shared tablets.
 * Requires parent session → picks child → switches to student session.
 * Friendly copy only; no technical jargon.
 */
export function ChildPickerPage() {
  const user = useAuth((s) => s.user)
  const loadingAuth = useAuth((s) => s.loading)
  const enterAsChild = useAuth((s) => s.enterAsChild)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  const [kids, setKids] = useState<ChildCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ChildCard | null>(null)
  const [pin, setPin] = useState('')
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
          : 'Chưa tải được danh sách. Ba/mẹ đăng nhập lại giúp nhé.',
        'error',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loadingAuth) return
    if (!user) {
      navigate('/login?role=parent&next=/kids', { replace: true })
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

  async function confirmEnter(child: ChildCard, pinValue?: string) {
    setBusy(true)
    try {
      const next = await enterAsChild(
        child.id,
        pinValue && pinValue.length === 6 ? pinValue : undefined,
      )
      navigate(next.onboarded ? '/home' : '/onboarding', { replace: true })
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : 'Chưa vào được. Kiểm tra mã PIN nhé.',
        'error',
      )
      setPin('')
    } finally {
      setBusy(false)
    }
  }

  function onPick(child: ChildCard) {
    setPin('')
    setSelected(child)
    if (!child.hasPin) {
      showToast(
        'Ba/mẹ cần vào Quản lý con và đặt mã PIN 6 số cho hồ sơ này.',
        'error',
      )
    }
  }

  function onPinDigit(d: string) {
    if (busy || pin.length >= 6) return
    const next = (pin + d).slice(0, 6)
    setPin(next)
    if (next.length === 6 && selected) {
      void confirmEnter(selected, next)
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
      <div className="absolute inset-0 bg-[#f7f5ff]/88" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:py-8">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <BrandLogo size="md" className="max-w-[140px]" />
            <h1 className="font-display mt-3 text-3xl leading-tight text-text sm:text-4xl">
              Con là ai hôm nay?
            </h1>
            <p className="mt-1 text-base text-muted sm:text-lg">
              Chạm vào ảnh của con để bắt đầu học
            </p>
          </div>
          <Link
            to="/parent"
            className="ui-btn ui-btn-primary shrink-0 !min-h-11 !px-5 text-sm shadow-soft"
            title="Quay lại khu vực ba/mẹ"
          >
            Khu vực Ba/mẹ
          </Link>
        </header>

        {kids.length === 0 && !loading ? (
          <div className="ui-card mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
            <img
              src={designerAssets.brand.mascot}
              alt=""
              className="h-24 w-24 rounded-2xl object-cover shadow-soft"
            />
            <h2 className="font-display text-2xl">Chưa có hồ sơ con</h2>
            <p className="text-sm text-muted">
              Ba/mẹ thêm biệt danh và ảnh đại diện cho con trước nhé.
            </p>
            <Link to="/parent/kids">
              <Button>Thêm hồ sơ con</Button>
            </Link>
          </div>
        ) : (
          <ul
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
            aria-label="Danh sách con"
          >
            {kids.map((k) => {
              const av = getAvatar(k.avatarId)
              const img = avatarImage(k.avatarId)
              return (
                <li key={k.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onPick(k)}
                    className={cn(
                      'ui-card flex w-full flex-col items-center gap-2 p-4 transition',
                      'min-h-[9.5rem] active:translate-y-0.5 sm:min-h-[11rem]',
                      'hover:-translate-y-0.5 hover:shadow-clay focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus',
                      busy && 'opacity-60',
                    )}
                  >
                    <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-brand-50 text-4xl shadow-clay sm:h-24 sm:w-24">
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        av.emoji
                      )}
                    </span>
                    <span className="font-display text-xl leading-tight text-text">
                      {k.nickname ?? 'Bạn nhỏ'}
                    </span>
                    <span className="text-xs font-bold text-muted">
                      Cấp {k.level}
                      {k.hasPin ? ' · có PIN' : ''}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-8">
          <button
            type="button"
            className="ui-btn ui-btn-secondary !min-h-11 !px-5 text-sm shadow-soft"
            onClick={async () => {
              await logout()
              navigate('/login?role=parent')
            }}
          >
            Đăng xuất ba/mẹ
          </button>
        </footer>
      </div>

      {/* PIN sheet */}
      <PinPadModal
        isOpen={!!selected}
        onClose={() => {
          setSelected(null)
          setPin('')
        }}
        onSubmit={(p) => selected && confirmEnter(selected, p)}
        title={selected ? `Xin chào ${selected.nickname}!` : ''}
        subtitle="Nhập mã PIN 6 số ba/mẹ đã đặt"
        avatarContent={
          selected ? (
            avatarImage(selected.avatarId) ? (
              <img
                src={avatarImage(selected.avatarId)!}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              getAvatar(selected.avatarId).emoji
            )
          ) : null
        }
        busy={busy}
        pin={pin}
        setPin={setPin}
        closeLabel="Chọn bạn khác"
      />
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
