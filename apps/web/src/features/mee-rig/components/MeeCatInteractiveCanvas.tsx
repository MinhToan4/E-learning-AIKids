import React, { useEffect, useRef, useState } from 'react'
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas'
import { cn } from '@/shared/lib/cn'

export type MeeCatState = 'idle' | 'look' | 'hint' | 'celebrate' | 'eat' | 'sleepy'
export type MeeCatVariant = 'half-body' | 'full-body'

export interface MeeCatInteractiveCanvasProps {
  state?: MeeCatState
  variant?: MeeCatVariant
  showBones?: boolean
  earAngle?: number
  tailWiggle?: number
  breathingSpeed?: number
  isBlinking?: boolean
  quote?: string
  engineMode?: 'svg-rig' | 'rive'
  transparentBackground?: boolean
  className?: string
  onQuoteChange?: (quote: string) => void
}

const ASMO_HINTS = [
  'Mèo Mee gợi ý: Con hãy đọc kỹ đề bài và thực hiện từng phép tính nhé!',
  'Mèo Mee gợi ý: Quan sát quy luật dãy số để tìm số tiếp theo thật nhanh nào!',
  'Mèo Mee gợi ý: Con hãy thử chia nhỏ hình vẽ phức tạp thành các hình quen thuộc nhé!',
  'Mèo Mee vỗ tay khen ngợi: Bé làm bài xuất sắc lắm, tiếp tục phát huy nha! 🐾✨',
]

