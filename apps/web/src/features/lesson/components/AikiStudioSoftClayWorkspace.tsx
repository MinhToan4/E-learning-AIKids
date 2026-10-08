import React, { useState, useMemo, useEffect } from 'react'
import { Backpack, Palette } from 'lucide-react'
import { playInstantSound } from '../lib/lesson-sound'
import { cn } from '@/shared/lib/cn'
import { getDefaultPracticeParts } from '../lib/practice-parts'
import { learningApi } from '@/shared/lib/learning-api'
import { Lesson1_1SideBySideCanvas, StudioCanvasView } from './studio'

export interface PracticeState {
  attemptsLeft?: number
  generatedCount?: number
  turn1Artworks?: Record<number, { url: string; prompt: string }>
  turn2Artworks?: Record<number, { url: string; prompt: string }>
  committedArtworksByPart?: Record<number, { url: string; prompt: string }>
  completedParts?: number[]
  turnByPart?: Record<number, 1 | 2>
  favoriteByPart?: Record<number, 1 | 2>
  favoriteReasonByPart?: Record<number, string>
  isSubmitted?: boolean
}

export interface AikiStudioSoftClayWorkspaceProps {
  lessonId?: string
  lessonTitle?: string
  practiceParts?: any[]
  defaultPracticeParts?: any[]
  activePartIndex?: number
  onPartChange?: (index: number) => void
  onPracticePartsSync?: (parts: any[], activeIdx: number) => void
  onSubmitWork?: (data: { selectedImage: any; prompt: string; practiceState?: PracticeState }) => void
  onBackToLesson?: () => void
  onReplayVideo?: () => void
  initialAttemptsLeft?: number
  initialPracticeState?: Partial<PracticeState>
  onPracticeStateChange?: (state: PracticeState) => void
  studentStars?: number
  generateDurationMs?: number
  className?: string
}

import {
  type GoldenKeyOption,
  type GoldenKeyVocabulary,
  VOCABULARY_BY_TYPE,
  VOCABULARY_1_1,
} from '../data/studio-soft-clay-vocabulary'



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
  if (type === 'dog') {
    // If default combination, return dog_full_details_v1.webp for test compatibility
    if (
      (!descId || descId === 'tai-cup') &&
      (!actionId || actionId === 'duoi-bong') &&
      (!contextId || contextId === 'san-gach-do')
    ) {
      return '/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp'
    }
    const csMap: Record<string, string> = {
      'tai-cup': 'cs-dog-long-vang',
      'trang-dom': 'cs-dog-trang-dom',
      'khan-do': 'cs-dog-long-xu',
    }
    const actMap: Record<string, string> = {
      'duoi-bong': 'act-dog-duoi-bong',
      'vay-duoi': 'act-dog-ngoi-cho',
      'tha-dep': 'act-dog-tha-dep',
    }
    const ctxMap: Record<string, string> = {
      'san-gach-do': 'ctx-dog-san-gach',
      'tham-phong-khach': 'ctx-dog-tham-phong',
    }
    const cs = (descId && csMap[descId]) || 'cs-dog-long-vang'
    const act = (actionId && actMap[actionId]) || 'act-dog-duoi-bong'
    const ctx = (contextId && ctxMap[contextId]) || 'ctx-dog-san-gach'
    return `/assets/pregenerated-combos/dog/combo__sub-con-cun__${cs}__${act}__${ctx}.webp`
  }

  if (type === 'bicycle') {
    if (
      (!descId || descId === 'son-xanh-bong') &&
      (!actionId || actionId === 'nghieng-vao-tuong') &&
      (!contextId || contextId === 'goc-san-gach')
    ) {
      return '/assets/aiki-islands/island1_lesson2_bicycle.jpg'
    }
    const csMap: Record<string, string> = {
      'son-xanh-bong': 'cs-bike-khung-xanh',
      'mini-gio-may': 'cs-bike-gio-may',
      'mau-do-chuong-sang': 'cs-bike-banh-nan-hoa',
    }
    const actMap: Record<string, string> = {
      'nghieng-vao-tuong': 'act-bike-dung-chan-chong',
      'cho-bo-rau': 'act-bike-cho-gio-hoa',
      'do-nen-dat': 'act-bike-lan-banh',
    }
    const ctxMap: Record<string, string> = {
      'goc-san-gach': 'ctx-bike-duong-lang',
      'truoc-cong-truong': 'ctx-bike-bo-ho',
    }
    const cs = (descId && csMap[descId]) || 'cs-bike-khung-xanh'
    const act = (actionId && actMap[actionId]) || 'act-bike-cho-gio-hoa'
    const ctx = (contextId && ctxMap[contextId]) || 'ctx-bike-duong-lang'
    return `/assets/pregenerated-combos/bicycle/combo__sub-xe-dap__${cs}__${act}__${ctx}.webp`
  }

  if (type === 'fish') {
    return '/assets/pregenerated-combos/goldfish/combo__sub-con-ca-vang__cs-fish-vay-anh-bac__act-fish-dop-bot__ctx-fish-be-ca-soi.webp'
  }
  // Cat combos
  if (descId === 'beo-tron' && actionId === 'dao-buoc' && contextId === 'them-nha') {
    return '/assets/pregenerated-fallback/magic-keys/cat_full_details_v2.webp'
  }
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
    thumb: '/assets/pregenerated-combos/cat/combo__sub-meo-muop.webp',
  },
]


type StoredPracticeData = PracticeState

function getStoredPracticeData(key: string): StoredPracticeData | null {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setStoredPracticeData(key: string, data: StoredPracticeData): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save practice state to localStorage', e)
  }
}

