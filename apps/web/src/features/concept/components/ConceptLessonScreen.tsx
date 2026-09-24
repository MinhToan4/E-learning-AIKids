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
  ArrowRight,
  Brain,
  Database,
  Lightbulb,
  MessageSquare,
  Palette,
  BookOpen,
  Hammer,
  Wand2,
  Check,
  Backpack,
  Film,
  Camera,
  Play,
  RotateCcw,
} from 'lucide-react'
import { MeeStageFrame } from './MeeStageFrame'

export interface ConceptLessonScreenProps {
  onBackToRoadmap?: () => void
  onCompleteStation?: (xpEarned: number) => void
  islandTitle?: string
  stationTitle?: string
  initialStep?: 1 | 2 | 3 | 4
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
    turns: 'Lượt 1/2',
    thumb: '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron.webp',
  },
  {
    id: 'fish',
    name: 'Con cá vàng',
    turns: '0/2 lượt',
    thumb: '/assets/trophy-clay-gold.png',
  },
  {
    id: 'dog',
    name: 'Chú cún Shiba',
    turns: '0/2 lượt',
    thumb: '/assets/pregenerated-fallback/style-prism/dog_clay_v1.webp',
  },
]

const KEY_DESCRIPTIONS = [
  { id: 'beo-tron', label: 'Béo tròn bụ bẫm' },
  { id: 'chuong-vang', label: 'Đeo chuông vàng cổ' },
  { id: 'long-van', label: 'Lông vằn vàng óng' },
]

const KEY_ACTIONS = [
  { id: 'dao-buoc', label: 'Thong dong dạo bước' },
  { id: 'liem-chan', label: 'Liếm chân sạch sẽ' },
  { id: 'vuon-vai', label: 'Vươn vai lười biếng' },
]

const KEY_CONTEXTS = [
  { id: 'them-nha', label: 'Bên thềm nhà đón nắng' },
  { id: 'hien-nha', label: 'Hiên nhà ngập hoa' },
  { id: 'tham-co', label: 'Bãi cỏ xanh mướt' },
]

