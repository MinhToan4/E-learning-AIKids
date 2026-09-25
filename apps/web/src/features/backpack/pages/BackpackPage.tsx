import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { REWARD_CATALOG, type RewardKind } from '@/shared/lib/creation/rewards'
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
import {
  profileCardEdgeBackgroundStyle,
  profilePageEdgeBackgroundStyle,
} from '@/features/rewards/profile-backgrounds'
import { profilePageThemeStyle } from '@/features/rewards/student-theme'
import { achievementBadgeAsset } from '@/features/achievements/achievement-badge-assets'
import { useProgression } from '@/shared/lib/progression-query'

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
  unlock?: { type?: string; value?: string | number }
}

function fetchWithTimeout<T>(p: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ])
}

function RewardCardVisual({
  reward,
  assetUrl,
  large = false,
  className = '',
}: {
  reward: { kind?: string; code?: string; name?: string; displayConfig?: any; icon?: string }
  assetUrl?: string
  large?: boolean
  className?: string
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const icon = reward.displayConfig?.icon || reward.icon || '🎁'

  if (reward.kind === 'background' || reward.kind === 'theme') {
    const backgroundStyle = reward.kind === 'background'
      ? profileCardEdgeBackgroundStyle(reward.code)
      : profilePageThemeStyle(reward.code)

    return (
      <div
        className={`relative w-full h-full rounded-xl overflow-hidden border border-black/5 shadow-inner flex items-center justify-center ${className}`}
        style={{ ...backgroundStyle, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {assetUrl && !imgFailed && (
          <img
            src={assetUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
    )
  }

  if (reward.kind === 'frame') {
    return (
      <div className={`relative flex items-center justify-center w-full h-full ${className}`}>
        {assetUrl && !imgFailed ? (
          <img
            src={assetUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain drop-shadow-sm"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className={`flex items-center justify-center rounded-full bg-white shadow-soft ${
              large ? 'w-28 h-28 text-5xl' : 'w-14 h-14 text-2xl'
            }`}
            style={rewardFrameStyle(reward.code || '')}
          >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
              {icon}
            </span>
          </div>
        )}
      </div>
    )
  }

  if (reward.kind === 'title') {
    return (
      <div className={`flex items-center justify-center w-full h-full px-2 ${className}`}>
        {assetUrl && !imgFailed ? (
          <img
            src={assetUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="inline-flex max-w-full items-center justify-center rounded-full border-2 border-sun-300 bg-sun-50 px-3 py-1 text-center text-xs font-black text-sun-800 shadow-sm">
            {reward.name || icon}
          </span>
        )}
      </div>
    )
  }

  if (assetUrl && !imgFailed) {
    return (
      <img
        src={assetUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-contain drop-shadow-sm ${className}`}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <div className={`flex items-center justify-center w-full h-full rounded-xl bg-brand-50 ${className}`}>
      <span className={large ? 'text-6xl' : 'text-3xl'}>{icon}</span>
    </div>
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

type BackpackSection = 'creations' | 'achievements' | 'treasures'
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

function readLocalBackpackWorks(): Project[] {
  let works: Project[] = []
  if (typeof window === 'undefined' || !window.localStorage) return works

  try {
    const raw = localStorage.getItem('aiki_backpack_saved_works')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        works = parsed.map((item: any) => ({
          id: item.id || `bp-${Date.now()}-${Math.random()}`,
          title: item.title || 'Tác phẩm tranh vẽ',
          kind: item.kind || 'image',
          thumbnail: item.url || item.thumbnail || '',
          content: item.prompt || item.content || '',
          shareStatus: item.shareStatus || 'private',
          questId: item.lessonId || item.stationLabel || null,
        }))
      }
    }
  } catch {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('aiki_backpack_items_')) {
        const rawItems = localStorage.getItem(key)
        if (rawItems) {
          const parsed = JSON.parse(rawItems)
          if (Array.isArray(parsed)) {
            const lessonWorks = parsed.map((it: any) => ({
              id: it.id || `lesson-item-${Math.random()}`,
              title: it.lessonTitle ? `Bài học: ${it.lessonTitle}` : 'Ghi chú bài học',
              kind: it.category === 'notebook' ? 'story' : 'image',
              thumbnail: it.url || '',
              content: it.prompt || '',
              shareStatus: 'private',
              questId: it.lessonId || 'lesson',
            }))
            works = [...works, ...lessonWorks.filter((lw) => !works.some((w) => w.id === lw.id))]
          }
        }
      }
    }
  } catch {}

  return works
}

export function BackpackPage() {
  const user = useAuth((state) => state.user)
  const { data: progression } = useProgression(user)
  const progressionLevelRef = useRef(progression?.level ?? user?.level ?? 1)
  progressionLevelRef.current = progression?.level ?? user?.level ?? 1
  const [equipment, setEquipment] = useState<RewardEquipment>(() => readRewardEquipment(user?.id ?? 'guest'))

  useEffect(() => {
    const handleEquipmentChange = () => setEquipment(readRewardEquipment(user?.id ?? 'guest'))
    window.addEventListener('aikids:reward-equipped', handleEquipmentChange)
    return () => {
      window.removeEventListener('aikids:reward-equipped', handleEquipmentChange)
    }
  }, [user?.id])

  const [assets, setAssets] = useState<Asset[]>([])

  const [projects, setProjects] = useState<Project[]>(() =>
    readLocalBackpackWorks().filter((project) => !isRawInternalFile(project.title)),
  )

  const [rewards, setRewards] = useState<GamificationReward[]>([])

  const [achievements, setAchievements] = useState<AchievementRow[]>([])

  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 0ms instant mount: loading=false immediately so user sees their backpack shell instantly!
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const [section, setSection] = useState<BackpackSection>('creations')
  const [sourceFilter, setSourceFilter] = useState<ProjectFilter>('all')
  const [formatFilter, setFormatFilter] = useState<ProjectFormat>('all')

  const [selectedItem, setSelectedItem] = useState<Project | Asset | GamificationReward | null>(null)
  const loadedSections = useRef(new Set<BackpackSection>())

  const loadCreations = useCallback(async () => {
    if (loadedSections.current.has('creations')) return
    projects.length === 0 && assets.length === 0 ? setLoading(true) : setSyncing(true)
    setError(null)
    try {
      const [backpack, projectResult] = await fetchWithTimeout(Promise.all([
        api<{ assets: Asset[] }>('/api/backpack'),
        api<{ projects: Project[] }>('/api/projects'),
      ]))
      const remoteAssets = backpack.assets ?? []
      const remoteProjects = projectResult.projects ?? []
      const localProjects = readLocalBackpackWorks()
      const mergedProjects = [
        ...localProjects,
        ...remoteProjects.filter((remote) => !localProjects.some((local) => local.id === remote.id)),
      ].filter((project) => !isRawInternalFile(project.title))
      setAssets(remoteAssets)
      setProjects(mergedProjects)
      loadedSections.current.add('creations')
    } catch {
      if (projects.length === 0) setError('Một vài ngăn chưa tải được. Con thử lại nhé.')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [assets.length, projects.length])

  const loadAchievements = useCallback(async () => {
    if (loadedSections.current.has('achievements')) return
    setSyncing(true)
    try {
      const result = await fetchWithTimeout(api<{ achievements: AchievementRow[] }>('/api/gamification/achievements'))
      const unlocked = result.achievements?.filter((achievement) => achievement.unlocked) ?? []
      setAchievements(unlocked)
      loadedSections.current.add('achievements')
    } catch {
      if (achievements.length === 0) setError('Huy hiệu chưa tải được. Con thử lại nhé.')
    } finally {
      setSyncing(false)
    }
  }, [achievements.length])

  const loadTreasures = useCallback(async () => {
    if (loadedSections.current.has('treasures')) return
    setSyncing(true)
    try {
      const [inventory, catalog] = await Promise.all([
        fetchWithTimeout(api<{ inventory: Array<{ rewardId: string }> }>('/api/gamification/storybook')),
        fetchWithTimeout(api<{ items: GamificationReward[] }>('/api/gamification/catalog?type=reward')),
      ])
      const level = progressionLevelRef.current
      const owned = new Set((inventory.inventory ?? []).map((item) => item.rewardId))
      const localCatalog: GamificationReward[] = REWARD_CATALOG.map((item) => ({
        code: item.id,
        name: item.name,
        description: item.description,
        kind: item.kind,
        displayConfig: { icon: item.icon },
        unlock: item.unlock,
        assets: {
          assetId: item.id,
          primary: { assetId: item.id, variant: 'primary' as const },
          thumbnail: { assetId: item.id, variant: 'thumbnail' as const },
        },
      }))
      const combined = Array.from(new Map([...localCatalog, ...(catalog.items ?? [])]
        .map((item) => [item.code, item])).values())
      const nextRewards = combined.filter((item) => owned.has(item.code) || (
        item.unlock?.type === 'xp_level' && typeof item.unlock.value === 'number' && item.unlock.value <= level
      ))
      setRewards(nextRewards)
      loadedSections.current.add('treasures')
    } catch {
      if (rewards.length === 0) setError('Bảo bối chưa tải được. Con thử lại nhé.')
    } finally {
      setSyncing(false)
    }
  }, [rewards.length])

  useEffect(() => { void loadCreations() }, [loadCreations])

  useEffect(() => {
    setError(null)
    if (section === 'achievements') void loadAchievements()
    if (section === 'treasures') void loadTreasures()
  }, [loadAchievements, loadTreasures, section])

  useEffect(() => {
    const handleXpUpdate = () => {
      loadedSections.current.delete('treasures')
      if (section === 'treasures') void loadTreasures()
    }
    window.addEventListener('aikids:xp-updated', handleXpUpdate)
    return () => window.removeEventListener('aikids:xp-updated', handleXpUpdate)
  }, [loadTreasures, section])

  const visibleProjects = useMemo(() => {
    return projects.filter((p) => {
      if (sourceFilter === 'lesson' && !isLessonProject(p)) return false
      if (sourceFilter === 'workshop' && isLessonProject(p)) return false
      if (formatFilter !== 'all' && filterFormat(p.kind) !== formatFilter) return false
      return true
    })
  }, [projects, sourceFilter, formatFilter])

  const treasureRewards = rewards.filter((r) =>
    ['event_ticket', 'perk', 'effect'].includes(r.kind) || r.unlock?.type === 'storybook_sticker',
  )
  const equippedTitleLabel = equipment.title
    ? REWARD_CATALOG.find((item) => item.id === equipment.title)?.equipValue
      ?? rewards.find((item) => item.code === equipment.title)?.name
    : undefined

  async function requestShare(projectId: string) {
    try {
      await api(`/api/projects/${projectId}/request-share`, {
        method: 'POST',
        body: JSON.stringify({ destination: 'family' }),
      })
      setMsg('Đã gửi Ba/Mẹ duyệt!')
      await loadCreations()
    } catch {
      setMsg('Chưa gửi được. Thử lại sau nhé.')
    }
  }

  if (loading) return <PageSkeleton rows={4} />

  const companionUrl = equipment?.companion ? getRewardAssetUrl(equipment.companion) : null

  return (
    <PageMotion
      className="flex flex-col gap-6 relative min-h-screen"
    >
      <header
        className="home-profile-banner p-5 sm:p-7 relative overflow-hidden border-4 border-white shadow-clay rounded-3xl"
        style={{
          ...profileCardBackgroundStyle(equipment?.background),
          backgroundPosition: 'center',
        }}
      >
        <div className="home-profile-banner-wash" />

        <div className="absolute right-3 bottom-0 sm:right-8 sm:bottom-0 pointer-events-none z-10 flex items-end">
          {companionUrl ? (
            <img
              src={companionUrl}
              alt=""
              className="max-h-28 sm:max-h-36 w-auto object-contain drop-shadow-md"
            />
          ) : (
            <ImportantCardMascot pose="welcome" className="important-card-mascot--hero drop-shadow-md" />
          )}
        </div>

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
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <h1 className="font-display text-2xl font-extrabold leading-tight text-text sm:text-3xl drop-shadow-sm">
                    Ba lô của con
                  </h1>
                  {equippedTitleLabel && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100/90 text-amber-800 text-xs font-black shadow-sm border border-amber-200">
                      <NavBadgeIcon size={16} aria-hidden /> {equippedTitleLabel}
                    </span>
                  )}
                </div>
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
                <span className="block text-xl font-display text-emerald-600 leading-none">{treasureRewards.length}</span>
                <span className="text-[11px] font-bold text-muted uppercase">Bảo bối</span>
              </div>

              <Link to="/profile" className="sm:ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                <Button className="w-full rounded-2xl shadow-clay !text-sm whitespace-nowrap bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 text-white border-0">
                  🎨 Tủ đồ & Đổi trang trí
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
      {error && <ErrorState message={error} onRetry={() => {
        if (section === 'creations') void loadCreations()
        if (section === 'achievements') {
          loadedSections.current.delete('achievements')
          void loadAchievements()
        }
        if (section === 'treasures') {
          loadedSections.current.delete('treasures')
          void loadTreasures()
        }
      }} inline />}

      <nav aria-label="Các ngăn trong Ba lô" className="grid gap-3 sm:grid-cols-3">
        {[
          { id: 'creations' as const, label: 'Tác phẩm sáng tạo', desc: 'Tranh & Truyện', count: projects.length, icon: NavCreativeIcon },
          { id: 'achievements' as const, label: 'Huy hiệu thành tích', desc: 'Cúp & Kỷ lục', count: achievements.length, icon: NavBadgeIcon },
          { id: 'treasures' as const, label: 'Bảo bối & Kỷ vật', desc: 'Quà phiêu lưu', count: treasureRewards.length, icon: NavWorldIcon },
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
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 id="projects-title" className="font-display text-2xl">Tác phẩm sáng tạo</h2>
              <span className="text-xs font-bold text-muted bg-brand-50 px-3 py-1.5 rounded-full self-start sm:self-auto">
                {visibleProjects.length} / {projects.length} tác phẩm
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-black text-muted uppercase tracking-wider mr-1">Nguồn:</span>
              {[
                { id: 'all' as const, label: 'Tất cả' },
                { id: 'lesson' as const, label: '🏫 Từ Bài học AI' },
                { id: 'workshop' as const, label: '🎨 Từ Xưởng Tự Do / Play AIKid' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSourceFilter(f.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-sm transition-all active:scale-95 ${
                    sourceFilter === f.id
                      ? 'bg-brand-500 text-white shadow-soft scale-[1.02]'
                      : 'bg-white text-muted hover:text-text border border-border'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-muted uppercase tracking-wider mr-1">Loại:</span>
              {[
                { id: 'all' as const, label: 'Tất cả' },
                { id: 'image' as const, label: '🖼️ Tranh ảnh AI' },
                { id: 'comic' as const, label: '📚 Truyện tranh' },
                { id: 'story' as const, label: '✍️ Truyện chữ' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormatFilter(f.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-sm transition-all active:scale-95 ${
                    formatFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-soft scale-[1.02]'
                      : 'bg-white text-muted hover:text-text border border-border'
                  }`}
                >
                  {f.label}
                </button>
              ))}
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
                    <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm ${
                      isLessonProject(p) ? 'bg-emerald-500 text-white' : 'bg-brand-500 text-white'
                    }`}>
                      {isLessonProject(p) ? '🏫 Bài học AI' : '🎨 Play AIKid'}
                    </span>
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

      {section === 'treasures' && (
        <section className="ui-card p-5 sm:p-6 shadow-soft rounded-3xl bg-white">
          <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h2 className="font-display text-2xl">Bảo bối & Kỷ vật</h2>
              <p className="text-xs text-muted font-semibold mt-0.5">
                Các vật phẩm, vé sự kiện và kỷ vật đặc biệt con thu thập được trên hành trình phiêu lưu
              </p>
            </div>
          </div>

          {treasureRewards.length === 0 ? (
            <div className="text-center py-10 bg-brand-50 rounded-2xl p-6">
              <p className="text-base font-extrabold text-brand-800">
                Chưa có bảo bối nào trong ngăn này!
              </p>
              <p className="text-xs text-muted font-bold mt-1">
                Hãy tham gia các sự kiện, hoàn thành thử thách và lật mở Sticker Book để nhận bảo bối nhé.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {treasureRewards.map((r) => {
                const assetUrl = resolveCatalogRewardAsset({ id: r.code, assets: r.assets }, 'thumbnail')
                return (
                  <div
                    key={r.code}
                    className="p-3 bg-white border border-border rounded-2xl shadow-sm cursor-pointer hover:shadow-clay transition-all flex flex-col items-center text-center"
                    onClick={() => setSelectedItem(r)}
                  >
                    <div className="w-20 h-20 bg-emerald-50/70 rounded-2xl flex items-center justify-center p-2 mb-2 overflow-hidden shadow-inner border border-emerald-100">
                      <RewardCardVisual reward={r} assetUrl={assetUrl} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                      {rewardKindLabels[r.kind] || 'Bảo bối'}
                    </span>
                    <h4 className="text-sm font-extrabold leading-tight mt-1 line-clamp-1">{r.name}</h4>
                    <p className="text-xs text-muted line-clamp-2 mt-1">{r.description}</p>
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
            <div className="relative aspect-video bg-brand-50 flex items-center justify-center p-4">
              {'code' in (selectedItem as any) ? (
                <RewardCardVisual
                  reward={selectedItem as any}
                  assetUrl={
                    (selectedItem as any).kind === 'title'
                      ? rewardTitleAsset((selectedItem as any).code)
                      : resolveCatalogRewardAsset(
                          { id: (selectedItem as any).code, assets: (selectedItem as any).assets },
                          'primary',
                        )
                  }
                  large
                  className="w-full h-full object-contain"
                />
              ) : (
                <MediaThumbnail
                  src={(selectedItem as any).thumbnail || ''}
                  kind={(selectedItem as any).kind || 'image'}
                  className="w-full h-full object-contain"
                />
              )}
              <button
                className="absolute top-3 right-3 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center font-bold text-gray-700 shadow-sm hover:bg-white transition-all"
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

              <div className="mt-6 flex flex-wrap gap-3">
                {'id' in (selectedItem as any) && (selectedItem as any).shareStatus === 'private' && (
                  <Button
                    variant="secondary"
                    className="flex-1 rounded-2xl !min-h-12 !text-xs font-black whitespace-nowrap"
                    onClick={() => {
                      requestShare((selectedItem as any).id)
                      setSelectedItem(null)
                    }}
                  >
                    💌 Khoe với Ba Mẹ
                  </Button>
                )}
                {('thumbnail' in (selectedItem as any) || 'url' in (selectedItem as any)) && ((selectedItem as any).thumbnail || (selectedItem as any).url) && (
                  <a
                    href={(selectedItem as any).thumbnail || (selectedItem as any).url}
                    download="kiet-tac-aikids.png"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button variant="secondary" className="w-full rounded-2xl !min-h-12 !text-xs font-black whitespace-nowrap">
                      💾 Tải về máy
                    </Button>
                  </a>
                )}
                <Button className="flex-1 rounded-2xl !min-h-12 !text-xs font-black" onClick={() => setSelectedItem(null)}>
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
