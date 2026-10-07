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
          {(() => {
            const currentStageDef = stages[stageIndex]
            if (!currentStageDef) return null
            const stageType = currentStageDef.type || (stageIndex === 0 ? 'GOAL' : stageIndex === 1 ? 'CONFIRM' : stageIndex === 2 ? 'VIDEO' : stageIndex === 3 ? 'QUIZ' : stageIndex === 4 ? 'PRACTICE' : 'REWARD')

            if (stageType === 'GOAL') {
              return (
                <GoalStageBlock
                  stage={currentStageDef as StageSchemaDefinition<GoalStageConfig>}
                  onImageClick={onImageClick}
                />
              )
            }
            if (stageType === 'CONFIRM') {
              return (
                <ConfirmStageBlock
                  stage={currentStageDef as StageSchemaDefinition<ConfirmStageConfig>}
                  selectedOption={previewConfirmOption}
                  isCorrect={
                    previewConfirmOption ===
                    (currentStageDef.config as ConfirmStageConfig)?.correctIndex
                  }
                  onSelectOption={onSelectConfirmOption}
                  onImageClick={onImageClick}
                />
              )
            }
            if (stageType === 'VIDEO') {
              return (
                <VideoStageBlock
                  stage={currentStageDef as StageSchemaDefinition<VideoStageConfig>}
                  isVideoCompleted={true}
                  videoSeekSec={previewVideoSeekSec}
                  onSeekVideo={onSeekVideo}
                />
              )
            }
            if (stageType === 'QUIZ') {
              return (
                <QuizStageBlock
                  stage={currentStageDef as StageSchemaDefinition<QuizStageConfig>}
                  activeQuizQuestionIdx={previewQuizQuestionIdx}
                  quizAnswers={previewQuizAnswers}
                  checkedQuestions={previewCheckedQuestions}
                  onSelectQuizAnswer={onSelectQuizAnswer}
                  onCheckAnswer={onCheckAnswer}
                  onRetryQuestion={onRetryQuestion}
                  onSetActiveQuizQuestion={onSetActiveQuizQuestion}
                  onImageClick={onImageClick}
                />
              )
            }
            if (stageType === 'PRACTICE') {
              return (
                <PracticeStageBlock
                  stage={currentStageDef as StageSchemaDefinition<PracticeStageConfig>}
                  lessonId={card?.id}
                  lessonTitle={card?.title}
                  activePracticePartIndex={previewPracticePartIndex}
                  onPartChange={onPracticePartChange}
                />
              )
            }
            if (stageType === 'REWARD') {
              return (
                <RewardStageBlock
                  stage={currentStageDef as StageSchemaDefinition<RewardStageConfig>}
                  effectiveStars={effectiveJourney.stage6_completion?.rewardBadge?.stars ?? 3}
                  effectiveRewardXp={effectiveJourney.stage6_completion?.rewardBadge?.xp ?? 50}
                  onImageClick={onImageClick}
                />
              )
            }
            return null
          })()}
        </>
      )}

      {(() => {
        const rawBlocks = (stageCard || card) ? getStageBlocks(stageCard || card!, stageIndex) : []
        const extraBlocks = rawBlocks.filter((block) => {
          if (block.id.startsWith('course-goal-')) return false
          if (block.id.startsWith('course-confirm-')) return false
          if (block.id.startsWith('course-video-')) return false
          if (block.id.startsWith('course-quiz-')) return false
          if (block.id.startsWith('course-practice-')) return false
          if (block.id.startsWith('course-reward-')) return false
          if (stageIndex === 1 && (block.type === 'layout-confirm-option' || block.type === 'quiz-question' || block.id.startsWith('blk-quiz-'))) return false
          if (stageIndex === 2 && block.type === 'video') return false
          if (stageIndex === 3 && (block.type === 'quiz-question' || block.type === 'layout-confirm-option' || block.id.startsWith('blk-quiz-'))) return false
          if (stageIndex === 4 && block.type === 'practice') return false
          if (stageIndex === 5 && block.type === 'reward') return false
          if (isRule3Steps && stageIndex === 0 && block.type === 'video') return false
          return true
        })
        if (extraBlocks.length === 0) return null
        return (
          <div className="mt-4 border-t border-sky-100 pt-4">
            <StudentStageBlocksView
              card={{
                ...(stageCard || card!),
                contentBlocks: extraBlocks,
              }}
              stageIndex={stageIndex}
              isMobile={isMobile}
            />
          </div>
        )
      })()}
    </div>
  )
}
