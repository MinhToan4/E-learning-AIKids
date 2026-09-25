import React, { useState } from 'react'
import {
  Play,
  CheckCircle2,
  Crown,
  Sparkles,
  ShieldCheck,
  Film,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from 'lucide-react'

export interface ParentTrailerModalProps {
  isOpen: boolean
  onClose: () => void
  onUnlock: () => void
}

export const ParentTrailerModal: React.FC<ParentTrailerModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
}) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false)
  const [accordion1Open, setAccordion1Open] = useState<boolean>(true)
  const [accordion2Open, setAccordion2Open] = useState<boolean>(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[32px] bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4 text-zinc-900">
        {/* Header Modal */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#FD7D2E]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-zinc-900 leading-snug">
                Gói Bản Quyền Chương Trình Chính Thức AIKid
              </h3>
              <p className="text-[11px] font-medium text-zinc-500">
                Mở khóa trọn bộ 6 Đảo Khám Phá &amp; Sáng Tạo AI • Đồng hành cùng bé 2026
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

        {/* 1. Khung Xem Video Trailer 16:9 với nút Play to */}
        <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-zinc-950 shadow-inner group">
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
              {/* Big Play Button */}
              <button
                type="button"
                onClick={() => setIsPlayingVideo(true)}
                aria-label="Phát video trailer"
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/95 text-[#FD7D2E] shadow-2xl flex items-center justify-center transform group-hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </button>

              <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 text-white text-[10px] font-black backdrop-blur-xs flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-300" />
                <span>Trailer 2:15 phút • Trải nghiệm học thực tế</span>
              </span>

              <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#FD7D2E] text-white text-[10px] font-black shadow-xs">
                Xem Trailer
              </span>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
              <Play className="w-10 h-10 text-amber-400 mb-2 animate-bounce-subtle" />
              <p className="text-xs sm:text-sm font-bold">
                Video Trailer đang chiếu ở chế độ mô phỏng
              </p>
              <button
                type="button"
                onClick={() => setIsPlayingVideo(false)}
                className="mt-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold transition-all cursor-pointer"
              >
                Dừng xem lại poster
              </button>
            </div>
          )}
        </div>

        {/* 2. Accordion 1 (Collapsible): "Con nhận được gì?" */}
        <div className="rounded-2xl bg-purple-50/70 border border-purple-100 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setAccordion1Open(!accordion1Open)}
            className="w-full p-3.5 flex items-center justify-between text-left font-black text-xs sm:text-sm text-purple-950 cursor-pointer hover:bg-purple-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FD7D2E]" />
              <span>Con nhận được gì từ Chương Trình Chính Thức AIKid?</span>
            </div>
            {accordion1Open ? (
              <ChevronUp className="w-4 h-4 text-purple-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-700" />
            )}
          </button>

          {accordion1Open && (
            <div className="px-3.5 pb-3.5 pt-1 space-y-2 text-xs text-zinc-700 font-medium border-t border-purple-100/60 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Đảo 1 (10 Quy Tắc Vàng):</strong> 🎁 Học thử Miễn Phí trọn đời cho mọi bé.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Đảo 2 đến Đảo 6 (32 Trạm học):</strong> 🔒 Mở khóa toàn diện chương trình chuẩn Montessori.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Không giới hạn</strong> lượt vẽ tranh AI, sáng tạo nhân vật &amp; lưu vào Balo.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Báo cáo tiến độ &amp; phân tích năng khiếu Montessori gửi về cho phụ huynh hàng tuần.</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Accordion 2 (Collapsible): "Chi phí & Cam kết" */}
        <div className="rounded-2xl bg-amber-50/70 border border-amber-100 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setAccordion2Open(!accordion2Open)}
            className="w-full p-3.5 flex items-center justify-between text-left font-black text-xs sm:text-sm text-amber-950 cursor-pointer hover:bg-amber-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chi phí &amp; Cam kết bản quyền</span>
            </div>
            {accordion2Open ? (
              <ChevronUp className="w-4 h-4 text-amber-800" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-800" />
            )}
          </button>

          {accordion2Open && (
            <div className="px-3.5 pb-3.5 pt-1 space-y-2 text-xs text-zinc-700 font-medium border-t border-amber-100/60 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Thanh toán 1 lần duy nhất <strong>479.000đ</strong> (giảm 40% so với 799.000đ), sở hữu vĩnh viễn trọn đời.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Không phát sinh phí ẩn, không tự động gia hạn thẻ.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Cam kết hoàn tiền 100% trong 7 ngày nếu bé không hào hứng tham gia.</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Action Button: Nút Pill Cam Thương Hiệu Phẳng Chuẩn SDLC */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={onUnlock}
            className="w-full min-h-[48px] sm:min-h-[52px] px-6 py-3 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Mở Khóa Toàn Diện 479.000đ</span>
            <span className="text-base">🚀</span>
          </button>
          <p className="text-[10px] text-center font-medium text-zinc-400">
            🔒 Thanh toán bảo mật qua cổng VNPAY / Momo / Thẻ quốc tế
          </p>
        </div>
      </div>
    </div>
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
