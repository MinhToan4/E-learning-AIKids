import React, { useState } from 'react'
import { Link } from 'react-router'
import {
  MeeCatInteractiveCanvas,
  type MeeCatState,
  type MeeCatVariant,
} from '../components/MeeCatInteractiveCanvas'
import type { Gesture, Viseme } from '../hooks/useMeeCatSpeech'
import {
  Sparkles,
  Eye,
  Smile,
  Cookie,
  Moon,
  Lightbulb,
  Bone,
  Download,
  Flame,
  ArrowLeft,
  RotateCcw,
  Cat,
  Volume2,
  VolumeX,
  Mic,
  Hand,
  Play,
  Square,
  Sparkle,
} from 'lucide-react'

const STATE_PRESETS: Array<{
  id: MeeCatState
  label: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
  badgeColor: string
}> = [
  {
    id: 'talk',
    label: 'Thuyết trình (Talk)',
    desc: 'Lipsync cử động mồm theo text, chỉ trỏ sang trái sinh động',
    icon: Mic,
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'idle',
    label: 'Nghỉ ngơi (Idle)',
    desc: 'Thở nhịp nhàng, mắt chớp tự nhiên 3-4s, đuôi vẫy nhẹ',
    icon: Smile,
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'look',
    label: 'Theo chuột (Look)',
    desc: 'Đầu và tròng mắt xoay theo vị trí con trỏ chuột',
    icon: Eye,
    badgeColor: 'bg-sky-100 text-sky-700',
  },
  {
    id: 'hint',
    label: 'Gợi ý ASMO (Hint)',
    desc: 'Giơ tay vẫy và hiển thị bóng thoại bài học',
    icon: Lightbulb,
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'celebrate',
    label: 'Ăn mừng (Celebrate)',
    desc: 'Nhảy nhót, vẫy đuôi tít mù, má hồng hớn hở',
    icon: Sparkles,
    badgeColor: 'bg-pink-100 text-pink-700',
  },
  {
    id: 'eat',
    label: 'Ăn bánh (Munch)',
    desc: 'Gặm snack cá và nhai miệng nhịp nhàng',
    icon: Cookie,
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'sleepy',
    label: 'Buồn ngủ (Sleepy)',
    desc: 'Mắt nhắm cong tít, đầu gật gù, bóng ngủ ở mũi',
    icon: Moon,
    badgeColor: 'bg-purple-100 text-purple-700',
  },
]

const SAMPLE_SPEECHES = [
  'Chào các bạn nhỏ! Mình là Mèo AIKI, trợ giảng AI của các bạn đây!',
  'Nhìn sang bên trái bài toán này nhé, chúng ta có một quy luật số rất thú vị!',
  'Con hãy thực hiện phép tính từ trái sang phải để tìm ra đáp án chính xác nào!',
  'Bé làm bài xuất sắc lắm! Mèo AIKI vỗ tay khen ngợi con nha!',
]

const GESTURE_OPTIONS: Array<{ id: Gesture; label: string; desc: string }> = [
  { id: 'point-left', label: '👈 Chỉ Sang Trái', desc: 'Tay trái vươn sang bên trái chỉ vào đề bài / hình vẽ' },
  { id: 'point-right', label: '👉 Chỉ Sang Phải', desc: 'Tay phải vươn sang bên phải chỉ vào đáp án / bảng' },
  { id: 'explain', label: '👐 Thuyết Trình (2 tay)', desc: 'Hai tay mở ra vào giải thích sinh động' },
  { id: 'enthusiastic', label: '🎉 Hào Hứng (Nhún nhảy)', desc: 'Vung hai tay lên cao cổ vũ nhiệt tình' },
  { id: 'auto', label: '🤖 Tự Động (AI Auto)', desc: 'Tự luân chuyển cử chỉ chỉ trỏ & thuyết trình theo nhịp câu' },
]

