import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { StageBlockItem, LearnCardDraft } from '../../lib/authoring'
import { StageBlockItemCard } from '../StageBlockItemCard'
import { AVAILABLE_MODULES, inputStyle, textareaStyle } from './lecture-drawer-constants'

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
}

/**
 * StageBlocksCanvas — Vùng canvas kéo-thả các khối chức năng mở rộng cho từng chặng học.
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
}: StageBlocksCanvasProps) {
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-black text-sky-950">Canvas nội dung của chặng</h4>
          <p className="text-xs font-semibold text-sky-800">
            Kéo block từ thư viện, thả vào đúng vị trí và sắp xếp theo thứ tự học sinh sẽ học.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {stageIndex === 1 && isIslandCourse && !readOnly && (
            <button
              type="button"
              onClick={() => handleAddModule('layout-confirm-option', stageIndex)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-800 shadow-2xs hover:bg-brand-100 transition cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Plus size={14} className="shrink-0" /> + Thêm phương án
            </button>
          )}
          <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-black text-sky-800 shrink-0 whitespace-nowrap">
            {stageBlocks.length} block
          </span>
        </div>
      </div>

      {stageBlocks.length === 0 && (
        <div className="rounded-xl border border-dashed border-sky-300 bg-white p-5 text-center">
          <p className="text-sm font-bold text-slate-700">Chặng này chưa có block nội dung bổ sung.</p>
          {!readOnly && (
            <button
              type="button"
              onClick={() =>
                handleAddModule(
                  stageIndex === 1 && isIslandCourse
                    ? 'layout-confirm-option'
                    : stageIndex === 2
                    ? 'video'
                    : 'layout-text',
                  stageIndex
                )
              }
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-brand-300 bg-brand-50 px-4 text-xs font-black text-brand-800 hover:bg-brand-100 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus size={14} className="shrink-0" />{' '}
              {stageIndex === 1 && isIslandCourse ? 'Tạo phương án đầu tiên' : 'Tạo block đầu tiên'}
            </button>
          )}
        </div>
      )}

      {card &&
        stageBlocks.map((block, blockIndex) => (
          <StageBlockItemCard
            key={block.id}
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
          />
        ))}

      {stageIndex === 1 && isIslandCourse && !readOnly && stageBlocks.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => handleAddModule('layout-confirm-option', stageIndex)}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-brand-400 bg-white/90 px-5 py-3 text-xs font-black text-brand-800 hover:bg-brand-50 hover:border-brand-500 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> + Thêm phương án lựa chọn mới (A, B, C...)
          </button>
        </div>
      )}

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

      {/* Quick Add block bar */}
      {!readOnly && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            if (!isDragOver) setIsDragOver(true)
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            const blockId = e.dataTransfer.getData('text/plain')
            if (blockId) handleAddModule(blockId, stageIndex)
          }}
          className={cn(
            'rounded-2xl border-2 border-dashed p-4 transition-all duration-200 text-center',
            isDragOver
              ? 'border-brand-500 bg-brand-50/90 ring-4 ring-brand-300/40'
              : 'border-sky-200 bg-sky-50/50 hover:border-brand-300 hover:bg-sky-50/80'
          )}
        >
          <p className="text-xs font-bold text-sky-900">
            {isDragOver
              ? 'Thả để thêm khối vào cuối chặng'
              : 'Thêm khối vào chặng này (kéo từ menu trái hoặc bấm nhanh):'}
          </p>
          <div className="mt-2.5 flex flex-wrap justify-center gap-2">
            {AVAILABLE_MODULES.map((mod) => (
              <button
                key={mod.id}
                type="button"
                draggable={!readOnly}
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', mod.id)
                  event.dataTransfer.effectAllowed = 'copy'
                }}
                disabled={readOnly}
                onClick={() => handleAddModule(mod.id, stageIndex)}
                className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-black text-slate-800 shadow-2xs hover:border-brand-400 hover:bg-brand-50 transition cursor-pointer active:scale-95"
                title={mod.desc}
              >
                <Plus size={11} className="text-brand-600" />
                <span>{mod.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
