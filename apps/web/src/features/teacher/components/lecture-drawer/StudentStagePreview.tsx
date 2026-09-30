import React, { useState, useEffect } from 'react'
import {
  Eye,
  Maximize2,
  Monitor,
  PanelRightClose,
  Smartphone,
  Tablet,
  X,
  ZoomIn,
} from 'lucide-react'
import { useToast } from '@/shared/hooks/useToast'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
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
  type LectureDraft,
  type LearnCardDraft,
  type LessonFormat,
  STANDARD_RULE_3_STAGES,
  ISLAND_6_STAGE_NAMES,
  getStageBlocks,
  PRACTICE_OPTIONS,
} from '../../lib/authoring'
import {
  AIKI_STAGE_NAMES,
  LEARN_KIND_PRESENTATION,
  goalLines,
} from './lecture-drawer-constants'
import { cn } from '@/shared/lib/cn'
import { type LessonSixStageJourney } from '@/shared/lib/api'

export type PreviewViewportMode = 'mobile' | 'tablet' | 'pc' | 'full'

export const StudentStagePreview = React.memo(function StudentStagePreview({
  card,
  stageIndex,
  isIsland,
  sixStageJourney,
  stageCard,
  viewport: propViewport,
  hideHeaderToolbar,
  onCollapse,
  lessonFormat,
}: {
  card?: LearnCardDraft
  stageIndex: number
  isIsland?: boolean
  sixStageJourney?: LessonSixStageJourney
  stageCard?: LearnCardDraft
  viewport?: PreviewViewportMode
  hideHeaderToolbar?: boolean
  onCollapse?: () => void
  lessonFormat?: LessonFormat
}) {
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title?: string } | null>(null)
  const [internalViewport, setInternalViewport] = useState<PreviewViewportMode>('mobile')
  const activeViewport = propViewport ?? internalViewport
  const setViewport = setInternalViewport
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { showToast: _showToast } = useToast()

  // State tương tác cho Video Stage
  const [previewVideoSeekSec, setPreviewVideoSeekSec] = useState(0)

  // State tương tác cho Quiz Stage
  const [previewQuizQuestionIdx, setPreviewQuizQuestionIdx] = useState(0)
  const [previewQuizAnswers, setPreviewQuizAnswers] = useState<Record<number, number>>({})
  const [previewCheckedQuestions, setPreviewCheckedQuestions] = useState<Record<number, boolean>>({})

  // State tương tác cho Confirm Stage
  const [previewConfirmOption, setPreviewConfirmOption] = useState<number | null>(null)

  // State tương tác cho Practice Stage
  const [previewPracticePartIndex, setPreviewPracticePartIndex] = useState(0)

  // Lắng nghe phím Escape để đóng toàn màn hình
  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const isRule3Steps = lessonFormat === 'aiki-rule-3steps'

  if ((isIsland || isRule3Steps) && sixStageJourney) {
    const stageName = isRule3Steps
      ? (STANDARD_RULE_3_STAGES[stageIndex]?.title ?? `Bước ${stageIndex + 1}`)
      : (ISLAND_6_STAGE_NAMES[stageIndex] ?? `Chặng ${stageIndex + 1}`)

    const renderIslandStageContent = (_isFs: boolean, vp: PreviewViewportMode) => {
      const isMobile = vp === 'mobile'

      const stages = adaptSixStageJourneyToStages(sixStageJourney, {
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
                  onSeekVideo={setPreviewVideoSeekSec}
                />
              )}

              {stageIndex === 1 && stages[3] && (
                <QuizStageBlock
                  stage={stages[3] as StageSchemaDefinition<QuizStageConfig>}
                  activeQuizQuestionIdx={previewQuizQuestionIdx}
                  quizAnswers={previewQuizAnswers}
                  checkedQuestions={previewCheckedQuestions}
                  onSelectQuizAnswer={(qIdx, optIdx) => {
                    setPreviewQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                    setPreviewCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
                  }}
                  onCheckAnswer={(qIdx) => {
                    setPreviewCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
                  }}
                  onRetryQuestion={(qIdx) => {
                    setPreviewQuizAnswers((prev) => {
                      const next = { ...prev }
                      delete next[qIdx]
                      return next
                    })
                    setPreviewCheckedQuestions((prev) => {
                      const next = { ...prev }
                      delete next[qIdx]
                      return next
                    })
                  }}
                  onSetActiveQuizQuestion={setPreviewQuizQuestionIdx}
                  onImageClick={(image) => setZoomedImage(image)}
                />
              )}

              {stageIndex === 2 && stages[5] && (
                <RewardStageBlock
                  stage={stages[5] as StageSchemaDefinition<RewardStageConfig>}
                  effectiveStars={sixStageJourney.stage6_completion?.rewardBadge?.stars ?? 3}
                  effectiveRewardXp={sixStageJourney.stage6_completion?.rewardBadge?.xp ?? 50}
                  onImageClick={(image) => setZoomedImage(image)}
                />
              )}
            </>
          ) : (
            <>
              {stageIndex === 0 && stages[0] && (
                <GoalStageBlock
                  stage={stages[0] as StageSchemaDefinition<GoalStageConfig>}
                  onImageClick={(image) => setZoomedImage(image)}
                />
              )}

              {stageIndex === 1 && stages[1] && (
                <ConfirmStageBlock
                  stage={stages[1] as StageSchemaDefinition<ConfirmStageConfig>}
                  selectedOption={previewConfirmOption}
                  isCorrect={previewConfirmOption === (stages[1]?.config as ConfirmStageConfig)?.correctIndex}
                  onSelectOption={(idx) => setPreviewConfirmOption(idx)}
                  onImageClick={(image) => setZoomedImage(image)}
                />
              )}

              {stageIndex === 2 && stages[2] && (
                <VideoStageBlock
                  stage={stages[2] as StageSchemaDefinition<VideoStageConfig>}
                  isVideoCompleted={true}
                  videoSeekSec={previewVideoSeekSec}
                  onSeekVideo={setPreviewVideoSeekSec}
                />
              )}

              {stageIndex === 3 && stages[3] && (
                <QuizStageBlock
                  stage={stages[3] as StageSchemaDefinition<QuizStageConfig>}
                  activeQuizQuestionIdx={previewQuizQuestionIdx}
                  quizAnswers={previewQuizAnswers}
                  checkedQuestions={previewCheckedQuestions}
                  onSelectQuizAnswer={(qIdx, optIdx) => {
                    setPreviewQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                    setPreviewCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
                  }}
                  onCheckAnswer={(qIdx) => {
                    setPreviewCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
                  }}
                  onRetryQuestion={(qIdx) => {
                    setPreviewQuizAnswers((prev) => {
                      const next = { ...prev }
                      delete next[qIdx]
                      return next
                    })
                    setPreviewCheckedQuestions((prev) => {
                      const next = { ...prev }
                      delete next[qIdx]
                      return next
                    })
                  }}
                  onSetActiveQuizQuestion={setPreviewQuizQuestionIdx}
                  onImageClick={(image) => setZoomedImage(image)}
                />
              )}

              {stageIndex === 4 && stages[4] && (
                <PracticeStageBlock
                  stage={stages[4] as StageSchemaDefinition<PracticeStageConfig>}
                  lessonId={card?.id}
                  lessonTitle={card?.title}
                  activePracticePartIndex={previewPracticePartIndex}
                  onPartChange={setPreviewPracticePartIndex}
                />
              )}

              {stageIndex === 5 && stages[5] && (
                <RewardStageBlock
                  stage={stages[5] as StageSchemaDefinition<RewardStageConfig>}
                  effectiveStars={sixStageJourney.stage6_completion?.rewardBadge?.stars ?? 3}
                  effectiveRewardXp={sixStageJourney.stage6_completion?.rewardBadge?.xp ?? 50}
                  onImageClick={(image) => setZoomedImage(image)}
                />
              )}
            </>
          )}

          {(stageCard || card) && getStageBlocks(stageCard || card!, stageIndex).some((block) => !block.id.startsWith('course-goal-') && !block.id.startsWith('course-confirm-') && (!isRule3Steps || stageIndex !== 0 || block.type !== 'video')) && (
            <div className="mt-4 border-t border-sky-100 pt-4">
              <StudentStageBlocksView
                card={{
                  ...(stageCard || card!),
                  contentBlocks: getStageBlocks(stageCard || card!, stageIndex).filter((block) => {
                    if (block.id.startsWith('course-goal-') || block.id.startsWith('course-confirm-')) return false
                    if (isRule3Steps && stageIndex === 0 && block.type === 'video') return false
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

    return (
      <aside className="ui-card min-w-0 h-fit overflow-hidden p-4 lg:sticky lg:top-4" aria-label={`Xem trước ${stageName} trên màn học sinh`}>
        {/* Header Preview với Viewport Selector */}
        {!hideHeaderToolbar && (
          <div className="flex flex-col gap-2 pb-2.5 border-b border-border/80">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-sky-700">
                <Eye size={15} /> {isRule3Steps ? 'Xem trước học sinh (Quy tắc AIKI · 3 bước)' : 'Xem trước học sinh (Đảo AIKids)'}
              </p>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-black text-brand-800">
                Chặng {stageIndex + 1}/{isRule3Steps ? 3 : 6}
              </span>
            </div>

            {/* Thanh công cụ Viewport Selector trên header preview */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 text-[10.5px]">
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                    activeViewport === 'mobile' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Xem dạng Mobile (375px)"
                >
                  <Smartphone size={12} />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('tablet')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                    activeViewport === 'tablet' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Xem dạng iPad (768px)"
                >
                  <Tablet size={12} />
                  <span>iPad</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('pc')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                    activeViewport === 'pc' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Xem dạng PC (1024px+)"
                >
                  <Monitor size={12} />
                  <span>PC</span>
                </button>
              </div>

              {/* Nút nổi bật: ⛶ Toàn màn hình */}
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-brand-600 hover:from-sky-700 hover:to-brand-700 text-white px-2.5 py-1 text-[10.5px] font-black shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                title="Phóng to toàn màn hình (Fullscreen Modal)"
              >
                <Maximize2 size={13} />
                <span>Toàn màn hình</span>
              </button>
              {onCollapse && !hideHeaderToolbar && (
                <button
                  type="button"
                  onClick={onCollapse}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-[10.5px] font-bold transition cursor-pointer shrink-0"
                  title="Thu gọn cột xem trước"
                >
                  <PanelRightClose size={12} />
                  <span>Thu gọn</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Nội dung xem trước Inline */}
        <div className={cn(
          hideHeaderToolbar
            ? "w-full transition-all text-left"
            : cn(
                "mt-3 transition-all",
                activeViewport === 'mobile' && "max-w-[385px] mx-auto preview-viewport-mobile",
                activeViewport === 'tablet' && "w-full overflow-x-auto",
                activeViewport === 'pc' && "w-full overflow-x-auto"
              )
        )}>
          {renderIslandStageContent(false, activeViewport)}
        </div>

        {/* Chế độ Xem Trước Toàn Màn Hình (Fullscreen Modal Preview) */}
        {isFullscreen && (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-slate-900/25 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={`Xem trước toàn màn hình: ${stageName}`}
          >
            {/* Thanh điều khiển trên cùng (Header Modal nền trắng Soft Clay) */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-white/95 px-4 sm:px-6 text-slate-900 shadow-2xs z-10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200 shrink-0">
                  <Eye size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-slate-900 truncate flex items-center gap-2">
                    <span>👁️ Xem Trước Trải Nghiệm Học Sinh:</span>
                    <span className="text-brand-600 truncate">{stageName}</span>
                  </h2>
                  <span className="text-[11px] font-medium text-slate-500 block truncate">
                    {isRule3Steps ? `Quy tắc AIKI · 3 bước · Bước ${stageIndex + 1}/3` : `Đảo AIKids · Chặng ${stageIndex + 1}/6`}
                  </span>
                </div>
              </div>

              {/* Bộ nút chuyển kích thước xem thử */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'mobile'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình Điện thoại (375px)"
                >
                  <Smartphone size={14} />
                  <span className="hidden md:inline">📱 Điện thoại 375px</span>
                  <span className="md:hidden">375px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewport('tablet')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'tablet'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình iPad / Máy tính bảng (768px)"
                >
                  <Tablet size={14} />
                  <span className="hidden md:inline">📱 iPad / Tablet 768px</span>
                  <span className="md:hidden">768px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewport('pc')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'pc'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình Máy tính PC (1200px)"
                >
                  <Monitor size={14} />
                  <span className="hidden md:inline">💻 Máy tính PC 1200px</span>
                  <span className="md:hidden">1200px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewport('full')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'full'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình Tràn viền (100%)"
                >
                  <Maximize2 size={14} />
                  <span className="hidden md:inline">🖥️ Full màn hình 100%</span>
                  <span className="md:hidden">100%</span>
                </button>
              </div>

              {/* Nút đóng Esc */}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 text-xs border border-slate-200 transition cursor-pointer shadow-xs shrink-0"
                title="Đóng chế độ xem trước (Esc)"
              >
                <X size={15} />
                <span className="hidden sm:inline">✕ Đóng (Esc)</span>
              </button>
            </header>

            {/* Vùng chứa nội dung xem trước (Canvas area) */}
            <div className="flex-1 bg-slate-100/70 p-4 sm:p-6 overflow-y-auto flex justify-center items-start">
              {activeViewport === 'mobile' ? (
                <div className="w-[375px] max-w-full rounded-[2.5rem] border-[6px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col shrink-0 my-auto sm:my-0 preview-viewport-mobile">
                  {/* Tai thỏ / rãnh loa thoại */}
                  <div className="h-5 flex justify-center items-center py-1 bg-slate-100 border-b border-slate-200 shrink-0">
                    <div className="w-16 h-1 rounded-full bg-slate-300" />
                  </div>
                  {/* Vùng xem trước bên trong điện thoại có scroll */}
                  <div className="overflow-y-auto max-h-[75vh] p-3 text-left">
                    {renderIslandStageContent(true, activeViewport)}
                  </div>
                </div>
              ) : activeViewport === 'tablet' ? (
                <div className="w-[768px] max-w-full rounded-2xl border-4 border-slate-300 bg-white shadow-xl overflow-hidden p-4 shrink-0">
                  {renderIslandStageContent(true, activeViewport)}
                </div>
              ) : (
                <div className={cn(
                  "w-full rounded-2xl border-2 border-slate-200 bg-white shadow-lg p-6 shrink-0",
                  activeViewport === 'full' ? "max-w-[1600px]" : "max-w-[1240px]"
                )}>
                  {renderIslandStageContent(true, activeViewport)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal phóng to ảnh */}
        {zoomedImage && (
          <AdventureModal
            open={!!zoomedImage}
            onClose={() => setZoomedImage(null)}
            title={zoomedImage.title || 'Chi tiết ảnh'}
          >
            <img src={zoomedImage.url} alt="Chi tiết" className="w-full h-auto rounded-xl" />
          </AdventureModal>
        )}
      </aside>
    )
  }

  if (!card) return null
  const presentation = LEARN_KIND_PRESENTATION[card.kind] ?? LEARN_KIND_PRESENTATION.example
  const KindIcon = presentation.icon
  const stageName = AIKI_STAGE_NAMES[stageIndex] ?? `Chặng ${stageIndex + 1}`
  const stageBlocks = getStageBlocks(card, stageIndex)

  const renderAikiStageContent = (isFs: boolean, vp: PreviewViewportMode) => {
    const isMobile = vp === 'mobile'
    return (
    <article className={cn("rounded-2xl border-2 p-4 shadow-sm", presentation.tone, isFs ? "w-full" : "mt-3")}>
        <div className="flex items-center justify-between gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-white/80">
            <KindIcon size={20} aria-hidden="true" />
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
              {presentation.label}
            </span>
            {stageBlocks.map((b) => (
              <span key={b.id} className="rounded-full bg-brand-50 border border-brand-200 px-1.5 py-0.5 text-[9px] font-black text-brand-800">
                {b.type === 'versus-ab' ? '🖼️ A/B' : b.type === 'images' ? '📷 Ảnh' : b.type === 'dialogue' ? '💬 Thoại' : b.type === 'compare' ? '⚖️ So sánh' : b.type === 'poster' ? '📜 Poster' : b.type === 'voice' ? '🐱 Mèo' : b.type === 'video' ? '🎬 Video' : b.type === 'layout-callout' ? '💡 Ghi nhớ' : b.type === 'layout-formula' ? '🔤 KaTeX' : b.type === 'layout-split' ? '📰 2 Cột' : b.type === 'layout-grid' ? '🍱 Lưới' : b.type === 'layout-storyboard' ? '🎬 Storyboard' : '📖 Chữ'}
              </span>
            ))}
          </div>
        </div>

        {stageBlocks.length === 0 ? (
          <p className="mt-3 text-center text-xs font-bold text-muted py-4">Chặng này chưa có khối nội dung nào.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {stageBlocks.map((block) => {
              if (block.type === 'text' || block.type === 'layout-text') {
                return (
                  <div key={block.id} className="rounded-xl border border-current/15 bg-white/70 p-3">
                    {block.title && <h3 className="font-display text-base leading-snug">{block.title}</h3>}
                    <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">
                      {block.body?.trim() || 'Nội dung đoạn văn bản sẽ hiển thị ở đây.'}
                    </p>
                    {block.tip && (
                      <p className="mt-2 rounded-xl border border-current/20 bg-white/90 px-3 py-1.5 text-xs font-bold text-brand-900">
                        💡 Ghi nhớ: {block.tip}
                      </p>
                    )}
                  </div>
                )
              }

              if (block.type === 'layout-callout') {
                return (
                  <div key={block.id} className="rounded-xl border-2 border-amber-300 bg-amber-50/90 p-3 text-amber-950">
                    <p className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1 mb-1">
                      💡 {block.title || 'Hộp Ghi Nhớ Nổi Bật'}
                    </p>
                    <p className="text-xs font-bold leading-relaxed">{block.tip || block.body || 'Bí kíp bỏ túi cho bé...'}</p>
                  </div>
                )
              }

              if (block.type === 'layout-formula') {
                return (
                  <div key={block.id} className="rounded-xl border border-brand-200 bg-brand-50/70 p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-wider text-brand-800 mb-1">{block.title || 'Công Thức KaTeX'}</p>
                    <div className="font-mono text-xs font-black text-brand-950 py-1.5 px-2 bg-white rounded-lg border border-brand-200 shadow-2xs">
                      {block.formula || '$$\\text{Ý tưởng con} + \\text{Sức mạnh AI} = \\text{Tác phẩm độc nhất}$$'}
                    </div>
                  </div>
                )
              }

              if (block.type === 'layout-split') {
                const isTwoText = block.columns === 2 && !block.imageUrl
                return (
                  <div key={block.id} className={cn("rounded-xl border border-current/15 bg-white/70 p-2.5 items-center", isMobile ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 gap-2")}>
                    <div>
                      {block.title && <h4 className="font-display text-xs font-bold text-text">{block.title}</h4>}
                      <p className="text-[11px] font-semibold text-text mt-0.5">{block.body || 'Nội dung giải thích...'}</p>
                    </div>
                    {isTwoText ? (
                      <div>
                        <p className="text-[11px] font-semibold text-text mt-0.5">{block.tip || 'Nội dung cột phải...'}</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg aspect-video bg-slate-100 border border-slate-200 grid place-items-center">
                        {block.imageUrl ? (
                          <img src={block.imageUrl} alt={block.imageAlt || 'Media'} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        ) : (
                          <span className="text-[10px] font-bold text-muted">Ảnh / Media</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              }

              if (block.type === 'layout-grid') {
                const items = (block.visualItems && block.visualItems.length > 0) ? block.visualItems : card.visualItems
                return (
                  <div key={block.id} className="rounded-xl border border-current/15 bg-white/70 p-2.5">
                    {block.title && <h4 className="font-display text-xs font-black text-text mb-1.5">{block.title}</h4>}
                    <div className={cn("grid gap-1.5", isMobile ? "grid-cols-1" : "grid-cols-3")}>
                      {items.map((item, vIdx) => (
                        <div key={vIdx} className="rounded-lg border border-brand-200 bg-brand-50/70 p-1.5 text-center">
                          <p className="text-[10px] font-black text-brand-900 truncate">{item.label}</p>
                          <p className="text-[9px] font-semibold text-brand-800 line-clamp-2 mt-0.5">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              if (block.type === 'layout-storyboard') {
                const items = (block.visualItems && block.visualItems.length > 0) ? block.visualItems : card.visualItems
                return (
                  <div key={block.id} className="rounded-xl border border-current/15 bg-white/70 p-2.5">
                    {block.title && <h4 className="font-display text-xs font-black text-text mb-1.5">{block.title}</h4>}
                    <div className="grid grid-cols-3 gap-1.5">
                      {items.map((item, sIdx) => (
                        <div key={sIdx} className="rounded-lg border border-brand-200 bg-white p-1.5 text-center">
                          <span className="inline-block rounded bg-brand-100 px-1 py-0.2 text-[8px] font-black text-brand-800">
                            Cảnh {sIdx + 1}
                          </span>
                          <p className="text-[9.5px] font-bold text-text truncate mt-0.5">{item.label}</p>
                          <p className="text-[8.5px] font-medium text-muted line-clamp-2">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              if (block.type === 'video') {
                return (
                  <div key={block.id} className="space-y-1 rounded-xl border border-border/80 bg-white/80 p-2">
                    <p className="text-[10px] font-black uppercase text-brand-800">🎬 Video bài giảng:</p>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black/5">
                      <LectureVideo title={card.title} url={card.videoUrl || ''} />
                    </div>
                  </div>
                )
              }

              if (block.type === 'versus-ab') {
                return (
                  <div key={block.id} className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                    <div className="rounded-xl border border-rose-200 bg-white p-2 text-center">
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-800">
                        {card.optionLabels?.[0] || 'Tranh A: Zico'}
                      </span>
                      {card.optionDescs?.[0] && (
                        <p className="mt-0.5 text-[9px] text-muted line-clamp-1">{card.optionDescs[0]}</p>
                      )}
                      {card.optionImages?.[0] ? (
                        <img src={card.optionImages[0]} alt="Tranh A" className="mt-1.5 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="mt-1.5 aspect-video rounded-lg bg-rose-50 grid place-items-center text-[10px] font-bold text-rose-700">🎨 Minh họa mặc định</div>
                      )}
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-white p-2 text-center">
                      <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-black text-sky-800">
                        {card.optionLabels?.[1] || 'Tranh B: Sonet'}
                      </span>
                      {card.optionDescs?.[1] && (
                        <p className="mt-0.5 text-[9px] text-muted line-clamp-1">{card.optionDescs[1]}</p>
                      )}
                      {card.optionImages?.[1] ? (
                        <img src={card.optionImages[1]} alt="Tranh B" className="mt-1.5 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="mt-1.5 aspect-video rounded-lg bg-sky-50 grid place-items-center text-[10px] font-bold text-sky-700">🎨 Minh họa mặc định</div>
                      )}
                    </div>
                  </div>
                )
              }

              if (block.type === 'dialogue') {
                const lines = card.dialogueLines || []
                return (
                  <div key={block.id} className="space-y-2 rounded-xl border border-border/80 bg-white/80 p-2.5">
                    <p className="text-[10px] font-black uppercase text-brand-800">💬 Kịch bản Comic ({lines.length} câu)</p>
                    <div className="space-y-1.5">
                      {lines.map((line) => (
                        <div key={line.id} className="flex items-start gap-2 text-xs">
                          <span className="shrink-0 rounded-md bg-brand-100 px-1.5 py-0.5 font-black text-brand-800">
                            {line.speaker}
                          </span>
                          <p className="flex-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-text">
                            {line.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              if (block.type === 'compare') {
                return (
                  <div key={block.id} className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                    <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                      <span className="text-[10px] font-black text-slate-800">
                        🤖 {card.compareData?.leftTitle || 'Trợ lý AI'}
                      </span>
                      {card.compareData?.leftText && (
                        <p className="mt-0.5 text-[9px] text-muted line-clamp-2">{card.compareData.leftText}</p>
                      )}
                      {(card.compareData?.leftImage || card.compareImages?.left) ? (
                        <img src={card.compareData?.leftImage || card.compareImages?.left} alt="Cột trái" className="mt-1.5 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="mt-1.5 aspect-video rounded-lg bg-slate-100 grid place-items-center text-[10px] font-bold text-slate-600">📁 Đồ họa sẵn sàng</div>
                      )}
                    </div>
                    <div className="rounded-xl border border-brand-200 bg-white p-2 text-center">
                      <span className="text-[10px] font-black text-brand-800">
                        🧠 {card.compareData?.rightTitle || 'Não sáng tạo con'}
                      </span>
                      {card.compareData?.rightText && (
                        <p className="mt-0.5 text-[9px] text-brand-900 line-clamp-2">{card.compareData.rightText}</p>
                      )}
                      {(card.compareData?.rightImage || card.compareImages?.right) ? (
                        <img src={card.compareData?.rightImage || card.compareImages?.right} alt="Cột phải" className="mt-1.5 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="mt-1.5 aspect-video rounded-lg bg-brand-50 grid place-items-center text-[10px] font-bold text-brand-700">💡 Đồ họa sẵn sàng</div>
                      )}
                    </div>
                  </div>
                )
              }

              if (block.type === 'poster') {
                return (
                  <div key={block.id} className="rounded-xl border-2 border-yellow-300 bg-yellow-50/90 p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-wider text-yellow-800">📜 Poster Quy Tắc Vàng</p>
                    <p className="mt-1 font-display text-sm font-black text-yellow-950 uppercase">{card.body || 'HÃY LUÔN TỰ TAY THÊM Ý TƯỞNG CỦA RIÊNG MÌNH!'}</p>
                    {card.tip && (
                      <p className="mt-1.5 text-xs font-bold text-yellow-900">💡 {card.tip}</p>
                    )}
                    {card.imageUrl && (
                      <img src={card.imageUrl} alt="Poster" className="mt-2 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    )}
                  </div>
                )
              }

              if (block.type === 'images') {
                const heroImage = block.imageUrl || card.imageUrl
                const additionalImgs = block.additionalImages || card.additionalImages || []

                return (
                  <div key={block.id} className="space-y-3">
                    {/* Ảnh chính Hero Image to bản */}
                    {heroImage && (
                      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-2 group/art">
                        <img
                          src={heroImage}
                          alt={block.imageAlt || card.imageAlt || block.title || card.title || 'Ảnh chính chặng'}
                          className="w-full max-h-[280px] object-contain rounded-xl mx-auto transition-transform duration-300 group-hover/art:scale-101"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => setZoomedImage({
                            url: heroImage,
                            title: block.title || card.title || `Ảnh chính Chặng ${stageIndex + 1}`,
                          })}
                          className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-xs transition hover:bg-black/90 cursor-pointer shadow-xs"
                          title="Phóng to xem ảnh"
                        >
                          <ZoomIn size={12} />
                          <span>🔍 Xem to</span>
                        </button>
                      </div>
                    )}

                    {/* Danh sách ảnh minh họa bổ sung */}
                    {additionalImgs.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase text-brand-800">
                          📷 Ảnh minh họa bổ sung ({additionalImgs.length}):
                        </p>
                        <div className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                          {additionalImgs.map((imgItem, imgIdx) => (
                            <div key={imgItem.id || imgIdx} className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-white/95 p-1 text-center shadow-2xs">
                              {imgItem.url ? (
                                <>
                                  <img
                                    src={imgItem.url}
                                    alt={imgItem.caption || `Ảnh ${imgIdx + 1}`}
                                    className="aspect-video w-full rounded-lg object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setZoomedImage({
                                      url: imgItem.url,
                                      title: imgItem.caption || `Ảnh minh họa ${imgIdx + 1}`,
                                    })}
                                    className="absolute bottom-2 right-2 rounded-full bg-black/70 p-1 text-white hover:bg-black/90 cursor-pointer"
                                    title="Phóng to"
                                  >
                                    <ZoomIn size={10} />
                                  </button>
                                </>
                              ) : (
                                <div className="aspect-video rounded-lg bg-emerald-50 grid place-items-center text-[10px] font-bold text-emerald-700">Chưa có ảnh</div>
                              )}
                              {imgItem.caption && (
                                <p className="mt-1 text-[9px] font-bold text-slate-700 line-clamp-1">{imgItem.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              if (block.type === 'voice') {
                return (
                  <div key={block.id} className="flex items-center gap-3 rounded-2xl border-2 border-sky-300 bg-sky-50/90 p-3 shadow-2xs">
                    <AikidCatCharacter
                      pose={card.mee?.gesture === 'think' ? 'thinking' : card.mee?.gesture === 'celebrate' ? 'celebrate' : 'guide'}
                      gesture={card.mee?.gesture ?? 'presentation'}
                      isSpeaking={false}
                      animated={true}
                      className="h-14 w-14 shrink-0 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-extrabold uppercase text-sky-800">Mèo AIKI nói:</p>
                      <p className="mt-0.5 line-clamp-3 text-xs font-semibold text-sky-950 italic">
                        &quot;{card.mee?.readText?.trim() || card.body?.trim() || 'Chào các bạn nhỏ!'}&quot;
                      </p>
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>
        )}
      </article>
    )
  }

  return (
    <aside className="ui-card min-w-0 h-fit overflow-hidden p-4 lg:sticky lg:top-4" aria-label={`Xem trước ${stageName} trên màn học sinh`}>
      {/* Header Preview với Viewport Selector */}
      {!hideHeaderToolbar && (
        <div className="flex flex-col gap-2 pb-2.5 border-b border-border/80">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-sky-700">
              <Eye size={15} /> Xem trước học sinh (10 Quy Tắc)
            </p>
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-black text-brand-800">
              Chặng {stageIndex + 1}/5
            </span>
          </div>

          {/* Thanh công cụ Viewport Selector trên header preview */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 text-[10.5px]">
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                  activeViewport === 'mobile' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                )}
                title="Xem dạng Mobile (375px)"
              >
                <Smartphone size={12} />
                <span>Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                  activeViewport === 'tablet' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                )}
                title="Xem dạng iPad (768px)"
              >
                <Tablet size={12} />
                <span>iPad</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('pc')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                  activeViewport === 'pc' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                )}
                title="Xem dạng PC (1024px+)"
              >
                <Monitor size={12} />
                <span>PC</span>
              </button>
            </div>

            {/* Nút nổi bật: ⛶ Toàn màn hình */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-brand-600 hover:from-sky-700 hover:to-brand-700 text-white px-2.5 py-1 text-[10.5px] font-black shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
              title="Phóng to toàn màn hình (Fullscreen Modal)"
            >
              <Maximize2 size={13} />
              <span>Toàn màn hình</span>
            </button>
            {onCollapse && !hideHeaderToolbar && (
              <button
                type="button"
                onClick={onCollapse}
                className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-[10.5px] font-bold transition cursor-pointer shrink-0"
                title="Thu gọn cột xem trước"
              >
                <PanelRightClose size={12} />
                <span>Thu gọn</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nội dung xem trước Inline */}
      <div className={cn(
        hideHeaderToolbar
          ? "w-full transition-all text-left"
          : cn(
              "mt-3 transition-all",
              activeViewport === 'mobile' && "max-w-[385px] mx-auto preview-viewport-mobile",
              activeViewport === 'tablet' && "w-full overflow-x-auto",
              activeViewport === 'pc' && "w-full overflow-x-auto"
            )
      )}>
        {renderAikiStageContent(false, activeViewport)}
      </div>

      {/* Chế độ Xem Trước Toàn Màn Hình (Fullscreen Modal Preview) */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-slate-900/25 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={`Xem trước toàn màn hình: ${stageName}`}
        >
          {/* Thanh điều khiển trên cùng (Header Modal nền trắng Soft Clay) */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-white/95 px-4 sm:px-6 text-slate-900 shadow-2xs z-10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200 shrink-0">
                <Eye size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-slate-900 truncate flex items-center gap-2">
                  <span>👁️ Xem Trước Trải Nghiệm Học Sinh:</span>
                  <span className="text-brand-600 truncate">{stageName}</span>
                </h2>
                <span className="text-[11px] font-medium text-slate-500 block truncate">
                  Mười Quy Tắc Vàng · Chặng {stageIndex + 1}/5
                </span>
              </div>
            </div>

            {/* Bộ nút chuyển kích thước xem thử */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                  activeViewport === 'mobile'
                    ? "bg-brand-500 text-white font-black shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                )}
                title="Xem trước màn hình Điện thoại (375px)"
              >
                <Smartphone size={14} />
                <span className="hidden md:inline">📱 Điện thoại 375px</span>
                <span className="md:hidden">375px</span>
              </button>

              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                  activeViewport === 'tablet'
                    ? "bg-brand-500 text-white font-black shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                )}
                title="Xem trước màn hình iPad / Máy tính bảng (768px)"
              >
                <Tablet size={14} />
                <span className="hidden md:inline">📱 iPad / Tablet 768px</span>
                <span className="md:hidden">768px</span>
              </button>

              <button
                type="button"
                onClick={() => setViewport('pc')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                  activeViewport === 'pc'
                    ? "bg-brand-500 text-white font-black shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                )}
                title="Xem trước màn hình Máy tính PC (1200px)"
              >
                <Monitor size={14} />
                <span className="hidden md:inline">💻 Máy tính PC 1200px</span>
                <span className="md:hidden">1200px</span>
              </button>

              <button
                type="button"
                onClick={() => setViewport('full')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                  activeViewport === 'full'
                    ? "bg-brand-500 text-white font-black shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                )}
                title="Xem trước màn hình Tràn viền (100%)"
              >
                <Maximize2 size={14} />
                <span className="hidden md:inline">🖥️ Full màn hình 100%</span>
                <span className="md:hidden">100%</span>
              </button>
            </div>

            {/* Nút đóng Esc */}
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 text-xs border border-slate-200 transition cursor-pointer shadow-xs shrink-0"
              title="Đóng chế độ xem trước (Esc)"
            >
              <X size={15} />
              <span className="hidden sm:inline">✕ Đóng (Esc)</span>
            </button>
          </header>

          {/* Vùng chứa nội dung xem trước (Canvas area) */}
          <div className="flex-1 bg-slate-100/70 p-4 sm:p-6 overflow-y-auto flex justify-center items-start">
            {activeViewport === 'mobile' ? (
              <div className="w-[375px] max-w-full rounded-[2.5rem] border-[6px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col shrink-0 my-auto sm:my-0 preview-viewport-mobile">
                {/* Tai thỏ / rãnh loa thoại */}
                <div className="h-5 flex justify-center items-center py-1 bg-slate-100 border-b border-slate-200 shrink-0">
                  <div className="w-16 h-1 rounded-full bg-slate-300" />
                </div>
                {/* Vùng xem trước bên trong điện thoại có scroll */}
                <div className="overflow-y-auto max-h-[75vh] p-3 text-left">
                  {renderAikiStageContent(true, activeViewport)}
                </div>
              </div>
            ) : activeViewport === 'tablet' ? (
              <div className="w-[768px] max-w-full rounded-2xl border-4 border-slate-300 bg-white shadow-xl overflow-hidden p-4 shrink-0">
                {renderAikiStageContent(true, activeViewport)}
              </div>
            ) : (
              <div className={cn(
                "w-full rounded-2xl border-2 border-slate-200 bg-white shadow-lg p-6 shrink-0",
                activeViewport === 'full' ? "max-w-[1600px]" : "max-w-[1240px]"
              )}>
                {renderAikiStageContent(true, activeViewport)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal phóng to ảnh */}
      {zoomedImage && (
        <AdventureModal
          open={!!zoomedImage}
          onClose={() => setZoomedImage(null)}
          title={zoomedImage.title || 'Chi tiết ảnh'}
        >
          <img src={zoomedImage.url} alt="Chi tiết" className="w-full h-auto rounded-xl" />
        </AdventureModal>
      )}
    </aside>
  )
})

export function practiceKindLabel(kind: string) {
  return PRACTICE_OPTIONS.find((option) => option.id === kind)?.label ?? 'Kiểu thực hành cũ'
}

export function PracticeKindPreview({ draft, compact = false }: { draft: LectureDraft; compact?: boolean }) {
  const orderingCards = goalLines(draft.practiceConfigText).map((line, index) => {
    const [title, ...description] = line.split('|')
    return { title: title?.trim() || `Bước ${index + 1}`, description: description.join('|').trim() }
  })
  const shell = 'rounded-2xl border-2 border-mint-200 bg-white p-4 shadow-sm'
  const input = 'min-h-11 w-full rounded-xl border-2 border-border bg-page px-3 text-sm font-semibold text-muted'

  return (
    <section className="rounded-3xl border-2 border-mint-200 bg-mint-50 p-4" aria-label={`Xem trước kiểu thực hành ${practiceKindLabel(draft.practiceKind)}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mint-700">Học sinh sẽ thao tác</p>
          <h4 className="mt-1 font-display text-lg text-text">{practiceKindLabel(draft.practiceKind)}</h4>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-mint-800">Preview trực tiếp</span>
      </div>

      {draft.practiceKind === 'intro' && <div className={shell}>
        <p className="font-extrabold text-text">Nhiệm vụ làm quen</p>
        <p className="mt-2 text-sm font-semibold text-muted">{draft.practiceInstruction || 'Đọc nhiệm vụ ngắn và xác nhận con đã sẵn sàng.'}</p>
        <button type="button" disabled className="mt-4 min-h-11 rounded-xl bg-brand-600 px-5 font-extrabold text-white">Con đã sẵn sàng</button>
      </div>}

      {(draft.practiceKind === 'journal' || draft.practiceKind === 'reflect') && <div className={shell}>
        <p className="font-extrabold text-text">{draft.practiceKind === 'reflect' ? 'Con tự nhìn lại sản phẩm' : 'Sổ tay thực hành của con'}</p>
        <p className="mt-1 text-sm font-semibold text-muted">{draft.reflectionPrompt || 'Con quan sát được gì và vì sao con nghĩ như vậy?'}</p>
        <textarea readOnly className={`${input} mt-3 min-h-28 p-3`} placeholder="Con viết câu trả lời tại đây…" />
      </div>}

      {draft.practiceKind === 'sketch' && <div className={shell}>
        <p className="font-extrabold text-text">Bảng phác thảo</p>
        <div className="mt-3 grid min-h-40 place-items-center rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 text-center">
          <div><span className="text-4xl" aria-hidden="true">✏️</span><p className="mt-2 text-sm font-bold text-brand-700">Vẽ bằng bút, tẩy và chọn màu</p></div>
        </div>
      </div>}

      {draft.practiceKind === 'character' && <div className={shell}>
        <p className="font-extrabold text-text">Xưởng tạo nhân vật</p>
        <div className="mt-3 flex flex-wrap gap-2">{['🐱 Mèo', '🤖 Robot', '🦊 Cáo'].map((item) => <span key={item} className="rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-2 text-sm font-bold">{item}</span>)}</div>
        <div className="mt-2 flex flex-wrap gap-2">{['Tò mò', 'Can đảm', 'Vui tính'].map((item) => <span key={item} className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold">{item}</span>)}</div>
        <input readOnly className={`${input} mt-3`} placeholder="Biệt danh an toàn của nhân vật" />
      </div>}

      {draft.practiceKind === 'style' && <div className={shell}>
        <p className="font-extrabold text-text">So sánh và chọn phong cách</p>
        <div className="mt-3 grid grid-cols-3 gap-2">{['🖍️ Màu sáp', '🎨 Cắt giấy', '✒️ Nét mực'].map((item, index) => <div key={item} className={`rounded-xl border-2 p-3 text-center text-xs font-bold ${index === 0 ? 'border-brand-500 bg-brand-50' : 'border-border'}`}>{item}</div>)}</div>
      </div>}

      {draft.practiceKind === 'ai_pick' && <div className={shell}>
        <p className="font-extrabold text-text">Mô tả ý tưởng và chọn tham chiếu an toàn</p>
        <textarea readOnly className={`${input} mt-3 min-h-24 p-3`} placeholder="Con muốn tạo điều gì? Chi tiết quan trọng là gì?" />
        <div className="mt-3 grid grid-cols-3 gap-2">{['🖼️ Tư liệu 1', '🌈 Tư liệu 2', '🧩 Tư liệu 3'].map((item) => <div key={item} className="rounded-xl border-2 border-border bg-page p-3 text-center text-xs font-bold">{item}</div>)}</div>
      </div>}

      {draft.practiceKind === 'story' && <div className={shell}>
        <p className="font-extrabold text-text">Chọn ba nhịp của câu chuyện</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">{[['1', 'Mở đầu'], ['2', 'Sự cố'], ['3', 'Kết thúc']].map(([number, label]) => <div key={number} className="rounded-xl border-2 border-brand-200 bg-brand-50 p-3"><span className="text-xs font-extrabold text-brand-600">NHỊP {number}</span><p className="mt-1 text-sm font-bold">{label}</p><span className="mt-2 block rounded-lg bg-white px-2 py-2 text-xs text-muted">Chọn một thẻ…</span></div>)}</div>
      </div>}

      {draft.practiceKind === 'video' && <div className={shell}>
        <p className="font-extrabold text-text">Kế hoạch cảnh video</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">{['🎬 Cảnh mở', '🏃 Chuyển động', '✨ Cảnh kết'].map((item, index) => <div key={item} className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-sm font-bold"><span className="block text-xs text-sky-700">CẢNH {index + 1}</span>{item}<span className="mt-2 block text-xs font-semibold text-muted">Mô tả hành động…</span></div>)}</div>
      </div>}

      {draft.practiceKind === 'palette' && <div className={shell}>
        <p className="font-extrabold text-text">Chọn ba màu và giải thích thông điệp</p>
        <div className="mt-3 flex gap-3">{['#6d5dfc', '#ff7a90', '#43d6b3'].map((color) => <span key={color} className="size-12 rounded-2xl border-4 border-white shadow-sm" style={{ backgroundColor: color }} />)}</div>
        <textarea readOnly className={`${input} mt-3 min-h-20 p-3`} placeholder="Vì sao các màu này phù hợp với sản phẩm?" />
      </div>}

      {draft.practiceKind === 'ordering' && <div className={shell}>
        <p className="font-extrabold text-text">Kéo thả để sắp xếp đúng trình tự</p>
        <div className="mt-3 grid gap-2">{(orderingCards.length ? orderingCards : [{ title: 'Thẻ 1', description: 'Nhập ít nhất ba thẻ ở phần cấu hình.' }, { title: 'Thẻ 2', description: 'Các thẻ sẽ được đảo khi học sinh bắt đầu.' }, { title: 'Thẻ 3', description: 'Học sinh kéo thả về đúng thứ tự.' }]).slice(0, compact ? 3 : 6).map((card, index) => <div key={`${card.title}-${index}`} className="flex items-center gap-3 rounded-xl border-2 border-border bg-page px-3 py-2"><span className="text-lg text-muted">⠿</span><span className="grid size-7 place-items-center rounded-lg bg-brand-100 text-xs font-extrabold text-brand-700">{index + 1}</span><div><p className="text-sm font-extrabold">{card.title}</p>{card.description && <p className="text-xs font-semibold text-muted">{card.description}</p>}</div></div>)}</div>
      </div>}
    </section>
  )
}