export function MeeCatStudioPage() {
  const [activeState, setActiveState] = useState<MeeCatState>('talk')
  const [variant, setVariant] = useState<MeeCatVariant>('full-body')
  const [showBones, setShowBones] = useState(false)
  const [earAngle, setEarAngle] = useState(0)
  const [tailWiggle, setTailWiggle] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [engineMode, setEngineMode] = useState<'svg-rig' | 'rive'>('svg-rig')
  const [customQuoteIndex, setCustomQuoteIndex] = useState(0)

  // Speech & Lip-sync State
  const [speechInput, setSpeechInput] = useState(SAMPLE_SPEECHES[0])
  const [selectedGesture, setSelectedGesture] = useState<Gesture>('point-left')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [manualViseme, setManualViseme] = useState<Viseme | undefined>(undefined)

  const handleManualBlink = () => {
    setIsBlinking(true)
    setTimeout(() => setIsBlinking(false), 240)
  }

  const handleNextQuote = () => {
    setCustomQuoteIndex((prev) => (prev + 1) % SAMPLE_SPEECHES.length)
  }

  const handlePlaySpeech = () => {
    setActiveState('talk')
    setIsSpeaking(true)
  }

  const handleStopSpeech = () => {
    setIsSpeaking(false)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  const downloadFile = (filename: string, path: string) => {
    const link = document.createElement('a')
    link.href = path
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main
      className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-100/60 via-orange-50/50 to-sky-100/40 p-4 sm:p-6 shadow-soft"
    >
      {/* Background Decor */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-4 font-black text-slate-700 shadow-soft hover:bg-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Hồ sơ</span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/15 border border-amber-400/40 px-3.5 py-1.5 text-xs font-black text-amber-800 backdrop-blur">
            <Flame className="h-4 w-4 text-amber-600 animate-pulse" />
            <span>AIKI Mascot Studio • Full Rig, Thuyết Trình & Lipsync</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Variant Selector: Full-Body vs Half-Body */}
          <div className="inline-flex rounded-2xl bg-white/90 p-1 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setVariant('full-body')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                variant === 'full-body'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cat className="h-3.5 w-3.5" />
              <span>Full Toàn Thân</span>
            </button>
            <button
              type="button"
              onClick={() => setVariant('half-body')}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                variant === 'half-body'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bán thân ôm bàn
            </button>
          </div>

          {/* Engine Selector */}
          <div className="inline-flex rounded-2xl bg-white/90 p-1 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setEngineMode('svg-rig')}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                engineMode === 'svg-rig'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ Live SVG Rig
            </button>
            <button
              type="button"
              onClick={() => setEngineMode('rive')}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                engineMode === 'rive'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎨 Rive Canvas
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(26rem,1fr)_minmax(26rem,30rem)]">
        {/* Left Column: Interactive Stage */}
        <section
          className="flex min-h-[36rem] flex-col items-center justify-center rounded-[2.5rem] border-3 border-white/80 bg-white/60 p-4 sm:p-8 shadow-clay backdrop-blur"
          aria-label="Sân khấu Mèo Mee"
        >
          <div className="w-full max-w-[620px]">
            <MeeCatInteractiveCanvas
              state={activeState}
              variant={variant}
              showBones={showBones}
              earAngle={earAngle}
              tailWiggle={tailWiggle}
              isBlinking={isBlinking}
              engineMode={engineMode}
              isSpeaking={isSpeaking}
              speechText={speechInput}
              gesture={selectedGesture}
              viseme={manualViseme}
              onSpeechEnd={() => setIsSpeaking(false)}
              quote={isSpeaking || activeState === 'talk' ? speechInput : activeState === 'hint' ? SAMPLE_SPEECHES[customQuoteIndex] : undefined}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
            <span className="rounded-full bg-slate-900/10 px-3 py-1 text-xs font-bold text-slate-700">
              💡 Thử gõ văn bản vào Textbox bên phải và bấm "Nói & Lipsync" để xem Mèo AIKI chỉ trỏ sang trái và mấp máy mồm!
            </span>
          </div>
        </section>

        {/* Right Column: State Machine & Rigging Control Panel */}
        <aside
          className="flex flex-col gap-5 rounded-[2.5rem] border-3 border-white/80 bg-white/90 p-5 sm:p-6 shadow-clay backdrop-blur overflow-y-auto max-h-[calc(100vh-7rem)]"
          aria-label="Bảng điều khiển hoạt ảnh Mèo Mee"
        >
          {/* Section 1: AI Lipsync & Speech Studio (PROMINENT TOP) */}
          <div className="rounded-3xl bg-amber-50/70 p-4 border-2 border-amber-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-base font-black text-amber-950 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-amber-600" />
                <span>1. Thuyết Trình AI & Lip-sync Theo Ô Chữ</span>
              </h2>
              {isSpeaking && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-xs font-black animate-pulse shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" /> ĐANG NÓI...
                </span>
              )}
            </div>

            {/* Custom Text input */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black text-slate-700">
                📝 Nhập văn bản để Mèo AIKI đọc & mấp máy khẩu hình:
              </label>
              <textarea
                value={speechInput}
                onChange={(e) => setSpeechInput(e.target.value)}
                placeholder="Gõ bất kỳ câu tiếng Việt nào vào đây để Mèo AIKI đọc và lipsync..."
                rows={3}
                className="w-full rounded-2xl border-2 border-amber-300 bg-white p-3 text-xs font-bold text-slate-900 shadow-xs focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />

              {/* Sample speech chips */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-black text-amber-900">Mẫu gợi ý:</span>
                {SAMPLE_SPEECHES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSpeechInput(sample)
                    }}
                    className="rounded-xl bg-white hover:bg-amber-200 border border-amber-200 px-2 py-1 text-[10px] font-black text-amber-950 transition shadow-2xs"
                  >
                    #{idx + 1}
                  </button>
                ))}
              </div>

              {/* Play & Stop Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={handlePlaySpeech}
                  disabled={!speechInput.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 px-4 text-xs font-black text-white hover:from-amber-600 hover:to-orange-600 transition shadow-md hover:shadow-lg disabled:opacity-50 active:scale-95"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>▶️ Nói & Lip-sync Ngay</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopSpeech}
                  disabled={!isSpeaking}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-300 bg-rose-50 py-3 px-4 text-xs font-black text-rose-700 hover:bg-rose-100 transition disabled:opacity-40 active:scale-95"
                >
                  <Square className="h-4 w-4 fill-current" />
                  <span>⏹ Dừng Nói</span>
                </button>
              </div>

              {/* Gesture Selection */}
              <div className="mt-2 pt-2 border-t border-amber-200/60">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Hand className="h-4 w-4 text-amber-600" />
                  <span>Cử Chỉ Tay Thuyết Trình:</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {GESTURE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedGesture(opt.id)
                        setActiveState('talk')
                      }}
                      className={`rounded-xl px-2.5 py-2 text-left text-[11px] font-extrabold transition border-2 ${
                        selectedGesture === opt.id
                          ? 'border-amber-500 bg-amber-200/80 text-amber-950 shadow-xs'
                          : 'border-white bg-white/90 text-slate-700 hover:bg-white shadow-2xs'
                      }`}
                    >
                      <div className="font-black">{opt.label}</div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5-Viseme Cute Cartoon Live Preview */}
              <div className="mt-2 pt-2 border-t border-amber-200/60">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1">
                    <span>👄 5 Khẩu Hình Mèo Cute:</span>
                  </span>
                  {manualViseme && (
                    <button
                      type="button"
                      onClick={() => setManualViseme(undefined)}
                      className="text-[10px] text-amber-800 font-black hover:underline"
                    >
                      Bỏ chọn (Tự động theo lời)
                    </button>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'closed', label: 'CLOSED (:3)', desc: 'Ngậm chúm chím' },
                    { id: 'open', label: 'OPEN (A,Ă,Â)', desc: 'Mở hạt dẻ thoáng' },
                    { id: 'round', label: 'ROUND (O,U)', desc: 'Chu tròn chúm' },
                    { id: 'smile', label: 'SMILE (E,I)', desc: 'Cười trăng khuyết' },
                    { id: 'half', label: 'HALF (Lướt)', desc: 'Mấp máy nhẹ' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setActiveState('talk')
                        setManualViseme(v.id as any)
                      }}
                      className={`rounded-xl p-2 text-center transition border-2 text-[10px] ${
                        manualViseme === v.id
                          ? 'border-amber-500 bg-amber-300 text-amber-950 font-black shadow-xs'
                          : 'border-white bg-white/90 text-slate-700 hover:bg-white font-bold shadow-2xs'
                      }`}
                    >
                      <div className="font-extrabold">{v.label}</div>
                      <div className="text-[8px] text-slate-500 truncate">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Other State Machine Presets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-black text-slate-800">
                2. Các Trạng Thái Khác (States)
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STATE_PRESETS.map((preset) => {
                const Icon = preset.icon
                const isActive = activeState === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setActiveState(preset.id)
                      if (preset.id !== 'talk') {
                        handleStopSpeech()
                      }
                    }}
                    className={`group flex flex-col items-start rounded-2xl p-2.5 text-left transition-all border-2 ${
                      isActive
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300 shadow-sm'
                        : 'border-slate-100 bg-slate-50/80 hover:border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1">
                      <div
                        className={`rounded-xl p-1.5 ${
                          isActive ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 shadow-2xs'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      )}
                    </div>
                    <span className="font-black text-xs text-slate-800 line-clamp-1">
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1 font-medium mt-0.5">
                      {preset.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Fine-Tuning Rig Sliders */}
          <div className="border-t border-slate-100 pt-4">
            <h2 className="font-display text-base font-black text-slate-800 mb-3">
              3. Tinh Chỉnh Khớp & Hoạt Họa
            </h2>

            <div className="flex flex-col gap-4">
              {/* Ear Angle Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Góc Vểnh Tai:</span>
                  <span className="font-mono font-black text-amber-600">{earAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={earAngle}
                  onChange={(e) => setEarAngle(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500"
                />
              </div>

              {/* Tail Wiggle Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Góc Vẫy Đuôi:</span>
                  <span className="font-mono font-black text-amber-600">{tailWiggle}°</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={tailWiggle}
                  onChange={(e) => setTailWiggle(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500"
                />
              </div>

              {/* Action Buttons: Chớp mắt & Hiện Xương */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleManualBlink}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5 text-amber-500" />
                  <span>Chớp mắt ngay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBones(!showBones)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-black transition border ${
                    showBones
                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <Bone className="h-3.5 w-3.5" />
                  <span>{showBones ? 'Ẩn Xương Pivot' : 'Hiện Xương Pivot'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Export Assets */}
          <div className="border-t border-slate-100 pt-4">
            <h2 className="font-display text-base font-black text-slate-800 mb-2">
              4. Tải Xuất Tài Nguyên (Export)
            </h2>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadFile('aiki-cat-rig-source.svg', '/assets/mee/mee-cat-rig-v1-source.svg')
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 px-4 text-xs font-black text-white hover:bg-slate-900 transition shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Tải SVG Nguồn Chuẩn Khớp (.svg)</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
