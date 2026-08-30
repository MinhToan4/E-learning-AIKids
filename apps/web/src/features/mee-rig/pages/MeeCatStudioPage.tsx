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
} from 'lucide-react'

const STATE_PRESETS: Array<{
  id: MeeCatState
  label: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
  badgeColor: string
}> = [
  {
    id: 'idle',
    label: 'Nghỉ ngơi (Idle)',
    desc: 'Thở nhịp nhàng, mắt chớp tự nhiên 3-4s, đuôi vẫy nhẹ',
    icon: Smile,
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'talk',
    label: 'Thuyết trình (Talk)',
    desc: 'Lipsync theo text, chỉ trỏ tay và gật đầu nhịp nhàng',
    icon: Mic,
    badgeColor: 'bg-amber-100 text-amber-800',
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
  'Nhìn sang bên trái này, chúng ta có một bài toán ASMO rất thú vị!',
  'Con hãy thực hiện phép tính từ trái sang phải để tìm ra kết quả chính xác nhé!',
  'Bé làm bài xuất sắc lắm! Mèo AIKI vỗ tay khen ngợi con nào!',
]

const GESTURE_OPTIONS: Array<{ id: Gesture; label: string; desc: string }> = [
  { id: 'auto', label: 'Tự Động (AI Auto)', desc: 'Tự luân chuyển cử chỉ chỉ trỏ & thuyết trình theo nhịp câu' },
  { id: 'point-left', label: 'Chỉ Bên Trái', desc: 'Tay trái vươn sang trái chỉ vào đề bài / hình vẽ' },
  { id: 'point-right', label: 'Chỉ Bên Phải', desc: 'Tay phải vươn sang phải chỉ vào kết quả / bảng' },
  { id: 'explain', label: 'Thuyết Trình (2 tay)', desc: 'Hai tay mở ra vào giải thích sinh động' },
  { id: 'enthusiastic', label: 'Hào Hứng (Nhún nhảy)', desc: 'Vung hai tay lên cao cổ vũ nhiệt tình' },
]

export function MeeCatStudioPage() {
  const [activeState, setActiveState] = useState<MeeCatState>('idle')
  const [variant, setVariant] = useState<MeeCatVariant>('full-body')
  const [showBones, setShowBones] = useState(false)
  const [earAngle, setEarAngle] = useState(0)
  const [tailWiggle, setTailWiggle] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [engineMode, setEngineMode] = useState<'svg-rig' | 'rive'>('svg-rig')
  const [customQuoteIndex, setCustomQuoteIndex] = useState(0)

  // Speech & Lip-sync State
  const [speechInput, setSpeechInput] = useState(SAMPLE_SPEECHES[0])
  const [selectedGesture, setSelectedGesture] = useState<Gesture>('auto')
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
            <span>AIKI Cat Mascot Studio v2.0 • Full Rig & Lipsync</span>
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
              <span>Full Toàn Thân (Group 1)</span>
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
              Bán thân ôm bàn (Login)
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
      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(26rem,1fr)_minmax(24rem,28rem)]">
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
              quote={activeState === 'hint' ? SAMPLE_SPEECHES[customQuoteIndex] : undefined}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
            <span className="rounded-full bg-slate-900/10 px-3 py-1 text-xs font-bold text-slate-700">
              💡 Rê chuột vào Mèo Mee để thấy đầu, mắt và đuôi tương tác nhịp nhàng!
            </span>
          </div>
        </section>

        {/* Right Column: State Machine & Rigging Control Panel */}
        <aside
          className="flex flex-col gap-5 rounded-[2.5rem] border-3 border-white/80 bg-white/90 p-5 sm:p-6 shadow-clay backdrop-blur overflow-y-auto max-h-[calc(100vh-7rem)]"
          aria-label="Bảng điều khiển hoạt ảnh Mèo Mee"
        >
          {/* Section 1: State Machine Presets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-black text-slate-800">
                1. Trạng Thái Hoạt Ảnh (States)
              </h2>
              <span className="text-xs font-bold text-amber-600">
                {STATE_PRESETS.length} Trạng thái
              </span>
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

          {/* Section 2: AI Lipsync & Speech Studio */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-base font-black text-slate-800 flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-amber-600" />
                <span>2. Thuyết Trình AI & Lip-sync</span>
              </h2>
              {isSpeaking && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Đang nói
                </span>
              )}
            </div>

            {/* Custom Text input */}
            <div className="flex flex-col gap-2">
              <textarea
                value={speechInput}
                onChange={(e) => setSpeechInput(e.target.value)}
                placeholder="Nhập câu tiếng Việt để Mèo Mee phát âm và lipsync..."
                rows={2}
                className="w-full rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 text-xs font-bold text-slate-800 focus:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-300"
              />

              {/* Sample speech chips */}
              <div className="flex flex-wrap gap-1">
                {SAMPLE_SPEECHES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSpeechInput(sample)}
                    className="rounded-lg bg-slate-100 hover:bg-amber-100 px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-amber-800 transition"
                  >
                    Mẫu #{idx + 1}
                  </button>
                ))}
              </div>

              {/* Gesture Selection */}
              <div className="mt-2">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1 mb-1.5">
                  <Hand className="h-3.5 w-3.5 text-amber-600" />
                  <span>Cử Chỉ Tay Chân (Gestures):</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {GESTURE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedGesture(opt.id)}
                      className={`rounded-xl px-2.5 py-1.5 text-left text-[11px] font-extrabold transition border ${
                        selectedGesture === opt.id
                          ? 'border-amber-500 bg-amber-100 text-amber-900 shadow-2xs'
                          : 'border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div>{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5-Viseme Cute Cartoon Live Preview */}
              <div className="mt-2">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1">
                    <span>👄 5 Khẩu Hình Mèo Cute:</span>
                  </span>
                  {manualViseme && (
                    <button
                      type="button"
                      onClick={() => setManualViseme(undefined)}
                      className="text-[10px] text-amber-700 font-bold hover:underline"
                    >
                      Bỏ chọn (Tự động)
                    </button>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'closed', label: 'CLOSED (:3)', desc: 'Ngậm chúm chím' },
                    { id: 'open', label: 'OPEN (A,Ă,Â)', desc: 'Mở cong hạt dẻ' },
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
                      className={`rounded-lg p-1.5 text-center transition border text-[10px] ${
                        manualViseme === v.id
                          ? 'border-amber-500 bg-amber-200 text-amber-950 font-black shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-amber-50 font-bold'
                      }`}
                    >
                      <div className="font-extrabold">{v.label}</div>
                      <div className="text-[8px] text-slate-500 truncate">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Play & Stop Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={handlePlaySpeech}
                  disabled={isSpeaking || !speechInput.trim()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 px-3 text-xs font-black text-white hover:from-amber-600 hover:to-orange-600 transition shadow-sm disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Nói & Lipsync</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopSpeech}
                  disabled={!isSpeaking}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 px-3 text-xs font-black text-rose-700 hover:bg-rose-100 transition disabled:opacity-40"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Dừng</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Realtime Joint & Rigging Controls */}
          <div className="border-t border-slate-100 pt-4">
            <h2 className="font-display text-base font-black text-slate-800 mb-2.5">
              3. Điều Khiển Khớp Xương (Joints)
            </h2>

            <div className="flex flex-col gap-3 text-xs font-bold text-slate-700">
              {/* Ear Wiggle Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <span>Góc Lắc Tai:</span>
                  <span className="font-black text-amber-600">{earAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={earAngle}
                  onChange={(e) => setEarAngle(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Tail Wiggle Slider (for Full Body) */}
              {variant === 'full-body' && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Góc Vẫy Đuôi Mèo:</span>
                    <span className="font-black text-amber-600">{tailWiggle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={tailWiggle}
                    onChange={(e) => setTailWiggle(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Bones Debugger Toggle */}
              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-2.5 border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition">
                <div className="flex items-center gap-2">
                  <Bone className="h-4 w-4 text-amber-600" />
                  <span>Hiển thị Khung Xương ({variant === 'full-body' ? '8 Khớp' : '5 Khớp'})</span>
                </div>
                <input
                  type="checkbox"
                  checked={showBones}
                  onChange={(e) => setShowBones(e.target.checked)}
                  className="h-4 w-4 rounded accent-amber-500"
                />
              </label>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleManualBlink}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5 text-sky-500" />
                  <span>Chớp mắt</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextQuote}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                  <span>Đổi câu gợi ý</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Export & Assets Download */}
          <div className="mt-auto border-t border-slate-100 pt-3">
            <h2 className="font-display text-xs font-black text-slate-800 mb-2 flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-amber-600" />
              <span>4. Tải Về Tài Nguyên AIKI Rig</span>
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    'AIKI.svg',
                    '/assets/mee/aiki/AIKI.svg',
                  )
                }
                className="flex items-center justify-center gap-1 rounded-xl bg-amber-50 border border-amber-200/80 py-1.5 px-2 text-[11px] font-extrabold text-amber-800 hover:bg-amber-100 transition"
              >
                <span>AIKI.svg</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    'AIKI-pose-1.svg',
                    '/assets/mee/aiki/AIKI pose 1.svg',
                  )
                }
                className="flex items-center justify-center gap-1 rounded-xl bg-orange-50 border border-orange-200/80 py-1.5 px-2 text-[11px] font-extrabold text-orange-800 hover:bg-orange-100 transition"
              >
                <span>Pose 1</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    'mee-cat-rig-v1-manifest.json',
                    '/assets/mee/mee-cat-rig-v1-manifest.json',
                  )
                }
                className="flex items-center justify-center gap-1 rounded-xl bg-sky-50 border border-sky-200/80 py-1.5 px-2 text-[11px] font-extrabold text-sky-800 hover:bg-sky-100 transition"
              >
                <span>Manifest (.json)</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
