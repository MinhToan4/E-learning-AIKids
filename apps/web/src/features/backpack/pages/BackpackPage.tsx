import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { api } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import { designerAssets } from '@/shared/config/assets'
import { KidBackpackImageIcon } from '@/shared/components/icons/KidImageIcons'
import {
  NavBadgeIcon,
  NavCreativeIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'
import type { RewardKind } from '@/shared/lib/creation/rewards'
import {
  resolveCatalogRewardAsset,
  type RewardCatalogAssets,
} from '@/features/rewards/reward-catalog-assets'
import { displayableRewardInventory } from '@/features/rewards/reward-inventory'
import { rewardTitleAsset } from '@/features/rewards/title-assets'

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

type BackpackSection = 'rewards' | 'projects' | 'learning'
type ProjectFilter = 'all' | 'image' | 'comic' | 'story'
type RewardGroup = 'profile' | 'page' | 'special'

const REWARD_GROUPS: Array<{
  id: RewardGroup
  label: string
  description: string
}> = [
  { id: 'profile', label: 'Đồ cho Hồ sơ', description: 'Khung, nền thẻ, danh hiệu và bạn đồng hành' },
  { id: 'page', label: 'Giao diện trang', description: 'Những theme làm đổi không gian của con' },
  { id: 'special', label: 'Vé và quyền đặc biệt', description: 'Quà dùng cho sự kiện hoặc tính năng riêng' },
]

const PROJECT_FILTERS: Array<{ id: ProjectFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'image', label: 'Tranh & ảnh' },
  { id: 'comic', label: 'Truyện tranh' },
  { id: 'story', label: 'Truyện chữ' },
]

function filterKind(kind: string): Exclude<ProjectFilter, 'all'> {
  const normalized = kind.toLowerCase()
  if (normalized.includes('comic') || normalized.includes('panel')) return 'comic'
  if (normalized.includes('story') || normalized.includes('text')) return 'story'
  return 'image'
}

