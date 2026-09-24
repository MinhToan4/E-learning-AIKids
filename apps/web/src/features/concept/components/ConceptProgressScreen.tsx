import React, { useState } from 'react'
import {
  MoreHorizontal,
  ArrowUpRight,
  TrendingUp,
  Award,
  Flame,
  ShieldCheck,
  Palette,
  BookOpen,
  Sparkles,
  Compass,
} from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'
import { MeeStageFrame } from './MeeStageFrame'

export interface ConceptProgressScreenProps {
  onMoreOptions?: () => void
  onCardClick?: (cardId: string) => void
  isMobileFrame?: boolean
}

interface ChartDay {
  key: string
  label: string
  hours: number
  heightPct: number
  isHighlight?: boolean
}

const WEEKLY_CHART_DATA: ChartDay[] = [
  { key: 'sun', label: 'CN', hours: 1.5, heightPct: 35 },
  { key: 'mon', label: 'T2', hours: 2.2, heightPct: 50 },
  { key: 'tue', label: 'T3', hours: 1.8, heightPct: 42 },
  { key: 'wed', label: 'T4', hours: 3.0, heightPct: 68 },
  { key: 'thu', label: 'T5', hours: 4.5, heightPct: 100, isHighlight: true },
  { key: 'fri', label: 'T6', hours: 2.4, heightPct: 54 },
  { key: 'sat', label: 'T7', hours: 3.2, heightPct: 72 },
]

