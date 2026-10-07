import React from 'react'
import { StudentStageBlocksView } from '@/features/lesson/components/StudentStageBlocksView'
import {
  VideoStageBlock,
  QuizStageBlock,
  RewardStageBlock,
  GoalStageBlock,
  ConfirmStageBlock,
  PracticeStageBlock,
} from '@/features/lesson/components/stages'
import { adaptSixStageJourneyToStages } from '@/features/lesson/lib/stage-adapter'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import type {
  GoalStageConfig,
  ConfirmStageConfig,
  VideoStageConfig,
  QuizStageConfig,
  PracticeStageConfig,
  RewardStageConfig,
  JourneyStageDefinition as StageSchemaDefinition,
} from '@/features/lesson/types/stage-schema'
import {
  type LearnCardDraft,
  getStageBlocks,
} from '../../../lib/authoring'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import type { PreviewViewportMode } from './types'

export interface IslandStagePreviewContentProps {
  card?: LearnCardDraft
  stageCard?: LearnCardDraft
  stageIndex: number
  isRule3Steps: boolean
  sixStageJourney?: LessonSixStageJourney
  viewport: PreviewViewportMode
  previewVideoSeekSec: number
  onSeekVideo: (sec: number) => void
  previewQuizQuestionIdx: number
  onSetActiveQuizQuestion: (index: number | ((prev: number) => number)) => void
  previewQuizAnswers: Record<number, number>
  onSelectQuizAnswer: (qIdx: number, optIdx: number) => void
  previewCheckedQuestions: Record<number, boolean>
  onCheckAnswer: (qIdx: number) => void
  onRetryQuestion: (qIdx: number) => void
  previewConfirmOption: number | null
  onSelectConfirmOption: (idx: number) => void
  previewPracticePartIndex: number
  onPracticePartChange: (idx: number) => void
  onImageClick: (img: { url: string; title?: string }) => void
}

export function IslandStagePreviewContent({
  card,
  stageCard,
  stageIndex,
  isRule3Steps,
  sixStageJourney,
  viewport,
  previewVideoSeekSec,
  onSeekVideo,
  previewQuizQuestionIdx,
  onSetActiveQuizQuestion,
  previewQuizAnswers,
  onSelectQuizAnswer,
  previewCheckedQuestions,
  onCheckAnswer,
  onRetryQuestion,
  previewConfirmOption,
  onSelectConfirmOption,
  previewPracticePartIndex,
  onPracticePartChange,
  onImageClick,
}: IslandStagePreviewContentProps) {
  const isMobile = viewport === 'mobile'

  const effectiveJourney =
    sixStageJourney ||
    resolveIslandSixStageJourney(
      (card as any)?.draft || (card as any) || { id: card?.id || 'bai-1-1' },
    )
  const stages = adaptSixStageJourneyToStages(effectiveJourney, {
    lessonId: card?.id,
    lessonTitle: card?.title,
  })

  return (
    <div className="space-y-4">
      {isRule3Steps ? (
        <>
          {stageIndex === 0 && stages[2] && (
            <VideoStageBlock
              stage={stages[2] as StageSchemaDefinition<VideoStageConfig>}
              isVideoCompleted={true}
              videoSeekSec={previewVideoSeekSec}
              onSeekVideo={onSeekVideo}
            />
          )}

          {stageIndex === 1 && stages[3] && (
            <QuizStageBlock
              stage={stages[3] as StageSchemaDefinition<QuizStageConfig>}
              activeQuizQuestionIdx={previewQuizQuestionIdx}
              quizAnswers={previewQuizAnswers}
              checkedQuestions={previewCheckedQuestions}
              onSelectQuizAnswer={onSelectQuizAnswer}
              onCheckAnswer={onCheckAnswer}
              onRetryQuestion={onRetryQuestion}
              onSetActiveQuizQuestion={onSetActiveQuizQuestion}
              onImageClick={onImageClick}
            />
          )}

          {stageIndex === 2 && stages[5] && (
            <RewardStageBlock
              stage={stages[5] as StageSchemaDefinition<RewardStageConfig>}
              effectiveStars={effectiveJourney.stage6_completion?.rewardBadge?.stars ?? 3}
              effectiveRewardXp={effectiveJourney.stage6_completion?.rewardBadge?.xp ?? 50}
              onImageClick={onImageClick}
            />
          )}
        </>
      ) : (
        <>
          {stageIndex === 0 && stages[0] && (
            <GoalStageBlock
              stage={stages[0] as StageSchemaDefinition<GoalStageConfig>}
              onImageClick={onImageClick}
            />
          )}

          {stageIndex === 1 && stages[1] && (
            <ConfirmStageBlock
              stage={stages[1] as StageSchemaDefinition<ConfirmStageConfig>}
              selectedOption={previewConfirmOption}
              isCorrect={
                previewConfirmOption ===
                (stages[1]?.config as ConfirmStageConfig)?.correctIndex
              }
              onSelectOption={onSelectConfirmOption}
              onImageClick={onImageClick}
            />
          )}

          {stageIndex === 2 && stages[2] && (
            <VideoStageBlock
              stage={stages[2] as StageSchemaDefinition<VideoStageConfig>}
              isVideoCompleted={true}
              videoSeekSec={previewVideoSeekSec}
              onSeekVideo={onSeekVideo}
            />
          )}

          {stageIndex === 3 && stages[3] && (
            <QuizStageBlock
              stage={stages[3] as StageSchemaDefinition<QuizStageConfig>}
              activeQuizQuestionIdx={previewQuizQuestionIdx}
              quizAnswers={previewQuizAnswers}
              checkedQuestions={previewCheckedQuestions}
              onSelectQuizAnswer={onSelectQuizAnswer}
              onCheckAnswer={onCheckAnswer}
              onRetryQuestion={onRetryQuestion}
              onSetActiveQuizQuestion={onSetActiveQuizQuestion}
              onImageClick={onImageClick}
            />
          )}

          {stageIndex === 4 && stages[4] && (
            <PracticeStageBlock
              stage={stages[4] as StageSchemaDefinition<PracticeStageConfig>}
              lessonId={card?.id}
              lessonTitle={card?.title}
              activePracticePartIndex={previewPracticePartIndex}
              onPartChange={onPracticePartChange}
            />
          )}

          {stageIndex === 5 && stages[5] && (
            <RewardStageBlock
              stage={stages[5] as StageSchemaDefinition<RewardStageConfig>}
              effectiveStars={effectiveJourney.stage6_completion?.rewardBadge?.stars ?? 3}
              effectiveRewardXp={effectiveJourney.stage6_completion?.rewardBadge?.xp ?? 50}
              onImageClick={onImageClick}
            />
          )}
        </>
      )}

      {(stageCard || card) &&
        getStageBlocks(stageCard || card!, stageIndex).some(
          (block) =>
            !block.id.startsWith('course-goal-') &&
            !block.id.startsWith('course-confirm-') &&
            (!isRule3Steps || stageIndex !== 0 || block.type !== 'video'),
        ) && (
          <div className="mt-4 border-t border-sky-100 pt-4">
            <StudentStageBlocksView
              card={{
                ...(stageCard || card!),
                contentBlocks: getStageBlocks(
                  stageCard || card!,
                  stageIndex,
                ).filter((block) => {
                  if (
                    block.id.startsWith('course-goal-') ||
                    block.id.startsWith('course-confirm-')
                  )
                    return false
                  if (isRule3Steps && stageIndex === 0 && block.type === 'video')
                    return false
                  return true
                }),
              }}
              stageIndex={stageIndex}
              isMobile={isMobile}
            />
          </div>
        )}
    </div>
  )
}
