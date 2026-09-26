import React, { useState, useMemo, useEffect } from 'react'
import { Backpack, Sparkles } from 'lucide-react'
import { playInstantSound } from '../lib/lesson-sound'
import { cn } from '@/shared/lib/cn'
import { getDefaultPracticeParts } from '../lib/practice-parts'

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
      { id: 'khan-do', label: 'Đeo khăn đỏ ở cổ', text: 'đeo khăn đỏ ở cổ' },
    ],
    actions: [
      { id: 'duoi-bong', label: 'Đang chạy đuổi quả bóng', text: 'đang chạy đuổi quả bóng' },
      { id: 'vay-duoi', label: 'Đang ngồi vẫy đuôi chờ', text: 'đang ngồi vẫy đuôi chờ' },
      { id: 'tha-dep', label: 'Đang tha một chiếc dép', text: 'đang tha một chiếc dép' },
    ],
    contexts: [
      { id: 'san-gach-do', label: 'Ở góc sân gạch đỏ', text: 'ở góc sân gạch đỏ' },
      { id: 'tham-phong-khach', label: 'Trên thảm phòng khách', text: 'trên thảm phòng khách' },
    ],
  },
  bicycle: {
    descriptions: [
      { id: 'son-xanh-bong', label: 'Cũ sơn xanh bong từng mảng', text: 'cũ sơn xanh bong từng mảng' },
      { id: 'mini-gio-may', label: 'Xe mini có giỏ mây trước', text: 'xe mini có giỏ mây trước' },
      { id: 'mau-do-chuong-sang', label: 'Màu đỏ còn mới chuông sáng', text: 'màu đỏ còn mới chuông sáng' },
    ],
    actions: [
      { id: 'nghieng-vao-tuong', label: 'Đang dựa nghiêng vào tường', text: 'đang dựa nghiêng vào tường' },
      { id: 'cho-bo-rau', label: 'Giỏ trước đang chở bó rau', text: 'giỏ trước đang chở bó rau' },
      { id: 'do-nen-dat', label: 'Đang đổ nằm trên nền đất', text: 'đang đổ nằm trên nền đất' },
    ],
    contexts: [
      { id: 'goc-san-gach', label: 'Ở góc sân gạch', text: 'ở góc sân gạch' },
      { id: 'truoc-cong-truong', label: 'Trước cổng trường', text: 'trước cổng trường' },
    ],
  },
}

