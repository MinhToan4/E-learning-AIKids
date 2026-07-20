import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/store/auth'
import { ApiError } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'

export function RegisterPage() {
  const [role, setRole] = useState<'parent' | 'teacher'>('parent')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const registerAdult = useAuth((s) => s.registerAdult)
  const navigate = useNavigate()

  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = confirmPassword === '' || password === confirmPassword

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const user = await registerAdult(email.trim(), password, role, nickname.trim() || undefined)
      if (user.role === 'parent') navigate('/kids')
      else navigate('/teacher')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.',
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
        <Link to="/login" className="text-sm font-bold text-brand-500">
          ← Đã có tài khoản? Đăng nhập
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
          <h1 className="font-display text-3xl text-text">Tạo tài khoản</h1>
          <p className="mt-1 text-sm text-muted">
            Phụ huynh hoặc giáo viên đăng ký để quản lý hành trình sáng tạo AI.
          </p>

          {/* Role toggle */}
          <div className="mt-4 flex gap-2 rounded-2xl bg-brand-50 p-1">
            <button
              type="button"
              className={cn(
                'flex-1 rounded-xl py-2 text-sm font-extrabold transition-all',
                role === 'parent'
                  ? 'bg-white text-brand-600 shadow-soft'
                  : 'text-muted hover:text-brand-400',
              )}
              onClick={() => setRole('parent')}
            >
              👨‍👩‍👧 Phụ huynh
            </button>
            <button
              type="button"
              className={cn(
                'flex-1 rounded-xl py-2 text-sm font-extrabold transition-all',
                role === 'teacher'
                  ? 'bg-white text-brand-600 shadow-soft'
                  : 'text-muted hover:text-brand-400',
              )}
              onClick={() => setRole('teacher')}
            >
              👩‍🏫 Giáo viên
            </button>
          </div>

          <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Biệt danh (hiển thị)
              <input
                className="min-h-12 rounded-2xl border-2 border-border px-4 text-base font-semibold outline-none focus:border-brand-500 transition-colors"
                value={nickname}
                maxLength={40}
                placeholder={role === 'parent' ? 'VD: Ba/Mẹ Minh' : 'VD: Cô Thu'}
                onChange={(e) => setNickname(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-bold">
              Email *
              <input
                type="email"
                className="min-h-12 rounded-2xl border-2 border-border px-4 text-base font-semibold outline-none focus:border-brand-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-bold">
              Mật khẩu *
              <input
                type="password"
                className="min-h-12 rounded-2xl border-2 border-border px-4 text-base font-semibold outline-none focus:border-brand-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              {password && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-1.5 flex-1 rounded-full transition-colors',
                          passwordStrength >= level
                            ? level <= 1
                              ? 'bg-red-400'
                              : level <= 2
                                ? 'bg-orange-400'
                                : level <= 3
                                  ? 'bg-yellow-400'
                                  : 'bg-green-500'
                            : 'bg-gray-200',
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted">
                    {passwordStrength <= 1 ? 'Yếu' : passwordStrength <= 2 ? 'Trung bình' : passwordStrength <= 3 ? 'Mạnh' : 'Rất mạnh'}
                  </span>
                </div>
              )}
            </label>

            <label className="flex flex-col gap-1 text-sm font-bold">
              Xác nhận mật khẩu *
              <input
                type="password"
                className={cn(
                  'min-h-12 rounded-2xl border-2 px-4 text-base font-semibold outline-none transition-colors',
                  !passwordsMatch ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-brand-500',
                )}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {!passwordsMatch && (
                <span className="text-xs text-danger">Mật khẩu không khớp</span>
              )}
            </label>

            {error && (
              <p
                className="rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy || !passwordsMatch}>
              {busy ? 'Đang tạo…' : 'Đăng ký'}
            </Button>

            <p className="text-center text-sm text-muted">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-brand-500 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++
  return score
}
