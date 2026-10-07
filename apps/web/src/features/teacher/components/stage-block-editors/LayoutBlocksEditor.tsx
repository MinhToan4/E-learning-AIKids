import React from 'react'
import {
  Eye,
  Upload,
  Trash2,
  Plus,
  Clapperboard,
  Image as ImageIcon,
  CheckCircle2,
  Lightbulb,
  Target,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import type { LearnVisualItemDraft } from '../../lib/authoring'
import { KEY_COLOR_PRESETS, type StageBlockEditorBaseProps } from './types'
import { CmsImageUploader } from './CmsImageUploader'

export interface LayoutBlocksEditorProps extends StageBlockEditorBaseProps {
  stageInfo: { title: string; icon: any; desc: string }
  isConfirmOption: boolean
  optionLetter: string
}

export function LayoutBlocksEditor({
  block,
  stageIndex,
  card,
  readOnly,
  updateBlockItem,
  updateLearnCard,
  uploadingStageMedia,
  setUploadingStageMedia,
  uploadLearnCardMedia,
  courseId,
  stageInfo,
  inputStyle,
  textareaStyle,
  showToast,
  isConfirmOption,
  optionLetter,
}: LayoutBlocksEditorProps) {
  return (
    <>
      {/* ── 1. BLOCK: Đoạn văn bản (text / layout-text) ── */}
      {(block.type === 'text' || block.type === 'layout-text') && (
        <div className="mt-3.5 space-y-3.5 rounded-2xl border-2 border-brand-100 bg-brand-50/20 p-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Tiêu đề đoạn văn bản
            </span>
            <input
              readOnly={readOnly}
              value={block.title ?? ''}
              onChange={(event) => updateBlockItem(stageIndex, block.id, { title: event.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
              placeholder={`VD: ${stageInfo.title}`}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Nội dung đoạn văn bản *
            </span>
            <textarea
              readOnly={readOnly}
              value={block.body ?? ''}
              onChange={(event) => updateBlockItem(stageIndex, block.id, { body: event.target.value })}
              rows={4}
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-medium text-slate-800 leading-relaxed shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition resize-y"
              placeholder="Nội dung chính hướng dẫn học sinh đọc hoặc xem..."
            />
          </label>

          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-3.5 space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
              <Lightbulb size={15} className="text-amber-600 shrink-0" />
              <span>Câu ghi nhớ / Bí kíp bỏ túi (tùy chọn)</span>
            </label>
            <input
              readOnly={readOnly}
              value={block.tip ?? ''}
              onChange={(event) => updateBlockItem(stageIndex, block.id, { tip: event.target.value })}
              className="w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-sm font-bold text-amber-950 placeholder:text-amber-400/80 shadow-2xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
              placeholder="Một câu ngắn để học sinh nhớ ý chính của đoạn này"
            />
          </div>
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
              placeholder="$$\\text{Ý tưởng con} + \\text{Sức mạnh AI} = \\text{Tác phẩm}$$"
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

      {/* ── 4. BLOCK: 2 Cột Chữ + Media hoặc 2 Cột Văn Bản Song Song (layout-split) ── */}
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
            <label className="mt-2.5 block text-xs font-extrabold text-text">
              {block.columns === 2 ? 'Nội dung cột trái' : 'Nội dung giải thích'}
              <textarea
                readOnly={readOnly}
                value={block.body ?? ''}
                onChange={(e) => updateBlockItem(stageIndex, block.id, { body: e.target.value })}
                rows={4}
                style={{ ...textareaStyle, marginTop: '0.25rem' }}
                placeholder={block.columns === 2 ? 'Nhập nội dung cột trái...' : 'Nhập nội dung giải thích...'}
              />
            </label>
          </div>
          <div>
            {block.columns === 2 && !block.imageUrl ? (
              <div>
                <label className="block text-xs font-extrabold text-text">Nội dung cột phải
                  <textarea
                    readOnly={readOnly}
                    value={block.tip ?? ''}
                    onChange={(e) => updateBlockItem(stageIndex, block.id, { tip: e.target.value })}
                    rows={6}
                    style={{ ...textareaStyle, marginTop: '0.25rem' }}
                    placeholder="Nhập nội dung cột phải..."
                  />
                </label>
                {!readOnly && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => updateBlockItem(stageIndex, block.id, { imageUrl: 'https://' })}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                    >
                      + Chuyển sang ảnh minh họa
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <CmsImageUploader
                label="Hình ảnh minh họa"
                sublabel="Ảnh hiển thị ở cột minh họa cho bài học"
                imageUrl={block.imageUrl}
                imageAlt={block.imageAlt || 'Media'}
                readOnly={readOnly}
                isUploading={uploadingStageMedia === `${stageIndex}:block:${block.id}`}
                tone="sky"
                aspectRatio="video"
                maxHeight="240px"
                inputStyle={inputStyle}
                onImageChange={(url) => updateBlockItem(stageIndex, block.id, { imageUrl: url })}
                onUploadFile={async (file) => {
                  setUploadingStageMedia(`${stageIndex}:block:${block.id}`)
                  try {
                    const res = await uploadCmsCourseMedia({ file, purpose: 'block_image', questId: courseId })
                    if (res?.url) {
                      updateBlockItem(stageIndex, block.id, { imageUrl: res.url })
                      showToast('Tải ảnh thành công!', 'success')
                    }
                  } catch {
                    showToast('Tải ảnh thất bại', 'danger')
                  } finally {
                    setUploadingStageMedia(null)
                  }
                }}
                urlPlaceholder="https://cdn.example.com/image.webp"
              />
            )}
          </div>
        </div>
      )}

      {/* ── 4B. BLOCK: Phương Án Xác Nhận Mục Tiêu (layout-confirm-option) ── */}
      {isConfirmOption && (
        <div className={cn(
          "mt-3.5 space-y-3.5 rounded-3xl border-2 p-4 sm:p-5 shadow-clay-xs transition-all",
          block.isCorrect
            ? "border-emerald-500 bg-gradient-to-b from-emerald-50/40 to-white ring-2 ring-emerald-200/80"
            : "border-slate-200 bg-white hover:border-slate-300"
        )}>
          {/* Header thẻ phương án */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <span className="rounded-xl bg-emerald-600 text-white px-3 py-1 text-xs font-black shadow-xs">
              PHƯƠNG ÁN {optionLetter || 'A'}
            </span>
            {block.isCorrect && (
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 flex items-center gap-1 shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Đáp án đúng
              </span>
            )}
          </div>

          {/* Vùng upload ảnh trực quan */}
          <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/40 p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                <ImageIcon size={15} className="text-sky-600" />
                Ảnh minh họa phương án
              </span>
              {block.imageUrl && !readOnly && (
                <button
                  type="button"
                  onClick={() => updateBlockItem(stageIndex, block.id, { imageUrl: '' })}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-coral-600 hover:text-coral-700 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Trash2 size={13} className="shrink-0" /> Xóa ảnh
                </button>
              )}
            </div>

            <CmsImageUploader
              label={`Ảnh Minh Họa (Phương án ${optionLetter})`}
              imageUrl={block.imageUrl}
              imageAlt={block.title || `Phương án ${optionLetter}`}
              readOnly={readOnly}
              isUploading={uploadingStageMedia === `${stageIndex}:block:${block.id}`}
              tone="sky"
              aspectRatio="16/10"
              maxHeight="220px"
              showUrlInput={false}
              inputStyle={inputStyle}
              onImageChange={(url) => updateBlockItem(stageIndex, block.id, { imageUrl: url })}
              onUploadFile={async (file) => {
                setUploadingStageMedia(`${stageIndex}:block:${block.id}`)
                try {
                  const res = await uploadCmsCourseMedia({ file, purpose: 'block_image', questId: courseId })
                  if (res?.url) {
                    updateBlockItem(stageIndex, block.id, { imageUrl: res.url })
                    showToast('Tải ảnh thành công!', 'success')
                  }
                } catch {
                  showToast('Tải ảnh thất bại', 'danger')
                } finally {
                  setUploadingStageMedia(null)
                }
              }}
            />
          </div>

          {/* Ô nhập nội dung phương án */}
          <label className="block space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Nội dung chữ của phương án *
            </span>
            <input
              readOnly={readOnly}
              value={block.body ?? block.title ?? ''}
              onChange={(e) => updateBlockItem(stageIndex, block.id, { body: e.target.value, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
              placeholder={`VD: Phương án ${optionLetter || 'A'}...`}
            />
          </label>

          {/* Nút chọn đáp án đúng to bản chuẩn Hallmark */}
          <label
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer select-none border shadow-2xs",
              block.isCorrect
                ? "border-emerald-600 bg-emerald-600 text-white shadow-clay-xs"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/60"
            )}
            title="Chọn phương án này làm đáp án đúng"
          >
            <input
              type="radio"
              name={`course-confirm-correct-${stageIndex}`}
              checked={Boolean(block.isCorrect)}
              disabled={readOnly}
              onChange={() => {
                updateBlockItem(stageIndex, block.id, { isCorrect: true })
              }}
              className="accent-white size-3.5 cursor-pointer"
            />
            <span>{block.isCorrect ? '✓ ĐÂY LÀ ĐÁP ÁN ĐÚNG' : 'Chọn làm đáp án đúng'}</span>
          </label>
        </div>
      )}

      {/* ── 5A. BLOCK: Bốn chiếc chìa khóa câu lệnh (layout-four-keys) ── */}
      {block.type === 'layout-four-keys' && !isConfirmOption && (
        <div className="mt-3.5 rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 via-sky-50/30 to-white p-4 sm:p-5 shadow-clay-xs space-y-4">
          {/* Header Tiêu đề & Nút thêm chìa khóa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-amber-200/60 pb-3">
            <div className="flex-1">
              <label className="text-xs font-black uppercase text-amber-950 tracking-wider block mb-1">
                Tiêu đề khối 4 chìa khóa *
              </label>
              <input
                readOnly={readOnly}
                value={block.title ?? ''}
                onChange={(e) => updateBlockItem(stageIndex, block.id, { title: e.target.value })}
                placeholder="VD: Bốn chiếc chìa khóa mở câu lệnh..."
                className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-sm font-black text-slate-900 shadow-2xs outline-none focus:border-amber-500 transition"
              />
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  const currentItems = block.visualItems || []
                  const nextIdx = currentItems.length
                  const preset = KEY_COLOR_PRESETS[nextIdx % KEY_COLOR_PRESETS.length]
                  const nextItems: LearnVisualItemDraft[] = [
                    ...currentItems,
                    {
                      label: `CHÌA KHÓA ${nextIdx + 1}`,
                      text: '',
                      tone: preset.tone,
                      sub: '',
                      keyImage: preset.image,
                    },
                  ]
                  updateBlockItem(stageIndex, block.id, { visualItems: nextItems })
                }}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-black text-white cursor-pointer shadow-2xs transition shrink-0 self-start sm:self-end active:scale-95"
              >
                <Plus size={14} className="shrink-0" />
                <span>Thêm chìa khóa</span>
              </button>
            )}
          </div>

          {/* Lưới Chìa Khóa Vàng */}
          <div className="rounded-2xl border-2 border-amber-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <span>🔑</span>
                <span>Bốn Chiếc Chìa Khóa Vàng ({(block.visualItems || []).length})</span>
              </span>
            </div>

                <div className="grid gap-2">
                  {(block.visualItems || []).map((item, vIdx) => {
                    let activeTone = item.tone
                    let displayLabel = item.label
                    const colorMatch = displayLabel.match(/\((Xanh Sky|Vàng Sun|Cam Mango|Hồng Gum|sky|sun|coral|rose)\)/i)
                    if (colorMatch) {
                      const colorStr = colorMatch[1].toLowerCase()
                      if (colorStr.includes('xanh') || colorStr === 'sky') activeTone = 'sky'
                      else if (colorStr.includes('vàng') || colorStr === 'sun') activeTone = 'sun'
                      else if (colorStr.includes('cam') || colorStr === 'coral') activeTone = 'coral'
                      else if (colorStr.includes('hồng') || colorStr === 'rose') activeTone = 'rose'
                      displayLabel = displayLabel.replace(/\s*\((Xanh Sky|Vàng Sun|Cam Mango|Hồng Gum|sky|sun|coral|rose)\)/i, '').trim()
                    }

                    const activePreset = KEY_COLOR_PRESETS.find((p) => p.tone === activeTone) || KEY_COLOR_PRESETS[vIdx % KEY_COLOR_PRESETS.length]
                    const activeImage = item.keyImage || activePreset.image

                    return (
                      <div
                        key={vIdx}
                        className={cn(
                          "p-2.5 rounded-2xl border-2 bg-white/95 shadow-clay-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 transition-all",
                          activePreset.bg
                        )}
                      >
                        {/* Bên trái: Ảnh chìa khóa + Nút đổi màu */}
                        <div className="flex flex-col items-center gap-1 shrink-0 self-center sm:self-start">
                          <img
                            src={activeImage}
                            alt={activePreset.name}
                            className="w-10 h-10 rounded-xl object-contain bg-white border border-amber-200 p-0.5 shadow-2xs"
                          />
                          {!readOnly && (
                            <div className="flex items-center gap-0.5 bg-white/90 p-0.5 rounded-full border border-slate-200 shadow-2xs">
                              {KEY_COLOR_PRESETS.map((preset) => {
                                const isSelected = (item.tone || activePreset.tone) === preset.tone
                                return (
                                  <button
                                    key={preset.tone}
                                    type="button"
                                    onClick={() => {
                                      const next = [...(block.visualItems || [])]
                                      next[vIdx] = {
                                        ...item,
                                        label: displayLabel,
                                        tone: preset.tone,
                                        keyImage: preset.image,
                                      }
                                      updateBlockItem(stageIndex, block.id, { visualItems: next })
                                    }}
                                    className={cn(
                                      "text-[10px] leading-none p-0.5 rounded-full cursor-pointer hover:scale-110 transition-transform",
                                      isSelected && "ring-2 ring-brand-500 ring-offset-1 scale-110"
                                    )}
                                    title={preset.name}
                                  >
                                    {preset.icon}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Ở giữa: Tên chìa + Ví dụ */}
                        <div className="flex-1 min-w-0 w-full flex flex-col gap-1.5">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                            <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 text-center", activePreset.badge)}>
                              [{vIdx + 1}]
                            </span>
                            <div className="flex-1 min-w-0">
                              <input
                                readOnly={readOnly}
                                value={displayLabel}
                                onChange={(e) => {
                                  const next = [...(block.visualItems || [])]
                                  next[vIdx] = {
                                    ...item,
                                    label: e.target.value,
                                    tone: item.tone || activePreset.tone,
                                    keyImage: item.keyImage || activePreset.image,
                                  }
                                  updateBlockItem(stageIndex, block.id, { visualItems: next })
                                }}
                                placeholder="Tên chìa khóa (VD: CÁI GÌ)"
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-900 outline-none focus:border-brand-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <input
                                readOnly={readOnly}
                                value={item.sub ?? ''}
                                onChange={(e) => {
                                  const next = [...(block.visualItems || [])]
                                  next[vIdx] = {
                                    ...item,
                                    label: displayLabel,
                                    sub: e.target.value,
                                    tone: item.tone || activePreset.tone,
                                    keyImage: item.keyImage || activePreset.image,
                                  }
                                  updateBlockItem(stageIndex, block.id, { visualItems: next })
                                }}
                                placeholder="Phụ đề gợi ý (VD: Ai, đồ vật gì)"
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 outline-none focus:border-brand-500"
                              />
                            </div>
                          </div>

                          <div>
                            <input
                              readOnly={readOnly}
                              value={item.text}
                              onChange={(e) => {
                                const next = [...(block.visualItems || [])]
                                next[vIdx] = {
                                  ...item,
                                  label: displayLabel,
                                  text: e.target.value,
                                  tone: item.tone || activePreset.tone,
                                  keyImage: item.keyImage || activePreset.image,
                                }
                                updateBlockItem(stageIndex, block.id, { visualItems: next })
                              }}
                              placeholder="Ví dụ mẫu (VD: 'một cái cốc')"
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-brand-500"
                            />
                          </div>
                        </div>

                        {/* Bên phải: Nút xóa */}
                        {!readOnly && (block.visualItems || []).length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = (block.visualItems || []).filter((_, i) => i !== vIdx)
                              updateBlockItem(stageIndex, block.id, { visualItems: next })
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer self-center sm:self-start"
                            title="Xóa chìa khóa này"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

      {/* ── 5B. BLOCK: Lưới Ô Thẻ / Chuỗi Storyboard (layout-grid / layout-storyboard) ── */}
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
                className="flex min-h-9 items-center gap-1 rounded-xl border border-sky-300 bg-white px-3 text-xs font-extrabold text-sky-700 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Plus size={14} className="shrink-0" /> Thêm ô con
              </button>
            )}
          </div>
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <label className="text-[11px] font-extrabold text-muted">Lời dẫn
              <textarea readOnly={readOnly} value={block.body ?? ''} onChange={(e) => updateBlockItem(stageIndex, block.id, { body: e.target.value })} rows={2} style={{ ...textareaStyle, minHeight: '2.5rem', marginTop: '0.25rem' }} />
            </label>
            <label className="text-[11px] font-extrabold text-muted">Câu ghi nhớ
              <textarea readOnly={readOnly} value={block.tip ?? ''} onChange={(e) => updateBlockItem(stageIndex, block.id, { tip: e.target.value })} rows={2} style={{ ...textareaStyle, minHeight: '2.5rem', marginTop: '0.25rem' }} />
            </label>
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
                    className="mt-5 grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-danger cursor-pointer hover:bg-rose-50"
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

      {/* ── 7. BLOCK: Video Bài Giảng (video) ── */}
      {block.type === 'video' && (
        <div className="mt-3.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-4 shadow-xs">
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-indigo-100/70 border border-indigo-200/80 p-2.5 text-xs text-indigo-950">
            <span className="text-base select-none shrink-0">💡</span>
            <div>
              <p className="font-bold">Quy chuẩn hiển thị Video 16:9 sạch bóng:</p>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Phụ đề và thuyết minh sẽ được đưa vào dải chuyên dụng dưới chân video, không đè lên hình ảnh giúp các bé quan sát toàn vẹn nội dung bài giảng.
              </p>
            </div>
          </div>
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
    </>
  )
}
