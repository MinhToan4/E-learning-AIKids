import React, { useState, useEffect } from 'react'
import {
  Eye,
  Maximize2,
  Monitor,
  PanelRightClose,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import {
  type LearnCardDraft,
  type LessonFormat,
  STANDARD_RULE_3_STAGES,
  ISLAND_6_STAGE_NAMES,
} from '../../lib/authoring'
import { AIKI_STAGE_NAMES } from './lecture-drawer-constants'
import { cn } from '@/shared/lib/cn'
import { type LessonSixStageJourney } from '@/shared/lib/api'
import {
  type PreviewViewportMode,
  IslandStagePreviewContent,
  AikiStagePreviewContent,
  PracticeKindPreview,
  practiceKindLabel,
} from './stage-previews'

// Re-export để bảo toàn 100% backward compatibility cho các consumer
export type { PreviewViewportMode }
export { PracticeKindPreview, practiceKindLabel }

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
  const isIslandEffective = Boolean(
    isIsland ||
      lessonFormat === 'aiki-island-6steps' ||
      (card?.id && /^bai-\d+-\d+/i.test(card.id)),
  )

  const stageName = isIslandEffective || isRule3Steps
    ? isRule3Steps
      ? STANDARD_RULE_3_STAGES[stageIndex]?.title ?? `Bước ${stageIndex + 1}`
      : ISLAND_6_STAGE_NAMES[stageIndex] ?? `Chặng ${stageIndex + 1}`
    : AIKI_STAGE_NAMES[stageIndex] ?? `Chặng ${stageIndex + 1}`

  const maxStages = isRule3Steps ? 3 : isIslandEffective ? 6 : lessonFormat === 'aiki-rule-5steps' ? 5 : 6

  const renderContent = (isFs: boolean, vp: PreviewViewportMode) => {
    if ((isIslandEffective || isRule3Steps) && (sixStageJourney || card)) {
      return (
        <IslandStagePreviewContent
          card={card}
          stageCard={stageCard}
          stageIndex={stageIndex}
          isRule3Steps={isRule3Steps}
          sixStageJourney={sixStageJourney}
          viewport={vp}
          previewVideoSeekSec={previewVideoSeekSec}
          onSeekVideo={setPreviewVideoSeekSec}
          previewQuizQuestionIdx={previewQuizQuestionIdx}
          onSetActiveQuizQuestion={setPreviewQuizQuestionIdx}
          previewQuizAnswers={previewQuizAnswers}
          onSelectQuizAnswer={(qIdx, optIdx) => {
            setPreviewQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
            setPreviewCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
          }}
          previewCheckedQuestions={previewCheckedQuestions}
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
          previewConfirmOption={previewConfirmOption}
          onSelectConfirmOption={setPreviewConfirmOption}
          previewPracticePartIndex={previewPracticePartIndex}
          onPracticePartChange={setPreviewPracticePartIndex}
          onImageClick={setZoomedImage}
        />
      )
    }

    if (!card) return null

    return (
      <AikiStagePreviewContent
        card={card}
        stageIndex={stageIndex}
        viewport={vp}
        isFs={isFs}
        onImageClick={setZoomedImage}
      />
    )
  }

  if (!card && !sixStageJourney) return null

  return (
    <aside
      className="ui-card min-w-0 h-fit overflow-hidden p-4 lg:sticky lg:top-4"
      aria-label={`Xem trước ${stageName} trên màn học sinh`}
    >
      {/* Header Preview với Viewport Selector */}
      {!hideHeaderToolbar && (
        <div className="flex flex-col gap-2 pb-2.5 border-b border-border/80">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-sky-700">
              <Eye size={15} /> Xem trước học sinh
            </p>
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-black text-brand-800">
              Chặng {stageIndex + 1}/{maxStages}
            </span>
          </div>

          {/* Thanh công cụ Viewport Selector trên header preview */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 text-[10.5px]">
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer',
                  activeViewport === 'mobile'
                    ? 'bg-white text-brand-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900',
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
                  'flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer',
                  activeViewport === 'tablet'
                    ? 'bg-white text-brand-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900',
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
                  'flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer',
                  activeViewport === 'pc'
                    ? 'bg-white text-brand-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900',
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
      <div
        className={cn(
          hideHeaderToolbar
            ? 'w-full transition-all text-left'
            : cn(
                'mt-3 transition-all',
                activeViewport === 'mobile' &&
                  'max-w-[385px] mx-auto preview-viewport-mobile',
                activeViewport === 'tablet' && 'w-full overflow-x-auto',
                activeViewport === 'pc' && 'w-full overflow-x-auto',
              ),
        )}
      >
        {renderContent(false, activeViewport)}
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
                  <span>Xem trước học sinh:</span>
                  <span className="text-brand-600 truncate">{stageName}</span>
                </h2>
                <span className="text-[11px] font-medium text-slate-500 block truncate">
                  Chặng {stageIndex + 1}/{maxStages}
                </span>
              </div>
            </div>

            {/* Bộ nút chuyển kích thước xem thử */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer',
                  activeViewport === 'mobile'
                    ? 'bg-brand-500 text-white font-black shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold',
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
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer',
                  activeViewport === 'tablet'
                    ? 'bg-brand-500 text-white font-black shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold',
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
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer',
                  activeViewport === 'pc'
                    ? 'bg-brand-500 text-white font-black shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold',
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
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer',
                  activeViewport === 'full'
                    ? 'bg-brand-500 text-white font-black shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold',
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
                <div className="h-5 flex justify-center items-center py-1 bg-slate-100 border-b border-slate-200 shrink-0">
                  <div className="w-16 h-1 rounded-full bg-slate-300" />
                </div>
                <div className="overflow-y-auto max-h-[75vh] p-3 text-left">
                  {renderContent(true, activeViewport)}
                </div>
              </div>
            ) : activeViewport === 'tablet' ? (
              <div className="w-[768px] max-w-full rounded-2xl border-4 border-slate-300 bg-white shadow-xl overflow-hidden p-4 shrink-0">
                {renderContent(true, activeViewport)}
              </div>
            ) : (
              <div
                className={cn(
                  'w-full rounded-2xl border-2 border-slate-200 bg-white shadow-lg p-6 shrink-0',
                  activeViewport === 'full' ? 'max-w-[1600px]' : 'max-w-[1240px]',
                )}
              >
                {renderContent(true, activeViewport)}
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
          <img
            src={zoomedImage.url}
            alt="Chi tiết"
            className="w-full h-auto rounded-xl"
          />
        </AdventureModal>
      )}
    </aside>
  )
})
