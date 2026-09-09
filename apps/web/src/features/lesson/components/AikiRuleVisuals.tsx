import React from 'react'
import { Check, Download, Lightbulb, Printer, Sparkles, Star, Trophy, X, ZoomIn } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

// ── 1. FALLBACK TRANH ZICO (Hallmark Craft / SVG) ──────────────────────────
export function ZicoDrawingFallback({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-full min-h-[280px] sm:min-h-[340px] flex flex-col items-center justify-between p-3.5 bg-gradient-to-b from-amber-50/90 via-orange-50/70 to-amber-100/60 select-none overflow-hidden", className)}>
      {/* Khung viền sáp vẽ nét đứt trẻ em */}
      <div className="absolute inset-1 rounded-2xl border-2 border-dashed border-amber-300/80 pointer-events-none" />

      {/* Đồ họa SVG Tranh Zico: Siêu nhân rập khuôn theo phim */}
      <svg viewBox="0 0 320 220" className="w-full max-h-[78%] drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skyGradZico" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
          <linearGradient id="capeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>

        {/* Nền bầu trời và mây */}
        <rect x="8" y="8" width="304" height="204" rx="14" fill="url(#skyGradZico)" />
        {/* Mây nét vẽ trẻ em */}
        <path d="M40 55 C45 42 65 42 72 55 C82 50 95 62 88 72 C92 82 78 90 68 85 C58 92 42 85 45 75 C35 70 35 58 40 55 Z" fill="#ffffff" opacity="0.85" />
        <path d="M230 40 C235 30 250 30 255 40 C265 37 275 45 270 55 C275 62 265 70 255 67 C248 72 235 68 238 60 C230 55 230 45 235 40 Z" fill="#ffffff" opacity="0.8" />

        {/* Khối nhà cao tầng xám đơn điệu phía dưới */}
        <rect x="25" y="145" width="40" height="67" fill="#94a3b8" rx="2" />
        <rect x="33" y="155" width="8" height="8" fill="#fef08a" />
        <rect x="47" y="155" width="8" height="8" fill="#fef08a" />
        <rect x="33" y="172" width="8" height="8" fill="#fef08a" />
        <rect x="47" y="172" width="8" height="8" fill="#cbd5e1" />

        <rect x="75" y="130" width="48" height="82" fill="#64748b" rx="2" />
        <rect x="85" y="142" width="8" height="10" fill="#fef08a" />
        <rect x="103" y="142" width="8" height="10" fill="#cbd5e1" />
        <rect x="85" y="162" width="8" height="10" fill="#fef08a" />
        <rect x="103" y="162" width="8" height="10" fill="#fef08a" />

        <rect x="210" y="138" width="55" height="74" fill="#94a3b8" rx="2" />
        <rect x="222" y="150" width="9" height="9" fill="#cbd5e1" />
        <rect x="242" y="150" width="9" height="9" fill="#fef08a" />

        {/* Áo choàng đỏ siêu nhân bay */}
        <path d="M135 110 Q95 135 70 160 Q110 145 145 125 Z" fill="url(#capeGrad)" stroke="#991b1b" strokeWidth="2" />
        <path d="M148 112 Q115 155 90 185 Q135 160 158 126 Z" fill="url(#capeGrad)" stroke="#991b1b" strokeWidth="2" />

        {/* Thân siêu nhân bay chéo */}
        <g transform="translate(15, -10)">
          {/* Chân */}
          <path d="M125 135 L108 170 L118 172 L132 142 Z" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="2" />
          <path d="M132 135 L120 172 L129 174 L139 142 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
          {/* Ủng đỏ */}
          <path d="M108 165 L103 175 L118 175 Z" fill="#dc2626" />
          <path d="M120 167 L116 177 L130 177 Z" fill="#dc2626" />

          {/* Mình áo xanh dương */}
          <ellipse cx="145" cy="115" rx="18" ry="24" transform="rotate(-30 145 115)" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2.5" />
          {/* Biểu tượng ngực: Ngôi sao vàng mẫu chung */}
          <polygon points="144,103 147,112 156,112 149,117 151,126 144,121 137,126 139,117 132,112 141,112" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

          {/* Đầu & Mặt nạ */}
          <circle cx="162" cy="85" r="14" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
          {/* Mặt nạ đen */}
          <path d="M152 83 Q162 78 173 83 Q168 90 162 86 Q156 90 152 83 Z" fill="#1e293b" />
          {/* Mắt trắng */}
          <ellipse cx="157" cy="83" rx="2.5" ry="1.5" fill="#ffffff" />
          <ellipse cx="167" cy="83" rx="2.5" ry="1.5" fill="#ffffff" />

          {/* Tay đấm giơ lên trời kiểu mẫu */}
          <path d="M155 105 L180 72 L192 78 L168 112 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
          <circle cx="190" cy="74" r="6" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
        </g>

        {/* Tia tốc độ bay */}
        <line x1="110" y1="180" x2="80" y2="200" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" />
        <line x1="130" y1="190" x2="110" y2="210" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
      </svg>

      {/* Nhãn ghi chú tranh vẽ sáp của Zico */}
      <div className="z-10 mt-1.5 flex items-center gap-2 rounded-full border-2 border-amber-300 bg-white/95 px-3.5 py-1.5 text-center shadow-xs">
        <span className="text-sm">🎨</span>
        <span className="text-xs sm:text-sm font-black text-amber-900 tracking-tight">
          Bức của Zico: Siêu nhân quen thuộc (ai cũng vẽ giống nhau)
        </span>
      </div>
    </div>
  )
}

// ── 2. FALLBACK TRANH SONET (Hallmark Craft / SVG) ─────────────────────────
export function SonetDrawingFallback({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-full min-h-[280px] sm:min-h-[340px] flex flex-col items-center justify-between p-3.5 bg-gradient-to-b from-sky-50/95 via-indigo-50/70 to-sky-100/60 select-none overflow-hidden", className)}>
      {/* Khung viền nét vẽ và ghim kẹp giấy mint */}
      <div className="absolute inset-1 rounded-2xl border-2 border-dashed border-sky-300/80 pointer-events-none" />
      <div className="absolute top-2 left-4 z-10 flex items-center gap-1.5 rounded-sm bg-mint-500 px-2.5 py-1 text-[10px] font-black text-white shadow-xs rotate-[-3deg]">
        📎 Ghim tranh Sonet
      </div>

      {/* Đồ họa SVG Tranh Sonet: Siêu anh hùng Bố cầm vợt muỗi ngộ nghĩnh */}
      <svg viewBox="0 0 320 220" className="w-full max-h-[78%] drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="roomGradSonet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#ede9fe" />
          </linearGradient>
          <radialGradient id="racketGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Nền phòng khách gia đình ấm cúng */}
        <rect x="8" y="8" width="304" height="204" rx="14" fill="url(#roomGradSonet)" />

        {/* Đèn ngủ treo và khung ảnh gia đình nhỏ trên tường */}
        <rect x="40" y="30" width="32" height="24" rx="3" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="50" cy="40" r="4" fill="#fb923c" />
        <circle cx="62" cy="42" r="3" fill="#38bdf8" />

        {/* Ghế sofa màu cam góc trái */}
        <rect x="20" y="140" width="55" height="50" rx="8" fill="#fb923c" stroke="#c2410c" strokeWidth="2" />
        <rect x="15" y="160" width="12" height="30" rx="4" fill="#ea580c" />

        {/* ── BỐ SIÊU NHÂN ────────────────────────────────────── */}
        <g transform="translate(10, 0)">
          {/* Chân & Quần đùi hoa */}
          <path d="M125 140 L123 185 L133 185 L135 140 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
          <path d="M145 140 L147 185 L157 185 L155 140 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
          {/* Dép lê tổ ong của Bố */}
          <rect x="117" y="183" width="18" height="6" rx="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          <rect x="144" y="183" width="18" height="6" rx="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          {/* Quần đùi hoa xanh */}
          <path d="M118 128 L160 128 L163 150 L145 150 L140 138 L135 150 L115 150 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
          <circle cx="128" cy="138" r="2" fill="#ffffff" />
          <circle cx="150" cy="142" r="2" fill="#ffffff" />

          {/* Thân áo phông của Bố */}
          <rect x="116" y="88" width="46" height="42" rx="8" fill="#10b981" stroke="#047857" strokeWidth="2.5" />
          {/* Dòng chữ vui vẻ trên áo Bố */}
          <text x="139" y="108" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">SUPER DAD</text>

          {/* Cánh tay trái: Chống hông cực ngầu */}
          <path d="M116 95 Q96 110 108 126 L118 122" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" fill="none" />

          {/* Đầu Bố mỉm cười */}
          <circle cx="139" cy="66" r="16" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
          {/* Nụ cười hiền hậu */}
          <path d="M133 72 Q139 78 145 72" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Mắt híp cười tít */}
          <path d="M131 63 Q134 60 137 63" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M141 63 Q144 60 147 63" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Mũ bảo hiểm xe máy của Bố có kính chắn gió ngộ nghĩnh */}
          <path d="M121 66 C121 48 157 48 157 66 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <rect x="127" y="52" width="24" height="4" rx="2" fill="#ffffff" />
          <path d="M125 64 Q139 60 153 64" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Cánh tay phải: Giơ cao VỢT BẮT MUỖI */}
          <path d="M162 95 Q180 85 195 62" stroke="#ea580c" strokeWidth="7" strokeLinecap="round" fill="none" />
          {/* Bàn tay nắm cán vợt */}
          <circle cx="195" cy="62" r="5" fill="#fed7aa" />

          {/* Cán Vợt Bắt Muỗi màu đỏ */}
          <line x1="195" y1="62" x2="218" y2="40" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
          {/* Nút bấm đèn vợt */}
          <circle cx="205" cy="52" r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />

          {/* Mặt lưới Vợt Bắt Muỗi điện hình bầu dục màu vàng rực */}
          <g transform="translate(230, 26) rotate(35)">
            <ellipse cx="0" cy="0" rx="19" ry="25" fill="#fef08a" stroke="#eab308" strokeWidth="3" />
            {/* Lưới điện mắt cáo */}
            <line x1="-12" y1="-15" x2="12" y2="15" stroke="#ca8a04" strokeWidth="1" />
            <line x1="-12" y1="15" x2="12" y2="-15" stroke="#ca8a04" strokeWidth="1" />
            <line x1="0" y1="-22" x2="0" y2="22" stroke="#ca8a04" strokeWidth="1" />
            <line x1="-16" y1="0" x2="16" y2="0" stroke="#ca8a04" strokeWidth="1" />
          </g>

          {/* Hào quang điện chớp giật ZAP! ZAP! */}
          <polygon points="215,20 222,25 218,29 226,34 220,35" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
          <polygon points="255,45 262,48 258,54 266,57 260,60" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          <text x="245" y="20" fontSize="13" fontWeight="900" fill="#e11d48" fontStyle="italic">⚡ ZAP!</text>
        </g>

        {/* CHÚ MUỖI HÀI HƯỚC ĐANG BAY CHẠY TRỐN */}
        <g transform="translate(255, 80)">
          {/* Vết bay xoáy vòng vòng */}
          <path d="M-15 15 Q-5 35 15 20 Q25 0 0 -5" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
          {/* Cánh muỗi rung */}
          <ellipse cx="6" cy="-2" rx="6" ry="3" fill="#bae6fd" opacity="0.8" transform="rotate(-30 6 -2)" />
          <ellipse cx="-6" cy="-2" rx="6" ry="3" fill="#bae6fd" opacity="0.8" transform="rotate(30 -6 -2)" />
          {/* Mình muỗi */}
          <ellipse cx="0" cy="4" rx="4" ry="7" fill="#475569" />
          <circle cx="0" cy="-2" r="3" fill="#1e293b" />
          {/* Mắt muỗi xoay tròn hoảng hốt */}
          <circle cx="-1.5" cy="-2" r="1.5" fill="#ffffff" />
          <circle cx="1.5" cy="-2" r="1.5" fill="#ffffff" />
          <circle cx="-1" cy="-2" r="0.8" fill="#000000" />
          <circle cx="1" cy="-2" r="0.8" fill="#000000" />
          {/* Vòi muỗi */}
          <line x1="0" y1="-5" x2="0" y2="-10" stroke="#0f172a" strokeWidth="1" />
          {/* Giọt mồ hôi muỗi */}
          <path d="M8 2 C8 2 11 5 11 7 C11 9 9 10 8 10 C7 10 5 9 5 7 C5 5 8 2 8 2 Z" fill="#38bdf8" />
        </g>
      </svg>

      {/* Nhãn ghi chú tranh Sonet */}
      <div className="z-10 mt-1.5 flex items-center gap-2 rounded-full border-2 border-sky-300 bg-white/95 px-3.5 py-1.5 text-center shadow-xs">
        <span className="text-sm">✨</span>
        <span className="text-xs sm:text-sm font-black text-sky-900 tracking-tight">
          Bức của Sonet: Bố dũng cảm cầm vợt muỗi (ý tưởng riêng của con)
        </span>
      </div>
    </div>
  )
}

// ── 3. MINH HỌA CỘT KHO DỮ LIỆU AI (Chặng 4) ──────────────────────────────
export function AiWarehouseVisual({ imageUrl, className, onZoom }: { imageUrl?: string; className?: string; onZoom?: () => void }) {
  if (imageUrl) {
    return (
      <div className={cn("group/zoom relative overflow-hidden rounded-2xl border-2 border-slate-200 aspect-video shadow-xs bg-slate-50", className)}>
        <img
          src={imageUrl}
          alt="Kho dữ liệu AI"
          className={cn("size-full object-cover transition-transform duration-300 group-hover/zoom:scale-105", onZoom && "cursor-pointer")}
          onClick={onZoom}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        {onZoom && (
          <button
            type="button"
            onClick={onZoom}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-md backdrop-blur-xs transition hover:bg-white hover:scale-105"
            title="Xem tranh to"
          >
            <ZoomIn size={13} className="text-slate-600" />
            <span>Xem to</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative w-full rounded-2xl border-2 border-slate-200 bg-slate-100 p-4 flex flex-col items-center justify-center overflow-hidden shadow-xs", className)}>
      <svg viewBox="0 0 280 140" className="w-full max-h-36 sm:max-h-44 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Nền xám máy móc */}
        <rect x="4" y="4" width="272" height="132" rx="12" fill="#f1f5f9" />
        {/* Máy photocopy / máy in robot */}
        <rect x="40" y="35" width="80" height="70" rx="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
        <rect x="50" y="45" width="30" height="12" rx="2" fill="#0284c7" />
        <circle cx="95" cy="50" r="4" fill="#22c55e" />
        <circle cx="107" cy="50" r="4" fill="#ef4444" />

        {/* Khay in nhả giấy */}
        <path d="M120 70 L230 70 L220 115 L120 115 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

        {/* 3 trang giấy in ra giống hệt nhau */}
        <g transform="translate(130, 48)">
          <rect x="0" y="0" width="38" height="48" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="19,10 22,18 30,18 24,23 26,31 19,26 12,31 14,23 8,18 16,18" fill="#f59e0b" />
          <line x1="8" y1="36" x2="30" y2="36" stroke="#cbd5e1" strokeWidth="2" />
        </g>
        <g transform="translate(155, 54)">
          <rect x="0" y="0" width="38" height="48" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="19,10 22,18 30,18 24,23 26,31 19,26 12,31 14,23 8,18 16,18" fill="#f59e0b" />
          <line x1="8" y1="36" x2="30" y2="36" stroke="#cbd5e1" strokeWidth="2" />
        </g>
        <g transform="translate(180, 60)">
          <rect x="0" y="0" width="38" height="48" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="19,10 22,18 30,18 24,23 26,31 19,26 12,31 14,23 8,18 16,18" fill="#f59e0b" />
          <line x1="8" y1="36" x2="30" y2="36" stroke="#cbd5e1" strokeWidth="2" />
        </g>

        {/* Dòng mã nhị phân 0101 */}
        <text x="50" y="125" fontSize="10" fontWeight="bold" fill="#64748b" fontFamily="monospace">010101 101010</text>
        <text x="140" y="28" fontSize="11" fontWeight="800" fill="#475569">Sao chép hàng loạt giống hệt</text>
      </svg>
      <span className="mt-2 text-xs sm:text-sm font-bold text-slate-700">
        🤖 AI chỉ tổng hợp mẫu có sẵn — không có ký ức riêng
      </span>
    </div>
  )
}

// ── 4. MINH HỌA CỘT BỘ NÃO SÁNG TẠO CỦA CON (Chặng 4) ──────────────────────
export function KidBrainVisual({ imageUrl, className, onZoom }: { imageUrl?: string; className?: string; onZoom?: () => void }) {
  if (imageUrl) {
    return (
      <div className={cn("group/zoom relative overflow-hidden rounded-2xl border-2 border-brand-300 aspect-video shadow-xs bg-amber-50/50", className)}>
        <img
          src={imageUrl}
          alt="Não sáng tạo của con"
          className={cn("size-full object-cover transition-transform duration-300 group-hover/zoom:scale-105", onZoom && "cursor-pointer")}
          onClick={onZoom}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        {onZoom && (
          <button
            type="button"
            onClick={onZoom}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-brand-900 shadow-md backdrop-blur-xs transition hover:bg-white hover:scale-105"
            title="Xem tranh to"
          >
            <ZoomIn size={13} className="text-brand-600" />
            <span>Xem to</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative w-full rounded-2xl border-2 border-brand-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4 flex flex-col items-center justify-center overflow-hidden shadow-clay", className)}>
      <svg viewBox="0 0 280 140" className="w-full max-h-36 sm:max-h-44 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hào quang ý tưởng */}
        <circle cx="140" cy="65" r="55" fill="url(#bulbGlow)" />

        {/* Não bộ hoạt hình mỉm cười */}
        <g transform="translate(100, 45)">
          {/* Bán cầu não trái */}
          <path d="M25 45 C10 45 5 30 15 20 C5 10 20 -5 32 5 C38 -2 48 5 45 15 C48 30 40 45 25 45 Z" fill="#fda4af" stroke="#e11d48" strokeWidth="2" />
          {/* Bán cầu não phải */}
          <path d="M45 15 C42 5 52 -2 58 5 C70 -5 85 10 75 20 C85 30 80 45 65 45 C50 45 42 30 45 15 Z" fill="#fda4af" stroke="#e11d48" strokeWidth="2" />
          {/* Rãnh não uốn lượn */}
          <path d="M25 22 Q35 25 28 35" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M62 22 Q55 25 60 35" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Mắt cười tít */}
          <path d="M30 26 Q35 22 40 26" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M50 26 Q55 22 60 26" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Miệng cười */}
          <path d="M40 33 Q45 37 50 33" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Má hồng */}
          <circle cx="28" cy="30" r="3" fill="#f43f5e" opacity="0.6" />
          <circle cx="62" cy="30" r="3" fill="#f43f5e" opacity="0.6" />
        </g>

        {/* BÓNG ĐÈN Ý TƯỞNG BỪNG SÁNG TRÊN ĐẦU */}
        <g transform="translate(126, 8)">
          <path d="M14 0 C6 0 0 6 0 14 C0 19 4 23 6 26 L22 26 C24 23 28 19 28 14 C28 6 22 0 14 0 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <rect x="8" y="26" width="12" height="4" rx="1" fill="#94a3b8" />
          <rect x="10" y="30" width="8" height="3" rx="1" fill="#64748b" />
          {/* Dây tóc bóng đèn */}
          <path d="M10 14 Q14 8 18 14" stroke="#ca8a04" strokeWidth="1.5" fill="none" />
        </g>

        {/* Tia sáng phát ra từ bóng đèn */}
        <line x1="140" y1="2" x2="140" y2="-4" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="118" y1="10" x2="112" y2="6" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
        <line x1="162" y1="10" x2="168" y2="6" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />

        {/* Cọ vẽ vung màu sắc và trái tim cảm xúc */}
        <path d="M45 40 L65 70 L58 75 Z" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="1.5" />
        <path d="M58 75 Q50 90 42 85 Q48 70 58 75 Z" fill="#ec4899" />
        <circle cx="78" cy="95" r="4" fill="#3b82f6" />
        <circle cx="70" cy="110" r="3" fill="#10b981" />

        {/* Trái tim gia đình */}
        <path d="M225 60 C225 55 215 50 210 58 C205 50 195 55 195 60 C195 72 210 82 210 82 C210 82 225 72 225 60 Z" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />

        <text x="140" y="125" fontSize="11" fontWeight="900" fill="#92400e" textAnchor="middle">Kỷ niệm gia đình · Ý tưởng độc nhất</text>
      </svg>
      <span className="mt-2 text-xs sm:text-sm font-black text-amber-950">
        ✨ Con chính là thuyền trưởng sáng tạo chỉ huy AI!
      </span>
    </div>
  )
}

// ── 5. HUY HIỆU HIỆP SĨ SÁNG TẠO LẤP LÁNH (Chặng 5) ──────────────────────
export function CreativeKnightBadgeVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex flex-col items-center justify-center p-4 select-none animate-pop", className)}>
      {/* Tia hào quang xoay lấp lánh */}
      <div className="absolute size-48 rounded-full bg-gradient-to-tr from-amber-400/30 via-yellow-300/40 to-orange-400/30 blur-xl animate-pulse pointer-events-none" />

      {/* SVG Huy hiệu Hiệp Sĩ */}
      <svg viewBox="0 0 240 220" className="w-48 sm:w-56 drop-shadow-clay" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shieldGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="innerShield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="ribbonRed" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>

        {/* 2 Cọ vẽ hiệp sĩ bắt chéo phía sau khiên */}
        <g stroke="#92400e" strokeWidth="4" strokeLinecap="round">
          <line x1="30" y1="30" x2="210" y2="170" />
          <line x1="210" y1="30" x2="30" y2="170" />
        </g>
        {/* Đầu lông cọ vẽ nhúng sơn vàng & xanh */}
        <ellipse cx="28" cy="28" rx="8" ry="12" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" transform="rotate(-45 28 28)" />
        <ellipse cx="212" cy="28" rx="8" ry="12" fill="#facc15" stroke="#ca8a04" strokeWidth="2" transform="rotate(45 212 28)" />

        {/* Thân khiên hiệp sĩ hoàng kim */}
        <path
          d="M120 30 C165 30 195 40 195 75 C195 130 155 165 120 185 C85 165 45 130 45 75 C45 40 75 30 120 30 Z"
          fill="url(#shieldGold)"
          stroke="#78350f"
          strokeWidth="4"
        />
        {/* Lòng trong khiên */}
        <path
          d="M120 40 C155 40 180 50 180 78 C180 122 148 152 120 168 C92 152 60 122 60 78 C60 50 85 40 120 40 Z"
          fill="url(#innerShield)"
          stroke="#ca8a04"
          strokeWidth="2"
        />

        {/* Vương miện nhỏ 3 chóp trên đỉnh khiên */}
        <path d="M98 32 L106 14 L120 25 L134 14 L142 32 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
        <circle cx="106" cy="13" r="3" fill="#ef4444" />
        <circle cx="120" cy="23" r="3" fill="#3b82f6" />
        <circle cx="134" cy="13" r="3" fill="#ef4444" />

        {/* Ngôi sao hiệp sĩ lớn ở giữa khiên */}
        <polygon
          points="120,60 126,76 144,76 130,87 135,104 120,93 105,104 110,87 96,76 114,76"
          fill="#f59e0b"
          stroke="#78350f"
          strokeWidth="2.5"
        />
        <polygon
          points="120,68 124,78 136,78 126,86 130,98 120,90 110,98 114,86 104,78 116,78"
          fill="#fef08a"
        />

        {/* Trái tim cảm xúc và cọ vẽ nhỏ bên trong ngôi sao */}
        <circle cx="120" cy="84" r="4" fill="#e11d48" />

        {/* Dải ruy băng đỏ son uốn lượn dưới khiên */}
        <path
          d="M30 175 L60 162 L180 162 L210 175 L195 192 L120 186 L45 192 Z"
          fill="url(#ribbonRed)"
          stroke="#7f1d1d"
          strokeWidth="2.5"
        />
        <text
          x="120"
          y="180"
          fontSize="10"
          fontWeight="900"
          fill="#fef3c7"
          letterSpacing="1"
          textAnchor="middle"
        >
          HIỆP SĨ SÁNG TẠO AIKI
        </text>

        {/* Các đốm lấp lánh ánh kim xung quanh */}
        <path d="M50 50 L53 58 L61 61 L53 64 L50 72 L47 64 L39 61 L47 58 Z" fill="#fbbf24" opacity="0.9" />
        <path d="M190 50 L193 58 L201 61 L193 64 L190 72 L187 64 L179 61 L187 58 Z" fill="#fbbf24" opacity="0.9" />
        <path d="M120 200 L122 205 L127 207 L122 209 L120 214 L118 209 L113 207 L118 205 Z" fill="#facc15" />
      </svg>

      <div className="mt-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-xs font-black uppercase tracking-wider text-white shadow-clay">
          <Sparkles size={14} className="fill-white" />
          DANH HIỆU CAO QUÝ
        </span>
        <h4 className="mt-1 font-display text-lg font-black text-amber-950">
          Hiệp Sĩ Sáng Tạo StoryMee
        </h4>
        <p className="text-xs font-bold text-amber-800">
          Con luôn có ý tưởng riêng trước khi nhờ AI đồng hành!
        </p>
      </div>
    </div>
  )
}

// ── 6. MODAL PHÓNG TO TRANH CHẶNG 2 (AikiPictureZoomModal) ────────────────
export type ZoomImageData = {
  title: string
  subtitle: string
  url?: string
  isFallbackZico?: boolean
  isFallbackSonet?: boolean
  description: string
  onSelect?: () => void
}

export function AikiPictureZoomModal({
  data,
  onClose,
}: {
  data: ZoomImageData | null
  onClose: () => void
}) {
  if (!data) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Xem to ${data.title}`}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-3 border-amber-300 bg-white p-5 sm:p-6 shadow-clay animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition active:scale-95"
          aria-label="Đóng xem to"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700">
          <ZoomIn size={16} />
          {data.subtitle}
        </div>
        <h3 className="mt-1 font-display text-xl sm:text-2xl font-black text-text pr-10">
          {data.title}
        </h3>

        {/* Khung ảnh to */}
        <div className="mt-4 overflow-hidden rounded-2xl border-2 border-amber-200 aspect-[4/3] bg-slate-50 flex items-center justify-center">
          {data.url ? (
            <img
              src={data.url}
              alt={data.title}
              className="size-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : data.isFallbackZico ? (
            <ZicoDrawingFallback className="size-full" />
          ) : data.isFallbackSonet ? (
            <SonetDrawingFallback className="size-full" />
          ) : (
            <div className="text-sm font-bold text-muted">Không có ảnh hiển thị</div>
          )}
        </div>

        {/* Lời nhận xét / giải thích */}
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm font-semibold text-amber-950 leading-relaxed">
          <p className="font-black text-amber-900 mb-1 flex items-center gap-1.5">
            <Lightbulb size={16} className="text-amber-600 fill-amber-400" />
            Nhìn vào bức tranh con sẽ thấy:
          </p>
          {data.description}
        </div>

        {/* Nút hành động */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} className="h-11 px-5 font-extrabold">
            Đóng lại
          </Button>
          {data.onSelect && (
            <Button
              variant="primary"
              onClick={() => {
                data.onSelect?.()
                onClose()
              }}
              className="h-11 px-6 font-black bg-brand-600 hover:bg-brand-700 shadow-clay"
            >
              <Check size={18} />
              Chọn bức tranh này
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 7. MODAL POSTER QUY TẮC VÀNG (Chặng 3) ────────────────────────────────
export function AikiPosterModal({
  open,
  onClose,
  ruleTitle = 'Quy Tắc Vàng AIKI',
  ruleBody,
  ruleTip,
}: {
  open: boolean
  onClose: () => void
  ruleTitle?: string
  ruleBody: string
  ruleTip?: string
}) {
  if (!open) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Tấm Poster Quy Tắc Vàng"
    >
      <div
        className="relative max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-3xl border-4 border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 sm:p-8 shadow-clay animate-pop print:border-none print:shadow-none print:max-w-none print:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng (ẩn khi in) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/80 text-amber-900 hover:bg-white shadow-xs transition active:scale-95 print:hidden"
          aria-label="Đóng poster"
        >
          <X size={20} />
        </button>

        {/* Poster Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-200/90 px-4 py-1 text-xs font-black uppercase tracking-wider text-amber-950 shadow-xs">
            <Sparkles className="size-4 text-amber-700 fill-amber-500" />
            XƯỞNG SÁNG TẠO STORYMEE AIKIDS
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black text-amber-950 uppercase tracking-tight">
            📜 BẢNG QUY TẮC VÀNG
          </h2>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-0.5">
            Dán góc học tập của Hiệp Sĩ Sáng Tạo
          </p>
        </div>

        {/* Khung nội dung cốt lõi của quy tắc */}
        <div className="mt-6 rounded-3xl border-3 border-amber-300 bg-white/95 p-6 text-center shadow-clay">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-100 border-2 border-amber-300 text-2xl shadow-xs">
            ⭐
          </div>
          <h3 className="mt-4 font-display text-xl sm:text-2xl font-black text-amber-950 leading-snug">
            {ruleBody || 'Nghĩ ra ý tưởng của riêng mình trước, sau đó mới dùng AI để làm cho ý tưởng phong phú hơn!'}
          </h3>

          {ruleTip && (
            <div className="mt-5 rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-4 text-left shadow-xs">
              <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
                <Lightbulb size={18} className="text-amber-600 fill-amber-400" />
                <span>Bí kíp bỏ túi của con:</span>
              </div>
              <p className="mt-1 text-sm sm:text-base font-bold text-amber-950 leading-relaxed">
                {ruleTip}
              </p>
            </div>
          )}
        </div>

        {/* 3 Điều ghi nhớ nhanh cho bé */}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-3 text-center">
          <div className="rounded-2xl border border-amber-200 bg-white/80 p-3 shadow-xs">
            <span className="text-lg">🧠</span>
            <p className="mt-1 text-xs font-black text-amber-950">Con là thuyền trưởng</p>
            <p className="text-[11px] font-semibold text-amber-800">Tự nghĩ ý tưởng trước</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white/80 p-3 shadow-xs">
            <span className="text-lg">🤖</span>
            <p className="mt-1 text-xs font-black text-amber-950">AI là bạn phụ tá</p>
            <p className="text-[11px] font-semibold text-amber-800">Hỗ trợ gợi ý và tô điểm</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white/80 p-3 shadow-xs">
            <span className="text-lg">🌟</span>
            <p className="mt-1 text-xs font-black text-amber-950">Tác phẩm độc nhất</p>
            <p className="text-[11px] font-semibold text-amber-800">Mang đậm dấu ấn của con</p>
          </div>
        </div>

        {/* Footer actions (ẩn khi in) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-amber-200/80 print:hidden">
          <span className="text-xs font-extrabold text-amber-800">
            🖨️ Ba mẹ có thể in poster này ra giấy A4 dán góc học tập cho con nhé!
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="secondary"
              onClick={onClose}
              className="h-11 px-4 font-bold border-amber-300 hover:bg-amber-100"
            >
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              className="h-11 px-5 font-black bg-amber-600 hover:bg-amber-700 shadow-clay flex items-center gap-2"
            >
              <Printer size={18} />
              In Poster A4
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
