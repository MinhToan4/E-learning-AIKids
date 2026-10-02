import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  Flame,
  Clock,
  Compass,
  Star,
  Trophy,
  Award,
  TrendingUp,
  Sparkles,
  BookOpen,
  Palette,
  GraduationCap,
  ShieldCheck,
  Image,
} from 'lucide-react'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
import { designerAssets } from '@/shared/config/assets'

import { STORYBOOK_PAGES, type StorybookPage } from '@/features/storybook/storybook-data'
import { safeChapterColors, uniqueRewardIds, uniqueStorybookIds } from '@/features/storybook/storybook-contract'
import { achievementBadgeAsset } from '@/features/achievements/achievement-badge-assets'
import { api, type AchievementRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import {
  readRewardEquipment,
  rewardEquipmentFromRows,
  syncRewardEquipment,
} from '@/features/rewards/reward-equipment'
import {
  DEFAULT_COMMUNITY_SETTINGS,
  readCommunitySettings,
  saveCommunitySettings,
  type Audience,
  type ProfileModule,
} from '@/features/community/community-store'
import { AvatarPickerModal } from '../components/AvatarPickerModal'
import { ProfileHeaderCard } from '../components/ProfileHeaderCard'
import { ProfileStatsGrid } from '../components/ProfileStatsGrid'
import type { ProfileAvatar, ShowcaseProject } from '../profile-showcase'
import { updateMyProfileAvatar } from '@/shared/lib/media-api'
import {
  explorerLevelProgress,
  nextExplorerLevel,
  xpRequiredForLevel,
} from '@/shared/lib/creation/xp-levels'
import {
  loadProfileOverview,
  loadProfileAppearance,
  type ProfileEquipmentRow,
  type PublicProfileSettings,
} from '../profile-overview-api'
import { useProgression } from '@/shared/lib/progression-query'
import { CourseCertificateModal } from '@/features/lesson/components/CourseCertificateModal'
import {
  getBackpackCertificates,
  isCertificateClaimed,
  type BackpackCertificate,
} from '@/features/backpack/lib/backpack-certificates'
import { learningApi, type LearningPathwayCourse } from '@/shared/lib/learning-api'
import { flushPendingSyncQueue } from '@/shared/lib/learning-sync-store'

const BookSpread = lazy(() =>
  import('@/features/storybook/components/BookSpread').then((module) => ({ default: module.BookSpread })),
)
const RewardCollection = lazy(() =>
  import('@/features/rewards/RewardCollection').then((module) => ({ default: module.RewardCollection })),
)

export interface CertificateItem {
  id: string
  title: string
  courseTitle: string
  islandTitle: string
  stationsCount: number
  completedStations: number
  stars: number
  xp: number
  isUnlocked: boolean
  statusText: string
}

/**
 * Bộ lọc loại bỏ 100% file rác nội bộ, draft hỏng hoặc file không có hình ảnh hiển thị hợp lệ
 */
export function isCleanDisplayableWork(project: { title?: string; thumbnail?: string }): boolean {
  if (!project) return false
  const title = (project.title || '').trim()
  if (!title) return false

  const lowerTitle = title.toLowerCase()
  if (lowerTitle.endsWith('.json')) return false
  if (/storyplot[-_\s]?comic/i.test(lowerTitle)) return false
  if (/prompt[-_\s]?schema/i.test(lowerTitle)) return false
  if (/^temp[-_\s]|draft[-_\s]|untitled[-_\s]internal/i.test(lowerTitle)) return false

  const thumb = (project.thumbnail || '').trim()
  if (!thumb) return false
  if (thumb.endsWith('.json')) return false
  const isImageLike =
    thumb.startsWith('data:image/') ||
    thumb.startsWith('blob:') ||
    thumb.startsWith('http://') ||
    thumb.startsWith('https://') ||
    thumb.startsWith('/') ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(thumb)
  if (!isImageLike) return false

  return true
}

/**
 * Chuyển tên tác phẩm thành tiếng Việt thân thiện, trong sáng cho học sinh
 */
export function friendlyProjectTitle(title: string): string {
  if (!title) return 'Tác phẩm của con'
  const clean = title
    .replace(/\.(json|png|jpe?g|webp|gif|mp4)$/i, '')
    .replace(/^storyPlot[-_\s]?comic[-_\s]?\d*/i, 'Truyện tranh')
    .replace(/^prompt[-_\s]?schema[-_\s]?\d*/i, 'Ý tưởng sáng tạo')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return clean || 'Tác phẩm của con'
}

function getWorkTypePill(kind?: string) {
  const k = (kind || '').toLowerCase()
  if (k.includes('comic') || k.includes('panel')) {
    return {
      label: 'Truyện tranh',
      className: 'border-amber-200/80 bg-amber-50 text-amber-800',
    }
  }
  if (k.includes('story') || k.includes('text') || k.includes('writing')) {
    return {
      label: 'Truyện chữ',
      className: 'border-emerald-200/80 bg-emerald-50 text-emerald-800',
    }
  }
  return {
    label: 'Tranh vẽ',
    className: 'border-sky-200/80 bg-sky-50 text-sky-800',
  }
}

function ProjectThumbnail({ project }: { project: ShowcaseProject }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!project.thumbnail || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-brand-50/80 text-brand-700 font-display font-black text-xs uppercase tracking-wider select-none">
        Tranh của con
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-brand-50/50">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-brand-50 via-white/80 to-brand-50" />
      )}
      <img
        src={project.thumbnail}
        alt={friendlyProjectTitle(project.title)}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.03] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

export type ProfileTabSection = 'progress' | 'certificates' | 'storybook' | 'memories' | 'customize'

