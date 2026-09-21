import React, { useState } from 'react'
import { Trophy, Award, Sparkles, X, Star, Zap, CheckCircle2, BookmarkCheck } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { playInstantSound } from './LessonInteractiveSidebar'

export interface CourseCertificateModalProps {
  isOpen: boolean
  onClose: () => void
  studentName?: string
  courseTitle?: string
  islandTitle?: string
  issuedDate?: string
  stars?: number
  xp?: number
}

export function CourseCertificateModal({
  isOpen,
  onClose,
  studentName = 'Nhà Sáng Tạo Nhí AIKI',
  courseTitle = 'Hành Trình Chinh Phục Đảo Trí Tuệ',
  islandTitle,
  issuedDate,
  stars = 18,
  xp = 1500,
}: CourseCertificateModalProps) {
  const [isSaved, setIsSaved] = useState(false)

  if (!isOpen) return null

  const displayTitle = islandTitle || courseTitle
  const formattedDate =
    issuedDate ||
    new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date())

  const handleSaveToBackpack = () => {
    setIsSaved(true)
    try {
      playInstantSound('star')
    } catch {
      // ignore
    }
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 p-4 sm:p-7 border-4 border-amber-200/90 shadow-clay overflow-hidden animate-scale-up">
        {/* Decorative background rays & sparkles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 size-48 rounded-full bg-brand-200/25 blur-2xl pointer-events-none" />

        {/* Close icon button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng chứng chỉ"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 size-9 rounded-full bg-white/90 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Inner Certificate Frame */}
        <div className="relative rounded-2xl border-2 border-dashed border-amber-400/70 p-4 sm:p-6 bg-white/95 shadow-inner text-center flex flex-col items-center">
          {/* Header Branding */}
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/90 text-amber-900 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider mb-2 border border-amber-200 shadow-2xs">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            <span>AI Kids Creator Academy</span>
          </div>

          <h2
            id="certificate-modal-title"
            className="text-xl sm:text-2xl font-black text-slate-800 font-display uppercase tracking-wide"
          >
            Chứng Nhận Tốt Nghiệp
          </h2>

          <div className="flex items-center gap-2 my-2">
            <div className="h-0.5 w-12 bg-amber-300 rounded-full" />
            <Award size={20} className="text-amber-500" />
            <div className="h-0.5 w-12 bg-amber-300 rounded-full" />
          </div>

          {/* Golden Trophy Medallion */}
          <div className="relative my-2 sm:my-3 flex items-center justify-center">
            <div className="size-20 sm:size-24 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 p-1 shadow-clay flex items-center justify-center ring-4 ring-amber-100">
              <Trophy size={46} className="text-white drop-shadow-md" />
            </div>
            <div className="absolute -top-1 -right-1 size-6 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-500">
              <Sparkles size={14} />
            </div>
          </div>

          {/* Student & Course Copy */}
          <p className="text-xs sm:text-sm font-bold text-slate-500">Vinh danh Nhà Sáng Tạo Nhí:</p>
          <p className="text-xl sm:text-2xl font-black text-amber-950 font-display my-1 px-4 py-0.5 rounded-xl bg-amber-50/80 border border-amber-200/50">
            {studentName}
          </p>

          <p className="text-xs sm:text-sm font-bold text-slate-600 mt-2">
            Đã xuất sắc hoàn thành trạm cuối và làm chủ toàn bộ kiến thức tại:
          </p>
          <p className="text-base sm:text-lg font-black text-brand-700 font-display mt-0.5 max-w-md">
            {displayTitle}
          </p>

          {/* Stats Badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 my-3.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs sm:text-sm font-extrabold border border-amber-300/80 shadow-2xs">
              <Star size={14} className="fill-amber-400 text-amber-500" />
              <span>{stars} Sao Tinh Hoa</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/90 text-violet-900 text-xs sm:text-sm font-extrabold border border-violet-300/80 shadow-2xs">
              <Zap size={14} className="fill-violet-400 text-violet-500" />
              <span>+{xp} Điểm EXP</span>
            </div>
          </div>

          {/* Footer & Academy Seal */}
          <div className="w-full flex items-center justify-between border-t border-amber-200/70 pt-3 mt-1 text-[11px] sm:text-xs text-slate-500 font-bold px-2">
            <div>
              <span>Ngày cấp: </span>
              <span className="text-slate-700 font-black">{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-700 font-black">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Chứng nhận chính thức</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button
            variant="primary"
            onClick={handleSaveToBackpack}
            disabled={isSaved}
            className="w-full sm:w-auto px-6 py-2.5 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-clay"
          >
            {isSaved ? (
              <>
                <BookmarkCheck size={18} />
                <span>Đã Cất Vào Balo! 🎉</span>
              </>
            ) : (
              <>
                <span>🎒</span>
                <span>Cất Vào Balo</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 font-bold text-sm text-slate-600 hover:text-slate-800"
          >
            ✕ Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
