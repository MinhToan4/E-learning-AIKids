import React, { useEffect, useRef, useState } from 'react'
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas'
import { cn } from '@/shared/lib/cn'
import { useMeeCatSpeech, type Gesture, type Viseme } from '../hooks/useMeeCatSpeech'

export type MeeCatState = 'idle' | 'look' | 'hint' | 'celebrate' | 'eat' | 'sleepy' | 'talk'
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
  isSpeaking?: boolean
  speechText?: string
  gesture?: Gesture
  viseme?: Viseme
  onSpeechEnd?: () => void
  onQuoteChange?: (quote: string) => void
}

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
  isSpeaking = false,
  speechText = '',
  gesture = 'auto',
  viseme: controlledViseme,
  onSpeechEnd,
}: MeeCatInteractiveCanvasProps) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [internalBlink, setInternalBlink] = useState(false)
  const [chewFrame, setChewFrame] = useState(0)
  const [tailFrame, setTailFrame] = useState(0)
  const [celebrateStep, setCelebrateStep] = useState(0)
  const [sleepyNod, setSleepyNod] = useState(0)
  const [talkStep, setTalkStep] = useState(0)
  const [breathePhase, setBreathePhase] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Speech TTS and Viseme hook
  const effectiveSpeaking = isSpeaking
  const effectiveSpeechText = speechText || quote || ''
  const { viseme: autoViseme, activeGesture, currentWord } = useMeeCatSpeech({
    text: effectiveSpeechText,
    isSpeaking: effectiveSpeaking,
    gesture,
    onSpeechEnd,
  })

  const currentViseme = controlledViseme || autoViseme
  const effectiveGesture = gesture !== 'auto' ? gesture : activeGesture

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
      setCursorPos({ x: deltaX * 18, y: deltaY * 14 })
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

  // Celebrate jump loop
  useEffect(() => {
    if (state !== 'celebrate') return
    const jumpInterval = setInterval(() => {
      setCelebrateStep((prev) => (prev + 1) % 4)
    }, 190)
    return () => clearInterval(jumpInterval)
  }, [state])

  // Eating loop
  useEffect(() => {
    if (state !== 'eat') return
    const chewInterval = setInterval(() => {
      setChewFrame((prev) => (prev + 1) % 4)
    }, 280)
    return () => clearInterval(chewInterval)
  }, [state])

  // Sleepy loop
  useEffect(() => {
    if (state !== 'sleepy') return
    const sleepyInterval = setInterval(() => {
      setSleepyNod((prev) => (prev + 1) % 6)
    }, 600)
    return () => clearInterval(sleepyInterval)
  }, [state])

  // Talking gesture rhythm loop (Luôn chạy nhịp nhàng khi ở state talk hoặc đang nói)
  useEffect(() => {
    if (!effectiveSpeaking && state !== 'talk') return
    const talkInterval = setInterval(() => {
      setTalkStep((prev) => (prev + 1) % 4)
    }, 250)
    return () => clearInterval(talkInterval)
  }, [effectiveSpeaking, state])

  // Tail waving rhythm
  useEffect(() => {
    const tailInterval = setInterval(() => {
      setTailFrame((prev) => (prev + 1) % 4)
    }, state === 'celebrate' ? 140 : effectiveSpeaking ? 220 : 350)
    return () => clearInterval(tailInterval)
  }, [state, effectiveSpeaking])

  const shouldBlink = isBlinking || internalBlink || state === 'sleepy'
  const activeQuote = quote?.trim() || ''

  // Transform Computations for Skeletal Joints
  const headLookX = state === 'look' || isHovered ? cursorPos.x : 0
  const headLookY = state === 'look' || isHovered ? cursorPos.y : 0

  // Sleepy head nod progression
  const sleepyHeadDrop = state === 'sleepy' ? [0, 8, 18, 25, 14, 4][sleepyNod] : 0
  const sleepyHeadRot = state === 'sleepy' ? [0, 2, 4, 6, 3, 1][sleepyNod] : 0

  // Talking head nod rhythm & tilt
  const talkHeadNodY = effectiveSpeaking ? [0, 8, -4, 10][talkStep] : 0
  const talkHeadRot = effectiveSpeaking
    ? [0, 2, -1.5, 1][talkStep]
    : (state === 'talk' && effectiveGesture === 'point-left' ? -4 : state === 'talk' && effectiveGesture === 'point-right' ? 4 : 0)

  const headRotation = (headLookX * 0.2) + sleepyHeadRot + talkHeadRot

  // Ear rotations
  const talkEarWiggle = effectiveSpeaking ? (talkStep % 2 === 0 ? -2 : 2) : 0
  const leftEarRot = (-earAngle * 0.2) + talkEarWiggle + (state === 'celebrate' ? (celebrateStep % 2 === 0 ? -4 : 2) : 0)
  const rightEarRot = (earAngle * 0.2) - talkEarWiggle + (state === 'celebrate' ? (celebrateStep % 2 === 0 ? 4 : -2) : 0)

  // Tail animations
  const tailBaseRot = tailWiggle + (state === 'celebrate' ? [-14, 18, -10, 15][tailFrame] : state === 'sleepy' ? -5 : effectiveSpeaking ? [-6, 8, -5, 7][tailFrame] : [0, 5, -3, 3][tailFrame])

  // Celebrate / Talk Jump displacement values
  const jumpY = state === 'celebrate'
    ? [15, -60, -50, 10][celebrateStep]
    : (effectiveSpeaking || state === 'talk') && effectiveGesture === 'enthusiastic'
    ? [5, -24, -18, 2][talkStep]
    : 0

  const jumpLegScaleY = state === 'celebrate'
    ? [0.9, 1.1, 1.05, 0.95][celebrateStep]
    : (effectiveSpeaking || state === 'talk') && effectiveGesture === 'enthusiastic'
    ? [0.96, 1.05, 1.02, 0.98][talkStep]
    : 1

  // --- KINEMATICS GESTURE ENGINE CHUẨN XÁC VỚI HƯỚNG QUAY THỰC TẾ ---
  type LeftArmMode = 'resting' | 'raised-wave' | 'bent-to-mouth'

  let leftArmMode: LeftArmMode = 'resting'
  let leftArmRot = 0
  let rightArmRot = 0
  let leftArmTranslateY = 0
  let leftArmTranslateX = 0

  if (state === 'celebrate') {
    leftArmMode = 'raised-wave'
    leftArmRot = [5, 18, 12, 0][celebrateStep]
    rightArmRot = [-70, -90, -80, -60][celebrateStep]
  } else if (state === 'hint') {
    leftArmMode = 'bent-to-mouth'
    leftArmRot = -5
    rightArmRot = 0
  } else if (state === 'eat') {
    leftArmMode = 'resting'
    leftArmRot = [5, 30, 20, 5][chewFrame]
    leftArmTranslateY = [0, -120, -70, 0][chewFrame]
    leftArmTranslateX = [0, 80, 40, 0][chewFrame]
    rightArmRot = -10
  } else if (state === 'talk' || effectiveSpeaking || (effectiveGesture && effectiveGesture !== 'idle')) {
    // ACTIVE PRESENTATION GESTURES
    if (effectiveGesture === 'point-left') {
      // 👈 CHỈ SANG TRÁI: Tay trái xoay +60deg (theo chiều kim đồng hồ) vươn thẳng ra ngoài bên trái
      leftArmMode = 'resting'
      leftArmRot = 58 + (effectiveSpeaking ? (talkStep % 2 === 0 ? 5 : -4) : (talkStep % 2 === 0 ? 3 : -2))
      rightArmRot = -5 // Tay phải buông nhẹ bên hông
    } else if (effectiveGesture === 'point-right') {
      // 👉 CHỈ SANG PHẢI: Tay phải xoay -60deg (ngược chiều kim đồng hồ) vươn thẳng ra ngoài bên phải
      leftArmMode = 'resting'
      leftArmRot = 5 // Tay trái buông nhẹ bên hông
      rightArmRot = -58 + (effectiveSpeaking ? (talkStep % 2 === 0 ? -5 : 4) : (talkStep % 2 === 0 ? -3 : 2))
    } else if (effectiveGesture === 'explain') {
      // 👐 THUYẾT TRÌNH (2 tay): Cả 2 tay mở rộng sang 2 bên
      leftArmMode = 'resting'
      leftArmRot = 35 + (effectiveSpeaking ? (talkStep % 2 === 0 ? 8 : -6) : (talkStep % 2 === 0 ? 4 : -4))
      rightArmRot = -35 + (effectiveSpeaking ? (talkStep % 2 === 0 ? -8 : 6) : (talkStep % 2 === 0 ? -4 : 4))
    } else if (effectiveGesture === 'enthusiastic') {
      // 🎉 HÀO HỨNG (Nhún nhảy): Cả 2 tay vung cao lên trời
      leftArmMode = 'raised-wave'
      leftArmRot = 12 + (effectiveSpeaking ? (talkStep % 2 === 0 ? 10 : -6) : (talkStep % 2 === 0 ? 6 : -4))
      rightArmRot = -85 + (effectiveSpeaking ? (talkStep % 2 === 0 ? -12 : 6) : (talkStep % 2 === 0 ? -8 : 4))
    } else {
      // Mặc định: Chỉ sang bên trái
      leftArmMode = 'resting'
      leftArmRot = 58 + (effectiveSpeaking ? (talkStep % 2 === 0 ? 5 : -4) : 0)
      rightArmRot = -5
    }
  }

  // RENDER 5 VISEMES CUTE
  const renderVisemeContent = (vis: Viseme) => {
    switch (vis) {
      case 'open':
        /* A / Ă / Â (Mở to thoáng hạt dẻ) */
        return (
          <g id="aiki-viseme-open">
            <path
              d="M 420 535 Q 554.9 670 690 535 Q 554.9 510 420 535 Z"
              fill="#d83d00"
              stroke="#84391a"
              strokeWidth="9"
              strokeLinejoin="round"
            />
            <path
              d="M 465 615 Q 554.9 660 645 615 Q 554.9 590 465 615 Z"
              fill="#ff8517"
            />
            {/* 2 cute fangs */}
            <polygon points="460,526 482,526 471,552" fill="#fffdfa" stroke="#84391a" strokeWidth="4" />
            <polygon points="628,526 650,526 639,552" fill="#fffdfa" stroke="#84391a" strokeWidth="4" />
            <path d="M 554.9 517 L 554.9 528" stroke="#84391a" strokeWidth="10" strokeLinecap="round" />
          </g>
        )
      case 'round':
        /* O / Ô / Ơ / U / Ư (Chu tròn Ooh) */
        return (
          <g id="aiki-viseme-round">
            <ellipse cx="554.9" cy="582" rx="55" ry="60" fill="#d83d00" stroke="#84391a" strokeWidth="10" />
            <ellipse cx="554.9" cy="610" rx="35" ry="22" fill="#ff8517" />
            <path d="M 554.9 517 L 554.9 532" stroke="#84391a" strokeWidth="10" strokeLinecap="round" />
          </g>
        )
      case 'smile':
        /* E / Ê / I / Y (Cười dẹt trăng khuyết) */
        return (
          <g id="aiki-viseme-smile">
            <path
              d="M 425 540 Q 554.9 630 685 540 Q 554.9 520 425 540 Z"
              fill="#d83d00"
              stroke="#84391a"
              strokeWidth="9"
              strokeLinejoin="round"
            />
            <path
              d="M 475 585 Q 554.9 620 635 585 Z"
              fill="#ff8517"
            />
            <polygon points="475,530 493,530 484,550" fill="#fffdfa" />
            <polygon points="617,530 635,530 626,550" fill="#fffdfa" />
            <path d="M 554.9 517 L 554.9 530" stroke="#84391a" strokeWidth="10" strokeLinecap="round" />
          </g>
        )
      case 'half':
        /* HALF (Mấp máy nhẹ nhàng) */
        return (
          <g id="aiki-viseme-half">
            <path
              d="M 460 540 Q 554.9 595 650 540 Q 554.9 525 460 540 Z"
              fill="#d83d00"
              stroke="#84391a"
              strokeWidth="9"
              strokeLinejoin="round"
            />
            <ellipse cx="554.9" cy="570" rx="32" ry="16" fill="#ff8517" />
            <path d="M 554.9 517 L 554.9 530" stroke="#84391a" strokeWidth="10" strokeLinecap="round" />
          </g>
        )
      case 'closed':
      default:
        /* CLOSED (:3) */
        return (
          <g id="aiki-viseme-closed">
            <path d="M 554.9 517 L 554.9 538" stroke="#84391a" strokeWidth="12" strokeLinecap="round" />
            <path d="M 554.9 538 Q 495 578 440 538" stroke="#84391a" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M 554.9 538 Q 615 578 670 538" stroke="#84391a" strokeWidth="12" fill="none" strokeLinecap="round" />
          </g>
        )
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center select-none overflow-visible',
        !transparentBackground && 'rounded-3xl bg-gradient-to-b from-amber-50/60 to-orange-50/80 p-2 sm:p-4 shadow-sm border border-amber-100/80',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setCursorPos({ x: 0, y: 0 })
      }}
    >
      {/* Speech Bubble Quote */}
      {activeQuote && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 animate-in fade-in zoom-in-95 duration-200 pointer-events-none min-w-[220px] max-w-md w-max">
          <div className="rounded-2xl bg-white px-4 py-2.5 shadow-xl border-2 border-amber-400 text-xs sm:text-sm font-black text-amber-950 text-center leading-snug">
            {activeQuote}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-amber-400 rotate-45" />
          </div>
        </div>
      )}

      {/* Rive Engine Mode */}
      {engineMode === 'rive' && (
        <div className="w-full h-full aspect-[4/3] flex items-center justify-center">
          <RiveComponent className="w-full h-full" />
        </div>
      )}

      {/* SVG Interactive Rig Engine */}
      {engineMode === 'svg-rig' && (
        <svg
          viewBox="0 0 1420.17 1935.35"
          className="h-full w-full drop-shadow-lg transition-transform duration-200 ease-out"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          aria-label="Mèo AIKI Interactive Mascot Rig"
          style={{
            transform: `translateY(${jumpY * 0.4}px)`,
          }}
        >
          <defs>
            <linearGradient id="aiki-tail-grad" x1="3042.74" y1="1323.57" x2="2182.76" y2="1873.49" gradientTransform="matrix(0.85, 0.47, -0.48, 0.86, -515.88, -1323.55)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff8517"/>
              <stop offset="0.45" stopColor="#f47016"/>
            </linearGradient>
            <linearGradient id="aiki-left-ear-grad" x1="174.51" y1="10.98" x2="347.89" y2="534.44" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fffdfa"/>
              <stop offset="0.2" stopColor="#fffbf5"/>
              <stop offset="0.43" stopColor="#fff6e6"/>
              <stop offset="0.69" stopColor="#ffedce"/>
              <stop offset="0.95" stopColor="#ffe1ad"/>
              <stop offset="1" stopColor="#ffdfa6"/>
            </linearGradient>
            <linearGradient id="aiki-right-ear-grad" x1="841.78" x2="841.78" y2="545.5" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff8517"/>
              <stop offset="0.44" stopColor="#fc8017"/>
              <stop offset="0.96" stopColor="#f57116"/>
              <stop offset="1" stopColor="#f47016"/>
            </linearGradient>
            <linearGradient id="aiki-left-leg-grad" x1="251.31" y1="1735.87" x2="251.31" y2="876.44" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff8517"/>
              <stop offset="0.31" stopColor="#fc8017"/>
              <stop offset="0.67" stopColor="#f57116"/>
              <stop offset="0.7" stopColor="#f47016"/>
            </linearGradient>
            <linearGradient id="aiki-right-leg-grad" x1="862.16" y1="1735.87" x2="862.16" y2="876.44" xlinkHref="#aiki-left-leg-grad" />
            <linearGradient id="aiki-body-grad" x1="554.9" y1="146.56" x2="554.9" y2="1691.12" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fffdfa"/>
              <stop offset="0.38" stopColor="#fffcf8"/>
              <stop offset="0.56" stopColor="#fffaf0"/>
              <stop offset="0.71" stopColor="#fff5e3"/>
              <stop offset="0.83" stopColor="#ffeed1"/>
              <stop offset="0.93" stopColor="#ffe6b9"/>
              <stop offset="1" stopColor="#ffdfa6"/>
            </linearGradient>
            {/* Golden Fish Biscuit Gradient */}
            <linearGradient id="fish-cookie-grad" x1="0" y1="0" x2="300" y2="200" gradientUnits="userSpaceOnUse">
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

          {/* --- UNIFIED MASCOT RIG CONTAINER (Tâm gốc tại chân 555px, 1935px) --- */}
          <g
            id="aiki-whole-mascot"
            style={{
              transformOrigin: '554.9px 1935px',
              transform: `translate(${headLookX * 0.35}px, ${(headLookY * 0.35) + (breathePhase * 10) + sleepyHeadDrop + talkHeadNodY + jumpY}px) rotate(${headRotation * 0.35}deg)`,
              transition: state === 'sleepy' ? 'transform 0.5s ease-in-out' : state === 'celebrate' ? 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.25s ease-out',
            }}
          >
            {/* --- 1. TAIL BONE (Back Layer with White Tip) --- */}
            <g
              id="aiki-tail"
              style={{
                transformOrigin: '628px 1578px',
                transform: `rotate(${tailBaseRot}deg)`,
                transition: state === 'celebrate' ? 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.35s ease-out',
              }}
            >
              <path
                fill="url(#aiki-tail-grad)"
                d="M1281.85,1376.83a404.06,404.06,0,0,1-91.71,43.84q-17.85,5.94-35.45,10L628.38,1578.78c-73.86,25.59-151.46-8-178.21-73.26s4.54-144.81,74.5-179.92L999.3,1051.3q15.23-9.78,32-18.48a401.88,401.88,0,0,1,95.94-35.21c122.75-27.84,241.87,8.49,280.85,103.65C1447.11,1196.58,1388.2,1308.15,1281.85,1376.83Z"
              />
              <path
                fill="#fffdfa"
                d="M1218.34,1758.49c70.37-161.57,76.59-303.13,65.19-404.32,119.32,40.08,202.16,133.07,185.94,234.63C1453.24,1690.52,1344.9,1755.16,1218.34,1758.49Z"
              />
            </g>

            {/* --- 2. LEFT EAR BONE --- */}
            <g
              id="aiki-left-ear"
              style={{
                transformOrigin: '280px 328px',
                transform: `rotate(${leftEarRot}deg)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <circle fill="#fffdfa" cx="279.54" cy="328.08" r="217.37" />
              <path
                fill="url(#aiki-left-ear-grad)"
                d="M448.5,191.27A116.88,116.88,0,0,0,436,175.87l-62-64.66L297.43,31.39C243.17-25.18,148-1.79,126.15,73.49L95.31,179.71l-25,86a118.44,118.44,0,0,0-3.92,19.43,216.61,216.61,0,0,0,2,94.79c28.65,116.58,146.39,187.85,263,159.2s187.85-146.39,159.2-263A216.43,216.43,0,0,0,448.5,191.27Z"
              />
              <path
                fill="#f3a3a3"
                d="M380.68,220.85a73.69,73.69,0,0,0-7.85-9.69l-39-40.69-48.19-50.24c-34.15-35.6-94-20.88-107.8,26.5L158.4,213.58l-15.72,54.15A73.92,73.92,0,0,0,140.22,280a136.8,136.8,0,1,0,240.46-59.1Z"
              />
            </g>

            {/* --- 3. RIGHT EAR BONE --- */}
            <g
              id="aiki-right-ear"
              style={{
                transformOrigin: '842px 328px',
                transform: `rotate(${rightEarRot}deg)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <circle fill="#fffdfa" cx="841.79" cy="328.08" r="217.37" />
              <path
                fill="url(#aiki-right-ear-grad)"
                d="M672.83,191.27a116.88,116.88,0,0,1,12.48-15.4l62-64.66L823.9,31.39c54.26-56.57,149.42-33.18,171.28,42.1L1026,179.71l25,86a118.44,118.44,0,0,1,3.92,19.43,216.61,216.61,0,0,1-2.05,94.79c-28.65,116.58-146.39,187.85-263,159.2s-187.85-146.39-159.2-263A216.43,216.43,0,0,1,672.83,191.27Z"
              />
              <path
                fill="#f3a3a3"
                d="M740.65,220.85a73.69,73.69,0,0,1,7.85-9.69l39-40.69,48.19-50.24c34.15-35.6,94-20.88,107.8,26.5l19.41,66.85,15.72,54.15A73.92,73.92,0,0,1,981.11,280a136.8,136.8,0,1,1-240.46-59.1Z"
              />
            </g>

            {/* --- 4. LEGS BONES --- */}
            <g
              id="aiki-legs"
              style={{
                transformOrigin: '554.9px 1700px',
                transform: `scaleY(${jumpLegScaleY})`,
                transition: 'transform 0.18s ease-out',
              }}
            >
              {/* Left Leg */}
              <g id="aiki-left-leg" style={{ transformOrigin: '251px 1488px', transform: state === 'celebrate' ? (celebrateStep % 2 === 0 ? 'rotate(-5deg)' : 'rotate(3deg)') : 'none' }}>
                <circle fill="#ff8517" cx="251.31" cy="1488.77" r="247.1" />
                <path
                  fill="#ff8517"
                  d="M498.41,1480c-.36-132-111.28-238.64-247.75-238.29S3.85,1349.28,4.21,1481.24c0,0,0,2.12.1,6.07v.21c.78,27,7.48,137.42,64.35,248.5A38.4,38.4,0,0,1,67,1774.09c-49.65,79.1-64.85,153.44,47.75,158.82C361,1944.66,404.26,1911.53,441.91,1888c31.61-19.72,50-294.14,55-381.53A232.85,232.85,0,0,0,498.41,1480Z"
                />
                <path
                  fill="url(#aiki-left-leg-grad)"
                  d="M498.37,1492.15c0-1.12,0-2.25,0-3.37V1123.54c0-136.47-110.63-247.1-247.1-247.1h0c-136.47,0-247.1,110.63-247.1,247.1v365.24c0,1.11,0,2.22,0,3.33-2.71,123.06,92.65,229.36,221.21,242.42l.76.08.71.08c.88.09,1.74.14,2.61.22l3.48.29c.49,0,1,.06,1.48.09,1.66.11,3.31.22,5,.3l1,0c1.73.08,3.46.14,5.2.18.72,0,1.44,0,2.17,0,1.15,0,2.3,0,3.45,0h.43c125.44-.07,232.83-92.12,245.47-215.38A235.18,235.18,0,0,0,498.37,1492.15Z"
                />
              </g>

              {/* Right Leg */}
              <g id="aiki-right-leg" style={{ transformOrigin: '862px 1488px', transform: state === 'celebrate' ? (celebrateStep % 2 === 0 ? 'rotate(5deg)' : 'rotate(-3deg)') : 'none' }}>
                <path
                  fill="#ff8517"
                  d="M615.06,1480c.36-132,111.28-238.64,247.75-238.29s246.8,107.6,246.44,239.56c0,0,0,2.12-.09,6.07v.21c-.78,27-7.49,137.42-64.35,248.5a38.4,38.4,0,0,0,1.63,38.07c49.66,79.1,64.86,153.44-47.74,158.82-246.18,11.75-289.49-21.38-327.13-44.87-31.61-19.72-50-294.14-55-381.53A232.85,232.85,0,0,1,615.06,1480Z"
                />
                <circle fill="#ff8517" cx="862.15" cy="1488.77" r="247.1" />
                <path
                  fill="url(#aiki-right-leg-grad)"
                  d="M615.1,1492.15c0-1.12,0-2.25,0-3.37V1123.54c0-136.47,110.63-247.1,247.09-247.1h0c136.47,0,247.1,110.63,247.1,247.1v365.24c0,1.11,0,2.22,0,3.33,2.71,123.06-92.66,229.36-221.21,242.42l-.76.08-.72.08c-.87.09-1.74.14-2.61.22l-3.47.29-1.49.09c-1.65.11-3.3.22-5,.3l-1,0c-1.73.08-3.46.14-5.2.18l-2.17,0c-1.15,0-2.3,0-3.46,0h-.42c-125.45-.07-232.84-92.12-245.47-215.38A233.14,233.14,0,0,1,615.1,1492.15Z"
                />
              </g>
            </g>

            {/* --- 5. MAIN TORSO / SKULL SILHOUETTE --- */}
            <rect fill="url(#aiki-body-grad)" y="146.56" width="1109.81" height="1544.56" rx="545.18" />

            {/* Forehead Orange Fur Patch */}
            <path
              fill="#ff8517"
              d="M1099.72,585C970,660.44,793.46,636.23,673.79,516.56c-103.21-103.21-135.42-248.71-93.92-370C837.84,153.49,1051.1,339.61,1099.72,585Z"
            />

            {/* --- 6. NOSE & EYES --- */}
            {/* Nose */}
            <path
              fill="#f3a3a3"
              d="M590.33,517.19a50.41,50.41,0,0,1-74.44,0h0l-8.24-9c-12.88-14.11,3.22-31.73,29-31.73h32.93c25.77,0,41.87,17.62,29,31.73l-8.23,9Z"
            />

            {/* Eyes */}
            <g id="aiki-eyes">
              {shouldBlink || state === 'celebrate' ? (
                /* Happy curved / closed eyes */
                <g id="aiki-eyes-closed">
                  <path
                    fill="#84391a"
                    d="M440.5,473.42a16,16,0,0,1-10.11-3.59c-41-33.3-84.09-43.53-127.93-30.4-33.06,9.89-53.87,29.39-54.08,29.58a16.06,16.06,0,1,1-22.1-23.3c1.07-1,26.65-25,67-37a156.47,156.47,0,0,1,72-4.61c29.48,5.08,58.2,18.82,85.34,40.84a16.06,16.06,0,0,1-10.13,28.53Z"
                  />
                  <path
                    fill="#84391a"
                    d="M875.81,473.42a16,16,0,0,1-10.11-3.59c-41-33.3-84.08-43.53-127.93-30.4-33,9.89-53.87,29.39-54.07,29.58a16.06,16.06,0,1,1-22.11-23.3c1.07-1,26.66-25,67-37a156.47,156.47,0,0,1,72-4.61c29.49,5.08,58.2,18.82,85.34,40.84a16.06,16.06,0,0,1-10.13,28.53Z"
                  />
                </g>
              ) : (
                /* Expressive rounded dot eyes with look-at tracking */
                <g id="aiki-eyes-open">
                  <rect
                    fill="#84391a"
                    x={287.35 + headLookX * 0.6}
                    y={357.97 + headLookY * 0.6}
                    width="96.31"
                    height="151.34"
                    rx="48.15"
                    style={{ transition: 'x 0.1s ease-out, y 0.1s ease-out' }}
                  />
                  <rect
                    fill="#84391a"
                    x={722.56 + headLookX * 0.6}
                    y={357.97 + headLookY * 0.6}
                    width="96.31"
                    height="151.34"
                    rx="48.15"
                    style={{ transition: 'x 0.1s ease-out, y 0.1s ease-out' }}
                  />
                </g>
              )}
            </g>

            {/* --- 7. MOUTH & LIPSYNC VISEMES --- */}
            <g id="aiki-mouth">
              {controlledViseme ? (
                /* Manual viseme preview button override */
                <g id="aiki-viseme-preview">
                  {renderVisemeContent(controlledViseme)}
                </g>
              ) : effectiveSpeaking ? (
                /* Active text speech lipsync */
                <g id="aiki-viseme-speaking">
                  {renderVisemeContent(currentViseme)}
                </g>
              ) : state === 'celebrate' ? (
                /* Big Laughing Open Mouth with 2 cute fangs */
                <g id="aiki-mouth-celebrate">
                  <path
                    d="M 390 535 Q 553 480 716 535 Q 745 660 553 660 Q 361 660 390 535 Z"
                    fill="#d83d00"
                    stroke="#84391a"
                    strokeWidth="10"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 440 615 Q 553 580 666 615 Q 616 655 553 655 Q 490 655 440 615 Z"
                    fill="#ff8517"
                  />
                  <polygon points="435,524 455,524 445,552" fill="#fffdfa" stroke="#84391a" strokeWidth="6" strokeLinejoin="round" />
                  <polygon points="651,524 671,524 661,552" fill="#fffdfa" stroke="#84391a" strokeWidth="6" strokeLinejoin="round" />
                </g>
              ) : state === 'eat' ? (
                /* Eating / munching */
                <g id="aiki-mouth-eat">
                  {chewFrame === 1 ? (
                    <g id="aiki-chew-open">
                      <path d="M 470 540 Q 553 650 636 540 Q 553 520 470 540 Z" fill="#d83d00" />
                      <path d="M 505 605 Q 553 645 601 605 Z" fill="#f3a3a3" />
                      <path d="M 553 517 L 553 530" stroke="#84391a" strokeWidth="10" strokeLinecap="round" />
                    </g>
                  ) : chewFrame === 3 ? (
                    <g id="aiki-chew-tongue">
                      <path d="M 553 517 L 553 538" stroke="#84391a" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 553 538 Q 500 575 450 540" stroke="#84391a" strokeWidth="12" fill="none" strokeLinecap="round" />
                      <path d="M 553 538 Q 606 575 656 540" stroke="#84391a" strokeWidth="12" fill="none" strokeLinecap="round" />
                      <ellipse cx="553" cy="565" rx="30" ry="20" fill="#f3a3a3" stroke="#84391a" strokeWidth="6" />
                    </g>
                  ) : (
                    <g id="aiki-chew-closed">
                      <path d="M 553 517 L 553 538" stroke="#84391a" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 553 538 Q 500 575 450 540" stroke="#84391a" strokeWidth="12" fill="none" strokeLinecap="round" />
                      <path d="M 553 538 Q 606 575 656 540" stroke="#84391a" strokeWidth="12" fill="none" strokeLinecap="round" />
                    </g>
                  )}
                </g>
              ) : state === 'hint' ? (
                /* Hint smile */
                <g id="aiki-mouth-hint">
                  <path d="M 465 540 Q 553 620 641 540 Q 553 525 465 540 Z" fill="#d83d00" />
                  <path d="M 505 585 Q 553 615 601 585 Z" fill="#f3a3a3" />
                  <path d="M 553 517 L 553 530" stroke="#84391a" strokeWidth="10" strokeLinecap="round" />
                </g>
              ) : (
                /* Default Closed :3 */
                <g id="aiki-mouth-default">
                  {renderVisemeContent('closed')}
                </g>
              )}
            </g>

            {/* Sleepy Snot Bubble */}
            {state === 'sleepy' && (
              <g id="aiki-snot-bubble" transform="translate(553, 510)">
                <circle cx="0" cy="0" r={45 + (breathePhase * 35)} fill="url(#sleep-bubble-grad)" stroke="#ffffff" strokeWidth="4" opacity="0.85" />
                <ellipse cx="-10" cy="-12" rx="12" ry="7" fill="#ffffff" opacity="0.75" transform="rotate(-20 -10 -12)" />
              </g>
            )}

            {/* --- 8. FRONT ARMS & PAWS (Left & Right Arms) --- */}
            <g id="aiki-arms">
              {/* Left Arm (Viewer's Left, Mascot's Right) */}
              <g
                id="aiki-left-arm"
                style={{
                  transformOrigin: '140px 880px',
                  transform: `translate(${leftArmTranslateX}px, ${leftArmTranslateY}px) rotate(${leftArmRot}deg)`,
                  transition: 'transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {leftArmMode === 'raised-wave' ? (
                  /* Raised Waving Arm */
                  <g id="aiki-left-arm-raised" transform="translate(-294.07, 56.78)">
                    <path fill="#ff8517" d="M174.7,559.66,442.33,677.57a99.54,99.54,0,0,1-68.47,186.94L93.38,781.68a120.41,120.41,0,0,1-14.76-4.37A119.2,119.2,0,1,1,174.7,559.66Z" />
                    <path fill="#ff8517" d="M386.33,522.27c12.13-16.9,18-37.65,18.92-59.71.08-2.09.12-4.18.12-6.29s-.06-4.17-.15-6.28-.23-4.47-.42-6.73c-1.88-22.51-8.4-45.59-18.37-66.73q-1.23-2.64-2.55-5.23c-.43-.87-.89-1.74-1.34-2.6q-1.4-2.65-2.86-5.26c-12.13-21.6-27.91-40.37-45.89-53.27a106.44,106.44,0,0,0-18.12-10.55c-1.66-.75-3.32-1.45-5-2.08-52.54-20.17-104.45,16.17-142.06,68.61a135.47,135.47,0,0,0-7.85,12.29l-138.45,217A119.2,119.2,0,0,0,216.07,734.38c.41-.58.81-1.15,1.2-1.73L377.12,533.74A133.14,133.14,0,0,0,386.33,522.27Z" />
                    <path fill="#f47016" d="M386.33,522.27c12.13-16.9,18-37.65,18.92-59.71.08-2.09.12-4.18.12-6.29s-.06-4.17-.15-6.28-.23-4.47-.42-6.73c-1.88-22.51-8.4-45.59-18.37-66.73q-1.23-2.64-2.55-5.23c-.43-.87-.89-1.74-1.34-2.6q-1.4-2.65-2.86-5.26c-12.13-21.6-27.91-40.37-45.89-53.27a106.44,106.44,0,0,0-18.12-10.55c-1.66-.75-3.32-1.45-5-2.08-52.54-20.17-104.45,16.17-142.06,68.61,0,0,160.51,15.91,208.48,167.59A133.14,133.14,0,0,0,386.33,522.27Z" />
                  </g>
                ) : leftArmMode === 'bent-to-mouth' ? (
                  /* Bent to mouth Arm */
                  <g id="aiki-left-arm-bent">
                    <path fill="#ff8517" d="M353.89,1051.91,87.82,930.49a99.54,99.54,0,0,1,70.92-186L438.1,831a119.25,119.25,0,0,1,83.64,158.39,119.21,119.21,0,0,1-153.85,68.93A122.68,122.68,0,0,1,353.89,1051.91Z" />
                    <circle fill="#ff8517" cx="410.24" cy="948.32" r="119.2" />
                    <path fill="#ff8517" d="M669.85,792.43c11.26-17.49,16.11-38.51,15.89-60.59,0-2.09-.09-4.18-.2-6.29s-.26-4.16-.46-6.26-.46-4.46-.76-6.7c-3-22.38-10.68-45.11-21.7-65.72q-1.36-2.58-2.81-5.09c-.48-.86-1-1.7-1.47-2.54q-1.51-2.58-3.12-5.1c-13.2-21-29.91-38.92-48.51-50.9a105.36,105.36,0,0,0-18.63-9.63q-2.54-1-5.07-1.83c-53.49-17.5-103.51,21.4-138.43,75.67a136.78,136.78,0,0,0-7.22,12.67L310,883.81a119.2,119.2,0,0,0,200.48,129c.38-.6.75-1.19,1.11-1.78L661.23,804.34A133.49,133.49,0,0,0,669.85,792.43Z" />
                    <path fill="#f47016" d="M669.85,792.43c11.26-17.49,16.11-38.51,15.89-60.59,0-2.09-.09-4.18-.2-6.29s-.26-4.16-.46-6.26-.46-4.46-.76-6.7c-3-22.38-10.68-45.11-21.7-65.72q-1.36-2.58-2.81-5.09c-.48-.86-1-1.7-1.47-2.54q-1.51-2.58-3.12-5.1c-13.2-21-29.91-38.92-48.51-50.9a105.36,105.36,0,0,0-18.63-9.63q-2.54-1-5.07-1.83c-53.49-17.5-103.51,21.4-138.43,75.67,0,0,161.11,7.82,216.65,156.89A133.49,133.49,0,0,0,669.85,792.43Z" />
                  </g>
                ) : (
                  /* Standard Clean Left Arm */
                  <g id="aiki-left-arm-resting">
                    <path fill="#ff8517" d="M21.21,1141.66,21.3,849.2A99.54,99.54,0,0,1,220,836.55l37.19,290.08a123.24,123.24,0,0,1,2,15.27,119.21,119.21,0,1,1-237.92-.24Z" />
                    <circle fill="#ff8517" cx="140.16" cy="1149.48" r="119.2" />
                    <path fill="#ff8517" d="M23.75,1429c1.32,20.76,9.89,40.56,23.17,58.2q1.89,2.49,3.9,4.94c1.31,1.61,2.68,3.2,4.08,4.76s3,3.32,4.59,4.95c15.71,16.22,35.37,30,56.47,40q2.64,1.26,5.29,2.43c.89.4,1.79.78,2.68,1.17q2.76,1.17,5.54,2.26c23.07,9,47.18,13.57,69.26,12.16a106,106,0,0,0,20.7-3.3c1.76-.47,3.49-1,5.17-1.54C278,1537.4,295.2,1476.4,291.1,1412a134.41,134.41,0,0,0-1.71-14.48L259.12,1141.9A119.2,119.2,0,0,0,21.2,1157.05c.05.7.1,1.4.17,2.09l2.25,255.18A133.74,133.74,0,0,0,23.75,1429Z" />
                    <path fill="#f47016" d="M23.75,1429c1.32,20.76,9.89,40.56,23.17,58.2q1.89,2.49,3.9,4.94c1.31,1.61,2.68,3.2,4.08,4.76s3,3.32,4.59,4.95c15.71,16.22,35.37,30,56.47,40q2.64,1.26,5.29,2.43c.89.4,1.79.78,2.68,1.17q2.76,1.17,5.54,2.26c23.07,9,47.18,13.57,69.26,12.16a106,106,0,0,0,20.7-3.3c1.76-.47,3.49-1,5.17-1.54C278,1537.4,295.2,1476.4,291.1,1412c0,0-134.3,89.33-267.48,2.32A133.74,133.74,0,0,0,23.75,1429Z" />
                  </g>
                )}

                {/* Golden Fish Cookie Snack */}
                {state === 'eat' && (
                  <g id="aiki-fish-cookie" transform="translate(180, 1120) rotate(-35)">
                    <path d="M 120 45 Q 160 8 200 45 Z" fill="#d97706" />
                    <path d="M 120 165 Q 160 200 200 165 Z" fill="#d97706" />
                    <polygon points="255,105 310,60 295,105 310,150" fill="#f59e0b" stroke="#b45309" strokeWidth="6" strokeLinejoin="round" />
                    <path d="M 25 105 Q 25 45 145 45 Q 255 45 255 105 Q 255 165 145 165 Q 25 165 25 105 Z" fill="url(#fish-cookie-grad)" stroke="#b45309" strokeWidth="8" />
                    <circle cx="70" cy="85" r="10" fill="#78350f" />
                    <circle cx="66" cy="81" r="3" fill="#ffffff" />
                    <path d="M 120 75 Q 135 90 120 105 M 145 75 Q 160 90 145 105 M 130 105 Q 145 120 130 135" stroke="#b45309" strokeWidth="6" fill="none" strokeLinecap="round" />
                  </g>
                )}
              </g>

              {/* Right Arm (Viewer's Right, Mascot's Left) */}
              <g
                id="aiki-right-arm"
                style={{
                  transformOrigin: '970px 880px',
                  transform: `rotate(${rightArmRot}deg)`,
                  transition: 'transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <g id="aiki-right-arm-clean">
                  <path fill="#ff8517" d="M1089.39,1141.66l-.09-292.46a99.54,99.54,0,0,0-198.68-12.65l-37.19,290.08a123.24,123.24,0,0,0-2,15.27,119.21,119.21,0,1,0,237.92-.24Z" />
                  <circle fill="#ff8517" cx="970.44" cy="1149.48" r="119.2" />
                  <path fill="#ff8517" d="M1086.85,1429c-1.32,20.76-9.89,40.56-23.17,58.2q-1.89,2.49-3.9,4.94c-1.31,1.61-2.68,3.2-4.08,4.76s-3,3.32-4.59,4.95c-15.71,16.22-35.37,30-56.47,40q-2.64,1.26-5.29,2.43c-.89.4-1.79.78-2.68,1.17q-2.76,1.17-5.54,2.26c-23.07,9-47.18,13.57-69.26,12.16a106,106,0,0,1-20.7-3.3c-1.76-.47-3.49-1-5.17-1.54-53.43-17.66-70.6-78.66-66.5-143.06a134.41,134.41,0,0,1,1.71-14.48l30.27-255.62a119.2,119.2,0,0,1,237.92,15.15c-.05.7-.1,1.4-.16,2.09L1087,1414.32A133.74,133.74,0,0,1,1086.85,1429Z" />
                  <path fill="#f47016" d="M1086.85,1429c-1.32,20.76-9.89,40.56-23.17,58.2q-1.89,2.49-3.9,4.94c-1.31,1.61-2.68,3.2-4.08,4.76s-3,3.32-4.59,4.95c-15.71,16.22-35.37,30-56.47,40q-2.64,1.26-5.29,2.43c-.89.4-1.79.78-2.68,1.17q-2.76,1.17-5.54,2.26c-23.07,9-47.18,13.57-69.26,12.16a106,106,0,0,1-20.7-3.3c-1.76-.47-3.49-1-5.17-1.54-53.43-17.66-70.6-78.66-66.5-143.06,0,0,134.3,89.33,267.48,2.32A133.74,133.74,0,0,1,1086.85,1429Z" />
                </g>
              </g>
            </g>
          </g>

          {/* --- 9. DEBUG SKELETON (AIKI) --- */}
          {showBones && (
            <g id="aiki-bones-debug" className="animate-in fade-in">
              <line x1="555" y1="1691" x2="555" y2="450" stroke="#ef4444" strokeWidth="12" strokeDasharray="20 12" />
              <line x1="555" y1="1691" x2="628" y2="1578" stroke="#f97316" strokeWidth="10" strokeDasharray="16 10" />
              <line x1="628" y1="1578" x2="1281" y2="1376" stroke="#f97316" strokeWidth="10" strokeDasharray="16 10" />
              <line x1="555" y1="1691" x2="251" y2="1488" stroke="#84cc16" strokeWidth="10" strokeDasharray="16 10" />
              <line x1="555" y1="1691" x2="862" y2="1488" stroke="#84cc16" strokeWidth="10" strokeDasharray="16 10" />
              <line x1="555" y1="880" x2="140" y2="880" stroke="#06b6d4" strokeWidth="10" strokeDasharray="16 10" />
              <line x1="555" y1="880" x2="970" y2="880" stroke="#06b6d4" strokeWidth="10" strokeDasharray="16 10" />
              <line x1="555" y1="450" x2="280" y2="328" stroke="#a855f7" strokeWidth="10" strokeDasharray="16 10" />
              <line x1="555" y1="450" x2="842" y2="328" stroke="#a855f7" strokeWidth="10" strokeDasharray="16 10" />

              <circle cx="555" cy="1691" r="25" fill="#ef4444" stroke="#ffffff" strokeWidth="6" />
              <circle cx="555" cy="450" r="25" fill="#ef4444" stroke="#ffffff" strokeWidth="6" />
              <circle cx="280" cy="328" r="20" fill="#a855f7" stroke="#ffffff" strokeWidth="5" />
              <circle cx="842" cy="328" r="20" fill="#a855f7" stroke="#ffffff" strokeWidth="5" />
              <circle cx="140" cy="880" r="20" fill="#06b6d4" stroke="#ffffff" strokeWidth="5" />
              <circle cx="970" cy="880" r="20" fill="#06b6d4" stroke="#ffffff" strokeWidth="5" />
              <circle cx="251" cy="1488" r="20" fill="#84cc16" stroke="#ffffff" strokeWidth="5" />
              <circle cx="862" cy="1488" r="20" fill="#84cc16" stroke="#ffffff" strokeWidth="5" />
              <circle cx="628" cy="1578" r="20" fill="#f97316" stroke="#ffffff" strokeWidth="5" />
            </g>
          )}
        </svg>
      )}
    </div>
  )
}
