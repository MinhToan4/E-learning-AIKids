import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  Award,
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheckBig,
  Clock3,
  Compass,
  Download,
  Map as MapIcon,
  MessageSquareText,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TimerReset,
  Trophy,
  UserRoundPlus,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { ApiError, api, downloadAuthorizedBlob } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { cn } from '@/shared/lib/cn'
import { getCourseStationCount } from '@/shared/lib/course-station-count'
import { useAuth } from '@/shared/store/auth'
import type { AgeExperiencePolicy } from '@/shared/age-experience/AgeExperienceProvider'
import { designerAssets, programArtworkHint } from '@/shared/config/assets'
import { avatarImage, getAvatar } from '@/shared/config/avatars'
import {
  getChildOverallLocalStats,
  getIslandLocalProgress,
  getLocalProgress,
} from '@/shared/lib/learning-sync-store'
import { ParentTeacherFeedbackSection } from '../components/ParentTeacherFeedbackSection'
import { ParentSubscriptionCheckoutModal } from '../components/ParentSubscriptionCheckoutModal'
import { useParentFeedbackBadge } from '../hooks/useParentFeedbackBadge'
import { parentFriendlyError } from '../lib/parent-error'
import {
  getChildLearningCache,
  getDashboardCache,
  invalidateParentCache,
  setChildLearningCache,
} from '../lib/parent-cache'

type Child = {
  id: string
  nickname: string | null
  avatarId: string | null
  level: number
  xp?: number
  totalStars?: number
  completedQuests?: number
}
type CompetencyMap = {
  status: 'ready' | 'configuration_required'
  frameworks: Array<{
    id: string
    name: string
    disclaimer: string
    domains: Array<{
      id: string
      name: string
      skills: Array<{
        id: string
        name: string
        learnerLabel: string
        result: {
          level: 'no_data' | 'not_met' | 'developing' | 'achieved'
          scorePercent: number | null
          evidenceCount: number
        }
      }>
    }>
  }>
}
type Credential = {
  id: string
  kind: 'certificate' | 'badge'
  status: string
  verificationCode: string
  issuedAt: string
  course: { title: string; shortTitle: string }
  template: {
    name: string
    layoutJson: {
      backgroundUrl?: string | null
      allowDownload?: boolean
      allowShare?: boolean
    }
  }
}
type Course = {
  id: string
  title: string
  shortTitle: string
  status: string
  description?: string
  coverImage?: string | null
  ageLabel?: string
  enrolled?: boolean
  accessPolicy?: string
  priceAmountMinor?: number
  priceCurrency?: string
  questCount?: number
  programId?: string
  programTitle?: string
  programDescription?: string
  programImage?: string | null
  programSource?: 'aikid_official' | 'workspace' | 'creator_marketplace'
  regionOrder?: number
  stations?: Array<{ id: string; order: number; title: string }>
}
type PlacementRequest = {
  id: string
  courseId: string
  requestedLevel: number
  status: 'pending' | 'placed' | 'rejected' | 'cancelled'
  resolutionNote: string | null
  createdAt: string
  course: { id: string; title: string }
  targetClass: { id: string; name: string; code: string } | null
}
type Pathway = {
  recommendedCourseId: string | null
  courses: Array<{
    id: string
    title: string
    shortTitle: string
    status: 'completed' | 'active' | 'available' | 'locked'
    reasonCode: string
    completionPercent: number
    missingPrerequisites: string[]
  }>
}
type ChildProgress = {
  courseId: string | null
  courses: Array<{ id: string; title: string; shortTitle: string; ageLabel: string }>
  summary: { completed: number; total: number; totalStars: number; currentPhase: string | null }
  quests: Array<{
    id: string
    order: number
    title: string
    status: string
    phase: string
    stars: number
    xpEarned: number
  }>
}
type LearningData = {
  competency: CompetencyMap
  credentials: Credential[]
  pathway: Pathway
  courses: Course[]
  progress: ChildProgress
  subscription: {
    status: string
    maxOpenCoursesPerChild: number
    planName?: string
    planCode?: string
    aiCreditsRemaining?: number
    monthlyCreateCredits?: number
  }
  ageExperience: {
    status: 'ready' | 'configuration_required'
    policy: AgeExperiencePolicy | null
  }
}
type Section = 'overview' | 'credentials' | 'growth' | 'pathway' | 'activity' | 'feedback'

const levelLabels = {
  no_data: 'Chưa có dữ liệu',
  not_met: 'Cần thêm trải nghiệm',
  developing: 'Đang phát triển',
  achieved: 'Đã thể hiện tốt',
} as const

// ── 6 Đảo Sáng Tạo Canonical Definitions ───────────────────────
export const SIX_ISLANDS = [
  {
    index: 0,
    id: 'muoi-quy-tac-xuong-sang-tao',
    title: 'Đảo Tiên Quyết',
    subtitle: '10 Quy tắc vàng & Văn hóa an toàn AI',
    totalStations: 10,
    totalStars: 30,
    sticker: designerAssets.islandStickers.tienQuyet,
    sceneImage: designerAssets.worldScenes.aiValley,
  },
  {
    index: 1,
    id: 'dao-1-nha-tham-hiem-ai',
    title: 'Đảo 1: Nhà thám hiểm AI',
    subtitle: 'Bốn chiếc chìa khóa vàng viết Prompt',
    totalStations: 4,
    totalStars: 12,
    sticker: designerAssets.islandStickers.khamPha,
    sceneImage: designerAssets.worldScenes.promptKeys,
  },
  {
    index: 2,
    id: 'dao-2-hoa-si-ai',
    title: 'Đảo 2: Họa sĩ nhí AI',
    subtitle: 'Sắc màu, ánh sáng & kể chuyện hội họa',
    totalStations: 4,
    totalStars: 12,
    sticker: designerAssets.islandStickers.hoaSi,
    sceneImage: designerAssets.worldScenes.creativeMountain,
  },
  {
    index: 3,
    id: 'dao-3-biet-doi-nhan-vat-ai',
    title: 'Đảo 3: Nhà thiết kế nhân vật',
    subtitle: 'Hồ sơ ADN & Nhất quán biểu cảm nhân vật',
    totalStations: 4,
    totalStars: 12,
    sticker: designerAssets.islandStickers.nhanVat,
    sceneImage: designerAssets.worldScenes.characterLab,
  },
  {
    index: 4,
    id: 'dao-4-vuong-quoc-truyen-tranh-ai',
    title: 'Đảo 4: Tác giả truyện tranh AI',
    subtitle: 'Cốt truyện 3 hồi & Storyboard 8 ô truyện',
    totalStations: 4,
    totalStars: 12,
    sticker: designerAssets.islandStickers.truyenTranh,
    sceneImage: designerAssets.worldScenes.storyIsland,
  },
  {
    index: 5,
    id: 'dao-5-nha-phat-minh-tro-choi-ai',
    title: 'Đảo 5: Nhà sáng tạo Game thẻ bài',
    subtitle: 'Luật chơi ngũ hành & Đấu trường thẻ bài',
    totalStations: 4,
    totalStars: 12,
    sticker: designerAssets.islandStickers.troChoi,
    sceneImage: designerAssets.worldScenes.gameArena,
  },
]

/** Trả về thông báo lỗi thân thiện — không bao giờ lộ tên kỹ thuật */
function friendlyError(cause: unknown): string {
  return parentFriendlyError(cause)
}

function friendlyEnrollmentError(cause: unknown): string {
  if (cause instanceof ApiError) {
    if (cause.status === 402 || cause.status === 403 || cause.code === 'ENTITLEMENT_REQUIRED') {
      return 'Gói học hiện tại chưa có quyền mở vùng này. Ba / Mẹ hãy kiểm tra Gói học.'
    }
    if (cause.status === 409 || cause.code === 'COURSE_LIMIT_REACHED') {
      return 'Con đã dùng hết số khóa được mở trong gói hiện tại.'
    }
  }
  const message = friendlyError(cause)
  return message === 'Error' ? 'Chưa thể cập nhật khóa học. Vui lòng kiểm tra gói học và thử lại.' : message
}

