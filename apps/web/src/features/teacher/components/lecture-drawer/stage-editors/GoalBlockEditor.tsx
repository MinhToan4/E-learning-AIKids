import React from 'react'
import { Volume2, Target } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'

export interface GoalBlockEditorProps {
  goal: LessonSixStageJourney['stage1_goal']
  onChange: (patch: Partial<LessonSixStageJourney['stage1_goal']>) => void
  readOnly?: boolean
  questId?: string
  previewAikiVoice?: (index: number, text: string) => void
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
}

/**
 * GoalBlockEditor — Form soạn thảo Chặng Mục tiêu (Stage 1 / Goal Block).
 * Quản lý: Ảnh mục tiêu (cover), tiêu đề, mục tiêu cốt lõi, 4 chìa khóa vàng, lời thoại Mèo AIKI.
 */
export function GoalBlockEditor({
  goal,
  onChange,
  readOnly = false,
  questId,
  previewAikiVoice,
  showToast,
}: GoalBlockEditorProps) {
  const currentKeyPoints = goal.keyPoints || []
  const keyPointsCount = Math.max(4, currentKeyPoints.length)

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="grid size-8 place-items-center rounded-lg bg-brand-100 text-brand-700">
          <Target size={18} />
        </span>
        <div>
          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Mục Tiêu &amp; Điểm Cốt Lõi (Goal Block)
          </h4>
          <p className="text-[11px] font-semibold text-slate-500">
            Khung nhìn đầu tiên học sinh thấy khi bước vào trạm học
          </p>
        </div>
      </div>

      {/* Ảnh mục tiêu (Cover / Illustration) */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Ảnh Mục Tiêu (Cover / Illustration)
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            type="text"
            value={goal.imageUrl || ''}
            disabled={readOnly}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            placeholder="/assets/aiki-islands/island1_lesson1_cat.jpg hoặc URL ảnh..."
            className="flex-1 rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
          />
          {!readOnly && (
            <label className="flex items-center gap-1 rounded-xl bg-brand-50 border border-brand-200 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 cursor-pointer shrink-0">
              <span>📤 Tải ảnh</span>
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
                      purpose: 'island_stage1_image',
                      questId,
                    })
                    if (res?.url) {
                      onChange({ imageUrl: res.url })
                      showToast?.('Đã tải ảnh lên thành công!', 'success')
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
        {goal.imageUrl && (
          <div className="mt-2 relative w-44 aspect-video rounded-xl overflow-hidden border border-border shadow-2xs">
            <img
              src={goal.imageUrl}
              alt="Mục tiêu"
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Tiêu đề bài học */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">Tiêu đề bài học</label>
        <input
          type="text"
          value={goal.title || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="VD: Học cách tả chiếc cốc với 4 Chìa Khóa"
          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-sm font-bold text-text"
        />
      </div>

      {/* Mục tiêu bài học (Goal text) */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Mục tiêu bài học (Goal text)
        </label>
        <textarea
          rows={2}
          value={goal.goalText || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ goalText: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
          placeholder="Mô tả mục tiêu cụ thể bé sẽ đạt được..."
        />
      </div>

      {/* 4 Chìa khóa / Điểm vàng cần ghi nhớ */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          {currentKeyPoints.length >= 4
            ? '4 chìa khóa (hiển thị 1–1 trên frontend)'
            : 'Điểm vàng cần ghi nhớ'}
        </label>
        <div className="mt-1.5 space-y-2">
          {Array.from({ length: keyPointsCount }, (_, idx) => idx).map((idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="size-6 rounded-full bg-amber-500 text-white font-bold text-xs grid place-items-center shrink-0 shadow-2xs">
                {idx + 1}
              </span>
              <input
                type="text"
                value={currentKeyPoints[idx] || ''}
                disabled={readOnly}
                onChange={(e) => {
                  const pts = [...currentKeyPoints]
                  pts[idx] = e.target.value
                  onChange({ keyPoints: pts })
                }}
                placeholder={
                  keyPointsCount >= 4
                    ? `Chìa khóa ${idx + 1}...`
                    : `Điểm vàng thứ ${idx + 1}...`
                }
                className="flex-1 rounded-xl border border-border bg-page px-3 py-1.5 text-xs font-semibold text-text"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lời thoại hướng dẫn đầu bài */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase text-slate-700">
            Lời thoại hướng dẫn đầu bài
          </label>
          {previewAikiVoice && (
            <button
              type="button"
              onClick={() => previewAikiVoice(0, goal.speech || '')}
              className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
            >
              <Volume2 size={13} />
              <span>Nghe thử giọng đọc</span>
            </button>
          )}
        </div>
        <textarea
          rows={2}
          value={goal.speech || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ speech: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text italic"
          placeholder="Xin chào các bạn nhỏ! Hôm nay chúng mình sẽ cùng..."
        />
      </div>
    </div>
  )
}

export { GoalBlockEditor as Stage1GoalEditor }
