import React from 'react'
import {
  Volume2,
  Sparkles,
  ArrowRight,
  Zap,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  Scale,
  Compass,
  Trophy,
} from 'lucide-react'
import type { AsmoLmsLesson, AsmoLmsStage } from '../data/asmo-curriculum-lms'
import { AsmoFormula } from './AsmoFormula'
import { speakVietnamese } from './AsmoInteractiveAppleTreeCanvas'
import {
  FlatClayBalloon,
  FlatClayPopBurst,
  FlatClayCupcake,
  FlatClayCandy,
  FlatClayWatermelon,
  FlatClayPizzaSlice,
  FlatClayCube,
  FlatClayRedApple,
  FlatClayGreenApple,
} from './AsmoFlatClayIcons'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export interface AsmoVisualSecretComicCardProps {
  lesson: AsmoLmsLesson
  stage: AsmoLmsStage
  onAdvanceToPractice: () => void
}

export function AsmoVisualSecretComicCard({
  lesson,
  stage,
  onAdvanceToPractice,
}: AsmoVisualSecretComicCardProps) {
  const handlePlayVoice = () => {
    const speechText = `${lesson.meeTip.quote}. ${lesson.meeTip.storyAdvice}`
    speakVietnamese(speechText)
  }

  return (
    <section
      aria-label="Tranh bí kíp trực quan Mèo Mee"
      className="rounded-3xl sm:rounded-4xl border-3 border-amber-200/90 bg-gradient-to-b from-amber-50/70 via-white to-sky-50/60 p-5 sm:p-7 md:p-8 shadow-clay space-y-6 sm:space-y-7 animate-fade-up select-none"
    >
      {/* ══════════════════════════════════════════════════════════════════
          1. TOP BANNER: MÈO MEE AVATAR + BONG BÓNG THOẠI KHẨU QUYẾT + NÚT LOA
      ══════════════════════════════════════════════════════════════════ */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-100/80 pb-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white text-xs sm:text-sm font-black shadow-clay-sm">
            <Sparkles className="size-4 animate-spin" />
            <span>TRANH BÍ KÍP MÈO MEE · TRẠM {lesson.lessonNumber}</span>
            <Sparkles className="size-4 animate-spin" />
          </div>

          <span className="text-xs font-black text-amber-900 bg-amber-100/80 border border-amber-300/80 px-3 py-1 rounded-full">
            {stage.title}
          </span>
        </div>

        {/* Comic Mascot Speech Bubble Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 bg-white/95 rounded-3xl border-2 border-amber-200 p-4 sm:p-5 shadow-clay relative">
          {/* Mascot Cat */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative">
              <AikidCatCharacter pose={lesson.meeTip.pose} className="size-20 sm:size-24 drop-shadow-md animate-bounce" />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white font-black shadow-clay-sm border border-white">
                AI
              </span>
            </div>
            <span className="text-[11px] font-black text-brand-900 mt-1.5 bg-brand-100/90 px-2.5 py-0.5 rounded-full border border-brand-200">
              Trợ Giảng Mee 🐱
            </span>
          </div>

          {/* Speech Bubble Content */}
          <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                <Lightbulb className="size-4 text-amber-500 fill-amber-500" />
                <span>Câu Khẩu Quyết Thần Chú:</span>
              </span>

              {/* Sound Audio Button */}
              <button
                type="button"
                onClick={handlePlayVoice}
                title="Nghe Mèo Mee đọc thần chú"
                aria-label="Phát âm thanh thần chú"
                className="size-9 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-clay cursor-pointer active:scale-90 transition-all border-2 border-amber-600"
              >
                <Volume2 className="size-4.5 stroke-[2.5]" />
              </button>
            </div>

            <p className="text-base sm:text-xl font-black text-slate-900 italic leading-snug">
              &quot;{lesson.meeTip.quote}&quot;
            </p>

            <div className="bg-amber-50/90 rounded-2xl p-2.5 sm:p-3 border border-amber-200 text-xs sm:text-sm font-extrabold text-slate-800">
              <AsmoFormula text={lesson.meeTip.storyAdvice} />
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          2. TRUNG TÂM: BỨC TRANH BÍ KÍP TRỰC QUAN (VISUAL SECRET DIAGRAM)
      ══════════════════════════════════════════════════════════════════ */}
      <main className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <span>🎨</span>
            <span>Bản Đồ Bí Kíp Trực Quan (Comic Flashcard)</span>
          </h3>
          <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            2.5D Soft Clay
          </span>
        </div>

        {/* Dynamic Diagram Panels by Visual Type */}
        <div className="rounded-3xl border-2 border-brand-100 bg-white/95 p-4 sm:p-6 shadow-clay space-y-6">
          {renderVisualSecretDiagram(lesson)}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════
          3. CHÂN THẺ: NÚT SOFT CLAY CHUYỂN SANG THỰC HÀNH PHASE 3
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-amber-100/80">
        <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5 text-center sm:text-left">
          <Zap className="size-4 text-amber-500 fill-amber-500" />
          <span>Bé đã thuộc bí kíp chưa? Hãy cùng Mee bấm nút sang trạm thực hành nhé!</span>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={onAdvanceToPractice}
          className="w-full sm:w-auto gap-3 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 shadow-clay cursor-pointer active:scale-95 transition-all border-2 border-amber-400"
        >
          <span>🎮 Bắt Đầu Thực Hành Trạm {lesson.lessonNumber} ➔</span>
          <ArrowRight className="size-5 stroke-[2.5]" />
        </Button>
      </footer>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// VISUAL SECRET DIAGRAM RENDERER (THEO TỪNG VISUAL TYPE)
// ════════════════════════════════════════════════════════════════════════════

function renderVisualSecretDiagram(lesson: AsmoLmsLesson): React.JSX.Element {
  switch (lesson.visualType) {
    // ────────────────────────────────────────────────────────────────────────
    // TRẠM 1: GỘP TÁO (`apple_drop`)
    // ────────────────────────────────────────────────────────────────────────
    case 'apple_drop':
      return (
        <div className="space-y-6">
          {/* Tranh 2 hộp Soft Clay gộp lại */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            {/* Hộp A: 4 Táo Đỏ */}
            <div className="md:col-span-4 rounded-3xl bg-rose-50/90 border-2 border-rose-200 p-4 text-center space-y-2 shadow-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow-2xs">
                Giỏ A (4 Quả Táo Đỏ)
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4].map((n) => (
                  <FlatClayRedApple key={n} size={42} number={n} />
                ))}
              </div>
              <p className="text-xs font-bold text-rose-800">Số lượng ban đầu: 4 quả</p>
            </div>

            {/* Dấu Cộng */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <span className="size-10 rounded-2xl bg-amber-400 text-white font-black text-2xl flex items-center justify-center shadow-clay border-2 border-white">
                +
              </span>
            </div>

            {/* Hộp B: 3 Táo Xanh */}
            <div className="md:col-span-4 rounded-3xl bg-emerald-50/90 border-2 border-emerald-200 p-4 text-center space-y-2 shadow-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-2xs">
                Giỏ B (3 Quả Táo Xanh)
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                {[1, 2, 3].map((n) => (
                  <FlatClayGreenApple key={n} size={42} number={n} />
                ))}
              </div>
              <p className="text-xs font-bold text-emerald-800">Số lượng thêm vào: 3 quả</p>
            </div>

            {/* Mũi Tên Gộp */}
            <div className="md:col-span-2 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300 mb-1">
                Gộp lại
              </span>
              <ArrowRight className="size-6 text-amber-600 stroke-[3] hidden md:block" />
              <span className="text-lg md:hidden">⬇️</span>
            </div>
          </div>

          {/* Hộp Kết Quả: 7 Táo */}
          <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-sun-50 to-orange-50 border-3 border-amber-300 p-4 sm:p-5 shadow-clay text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="size-5 text-amber-500" />
              <span className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                Tổng Số Táo Cả 2 Giỏ Sau Khi Gộp:
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-1">
              {[1, 2, 3, 4].map((n) => (
                <FlatClayRedApple key={`res-red-${n}`} size={44} number={n} />
              ))}
              {[5, 6, 7].map((n) => (
                <FlatClayGreenApple key={`res-green-${n}`} size={44} number={n} />
              ))}
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-white border-2 border-amber-300 shadow-clay-sm text-base sm:text-lg font-black text-amber-900">
              <span>🍎 4 + 🍏 3 =</span>
              <span className="text-2xl font-black text-rose-600">7</span>
              <span>quả táo</span>
            </div>
          </div>

          {/* Khung Bí Kíp Đếm Tiếp */}
          <div className="rounded-3xl bg-teal-50/80 border-2 border-teal-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-teal-900 font-black text-xs sm:text-sm">
              <Zap className="size-4.5 text-teal-600 fill-teal-600" />
              <span>⚡ Bí Kíp Đếm Tiếp Siêu Tốc (Không Cần Đếm Lại Từ 1):</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center">
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-2xl border-2 border-rose-300 shadow-sm">
                <span className="text-xs font-bold text-slate-500">Giữ số lớn:</span>
                <span className="size-8 rounded-xl bg-rose-500 text-white font-black text-base flex items-center justify-center">
                  4
                </span>
              </div>

              <span className="text-teal-600 font-black text-lg">➔ Đếm thêm 3 nấc ➔</span>

              <div className="flex items-center gap-1.5">
                <span className="size-8 rounded-xl bg-emerald-500 text-white font-black text-base flex items-center justify-center shadow-sm">
                  5
                </span>
                <span className="text-xs font-black text-teal-700">➔</span>
                <span className="size-8 rounded-xl bg-emerald-500 text-white font-black text-base flex items-center justify-center shadow-sm">
                  6
                </span>
                <span className="text-xs font-black text-teal-700">➔</span>
                <span className="size-9 rounded-xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-clay border-2 border-white animate-pulse">
                  7
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-teal-900 text-center">
              🎯 <strong>Mẹo Mee:</strong> Giữ số <strong>4</strong> trong đầu, xòe 3 ngón tay đếm: <strong>5 ➔ 6 ➔ 7</strong>! Kết quả là <strong>7</strong>!
            </p>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────
    // TRẠM 2: NỔ BÓNG TRỪ (`balloon_pop`)
    // ────────────────────────────────────────────────────────────────────────
    case 'balloon_pop':
      return (
        <div className="space-y-6">
          {/* Tranh 3 Bước Truyện Tranh Soft Clay */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Khung 1: Ban đầu 10 bóng bay */}
            <div className="rounded-3xl bg-sky-50/90 border-2 border-sky-200 p-4 space-y-3 shadow-sm text-center flex flex-col justify-between">
              <span className="inline-block px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-black shadow-2xs">
                Khung 1: Ban Đầu (10 Bóng)
              </span>

              <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
                {['rose', 'amber', 'emerald', 'sky', 'purple', 'pink', 'indigo', 'teal', 'orange', 'lime'].map(
                  (col, idx) => (
                    <FlatClayBalloon key={idx} color={col} size={32} number={idx + 1} />
                  ),
                )}
              </div>

              <p className="text-xs font-bold text-sky-900 bg-white/80 rounded-2xl p-2 border border-sky-100">
                Có tổng cộng <strong>10</strong> quả bóng bay sặc sỡ
              </p>
            </div>

            {/* Khung 2: Thao tác nổ 3 bóng */}
            <div className="rounded-3xl bg-rose-50/90 border-2 border-rose-200 p-4 space-y-3 shadow-sm text-center flex flex-col justify-between">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow-2xs">
                Khung 2: Nổ 3 Bóng 💥
              </span>

              <div className="flex items-center justify-center gap-2 py-2">
                <div className="flex flex-col items-center">
                  <FlatClayPopBurst size={42} />
                  <span className="text-[10px] font-black text-rose-600">Bụp 1</span>
                </div>
                <div className="flex flex-col items-center">
                  <FlatClayPopBurst size={42} />
                  <span className="text-[10px] font-black text-rose-600">Bụp 2</span>
                </div>
                <div className="flex flex-col items-center">
                  <FlatClayPopBurst size={42} />
                  <span className="text-[10px] font-black text-rose-600">Bụp 3</span>
                </div>
              </div>

              <p className="text-xs font-bold text-rose-900 bg-white/80 rounded-2xl p-2 border border-rose-100">
                Làm nổ mất <strong>3</strong> quả: <span className="font-black text-rose-600">10 - 3 = ?</span>
              </p>
            </div>

            {/* Khung 3: Bí quyết tính ngược */}
            <div className="rounded-3xl bg-purple-50/90 border-2 border-purple-200 p-4 space-y-3 shadow-sm text-center flex flex-col justify-between">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-black shadow-2xs">
                Khung 3: Tính Ngược 💡
              </span>

              <div className="bg-white/95 rounded-2xl p-3 border-2 border-purple-200 shadow-clay-sm space-y-1">
                <span className="text-xs font-extrabold text-purple-700 block">Hỏi ngược lại:</span>
                <p className="text-sm font-black text-slate-900">
                  3 + <span className="text-emerald-600 text-lg">7</span> = 10
                </p>
                <div className="text-xs font-black text-purple-900 pt-1 border-t border-purple-100">
                  ⟹ 10 - 3 = <span className="text-rose-600 text-lg">7</span>!
                </div>
              </div>

              <p className="text-xs font-bold text-purple-900 bg-white/80 rounded-2xl p-2 border border-purple-100">
                Còn lại đúng <strong>7</strong> quả bóng bay nguyên vẹn!
              </p>
            </div>
          </div>

          {/* Dải tổng kết bóng bay còn lại */}
          <div className="rounded-3xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 p-4 text-center space-y-2">
            <span className="text-xs font-black text-indigo-900">7 Quả Bóng Bay Còn Lại Sau Phép Trừ:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['rose', 'amber', 'emerald', 'sky', 'purple', 'pink', 'indigo'].map((col, idx) => (
                <FlatClayBalloon key={idx} color={col} size={36} number={idx + 1} />
              ))}
            </div>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────
    // TRẠM 3: PHÉP NHÂN KHAY BÁNH (`cake_tray`)
    // ────────────────────────────────────────────────────────────────────────
    case 'cake_tray':
      return (
        <div className="space-y-6">
          {/* Tranh 3 hàng bánh cupcake x 4 cột */}
          <div className="rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50/70 border-3 border-amber-200 p-5 sm:p-6 shadow-clay space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-amber-500 text-white text-xs font-black shadow-2xs">
                Khay Bánh Cupcake Soft Clay (3 Hàng × 4 Cột)
              </span>
              <span className="text-xs font-black text-amber-900">3 dải hộp bằng nhau</span>
            </div>

            {/* 3 Dải Hàng Bánh */}
            <div className="space-y-3">
              {[
                { row: 1, flavor: 'strawberry' as const, label: 'Hàng 1: 4 Bánh Dâu 🍓 (+4)' },
                { row: 2, flavor: 'vanilla' as const, label: 'Hàng 2: 4 Bánh Vani 🍦 (+4)' },
                { row: 3, flavor: 'matcha' as const, label: 'Hàng 3: 4 Bánh Matcha 🍵 (+4)' },
              ].map((r) => (
                <div
                  key={r.row}
                  className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/95 rounded-2xl p-3 border-2 border-amber-200/80 shadow-clay-sm"
                >
                  <span className="text-xs font-black text-slate-700">{r.label}</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((c) => (
                      <FlatClayCupcake key={c} flavor={r.flavor} size={38} />
                    ))}
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-xs">
                    4 Bánh
                  </span>
                </div>
              ))}
            </div>

            {/* Phép Cộng Lặp & Phép Nhân */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl bg-white p-3 border-2 border-amber-200 text-center space-y-1">
                <span className="text-xs font-extrabold text-slate-500">Cộng lặp từng hàng:</span>
                <p className="text-base font-black text-amber-900">4 + 4 + 4 = 12 bánh</p>
              </div>

              <div className="rounded-2xl bg-amber-500 p-3 text-white text-center space-y-1 shadow-clay-sm">
                <span className="text-xs font-bold text-amber-100">Bí kíp Phép Nhân:</span>
                <p className="text-base font-black text-white">3 hàng × 4 bánh = 12 bánh</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-sun-50 border-2 border-sun-200 p-4 text-center text-xs sm:text-sm font-bold text-sun-950">
            💡 <strong>Mẹo Mee:</strong> Phép nhân chính là phép cộng lặp lại của các nhóm bằng nhau! 3 nhóm có 4 bánh = <span className="font-black text-amber-700">3 × 4 = 12</span>!
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────
    // TRẠM 4: PHÉP CHIA ĐĨA KẸO (`candy_division`)
    // ────────────────────────────────────────────────────────────────────────
    case 'candy_division':
      return (
        <div className="space-y-6">
          {/* Tranh 12 kẹo mút chia đều vào 3 đĩa sứ Soft Clay */}
          <div className="rounded-3xl bg-gradient-to-b from-teal-50/80 to-emerald-50/70 border-3 border-teal-200 p-5 sm:p-6 shadow-clay space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-teal-600 text-white text-xs font-black shadow-2xs">
                Túi 12 Kẹo Mút Cầu Vồng 🍬 Chia Đều Vào 3 Đĩa
              </span>
              <span className="text-xs font-black text-teal-900">12 ÷ 3 = ?</span>
            </div>

            {/* 3 Đĩa Kẹo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((plateNum) => (
                <div
                  key={plateNum}
                  className="rounded-3xl bg-white/95 border-3 border-teal-200 p-4 text-center space-y-3 shadow-clay flex flex-col items-center justify-between"
                >
                  <span className="px-3 py-0.5 rounded-full bg-teal-100 text-teal-900 font-black text-xs border border-teal-200">
                    Đĩa Sứ #{plateNum}
                  </span>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 py-1">
                    {[1, 2, 3, 4].map((k) => (
                      <FlatClayCandy key={k} size={36} />
                    ))}
                  </div>

                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    4 Kẹo Mút
                  </span>
                </div>
              ))}
            </div>

            {/* Công thức phân giải */}
            <div className="rounded-2xl bg-white p-4 border-2 border-teal-200 text-center space-y-2">
              <p className="text-base sm:text-lg font-black text-slate-900">
                12 Kẹo ÷ 3 Đĩa = <span className="text-2xl text-teal-600 font-black">4</span> Kẹo Mỗi Đĩa
              </p>
              <p className="text-xs font-bold text-slate-600">
                Nhẩm nhanh bằng bảng cửu chương: 3 × <strong>4</strong> = 12 ⟹ 12 ÷ 3 = <strong>4</strong>!
              </p>
            </div>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────
    // TRẠM 5: CẦU VỒNG MAKE 10 (`make10`)
    // ────────────────────────────────────────────────────────────────────────
    case 'make10':
      return (
        <div className="space-y-6">
          {/* Cầu Vồng Kết Nối 5 Cặp Số Bạn Thân */}
          <div className="rounded-3xl bg-gradient-to-b from-sky-50 via-purple-50/50 to-pink-50/60 border-3 border-purple-200 p-5 sm:p-6 shadow-clay space-y-4 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 text-white text-xs sm:text-sm font-black shadow-clay-sm">
              🌈 Cầu Vồng 5 Cặp Bạn Thân Make 10
            </span>

            {/* 5 Cặp Số Tròn 10 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              {[
                { pair: '1 & 9', color: 'bg-rose-500', border: 'border-rose-300', bgCard: 'bg-rose-50' },
                { pair: '2 & 8', color: 'bg-amber-500', border: 'border-amber-300', bgCard: 'bg-amber-50' },
                { pair: '3 & 7', color: 'bg-yellow-500', border: 'border-yellow-300', bgCard: 'bg-yellow-50' },
                { pair: '4 & 6', color: 'bg-emerald-500', border: 'border-emerald-300', bgCard: 'bg-emerald-50' },
                { pair: '5 & 5', color: 'bg-purple-500', border: 'border-purple-300', bgCard: 'bg-purple-50' },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'rounded-2xl p-3 border-2 text-center space-y-1 shadow-sm transition-transform hover:scale-105',
                    p.bgCard,
                    p.border,
                  )}
                >
                  <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-white text-[11px] font-black', p.color)}>
                    {p.pair}
                  </span>
                  <p className="text-xs font-black text-slate-800">Tổng = 10</p>
                </div>
              ))}
            </div>

            {/* Bài Toán Olympic Tính Nhanh */}
            <div className="rounded-3xl bg-white p-4 border-2 border-purple-200 shadow-clay-sm space-y-2 text-center">
              <span className="text-xs font-black text-purple-900 block">
                ⚡ Ứng Dụng Olympic: Tính Nhanh 1 + 3 + 5 + 7 + 9
              </span>

              <div className="inline-flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base font-black text-slate-900 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-200">
                <span className="text-rose-600">(1 + 9)</span>
                <span>+</span>
                <span className="text-yellow-600">(3 + 7)</span>
                <span>+</span>
                <span className="text-purple-600">5</span>
                <span>= 10 + 10 + 5 =</span>
                <span className="text-2xl text-amber-600 font-black">25</span>
              </div>
            </div>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────
    // TRẠM 6: PHÂN SỐ PIZZA (`pizza_fraction`)
    // ────────────────────────────────────────────────────────────────────────
    case 'pizza_fraction':
    case 'compare_fractions':
    case 'fraction_add_sub':
    case 'fraction_of_number':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Tranh bánh pizza 8 lát, nhấc ra 3 lát */}
            <div className="rounded-3xl bg-gradient-to-b from-amber-50 to-orange-50 border-3 border-amber-200 p-5 text-center space-y-3 shadow-clay">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black shadow-2xs">
                Chiếc Bánh Pizza 8 Lát Bằng Nhau
              </span>

              <div className="flex flex-wrap items-center justify-center gap-2 py-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex flex-col items-center animate-bounce">
                    <FlatClayPizzaSlice size={46} />
                    <span className="text-[10px] font-black text-amber-700 mt-1">Lát #{n}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/90 rounded-2xl p-2.5 border border-amber-200 text-xs font-bold text-amber-900">
                🍕 Đã lấy ra <strong>3 lát</strong> từ cả chiếc bánh <strong>8 lát</strong>
              </div>
            </div>

            {/* Sơ đồ Tử số / Mẫu số */}
            <div className="rounded-3xl bg-white border-3 border-brand-200 p-5 text-center space-y-3 shadow-clay">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-black shadow-2xs">
                Sơ Đồ Cấu Tạo Phân Số
              </span>

              <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl px-5 py-2 text-center shadow-sm w-full max-w-[240px]">
                  <span className="text-[11px] font-bold text-amber-800 block">TỬ SỐ (Ở Trên):</span>
                  <span className="text-xl font-black text-amber-950">3 (Lát đã lấy)</span>
                </div>

                <div className="w-full max-w-[240px] h-1.5 bg-slate-900 rounded-full" />

                <div className="bg-sky-100 border-2 border-sky-300 rounded-2xl px-5 py-2 text-center shadow-sm w-full max-w-[240px]">
                  <span className="text-[11px] font-bold text-sky-800 block">MẪU SỐ (Ở Dưới):</span>
                  <span className="text-xl font-black text-sky-950">8 (Tổng số lát)</span>
                </div>
              </div>

              <div className="text-sm font-black text-brand-900 bg-brand-50 rounded-2xl p-2.5 border border-brand-200">
                Phân số chỉ số bánh đã lấy: <span className="text-xl text-rose-600 font-black">3/8</span> chiếc bánh
              </div>
            </div>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────
    // TRẠM 7: CÂN THĂNG BẰNG (`balance_scale`)
    // ────────────────────────────────────────────────────────────────────────
    case 'balance_scale':
      return (
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-b from-sky-50 to-indigo-50/60 border-3 border-sky-200 p-5 sm:p-6 shadow-clay space-y-5">
            <span className="inline-block px-4 py-1 rounded-full bg-sky-500 text-white text-xs font-black shadow-2xs">
              ⚖️ Cân Thăng Bằng & Phép Thế Olympic
            </span>

            {/* Cân 1: 1 Dưa = 3 Táo */}
            <div className="rounded-3xl bg-white p-4 border-2 border-sky-200 shadow-clay-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 font-black text-xs">
                  Cân 1 (Đã Cho):
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-2xl border border-emerald-200">
                  <FlatClayWatermelon size={42} />
                  <span className="text-xs font-black text-emerald-900">1 Dưa Hấu</span>
                </div>

                <span className="text-xl font-black text-slate-800">=</span>

                <div className="flex items-center gap-1 bg-rose-50 px-3 py-2 rounded-2xl border border-rose-200">
                  <FlatClayRedApple size={34} />
                  <FlatClayRedApple size={34} />
                  <FlatClayRedApple size={34} />
                  <span className="text-xs font-black text-rose-900 ml-1">3 Quả Táo</span>
                </div>
              </div>
            </div>

            {/* Cân 2: 2 Dưa = 6 Táo */}
            <div className="rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-3 border-amber-300 shadow-clay flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs shadow-2xs">
                  Cân 2 (Suy Ra):
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5 bg-emerald-100 px-3 py-2 rounded-2xl border-2 border-emerald-300">
                  <FlatClayWatermelon size={42} />
                  <FlatClayWatermelon size={42} />
                  <span className="text-xs font-black text-emerald-950">2 Dưa Hấu</span>
                </div>

                <span className="text-xl font-black text-slate-800">=</span>

                <div className="flex flex-wrap items-center justify-center gap-1 bg-rose-100 px-3 py-2 rounded-2xl border-2 border-rose-300">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <FlatClayRedApple key={n} size={32} />
                  ))}
                  <span className="text-sm font-black text-rose-950 ml-1.5">6 Quả Táo!</span>
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-sm font-bold text-slate-700 text-center">
              💡 <strong>Bí kíp Phép Thế:</strong> Vế trái nhân đôi (1 dưa × 2 = 2 dưa) thì vế phải cũng nhân đôi (3 táo × 2 = <strong>6 táo</strong>)!
            </div>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────
    // TRẠM 8: KHỐI LẬP PHƯƠNG 3D (`cube_3d`)
    // ────────────────────────────────────────────────────────────────────────
    case 'cube_3d':
    case 'cube_net':
      return (
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-b from-indigo-50/80 via-purple-50 to-pink-50/60 border-3 border-indigo-200 p-5 sm:p-6 shadow-clay space-y-4 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-black shadow-2xs">
              🧊 Bí Kíp Tách 3 Tầng Đếm Khối Lập Phương 3D
            </span>

            {/* 3 Tầng Khối Lập Phương */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tầng 3: Đỉnh */}
              <div className="rounded-3xl bg-white/95 border-2 border-amber-200 p-4 space-y-2 shadow-sm flex flex-col items-center justify-between">
                <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs">
                  Tầng 3 (Tầng Đỉnh)
                </span>
                <div className="py-2">
                  <FlatClayCube color="amber" size={42} />
                </div>
                <span className="text-xs font-black text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  1 Khối
                </span>
              </div>

              {/* Tầng 2: Giữa */}
              <div className="rounded-3xl bg-white/95 border-2 border-purple-200 p-4 space-y-2 shadow-sm flex flex-col items-center justify-between">
                <span className="px-3 py-0.5 rounded-full bg-purple-100 text-purple-900 font-black text-xs">
                  Tầng 2 (Tầng Giữa)
                </span>
                <div className="flex items-center gap-1.5 py-2">
                  <FlatClayCube color="purple" size={42} />
                  <FlatClayCube color="purple" size={42} />
                </div>
                <span className="text-xs font-black text-purple-900 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                  2 Khối
                </span>
              </div>

              {/* Tầng 1: Đáy */}
              <div className="rounded-3xl bg-white/95 border-2 border-indigo-200 p-4 space-y-2 shadow-sm flex flex-col items-center justify-between">
                <span className="px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-black text-xs">
                  Tầng 1 (Tầng Đáy)
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1 py-2">
                  <FlatClayCube color="indigo" size={38} />
                  <FlatClayCube color="indigo" size={38} />
                  <FlatClayCube color="indigo" size={38} />
                  <FlatClayCube color="indigo" size={38} />
                </div>
                <span className="text-xs font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                  4 Khối
                </span>
              </div>
            </div>

            {/* Phép Tính Tổng 3 Tầng */}
            <div className="rounded-2xl bg-white p-4 border-2 border-indigo-200 text-center space-y-2">
              <p className="text-base sm:text-lg font-black text-slate-900">
                Tổng cộng: <span className="text-indigo-600 font-black">4 (Tầng 1)</span> +{' '}
                <span className="text-purple-600 font-black">2 (Tầng 2)</span> +{' '}
                <span className="text-amber-600 font-black">1 (Tầng 3)</span> ={' '}
                <span className="text-2xl text-rose-600 font-black">7</span> khối lập phương
              </p>
              <p className="text-xs font-bold text-slate-600">
                🎯 Khối ở trên luôn cần khối ở dưới đỡ! Đếm từ đáy lên trên sẽ không bao giờ bỏ sót khối bị che khuất!
              </p>
            </div>
          </div>
        </div>
      )

    // ────────────────────────────────────────────────────────────────────────
    // CÁC VISUAL TYPES KHÁC TRONG LMS (ĐỒNG HỒ, PHÉP CỘNG CỘT, BẢNG CỬU CHƯƠNG,...)
    // ────────────────────────────────────────────────────────────────────────
    case 'column_add':
    case 'column_sub':
      return (
        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border-3 border-amber-200 p-5 text-center space-y-4 shadow-clay">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-500 text-white text-xs font-black shadow-2xs">
              📊 Bí Kíp Đặt Cột: Cột Đơn Vị Trước ➔ Cột Chục Sau
            </span>

            <div className="flex flex-wrap items-center justify-center gap-4 py-2">
              <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm space-y-1 text-center min-w-[140px]">
                <span className="text-xs font-black text-orange-600 block">1. Cột Đơn Vị</span>
                <p className="text-sm font-bold text-slate-700">Cộng/Trừ hàng đơn vị trước</p>
                <span className="inline-block text-[11px] font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                  Nhớ / Mượn 1 chục
                </span>
              </div>

              <span className="text-2xl font-black text-amber-600">➔</span>

              <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm space-y-1 text-center min-w-[140px]">
                <span className="text-xs font-black text-indigo-600 block">2. Cột Hàng Chục</span>
                <p className="text-sm font-bold text-slate-700">Cộng/Trừ hàng chục</p>
                <span className="inline-block text-[11px] font-black text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Thêm số nhớ vào
                </span>
              </div>
            </div>
          </div>
        </div>
      )

    case 'analog_clock':
    case 'elapsed_time':
      return (
        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-to-r from-sky-50 to-teal-50 border-3 border-sky-200 p-5 text-center space-y-4 shadow-clay">
            <span className="inline-block px-4 py-1 rounded-full bg-sky-600 text-white text-xs font-black shadow-2xs">
              ⏰ Bí Kíp Đọc Đồng Hồ Kim & Khoảng Thời Gian
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
              <div className="bg-white rounded-2xl p-4 border-2 border-sky-200 shadow-sm space-y-1.5">
                <span className="text-xs font-black text-rose-600 block">🔴 Kim Ngắn (Chỉ Giờ)</span>
                <p className="text-xs font-bold text-slate-700">
                  Kim ngắn chỉ đến số nào thì đọc giờ theo số đó (ví dụ số 8 đọc là 8 giờ).
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border-2 border-sky-200 shadow-sm space-y-1.5">
                <span className="text-xs font-black text-sky-600 block">🔵 Kim Dài (Chỉ Phút)</span>
                <p className="text-xs font-bold text-slate-700">
                  Lấy số kim dài chỉ nhân với 5 (ví dụ chỉ số 3: 3 × 5 = 15 phút).
                </p>
              </div>
            </div>
          </div>
        </div>
      )

    case 'times_table_25':
    case 'times_table_69':
    case 'div_remainder':
    case 'perimeter_area':
    case 'grid_maze':
    case 'matchstick':
    case 'olympic_arena':
    default:
      return (
        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-sun-50 to-orange-50 border-3 border-amber-200 p-5 text-center space-y-4 shadow-clay">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-500 text-white text-xs font-black shadow-2xs">
              🌟 Bí Kíp Olympic Trọng Tâm
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-200 shadow-sm space-y-1">
                <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> 1. Quan Sát Kỹ
                </span>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Nhận diện quy luật và cấu trúc bài toán trước khi bắt tay vào tính.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-200 shadow-sm space-y-1">
                <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                  <Zap className="size-3.5" /> 2. Áp Dụng Mẹo Mee
                </span>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Dùng câu thần chú tính nhanh để biến phép tính phức tạp thành đơn giản.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-200 shadow-sm space-y-1">
                <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                  <Trophy className="size-3.5" /> 3. Kiểm Tra Lại
                </span>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Thử tính ngược hoặc đối chiếu đáp án để đạt trọn vẹn 3 Sao Olympic!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
  }
}
