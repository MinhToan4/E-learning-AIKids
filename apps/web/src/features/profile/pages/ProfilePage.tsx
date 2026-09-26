import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
import {
  NavCreativeIcon,
  NavLevelIcon,
} from '@/shared/components/icons/KidNavIcons'

import {
  SoftClayStarIcon,
  SoftClayFlagIcon,
  SoftClayFireIcon,
  SoftClayClockIcon,
  SoftClayTrophyIcon,
  SoftClaySproutIcon,
  SoftClayPlantIcon,
  SoftClayFlowerIcon,
  SoftClayCheckIcon,
  SoftClayLockIcon,
} from '@/features/leaderboard/components/ProgressPassportIcons'
import { BookSpread } from '@/features/storybook/components/BookSpread'
import { STORYBOOK_PAGES, type StorybookPage } from '@/features/storybook/storybook-data'
import { safeChapterColors, uniqueRewardIds, uniqueStorybookIds } from '@/features/storybook/storybook-contract'
import { achievementBadgeAsset } from '@/features/achievements/achievement-badge-assets'
import { api, type AchievementRow } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { EquippedProfile } from '@/features/rewards/EquippedProfile'
import { RewardCollection } from '@/features/rewards/RewardCollection'
import {
  profileCardBackgroundStyle,
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
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import type { ProfileAvatar, ShowcaseProject } from '../profile-showcase'
import { updateMyProfileAvatar } from '@/shared/lib/media-api'
import {
  explorerLevelProgress,
  nextExplorerLevel,
  xpRequiredForLevel,
} from '@/shared/lib/creation/xp-levels'
import {
  loadProfileOverview,
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
import { useRulesProgress, rulesProgressFromPathway } from '@/features/rules/hooks/useRulesProgress'
import type { LearningPathwayCourse } from '@/shared/lib/learning-api'
import type { CompetencyMap } from '@/features/leaderboard/components/SkillGardenSection'

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
      <div className="flex h-full w-full items-center justify-center bg-brand-50/80 text-brand-600">
        <NavCreativeIcon size={44} aria-hidden="true" />
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

export type ProfileTabSection = 'progress' | 'certificates' | 'competencies' | 'storybook' | 'memories' | 'customize'

export function ProfilePage() {
  const user = useAuth((state) => state.user)
  const { data: progression } = useProgression(user)
  const [loading, setLoading] = useState(() => !user)
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
  const { completedCount: hookRulesCompleted } = useRulesProgress()
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
  const [completedStations, setCompletedStations] = useState<number>(0)
  const [starsCollected, setStarsCollected] = useState<number>(0)
  const [pathwayCourses, setPathwayCourses] = useState<LearningPathwayCourse[]>([])
  const [competencyMap, setCompetencyMap] = useState<CompetencyMap | null>(null)
  const [pathwayRulesCompleted, setPathwayRulesCompleted] = useState<number>(0)
  const [profileSlug, setProfileSlug] = useState<string | null>(null)
  const [profileAppearance, setProfileAppearance] = useState({
    themeKey: null as string | null,
    frameKey: null as string | null,
    backgroundKey: null as string | null,
  })
  const [avatarChoices, setAvatarChoices] = useState<ProfileAvatar[]>([])
  const explorerXp = progression?.totalXp ?? user?.xp ?? 0
  const explorerLevel = progression?.level ?? user?.level ?? 1
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

    // Gọi API /api/competency-map
    api<CompetencyMap>('/api/competency-map')
      .then((data) => {
        if (!active || !data) return
        setCompetencyMap(data)
      })
      .catch(() => undefined)

    loadProfileOverview(api, 3500, false, false, true, true)
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

        const profileSettings = overview.profileSettings
        const serverRows = overview.equipment
        const storybook = overview.storybook
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
        setStorybookNotice(storybook ? '' : 'Chưa đồng bộ được tiến trình. Cuốn sách vẫn mở để con khám phá.')

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
        if (pw && Array.isArray(pw.courses)) {
          setPathwayCourses(pw.courses)
          const comp = pw.courses.reduce((acc, c) => acc + (c.completedCount ?? 0), 0)
          const stars = pw.courses.reduce((acc, c) => acc + (c.totalStars ?? 0), 0)
          if (comp > 0) setCompletedStations(comp)
          if (stars > 0) setStarsCollected(stars)
          try {
            const rulesProg = rulesProgressFromPathway(pw)
            const rCount = Object.values(rulesProg.rules).filter((r) => r.status === 'completed').length
            if (rCount > 0) setPathwayRulesCompleted(rCount)
          } catch {
            // ignore
          }
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
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
      void persistProfileSettings(sharing, appearance).catch(() => undefined)
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

  // Tính toán số trạm, số sao và thời lượng học tập
  const displayStations = useMemo(() => {
    if (completedStations > 0) return Math.min(32, completedStations)
    return Math.min(32, Math.max(1, explorerLevel > 1 ? explorerLevel * 3 + 1 : 1))
  }, [completedStations, explorerLevel])

  const displayStars = useMemo(() => {
    if (starsCollected > 0) return starsCollected
    return Math.max(12, Math.floor(explorerXp / 15) || 12)
  }, [starsCollected, explorerXp])

  const stationPercent = Math.min(100, Math.round((displayStations / 32) * 100))

  const totalStudyMinutes = useMemo(() => {
    return Math.max(90, displayStations * 20 + displayableProjects.length * 15 + streak * 25)
  }, [displayStations, displayableProjects.length, streak])

  const studyHoursFormatted = useMemo(() => {
    const hours = Math.floor(totalStudyMinutes / 60)
    const mins = totalStudyMinutes % 60
    return `${hours}h ${mins}m`
  }, [totalStudyMinutes])

  // Biểu đồ 7 cột đại diện nhịp học trong tuần từ T2 -> CN
  const weeklyDays = useMemo(() => {
    const todayIndex = (new Date().getDay() + 6) % 7 // 0=T2, 1=T3, ..., 6=CN
    const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    const baseMinutes = [40, 50, 35, 60, 45, 30, 25]

    return labels.map((label, idx) => {
      const isToday = idx === todayIndex
      const isPast = idx <= todayIndex
      const active = isPast && (streak >= (todayIndex - idx + 1) || isToday || idx % 2 === 0)
      const minutes = active ? baseMinutes[idx] : 0
      const isPeak = idx === 3 // Ngày học chăm nhất
      const showPill = isToday || (isPeak && !isToday && idx < todayIndex)
      const pillText = minutes >= 60 ? `${(minutes / 60).toFixed(1).replace('.0', '')}hr` : `${minutes}m`

      return {
        label,
        minutes,
        active,
        isToday,
        showPill,
        pillText,
      }
    })
  }, [streak])

  const activeDaysCount = useMemo(() => {
    return weeklyDays.filter((d) => d.active).length
  }, [weeklyDays])

  const maxDayMinutes = useMemo(() => {
    return Math.max(60, ...weeklyDays.map((d) => d.minutes))
  }, [weeklyDays])

  // Số quy tắc thực tế hoàn thành (Đảo 0: 10 Quy Tắc Vàng)
  const effectiveRulesCount = useMemo(() => {
    const isGraduated = stationPercent === 100 || displayStations >= 32
    if (isGraduated) return 10
    const safetyEvidence = (competencyMap?.frameworks || [])
      .flatMap((fw) => (fw.domains || []).flatMap((dom) => dom.skills || []))
      .find((s) => /safe|ethic|an[\s_-]?toan|quy[\s_-]?tac|dao[\s_-]?duc/i.test(s.id + ' ' + s.name))
      ?.result?.evidenceCount || 0
    return Math.min(
      10,
      Math.max(
        hookRulesCompleted,
        pathwayRulesCompleted,
        safetyEvidence,
        Math.floor((displayStations * 10) / 32) || 1,
      ),
    )
  }, [competencyMap, displayStations, hookRulesCompleted, pathwayRulesCompleted, stationPercent])

  // Bằng khen tốt nghiệp khóa học duy nhất chuẩn hóa (Course Graduation Certificate)
  const isGraduated = stationPercent === 100 || displayStations >= 32

  const courseCertificate: CertificateItem = useMemo(() => {
    return {
      id: 'cert-course-aikid-official',
      title: 'Bằng Khen Tốt Nghiệp Khóa Học Sáng Tạo',
      courseTitle: 'Khóa Học Khám Phá & Sáng Tạo Nhí (6 Đảo • 32 Trạm)',
      islandTitle: 'Tốt Nghiệp Xuất Sắc Toàn Khóa',
      stationsCount: 32,
      completedStations: Math.min(32, displayStations),
      stars: displayStars,
      xp: explorerXp,
      isUnlocked: stationPercent === 100 || displayStations >= 32,
      statusText: (stationPercent === 100 || displayStations >= 32)
        ? 'Đã tốt nghiệp khóa học'
        : `Đang học (${displayStations}/32 trạm)`,
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

  // Vườn Kỹ Năng Sáng Tạo Của Con (4 Kỹ Năng Cốt Lõi) kết nối dữ liệu học tập thực tế & /api/competency-map
  const competencies = useMemo(() => {
    const isGraduated = stationPercent === 100 || displayStations >= 32

    // Kỹ năng từ /api/competency-map (nếu có cấu hình)
    const allCompetencySkills =
      !competencyMap || competencyMap.status === 'configuration_required'
        ? []
        : (competencyMap.frameworks || []).flatMap((fw) =>
            (fw.domains || []).flatMap((dom) => dom.skills || []),
          )
    const promptSkill = allCompetencySkills.find((s) =>
      /prompt|lenh|chi[\s_-]?khoa|command/i.test(s.id + ' ' + s.name),
    )
    const visualSkill = allCompetencySkills.find((s) =>
      /visual|art|my[\s_-]?thuat|hoi[\s_-]?hoa|ve|hinh[\s_-]?anh/i.test(s.id + ' ' + s.name),
    )
    const storySkill = allCompetencySkills.find((s) =>
      /story|truyen|kich[\s_-]?ban|cot[\s_-]?truyen|narrative/i.test(s.id + ' ' + s.name),
    )
    const safetySkill = allCompetencySkills.find((s) =>
      /safe|ethic|an[\s_-]?toan|quy[\s_-]?tac|dao[\s_-]?duc/i.test(s.id + ' ' + s.name),
    )

    // 1. Tư Duy Diễn Đạt & Giao Tiếp (Creative Thinking & Expression - Đảo 2)
    const island2Course = pathwayCourses.find((c) =>
      /dao[-_\s]?2|kham[-_\s]?pha|tham[-_\s]?hiem|chi[\s_-]?khoa|lenh|prompt/i.test(
        c.id + ' ' + (c.shortTitle || '') + ' ' + c.title,
      ),
    )
    const island2Stations =
      island2Course?.completedCount ??
      (displayStations >= 8 ? 4 : Math.min(4, Math.floor(displayStations / 2)))
    const promptKeysCount = isGraduated
      ? 4
      : Math.min(4, Math.max(1, promptSkill?.result?.evidenceCount || island2Stations))
    const promptPercent =
      promptSkill?.result?.scorePercent ??
      (isGraduated ? 100 : Math.min(100, Math.round((promptKeysCount / 4) * 95)))
    const promptLevelText =
      promptKeysCount >= 4
        ? 'Cấp 5 · Nhà Diễn Đạt Bậc Thầy'
        : promptKeysCount === 3
          ? 'Cấp 4 · Nhà Sáng Tạo Tài Ba'
          : promptKeysCount === 2
            ? 'Cấp 3 · Người Khám Phá Ý Tưởng'
            : 'Cấp 2 · Tập Sự Sáng Tạo'

    // 2. Mỹ Thuật & Sáng Tạo Tranh Vẽ (Visual Arts - Đảo 3 + Tranh vẽ)
    const userImageWorks = displayableProjects.filter(
      (p) => p.kind === 'image' || (!p.kind?.includes('comic') && !p.kind?.includes('story')),
    ).length
    const island3Course = pathwayCourses.find((c) =>
      /dao[-_\s]?3|hoa[-_\s]?si|mau|co[-_\s]?ve|visual|art/i.test(
        c.id + ' ' + (c.shortTitle || '') + ' ' + c.title,
      ),
    )
    const island3Stations =
      island3Course?.completedCount ??
      (displayStations >= 16 ? 5 : Math.min(5, Math.floor(displayStations / 3)))
    const visualEvidenceCount = isGraduated
      ? Math.max(6, island3Stations + userImageWorks)
      : Math.max(1, visualSkill?.result?.evidenceCount || island3Stations + userImageWorks)
    const visualPercent =
      visualSkill?.result?.scorePercent ??
      (isGraduated ? 100 : Math.min(95, Math.max(45, 45 + visualEvidenceCount * 10)))
    const visualLevelText =
      visualEvidenceCount >= 6
        ? 'Cấp 5 · Đại Danh Họa'
        : visualEvidenceCount >= 4
          ? 'Cấp 4 · Họa Sĩ Tài Ba'
          : visualEvidenceCount >= 2
            ? 'Cấp 3 · Họa Sĩ Nhí'
            : 'Cấp 2 · Họa Sĩ Tập Sự'

    // 3. Kể Chuyện & Kịch Bản Nhí (Storytelling - Đảo 4, 5 + Truyện/Comic)
    const userStoryWorks = displayableProjects.filter(
      (p) =>
        p.kind === 'comic' ||
        p.kind === 'story' ||
        p.kind?.includes('panel') ||
        p.kind?.includes('text') ||
        p.kind?.includes('writing'),
    ).length
    const island4Course = pathwayCourses.find((c) =>
      /dao[-_\s]?4|nhan[-_\s]?vat|character/i.test(
        c.id + ' ' + (c.shortTitle || '') + ' ' + c.title,
      ),
    )
    const island5Course = pathwayCourses.find((c) =>
      /dao[-_\s]?5|truyen|storyboard|comic/i.test(
        c.id + ' ' + (c.shortTitle || '') + ' ' + c.title,
      ),
    )
    const storyStations =
      (island4Course?.completedCount ?? 0) + (island5Course?.completedCount ?? 0) ||
      (displayStations >= 24 ? 6 : Math.min(6, Math.floor(displayStations / 3)))
    const storyEvidenceCount = isGraduated
      ? Math.max(6, storyStations + userStoryWorks)
      : Math.max(1, storySkill?.result?.evidenceCount || storyStations + userStoryWorks)
    const storyPercent =
      storySkill?.result?.scorePercent ??
      (isGraduated ? 100 : Math.min(95, Math.max(40, 40 + storyEvidenceCount * 10)))
    const storyLevelText =
      storyEvidenceCount >= 6
        ? 'Cấp 5 · Bậc Thầy Cốt Truyện'
        : storyEvidenceCount >= 4
          ? 'Cấp 4 · Kể Chuyện Xuất Sắc'
          : storyEvidenceCount >= 2
            ? 'Cấp 3 · Kể Chuyện Nhí'
            : 'Cấp 2 · Người Soạn Kịch Bản'

    // 4. An Toàn Số & Ứng Xử Thông Minh (Digital Safety & Smart Habits - Đảo 1 10 quy tắc)
    const effectiveRules = effectiveRulesCount
    const safetyPercent =
      safetySkill?.result?.scorePercent ??
      (isGraduated ? 100 : Math.min(100, Math.round((effectiveRules / 10) * 100)))
    const safetyLevelText =
      effectiveRules >= 10
        ? 'Cấp 5 · Hiệp Sĩ An Toàn Tối Cao'
        : effectiveRules >= 7
          ? 'Cấp 4 · Hiệp Sĩ An Toàn Tinh Nhuệ'
          : effectiveRules >= 4
            ? 'Cấp 3 · Vệ Binh An Toàn'
            : 'Cấp 2 · Hiệp Sĩ Nhí'

    return [
      {
        title: 'Tư Duy Diễn Đạt & Giao Tiếp',
        englishTitle: 'Creative Thinking & Expression',
        level: promptLevelText,
        percent: promptPercent,
        evidenceCount: promptKeysCount,
        evidenceText: `${promptKeysCount} bài học chìa khóa lệnh đã vượt qua`,
        statusLabel:
          promptKeysCount >= 4
            ? 'Nắm trọn 4 chiếc chìa khóa thần kỳ'
            : 'Nắm vững 4 chiếc chìa khóa & tả chi tiết',
        description:
          'Biết cách diễn đạt ý tưởng rõ ràng, miêu tả bối cảnh chi tiết và cùng bạn đồng hành hoàn thiện tác phẩm.',
        icon: SoftClayPlantIcon,
        cardBg: 'border-sky-200/80 bg-linear-to-br from-sky-50/70 via-white to-blue-50/30',
        iconBg: 'border-sky-200 bg-sky-100 text-sky-700',
        badgeBg: 'border-sky-200 bg-sky-100 text-sky-800',
        textColor: 'text-sky-700',
        barGradient: 'bg-gradient-to-r from-sky-400 to-blue-500',
      },
      {
        title: 'Mỹ Thuật & Sáng Tạo Tranh Vẽ',
        englishTitle: 'Visual Arts',
        level: visualLevelText,
        percent: visualPercent,
        evidenceCount: visualEvidenceCount,
        evidenceText: `${visualEvidenceCount} bức tranh & phong cách nghệ thuật`,
        statusLabel: 'Làm chủ màu sắc & phong cách thị giác',
        description:
          'Hiểu cách phối hợp ánh sáng, góc nhìn camera và phong cách hội họa để tạo tranh minh họa đẹp.',
        icon: SoftClayFlowerIcon,
        cardBg: 'border-pink-200/80 bg-linear-to-br from-pink-50/70 via-white to-rose-50/30',
        iconBg: 'border-pink-200 bg-pink-100 text-pink-700',
        badgeBg: 'border-pink-200 bg-pink-100 text-pink-800',
        textColor: 'text-pink-700',
        barGradient: 'bg-gradient-to-r from-pink-400 to-rose-500',
      },
      {
        title: 'Kể Chuyện & Kịch Bản Nhí',
        englishTitle: 'Storytelling',
        level: storyLevelText,
        percent: storyPercent,
        evidenceCount: storyEvidenceCount,
        evidenceText: `${storyEvidenceCount} kịch bản & khung truyện tranh`,
        statusLabel: 'Xây dựng nhân vật & kịch bản phân khung',
        description:
          'Phát triển tuyến nhân vật, kết nối các khung truyện tranh và tạo kịch bản hấp dẫn.',
        icon: SoftClayPlantIcon,
        cardBg: 'border-amber-200/80 bg-linear-to-br from-amber-50/70 via-white to-yellow-50/30',
        iconBg: 'border-amber-200 bg-amber-100 text-amber-700',
        badgeBg: 'border-amber-200 bg-amber-100 text-amber-800',
        textColor: 'text-amber-700',
        barGradient: 'bg-gradient-to-r from-amber-400 to-yellow-500',
      },
      {
        title: 'An Toàn Số & Ứng Xử Thông Minh',
        englishTitle: 'Digital Safety & Smart Habits',
        level: safetyLevelText,
        percent: safetyPercent,
        evidenceCount: effectiveRules,
        evidenceText: `${effectiveRules} / 10 quy tắc đã thuộc lòng`,
        statusLabel: 'Đạt Chuẩn Hiệp Sĩ An Toàn Số',
        description:
          'Thuộc lòng 10 quy tắc xưởng sáng tạo, bảo vệ thông tin riêng tư và sử dụng công nghệ an toàn, văn minh.',
        icon: SoftClayFlowerIcon,
        cardBg: 'border-emerald-200/80 bg-linear-to-br from-emerald-50/70 via-white to-teal-50/30',
        iconBg: 'border-emerald-200 bg-emerald-100 text-emerald-700',
        badgeBg: 'border-emerald-200 bg-emerald-100 text-emerald-800',
        textColor: 'text-emerald-700',
        barGradient: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      },
    ]
  }, [
    competencyMap,
    displayStations,
    displayableProjects,
    effectiveRulesCount,
    pathwayCourses,
    stationPercent,
  ])

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
      />

      {/* 2. Thống kê 3 chỉ số nhanh Soft Clay */}
      <ProfileStatsGrid
        streakDays={streak}
        totalStars={displayStars}
        completedStations={displayStations}
      />

      {/* 3. Thanh Tab Điều Hướng Soft Clay (Floating Pill Tabs) */}
      <nav
        aria-label="Các mục hồ sơ cá nhân"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-soft"
        role="tablist"
      >
        {[
          {
            id: 'progress' as const,
            label: 'Tiến độ',
            badge: `${displayStations}/32`,
          },
          {
            id: 'certificates' as const,
            label: 'Bằng khen',
            badge: backpackCertificates.length > 0 ? backpackCertificates.length : undefined,
          },
          {
            id: 'competencies' as const,
            label: 'Kỹ năng',
            badge: 4,
          },
          {
            id: 'storybook' as const,
            label: 'Sổ kỷ niệm',
            badge: storybookPublishedEarnedCount > 0 ? storybookPublishedEarnedCount : undefined,
          },
          {
            id: 'memories' as const,
            label: 'Thành tích',
            badge: achievements.length > 0 ? achievements.length : undefined,
          },
          {
            id: 'customize' as const,
            label: 'Trang trí',
            badge: undefined,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[48px] shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'bg-gradient-to-r from-[#FD7D2E] to-[#F97316] text-white shadow-clay font-black rounded-xl'
                  : 'text-slate-600 hover:text-brand-700 hover:bg-white/60'
              }`}
            >
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
        {/* 1. TAB TIẾN ĐỘ: Thống kê 4 chỉ số cốt lõi, Biểu đồ nhịp học tuần này, Hành trình cấp độ thám hiểm */}
        {activeTab === 'progress' && (
          <>
            {/* 2. Bộ Tứ Chỉ Số Học Tập Cốt Lõi (4 Core Progress Cards - Zero Truncation) */}
          <section aria-label="Bộ tứ chỉ số học tập cốt lõi" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {/* Card 1: Daily Streak */}
            <div className="flex min-w-0 flex-col justify-between rounded-3xl border-2 border-orange-200/80 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 p-3.5 sm:p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-clay">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-100/70 shadow-xs">
                  <SoftClayFireIcon size={26} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none">
                    {streak} ngày
                  </span>
                  <span className="mt-1 block text-[11px] sm:text-xs font-black uppercase tracking-normal leading-tight whitespace-normal text-slate-700">
                    Chuỗi học tập
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-orange-100/60 px-2.5 py-1 text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-orange-800">
                <span>Chăm chỉ giữ lửa học tập!</span>
              </div>
            </div>

            {/* Card 2: Study Hours */}
            <div className="flex min-w-0 flex-col justify-between rounded-3xl border-2 border-sky-200/80 bg-gradient-to-br from-sky-50/80 via-white to-blue-50/50 p-3.5 sm:p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-clay">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-100/70 shadow-xs">
                  <SoftClayClockIcon size={26} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none">
                    {studyHoursFormatted}
                  </span>
                  <span className="mt-1 block text-[11px] sm:text-xs font-black uppercase tracking-normal leading-tight whitespace-normal text-slate-700">
                    Thời lượng rèn luyện
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-sky-100/60 px-2.5 py-1 text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-sky-800">
                <span>Tích lũy học &amp; sáng tạo</span>
              </div>
            </div>

            {/* Card 3: Station Progress (6 Islands & Stations) */}
            <div className="flex min-w-0 flex-col justify-between rounded-3xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 p-3.5 sm:p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-clay">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100/70 shadow-xs">
                  <SoftClayFlagIcon size={26} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none">
                    {displayStations} / 32 Trạm
                  </span>
                  <span className="mt-1 block text-[11px] sm:text-xs font-black uppercase tracking-normal leading-tight whitespace-normal text-slate-700">
                    Hành trình 6 Đảo
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                    style={{ width: `${stationPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-emerald-800">
                  <span>Tiến độ khám phá: {stationPercent}%</span>
                </div>
              </div>
            </div>

            {/* Card 4: Stars Collected */}
            <div className="flex min-w-0 flex-col justify-between rounded-3xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/50 p-3.5 sm:p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-clay">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100/70 shadow-xs">
                  <SoftClayStarIcon size={26} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none">
                    {displayStars}
                  </span>
                  <span className="mt-1 block text-[11px] sm:text-xs font-black uppercase tracking-normal leading-tight whitespace-normal text-slate-700">
                    Ngôi sao tri thức
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-amber-100/60 px-2.5 py-1 text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-amber-800">
                <span>Tích lũy qua bài học</span>
              </div>
            </div>
          </section>

            {/* 3. BỔ SUNG: Biểu Đồ Nhịp Học Tập Tuần (Weekly Activity Pulse) */}
          <section className="aikid-flat-panel p-5 sm:p-7 rounded-3xl shadow-clay" aria-labelledby="weekly-pulse-title">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700">
                  Nhịp học tập tuần này
                </div>
                <h2 id="weekly-pulse-title" className="mt-1 font-display text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
                  Xem con học như thế nào
                </h2>
                <p className="text-xs font-bold text-muted sm:text-sm">
                  Theo dõi nhịp độ rèn luyện đều đặn mỗi ngày từ Thứ 2 đến Chủ Nhật.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 text-xs font-extrabold text-emerald-800 self-start sm:self-auto shadow-xs">
                <SoftClayCheckIcon size={20} />
                <span>Nhịp học đều đặn: {activeDaysCount}/7 ngày</span>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-100 bg-linear-to-b from-slate-50/60 via-white to-brand-50/20 p-4 sm:p-6">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 sm:h-52 pt-8 pb-2">
                {weeklyDays.map((d) => {
                  const heightPercent = Math.max(16, Math.min(100, Math.round((d.minutes / maxDayMinutes) * 100)))
                  return (
                    <div key={d.label} className="flex flex-col items-center h-full justify-end group">
                      {d.showPill && (
                        <div className="mb-2 -translate-y-1 transform animate-bounce rounded-full bg-slate-900 px-2 py-0.5 text-[10px] sm:text-xs font-black text-white shadow-soft">
                          {d.pillText}
                        </div>
                      )}
                      <div className="relative w-full max-w-[44px] flex items-end justify-center">
                        <div
                          className={`w-full rounded-2xl transition-all duration-500 shadow-xs ${
                            d.active
                              ? d.isToday
                                ? 'bg-gradient-to-t from-coral-500 to-coral-400 ring-2 ring-coral-300 ring-offset-2'
                                : 'bg-gradient-to-t from-brand-600 via-brand-500 to-indigo-400 group-hover:brightness-110'
                              : 'bg-slate-200/70'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <span className={`block font-display text-xs sm:text-sm font-black ${
                          d.isToday ? 'text-coral-600' : d.active ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {d.label}
                        </span>
                        {d.isToday && (
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral-500 mt-0.5" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs font-bold text-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-brand-500 inline-block" /> Đã rèn luyện
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-coral-500 inline-block ring-1 ring-coral-300" /> Hôm nay
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-slate-200 inline-block" /> Chưa học
                  </span>
                </div>
                <p className="text-slate-600">
                  Lời khuyên của Mèo Mee: <span className="font-extrabold text-brand-700">Chỉ cần 15-20 phút mỗi ngày</span> để rèn luyện thói quen học tập và sáng tạo đều đặn!
                </p>
              </div>
            </div>
          </section>

            {/* 4. Hành trình cấp độ */}
          <Link
            to="/level"
            className="aikid-flat-panel group grid min-h-32 gap-4 p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6 rounded-3xl shadow-clay"
            aria-label={`Xem hành trình Cấp ${explorerLevel}`}
          >
            <span className="student-nav-icon !h-14 !w-14 !rounded-2xl" aria-hidden="true">
              <NavLevelIcon size={32} />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-brand-600">Hành trình cấp độ thám hiểm</span>
              <span className="mt-1 block font-display text-2xl font-black text-slate-900 tracking-tight">
                Cấp {explorerLevel} · {explorerXp.toLocaleString('vi-VN')} XP
              </span>
              <CuteProgress className="mt-3" value={levelProgress} label={`Tiến độ lên Cấp ${nextLevel.level}`} tone="violet" />
              <span className="mt-2 block text-sm font-bold text-muted">
                {remainingXpToNextLevel > 0 ? `Còn ${remainingXpToNextLevel} XP để lên Cấp ${nextLevel.level}` : 'Con đã sẵn sàng cho cấp tiếp theo'}
              </span>
              <span className="sr-only">Xem quà sắp mở và các mốc cấp tiếp theo.</span>
            </span>
            <span className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-coral-400 px-5 font-extrabold text-white group-hover:bg-coral-600 shadow-soft">
              Xem hành trình
            </span>
          </Link>

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
                  <SoftClayTrophyIcon size={18} /> Bằng Khen Trong Ba Lô
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
                  <SoftClayStarIcon size={14} /> {displayStars} Sao gặt hái
                </span>
              </div>
            </div>

            {/* TRƯỜNG HỢP 1: Con ĐÃ HOÀN THÀNH XONG KHÓA HỌC (32/32 trạm) và CHƯA NHẬN BẰNG KHEN */}
            {isGraduated && !hasClaimedCertificate && (
              <div
                role="region"
                aria-label="Vinh danh tốt nghiệp khóa học"
                className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-100/90 via-white to-orange-50/80 p-5 sm:p-6 shadow-clay"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-200 to-amber-400 p-2 shadow-inner ring-4 ring-amber-100/80">
                      <SoftClayTrophyIcon size={36} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-black text-amber-900 mb-1">
                        TỐT NGHIỆP XUẤT SẮC
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        CHÚC MỪNG CON ĐÃ TỐT NGHIỆP KHÓA HỌC KHÁM PHÁ &amp; SÁNG TẠO!
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                        Con đã xuất sắc hoàn thành trọn vẹn 32/32 Trạm Học trên 6 Đảo Khám Phá! Ban Cố Vấn Học Viện chính thức trao tặng Bằng Khen Danh Dự cho con.
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-900 border border-amber-200 shadow-2xs">
                          <SoftClayStarIcon size={14} /> {displayStars} Sao
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-900 border border-violet-200 shadow-2xs">
                          +{explorerXp} EXP
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
                      {/* Top bar with Trophy Icon & Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100/80 text-amber-800 ring-2 ring-amber-200/60 shadow-xs">
                          <SoftClayTrophyIcon size={26} />
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
                        Vinh danh: {cert.studentName || user?.nickname || user?.name || 'Nhà Sáng Tạo Nhí'}
                      </p>

                      {/* Stats Details */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100/80 px-2.5 py-1 text-xs font-black text-amber-900 border border-amber-200 shadow-2xs">
                          <SoftClayStarIcon size={14} /> {cert.stars || courseCertificate.stars} Sao
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
                            stationsCount: 32,
                            completedStations: 32,
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

            {/* TRƯỜNG HỢP 3: Con CHƯA HOÀN THÀNH XONG KHÓA HỌC (< 32 trạm) */}
            {!isGraduated && !hasClaimedCertificate && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-gradient-to-br from-amber-50/60 via-white to-amber-100/30 p-5 sm:p-6 shadow-soft">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100/80 text-amber-800 ring-4 ring-amber-100/80 shadow-xs">
                    <SoftClayTrophyIcon size={36} />
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Bằng Khen Tốt Nghiệp Khóa Học
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-slate-600 leading-relaxed max-w-2xl">
                      Hoàn thành trọn vẹn 32/32 trạm của Khóa Học Khám Phá & Sáng Tạo để nhận Bằng Khen Tốt Nghiệp danh dự từ Ban Cố Vấn và cất vào Ba Lô!
                    </p>

                    {/* Khung tiến độ */}
                    <div className="mt-4 rounded-2xl bg-white/90 border border-amber-200/80 p-3 sm:p-4 shadow-2xs max-w-xl">
                      <div className="flex items-center justify-between text-xs font-black text-amber-900 mb-1.5">
                        <span>Tiến độ toàn khóa</span>
                        <span>{displayStations}/32 trạm ({stationPercent}%)</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-amber-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, stationPercent))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-500">
                        Còn {Math.max(0, 32 - displayStations)} trạm nữa để tốt nghiệp khóa học!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
          </>
        )}

        {/* 3. TAB KỸ NĂNG: Vườn Kỹ Năng Sáng Tạo Của Con (4 Kỹ Năng Cốt Lõi) */}
        {activeTab === 'competencies' && (
          <>
            <section className="aikid-flat-panel p-5 sm:p-7 rounded-3xl shadow-clay" aria-labelledby="ai-garden-title">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <SoftClaySproutIcon size={18} /> Vườn Kỹ Năng Sáng Tạo Của Con
                </div>
                <h2 id="ai-garden-title" className="mt-1 font-display text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
                  4 Kỹ Năng Sáng Tạo Cốt Lõi
                </h2>
                <p className="text-xs font-bold text-muted sm:text-sm">
                  Bộ kỹ năng toàn diện: Tư duy diễn đạt, Mỹ thuật tranh vẽ, Kể chuyện và An toàn số.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {competencies.map((comp) => {
                const Icon = comp.icon
                return (
                  <div
                    key={comp.title}
                    className={`flex flex-col justify-between rounded-3xl border-2 p-4 sm:p-5 shadow-soft transition-all hover:shadow-clay hover:-translate-y-0.5 ${comp.cardBg}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs ${comp.iconBg}`}>
                            <Icon size={24} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                              {comp.title}
                            </h3>
                            <span className="text-[11px] font-extrabold text-muted">
                              {comp.englishTitle}
                            </span>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black shadow-xs ${comp.badgeBg}`}>
                          {comp.level}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-600 leading-relaxed">
                        {comp.description}
                      </p>
                      {/* Minh chứng thực tế Pill */}
                      <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs">
                        <SoftClayCheckIcon size={14} />
                        <span>
                          Minh chứng: <strong className="font-black text-slate-900">{comp.evidenceText}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2">
                      <div className="flex items-center justify-between text-xs font-black mb-1.5">
                        <span className="text-slate-700">{comp.statusLabel}</span>
                        <span className={comp.textColor}>{comp.percent}%</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-black/5 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${comp.barGradient} bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.3)_75%,transparent_75%,transparent)] bg-[length:16px_16px]`}
                          style={{ width: `${comp.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
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
                  <div className="flex items-center gap-2.5 rounded-2xl border-2 border-indigo-200/80 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2.5 shadow-soft">
                    <SoftClayStarIcon size={24} />
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
              <BookSpread
                page={currentStorybookPage}
                pages={storybookPages}
                pageIndex={storybookPageIndex}
                onPageChange={setStorybookPageIndex}
                earned={storybookEarned}
                ownedRewards={storybookOwnedRewards}
                onClaimed={loadStorybook}
              />
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
                  <SoftClayTrophyIcon size={18} /> Bục Vinh Danh Thành Tích
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
                  <SoftClayTrophyIcon size={14} /> {achievements.length} / 45 Huy hiệu đã mở
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
                    <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100/70 p-2 shadow-inner">
                      {badge.image ? (
                        <img
                          src={badge.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-16 w-16 object-contain drop-shadow-md"
                        />
                      ) : (
                        <SoftClayTrophyIcon size={44} />
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
                    <SoftClayCheckIcon size={12} /> Đã đạt được
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
              <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-3xl bg-brand-50 px-5 text-center">
                <span className="student-nav-icon !h-16 !w-16" aria-hidden="true">
                  <NavCreativeIcon size={36} />
                </span>
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
            <Link
              to="/profile/avatar-studio"
              className="profile-studio-invite mb-5 grid gap-4 p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transform-none sm:grid-cols-[1fr_auto] sm:items-center rounded-2xl bg-gradient-to-r from-brand-100 to-indigo-100"
            >
              <ImportantCardMascot pose="welcome" className="important-card-mascot--compact" />
              <div>
                <span className="block font-display text-2xl font-black text-slate-900 tracking-tight">Tạo avatar của con</span>
                <span className="mt-1 block text-sm font-bold text-slate-700">
                  Chọn tóc, mắt, trang phục, phụ kiện và phối một Mee thật riêng biệt.
                </span>
              </div>
              <span className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-5 font-extrabold text-brand-700 shadow-press">
                Mở Avatar Studio
              </span>
            </Link>
            {user && (
              <div
                className="mb-5 overflow-hidden rounded-3xl border-2 border-white shadow-clay bg-white/60 p-4 sm:p-5"
                style={{
                  ...profileCardBackgroundStyle(equipment.background),
                  backgroundPosition: 'center',
                }}
              >
                <EquippedProfile
                  user={user}
                  xp={explorerXp}
                  level={explorerLevel}
                  compact
                  equipment={equipment}
                  onAvatarClick={() => setAvatarPickerOpen(true)}
                />
              </div>
            )}
            <RewardCollection
              userId={user.id}
              xpLevel={explorerLevel}
              avatarUrl={user.avatarId}
              initialWardrobe={wardrobeBootstrap}
            />
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
