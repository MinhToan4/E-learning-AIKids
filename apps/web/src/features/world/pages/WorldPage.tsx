import React, { Suspense, useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { CheckCircle2, Star, Trophy, Zap, ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { KidLockImageIcon } from '@/shared/components/icons/KidImageIcons'
import {
  CourseBookIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { CoursePaywallModal } from '@/features/lesson/components/CoursePaywallModal'
import { ParentGateModal } from '@/features/parent/components/ParentGateModal'
import { useAuth } from '@/shared/store/auth'
import { type QuestProgress } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { cn } from '@/shared/lib/cn'
import { getCanonicalAikidCourseSlug, getCourseStationCount } from '@/shared/lib/course-station-count'
import { WorldProgramIslandCard } from '../components/WorldProgramIslandCard'
import { prefetchRoute, prefetchRouteImmediately } from '@/app/route-prefetch'
import { designerAssets } from '@/shared/config/assets'

const IslandStationsExplorerView = React.lazy(() =>
  import('../components/IslandStationsExplorerView').then((m) => ({
    default: m.IslandStationsExplorerView,
  }))
)
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
import { isAikiRuleJourney, extractRuleNumber } from '@/features/lesson/lib/rule-journey-identifiers'

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)

export function getStationSlug(station: any, isRuleCourse?: boolean): string {
  if (!station) return ''
  if (station.slug && typeof station.slug === 'string' && !isUuid(station.slug)) {
    return station.slug
  }
  if (isRuleCourse || isAikiRuleJourney(station)) {
    const ruleNum = station.order || extractRuleNumber(station)
    if (ruleNum >= 1 && ruleNum <= 10) return `rule-${ruleNum}`
  }
  const matched = findIslandCurriculum({ id: station.id, title: station.title, slug: station.slug })
  if (matched?.slug) return matched.slug
  if (matched?.id && !isUuid(matched.id)) return matched.id
  return !isUuid(station.id) ? station.id : (station.slug || station.id)
}

// Client-side unlock switches are intentionally disabled. Test accounts such
// as Bo must receive enrollment/entitlement from the backend just like every
// other learner so the browser cannot bypass payment or sequential gates.
export const FORCE_UNLOCK_ALL_ISLANDS = false

export function isUserTestingUnlocked(): boolean {
  return false
}

export const AIKID_CANONICAL_SLUGS = [
  'muoi-quy-tac-xuong-sang-tao',
  'dao-1-nha-tham-hiem-ai',
  'dao-2-hoa-si-ai',
  'dao-3-biet-doi-nhan-vat-ai',
  'dao-4-vuong-quoc-truyen-tranh-ai',
  'dao-5-nha-phat-minh-tro-choi-ai',
] as const

const AIKID_CANONICAL_TITLE_HINTS: Record<(typeof AIKID_CANONICAL_SLUGS)[number], string[]> = {
  'muoi-quy-tac-xuong-sang-tao': ['quy tắc', 'quy tac'],
  'dao-1-nha-tham-hiem-ai': ['nhà thám hiểm', 'nha tham hiem'],
  'dao-2-hoa-si-ai': ['hoạ sĩ', 'họa sĩ', 'hoa si'],
  'dao-3-biet-doi-nhan-vat-ai': ['biệt đội nhân vật', 'biet doi nhan vat'],
  'dao-4-vuong-quoc-truyen-tranh-ai': ['vương quốc truyện tranh', 'vuong quoc truyen tranh'],
  'dao-5-nha-phat-minh-tro-choi-ai': ['nhà phát minh trò chơi', 'nha phat minh tro choi'],
}

export const ISLAND_ALIAS_MAP: Record<string, string> = {
  'dao-1': 'muoi-quy-tac-xuong-sang-tao',
  'dao-2': 'dao-1-nha-tham-hiem-ai',
  'dao-3': 'dao-2-hoa-si-ai',
  'dao-4': 'dao-3-biet-doi-nhan-vat-ai',
  'dao-5': 'dao-4-vuong-quoc-truyen-tranh-ai',
  'dao-6': 'dao-5-nha-phat-minh-tro-choi-ai',
  'aiki-rules': 'muoi-quy-tac-xuong-sang-tao',
  'muoi-quy-tac': 'muoi-quy-tac-xuong-sang-tao',
}

export type PathwayCourse = {
  id: string
  slug?: string
  title: string
  shortTitle: string
  status: 'completed' | 'active' | 'available' | 'locked'
  reasonCode: string
  completionPercent: number
  missingPrerequisites: string[]
  coverImage: string | null
  enrolled: boolean
  questCount?: number
  completedCount?: number
  totalStars?: number
  stations?: QuestProgress[]
  programSource?: 'aikid_official' | 'workspace' | 'creator_marketplace'
  workspaceId?: string | null
  programUnlockMode?: 'sequential' | 'parallel' | 'graph'
  isGatekeeper?: boolean
  lockMessage?: string
}

export function selectCanonicalAikidCourses(courses: PathwayCourse[]): PathwayCourse[] {
  return AIKID_CANONICAL_SLUGS.flatMap((slug) => {
    const hints = AIKID_CANONICAL_TITLE_HINTS[slug]
    const exact = courses.find((course) => {
      const title = `${course.title} ${course.shortTitle}`.toLocaleLowerCase('vi')
      return hints.some((hint) => title.includes(hint))
    })
    if (exact) return [exact]
    const fallback = courses.find((course) => getCanonicalAikidCourseSlug(course) === slug)
    return fallback ? [fallback] : []
  })
}

export { getCourseStationCount }

export type NextLearningTarget = {
  course: PathwayCourse
  station?: QuestProgress
}

function isCourseComplete(course: PathwayCourse): boolean {
  if (course.status === 'completed') return true
  const stationCount = getCourseStationCount(course)
  return stationCount > 0 && (course.completedCount ?? 0) >= stationCount
}

/**
 * Select the next server-authored learning target without falling back to an
 * already completed recommended module. Course order is the canonical island
 * sequence; an in-progress course wins, then a still-actionable recommendation,
 * then the first available/locked island.
 */
export function selectNextLearningTarget(
  courses: PathwayCourse[],
  recommendedCourseId?: string | null,
): NextLearningTarget | null {
  const unfinished = courses.filter((course) => !isCourseComplete(course))
  const recommended = unfinished.find((course) => course.id === recommendedCourseId)
  const course = unfinished.find((item) => item.status === 'active')
    ?? recommended
    ?? unfinished.find((item) => item.status === 'available')
    ?? unfinished.find((item) => item.status === 'locked')

  if (!course) return null

  const station = course.stations?.find((item) => item.status === 'in_progress')
    ?? course.stations?.find((item) => item.status === 'available')

  return { course, station }
}

export function findCourseByIdentifier(
  courses: PathwayCourse[],
  identifier?: string,
): PathwayCourse | undefined {
  if (!identifier) return undefined
  const idOrSlug = identifier.trim().toLowerCase()
  const canonicalSlug = ISLAND_ALIAS_MAP[idOrSlug] || idOrSlug

  // 1. Match exact id or slug
  let found = courses.find(
    (c) => c.id.toLowerCase() === idOrSlug || (c.slug && c.slug.toLowerCase() === idOrSlug),
  )
  if (found) return found

  // 2. Match canonical slug
  found = courses.find((c) => c.slug && c.slug.toLowerCase() === canonicalSlug)
  if (found) return found

  // 3. Match by Island number: dao-1 -> index 0, dao-2 -> index 1...
  const daoMatch = idOrSlug.match(/^dao-(\d+)$/)
  if (daoMatch) {
    const islandIndex = parseInt(daoMatch[1], 10) - 1
    const sorted = sortAikiCourses(courses)
    if (islandIndex >= 0 && islandIndex < sorted.length) {
      return sorted[islandIndex]
    }
  }

  // 4. Fallback: match by title / sort order
  if (canonicalSlug === 'muoi-quy-tac-xuong-sang-tao') {
    return courses.find((c, i) => isAikiRuleCourse(c, i))
  }

  return undefined
}

type Pathway = {
  student: { nickname: string | null; ageBand: string }
  policy: { label: string } | null
  regionUnlockMode?: 'sequential' | 'parallel'
  regionUnlockModeSource?: 'course' | 'classroom' | 'learner_override'
  recommendedCourseId: string | null
  courses: PathwayCourse[]
}

function StarDisplay({ count }: { count: number }) {
  const safeCount = Math.max(0, Math.min(3, count))
  return (
    <div className="flex items-center gap-1" aria-label={`${safeCount} trên 3 sao`}>
      <div className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            size={19}
            className={i <= safeCount ? 'fill-sun-400 text-sun-400' : 'fill-white text-slate-300'}
          />
        ))}
      </div>
      <span className="text-[10px] font-extrabold text-muted">{safeCount}/3</span>
    </div>
  )
}

