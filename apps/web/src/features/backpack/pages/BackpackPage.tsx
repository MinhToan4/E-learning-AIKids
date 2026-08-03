import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { api } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { designerAssets } from '@/shared/config/assets'
import type { RewardKind } from '@/shared/lib/creation/rewards'
import {
  resolveCatalogRewardAsset,
  type RewardCatalogAssets,
} from '@/features/rewards/reward-catalog-assets'
import { displayableRewardInventory } from '@/features/rewards/reward-inventory'

type Asset = {
  id: string
  type: string
  name: string
  thumbnail: string
  private: boolean
  questId?: string | null
  createdAt: string
}

type Project = {
  id: string
  title: string
  kind: string
  thumbnail: string
  content?: string
  shareStatus: string
}

type GamificationReward = {
  code: string
  name: string
  description: string
  kind: RewardKind
  displayConfig?: { icon?: string }
  assets?: RewardCatalogAssets
}

function RewardThumbnail({ src, onInvalid }: { src: string; onInvalid: () => void }) {
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-full w-full object-contain"
      onError={onInvalid}
    />
  )
}

const rewardKindLabels: Partial<Record<RewardKind, string>> = {
  avatar: 'Avatar',
  frame: 'Khung hồ sơ',
  theme: 'Nền trang',
  event_ticket: 'Vé sự kiện',
  perk: 'Quyền đặc biệt',
  title: 'Danh hiệu',
  companion: 'Bạn đồng hành',
  effect: 'Hiệu ứng',
  background: 'Nền thẻ',
}

type GalleryFilter = 'all' | 'image' | 'comic' | 'story'

const FILTERS: Array<{ id: GalleryFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'image', label: 'Ảnh AI & tranh vẽ' },
  { id: 'comic', label: 'Truyện tranh' },
  { id: 'story', label: 'Truyện chữ' },
]

function filterKind(kind: string): Exclude<GalleryFilter, 'all'> {
  const normalized = kind.toLowerCase()
  if (normalized.includes('comic') || normalized.includes('panel')) return 'comic'
  if (normalized.includes('story') || normalized.includes('text')) return 'story'
  return 'image'
}

function kindLabel(kind: string) {
  const group = filterKind(kind)
  return group === 'comic'
    ? 'Truyện tranh'
    : group === 'story'
      ? 'Truyện chữ'
      : kind.includes('character')
        ? 'Nhân vật AI'
        : 'Ảnh AI & tranh vẽ'
}

function shareStatusLabel(status: string) {
  if (status === 'approved') return 'Đã được duyệt'
  if (status === 'pending') return 'Đang chờ Ba / Mẹ duyệt'
  return 'Chỉ mình con'
}

function isImgUrl(src: string) {
  return (
    src.startsWith('data:') ||
    src.startsWith('/') ||
    src.startsWith('http://') ||
    src.startsWith('https://')
  )
}

