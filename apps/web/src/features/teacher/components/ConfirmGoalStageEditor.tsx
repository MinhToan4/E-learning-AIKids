import { useState, useCallback } from 'react'
import {
  HelpCircle,
  Volume2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Type,
  Sparkles,
  Upload,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import type { SixStageConfirmGoal, SixStageConfirmOption } from '@/shared/lib/api'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { cn } from '@/shared/lib/cn'

interface ConfirmGoalStageEditorProps {
  confirmGoal: SixStageConfirmGoal
  onChange: (patch: Partial<SixStageConfirmGoal>) => void
  previewAikiVoice: (stageIndex: number, text: string) => void
  readOnly?: boolean
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void
  questId?: string
}

const PRESET_KEYS_IMAGES = [
  { label: 'Bộ Chìa A (SVG)', url: '/assets/aiki-keys/option_a_4keys.svg' },
  { label: 'Bộ Chìa B - ĐÚNG (SVG)', url: '/assets/aiki-keys/option_b_4keys.svg' },
  { label: 'Bộ Chìa C (SVG)', url: '/assets/aiki-keys/option_c_4keys.svg' },
  { label: 'Bìa Bài 1.2 (JPG)', url: '/assets/aiki-islands/island1_lesson2_keys_v2.jpg' },
]

export function ConfirmGoalStageEditor({
  confirmGoal,
  onChange,
  previewAikiVoice,
  readOnly = false,
  showToast,
  questId,
}: ConfirmGoalStageEditorProps) {
  const options = confirmGoal.options || []

  // Quản lý mode (ảnh hoặc text) cho từng option, mặc định dựa trên có imageUrl hay không
  const [optionModes, setOptionModes] = useState<Record<number, 'image' | 'text'>>({})
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  const getOptionMode = (idx: number, opt: SixStageConfirmOption): 'image' | 'text' => {
    if (optionModes[idx]) return optionModes[idx]
    return opt.imageUrl && opt.imageUrl.trim() !== '' ? 'image' : 'text'
  }

  const setOptionMode = (idx: number, mode: 'image' | 'text') => {
    setOptionModes((prev) => ({ ...prev, [idx]: mode }))
    if (mode === 'text') {
      // Khi chuyển sang text, giữ text và xóa imageUrl
      handleUpdateOption(idx, { imageUrl: '' })
    } else if (mode === 'image' && (!options[idx]?.imageUrl || options[idx]?.imageUrl?.trim() === '')) {
      // Khi chuyển sang ảnh mà chưa có, gợi ý preset tương ứng A/B/C
      const preset = PRESET_KEYS_IMAGES[Math.min(idx, PRESET_KEYS_IMAGES.length - 1)]
      if (preset) {
        handleUpdateOption(idx, { imageUrl: preset.url })
      }
    }
  }

  const handleUpdateOption = useCallback(
    (optIdx: number, patch: Partial<SixStageConfirmOption>) => {
      if (readOnly) return
      const nextOptions = [...options]
      nextOptions[optIdx] = { ...nextOptions[optIdx], ...patch }
      onChange({ options: nextOptions })
    },
    [onChange, options, readOnly]
  )

  const handleAddOption = () => {
    if (readOnly) return
    const nextIdx = options.length
    const letter = String.fromCharCode(65 + nextIdx)
    const newId = `opt-${String.fromCharCode(97 + nextIdx)}`
    const preset = PRESET_KEYS_IMAGES[Math.min(nextIdx, PRESET_KEYS_IMAGES.length - 1)]

    const newOption: SixStageConfirmOption = {
      id: newId,
      text: `Bộ chìa khoá ${letter}`,
      imageUrl: preset ? preset.url : '',
    }
    onChange({ options: [...options, newOption] })
    setOptionModes((prev) => ({ ...prev, [nextIdx]: preset ? 'image' : 'text' }))
    showToast?.(`Đã thêm Phương án ${letter}!`, 'success')
  }

  const handleRemoveOption = (optIdx: number) => {
    if (readOnly || options.length <= 2) {
      showToast?.('Câu đố cần tối thiểu 2 phương án lựa chọn.', 'info')
      return
    }
    const nextOptions = options.filter((_, i) => i !== optIdx)
    let nextCorrect = confirmGoal.correctIndex
    if (optIdx === confirmGoal.correctIndex) {
      nextCorrect = 0
    } else if (optIdx < confirmGoal.correctIndex) {
      nextCorrect = Math.max(0, confirmGoal.correctIndex - 1)
    }
    onChange({ options: nextOptions, correctIndex: nextCorrect })
    showToast?.('Đã xóa phương án lựa chọn!', 'info')
  }

  const handleImageUpload = async (optIdx: number, file: File) => {
    if (readOnly) return
    setUploadingIndex(optIdx)
    try {
      const res = await uploadCmsCourseMedia({
        file,
        purpose: 'island_confirm_option_image',
        questId,
      })
      if (res?.url) {
        handleUpdateOption(optIdx, { imageUrl: res.url })
        showToast?.('Đã tải ảnh lên thành công!', 'success')
      }
    } catch (err) {
      showToast?.(`Lỗi tải ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
    } finally {
      setUploadingIndex(null)
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border-2 border-sky-200 bg-white p-5 shadow-xs">
      {/* Tiêu đề khối */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-sky-500 text-white shadow-2xs">
            <HelpCircle size={18} />
          </span>
          <div>
            <h4 className="text-sm font-black text-slate-800">
              Khối Biên Soạn Câu Hỏi Xác Nhận Mục Tiêu (Chặng 2)
            </h4>
            <p className="text-[11px] font-semibold text-slate-500">
              Biên soạn câu hỏi và 2 hoặc nhiều phương án lựa chọn (ảnh hoặc text). Mỗi phương án 1 ảnh 4 chìa khóa trực quan.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-black text-sky-700">
          {options.length} phương án
        </span>
      </div>

      {/* 1. Câu hỏi xác nhận */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
          ❓ Câu hỏi xác nhận mục tiêu
        </label>
        <textarea
          rows={2}
          readOnly={readOnly}
          value={confirmGoal.question || ''}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Ví dụ: Bộ chìa khoá nào mở được một câu lệnh tốt?..."
          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text focus:border-brand-500 focus:bg-white focus:outline-hidden"
        />
      </div>

      {/* 2. Lời thoại / Hướng dẫn của AKI */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            🐱 Lời thoại / Hướng dẫn của Mèo AKI
          </label>
          <button
            type="button"
            onClick={() => previewAikiVoice(1, confirmGoal.speech || '')}
            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
          >
            <Volume2 size={13} />
            <span>Nghe thử giọng AKI</span>
          </button>
        </div>
        <textarea
          rows={2}
          readOnly={readOnly}
          value={confirmGoal.speech || ''}
          onChange={(e) => onChange({ speech: e.target.value })}
          placeholder="Lời dặn dò của AKI trước khi bé chọn phương án..."
          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text italic focus:border-brand-500 focus:bg-white focus:outline-hidden"
        />
      </div>

      {/* 3. Danh sách phương án lựa chọn */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            🎯 Danh sách các phương án lựa chọn ({options.length})
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-700 hover:bg-brand-100 cursor-pointer shadow-2xs transition"
            >
              <Plus size={14} />
              <span>+ Thêm phương án</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {options.map((option, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx)
            const isCorrect = confirmGoal.correctIndex === optIdx
            const currentMode = getOptionMode(optIdx, option)

            return (
              <div
                key={option.id || optIdx}
                className={cn(
                  'relative rounded-2xl border-2 p-4 transition-all duration-200',
                  isCorrect
                    ? 'border-emerald-400 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-300/50'
                    : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                )}
              >
                {/* Header card phương án */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'size-7 rounded-lg flex items-center justify-center font-black text-xs border shrink-0 shadow-2xs',
                        isCorrect
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      )}
                    >
                      {letter}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wide text-slate-800">
                      Phương án {letter}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Radio chọn đáp án đúng */}
                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50">
                      <input
                        type="radio"
                        name="confirmGoal_correctIndex"
                        checked={isCorrect}
                        disabled={readOnly}
                        onChange={() => onChange({ correctIndex: optIdx })}
                        className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Đáp án đúng</span>
                      {isCorrect && <CheckCircle2 size={13} className="text-emerald-600 ml-0.5" />}
                    </label>

                    {/* Bộ chuyển đổi chế độ: Ảnh / Chữ */}
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setOptionMode(optIdx, 'image')}
                        className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer',
                          currentMode === 'image'
                            ? 'bg-sky-500 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                      >
                        <ImageIcon size={12} />
                        <span>🖼️ Ảnh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOptionMode(optIdx, 'text')}
                        className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer',
                          currentMode === 'text'
                            ? 'bg-slate-700 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                      >
                        <Type size={12} />
                        <span>📝 Chữ</span>
                      </button>
                    </div>

                    {/* Nút xóa phương án (nếu > 2 options) */}
                    {!readOnly && options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(optIdx)}
                        title="Xóa phương án này"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Thân card phương án */}
                <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
                  {/* Cột 1: Tên phương án & cấu hình URL ảnh */}
                  <div className={cn(currentMode === 'image' ? 'sm:col-span-1 lg:col-span-8' : 'sm:col-span-2 lg:col-span-12', 'space-y-3')}>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                        Tiêu đề phương án
                      </label>
                      <input
                        type="text"
                        readOnly={readOnly}
                        value={option.text || ''}
                        onChange={(e) => handleUpdateOption(optIdx, { text: e.target.value })}
                        placeholder={`Ví dụ: Bộ chìa khoá ${letter}...`}
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-500 focus:outline-hidden"
                      />
                    </div>

                    {currentMode === 'image' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold uppercase text-slate-600">
                            Đường dẫn ảnh minh họa (1 ảnh 4 chìa khóa)
                          </label>
                          {!readOnly && (
                            <label className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 cursor-pointer">
                              <Upload size={12} />
                              <span>{uploadingIndex === optIdx ? 'Đang tải...' : 'Tải ảnh lên'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingIndex === optIdx}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload(optIdx, file)
                                }}
                              />
                            </label>
                          )}
                        </div>

                        <input
                          type="text"
                          readOnly={readOnly}
                          value={option.imageUrl || ''}
                          onChange={(e) => handleUpdateOption(optIdx, { imageUrl: e.target.value })}
                          placeholder="/assets/aiki-keys/option_a_4keys.svg hoặc URL..."
                          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-text font-mono focus:border-brand-500 focus:outline-hidden"
                        />

                        {/* Nút chọn nhanh ảnh mẫu */}
                        {!readOnly && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Chọn nhanh ảnh mẫu chuẩn Hallmark:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_KEYS_IMAGES.map((preset, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => handleUpdateOption(optIdx, { imageUrl: preset.url })}
                                  className={cn(
                                    'rounded-lg border px-2 py-1 text-[10.5px] font-bold transition cursor-pointer',
                                    option.imageUrl === preset.url
                                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                                  )}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {currentMode === 'text' && (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-2.5 text-[11px] text-slate-500">
                        ℹ️ Phương án này được cấu hình ở chế độ <strong>Chỉ dùng chữ</strong>. Học sinh sẽ thấy thẻ lựa chọn văn bản thông thường.
                      </div>
                    )}
                  </div>

                  {/* Cột 2: Thumbnail Preview trực tiếp khi dùng ảnh */}
                  {currentMode === 'image' && (
                    <div className="sm:col-span-1 lg:col-span-4 flex flex-col items-center justify-center">
                      <div className="w-full">
                        <span className="block text-[10.5px] font-bold text-slate-500 mb-1 text-center">
                          Xem trước ảnh phương án
                        </span>
                        <div className="relative aspect-[4/3] w-full max-w-[240px] mx-auto rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs group">
                          {option.imageUrl && option.imageUrl.trim() !== '' ? (
                            <img
                              src={option.imageUrl}
                              alt={option.text || `Phương án ${letter}`}
                              className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50" y="55" font-size="12" text-anchor="middle" fill="%23ef4444">Ảnh không tải được</text></svg>'
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-400 p-2 text-center">
                              <ImageIcon size={24} />
                              <span className="text-[10px] font-semibold">Chưa có ảnh</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Lời giải thích khi trả lời */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
          💡 Lời giải thích khi trả lời (Explanation)
        </label>
        <textarea
          rows={2}
          readOnly={readOnly}
          value={confirmGoal.explanation || ''}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="Giải thích vì sao đáp án đó chính xác (Ví dụ: CÔNG THỨC 4 CHÌA KHOÁ: Cái gì · Trông như thế nào · Đang làm gì · Ở đâu)..."
          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text focus:border-brand-500 focus:bg-white focus:outline-hidden"
        />
      </div>
    </div>
  )
}
