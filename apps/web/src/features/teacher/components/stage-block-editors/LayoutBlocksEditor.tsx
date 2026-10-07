import React from 'react'
import {
  Eye,
  Upload,
  Trash2,
  Plus,
  Clapperboard,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import type { LearnVisualItemDraft } from '../../lib/authoring'
import { KEY_COLOR_PRESETS, type StageBlockEditorBaseProps } from './types'

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
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 4B. BLOCK: Phương Án Xác Nhận Mục Tiêu (layout-confirm-option) ── */}
      {isConfirmOption && (
        <div className="mt-3.5 space-y-3.5 rounded-2xl border-2 border-brand-200/80 bg-gradient-to-b from-brand-50/40 to-white p-4">
          <label className="block text-xs font-extrabold text-slate-800">
            Tiêu đề phương án
            <input
              readOnly={readOnly}
              value={block.title ?? ''}
              onChange={(e) => updateBlockItem(stageIndex, block.id, { title: e.target.value })}
              style={{ ...inputStyle, marginTop: '0.35rem' }}
              placeholder={`VD: Bộ chìa khoá ${optionLetter || 'A'}`}
            />
          </label>

          {/* Vùng upload ảnh thật trực quan */}
          <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-4">
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

            {block.imageUrl ? (
              <div className="relative group overflow-hidden rounded-2xl border-2 border-sky-300 bg-white shadow-sm">
                <div className="aspect-[16/10] sm:aspect-[2/1] w-full max-h-[300px] bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={block.imageUrl}
                    alt={block.title || `Phương án ${optionLetter}`}
                    className="size-full object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                {!readOnly && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                    <label className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-800 shadow-md hover:bg-slate-50 cursor-pointer shrink-0 whitespace-nowrap">
                      <Upload size={14} className="shrink-0" />
                      <span>Đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploadingStageMedia !== null}
                        onChange={async (event) => {
                          const file = event.target.files?.[0]
                          if (file) {
                            setUploadingStageMedia(`${stageIndex}:block:${block.id}`)
                            try {
                              const res = await uploadCmsCourseMedia({ file, purpose: 'block_image', questId: courseId })
                              if (res?.url) {
                                updateBlockItem(stageIndex, block.id, { imageUrl: res.url })
                                showToast('Đổi ảnh thành công!', 'success')
                              } else {
                                throw new Error('No URL returned')
                              }
                            } catch {
                              const reader = new FileReader()
                              reader.onload = () => {
                                updateBlockItem(stageIndex, block.id, { imageUrl: reader.result as string })
                                showToast('Đã tải ảnh preview thành công!', 'success')
                              }
                              reader.readAsDataURL(file)
                            } finally {
                              setUploadingStageMedia(null)
                            }
                          }
                          event.currentTarget.value = ''
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => updateBlockItem(stageIndex, block.id, { imageUrl: '' })}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-black text-white shadow-md hover:bg-rose-700 cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      <Trash2 size={14} className="shrink-0" />
                      <span>Xóa ảnh</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center rounded-xl bg-white border border-sky-200">
                <div className="grid size-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 mb-2">
                  <Upload size={22} />
                </div>
                <p className="text-xs font-bold text-slate-700 mb-1">Tải ảnh từ máy tính lên</p>
                <p className="text-[11px] font-semibold text-slate-400 mb-3">Hỗ trợ PNG, JPG, WEBP</p>
                {!readOnly && (
                  <label className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-black shadow-xs cursor-pointer active:scale-95 transition shrink-0 whitespace-nowrap">
                    <Upload size={14} className="shrink-0" />
                    <span>{uploadingStageMedia === `${stageIndex}:block:${block.id}` ? 'Đang tải lên…' : 'Tải ảnh từ máy tính lên'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      disabled={uploadingStageMedia !== null}
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (file) {
                          setUploadingStageMedia(`${stageIndex}:block:${block.id}`)
                          try {
                            const res = await uploadCmsCourseMedia({ file, purpose: 'block_image', questId: courseId })
                            if (res?.url) {
                              updateBlockItem(stageIndex, block.id, { imageUrl: res.url })
                              showToast('Tải ảnh thành công!', 'success')
                            } else {
                              throw new Error('No URL returned')
                            }
                          } catch {
                            const reader = new FileReader()
                            reader.onload = () => {
                              updateBlockItem(stageIndex, block.id, { imageUrl: reader.result as string })
                              showToast('Đã tải ảnh preview thành công!', 'success')
                            }
                            reader.readAsDataURL(file)
                          } finally {
                            setUploadingStageMedia(null)
                          }
                        }
                        event.currentTarget.value = ''
                      }}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Nội dung văn bản (Text / Mô tả) */}
          <label className="block text-xs font-extrabold text-slate-800">
            Nội dung chữ của phương án (kết hợp Chữ + Ảnh hoặc chỉ dùng Chữ)
            <textarea
              readOnly={readOnly}
              value={block.body ?? ''}
              onChange={(e) => updateBlockItem(stageIndex, block.id, { body: e.target.value })}
              rows={3}
              style={{ ...textareaStyle, marginTop: '0.35rem' }}
              placeholder="Nhập nội dung phương án cho học sinh lựa chọn..."
            />
          </label>
        </div>
      )}

      {/* ── 5A. BLOCK: Bốn chiếc chìa khóa câu lệnh (layout-four-keys) ── */}
      {block.type === 'layout-four-keys' && !isConfirmOption && (
        <div className="mt-3.5 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/70 via-sky-50/40 to-white p-3.5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label className="text-xs font-extrabold text-text flex-1">
              Tiêu đề:
              <input
                readOnly={readOnly}
                value={block.title ?? ''}
                onChange={(e) => updateBlockItem(stageIndex, block.id, { title: e.target.value })}
                style={{ ...inputStyle, marginTop: '0.2rem' }}
                placeholder="VD: Bốn chiếc chìa khóa mở câu lệnh..."
              />
            </label>
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
                className="flex min-h-9 items-center gap-1 rounded-xl border border-sky-300 bg-white px-3 text-xs font-extrabold text-sky-700 cursor-pointer shadow-xs hover:bg-sky-50 shrink-0 whitespace-nowrap"
              >
                <Plus size={14} className="shrink-0" /> Thêm chìa khóa
              </button>
            )}
          </div>

          <div className="grid gap-2.5">
            {(block.visualItems || []).map((item, vIdx) => {
              // Tự động làm sạch label nếu có chứa tên màu cũ trong ngoặc: (Xanh Sky), (Vàng Sun), v.v.
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
                    "p-3 rounded-2xl border-2 bg-white/95 shadow-clay-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all",
                    activePreset.bg
                  )}
                >
                  {/* Bên trái: Ảnh chìa khóa thực tế + Bộ nút chip màu mini */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0 self-center sm:self-start">
                    <img
                      src={activeImage}
                      alt={activePreset.name}
                      className="w-12 h-12 rounded-xl object-contain bg-white border-2 border-amber-200 p-1 shadow-xs"
                    />
                    {!readOnly && (
                      <div className="flex items-center gap-1 bg-white/90 p-0.5 rounded-full border border-slate-200 shadow-xs">
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
                                "text-xs leading-none p-0.5 rounded-full cursor-pointer hover:scale-110 transition-transform",
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

                  {/* Ở giữa: 2 dòng input */}
                  <div className="flex-1 min-w-0 w-full flex flex-col gap-2">
                    {/* Dòng 1: Badge + Tên chìa khóa + Phụ đề gợi ý */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shrink-0 text-center", activePreset.badge)}>
                        [{vIdx + 1}]
                      </span>
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] font-black text-muted block sm:hidden">Tên chìa khóa</label>
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
                          style={{ ...inputStyle, minHeight: '2.25rem', marginTop: 0 }}
                          placeholder="Tên chìa khóa (VD: CÁI GÌ)"
                          className="w-full font-black text-sm"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] font-black text-muted block sm:hidden">Phụ đề gợi ý</label>
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
                          style={{ ...inputStyle, minHeight: '2.25rem', marginTop: 0 }}
                          placeholder="Phụ đề gợi ý (VD: Ai, đồ vật gì)"
                          className="w-full text-xs font-medium text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Dòng 2: Nội dung ví dụ mẫu */}
                    <div>
                      <label className="text-[10px] font-black text-muted block sm:hidden">Ví dụ mẫu</label>
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
                        style={{ ...inputStyle, minHeight: '2.25rem', marginTop: 0 }}
                        placeholder="Ví dụ mẫu (VD: 'một cái cốc')"
                        className="w-full text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Bên phải: Nút xóa */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = (block.visualItems || []).filter((_, i) => i !== vIdx)
                        updateBlockItem(stageIndex, block.id, { visualItems: next })
                      }}
                      className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-danger cursor-pointer hover:bg-rose-50 self-center sm:self-start mt-1"
                      title="Xóa ô này"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              )
            })}
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
