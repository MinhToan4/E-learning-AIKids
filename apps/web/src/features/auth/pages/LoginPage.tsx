import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/store/auth'
import { ApiError } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'

const AVATARS = [
  { id: 'avatar-robot', emoji: '🤖', label: 'Robot' },
  { id: 'avatar-cat', emoji: '🐱', label: 'Mèo' },
  { id: 'avatar-star', emoji: '⭐', label: 'Sao' },
  { id: 'avatar-dragon', emoji: '🐉', label: 'Rồng' },
  { id: 'avatar-fox', emoji: '🦊', label: 'Cáo' },
  { id: 'avatar-owl', emoji: '🦉', label: 'Cú' },
]

export function LoginPage() {
  const [params] = useSearchParams()
  const initial =
    params.get('role') === 'parent' || params.get('role') === 'teacher'
      ? 'adult'
      : 'student'
  const [mode, setMode] = useState<'student' | 'adult'>(initial as 'student' | 'adult')
  const [nickname, setNickname] = useState('MựcCon')
  const [avatarId, setAvatarId] = useState('avatar-robot')
  const [email, setEmail] = useState('parent@demo.aikids.local')
  const [password, setPassword] = useState('ParentDemo1!')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const loginStudent = useAuth((s) => s.loginStudent)
  const loginAdult = useAuth((s) => s.loginAdult)
  const navigate = useNavigate()

  const hint = useMemo(
    () =>
      mode === 'student'
        ? 'Chọn biệt danh + avatar — không cần email của con.'
        : 'Phụ huynh / giáo viên đăng nhập bằng email demo.',
    [mode],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'student') {
        const user = await loginStudent(nickname.trim(), avatarId)
        navigate(user.onboarded ? '/home' : '/onboarding')
      } else {
        const user = await loginAdult(email.trim(), password)
        if (user.role === 'admin') navigate('/admin')
        else if (user.role === 'teacher') navigate('/teacher')
        else navigate('/parent')
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
                  <p className="mb-2 text-sm font-bold">Chọn avatar</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {AVATARS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAvatarId(a.id)}
                        className={cn(
                          'flex min-h-16 flex-col items-center justify-center rounded-2xl border-2 bg-white text-2xl',
                          avatarId === a.id
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-border',
                        )}
                        aria-label={a.label}
                      >
                        {a.emoji}
                      </button>
                    ))}
                  </div>
                </div>
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
                <p className="text-xs text-muted">
                  Demo: parent@demo.aikids.local / ParentDemo1! ·
                  teacher@demo.aikids.local / TeacherDemo1! ·
                  admin@demo.aikids.local / AdminDemo1!
                </p>
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
              {busy ? 'Đang vào…' : 'Vào học!'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
