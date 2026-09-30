import React from 'react'
import { HelpCircle, Plus, Trash2, CheckCircle2 } from 'lucide-react'
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
    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="grid size-8 place-items-center rounded-lg bg-amber-100 text-amber-800">
          <HelpCircle size={18} />
        </span>
        <div>
          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Câu Đố Xác Nhận Mục Tiêu (Confirm Block)
          </h4>
          <p className="text-[11px] font-semibold text-slate-500">
            1 câu đố ngắn giúp bé tự tin ghi nhớ mục tiêu trước khi mở khóa video bài học
          </p>
        </div>
      </div>

      {/* Câu hỏi xác nhận */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Câu hỏi xác nhận mục tiêu
        </label>
        <input
          type="text"
          value={confirmGoal.question || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="VD: Để AIKI vẽ đúng chiếc cốc xinh, bé cần dùng mấy Chìa Khóa Vàng?"
          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
        />
      </div>

      {/* Danh sách các phương án */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase text-slate-700">
            Các phương án lựa chọn ({options.length})
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm phương án</span>
            </button>
          )}
        </div>

        {options.map((opt, optIdx) => {
          const isCorrect = confirmGoal.correctIndex === optIdx
          const optLetter = String.fromCharCode(65 + optIdx)

          return (
            <div
              key={opt.id || optIdx}
              className={cn(
                'rounded-xl border p-3 space-y-2 transition',
                isCorrect
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-200 bg-slate-50/60'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="confirm-goal-correct"
                    checked={isCorrect}
                    disabled={readOnly}
                    onChange={() => onChange({ correctIndex: optIdx })}
                    className="size-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-800">
                    Phương án {optLetter} {isCorrect && <span className="text-emerald-600">(Đáp án đúng)</span>}
                  </span>
                </label>
                {options.length > 2 && !readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(optIdx)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Xóa phương án này"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

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
                className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold"
              />

              {/* Tùy chọn tải ảnh cho phương án */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt.imageUrl || ''}
                  disabled={readOnly}
                  onChange={(e) => {
                    const nextOpts = [...options]
                    nextOpts[optIdx] = { ...nextOpts[optIdx], imageUrl: e.target.value }
                    onChange({ options: nextOpts })
                  }}
                  placeholder="URL ảnh minh họa (tùy chọn)..."
                  className="flex-1 rounded-lg border border-border bg-white px-2 py-1 text-[11px] font-mono"
                />
                {!readOnly && (
                  <label className="flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-300 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 cursor-pointer shrink-0">
                    <span>🖼️ Ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const res = await uploadCmsCourseMedia({
                            file,
                            purpose: 'island_confirm_option',
                            questId,
                          })
                          if (res?.url) {
                            const nextOpts = [...options]
                            nextOpts[optIdx] = { ...nextOpts[optIdx], imageUrl: res.url }
                            onChange({ options: nextOpts })
                            showToast?.('Đã tải ảnh phương án lên!', 'success')
                          }
                        } catch (err) {
                          showToast?.(
                            `Lỗi tải ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`,
                            'error'
                          )
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Giải thích đáp án đúng */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Giải thích đáp án đúng (Explanation)
        </label>
        <textarea
          rows={2}
          value={confirmGoal.explanation || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ explanation: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
          placeholder="Chính xác! Cần đủ 4 Chìa Khóa Vàng để tạo nên một câu lệnh hoàn chỉnh..."
        />
      </div>
    </div>
  )
}

export { ConfirmBlockEditor as Stage2ConfirmEditor }
