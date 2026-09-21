import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { api, type AchievementRow } from '@/shared/lib/api'
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
import { normalizeGalleryItem } from '@/shared/lib/normalizers/common'
import { useAuth } from '@/shared/store/auth'
import {
  readRewardEquipment,
  profileCardBackgroundStyle,
  rewardFrameStyle,
  getRewardAssetUrl,
  type RewardEquipment,
} from '@/features/rewards/reward-equipment'
import { avatarImage } from '@/shared/config/avatars'
import { profilePageEdgeBackgroundStyle } from '@/features/rewards/profile-backgrounds'
import { achievementBadgeAsset } from '@/features/achievements/achievement-badge-assets'

export const PROJECT_FILTERS = [
  { id: 'all', label: 'Tác phẩm của con' },
  { id: 'learning', label: 'Đồ từ bài học' },
  { id: 'rewards', label: 'Quà con đã nhận' },
  { id: 'profile', label: 'Đồ cho Hồ sơ' },
  { id: 'special', label: 'Vé và quyền đặc biệt' },
]

type Asset = {
  id: string
  type: string
  name: string
  thumbnail: string
  private: boolean
  questId?: string | null
  jobId?: string | null
  createdAt: string
}

type Project = {
  id: string
  title: string
  kind: string
  thumbnail: string
  content?: string
  shareStatus: string
  jobId?: string | null
  questId?: string | null
}

type GamificationReward = {
  code: string
  name: string
  description: string
  kind: RewardKind
  displayConfig?: { icon?: string }
  assets?: RewardCatalogAssets
}

function fetchWithTimeout<T>(p: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ])
}

