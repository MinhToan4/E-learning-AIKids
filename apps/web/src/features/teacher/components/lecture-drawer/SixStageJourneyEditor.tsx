import React from 'react'
import {
  Target,
  HelpCircle,
  Clapperboard,
  BrainCircuit,
  Palette,
  Trophy,
  Film,
  MessageCircleQuestion,
  Lightbulb,
  ScanSearch,
  Star,
  Eye,
} from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import { cn } from '@/shared/lib/cn'
import {
  ISLAND_6_STAGE_NAMES,
  AIKI_STAGE_NAMES,
  type Section,
  buildRuleSyntheticJourney,
} from './lecture-drawer-constants'
import {
  resolveCourseJourneyStages,
  getStageBlocks,
  createAikiRule3StepsCards,
  createAikiRuleLearnCards,
  type LectureDraft,
  type LessonFormat,
  type StageBlockItem,
  type LearnCardDraft,
} from '../../lib/authoring'
import { StudentStagePreview } from './StudentStagePreview'
import { StageBlocksCanvas } from './StageBlocksCanvas'
import {
  VideoBlockEditor,
  QuizBlockEditor,
  RewardBlockEditor,
} from './stage-editors'
import { DynamicStagesEditor } from './DynamicStagesEditor'

export interface SixStageJourneyEditorProps {
  draft: LectureDraft
  deferredDraft: LectureDraft
  updateSixStage: (updater: (prev: LessonSixStageJourney) => LessonSixStageJourney) => void
  stageIndex: number
  setStageIndex?: (idx: number) => void
  readOnly?: boolean
  courseId: string
  lessonFormat: LessonFormat
  isIslandCourse: boolean
  onSelectSection: (section: Section) => void
  onSave: () => void
  saving: boolean
  readiness: { complete: boolean; steps: Array<{ complete: boolean }> }
  showInlinePreview: boolean
  setShowInlinePreview: React.Dispatch<React.SetStateAction<boolean>>
  updateStageBlocks: (stageIndex: number, newBlocks: StageBlockItem[]) => void
  updateBlockItem: (stageIndex: number, blockId: string, blockPatch: Partial<StageBlockItem>) => void
  moveBlock: (stageIndex: number, blockIndex: number, direction: -1 | 1) => void
  removeBlock: (stageIndex: number, blockId: string) => void
  handleAddModule: (blockId: string, explicitStageIndex?: number, insertIndex?: number) => void
  uploadingStageMedia: string | null
  setUploadingStageMedia: (media: string | null) => void
  uploadLearnCardMedia: (
    index: number,
    field: 'videoUrl' | 'imageUrl' | 'audioUrl' | 'optionImageA' | 'optionImageB' | 'compareLeft' | 'compareRight',
    file: File
  ) => Promise<void>
  uploadAdditionalImageItem: (stageIndex: number, imgIndex: number, file: File) => Promise<void>
  previewAikiVoice: (index: number, text: string) => void
  previewSpeakingIndex: number | null
  speakTextPreview?: (text: string, title?: string) => void
  updateLearnCard: (index: number, patch: Partial<LearnCardDraft>) => void
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void
  isDragOver: boolean
  setIsDragOver: (over: boolean) => void
  draggingBlockIdx: number | null
  setDraggingBlockIdx: (idx: number | null) => void
  dragOverBlockIdx: number | null
  setDragOverBlockIdx: (idx: number | null) => void
  isTrashDragOver: boolean
  setIsTrashDragOver: (over: boolean) => void
}

/**
 * SixStageJourneyEditor — Bộ điều phối giao diện soạn thảo chặng học.
 * Nạp động các sub-editor: GoalBlockEditor, ConfirmBlockEditor, VideoBlockEditor, QuizBlockEditor, PracticeBlockEditor, RewardBlockEditor.
 */