const STATION_X_POSITIONS = [28, 68, 74, 43, 25, 52, 72, 42, 24, 61] as const

function getStationPoint(index: number, total: number) {
  return {
    x: STATION_X_POSITIONS[index % STATION_X_POSITIONS.length],
    y: total <= 1 ? 50 : 10 + (index * 80) / (total - 1),
  }
}

function buildStationPath(total: number) {
  if (total === 0) return ''
  const points = Array.from({ length: total }, (_, index) => getStationPoint(index, total))
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const middleY = (previous.y + point.y) / 2
    return `${path} C ${previous.x} ${middleY}, ${point.x} ${middleY}, ${point.x} ${point.y}`
  }, `M ${points[0].x} ${points[0].y}`)
}

function QuestNode({ quest, index, total, courseId }: { quest: QuestProgress; index: number; total: number; courseId?: string }) {
  const isDevUnlock = isUserTestingUnlocked()
  const forceUnlock = FORCE_UNLOCK_ALL_ISLANDS || isDevUnlock
  const locked = !forceUnlock && quest.status === 'locked'
  const done = quest.status === 'completed'
  const available = forceUnlock || quest.status === 'available' || quest.status === 'in_progress'

  const nodeEl = (
    <div className="quest-node-compact-wrap">
      <div
        className={cn(
          'quest-node',
          locked && 'quest-node-locked',
          available && 'quest-node-available',
          done && 'quest-node-completed',
        )}
        aria-label={`Trạm ${quest.order}: ${quest.title}`}
      >
        {locked ? (
          <KidLockImageIcon size={46} />
        ) : done ? (
          <CheckCircle2 size={32} className="text-white" aria-hidden />
        ) : (
          <span className="font-display text-2xl text-white" aria-hidden="true">
            {quest.order}
          </span>
        )}
      </div>
      {locked ? (
        <div className="quest-node-caption text-slate-400">
          <span>Trạm {quest.order}</span>
          <strong className="text-slate-400 font-bold">Chưa mở khóa</strong>
        </div>
      ) : (
        <div className={cn('quest-node-caption', available && 'quest-node-caption-current')}>
          <span>Trạm {quest.order}</span>
          {done ? <StarDisplay count={quest.stars} /> : <strong>Đang học</strong>}
        </div>
      )}
    </div>
  )

  const isRule = courseId ? isAikiRuleJourney(courseId) : false
  const lessonSlug = getStationSlug(quest, isRule)
  const lessonUrl = courseId ? `/world/${courseId}/lesson/${lessonSlug}` : `/lesson/${lessonSlug}`

  return (
    <li
      className="quest-map-point"
      style={{
        left: `${getStationPoint(index, total).x}%`,
        top: `${getStationPoint(index, total).y}%`,
      }}
    >
      {locked ? (
        <div className="cursor-not-allowed select-none" title={`Trạm ${quest.order}: Chưa mở khóa`}>{nodeEl}</div>
      ) : (
        <Link
          to={lessonUrl}
          className="block"
          onPointerEnter={() => prefetchRoute(lessonUrl)}
          onPointerDown={() => prefetchRouteImmediately(lessonUrl)}
          onFocus={() => prefetchRoute(lessonUrl)}
        >
          {nodeEl}
        </Link>
      )}
    </li>
  )
}

export function clearWorldPageCache(): void {
  // Compatibility hook: World data is server-owned and is not retained in a
  // browser/module cache between route mounts.
}

export function mergeQuestsWithLocalProgress<
  T extends {
    id: string
    status: 'completed' | 'in_progress' | 'available' | 'locked' | string
    stars?: number
    order?: number
    slug?: string
    [key: string]: any
  },
>(
  quests: T[],
  isRuleCourse: boolean,
  localCompletedLessons?: Record<string, { stars?: number; xp?: number; completedAt?: string }>,
  localGoldenRules?: Record<number, { status?: string; starsEarned?: number }>,
): T[] {
  if (!Array.isArray(quests) || quests.length === 0) return []
  // Compatibility arguments remain while old clients are phased out, but
  // browser storage is never authoritative for completion, stars or unlocks.
  // The LMS response is the sole source of truth for every course, including
  // the free Rules journey.
  void isRuleCourse
  void localCompletedLessons
  void localGoldenRules
  return quests.map((quest) => ({ ...quest }))
}

export function enrichCoursesWithLocalProgress(
  courses: PathwayCourse[],
  localCompletedLessons?: Record<string, { stars?: number; xp?: number; completedAt?: string }>,
  localGoldenRules?: Record<number, { status?: string; starsEarned?: number }>,
): PathwayCourse[] {
  void localCompletedLessons
  void localGoldenRules
  return courses.map((course) => ({ ...course }))
}

export interface WorldPageProps {
  showSpacesSelector?: boolean
}

export function WorldPage({ showSpacesSelector = false }: WorldPageProps = {}) {
  const { courseId, programId, trackId } = useParams<{ courseId?: string; programId?: string; trackId?: string }>()
  const navigate = useNavigate()
  const [refreshTick, setRefreshTick] = useState(0)
  const [quests, setQuests] = useState<QuestProgress[]>([])
  const [meta, setMeta] = useState({ totalStars: 0, completedCount: 0 })
  const [courseTitle, setCourseTitle] = useState('Hành trình sáng tạo')
  const [error, setError] = useState<string | null>(null)
  const [pathway, setPathway] = useState<Pathway | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrollmentRequired, setEnrollmentRequired] = useState(false)
  const [regionIndex, setRegionIndex] = useState(0)

  // Lắng nghe sự kiện hoàn thành bài học để xóa cache và tự động re-render bản đồ
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleLessonCompleted = () => {
      clearWorldPageCache()
      setRefreshTick((prev) => prev + 1)
    }
    window.addEventListener('aikids:lesson-completed', handleLessonCompleted)
    return () => {
      window.removeEventListener('aikids:lesson-completed', handleLessonCompleted)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      if (courseId) {
        setQuests([])
        setMeta({ totalStars: 0, completedCount: 0 })
      }
      setError(null)
      setEnrollmentRequired(false)
      try {
        if (!courseId) {
          const journey = await learningApi.getPathway()
          const rawCourses = journey.courses as PathwayCourse[]
          const enrichedCourses = enrichCoursesWithLocalProgress(rawCourses)

          // 1. If backend returns stations for all courses, read directly
          const hasAllStations =
            enrichedCourses.length > 0 &&
            enrichedCourses.every(
              (course) => Array.isArray(course.stations) && course.stations.length > 0,
            )

          if (hasAllStations) {
            const finalCourses = applyGatekeeperRules(enrichedCourses)
            const finalPathway = { ...journey, courses: finalCourses }
            setPathway(finalPathway)
            setLoading(false)
            return
          }

          // Paint the course map from pathway summaries only. Fetching progress
          // for every course here creates an invisible N+1 burst, including
          // locked/off-screen islands. Detailed progress is loaded only after
          // the learner opens that course.
          const provisionalPathway = {
            ...journey,
            courses: applyGatekeeperRules(enrichedCourses),
          }
          setPathway(provisionalPathway)
          setLoading(false)
          return
        }

        // Khi có courseId trong URL (slug như 'dao-1', 'dao-2', 'muoi-quy-tac-xuong-sang-tao', hoặc UUID)
        const journey = await learningApi.getPathway()
        const rawCourses = journey.courses as PathwayCourse[]
        const enrichedCourses = enrichCoursesWithLocalProgress(rawCourses)
        const processedCourses = applyGatekeeperRules(enrichedCourses)
        const finalPathway = { ...journey, courses: processedCourses }

        const pathRow =
          findCourseByIdentifier(processedCourses, courseId) ||
          processedCourses.find((row) => row.id === courseId)
        const actualCourseId = pathRow?.id || courseId

        // The pathway already owns the course title and access state. Calling
        // /api/courses/:id again here duplicated data before the station list
        // could render, so the island only requests its progress projection.
        // The pathway projection already embeds the learner's stations and
        // aggregate progress. Reuse that authoritative server payload and only
        // call the legacy progress endpoint for older deployments that omit it.
        const progressData = pathRow?.stations?.length
          ? {
              quests: pathRow.stations,
              completedCount: pathRow.completedCount ?? 0,
              totalStars: pathRow.totalStars ?? 0,
            }
          : await learningApi
              .getCourseProgress(actualCourseId)
              .catch(() => null)

        const courseTitle = formatCourseTitle(pathRow?.title || pathRow?.shortTitle || 'Hành trình sáng tạo')
        const targetOrder = getAikiCourseSortOrder(pathRow || { id: actualCourseId, title: courseTitle })
        setRegionIndex(
          targetOrder < WORLD_REGIONS.length
            ? targetOrder
            : Math.max(0, processedCourses.findIndex((row) => row.id === actualCourseId)),
        )

        const isDevUnlock = isUserTestingUnlocked()
        const forceUnlock =
          FORCE_UNLOCK_ALL_ISLANDS ||
          isDevUnlock ||
          pathRow?.programUnlockMode === 'parallel' ||
          pathRow?.reasonCode === 'manual_override'

        if (!pathRow || (!forceUnlock && pathRow.status === 'locked')) {
          throw new Error(pathRow?.lockMessage || 'Khóa học này chưa được mở trong lộ trình của con.')
        }
        setPathway(finalPathway)
        setCourseTitle(courseTitle)

        const isRuleCourse = Boolean(pathRow && isAikiRuleCourse(pathRow))
        let rawQuests = progressData?.quests?.length
          ? progressData.quests
          : pathRow?.stations?.length
            ? pathRow.stations
            : []

        // Never turn count-only/backend placeholder rows into navigable
        // stations. They have no lesson identity and previously produced links
        // such as `/lesson/`, which then fell through the auth/route guards.
        rawQuests = rawQuests.filter((station) =>
          typeof station.id === 'string' && station.id.trim().length > 0,
        )

        if (rawQuests.length === 0 && isRuleCourse) {
          rawQuests = AIKI_RULES_DATA.map((r, idx) => ({
            id: `rule-${r.id}`,
            slug: `rule-${r.id}`,
            order: r.id,
            title: `Quy tắc ${r.id}: ${r.shortTitle}`,
            skill: 'Sáng tạo an toàn',
            reward: 'Huy hiệu Hiệp sĩ AIKI',
            duration: '5 phút',
            hook: r.title,
            accent: 'mint',
            practiceKind: 'quiz',
            status: (idx === 0 ? 'available' : 'locked') as QuestProgress['status'],
            phase: 'learn' as const,
            stars: 0,
            xpEarned: 0,
          }))
        }

        if (rawQuests.length > 0) {
          const mergedQuests = mergeQuestsWithLocalProgress(rawQuests, isRuleCourse)
          const sequentialQuests = applySequentialQuestRules(mergedQuests, forceUnlock)
          const calculatedCompletedCount = sequentialQuests.filter((q) => q.status === 'completed').length
          const calculatedTotalStars = sequentialQuests.reduce((sum, q) => sum + (q.stars || 0), 0)
          const nextMeta = {
            totalStars: Math.max(progressData?.totalStars ?? 0, calculatedTotalStars),
            completedCount: Math.max(progressData?.completedCount ?? 0, calculatedCompletedCount),
          }
          setQuests(sequentialQuests)
          setMeta(nextMeta)
        } else if (!forceUnlock && pathRow.status === 'available') {
          setEnrollmentRequired(true)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được bản đồ')
      } finally {
        setLoading(false)
      }
    })()
  }, [courseId, refreshTick])

  const next = quests.find(
    (q) => q.status === 'available' || q.status === 'in_progress',
  ) ?? (quests.length > 0 ? quests[0] : undefined)
  const progressPct = quests.length > 0 ? Math.round((meta.completedCount / quests.length) * 100) : 0
  const currentRegion = WORLD_REGIONS[regionIndex % WORLD_REGIONS.length]
  const isCurrentCourseRule = Boolean(courseId && (isAikiRuleJourney(courseId) || pathway?.courses.some((c) => (c.id === courseId || c.slug === courseId) && isAikiRuleCourse(c))))

  if (!courseId) {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="ui-skeleton h-32 rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ui-skeleton h-40 rounded-3xl" />
            <div className="ui-skeleton h-40 rounded-3xl" />
          </div>
        </div>
      )
    }
    if (error || !pathway) {
      return (
        <p className="ui-card p-5 text-danger" role="alert">
          {error ?? 'Chưa tải được lộ trình học.'}
        </p>
      )
    }
    return (
      <PathwayOverview
        pathway={pathway}
        programId={programId}
        trackId={trackId}
        showSpacesSelector={showSpacesSelector}
      />
    )
  }

  if (courseId && error) {
    const ruleCourse = pathway?.courses.find((c, i) => isAikiRuleCourse(c, i))
    const ruleCourseHref = `/world/${ruleCourse?.slug || 'dao-1'}`
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 page-enter">
        <div className="ui-card mx-auto w-full max-w-xl p-8 text-center border-2 border-amber-200 bg-white/95 shadow-clay rounded-3xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100/90 border-2 border-amber-300 shadow-soft mb-4">
            <KidLockImageIcon size={52} aria-hidden="true" />
          </div>
          <AikidCatCharacter pose="guide" className="mx-auto h-28 w-28 drop-shadow-md mb-3" />
          <h1 className="font-display text-2xl sm:text-3xl font-black text-text">
            Hòn Đảo Này Đang Chờ Mở Khóa!
          </h1>
          <p className="mt-3 text-sm sm:text-base font-semibold text-muted leading-relaxed max-w-md mx-auto">
            {error || 'Bé hãy hoàn thành Đảo Quy Tắc Vàng AIKI trước để nhận Huy hiệu Hiệp Sĩ và mở khóa toàn bộ hành trình sáng tạo nhé!'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={() => navigate('/world/program/aikid_official')} className="w-full sm:w-auto">
              🗺️ Danh sách các Đảo
            </Button>
            <Link to={ruleCourseHref} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">
                🛡️ Đến Đảo Quy Tắc Vàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full max-w-[1024px] mx-auto space-y-4 p-4">
        <div className="ui-skeleton h-44 rounded-[2.5rem]" />
        <div className="ui-skeleton h-32 rounded-3xl" />
        <div className="space-y-3">
          <div className="ui-skeleton h-20 rounded-2xl" />
          <div className="ui-skeleton h-20 rounded-2xl" />
          <div className="ui-skeleton h-20 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 page-enter">
      {enrollmentRequired && !loading ? (
        <section className="ui-card mx-auto w-full max-w-xl p-6 text-center">
          <CourseBookIcon size={42} className="mx-auto text-brand-500" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl">Hành trình chưa bắt đầu</h2>
          <p className="mt-2 text-sm text-muted">
            Xem giới thiệu và bắt đầu khóa học để mở trạm đầu tiên.
          </p>
          <Link
            className="mt-4 inline-block"
            to={`/course/${courseId}`}
            onPointerEnter={() => prefetchRoute(`/course/${courseId}`)}
            onPointerDown={() => prefetchRouteImmediately(`/course/${courseId}`)}
            onFocus={() => prefetchRoute(`/course/${courseId}`)}
          >
            <Button>Bắt đầu hành trình</Button>
          </Link>
        </section>
      ) : (
        <Suspense fallback={<div className="ui-skeleton h-96 rounded-3xl" />}>
          <IslandStationsExplorerView
            courseId={courseId}
            courseTitle={courseTitle}
            quests={quests}
            meta={meta}
            currentRegion={currentRegion}
            isCurrentCourseRule={isCurrentCourseRule}
            getStationSlugFn={getStationSlug}
            onBackToMap={() => navigate('/world/program/aikid_official')}
            onSelectIsland={(islandSlug) => navigate(`/world/${islandSlug}`)}
          />
        </Suspense>
      )}
    </div>
  )
}




export function isAikiRuleCourse(course: { id: string; title: string }, _index?: number): boolean {
  if (course.id === 'aiki-rules' || course.id.startsWith('rule-')) return true
  const lowerTitle = (course.title || '').toLowerCase()
  if (
    lowerTitle.includes('mười quy tắc') ||
    lowerTitle.includes('muoi quy tac') ||
    lowerTitle.includes('module 0')
  ) {
    return true
  }
  return false
}

export function isCourseRuleCompleted(course: PathwayCourse): boolean {
  if (course.reasonCode === 'manual_override') return true
  if (course.status === 'completed') return true
  const stationCount = getCourseStationCount(course)
  if (stationCount > 0 && typeof course.completedCount === 'number') {
    return course.completedCount >= stationCount
  }
  return false
}

export function applySequentialQuestRules<
  T extends {
    status: 'completed' | 'in_progress' | 'available' | 'locked' | string
    [key: string]: any
  },
>(
  quests: T[],
  forceUnlockOverride?: boolean,
): T[] {
  if (!Array.isArray(quests) || quests.length === 0) return []

  const isDevUnlock = isUserTestingUnlocked()
  const forceUnlock = forceUnlockOverride ?? (FORCE_UNLOCK_ALL_ISLANDS || isDevUnlock)

  if (forceUnlock) {
    return quests.map((q) => ({
      ...q,
      status: (q.status === 'locked' ? 'available' : q.status) as T['status'],
    }))
  }

  const result: T[] = []
  for (let idx = 0; idx < quests.length; idx++) {
    const quest = quests[idx]
    if (idx === 0) {
      // Trạm đầu tiên (index 0): Luôn mở (available hoặc in_progress, hoặc completed nếu đã làm xong)
      const status = (quest.status === 'locked' ? 'available' : quest.status) as T['status']
      result.push({
        ...quest,
        status,
      })
    } else {
      // Trạm i (i > 0): Nếu Trạm i-1 chưa completed, gán status: 'locked' as const.
      // Trạm i chỉ mở khi Trạm i-1 đã completed.
      const prevQuest = result[idx - 1]
      const isPrevCompleted = prevQuest.status === 'completed'

      if (isPrevCompleted) {
        const status = (quest.status === 'locked' ? 'available' : quest.status) as T['status']
        result.push({
          ...quest,
          status,
        })
      } else {
        result.push({
          ...quest,
          status: 'locked' as T['status'],
        })
      }
    }
  }

  return result
}

export function applyGatekeeperRules(
  courses: PathwayCourse[],
  forceUnlockOverride?: boolean,
): PathwayCourse[] {
  if (courses.length === 0) return []

  const sortedCourses = sortAikiCourses(courses)
  const isDevUnlock = isUserTestingUnlocked()
  const forceUnlock = forceUnlockOverride ?? (FORCE_UNLOCK_ALL_ISLANDS || isDevUnlock)

  const result: PathwayCourse[] = []
  for (let idx = 0; idx < sortedCourses.length; idx++) {
    const course = sortedCourses[idx]
    const defaultSlug = idx < AIKID_CANONICAL_SLUGS.length ? AIKID_CANONICAL_SLUGS[idx] : undefined
    const slug = course.slug || defaultSlug
    // Preserve server-authored learner/course overrides. Previously the
    // frontend reapplied sequential locking even when the LMS returned a
    // parallel/manual override (for example Bo's test profile).
    const courseForceUnlock =
      forceUnlock ||
      course.programUnlockMode === 'parallel' ||
      course.reasonCode === 'manual_override'
    const stations = course.stations
      ? applySequentialQuestRules(course.stations, courseForceUnlock)
      : undefined

    if (idx === 0) {
      // Đảo 1 (dao-1): Luôn mở (available / in_progress / active / completed)
      const status = course.status === 'locked' ? 'available' : course.status
      result.push({
        ...course,
        slug,
        status,
        stations,
        isGatekeeper: true,
      })
      continue
    }

    if (courseForceUnlock) {
      const status = course.status === 'locked' ? 'available' : course.status
      result.push({
        ...course,
        slug,
        status,
        stations,
        reasonCode: 'requirements_met',
        lockMessage: undefined,
      })
      continue
    }

    // Đảo N (N > 1): Chỉ mở khi Đảo N-1 có trạng thái completed
    const prevCourse = result[idx - 1]
    const isPrevDone = isCourseRuleCompleted(prevCourse)

    if (isPrevDone) {
      const status = course.status === 'locked' ? 'available' : course.status
      result.push({
        ...course,
        slug,
        status,
        stations,
        reasonCode: 'requirements_met',
        lockMessage: undefined,
      })
    } else {
      const prevTitle = formatCourseTitle(prevCourse.title) || 'đảo trước'
      result.push({
        ...course,
        slug,
        status: 'locked' as const,
        stations,
        reasonCode: 'previous_island_incomplete',
        lockMessage: `Bé hãy hoàn thành ${prevTitle} trước để mở khóa hòn đảo tiếp theo nhé!`,
      })
    }
  }

  return result
}

export function isPathwayCourseVisible(course: PathwayCourse): boolean {
  // A locked region is part of the learner's pathway: hiding it removes the
  // goal and the server-authored condition needed to unlock it.
  return ['completed', 'active', 'available', 'locked'].includes(course.status)
}

export const AIKI_ISLAND_BADGES = [
  'ĐẢO TIÊN QUYẾT',
  'ĐẢO KHÁM PHÁ',
  'ĐẢO HOẠ SĨ',
  'ĐẢO NHÂN VẬT',
  'ĐẢO TRUYỆN TRANH',
  'ĐẢO TRÒ CHƠI',
] as const

export function formatCourseTitle(title?: string | null): string {
  if (!title) return ''
  return title
    .replace(/^module\s*\d+\s*[-—:]\s*/i, '')
    .replace(/^module\s*\d+\s*\.\s*/i, '')
    .replace(/^m\d+\s*[-—:]\s*/i, '')
    .replace(/^đảo\s*\d+\s*[-—:]\s*/i, '')
    .trim()
}

