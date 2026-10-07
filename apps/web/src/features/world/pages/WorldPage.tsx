import React, { Suspense, useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { KidLockImageIcon } from '@/shared/components/icons/KidImageIcons'
import { CourseBookIcon } from '@/shared/components/icons/KidNavIcons'
import { type QuestProgress } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { prefetchRoute, prefetchRouteImmediately } from '@/app/route-prefetch'
import {
  calculateCourseStars,
  clampStationStars,
  dedupeStationProgress,
} from '@/shared/lib/star-progress'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { isAikiRuleJourney } from '@/features/lesson/lib/rule-journey-identifiers'
import { useAuth } from '@/shared/store/auth'

import {
  applyGatekeeperRules,
  applySequentialQuestRules,
  isCourseRuleCompleted,
  isPathwayCourseVisible,
  sortAikiCourses,
  getAikiCourseSortOrder,
  isAikiRuleCourse,
  WORLD_REGIONS,
  AIKI_ISLAND_BADGES,
  getRegionForCourse,
  getIslandBadge,
} from '../lib/world-gatekeeper'

import {
  getStationSlug,
  FORCE_UNLOCK_ALL_ISLANDS,
  isUserTestingUnlocked,
  createFallbackPathway,
  AIKID_CANONICAL_SLUGS,
  AIKID_CANONICAL_TITLE_HINTS,
  ISLAND_ALIAS_MAP,
  type PathwayCourse,
  type Pathway,
  mapCourseCatalogStations,
  mapPublishedCurriculumStations,
  selectCanonicalAikidCourses,
  getCourseStationCount,
  type NextLearningTarget,
  isCourseComplete,
  selectNextLearningTarget,
  findCourseByIdentifier,
  clearWorldPageCache,
  mergeQuestsWithLocalProgress,
  enrichCoursesWithLocalProgress,
  formatCourseTitle,
} from '../lib/world-pathway-mapper'

import {
  StarDisplay,
  STATION_X_POSITIONS,
  getStationPoint,
  buildStationPath,
  QuestNode,
} from '../components/WorldQuestNode'

import {
  AIKID_SIX_ISLANDS_CONFIG,
  ModernIslandCard,
  ConnectedIslandJourney,
  LearningWorldScene,
  PathwayOverview,
} from '../components/PathwayOverview'

export * from '../lib/world-gatekeeper'
export * from '../lib/world-pathway-mapper'
export * from '../components/WorldQuestNode'
export * from '../components/PathwayOverview'

const IslandStationsExplorerView = React.lazy(() =>
  import('../components/IslandStationsExplorerView').then((m) => ({
    default: m.IslandStationsExplorerView,
  }))
)

export interface WorldPageProps {
  showSpacesSelector?: boolean
}

export function WorldPage({ showSpacesSelector = false }: WorldPageProps = {}) {
  const { user } = useAuth()
  const activeChildId = user?.id
  const { courseId, programId, trackId } = useParams<{
    courseId?: string
    programId?: string
    trackId?: string
  }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const islandQuery = searchParams.get('island')
  const [selectedIsland, setSelectedIsland] = useState<string | null>(() => islandQuery)
  const [activeCourseId, setActiveCourseId] = useState<string>(courseId || islandQuery || '')

  const isOfficialProgramView = !courseId && (!programId || programId === 'aikid_official')

  const [refreshTick, setRefreshTick] = useState(0)
  const [quests, setQuests] = useState<QuestProgress[]>([])
  const [meta, setMeta] = useState({ totalStars: 0, completedCount: 0 })
  const [courseTitle, setCourseTitle] = useState('Hành trình sáng tạo')
  const [error, setError] = useState<string | null>(null)
  const [pathway, setPathway] = useState<Pathway | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrollmentRequired, setEnrollmentRequired] = useState(false)
  const [regionIndex, setRegionIndex] = useState(0)

  useEffect(() => {
    if (islandQuery && islandQuery !== selectedIsland) {
      setSelectedIsland(islandQuery)
      setActiveCourseId(islandQuery)
    }
  }, [islandQuery, selectedIsland])

  // Lắng nghe sự kiện hoàn thành bài học để xóa cache và tự động re-render bản đồ
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleLessonCompleted = () => {
      clearWorldPageCache()
      setRefreshTick((prev) => prev + 1)
    }
    window.addEventListener('aikids:lesson-completed', handleLessonCompleted)
    window.addEventListener('aikids:progression-updated', handleLessonCompleted)
    return () => {
      window.removeEventListener('aikids:lesson-completed', handleLessonCompleted)
      window.removeEventListener('aikids:progression-updated', handleLessonCompleted)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      if (courseId || isOfficialProgramView) {
        setQuests([])
        setMeta({ totalStars: 0, completedCount: 0 })
      }
      setError(null)
      setEnrollmentRequired(false)
      try {
        const fetchPathwaySafely = async (): Promise<{
          student: { nickname: string | null; ageBand: string }
          policy: { label: string } | null
          recommendedCourseId: string | null
          courses: unknown[]
        }> => {
          try {
            return await learningApi.getPathway()
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            if (
              msg.includes('JWT') ||
              msg.includes('Unauthorized') ||
              msg.includes('401') ||
              msg.includes('404') ||
              (typeof window !== 'undefined' &&
                (window.location.search.includes('preview') ||
                  window.location.search.includes('guest') ||
                  (typeof localStorage !== 'undefined' &&
                    localStorage.getItem('aikids.dev_preview') === 'true')))
            ) {
              return createFallbackPathway()
            }
            throw err
          }
        }

        // Trường hợp không phải Official view và không có courseId (ví dụ: /world/program/workspace hoặc spaces selector)
        if (!courseId && !isOfficialProgramView) {
          const journey = await fetchPathwaySafely()
          const rawCourses = journey.courses as PathwayCourse[]
          const enrichedCourses = enrichCoursesWithLocalProgress(rawCourses, undefined, undefined, activeChildId)

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

        // Có courseId hoặc đang ở giao diện Official Bản Đồ (/world/program/aikid_official)
        const journey = await fetchPathwaySafely()
        const rawCourses = journey.courses as PathwayCourse[]
        const enrichedCourses = enrichCoursesWithLocalProgress(rawCourses, undefined, undefined, activeChildId)
        const processedCourses = applyGatekeeperRules(enrichedCourses)
        const finalPathway = { ...journey, courses: processedCourses }

        // Xác định Đảo đang chọn:
        // 1. Từ courseId (nếu route là /world/:courseId)
        // 2. Từ query param ?island=... hoặc state selectedIsland
        // 3. Fallback: Lấy đảo kế tiếp của học sinh (hoặc đảo 1 'muoi-quy-tac-xuong-sang-tao' / 'dao-1-nha-tham-hiem-ai')
        const targetIslandParam = islandQuery || selectedIsland
        const nextTarget = selectNextLearningTarget(processedCourses, journey.recommendedCourseId)
        const defaultIsland =
          nextTarget?.course.slug || nextTarget?.course.id || 'muoi-quy-tac-xuong-sang-tao'
        const activeIslandIdentifier = courseId || targetIslandParam || defaultIsland

        const pathRow =
          findCourseByIdentifier(processedCourses, activeIslandIdentifier) ||
          processedCourses.find((row) => row.id === activeIslandIdentifier) ||
          processedCourses[0] ||
          ({
            id: activeIslandIdentifier,
            slug: activeIslandIdentifier,
            title: 'Hành trình sáng tạo',
            shortTitle: 'Đảo sáng tạo',
            status: 'locked',
            reasonCode: 'official',
            completionPercent: 0,
            missingPrerequisites: [],
            coverImage: null,
            enrolled: false,
            questCount: 4,
            completedCount: 0,
            totalStars: 0,
            stations: [],
          } as PathwayCourse)
        const actualCourseId = pathRow?.id || activeIslandIdentifier
        setActiveCourseId(pathRow?.slug || pathRow?.id || activeIslandIdentifier)

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
          : await learningApi.getCourseProgress(actualCourseId).catch(() => null)
        const needsCourseCatalog = !pathRow?.stations?.length && !progressData?.quests?.length
        const courseCatalog = needsCourseCatalog
          ? await learningApi.getCourse(actualCourseId).catch(() => null)
          : null

        const courseTitle = formatCourseTitle(
          pathRow?.title || pathRow?.shortTitle || 'Hành trình sáng tạo',
        )
        const targetOrder = getAikiCourseSortOrder(
          pathRow || { id: actualCourseId, title: courseTitle },
        )
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

        // Chỉ chặn lỗi toàn màn hình khi truy cập trực tiếp route /world/:courseId mà bị khóa.
        // Trên giao diện chính thức aikid_official, vẫn hiển thị Đảo ở trạng thái khóa để học sinh có thể vuốt/chuyển đảo.
        if (
          courseId &&
          !isOfficialProgramView &&
          (!pathRow || (!forceUnlock && pathRow.status === 'locked'))
        ) {
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
        rawQuests = dedupeStationProgress(
          rawQuests.filter(
            (station) => typeof station.id === 'string' && station.id.trim().length > 0,
          ),
        )

        if (rawQuests.length === 0 && !isRuleCourse) {
          rawQuests = mapPublishedCurriculumStations(pathRow, activeIslandIdentifier)
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

        const isCourseLocked = !forceUnlock && pathRow?.status === 'locked'

        if (rawQuests.length > 0) {
          const mergedQuests = mergeQuestsWithLocalProgress(rawQuests, isRuleCourse, undefined, undefined, activeChildId)
          const sequentialQuests = isCourseLocked
            ? mergedQuests.map((q) => ({ ...q, status: 'locked' as const }))
            : applySequentialQuestRules(mergedQuests, forceUnlock)
          const calculatedCompletedCount = sequentialQuests.filter(
            (q) => q.status === 'completed',
          ).length
          const detailedStars = sequentialQuests.reduce((sum, q) => sum + clampStationStars(q.stars), 0)
          const starSummary = calculateCourseStars(sequentialQuests, detailedStars > 0 ? detailedStars : progressData?.totalStars)
          const nextMeta = {
            totalStars: starSummary.earned,
            completedCount: Math.min(
              sequentialQuests.length,
              Math.max(progressData?.completedCount ?? 0, calculatedCompletedCount),
            ),
          }
          setQuests(sequentialQuests)
          setMeta(nextMeta)
        } else if (!forceUnlock && pathRow?.status === 'available') {
          setEnrollmentRequired(true)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được bản đồ')
      } finally {
        setLoading(false)
      }
    })()
  }, [courseId, programId, isOfficialProgramView, islandQuery, selectedIsland, refreshTick, activeChildId])

  const effectiveCourseId =
    courseId || activeCourseId || selectedIsland || islandQuery || 'muoi-quy-tac-xuong-sang-tao'
  const currentRegion = WORLD_REGIONS[regionIndex % WORLD_REGIONS.length]
  const isCurrentCourseRule = Boolean(
    effectiveCourseId &&
      (isAikiRuleJourney(effectiveCourseId) ||
        isAikiRuleJourney(ISLAND_ALIAS_MAP[effectiveCourseId]) ||
        pathway?.courses.some(
          (c) =>
            (c.id === effectiveCourseId ||
              c.slug === effectiveCourseId ||
              c.slug === ISLAND_ALIAS_MAP[effectiveCourseId] ||
              c.id === ISLAND_ALIAS_MAP[effectiveCourseId]) &&
            isAikiRuleCourse(c),
        )),
  )

  // Nếu không có courseId và không phải giao diện Official: Render PathwayOverview
  if (!courseId && !isOfficialProgramView) {
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
        <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
          <ErrorState
            title="Chưa tải được lộ trình học"
            error={error ?? 'Chưa tải được lộ trình học.'}
            onRetry={() => setRefreshTick((t) => t + 1)}
            showHome
            showBack
          />
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

  if (courseId && !isOfficialProgramView && error) {
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
            {error ||
              'Bé hãy hoàn thành Đảo Quy Tắc Vàng AIKI trước để nhận Huy hiệu Hiệp Sĩ và mở khóa toàn bộ hành trình sáng tạo nhé!'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              onClick={() => navigate('/world/program/aikid_official')}
              className="w-full sm:w-auto rounded-2xl font-black"
            >
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

  if (error || !pathway) {
    return (
      <div className="max-w-[1024px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        <ErrorState
          title="Chưa tải được bản đồ"
          error={error ?? 'Chưa tải được lộ trình học.'}
          onRetry={() => setRefreshTick((t) => t + 1)}
          showHome
          showBack
        />
      </div>
    )
  }

  return (
    <div className="max-w-[1024px] mx-auto w-full px-1 sm:px-4 md:px-6 flex flex-col gap-4 sm:gap-6 page-enter py-2 sm:py-6">
      {enrollmentRequired && !loading ? (
        <section className="ui-card mx-auto w-full max-w-xl p-6 text-center rounded-3xl shadow-clay">
          <CourseBookIcon size={42} className="mx-auto text-brand-500" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl font-black">Hành trình chưa bắt đầu</h2>
          <p className="mt-2 text-sm text-muted">
            Xem giới thiệu và bắt đầu khóa học để mở trạm đầu tiên.
          </p>
          <Link
            className="mt-4 inline-block"
            to={`/course/${effectiveCourseId}`}
            onPointerEnter={() => prefetchRoute(`/course/${effectiveCourseId}`)}
            onPointerDown={() => prefetchRouteImmediately(`/course/${effectiveCourseId}`)}
            onFocus={() => prefetchRoute(`/course/${effectiveCourseId}`)}
          >
            <Button className="rounded-2xl font-black">Bắt đầu hành trình</Button>
          </Link>
        </section>
      ) : (
        <Suspense fallback={<div className="ui-skeleton h-96 rounded-3xl" />}>
          <IslandStationsExplorerView
            courseId={effectiveCourseId}
            courseTitle={courseTitle}
            quests={quests}
            courses={sortAikiCourses(
              selectCanonicalAikidCourses(pathway?.courses.filter(isPathwayCourseVisible) ?? []),
            ).map((course) => ({
              ...course,
              questCount: getCourseStationCount(course),
            }))}
            meta={meta}
            currentRegion={currentRegion}
            isCurrentCourseRule={isCurrentCourseRule}
            getStationSlugFn={getStationSlug}
            onBackToMap={() => {
              navigate('/home')
            }}
            onSelectIsland={(islandSlug) => {
              if (isOfficialProgramView || programId === 'aikid_official') {
                setSearchParams({ island: islandSlug }, { replace: true })
                setSelectedIsland(islandSlug)
                setActiveCourseId(islandSlug)
              } else {
                navigate(`/world/${islandSlug}`)
              }
            }}
          />
        </Suspense>
      )}
    </div>
  )
}
