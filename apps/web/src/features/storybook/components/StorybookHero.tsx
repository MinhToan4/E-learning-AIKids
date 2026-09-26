import React from 'react'
import { Link } from 'react-router'
import { KidStorybookImageIcon } from '@/shared/components/icons/KidImageIcons'
import { FlatClayStar } from '@/features/asmo/components/AsmoFlatClayIcons'
import { designerAssets } from '@/shared/config/assets'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'

export interface StorybookHeroProps {
  publishedEarnedCount: number
  totalStickersCount: number
  loading?: boolean
}

export const StorybookHero: React.FC<StorybookHeroProps> = ({
  publishedEarnedCount,
  totalStickersCount,
  loading = false,
}) => {
  return (
    <header
      className="relative overflow-hidden rounded-[2rem] border-2 border-white/80 bg-gradient-to-br from-[#FFFCEB] via-[#FCF5EA] to-[#FEFBF6] p-4 sm:p-6 md:p-8 shadow-clay"
      aria-label="Thông tin thư viện Storybook"
    >
      {/* Vệt sáng phản quang men gốm và vệt màu ấm áp Aiki */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-[#FF960B]/15 to-[#FD7D2E]/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-[#9F2642]/5 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        {/* Cột trái: Tiêu đề & Lời dẫn */}
        <div className="flex-1 min-w-0 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#9F2642]/20 bg-white/90 px-3.5 py-1 text-xs sm:text-sm font-extrabold text-[#9F2642] shadow-2xs backdrop-blur-xs">
            <KidStorybookImageIcon size={20} />
            Kho Tàng Sticker Kỳ Diệu
          </div>

          <h1 className="mt-2.5 font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#1E2740] leading-tight">
            Cuốn Sách Của Con
          </h1>

          <p className="mt-2 text-sm sm:text-base font-semibold leading-relaxed text-[#5C657A]">
            Khám phá các chương truyện, hoàn thành thử thách và sưu tầm trọn bộ huy hiệu đất nặn cùng mèo Aiki!
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/home"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-2xl border border-[#9F2642]/25 bg-white/90 px-4 py-2 text-sm font-extrabold text-[#9F2642] shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0"
            >
              ← Về sảnh học tập
            </Link>
          </div>
        </div>

        {/* Cột phải: Thẻ đếm Sticker 3D Soft Clay */}
        <div
          className="flex items-center gap-3 sm:gap-4 rounded-2xl border-2 border-white/90 bg-white/85 p-3.5 sm:p-4 shadow-clay backdrop-blur-xs shrink-0 self-start sm:self-center"
          aria-label={`${publishedEarnedCount} trên ${totalStickersCount} sticker đã mở`}
        >
          <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#9F2642] via-[#C0392B] to-[#FD7D2E] text-white shadow-soft shrink-0 border border-white/40">
            <FlatClayStar size={32} className="drop-shadow-xs" />
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-black text-[#9F2642] leading-none">
              {loading ? '…' : `${publishedEarnedCount}/${totalStickersCount}`}
            </div>
            <span className="mt-1 block text-xs sm:text-sm font-bold text-[#5C657A]">
              Sticker đã mở
            </span>
          </div>
        </div>
      </div>

      {/* Trang trí hoạt cảnh Đảo truyện & Mèo Aiki */}
      <div className="student-feature-scene" aria-hidden="true">
        <img
          src={designerAssets.worldScenes.storyIsland}
          alt=""
          className="object-contain drop-shadow-md"
        />
        <ImportantCardMascot pose="thinking" className="important-card-mascot--scene" />
      </div>
    </header>
  )
}

export default StorybookHero
