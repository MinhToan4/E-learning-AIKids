import React, { useState, useMemo, useEffect } from 'react'
import { Backpack, Sparkles } from 'lucide-react'
import { playInstantSound } from '../lib/lesson-sound'
import { cn } from '@/shared/lib/cn'

export interface AikiStudioSoftClayWorkspaceProps {
  lessonId?: string
  lessonTitle?: string
  practiceParts?: any[]
  defaultPracticeParts?: any[]
  activePartIndex?: number
  onPartChange?: (index: number) => void
  onPracticePartsSync?: (parts: any[], activeIdx: number) => void
  onSubmitWork?: (data: { selectedImage: any; prompt: string }) => void
  onBackToLesson?: () => void
  onReplayVideo?: () => void
  initialAttemptsLeft?: number
  studentStars?: number
  className?: string
}

interface GoldenKeyOption {
  id: string
  label: string
  text: string
}

interface GoldenKeyVocabulary {
  descriptions: GoldenKeyOption[]
  actions: GoldenKeyOption[]
  contexts: GoldenKeyOption[]
}

const VOCABULARY_BY_TYPE: Record<string, GoldenKeyVocabulary> = {
  cat: {
    descriptions: [
      { id: 'beo-tron', label: 'Mèo mướp vàng béo tròn', text: 'mèo mướp vàng béo tròn' },
      { id: 'chuong-vang', label: 'Đeo chuông vàng cổ', text: 'đeo chuông vàng ở cổ' },
      { id: 'long-van', label: 'Lông vằn vàng óng', text: 'lông vằn vàng óng' },
    ],
    actions: [
      { id: 'dao-buoc', label: 'Đang nằm ngủ cuộn tròn', text: 'đang nằm ngủ cuộn tròn' },
      { id: 'liem-chan', label: 'Liếm chân sạch sẽ', text: 'liếm chân sạch sẽ' },
      { id: 'vuon-vai', label: 'Vươn vai lười biếng', text: 'vươn vai lười biếng' },
    ],
    contexts: [
      { id: 'them-nha', label: 'Trên chiếc ghế mây cạnh cửa sổ', text: 'trên chiếc ghế mây cạnh cửa sổ' },
      { id: 'hien-nha', label: 'Hiên nhà ngập hoa', text: 'ở hiên nhà ngập hoa' },
      { id: 'tham-co', label: 'Bãi cỏ xanh mướt', text: 'trên bãi cỏ xanh mướt' },
    ],
  },
  fish: {
    descriptions: [
      { id: 'vay-anh-bac', label: 'Vảy ánh bạc lấp lánh', text: 'vảy ánh bạc lấp lánh' },
      { id: 'duoi-lua', label: 'Đuôi xòe như tơ lụa', text: 'đuôi xòe như tơ lụa' },
      { id: 'bung-tron', label: 'Bụng tròn màu cam đào', text: 'bụng tròn màu cam đào' },
    ],
    actions: [
      { id: 'dop-bot', label: 'Đang đớp bọt nước', text: 'đang đớp bọt nước' },
      { id: 'luon-vong', label: 'Lượn vòng quanh rong biển', text: 'lượn vòng quanh rong biển' },
      { id: 'boi-lung-lo', label: 'Bơi lững lờ dưới nắng', text: 'bơi lững lờ dưới nắng' },
    ],
    contexts: [
      { id: 'be-soi', label: 'Trong bể cá nhỏ rải sỏi', text: 'trong bể cá nhỏ rải sỏi' },
      { id: 'ho-sen', label: 'Giữa hồ sen thơm ngát', text: 'giữa hồ sen thơm ngát' },
      { id: 'thuy-sinh', label: 'Cạnh cây thủy sinh xanh biếc', text: 'cạnh cây thủy sinh xanh biếc' },
    ],
  },
  dog: {
    descriptions: [
      { id: 'tai-cup', label: 'Lông vàng hai tai cụp', text: 'lông vàng hai tai cụp' },
      { id: 'trang-dom', label: 'Trắng đốm nâu quanh mắt', text: 'trắng đốm nâu quanh mắt' },
      { id: 'long-xu', label: 'Lông xù rối bù', text: 'lông xù rối bù' },
    ],
    actions: [
      { id: 'duoi-bong', label: 'Chạy đuổi quả bóng', text: 'chạy đuổi quả bóng' },
      { id: 'vay-duoi', label: 'Ngồi vẫy đuôi chờ', text: 'ngồi vẫy đuôi chờ' },
      { id: 'tha-dep', label: 'Tha một chiếc dép', text: 'tha một chiếc dép' },
    ],
    contexts: [
      { id: 'san-gach', label: 'Ở góc sân gạch đỏ', text: 'ở góc sân gạch đỏ' },
      { id: 'cay-bang', label: 'Dưới gốc cây bàng', text: 'dưới gốc cây bàng' },
      { id: 'tham-phong', label: 'Trên thảm phòng khách', text: 'trên thảm phòng khách' },
    ],
  },
}

function getItemType(title: string): string {
  const t = (title || '').toLowerCase()
  if (t.includes('mèo') || t.includes('cat')) return 'cat'
  if (t.includes('cá') || t.includes('fish')) return 'fish'
  if (t.includes('cún') || t.includes('chó') || t.includes('dog')) return 'dog'
  return 'cat'
}

function getItemArtwork(type: string, descId?: string, actionId?: string, contextId?: string): string {
  if (type === 'fish') {
    return '/assets/pregenerated-combos/goldfish/combo__sub-con-ca-vang__cs-fish-vay-anh-bac__act-fish-dop-bot__ctx-fish-be-ca-soi.webp'
  }
  if (type === 'dog') {
    return '/assets/pregenerated-fallback/style-prism/dog_clay_v1.webp'
  }
  // Cat combos
  if (descId === 'beo-tron' && actionId === 'dao-buoc' && contextId === 'hien-nha') {
    return '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-dao-buoc__ctx-cat-hien-nha.webp'
  }
  if (descId === 'beo-tron' && actionId === 'dao-buoc' && contextId === 'tham-co') {
    return '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-dao-buoc__ctx-cat-tham-co.webp'
  }
  if (descId === 'beo-tron' && actionId === 'liem-chan' && contextId === 'hien-nha') {
    return '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-liem-chan__ctx-cat-hien-nha.webp'
  }
  if (descId === 'beo-tron' && actionId === 'vuon-vai' && contextId === 'them-nha') {
    return '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-vuon-vai__ctx-cat-them-nha.webp'
  }
  return '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-dao-buoc__ctx-cat-them-nha.webp'
}

const DEFAULT_PARTS_MAPPING = [
  {
    partNumber: 1,
    title: 'Con mèo',
    icon: '🐱',
    thumb: '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron.webp',
  },
  {
    partNumber: 2,
    title: 'Con cá vàng',
    icon: '🐠',
    thumb: '/assets/pregenerated-combos/goldfish/combo__sub-con-ca-vang__cs-fish-vay-anh-bac__act-fish-dop-bot__ctx-fish-be-ca-soi.webp',
  },
  {
    partNumber: 3,
    title: 'Con cún',
    icon: '🐶',
    thumb: '/assets/pregenerated-fallback/style-prism/dog_clay_v1.webp',
  },
]