function RewardThumbnail({ src, onInvalid }: { src: string; onInvalid: () => void }) {
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-full w-full object-contain drop-shadow-sm"
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

type BackpackSection = 'creations' | 'achievements' | 'wardrobe' | 'storybook'
type ProjectFilter = 'all' | 'lesson' | 'workshop'
type ProjectFormat = 'all' | 'image' | 'comic' | 'story'

function isLessonProject(p: Project | Asset) {
  const kindOrType = 'kind' in p ? p.kind : (p as Asset).type
  return Boolean(p.questId) || Boolean(kindOrType?.includes('lesson'))
}

function filterFormat(kind: string): Exclude<ProjectFormat, 'all'> {
  const normalized = kind.toLowerCase()
  if (normalized.includes('comic') || normalized.includes('panel')) return 'comic'
  if (normalized.includes('story') || normalized.includes('text')) return 'story'
  return 'image'
}

function kindLabel(kind: string) {
  const format = filterFormat(kind)
  return format === 'comic' ? 'Truyện tranh' : format === 'story' ? 'Truyện chữ' : 'Ảnh AI & tranh vẽ'
}

function shareStatusLabel(status: string) {
  if (status === 'approved') return 'Đã được duyệt'
  if (status === 'pending') return 'Đang chờ duyệt'
  return 'Chỉ mình con'
}

function isImgUrl(src?: string) {
  if (!src) return false
  return src.startsWith('data:') || src.startsWith('/') || src.startsWith('http')
}

function friendlyProjectTitle(title: string): string {
  if (!title) return 'Tác phẩm của con'
  const clean = title
    .replace(/\.(json|png|jpe?g|webp|gif|mp4)$/i, '')
    .replace(/^storyPlot[-_]?comic[-_]?\d*/i, 'Kịch bản truyện tranh')
    .replace(/^prompt[-_]?schema[-_]?\d*/i, 'Ý tưởng sáng tạo')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return clean || 'Tác phẩm của con'
}

function isRawInternalFile(title: string): boolean {
  if (!title) return false
  const lower = title.toLowerCase()
  if (lower.endsWith('.json')) return true
  if (lower.startsWith('storyplot-comic-') && !lower.includes('paco') && !lower.includes('vet')) {
    return true
  }
  if (lower.startsWith('prompt-schema-')) return true
  return false
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
  const fKind = filterFormat(kind)

  if (!isImgUrl(src) || failed) {
    const fallbackArt = fKind === 'comic'
      ? designerAssets.workshop.comic
      : fKind === 'story'
        ? designerAssets.course.safety
        : null

    if (fallbackArt) {
      return (
        <img
          src={fallbackArt}
          alt=""
          loading="lazy"
          decoding="async"
          className={className}
        />
      )
    }

    const PlaceholderIcon = fKind === 'story' ? NavWorldIcon : NavCreativeIcon
    return (
      <div className={`${className} flex items-center justify-center bg-brand-50 text-brand-700`}>
        <PlaceholderIcon size={36} aria-hidden="true" />
      </div>
    )
  }
  return (
    <img src={src} alt="" loading="lazy" decoding="async" className={className} onError={() => setFailed(true)} />
  )
}

function AchievementBadgeCard({ achievement, idx }: { achievement: AchievementRow; idx: number }) {
  const [imgFailed, setImgFailed] = useState(false)
  const a = achievement as any

  const imageSrc =
    achievementBadgeAsset(a)
    ?? (a.imageUrl?.startsWith('/') || a.imageUrl?.startsWith('http') ? a.imageUrl : null)
    ?? (a.icon?.startsWith('/') || a.icon?.startsWith('http') ? a.icon : null)
    ?? (a.milestones?.find((m: any) => m.iconPath || m.imageUrl)?.iconPath)

  const name = a.name || a.title
  const badgeId = a.id || a.type || `achievement-${idx}`

  return (
    <div key={badgeId} className="flex flex-col items-center text-center p-3 bg-white border border-amber-200 rounded-2xl shadow-sm hover:scale-105 hover:shadow-clay transition-all">
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-2 overflow-hidden shadow-inner border border-amber-100">
        {imageSrc && !imgFailed ? (
          <img
            src={imageSrc}
            onError={() => setImgFailed(true)}
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
            alt=""
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
            <NavBadgeIcon size={36} />
          </div>
        )}
      </div>
      <p className="font-extrabold text-sm leading-tight mt-1">{name}</p>
      <p className="text-xs text-muted mt-1 truncate w-full">{a.description}</p>
    </div>
  )
}

export function BackpackPage() {
  const user = useAuth((state) => state.user)
  const [equipment, setEquipment] = useState<RewardEquipment>(() => readRewardEquipment(user?.id ?? 'guest'))

  useEffect(() => {
    const handleEquipmentChange = () => setEquipment(readRewardEquipment(user?.id ?? 'guest'))
    window.addEventListener('aikids:reward-equipped', handleEquipmentChange)
    window.addEventListener('storage', handleEquipmentChange)
    return () => {
      window.removeEventListener('aikids:reward-equipped', handleEquipmentChange)
      window.removeEventListener('storage', handleEquipmentChange)
    }
  }, [user?.id])

  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const snap = typeof window !== 'undefined' ? localStorage.getItem('aiki_backpack_cache_snapshot') : null
      if (snap) {
        const parsed = JSON.parse(snap)
        return parsed.assets || []
      }
    } catch {}
    return []
  })

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      let merged: Project[] = []
      const snap = typeof window !== 'undefined' ? localStorage.getItem('aiki_backpack_cache_snapshot') : null
      if (snap) merged = JSON.parse(snap).projects || []

      const raw = typeof window !== 'undefined' ? localStorage.getItem('aiki_backpack_saved_works') : null
      if (raw) {
        const saved = JSON.parse(raw).map((item: any) => ({
          id: item.id || `bp-${Date.now()}-${Math.random()}`,
          title: item.title || 'Tác phẩm tranh vẽ',
          kind: 'image',
          thumbnail: item.url || '',
          content: item.prompt || '',
          shareStatus: 'private',
          questId: item.lessonId || item.stationLabel || null,
        }))
        merged = [...saved, ...merged.filter((rp) => !saved.some((lp: any) => lp.id === rp.id))]
      }
      return merged.filter((p) => !isRawInternalFile(p.title))
    } catch {}
    return []
  })

  const [rewards, setRewards] = useState<GamificationReward[]>(() => {
    try {
      const snap = typeof window !== 'undefined' ? localStorage.getItem('aiki_backpack_cache_snapshot') : null
      return snap ? JSON.parse(snap).rewards || [] : []
    } catch {}
    return []
  })

  const [achievements, setAchievements] = useState<AchievementRow[]>(() => {
    try {
      const snap = typeof window !== 'undefined' ? localStorage.getItem('aiki_backpack_cache_snapshot') : null
      return snap ? JSON.parse(snap).achievements || [] : []
    } catch {}
    return []
  })

  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 0ms instant mount: loading=false immediately so user sees their backpack shell instantly!
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const [section, setSection] = useState<BackpackSection>('creations')
  const [sourceFilter, setSourceFilter] = useState<ProjectFilter>('all')
  const [formatFilter, setFormatFilter] = useState<ProjectFormat>('all')

  const [selectedItem, setSelectedItem] = useState<Project | Asset | GamificationReward | null>(null)

  const load = useCallback(async () => {
    if (assets.length === 0 && projects.length === 0 && rewards.length === 0 && achievements.length === 0) {
      setLoading(true)
    } else {
      setSyncing(true)
    }
    setError(null)

    try {
      const [galleryResult, inventoryResult, catalogResult, achievementsResult] = await Promise.allSettled([
        fetchWithTimeout(api<{ items?: any[] }>('/api/v1/media/gallery')).catch(async () => {
          const [b, p] = await Promise.all([
            fetchWithTimeout(api<{ assets: Asset[] }>('/api/backpack')).catch(() => ({ assets: [] })),
            fetchWithTimeout(api<{ projects: Project[] }>('/api/projects')).catch(() => ({ projects: [] })),
          ])
          return { _mockFallback: true, assets: b.assets || [], projects: p.projects || [] }
        }),
        fetchWithTimeout(api<{ inventory: Array<{ rewardId: string }> }>('/api/gamification/storybook')),
        fetchWithTimeout(api<{ items: GamificationReward[] }>('/api/gamification/catalog?type=reward')),
        fetchWithTimeout(api<{ achievements: AchievementRow[] }>('/api/gamification/achievements')),
      ])

      let remoteAssets: Asset[] = []
      let remoteProjects: Project[] = []
      let loadedRewards: GamificationReward[] = []
      let loadedAchievements: AchievementRow[] = []

      if (galleryResult.status === 'fulfilled') {
        const val = galleryResult.value as any
        if (val._mockFallback) {
          remoteAssets = val.assets
          remoteProjects = val.projects
        } else {
          const items = val.items || []
          remoteAssets = items.flatMap((row: any) => {
            const item = normalizeGalleryItem(row)
            if (item.isProject) return []
            return [{
              id: item.id,
              type: item.kind,
              name: item.title,
              thumbnail: item.url,
              private: true,
              questId: item.questId,
              jobId: item.jobId,
              createdAt: item.createdAt,
            }]
          })
          remoteProjects = items.flatMap((row: any) => {
            const item = normalizeGalleryItem(row)
            if (!item.isProject || isRawInternalFile(item.title)) return []
            return [{
              id: item.id,
              title: item.title,
              kind: item.kind,
              thumbnail: item.url,
              content: item.content,
              shareStatus: item.shareStatus,
              jobId: item.jobId,
              questId: item.questId,
            }]
          })
        }
      }

      let savedLocalProjects: Project[] = []
      try {
        const raw = localStorage.getItem('aiki_backpack_saved_works')
        if (raw) {
          savedLocalProjects = JSON.parse(raw).map((item: any) => ({
            id: item.id || `bp-${Date.now()}-${Math.random()}`,
            title: item.title || 'Tác phẩm tranh vẽ',
            kind: 'image',
            thumbnail: item.url || '',
            content: item.prompt || '',
            shareStatus: 'private',
            questId: item.lessonId || item.stationLabel || null,
          }))
        }
      } catch {}

      const mergedProjects = [
        ...savedLocalProjects,
        ...remoteProjects.filter((rp) => !savedLocalProjects.some((lp) => lp.id === rp.id)),
      ].filter((p) => !isRawInternalFile(p.title))

      if (inventoryResult.status === 'fulfilled' && catalogResult.status === 'fulfilled') {
        const owned = new Set((inventoryResult.value?.inventory ?? []).map((item) => item.rewardId))
        loadedRewards = displayableRewardInventory(
          (catalogResult.value?.items ?? []).filter((item) => owned.has(item.code)),
        )
      }

      if (achievementsResult.status === 'fulfilled') {
        loadedAchievements = achievementsResult.value?.achievements?.filter((a) => a.unlocked) || []
      }

      setAssets(remoteAssets)
      setProjects(mergedProjects)
      setRewards(loadedRewards)
      setAchievements(loadedAchievements)

      try {
        localStorage.setItem(
          'aiki_backpack_cache_snapshot',
          JSON.stringify({
            assets: remoteAssets,
            projects: mergedProjects,
            rewards: loadedRewards,
            achievements: loadedAchievements,
          }),
        )
      } catch {}

      const rejected = [galleryResult, inventoryResult, catalogResult, achievementsResult].find(
        (r) => r.status === 'rejected',
      )
      if (rejected && mergedProjects.length === 0 && loadedRewards.length === 0) {
        setError('Một vài ngăn chưa tải được. Con thử lại nhé.')
      }
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [achievements.length, assets.length, projects.length, rewards.length])

  useEffect(() => {
    void load()
  }, [load])

  const visibleProjects = useMemo(() => {
    return projects.filter((p) => {
      if (sourceFilter === 'lesson' && !isLessonProject(p)) return false
      if (sourceFilter === 'workshop' && isLessonProject(p)) return false
      if (formatFilter !== 'all' && filterFormat(p.kind) !== formatFilter) return false
      return true
    })
  }, [projects, sourceFilter, formatFilter])

  const wardrobeRewards = rewards.filter((r) =>
    ['avatar', 'frame', 'theme', 'title', 'companion', 'effect', 'background'].includes(r.kind),
  )
  const storybookRewards = rewards.filter((r) => ['event_ticket', 'perk'].includes(r.kind))

  async function requestShare(projectId: string) {
    try {
      await api(`/api/projects/${projectId}/request-share`, {
        method: 'POST',
        body: JSON.stringify({ destination: 'family' }),
      })
      setMsg('Đã gửi Ba/Mẹ duyệt!')
      await load()
    } catch {
      setMsg('Chưa gửi được. Thử lại sau nhé.')
    }
  }

  if (loading) return <PageSkeleton rows={4} />

  const companionUrl = equipment?.companion ? getRewardAssetUrl(equipment.companion) : null

  return (
    <PageMotion
      className="flex flex-col gap-6 relative min-h-screen"
      style={profilePageEdgeBackgroundStyle(equipment?.theme || equipment?.background)}
    >
      <header
        className="home-profile-banner p-5 sm:p-7 relative overflow-hidden"
        style={{
          ...profileCardBackgroundStyle(equipment?.background),
          backgroundPosition: 'center',
        }}
      >
        <div className="home-profile-banner-wash" />

        {companionUrl ? (
          <img
            src={companionUrl}
            alt=""
            className="important-card-mascot--hero z-10 drop-shadow-md"
          />
        ) : (
          <ImportantCardMascot pose="welcome" className="important-card-mascot--hero z-10 drop-shadow-md" />
        )}

        <div className="student-feature-hero-row relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="relative shrink-0 flex items-center justify-center rounded-full p-1 shadow-soft"
                style={rewardFrameStyle(equipment?.frame)}
              >
                <img
                  src={avatarImage(user?.avatarId) || designerAssets.brand.mascot}
                  alt=""
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-inner bg-white"
                />
              </div>
              <div>
                <div className="eyebrow-chip inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 text-brand-800 font-extrabold shadow-soft text-xs sm:text-sm">
                  <KidBackpackImageIcon size={20} /> Kho báu của con
                </div>
                <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight text-text sm:text-3xl drop-shadow-sm">
                  Ba lô của con
                </h1>
              </div>
            </div>

            {/* Treasure Stats Strip */}
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <div className="bg-white/85 rounded-2xl px-3.5 py-2 shadow-sm border border-white/60 backdrop-blur-sm">
                <span className="block text-xl font-display text-brand-700 leading-none">{projects.length}</span>
                <span className="text-[11px] font-bold text-muted uppercase">Tác phẩm</span>
              </div>
              <div className="bg-white/85 rounded-2xl px-3.5 py-2 shadow-sm border border-white/60 backdrop-blur-sm">
                <span className="block text-xl font-display text-amber-600 leading-none">{achievements.length}</span>
                <span className="text-[11px] font-bold text-muted uppercase">Huy hiệu</span>
              </div>
              <div className="bg-white/85 rounded-2xl px-3.5 py-2 shadow-sm border border-white/60 backdrop-blur-sm">
                <span className="block text-xl font-display text-fuchsia-600 leading-none">{wardrobeRewards.length}</span>
                <span className="text-[11px] font-bold text-muted uppercase">Ngoại trang</span>
              </div>

              <Link to="/profile" className="sm:ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                <Button className="w-full rounded-2xl shadow-clay !text-sm whitespace-nowrap bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 text-white border-0">
                  🎨 Đổi trang trí ba lô & hồ sơ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {syncing && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-white px-4 py-2 rounded-full text-sm font-bold shadow-clay border-2 border-brand-200 text-brand-600 flex items-center gap-2">
          <span>🔄</span> Đang đồng bộ...
        </div>
      )}

      {msg && <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm text-success font-bold">{msg}</p>}
      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      <nav aria-label="Các ngăn trong Ba lô" className="grid gap-3 sm:grid-cols-4">
        {[
          { id: 'creations' as const, label: 'Tác phẩm', desc: 'Tranh & Truyện', count: projects.length, icon: NavCreativeIcon },
          { id: 'achievements' as const, label: 'Huy hiệu', desc: 'Thành tựu', count: achievements.length, icon: NavBadgeIcon },
          { id: 'wardrobe' as const, label: 'Ngoại trang', desc: 'Đồ trang trí', count: wardrobeRewards.length, icon: NavBadgeIcon },
          { id: 'storybook' as const, label: 'Kỷ vật', desc: 'Quà sự kiện', count: storybookRewards.length, icon: NavWorldIcon },
        ].map((item) => {
          const Icon = item.icon
          const selected = section === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`ui-card flex flex-col items-center gap-2 p-4 text-center min-h-[120px] transition-all focus-visible:outline-focus ${
                selected
                  ? 'border-brand-500 bg-brand-50 shadow-press scale-[0.98]'
                  : 'border-border bg-white shadow-soft hover:-translate-y-1 hover:shadow-clay'
              }`}
            >
              <span
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  selected ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-600'
                }`}
              >
                <Icon size={24} />
              </span>
              <span className="min-w-0 flex flex-col items-center">
                <span className="font-display text-lg text-text leading-tight">{item.label}</span>
                <span className="text-xs font-semibold text-muted">{item.count} món</span>
              </span>
            </button>
          )
        })}
      </nav>

      {section === 'creations' && (
        <section className="ui-card p-5 sm:p-6 shadow-soft rounded-3xl bg-white" aria-labelledby="projects-title">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="projects-title" className="font-display text-2xl">Tác phẩm sáng tạo</h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as ProjectFilter)}
                className="min-h-12 rounded-2xl border-2 border-border bg-white px-4 font-extrabold text-sm shadow-sm focus-visible:outline-brand-500"
              >
                <option value="all">Mọi nguồn</option>
                <option value="lesson">Từ Bài học AI</option>
                <option value="workshop">Từ Xưởng sáng tạo</option>
              </select>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as ProjectFormat)}
                className="min-h-12 rounded-2xl border-2 border-border bg-white px-4 font-extrabold text-sm shadow-sm focus-visible:outline-brand-500"
              >
                <option value="all">Mọi định dạng</option>
                <option value="image">Tranh ảnh AI</option>
                <option value="comic">Truyện tranh</option>
                <option value="story">Truyện chữ</option>
              </select>
            </div>
          </div>

          {visibleProjects.length === 0 ? (
            <EmptyState
              compact
              title="Chưa có tác phẩm nào ở đây"
              description="Hãy vào Xưởng hoặc Học bài để tạo tác phẩm nhé!"
              imageSrc={designerAssets.workshop.comic}
              action={
                <Link to="/home">
                  <Button>Bắt đầu ngay</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((p) => (
                <div
                  key={p.id}
                  className="ui-card flex flex-col overflow-hidden shadow-sm hover:shadow-clay transition-shadow cursor-pointer"
                  onClick={() => setSelectedItem(p)}
                >
                  <div className="h-40 bg-brand-50 relative overflow-hidden">
                    <MediaThumbnail src={p.thumbnail} kind={p.kind} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="font-extrabold text-base truncate">{p.title || friendlyProjectTitle(p.title)}</p>
                    <p className="text-xs text-muted font-semibold mt-1">
                      {kindLabel(p.kind)} • {shareStatusLabel(p.shareStatus)}
                    </p>
                    <div className="mt-auto pt-3">
                      {p.shareStatus === 'private' && (
                        <Button
                          className="w-full !min-h-10 !text-xs rounded-xl"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            requestShare(p.id)
                          }}
                        >
                          Xin chia sẻ
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {section === 'achievements' && (
        <section className="ui-card p-5 sm:p-6 shadow-soft rounded-3xl bg-white">
          <h2 className="font-display text-2xl mb-4">Huy hiệu thành tựu</h2>
          {achievements.length === 0 ? (
            <p className="text-sm font-bold text-muted p-4 bg-brand-50 rounded-2xl">
              Con chưa có huy hiệu nào. Hãy tiếp tục cố gắng nhé!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {achievements.map((a, idx) => (
                <AchievementBadgeCard
                  key={(a as any).id || a.type || `achievement-${idx}`}
                  achievement={a}
                  idx={idx}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {section === 'wardrobe' && (
        <section className="ui-card p-5 sm:p-6 shadow-soft rounded-3xl bg-white">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-display text-2xl">Ngoại trang & Phụ kiện</h2>
            <Link to="/profile">
              <Button variant="secondary" className="rounded-xl !min-h-10">
                Dùng trên hồ sơ
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {wardrobeRewards.map((r) => {
              const assetUrl =
                r.kind === 'title'
                  ? rewardTitleAsset(r.code)
                  : resolveCatalogRewardAsset({ id: r.code, assets: r.assets }, 'thumbnail')
              return (
                <div
                  key={r.code}
                  className="p-3 bg-white border border-border rounded-2xl shadow-sm cursor-pointer hover:shadow-clay"
                  onClick={() => setSelectedItem(r)}
                >
                  <div className="aspect-square bg-fuchsia-50 rounded-xl flex items-center justify-center p-2">
                    {assetUrl && <RewardThumbnail src={assetUrl} onInvalid={() => {}} />}
                  </div>
                  <p className="mt-2 text-[10px] font-black uppercase text-fuchsia-600">{rewardKindLabels[r.kind]}</p>
                  <h4 className="text-sm font-extrabold leading-tight mt-0.5">{r.name}</h4>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {section === 'storybook' && (
        <section className="ui-card p-5 sm:p-6 shadow-soft rounded-3xl bg-white">
          <h2 className="font-display text-2xl mb-4">Kỷ vật huyền thoại</h2>
          {storybookRewards.length === 0 ? (
            <p className="text-sm font-bold text-muted p-4 bg-brand-50 rounded-2xl">
              Chưa có kỷ vật nào. Tham gia sự kiện để nhận nhé!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {storybookRewards.map((r) => {
                const assetUrl = resolveCatalogRewardAsset({ id: r.code, assets: r.assets }, 'thumbnail')
                return (
                  <div key={r.code} className="flex gap-3 p-3 bg-white border border-border rounded-2xl shadow-sm items-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex-shrink-0 flex items-center justify-center p-1">
                      {assetUrl && <RewardThumbnail src={assetUrl} onInvalid={() => {}} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold">{r.name}</h4>
                      <p className="text-xs text-muted line-clamp-2 mt-1">{r.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div className="bg-white w-full max-w-md rounded-3xl shadow-clay overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video bg-brand-50">
              <MediaThumbnail
                src={
                  (selectedItem as any).thumbnail ||
                  resolveCatalogRewardAsset(
                    { id: (selectedItem as any).code, assets: (selectedItem as any).assets },
                    'thumbnail',
                  ) ||
                  ''
                }
                kind={(selectedItem as any).kind || 'image'}
                className="w-full h-full object-contain"
              />
              <button
                className="absolute top-3 right-3 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center font-bold text-gray-700 shadow-sm"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl">{(selectedItem as any).title || (selectedItem as any).name}</h3>
              <p className="text-sm text-muted mt-2">
                {(selectedItem as any).content ||
                  (selectedItem as any).description ||
                  'Một vật phẩm tuyệt vời trong ba lô của con.'}
              </p>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1 rounded-2xl" onClick={() => setSelectedItem(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageMotion>
  )
}
