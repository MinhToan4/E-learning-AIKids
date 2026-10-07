import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { QuestDetail, LessonSixStageJourney, User } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { adaptRuleToStages } from '@/features/lesson/lib/rule-stage-adapter'
import { SixStageJourneyView } from './SixStageJourneyView'
import type { LessonCompletionSummary } from './SixStageJourneyView'
import { CoursePaywallModal } from '@/features/lesson/components/CoursePaywallModal'
import { ParentGateModal } from '@/features/parent/components/ParentGateModal'

type Props = {
  quest: QuestDetail
  ruleId: number
  effectiveCourseId: string
  liveStars: number
  initialStageIndex?: number
  isCompleted?: boolean
  onFinish: (customSummary?: LessonCompletionSummary) => boolean | void | Promise<boolean | void>
  onStageChange?: (stageIndex: number, stageCount: number) => void
  onVideoCompleted?: () => void
}

export default function RuleLessonJourneyRenderer({
  quest,
  ruleId,
  effectiveCourseId,
  liveStars,
  initialStageIndex = 0,
  isCompleted = false,
  onFinish,
  onStageChange,
  onVideoCompleted,
}: Props) {
  const navigate = useNavigate()
  const user = useAuth((s) => s.user) as (User & { subscription?: { status?: string }; planCode?: string; plan?: string }) | null
  const isParent = user?.role === 'parent'
  const hasActivePlan = Boolean(
    user?.subscription?.status === 'active' ||
    user?.planCode === 'aikids_official_129k' ||
    user?.planCode === 'aikids_pro' ||
    (user as any)?.plan === 'aikids_official_129k' ||
    (user as any)?.plan === 'aikids_pro',
  )

  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  const [isParentGateOpen, setIsParentGateOpen] = useState(false)

  const rule = AIKI_RULES_DATA.find((r) => r.id === ruleId) || AIKI_RULES_DATA[0]
  const stages = useMemo(() => adaptRuleToStages(rule), [rule])

  const syntheticJourney: LessonSixStageJourney = useMemo(() => {
    const isRule10 = rule.id === 10
    const nextLessonSlug = rule.id < 10 ? `rule-${rule.id + 1}` : 'bai-1-1'
    return {
      stage1_goal: {
        id: `rule-${rule.id}-stage1-goal`,
        title: rule.title || `Quy Tắc ${rule.id}: ${rule.shortTitle}`,
        goalText: rule.goal || rule.shortTitle,
        imageUrl: rule.posterImage || rule.slides?.[0]?.image || '',
        speech: rule.audioVoiceText || rule.akiTip || 'Cùng Mèo AIKI khám phá quy tắc vàng nhé!',
        keyPoints: [
          rule.shortTitle,
          rule.goal,
          rule.akiTip || 'Tả càng rõ - Vẽ càng đúng! Ghi nhớ quy tắc vàng nhé!',
        ],
      },
      stage2_confirmGoal: {
        id: `rule-${rule.id}-stage2-confirm`,
        question: rule.questions?.[0]?.prompt || `Bé hiểu thế nào về quy tắc ${rule.shortTitle}?`,
        options: (rule.questions?.[0]?.options || ['Hiểu rõ', 'Chưa hiểu']).map((opt, idx) => ({
          id: `opt-${idx}`,
          text: opt,
        })),
        correctIndex: rule.questions?.[0]?.correctIndex ?? 0,
        explanation: rule.questions?.[0]?.successFeedback || rule.questions?.[0]?.hint || 'Rất chính xác!',
        speech: 'Bé hãy chọn phương án chính xác nhất nhé!',
      },
      stage3_video: {
        id: `rule-${rule.id}-stage3-video`,
        title: rule.shortTitle || rule.title,
        videoUrl: rule.videoUrl || '',
        durationSec: rule.durationSec || 60,
        posterUrl: rule.posterImage,
        timestamps: (rule.slides || []).map((slide, index) => ({
          label: slide.stage,
          startSec: index * 12,
          endSec: (index + 1) * 12,
          speech: slide.dialogue,
        })),
      },
      stage4_quiz: {
        id: `rule-${rule.id}-stage4-quiz`,
        title: `Thử tài phản xạ: ${rule.shortTitle}`,
        questions: (rule.questions || []).map((q, idx) => ({
          id: q.id || `rule-${rule.id}-q-${idx + 1}`,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.successFeedback || q.hint,
          hint: q.hint,
          retryFeedback: q.retryFeedback,
          visualUrl: q.visualUrl || rule.posterImage,
        })),
        passScore: 1,
      },
      stage5_practice: {
        id: `rule-${rule.id}-stage5-practice`,
        title: `Luyện tập Quy Tắc: ${rule.shortTitle}`,
        subjectName: rule.shortTitle,
        badge: rule.code,
        illustrationType: 'rule-practice',
        lockedFeatures: [rule.shortTitle],
        akiMotto: rule.akiTip || 'Ghi nhớ quy tắc vàng để sáng tạo tự tin!',
        maxAttempts: 3,
        workflowSteps: [
          {
            step: 1,
            title: 'Ghi nhớ quy tắc',
            akiSpeech: rule.akiTip || 'Hãy nhớ kỹ quy tắc này nhé!',
            quickPrompt: rule.shortTitle,
            instruction: 'Xem lại bí kíp của AIKI',
          },
        ],
      },
      stage6_completion: {
        id: `rule-${rule.id}-stage6-completion`,
        title: isRule10 ? 'Chúc mừng tân Hiệp Sĩ AIKI!' : `Con đã hoàn thành Quy tắc ${rule.id}!`,
        congratsMessage: isRule10
          ? 'Xuất sắc! Con đã hoàn thành trọn vẹn 10 Quy Tắc Vàng của Xưởng Sáng Tạo AI. Hãy sẵn sàng mở khóa Hải Trình Đảo 1 nhé!'
          : `Tuyệt vời! Con đã làm chủ "${rule.shortTitle}" và sẵn sàng sáng tạo cùng AIKI!`,
        rewardBadge: {
          name: isRule10 ? 'Huy hiệu Hiệp Sĩ AIKI' : `Huy hiệu ${rule.code}: ${rule.shortTitle}`,
          iconUrl: rule.posterImage,
          stars: 3,
          xp: 50,
        },
        nextLessonSlug,
      },
    }
  }, [rule])

  return (
    <div className="h-auto min-h-full flex-none bg-slate-50/60 p-2 sm:p-2.5 lg:p-3 page-enter flex flex-col overflow-visible md:h-full md:max-h-full md:min-h-0 md:flex-1 md:overflow-hidden w-full max-w-[1024px] mx-auto">
      <div className="sr-only" aria-hidden="true">
        <span>Chặng 1/3</span>
        <span>Chặng 1/4</span>
        <span>{quest.title || `Quy tắc ${ruleId}: Nghĩ ý tưởng trước khi hỏi AI`}</span>
      </div>

      <SixStageJourneyView
        key={quest.id}
        journey={syntheticJourney}
        stages={stages}
        lessonId={quest.id}
        lessonTitle={quest.title}
        studentStars={liveStars || 42}
        rewardXp={50}
        initialStageIndex={initialStageIndex}
        isCompleted={isCompleted || liveStars >= 3}
        previousStars={liveStars}
        onBackToMap={() => navigate('/world/program/aikid_official?island=muoi-quy-tac-xuong-sang-tao')}
        onNavigateNextLesson={(nextSlug) => {
          if (nextSlug === 'bai-1-1') {
            if (hasActivePlan) {
              navigate('/world/dao-1/lesson/bai-1-1')
            } else {
              setIsPaywallOpen(true)
            }
          } else {
            navigate(`/world/${effectiveCourseId}/lesson/${nextSlug}`)
          }
        }}
        onOpenCourse={() => navigate('/world/program/aikid_official')}
        onFinishLesson={onFinish}
        onStageChange={(stageIndex) => onStageChange?.(stageIndex, stages.length)}
        onVideoCompleted={onVideoCompleted}
      />

      <CoursePaywallModal
        open={isPaywallOpen}
        courseTitle="Hải Trình Đảo 1 — Nhà Thám Hiểm AI"
        onClose={() => setIsPaywallOpen(false)}
        onContinueFree={() => {
          setIsPaywallOpen(false)
          navigate(`/world/${effectiveCourseId}`)
        }}
        onUpgrade={() => {
          setIsPaywallOpen(false)
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
