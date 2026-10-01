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
import { CollapsedPreviewRail } from './PracticeWorkflowStepsAccordion'
import { StageBlocksCanvas } from './StageBlocksCanvas'
import {
  GoalBlockEditor,
  ConfirmBlockEditor,
  VideoBlockEditor,
  QuizBlockEditor,
  PracticeBlockEditor,
  RewardBlockEditor,
} from './stage-editors'

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
  if (isIslandCourse && lessonFormat !== 'aiki-rule-3steps') {
    const currentJourney = draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)
    const islandCard = draft.learnCards[stageIndex]
    const islandBlocks = islandCard ? getStageBlocks(islandCard, stageIndex) : []

    const stageIcons = [Target, HelpCircle, Clapperboard, BrainCircuit, Palette, Trophy]
    const StageIcon = stageIcons[stageIndex] || Target

    return (
      <div
        className={cn(
          'grid min-w-0 items-start gap-5 transition-all',
          showInlinePreview
            ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]'
            : 'xl:grid-cols-[minmax(0,1fr)_56px]'
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
                      Chặng {stageIndex + 1}/6 · Đảo AIKids
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
                    {stageIndex === 4 && 'Kịch bản 4 bước thực hành trên Xưởng Sáng Tạo AI.'}
                    {stageIndex === 5 && 'Màn kết thúc chúc mừng, trao huy hiệu 3 sao, 50 XP và bài học tiếp.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bộ chọn tặng sao cho chặng */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-brand-200/60">
              <button
                type="button"
                disabled={readOnly}
                onClick={() => {
                  const currentAllocation = currentJourney.stageStarAllocation ?? [2, 3, 5]
                  const isAllocated = currentAllocation.includes(stageIndex)
                  if (isAllocated) {
                    // Hủy chọn
                    const next = currentAllocation.filter((idx) => idx !== stageIndex)
                    updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
                    showToast(`Đã bỏ tặng sao ở Chặng ${stageIndex + 1}`, 'info')
                  } else {
                    // Chọn thêm: kiểm tra tối đa 3 sao
                    if (currentAllocation.length >= 3) {
                      showToast('Bài học tối đa chỉ có 3 Sao! Con hãy bỏ chọn một chặng khác trước nhé.', 'error')
                      return
                    }
                    const next = [...currentAllocation, stageIndex].sort((a, b) => a - b)
                    updateSixStage((j) => ({ ...j, stageStarAllocation: next }))
                    showToast(`⭐ Chặng ${stageIndex + 1} sẽ tặng 1 Sao khi hoàn thành!`, 'success')
                  }
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none active:scale-95 shadow-2xs',
                  (currentJourney.stageStarAllocation ?? [2, 3, 5]).includes(stageIndex)
                    ? 'bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-clay-xs'
                    : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50/50'
                )}
              >
                <Star size={14} className={cn((currentJourney.stageStarAllocation ?? [2, 3, 5]).includes(stageIndex) ? 'fill-amber-950 text-amber-950' : 'text-slate-400')} />
                <span>
                  {(currentJourney.stageStarAllocation ?? [2, 3, 5]).includes(stageIndex) ? '⭐ Chặng này được tặng 1 Sao' : 'Chưa tặng sao ở chặng này'}
                </span>
              </button>
              <span className="text-[11px] font-bold text-brand-800">
                (Đã chọn {(currentJourney.stageStarAllocation ?? [2, 3, 5]).length}/3 Sao)
              </span>
            </div>
          </div>

          {/* Form nội dung từng chặng */}
          {stageIndex === 0 && (
            <GoalBlockEditor
              goal={currentJourney.stage1_goal}
              onChange={(patch) =>
                updateSixStage((j) => ({ ...j, stage1_goal: { ...j.stage1_goal, ...patch } }))
              }
              readOnly={readOnly}
              questId={draft.id}
              previewAikiVoice={previewAikiVoice}
              showToast={showToast}
            />
          )}

          {stageIndex === 1 && (
            <ConfirmBlockEditor
              confirmGoal={currentJourney.stage2_confirmGoal}
              onChange={(patch) =>
                updateSixStage((j) => ({ ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, ...patch } }))
              }
              readOnly={readOnly}
              questId={draft.id}
              showToast={showToast}
            />
          )}

          {stageIndex === 2 && (
            <VideoBlockEditor
              video={currentJourney.stage3_video}
              onChange={(patch) =>
                updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, ...patch } }))
              }
              readOnly={readOnly}
              questId={draft.id}
              showToast={showToast}
            />
          )}

          {stageIndex === 3 && (
            <QuizBlockEditor
              quiz={currentJourney.stage4_quiz}
              onChange={(patch) =>
                updateSixStage((j) => ({ ...j, stage4_quiz: { ...j.stage4_quiz, ...patch } }))
              }
              readOnly={readOnly}
              questId={draft.id}
              showToast={showToast}
            />
          )}

          {stageIndex === 4 && (
            <PracticeBlockEditor
              practice={currentJourney.stage5_practice}
              onChange={(patch) =>
                updateSixStage((j) => ({ ...j, stage5_practice: { ...j.stage5_practice, ...patch } }))
              }
              readOnly={readOnly}
              previewAikiVoice={previewAikiVoice}
              showToast={showToast}
            />
          )}

          {stageIndex === 5 && (
            <RewardBlockEditor
              completion={currentJourney.stage6_completion}
              stage1ImageUrl={currentJourney.stage1_goal.imageUrl}
              onChange={(patch) =>
                updateSixStage((j) => ({ ...j, stage6_completion: { ...j.stage6_completion, ...patch } }))
              }
              readOnly={readOnly}
              questId={draft.id}
              showToast={showToast}
            />
          )}

          {/* Canvas blocks kéo thả */}
          <StageBlocksCanvas
            stageIndex={stageIndex}
            card={islandCard}
            stageBlocks={islandBlocks}
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
          />

          {/* Nút Điều hướng Chặng */}
          <div className="mt-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3 shadow-xs">
            {stageIndex > 0 ? (
              <button
                type="button"
                onClick={() => onSelectSection(`stage-${stageIndex - 1}` as Section)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap max-w-[48%] truncate"
              >
                ← Chặng trước: {ISLAND_6_STAGE_NAMES[stageIndex - 1]}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectSection('basics')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap max-w-[48%] truncate"
              >
                ← Thông tin trạm
              </button>
            )}

            {stageIndex < 5 ? (
              <button
                type="button"
                onClick={() => onSelectSection(`stage-${stageIndex + 1}` as Section)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap max-w-[50%] truncate"
              >
                Chặng tiếp theo: {ISLAND_6_STAGE_NAMES[stageIndex + 1]} ➔
              </button>
            ) : (
              <button
                type="button"
                onClick={onSave}
                disabled={saving || !readiness.complete}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition active:scale-95 shrink-0 whitespace-nowrap max-w-[50%] truncate',
                  readiness.complete
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed opacity-70'
                )}
              >
                {saving ? 'Đang lưu...' : 'Hoàn thành & Lưu trạm học ➔'}
              </button>
            )}
          </div>
        </div>

        {/* Live preview Đảo 6 chặng */}
        {showInlinePreview ? (
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
        ) : (
          <CollapsedPreviewRail onExpand={() => setShowInlinePreview(true)} />
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
        'grid min-w-0 items-start gap-5 transition-all',
        showInlinePreview
          ? 'xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)]'
          : 'xl:grid-cols-[minmax(0,1fr)_56px]'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <span className="rounded-full bg-brand-100 border border-brand-200 px-2.5 py-1 text-[11px] font-black text-brand-900">
              {stageBlocks.length} khối nội dung
            </span>
          </div>
        </div>

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
              ← Chặng trước: {customStages[stageIndex - 1]?.shortTitle || AIKI_STAGE_NAMES[stageIndex - 1] || `Chặng ${stageIndex}`}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectSection('basics')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 shrink-0 whitespace-nowrap max-w-[48%] truncate cursor-pointer"
            >
              ← Thông tin trạm
            </button>
          )}

          {stageIndex < totalStages - 1 ? (
            <button
              type="button"
              onClick={() => onSelectSection(`stage-${stageIndex + 1}` as Section)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 shrink-0 whitespace-nowrap max-w-[50%] truncate cursor-pointer"
            >
              Chặng tiếp theo: {customStages[stageIndex + 1]?.shortTitle || AIKI_STAGE_NAMES[stageIndex + 1] || `Chặng ${stageIndex + 2}`} ➔
            </button>
          ) : (
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !readiness.complete}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition active:scale-95 shrink-0 whitespace-nowrap max-w-[50%] truncate',
                readiness.complete ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' : 'bg-slate-300 cursor-not-allowed opacity-70'
              )}
            >
              {saving ? 'Đang lưu...' : 'Hoàn thành & Lưu trạm học ➔'}
            </button>
          )}
        </div>
      </div>

      {/* Live preview */}
      {showInlinePreview ? (
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
      ) : (
        <CollapsedPreviewRail onExpand={() => setShowInlinePreview(true)} />
      )}
    </div>
  )
}
