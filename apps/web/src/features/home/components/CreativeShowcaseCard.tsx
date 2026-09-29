import React from 'react'
import { Link } from 'react-router'
import { Palette, Star } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface CreativeShowcaseCardProps {
  userName?: string
  userLevel?: number
  artworkUrl?: string
  promptText?: string
  className?: string
  onOpenBackpack?: () => void
  onOpenWorkshop?: () => void
}

export const CreativeShowcaseCard: React.FC<CreativeShowcaseCardProps> = ({
  userName = 'Bé Bo Bo',
  userLevel = 5,
  artworkUrl = '/assets/aikid-ui/showcase/soft_clay_puppy_artwork.jpg',
  promptText = '“Một con cún, lông vàng hai tai cụp, đang chạy đuổi quả bóng, ở góc sân gạch đỏ.”',
  className,
  onOpenBackpack,
  onOpenWorkshop,
}) => {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-amber-50 to-orange-50/40 border-2 border-amber-200 p-4 sm:p-5 lg:p-6 shadow-2xs space-y-3 min-w-0 transition-all',
        className,
      )}
      aria-label="Góc sáng tạo của bé"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-base sm:text-lg text-amber-950 leading-tight break-words min-w-0">
              Góc Sáng Tạo Của {userName} (Tác Phẩm Mới Nhất)
            </h3>
            <p className="text-xs text-amber-800 font-medium break-words min-w-0">
              Bức tranh chú cún do chính con đạo diễn ở Phân Xưởng AI đã được lồng khung!
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] sm:text-xs font-black self-start sm:self-auto shrink-0 shadow-2xs">
          <span>Đạt 3 Sao Vàng</span>
          <Star size={12} className="text-amber-700 fill-amber-500 shrink-0" />
        </span>
      </div>

      {/* Khung tranh 16:9 lồng tác phẩm thật */}
      <div className="grid gap-4 items-center pt-1 grid-cols-1 md:grid-cols-2 min-w-0">
        <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-300 shadow-md group min-w-0">
          <img
            src={artworkUrl}
            alt={`Tranh của ${userName}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-black">
              TÁC PHẨM ĐẦU TAY
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
              <Star size={11} className="text-amber-950 fill-amber-950 shrink-0" />
              <span>3 Sao</span>
            </span>
          </div>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 text-white text-[11px] font-bold min-w-0 break-words">
            Đạo diễn bởi: {userName} • Cấp {userLevel}
          </div>
        </div>

        <div className="space-y-3 min-w-0">
          <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200 space-y-1 shadow-2xs min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block break-words">
              CÂU LỆNH PROMPT SÁNG TẠO
            </span>
            <p className="font-bold text-xs sm:text-sm text-slate-800 leading-relaxed break-words min-w-0">
              {promptText}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 min-w-0">
            {onOpenBackpack ? (
              <button
                type="button"
                onClick={onOpenBackpack}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs shadow-xs transition-all text-center cursor-pointer min-w-0 break-words"
              >
                Mở Hồ Sơ &amp; Ba Lô Xem Tranh
              </button>
            ) : (
              <Link
                to="/profile"
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs shadow-xs transition-all text-center block min-w-0 break-words"
              >
                Mở Hồ Sơ &amp; Ba Lô Xem Tranh
              </Link>
            )}

            {onOpenWorkshop ? (
              <button
                type="button"
                onClick={onOpenWorkshop}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all text-center cursor-pointer min-w-0 break-words"
              >
                Vào Phân Xưởng Vẽ Tranh Mới
              </button>
            ) : (
              <Link
                to="/world/dao-1"
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all text-center block min-w-0 break-words"
              >
                Vào Phân Xưởng Vẽ Tranh Mới
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CreativeShowcaseCard
