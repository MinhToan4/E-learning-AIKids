import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import { designerAssets } from '@/shared/config/assets'
import { ApiError } from '@/shared/lib/api'

/**
 * Goals map to curriculum K1–K6 (courses/ L1 & L2).
 * Child picks a first path; Home can highlight the matching courseKey.
 */
const GOALS = [
  {
    id: 'world' as const,
    courseKey: 'K1',
    title: 'Vẽ thế giới tưởng tượng',
    emoji: '🌍',
    desc: 'Khóa K1 · Tưởng tượng nơi chốn của riêng con',
  },
  {
    id: 'character' as const,
    courseKey: 'K2',
    title: 'Thiết kế nhân vật',
    emoji: '🐱',
    desc: 'Khóa K2 · Tạo bạn đồng hành dễ thương',
  },
  {
    id: 'story' as const,
    courseKey: 'K3',
    title: 'Kể chuyện',
    emoji: '📖',
    desc: 'Khóa K3 · Cốt truyện mở đầu – sự cố – kết',
  },
  {
    id: 'comic' as const,
    courseKey: 'K4',
    title: 'Làm truyện tranh',
    emoji: '📚',
    desc: 'Khóa K4 · 4 khung kể chuyện cùng AI',
  },
  {
    id: 'motion' as const,
    courseKey: 'K5',
    title: 'Đạo diễn chuyển động',
    emoji: '🎬',
    desc: 'Khóa K5 · Biến tranh thành chuyển động',
  },
  {
    id: 'film' as const,
    courseKey: 'K6',
    title: 'Phim ngắn đầu tay',
    emoji: '🎥',
    desc: 'Khóa K6 · Clip ngắn hoàn chỉnh',
  },
] as const

type GoalId = (typeof GOALS)[number]['id']

export function OnboardingPage() {
  const [goal, setGoal] = useState<GoalId>('world')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const patchMe = useAuth((s) => s.patchMe)
  const navigate = useNavigate()

  async function finish() {
    setBusy(true)
    setError(null)
    try {
      await patchMe({ onboarded: true, goal })
      navigate('/home', { replace: true })
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Chưa lưu được. Thử lại nhé!'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="relative mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-4 py-8"
      style={{
        backgroundImage: `url(${designerAssets.lobby.bgHome})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#f7f5ff]/88" />
      <div className="ui-card relative z-10 p-6">
        <p className="text-sm font-bold text-brand-500">Chào mừng · Bước 1/1</p>
        <h1 className="font-display mt-1 text-3xl">Con muốn làm gì trước?</h1>
        <p className="mt-1 text-muted">
          Chọn một hướng theo lộ trình 6 khóa (K1→K6). Con đổi được sau khi vào sảnh.
        </p>
        <div className="mt-5 grid gap-3">
          {GOALS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGoal(g.id)}
              className={cn(
                'flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition',
                goal === g.id
                  ? 'border-brand-500 bg-brand-50 shadow-soft'
                  : 'border-border bg-white hover:border-brand-200',
              )}
            >
              <span className="text-3xl" aria-hidden>
                {g.emoji}
              </span>
              <span className="min-w-0">
                <span className="block font-extrabold">{g.title}</span>
                <span className="text-sm text-muted">{g.desc}</span>
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p
            className="mt-4 rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button
          className="mt-6 w-full"
          disabled={busy}
          onClick={() => void finish()}
        >
          {busy ? 'Đang lưu…' : 'Bắt đầu phiêu lưu!'}
        </Button>
      </div>
    </div>
  )
}
