import React, { useState } from 'react'
import { Plus, Trash2, Layers } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { StageBlockItem, LearnCardDraft } from '../../lib/authoring'
import { StageBlockItemCard } from '../StageBlockItemCard'
import { UnifiedGoalBlockCard } from '../stage-block-editors'
import { AVAILABLE_MODULES, inputStyle, textareaStyle } from './lecture-drawer-constants'
import { QuickBlockPickerModal } from './QuickBlockPickerModal'

export interface StageBlocksCanvasProps {
  stageIndex: number
  card?: LearnCardDraft
  stageBlocks: StageBlockItem[]
  readOnly?: boolean
  stageInfo: { title: string; icon: React.ComponentType<any>; desc: string }
  isIslandCourse?: boolean
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
  courseId: string
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void
  isDragOver: boolean
  setIsDragOver: (over: boolean) => void
  draggingBlockIdx: number | null
  setDraggingBlockIdx: (idx: number | null) => void
  dragOverBlockIdx: number | null
  setDragOverBlockIdx: (idx: number | null) => void
  isTrashDragOver: boolean
  setIsTrashDragOver: (over: boolean) => void
  stageStarAllocation?: number[]
  onToggleStageStar?: (stageIndex: number) => void
}

/**
 * StageBlocksCanvas — Vùng canvas khối bài giảng phong cách WordPress Gutenberg / Notion.
 * Hỗ trợ kéo-thả, chèn khối một chạm (Quick Block Inserter) và bố cục dòng chảy trực quan.
 */
