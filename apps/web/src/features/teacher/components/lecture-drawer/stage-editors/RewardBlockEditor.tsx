import React from 'react'
import { Trophy, Star, Award, Compass, Image as ImageIcon } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { CmsImageUploader } from '../../stage-block-editors/CmsImageUploader'

export interface RewardBlockEditorProps {
  completion: LessonSixStageJourney['stage6_completion']
  stage1ImageUrl?: string
  onChange: (patch: Partial<LessonSixStageJourney['stage6_completion']>) => void
  readOnly?: boolean
  questId?: string
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
  stageStarAllocation?: number[]
  onToggleStage6Star?: () => void
}

/**
 * RewardBlockEditor — Form soạn thảo Chặng Về Đích & Trao Thưởng (Stage 6 / Reward Block).
 * Trình bày dạng 3 khối thẻ Hallmark Soft Clay WYSIWYG:
 * 1. Khối Lời Chúc Mừng & Linh Vật (Celebration Block)
 * 2. Khối Huy Hiệu & Phần Thưởng Sao/XP (Badge & Star Block) - Tự động cộng dồn sao các chặng
 * 3. Khối Điều Hướng Tiếp Theo (Next Step Block) - Tự động theo Đảo học tập
 */
export function RewardBlockEditor({
  completion,
  stage1ImageUrl = '',
  onChange,
  readOnly = false,
  questId,
  showToast,
  stageStarAllocation,
  onToggleStage6Star,
}: RewardBlockEditorProps) {
  const badge = completion.rewardBadge || {
    name: 'Huy hiệu Chiến Binh AIKI',
    iconUrl: '',
    stars: 3,
    xp: 50,
  }

  const allocatedStages = stageStarAllocation ?? [2, 3, 4]
  const hasStage6Star = allocatedStages.includes(5)
  const otherStagesList = allocatedStages.filter((idx) => idx !== 5)
  const otherStarsCount = otherStagesList.length
  const totalStationStars = Math.max(1, otherStarsCount + (hasStage6Star ? 1 : 0))

  // Giữ đồng bộ số sao trong rewardBadge bằng tổng số sao của trạm
  React.useEffect(() => {
    if (badge.stars !== totalStationStars) {
      onChange({
        rewardBadge: {
          ...badge,
          stars: totalStationStars,
        },
      })
    }
  }, [totalStationStars, badge.stars])

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
          <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-200 shadow-2xs space-y-2">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">Tên huy hiệu</label>
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
            </div>

            <CmsImageUploader
              label="Ảnh huy hiệu"
              imageUrl={badge.iconUrl || stage1ImageUrl || ''}
              readOnly={readOnly}
              compact={true}
              onImageChange={(url: string) => onChange({ rewardBadge: { ...badge, iconUrl: url } })}
              urlPlaceholder="URL ảnh hoặc chọn file..."
              showToast={showToast}
              uploadPurpose="island_stage6_badge"
              questId={questId}
            />
          </div>

          {/* Cột Phải: Tổng Sao Gom Lại & Điểm XP */}
          <div className="space-y-3 bg-white p-3.5 rounded-2xl border-2 border-emerald-200 shadow-2xs">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1.5">
                Sao trao thưởng của trạm (⭐)
              </label>

              {/* Nút bật/tắt tặng 1 sao cho chặng 6 */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() => {
                  if (onToggleStage6Star) {
                    onToggleStage6Star()
                  } else {
                    const nextAllocation = hasStage6Star
                      ? allocatedStages.filter((idx) => idx !== 5)
                      : [...allocatedStages, 5].slice(0, 3)
                    const nextTotal = Math.max(1, nextAllocation.length)
                    onChange({ rewardBadge: { ...badge, stars: nextTotal } })
                  }
                }}
                className={cn(
                  'w-full py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-between shadow-2xs active:scale-95',
                  hasStage6Star
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-clay-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-amber-50/60'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Star
                    size={14}
                    className={cn(hasStage6Star ? 'fill-amber-950 text-amber-950' : 'text-slate-400')}
                  />
                  <span>
                    {hasStage6Star ? 'Chặng 6 này được tặng 1 Sao (+1)' : 'Bấm để tặng 1 Sao chặng này'}
                  </span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-black/10">
                  {hasStage6Star ? 'ĐÃ CHỌN' : '+1 SAO'}
                </span>
              </button>

              {/* Tổng số sao gom lại của cả trạm */}
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-amber-950 tracking-wider block">
                    Tổng số sao của trạm:
                  </span>
                  <span className="text-[11px] font-semibold text-amber-800">
                    Gồm {otherStarsCount} sao từ các chặng trước ({otherStagesList.map((s) => `Chặng ${s + 1}`).join(', ') || 'Chưa chọn'}) {hasStage6Star ? '+ 1 sao về đích' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-400 border border-amber-500 px-2.5 py-1 rounded-lg shadow-clay-xs shrink-0">
                  {Array.from({ length: totalStationStars }).map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-950 text-amber-950" />
                  ))}
                  <span className="font-black text-amber-950 text-xs ml-0.5">
                    {totalStationStars} Sao
                  </span>
                </div>
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

      {/* KHỐI 3: ĐIỀU HƯỚNG BƯỚC TIẾP THEO (Tự Động Trong Đảo) */}
      <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-sky-50/70 to-blue-50/70 p-4 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
            <Compass size={20} />
          </span>
          <div className="min-w-0">
            <h5 className="text-xs font-black uppercase tracking-wider text-indigo-950">
              Lộ trình tiếp theo: Tự động
            </h5>
            <p className="text-[11px] font-semibold text-indigo-800 mt-0.5">
              Hệ thống tự động chuyển tiếp sang trạm kế tiếp theo thứ tự sắp xếp trong Đảo học tập.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 text-xs font-black shrink-0 shadow-2xs">
          ⚡ Tự động theo Đảo
        </span>
      </div>
    </div>
  )
}

export { RewardBlockEditor as Stage6RewardEditor }