function MediaThumbnail({
  src,
  kind,
  className,
}: {
  src: string
  kind: string
  className: string
}) {
  const [failed, setFailed] = useState(false)
  if (!isImgUrl(src) || failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-brand-50 text-3xl`}>
        {kind === 'comic' ? '🖼️' : kind === 'story' ? '📖' : '🎨'}
      </div>
    )
  }
  return <img src={src} alt="" className={className} onError={() => setFailed(true)} />
}

export function BackpackPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [rewards, setRewards] = useState<GamificationReward[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<GalleryFilter>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [a, p, inventoryResult, catalogResult] = await Promise.allSettled([
        api<{ assets: Asset[] }>('/api/backpack'),
        api<{ projects: Project[] }>('/api/projects'),
        api<{ inventory: Array<{ rewardId: string }> }>('/api/gamification/storybook'),
        api<{ items: GamificationReward[] }>('/api/gamification/catalog?type=reward'),
      ])
      setAssets(a.status === 'fulfilled' ? a.value.assets : [])
      setProjects(p.status === 'fulfilled' ? p.value.projects : [])
      if (inventoryResult.status === 'fulfilled' && catalogResult.status === 'fulfilled') {
        const owned = new Set(inventoryResult.value.inventory.map((item) => item.rewardId))
        setRewards(displayableRewardInventory(
          catalogResult.value.items.filter((item) => owned.has(item.code)),
        ))
      } else {
        setRewards([])
      }
      const rejected = [a, p, inventoryResult, catalogResult]
        .find((result) => result.status === 'rejected')
      if (rejected?.status === 'rejected') {
        setError(
          rejected.reason instanceof Error
            ? rejected.reason.message
            : 'Không tải được dữ liệu trong Ba lô.',
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visibleAssets = useMemo(
    () => filter === 'all' || filter === 'image' ? assets : [],
    [assets, filter],
  )
  const visibleProjects = useMemo(
    () => projects.filter((project) =>
      filter === 'all' || filterKind(project.kind) === filter,
    ),
    [filter, projects],
  )
  const counts = useMemo(() => ({
    all: assets.length + projects.length + rewards.length,
    image: assets.length + projects.filter((project) => filterKind(project.kind) === 'image').length,
    comic: projects.filter((project) => filterKind(project.kind) === 'comic').length,
    story: projects.filter((project) => filterKind(project.kind) === 'story').length,
  }), [assets, projects, rewards])

  async function requestShare(projectId: string) {
    try {
      await api(`/api/projects/${projectId}/request-share`, {
        method: 'POST',
        body: JSON.stringify({ destination: 'family' }),
      })
      setMsg('Đã gửi Ba / Mẹ duyệt chia sẻ!')
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Lỗi')
    }
  }

  if (loading) {
    return <PageSkeleton rows={4} />
  }

  return (
    <PageMotion className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl">Ba lô sáng tạo</h1>
        <p className="text-muted">
          Ba lô lưu những sản phẩm con đã tạo trong bài học — mặc định chỉ con xem.
          Ảnh cá nhân từ thiết bị không được tải lên để giữ an toàn riêng tư.
        </p>
      </div>
      {msg && (
        <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm text-success">{msg}</p>
      )}
      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      <nav aria-label="Lọc sản phẩm trong Ba lô" className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={
              filter === item.id
                ? 'rounded-full bg-brand-600 px-3 py-2 text-sm font-extrabold text-white'
                : 'rounded-full border border-border bg-white px-3 py-2 text-sm font-extrabold text-muted hover:border-brand-300'
            }
          >
            {item.label} · {counts[item.id]}
          </button>
        ))}
      </nav>

      {filter === 'all' && (
        <section aria-labelledby="reward-inventory-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-brand-600">Kho phần thưởng</p>
              <h2 id="reward-inventory-title" className="font-display text-2xl">Quà con đã nhận</h2>
            </div>
            <Link to="/profile" className="min-h-11 rounded-xl px-3 py-2 text-sm font-extrabold text-brand-700">
              Dùng trên hồ sơ
            </Link>
          </div>
          {rewards.length === 0 ? (
            <p className="rounded-2xl bg-brand-50 p-4 text-sm font-bold text-muted">
              Chưa có reward trong kho. Học và hoàn thành Storybook để mở quà nhé!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {rewards.map((reward) => {
                const assetUrl = resolveCatalogRewardAsset({ id: reward.code, assets: reward.assets }, 'thumbnail')
                return (
                  <article key={reward.code} className="ui-card overflow-hidden p-3">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
                      {assetUrl && (
                        <RewardThumbnail
                          src={assetUrl}
                          onInvalid={() => setRewards((current) =>
                            current.filter((item) => item.code !== reward.code))}
                        />
                      )}
                    </div>
                    <p className="mt-2 text-xs font-black uppercase text-brand-600">
                      {rewardKindLabels[reward.kind] ?? 'Phần thưởng'}
                    </p>
                    <h3 className="text-base font-extrabold leading-tight">{reward.name}</h3>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {(filter === 'all' || filter === 'image') && <section>
        <h2 className="font-display mb-3 text-2xl">Vật phẩm từ bài học</h2>
        {visibleAssets.length === 0 ? (
          <EmptyState
            compact
            title={filter === 'all' ? 'Ba lô còn trống' : 'Không có ảnh ở bộ lọc này'}
            description="Hoàn thành trạm vẽ hoặc tạo ảnh AI để nhận vật phẩm nhé!"
            imageSrc={designerAssets.lobby.cardArt}
            action={
              <Link to="/world">
                <Button variant="secondary">Đi học tiếp</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {visibleAssets.map((a) => (
              <div key={a.id} className="ui-card overflow-hidden p-2">
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                  <MediaThumbnail
                    src={a.thumbnail}
                    kind={a.type}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 truncate text-sm font-extrabold">{a.name}</p>
                <p className="text-xs text-muted">
                  {kindLabel(a.type)}
                  {a.questId ? ' · từ bài học' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>}

      <section>
        <h2 className="font-display mb-3 text-2xl">Tác phẩm</h2>
        {visibleProjects.length === 0 ? (
          <EmptyState
            compact
            title={filter === 'all' ? 'Chưa có tác phẩm' : 'Không có tác phẩm ở bộ lọc này'}
            description="Làm truyện hoặc tạo ảnh ở Xưởng sáng tạo để có tác phẩm trong Ba lô!"
            imageSrc={designerAssets.workshop.comic}
            action={
              <Link to="/home">
                <Button variant="secondary">Chọn khóa học</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleProjects.map((p) => (
              <div key={p.id} className="ui-card flex gap-3 p-3">
                <MediaThumbnail
                  src={p.thumbnail}
                  kind={p.kind}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{p.title}</p>
                  <p className="text-xs text-muted">
                    {kindLabel(p.kind)} · {shareStatusLabel(p.shareStatus)}
                  </p>
                  {p.content && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{p.content}</p>
                  )}
                  {p.shareStatus === 'private' && (
                    <Button
                      className="mt-2 !min-h-9 !text-xs"
                      variant="secondary"
                      onClick={() => void requestShare(p.id)}
                    >
                      Xin Ba / Mẹ chia sẻ
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageMotion>
  )
}
