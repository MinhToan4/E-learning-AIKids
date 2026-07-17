import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Shield, Sparkles, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import {
  AVATARS,
  DEMO_ADULT_PIN,
  DEMO_CHILD_PROFILES,
} from '@/data/mock'

const HERO = '/assets/mascot-hero.jpg'
import { useDemoStore } from '@/store/demo-store'
import { cn } from '@/lib/cn'

type Mode = 'pick' | 'student' | 'adult'

export function LoginPage() {
  const navigate = useNavigate()
  const loginStudent = useDemoStore((s) => s.loginStudent)
  const loginAdult = useDemoStore((s) => s.loginAdult)
  const addToast = useDemoStore((s) => s.addToast)

  const [mode, setMode] = useState<Mode>('pick')
  const [profileId, setProfileId] = useState(DEMO_CHILD_PROFILES[0].id)
  const [adultRole, setAdultRole] = useState<'parent' | 'teacher'>('parent')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)

  const selected = DEMO_CHILD_PROFILES.find((p) => p.id === profileId)!
  const avatar = AVATARS.find((a) => a.id === selected.avatarId) ?? AVATARS[0]

  const enterStudent = (skipOnboarding: boolean) => {
    loginStudent({
      id: selected.id,
      nickname: selected.nickname,
      avatarId: selected.avatarId,
      skipOnboarding,
    })
    addToast({
      type: 'success',
      title: `Xin chào ${selected.nickname}!`,
      description: 'Cùng tiếp tục hành trình Mèo Sao nhé.',
    })
    navigate(skipOnboarding ? '/world' : '/onboarding')
  }

  const enterAdult = () => {
    if (pin !== DEMO_ADULT_PIN) {
      setPinError('Mã PIN chưa đúng. Demo dùng 2468.')
      return
    }
    setPinError(null)
    loginAdult(adultRole)
    addToast({
      type: 'info',
      title: adultRole === 'parent' ? 'Chế độ phụ huynh' : 'Chế độ giáo viên',
      description: 'Giao diện người lớn — ít game hơn.',
    })
    navigate(adultRole === 'parent' ? '/parent/overview' : '/teacher/overview')
  }

  return (
    <main
      id="main"
      className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8 sm:max-w-xl md:max-w-2xl"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-16 top-8 size-48 rounded-full bg-brand-100/90" />
        <div className="absolute -right-10 bottom-24 size-56 rounded-full bg-sky-100/90" />
        <div className="absolute left-1/3 top-1/2 size-32 rounded-full bg-sun-100/80" />
      </div>

      <div className="mb-6 text-center">
        <div className="mx-auto size-28 overflow-hidden rounded-[1.5rem] border-4 border-white shadow-clay sm:size-32">
          <img
            src={HERO}
            alt="Robot Mực Màu"
            className="size-full object-cover"
            width={128}
            height={128}
          />
        </div>
        <h1 className="mt-4 font-display text-3xl text-text sm:text-4xl">Đăng nhập</h1>
        <p className="mt-1 text-muted">
          An toàn cho trẻ 8–11 · Không cần email hay mật khẩu phức tạp
        </p>
      </div>

      {mode === 'pick' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            className="min-h-[140px] bg-white"
            onClick={() => setMode('student')}
          >
            <UserRound className="mb-2 size-8 text-brand-500" aria-hidden />
            <p className="font-display text-xl">Tôi là học sinh</p>
            <p className="mt-1 text-sm text-muted">Chọn bạn demo và vào chơi</p>
          </ChoiceCard>
          <ChoiceCard
            className="min-h-[140px] bg-white"
            onClick={() => setMode('adult')}
          >
            <Shield className="mb-2 size-8 text-brand-500" aria-hidden />
            <p className="font-display text-xl">Phụ huynh / Giáo viên</p>
            <p className="mt-1 text-sm text-muted">Nhập mã PIN demo</p>
          </ChoiceCard>
        </div>
      )}

      {mode === 'student' && (
        <Card className="space-y-4 border-2 border-brand-100 bg-white/95">
          <p className="text-sm font-bold text-brand-600">
            <Sparkles className="mr-1 inline size-4" aria-hidden />
            Chọn hồ sơ demo (biệt danh — không tên thật)
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {DEMO_CHILD_PROFILES.map((p) => {
              const av = AVATARS.find((a) => a.id === p.avatarId) ?? AVATARS[0]
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProfileId(p.id)}
                  className={cn(
                    'flex min-h-20 cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-colors duration-150',
                    profileId === p.id
                      ? 'border-brand-500 bg-brand-50 shadow-clay'
                      : 'border-border bg-bg hover:border-brand-500/40',
                  )}
                >
                  <img src={av.src} alt="" className="size-14 rounded-2xl" width={56} height={56} />
                  <span className="font-extrabold">{p.nickname}</span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
            <img src={avatar.src} alt="" className="size-12 rounded-xl" />
            <div>
              <p className="font-bold">Vào với {selected.nickname}</p>
              <p className="text-sm text-muted">Mặc định riêng tư · Có thể đổi sau</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" size="lg" onClick={() => enterStudent(true)}>
              Vào Thế giới ngay
            </Button>
            <Button
              className="flex-1"
              size="lg"
              variant="secondary"
              onClick={() => enterStudent(false)}
            >
              Làm quen nhanh trước
            </Button>
          </div>
          <Button variant="ghost" fullWidth onClick={() => setMode('pick')}>
            Quay lại
          </Button>
        </Card>
      )}

      {mode === 'adult' && (
        <Card className="space-y-4 border-2 border-border bg-white/95">
          <p className="text-sm text-muted">
            Prototype: không thu thập email. Mã PIN demo cố định cho trình bày.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceCard
              selected={adultRole === 'parent'}
              onClick={() => setAdultRole('parent')}
            >
              <Shield className="mb-1 size-5 text-brand-500" aria-hidden />
              <span className="font-bold">Phụ huynh</span>
            </ChoiceCard>
            <ChoiceCard
              selected={adultRole === 'teacher'}
              onClick={() => setAdultRole('teacher')}
            >
              <GraduationCap className="mb-1 size-5 text-brand-500" aria-hidden />
              <span className="font-bold">Giáo viên</span>
            </ChoiceCard>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Mã PIN (4 số)</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                setPinError(null)
              }}
              className="min-h-14 w-full rounded-2xl border-2 border-border bg-white px-4 text-center text-2xl font-extrabold tracking-[0.4em] outline-none focus:border-brand-500"
              placeholder="••••"
              aria-invalid={!!pinError}
              aria-describedby={pinError ? 'pin-err' : 'pin-hint'}
            />
            <span id="pin-hint" className="mt-1 block text-xs text-muted">
              Demo: {DEMO_ADULT_PIN}
            </span>
            {pinError ? (
              <span id="pin-err" className="mt-1 block text-sm font-bold text-danger" role="alert">
                {pinError}
              </span>
            ) : null}
          </label>
          <Button size="lg" fullWidth onClick={enterAdult}>
            Vào khu vực người lớn
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setMode('pick')}>
            Quay lại
          </Button>
        </Card>
      )}

      <button
        type="button"
        className="mt-6 cursor-pointer text-center text-sm font-semibold text-muted underline-offset-2 hover:text-text hover:underline"
        onClick={() => navigate('/welcome')}
      >
        Về trang chào
      </button>
    </main>
  )
}