export function StageBlocksCanvas({
  stageIndex,
  card,
  stageBlocks,
  readOnly = false,
  stageInfo,
  isIslandCourse = false,
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
  courseId,
  showToast,
  isDragOver,
  setIsDragOver,
  draggingBlockIdx,
  setDraggingBlockIdx,
  dragOverBlockIdx,
  setDragOverBlockIdx,
  isTrashDragOver,
  setIsTrashDragOver,
  stageStarAllocation,
  onToggleStageStar,
}: StageBlocksCanvasProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [targetInsertIdx, setTargetInsertIdx] = useState<number | undefined>(undefined)

  const handleOpenPicker = (insertIdx?: number) => {
    if (readOnly) return
    setTargetInsertIdx(insertIdx)
    setPickerOpen(true)
  }

  const handleSelectBlockFromPicker = (blockId: string) => {
    handleAddModule(blockId, stageIndex, targetInsertIdx)
    setPickerOpen(false)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
        setIsDragOver(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragOver(false)
        const blockId = event.dataTransfer.getData('text/plain')
        if (blockId) handleAddModule(blockId, stageIndex)
      }}
      className={cn(
        'space-y-3 rounded-2xl border-2 border-dashed p-4 transition',
        isDragOver
          ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-200/50'
          : 'border-sky-200 bg-sky-50/40'
      )}
    >
      {/* Header Canvas */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-black text-sky-950 flex items-center gap-1.5">
            <Layers size={16} className="text-brand-600" />
            <span>Dòng chảy khối bài giảng (Block Stream)</span>
          </h4>
          <p className="text-xs font-semibold text-sky-800">
            Sắp xếp theo thứ tự học sinh học. Bấm <strong>+ Thêm khối</strong> hoặc kéo-thả để đổi vị trí.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!readOnly && (
            <button
              type="button"
              onClick={() => handleOpenPicker()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-500 hover:bg-brand-600 px-3 py-1.5 text-xs font-black text-white shadow-2xs transition cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Plus size={14} className="shrink-0" /> + Thêm khối
            </button>
          )}
          <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-black text-sky-800 shrink-0 whitespace-nowrap">
            {stageBlocks.length} block
          </span>
        </div>
      </div>

      {/* Trạng thái trống (Empty State) */}
      {stageBlocks.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-white p-6 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mx-auto text-xl shadow-2xs">
            🧩
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">Chặng này chưa có khối nội dung bổ sung</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Thêm các đoạn văn bản, hình ảnh, lời thoại hoặc bảng so sánh để bài học sinh động hơn.
            </p>
          </div>
          {!readOnly && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleOpenPicker()}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-5 text-xs font-black text-white shadow-clay-xs hover:scale-[1.02] active:scale-95 transition cursor-pointer"
              >
                <Plus size={15} /> Khám phá thư viện khối...
              </button>
            </div>
          )}
        </div>
      )}

      {/* Danh sách các block kèm In-between Inserters kiểu Gutenberg & Lưới Thẻ Phương Án */}
      {card &&
        (() => {
          type RenderGroup =
            | { type: 'unified-goal' }
            | { type: 'single'; block: StageBlockItem; index: number }
            | { type: 'confirm-options'; items: { block: StageBlockItem; index: number }[] }

          const renderGroups: RenderGroup[] = []

          // Hướng A: Gom Chặng 1 thành 1 Khối Mục Tiêu Hợp Nhất trong Block Stream
          if (stageIndex === 0) {
            const imageIdx = stageBlocks.findIndex((b) => b.type === 'images' || b.id.startsWith('course-goal-image'))
            const textIdx = stageBlocks.findIndex((b) => b.type === 'text' || b.id.startsWith('course-goal-text'))
            const keysIdx = stageBlocks.findIndex((b) => b.type === 'layout-four-keys' || b.id.startsWith('course-goal-four-keys'))

            if (imageIdx !== -1 || textIdx !== -1 || keysIdx !== -1) {
              const consumedIndices = new Set<number>()
              if (imageIdx !== -1) consumedIndices.add(imageIdx)
              if (textIdx !== -1) consumedIndices.add(textIdx)
              if (keysIdx !== -1) consumedIndices.add(keysIdx)

              renderGroups.push({ type: 'unified-goal' })

              for (let i = 0; i < stageBlocks.length; i++) {
                if (!consumedIndices.has(i)) {
                  renderGroups.push({ type: 'single', block: stageBlocks[i], index: i })
                }
              }
            }
          }

          if (renderGroups.length === 0) {
            for (let i = 0; i < stageBlocks.length; i++) {
              const b = stageBlocks[i]
              const isInteractiveBlock =
                b.type === 'quiz-question' ||
                Boolean(b.questionPrompt) ||
                Boolean(b.layoutMode) ||
                Boolean(b.questionOptions?.length) ||
                b.id.startsWith('course-quiz-') ||
                b.id.startsWith('blk-quiz-') ||
                b.id === 'course-confirm-quiz'

              const isOpt = !isInteractiveBlock && (b.type === 'layout-confirm-option' || b.id.startsWith('course-confirm-option-'))
              if (isOpt) {
                const lastGroup = renderGroups[renderGroups.length - 1]
                if (lastGroup && lastGroup.type === 'confirm-options') {
                  lastGroup.items.push({ block: b, index: i })
                } else {
                  renderGroups.push({ type: 'confirm-options', items: [{ block: b, index: i }] })
                }
              } else {
                renderGroups.push({ type: 'single', block: b, index: i })
              }
            }
          }

          return renderGroups.map((group, groupIndex) => {
            const renderItemCard = (item: { block: StageBlockItem; index: number }) => (
              <StageBlockItemCard
                key={item.block.id}
                block={item.block}
                bIdx={item.index}
                totalBlocks={stageBlocks.length}
                stageIndex={stageIndex}
                card={card}
                stageBlocks={stageBlocks}
                readOnly={readOnly}
                draggingBlockIdx={draggingBlockIdx}
                dragOverBlockIdx={dragOverBlockIdx}
                setDraggingBlockIdx={setDraggingBlockIdx}
                setDragOverBlockIdx={setDragOverBlockIdx}
                setIsTrashDragOver={setIsTrashDragOver}
                moveBlock={moveBlock}
                removeBlock={removeBlock}
                updateStageBlocks={updateStageBlocks}
                updateBlockItem={updateBlockItem}
                updateLearnCard={updateLearnCard}
                uploadingStageMedia={uploadingStageMedia}
                setUploadingStageMedia={setUploadingStageMedia}
                uploadLearnCardMedia={uploadLearnCardMedia}
                uploadAdditionalImageItem={uploadAdditionalImageItem}
                previewAikiVoice={previewAikiVoice}
                previewSpeakingIndex={previewSpeakingIndex}
                speakTextPreview={speakTextPreview ? (text) => speakTextPreview(text) : () => {}}
                courseId={courseId}
                handleAddModule={handleAddModule}
                stageInfo={stageInfo}
                inputStyle={inputStyle}
                textareaStyle={textareaStyle}
                showToast={showToast}
                stageStarAllocation={stageStarAllocation}
                onToggleStageStar={onToggleStageStar}
              />
            )

            if (group.type === 'unified-goal') {
              return (
                <UnifiedGoalBlockCard
                  key="unified-goal-block"
                  card={card}
                  stageBlocks={stageBlocks}
                  readOnly={readOnly}
                  updateBlockItem={updateBlockItem}
                  updateLearnCard={updateLearnCard}
                  uploadingStageMedia={uploadingStageMedia}
                  setUploadingStageMedia={setUploadingStageMedia}
                  uploadLearnCardMedia={uploadLearnCardMedia}
                  courseId={courseId}
                  inputStyle={inputStyle}
                  textareaStyle={textareaStyle}
                  showToast={showToast}
                />
              )
            }

            if (group.type === 'single') {
              const { block, index: blockIndex } = group
              return (
                <React.Fragment key={block.id}>
                  {/* Đường phân cách chèn khối ở giữa (In-between divider) */}
                  {groupIndex > 0 && !readOnly && (
                    <div className="relative group/divider py-0.5 flex items-center justify-center">
                      <div className="absolute inset-x-0 h-0.5 bg-transparent group-hover/divider:bg-brand-300 transition-colors" />
                      <button
                        type="button"
                        onClick={() => handleOpenPicker(blockIndex)}
                        className="relative z-10 size-6 rounded-full bg-white border-2 border-slate-200 text-slate-400 opacity-0 group-hover/divider:opacity-100 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 transition-all flex items-center justify-center shadow-xs cursor-pointer scale-90 hover:scale-110"
                        title="Chèn khối vào giữa vị trí này"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                  )}

                  <StageBlockItemCard
                    block={block}
                    bIdx={blockIndex}
                    totalBlocks={stageBlocks.length}
                    stageIndex={stageIndex}
                    card={card}
                    stageBlocks={stageBlocks}
                    readOnly={readOnly}
                    draggingBlockIdx={draggingBlockIdx}
                    dragOverBlockIdx={dragOverBlockIdx}
                    setDraggingBlockIdx={setDraggingBlockIdx}
                    setDragOverBlockIdx={setDragOverBlockIdx}
                    setIsTrashDragOver={setIsTrashDragOver}
                    moveBlock={moveBlock}
                    removeBlock={removeBlock}
                    updateStageBlocks={updateStageBlocks}
                    updateBlockItem={updateBlockItem}
                    updateLearnCard={updateLearnCard}
                    uploadingStageMedia={uploadingStageMedia}
                    setUploadingStageMedia={setUploadingStageMedia}
                    uploadLearnCardMedia={uploadLearnCardMedia}
                    uploadAdditionalImageItem={uploadAdditionalImageItem}
                    previewAikiVoice={previewAikiVoice}
                    previewSpeakingIndex={previewSpeakingIndex}
                    speakTextPreview={speakTextPreview ? (text) => speakTextPreview(text) : () => {}}
                    courseId={courseId}
                    handleAddModule={handleAddModule}
                    stageInfo={stageInfo}
                    inputStyle={inputStyle}
                    textareaStyle={textareaStyle}
                    showToast={showToast}
                    stageStarAllocation={stageStarAllocation}
                    onToggleStageStar={onToggleStageStar}
                  />
                </React.Fragment>
              )
            }

            // Group các phương án lựa chọn: hiển thị dạng lưới thẻ trực quan (Card Grid 2-3 cột)
            return (
              <div key={`confirm-group-${groupIndex}`} className="space-y-3 rounded-3xl border-2 border-emerald-200/80 bg-emerald-50/20 p-4 sm:p-5 shadow-clay-xs">
                <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs text-sm">
                      🔘
                    </span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                        Các Thẻ Phương Án Trả Lời ({group.items.length} thẻ — tích chọn thẻ đúng)
                      </h4>
                      <p className="text-[11px] font-semibold text-emerald-800">
                        Lưới thẻ trực quan WYSIWYG khớp 100% với giao diện màn hình học sinh
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white border border-emerald-200 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 shadow-2xs">
                    {group.items.length} phương án
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-stretch">
                  {group.items.map(({ block: itemBlock, index: itemIdx }) => (
                    <StageBlockItemCard
                      key={itemBlock.id}
                      block={itemBlock}
                      bIdx={itemIdx}
                      totalBlocks={stageBlocks.length}
                      stageIndex={stageIndex}
                      card={card}
                      stageBlocks={stageBlocks}
                      readOnly={readOnly}
                      draggingBlockIdx={draggingBlockIdx}
                      dragOverBlockIdx={dragOverBlockIdx}
                      setDraggingBlockIdx={setDraggingBlockIdx}
                      setDragOverBlockIdx={setDragOverBlockIdx}
                      setIsTrashDragOver={setIsTrashDragOver}
                      moveBlock={moveBlock}
                      removeBlock={removeBlock}
                      updateStageBlocks={updateStageBlocks}
                      updateBlockItem={updateBlockItem}
                      updateLearnCard={updateLearnCard}
                      uploadingStageMedia={uploadingStageMedia}
                      setUploadingStageMedia={setUploadingStageMedia}
                      uploadLearnCardMedia={uploadLearnCardMedia}
                      uploadAdditionalImageItem={uploadAdditionalImageItem}
                      previewAikiVoice={previewAikiVoice}
                      previewSpeakingIndex={previewSpeakingIndex}
                      speakTextPreview={speakTextPreview ? (text) => speakTextPreview(text) : () => {}}
                      courseId={courseId}
                      handleAddModule={handleAddModule}
                      stageInfo={stageInfo}
                      inputStyle={inputStyle}
                      textareaStyle={textareaStyle}
                      showToast={showToast}
                      stageStarAllocation={stageStarAllocation}
                      onToggleStageStar={onToggleStageStar}
                    />
                  ))}

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleAddModule('layout-confirm-option', stageIndex)}
                      className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-emerald-300 bg-white/70 p-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer group active:scale-95 shadow-2xs"
                    >
                      <span className="grid size-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform shadow-xs">
                        <Plus size={20} strokeWidth={2.5} />
                      </span>
                      <span className="text-xs font-black text-emerald-900">
                        Thêm Phương Án Lựa Chọn
                      </span>
                      <span className="text-[11px] font-medium text-emerald-600">
                        Hỗ trợ 2-4 phương án A/B/C/D
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        })()
      }

      {/* Vùng thả rác để xóa khối khi đang kéo */}
      {draggingBlockIdx !== null && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            if (!isTrashDragOver) setIsTrashDragOver(true)
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsTrashDragOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setIsTrashDragOver(false)
            if (draggingBlockIdx !== null && stageBlocks[draggingBlockIdx]) {
              removeBlock(stageIndex, stageBlocks[draggingBlockIdx].id)
              setDraggingBlockIdx(null)
            }
          }}
          className={cn(
            'flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 px-4 text-center transition-all animate-pulse',
            isTrashDragOver
              ? 'border-rose-500 bg-rose-100 text-rose-800 scale-[1.02] shadow-md ring-4 ring-rose-200'
              : 'border-rose-300 bg-rose-50/80 text-rose-700 hover:border-rose-400 hover:bg-rose-100/60'
          )}
        >
          <Trash2
            size={20}
            className={isTrashDragOver ? 'scale-125 transition-transform text-rose-600' : 'text-rose-500'}
          />
          <span className="text-sm font-extrabold">
            {isTrashDragOver ? 'Thả vào đây để xóa khối này ngay lập tức!' : 'Kéo khối thả vào đây để gỡ bỏ khỏi chặng'}
          </span>
        </div>
      )}

      {/* Thanh Quick-Add ở chân Canvas (kiểu WordPress Gutenberg Inserter) */}
      {!readOnly && stageBlocks.length > 0 && (
        <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-white/95 p-3.5 transition-all text-center space-y-2 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span>➕</span>
              <span>Chèn thêm khối vào bài học:</span>
            </span>
            <button
              type="button"
              onClick={() => handleOpenPicker()}
              className="text-xs font-black text-brand-600 hover:text-brand-800 underline decoration-brand-300 underline-offset-2 cursor-pointer"
            >
              Mở tất cả khối →
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {AVAILABLE_MODULES.slice(0, 5).map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleAddModule(mod.id, stageIndex)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-brand-900 transition cursor-pointer active:scale-95"
                title={mod.desc}
              >
                <Plus size={11} className="text-brand-600" />
                <span>{mod.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleOpenPicker()}
              className="flex items-center gap-1.5 rounded-xl border-2 border-brand-400 bg-brand-50 hover:bg-brand-100 px-3.5 py-1.5 text-xs font-black text-brand-800 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <Plus size={13} />
              <span>Thêm khối khác...</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal chọn khối nhanh kiểu WordPress */}
      <QuickBlockPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectBlock={handleSelectBlockFromPicker}
        insertPositionLabel={
          typeof targetInsertIdx === 'number'
            ? `Vị trí thứ ${targetInsertIdx + 1}`
            : 'Cuối chặng học'
        }
      />
    </div>
  )
}
