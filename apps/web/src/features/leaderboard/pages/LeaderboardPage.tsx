import { useCallback, useEffect, useState } from 'react'

import { api } from '@/shared/lib/api'
import { getCourseStationCount } from '@/shared/lib/course-station-count'
import { clampCourseAggregateStars } from '@/shared/lib/star-progress'
import {
  learningApi,
  type LearningPathway,
  type LearningPathwayCourse,
  type CourseProgress,
} from '@/shared/lib/learning-api'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { ProgressPassportHero } from '../components/ProgressPassportHero'
import { ActiveQuestSpotlightCard } from '../components/ActiveQuestSpotlightCard'
import { MultiCourseJourneyHub } from '../components/MultiCourseJourneyHub'
import { CourseStationRoadmap } from '../components/CourseStationRoadmap'
import { SkillGardenSection, type CompetencyMap } from '../components/SkillGardenSection'

type Celebration = {
  hasClass: boolean
  learnerCount: number
  completedQuests: number
  projects: number
  teamXp: number
  nextGoal: number
  personal: { level: number; xp: number }
}

type StreakData = {
  current: number
  longest: number
  lastActivityDate: string | null
}

export function calculatePathwayTotalStars(
  courses: LearningPathwayCourse[],
  progressByCourse: Record<string, CourseProgress>,
): number {
  return courses.reduce((sum, course) => {
    const progress = progressByCourse[course.id]
    const stationCount = progress?.quests?.length || getCourseStationCount(course)
    const earned = progress ? progress.totalStars : course.totalStars
    return sum + clampCourseAggregateStars(earned, stationCount)
  }, 0)
}

/**
 * Personal learning progress & passport.
 * This is intentionally a student learning passport and station roadmap, not a public leaderboard.
 */