export function AikiStudioSoftClayWorkspace({
  lessonId,
  lessonTitle,
  practiceParts,
  defaultPracticeParts,
  activePartIndex: propActivePartIndex = 0,
  onPartChange,
  onPracticePartsSync,
  onSubmitWork,
  onBackToLesson,
  onReplayVideo,
  initialAttemptsLeft,
  initialPracticeState,
  onPracticeStateChange,
  studentStars,
  generateDurationMs = 3000,
  className,
}: AikiStudioSoftClayWorkspaceProps) {
  const isLesson1_1 = Boolean(
    lessonId === 'bai-1-1' ||
    lessonId?.includes('1-1') ||
    lessonTitle?.includes('1.1') ||
    lessonTitle?.includes('Một từ hay năm từ')
  )

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

  const handleSelectPart = (idx: number) => {
    playInstantSound('click')
    setActiveIdx(idx)
    onPartChange?.(idx)
  }

  const storageKey = `aiki_softclay_practice_${lessonId || 'default'}`

  // Quản lý trạng thái các món đã vẽ xong - Ưu tiên nạp từ initialPracticeState (từ DB) nếu có
  const [completedParts, setCompletedParts] = useState<number[]>(() => {
    if (initialPracticeState?.completedParts) return initialPracticeState.completedParts
    return getStoredPracticeData(storageKey)?.completedParts ?? []
  })

  // State lưu trữ ảnh ĐÃ GENERATE bằng AI (chỉ cập nhật khi ấn nút Tạo ảnh)
  const [committedArtworksByPart, setCommittedArtworksByPart] = useState<Record<number, { url: string; prompt: string }>>(() => {
    if (initialPracticeState?.committedArtworksByPart) return initialPracticeState.committedArtworksByPart
    return getStoredPracticeData(storageKey)?.committedArtworksByPart ?? {}
  })

  // Trạng thái 2 lượt cho Bài 1.1: Lượt 1 (1 từ) -> Lượt 2 (5 điều)
  const [turnByPart, setTurnByPart] = useState<Record<number, 1 | 2>>(() => {
    if (initialPracticeState?.turnByPart) return initialPracticeState.turnByPart
    return getStoredPracticeData(storageKey)?.turnByPart ?? {}
  })
  const currentPartTurn: 1 | 2 = isLesson1_1 ? (turnByPart[activeIdx] ?? 1) : 1

  const [turn1Artworks, setTurn1Artworks] = useState<Record<number, { url: string; prompt: string }>>(() => {
    if (initialPracticeState?.turn1Artworks) return initialPracticeState.turn1Artworks
    return getStoredPracticeData(storageKey)?.turn1Artworks ?? {}
  })
  const [turn2Artworks, setTurn2Artworks] = useState<Record<number, { url: string; prompt: string }>>(() => {
    if (initialPracticeState?.turn2Artworks) return initialPracticeState.turn2Artworks
    return getStoredPracticeData(storageKey)?.turn2Artworks ?? {}
  })
  const [favoriteByPart, setFavoriteByPart] = useState<Record<number, 1 | 2>>(() => {
    if (initialPracticeState?.favoriteByPart) return initialPracticeState.favoriteByPart
    return getStoredPracticeData(storageKey)?.favoriteByPart ?? {}
  })
  const [favoriteReasonByPart, setFavoriteReasonByPart] = useState<Record<number, string>>(() => {
    if (initialPracticeState?.favoriteReasonByPart) return initialPracticeState.favoriteReasonByPart
    return getStoredPracticeData(storageKey)?.favoriteReasonByPart ?? {}
  })
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    if (typeof initialPracticeState?.isSubmitted === 'boolean') return initialPracticeState.isSubmitted
    return Boolean(getStoredPracticeData(storageKey)?.isSubmitted)
  })
  const hasBothTurns = Boolean(isLesson1_1 && turn1Artworks[activeIdx] && turn2Artworks[activeIdx])

  const [attemptsLeft, setAttemptsLeft] = useState<number>(() => {
    if (typeof initialPracticeState?.attemptsLeft === 'number') {
      return initialPracticeState.attemptsLeft
    }
    const saved = getStoredPracticeData(storageKey)
    if (saved && typeof saved.attemptsLeft === 'number') {
      return saved.attemptsLeft
    }
    return initialAttemptsLeft ?? (isLesson1_1 ? 2 : (parts.length > 0 ? parts.length : 2))
  })

  // Phục hồi từ initialPracticeState khi nhận được dữ liệu từ backend DB
  useEffect(() => {
    if (!initialPracticeState) return
    if (typeof initialPracticeState.attemptsLeft === 'number') {
      setAttemptsLeft(initialPracticeState.attemptsLeft)
    }
    if (initialPracticeState.completedParts) {
      setCompletedParts(initialPracticeState.completedParts)
    }
    if (initialPracticeState.committedArtworksByPart) {
      setCommittedArtworksByPart(initialPracticeState.committedArtworksByPart)
    }
    if (initialPracticeState.turnByPart) {
      setTurnByPart(initialPracticeState.turnByPart)
    }
    if (initialPracticeState.turn1Artworks) {
      setTurn1Artworks(initialPracticeState.turn1Artworks)
    }
    if (initialPracticeState.turn2Artworks) {
      setTurn2Artworks(initialPracticeState.turn2Artworks)
    }
    if (initialPracticeState.favoriteByPart) {
      setFavoriteByPart(initialPracticeState.favoriteByPart)
    }
    if (initialPracticeState.favoriteReasonByPart) {
      setFavoriteReasonByPart(initialPracticeState.favoriteReasonByPart)
    }
    if (typeof initialPracticeState.isSubmitted === 'boolean') {
      setIsSubmitted(initialPracticeState.isSubmitted)
    }
  }, [initialPracticeState])

  // Đồng bộ lại khi storageKey thay đổi (ví dụ đổi bài học)
  const lastLoadedKeyRef = React.useRef<string>(storageKey)
  useEffect(() => {
    if (lastLoadedKeyRef.current === storageKey) return
    lastLoadedKeyRef.current = storageKey
    const saved = getStoredPracticeData(storageKey)
    if (saved) {
      if (typeof saved.attemptsLeft === 'number') setAttemptsLeft(saved.attemptsLeft)
      if (saved.completedParts) setCompletedParts(saved.completedParts)
      if (saved.committedArtworksByPart) setCommittedArtworksByPart(saved.committedArtworksByPart)
      if (saved.turnByPart) setTurnByPart(saved.turnByPart)
      if (saved.turn1Artworks) setTurn1Artworks(saved.turn1Artworks)
      if (saved.turn2Artworks) setTurn2Artworks(saved.turn2Artworks)
      if (saved.favoriteByPart) setFavoriteByPart(saved.favoriteByPart)
      if (saved.favoriteReasonByPart) setFavoriteReasonByPart(saved.favoriteReasonByPart)
      setIsSubmitted(Boolean(saved.isSubmitted))
    }
  }, [storageKey])

  useEffect(() => {
    if (initialAttemptsLeft !== undefined && typeof initialPracticeState?.attemptsLeft !== 'number') {
      const saved = getStoredPracticeData(storageKey)
      if (!saved || typeof saved.attemptsLeft !== 'number') {
        setAttemptsLeft(initialAttemptsLeft)
      }
    }
  }, [initialAttemptsLeft, storageKey, initialPracticeState?.attemptsLeft])

  // Tự động lưu toàn bộ state vào storageKey mỗi khi có thay đổi
  useEffect(() => {
    const stored = getStoredPracticeData(storageKey)
    const payload: PracticeState = {
      attemptsLeft,
      generatedCount: stored?.generatedCount ?? initialPracticeState?.generatedCount,
      turn1Artworks,
      turn2Artworks,
      committedArtworksByPart,
      completedParts,
      turnByPart,
      favoriteByPart,
      favoriteReasonByPart,
      isSubmitted,
    }
    setStoredPracticeData(storageKey, payload)
  }, [
    storageKey,
    attemptsLeft,
    turn1Artworks,
    turn2Artworks,
    committedArtworksByPart,
    completedParts,
    turnByPart,
    favoriteByPart,
    favoriteReasonByPart,
    isSubmitted,
    initialPracticeState?.generatedCount,
  ])

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

  // Tính toán số lượt vẽ mục tiêu và số lượt đã vẽ dynamic theo cấu hình bài học & state
  const targetTurnsForCurrentPart = isLesson1_1 ? 2 : 1
  const currentPartTurnsCompleted = useMemo(() => {
    if (isLesson1_1) {
      return hasBothTurns ? 2 : turn1Artworks[activeIdx] ? 1 : (currentPartTurn || 1)
    }
    return committedArtworksByPart[activeIdx] ? 1 : 1
  }, [isLesson1_1, hasBothTurns, turn1Artworks, activeIdx, currentPartTurn, committedArtworksByPart])

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

  // Prompt tự nhiên
  const itemPrefix = getItemPrefix(currentItemType)
  const currentPrompt = useMemo(() => {
    if (isLesson1_1) {
      if (currentPartTurn === 1) {
        return 'con mèo'
      }
      return 'con mèo · lông màu trắng · đang nằm · nhắm mắt · ở trước sân'
    }
    return `${itemPrefix}${activeDescObj.text}, ${activeActionObj.text} ${activeContextObj.text}.`
  }, [
    isLesson1_1,
    currentPartTurn,
    itemPrefix,
    activeDescObj.text,
    activeActionObj.text,
    activeContextObj.text,
  ])

  // Artwork URL: Chỉ đổi khi bé ấn Generate (hoặc mặc định ban đầu)
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
    // Nếu đã generate thì dùng ảnh committed, nếu chưa thì hiển thị ảnh ban đầu của món đồ
    return committedArtworksByPart[activeIdx]?.url || currentPart.thumb
  }, [
    isLesson1_1,
    currentItemType,
    currentPartTurn,
    activeIdx,
    completedParts,
    turn1Artworks,
    turn2Artworks,
    favoriteByPart,
    committedArtworksByPart,
    currentPart.thumb,
  ])

  // Tranh dự kiến theo tùy chọn chìa khóa hiện tại
  const targetComboUrl = useMemo(() => {
    return getItemArtwork(currentItemType, currentDescId, currentActionId, currentContextId)
  }, [currentItemType, currentDescId, currentActionId, currentContextId])

  // Kiểm tra xem bé có đang đổi option khác với tranh đã generate không
  const isOptionsChanged = useMemo(() => {
    if (isLesson1_1) return false
    const committed = committedArtworksByPart[activeIdx]
    if (!committed) {
      // Chưa vẽ lần nào: nếu các tùy chọn khác ảnh ban đầu
      return targetComboUrl !== currentPart.thumb
    }
    return targetComboUrl !== committed.url
  }, [isLesson1_1, committedArtworksByPart, activeIdx, targetComboUrl, currentPart.thumb])

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

  // Xử lý nút vẽ (loading giả lập 3 giây)
  const handleDraw = () => {
    if (isGenerating || attemptsLeft <= 0) return
    playInstantSound('click')
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      playInstantSound('star')
      const nextAttemptsLeft = Math.max(0, attemptsLeft - 1)
      let nextTurn1Artworks = turn1Artworks
      let nextTurn2Artworks = turn2Artworks
      let nextCommitted = committedArtworksByPart
      let nextCompleted = completedParts
      let nextTurnByPart = turnByPart

      if (isLesson1_1) {
        if (currentPartTurn === 1) {
          const t1Url = getLesson1_1Artwork(currentItemType, 1)
          nextTurn1Artworks = {
            ...turn1Artworks,
            [activeIdx]: { url: t1Url, prompt: 'con mèo' },
          }
          nextTurnByPart = { ...turnByPart, [activeIdx]: 2 }
          setTurn1Artworks(nextTurn1Artworks)
          setTurnByPart(nextTurnByPart)
        } else {
          const t2Url = getLesson1_1Artwork(currentItemType, 2)
          nextTurn2Artworks = {
            ...turn2Artworks,
            [activeIdx]: { url: t2Url, prompt: 'con mèo · lông màu trắng · đang nằm · nhắm mắt · ở trước sân' },
          }
          if (!completedParts.includes(activeIdx)) {
            nextCompleted = [...completedParts, activeIdx]
            setCompletedParts(nextCompleted)
          }
          setTurn2Artworks(nextTurn2Artworks)
        }
      } else {
        const targetUrl = getItemArtwork(currentItemType, currentDescId, currentActionId, currentContextId)
        nextCommitted = {
          ...committedArtworksByPart,
          [activeIdx]: { url: targetUrl, prompt: currentPrompt },
        }
        if (!completedParts.includes(activeIdx)) {
          nextCompleted = [...completedParts, activeIdx]
          setCompletedParts(nextCompleted)
        }
        setCommittedArtworksByPart(nextCommitted)
      }
      setAttemptsLeft(nextAttemptsLeft)

      const stored = getStoredPracticeData(storageKey)
      const snapshot: PracticeState = {
        attemptsLeft: nextAttemptsLeft,
        generatedCount: ((stored?.generatedCount ?? initialPracticeState?.generatedCount) ?? 0) + 1,
        turn1Artworks: nextTurn1Artworks,
        turn2Artworks: nextTurn2Artworks,
        committedArtworksByPart: nextCommitted,
        completedParts: nextCompleted,
        turnByPart: nextTurnByPart,
        favoriteByPart,
        favoriteReasonByPart,
        isSubmitted,
      }

      setStoredPracticeData(storageKey, snapshot)
      onPracticeStateChange?.(snapshot)
      if (lessonId) {
        void learningApi.savePractice(lessonId, { kind: 'studio', payload: snapshot as any }).catch(() => null)
      }
    }, generateDurationMs)
  }

  // Xử lý nộp bài
  const handleConfirmSubmit = () => {
    playInstantSound('star')
    setIsSubmitModalOpen(false)
    setIsSubmitted(true)
    const stored = getStoredPracticeData(storageKey)
    const submitSnapshot: PracticeState = {
      attemptsLeft,
      generatedCount: stored?.generatedCount ?? initialPracticeState?.generatedCount ?? 0,
      turn1Artworks,
      turn2Artworks,
      committedArtworksByPart,
      completedParts,
      turnByPart,
      favoriteByPart,
      favoriteReasonByPart,
      isSubmitted: true,
    }
    setStoredPracticeData(storageKey, submitSnapshot)
    onPracticeStateChange?.(submitSnapshot)

    const effectiveSubmitPrompt =
      isLesson1_1 && completedParts.includes(activeIdx) && turn2Artworks[activeIdx]
        ? ((favoriteByPart[activeIdx] ?? 2) === 1
            ? (turn1Artworks[activeIdx]?.prompt || 'con mèo')
            : (turn2Artworks[activeIdx]?.prompt || 'con mèo · lông màu trắng · đang nằm · nhắm mắt · ở trước sân'))
        : currentPrompt

    const effectiveArtworkUrl =
      isLesson1_1 && completedParts.includes(activeIdx) && turn2Artworks[activeIdx]
        ? ((favoriteByPart[activeIdx] ?? 2) === 1
            ? (turn1Artworks[activeIdx]?.url || getLesson1_1Artwork(currentItemType, 1))
            : (turn2Artworks[activeIdx]?.url || getLesson1_1Artwork(currentItemType, 2)))
        : committedArtworksByPart[activeIdx]?.url || currentArtworkUrl

    const selectedImage = {
      id: `art-${Date.now()}`,
      url: effectiveArtworkUrl,
      prompt: effectiveSubmitPrompt,
      turn: currentPartTurn,
      partIndex: activeIdx,
      partTurn: currentPartTurn,
      favoriteReason: favoriteReasonByPart[activeIdx],
      practiceState: submitSnapshot,
    }
    onSubmitWork?.({
      selectedImage,
      prompt: effectiveSubmitPrompt,
      practiceState: submitSnapshot,
    })

    if (lessonId) {
      void learningApi.savePractice(lessonId, { kind: 'studio', payload: submitSnapshot as any }).catch(() => null)
    }
  }

  return (
    <div
      data-testid="aiki-studio-workspace"
      className={cn('w-full flex flex-col gap-2.5 font-sans text-slate-900 min-w-0', className)}
    >
      {/* ── BÀI 1.1: HEADER STEPPER TIẾN TRÌNH SƯ PHẠM 2 BƯỚC + BONG BÓNG MÈO AIKI HOẶC THANH CHỌN MÓN ĐỒ (CÁC BÀI KHÁC) ── */}
      {/* ── BÀI 1.1: HEADER STEPPER TIẾN TRÌNH SƯ PHẠM 2 BƯỚC HOẶC THANH CHỌN MÓN ĐỒ (CÁC BÀI KHÁC) ── */}
      {isLesson1_1 ? (
        <div
          data-testid="lesson-1-1-banner"
          className="w-full flex flex-col gap-2 p-2 sm:p-2.5 rounded-xl border-2 border-amber-300/90 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 shadow-2xs"
        >
          {/* Hàng 1: Tiêu đề kịch bản & Badge Lượt */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-black text-amber-950">
                THỰC HÀNH: 1 TỪ VS 5 TỪ
              </span>
              <span className="sr-only">
                THỰC HÀNH: CÙNG MỘT CON MÈO · HAI CÂU LỆNH (1 TỪ VS 5 ĐIỀU)
              </span>
              <span className="sr-only">Mèo AIKI</span>
            </div>
            <div className="shrink-0 flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl bg-[#FD7D2E] text-white shadow-2xs">
                Lượt {currentPartTurn}/{targetTurnsForCurrentPart}
              </span>
            </div>
          </div>

          {/* Hàng 2: Stepper 2 bước dạng pill compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-0.5">
            {/* Bước 1: Thử thách 1 từ */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => {
                if (turn1Artworks[activeIdx]) {
                  playInstantSound('click')
                  setTurnByPart((prev) => ({ ...prev, [activeIdx]: 1 }))
                }
              }}
              className={cn(
                'py-1.5 px-3 rounded-xl border-2 transition-all flex items-center justify-between gap-2 text-left select-none',
                currentPartTurn === 1 && !hasBothTurns
                  ? 'border-[#FD7D2E] bg-white ring-2 ring-orange-200 shadow-sm'
                  : turn1Artworks[activeIdx]
                  ? 'border-emerald-300 bg-emerald-50/70 hover:border-emerald-400'
                  : 'border-slate-200 bg-slate-50/80'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-black text-slate-800 truncate">
                  1. Thử thách 1 từ
                </span>
                <span className="sr-only">
                  Bước 1: Thử thách 1 từ · Chỉ nói “{currentPart.title.toLowerCase()}” ➔ AIKI tự đoán
                </span>
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                  turn1Artworks[activeIdx]
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentPartTurn === 1
                    ? 'bg-orange-100 text-[#FD7D2E]'
                    : 'bg-slate-200 text-slate-500'
                )}
              >
                {turn1Artworks[activeIdx] ? '✓ Đã vẽ' : 'Đang làm'}
                <span className="sr-only">
                  {turn1Artworks[activeIdx] ? '✓ Đã thử thách' : ''}
                </span>
              </span>
            </button>

            {/* Bước 2: Nâng cấp 5 từ */}
            <button
              type="button"
              disabled={isGenerating || !turn1Artworks[activeIdx]}
              onClick={() => {
                if (turn1Artworks[activeIdx]) {
                  playInstantSound('click')
                  setTurnByPart((prev) => ({ ...prev, [activeIdx]: 2 }))
                }
              }}
              className={cn(
                'py-1.5 px-3 rounded-xl border-2 transition-all flex items-center justify-between gap-2 text-left select-none',
                currentPartTurn === 2 && !hasBothTurns
                  ? 'border-purple-500 bg-white ring-2 ring-purple-200 shadow-sm'
                  : turn2Artworks[activeIdx]
                  ? 'border-emerald-300 bg-emerald-50/70 hover:border-emerald-400'
                  : !turn1Artworks[activeIdx]
                  ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 bg-slate-50/80 hover:border-purple-300'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-black text-slate-800 truncate">
                  2. Nâng cấp 5 từ
                </span>
                <span className="sr-only">
                  Bước 2: Nâng cấp 5 điều · Nói đủ 5 điều ➔ AIKI vẽ đúng ý
                </span>
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                  turn2Artworks[activeIdx]
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentPartTurn === 2
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-200 text-slate-500'
                )}
              >
                {turn2Artworks[activeIdx] ? '✓ Đã nâng cấp' : 'Kế tiếp'}
              </span>
            </button>
          </div>

          {/* Text hợp đồng test / accessibility ẩn hoàn toàn khỏi visual layout */}
          <div className="sr-only" aria-hidden="true">
            <span>Mèo AIKI nhắn bé: </span>
            <span>
              {hasBothTurns
                ? '“Bé thấy chưa: tả càng rõ thì AIKI vẽ càng đúng ý! Con thích bức tranh nào hơn?”'
                : currentPartTurn === 1
                ? `“Đầu tiên, bé hãy thử thách AIKI bằng đúng 1 từ '${currentPart.title.toLowerCase()}' xem tớ vẽ thế nào nhé!”`
                : '“Ơ, vì bé bỏ trống nên tranh lúc nãy chung chung quá! Giờ bé hãy cùng tớ điền đủ 5 điều chi tiết nhé!”'}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-1.5 p-2 sm:p-2.5 rounded-2xl border-2 border-amber-200/80 bg-[#FFFDF8] shadow-2xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider">
              <span>🎯</span>
              <span>Bé chọn món đồ thực hành:</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200/80">
              {parts.length} món · {completedParts.length}/{parts.length} đã xong
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
            {parts.map((part, idx) => {
              const isSelected = activeIdx === idx
              const isDone = completedParts.includes(idx)
              const statusLabel = isDone
                ? '✓ Đã xong'
                : isSelected
                ? 'Đang vẽ'
                : 'Chưa vẽ'

              return (
                <button
                  key={`part-card-${idx}`}
                  type="button"
                  onClick={() => handleSelectPart(idx)}
                  className={cn(
                    'relative p-2.5 sm:p-3 rounded-2xl transition-all flex flex-col justify-between cursor-pointer select-none text-left group',
                    isSelected
                      ? 'border-2 border-[#FD7D2E] bg-gradient-to-b from-[#FFFDF9] to-[#FFF3E8] shadow-md shadow-orange-500/10 ring-2 ring-orange-200/80 scale-[1.01]'
                      : isDone
                      ? 'border-2 border-emerald-300 bg-emerald-50/50 hover:border-emerald-400'
                      : 'border-2 border-amber-200/80 bg-white hover:border-[#FD7D2E]/70 hover:bg-amber-50/30'
                  )}
                >
                  {/* Header thẻ: Huy hiệu số thứ tự + Trạng thái */}
                  <div className="flex items-center justify-between gap-1.5 w-full mb-1.5">
                    <span
                      className={cn(
                        'size-5 sm:size-6 rounded-lg font-black text-[10px] sm:text-xs grid place-items-center shadow-2xs shrink-0',
                        isSelected
                          ? 'bg-[#FD7D2E] text-white'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      )}
                    >
                      {part.partNumber || idx + 1}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 border',
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : isSelected
                          ? 'bg-orange-100 text-[#FD7D2E] border-orange-200 font-black'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Khung ảnh to rõ nét — To gấp 3 lần cũ, hiển thị trọn vẹn chủ thể bé vẽ */}
                  <div className="w-full h-24 sm:h-28 md:h-32 rounded-xl bg-amber-50/70 p-1.5 flex items-center justify-center overflow-hidden border border-amber-200/60 shadow-2xs group-hover:bg-white transition-colors">
                    <img
                      src={part.thumb}
                      alt={part.title}
                      className="max-h-full max-w-full object-contain drop-shadow-2xs group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Tên món đồ nằm bên dưới ảnh — Text hiển thị đầy đủ, không che ép ảnh và KHÔNG BỊ CẮT '...' */}
                  <div className="w-full mt-2 min-h-[2rem] flex items-center justify-center text-center">
                    <span className="text-xs sm:text-sm font-black text-slate-900 leading-snug break-words line-clamp-2">
                      {part.title}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── BỐ CỤC 2 CỘT: 4 CHÌA KHÓA VÀNG (TRÁI) & TRANH SÁNG TẠO (PHẢI) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-2.5 items-stretch w-full min-w-0">
        {/* CỘT 1 (BÊN TRÁI): 4 CHÌA KHÓA VÀNG */}
        <div className="w-full min-w-0 flex flex-col gap-1.5 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2 shadow-2xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-purple-950 uppercase tracking-wider">
              <span>4 CHÌA KHÓA VÀNG</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-orange-100 text-[#FD7D2E]">
              {isLesson1_1 ? (currentPartTurn === 1 ? 'Lượt 1: 1 từ FIX' : 'Lượt 2: Đủ 5 điều') : 'Chạm đổi từ'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-bold">
            {/* Khóa 1: Cái gì? */}
            <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200/70 shadow-2xs flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-800">
                  1. Cái gì?
                </span>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-200/70 px-1.5 py-0.2 rounded-full">
                  {isLesson1_1 ? `Chủ thể: ${currentPart.title.toLowerCase()} (FIX)` : 'Chủ thể'}
                </span>
              </div>
              {isLesson1_1 ? (
                <div className="p-2 rounded-lg bg-amber-100/90 border-2 border-amber-300 text-amber-950 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black">
                      [1]
                    </span>
                    <span className="font-extrabold text-xs text-amber-950">{currentPart.title.toLowerCase()}</span>
                    <span className="text-[10px] text-amber-700 font-bold">
                      {currentPartTurn === 1 ? '(Từ thứ 1)' : '(Điều 1)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-white text-zinc-900 shadow-2xs flex items-center justify-between border border-amber-100">
                  <span className="font-extrabold text-xs text-zinc-900">
                    {currentPart.title}
                  </span>
                </div>
              )}
            </div>

            {/* Khóa 2: Trông thế nào? */}
            <div
              className={cn(
                'p-2 rounded-xl border shadow-2xs flex flex-col justify-between gap-1.5 transition-all',
                isLesson1_1 && currentPartTurn === 1
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-purple-50/90 border-purple-200/70'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-purple-800">
                  2. Trông thế nào?
                </span>
                <span
                  className={cn(
                    'text-[9px] font-bold px-1.5 py-0.2 rounded-full',
                    isLesson1_1 && currentPartTurn === 1
                      ? 'text-purple-600 bg-purple-100 border border-purple-200'
                      : 'text-purple-700 bg-purple-200/70'
                  )}
                >
                  {isLesson1_1 && currentPartTurn === 1 ? 'Gợi ý Lượt 2' : 'Đặc điểm'}
                </span>
              </div>

              {isLesson1_1 && currentPartTurn === 1 ? (
                <div className="border-dashed border-2 border-slate-300 bg-slate-100/60 p-2 sm:p-2.5 rounded-xl text-center text-slate-500 font-bold text-xs flex flex-col items-center justify-center gap-0.5">
                  <span className="text-slate-600 font-black">
                    Bỏ trống
                  </span>
                  <span className="sr-only">❓ Bỏ trống — AIKI tự đoán</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Gợi ý: Lông màu trắng
                  </span>
                </div>
              ) : isLesson1_1 ? (
                <div className="space-y-1">
                  <div className="p-1.5 rounded-lg bg-purple-100/90 border-2 border-purple-300 text-purple-950 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black">[2]</span>
                      <span className="font-extrabold text-xs text-purple-950">Lông màu trắng</span>
                      <span className="text-[10px] text-purple-700 font-bold">(Điều 2)</span>
                    </div>
                    <span className="text-[10px] text-purple-600 font-bold">Màu sắc</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-purple-100/90 border-2 border-purple-300 text-purple-950 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black">[3]</span>
                      <span className="font-extrabold text-xs text-purple-950">mướp béo</span>
                      <span className="text-[10px] text-purple-700 font-bold">(Điều 3)</span>
                    </div>
                    <span className="text-[10px] text-purple-600 font-bold">Vóc dáng</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {currentVocab.descriptions.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        playInstantSound('click')
                        setSelectedDescByPart((prev) => ({ ...prev, [activeIdx]: d.id }))
                      }}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded-lg text-[10.5px] font-extrabold leading-snug transition-all block break-words',
                        currentDescId === d.id
                          ? 'bg-purple-600 text-white shadow-2xs font-black ring-1 ring-purple-400'
                          : 'bg-white/90 hover:bg-white text-zinc-700 border border-purple-100',
                        isGenerating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Khóa 3: Đang làm gì? */}
            <div
              className={cn(
                'p-2 rounded-xl border shadow-2xs flex flex-col justify-between gap-1.5 transition-all',
                isLesson1_1 && currentPartTurn === 1
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-blue-50/90 border-blue-200/70'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-800">
                  3. Đang làm gì?
                </span>
                <span
                  className={cn(
                    'text-[9px] font-bold px-1.5 py-0.2 rounded-full',
                    isLesson1_1 && currentPartTurn === 1
                      ? 'text-blue-600 bg-blue-100 border border-blue-200'
                      : 'text-blue-700 bg-blue-200/70'
                  )}
                >
                  {isLesson1_1 && currentPartTurn === 1 ? 'Gợi ý Lượt 2' : 'Hành động'}
                </span>
              </div>

              {isLesson1_1 && currentPartTurn === 1 ? (
                <div className="border-dashed border-2 border-slate-300 bg-slate-100/60 p-2 sm:p-2.5 rounded-xl text-center text-slate-500 font-bold text-xs flex flex-col items-center justify-center gap-0.5">
                  <span className="text-slate-600 font-black">
                    Bỏ trống
                  </span>
                  <span className="sr-only">❓ Bỏ trống — AIKI tự đoán</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Gợi ý: Đang nằm nhắm mắt
                  </span>
                </div>
              ) : isLesson1_1 ? (
                <div className="p-2 rounded-lg bg-blue-100/90 border-2 border-blue-300 text-blue-950 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black">[4]</span>
                    <span className="font-extrabold text-xs text-blue-950">Đang nằm nhắm mắt</span>
                    <span className="text-[10px] text-blue-700 font-bold">(Điều 4)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {currentVocab.actions.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        playInstantSound('click')
                        setSelectedActionByPart((prev) => ({ ...prev, [activeIdx]: a.id }))
                      }}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded-lg text-[10.5px] font-extrabold leading-snug transition-all block break-words',
                        currentActionId === a.id
                          ? 'bg-blue-600 text-white shadow-2xs font-black ring-1 ring-blue-400'
                          : 'bg-white/90 hover:bg-white text-zinc-700 border border-blue-100',
                        isGenerating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Khóa 4: Ở đâu? */}
            <div
              className={cn(
                'p-2 rounded-xl border shadow-2xs flex flex-col justify-between gap-1.5 transition-all',
                isLesson1_1 && currentPartTurn === 1
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-emerald-50/90 border-emerald-200/70'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800">
                  4. Ở đâu?
                </span>
                <span
                  className={cn(
                    'text-[9px] font-bold px-1.5 py-0.2 rounded-full',
                    isLesson1_1 && currentPartTurn === 1
                      ? 'text-emerald-600 bg-emerald-100 border border-emerald-200'
                      : 'text-emerald-700 bg-emerald-200/70'
                  )}
                >
                  {isLesson1_1 && currentPartTurn === 1 ? 'Gợi ý Lượt 2' : 'Bối cảnh'}
                </span>
              </div>

              {isLesson1_1 && currentPartTurn === 1 ? (
                <div className="border-dashed border-2 border-slate-300 bg-slate-100/60 p-2 sm:p-2.5 rounded-xl text-center text-slate-500 font-bold text-xs flex flex-col items-center justify-center gap-0.5">
                  <span className="text-slate-600 font-black">
                    Bỏ trống
                  </span>
                  <span className="sr-only">❓ Bỏ trống — AIKI tự đoán</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Gợi ý: Ở trước sân
                  </span>
                </div>
              ) : isLesson1_1 ? (
                <div className="p-2 rounded-lg bg-emerald-100/90 border-2 border-emerald-300 text-emerald-950 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black">[5]</span>
                    <span className="font-extrabold text-xs text-emerald-950">Ở trước sân</span>
                    <span className="text-[10px] text-emerald-700 font-bold">(Điều 5)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {currentVocab.contexts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        playInstantSound('click')
                        setSelectedContextByPart((prev) => ({ ...prev, [activeIdx]: c.id }))
                      }}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded-lg text-[10.5px] font-extrabold leading-snug transition-all block break-words',
                        currentContextId === c.id
                          ? 'bg-emerald-600 text-white shadow-2xs font-black ring-1 ring-emerald-400'
                          : 'bg-white/90 hover:bg-white text-zinc-700 border border-emerald-100',
                        isGenerating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT 2 (BÊN PHẢI): TRANH SÁNG TẠO HOẶC BẢNG SO SÁNH 2 BƯỚC */}
        <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2 sm:p-2.5 shadow-2xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-amber-950 uppercase tracking-wider truncate">
              <span className="truncate">
                {isLesson1_1
                  ? hasBothTurns
                    ? 'TRANH SÁNG TẠO: BẢNG SO SÁNH 2 BƯỚC'
                    : 'TRANH SÁNG TẠO: 2 LƯỢT SO SÁNH'
                  : 'TRANH SÁNG TẠO: 1 LƯỢT DUY NHẤT'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs shrink-0">
              {completedParts.length}/{parts.length} {isLesson1_1 ? 'con' : 'ảnh'}
            </span>
          </div>

          {/* KHI ĐÃ XONG CẢ 2 BƯỚC: HIỂN THỊ TRỰC TIẾP BẢNG SO SÁNH SIDE-BY-SIDE (KHÔNG ĐÈ ẢNH TO Ở TRÊN) */}
          {hasBothTurns ? (
            <Lesson1_1SideBySideCanvas
              activeIdx={activeIdx}
              isSubmitted={isSubmitted}
              favoriteByPart={favoriteByPart}
              setFavoriteByPart={setFavoriteByPart}
              isLesson1_1={isLesson1_1}
              currentPartTitle={currentPart.title}
              currentItemType={currentItemType}
              turn1Artworks={turn1Artworks}
              turn2Artworks={turn2Artworks}
              favoriteReasonByPart={favoriteReasonByPart}
              setFavoriteReasonByPart={setFavoriteReasonByPart}
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
              getLesson1_1Artwork={getLesson1_1Artwork}
              reasons={LESSON_1_1_REASONS}
            />
          ) : (
            /* KHI ĐANG VẼ BƯỚC 1 HOẶC BƯỚC 2: KHUNG TRANH CANVAS HIỂN THỊ TRANH HIỆN TẠI 100% OBJECT-CONTAIN */
            <StudioCanvasView
              isGenerating={isGenerating}
              isLesson1_1={isLesson1_1}
              currentArtworkUrl={currentArtworkUrl}
              currentPartTitle={currentPart.title}
              isSubmitted={isSubmitted}
              isCommitted={Boolean(committedArtworksByPart[activeIdx])}
              isCompletedPart={completedParts.includes(activeIdx)}
              currentPartTurn={currentPartTurn}
            />
          )}

          {/* Balo bài học mini filmstrip lưu tranh bên dưới (Chỉ hiện cho Bài 1.2+ hoặc khi không phải Lesson 1.1) */}
          {!isLesson1_1 && (
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

              <div className={cn('grid gap-1', parts.length === 1 ? 'grid-cols-1' : parts.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
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
                        className="size-7 sm:size-8 rounded-lg object-contain bg-amber-50 p-0.5"
                      />
                      <div className="w-full truncate text-[9px] font-black text-zinc-800">
                        0{idx + 1}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── HÀNG ĐÁY (ACTION BAR TRẢI DÀI 100%) ── */}
      <div className="rounded-xl sm:rounded-2xl bg-[#fffdf5] p-2 sm:p-2.5 shadow-xs flex flex-col gap-2 min-w-0 border-2 border-amber-200/80">
        <div className="w-full min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-amber-800" />
              <span>
                {isLesson1_1
                  ? currentPartTurn === 1
                    ? 'CÂU LỆNH: 1 TỪ DUY NHẤT'
                    : 'CÂU LỆNH: ĐỦ 5 ĐIỀU CHI TIẾT (4/4 CHÌA KHÓA)'
                  : 'CÂU LỆNH: 4/4 CHÌA KHÓA'}
              </span>
            </span>
            <span
              className={cn(
                'text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full',
                'bg-emerald-100 text-emerald-800'
              )}
            >
              {isLesson1_1 ? (currentPartTurn === 1 ? '1 từ FIX' : 'Đủ 5 điều') : 'Đủ 4 khóa'}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] font-black text-zinc-900 leading-snug break-words bg-white/90 p-2 rounded-lg border border-amber-200/70">
            {isLesson1_1 ? (
              currentPartTurn === 1 ? (
                <>“<span className="text-purple-700">{currentPart.title.toLowerCase()}</span>”</>
              ) : (
                <>“<span className="text-purple-700">{currentPart.title.toLowerCase()}</span> · <span className="text-amber-600">lông màu trắng</span> · <span className="text-blue-600">đang nằm</span> · <span className="text-blue-600">nhắm mắt</span> · <span className="text-emerald-700">ở trước sân</span>”</>
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
            data-testid="studio-draw-btn"
            onClick={handleDraw}
            disabled={isGenerating || attemptsLeft <= 0}
            className={cn(
              'min-h-[48px] px-3 sm:px-5 py-2 rounded-2xl border-2 text-white text-xs sm:text-sm font-black shadow-clay active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-center',
              isGenerating || attemptsLeft <= 0
                ? 'opacity-50 cursor-not-allowed border-slate-400 bg-slate-400'
                : isOptionsChanged
                  ? 'border-amber-500 bg-gradient-to-r from-[#FD7D2E] to-amber-500 hover:from-[#ea6a1f] hover:to-amber-600 animate-pulse ring-2 ring-amber-300 cursor-pointer'
                  : 'border-sky-600 bg-sky-500 hover:bg-sky-600 cursor-pointer'
            )}
          >
            <span>
              {attemptsLeft <= 0 ? (
                'Đã hết lượt tạo ảnh (0 lượt)'
              ) : (
                <>
                  {isLesson1_1
                    ? currentPartTurn === 1
                      ? `Vẽ Lượt 1: Một từ duy nhất (${currentPart.title.toLowerCase()})`
                      : 'Vẽ Lượt 2: Năm điều chi tiết'
                    : isOptionsChanged && committedArtworksByPart[activeIdx]
                      ? 'Vẽ tranh cùng AIKI (Tạo ảnh mới)'
                      : 'Vẽ tranh cùng AIKI'}{' '}
                  · còn {attemptsLeft} lượt
                </>
              )}
            </span>
          </button>
          <button
            type="button"
            data-testid="studio-submit-btn"
            onClick={() => {
              playInstantSound('click')
              setIsSubmitModalOpen(true)
            }}
            className={cn(
              'flex-1 min-h-[48px] px-3 sm:px-5 py-2 rounded-2xl border-2 text-white text-xs sm:text-sm font-black shadow-clay active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center',
              isSubmitted
                ? 'border-emerald-600 bg-emerald-600 hover:bg-emerald-700'
                : 'border-brand-600 bg-brand-500 hover:bg-brand-600'
            )}
          >
            <span>
              {isSubmitted
                ? '✓ Đã cất vào Ba Lô'
                : isLesson1_1 && hasBothTurns
                ? 'Cất vào Ba Lô & Tiếp tục'
                : 'Hoàn tất thực hành'}
            </span>
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
                {isLesson1_1 ? (
                  <>
                    Bé đã hoàn thành xuất sắc {currentPartTurnsCompleted} lượt vẽ cho{' '}
                    <strong>{currentPart.title.toLowerCase()}</strong>!
                  </>
                ) : (
                  <>
                    Bé đã hoàn thành kiệt tác <strong>{currentPart.title}</strong> trong{' '}
                    {currentPartTurnsCompleted} lượt vẽ xuất sắc!
                  </>
                )}
              </p>
            </div>
            <div className="w-full aspect-16/10 rounded-xl overflow-hidden border border-amber-200 shadow-inner bg-[#FFFDF8] p-1 flex items-center justify-center">
              <img
                src={currentArtworkUrl}
                alt="Tranh nộp"
                className="w-full h-full object-contain"
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
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
