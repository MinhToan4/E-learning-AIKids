import React from 'react'

export interface ProgressIconProps {
  size?: number | string
  className?: string
  'aria-label'?: string
}

/**
 * 1. SoftClayStarIcon - Ngôi sao vàng óng ánh 2D Flat Soft Clay
 */
export function SoftClayStarIcon({ size = 28, className, 'aria-label': ariaLabel = 'Ngôi sao vàng' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <radialGradient id={`star-grad-${id}`} cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="55%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
        <filter id={`star-shadow-${id}`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor="#854d0e" floodOpacity="0.35" />
        </filter>
      </defs>
      <path
        d="M24 3.5L29.8 15.6C30.2 16.4 31 17 31.9 17.1L45 18.9C47.2 19.2 48 22 46.4 23.5L36.8 32.5C36.1 33.1 35.8 34.1 36 35L38.4 48C38.8 50.2 36.4 51.9 34.4 50.8L22.9 44.5C22.1 44.1 21.1 44.1 20.3 44.5L8.8 50.8C6.8 51.9 4.4 50.2 4.8 48L7.2 35C7.4 34.1 7.1 33.1 6.4 32.5L-3.2 23.5C-4.8 22 -4 19.2 -1.8 18.9L11.3 17.1C12.2 17 13 16.4 13.4 15.6L19.2 3.5C20.2 1.5 23 1.5 24 3.5Z"
        transform="scale(0.85) translate(4, 3)"
        fill={`url(#star-grad-${id})`}
        stroke="#ca8a04"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter={`url(#star-shadow-${id})`}
      />
      {/* Vệt phản quang men gốm Soft Clay */}
      <ellipse cx="21" cy="16" rx="4" ry="2.2" transform="rotate(-25 21 16)" fill="white" opacity="0.65" />
      <circle cx="26" cy="18" r="1.2" fill="white" opacity="0.8" />
    </svg>
  )
}

/**
 * 2. SoftClayFlagIcon - Cột cờ trạm thám hiểm 2D Flat Soft Clay
 */
export function SoftClayFlagIcon({ size = 28, className, 'aria-label': ariaLabel = 'Lá cờ trạm học' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient id={`flag-grad-${id}`} x1="12" y1="8" x2="38" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id={`flag-shadow-${id}`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#065f46" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Trụ cờ gốm vững chãi */}
      <rect x="10" y="8" width="4" height="34" rx="2" fill="#94a3b8" />
      <circle cx="12" cy="7" r="3.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      {/* Đế cờ Soft Clay */}
      <ellipse cx="12" cy="42" rx="6" ry="2.5" fill="#64748b" />
      {/* Lá cờ uốn lượn mềm mại */}
      <path
        d="M14 10C22 8 26 14 36 12C38 11.6 39.5 13 39.5 15V24C39.5 25.8 38 27 36 27.5C26 29 22 23 14 25.5V10Z"
        fill={`url(#flag-grad-${id})`}
        stroke="#047857"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter={`url(#flag-shadow-${id})`}
      />
      {/* Vệt sáng Soft clay trên lá cờ */}
      <path
        d="M17 13C22 11.5 25 15.5 32 14.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  )
}

/**
 * 3. SoftClayFireIcon - Ngọn lửa chuỗi ngày học liên tục (Streak Flame) Soft Clay
 */
export function SoftClayFireIcon({ size = 28, className, 'aria-label': ariaLabel = 'Chuỗi ngày học liên tục' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <radialGradient id={`fire-outer-${id}`} cx="50%" cy="65%" r="55%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="60%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#e11d48" />
        </radialGradient>
        <radialGradient id={`fire-inner-${id}`} cx="50%" cy="65%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
        <filter id={`fire-shadow-${id}`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#9f1239" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Vỏ ngọn lửa ngoài */}
      <path
        d="M24 4C26.5 11 36 15 37 25C38 34.5 31.5 44 24 44C16.5 44 10 34.5 11 25C11.5 20.5 15 15.5 17 11.5C18.5 16 21 18 22.5 16C24.5 13.5 23 8.5 24 4Z"
        fill={`url(#fire-outer-${id})`}
        stroke="#be123c"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter={`url(#fire-shadow-${id})`}
      />
      {/* Lõi ngọn lửa vàng cam ấm áp */}
      <path
        d="M24 19C26 23.5 30 26.5 30 32C30 36.5 27 40 24 40C21 40 18 36.5 18 32C18 29.5 20 26 21 23C21.8 25 23 26 23.5 25C24.2 23.5 23.5 21 24 19Z"
        fill={`url(#fire-inner-${id})`}
      />
      {/* Điểm phản quang men gốm Soft Clay */}
      <ellipse cx="19" cy="24" rx="2.5" ry="5" transform="rotate(-15 19 24)" fill="white" opacity="0.45" />
    </svg>
  )
}

/**
 * 4. SoftClayTrophyIcon - Cúp vàng cấp độ thám hiểm Soft Clay
 */
export function SoftClayTrophyIcon({ size = 28, className, 'aria-label': ariaLabel = 'Cúp cấp độ thám hiểm' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient id={`trophy-grad-${id}`} x1="12" y1="6" x2="36" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id={`trophy-shadow-${id}`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="1.8" floodColor="#78350f" floodOpacity="0.28" />
        </filter>
      </defs>
      {/* Quai cúp trái & phải */}
      <path
        d="M15 12C9 12 7 19 9 24C11 28 15 29 17 28"
        stroke="#d97706"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M33 12C39 12 41 19 39 24C37 28 33 29 31 28"
        stroke="#d97706"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Thân cúp */}
      <path
        d="M14 6H34C34 6 35 18 31 25C28 30 25.5 32 24 32C22.5 32 20 30 17 25C13 18 14 6 14 6Z"
        fill={`url(#trophy-grad-${id})`}
        stroke="#b45309"
        strokeWidth="1.5"
        filter={`url(#trophy-shadow-${id})`}
      />
      {/* Chân cúp & Bệ gốm Soft Clay */}
      <path d="M22 32H26V37H22V32Z" fill="#d97706" stroke="#b45309" strokeWidth="1" />
      <rect x="16" y="37" width="16" height="6" rx="3" fill="#6d5efc" stroke="#4f46e5" strokeWidth="1.2" />
      {/* Điểm phản quang men gốm */}
      <ellipse cx="20" cy="14" rx="2.5" ry="4.5" transform="rotate(-18 20 14)" fill="white" opacity="0.6" />
      <circle cx="28" cy="18" r="1.5" fill="white" opacity="0.75" />
    </svg>
  )
}

/**
 * 5. SoftClayLockIcon - Ổ khóa thạch cao Soft Clay
 */
export function SoftClayLockIcon({ size = 24, className, 'aria-label': ariaLabel = 'Chưa mở khóa' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <radialGradient id={`lock-grad-${id}`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>
        <filter id={`lock-shadow-${id}`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#334155" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Càng khóa */}
      <path
        d="M17 22V15C17 10.5 20.1 7 24 7C27.9 7 31 10.5 31 15V22"
        stroke="#64748b"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Thân ổ khóa */}
      <rect
        x="13"
        y="21"
        width="22"
        height="20"
        rx="6"
        fill={`url(#lock-grad-${id})`}
        stroke="#475569"
        strokeWidth="1.5"
        filter={`url(#lock-shadow-${id})`}
      />
      {/* Lỗ khóa */}
      <circle cx="24" cy="29" r="2.2" fill="#334155" />
      <path d="M23 30.5L22.5 35H25.5L25 30.5H23Z" fill="#334155" />
      {/* Vệt phản quang */}
      <circle cx="18" cy="26" r="1.5" fill="white" opacity="0.6" />
    </svg>
  )
}

/**
 * 6. SoftClayCheckIcon - Dấu kiểm hoàn thành tròn gốm Soft Clay
 */
export function SoftClayCheckIcon({ size = 24, className, 'aria-label': ariaLabel = 'Đã hoàn thành' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <radialGradient id={`check-circle-${id}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="70%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
        <filter id={`check-shadow-${id}`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#065f46" floodOpacity="0.3" />
        </filter>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="20"
        fill={`url(#check-circle-${id})`}
        stroke="#047857"
        strokeWidth="1.5"
        filter={`url(#check-shadow-${id})`}
      />
      {/* Dấu check vát cong mềm */}
      <path
        d="M15 24.5L21 30.5L33 17.5"
        stroke="white"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vệt phản quang */}
      <ellipse cx="18" cy="14" rx="4" ry="2" transform="rotate(-30 18 14)" fill="white" opacity="0.55" />
    </svg>
  )
}

/**
 * 7. SoftClaySproutIcon - Hạt mầm ươm chồi (Montessori: Mới nảy mầm)
 */
export function SoftClaySproutIcon({ size = 28, className, 'aria-label': ariaLabel = 'Mới nảy mầm' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <radialGradient id={`seed-grad-${id}`} cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <linearGradient id={`sprout-grad-${id}`} x1="20" y1="12" x2="32" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {/* Hạt mầm đất nặn nâu */}
      <ellipse cx="24" cy="38" rx="8" ry="5" fill={`url(#seed-grad-${id})`} />
      {/* Thân mầm */}
      <path
        d="M24 36C24 26 21 21 16 18C21 17 28 20 28 36"
        fill={`url(#sprout-grad-${id})`}
        stroke="#059669"
        strokeWidth="1.2"
      />
      {/* Lá mầm nhỏ uốn cong */}
      <path
        d="M17 19C15 13 20 10 24 12C23 15 20 19 17 19Z"
        fill="#34d399"
        stroke="#047857"
        strokeWidth="1.2"
      />
      <ellipse cx="20" cy="14" rx="1.5" ry="3" transform="rotate(-30 20 14)" fill="white" opacity="0.6" />
    </svg>
  )
}

/**
 * 8. SoftClayPlantIcon - Chồi non vươn cao (Montessori: Đang lớn lên)
 */
export function SoftClayPlantIcon({ size = 28, className, 'aria-label': ariaLabel = 'Đang lớn lên' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient id={`plant-leaf-left-${id}`} x1="12" y1="14" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id={`plant-leaf-right-${id}`} x1="24" y1="10" x2="38" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Thân cây */}
      <path
        d="M24 42V18"
        stroke="#10b981"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Lá bên trái */}
      <path
        d="M24 28C16 28 11 20 13 14C19 14 23 21 24 28Z"
        fill={`url(#plant-leaf-left-${id})`}
        stroke="#0369a1"
        strokeWidth="1.2"
      />
      {/* Lá bên phải */}
      <path
        d="M24 22C32 22 37 13 34 8C28 8 25 15 24 22Z"
        fill={`url(#plant-leaf-right-${id})`}
        stroke="#047857"
        strokeWidth="1.2"
      />
      {/* Điểm nhấn phản quang */}
      <circle cx="18" cy="18" r="1.5" fill="white" opacity="0.6" />
      <circle cx="30" cy="13" r="1.5" fill="white" opacity="0.6" />
    </svg>
  )
}

/**
 * 9. SoftClayFlowerIcon - Bông hoa tỏa sáng (Montessori: Đã tỏa sáng)
 */
export function SoftClayFlowerIcon({ size = 28, className, 'aria-label': ariaLabel = 'Đã tỏa sáng' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <radialGradient id={`flower-petal-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="80%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#db2777" />
        </radialGradient>
        <radialGradient id={`flower-center-${id}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      {/* 5 cánh hoa tròn béo Soft Clay */}
      <circle cx="24" cy="13" r="7.5" fill={`url(#flower-petal-${id})`} stroke="#be185d" strokeWidth="1" />
      <circle cx="34" cy="20" r="7.5" fill={`url(#flower-petal-${id})`} stroke="#be185d" strokeWidth="1" />
      <circle cx="30" cy="32" r="7.5" fill={`url(#flower-petal-${id})`} stroke="#be185d" strokeWidth="1" />
      <circle cx="18" cy="32" r="7.5" fill={`url(#flower-petal-${id})`} stroke="#be185d" strokeWidth="1" />
      <circle cx="14" cy="20" r="7.5" fill={`url(#flower-petal-${id})`} stroke="#be185d" strokeWidth="1" />
      {/* Nhụy hoa vàng óng */}
      <circle cx="24" cy="24" r="7.5" fill={`url(#flower-center-${id})`} stroke="#d97706" strokeWidth="1.2" />
      {/* Vệt phản quang nhụy */}
      <circle cx="22" cy="22" r="2" fill="white" opacity="0.65" />
    </svg>
  )
}

/**
 * 10. SoftClayRocketIcon - Tên lửa thám hiểm Soft Clay cho nút CTA
 */
export function SoftClayRocketIcon({ size = 22, className, 'aria-label': ariaLabel = 'Tên lửa vào học' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient id={`rocket-body-${id}`} x1="16" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      {/* Lửa đuôi */}
      <path d="M16 38L10 44L18 42L20 46L24 38" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      {/* Cánh trái & phải */}
      <path d="M12 28L6 34L14 36" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
      <path d="M28 20L36 22L34 30" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" />
      {/* Thân tên lửa */}
      <path
        d="M36 8C36 8 38 18 32 26C26 34 18 36 18 36L12 30C12 30 14 22 22 16C30 10 36 8 36 8Z"
        fill={`url(#rocket-body-${id})`}
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      {/* Mũi đỏ */}
      <path
        d="M36 8C36 8 34 14 30 18L30 10C33 9 36 8 36 8Z"
        fill="#f43f5e"
      />
      {/* Cửa sổ vòm tròn xanh */}
      <circle cx="26" cy="18" r="3.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
      <circle cx="25" cy="17" r="1" fill="white" opacity="0.8" />
    </svg>
  )
}

/**
 * 11. SoftClayClockIcon - Đồng hồ rèn luyện Soft Clay cho chỉ số giờ học
 */
export function SoftClayClockIcon({ size = 28, className, 'aria-label': ariaLabel = 'Thời lượng học tập' }: ProgressIconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <radialGradient id={`clock-grad-${id}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
        <filter id={`clock-shadow-${id}`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor="#0369a1" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Thân đồng hồ tròn Soft Clay */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill={`url(#clock-grad-${id})`}
        stroke="#0284c7"
        strokeWidth="1.5"
        filter={`url(#clock-shadow-${id})`}
      />
      {/* Vành trong */}
      <circle cx="24" cy="24" r="16" fill="white" opacity="0.9" />
      {/* Các vạch giờ 12, 3, 6, 9 */}
      <circle cx="24" cy="12" r="1.5" fill="#0284c7" />
      <circle cx="36" cy="24" r="1.5" fill="#0284c7" />
      <circle cx="24" cy="36" r="1.5" fill="#0284c7" />
      <circle cx="12" cy="24" r="1.5" fill="#0284c7" />
      {/* Kim giờ & kim phút Soft Clay */}
      <path d="M24 24L24 15" stroke="#0369a1" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M24 24L31 24" stroke="#0284c7" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      {/* Vệt phản quang */}
      <ellipse cx="18" cy="14" rx="4" ry="2" transform="rotate(-30 18 14)" fill="white" opacity="0.6" />
    </svg>
  )
}