function rewardGroup(kind: RewardKind): RewardGroup {
  if (kind === 'theme') return 'page'
  if (kind === 'event_ticket' || kind === 'perk') return 'special'
  return 'profile'
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
    const PlaceholderIcon = filterKind(kind) === 'story' ? NavWorldIcon : NavCreativeIcon
    return (
      <div className={`${className} flex items-center justify-center bg-brand-50 text-brand-700`}>
        <PlaceholderIcon size={36} aria-hidden="true" />
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
  const [section, setSection] = useState<BackpackSection>('rewards')
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('all')

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
        setError('Một vài ngăn chưa tải được. Con thử lại nhé.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visibleProjects = useMemo(
    () => projects.filter((project) =>
      projectFilter === 'all' || filterKind(project.kind) === projectFilter,
    ),
    [projectFilter, projects],
  )
  const projectCounts = useMemo(() => ({
    all: projects.length,
    image: projects.filter((project) => filterKind(project.kind) === 'image').length,
    comic: projects.filter((project) => filterKind(project.kind) === 'comic').length,
    story: projects.filter((project) => filterKind(project.kind) === 'story').length,
  }), [projects])
  const groupedRewards = useMemo(
    () => REWARD_GROUPS.map((group) => ({
      ...group,
      items: rewards.filter((reward) => rewardGroup(reward.kind) === group.id),
    })).filter((group) => group.items.length > 0),
    [rewards],
  )

  async function requestShare(projectId: string) {
    try {
      await api(`/api/projects/${projectId}/request-share`, {
        method: 'POST',
        body: JSON.stringify({ destination: 'family' }),
      })
      setMsg('Đã gửi Ba / Mẹ duyệt chia sẻ!')
      await load()
    } catch {
      setMsg('Chưa gửi được. Con thử lại sau nhé.')
    }
  }

  if (loading) {
    return <PageSkeleton rows={4} />
  }

  return (
    <PageMotion className="flex flex-col gap-6">
      <header className="student-feature-hero important-card-with-hero-mascot ui-card p-5 sm:p-7" data-tone="sun">
        <ImportantCardMascot pose="welcome" className="important-card-mascot--hero" />
        <div className="student-feature-hero-row">
          <div className="max-w-2xl">
            <div className="eyebrow-chip">
              <KidBackpackImageIcon size={22} />
              Bộ sưu tập
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-text sm:text-4xl">Ba lô của con</h1>
            <p className="mt-2 text-base font-semibold leading-relaxed text-muted">
              Quà, tác phẩm và vật phẩm học tập của con đều được cất ở đây.
            </p>
          </div>
        </div>
      </header>
      {msg && (
        <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm text-success">{msg}</p>
      )}
      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      <nav aria-label="Các ngăn trong Ba lô" className="grid gap-3 sm:grid-cols-3">
        {([
          {
            id: 'rewards' as const,
            label: 'Quà của con',
            description: 'Khung, nền và bạn đồng hành',
            count: rewards.length,
            icon: NavBadgeIcon,
          },
          {
            id: 'projects' as const,
            label: 'Tác phẩm',
            description: 'Tranh và truyện con đã làm',
            count: projects.length,
            icon: NavCreativeIcon,
          },
          {
            id: 'learning' as const,
            label: 'Đồ từ bài học',
            description: 'Vật phẩm con nhận ở các trạm',
            count: assets.length,
            icon: NavWorldIcon,
          },
        ]).map((item) => {
          const Icon = item.icon
          const selected = section === item.id
          return (
          <button
            key={item.id}
            type="button"
            aria-current={selected ? 'page' : undefined}
            onClick={() => setSection(item.id)}
            className={`ui-card grid min-h-28 grid-cols-[auto_1fr_auto] items-center gap-3 border-2 p-4 text-left transition-[transform,box-shadow,border-color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:translate-y-0.5 ${
              selected
                ? 'border-brand-500 bg-brand-50 shadow-press'
                : 'border-border bg-white shadow-soft hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-clay'
            }`}
          >
            <span className="student-nav-icon !h-12 !w-12 !rounded-2xl" aria-hidden="true">
              <Icon size={28} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-xl text-text">{item.label}</span>
              <span className="block text-sm font-semibold leading-snug text-muted">{item.description}</span>
            </span>
            <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-white px-2 text-sm font-black text-brand-700 shadow-soft">
              {item.count}
            </span>
          </button>
          )
        })}
      </nav>

      {section === 'rewards' && (
        <section className="ui-card p-5 sm:p-6" aria-labelledby="reward-inventory-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="reward-inventory-title" className="font-display text-2xl">Quà con đã nhận</h2>
              <p className="text-sm text-muted">Chọn “Dùng trên hồ sơ” để thay đổi đồ đang trang bị.</p>
            </div>
            <Link to="/profile" className="min-h-11 rounded-xl px-3 py-2 text-sm font-extrabold text-brand-700">
              Dùng trên hồ sơ
            </Link>
          </div>
          {rewards.length === 0 ? (
            <p className="rounded-2xl bg-brand-50 p-4 text-sm font-bold text-muted">
              Chưa có quà trong ngăn này. Học và hoàn thành Huyền thoại để mở quà nhé!
            </p>
          ) : (
            <div className="flex flex-col gap-7">
              {groupedRewards.map((group) => (
                <section key={group.id} aria-labelledby={`reward-group-${group.id}`}>
                  <div className="mb-3 flex items-end justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <h3 id={`reward-group-${group.id}`} className="font-display text-xl">{group.label}</h3>
                      <p className="text-sm text-muted">{group.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-sm font-black text-brand-700">
                      {group.items.length} món
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {group.items.map((reward) => {
                      const assetUrl = reward.kind === 'title'
                        ? rewardTitleAsset(reward.code)
                        : resolveCatalogRewardAsset({ id: reward.code, assets: reward.assets }, 'thumbnail')
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
                          <h4 className="text-base font-extrabold leading-tight">{reward.name}</h4>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      {section === 'learning' && <section className="ui-card p-5 sm:p-6" aria-labelledby="learning-items-title">
        <div className="mb-3">
          <h2 id="learning-items-title" className="font-display text-2xl">Đồ từ bài học</h2>
          <p className="text-sm text-muted">Những vật phẩm con nhận được khi hoàn thành các trạm.</p>
        </div>
        {assets.length === 0 ? (
          <EmptyState
            compact
            title="Ngăn này còn trống"
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
            {assets.map((a) => (
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

      {section === 'projects' && <section className="ui-card p-5 sm:p-6" aria-labelledby="projects-title">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="projects-title" className="font-display text-2xl">Tác phẩm của con</h2>
            <p className="text-sm text-muted">Tranh và truyện con đã lưu từ Xưởng sáng tạo.</p>
          </div>
          <label className="flex min-h-11 items-center gap-2 font-bold text-text">
            <span className="shrink-0">Xem loại</span>
            <select
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value as ProjectFilter)}
              className="min-h-11 rounded-2xl border border-border bg-white px-3 font-extrabold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {PROJECT_FILTERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({projectCounts[item.id]})
                </option>
              ))}
            </select>
          </label>
        </div>
        {visibleProjects.length === 0 ? (
          <EmptyState
            compact
            title={projectFilter === 'all' ? 'Chưa có tác phẩm' : 'Chưa có tác phẩm loại này'}
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
      </section>}
    </PageMotion>
  )
}
