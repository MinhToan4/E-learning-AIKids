import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Play,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Film,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from 'lucide-react'
import { useOfficialBillingPlan, formatPlanPrice } from '@/shared/lib/official-plan'
import type { PlanDef } from '@/features/admin/types'

export interface ParentTrailerModalProps {
  isOpen: boolean
  onClose: () => void
  onUnlock: () => void
  plan?: PlanDef | null
}

export const ParentTrailerModal: React.FC<ParentTrailerModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  plan: propPlan,
}) => {
  const { officialPlan: fallbackPlan } = useOfficialBillingPlan()
  const activePlan = propPlan || fallbackPlan
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false)
  const [accordion1Open, setAccordion1Open] = useState<boolean>(true)
  const [accordion2Open, setAccordion2Open] = useState<boolean>(false)

  if (!isOpen || typeof document === 'undefined') return null

  const priceFormatted = formatPlanPrice(activePlan?.amountMinor ?? 129000)
  const planName = activePlan?.name || 'Khóa học Khám phá & Sáng tạo AIKid'
  const planTagline = activePlan?.tagline || '10 Quy tắc vàng miễn phí · Thanh toán để mở khóa trọn bộ'
  const planFeatures = activePlan?.features && activePlan.features.length > 0
    ? activePlan.features
    : [
        'Đảo Tiên Quyết: 10 Quy tắc vàng được học miễn phí cho mọi bé.',
        '5 Đảo Sáng Tạo: Tạo tranh, biến hóa nhân vật, vẽ truyện tranh và lập trình trò chơi.',
        'Sáng tạo không giới hạn: Vẽ tranh thỏa thích & cất vào Ba Lô kỷ niệm.',
        'Báo cáo năng khiếu & Bằng khen tốt nghiệp gửi về cho Ba Mẹ hàng tuần.',
      ]

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[82vh] sm:max-h-[80vh] rounded-[28px] bg-white shadow-2xl flex flex-col overflow-hidden text-zinc-900 border border-amber-100">
        {/* Header Modal (Fixed top) */}
        <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 border-b border-zinc-100 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-[#FD7D2E]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-zinc-900 leading-snug truncate">
                {planName}
              </h3>
              <p className="text-[11px] font-medium text-zinc-500 truncate">
                {planTagline}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose()
              setIsPlayingVideo(false)
            }}
            aria-label="Đóng chi tiết"
            className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body (Adapts gracefully to any screen height) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3.5 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* 1. Video Trailer Khung Tỷ Lệ Gọn Gàng */}
          <div className="relative w-full aspect-video max-h-[170px] sm:max-h-[190px] rounded-2xl overflow-hidden bg-zinc-950 shadow-inner group shrink-0">
            <img
              src="/assets/aikid-ui/mascot-original/course-wave.webp"
              alt="Trailer Hoạt Hình Mèo Mee"
              className={`w-full h-full object-cover object-top scale-105 transition-all duration-500 ${
                isPlayingVideo ? 'opacity-30 blur-xs' : 'opacity-85'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {!isPlayingVideo ? (
              <>
                {/* Play Button */}
                <button
                  type="button"
                  onClick={() => setIsPlayingVideo(true)}
                  aria-label="Phát video trailer"
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/95 text-[#FD7D2E] shadow-2xl flex items-center justify-center transform group-hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>

                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-black backdrop-blur-xs flex items-center gap-1.5">
                  <Film className="w-3 h-3 text-amber-300" />
                  <span>Trailer 2:15 phút • Trải nghiệm học thực tế</span>
                </span>

                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#FD7D2E] text-white text-[10px] font-black shadow-xs">
                  Xem Trailer
                </span>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-3">
                <Play className="w-8 h-8 text-amber-400 mb-1.5 animate-bounce-subtle" />
                <p className="text-xs font-bold">
                  Video Trailer đang chiếu ở chế độ mô phỏng
                </p>
                <button
                  type="button"
                  onClick={() => setIsPlayingVideo(false)}
                  className="mt-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold transition-all cursor-pointer"
                >
                  Dừng xem lại poster
                </button>
              </div>
            )}
          </div>

          {/* 2. Accordion 1 (Collapsible): "Đặc quyền khóa học" */}
          <div className="rounded-2xl bg-orange-50/60 border border-orange-100 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setAccordion1Open(!accordion1Open)}
              className="w-full p-3 flex items-center justify-between text-left font-black text-xs sm:text-sm text-slate-800 cursor-pointer hover:bg-orange-100/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Quyền lợi từ gói {planName}</span>
              </div>
              {accordion1Open ? (
                <ChevronUp className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {accordion1Open && (
              <div className="px-3 pb-3 pt-1 space-y-2 text-xs text-slate-700 font-medium border-t border-orange-100/60 animate-in fade-in duration-200">
                {planFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Accordion 2 (Collapsible): "Chi phí & Cam kết" */}
          <div className="rounded-2xl bg-amber-50/70 border border-amber-100 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setAccordion2Open(!accordion2Open)}
              className="w-full p-3 flex items-center justify-between text-left font-black text-xs sm:text-sm text-amber-950 cursor-pointer hover:bg-amber-100/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Chi phí &amp; Cam kết bản quyền</span>
              </div>
              {accordion2Open ? (
                <ChevronUp className="w-4 h-4 text-amber-800" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-800" />
              )}
            </button>

            {accordion2Open && (
              <div className="px-3 pb-3 pt-1 space-y-2 text-xs text-zinc-700 font-medium border-t border-amber-100/60 animate-in fade-in duration-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Thanh toán 1 lần duy nhất <strong>{priceFormatted}</strong>, sở hữu vĩnh viễn trọn đời.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Không phát sinh phí ẩn, không tự động gia hạn thẻ.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cam kết hoàn tiền 100% trong 7 ngày nếu bé không hào hứng tham gia.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer (Fixed Sticky at Bottom - Luôn hiển thị trên mọi độ phân giải) */}
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-4 border-t border-zinc-100 bg-white/95 backdrop-blur-xs flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onUnlock}
            className="w-full min-h-[46px] sm:min-h-[50px] px-6 py-2.5 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-black shadow-clay active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Mở khóa {planName} · {priceFormatted}</span>
          </button>
          <p className="text-[10px] text-center font-medium text-zinc-400">
            Thanh toán bảo mật qua VNPAY / MoMo / Thẻ quốc tế
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export interface ParentPurchaseTrailerBannerProps {
  className?: string
  isPurchased?: boolean
  onUnlock?: () => void
}

export const ParentPurchaseTrailerBanner: React.FC<ParentPurchaseTrailerBannerProps> = ({
  className = '',
  isPurchased = false,
  onUnlock,
}) => {
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)

  const handlePurchaseFromModal = () => {
    setShowDetailModal(false)
    onUnlock?.()
  }

  return (
    <div className={`w-full flex flex-col gap-2.5 min-w-0 ${className}`}>
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-[11px] font-bold text-zinc-400">
          Dành Cho Phụ Huynh &amp; Bé
        </span>
      </div>

      {isPurchased ? (
        /* Trạng Thái Khi Đã Mua (VIP Status Bar Nhỏ Gọn) */
        <div className="min-h-[64px] sm:min-h-[72px] rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-emerald-500/15 p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3 border border-amber-300/40 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Crown className="w-5 h-5 fill-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-amber-950 truncate">
                  👑 Tài khoản đã mở khóa Full Access
                </span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  VIP
                </span>
              </div>
              <p className="text-[11px] font-medium text-zinc-600 truncate">
                Bé thỏa sức học trọn bộ 6 Đảo &amp; 32 Trạm, vẽ tranh AI không giới hạn!
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* Trạng Thái Chưa Mua: Layout Stroke-less */
        <div className="rounded-[2rem] bg-gradient-to-br from-[#fffbf0] via-[#fff7ed] to-[#faf5ff] p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-[#FD7D2E] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Crown className="w-4 h-4 fill-white" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                DÀNH CHO PHỤ HUYNH
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-2xs whitespace-nowrap shrink-0">
              Tiết kiệm 40%
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight leading-snug">
              Gói Thám Hiểm Toàn Diện 6 Đảo
            </h3>
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              🎁 <strong>Đảo 1:</strong> Học Thử Miễn Phí • 🔒 <strong>Đảo 2 - 6:</strong> Mở khóa trọn bộ 32 Trạm &amp; Xưởng vẽ tranh AI không giới hạn.
            </p>
          </div>

          <div className="pt-1.5 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-[#FD7D2E]">
                479.000đ
              </span>
              <span className="text-xs font-semibold text-zinc-400 line-through">
                799.000đ
              </span>
            </div>
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full shrink-0">
              • Sở hữu trọn đời
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowDetailModal(true)}
            className="w-full min-h-[44px] px-5 py-2.5 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Chi tiết &amp; Trailer</span>
            <ArrowUpRight className="w-4 h-4 text-white stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Modal Chi Tiết */}
      <ParentTrailerModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onUnlock={handlePurchaseFromModal}
      />
    </div>
  )
}

export default ParentPurchaseTrailerBanner
