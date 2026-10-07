import React from 'react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { InteractiveQuestionBlockEditor } from '../../stage-block-editors/InteractiveQuestionBlockEditor'

export interface ConfirmBlockEditorProps {
  confirmGoal: LessonSixStageJourney['stage2_confirmGoal']
  onChange: (patch: Partial<LessonSixStageJourney['stage2_confirmGoal']>) => void
  readOnly?: boolean
  questId?: string
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
}

/**
 * ConfirmBlockEditor — Form soạn thảo Chặng Xác nhận Mục tiêu (Stage 2 / Confirm Block).
 * Trình bày dạng thẻ Hallmark Soft Clay WYSIWYG khớp 100% với giao diện học sinh.
 * Tái sử dụng InteractiveQuestionBlockEditor dùng chung cho mọi khối câu hỏi trắc nghiệm / xác nhận mục tiêu.
 */
export function ConfirmBlockEditor({
  confirmGoal,
  onChange,
  readOnly = false,
  questId,
  showToast,
}: ConfirmBlockEditorProps) {
  return (
    <InteractiveQuestionBlockEditor
      question={{
        prompt: confirmGoal.question || '',
        layoutMode: confirmGoal.layoutMode || 'cards',
        visualUrl: confirmGoal.visualUrl || '',
        options: (confirmGoal.options || []).map((o, idx) => ({
          id: o.id || `confirm-opt-${idx}`,
          text: o.text,
          imageUrl: o.imageUrl,
        })),
        correctIndex: confirmGoal.correctIndex ?? 0,
        explanation: confirmGoal.explanation || '',
      }}
      onChange={(patch) => {
        const nextPatch: Partial<LessonSixStageJourney['stage2_confirmGoal']> = {}
        if (patch.prompt !== undefined) nextPatch.question = patch.prompt
        if (patch.layoutMode !== undefined) nextPatch.layoutMode = patch.layoutMode
        if (patch.visualUrl !== undefined) nextPatch.visualUrl = patch.visualUrl
        if (patch.options !== undefined) {
          nextPatch.options = patch.options.map((o, idx) => ({
            id: o.id || `confirm-opt-${idx}`,
            text: o.text,
            imageUrl: o.imageUrl,
          }))
        }
        if (patch.correctIndex !== undefined) nextPatch.correctIndex = patch.correctIndex
        if (patch.explanation !== undefined) nextPatch.explanation = patch.explanation
        onChange(nextPatch)
      }}
      readOnly={readOnly}
      questId={questId}
      showToast={showToast}
      customBadge="CHẶNG 2: XÁC NHẬN MỤC TIÊU"
      customTitle="Câu Đố Xác Nhận Mục Tiêu (Confirm Block)"
    />
  )
}
