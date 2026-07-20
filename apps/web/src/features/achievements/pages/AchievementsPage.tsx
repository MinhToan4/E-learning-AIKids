import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type AchievementRow } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { CardGridSkeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { designerAssets } from '@/shared/config/assets'
import { Button } from '@/shared/components/ui/Button'

export function AchievementsPage() {
  const [items, setItems] = useState<AchievementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ achievements: AchievementRow[] }>(
        '/api/gamification/achievements',
      )
      setItems(data.achievements)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được huy hiệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const unlocked = items.filter((a) => a.unlocked).length

  return (
    <PageMotion className="flex flex-col gap-5">
      <header className="ui-card relative overflow-hidden p-5">
        <img
          src={designerAssets.chrome.badges}
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-full w-40 object-cover opacity-25"
        />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
            Bộ sưu tập
          </p>
          <h1 className="font-display text-3xl">Huy hiệu của con</h1>
          <p className="text-sm text-muted">
            {loading
              ? 'Đang tải…'
              : `${unlocked}/${items.length} đã mở · tiếp tục sưu tầm nhé!`}
          </p>
          <Link
            to="/home"
            className="mt-3 inline-block text-sm font-bold text-brand-500 hover:underline"
          >
            ← Về sảnh
          </Link>
        </div>
      </header>

      {error && (
        <ErrorState message={error} onRetry={() => void load()} inline />
      )}

      {loading && <CardGridSkeleton count={6} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="Chưa có huy hiệu"
          description="Hoàn thành bài học đầu tiên để mở huy hiệu đầu tiên nhé!"
          action={
            <Link to="/home">
              <Button>Về sảnh học</Button>
            </Link>
          }
        />
      )}

      {!loading && items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <article
              key={a.type}
              className={cn(
                'ui-card flex flex-col gap-2 p-4 transition',
                a.unlocked
                  ? 'bg-gradient-to-br from-white to-sun-100/60'
                  : 'opacity-70',
              )}
            >
              <div
                className={cn(
                  'ui-badge-clay',
                  !a.unlocked && 'ui-badge-clay-locked',
                )}
                aria-hidden
              >
                {a.icon}
              </div>
              <h2 className="font-display text-xl leading-tight">{a.title}</h2>
              <p className="text-sm text-muted">{a.description}</p>
              {a.unlocked ? (
                <p className="text-xs font-bold text-success">
                  Đã mở
                  {a.unlockedAt
                    ? ` · ${new Date(a.unlockedAt).toLocaleDateString('vi-VN')}`
                    : ''}
                </p>
              ) : (
                <p className="text-xs font-bold text-muted">
                  Chưa mở · tiếp tục học nhé!
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </PageMotion>
  )
}