// SSOT Từ vựng chính xác cho Bài 1.1: Một từ hay năm từ
const VOCABULARY_1_1: Record<string, GoldenKeyVocabulary> = {
  cat: {
    descriptions: [
      { id: 'beo-tron', label: 'Mướp vằn nâu béo tròn', text: 'mướp vằn nâu béo tròn' },
      { id: 'long-xu-dai', label: 'Trắng lông xù dài', text: 'trắng lông xù dài' },
      { id: 'tam-the', label: 'Tam thể ba màu', text: 'tam thể ba màu' },
    ],
    actions: [
      { id: 'ngu-cuon-tron', label: 'Đang ngủ cuộn tròn', text: 'đang ngủ cuộn tròn' },
      { id: 'vuon-vai', label: 'Đang vươn vai duỗi chân', text: 'đang vươn vai duỗi chân' },
      { id: 'rinh-buom', label: 'Đang rình con bướm', text: 'đang rình con bướm' },
    ],
    contexts: [
      { id: 'ghe-may', label: 'Trên ghế mây cạnh cửa sổ', text: 'trên ghế mây cạnh cửa sổ' },
      { id: 'bac-them', label: 'Trên bậc thềm nắng sớm', text: 'trên bậc thềm nắng sớm' },
      { id: 'thung-giay', label: 'Trong thùng giấy các-tông', text: 'trong thùng giấy các-tông' },
    ],
  },
  fish: {
    descriptions: [
      { id: 'duoi-voan', label: 'Đuôi voan dài mềm', text: 'đuôi voan dài mềm' },
      { id: 'than-tron', label: 'Thân tròn mắt lồi', text: 'thân tròn mắt lồi' },
      { id: 'vay-anh-bac', label: 'Vảy ánh bạc lấp lánh', text: 'vảy ánh bạc lấp lánh' },
    ],
    actions: [
      { id: 'dop-bot', label: 'Đang ngoi lên đớp bọt', text: 'đang ngoi lên đớp bọt' },
      { id: 'nap-da', label: 'Đang nấp sau hòn đá', text: 'đang nấp sau hòn đá' },
      { id: 'ria-rong', label: 'Đang rỉa nhánh rong xanh', text: 'đang rỉa nhánh rong xanh' },
    ],
    contexts: [
      { id: 'binh-thuy-tinh', label: 'Trong bình thuỷ tinh tròn', text: 'trong bình thuỷ tinh tròn' },
      { id: 'be-soi-trang', label: 'Trong bể cá rải sỏi trắng', text: 'trong bể cá rải sỏi trắng' },
      { id: 'chum-sanh', label: 'Trong chum sành ngoài sân', text: 'trong chum sành ngoài sân' },
    ],
  },
  dog: {
    descriptions: [
      { id: 'tai-cup', label: 'Lông vàng hai tai cụp', text: 'lông vàng hai tai cụp' },
      { id: 'trang-dom', label: 'Trắng đốm nâu quanh mắt', text: 'trắng đốm nâu quanh mắt' },
      { id: 'long-xu', label: 'Lông xù rối bù', text: 'lông xù rối bù' },
    ],
    actions: [
      { id: 'duoi-bong', label: 'Đang chạy đuổi quả bóng', text: 'đang chạy đuổi quả bóng' },
      { id: 'vay-duoi', label: 'Đang ngồi vẫy đuôi chờ', text: 'đang ngồi vẫy đuôi chờ' },
      { id: 'tha-dep', label: 'Đang tha một chiếc dép', text: 'đang tha một chiếc dép' },
    ],
    contexts: [
      { id: 'san-gach-do', label: 'Ở góc sân gạch đỏ', text: 'ở góc sân gạch đỏ' },
      { id: 'cay-bang', label: 'Dưới gốc cây bàng', text: 'dưới gốc cây bàng' },
      { id: 'tham-phong-khach', label: 'Trên thảm phòng khách', text: 'trên thảm phòng khách' },
    ],
  },
}

const LESSON_1_1_REASONS = [
  'Vì nó giống con vật trong đầu tớ',
  'Vì nhìn rõ hơn',
  'Vì có chỗ ở đẹp',
  'Vì nó đang làm việc gì đó',
]

function getLesson1_1Artwork(type: string, turn: number): string {
  if (turn === 1) {
    if (type === 'cat') return '/assets/pregenerated-fallback/magic-keys/cat_one_word_v1.webp'
    if (type === 'fish') return '/assets/pregenerated-fallback/magic-keys/goldfish_one_word_v1.webp'
    if (type === 'dog') return '/assets/pregenerated-fallback/magic-keys/dog_one_word_v1.webp'
  }
  if (type === 'cat') return '/assets/pregenerated-fallback/magic-keys/cat_full_details_v1.webp'
  if (type === 'fish') return '/assets/pregenerated-fallback/magic-keys/goldfish_full_details_v1.webp'
  if (type === 'dog') return '/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp'
  return '/assets/pregenerated-fallback/magic-keys/cat_full_details_v1.webp'
}

function getItemType(title: string): string {
  const t = (title || '').toLowerCase()
  if (t.includes('xe') || t.includes('đạp') || t.includes('bicycle') || t.includes('bike')) return 'bicycle'
  if (t.includes('cún') || t.includes('chó') || t.includes('dog')) return 'dog'
  if (t.includes('cá') || t.includes('fish')) return 'fish'
  if (t.includes('mèo') || t.includes('cat')) return 'cat'
  return 'dog'
}