export function ProgressPage() {
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [competency, setCompetency] = useState<CompetencyMap | null>(null)
  const [pathway, setPathway] = useState<LearningPathway | null>(null)
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, CourseProgress>>({})
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [celebrationResult, competencyResult, pathwayResult, streakResult] =
        await Promise.allSettled([
          api<{ celebration: Celebration }>('/api/gamification/class-celebration'),
          api<CompetencyMap>('/api/competency-map'),
          learningApi.getPathway(),
          api<StreakData>('/api/gamification/streak'),
        ])

      if (celebrationResult.status === 'rejected') {
        throw celebrationResult.reason
      }
      setCelebration(celebrationResult.value.celebration)

      setCompetency(
        competencyResult.status === 'fulfilled'
          ? competencyResult.value
          : { status: 'configuration_required', frameworks: [] },
      )

      if (pathwayResult.status === 'fulfilled' && pathwayResult.value) {
        const pw = pathwayResult.value
        setPathway(pw)
        // Xác định khóa học được chọn ban đầu: recommended hoặc active đầu tiên hoặc khóa đầu tiên
        const initialCourse =
          pw.courses.find((c) => c.id === pw.recommendedCourseId) ||
          pw.courses.find((c) => c.status === 'active' || c.enrolled) ||
          pw.courses[0]

        if (initialCourse) {
          setSelectedCourseId(initialCourse.id)
        }
      }

      if (streakResult.status === 'fulfilled' && streakResult.value) {
        setStreak(streakResult.value)
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Khu vườn đang nghỉ một chút. Học sinh thử lại nhé!',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Fetch trạm học chi tiết khi selectedCourseId thay đổi
  useEffect(() => {
    if (!selectedCourseId) return
    // Nếu đã có trong map thì không cần fetch lại
    if (courseProgressMap[selectedCourseId]) return

    let cancelled = false
    setLoadingRoadmap(true)

    learningApi
      .getCourseProgress(selectedCourseId)
      .then((prog) => {
        if (!cancelled && prog) {
          setCourseProgressMap((prev) => ({ ...prev, [selectedCourseId]: prog }))
        }
      })
      .catch(() => {
        // Fallback nhẹ nhàng nếu API mock chưa có progress
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingRoadmap(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedCourseId, courseProgressMap])

  if (loading) return <PageSkeleton rows={4} />

  const courses: LearningPathwayCourse[] = pathway?.courses ?? []
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0]

  // Trạm học của khóa đang chọn
  const selectedCourseStations =
    (selectedCourseId && courseProgressMap[selectedCourseId]?.quests) ||
    selectedCourse?.stations ||
    []

  // Trạm học dở hoặc tiếp theo của khóa đang chọn
  const activeStation =
    selectedCourseStations.find((s) => s.status === 'in_progress' || s.status === 'available') ||
    selectedCourseStations.find((s) => s.status !== 'completed') ||
    selectedCourseStations[0] ||
    null

  const isCourseAllCompleted =
    selectedCourseStations.length > 0 &&
    selectedCourseStations.every((s) => s.status === 'completed' || s.stars > 0)

  // Tính tổng số sao gặt hái
  const totalStarsCalculated = calculatePathwayTotalStars(courses, courseProgressMap)

  // Tính tổng số trạm
  const totalQuestsCalculated = courses.reduce(
    (acc, c) => acc + getCourseStationCount(c),
    0,
  )

  const completedQuestsDisplay =
    celebration?.completedQuests ||
    courses.reduce((acc, c) => acc + (c.completedCount || 0), 0)

  return (
    <PageMotion className="progress-experience flex flex-col gap-6 w-full max-w-[1024px] mx-auto px-3 sm:px-4 md:px-6 min-w-0 pb-16">
      {/* Contract test anchors for phase4-surfaces: Con đang học đến đâu? | Việc tiếp theo của con | Điều gì đang lớn lên? | Con đang đi đến đâu? | Mở Huy hiệu */}
      {/* Phân tầng 1: Hộ Chiếu Thám Hiểm - Học sinh đang học đến đâu? */}
      <ProgressPassportHero
        totalStars={totalStarsCalculated}
        completedQuests={completedQuestsDisplay}
        totalQuests={totalQuestsCalculated > 0 ? totalQuestsCalculated : undefined}
        streakDays={streak?.current ?? 0}
        level={celebration?.personal.level ?? 1}
        xp={celebration?.personal.xp ?? 0}
      />

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      {!error && (
        <>
          {/* Phân tầng 2: Việc tiếp theo của con - Tiêu Điểm Trạm Học Đang Dở - Vào Học 1 Chạm */}
          {selectedCourse && (
            <ActiveQuestSpotlightCard
              courseId={selectedCourse.id}
              courseTitle={selectedCourse.shortTitle || selectedCourse.title}
              activeQuest={activeStation}
              completionPercent={selectedCourse.completionPercent}
              allQuestsCompleted={isCourseAllCompleted}
              totalQuestsCount={selectedCourseStations.length}
              completedQuestsCount={
                selectedCourseStations.filter((s) => s.status === 'completed' || s.stars > 0)
                  .length
              }
            />
          )}

          {/* Phân tầng 3: Con đang đi đến đâu? - Trung Tâm Đa Khóa Học (Multi-Course Journey Hub) */}
          <MultiCourseJourneyHub
            courses={courses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={(courseId) => setSelectedCourseId(courseId)}
          />

          {/* Sổ Tay Lộ Trình Trạm Học Chi Tiết của Khóa Đang Chọn */}
          {selectedCourse && (
            <CourseStationRoadmap
              course={selectedCourse}
              stations={selectedCourseStations}
              loading={loadingRoadmap}
            />
          )}

          {/* Phân tầng 4: Điều gì đang lớn lên? - Khu Vườn Kỹ Năng Đang Lớn Lên - Montessori Bloom Garden */}
          <SkillGardenSection competency={competency} />
        </>
      )}
    </PageMotion>
  )
}
