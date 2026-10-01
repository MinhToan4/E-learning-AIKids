import React from 'react'
import { createPortal } from 'react-dom'
import {
  Target,
  HelpCircle,
  Video,
  FileQuestion,
  Palette,
  Trophy,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { CourseCertificateModal } from './CourseCertificateModal'
import { FlatClayIcon } from '@/features/asmo/components/AsmoFlatClayIcons'
import { cn } from '@/shared/lib/cn'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { isValidImageUrl, parseGoalCard, GOAL_CARD_STYLES } from '../lib/stage-view-utils'
import { STAGE_REGISTRY } from './stages'
import type { JourneyStageDefinition, ParsedGoalCard } from '../types/stage-schema'
import { StageStepperBar } from './StageStepperBar'
import {
  useSixStageJourneyState,
  type LessonCompletionSummary,
  calculateStationXp,
  readLessonStorage,
  writeLessonStorage,
  clearLessonStageStorage,
} from '../hooks/useSixStageJourneyState'

const StudentStageBlocksView = React.lazy(() =>
  import('./StudentStageBlocksView').then((module) => ({ default: module.StudentStageBlocksView })),
)

// Re-export helpers for 100% backward compatibility
export { isValidImageUrl, parseGoalCard, GOAL_CARD_STYLES }
export type { ParsedGoalCard, LessonCompletionSummary }
export { calculateStationXp, readLessonStorage, writeLessonStorage, clearLessonStageStorage }

export interface SixStageJourneyViewProps {
  journey?: LessonSixStageJourney
  stages?: JourneyStageDefinition[]
  lessonId: string
  lessonTitle: string
  studentStars?: number
  rewardXp?: number
  isCompleted?: boolean
  previousStars?: number
  onFinishLesson?: (result: LessonCompletionSummary) => boolean | void | Promise<boolean | void>
  onBackToMap?: () => void
  onNavigateNextLesson?: (nextLessonSlug: string) => void
  onOpenCourse?: () => void
  initialStageIndex?: number
  onStageChange?: (stageIndex: number) => void
  initialSidebarCollapsed?: boolean
  isFinalStation?: boolean
  matchedCurriculum?: {
    lessonNumber?: string
    islandNumber: number
    islandName?: string
    title: string
    journey?: Partial<LessonSixStageJourney>
  }
  onVideoCompleted?: () => void
  isSavingProgress?: boolean
  initialPracticeState?: any
  onPracticeStateChange?: (state: any) => void
}

export const STAGES = [
  { index: 0, title: 'Mục tiêu', icon: Target, stepNumber: 1 },
  { index: 1, title: 'Xác nhận mục tiêu', icon: HelpCircle, stepNumber: 2 },
  { index: 2, title: 'Video bài giảng', icon: Video, stepNumber: 3 },
  { index: 3, title: 'Bài test', icon: FileQuestion, stepNumber: 4 },
  { index: 4, title: 'Thực hành', icon: Palette, stepNumber: 5 },
  { index: 5, title: 'Hoàn thành', icon: Trophy, stepNumber: 6 },
] as const

export function SixStageJourneyView(props: SixStageJourneyViewProps) {
  const {
    lessonId,
    lessonTitle,
    isSavingProgress = false,
  } = props

  const state = useSixStageJourneyState(props)

  // Lookup Component from Schema Registry
  const StageComp = STAGE_REGISTRY[state.currentStageDef?.type]

  return (
    <div className="mx-auto flex h-full max-h-full min-h-0 w-full max-w-[1024px] min-w-0 flex-1 flex-col gap-2 overflow-y-auto md:overflow-hidden">
      <StageStepperBar
        stages={state.stages}
        currentStage={state.currentStage}
        completedStages={state.completedStages}
        isVideoCompleted={state.isVideoCompleted}
        quizScore={state.quizScore}
        isCompletedLesson={state.isCompletedLesson}
        onSelectStage={state.handleStageSelect}
        onBackToMap={state.onBackToMap}
        onFinishLesson={state.onFinishLesson}
        lessonTitle={lessonTitle}
        effectiveStars={state.effectiveStars}
        effectiveRewardXp={state.effectiveRewardXp}
        submittedQuizAnswers={state.submittedQuizAnswers}
        isSavingProgress={isSavingProgress}
        stationInfo={state.stationInfo}
        legacyStationAlias={state.legacyStationAlias}
        isRuleLesson={state.isRuleLesson}
        quizSubmitted={state.quizSubmitted}
      />

      {/* ── KHÔNG GIAN BÀI HỌC CHÍNH (FULL WIDTH) ── */}
      <div className="flex flex-1 flex-col items-stretch gap-4 min-h-0 w-full max-w-full min-w-0 overflow-x-hidden md:overflow-hidden">
        {/* MAIN LEARNING CANVAS QUA STAGE_REGISTRY */}
        <div
          data-testid="main-learning-canvas"
          style={{ WebkitOverflowScrolling: 'touch' }}
          className={cn(
            'flex-1 min-w-0 w-full max-w-full overflow-x-hidden flex flex-col gap-4 pr-1 md:overflow-y-auto md:overscroll-contain',
            state.currentStageDef?.type === 'PRACTICE' ? 'gap-2 pr-0.5 sm:pr-1' : 'scrollbar-none hidden-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            state.currentStageDef?.type === 'REWARD' ? 'overflow-y-auto pb-28 sm:pb-6' : '',
            state.currentStageDef?.type === 'VIDEO' ? 'overflow-hidden md:overflow-hidden overflow-x-hidden overscroll-contain pb-1' : '',
          )}
        >
          {StageComp && (
            <StageComp
              stage={state.currentStageDef}
              onContinue={() => state.advanceToStage(state.currentStage + 1)}
              continueLabel={state.isRuleLesson ? 'Hoàn thành bài học' : undefined}
              onPrevious={state.currentStage > 0 ? () => state.handleStageSelect(state.currentStage - 1) : undefined}
              onImageClick={state.setZoomImage}
              // Confirm stage props
              selectedOption={state.selectedConfirmOption}
              isCorrect={state.isConfirmCorrect}
              failedOptionImages={state.failedOptionImages}
              onSelectOption={state.handleSelectConfirmOption}
              onOptionImageError={state.handleOptionImageError}
              // Video stage props
              videoSeekSec={state.videoSeekSec}
              onSeekVideo={state.handleSeekVideo}
              onSpeakCurrentStage={state.speakCurrentStage}
              isVideoCompleted={state.isVideoCompleted}
              onVideoCompleted={state.handleVideoCompleted}
              // Quiz stage props
              activeQuizQuestionIdx={state.activeQuizQuestionIdx}
              quizAnswers={state.quizAnswers}
              checkedQuestions={state.checkedQuestions}
              quizSubmitted={state.quizSubmitted}
              quizScore={state.quizScore}
              quizStars={state.quizStars}
              failedQuizImages={state.failedQuizImages}
              onSelectQuizAnswer={state.handleSelectQuizAnswer}
              onCheckAnswer={state.handleCheckAnswer}
              onRetryQuestion={state.handleRetryQuestion}
              onSetActiveQuizQuestion={state.handleSetActiveQuizQuestion}
              onSubmitQuiz={state.handleSubmitQuiz}
              onQuizImageError={state.handleQuizImageError}
              // Practice stage props
              lessonId={lessonId}
              lessonTitle={lessonTitle}
              studentStars={state.studentStars}
              activePracticePartIndex={state.activePracticePartIndex}
              onPartChange={state.setActivePracticePartIndex}
              onPracticePartsSync={(parts: any, activeIdx: number) => {
                state.setPracticePartsState(parts)
                state.setActivePracticePartIndex(activeIdx)
              }}
              onSubmitWork={state.handleSubmitWork}
              initialPracticeState={props.initialPracticeState}
              onPracticeStateChange={state.handlePracticeStateChange}
              onBackToLesson={() => state.handleStageSelect(state.indices.quizIdx >= 0 ? state.indices.quizIdx : Math.max(0, state.currentStage - 1))}
              onReplayVideo={() => state.handleStageSelect(state.indices.videoIdx >= 0 ? state.indices.videoIdx : Math.max(0, state.currentStage - 2))}
              // Reward stage props
              submittedArtwork={state.submittedArtwork}
              effectiveStars={state.effectiveStars}
              effectiveRewardXp={state.effectiveRewardXp}
              answers={state.submittedQuizAnswers}
              onNavigateNextLesson={state.onNavigateNextLesson}
              onBackToMap={state.onBackToMap}
              onFinishLesson={state.onFinishLesson}
              isFinalStation={state.isFinalStation}
              onOpenCertificate={state.isFinalStation ? () => state.setIsCertificateModalOpen(true) : undefined}
              onOpenCourse={state.isFinalStation ? state.onOpenCourse : undefined}
            />
          )}

          {state.supplementalStageCard && (
            <section aria-label="Nội dung bổ sung của chặng" className="animate-fade-up">
              <React.Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-slate-100" />}>
                <StudentStageBlocksView
                  card={state.supplementalStageCard}
                  stageIndex={state.currentStage}
                  onNextStage={state.currentStage < state.stages.length - 1 ? state.advanceToStage : undefined}
                  onZoomImage={(image) => image.url && state.setZoomImage({ url: image.url, title: image.title })}
                />
              </React.Suspense>
            </section>
          )}
        </div>
      </div>

      {/* ── LIGHTBOX MODAL PHÓNG TO ẢNH FULL-SCREEN RESPONSIVE ── */}
      {state.zoomImage && typeof document !== 'undefined' && createPortal(
        <div
          ref={state.modalRef}
          data-testid="lightbox-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fade-in select-none"
          onClick={state.handleCloseModal}
        >
          {/* Bộ công cụ điều khiển trên PC / Tablet: Fullscreen, Zoom In, Zoom Out, Reset */}
          <div
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1 sm:gap-1.5 bg-black/70 hover:bg-black/85 p-1 sm:p-1.5 rounded-full border border-white/25 backdrop-blur-md shadow-xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Toàn màn hình (Fullscreen Toggle ⛶) */}
            <button
              type="button"
              onClick={state.toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 active:scale-90 transition cursor-pointer flex items-center justify-center text-white"
              title={state.isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình (⛶)'}
              aria-label="Toàn màn hình"
            >
              {state.isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <div className="h-4 w-[1px] bg-white/30 my-auto" />

            {/* Nút Zoom Out (-) */}
            <button
              type="button"
              disabled={state.zoomScale <= 1}
              onClick={() => state.setZoomScale((prev) => Math.max(1, +(prev - 0.25).toFixed(2)))}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent active:scale-90 transition cursor-pointer flex items-center justify-center text-white"
              title="Thu nhỏ (-)"
              aria-label="Thu nhỏ"
            >
              <ZoomOut size={18} />
            </button>

            {/* Nút Reset (↺) */}
            <button
              type="button"
              onClick={() => state.setZoomScale(1)}
              className="px-2 py-1 rounded-full hover:bg-white/20 active:scale-95 transition cursor-pointer flex items-center gap-1 text-white text-xs font-bold"
              title="Đặt lại kích thước gốc 100% (↺)"
              aria-label="Đặt lại kích thước gốc"
            >
              <span>{Math.round(state.zoomScale * 100)}%</span>
              {state.zoomScale > 1 && <RotateCcw size={13} className="text-amber-300" />}
            </button>

            {/* Nút Zoom In (+) */}
            <button
              type="button"
              disabled={state.zoomScale >= 2.5}
              onClick={() => state.setZoomScale((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)))}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent active:scale-90 transition cursor-pointer flex items-center justify-center text-white"
              title="Phóng to (+)"
              aria-label="Phóng to"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Nút Đóng (X) to rõ góc trên bên phải */}
          <button
            type="button"
            aria-label="Đóng"
            onClick={state.handleCloseModal}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-11 h-11 rounded-full bg-black/80 hover:bg-black text-white border border-white/40 active:scale-95 flex items-center justify-center transition cursor-pointer shadow-2xl backdrop-blur-md"
            title="Đóng xem ảnh (Esc)"
          >
            <X size={24} />
          </button>

          {/* Container ảnh to bản Full-Screen */}
          <div
            className="relative w-full h-full max-w-[96vw] max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-auto p-1 sm:p-2">
              <img
                decoding="async"
                src={state.modalImgSrc || state.zoomImage.url}
                alt={state.zoomImage.title}
                onError={state.handleModalImgError}
                style={{
                  transform: state.zoomScale > 1 ? `scale(${state.zoomScale})` : undefined,
                  transformOrigin: 'center center',
                }}
                className="w-auto h-auto max-w-[95vw] max-h-[82vh] lg:max-h-[84vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl transition-transform duration-200 select-none border border-white/20 bg-black/40"
              />
            </div>

            {/* Thẻ tiêu đề tranh dưới đáy */}
            {state.zoomImage.title && (
              <div className="mt-2.5 text-xs sm:text-sm font-bold text-white bg-black/75 px-4 py-1.5 rounded-full backdrop-blur-md max-w-[90vw] sm:max-w-2xl truncate text-center shadow-lg border border-white/10 shrink-0">
                {state.zoomImage.title}
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}

      {state.starCelebration > 0 && typeof document !== 'undefined' && createPortal(
        <div
          key={state.starCelebration}
          data-testid="star-earned-celebration"
          className="lesson-star-celebration fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none px-4"
          role="status"
          aria-live="polite"
          aria-label="Con đã nhận được một ngôi sao"
        >
          <div className="lesson-star-celebration-card relative flex min-w-[210px] flex-col items-center rounded-3xl border-2 border-amber-300 bg-white px-7 py-5 shadow-2xl">
            <span className="lesson-star-celebration-glow absolute inset-0 rounded-3xl" aria-hidden="true" />
            <div className="lesson-star-celebration-icon relative">
              <FlatClayIcon name="star" size={92} />
            </div>
            <p className="relative mt-2 text-center text-lg font-black text-slate-900">
              Con nhận được một ngôi sao!
            </p>
          </div>
        </div>,
        document.body,
      )}

      {/* ── MODAL TRAO CHỨNG CHỈ HOÀN THÀNH ĐẢO ── */}
      <CourseCertificateModal
        isOpen={state.isCertificateModalOpen}
        onClose={() => state.setIsCertificateModalOpen(false)}
        courseTitle={lessonTitle}
        islandTitle={state.stationInfo.islandName}
        stars={state.effectiveStars}
        xp={state.effectiveRewardXp}
      />
    </div>
  )
}
