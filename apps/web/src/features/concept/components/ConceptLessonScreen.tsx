import React, { useState } from 'react'
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Zap,
  HelpCircle,
  X,
  Brain,
  Database,
  Lightbulb,
  Hammer,
  Wand2,
  Backpack,
  Play,
  Trophy,
  Star,
  Shield,
} from 'lucide-react'

export interface ConceptLessonScreenProps {
  onBackToRoadmap?: () => void
  onCompleteStation?: (xpEarned: number) => void
  islandTitle?: string
  stationTitle?: string
  initialStep?: 1 | 2 | 3 | 4 | 5 | 6
  initialTrack?: 'rules' | 'course_studio'
  isMobileFrame?: boolean
}

export type LessonTrack = 'rules' | 'course_studio'

// ── DATA CHO PHÂN HỆ 1: 10 QUY TẮC VÀNG (RULE 1) ──
interface HeroOption {
  id: string
  label: string
  icon: string
}
interface WeaponOption {
  id: string
  label: string
  icon: string
}
interface QuirkOption {
  id: string
  label: string
  icon: string
}

const HERO_OPTIONS: HeroOption[] = [
  { id: 'dad', label: 'Bố', icon: '👨‍👧' },
  { id: 'mom', label: 'Mẹ', icon: '👩‍👦' },
  { id: 'grandma', label: 'Bà ngoại', icon: '👵' },
  { id: 'cat', label: 'Mèo cưng', icon: '🐱' },
]

const WEAPON_OPTIONS: WeaponOption[] = [
  { id: 'swatter', label: 'Vợt muỗi phát sáng', icon: '🏸' },
  { id: 'pan', label: 'Chiếc chảo thần', icon: '🍳' },
  { id: 'broom', label: 'Chổi bay', icon: '🧹' },
  { id: 'goggles', label: 'Kính bơi hồng', icon: '🥽' },
]

const QUIRK_OPTIONS: QuirkOption[] = [
  { id: 'roach', label: 'Sợ con gián', icon: '🪳' },
  { id: 'caterpillar', label: 'Sợ sâu róm', icon: '🐛' },
  { id: 'singing', label: 'Hát lệch tông', icon: '🎤' },
  { id: 'cake', label: 'Mê ăn bánh', icon: '🍰' },
]

// ── DATA CHO PHÂN HỆ 2: COURSE STUDIO (4 CHÌA KHÓA VÀNG - ẢNH 4) ──
interface ObjectItem {
  id: string
  name: string
  turns: string
  thumb: string
}

const DRAW_OBJECTS: ObjectItem[] = [
  {
    id: 'cat',
    name: 'Con mèo',
    turns: '1 lượt',
    thumb: '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron.webp',
  },
  {
    id: 'fish',
    name: 'Con cá vàng',
    turns: '1 lượt',
    thumb: '/assets/pregenerated-combos/goldfish/combo__sub-con-ca-vang__cs-fish-vay-anh-bac__act-fish-dop-bot__ctx-fish-be-ca-soi.webp',
  },
  {
    id: 'dog',
    name: 'Con cún',
    turns: '1 lượt',
    thumb: '/assets/pregenerated-fallback/style-prism/dog_clay_v1.webp',
  },
]

const KEY_DESCRIPTIONS = [
  { id: 'beo-tron', label: 'Mèo mướp vàng béo tròn' },
  { id: 'chuong-vang', label: 'Đeo chuông vàng cổ' },
  { id: 'long-van', label: 'Lông vằn vàng óng' },
]

const KEY_ACTIONS = [
  { id: 'dao-buoc', label: 'Đang nằm ngủ cuộn tròn' },
  { id: 'liem-chan', label: 'Liếm chân sạch sẽ' },
  { id: 'vuon-vai', label: 'Vươn vai lười biếng' },
]

const KEY_CONTEXTS = [
  { id: 'them-nha', label: 'Trên chiếc ghế mây cạnh cửa sổ' },
  { id: 'hien-nha', label: 'Hiên nhà ngập hoa' },
  { id: 'tham-co', label: 'Bãi cỏ xanh mướt' },
]