export const WORLD_REGIONS = [
  {
    name: 'Đảo Tiên Quyết',
    badge: 'ĐẢO TIÊN QUYẾT',
    description: 'Đảo Tiên Quyết — Nắm vững 10 nguyên tắc an toàn, đạo đức và làm chủ AI của Xưởng sáng tạo.',
    background: designerAssets.lobby.bgHome,
    scene: designerAssets.worldScenes.aiValley,
    ribbon: '#7c3aed',
    trailLabel: 'Đường mòn 10 Quy Tắc Vàng',
    pose: 'guide' as const,
    sceneLabel: 'AIKI đang hướng dẫn 10 quy tắc an toàn sáng tạo AI',
  },
  {
    name: 'Đảo Khám Phá',
    badge: 'ĐẢO KHÁM PHÁ',
    description: '4 Chìa Khóa Lệnh — Tạo hình ảnh đơn lẻ đúng ý mình và sửa câu lệnh như một kỹ sư AI thực thụ.',
    background: designerAssets.lobby.bgArt,
    scene: designerAssets.worldScenes.promptKeys,
    ribbon: '#10b981',
    trailLabel: 'Đường thám hiểm 4 chìa khoá lệnh',
    pose: 'thinking' as const,
    sceneLabel: 'AIKI đang cùng con mở 4 chiếc chìa khoá lệnh',
  },
  {
    name: 'Đảo Hoạ Sĩ',
    badge: 'ĐẢO HOẠ SĨ',
    description: 'Sắc Màu & Kể Chuyện — Bố cục ngôi sao 3 lớp, ánh sáng cảm xúc và tạo ra bức tranh biết nói.',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.creativeMountain,
    ribbon: '#f59e0b',
    trailLabel: 'Đường mòn sắc màu hoạ sĩ',
    pose: 'celebrate' as const,
    sceneLabel: 'AIKI đang cầm cọ vẽ kiệt tác nghệ thuật',
  },
  {
    name: 'Đảo Nhân Vật',
    badge: 'ĐẢO NHÂN VẬT',
    description: 'Hồ Sơ & 6 Biểu Cảm — Khoá mật mã nhận diện 3 điểm, biến hoá 6 biểu cảm và căn cứ bí mật.',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.characterLab,
    ribbon: '#0284c7',
    trailLabel: 'Đường mật mã nhân vật',
    pose: 'support' as const,
    sceneLabel: 'AIKI đang cùng con thiết kế hồ sơ nhân vật độc quyền',
  },
  {
    name: 'Đảo Truyện Tranh',
    badge: 'ĐẢO TRUYỆN TRANH',
    description: 'Storyboard 8 Ô & Comic — Kịch bản 3 cổng, khung xương 4 nhịp và xuất bản cuốn truyện tranh 8 trang.',
    background: designerAssets.lobby.bgArt,
    scene: designerAssets.worldScenes.storyIsland,
    ribbon: '#ec4899',
    trailLabel: 'Đường vương quốc truyện tranh 8 ô',
    pose: 'thinking' as const,
    sceneLabel: 'AIKI đang xem bản thảo truyện tranh 8 ô',
  },
  {
    name: 'Đảo Trò Chơi',
    badge: 'ĐẢO TRÒ CHƠI',
    description: 'Đấu Trường Thẻ Bài — Bộ 12 thẻ bài cân bằng chỉ số Sức-Nhanh-Khéo, bàn cờ A3 và luật chơi công bằng.',
    background: designerAssets.lobby.bgHome,
    scene: designerAssets.worldScenes.gameArena,
    ribbon: '#8b5cf6',
    trailLabel: 'Đấu trường thẻ bài đỉnh cao',
    pose: 'celebrate' as const,
    sceneLabel: 'AIKI đang thi đấu trận chung kết thẻ bài',
  },
] as const

export function getAikiCourseSortOrder(course: {
  id?: string
  slug?: string
  title?: string
  shortTitle?: string
  courseKey?: string
  metadata?: any
}): number {
  if (course.metadata?.sortOrder !== undefined && typeof course.metadata.sortOrder === 'number') {
    return Number(course.metadata.sortOrder)
  }
  if (course.metadata?.regionOrder !== undefined && typeof course.metadata.regionOrder === 'number') {
    return Number(course.metadata.regionOrder)
  }

  const key = `${course.courseKey ?? ''} ${course.id ?? ''} ${course.slug ?? ''}`.toLowerCase()
  const title = `${course.title ?? ''} ${course.shortTitle ?? ''}`.toLowerCase()
  const combined = `${key} ${title}`

  if (
    combined.includes('muoi-quy-tac') ||
    combined.includes('quy tắc') ||
    combined.includes('quy tac') ||
    combined.includes('module 0') ||
    combined.includes('aiki-rules') ||
    combined.includes('rule') ||
    combined.includes('tiên quyết') ||
    combined.includes('tien quyet')
  ) {
    return 0
  }
  if (
    combined.includes('dao-1') ||
    combined.includes('module 1') ||
    combined.includes('nha-tham-hiem') ||
    combined.includes('nhà thám hiểm') ||
    combined.includes('khám phá') ||
    combined.includes('kham pha') ||
    combined.includes('chìa khoá')
  ) {
    return 1
  }
  if (
    combined.includes('dao-2') ||
    combined.includes('module 2') ||
    combined.includes('hoa-si') ||
    combined.includes('hoạ sĩ')
  ) {
    return 2
  }
  if (
    combined.includes('dao-3') ||
    combined.includes('module 3') ||
    combined.includes('nhan-vat') ||
    combined.includes('nhân vật')
  ) {
    return 3
  }
  if (
    combined.includes('dao-4') ||
    combined.includes('module 4') ||
    combined.includes('truyen-tranh') ||
    combined.includes('truyện tranh')
  ) {
    return 4
  }
  if (
    combined.includes('dao-5') ||
    combined.includes('module 5') ||
    combined.includes('tro-choi') ||
    combined.includes('trò chơi')
  ) {
    return 5
  }
  return 99
}

export function sortAikiCourses<
  T extends {
    id?: string
    slug?: string
    title?: string
    shortTitle?: string
    courseKey?: string
    metadata?: any
  },
>(courses: T[]): T[] {
  return [...courses].sort((a, b) => getAikiCourseSortOrder(a) - getAikiCourseSortOrder(b))
}

export function getRegionForCourse(
  course: { id?: string; title?: string; shortTitle?: string; courseKey?: string; metadata?: any },
  index: number,
) {
  const order = getAikiCourseSortOrder(course)
  if (order < WORLD_REGIONS.length) {
    return WORLD_REGIONS[order]
  }
  return WORLD_REGIONS[index % WORLD_REGIONS.length]
}

export function getIslandBadge(
  course: { id?: string; title?: string; shortTitle?: string; courseKey?: string; metadata?: any },
  index: number,
): string {
  const order = getAikiCourseSortOrder(course)
  if (order >= 0 && order < AIKI_ISLAND_BADGES.length) {
    return AIKI_ISLAND_BADGES[order]
  }
  if (index >= 0 && index < AIKI_ISLAND_BADGES.length) {
    return AIKI_ISLAND_BADGES[index]
  }
  return `ĐẢO ${index + 1}`
}

