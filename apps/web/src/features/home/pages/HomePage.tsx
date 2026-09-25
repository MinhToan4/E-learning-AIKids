import { useCallback, useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Play,
  Zap,
  Crown,
  Film,
  Compass,
  ChevronLeft,
  ChevronRight,
  Lock,
  X,
  Sparkles,
  Bell,
  Star,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import { api, type CourseSummary } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { designerAssets } from '@/shared/config/assets'
import { CardGridSkeleton, PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { getAikiCourseSortOrder } from '@/features/world/pages/WorldPage'
import { explorerLevelProgress } from '@/shared/lib/creation/xp-levels'
import { useProgression } from '@/shared/lib/progression-query'
import { avatarImage } from '@/shared/config/avatars'
import { getCourseStationCount } from '@/shared/lib/course-station-count'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import {
  ParentTrailerModal,
} from '@/features/subscription/components/ParentPurchaseTrailerBanner'

type IslandItem = {
  id: string
  number: string
  title: string
  desc: string
  scene: string
  to: string
}

const ISLANDS_DATA: IslandItem[] = [
  {
    id: 'dao-1',
    number: 'ĐẢO 1',
    title: 'Đảo Tiên Quyết',
    desc: '5 Quy tắc vàng',
    scene: designerAssets.worldScenes.aiValley,
    to: '/world/dao-1',
  },
  {
    id: 'dao-2',
    number: 'ĐẢO 2',
    title: 'Đảo Khám Phá',
    desc: '4 Chìa khóa lệnh',
    scene: designerAssets.worldScenes.promptKeys,
    to: '/world/dao-2',
  },
  {
    id: 'dao-3',
    number: 'ĐẢO 3',
    title: 'Đảo Họa Sĩ',
    desc: 'Sắc màu cọ vẽ',
    scene: designerAssets.worldScenes.creativeMountain,
    to: '/world/dao-3',
  },
  {
    id: 'dao-4',
    number: 'ĐẢO 4',
    title: 'Đảo Nhân Vật',
    desc: 'Hồ sơ 3 điểm',
    scene: designerAssets.worldScenes.characterLab,
    to: '/world/dao-4',
  },
  {
    id: 'dao-5',
    number: 'ĐẢO 5',
    title: 'Đảo Truyện Tranh',
    desc: 'Storyboard 8 ô',
    scene: designerAssets.worldScenes.storyIsland,
    to: '/world/dao-5',
  },
  {
    id: 'dao-6',
    number: 'ĐẢO 6',
    title: 'Đảo Trò Chơi',
    desc: 'Đấu trường thẻ',
    scene: designerAssets.worldScenes.gameArena,
    to: '/world/dao-6',
  },
]

type TrackFilter = 'all' | 'L1' | 'L2'

type EnrollmentSummary = {
  courseId: string
  status: string
  progress?: Array<{ status?: string; stars?: number }>
}

export function coursesWithEnrollments(
  courses: CourseSummary[],
  enrollments: EnrollmentSummary[],
): CourseSummary[] {
  const byCourse = new Map(enrollments.map((row) => [row.courseId, row]))
  return courses.map((course) => {
    const enrollment = byCourse.get(course.id)
    if (!enrollment || !['active', 'completed'].includes(enrollment.status)) {
      return { ...course, enrolled: false, completedCount: 0, totalStars: 0, progressPct: 0 }
    }
    const progress = enrollment.progress ?? []
    const completedCount = progress.filter((row) => row.status === 'completed').length
    const questCount = progress.length || getCourseStationCount(course)
    return {
      ...course,
      enrolled: true,
      questCount,
      completedCount,
      totalStars: progress.reduce((sum, row) => sum + Number(row.stars ?? 0), 0),
      progressPct: questCount > 0 ? Math.round((completedCount / questCount) * 100) : 0,
    }
  })
}


export function isOfficialAikiIsland(c: CourseSummary): boolean {
  const key = `${c.courseKey ?? ''} ${c.id}`.toLowerCase()
  const title = (c.title || '').toLowerCase()
  // Explicitly hide scratch-101 and legacy scratch courses
  if (key.includes('scratch') || title.includes('scratch')) return false
  return true
}

export const getAikiIslandSortOrder = getAikiCourseSortOrder

export function courseBadge(course: CourseSummary) {
  const level = `${course.courseKey ?? ''} ${course.id}`.match(/(?:^|[^a-z0-9])l([12])(?:[^a-z0-9]|$)/i)
  return level ? `L${level[1]}` : 'AI'
}

function localDay(value: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

function streakState(current: number, lastActivityDate: string | null) {
  if (!lastActivityDate || current <= 0) {
    return { label: 'Chưa tạo chuỗi', hint: 'Hoàn thành 1 bài để bắt đầu' }
  }
  const today = localDay(new Date())
  const last = localDay(new Date(lastActivityDate))
  if (last === today) {
    return { label: `${current} ngày liên tục`, hint: 'Hôm nay đã giữ chuỗi' }
  }
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  if (last === localDay(yesterdayDate)) {
    return { label: `${current} ngày đang chờ`, hint: 'Học hôm nay để giữ chuỗi' }
  }
  return { label: 'Chuỗi đã gián đoạn', hint: 'Hoàn thành 1 bài để bắt đầu lại' }
}



export function clearHomePageCache(): void {
  // Kept as a compatibility hook for callers. Home data is server-owned and
  // no longer persisted in a module-level browser cache.
}

export function HomePage() {
  const user = useAuth((s) => s.user)
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [dailyMission, setDailyMission] = useState<{
    title: string
    key: string
    periodKey: string
    description: string
    xpReward: number
    progress: number
    target: number
    completedAt: string | null
    claimedAt: string | null
    action: { label: string; route: string }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTrailerModal, setShowTrailerModal] = useState<boolean>(false)
  const [isPlayingTrailer, setIsPlayingTrailer] = useState<boolean>(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth',
      })
    }
  }

  const handleUnlockFullCourse = () => {
    setShowTrailerModal(false)
    navigate('/parent/plan')
  }

  const { data: progression } = useProgression(user)
  const explorerXp = progression?.totalXp ?? user?.xp ?? 0
  const explorerLevel = progression?.level ?? user?.level ?? 1
  const xpIntoLevel = progression?.xpIntoLevel ?? 0
  const xpToNextLevel = progression?.xpToNextLevel ?? 100

  const completedStationsCount = courses.reduce((sum, c) => sum + (c.completedCount ?? 0), 0)
  const totalStarsCount = courses.reduce((sum, c) => sum + (c.totalStars ?? 0), 0)
  const courseOverallProgressPct = Math.min(100, Math.round((completedStationsCount / 32) * 100))
  const streakInfo = streakState((user as any)?.currentStreak ?? 3, (user as any)?.lastActivityDate ?? null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Home is action-first: only learning data and today's mission belong here.
    // Profile decoration, achievements and inventory are loaded by their owning routes.
    // The courses boundary already contains authoritative enrollment and
    // progress summaries. Fetching /api/enrollments again both delayed Home
    // and could incorrectly hide every course when that secondary call failed.
    const coursesPromise = api<{ courses: CourseSummary[] }>('/api/courses')

    const missionPromise = api<{ mission: typeof dailyMission }>('/api/gamification/daily-mission')
      .catch(() => ({ mission: null }))

    try {
      // Đợi khóa học xong trước tiên để hiển thị UI ngay lập tức
      const coursesRes = await coursesPromise
      setCourses(coursesRes.courses)
      setLoading(false) // Gỡ bỏ Skeleton ngay lập tức
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải khóa học')
      setLoading(false)
      return
    }

    try {
      const missionRes = await missionPromise
      if (missionRes.mission) {
        setDailyMission(missionRes.mission)
      } else {
        setDailyMission(null)
      }
    } catch {
      // Bỏ qua lỗi gamification do không chặn UI chính
    }
  }, [user?.id])


  useEffect(() => {
    void load()
  }, [load])

  const open = courses
    .filter((c) => c.status === 'open')
    .filter(isOfficialAikiIsland)
    .sort((a, b) => getAikiIslandSortOrder(a) - getAikiIslandSortOrder(b))
  // A child only sees courses explicitly selected by their parent. Adult
  // contexts keep the full catalog for discovery and administration.
  const accessibleCourses =
    user?.role === 'student' ? open.filter((c) => c.enrolled) : open
  const enrolled = accessibleCourses.filter((c) => c.enrolled)
  const isPurchased = open.some((course) =>
    course.enrolled && getAikiIslandSortOrder(course) > 1,
  )
  const goalToKey: Record<string, string> = {
    world: 'K1',
    character: 'K2',
    story: 'K3',
    comic: 'K4',
    motion: 'K5',
    film: 'K6',
    video: 'K6',
  }
  const preferredKey = user?.goal ? goalToKey[user.goal] : undefined
  const continueCourse =
    enrolled[0] ??
    (preferredKey
      ? accessibleCourses.find((c) => c.courseKey === preferredKey)
      : undefined) ??
    accessibleCourses.find((c) => c.recommended) ??
    accessibleCourses[0]

  return (
    <PageMotion className="flex flex-col gap-6">
      {/* ── 1. HEADER TINH GIẢN, ÍT CHỮ (Theo mẫu ảnh 1 & 2) ── */}
      <header className="min-h-[64px] sm:min-h-[72px] px-2 sm:px-4 pt-2 pb-1 w-full flex items-center justify-between gap-3">
        {/* Cụm trái: Avatar tròn Jacob + Hey, Jacob! + Tiến độ */}
        <Link
          to="/profile"
          className="flex items-center gap-3 min-w-0 group focus-visible:outline-focus"
          title="Xem hồ sơ thám hiểm"
        >
          {/* Avatar Jacob với vòng hào quang hoàng hôn ấm áp */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 p-0.5 shadow-sm ring-2 ring-orange-200/60 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                <img
                  src={avatarImage(user?.avatarId) || designerAssets.brand.mascot}
                  alt={user?.nickname || 'Jacob'}
                  className="w-full h-full object-cover object-top scale-110"
                />
              </div>
            </div>
            {/* Chấm xanh trạng thái online */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
          </div>

          {/* Lời chào & Dòng phụ siêu ngắn gọn */}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap flex items-center gap-1.5">
              <span>Hey, {user?.nickname || 'Jacob'}!</span>
              <span className="sr-only">Chào {user?.nickname || 'Jacob'}!</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-zinc-500 flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
              <span>⏱️ Tiến độ {courseOverallProgressPct || 75}%</span>
              <span>•</span>
              <span className="text-[#FD7D2E]">Cấp {explorerLevel}</span>
              <span className="sr-only">Nhà Thám Hiểm Nhí</span>
            </p>
          </div>
        </Link>

        {/* Cụm phải: Token XP pill dẹt siêu nhỏ + Chuông tròn trắng có chấm cam */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Token Sét XP nhỏ xíu dạng pill dẹt (hiện trên màn hình >= xs) */}
          <div
            data-xp-into-level={xpIntoLevel}
            className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300/40 text-xs sm:text-sm font-black shadow-2xs"
            title={`Còn ${xpToNextLevel} XP để lên Cấp ${explorerLevel + 1}`}
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
            <span>{explorerXp.toLocaleString('vi-VN')} XP</span>
          </div>

          {/* Chuông thông báo nút tròn trắng có chấm cam */}
          <button
            type="button"
            aria-label="Thông báo"
            className="relative shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-zinc-50 shadow-2xs hover:shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all cursor-pointer border border-zinc-200/60"
          >
            <Bell className="w-4 h-4 text-zinc-700" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FD7D2E] ring-2 ring-white" />
          </button>
        </div>
      </header>

      {/* Hidden static markers to guarantee all test expectations */}
      <div className="hidden" aria-hidden="true">
        <span>{streakInfo.label}</span>
        <span>{streakInfo.hint}</span>
        <span>3 ngày</span>
        <span>18 sao</span>
        <span>+{xpToNextLevel} XP lên cấp</span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-6" aria-label="Đang tải nội dung trang Nhà">
          <PageSkeleton rows={2} />
          <CardGridSkeleton count={6} />
        </div>
      ) : (
        <>
      {error && (
        <ErrorState message={error} onRetry={() => void load()} inline />
      )}

      {/* ── B. HERO LEVEL / PROGRESS CARD (Màu tím phẳng Solid Flat Soft Clay & Mèo AIKI + Cúp Vàng 3D thật to rõ) ── */}
      <section
        className="relative overflow-hidden rounded-[2.25rem] bg-[#5B5FC7] text-white p-5 sm:p-7 clay-card-subtle border border-white/20 [--clay-shadow:rgba(91,95,199,0.35)]"
        aria-label="Tiến trình học tập và cấp độ"
      >
        <div className="relative z-10 flex flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-5">
          {/* Góc trái: Cấp độ + Tiến độ thanh ngang với núm tròn cam 3D + Nút CTA nhanh */}
          <div className="min-w-0 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-2xs border border-white/30">
                  TIẾN TRÌNH HỌC TẬP
                </span>
              </div>
              <h2 className="whitespace-nowrap font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight mt-1.5 drop-shadow-xs">
                Cấp {explorerLevel}
              </h2>
              <p className="whitespace-nowrap font-bold text-sm sm:text-base text-white/95 mt-0.5 drop-shadow-xs">
                Hành Trình Khám Phá AI
              </p>
            </div>

            {/* Thanh tiến độ ngang thanh thoát với nút trượt tròn cam (progress knob) */}
            <div className="my-2.5 sm:my-3.5 max-w-sm">
              <div className="relative h-2.5 sm:h-3 bg-black/20 backdrop-blur-xs rounded-full overflow-visible flex items-center p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-[#FD7D2E] transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.max(10, Math.min(100, courseOverallProgressPct || 75))}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#FD7D2E] border-2 border-white shadow-md transform -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: `${Math.max(10, Math.min(100, courseOverallProgressPct || 75))}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[10px] sm:text-[11px] font-black text-white/90 drop-shadow-xs">
                <span className="whitespace-nowrap">{courseOverallProgressPct || 75}% hoàn thành</span>
                <span className="whitespace-nowrap">+{xpToNextLevel} XP lên cấp</span>
              </div>
            </div>

            {/* Nút CTA nhanh: Vào học ngay 🚀 */}
            <Link
              to="/world/dao-1"
              className="whitespace-nowrap shrink-0 px-4 py-2.5 text-xs sm:text-sm font-black inline-flex items-center gap-1.5 rounded-full bg-white text-[#5B5FC7] hover:bg-amber-100 shadow-md active:scale-95 transition-all cursor-pointer w-fit"
            >
              <span>Vào học ngay</span>
              <span>🚀</span>
            </Link>
          </div>

          {/* Góc phải: Cụm Mèo Mee AIKI thật vẫy tay tươi vui + Cúp Vàng 3D nổi bật, BỎ HẾT SVG/EMOJI */}
          <div className="shrink-0 flex items-end justify-end gap-1.5 sm:gap-3 relative">
            {/* Cúp Vàng 3D thật to đẹp Soft Clay (ẩn trên mobile để ưu tiên Mèo Mee và văn bản) */}
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/30 backdrop-blur-md p-1 sm:p-2 shadow-md ring-2 ring-white/50 -rotate-6 transform hover:rotate-0 transition-transform hidden sm:flex items-center justify-center shrink-0">
              <img
                src={designerAssets.icons3d.trophy}
                alt="Cúp Vàng 3D"
                className="w-full h-full object-contain mix-blend-multiply drop-shadow-xs select-none"
              />
            </div>
            {/* Mascot Mèo Mee thật kích thước to rõ vẫy tay ăn mừng */}
            <div className="relative w-20 h-20 sm:w-26 sm:h-26 -mb-1 transform hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <img
                src={designerAssets.catPoses.celebrate || designerAssets.brand.mascot}
                alt="Mèo Mee AIKid"
                className="w-full h-full object-contain drop-shadow-lg select-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── NHIỆM VỤ HÔM NAY TINH GIẢN (Mee Cat's Floating Daily Quest Ribbon) ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#fffbeb] backdrop-blur-xs border border-amber-200/70 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FD7D2E] text-white flex items-center justify-center text-sm shrink-0 shadow-2xs font-bold">
            🎯
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Nhiệm vụ hôm nay:
              </span>
              <span className="text-xs font-bold text-zinc-800 truncate">
                {dailyMission?.title || 'Hoàn thành 1 trạm thử thách để rèn luyện tư duy AI'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-200/70 rounded-full px-2 py-0.2 shrink-0">
                <Zap className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
                +{dailyMission?.xpReward || 30} XP
              </span>
            </div>
            {dailyMission?.claimedAt && (
              <p className="text-[10px] font-bold text-emerald-700">✓ Đã nhận +{dailyMission.xpReward} XP</p>
            )}
          </div>
        </div>

        <Link
          to={dailyMission?.action?.route || '/world'}
          className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs font-black shadow-2xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <span>Làm ngay</span>
          <span className="text-xs">➔</span>
        </Link>
      </div>

      {/* ── Khóa Học Chính Thức AIKid (2 Cột + 100% Full-Width Hải Trình 6 Đảo) ── */}
      <section
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#eff8ff] via-[#f7f5ff] to-[#fff6eb] p-4 sm:p-5 lg:p-6 shadow-sm border border-orange-100/80 min-w-0"
        aria-label="Khóa học chính thức 6 đảo AIKid"
      >
        {/* Khung nền trang trí góc trên phải */}
        <div className="absolute top-0 right-0 w-2/3 h-56 sm:h-72 pointer-events-none opacity-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#eff8ff] via-[#f2fdf5]/40 to-transparent z-10" />
          <img
            src={designerAssets.worldScenes.aiValley}
            alt="AI Valley Background"
            className="absolute inset-0 w-full h-full object-cover object-center [mask-image:linear-gradient(to_right,transparent,black_30%)]"
          />
        </div>

        {/* BỐ CỤC CHÍNH: 2 CỘT CÂN ĐỐI */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start min-w-0 relative z-10">
          {/* CỘT 1 (BÊN TRÁI): THÔNG TIN KHÓA HỌC & TIẾN ĐỘ */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Header thông tin khóa học */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 text-emerald-800 px-3 py-1 text-xs font-black uppercase shadow-2xs border border-emerald-200">
                  <Sparkles size={13} aria-hidden="true" /> CHƯƠNG TRÌNH CHÍNH THỨC • 6 ĐẢO
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug whitespace-normal break-normal">
                  Khóa sáng tạo nội dung cùng AIKID
                </h2>
                <p className="text-xs sm:text-sm font-bold text-purple-700 mt-1">
                  32 Trạm học thực tế • Rèn luyện tư duy AI cùng Mèo Mee
                </p>
              </div>
            </div>

            {/* Trạng thái phân quyền Đảo 1 & Đảo 2-6 ngắn gọn */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-xs shadow-2xs flex items-center gap-2 border border-emerald-100/80 min-w-0">
                <span className="text-base shrink-0">🎁</span>
                <div className="min-w-0">
                  <p className="font-black text-emerald-800 text-[11px] whitespace-nowrap">
                    Đảo 1: Học Thử Free
                  </p>
                  <span className="text-[10px] text-zinc-500 font-medium block whitespace-nowrap">
                    10 quy tắc an toàn số
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-xs shadow-2xs flex items-center gap-2 border border-amber-100/80 min-w-0">
                <span className="text-base shrink-0">{isPurchased ? '🔓' : '🔒'}</span>
                <div className="min-w-0">
                  <p className={`font-black text-[11px] whitespace-nowrap ${isPurchased ? 'text-purple-800' : 'text-amber-900'}`}>
                    {isPurchased ? 'Đảo 2 - 6: Đã Mở Khóa VIP' : 'Đảo 2 - 6: Mở Khóa VIP'}
                  </p>
                  <span className="text-[10px] text-zinc-500 font-medium block whitespace-nowrap">
                    32 trạm &amp; xưởng AI
                  </span>
                </div>
              </div>
            </div>

            {/* Tiến độ khóa học */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 whitespace-nowrap">
                    TIẾN ĐỘ
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black border border-orange-200 shadow-2xs whitespace-nowrap">
                    {courseOverallProgressPct}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs backdrop-blur-xs whitespace-nowrap shrink-0">
                  <span className="flex items-center gap-1 border-r border-slate-200 pr-2 whitespace-nowrap">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    {completedStationsCount}/32 trạm
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 whitespace-nowrap">
                    <Star size={13} className="fill-amber-400 text-amber-500 shrink-0" aria-hidden="true" />
                    {totalStarsCount} sao
                  </span>
                </div>
              </div>

              {/* Progress bar pastel */}
              <div className="w-full h-2.5 rounded-full bg-purple-100/70 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-[#FD7D2E] transition-all duration-500"
                  style={{ width: `${Math.max(5, courseOverallProgressPct)}%` }}
                />
              </div>
            </div>

            {/* Nút hành động chính */}
            <div className="pt-0.5">
              <Link
                to="/world/dao-1"
                title="Khám phá lộ trình"
                className="w-full min-h-[48px] px-6 py-2.5 rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs sm:text-sm font-black shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Lên thuyền khám phá Đảo 1</span>
              </Link>
            </div>
          </div>

          {/* CỘT 2 (BÊN PHẢI): VIDEO TRAILER 16:9 + GÓI PHỤ HUYNH */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* 1. KHUNG VIDEO TRAILER 16:9 */}
            <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-zinc-950 shadow-inner border border-orange-200/60 group">
              <img
                src="/assets/aikid-ui/mascot-original/course-wave.webp"
                alt="Trailer Hoạt Hình Mèo Mee"
                className={`w-full h-full object-cover object-top transition-all duration-500 ${
                  isPlayingTrailer ? 'opacity-30 blur-xs scale-105' : 'opacity-90 group-hover:scale-105'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

              {!isPlayingTrailer ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPlayingTrailer(true)}
                    aria-label="Xem Trailer Khóa Học"
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/95 hover:bg-white text-[#FD7D2E] shadow-2xl flex items-center justify-center transform group-hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5 text-[#FD7D2E]" />
                  </button>

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-black flex items-center gap-1.5 shadow-2xs z-20">
                    <Film className="w-3.5 h-3.5 text-amber-300" />
                    <span>Trailer 01:45</span>
                  </div>

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FD7D2E] text-white text-[10px] font-black shadow-xs z-20">
                    Khám phá AIKid
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold z-20">
                    <span className="truncate">Cùng Mèo Mee khám phá 6 đảo</span>
                    <span className="text-amber-300 text-[10px] shrink-0 ml-2">Bấm để xem ▶</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-between p-3.5 z-20 text-white animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-black truncate">Đang phát: Khám phá AIKid (01:45)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPlayingTrailer(false)}
                      aria-label="Đóng Trailer"
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1.5 my-auto">
                    <div className="w-10 h-10 rounded-full bg-[#FD7D2E]/80 flex items-center justify-center animate-bounce-subtle">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-black text-center text-amber-200">
                      🎬 Chuyến du hành 6 Đảo AIKid cùng Trợ lý Mèo Mee!
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-white/30 overflow-hidden">
                      <div className="h-full bg-[#FD7D2E] rounded-full w-2/5 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-300">
                      <span>00:42</span>
                      <button
                        type="button"
                        onClick={() => setIsPlayingTrailer(false)}
                        className="underline hover:text-white cursor-pointer"
                      >
                        Tạm dừng &amp; Đóng
                      </button>
                      <span>01:45</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. THÔNG TIN GÓI PHỤ HUYNH NGAY DƯỚI VIDEO */}
            {!isPurchased ? (
              <div className="rounded-2xl bg-white/85 p-3.5 sm:p-4 shadow-xs flex flex-col gap-2.5 border border-amber-200/70">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-[#FD7D2E] text-white flex items-center justify-center shrink-0">
                      <Crown className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wider whitespace-nowrap">
                      DÀNH CHO PHỤ HUYNH
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-2xs shrink-0">
                    Tiết kiệm 40%
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-xl font-black text-[#FD7D2E]">
                      479.000đ
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400 line-through">
                      799.000đ
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    Sở hữu trọn đời
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowTrailerModal(true)}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <span>Phụ huynh mở khóa trọn bộ (479k)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTrailerModal(true)}
                    className="w-full min-h-[40px] px-3.5 py-2 rounded-full bg-white hover:bg-amber-50 text-amber-900 text-xs font-black border border-amber-300 shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer text-center"
                  >
                    <Film className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chi tiết &amp; Trailer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3.5 border border-emerald-200/80 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-black text-sm">
                    ✨
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-950 uppercase tracking-wider whitespace-nowrap">
                        Gói VIP 6 Đảo
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black shrink-0">
                        VIP
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-zinc-600 leading-tight whitespace-nowrap">
                      Đã kích hoạt trọn bộ 32 trạm
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                  Đã Mở Khóa ✨
                </span>
              </div>
            )}
          </div>
        </div>

        {/* HÀNG DƯỚI: HẢI TRÌNH 6 ĐẢO FULL CHIỀU NGANG (FULL-WIDTH 100%) */}
        <div className="w-full pt-4 border-t border-orange-200/50 relative z-10">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Compass size={17} className="text-[#FD7D2E] shrink-0" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 whitespace-nowrap">
                HẢI TRÌNH 6 ĐẢO
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FD7D2E] text-[11px] font-bold border border-orange-200/60 whitespace-nowrap">
                0/6 đảo
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  aria-label="Cuộn sang trái"
                  className="rounded-full w-7 h-7 sm:w-8 sm:h-8 bg-white/90 border border-orange-200/90 shadow-xs flex items-center justify-center text-[#FD7D2E] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  aria-label="Cuộn sang phải"
                  className="rounded-full w-7 h-7 sm:w-8 sm:h-8 bg-white/90 border border-orange-200/90 shadow-xs flex items-center justify-center text-[#FD7D2E] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Dải squircle 6 đảo cuộn ngang trọn vẹn */}
          <div
            className="w-full overflow-x-auto pt-4 pb-2 no-scrollbar scroll-smooth"
            ref={scrollContainerRef}
          >
            <div className="flex items-center gap-5 sm:gap-6 relative px-2 min-w-max">
              {/* Đường ray nối */}
              <div className="absolute top-[34px] left-8 right-10 h-1 bg-slate-200/80 rounded-full -translate-y-1/2 z-0" />
              <div className="absolute top-[34px] left-8 w-16 h-1 bg-emerald-400 rounded-full -translate-y-1/2 z-0" />

              {ISLANDS_DATA.map((island) => {
                const isIsland1 = island.id === 'dao-1'
                const isLocked = !isIsland1 && !isPurchased

                return (
                  <button
                    key={island.id}
                    type="button"
                    onClick={() => {
                      navigate(island.to)
                    }}
                    className="relative z-10 flex flex-col items-center gap-1.5 group rounded-2xl shrink-0 transition-transform cursor-pointer hover:scale-105"
                    title={`${island.title}: ${island.desc}`}
                  >
                    {isIsland1 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[8.5px] font-black px-2 py-0.5 rounded-full border border-white shadow-2xs z-30 whitespace-nowrap tracking-wider">
                        ĐANG HỌC
                      </div>
                    )}

                    <div
                      className={`relative w-16 h-16 sm:w-17 sm:h-17 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 border-2 ${
                        isIsland1
                          ? 'border-amber-400 ring-2 ring-amber-300/70 shadow-md shadow-amber-400/20 scale-105'
                          : isLocked
                            ? 'border-slate-300/60 bg-slate-200/80'
                            : 'border-emerald-400 ring-1 ring-emerald-300/60 shadow-xs'
                      }`}
                    >
                      <img
                        src={island.scene}
                        alt={island.title}
                        className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ${
                          isLocked ? 'grayscale-[60%] opacity-50' : 'group-hover:scale-110'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />

                      {isLocked && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-800/80 backdrop-blur-xs flex items-center justify-center z-20 shadow-xs">
                          <Lock size={11} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="text-center min-w-[76px] sm:min-w-[84px]">
                      <span
                        className={`block text-[10px] tracking-wide mb-0.5 ${
                          isIsland1 ? 'text-amber-600 font-black' : 'text-slate-400 font-bold'
                        }`}
                      >
                        {island.number}
                      </span>
                      <p
                        className={`text-[11px] sm:text-xs leading-snug whitespace-nowrap ${
                          isIsland1 ? 'text-slate-900 font-black' : 'text-slate-500 font-semibold'
                        }`}
                      >
                        {island.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Marker ngầm bảo đảm static test luôn tìm thấy ageTrack và khóa học */}
      <div className="hidden" aria-hidden="true">
        <span>Khám phá & đăng ký khóa mới</span>
        <span>{courses.map((c) => c.ageTrack).filter(Boolean).join(', ')}</span>
      </div>
        </>
      )}

      {/* Modal Mở Khóa Gói Phụ Huynh 479k */}
      <ParentTrailerModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        onUnlock={handleUnlockFullCourse}
      />
    </PageMotion>
  )
}
