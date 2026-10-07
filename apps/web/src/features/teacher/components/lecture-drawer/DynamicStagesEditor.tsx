import React from 'react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import {
  STAGE_BLOCK_EDITOR_REGISTRY,
  GoalBlockEditor,
  ConfirmBlockEditor,
  VideoBlockEditor,
  QuizBlockEditor,
  PracticeBlockEditor,
  RewardBlockEditor,
} from './stage-editors'

export type StageBlockType = 'GOAL' | 'CONFIRM' | 'VIDEO' | 'QUIZ' | 'PRACTICE' | 'REWARD' | string

export interface DynamicStageDefinition {
  id: string
  type: StageBlockType
  title: string
  desc?: string
}

export interface DynamicStagesEditorProps {
  stageType: StageBlockType
  journey: LessonSixStageJourney
  updateSixStage: (updater: (prev: LessonSixStageJourney) => LessonSixStageJourney) => void
  readOnly?: boolean
  questId?: string
  previewAikiVoice?: (index: number, text: string) => void
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
}

/**
 * DynamicStagesEditor — Bộ điều phối động các khối soạn thảo chặng theo chuẩn Block-Based Architecture.
 * Quét loại khối chặng (GOAL, CONFIRM, VIDEO, QUIZ, PRACTICE, REWARD...) và nạp component tương ứng từ Registry.
 */
export function DynamicStagesEditor({
  stageType,
  journey,
  updateSixStage,
  readOnly = false,
  questId,
  previewAikiVoice,
  showToast,
}: DynamicStagesEditorProps) {
  const normalizedType = (stageType || 'GOAL').toUpperCase()
  const EditorComponent = STAGE_BLOCK_EDITOR_REGISTRY[normalizedType]

  if (normalizedType === 'GOAL') {
    return (
      <GoalBlockEditor
        goal={journey.stage1_goal}
        onChange={(patch) =>
          updateSixStage((j) => ({
            ...j,
            stage1_goal: { ...j.stage1_goal, ...patch },
          }))
        }
        readOnly={readOnly}
        questId={questId}
        previewAikiVoice={previewAikiVoice}
        showToast={showToast}
      />
    )
  }

  if (normalizedType === 'CONFIRM') {
    return (
      <ConfirmBlockEditor
        confirmGoal={journey.stage2_confirmGoal}
        onChange={(patch) =>
          updateSixStage((j) => ({
            ...j,
            stage2_confirmGoal: { ...j.stage2_confirmGoal, ...patch },
          }))
        }
        readOnly={readOnly}
        questId={questId}
        showToast={showToast}
      />
    )
  }

  if (normalizedType === 'VIDEO') {
    return (
      <VideoBlockEditor
        video={journey.stage3_video}
        onChange={(patch) =>
          updateSixStage((j) => ({
            ...j,
            stage3_video: { ...j.stage3_video, ...patch },
          }))
        }
        readOnly={readOnly}
        questId={questId}
        showToast={showToast}
      />
    )
  }

  if (normalizedType === 'QUIZ') {
    return (
      <QuizBlockEditor
        quiz={journey.stage4_quiz}
        onChange={(patch) =>
          updateSixStage((j) => ({
            ...j,
            stage4_quiz: { ...j.stage4_quiz, ...patch },
          }))
        }
        readOnly={readOnly}
        questId={questId}
        showToast={showToast}
      />
    )
  }

  if (normalizedType === 'PRACTICE') {
    return (
      <PracticeBlockEditor
        practice={journey.stage5_practice}
        onChange={(patch) =>
          updateSixStage((j) => ({
            ...j,
            stage5_practice: { ...j.stage5_practice, ...patch },
          }))
        }
        readOnly={readOnly}
        previewAikiVoice={previewAikiVoice}
        showToast={showToast}
      />
    )
  }

  if (normalizedType === 'REWARD') {
    return (
      <RewardBlockEditor
        completion={journey.stage6_completion}
        stage1ImageUrl={journey.stage1_goal.imageUrl}
        onChange={(patch) =>
          updateSixStage((j) => ({
            ...j,
            stage6_completion: { ...j.stage6_completion, ...patch },
          }))
        }
        readOnly={readOnly}
        questId={questId}
        showToast={showToast}
        stageStarAllocation={journey.stageStarAllocation}
        onToggleStage6Star={() => {
          const currentAllocation = journey.stageStarAllocation ?? [2, 3, 4]
          const isAllocated = currentAllocation.includes(5)
          if (isAllocated) {
            const next = currentAllocation.filter((idx) => idx !== 5)
            updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
            showToast?.('Đã bỏ tặng sao ở Chặng 6', 'info')
          } else {
            if (currentAllocation.length >= 3) {
              showToast?.(
                `Bài học tối đa 3 Sao. Đang chọn ở Chặng ${currentAllocation.map((s) => s + 1).join(', ')}. Hãy bỏ bớt 1 chặng trước nhé!`,
                'error'
              )
              return
            }
            const next = [...currentAllocation, 5].sort((a, b) => a - b)
            updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
            showToast?.('⭐ Chặng 6 sẽ tặng 1 Sao khi hoàn thành!', 'success')
          }
        }}
      />
    )
  }

  // Fallback nếu có custom component đăng ký trong STAGE_BLOCK_EDITOR_REGISTRY
  if (EditorComponent) {
    return (
      <EditorComponent
        journey={journey}
        updateSixStage={updateSixStage}
        readOnly={readOnly}
        questId={questId}
        showToast={showToast}
      />
    )
  }

  return (
    <GoalBlockEditor
      goal={journey.stage1_goal}
      onChange={(patch) =>
        updateSixStage((j) => ({
          ...j,
          stage1_goal: { ...j.stage1_goal, ...patch },
        }))
      }
      readOnly={readOnly}
      questId={questId}
      previewAikiVoice={previewAikiVoice}
      showToast={showToast}
    />
  )
}