export function AikiStudioSoftClayWorkspace({
  practiceParts,
  defaultPracticeParts,
  activePartIndex: propActivePartIndex = 0,
  onPartChange,
  onPracticePartsSync,
  onSubmitWork,
  initialAttemptsLeft = 4,
  className,
}: AikiStudioSoftClayWorkspaceProps) {
  // Chuẩn hóa danh sách món đồ
  const parts = useMemo(() => {
    const raw = (practiceParts && practiceParts.length > 0)
      ? practiceParts
      : (defaultPracticeParts && defaultPracticeParts.length > 0)
      ? defaultPracticeParts
      : DEFAULT_PARTS_MAPPING

    return raw.map((p, idx) => {
      const fallback = DEFAULT_PARTS_MAPPING[idx] || DEFAULT_PARTS_MAPPING[0]
      return {
        partNumber: p.partNumber || idx + 1,
        title: p.title || fallback.title,
        icon: p.icon || p.emoji || fallback.icon,
        thumb: p.thumb || p.iconImage || fallback.thumb,
      }
    })
  }, [practiceParts, defaultPracticeParts])

  const [activeIdx, setActiveIdx] = useState<number>(propActivePartIndex || 0)

  useEffect(() => {
    if (propActivePartIndex !== undefined && propActivePartIndex !== activeIdx) {
      setActiveIdx(propActivePartIndex)
    }
  }, [propActivePartIndex])

  const [mobileTab, setMobileTab] = useState<'keys' | 'parts'>('keys')

  const handleSelectPart = (idx: number) => {
    playInstantSound('click')
    setActiveIdx(idx)
    onPartChange?.(idx)
    setMobileTab('keys')
  }

  // Quản lý trạng thái các món đã vẽ xong (1 lượt duy nhất)
  const [completedParts, setCompletedParts] = useState<number[]>([0])
  const [attemptsLeft, setAttemptsLeft] = useState<number>(initialAttemptsLeft)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false)

  // 4 Chìa Khóa Vàng per part
  const [selectedDescByPart, setSelectedDescByPart] = useState<Record<number, string>>({
    0: 'beo-tron',
    1: 'vay-anh-bac',
    2: 'tai-cup',
  })
  const [selectedActionByPart, setSelectedActionByPart] = useState<Record<number, string>>({
    0: 'dao-buoc',
    1: 'dop-bot',
    2: 'duoi-bong',
  })
  const [selectedContextByPart, setSelectedContextByPart] = useState<Record<number, string>>({
    0: 'them-nha',
    1: 'be-soi',
    2: 'san-gach',
  })

  const currentPart = parts[activeIdx] || parts[0]
  const currentItemType = getItemType(currentPart.title)
  const currentVocab = VOCABULARY_BY_TYPE[currentItemType] || VOCABULARY_BY_TYPE.cat

  const currentDescId = selectedDescByPart[activeIdx] || currentVocab.descriptions[0].id
  const currentActionId = selectedActionByPart[activeIdx] || currentVocab.actions[0].id
  const currentContextId = selectedContextByPart[activeIdx] || currentVocab.contexts[0].id

  const activeDescObj = currentVocab.descriptions.find((d) => d.id === currentDescId) || currentVocab.descriptions[0]
  const activeActionObj = currentVocab.actions.find((a) => a.id === currentActionId) || currentVocab.actions[0]
  const activeContextObj = currentVocab.contexts.find((c) => c.id === currentContextId) || currentVocab.contexts[0]

  // Prompt tự nhiên
  const currentPrompt = `Một chú ${currentPart.title.toLowerCase()} ${activeDescObj.text}, ${activeActionObj.text} ${activeContextObj.text}.`

  // Artwork URL
  const currentArtworkUrl = useMemo(() => {
    return getItemArtwork(currentItemType, currentDescId, currentActionId, currentContextId)
  }, [currentItemType, currentDescId, currentActionId, currentContextId])

  // Đồng bộ practicePartsSync (dùng ref để tránh lặp vô tận)
  const lastSyncKeyRef = React.useRef<string>('')
  useEffect(() => {
    if (!onPracticePartsSync) return
    const syncKey = `${activeIdx}-${completedParts.join(',')}-${parts.length}`
    if (lastSyncKeyRef.current === syncKey) return
    lastSyncKeyRef.current = syncKey

    const partsState = parts.map((p, idx) => ({
      id: `part-${idx}`,
      partNumber: idx + 1,
      title: p.title,
      icon: p.icon,
      isCompleted: completedParts.includes(idx),
    }))
    onPracticePartsSync(partsState, activeIdx)
  }, [parts, completedParts, activeIdx, onPracticePartsSync])

  // Xử lý nút vẽ
  const handleDraw = () => {
    playInstantSound('click')
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      playInstantSound('star')
      if (!completedParts.includes(activeIdx)) {
        setCompletedParts((prev) => [...prev, activeIdx])
      }
      setAttemptsLeft((prev) => Math.max(0, prev - 1))
    }, 400)
  }

  // Xử lý nộp bài
  const handleConfirmSubmit = () => {
    playInstantSound('star')
    setIsSubmitModalOpen(false)
    const selectedImage = {
      id: `art-${Date.now()}`,
      url: currentArtworkUrl,
      prompt: currentPrompt,
      turn: 1,
      partIndex: activeIdx,
      partTurn: 1,
    }
    onSubmitWork?.({
      selectedImage,
      prompt: currentPrompt,
    })
  }

  return (
    <div
      data-testid="aiki-studio-workspace"
      className={cn('w-full flex flex-col gap-2.5 font-sans text-slate-900 min-w-0', className)}
    >
      {/* ── MOBILE SEGMENTED SWITCHER (< 1024px) ── */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/90 gap-1 w-full shrink-0 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            playInstantSound('click')
            setMobileTab('keys')
          }}
          className={cn(
            'flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            mobileTab === 'keys'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <span>🔑</span>
          <span>4 Chìa Khóa Vàng</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playInstantSound('click')
            setMobileTab('parts')
          }}
          className={cn(
            'flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            mobileTab === 'parts'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <span>🎯</span>
          <span>Chọn Món Đồ ({parts.length})</span>
        </button>
      </div>

      {/* ── BỐ CỤC 3 CỘT: MÓN ĐỒ - 4 CHÌA KHÓA 2X2 - TRANH SÁNG TẠO 1 LƯỢT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[165px_minmax(0,1.2fr)_minmax(0,1fr)] gap-2.5 items-stretch w-full min-w-0">
        {/* CỘT 1 (BÊN TRÁI): MÓN ĐỒ BÉ VẼ */}
        <div
          className={cn(
            'w-full min-w-0 flex-col gap-1.5 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2 shadow-2xs',
            mobileTab === 'parts' ? 'flex' : 'hidden lg:flex'
          )}
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-950 uppercase tracking-wider">
              <span>🎯</span>
              <span>Món đồ:</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
              {parts.length} món
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {parts.map((part, idx) => {
              const isSelected = activeIdx === idx
              const isDone = completedParts.includes(idx)
              const statusLabel = isDone ? 'Xong ✓' : isSelected ? 'Đang làm' : 'Chờ'

              return (
                <button
                  key={`part-${idx}`}
                  type="button"
                  onClick={() => handleSelectPart(idx)}
                  className={cn(
                    'w-full p-1.5 sm:p-2 rounded-xl border-2 transition-all flex flex-col gap-1 cursor-pointer text-left select-none shadow-2xs',
                    isSelected
                      ? 'bg-amber-50/95 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                      : isDone
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-50'
                      : 'bg-white border-slate-200/90 text-slate-500 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span
                      className={cn(
                        'text-[9px] font-black uppercase tracking-tight px-1.5 py-0.2 rounded-full truncate',
                        isSelected
                          ? 'bg-amber-400 text-amber-950'
                          : isDone
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      0{idx + 1} · {statusLabel}
                    </span>
                    {isDone && <span className="text-emerald-600 text-xs font-black">✓</span>}
                  </div>

                  <div className="flex items-center gap-1.5 w-full min-w-0">
                    <img
                      src={part.thumb}
                      alt={part.title}
                      className="size-6 sm:size-7 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                    <div className="font-black text-xs text-slate-900 truncate flex-1 min-w-0">
                      {part.title}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded shrink-0">
                      1 lượt
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* CỘT 2 (Ở GIỮA): 4 CHÌA KHÓA VÀNG AIKI */}
        <div
          className={cn(
            'w-full min-w-0 flex-col gap-1.5 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2 shadow-2xs',
            mobileTab === 'keys' ? 'flex' : 'hidden lg:flex'
          )}
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-purple-950 uppercase tracking-wider">
              <span>🔑</span>
              <span>4 CHÌA KHÓA VÀNG AIKI</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-orange-100 text-[#FD7D2E]">
              Chạm đổi từ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-bold">
            {/* Khóa 1: Cái gì? */}
            <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200/70 shadow-2xs flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-800">
                  1. Cái gì?
                </span>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-200/70 px-1.5 py-0.2 rounded-full">
                  Khóa
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-white text-zinc-900 shadow-2xs flex items-center justify-between border border-amber-100">
                <span className="font-extrabold text-xs text-zinc-900">{currentPart.title}</span>
                <span className="text-xs text-zinc-400">🔒</span>
              </div>
            </div>

            {/* Khóa 2: Trông thế nào? */}
            <div className="p-2 rounded-xl bg-purple-50/90 border border-purple-200/70 shadow-2xs flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-purple-800">
                  2. Trông thế nào?
                </span>
                <span className="text-[9px] font-bold text-purple-700 bg-purple-200/70 px-1.5 py-0.2 rounded-full">
                  Đặc điểm
                </span>
              </div>
              <div className="space-y-1">
                {currentVocab.descriptions.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      playInstantSound('click')
                      setSelectedDescByPart((prev) => ({ ...prev, [activeIdx]: d.id }))
                    }}
                    className={cn(
                      'w-full text-left px-2 py-1 rounded-lg text-[10.5px] font-extrabold leading-snug transition-all block cursor-pointer break-words',
                      currentDescId === d.id
                        ? 'bg-purple-600 text-white shadow-2xs font-black ring-1 ring-purple-400'
                        : 'bg-white/90 hover:bg-white text-zinc-700 border border-purple-100'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Khóa 3: Đang làm gì? */}
            <div className="p-2 rounded-xl bg-blue-50/90 border border-blue-200/70 shadow-2xs flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-800">
                  3. Đang làm gì?
                </span>
                <span className="text-[9px] font-bold text-blue-700 bg-blue-200/70 px-1.5 py-0.2 rounded-full">
                  Hành động
                </span>
              </div>
              <div className="space-y-1">
                {currentVocab.actions.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      playInstantSound('click')
                      setSelectedActionByPart((prev) => ({ ...prev, [activeIdx]: a.id }))
                    }}
                    className={cn(
                      'w-full text-left px-2 py-1 rounded-lg text-[10.5px] font-extrabold leading-snug transition-all block cursor-pointer break-words',
                      currentActionId === a.id
                        ? 'bg-blue-600 text-white shadow-2xs font-black ring-1 ring-blue-400'
                        : 'bg-white/90 hover:bg-white text-zinc-700 border border-blue-100'
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Khóa 4: Ở đâu? */}
            <div className="p-2 rounded-xl bg-emerald-50/90 border border-emerald-200/70 shadow-2xs flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800">
                  4. Ở đâu?
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-200/70 px-1.5 py-0.2 rounded-full">
                  Bối cảnh
                </span>
              </div>
              <div className="space-y-1">
                {currentVocab.contexts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      playInstantSound('click')
                      setSelectedContextByPart((prev) => ({ ...prev, [activeIdx]: c.id }))
                    }}
                    className={cn(
                      'w-full text-left px-2 py-1 rounded-lg text-[10.5px] font-extrabold leading-snug transition-all block cursor-pointer break-words',
                      currentContextId === c.id
                        ? 'bg-emerald-600 text-white shadow-2xs font-black ring-1 ring-emerald-400'
                        : 'bg-white/90 hover:bg-white text-zinc-700 border border-emerald-100'
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 3 (BÊN PHẢI): TRANH SÁNG TẠO 1 LƯỢT DUY NHẤT */}
        <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2 sm:p-2.5 shadow-2xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-amber-950 uppercase tracking-wider truncate">
              <span>🖼️</span>
              <span className="truncate">TRANH SÁNG TẠO: 1 LƯỢT DUY NHẤT</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs shrink-0">
              {completedParts.length}/{parts.length} ảnh
            </span>
          </div>

          {/* Khung Canvas Tranh Soft Clay */}
          <div className="relative w-full aspect-16/10 max-h-[185px] sm:max-h-[200px] rounded-xl overflow-hidden bg-zinc-100 shadow-inner group border border-amber-200">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50/90 gap-1.5 z-20">
                <div className="size-8 animate-spin rounded-full border-3 border-[#FD7D2E] border-t-transparent" />
                <span className="text-xs font-black text-[#FD7D2E] animate-pulse">
                  AIKI đang vẽ trong 1 lượt... ✨
                </span>
              </div>
            ) : null}

            <img
              src={currentArtworkUrl}
              alt={currentPart.title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            />

            {/* Badge Đã lưu vào Balo */}
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600/95 text-white text-[10px] font-black shadow-md flex items-center gap-1 backdrop-blur-xs">
              <Backpack className="w-3 h-3" />
              <span>Đã lưu vào Balo</span>
            </span>

            {/* Tag Phong cách */}
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[9px] font-bold backdrop-blur-xs">
              Phong cách: Mực &amp; Đất Nặn
            </span>
          </div>

          {/* Thông tin 1 LƯỢT DUY NHẤT & Đầy đủ 4 khóa */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FD7D2E] shrink-0" />
              <span className="font-extrabold text-[11px] sm:text-xs text-purple-950">1 LƯỢT DUY NHẤT</span>
            </div>
            <span className="text-[10px] font-black text-[#FD7D2E] bg-orange-100/80 border border-orange-200/80 px-2 py-0.5 rounded-lg">
              Đầy đủ 4 khóa
            </span>
          </div>

          {/* Balo bài học mini filmstrip lưu tranh bên dưới */}
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-950 flex items-center gap-1">
                <Backpack className="w-3 h-3 text-amber-700" />
                <span>Balo bài học:</span>
              </span>
              <span className="text-[9px] text-zinc-500 font-bold">
                {parts.length} tranh lưu trữ
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {parts.map((part, idx) => {
                const isCurrent = activeIdx === idx
                return (
                  <button
                    key={`filmstrip-${idx}`}
                    type="button"
                    onClick={() => handleSelectPart(idx)}
                    className={cn(
                      'p-1 rounded-xl border flex flex-col items-center gap-0.5 text-center cursor-pointer transition-all select-none',
                      isCurrent
                        ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    )}
                  >
                    <img
                      src={part.thumb}
                      alt={part.title}
                      className="size-7 sm:size-8 rounded-lg object-cover"
                    />
                    <div className="w-full truncate text-[9px] font-black text-zinc-800">
                      0{idx + 1}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── HÀNG ĐÁY (ACTION BAR TRẢI DÀI 100%) ── */}
      <div className="rounded-xl sm:rounded-2xl bg-[#fffdf5] p-2 sm:p-2.5 shadow-xs flex flex-col gap-2 min-w-0 border-2 border-amber-200/80">
        <div className="w-full min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
              <span>✨</span>
              <span>CÂU LỆNH: 4/4 CHÌA KHÓA</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              Đủ 4 khóa
            </span>
          </div>
          <p className="text-xs sm:text-[13px] font-black text-zinc-900 leading-snug break-words bg-white/90 p-2 rounded-lg border border-amber-200/70">
            &ldquo;Một chú <span className="text-purple-700">{currentPart.title.toLowerCase()}</span>{' '}
            <span className="text-amber-600">{activeDescObj.text}</span>,{' '}
            <span className="text-blue-600">{activeActionObj.text}</span>{' '}
            <span className="text-emerald-700">{activeContextObj.text}</span>.&rdquo;
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5 w-full">
          <button
            type="button"
            onClick={handleDraw}
            disabled={isGenerating}
            className="min-h-[38px] sm:min-h-[40px] px-3 sm:px-5 py-1.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>Vẽ tranh cùng AIKI · còn {attemptsLeft} lượt</span>
          </button>
          <button
            type="button"
            data-testid="studio-submit-btn"
            onClick={() => {
              playInstantSound('click')
              setIsSubmitModalOpen(true)
            }}
            className="flex-1 min-h-[38px] sm:min-h-[40px] px-3 sm:px-5 py-1.5 rounded-xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs sm:text-sm font-black shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>Nộp bài • 1 ảnh</span>
            <span className="text-sm sm:text-base">🚀</span>
          </button>
        </div>
      </div>

      {/* ── MODAL XÁC NHẬN NỘP BÀI ── */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl border-2 border-amber-300 shadow-2xl p-5 flex flex-col items-center text-center gap-3 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shadow-xs">
              🎒
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900">
                Nộp Tranh Vào Balo Nghệ Thuật?
              </h3>
              <p className="text-xs text-zinc-600 font-semibold mt-1">
                Bé đã hoàn thành kiệt tác <strong>{currentPart.title}</strong> trong 1 lượt vẽ xuất sắc!
              </p>
            </div>
            <div className="w-full aspect-16/10 rounded-xl overflow-hidden border border-amber-200 shadow-inner">
              <img
                src={currentArtworkUrl}
                alt="Tranh nộp"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 w-full pt-1">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
              >
                Ngắm thêm chút
              </button>
              <button
                type="button"
                data-testid="studio-confirm-submit"
                onClick={handleConfirmSubmit}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs font-black shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Nộp ngay!</span>
                <span>🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
