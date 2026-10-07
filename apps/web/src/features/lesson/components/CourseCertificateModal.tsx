import React, { useEffect, useState } from 'react'
import { Award, X, Star, Zap, CheckCircle2, BookmarkCheck, Download, Printer } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { playInstantSound } from './LessonInteractiveSidebar'
import {
  saveCertificateToBackpack,
  isCertificateClaimed,
  OFFICIAL_COURSE_CERTIFICATE_ID,
  type BackpackCertificate,
} from '@/features/backpack/lib/backpack-certificates'

export interface CourseCertificateModalProps {
  isOpen: boolean
  onClose: () => void
  courseId?: string
  studentName?: string
  courseTitle?: string
  islandTitle?: string
  issuedDate?: string
  stars?: number
  xp?: number
  studentId?: string
  onSaveToBackpack?: (cert: BackpackCertificate) => void
}

/**
 * Hàm sinh chuỗi SVG vector độc lập cho Bằng Khen chứa đầy đủ họ tên học sinh,
 * ngày cấp, tên chương trình và triện đỏ xác thực để tải về máy hoặc in ấn chất lượng cao.
 */
export function generateDynamicCertificateSvg({
  studentName,
  courseTitle,
  formattedDate,
  stars,
  xp,
  courseId,
}: {
  studentName: string
  courseTitle: string
  formattedDate: string
  stars: number
  xp: number
  courseId: string
}): string {
  const safeName = studentName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeTitle = courseTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const certCode = `AIKIDS-${(courseId || 'OFFICIAL').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)}`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <linearGradient id="certBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF7"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FFF9EC"/>
    </linearGradient>
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="ribbonGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>

  <!-- Nền giấy ngà cao cấp -->
  <rect x="0" y="0" width="1000" height="700" rx="28" fill="url(#certBg)"/>

  <!-- Viền hoa văn vàng ánh kim trang trọng -->
  <rect x="25" y="25" width="950" height="650" rx="20" fill="none" stroke="url(#goldBorder)" stroke-width="5"/>
  <rect x="36" y="36" width="928" height="628" rx="14" fill="none" stroke="#FDE68A" stroke-width="2" stroke-dasharray="10 6"/>

  <!-- Họa tiết 4 góc nghệ thuật -->
  <g stroke="url(#goldBorder)" stroke-width="3" fill="none">
    <path d="M48 70 L48 48 L70 48" />
    <circle cx="56" cy="56" r="3" fill="#D97706" />
    <path d="M952 70 L952 48 L930 48" />
    <circle cx="944" cy="56" r="3" fill="#D97706" />
    <path d="M48 630 L48 652 L70 652" />
    <circle cx="56" cy="644" r="3" fill="#D97706" />
    <path d="M952 630 L952 652 L930 652" />
    <circle cx="944" cy="644" r="3" fill="#D97706" />
  </g>

  <!-- Huy hiệu vinh danh Ribbon ở trên cùng -->
  <g transform="translate(500, 75)" text-anchor="middle">
    <rect x="-140" y="0" width="280" height="34" rx="17" fill="url(#ribbonGold)"/>
    <text x="0" y="22" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" letter-spacing="2">★ AI KIDS CREATOR ACADEMY ★</text>
  </g>

  <!-- Tiêu đề chứng nhận -->
  <text x="500" y="165" font-family="'Plus Jakarta Sans', serif, system-ui" font-size="34" font-weight="900" fill="#1E293B" text-anchor="middle" letter-spacing="3">GIẤY CHỨNG NHẬN TỐT NGHIỆP</text>

  <g transform="translate(500, 190)">
    <line x1="-120" y1="0" x2="120" y2="0" stroke="#F59E0B" stroke-width="2"/>
    <circle cx="0" cy="0" r="5" fill="#D97706"/>
  </g>

  <!-- Lời vinh danh -->
  <text x="500" y="235" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="700" fill="#64748B" text-anchor="middle">Trân trọng vinh danh Nhà Sáng Tạo Nhí</text>

  <!-- HỌ TÊN HỌC SINH (In to, trang trọng, chính giữa) -->
  <text x="500" y="315" font-family="'Plus Jakarta Sans', serif, system-ui" font-size="46" font-weight="900" fill="#78350F" text-anchor="middle" letter-spacing="1">${safeName}</text>
  <line x1="300" y1="335" x2="700" y2="335" stroke="#FDE68A" stroke-width="2"/>

  <!-- Nội dung khóa học -->
  <text x="500" y="375" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="700" fill="#475569" text-anchor="middle">Đã xuất sắc hoàn thành trạm cuối và làm chủ toàn bộ kiến thức tại:</text>
  <text x="500" y="420" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="22" font-weight="900" fill="#1D4ED8" text-anchor="middle">${safeTitle}</text>

  <!-- Huy hiệu thành tích (Sao & EXP) -->
  <g transform="translate(500, 480)">
    <rect x="-190" y="0" width="175" height="38" rx="19" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="-102" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="800" fill="#92400E" text-anchor="middle">⭐ ${stars} Sao Tinh Hoa</text>

    <rect x="15" y="0" width="175" height="38" rx="19" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1.5"/>
    <text x="102" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="800" fill="#5B21B6" text-anchor="middle">⚡ +${xp} Điểm EXP</text>
  </g>

  <!-- Đường gạch phân cách chân trang -->
  <line x1="70" y1="560" x2="930" y2="560" stroke="#E2E8F0" stroke-width="1.5"/>

  <!-- Chân trang: Ngày cấp -->
  <g transform="translate(100, 600)">
    <text x="0" y="0" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#64748B">Ngày cấp chứng chỉ:</text>
    <text x="0" y="26" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="900" fill="#0F172A">${formattedDate}</text>
  </g>

  <!-- Chân trang: Mã xác thực -->
  <g transform="translate(500, 600)" text-anchor="middle">
    <text x="0" y="0" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#94A3B8">Mã chứng nhận số:</text>
    <text x="0" y="24" font-family="monospace" font-size="14" font-weight="800" fill="#475569">${certCode}</text>
  </g>

  <!-- Triện đỏ con dấu chứng thực AI Kids Official -->
  <g transform="translate(850, 605)">
    <circle cx="0" cy="0" r="46" fill="#FEF2F2" stroke="#EF4444" stroke-width="3" stroke-dasharray="7 4"/>
    <circle cx="0" cy="0" r="39" fill="none" stroke="#DC2626" stroke-width="1.5"/>
    <text x="0" y="-12" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="900" fill="#DC2626" text-anchor="middle" letter-spacing="1">AI KIDS ACADEMY</text>
    <text x="0" y="5" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" text-anchor="middle">★ ★ ★</text>
    <text x="0" y="20" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8" font-weight="900" fill="#DC2626" text-anchor="middle" letter-spacing="1.5">OFFICIAL CERTIFIED</text>
  </g>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function CourseCertificateModal({
  isOpen,
  onClose,
  courseId = OFFICIAL_COURSE_CERTIFICATE_ID,
  studentName = 'Nhà Sáng Tạo Nhí AIKI',
  courseTitle = 'Khóa Học Sáng Tạo Nội Dung Cùng AIKids (6 Đảo • 30 Trạm)',
  islandTitle,
  issuedDate,
  stars = 18,
  xp = 1500,
  studentId,
  onSaveToBackpack,
}: CourseCertificateModalProps) {
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (isOpen && courseId) {
      setIsSaved(isCertificateClaimed(courseId, studentId))
    } else if (isOpen) {
      setIsSaved(false)
    }
  }, [isOpen, courseId, studentId])

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
    const effectiveCourseId =
      courseId || (islandTitle || courseTitle).toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const savedCert = saveCertificateToBackpack(
      {
        id: courseId || effectiveCourseId,
        courseId: effectiveCourseId,
        courseTitle,
        islandTitle: islandTitle || courseTitle,
        studentName,
        issuedDate: formattedDate,
        stars,
        xp,
      },
      studentId,
    )
    onSaveToBackpack?.(savedCert)
    try {
      playInstantSound('star')
    } catch {
      // ignore
    }
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  const handlePrintCertificate = () => {
    window.print()
  }

  const dynamicSvgDownloadUrl = generateDynamicCertificateSvg({
    studentName,
    courseTitle: displayTitle,
    formattedDate,
    stars,
    xp,
    courseId,
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in print:bg-white print:p-0 print:static"
    >
      <div className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-amber-50/90 via-white to-amber-50/60 p-4 sm:p-7 border-4 border-amber-300/90 shadow-clay animate-scale-up print:border-none print:shadow-none print:w-full print:max-w-none print:h-auto print:overflow-visible print:bg-none print:bg-white print:p-0">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 rounded-full bg-amber-200/30 blur-2xl pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 size-48 rounded-full bg-brand-200/25 blur-2xl pointer-events-none print:hidden" />

        {/* Close icon button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng chứng chỉ"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 size-9 rounded-full bg-white/90 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors z-10 print:hidden cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* ── KHUNG BẰNG KHEN CHÍNH THỨC (CÁ NHÂN HÓA ĐẦY ĐỦ THÔNG TIN) ── */}
        <div className="relative rounded-2xl border-4 border-amber-400/90 p-5 sm:p-8 bg-gradient-to-b from-[#FFFDF7] via-white to-[#FFF9EC] shadow-inner text-center flex flex-col items-center overflow-hidden">
          {/* Viền đôi hoa văn nét đứt phong cách bằng khen danh giá */}
          <div className="absolute inset-2 border-2 border-dashed border-amber-300/80 rounded-xl pointer-events-none" />

          {/* Dải băng vinh danh trên cùng */}
          <div className="relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-widest mb-3 shadow-md">
            <Award size={14} className="text-amber-100 shrink-0" />
            <span>AI Kids Creator Academy</span>
          </div>

          <h2
            id="certificate-modal-title"
            className="relative z-10 text-xl sm:text-3xl font-black text-slate-800 font-serif uppercase tracking-wider mt-1"
          >
            Chứng Nhận Tốt Nghiệp
          </h2>

          <div className="relative z-10 flex items-center gap-3 my-2.5">
            <div className="h-0.5 w-14 bg-amber-300 rounded-full" />
            <Award size={24} className="text-amber-500" />
            <div className="h-0.5 w-14 bg-amber-300 rounded-full" />
          </div>

          {/* Tên học sinh in to bản, trang trọng chính giữa giấy khen */}
          <p className="relative z-10 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">
            Trân trọng vinh danh Nhà Sáng Tạo Nhí:
          </p>
          <p className="relative z-10 text-2xl sm:text-4xl font-black text-amber-950 font-serif my-2 px-6 py-2 rounded-2xl bg-amber-50/90 border-2 border-amber-200/80 shadow-xs max-w-full break-words">
            {studentName}
          </p>

          <p className="relative z-10 text-xs sm:text-sm font-bold text-slate-600 mt-2">
            Đã xuất sắc hoàn thành trạm cuối và làm chủ toàn bộ kiến thức tại:
          </p>
          <p className="relative z-10 text-base sm:text-xl font-black text-brand-700 font-display mt-1 max-w-lg">
            {displayTitle}
          </p>

          {/* Thành tích Huy hiệu Sao & EXP */}
          <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4 my-4 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-900 text-xs sm:text-sm font-extrabold border border-amber-300 shadow-2xs">
              <Star size={16} className="fill-amber-400 text-amber-500" />
              <span>{stars} Sao Tinh Hoa</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-100/90 text-violet-900 text-xs sm:text-sm font-extrabold border border-violet-300 shadow-2xs">
              <Zap size={16} className="fill-violet-400 text-violet-500" />
              <span>+{xp} Điểm EXP</span>
            </div>
          </div>

          {/* Chân Bằng Khen: Ngày Cấp & Triện Đỏ Xác Thực */}
          <div className="relative z-10 w-full flex items-center justify-between border-t-2 border-amber-200/80 pt-3.5 mt-2 text-xs text-slate-500 font-bold px-2 sm:px-4">
            <div className="text-left">
              <span className="text-slate-500">Ngày cấp: </span>
              <div className="text-slate-800 font-black text-sm sm:text-base">{formattedDate}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Mã số: AIKIDS-{courseId.toUpperCase().slice(0, 8)}</div>
            </div>

            {/* Triện đỏ con dấu chứng thực AI Kids */}
            <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-red-500 bg-red-50/80 rotate-[-8deg] shadow-xs">
              <div className="absolute inset-1 rounded-full border border-red-500/60" />
              <div className="text-center text-red-600 font-black leading-tight flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] tracking-tight">AI KIDS</span>
                <span className="text-[10px] sm:text-[12px] my-0.5">★★★</span>
                <span className="text-[7px] sm:text-[8px] uppercase tracking-wider font-extrabold">CERTIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BỘ NÚT HÀNH ĐỘNG (ẨN KHI IN ẤN) ── */}
        <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 flex-wrap w-full print:hidden">
          <Button
            variant="primary"
            onClick={handleSaveToBackpack}
            disabled={isSaved}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-clay cursor-pointer whitespace-nowrap"
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

          <a
            href={dynamicSvgDownloadUrl}
            download={`Bang-Khen-${studentName.replace(/\s+/g, '-')}-AIKids.svg`}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 font-black text-sm rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title="Tải Giấy Chứng Nhận vector chứa đầy đủ thông tin cá nhân hóa về máy"
          >
            <Download size={17} />
            <span>Tải Bằng Khen (.SVG)</span>
          </a>

          <button
            type="button"
            onClick={handlePrintCertificate}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 font-black text-sm rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title="In Giấy Khen trực tiếp ra máy in chuẩn A4"
          >
            <Printer size={17} />
            <span>In Giấy Khen 🖨️</span>
          </button>

          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 font-bold text-sm text-slate-600 hover:text-slate-800 cursor-pointer whitespace-nowrap"
          >
            ✕ Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