export function MeeCatInteractiveCanvas({
  state = 'idle',
  variant = 'full-body',
  showBones = false,
  earAngle = 0,
  tailWiggle = 0,
  breathingSpeed = 1,
  isBlinking = false,
  quote,
  engineMode = 'svg-rig',
  transparentBackground = false,
  className,
}: MeeCatInteractiveCanvasProps) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [internalBlink, setInternalBlink] = useState(false)
  const [chewFrame, setChewFrame] = useState(0)
  const [tailFrame, setTailFrame] = useState(0)
  const [celebrateStep, setCelebrateStep] = useState(0)
  const [sleepyNod, setSleepyNod] = useState(0)
  const [breathePhase, setBreathePhase] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Rive Engine Fallback / Runtime
  const layout = new Layout({ fit: Fit.Contain, alignment: Alignment.Center })
  const { RiveComponent } = useRive({
    src: '/assets/mee/mee-cat-rig-v1.riv',
    stateMachines: 'MeeCatController',
    autoplay: true,
    layout,
  })

  // Mouse move tracker for Look-At-Cursor mode
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)))
      const deltaY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)))
      setCursorPos({ x: deltaX * 24, y: deltaY * 18 })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Natural Blinking Interval
  useEffect(() => {
    if (state === 'sleepy') return
    const blinkInterval = setInterval(() => {
      setInternalBlink(true)
      setTimeout(() => setInternalBlink(false), 180)
    }, 3800)
    return () => clearInterval(blinkInterval)
  }, [state])

  // Breathing loop
  useEffect(() => {
    const speed = state === 'sleepy' ? 2200 : 1500 / breathingSpeed
    const breatheInterval = setInterval(() => {
      setBreathePhase((prev) => (prev === 0 ? 1 : 0))
    }, speed)
    return () => clearInterval(breatheInterval)
  }, [breathingSpeed, state])

  // 1. CELEBRATE JUMP & SQUAT LOOP (4 Phases: 0=Squat, 1=Jump Up, 2=Peak Air, 3=Land)
  useEffect(() => {
    if (state !== 'celebrate') return
    const jumpInterval = setInterval(() => {
      setCelebrateStep((prev) => (prev + 1) % 4)
    }, 190)
    return () => clearInterval(jumpInterval)
  }, [state])

  // 2. EATING & MUNCHING LOOP (Chewing mouth + hand movement)
  useEffect(() => {
    if (state !== 'eat') return
    const chewInterval = setInterval(() => {
      setChewFrame((prev) => (prev + 1) % 4)
    }, 280)
    return () => clearInterval(chewInterval)
  }, [state])

  // 3. SLEEPY DROOPING & NODDING LOOP (Gật gà gật gù)
  useEffect(() => {
    if (state !== 'sleepy') return
    const sleepyInterval = setInterval(() => {
      setSleepyNod((prev) => (prev + 1) % 6)
    }, 600)
    return () => clearInterval(sleepyInterval)
  }, [state])

  // Tail waving rhythm
  useEffect(() => {
    const tailInterval = setInterval(() => {
      setTailFrame((prev) => (prev + 1) % 4)
    }, state === 'celebrate' ? 140 : 350)
    return () => clearInterval(tailInterval)
  }, [state])

  const shouldBlink = isBlinking || internalBlink || state === 'sleepy'
  const activeQuote = quote?.trim() || ''

  // Transform Computations for Skeletal Joints
  const headLookX = state === 'look' || isHovered ? cursorPos.x : 0
  const headLookY = state === 'look' || isHovered ? cursorPos.y : 0

  // Sleepy head nod progression
  const sleepyHeadDrop = state === 'sleepy' ? [0, 20, 45, 65, 35, 10][sleepyNod] : 0
  const sleepyHeadRot = state === 'sleepy' ? [0, 3, 7, 10, 5, 2][sleepyNod] : 0
  const headRotation = (headLookX * 0.45) + sleepyHeadRot

  // Ear rotations with FIXED BASE PIVOTS (750, 750) and (3300, 750)
  const sleepyEarDroop = state === 'sleepy' ? 18 : 0
  const leftEarRot = -earAngle + sleepyEarDroop + (state === 'celebrate' ? (celebrateStep % 2 === 0 ? -14 : 8) : state === 'look' ? headLookX * 0.25 : 0)
  const rightEarRot = earAngle - sleepyEarDroop + (state === 'celebrate' ? (celebrateStep % 2 === 0 ? 14 : -8) : state === 'look' ? headLookX * 0.25 : 0)

  // Tail animations
  const tailBaseRot = tailWiggle + (state === 'celebrate' ? [-25, 30, -20, 25][tailFrame] : state === 'sleepy' ? -18 : [0, 8, -6, 6][tailFrame])

  // Celebrate Jump displacement values
  const jumpY = state === 'celebrate' ? [35, -160, -130, 20][celebrateStep] : 0
  const jumpLegScaleY = state === 'celebrate' ? [0.85, 1.15, 1.05, 0.9][celebrateStep] : 1

  // Arm positions
  // Eating state: Left arm brings the fish right up to the wide open mouth!
  const leftArmRot = state === 'hint'
    ? -45
    : state === 'celebrate'
    ? [-35, -75, -60, -25][celebrateStep]
    : state === 'eat'
    ? [-15, -65, -35, -15][chewFrame]
    : 0

  const rightArmRot = state === 'celebrate'
    ? [35, 75, 60, 25][celebrateStep]
    : state === 'eat'
    ? [10, 25, 15, 5][chewFrame]
    : 0

  const leftArmTranslateY = state === 'eat' ? [0, -240, -60, 0][chewFrame] : 0
  const leftArmTranslateX = state === 'eat' ? [0, 140, 40, 0][chewFrame] : 0

  if (engineMode === 'rive') {
    return (
      <div className="relative flex aspect-[834/711] w-full max-w-[680px] items-center justify-center rounded-[2.5rem] bg-gradient-to-b from-amber-50 to-orange-50/40 p-4 shadow-clay">
        <RiveComponent className="h-full w-full" aria-label="Mee Cat Rive Engine Canvas" />
        <div className="absolute bottom-3 left-4 rounded-xl bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          Rive Canvas Runtime Mode (v1)
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative flex aspect-square select-none items-center justify-center transition-all duration-500',
        transparentBackground
          ? 'w-full bg-transparent p-0'
          : 'w-full max-w-[680px] rounded-[2.5rem] bg-gradient-to-b from-amber-50/90 via-sky-50/30 to-orange-100/50 p-2 sm:p-4 shadow-clay',
        className,
      )}
    >
      {/* Interactive Speech Bubble for Mascot Hints */}
      {activeQuote && (
        <div className="absolute bottom-[95%] left-1/2 z-30 min-w-[180px] max-w-xs w-max -translate-x-1/2 rounded-2xl border-2 border-amber-300 bg-white/95 p-3 text-xs font-black text-slate-800 shadow-clay backdrop-blur animate-in fade-in slide-in-from-bottom-2 sm:text-sm">
          <div className="flex items-center gap-1.5 font-extrabold text-amber-600">
            <span>🐾 Mèo Mee</span>
            <span className="text-[10px] uppercase tracking-wider text-amber-400">Trợ giảng AI</span>
          </div>
          <p className="mt-1 leading-snug">{activeQuote}</p>
          <div className="absolute -bottom-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-amber-300 bg-white" />
        </div>
      )}



      {/* =========================================================================
          VARIANT 1: FULL BODY RIG (FROM Group 1.svg: ViewBox 0 0 4983 5579)
      ========================================================================= */}
      {variant === 'full-body' ? (
        <svg
          viewBox="0 0 4983 5579"
          className="h-full w-full drop-shadow-lg transition-transform duration-200 ease-out"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Mèo Mee Full Body Rig"
          style={{
            transform: `translateY(${jumpY * 0.4}px)`,
          }}
        >
          <defs>
            <linearGradient id="fb-paint0_linear" x1="4795.89" y1="2541.93" x2="1624.95" y2="4180.87" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF960B" />
              <stop offset="1" stopColor="#E05A00" />
            </linearGradient>
            <linearGradient id="fb-paint1_linear" x1="4385.95" y1="3059.02" x2="4597.73" y2="2188.34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FAF1E0" />
              <stop offset="0.65" stopColor="#FEFDFA" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <linearGradient id="fb-paint2_linear" x1="2839.2" y1="5579" x2="2839.2" y2="3799.67" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF960B" />
              <stop offset="1" stopColor="#E05A00" />
            </linearGradient>
            <linearGradient id="fb-paint3_linear" x1="1191.03" y1="5579" x2="1191.03" y2="3799.67" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF960B" />
              <stop offset="1" stopColor="#E05A00" />
            </linearGradient>
            <linearGradient id="fb-paint4_linear" x1="1034.36" y1="646.137" x2="416.661" y2="28.4265" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FAF1E0" />
              <stop offset="0.65" stopColor="#FEFDFA" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <linearGradient id="fb-paint5_linear" x1="897.647" y1="723.783" x2="897.647" y2="195.165" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF7676" />
              <stop offset="1" stopColor="#FFAEAE" />
            </linearGradient>
            <linearGradient id="fb-paint6_linear" x1="3620.68" y1="56.5151" x2="3002.98" y2="674.226" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF960B" />
              <stop offset="1" stopColor="#E05A00" />
            </linearGradient>
            <linearGradient id="fb-paint7_linear" x1="3123.29" y1="565.989" x2="3354.8" y2="164.94" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF7676" />
              <stop offset="1" stopColor="#FFAEAE" />
            </linearGradient>
            <linearGradient id="fb-paint8_linear" x1="2015.09" y1="4468.57" x2="2015.09" y2="155.143" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EFD3A0" />
              <stop offset="0.27" stopColor="#FCF6EB" />
              <stop offset="0.55" stopColor="#FFFEFD" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <linearGradient id="fb-paint9_linear" x1="2015.09" y1="1032.99" x2="2015.09" y2="2513.73" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E24000" />
              <stop offset="0.6" stopColor="#D83D00" />
              <stop offset="1" stopColor="#A32A00" />
            </linearGradient>
            <linearGradient id="fb-paint10_linear" x1="1464.31" y1="3043.68" x2="0.0265325" y2="3043.68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF960B" />
              <stop offset="1" stopColor="#E05A00" />
            </linearGradient>
            <linearGradient id="fb-paint11_linear" x1="2565.93" y1="3043.68" x2="4030.21" y2="3043.68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF960B" />
              <stop offset="1" stopColor="#E05A00" />
            </linearGradient>
            {/* Golden Fish Biscuit Gradient */}
            <linearGradient id="fish-cookie-grad" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            {/* Sleep Bubble Gradient */}
            <radialGradient id="sleep-bubble-grad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
            </radialGradient>
          </defs>

          {/* --- 1. FULL TAIL BONE (Back layer) --- */}
          <g
            id="full-tail"
            style={{
              transformOrigin: '1953px 3620px',
              transform: `rotate(${tailBaseRot}deg)`,
              transition: state === 'celebrate' ? 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.4s ease-out',
            }}
          >
            <path d="M1771.48 4123.58C1682.8 3952.97 1762.75 3732.34 1953.68 3620.59L4201.12 2305.2C4473.32 2145.92 4809.19 2216.58 4935.54 2459.78C5061.83 2702.92 4926.4 3018.41 4639.8 3149.76L2287.7 4263.61C2086.46 4355.6 1860 4294.19 1771.48 4123.58Z" fill="url(#fb-paint0_linear)" />
            <path d="M4668.95 3135.26C4659.42 3140.23 4649.7 3144.98 4639.8 3149.51L4630.92 3153.54C4626.27 2989.01 4584.44 2827.66 4508.55 2681.6C4432.67 2535.53 4324.7 2408.54 4192.75 2310.15L4201.17 2305.04C4473.32 2145.77 4809.19 2216.47 4935.54 2459.62C5057.49 2694.55 4935.64 2996.61 4668.95 3135.26Z" fill="url(#fb-paint1_linear)" />
          </g>

          {/* --- 2. LEGS BONES (Squatting and jumping) --- */}
          <g
            id="full-legs"
            style={{
              transformOrigin: '2015px 5250px',
              transform: `scaleY(${jumpLegScaleY})`,
              transition: 'transform 0.18s ease-out',
            }}
          >
            <g id="left-leg" style={{ transformOrigin: '1191px 3799px', transform: state === 'celebrate' ? (celebrateStep % 2 === 0 ? 'rotate(-10deg)' : 'rotate(6deg)') : 'none' }}>
              <path d="M402.049 3799.67C402.049 3799.67 833.272 4749.19 941.499 5093.78C870.029 5103.99 796.363 5137.94 765.835 5227.53C697.631 5427.59 1075.05 5595.85 1411.57 5577.62C1559.84 5568.85 1705.11 5532.19 1839.78 5469.55C1881.62 5450.24 1917.06 5419.36 1941.91 5380.55C1966.76 5341.74 1979.98 5296.63 1980.02 5250.55V3863.33L402.049 3799.67Z" fill="url(#fb-paint3_linear)" />
            </g>
            <g id="right-leg" style={{ transformOrigin: '2839px 3799px', transform: state === 'celebrate' ? (celebrateStep % 2 === 0 ? 'rotate(10deg)' : 'rotate(-6deg)') : 'none' }}>
              <path d="M3628.18 3799.67C3628.18 3799.67 3196.96 4749.19 3088.73 5093.78C3160.46 5103.99 3233.87 5137.94 3264.4 5227.53C3332.6 5427.59 2955.19 5595.85 2618.66 5577.62C2470.4 5568.85 2325.12 5532.19 2190.45 5469.55C2148.61 5450.24 2113.17 5419.36 2088.32 5380.55C2063.47 5341.74 2050.25 5296.63 2050.21 5250.55V3863.33L3628.18 3799.67Z" fill="url(#fb-paint2_linear)" />
            </g>
          </g>

          {/* --- 3. MAIN BODY & BELLY --- */}
          <g
            id="full-body"
            style={{
              transformOrigin: '2015px 3000px',
              transform: `translate(${headLookX * 0.2}px, ${(headLookY * 0.2) + (breathePhase * 15)}px)`,
              transition: 'transform 0.4s ease-out',
            }}
          >
            <path d="M1884.81 155.143H2145.17C2377.31 155.109 2607.19 200.805 2821.68 289.62C3036.16 378.436 3231.05 508.631 3395.21 672.771C3559.37 836.911 3689.59 1031.78 3778.44 1246.25C3867.28 1460.72 3913 1690.59 3912.99 1922.73V2917.43C3913 3121.13 3872.89 3322.83 3794.94 3511.02C3716.99 3699.22 3602.74 3870.21 3458.7 4014.25C3314.67 4158.29 3143.67 4272.55 2955.48 4350.5C2767.28 4428.45 2565.58 4468.57 2361.88 4468.57H1668.82C1257.35 4468.52 862.75 4305.03 571.817 4014.06C280.884 3723.1 117.443 3328.49 117.443 2917.02V1922.73C117.429 1453.98 303.621 1004.42 635.062 672.933C966.503 341.45 1416.05 155.197 1884.81 155.143Z" fill="url(#fb-paint8_linear)" />
            <path d="M1982.62 4468.57H1668.82C1031.91 4468.57 484.445 4084.83 245.63 3535.9C345.252 3516.23 446.559 3506.34 548.104 3506.39C1196.09 3506.39 1751.06 3904.02 1982.62 4468.57Z" fill="#FF960B" />
          </g>

          {/* --- 4. HEAD BONE (Ears + Face + Eyes + Mouth + Cheeks) --- */}
          <g
            id="full-head"
            style={{
              transformOrigin: '2015px 1922px',
              transform: `translate(${headLookX * 2}px, ${(headLookY * 2) + sleepyHeadDrop}px) rotate(${headRotation}deg)`,
              transition: state === 'sleepy' ? 'transform 0.5s ease-in-out' : 'transform 0.15s ease-out',
            }}
          >
            {/* Forehead Fur */}
            <path d="M3564.63 869.071C3419.23 961.42 3250.05 1006.45 3056.06 1006.45C2571.08 1006.45 2177.53 665.23 2177.53 244.327C2177.51 214.464 2179.5 184.634 2183.51 155.041C2706.57 171.428 3070.61 376.29 3354.66 630.67C3434.55 702.19 3496.98 776.62 3564.63 869.071Z" fill="#FF960B" />

            {/* Left Ear - FIXED BASE PIVOT (750, 750) */}
            <g id="left-ear" style={{ transformOrigin: '750px 750px', transform: `rotate(${leftEarRot}deg)`, transition: 'transform 0.25s' }}>
              <path d="M425.532 138.807C411.289 45.2842 519.108 -26.5935 619.524 9.49848L913.983 115.171L1434.54 301.961L987.751 599.631L541.162 897.301L467.292 412.841L425.532 138.807Z" fill="url(#fb-paint4_linear)" />
              <path d="M600.737 276.947C592.365 221.813 655.872 179.493 715.091 200.781L888.662 263.01L1195.37 373.073L932.157 548.428L668.788 723.783L625.344 438.365L600.737 276.947Z" fill="url(#fb-paint5_linear)" />
            </g>

            {/* Right Ear - FIXED BASE PIVOT (3300, 750) */}
            <g id="right-ear" style={{ transformOrigin: '3300px 750px', transform: `rotate(${rightEarRot}deg)`, transition: 'transform 0.25s' }}>
              <path d="M3639.93 138.807C3654.17 45.2842 3546.35 -26.5935 3445.93 9.49848L3151.47 115.171L2630.76 301.961L3077.6 599.631L3524.45 897.301L3598.22 412.841L3639.93 138.807Z" fill="url(#fb-paint6_linear)" />
              <path d="M3464.67 276.947C3473.09 221.813 3409.54 179.493 3350.37 200.781L3176.8 263.01L2870.19 373.073L3133.4 548.428L3396.62 723.783L3440.11 438.365L3464.67 276.947Z" fill="url(#fb-paint7_linear)" />
            </g>

            {/* Eyes */}
            <g id="eyes">
              {shouldBlink ? (
                <g id="eyes-blinking">
                  <path d="M1220 720 Q1382 840 1540 720" stroke="#8E3817" strokeWidth="80" fill="none" strokeLinecap="round" />
                  <path d="M2480 720 Q2648 840 2807 720" stroke="#8E3817" strokeWidth="80" fill="none" strokeLinecap="round" />
                </g>
              ) : (
                <g id="eyes-open">
                  <path d="M1541.75 741.497C1534.82 741.251 1528.2 738.549 1523.07 733.873C1517.95 729.198 1514.65 722.853 1513.78 715.973C1502.7 647.515 1448.02 595.547 1382.27 595.547C1316.52 595.547 1261.79 647.515 1250.71 715.973C1249.83 722.853 1246.54 729.198 1241.41 733.873C1236.29 738.549 1229.67 741.251 1222.74 741.497C1205.28 741.497 1191.65 724.345 1194.61 705.508C1210.23 607.595 1288.29 533.113 1382.27 533.113C1476.25 533.113 1554.31 607.595 1569.93 705.508C1572.84 724.345 1559.21 741.497 1541.75 741.497Z" fill="#8E3817" />
                  <path d="M2807.8 741.497C2800.87 741.251 2794.25 738.549 2789.13 733.873C2784 729.198 2780.71 722.853 2779.83 715.973C2768.75 647.515 2714.07 595.547 2648.32 595.547C2582.57 595.547 2527.84 647.515 2516.76 715.973C2515.88 722.853 2512.59 729.198 2507.46 733.873C2502.34 738.549 2495.72 741.251 2488.79 741.497C2471.33 741.497 2457.7 724.345 2460.66 705.508C2475.97 607.492 2554.03 533.113 2648.02 533.113C2742 533.113 2820.06 607.492 2835.68 705.508C2838.43 724.345 2825.01 741.497 2807.8 741.497Z" fill="#8E3817" />
                </g>
              )}
            </g>

            {/* Nose & Mouth (DEFAULT: Iconic Wide Open Mouth for all states) */}
            <g id="mouth">
              {state === 'eat' ? (
                <g id="mouth-munching">
                  {/* Phase 1: Bite into fish cookie */}
                  {chewFrame === 1 ? (
                    <g transform="translate(0, 40)">
                      <path d="M3373.39 1773.36C3373.39 1977.81 3277.88 2162.92 3123.24 2296.87C2968.61 2430.83 2755.42 2513.73 2519.67 2513.73H1510.41C1039.01 2513.73 656.842 2182.27 656.842 1773.51C656.842 1569.06 752.357 1383.96 906.989 1250C961.407 1202.99 1021.54 1163.05 1085.97 1131.11L1133.86 1187.82L1190.57 1254.95C1209.92 1277.82 1250.61 1273.99 1263.83 1248.01L1302.48 1171.9L1367.72 1043.45C1415.06 1036.59 1462.83 1033.18 1510.66 1033.25H2519.83C2565.25 1033.21 2610.63 1036.33 2655.62 1042.59L2721.37 1172L2760.02 1248.11C2773.19 1274.1 2813.88 1277.93 2833.23 1255.06L2889.89 1187.93L2939.77 1128.91C3198.65 1255.82 3373.39 1496.88 3373.39 1773.36Z" fill="url(#fb-paint9_linear)" />
                    </g>
                  ) : chewFrame === 2 ? (
                    /* Phase 2: Chewing closed mouth (nhóp nhép) */
                    <g transform="translate(0, 40)">
                      <path d="M 1650 1450 Q 1830 1620 2015 1450 Q 2200 1620 2380 1450" stroke="#8E3817" strokeWidth="65" fill="none" strokeLinecap="round" />
                    </g>
                  ) : chewFrame === 3 ? (
                    /* Phase 3: Mlem licking tongue */
                    <g transform="translate(0, 40)">
                      <path d="M 1650 1450 Q 1830 1620 2015 1450 Q 2200 1620 2380 1450" stroke="#8E3817" strokeWidth="65" fill="none" strokeLinecap="round" />
                      <ellipse cx="2015" cy="1580" rx="90" ry="70" fill="#ff7676" stroke="#8E3817" strokeWidth="20" />
                    </g>
                  ) : (
                    /* Phase 0: Ready to bite (wide open) */
                    <path d="M3373.39 1773.36C3373.39 1977.81 3277.88 2162.92 3123.24 2296.87C2968.61 2430.83 2755.42 2513.73 2519.67 2513.73H1510.41C1039.01 2513.73 656.842 2182.27 656.842 1773.51C656.842 1569.06 752.357 1383.96 906.989 1250C961.407 1202.99 1021.54 1163.05 1085.97 1131.11L1133.86 1187.82L1190.57 1254.95C1209.92 1277.82 1250.61 1273.99 1263.83 1248.01L1302.48 1171.9L1367.72 1043.45C1415.06 1036.59 1462.83 1033.18 1510.66 1033.25H2519.83C2565.25 1033.21 2610.63 1036.33 2655.62 1042.59L2721.37 1172L2760.02 1248.11C2773.19 1274.1 2813.88 1277.93 2833.23 1255.06L2889.89 1187.93L2939.77 1128.91C3198.65 1255.82 3373.39 1496.88 3373.39 1773.36Z" fill="url(#fb-paint9_linear)" />
                  )}
                </g>
              ) : (
                /* DEFAULT WIDE OPEN MOUTH FOR ALL STATES (Idle, Look, Celebrate, Hint, Sleepy) */
                <g id="mouth-open">
                  <path d="M3373.39 1773.36C3373.39 1977.81 3277.88 2162.92 3123.24 2296.87C2968.61 2430.83 2755.42 2513.73 2519.67 2513.73H1510.41C1039.01 2513.73 656.842 2182.27 656.842 1773.51C656.842 1569.06 752.357 1383.96 906.989 1250C961.407 1202.99 1021.54 1163.05 1085.97 1131.11L1133.86 1187.82L1190.57 1254.95C1209.92 1277.82 1250.61 1273.99 1263.83 1248.01L1302.48 1171.9L1367.72 1043.45C1415.06 1036.59 1462.83 1033.18 1510.66 1033.25H2519.83C2565.25 1033.21 2610.63 1036.33 2655.62 1042.59L2721.37 1172L2760.02 1248.11C2773.19 1274.1 2813.88 1277.93 2833.23 1255.06L2889.89 1187.93L2939.77 1128.91C3198.65 1255.82 3373.39 1496.88 3373.39 1773.36Z" fill="url(#fb-paint9_linear)" />
                </g>
              )}

              {/* Nose & Tongue Tip */}
              <path d="M1969.4 950.903C1974.67 956.752 1981.1 961.429 1988.29 964.63C1995.48 967.831 2003.26 969.486 2011.13 969.486C2019 969.486 2026.79 967.831 2033.98 964.63C2041.17 961.429 2047.6 956.752 2052.87 950.903L2107.14 891.022L2143.38 851.153C2148.51 845.491 2151.89 838.462 2153.1 830.919C2154.31 823.376 2153.31 815.643 2150.21 808.66C2147.11 801.676 2142.05 795.741 2135.65 791.577C2129.24 787.412 2121.77 785.195 2114.13 785.197L2011.42 779.734L1908.34 785.197C1900.67 785.115 1893.14 787.274 1886.67 791.408C1880.21 795.542 1875.08 801.472 1871.94 808.471C1868.79 815.471 1867.75 823.237 1868.95 830.818C1870.15 838.398 1873.53 845.465 1878.68 851.153L1914.93 891.022L1969.4 950.903Z" fill="#FFAEAE" />
            </g>

            {/* SLEEPY SNOT BUBBLE (Nở to phập phồng ở mũi khi ngủ) */}
            {state === 'sleepy' && (
              <g id="snot-bubble" transform="translate(2015, 920)">
                <circle cx="0" cy="0" r={160 + (breathePhase * 140)} fill="url(#sleep-bubble-grad)" stroke="#ffffff" strokeWidth="12" opacity="0.85" />
                <ellipse cx="-35" cy="-45" rx="45" ry="25" fill="#ffffff" opacity="0.75" transform="rotate(-20 -35 -45)" />
              </g>
            )}
          </g>

          {/* --- 5. FRONT ARMS & PAWS (Holding Snack / Waving) --- */}
          <g id="full-arms">
            {/* Left Arm */}
            <g
              id="left-arm"
              style={{
                transformOrigin: '1200px 2800px',
                transform: `translate(${leftArmTranslateX}px, ${leftArmTranslateY}px) rotate(${leftArmRot}deg)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <path d="M1464 3138.43C1463.25 3155.1 1460.86 3171.65 1456.85 3187.84C1455.42 3193.77 1453.84 3199.53 1452 3205.3C1450.52 3210.1 1448.84 3214.85 1446.9 3219.6C1444.14 3226.85 1441.03 3233.99 1437.61 3240.93C1410.28 3296.96 1363.97 3341.49 1306.92 3366.62L1303.24 3368.1C1292.68 3371.93 1282.11 3375.71 1271.44 3379.33C1079.39 3445.03 986.628 3461.01 771.552 3450.8C504.303 3437.94 347.833 3394.65 130.103 3271.11C88.6591 3247.5 54.5828 3212.85 31.6704 3171.02C8.75801 3129.19 -2.09072 3081.82 0.332836 3034.18L15.3417 2724.77C19.2726 2643.09 116.473 2604.3 176.253 2659.74C364.68 2834.38 520.333 2913.96 797.027 2927.29C910.103 2932.75 905.254 2936.58 1009.75 2910.59C1020.02 2907.86 1029.13 2901.88 1035.72 2893.55C1042.31 2885.21 1046.02 2874.96 1046.31 2864.34C1046.28 2864.21 1046.28 2864.07 1046.31 2863.93C1047.55 2838.36 1057.08 2813.88 1073.46 2794.2C1089.84 2774.52 1112.18 2760.7 1137.11 2754.83C1162.03 2748.96 1188.19 2751.36 1211.63 2761.67C1235.07 2771.98 1254.52 2789.63 1267.05 2811.97C1273.38 2823.32 1277.81 2835.63 1280.17 2848.41C1281.56 2856.49 1284.91 2864.09 1289.93 2870.56C1294.95 2877.04 1301.49 2882.17 1308.96 2885.53C1351.57 2904.75 1388.31 2934.92 1415.45 2972.98C1417.19 2975.43 1418.87 2978.08 1420.56 2980.38C1426.61 2989.42 1432.07 2998.85 1436.89 3008.61C1437.51 3009.68 1438.07 3010.8 1438.58 3011.93C1457.45 3051.32 1466.18 3094.8 1464 3138.43Z" fill="url(#fb-paint10_linear)" />
              <path d="M1420.46 2980.38C1418.82 2977.88 1417.14 2975.27 1415.35 2972.97C1307.74 2984.46 1249.69 3013.81 1226.46 3025.71C1223.81 3027.09 1220.8 3028.57 1219.21 3029.23C1214.71 3030.09 1210.67 3032.56 1207.86 3036.19C1205.05 3039.81 1203.66 3044.35 1203.96 3048.92C1204.27 3053.5 1206.23 3057.81 1209.49 3061.04C1212.75 3064.27 1217.08 3066.19 1221.66 3066.45C1228.35 3066.75 1233.41 3064.25 1243.41 3059.2C1266.18 3047.61 1324.79 3017.85 1436.89 3008.61C1432.03 2998.85 1426.54 2989.42 1420.46 2980.38Z" fill="#E05A00" />
              <path d="M1295.38 3201.98C1292.32 3202.29 1289.1 3202.85 1287.37 3203.01C1282.89 3202.42 1278.34 3203.48 1274.58 3205.98C1270.82 3208.49 1268.1 3212.28 1266.91 3216.64C1265.73 3221 1266.17 3225.64 1268.14 3229.71C1270.12 3233.77 1273.5 3236.98 1277.67 3238.74C1283.84 3241.24 1289.41 3240.42 1300.54 3238.74C1320.65 3235.88 1365.63 3229.5 1437.76 3240.63C1441.18 3233.69 1444.3 3226.54 1447.05 3219.29C1448.84 3214.54 1450.52 3209.79 1452.16 3205C1369.51 3191.52 1317.84 3198.77 1295.38 3201.98Z" fill="#E05A00" />

              {/* JUMBO GOLDEN FISH COOKIE - FIXED POSITION RIGHT IN HAND PAW (840, 3080) */}
              {state === 'eat' && (
                <g id="fish-cookie-snack" transform="translate(840, 3080) rotate(-35)">
                  {/* Top & Bottom Fins */}
                  <path d="M 320 120 Q 420 20 520 120 Z" fill="#d97706" />
                  <path d="M 320 440 Q 420 540 520 440 Z" fill="#d97706" />
                  {/* Tail Fin */}
                  <polygon points="680,280 820,160 780,280 820,400" fill="#f59e0b" stroke="#b45309" strokeWidth="18" strokeLinejoin="round" />
                  {/* Fish Body */}
                  <path d="M 60 280 Q 60 120 380 120 Q 680 120 680 280 Q 680 440 380 440 Q 60 440 60 280 Z" fill="url(#fish-cookie-grad)" stroke="#b45309" strokeWidth="22" />
                  {/* Fish Eye */}
                  <circle cx="180" cy="230" r="28" fill="#78350f" />
                  <circle cx="170" cy="220" r="9" fill="#ffffff" />
                  {/* Baked Fish Scales Pattern */}
                  <path d="M 310 200 Q 345 235 310 270 M 370 200 Q 405 235 370 270 M 430 200 Q 465 235 430 270 M 340 270 Q 375 305 340 340 M 400 270 Q 435 305 400 340" stroke="#b45309" strokeWidth="16" fill="none" strokeLinecap="round" />
                  {/* Fish Mouth Smile */}
                  <path d="M 120 330 Q 150 360 180 330" stroke="#78350f" strokeWidth="16" fill="none" strokeLinecap="round" />
                </g>
              )}
            </g>

            {/* Right Arm */}
            <g
              id="right-arm"
              style={{
                transformOrigin: '2800px 2800px',
                transform: `rotate(${rightArmRot}deg)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <path d="M2566.23 3138.43C2566.98 3155.09 2569.37 3171.65 2573.38 3187.84C2574.81 3193.76 2576.39 3199.53 2578.23 3205.3C2579.71 3210.1 2581.39 3214.85 2583.33 3219.6C2586.09 3226.84 2589.2 3233.99 2592.63 3240.93C2619.94 3296.95 2666.23 3341.48 2723.26 3366.62L2726.94 3368.1C2737.51 3371.93 2748.07 3375.71 2758.74 3379.33C2950.8 3445.03 3043.55 3461.01 3258.63 3450.8C3525.88 3437.93 3682.35 3394.64 3900.08 3271.1C3941.54 3247.54 3975.64 3212.92 3998.59 3171.12C4021.53 3129.32 4032.43 3081.97 4030.05 3034.34L4015.1 2724.93C4011.16 2643.25 3913.96 2604.45 3854.18 2659.89C3665.76 2834.53 3510.1 2914.12 3233.41 2927.44C3120.33 2932.9 3125.18 2936.73 3020.68 2910.75C3010.41 2908.02 3001.3 2902.04 2994.72 2893.7C2988.13 2885.36 2984.41 2875.12 2984.13 2864.49C2984.16 2864.36 2984.16 2864.22 2984.13 2864.09C2982.89 2838.51 2973.36 2814.03 2956.97 2794.35C2940.59 2774.67 2918.25 2760.85 2893.33 2754.98C2868.4 2749.11 2842.25 2751.52 2818.8 2761.82C2795.36 2772.13 2775.91 2789.78 2763.39 2812.12C2757 2823.46 2752.52 2835.77 2750.12 2848.57C2748.73 2856.64 2745.37 2864.25 2740.35 2870.72C2735.33 2877.19 2728.8 2882.33 2721.32 2885.68C2678.72 2904.9 2641.97 2935.07 2614.83 2973.13C2613.1 2975.58 2611.41 2978.23 2609.73 2980.53C2603.67 2989.58 2598.22 2999.01 2593.39 3008.76C2592.78 3009.83 2592.22 3010.96 2591.71 3012.08C2572.85 3051.42 2564.09 3094.85 2566.23 3138.43Z" fill="url(#fb-paint11_linear)" />
              <path d="M2593.39 3008.61C2705.7 3017.85 2764.1 3047.61 2786.87 3059.2C2797.08 3064.3 2802.19 3066.75 2808.62 3066.45C2813.2 3066.19 2817.53 3064.27 2820.79 3061.04C2824.05 3057.81 2826.02 3053.5 2826.32 3048.92C2826.62 3044.35 2825.24 3039.81 2822.43 3036.19C2819.62 3032.56 2815.58 3030.09 2811.07 3029.23C2809.49 3028.57 2806.48 3027.09 2803.82 3025.71C2780.44 3013.87 2722.14 2984.46 2614.93 2972.97C2613.2 2975.42 2611.51 2978.08 2609.83 2980.38C2603.74 2989.42 2598.25 2998.85 2593.39 3008.61Z" fill="#E05A00" />
              <path d="M2578.08 3205.3C2579.56 3210.1 2581.24 3214.85 2583.18 3219.59C2585.94 3226.84 2589.05 3233.99 2592.47 3240.93C2664.61 3229.8 2709.58 3236.19 2729.7 3239.04C2740.82 3240.58 2746.39 3241.39 2752.57 3239.04C2756.73 3237.28 2760.11 3234.07 2762.09 3230.01C2764.07 3225.95 2764.5 3221.3 2763.32 3216.94C2762.14 3212.58 2759.41 3208.8 2755.65 3206.29C2751.89 3203.78 2747.35 3202.72 2742.87 3203.31C2741.13 3203.31 2737.76 3202.6 2734.85 3202.29C2712.39 3198.77 2660.73 3191.52 2578.08 3205.3Z" fill="#E05A00" />
            </g>
          </g>

          {/* --- 6. DEBUG SKELETON (Full Body) --- */}
          {showBones && (
            <g id="fb-bones-debug" className="animate-in fade-in">
              <line x1="2015" y1="4468" x2="2015" y2="1922" stroke="#ef4444" strokeWidth="30" strokeDasharray="50 30" />
              <line x1="2015" y1="4468" x2="1953" y2="3620" stroke="#f97316" strokeWidth="25" strokeDasharray="40 25" />
              <line x1="1953" y1="3620" x2="4640" y2="3150" stroke="#f97316" strokeWidth="25" strokeDasharray="40 25" />
              <line x1="2015" y1="4468" x2="1191" y2="5200" stroke="#84cc16" strokeWidth="25" strokeDasharray="40 25" />
              <line x1="2015" y1="4468" x2="2839" y2="5200" stroke="#84cc16" strokeWidth="25" strokeDasharray="40 25" />
              <line x1="2015" y1="2800" x2="1200" y2="2800" stroke="#06b6d4" strokeWidth="25" strokeDasharray="40 25" />
              <line x1="2015" y1="2800" x2="2800" y2="2800" stroke="#06b6d4" strokeWidth="25" strokeDasharray="40 25" />

              <circle cx="2015" cy="4468" r="70" fill="#ef4444" stroke="#ffffff" strokeWidth="15" />
              <circle cx="2015" cy="1922" r="70" fill="#ef4444" stroke="#ffffff" strokeWidth="15" />
              <circle cx="1953" cy="3620" r="60" fill="#f97316" stroke="#ffffff" strokeWidth="15" />
              <circle cx="4640" cy="3150" r="60" fill="#f97316" stroke="#ffffff" strokeWidth="15" />
              <circle cx="1191" cy="5200" r="60" fill="#84cc16" stroke="#ffffff" strokeWidth="15" />
              <circle cx="2839" cy="5200" r="60" fill="#84cc16" stroke="#ffffff" strokeWidth="15" />
              <circle cx="750" cy="750" r="50" fill="#06b6d4" stroke="#ffffff" strokeWidth="12" />
              <circle cx="3300" cy="750" r="50" fill="#06b6d4" stroke="#ffffff" strokeWidth="12" />
            </g>
          )}
        </svg>
      ) : (
        /* =========================================================================
            VARIANT 2: HALF BODY / DESK RIG (FROM login-cat.svg: 0 0 834 711)
        ========================================================================= */
        <svg
          viewBox="0 0 834.19 711.34"
          className="h-full w-full drop-shadow-md transition-transform duration-200 ease-out"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Mèo Mee Half Body Rig"
          style={{
            transform: `translateY(${jumpY * 0.2}px)`,
          }}
        >
          <defs>
            <linearGradient id="live-ear-grad-left" x1="40.83" y1="27.94" x2="184.94" y2="172.05" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fffffe" />
              <stop offset="60%" stopColor="#f2fafd" />
              <stop offset="100%" stopColor="#cfeef9" />
            </linearGradient>
            <linearGradient id="live-ear-inner-left" x1="86.56" y1="75.57" x2="177.19" y2="166.21" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f7a424" />
              <stop offset="100%" stopColor="#e5500e" />
            </linearGradient>
            <linearGradient id="live-ear-grad-right" x1="792.41" y1="27.78" x2="648.3" y2="171.89" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f7a424" />
              <stop offset="100%" stopColor="#f48108" />
            </linearGradient>
            <linearGradient id="live-ear-inner-right" x1="746.68" y1="75.41" x2="656.05" y2="166.04" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f7a424" />
              <stop offset="100%" stopColor="#e5500e" />
            </linearGradient>
            <linearGradient id="live-body-grad" x1="417.09" y1="27.39" x2="417.09" y2="711.34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#fbfcfe" />
              <stop offset="100%" stopColor="#d5f0fa" />
            </linearGradient>
            <linearGradient id="live-paw-grad" x1="250" y1="590" x2="0" y2="590" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f7a424" />
              <stop offset="100%" stopColor="#f48108" />
            </linearGradient>
            <linearGradient id="live-paw-grad-right" x1="580" y1="590" x2="830" y2="590" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f7a424" />
              <stop offset="100%" stopColor="#f48108" />
            </linearGradient>
            <linearGradient id="live-snack" x1="320" y1="200" x2="520" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <radialGradient id="live-snot-grad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
            </radialGradient>
          </defs>

          {/* Left Ear */}
          <g id="left-ear" style={{ transformOrigin: '172px 152px', transform: `rotate(${leftEarRot}deg)`, transition: 'transform 0.25s' }}>
            <path fill="url(#live-ear-grad-left)" d="M266.52,81.88,172,152l-94.54,70.1L61.9,102.33,52.6,30.71a26.86,26.86,0,0,1,38-28.18l65.84,29.7Z" />
            <path fill="url(#live-ear-inner-left)" d="M230.18,108.57l-59.46,44.1-59.45,44.09-9.78-75.32-5.85-45a16.89,16.89,0,0,1,23.89-17.72l41.41,18.68Z" />
          </g>

          {/* Right Ear */}
          <g id="right-ear" style={{ transformOrigin: '660px 152px', transform: `rotate(${rightEarRot}deg)`, transition: 'transform 0.25s' }}>
            <path fill="url(#live-ear-grad-right)" d="M566.73,80.64l94.07,70.73,94.07,70.73,16.34-119.65L781,30.88A26.86,26.86,0,0,0,743.18,2.46l-66,29.26Z" />
            <path fill="url(#live-ear-inner-right)" d="M602.9,107.58l59.16,44.48,59.16,44.49,10.28-75.26,6.15-45A16.9,16.9,0,0,0,713.87,58.4L672.34,76.81Z" />
          </g>

          {/* Head */}
          <g
            id="head"
            style={{
              transformOrigin: '417px 355px',
              transform: `translate(${headLookX}px, ${(headLookY) + (sleepyHeadDrop * 0.35)}px) rotate(${headRotation}deg)`,
              transition: state === 'sleepy' ? 'transform 0.5s ease-in-out' : 'transform 0.15s ease-out',
            }}
          >
            <path fill="url(#live-body-grad)" d="M417.09,27.39h0A409.06,409.06,0,0,1,826.16,436.45V711.34H8V436.45A409.06,409.06,0,0,1,417.09,27.39Z" />
            <path fill="#f7a424" d="M738.05,182.82a196,196,0,0,1-129,48.15c-108.65,0-196.74-88.08-196.74-196.73q0-3.42.12-6.82,2.31,0,4.62,0a409.19,409.19,0,0,1,321,155.43Z" />
            <g id="cheeks">
              <ellipse cx="260" cy="180" rx="28" ry="18" fill="#fca5a5" opacity={state === 'celebrate' ? '0.9' : state === 'eat' ? '0.85' : '0.55'} />
              <ellipse cx="574" cy="180" rx="28" ry="18" fill="#fca5a5" opacity={state === 'celebrate' ? '0.9' : state === 'eat' ? '0.85' : '0.55'} />
            </g>
            <g id="eyebrows">
              <path fill="#f48108" d="M321.56,138.54a5.18,5.18,0,0,1-5.11-4.29,24.77,24.77,0,0,0-48.79,0,5.2,5.2,0,0,1-5.11,4.29,5.18,5.18,0,0,1-5.14-6,35.16,35.16,0,0,1,69.28,0A5.17,5.17,0,0,1,321.56,138.54Z" />
              <path fill="#f48108" d="M571,138.54a5.19,5.19,0,0,1-5.11-4.29,24.77,24.77,0,0,0-48.79,0,5.18,5.18,0,0,1-5.11,4.29,5.17,5.17,0,0,1-5.13-6,35.16,35.16,0,0,1,69.28,0A5.18,5.18,0,0,1,571,138.54Z" />
            </g>
            <g id="eyes">
              {shouldBlink ? (
                <g id="eyes-blinking">
                  <path d="M265,148 Q290,165 315,148" stroke="#334155" strokeWidth="8" fill="none" strokeLinecap="round" />
                  <path d="M519,148 Q544,165 569,148" stroke="#334155" strokeWidth="8" fill="none" strokeLinecap="round" />
                </g>
              ) : (
                <g id="eyes-open">
                  <g id="left-eye" transform={`translate(${headLookX * 0.4}, ${headLookY * 0.4})`}>
                    <circle cx="290" cy="138" r="16" fill="#1e293b" />
                    <circle cx="295" cy="133" r="6" fill="#ffffff" />
                  </g>
                  <g id="right-eye" transform={`translate(${headLookX * 0.4}, ${headLookY * 0.4})`}>
                    <circle cx="544" cy="138" r="16" fill="#1e293b" />
                    <circle cx="549" cy="133" r="6" fill="#ffffff" />
                  </g>
                </g>
              )}
            </g>
            <g id="nose">
              <path fill="#f48108" d="M434.47,150.91H399.72A7.47,7.47,0,0,0,394,163.17l6.45,7.75L411.35,184a7.58,7.58,0,0,0,.85.85v24.69h9.48V185.14a8.06,8.06,0,0,0,1.16-1.11l10.92-13.11,6.45-7.75A7.47,7.47,0,0,0,434.47,150.91Z" />
            </g>
            <g id="mouth">
              {state === 'eat' ? (
                <g id="mouth-eating" transform={`translate(0, ${chewFrame % 2 === 0 ? 6 : -2})`}>
                  <path d="M380,210 Q417,245 454,210 Z" fill="#e11d48" />
                  <path fill="url(#live-snack)" d="M327.47,228.66a5,5,0,0,1-.86-10L506.84,187a5,5,0,1,1,1.73,9.9L328.34,228.59A5.1,5.1,0,0,1,327.47,228.66Z" />
                </g>
              ) : (
                <g id="mouth-happy">
                  <path d="M375,208 Q417,265 459,208 Z" fill="#e11d48" />
                  <path d="M392,230 Q417,256 442,230 Z" fill="#fb7185" />
                </g>
              )}
            </g>

            {/* Snot Sleep Bubble for Half-Body */}
            {state === 'sleepy' && (
              <g id="half-snot-bubble" transform="translate(417, 185)">
                <circle cx="0" cy="0" r={22 + (breathePhase * 16)} fill="url(#live-snot-grad)" stroke="#ffffff" strokeWidth="2.5" opacity="0.85" />
                <circle cx="-5" cy="-6" r="4" fill="#ffffff" opacity="0.8" />
              </g>
            )}
          </g>

          {/* Left Paw */}
          <g
            id="left-paw"
            style={{
              transformOrigin: '180px 560px',
              transform: `translate(${leftArmTranslateX * 0.4}px, ${leftArmTranslateY * 0.4}px) rotate(${leftArmRot}deg)`,
              transition: 'transform 0.25s',
            }}
          >
            <path fill="url(#live-paw-grad)" d="M250.85,598.31a43.28,43.28,0,0,1-.29,5,41,41,0,0,1-.89,5,42.7,42.7,0,0,1-22.9,28.43l-.22.1c-1.64.68-3.28,1.34-4.94,2A269.07,269.07,0,0,1,8.93,631,15.63,15.63,0,0,1,0,616.92V528.64A4.71,4.71,0,0,1,7.76,525a179.54,179.54,0,0,0,177.05,32.54v-.07a17.76,17.76,0,0,1,12.81-17.19,17.92,17.92,0,0,1,23,17.18,42.61,42.61,0,0,1,21.14,14.45,42.55,42.55,0,0,1,9.13,26.37Z" />
            <path fill="#f48108" d="M245.32,577.3c-6.4-.95-17.82-1-27.36,8.15a2.5,2.5,0,1,1-3.46-3.62,36.17,36.17,0,0,1,27.22-9.89A42.16,42.16,0,0,1,245.32,577.3Z" />
            <path fill="#f48108" d="M250.56,603.3a41,41,0,0,1-.89,5,30.74,30.74,0,0,0-22.2-.08,2.49,2.49,0,0,1-1.86,0,2.51,2.51,0,0,1,.08-4.65A35.47,35.47,0,0,1,250.56,603.3Z" />
          </g>

          {/* Right Paw */}
          <g
            id="right-paw"
            style={{
              transformOrigin: '650px 560px',
              transform: `rotate(${rightArmRot}deg)`,
              transition: 'transform 0.25s',
            }}
          >
            <path fill="url(#live-paw-grad-right)" d="M583.34,598.31a43.28,43.28,0,0,0,.29,5,41,41,0,0,0,.89,5,42.7,42.7,0,0,0,22.9,28.43l.22.1c1.64.68,3.28,1.34,4.94,2A269.07,269.07,0,0,0,825.26,631a15.63,15.63,0,0,0,8.93-14.09V528.64a4.71,4.71,0,0,0-7.76-3.61,179.54,179.54,0,0,1-177,32.54v-.07a17.76,17.76,0,0,0-12.81-17.19,17.92,17.92,0,0,0-23,17.18,42.61,42.61,0,0,0-21.14,14.45,42.55,42.55,0,0,0-9.13,26.37Z" />
            <path fill="#f48108" d="M588.87,577.3c6.4-.95,17.82-1,27.36,8.15a2.5,2.5,0,0,0,3.46-3.62,36.17,36.17,0,0,0-27.22-9.89A42.16,42.16,0,0,0,588.87,577.3Z" />
            <path fill="#f48108" d="M583.63,603.3a41,41,0,0,0,.89,5,30.74,30.74,0,0,1,22.2-.08,2.49,2.49,0,0,0,1.86,0,2.51,2.51,0,0,0-.08-4.65A35.47,35.47,0,0,0,583.63,603.3Z" />
          </g>

          {/* Desk Card */}
          <g id="desk-card">
            <rect x="235" y="280" width="364" height="120" rx="18" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
            <rect x="254.59" y="341.48" width="325" height="6" fill="#cbd5e1" rx="3" />
            <circle cx="300" cy="315" r="10" fill="#f59e0b" />
            <circle cx="330" cy="315" r="10" fill="#3b82f6" />
            <circle cx="360" cy="315" r="10" fill="#10b981" />
          </g>

          {/* Debug overlay */}
          {showBones && (
            <g id="bones-debug-overlay" className="animate-in fade-in">
              <line x1="417" y1="650" x2="417" y2="355" stroke="#ef4444" strokeWidth="6" strokeDasharray="8 6" />
              <line x1="417" y1="355" x2="172" y2="152" stroke="#06b6d4" strokeWidth="5" strokeDasharray="6 4" />
              <line x1="417" y1="355" x2="660" y2="152" stroke="#06b6d4" strokeWidth="5" strokeDasharray="6 4" />
              <line x1="417" y1="650" x2="180" y2="560" stroke="#84cc16" strokeWidth="5" strokeDasharray="6 4" />
              <line x1="417" y1="650" x2="650" y2="560" stroke="#84cc16" strokeWidth="5" strokeDasharray="6 4" />
              <circle cx="417" cy="650" r="12" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
              <circle cx="417" cy="355" r="14" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
              <circle cx="172" cy="152" r="12" fill="#06b6d4" stroke="#ffffff" strokeWidth="3" />
              <circle cx="660" cy="152" r="12" fill="#06b6d4" stroke="#ffffff" strokeWidth="3" />
              <circle cx="180" cy="560" r="12" fill="#84cc16" stroke="#ffffff" strokeWidth="3" />
              <circle cx="650" cy="560" r="12" fill="#84cc16" stroke="#ffffff" strokeWidth="3" />
            </g>
          )}
        </svg>
      )}
    </div>
  )
}
