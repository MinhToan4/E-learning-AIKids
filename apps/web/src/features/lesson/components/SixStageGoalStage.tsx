import { ArrowRight, Sparkles } from 'lucide-react'
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
  const cards = KEY_STYLES.map((style, index) => ({
    ...style,
    value: pointValue(goal.keyPoints[index], 'Nội dung chìa khóa'),
  }))

  return (
    <section data-testid="stage-0-goal" className={cn('rounded-3xl bg-white shadow-clay border-2 border-brand-100 flex flex-col', compact ? 'gap-4 p-3' : 'gap-6 p-5 sm:p-7')}>
      <div className={cn('flex flex-col items-stretch', compact ? 'gap-4' : 'gap-6 md:flex-row lg:gap-8')}>
        <div className={cn('w-full rounded-3xl overflow-hidden shadow-clay border-4 border-amber-200 bg-amber-50 group relative aspect-[4/3] flex items-center justify-center', !compact && 'md:w-1/2')}>
          <img
            src={goal.imageUrl}
            alt={goal.title}
            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
            onClick={() => onImageClick?.({ url: goal.imageUrl, title: goal.title })}
            onError={(event) => { event.currentTarget.src = fourKeys ? '/assets/aiki-islands/island1_lesson2_keys_v2.jpg' : '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2' }}
          />
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md pointer-events-none flex items-center gap-1.5 border border-white/20 z-10">
            <span>🔑</span><span>{fourKeys ? 'Rương 4 Chìa Khóa Thần Kỳ' : 'Chìa Khóa Mục Tiêu'}</span>
          </div>
          {fourKeys && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
              {['bg-blue-600/90', 'bg-amber-500/90', 'bg-orange-500/90', 'bg-rose-500/90'].map((color, index) => (
                <span key={color} className={cn('px-2 py-0.5 rounded-full text-white text-[11px] sm:text-xs font-black backdrop-blur-xs shadow-xs', color)}>{index + 1}. {['Cái gì', 'Trông thế nào', 'Đang làm gì', 'Ở đâu'][index]}</span>
              ))}
            </div>
          )}
          {onImageClick && (
            <button type="button" onClick={() => onImageClick({ url: goal.imageUrl, title: goal.title })} className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10">🔍 Phóng to</button>
          )}
        </div>

        <div className={cn('w-full flex flex-col justify-between gap-3 sm:gap-4', !compact && 'md:w-1/2')}>
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs sm:text-sm font-bold w-fit border border-brand-200/60"><Sparkles size={13} className="text-brand-500" /><span>Chặng 1: Mục tiêu bài học</span></div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">{goal.title}</h2>
          </div>
          <div className="text-base text-slate-700 font-medium leading-relaxed bg-brand-50/70 p-4 sm:p-5 rounded-3xl border-2 border-brand-100 shadow-clay-sm flex items-start gap-3">
            <span className="text-2xl shrink-0 mt-0.5">🎯</span><div><span className="font-black text-brand-900 block mb-1 text-xs sm:text-sm uppercase tracking-wide">Mục Tiêu Cốt Lõi:</span><p className="font-semibold text-slate-800 text-sm sm:text-base leading-relaxed">{goal.goalText}</p></div>
          </div>
          {fourKeys ? (
            <div className="flex flex-col gap-2 flex-1 justify-between">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950">🔑 BỐN CHIẾC CHÌA KHÓA MỞ KHÓA CÂU LỆNH (Khớp 1-1 Với Rương):</div>
              <div className={cn('grid gap-3 sm:gap-3.5 flex-1 items-stretch', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
                {cards.map((card, index) => (
                  <div key={card.code} className={cn('p-2 sm:p-2.5 rounded-2xl border-2 bg-white/95 shadow-clay-sm hover:shadow-clay transition-all flex items-center gap-2.5 sm:gap-3', card.bg)}>
                    <img src={card.image} alt={card.code} className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl object-contain bg-amber-50/60 border-2 border-amber-200/90 p-1 shrink-0 shadow-xs" />
                    <div className="flex-1 min-w-0 flex flex-col justify-center"><span className={cn('px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider w-fit', card.badge)}>[{index + 1}] {card.code}</span><p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 line-clamp-1 leading-tight">{card.value}</p><span className="text-[11px] sm:text-xs font-bold text-slate-500 block mt-0.5">({card.sub})</span></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-2">{goal.keyPoints.map((point, index) => <div key={index} className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-sm font-bold text-slate-800"><span className="mr-2 text-amber-600">★</span>{point}</div>)}</div>
          )}
        </div>
      </div>
      {showContinue && <div className="shrink-0 pt-2 pb-1 bg-white/95 backdrop-blur-xs flex justify-end border-t border-slate-100"><Button variant="primary" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2" onClick={onContinue}><span>👉 Đã hiểu mục tiêu! Đi tiếp nào ✨</span><ArrowRight size={20} /></Button></div>}
    </section>
  )
}
