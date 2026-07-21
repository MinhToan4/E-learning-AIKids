import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/store/auth'
import { ApiError } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'
import { STUDENT_AVATARS } from '@/shared/config/avatars'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import type { User } from '@/shared/lib/api'

export function LoginPage() {
  const [params] = useSearchParams()
  const initial =
    params.get('role') === 'parent' || params.get('role') === 'teacher'
      ? 'adult'
      : 'student'
  const [mode, setMode] = useState<'student' | 'adult'>(initial as 'student' | 'adult')
  const [nickname, setNickname] = useState('MựcCon')
  const [avatarId, setAvatarId] = useState('avatar-robot')
  const [pin, setPin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const loginStudent = useAuth((s) => s.loginStudent)
  const loginAdult = useAuth((s) => s.loginAdult)
  const setSessionUser = useAuth((s) => s.setSessionUser)
  const navigate = useNavigate()

  function goAfterAdult(user: User) {
    if (user.role === 'admin') navigate('/admin')
    else if (user.role === 'teacher') navigate('/teacher')
    else navigate('/kids')
  }

  const hint = useMemo(
    () =>
      mode === 'student'
        ? 'Con dùng biệt danh ba/mẹ đã tạo. Không cần mật khẩu của ba/mẹ.'
        : 'Ba/mẹ hoặc thầy cô đăng nhập bằng email để quản lý và cho con học.',
    [mode],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'student') {
        const user = await loginStudent(nickname.trim(), avatarId, {
          pin: pin.trim() || undefined,
        })
        navigate(user.onboarded ? '/home' : '/onboarding')
      } else {
        const user = await loginAdult(email.trim(), password)
        goAfterAdult(user)
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Không vào được. Thử lại nhé!',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 py-8"
      style={{
        backgroundImage: `url(${designerAssets.lobby.bgLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#f7f5ff]/75" />
      <div className="relative z-10 flex flex-col gap-4">
        <Link to="/" className="text-sm font-bold text-brand-500">
          ← Về trang chào
        </Link>
        <div className="ui-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <BrandLogo size="lg" className="max-w-[200px]" />
            <img
              src={designerAssets.brand.mascot}
              alt=""
              className="h-14 w-14 rounded-full object-cover"
            />
          </div>
          <h1 className="font-display text-3xl text-text">Vào cổng sáng tạo</h1>
          <p className="mt-1 text-sm text-muted">{hint}</p>

          <div className="mt-4 flex gap-2 rounded-2xl bg-brand-50 p-1">
            <button
              type="button"
              className={cn(
                'flex-1 rounded-xl py-2 text-sm font-extrabold',
                mode === 'student'
                  ? 'bg-white text-brand-600 shadow-soft'
                  : 'text-muted',
              )}
              onClick={() => setMode('student')}
            >
              Học sinh
            </button>
            <button
              type="button"
              className={cn(
                'flex-1 rounded-xl py-2 text-sm font-extrabold',
                mode === 'adult'
                  ? 'bg-white text-brand-600 shadow-soft'
                  : 'text-muted',
              )}
              onClick={() => setMode('adult')}
            >
              Ba mẹ / GV
            </button>
          </div>

          <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
            {mode === 'student' ? (
              <>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Biệt danh
                  <input
                    className="min-h-12 rounded-2xl border-2 border-border px-4 text-base font-semibold outline-none focus:border-brand-500"
                    value={nickname}
                    maxLength={16}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                  />
                </label>
                <div>
                  <p className="mb-2 text-sm font-bold">Avatar (giống lúc ba/mẹ tạo)</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {STUDENT_AVATARS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAvatarId(a.id)}
                        className={cn(
                          'flex min-h-16 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl border-2 bg-white',
                          avatarId === a.id
                            ? 'border-brand-500 bg-brand-50 shadow-soft'
                            : 'border-border',
                        )}
                        aria-label={a.label}
                      >
                        {a.image ? (
                          <img
                            src={a.image}
                            alt=""
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{a.emoji}</span>
                        )}
                        <span className="text-[10px] font-bold text-muted">
                          {a.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Mã PIN 6 số (nếu ba/mẹ đã đặt)
                  <input
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    className="min-h-12 rounded-2xl border-2 border-border px-4 font-mono text-base tracking-widest"
                    placeholder="······"
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                  />
                </label>
                <p className="text-xs text-muted">
                  Chưa có hồ sơ? Nhờ ba/mẹ đăng nhập, vào mục Con và thêm con nhé.
                </p>
              </>
            ) : (
              <>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Email
                  <input
                    type="email"
                    className="min-h-12 rounded-2xl border-2 border-border px-4 text-base font-semibold outline-none focus:border-brand-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Mật khẩu
                  <input
                    type="password"
                    className="min-h-12 rounded-2xl border-2 border-border px-4 text-base font-semibold outline-none focus:border-brand-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                <div className="flex items-center justify-between text-xs">
                  <Link to="/forgot-password" className="font-bold text-brand-500 hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
              </>
            )}

            {error && (
              <p
                className="rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy}>
              {busy ? 'Đang vào…' : mode === 'adult' ? 'Đăng nhập' : 'Vào học!'}
            </Button>

            {mode === 'adult' && (
              <div className="flex w-full flex-col gap-2 pt-1">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs font-bold text-muted">hoặc</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <GoogleSignInButton
                  role={
                    params.get('role') === 'teacher' ? 'teacher' : 'parent'
                  }
                  onSuccess={(user) => {
                    setSessionUser(user)
                    goAfterAdult(user)
                  }}
                  onError={(msg) => setError(msg)}
                />
                <p className="text-center text-xs text-muted">
                  Cùng một email Google và email đăng ký là một tài khoản duy nhất.
                </p>
              </div>
            )}

            <p className="text-center text-sm text-muted">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-bold text-brand-500 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
