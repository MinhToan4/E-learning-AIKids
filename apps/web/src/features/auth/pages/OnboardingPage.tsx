import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'

const GOALS = [
  { id: 'comic' as const, title: 'Làm truyện tranh', emoji: '📖', desc: '4 khung kể chuyện với AI' },
  { id: 'video' as const, title: 'Làm video mini', emoji: '🎬', desc: 'Biến truyện thành clip ngắn' },
  { id: 'character' as const, title: 'Tạo nhân vật', emoji: '🐱', desc: 'Thiết kế bạn đồng hành' },
]

export function OnboardingPage() {
  const [goal, setGoal] = useState<'comic' | 'video' | 'character'>('comic')
  const [busy, setBusy] = useState(false)
  const patchMe = useAuth((s) => s.patchMe)
  const navigate = useNavigate()

  async function finish() {
    setBusy(true)
    try {
      await patchMe({ onboarded: true, goal })
      navigate('/home')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-4 py-8">
      <div className="ui-card p-6">
        <p className="text-sm font-bold text-brand-500">Bước 1 / 1</p>
        <h1 className="font-display mt-1 text-3xl">Con muốn làm gì trước?</h1>
        <p className="mt-1 text-muted">Chọn một mục tiêu — con luôn đổi được sau.</p>
        <div className="mt-5 grid gap-3">
          {GOALS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGoal(g.id)}
              className={cn(
                'flex items-center gap-4 rounded-2xl border-2 p-4 text-left',
                goal === g.id ? 'border-brand-500 bg-brand-50' : 'border-border bg-white',
              )}
            >
              <span className="text-3xl">{g.emoji}</span>
              <span>
                <span className="block font-extrabold">{g.title}</span>
                <span className="text-sm text-muted">{g.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <Button className="mt-6 w-full" disabled={busy} onClick={() => void finish()}>
          {busy ? 'Lưu…' : 'Bắt đầu phiêu lưu!'}
        </Button>
      </div>
    </div>
  )
}
