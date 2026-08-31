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
  const { viseme: autoViseme, activeGesture } = useMeeCatSpeech({
    text: effectiveSpeechText,
    isSpeaking: effectiveSpeaking,
    gesture,
    onSpeechEnd,
  })

  const currentViseme = controlledViseme || autoViseme
  const effectiveGesture: Gesture = gesture !== 'auto' ? gesture : activeGesture

  // Rive Engine Fallback
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
      setCursorPos({ x: deltaX * 25, y: deltaY * 15 })
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
    if (state !== 'celebrate' && effectiveGesture !== 'celebrate' && effectiveGesture !== 'celebrate-1' && effectiveGesture !== 'celebrate-2') return
    const jumpInterval = setInterval(() => {
      setCelebrateStep((prev) => (prev + 1) % 4)
    }, 200)
    return () => clearInterval(jumpInterval)
  }, [state, effectiveGesture])

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

  // Active cadence step loop
  useEffect(() => {
    const isGestureActive = state === 'talk' || effectiveSpeaking || (effectiveGesture && effectiveGesture !== 'idle')
    if (!isGestureActive) return
    const talkInterval = setInterval(() => {
      setTalkStep((prev) => (prev + 1) % 4)
    }, 260)
    return () => clearInterval(talkInterval)
  }, [effectiveSpeaking, state, effectiveGesture])

  // Tail rhythm
  useEffect(() => {
    const tailInterval = setInterval(() => {
      setTailFrame((prev) => (prev + 1) % 4)
    }, state === 'celebrate' ? 140 : effectiveSpeaking ? 220 : 350)
    return () => clearInterval(tailInterval)
  }, [state, effectiveSpeaking])

  const shouldBlink = isBlinking || internalBlink || state === 'sleepy'
  const activeQuote = quote?.trim() || ''

  // --- CỬ ĐỘNG LIẾC MẮT (EYE SIDE-GLANCE TOWARDS SCREEN/BOARD) ---
  const isPointingLeft = effectiveGesture === 'point-left' || effectiveGesture === 'point-high-left' || effectiveGesture === 'point-low-left'
  const isPointingRight = effectiveGesture === 'point-right' || effectiveGesture === 'point-high-right' || effectiveGesture === 'point-low-right'

  const eyeLookX = state === 'look' || isHovered
    ? cursorPos.x
    : effectiveGesture === 'think'
    ? 18
    : effectiveGesture === 'idea'
    ? 14
    : effectiveGesture === 'point-high-left'
    ? -28
    : effectiveGesture === 'point-left'
    ? -32
    : effectiveGesture === 'point-low-left'
    ? -26
    : effectiveGesture === 'point-high-right'
    ? 28
    : effectiveGesture === 'point-right'
    ? 32
    : effectiveGesture === 'point-low-right'
    ? 26
    : 0

  const eyeLookY = state === 'look' || isHovered
    ? cursorPos.y
    : effectiveGesture === 'think'
    ? -15
    : effectiveGesture === 'idea'
    ? -18
    : effectiveGesture === 'point-high-left' || effectiveGesture === 'point-high-right'
    ? -14
    : effectiveGesture === 'point-low-left' || effectiveGesture === 'point-low-right'
    ? 12
    : 0

  // Head Position and Tilting
  const headTiltRot = effectiveGesture === 'think'
    ? 6
    : effectiveGesture === 'idea'
    ? -4
    : effectiveGesture === 'point-high-left'
    ? -5
    : effectiveGesture === 'point-left'
    ? -3
    : effectiveGesture === 'point-high-right'
    ? 5
    : effectiveGesture === 'point-right'
    ? 3
    : effectiveSpeaking
    ? [0, 1.5, -1, 1][talkStep]
    : 0

  const headNodY = effectiveSpeaking ? [0, 4, -2, 5][talkStep] : 0
  const sleepyHeadDrop = state === 'sleepy' ? [0, 6, 14, 20, 10, 3][sleepyNod] : 0

  // Ear rotation
  const leftEarRot = (-earAngle * 0.2) + (effectiveSpeaking ? (talkStep % 2 === 0 ? -2 : 2) : 0)
  const rightEarRot = (earAngle * 0.2) - (effectiveSpeaking ? (talkStep % 2 === 0 ? -2 : 2) : 0)

  // Tail animations
  const tailBaseRot = tailWiggle + (state === 'celebrate' ? [-14, 18, -10, 15][tailFrame] : state === 'sleepy' ? -5 : effectiveSpeaking ? [-6, 8, -5, 7][tailFrame] : [0, 5, -3, 3][tailFrame])

  // Celebrate jump displacement
  const jumpY = (state === 'celebrate' || effectiveGesture === 'celebrate-1' || effectiveGesture === 'celebrate-2')
    ? [8, -30, -25, 4][celebrateStep]
    : 0

  // Determine current active pose
  const activePose: Gesture = (state === 'celebrate')
    ? 'celebrate-2'
    : (state === 'hint')
    ? 'idea'
    : (effectiveSpeaking || state === 'talk' || (effectiveGesture && effectiveGesture !== 'idle'))
    ? effectiveGesture
    : 'presentation'

  // RENDER 5 VISEMES CUTE
  const renderVisemeContent = (vis: Viseme) => {
    switch (vis) {
      case 'open':
        /* A / Ă / Â (Mở to thoáng hạt dẻ) */
        return (
          <g id="aiki-viseme-open">
            <path
              d="M 240 300 Q 315.8 380 392 300 Q 315.8 285 240 300 Z"
              fill="#d83d00"
              stroke="#84391a"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M 265 348 Q 315.8 375 365 348 Q 315.8 335 265 348 Z"
              fill="#ff8517"
            />
            <polygon points="262,295 274,295 268,310" fill="#fffdfa" stroke="#84391a" strokeWidth="2" />
            <polygon points="358,295 370,295 364,310" fill="#fffdfa" stroke="#84391a" strokeWidth="2" />
            <path d="M 315.8 290 L 315.8 296" stroke="#84391a" strokeWidth="6" strokeLinecap="round" />
          </g>
        )
      case 'round':
        /* O / Ô / Ơ / U / Ư (Chu tròn Ooh) */
        return (
          <g id="aiki-viseme-round">
            <ellipse cx="315.8" cy="330" rx="32" ry="36" fill="#d83d00" stroke="#84391a" strokeWidth="6" />
            <ellipse cx="315.8" cy="346" rx="20" ry="13" fill="#ff8517" />
            <path d="M 315.8 290 L 315.8 300" stroke="#84391a" strokeWidth="6" strokeLinecap="round" />
          </g>
        )
      case 'smile':
        /* E / Ê / I / Y (Cười dẹt trăng khuyết) */
        return (
          <g id="aiki-viseme-smile">
            <path
              d="M 242 302 Q 315.8 355 390 302 Q 315.8 290 242 302 Z"
              fill="#d83d00"
              stroke="#84391a"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M 270 330 Q 315.8 350 360 330 Z"
              fill="#ff8517"
            />
            <polygon points="270,297 280,297 275,308" fill="#fffdfa" />
            <polygon points="350,297 360,297 355,308" fill="#fffdfa" />
            <path d="M 315.8 290 L 315.8 298" stroke="#84391a" strokeWidth="6" strokeLinecap="round" />
          </g>
        )
      case 'half':
        /* HALF (Mấp máy nhẹ nhàng) */
        return (
          <g id="aiki-viseme-half">
            <path
              d="M 262 302 Q 315.8 335 370 302 Q 315.8 294 262 302 Z"
              fill="#d83d00"
              stroke="#84391a"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <ellipse cx="315.8" cy="320" rx="18" ry="9" fill="#ff8517" />
            <path d="M 315.8 290 L 315.8 298" stroke="#84391a" strokeWidth="6" strokeLinecap="round" />
          </g>
        )
      case 'closed':
      default:
        /* CLOSED (:3) */
        return (
          <g id="aiki-viseme-closed">
            <path d="M 315.8 290 L 315.8 302" stroke="#84391a" strokeWidth="7" strokeLinecap="round" />
            <path d="M 315.8 302 Q 282 325 250 302" stroke="#84391a" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 315.8 302 Q 350 325 382 302" stroke="#84391a" strokeWidth="7" fill="none" strokeLinecap="round" />
          </g>
        )
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center select-none overflow-visible w-full h-full',
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
          viewBox="-400 -60 1450 1200"
          className="h-full w-full drop-shadow-md transition-transform duration-200 ease-out"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          aria-label="Mèo AIKI Official Action Rig"
          style={{
            transform: `translateY(${jumpY}px)`,
          }}
        >
          <defs>
            <linearGradient id="aiki-act-tail" x1="1093.71" y1="-1079.4" x2="604.3" y2="-766.44" gradientTransform="matrix(0.39, 0.89, -0.9, 0.4, -616.67, 483.56)" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff8517" />
              <stop offset="0.52" stopColor="#f87716" />
              <stop offset="1" stopColor="#f47016" />
            </linearGradient>
            <linearGradient id="aiki-act-lear" x1="99.31" y1="6.25" x2="197.98" y2="304.15" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fffdfa" />
              <stop offset="0.2" stopColor="#fffbf5" />
              <stop offset="0.43" stopColor="#fff6e6" />
              <stop offset="0.69" stopColor="#ffedce" />
              <stop offset="0.95" stopColor="#ffe1ad" />
              <stop offset="1" stopColor="#ffdfa6" />
            </linearGradient>
            <linearGradient id="aiki-act-rear" x1="479.05" x2="479.05" y2="310.44" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff8517" />
              <stop offset="0.44" stopColor="#fc8017" />
              <stop offset="0.96" stopColor="#f57116" />
              <stop offset="1" stopColor="#f47016" />
            </linearGradient>
            <linearGradient id="aiki-act-lleg" x1="143.02" y1="987.88" x2="143.02" y2="498.78" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff8517" />
              <stop offset="0.31" stopColor="#fc8017" />
              <stop offset="0.67" stopColor="#f57116" />
              <stop offset="0.7" stopColor="#f47016" />
            </linearGradient>
            <linearGradient id="aiki-act-rleg" x1="490.65" y1="987.88" x2="490.65" y2="498.78" xlinkHref="#aiki-act-lleg" />
            <linearGradient id="aiki-act-body" x1="315.79" y1="83.41" x2="315.79" y2="962.41" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fffdfa" />
              <stop offset="0.38" stopColor="#fffcf8" />
              <stop offset="0.56" stopColor="#fffaf0" />
              <stop offset="0.71" stopColor="#fff5e3" />
              <stop offset="0.83" stopColor="#ffeed1" />
              <stop offset="0.93" stopColor="#ffe6b9" />
              <stop offset="1" stopColor="#ffdfa6" />
            </linearGradient>
            {/* Sleep Bubble Gradient */}
            <radialGradient id="sleep-bubble-grad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
            </radialGradient>
          </defs>

          {/* --- MAIN UNIFIED MASCOT RIG (Root Origin at feet: 315.8px, 1100px) --- */}
          <g
            id="aiki-mascot-rig"
            style={{
              transformOrigin: '315.8px 1100px',
              transform: `translate(0px, ${(breathePhase * 5) + sleepyHeadDrop + headNodY}px) rotate(${headTiltRot}deg)`,
              transition: state === 'sleepy' ? 'transform 0.5s ease-in-out' : 'transform 0.22s ease-out',
            }}
          >
            {/* --- 1. TAIL (Back layer) --- */}
            <g
              id="aiki-tail-layer"
              style={{
                transformOrigin: '357px 895px',
                transform: `rotate(${tailBaseRot}deg)`,
                transition: 'transform 0.25s ease-out',
              }}
            >
              <path fill="url(#aiki-act-tail)" d="M673.51,1035.29a229.62,229.62,0,0,1-56.71-11.45q-10.15-3.4-19.54-7.59l-290-112.73c-42.34-13.63-66.14-55.45-56-94.29s51.62-64.3,95.44-56.32l309.7,37.67q10.26.76,20.85,2.53a229,229,0,0,1,55.68,16.82c65.34,29.34,107.08,86.62,92.25,143.23S745.37,1040.45,673.51,1035.29Z" />
              <path fill="#fffdfa" d="M673.51,1035.29c48.84-87.59,60.25-167.42,59.43-225.36,65.34,29.34,107.08,86.62,92.25,143.23S745.37,1040.45,673.51,1035.29Z" />
            </g>

            {/* --- 2. LEFT EAR --- */}
            <g
              id="aiki-left-ear"
              style={{
                transformOrigin: '159px 186px',
                transform: `rotate(${leftEarRot}deg)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <circle fill="#fffdfa" cx="159.09" cy="186.71" r="123.7" />
              <path fill="url(#aiki-act-lear)" d="M255.24,108.85a67.32,67.32,0,0,0-7.1-8.77l-35.3-36.79L169.27,17.87c-30.88-32.2-85-18.89-97.48,24L54.24,102.27,40,151.24a66.77,66.77,0,0,0-2.22,11,123.71,123.71,0,1,0,217.44-53.44Z" />
              <path fill="#f3a3a3" d="M216.65,125.68a42.45,42.45,0,0,0-4.47-5.51L190,97,162.54,68.42C143.1,48.16,109,56.54,101.19,83.5l-11,38.05-9,30.81a41.67,41.67,0,0,0-1.4,7,77.85,77.85,0,1,0,136.85-33.64Z" />
            </g>

            {/* --- 3. RIGHT EAR --- */}
            <g
              id="aiki-right-ear"
              style={{
                transformOrigin: '479px 186px',
                transform: `rotate(${rightEarRot}deg)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <circle fill="#fffdfa" cx="479.06" cy="186.71" r="123.7" />
              <path fill="url(#aiki-act-rear)" d="M382.9,108.85a67.41,67.41,0,0,1,7.11-8.77L425.3,63.29l43.58-45.42c30.88-32.2,85-18.89,97.47,24l17.55,60.45,14.22,49a66.81,66.81,0,0,1,2.23,11A123.7,123.7,0,1,1,382.9,108.85Z" />
              <path fill="#f3a3a3" d="M421.5,125.68a41.64,41.64,0,0,1,4.47-5.51L448.18,97,475.6,68.42C495,48.16,529.12,56.54,537,83.5l11,38.05,8.94,30.81a42.74,42.74,0,0,1,1.41,7A77.85,77.85,0,1,1,421.5,125.68Z" />
            </g>

            {/* --- 4. LEGS --- */}
            <g id="aiki-legs">
              {/* Left Leg */}
              <circle fill="#ff8517" cx="143.02" cy="847.26" r="140.62" />
              <path fill="#ff8517" d="M283.64,842.25c-.2-75.1-63.33-135.82-141-135.62S2.19,767.87,2.4,843c0,0,0,1.2.05,3.45v.12C2.9,861.92,6.72,924.75,39.08,988a21.85,21.85,0,0,1-.93,21.66C9.89,1054.64,1.24,1097,65.32,1100c140.1,6.69,164.75-12.17,186.17-25.53,18-11.23,28.44-167.4,31.33-217.13A132.27,132.27,0,0,0,283.64,842.25Z" />
              <path fill="url(#aiki-act-lleg)" d="M283.62,849.18c0-.64,0-1.28,0-1.92V639.4A140.62,140.62,0,0,0,143,498.78h0A140.62,140.62,0,0,0,2.4,639.4V847.26c0,.63,0,1.26,0,1.89-1.54,70,52.73,130.53,125.89,138l.44,0,.4.05,1.49.12c.66.06,1.31.12,2,.16l.85.06c.94.06,1.88.12,2.83.16l.57,0c1,0,2,.08,3,.1h1.23c.66,0,1.31,0,2,0h.24c71.39,0,132.51-52.42,139.7-122.57A134.56,134.56,0,0,0,283.62,849.18Z" />

              {/* Right Leg */}
              <circle fill="#ff8517" cx="490.65" cy="847.26" r="140.62" />
              <path fill="#ff8517" d="M350,842.25c.2-75.1,63.33-135.82,141-135.62S631.48,767.87,631.27,843c0,0,0,1.2,0,3.45v.12c-.44,15.38-4.26,78.21-36.62,141.42a21.82,21.82,0,0,0,.93,21.66c28.26,45,36.91,87.33-27.17,90.39-140.1,6.69-164.75-12.17-186.17-25.53-18-11.23-28.44-167.4-31.33-217.13A132.27,132.27,0,0,1,350,842.25Z" />
              <path fill="url(#aiki-act-rleg)" d="M350.05,849.18c0-.64,0-1.28,0-1.92V639.4A140.62,140.62,0,0,1,490.65,498.78h0A140.62,140.62,0,0,1,631.27,639.4V847.26c0,.63,0,1.26,0,1.89,1.54,70-52.73,130.53-125.9,138l-.43,0-.4.05-1.49.12c-.66.06-1.31.12-2,.16l-.84.06c-.94.06-1.88.12-2.83.16l-.57,0c-1,0-2,.08-3,.1h-1.24c-.65,0-1.3,0-2,0h-.25c-71.38,0-132.5-52.42-139.69-122.57A132.51,132.51,0,0,1,350.05,849.18Z" />
            </g>

            {/* --- 5. MAIN TORSO --- */}
            <rect fill="url(#aiki-act-body)" y="83.41" width="631.59" height="879" rx="310.26" />

            {/* Forehead Orange Fur Patch */}
            <path fill="#ff8517" d="M625.85,332.91C552,375.85,451.55,362.08,383.45,294,324.71,235.24,306.38,152.43,330,83.41,476.81,87.35,598.18,193.27,625.85,332.91Z" />

            {/* --- 6. NOSE & EYES --- */}
            {/* Nose */}
            <path fill="#f3a3a3" d="M336,294.33a28.69,28.69,0,0,1-42.36,0h0l-4.69-5.13c-7.33-8,1.84-18.06,16.5-18.06h18.74c14.66,0,23.83,10,16.5,18.06L336,294.33Z" />

            {/* Eyes */}
            <g id="aiki-eyes">
              {shouldBlink || activePose === 'celebrate-2' ? (
                /* Happy curved / closed eyes */
                <g id="aiki-eyes-closed">
                  <path fill="#84391a" d="M250.7,269.4a9.1,9.1,0,0,1-5.7-2c-23.3-19-47.8-24.8-72.8-17.3a83.7,83.7,0,0,0-30.8,16.8,9.1,9.1,0,1,1-12.6-13.3,102.3,102.3,0,0,1,38.1-21.1,89.2,89.2,0,0,1,41-2.6c16.8,2.9,33.1,10.7,48.6,23.3a9.1,9.1,0,0,1-5.8,16.2Z" />
                  <path fill="#84391a" d="M498.4,269.4a9.1,9.1,0,0,1-5.7-2c-23.4-19-47.9-24.8-72.8-17.3a83.7,83.7,0,0,0-30.8,16.8,9.1,9.1,0,1,1-12.6-13.3,102.3,102.3,0,0,1,38.1-21.1,89.2,89.2,0,0,1,41-2.6c16.8,2.9,33.1,10.7,48.6,23.3a9.1,9.1,0,0,1-5.8,16.2Z" />
                </g>
              ) : (
                /* Expressive rounded dot eyes with side-glance & catchlights */
                <g id="aiki-eyes-open">
                  {/* Left Eye & Pupil Catchlight */}
                  <g style={{ transform: `translate(${eyeLookX}px, ${eyeLookY}px)`, transition: 'transform 0.16s ease-out' }}>
                    <rect fill="#84391a" x="163.53" y="203.72" width="54.81" height="86.13" rx="27.4" />
                    <circle cx="180" cy="225" r="8" fill="#ffffff" />
                    <circle cx="198" cy="252" r="4.5" fill="#ffffff" />
                  </g>

                  {/* Right Eye & Pupil Catchlight */}
                  <g style={{ transform: `translate(${eyeLookX}px, ${eyeLookY}px)`, transition: 'transform 0.16s ease-out' }}>
                    <rect fill="#84391a" x="411.2" y="203.72" width="54.81" height="86.13" rx="27.4" />
                    <circle cx="428" cy="225" r="8" fill="#ffffff" />
                    <circle cx="446" cy="252" r="4.5" fill="#ffffff" />
                  </g>
                </g>
              )}
            </g>

            {/* --- 7. MOUTH & LIPSYNC VISEMES --- */}
            <g id="aiki-mouth">
              {controlledViseme ? (
                <g id="aiki-viseme-preview">{renderVisemeContent(controlledViseme)}</g>
              ) : effectiveSpeaking ? (
                <g id="aiki-viseme-speaking">{renderVisemeContent(currentViseme)}</g>
              ) : activePose === 'celebrate-2' || state === 'celebrate' ? (
                <g id="aiki-viseme-celebrate">{renderVisemeContent('smile')}</g>
              ) : (
                <g id="aiki-viseme-default">{renderVisemeContent('closed')}</g>
              )}
            </g>

            {/* Sleepy Snot Bubble */}
            {state === 'sleepy' && (
              <g id="aiki-snot-bubble" transform="translate(315.8, 285)">
                <circle cx="0" cy="0" r={25 + (breathePhase * 20)} fill="url(#sleep-bubble-grad)" stroke="#ffffff" strokeWidth="3" opacity="0.85" />
                <ellipse cx="-6" cy="-7" rx="7" ry="4" fill="#ffffff" opacity="0.75" transform="rotate(-20 -6 -7)" />
              </g>
            )}

            {/* --- 8. OFFICIAL ARTIST ACTION ARMS & GESTURES --- */}
            <g id="aiki-official-action-arms">
              {/* 1. 👈 CHỈ BẢNG NGANG BÊN TRÁI (Thuyết trình - idle 3.svg) */}
              {activePose === 'point-left' && (
                <g id="pose-point-left" className="animate-in fade-in duration-150">
                  {/* Left Arm reaching straight into chalkboard */}
                  <g transform="translate(-345.84, 0)">
                    <path fill="#ff8517" d="M245.5,411.35l166.13,10a56.65,56.65,0,1,1,.44,113.29L246,545.9a67.84,67.84,0,1,1-.51-134.55Z" />
                    <circle fill="#ff8517" cx="234.98" cy="478.11" r="67.84" />
                    <path fill="#ff8517" d="M79.5,403.78c-11.84.14-23.34,4.44-33.75,11.47-1,.66-2,1.35-2.92,2.07s-1.9,1.43-2.83,2.18-2,1.62-2.94,2.46a112.25,112.25,0,0,0-24.4,30.93c-.52,1-1,1.95-1.53,2.93-.26.5-.5,1-.74,1.5-.5,1-1,2.05-1.45,3.08C3.13,473.24-.15,486.81,0,499.4a60,60,0,0,0,1.27,11.87c.21,1,.46,2,.72,3,8.48,30.88,42.64,42.42,79.37,42a75.4,75.4,0,0,0,8.28-.55l146.16-9.73a67.84,67.84,0,0,0-1.66-135.66c-.4,0-.8,0-1.19,0l-145.1-6.18A77.05,77.05,0,0,0,79.5,403.78Z" />
                    <path fill="#f47016" d="M79.5,403.78c-11.84.14-23.34,4.44-33.75,11.47-1,.66-2,1.35-2.92,2.07s-1.9,1.43-2.83,2.18-2,1.62-2.94,2.46a112.25,112.25,0,0,0-24.4,30.93c-.52,1-1,1.95-1.53,2.93-.26.5-.5,1-.74,1.5-.5,1-1,2.05-1.45,3.08C3.13,473.24-.15,486.81,0,499.4a60,60,0,0,0,1.27,11.87c.21,1,.46,2,.72,3,8.48,30.88,42.64,42.42,79.37,42,0,0-46.85-78.94,6.49-152.09A77.05,77.05,0,0,0,79.5,403.78Z" />
                  </g>
                  {/* Right Arm resting */}
                  <g transform="translate(-345.84, 0)">
                    <path fill="#ff8517" d="M1036.58,605.8,961.33,457.35A56.65,56.65,0,0,0,857.21,502l55.71,156.84a70,70,0,0,0,2.93,8.25,67.84,67.84,0,1,0,120.73-61.3Z" />
                    <circle fill="#ff8517" cx="978.11" cy="640.45" r="67.84" />
                    <path fill="#ff8517" d="M1098.5,763.76c3.67,11.25,3.31,23.53,0,35.65-.32,1.14-.66,2.28-1,3.43s-.75,2.25-1.16,3.38-.9,2.38-1.38,3.58a112.49,112.49,0,0,1-21.44,33q-1.12,1.21-2.28,2.4l-1.18,1.18c-.81.8-1.63,1.59-2.45,2.36-10.3,9.63-22.09,17.11-34.06,21a60.32,60.32,0,0,1-11.64,2.61q-1.54.18-3.06.27C986.86,874.58,965,846,953.56,811a78,78,0,0,1-2.15-8l-37.8-141.52a67.84,67.84,0,1,1,129-42.07l.36,1.14L1095.48,756A79.42,79.42,0,0,1,1098.5,763.76Z" />
                    <path fill="#f47016" d="M1098.5,763.76c3.67,11.25,3.31,23.53,0,35.65-.32,1.14-.66,2.28-1,3.43s-.75,2.25-1.16,3.38-.9,2.38-1.38,3.58a112.49,112.49,0,0,1-21.44,33q-1.12,1.21-2.28,2.4l-1.18,1.18c-.81.8-1.63,1.59-2.45,2.36-10.3,9.63-22.09,17.11-34.06,21a60.32,60.32,0,0,1-11.64,2.61q-1.54.18-3.06.27C986.86,874.58,965,846,953.56,811c0,0,89.81,19,141.92-55.08A79.42,79.42,0,0,1,1098.5,763.76Z" />
                  </g>
                </g>
              )}

              {/* 2. ☝️ CHỈ BẢNG TẦM CAO BÊN TRÁI (Thuyết trình - idle 4.svg) */}
              {(activePose === 'point-high-left' || activePose === 'point-low-left') && (
                <g id="pose-point-high-left" className="animate-in fade-in duration-150">
                  {/* Left Arm pointing up-left */}
                  <g transform="translate(-273.59, 34.8)">
                    <path fill="#ff8517" d="M168.19,488.29l139.47-90.82a56.65,56.65,0,0,1,67.76,90.8L248.66,596.13a69.07,69.07,0,0,1-6.67,5.68,67.84,67.84,0,0,1-81.15-108.74A69.37,69.37,0,0,1,168.19,488.29Z" />
                    <circle fill="#ff8517" cx="200.43" cy="546.9" r="67.84" />
                    <path fill="#ff8517" d="M137.57,386.45c-8.75-8-20.09-12.7-32.5-14.67-1.17-.18-2.35-.34-3.55-.48s-2.36-.25-3.55-.33-2.55-.17-3.83-.21A112.26,112.26,0,0,0,55.2,376.7c-1.05.35-2.09.72-3.13,1.1l-1.56.58c-1.06.41-2.11.83-3.16,1.27-13,5.42-24.67,13.09-33.16,22.4A60.69,60.69,0,0,0,7,411.59q-.79,1.34-1.5,2.67c-14.89,28.35,2.19,60.11,29.33,84.85a75.26,75.26,0,0,0,6.43,5.25L154.73,597a67.84,67.84,0,0,0,91.4-100.27l-.89-.79L143.43,392.41A76.51,76.51,0,0,0,137.57,386.45Z" />
                    <path fill="#f47016" d="M137.57,386.45c-8.75-8-20.09-12.7-32.5-14.67-1.17-.18-2.35-.34-3.55-.48s-2.36-.25-3.55-.33-2.55-.17-3.83-.21A112.26,112.26,0,0,0,55.2,376.7c-1.05.35-2.09.72-3.13,1.1l-1.56.58c-1.06.41-2.11.83-3.16,1.27-13,5.42-24.67,13.09-33.16,22.4A60.69,60.69,0,0,0,7,411.59q-.79,1.34-1.5,2.67c-14.89,28.35,2.19,60.11,29.33,84.85,0,0,19.67-89.66,108.58-106.7A76.51,76.51,0,0,0,137.57,386.45Z" />
                  </g>
                  {/* Right Arm resting */}
                  <g transform="translate(-273.59, 34.8)">
                    <path fill="#ff8517" d="M964.33,571,889.08,422.56A56.65,56.65,0,0,0,785,467.22l55.71,156.83a69.5,69.5,0,0,0,2.93,8.26A67.84,67.84,0,1,0,964.33,571Z" />
                    <circle fill="#ff8517" cx="905.86" cy="605.66" r="67.84" />
                    <path fill="#ff8517" d="M1026.25,729c3.67,11.26,3.31,23.53,0,35.65-.32,1.15-.66,2.29-1,3.43s-.75,2.26-1.16,3.38-.9,2.39-1.38,3.58a112.54,112.54,0,0,1-21.44,33c-.75.81-1.51,1.61-2.28,2.39l-1.18,1.18c-.81.81-1.63,1.59-2.45,2.37-10.3,9.63-22.09,17.1-34.06,21a61.07,61.07,0,0,1-11.64,2.61q-1.54.18-3.06.27c-32,1.91-53.89-26.73-65.27-61.65a77.79,77.79,0,0,1-2.15-8l-37.8-141.53a67.84,67.84,0,0,1,129-42.06l.36,1.14,52.51,135.39A77.78,77.78,0,0,1,1026.25,729Z" />
                    <path fill="#f47016" d="M1026.25,729c3.67,11.26,3.31,23.53,0,35.65-.32,1.15-.66,2.29-1,3.43s-.75,2.26-1.16,3.38-.9,2.39-1.38,3.58a112.54,112.54,0,0,1-21.44,33c-.75.81-1.51,1.61-2.28,2.39l-1.18,1.18c-.81.81-1.63,1.59-2.45,2.37-10.3,9.63-22.09,17.1-34.06,21a61.07,61.07,0,0,1-11.64,2.61q-1.54.18-3.06.27c-32,1.91-53.89-26.73-65.27-61.65,0,0,89.81,19,141.91-55.07A77.78,77.78,0,0,1,1026.25,729Z" />
                  </g>
                </g>
              )}

              {/* 3. 👉 CHỈ BẢNG NGANG BÊN PHẢI (Mirrored Thuyết trình - idle 3) */}
              {activePose === 'point-right' && (
                <g id="pose-point-right" transform="translate(631.59, 0) scale(-1, 1)" className="animate-in fade-in duration-150">
                  <g transform="translate(-345.84, 0)">
                    <path fill="#ff8517" d="M245.5,411.35l166.13,10a56.65,56.65,0,1,1,.44,113.29L246,545.9a67.84,67.84,0,1,1-.51-134.55Z" />
                    <circle fill="#ff8517" cx="234.98" cy="478.11" r="67.84" />
                    <path fill="#ff8517" d="M79.5,403.78c-11.84.14-23.34,4.44-33.75,11.47-1,.66-2,1.35-2.92,2.07s-1.9,1.43-2.83,2.18-2,1.62-2.94,2.46a112.25,112.25,0,0,0-24.4,30.93c-.52,1-1,1.95-1.53,2.93-.26.5-.5,1-.74,1.5-.5,1-1,2.05-1.45,3.08C3.13,473.24-.15,486.81,0,499.4a60,60,0,0,0,1.27,11.87c.21,1,.46,2,.72,3,8.48,30.88,42.64,42.42,79.37,42a75.4,75.4,0,0,0,8.28-.55l146.16-9.73a67.84,67.84,0,0,0-1.66-135.66c-.4,0-.8,0-1.19,0l-145.1-6.18A77.05,77.05,0,0,0,79.5,403.78Z" />
                    <path fill="#f47016" d="M79.5,403.78c-11.84.14-23.34,4.44-33.75,11.47-1,.66-2,1.35-2.92,2.07s-1.9,1.43-2.83,2.18-2,1.62-2.94,2.46a112.25,112.25,0,0,0-24.4,30.93c-.52,1-1,1.95-1.53,2.93-.26.5-.5,1-.74,1.5-.5,1-1,2.05-1.45,3.08C3.13,473.24-.15,486.81,0,499.4a60,60,0,0,0,1.27,11.87c.21,1,.46,2,.72,3,8.48,30.88,42.64,42.42,79.37,42,0,0-46.85-78.94,6.49-152.09A77.05,77.05,0,0,0,79.5,403.78Z" />
                  </g>
                  <g transform="translate(-345.84, 0)">
                    <path fill="#ff8517" d="M1036.58,605.8,961.33,457.35A56.65,56.65,0,0,0,857.21,502l55.71,156.84a70,70,0,0,0,2.93,8.25,67.84,67.84,0,1,0,120.73-61.3Z" />
                    <circle fill="#ff8517" cx="978.11" cy="640.45" r="67.84" />
                    <path fill="#ff8517" d="M1098.5,763.76c3.67,11.25,3.31,23.53,0,35.65-.32,1.14-.66,2.28-1,3.43s-.75,2.25-1.16,3.38-.9,2.38-1.38,3.58a112.49,112.49,0,0,1-21.44,33q-1.12,1.21-2.28,2.4l-1.18,1.18c-.81.8-1.63,1.59-2.45,2.36-10.3,9.63-22.09,17.11-34.06,21a60.32,60.32,0,0,1-11.64,2.61q-1.54.18-3.06.27C986.86,874.58,965,846,953.56,811a78,78,0,0,1-2.15-8l-37.8-141.52a67.84,67.84,0,1,1,129-42.07l.36,1.14L1095.48,756A79.42,79.42,0,0,1,1098.5,763.76Z" />
                    <path fill="#f47016" d="M1098.5,763.76c3.67,11.25,3.31,23.53,0,35.65-.32,1.14-.66,2.28-1,3.43s-.75,2.25-1.16,3.38-.9,2.38-1.38,3.58a112.49,112.49,0,0,1-21.44,33q-1.12,1.21-2.28,2.4l-1.18,1.18c-.81.8-1.63,1.59-2.45,2.36-10.3,9.63-22.09,17.11-34.06,21a60.32,60.32,0,0,1-11.64,2.61q-1.54.18-3.06.27C986.86,874.58,965,846,953.56,811c0,0,89.81,19,141.92-55.08A79.42,79.42,0,0,1,1098.5,763.76Z" />
                  </g>
                </g>
              )}

              {/* 4. ☝️ CHỈ BẢNG TẦM CAO BÊN PHẢI (Mirrored Thuyết trình - idle 4) */}
              {(activePose === 'point-high-right' || activePose === 'point-low-right') && (
                <g id="pose-point-high-right" transform="translate(631.59, 0) scale(-1, 1)" className="animate-in fade-in duration-150">
                  <g transform="translate(-273.59, 34.8)">
                    <path fill="#ff8517" d="M168.19,488.29l139.47-90.82a56.65,56.65,0,0,1,67.76,90.8L248.66,596.13a69.07,69.07,0,0,1-6.67,5.68,67.84,67.84,0,0,1-81.15-108.74A69.37,69.37,0,0,1,168.19,488.29Z" />
                    <circle fill="#ff8517" cx="200.43" cy="546.9" r="67.84" />
                    <path fill="#ff8517" d="M137.57,386.45c-8.75-8-20.09-12.7-32.5-14.67-1.17-.18-2.35-.34-3.55-.48s-2.36-.25-3.55-.33-2.55-.17-3.83-.21A112.26,112.26,0,0,0,55.2,376.7c-1.05.35-2.09.72-3.13,1.1l-1.56.58c-1.06.41-2.11.83-3.16,1.27-13,5.42-24.67,13.09-33.16,22.4A60.69,60.69,0,0,0,7,411.59q-.79,1.34-1.5,2.67c-14.89,28.35,2.19,60.11,29.33,84.85a75.26,75.26,0,0,0,6.43,5.25L154.73,597a67.84,67.84,0,0,0,91.4-100.27l-.89-.79L143.43,392.41A76.51,76.51,0,0,0,137.57,386.45Z" />
                    <path fill="#f47016" d="M137.57,386.45c-8.75-8-20.09-12.7-32.5-14.67-1.17-.18-2.35-.34-3.55-.48s-2.36-.25-3.55-.33-2.55-.17-3.83-.21A112.26,112.26,0,0,0,55.2,376.7c-1.05.35-2.09.72-3.13,1.1l-1.56.58c-1.06.41-2.11.83-3.16,1.27-13,5.42-24.67,13.09-33.16,22.4A60.69,60.69,0,0,0,7,411.59q-.79,1.34-1.5,2.67c-14.89,28.35,2.19,60.11,29.33,84.85,0,0,19.67-89.66,108.58-106.7A76.51,76.51,0,0,0,137.57,386.45Z" />
                  </g>
                  <g transform="translate(-273.59, 34.8)">
                    <path fill="#ff8517" d="M964.33,571,889.08,422.56A56.65,56.65,0,0,0,785,467.22l55.71,156.83a69.5,69.5,0,0,0,2.93,8.26A67.84,67.84,0,1,0,964.33,571Z" />
                    <circle fill="#ff8517" cx="905.86" cy="605.66" r="67.84" />
                    <path fill="#ff8517" d="M1026.25,729c3.67,11.26,3.31,23.53,0,35.65-.32,1.15-.66,2.29-1,3.43s-.75,2.26-1.16,3.38-.9,2.39-1.38,3.58a112.54,112.54,0,0,1-21.44,33c-.75.81-1.51,1.61-2.28,2.39l-1.18,1.18c-.81.81-1.63,1.59-2.45,2.37-10.3,9.63-22.09,17.1-34.06,21a61.07,61.07,0,0,1-11.64,2.61q-1.54.18-3.06.27c-32,1.91-53.89-26.73-65.27-61.65a77.79,77.79,0,0,1-2.15-8l-37.8-141.53a67.84,67.84,0,0,1,129-42.06l.36,1.14,52.51,135.39A77.78,77.78,0,0,1,1026.25,729Z" />
                    <path fill="#f47016" d="M1026.25,729c3.67,11.26,3.31,23.53,0,35.65-.32,1.15-.66,2.29-1,3.43s-.75,2.26-1.16,3.38-.9,2.39-1.38,3.58a112.54,112.54,0,0,1-21.44,33c-.75.81-1.51,1.61-2.28,2.39l-1.18,1.18c-.81.81-1.63,1.59-2.45,2.37-10.3,9.63-22.09,17.1-34.06,21a61.07,61.07,0,0,1-11.64,2.61q-1.54.18-3.06.27c-32,1.91-53.89-26.73-65.27-61.65,0,0,89.81,19,141.91-55.07A77.78,77.78,0,0,1,1026.25,729Z" />
                  </g>
                </g>
              )}

              {/* 5. 💡 ĐANG SUY NGHĨ / TƯ DUY (Suy nghĩ.svg) */}
              {activePose === 'think' && (
                <g id="pose-think" className="animate-in fade-in duration-150">
                  {/* Left Arm at chin/cheek */}
                  <path fill="#ff8517" d="M201.39,598.63,50,529.54A56.65,56.65,0,1,1,90.34,423.68l159,49.22a67.84,67.84,0,1,1-39.95,129.37A67.12,67.12,0,0,1,201.39,598.63Z" />
                  <circle fill="#ff8517" cx="233.47" cy="539.68" r="67.84" />
                  <path fill="#ff8517" d="M381.21,451c6.41-10,9.17-21.92,9-34.48,0-1.19-.05-2.38-.11-3.58s-.15-2.37-.26-3.56-.26-2.54-.43-3.82a112.37,112.37,0,0,0-12.35-37.4c-.52-1-1.06-1.94-1.6-2.9l-.84-1.44c-.58-1-1.17-2-1.78-2.91-7.51-11.93-17-22.15-27.61-29a59.84,59.84,0,0,0-10.6-5.48c-1-.38-1.92-.73-2.88-1-30.44-10-58.91,12.18-78.78,43.06a77.48,77.48,0,0,0-4.11,7.21L176.42,503A67.84,67.84,0,1,0,290.51,576.4q.33-.51.63-1L376.3,457.75A76.64,76.64,0,0,0,381.21,451Z" />
                  <path fill="#f47016" d="M381.21,451c6.41-10,9.17-21.92,9-34.48,0-1.19-.05-2.38-.11-3.58s-.15-2.37-.26-3.56-.26-2.54-.43-3.82a112.37,112.37,0,0,0-12.35-37.4c-.52-1-1.06-1.94-1.6-2.9l-.84-1.44c-.58-1-1.17-2-1.78-2.91-7.51-11.93-17-22.15-27.61-29a59.84,59.84,0,0,0-10.6-5.48c-1-.38-1.92-.73-2.88-1-30.44-10-58.91,12.18-78.78,43.06,0,0,91.68,4.45,123.29,89.29A76.64,76.64,0,0,0,381.21,451Z" />

                  {/* Right Arm lower */}
                  <path fill="#ff8517" d="M620,649.71l-.05-166.43a56.65,56.65,0,1,0-113.07-7.2L485.68,641.16a70.41,70.41,0,0,0-1.11,8.69A67.84,67.84,0,0,0,620,658.47,69.2,69.2,0,0,0,620,649.71Z" />
                  <circle fill="#ff8517" cx="552.27" cy="654.16" r="67.84" />
                  <path fill="#ff8517" d="M618.52,813.25c-.75,11.81-5.63,23.08-13.18,33.12-.72,1-1.46,1.88-2.22,2.81s-1.53,1.82-2.33,2.71-1.71,1.89-2.61,2.81A112.18,112.18,0,0,1,566,877.48c-1,.48-2,.94-3,1.38l-1.53.66c-1,.45-2.1.88-3.16,1.29-13.12,5.14-26.84,7.72-39.41,6.92a60.07,60.07,0,0,1-11.78-1.88q-1.5-.4-2.94-.87c-30.41-10.05-40.18-44.77-37.85-81.42a76.92,76.92,0,0,1,1-8.24l17.22-145.47A67.84,67.84,0,1,1,620,658.47l-.09,1.19L618.6,804.88A78.05,78.05,0,0,1,618.52,813.25Z" />
                  <path fill="#f47016" d="M618.52,813.25c-.75,11.81-5.63,23.08-13.18,33.12-.72,1-1.46,1.88-2.22,2.81s-1.53,1.82-2.33,2.71-1.71,1.89-2.61,2.81A112.18,112.18,0,0,1,566,877.48c-1,.48-2,.94-3,1.38l-1.53.66c-1,.45-2.1.88-3.16,1.29-13.12,5.14-26.84,7.72-39.41,6.92a60.07,60.07,0,0,1-11.78-1.88q-1.5-.4-2.94-.87c-30.41-10.05-40.18-44.77-37.85-81.42,0,0,76.43,50.84,152.23,1.32A78.05,78.05,0,0,1,618.52,813.25Z" />
                </g>
              )}

              {/* 6. 💡 AHA! NGHĨ RA Ý TƯỞNG (Nghĩ ra ý tưởng.svg) */}
              {(activePose === 'idea' || state === 'hint') && (
                <g id="pose-idea" className="animate-in fade-in duration-150">
                  {/* Left Arm resting at waist */}
                  <path fill="#ff8517" d="M195.81,606.1,46.12,533.34A56.65,56.65,0,0,1,89.05,428.49l157.74,53.09a67.83,67.83,0,1,1-51,124.52Z" />
                  <circle fill="#ff8517" cx="229.01" cy="548.35" r="67.84" />
                  <path fill="#ff8517" d="M370.84,450.46c5.77-10.35,7.76-22.46,6.84-35-.09-1.19-.2-2.37-.34-3.57s-.3-2.35-.49-3.53-.42-2.52-.67-3.78A112.07,112.07,0,0,0,361.49,368c-.58-.94-1.17-1.87-1.78-2.79-.3-.47-.62-.93-.93-1.38-.63-.95-1.29-1.87-1.95-2.79-8.25-11.43-18.39-21-29.39-27.16a60.39,60.39,0,0,0-10.93-4.8c-1-.31-2-.6-2.94-.85-31-8-58,15.88-75.9,48a77.72,77.72,0,0,0-3.64,7.46L169.76,515.32a67.84,67.84,0,1,0,118.51,66l.57-1,77.53-122.79A76.12,76.12,0,0,0,370.84,450.46Z" />
                  <path fill="#f47016" d="M370.84,450.46c5.77-10.35,7.76-22.46,6.84-35-.09-1.19-.2-2.37-.34-3.57s-.3-2.35-.49-3.53-.42-2.52-.67-3.78A112.07,112.07,0,0,0,361.49,368c-.58-.94-1.17-1.87-1.78-2.79-.3-.47-.62-.93-.93-1.38-.63-.95-1.29-1.87-1.95-2.79-8.25-11.43-18.39-21-29.39-27.16a60.39,60.39,0,0,0-10.93-4.8c-1-.31-2-.6-2.94-.85-31-8-58,15.88-75.9,48,0,0,91.79-1.36,128.7,81.3A76.12,76.12,0,0,0,370.84,450.46Z" />

                  {/* Right Arm index finger pointing up to sky / idea */}
                  <path fill="#ff8517" d="M634.77,314l-110,124.87a56.65,56.65,0,0,0,80,80.18L729.84,409.23a69.79,69.79,0,0,0,6.58-5.78,67.84,67.84,0,1,0-95.86-96A68.67,68.67,0,0,0,634.77,314Z" />
                  <circle fill="#ff8517" cx="688.18" cy="354.9" r="67.84" />
                  <path fill="#ff8517" d="M669.86,183.55c4.08-11.12,12-20.53,22-28,1-.7,1.93-1.39,2.93-2.07s2-1.31,3-1.93,2.18-1.33,3.3-2a112.39,112.39,0,0,1,37.28-12.7c1.1-.18,2.19-.33,3.28-.47.55-.08,1.11-.14,1.65-.2,1.14-.14,2.27-.25,3.39-.34,14-1.2,27.94.22,39.76,4.56a60.26,60.26,0,0,1,10.76,5.15c.89.54,1.74,1.1,2.57,1.67,26.3,18.28,25.81,54.34,13.16,88.82a76.32,76.32,0,0,1-3.28,7.62L751.86,378.27A67.83,67.83,0,1,1,624.5,331.54c.13-.38.28-.75.42-1.12l42.49-138.87A76.51,76.51,0,0,1,669.86,183.55Z" />
                  <path fill="#f47016" d="M669.86,183.55c4.08-11.12,12-20.53,22-28,1-.7,1.93-1.39,2.93-2.07s2-1.31,3-1.93,2.18-1.33,3.3-2a112.39,112.39,0,0,1,37.28-12.7c1.1-.18,2.19-.33,3.28-.47.55-.08,1.11-.14,1.65-.2,1.14-.14,2.27-.25,3.39-.34,14-1.2,27.94.22,39.76,4.56a60.26,60.26,0,0,1,10.76,5.15c.89.54,1.74,1.1,2.57,1.67,26.3,18.28,25.81,54.34,13.16,88.82,0,0-58.84-70.46-145.58-44.52A76.51,76.51,0,0,1,669.86,183.55Z" />
                </g>
              )}

              {/* 7. 👐 THUYẾT TRÌNH MỞ RỘNG 2 TAY (Thuyết trình - idle 2.svg) */}
              {activePose === 'explain' && (
                <g id="pose-explain" className="animate-in fade-in duration-150">
                  <g transform="translate(-154.97, 0)">
                    <path fill="#ff8517" d="M44.6,506.27l147.53-77a56.65,56.65,0,0,1,58.75,96.87L114.37,621.32a68.56,68.56,0,0,1-7.18,5A67.84,67.84,0,1,1,44.6,506.27Z" />
                    <circle fill="#ff8517" cx="67.85" cy="569.74" r="67.84" />
                    <path fill="#ff8517" d="M80.18,741.63c6,10.22,15.41,18.09,26.67,23.66,1.06.52,2.14,1,3.24,1.51s2.18.94,3.3,1.38,2.38.91,3.59,1.34a112.28,112.28,0,0,0,39,5.89c1.11,0,2.21-.06,3.31-.11l1.66-.1c1.14-.07,2.27-.16,3.4-.27,14-1.3,27.45-5.17,38.31-11.53a59.48,59.48,0,0,0,9.68-7c.78-.69,1.52-1.39,2.24-2.1,22.64-22.65,15.77-58.05-2.79-89.74a77.46,77.46,0,0,0-4.58-6.92l-80.78-122.2A67.83,67.83,0,1,0,9.31,604c.21.35.41.69.62,1L76.35,734.19A77,77,0,0,0,80.18,741.63Z" />
                    <path fill="#f47016" d="M80.18,741.63c6,10.22,15.41,18.09,26.67,23.66,1.06.52,2.14,1,3.24,1.51s2.18.94,3.3,1.38,2.38.91,3.59,1.34a112.28,112.28,0,0,0,39,5.89c1.11,0,2.21-.06,3.31-.11l1.66-.1c1.14-.07,2.27-.16,3.4-.27,14-1.3,27.45-5.17,38.31-11.53a59.48,59.48,0,0,0,9.68-7c.78-.69,1.52-1.39,2.24-2.1,22.64-22.65,15.77-58.05-2.79-89.74,0,0-45.43,79.77-135.39,69.61A77,77,0,0,0,80.18,741.63Z" />
                  </g>
                  <g transform="translate(-154.97, 0)">
                    <path fill="#ff8517" d="M908.87,519.17l-141.3-87.95a56.65,56.65,0,1,0-65.89,92.16L830.62,628.63a69.52,69.52,0,0,0,6.78,5.54A67.84,67.84,0,0,0,916.31,523.8,66.93,66.93,0,0,0,908.87,519.17Z" />
                    <circle fill="#ff8517" cx="880.9" cy="580.7" r="67.84" />
                    <path fill="#ff8517" d="M855.63,751.17c-6.73,9.73-16.72,16.87-28.37,21.58-1.11.44-2.22.86-3.35,1.26s-2.25.77-3.39,1.12-2.45.74-3.69,1.07a112.36,112.36,0,0,1-39.28,2.94c-1.1-.11-2.2-.23-3.29-.37-.55-.06-1.1-.14-1.65-.22-1.13-.15-2.25-.33-3.37-.52-13.9-2.36-27-7.23-37.33-14.39a59.57,59.57,0,0,1-9.13-7.69c-.72-.74-1.41-1.5-2.07-2.26-20.87-24.3-11.34-59.08,9.56-89.28a78.42,78.42,0,0,1,5.08-6.56L825.12,542.1a67.83,67.83,0,0,1,111.56,77.2l-.69,1L860,744A77.15,77.15,0,0,1,855.63,751.17Z" />
                    <path fill="#f47016" d="M855.63,751.17c-6.73,9.73-16.72,16.87-28.37,21.58-1.11.44-2.22.86-3.35,1.26s-2.25.77-3.39,1.12-2.45.74-3.69,1.07a112.36,112.36,0,0,1-39.28,2.94c-1.1-.11-2.2-.23-3.29-.37-.55-.06-1.1-.14-1.65-.22-1.13-.15-2.25-.33-3.37-.52-13.9-2.36-27-7.23-37.33-14.39a59.57,59.57,0,0,1-9.13-7.69c-.72-.74-1.41-1.5-2.07-2.26-20.87-24.3-11.34-59.08,9.56-89.28,0,0,39.27,83,129.74,79.63A77.15,77.15,0,0,1,855.63,751.17Z" />
                  </g>
                </g>
              )}

              {/* 8. 🤲 THUYẾT TRÌNH CƠ BẢN (Thuyết trình - idle 1.svg) */}
              {(activePose === 'presentation' || activePose === 'idle' || activePose === 'clap' || state === 'eat' || state === 'sleepy') && (
                <g id="pose-presentation" className="animate-in fade-in duration-150">
                  {/* Left Arm bent in front of chest */}
                  <path fill="#ff8517" d="M81.71,655.92,15.36,503.28a56.65,56.65,0,0,1,100.81-51.71l85.26,142.94a69.44,69.44,0,0,1,4.49,7.52A67.84,67.84,0,1,1,81.71,655.92Z" />
                  <circle fill="#ff8517" cx="146.11" cy="635.09" r="67.84" />
                  <path fill="#ff8517" d="M165.46,806.33c6.4,10,16.14,17.44,27.62,22.55,1.09.48,2.18.94,3.3,1.38s2.22.85,3.35,1.24,2.42.81,3.65,1.19a112.33,112.33,0,0,0,39.15,4.3c1.11-.07,2.21-.16,3.3-.25l1.66-.17c1.14-.12,2.26-.25,3.38-.41,14-1.88,27.22-6.28,37.82-13.09a60.38,60.38,0,0,0,9.38-7.36c.75-.72,1.46-1.45,2.15-2.2,21.7-23.55,13.38-58.64-6.46-89.55a80.63,80.63,0,0,0-4.86-6.73L203.19,598.44A67.83,67.83,0,1,0,89,671.74c.21.34.43.67.65,1l71.65,126.32A81.15,81.15,0,0,0,165.46,806.33Z" />
                  <path fill="#f47016" d="M165.46,806.33c6.4,10,16.14,17.44,27.62,22.55,1.09.48,2.18.94,3.3,1.38s2.22.85,3.35,1.24,2.42.81,3.65,1.19a112.33,112.33,0,0,0,39.15,4.3c1.11-.07,2.21-.16,3.3-.25l1.66-.17c1.14-.12,2.26-.25,3.38-.41,14-1.88,27.22-6.28,37.82-13.09a60.38,60.38,0,0,0,9.38-7.36c.75-.72,1.46-1.45,2.15-2.2,21.7-23.55,13.38-58.64-6.46-89.55,0,0-42.12,81.56-132.43,75.09A81.15,81.15,0,0,0,165.46,806.33Z" />

                  {/* Right Arm bent in front of chest */}
                  <path fill="#ff8517" d="M552.45,657.3l61.81-154.53A56.65,56.65,0,0,0,512,454.06l-81,145.4a69.18,69.18,0,0,0-4.27,7.65A67.84,67.84,0,1,0,552.45,657.3Z" />
                  <circle fill="#ff8517" cx="487.82" cy="636.27" r="67.84" />
                  <path fill="#ff8517" d="M474.71,808.1c-6,10.19-15.48,18-26.77,23.54-1.07.52-2.15,1-3.25,1.5s-2.19.93-3.3,1.36-2.39.9-3.6,1.32a112.19,112.19,0,0,1-39,5.72c-1.1,0-2.2-.07-3.3-.13-.56,0-1.12-.06-1.67-.1-1.13-.08-2.26-.17-3.39-.28-14-1.37-27.43-5.3-38.27-11.71a60.83,60.83,0,0,1-9.65-7c-.77-.69-1.51-1.4-2.22-2.11-22.54-22.75-15.51-58.12,3.2-89.73a75.19,75.19,0,0,1,4.6-6.9l81.33-121.84a67.84,67.84,0,1,1,116.76,69.1c-.2.34-.41.68-.62,1l-67,128.84A77.1,77.1,0,0,1,474.71,808.1Z" />
                  <path fill="#f47016" d="M474.71,808.1c-6,10.19-15.48,18-26.77,23.54-1.07.52-2.15,1-3.25,1.5s-2.19.93-3.3,1.36-2.39.9-3.6,1.32a112.19,112.19,0,0,1-39,5.72c-1.1,0-2.2-.07-3.3-.13-.56,0-1.12-.06-1.67-.1-1.13-.08-2.26-.17-3.39-.28-14-1.37-27.43-5.3-38.27-11.71a60.83,60.83,0,0,1-9.65-7c-.77-.69-1.51-1.4-2.22-2.11-22.54-22.75-15.51-58.12,3.2-89.73,0,0,45.06,80,135.07,70.22A77.1,77.1,0,0,1,474.71,808.1Z" />
                </g>
              )}

              {/* 9. 🎉 VUI MỪNG / HOAN HÔ 1 (Vui mừng - idle 1.1.svg) */}
              {(activePose === 'celebrate-1' || activePose === 'enthusiastic') && (
                <g id="pose-celebrate-1" className="animate-in fade-in duration-150">
                  <g transform="translate(-260.63, 42.14)">
                    <path fill="#ff8517" d="M148.1,438.17l157-55.15a56.65,56.65,0,1,1,44.3,104.28L200.71,562a70.67,70.67,0,0,1-7.83,3.93A67.84,67.84,0,1,1,148.1,438.17Z" />
                    <circle fill="#ff8517" cx="165.48" cy="503.58" r="67.84" />
                    <path fill="#ff8517" d="M147.85,332.15c-6.3-10-16-17.6-27.39-22.82-1.08-.49-2.17-1-3.29-1.42s-2.21-.87-3.33-1.27-2.41-.84-3.64-1.23a112.35,112.35,0,0,0-39.11-4.69c-1.1.06-2.2.13-3.3.22-.56,0-1.11.09-1.66.15-1.13.1-2.26.23-3.39.37-14,1.74-27.28,6-37.94,12.71a59.61,59.61,0,0,0-9.46,7.27c-.75.71-1.47,1.44-2.17,2.17C-8.76,347-.8,382.12,18.74,413.22A74.88,74.88,0,0,0,23.52,420L108,539.65a67.84,67.84,0,1,0,114.9-72.15c-.21-.34-.43-.67-.65-1l-70.37-127A77.36,77.36,0,0,0,147.85,332.15Z" />
                    <path fill="#f47016" d="M147.85,332.15c-6.3-10-16-17.6-27.39-22.82-1.08-.49-2.17-1-3.29-1.42s-2.21-.87-3.33-1.27-2.41-.84-3.64-1.23a112.35,112.35,0,0,0-39.11-4.69c-1.1.06-2.2.13-3.3.22-.56,0-1.11.09-1.66.15-1.13.1-2.26.23-3.39.37-14,1.74-27.28,6-37.94,12.71a59.61,59.61,0,0,0-9.46,7.27c-.75.71-1.47,1.44-2.17,2.17C-8.76,347-.8,382.12,18.74,413.22c0,0,42.93-81.13,133.17-73.75A77.36,77.36,0,0,0,147.85,332.15Z" />
                  </g>
                  <g transform="translate(-260.63, 42.14)">
                    <path fill="#ff8517" d="M1001.67,459.46,850.75,389.27a56.65,56.65,0,0,0-54.24,99.47l140.74,88.85a67.84,67.84,0,1,0,72.36-114.44A68.49,68.49,0,0,0,1001.67,459.46Z" />
                    <circle fill="#ff8517" cx="977.14" cy="523.02" r="67.84" />
                    <path fill="#ff8517" d="M984.44,350.85c5.68-10.39,14.87-18.53,26-24.43,1.05-.55,2.11-1.09,3.2-1.61s2.15-1,3.25-1.47,2.36-1,3.56-1.45a112.32,112.32,0,0,1,38.75-7c1.11,0,2.21,0,3.31,0l1.67.05c1.14,0,2.27.09,3.4.17,14.07.89,27.59,4.36,38.64,10.4a60.73,60.73,0,0,1,9.88,6.69c.79.67,1.56,1.35,2.29,2,23.3,22,17.46,57.56-.16,89.78a75.13,75.13,0,0,1-4.37,7.06l-77.17,124.51a67.84,67.84,0,0,1-119-65.11c.2-.35.39-.7.59-1l62.62-131A75.39,75.39,0,0,1,984.44,350.85Z" />
                    <path fill="#f47016" d="M984.44,350.85c5.68-10.39,14.87-18.53,26-24.43,1.05-.55,2.11-1.09,3.2-1.61s2.15-1,3.25-1.47,2.36-1,3.56-1.45a112.32,112.32,0,0,1,38.75-7c1.11,0,2.21,0,3.31,0l1.67.05c1.14,0,2.27.09,3.4.17,14.07.89,27.59,4.36,38.64,10.4a60.73,60.73,0,0,1,9.88,6.69c.79.67,1.56,1.35,2.29,2,23.3,22,17.46,57.56-.16,89.78,0,0-47.74-78.4-137.36-65.61A75.39,75.39,0,0,1,984.44,350.85Z" />
                  </g>
                </g>
              )}

              {/* 10. 🎉 VUI MỪNG VUNG TAY CAO (Vui mừng - idle 1.2.svg) */}
              {(activePose === 'celebrate-2' || activePose === 'celebrate') && (
                <g id="pose-celebrate-2" className="animate-in fade-in duration-150">
                  <g transform="translate(-245.23, 0)">
                    <path fill="#ff8517" d="M247.28,309.52,351.45,439.33a56.65,56.65,0,0,1-83.65,76.41L147.94,400.27a66.93,66.93,0,0,1-6.32-6.08,67.84,67.84,0,1,1,100.18-91.5A68.85,68.85,0,0,1,247.28,309.52Z" />
                    <circle fill="#ff8517" cx="190.75" cy="346.57" r="67.84" />
                    <path fill="#ff8517" d="M141.41,181.45c-8.06-8.67-19-14.31-31.17-17.3-1.15-.28-2.31-.54-3.49-.78s-2.34-.44-3.52-.63-2.52-.37-3.8-.52a112.13,112.13,0,0,0-39.3,2.69c-1.07.27-2.14.54-3.2.83l-1.6.46c-1.1.32-2.18.65-3.26,1-13.42,4.32-25.68,11-34.9,19.57a60.64,60.64,0,0,0-7.94,8.91c-.6.84-1.18,1.69-1.72,2.54-17.19,27-2.79,60.09,22.2,87a77,77,0,0,0,6,5.76L141.05,392.74a67.84,67.84,0,0,0,99.4-92.34c-.27-.3-.54-.58-.82-.87L146.76,187.88A78.55,78.55,0,0,0,141.41,181.45Z" />
                    <path fill="#f47016" d="M141.41,181.45c-8.06-8.67-19-14.31-31.17-17.3-1.15-.28-2.31-.54-3.49-.78s-2.34-.44-3.52-.63-2.52-.37-3.8-.52a112.13,112.13,0,0,0-39.3,2.69c-1.07.27-2.14.54-3.2.83l-1.6.46c-1.1.32-2.18.65-3.26,1-13.42,4.32-25.68,11-34.9,19.57a60.64,60.64,0,0,0-7.94,8.91c-.6.84-1.18,1.69-1.72,2.54-17.19,27-2.79,60.09,22.2,87,0,0,27-87.73,117-97.34A78.55,78.55,0,0,0,141.41,181.45Z" />
                  </g>
                  <g transform="translate(-245.23, 0)">
                    <path fill="#ff8517" d="M883.41,310.27,772.75,434.59a56.65,56.65,0,0,0,79.65,80.58L978,406a69.76,69.76,0,0,0,6.61-5.75,67.84,67.84,0,1,0-101.2-90Z" />
                    <circle fill="#ff8517" cx="937.11" cy="351.93" r="67.84" />
                    <path fill="#ff8517" d="M998.56,190.93c8.68-8.05,20-12.87,32.37-15q1.75-.28,3.54-.51c1.17-.15,2.36-.27,3.55-.36s2.55-.19,3.83-.25a112.54,112.54,0,0,1,39,5.6c1.05.34,2.1.7,3.13,1.07l1.57.57c1.07.4,2.12.81,3.17,1.24,13.07,5.31,24.79,12.88,33.36,22.11a60.3,60.3,0,0,1,7.25,9.47c.54.89,1,1.77,1.53,2.66,15.14,28.22-1.67,60.13-28.59,85.11a75.73,75.73,0,0,1-6.38,5.31L983.25,401.66A67.83,67.83,0,1,1,891,302.21c.3-.28.59-.54.89-.8L992.75,197A76.52,76.52,0,0,1,998.56,190.93Z" />
                    <path fill="#f47016" d="M998.56,190.93c8.68-8.05,20-12.87,32.37-15q1.75-.28,3.54-.51c1.17-.15,2.36-.27,3.55-.36s2.55-.19,3.83-.25a112.54,112.54,0,0,1,39,5.6c1.05.34,2.1.7,3.13,1.07l1.57.57c1.07.4,2.12.81,3.17,1.24,13.07,5.31,24.79,12.88,33.36,22.11a60.3,60.3,0,0,1,7.25,9.47c.54.89,1,1.77,1.53,2.66,15.14,28.22-1.67,60.13-28.59,85.11,0,0-20.45-89.49-109.51-105.74A76.52,76.52,0,0,1,998.56,190.93Z" />
                  </g>
                </g>
              )}
            </g>
          </g>

          {/* --- 9. DEBUG SKELETON --- */}
          {showBones && (
            <g id="aiki-bones-debug" className="animate-in fade-in">
              <line x1="315.8" y1="962" x2="315.8" y2="232" stroke="#ef4444" strokeWidth="8" strokeDasharray="12 8" />
              <circle cx="315.8" cy="962" r="16" fill="#ef4444" stroke="#ffffff" strokeWidth="4" />
              <circle cx="315.8" cy="232" r="16" fill="#ef4444" stroke="#ffffff" strokeWidth="4" />
              <circle cx="159" cy="186" r="12" fill="#a855f7" stroke="#ffffff" strokeWidth="3" />
              <circle cx="479" cy="186" r="12" fill="#a855f7" stroke="#ffffff" strokeWidth="3" />
            </g>
          )}
        </svg>
      )}
    </div>
  )
}
