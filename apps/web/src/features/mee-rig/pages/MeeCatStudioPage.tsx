import React, { useState } from 'react'
import { Link } from 'react-router'
import {
  MeeCatInteractiveCanvas,
  type MeeCatState,
  type MeeCatVariant,
} from '../components/MeeCatInteractiveCanvas'
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
    desc: 'Nhảy nhót, vẫy đuôi tít mù, má hồng lấp lánh',
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
    desc: 'Mắt nhắm cong tít, bóng zZz lơ lửng',
    icon: Moon,
    badgeColor: 'bg-purple-100 text-purple-700',
  },
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

  const QUOTES = [
    'Mèo Mee gợi ý: Con hãy thực hiện phép tính từ trái sang phải nhé!',
    'Mèo Mee gợi ý: Khoảng cách giữa 2 số liên tiếp tăng thêm 3 đơn vị đó!',
    'Mèo Mee gợi ý: Thử chia nhỏ hình vẽ phức tạp thành các hình quen thuộc nhé!',
    'Mèo Mee cổ vũ: Con thông minh lắm, chỉ còn 1 bước nữa là xong rồi! 🐾🎉',
  ]

  const handleManualBlink = () => {
    setIsBlinking(true)
    setTimeout(() => setIsBlinking(false), 240)
  }

  const handleNextQuote = () => {
    setCustomQuoteIndex((prev) => (prev + 1) % QUOTES.length)
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
            <span>Mee Cat Rig Studio v1.2</span>
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
      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(26rem,1fr)_minmax(22rem,26rem)]">
        {/* Left Column: Interactive Stage */}
        <section
          className="flex min-h-[34rem] flex-col items-center justify-center rounded-[2.5rem] border-3 border-white/80 bg-white/60 p-4 sm:p-8 shadow-clay backdrop-blur"
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
              quote={activeState === 'hint' ? QUOTES[customQuoteIndex] : undefined}
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
          className="flex flex-col gap-5 rounded-[2.5rem] border-3 border-white/80 bg-white/90 p-5 sm:p-6 shadow-clay backdrop-blur"
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

            <div className="grid grid-cols-2 gap-2.5">
              {STATE_PRESETS.map((preset) => {
                const Icon = preset.icon
                const isActive = activeState === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setActiveState(preset.id)}
                    className={`group flex flex-col items-start rounded-2xl p-3 text-left transition-all border-2 ${
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

          {/* Section 2: Realtime Joint & Rigging Controls */}
          <div className="border-t border-slate-100 pt-4">
            <h2 className="font-display text-lg font-black text-slate-800 mb-3">
              2. Điều Khiển Khớp Xương (Joints)
            </h2>

            <div className="flex flex-col gap-3.5 text-xs font-bold text-slate-700">
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
              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition">
                <div className="flex items-center gap-2">
                  <Bone className="h-4 w-4 text-amber-600" />
                  <span>Hiển thị Khung Xương & Pivot ({variant === 'full-body' ? '8 Khớp' : '5 Khớp'})</span>
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

          {/* Section 3: Export & Assets Download */}
          <div className="mt-auto border-t border-slate-100 pt-4">
            <h2 className="font-display text-sm font-black text-slate-800 mb-2 flex items-center gap-1.5">
              <Download className="h-4 w-4 text-amber-600" />
              <span>3. Tải Về File Rig Đã Chuẩn Hóa</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    'mee-cat-fullbody-rig-v1-source.svg',
                    '/assets/mee/mee-cat-fullbody-rig-v1-source.svg',
                  )
                }
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200/80 py-2 px-3 text-xs font-extrabold text-amber-800 hover:bg-amber-100 transition"
              >
                <span>Full Body SVG (Group 1)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    'mee-cat-rig-v1-manifest.json',
                    '/assets/mee/mee-cat-rig-v1-manifest.json',
                  )
                }
                className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200/80 py-2 px-3 text-xs font-extrabold text-sky-800 hover:bg-sky-100 transition"
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
