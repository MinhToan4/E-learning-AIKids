import React from 'react'
import {
  GripVertical, ArrowUp, ArrowDown, Trash2, ChevronDown, ChevronRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type {
  LearnCardDraft,
  ContentBlockType,
  StageBlockItem,
} from '../lib/authoring'
import {
  LECTURE_GESTURES,
  KEY_COLOR_PRESETS,
  LayoutBlocksEditor,
  VoiceBlockEditor,
  VersusAbBlockEditor,
  DialogueBlockEditor,
  CompareBlockEditor,
  PosterBlockEditor,
  ImagesBlockEditor,
} from './stage-block-editors'

export { LECTURE_GESTURES, KEY_COLOR_PRESETS }

export function getBlockIcon(type: ContentBlockType): string {
  switch (type) {
    case 'text':
    case 'layout-text':
      return '📖'
    case 'layout-callout':
      return '💡'
    case 'layout-formula':
      return '🔤'
    case 'layout-split':
      return '📰'
    case 'layout-grid':
      return '🍱'
    case 'layout-four-keys':
      return '🔑'
    case 'layout-confirm-option':
      return '🔘'
    case 'layout-storyboard':
      return '🎬'
    case 'voice':
      return '🐱'
    case 'video':
      return '🎬'
    case 'versus-ab':
      return '🖼️'
    case 'dialogue':
      return '💬'
    case 'compare':
      return '⚖️'
    case 'poster':
      return '📜'
    case 'images':
      return '📷'
    default:
      return '📦'
  }
}

export function getBlockTitle(type: ContentBlockType, customTitle?: string): string {
  switch (type) {
    case 'text':
    case 'layout-text':
      return customTitle || 'ĐOẠN VĂN BẢN'
    case 'layout-callout':
      return customTitle || 'HỘP GHI NHỚ NỔI BẬT'
    case 'layout-formula':
      return customTitle || 'CÔNG THỨC KATEX'
    case 'layout-split':
      return customTitle || '2 CỘT CHỮ + MEDIA'
    case 'layout-grid':
      return customTitle || 'LƯỚI Ô THẺ'
    case 'layout-four-keys':
      return customTitle || 'BỐ CỤC 4 CHÌA KHÓA'
    case 'layout-confirm-option':
      return customTitle || 'PHƯƠNG ÁN XÁC NHẬN MỤC TIÊU'
    case 'layout-storyboard':
      return customTitle || 'CHUỖI STORYBOARD'
    case 'voice':
      return 'GIỌNG ĐỌC & LỜI THOẠI HƯỚNG DẪN'
    case 'video':
      return 'VIDEO BÀI GIẢNG'
    case 'versus-ab':
      return '2 TRANH ĐỐI ĐẦU A/B'
    case 'dialogue':
      return 'KỊCH BẢN PHÂN VAI COMIC'
    case 'compare':
      return 'BẢNG SO SÁNH 2 CỘT'
    case 'poster':
      return 'POSTER QUY TẮC VÀNG'
    case 'images':
      return 'BỘ SƯU TẬP ẢNH MINH HỌA'
    default:
      return customTitle || 'KHỐI NỘI DUNG'
  }
}

export interface StageBlockItemCardProps {
  block: StageBlockItem
  bIdx: number
  totalBlocks: number
  stageIndex: number
  card: LearnCardDraft
  stageBlocks: StageBlockItem[]
  readOnly?: boolean
  draggingBlockIdx: number | null
  dragOverBlockIdx: number | null
  setDraggingBlockIdx: (idx: number | null) => void
  setDragOverBlockIdx: (idx: number | null) => void
  setIsTrashDragOver: (v: boolean) => void
  moveBlock: (stageIndex: number, blockIndex: number, direction: -1 | 1) => void
  removeBlock: (stageIndex: number, blockId: string) => void
  updateStageBlocks: (stageIndex: number, newBlocks: StageBlockItem[]) => void
  updateBlockItem: (stageIndex: number, blockId: string, patch: Partial<StageBlockItem>) => void
  updateLearnCard: (index: number, patch: Partial<LearnCardDraft>) => void
  uploadingStageMedia: string | null
  setUploadingStageMedia: (val: string | null) => void
  uploadLearnCardMedia: (stageIndex: number, field: any, file: File) => Promise<void>
  uploadAdditionalImageItem: (stageIndex: number, imgIndex: number, file: File) => Promise<void>
  previewAikiVoice: (index: number, text: string) => void
  previewSpeakingIndex: number | null
  speakTextPreview: (text: string) => void
  courseId: string
  handleAddModule: (blockId: string, explicitStageIndex?: number, insertIndex?: number) => void
  stageInfo: { title: string; icon: any; desc: string }
  inputStyle: React.CSSProperties
  textareaStyle: React.CSSProperties
  showToast: (msg: string, type?: any) => void
}

export const StageBlockItemCard = React.memo(function StageBlockItemCard({
  block,
  bIdx,
  totalBlocks,
  stageIndex,
  card,
  stageBlocks,
  readOnly,
  draggingBlockIdx,
  dragOverBlockIdx,
  setDraggingBlockIdx,
  setDragOverBlockIdx,
  setIsTrashDragOver,
  moveBlock,
  removeBlock,
  updateStageBlocks,
  updateBlockItem,
  updateLearnCard,
  uploadingStageMedia,
  setUploadingStageMedia,
  uploadLearnCardMedia,
  uploadAdditionalImageItem,
  previewAikiVoice,
  previewSpeakingIndex,
  speakTextPreview,
  courseId,
  handleAddModule,
  stageInfo,
  inputStyle,
  textareaStyle,
  showToast,
}: StageBlockItemCardProps) {
  const isDraggingThis = draggingBlockIdx === bIdx
  const isDragOverThis = dragOverBlockIdx === bIdx
  const [expanded, setExpanded] = React.useState(bIdx === 0)

  const isConfirmOption = block.type === 'layout-confirm-option' || block.id.startsWith('course-confirm-option-')
  const confirmOptionIndex = isConfirmOption
    ? stageBlocks
        .filter((b) => b.type === 'layout-confirm-option' || b.id.startsWith('course-confirm-option-'))
        .findIndex((b) => b.id === block.id)
    : -1
  const optionLetter = confirmOptionIndex >= 0 ? String.fromCharCode(65 + confirmOptionIndex) : ''

  return (
    <div
      draggable={!readOnly}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/stage-block-idx', String(bIdx))
        e.dataTransfer.effectAllowed = 'move'
        setDraggingBlockIdx(bIdx)
      }}
      onDragEnd={() => {
        setDraggingBlockIdx(null)
        setDragOverBlockIdx(null)
        setIsTrashDragOver(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (dragOverBlockIdx !== bIdx) setDragOverBlockIdx(bIdx)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          if (dragOverBlockIdx === bIdx) setDragOverBlockIdx(null)
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        const sourceIdxStr = e.dataTransfer.getData('text/stage-block-idx')
        if (sourceIdxStr !== '') {
          const sourceIdx = parseInt(sourceIdxStr, 10)
          if (!isNaN(sourceIdx) && sourceIdx !== bIdx) {
            const nextBlocks = [...stageBlocks]
            const [movedBlock] = nextBlocks.splice(sourceIdx, 1)
            nextBlocks.splice(bIdx, 0, movedBlock)
            updateStageBlocks(stageIndex, nextBlocks)
          }
        } else {
          const newModId = e.dataTransfer.getData('text/plain')
          if (newModId) {
            handleAddModule(newModId, stageIndex, bIdx)
          }
        }
        setDraggingBlockIdx(null)
        setDragOverBlockIdx(null)
      }}
      className={cn(
        "rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-150",
        isDragOverThis ? "border-brand-500 ring-4 ring-brand-200/60 scale-[1.01]" : "border-slate-200 hover:border-slate-300",
        isDraggingThis ? "opacity-40 scale-[0.99]" : "opacity-100"
      )}
    >
      {/* ── Thanh Header của thẻ khối ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          {!readOnly && (
            <span
              className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 select-none shrink-0"
              title="Kéo để đổi vị trí khối"
            >
              <GripVertical size={18} />
            </span>
          )}
          {isConfirmOption ? (
            <>
              <span className="rounded-lg bg-brand-100 text-brand-800 px-2.5 py-1 text-xs font-black shrink-0 whitespace-nowrap">
                Phương án {optionLetter || bIdx + 1}
              </span>
              <label
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer select-none border shrink-0 whitespace-nowrap",
                  block.isCorrect
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
                title="Chọn phương án này làm đáp án đúng"
              >
                <input
                  type="radio"
                  name={`course-confirm-correct-${stageIndex}`}
                  checked={Boolean(block.isCorrect)}
                  disabled={readOnly}
                  onChange={() => {
                    updateStageBlocks(stageIndex, stageBlocks.map((item) => ({
                      ...item,
                      isCorrect: (item.type === 'layout-confirm-option' || item.id.startsWith('course-confirm-option-'))
                        ? item.id === block.id
                        : item.isCorrect,
                    })))
                  }}
                  className="accent-emerald-600 size-3.5 cursor-pointer"
                />
                <span>{block.isCorrect ? '✅ Đáp án đúng' : '🔘 Đáp án đúng'}</span>
              </label>
              <span
                className="text-xs font-bold text-slate-700 truncate min-w-0 flex-1"
                title={block.title || `Bộ chìa khóa ${optionLetter}`}
              >
                {block.title || `Bộ chìa khóa ${optionLetter}`}
              </span>
            </>
          ) : (
            <>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700 shrink-0 whitespace-nowrap">
                Khối {bIdx + 1}
              </span>
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-base shrink-0">{getBlockIcon(block.type)}</span>
                <h4
                  className="text-xs font-black uppercase tracking-wider text-slate-900 truncate min-w-0 flex-1"
                  title={getBlockTitle(block.type, block.title)}
                >
                  {getBlockTitle(block.type, block.title)}
                </h4>
              </div>
            </>
          )}
        </div>

        {/* Bộ nút hành động */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 hover:bg-slate-100 shrink-0 whitespace-nowrap cursor-pointer transition active:scale-95"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
            {expanded ? 'Thu gọn' : 'Chỉnh sửa'}
          </button>
          {!readOnly && (
            <>
              <button
                type="button"
                disabled={bIdx === 0}
                onClick={() => moveBlock(stageIndex, bIdx, -1)}
                className="grid size-7 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Di chuyển lên trên"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                disabled={bIdx === totalBlocks - 1}
                onClick={() => moveBlock(stageIndex, bIdx, 1)}
                className="grid size-7 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Di chuyển xuống dưới"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(stageIndex, block.id)}
                className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-coral-600 hover:bg-coral-50 transition cursor-pointer ml-0.5 shrink-0 whitespace-nowrap"
                title="Xóa khối"
              >
                <Trash2 size={13} className="shrink-0" /> Xóa khối
              </button>
            </>
          )}
        </div>
      </div>

      {!expanded && (
        <p className="mt-2 truncate text-xs font-semibold text-slate-500">
          {isConfirmOption
            ? `${block.title || `Bộ chìa khóa ${optionLetter}`} — ${block.body || 'Chưa có mô tả'}${block.imageUrl ? ' (Đã có ảnh)' : ''}`
            : block.body || block.tip || block.readText || `${block.visualItems?.length || 0} mục nội dung`}
        </p>
      )}

      {expanded && (
        <>
          <LayoutBlocksEditor
            block={block}
            stageIndex={stageIndex}
            card={card}
            readOnly={readOnly}
            updateBlockItem={updateBlockItem}
            updateLearnCard={updateLearnCard}
            uploadingStageMedia={uploadingStageMedia}
            setUploadingStageMedia={setUploadingStageMedia}
            uploadLearnCardMedia={uploadLearnCardMedia}
            courseId={courseId}
            stageInfo={stageInfo}
            inputStyle={inputStyle}
            textareaStyle={textareaStyle}
            showToast={showToast}
            isConfirmOption={isConfirmOption}
            optionLetter={optionLetter}
          />

          {block.type === 'voice' && (
            <VoiceBlockEditor
              block={block}
              stageIndex={stageIndex}
              card={card}
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
              previewAikiVoice={previewAikiVoice}
              previewSpeakingIndex={previewSpeakingIndex}
            />
          )}

          {block.type === 'versus-ab' && (
            <VersusAbBlockEditor
              block={block}
              stageIndex={stageIndex}
              card={card}
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
          )}

          {block.type === 'dialogue' && (
            <DialogueBlockEditor
              block={block}
              stageIndex={stageIndex}
              card={card}
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
              speakTextPreview={speakTextPreview}
            />
          )}

          {block.type === 'compare' && (
            <CompareBlockEditor
              block={block}
              stageIndex={stageIndex}
              card={card}
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
          )}

          {block.type === 'poster' && (
            <PosterBlockEditor
              block={block}
              stageIndex={stageIndex}
              card={card}
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
          )}

          {block.type === 'images' && (
            <ImagesBlockEditor
              block={block}
              stageIndex={stageIndex}
              card={card}
              readOnly={readOnly}
              updateBlockItem={updateBlockItem}
              updateLearnCard={updateLearnCard}
              uploadingStageMedia={uploadingStageMedia}
              setUploadingStageMedia={setUploadingStageMedia}
              uploadLearnCardMedia={uploadLearnCardMedia}
              uploadAdditionalImageItem={uploadAdditionalImageItem}
              courseId={courseId}
              inputStyle={inputStyle}
              textareaStyle={textareaStyle}
              showToast={showToast}
            />
          )}
        </>
      )}
    </div>
  )
})
