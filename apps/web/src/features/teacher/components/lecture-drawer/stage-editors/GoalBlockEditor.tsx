import React from 'react'
import { Volume2, Target } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { CmsImageUploader } from '../../stage-block-editors/CmsImageUploader'

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

      {/* Thân soạn thảo 2 cột tương ứng 100% với Frontend học sinh */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* CỘT TRÁI: Ảnh Mục Tiêu (Cover / Illustration) - Chiếm 5 cột trên lg, 1 cột trên màn nhỏ */}
        <div className="lg:col-span-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 border-b border-emerald-100 pb-2">
            <span className="text-sm">🖼️</span>
            <span className="text-xs font-black uppercase text-emerald-950 tracking-wider">
              Ảnh Mục Tiêu (Cột Trái)
            </span>
          </div>

          <CmsImageUploader
            label="Ảnh Mục Tiêu"
            imageUrl={goal.imageUrl || ''}
            readOnly={readOnly}
            onImageChange={(url: string) => onChange({ imageUrl: url })}
            urlPlaceholder="/assets/aiki-islands/island1_lesson1_cat.jpg hoặc URL ảnh..."
            showToast={showToast}
            uploadPurpose="island_stage1_image"
            questId={questId}
          />
        </div>

        {/* CỘT PHẢI: Box Mục Đích (Tiêu đề + Mục tiêu cốt lõi) + Box 4 Chìa Khóa Vàng - Chiếm 7 cột trên lg */}
        <div className="lg:col-span-7 space-y-4">
          {/* Box 1: Mục tiêu cốt lõi */}
          <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/30 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-1.5 border-b border-purple-100 pb-2">
              <span className="text-sm">🎯</span>
              <span className="text-xs font-black uppercase text-purple-950 tracking-wider">
                Mục Tiêu Cốt Lõi (Cột Phải)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700">Tiêu đề bài học</label>
              <input
                type="text"
                value={goal.title || ''}
                disabled={readOnly}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="VD: Học cách tả chiếc cốc với 4 Chìa Khóa"
                className="mt-1 w-full rounded-xl border border-border bg-page px-3 py-2 text-sm font-bold text-text"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700">
                Nội dung mục tiêu cốt lõi (Goal text)
              </label>
              <textarea
                rows={2}
                value={goal.goalText || ''}
                disabled={readOnly}
                onChange={(e) => onChange({ goalText: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
                placeholder="Mô tả mục tiêu cụ thể bé sẽ đạt được..."
              />
            </div>
          </div>

          {/* Box 2: 4 Chìa khóa vàng */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/30 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-1.5 border-b border-amber-100 pb-2">
              <span className="text-sm">🔑</span>
              <span className="text-xs font-black uppercase text-amber-950 tracking-wider">
                {currentKeyPoints.length >= 4 ? 'Bốn Chiếc Chìa Khóa Vàng' : 'Điểm Vàng Cần Ghi Nhớ'}
              </span>
            </div>

            <div className="space-y-2">
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

          {/* Box 3: Lời thoại hướng dẫn đầu bài của AIKI */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase text-sky-950 flex items-center gap-1">
                <span>🐱</span>
                <span>Lời thoại hướng dẫn đầu bài của Mèo AIKI</span>
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
              className="w-full rounded-xl border border-border bg-page p-2.5 text-xs font-semibold text-text italic"
              placeholder="Xin chào các bạn nhỏ! Hôm nay chúng mình sẽ cùng..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { GoalBlockEditor as Stage1GoalEditor }
