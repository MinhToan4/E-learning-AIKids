import React from 'react'
import { Trophy, Star, Award, ArrowRight, Upload, Image as ImageIcon } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { cn } from '@/shared/lib/cn'

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
 * Trình bày dạng 3 khối thẻ Hallmark Soft Clay WYSIWYG:
 * 1. Khối Lời Chúc Mừng & Linh Vật (Celebration Block)
 * 2. Khối Huy Hiệu & Phần Thưởng Sao/XP (Badge & Star Block)
 * 3. Khối Điều Hướng Tiếp Theo (Next Step Block)
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
  const [uploadingBadge, setUploadingBadge] = React.useState(false)

  return (
    <div className="space-y-4 rounded-3xl border-2 border-brand-200 bg-white p-5 shadow-clay-xs">
      {/* Header Chặng */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-500 text-white shadow-xs">
            <Trophy size={20} />
          </span>
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-wide">
              Về Đích &amp; Trao Thưởng (Reward Block)
            </h4>
            <p className="text-xs font-semibold text-slate-500">
              Màn kết thúc vinh danh, trao huy hiệu sao, điểm kinh nghiệm và dẫn sang bài tiếp
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-800">
          Chặng 6/6
        </span>
      </div>

      {/* KHỐI 1: LỜI CHÚC MỪNG & TIÊU ĐỀ (Celebration Card) */}
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-base select-none">🎉</span>
          <span className="text-xs font-black uppercase tracking-wider text-amber-950">
            Thông điệp chúc mừng của Mèo AIKI
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase text-amber-900 mb-1">
            Tiêu đề màn hình kết thúc *
          </label>
          <input
            type="text"
            value={completion.title || ''}
            disabled={readOnly}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="VD: Chúc Mừng Bé Đã Hoàn Thành Trạm 1!"
            className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase text-amber-900 mb-1">
            Lời chúc mừng & dặn dò của AIKI
          </label>
          <textarea
            rows={2}
            value={completion.congratsMessage || ''}
            disabled={readOnly}
            onChange={(e) => onChange({ congratsMessage: e.target.value })}
            placeholder="VD: Con đã xuất sắc hoàn thành trạm học và mở khóa huy hiệu mới..."
            className="w-full rounded-xl border border-amber-300 bg-white p-3 text-xs font-semibold text-slate-800 shadow-2xs outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* KHỐI 2: HUY HIỆU & PHẦN THƯỞNG SAO / XP (Badge & Star Card) */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">🏅</span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
              Huy Hiệu &amp; Điểm Thưởng
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800">
            Cộng vào Balo &amp; Bảng vàng học sinh
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Cột Trái: Ảnh huy hiệu với preview trực quan */}
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border-2 border-emerald-200 shadow-2xs">
            <div className="relative size-18 rounded-2xl border-2 border-amber-300 bg-amber-50 flex items-center justify-center shrink-0 overflow-hidden shadow-clay-xs">
              {effectiveBadgeImage ? (
                <img
                  src={effectiveBadgeImage}
                  alt="Ảnh huy hiệu"
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <Trophy size={28} className="text-amber-500" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <label className="block text-[11px] font-black uppercase text-slate-700">Tên huy hiệu</label>
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500"
              />

              <div className="flex items-center gap-2 pt-1">
                {!readOnly && (
                  <label className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer shadow-2xs">
                    <Upload size={12} />
                    <span>{uploadingBadge ? 'Đang tải…' : 'Đổi ảnh huy hiệu'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingBadge}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploadingBadge(true)
                        try {
                          const res = await uploadCmsCourseMedia({ file, purpose: 'island_stage6_badge', questId })
                          if (res?.url) {
                            onChange({ rewardBadge: { ...badge, iconUrl: res.url } })
                            showToast?.('Đã tải ảnh huy hiệu mới!', 'success')
                          }
                        } finally {
                          setUploadingBadge(false)
                        }
                      }}
                    />
                  </label>
                )}
                {badge.iconUrl && !readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ rewardBadge: { ...badge, iconUrl: '' } })
                      showToast?.('Đã dùng lại ảnh Chặng 1 làm huy hiệu', 'info')
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    Dùng ảnh Chặng 1
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cột Phải: Bộ chọn Sao và Điểm XP */}
          <div className="space-y-3 bg-white p-3.5 rounded-2xl border-2 border-emerald-200 shadow-2xs">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1.5">
                Số sao trao thưởng (⭐)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((starNum) => (
                  <button
                    key={starNum}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange({ rewardBadge: { ...badge, stars: starNum } })}
                    className={cn(
                      'flex-1 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs',
                      (badge.stars ?? 3) === starNum
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-clay-xs ring-2 ring-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50'
                    )}
                  >
                    <Star size={13} className={cn((badge.stars ?? 3) >= starNum ? 'fill-amber-950 text-amber-950' : 'text-slate-400')} />
                    <span>{starNum} Sao</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Điểm kinh nghiệm thưởng (+XP)
              </label>
              <div className="flex items-center gap-2">
                {[30, 50, 100].map((xpNum) => (
                  <button
                    key={xpNum}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange({ rewardBadge: { ...badge, xp: xpNum } })}
                    className={cn(
                      'flex-1 py-1 rounded-lg text-xs font-bold border transition cursor-pointer',
                      (badge.xp ?? 50) === xpNum
                        ? 'bg-brand-600 text-white border-brand-700 font-black'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-brand-50'
                    )}
                  >
                    +{xpNum} XP
                  </button>
                ))}
                <input
                  type="number"
                  value={badge.xp ?? 50}
                  disabled={readOnly}
                  onChange={(e) => onChange({ rewardBadge: { ...badge, xp: parseInt(e.target.value, 10) || 50 } })}
                  className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 3: ĐIỀU HƯỚNG BƯỚC TIẾP THEO (Next Step Card) */}
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/70 p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
            <ArrowRight size={15} className="text-brand-600" />
            <span>Mã bài học tiếp theo (nextLessonSlug)</span>
          </label>
          <span className="text-[10px] font-bold text-slate-400">
            Học sinh bấm "Bài tiếp theo" sẽ chuyển sang bài này
          </span>
        </div>
        <input
          type="text"
          value={completion.nextLessonSlug || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ nextLessonSlug: e.target.value })}
          placeholder="VD: bai-1-2"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold font-mono text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
        />
      </div>
    </div>
  )
}

export { RewardBlockEditor as Stage6RewardEditor }
