import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { CheckCircle2, Lock, Star, Trophy } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { KidLockImageIcon } from '@/shared/components/icons/KidImageIcons'
import { CourseBookIcon } from '@/shared/components/icons/KidNavIcons'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { CoursePaywallModal } from '@/features/lesson/components/CoursePaywallModal'
import { ParentGateModal } from '@/features/parent/components/ParentGateModal'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import { getCourseStationCount } from '@/shared/lib/course-station-count'
import { ArchipelagoGameVoyage } from './ArchipelagoGameVoyage'
import { prefetchRoute, prefetchRouteImmediately } from '@/app/route-prefetch'
import { designerAssets } from '@/shared/config/assets'
import { clampCourseAggregateStars } from '@/shared/lib/star-progress'
import {
  getAikiCourseSortOrder,
  isAikiRuleCourse,
  isPathwayCourseVisible,
  applyGatekeeperRules,
  sortAikiCourses,
} from '../lib/world-gatekeeper'
import {
  type PathwayCourse,
  type Pathway,
  isUserTestingUnlocked,
  FORCE_UNLOCK_ALL_ISLANDS,
  selectCanonicalAikidCourses,
  selectNextLearningTarget,
  formatCourseTitle,
  getStationSlug,
} from '../lib/world-pathway-mapper'

export const AIKID_SIX_ISLANDS_CONFIG = [
  {
    index: 0,
    badge: 'TIÊN QUYẾT',
    title: 'Đảo Tiên Quyết',
    subtitle: '10 Quy tắc vàng',
    description: 'Nắm vững 10 nguyên tắc an toàn, đạo đức và làm chủ AI của Xưởng sáng tạo.',
    scene: designerAssets.worldScenes.aiValley,
    accentColor: '#7c3aed',
    bgPastel: 'bg-violet-50/70 border-violet-200/90 text-violet-950',
    slug: 'muoi-quy-tac-xuong-sang-tao',
    canonicalSlug: 'muoi-quy-tac-xuong-sang-tao',
  },
  {
    index: 1,
    badge: 'ĐẢO 1',
    title: 'Đảo Khám Phá',
    subtitle: 'Nhà Thám Hiểm AI',
    description: 'Bốn Chiếc Chìa Khóa Vàng (Cái gì? Trông thế nào? Đang làm gì? Ở đâu?)',
    scene: designerAssets.worldScenes.promptKeys,
    accentColor: '#059669',
    bgPastel: 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950',
    slug: 'dao-1',
    canonicalSlug: 'dao-1-nha-tham-hiem-ai',
  },
  {
    index: 2,
    badge: 'ĐẢO 2',
    title: 'Đảo Họa Sĩ',
    subtitle: 'Hoạ Sĩ AI',
    description: 'Bố cục ngôi sao 3 lớp, ánh sáng cảm xúc và tạo ra bức tranh biết nói.',
    scene: designerAssets.worldScenes.creativeMountain,
    accentColor: '#ea580c',
    bgPastel: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
    slug: 'dao-2',
    canonicalSlug: 'dao-2-hoa-si-ai',
  },
  {
    index: 3,
    badge: 'ĐẢO 3',
    title: 'Đảo Nhân Vật',
    subtitle: 'Biệt Đội Nhân Vật AI',
    description: 'Khoá mật mã nhận diện 3 điểm, biến hoá 6 biểu cảm và căn cứ bí mật.',
    scene: designerAssets.worldScenes.characterLab,
    accentColor: '#0284c7',
    bgPastel: 'bg-sky-50/70 border-sky-200/90 text-sky-950',
    slug: 'dao-3',
    canonicalSlug: 'dao-3-biet-doi-nhan-vat-ai',
  },
  {
    index: 4,
    badge: 'ĐẢO 4',
    title: 'Đảo Truyện Tranh',
    subtitle: 'Vương Quốc Truyện Tranh AI',
    description: 'Storyboard 8 Ô & Comic — Kịch bản 3 cổng, khung xương 4 nhịp và xuất bản cuốn truyện tranh 8 trang.',
    scene: designerAssets.worldScenes.storyIsland,
    accentColor: '#db2777',
    bgPastel: 'bg-pink-50/70 border-pink-200/90 text-pink-950',
    slug: 'dao-4',
    canonicalSlug: 'dao-4-vuong-quoc-truyen-tranh-ai',
  },
  {
    index: 5,
    badge: 'ĐẢO 5',
    title: 'Đảo Trò Chơi',
    subtitle: 'Nhà Phát Minh Trò Chơi AI',
    description: 'Đấu Trường Thẻ Bài — Bộ 12 thẻ bài cân bằng chỉ số Sức-Nhanh-Khéo, bàn cờ A3 và luật chơi công bằng.',
    scene: designerAssets.worldScenes.gameArena,
    accentColor: '#4f46e5',
    bgPastel: 'bg-indigo-50/70 border-indigo-200/90 text-indigo-950',
    slug: 'dao-5',
    canonicalSlug: 'dao-5-nha-phat-minh-tro-choi-ai',
  },
] as const

