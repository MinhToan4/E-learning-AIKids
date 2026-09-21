import React from 'react'
import type { JourneyStageDefinition, PracticeStageConfig } from '../../types/stage-schema'
import type { PracticePartState } from '../../lib/practice-parts'

const AikiStudioWorkspace = React.lazy(() =>
  import('../AikiStudioWorkspace').then((m) => ({ default: m.AikiStudioWorkspace }))
)

export interface PracticeStageBlockProps {
  stage: JourneyStageDefinition<PracticeStageConfig>
  lessonId?: string
  lessonTitle?: string
  studentStars?: number
  activePracticePartIndex?: number
  onPartChange?: (index: number) => void
  onPracticePartsSync?: (parts: PracticePartState[], activeIdx: number) => void
  onSubmitWork?: (data: { selectedImage: any; prompt: string }) => void
  onBackToLesson?: () => void
  onReplayVideo?: () => void
}

export function PracticeStageBlock({
  stage,
  lessonId,
  lessonTitle,
  studentStars,
  activePracticePartIndex = 0,
  onPartChange,
  onPracticePartsSync,
  onSubmitWork,
  onBackToLesson,
  onReplayVideo,
}: PracticeStageBlockProps) {
  const { config } = stage
  const parts = config.defaultPracticeParts || []
  const attempts = parts.length > 0 ? parts.length * 2 : 8

  return (
    <section
      data-testid="stage-4-practice"
      className="flex h-auto w-full min-w-0 shrink-0 flex-col overflow-visible rounded-3xl border-2 border-brand-100 bg-white p-2 pb-8 sm:p-3 sm:pb-4 shadow-clay animate-fade-up"
    >
      <React.Suspense
        fallback={
          <div className="flex h-96 w-full items-center justify-center rounded-3xl bg-amber-50/40 p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="size-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
              <p className="text-sm font-black text-amber-900">Đang nạp Xưởng Sáng Tạo AIKI...</p>
            </div>
          </div>
        }
      >
        <AikiStudioWorkspace
          config={config.studioConfig}
          notebookConfig={config.notebookConfig}
          lessonId={lessonId}
          lessonTitle={lessonTitle}
          lessonBadge={config.badge || 'Bài thực hành'}
          characterName={config.subjectName || lessonTitle}
          lockedFeatures={config.lockedFeatures}
          creativeEngineMode={config.creativeEngineMode}
          practiceParts={parts}
          initialAttemptsLeft={attempts}
          maxAttempts={attempts}
          studentStars={studentStars}
          activePartIndex={activePracticePartIndex}
          onPartChange={onPartChange}
          onPracticePartsSync={onPracticePartsSync}
          onBackToLesson={onBackToLesson}
          onReplayVideo={onReplayVideo}
          onSubmitWork={onSubmitWork}
        />
      </React.Suspense>
    </section>
  )
}
