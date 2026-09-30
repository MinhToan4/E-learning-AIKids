import React from 'react'
import { Trophy } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'

export interface RewardBlockEditorProps {
  completion: LessonSixStageJourney['stage6_completion']
  stage1ImageUrl?: string
  onChange: (patch: Partial<LessonSixStageJourney['stage6_completion']>) => void
  readOnly?: boolean
  questId?: string
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
}

/**
 * RewardBlockEditor — Form soạn thảo Chặng Về Đích & Trao Thưởng (Stage 6 / Reward Block).
 * Quản lý: Tiêu đề kết thúc, thông điệp chúc mừng, huy hiệu (icon, sao, XP), điều hướng bài tiếp theo.
 */
export function RewardBlockEditor({
  completion,
  stage1ImageUrl = '',
  onChange,
  readOnly = false,
  questId,
  showToast,
}: RewardBlockEditorProps) {
  const badge = completion.rewardBadge || {
    name: 'Huy hiệu Chiến Binh AIKI',
    iconUrl: '',
    stars: 3,
    xp: 50,
  }

  const effectiveBadgeImage = badge.iconUrl || stage1ImageUrl

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="grid size-8 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
          <Trophy size={18} />
        </span>
        <div>
          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Về Đích &amp; Trao Thưởng (Reward Block)
          </h4>
          <p className="text-[11px] font-semibold text-slate-500">
            Màn kết thúc vinh danh, trao huy hiệu sao, điểm kinh nghiệm và dẫn sang trạm tiếp
          </p>
        </div>
      </div>

      {/* Tiêu đề hoàn thành */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Tiêu đề hoàn thành
        </label>
        <input
          type="text"
          value={completion.title || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="VD: Chúc Mừng Bé Đã Hoàn Thành Trạm 1!"
          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
        />
      </div>

      {/* Thông điệp chúc mừng */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Thông điệp chúc mừng
        </label>
        <textarea
          rows={3}
          value={completion.congratsMessage || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ congratsMessage: e.target.value })}
          placeholder="Lời khen ngợi và dặn dò từ Mèo AIKI dành cho bé..."
          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
        />
      </div>

      {/* Cấu hình Ảnh kiệt tác trong Balo / Ảnh huy hiệu */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Ảnh kiệt tác trong Balo / Ảnh huy hiệu (iconUrl)
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            type="text"
            value={badge.iconUrl || ''}
            disabled={readOnly}
            onChange={(e) =>
              onChange({
                rewardBadge: { ...badge, iconUrl: e.target.value },
              })
            }
            placeholder="https://... hoặc tải ảnh lên (mặc định lấy ảnh Chặng 1 nếu để trống)"
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
                      purpose: 'island_stage6_badge',
                      questId,
                    })
                    if (res?.url) {
                      onChange({
                        rewardBadge: { ...badge, iconUrl: res.url },
                      })
                      showToast?.('Đã tải ảnh huy hiệu/kiệt tác lên thành công!', 'success')
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
        <p className="mt-1 text-[11px] text-slate-500 font-medium">
          💡 Mặc định hiển thị ảnh mục tiêu Chặng 1 ({stage1ImageUrl ? 'đã có' : 'chưa có'}) nếu để trống.
        </p>

        {effectiveBadgeImage && (
          <div className="mt-2 flex items-center gap-3 p-2 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <div className="relative w-20 aspect-[4/3] rounded-lg overflow-hidden border border-amber-300 bg-white shrink-0 shadow-2xs">
              <img
                src={effectiveBadgeImage}
                alt="Xem trước ảnh kiệt tác/huy hiệu"
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLElement).style.display = 'none'
                }}
              />
            </div>
            <div className="text-xs space-y-0.5 min-w-0 flex-1">
              <p className="font-bold text-slate-700 truncate">
                {badge.iconUrl ? 'Ảnh huy hiệu riêng' : 'Ảnh kế thừa từ Chặng 1 (Mục tiêu)'}
              </p>
              <p className="text-[11px] text-slate-500 truncate font-mono">
                {effectiveBadgeImage}
              </p>
            </div>
            {badge.iconUrl && !readOnly && (
              <button
                type="button"
                onClick={() => {
                  onChange({
                    rewardBadge: { ...badge, iconUrl: '' },
                  })
                  showToast?.('Đã xóa ảnh huy hiệu tùy chỉnh (sẽ dùng ảnh Chặng 1)', 'info')
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer shrink-0"
                title="Xóa ảnh tùy chỉnh, dùng lại ảnh Chặng 1"
              >
                ✕ Bỏ ảnh riêng
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-black uppercase text-slate-700">Tên huy hiệu</label>
          <input
            type="text"
            value={badge.name || ''}
            disabled={readOnly}
            onChange={(e) =>
              onChange({
                rewardBadge: { ...badge, name: e.target.value },
              })
            }
            placeholder="VD: Bút Vẽ Thần Kỳ"
            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-slate-700">
            Số sao thưởng ⭐
          </label>
          <input
            type="number"
            value={badge.stars ?? 3}
            disabled={readOnly}
            onChange={(e) =>
              onChange({
                rewardBadge: { ...badge, stars: parseInt(e.target.value, 10) || 3 },
              })
            }
            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-slate-700">
            Điểm kinh nghiệm XP
          </label>
          <input
            type="number"
            value={badge.xp ?? 50}
            disabled={readOnly}
            onChange={(e) =>
              onChange({
                rewardBadge: { ...badge, xp: parseInt(e.target.value, 10) || 50 },
              })
            }
            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Slug bài học tiếp theo (nextLessonSlug)
        </label>
        <input
          type="text"
          value={completion.nextLessonSlug || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ nextLessonSlug: e.target.value })}
          placeholder="bai-1-2"
          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
        />
      </div>
    </div>
  )
}

export { RewardBlockEditor as Stage6RewardEditor }