function RoadmapCourseNode({
  course,
  index,
  isRecommended,
  courseHref,
  onLockedClick,
}: {
  course: PathwayCourse
  index: number
  isRecommended: boolean
  courseHref: string
  onLockedClick?: (course: PathwayCourse) => void
}) {
  const region = getRegionForCourse(course, index);
  const isCompleted = course.status === 'completed';
  const isActive = course.status === 'active';
  const isDevUnlock = isUserTestingUnlocked();
  const forceUnlock = FORCE_UNLOCK_ALL_ISLANDS || isDevUnlock;
  const isLocked = !forceUnlock && course.status === 'locked';
  const stationCount = getCourseStationCount(course)
  const completedStations = Math.min(
    stationCount,
    Math.max(0, course.completedCount ?? Math.floor((stationCount * course.completionPercent) / 100)),
  );
  const completionPercent = isCompleted
    ? 100
    : stationCount > 0
      ? Math.max(course.completionPercent, Math.round((completedStations / stationCount) * 100))
      : course.completionPercent;
  const nextStation = course.stations?.find(
    (station) => station.status === 'available' || station.status === 'in_progress',
  );
  const isRuleCourse = isAikiRuleCourse(course, index);
  const previousRegion = index > 0 ? WORLD_REGIONS[(index - 1) % WORLD_REGIONS.length] : null;

  const handleLockedClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLocked && onLockedClick) {
      onLockedClick(course);
    }
  };

  const cardInner = (
    <div
      className={cn(
        'world-region-ribbon flex w-full flex-col gap-3 px-5 py-4 text-white transition-transform duration-200 sm:px-8 sm:py-5',
        isLocked && 'opacity-70 cursor-pointer',
        !isLocked && 'hover:-translate-y-0.5',
      )}
      style={{ backgroundColor: region.ribbon }}
      onClick={isLocked ? handleLockedClick : undefined}
      role={isLocked ? 'button' : undefined}
      tabIndex={isLocked ? 0 : undefined}
      onKeyDown={isLocked ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleLockedClick(e);
        }
      } : undefined}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {course.isGatekeeper ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-black text-amber-950 shadow-2xs">
            🛡️ Đảo Tiên Quyết
          </span>
        ) : isRecommended && !isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-brand-700">
            <Zap size={9} aria-hidden /> Tiếp theo
          </span>
        )}
        <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-extrabold text-white">
          {isCompleted ? 'Hoàn thành' : isActive ? 'Đang học' : isLocked ? 'Chưa mở' : 'Sẵn sàng'}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 truncate">
          {course.shortTitle ? formatCourseTitle(course.shortTitle) : region.name}
        </p>
        <h3 className="font-display text-xl leading-snug text-white line-clamp-2">
          {formatCourseTitle(course.title)}
        </h3>
      </div>

      {(isActive || isCompleted) && (
        <div>
          <CuteProgress
            value={completionPercent}
            label="Hoàn thành khóa"
            tone={isCompleted ? 'mint' : 'violet'}
          />
        </div>
      )}

      {stationCount > 0 && (
        <div className="world-station-preview" aria-label={`${completedStations}/${stationCount} trạm hoàn thành`}>
          <div className="world-station-preview-head">
            <span>{region.trailLabel}</span>
            <strong>{completedStations}/{stationCount} trạm</strong>
          </div>
          <ol className="world-station-path scroll-smooth pr-6">
            {Array.from({ length: stationCount }, (_, stationIndex) => {
              const stationNumber = stationIndex + 1;
              const station = course.stations?.[stationIndex];
              const isDone = station?.status === 'completed' || stationNumber <= completedStations;
              const isCurrent = station?.status === 'available' || station?.status === 'in_progress' || (stationNumber === completedStations + 1 && !isCompleted);
              const dotClassName = cn(
                'world-station-dot',
                isDone && 'world-station-dot-done',
                isCurrent && 'world-station-dot-current',
              );
              const stationLabel = `Trạm ${stationNumber}: ${station?.title ?? ''}${isDone ? ', đã xong' : isCurrent ? ', tiếp theo' : ', chưa mở'}`;
              return (
                <li key={`${course.id}-${station?.id || station?.slug || stationNumber}-${stationNumber}`}>
                  {station && !isLocked && (forceUnlock || station.status !== 'locked') ? (
                    <Link
                      to={`/world/${course.slug || course.id}/lesson/${getStationSlug(station, isRuleCourse)}`}
                      className={dotClassName}
                      aria-label={stationLabel}
                      title={station.title}
                    >
                      {stationNumber}
                    </Link>
                  ) : isLocked ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLockedClick(e);
                      }}
                      className={cn(dotClassName, 'cursor-pointer hover:scale-110 transition-transform')}
                      aria-label={stationLabel}
                      title="Bấm để xem điều kiện mở khóa đảo này"
                    >
                      {stationNumber}
                    </button>
                  ) : (
                    <span className={dotClassName} aria-label={stationLabel} aria-disabled="true">
                      {stationNumber}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {isLocked && (
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleLockedClick}
            className="flex items-center gap-3 rounded-2xl border border-white/40 bg-black/20 p-3 text-left hover:bg-black/30 transition-colors w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
              <KidLockImageIcon size={38} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>🛡️ Đảo Đang Khóa</span>
                <span className="text-[10px] rounded-md bg-white/25 px-1.5 py-0.5 font-black uppercase tracking-wider">Xem điều kiện</span>
              </p>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed text-white/90 line-clamp-2">
                {course.lockMessage || (course.reasonCode === 'prerequisite_incomplete' && previousRegion
                  ? `Hoàn thành ${previousRegion.name} để mở đảo này.`
                  : 'Bé hãy hoàn thành Đảo Quy Tắc Vàng AIKI trước để mở khóa nhé!')}
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLockedClick}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-amber-950 shadow-soft hover:bg-amber-300 active:scale-95 transition-all cursor-pointer"
            >
              <KidLockImageIcon size={20} aria-hidden="true" />
              <span>Xem cách mở khóa</span>
            </button>
          </div>
        </div>
      )}

      {!isLocked && (
        <div className="flex flex-wrap items-center gap-2">
          {isCompleted ? (
            <Link
              to={`/world/${course.slug || course.id}`}
              className="world-course-primary-action"
            >
              Học lại
            </Link>
          ) : nextStation ? (
            <Link
              to={`/world/${course.slug || course.id}/lesson/${getStationSlug(nextStation, isRuleCourse)}`}
              className="world-course-primary-action"
            >
              Học tiếp
            </Link>
          ) : (
            <Link
              to={`/world/${course.slug || course.id}`}
              className="world-course-primary-action"
            >
              Bắt đầu học
            </Link>
          )}
          {!isCompleted && (
            <Link
              to={`/world/${course.slug || course.id}`}
              className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-extrabold text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white"
            >
              Xem toàn bộ trạm
              <ChevronRight size={16} aria-hidden />
            </Link>
          )}
        </div>
      )}
    </div>
  )

  const card = (
    <div
      onClick={isLocked ? handleLockedClick : undefined}
      className={cn('w-full', isLocked && 'cursor-pointer')}
    >
      {cardInner}
    </div>
  )

  return (
    <li
      onClick={isLocked ? handleLockedClick : undefined}
      className={cn(
        'world-region-card relative overflow-visible',
        isCompleted && 'world-region-card-completed',
        (isActive || isRecommended) && !isCompleted && 'world-region-card-current',
        isLocked && 'world-region-card-locked grayscale-[.35] cursor-pointer',
      )}
    >
      <div className="relative flex min-h-[22rem] sm:min-h-[28rem] lg:min-h-[32rem] flex-col justify-between pt-6 sm:pt-7">
        <div className="relative z-10 px-5 text-center sm:px-8">
          {course.isGatekeeper && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-950 shadow-sm animate-pop">
              <span>🛡️ Đảo Tiên Quyết — Cửa ngõ mở khóa toàn bộ thế giới</span>
            </div>
          )}
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-700">
            {getIslandBadge(course, index)}
          </p>
          <h2 className="mt-1 font-display text-4xl text-text">{formatCourseTitle(course.title)}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm font-bold leading-relaxed text-muted">
            {course.shortTitle && course.shortTitle !== course.title
              ? formatCourseTitle(course.shortTitle)
              : region.description}
          </p>
        </div>
        <div className="world-region-scene relative z-10 flex flex-1 items-end justify-center overflow-hidden px-4 pt-2" aria-label={region.sceneLabel}>
          <img
            src={region.scene}
            alt=""
            className="world-region-art"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          <AikidCatCharacter pose={region.pose} className="world-region-scene-cat" />
        </div>
        <div className="relative z-20">{card}</div>
      </div>
      <svg
        className="world-region-road"
        viewBox="0 0 100 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="world-region-road-edge" d="M50 0 C18 42 82 102 50 160" />
        <path className="world-region-road-surface" d="M50 0 C18 42 82 102 50 160" />
        <path className="world-region-road-centre" d="M50 0 C18 42 82 102 50 160" />
      </svg>
    </li>
  )
}