export const ConceptLessonScreen: React.FC<ConceptLessonScreenProps> = ({
  onBackToRoadmap,
  onCompleteStation,
  islandTitle = 'Đảo 1: 10 Quy Tắc Vàng',
  stationTitle = 'Trạm 1: Nghĩ Ý Tưởng Trước Khi Hỏi AI',
  initialStep,
  initialTrack = 'rules',
  isMobileFrame = false,
}) => {
  const [activeTrack, setActiveTrack] = useState<LessonTrack>(initialTrack)

  // Phân hệ 1: 10 Quy Tắc Vàng (ĐÚNG 3 BƯỚC CHUẨN)
  const [ruleStep, setRuleStep] = useState<1 | 2 | 3>(() => {
    if (!initialStep) return 1
    if (initialStep >= 3) return 3
    if (initialStep <= 1) return 1
    return 2
  })

  // Phân hệ 2: Khóa Học Studio 4 Chìa Khóa Vàng (ĐÚNG 6 BƯỚC CHUẨN)
  const [courseStep, setCourseStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(() => {
    if (initialStep !== undefined) {
      return Math.min(Math.max(initialStep, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6
    }
    return initialTrack === 'course_studio' ? 5 : 1
  })

  // State cho Phân hệ 1 (Rules)
  const [selectedChoice, setSelectedChoice] = useState<'sonet' | 'zico' | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false)
  const [showZicoHint, setShowZicoHint] = useState<boolean>(false)
  const [showHintModal, setShowHintModal] = useState<boolean>(false)
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false)
  const [quizAnswer, setQuizAnswer] = useState<'A' | 'B' | 'C' | null>(null)
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null)
  const [selectedHero, setSelectedHero] = useState<string>('dad')
  const [selectedWeapon, setSelectedWeapon] = useState<string>('swatter')
  const [selectedQuirk, setSelectedQuirk] = useState<string>('roach')
  const [practiceMode, setPracticeMode] = useState<'custom' | 'generic'>('custom')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  // State cho Phân hệ 2 (Course Studio)
  const [selectedWarmupStyle, setSelectedWarmupStyle] = useState<string>('clay')
  const [isPlayingLessonVideo, setIsPlayingLessonVideo] = useState<boolean>(false)
  const [studioQuizAnswer, setStudioQuizAnswer] = useState<'A' | 'B' | 'C' | null>(null)
  const [studioQuizFeedback, setStudioQuizFeedback] = useState<string | null>(null)
  const [completedObjects, setCompletedObjects] = useState<string[]>(['cat'])
  const [studioAttemptsLeft, setStudioAttemptsLeft] = useState<number>(3)
  const [selectedObject, setSelectedObject] = useState<string>('cat')
  const [selectedDesc, setSelectedDesc] = useState<string>('beo-tron')
  const [selectedAction, setSelectedAction] = useState<string>('dao-buoc')
  const [selectedContext, setSelectedContext] = useState<string>('them-nha')

  const activeHero = HERO_OPTIONS.find((h) => h.id === selectedHero) || HERO_OPTIONS[0]
  const activeWeapon =
    WEAPON_OPTIONS.find((w) => w.id === selectedWeapon) || WEAPON_OPTIONS[0]
  const activeQuirk = QUIRK_OPTIONS.find((q) => q.id === selectedQuirk) || QUIRK_OPTIONS[0]

  const activeDescObj =
    KEY_DESCRIPTIONS.find((d) => d.id === selectedDesc) || KEY_DESCRIPTIONS[0]
  const activeActionObj =
    KEY_ACTIONS.find((a) => a.id === selectedAction) || KEY_ACTIONS[0]
  const activeContextObj =
    KEY_CONTEXTS.find((c) => c.id === selectedContext) || KEY_CONTEXTS[0]
  const activeObjectObj =
    DRAW_OBJECTS.find((o) => o.id === selectedObject) || DRAW_OBJECTS[0]

  const getStudioArtworkUrl = (objId: string) => {
    if (objId === 'fish') {
      return '/assets/pregenerated-combos/goldfish/combo__sub-con-ca-vang__cs-fish-vay-anh-bac__act-fish-dop-bot__ctx-fish-be-ca-soi.webp'
    }
    if (objId === 'dog') {
      return '/assets/pregenerated-fallback/style-prism/dog_clay_v1.webp'
    }
    return '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-dao-buoc__ctx-cat-them-nha.webp'
  }

  const handleAudioToggle = () => {
    setIsPlayingAudio((prev) => !prev)
  }

  const handleSelectChoice = (choice: 'sonet' | 'zico') => {
    setSelectedChoice(choice)
    if (choice === 'zico') {
      setShowZicoHint(true)
    } else {
      setShowZicoHint(false)
    }
  }

  const handleGenerateArt = (mode: 'custom' | 'generic') => {
    setIsGenerating(true)
    setPracticeMode(mode)
    setTimeout(() => {
      setIsGenerating(false)
    }, 450)
  }

  const handleFinishStation = () => {
    setShowCelebrationModal(true)
  }

  return (
    <div className="w-full max-w-[1024px] mx-auto flex flex-col gap-5 text-zinc-900 pb-20 select-none min-w-0">
      {/* ── BỘ CHUYỂN ĐỔI CHÍNH: 2 PHÂN HỆ (10 QUY TẮC VÀNG VS KHÓA HỌC THỰC HÀNH STUDIO) ── */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-zinc-200/80 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTrack('rules')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTrack === 'rules'
              ? 'bg-[#18181b] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
          <span>Phân hệ 1: 10 Quy Tắc Vàng (QT1)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTrack('course_studio')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTrack === 'course_studio'
              ? 'bg-[#18181b] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 bg-orange-100/60'
          }`}
        >
          <Hammer className="w-3.5 h-3.5 text-orange-400" />
          <span>Phân hệ 2: Khóa Học &amp; Studio (Ảnh 4)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#FD7D2E] text-white text-[9px] font-black">
            Studio
          </span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────── */}
      {/* PHÂN HỆ 1: 10 QUY TẮC VÀNG (RULES TRACK - ĐÚNG 3 BƯỚC CHUẨN)                 */}
      {/* ──────────────────────────────────────────────────────────────────────────── */}
      {activeTrack === 'rules' ? (
        <>
          {/* Header trạm Rules: Bước {ruleStep} / 3 */}
          <header className="flex flex-col gap-3 pt-1">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackToRoadmap}
                aria-label="Quay lại Bản đồ Đảo & Trạm"
                className="min-h-[48px] px-3.5 py-2.5 rounded-full bg-white/90 border border-slate-200/80 shadow-xs hover:bg-white active:scale-95 transition-all flex items-center gap-1.5 text-zinc-700 text-xs sm:text-sm font-bold shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-700" />
                <span>Quay lại Bản đồ</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black shadow-xs shrink-0">
                <Zap className="w-3.5 h-3.5 text-[#FD7D2E] fill-[#FD7D2E]" />
                <span>+50 XP</span>
              </div>
            </div>

            {/* Tiêu đề & 3 bước bấm trực tiếp */}
            <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block">
                    {islandTitle}
                  </span>
                  <div className="sr-only" aria-hidden="true">
                    <span>Đảo 1: 10 Quy Tắc Vàng</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-zinc-900 leading-snug">
                    {stationTitle}
                  </h1>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-purple-700">
                    Bước {ruleStep} / 3
                  </span>
                </div>
              </div>

              {/* Progress bar Soft Clay Solid Flat */}
              <div className="w-full h-2.5 rounded-full bg-purple-100 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-purple-600 progress-hatched transition-all duration-300"
                  style={{ width: `${(ruleStep / 3) * 100}%` }}
                />
              </div>

              {/* 3 Clickable step pills */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[
                  { step: 1, label: '1. Tình huống & Bí kíp' },
                  { step: 2, label: '2. Câu đố phản xạ' },
                  { step: 3, label: '3. Thực hành & Nhận cúp ✨' },
                ].map((s) => {
                  const isActive = ruleStep === s.step
                  const isDone = ruleStep > s.step
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setRuleStep(s.step as any)}
                      className={`min-h-[44px] px-1.5 sm:px-2 py-1.5 rounded-xl text-[10px] sm:text-xs font-black text-center leading-tight flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? s.step === 3
                            ? 'bg-[#FD7D2E] text-white shadow-2xs'
                            : 'bg-purple-700 text-white shadow-2xs'
                          : isDone
                            ? 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </header>

          {/* Lời dẫn Mèo Mee Comic Dialogue */}
          <section
            aria-label="Lời hướng dẫn từ Mèo Mee"
            className="relative rounded-3xl bg-[#f5f0ff] p-4 sm:p-5 shadow-xs flex items-start gap-3.5 sm:gap-4.5 border border-purple-100/80"
          >
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-purple-100 p-0.5 shadow-2xs border border-purple-200">
                <div className="w-full h-full rounded-2xl bg-white overflow-hidden flex items-center justify-center">
                  <img
                    src="/assets/aikid-ui/mascot-original/course-wave.webp"
                    alt="Mèo Mee Mascot"
                    className="w-full h-full object-cover object-top scale-110"
                  />
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-white text-[#FD7D2E] text-[9px] font-black shadow-2xs mt-1">
                Mèo Mee
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-purple-900 tracking-tight">
                  {ruleStep === 1 && 'Tình Huống & Bí Kíp 💡'}
                  {ruleStep === 2 && 'Thử Tài Phản Xạ 🧠'}
                  {ruleStep === 3 && 'Xưởng Sáng Tạo Của Con & Vinh Danh 🏆'}
                </span>

                <button
                  type="button"
                  onClick={handleAudioToggle}
                  aria-label={isPlayingAudio ? 'Dừng đọc' : 'Nghe Mee đọc'}
                  className={`min-h-[38px] px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-purple-600 text-white animate-pulse'
                      : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Đang đọc...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Nghe Mee đọc</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-zinc-800 leading-relaxed">
                {ruleStep === 1 &&
                  '“Cô giáo giao đề: Vẽ siêu anh hùng CỦA RIÊNG con. Đố con bức tranh nào đúng yêu cầu của cô giáo hơn? Hãy so sánh và khám phá bí kíp nhé!”'}
                {ruleStep === 2 &&
                  '“Cùng Mèo Mee thử tài phản xạ: Vì sao bức tranh nguệch ngoạc của Sonet lại được cô giáo khen hơn? Chọn đáp án đúng để mở xưởng thực hành nhé!”'}
                {ruleStep === 3 &&
                  '“Bây giờ đến lượt con! Hãy phối hợp 3 khối ý tưởng độc nhất của riêng con để AIKI vẽ kiệt tác, đo độ độc đáo và nhận Cúp Vàng nhé!”'}
              </p>
            </div>
          </section>

          {/* BƯỚC 1: TÌNH HUỐNG & BÍ KÍP (Rule Step 1) */}
          {ruleStep === 1 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-purple-100 border border-purple-200 p-1 flex items-center justify-center shadow-xs">
                    <img
                      src="/assets/optimized/cat_avatar_clean.webp"
                      alt="Mèo Mee"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                        Tình huống
                      </span>
                      <span className="text-[11px] font-bold text-zinc-400">Mèo Mee kể chuyện</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-zinc-900 leading-snug">
                      Vẽ siêu anh hùng CỦA RIÊNG con
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
                      &ldquo;Dừng lại nào các bạn ơi! Cô giáo ra đề: <strong>Vẽ siêu anh hùng CỦA RIÊNG con</strong>. Hai bạn nhỏ đang tranh cãi bức tranh nào đúng yêu cầu hơn!&rdquo;
                    </p>
                  </div>
                </div>

                {/* Minh họa tranh 2 bạn nhỏ Sonet vs Zico */}
                <div className={`grid ${isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3 sm:gap-4 pt-1`}>
                  <div
                    onClick={() => handleSelectChoice('zico')}
                    className={`relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      selectedChoice === 'zico'
                        ? 'bg-amber-50 shadow-md ring-2 ring-amber-400 scale-[1.01]'
                        : 'bg-zinc-50 shadow-2xs hover:shadow-xs border border-slate-200/80 active:scale-98'
                    }`}
                  >
                    <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 shadow-inner">
                      <img
                        src="/assets/aiki-rules/rule1_opt_zico.webp"
                        alt="Tranh Zico - Siêu anh hùng áo choàng đỏ"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-black/70 text-white shadow-xs backdrop-blur-xs">
                        Tranh Zico
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <h3 className="text-sm sm:text-base font-black text-zinc-900">
                        Siêu anh hùng áo choàng đỏ
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        Rất đẹp nhưng giống hệt các mẫu siêu nhân có sẵn trên mạng.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleSelectChoice('sonet')}
                    className={`relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      selectedChoice === 'sonet'
                        ? 'bg-emerald-50 shadow-md ring-2 ring-emerald-500 scale-[1.01]'
                        : 'bg-zinc-50 shadow-2xs hover:shadow-xs border border-slate-200/80 active:scale-98'
                    }`}
                  >
                    {selectedChoice === 'sonet' && (
                      <div className="absolute -top-2.5 -right-2.5 z-20 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce-subtle">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    )}

                    <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 shadow-inner">
                      <img
                        src="/assets/aiki-rules/rule1_opt_sonet.webp"
                        alt="Tranh Sonet - Bố sợ gián cầm vợt muỗi"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-700 text-white shadow-xs backdrop-blur-xs">
                        Tranh Sonet ⭐
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <h3 className="text-sm sm:text-base font-black text-zinc-900">
                        Bố sợ gián cầm vợt muỗi
                      </h3>
                      <p className="text-xs text-zinc-600 font-medium">
                        Ý tưởng độc đáo từ kỷ niệm có thật của riêng Sonet và bố!
                      </p>
                    </div>
                  </div>
                </div>

                {showZicoHint && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                    <span className="text-base shrink-0">💡</span>
                    <p>
                      Tranh của bạn Zico rất đẹp nhưng là mẫu quen thuộc ai gõ AI cũng ra được! Đề bài yêu cầu siêu anh hùng <strong>CỦA RIÊNG con</strong>. Hãy bấm thử bức tranh của Sonet nhé!
                    </p>
                  </div>
                )}

                {selectedChoice === 'sonet' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                    <span className="text-base shrink-0">🎉</span>
                    <p>
                      Tuyệt vời! Sonet đã mang kỷ niệm độc nhất của riêng mình vào tranh, đó chính là bí kíp của một nhà sáng tạo AI nhí thông thái!
                    </p>
                  </div>
                )}
              </div>

              {/* HỘP BÍ KÍP SOFT CLAY: KHO MẪU AI VS BỘ NÃO SÁNG TẠO */}
              <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight">
                      Bí Kíp: Kho Mẫu AI vs Bộ Não Sáng Tạo Của Con
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      So sánh trực quan giữa trí tuệ nhân tạo và con người
                    </p>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    Bí Kíp Số 1
                  </span>
                </div>

                <div className={`grid ${isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
                  <div className="rounded-2xl bg-zinc-50 border border-slate-200/80 p-4 space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-200 text-zinc-700 text-xs font-black">
                      <Database className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Kho Mẫu AI</span>
                    </div>
                    <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 shadow-inner">
                      <img
                        src="/assets/aiki-rules/aiki_compare_ai_warehouse.webp"
                        alt="Kho dữ liệu mẫu có sẵn của AI"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                      🤖 Gõ câu lệnh chung chung thì AI chỉ lấy ra các siêu nhân quen thuộc ai cũng biết!
                    </p>
                  </div>

                  <div className="rounded-2xl bg-purple-50/70 border border-purple-200 p-4 space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-200 text-purple-800 text-xs font-black">
                      <Brain className="w-3.5 h-3.5 text-purple-600" />
                      <span>Trí Não Của Bé</span>
                    </div>
                    <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-purple-100 shadow-inner">
                      <img
                        src="/assets/aiki-rules/aiki_compare_kid_mind.webp"
                        alt="Trí tưởng tượng độc đáo của bé"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-purple-900 font-semibold leading-relaxed">
                      🧠 Kỷ niệm bố sợ gián và chiếc vợt muỗi chỉ có trong đầu con, AI không thể tự đoán được!
                    </p>
                  </div>
                </div>

                {/* Poster Quy Tắc 1 Solid Flat */}
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50 border-2 border-purple-200 text-center space-y-1.5 shadow-2xs">
                  <span className="px-3 py-1 rounded-full bg-purple-700 text-white text-[11px] font-black uppercase tracking-wider">
                    QUY TẮC VÀNG 1
                  </span>
                  <p className="text-sm sm:text-base font-black text-purple-950 mt-1">
                    “Luôn nghĩ ý tưởng trước khi gõ lệnh cho AI!”
                  </p>
                  <p className="text-xs text-purple-800/90 font-medium">
                    AI chỉ vẽ nhanh — Ý tưởng độc nhất là của con!
                  </p>
                </div>
              </div>

              {/* Nút CTA sang Bước 2 */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setRuleStep(2)}
                  className="w-full min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#18181b] hover:bg-black text-white text-sm sm:text-base font-black shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span>Sang Bước 2: Câu đố phản xạ</span>
                </button>
              </div>
            </section>
          )}

          {/* BƯỚC 2: CÂU ĐỐ PHẢN XẠ (Rule Step 2) */}
          {ruleStep === 2 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                    Thử Tài Câu Đố Phản Xạ: Đạo Đức Số &amp; Bản Quyền Ý Tưởng 🧠
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Chọn câu trả lời đúng nhất để mở cửa xưởng thực hành
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black shadow-xs">
                  <span>⭐ +20 XP</span>
                </div>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-base sm:text-lg font-black text-zinc-900 leading-snug">
                  Vì sao bức tranh nguệch ngoạc của Sonet lại được cô giáo khen hơn?
                </h3>

                <div className="space-y-2.5">
                  {[
                    { key: 'A', text: 'Vì Sonet vẽ nhanh hơn máy tính' },
                    { key: 'B', text: 'Vì đó là ý tưởng độc nhất của riêng Sonet từ kỷ niệm với bố' },
                    { key: 'C', text: 'Vì tranh Sonet dùng nhiều màu sắc rực rỡ hơn' },
                  ].map((opt) => {
                    const isSelected = quizAnswer === opt.key
                    const isCorrect = opt.key === 'B'
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setQuizAnswer(opt.key as any)
                          if (isCorrect) {
                            setQuizFeedback('🎉 Chính xác 100%! Ý tưởng độc nhất từ kỷ niệm có thật chính là giá trị lớn nhất mà AI không bao giờ tự có được!')
                          } else {
                            setQuizFeedback('💡 Chưa đúng rồi! AI có thể vẽ rất nhanh và nhiều màu, nhưng điều cô giáo khen chính là ý tưởng riêng biệt của Sonet. Con chọn lại nhé!')
                          }
                        }}
                        className={`w-full min-h-[50px] p-3.5 sm:p-4 rounded-2xl text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-black shadow-xs'
                              : 'bg-amber-50 border-2 border-amber-400 text-amber-950'
                            : 'bg-zinc-50 hover:bg-zinc-100 border border-slate-200/70 text-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-amber-500 text-white'
                                : 'bg-white border border-slate-200 text-zinc-600'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isSelected && (
                          isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="text-amber-600 text-xs font-bold shrink-0">Thử lại</span>
                          )
                        )}
                      </button>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed animate-in fade-in ${
                      quizAnswer === 'B'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-amber-50 border border-amber-200 text-amber-900'
                    }`}
                  >
                    {quizFeedback}
                  </div>
                )}
              </div>

              <div className={`pt-2 flex ${isMobileFrame ? 'flex-col' : 'flex-col sm:flex-row'} items-stretch sm:items-center gap-2.5 w-full`}>
                <button
                  type="button"
                  onClick={() => setRuleStep(1)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer text-center ${isMobileFrame ? 'w-full' : 'w-full sm:w-auto'}`}
                >
                  Tình huống &amp; Bí kíp
                </button>
                <button
                  type="button"
                  onClick={() => setRuleStep(3)}
                  className={`${isMobileFrame ? 'w-full' : 'w-full sm:flex-1'} min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-black shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center break-normal`}
                >
                  <span>Sang Bước 3: Vào xưởng thực hành &amp; Nhận cúp</span>
                  <Hammer className="w-4 h-4 text-white" />
                </button>
              </div>
            </section>
          )}

          {/* BƯỚC 3: THỰC HÀNH & NHẬN CÚP ✨ (Rule Step 3) */}
          {ruleStep === 3 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                    Xưởng Sáng Tạo Prompt Capsule &amp; Nhận Cúp 🏆
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Thực hành Quy tắc 1: Nghĩ ý tưởng độc nhất của riêng con!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHintModal(true)}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Gợi ý</span>
                </button>
              </div>

              {/* KHỐI CHỌN Ý TƯỞNG 3 THÀNH PHẦN */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
                {/* Khối 1: Ai là Siêu Anh Hùng */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-800">
                    1. Ai là Siêu Anh Hùng của con?
                  </label>
                  <div className={`grid ${isMobileFrame ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-2 sm:gap-2.5`}>
                    {HERO_OPTIONS.map((hero) => (
                      <button
                        key={hero.id}
                        type="button"
                        onClick={() => {
                          setSelectedHero(hero.id)
                          setPracticeMode('custom')
                        }}
                        className={`min-h-[48px] px-2.5 sm:px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center ${
                          selectedHero === hero.id
                            ? 'bg-[#18181b] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
                        }`}
                      >
                        <span className="text-base shrink-0">{hero.icon}</span>
                        <span className="leading-tight">{hero.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Khối 2: Vũ khí bất ngờ */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-800">
                    2. Vũ khí / Vật phẩm bất ngờ:
                  </label>
                  <div className={`grid ${isMobileFrame ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-2 sm:gap-2.5`}>
                    {WEAPON_OPTIONS.map((weapon) => (
                      <button
                        key={weapon.id}
                        type="button"
                        onClick={() => {
                          setSelectedWeapon(weapon.id)
                          setPracticeMode('custom')
                        }}
                        className={`min-h-[48px] px-2.5 sm:px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center ${
                          selectedWeapon === weapon.id
                            ? 'bg-[#18181b] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
                        }`}
                      >
                        <span className="text-base shrink-0">{weapon.icon}</span>
                        <span className="leading-tight">{weapon.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Khối 3: Nét độc lạ hài hước */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-800">
                    3. Nét độc lạ / Nỗi sợ hài hước:
                  </label>
                  <div className={`grid ${isMobileFrame ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-2 sm:gap-2.5`}>
                    {QUIRK_OPTIONS.map((quirk) => (
                      <button
                        key={quirk.id}
                        type="button"
                        onClick={() => {
                          setSelectedQuirk(quirk.id)
                          setPracticeMode('custom')
                        }}
                        className={`min-h-[48px] px-2.5 sm:px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center ${
                          selectedQuirk === quirk.id
                            ? 'bg-[#18181b] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
                        }`}
                      >
                        <span className="text-base shrink-0">{quirk.icon}</span>
                        <span className="leading-tight">{quirk.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Capsule */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5f0ff] space-y-2 border border-purple-200/50">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block">
                    Ý Tưởng Của Con (Prompt Tự Nhiên):
                  </span>
                  <p className="text-xs sm:text-sm font-black text-zinc-900 leading-relaxed">
                    &ldquo;Siêu anh hùng <span className="inline-block px-2 py-0.5 rounded-lg bg-white text-purple-800 shadow-2xs mx-1">{activeHero.label}</span>
                    {' '}cầm <span className="inline-block px-2 py-0.5 rounded-lg bg-white text-orange-600 shadow-2xs mx-1">{activeWeapon.label}</span>
                    {' '}nhưng lại <span className="inline-block px-2 py-0.5 rounded-lg bg-white text-emerald-700 shadow-2xs mx-1">{activeQuirk.label}</span>!&rdquo;
                  </p>
                </div>

                {/* Practice Buttons */}
                <div className={`flex ${isMobileFrame ? 'flex-col' : 'flex-col sm:flex-row'} items-stretch sm:items-center gap-2.5 pt-1 w-full`}>
                  <button
                    type="button"
                    onClick={() => handleGenerateArt('custom')}
                    className={`${isMobileFrame ? 'w-full' : 'w-full sm:flex-1'} min-h-[48px] px-5 py-3 rounded-2xl bg-[#18181b] text-white text-xs sm:text-sm font-black shadow-md hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center`}
                  >
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>🤖 Nhờ AIKI vẽ ý tưởng của con 🎨</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateArt('generic')}
                    className={`${isMobileFrame ? 'w-full' : 'w-full sm:w-auto'} min-h-[48px] px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center`}
                  >
                    <span>Xem thử gõ chung chung (Kiểu Zico)</span>
                  </button>
                </div>
              </div>

              {/* Live Canvas & Uniqueness Meter */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
                    {practiceMode === 'custom'
                      ? 'Tranh Độc Nhất Từ Ý Tưởng Của Con ✨'
                      : 'Tranh Mẫu AI Quen Thuộc (Kiểu Zico) ⚠️'}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-zinc-500">Độ Độc Đáo:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs ${
                        practiceMode === 'custom'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {practiceMode === 'custom' ? '100% Độc Nhất Vô Nhị ⭐⭐⭐' : '20% Quen thuộc'}
                    </span>
                  </div>
                </div>

                <div className="w-full h-3 rounded-full bg-zinc-100 overflow-hidden p-0.5 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 progress-hatched ${
                      practiceMode === 'custom' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    style={{ width: practiceMode === 'custom' ? '100%' : '20%' }}
                  />
                </div>

                <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 shadow-inner group">
                  <img
                    src={
                      practiceMode === 'custom'
                        ? '/assets/aiki-rules/rule1_superhero_dad.webp'
                        : '/assets/aiki-rules/rule1_opt_zico.webp'
                    }
                    alt="Tranh kết quả thực hành"
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      isGenerating ? 'scale-95 blur-xs' : 'scale-100 blur-0'
                    }`}
                  />
                </div>
              </div>

              {/* KHỐI VINH DANH CÚP VÀNG 3D SOFT CLAY (Bước 3 hoàn thành) */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-5">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                  <img
                    src="/assets/trophy-clay-gold.png"
                    alt="Cúp Vàng AIKID"
                    className="w-full h-full object-contain drop-shadow-md animate-bounce-subtle"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
                    ★
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                    Chúc mừng con!
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 leading-snug">
                    Xuất Sắc! Con Đã Nắm Vững Quy Tắc 1
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                    &ldquo;Luôn nghĩ ý tưởng của riêng con trước khi hỏi AI. Con đã chứng minh mình là một Nhà Sáng Tạo AI nhí đầy bản lĩnh!&rdquo;
                  </p>
                </div>

                {/* 3 Huy hiệu phần thưởng */}
                <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3 max-w-md pt-1">
                  <div className="rounded-2xl bg-amber-50 border border-amber-200/70 p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                    <span className="text-lg">⭐</span>
                    <span className="text-xs font-black text-amber-950 mt-1">+3 Sao Vàng</span>
                    <span className="text-[10px] text-amber-800/80">Chất lượng cao</span>
                  </div>
                  <div className="rounded-2xl bg-orange-50 border border-orange-200/70 p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                    <span className="text-lg">⚡</span>
                    <span className="text-xs font-black text-[#FD7D2E] mt-1">+50 XP</span>
                    <span className="text-[10px] text-orange-800/80">Kinh nghiệm</span>
                  </div>
                  <div className="rounded-2xl bg-purple-50 border border-purple-200/70 p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                    <span className="text-lg">🛡️</span>
                    <span className="text-xs font-black text-purple-950 mt-1">Hiệp Sĩ AIKI</span>
                    <span className="text-[10px] text-purple-800/80">Huy hiệu Trạm 1</span>
                  </div>
                </div>

                {/* Nút hành động hoàn thành trạm */}
                <div className="w-full max-w-md pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleFinishStation}
                    className="w-full min-h-[52px] px-8 py-3.5 rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Hoàn thành trạm &amp; Lưu Balo 🏆</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRuleStep(2)}
                    className="w-full min-h-[44px] px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Quay lại Bước 2: Câu đố
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────────── */
        /* PHÂN HỆ 2: KHÓA HỌC STUDIO 4 CHÌA KHÓA VÀNG (ĐÚNG 6 BƯỚC CHUẨN)             */
        /* ──────────────────────────────────────────────────────────────────────────── */
        <section className="space-y-4 animate-in fade-in duration-300">
          {/* Header trạm Studio: Bước {courseStep} / 6 */}
          <header className="flex flex-col gap-3 pt-1">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackToRoadmap}
                aria-label="Quay lại Bản đồ Đảo & Trạm"
                className="min-h-[48px] px-3.5 py-2.5 rounded-full bg-white/90 border border-slate-200/80 shadow-xs hover:bg-white active:scale-95 transition-all flex items-center gap-1.5 text-zinc-700 text-xs sm:text-sm font-bold shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-700" />
                <span>Quay lại Bản đồ</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  Trạm 3 / 4: Chìa Khóa Phong Cách
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black shadow-xs">
                  <Zap className="w-3.5 h-3.5 text-[#FD7D2E] fill-[#FD7D2E]" />
                  <span>+60 XP</span>
                </div>
              </div>
            </div>

            {/* Tiêu đề & 6 bước bấm trực tiếp */}
            <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                    {islandTitle}
                  </span>
                  <div className="sr-only" aria-hidden="true">
                    <span>Đảo 2: Đảo Khám Phá</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-zinc-900 leading-snug">
                    {stationTitle}
                  </h1>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-emerald-700">
                    Bước {courseStep} / 6
                  </span>
                </div>
              </div>

              {/* Progress bar Soft Clay Solid Flat */}
              <div className="w-full h-2.5 rounded-full bg-emerald-100 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-emerald-600 progress-hatched transition-all duration-300"
                  style={{ width: `${(courseStep / 6) * 100}%` }}
                />
              </div>

              {/* 6 Clickable step pills */}
              <div className={`grid ${isMobileFrame ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-6'} gap-1.5 pt-0.5`}>
                {[
                  { step: 1, label: '1. Mục tiêu' },
                  { step: 2, label: '2. Khởi động' },
                  { step: 3, label: '3. Video' },
                  { step: 4, label: '4. Thử thách' },
                  { step: 5, label: '5. Studio ✨' },
                  { step: 6, label: '6. Nhận cúp 🏆' },
                ].map((s) => {
                  const isActive = courseStep === s.step
                  const isDone = courseStep > s.step
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setCourseStep(s.step as any)}
                      className={`min-h-[40px] px-2 py-1.5 rounded-xl text-[11px] font-black text-center transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                        isActive
                          ? s.step === 5
                            ? 'bg-[#FD7D2E] text-white shadow-2xs'
                            : s.step === 6
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-emerald-700 text-white shadow-2xs'
                          : isDone
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </header>

          {/* Lời dẫn Mèo Mee cho Course */}
          <section
            aria-label="Lời hướng dẫn từ Mèo Mee"
            className="relative rounded-3xl bg-[#f0fdf4] p-4 sm:p-5 shadow-xs flex items-start gap-3.5 sm:gap-4.5 border border-emerald-100/80"
          >
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-emerald-100 p-0.5 shadow-2xs border border-emerald-200">
                <div className="w-full h-full rounded-2xl bg-white overflow-hidden flex items-center justify-center">
                  <img
                    src="/assets/aikid-ui/mascot-original/course-wave.webp"
                    alt="Mèo Mee Mascot"
                    className="w-full h-full object-cover object-top scale-110"
                  />
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-white text-[#FD7D2E] text-[9px] font-black shadow-2xs mt-1">
                Mèo Mee
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-emerald-900 tracking-tight">
                  {courseStep === 1 && 'Mục Tiêu Bài Học 🎯'}
                  {courseStep === 2 && 'Khởi Động Nghệ Thuật 🎨'}
                  {courseStep === 3 && 'Xem Video Bài Giảng 🎬'}
                  {courseStep === 4 && 'Thử Thách Phản Xạ 🧠'}
                  {courseStep === 5 && 'Xưởng Thực Hành Studio ✨'}
                  {courseStep === 6 && 'Vinh Danh Tốt Nghiệp 🏆'}
                </span>

                <button
                  type="button"
                  onClick={handleAudioToggle}
                  aria-label={isPlayingAudio ? 'Dừng đọc' : 'Nghe Mee đọc'}
                  className={`min-h-[38px] px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Đang đọc...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Nghe Mee đọc</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-zinc-800 leading-relaxed">
                {courseStep === 1 &&
                  '“Mục tiêu hôm nay: Khám phá 4 Chìa Khóa Vàng AIKI để ra lệnh cho AI vẽ tranh mèo sinh động, độc nhất của riêng con!”'}
                {courseStep === 2 &&
                  '“Khởi động tư duy: Chạm để chọn phong cách nghệ thuật yêu thích của con nào! Đất nặn Soft Clay hay Mực cọ Sumi-e?”'}
                {courseStep === 3 &&
                  '“Xem video bài giảng ngắn 02:45 cùng Mee để nắm vững bí kíp ghép 4 Chìa Khóa Vàng và quy trình vẽ kiệt tác trong 1 lượt!”'}
                {courseStep === 4 &&
                  '“Thử tài phản xạ: Làm thế nào để câu lệnh giúp AI hiểu trọn vẹn ý tưởng của bé? Cùng trả lời nhé!”'}
                {courseStep === 5 &&
                  '“Chào mừng con đến Xưởng Studio! Hãy tự tay đổi 4 Chìa Khóa Vàng và xem tranh mèo biến hóa kỳ diệu trong 1 lượt duy nhất!”'}
                {courseStep === 6 &&
                  '“Chúc mừng con tốt nghiệp Trạm Studio! Tác phẩm tranh mèo độc bản đã được lưu vào Balo nghệ thuật của con!”'}
              </p>
            </div>
          </section>

          {/* BƯỚC 1: Mục tiêu bài học (Objectives) */}
          {courseStep === 1 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                    Mục Tiêu Bài Học
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">Trạm 3: Chìa Khóa Phong Cách</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-zinc-900 leading-snug">
                  4 Chìa Khóa Vàng AIKI &amp; Sức Mạnh Phong Cách
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                  Sau bài học này, con sẽ làm chủ công thức 4 thành phần để hướng dẫn AI vẽ chính xác mọi điều con tưởng tượng:
                </p>

                <div className={`grid ${isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3 pt-1`}>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
                    <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <span>🔑</span> 1. Đối tượng (Cái gì?)
                    </span>
                    <p className="text-xs text-amber-800/90 font-medium">Nhân vật chính: &ldquo;một con mèo&rdquo;</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/80 space-y-1">
                    <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                      <span>🔑</span> 2. Đặc điểm (Trông thế nào?)
                    </span>
                    <p className="text-xs text-purple-800/90 font-medium">Hình dáng, màu sắc: &ldquo;mèo mướp vàng béo tròn&rdquo;</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 space-y-1">
                    <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                      <span>🔑</span> 3. Hành động (Đang làm gì?)
                    </span>
                    <p className="text-xs text-blue-800/90 font-medium">Cử chỉ sống động: &ldquo;đang nằm ngủ cuộn tròn&rdquo;</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <span>🔑</span> 4. Bối cảnh (Ở đâu?)
                    </span>
                    <p className="text-xs text-emerald-800/90 font-medium">Không gian nơi chốn: &ldquo;trên chiếc ghế mây cạnh cửa sổ&rdquo;</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCourseStep(2)}
                    className="w-full min-h-[48px] px-6 py-3 rounded-2xl bg-[#18181b] hover:bg-black text-white text-sm sm:text-base font-black shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Bắt đầu khởi động</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* BƯỚC 2: Khởi động tư duy (Warmup) */}
          {courseStep === 2 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-zinc-900 leading-snug">
                      Khởi Động Tư Duy: Chọn Phong Cách Yêu Thích 🎨
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Chạm vào phong cách nghệ thuật con muốn thể hiện hôm nay
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Khởi Động
                  </span>
                </div>

                <div className={`grid ${isMobileFrame ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-2.5 sm:gap-3`}>
                  {[
                    { id: 'clay', name: 'Đất Nặn Soft Clay', desc: 'Tròn trĩnh, ấm áp', icon: '🧸' },
                    { id: 'ink', name: 'Mực Cọ Nước', desc: 'Thanh thoát, mềm mại', icon: '🖌️' },
                    { id: 'origami', name: 'Cắt Dán Giấy', desc: 'Sắc nét, kỳ công', icon: '✂️' },
                    { id: '3d', name: 'Hoạt Hình 3D', desc: 'Rực rỡ, sống động', icon: '✨' },
                  ].map((style) => {
                    const isSelected = selectedWarmupStyle === style.id
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedWarmupStyle(style.id)}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 min-h-[110px] ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-400/50'
                            : 'border-slate-200/80 bg-zinc-50 hover:bg-zinc-100'
                        }`}
                      >
                        <span className="text-2xl">{style.icon}</span>
                        <div>
                          <p className="text-xs font-black text-zinc-900 break-normal hyphens-none leading-tight">{style.name}</p>
                          <p className="text-[10px] text-zinc-500 font-medium break-normal hyphens-none leading-snug">{style.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-semibold leading-relaxed flex items-center gap-2">
                  <span>💡</span>
                  <span>
                    {selectedWarmupStyle === 'clay' && 'Mèo Mee cũng mê Đất nặn Soft Clay! Các chi tiết tròn trịa sẽ làm chú mèo siêu dễ thương!'}
                    {selectedWarmupStyle === 'ink' && 'Tuyệt cú mèo! Phong cách Mực cọ kết hợp nét vẽ tay sẽ tạo nên một tác phẩm nghệ thuật truyền thống độc đáo!'}
                    {selectedWarmupStyle === 'origami' && 'Khéo tay quá! Các mảng giấy cắt dán sẽ làm chú mèo trông cực kỳ cá tính!'}
                    {selectedWarmupStyle === '3d' && 'Rất hiện đại! Hoạt hình 3D sẽ biến chú mèo thành nhân vật trong phim hoạt hình bom tấn!'}
                  </span>
                </div>

                <div className={`pt-2 flex ${isMobileFrame ? 'flex-col' : 'flex-col sm:flex-row'} items-stretch sm:items-center gap-2.5 w-full`}>
                  <button
                    type="button"
                    onClick={() => setCourseStep(1)}
                    className={`min-h-[48px] px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer text-center ${isMobileFrame ? 'w-full' : 'w-full sm:w-auto'}`}
                  >
                    Mục tiêu
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseStep(3)}
                    className={`${isMobileFrame ? 'w-full' : 'w-full sm:flex-1'} min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#18181b] hover:bg-black text-white text-sm sm:text-base font-black shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center break-normal`}
                  >
                    <span>Xem video bài giảng</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* BƯỚC 3: Video bài giảng mô phỏng (Video Lesson) */}
          {courseStep === 3 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-zinc-900 leading-snug">
                      Video Bài Giảng: Bí Quyết 4 Chìa Khóa Vàng 🎬
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Thời lượng 02:45 • Mèo Mee hướng dẫn chi tiết
                    </p>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    02:45 HD
                  </span>
                </div>

                {/* Khung mô phỏng video player */}
                <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-zinc-900 shadow-inner flex flex-col justify-between p-4">
                  <img
                    src="/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-dao-buoc__ctx-cat-them-nha.webp"
                    alt="Video minh họa bài giảng"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-black">
                      Bài 1: Công Thức 4 Chìa Khóa
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
                      01:15 / 02:45
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setIsPlayingLessonVideo((prev) => !prev)}
                      aria-label={isPlayingLessonVideo ? 'Tạm dừng video' : 'Phát video'}
                      className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
                    >
                      {isPlayingLessonVideo ? (
                        <div className="w-5 h-5 flex items-center justify-between px-0.5">
                          <div className="w-1.5 h-5 bg-zinc-900 rounded-sm" />
                          <div className="w-1.5 h-5 bg-zinc-900 rounded-sm" />
                        </div>
                      ) : (
                        <Play className="w-7 h-7 text-zinc-900 fill-zinc-900 ml-1" />
                      )}
                    </button>
                  </div>

                  <div className="relative z-10 space-y-1.5">
                    <div className="w-full h-1.5 rounded-full bg-white/30 overflow-hidden">
                      <div className="w-1/2 h-full bg-[#FD7D2E] rounded-full" />
                    </div>
                    <p className="text-xs text-white font-medium text-center bg-black/50 backdrop-blur-xs py-1 px-3 rounded-lg">
                      &ldquo;Nhớ nhé: Khi có đủ 4 Chìa Khóa, bức tranh của con sẽ sinh động và độc nhất vô nhị!&rdquo;
                    </p>
                  </div>
                </div>

                {/* 3 Điểm cốt lõi */}
                <div className={`grid ${isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-2.5 pt-1`}>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-slate-200/70 text-xs space-y-1">
                    <span className="font-black text-zinc-900 block">1. Đủ 4 Chìa Khóa</span>
                    <span className="text-zinc-600 text-[11px] leading-relaxed block">Giúp AI hiểu rõ không bị vẽ lạc đề</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-slate-200/70 text-xs space-y-1">
                    <span className="font-black text-zinc-900 block">2. Phong Cách Riêng</span>
                    <span className="text-zinc-600 text-[11px] leading-relaxed block">Soft Clay mang lại cảm giác thủ công ấm áp</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-slate-200/70 text-xs space-y-1">
                    <span className="font-black text-zinc-900 block">3. Tạo Ảnh 1 Lượt</span>
                    <span className="text-zinc-600 text-[11px] leading-relaxed block">Đủ 4 khóa tạo ngay kiệt tác hoàn chỉnh</span>
                  </div>
                </div>

                <div className={`pt-2 flex ${isMobileFrame ? 'flex-col' : 'flex-col sm:flex-row'} items-stretch sm:items-center gap-2.5 w-full`}>
                  <button
                    type="button"
                    onClick={() => setCourseStep(2)}
                    className={`min-h-[48px] px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer text-center ${isMobileFrame ? 'w-full' : 'w-full sm:w-auto'}`}
                  >
                    Khởi động
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseStep(4)}
                    className={`${isMobileFrame ? 'w-full' : 'w-full sm:flex-1'} min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#18181b] hover:bg-black text-white text-sm sm:text-base font-black shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center break-normal`}
                  >
                    <span>Làm bài thử thách thực chiến</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* BƯỚC 4: Thử thách thực chiến (Quiz Challenge) */}
          {courseStep === 4 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-zinc-900 leading-snug">
                      Thử Thách Nhận Diện 4 Chìa Khóa Vàng 🧠
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Chọn đáp án đúng để nhận chứng chỉ mở cửa Xưởng Studio
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black shadow-xs">
                    <span>⭐ +15 XP</span>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-black text-zinc-900 leading-snug">
                  Để biến câu &ldquo;Con mèo&rdquo; thành bức tranh sống động và đúng ý con nhất, bé cần thêm những chiếc chìa khóa nào?
                </h3>

                <div className="space-y-2.5">
                  {[
                    { key: 'A', text: 'Chỉ cần gõ thêm chữ "thật đẹp" là đủ' },
                    { key: 'B', text: 'Cần thêm Đặc điểm, Hành động và Bối cảnh (Trông thế nào? Làm gì? Ở đâu?)' },
                    { key: 'C', text: 'Cần gõ thật dài các từ tiếng Anh phức tạp' },
                  ].map((opt) => {
                    const isSelected = studioQuizAnswer === opt.key
                    const isCorrect = opt.key === 'B'
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setStudioQuizAnswer(opt.key as any)
                          if (isCorrect) {
                            setStudioQuizFeedback('🎉 Tuyệt đỉnh! 4 Chìa Khóa Vàng chính là chìa khóa mở ra thế giới sáng tạo chân thực nhất của riêng con!')
                          } else {
                            setStudioQuizFeedback('💡 Chưa đúng rồi! AI chỉ hiểu rõ khi con miêu tả cụ thể Đặc điểm, Hành động và Bối cảnh. Con thử lại nhé!')
                          }
                        }}
                        className={`w-full min-h-[50px] p-3.5 sm:p-4 rounded-2xl text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-black shadow-xs'
                              : 'bg-amber-50 border-2 border-amber-400 text-amber-950'
                            : 'bg-zinc-50 hover:bg-zinc-100 border border-slate-200/70 text-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-amber-500 text-white'
                                : 'bg-white border border-slate-200 text-zinc-600'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isSelected && (
                          isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="text-amber-600 text-xs font-bold shrink-0">Thử lại</span>
                          )
                        )}
                      </button>
                    )
                  })}
                </div>

                {studioQuizFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed animate-in fade-in ${
                      studioQuizAnswer === 'B'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-amber-50 border border-amber-200 text-amber-900'
                    }`}
                  >
                    {studioQuizFeedback}
                  </div>
                )}

                <div className={`pt-2 flex ${isMobileFrame ? 'flex-col' : 'flex-col sm:flex-row'} items-stretch sm:items-center gap-2.5 w-full`}>
                  <button
                    type="button"
                    onClick={() => setCourseStep(3)}
                    className={`min-h-[48px] px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer text-center ${isMobileFrame ? 'w-full' : 'w-full sm:w-auto'}`}
                  >
                    Video bài học
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseStep(5)}
                    className={`${isMobileFrame ? 'w-full' : 'w-full sm:flex-1'} min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-black shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center break-normal`}
                  >
                    <span>Vào Xưởng Studio Thực Hành</span>
                    <Hammer className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* BƯỚC 5: XƯỞNG STUDIO 4 CHÌA KHÓA VÀNG (Chuẩn 100% Ảnh 4) */}
          {courseStep === 5 && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              {/* BỐ CỤC 3 CỘT: MÓN ĐỒ - 4 CHÌA KHÓA 2X2 - TRANH SÁNG TẠO 1 LƯỢT */}
              <div className="grid grid-cols-1 lg:grid-cols-[165px_minmax(0,1.2fr)_minmax(0,1fr)] gap-2.5 items-stretch w-full min-w-0">
                {/* CỘT 1 (BÊN TRÁI): MÓN ĐỒ BÉ VẼ */}
                <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2.5 shadow-2xs">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider">
                      <span>🎯</span>
                      <span>MÓN ĐỒ BÉ VẼ:</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      3 món
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {DRAW_OBJECTS.map((obj, idx) => {
                      const isSelected = selectedObject === obj.id
                      const isDone = completedObjects.includes(obj.id)
                      const statusLabel = isDone ? 'XONG ✓' : isSelected ? 'ĐANG LÀM' : 'CHỜ'

                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setSelectedObject(obj.id)}
                          className={`w-full p-2.5 rounded-xl border-2 transition-all flex flex-col gap-1.5 cursor-pointer text-left select-none shadow-2xs ${
                            isSelected
                              ? 'bg-amber-50/95 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                              : isDone
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-50'
                              : 'bg-white border-slate-200/90 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full min-w-0">
                            <span
                              className={`text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded-full truncate ${
                                isSelected
                                  ? 'bg-amber-400 text-amber-950'
                                  : isDone
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              0{idx + 1} {obj.name} · {statusLabel}
                            </span>
                            {isDone && <span className="text-emerald-600 text-xs font-black">✓</span>}
                          </div>

                          <div className="flex items-center gap-2 w-full min-w-0">
                            <img
                              src={obj.thumb}
                              alt={obj.name}
                              className="size-7 rounded-lg object-cover shrink-0 border border-slate-200"
                            />
                            <div className="font-black text-xs text-slate-900 truncate flex-1 min-w-0">
                              {obj.name}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                              1 lượt
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* CỘT 2 (Ở GIỮA): 4 CHÌA KHÓA VÀNG AIKI */}
                <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2.5 shadow-2xs">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-purple-950 uppercase tracking-wider">
                      <span>🔑</span>
                      <span>4 CHÌA KHÓA VÀNG AIKI</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#FD7D2E]">
                      Chạm ô để đổi từ gợi ý
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                    {/* Khóa 1: Cái gì? */}
                    <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/70 shadow-2xs space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                          1. Cái gì?
                        </span>
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-200/70 px-1.5 py-0.5 rounded-full">
                          Khóa
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white text-zinc-900 shadow-2xs flex items-center justify-between border border-amber-100">
                        <span className="font-extrabold text-xs text-zinc-900">{activeObjectObj.name}</span>
                        <span className="text-xs text-zinc-400">🔒</span>
                      </div>
                      <p className="text-[10px] font-medium text-amber-900/70">Đối tượng chính của tranh</p>
                    </div>

                    {/* Khóa 2: Trông thế nào? */}
                    <div className="p-2.5 rounded-xl bg-purple-50/90 border border-purple-200/70 shadow-2xs space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-purple-800">
                          2. Trông thế nào?
                        </span>
                        <span className="text-[9px] font-bold text-purple-700 bg-purple-200/70 px-1.5 py-0.5 rounded-full">
                          Đặc điểm
                        </span>
                      </div>
                      <div className="space-y-1">
                        {KEY_DESCRIPTIONS.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSelectedDesc(d.id)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-extrabold transition-all block cursor-pointer break-words ${
                              selectedDesc === d.id
                                ? 'bg-purple-600 text-white shadow-2xs font-black ring-1 ring-purple-400'
                                : 'bg-white/90 hover:bg-white text-zinc-700 border border-purple-100'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Khóa 3: Đang làm gì? */}
                    <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200/70 shadow-2xs space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-blue-800">
                          3. Đang làm gì?
                        </span>
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-200/70 px-1.5 py-0.5 rounded-full">
                          Hành động
                        </span>
                      </div>
                      <div className="space-y-1">
                        {KEY_ACTIONS.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setSelectedAction(a.id)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-extrabold transition-all block cursor-pointer break-words ${
                              selectedAction === a.id
                                ? 'bg-blue-600 text-white shadow-2xs font-black ring-1 ring-blue-400'
                                : 'bg-white/90 hover:bg-white text-zinc-700 border border-blue-100'
                            }`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Khóa 4: Ở đâu? */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/70 shadow-2xs space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                          4. Ở đâu?
                        </span>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-200/70 px-1.5 py-0.5 rounded-full">
                          Bối cảnh
                        </span>
                      </div>
                      <div className="space-y-1">
                        {KEY_CONTEXTS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedContext(c.id)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-extrabold transition-all block cursor-pointer break-words ${
                              selectedContext === c.id
                                ? 'bg-emerald-600 text-white shadow-2xs font-black ring-1 ring-emerald-400'
                                : 'bg-white/90 hover:bg-white text-zinc-700 border border-emerald-100'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CỘT 3 (BÊN PHẢI): TRANH SÁNG TẠO 1 LƯỢT DUY NHẤT */}
                <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2.5 shadow-2xs">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider">
                      <span>🖼️</span>
                      <span>TRANH SÁNG TẠO: 1 LƯỢT DUY NHẤT</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs">
                      {completedObjects.length}/3 ảnh
                    </span>
                  </div>

                  {/* Khung Canvas Tranh Mèo Soft Clay */}
                  <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-zinc-100 shadow-inner group border border-amber-200">
                    <img
                      src={getStudioArtworkUrl(selectedObject)}
                      alt="Tranh mèo Soft Clay"
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    />

                    {/* Badge Đã lưu vào Balo */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-600/95 text-white text-[11px] font-black shadow-md flex items-center gap-1 backdrop-blur-xs">
                      <Backpack className="w-3.5 h-3.5" />
                      <span>Đã lưu vào Balo</span>
                    </span>

                    {/* Tag Phong cách */}
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                      Phong cách: Mực &amp; Đất Nặn
                    </span>
                  </div>

                  {/* Thông tin 1 LƯỢT DUY NHẤT & Đầy đủ 4 khóa */}
                  <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FD7D2E] shrink-0" />
                      <span className="font-extrabold text-purple-950">1 LƯỢT DUY NHẤT</span>
                    </div>
                    <span className="text-[11px] font-black text-[#FD7D2E] bg-orange-100/80 border border-orange-200/80 px-2 py-0.5 rounded-lg">
                      Đầy đủ 4 khóa
                    </span>
                  </div>

                  {/* Balo bài học mini filmstrip lưu tranh bên dưới */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-black uppercase text-amber-950 flex items-center gap-1">
                        <Backpack className="w-3 h-3 text-amber-700" />
                        <span>Balo bài học:</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold">
                        {DRAW_OBJECTS.length} tranh lưu trữ
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {DRAW_OBJECTS.map((obj, idx) => {
                        const isCurrent = selectedObject === obj.id
                        return (
                          <button
                            key={obj.id}
                            type="button"
                            onClick={() => setSelectedObject(obj.id)}
                            className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 text-center cursor-pointer transition-all select-none ${
                              isCurrent
                                ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                                : 'border-zinc-200 bg-white hover:bg-zinc-50'
                            }`}
                          >
                            <img
                              src={obj.thumb}
                              alt={obj.name}
                              className="size-9 rounded-lg object-cover"
                            />
                            <div className="w-full truncate text-[10px] font-black text-zinc-800">
                              0{idx + 1}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* HÀNG ĐÁY — CÂU LỆNH: 4/4 CHÌA KHÓA & NÚT VẼ / NỘP BÀI */}
              <div className="rounded-2xl bg-[#fffdf5] p-3.5 sm:p-4 shadow-xs flex flex-col gap-3 min-w-0 border-2 border-amber-200/80">
                <div className="w-full min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <span>✨</span>
                      <span>CÂU LỆNH: 4/4 CHÌA KHÓA</span>
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Đủ 4 khóa
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-black text-zinc-900 leading-relaxed break-words bg-white/90 p-2.5 rounded-xl border border-amber-200/70">
                    &ldquo;Một chú <span className="text-purple-700">{selectedObject === 'cat' ? 'mèo' : activeObjectObj.name.toLowerCase()}</span>{' '}
                    <span className="text-amber-600">{activeDescObj.label.toLowerCase()}</span>,{' '}
                    <span className="text-blue-600">{activeActionObj.label.toLowerCase()}</span>{' '}
                    <span className="text-emerald-700">{activeContextObj.label.toLowerCase()}</span>.&rdquo;
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 w-full">
                  <button
                    type="button"
                    onClick={() => setCourseStep(4)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Thử thách
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!completedObjects.includes(selectedObject)) {
                        setCompletedObjects((prev) => [...prev, selectedObject])
                      }
                      setStudioAttemptsLeft((prev) => Math.max(0, prev - 1))
                    }}
                    className="min-h-[44px] sm:min-h-[48px] px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Vẽ tranh cùng AIKI · còn {studioAttemptsLeft} lượt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseStep(6)}
                    className="flex-1 min-h-[44px] sm:min-h-[48px] px-6 py-2.5 rounded-xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs sm:text-sm font-black shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Nộp bài • 1 ảnh</span>
                    <span className="text-base">🚀</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 6: TỐT NGHIỆP & NHẬN CÚP VÀNG 🏆 (Course Step 6) */}
          {courseStep === 6 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-5">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                  <img
                    src="/assets/trophy-clay-gold.png"
                    alt="Cúp Vàng AIKID"
                    className="w-full h-full object-contain drop-shadow-md animate-bounce-subtle"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
                    ★
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
                    Chúc mừng nhà sáng tạo tí hon!
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 leading-snug">
                    Tốt Nghiệp Khóa Học Studio!
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                    &ldquo;Bé đã xuất sắc làm chủ 4 Chìa Khóa Vàng AIKI để tạo ra tác phẩm tranh mèo Soft Clay độc bản!&rdquo;
                  </p>
                </div>

                {/* Thẻ tranh đóng khung đã lưu Balo */}
                <div className="w-full max-w-sm rounded-2xl bg-zinc-50 border border-slate-200/80 p-3 flex items-center gap-3 text-left">
                  <img
                    src="/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-dao-buoc__ctx-cat-them-nha.webp"
                    alt="Tranh mèo đã lưu vào Balo"
                    className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                      Đã lưu vào Balo nghệ thuật
                    </span>
                    <p className="text-xs font-black text-zinc-900 truncate">Chú Mèo Béo Tròn Thong Dong</p>
                    <p className="text-[10px] text-zinc-500 truncate">Phong cách: Mực &amp; Đất Nặn Soft Clay</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>

                {/* 3 Huy hiệu phần thưởng */}
                <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3 max-w-md pt-1">
                  <div className="rounded-2xl bg-amber-50 border border-amber-200/70 p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                    <span className="text-lg">⭐</span>
                    <span className="text-xs font-black text-amber-950 mt-1">+3 Sao Vàng Soft Clay</span>
                    <span className="text-[10px] text-amber-800/80">Kỹ năng đỉnh cao</span>
                  </div>
                  <div className="rounded-2xl bg-orange-50 border border-orange-200/70 p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                    <span className="text-lg">⚡</span>
                    <span className="text-xs font-black text-[#FD7D2E] mt-1">+100 XP</span>
                    <span className="text-[10px] text-orange-800/80">Kinh nghiệm</span>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200/70 p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                    <span className="text-lg">🛡️</span>
                    <span className="text-xs font-black text-emerald-950 mt-1">Bậc Thầy 4 Chìa Khóa</span>
                    <span className="text-[10px] text-emerald-800/80">Huy hiệu Trạm 3</span>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="w-full max-w-md pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleFinishStation}
                    className="w-full min-h-[52px] px-8 py-3.5 rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Hoàn thành trạm &amp; Lưu Balo 🏆</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCourseStep(5)}
                    className="w-full min-h-[44px] px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold active:scale-95 transition-all cursor-pointer text-center"
                  >
                    🎨 Luyện tập thêm trong Studio
                  </button>
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ── MODAL GỢI Ý MÈO MEE ── */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setShowHintModal(false)}
              aria-label="Đóng gợi ý"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#FD7D2E]" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900">Gợi Ý Từ Mèo Mee 🐾</h3>
                <p className="text-xs font-medium text-zinc-500">Bí quyết sáng tạo</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 text-xs text-zinc-700 font-medium leading-relaxed space-y-2">
              <p>
                💡 Hãy nghĩ về những điều thân thuộc nhất xung quanh con: bố mẹ, thú cưng và cả những thói quen hài hước nữa!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHintModal(false)}
              className="w-full min-h-[48px] rounded-2xl bg-[#18181b] text-white text-sm font-bold shadow-md hover:bg-black active:scale-95 transition-all cursor-pointer"
            >
              Con đã hiểu rồi!
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL ĂN MỪNG HOÀN THÀNH TRẠM 3 SAO ── */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-[36px] bg-white border-2 border-purple-200 p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="relative w-28 h-28 flex items-center justify-center animate-bounce-subtle">
              <img
                src="/assets/aikid-ui/mascot-original/world-celebrate.webp"
                alt="Mèo Mee ăn mừng"
                className="w-full h-full object-contain drop-shadow-lg"
              />
              <div className="absolute -bottom-1 w-20 h-3 bg-zinc-900/10 rounded-full blur-xs" />
            </div>

            <div className="flex items-center gap-2 text-2xl text-amber-400">
              <span className="transform -rotate-12 animate-bounce">⭐</span>
              <span className="text-3xl animate-bounce delay-100">⭐</span>
              <span className="transform rotate-12 animate-bounce delay-200">⭐</span>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>HOÀN THÀNH XUẤT SẮC TRẠM!</span>
              </div>
              <h3 className="text-xl font-black text-zinc-900 tracking-tight pt-1">
                3 Sao Tuyệt Đỉnh!
              </h3>
              <p className="text-xs font-medium text-zinc-600 leading-relaxed max-w-[260px] mx-auto">
                {activeTrack === 'rules'
                  ? 'Con đã xuất sắc hoàn thành phần thực hành và nắm vững Quy Tắc Vàng Số 1!'
                  : 'Con đã xuất sắc làm chủ 4 Chìa Khóa Vàng AIKI trong xưởng Studio thực tế!'}
              </p>
            </div>

            <div className="w-full p-3 rounded-2xl bg-amber-50 shadow-inner flex items-center justify-center gap-2 text-amber-900 font-black text-sm">
              <Zap className="w-4 h-4 text-[#FD7D2E] fill-[#FD7D2E]" />
              <span>Phần thưởng: +50 XP &amp; 3 Sao Soft Clay</span>
            </div>

            <div className="w-full space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowCelebrationModal(false)
                  onCompleteStation?.(activeTrack === 'rules' ? 50 : 100)
                  onBackToRoadmap?.()
                }}
                className="w-full min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#18181b] text-white text-sm font-black shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Về Bản Đồ Đảo</span>
                <span className="text-base">🏝️</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCelebrationModal(false)
                  if (activeTrack === 'rules') {
                    setRuleStep(3)
                  } else {
                    setCourseStep(5)
                  }
                }}
                className="w-full min-h-[44px] px-4 py-2 rounded-2xl bg-white hover:bg-zinc-50 text-purple-700 text-xs font-bold transition-all cursor-pointer"
              >
                Thực hành thêm tranh khác ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConceptLessonScreen
