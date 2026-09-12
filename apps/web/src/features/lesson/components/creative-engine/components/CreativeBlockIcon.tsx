import React from 'react'
import { cn } from '@/shared/lib/cn'
import {
  FlatClayTeacup,
  FlatClayBicycle,
  FlatClayNotebook,
  FlatClayVintageClock,
  FlatClaySparkles,
} from '@/features/asmo/components/AsmoFlatClayIcons'

export interface CreativeBlockIconProps {
  icon?: string
  label?: string
  size?: number
  className?: string
}

// ════════════════════════════════════════════════════════════════════════════
// 1. MẶT SỐ LA MÃ VÀNG SOFT CLAY (FlatClaySunDialIcon)
// ════════════════════════════════════════════════════════════════════════════
export function FlatClaySunDialIcon({ size = 32, className }: { size?: number; className?: string }) {
  const idSuffix = React.useId().replace(/:/g, '')
  const dialGrad = `dial-grad-${idSuffix}`
  const ringGrad = `dial-ring-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible shrink-0', className)}
      role="img"
      aria-label="Mặt số la mã vàng"
    >
      <defs>
        <radialGradient id={dialGrad} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="35%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
        <linearGradient id={ringGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>

      {/* Vành tròn ngoài bằng đồng thau vàng kim dày dặn */}
      <circle cx="32" cy="32" r="28" fill={`url(#${ringGrad})`} stroke="#78350f" strokeWidth="1.5" />

      {/* Mặt số tròn màu kem vàng ngọc Soft Clay */}
      <circle cx="32" cy="32" r="23" fill={`url(#${dialGrad})`} stroke="#b45309" strokeWidth="1.2" />

      {/* Vòng chia vạch số phút tròn đồng tâm */}
      <circle cx="32" cy="32" r="18" stroke="#ca8a04" strokeWidth="0.8" strokeDasharray="1.5 3" fill="none" opacity="0.85" />

      {/* 4 Vạch số chỉ phương hướng XII, III, VI, IX bo cong thanh nhã */}
      <line x1="32" y1="13" x2="32" y2="17" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="32" y1="47" x2="32" y2="51" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="13" y1="32" x2="17" y2="32" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="47" y1="32" x2="51" y2="32" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />

      {/* Kim chỉ giờ và phút hoàng kim 10:10 */}
      <line x1="32" y1="32" x2="25" y2="23" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="32" y1="32" x2="42" y2="24" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />

      {/* Đinh ốc tâm tròn mạ vàng */}
      <circle cx="32" cy="32" r="3.2" fill="#78350f" stroke="#fde047" strokeWidth="1" />
      <circle cx="31.2" cy="31.2" r="1" fill="#ffffff" />

      {/* Vệt sáng phản quang Soft Clay cong viền trên */}
      <path
        d="M 16 24 C 20 14 36 12 46 17"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
        fill="none"
      />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 2. KIM ĐỒNG HỒ TÍCH TẮC SOFT CLAY (FlatClayClockPointerIcon)
// ════════════════════════════════════════════════════════════════════════════
export function FlatClayClockPointerIcon({ size = 32, className }: { size?: number; className?: string }) {
  const idSuffix = React.useId().replace(/:/g, '')
  const pointerGrad = `pointer-grad-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible shrink-0', className)}
      role="img"
      aria-label="Kim đồng hồ tích tắc"
    >
      <defs>
        <linearGradient id={pointerGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>

      {/* Cung sóng nhịp tích tắc êm tai */}
      <path
        d="M 44 14 C 52 20 56 31 52 42"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 3"
        opacity="0.75"
      />
      <circle cx="50" cy="18" r="1.8" fill="#38bdf8" />

      {/* Đôi kim đồng hồ phong cách baroque uốn lượn hình thoi */}
      {/* Kim phút vươn dài thanh thoát */}
      <path
        d="M 32 32 L 28 20 L 32 8 L 36 20 Z"
        fill={`url(#${pointerGrad})`}
        stroke="#0369a1"
        strokeWidth="1.2"
      />
      <circle cx="32" cy="17" r="2.2" fill="#ffffff" opacity="0.9" />

      {/* Kim giờ ngắn bề thế sang trọng chỉ hướng 2 giờ */}
      <path
        d="M 32 32 L 39 30 L 48 37 L 38 41 Z"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="1.2"
      />
      <circle cx="41" cy="35" r="1.8" fill="#fffbeb" opacity="0.9" />

      {/* Đuôi quả lắc cân bằng phía sau */}
      <line x1="32" y1="32" x2="24" y2="44" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="23" cy="45" r="3.2" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />

      {/* Trục tâm đinh ốc vàng tròn */}
      <circle cx="32" cy="32" r="5" fill="#facc15" stroke="#78350f" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="2.4" fill="#ca8a04" />
      <circle cx="30.8" cy="30.8" r="1" fill="#ffffff" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 3. QUẢ LẮC ĐỒNG ĐU ĐƯA SOFT CLAY (FlatClayPendulumBellIcon)
// ════════════════════════════════════════════════════════════════════════════
export function FlatClayPendulumBellIcon({ size = 32, className }: { size?: number; className?: string }) {
  const idSuffix = React.useId().replace(/:/g, '')
  const brassGrad = `brass-grad-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible shrink-0', className)}
      role="img"
      aria-label="Quả lắc đồng đu đưa"
    >
      <defs>
        <radialGradient id={brassGrad} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#facc15" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
      </defs>

      {/* Cung chuyển động đu đưa nhịp nhàng */}
      <path
        d="M 16 48 C 24 54 40 54 48 48"
        stroke="#f59e0b"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="2 4"
        opacity="0.6"
      />

      {/* Trục treo quả lắc đung đưa nghiêng nhẹ duyên dáng */}
      <line x1="32" y1="8" x2="32" y2="36" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="8" x2="32" y2="36" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="32" cy="8" r="3.5" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />

      {/* Quả lắc tròn đồng thau sáng bóng Soft Clay */}
      <circle cx="32" cy="44" r="15" fill={`url(#${brassGrad})`} stroke="#78350f" strokeWidth="1.6" />

      {/* Vòng hoa văn đồng tâm nổi */}
      <circle cx="32" cy="44" r="10" stroke="#ca8a04" strokeWidth="1.2" fill="none" opacity="0.8" />
      <circle cx="32" cy="44" r="4" fill="#facc15" stroke="#78350f" strokeWidth="0.8" />

      {/* Vệt sáng cong phản quang mềm mại */}
      <path
        d="M 23 38 C 26 33 34 32 39 35"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.85"
        fill="none"
      />
      <circle cx="26" cy="42" r="1.4" fill="#ffffff" opacity="0.9" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 4. CHÂN ĐẾ CHẠM HOA SOFT CLAY (FlatClayFloralIcon)
// ════════════════════════════════════════════════════════════════════════════
export function FlatClayFloralIcon({ size = 32, className }: { size?: number; className?: string }) {
  const idSuffix = React.useId().replace(/:/g, '')
  const petalGrad = `floral-petal-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible shrink-0', className)}
      role="img"
      aria-label="Chân đế chạm hoa"
    >
      <defs>
        <radialGradient id={petalGrad} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fecdd3" />
          <stop offset="45%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </radialGradient>
      </defs>

      {/* 2 Lá ngọc lục bảo non mềm mại vươn ra bên dưới */}
      <path
        d="M 32 38 C 42 45 46 54 44 56 C 36 56 32 48 32 38 Z"
        fill="#22c55e"
        stroke="#15803d"
        strokeWidth="1.2"
      />
      <path
        d="M 32 38 C 22 45 18 54 20 56 C 28 56 32 48 32 38 Z"
        fill="#4ade80"
        stroke="#15803d"
        strokeWidth="1.2"
      />

      {/* 5 Cánh hoa nặn phồng Soft Clay bo tròn */}
      {/* Cánh trên */}
      <circle cx="32" cy="18" r="9" fill={`url(#${petalGrad})`} stroke="#9f1239" strokeWidth="1.2" />
      {/* Cánh phải trên */}
      <circle cx="43" cy="27" r="9" fill={`url(#${petalGrad})`} stroke="#9f1239" strokeWidth="1.2" />
      {/* Cánh phải dưới */}
      <circle cx="39" cy="40" r="9" fill={`url(#${petalGrad})`} stroke="#9f1239" strokeWidth="1.2" />
      {/* Cánh trái dưới */}
      <circle cx="25" cy="40" r="9" fill={`url(#${petalGrad})`} stroke="#9f1239" strokeWidth="1.2" />
      {/* Cánh trái trên */}
      <circle cx="21" cy="27" r="9" fill={`url(#${petalGrad})`} stroke="#9f1239" strokeWidth="1.2" />

      {/* Nhụy hoa vàng óng tròn đầy phồng giữa */}
      <circle cx="32" cy="30" r="7" fill="#facc15" stroke="#ca8a04" strokeWidth="1.4" />
      <circle cx="32" cy="30" r="5" fill="#fef08a" />
      <circle cx="30" cy="28.5" r="1.4" fill="#ffffff" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 5. TREO TRÊN TƯỜNG GẠCH SOFT CLAY (FlatClayBrickWallIcon)
// ════════════════════════════════════════════════════════════════════════════
export function FlatClayBrickWallIcon({ size = 32, className }: { size?: number; className?: string }) {
  const idSuffix = React.useId().replace(/:/g, '')
  const brickGrad = `brick-grad-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible shrink-0', className)}
      role="img"
      aria-label="Treo trên tường gạch"
    >
      <defs>
        <linearGradient id={brickGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
      </defs>

      {/* Hàng gạch 1 (trên cùng) */}
      <rect x="8" y="10" width="22" height="11" rx="3.5" fill={`url(#${brickGrad})`} stroke="#7c2d12" strokeWidth="1.3" />
      <rect x="34" y="10" width="22" height="11" rx="3.5" fill={`url(#${brickGrad})`} stroke="#7c2d12" strokeWidth="1.3" />
      <path d="M 11 13 L 26 13" stroke="#fed7aa" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <path d="M 37 13 L 52 13" stroke="#fed7aa" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />

      {/* Hàng gạch 2 (ở giữa so le) */}
      <rect x="4" y="25" width="13" height="11" rx="3.5" fill={`url(#${brickGrad})`} stroke="#7c2d12" strokeWidth="1.3" />
      <rect x="21" y="25" width="22" height="11" rx="3.5" fill={`url(#${brickGrad})`} stroke="#7c2d12" strokeWidth="1.3" />
      <rect x="47" y="25" width="13" height="11" rx="3.5" fill={`url(#${brickGrad})`} stroke="#7c2d12" strokeWidth="1.3" />
      <path d="M 24 28 L 39 28" stroke="#fed7aa" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />

      {/* Hàng gạch 3 (dưới cùng) */}
      <rect x="8" y="40" width="22" height="11" rx="3.5" fill={`url(#${brickGrad})`} stroke="#7c2d12" strokeWidth="1.3" />
      <rect x="34" y="40" width="22" height="11" rx="3.5" fill={`url(#${brickGrad})`} stroke="#7c2d12" strokeWidth="1.3" />
      <path d="M 11 43 L 26 43" stroke="#fed7aa" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <path d="M 37 43 L 52 43" stroke="#fed7aa" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 6. TRÊN LÒ SƯỞI ẤM ÁP SOFT CLAY (FlatClayFireplaceIcon)
// ════════════════════════════════════════════════════════════════════════════
export function FlatClayFireplaceIcon({ size = 32, className }: { size?: number; className?: string }) {
  const idSuffix = React.useId().replace(/:/g, '')
  const flameOuter = `flame-out-${idSuffix}`
  const flameInner = `flame-in-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible shrink-0', className)}
      role="img"
      aria-label="Trên lò sưởi ấm áp"
    >
      <defs>
        <linearGradient id={flameOuter} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id={flameInner} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>

      {/* 2 Khúc củi gỗ sồi bắt chéo bo cong */}
      <line x1="14" y1="52" x2="50" y2="44" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
      <line x1="14" y1="52" x2="50" y2="44" stroke="#b45309" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="14" y1="44" x2="50" y2="52" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
      <line x1="14" y1="44" x2="50" y2="52" stroke="#d97706" strokeWidth="4.5" strokeLinecap="round" />

      {/* Ngọn lửa bập bùng Soft Clay tầng ngoài rực rỡ */}
      <path
        d="M 32 8 C 36 18 48 24 48 36 C 48 46 41 50 32 50 C 23 50 16 46 16 36 C 16 26 26 20 28 14 C 29 11 31 9 32 8 Z"
        fill={`url(#${flameOuter})`}
        stroke="#b91c1c"
        strokeWidth="1.4"
      />

      {/* Ngọn lửa vàng óng tầng trong */}
      <path
        d="M 32 20 C 35 26 42 30 42 38 C 42 44 37 47 32 47 C 27 47 22 44 22 38 C 22 31 29 27 30 23 Z"
        fill={`url(#${flameInner})`}
      />

      {/* Vệt sáng phản quang Soft Clay trên ngọn lửa */}
      <path
        d="M 24 30 C 22 35 23 42 26 44"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
        fill="none"
      />

      {/* Đốm lửa sao li ti nhảy nhót */}
      <circle cx="46" cy="18" r="2" fill="#facc15" />
      <circle cx="18" cy="22" r="1.6" fill="#fb923c" />
      <circle cx="34" cy="6" r="1.4" fill="#fef08a" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 7. TRÊN KỆ SÁCH PHÒNG KHÁCH SOFT CLAY (FlatClayBookshelfIcon)
// ════════════════════════════════════════════════════════════════════════════
export function FlatClayBookshelfIcon({ size = 32, className }: { size?: number; className?: string }) {
  const idSuffix = React.useId().replace(/:/g, '')
  const shelfWood = `shelf-wood-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible shrink-0', className)}
      role="img"
      aria-label="Trên kệ sách phòng khách"
    >
      <defs>
        <linearGradient id={shelfWood} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {/* Thanh kệ gỗ nằm ngang bo viền */}
      <rect x="6" y="50" width="52" height="7" rx="3.5" fill={`url(#${shelfWood})`} stroke="#451a03" strokeWidth="1.4" />
      <line x1="9" y1="52.5" x2="55" y2="52.5" stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

      {/* Cuốn sách 1 (xanh lam) đứng thẳng */}
      <rect x="14" y="20" width="9" height="30" rx="3" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.3" />
      <line x1="17" y1="24" x2="17" y2="46" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />

      {/* Cuốn sách 2 (đỏ hồng) đứng cạnh */}
      <rect x="25" y="16" width="10" height="34" rx="3" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.3" />
      <line x1="28" y1="20" x2="28" y2="46" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />

      {/* Cuốn sách 3 (vàng óng) tựa nghiêng */}
      <g transform="translate(38, 22) rotate(16)">
        <rect x="0" y="0" width="9" height="29" rx="3" fill="#fbbf24" stroke="#b45309" strokeWidth="1.3" />
        <line x1="3" y1="4" x2="3" y2="25" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 8. BÊN CỬA SỔ NHÌN RA VƯỜN SOFT CLAY (FlatClayWindowIcon)
// ════════════════════════════════════════════════════════════════════════════
export function FlatClayWindowIcon({ size = 32, className }: { size?: number; className?: string }) {
  const idSuffix = React.useId().replace(/:/g, '')
  const skyGlass = `window-sky-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible shrink-0', className)}
      role="img"
      aria-label="Bên cửa sổ nhìn ra vườn"
    >
      <defs>
        <linearGradient id={skyGlass} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="50%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* Bậu cửa sổ dưới cùng bằng gỗ dày */}
      <rect x="6" y="52" width="52" height="6" rx="3" fill="#d97706" stroke="#78350f" strokeWidth="1.3" />

      {/* Khung cửa sổ vòm uốn cong Soft Clay màu trắng sữa ấm */}
      <path
        d="M 12 52 L 12 26 C 12 15 20 8 32 8 C 44 8 52 15 52 26 L 52 52 Z"
        fill="#fef3c7"
        stroke="#b45309"
        strokeWidth="1.6"
      />

      {/* 4 Ô kính phản chiếu bầu trời ngập nắng */}
      {/* Ô kính trên trái */}
      <path d="M 16 28 C 16 20 22 13 30 13 L 30 30 L 16 30 Z" fill={`url(#${skyGlass})`} stroke="#0284c7" strokeWidth="1" />
      {/* Ô kính trên phải */}
      <path d="M 48 28 C 48 20 42 13 34 13 L 34 30 L 48 30 Z" fill={`url(#${skyGlass})`} stroke="#0284c7" strokeWidth="1" />
      {/* Ô kính dưới trái */}
      <rect x="16" y="34" width="14" height="15" fill={`url(#${skyGlass})`} stroke="#0284c7" strokeWidth="1" />
      {/* Ô kính dưới phải */}
      <rect x="34" y="34" width="14" height="15" fill={`url(#${skyGlass})`} stroke="#0284c7" strokeWidth="1" />

      {/* Vệt sáng nắng xiên chiếu trên kính */}
      <line x1="20" y1="18" x2="26" y2="18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <line x1="38" y1="38" x2="44" y2="38" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />

      {/* Chậu hoa nhỏ xinh bên bậu cửa */}
      <path d="M 28 50 L 30 45 L 34 45 L 36 50 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="0.8" />
      <circle cx="32" cy="42" r="3.2" fill="#ec4899" />
      <circle cx="32" cy="42" r="1.2" fill="#fef08a" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 9. CÁC ICON BỔ TRỢ SOFT CLAY CHO BÀI HỌC (Bút chì, Cây xanh, Nhà nhỏ)
// ════════════════════════════════════════════════════════════════════════════
export function FlatClayPencilIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('inline-block select-none shrink-0', className)}>
      <g transform="rotate(45 32 32)">
        <rect x="27" y="10" width="10" height="36" rx="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1.3" />
        <line x1="32" y1="12" x2="32" y2="44" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <polygon points="27,46 37,46 32,56" fill="#fed7aa" stroke="#ca8a04" strokeWidth="1" />
        <polygon points="30,52 34,52 32,56" fill="#1e293b" />
        <rect x="27" y="6" width="10" height="5" rx="2" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
      </g>
    </svg>
  )
}

export function FlatClayTreeIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('inline-block select-none shrink-0', className)}>
      {/* Thân cây */}
      <rect x="28" y="38" width="8" height="20" rx="3" fill="#92400e" stroke="#78350f" strokeWidth="1.4" />
      {/* Tán lá đất nặn bồng bềnh */}
      <circle cx="32" cy="22" r="16" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
      <circle cx="22" cy="30" r="12" fill="#16a34a" stroke="#15803d" strokeWidth="1.3" />
      <circle cx="42" cy="30" r="12" fill="#4ade80" stroke="#15803d" strokeWidth="1.3" />
      <circle cx="28" cy="18" r="3" fill="#86efac" opacity="0.8" />
    </svg>
  )
}

export function FlatClayHouseIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('inline-block select-none shrink-0', className)}>
      {/* Thân nhà */}
      <rect x="14" y="28" width="36" height="28" rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      {/* Mái ngói đỏ cam */}
      <path d="M 8 30 L 32 10 L 56 30 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="1.6" strokeLinejoin="round" />
      {/* Cửa vòm gỗ */}
      <path d="M 26 56 L 26 42 C 26 39 30 36 32 36 C 34 36 38 39 38 42 L 38 56 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.2" />
      <circle cx="35" cy="46" r="1.2" fill="#facc15" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT CHÍNH: <CreativeBlockIcon />
// ════════════════════════════════════════════════════════════════════════════
/**
 * Component hiển thị icon vector SVG 2D Flat Soft Clay KHÔNG NỀN (transparent background),
 * KHÔNG CÓ HỘP BỌC, to rõ, sắc nét, dải màu gradient ấm áp chuẩn Hallmark UI.
 */
export const CreativeBlockIcon: React.FC<CreativeBlockIconProps> = ({
  icon,
  label = '',
  size = 28,
  className = '',
}) => {
  const normLabel = label.toLowerCase().trim()
  const normIcon = (icon || '').trim()

  // 1. Cốc Sứ / Sứ Trắng / Trà Chiều (Món 1)
  if (
    normLabel.includes('cốc') ||
    normLabel.includes('sứ trắng') ||
    normLabel.includes('quai tròn') ||
    normLabel.includes('đĩa lót') ||
    normLabel.includes('tách trà') ||
    normIcon === '☕' ||
    normIcon === '🍵'
  ) {
    return <FlatClayTeacup size={size} className={className} />
  }

  // 2. Xe Đạp / Bánh Nan Hoa / Giỏ Mây (Món 2)
  if (
    normLabel.includes('xe đạp') ||
    normLabel.includes('bicycle') ||
    normLabel.includes('bánh nan hoa') ||
    normLabel.includes('giỏ mây') ||
    normLabel.includes('chuông xe') ||
    normIcon === '🚲'
  ) {
    return <FlatClayBicycle size={size} className={className} />
  }

  // 3. Sổ Tay / Bìa Da / Mở Trang Vẽ (Món 3)
  if (
    !normLabel.includes('cửa sổ') &&
    (normLabel.includes('sổ tay') ||
      normLabel.includes('cuốn sổ') ||
      normLabel.includes('notebook') ||
      normLabel.includes('bìa da') ||
      normLabel.includes('trang vẽ') ||
      normLabel.includes('trang giấy') ||
      normLabel.includes('gáy sổ') ||
      normIcon === '📖' ||
      normIcon === '📔' ||
      normIcon === '📕' ||
      normIcon === '📄')
  ) {
    return <FlatClayNotebook size={size} className={className} />
  }

  // 4. Đồng Hồ Cổ / Vỏ Gỗ Mun (Món 4 - Subject & Vỏ)
  if (
    normLabel.includes('đồng hồ cổ') ||
    normLabel.includes('cái đồng hồ') ||
    normLabel.includes('vỏ gỗ mun') ||
    normLabel.includes('vững chãi') ||
    normIcon === '🕰️' ||
    (normIcon === '⏰' && (normLabel.includes('đồng hồ') || normLabel.includes('cổ')))
  ) {
    return <FlatClayVintageClock size={size} className={className} />
  }

  // 5. Mặt Số La Mã Vàng (Món 4 - Color/Shape)
  if (
    normLabel.includes('mặt số') ||
    normLabel.includes('la mã') ||
    normLabel.includes('mặt tròn') ||
    normIcon === '🟡'
  ) {
    return <FlatClaySunDialIcon size={size} className={className} />
  }

  // 6. Kim Đồng Hồ Tích Tắc / Bấm Giờ (Món 4 - Color/Shape & Action)
  if (
    normLabel.includes('kim đồng hồ') ||
    normLabel.includes('tích tắc') ||
    normLabel.includes('đếm từng giây') ||
    normIcon === '⏱️' ||
    (normIcon === '⏰' && normLabel.includes('tích tắc'))
  ) {
    return <FlatClayClockPointerIcon size={size} className={className} />
  }

  // 7. Quả Lắc Đồng Đu Đưa / Điểm Chuông (Món 4 - Color/Shape & Action)
  if (
    normLabel.includes('quả lắc') ||
    normLabel.includes('đu đưa') ||
    normLabel.includes('điểm chuông') ||
    normLabel.includes('chuông ngân') ||
    normIcon === '🔔' ||
    normIcon === '🎵'
  ) {
    return <FlatClayPendulumBellIcon size={size} className={className} />
  }

  // 8. Chân Đế Chạm Hoa / Cúc Họa Mi (Món 4 & Món 1)
  if (
    normLabel.includes('chạm hoa') ||
    normLabel.includes('bông hoa') ||
    normLabel.includes('hoa cúc') ||
    normLabel.includes('hoa sen') ||
    normIcon === '🌺' ||
    normIcon === '🌸' ||
    normIcon === '🌼'
  ) {
    return <FlatClayFloralIcon size={size} className={className} />
  }

  // 9. Treo Trên Tường Gạch (Món 4 - Context)
  if (
    normLabel.includes('tường gạch') ||
    normLabel.includes('bức tường') ||
    normIcon === '🧱'
  ) {
    return <FlatClayBrickWallIcon size={size} className={className} />
  }

  // 10. Trên Lò Sưởi Ấm Áp (Món 4 - Context)
  if (
    normLabel.includes('lò sưởi') ||
    normLabel.includes('ngọn lửa') ||
    normIcon === '🔥'
  ) {
    return <FlatClayFireplaceIcon size={size} className={className} />
  }

  // 11. Trên Kệ Sách Phòng Khách (Món 4 & Món 3 - Context)
  if (
    normLabel.includes('kệ sách') ||
    normLabel.includes('thư viện') ||
    normIcon === '📚'
  ) {
    return <FlatClayBookshelfIcon size={size} className={className} />
  }

  // 12. Bên Cửa Sổ Nhìn Ra Vườn (Món 4 - Context)
  if (
    normLabel.includes('cửa sổ') ||
    normLabel.includes('bậu cửa') ||
    normIcon === '🪟'
  ) {
    return <FlatClayWindowIcon size={size} className={className} />
  }

  // 13. Phản Chiếu Nắng Chiều / Lấp Lánh / Bụi Sao (Món 4 - Action)
  if (
    normLabel.includes('phản chiếu') ||
    normLabel.includes('nắng chiều') ||
    normLabel.includes('lấp lánh') ||
    normLabel.includes('ánh sáng') ||
    normIcon === '✨' ||
    normIcon === '💫' ||
    normIcon === '⭐'
  ) {
    return <FlatClaySparkles size={size} className={className} />
  }

  // 14. Bút Chì Gỗ (Món 3)
  if (
    normLabel.includes('bút chì') ||
    normLabel.includes('bút') ||
    normIcon === '✏️'
  ) {
    return <FlatClayPencilIcon size={size} className={className} />
  }

  // 15. Tán Cây Râm Mát (Món 3 - Context)
  if (
    normLabel.includes('tán cây') ||
    normLabel.includes('cây xanh') ||
    normIcon === '🌳' ||
    normIcon === '🌲'
  ) {
    return <FlatClayTreeIcon size={size} className={className} />
  }

  // 16. Trước Hiên Nhà (Món 2 - Context)
  if (
    normLabel.includes('hiên nhà') ||
    normLabel.includes('ngôi nhà') ||
    normIcon === '🏡' ||
    normIcon === '🏠'
  ) {
    return <FlatClayHouseIcon size={size} className={className} />
  }

  // 17. Nếu là emoji đơn thuần khác, render to rõ nét không bị lọt thỏm
  if (normIcon) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center select-none shrink-0 font-normal leading-none',
          size >= 30 ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl',
          className
        )}
        style={{ width: size, height: size }}
        role="img"
        aria-label={label || 'icon'}
      >
        {normIcon}
      </span>
    )
  }

  // Mặc định fallback là hạt bụi sao lung linh
  return <FlatClaySparkles size={size} className={className} />
}
