import React, { Suspense, useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { CheckCircle2, Star, Trophy, Zap, Lock } from 'lucide-react'
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
import { type CourseSummary, type QuestProgress } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { cn } from '@/shared/lib/cn'
import { getCanonicalAikidCourseSlug, getCourseStationCount } from '@/shared/lib/course-station-count'
import { WorldProgramIslandCard } from '../components/WorldProgramIslandCard'
import { prefetchRoute, prefetchRouteImmediately } from '@/app/route-prefetch'
import { designerAssets } from '@/shared/config/assets'
import {
  calculateCourseStars,
  clampCourseAggregateStars,
  dedupeStationProgress,
} from '@/shared/lib/star-progress'

const IslandStationsExplorerView = React.lazy(() =>
  import('../components/IslandStationsExplorerView').then((m) => ({
    default: m.IslandStationsExplorerView,
  }))
)
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import {
  findIslandCurriculum,
  ISLAND_CURRICULUM_LESSONS,
} from '@/features/lesson/data/island-curriculum-registry'
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

export function mapCourseCatalogStations(course?: CourseSummary | null): QuestProgress[] {
  if (!course?.quests?.length) return []

  return course.quests
    .filter((station) => typeof station.id === 'string' && station.id.trim().length > 0)
    .map((station) => ({
      ...station,
      status: station.status || 'locked',
      phase: station.stage || 'learn',
      stars: 0,
      xpEarned: 0,
    })) as QuestProgress[]
}

const AIKID_CURRICULUM_ISLAND_BY_SLUG: Record<string, number> = {
  'dao-1-nha-tham-hiem-ai': 1,
  'dao-2-hoa-si-ai': 2,
  'dao-3-biet-doi-nhan-vat-ai': 3,
  'dao-4-vuong-quoc-truyen-tranh-ai': 4,
  'dao-5-nha-phat-minh-tro-choi-ai': 5,
}

export function mapPublishedCurriculumStations(
  course?: PathwayCourse | null,
  routeIdentifier?: string,
): QuestProgress[] {
  if (!course) return []
  const canonicalSlug = getCanonicalAikidCourseSlug(course) ||
    (routeIdentifier ? ISLAND_ALIAS_MAP[routeIdentifier] : null)
  const islandNumber = canonicalSlug
    ? AIKID_CURRICULUM_ISLAND_BY_SLUG[canonicalSlug]
    : undefined
  const publishedCount = getCourseStationCount(course)
  if (!islandNumber) return []

  // Compatibility for rolling Hub deployments where pathway exposes the
  // published count but neither pathway nor course detail embeds lectures.
  // Access still comes from the server-owned course gate; these rows only map
  // the bundled, published AIKID curriculum to its lesson routes.
  return ISLAND_CURRICULUM_LESSONS
    .filter((lesson) => lesson.islandNumber === islandNumber)
    .sort((a, b) => a.lessonNumber.localeCompare(b.lessonNumber, 'vi'))
    .slice(0, publishedCount > 0 ? publishedCount : undefined)
    .map((lesson, index) => ({
      id: lesson.id,
      slug: lesson.slug,
      order: index + 1,
      title: lesson.title,
      skill: lesson.skillLearned,
      reward: '',
      duration: '',
      hook: lesson.objective,
      accent: 'mint',
      practiceKind: 'lesson',
      status: 'locked',
      phase: 'learn',
      stars: 0,
      xpEarned: 0,
    }))
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

        // Prefer the compact pathway projection. Older deployments may expose
        // only aggregate counts there, while a new learner has no rows yet in
        // the progress projection. In that case fetch the authoritative course
        // catalog once; never synthesize CMS stations in the browser.
        const progressData = pathRow?.stations?.length
          ? {
              quests: pathRow.stations,
              completedCount: pathRow.completedCount ?? 0,
              totalStars: pathRow.totalStars ?? 0,
            }
          : await learningApi
              .getCourseProgress(actualCourseId)
              .catch(() => null)
        const needsCourseCatalog =
          !pathRow?.stations?.length && !progressData?.quests?.length
        const courseCatalog = needsCourseCatalog
          ? await learningApi.getCourse(actualCourseId).catch(() => null)
          : null

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
            : mapCourseCatalogStations(courseCatalog?.course)

        // Never turn count-only/backend placeholder rows into navigable
        // stations. They have no lesson identity and previously produced links
        // such as `/lesson/`, which then fell through the auth/route guards.
        rawQuests = dedupeStationProgress(rawQuests.filter((station) =>
          typeof station.id === 'string' && station.id.trim().length > 0,
        ))

        if (rawQuests.length === 0 && !isRuleCourse) {
          rawQuests = mapPublishedCurriculumStations(pathRow, courseId)
        }

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
          const starSummary = calculateCourseStars(
            sequentialQuests,
            progressData?.totalStars,
          )
          const nextMeta = {
            totalStars: starSummary.earned,
            completedCount: Math.min(
              sequentialQuests.length,
              Math.max(progressData?.completedCount ?? 0, calculatedCompletedCount),
            ),
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
        <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 space-y-4 py-4 sm:py-6">
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
        <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
          <p className="ui-card p-4 sm:p-6 text-danger rounded-2xl" role="alert">
            {error ?? 'Chưa tải được lộ trình học.'}
          </p>
        </div>
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
      <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 flex flex-col items-center justify-center py-6 sm:py-8 page-enter">
        <div className="ui-card mx-auto w-full max-w-xl p-6 sm:p-8 text-center border-2 border-amber-200 bg-white/95 shadow-clay rounded-3xl">
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
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button onClick={() => navigate('/world/program/aikid_official')} className="w-full sm:w-auto rounded-2xl font-black">
              Danh sách các Đảo
            </Button>
            <Link to={ruleCourseHref} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full rounded-2xl font-black">
                Đến Đảo Quy Tắc Vàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 space-y-4 py-4 sm:py-6">
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
    <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 flex flex-col gap-4 sm:gap-6 page-enter py-4 sm:py-6">
      {enrollmentRequired && !loading ? (
        <section className="ui-card mx-auto w-full max-w-xl p-6 text-center rounded-3xl shadow-clay">
          <CourseBookIcon size={42} className="mx-auto text-brand-500" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl font-black">Hành trình chưa bắt đầu</h2>
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
            <Button className="rounded-2xl font-black">Bắt đầu hành trình</Button>
          </Link>
        </section>
      ) : (
        <Suspense fallback={<div className="ui-skeleton h-96 rounded-3xl" />}>
          <IslandStationsExplorerView
            courseId={courseId}
            courseTitle={courseTitle}
            quests={quests}
            courses={sortAikiCourses(selectCanonicalAikidCourses(
              pathway?.courses.filter(isPathwayCourseVisible) ?? [],
            )).map((course) => ({
              ...course,
              questCount: getCourseStationCount(course),
            }))}
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

export const AIKID_SIX_ISLANDS_CONFIG = [
  {
    index: 0,
    badge: 'ĐẢO 1',
    title: 'Đảo Tiên Quyết',
    subtitle: '10 Quy tắc vàng',
    description: 'Nắm vững 10 nguyên tắc an toàn, đạo đức và làm chủ AI của Xưởng sáng tạo.',
    scene: designerAssets.worldScenes.aiValley,
    accentColor: '#7c3aed',
    bgPastel: 'bg-violet-50/70 border-violet-200/90 text-violet-950',
    slug: 'dao-1',
    canonicalSlug: 'muoi-quy-tac-xuong-sang-tao',
  },
  {
    index: 1,
    badge: 'ĐẢO 2',
    title: 'Đảo Khám Phá',
    subtitle: '4 Chìa khóa lệnh',
    description: 'Tạo hình ảnh đơn lẻ đúng ý mình và sửa câu lệnh như một kỹ sư AI thực thụ.',
    scene: designerAssets.worldScenes.promptKeys,
    accentColor: '#059669',
    bgPastel: 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950',
    slug: 'dao-2',
    canonicalSlug: 'dao-1-nha-tham-hiem-ai',
  },
  {
    index: 2,
    badge: 'ĐẢO 3',
    title: 'Đảo Họa Sĩ',
    subtitle: 'Sắc màu cọ vẽ',
    description: 'Bố cục ngôi sao 3 lớp, ánh sáng cảm xúc và tạo ra bức tranh biết nói.',
    scene: designerAssets.worldScenes.creativeMountain,
    accentColor: '#ea580c',
    bgPastel: 'bg-amber-50/70 border-amber-200/90 text-amber-950',
    slug: 'dao-3',
    canonicalSlug: 'dao-2-hoa-si-ai',
  },
  {
    index: 3,
    badge: 'ĐẢO 4',
    title: 'Đảo Nhân Vật',
    subtitle: 'Hồ sơ 3 điểm',
    description: 'Khoá mật mã nhận diện 3 điểm, biến hoá 6 biểu cảm và căn cứ bí mật.',
    scene: designerAssets.worldScenes.characterLab,
    accentColor: '#0284c7',
    bgPastel: 'bg-sky-50/70 border-sky-200/90 text-sky-950',
    slug: 'dao-4',
    canonicalSlug: 'dao-3-biet-doi-nhan-vat-ai',
  },
  {
    index: 4,
    badge: 'ĐẢO 5',
    title: 'Đảo Truyện Tranh',
    subtitle: 'Storyboard 8 ô',
    description: 'Kịch bản 3 cổng, khung xương 4 nhịp và xuất bản cuốn truyện tranh 8 trang.',
    scene: designerAssets.worldScenes.storyIsland,
    accentColor: '#db2777',
    bgPastel: 'bg-pink-50/70 border-pink-200/90 text-pink-950',
    slug: 'dao-5',
    canonicalSlug: 'dao-4-vuong-quoc-truyen-tranh-ai',
  },
  {
    index: 5,
    badge: 'ĐẢO 6',
    title: 'Đảo Trò Chơi',
    subtitle: 'Đấu trường thẻ bài',
    description: 'Bộ 12 thẻ bài cân bằng chỉ số Sức-Nhanh-Khéo, bàn cờ A3 và luật chơi công bằng.',
    scene: designerAssets.worldScenes.gameArena,
    accentColor: '#4f46e5',
    bgPastel: 'bg-indigo-50/70 border-indigo-200/90 text-indigo-950',
    slug: 'dao-6',
    canonicalSlug: 'dao-5-nha-phat-minh-tro-choi-ai',
  },
] as const

export function ModernIslandCard({
  course,
  index,
  isRecommended,
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
    <div
      onClick={isLocked ? handleCardClick : undefined}
      className={cn(
        'group relative flex min-w-0 flex-col items-center',
        isLocked ? 'cursor-pointer opacity-80 hover:opacity-100' : '',
      )}
    >
      <div className="relative min-w-0">
        {/* Giữ trọn artwork theo đúng tỷ lệ gốc; không crop và không mask mất hai đầu ảnh. */}
        <div className="relative mx-auto aspect-video w-full max-w-[52rem] overflow-visible">
          <img
            src={config.scene}
            alt={config.title}
            className={cn(
              'h-full w-full object-contain object-center transition-transform duration-500',
              !isLocked && 'group-hover:scale-[1.025]',
              isLocked && 'filter grayscale contrast-75 brightness-95 opacity-70',
            )}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
          />

          {/* Badge số thứ tự: ĐẢO 1..6 */}
          <div className="absolute left-[8%] top-[8%] z-20 flex items-center gap-1.5">
            <span className="rounded-full border border-amber-200/80 bg-[#FFFDF7]/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-2xs">
              {config.badge}
            </span>
            {course.isGatekeeper && (
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-2xs">
                Tiên Quyết
              </span>
            )}
          </div>

          {/* Trạng thái rõ ràng */}
          <div className="absolute right-[8%] top-[8%] z-20">
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

        </div>
      </div>

      <div className="relative z-20 -mt-12 w-[calc(100%-1rem)] max-w-[52rem] min-w-0 rounded-[1.5rem] border border-amber-200/80 bg-[#FFFDF7] px-4 py-4 sm:px-6 shadow-clay sm:-mt-20 sm:w-[calc(100%-3rem)] md:rounded-[1.75rem]">
        {/* Tên đảo & chủ đề học rõ ràng */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {config.title}
            </h3>
            <span className="text-xs font-black text-[#FD7D2E] shrink-0">
              {config.subtitle}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] font-medium text-slate-600 line-clamp-1 leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Thanh tiến độ */}
        <div className="mt-3 space-y-1.5">
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

        {stationCount > 0 && (
          <div className="scrollbar-none mt-3 overflow-x-auto pb-1" aria-label={`${completedStations}/${stationCount} trạm hoàn thành`}>
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
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-black transition-transform sm:h-9 sm:w-9',
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
                  <li key={`${course.id}-${station?.id || station?.slug || stationNumber}`} className="flex items-center gap-1.5">
                    {canOpenStation && station ? (
                      <Link
                        to={`/world/${targetSlug}/lesson/${stationSlug}`}
                        className={cn(dotClassName, 'hover:scale-105')}
                        aria-label={`Mở trạm ${stationNumber}: ${station.title || ''}`}
                      >
                        {stationNumber}
                      </Link>
                    ) : (
                      <span className={dotClassName} aria-label={`Trạm ${stationNumber}`}>
                        {stationNumber}
                      </span>
                    )}
                    {stationIndex < stationCount - 1 && <span className="h-0.5 w-3 rounded-full bg-amber-200 sm:w-5" />}
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {/* Chỉ dẫn điều kiện mở khóa khi chưa mở */}
        {isLocked && (
          <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#FFFCEB] border border-amber-200/70 p-2.5 text-xs font-semibold leading-relaxed text-amber-950/80">
            <Lock size={13} className="shrink-0 text-amber-600" />
            <span>{course.lockMessage || 'Bé hãy hoàn thành đảo trước để mở khóa nhé!'}</span>
          </div>
        )}

        {/* Nút bấm hành động (ZERO ARROWS!) */}
        <div className="pt-3">
        {isCompleted ? (
          <Link
            to={islandUrl}
            className="block w-full sm:inline-block sm:w-auto"
            onPointerEnter={() => prefetchRoute(islandUrl)}
            onPointerDown={() => prefetchRouteImmediately(islandUrl)}
            onFocus={() => prefetchRoute(islandUrl)}
          >
            <Button
              variant="secondary"
              className="min-h-11 w-full rounded-2xl border-emerald-300 px-6 py-2.5 text-xs font-black text-emerald-800 hover:bg-emerald-50 active:scale-95 sm:w-auto sm:min-w-40 sm:text-sm"
            >
              Ôn lại đảo
            </Button>
          </Link>
        ) : isActive ? (
          <Link
            to={islandUrl}
            className="block w-full sm:inline-block sm:w-auto"
            onPointerEnter={() => prefetchRoute(islandUrl)}
            onPointerDown={() => prefetchRouteImmediately(islandUrl)}
            onFocus={() => prefetchRoute(islandUrl)}
          >
            <Button className="min-h-11 w-full rounded-2xl px-6 py-2.5 text-xs font-black active:scale-95 sm:w-auto sm:min-w-40 sm:text-sm">
              Khám phá đảo
            </Button>
          </Link>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={handleCardClick}
            className="min-h-11 w-full cursor-pointer rounded-2xl border-amber-200 bg-white px-6 py-2.5 text-xs font-black text-amber-950 hover:bg-amber-50 active:scale-95 sm:w-auto sm:min-w-40 sm:text-sm"
          >
            Xem điều kiện
          </Button>
        )}
        </div>
      </div>
    </div>
  )
}

function ConnectedIslandJourney({
  courses,
  recommendedCourseId,
  onLockedClick,
}: {
  courses: PathwayCourse[]
  recommendedCourseId?: string
  onLockedClick: (course: PathwayCourse) => void
}) {
  return (
    <ol className="relative space-y-4 py-4 sm:space-y-6 sm:py-6" aria-label="Hải trình các đảo học tập">
      {courses.map((course, index) => {
        return (
          <li key={course.id} className="relative z-10 min-w-0 py-2 sm:py-4">
            <div className="min-w-0">
              <ModernIslandCard
                course={course}
                index={index}
                isRecommended={course.id === recommendedCourseId}
                onLockedClick={onLockedClick}
              />
            </div>
            {index < courses.length - 1 && (
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-11rem] left-1/2 z-0 h-48 w-20 -translate-x-1/2 overflow-visible"
                viewBox="0 0 80 112"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M40 0 C52 28 27 68 40 112"
                  fill="none"
                  stroke="rgba(255,253,244,.95)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M40 0 C52 28 27 68 40 112"
                  fill="none"
                  stroke="#e8b84f"
                  strokeWidth="3"
                  strokeDasharray="2 10"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )}
          </li>
        )
      })}
    </ol>
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
  const totalStars = selectedCourses.reduce(
    (sum, course) => sum + clampCourseAggregateStars(
      course.totalStars,
      getCourseStationCount(course),
    ),
    0,
  )
  const totalProgress = totalStations > 0
    ? Math.round((completedStations / totalStations) * 100)
    : 0
  const nextTicket = sourceRecommended && (
    <div className="rounded-2xl bg-[#FFFDF7] border border-amber-200/80 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 shadow-clay">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#FD7D2E] bg-[#FFF4EC] px-2.5 py-0.5 rounded-full border border-amber-200/60">
            <Star size={11} className="fill-[#FD7D2E] text-[#FD7D2E]" />
            <span>Trạm tiếp theo</span>
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
            <Button className="w-full sm:w-auto rounded-2xl font-black text-xs sm:text-sm px-6 py-3 shadow-clay active:scale-95">
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
              const courses = category.id === 'aikid_official'
                ? applyGatekeeperRules(selectCanonicalAikidCourses(sourceRows))
                : sourceRows
              const active = courses.filter((course) => course.status === 'active').length
              const stations = courses.reduce((sum, course) => sum + getCourseStationCount(course), 0)
              const doneStations = courses.reduce(
                (sum, course) => sum + Math.min(
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
                    <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-slate-100 shadow-inner">
                      <LearningWorldScene kind={category.id} />
                    </div>
                    <div>
                      <span className="block text-[11px] font-black uppercase tracking-wider opacity-80">
                        {category.eyebrow}
                      </span>
                      <h3 className="mt-1 font-display text-2xl font-black text-slate-900 leading-snug">
                        {category.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm font-semibold leading-relaxed text-slate-600 line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/90 p-3 border border-slate-200/80 shadow-2xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between text-xs font-black text-slate-700">
                        <span>{doneStations}/{stations} trạm</span>
                        <span className="text-[#FD7D2E]">{progress}% hoàn thành</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full bg-mint-500 transition-all duration-500"
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
      <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 page-enter flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
        {/* ── Chuẩn hóa Tiêu đề 3 tầng ── */}
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4EC] text-[#FD7D2E] text-xs font-black uppercase tracking-wider border border-amber-200/60 shadow-2xs">
              Thư Viện Các Khóa Học AIKids
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Hành Trình Khám Phá 6 Đảo Sáng Tạo
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
            Cùng Mèo Mee khám phá 6 hòn đảo kỳ thú, rèn luyện tư duy prompt, mỹ thuật, truyện tranh và làm chủ AI an toàn.
          </p>

          {/* Tóm tắt tiến độ tổng thể */}
          {selectedCourses.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-black text-slate-800 shadow-soft border border-slate-200/90">
                <CheckCircle2 size={14} className="text-mint-600" />
                <span>{completedStations}/{totalStations} trạm đã hoàn thành</span>
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
                label="Tiến độ toàn bộ 6 đảo"
                tone="mint"
              />
            </div>
          )}

          {nextTicket}
        </header>

        {/* ── Bộ Sưu Tập 6 Đảo Học Tập Soft Clay Hiện Đại (Responsive Island Cards Grid) ── */}
        <section aria-labelledby="programs-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#FD7D2E]">
                Hải trình rèn luyện
              </p>
              <h2 id="programs-heading" className="mt-0.5 font-display text-2xl text-slate-900 sm:text-3xl font-black">
                Bộ Sưu Tập 6 Đảo Học Tập
              </h2>
            </div>
            <Link
              to="/world/spaces"
              className="text-xs sm:text-sm font-extrabold text-[#FD7D2E] hover:text-amber-800 transition-colors"
            >
              Xem không gian khác
            </Link>
          </div>

          <ConnectedIslandJourney
            courses={selectedCourses}
            recommendedCourseId={sourceRecommended?.id}
            onLockedClick={handleLockedCourseClick}
          />
        </section>

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
              <span>{completedStations}/{totalStations} trạm đã hoàn thành</span>
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
        <section aria-label={isCreatorTrack ? 'Bộ sưu tập 6 đảo học tập' : 'Các khóa học trong không gian'} className="space-y-4">
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
