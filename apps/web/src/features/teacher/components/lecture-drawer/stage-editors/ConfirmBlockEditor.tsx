import React from 'react'
import { HelpCircle, Plus, Trash2, CheckCircle2, Upload, Image as ImageIcon, Lightbulb } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { cn } from '@/shared/lib/cn'

export interface ConfirmBlockEditorProps {
  confirmGoal: LessonSixStageJourney['stage2_confirmGoal']
  onChange: (patch: Partial<LessonSixStageJourney['stage2_confirmGoal']>) => void
  readOnly?: boolean
  questId?: string
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
}

/**
 * ConfirmBlockEditor — Form soạn thảo Chặng Xác nhận Mục tiêu (Stage 2 / Confirm Block).
 * Trình bày dạng thẻ Hallmark Soft Clay WYSIWYG khớp 100% với giao diện học sinh.
 * Quản lý: Câu đố A/B kiểm tra mục tiêu, các phương án lựa chọn, đáp án đúng và lời giải thích.
 */
export function ConfirmBlockEditor({
  confirmGoal,
  onChange,
  readOnly = false,
  questId,
  showToast,
}: ConfirmBlockEditorProps) {
  const options = confirmGoal.options || []
  const [uploadingIdx, setUploadingIdx] = React.useState<number | null>(null)

  const handleAddOption = () => {
    if (readOnly) return
    const nextOpts = [...options]
    const optLetter = String.fromCharCode(65 + nextOpts.length)
    nextOpts.push({
      id: `confirm-opt-${Date.now().toString(36)}`,
      text: `Phương án ${optLetter}`,
      imageUrl: '',
    })
    onChange({ options: nextOpts })
    showToast?.(`Đã thêm Phương án ${optLetter}!`, 'success')
  }

  const handleRemoveOption = (index: number) => {
    if (readOnly || options.length <= 2) return
    const nextOpts = options.filter((_, i) => i !== index)
    let nextCorrect = confirmGoal.correctIndex
    if (nextCorrect === index) nextCorrect = 0
    else if (nextCorrect > index) nextCorrect -= 1
    onChange({ options: nextOpts, correctIndex: nextCorrect })
  }

  return (
    <div className="space-y-4 rounded-3xl border-2 border-brand-200 bg-white p-5 shadow-clay-xs">
      {/* Header Chặng */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-500 text-white shadow-xs">
            <HelpCircle size={20} />
          </span>
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-wide">
              Câu Đố Xác Nhận Mục Tiêu (Confirm Block)
            </h4>
            <p className="text-xs font-semibold text-slate-500">
              1 câu đố tương tác giúp bé khẳng định lại mục tiêu bài học trước khi mở khóa video
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-black text-amber-800">
          {options.length} phương án
        </span>
      </div>

      {/* Đề bài câu hỏi xác nhận */}
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-4 space-y-2">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
          Đề bài câu hỏi xác nhận mục tiêu *
        </label>
        <input
          type="text"
          value={confirmGoal.question || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="VD: Để AIKI vẽ đúng chiếc cốc xinh, bé cần dùng mấy Chìa Khóa Vàng?"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
        />
      </div>

      {/* Lưới các phương án lựa chọn WYSIWYG */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700">
            Các thẻ lựa chọn ({options.length} thẻ — tích chọn thẻ đúng)
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-black text-brand-800 hover:bg-brand-100 transition cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span>Thêm phương án</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {options.map((opt, optIdx) => {
            const isCorrect = confirmGoal.correctIndex === optIdx
            const optLetter = String.fromCharCode(65 + optIdx)

            return (
              <div
                key={opt.id || optIdx}
                className={cn(
                  'group flex flex-col justify-between rounded-2xl border-2 p-3.5 transition-all duration-150 shadow-2xs',
                  isCorrect
                    ? 'border-mint-500 bg-mint-50/80 ring-2 ring-mint-300/80'
                    : 'border-slate-200 bg-white hover:border-brand-300'
                )}
              >
                {/* Header Thẻ: Chữ cái + Nút xóa */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wider uppercase',
                      isCorrect ? 'bg-mint-600 text-white' : 'bg-slate-100 text-slate-800'
                    )}
                  >
                    Phương án {optLetter}
                  </span>

                  {options.length > 2 && !readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optIdx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa phương án này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Vùng hình ảnh của phương án (WYSIWYG preview) */}
                <div className="relative mb-2.5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 min-h-[110px] max-h-[140px] flex items-center justify-center">
                  {opt.imageUrl ? (
                    <>
                      <img
                        src={opt.imageUrl}
                        alt={`Minh họa ${optLetter}`}
                        className="size-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      {!readOnly && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm cursor-pointer hover:bg-slate-50">
                            <Upload size={12} />
                            <span>Đổi ảnh</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingIdx !== null}
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                setUploadingIdx(optIdx)
                                try {
                                  const res = await uploadCmsCourseMedia({ file, purpose: 'island_confirm_option', questId })
                                  if (res?.url) {
                                    const nextOpts = [...options]
                                    nextOpts[optIdx] = { ...nextOpts[optIdx], imageUrl: res.url }
                                    onChange({ options: nextOpts })
                                    showToast?.('Đổi ảnh thành công!', 'success')
                                  }
                                } finally {
                                  setUploadingIdx(null)
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const nextOpts = [...options]
                              nextOpts[optIdx] = { ...nextOpts[optIdx], imageUrl: '' }
                              onChange({ options: nextOpts })
                            }}
                            className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      <ImageIcon size={22} className="text-slate-300 mb-1" />
                      <p className="text-[11px] font-bold text-slate-400">Chưa có ảnh minh họa</p>
                      {!readOnly && (
                        <label className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer">
                          <Upload size={12} />
                          <span>{uploadingIdx === optIdx ? 'Đang tải…' : 'Tải ảnh lên'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingIdx !== null}
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setUploadingIdx(optIdx)
                              try {
                                const res = await uploadCmsCourseMedia({ file, purpose: 'island_confirm_option', questId })
                                if (res?.url) {
                                  const nextOpts = [...options]
                                  nextOpts[optIdx] = { ...nextOpts[optIdx], imageUrl: res.url }
                                  onChange({ options: nextOpts })
                                  showToast?.('Đã tải ảnh lên!', 'success')
                                }
                              } finally {
                                setUploadingIdx(null)
                              }
                            }}
                            />
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Nội dung chữ của phương án */}
                <input
                  type="text"
                  value={opt.text}
                  disabled={readOnly}
                  onChange={(e) => {
                    const nextOpts = [...options]
                    nextOpts[optIdx] = { ...nextOpts[optIdx], text: e.target.value }
                    onChange({ options: nextOpts })
                  }}
                  placeholder={`Nội dung phương án ${optLetter}...`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-brand-500 focus:bg-white transition mb-3"
                />

                {/* Nút Chọn Làm Đáp Án Đúng (To & Rõ) */}
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => onChange({ correctIndex: optIdx })}
                  className={cn(
                    'w-full py-2 px-3 rounded-xl text-xs font-black border transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs',
                    isCorrect
                      ? 'bg-mint-500 text-white border-mint-600 shadow-clay-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-brand-50 hover:text-brand-800 hover:border-brand-300'
                  )}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={14} className="stroke-[3]" />
                      <span>✓ ĐÂY LÀ ĐÁP ÁN ĐÚNG</span>
                    </>
                  ) : (
                    <span>Chọn làm đáp án đúng</span>
                  )}
                </button>
              </div>
            )
          })}

          {/* Thẻ Thêm phương án nhanh dạng card nét đứt */}
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddOption}
              className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-center text-slate-500 hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-700 transition cursor-pointer active:scale-95"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-white border border-slate-200 shadow-2xs">
                <Plus size={20} />
              </div>
              <span className="text-xs font-black">Thêm Phương Án Lựa Chọn</span>
              <span className="text-[10px] font-semibold text-slate-400">Hỗ trợ 2-4 phương án A/B/C/D</span>
            </button>
          )}
        </div>
      </div>

      {/* Lời giải thích khi bé trả lời đúng */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-4 space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
          <Lightbulb size={15} className="text-amber-600" />
          <span>Lời giải thích khi bé chọn đáp án đúng (Explanation)</span>
        </label>
        <textarea
          rows={2}
          value={confirmGoal.explanation || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ explanation: e.target.value })}
          className="w-full rounded-xl border border-amber-200 bg-white p-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition"
          placeholder="Chính xác! Cần đủ 4 Chìa Khóa Vàng để tạo nên một câu lệnh hoàn chỉnh..."
        />
      </div>
    </div>
  )
}

export { ConfirmBlockEditor as Stage2ConfirmEditor }
