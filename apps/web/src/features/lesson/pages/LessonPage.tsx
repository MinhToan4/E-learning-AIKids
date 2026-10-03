import React, { Suspense, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { NavWorldIcon } from '@/shared/components/icons/KidNavIcons'
import { CoursePaywallModal } from '@/features/lesson/components/CoursePaywallModal'
import { ParentGateModal } from '@/features/parent/components/ParentGateModal'
import { OfflineLessonView } from '@/features/lesson/components/OfflineLessonView'
import { LegacyPhaseLessonView } from '@/features/lesson/components/LegacyPhaseLessonView'
import {
  useLessonPageState,
  resolveInitialLessonProgress,
  buildRuleQuestDetail,
  buildIslandQuestDetail,
} from '@/features/lesson/hooks/useLessonPageState'
import {
  hydrateAikiRuleCard,
  createAikiRuleCardsFromData,
} from '@/features/lesson/lib/aiki-rule-cards'
import {
  isAikiRuleJourney as checkIsAikiRule,
  extractRuleNumber,
} from '@/features/lesson/lib/rule-journey-identifiers'
import { findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { ApiError } from '@/shared/lib/api'
import { findCourseByIdentifier, isUserTestingUnlocked } from '@/features/world/pages/WorldPage'
import { learningApi } from '@/shared/lib/learning-api'
import {
  cachedOfflineManifest,
  queueOfflineProgress,
} from '@/features/lesson/lib/offline-learning'

const LessonJourneyRenderer = React.lazy(() => import('@/features/lesson/components/LessonJourneyRenderer'))
const RuleLessonJourneyRenderer = React.lazy(() => import('@/features/lesson/components/RuleLessonJourneyRenderer'))

export { hydrateAikiRuleCard, createAikiRuleCardsFromData }

export function LessonPage() {
  const {
    courseId: routeCourseId,
    lessonId: routeLessonId,
    ruleId: routeRuleId,
    questId: routeQuestId,
  } = useParams<{
    courseId?: string
    lessonId?: string
    ruleId?: string
    questId?: string
  }>()

  const questId =
    routeLessonId ||
    (routeRuleId ? (routeRuleId.startsWith('rule-') ? routeRuleId : `rule-${routeRuleId}`) : '') ||
    routeQuestId ||
    ''

  const navigate = useNavigate()
  const location = useLocation()

  const state = useLessonPageState({
    questId,
    routeCourseId,
    location,
  })

  const {
    quest, setQuest, phase, setPhase, setLiveStars, setResumeStageIndex,
    checkResult, setCheckResult, error, setError, loading, setLoading,
    offlineManifest, setOfflineManifest, authoritativeLessonId, setAuthoritativeLessonId,
    isAikiRuleJourney, isIslandJourney, ruleId, effectiveCourseId,
    isPaywallOpen, setIsPaywallOpen, isParentGateOpen, setIsParentGateOpen,
    isParent, resetLocal, handleAikiFinish, persistJourneyStage, handleVideoCompleted,
  } = state

  useEffect(() => {
    let cancelled = false
    resetLocal()
    setLoading(true)

    void (async () => {
      const localRuleLesson = questId.startsWith('rule-') || questId === 'aiki-rules' || checkIsAikiRule(questId)
      const islandCurriculumPromise = questId.startsWith('bai-')
        ? import('@/features/lesson/data/island-curriculum-registry')
            .then((module) => module.findIslandCurriculum({ id: questId, slug: questId }))
        : Promise.resolve(undefined)

      if (!localRuleLesson && questId.startsWith('bai-')) {
        try {
          const pathway = await learningApi.getPathway()
          const course = routeCourseId ? findCourseByIdentifier(pathway.courses, routeCourseId) : undefined
          const isUnlocked = isUserTestingUnlocked()
          if (!isUnlocked && (!course || course.status === 'locked' || (!course.enrolled && course.status !== 'completed'))) {
            if (course?.status === 'locked') {
              setError(course.lockMessage || 'Hòn đảo này đang chờ mở khóa. Bé hãy hoàn thành Đảo Tiên Quyết (10 Quy Tắc Vàng) trước nhé!')
            } else {
              setIsPaywallOpen(true)
            }
            setLoading(false)
            return
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Chưa xác minh được quyền vào khóa học.')
            setLoading(false)
          }
          return
        }
      }

      if (questId.startsWith('rule-') || questId === 'aiki-rules' || checkIsAikiRule(questId)) {
        const rId = extractRuleNumber(questId)
        const rData = AIKI_RULES_DATA.find((r) => r.id === rId) || AIKI_RULES_DATA[0]
        let authLessonId = questId
        let progressInfo: ReturnType<typeof resolveInitialLessonProgress> | undefined

        try {
          const pathway = await learningApi.getPathway()
          if (cancelled) return
          const ruleCourse = (routeCourseId && findCourseByIdentifier(pathway.courses, routeCourseId))
            || findCourseByIdentifier(pathway.courses, 'muoi-quy-tac-xuong-sang-tao')
            || findCourseByIdentifier(pathway.courses, 'aiki-rules')
            || pathway.courses.find(checkIsAikiRule)
          const station = ruleCourse?.stations?.find((row) =>
            row.slug === questId || row.id === questId || row.order === rId || extractRuleNumber(row) === rId,
          )
          const fallbackStation = !station
            ? pathway.courses.flatMap((c) => c.stations || []).find((row) =>
                row.slug === questId || row.id === questId || (checkIsAikiRule(row) && extractRuleNumber(row) === rId),
              )
            : undefined
          authLessonId = station?.id?.trim() || fallbackStation?.id?.trim() || questId
          setAuthoritativeLessonId(authLessonId)

          // Kiểm tra điều kiện tuần tự: nếu rId > 1, Quy tắc rId - 1 phải được hoàn thành trước!
          const isDevUnlocked = isUserTestingUnlocked()
          if (!isDevUnlocked && rId > 1 && ruleCourse?.stations?.length) {
            const prevStation = ruleCourse.stations.find((s) => s.order === rId - 1 || extractRuleNumber(s) === rId - 1)
            const currentStation = ruleCourse.stations.find((s) => s.order === rId || extractRuleNumber(s) === rId)
            const isCurrentAlreadyDone = currentStation?.status === 'completed' || (currentStation?.stars ?? 0) >= 3
            const isPrevDone = prevStation?.status === 'completed' || (prevStation?.stars ?? 0) >= 3

            if (!isCurrentAlreadyDone && !isPrevDone) {
              setError(`Trạm này đang chờ mở khóa! Con hãy hoàn thành Quy tắc ${rId - 1} trên bản đồ trước nhé.`)
              setLoading(false)
              return
            }
          }

          const opened = await learningApi.openLesson(authLessonId)
          if (cancelled) return
          progressInfo = resolveInitialLessonProgress(opened.progress, authLessonId, questId)
          setLiveStars(progressInfo.stars)
          setResumeStageIndex(progressInfo.resumeStage)

          if (progressInfo.status === 'completed') {
            setPhase('done')
            setCheckResult({
              stars: progressInfo.stars,
              message: 'Con đã hoàn thành quy tắc này. Tiến trình đã được lưu trên hệ thống.',
              nextQuestId: rId < 10 ? `rule-${rId + 1}` : null,
            })
          } else if (['game', 'practice', 'check'].includes(opened.progress.phase)) {
            setPhase(opened.progress.phase)
          }
        } catch (progressError) {
          if (!cancelled) {
            setError(
              progressError instanceof Error
                ? `Chưa kết nối được tiến trình LMS: ${progressError.message}`
                : 'Chưa kết nối được tiến trình LMS. Bài học sẽ không được báo hoàn thành cho tới khi lưu thành công.',
            )
          }
        }

        setQuest(buildRuleQuestDetail(authLessonId, rId, rData, progressInfo?.status))
        setLoading(false)
        return
      }

      const islandCurriculum = await islandCurriculumPromise
      if (islandCurriculum) {
        let authLessonId = islandCurriculum.id || questId
        let progressInfo: ReturnType<typeof resolveInitialLessonProgress> | undefined
        try {
          const pathway = await learningApi.getPathway()
          if (cancelled) return
          const course = routeCourseId
            ? findCourseByIdentifier(pathway.courses, routeCourseId)
            : pathway.courses.find((row) => row.id === `dao-${islandCurriculum.islandNumber}`)
          const station = course?.stations?.find((row) =>
            row.slug === questId ||
            row.id === questId ||
            row.title.trim().toLocaleLowerCase('vi') === islandCurriculum.title.trim().toLocaleLowerCase('vi'),
          )
          authLessonId = station?.id?.trim() || authLessonId
          setAuthoritativeLessonId(authLessonId) // BỔ SUNG DÒNG NÀY ĐỂ ĐỒNG BỘ TIẾN TRÌNH ĐẢO

          const opened = await learningApi.openLesson(authLessonId)
          if (cancelled) return
          progressInfo = resolveInitialLessonProgress(opened.progress, authLessonId, questId)
          setLiveStars(progressInfo.stars)
          setResumeStageIndex(progressInfo.resumeStage)

          if (progressInfo.status === 'completed') {
            setPhase('done')
            setCheckResult({
              stars: progressInfo.stars,
              message: 'Con đã hoàn thành bài học này.',
              nextQuestId: null,
            })
          }
        } catch (progressError) {
          if (!cancelled) {
            setError(
              progressError instanceof Error
                ? `Chưa khôi phục được chặng đang học: ${progressError.message}`
                : 'Chưa khôi phục được chặng đang học từ hệ thống.',
            )
          }
        }
        setQuest(buildIslandQuestDetail(authLessonId, questId, islandCurriculum, routeCourseId, progressInfo?.status))
        setLoading(false)
        return
      }

      try {
        const opened = await learningApi.openLesson(questId)
        if (cancelled) return
        const progressInfo = resolveInitialLessonProgress(opened.progress, authoritativeLessonId, questId)
        setQuest({
          ...opened.quest,
          status: progressInfo.status,
        })
        setLiveStars(progressInfo.stars)
        setResumeStageIndex(progressInfo.resumeStage)

        if (progressInfo.status === 'completed') {
          setPhase('done')
          setCheckResult({
            stars: progressInfo.stars,
            message: progressInfo.stars > 0
              ? 'Con đã hoàn thành trạm này! Có thể thử lại để nâng số sao.'
              : 'Lần trước con chưa nhận được sao. Hãy thử lại phần Thử tài nhé!',
            nextQuestId: null,
          })
        } else if (['game', 'practice', 'check'].includes(opened.progress.phase)) {
          setPhase(opened.progress.phase)
        } else {
          setPhase('learn')
        }
      } catch (e) {
        if (!cancelled) {
          const isPaywall =
            !isUserTestingUnlocked() &&
            ((e instanceof ApiError && (e.status === 402 || e.code === 'COURSE_PURCHASE_REQUIRED' || e.code === 'LMS_ENTITLEMENT_REQUIRED' || e.code === 'CREDITS_EXHAUSTED')) ||
            (e instanceof Error && /entitlement|purchase|paid|402/i.test(e.message)))

          if (isPaywall) {
            setIsPaywallOpen(true)
          } else {
            const cached = await cachedOfflineManifest(questId)
            if (cached) {
              setOfflineManifest(cached)
              queueOfflineProgress(questId, { percent: 10, positionSeconds: 0, sectionId: 'offline-open' })
            } else {
              setError(e instanceof Error ? e.message : 'Không mở được trạm')
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [questId, resetLocal, routeCourseId, authoritativeLessonId, setAuthoritativeLessonId, setCheckResult, setError, setIsPaywallOpen, setLiveStars, setLoading, setOfflineManifest, setPhase, setQuest, setResumeStageIndex])

  // Chuẩn hóa URL sang friendly slug nếu questId trên URL là raw UUID
  useEffect(() => {
    if (!quest || !questId) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(questId)
    if (!isUuid) return

    if (isAikiRuleJourney && ruleId >= 1 && ruleId <= 10) {
      navigate(`/world/${effectiveCourseId}/lesson/rule-${ruleId}`, { replace: true })
      return
    }

    const curriculum = findIslandCurriculum({
      id: quest.id,
      title: quest.title,
      slug: (quest as any).slug,
    })
    if (curriculum?.slug) {
      navigate(`/world/${effectiveCourseId}/lesson/${curriculum.slug}`, { replace: true })
    }
  }, [quest, questId, isAikiRuleJourney, ruleId, effectiveCourseId, navigate])

  // Load nextQuestId when reviewing completed station
  useEffect(() => {
    if (!quest || phase !== 'done' || checkResult?.nextQuestId) return
    if (isAikiRuleJourney && ruleId < 10) {
      setCheckResult((prev) =>
        prev
          ? { ...prev, nextQuestId: `rule-${ruleId + 1}` }
          : {
            stars: 3,
            message: 'Tiếp tục nào!',
            nextQuestId: `rule-${ruleId + 1}`,
          },
      )
      return
    }
    void (async () => {
      try {
        let targetCourseId = quest.courseId
        if (targetCourseId && (targetCourseId.startsWith('dao-') || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetCourseId))) {
          const pathway = await learningApi.getPathway().catch(() => null)
          if (pathway?.courses) {
            const matchedCourse =
              pathway.courses.find((c) => c.id === targetCourseId || c.slug === targetCourseId || (c.slug && c.slug.startsWith(`${targetCourseId}-`))) ||
              findCourseByIdentifier(pathway.courses, targetCourseId)
            if (matchedCourse?.id) {
              targetCourseId = matchedCourse.id
            }
          }
        }
        if (!targetCourseId) return
        const p = await learningApi.getCourseProgress(targetCourseId).catch(() => null)
        const next = p?.quests?.find(
          (q) =>
            q.order === quest.order + 1 &&
            (q.status === 'available' || q.status === 'in_progress' || q.status === 'completed'),
        )
        if (next) {
          setCheckResult((prev) =>
            prev
              ? { ...prev, nextQuestId: next.id }
              : {
                stars: 1,
                message: 'Tiếp tục nào!',
                nextQuestId: next.id,
              },
          )
        }
      } catch {
        /* ignore */
      }
    })()
  }, [quest, phase, checkResult?.nextQuestId, isAikiRuleJourney, ruleId, setCheckResult])

  if (loading) {
    return (
      <p className="animate-pulse text-muted" aria-live="polite">
        Đang mở trạm…
      </p>
    )
  }

  if (isPaywallOpen && !quest) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center p-6 text-center">
        <CoursePaywallModal
          open={isPaywallOpen}
          courseTitle={routeCourseId || effectiveCourseId}
          onClose={() => {
            setIsPaywallOpen(false)
            navigate(effectiveCourseId ? `/world/${effectiveCourseId}` : '/world')
          }}
          onContinueFree={() => {
            setIsPaywallOpen(false)
            navigate('/world')
          }}
          onUpgrade={() => {
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

  if (error && !quest) {
    return (
      <div className="max-w-[768px] mx-auto w-full px-4 py-8 page-enter">
        <ErrorState
          title="Chưa mở được bài học"
          error={error}
          onRetry={() => window.location.reload()}
          homeUrl={effectiveCourseId ? `/world/${effectiveCourseId}` : '/world'}
          homeText="Về bản đồ"
          showHome
          showBack
        />
      </div>
    )
  }

  if (!quest && offlineManifest) {
    return <OfflineLessonView manifest={offlineManifest} />
  }

  if (!quest) {
    return (
      <div className="max-w-[768px] mx-auto w-full px-4 py-8 page-enter">
        <ErrorState
          title="Không tìm thấy trạm học"
          message="Trạm học này có thể chưa sẵn sàng hoặc đã được cập nhật. Bé hãy quay về Bản đồ để chọn trạm khác nhé!"
          homeUrl={effectiveCourseId ? `/world/${effectiveCourseId}` : '/world'}
          homeText="Về bản đồ"
          showHome
          showBack
          mascotPose="thinking"
        />
      </div>
    )
  }

  // ── TEMPLATE 1: 10 Quy Tắc Vàng AIKI (Module 0 - 3 Chặng Chuẩn: VIDEO ➔ QUIZ ➔ REWARD) ──
  if (isAikiRuleJourney && quest) {
    const isCompleted = phase === 'done' || state.liveStars >= 3 || checkResult !== null || quest.status === 'completed'
    return (
      <Suspense fallback={<p className="animate-pulse text-muted" aria-live="polite">Đang mở hành trình…</p>}>
        <RuleLessonJourneyRenderer
          key={quest.id}
          quest={quest}
          ruleId={ruleId}
          effectiveCourseId={effectiveCourseId}
          liveStars={state.liveStars}
          initialStageIndex={state.resumeStageIndex}
          isCompleted={isCompleted}
          onFinish={handleAikiFinish}
          onStageChange={persistJourneyStage}
          onVideoCompleted={handleVideoCompleted}
        />
      </Suspense>
    )
  }

  // ── TEMPLATE 2: Khóa Học Đảo AIKids (Module 1 -> Module 5 - 6 Chặng Bố Cục 2 Cột Chuẩn) ──
  if (isIslandJourney && quest) {
    const isCompleted = phase === 'done' || state.liveStars >= 3 || checkResult !== null || quest.status === 'completed'
    return (
      <Suspense fallback={<p className="animate-pulse text-muted" aria-live="polite">Đang mở hành trình…</p>}>
        <LessonJourneyRenderer
          key={quest.id}
          mode="island"
          quest={quest}
          ruleId={ruleId}
          effectiveCourseId={effectiveCourseId}
          liveStars={state.liveStars}
          initialStageIndex={state.resumeStageIndex}
          isCompleted={isCompleted}
          onFinish={handleAikiFinish}
          onStageChange={persistJourneyStage}
          onVideoCompleted={handleVideoCompleted}
        />
      </Suspense>
    )
  }

  // ── TEMPLATE 3: Fallback Legacy Horizontal Phases ──
  return (
    <LegacyPhaseLessonView
      {...state}
      quest={quest}
      navigate={navigate}
    />
  )
}