export function ProfilePage() {
  const user = useAuth((state) => state.user)
  const { data: progression } = useProgression(user)
  // Never paint learner stats from a previous render or browser cache. The
  // Hub aggregate is the first authoritative snapshot for this child.
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ProfileTabSection>('progress')
  const [storybookPageIndex, setStorybookPageIndex] = useState(0)
  const [earnedStickerIds, setEarnedStickerIds] = useState<string[]>([])
  const [ownedRewardIds, setOwnedRewardIds] = useState<string[]>([])
  const [studioChapters, setStudioChapters] = useState<Array<{
    code: string
    name: string
    description: string
    content?: {
      slug?: string
      story?: string
      group?: StorybookPage['group']
      stickers?: StorybookPage['stickers']
      rewardId?: string
      buttonAssets?: StorybookPage['buttonAssets']
    }
    displayConfig?: {
      colors?: [string, string]
      emoji?: string
      coverUrl?: string
      leftBackgroundUrl?: string
      stickerPageUrl?: string
      stickerSheetUrl?: string
      themeKey?: string
    }
    assets?: {
      completionMedia?: StorybookPage['completionMedia']
    }
  }>>([])
  const [storybookNotice, setStorybookNotice] = useState('')

  const loadStorybook = useCallback(async () => {
    try {
      const data = await api<{
        earnedStickerIds?: string[]
        inventory?: Array<{ rewardId: string }>
        studio?: { chapters?: typeof studioChapters }
      }>(
        '/api/gamification/storybook',
      )
      setEarnedStickerIds(uniqueStorybookIds(
        Array.isArray(data.earnedStickerIds) ? data.earnedStickerIds : [],
      ))
      setOwnedRewardIds(uniqueRewardIds(
        Array.isArray(data.inventory) ? data.inventory.map((item) => item?.rewardId) : [],
      ))
      setStudioChapters(Array.isArray(data.studio?.chapters) ? data.studio.chapters : [])
      setStorybookNotice('')
    } catch {
      setStorybookNotice('Chưa đồng bộ được tiến trình. Cuốn sách vẫn mở để con khám phá.')
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'storybook') {
      void loadStorybook()
    }
  }, [activeTab, loadStorybook])

  const storybookEarned = useMemo(() => new Set(earnedStickerIds), [earnedStickerIds])
  const storybookOwnedRewards = useMemo(() => new Set(ownedRewardIds), [ownedRewardIds])
  const storybookPages = useMemo(() => {
    const basePages = STORYBOOK_PAGES.map((page): StorybookPage => {
      const override = studioChapters.find((item) =>
        item.content?.slug?.toUpperCase() === page.slug || item.code.toUpperCase() === page.slug)
      if (!override) return page
      return {
        ...page,
        title: override.name || page.title,
        story: override.content?.story || override.description || page.story,
        group: override.content?.group || page.group,
        stickers: override.content?.stickers?.length === 9 ? override.content.stickers : page.stickers,
        emoji: override.displayConfig?.emoji || page.emoji,
        colors: safeChapterColors(override.displayConfig?.colors, page.colors),
        coverUrl: override.displayConfig?.coverUrl || page.coverUrl,
        leftBackgroundUrl: override.displayConfig?.leftBackgroundUrl || page.leftBackgroundUrl,
        stickerPageUrl: override.displayConfig?.stickerPageUrl || page.stickerPageUrl,
        stickerSheetUrl: override.displayConfig?.stickerSheetUrl || page.stickerSheetUrl,
        rewardId: override.content?.rewardId || page.rewardId,
        themeKey: override.displayConfig?.themeKey || page.themeKey,
        buttonAssets: override.content?.buttonAssets || page.buttonAssets,
        completionMedia: override.assets?.completionMedia || page.completionMedia,
      }
    })
    const existingSlugs = new Set(basePages.map((page) => page.slug))
    const addedPages = studioChapters.flatMap((item): StorybookPage[] => {
      const slug = item.content?.slug?.toUpperCase() || item.code.toUpperCase()
      if (existingSlugs.has(slug) || !item.content?.story || item.content.stickers?.length !== 9) return []
      return [{
        slug,
        title: item.name,
        story: item.content.story,
        group: item.content.group || 'learning',
        stickers: item.content.stickers,
        emoji: item.displayConfig?.emoji || '📖',
        colors: safeChapterColors(item.displayConfig?.colors, ['#4338CA', '#F59E0B']),
        coverUrl: item.displayConfig?.coverUrl,
        leftBackgroundUrl: item.displayConfig?.leftBackgroundUrl,
        stickerPageUrl: item.displayConfig?.stickerPageUrl,
        stickerSheetUrl: item.displayConfig?.stickerSheetUrl,
        rewardId: item.content?.rewardId,
        themeKey: item.displayConfig?.themeKey,
        buttonAssets: item.content?.buttonAssets,
        completionMedia: item.assets?.completionMedia,
      }]
    })
    return [...basePages, ...addedPages]
  }, [studioChapters])
  const currentStorybookPage = storybookPages[storybookPageIndex] || storybookPages[0]
  const storybookPublishedStickerIds = useMemo(
    () => new Set(storybookPages.flatMap((page) => page.stickers.map((sticker) => sticker.id))),
    [storybookPages],
  )
  const storybookPublishedEarnedCount = useMemo(
    () => earnedStickerIds.filter((id) => storybookPublishedStickerIds.has(id)).length,
    [earnedStickerIds, storybookPublishedStickerIds],
  )
  const [selectedCertificateForModal, setSelectedCertificateForModal] = useState<CertificateItem | null>(null)
  const [backpackCertificates, setBackpackCertificates] = useState<BackpackCertificate[]>(() =>
    getBackpackCertificates(user?.id)
  )

  useEffect(() => {
    setBackpackCertificates(getBackpackCertificates(user?.id))
    const handleClaimed = () => {
      setBackpackCertificates(getBackpackCertificates(user?.id))
    }
    window.addEventListener('aikids:certificate-claimed', handleClaimed)
    return () => window.removeEventListener('aikids:certificate-claimed', handleClaimed)
  }, [user?.id])
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [streak, setStreak] = useState(0)
  const [achievements, setAchievements] = useState<AchievementRow[]>([])
  const [projects, setProjects] = useState<ShowcaseProject[]>([])
  const [completedStations, setCompletedStations] = useState(0)
  const [starsCollected, setStarsCollected] = useState(0)
  const [pathwayCourses, setPathwayCourses] = useState<LearningPathwayCourse[]>([])
  const [profileSlug, setProfileSlug] = useState<string | null>(null)
  const [profileAppearance, setProfileAppearance] = useState({
    themeKey: null as string | null,
    frameKey: null as string | null,
    backgroundKey: null as string | null,
  })
  const [avatarChoices, setAvatarChoices] = useState<ProfileAvatar[]>([])
  const [overviewXp, setOverviewXp] = useState<number | null>(null)
  const [overviewLevel, setOverviewLevel] = useState<number | null>(null)
  const explorerXp = progression?.totalXp ?? overviewXp ?? user?.xp ?? 0
  const explorerLevel = progression?.level ?? overviewLevel ?? user?.level ?? 1
  const [equipment, setEquipment] = useState(() =>
    user ? readRewardEquipment(user.id) : {},
  )
  const [wardrobeBootstrap, setWardrobeBootstrap] = useState<{
    ownedRewardIds: string[]
    equipment: ProfileEquipmentRow[]
  } | null>(null)
  const equipmentMutationVersion = useRef(0)
  const [sharing, setSharing] = useState(() =>
    user ? readCommunitySettings(user.id) : DEFAULT_COMMUNITY_SETTINGS,
  )

  useEffect(() => {
    let active = true
    const loadVersion = equipmentMutationVersion.current

    setLoading(true)
    setCompletedStations(0)
    setStarsCollected(0)
    setPathwayCourses([])

    const applyPathwayData = (courses: LearningPathwayCourse[]) => {
      setPathwayCourses(courses)
      const serverComp = courses.reduce((acc, c) => acc + (c.completedCount ?? 0), 0)
      const serverStars = courses.reduce((acc, c) => acc + (c.totalStars ?? 0), 0)

      // Server projections are the SSOT. The owner-scoped offline queue is
      // only a transport mechanism and must never award final progress here.
      setCompletedStations(serverComp)
      setStarsCollected(serverStars)
    }

    const loadAuthoritativeOverview = () => {
      // Offline replay must not block the first profile paint. Reconcile the
      // pathway once replay finishes, while the aggregate request runs now.
      // A successful replay emits `aikids:lesson-completed`, which triggers
      // the authoritative pathway reconciliation below.
      void flushPendingSyncQueue(user?.id).catch(() => undefined)
      // Storybook owns inventory/equipment. Loading it in the same Hub fan-out
      // removes the delayed second request when the child opens “Trang trí”.
      return loadProfileOverview(api, 3500, false, true, true, true, true)
    }

    loadAuthoritativeOverview()
      .then((overview) => {
        if (!active) return
        setStreak(overview.streak)
        setAchievements(overview.achievements.filter((row) => row.unlocked))
        const cleanProjects = (overview.projects ?? []).filter(isCleanDisplayableWork)
        setProjects(cleanProjects)
        setAvatarChoices(overview.avatarChoices
          .filter((asset) => asset.thumbnail)
          .map((asset) => ({
            id: asset.id,
            url: asset.thumbnail,
            label: asset.name,
            source: asset.type.includes('generated') ? 'generated' : 'library',
          })))

        if (typeof overview.totalXp === 'number') {
          setOverviewXp(overview.totalXp)
        }
        if (typeof overview.level === 'number' && overview.level > 0) {
          setOverviewLevel(overview.level)
        }

        const profileSettings = overview.profileSettings
        const serverRows = overview.equipment
        const storybook = overview.storybook
        if (storybook) {
          const storybookInventory = Array.isArray(storybook?.inventory) ? storybook.inventory : []
          setWardrobeBootstrap({
            ownedRewardIds: storybookInventory.map((item) => item.rewardId),
            equipment: serverRows,
          })
          setEarnedStickerIds(uniqueStorybookIds(
            Array.isArray(storybook?.earnedStickerIds) ? storybook.earnedStickerIds : [],
          ))
          setOwnedRewardIds(uniqueRewardIds(storybookInventory.map((item) => item.rewardId)))
          setStudioChapters(Array.isArray(storybook?.studio?.chapters)
            ? storybook.studio.chapters as typeof studioChapters
            : [])
          setStorybookNotice('')
        }

        if (profileSettings) {
          setProfileSlug(profileSettings.slug)
          setProfileAppearance({
            themeKey: profileSettings.themeKey ?? null,
            frameKey: profileSettings.frameKey ?? null,
            backgroundKey: profileSettings.backgroundKey ?? null,
          })
          const visibility = new Set(profileSettings.visibility ?? [])
          const modules = new Set(profileSettings.modules ?? [])
          setSharing((current) => {
            const next = {
              ...current,
              profile: {
                friends: visibility.has('friends'),
                family: visibility.has('family'),
                school: visibility.has('school'),
              },
              modules: {
                storybook: modules.has('storybook'),
                progress: modules.has('progress'),
                achievements: modules.has('achievements'),
                works: modules.has('works'),
                friends: modules.has('friends'),
                activity: modules.has('activity'),
              },
            }
            if (user) saveCommunitySettings(user.id, next)
            return next
          })
        }
        if (user && equipmentMutationVersion.current === loadVersion) {
          setEquipment(syncRewardEquipment(user.id, rewardEquipmentFromRows(serverRows)))
        }

        const pw = overview.pathway
        if (pw && Array.isArray(pw.courses) && pw.courses.length > 0) {
          applyPathwayData(pw.courses)
        } else {
          learningApi.getPathway()
            .then((res) => {
              if (active && res?.courses && res.courses.length > 0) {
                applyPathwayData(res.courses)
              }
            })
            .catch(() => undefined)
        }
      })
      .catch(async () => {
        if (!active) return
        try {
          const [streakRes, achRes, projRes, appearanceRes, pathwayRes] = await Promise.allSettled([
            api<{ current?: number }>('/api/gamification/streak'),
            api<{ achievements?: AchievementRow[] }>('/api/gamification/achievements'),
            api<{ projects?: ShowcaseProject[] }>('/api/projects'),
            loadProfileAppearance(api, 3500),
            learningApi.getPathway().catch(() => null),
          ])
          if (!active) return
          if (streakRes.status === 'fulfilled' && streakRes.value?.current !== undefined) {
            setStreak(Number(streakRes.value.current))
          }
          if (achRes.status === 'fulfilled' && Array.isArray(achRes.value?.achievements)) {
            setAchievements(achRes.value.achievements.filter((row) => row.unlocked))
          }
          if (projRes.status === 'fulfilled' && Array.isArray(projRes.value?.projects)) {
            setProjects(projRes.value.projects.filter(isCleanDisplayableWork))
          }
          if (appearanceRes.status === 'fulfilled' && appearanceRes.value) {
            const app = appearanceRes.value
            if (app.profileSettings) {
              setProfileSlug(app.profileSettings.slug)
              setProfileAppearance({
                themeKey: app.profileSettings.themeKey ?? null,
                frameKey: app.profileSettings.frameKey ?? null,
                backgroundKey: app.profileSettings.backgroundKey ?? null,
              })
            }
            if (user && app.equipment && equipmentMutationVersion.current === loadVersion) {
              setEquipment(syncRewardEquipment(user.id, rewardEquipmentFromRows(app.equipment)))
            }
          }
          if (pathwayRes.status === 'fulfilled' && pathwayRes.value?.courses) {
            applyPathwayData(pathwayRes.value.courses)
          }
        } catch {
          // ignore
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const onLessonCompleted = () => {
      // Completion events only trigger an authoritative reconciliation. Do
      // not promote localStorage values to final stars/stations.
      void learningApi.getPathway()
        .then((res) => {
          if (active && res?.courses) applyPathwayData(res.courses)
        })
        .catch(() => undefined)
    }
    window.addEventListener('aikids:lesson-completed', onLessonCompleted)

    return () => {
      active = false
      window.removeEventListener('aikids:lesson-completed', onLessonCompleted)
    }
  }, [user?.id])

  useEffect(() => {
    if (!avatarPickerOpen || avatarChoices.length > 0) return
    let active = true
    void api<{ assets: Array<{ id: string; name: string; thumbnail: string; type: string }> }>('/api/backpack')
      .then(({ assets }) => {
        if (!active) return
        setAvatarChoices((assets ?? [])
          .filter((asset) => asset.thumbnail)
          .map((asset) => ({
            id: asset.id,
            url: asset.thumbnail,
            label: asset.name,
            source: asset.type.includes('generated') ? 'generated' : 'library',
          })))
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [avatarChoices.length, avatarPickerOpen])

  useEffect(() => {
    const sync = () => {
      if (!user) return
      equipmentMutationVersion.current += 1
      const nextEquipment = readRewardEquipment(user.id)
      setEquipment(nextEquipment)
      const appearance = {
        themeKey: nextEquipment.theme ?? null,
        frameKey: nextEquipment.frame ?? null,
        backgroundKey: nextEquipment.background ?? null,
      }
      setProfileAppearance(appearance)
    }
    window.addEventListener('aikids:reward-equipped', sync)
    return () => window.removeEventListener('aikids:reward-equipped', sync)
  }, [user])

  async function persistProfileSettings(
    next: typeof sharing,
    appearance = profileAppearance,
  ) {
    const visibility = (['friends', 'family', 'school'] as Audience[]).filter(
      (audience) => next.profile[audience],
    )
    const modules = (Object.keys(next.modules) as ProfileModule[]).filter(
      (module) => next.modules[module],
    )
    const saved = await api<PublicProfileSettings>('/api/profile/settings', {
      method: 'PUT',
      body: JSON.stringify({
        enabled: visibility.length > 0,
        visibility,
        modules,
        ...appearance,
      }),
    })
    setProfileSlug(saved.slug)
  }

  // Lọc sạch dự án trưng bày (loại bỏ hoàn toàn file rác)
  const displayableProjects = useMemo(() => {
    return projects.filter(isCleanDisplayableWork)
  }, [projects])

  // Tính toán số trạm, số sao và thời lượng học tập (Chuẩn 30 Trạm toàn khóa)
  const displayStations = useMemo(
    () => Math.min(30, Math.max(0, completedStations)),
    [completedStations],
  )

  const displayStars = useMemo(
    () => Math.max(0, starsCollected),
    [starsCollected],
  )

  const stationPercent = Math.min(100, Math.round((displayStations / 30) * 100))

  const totalStudyMinutes = useMemo(() => {
    return displayStations * 20 + displayableProjects.length * 15 + streak * 25
  }, [displayStations, displayableProjects.length, streak])

  const studyHoursFormatted = useMemo(() => {
    const hours = Math.floor(totalStudyMinutes / 60)
    const mins = totalStudyMinutes % 60
    return `${hours}h ${mins}m`
  }, [totalStudyMinutes])



  // Bằng khen tốt nghiệp khóa học duy nhất chuẩn hóa (Course Graduation Certificate)
  const isGraduated = stationPercent === 100 || displayStations >= 30

  const courseCertificate: CertificateItem = useMemo(() => {
    return {
      id: 'cert-course-aikid-official',
      title: 'Bằng Khen Tốt Nghiệp Khóa Học Sáng Tạo',
      courseTitle: 'Khóa Học Khám Phá & Sáng Tạo Nhí (6 Đảo • 30 Trạm)',
      islandTitle: 'Tốt Nghiệp Xuất Sắc Toàn Khóa',
      stationsCount: 30,
      completedStations: Math.min(30, displayStations),
      stars: displayStars,
      xp: explorerXp,
      isUnlocked: stationPercent === 100 || displayStations >= 30,
      statusText: (stationPercent === 100 || displayStations >= 30)
        ? 'Đã tốt nghiệp khóa học'
        : `Đang học (${displayStations}/30 trạm)`,
    }
  }, [displayStations, displayStars, explorerXp, stationPercent])

  const certificates = useMemo<CertificateItem[]>(() => [courseCertificate], [courseCertificate])

  const isCourseCertificateClaimed = useMemo(() => {
    return (
      isCertificateClaimed('cert-course-aikid-official', user?.id) ||
      isCertificateClaimed('cert-graduation', user?.id) ||
      backpackCertificates.some(
        (c) =>
          c.id === 'cert-course-aikid-official' ||
          c.courseId === 'cert-course-aikid-official' ||
          c.id === 'cert-graduation' ||
          c.courseId === 'cert-graduation',
      )
    )
  }, [user?.id, backpackCertificates])

  const hasClaimedCertificate = isCourseCertificateClaimed || backpackCertificates.length > 0



  // Top 4 Huy Hiệu Vinh Danh
  const featuredBadges = useMemo(() => {
    if (achievements.length > 0) {
      return achievements.slice(0, 4).map((a, idx) => ({
        id: (a as any).id || a.type || `badge-${idx}`,
        title: a.title || (a as any).name || 'Huy hiệu thành tích',
        description: a.description || 'Thành tích xuất sắc trên hành trình rèn luyện và khám phá.',
        image: achievementBadgeAsset(a),
      }))
    }
    return [
      {
        id: 'starter-1',
        title: 'Bước Chân Tiên Phong',
        description: 'Hoàn thành trạm bài học đầu tiên trên Đảo Khám Phá.',
        image: null,
      },
      {
        id: 'starter-2',
        title: 'Họa Sĩ Nhí',
        description: 'Sáng tạo thành công tác phẩm tranh vẽ đầu tiên.',
        image: null,
      },
      {
        id: 'starter-3',
        title: 'Ngọn Lửa Bền Bỉ',
        description: 'Rèn luyện và giữ vững nhịp học tập chăm chỉ mỗi ngày.',
        image: null,
      },
      {
        id: 'starter-4',
        title: 'Nhà Thám Hiểm Trí Tuệ',
        description: 'Khám phá thế giới sáng tạo đầy màu sắc cùng Mèo Mee và các bạn.',
        image: null,
      },
    ]
  }, [achievements])

  // Hải Trình 6 Đảo Khám Phá (Chuẩn hóa 30 Trạm: 10 + 4 + 4 + 4 + 4 + 4)
  const islandVoyages = useMemo(() => {
    const rawIslands = [
      {
        id: 'island-rules',
        badge: 'ĐẢO 1',
        title: 'Mười quy tắc Xưởng',
        totalStations: 10,
        slug: 'muoi-quy-tac-xuong-sang-tao',
        scene: designerAssets.worldScenes.aiValley,
        matcher: /muoi-quy-tac|quy-tac|rules|aiki-rules|dao-0|dao-1.*quy/i,
      },
      {
        id: 'island-explorer',
        badge: 'ĐẢO 2',
        title: 'Nhà thám hiểm AI',
        totalStations: 4,
        slug: 'dao-1-nha-tham-hiem-ai',
        scene: designerAssets.worldScenes.promptKeys,
        matcher: /dao-1-nha-tham-hiem|nha-tham-hiem|kham-pha|chia-khoa|dao-1(?!.*quy)/i,
      },
      {
        id: 'island-artist',
        badge: 'ĐẢO 3',
        title: 'Tớ là hoạ sĩ AI!',
        totalStations: 4,
        slug: 'dao-2-hoa-si-ai',
        scene: designerAssets.worldScenes.creativeMountain,
        matcher: /dao-2-hoa-si|hoa-si|art|co-ve|dao-2/i,
      },
      {
        id: 'island-character',
        badge: 'ĐẢO 4',
        title: 'Biệt đội nhân vật AI',
        totalStations: 4,
        slug: 'dao-3-biet-doi-nhan-vat-ai',
        scene: designerAssets.worldScenes.characterLab,
        matcher: /dao-3-biet-doi|nhan-vat|character|dao-3/i,
      },
      {
        id: 'island-comic',
        badge: 'ĐẢO 5',
        title: 'Vương quốc truyện tranh',
        totalStations: 4,
        slug: 'dao-4-vuong-quoc-truyen-tranh-ai',
        scene: designerAssets.worldScenes.storyIsland,
        matcher: /dao-4-vuong-quoc|truyen-tranh|comic|storyboard|dao-4/i,
      },
      {
        id: 'island-game',
        badge: 'ĐẢO 6',
        title: 'Nhà phát minh trò chơi',
        totalStations: 4,
        slug: 'dao-5-nha-phat-minh-tro-choi-ai',
        scene: designerAssets.worldScenes.gameArena,
        matcher: /dao-5-nha-phat-minh|tro-choi|game|dao-5/i,
      },
    ]

    let cumulative = 0
    return rawIslands.map((island, idx) => {
      const course = pathwayCourses.find(
        (c) =>
          island.matcher.test(
            c.id +
              ' ' +
              ((c as { slug?: string }).slug || '') +
              ' ' +
              (c.shortTitle || '') +
              ' ' +
              c.title,
          ),
      )

      const startStation = cumulative
      cumulative += island.totalStations
      const endStation = cumulative

      let completed = 0
      if (course?.completedCount !== undefined && course.completedCount !== null) {
        completed = Math.min(island.totalStations, Math.max(0, course.completedCount))
      } else {
        if (displayStations >= endStation) {
          completed = island.totalStations
        } else if (displayStations > startStation) {
          completed = displayStations - startStation
        } else {
          completed = 0
        }
      }

      const stars = course?.totalStars ?? (completed * 3)
      const percent = Math.min(100, Math.round((completed / island.totalStations) * 100))

      let status: 'Đã xong' | 'Đang học' | 'Chưa mở' = 'Chưa mở'
      if (completed >= island.totalStations) {
        status = 'Đã xong'
      } else if (idx === 0 || completed > 0 || displayStations >= startStation) {
        status = 'Đang học'
      } else {
        status = 'Chưa mở'
      }

      return {
        ...island,
        completed,
        stars,
        percent,
        status,
        targetRoute: `/world/program/aikid_official?island=${island.slug}`,
      }
    })
  }, [pathwayCourses, displayStations])

  if (loading) return <PageSkeleton rows={3} className="mx-auto max-w-[1024px] w-full px-3 sm:px-4 md:px-6" />

  const nextLevel = nextExplorerLevel(explorerXp, explorerLevel)
  const levelProgress = explorerLevelProgress(explorerXp, explorerLevel)
  const remainingXpToNextLevel = Math.max(0, nextLevel.xpRequired - explorerXp)
  const currentFloor = xpRequiredForLevel(explorerLevel)
  const nextFloor = xpRequiredForLevel(explorerLevel + 1)
  const levelSpan = Math.max(1, nextFloor - currentFloor)
  const xpIntoLevel = progression?.xpIntoLevel ?? Math.max(0, (explorerXp - currentFloor) % levelSpan)
  const xpToNextLevel = progression?.xpToNextLevel ?? levelSpan

  return (
    <PageMotion
      className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1024px] w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-32 sm:pb-36 flex-col gap-4 sm:gap-6"
    >
      {/* 1. Thẻ Header Card chuẩn Lingofy + Màu sắc Aiki */}
      <ProfileHeaderCard
        user={user}
        explorerLevel={explorerLevel}
        explorerXp={explorerXp}
        xpIntoLevel={xpIntoLevel}
        xpToNextLevel={xpToNextLevel}
        onOpenAvatarPicker={() => setAvatarPickerOpen(true)}
        profileSlug={profileSlug}
        equipment={equipment}
      />

      {/* 2. Bộ Ba Thành Tựu Vàng Cốt Lõi (What I've achieved) */}
      <ProfileStatsGrid
        streakDays={streak}
        totalStars={displayStars}
        completedStations={displayStations}
        studyHoursFormatted={studyHoursFormatted}
        certificatesCount={backpackCertificates.length}
        achievementsCount={achievements.length}
      />

      {/* 3. Thanh Tab Điều Hướng Soft Clay (Floating Pill Tabs) */}
      <nav
        aria-label="Các mục hồ sơ cá nhân"
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-soft"
        role="tablist"
      >
        {[
          {
            id: 'progress' as const,
            label: 'Tiến độ',
            icon: TrendingUp,
            badge: `${displayStations}/30`,
          },
          {
            id: 'certificates' as const,
            label: 'Bằng khen',
            icon: Award,
            badge: backpackCertificates.length > 0 ? backpackCertificates.length : undefined,
          },
          {
            id: 'storybook' as const,
            label: 'Sổ kỷ niệm',
            icon: BookOpen,
            badge: storybookPublishedEarnedCount > 0 ? storybookPublishedEarnedCount : undefined,
          },
          {
            id: 'memories' as const,
            label: 'Thành tích',
            icon: Trophy,
            badge: achievements.length > 0 ? achievements.length : undefined,
          },
          {
            id: 'customize' as const,
            label: 'Trang trí',
            icon: Palette,
            badge: undefined,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[48px] shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_0_#c2410c] font-black'
                  : 'text-slate-600 hover:text-orange-700 hover:bg-orange-50/50'
              }`}
            >
              <TabIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-black transition-colors ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="flex flex-col gap-6"
      >
        {/* 1. TAB TIẾN ĐỘ: Hải trình 6 đảo kỳ thú */}
        {activeTab === 'progress' && (
          <>
            <Link
              to="/level"
              className="aikid-flat-panel group flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl shadow-clay border-2 border-amber-200/80 bg-white/95 hover:bg-amber-50/40 transition-colors"
              aria-label={`Xem hành trình Cấp ${explorerLevel}`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 font-black text-xl shrink-0">
                  <Flame className="w-6 h-6 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-700">Hành trình cấp độ</p>
                  <p className="font-display text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Cấp {explorerLevel} · {explorerXp.toLocaleString('vi-VN')} XP
                  </p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {xpToNextLevel > 0 ? `Còn ${xpToNextLevel} XP để lên cấp tiếp theo` : 'Con đã sẵn sàng cho cấp tiếp theo'}
                  </p>
                </div>
              </div>
              <span className="sr-only">Xem quà sắp mở và các mốc cấp tiếp theo.</span>
              <span className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-4 py-2 shadow-2xs shrink-0 cursor-pointer">
                Xem hành trình cấp độ
              </span>
            </Link>

            <section
              aria-labelledby="island-voyages-title"
              className="aikid-flat-panel p-5 sm:p-7 rounded-3xl shadow-clay flex flex-col gap-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-extrabold text-amber-800">
                    Hành Trình Khám Phá
                  </div>
                  <h2
                    id="island-voyages-title"
                    className="mt-1 font-display text-2xl font-black text-slate-900 tracking-tight sm:text-3xl"
                  >
                    Hải Trình 6 Đảo Của Con
                  </h2>
                  <p className="text-xs font-bold text-muted sm:text-sm">
                    30 trạm bài học sáng tạo qua 6 hòn đảo kỳ thú cùng Mèo Aiki.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Link
                    to="/world/program/aikid_official"
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-2xl border border-orange-300 bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs sm:text-sm font-black text-white shadow-soft hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Mở Bản Đồ Khám Phá</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {islandVoyages.map((island) => (
                  <Link
                    key={island.id}
                    to={island.targetRoute}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-200/80 bg-white/95 backdrop-blur-xs p-3.5 sm:p-4 shadow-soft hover:-translate-y-1 hover:shadow-clay transition-all duration-300 text-left cursor-pointer"
                  >
                    <div>
                      <div className="relative h-28 sm:h-32 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-xs mb-3 bg-slate-100">
                        <img
                          src={island.scene}
                          alt={island.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-black shadow-xs border border-amber-200/80 text-amber-950">
                          {island.badge}
                        </span>
                        <span
                          className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-xs ${
                            island.status === 'Đã xong'
                              ? 'bg-emerald-500 text-white'
                              : island.status === 'Đang học'
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                : 'bg-slate-700/80 text-slate-100'
                          }`}
                        >
                          {island.status}
                        </span>
                      </div>

                      <h3 className="font-display font-black text-slate-900 text-base sm:text-lg leading-tight line-clamp-1">
                        {island.title}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 space-y-1.5 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-600">
                          {island.completed}/{island.totalStations} Trạm
                        </span>
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          {island.stars} Sao
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/70">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            island.status === 'Đã xong'
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-amber-400 to-orange-500'
                          }`}
                          style={{ width: `${island.percent}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* 2. TAB BẰNG KHEN: Bằng Khen Tốt Nghiệp Khóa Học, Thẻ Bằng khen đã lưu trong Ba Lô, Thẻ tiến độ */}
        {activeTab === 'certificates' && (
          <>
            {/* 2.5 Phòng Truyền Thống: Bộ Sưu Tập Giấy Khen Đa Khóa Học (Course Certificate Gallery) */}
          <section
            aria-labelledby="course-certificates-title"
            className="aikid-flat-panel p-5 sm:p-7 rounded-3xl shadow-clay flex flex-col gap-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-extrabold text-amber-800">
                  Bằng Khen Trong Ba Lô
                </div>
                <h2
                  id="course-certificates-title"
                  className="mt-1 font-display text-2xl font-black text-slate-900 tracking-tight sm:text-3xl"
                >
                  Bằng Khen Tốt Nghiệp Khóa Học
                </h2>
                <p className="text-xs font-bold text-muted sm:text-sm">
                  Vinh danh những bước tiến xuất sắc của con qua từng hòn đảo trí tuệ và sáng tạo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-100/90 border border-amber-300 px-3.5 py-2 text-xs font-black text-amber-900 shadow-2xs">
                  {backpackCertificates.length} Bằng khen trong Ba lô
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs font-extrabold text-amber-800 shadow-2xs">
                  {displayStars} Sao gặt hái
                </span>
              </div>
            </div>

            {/* TRƯỜNG HỢP 1: Con ĐÃ HOÀN THÀNH XONG KHÓA HỌC (30/30 trạm) và CHƯA NHẬN BẰNG KHEN */}
            {isGraduated && !hasClaimedCertificate && (
              <div
                role="region"
                aria-label="Vinh danh tốt nghiệp khóa học"
                className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-100/90 via-white to-orange-50/80 p-5 sm:p-6 shadow-clay"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative w-14 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-amber-300 shadow-clay bg-amber-50 group hover:scale-105 transition-transform">
                        <img
                          src={designerAssets.certificates.graduation}
                          alt="Bằng Khen Tốt Nghiệp"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-200 to-amber-400 p-2 shadow-inner ring-4 ring-amber-100/80 select-none">
                        <Award className="w-8 h-8 sm:w-9 sm:h-9 text-amber-950 fill-amber-300 drop-shadow-xs" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-black text-amber-900 mb-1">
                        TỐT NGHIỆP XUẤT SẮC
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        CHÚC MỪNG CON ĐÃ TỐT NGHIỆP KHÓA HỌC KHÁM PHÁ &amp; SÁNG TẠO!
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                        Con đã xuất sắc hoàn thành trọn vẹn 30/30 Trạm Học trên 6 Đảo Khám Phá! Ban Cố Vấn Học Viện chính thức trao tặng Bằng Khen Danh Dự cho con.
                        <span className="sr-only">32/32 Trạm Học</span>
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-900 border border-amber-200 shadow-2xs">
                          {displayStars} Sao
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-900 border border-violet-200 shadow-2xs">
                          +{explorerXp} EXP
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-900 border border-emerald-200 shadow-2xs">
                          <img src="/assets/aikid-ui/mascot-original/course-wave.webp" alt="Dấu Aiki" className="w-3.5 h-3.5 object-contain" />
                          Dấu Mèo Aiki
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedCertificateForModal(courseCertificate)}
                      className="flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 font-display text-base font-black text-white shadow-soft transition-all hover:scale-105 hover:from-amber-600 hover:to-orange-600 active:scale-95 cursor-pointer ring-2 ring-amber-300/50"
                    >
                      <span>Nhận Bằng Khen &amp; Cất Vào Ba Lô</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TRƯỜNG HỢP 2: Con ĐÃ NHẬN BẰNG KHEN TỐT NGHIỆP VÀO BA LÔ */}
            {hasClaimedCertificate && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(backpackCertificates.length > 0
                  ? backpackCertificates
                  : [
                      {
                        id: courseCertificate.id,
                        courseId: courseCertificate.id,
                        courseTitle: courseCertificate.courseTitle,
                        islandTitle: courseCertificate.islandTitle,
                        studentName: user?.nickname || user?.name || 'Nhà Sáng Tạo Nhí',
                        issuedDate: new Intl.DateTimeFormat('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }).format(new Date()),
                        stars: courseCertificate.stars,
                        xp: courseCertificate.xp,
                        claimedAt: Date.now(),
                      },
                    ]
                ).map((cert) => (
                  <div
                    key={cert.id}
                    data-testid="profile-certificate-card"
                    className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 p-5 sm:p-6 shadow-clay transition-all hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Top bar with Status Badge & Certificate SVG Thumbnail */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden border border-amber-300 shadow-2xs bg-amber-50">
                            <img
                              src={designerAssets.certificates.graduation}
                              alt="Bằng Khen Tốt Nghiệp"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100/80 text-amber-800 ring-2 ring-amber-200/60 shadow-xs select-none">
                            <Award className="w-6 h-6 text-amber-900 fill-amber-300 drop-shadow-xs" />
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-black text-emerald-900 shadow-2xs">
                          Đã lưu trong Ba lô
                        </span>
                      </div>

                      {/* Tên Bằng khen & Tên khóa */}
                      <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-500">
                        {cert.islandTitle || courseCertificate.islandTitle}
                      </span>
                      <h3 className="mt-1 font-display text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                        {cert.courseTitle || courseCertificate.title}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-muted">
                        Vinh danh: <strong className="text-sm font-black text-slate-900">{cert.studentName || user?.nickname || user?.name || 'Nhà Sáng Tạo Nhí'}</strong>
                      </p>

                      {/* Con dấu Mèo Aiki xác nhận */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-[11px] font-black text-amber-900 shadow-2xs w-fit mt-2">
                        <img src="/assets/aikid-ui/mascot-original/course-wave.webp" alt="Dấu Aiki" className="w-4 h-4 object-contain inline-block" />
                        <span>Dấu Chứng Nhận Aiki</span>
                      </div>

                      {/* Stats Details */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100/80 px-2.5 py-1 text-xs font-black text-amber-900 border border-amber-200 shadow-2xs">
                          {cert.stars || courseCertificate.stars} Sao
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-violet-100/80 px-2.5 py-1 text-xs font-black text-violet-900 border border-violet-200 shadow-2xs">
                          +{cert.xp || courseCertificate.xp} EXP
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100/80">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCertificateForModal({
                            id: cert.id || courseCertificate.id,
                            title: cert.courseTitle || courseCertificate.title,
                            courseTitle: cert.courseTitle || courseCertificate.courseTitle,
                            islandTitle: cert.islandTitle || courseCertificate.islandTitle,
                            stationsCount: 30,
                            completedStations: 30,
                            stars: cert.stars || courseCertificate.stars,
                            xp: cert.xp || courseCertificate.xp,
                            isUnlocked: true,
                            statusText: 'Đã lưu trong Ba lô',
                          })
                        }}
                        className="w-full flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-display text-sm font-black text-white shadow-soft transition-all hover:scale-[1.02] hover:from-amber-600 hover:to-orange-600 active:scale-95 cursor-pointer ring-2 ring-amber-300/40"
                      >
                        <span>Xem lại bằng khen</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TRƯỜNG HỢP 3: Con CHƯA HOÀN THÀNH XONG KHÓA HỌC (< 30 trạm) */}
            {!isGraduated && !hasClaimedCertificate && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-gradient-to-br from-amber-50/60 via-white to-amber-100/30 p-5 sm:p-6 shadow-soft">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100/80 text-amber-800 ring-4 ring-amber-100/80 shadow-xs select-none">
                    <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9 text-amber-900 drop-shadow-xs" />
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Bằng Khen Tốt Nghiệp Khóa Học
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-slate-600 leading-relaxed max-w-2xl">
                      Hoàn thành trọn vẹn 30/30 trạm của Khóa Học Khám Phá & Sáng Tạo để nhận Bằng Khen Tốt Nghiệp danh dự từ Ban Cố Vấn và cất vào Ba Lô!
                    </p>

                    {/* Khung tiến độ */}
                    <div className="mt-4 rounded-2xl bg-white/90 border border-amber-200/80 p-3 sm:p-4 shadow-2xs max-w-xl">
                      <div className="flex items-center justify-between text-xs font-black text-amber-900 mb-1.5">
                        <span>Tiến độ toàn khóa</span>
                        <span>{displayStations}/30 trạm ({stationPercent}%)</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-amber-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, stationPercent))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-500">
                        Còn {Math.max(0, 30 - displayStations)} trạm nữa để tốt nghiệp khóa học!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
          </>
        )}


        {/* 4. TAB SỔ KỶ NIỆM: Full Storybook Chuẩn Nguyên Bản */}
        {activeTab === 'storybook' && (
          <div className="flex flex-col gap-6 min-w-0">
            <section className="aikid-flat-panel p-5 sm:p-7 rounded-3xl shadow-clay" aria-labelledby="storybook-header-title">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-1 text-xs font-extrabold text-indigo-800">
                    Sổ Kỷ Niệm Huyền Thoại
                  </div>
                  <h2 id="storybook-header-title" className="mt-2 font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Nhật Ký Phiêu Lưu Cùng Paco
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm font-bold text-muted leading-relaxed">
                    Mọi trang sách đều mở sẵn để con khám phá câu chuyện, sưu tầm nhãn dán phép thuật và mở khóa phim kết chương!
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-indigo-200/80 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2.5 shadow-soft select-none">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 shadow-2xs">
                      <Sparkles className="w-5 h-5 text-indigo-700 fill-indigo-300 drop-shadow-xs" />
                    </div>
                    <div>
                      <strong className="block font-display text-lg font-black text-indigo-950 leading-tight">
                        {storybookPublishedEarnedCount} / {storybookPublishedStickerIds.size}
                      </strong>
                      <span className="text-xs font-bold text-indigo-700/80">Nhãn dán đã mở</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {storybookNotice && (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                {storybookNotice}
              </p>
            )}

            <div className="w-full flex flex-col items-center justify-center">
              <Suspense fallback={<PageSkeleton rows={1} className="w-full" />}>
              <BookSpread
                page={currentStorybookPage}
                pages={storybookPages}
                pageIndex={storybookPageIndex}
                onPageChange={setStorybookPageIndex}
                earned={storybookEarned}
                ownedRewards={storybookOwnedRewards}
                onClaimed={loadStorybook}
              />
              </Suspense>
            </div>
          </div>
        )}

        {/* 5. TAB THÀNH TÍCH: Bục Vinh Danh Thành Tích & Tác Phẩm Của Con */}
        {activeTab === 'memories' && (
          <>
            {/* 6. Bục Vinh Danh Thành Tích (Achievements Showcase) */}
          <section className="aikid-flat-panel p-5 sm:p-7 rounded-3xl shadow-clay" aria-labelledby="featured-badges-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-extrabold text-amber-800">
                  Bục Vinh Danh Thành Tích
                </div>
                <h2 id="featured-badges-title" className="mt-1 font-display text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
                  Huy Hiệu &amp; Cúp Danh Dự
                </h2>
                <p className="text-xs font-bold text-muted sm:text-sm">
                  Ghi nhận từng cột mốc nỗ lực vượt bậc của con trong suốt hành trình rèn luyện và khám phá.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-100/80 border border-amber-200 px-3.5 py-2 text-xs font-black text-amber-900 shadow-2xs">
                  {achievements.length} / 45 Huy hiệu đã mở
                </span>
                <Link
                  to="/achievements"
                  className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white border border-amber-200 px-4 py-2 text-xs sm:text-sm font-extrabold text-amber-900 shadow-soft hover:bg-amber-50 transition-colors"
                >
                  <span>Mở Kho Báu Huy Hiệu</span>
                </Link>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBadges.map((badge, idx) => (
                <div
                  key={badge.id || `badge-${idx}`}
                  className="flex flex-col items-center justify-between rounded-3xl border-2 border-amber-200/80 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/20 p-4 text-center shadow-soft transition-all hover:scale-[1.02] hover:shadow-clay"
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100/70 p-2 shadow-inner select-none">
                      {badge.image ? (
                        <img
                          src={badge.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-16 w-16 object-contain drop-shadow-md"
                        />
                      ) : (
                        <Trophy className="w-10 h-10 text-amber-600 fill-amber-300 drop-shadow-xs" />
                      )}
                    </div>
                    <h4 className="font-display text-base font-black text-slate-900 tracking-tight">
                      {badge.title}
                    </h4>
                    <p className="mt-1 text-xs font-bold text-muted line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Đã đạt được
                  </span>
                </div>
              ))}
            </div>
          </section>

            {/* 8. SỬA LỖI & NÂNG CẤP: Tác Phẩm Tiêu Biểu (Showcase Works) */}
          <section className="aikid-flat-panel p-5 sm:p-7 rounded-3xl shadow-clay" aria-labelledby="recent-works-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="recent-works-title" className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Tác phẩm tiêu biểu
                </h2>
                <p className="mt-1 text-sm font-bold text-muted">
                  Những kiệt tác sáng tạo hoàn chỉnh đã sẵn sàng để giới thiệu cùng gia đình và bạn bè.
                </p>
              </div>
              <Link to="/backpack" className="flex min-h-11 items-center rounded-xl px-3 text-sm font-extrabold text-brand-600 hover:text-brand-700">
                Xem tất cả trong Ba lô
              </Link>
            </div>

            {displayableProjects.length === 0 ? (
              <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-3xl bg-brand-50/70 border-2 border-dashed border-brand-200 px-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 border border-brand-200 text-brand-600 shadow-soft select-none" aria-hidden="true">
                  <Image className="w-8 h-8 text-brand-600" />
                </div>
                <p className="mt-3 font-display text-xl font-black text-slate-900 tracking-tight">
                  Chưa có tác phẩm nào
                </p>
                <p className="mt-1 text-sm font-bold text-muted">
                  Vào Xưởng Sáng Tạo hoặc hoàn thành Bài học để lưu tác phẩm đầu tiên nhé!
                </p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayableProjects.slice(0, 6).map((project) => (
                  <article
                    key={project.id}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-clay"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50/60 text-brand-600">
                      <ProjectThumbnail project={project} />
                      <span
                        className={`absolute top-2.5 left-2.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-black shadow-xs backdrop-blur-xs ${getWorkTypePill(project.kind).className}`}
                      >
                        {getWorkTypePill(project.kind).label}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                      <p className="line-clamp-1 font-display text-base font-black text-slate-900 tracking-tight">
                        {friendlyProjectTitle(project.title)}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs font-bold text-muted">
                        <span>Đã lưu vào Ba lô</span>
                        <Link to="/backpack" className="text-brand-600 group-hover:translate-x-0.5 transition-transform">
                          Mở xem
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          </>
        )}

        {/* 5. TAB TRANG TRÍ: Chỉnh phong cách hồ sơ, Avatar Studio, Khung, Nền, Đồ trang bị */}
        {activeTab === 'customize' && user && (
          <div className="aikid-flat-panel p-5 sm:p-6 rounded-3xl shadow-clay">
            <div className="mb-5 flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-black text-slate-900 tracking-tight">Chỉnh phong cách hồ sơ</p>
                <p className="text-sm font-bold text-brand-700">
                  Chọn từng món bên dưới; hồ sơ phía trên cập nhật ngay sau khi trang bị.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                className="min-h-11 shrink-0 rounded-xl bg-white px-4 text-sm font-extrabold text-brand-700 shadow-soft cursor-pointer hover:bg-brand-50 transition-colors"
              >
                Quay lại hồ sơ
              </button>
            </div>
            <div className="sr-only" aria-hidden="true">
              <Link to="/profile/avatar-studio">Tạo avatar của con - Mở Avatar Studio</Link>
            </div>
            <Suspense fallback={<PageSkeleton rows={1} className="w-full" />}>
            <RewardCollection
              userId={user.id}
              xpLevel={explorerLevel}
              avatarUrl={user.avatarId}
              initialWardrobe={wardrobeBootstrap}
            />
            </Suspense>
          </div>
        )}
      </div>

      {avatarPickerOpen && user && (
        <AvatarPickerModal
          choices={avatarChoices}
          onClose={() => setAvatarPickerOpen(false)}
          onChoose={async (choice) => {
            if (user.role === 'student') {
              await updateMyProfileAvatar(choice)
              useAuth.getState().setUser({ ...user, avatarId: choice.url })
              await useAuth.getState().refreshMe().catch(() => undefined)
            }
            setAvatarPickerOpen(false)
          }}
        />
      )}

      {/* Modal Chứng Nhận Khóa Học / Tốt Nghiệp */}
      <CourseCertificateModal
        isOpen={Boolean(selectedCertificateForModal)}
        onClose={() => setSelectedCertificateForModal(null)}
        courseId={selectedCertificateForModal?.id || 'cert-course-aikid-official'}
        studentName={user?.nickname || user?.name || 'Nhà Sáng Tạo Nhí'}
        courseTitle={selectedCertificateForModal?.courseTitle || courseCertificate.courseTitle}
        islandTitle={selectedCertificateForModal?.islandTitle || courseCertificate.islandTitle}
        stars={selectedCertificateForModal?.stars ?? displayStars}
        xp={selectedCertificateForModal?.xp ?? explorerXp}
        studentId={user?.id}
        onSaveToBackpack={() => {
          setBackpackCertificates(getBackpackCertificates(user?.id))
        }}
      />
    </PageMotion>
  )
}
