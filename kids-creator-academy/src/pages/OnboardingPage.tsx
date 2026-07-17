import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ChoiceCard } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/Progress'
import { AVATARS, NICKNAME_SUGGESTIONS } from '@/data/mock'
import { isNicknameSafe } from '@/lib/safety'
import { useDemoStore } from '@/store/demo-store'
import { SafetyNotice } from '@/components/feedback/States'

const goals = [
  { id: 'comic' as const, title: 'Truyện tranh', desc: 'Ghép khung và hội thoại' },
  { id: 'video' as const, title: 'Video kể chuyện', desc: 'Storyboard + giọng kể' },
  { id: 'character' as const, title: 'Nhân vật', desc: 'Tạo Character Card' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const completeOnboarding = useDemoStore((s) => s.completeOnboarding)
  const addToast = useDemoStore((s) => s.addToast)

  const [step, setStep] = useState(0)
  const [avatarId, setAvatarId] = useState(AVATARS[0].id)
  const [nickname, setNickname] = useState('Mây')
  const [goal, setGoal] = useState<'comic' | 'video' | 'character'>('comic')
  const [error, setError] = useState<string | null>(null)

  const progress = ((step + 1) / 3) * 100

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      addToast({ type: 'info', title: 'Trình duyệt chưa hỗ trợ đọc to' })
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'vi-VN'
    window.speechSynthesis.speak(u)
  }

  const next = () => {
    if (step === 1) {
      const check = isNicknameSafe(nickname)
      if (!check.ok) {
        setError(check.message ?? 'Biệt danh chưa hợp lệ')
        return
      }
    }
    setError(null)
    if (step < 2) setStep(step + 1)
    else {
      completeOnboarding({ nickname: nickname.trim(), avatarId, goal })
      addToast({
        type: 'success',
        title: `Chào ${nickname.trim()}!`,
        description: 'Bắt đầu hành trình Mèo Sao — nhìn nút Làm tiếp nhé.',
      })
      navigate('/world')
    }
  }

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-8">
      <ProgressBar value={progress} label={`Bước ${step + 1} / 3`} />

      <div className="mt-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text">
            {step === 0 && 'Chọn avatar của con'}
            {step === 1 && 'Chọn biệt danh'}
            {step === 2 && 'Con muốn tạo gì trước?'}
          </h1>
          <p className="mt-1 text-muted">
            Không cần họ tên thật, email hay ngày sinh.
          </p>
        </div>
        <Button
          variant="soft"
          size="sm"
          onClick={() =>
            speak(
              step === 0
                ? 'Hãy chọn một avatar dễ thương.'
                : step === 1
                  ? 'Chọn biệt danh vui, không dùng tên thật.'
                  : 'Chọn điều con muốn tạo trước.',
            )
          }
        >
          <Volume2 className="size-4" aria-hidden />
          Nghe
        </Button>
      </div>

      <SafetyNotice>
        Mọi thứ mặc định riêng tư. Con có thể đổi lựa chọn bất cứ lúc nào.
      </SafetyNotice>

      <div className="mt-6 flex-1">
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AVATARS.map((a) => (
              <ChoiceCard
                key={a.id}
                selected={avatarId === a.id}
                onClick={() => setAvatarId(a.id)}
                className="flex flex-col items-center gap-2 p-3"
              >
                <img src={a.src} alt="" className="size-16 rounded-2xl" />
                <span className="text-center text-sm font-bold">{a.label}</span>
              </ChoiceCard>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {NICKNAME_SUGGESTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setNickname(n)
                    setError(null)
                  }}
                  className={`min-h-12 cursor-pointer rounded-full px-4 text-sm font-bold transition-colors ${
                    nickname === n
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-text shadow-soft hover:bg-brand-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-text">
                Hoặc nhập biệt danh (tối đa 16 ký tự)
              </span>
              <input
                value={nickname}
                maxLength={16}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setError(null)
                }}
                className="min-h-12 w-full rounded-[var(--radius-input)] border-2 border-border bg-white px-4 text-base font-semibold outline-none focus:border-brand-500"
                aria-invalid={!!error}
                aria-describedby={error ? 'nick-error' : undefined}
              />
            </label>
            {error ? (
              <p id="nick-error" className="text-sm font-semibold text-danger" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {goals.map((g) => (
              <ChoiceCard
                key={g.id}
                selected={goal === g.id}
                onClick={() => setGoal(g.id)}
              >
                <p className="font-display text-lg font-semibold">{g.title}</p>
                <p className="mt-1 text-sm text-muted">{g.desc}</p>
              </ChoiceCard>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            Quay lại
          </Button>
        ) : null}
        <Button className="flex-1" size="lg" onClick={next}>
          {step === 2 ? 'Vào Thế giới Sáng tạo' : 'Tiếp tục'}
        </Button>
      </div>
    </main>
  )
}