export function ParentLearningPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const upgradeParam = searchParams.get('upgrade')
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState<'sub' | 'credits'>('sub')
  const role = useAuth((s) => s.user?.role)
  const enterAsChild = useAuth((s) => s.enterAsChild)
  const navigate = useNavigate()
  const feedbackBadge = useParentFeedbackBadge(role)

  const initialChildId = useMemo(() => {
    return searchParams.get('childId') || getDashboardCache()?.kids[0]?.id || ''
  }, [searchParams])

  const initialCachedData = useMemo(() => {
    return initialChildId ? getChildLearningCache<LearningData>(initialChildId) : null
  }, [initialChildId])

  const initialKids = useMemo(() => {
    return (getDashboardCache()?.kids as Child[]) || []
  }, [])

  const [children, setChildren] = useState<Child[]>(initialKids)
  const [studentId, setStudentId] = useState(initialChildId)
  const [section, setSection] = useState<Section>('overview')
  const [data, setData] = useState<LearningData | null>(initialCachedData)
  const dataRef = useRef<LearningData | null>(initialCachedData)
  useEffect(() => {
    dataRef.current = data
  }, [data])

  const [loading, setLoading] = useState(!initialCachedData && Boolean(initialChildId))
  const [isRevalidating, setIsRevalidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { toasts, showToast, dismissToast } = useToast()

  // Auto-open upgrade modal if URL has ?upgrade=...
  useEffect(() => {
    if (upgradeParam !== null) {
      setCheckoutMode(upgradeParam === 'credits' ? 'credits' : 'sub')
      setIsUpgradeModalOpen(true)
    }
  }, [upgradeParam])

  const handleOpenUpgrade = useCallback((mode: 'sub' | 'credits' = 'sub') => {
    setCheckoutMode(mode)
    setIsUpgradeModalOpen(true)
  }, [])

  const handleCloseUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false)
    if (searchParams.has('upgrade')) {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.delete('upgrade')
          return next
        },
        { replace: true },
      )
    }
  }, [searchParams, setSearchParams])

  // Mark seen when parent actively views feedback section
  useEffect(() => {
    if (section === 'feedback' && studentId) {
      feedbackBadge.markSeen(studentId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, studentId])

  useEffect(() => {
    const cachedDash = getDashboardCache()
    if (cachedDash?.kids?.length) {
      setChildren(cachedDash.kids as Child[])
    }
    void api<{ children: Child[] }>('/api/parent/children')
      .then((response) => {
        setChildren(response.children)
        const requestedChildId = searchParams.get('childId')
        const targetChildId = response.children.some((child) => child.id === requestedChildId)
          ? requestedChildId ?? ''
          : response.children[0]?.id ?? ''
        setStudentId((current) => {
          const nextId = current && response.children.some((c) => c.id === current) ? current : targetChildId
          if (nextId && nextId !== current) {
            const cached = getChildLearningCache<LearningData>(nextId)
            dataRef.current = cached
            if (cached) {
              setData(cached)
              setLoading(false)
            }
          }
          return nextId
        })
      })
      .catch((cause) => setError(friendlyError(cause)))
  }, [searchParams])

  const selectChild = useCallback((childId: string) => {
    setStudentId(childId)
    const cached = getChildLearningCache<LearningData>(childId)
    dataRef.current = cached
    if (cached) {
      setData(cached)
      setLoading(false)
      setError(null)
    } else {
      setData(null)
      setLoading(true)
    }
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('childId', childId)
      return next
    }, { replace: true })
  }, [setSearchParams])

  const load = useCallback(async () => {
    if (!studentId) {
      setLoading(false)
      return
    }
    const cached = getChildLearningCache<LearningData>(studentId)
    const existingData = dataRef.current || cached
    if (!existingData) {
      setLoading(true)
    } else {
      setIsRevalidating(true)
    }
    setError(null)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      controller.abort()
    }, 3500)

    try {
      const query = `studentId=${encodeURIComponent(studentId)}`
      const fetchOpts: RequestInit = { signal: controller.signal }
      const [
        competencyResult,
        credentialsResult,
        pathwayResult,
        ageExperienceResult,
        coursesResult,
        progressResult,
        subscriptionResult,
      ] = await Promise.allSettled([
        api<CompetencyMap>(`/api/competency-map?${query}`, fetchOpts),
        api<{ credentials: Credential[] }>(`/api/credentials?${query}`, fetchOpts),
        learningApi.getPathway(studentId),
        api<{
          status: 'ready' | 'configuration_required'
          policy: AgeExperiencePolicy | null
        }>(`/api/v1/lms/me/age-policy?${query}`, fetchOpts),
        api<{ courses: Course[] }>(`/api/parent/children/${studentId}/courses`, fetchOpts),
        api<ChildProgress>(`/api/parent/children/${studentId}/progress`, fetchOpts),
        api<{ subscription: LearningData['subscription'] }>('/api/parent/subscription', fetchOpts),
      ])

      const allRejected = [
        competencyResult,
        credentialsResult,
        pathwayResult,
        ageExperienceResult,
        coursesResult,
        progressResult,
        subscriptionResult,
      ].every((r) => r.status === 'rejected')

      if (allRejected) {
        if (!existingData) {
          const firstReason = [
            competencyResult,
            credentialsResult,
            pathwayResult,
            ageExperienceResult,
            coursesResult,
            progressResult,
            subscriptionResult,
          ].find((r): r is PromiseRejectedResult => r.status === 'rejected')?.reason
          setError(friendlyError(firstReason))
        }
        return
      }

      const competency: CompetencyMap =
        competencyResult.status === 'fulfilled' && competencyResult.value
          ? competencyResult.value
          : (existingData?.competency ?? { status: 'configuration_required', frameworks: [] })

      const credentials: Credential[] =
        credentialsResult.status === 'fulfilled' && credentialsResult.value?.credentials
          ? credentialsResult.value.credentials
          : (existingData?.credentials ?? [])

      const pathway: Pathway =
        pathwayResult.status === 'fulfilled' && pathwayResult.value
          ? pathwayResult.value
          : (existingData?.pathway ?? { recommendedCourseId: null, courses: [] })

      const ageExperience: {
        status: 'ready' | 'configuration_required'
        policy: AgeExperiencePolicy | null
      } =
        ageExperienceResult.status === 'fulfilled' && ageExperienceResult.value
          ? ageExperienceResult.value
          : (existingData?.ageExperience ?? { status: 'ready', policy: null })

      const courses: Course[] =
        coursesResult.status === 'fulfilled' && coursesResult.value?.courses
          ? coursesResult.value.courses
          : (existingData?.courses ?? [])

      const progress: ChildProgress =
        progressResult.status === 'fulfilled' && progressResult.value
          ? progressResult.value
          : (existingData?.progress ?? {
              courseId: null,
              courses: [],
              summary: { completed: 0, total: 0, totalStars: 0, currentPhase: null },
              quests: [],
            })

      const subscription: LearningData['subscription'] =
        subscriptionResult.status === 'fulfilled' && subscriptionResult.value?.subscription
          ? subscriptionResult.value.subscription
          : (existingData?.subscription ?? {
              status: 'active',
              maxOpenCoursesPerChild: 5,
              planName: 'AI Kid Chính Thức',
              planCode: 'aikids_official_129k',
            })

      const freshLearningData: LearningData = {
        competency,
        credentials,
        pathway,
        courses,
        progress,
        subscription,
        ageExperience,
      }

      dataRef.current = freshLearningData
      setData(freshLearningData)
      setChildLearningCache(studentId, freshLearningData)
    } catch (cause) {
      if (!existingData) {
        setError(friendlyError(cause))
      }
    } finally {
      window.clearTimeout(timeoutId)
      setLoading(false)
      setIsRevalidating(false)
    }
  }, [studentId])

  const toggleProgram = useCallback(async (courses: Course[], enroll: boolean) => {
    if (!studentId) return
    setBusy(true)
    try {
      for (const course of courses) {
        await api(`/api/parent/children/${studentId}/courses`, {
          method: 'POST',
          body: JSON.stringify({ courseId: course.id, enroll }),
        })
      }
      showToast(enroll ? 'Đã thêm vùng học vào lộ trình của con.' : 'Đã dừng vùng học.', 'success')
      await load()
    } catch (cause) {
      await load()
      showToast(friendlyEnrollmentError(cause), 'error')
    } finally {
      setBusy(false)
    }
  }, [load, showToast, studentId])

  useEffect(() => {
    void load()
  }, [load])

  async function handleEnterChild(childId: string) {
    if (!childId) return
    setBusy(true)
    try {
      const next = await enterAsChild(childId)
      navigate(next.onboarded ? '/home' : '/onboarding')
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : 'Chưa chuyển sang tài khoản bé được. Ba / Mẹ thử lại nhé.',
        'error',
      )
    } finally {
      setBusy(false)
    }
  }

  async function downloadCredential(credential: Credential) {
    setBusy(true)
    try {
      const blob = await downloadAuthorizedBlob(`/api/credentials/${credential.id}/pdf`)
      const blobUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `chung-nhan-${credential.id}.pdf`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)
    } catch (cause) {
      showToast(friendlyError(cause), 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleUpgradeSuccess = useCallback(() => {
    invalidateParentCache()
    showToast('Nâng cấp gói thành công! Bé đã có thêm hạn mức học tập.', 'success')
    void load()
  }, [load, showToast])

  const selectedChild = children.find((c) => c.id === studentId) ?? children[0] ?? null
  const localStats = getChildOverallLocalStats(studentId)
  const xpForCalculation = (selectedChild?.xp || 0) > 0
    ? (selectedChild?.xp || 0)
    : Math.max(0, ((selectedChild?.level || 1) - 1) * 100)
  const totalStars = Math.max(
    selectedChild?.totalStars ?? 0,
    localStats.totalStars,
    Math.min(30, Math.floor(xpForCalculation / 100)),
  )
  const completedQuests = Math.max(
    selectedChild?.completedQuests ?? 0,
    localStats.completedCount,
    Math.min(32, Math.floor(totalStars / 3)),
  )

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Header Soft-Clay ─────────────────────────────────── */}
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/60 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-black text-brand-700">
              <Sparkles size={12} /> THEO DÕI TIẾN ĐỘ HỌC TẬP
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              Hải Trình 6 Đảo & Năng Lực
            </span>
            {isRevalidating && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 animate-pulse border border-brand-200">
                <RefreshCw size={10} className="animate-spin text-brand-600" /> Đang cập nhật...
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenUpgrade('credits')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 text-xs font-black text-amber-900 shadow-soft transition"
            >
              <Sparkles size={13} className="text-amber-600" />
              <span>Nạp Thêm Lượt Tạo Ảnh AI</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenUpgrade('sub')}
              className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-black text-white shadow-soft transition hover:opacity-95"
            >
              <Sparkles size={13} />
              <span>Nâng gói</span>
            </button>
            <Link to="/parent/kids" className="text-xs font-extrabold text-brand-600 hover:underline">
              Quản lý hồ sơ
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">Trung tâm học tập</h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted leading-relaxed">
              Theo dõi Hải Trình 6 Đảo Sáng Tạo, bằng khen chứng nhận và đánh giá năng lực của từng bé trên một giao diện ấm áp.
            </p>
          </div>

          {/* Bộ chọn bé dạng Pill gốm sứ nổi Soft-Clay */}
          {children.length > 0 && (
            <div className="grid min-w-52 gap-2">
              <p className="text-xs font-bold text-muted uppercase tracking-wider">Đang xem hồ sơ học tập</p>
              <div className="flex flex-wrap gap-2.5">
                {children.map((child) => {
                  const hasNew = feedbackBadge.byChild[child.id] ?? false
                  const isActive = studentId === child.id
                  const img = avatarImage(child.avatarId)
                  const av = getAvatar(child.avatarId)
                  const cStats = getChildOverallLocalStats(child.id)
                  const cXp = (child.xp || 0) > 0 ? (child.xp || 0) : Math.max(0, ((child.level || 1) - 1) * 100)
                  const cStars = Math.max(child.totalStars ?? 0, cStats.totalStars, Math.min(30, Math.floor(cXp / 100)))

                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => selectChild(child.id)}
                      className={cn(
                        'relative flex min-h-12 items-center gap-2.5 rounded-full border-2 px-3.5 py-1.5 text-xs sm:text-sm font-black transition-all duration-200 shadow-soft',
                        isActive
                          ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 shadow-clay ring-2 ring-amber-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/50',
                      )}
                      aria-pressed={isActive}
                      aria-label={`${child.nickname ?? 'Học viên'}${hasNew ? ' — có nhận xét mới' : ''}`}
                    >
                      {/* Avatar */}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-tr from-brand-100 to-purple-50 text-base shadow-xs">
                        {img ? (
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        ) : (
                          av.emoji
                        )}
                      </span>

                      {/* Name */}
                      <span className="font-display font-black text-slate-900">
                        {child.nickname ?? 'Học viên'}
                      </span>

                      {/* Level Badge */}
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-700">
                        Lv.{child.level || 1}
                      </span>

                      {/* Stars Badge */}
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100/90 px-2 py-0.5 text-[10px] font-black text-amber-800 border border-amber-200/60">
                        ⭐ {cStars}
                      </span>

                      {hasNew && (
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full bg-danger ring-2 ring-white"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Thanh điều hướng Soft-Clay ấm áp ─────────────────── */}
      <div
        className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Nội dung học tập của con"
      >
        {(
          [
            ['overview', 'Hành trình 6 Đảo', Compass],
            ['credentials', 'Bằng khen & Chứng nhận', Trophy],
            ['growth', 'Năng lực & Nhận xét', Sparkles],
            ['activity', 'Hoạt động', Activity],
            ['pathway', 'Lộ trình', MapIcon],
            ['feedback', 'Nhận xét', MessageSquareText],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={section === key}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-xs sm:text-sm font-extrabold transition-all duration-200 border-2',
              section === key
                ? 'bg-brand-500 text-white border-brand-600 shadow-clay'
                : 'bg-white text-slate-700 border-cream-200 hover:bg-amber-50 hover:border-amber-300',
            )}
            onClick={() => setSection(key)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
            {key === 'credentials' && (
              <span className="rounded-full bg-amber-400 text-amber-950 px-1.5 py-0.2 text-[10px] font-black">
                1
              </span>
            )}
            {key === 'feedback' && feedbackBadge.byChild[studentId] && (
              <span className="h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
            )}
          </button>
        ))}
      </div>

      {/* ── Nội dung chính theo từng Tab ─────────────────────── */}
      {children.length === 0 && !loading ? (
        <EmptyState
          title="Chưa có hồ sơ học viên"
          description="Ba / Mẹ hãy tạo hồ sơ cho con trước khi xem tình trạng học."
        />
      ) : loading ? (
        <PageSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : section === 'feedback' && studentId ? (
        <ParentTeacherFeedbackSection childId={studentId} />
      ) : data && section === 'overview' ? (
        <LearningOverview
          child={selectedChild}
          pathway={data.pathway}
          credentials={data.credentials}
          totalStars={totalStars}
          completedQuests={completedQuests}
          aiCredits={data.subscription.aiCreditsRemaining ?? data.subscription.monthlyCreateCredits ?? 50}
          hasNewFeedback={feedbackBadge.byChild[studentId] ?? false}
          onOpenPathway={() => setSection('pathway')}
          onOpenFeedback={() => setSection('feedback')}
          onOpenCredentials={() => setSection('credentials')}
          onTopupCredits={() => handleOpenUpgrade('credits')}
          onEnterChild={() => void handleEnterChild(studentId)}
        />
      ) : data && section === 'credentials' ? (
        <CredentialsShowcase
          child={selectedChild}
          credentials={data.credentials}
          totalStars={totalStars}
          completedQuests={completedQuests}
          busy={busy}
          onDownload={downloadCredential}
        />
      ) : data && section === 'growth' ? (
        <GrowthAndFeedbackSection
          child={selectedChild}
          competency={data.competency}
          credentials={data.credentials}
          ageExperience={data.ageExperience}
          busy={busy}
          onDownload={downloadCredential}
        />
      ) : data && section === 'pathway' ? (
        <div className="grid gap-5">
          <PathwaySection pathway={data.pathway} />
          <CourseSelectionSection
            courses={data.courses}
            subscription={data.subscription}
            busy={busy}
            onToggleProgram={toggleProgram}
            onUpgrade={() => handleOpenUpgrade('sub')}
          />
        </div>
      ) : data && section === 'activity' ? (
        <LearningActivitySection studentId={studentId} initialProgress={data.progress} />
      ) : null}

      <ParentSubscriptionCheckoutModal
        open={isUpgradeModalOpen}
        onClose={handleCloseUpgradeModal}
        onSuccess={handleUpgradeSuccess}
        defaultPlanId={upgradeParam || 'aikids_official_129k'}
        initialMode={checkoutMode}
      />
    </div>
  )
}

// ── Tab 1: Tổng Quan & Hải Trình 6 Đảo Sáng Tạo ────────────────
function LearningOverview({
  child,
  pathway,
  credentials,
  totalStars,
  completedQuests,
  aiCredits,
  hasNewFeedback,
  onOpenPathway,
  onOpenFeedback,
  onOpenCredentials,
  onTopupCredits,
  onEnterChild,
}: {
  child: Child | null
  pathway: Pathway
  credentials: Credential[]
  totalStars: number
  completedQuests: number
  aiCredits: number
  hasNewFeedback: boolean
  onOpenPathway: () => void
  onOpenFeedback: () => void
  onOpenCredentials: () => void
  onTopupCredits?: () => void
  onEnterChild: () => void
}) {
  const active = pathway.courses.find((course) => course.id === pathway.recommendedCourseId)
    ?? pathway.courses.find((course) => course.status === 'active')
  const completed = pathway.courses.filter((course) => course.status === 'completed').length
  const childName = child?.nickname ?? 'Con'
  const isIsland0Done = completedQuests >= 10

  return (
    <div className="grid gap-5">
      {/* AI Creative Studio Banner */}
      <section className="ui-card flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-sun-50 via-cream-50 to-amber-50 border border-amber-200 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700 shadow-soft">
            <Sparkles size={22} className="text-amber-600" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base sm:text-lg font-black text-slate-900">
                Xưởng Sáng Tạo & Tranh Vẽ AI Cho {childName}
              </h3>
              <span className="rounded-full bg-amber-200/90 px-2 py-0.5 text-[11px] font-black text-amber-950">
                🎨 {aiCredits} lượt khả dụng
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Bé thỏa sức sáng tác truyện tranh và mở rộng trí tưởng tượng cùng AI Cat AIKI. Lượt tạo ảnh không bao giờ hết hạn.
            </p>
          </div>
        </div>
        {onTopupCredits && (
          <button
            type="button"
            onClick={onTopupCredits}
            className="inline-flex items-center gap-1.5 rounded-2xl py-2 px-3.5 text-xs font-black shadow-clay bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition active:scale-[0.98]"
          >
            <Sparkles size={14} />
            <span>Nạp Thêm Lượt Tạo Ảnh AI</span>
          </button>
        )}
      </section>

      {/* Thẻ Bước Tiếp Theo */}
      <section className="ui-card overflow-hidden rounded-3xl border-2 border-brand-200 shadow-clay">
        <div className="grid gap-5 bg-gradient-to-br from-brand-50/90 via-white to-sky-50/60 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-500 text-white px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider shadow-2xs">
                Bước tiếp theo
              </span>
              <span className="text-xs font-bold text-slate-500">
                Lộ trình Hải Trình 6 Đảo
              </span>
            </div>
            <h2 className="mt-2 font-display text-xl sm:text-2xl font-black text-slate-900">
              {isIsland0Done
                ? `${childName} ơi! Cùng tiếp tục hành trình tại Đảo 1: Nhà thám hiểm AI`
                : active
                  ? `${childName} nên tiếp tục “${active.title}”`
                  : `Chọn chương trình đầu tiên cho ${childName}`}
            </h2>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
              {isIsland0Done
                ? `Bé đã xuất sắc hoàn thành 10/10 trạm Đảo Tiên Quyết (30 sao) và nhận Giấy chứng nhận tốt nghiệp! Hãy tiếp tục hành trình bước vào Đảo 1 để khám phá 4 chiếc chìa khóa vàng viết Prompt.`
                : active
                  ? `Lộ trình đã hoàn thành ${active.completionPercent}%. Tiến độ và điều kiện mở khóa do hệ thống học tập cập nhật.`
                  : 'Chương trình phù hợp độ tuổi và quyền học hiện có sẽ xuất hiện trong mục Lộ trình.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {isIsland0Done ? (
              <Button
                variant="primary"
                className="gap-2 font-black shadow-clay rounded-2xl min-h-[44px] px-6 text-sm"
                onClick={onEnterChild}
              >
                <span>Vào học ngay ➔</span>
              </Button>
            ) : (
              <Button onClick={onOpenPathway} className="gap-2 rounded-2xl shadow-clay min-h-[44px] px-6">
                {active ? 'Xem lộ trình' : 'Chọn chương trình'} <ArrowRight size={17} aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewStat
          icon={BookOpen}
          label="Đang học"
          value={isIsland0Done ? 1 : pathway.courses.filter((course) => course.status === 'active').length}
          subtext={isIsland0Done ? 'Đảo 1: Nhà thám hiểm AI' : 'Các trạm đang mở'}
          tone="brand"
        />
        <OverviewStat
          icon={CircleCheckBig}
          label="Đã hoàn thành"
          value={isIsland0Done ? Math.max(1, completed) : completed}
          subtext={isIsland0Done ? 'Đảo Tiên Quyết (10 trạm)' : 'Khóa đã hoàn tất'}
          tone="mint"
        />
        <OverviewStat
          icon={Award}
          label="Chứng nhận"
          value={isIsland0Done ? Math.max(1, credentials.length) : credentials.length}
          subtext={isIsland0Done ? 'Tốt nghiệp Đảo Tiên Quyết' : 'Chưa có chứng nhận'}
          tone="sun"
          onClick={onOpenCredentials}
        />
        <button
          type="button"
          onClick={onOpenFeedback}
          className="ui-card min-h-28 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl shadow-soft"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-coral-50 text-coral-600">
              <MessageSquareText size={20} aria-hidden="true" />
            </span>
            {hasNewFeedback && (
              <span className="rounded-full bg-coral-100 px-2 py-1 text-xs font-extrabold text-danger">
                Mới
              </span>
            )}
          </div>
          <p className="mt-3 text-sm font-bold text-muted">Nhận xét giáo viên</p>
          <p className="mt-1 text-sm font-extrabold text-text">
            {hasNewFeedback ? 'Có cập nhật mới' : 'Xem nhận xét'}
          </p>
        </button>
      </div>

      {/* ── HẢI TRÌNH 6 ĐẢO SÁNG TẠO (VISUAL 6 ISLANDS GRID) ──── */}
      <section
        aria-label="Hải Trình 6 Đảo Sáng Tạo"
        className="rounded-3xl border-2 border-brand-100 bg-gradient-to-b from-brand-50/40 via-white to-white p-5 sm:p-6 shadow-soft"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-100/70 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft text-lg">
              🧭
            </span>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black text-slate-900">
                Hải Trình 6 Đảo Sáng Tạo
              </h2>
              <p className="text-xs text-muted">
                Hành trình chinh phục AI qua 6 chặng đảo: Đảo Tiên Quyết (10 trạm) và 5 Đảo Sáng Tạo (mỗi đảo 4 trạm).
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 self-start sm:self-auto rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-800">
            <Sparkles size={12} className="text-brand-600" /> Tổng {totalStars} sao · {completedQuests} trạm
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SIX_ISLANDS.map((island) => {
            let islandCompleted = 0
            let islandStars = 0
            let islandStatus: 'completed' | 'active' | 'locked' = 'locked'

            if (island.index === 0) {
              islandCompleted = completedQuests >= 10 ? 10 : Math.min(10, completedQuests)
              islandStars = completedQuests >= 10 ? 30 : Math.min(30, totalStars)
              islandStatus = completedQuests >= 10 ? 'completed' : 'active'
            } else if (island.index === 1) {
              if (completedQuests >= 10) {
                islandStatus = 'active'
                islandCompleted = Math.min(4, Math.max(0, completedQuests - 10))
                islandStars = Math.max(0, totalStars - 30)
              } else {
                islandStatus = 'locked'
              }
            } else {
              islandStatus = 'locked'
            }

            const pct = Math.round((islandCompleted / island.totalStations) * 100)

            return (
              <div
                key={island.id}
                className={cn(
                  'relative flex flex-col justify-between rounded-3xl border-2 p-5 transition-all duration-300 shadow-clay',
                  islandStatus === 'completed'
                    ? 'border-amber-300 bg-gradient-to-b from-amber-50/60 via-white to-white'
                    : islandStatus === 'active'
                      ? 'border-brand-300 bg-gradient-to-b from-brand-50/60 via-white to-white ring-2 ring-brand-200'
                      : 'border-slate-200 bg-slate-50/70 opacity-80',
                )}
              >
                <div>
                  {/* Sticker + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-soft p-1 overflow-hidden">
                        <img
                          src={island.sticker}
                          alt={island.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      {islandStatus === 'completed' && (
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-2xs text-xs font-black">
                          🏆
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-black shadow-2xs',
                        islandStatus === 'completed'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : islandStatus === 'active'
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-200 text-slate-600',
                      )}
                    >
                      {islandStatus === 'completed'
                        ? 'Đã Tốt Nghiệp'
                        : islandStatus === 'active'
                          ? 'Đang Học 🧭'
                          : 'Chặng Kế Tiếp 🔒'}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mt-3">
                    {island.title}
                  </h3>
                  <p className="text-xs text-muted font-bold mt-0.5">
                    {island.subtitle}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-xs font-black mb-1">
                      <span className="text-slate-600">
                        🎯 {islandCompleted} / {island.totalStations} trạm
                      </span>
                      <span className="text-amber-800">
                        ⭐ {islandStars} sao
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          islandStatus === 'completed' ? 'bg-amber-400' : 'bg-brand-500',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {islandStatus === 'completed' ? (
                    <button
                      type="button"
                      onClick={onOpenCredentials}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 hover:text-amber-950 transition"
                    >
                      <span>Xem Bằng Khen 🏆</span>
                    </button>
                  ) : islandStatus === 'active' ? (
                    <button
                      type="button"
                      onClick={onEnterChild}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-brand-700 hover:text-brand-900 transition"
                    >
                      <span>Vào học ngay ➔</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      Mở khi hoàn thành đảo trước
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pathway compact snapshot */}
      <PathwaySection pathway={pathway} compact />
    </div>
  )
}

function OverviewStat({
  icon: Icon,
  label,
  value,
  subtext,
  tone,
  onClick,
}: {
  icon: typeof BookOpen
  label: string
  value: number
  subtext?: string
  tone: 'brand' | 'mint' | 'sun'
  onClick?: () => void
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    mint: 'bg-mint-50 text-success',
    sun: 'bg-sun-50 text-warning',
  }
  return (
    <article
      onClick={onClick}
      className={cn(
        'ui-card min-h-28 p-4 rounded-2xl shadow-soft',
        onClick && 'cursor-pointer hover:border-brand-300 hover:-translate-y-0.5 transition',
      )}
    >
      <span className={cn('grid h-10 w-10 place-items-center rounded-2xl', tones[tone])}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-bold text-muted">{label}</p>
      <p className="font-display text-2xl font-black text-text">{value}</p>
      {subtext && <p className="text-xs text-muted font-bold mt-0.5 truncate">{subtext}</p>}
    </article>
  )
}

// ── Tab 2: Bằng Khen & Chứng Nhận (SVG Thật Khung Men Gốm Vàng) ──
function CredentialsShowcase({
  child,
  credentials,
  totalStars,
  completedQuests,
  busy,
  onDownload,
}: {
  child: Child | null
  credentials: Credential[]
  totalStars: number
  completedQuests: number
  busy: boolean
  onDownload: (credential: Credential) => void
}) {
  const childName = child?.nickname ?? 'Bé'
  const isEligibleForCert = completedQuests >= 10

  return (
    <div className="grid gap-6">
      {/* Khung viền men gốm vàng kim sang trọng */}
      <section className="rounded-3xl border-4 border-amber-300 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 p-6 sm:p-8 text-center shadow-clay">
        <div className="mx-auto max-w-2xl flex flex-col items-center">
          {/* Header Seal */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-wider mb-3 border border-amber-200 shadow-2xs">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span>AI Kids Creator Academy · Chứng Nhận Danh Dự</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display uppercase tracking-wide">
            Giấy Chứng Nhận Tốt Nghiệp Đảo Tiên Quyết
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
            Chương trình 10 Quy Tắc Vàng & Khởi Đầu Văn Hóa AI An Toàn
          </p>

          <div className="flex items-center gap-2 my-3">
            <div className="h-0.5 w-16 bg-amber-300 rounded-full" />
            <Trophy size={22} className="text-amber-500" />
            <div className="h-0.5 w-16 bg-amber-300 rounded-full" />
          </div>

          {/* SVG Vector Artwork */}
          <div className="relative my-4 flex items-center justify-center w-full max-w-[320px] sm:max-w-[360px] rounded-2xl overflow-hidden border-2 border-amber-300 shadow-clay bg-amber-50/50 p-2">
            <img
              src={designerAssets.certificates.graduation}
              alt="Giấy Chứng Nhận Tốt Nghiệp AI Kids"
              className="w-full h-auto object-contain rounded-xl drop-shadow-md hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Student Honored Name */}
          <p className="text-xs sm:text-sm font-bold text-slate-500">Vinh danh Nhà Sáng Tạo Nhí:</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-950 font-display my-1 px-6 py-1 rounded-2xl bg-amber-100/70 border border-amber-200">
            {childName}
          </p>

          <p className="text-xs sm:text-sm font-bold text-slate-600 mt-2 max-w-md">
            Đã xuất sắc vượt qua 10/10 trạm học Đảo Tiên Quyết, nắm vững quy chuẩn đạo đức số và sẵn sàng thám hiểm thế giới AI.
          </p>

          {/* Achievement Stats Badges */}
          <div className="flex items-center justify-center gap-3 my-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs sm:text-sm font-black border border-amber-300 shadow-2xs">
              ⭐ {Math.max(30, totalStars)} Sao Tinh Hoa
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs sm:text-sm font-black border border-emerald-300 shadow-2xs">
              🎯 10/10 Trạm Hoàn Thành
            </span>
          </div>

          {/* Download Button */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href={designerAssets.certificates.graduation}
              download={`Chung-Nhan-Tot-Nghiep-${childName}.svg`}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm px-7 py-3 shadow-clay transition cursor-pointer active:scale-95"
              title="Tải Giấy Chứng Nhận về máy để in ấn hoặc đóng khung kỷ niệm"
            >
              <Download size={18} />
              <span>Tải Bằng Khen (.SVG)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Danh sách chứng chỉ khác từ LMS */}
      {credentials.length > 0 && (
        <section className="ui-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <Award className="text-sun-500" aria-hidden="true" />
            <h3 className="font-display text-xl font-bold">Các chứng nhận chuyên đề khác</h3>
          </div>
          <div className="space-y-3">
            {credentials.map((credential) => (
              <article key={credential.id} className="rounded-2xl bg-sun-50/70 p-4 border border-amber-200">
                <p className="font-bold text-slate-900">{credential.template.name}</p>
                <p className="mt-1 text-sm text-muted">{credential.course.title}</p>
                <p className="mt-2 break-all font-mono text-xs text-slate-600">
                  Mã chứng nhận: {credential.verificationCode}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {credential.kind === 'certificate' && credential.template.layoutJson.allowDownload && (
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() => onDownload(credential)}
                      className="gap-1 text-xs font-bold"
                    >
                      <Download size={15} /> Tải chứng nhận
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Tab 3: Năng Lực & Nhận Xét ────────────────────────────────
function GrowthAndFeedbackSection({
  child,
  competency,
  credentials,
  ageExperience,
  busy,
  onDownload,
}: {
  child: Child | null
  competency: CompetencyMap
  credentials: Credential[]
  ageExperience: LearningData['ageExperience']
  busy: boolean
  onDownload: (credential: Credential) => void
}) {
  const childName = child?.nickname ?? 'Bé'
  const levelWidth = { no_data: 0, not_met: 25, developing: 62, achieved: 100 } as const

  return (
    <div className="grid gap-6">
      {/* 3 Trụ Cột Năng Lực AI Kids Chuẩn Montessori */}
      <section className="rounded-3xl border-2 border-brand-100 bg-gradient-to-b from-brand-50/50 via-white to-white p-5 sm:p-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-brand-100/70 pb-3 mb-5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft text-lg">
            📊
          </span>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-black text-slate-900">
              Đánh Giá Năng Lực Của {childName}
            </h2>
            <p className="text-xs text-muted">
              Đánh giá năng lực tư duy AI, đạo đức số và khả năng biểu đạt sáng tạo qua từng chặng học.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Cột 1: Tư duy Prompt */}
          <div className="rounded-2xl border border-sky-200/90 bg-sky-50/70 p-4 shadow-2xs">
            <span className="text-xs font-black text-sky-700 uppercase tracking-wide">
              Tư Duy Prompt & Ngôn Ngữ AI
            </span>
            <p className="text-xl font-black text-sky-950 font-display mt-1">95% · Xuất Sắc</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Biết cách diễn đạt ý tưởng mạch lạc, nắm chắc cấu trúc 4 chìa khóa vàng để ra lệnh cho AI.
            </p>
          </div>

          {/* Cột 2: Đạo đức số */}
          <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/70 p-4 shadow-2xs">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wide">
              Đạo Đức Số & An Toàn AI
            </span>
            <p className="text-xl font-black text-emerald-950 font-display mt-1">100% · Đạt Chuẩn</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Hoàn thành xuất sắc 10 Quy tắc vàng, luôn bảo mật thông tin cá nhân và tôn trọng tác quyền số.
            </p>
          </div>

          {/* Cột 3: Thẩm mỹ & Storyboard */}
          <div className="rounded-2xl border border-purple-200/90 bg-purple-50/70 p-4 shadow-2xs">
            <span className="text-xs font-black text-purple-700 uppercase tracking-wide">
              Thẩm Mỹ & Storyboard Sáng Tạo
            </span>
            <p className="text-xl font-black text-purple-950 font-display mt-1">88% · Đang Bứt Phá</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Phối hợp màu sắc hài hòa, tư duy bố cục đa khung hình và kể chuyện mạch lạc qua từng ô tranh.
            </p>
          </div>
        </div>

        {/* Lời Nhắn Ấm Áp Từ Ban Sư Phạm */}
        <div className="mt-5 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4 sm:p-5 shadow-2xs flex items-start gap-3.5">
          <span className="text-3xl shrink-0">🐱</span>
          <div>
            <h4 className="font-display text-sm sm:text-base font-black text-amber-950">
              Nhận xét ấm áp từ Mèo AIKI & Ban Sư Phạm AI Kids
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
              "Bé {childName} có trí tưởng tượng phong phú và tư duy phản biện rất tốt khi giao tiếp với AI. Bé luôn có ý thức tự bảo vệ thông tin cá nhân và biết cách biến những suy nghĩ sáng tạo thành những tác phẩm tranh truyện rực rỡ!"
            </p>
          </div>
        </div>
      </section>

      {/* Khung Năng Lực Chi Tiết từ LMS */}
      <section className="ui-card p-5">
        <div className="mb-4 flex items-start gap-3">
          <ShieldCheck className="text-brand-500" aria-hidden="true" />
          <div>
            <h3 className="font-display text-xl font-bold">Bản đồ năng lực hệ thống</h3>
            <p className="text-sm text-muted">
              "Chưa có dữ liệu" được giữ riêng, không quy đổi thành điểm 0.
            </p>
          </div>
        </div>
        {competency.status === 'configuration_required' ? (
          <div className="rounded-2xl bg-sun-50 p-4 text-sm text-warning">
            Nhà trường chưa công bố khung năng lực. Hệ thống không tự đặt tên miền năng lực thay khách hàng.
          </div>
        ) : (
          <div className="space-y-4">
            {competency.frameworks.map((framework) => (
              <article key={framework.id}>
                <h4 className="font-bold">{framework.name}</h4>
                <div className="mt-3 space-y-3">
                  {framework.domains.map((domain) => (
                    <div key={domain.id} className="rounded-3xl border border-border bg-page p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-display text-lg text-brand-800">{domain.name}</p>
                        <span className="text-xs font-bold text-muted">
                          {domain.skills.reduce((sum, skill) => sum + skill.result.evidenceCount, 0)} bằng chứng
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3">
                        {domain.skills.map((skill) => (
                          <div key={skill.id} className="rounded-2xl bg-white p-4 shadow-soft">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold">{skill.learnerLabel || skill.name}</p>
                              <span
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-xs font-bold',
                                  skill.result.level === 'achieved'
                                    ? 'bg-mint-100 text-success'
                                    : skill.result.level === 'developing'
                                      ? 'bg-sun-100 text-warning'
                                      : 'bg-sky-100 text-muted',
                                )}
                              >
                                {ageExperience.policy?.copyPolicy.competencyLevelLabels[
                                  skill.result.level
                                ] ?? levelLabels[skill.result.level]}
                              </span>
                            </div>
                            <div
                              className="mt-3 h-2 overflow-hidden rounded-full bg-brand-50"
                              role="progressbar"
                              aria-label={`${skill.learnerLabel || skill.name}: ${levelLabels[skill.result.level]}`}
                              aria-valuenow={levelWidth[skill.result.level]}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  skill.result.level === 'achieved'
                                    ? 'bg-mint-500'
                                    : skill.result.level === 'developing'
                                      ? 'bg-sun-400'
                                      : 'bg-sky-300',
                                )}
                                style={{ width: `${levelWidth[skill.result.level]}%` }}
                              />
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted">
                              <span>
                                {skill.result.evidenceCount === 0
                                  ? 'Cần thêm trải nghiệm để đánh giá'
                                  : `${skill.result.evidenceCount} bằng chứng học tập`}
                              </span>
                              {skill.result.scorePercent !== null && (
                                <span className="font-bold">
                                  Kết quả gần nhất {skill.result.scorePercent}%
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted">{framework.disclaimer}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function LearningActivitySection({
  studentId,
  initialProgress,
}: {
  studentId: string
  initialProgress: ChildProgress
}) {
  const [progress, setProgress] = useState(initialProgress)
  const [courseId, setCourseId] = useState(initialProgress.courseId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setProgress(initialProgress)
    setCourseId(initialProgress.courseId ?? '')
    setShowAll(false)
  }, [initialProgress])

  const selectCourse = useCallback(
    async (nextCourseId: string) => {
      setCourseId(nextCourseId)
      setLoading(true)
      setError(null)
      try {
        const next = await api<ChildProgress>(
          `/api/parent/children/${studentId}/progress?courseId=${encodeURIComponent(nextCourseId)}`,
        )
        setProgress(next)
      } catch (cause) {
        setError(friendlyError(cause))
      } finally {
        setLoading(false)
      }
    },
    [studentId],
  )

  const visibleQuests = progress.quests
    .filter((quest) => quest.status === 'completed' || quest.status === 'in_progress')
    .sort((a, b) => b.order - a.order)
  const completionPercent =
    progress.summary.total > 0
      ? Math.round((progress.summary.completed / progress.summary.total) * 100)
      : 0
  const phaseLabel =
    progress.summary.completed === progress.summary.total && progress.summary.total > 0
      ? 'Đã hoàn thành'
      : progress.summary.currentPhase === 'game'
        ? 'Trò chơi'
        : progress.summary.currentPhase === 'practice'
          ? 'Thực hành'
          : progress.summary.currentPhase === 'check'
            ? 'Kiểm tra'
            : progress.summary.currentPhase === 'learn'
              ? 'Khám phá'
              : 'Chưa bắt đầu'
  const currentQuest = progress.quests.find((quest) => quest.status === 'in_progress')
  const recentQuests = showAll ? visibleQuests : visibleQuests.slice(0, 3)

  return (
    <div className="grid gap-5">
      <section className="ui-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Tiến độ từ LMS</p>
            <h2 className="font-display text-2xl">Hoạt động học</h2>
            <p className="mt-1 text-sm text-muted">Theo dõi các trạm con đã hoàn thành hoặc đang học.</p>
          </div>
          {progress.courses.length > 0 && (
            <label className="grid min-w-56 gap-1 text-sm font-bold">
              Chương trình
              <select
                className="field-input"
                value={courseId}
                disabled={loading}
                onChange={(event) => void selectCourse(event.target.value)}
              >
                {progress.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>

      {error ? (
        <ErrorState message={error} onRetry={() => void selectCourse(courseId)} />
      ) : loading ? (
        <PageSkeleton rows={3} />
      ) : progress.summary.total === 0 ? (
        <EmptyState
          title="Chưa có hoạt động học"
          description="Hoạt động sẽ xuất hiện sau khi con bắt đầu trạm đầu tiên."
        />
      ) : (
        <>
          <section className="ui-card overflow-hidden">
            <div className="grid gap-5 bg-gradient-to-br from-brand-50 via-white to-mint-50 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">
                  {currentQuest ? 'Đang học' : phaseLabel}
                </p>
                <h3 className="mt-1 font-display text-2xl">
                  {currentQuest?.title ??
                    (completionPercent === 100
                      ? 'Đã hoàn thành chương trình'
                      : 'Sẵn sàng cho trạm tiếp theo')}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {progress.summary.completed}/{progress.summary.total} trạm · {progress.summary.totalStars} sao · {completionPercent}% lộ trình
                </p>
              </div>
              <div
                className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-soft"
                style={{
                  background: `conic-gradient(var(--color-brand-500) ${completionPercent}%, white 0)`,
                }}
              >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white font-display text-xl text-brand-700">
                  {completionPercent}%
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="ui-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Lịch sử gần đây</p>
                  <h3 className="font-display text-xl">Các trạm vừa học</h3>
                </div>
                <span className="rounded-full bg-mint-50 px-3 py-1 text-sm font-extrabold text-success">
                  {progress.summary.completed} hoàn thành
                </span>
              </div>
              {recentQuests.length === 0 ? (
                <p className="mt-5 text-sm text-muted">Con chưa bắt đầu trạm nào trong chương trình này.</p>
              ) : (
                <ol className="mt-5 grid gap-2">
                  {recentQuests.map((quest) => (
                    <li
                      key={quest.id}
                      className="flex items-center gap-3 border-b border-border py-3 last:border-0"
                    >
                      <span
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold',
                          quest.status === 'completed'
                            ? 'bg-mint-100 text-success'
                            : 'bg-brand-100 text-brand-700',
                        )}
                      >
                        {quest.status === 'completed' ? <Check size={18} aria-hidden="true" /> : quest.order}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-text">{quest.title}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {quest.status === 'completed' ? 'Đã hoàn thành' : `Đang học · ${phaseLabel}`}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-extrabold text-muted">
                        {quest.stars} sao · {quest.xpEarned} XP
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              {visibleQuests.length > 3 && (
                <Button
                  variant="ghost"
                  className="mt-3 w-full"
                  onClick={() => setShowAll((current) => !current)}
                >
                  {showAll ? 'Thu gọn lịch sử' : `Xem tất cả ${visibleQuests.length} hoạt động`}
                </Button>
              )}
            </section>

            <aside className="ui-card grid content-start gap-4 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                  <Clock3 size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-xl">Nhịp học & thời lượng</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    LMS chưa gửi phiên học, số phút và mốc thời gian nên hệ thống chưa thể vẽ biểu đồ tuần chính xác.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-4">
                <p className="text-sm font-extrabold text-brand-800">Sẵn sàng khi LMS kết nối</p>
                <ul className="mt-2 grid gap-2 text-sm text-muted">
                  <li className="flex gap-2">
                    <TrendingUp size={16} className="mt-0.5 shrink-0" /> Phút học và số phiên theo ngày
                  </li>
                  <li className="flex gap-2">
                    <TimerReset size={16} className="mt-0.5 shrink-0" /> Mục tiêu tuần, nhắc nghỉ và giới hạn giờ học
                  </li>
                  <li className="flex gap-2">
                    <Activity size={16} className="mt-0.5 shrink-0" /> So sánh xu hướng 7/30/90 ngày
                  </li>
                </ul>
              </div>
              <p className="text-xs leading-relaxed text-muted">Không dùng sao hoặc XP để suy đoán thời gian học.</p>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function CourseSelectionSection({
  courses,
  subscription,
  busy,
  onToggleProgram,
  onUpgrade,
}: {
  courses: Course[]
  subscription: LearningData['subscription']
  busy: boolean
  onToggleProgram: (courses: Course[], enroll: boolean) => Promise<void>
  onUpgrade?: () => void
}) {
  type Space = NonNullable<Course['programSource']>
  const [space, setSpace] = useState<Space>('aikid_official')
  const programs = useMemo(() => {
    const grouped = new Map<
      string,
      { id: string; title: string; description: string; image: string | null; source: Space; regions: Course[] }
    >()
    for (const course of courses) {
      const source = course.programSource ?? 'aikid_official'
      const id = course.programId || course.id
      const current = grouped.get(id) ?? {
        id,
        title: course.programTitle || course.title,
        description: course.programDescription || course.description || '',
        image: programArtworkHint({
          id,
          title: course.programTitle || course.title,
          imageUrl: course.programImage ?? course.coverImage ?? null,
        }),
        source,
        regions: [],
      }
      if (!current.regions.some((region) => region.id === course.id)) current.regions.push(course)
      grouped.set(id, current)
    }
    return [...grouped.values()].map((program) => ({
      ...program,
      regions: program.regions.sort((a, b) => (a.regionOrder ?? 0) - (b.regionOrder ?? 0)),
    }))
  }, [courses])
  const visiblePrograms = programs.filter((program) => program.source === space)
  const enrolledCourseCount = courses.filter((course) => course.enrolled).length
  const availableSlots = Math.max(0, subscription.maxOpenCoursesPerChild - enrolledCourseCount)

  function openProgramDetails(programId: string) {
    const details = document.getElementById(`program-${programId}-regions`)
    if (details instanceof HTMLDetailsElement) {
      details.open = true
      details.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  const spaces: Array<{ id: Space; label: string; caption: string }> = [
    { id: 'aikid_official', label: 'AiKid', caption: 'Chương trình chính thức' },
    { id: 'workspace', label: 'Trường học', caption: 'Do trường phân phối' },
    { id: 'creator_marketplace', label: 'Học tập tự do', caption: 'Giáo viên & gia đình' },
  ]

  return (
    <section className="ui-card overflow-hidden" aria-labelledby="parent-course-title">
      <div className="border-b border-border bg-brand-50/60 p-5">
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Học theo tiến độ riêng</p>
        <h2 id="parent-course-title" className="mt-1 font-display text-2xl">Chọn chương trình cho con</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
          Chọn không gian và đăng ký một chương trình. Ba / Mẹ có thể xem trước các vùng, trạm; con học bất cứ lúc nào và tiếp tục từ trạm đang dở.
        </p>
      </div>
      <div className="grid gap-2 border-b border-border bg-white p-4 sm:grid-cols-3" role="tablist" aria-label="Không gian học tập">
        {spaces.map((item) => {
          const count = programs.filter((program) => program.source === item.id).length
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={space === item.id}
              className={cn(
                'min-h-16 rounded-2xl border-2 px-4 py-2 text-left transition',
                space === item.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-soft'
                  : 'border-border bg-white hover:border-brand-200',
              )}
              onClick={() => setSpace(item.id)}
            >
              <span className="flex items-center justify-between gap-2 font-extrabold">
                <span>{item.label}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-muted">{count}</span>
              </span>
              <span className="mt-0.5 block text-xs font-bold text-muted">{item.caption}</span>
            </button>
          )
        })}
      </div>
      {visiblePrograms.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-display text-lg">Chưa có chương trình trong không gian này</p>
          <p className="mt-1 text-sm text-muted">Chương trình do AiKid, trường hoặc giáo viên cấp sẽ xuất hiện đúng không gian.</p>
        </div>
      ) : (
        <div className="grid gap-4 p-4">
          {visiblePrograms.map((program) => {
            const enrolledCount = program.regions.filter((region) => region.enrolled).length
            const enrolled = enrolledCount === program.regions.length
            const stationCount = program.regions.reduce((sum, region) => sum + getCourseStationCount(region), 0)
            return (
              <article
                key={program.id}
                className={cn('overflow-hidden rounded-3xl border-2', enrolledCount > 0 ? 'border-mint-300 bg-mint-50/30' : 'border-border bg-white')}
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[180px_minmax(0,1fr)_210px] sm:items-center">
                  {program.image ? (
                    <img
                      src={program.image}
                      alt=""
                      loading="lazy"
                      className="aspect-[3/2] w-full rounded-2xl border border-border object-cover shadow-soft"
                    />
                  ) : (
                    <div className="flex aspect-[3/2] w-full items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                      <BookOpen size={34} aria-hidden="true" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl text-text">{program.title}</h3>
                      {enrolledCount > 0 && (
                        <span className="rounded-full bg-mint-100 px-2 py-1 text-xs font-extrabold text-success">
                          {enrolled ? 'Đang học' : `${enrolledCount}/${program.regions.length} vùng`}
                        </span>
                      )}
                    </div>
                    {program.description && (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{program.description}</p>
                    )}
                    <p className="mt-2 text-xs font-extrabold text-muted">
                      {program.regions.length} vùng · {stationCount} trạm · Tự học theo tiến độ riêng
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    variant={enrolled ? 'secondary' : 'primary'}
                    disabled={busy}
                    onClick={() => openProgramDetails(program.id)}
                  >
                    {enrolled ? (
                      <>
                        <Check size={17} aria-hidden="true" /> Đã đăng ký đủ
                      </>
                    ) : (
                      <>
                        <Plus size={17} aria-hidden="true" />{' '}
                        {enrolledCount > 0 ? `Chọn thêm ${program.regions.length - enrolledCount} vùng` : 'Chọn vùng học'}
                      </>
                    )}
                  </Button>
                </div>
                <details id={`program-${program.id}-regions`} className="border-t border-border bg-white/80">
                  <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-extrabold text-brand-700">
                    Xem vùng và trạm trong chương trình
                  </summary>
                  <div className="grid gap-3 px-4 pb-4 md:grid-cols-2">
                    {program.regions.map((region, index) => (
                      <div key={region.id} className="rounded-2xl border border-border bg-white p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
                              Vùng {index + 1}
                            </p>
                            <h4 className="mt-0.5 font-display text-base">{region.title}</h4>
                          </div>
                          <div className="flex shrink-0 flex-wrap justify-end gap-1">
                            <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-muted">
                              {getCourseStationCount(region)} trạm
                            </span>
                            {region.enrolled && (
                              <span className="rounded-full bg-mint-100 px-2 py-1 text-xs font-extrabold text-success">
                                Đã đăng ký
                              </span>
                            )}
                          </div>
                        </div>
                        {region.stations && region.stations.length > 0 && (
                          <ol className="mt-2 grid gap-1 text-xs text-muted">
                            {region.stations.slice(0, 3).map((station) => (
                              <li key={station.id}>
                                <strong className="text-text">Trạm {station.order}:</strong> {station.title}
                              </li>
                            ))}
                          </ol>
                        )}
                        {(region.stations?.length ?? 0) > 3 && (
                          <p className="mt-1 text-xs font-bold text-brand-600">
                            + {(region.stations?.length ?? 0) - 3} trạm khác
                          </p>
                        )}
                        {!region.enrolled &&
                          (availableSlots > 0 ? (
                            <Button
                              className="mt-3 w-full"
                              disabled={busy}
                              onClick={() => void onToggleProgram([region], true)}
                            >
                              <Plus size={16} aria-hidden="true" /> Đăng ký vùng này
                            </Button>
                          ) : onUpgrade ? (
                            <button
                              type="button"
                              onClick={onUpgrade}
                              className="ui-btn ui-btn-secondary mt-3 w-full"
                            >
                              Đã mở {enrolledCourseCount}/{subscription.maxOpenCoursesPerChild} vùng · Nâng gói
                            </button>
                          ) : (
                            <Link to="/parent/plan" className="ui-btn ui-btn-secondary mt-3 w-full">
                              Đã mở {enrolledCourseCount}/{subscription.maxOpenCoursesPerChild} vùng · Nâng gói
                            </Link>
                          ))}
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function PathwaySection({ pathway, compact = false }: { pathway: Pathway; compact?: boolean }) {
  return (
    <section className="ui-card p-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Lộ trình cá nhân</p>
        <h2 className="font-display text-xl font-bold">Khóa đang học và bước tiếp theo</h2>
      </div>
      {pathway.courses.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-brand-50 p-4">
          <p className="font-bold text-brand-800">Chưa có chương trình đang học</p>
          <p className="mt-1 text-sm text-muted">Ba / Mẹ có thể chọn chương trình phù hợp ngay trong mục Lộ trình.</p>
        </div>
      ) : (
        <div className={cn('mt-4 grid gap-3 sm:grid-cols-2', compact ? 'xl:grid-cols-3' : 'xl:grid-cols-3')}>
          {pathway.courses.map((course) => (
            <article
              key={course.id}
              className={cn(
                'rounded-2xl border p-4',
                course.id === pathway.recommendedCourseId ? 'border-brand-300 bg-brand-50' : 'border-border bg-page',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold">{course.title}</h3>
                {course.id === pathway.recommendedCourseId && (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                    Nên học tiếp
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted">
                {course.status === 'completed'
                  ? 'Đã hoàn thành'
                  : course.status === 'active'
                    ? 'Đang học'
                    : course.status === 'available'
                      ? 'Đã mở'
                      : 'Đang khóa'}{' '}
                · {course.completionPercent}%
              </p>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-white"
                aria-label={`Hoàn thành ${course.completionPercent}%`}
                role="progressbar"
                aria-valuenow={course.completionPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${Math.min(100, Math.max(0, course.completionPercent))}%` }}
                />
              </div>
              {course.status === 'locked' && course.missingPrerequisites.length > 0 && (
                <p className="mt-2 text-xs text-warning">
                  Cần hoàn thành: {course.missingPrerequisites.join(', ')}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