export const ConceptProgressScreen: React.FC<ConceptProgressScreenProps> = ({
  onMoreOptions,
  onCardClick,
  isMobileFrame = false,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('thu')

  return (
    <div className="w-full flex flex-col gap-6 text-zinc-900 pb-20 select-none min-w-0">
      {/* 1. Header: "Kế Hoạch & Tiến Độ" + Nút menu 3 chấm */}
      <header className="flex items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Kế Hoạch &amp; Tiến Độ
          </h1>
          <p className="text-xs sm:text-sm font-medium text-zinc-500">
            Hành trình rèn luyện &amp; sáng tạo hàng tuần
          </p>
        </div>

        <button
          type="button"
          onClick={onMoreOptions}
          aria-label="Tùy chọn khác"
          className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all"
        >
          <MoreHorizontal className="w-5 h-5 text-zinc-700" />
        </button>
      </header>

      {/* 2. HỘ CHIẾU THÁM HIỂM THỰC TẾ (EXPLORER PASSPORT) VỚI ĐẦU MÈO MEE NHÔ LÊN */}
      <MeeStageFrame variant="cat-head-peek">
        <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#faf5ff] via-[#f5f3ff] to-[#f0f9ff] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
          {/* Passport Stamp Decoration */}
          <div className="flex items-center justify-between gap-2 border-b border-purple-200/50 pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 p-0.5 shrink-0 shadow-xs">
                <div className="w-full h-full rounded-full bg-white overflow-hidden">
                  <img
                    src={designerAssets.brand.mascot}
                    alt="Jacob Avatar"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                    HỘ CHIẾU THÁM HIỂM
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-zinc-900 truncate">
                  Jacob • Cấp 4 • 1,250 XP
                </h2>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black shadow-xs shrink-0 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Mee Verified</span>
            </div>
          </div>

          {/* 4 Chỉ Số Hộ Chiếu Thực TẾ (Lưới 2 cột rộng rãi trên mobile) */}
          <div className={`grid ${isMobileFrame ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-2.5 pt-1`}>
            {/* Chỉ số 1: Tổng số sao gặt hái (28 ⭐) */}
            <div className="rounded-2xl bg-white/95 p-3 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-zinc-500">Tổng số sao</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-amber-500">28</span>
                <span className="text-base">⭐</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-700/80 mt-0.5">
                Từ 12 trạm đạt chuẩn
              </span>
            </div>

            {/* Chỉ số 2: Số trạm hoàn thành (12 / 32 trạm - 38%) */}
            <div className="rounded-2xl bg-white/95 p-3 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-zinc-500">Trạm hoàn thành</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-emerald-600">12</span>
                <span className="text-xs font-bold text-zinc-400">/ 32 trạm</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 mt-0.5">
                38% lộ trình tổng
              </span>
            </div>

            {/* Chỉ số 3: Chuỗi ngày học liên tục (7 ngày 🔥 - Hôm nay đã giữ chuỗi) */}
            <div className="rounded-2xl bg-white/95 p-3 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-zinc-500">Chuỗi ngày học</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-[#FD7D2E]">7 ngày</span>
                <span className="text-base">🔥</span>
              </div>
              <span className="text-[10px] font-bold text-orange-600 mt-0.5 truncate">
                Hôm nay đã giữ chuỗi
              </span>
            </div>

            {/* Chỉ số 4: Cấp độ & XP (Cấp 4 • 1,250 XP) */}
            <div className="rounded-2xl bg-white/95 p-3 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-zinc-500">Cấp độ &amp; Điểm</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-purple-700">Cấp 4</span>
              </div>
              <span className="text-[10px] font-bold text-purple-600 mt-0.5 truncate">
                1,250 / 1,500 XP
              </span>
            </div>
          </div>
        </section>
      </MeeStageFrame>

      {/* 3. Trio Cards: Hàng 3 thẻ chỉ số nhanh (Không bao giờ bị bẻ gãy chữ) */}
      <section className={isMobileFrame ? 'flex flex-col gap-2.5' : 'flex flex-col sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3.5'}>
        {/* Thẻ 1: Pastel hồng (#ffe4e6) */}
        <div
          onClick={() => onCardClick?.('islands')}
          className="group rounded-2xl sm:rounded-[2rem] bg-[#ffe4e6] p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all hover:scale-[1.01] shadow-xs cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-200/90 text-rose-800 flex items-center justify-center shrink-0 shadow-2xs">
              <Compass className="w-5 h-5 text-rose-700" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-rose-800 tracking-tight leading-tight block">
                Khóa của con
              </span>
              <div className="text-base sm:text-xl font-black text-zinc-900 truncate">
                6 Đảo Khám Phá
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-rose-700/80 truncate">
                Lộ trình chuẩn 6 Đảo
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#18181b] text-white flex items-center justify-center shrink-0 group-hover:scale-105 active:scale-95 transition-all shadow-2xs">
            <ArrowUpRight className="w-4 h-4 text-zinc-200" />
          </div>
        </div>

        {/* Thẻ 2: Pastel xanh tím (#ede9fe) */}
        <div
          onClick={() => onCardClick?.('lessons')}
          className="group rounded-2xl sm:rounded-[2rem] bg-[#ede9fe] p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all hover:scale-[1.01] shadow-xs cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-200/90 text-purple-800 flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-5 h-5 text-purple-700" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-purple-900 tracking-tight leading-tight block">
                Trạm đã xong
              </span>
              <div className="text-base sm:text-xl font-black text-zinc-900 truncate">
                12 / 32 Trạm
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-purple-700/80 truncate">
                12 Trạm đạt chuẩn tối đa
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#18181b] text-white flex items-center justify-center shrink-0 group-hover:scale-105 active:scale-95 transition-all shadow-2xs">
            <ArrowUpRight className="w-4 h-4 text-zinc-200" />
          </div>
        </div>

        {/* Thẻ 3: Pastel vàng kem (#fef3c7) */}
        <div
          onClick={() => onCardClick?.('next_station')}
          className="group rounded-2xl sm:rounded-[2rem] bg-[#fef3c7] p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all hover:scale-[1.01] shadow-xs cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-200/90 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-amber-900 tracking-tight leading-tight block">
                Điểm đến tiếp
              </span>
              <div className="text-base sm:text-xl font-black text-zinc-900 truncate">
                Đảo 2 - Trạm 3
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-amber-700/80 truncate">
                Khóa Phong Cách nghệ thuật
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#18181b] text-white flex items-center justify-center shrink-0 group-hover:scale-105 active:scale-95 transition-all shadow-2xs">
            <ArrowUpRight className="w-4 h-4 text-zinc-200" />
          </div>
        </div>
      </section>

      {/* 4. Thẻ Average Progress: Squircle rounded-[2.25rem] shadow-sm */}
      <section className="rounded-[2.25rem] bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Chỉ số rèn luyện
            </span>
            <h2 className="text-base sm:text-lg font-black text-zinc-900">
              Tiến Độ Trung Bình
            </h2>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>+15% tuần này</span>
          </div>
        </div>

        {/* Big Metric Display */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight">
            78%
          </span>
          <span className="text-xs font-semibold text-zinc-500">
            mục tiêu tháng
          </span>
        </div>

        {/* Thanh tiến độ pastel sọc chéo .progress-hatched */}
        <div className="space-y-2">
          <div className="w-full h-5 rounded-full bg-purple-50 overflow-hidden p-1 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 progress-hatched transition-all duration-500"
              style={{ width: '78%' }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span>0% Khởi đầu</span>
            <span className="font-bold text-purple-700">78% Hiện tại</span>
            <span>100% Cán đích</span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 font-medium leading-relaxed pt-1 border-t border-zinc-100">
          🎉 <strong className="text-zinc-800">Xuất sắc!</strong> Con duy trì phong độ vượt bậc, chỉ còn 22% nữa để nhận Huy Hiệu Sáng Tạo Mèo Mee Vàng!
        </p>
      </section>

      {/* 5. KHU VƯỜN KỸ NĂNG MONTESSORI (SKILL GARDEN - DỮ LIỆU THỰC TẾ) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-zinc-900">
                Khu Vườn Kỹ Năng Montessori
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Skill Garden
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              4 năng lực đang lớn lên từng ngày của con
            </p>
          </div>
        </div>

        <div className={`grid ${isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3.5`}>
          {/* Năng lực 1: Tư duy Prompt (Cấp 3 - 85%) */}
          <div className="rounded-3xl bg-[#f5f3ff] p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-200/80 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 fill-purple-600 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900">Tư duy Prompt</h3>
                  <p className="text-xs font-semibold text-purple-700">Cấp 3 • Nâng cao</p>
                </div>
              </div>
              <span className="text-xs font-black text-purple-800">85%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-purple-200/70 overflow-hidden">
              <div className="h-full rounded-full bg-purple-600" style={{ width: '85%' }} />
            </div>
            <p className="text-[11px] font-medium text-zinc-500">
              Biết cấu trúc 4 chìa khóa lệnh và mô tả không gian chi tiết
            </p>
          </div>

          {/* Năng lực 2: Mỹ thuật & Màu sắc (Cấp 2 - 60%) */}
          <div className="rounded-3xl bg-[#fff1f2] p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-200/80 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900">Mỹ thuật &amp; Màu sắc</h3>
                  <p className="text-xs font-semibold text-rose-700">Cấp 2 • Khá tốt</p>
                </div>
              </div>
              <span className="text-xs font-black text-rose-800">60%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-rose-200/70 overflow-hidden">
              <div className="h-full rounded-full bg-rose-500" style={{ width: '60%' }} />
            </div>
            <p className="text-[11px] font-medium text-zinc-500">
              Nhận diện phong cách màu nước, đất nặn 3D và gam màu pastel
            </p>
          </div>

          {/* Năng lực 3: Kể chuyện & Cốt truyện (Cấp 4 - 90%) */}
          <div className="rounded-3xl bg-[#eff6ff] p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-200/80 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900">Kể chuyện &amp; Cốt truyện</h3>
                  <p className="text-xs font-semibold text-blue-700">Cấp 4 • Xuất sắc</p>
                </div>
              </div>
              <span className="text-xs font-black text-blue-800">90%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-blue-200/70 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600" style={{ width: '90%' }} />
            </div>
            <p className="text-[11px] font-medium text-zinc-500">
              Xây dựng mạch truyện 8 ô mạch lạc, cao trào và bài học ý nghĩa
            </p>
          </div>

          {/* Năng lực 4: An toàn số & Đạo đức AI (Cấp 5 - 100% - Đạt Huân chương Hiệp Sĩ) */}
          <div className="rounded-3xl bg-[#ecfdf5] p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-3 ring-1 ring-emerald-300/50">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-zinc-900">An toàn số &amp; Đạo đức AI</h3>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">
                    Cấp 5 • Đạt Huân chương Hiệp Sĩ 🎖️
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-800">100%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-emerald-200/70 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
            </div>
            <p className="text-[11px] font-medium text-zinc-500">
              Hoàn thành xuất sắc 10/10 quy tắc vàng bảo vệ bản thân và tôn trọng bản quyền
            </p>
          </div>
        </div>
      </section>

      {/* 6. Thẻ Progress Learning Chart: Cột viên thuốc CN-T7, cột T5 có nhãn đen 4,5hr */}
      <section className="rounded-[2.25rem] bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Thời gian rèn luyện
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                04hr 54min
              </h2>
              <span className="text-xs font-semibold text-purple-600">
                Tuần 38
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Flame className="w-5 h-5 fill-purple-600" />
          </div>
        </div>

        {/* Biểu đồ 7 cột dọc dạng viên thuốc cho CN - T7 */}
        <div className="pt-8 pb-2">
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-44 px-1">
            {WEEKLY_CHART_DATA.map((day) => {
              const isSelected = selectedDay === day.key
              const isThu = day.isHighlight

              return (
                <div
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                >
                  {/* Capsule Bar Container */}
                  <div className="relative w-full max-w-[34px] sm:max-w-[40px] h-36 rounded-full bg-zinc-100/90 flex flex-col justify-end p-1 transition-all group-hover:bg-zinc-200/80">
                    {/* Floating dark pill label for Thursday (4,5hr) */}
                    {isThu && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                        <span className="px-2 py-0.5 rounded-full bg-[#18181b] text-white text-[10px] font-black shadow-md whitespace-nowrap">
                          4,5hr
                        </span>
                      </div>
                    )}

                    {/* Column Fill Capsule */}
                    <div
                      style={{ height: `${day.heightPct}%` }}
                      className={`w-full rounded-full transition-all duration-300 ${
                        isThu
                          ? 'bg-gradient-to-t from-violet-600 to-purple-400 shadow-sm'
                          : isSelected
                            ? 'bg-purple-300'
                            : 'bg-purple-200/90 group-hover:bg-purple-300'
                      }`}
                    />
                  </div>

                  {/* Day Label Bottom */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-xs transition-colors ${
                        isThu
                          ? 'font-black text-purple-700'
                          : isSelected
                            ? 'font-bold text-zinc-900'
                            : 'font-semibold text-zinc-400 group-hover:text-zinc-600'
                      }`}
                    >
                      {day.label}
                    </span>
                    {isThu && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-0.5" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend / Status Note */}
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-400" />
            <span className="font-semibold text-zinc-700">Thứ Năm rèn luyện bứt phá</span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">
            Mục tiêu: 5h / tuần
          </span>
        </div>
      </section>
    </div>
  )
}

export default ConceptProgressScreen