export function ModernIslandCard({
  course,
  index,
  isRecommended: _isRecommended,
  onLockedClick,
}: {
  course: PathwayCourse
  index: number
  isRecommended?: boolean
  onLockedClick?: (course: PathwayCourse) => void
}) {
  const order = getAikiCourseSortOrder(course)
  const safeIdx =
    order >= 0 && order < AIKID_SIX_ISLANDS_CONFIG.length
      ? order
      : index % AIKID_SIX_ISLANDS_CONFIG.length
  const config = AIKID_SIX_ISLANDS_CONFIG[safeIdx]

  const isDevUnlock = isUserTestingUnlocked()
  const forceUnlock =
    FORCE_UNLOCK_ALL_ISLANDS ||
    isDevUnlock ||
    course.programUnlockMode === 'parallel' ||
    course.reasonCode === 'manual_override'
  const isCompleted = course.status === 'completed'
  const isLocked = !forceUnlock && course.status === 'locked'
  const isActive = !isLocked && !isCompleted

  const stationCount = getCourseStationCount(course) || 4
  const completedStations = isCompleted
    ? stationCount
    : Math.min(stationCount, Math.max(0, course.completedCount ?? 0))
  const percent = isCompleted
    ? 100
    : stationCount > 0
    ? Math.round((completedStations / stationCount) * 100)
    : 0

  const targetSlug = config.slug || course.slug || course.id
  const islandUrl = `/world/${targetSlug}`
  const isRuleCourse = isAikiRuleCourse(course, index)

  const handleCardClick = (e: React.MouseEvent) => {
    if (isLocked && onLockedClick) {
      e.preventDefault()
      e.stopPropagation()
      onLockedClick(course)
    }
  }

  return (
    <article
      id={`island-${safeIdx + 1}`}
      onClick={isLocked ? handleCardClick : undefined}
      className={cn(
        'group relative flex min-w-0 flex-col justify-between rounded-[2rem] border-2 bg-[#FFFDF7] p-3.5 sm:p-5 shadow-clay transition-all duration-300 hover:shadow-md h-full',
        isActive ? 'border-orange-400 ring-2 ring-orange-200/60' : 'border-amber-200/90',
        isLocked ? 'cursor-pointer opacity-85 hover:opacity-100 hover:border-amber-300' : '',
      )}
    >
      <div>
        {/* Khung ảnh Đảo To, Rõ Ràng, Tươi Sáng (Không bị hộp che mất nửa ảnh) */}
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-b from-sky-100/90 via-sky-50/70 to-amber-50/60 shadow-inner group flex items-center justify-center p-1.5 sm:p-2">
          <img
            src={config.scene}
            alt={config.title}
            className={cn(
              'h-full w-full object-contain object-center transition-transform duration-500',
              !isLocked && 'group-hover:scale-103',
              isLocked && 'filter grayscale contrast-75 brightness-95 opacity-70',
            )}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
          />

          {/* Badge số thứ tự: ĐẢO 1..6 */}
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
            <span className="rounded-full border border-amber-200/80 bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-2xs backdrop-blur-xs">
              {config.badge}
            </span>
            {course.isGatekeeper && (
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-2xs">
                Tiên Quyết
              </span>
            )}
          </div>

          {/* Trạng thái rõ ràng */}
          <div className="absolute right-3 top-3 z-10">
            {isCompleted && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-xs border border-white/60">
                <span>ĐÃ XONG</span>
              </span>
            )}
            {isActive && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black shadow-xs border border-white/60 animate-pulse">
                <span>ĐANG HỌC</span>
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-200 text-[10px] font-black shadow-xs backdrop-blur-xs border border-white/30">
                <Lock size={10} className="text-slate-300" />
                <span>CHƯA MỞ</span>
              </span>
            )}
          </div>

          {/* Mèo AIKI đồng hành trên Đảo đang học */}
          {isActive && (
            <div className="absolute bottom-1 right-2 flex items-center gap-1 z-10 select-none animate-in fade-in duration-300">
              <div className="bg-white/95 text-slate-900 px-2 py-0.5 rounded-xl rounded-br-xs text-[9.5px] font-black shadow-md border border-amber-300">
                Vào cùng tớ nhé!
              </div>
              <img
                src="/assets/aikid-ui/mascot-original/course-wave.webp"
                alt="Mèo AIKI"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md"
              />
            </div>
          )}
        </div>

        {/* Nội dung thông tin đảo tinh gọn, không box lồng thô cứng */}
        <div className="mt-3.5 space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {config.title}
            </h3>
            <span className="text-xs font-black text-[#FD7D2E] shrink-0">
              {config.subtitle}
            </span>
          </div>

          <p className="text-xs font-medium text-slate-600 line-clamp-1 leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Thanh tiến độ */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-600">Tiến độ đảo</span>
            <span
              className={
                isCompleted
                  ? 'text-emerald-700'
                  : isActive
                  ? 'text-orange-700'
                  : 'text-slate-500'
              }
            >
              {completedStations}/{stationCount} trạm ({percent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-amber-100/80 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isCompleted
                  ? 'bg-emerald-500'
                  : isActive
                  ? 'bg-orange-500'
                  : 'bg-slate-300',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Dãy các trạm học (Station Dots Soft Clay) */}
        {stationCount > 0 && (
          <div
            className="scrollbar-none mt-3 overflow-x-auto pb-1"
            aria-label={`${completedStations}/${stationCount} trạm hoàn thành`}
          >
            <ol className="flex min-w-max items-center gap-1.5 px-0.5">
              {Array.from({ length: stationCount }, (_, stationIndex) => {
                const station = course.stations?.[stationIndex]
                const stationNumber = stationIndex + 1
                const isDone = station?.status === 'completed' || stationNumber <= completedStations
                const isCurrent =
                  station?.status === 'available' ||
                  station?.status === 'in_progress' ||
                  (!isCompleted && stationNumber === completedStations + 1)
                const stationSlug = station ? getStationSlug(station, isRuleCourse) : ''
                const dotClassName = cn(
                  'inline-flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-black transition-transform cursor-pointer',
                  isDone
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isCurrent
                    ? 'border-orange-400 bg-orange-100 text-orange-800 ring-2 ring-orange-200'
                    : 'border-amber-200/80 bg-[#FFFCEB] text-slate-500',
                )
                const canOpenStation =
                  Boolean(stationSlug.trim()) &&
                  !isLocked &&
                  (forceUnlock || station?.status !== 'locked')

                return (
                  <li
                    key={`${course.id}-${station?.id || station?.slug || stationNumber}`}
                    className="flex items-center gap-1"
                  >
                    {canOpenStation && station ? (
                      <Link
                        to={`/world/${targetSlug}/lesson/${stationSlug}`}
                        className={cn(dotClassName, 'hover:scale-110 active:scale-95')}
                        aria-label={`Mở trạm ${stationNumber}: ${station.title || ''}`}
                      >
                        {stationNumber}
                      </Link>
                    ) : (
                      <span className={dotClassName} aria-label={`Trạm ${stationNumber}`}>
                        {stationNumber}
                      </span>
                    )}
                    {stationIndex < stationCount - 1 && (
                      <span className="h-0.5 w-2 rounded-full bg-amber-200" />
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {/* Chỉ dẫn điều kiện mở khóa khi chưa mở */}
        {isLocked && (
          <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-[#FFFCEB] border border-amber-200/70 p-2 text-xs font-semibold leading-relaxed text-amber-950/80">
            <Lock size={12} className="shrink-0 text-amber-600" />
            <span className="truncate">
              {course.lockMessage || 'Bé hãy hoàn thành Đảo Khám Phá trước để mở khóa nhé!'}
            </span>
          </div>
        )}
      </div>

      {/* Nút bấm hành động (ZERO ARROWS, ZERO EMOJIS) */}
      <div className="pt-3 mt-1">
        {isCompleted ? (
          <Link
            to={islandUrl}
            className="block w-full"
            onPointerEnter={() => prefetchRoute(islandUrl)}
            onPointerDown={() => prefetchRouteImmediately(islandUrl)}
            onFocus={() => prefetchRoute(islandUrl)}
          >
            <Button
              variant="secondary"
              className="min-h-10 w-full rounded-xl border-emerald-300 px-4 py-2 text-xs sm:text-sm font-black text-emerald-800 hover:bg-emerald-50 active:scale-95 shadow-2xs"
            >
              Ôn lại đảo
            </Button>
          </Link>
        ) : isActive ? (
          <Link
            to={islandUrl}
            className="block w-full"
            onPointerEnter={() => prefetchRoute(islandUrl)}
            onPointerDown={() => prefetchRouteImmediately(islandUrl)}
            onFocus={() => prefetchRoute(islandUrl)}
          >
            <Button className="min-h-10 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-black active:scale-95 shadow-clay">
              Khám phá đảo
            </Button>
          </Link>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={handleCardClick}
            className="min-h-10 w-full cursor-pointer rounded-xl border-amber-200 bg-white px-4 py-2 text-xs sm:text-sm font-black text-amber-950 hover:bg-amber-50 active:scale-95 shadow-2xs"
          >
            Xem điều kiện
          </Button>
        )}
      </div>
    </article>
  )
}

export function ConnectedIslandJourney({
  courses,
  recommendedCourseId,
  onLockedClick,
}: {
  courses: PathwayCourse[]
  recommendedCourseId?: string
  onLockedClick: (course: PathwayCourse) => void
}) {
  const scrollToIsland = (idx: number) => {
    const el = document.getElementById(`island-${idx + 1}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="space-y-4 py-2 sm:py-3">
      {/* ── THANH ĐIỀU HƯỚNG 6 ĐẢO NHANH (Mini Island Waypoint Bar) ── */}
      <div className="scrollbar-none overflow-x-auto pb-1">
        <nav
          aria-label="Điều hướng nhanh 6 đảo"
          className="flex min-w-max items-center gap-2 p-1.5 rounded-2xl bg-white/90 border border-amber-200/80 shadow-2xs"
        >
          {courses.map((course, index) => {
            const order = getAikiCourseSortOrder(course)
            const safeIdx =
              order >= 0 && order < AIKID_SIX_ISLANDS_CONFIG.length
                ? order
                : index % AIKID_SIX_ISLANDS_CONFIG.length
            const config = AIKID_SIX_ISLANDS_CONFIG[safeIdx]
            const isCompleted = course.status === 'completed'
            const isLocked = course.status === 'locked' && course.reasonCode !== 'manual_override'
            const isActive = !isCompleted && !isLocked

            return (
              <button
                key={`nav-${course.id}`}
                type="button"
                onClick={() => scrollToIsland(safeIdx)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border',
                  isActive
                    ? 'bg-orange-500 text-white border-orange-400 shadow-xs ring-2 ring-orange-200'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
                )}
                title={`${config.badge}: ${config.title}`}
              >
                <span>{config.badge}</span>
                <span className="font-extrabold text-[11px] opacity-90 hidden sm:inline">
                  {config.title.replace('Đảo ', '')}
                </span>
                {isCompleted && <span className="text-[10px] font-black text-emerald-600">✓</span>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── LƯỚI RESPONSIVE 2 CỘT TƯƠNG THÍCH MÀN HÌNH (KHÔNG PHẢI SCROLL RẤT NHIỀU) ── */}
      <ol
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        aria-label="Hải trình các đảo học tập"
      >
        {courses.map((course, index) => {
          return (
            <li key={course.id} className="min-w-0">
              <ModernIslandCard
                course={course}
                index={index}
                isRecommended={course.id === recommendedCourseId}
                onLockedClick={onLockedClick}
              />
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export type LearningWorldKind = 'aikid_official' | 'workspace' | 'creator_marketplace'

export const LEARNING_WORLD_SCENES: Record<LearningWorldKind, string> = {
  aikid_official: designerAssets.worldLibrary.aikidOfficial,
  workspace: designerAssets.worldLibrary.school,
  creator_marketplace: designerAssets.worldLibrary.creator,
}

export function LearningWorldScene({ kind }: { kind: LearningWorldKind }) {
  const pose = kind === 'aikid_official' ? 'guide' : kind === 'workspace' ? 'walking' : 'thinking'
  return (
    <div className="learning-world-scene" aria-hidden="true">
      <img
        src={LEARNING_WORLD_SCENES[kind]}
        alt=""
        className="learning-world-scene-art"
        draggable={false}
      />
      <AikidCatCharacter pose={pose} className="learning-world-scene-cat" />
    </div>
  )
}

export function PathwayOverview({
  pathway,
  programId,
  trackId,
  showSpacesSelector = false,
}: {
  pathway: Pathway
  programId?: string
  trackId?: string
  showSpacesSelector?: boolean
}) {
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const isParent = user?.role === 'parent'
  const [lockedModalCourse, setLockedModalCourse] = useState<PathwayCourse | null>(null)
  const [paywallModalCourse, setPaywallModalCourse] = useState<PathwayCourse | null>(null)
  const [isParentGateOpen, setIsParentGateOpen] = useState(false)

  const isPaywallCourse = (course: PathwayCourse): boolean => {
    if (isUserTestingUnlocked()) return false
    if (isAikiRuleCourse(course)) return false
    if (
      course.reasonCode === 'purchase_required' ||
      course.reasonCode === 'entitlement_required' ||
      course.reasonCode === 'unpaid' ||
      course.reasonCode === 'subscription_required' ||
      Boolean(
        course.lockMessage && /gói|129|trả phí|mua|nâng cấp|học phí/i.test(course.lockMessage),
      )
    ) {
      return true
    }
    if (course.status === 'locked' && course.reasonCode !== 'gatekeeper_rule_incomplete') {
      return true
    }
    return false
  }

  const handleLockedCourseClick = (course: PathwayCourse) => {
    if (isPaywallCourse(course)) {
      setPaywallModalCourse(course)
    } else {
      setLockedModalCourse(course)
    }
  }

  const isSpacesView = Boolean(showSpacesSelector)
  const selectedSource: PathwayCourse['programSource'] | null = isSpacesView
    ? null
    : (programId as PathwayCourse['programSource']) || 'aikid_official'

  // Canonical pathway responses include `enrolled`; status is retained as a
  // defensive fallback for older cached/deployed gateway responses.
  const visibleCourses = pathway.courses.filter(isPathwayCourseVisible)
  const sourceOf = (course: PathwayCourse) => course.programSource ?? 'aikid_official'
  const categories = [
    {
      id: 'aikid_official' as const,
      title: 'AiKid của em',
      description: 'Giáo trình chính thức và hành trình được AiKid đề xuất.',
      eyebrow: 'Giáo trình chính thức',
      tone: 'bg-mint-50 border-mint-200 text-success',
    },
    {
      id: 'workspace' as const,
      title: 'Trường học',
      description: 'Chương trình từ trường, lớp và workspace con đang tham gia.',
      eyebrow: 'Theo workspace',
      tone: 'bg-sky-50 border-sky-200 text-sky-700',
    },
    {
      id: 'creator_marketplace' as const,
      title: 'Khóa học tự do',
      description: 'Khóa của giáo viên và chương trình gia đình đã đăng ký.',
      eyebrow: 'Thư viện của con',
      tone: 'bg-sun-50 border-sun-200 text-warning',
    },
  ]
  const ruleCourse = pathway.courses.find((c, i) => isAikiRuleCourse(c, i))
  const ruleCourseHref = `/world/${ruleCourse?.slug || 'dao-1'}`

  const selectedCategory = categories.find((category) => category.id === selectedSource)
  const sourceCourses = selectedSource
    ? visibleCourses.filter((course) => sourceOf(course) === selectedSource)
    : []
  const canonicalOfficialCourses =
    selectedSource === 'aikid_official'
      ? selectCanonicalAikidCourses(sourceCourses)
      : []
  const selectedSourceCourses = sortAikiCourses(
    selectedSource === 'aikid_official' && canonicalOfficialCourses.length > 0
      ? canonicalOfficialCourses
      : sourceCourses,
  )
  const selectedCourses =
    selectedSource === 'aikid_official'
      ? applyGatekeeperRules(selectedSourceCourses)
      : selectedSourceCourses
  const nextLearningTarget = selectNextLearningTarget(
    selectedCourses,
    pathway.recommendedCourseId,
  )
  const sourceRecommended = nextLearningTarget?.course
  const nextStation = nextLearningTarget?.station
  const courseHref = (course: PathwayCourse) => {
    const slug = course.slug || course.id
    if (isAikiRuleCourse(course)) return `/world/${course.slug || 'dao-1'}`
    return course.status === 'active' || course.status === 'completed'
      ? `/world/${slug}`
      : `/course/${slug}`
  }

  const completedCount = selectedCourses.filter((c) => c.status === 'completed').length
  const totalStations = selectedCourses.reduce(
    (sum, course) => sum + getCourseStationCount(course),
    0,
  )
  const completedStations = selectedCourses.reduce(
    (sum, course) => sum + Math.max(0, course.completedCount ?? 0),
    0,
  )
  const totalStars = selectedCourses.reduce(
    (sum, course) =>
      sum +
      clampCourseAggregateStars(
        course.totalStars,
        getCourseStationCount(course),
      ),
    0,
  )
  const totalProgress =
    totalStations > 0 ? Math.round((completedStations / totalStations) * 100) : 0
  const nextTicket = sourceRecommended && (
    <div className="rounded-2xl bg-[#FFFDF7] border-2 border-amber-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-clay">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            Trạm tiếp theo
          </span>
          <span className="text-xs font-bold text-slate-500 truncate">
            {sourceRecommended.shortTitle || sourceRecommended.title}
          </span>
        </div>
        <p className="font-display text-lg sm:text-xl font-black text-slate-900 truncate">
          {formatCourseTitle(nextStation?.title ?? sourceRecommended.title)}
        </p>
        <p className="text-xs sm:text-sm font-semibold text-slate-600">
          {nextStation
            ? `Trạm ${nextStation.order}: ${nextStation.skill || nextStation.hook || 'Nhiệm vụ sáng tạo kỳ thú'}`
            : `${sourceRecommended.completedCount ?? 0}/${getCourseStationCount(sourceRecommended)} trạm đã hoàn thành`}
        </p>
      </div>

      <div className="shrink-0">
        {sourceRecommended.status === 'locked' ? (
          <Button
            onClick={() => handleLockedCourseClick(sourceRecommended)}
            className="w-full sm:w-auto rounded-2xl font-black text-xs sm:text-sm px-6 py-3 shadow-clay active:scale-95"
          >
            Xem điều kiện
          </Button>
        ) : (
          <Link
            to={
              nextStation
                ? `/world/${sourceRecommended.slug || sourceRecommended.id}/lesson/${getStationSlug(nextStation, isAikiRuleCourse(sourceRecommended))}`
                : courseHref(sourceRecommended)
            }
          >
            <Button className="w-full sm:w-auto rounded-2xl font-black text-xs sm:text-sm px-6 py-3 shadow-clay active:scale-95 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0">
              Vào học tiếp
            </Button>
          </Link>
        )}
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────
  // Trường hợp 1: Chế độ Thư viện Không Gian Học Tập (/world/spaces)
  // ─────────────────────────────────────────────────────────────
  if (isSpacesView || !selectedSource) {
    return (
      <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 page-enter flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-700 shadow-xs border border-slate-200/80 text-xs font-black hover:bg-slate-50 transition-colors"
            >
              <span>Trang chủ</span>
            </Link>
            <button
              type="button"
              onClick={() => navigate('/world/program/aikid_official')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#FD7D2E] shadow-xs border border-amber-200/80 text-xs font-black hover:bg-amber-50 transition-colors cursor-pointer"
            >
              <span>AIKid của em</span>
            </button>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4EC] text-[#FD7D2E] text-xs font-black uppercase tracking-wider border border-amber-200/60 shadow-2xs">
              Thư Viện Không Gian
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Không Gian Học Tập
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Chọn không gian con muốn tiếp tục học hôm nay.
            </p>
          </div>
        </header>

        <section aria-labelledby="learning-library-title" className="space-y-4">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {categories.map((category) => {
              const sourceRows = visibleCourses.filter((course) => sourceOf(course) === category.id)
              const courses =
                category.id === 'aikid_official'
                  ? applyGatekeeperRules(selectCanonicalAikidCourses(sourceRows))
                  : sourceRows
              const active = courses.filter((course) => course.status === 'active').length
              const stations = courses.reduce(
                (sum, course) => sum + getCourseStationCount(course),
                0,
              )
              const doneStations = courses.reduce(
                (sum, course) =>
                  sum +
                  Math.min(
                    getCourseStationCount(course),
                    Math.max(0, course.completedCount ?? 0),
                  ),
                0,
              )
              const progress = stations > 0 ? Math.round((doneStations / stations) * 100) : 0
              return (
                <div
                  key={category.id}
                  className={cn(
                    'rounded-3xl border p-4 sm:p-6 text-left transition-all duration-300 hover:-translate-y-1 shadow-clay clay-card-subtle flex flex-col justify-between bg-white/95',
                    category.tone,
                  )}
                >
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/80 border border-current/20 text-[10px] font-black uppercase tracking-wider">
                      {category.eyebrow}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-black">{category.title}</h3>
                      <p className="mt-1 text-xs opacity-85 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="opacity-75">Tiến độ hoàn thành</span>
                        <span>
                          {doneStations}/{stations} trạm ({progress}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                        <div
                          className="h-full bg-current rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {active > 0 && (
                        <span className="block text-[11px] font-extrabold text-[#FD7D2E]">
                          {active} khóa đang học
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={() => navigate('/world/program/' + category.id)}
                      className="w-full rounded-2xl font-black text-xs sm:text-sm py-2.5 shadow-clay active:scale-95"
                    >
                      Vào không gian
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // Trường hợp 2: AIKID CỦA EM - BẬC 1: Danh sách các Chương trình học (/world/program/aikid_official)
  // Khi selectedSource === 'aikid_official' và KHÔNG CÓ trackId
  // ─────────────────────────────────────────────────────────────
  if (selectedSource === 'aikid_official' && !trackId) {
    return (
      <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 page-enter flex flex-col gap-6 py-4 sm:py-6">
        <ArchipelagoGameVoyage courses={selectedCourses} onLockedClick={handleLockedCourseClick} />

        {/* Soft Clay Modal khi bấm vào đảo đang bị khóa */}
        <AdventureModal
          open={Boolean(lockedModalCourse)}
          onClose={() => setLockedModalCourse(null)}
          tone="guidance"
          eyebrow="Đảo Đang Chờ Mở Khóa"
          title="Đảo Này Đang Chờ Mở Khóa!"
          description={
            lockedModalCourse?.lockMessage ||
            'Bé hãy hoàn thành Đảo Quy Tắc Vàng AIKI trước để nhận Huy hiệu Hiệp Sĩ và mở khóa toàn bộ hành trình sáng tạo nhé!'
          }
          artwork={
            <div className="flex items-center justify-center my-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100/90 shadow-soft border-2 border-amber-300">
                <KidLockImageIcon size={52} aria-hidden="true" />
              </div>
            </div>
          }
          showMascot={true}
          actions={
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mt-2">
              <Link
                to={ruleCourseHref}
                className="w-full sm:w-auto"
                onClick={() => setLockedModalCourse(null)}
              >
                <Button className="w-full rounded-2xl font-black">
                  Đến Đảo Quy Tắc Ngay
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => setLockedModalCourse(null)}
                className="w-full sm:w-auto rounded-2xl font-black"
              >
                Đóng để chọn đảo khác
              </Button>
            </div>
          }
        />
        <CoursePaywallModal
          open={Boolean(paywallModalCourse)}
          courseTitle={paywallModalCourse?.title}
          onClose={() => setPaywallModalCourse(null)}
          onContinueFree={() => {
            setPaywallModalCourse(null)
            navigate(ruleCourseHref)
          }}
          onUpgrade={() => {
            setPaywallModalCourse(null)
            if (isParent) {
              navigate('/parent/plan?upgrade=aikids_official_129k')
            } else {
              setIsParentGateOpen(true)
            }
          }}
        />
        {isParentGateOpen && (
          <ParentGateModal
            open={isParentGateOpen}
            onClose={() => setIsParentGateOpen(false)}
            redirectTo="/parent/plan?upgrade=aikids_official_129k"
          />
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // Trường hợp 3: BẬC 2: Chương trình -> Danh sách các Đảo
  // (Khi trackId === 'creator' hoặc khi selectedSource !== 'aikid_official')
  // ─────────────────────────────────────────────────────────────
  const isCreatorTrack = selectedSource === 'aikid_official' && trackId === 'creator'

  return (
    <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 page-enter flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
      {/* ── Header ── */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-700 shadow-xs border border-slate-200/80 text-xs font-black hover:bg-slate-50 transition-colors"
          >
            <span>Trang chủ</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate('/world/program/aikid_official')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#FD7D2E] shadow-xs border border-amber-200/80 text-xs font-black hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <span>Danh sách 6 đảo</span>
          </button>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4EC] text-[#FD7D2E] text-xs font-black uppercase tracking-wider border border-amber-200/60 shadow-2xs">
            Thư Viện Các Khóa Học AIKids
          </span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {isCreatorTrack
              ? 'Hành Trình Khám Phá 6 Đảo Sáng Tạo'
              : selectedCategory?.title || 'Hành trình của con'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
            {isCreatorTrack
              ? 'Cùng Mèo Mee khám phá 6 hòn đảo kỳ thú, rèn luyện tư duy prompt, mỹ thuật, truyện tranh và làm chủ AI an toàn.'
              : selectedCategory?.description || 'Khám phá các trạm học.'}
          </p>
        </div>

        {selectedCourses.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-black text-slate-800 shadow-soft border border-slate-200/90">
              <CheckCircle2 size={14} className="text-mint-600" />
              <span>
                {completedStations}/{totalStations} trạm đã hoàn thành
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-black text-slate-800 shadow-soft border border-slate-200/90">
              <Trophy size={14} className="text-sun-600" />
              <span>{totalProgress}% tiến độ tổng</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-black text-slate-800 shadow-soft border border-slate-200/90">
              <Star size={14} className="fill-amber-400 text-amber-500" />
              <span>{totalStars} Sao tích lũy</span>
            </span>
          </div>
        )}

        {selectedCourses.length > 0 && (
          <div className="pt-1">
            <CuteProgress
              value={totalProgress}
              label={
                isCreatorTrack
                  ? 'Tiến độ toàn bộ 6 đảo'
                  : `Lộ trình ${selectedCategory?.title}`
              }
              tone="mint"
            />
          </div>
        )}

        {nextTicket}
      </header>

      {/* Danh sách khóa của không gian hiện tại; bản đồ 6 đảo chỉ dùng cho
          chương trình AIKid chính thức ở nhánh phía trên. */}
      {selectedCourses.length === 0 ? (
        <div className="ui-card p-4 sm:p-6 text-center rounded-3xl shadow-clay">
          <CourseBookIcon size={44} className="mx-auto text-brand-500" aria-hidden="true" />
          <p className="mt-3 font-display text-xl font-black">Chưa có chương trình trong mục này</p>
          <p className="mt-2 text-sm text-muted">
            Chương trình được trường giao hoặc gia đình đăng ký sẽ xuất hiện tại đây.
          </p>
          <Button
            className="mt-4 rounded-2xl font-black"
            variant="secondary"
            onClick={() => navigate('/world/spaces')}
          >
            Quay lại thư viện không gian
          </Button>
        </div>
      ) : (
        <section
          aria-label={isCreatorTrack ? 'Bộ sưu tập 6 đảo học tập' : 'Các khóa học trong không gian'}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#FD7D2E]">
                {isCreatorTrack ? 'Hải trình rèn luyện' : selectedCategory?.eyebrow || 'Chương trình của con'}
              </p>
              <h2 className="mt-0.5 font-display text-2xl text-slate-900 sm:text-3xl font-black">
                {isCreatorTrack ? 'Bộ Sưu Tập 6 Đảo Học Tập' : 'Các khóa học'}
              </h2>
            </div>
          </div>

          <ConnectedIslandJourney
            courses={selectedCourses}
            recommendedCourseId={sourceRecommended?.id}
            onLockedClick={handleLockedCourseClick}
          />

          {/* Finish celebration if all completed */}
          {completedCount === selectedCourses.length && selectedCourses.length > 0 && (
            <div className="flex flex-col items-center mt-8 p-4 sm:p-6 rounded-3xl bg-amber-50/80 border border-amber-200/90 text-center animate-pop">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md mb-2">
                <Trophy size={40} aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-black text-slate-900">Xuất sắc!</h3>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                {isCreatorTrack
                  ? 'Con đã hoàn thành toàn bộ hành trình 6 đảo sáng tạo!'
                  : 'Con đã hoàn thành toàn bộ khóa học trong không gian này!'}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Soft Clay Modal khi bấm vào đảo đang bị khóa */}
      <AdventureModal
        open={Boolean(lockedModalCourse)}
        onClose={() => setLockedModalCourse(null)}
        tone="guidance"
        eyebrow="Đảo Đang Chờ Mở Khóa"
        title="Đảo Này Đang Chờ Mở Khóa!"
        description={
          lockedModalCourse?.lockMessage ||
          'Bé hãy hoàn thành Đảo Quy Tắc Vàng AIKI trước để nhận Huy hiệu Hiệp Sĩ và mở khóa toàn bộ hành trình sáng tạo nhé!'
        }
        artwork={
          <div className="flex items-center justify-center my-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100/90 shadow-soft border-2 border-amber-300">
              <KidLockImageIcon size={52} aria-hidden="true" />
            </div>
          </div>
        }
        showMascot={true}
        actions={
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mt-2">
            <Link
              to={ruleCourseHref}
              className="w-full sm:w-auto"
              onClick={() => setLockedModalCourse(null)}
            >
              <Button className="w-full rounded-2xl font-black">
                Đến Đảo Quy Tắc Ngay
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => setLockedModalCourse(null)}
              className="w-full sm:w-auto rounded-2xl font-black"
            >
              Đóng để chọn đảo khác
            </Button>
          </div>
        }
      />
      <CoursePaywallModal
        open={Boolean(paywallModalCourse)}
        courseTitle={paywallModalCourse?.title}
        onClose={() => setPaywallModalCourse(null)}
        onContinueFree={() => {
          setPaywallModalCourse(null)
          navigate(ruleCourseHref)
        }}
        onUpgrade={() => {
          setPaywallModalCourse(null)
          if (isParent) {
            navigate('/parent/plan?upgrade=aikids_official_129k')
          } else {
            setIsParentGateOpen(true)
          }
        }}
      />
      {isParentGateOpen && (
        <ParentGateModal
          open={isParentGateOpen}
          onClose={() => setIsParentGateOpen(false)}
          redirectTo="/parent/plan?upgrade=aikids_official_129k"
        />
      )}
    </div>
  )
}
