import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Check, Lock } from 'lucide-react'

import { api, type AchievementRow } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { CardGridSkeleton } from '@/shared/components/ui/Skeleton'
import { NavBadgeIcon } from '@/shared/components/icons/KidNavIcons'
import { cn } from '@/shared/lib/cn'
import { displayableAchievements } from '../achievement-inventory'

type Filter = 'all' | 'unlocked' | 'locked'

const categoryLabels: Record<string, string> = {
  learning: 'Học tập',
  lessons_completed: 'Học tập',
  courses_completed: 'Học tập',
  creation: 'Sáng tạo',
  creative: 'Sáng tạo',
  ai_skills: 'Kỹ năng số',
  habit: 'Thói quen',
  streak: 'Thói quen',
  stars: 'Ngôi sao',
  xp: 'Cấp độ',
  level: 'Cấp độ',
  collaboration: 'Cộng tác',
  starter: 'Khởi hành',
  general: 'Khác',
}

function categoryLabel(value?: string) {
  if (!value) return 'Khác'
  return categoryLabels[value] ?? value.replaceAll('_', ' ')
}

function percent(item: AchievementRow) {
  if (item.unlocked) return 100
  if (item.currentValue == null || item.requiredValue <= 0) return 0
  return Math.min(100, Math.round((item.currentValue / item.requiredValue) * 100))
}

function BadgeCard({ item }: { item: AchievementRow }) {
  const imageSrc = item.icon.startsWith('/') || item.icon.startsWith('http') ? item.icon : null
  const progress = percent(item)
  return (
    <article className={cn(
      'flex min-h-48 flex-col rounded-3xl border bg-white p-5 shadow-soft',
      item.unlocked ? 'border-mint-200' : 'border-border',
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border',
          item.unlocked ? 'border-sun-200 bg-sun-100' : 'border-border bg-[#f3f4f1]',
        )} aria-hidden="true">
          {imageSrc ? (
            <img src={imageSrc} alt="" className={cn('h-12 w-12 object-contain', !item.unlocked && 'grayscale')} />
          ) : item.unlocked ? (
            <NavBadgeIcon size={34} />
          ) : (
            <Lock size={25} className="text-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-brand-700">{categoryLabel(item.category)}</p>
          <h2 className="mt-0.5 font-display text-xl leading-tight text-text">{item.title}</h2>
          <p className="mt-1 text-sm font-semibold text-muted">{item.description}</p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        {item.unlocked ? (
          <p className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-mint-50 px-3 text-sm font-extrabold text-success">
            <Check size={17} aria-hidden="true" /> Đã mở
          </p>
        ) : item.currentValue != null ? (
          <>
            <div className="mb-2 flex justify-between text-sm font-bold">
              <span className="text-muted">Tiến độ</span>
              <span className="text-text">{item.currentValue}/{item.requiredValue}</span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-brand-50"
              role="progressbar"
              aria-label={`Tiến độ ${item.title}`}
              aria-valuemin={0}
              aria-valuemax={item.requiredValue}
              aria-valuenow={item.currentValue}
            >
              <div className="h-full rounded-full bg-mint-400" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <p className="text-sm font-bold text-muted">Tiếp tục khám phá để mở</p>
        )}
      </div>
    </article>
  )
}

export function AchievementsPage() {
  const [items, setItems] = useState<AchievementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ achievements: AchievementRow[] }>('/api/gamification/achievements')
      setItems(displayableAchievements(data.achievements))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được huy hiệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const unlocked = items.filter((item) => item.unlocked).length
  const visible = useMemo(() => items.filter((item) => {
    if (filter === 'unlocked') return item.unlocked
    if (filter === 'locked') return !item.unlocked
    return true
  }), [filter, items])

  return (
    <PageMotion className="flex flex-col gap-5">
      <header className="rounded-3xl border border-border bg-white p-5 shadow-soft sm:p-6">
        <Link to="/profile" className="inline-flex min-h-11 items-center font-extrabold text-brand-700 hover:underline">
          ← Về hồ sơ
        </Link>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-text sm:text-4xl">Huy hiệu của con</h1>
            <p className="mt-1 max-w-xl text-base font-semibold text-muted">
              Mỗi huy hiệu ghi lại một điều con đã làm được.
            </p>
          </div>
          {!loading && items.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl bg-[#f4f7ef] p-3">
              <span className="student-nav-icon !h-12 !w-12" aria-hidden="true"><NavBadgeIcon size={28} /></span>
              <p><strong className="block font-display text-2xl text-text">{unlocked}/{items.length}</strong><span className="text-sm font-bold text-muted">đã mở</span></p>
            </div>
          )}
        </div>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}
      {loading && <CardGridSkeleton count={6} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="Hành trình vừa bắt đầu"
          description="Hoàn thành một bài học để nhận huy hiệu đầu tiên."
          action={<Link to="/home"><Button>Về sảnh học</Button></Link>}
        />
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <nav className="flex gap-2 overflow-x-auto" aria-label="Lọc huy hiệu">
            {([
              ['all', 'Tất cả'],
              ['unlocked', 'Đã mở'],
              ['locked', 'Đang khám phá'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  'min-h-11 shrink-0 rounded-2xl border px-4 text-sm font-extrabold',
                  filter === value
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-border bg-white text-text',
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          {visible.length ? (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Danh sách huy hiệu">
              {visible.map((item) => (
                <BadgeCard key={`${item.category ?? 'general'}-${item.title}-${item.requiredValue}`} item={item} />
              ))}
            </section>
          ) : (
            <EmptyState title="Không có huy hiệu trong mục này" description="Chọn một mục khác để xem tiếp." />
          )}
        </>
      )}
    </PageMotion>
  )
}
