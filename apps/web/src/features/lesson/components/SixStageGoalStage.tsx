import { Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { SixStageGoal } from '@/shared/lib/api'

type Props = {
  goal: SixStageGoal
  fourKeys?: boolean
  compact?: boolean
  onContinue?: () => void
  onImageClick?: (image: { url: string; title: string }) => void
  showContinue?: boolean
}

const KEY_STYLES = [
  { code: 'CÁI GÌ', sub: 'Ai, đồ vật gì', bg: 'bg-blue-50/80 border-blue-200 text-blue-950', badge: 'bg-blue-600 text-white', image: '/assets/aiki-keys/key_what_blue.jpg' },
  { code: 'TRÔNG THẾ NÀO', sub: 'Màu sắc, hình dáng', bg: 'bg-amber-50/80 border-amber-200 text-amber-950', badge: 'bg-amber-600 text-white', image: '/assets/aiki-keys/key_how_yellow.jpg' },
  { code: 'ĐANG LÀM GÌ', sub: 'Hành động', bg: 'bg-orange-50/80 border-orange-200 text-orange-950', badge: 'bg-orange-600 text-white', image: '/assets/aiki-keys/key_action_orange.jpg' },
  { code: 'Ở ĐÂU', sub: 'Bối cảnh, nơi chốn', bg: 'bg-rose-50/80 border-rose-200 text-rose-950', badge: 'bg-rose-600 text-white', image: '/assets/aiki-keys/key_where_pink.jpg' },
] as const

function pointValue(raw?: string, fallback = '') {
  if (!raw) return fallback
  const match = raw.match(/:\s*['"“](.+?)['"”]$/) || raw.match(/:\s*(.+)$/)
  return match ? `“${match[1]}”` : raw
}

export function SixStageGoalStage({ goal, fourKeys = false, compact = false, onContinue, onImageClick, showContinue = true }: Props) {
  const COLOR_NAMES = ['xanh sky', 'vàng sun', 'cam mango', 'hồng gum', 'sky', 'sun', 'coral', 'rose', 'brand']

  const cards = KEY_STYLES.map((style, index) => {
    const raw = goal.keyPoints[index] || ''
    const colonIdx = raw.indexOf(':')
    const prefix = colonIdx > 0 ? raw.slice(0, colonIdx).trim() : ''
    const matchSub = prefix.match(/^(.*?)(?:\s*\((.*?)\))?$/)
    let parsedLabel = matchSub && matchSub[1] ? matchSub[1].trim() : style.code
    let parsedSub = matchSub && matchSub[2] ? matchSub[2].trim() : style.sub

    if (!parsedSub || COLOR_NAMES.includes(parsedSub.toLowerCase())) {
      parsedSub = style.sub
    }
    if (parsedLabel.toUpperCase() === 'TRÔNG NHƯ THẾ NÀO') {
      parsedLabel = 'TRÔNG THẾ NÀO'
    }

    return {
      ...style,
      code: parsedLabel || style.code,
      sub: parsedSub || style.sub,
      value: pointValue(raw, 'Nội dung chìa khóa'),
    }
  })

  return (
    <section
      data-testid="stage-0-goal"
      className={cn(
        'rounded-3xl bg-white shadow-xs border border-slate-200/80 flex flex-col',
        compact ? 'gap-4 p-3' : 'gap-5 p-5 sm:p-7'
      )}
    >
      {/* Phần 1 - Tiêu đề & Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs sm:text-sm font-bold w-fit border border-purple-200/60">
          <Sparkles size={13} className="text-purple-500" />
          <span>Chặng 1: Mục tiêu bài học</span>
        </div>
        <h2 className={cn("font-black text-slate-800 leading-tight", compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl")}>
          {goal.title}
        </h2>
      </div>

      {/* Bố cục 2 Cột chuẩn Montessori trên Desktop (hoặc xếp dọc trên Mobile) */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Cột Trái (Hero Banner) */}
        <div className="w-full lg:w-[48%] max-w-2xl rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs relative group aspect-16/11 sm:aspect-16/10 flex items-center justify-center">
          <img
            src={goal.imageUrl}
            alt={goal.title}
            className="block h-auto w-full cursor-pointer object-contain"
            onClick={() => onImageClick?.({ url: goal.imageUrl, title: goal.title })}
            onError={(event) => {
              event.currentTarget.src = fourKeys
                ? '/assets/aiki-islands/island1_lesson2_keys_v2.jpg'
                : '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
            }}
          />
          {/* Text box overlay trên ảnh chuyển sang sr-only để tránh đè / vỡ layout khi đổi size màn hình */}
          <div className="sr-only">
            <span>🔑</span>
            <span>{fourKeys ? 'Rương 4 Chìa Khóa Thần Kỳ' : 'Chìa Khóa Mục Tiêu'}</span>
            {fourKeys && (
              <div>
                <span>1. Cái gì</span>
                <span>2. Trông thế nào</span>
                <span>3. Đang làm gì</span>
                <span>4. Ở đâu</span>
              </div>
            )}
          </div>
          {onImageClick && (
            <button
              type="button"
              onClick={() => onImageClick({ url: goal.imageUrl, title: goal.title })}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
            >
              🔍 Phóng to
            </button>
          )}
        </div>

        {/* Cột Phải (Mục tiêu cốt lõi & 4 Chìa Khóa) */}
        <div className="w-full lg:w-[52%] flex flex-col justify-between gap-4">
          {/* Thẻ Mục Tiêu Cốt Lõi */}
          <div className={cn("w-full rounded-2xl border border-purple-100 bg-[#f5f0ff] p-4 flex items-start gap-3", compact && "p-3 text-sm")}>
            <span className="text-2xl shrink-0 mt-0.5">🎯</span>
            <div className="flex-1 min-w-0">
              <span className="font-black text-purple-900 block mb-1 text-xs sm:text-sm uppercase tracking-wide">
                Mục Tiêu Cốt Lõi:
              </span>
              <p className="font-semibold text-slate-800 text-sm sm:text-base leading-relaxed">
                {goal.goalText}
              </p>
            </div>
          </div>

          {/* Bốn Chiếc Chìa Khóa Vàng (Khớp 1-1 với rương) */}
          {fourKeys ? (
            <div className="flex flex-col gap-2.5 sm:gap-3 flex-1 justify-center">
              <div className={cn("flex flex-wrap items-center gap-1.5 font-black uppercase tracking-wider text-purple-900 min-w-0 break-words", compact ? "text-xs" : "text-xs sm:text-sm")}>
                🔑 BỐN CHIẾC CHÌA KHÓA MỞ KHÓA CÂU LỆNH (Khớp 1-1 Với Rương):
              </div>
              <div className={cn("grid gap-2.5 items-stretch", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
                {cards.map((card, index) => (
                  <div
                    key={card.code}
                    className="p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition-all flex items-start gap-2 sm:gap-2.5 min-h-[64px] h-auto"
                  >
                    <img
                      src={card.image}
                      alt={card.code}
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-contain bg-amber-50/60 border border-amber-200/90 p-1 shrink-0 mt-0.5 shadow-xs"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className={cn('px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider w-fit', card.badge)}>
                        [{index + 1}] {card.code}
                      </span>
                      <p className="text-xs sm:text-[13px] font-black text-zinc-900 mt-0.5 line-clamp-3 leading-snug break-words">
                        {card.value}
                      </p>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 block mt-0.5">
                        ({card.sub})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              {goal.keyPoints.map((point, index) => (
                <div key={index} className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-sm font-bold text-slate-800">
                  <span className="mr-2 text-amber-600">★</span>{point}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phần 5 - Nút Đi Tiếp */}
      {showContinue && (
        <div className="shrink-0 pt-2 pb-1 flex justify-end border-t border-slate-100">
          <button
            type="button"
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 text-sm sm:text-base font-black rounded-2xl bg-[#18181b] hover:bg-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
            onClick={onContinue}
          >
            <span>Đã hiểu mục tiêu! Đi tiếp nào</span>
          </button>
        </div>
      )}
    </section>
  )
}