function getItemPrefix(type: string): string {
  if (type === 'dog') return 'Một con cún '
  if (type === 'bicycle') return 'Một cái xe đạp '
  if (type === 'cat') return 'Một con mèo '
  if (type === 'fish') return 'Một con cá vàng '
  return 'Một '
}

function getItemArtwork(type: string, descId?: string, actionId?: string, contextId?: string): string {
  if (type === 'bicycle') {
    return '/assets/aiki-islands/island1_lesson2_bicycle.jpg'
  }
  if (type === 'dog') {
    return '/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp'
  }
  if (type === 'fish') {
    return '/assets/pregenerated-combos/goldfish/combo__sub-con-ca-vang__cs-fish-vay-anh-bac__act-fish-dop-bot__ctx-fish-be-ca-soi.webp'
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
    title: 'Con cún',
    icon: '🐶',
    thumb: '/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp',
  },
  {
    partNumber: 2,
    title: 'Cái xe đạp',
    icon: '🚲',
    thumb: '/assets/aiki-islands/island1_lesson2_bicycle.jpg',
  },
]

const DEFAULT_PARTS_MAPPING_1_1 = [
  {
    partNumber: 1,
    title: 'Con mèo',
    icon: '🐱',
    thumb: '/assets/aiki-keys/key_subject_cat.jpg',
  },
  {
    partNumber: 2,
    title: 'Con cá vàng',
    icon: '🐠',
    thumb: '/assets/pregenerated-fallback/magic-keys/goldfish_full_details_v1.webp',
  },
  {
    partNumber: 3,
    title: 'Con cún',
    icon: '🐶',
    thumb: '/assets/pregenerated-fallback/magic-keys/dog_one_word_v1.webp',
  },
]


