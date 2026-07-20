import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { avatarImage, getAvatar } from '@/shared/config/avatars'
import { designerAssets } from '@/shared/config/assets'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

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

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ children: ChildCard[] }>('/api/parent/children')
      setKids(data.children.filter((c) => c.active !== false))
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Chưa tải được danh sách. Ba/mẹ đăng nhập lại giúp nhé.',
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
    setError(null)
    try {
      const next = await enterAsChild(
        child.id,
        pinValue && pinValue.length === 6 ? pinValue : undefined,
      )
      navigate(next.onboarded ? '/home' : '/onboarding', { replace: true })
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Chưa vào được. Kiểm tra mã PIN nhé.',
      )
      setPin('')
    } finally {
      setBusy(false)
    }
  }

  function onPick(child: ChildCard) {
    setError(null)
    setPin('')
    if (child.hasPin) {
      setSelected(child)
      return
    }
    void confirmEnter(child)
  }

  function onPinDigit(d: string) {
    if (busy || pin.length >= 6) return
    const next = (pin + d).slice(0, 6)
    setPin(next)
    if (next.length === 6 && selected) {
      void confirmEnter(selected, next)
    }
  }

  function onPinBack() {
    setPin((p) => p.slice(0, -1))
  }

  if (loadingAuth || (loading && !error && kids.length === 0 && user?.role === 'parent')) {
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
            className="ui-btn ui-btn-ghost shrink-0 !min-h-11 !px-3 text-sm"
            title="Quay lại khu vực ba/mẹ"
          >
            Ba/mẹ
          </Link>
        </header>

        {error && (
          <p
            className="mb-4 rounded-2xl bg-coral-100 px-4 py-3 text-center text-sm font-bold text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

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
            className="text-sm font-bold text-muted underline-offset-2 hover:underline"
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
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-text/40 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-title"
        >
          <div className="ui-card w-full max-w-md rounded-t-3xl p-5 shadow-clay sm:rounded-3xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-brand-50 text-3xl">
                {avatarImage(selected.avatarId) ? (
                  <img
                    src={avatarImage(selected.avatarId)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getAvatar(selected.avatarId).emoji
                )}
              </span>
              <div>
                <p id="pin-title" className="font-display text-2xl">
                  Xin chào {selected.nickname}!
                </p>
                <p className="text-sm text-muted">Nhập mã PIN 6 số ba/mẹ đã đặt</p>
              </div>
            </div>

            <div
              className="mb-4 flex justify-center gap-2"
              aria-label="Mã PIN đã nhập"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'flex h-11 w-9 items-center justify-center rounded-xl border-2 text-lg font-extrabold',
                    pin.length > i
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-border bg-white text-muted',
                  )}
                >
                  {pin.length > i ? '•' : ''}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(
                (key) => {
                  if (key === 'del') {
                    return (
                      <button
                        key={key}
                        type="button"
                        className="ui-btn ui-btn-secondary !min-h-14 text-lg"
                        onClick={onPinBack}
                        disabled={busy}
                      >
                        Xóa
                      </button>
                    )
                  }
                  if (key === 'ok') {
                    return (
                      <button
                        key={key}
                        type="button"
                        className="ui-btn ui-btn-primary !min-h-14 text-lg"
                        disabled={busy || pin.length !== 6}
                        onClick={() =>
                          selected && void confirmEnter(selected, pin)
                        }
                      >
                        {busy ? '…' : 'Vào'}
                      </button>
                    )
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      className="ui-btn ui-btn-secondary !min-h-14 font-display text-2xl"
                      onClick={() => onPinDigit(key)}
                      disabled={busy}
                    >
                      {key}
                    </button>
                  )
                },
              )}
            </div>

            <button
              type="button"
              className="mt-4 w-full text-center text-sm font-bold text-muted"
              onClick={() => {
                setSelected(null)
                setPin('')
                setError(null)
              }}
              disabled={busy}
            >
              Chọn bạn khác
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