export function SixStageJourneyEditor({
  draft,
  deferredDraft,
  updateSixStage,
  stageIndex,
  readOnly = false,
  courseId,
  lessonFormat,
  isIslandCourse,
  onSelectSection,
  onSave,
  saving,
  readiness,
  showInlinePreview,
  setShowInlinePreview,
  updateStageBlocks,
  updateBlockItem,
  moveBlock,
  removeBlock,
  handleAddModule,
  uploadingStageMedia,
  setUploadingStageMedia,
  uploadLearnCardMedia,
  uploadAdditionalImageItem,
  previewAikiVoice,
  previewSpeakingIndex,
  speakTextPreview,
  updateLearnCard,
  showToast,
  isDragOver,
  setIsDragOver,
  draggingBlockIdx,
  setDraggingBlockIdx,
  dragOverBlockIdx,
  setDragOverBlockIdx,
  isTrashDragOver,
  setIsTrashDragOver,
}: SixStageJourneyEditorProps) {
  // ── 1. ĐẢO AIKIDS 6 CHẶNG ──
  const hasCustom = Boolean(draft.customJourneyStages && draft.customJourneyStages.length >= 3)
  const isIsland6Steps = !hasCustom && (isIslandCourse || lessonFormat === 'aiki-island-6steps' || Boolean(draft.id && /^bai-\d+-\d+/i.test(draft.id))) && lessonFormat !== 'aiki-rule-3steps'
  if (isIsland6Steps) {
    const currentJourney = draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)
    const islandCard = draft.learnCards[stageIndex]
    const islandBlocks = islandCard ? getStageBlocks(islandCard, stageIndex) : []
    // Chặng 2 & Chặng 4 quản lý câu hỏi trực tiếp qua Block Stream Canvas
    const filteredIslandBlocks = islandBlocks

    const stageIcons = [Target, HelpCircle, Clapperboard, BrainCircuit, Palette, Trophy]
    const StageIcon = stageIcons[stageIndex] || Target

    return (
      <div
        className={cn(
          'w-full min-w-0 transition-all',
          showInlinePreview
            ? 'grid 2xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] grid-cols-1 items-start gap-5'
            : 'flex flex-col gap-4'
        )}
      >
        <div className="flex min-w-0 flex-col gap-4">
          {/* Header chặng 6 bước */}
          <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-xs">
                  <StageIcon size={20} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-brand-200 px-1.5 py-0.5 text-[10px] font-black text-brand-900 uppercase">
                      Chặng {stageIndex + 1}/6
                    </span>
                    <h3 className="font-display text-lg text-brand-950">
                      {ISLAND_6_STAGE_NAMES[stageIndex]}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-brand-800">
                    {stageIndex === 0 && 'Ảnh mục tiêu, mục tiêu cốt lõi và các thẻ nội dung hiển thị đúng như màn học sinh.'}
                    {stageIndex === 1 && '1 câu đố A/B xác nhận mục tiêu và mở khóa video bài học.'}
                    {stageIndex === 2 && 'Video bài giảng YouTube/MP4 và các mốc phân đoạn thời gian.'}
                    {stageIndex === 3 && 'Bộ câu hỏi trắc nghiệm kiểm tra kiến thức sau video.'}
                    {stageIndex === 4 && 'Kịch bản 4 bước thực hành trên Xưởng thực hành.'}
                    {stageIndex === 5 && 'Màn kết thúc chúc mừng, trao huy hiệu 3 sao, 50 XP và bài học tiếp.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('aikids:open-stage-preview', { detail: { stageIndex } }))
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-700 px-3 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer shrink-0"
                title="Xem trước chặng này trên màn hình học sinh"
              >
                <Eye size={13} />
                <span>Xem thử chặng</span>
              </button>
            </div>

            {/* Bộ chọn tặng sao cho chặng */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2.5 border-t border-brand-200/60">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => {
                    const currentAllocation = currentJourney.stageStarAllocation ?? [2, 3, 4]
                    const isAllocated = currentAllocation.includes(stageIndex)
                    if (isAllocated) {
                      // Hủy chọn
                      const next = currentAllocation.filter((idx) => idx !== stageIndex)
                      updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
                      showToast(`Đã bỏ tặng sao ở Chặng ${stageIndex + 1}`, 'info')
                    } else {
                      // Chọn thêm: tối đa 3 sao
                      if (currentAllocation.length >= 3) {
                        showToast(
                          `Bài học tối đa 3 Sao. Đang chọn ở Chặng ${currentAllocation.map((s) => s + 1).join(', ')}. Hãy bỏ bớt 1 chặng trước nhé!`,
                          'error'
                        )
                        return
                      }
                      const next = [...currentAllocation, stageIndex].sort((a, b) => a - b)
                      updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
                      showToast(`⭐ Chặng ${stageIndex + 1} sẽ trao 1 Sao cho bé khi hoàn thành!`, 'success')
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none active:scale-95 shadow-2xs',
                    (currentJourney.stageStarAllocation ?? [2, 3, 4]).includes(stageIndex)
                      ? 'bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-clay-xs font-black'
                      : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/60'
                  )}
                >
                  <Star
                    size={14}
                    className={cn(
                      (currentJourney.stageStarAllocation ?? [2, 3, 4]).includes(stageIndex)
                        ? 'fill-amber-950 text-amber-950'
                        : 'text-slate-400'
                    )}
                  />
                  <span>
                    {(currentJourney.stageStarAllocation ?? [2, 3, 4]).includes(stageIndex)
                      ? '⭐ Chặng này được tặng 1 Sao (+1)'
                      : '+ Bấm để tặng 1 Sao ở chặng này'}
                  </span>
                </button>

                <span className="text-[11px] font-bold text-brand-900 bg-brand-100/70 border border-brand-200 px-2.5 py-1 rounded-lg">
                  (Đã chọn {(currentJourney.stageStarAllocation ?? [2, 3, 4]).length}/3 Sao: Chặng {(currentJourney.stageStarAllocation ?? [2, 3, 4]).map((s) => s + 1).join(', ')})
                </span>
              </div>

              <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                Học sinh nhận tối đa 3 Sao cho toàn bài học
              </span>
            </div>
          </div>

          {/* Toàn bộ 6 chặng được quản lý trực tiếp và trọn vẹn trong StageBlocksCanvas bên dưới */}
          <StageBlocksCanvas
            stageIndex={stageIndex}
            card={islandCard}
            stageBlocks={filteredIslandBlocks}
            readOnly={readOnly}
            stageInfo={{ title: ISLAND_6_STAGE_NAMES[stageIndex], icon: Target, desc: 'Nội dung bổ sung của chặng' }}
            isIslandCourse={true}
            updateStageBlocks={updateStageBlocks}
            updateBlockItem={updateBlockItem}
            moveBlock={moveBlock}
            removeBlock={removeBlock}
            handleAddModule={handleAddModule}
            uploadingStageMedia={uploadingStageMedia}
            setUploadingStageMedia={setUploadingStageMedia}
            uploadLearnCardMedia={uploadLearnCardMedia}
            uploadAdditionalImageItem={uploadAdditionalImageItem}
            previewAikiVoice={previewAikiVoice}
            previewSpeakingIndex={previewSpeakingIndex}
            speakTextPreview={speakTextPreview}
            updateLearnCard={updateLearnCard}
            courseId={courseId}
            showToast={showToast}
            isDragOver={isDragOver}
            setIsDragOver={setIsDragOver}
            draggingBlockIdx={draggingBlockIdx}
            setDraggingBlockIdx={setDraggingBlockIdx}
            dragOverBlockIdx={dragOverBlockIdx}
            setDragOverBlockIdx={setDragOverBlockIdx}
            isTrashDragOver={isTrashDragOver}
            setIsTrashDragOver={setIsTrashDragOver}
            stageStarAllocation={currentJourney.stageStarAllocation ?? [2, 3, 4]}
            onToggleStageStar={(targetStageIdx) => {
              const currentAllocation = currentJourney.stageStarAllocation ?? [2, 3, 4]
              const isAllocated = currentAllocation.includes(targetStageIdx)
              if (isAllocated) {
                const next = currentAllocation.filter((idx) => idx !== targetStageIdx)
                updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
                showToast(`Đã bỏ tặng sao ở Chặng ${targetStageIdx + 1}`, 'info')
              } else {
                if (currentAllocation.length >= 3) {
                  showToast(
                    `Bài học tối đa 3 Sao. Đang chọn ở Chặng ${currentAllocation.map((s) => s + 1).join(', ')}. Hãy bỏ bớt 1 chặng trước nhé!`,
                    'error'
                  )
                  return
                }
                const next = [...currentAllocation, targetStageIdx].sort((a, b) => a - b)
                updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
                showToast(`⭐ Chặng ${targetStageIdx + 1} sẽ tặng 1 Sao khi hoàn thành!`, 'success')
              }
            }}
          />

          {/* Nút Điều hướng Chặng */}
          <div className="mt-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3 shadow-xs">
            {stageIndex > 0 ? (
              <button
                type="button"
                onClick={() => onSelectSection(`stage-${stageIndex - 1}` as Section)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap max-w-[48%] truncate"
              >
                Chặng trước: {ISLAND_6_STAGE_NAMES[stageIndex - 1]}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectSection('basics')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap max-w-[48%] truncate"
              >
                Thông tin trạm
              </button>
            )}

            {stageIndex < 5 ? (
              <button
                type="button"
                onClick={() => onSelectSection(`stage-${stageIndex + 1}` as Section)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap max-w-[50%] truncate"
              >
                Chặng tiếp theo: {ISLAND_6_STAGE_NAMES[stageIndex + 1]}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
                <span className="text-emerald-600 font-extrabold">✓ Đã đến chặng cuối (6/6)</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline text-slate-600 font-semibold">Nhấn &quot;Lưu trạm học&quot; ở thanh dưới để lưu</span>
              </div>
            )}
          </div>
        </div>

        {/* Live preview Đảo 6 chặng */}
        {showInlinePreview && (
          (() => {
            const deferredJourney =
              deferredDraft.sixStageJourney || resolveIslandSixStageJourney(deferredDraft as any)
            const deferredIslandCard = deferredDraft.learnCards[stageIndex]
            return (
              <StudentStagePreview
                stageIndex={stageIndex}
                isIsland={true}
                sixStageJourney={deferredJourney}
                stageCard={deferredIslandCard}
                onCollapse={() => setShowInlinePreview(false)}
              />
            )
          })()
        )}
      </div>
    )
  }

  // ── 2. AIKI RULE / CUSTOM STAGES (3 đến 7 chặng) ──
  const customStages = resolveCourseJourneyStages(courseId, lessonFormat, draft.customJourneyStages)
  const totalStages = customStages.length
  const defaultCards =
    lessonFormat === 'aiki-rule-3steps' ? createAikiRule3StepsCards() : createAikiRuleLearnCards()
  const card = draft.learnCards[stageIndex] ?? defaultCards[stageIndex]
  if (!card) return null
  const stageBlocks = getStageBlocks(card, stageIndex)

  const fallbackIcons = [Film, MessageCircleQuestion, Trophy, Clapperboard, BrainCircuit, Lightbulb, ScanSearch]
  const ruleStageInfo =
    lessonFormat === 'aiki-rule-3steps'
      ? [
          { title: '1. Bài học', icon: Film, desc: '1. 🎬 Rạp chiếu video bài học & kiến thức trọng tâm' },
          { title: '2. Kiểm tra', icon: MessageCircleQuestion, desc: '2. ⚡ Thử tài phản xạ (Trắc nghiệm củng cố quy tắc)' },
          { title: '3. Hoàn thành', icon: Trophy, desc: '3. 🏆 Vinh danh, trao huy hiệu & nhận sao hoàn thành' },
        ]
      : [
          { title: '1. Tình huống', icon: Clapperboard, desc: 'Mở đầu bằng câu chuyện/tình huống gần gũi kích thích sự tò mò.' },
          { title: '2. Câu đố AIKI', icon: BrainCircuit, desc: 'Thử thách trực giác: Trẻ quan sát 2 tranh vẽ A và B để chọn ra tranh độc nhất.' },
          { title: '3. Quy tắc', icon: Lightbulb, desc: 'Đúc kết bài học thành 1 quy tắc cốt lõi, dễ nhớ cho trẻ.' },
          { title: '4. Giải thích', icon: ScanSearch, desc: 'So sánh trực quan 2 mặt: Kho dữ liệu sao chép của AI vs Não sáng tạo của con.' },
          { title: '5. Chốt', icon: Trophy, desc: 'Tổng kết và trao huy hiệu/lời động viên tự hào cho bé.' },
        ]
  const stageDef = customStages[stageIndex]
  const stageInfo = stageDef
    ? {
        title: stageDef.title || `${stageDef.index + 1}. ${stageDef.shortTitle || stageDef.title}`,
        icon:
          stageDef.iconName === 'Film'
            ? Film
            : stageDef.iconName === 'MessageCircleQuestion'
            ? MessageCircleQuestion
            : stageDef.iconName === 'Trophy'
            ? Trophy
            : (lessonFormat === 'aiki-rule-3steps' && ruleStageInfo[stageIndex])
            ? ruleStageInfo[stageIndex]!.icon
            : fallbackIcons[stageIndex % fallbackIcons.length] ?? Lightbulb,
        desc: stageDef.desc || (lessonFormat === 'aiki-rule-3steps' && ruleStageInfo[stageIndex]?.desc) || card.tip || '',
      }
    : ruleStageInfo[stageIndex] ?? { title: card.title, icon: Lightbulb, desc: '' }
  const StageIcon = stageInfo.icon

  return (
    <div
      className={cn(
        'w-full min-w-0 transition-all',
        showInlinePreview
          ? 'grid 2xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] grid-cols-1 items-start gap-5'
          : 'flex flex-col gap-4'
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">
        {/* Header chặng */}
        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-xs">
                <StageIcon size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand-200 px-1.5 py-0.5 text-[10px] font-black text-brand-900 uppercase">
                    Chặng {stageIndex + 1}/{totalStages}
                  </span>
                  <h3 className="font-display text-lg text-brand-950">{stageInfo.title}</h3>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-brand-800">{stageInfo.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('aikids:open-stage-preview', { detail: { stageIndex } }))
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-700 px-3 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer shrink-0"
                title="Xem trước chặng này trên màn hình học sinh"
              >
                <Eye size={13} />
                <span>Xem thử chặng</span>
              </button>
              <span className="rounded-full bg-brand-100 border border-brand-200 px-2.5 py-1 text-[11px] font-black text-brand-900">
                {stageBlocks.length} khối nội dung
              </span>
            </div>
          </div>

          {/* Bộ chọn tặng sao cho chặng custom / quy tắc */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2.5 border-t border-brand-200/60">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={readOnly}
                onClick={() => {
                  const currentAllocation = draft.sixStageJourney?.stageStarAllocation ?? [2, 3, 4]
                  const isAllocated = currentAllocation.includes(stageIndex)
                  if (isAllocated) {
                    const next = currentAllocation.filter((idx) => idx !== stageIndex)
                    updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
                    showToast?.(`Đã bỏ tặng sao ở Chặng ${stageIndex + 1}`, 'info')
                  } else {
                    if (currentAllocation.length >= 3) {
                      showToast?.(
                        `Bài học tối đa 3 Sao. Đang chọn ở Chặng ${currentAllocation.map((s) => s + 1).join(', ')}. Hãy bỏ bớt 1 chặng trước nhé!`,
                        'error'
                      )
                      return
                    }
                    const next = [...currentAllocation, stageIndex].sort((a, b) => a - b)
                    updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
                    showToast?.(`⭐ Chặng ${stageIndex + 1} sẽ trao 1 Sao cho bé khi hoàn thành!`, 'success')
                  }
                }}
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none active:scale-95 shadow-2xs',
                  (draft.sixStageJourney?.stageStarAllocation ?? [2, 3, 4]).includes(stageIndex)
                    ? 'bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-clay-xs font-black'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/60'
                )}
              >
                <Star
                  size={14}
                  className={cn(
                    (draft.sixStageJourney?.stageStarAllocation ?? [2, 3, 4]).includes(stageIndex)
                      ? 'fill-amber-950 text-amber-950'
                      : 'text-slate-400'
                  )}
                />
                <span>
                  {(draft.sixStageJourney?.stageStarAllocation ?? [2, 3, 4]).includes(stageIndex)
                    ? '⭐ Chặng này được tặng 1 Sao (+1)'
                    : '+ Bấm để tặng 1 Sao ở chặng này'}
                </span>
              </button>

              <span className="text-[11px] font-bold text-brand-900 bg-brand-100/70 border border-brand-200 px-2.5 py-1 rounded-lg">
                (Đã chọn {(draft.sixStageJourney?.stageStarAllocation ?? [2, 3, 4]).length}/3 Sao: Chặng {(draft.sixStageJourney?.stageStarAllocation ?? [2, 3, 4]).map((s) => s + 1).join(', ')})
              </span>
            </div>

            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              Học sinh nhận tối đa 3 Sao cho toàn bài học
            </span>
          </div>
        </div>

        {/* Dynamic Stages Editor cho các chặng tùy biến (Custom Stages) */}
        {hasCustom && (
          <DynamicStagesEditor
            stageType={(stageDef as any)?.type || (stageIndex === 0 ? 'GOAL' : stageIndex === 1 ? 'CONFIRM' : stageIndex === 2 ? 'VIDEO' : stageIndex === 3 ? 'QUIZ' : stageIndex === 4 ? 'PRACTICE' : 'REWARD')}
            journey={draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)}
            updateSixStage={updateSixStage}
            readOnly={readOnly}
            questId={draft.id}
            previewAikiVoice={previewAikiVoice}
            showToast={showToast}
          />
        )}

        {/* Form soạn thảo Quy tắc AIKI 3 bước */}
        {lessonFormat === 'aiki-rule-3steps' && stageIndex === 0 && (
          <VideoBlockEditor
            video={
              (draft.sixStageJourney || buildRuleSyntheticJourney(draft)).stage3_video || {
                title: draft.title || card.title || 'Video bài học',
                videoUrl: draft.videoUrl || card.videoUrl || '',
                durationSec: 60,
                posterUrl: card.imageUrl || '',
                timestamps: [],
              }
            }
            onChange={(patch) =>
              updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, ...patch } }))
            }
            readOnly={readOnly}
            questId={draft.id}
            showToast={showToast}
          />
        )}

        {lessonFormat === 'aiki-rule-3steps' && stageIndex === 1 && (
          <QuizBlockEditor
            quiz={
              (draft.sixStageJourney || buildRuleSyntheticJourney(draft)).stage4_quiz || {
                title: `Thử tài phản xạ: ${draft.title || 'Quy tắc AIKI'}`,
                passScore: 1,
                questions: [],
              }
            }
            onChange={(patch) =>
              updateSixStage((j) => ({ ...j, stage4_quiz: { ...j.stage4_quiz, ...patch } }))
            }
            readOnly={readOnly}
            questId={draft.id}
            showToast={showToast}
          />
        )}

        {lessonFormat === 'aiki-rule-3steps' && stageIndex === 2 && (
          <RewardBlockEditor
            completion={
              (draft.sixStageJourney || buildRuleSyntheticJourney(draft)).stage6_completion || {
                title: 'Chúc mừng con đã hoàn thành bài học!',
                congratsMessage: 'Con đã nắm vững quy tắc sáng tạo này! Hãy tiếp tục phát huy nhé!',
                rewardBadge: {
                  name: draft.reward || 'Huy hiệu Sáng Tạo AIKI',
                  iconUrl: card.imageUrl || '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
                  stars: 3,
                  xp: 50,
                },
                nextLessonSlug: '',
              }
            }
            stage1ImageUrl={card.imageUrl}
            onChange={(patch) =>
              updateSixStage((j) => ({ ...j, stage6_completion: { ...j.stage6_completion, ...patch } }))
            }
            readOnly={readOnly}
            questId={draft.id}
            showToast={showToast}
          />
        )}

        {/* Canvas kéo thả khối nội dung */}
        <StageBlocksCanvas
          stageIndex={stageIndex}
          card={card}
          stageBlocks={stageBlocks}
          readOnly={readOnly}
          stageInfo={stageInfo}
          isIslandCourse={false}
          updateStageBlocks={updateStageBlocks}
          updateBlockItem={updateBlockItem}
          moveBlock={moveBlock}
          removeBlock={removeBlock}
          handleAddModule={handleAddModule}
          uploadingStageMedia={uploadingStageMedia}
          setUploadingStageMedia={setUploadingStageMedia}
          uploadLearnCardMedia={uploadLearnCardMedia}
          uploadAdditionalImageItem={uploadAdditionalImageItem}
          previewAikiVoice={previewAikiVoice}
          previewSpeakingIndex={previewSpeakingIndex}
          speakTextPreview={speakTextPreview}
          updateLearnCard={updateLearnCard}
          courseId={courseId}
          showToast={showToast}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          draggingBlockIdx={draggingBlockIdx}
          setDraggingBlockIdx={setDraggingBlockIdx}
          dragOverBlockIdx={dragOverBlockIdx}
          setDragOverBlockIdx={setDragOverBlockIdx}
          isTrashDragOver={isTrashDragOver}
          setIsTrashDragOver={setIsTrashDragOver}
        />

        {/* Nút Chặng trước & Chặng tiếp theo ở cuối màn hình */}
        <div className="mt-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3 shadow-xs">
          {stageIndex > 0 ? (
            <button
              type="button"
              onClick={() => onSelectSection(`stage-${stageIndex - 1}` as Section)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 shrink-0 whitespace-nowrap max-w-[48%] truncate cursor-pointer"
            >
              Chặng trước: {customStages[stageIndex - 1]?.shortTitle || AIKI_STAGE_NAMES[stageIndex - 1] || `Chặng ${stageIndex}`}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectSection('basics')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 shrink-0 whitespace-nowrap max-w-[48%] truncate cursor-pointer"
            >
              Thông tin trạm
            </button>
          )}

          {stageIndex < totalStages - 1 ? (
            <button
              type="button"
              onClick={() => onSelectSection(`stage-${stageIndex + 1}` as Section)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 shrink-0 whitespace-nowrap max-w-[50%] truncate cursor-pointer"
            >
              Chặng tiếp theo: {customStages[stageIndex + 1]?.shortTitle || AIKI_STAGE_NAMES[stageIndex + 1] || `Chặng ${stageIndex + 2}`}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
              <span className="text-emerald-600 font-extrabold">✓ Đã đến chặng cuối ({totalStages}/{totalStages})</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-600 font-semibold">Nhấn &quot;Lưu trạm học&quot; ở thanh dưới để lưu</span>
            </div>
          )}
        </div>
      </div>

      {/* Live preview */}
      {showInlinePreview && (
        (() => {
          const deferredCard = deferredDraft.learnCards[stageIndex] ?? card
          return (
            <StudentStagePreview
              card={deferredCard}
              stageIndex={stageIndex}
              onCollapse={() => setShowInlinePreview(false)}
              lessonFormat={lessonFormat}
              sixStageJourney={buildRuleSyntheticJourney(deferredDraft)}
            />
          )
        })()
      )}
    </div>
  )
}