type LearningWorldKind = 'aikid_official' | 'workspace' | 'creator_marketplace'

const LEARNING_WORLD_SCENES: Record<LearningWorldKind, string> = {
  aikid_official: designerAssets.worldLibrary.aikidOfficial,
  workspace: designerAssets.worldLibrary.school,
  creator_marketplace: designerAssets.worldLibrary.creator,
}

function LearningWorldScene({ kind }: { kind: LearningWorldKind }) {
  const pose = kind === 'aikid_official' ? 'guide' : kind === 'workspace' ? 'walking' : 'thinking'
  return (
    <div className="learning-world-scene" aria-hidden="true">
      <img src={LEARNING_WORLD_SCENES[kind]} alt="" className="learning-world-scene-art" draggable={false} />
      <AikidCatCharacter pose={pose} className="learning-world-scene-cat" />
    </div>
  )
}

function PathwayOverview({
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
      Boolean(course.lockMessage && /gói|129|trả phí|mua|nâng cấp|học phí/i.test(course.lockMessage))
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
  const canonicalOfficialCourses = selectedSource === 'aikid_official'
    ? selectCanonicalAikidCourses(sourceCourses)
    : []
  const selectedSourceCourses = sortAikiCourses(
    selectedSource === 'aikid_official' && canonicalOfficialCourses.length > 0
      ? canonicalOfficialCourses
      : sourceCourses,
  )
  const selectedCourses = selectedSource === 'aikid_official'
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
  const totalStations = selectedCourses.reduce((sum, course) => sum + getCourseStationCount(course), 0)
  const completedStations = selectedCourses.reduce(
    (sum, course) => sum + Math.max(0, course.completedCount ?? 0),
    0,
  )
  const totalStars = selectedCourses.reduce((sum, course) => sum + (course.totalStars ?? 0), 0)
  const totalProgress = totalStations > 0
    ? Math.round((completedStations / totalStations) * 100)
    : 0
  const nextTicket = sourceRecommended && (
    <div className="world-next-ticket">
      <div>
        <p className="flex items-center gap-1 text-xs font-extrabold uppercase text-mint-700">
          <Star size={11} className="fill-mint-500 text-mint-500" aria-hidden />
          Trạm tiếp theo
        </p>
        <p className="mt-1 font-display text-xl">
          {formatCourseTitle(nextStation?.title ?? sourceRecommended.title)}
        </p>
        <p className="mt-1 text-sm font-bold text-muted">
          {nextStation
            ? `${sourceRecommended.shortTitle} · Trạm ${nextStation.order}`
            : `${sourceRecommended.completedCount ?? 0}/${getCourseStationCount(sourceRecommended)} trạm đã hoàn thành`}
        </p>
      </div>
      {sourceRecommended.status === 'locked' ? (
        <Button onClick={() => handleLockedCourseClick(sourceRecommended)}>
          🔒 Xem điều kiện mở
        </Button>
      ) : (
        <Link to={nextStation ? `/world/${sourceRecommended.slug || sourceRecommended.id}/lesson/${getStationSlug(nextStation, isAikiRuleCourse(sourceRecommended))}` : courseHref(sourceRecommended)}>
          <Button>
            {sourceRecommended.status === 'available' && !nextStation ? 'Xem & bắt đầu' : 'Học tiếp'}
          </Button>
        </Link>
      )}
    </div>
  )

  // ─────────────────────────────────────────────────────────────
  // Trường hợp 1: Chế độ Thư viện Không Gian Học Tập (/world/spaces)
  // ─────────────────────────────────────────────────────────────
  if (isSpacesView || !selectedSource) {
    return (
      <div className="page-enter flex flex-col gap-5">
        <header className="world-guide-panel">
          <AikidCatCharacter pose="walking" className="world-guide-mascot" />
          <div className="world-guide-copy">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-700 shadow-xs border border-slate-200/80 text-xs font-extrabold hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Trang chủ</span>
              </Link>
              <button
                type="button"
                onClick={() => navigate('/world/program/aikid_official')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-brand-700 shadow-xs border border-brand-200/80 text-xs font-extrabold hover:bg-brand-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Về AIKid của em</span>
              </button>
            </div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
              Thư viện hành trình
            </p>
            <h1 className="font-display text-3xl sm:text-4xl leading-tight">
              Không gian học tập
            </h1>
            <p className="mt-1 text-base text-muted line-clamp-1">
              Chọn không gian con muốn tiếp tục học hôm nay.
            </p>
            </div>
          </div>
        </header>

        <section aria-labelledby="learning-library-title" className="space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Ba không gian học tập</p>
            <h2 id="learning-library-title" className="mt-1 font-display text-2xl text-text sm:text-3xl">Con muốn học ở đâu?</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((category) => {
              const courses = visibleCourses.filter((course) => sourceOf(course) === category.id)
              const active = courses.filter((course) => course.status === 'active').length
              const stations = courses.reduce((sum, course) => sum + getCourseStationCount(course), 0)
              const doneStations = courses.reduce((sum, course) => sum + Math.max(0, course.completedCount ?? 0), 0)
              const progress = stations > 0 ? Math.round(doneStations / stations * 100) : 0
              return (
                <button
                  key={category.id}
                  type="button"
                  className={cn(
                    'learning-world-card ui-card border text-left transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus cursor-pointer clay-card-subtle',
                    category.tone,
                  )}
                  onClick={() => navigate('/world/program/' + category.id)}
                >
                  <LearningWorldScene kind={category.id} />
                  <span className="learning-world-copy">
                    <span className="block text-xs font-extrabold uppercase tracking-wide opacity-80">{category.eyebrow}</span>
                    <span className="mt-1 block font-display text-2xl text-text">{category.title}</span>
                    <span className="mt-1 block text-sm font-bold leading-relaxed text-muted line-clamp-1">{category.description}</span>
                    <span className="mt-3 flex min-h-9 flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-white/85 px-3 py-2 text-sm font-extrabold text-text shadow-soft">
                      {courses.length > 0
                        ? <>
                            <span>{doneStations}/{stations} trạm</span>
                            <span aria-hidden="true" className="text-border">·</span>
                            <span>{progress}% hoàn thành</span>
                            {active > 0 && <span className="text-brand-700">{active} đang học</span>}
                          </>
                        : 'Chưa có chương trình'}
                    </span>
                  </span>
                </button>
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
      <div className="page-enter flex flex-col gap-5">
        <header className="world-guide-panel">
          <img
            src={LEARNING_WORLD_SCENES.aikid_official}
            alt=""
            className="world-guide-scene"
            aria-hidden="true"
          />
          <AikidCatCharacter pose="walking" className="world-guide-mascot" />
          <div className="world-guide-copy">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-brand-500">
                <span>Không gian học chính thức</span>
              </p>
              <h1 className="font-display text-3xl sm:text-4xl leading-tight">
                AIKid của em
              </h1>
              <p className="mt-1 text-base text-muted line-clamp-1">
                Khám phá các chương trình rèn luyện tư duy và sáng tạo cùng AI được biên soạn chuẩn hóa cho học sinh.
              </p>

              {/* Tóm tắt nhanh */}
              {selectedCourses.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
                    <CheckCircle2 size={13} className="text-mint-600" aria-hidden />
                    {completedStations}/{totalStations} trạm đã hoàn thành
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
                    <Trophy size={13} className="text-sun-600" aria-hidden />
                    {totalProgress}% tiến độ tổng
                  </div>
                </div>
              )}
              {selectedCourses.length > 0 && (
                <CuteProgress
                  value={totalProgress}
                  label="Lộ trình AIKid của em"
                  tone="mint"
                  className="mt-4"
                />
              )}
            </div>
          </div>

          {nextTicket}
        </header>

        {/* Danh mục Các Chương Trình Học */}
        <section aria-labelledby="programs-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
                Lộ trình học tập
              </p>
              <h2 id="programs-heading" className="mt-0.5 font-display text-2xl text-text sm:text-3xl">
                Các chương trình học
              </h2>
            </div>
          </div>

          <div className="grid gap-6">
            <WorldProgramIslandCard
              type="aikid"
              totalProgress={totalProgress}
              completedStations={completedStations}
              totalStations={totalStations}
              completedCount={completedCount}
              totalCourses={selectedCourses.length || 6}
              totalStars={totalStars}
              courses={selectedCourses}
            />
            {/* Tạm thời ẩn Olympic 3D (ASMO Lab) để phát triển trên localhost */}
            {/* <WorldProgramIslandCard type="asmo" /> */}
          </div>

          {/* 3. Nút nhỏ cuối trang: tạm thời ẩn để chỉ để lại chương trình học chính thức */}
          {/* <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/world/spaces')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-muted hover:text-brand-700 transition-colors cursor-pointer py-2 px-4 rounded-xl hover:bg-white/60"
            >
              <span>Xem các không gian khác (Trường học, Khóa học tự do)</span>
            </button>
          </div> */}
        </section>

        {/* Soft Clay Modal khi bấm vào đảo đang bị khóa */}
        <AdventureModal
          open={Boolean(lockedModalCourse)}
          onClose={() => setLockedModalCourse(null)}
          tone="guidance"
          eyebrow="🛡️ Đảo Đang Chờ Mở Khóa"
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
                <Button className="w-full">
                  🛡️ Đến Đảo Quy Tắc Ngay
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => setLockedModalCourse(null)}
                className="w-full sm:w-auto"
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
              navigate('/parent/learning?upgrade=aikids_official_129k')
            } else {
              setIsParentGateOpen(true)
            }
          }}
        />
        {isParentGateOpen && (
          <ParentGateModal
            open={isParentGateOpen}
            onClose={() => setIsParentGateOpen(false)}
            redirectTo="/parent/learning?upgrade=aikids_official_129k"
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
    <div className="page-enter flex flex-col gap-4 sm:gap-5">
      <header className="world-guide-panel">
        {selectedSource && (
          <img
            src={LEARNING_WORLD_SCENES[selectedSource]}
            alt=""
            className="world-guide-scene"
            aria-hidden="true"
          />
        )}
        <AikidCatCharacter pose="walking" className="world-guide-mascot" />
        <div className="world-guide-copy">
          <div className="min-w-0">
            {/* Nút quay lại */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-700 shadow-xs border border-slate-200/80 text-xs font-extrabold hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Trang chủ</span>
              </Link>
              {isCreatorTrack ? (
                <button
                  type="button"
                  onClick={() => navigate('/world/program/aikid_official')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-brand-700 shadow-xs border border-brand-200/80 text-xs font-extrabold hover:bg-brand-50 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Danh sách chương trình</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/world/spaces')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-brand-700 shadow-xs border border-brand-200/80 text-xs font-extrabold hover:bg-brand-50 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Xem tất cả không gian học</span>
                </button>
              )}
            </div>

            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
              {isCreatorTrack ? 'AIKid của em › Khóa sáng tạo nội dung cùng AIKID' : (selectedCategory?.eyebrow || 'Lộ trình học')}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl leading-tight">
              {isCreatorTrack ? 'Khóa sáng tạo nội dung cùng AIKID' : (selectedCategory?.title || 'Hành trình của con')}
            </h1>
            <p className="mt-1 text-base text-muted line-clamp-1">
              {isCreatorTrack
                ? 'Nắm vững 10 quy tắc vàng an toàn, cùng AIKI sáng tạo nhân vật, viết truyện tranh và xây dựng các thế giới diệu kỳ.'
                : (selectedCategory?.description || 'Khám phá các trạm học.')}
            </p>

            {/* Thống kê tiến độ */}
            {selectedCourses.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
                  <CheckCircle2 size={13} className="text-mint-600" aria-hidden />
                  {completedStations}/{totalStations} trạm đã hoàn thành
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
                  <Trophy size={13} className="text-sun-600" aria-hidden />
                  {totalProgress}% hoàn thành
                </div>
              </div>
            )}
            {selectedCourses.length > 0 && (
              <CuteProgress
                value={totalProgress}
                label={isCreatorTrack ? 'Tiến độ Khóa sáng tạo nội dung' : `Lộ trình ${selectedCategory?.title}`}
                tone="mint"
                className="mt-4"
              />
            )}
          </div>
        </div>

        {selectedCategory && nextTicket}
      </header>

      {selectedCourses.length === 0 ? (
        <div className="ui-card p-6 text-center">
          <CourseBookIcon size={44} className="mx-auto text-brand-500" aria-hidden="true" />
          <p className="mt-3 font-display text-xl">Chưa có chương trình trong mục này</p>
          <p className="mt-2 text-sm text-muted">
            Chương trình được trường giao hoặc gia đình đăng ký sẽ xuất hiện tại đây.
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/world/spaces')}>
            Quay lại thư viện không gian
          </Button>
        </div>
      ) : (
        <section aria-label="Lộ trình khóa học" className="relative px-2">
          {/* ── Section label ── */}
          <p className="mb-5 text-xs font-extrabold uppercase tracking-widest text-brand-500 flex items-center gap-2">
            <span className="inline-block h-px flex-1 bg-brand-100" />
            🗺️ Các Đảo Trong Khóa Sáng Tạo AIKID
            <span className="inline-block h-px flex-1 bg-brand-100" />
          </p>

          <div className="relative">
            <ol className="relative z-10 flex flex-col gap-6" aria-label="Danh sách các đảo và bản đồ khóa học">
              {selectedCourses.map((course, index) => (
                <RoadmapCourseNode
                  key={course.id}
                  course={course}
                  index={index}
                  isRecommended={course.id === sourceRecommended?.id}
                  courseHref={courseHref(course)}
                  onLockedClick={(c) => handleLockedCourseClick(c)}
                />
              ))}
            </ol>

            {/* ── Finish line at bottom ── */}
            {completedCount === selectedCourses.length && selectedCourses.length > 0 && (
              <div className="relative z-10 flex flex-col items-center mt-8 animate-pop">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/60 bg-[#f59e0b] shadow-clay clay-card-subtle [--clay-shadow:rgba(245,158,11,0.35)]">
                  <Trophy size={40} className="text-white" aria-hidden="true" />
                </div>
                <p className="mt-3 font-display text-xl text-text">🎉 Xuất sắc!</p>
                <p className="text-sm text-muted">Con đã hoàn thành toàn bộ lộ trình!</p>
              </div>
            )}

            {/* Finish flag at bottom (always shown) */}
            {selectedCourses.length > 0 && completedCount < selectedCourses.length && (
              <div
                className="world-pathway-destination relative z-10 mx-auto flex w-fit items-center gap-2 text-xs font-extrabold text-muted"
                aria-hidden
              >
                <span className="world-pathway-destination-flag">🏁</span>
                Đích đến
              </div>
            )}
          </div>
        </section>
      )}

      {/* Soft Clay Modal khi bấm vào đảo đang bị khóa */}
      <AdventureModal
        open={Boolean(lockedModalCourse)}
        onClose={() => setLockedModalCourse(null)}
        tone="guidance"
        eyebrow="🛡️ Đảo Đang Chờ Mở Khóa"
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
              <Button className="w-full">
                🛡️ Đến Đảo Quy Tắc Ngay
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => setLockedModalCourse(null)}
              className="w-full sm:w-auto"
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
            navigate('/parent/learning?upgrade=aikids_official_129k')
          } else {
            setIsParentGateOpen(true)
          }
        }}
      />
      {isParentGateOpen && (
        <ParentGateModal
          open={isParentGateOpen}
          onClose={() => setIsParentGateOpen(false)}
          redirectTo="/parent/learning?upgrade=aikids_official_129k"
        />
      )}
    </div>
  )
}
