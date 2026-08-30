import React, { useState } from 'react'
import { Link } from 'react-router'
import {
  Sparkles,
  Volume2,
  Play,
  Square,
  Flame,
  ArrowLeft,
  Cat,
  Hand,
  Layers,
  Download,
  Smile,
  BookOpen,
  HelpCircle,
  Trophy,
  Cookie,
  Moon,
  Video,
  Monitor,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react'
import { MeeCatInteractiveCanvas, type MeeCatState, type MeeCatVariant } from '../components/MeeCatInteractiveCanvas'
import type { Gesture, Viseme } from '../hooks/useMeeCatSpeech'

const SAMPLE_SPEECHES = [
  'Chào các bạn nhỏ! Mình là Mèo Mee, trợ giảng AI của các bạn đây!',
  'Nhìn sang bảng bài học này, chúng ta có phép tính 25 cộng 17 bằng bao nhiêu nhé!',
  'Hãy quan sát kỹ từng bước giải từ trái sang phải nào!',
  'Xuất sắc lắm các bạn nhỏ! Chúng mình cùng vỗ tay khen ngợi nào!',
]

const LECTURE_GESTURES_LEFT = [
  { id: 'point-left' as Gesture, label: '👈 Chỉ Điểm Bảng Trái', desc: 'Tay vươn chỉ thẳng từng dòng nội dung' },
  { id: 'underline-left' as Gesture, label: '📏 Quét Dòng & Gạch Chân', desc: 'Tay quét nhịp nhàng gạch chân công thức' },
  { id: 'callout-left' as Gesture, label: '🙋‍♂️ Vẫy Gọi Chú Ý Trái', desc: 'Vẫy tay góc bảng nhắc học sinh tập trung' },
]

const LECTURE_GESTURES_RIGHT = [
  { id: 'point-right' as Gesture, label: '👉 Chỉ Điểm Bảng Phải', desc: 'Tay vươn chỉ thẳng nội dung bên phải' },
  { id: 'underline-right' as Gesture, label: '📐 Quét Dòng & Gạch Chân', desc: 'Tay quét nhịp nhàng gạch chân bên phải' },
  { id: 'callout-right' as Gesture, label: '🙋‍♀️ Vẫy Gọi Chú Ý Phải', desc: 'Vẫy tay góc bảng bên phải gọi tập trung' },
]

const PRESENTATION_GESTURES = [
  { id: 'explain' as Gesture, label: '👐 Diễn Giải 2 Tay', desc: 'Hai tay co gập đung đưa giảng giải sinh động' },
  { id: 'enthusiastic' as Gesture, label: '🎉 Tuyên Dương & Chúc Mừng', desc: 'Vung hai tay lên cao cổ vũ nhiệt tình' },
  { id: 'auto' as Gesture, label: '🤖 Tự Động (AI Lecture Auto)', desc: 'Tự luân chuyển cử chỉ chỉ trỏ & giảng bài' },
]

const STATE_PRESETS: Array<{ id: MeeCatState; label: string; icon: any; desc: string }> = [
  { id: 'talk', label: 'Thuyết trình (Talk)', icon: Volume2, desc: 'Lipsync cử động mồm theo text, chỉ trỏ bảng giảng' },
  { id: 'idle', label: 'Nghỉ ngơi (Idle)', icon: Smile, desc: 'Thở nhịp nhàng, mắt chớp tự nhiên 3-5s' },
  { id: 'look', label: 'Theo chuột (Look)', icon: Eye, desc: 'Đầu và tròng mắt xoay theo vị trí con trỏ chuột' },
  { id: 'hint', label: 'Gợi ý ASMO (Hint)', icon: HelpCircle, desc: 'Giơ tay vẫy và hiển thị bóng thoại bài học' },
  { id: 'celebrate', label: 'Ăn mừng (Celebrate)', icon: Trophy, desc: 'Nhảy nhót, vẫy đuôi tít mù, má hồng rạng rỡ' },
  { id: 'eat', label: 'Ăn bánh (Munch)', icon: Cookie, desc: 'Gặm snack cá và nhai miệng nhồm nhoàm' },
  { id: 'sleepy', label: 'Buồn ngủ (Sleepy)', icon: Moon, desc: 'Mắt lim dim, đầu gật gù, bong bóng ngủ' },
]

export function MeeCatStudioPage() {
  const [activeState, setActiveState] = useState<MeeCatState>('talk')
  const [variant, setVariant] = useState<MeeCatVariant>('full-body')
  const [engineMode, setEngineMode] = useState<'svg-rig' | 'rive'>('svg-rig')
  const [bgMode, setBgMode] = useState<'pastel' | 'green-screen' | 'transparent'>('pastel')
  const [catPosition, setCatPosition] = useState<'right' | 'left'>('right')
  const [showLectureBoard, setShowLectureBoard] = useState(true)

  const [showBones, setShowBones] = useState(false)
  const [earAngle, setEarAngle] = useState(0)
  const [tailWiggle, setTailWiggle] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [customQuoteIndex, setCustomQuoteIndex] = useState(0)

  // Speech TTS and Lipsync state
  const [speechInput, setSpeechInput] = useState(SAMPLE_SPEECHES[1])
  const [selectedGesture, setSelectedGesture] = useState<Gesture>('point-left')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [manualViseme, setManualViseme] = useState<Viseme | undefined>(undefined)

  const handleManualBlink = () => {
    setIsBlinking(true)
    setTimeout(() => setIsBlinking(false), 240)
  }

  const handlePlaySpeech = () => {
    setActiveState('talk')
    setManualViseme(undefined)
    setIsSpeaking(false)
    setTimeout(() => {
      setIsSpeaking(true)
    }, 40)
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
            <span>AIKI Mascot Studio • Phòng Thu & Giảng Bài Video</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Position Selector: Cat on Right vs Cat on Left */}
          <div className="inline-flex rounded-2xl bg-white/90 p-1 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setCatPosition('right')
                setSelectedGesture('point-left')
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                catPosition === 'right'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👈 Mèo đứng Phải (Giảng Trái)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCatPosition('left')
                setSelectedGesture('point-right')
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                catPosition === 'left'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👉 Mèo đứng Trái (Giảng Phải)</span>
            </button>
          </div>

          {/* Background Selector for Chroma Key Green Screen Video Recording */}
          <div className="inline-flex rounded-2xl bg-white/90 p-1 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setBgMode('pastel')}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-black transition ${
                bgMode === 'pastel' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
              }`}
              title="Phông nền Pastel tiêu chuẩn"
            >
              🎨 Pastel
            </button>
            <button
              type="button"
              onClick={() => setBgMode('green-screen')}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-black transition ${
                bgMode === 'green-screen' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
              title="Phông nền xanh lá để quay video OBS & tách nền"
            >
              🟩 Phông Xanh (OBS)
            </button>
            <button
              type="button"
              onClick={() => setBgMode('transparent')}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-black transition ${
                bgMode === 'transparent' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'
              }`}
              title="Nền trong suốt"
            >
              🏁 Trong suốt
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(32rem,1fr)_minmax(24rem,28rem)]">
        {/* Left Column: Interactive Lecture Stage */}
        <section
          className={`flex min-h-[38rem] flex-col items-center justify-center rounded-[2.5rem] border-3 p-4 sm:p-6 transition-colors duration-300 ${
            bgMode === 'green-screen'
              ? 'bg-[#00ff00] border-emerald-500 shadow-xl'
              : bgMode === 'transparent'
              ? 'bg-transparent border-dashed border-slate-300'
              : 'border-white/80 bg-white/60 shadow-clay backdrop-blur'
          }`}
          aria-label="Sân khấu Giảng Bài Mèo Mee"
        >
          {/* Lecture Simulator Container */}
          <div
            className={`w-full flex flex-col md:flex-row items-center justify-center gap-4 ${
              catPosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            {/* 1. Mèo AIKI Mascot Stage */}
            <div className="w-full md:w-[44%] max-w-[340px] flex items-center justify-center">
              <MeeCatInteractiveCanvas
                state={activeState}
                variant={variant}
                showBones={showBones}
                earAngle={earAngle}
                tailWiggle={tailWiggle}
                isBlinking={isBlinking}
                engineMode={engineMode}
                transparentBackground={bgMode !== 'pastel'}
                isSpeaking={isSpeaking}
                speechText={speechInput}
                gesture={selectedGesture}
                viseme={manualViseme}
                onSpeechEnd={() => setIsSpeaking(false)}
                quote={!showLectureBoard && (isSpeaking || activeState === 'talk') ? speechInput : undefined}
                className="w-full h-auto aspect-[4/5] p-3 sm:p-5"
              />
            </div>

            {/* 2. Interactive AI Lecture Blackboard (Bảng Bài Giảng Trực Quan) */}
            {showLectureBoard && bgMode !== 'green-screen' && (
              <div className="w-full md:w-[56%] max-w-[420px] animate-in fade-in zoom-in-95 duration-200">
                <div className="rounded-3xl border-4 border-amber-900/40 bg-gradient-to-b from-slate-900 to-slate-950 p-5 text-white shadow-2xl relative overflow-hidden">
                  {/* Chalkboard Header */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
                        Bảng Bài Giảng Tương Tác
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                      LIVE LESSON
                    </span>
                  </div>

                  {/* Math Formula / Question Focus Card */}
                  <div className="rounded-2xl bg-slate-800/80 border border-white/10 p-3 mb-3 text-center">
                    <div className="text-[11px] font-bold text-amber-200/80 uppercase">Ví dụ minh họa</div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-wide mt-1">
                      25 + 17 = 42
                    </div>
                  </div>

                  {/* Dynamic Speech Text Highlight Area */}
                  <div className="rounded-2xl bg-amber-500/10 border border-amber-400/30 p-3.5 min-h-[90px] flex items-center justify-center">
                    <p className="text-xs sm:text-sm font-bold text-amber-100 text-center leading-relaxed">
                      {speechInput || 'Gõ văn bản vào Textbox bên phải để Mèo AIKI bắt đầu giảng bài và chỉ trỏ trực tiếp vào bảng này...'}
                    </p>
                  </div>

                  {/* Pointer Focus Target Indicator */}
                  <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Trạng thái: <strong className="text-amber-300">{isSpeaking ? '🎙️ Đang giảng bài...' : '⏸️ Sẵn sàng'}</strong></span>
                    <span>Cử chỉ: <strong className="text-sky-300">{selectedGesture}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Board Helper */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
            <button
              type="button"
              onClick={() => setShowLectureBoard((prev) => !prev)}
              className="rounded-full bg-slate-900/10 hover:bg-slate-900/20 px-3 py-1 text-xs font-bold text-slate-700 transition"
            >
              {showLectureBoard ? 'Ẩn Bảng Bài Giảng (Chỉ hiện Mèo)' : 'Hiện Bảng Bài Giảng Tương Tác'}
            </button>
            <span className="text-xs font-medium text-slate-500">
              • Thử bấm các cử chỉ <strong>Chỉ Điểm</strong>, <strong>Quét Dòng</strong>, <strong>Vẫy Gọi</strong> bên phải!
            </span>
          </div>
        </section>

        {/* Right Column: State Machine & Rigging Control Panel */}
        <aside
          className="flex flex-col gap-5 rounded-[2.5rem] border-3 border-white/80 bg-white/90 p-5 sm:p-6 shadow-clay backdrop-blur overflow-y-auto max-h-[calc(100vh-7rem)]"
          aria-label="Bảng điều khiển hoạt ảnh Mèo Mee"
        >
          {/* Section 1: AI Lipsync & Lecture Speech Studio */}
          <div className="rounded-3xl bg-amber-50/70 p-4 border-2 border-amber-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-base font-black text-amber-950 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-amber-600" />
                <span>1. Giảng Bài AI & Lip-sync Đồng Bộ</span>
              </h2>
              {isSpeaking && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-xs font-black animate-pulse shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" /> ĐANG GIẢNG BÀI...
                </span>
              )}
            </div>

            {/* Custom Text input */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black text-slate-700">
                📝 Nội dung lời giảng của Mèo AIKI:
              </label>
              <textarea
                value={speechInput}
                onChange={(e) => setSpeechInput(e.target.value)}
                placeholder="Gõ lời giảng bài vào đây để Mèo AIKI đọc và mấp máy khẩu hình..."
                rows={3}
                className="w-full rounded-2xl border-2 border-amber-300 bg-white p-3 text-xs font-bold text-slate-900 shadow-xs focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />

              {/* Sample speech chips */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-black text-amber-900">Mẫu lời giảng:</span>
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
                  <span>▶️ Bắt Đầu Giảng Bài</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopSpeech}
                  disabled={!isSpeaking}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-300 bg-rose-50 py-3 px-4 text-xs font-black text-rose-700 hover:bg-rose-100 transition disabled:opacity-40 active:scale-95"
                >
                  <Square className="h-4 w-4 fill-current" />
                  <span>⏹ Tạm Dừng</span>
                </button>
              </div>

              {/* Lecture Gestures Selection */}
              <div className="mt-2 pt-2 border-t border-amber-200/60">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Hand className="h-4 w-4 text-amber-600" />
                  <span>Cử Chỉ Giảng Bài Chuyên Nghiệp ({catPosition === 'right' ? 'Bên Trái' : 'Bên Phải'}):</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {(catPosition === 'right' ? LECTURE_GESTURES_LEFT : LECTURE_GESTURES_RIGHT).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedGesture(opt.id)
                        setActiveState('talk')
                      }}
                      className={`rounded-xl p-2.5 text-left text-[11px] font-extrabold transition border-2 ${
                        selectedGesture === opt.id
                          ? 'border-amber-500 bg-amber-200/80 text-amber-950 shadow-xs'
                          : 'border-white bg-white/90 text-slate-700 hover:bg-white shadow-2xs'
                      }`}
                    >
                      <div className="font-black text-amber-950">{opt.label}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Presentation & Joyful Gestures */}
                <div className="mt-2 pt-2 border-t border-amber-200/40 grid grid-cols-1 gap-1.5">
                  {PRESENTATION_GESTURES.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedGesture(opt.id)
                        setActiveState('talk')
                      }}
                      className={`rounded-xl p-2 text-left text-[11px] font-extrabold transition border-2 ${
                        selectedGesture === opt.id
                          ? 'border-amber-500 bg-amber-200/80 text-amber-950 shadow-xs'
                          : 'border-white bg-white/90 text-slate-700 hover:bg-white shadow-2xs'
                      }`}
                    >
                      <div className="font-black">{opt.label}</div>
                      <div className="text-[9px] text-slate-500">{opt.desc}</div>
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

          {/* Section 2: Other Mascot States */}
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
                        setIsSpeaking(false)
                      }
                    }}
                    className={`flex flex-col items-start gap-1 rounded-2xl p-3 text-left transition border-2 ${
                      isActive
                        ? 'border-amber-500 bg-amber-100/90 text-amber-950 shadow-soft scale-[1.02]'
                        : 'border-white/80 bg-white/70 text-slate-700 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-extrabold text-xs flex items-center gap-1.5">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
                        {preset.label}
                      </span>
                      {isActive && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">{preset.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Fine-tuning & Skeleton */}
          <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
            <h2 className="font-display text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-slate-600" />
              <span>3. Tinh Chỉnh Xương & Hoạt Ảnh</span>
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Khung Xương & Điểm Khớp</span>
                <button
                  type="button"
                  onClick={() => setShowBones((prev) => !prev)}
                  className={`rounded-xl px-3 py-1 text-xs font-black transition ${
                    showBones ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {showBones ? 'Bật (ON)' : 'Tắt (OFF)'}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Góc nghiêng tai</span>
                  <span>{earAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={earAngle}
                  onChange={(e) => setEarAngle(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Góc vẫy đuôi</span>
                  <span>{tailWiggle}°</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={tailWiggle}
                  onChange={(e) => setTailWiggle(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleManualBlink}
                  className="w-full rounded-2xl bg-white border border-slate-300 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                >
                  😉 Chớp mắt thủ công
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Downloads */}
          <div className="rounded-3xl bg-amber-500/10 p-4 border border-amber-400/30">
            <h2 className="font-display text-sm font-black text-amber-950 mb-2 flex items-center gap-2">
              <Download className="h-4 w-4 text-amber-700" />
              <span>4. Tải Xuất Tài Nguyên Cho Dựng Video</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => downloadFile('aiki-cat-rig-vector.svg', '/assets/mee/mee-cat-rig-v1-source.svg')}
                className="rounded-2xl bg-white border border-amber-300 p-2.5 text-center text-xs font-black text-amber-900 hover:bg-amber-100 transition shadow-2xs"
              >
                SVG Chuẩn Rig
              </button>
              <button
                type="button"
                onClick={() => downloadFile('aiki-manifest.json', '/assets/mee/mee-cat-rig-v1-manifest.json')}
                className="rounded-2xl bg-white border border-amber-300 p-2.5 text-center text-xs font-black text-amber-900 hover:bg-amber-100 transition shadow-2xs"
              >
                Manifest Rive JSON
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
