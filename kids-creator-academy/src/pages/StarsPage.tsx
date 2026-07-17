import { useMemo } from 'react'
import { Star, Trophy, Heart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { MissionBanner } from '@/components/ui/MissionBanner'
import { ProgressBar } from '@/components/ui/Progress'
import { useDemoStore } from '@/store/demo-store'
import { AVATARS, MOCK_STUDENTS } from '@/data/mock'
import { cn } from '@/lib/cn'

/**
 * Safe "class stars" board — nicknames only, celebratory, NOT global public ranking.
 * Research: avoid shame / public last-place (ICO Children's Code + product spec).
 */
export function StarsPage() {
  const child = useDemoStore((s) => s.child)
  const stars = useDemoStore((s) => s.stars)
  const badges = useDemoStore((s) => s.badges)
  const completed = useDemoStore((s) => s.completedQuestIds)

  const board = useMemo(() => {
    // Seed playful class board from mock students + live player
    const rows = MOCK_STUDENTS.map((s, i) => ({
      id: s.id,
      nickname: s.nickname,
      avatarId: s.avatarId,
      stars: 40 + s.progress + i * 7,
      isYou: s.nickname === child.nickname,
    }))
    const you = rows.find((r) => r.isYou)
    if (you) you.stars = Math.max(you.stars, stars)
    else {
      rows.push({
        id: child.id,
        nickname: child.nickname,
        avatarId: child.avatarId,
        stars,
        isYou: true,
      })
    }
    return rows.sort((a, b) => b.stars - a.stars)
  }, [child, stars])

  return (
    <div className="mx-auto max-w-xl space-y-4 sm:max-w-2xl">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
          Phòng sao lớp
        </p>
        <h1 className="font-display text-2xl sm:text-[1.75rem]">Thành tích của con</h1>
      </div>

      <MissionBanner
        doing="Xem sao, XP và huy hiệu"
        why="Theo dõi tiến bộ sau mỗi nhiệm vụ"
        reward="Mở thử thách và sản phẩm mới"
      />

      <Card className="bg-gradient-to-br from-sun-100 to-brand-50">
        <div className="flex items-center gap-3">
          <Star className="size-10 fill-sun-400 text-sun-400" aria-hidden />
          <div>
            <p className="font-display text-2xl">{stars} sao</p>
            <p className="text-sm font-semibold text-muted">
              Cấp {child.level} · {child.xp} XP · {completed.length}/8 bước
            </p>
          </div>
        </div>
        <ProgressBar className="mt-3" value={(completed.length / 8) * 100} />
      </Card>

      <Card>
        <h2 className="mb-2 flex items-center gap-2 font-display text-xl">
          <Trophy className="size-5 text-brand-500" aria-hidden />
          Bảng sao lớp (biệt danh)
        </h2>
        <p className="mb-3 text-xs font-semibold text-muted">
          Chỉ trong lớp demo · Không xếp hạng toàn web · Không “bạn đang thua”
        </p>
        <ol className="space-y-2">
          {board.map((row, i) => {
            const av = AVATARS.find((a) => a.id === row.avatarId) ?? AVATARS[0]
            return (
              <li
                key={row.id}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 px-3 py-2',
                  row.isYou
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-border bg-white',
                )}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-bg text-sm font-extrabold text-muted">
                  {i + 1}
                </span>
                <img src={av.src} alt="" className="size-10 rounded-xl" />
                <span className="min-w-0 flex-1 font-extrabold">
                  {row.nickname}
                  {row.isYou ? (
                    <span className="ml-1 text-xs text-brand-600">(con)</span>
                  ) : null}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-extrabold text-sun-400">
                  <Star className="size-4 fill-sun-400" aria-hidden />
                  {row.stars}
                </span>
              </li>
            )
          })}
        </ol>
      </Card>

      <Card>
        <h2 className="mb-2 flex items-center gap-2 font-display text-xl">
          <Heart className="size-5 text-coral-400" aria-hidden />
          Huy hiệu đã sưu tầm
        </h2>
        <ul className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <li
              key={b}
              className="rounded-full bg-mint-100 px-3 py-1.5 text-sm font-extrabold text-success"
            >
              {b}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
