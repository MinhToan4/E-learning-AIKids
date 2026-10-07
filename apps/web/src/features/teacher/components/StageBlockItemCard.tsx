import React from 'react'
import {
  GripVertical, ArrowUp, ArrowDown, Trash2, ChevronDown, ChevronRight, Plus,
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
  InteractiveQuestionBlockEditor,
} from './stage-block-editors'
import { VideoBlockEditor } from './lecture-drawer/stage-editors/VideoBlockEditor'
import { PracticeBlockEditor } from './lecture-drawer/stage-editors/PracticeBlockEditor'
import { RewardBlockEditor } from './lecture-drawer/stage-editors/RewardBlockEditor'

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
    case 'quiz-question':
      return '❓'
    case 'layout-storyboard':
      return '🎬'
    case 'voice':
      return '🐱'
    case 'video':
      return '🎬'
    case 'practice':
      return '🎨'
    case 'reward':
      return '🏆'
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


export function getBlockTitle(type: ContentBlockType, customTitle?: string, stageIndex?: number, blockId?: string): string {
  if (stageIndex === 0) {
    if (type === 'images' || blockId?.startsWith('course-goal-image')) return customTitle || 'ẢNH MỤC TIÊU'
    if (type === 'text' || blockId?.startsWith('course-goal-text')) return customTitle || 'MỤC TIÊU CỐT LÕI'
    if (type === 'layout-four-keys' || blockId?.startsWith('course-goal-four-keys')) return customTitle || 'BỐN CHIẾC CHÌA KHÓA VÀNG'
  }

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
      return customTitle || 'CÂU HỎI TRẮC NGHIỆM / XÁC NHẬN'
    case 'quiz-question':
      return customTitle || 'CÂU HỎI TRẮC NGHIỆM'
    case 'layout-storyboard':
      return customTitle || 'CHUỖI STORYBOARD'
    case 'voice':
      return 'GIỌNG ĐỌC & LỜI THOẠI HƯỚNG DẪN'
    case 'video':
      return 'VIDEO BÀI GIẢNG'
    case 'practice':
      return customTitle || 'KỊCH BẢN THỰC HÀNH AI STUDIO'
    case 'reward':
      return customTitle || 'MÀN KẾT THÚC & TRAO THƯỞNG'
    case 'versus-ab':
      return '2 TRANH ĐỐI ĐẦU A/B'
    case 'dialogue':
      return 'HỘI THOẠI TÌNH HUỐNG'
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
  stageStarAllocation?: number[]
  onToggleStageStar?: (stageIndex: number) => void
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
  stageStarAllocation,
  onToggleStageStar,
}: StageBlockItemCardProps) {
  const isDraggingThis = draggingBlockIdx === bIdx
  const isDragOverThis = dragOverBlockIdx === bIdx
  const [expanded, setExpanded] = React.useState(true)

  const isInteractiveQuestionBlock =
    block.type === 'quiz-question' ||
    Boolean(block.questionPrompt) ||
    Boolean(block.layoutMode) ||
    Boolean(block.questionOptions?.length) ||
    block.id.startsWith('blk-quiz-') ||
    (block.type === 'layout-confirm-option' && !block.id.startsWith('course-confirm-option-'))

  const isConfirmOption = !isInteractiveQuestionBlock && (block.type === 'layout-confirm-option' || block.id.startsWith('course-confirm-option-'))
  const confirmOptionIndex = isConfirmOption
    ? stageBlocks
        .filter((b) => !isInteractiveQuestionBlock && (b.type === 'layout-confirm-option' || b.id.startsWith('course-confirm-option-')))
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
        "rounded-3xl border-2 p-4 sm:p-5 shadow-clay-xs transition-all duration-150",
        isInteractiveQuestionBlock
          ? "border-sky-300 bg-sky-50/15 hover:border-sky-400"
          : isConfirmOption
            ? block.isCorrect
              ? "border-emerald-500 bg-emerald-50/25 ring-2 ring-emerald-300"
              : "border-slate-200 bg-white hover:border-emerald-300"
            : "border-slate-200 bg-white hover:border-brand-300",
        isDragOverThis ? "border-brand-500 ring-4 ring-brand-200/60 scale-[1.01]" : "",
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
          {isInteractiveQuestionBlock ? (
            <>
              <span className="rounded-xl bg-sky-600 text-white px-2.5 py-1 text-xs font-black shrink-0 whitespace-nowrap shadow-xs">
                Khối {bIdx + 1}
              </span>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="grid size-7 place-items-center rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-sm shrink-0 shadow-2xs">
                  ❓
                </span>
                <h4
                  className="text-xs font-black uppercase tracking-wider text-slate-900 truncate min-w-0 flex-1"
                  title={block.questionPrompt || block.title || 'CÂU HỎI TRẮC NGHIỆM'}
                >
                  {block.questionPrompt || block.title || 'CÂU HỎI TRẮC NGHIỆM / XÁC NHẬN'}
                </h4>
              </div>
            </>
          ) : isConfirmOption ? (
            <>
              <span className="rounded-xl bg-emerald-600 text-white px-3 py-1 text-xs font-black shrink-0 whitespace-nowrap shadow-xs">
                Phương án {optionLetter || bIdx + 1}
              </span>
              <label
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer select-none border shrink-0 whitespace-nowrap shadow-2xs",
                  block.isCorrect
                    ? "border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-200"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
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
                  className="accent-white size-3.5 cursor-pointer"
                />
                <span>{block.isCorrect ? '✓ Đáp án đúng' : '🔘 Đáp án đúng'}</span>
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
              <span className="rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-black text-slate-700 shrink-0 whitespace-nowrap">
                Khối {bIdx + 1}
              </span>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-sm shrink-0 shadow-2xs">
                  {getBlockIcon(block.type)}
                </span>
                <h4
                  className="text-xs font-black uppercase tracking-wider text-slate-900 truncate min-w-0 flex-1"
                  title={getBlockTitle(block.type, block.title, stageIndex, block.id)}
                >
                  {getBlockTitle(block.type, block.title, stageIndex, block.id)}
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
            className="inline-flex min-h-8 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-extrabold text-slate-700 hover:bg-slate-100 shrink-0 whitespace-nowrap cursor-pointer transition active:scale-95 shadow-2xs"
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
                className="grid size-8 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                title="Di chuyển lên trên"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                disabled={bIdx === totalBlocks - 1}
                onClick={() => moveBlock(stageIndex, bIdx, 1)}
                className="grid size-8 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                title="Di chuyển xuống dưới"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(stageIndex, block.id)}
                className="inline-flex min-h-8 items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700 hover:bg-rose-100 transition cursor-pointer ml-0.5 shrink-0 whitespace-nowrap shadow-2xs"
                title="Xóa khối"
              >
                <Trash2 size={13} className="shrink-0" /> Xóa khối
              </button>
            </>
          )}
        </div>
      </div>

      {!expanded && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5">
          {block.visualUrl || block.imageUrl ? (
            <img
              src={block.visualUrl || block.imageUrl}
              alt={block.title || 'Preview'}
              className="size-12 rounded-xl object-cover border border-slate-200 shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <span className="grid size-10 place-items-center rounded-xl bg-white border border-slate-200 text-slate-400 shrink-0 text-base">
              {getBlockIcon(block.type)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black text-slate-900">
              {isInteractiveQuestionBlock
                ? (Array.isArray(block.quizQuestions) && block.quizQuestions.length > 0
                    ? `${block.title || 'Thử tài trắc nghiệm'} (${block.quizQuestions.length} câu hỏi)`
                    : `${block.questionPrompt || block.title || 'Câu hỏi trắc nghiệm'} (${(block.questionOptions || block.choiceItems || block.optionLabels || []).length || 2} phương án)`)
                : isConfirmOption
                  ? `${block.title || `Bộ chìa khóa ${optionLetter}`} — ${block.body || 'Chưa có mô tả'}`
                  : block.title || getBlockTitle(block.type)}
            </p>
            <p className="truncate text-[11px] font-medium text-slate-500">
              {isInteractiveQuestionBlock
                ? `Bố cục: ${block.layoutMode === 'split' ? 'Ảnh trái - Câu hỏi phải' : block.layoutMode === 'list' ? 'Dọc' : 'Thẻ Card'} • ${block.explanation || 'Chưa có giải thích'}`
                : block.body || block.tip || block.readText || `${block.visualItems?.length || 0} mục nội dung`}
            </p>
          </div>
        </div>
      )}

      {expanded && (
        <>
          {isInteractiveQuestionBlock ? (
            (() => {
              const hasMulti = Array.isArray(block.quizQuestions) && block.quizQuestions.length > 0

              const resolvedOptionImages = (() => {
                const fromOpts = block.questionOptions?.map((o) => o.imageUrl || '')
                if (fromOpts && fromOpts.some(Boolean)) return fromOpts
                if (block.optionImages && block.optionImages.some(Boolean)) return block.optionImages
                if (card?.optionImages && card.optionImages.some(Boolean)) return card.optionImages
                return ['', '']
              })()

              const hasAnyOptImgs = resolvedOptionImages.some(Boolean)
              const singleLayoutMode: 'cards' | 'split' | 'list' = block.layoutMode === 'cards' || hasAnyOptImgs
                ? 'cards'
                : ((block.layoutMode as 'cards' | 'split' | 'list') || 'split')

              type QuizQuestionItem = {
                id: string
                prompt: string
                layoutMode?: 'cards' | 'split' | 'list'
                visualUrl?: string
                options: string[]
                correctIndex: number
                explanation?: string
                optionImages?: string[]
              }

              const questions: QuizQuestionItem[] = hasMulti
                ? (block.quizQuestions as QuizQuestionItem[])
                : [
                    {
                      id: block.id,
                      prompt: block.questionPrompt || block.title || '',
                      layoutMode: singleLayoutMode,
                      visualUrl: singleLayoutMode === 'cards' ? '' : (block.visualUrl || block.imageUrl || (card?.imageUrl || '')),
                      options: (Array.isArray(block.questionOptions) && block.questionOptions.length > 0)
                        ? block.questionOptions.map((o) => o.text)
                        : (Array.isArray(block.optionLabels) && block.optionLabels.length > 0)
                          ? block.optionLabels
                          : ['Phương án A (Đáp án đúng)', 'Phương án B'],
                      correctIndex: typeof block.correctIndex === 'number' ? block.correctIndex : 0,
                      explanation: block.explanation || block.tip || '',
                      optionImages: resolvedOptionImages,
                    },
                  ]

              const activeIdx = Math.min(block.activeQuizQuestionIdx ?? 0, questions.length - 1)
              const currentQ = questions[activeIdx] || questions[0]

              const handleSwitchQuestion = (targetIdx: number) => {
                const targetQ = questions[targetIdx]
                if (!targetQ) return
                updateBlockItem(stageIndex, block.id, {
                  activeQuizQuestionIdx: targetIdx,
                  questionPrompt: targetQ.prompt,
                  layoutMode: targetQ.layoutMode,
                  visualUrl: targetQ.visualUrl,
                  imageUrl: targetQ.visualUrl,
                  correctIndex: targetQ.correctIndex,
                  explanation: targetQ.explanation,
                  questionOptions: (Array.isArray(targetQ.options) ? targetQ.options : []).map((text: any, oIdx: number) => ({
                    id: `opt-${oIdx + 1}`,
                    text: typeof text === 'string' ? text : text?.text || '',
                    imageUrl: targetQ.optionImages?.[oIdx] || '',
                  })),
                })
              }

              const handleAddQuestion = () => {
                const nextQs: QuizQuestionItem[] = [...questions]
                const newNum = nextQs.length + 1
                const newQ: QuizQuestionItem = {
                  id: `q-${Date.now()}-${newNum}`,
                  prompt: `Câu hỏi ${newNum}?`,
                  layoutMode: 'split',
                  visualUrl: card?.imageUrl || '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
                  options: ['Phương án A (Đáp án đúng)', 'Phương án B'],
                  correctIndex: 0,
                  explanation: 'Giải thích vì sao đáp án này chính xác...',
                  optionImages: ['', ''],
                }
                nextQs.push(newQ)
                updateBlockItem(stageIndex, block.id, {
                  quizQuestions: nextQs,
                  activeQuizQuestionIdx: nextQs.length - 1,
                  questionPrompt: newQ.prompt,
                  layoutMode: newQ.layoutMode,
                  visualUrl: newQ.visualUrl,
                  imageUrl: newQ.visualUrl,
                  correctIndex: newQ.correctIndex,
                  explanation: newQ.explanation,
                  questionOptions: newQ.options.map((text, oIdx) => ({
                    id: `opt-${oIdx + 1}`,
                    text,
                    imageUrl: '',
                  })),
                })
                showToast?.(`Đã thêm Câu hỏi ${newNum}!`, 'success')
              }

              const handleRemoveQuestion = (delIdx: number) => {
                if (questions.length <= 1) return
                const nextQs: QuizQuestionItem[] = questions.filter((_, i) => i !== delIdx)
                const nextActiveIdx = Math.max(0, delIdx > 0 ? delIdx - 1 : 0)
                const nextActiveQ = nextQs[nextActiveIdx]
                updateBlockItem(stageIndex, block.id, {
                  quizQuestions: nextQs,
                  activeQuizQuestionIdx: nextActiveIdx,
                  questionPrompt: nextActiveQ?.prompt,
                  layoutMode: nextActiveQ?.layoutMode,
                  visualUrl: nextActiveQ?.visualUrl,
                  imageUrl: nextActiveQ?.visualUrl,
                  correctIndex: nextActiveQ?.correctIndex,
                  explanation: nextActiveQ?.explanation,
                  questionOptions: (nextActiveQ?.options || []).map((text: any, oIdx: number) => ({
                    id: `opt-${oIdx + 1}`,
                    text: typeof text === 'string' ? text : text?.text || '',
                    imageUrl: nextActiveQ?.optionImages?.[oIdx] || '',
                  })),
                })
                showToast?.('Đã xóa câu hỏi!', 'info')
              }

              return (
                <div className="space-y-3">
                  {/* Dãy nút số câu hỏi (Stepper 1 2 3 4 ... [+]) nếu có >= 1 câu hỏi */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-sky-50/80 border border-sky-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-sky-950 uppercase tracking-wider">
                        Dãy câu hỏi ({questions.length}):
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {questions.map((q, qIdx) => {
                          const isCurrent = qIdx === activeIdx
                          return (
                            <button
                              key={q.id || qIdx}
                              type="button"
                              onClick={() => handleSwitchQuestion(qIdx)}
                              className={cn(
                                'size-8 sm:size-9 rounded-xl font-black text-xs transition-all flex items-center justify-center cursor-pointer shadow-2xs',
                                isCurrent
                                  ? 'bg-sky-600 text-white scale-105 shadow-xs ring-2 ring-sky-300'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-100 hover:text-sky-800'
                              )}
                              title={`Chuyển đến Câu ${qIdx + 1}: ${q.prompt || 'Chưa đặt câu hỏi'}`}
                            >
                              {qIdx + 1}
                            </button>
                          )
                        })}
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-300 bg-white text-sky-700 hover:bg-sky-100 text-xs font-black transition cursor-pointer shadow-2xs active:scale-95"
                            title="Thêm câu hỏi mới vào khối này"
                          >
                            <Plus size={14} />
                            <span>Thêm câu</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-900 text-[11px] font-black">
                        Đang sửa: Câu {activeIdx + 1} / {questions.length}
                      </span>
                      {questions.length > 1 && !readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(activeIdx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer text-xs font-bold"
                          title="Xóa câu hỏi đang chọn"
                        >
                          <Trash2 size={13} />
                          <span>Xóa câu này</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form soạn thảo câu hỏi đang chọn */}
                  <InteractiveQuestionBlockEditor
                    key={currentQ.id || `q-${activeIdx}`}
                    question={{
                      id: currentQ.id,
                      prompt: currentQ.prompt,
                      layoutMode: (currentQ.layoutMode || (
                        (Array.isArray(currentQ.options) && currentQ.options.some((o: any) => typeof o !== 'string' && Boolean(o.imageUrl))) ||
                        (Array.isArray(currentQ.optionImages) && currentQ.optionImages.some(Boolean))
                          ? 'cards'
                          : 'split'
                      )) as 'cards' | 'split' | 'list',
                      visualUrl: currentQ.visualUrl || (currentQ.layoutMode === 'split' ? (card?.imageUrl || '') : ''),
                      options: (Array.isArray(currentQ.options) && currentQ.options.length > 0)
                        ? currentQ.options.map((opt: any, oIdx: number) => ({
                            id: typeof opt === 'string' ? `opt-${oIdx + 1}` : (opt.id || `opt-${oIdx + 1}`),
                            text: typeof opt === 'string' ? opt : (opt.text || ''),
                            imageUrl: typeof opt === 'string' ? (currentQ.optionImages?.[oIdx] || '') : (opt.imageUrl || currentQ.optionImages?.[oIdx] || ''),
                          }))
                        : [
                            { id: 'opt-1', text: 'Phương án A (Đáp án đúng)', imageUrl: '' },
                            { id: 'opt-2', text: 'Phương án B', imageUrl: '' },
                          ],
                      correctIndex: typeof currentQ.correctIndex === 'number' ? currentQ.correctIndex : 0,
                      explanation: currentQ.explanation || '',
                    }}
                    onChange={(patch) => {
                      const nextQs: QuizQuestionItem[] = [...questions]
                      const cur = nextQs[activeIdx] || { ...currentQ }
                      const updated: QuizQuestionItem = { ...cur }
                      if (patch.prompt !== undefined) updated.prompt = patch.prompt
                      if (patch.layoutMode !== undefined) updated.layoutMode = patch.layoutMode
                      if (patch.visualUrl !== undefined) updated.visualUrl = patch.visualUrl
                      if (patch.explanation !== undefined) updated.explanation = patch.explanation
                      if (patch.correctIndex !== undefined) updated.correctIndex = patch.correctIndex
                      if (patch.options !== undefined) {
                        updated.options = patch.options.map((o) => o.text)
                        updated.optionImages = patch.options.map((o) => o.imageUrl || '')
                      }
                      nextQs[activeIdx] = updated

                      const activeOptions = updated.options.map((text: string, oIdx: number) => ({
                        id: `opt-${oIdx + 1}`,
                        text,
                        imageUrl: updated.optionImages?.[oIdx] || '',
                      }))

                      const blockPatch: any = {
                        quizQuestions: nextQs,
                        activeQuizQuestionIdx: activeIdx,
                        questionPrompt: updated.prompt,
                        layoutMode: updated.layoutMode,
                        visualUrl: updated.visualUrl,
                        imageUrl: updated.visualUrl,
                        correctIndex: updated.correctIndex,
                        explanation: updated.explanation,
                        questionOptions: activeOptions,
                        optionLabels: updated.options,
                        optionImages: updated.optionImages,
                      }
                      updateBlockItem(stageIndex, block.id, blockPatch)
                    }}
                    readOnly={readOnly}
                    questId={courseId}
                    showToast={showToast}
                    questionNumber={activeIdx + 1}
                    customBadge={block.type === 'layout-confirm-option' ? `XÁC NHẬN MỤC TIÊU (CÂU ${activeIdx + 1}/${questions.length})` : `CÂU HỎI ${activeIdx + 1}/${questions.length}`}
                    customTitle={`Nội dung câu hỏi ${activeIdx + 1} *`}
                  />
                </div>
              )
            })()
          ) : block.type === 'video' ? (
            <VideoBlockEditor
              video={{
                id: block.id,
                title: block.title || card.title,
                videoUrl: block.videoUrl || card.videoUrl || '',
                posterUrl: block.posterUrl || '',
                durationSec: block.durationSec || 180,
                timestamps: block.timestamps || [],
              }}
              onChange={(patch) => {
                updateBlockItem(stageIndex, block.id, patch)
                if (patch.videoUrl !== undefined) {
                  updateLearnCard(stageIndex, { videoUrl: patch.videoUrl })
                }
              }}
              readOnly={readOnly}
              questId={courseId}
              showToast={showToast}
            />
          ) : block.type === 'practice' ? (
            <PracticeBlockEditor
              practice={
                block.practiceConfig || {
                  id: block.id,
                  title: block.title || 'Thực hành',
                  subjectName: '',
                  badge: '',
                  illustrationType: '',
                  lockedFeatures: [],
                  akiMotto: '',
                  maxAttempts: 3,
                  workflowSteps: [],
                }
              }
              onChange={(patch) => {
                updateBlockItem(stageIndex, block.id, {
                  practiceConfig: { ...(block.practiceConfig || {}), ...patch },
                  title: patch.title ?? block.title,
                })
              }}
              readOnly={readOnly}
              previewAikiVoice={previewAikiVoice}
              showToast={showToast}
              stageStarAllocation={stageStarAllocation}
              onToggleStageStar={() => onToggleStageStar?.(4)}
            />
          ) : block.type === 'reward' ? (
            <RewardBlockEditor
              completion={{
                id: block.rewardConfig?.id || block.id,
                title: block.rewardConfig?.title || block.title || 'Chúc mừng hoàn thành bài học!',
                congratsMessage: block.rewardConfig?.congratsMessage || block.body || '',
                rewardBadge: block.rewardConfig?.rewardBadge || {
                  name: 'Huy hiệu hoàn thành',
                  iconUrl: '',
                  stars: 3,
                  xp: 50,
                },
                nextLessonSlug: block.rewardConfig?.nextLessonSlug || '',
              }}
              stage1ImageUrl={card.imageUrl}
              onChange={(patch) => {
                updateBlockItem(stageIndex, block.id, {
                  rewardConfig: { ...(block.rewardConfig || {}), ...patch },
                  title: patch.title ?? block.title,
                  body: patch.congratsMessage ?? block.body,
                })
              }}
              readOnly={readOnly}
              questId={courseId}
              showToast={showToast}
              stageStarAllocation={stageStarAllocation}
              onToggleStage6Star={() => onToggleStageStar?.(5)}
            />
          ) : (
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
          )}


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