export const ConceptLessonScreen: React.FC<ConceptLessonScreenProps> = ({
  onBackToRoadmap,
  onCompleteStation,
  islandTitle = 'Đảo 1: 10 Quy Tắc Vàng',
  stationTitle = 'Trạm 1: Nghĩ Ý Tưởng Trước Khi Hỏi AI',
  initialStep = 1,
  initialTrack = 'rules',
  isMobileFrame = false,
}) => {
  const [activeTrack, setActiveTrack] = useState<LessonTrack>(initialTrack)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(initialStep)
  const [selectedChoice, setSelectedChoice] = useState<'sonet' | 'zico' | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false)
  const [showZicoHint, setShowZicoHint] = useState<boolean>(false)
  const [showHintModal, setShowHintModal] = useState<boolean>(false)
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false)

  // State cho Bước 3 của Rules Track: Xưởng Thực Hành Sáng Tạo
  const [selectedHero, setSelectedHero] = useState<string>('dad')
  const [selectedWeapon, setSelectedWeapon] = useState<string>('swatter')
  const [selectedQuirk, setSelectedQuirk] = useState<string>('roach')
  const [practiceMode, setPracticeMode] = useState<'custom' | 'generic'>('custom')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  // State cho Phân hệ 2: Course Studio 4 Chìa Khóa Vàng (Ảnh 4)
  const [studioTurn, setStudioTurn] = useState<1 | 2>(2)
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
    <div className="w-full flex flex-col gap-5 text-zinc-900 pb-20 select-none min-w-0">
      {/* ── BỘ CHUYỂN ĐỔI CHÍNH: 2 PHÂN HỆ (10 QUY TẮC VÀNG VS KHÓA HỌC THỰC HÀNH STUDIO) ── */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-zinc-200/80 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTrack('rules')}
          className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
          className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTrack === 'course_studio'
              ? 'bg-[#18181b] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 bg-orange-100/60'
          }`}
        >
          <Hammer className="w-3.5 h-3.5 text-orange-400" />
          <span>Phân hệ 2: Khóa Học &amp; Studio (Ảnh 4)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#FD7D2E] text-white text-[9px] font-black">
            Studio
          </span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────── */}
      {/* PHÂN HỆ 1: 10 QUY TẮC VÀNG (RULES TRACK - BÀI 1 TRẠM 1: QT1)                 */}
      {/* ──────────────────────────────────────────────────────────────────────────── */}
      {activeTrack === 'rules' ? (
        <>
          {/* Header trạm Rules */}
          <header className="flex flex-col gap-3 pt-1">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackToRoadmap}
                aria-label="Quay lại Bản đồ Đảo & Trạm"
                className="min-h-[48px] px-3.5 py-2.5 rounded-full bg-white/80 backdrop-blur-xs border border-white/60 shadow-xs hover:bg-white active:scale-95 transition-all flex items-center gap-1.5 text-zinc-700 text-xs sm:text-sm font-bold shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-700" />
                <span>Quay lại Bản đồ</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/90 backdrop-blur-xs text-amber-900 text-xs font-black shadow-xs shrink-0">
                <Zap className="w-3.5 h-3.5 text-[#FD7D2E] fill-[#FD7D2E]" />
                <span>+50 XP</span>
              </div>
            </div>

            {/* Tiêu đề & 4 bước bấm trực tiếp */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-xs border border-white/60 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 truncate block">
                    {islandTitle}
                  </span>
                  <h1 className="text-base sm:text-lg font-black text-zinc-900 leading-snug truncate">
                    {stationTitle}
                  </h1>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-purple-700">
                    Bước {currentStep} / 4
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-purple-100/70 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 progress-hatched transition-all duration-500"
                  style={{ width: `${currentStep * 25}%` }}
                />
              </div>

              {/* 4 Clickable step pills */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                    currentStep === 1
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  1. Phân xử
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                    currentStep === 2
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  2. Kho AI
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-black text-center transition-all cursor-pointer ${
                    currentStep === 3
                      ? 'bg-[#FD7D2E] text-white shadow-2xs'
                      : 'bg-orange-100 text-[#FD7D2E] hover:bg-orange-200'
                  }`}
                >
                  3. Thực hành ✨
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                    currentStep === 4
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  4. Ghi nhớ
                </button>
              </div>
            </div>

            {/* Sub-tab switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-100/90 shadow-2xs">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentStep === 1 || currentStep === 2
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>📖 Khám Phá &amp; Bí Quyết</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentStep === 3 || currentStep === 4
                    ? 'bg-[#18181b] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 bg-orange-100/60 hover:bg-orange-100'
                }`}
              >
                <Hammer className="w-4 h-4 text-amber-400" />
                <span>🛠️ Xưởng Thực Hành</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#FD7D2E] text-white text-[9px] font-black">
                  Hot
                </span>
              </button>
            </div>
          </header>

          {/* Lời dẫn Mèo Mee Comic Dialogue */}
          <section
            aria-label="Lời hướng dẫn từ Mèo Mee"
            className="relative rounded-3xl bg-[#f5f0ff] p-4 sm:p-5 shadow-xs flex items-start gap-3.5 sm:gap-4.5"
          >
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-300 p-0.5 shadow-sm">
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
                  {currentStep === 1 && 'Thử Thách Phân Xử ⚖️'}
                  {currentStep === 2 && 'Bí Mật Kho Mẫu AI 🤖'}
                  {currentStep === 3 && 'Xưởng Sáng Tạo AI Của Con 🛠️'}
                  {currentStep === 4 && 'Quy Tắc Vàng Số 1 📜'}
                </span>

                <button
                  type="button"
                  onClick={handleAudioToggle}
                  aria-label={isPlayingAudio ? 'Dừng đọc' : 'Nghe Mee đọc'}
                  className={`min-h-[38px] px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-purple-600 text-white animate-pulse'
                      : 'bg-white text-purple-700 hover:bg-purple-50'
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
                {currentStep === 1 &&
                  '“Cô giáo giao đề tài: Vẽ siêu anh hùng CỦA RIÊNG con. Đố con bức tranh nào đúng yêu cầu của cô giáo hơn?”'}
                {currentStep === 2 &&
                  '“Kho của AI chỉ có những mẫu quen thuộc mà ai gõ cũng ra. Còn kỷ niệm về bố thì chỉ có trong đầu con thôi!”'}
                {currentStep === 3 &&
                  '“Bây giờ đến lượt con! Hãy tự tay phối hợp 3 khối ý tưởng độc nhất của riêng con để AI vẽ ra kiệt tác nhé!”'}
                {currentStep === 4 &&
                  '“Tuyệt vời! Nhớ nhé: Hãy luôn nghĩ ý tưởng của con trước, rồi mới chia sẻ với AI để tạo nên bức tranh độc nhất!”'}
              </p>
            </div>
          </section>

          {/* BƯỚC 1: Phân Xử Zico vs Sonet */}
          {currentStep === 1 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight">
                  Bức tranh nào mang ý tưởng của riêng bé?
                </h2>
                <span className="text-xs font-semibold text-zinc-500">Chạm để chọn</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => handleSelectChoice('zico')}
                  className={`relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                    selectedChoice === 'zico'
                      ? 'bg-amber-50/90 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                      : 'bg-white shadow-xs hover:shadow-md active:scale-98'
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
                      ? 'bg-emerald-50 shadow-xl ring-2 ring-emerald-500 scale-[1.02]'
                      : 'bg-white shadow-xs hover:shadow-md active:scale-98'
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
                <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-900 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-in fade-in">
                  <span className="text-base">💡</span>
                  <p>
                    Tranh của bạn Zico rất đẹp nhưng là mẫu quen thuộc ai gõ AI cũng ra được! Đề bài yêu cầu siêu anh hùng <strong>CỦA RIÊNG con</strong>. Hãy bấm thử bức tranh của Sonet nhé!
                  </p>
                </div>
              )}

              {selectedChoice === 'sonet' && (
                <div className="pt-2 animate-in slide-in-from-bottom-2 duration-300">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full min-h-[48px] px-6 py-3.5 rounded-full bg-[#18181b] text-white text-sm sm:text-base font-black shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Xem Bí Quyết Của Mèo Mee</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* BƯỚC 2: Kho AI vs Trí Não Bé */}
          {currentStep === 2 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight">
                  Vì sao bức tranh của Sonet lại đặc biệt hơn?
                </h2>
                <span className="text-xs font-bold text-purple-700">So Sánh Trực Quan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white/80 backdrop-blur-xs border border-white/60 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100/90 text-zinc-700 text-xs font-black">
                    <Database className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Kho Mẫu AI</span>
                  </div>
                  <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 shadow-inner">
                    <img
                      src="/assets/aiki-rules/aiki_compare_ai_warehouse.webp"
                      alt="Kho dữ liệu mẫu có sẵn của AI"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-zinc-600 font-medium">
                    🤖 Gõ câu lệnh chung chung thì AI chỉ lấy ra các siêu nhân quen thuộc ai cũng biết!
                  </p>
                </div>

                <div className="rounded-3xl bg-white/85 backdrop-blur-xs border border-white/60 p-4 sm:p-5 shadow-xs space-y-3 ring-2 ring-purple-300/50">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/90 text-purple-800 text-xs font-black">
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>Trí Não Của Bé</span>
                  </div>
                  <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-purple-50 shadow-inner">
                    <img
                      src="/assets/aiki-rules/aiki_compare_kid_mind.webp"
                      alt="Trí tưởng tượng độc đáo của bé"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-purple-900 font-semibold">
                    🧠 Kỷ niệm bố sợ gián và chiếc vợt muỗi chỉ có trong đầu con, AI không thể tự đoán được!
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 text-center shadow-xs">
                <p className="text-sm sm:text-base font-black text-amber-950">
                  ✨ &ldquo;AI chỉ vẽ nhanh — Ý tưởng là của con!&rdquo; ✨
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="min-h-[48px] px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer"
                >
                  ← Xem lại tình huống
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 min-h-[48px] px-6 py-3.5 rounded-full bg-[#FD7D2E] text-white text-sm sm:text-base font-black shadow-lg hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Vào Xưởng Thực Hành Ngay</span>
                  <Hammer className="w-4 h-4 text-white" />
                </button>
              </div>
            </section>
          )}

          {/* BƯỚC 3: Xưởng Thực Hành Sáng Tạo (Hands-on Practice) */}
          {currentStep === 3 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                    Xưởng Thực Hành Sáng Tạo
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

              <div className="rounded-3xl bg-white/80 backdrop-blur-xs border border-white/60 p-4 sm:p-5 shadow-xs space-y-4">
                {/* Khối 1: Ai là Siêu Anh Hùng */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-800">
                    1. Ai là Siêu Anh Hùng của con?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HERO_OPTIONS.map((hero) => (
                      <button
                        key={hero.id}
                        type="button"
                        onClick={() => {
                          setSelectedHero(hero.id)
                          setPracticeMode('custom')
                        }}
                        className={`min-h-[44px] px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          selectedHero === hero.id
                            ? 'bg-[#18181b] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
                        }`}
                      >
                        <span className="text-base">{hero.icon}</span>
                        <span>{hero.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Khối 2: Vũ khí bất ngờ */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-800">
                    2. Vũ khí / Vật phẩm bất ngờ:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {WEAPON_OPTIONS.map((weapon) => (
                      <button
                        key={weapon.id}
                        type="button"
                        onClick={() => {
                          setSelectedWeapon(weapon.id)
                          setPracticeMode('custom')
                        }}
                        className={`min-h-[44px] px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          selectedWeapon === weapon.id
                            ? 'bg-[#18181b] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
                        }`}
                      >
                        <span className="text-base">{weapon.icon}</span>
                        <span className="truncate">{weapon.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Khối 3: Nét độc lạ hài hước */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-800">
                    3. Nét độc lạ / Nỗi sợ hài hước:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {QUIRK_OPTIONS.map((quirk) => (
                      <button
                        key={quirk.id}
                        type="button"
                        onClick={() => {
                          setSelectedQuirk(quirk.id)
                          setPracticeMode('custom')
                        }}
                        className={`min-h-[44px] px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          selectedQuirk === quirk.id
                            ? 'bg-[#18181b] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
                        }`}
                      >
                        <span className="text-base">{quirk.icon}</span>
                        <span className="truncate">{quirk.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Capsule */}
                <div className="p-4 rounded-2xl bg-[#f5f0ff] space-y-2 border border-purple-200/50">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block">
                    Ý Tưởng Của Con (Prompt Tự Nhiên):
                  </span>
                  <p className="text-xs sm:text-sm font-black text-zinc-900 leading-relaxed">
                    &ldquo;Siêu anh hùng <span className="px-2 py-0.5 rounded-lg bg-white text-purple-800 shadow-2xs mx-1">{activeHero.label}</span>
                    {' '}cầm <span className="px-2 py-0.5 rounded-lg bg-white text-orange-600 shadow-2xs mx-1">{activeWeapon.label}</span>
                    nhưng lại <span className="px-2 py-0.5 rounded-lg bg-white text-emerald-700 shadow-2xs mx-1">{activeQuirk.label}</span>!&rdquo;
                  </p>
                </div>

                {/* Practice Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleGenerateArt('custom')}
                    className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-[#18181b] text-white text-xs sm:text-sm font-black shadow-md hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>🤖 Nhờ AIKI vẽ ý tưởng của con 🎨</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateArt('generic')}
                    className="min-h-[48px] px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Xem thử gõ chung chung (Kiểu Zico)</span>
                  </button>
                </div>
              </div>

              {/* Live Canvas & Uniqueness Meter */}
              <div className="rounded-3xl bg-white/80 backdrop-blur-xs border border-white/60 p-4 sm:p-5 shadow-sm space-y-3.5">
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

                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="min-h-[48px] px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    ← Xem lại kho AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="flex-1 min-h-[48px] px-6 py-3 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Nộp bài &amp; Nhận thưởng</span>
                    <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* BƯỚC 4: Ghi Nhớ & Poster */}
          {currentStep === 4 && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight">
                  Poster Vinh Danh Quy Tắc Vàng 1
                </h2>
                <span className="text-xs font-bold text-emerald-600">Đã Hoàn Thành Thực Hành</span>
              </div>

              <div className="rounded-3xl bg-white/80 backdrop-blur-xs border border-white/60 p-4 sm:p-6 shadow-sm flex flex-col items-center gap-4">
                <div className="relative w-full max-w-sm aspect-4/3 rounded-2xl overflow-hidden shadow-md group">
                  <img
                    src="/assets/aiki-rules/rule1_superhero_dad.webp"
                    alt="Poster Quy Tắc 1"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="rounded-2xl bg-amber-50 p-3 text-center shadow-2xs">
                    <h4 className="text-xs font-black text-amber-950">1. Nghĩ ý tưởng riêng</h4>
                    <p className="text-[10px] text-amber-800/80 mt-0.5">Dừng 30 giây tưởng tượng</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3 text-center shadow-2xs">
                    <h4 className="text-xs font-black text-blue-950">2. Kể chi tiết cho AI</h4>
                    <p className="text-[10px] text-blue-800/80 mt-0.5">Mô tả đặc điểm độc đáo</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 text-center shadow-2xs">
                    <h4 className="text-xs font-black text-emerald-950">3. Tranh độc nhất</h4>
                    <p className="text-[10px] text-emerald-800/80 mt-0.5">Không đụng hàng ai hết</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="min-h-[48px] px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer"
                >
                  ← Thực hành lại
                </button>
                <button
                  type="button"
                  onClick={handleFinishStation}
                  className="flex-1 min-h-[48px] px-6 py-3 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Hoàn thành Trạm 1 (+50 XP)</span>
                  <span className="text-base">🚀</span>
                </button>
              </div>
            </section>
          )}
        </>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────────── */
        /* PHÂN HỆ 2: KHÓA HỌC 6 GIAI ĐOẠN & XƯỞNG THỰC HÀNH STUDIO (BÁM SÁT 100% ẢNH 4) */
        /* ──────────────────────────────────────────────────────────────────────────── */
        <section className="space-y-4 animate-in fade-in duration-300">
          {/* Header trạm Studio */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={onBackToRoadmap}
              className="min-h-[48px] px-3.5 py-2.5 rounded-full bg-white/80 backdrop-blur-xs border border-white/60 shadow-xs hover:bg-white active:scale-95 transition-all flex items-center gap-1.5 text-zinc-700 text-xs sm:text-sm font-bold shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-700" />
              <span>Quay lại Bản đồ</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-purple-100/90 backdrop-blur-xs text-purple-800 text-xs font-black">
                Trạm 5 / 6: Thực hành Studio
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/90 backdrop-blur-xs text-amber-900 text-xs font-black shadow-xs">
                <Zap className="w-3.5 h-3.5 text-[#FD7D2E] fill-[#FD7D2E]" />
                <span>+60 XP</span>
              </div>
            </div>
          </div>

          {/* Thanh 6 Giai Đoạn Chuẩn Hệ Thống */}
          <div className="rounded-3xl bg-white/80 backdrop-blur-xs border border-white/60 p-3.5 sm:p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 px-1">
              <span>Hành trình 6 giai đoạn</span>
              <span className="text-purple-700 font-black">Giai đoạn 5 • Đang làm</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 text-[10px] sm:text-[11px] font-bold text-center">
              <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                1. Mục tiêu ✓
              </div>
              <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                2. Xác nhận ✓
              </div>
              <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                3. Video ✓
              </div>
              <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                4. Test ✓
              </div>
              <div className="p-1.5 rounded-xl bg-[#FD7D2E] text-white shadow-xs font-black animate-pulse">
                5. Studio ✨
              </div>
              <div className="p-1.5 rounded-xl bg-zinc-100 text-zinc-400">
                6. Đích (3⭐)
              </div>
            </div>
          </div>

          {/* HÀNG 1 — THANH CHỌN MÓN ĐỒ CUỘN NGANG (DẠNG CHIP DẸT BO TRÒN, 100% KHÔNG BỊ XẾP DỌC CHỮ) */}
          <div className="w-full rounded-2xl bg-white/80 backdrop-blur-xs border border-white/60 p-3 shadow-xs flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                MÓN ĐỒ BÉ VẼ:
              </span>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-0.5 no-scrollbar min-w-0 flex-1 justify-end">
              {DRAW_OBJECTS.map((obj) => {
                const isSelected = selectedObject === obj.id
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => setSelectedObject(obj.id)}
                    className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 shrink-0 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/50'
                        : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
                    }`}
                  >
                    <img
                      src={obj.thumb}
                      alt={obj.name}
                      className="w-6 h-6 rounded-lg object-cover shrink-0"
                    />
                    <span className="font-extrabold">{obj.name}</span>
                    <span
                      className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-purple-700 text-purple-100' : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {obj.turns}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* HÀNG 2 — KHUNG TRANH SÁNG TẠO LỚN (HERO CANVAS TOÀN CHIỀU RỘNG ĐƯỢC MÈO MEE ÔM BẰNG 2 TAY) */}
          <MeeStageFrame variant="paws-holder">
            <div className="w-full rounded-[2.25rem] bg-white/80 backdrop-blur-xs border border-white/60 p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-purple-900">
                    TRANH SÁNG TẠO: Demo Nhanh
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Tranh mèo nét vẽ mực &amp; đất nặn Soft Clay kết hợp theo thời gian thực
                  </p>
                </div>

                {/* 2 Tab chuyển đổi Lượt 1 & Lượt 2 to rõ */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100/90 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setStudioTurn(1)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      studioTurn === 1
                        ? 'bg-white shadow-xs text-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Lượt 1: Sơ khai
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioTurn(2)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      studioTurn === 2
                        ? 'bg-white shadow-xs text-[#FD7D2E]'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Lượt 2: Hoàn thiện ✨
                  </button>
                </div>
              </div>

              {/* Khung Canvas Tranh Mèo Soft Clay Nét Vẽ Mực To Rõ Nét */}
              <div className="relative w-full aspect-16/10 sm:aspect-16/9 max-h-[460px] rounded-2xl overflow-hidden bg-zinc-100 shadow-inner group">
                <img
                  src={
                    studioTurn === 1
                      ? '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron.webp'
                      : '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-dao-buoc__ctx-cat-them-nha.webp'
                  }
                  alt="Tranh mèo Soft Clay"
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />

                {/* Badge Đã lưu vào Balo */}
                <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-emerald-600/95 text-white text-xs font-black shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                  <Backpack className="w-3.5 h-3.5" />
                  <span>Đã lưu vào Balo</span>
                </span>

                {/* Tag Phong cách */}
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-bold backdrop-blur-xs">
                  Phong cách: Mực &amp; Đất Nặn
                </span>
              </div>

              {/* Danh sách 2 lượt vẽ thu nhỏ bên dưới canvas */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div
                  onClick={() => setStudioTurn(1)}
                  className={`p-2.5 rounded-2xl flex items-center gap-3 border cursor-pointer transition-all ${
                    studioTurn === 1
                      ? 'border-purple-500 bg-purple-50/70 shadow-xs'
                      : 'border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <img
                    src="/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron.webp"
                    alt="Lượt 1"
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="text-xs min-w-0">
                    <p className="font-black text-zinc-900 truncate">Lượt 1: Sơ khai</p>
                    <span className="text-[11px] text-zinc-500 truncate block">Mèo béo tròn</span>
                  </div>
                </div>

                <div
                  onClick={() => setStudioTurn(2)}
                  className={`p-2.5 rounded-2xl flex items-center gap-3 border cursor-pointer transition-all ${
                    studioTurn === 2
                      ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                      : 'border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <img
                    src="/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-dao-buoc__ctx-cat-them-nha.webp"
                    alt="Lượt 2"
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="text-xs min-w-0">
                    <p className="font-black text-[#FD7D2E] truncate">Lượt 2: Hoàn thiện</p>
                    <span className="text-[11px] text-zinc-500 truncate block">Đầy đủ 4 khóa</span>
                  </div>
                </div>
              </div>

              {/* Lời nhắn Mèo Mee */}
              <div className="p-3.5 rounded-2xl bg-[#faf5ff] text-xs font-semibold text-purple-900 flex items-center gap-2.5 border border-purple-100">
                <Sparkles className="w-4 h-4 text-[#FD7D2E]" />
                <span>
                  Bé đã phối hợp trọn vẹn 4 Chìa Khóa Vàng để tạo ra bức tranh hoàn chỉnh!
                </span>
              </div>
            </div>
          </MeeStageFrame>

          {/* HÀNG 3 — 4 CHÌA KHÓA VÀNG AIKI (LƯỚI 4 CỘT TRÊN DESKTOP HOẶC 2X2 RỘNG RÃI TRÊN MOBILE) */}
          <div className="w-full rounded-[2.25rem] bg-white/80 backdrop-blur-xs border border-white/60 p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-900">
                  4 CHÌA KHÓA VÀNG AIKI
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FD7D2E] text-[10px] sm:text-xs font-black">
                  Chạm đổi từ ngữ
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
                4 thành phần sáng tạo
              </span>
            </div>

            {/* Lưới 4 cột trên Desktop (lg:grid-cols-4) hoặc 2 cột rộng rãi (grid-cols-1 sm:grid-cols-2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs font-bold">
              {/* Khóa 1: Cái gì? */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                    1. Cái gì?
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-full">
                    Khóa
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white text-zinc-900 shadow-2xs flex items-center justify-between">
                  <span className="font-extrabold text-sm text-zinc-900">Con mèo</span>
                  <span className="text-xs text-zinc-400">🔒</span>
                </div>
                <p className="text-[10px] font-medium text-amber-900/70">Đối tượng chính của tranh</p>
              </div>

              {/* Khóa 2: Trông thế nào? */}
              <div className="p-3.5 rounded-2xl bg-purple-50/90 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-800">
                    2. Trông thế nào?
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-200/70 px-2 py-0.5 rounded-full">
                    Đặc điểm
                  </span>
                </div>
                <div className="space-y-1.5">
                  {KEY_DESCRIPTIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDesc(d.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold transition-all block cursor-pointer break-words ${
                        selectedDesc === d.id
                          ? 'bg-purple-600 text-white shadow-xs font-black ring-1 ring-purple-400'
                          : 'bg-white/90 hover:bg-white text-zinc-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khóa 3: Đang làm gì? */}
              <div className="p-3.5 rounded-2xl bg-blue-50/90 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-800">
                    3. Đang làm gì?
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-200/70 px-2 py-0.5 rounded-full">
                    Hành động
                  </span>
                </div>
                <div className="space-y-1.5">
                  {KEY_ACTIONS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAction(a.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold transition-all block cursor-pointer break-words ${
                        selectedAction === a.id
                          ? 'bg-blue-600 text-white shadow-xs font-black ring-1 ring-blue-400'
                          : 'bg-white/90 hover:bg-white text-zinc-700'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khóa 4: Ở đâu? */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/90 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                    4. Ở đâu?
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                    Bối cảnh
                  </span>
                </div>
                <div className="space-y-1.5">
                  {KEY_CONTEXTS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedContext(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold transition-all block cursor-pointer break-words ${
                        selectedContext === c.id
                          ? 'bg-emerald-600 text-white shadow-xs font-black ring-1 ring-emerald-400'
                          : 'bg-white/90 hover:bg-white text-zinc-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG 4 — HỘP CÂU LỆNH (PROMPT) & NÚT NỘP BÀI (LUÔN XẾP TẦNG DỌC, TRIỆT TIÊU 100% LỖI XẾP CHỮ DỌC) */}
          <div className="rounded-[2.25rem] bg-[#fffdf5] p-5 sm:p-6 shadow-xs flex flex-col gap-3.5 min-w-0">
            {/* Khối Prompt tự nhiên chiếm toàn chiều rộng w-full */}
            <div className="w-full min-w-0 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                HỘP CÂU LỆNH (PROMPT TỰ NHIÊN):
              </span>
              <p className="text-sm sm:text-base font-black text-zinc-900 leading-relaxed break-words">
                &ldquo;Một chú <span className="text-purple-700">con mèo</span>{' '}
                <span className="text-amber-600">{activeDescObj.label.toLowerCase()}</span> đang{' '}
                <span className="text-blue-600">{activeActionObj.label.toLowerCase()}</span> ở{' '}
                <span className="text-emerald-700">{activeContextObj.label.toLowerCase()}</span>.&rdquo;
              </p>
            </div>

            {/* Nút nộp bài toàn chiều rộng w-full ở tầng dưới độc lập */}
            <button
              type="button"
              onClick={handleFinishStation}
              className="w-full min-h-[48px] sm:min-h-[52px] px-8 py-3 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Nộp bài • 1 ảnh</span>
              <span className="text-base">🚀</span>
            </button>
          </div>
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
              className="w-full min-h-[48px] rounded-full bg-[#18181b] text-white text-sm font-bold shadow-md hover:bg-black active:scale-95 transition-all cursor-pointer"
            >
              Con đã hiểu rồi!
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL ĂN MỪNG HOÀN THÀNH TRẠM 3 SAO ── */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-[36px] bg-gradient-to-b from-white via-[#faf7ff] to-[#f4edff] p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center space-y-4">
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
                  onCompleteStation?.(50)
                  onBackToRoadmap?.()
                }}
                className="w-full min-h-[48px] px-6 py-3.5 rounded-full bg-[#18181b] text-white text-sm font-black shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Về Bản Đồ Đảo</span>
                <span className="text-base">🏝️</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCelebrationModal(false)
                  if (activeTrack === 'rules') {
                    setCurrentStep(3)
                  }
                }}
                className="w-full min-h-[44px] px-4 py-2 rounded-full bg-white hover:bg-zinc-50 text-purple-700 text-xs font-bold transition-all cursor-pointer"
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
