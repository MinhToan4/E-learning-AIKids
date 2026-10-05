import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  Award,
  Download,
  GraduationCap,
  Image as ImageIcon,
  Star,
  X,
} from 'lucide-react'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { designerAssets } from '@/shared/config/assets'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { AvatarPickerModal } from '../components/AvatarPickerModal'
import { ProfileHeaderCard } from '../components/ProfileHeaderCard'
import { ProfileStatsGrid } from '../components/ProfileStatsGrid'
import type { ProfileAvatar, ShowcaseProject } from '../profile-showcase'
import { updateMyProfileAvatar } from '@/shared/lib/media-api'
import { loadProfileOverview } from '../profile-overview-api'
import { useProgression } from '@/shared/lib/progression-query'
import { CourseCertificateModal } from '@/features/lesson/components/CourseCertificateModal'
import {
  getBackpackCertificates,
  isCertificateClaimed,
  type BackpackCertificate,
} from '@/features/backpack/lib/backpack-certificates'
import { learningApi, type LearningPathwayCourse } from '@/shared/lib/learning-api'
import { flushPendingSyncQueue } from '@/shared/lib/learning-sync-store'

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

export type ProfileTabSection = 'works' | 'certificates'

export function ProfilePage() {
  const user = useAuth((state) => state.user)
  const { data: progression } = useProgression(user)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ProfileTabSection>('works')

  // Filter states
  const [workFilter, setWorkFilter] = useState<'all' | 'drawing' | 'comic'>('all')
  const [certFilter, setCertFilter] = useState<'all' | 'claimed' | 'in_progress'>('all')

  // Lightbox modal state for viewing works
  const [selectedWorkForModal, setSelectedWorkForModal] = useState<ShowcaseProject | null>(null)

  // Certificate modal state
  const [selectedCertificateForModal, setSelectedCertificateForModal] = useState<CertificateItem | null>(null)
  const [backpackCertificates, setBackpackCertificates] = useState<BackpackCertificate[]>(() =>
    getBackpackCertificates(user?.id),
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
  const [projects, setProjects] = useState<ShowcaseProject[]>([])
  const [completedStations, setCompletedStations] = useState(0)
  const [starsCollected, setStarsCollected] = useState(0)
  const [_pathwayCourses, setPathwayCourses] = useState<LearningPathwayCourse[]>([])
  const [profileSlug, setProfileSlug] = useState<string | null>(null)
  const [avatarChoices, setAvatarChoices] = useState<ProfileAvatar[]>([])
  const [overviewXp, setOverviewXp] = useState<number | null>(null)
  const [overviewLevel, setOverviewLevel] = useState<number | null>(null)
  const explorerXp = progression?.totalXp ?? overviewXp ?? user?.xp ?? 0
  const explorerLevel = progression?.level ?? overviewLevel ?? user?.level ?? 1

  useEffect(() => {
    let active = true

    setLoading(true)
    setCompletedStations(0)
    setStarsCollected(0)
    setPathwayCourses([])

    const applyPathwayData = (courses: LearningPathwayCourse[]) => {
      setPathwayCourses(courses)
      const serverComp = courses.reduce((acc, c) => acc + (c.completedCount ?? 0), 0)
      const serverStars = courses.reduce((acc, c) => acc + (c.totalStars ?? 0), 0)
      setCompletedStations(serverComp)
      setStarsCollected(serverStars)
    }

    const loadAuthoritativeOverview = () => {
      void flushPendingSyncQueue(user?.id).catch(() => undefined)
      // Call loadProfileOverview with includeAppearance = false, includeStorybook = false
      return loadProfileOverview(api, 3500, false, true, false, true, false)
    }

    loadAuthoritativeOverview()
      .then((overview) => {
        if (!active) return
        setStreak(overview.streak)
        const cleanProjects = (overview.projects ?? []).filter(isCleanDisplayableWork)
        setProjects(cleanProjects)
        setAvatarChoices(
          overview.avatarChoices
            .filter((asset) => asset.thumbnail)
            .map((asset) => ({
              id: asset.id,
              url: asset.thumbnail,
              label: asset.name,
              source: asset.type.includes('generated') ? 'generated' : 'library',
            })),
        )

        if (typeof overview.totalXp === 'number') {
          setOverviewXp(overview.totalXp)
        }
        if (typeof overview.level === 'number' && overview.level > 0) {
          setOverviewLevel(overview.level)
        }
        if (overview.profileSettings?.slug) {
          setProfileSlug(overview.profileSettings.slug)
        }

        const pw = overview.pathway
        if (pw && Array.isArray(pw.courses) && pw.courses.length > 0) {
          applyPathwayData(pw.courses)
        } else {
          learningApi
            .getPathway()
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
          // Fallback catch: ONLY call streak, projects, and pathway
          const [streakRes, projRes, pathwayRes] = await Promise.allSettled([
            api<{ current?: number }>('/api/gamification/streak'),
            api<{ projects?: ShowcaseProject[] }>('/api/projects'),
            learningApi.getPathway().catch(() => null),
          ])
          if (!active) return
          if (streakRes.status === 'fulfilled' && streakRes.value?.current !== undefined) {
            setStreak(Number(streakRes.value.current))
          }
          if (projRes.status === 'fulfilled' && Array.isArray(projRes.value?.projects)) {
            setProjects(projRes.value.projects.filter(isCleanDisplayableWork))
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
      void learningApi
        .getPathway()
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
        setAvatarChoices(
          (assets ?? [])
            .filter((asset) => asset.thumbnail)
            .map((asset) => ({
              id: asset.id,
              url: asset.thumbnail,
              label: asset.name,
              source: asset.type.includes('generated') ? 'generated' : 'library',
            })),
        )
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [avatarChoices.length, avatarPickerOpen])

  // Lọc sạch dự án trưng bày (loại bỏ hoàn toàn file rác)
  const displayableProjects = useMemo(() => {
    return projects.filter(isCleanDisplayableWork)
  }, [projects])

  // Số lượng truyện tranh và tranh vẽ
  const comicCount = useMemo(() => {
    return displayableProjects.filter((p) => {
      const k = (p.kind || '').toLowerCase()
      return k.includes('comic') || k.includes('panel')
    }).length
  }, [displayableProjects])

  const drawingCount = useMemo(() => {
    return Math.max(0, displayableProjects.length - comicCount)
  }, [displayableProjects.length, comicCount])

  // Lọc tác phẩm theo tab bộ lọc
  const filteredWorks = useMemo(() => {
    if (workFilter === 'comic') {
      return displayableProjects.filter((p) => {
        const k = (p.kind || '').toLowerCase()
        return k.includes('comic') || k.includes('panel')
      })
    }
    if (workFilter === 'drawing') {
      return displayableProjects.filter((p) => {
        const k = (p.kind || '').toLowerCase()
        return !(k.includes('comic') || k.includes('panel'))
      })
    }
    return displayableProjects
  }, [displayableProjects, workFilter])

  // Chuẩn hóa 30 trạm
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

  // Bằng khen tốt nghiệp khóa học
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
      isUnlocked: isGraduated,
      statusText: isGraduated
        ? 'Đã tốt nghiệp khóa học'
        : `Đang học (${displayStations}/30 trạm)`,
    }
  }, [displayStations, displayStars, explorerXp, isGraduated])

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

  if (loading) return <PageSkeleton rows={3} className="mx-auto max-w-[1024px] w-full px-3 sm:px-4 md:px-6" />

  const xpIntoLevel = progression?.xpIntoLevel ?? 0
  const xpToNextLevel = progression?.xpToNextLevel ?? 100

  return (
    <PageMotion
      className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1024px] w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-32 sm:pb-36 flex-col gap-4 sm:gap-6"
    >
      {/* 1. Header Card tiêu chuẩn Hallmark Soft Clay (props sạch sẽ, không truyền equipment) */}
      <ProfileHeaderCard
        user={user}
        explorerLevel={explorerLevel}
        explorerXp={explorerXp}
        xpIntoLevel={xpIntoLevel}
        xpToNextLevel={xpToNextLevel}
        onOpenAvatarPicker={() => setAvatarPickerOpen(true)}
        profileSlug={profileSlug}
      />

      {/* 2. Ba chỉ số cốt lõi: Trạm hoàn thành, Sao tích lũy, và Số tranh đã vẽ */}
      <ProfileStatsGrid
        streakDays={streak}
        totalStars={displayStars}
        completedStations={displayStations}
        studyHoursFormatted={studyHoursFormatted}
        certificatesCount={backpackCertificates.length}
        worksCount={displayableProjects.length}
      />

      {/* Khối liên kết xem Hành trình cấp độ (Contextual level journey link) */}
      <Link
        to="/level"
        className="aikid-flat-panel group flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl shadow-clay border-2 border-amber-200/80 bg-white/95 hover:bg-amber-50/40 transition-colors"
        aria-label={`Xem hành trình Cấp ${explorerLevel}`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 font-black text-xl shrink-0">
            ⭐
          </div>
          <div>
            <h3 className="font-display text-base font-black text-slate-900">
              Hành trình cấp độ · Cấp {explorerLevel}
            </h3>
            <p className="text-xs font-bold text-slate-500">
              {xpToNextLevel > 0 ? `Còn ${xpToNextLevel} XP để lên Cấp ${explorerLevel + 1}` : 'Con đã sẵn sàng cho cấp tiếp theo'}
            </p>
            <span className="sr-only">Xem quà sắp mở và các mốc cấp tiếp theo.</span>
          </div>
        </div>
        <span className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-2xs group-hover:bg-amber-600 transition-colors">
          Xem hành trình cấp độ
        </span>
      </Link>

      {/* 3. Thanh Tab Điều Hướng Soft Clay (2 Tab Tinh Gọn) */}
      <nav
        aria-label="Các mục hồ sơ cá nhân"
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-soft"
        role="tablist"
      >
        {[
          {
            id: 'works' as const,
            label: 'Ảnh đã tạo',
            icon: ImageIcon,
            badge: displayableProjects.length > 0 ? displayableProjects.length : undefined,
          },
          {
            id: 'certificates' as const,
            label: 'Bằng khen',
            icon: Award,
            badge: backpackCertificates.length > 0 ? backpackCertificates.length : undefined,
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
              className={`min-h-[48px] flex-1 flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer select-none active:scale-95 ${
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
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* 4. Nội dung Tabpanel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="flex flex-col gap-6"
      >
        {/* TAB 1: ẢNH ĐÃ TẠO / TÁC PHẨM SÁNG TẠO */}
        {activeTab === 'works' && (
          <section
            aria-labelledby="recent-works-title"
            className="aikid-flat-panel p-5 sm:p-7 rounded-3xl shadow-clay flex flex-col gap-5"
          >
            {/* Header & Bộ Lọc Tác Phẩm */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-extrabold text-amber-800">
                  Tác Phẩm Của Con
                </div>
                <h2
                  id="recent-works-title"
                  className="mt-1 font-display text-2xl font-black text-slate-900 tracking-tight sm:text-3xl"
                >
                  Ảnh Đã Tạo
                </h2>
                <p className="mt-1 text-xs font-bold text-muted sm:text-sm">
                  Những bức tranh vẽ và truyện tranh sáng tạo do chính tay con hoàn thành.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Link
                  to="/creative"
                  className="flex min-h-11 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2 text-xs sm:text-sm font-black text-white shadow-soft hover:scale-102 active:scale-95 transition-all"
                >
                  <span>🎨 Vào AI Studio vẽ tranh mới</span>
                </Link>
                <Link
                  to="/backpack"
                  className="flex min-h-11 items-center rounded-2xl bg-white border border-amber-200 px-4 py-2 text-xs sm:text-sm font-extrabold text-brand-600 hover:text-brand-700 shadow-2xs hover:bg-amber-50/50 transition-colors"
                >
                  Mở Ba Lô Của Con
                </Link>
              </div>
            </div>

            {/* Filter Buttons: all, drawing, comic */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
              <button
                type="button"
                id="filter-works-all"
                onClick={() => setWorkFilter('all')}
                className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  workFilter === 'all'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-white/90 text-slate-600 hover:bg-amber-50 border border-slate-200/80'
                }`}
              >
                Tất cả ({displayableProjects.length})
              </button>
              <button
                type="button"
                id="filter-works-drawing"
                onClick={() => setWorkFilter('drawing')}
                className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  workFilter === 'drawing'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-white/90 text-slate-600 hover:bg-amber-50 border border-slate-200/80'
                }`}
              >
                Tranh vẽ ({drawingCount})
              </button>
              <button
                type="button"
                id="filter-works-comic"
                onClick={() => setWorkFilter('comic')}
                className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  workFilter === 'comic'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-white/90 text-slate-600 hover:bg-amber-50 border border-slate-200/80'
                }`}
              >
                Truyện tranh ({comicCount})
              </button>
            </div>

            {/* Grid Tác Phẩm hoặc Empty State */}
            {filteredWorks.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl bg-amber-50/60 border-2 border-dashed border-amber-200 p-8 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 border border-amber-200 text-amber-600 shadow-soft select-none mb-3"
                  aria-hidden="true"
                >
                  <ImageIcon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-display text-xl font-black text-slate-900 tracking-tight">
                  Chưa có tác phẩm nào
                </h3>
                <p className="mt-1 text-sm font-bold text-muted max-w-md">
                  Vào Xưởng Sáng Tạo hoặc hoàn thành Bài học để lưu bức tranh đầu tiên vào Ba lô nhé!
                </p>
                <div className="mt-4 flex items-center gap-3 flex-wrap justify-center">
                  <Link
                    to="/creative"
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-soft hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>🎨 Vào AI Studio vẽ tranh mới</span>
                  </Link>
                  <Link
                    to="/backpack"
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white border border-amber-200 px-4 py-2 text-xs sm:text-sm font-extrabold text-brand-600 shadow-2xs hover:bg-amber-50/50 transition-all cursor-pointer"
                  >
                    <span>Mở Ba Lô Của Con</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredWorks.map((project) => (
                  <article
                    key={project.id}
                    onClick={() => setSelectedWorkForModal(project)}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-clay cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50/60 text-brand-600">
                      <ProjectThumbnail project={project} />
                      <span
                        className={`absolute top-2.5 left-2.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-black shadow-xs backdrop-blur-xs ${
                          getWorkTypePill(project.kind).className
                        }`}
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
                        <span className="text-brand-600 font-extrabold group-hover:underline">
                          Xem ảnh
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: CHỨNG NHẬN HOÀN THÀNH / BẰNG KHEN TỐT NGHIỆP */}
        {activeTab === 'certificates' && (
          <section
            aria-labelledby="course-certificates-title"
            className="aikid-flat-panel p-5 sm:p-7 rounded-3xl shadow-clay flex flex-col gap-5"
          >
            {/* Header & Stats Bằng khen */}
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

            {/* Bộ lọc Bằng khen: all, claimed, in_progress */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
              <button
                type="button"
                id="filter-certs-all"
                onClick={() => setCertFilter('all')}
                className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  certFilter === 'all'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-white/90 text-slate-600 hover:bg-amber-50 border border-slate-200/80'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                id="filter-certs-claimed"
                onClick={() => setCertFilter('claimed')}
                className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  certFilter === 'claimed'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-white/90 text-slate-600 hover:bg-amber-50 border border-slate-200/80'
                }`}
              >
                Đã lưu vào Ba lô
              </button>
              <button
                type="button"
                id="filter-certs-in-progress"
                onClick={() => setCertFilter('in_progress')}
                className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  certFilter === 'in_progress'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-white/90 text-slate-600 hover:bg-amber-50 border border-slate-200/80'
                }`}
              >
                Đang chinh phục
              </button>
            </div>

            {/* TRƯỜNG HỢP 1: Con ĐÃ HOÀN THÀNH XONG KHÓA HỌC (30/30 trạm) và CHƯA NHẬN BẰNG KHEN */}
            {isGraduated && !hasClaimedCertificate && (certFilter === 'all' || certFilter === 'in_progress') && (
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
                          <img
                            src="/assets/aikid-ui/mascot-original/course-wave.webp"
                            alt="Dấu Aiki"
                            className="w-3.5 h-3.5 object-contain"
                          />
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
            {hasClaimedCertificate && (certFilter === 'all' || certFilter === 'claimed') && (
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

                      <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-500">
                        {cert.islandTitle || courseCertificate.islandTitle}
                      </span>
                      <h3 className="mt-1 font-display text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                        {cert.courseTitle || courseCertificate.title}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-muted">
                        Vinh danh:{' '}
                        <strong className="text-sm font-black text-slate-900">
                          {cert.studentName || user?.nickname || user?.name || 'Nhà Sáng Tạo Nhí'}
                        </strong>
                      </p>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-[11px] font-black text-amber-900 shadow-2xs w-fit mt-2">
                        <img
                          src="/assets/aikid-ui/mascot-original/course-wave.webp"
                          alt="Dấu Aiki"
                          className="w-4 h-4 object-contain inline-block"
                        />
                        <span>Dấu Chứng Nhận Aiki</span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100/80 px-2.5 py-1 text-xs font-black text-amber-900 border border-amber-200 shadow-2xs">
                          {cert.stars || courseCertificate.stars} Sao
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-violet-100/80 px-2.5 py-1 text-xs font-black text-violet-900 border border-violet-200 shadow-2xs">
                          +{cert.xp || courseCertificate.xp} EXP
                        </span>
                      </div>
                    </div>

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
            {!isGraduated && !hasClaimedCertificate && (certFilter === 'all' || certFilter === 'in_progress') && (
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
                      Hoàn thành trọn vẹn 30/30 trạm của Khóa Học Khám Phá &amp; Sáng Tạo để nhận Bằng Khen Tốt Nghiệp danh dự từ Ban Cố Vấn và cất vào Ba Lô!
                    </p>

                    <div className="mt-4 rounded-2xl bg-white/90 border border-amber-200/80 p-3 sm:p-4 shadow-2xs max-w-xl">
                      <div className="flex items-center justify-between text-xs font-black text-amber-900 mb-1.5">
                        <span>Tiến độ toàn khóa</span>
                        <span>
                          {displayStations}/30 trạm ({stationPercent}%)
                        </span>
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

            {/* Empty state khi filter = claimed mà chưa có bằng nào */}
            {!hasClaimedCertificate && certFilter === 'claimed' && (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl bg-amber-50/60 border-2 border-dashed border-amber-200 p-8 text-center">
                <p className="font-display text-lg font-black text-slate-900">
                  Chưa có bằng khen nào trong Ba lô
                </p>
                <p className="mt-1 text-xs sm:text-sm font-bold text-muted max-w-md">
                  Hãy hoàn thành trọn vẹn 30 trạm bài học để nhận Bằng Khen Tốt Nghiệp danh dự nhé!
                </p>
              </div>
            )}

            {/* Empty state khi filter = in_progress mà đã tốt nghiệp & nhận bằng */}
            {hasClaimedCertificate && certFilter === 'in_progress' && (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl bg-emerald-50/60 border-2 border-dashed border-emerald-200 p-8 text-center">
                <p className="font-display text-lg font-black text-emerald-900">
                  Con đã hoàn thành xuất sắc toàn bộ khóa học!
                </p>
                <p className="mt-1 text-xs sm:text-sm font-bold text-emerald-700 max-w-md">
                  Tất cả bằng khen danh dự đã được lưu an toàn trong Ba Lô của con.
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Lightbox Modal Xem Ảnh Phóng To */}
      {selectedWorkForModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={friendlyProjectTitle(selectedWorkForModal.title)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedWorkForModal(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6 shadow-clay border-2 border-amber-300 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black shrink-0 ${
                    getWorkTypePill(selectedWorkForModal.kind).className
                  }`}
                >
                  {getWorkTypePill(selectedWorkForModal.kind).label}
                </span>
                <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 truncate">
                  {friendlyProjectTitle(selectedWorkForModal.title)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWorkForModal(null)}
                aria-label="Đóng"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-amber-50/50 border border-slate-200 flex items-center justify-center">
              <img
                src={selectedWorkForModal.thumbnail}
                alt={friendlyProjectTitle(selectedWorkForModal.title)}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs font-bold text-slate-500">
                Kiệt tác sáng tạo của con lưu trong Ba lô
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = selectedWorkForModal.thumbnail || ''
                    link.download = `${friendlyProjectTitle(selectedWorkForModal.title)}.png`
                    link.target = '_blank'
                    link.rel = 'noopener noreferrer'
                    link.click()
                  }}
                  className="flex-1 sm:flex-none inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-display text-sm font-black text-white shadow-soft hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải ảnh về máy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWorkForModal(null)}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-4 py-2 font-display text-sm font-black text-slate-700 transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
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
