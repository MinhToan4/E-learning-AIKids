import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { designerAssets } from '@/shared/config/assets'
import { avatarEmoji, avatarImage } from '@/shared/config/avatars'
import { cn } from '@/shared/lib/cn'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { Button } from '@/shared/components/ui/Button'

type Row = {
  rank: number
  id: string
  nickname: string | null
  avatarId: string | null
  level: number
  xp: number
  isMe: boolean
}

function AvatarBubble({
  avatarId,
  size = 'md',
  ring,
}: {
  avatarId: string | null
  size?: 'sm' | 'md' | 'lg'
  ring?: string
}) {
  const img = avatarImage(avatarId)
  const dim =
    size === 'lg' ? 'h-20 w-20 text-4xl' : size === 'sm' ? 'h-11 w-11 text-xl' : 'h-14 w-14 text-2xl'
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 shadow-clay',
        dim,
        ring,
      )}
    >
      {img ? (
        <img src={img} alt="" className="h-full w-full object-cover" />
      ) : (
        avatarEmoji(avatarId)
      )}
    </span>
  )
}

function rankMedal(rank: number) {
  if (rank === 1) return { emoji: '🥇', tone: 'from-sun-100 to-sun-400/40', ring: 'ring-4 ring-sun-400' }
  if (rank === 2) return { emoji: '🥈', tone: 'from-brand-50 to-sky-100', ring: 'ring-4 ring-sky-400/80' }
  if (rank === 3) return { emoji: '🥉', tone: 'from-coral-100 to-sun-100', ring: 'ring-4 ring-coral-400/70' }
  return { emoji: `#${rank}`, tone: 'from-white to-brand-50', ring: '' }
}

export function LeaderboardPage() {
  const user = useAuth((s) => s.user)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ leaderboard: Row[] }>(
        '/api/gamification/leaderboard',
      )
      setRows(data.leaderboard)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Chưa tải được bảng xếp hạng lớp.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const me = rows.find((r) => r.isMe)
  const top3 = rows.slice(0, 3)
  // Podium visual order: 2nd · 1st · 3rd
  const podiumOrder =
    top3.length >= 3
      ? [top3[1]!, top3[0]!, top3[2]!]
      : top3

  if (loading) {
    return <PageSkeleton rows={5} />
  }

  return (
    <PageMotion className="flex flex-col gap-5">
      {/* Hero */}
      <header className="ui-card relative overflow-hidden p-0">
        <div className="absolute inset-0">
          <img
            src={designerAssets.lobby.homeExplore}
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-brand-50/80" />
        </div>
        <div className="relative flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sun-100 text-3xl shadow-clay">
            🏆
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              Cùng tiến bộ
            </p>
            <h1 className="font-display text-3xl leading-tight text-text">
              Bảng xếp hạng lớp
            </h1>

          </div>
          {me && (
            <div className="rounded-2xl bg-sun-100 px-4 py-3 text-center shadow-soft">
              <p className="text-xs font-bold text-warning">Hạng của con</p>
              <p className="font-display text-3xl text-text">#{me.rank}</p>
              <p className="text-xs font-extrabold text-brand-600">{me.xp} XP</p>
            </div>
          )}
        </div>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      {!error && rows.length === 0 && (
        <EmptyState
          title="Lớp chưa có ai trên bảng"
          description="Hoàn thành bài học để ghi XP và xuất hiện cùng bạn bè nhé!"
          imageSrc={designerAssets.brand.mascot}
          action={
            <Link to="/home">
              <Button>Về sảnh học</Button>
            </Link>
          }
        />
      )}

      {/* Podium */}
      {top3.length > 0 && (
        <section className="ui-card overflow-hidden p-4 sm:p-6">
          <h2 className="font-display mb-4 text-center text-xl text-brand-600">
            🌟 Top bạn tích cực
          </h2>
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            {podiumOrder.map((row) => {
              const isFirst = row.rank === 1
              const medal = rankMedal(row.rank)
              return (
                <div
                  key={row.id}
                  className={cn(
                    'flex flex-1 max-w-[9rem] flex-col items-center gap-2',
                    isFirst && 'z-10',
                  )}
                >
                  <span className="text-2xl" aria-hidden>
                    {medal.emoji}
                  </span>
                  <AvatarBubble
                    avatarId={row.avatarId}
                    size={isFirst ? 'lg' : 'md'}
                    ring={medal.ring}
                  />
                  <p
                    className={cn(
                      'line-clamp-1 text-center text-sm font-extrabold',
                      row.isMe && 'text-brand-600',
                    )}
                  >
                    {row.nickname ?? 'Bạn ẩn danh'}
                    {row.isMe ? ' · con' : ''}
                  </p>
                  <p className="text-xs font-bold text-muted">
                    Lv{row.level} · {row.xp} XP
                  </p>
                  <div
                    className={cn(
                      'w-full rounded-t-2xl bg-gradient-to-b shadow-soft',
                      medal.tone,
                      isFirst ? 'h-24 sm:h-28' : row.rank === 2 ? 'h-16 sm:h-20' : 'h-12 sm:h-14',
                    )}
                  />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Full list */}
      {rows.length > 0 && (
        <section className="ui-card overflow-hidden p-0">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-xl">Cả lớp</h2>
            <p className="text-xs text-muted">
              {rows.length} bạn · lớp của {user?.nickname ?? 'con'}
            </p>
          </div>
          <ol className="divide-y divide-border/70">
            {rows.map((row) => {
              const medal = rankMedal(row.rank)
              return (
                <li
                  key={row.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition',
                    row.isMe && 'bg-gradient-to-r from-sun-100/90 to-brand-50/50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold',
                      row.rank <= 3
                        ? 'bg-sun-100 text-warning'
                        : 'bg-brand-50 text-brand-600',
                    )}
                  >
                    {row.rank <= 3 ? medal.emoji : row.rank}
                  </span>
                  <AvatarBubble avatarId={row.avatarId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-text">
                      {row.nickname ?? 'Bạn ẩn danh'}
                      {row.isMe ? (
                        <span className="ml-1 text-xs font-bold text-brand-500">
                          (con)
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted">Cấp {row.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-brand-600">{row.xp}</p>
                    <p className="text-[10px] font-bold uppercase text-muted">
                      XP
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      <p className="text-center text-xs text-muted">
        XP tăng khi con hoàn thành bài học — cùng cổ vũ bạn bè nha! 🎉
      </p>
    </PageMotion>
  )
}
