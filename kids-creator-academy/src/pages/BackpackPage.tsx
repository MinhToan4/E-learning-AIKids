import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/feedback/States'
import { useDemoStore } from '@/store/demo-store'
import type { AssetType } from '@/types'
import { cn } from '@/lib/cn'

const tabs: { id: AssetType | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'character', label: 'Nhân vật' },
  { id: 'background', label: 'Bối cảnh' },
  { id: 'comic', label: 'Truyện' },
  { id: 'video', label: 'Video' },
  { id: 'badge', label: 'Huy hiệu' },
]

export function BackpackPage() {
  const navigate = useNavigate()
  const assets = useDemoStore((s) => s.backpackAssets)
  const badges = useDemoStore((s) => s.badges)
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('all')

  const badgeAssets = badges.map((b, i) => ({
    id: `badge-${i}`,
    type: 'badge' as const,
    name: b,
    thumbnail: assets[0]?.thumbnail ?? '',
    createdAt: new Date().toISOString(),
    private: true,
    questId: undefined as string | undefined,
  }))

  const list = useMemo(() => {
    const merged = [
      ...assets,
      ...badgeAssets.filter((b) => !assets.some((a) => a.name === b.name)),
    ]
    if (tab === 'all') return merged
    return merged.filter((a) => a.type === tab)
  }, [assets, badgeAssets, tab])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Ba lô Sáng tạo</h1>
        <p className="text-muted">Mọi sản phẩm mặc định riêng tư.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'min-h-11 cursor-pointer rounded-full px-4 text-sm font-bold',
              tab === t.id ? 'bg-brand-500 text-white' : 'bg-white text-muted shadow-soft',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Ba lô đang chờ sản phẩm đầu tiên"
          description="Hãy hoàn thành nhiệm vụ Tạo nhân vật để nhận Character Card!"
          actionLabel="Vào nhiệm vụ"
          onAction={() => navigate('/quest/character')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((a) => (
            <Card key={a.id} className="overflow-hidden p-0">
              {a.thumbnail ? (
                <img
                  src={a.thumbnail}
                  alt={a.name}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-brand-50 font-display text-2xl font-semibold text-brand-600">
                  {a.name.slice(0, 1)}
                </div>
              )}
              <div className="p-4">
                <p className="font-display text-lg font-semibold">{a.name}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  {a.type} · {a.private ? 'Riêng tư' : 'Đã chia sẻ'}
                </p>
                {a.questId ? (
                  <p className="mt-1 text-sm text-muted">Từ nhiệm vụ: {a.questId}</p>
                ) : null}
                <Button
                  className="mt-3"
                  size="sm"
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    if (a.type === 'video') navigate('/portfolio/star-cat')
                    else if (a.type === 'character') navigate('/studio/comic')
                    else navigate('/studio/prompt')
                  }}
                >
                  Dùng lại
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
