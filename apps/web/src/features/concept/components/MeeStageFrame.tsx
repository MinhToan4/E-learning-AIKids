import React, { useId, type ReactNode } from 'react'

export interface MeeStageFrameProps {
  variant?: 'hero' | 'paws-holder' | 'cat-head-peek'
  children?: ReactNode
  pawsAction?: ReactNode
  topSlot?: ReactNode
  footerSlot?: ReactNode
  className?: string
  title?: string
}

export const MeeStageFrame: React.FC<MeeStageFrameProps> = ({
  variant = 'hero',
  children,
  pawsAction,
  topSlot,
  footerSlot,
  className = '',
}) => {
  const shadowId = `mee-frame-shadow-${useId().replace(/:/g, '')}`

  // ──────────────────────────────────────────────────────────────────────────
  // VARIANT: 'cat-head-peek' (Đầu Mèo Mee nhô lên từ trên đỉnh thẻ/khung)
  // ──────────────────────────────────────────────────────────────────────────
  if (variant === 'cat-head-peek') {
    return (
      <div className={`relative flex flex-col items-center pt-8 ${className}`}>
        {/* Animated Peek Head SVG */}
        <div className="absolute top-0 z-20 pointer-events-none w-44 sm:w-52 aspect-[260/120] -translate-y-1/2">
          <svg
            className="w-full h-full drop-shadow-md overflow-visible"
            viewBox="0 0 260 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="peekEarLeft" x1="20" y1="0" x2="60" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF960B" />
                <stop offset="1" stopColor="#E05A00" />
              </linearGradient>
              <linearGradient id="peekEarRight" x1="240" y1="0" x2="200" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF960B" />
                <stop offset="1" stopColor="#E05A00" />
              </linearGradient>
              <linearGradient id="peekEarInner" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#FF7676" />
                <stop offset="1" stopColor="#FFAEAE" />
              </linearGradient>
              <linearGradient id="peekHeadBody" x1="130" y1="20" x2="130" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="0.7" stopColor="#FCF6EB" />
                <stop offset="1" stopColor="#EFD3A0" />
              </linearGradient>
            </defs>

            <style>{`
              @keyframes peekEarTwitchL {
                0%, 90%, 100% { transform: rotate(0deg); }
                93% { transform: rotate(-6deg); }
                96% { transform: rotate(2deg); }
              }
              .animate-peek-ear-left {
                transform-origin: 45px 50px;
                animation: peekEarTwitchL 6s ease-in-out infinite;
              }
              @keyframes peekEarTwitchR {
                0%, 92%, 100% { transform: rotate(0deg); }
                95% { transform: rotate(6deg); }
                98% { transform: rotate(-2deg); }
              }
              .animate-peek-ear-right {
                transform-origin: 215px 50px;
                animation: peekEarTwitchR 7s ease-in-out infinite;
              }
              @keyframes peekEyeBlink {
                0%, 95%, 100% { transform: scaleY(1); }
                97.5% { transform: scaleY(0.1); }
              }
              .animate-peek-eyes {
                transform-origin: 130px 80px;
                animation: peekEyeBlink 5s ease-in-out infinite;
              }
            `}</style>

            {/* Left Ear */}
            <g className="animate-peek-ear-left">
              <path d="M25 55 C15 30 25 5 45 10 L70 35 L45 65 Z" fill="url(#peekEarLeft)" />
              <path d="M32 50 C26 34 33 18 45 22 L62 38 L45 56 Z" fill="url(#peekEarInner)" />
            </g>

            {/* Right Ear */}
            <g className="animate-peek-ear-right">
              <path d="M235 55 C245 30 235 5 215 10 L190 35 L215 65 Z" fill="url(#peekEarRight)" />
              <path d="M228 50 C234 34 227 18 215 22 L198 38 L215 56 Z" fill="url(#peekEarInner)" />
            </g>

            {/* Head Dome */}
            <path d="M35 120 C35 60 75 40 130 40 C185 40 225 60 225 120 Z" fill="url(#peekHeadBody)" />

            {/* Orange forehead patch */}
            <path d="M190 48 C165 42 145 55 130 65 C150 72 175 68 190 48 Z" fill="#FF960B" />

            {/* Eyes */}
            <g className="animate-peek-eyes">
              <path d="M92 82 C92 76 98 72 105 72 C112 72 118 76 118 82" stroke="#8E3817" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M142 82 C142 76 148 72 155 72 C162 72 168 76 168 82" stroke="#8E3817" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </g>

            {/* Cute Nose */}
            <polygon points="130,92 124,86 136,86" fill="#FFAEAE" />

            {/* Rosy Cheeks */}
            <ellipse cx="80" cy="90" rx="9" ry="5" fill="#FDA4AF" opacity="0.6" />
            <ellipse cx="180" cy="90" rx="9" ry="5" fill="#FDA4AF" opacity="0.6" />

            {/* Two Paws holding the edge */}
            <g>
              {/* Left Paw */}
              <ellipse cx="60" cy="115" rx="18" ry="11" fill="url(#peekEarLeft)" />
              <circle cx="53" cy="112" r="3" fill="#E05A00" />
              <circle cx="60" cy="110" r="3" fill="#E05A00" />
              <circle cx="67" cy="112" r="3" fill="#E05A00" />

              {/* Right Paw */}
              <ellipse cx="200" cy="115" rx="18" ry="11" fill="url(#peekEarRight)" />
              <circle cx="193" cy="112" r="3" fill="#E05A00" />
              <circle cx="200" cy="110" r="3" fill="#E05A00" />
              <circle cx="207" cy="112" r="3" fill="#E05A00" />
            </g>
          </svg>
        </div>

        {/* Content beneath the peeking head */}
        <div className="w-full relative z-10">{children}</div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VARIANT: 'paws-holder' (Hai bàn tay Mèo Mee ôm đỡ lấy card/canvas)
  // ──────────────────────────────────────────────────────────────────────────
  if (variant === 'paws-holder') {
    return (
      <div className={`relative w-full ${className}`}>
        {/* Wrapped Content */}
        <div className="relative z-10">{children}</div>

        {/* Cute Soft Clay Cat Paws Holding the Bottom Edge */}
        <div className="pointer-events-none relative -mt-4 sm:-mt-6 z-20 w-full flex items-center justify-between px-3 sm:px-8">
          {/* Left Paw */}
          <div className="relative w-16 h-12 sm:w-20 sm:h-14 drop-shadow-md transform -rotate-12 translate-y-1">
            <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="pawGradL" x1="0" y1="0" x2="80" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF960B" />
                  <stop offset="1" stopColor="#E05A00" />
                </linearGradient>
              </defs>
              <ellipse cx="40" cy="32" rx="36" ry="24" fill="url(#pawGradL)" />
              <path d="M16 28 C20 16 32 16 36 28" stroke="#E05A00" strokeWidth="3" strokeLinecap="round" />
              <path d="M38 24 C42 12 54 12 58 24" stroke="#E05A00" strokeWidth="3" strokeLinecap="round" />
              <circle cx="26" cy="36" r="4" fill="#FFAEAE" />
              <circle cx="40" cy="34" r="4" fill="#FFAEAE" />
              <circle cx="54" cy="36" r="4" fill="#FFAEAE" />
            </svg>
          </div>

          {/* Center Action (Nestled between the paws if provided) */}
          {pawsAction && (
            <div className="pointer-events-auto shrink-0 -translate-y-2 z-30">
              {pawsAction}
            </div>
          )}

          {/* Right Paw */}
          <div className="relative w-16 h-12 sm:w-20 sm:h-14 drop-shadow-md transform rotate-12 translate-y-1">
            <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="pawGradR" x1="80" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF960B" />
                  <stop offset="1" stopColor="#E05A00" />
                </linearGradient>
              </defs>
              <ellipse cx="40" cy="32" rx="36" ry="24" fill="url(#pawGradR)" />
              <path d="M22 24 C26 12 38 12 42 24" stroke="#E05A00" strokeWidth="3" strokeLinecap="round" />
              <path d="M44 28 C48 16 60 16 64 28" stroke="#E05A00" strokeWidth="3" strokeLinecap="round" />
              <circle cx="26" cy="36" r="4" fill="#FFAEAE" />
              <circle cx="40" cy="34" r="4" fill="#FFAEAE" />
              <circle cx="54" cy="36" r="4" fill="#FFAEAE" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VARIANT: 'hero' (Mèo Mee khổng lồ ôm trọn màn hình chuẩn trang Login)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative w-full aspect-[5938/4841] max-w-full overflow-visible select-none ${className}`}
      data-testid="mee-stage-frame-hero"
    >
      {/* Background SVG Animation & Cat Chassis */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="-954 0 5938 4841"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        overflow="visible"
      >
        <defs>
          <filter id={shadowId} x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#1e2740" floodOpacity="0.14" />
          </filter>
          <linearGradient id="paint0_mee" x1="4786.22" y1="2552.16" x2="1615.33" y2="4191.07" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF960B" />
            <stop offset="1" stopColor="#E05A00" />
          </linearGradient>
          <linearGradient id="paint1_mee" x1="4376.33" y1="3069.22" x2="4588.11" y2="2198.55" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FAF1E0" />
            <stop offset="0.21" stopColor="#FCF5EA" />
            <stop offset="0.65" stopColor="#FEFDFA" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient id="paint2_mee" x1="1034.4" y1="646.137" x2="416.646" y2="28.4263" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FAF1E0" />
            <stop offset="0.21" stopColor="#FCF5EA" />
            <stop offset="0.65" stopColor="#FEFDFA" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient id="paint3_mee" x1="897.634" y1="723.783" x2="897.634" y2="195.165" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7676" />
            <stop offset="1" stopColor="#FFAEAE" />
          </linearGradient>
          <linearGradient id="paint4_mee" x1="3620.72" y1="56.5151" x2="3003.02" y2="674.226" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF960B" />
            <stop offset="1" stopColor="#E05A00" />
          </linearGradient>
          <linearGradient id="paint5_mee" x1="3123.28" y1="565.989" x2="3354.79" y2="164.94" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7676" />
            <stop offset="1" stopColor="#FFAEAE" />
          </linearGradient>
          <linearGradient id="paint6_mee" x1="2015.13" y1="4840.78" x2="2015.13" y2="155.143" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EFD3A0" />
            <stop offset="0.02" stopColor="#F1D7A9" />
            <stop offset="0.09" stopColor="#F5E4C4" />
            <stop offset="0.17" stopColor="#F9EEDA" />
            <stop offset="0.27" stopColor="#FCF6EB" />
            <stop offset="0.38" stopColor="#FEFBF6" />
            <stop offset="0.55" stopColor="#FFFEFD" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient id="paint7_mee" x1="2015.13" y1="1032.99" x2="2015.13" y2="2513.73" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E24000" />
            <stop offset="0.4" stopColor="#E03F00" />
            <stop offset="0.6" stopColor="#D83D00" />
            <stop offset="0.76" stopColor="#CB3800" />
            <stop offset="0.89" stopColor="#B83100" />
            <stop offset="1" stopColor="#A32A00" />
          </linearGradient>
          <linearGradient id="paint8_mee" x1="1464.29" y1="3240.37" x2="0.0118698" y2="3240.37" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF960B" />
            <stop offset="0.5" stopColor="#FE940B" />
            <stop offset="0.68" stopColor="#FB8D09" />
            <stop offset="0.81" stopColor="#F48207" />
            <stop offset="0.91" stopColor="#EC7104" />
            <stop offset="1" stopColor="#E05A00" />
          </linearGradient>
          <linearGradient id="paint9_mee" x1="2565.96" y1="3240.37" x2="4030.19" y2="3240.37" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF960B" />
            <stop offset="0.5" stopColor="#FE940B" />
            <stop offset="0.68" stopColor="#FB8D09" />
            <stop offset="0.81" stopColor="#F48207" />
            <stop offset="0.91" stopColor="#EC7104" />
            <stop offset="1" stopColor="#E05A00" />
          </linearGradient>
        </defs>

        <style>{`
          @keyframes tailWagHero {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
          }
          .animate-cat-tail-hero {
            transform-origin: 2000px 4200px;
            animation: tailWagHero 5s ease-in-out infinite;
          }
          @keyframes earTwitchLeftHero {
            0%, 90%, 100% { transform: rotate(0deg); }
            92% { transform: rotate(-5deg); }
            94% { transform: rotate(2deg); }
            96% { transform: rotate(-2deg); }
            98% { transform: rotate(0deg); }
          }
          .animate-cat-ear-left-hero {
            transform-origin: 1200px 600px;
            animation: earTwitchLeftHero 6s ease-in-out infinite;
          }
          @keyframes earTwitchRightHero {
            0%, 93%, 100% { transform: rotate(0deg); }
            95% { transform: rotate(5deg); }
            97% { transform: rotate(-2deg); }
            99% { transform: rotate(0deg); }
          }
          .animate-cat-ear-right-hero {
            transform-origin: 2800px 600px;
            animation: earTwitchRightHero 7s ease-in-out infinite;
          }
          @keyframes eyeBlinkHero {
            0%, 95%, 100% { transform: scaleY(1); }
            97.5% { transform: scaleY(0.1); }
          }
          .animate-cat-eyes-hero {
            transform-origin: 2015px 670px;
            animation: eyeBlinkHero 5s ease-in-out infinite;
          }
        `}</style>

        <g filter={`url(#${shadowId})`}>
          {/* Animated Tail */}
          <g className="animate-cat-tail-hero">
            <path d="M1771.36 4123.58C1682.74 3952.97 1762.63 3732.34 1953.61 3620.59L4201.16 2305.2C4473.31 2145.92 4809.17 2216.58 4935.52 2459.78C5061.87 2702.92 4926.64 3018.41 4639.79 3149.51L2287.69 4263.61C2086.45 4355.6 1860.04 4294.19 1771.36 4123.58Z" fill="url(#paint0_mee)"/>
            <path d="M4669.14 3135.26C4659.54 3140.37 4649.89 3144.96 4639.99 3149.51L4631.06 3153.54C4626.41 2989.01 4584.58 2827.66 4508.69 2681.6C4432.81 2535.53 4324.84 2408.54 4192.89 2310.15L4201.31 2305.04C4473.46 2145.77 4809.32 2216.47 4935.67 2459.62C5057.53 2694.55 4935.67 2996.61 4669.14 3135.26Z" fill="url(#paint1_mee)"/>
          </g>

          {/* Left Animated Ear */}
          <g className="animate-cat-ear-left-hero">
            <path d="M425.568 138.807C411.325 45.2842 519.144 -26.5935 619.56 9.49848L914.02 115.171L1434.73 301.961L987.89 599.631L541.045 897.301L467.277 412.841L425.568 138.807Z" fill="url(#paint2_mee)"/>
            <path d="M600.775 276.947C592.352 221.813 655.909 179.493 715.128 200.781L888.7 263.01L1195.41 373.073L932.246 548.428L669.029 723.783L625.535 438.365L600.775 276.947Z" fill="url(#paint3_mee)"/>
          </g>

          {/* Right Animated Ear */}
          <g className="animate-cat-ear-right-hero">
            <path d="M3639.91 138.807C3654.15 45.2842 3546.34 -26.5935 3445.92 9.49848L3151.46 115.171L2630.75 301.961L3077.54 599.631L3524.38 897.301L3598.15 412.841L3639.91 138.807Z" fill="url(#paint4_mee)"/>
            <path d="M3464.71 276.947C3473.08 221.813 3409.57 179.493 3350.35 200.781L3176.78 263.01L2870.07 373.073L3133.29 548.428L3396.55 723.783L3440 438.365L3464.71 276.947Z" fill="url(#paint5_mee)"/>
          </g>

          {/* Cat Dome Body */}
          <path d="M1884.85 155.143H2145.2C2613.99 155.143 3063.58 341.365 3395.07 672.843C3726.55 1004.32 3912.78 1453.9 3912.78 1922.68V4840.78H117.225V1922.73C117.218 1690.61 162.934 1460.75 251.763 1246.3C340.592 1031.84 470.794 836.98 634.935 672.843C799.075 508.706 993.939 378.506 1208.4 289.679C1422.86 200.851 1652.72 155.136 1884.85 155.143Z" fill="url(#paint6_mee)"/>

          {/* Forehead Orange Hair Patch */}
          <path d="M3564.61 869.071C3419.27 961.42 3250.04 1006.45 3056.05 1006.45C2571.07 1006.45 2177.57 665.23 2177.57 244.327C2177.55 214.466 2179.53 184.638 2183.49 155.041C2706.61 171.428 3070.65 376.29 3354.69 630.67C3434.54 702.19 3496.72 776.62 3564.61 869.071Z" fill="#FF960B"/>

          {/* Cat Open Mouth Chamber (Container for children) */}
          <path
            d="M3373.43 1773.36C3373.43 1977.82 3277.91 2162.92 3123.28 2296.88C2968.65 2430.83 2755.72 2513.73 2519.76 2513.73H1510.39C1039.04 2513.73 656.828 2182.27 656.828 1773.52C656.828 1569.06 752.344 1383.96 906.975 1250C961.304 1203.02 1021.34 1163.08 1085.65 1131.11L1133.59 1187.82L1190.25 1254.96C1209.6 1277.83 1250.29 1274 1263.51 1248.01L1302.21 1171.9L1367.4 1043.46C1414.74 1036.6 1462.51 1033.18 1510.34 1033.25H2519.92C2565.32 1033.21 2610.68 1036.33 2655.66 1042.59L2721.41 1172L2760.11 1248.11C2773.28 1274.1 2813.91 1277.93 2833.31 1255.06L2889.98 1187.93L2939.81 1128.91C3198.89 1255.82 3373.43 1496.88 3373.43 1773.36Z"
            fill="url(#paint7_mee)"
          />

          {/* Cute Nose */}
          <path d="M1969.44 950.903C1974.7 956.744 1981.14 961.413 1988.32 964.61C1995.51 967.806 2003.28 969.457 2011.15 969.457C2019.01 969.457 2026.79 967.806 2033.97 964.61C2041.16 961.413 2047.59 956.744 2052.85 950.903L2107.17 891.022L2143.37 851.153C2148.49 845.494 2151.87 838.47 2153.08 830.932C2154.3 823.393 2153.3 815.665 2150.21 808.683C2147.12 801.701 2142.06 795.766 2135.67 791.597C2129.27 787.429 2121.8 785.205 2114.17 785.197L2011.2 779.734L1908.13 785.197C1900.49 785.205 1893.02 787.429 1886.62 791.597C1880.23 795.766 1875.18 801.701 1872.09 808.683C1869 815.665 1868 823.393 1869.21 830.932C1870.42 838.47 1873.8 845.494 1878.93 851.153L1915.12 891.022L1969.44 950.903Z" fill="#FFAEAE"/>

          {/* Animated Blinking Eyes */}
          <g className="animate-cat-eyes-hero">
            <path d="M1541.74 741.497C1534.81 741.249 1528.2 738.545 1523.08 733.869C1517.97 729.193 1514.68 722.849 1513.81 715.973C1502.74 647.515 1448.01 595.547 1382.31 595.547C1316.61 595.547 1261.83 647.515 1250.7 715.973C1249.83 722.849 1246.54 729.193 1241.43 733.869C1236.31 738.545 1229.7 741.249 1222.77 741.497C1205.26 741.497 1191.63 724.345 1194.65 705.508C1209.96 607.595 1288.32 533.113 1382.31 533.113C1476.29 533.113 1554.35 607.595 1569.92 705.508C1572.88 724.345 1559.25 741.497 1541.74 741.497Z" fill="#8E3817"/>
            <path d="M2807.53 741.497C2800.61 741.249 2793.99 738.545 2788.88 733.869C2783.76 729.193 2780.48 722.849 2779.61 715.973C2768.48 647.515 2713.8 595.547 2648.05 595.547C2582.3 595.547 2527.57 647.515 2516.49 715.973C2515.62 722.845 2512.33 729.183 2507.21 733.857C2502.1 738.531 2495.49 741.239 2488.57 741.497C2471.06 741.497 2457.43 724.345 2460.44 705.508C2476.01 607.595 2554.12 533.113 2648.05 533.113C2741.98 533.113 2820.14 607.595 2835.71 705.508C2838.67 724.345 2825.04 741.497 2807.53 741.497Z" fill="#8E3817"/>
          </g>
        </g>
      </svg>

      {/* Top Slot (Header Banner / Portal) */}
      {topSlot && (
        <div className="absolute left-1/2 top-[-3%] sm:top-[-5%] z-20 w-[min(94vw,34rem)] -translate-x-1/2">
          {topSlot}
        </div>
      )}

      {/* Mouth Slot / Main Body Content */}
      <div className="absolute left-1/2 top-[24%] sm:top-[26%] z-20 w-[min(88vw,48%)] max-h-[44%] overflow-y-auto no-scrollbar -translate-x-1/2 p-2">
        {children}
      </div>

      {/* Paws Slot (Holding the main tactile action button) */}
      {pawsAction && (
        <>
          <div className="absolute left-1/2 top-[56%] sm:top-[58%] z-20 w-[min(88vw,56%)] -translate-x-1/2 flex justify-center">
            {pawsAction}
          </div>

          {/* Foreground Paws SVG (Overlapping the button for tactile embracing) */}
          <svg
            className="pointer-events-none absolute inset-0 z-30 h-full w-full"
            viewBox="-954 0 5938 4841"
            fill="none"
            aria-hidden="true"
          >
            <g id="cat-foreground-paws-hero" style={{ transform: 'translateY(-400px)' }}>
              {/* Left Paw Foreground */}
              <path d="M1463.99 3335.07C1463.27 3351.76 1460.87 3368.33 1456.84 3384.54C1455.46 3390.41 1453.83 3396.18 1452.04 3401.94C1450.56 3406.74 1448.88 3411.49 1446.94 3416.24C1444.18 3423.49 1441.06 3430.63 1437.64 3437.58C1410.38 3493.6 1364.13 3538.14 1307.11 3563.26C1305.88 3563.82 1304.66 3564.28 1303.43 3564.74C1292.85 3568.62 1282.26 3572.36 1271.68 3575.97C1079.58 3641.67 986.818 3657.65 771.793 3647.44C504.493 3634.58 348.074 3591.29 130.293 3467.75C88.8392 3444.18 54.7403 3409.56 31.7928 3367.76C8.84536 3325.96 -2.0507 3278.61 0.31814 3230.98L15.3273 2921.62C19.2071 2839.94 116.407 2801.14 176.187 2856.53C364.615 3031.22 520.319 3110.76 797.012 3124.13C910.038 3129.54 905.239 3133.37 1009.69 3107.39C1019.97 3104.67 1029.09 3098.7 1035.68 3090.36C1042.27 3082.02 1045.97 3071.76 1046.24 3061.14V3060.73C1047.71 3031.85 1059.74 3004.51 1080.04 2983.91C1100.34 2963.31 1127.5 2950.89 1156.36 2949C1185.21 2947.11 1213.76 2955.89 1236.58 2973.66C1259.39 2991.44 1274.88 3016.97 1280.1 3045.41C1281.51 3053.49 1284.86 3061.09 1289.88 3067.57C1294.9 3074.05 1301.43 3079.2 1308.9 3082.58C1351.51 3101.77 1388.28 3131.93 1415.44 3169.98L1420.54 3177.43C1426.61 3186.44 1432.05 3195.85 1436.83 3205.61C1437.44 3206.68 1438 3207.8 1438.51 3208.93C1457.36 3248.2 1466.11 3291.56 1463.99 3335.07Z" fill="url(#paint8_mee)"/>
              <path d="M1420.49 3177.07L1415.39 3169.62C1307.72 3181.1 1249.73 3210.46 1226.5 3222.35C1223.79 3223.78 1220.78 3225.21 1219.25 3225.92C1214.74 3226.78 1210.71 3229.24 1207.89 3232.87C1205.08 3236.49 1203.69 3241.02 1203.99 3245.59C1204.28 3250.17 1206.24 3254.48 1209.5 3257.71C1212.75 3260.94 1217.07 3262.88 1221.65 3263.14C1228.34 3263.45 1233.39 3260.89 1243.4 3255.84C1266.17 3244.25 1324.77 3214.49 1436.88 3205.25C1432.07 3195.49 1426.59 3186.08 1420.49 3177.07Z" fill="#E05A00"/>
              <path d="M1295.37 3398.63C1292.36 3398.98 1289.09 3399.49 1287.35 3399.65C1282.91 3399.15 1278.43 3400.26 1274.74 3402.78C1271.04 3405.29 1268.36 3409.04 1267.19 3413.36C1266.02 3417.67 1266.43 3422.27 1268.35 3426.3C1270.27 3430.34 1273.57 3433.56 1277.65 3435.38C1283.88 3437.88 1289.45 3437.07 1300.57 3435.38C1320.69 3432.52 1365.66 3426.14 1437.75 3437.27C1441.17 3430.33 1444.28 3423.18 1447.04 3415.93C1448.88 3411.18 1450.56 3406.44 1452.14 3401.64C1369.54 3388.16 1317.88 3395.41 1295.37 3398.63Z" fill="#E05A00"/>

              {/* Right Paw Foreground */}
              <path d="M2566.27 3335.07C2566.99 3351.76 2569.38 3368.33 2573.42 3384.54C2574.79 3390.41 2576.43 3396.18 2578.21 3401.94C2579.7 3406.74 2581.38 3411.49 2583.32 3416.24C2586.08 3423.49 2589.19 3430.63 2592.61 3437.58C2619.88 3493.6 2666.13 3538.14 2723.15 3563.26C2724.37 3563.82 2725.6 3564.28 2726.82 3564.74C2737.37 3568.62 2747.96 3572.36 2758.58 3575.97C2950.68 3641.67 3043.44 3657.65 3258.46 3647.44C3525.76 3634.58 3682.18 3591.29 3899.96 3467.75C3941.42 3444.18 3975.51 3409.56 3998.46 3367.76C4021.41 3325.96 4032.31 3278.61 4029.94 3230.98L4014.93 2921.62C4011.05 2839.94 3913.85 2801.14 3854.07 2856.53C3665.64 3031.22 3509.94 3110.76 3233.24 3124.13C3120.17 3129.54 3125.02 3133.37 3020.57 3107.39C3010.29 3104.67 3001.17 3098.7 2994.58 3090.36C2987.99 3082.02 2984.28 3071.76 2984.01 3061.14V3060.73C2982.55 3031.85 2970.52 3004.51 2950.22 2983.91C2929.92 2963.31 2902.76 2950.89 2873.9 2949C2845.04 2947.11 2816.49 2955.89 2793.68 2973.66C2770.87 2991.44 2755.38 3016.97 2750.15 3045.41C2748.75 3053.49 2745.39 3061.09 2740.37 3067.57C2735.35 3074.05 2728.83 3079.2 2721.36 3082.58C2678.74 3101.77 2641.98 3131.93 2614.82 3169.98C2613.08 3172.43 2611.45 3175.08 2609.71 3177.43C2603.65 3186.44 2598.21 3195.85 2593.43 3205.61C2592.82 3206.68 2592.25 3207.8 2591.74 3208.93C2572.9 3248.2 2564.14 3291.56 2566.27 3335.07Z" fill="url(#paint9_mee)"/>
              <path d="M2593.48 3205.25C2705.79 3214.49 2764.19 3244.25 2786.96 3255.84C2797.17 3260.94 2802.27 3263.45 2808.71 3263.14C2813.29 3262.88 2817.61 3260.94 2820.86 3257.71C2824.12 3254.48 2826.07 3250.17 2826.37 3245.59C2826.66 3241.02 2825.28 3236.49 2822.46 3232.87C2819.65 3229.24 2815.61 3226.78 2811.11 3225.92C2809.58 3225.21 2806.56 3223.78 2803.86 3222.35C2780.48 3210.51 2722.48 3181.1 2614.97 3169.62C2613.23 3172.07 2611.6 3174.72 2609.87 3177.07C2603.76 3186.08 2598.29 3195.49 2593.48 3205.25Z" fill="#E05A00"/>
              <path d="M2578.21 3401.95C2579.7 3406.74 2581.38 3411.49 2583.32 3416.24C2586.08 3423.49 2589.19 3430.64 2592.61 3437.58C2664.69 3426.45 2709.67 3432.83 2729.78 3435.69C2740.91 3437.22 2746.48 3438.04 2752.71 3435.69C2756.8 3433.87 2760.11 3430.65 2762.03 3426.6C2763.95 3422.56 2764.36 3417.96 2763.18 3413.63C2762 3409.31 2759.31 3405.56 2755.6 3403.05C2751.89 3400.54 2747.4 3399.44 2742.95 3399.95C2741.27 3399.95 2737.85 3399.29 2734.99 3398.93C2712.38 3395.41 2660.71 3388.16 2578.21 3401.95Z" fill="#E05A00"/>
            </g>
          </svg>
        </>
      )}

      {/* Footer Slot */}
      {footerSlot && (
        <div className="absolute left-1/2 top-[76%] z-20 w-[min(90vw,26rem)] -translate-x-1/2">
          {footerSlot}
        </div>
      )}
    </div>
  )
}

export default MeeStageFrame
