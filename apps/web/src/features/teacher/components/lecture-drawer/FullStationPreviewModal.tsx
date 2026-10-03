import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Eye, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { StudentStagePreview } from './StudentStagePreview'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import { buildRuleSyntheticJourney } from './lecture-drawer-constants'
import {
  type LectureDraft,
  type LessonFormat,
  ISLAND_6_STAGE_NAMES,
  resolveCourseJourneyStages,
  createAikiRuleLearnCards,
  createAikiRule3StepsCards,
} from '../../lib/authoring'
import type { CurriculumGameConfig } from '@/features/lesson/lib/curriculum-game'

export interface FullStationPreviewModalProps {
  open: boolean
  onClose: () => void
  draft: LectureDraft
  lessonFormat: LessonFormat
  gameConfig?: CurriculumGameConfig
  isIslandCourse?: boolean
  initialStageIndex?: number
}

/**
 * CompactStationPreviewModal (FullStationPreviewModal) — Modal xem thử size nhỏ
 * chuẩn Soft-Clay phong cách khung thiết bị học sinh trên PC.
 */
export function FullStationPreviewModal({
  open,
  onClose,
  draft,
  lessonFormat,
  isIslandCourse,
  initialStageIndex = 0,
}: FullStationPreviewModalProps) {
  const [activeStage, setActiveStage] = useState<number>(initialStageIndex)

  // Đồng bộ activeStage khi mở modal với initialStageIndex được chỉ định
  useEffect(() => {
    if (open && typeof initialStageIndex === 'number') {
      setActiveStage(initialStageIndex)
    }
  }, [open, initialStageIndex])

  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const isIsland =
    Boolean(
      isIslandCourse ||
        draft.lessonFormat === 'aiki-island-6steps' ||
        lessonFormat === 'aiki-island-6steps' ||
        draft.sixStageJourney ||
        Boolean(draft?.id && /^bai-\d+-\d+/i.test(draft.id)),
    ) &&
    lessonFormat !== 'aiki-rule-3steps' &&
    lessonFormat !== 'aiki-rule-5steps'

  // Danh sách các chặng theo cấu trúc bài học
  const stagesList = useMemo(() => {
    if (isIsland) {
      const shortLabels = ['Mục tiêu', 'Khởi động', 'Video', 'Trắc nghiệm', 'Thực hành', 'Về đích']
      return ISLAND_6_STAGE_NAMES.map((name, index) => ({
        index,
        label: name,
        shortName: shortLabels[index] || name,
      }))
    }
    if (lessonFormat === 'aiki-rule-3steps') {
      return [
        { index: 0, label: 'Bài học', shortName: 'Bài học' },
        { index: 1, label: 'Kiểm tra', shortName: 'Kiểm tra' },
        { index: 2, label: 'Hoàn thành', shortName: 'Về đích' },
      ]
    }
    if (lessonFormat === 'aiki-rule-5steps') {
      return [
        { index: 0, label: 'Tình huống', shortName: 'Tình huống' },
        { index: 1, label: 'Câu đố', shortName: 'Câu đố' },
        { index: 2, label: 'Quy tắc', shortName: 'Quy tắc' },
        { index: 3, label: 'Giải thích', shortName: 'Giải thích' },
        { index: 4, label: 'Chốt', shortName: 'Chốt' },
      ]
    }
    const customStages = resolveCourseJourneyStages(
      undefined,
      lessonFormat,
      draft.customJourneyStages,
    )
    if (customStages.length > 0) {
      return customStages.map((s, index) => ({
        index,
        label: s.title || s.shortTitle || `Chặng ${index + 1}`,
        shortName: s.shortTitle || s.title || `${index + 1}`,
      }))
    }
    return ISLAND_6_STAGE_NAMES.map((name, index) => ({
      index,
      label: name,
      shortName: name,
    }))
  }, [isIsland, lessonFormat, draft.customJourneyStages])

  if (!open || typeof document === 'undefined') return null

  const safeActiveStage = Math.max(0, Math.min(stagesList.length - 1, activeStage))

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-3xl sm:max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border-2 border-brand-200/80 bg-white shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Xem trước học sinh"
      >
        {/* Header Modal */}
        <div className="border-b border-brand-100/80 bg-white shrink-0">
          {/* Hàng trên: Tiêu đề + Nút đóng men gốm */}
          <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 border border-brand-200/60 shadow-2xs">
                <Eye size={15} />
              </span>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span>Xem trước học sinh</span>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md border border-brand-200/60">
                    Màn hình trẻ
                  </span>
                </h4>
                <p className="text-[11px] font-semibold text-slate-500 truncate max-w-[260px] sm:max-w-[300px]">
                  {draft.title || 'Trạm học chưa có tên'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng xem trước"
              className="size-8 grid place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer shrink-0 shadow-2xs active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          {/* Hàng dưới: Thanh chọn nhanh 6 chặng */}
          <nav
            className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 px-3 py-2 bg-brand-50/50 border-t border-brand-100/60"
            aria-label="Chọn chặng xem trước"
          >
            {stagesList.map((stage) => {
              const isSelected = stage.index === safeActiveStage
              return (
                <button
                  key={stage.index}
                  type="button"
                  onClick={() => setActiveStage(stage.index)}
                  className={cn(
                    'inline-flex items-center justify-center gap-1 px-1.5 sm:px-2 py-1 rounded-xl text-[11px] font-black transition cursor-pointer shadow-2xs w-full min-w-0',
                    isSelected
                      ? 'bg-brand-600 text-white shadow-xs font-black'
                      : 'bg-white text-slate-600 hover:bg-brand-50 hover:text-brand-900 border border-slate-200/80 hover:border-brand-200',
                  )}
                >
                  <span
                    className={cn(
                      'size-4 rounded-full text-[10px] grid place-items-center font-black shrink-0',
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {stage.index + 1}
                  </span>
                  <span className="truncate">{stage.shortName}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Thân Modal: Device Sandbox */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/70">
          <div className="w-full max-w-[760px] mx-auto rounded-2xl border-2 border-slate-300/80 bg-white shadow-sm overflow-hidden p-3.5 sm:p-5">
            {isIsland ? (
              <StudentStagePreview
                stageIndex={safeActiveStage}
                isIsland={true}
                sixStageJourney={
                  draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)
                }
                stageCard={draft.learnCards?.[safeActiveStage]}
                card={draft.learnCards?.[safeActiveStage]}
                hideHeaderToolbar={true}
                lessonFormat={lessonFormat}
              />
            ) : (
              <StudentStagePreview
                card={
                  draft.learnCards?.[safeActiveStage] ??
                  (lessonFormat === 'aiki-rule-3steps'
                    ? createAikiRule3StepsCards()[safeActiveStage]
                    : createAikiRuleLearnCards()[safeActiveStage])
                }
                stageIndex={safeActiveStage}
                hideHeaderToolbar={true}
                lessonFormat={lessonFormat}
                sixStageJourney={buildRuleSyntheticJourney(draft)}
              />
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-200/80 bg-white shrink-0">
          <span className="text-[11px] font-bold text-slate-500">
            Chặng {safeActiveStage + 1}/{stagesList.length}: {stagesList[safeActiveStage]?.label}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
            >
              <X size={13} />
              <span>Đóng xem trước</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-brand-700 shadow-2xs transition cursor-pointer"
            >
              <span>Tiếp tục biên soạn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export const CompactStationPreviewModal = FullStationPreviewModal
