import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle2, Play, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Progress'
import { MissionBanner } from '@/components/ui/MissionBanner'
import { useDemoStore } from '@/store/demo-store'
import { MASCOT_SRC, questRoute } from '@/data/mock'
import { cn } from '@/lib/cn'
import { computeQuestStatuses } from '@/lib/quests'

/** Kid-readable: what you make + why (progressive, one path). */
const QUEST_KID: Record<
  string,
  { make: string; why: string; emoji: string }
> = {
  'meet-mascot': {
    make: 'Làm quen AI',
    why: 'Biết AI là công cụ giúp con',
    emoji: '👋',
  },
  character: {
    make: 'Tạo nhân vật',
    why: 'Có “bạn” để kể chuyện',
    emoji: '🐱',
  },
  'world-build': {
    make: 'Chọn nơi chơi',
    why: 'Biết câu chuyện xảy ra ở đâu',
    emoji: '🪐',
  },
  plot: {
    make: 'Chọn sự cố vui',
    why: 'Truyện có mở đầu và kết',
    emoji: '⚡',
  },
  'prompt-lab': {
    make: 'Ghép thẻ → AI vẽ ảnh',
    why: 'Có hình để ghép truyện',
    emoji: '🎨',
  },
  detective: {
    make: 'Chọn ảnh đúng ý',
    why: 'AI có thể sai — con kiểm tra',
    emoji: '🔎',
  },
  comic: {
    make: 'Làm truyện 4 khung',
    why: 'Ghép ảnh + lời thoại',
    emoji: '📖',
  },
  cinema: {
    make: 'Làm video kể chuyện',
    why: 'Khoe cho gia đình xem',
    emoji: '🎬',
  },
}

export function WorldPage() {
  const navigate = useNavigate()
  const completed = useDemoStore((s) => s.completedQuestIds)
  const currentQuestId = useDemoStore((s) => s.currentQuestId)
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const child = useDemoStore((s) => s.child)

  const quests = useMemo(
    () => computeQuestStatuses(completed, currentQuestId),
    [completed, currentQuestId],
  )

  const next = quests.find((q) => q.status === 'available' || q.status === 'in_progress')
  const progress = Math.round((completed.length / quests.length) * 100)
  const nextKid = next ? QUEST_KID[next.id] : null

  const openQuest = (id: string) => {
    setCurrentQuest(id)
    navigate(questRoute(id))
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 pb-6 sm:max-w-2xl">
      {/* 1) Who + goal of the WHOLE course */}
      <div className="text-center sm:text-left">
        <p className="text-sm font-extrabold text-brand-500">Xin chào, {child.nickname}!</p>
        <h1 className="font-display text-2xl text-text sm:text-3xl">
          Làm truyện tranh AI của con
        </h1>
        <p className="mt-1 text-sm font-semibold text-muted sm:text-base">
          Làm từng bước nhỏ → cuối cùng có truyện + video.
        </p>
      </div>

      <MissionBanner
        doing="Hoàn thành 8 bước nhỏ theo thứ tự"
        why="Mỗi bước cho 1 mảnh: nhân vật, ảnh, truyện, video"
        reward="Truyện 4 khung + video kể chuyện"
      />

      <ProgressBar
        value={progress}
        label={`Đã xong ${completed.length}/8 bước`}
      />

      {/* 2) ONE big next action only */}
      {next && nextKid ? (
        <div className="rounded-[1.5rem] border-2 border-brand-500 bg-gradient-to-br from-brand-50 to-sky-100 p-4 shadow-clay sm:p-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <img
              src={MASCOT_SRC}
              alt=""
              className="size-20 shrink-0"
              width={80}
              height={80}
            />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">
                Chỉ cần làm 1 việc này
              </p>
              <p className="font-display text-xl text-text sm:text-2xl">
                <span aria-hidden>{nextKid.emoji} </span>
                Bước {next.order}: {nextKid.make}
              </p>
              <p className="mt-1 text-sm font-bold text-muted">
                Để làm gì? {nextKid.why}
              </p>
            </div>
            <Button
              size="lg"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => openQuest(next.id)}
            >
              <Play className="size-5" aria-hidden />
              Bắt đầu
            </Button>
          </div>
        </div>
      ) : null}

      {/* 3) Simple vertical list — no chapter grids */}
      <div>
        <h2 className="mb-2 font-display text-lg text-text">Lộ trình 8 bước</h2>
        <ol className="space-y-2">
          {quests.map((q) => {
            const kid = QUEST_KID[q.id] ?? {
              make: q.title,
              why: q.skill,
              emoji: '✨',
            }
            const locked = q.status === 'locked'
            const done = q.status === 'completed'
            const current =
              q.status === 'available' || q.status === 'in_progress'

            return (
              <li key={q.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    if (!locked) openQuest(q.id)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors duration-150 sm:p-3.5',
                    locked && 'cursor-not-allowed border-border bg-white/60 opacity-60',
                    done && 'cursor-pointer border-mint-400/40 bg-mint-100/40',
                    current &&
                      'cursor-pointer border-brand-500 bg-white shadow-soft',
                    !locked &&
                      !done &&
                      !current &&
                      'cursor-pointer border-border bg-white',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold text-white sm:size-12',
                    )}
                    style={{ background: locked ? '#C5CAD6' : q.accent }}
                    aria-hidden
                  >
                    {done ? '✓' : kid.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base text-text sm:text-lg">
                        {q.order}. {kid.make}
                      </span>
                      {done ? (
                        <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-extrabold text-success">
                          Xong
                        </span>
                      ) : null}
                      {current ? (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-extrabold text-brand-600">
                          Làm tiếp
                        </span>
                      ) : null}
                      {locked ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-muted">
                          <Lock className="size-3" aria-hidden />
                          Làm bước trước đã
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs font-semibold text-muted sm:text-sm">
                      Để làm gì? {kid.why}
                    </span>
                  </span>
                  {!locked ? (
                    done ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
                    ) : (
                      <ChevronRight className="size-5 shrink-0 text-brand-500" aria-hidden />
                    )
                  ) : null}
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <p className="text-center text-xs font-semibold text-muted">
        Mẹo: luôn bấm nút tím <strong>Bắt đầu</strong> hoặc dòng có nhãn “Làm tiếp”.
      </p>
    </div>
  )
}
