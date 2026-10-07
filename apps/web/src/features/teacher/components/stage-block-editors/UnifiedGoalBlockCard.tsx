import React, { useState } from 'react'
import { Target, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { StageBlockItem, LearnCardDraft, LearnVisualItemDraft } from '../../lib/authoring'
import { KEY_COLOR_PRESETS } from './types'
import { CmsImageUploader } from './CmsImageUploader'

export interface UnifiedGoalBlockCardProps {
  card: LearnCardDraft
  stageBlocks: StageBlockItem[]
  readOnly?: boolean
  updateBlockItem: (stageIndex: number, blockId: string, patch: Partial<StageBlockItem>) => void
  updateLearnCard: (index: number, patch: Partial<LearnCardDraft>) => void
  uploadingStageMedia: string | null
  setUploadingStageMedia: (val: string | null) => void
  uploadLearnCardMedia: (stageIndex: number, field: any, file: File) => Promise<void>
  courseId: string
  inputStyle?: React.CSSProperties
  textareaStyle?: React.CSSProperties
  showToast?: (msg: string, type?: any) => void
}

export function UnifiedGoalBlockCard({
  card,
  stageBlocks,
  readOnly = false,
  updateBlockItem,
  updateLearnCard,
  uploadingStageMedia,
  uploadLearnCardMedia,
  inputStyle,
  textareaStyle,
}: UnifiedGoalBlockCardProps) {
  const [collapsed, setCollapsed] = useState(false)

  const imageBlock = stageBlocks.find((b) => b.type === 'images' || b.id.startsWith('course-goal-image'))
  const textBlock = stageBlocks.find((b) => b.type === 'text' || b.id.startsWith('course-goal-text'))
  const keysBlock = stageBlocks.find((b) => b.type === 'layout-four-keys' || b.id.startsWith('course-goal-four-keys'))

  // 1. Dữ liệu Ảnh
  const heroImageUrl = imageBlock?.imageUrl || card.imageUrl || ''
  const heroImageAlt = imageBlock?.imageAlt || card.imageAlt || card.title || 'Ảnh mục tiêu'

  // 2. Dữ liệu Mục tiêu văn bản
  const goalTitle = textBlock?.title ?? card.title ?? ''
  const goalBody = textBlock?.body ?? card.body ?? ''
  const goalTip = textBlock?.tip ?? card.tip ?? ''

  // 3. Dữ liệu 4 Chìa khóa
  const keysTitle = keysBlock?.title ?? 'Bốn chiếc chìa khóa mở câu lệnh'
  const visualItems = keysBlock?.visualItems || []

  const handleHeroImageChange = (url: string) => {
    if (imageBlock) {
      updateBlockItem(0, imageBlock.id, { imageUrl: url })
    }
    updateLearnCard(0, { imageUrl: url })
  }

  const handleHeroImageUpload = async (file: File) => {
    await uploadLearnCardMedia(0, 'imageUrl', file)
    if (imageBlock && card.imageUrl) {
      updateBlockItem(0, imageBlock.id, { imageUrl: card.imageUrl })
    }
  }

  const handleGoalTitleChange = (val: string) => {
    if (textBlock) {
      updateBlockItem(0, textBlock.id, { title: val })
    }
    updateLearnCard(0, { title: val })
  }

  const handleGoalBodyChange = (val: string) => {
    if (textBlock) {
      updateBlockItem(0, textBlock.id, { body: val })
    }
    updateLearnCard(0, { body: val })
  }

  const handleGoalTipChange = (val: string) => {
    if (textBlock) {
      updateBlockItem(0, textBlock.id, { tip: val })
    }
    updateLearnCard(0, { tip: val })
  }

  const handleKeysTitleChange = (val: string) => {
    if (keysBlock) {
      updateBlockItem(0, keysBlock.id, { title: val })
    }
  }

  const handleAddKey = () => {
    if (!keysBlock) return
    const current = keysBlock.visualItems || []
    const nextIdx = current.length
    const preset = KEY_COLOR_PRESETS[nextIdx % KEY_COLOR_PRESETS.length]
    const nextItems: LearnVisualItemDraft[] = [
      ...current,
      {
        label: `CHÌA KHÓA ${nextIdx + 1}`,
        text: '',
        tone: preset.tone,
        sub: '',
        keyImage: preset.image,
      },
    ]
    updateBlockItem(0, keysBlock.id, { visualItems: nextItems })
  }

  const handleUpdateKeyText = (idx: number, text: string) => {
    if (!keysBlock) return
    const current = keysBlock.visualItems || []
    const nextItems = current.map((item, i) => (i === idx ? { ...item, text } : item))
    updateBlockItem(0, keysBlock.id, { visualItems: nextItems })
  }

  const handleUpdateKeyTone = (idx: number, presetTone: 'sky' | 'sun' | 'coral' | 'rose', keyImage: string) => {
    if (!keysBlock) return
    const current = keysBlock.visualItems || []
    const nextItems = current.map((item, i) =>
      i === idx ? { ...item, tone: presetTone, keyImage } : item
    )
    updateBlockItem(0, keysBlock.id, { visualItems: nextItems })
  }

  const handleRemoveKey = (idx: number) => {
    if (!keysBlock) return
    const current = keysBlock.visualItems || []
    const nextItems = current.filter((_, i) => i !== idx)
    updateBlockItem(0, keysBlock.id, { visualItems: nextItems })
  }

  return (
    <div
      className={cn(
        'group relative rounded-3xl border-2 transition-all shadow-clay-xs overflow-hidden',
        'border-brand-300 bg-white'
      )}
    >
      {/* ── CARD HEADER ── */}
      <div className="flex items-center justify-between gap-3 border-b border-brand-100 bg-gradient-to-r from-brand-50/90 via-sky-50/50 to-white px-5 py-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Target size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-lg bg-brand-600 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-2xs">
                Khối 1
              </span>
              <span className="text-xs sm:text-sm font-black text-brand-950 truncate">
                MỤC TIÊU BÀI HỌC (ẢNH + MỤC TIÊU + CHÌA KHÓA VÀNG)
              </span>
            </div>
            <p className="text-[11px] font-semibold text-brand-800/80 truncate hidden sm:block">
              Nội dung cốt lõi của Chặng 1 — Tự động căn chỉnh bố cục tối ưu cho học sinh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="flex items-center gap-1 rounded-xl border border-brand-200 bg-white px-2.5 py-1 text-xs font-black text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            <span>{collapsed ? 'Mở rộng' : 'Thu gọn'}</span>
          </button>
        </div>
      </div>

      {/* ── CARD BODY ── */}
      {!collapsed && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* PHẦN 1: 🖼️ ẢNH CHÍNH CỦA CHẶNG */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">🖼️</span>
                <span className="text-xs font-black uppercase tracking-wide text-emerald-950">
                  1. Ảnh Chủ Đạo Của Chặng (Hero Image)
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 hidden sm:inline">
                Tự động hiển thị nổi bật ở cột trái cho học sinh
              </span>
            </div>

            <CmsImageUploader
              imageUrl={heroImageUrl}
              imageAlt={heroImageAlt}
              readOnly={readOnly}
              isUploading={uploadingStageMedia === '0:imageUrl'}
              tone="emerald"
              inputStyle={inputStyle}
              onImageChange={handleHeroImageChange}
              onUploadFile={handleHeroImageUpload}
              urlPlaceholder="/assets/aiki-islands/island1_lesson1_cat.jpg"
            />
          </div>

          {/* PHẦN 2: 🎯 MỤC TIÊU CỐT LÕI */}
          <div className="rounded-2xl border-2 border-purple-300 bg-purple-50/50 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-purple-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">🎯</span>
                <span className="text-xs font-black uppercase tracking-wide text-purple-950">
                  2. Mục Tiêu Cốt Lõi &amp; Kỹ Năng Đạt Được
                </span>
              </div>
              <span className="text-[11px] font-bold text-purple-800 hidden sm:inline">
                Hộp mục tiêu màu tím trang trọng
              </span>
            </div>

            {/* Tiêu đề đoạn văn bản */}
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                Tiêu đề đoạn văn bản
              </span>
              <input
                readOnly={readOnly}
                value={goalTitle}
                onChange={(e) => handleGoalTitleChange(e.target.value)}
                placeholder="VD: Mục tiêu bài học: Bài 1.1 — Một từ hay năm từ?"
                className="w-full rounded-xl border border-purple-300 bg-white px-3.5 py-2.5 text-sm font-black text-slate-900 shadow-2xs outline-none focus:border-purple-500 transition"
              />
            </label>

            {/* Nội dung đoạn văn bản */}
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                Nội dung đoạn văn bản *
              </span>
              <textarea
                readOnly={readOnly}
                value={goalBody}
                onChange={(e) => handleGoalBodyChange(e.target.value)}
                placeholder="VD: Trẻ biết cách viết câu lệnh đầu tiên cho AI..."
                rows={3}
                style={textareaStyle}
                className="w-full rounded-xl border border-purple-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs outline-none focus:border-purple-500 transition leading-relaxed"
              />
            </label>

            {/* Câu ghi nhớ / bí kíp bỏ túi */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 space-y-1.5">
              <label className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                <span>💡</span> Câu ghi nhớ / Bí kíp bỏ túi (Tùy chọn)
              </label>
              <input
                readOnly={readOnly}
                value={goalTip}
                onChange={(e) => handleGoalTipChange(e.target.value)}
                placeholder="Một câu ngắn để học sinh nhớ ý chính của đoạn này..."
                className="w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* PHẦN 3: 🔑 BỐN CHIẾC CHÌA KHÓA VÀNG */}
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-amber-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔑</span>
                <span className="text-xs font-black uppercase tracking-wide text-amber-950">
                  3. Bốn Chiếc Chìa Khóa Câu Lệnh (Ghi Nhớ Trọng Tâm)
                </span>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleAddKey}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-black text-white shadow-2xs transition cursor-pointer self-start sm:self-auto active:scale-95"
                >
                  <Plus size={13} className="shrink-0" />
                  <span>+ Thêm chìa khóa</span>
                </button>
              )}
            </div>

            {/* Tiêu đề khối chìa khóa */}
            <label className="block space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                Tiêu đề khối chìa khóa *
              </span>
              <input
                readOnly={readOnly}
                value={keysTitle}
                onChange={(e) => handleKeysTitleChange(e.target.value)}
                placeholder="VD: Bốn chiếc chìa khóa mở câu lệnh..."
                className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-sm font-black text-slate-900 shadow-2xs outline-none focus:border-amber-500 transition"
              />
            </label>

            {/* Danh sách các chìa khóa */}
            <div className="space-y-3">
              {visualItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-amber-300 bg-white/80 p-4 text-center text-xs font-bold text-amber-800">
                  Chưa có chìa khóa nào. Bấm "+ Thêm chìa khóa" để tạo các điểm ghi nhớ trọng tâm.
                </div>
              ) : (
                visualItems.map((vItem, vIdx) => {
                  const activeTone = vItem.tone || KEY_COLOR_PRESETS[vIdx % KEY_COLOR_PRESETS.length].tone
                  const activePreset =
                    KEY_COLOR_PRESETS.find((p) => p.tone === activeTone) ||
                    KEY_COLOR_PRESETS[vIdx % KEY_COLOR_PRESETS.length]

                  return (
                    <div
                      key={vIdx}
                      className={cn(
                        'flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-2xl border transition-all bg-white shadow-2xs',
                        activePreset.bg
                      )}
                    >
                      {/* Cột icon chìa khóa + Bộ chọn màu */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="size-11 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                          <img
                            src={vItem.keyImage || activePreset.image}
                            alt={vItem.label || `Chìa khóa ${vIdx + 1}`}
                            className="size-9 rounded-lg object-contain"
                            onError={(e) => {
                              // fallback to preset image
                              ;(e.target as HTMLImageElement).src = activePreset.image
                            }}
                          />
                        </div>

                        {/* Các nút đổi màu preset */}
                        {!readOnly && (
                          <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-slate-200/60 shadow-2xs">
                            {KEY_COLOR_PRESETS.map((preset) => {
                              const isSelected = activeTone === preset.tone
                              return (
                                <button
                                  key={preset.tone}
                                  type="button"
                                  onClick={() => handleUpdateKeyTone(vIdx, preset.tone, preset.image)}
                                  className={cn(
                                    'size-4 rounded-full border transition-transform cursor-pointer',
                                    preset.tone === 'sky' && 'bg-blue-500 border-blue-600',
                                    preset.tone === 'sun' && 'bg-amber-400 border-amber-500',
                                    preset.tone === 'coral' && 'bg-orange-500 border-orange-600',
                                    preset.tone === 'rose' && 'bg-rose-500 border-rose-600',
                                    isSelected ? 'scale-125 ring-2 ring-slate-800' : 'hover:scale-110 opacity-70 hover:opacity-100'
                                  )}
                                  title={`Đổi sang màu ${preset.name}`}
                                />
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Badge số thứ tự [1], [2] */}
                      <span className={cn('px-2.5 py-1 rounded-xl text-xs font-black shrink-0 w-fit', activePreset.badge)}>
                        [{vIdx + 1}]
                      </span>

                      {/* Input nội dung chìa khóa */}
                      <div className="flex-1 min-w-0">
                        <input
                          readOnly={readOnly}
                          value={vItem.text || ''}
                          onChange={(e) => handleUpdateKeyText(vIdx, e.target.value)}
                          placeholder={`Nội dung chìa khóa ${vIdx + 1} (VD: "Con mèo")...`}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                        />
                      </div>

                      {/* Nút xóa chìa khóa */}
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKey(vIdx)}
                          className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer self-end sm:self-auto shrink-0"
                          title="Xóa chìa khóa này"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