export function AikiStudioSoftClayWorkspace({
  lessonId,
  practiceParts,
  defaultPracticeParts,
  activePartIndex: propActivePartIndex = 0,
  onPartChange,
  onPracticePartsSync,
  onSubmitWork,
  initialAttemptsLeft,
  className,
}: AikiStudioSoftClayWorkspaceProps) {
  const isLesson1_1 = Boolean(lessonId === 'bai-1-1' || lessonId?.includes('1-1'))

  // Chuẩn hóa danh sách món đồ
  const parts = useMemo(() => {
    const defaultParts = isLesson1_1 ? DEFAULT_PARTS_MAPPING_1_1 : DEFAULT_PARTS_MAPPING
    const raw = (practiceParts && practiceParts.length > 0)
      ? practiceParts
      : (defaultPracticeParts && defaultPracticeParts.length > 0)
      ? defaultPracticeParts
      : lessonId
      ? getDefaultPracticeParts(lessonId)
      : defaultParts

    return raw.map((p, idx) => {
      const fallback = defaultParts[idx] || defaultParts[0] || {
        partNumber: idx + 1,
        title: p.title || `Món ${idx + 1}`,
        icon: p.icon || p.emoji || '🎨',
        thumb: p.thumb || p.iconImage || '/assets/aiki-islands/island1_lesson2_bicycle.jpg',
      }
      return {
        partNumber: p.partNumber || idx + 1,
        title: p.title || fallback.title,
        icon: p.icon || p.emoji || fallback.icon,
        thumb: p.thumb || p.iconImage || fallback.thumb,
      }
    })
  }, [practiceParts, defaultPracticeParts, lessonId, isLesson1_1])

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

  // Quản lý trạng thái các món đã vẽ xong
  const [completedParts, setCompletedParts] = useState<number[]>([])

  // Trạng thái 2 lượt cho Bài 1.1: Lượt 1 (1 từ) -> Lượt 2 (5 điều)
  const [turnByPart, setTurnByPart] = useState<Record<number, 1 | 2>>({})
  const currentPartTurn: 1 | 2 = isLesson1_1 ? (turnByPart[activeIdx] ?? 1) : 1

  const [turn1Artworks, setTurn1Artworks] = useState<Record<number, { url: string; prompt: string }>>({})
  const [turn2Artworks, setTurn2Artworks] = useState<Record<number, { url: string; prompt: string }>>({})
  const [favoriteByPart, setFavoriteByPart] = useState<Record<number, 1 | 2>>({})
  const [favoriteReasonByPart, setFavoriteReasonByPart] = useState<Record<number, string>>({})

  const [attemptsLeft, setAttemptsLeft] = useState<number>(
    initialAttemptsLeft ?? (isLesson1_1 ? 6 : (parts.length > 0 ? parts.length : 2))
  )

  useEffect(() => {
    if (initialAttemptsLeft !== undefined) {
      setAttemptsLeft(initialAttemptsLeft)
    }
  }, [initialAttemptsLeft])

  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false)

  // 4 Chìa Khóa Vàng per part
  const [selectedDescByPart, setSelectedDescByPart] = useState<Record<number, string>>({})
  const [selectedActionByPart, setSelectedActionByPart] = useState<Record<number, string>>({})
  const [selectedContextByPart, setSelectedContextByPart] = useState<Record<number, string>>({})

  const currentPart = parts[activeIdx] || parts[0]
  const currentItemType = getItemType(currentPart.title)
  const vocabMap = isLesson1_1 ? VOCABULARY_1_1 : VOCABULARY_BY_TYPE
  const currentVocab = vocabMap[currentItemType] || vocabMap.dog || VOCABULARY_BY_TYPE.dog

  const currentDescId = useMemo(() => {
    const saved = selectedDescByPart[activeIdx]
    if (saved && currentVocab.descriptions.some((d) => d.id === saved)) {
      return saved
    }
    return currentVocab.descriptions[0]?.id || ''
  }, [selectedDescByPart, activeIdx, currentVocab])

  const currentActionId = useMemo(() => {
    const saved = selectedActionByPart[activeIdx]
    if (saved && currentVocab.actions.some((a) => a.id === saved)) {
      return saved
    }
    return currentVocab.actions[0]?.id || ''
  }, [selectedActionByPart, activeIdx, currentVocab])

  const currentContextId = useMemo(() => {
    const saved = selectedContextByPart[activeIdx]
    if (saved && currentVocab.contexts.some((c) => c.id === saved)) {
      return saved
    }
    return currentVocab.contexts[0]?.id || ''
  }, [selectedContextByPart, activeIdx, currentVocab])

  const activeDescObj = currentVocab.descriptions.find((d) => d.id === currentDescId) || currentVocab.descriptions[0]
  const activeActionObj = currentVocab.actions.find((a) => a.id === currentActionId) || currentVocab.actions[0]
  const activeContextObj = currentVocab.contexts.find((c) => c.id === currentContextId) || currentVocab.contexts[0]

  // Prompt tự nhiên: Nếu bài 1.1 lượt 1 thì đúng 1 từ, lượt 2 đủ 5 chi tiết
  const itemPrefix = getItemPrefix(currentItemType)
  const currentPrompt = useMemo(() => {
    if (isLesson1_1) {
      if (currentPartTurn === 1) {
        return currentPart.title
      }
      return `${currentPart.title} ${activeDescObj.text}, ${activeActionObj.text} ${activeContextObj.text}.`
    }
    return `${itemPrefix}${activeDescObj.text}, ${activeActionObj.text} ${activeContextObj.text}.`
  }, [
    isLesson1_1,
    currentPartTurn,
    currentPart.title,
    itemPrefix,
    activeDescObj.text,
    activeActionObj.text,
    activeContextObj.text,
  ])

  // Artwork URL
  const currentArtworkUrl = useMemo(() => {
    if (isLesson1_1) {
      if (completedParts.includes(activeIdx) && turn2Artworks[activeIdx]) {
        const fav = favoriteByPart[activeIdx] ?? 2
        return fav === 1
          ? (turn1Artworks[activeIdx]?.url || getLesson1_1Artwork(currentItemType, 1))
          : (turn2Artworks[activeIdx]?.url || getLesson1_1Artwork(currentItemType, 2))
      }
      return getLesson1_1Artwork(currentItemType, currentPartTurn)
    }
    return getItemArtwork(currentItemType, currentDescId, currentActionId, currentContextId)
  }, [
    isLesson1_1,
    currentItemType,
    currentPartTurn,
    activeIdx,
    completedParts,
    turn1Artworks,
    turn2Artworks,
    favoriteByPart,
    currentDescId,
    currentActionId,
    currentContextId,
  ])

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
      if (isLesson1_1) {
        if (currentPartTurn === 1) {
          const t1Url = getLesson1_1Artwork(currentItemType, 1)
          setTurn1Artworks((prev) => ({
            ...prev,
            [activeIdx]: { url: t1Url, prompt: currentPart.title },
          }))
          setTurnByPart((prev) => ({ ...prev, [activeIdx]: 2 }))
        } else {
          const t2Url = getLesson1_1Artwork(currentItemType, 2)
          setTurn2Artworks((prev) => ({
            ...prev,
            [activeIdx]: { url: t2Url, prompt: currentPrompt },
          }))
          if (!completedParts.includes(activeIdx)) {
            setCompletedParts((prev) => [...prev, activeIdx])
          }
        }
      } else {
        if (!completedParts.includes(activeIdx)) {
          setCompletedParts((prev) => [...prev, activeIdx])
        }
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
      turn: currentPartTurn,
      partIndex: activeIdx,
      partTurn: currentPartTurn,
      favoriteReason: favoriteReasonByPart[activeIdx],
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
              const statusLabel = isDone
                ? 'Xong ✓'
                : isLesson1_1 && turnByPart[idx] === 2
                ? 'Lượt 2'
                : isSelected
                ? isLesson1_1
                  ? 'Lượt 1'
                  : 'Đang làm'
                : 'Chờ'

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
                      {isLesson1_1 ? '2 lượt' : '1 lượt'}
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
              {isLesson1_1 ? (currentPartTurn === 1 ? 'Lượt 1: Chỉ 1 từ' : 'Lượt 2: Đủ 5 điều') : 'Chạm đổi từ'}
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
            <div className="relative overflow-hidden p-2 rounded-xl bg-purple-50/90 border border-purple-200/70 shadow-2xs flex flex-col justify-between gap-1">
              {isLesson1_1 && currentPartTurn === 1 && (
                <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-1.5 text-center z-10 border border-slate-200">
                  <span className="text-xs">🔒</span>
                  <span className="text-[10px] font-black text-slate-700">Khóa ở Lượt 1</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold">AIKI sẽ tự điền</span>
                </div>
              )}
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
                    disabled={isLesson1_1 && currentPartTurn === 1}
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
            <div className="relative overflow-hidden p-2 rounded-xl bg-blue-50/90 border border-blue-200/70 shadow-2xs flex flex-col justify-between gap-1">
              {isLesson1_1 && currentPartTurn === 1 && (
                <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-1.5 text-center z-10 border border-slate-200">
                  <span className="text-xs">🔒</span>
                  <span className="text-[10px] font-black text-slate-700">Khóa ở Lượt 1</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold">AIKI sẽ tự điền</span>
                </div>
              )}
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
                    disabled={isLesson1_1 && currentPartTurn === 1}
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
            <div className="relative overflow-hidden p-2 rounded-xl bg-emerald-50/90 border border-emerald-200/70 shadow-2xs flex flex-col justify-between gap-1">
              {isLesson1_1 && currentPartTurn === 1 && (
                <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-1.5 text-center z-10 border border-slate-200">
                  <span className="text-xs">🔒</span>
                  <span className="text-[10px] font-black text-slate-700">Khóa ở Lượt 1</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold">AIKI sẽ tự điền</span>
                </div>
              )}
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
                    disabled={isLesson1_1 && currentPartTurn === 1}
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

        {/* CỘT 3 (BÊN PHẢI): TRANH SÁNG TẠO 1 LƯỢT DUY NHẤT HOẶC 2 LƯỢT SO SÁNH */}
        <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2 sm:p-2.5 shadow-2xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-amber-950 uppercase tracking-wider truncate">
              <span>🖼️</span>
              <span className="truncate">
                {isLesson1_1 ? 'TRANH SÁNG TẠO: 2 LƯỢT SO SÁNH' : 'TRANH SÁNG TẠO: 1 LƯỢT DUY NHẤT'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs shrink-0">
              {completedParts.length}/{parts.length} {isLesson1_1 ? 'con' : 'ảnh'}
            </span>
          </div>

          {/* Khung Canvas Tranh Soft Clay */}
          <div className="relative w-full aspect-16/10 max-h-[185px] sm:max-h-[200px] rounded-xl overflow-hidden bg-zinc-100 shadow-inner group border border-amber-200">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50/90 gap-1.5 z-20">
                <div className="size-8 animate-spin rounded-full border-3 border-[#FD7D2E] border-t-transparent" />
                <span className="text-xs font-black text-[#FD7D2E] animate-pulse">
                  {isLesson1_1 ? `AIKI đang vẽ Lượt ${currentPartTurn}... ✨` : 'AIKI đang vẽ trong 1 lượt... ✨'}
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

          {/* Thông tin lượt vẽ */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FD7D2E] shrink-0" />
              <span className="font-extrabold text-[11px] sm:text-xs text-purple-950">
                {isLesson1_1
                  ? currentPartTurn === 1
                    ? 'LƯỢT 1: MỘT TỪ DUY NHẤT'
                    : 'LƯỢT 2: NĂM ĐIỀU CHI TIẾT'
                  : '1 LƯỢT DUY NHẤT'}
              </span>
            </div>
            <span className="text-[10px] font-black text-[#FD7D2E] bg-orange-100/80 border border-orange-200/80 px-2 py-0.5 rounded-lg">
              {isLesson1_1 ? (currentPartTurn === 1 ? 'AI tự điền' : 'Đủ 4 khóa') : 'Đầy đủ 4 khóa'}
            </span>
          </div>

          {/* So sánh 2 bức tranh của Bài 1.1 */}
          {isLesson1_1 && turn1Artworks[activeIdx] && turn2Artworks[activeIdx] && (
            <div className="p-2 rounded-xl bg-amber-50/95 border border-amber-300 shadow-2xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1">
                  <span>⚖️</span>
                  <span>So sánh 2 bức tranh của bé</span>
                </span>
                <span className="text-[8.5px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                  Chạm chọn bức thích hơn
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playInstantSound('click')
                    setFavoriteByPart((prev) => ({ ...prev, [activeIdx]: 1 }))
                  }}
                  className={cn(
                    'p-1.5 rounded-xl border-2 flex flex-col gap-1 text-left transition-all cursor-pointer select-none',
                    (favoriteByPart[activeIdx] ?? 2) === 1
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <span className="text-[9px] font-black text-purple-900 truncate">
                    1. Một từ ({currentPart.title})
                  </span>
                  <img
                    src={turn1Artworks[activeIdx].url}
                    alt="Tranh 1 từ"
                    className="w-full aspect-16/10 object-cover rounded-lg border border-slate-200"
                  />
                  <span className="text-[8.5px] text-slate-500 truncate">AKI tự đoán bừa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playInstantSound('click')
                    setFavoriteByPart((prev) => ({ ...prev, [activeIdx]: 2 }))
                  }}
                  className={cn(
                    'p-1.5 rounded-xl border-2 flex flex-col gap-1 text-left transition-all cursor-pointer select-none',
                    (favoriteByPart[activeIdx] ?? 2) === 2
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <span className="text-[9px] font-black text-emerald-900 flex items-center justify-between">
                    <span>2. Năm điều</span>
                    <span className="text-[7.5px] bg-emerald-200 text-emerald-950 px-1 rounded font-black">Khuyên chọn</span>
                  </span>
                  <img
                    src={turn2Artworks[activeIdx].url}
                    alt="Tranh 5 điều"
                    className="w-full aspect-16/10 object-cover rounded-lg border border-slate-200"
                  />
                  <span className="text-[8.5px] text-emerald-700 truncate font-semibold">Đủ 5 chi tiết</span>
                </button>
              </div>

              <div className="flex flex-col gap-1 pt-1 border-t border-amber-200">
                <span className="text-[9.5px] font-black text-amber-950">
                  Vì sao con thích bức này hơn?
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {LESSON_1_1_REASONS.map((reason) => {
                    const isChosen = (favoriteReasonByPart[activeIdx] || LESSON_1_1_REASONS[0]) === reason
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => {
                          playInstantSound('click')
                          setFavoriteReasonByPart((prev) => ({ ...prev, [activeIdx]: reason }))
                        }}
                        className={cn(
                          'px-1.5 py-1 rounded-lg text-[9px] font-bold text-left transition-all cursor-pointer truncate',
                          isChosen
                            ? 'bg-amber-500 text-white font-black shadow-2xs'
                            : 'bg-white hover:bg-amber-100/60 text-slate-700 border border-amber-200/80'
                        )}
                      >
                        {reason}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

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

            <div className={cn('grid gap-1', parts.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
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
              <span>
                {isLesson1_1
                  ? currentPartTurn === 1
                    ? 'CÂU LỆNH: 1 TỪ DUY NHẤT (AIKI TỰ ĐOÁN)'
                    : 'CÂU LỆNH: ĐỦ 5 ĐIỀU CHI TIẾT (4/4 CHÌA KHÓA)'
                  : 'CÂU LỆNH: 4/4 CHÌA KHÓA'}
              </span>
            </span>
            <span
              className={cn(
                'text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full',
                isLesson1_1 && currentPartTurn === 1
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              )}
            >
              {isLesson1_1 ? (currentPartTurn === 1 ? '1 từ' : 'Đủ 5 điều') : 'Đủ 4 khóa'}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] font-black text-zinc-900 leading-snug break-words bg-white/90 p-2 rounded-lg border border-amber-200/70">
            {isLesson1_1 ? (
              currentPartTurn === 1 ? (
                <>
                  &ldquo;<span className="text-purple-700">{currentPart.title}</span>&rdquo;
                </>
              ) : (
                <>
                  &ldquo;<span className="text-purple-700">{currentPart.title}</span>{' '}
                  <span className="text-amber-600">{activeDescObj.text}</span>,{' '}
                  <span className="text-blue-600">{activeActionObj.text}</span>{' '}
                  <span className="text-emerald-700">{activeContextObj.text}</span>.&rdquo;
                </>
              )
            ) : (
              <>
                &ldquo;<span className="text-purple-700">{itemPrefix.trim()}</span>{' '}
                <span className="text-amber-600">{activeDescObj.text}</span>,{' '}
                <span className="text-blue-600">{activeActionObj.text}</span>{' '}
                <span className="text-emerald-700">{activeContextObj.text}</span>.&rdquo;
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5 w-full">
          <button
            type="button"
            onClick={handleDraw}
            disabled={isGenerating}
            className="min-h-[48px] px-3 sm:px-5 py-2 rounded-2xl border-2 border-sky-600 bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-black shadow-clay active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>
              {isLesson1_1
                ? currentPartTurn === 1
                  ? `Vẽ Lượt 1 (1 từ: ${currentPart.title})`
                  : 'Vẽ Lượt 2 (5 điều chi tiết)'
                : 'Vẽ tranh cùng AIKI'}{' '}
              · còn {attemptsLeft} lượt
            </span>
          </button>
          <button
            type="button"
            data-testid="studio-submit-btn"
            onClick={() => {
              playInstantSound('click')
              setIsSubmitModalOpen(true)
            }}
            className="flex-1 min-h-[48px] px-3 sm:px-5 py-2 rounded-2xl border-2 border-brand-600 bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-black shadow-clay active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span>Hoàn tất thực hành</span>
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
