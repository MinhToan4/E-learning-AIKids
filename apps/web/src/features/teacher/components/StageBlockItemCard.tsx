import React from 'react'
import {
  GripVertical, ArrowUp, ArrowDown, Trash2, Plus, Eye, Volume2,
  Clapperboard, BrainCircuit, ScanSearch, MessageSquareText,
  Image as ImageIcon, Sparkles
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { MeeCatInteractiveCanvas } from '@/features/mee-rig/components/MeeCatInteractiveCanvas'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import type {
  LearnCardDraft,
  ContentBlockType,
  StageBlockItem,
  LearnVisualItemDraft,
  DialogueLine,
  StageImageItem,
} from '../lib/authoring'

export const LECTURE_GESTURES = [
  { id: 'presentation', label: '🤲 Thuyết trình cơ bản' },
  { id: 'point-left', label: '👈 Chỉ bảng bài học' },
  { id: 'think', label: '💡 Cùng suy nghĩ (đố vui)' },
  { id: 'idea', label: '💡 Aha! Nêu mẹo (quy tắc)' },
  { id: 'celebrate-1', label: '🎉 Hoan hô ăn mừng' },
  { id: 'explain', label: '👐 Diễn giải mở rộng' },
] as const

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
    case 'layout-storyboard':
      return customTitle || 'CHUỖI STORYBOARD'
    case 'voice':
      return 'MÈO AIKI ĐỒNG HÀNH & TRỢ GIẢNG AI'
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

export function StageBlockItemCard({
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
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          {!readOnly && (
            <span
              className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 select-none"
              title="Kéo để đổi vị trí khối"
            >
              <GripVertical size={18} />
            </span>
          )}
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700">
            Khối {bIdx + 1}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-base">{getBlockIcon(block.type)}</span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {getBlockTitle(block.type, block.title)}
            </h4>
          </div>
        </div>

        {/* Bộ nút hành động */}
        <div className="flex items-center gap-1">
          {!readOnly && (
            <>
              <button
                type="button"
                disabled={bIdx === 0}
                onClick={() => moveBlock(stageIndex, bIdx, -1)}
                className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Di chuyển lên trên"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                disabled={bIdx === totalBlocks - 1}
                onClick={() => moveBlock(stageIndex, bIdx, 1)}
                className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Di chuyển xuống dưới"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(stageIndex, block.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-coral-600 hover:bg-coral-50 transition cursor-pointer ml-1"
                title="Xóa khối"
              >
                <Trash2 size={13} /> Xóa khối
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 1. BLOCK: Đoạn văn bản (text / layout-text) ── */}
      {(block.type === 'text' || block.type === 'layout-text') && (
        <div className="mt-3.5 space-y-3">
          <label className="block text-xs font-extrabold text-text">Tiêu đề đoạn văn bản
            <input
              readOnly={readOnly}
              value={block.title ?? ''}
              onChange={(event) => updateBlockItem(stageIndex, block.id, { title: event.target.value })}
              style={{ ...inputStyle, marginTop: '0.35rem' }}
              placeholder={`VD: ${stageInfo.title}`}
            />
          </label>

          <label className="block text-xs font-extrabold text-text">Nội dung đoạn văn bản *
            <textarea
              readOnly={readOnly}
              value={block.body ?? ''}
              onChange={(event) => updateBlockItem(stageIndex, block.id, { body: event.target.value })}
              rows={4}
              style={{ ...textareaStyle, marginTop: '0.35rem' }}
              placeholder="Nội dung chính hướng dẫn học sinh đọc hoặc xem..."
            />
          </label>

          <label className="block text-xs font-extrabold text-text">Câu ghi nhớ (tùy chọn)
            <input
              readOnly={readOnly}
              value={block.tip ?? ''}
              onChange={(event) => updateBlockItem(stageIndex, block.id, { tip: event.target.value })}
              style={{ ...inputStyle, marginTop: '0.35rem' }}
              placeholder="Một câu ngắn để học sinh nhớ ý chính của đoạn này"
            />
          </label>
        </div>
      )}

      {/* ── 2. BLOCK: Hộp Ghi Nhớ Nổi Bật (layout-callout) ── */}
      {block.type === 'layout-callout' && (
        <div className="mt-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-4 space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-amber-900">
            Tiêu đề hộp ghi nhớ
            <input
              readOnly={readOnly}
              value={block.title ?? 'Hộp Ghi Nhớ Nổi Bật'}
              onChange={(e) => updateBlockItem(stageIndex, block.id, { title: e.target.value })}
              style={{ ...inputStyle, marginTop: '0.25rem' }}
              placeholder="💡 Bí kíp bỏ túi..."
            />
          </label>
          <label className="block text-xs font-black uppercase tracking-wider text-amber-900">
            Nội dung ghi nhớ nổi bật *
            <textarea
              readOnly={readOnly}
              value={block.tip || block.body || ''}
              onChange={(e) => updateBlockItem(stageIndex, block.id, { tip: e.target.value, body: e.target.value })}
              rows={3}
              style={{ ...textareaStyle, marginTop: '0.25rem' }}
              placeholder="Hãy luôn tự tay thêm ý tưởng của riêng con!"
            />
          </label>
        </div>
      )}

      {/* ── 3. BLOCK: Công Thức KaTeX (layout-formula) ── */}
      {block.type === 'layout-formula' && (
        <div className="mt-3.5 rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-4 space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-brand-900">
            Tiêu đề công thức
            <input
              readOnly={readOnly}
              value={block.title ?? 'Công Thức KaTeX'}
              onChange={(e) => updateBlockItem(stageIndex, block.id, { title: e.target.value })}
              style={{ ...inputStyle, marginTop: '0.25rem' }}
              placeholder="Công thức sáng tạo..."
            />
          </label>
          <label className="block text-xs font-black uppercase tracking-wider text-brand-900">
            Công thức KaTeX (Cú pháp LaTeX)
            <textarea
              readOnly={readOnly}
              value={block.formula ?? '$$\\text{Ý tưởng con} + \\text{Sức mạnh AI} = \\text{Tác phẩm độc nhất}$$'}
              onChange={(e) => updateBlockItem(stageIndex, block.id, { formula: e.target.value })}
              rows={2}
              style={{ ...textareaStyle, marginTop: '0.25rem', fontFamily: 'monospace' }}
              placeholder="$$\text{Ý tưởng con} + \text{Sức mạnh AI} = \text{Tác phẩm}$$"
            />
          </label>
          <div className="rounded-xl border border-brand-200 bg-white p-3 text-center">
            <p className="text-[10px] font-black uppercase text-brand-700 mb-1">Xem trước công thức</p>
            <div className="font-mono text-sm font-bold text-brand-950">
              {block.formula || '$$\\text{Ý tưởng con} + \\text{Sức mạnh AI} = \\text{Tác phẩm độc nhất}$$'}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. BLOCK: 2 Cột Chữ + Media (layout-split) ── */}
      {block.type === 'layout-split' && (
        <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-extrabold text-text">Tiêu đề đoạn
              <input
                readOnly={readOnly}
                value={block.title ?? ''}
                onChange={(e) => updateBlockItem(stageIndex, block.id, { title: e.target.value })}
                style={{ ...inputStyle, marginTop: '0.25rem' }}
                placeholder="Tiêu đề nội dung..."
              />
            </label>
            <label className="mt-2.5 block text-xs font-extrabold text-text">Nội dung giải thích
              <textarea
                readOnly={readOnly}
                value={block.body ?? ''}
                onChange={(e) => updateBlockItem(stageIndex, block.id, { body: e.target.value })}
                rows={4}
                style={{ ...textareaStyle, marginTop: '0.25rem' }}
                placeholder="Nhập nội dung giải thích..."
              />
            </label>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-text">URL Hình ảnh / Media
              <input
                type="url"
                readOnly={readOnly}
                value={block.imageUrl ?? ''}
                onChange={(e) => updateBlockItem(stageIndex, block.id, { imageUrl: e.target.value })}
                style={{ ...inputStyle, marginTop: '0.25rem' }}
                placeholder="https://cdn.example.com/image.webp"
              />
            </label>
            {!readOnly && (
              <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-sky-300 bg-sky-50 px-3 text-xs font-extrabold text-sky-800 hover:bg-sky-100">
                <Eye size={15} className="mr-1.5" />
                {uploadingStageMedia === `${stageIndex}:block:${block.id}` ? 'Đang tải…' : 'Tải file ảnh lên'}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploadingStageMedia !== null}
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      setUploadingStageMedia(`${stageIndex}:block:${block.id}`)
                      try {
                        const res = await uploadCmsCourseMedia({ file, purpose: 'block_image', questId: courseId })
                        if (res.url) {
                          updateBlockItem(stageIndex, block.id, { imageUrl: res.url })
                          showToast('Tải ảnh thành công!', 'success')
                        }
                      } catch {
                        showToast('Tải ảnh thất bại', 'danger')
                      } finally {
                        setUploadingStageMedia(null)
                      }
                    }
                    event.currentTarget.value = ''
                  }}
                />
              </span>
            )}
            {block.imageUrl && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 aspect-video">
                <img src={block.imageUrl} alt={block.imageAlt || 'Media'} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. BLOCK: Lưới Ô Thẻ / Storyboard (layout-grid / layout-storyboard) ── */}
      {(block.type === 'layout-grid' || block.type === 'layout-storyboard') && (
        <div className="mt-3.5 rounded-xl border border-sky-200 bg-sky-50/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="text-xs font-extrabold text-text flex-1">
              Tiêu đề:
              <input
                readOnly={readOnly}
                value={block.title ?? ''}
                onChange={(e) => updateBlockItem(stageIndex, block.id, { title: e.target.value })}
                style={{ ...inputStyle, marginTop: '0.2rem' }}
                placeholder={block.type === 'layout-storyboard' ? "VD: Chuỗi Storyboard 3 Cảnh..." : "VD: Lưới 3 Ô Thẻ..."}
              />
            </label>
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  const currentItems = block.visualItems || []
                  const nextItems: LearnVisualItemDraft[] = [
                    ...currentItems,
                    { label: block.type === 'layout-storyboard' ? `Cảnh ${currentItems.length + 1}` : `Ý tưởng ${currentItems.length + 1}`, text: '', tone: 'brand' },
                  ]
                  updateBlockItem(stageIndex, block.id, { visualItems: nextItems })
                }}
                className="flex min-h-9 items-center gap-1 rounded-xl border border-sky-300 bg-white px-3 text-xs font-extrabold text-sky-700 cursor-pointer"
              >
                <Plus size={14} /> Thêm ô con
              </button>
            )}
          </div>
          <div className="grid gap-2">
            {(block.visualItems || []).map((item, vIdx) => (
              <div key={vIdx} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(8rem,.42fr)_minmax(0,1fr)_2.5rem]">
                <label className="text-[11px] font-extrabold text-muted">
                  Tên ô
                  <input
                    readOnly={readOnly}
                    value={item.label}
                    onChange={(e) => {
                      const next = [...(block.visualItems || [])]
                      next[vIdx] = { ...item, label: e.target.value }
                      updateBlockItem(stageIndex, block.id, { visualItems: next })
                    }}
                    style={{ ...inputStyle, minHeight: '2.5rem', marginTop: '0.25rem' }}
                    placeholder="Tên ô..."
                  />
                </label>
                <label className="text-[11px] font-extrabold text-muted">
                  Nội dung ngắn
                  <textarea
                    readOnly={readOnly}
                    value={item.text}
                    onChange={(e) => {
                      const next = [...(block.visualItems || [])]
                      next[vIdx] = { ...item, text: e.target.value }
                      updateBlockItem(stageIndex, block.id, { visualItems: next })
                    }}
                    rows={2}
                    style={{ ...textareaStyle, minHeight: '2.5rem', marginTop: '0.25rem' }}
                    placeholder="Mô tả cho học sinh..."
                  />
                </label>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = (block.visualItems || []).filter((_, i) => i !== vIdx)
                      updateBlockItem(stageIndex, block.id, { visualItems: next })
                    }}
                    className="mt-5 grid size-9 place-items-center rounded-xl border border-slate-200 text-danger cursor-pointer hover:bg-rose-50"
                    title="Xóa ô này"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. BLOCK: Mèo AIKI & Lipsync (voice) ── */}
      {block.type === 'voice' && (
        <div className="mt-3.5 rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50/80 via-sky-50/50 to-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-stretch">
            <div className="flex flex-col justify-between gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Lời đọc cho bé <span className="font-semibold normal-case text-muted">(để trống AIKI sẽ đọc nội dung bài)</span>
                  <textarea
                    readOnly={readOnly}
                    value={card.mee?.readText ?? ''}
                    onChange={(event) => updateLearnCard(stageIndex, {
                      mee: {
                        ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                        readText: event.target.value,
                        voiceProvider: 'vertex',
                        gesture: (card.mee?.gesture as any) ?? 'presentation',
                        autoRead: card.mee?.autoRead ?? false,
                      }
                    })}
                    rows={2}
                    style={{ ...textareaStyle, marginTop: '0.25rem', minHeight: '3.25rem' }}
                    placeholder="Rút gọn thành 1–2 câu dễ hiểu, vui tươi và tràn đầy năng lượng..."
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Audio Vertex AI (StoryMee Hub)
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="url"
                      readOnly={readOnly}
                      value={card.mee?.audioUrl ?? ''}
                      onChange={(event) => updateLearnCard(stageIndex, {
                        mee: {
                          ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                          audioUrl: event.target.value,
                          voiceProvider: 'vertex',
                        }
                      })}
                      style={{ ...inputStyle, marginTop: 0 }}
                      placeholder="https://cdn.example.com/aiki-voice.mp3"
                      className="flex-1 min-h-9"
                    />
                    {!readOnly && (
                      <label className="shrink-0 flex min-h-9 items-center justify-center gap-1 rounded-xl border-2 border-brand-200 bg-white px-2.5 text-[11px] font-black text-brand-700 hover:bg-brand-50 cursor-pointer shadow-2xs transition">
                        <Volume2 size={13} />
                        <span>{uploadingStageMedia === `${stageIndex}:audioUrl` ? 'Đang tải…' : 'Tải MP3'}</span>
                        <input
                          className="sr-only"
                          type="file"
                          accept="audio/mpeg,audio/mp4,audio/wav,audio/webm"
                          disabled={uploadingStageMedia !== null}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) void uploadLearnCardMedia(stageIndex, 'audioUrl', file)
                            event.currentTarget.value = ''
                          }}
                        />
                      </label>
                    )}
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-brand-100/60">
                <label className="min-w-44 flex-1 text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Cử chỉ giảng dạy
                  <select
                    disabled={readOnly}
                    value={card.mee?.gesture ?? 'presentation'}
                    onChange={(event) => updateLearnCard(stageIndex, {
                      mee: {
                        ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                        gesture: event.target.value as any,
                      }
                    })}
                    style={{ ...inputStyle, marginTop: '0.25rem', height: '2.4rem' }}
                  >
                    {LECTURE_GESTURES.map((g) => (
                      <option key={g.id} value={g.id}>{g.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={card.mee?.autoRead ?? false}
                    onChange={(event) => updateLearnCard(stageIndex, {
                      mee: {
                        ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                        autoRead: event.target.checked,
                      }
                    })}
                    className="size-4 rounded text-brand-600 focus:ring-brand-400"
                  />
                  <span>Tự đọc khi mở chặng</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between rounded-2xl border-2 border-brand-200 bg-gradient-to-b from-brand-50 via-amber-50/60 to-white p-3 shadow-inner relative overflow-hidden">
              <div className="w-full flex items-center justify-between text-[10px] font-black text-brand-800">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Interactive Rig
                </span>
                <span className="uppercase opacity-75">
                  {card.mee?.gesture ?? 'presentation'}
                </span>
              </div>

              <div className="h-44 w-full flex items-center justify-center my-1">
                <MeeCatInteractiveCanvas
                  variant="half-body"
                  animated={true}
                  transparentBackground={true}
                  state={card.mee?.gesture === 'think' ? 'look' : card.mee?.gesture === 'celebrate' || card.mee?.gesture === 'celebrate-1' ? 'celebrate' : previewSpeakingIndex === stageIndex ? 'talk' : 'idle'}
                  gesture={(card.mee?.gesture as any) ?? 'presentation'}
                  isSpeaking={previewSpeakingIndex === stageIndex}
                  speechText={card.mee?.readText || card.body}
                  className="size-full max-h-44"
                />
              </div>

              <button
                type="button"
                onClick={() => previewAikiVoice(stageIndex, card.mee?.readText?.trim() || card.body)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-black transition active:scale-95 shadow-xs cursor-pointer",
                  previewSpeakingIndex === stageIndex
                    ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                    : "bg-brand-600 hover:bg-brand-700 text-white"
                )}
              >
                <Volume2 size={15} />
                <span>{previewSpeakingIndex === stageIndex ? 'Dừng đọc & lipsync' : '🔊 Nghe thử giọng & Lipsync'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. BLOCK: Video Bài Giảng (video) ── */}
      {block.type === 'video' && (
        <div className="mt-3.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-4 shadow-xs">
          <div className="grid gap-3">
            <label className="text-[11px] font-extrabold text-muted">
              Đường dẫn Video URL (MP4 hoặc YouTube)
              <input
                type="url"
                readOnly={readOnly}
                value={card.videoUrl ?? ''}
                onChange={(event) => updateLearnCard(stageIndex, { videoUrl: event.target.value })}
                style={{ ...inputStyle, marginTop: '0.25rem' }}
                placeholder="https://cdn.example.com/video.mp4 hoặc https://youtube.com/watch?v=..."
              />
            </label>
            {!readOnly && (
              <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-indigo-200 bg-white px-3 text-xs font-extrabold text-indigo-700 hover:bg-indigo-100/50">
                <Clapperboard size={16} className="mr-2" aria-hidden="true" />
                {uploadingStageMedia === `${stageIndex}:videoUrl` ? 'Đang tải video…' : 'Tải file video lên'}
                <input
                  className="sr-only"
                  type="file"
                  accept="video/mp4,video/webm"
                  disabled={uploadingStageMedia !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadLearnCardMedia(stageIndex, 'videoUrl', file)
                    event.currentTarget.value = ''
                  }}
                />
              </span>
            )}
            {card.videoUrl && (
              <div className="overflow-hidden rounded-xl border border-border">
                <LectureVideo title={card.title} url={card.videoUrl} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 8. BLOCK: 2 Tranh Đối Đầu A/B (versus-ab) ── */}
      {block.type === 'versus-ab' && (
        <div className="mt-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-4 shadow-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Tranh A */}
            <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950">Phương án A</span>
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800">Tranh A</span>
              </div>
              <label className="mt-2 block text-[11px] font-extrabold text-muted">
                Tiêu đề tranh A
                <input
                  type="text"
                  readOnly={readOnly}
                  value={card.optionLabels?.[0] ?? 'Ảnh A: Bức tranh của Zico'}
                  onChange={(event) => {
                    const next = [...(card.optionLabels || ['Ảnh A: Bức tranh của Zico', 'Ảnh B: Bức tranh của Sonet'])]
                    next[0] = event.target.value
                    updateLearnCard(stageIndex, { optionLabels: next })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="Ảnh A: Bức tranh của Zico"
                />
              </label>
              <label className="mt-2 block text-[11px] font-extrabold text-muted">
                Mô tả tranh A
                <input
                  type="text"
                  readOnly={readOnly}
                  value={card.optionDescs?.[0] ?? ''}
                  onChange={(event) => {
                    const next = [...(card.optionDescs || ['', ''])]
                    next[0] = event.target.value
                    updateLearnCard(stageIndex, { optionDescs: next })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="Siêu anh hùng quen thuộc (ai cũng vẽ được)"
                />
              </label>
              <label className="mt-2 block text-[11px] font-extrabold text-muted">
                URL Ảnh A
                <input
                  type="url"
                  readOnly={readOnly}
                  value={card.optionImages?.[0] ?? ''}
                  onChange={(event) => {
                    const next = [...(card.optionImages || ['', ''])]
                    next[0] = event.target.value
                    updateLearnCard(stageIndex, { optionImages: next })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="https://cdn.example.com/zico-hero.webp"
                />
              </label>
              {!readOnly && (
                <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-3 text-xs font-extrabold text-amber-900 hover:bg-amber-100">
                  <Eye size={15} className="mr-1.5" />
                  {uploadingStageMedia === `${stageIndex}:optionImageA` ? 'Đang tải ảnh A…' : 'Tải ảnh tranh A lên'}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={uploadingStageMedia !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void uploadLearnCardMedia(stageIndex, 'optionImageA', file)
                      event.currentTarget.value = ''
                    }}
                  />
                </span>
              )}
              {card.optionImages?.[0] && (
                <div className="mt-2 overflow-hidden rounded-lg border border-amber-200 aspect-video">
                  <img src={card.optionImages[0]} alt="Bức tranh A" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
              )}
            </div>

            {/* Tranh B */}
            <div className="rounded-xl border border-sky-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-950">Phương án B</span>
                <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-black text-sky-800">Tranh B</span>
              </div>
              <label className="mt-2 block text-[11px] font-extrabold text-muted">
                Tiêu đề tranh B
                <input
                  type="text"
                  readOnly={readOnly}
                  value={card.optionLabels?.[1] ?? 'Ảnh B: Bức tranh của Sonet'}
                  onChange={(event) => {
                    const next = [...(card.optionLabels || ['Ảnh A: Bức tranh của Zico', 'Ảnh B: Bức tranh của Sonet'])]
                    next[1] = event.target.value
                    updateLearnCard(stageIndex, { optionLabels: next })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="Ảnh B: Bức tranh của Sonet"
                />
              </label>
              <label className="mt-2 block text-[11px] font-extrabold text-muted">
                Mô tả tranh B
                <input
                  type="text"
                  readOnly={readOnly}
                  value={card.optionDescs?.[1] ?? ''}
                  onChange={(event) => {
                    const next = [...(card.optionDescs || ['', ''])]
                    next[1] = event.target.value
                    updateLearnCard(stageIndex, { optionDescs: next })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="Siêu anh hùng bố cầm vợt muỗi (độc nhất của riêng con)"
                />
              </label>
              <label className="mt-2 block text-[11px] font-extrabold text-muted">
                URL Ảnh B
                <input
                  type="url"
                  readOnly={readOnly}
                  value={card.optionImages?.[1] ?? ''}
                  onChange={(event) => {
                    const next = [...(card.optionImages || ['', ''])]
                    next[1] = event.target.value
                    updateLearnCard(stageIndex, { optionImages: next })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="https://cdn.example.com/sonet-hero.webp"
                />
              </label>
              {!readOnly && (
                <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-sky-300 bg-sky-50 px-3 text-xs font-extrabold text-sky-900 hover:bg-sky-100">
                  <Eye size={15} className="mr-1.5" />
                  {uploadingStageMedia === `${stageIndex}:optionImageB` ? 'Đang tải ảnh B…' : 'Tải ảnh tranh B lên'}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={uploadingStageMedia !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void uploadLearnCardMedia(stageIndex, 'optionImageB', file)
                      event.currentTarget.value = ''
                    }}
                  />
                </span>
              )}
              {card.optionImages?.[1] && (
                <div className="mt-2 overflow-hidden rounded-lg border border-sky-200 aspect-video">
                  <img src={card.optionImages[1]} alt="Bức tranh B" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. BLOCK: Kịch Bản Phân Vai Comic (dialogue) ── */}
      {block.type === 'dialogue' && (
        <div className="mt-3.5 rounded-2xl border-2 border-orange-300 bg-orange-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-end mb-3">
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  const currentList = card.dialogueLines || []
                  const nextLine: DialogueLine = {
                    id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    speaker: 'zico',
                    role: currentList.length % 2 === 0 ? 'left' : 'right',
                    text: '',
                  }
                  updateLearnCard(stageIndex, { dialogueLines: [...currentList, nextLine] })
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-white px-2.5 py-1 text-[11px] font-extrabold text-orange-800 hover:bg-orange-100 transition cursor-pointer"
              >
                <Plus size={13} /> Thêm câu thoại
              </button>
            )}
          </div>

          {(!card.dialogueLines || card.dialogueLines.length === 0) ? (
            <div className="rounded-xl border border-dashed border-orange-300 bg-white/70 p-4 text-center text-xs font-bold text-orange-800">
              Chưa có câu thoại nào. Bấm "+ Thêm câu thoại" để tạo kịch bản comic đối thoại.
            </div>
          ) : (
            <div className="space-y-2.5">
              {card.dialogueLines.map((line, lineIdx) => (
                <div key={line.id || lineIdx} className="rounded-xl border border-orange-200 bg-white p-3 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted">#{lineIdx + 1}</span>
                      <label className="text-[11px] font-bold text-text flex items-center gap-1">
                        Nhân vật:
                        <select
                          disabled={readOnly}
                          value={line.speaker}
                          onChange={(e) => {
                            const nextList = [...(card.dialogueLines || [])]
                            const sp = e.target.value
                            const autoRole = sp === 'zico' ? 'left' : sp === 'sonet' ? 'right' : 'center'
                            nextList[lineIdx] = { ...line, speaker: sp, role: autoRole }
                            updateLearnCard(stageIndex, { dialogueLines: nextList })
                          }}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-bold text-text bg-white"
                        >
                          <option value="zico">👦 Zico (áo cam)</option>
                          <option value="sonet">🧒 Sonet (áo xanh)</option>
                          <option value="aki">🐱 Mèo AKI</option>
                          <option value="teacher">👩‍🏫 Cô giáo</option>
                          <option value="other">Tùy chọn khác</option>
                        </select>
                      </label>
                      <label className="text-[11px] font-bold text-text flex items-center gap-1">
                        Vị trí:
                        <select
                          disabled={readOnly}
                          value={line.role}
                          onChange={(e) => {
                            const nextList = [...(card.dialogueLines || [])]
                            nextList[lineIdx] = { ...line, role: e.target.value as 'left' | 'right' | 'center' }
                            updateLearnCard(stageIndex, { dialogueLines: nextList })
                          }}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-bold text-text bg-white"
                        >
                          <option value="left">Trái (Left)</option>
                          <option value="right">Phải (Right)</option>
                          <option value="center">Ở giữa (Center)</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => speakTextPreview(line.text)}
                        className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-900 hover:bg-orange-100 cursor-pointer"
                        title="Nghe máy đọc thử câu này"
                      >
                        <Volume2 size={13} /> Nghe thử
                      </button>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextList = card.dialogueLines?.filter((_, i) => i !== lineIdx) || []
                            updateLearnCard(stageIndex, { dialogueLines: nextList })
                          }}
                          className="rounded-md p-1 text-coral-600 hover:bg-coral-50 cursor-pointer"
                          title="Xóa câu thoại này"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <label className="mt-2 block text-[11px] font-extrabold text-muted">
                    Lời thoại của nhân vật
                    <textarea
                      readOnly={readOnly}
                      value={line.text}
                      onChange={(e) => {
                        const nextList = [...(card.dialogueLines || [])]
                        nextList[lineIdx] = { ...line, text: e.target.value }
                        updateLearnCard(stageIndex, { dialogueLines: nextList })
                      }}
                      rows={2}
                      style={{ ...textareaStyle, marginTop: '0.2rem', minHeight: '3rem' }}
                      placeholder="Nhập câu thoại của nhân vật..."
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 10. BLOCK: Bảng So Sánh 2 Cột (compare) ── */}
      {block.type === 'compare' && (
        <div className="mt-3.5 rounded-2xl border-2 border-sky-300 bg-sky-50/80 p-4 shadow-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Cột Trái: Kho AI */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <span className="text-xs font-black text-slate-800">Cột Trái</span>
              <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                Tiêu đề cột trái
                <input
                  type="text"
                  readOnly={readOnly}
                  value={card.compareData?.leftTitle ?? 'Kho Dữ Liệu AI'}
                  onChange={(e) => {
                    const currentData = card.compareData || {}
                    updateLearnCard(stageIndex, {
                      compareData: { ...currentData, leftTitle: e.target.value },
                    })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="Kho Dữ Liệu AI"
                />
              </label>
              <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                Nội dung giải thích cột trái
                <textarea
                  readOnly={readOnly}
                  value={card.compareData?.leftText ?? ''}
                  onChange={(e) => {
                    const currentData = card.compareData || {}
                    updateLearnCard(stageIndex, {
                      compareData: { ...currentData, leftText: e.target.value },
                    })
                  }}
                  rows={2}
                  style={{ ...textareaStyle, marginTop: '0.2rem', minHeight: '3rem' }}
                  placeholder="AI chỉ lấy những hình ảnh quen thuộc trong kho mẫu có sẵn..."
                />
              </label>
              <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                URL Ảnh cột trái
                <input
                  type="url"
                  readOnly={readOnly}
                  value={card.compareData?.leftImage || card.compareImages?.left || ''}
                  onChange={(event) => {
                    const currentData = card.compareData || {}
                    updateLearnCard(stageIndex, {
                      compareData: { ...currentData, leftImage: event.target.value },
                      compareImages: { left: event.target.value, right: card.compareImages?.right || '' },
                    })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="https://cdn.example.com/ai-warehouse.webp"
                />
              </label>
              {!readOnly && (
                <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-extrabold text-slate-800 hover:bg-slate-100">
                  <Eye size={15} className="mr-1.5" />
                  {uploadingStageMedia === `${stageIndex}:compareLeft` ? 'Đang tải ảnh…' : 'Tải ảnh Cột Trái lên'}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={uploadingStageMedia !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void uploadLearnCardMedia(stageIndex, 'compareLeft', file)
                      event.currentTarget.value = ''
                    }}
                  />
                </span>
              )}
              {(card.compareData?.leftImage || card.compareImages?.left) && (
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 aspect-video">
                  <img src={card.compareData?.leftImage || card.compareImages?.left} alt="Minh họa Cột Trái" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
              )}
            </div>

            {/* Cột Phải: Não con */}
            <div className="rounded-xl border border-brand-200 bg-white p-3 shadow-xs">
              <span className="text-xs font-black text-brand-900">Cột Phải</span>
              <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                Tiêu đề cột phải
                <input
                  type="text"
                  readOnly={readOnly}
                  value={card.compareData?.rightTitle ?? 'Não Sáng Tạo Của Con'}
                  onChange={(e) => {
                    const currentData = card.compareData || {}
                    updateLearnCard(stageIndex, {
                      compareData: { ...currentData, rightTitle: e.target.value },
                    })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="Não Sáng Tạo Của Con"
                />
              </label>
              <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                Nội dung giải thích cột phải
                <textarea
                  readOnly={readOnly}
                  value={card.compareData?.rightText ?? ''}
                  onChange={(e) => {
                    const currentData = card.compareData || {}
                    updateLearnCard(stageIndex, {
                      compareData: { ...currentData, rightText: e.target.value },
                    })
                  }}
                  rows={2}
                  style={{ ...textareaStyle, marginTop: '0.2rem', minHeight: '3rem' }}
                  placeholder="Chỉ có con mới có kỷ niệm riêng, cảm xúc thật, gia đình..."
                />
              </label>
              <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                URL Ảnh cột phải
                <input
                  type="url"
                  readOnly={readOnly}
                  value={card.compareData?.rightImage || card.compareImages?.right || ''}
                  onChange={(event) => {
                    const currentData = card.compareData || {}
                    updateLearnCard(stageIndex, {
                      compareData: { ...currentData, rightImage: event.target.value },
                      compareImages: { left: card.compareImages?.left || '', right: event.target.value },
                    })
                  }}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="https://cdn.example.com/kid-brain.webp"
                />
              </label>
              {!readOnly && (
                <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-brand-300 bg-amber-50 px-3 text-xs font-extrabold text-brand-900 hover:bg-amber-100">
                  <Eye size={15} className="mr-1.5" />
                  {uploadingStageMedia === `${stageIndex}:compareRight` ? 'Đang tải ảnh…' : 'Tải ảnh Cột Phải lên'}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={uploadingStageMedia !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void uploadLearnCardMedia(stageIndex, 'compareRight', file)
                      event.currentTarget.value = ''
                    }}
                  />
                </span>
              )}
              {(card.compareData?.rightImage || card.compareImages?.right) && (
                <div className="mt-2 overflow-hidden rounded-lg border border-brand-200 aspect-video">
                  <img src={card.compareData?.rightImage || card.compareImages?.right} alt="Minh họa Cột Phải" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 11. BLOCK: Poster Quy Tắc Vàng (poster) ── */}
      {block.type === 'poster' && (
        <div className="mt-3.5 rounded-2xl border-2 border-yellow-300 bg-yellow-50/70 p-4 shadow-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[11px] font-extrabold text-muted sm:col-span-2">
              Thông điệp Quy tắc Vàng to bản (Poster Headline)
              <textarea
                readOnly={readOnly}
                value={card.body}
                onChange={(e) => updateLearnCard(stageIndex, { body: e.target.value })}
                rows={2}
                style={{ ...textareaStyle, marginTop: '0.2rem', minHeight: '3rem' }}
                placeholder="Nghĩ ra ý tưởng của riêng mình trước, sau đó mới dùng AI..."
              />
            </label>

            <label className="text-[11px] font-extrabold text-muted">
              💡 Bí kíp bỏ túi của con
              <input
                type="text"
                readOnly={readOnly}
                value={card.tip}
                onChange={(e) => updateLearnCard(stageIndex, { tip: e.target.value })}
                style={{ ...inputStyle, marginTop: '0.2rem' }}
                placeholder="AI là người bạn gợi ý, con là thuyền trưởng chỉ huy!"
              />
            </label>

            <label className="text-[11px] font-extrabold text-muted">
              URL Ảnh Poster tùy chọn
              <input
                type="url"
                readOnly={readOnly}
                value={card.imageUrl ?? ''}
                onChange={(e) => updateLearnCard(stageIndex, { imageUrl: e.target.value })}
                style={{ ...inputStyle, marginTop: '0.2rem' }}
                placeholder="https://cdn.example.com/poster-gold.webp"
              />
            </label>

            {!readOnly && (
              <span className="sm:col-span-2 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-yellow-300 bg-white px-3 text-xs font-extrabold text-yellow-900 hover:bg-yellow-100">
                <Eye size={16} className="mr-2" aria-hidden="true" />
                {uploadingStageMedia === `${stageIndex}:imageUrl` ? 'Đang tải ảnh poster…' : 'Tải file ảnh poster lên'}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploadingStageMedia !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadLearnCardMedia(stageIndex, 'imageUrl', file)
                    event.currentTarget.value = ''
                  }}
                />
              </span>
            )}

            {card.imageUrl && (
              <div className="sm:col-span-2 overflow-hidden rounded-xl border border-yellow-200">
                <img src={card.imageUrl} alt={card.imageAlt || 'Poster'} className="aspect-video w-full rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 12. BLOCK: Bộ Sưu Tập Ảnh Minh Họa (images) ── */}
      {block.type === 'images' && (
        <div className="mt-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-end mb-3">
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  const currentList = card.additionalImages || []
                  const nextItem: StageImageItem = {
                    id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    url: '',
                    alt: 'Ảnh minh họa',
                    caption: '',
                  }
                  updateLearnCard(stageIndex, { additionalImages: [...currentList, nextItem] })
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
              >
                <Plus size={13} /> Tải thêm ảnh
              </button>
            )}
          </div>

          {(!card.additionalImages || card.additionalImages.length === 0) ? (
            <div className="rounded-xl border border-dashed border-emerald-300 bg-white/70 p-4 text-center text-xs font-bold text-emerald-800">
              Chưa có ảnh nào. Bấm "+ Tải thêm ảnh" ở trên để bắt đầu chèn ảnh minh họa.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {card.additionalImages.map((imgItem, imgIdx) => (
                <div key={imgItem.id || imgIdx} className="rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-black text-emerald-950">Ảnh minh họa #{imgIdx + 1}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextList = card.additionalImages?.filter((_, i) => i !== imgIdx) || []
                          updateLearnCard(stageIndex, { additionalImages: nextList })
                        }}
                        className="rounded-md p-1 text-coral-600 hover:bg-coral-50 cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                    URL Ảnh
                    <input
                      type="url"
                      readOnly={readOnly}
                      value={imgItem.url}
                      onChange={(e) => {
                        const nextList = [...(card.additionalImages || [])]
                        nextList[imgIdx] = { ...imgItem, url: e.target.value }
                        updateLearnCard(stageIndex, { additionalImages: nextList })
                      }}
                      style={{ ...inputStyle, marginTop: '0.2rem' }}
                      placeholder="https://cdn.example.com/illustration.webp"
                    />
                  </label>
                  {!readOnly && (
                    <span className="mt-1.5 flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100">
                      <Eye size={13} className="mr-1" />
                      {uploadingStageMedia === `${stageIndex}:additionalImage:${imgIdx}` ? 'Đang tải ảnh…' : 'Tải file ảnh lên'}
                      <input
                        className="sr-only"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={uploadingStageMedia !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void uploadAdditionalImageItem(stageIndex, imgIdx, file)
                          e.currentTarget.value = ''
                        }}
                      />
                    </span>
                  )}
                  <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                    Chú thích dưới ảnh (Caption)
                    <input
                      type="text"
                      readOnly={readOnly}
                      value={imgItem.caption ?? ''}
                      onChange={(e) => {
                        const nextList = [...(card.additionalImages || [])]
                        nextList[imgIdx] = { ...imgItem, caption: e.target.value }
                        updateLearnCard(stageIndex, { additionalImages: nextList })
                      }}
                      style={{ ...inputStyle, marginTop: '0.2rem' }}
                      placeholder="Chú thích ngắn gọn cho học sinh..."
                    />
                  </label>
                  {imgItem.url && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-emerald-100 aspect-video">
                      <img src={imgItem.url} alt={imgItem.alt || 'Ảnh'} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
