import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle2, Play, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Progress'
import { useDemoStore } from '@/store/demo-store'
import { MASCOT_SRC } from '@/data/mock'
import { cn } from '@/lib/cn'
import { computeQuestStatuses } from '@/lib/quests'

export function WorldPage() {
  const navigate = useNavigate()
  // Select primitives/stable refs only — never return new arrays from selectors
  // (that triggers React "Maximum update depth exceeded" with useSyncExternalStore).
  const completed = useDemoStore((s) => s.completedQuestIds)
  const currentQuestId = useDemoStore((s) => s.currentQuestId)
  const project = useDemoStore((s) => s.currentProject)
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const child = useDemoStore((s) => s.child)

  const quests = useMemo(
    () => computeQuestStatuses(completed, currentQuestId),
    [completed, currentQuestId],
  )

  const progress = Math.round((completed.length / quests.length) * 100)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-500">
            Thế giới Sáng tạo
          </p>
          <h1 className="font-display text-3xl font-semibold text-text md:text-4xl">
            Chào {child.nickname}! Hành trình truyện tranh AI
          </h1>
          <p className="mt-1 text-muted">
            8 nhiệm vụ ngắn · Sản phẩm cuối: truyện 4 khung + video kể chuyện
          </p>
        </div>
        <Card className="w-full max-w-sm p-4 lg:w-80">
          <p className="text-sm font-bold text-muted">Bộ truyện của con</p>
          <p className="font-display text-lg font-semibold">{project.title}</p>
          <ProgressBar className="mt-3" value={progress} label={`Đã hoàn thành ${progress}%`} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="relative overflow-hidden p-0">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-100/50 via-brand-50/30 to-mint-100/40" />
          <ol className="relative grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
            {quests.map((q) => {
              const locked = q.status === 'locked'
              const done = q.status === 'completed'
              const current = q.status === 'available' || q.status === 'in_progress'
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (locked) return
                      setCurrentQuest(q.id)
                      navigate(
                        q.id === 'character'
                          ? '/quest/character'
                          : q.id === 'comic'
                            ? '/studio/comic'
                            : q.id === 'cinema'
                              ? '/studio/video'
                              : q.id === 'prompt-lab' || q.id === 'detective'
                                ? '/studio/prompt'
                                : `/quest/${q.id}`,
                      )
                    }}
                    className={cn(
                      'flex h-full min-h-[180px] w-full cursor-pointer flex-col rounded-[1.25rem] border-2 p-4 text-left transition-all duration-150',
                      locked && 'cursor-not-allowed border-border bg-white/60 opacity-70',
                      done && 'border-mint-400/50 bg-mint-100/40',
                      current && 'border-brand-500 bg-white shadow-clay',
                      !locked && !done && !current && 'border-border bg-white',
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="inline-flex size-10 items-center justify-center rounded-2xl text-sm font-bold text-white"
                        style={{ background: q.accent }}
                      >
                        {q.order}
                      </span>
                      {locked ? (
                        <Lock className="size-5 text-muted" aria-label="Đã khóa" />
                      ) : done ? (
                        <CheckCircle2 className="size-5 text-success" aria-label="Hoàn thành" />
                      ) : (
                        <Play className="size-5 text-brand-500" aria-label="Có thể chơi" />
                      )}
                    </div>
                    <h2 className="font-display text-lg font-semibold leading-snug">{q.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{q.skill}</p>
                    <p className="mt-auto pt-3 text-xs font-bold text-brand-600">
                      Phần thưởng: {q.reward}
                    </p>
                  </button>
                </li>
              )
            })}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-brand-50 to-sky-100">
            <div className="flex items-center gap-3">
              <img src={MASCOT_SRC} alt="" className="size-16" />
              <div>
                <p className="font-display text-lg font-semibold">Gợi ý của Mực Màu</p>
                <p className="text-sm text-muted">
                  Bắt đầu nhiệm vụ <strong>Tạo nhân vật</strong> để nhận Character Card!
                </p>
              </div>
            </div>
            <Button
              className="mt-4"
              fullWidth
              onClick={() => {
                setCurrentQuest('character')
                navigate('/quest/character')
              }}
            >
              Vào nhiệm vụ tiếp theo
            </Button>
          </Card>

          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-sun-400">
              <Star className="size-4 fill-sun-400 text-sun-400" aria-hidden />
              Sản phẩm cuối khóa
            </div>
            <img
              src={project.cover}
              alt={`Bìa dự án ${project.title}`}
              className="w-full rounded-2xl border border-border"
            />
            <p className="mt-3 font-semibold">{project.title}</p>
            <p className="text-sm text-muted">Truyện 4 khung + video 30–45 giây</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
