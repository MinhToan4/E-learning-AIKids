import React from 'react'
import { Sparkles } from 'lucide-react'

export interface ConceptWelcomeScreenProps {
  onStart?: () => void
  onBack?: () => void
}

export const ConceptWelcomeScreen: React.FC<ConceptWelcomeScreenProps> = ({
  onStart,
  onBack,
}) => {
  return (
    <div
      className="relative w-full min-h-[480px] sm:min-h-[560px] flex items-center justify-center overflow-hidden rounded-[36px] bg-cover bg-center p-3 sm:p-6 pb-20 sm:pb-24 select-none"
      style={{
        backgroundImage: 'url(/assets/optimized/lobby-bg-login.webp)',
      }}
    >
      {/* Lớp phủ sương mờ dịu mắt chuẩn Montessori */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none" />

      {/* Card Trung Tâm Squircle Trắng Sữa Vừa Khít 1 Màn Hình, Stroke-less mộc mạc */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-[2.25rem] bg-white/92 p-4 sm:p-6 shadow-sm backdrop-blur-md flex flex-col items-center text-center space-y-2.5 sm:space-y-3.5 animate-in fade-in zoom-in-95 duration-300 min-w-0">
        {/* 1. Top Badge Nhẹ Nhàng */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] sm:text-xs font-black tracking-wide shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#FD7D2E]" />
          <span>WELCOME TO SMART LEARNING AIKID</span>
        </div>

        {/* 2. Hero Mascot Mèo Mee Soft Clay Hoàn Toàn Nguyên Vẹn (To rõ, Tươi vui) */}
        <div className="relative flex items-center justify-center py-0.5">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
            {/* Vầng sáng mềm mại phía sau chú mèo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-300/40 via-amber-200/30 to-purple-200/40 blur-md animate-pulse" />

            {/* Ảnh Mèo Mee Soft Clay nguyên bản to rõ */}
            <img
              src="/assets/aikid-ui/mascot-original/course-wave.webp"
              alt="Mèo Mee chào con"
              className="relative z-10 w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(234,88,12,0.18)] hover:scale-105 transition-transform duration-300 animate-bounce-subtle"
            />

            {/* Badge chào mừng nhỏ nhắn bên cạnh */}
            <span className="absolute -top-1 -right-1 z-20 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-xs flex items-center gap-1">
              <span>⭐</span>
              <span>Mee Chào Con!</span>
            </span>
          </div>
        </div>

        {/* 3. Tiêu Đề & Lời Nhắn Súc Tích (Vừa Đủ Thông Tin) */}
        <div className="space-y-1 max-w-xs sm:max-w-sm">
          <h1 className="text-lg sm:text-2xl font-black text-zinc-900 tracking-tight leading-snug">
            Xưởng Sáng Tạo AI Cùng Mèo Mee
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-zinc-600 leading-relaxed line-clamp-2">
            Cùng Mèo Mee bước vào hành trình 6 Đảo diệu kỳ, tự tay vẽ tranh và làm chủ công nghệ AI an toàn.
          </p>

          {/* Montessori Tag */}
          <div className="pt-0.5 flex justify-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-bold shadow-2xs">
              <span>🌿</span>
              <span>Dành cho bé 6 - 15 tuổi • Học qua trải nghiệm trực quan</span>
            </span>
          </div>
        </div>

        {/* 4. Cụm Nút Điều Khiển To Rõ, Nút Pill Đen Thanh Lịch Ban Đầu */}
        <div className="w-full flex flex-col items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onStart?.()}
            className="w-full max-w-[260px] sm:max-w-xs min-h-[46px] sm:min-h-12 px-6 py-2.5 rounded-full bg-[#18181b] hover:bg-black text-white text-sm sm:text-base font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Bắt đầu khám phá ngay</span>
            <span className="text-base sm:text-lg">🚀</span>
          </button>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-0.5 rounded-full text-zinc-500 hover:text-zinc-800 text-[11px] font-bold hover:bg-zinc-100/60 transition-colors cursor-pointer"
            >
              Quay lại trang chủ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConceptWelcomeScreen
