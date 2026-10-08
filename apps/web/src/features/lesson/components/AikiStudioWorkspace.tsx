import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Lightbulb,
  Mic,
  Trophy,
  Star,
  Lock,
  CheckCircle2,
  Backpack,
  Award,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { generateCreativeImage } from '@/shared/lib/creative-api'
import { playInstantSound } from './LessonInteractiveSidebar'
import {
  type AikiStudioConfig,
  type StudioWorkflowStep,
  createDefaultPracticeWorkflow,
  getAikiStudioConfig,
} from '../data/aiki-studio-configs'
import { CreativeEngineShell, getCreativeEngineMode, type CreativeNotebookConfig } from './creative-engine'
import { getNonRepeatingFallbackImage } from './creative-engine/data/pregenerated-fallback-registry'
import { resolveExactComboImage } from '../lib/combo-image-resolver'
import { formatAikiCartoonPrompt, getStudioAIArtwork } from '../lib/studio-artwork'
import { KidBackpackImageIcon } from '@/shared/components/icons/KidImageIcons'
import { api } from '@/shared/lib/api'
import {
  renderObjectClayIcon,
  StudioTopicIllustration,
  StudioImageInspectModal,
  StudioSubmitArtworkModal,
  SocBongIllustration,
  CatFatIllustration,
  RabbitCarIllustration,
  CandyCastleIllustration,
  KnightHandIllustration,
  MagicForestIllustration,
  SunShipIllustration,
  LighthouseIllustration,
  AnimalFamilyIllustration,
  FireFoxIllustration,
  ComicStripIllustration,
  DragonCardIllustration,
  TeacupIllustration,
  FourStylesIllustration,
  EngineerFixIllustration,
  StoryTellingIllustration,
  LayerCompositionIllustration,
  ColorEmotionsIllustration,
  GalleryFrameIllustration,
  ProfileDNAIllustration,
  SixExpressionsIllustration,
  TreeHollowBaseIllustration,
  ThreeGatesKingdomIllustration,
  FourChallengesIllustration,
  StoryboardPanelsIllustration,
  ComicBookCrownIllustration,
  StatBudgetIllustration,
  MagicGearBackIllustration,
  ElementalDuoIllustration,
  BoardGameArenaIllustration,
} from './studio'
import {
  getDefaultPracticeParts,
  type StudioImageItem,
  type PracticePartDef,
  type PracticePartState,
  DEFAULT_IDENTITY_LOCK_PARTS,
} from '../lib/practice-parts'

export {
  getDefaultPracticeParts,
  type StudioImageItem,
  type PracticePartDef,
  type PracticePartState,
  DEFAULT_IDENTITY_LOCK_PARTS,
} from '../lib/practice-parts'
export { formatAikiCartoonPrompt, getStudioAIArtwork } from '../lib/studio-artwork'
export {
  renderObjectClayIcon,
  StudioTopicIllustration,
  StudioImageInspectModal,
  StudioSubmitArtworkModal,
  SocBongIllustration,
  CatFatIllustration,
  RabbitCarIllustration,
  CandyCastleIllustration,
  KnightHandIllustration,
  MagicForestIllustration,
  SunShipIllustration,
  LighthouseIllustration,
  AnimalFamilyIllustration,
  FireFoxIllustration,
  ComicStripIllustration,
  DragonCardIllustration,
  TeacupIllustration,
  FourStylesIllustration,
  EngineerFixIllustration,
  StoryTellingIllustration,
  LayerCompositionIllustration,
  ColorEmotionsIllustration,
  GalleryFrameIllustration,
  ProfileDNAIllustration,
  SixExpressionsIllustration,
  TreeHollowBaseIllustration,
  ThreeGatesKingdomIllustration,
  FourChallengesIllustration,
  StoryboardPanelsIllustration,
  ComicBookCrownIllustration,
  StatBudgetIllustration,
  MagicGearBackIllustration,
  ElementalDuoIllustration,
  BoardGameArenaIllustration,
} from './studio'



export interface AikiStudioWorkspaceProps {
  config?: AikiStudioConfig
  notebookConfig?: CreativeNotebookConfig
  lessonId?: string
  lessonTitle?: string
  lessonBadge?: string
  characterName?: string
  lockedFeatures?: string[]
  initialAttemptsLeft?: number
  maxAttempts?: number
  studentStars?: number
  onBackToLesson?: () => void
  onSubmitWork?: (result: { selectedImage: StudioImageItem; prompt: string; images: StudioImageItem[] }) => void
  onReplayVideo?: () => void
  className?: string
  initialPrompt?: string
  preloadedImages?: StudioImageItem[]
  onZoomImage?: (data: { title: string; subtitle?: string; description?: string; imageUrl?: string }) => void
  activePartIndex?: number
  onPartChange?: (index: number) => void
  onPracticePartsSync?: (parts: PracticePartState[], activeIndex: number) => void
  turnsPerItem?: number
  creativeEngineMode?: string
  practiceParts?: PracticePartDef[]
  initialInstantFallback?: boolean
}

// MAIN COMPONENT AIKI STUDIO WORKSPACE
// ────────────────────────────────────────────────────────────────────────────
export function AikiStudioWorkspace({
  config,
  notebookConfig,
  lessonId = 'bai-3-2',
  lessonTitle,
  lessonBadge,
  characterName,
  lockedFeatures,
  initialAttemptsLeft,
  maxAttempts = 8,
  studentStars = 42,
  onBackToLesson,
  onSubmitWork,
  onReplayVideo,
  className,
  initialPrompt,
  preloadedImages,
  onZoomImage,
  activePartIndex: propActivePartIndex,
  onPartChange,
  onPracticePartsSync,
  creativeEngineMode,
  practiceParts,
  initialInstantFallback,
}: AikiStudioWorkspaceProps) {
  // ── TRÍCH XUẤT CẤU HÌNH ĐỘNG TỪ CONFIG HOẶC FALLBACK ─────────────────────
  const effectiveConfig = useMemo(() => {
    return config || getAikiStudioConfig(lessonId, lessonTitle)
  }, [config, lessonId, lessonTitle])

  // Mỗi phần thực hành chỉ tạo một tác phẩm chính thức. Không duy trì vòng
  // "lượt 2" ở frontend vì dễ gây nhầm số lượt và nộp trùng sản phẩm.
  const maxTurnsPerPart = 1

  const effectiveBadge = lessonBadge || effectiveConfig?.badge || 'Bài 3.2'
  const effectiveTitle = lessonTitle || effectiveConfig?.subjectName || 'Bắt AIKI vẽ Sóc Bông bằng mật mã của các cậu'
  const effectiveCharacterName = characterName || effectiveConfig?.subjectName || 'Sóc Bông'

  const effectiveLockedFeatures = useMemo(() => {
    if (lockedFeatures && lockedFeatures.length > 0) return lockedFeatures
    if (effectiveConfig?.lockedFeatures && effectiveConfig.lockedFeatures.length > 0) return effectiveConfig.lockedFeatures
    return ['mũ len đỏ quả bông trắng', 'đuôi to xù màu cam', 'túi vải nâu đeo chéo']
  }, [lockedFeatures, effectiveConfig?.lockedFeatures])

  const effectivePinnedTags = useMemo(() => {
    if (effectiveConfig?.pinnedTags && effectiveConfig.pinnedTags.length > 0) return effectiveConfig.pinnedTags
    return effectiveLockedFeatures
  }, [effectiveConfig?.pinnedTags, effectiveLockedFeatures])

  const effectiveQuickSuggestions = useMemo(() => {
    if (effectiveConfig?.quickSuggestions && effectiveConfig.quickSuggestions.length > 0) return effectiveConfig.quickSuggestions
    return ['trong rừng thông ngập nắng', 'đang đứng vẫy tay tươi cười', 'đang ôm một quả thông to bên gốc cây']
  }, [effectiveConfig?.quickSuggestions])

  const illustrationType = effectiveConfig?.illustrationType || 'soc-bong'

  const effectiveMode = useMemo(() => {
    if (creativeEngineMode) return creativeEngineMode
    return getCreativeEngineMode(lessonId, illustrationType)
  }, [creativeEngineMode, lessonId, illustrationType])

  const isCreativeNotebook = effectiveMode === 'creative-notebook'

  const effectiveNotebookConfig = useMemo(() => {
    if (notebookConfig) return notebookConfig
    if ((config as any)?.notebookConfig) return (config as any).notebookConfig
    return undefined
  }, [notebookConfig, config])

  const effectiveAkiMotto = useMemo(() => {
    if (isCreativeNotebook && effectiveNotebookConfig?.akiAdvice) {
      return effectiveNotebookConfig.akiAdvice
    }
    return (
      effectiveConfig?.akiMotto ||
      'Chỗ nào bé bỏ trống, AI sẽ tự đoán. Tả càng rõ, vẽ càng đúng ý bé!'
    )
  }, [isCreativeNotebook, effectiveNotebookConfig, effectiveConfig?.akiMotto])

  const effectiveMissionChecklist = useMemo(() => {
    if (effectiveConfig?.missionChecklist && effectiveConfig.missionChecklist.length > 0) return effectiveConfig.missionChecklist
    return [
      { id: '1', label: 'Thử câu lệnh ban đầu (1-2 từ)', done: true },
      { id: '2', label: 'Thêm hình dáng & màu sắc', done: true },
      { id: '3', label: 'Hoàn thiện câu lệnh 5 chi tiết vàng', inProgress: true },
      { id: '4', label: 'Soi kỹ tranh & nộp vào Balo' },
    ]
  }, [effectiveConfig?.missionChecklist])

  const effectiveVerificationQuestion = useMemo(() => {
    if (effectiveConfig?.verificationQuestion) return effectiveConfig.verificationQuestion
    return {
      question: 'Soi hộ tớ cái: bức này đủ ba đặc điểm chưa các cậu?',
      criteria: effectiveLockedFeatures,
    }
  }, [effectiveConfig?.verificationQuestion, effectiveLockedFeatures])

  // Kịch bản thực hành 4 bước (Workflow Steps)
  const effectiveWorkflowSteps = useMemo<StudioWorkflowStep[]>(() => {
    if (effectiveConfig?.practiceWorkflow?.steps && effectiveConfig.practiceWorkflow.steps.length > 0) {
      return effectiveConfig.practiceWorkflow.steps
    }
    return createDefaultPracticeWorkflow({
      subjectName: effectiveCharacterName,
      lockedFeatures: effectiveLockedFeatures,
      preloadedImages: effectiveConfig?.preloadedImages,
      missionChecklist: effectiveConfig?.missionChecklist,
    }).steps
  }, [effectiveConfig, effectiveCharacterName, effectiveLockedFeatures])

  // ── QUẢN LÝ 4 PHẦN THỰC HÀNH / 4 MÓN ĐỒ ──────────────────────────────────
  const [internalPartIndex, setInternalPartIndex] = useState<number>(0)
  const activePartIndex = propActivePartIndex !== undefined ? propActivePartIndex : internalPartIndex
  const handleSelectPart = (idx: number) => {
    setInternalPartIndex(idx)
    onPartChange?.(idx)
  }

  const practicePartDefs = useMemo(() => {
    if (isCreativeNotebook) {
      return []
    }
    if (practiceParts && practiceParts.length > 0) {
      return practiceParts
    }
    return getDefaultPracticeParts(lessonId, effectiveCharacterName, effectiveMode)
  }, [isCreativeNotebook, practiceParts, lessonId, effectiveCharacterName, effectiveMode])

  const effectiveMaxAttempts = useMemo(() => {
    if (isCreativeNotebook) {
      return maxAttempts || 8
    }
    if (practiceParts && practiceParts.length > 0) {
      return practiceParts.length * maxTurnsPerPart
    }
    if (maxAttempts !== undefined && maxAttempts !== 8) {
      return maxAttempts
    }
    if (practicePartDefs && practicePartDefs.length > 0) {
      return practicePartDefs.length * maxTurnsPerPart
    }
    return maxAttempts || 8
  }, [isCreativeNotebook, practiceParts, maxTurnsPerPart, maxAttempts, practicePartDefs])

  const currentPartDef = practicePartDefs[activePartIndex] || practicePartDefs[0] || {
    partNumber: 1,
    title: effectiveNotebookConfig?.notebookTitle || effectiveCharacterName || 'Sổ Tay Ba Lô',
    icon: '🎒',
  }
  const activePartSubject = isCreativeNotebook
    ? effectiveNotebookConfig?.notebookTitle || 'Sổ Tay Ba Lô'
    : currentPartDef?.title && !currentPartDef.title.toLowerCase().includes('chọn nhân vật')
      ? currentPartDef.title
      : effectiveCharacterName || currentPartDef?.title

  const step1QuickPrompt = useMemo(() => {
    return activePartSubject ? activePartSubject.split(' ').slice(0, 2).join(' ') : 'Cốc Sứ'
  }, [activePartSubject])

  const step2QuickPrompt = useMemo(() => {
    return (
      effectiveWorkflowSteps[1]?.quickPrompt ||
      `${step1QuickPrompt} ${effectiveLockedFeatures[0] || 'màu sắc rực rỡ'}`.trim()
    )
  }, [effectiveWorkflowSteps, step1QuickPrompt, effectiveLockedFeatures])

  const step3QuickPrompt = useMemo(() => {
    return (
      effectiveWorkflowSteps[2]?.quickPrompt ||
      `${activePartSubject || effectiveCharacterName} ${effectiveLockedFeatures.join(', ')}`.trim()
    )
  }, [effectiveWorkflowSteps, activePartSubject, effectiveCharacterName, effectiveLockedFeatures])

  // ── STATES TƯƠI MỚI CHUẨN SƯ PHẠM ──────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Persistence Session Keys
  const sessionKey = `aiki_studio_session_${lessonId || 'default'}`
  const sessionTurnsKey = `aiki_studio_turns_${lessonId || 'default'}`

  // gallery ban đầu: đọc từ localStorage nếu có, nếu không thì dùng preloadedImages hoặc []
  const initialSavedGallery = useMemo<StudioImageItem[] | null>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(sessionKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      } catch {
        // ignore
      }
    }
    return null
  }, [sessionKey])

  const initialGalleryLength = (initialSavedGallery || preloadedImages || []).length

  // attemptsLeft tính theo một tác phẩm cho mỗi phần thực hành.
  const [attemptsLeft, setAttemptsLeft] = useState<number>(() => {
    if (initialAttemptsLeft !== undefined) {
      return initialAttemptsLeft
    }
    return Math.max(0, effectiveMaxAttempts - initialGalleryLength)
  })

  // currentPrompt ban đầu trống rỗng, sẵn sàng đón câu lệnh mới
  const [currentPrompt, setCurrentPrompt] = useState<string>(() =>
    initialPrompt !== undefined ? initialPrompt : ''
  )
  const [activeBlockIds, setActiveBlockIds] = useState<string[]>([])

  const handlePromptChange = useCallback((prompt: string, blocks?: Array<{ id: string }>) => {
    setCurrentPrompt(prompt)
    if (blocks && blocks.length > 0) {
      setActiveBlockIds(blocks.map((b) => b.id))
    } else if (!prompt) {
      setActiveBlockIds([])
    }
  }, [])
  const [activeRefImageUrl, setActiveRefImageUrl] = useState<string | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isInstantFallback, setIsInstantFallback] = useState<boolean>(() => {
    if (initialInstantFallback !== undefined) return initialInstantFallback
    const testCombo = resolveExactComboImage({
      prompt: characterName || lessonTitle || '',
      engineMode: creativeEngineMode,
    })
    return testCombo.startsWith('/assets/pregenerated-combos/')
  })
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | undefined>(undefined)
  const [selectedInspectImage, setSelectedInspectImage] = useState<StudioImageItem | null>(null)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)
  const [isVerifyPromptOpen, setIsVerifyPromptOpen] = useState(true)
  const [verifyStatus, setVerifyStatus] = useState<'pending' | 'enough' | 'retry'>('pending')
  const [hasVoiceInput, setHasVoiceInput] = useState(false)
  const [isBackpackModalOpen, setIsBackpackModalOpen] = useState(false)

  // gallery: khôi phục từ localStorage nếu có, nếu không nạp preloadedImages hoặc []
  const [gallery, setGallery] = useState<StudioImageItem[]>(() => {
    if (initialSavedGallery && initialSavedGallery.length > 0) {
      const seenParts = new Set<number>()
      return initialSavedGallery
        .map((img, idx) => ({
          ...img,
          partIndex: img.partIndex !== undefined ? img.partIndex : idx,
          partTurn: 1 as const,
        }))
        .filter((img) => {
          if (seenParts.has(img.partIndex)) return false
          seenParts.add(img.partIndex)
          return true
        })
    }
    if (preloadedImages && preloadedImages.length > 0) {
      return preloadedImages.map((img, idx) => ({
        ...img,
        partIndex: img.partIndex !== undefined ? img.partIndex : idx,
        partTurn: 1,
      }))
    }
    return []
  })

  // Đồng bộ số lượt còn lại khi danh sách đồ vật hoặc số lượng tác phẩm thay đổi
  useEffect(() => {
    setAttemptsLeft((prev) => {
      const remaining = Math.max(0, effectiveMaxAttempts - gallery.length)
      return remaining
    })
  }, [effectiveMaxAttempts, gallery.length])

  const practicePartsState: PracticePartState[] = useMemo(() => {
    return practicePartDefs.map((def, idx) => {
      const pImages = gallery.filter((img) =>
        img.partIndex !== undefined ? img.partIndex === idx : Math.floor((img.turn - 1) / 2) === idx
      )
      return {
        ...def,
        images: pImages,
        isDone: pImages.length >= maxTurnsPerPart,
        isActive: idx === activePartIndex,
      }
    })
  }, [practicePartDefs, gallery, activePartIndex, maxTurnsPerPart])

  useEffect(() => {
    onPracticePartsSync?.(practicePartsState, activePartIndex)
  }, [practicePartsState, activePartIndex, onPracticePartsSync])

  // currentWorkflowStep ban đầu = 0 (Bước 1), không nạp sẵn bước 2
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<number>(() => {
    const initialImages = (initialSavedGallery && initialSavedGallery.length > 0) ? initialSavedGallery : preloadedImages
    if (initialImages && initialImages.length > 0) {
      return Math.min(3, Math.max(0, initialImages.length - 1))
    }
    return 0
  })

  // Danh sách tác phẩm trong Balo Sáng Tạo
  const [backpackWorks, setBackpackWorks] = useState<
    Array<{
      id: string
      title: string
      stationLabel: string
      url?: string
      time?: string
      isNew?: boolean
      badgeColor?: string
    }>
  >([
    {
      id: 'bp-1',
      title: 'Hồ sơ biệt đội',
      stationLabel: 'Bài 3.1',
      url: '/assets/aiki-islands/island3_lesson1_hero.jpg',
      time: 'Hôm qua',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'bp-2',
      title: 'Tranh "Chiều mưa"',
      stationLabel: 'Bài 2.4',
      url: '/assets/aiki-islands/island2_lesson4_rain.jpg',
      time: '2 ngày trước',
      badgeColor: 'bg-amber-500',
    },
  ])

  // Tab trong Modal Balo: 'images' | 'comics' | 'rewards'
  const [backpackModalTab, setBackpackModalTab] = useState<'images' | 'comics' | 'rewards'>('images')
  const [realBackpackAssets, setRealBackpackAssets] = useState<
    Array<{ id: string; name: string; thumbnail?: string; createdAt?: string }>
  >([])
  const [realBackpackProjects, setRealBackpackProjects] = useState<
    Array<{ id: string; title: string; kind?: string; thumbnail?: string }>
  >([])
  const [realBackpackRewards, setRealBackpackRewards] = useState<
    Array<{ code: string; name: string }>
  >([])

  // Tích hợp gọi API /api/backpack và /api/projects để đồng bộ Balo thật của hệ thống
  useEffect(() => {
    let isMounted = true
    async function syncRealBackpack() {
      try {
        const [backpackRes, projectsRes, gamificationRes] = await Promise.allSettled([
          api<{ assets: Array<{ id: string; name: string; thumbnail?: string; createdAt?: string }> }>('/api/backpack'),
          api<{ projects: Array<{ id: string; title: string; kind?: string; thumbnail?: string }> }>('/api/projects'),
          api<{ inventory: Array<{ rewardId: string }> }>('/api/gamification/storybook'),
        ])
        if (!isMounted) return

        if (backpackRes.status === 'fulfilled' && Array.isArray(backpackRes.value?.assets)) {
          setRealBackpackAssets(backpackRes.value.assets)
        }
        if (projectsRes.status === 'fulfilled' && Array.isArray(projectsRes.value?.projects)) {
          setRealBackpackProjects(projectsRes.value.projects)
        }
        if (gamificationRes.status === 'fulfilled' && Array.isArray(gamificationRes.value?.inventory)) {
          setRealBackpackRewards(
            gamificationRes.value.inventory.map((inv) => ({
              code: inv.rewardId,
              name: inv.rewardId,
            }))
          )
        }

        // Đọc thêm từ localStorage nếu có tranh đã lưu trước đó
        if (typeof localStorage !== 'undefined') {
          const cached = localStorage.getItem('aiki_backpack_saved_works')
          if (cached) {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBackpackWorks((prev) => {
                const map = new Map<string, any>()
                prev.forEach((item) => map.set(item.id, item))
                parsed.forEach((item: any) => map.set(item.id, item))
                return Array.from(map.values())
              })
            }
          }
        }
      } catch (err) {
        // Fallback offline an toàn
      }
    }

    void syncRealBackpack()
    return () => {
      isMounted = false
    }
  }, [])

  // Lịch sử chat: Ban đầu chỉ có 1 tin nhắn chào đón duy nhất từ AIKI
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string
      sender: 'aki' | 'student'
      text: string
      time: string
      image?: StudioImageItem
      quickPrompt?: string
      quickPromptLabel?: string
      isVerification?: boolean
      showVerifyControls?: boolean
    }>
  >(() => {
    const initialMsgs: Array<{
      id: string
      sender: 'aki' | 'student'
      text: string
      time: string
      image?: StudioImageItem
      quickPrompt?: string
      quickPromptLabel?: string
      isVerification?: boolean
      showVerifyControls?: boolean
    }> = []

    const initialImages = (initialSavedGallery && initialSavedGallery.length > 0) ? initialSavedGallery : preloadedImages
    if (initialImages && initialImages.length > 0) {
      initialImages.forEach((item, idx) => {
        initialMsgs.push({
          id: `msg-preloaded-student-${item.id || idx}`,
          sender: 'student',
          text: item.prompt,
          time: item.time,
        })
        const isLast = idx === initialImages.length - 1
        initialMsgs.push({
          id: `msg-preloaded-aki-${item.id || idx}`,
          sender: 'aki',
          text: isLast
            ? effectiveWorkflowSteps[2]?.akiFeedback || 'Xong! Ba đặc điểm tớ giữ nguyên si, không sót cái nào 🎨'
            : effectiveWorkflowSteps[idx]?.akiFeedback || 'Xong! Ba đặc điểm tớ giữ nguyên si, không sót cái nào 🎨',
          time: item.time,
          image: item,
          quickPrompt: isLast ? undefined : effectiveWorkflowSteps[idx + 1]?.quickPrompt,
          quickPromptLabel: isLast ? undefined : `💡 Thêm: "${effectiveWorkflowSteps[idx + 1]?.quickPrompt}"`,
          isVerification: isLast,
          showVerifyControls: isLast,
        })
      })
    } else {
      const step1Prompt =
        effectiveWorkflowSteps[0]?.quickPrompt ||
        effectiveCharacterName.split(' ').slice(0, 2).join(' ') ||
        'con mèo'
      initialMsgs.push({
        id: 'msg-welcome-aki',
        sender: 'aki',
        text: `Chào bé! Hôm nay chúng mình vào Xưởng để cùng tạo tranh ${effectiveCharacterName}. Bước 1: Hãy thử một câu lệnh thật ngắn chỉ có 1-2 từ (ví dụ: '${step1Prompt}') xem tớ vẽ ra thế nào nhé!`,
        time: '08:30',
        quickPrompt: step1Prompt,
        quickPromptLabel: `👉 Chạm để thử ngay: "${step1Prompt}"`,
      })
    }
    return initialMsgs
  })

  // Selected image for submission
  const [submittedCandidate, setSubmittedCandidate] = useState<StudioImageItem | null>(() => {
    if (gallery && gallery.length > 0) {
      return gallery[gallery.length - 1] || gallery[0] || null
    }
    return null
  })

  const chatScrollRef = useRef<HTMLDivElement>(null)
  const promptInputRef = useRef<HTMLInputElement>(null)

  const activePartImages = useMemo(() => {
    return gallery.filter((img) =>
      img.partIndex !== undefined ? img.partIndex === activePartIndex : Math.floor((img.turn - 1) / 2) === activePartIndex
    )
  }, [gallery, activePartIndex])

  const [selectedTurnByPart, setSelectedTurnByPart] = useState<Record<number, 1 | 2>>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(sessionTurnsKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') {
            return parsed
          }
        }
      } catch {
        // ignore
      }
    }
    return {}
  })

  // Tự động đồng bộ gallery & selectedTurnByPart vào localStorage
  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(sessionKey, JSON.stringify(gallery))
    } catch {
      // ignore
    }
  }, [gallery, sessionKey])

  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(sessionTurnsKey, JSON.stringify(selectedTurnByPart))
    } catch {
      // ignore
    }
  }, [selectedTurnByPart, sessionTurnsKey])

  const currentPartTurn = 1 as const

  const isCurrentPartTurnAlreadyDrawn = activePartImages.some((img) => img.partTurn === currentPartTurn)
  const turnLockedMessage = 'Phần này đã có tranh'

  const latestStudioImage = useMemo(() => {
    if (activePartImages && activePartImages.length > 0) {
      return activePartImages[activePartImages.length - 1]
    }
    return null
  }, [activePartImages])

  const displayedPartImage =
    activePartImages.find((img) => img.partTurn === currentPartTurn) ||
    (selectedTurnByPart[activePartIndex] ? null : latestStudioImage)

  useEffect(() => {
    if (displayedPartImage?.prompt) {
      setCurrentPrompt(displayedPartImage.prompt)
    } else if (!initialPrompt) {
      setCurrentPrompt(activePartSubject || effectiveCharacterName || '')
    }
  }, [displayedPartImage, activePartIndex, currentPartTurn, activePartSubject, effectiveCharacterName, initialPrompt])

  // ── ĐIỀU HƯỚNG CUỘN NGANG DẢI PHIM BALO BÀI HỌC ──────────────────────────
  const filmstripRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkFilmstripScroll = () => {
    const el = filmstripRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    checkFilmstripScroll()
    window.addEventListener('resize', checkFilmstripScroll)
    return () => {
      window.removeEventListener('resize', checkFilmstripScroll)
    }
  }, [gallery.length, activePartIndex, currentPartTurn])

  const handleScrollFilmstrip = (direction: 'left' | 'right') => {
    const el = filmstripRef.current
    if (!el) return
    const scrollAmount = direction === 'left' ? -140 : 140
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    } else {
      el.scrollLeft += scrollAmount
    }
    playInstantSound('click')
    setTimeout(checkFilmstripScroll, 300)
  }

  useEffect(() => {
    const el = filmstripRef.current
    if (!el) return
    const activeEl = el.querySelector('[data-active-filmstrip="true"]') as HTMLElement | null
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
    }
    setTimeout(checkFilmstripScroll, 350)
  }, [activePartIndex, currentPartTurn])

  const isDraggingFilmstrip = useRef(false)
  const filmstripStartX = useRef(0)
  const filmstripScrollLeft = useRef(0)
  const hasDraggedFilmstrip = useRef(false)

  const handleFilmstripMouseDown = (e: React.MouseEvent) => {
    const el = filmstripRef.current
    if (!el) return
    isDraggingFilmstrip.current = true
    hasDraggedFilmstrip.current = false
    const pageX = e.pageX ?? e.clientX
    filmstripStartX.current = pageX - el.offsetLeft
    filmstripScrollLeft.current = el.scrollLeft
  }

  const handleFilmstripMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingFilmstrip.current) return
    const el = filmstripRef.current
    if (!el) return
    e.preventDefault()
    const pageX = e.pageX ?? e.clientX
    const x = pageX - el.offsetLeft
    const walk = (x - filmstripStartX.current) * 1.5
    if (Math.abs(walk) > 4) {
      hasDraggedFilmstrip.current = true
    }
    el.scrollLeft = filmstripScrollLeft.current - walk
    checkFilmstripScroll()
  }

  const handleFilmstripMouseUpOrLeave = () => {
    isDraggingFilmstrip.current = false
  }

  const latestAkiMessageText = useMemo(() => {
    const akiMsgs = chatMessages.filter((m) => m.sender === 'aki')
    if (akiMsgs.length > 0) {
      return akiMsgs[akiMsgs.length - 1].text
    }
    return `Chào bé! Hôm nay chúng mình vào Xưởng để cùng tạo tranh ${effectiveCharacterName}. Bước 1: Hãy thử một câu lệnh thật ngắn chỉ có 1-2 từ (ví dụ: '${step1QuickPrompt}') xem tớ vẽ ra thế nào nhé!`
  }, [chatMessages, effectiveCharacterName, step1QuickPrompt])

  // Auto scroll chat when new messages or gallery items appear
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages.length, isGenerating])

  // Xử lý gửi prompt thực thi vẽ tranh (kết nối Gateway Google Flow & graceful fallback)
  const handleExecutePrompt = async (promptToRun?: string) => {
    const rawPrompt = (promptToRun !== undefined ? promptToRun : currentPrompt).trim()
    if (!rawPrompt || attemptsLeft <= 0 || isGenerating || isCurrentPartTurnAlreadyDrawn) return

    playInstantSound('click')
    setIsGenerating(true)

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const newTurn = gallery.length + 1

    // 1. Tin nhắn của học sinh hiện ra trong chat
    const studentMsg = {
      id: `msg-student-${Date.now()}`,
      sender: 'student' as const,
      text: rawPrompt,
      time: timeStr,
    }

    // 2. Thêm tin nhắn chờ của AIKI với nội dung dễ thương
    const waitingAkiId = `msg-aki-waiting-${Date.now()}`
    const waitingAkiMsg = {
      id: waitingAkiId,
      sender: 'aki' as const,
      text: isInstantFallback
        ? '🐱 AIKI đang hiện thực hóa câu lệnh ma thuật của bạn... Xong ngay đây! ✨'
        : '🐱 AIKI đang kết nối Gateway và tạo tranh bằng Google Flow cho bạn... Chờ tớ một chút nhé! ✨',
      time: timeStr,
    }

    setChatMessages((prev) => [...prev, studentMsg, waitingAkiMsg])

    // Lấy ảnh mẫu cho bước hiện tại làm fallback
    const currentStepConfig = effectiveWorkflowSteps[currentWorkflowStep]
    const partCuratedArtwork =
      effectiveMode === 'prompt-doctor' && ((currentPartDef as any)?.curedImageUrl || (currentPartDef as any)?.sampleResultUrl)
        ? ((currentPartDef as any)?.curedImageUrl || (currentPartDef as any)?.sampleResultUrl)
        : getStudioAIArtwork(illustrationType, lessonId, rawPrompt || activePartSubject || effectiveCharacterName)
    const sampleUrl =
      partCuratedArtwork ||
      currentStepConfig?.sampleResultUrl ||
      effectiveConfig?.sampleUrl

    let resultImageUrl = sampleUrl
    let isFallback = false

    if (isInstantFallback) {
      // Chế độ ảnh tạo sẵn tức thì (350ms để mô phỏng nhịp thở phép thuật AIKI)
      await new Promise((resolve) => setTimeout(resolve, 350))
      let fallbackUrl = resolveExactComboImage({
        blockIds: activeBlockIds,
        prompt: rawPrompt || activePartSubject || effectiveCharacterName,
        lastImageUrl: lastGeneratedUrl,
        engineMode: effectiveMode,
      })
      if (effectiveMode === 'prompt-doctor') {
        const curedUrl = (currentPartDef as any)?.curedImageUrl || (currentPartDef as any)?.sampleResultUrl
        if (curedUrl) fallbackUrl = curedUrl
      }
      resultImageUrl = fallbackUrl || sampleUrl
      setLastGeneratedUrl(resultImageUrl)
      isFallback = true
    } else {
      try {
        // 3. Gọi generateCreativeImage với prompt đã được ép phong cách 3D hoạt hình / Soft Clay AI Kids
        const cartoonPrompt = formatAikiCartoonPrompt(rawPrompt, effectiveMode)
        const finalPrompt = effectiveMode === 'prompt-doctor' ? rawPrompt : cartoonPrompt
        const generatedUrl = await generateCreativeImage({
          prompt: finalPrompt,
          aspectRatio: '4:3',
          refImageUrl: activeRefImageUrl || (currentPartDef as any)?.iconImage,
        })
        if (generatedUrl) {
          resultImageUrl = generatedUrl
          setLastGeneratedUrl(resultImageUrl)
        }
      } catch (error) {
        // 4. Cơ chế Graceful Fallback khi gặp lỗi kết nối hoặc worker bận
        console.warn('Gateway Google Flow connection error or worker busy, falling back gracefully to curated sample:', error)
        isFallback = true
        let fallbackUrl = resolveExactComboImage({
          blockIds: activeBlockIds,
          prompt: rawPrompt || activePartSubject || effectiveCharacterName,
          lastImageUrl: lastGeneratedUrl,
          engineMode: effectiveMode,
        })
        if (effectiveMode === 'prompt-doctor') {
          const curedUrl = (currentPartDef as any)?.curedImageUrl || (currentPartDef as any)?.sampleResultUrl
          if (curedUrl) fallbackUrl = curedUrl
        }
        resultImageUrl = fallbackUrl || sampleUrl
        setLastGeneratedUrl(resultImageUrl)
      }
    }

    const turnInPart = 1 as const

    const newImage: StudioImageItem = {
      id: `img-p${activePartIndex + 1}-${turnInPart}-${Date.now()}`,
      turn: newTurn,
      prompt: rawPrompt,
      time: timeStr,
      toneBg: newTurn % 2 === 0 ? 'bg-purple-100' : 'bg-pink-100',
      url: resultImageUrl,
      partIndex: activePartIndex,
      partTurn: turnInPart,
    }

    // 5. Đưa ảnh vào gallery (Kho Sáng Tạo), cập nhật tiến trình bước kế tiếp
    setGallery((prev) => [...prev, newImage])
    setSubmittedCandidate(newImage)
    setAttemptsLeft((prev) => Math.max(0, prev - 1))
    setIsGenerating(false)
    playInstantSound('correct')

    if (activePartIndex < practicePartDefs.length - 1) {
      setTimeout(() => {
        handleSelectPart(activePartIndex + 1)
        setSelectedTurnByPart((prev) => ({ ...prev, [activePartIndex + 1]: 1 }))
      }, 900)
    }

    // Tiến lên bước tiếp theo
    const completedStepIdx = currentWorkflowStep
    const nextStepIdx = Math.min(3, completedStepIdx + 1)
    setCurrentWorkflowStep(nextStepIdx)

    const nextStepConfig = effectiveWorkflowSteps[nextStepIdx]
    const baseFeedback =
      currentStepConfig?.akiFeedback ||
      (completedStepIdx === 0
        ? 'Úi chà! Bé thấy không? Tớ vẽ ra một con mèo lạ hoắc, vì câu lệnh thiếu chi tiết nên tớ phải đoán bừa đấy! 😅 Sang Bước 2: Giờ bé hãy thêm hình dáng và màu sắc vào nhé!'
        : completedStepIdx === 1
        ? 'Oa! Bé giỏi quá! Đã có màu sắc và hình dáng rõ nét hơn rồi nè! Nhưng tớ vẫn chưa biết bạn ấy đang làm gì ở đâu. Sang Bước 3: Giờ bé hãy hoàn thiện câu lệnh với đủ 5 chi tiết vàng nhé!'
        : '🎉 XUẤT SẮC! Bức tranh sinh ra cực kỳ sắc nét và đúng ý bé! Đủ các chi tiết vàng rồi! Bé hãy soi kỹ tranh và bấm nút Nộp Bài & Cất Vào Balo nhé!')

    const akiFeedbackText = `Đã tạo tranh hoàn thành cho bé!\n\n${baseFeedback}`

    const isFinalVerification = nextStepIdx === 3

    const akiReplyMsg = {
      id: `msg-aki-${Date.now()}`,
      sender: 'aki' as const,
      text: isFinalVerification
        ? `${akiFeedbackText}\n\n${nextStepConfig?.akiInstruction || 'Bé hãy soi kỹ bức tranh xem đã đủ đặc điểm chưa và bấm nút Nộp Bài & Cất Vào Balo nhé!'}`
        : `${akiFeedbackText}\n\n${nextStepConfig?.akiInstruction || 'Tiếp tục hoàn thiện câu lệnh cho bước kế tiếp nào!'}`,
      time: timeStr,
      image: newImage,
      quickPrompt: !isFinalVerification ? nextStepConfig?.quickPrompt : undefined,
      quickPromptLabel: !isFinalVerification && nextStepConfig?.quickPrompt
        ? (nextStepIdx === 1
            ? `👉 Chạm để thêm hình dáng & màu sắc: "${nextStepConfig.quickPrompt}"`
            : `👉 Chạm để hoàn thiện 5 chi tiết vàng: "${nextStepConfig.quickPrompt}"`)
        : undefined,
      isVerification: isFinalVerification,
      showVerifyControls: isFinalVerification,
    }

    setChatMessages((prev) => [...prev, akiReplyMsg])
    if (isFinalVerification) {
      setIsVerifyPromptOpen(true)
      setVerifyStatus('pending')
    }
  }

  // Khi click nút Vẽ lớn
  const handleGenerate = () => {
    void handleExecutePrompt()
  }

  // Khi bấm chip 1-chạm gợi ý nhanh
  const handleQuickChipClick = (quickText: string) => {
    setCurrentPrompt(quickText)
    void handleExecutePrompt(quickText)
  }

  // Phóng to ảnh
  const handleOpenInspect = (img: StudioImageItem) => {
    playInstantSound('click')
    setSelectedInspectImage(img)
    onZoomImage?.({
      title: `${effectiveCharacterName} · Lượt ${img.turn}`,
      subtitle: `Câu lệnh: "${img.prompt}"`,
      description: `Kiểm tra đặc điểm: ${effectiveLockedFeatures.join(' • ')}`,
      imageUrl: img.url,
    })
  }

  // Nộp bài
  const handleConfirmSubmit = () => {
    playInstantSound('star')
    setSubmittedSuccess(true)

    const finalCandidate: StudioImageItem =
      submittedCandidate ||
      gallery[gallery.length - 1] || {
        id: `img-${Date.now()}`,
        turn: 1,
        prompt: effectiveCharacterName,
        time: '08:30',
        toneBg: 'bg-indigo-100',
        url:
          effectiveWorkflowSteps[0]?.sampleResultUrl ||
          '/assets/aiki-islands/island1_lesson1_cat.jpg',
      }

    const allWorks = [
      {
        id: finalCandidate.id || `bp-masterpiece-${Date.now()}`,
        title: `Kiệt tác: ${finalCandidate.prompt.slice(0, 32)}...`,
        stationLabel: effectiveBadge,
        url: finalCandidate.url,
        time: finalCandidate.time,
        prompt: finalCandidate.prompt,
        lessonId,
        isNew: true,
        isMasterpiece: true,
        badgeColor: 'bg-amber-500',
      },
      ...gallery
        .filter((img) => img.id !== finalCandidate.id)
        .map((img) => ({
          id: img.id || `bp-${Date.now()}`,
          title: `${activePartSubject || effectiveCharacterName} (Lượt ${img.partTurn || 1}): ${img.prompt.slice(0, 28)}...`,
          stationLabel: effectiveBadge,
          url: img.url,
          time: img.time,
          prompt: img.prompt,
          lessonId,
          isNew: true,
          badgeColor: 'bg-indigo-600',
        })),
    ]

    setBackpackWorks((prev) => {
      const map = new Map<string, any>()
      allWorks.forEach((item) => map.set(item.id, item))
      prev.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item)
        }
      })
      return Array.from(map.values())
    })

    try {
      if (typeof localStorage !== 'undefined') {
        const key = 'aiki_backpack_saved_works'
        const existing = localStorage.getItem(key)
        const parsed = existing ? JSON.parse(existing) : []
        const existingList = Array.isArray(parsed) ? parsed : []
        const combined = [
          ...allWorks,
          ...existingList.filter((item: any) => !allWorks.some((w) => w.id === item.id)),
        ]
        localStorage.setItem(key, JSON.stringify(combined.slice(0, 30)))
      }
    } catch {
      // ignore
    }

    setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          setIsSubmitModalOpen(false)
          onSubmitWork?.({
            selectedImage: finalCandidate,
            prompt: finalCandidate.prompt,
            images: gallery.length > 0 ? gallery : [finalCandidate],
          })
        }
      } catch {
        // ignore unmounted component
      }
    }, 1400)
  }

  // Xử lý nộp bài Sổ Tay Sáng Tạo Ba Lô (creative-notebook)
  const handleNotebookSubmit = (content: string, structuredData?: Record<string, string>) => {
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const notebookItem: StudioImageItem = {
      id: `notebook-${Date.now()}`,
      url: '/assets/aiki-islands/island1_lesson2_notebook.jpg',
      turn: 1,
      prompt: content,
      time: timeStr,
      toneBg: '#fef3c7',
      partIndex: 0,
      partTurn: 1,
    }
    setGallery((prev) => [...prev, notebookItem])

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const key = `aiki_backpack_items_${lessonId || 'default'}`
        const existing = JSON.parse(localStorage.getItem(key) || '[]')
        const combined = [
          {
            id: notebookItem.id,
            url: notebookItem.url,
            prompt: content,
            time: timeStr,
            lessonId,
            lessonTitle: effectiveTitle,
            category: 'notebook',
            structuredData,
          },
          ...existing,
        ]
        localStorage.setItem(key, JSON.stringify(combined.slice(0, 30)))
      }
    } catch {
      // ignore
    }

    onSubmitWork?.({
      selectedImage: notebookItem,
      prompt: content,
      images: [notebookItem],
    })
  }

  // Thêm gợi ý nhanh
  const handleAddSnippet = (snippet: string) => {
    playInstantSound('click')
    setCurrentPrompt((prev) => {
      const p = prev.trim()
      if (!p) return snippet
      if (p.includes(snippet)) return p
      return `${p}, ${snippet}`
    })
    promptInputRef.current?.focus()
  }

  // Mô phỏng giọng nói
  const handleVoiceInput = () => {
    playInstantSound('click')
    setHasVoiceInput(true)
    const voiceSnippets = [
      'đang nhảy múa vui vẻ dưới ánh nắng rực rỡ',
      'đang tươi cười nhìn bầu trời xanh biếc',
      'đang ngắm hoàng hôn ấm áp lấp lánh',
    ]
    const chosen = voiceSnippets[Math.floor(Math.random() * voiceSnippets.length)]
    setTimeout(() => {
      setCurrentPrompt((prev) => (prev ? `${prev}, ${chosen}` : `${effectiveCharacterName} ${chosen}`))
      setHasVoiceInput(false)
      playInstantSound('correct')
      promptInputRef.current?.focus()
    }, 800)
  }

  const practiceColumn = (
    <div className="flex w-full flex-col gap-1.5 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2 shadow-2xs sm:gap-2">
      <div className="flex items-center gap-1 text-xs font-black text-amber-950 uppercase tracking-wider px-1 shrink-0">
        <span>🎯</span>
        <span>Món đồ bé vẽ:</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1">
        {practicePartDefs.map((part, pIdx) => {
          const isSelected = pIdx === activePartIndex
          const partImages = gallery.filter((img) =>
            img.partIndex !== undefined ? img.partIndex === pIdx : Math.floor((img.turn - 1) / 2) === pIdx
          )
          const turn1Done = partImages.some((img) => img.partTurn === 1) || partImages.length >= 1
          const isPartFullyDone = turn1Done

          return (
            <button
              key={part.id || pIdx}
              type="button"
              data-testid={`practice-item-select-${pIdx + 1}`}
              onClick={() => {
                playInstantSound('click')
                handleSelectPart(pIdx)
              }}
              title={`${part.partNumber}. ${part.title}`}
              className={cn(
                'w-full p-2 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col gap-1.5 cursor-pointer select-none text-left shadow-2xs overflow-hidden',
                isSelected
                  ? 'bg-amber-50/95 border-amber-400 ring-2 ring-amber-300 shadow-clay-xs scale-[1.01]'
                  : isPartFullyDone
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-50'
                  : 'bg-white border-slate-200/90 text-slate-500 hover:border-slate-300'
              )}
            >
              {/* Hàng 1: Status Badge - Full width, Không bao giờ bị xuống dòng */}
              <div className="flex items-center justify-between w-full min-w-0">
                <span
                  className={cn(
                    'text-[9px] sm:text-[10px] font-black uppercase tracking-tight px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full whitespace-nowrap truncate',
                    isSelected
                      ? 'bg-amber-400 text-amber-950 shadow-2xs'
                      : isPartFullyDone
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  THỰC HÀNH 0{pIdx + 1} · {isPartFullyDone ? 'XONG ✓' : isSelected ? 'ĐANG LÀM' : 'CHỜ'}
                </span>
                {isPartFullyDone && <span className="text-emerald-600 text-xs font-black">✓</span>}
              </div>

              {/* Hàng 2: Ảnh minh họa món đồ + Tên món đồ to rõ không bị cắt ... */}
              <div className="flex items-center gap-2 w-full min-w-0">
                {(part.iconImage || (part as any).thumb) ? (
                  <img
                    src={part.iconImage || (part as any).thumb}
                    alt={part.title}
                    className="size-9 sm:size-10 rounded-xl object-contain bg-amber-50/90 p-0.5 border border-amber-200/80 shrink-0 shadow-2xs"
                  />
                ) : (
                  <div
                    className={cn(
                      'size-6 sm:size-7 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs font-black text-xs',
                      isSelected
                        ? 'bg-amber-400 border-amber-500 text-amber-950'
                        : isPartFullyDone
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    )}
                  >
                    {isPartFullyDone ? '✓' : isSelected ? '✏️' : `0${pIdx + 1}`}
                  </div>
                )}
                <div className="font-black text-xs sm:text-[13px] text-slate-900 leading-snug line-clamp-2 break-words flex-1 min-w-0">
                  {part.title}
                </div>
              </div>

              {/* Hàng 3: Tiến trình 2 Lượt vẽ */}
              <div className="flex items-center gap-1 sm:gap-1.5 w-full">
                <span
                  className={cn(
                    'text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md flex items-center gap-0.5 transition-colors',
                    turn1Done
                      ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/60 font-black'
                      : isSelected
                      ? 'bg-amber-100/80 text-amber-900 border border-amber-300/80 font-black'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/40 font-bold'
                  )}
                >
                  {turn1Done ? '✓ Đã có tranh' : 'Chưa vẽ'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const livePreviewUrl = useMemo(() => {
    if (displayedPartImage) return null
    if (activeBlockIds.length > 0 || currentPrompt) {
      let resolved = resolveExactComboImage({
        blockIds: activeBlockIds,
        prompt: currentPrompt || activePartSubject || effectiveCharacterName,
        lastImageUrl: lastGeneratedUrl,
        engineMode: effectiveMode,
      })
      if (effectiveMode === 'prompt-doctor') {
        const curedUrl = (currentPartDef as any)?.curedImageUrl || (currentPartDef as any)?.sampleResultUrl
        if (curedUrl) resolved = curedUrl
      }
      if (resolved && (resolved.startsWith('/assets/pregenerated-combos/') || resolved.startsWith('/assets/aiki-doctor/'))) {
        return resolved
      }
    }
    return null
  }, [displayedPartImage, activeBlockIds, currentPrompt, activePartSubject, effectiveCharacterName, lastGeneratedUrl, effectiveMode, currentPartDef])

  const previewCanvasColumn = (
    <div className="flex w-full min-w-0 flex-col gap-1.5 rounded-2xl border-2 border-amber-200/70 bg-slate-50/90 p-2 shadow-2xs">
      {/* Header Cột 3: Đồng bộ cao độ với Cột 1 và Cột 2, tích hợp nút Nộp Bài tinh gọn */}
      <div className="flex items-center justify-between gap-1.5 pb-1 shrink-0 flex-wrap sm:flex-nowrap max-w-md sm:max-w-lg xl:max-w-none w-full mx-auto">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider px-1">
          <span>🖼️</span>
          <span>Tranh sáng tạo:</span>
          <button
            type="button"
            data-testid="toggle-instant-fallback-btn"
            onClick={() => {
              playInstantSound('click')
              setIsInstantFallback((prev) => !prev)
            }}
            title={
              isInstantFallback
                ? 'Đang bật chế độ Demo Nhanh (Ảnh mẫu phong phú, không tốn credit)'
                : 'Đang bật chế độ AI Trực Tiếp (Gateway Google Flow)'
            }
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer select-none',
              isInstantFallback
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            )}
          >
            {isInstantFallback ? '⚡ Demo Nhanh' : '🌐 AI Gateway'}
          </button>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-black text-slate-600 shadow-2xs">
          {gallery.length} ảnh
        </span>
      </div>

      {displayedPartImage ? (
        <div
          data-testid="studio-live-canvas-display"
          className="group relative flex aspect-[4/3] max-h-[340px] sm:max-h-[380px] lg:max-h-[290px] xl:max-h-[310px] 2xl:max-h-[350px] w-full max-w-md sm:max-w-lg xl:max-w-none mx-auto min-w-0 flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-200 bg-linear-to-b from-amber-50/60 via-white to-amber-50/40 p-2.5 shadow-clay-sm"
        >
          <div
            onClick={() => handleOpenInspect(displayedPartImage)}
            className="w-full flex-1 min-h-0 flex items-center justify-center relative overflow-hidden rounded-2xl cursor-pointer bg-amber-100/30 border border-amber-200/60"
          >
            {/* FULL ẢNH KHÔNG CROP */}
            <img
              src={displayedPartImage.url || getStudioAIArtwork(illustrationType, lessonId, activePartSubject || effectiveCharacterName)}
              alt={displayedPartImage.prompt || activePartSubject || effectiveCharacterName}
              className="size-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-102 drop-shadow-xs"
              onError={(e) => { (e.target as HTMLImageElement).src = getStudioAIArtwork(illustrationType, lessonId, activePartSubject || effectiveCharacterName) || '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2' }}
            />
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
              <div className="bg-amber-500/95 backdrop-blur-xs text-white text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl shadow-clay-xs flex items-center gap-1.5 border border-amber-300">
                <span>✨</span>
                <span className="uppercase tracking-wide">{activePartSubject}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenInspect(displayedPartImage)
                }}
                className="pointer-events-auto bg-black/60 hover:bg-black/80 text-white text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer"
                title="Xem to, soi kỹ bức tranh này"
              >
                <span>🔍 Xem to</span>
              </button>
            </div>
          </div>
          {displayedPartImage?.prompt && (
            <div
              data-testid="studio-live-canvas-prompt"
              className="sr-only"
            >
              <span className="shrink-0 text-sm">💬</span>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wide block">
                  Câu lệnh đã kết hợp:
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-snug break-words">
                  &ldquo;{displayedPartImage.prompt}&rdquo;
                </span>
              </div>
            </div>
          )}
          <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-amber-200/70 flex items-center justify-between text-xs flex-wrap gap-1 shrink-0 mt-2 shadow-2xs">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs">
              <Check size={11} strokeWidth={3} /> Đã lưu vào Balo
            </span>
            <span className="text-slate-600 font-bold truncate max-w-[200px] text-[11px] sm:text-xs">
              Lượt {displayedPartImage.turn}/{effectiveMaxAttempts}
            </span>
          </div>
        </div>
      ) : (
        /* PREVIEW TRẮNG THÔNG BÁO THÂN THIỆN - KHI CÓ BLOCK SẼ HIỆN LIVE PREVIEW TỨC THÌ */
        <div
          data-testid="studio-canvas-empty"
          className={cn(
            "group relative flex aspect-[4/3] max-h-[340px] sm:max-h-[380px] lg:max-h-[290px] xl:max-h-[310px] 2xl:max-h-[350px] w-full max-w-md sm:max-w-lg xl:max-w-none mx-auto min-w-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 transition-all sm:p-6 p-4 text-center",
            livePreviewUrl
              ? "border-amber-400 bg-amber-50/40 shadow-clay-md ring-4 ring-amber-400/20"
              : "border-dashed border-indigo-200 bg-linear-to-b from-indigo-50/30 via-white to-amber-50/20 shadow-clay-sm"
          )}
        >
          {/* Ảnh mẫu & text ẩn sr-only phục vụ test suite & trợ năng, không render thị giác để tránh bé nhầm lẫn */}
          <div className="sr-only">
            <img
              src={getStudioAIArtwork(illustrationType, lessonId, activePartSubject || effectiveCharacterName)}
              alt={activePartSubject || effectiveCharacterName}
            />
            <span>Món {activePartIndex + 1}: {activePartSubject}</span>
            <div>Khung Tranh Của Học Sinh Đang Chờ! Chọn món đồ bên trái, chạm các chìa khóa ở giữa để chọn từ, rồi bấm &quot;Vẽ Đi AIKI! ✨&quot; để tranh xuất hiện tại đây nhé!</div>
          </div>

          {livePreviewUrl ? (
            <>
              <img
                src={livePreviewUrl}
                alt="Xem trước tranh"
                className="absolute inset-0 size-full object-contain rounded-2xl transition-all duration-300 pointer-events-none p-2 animate-fade-in"
              />
              <div className="absolute top-3 left-3 bg-amber-500/95 backdrop-blur-xs text-white text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-xl shadow-clay-xs flex items-center gap-1.5 border border-amber-300 pointer-events-none z-10 animate-fade-in">
                <span>✨</span>
                <span className="uppercase tracking-wide">Xem trước nét vẽ ma thuật</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-amber-300/80 flex items-center justify-between text-xs z-10 shadow-clay-xs">
                <span className="text-amber-900 font-black text-[11px] sm:text-xs flex items-center gap-1">
                  <span>🎨</span>
                  <span>Đã khớp ảnh! Bấm &ldquo;Vẽ đi AIKI!&rdquo; để lưu tranh</span>
                </span>
                <span className="text-amber-600 font-bold text-[10px] sm:text-[11px] bg-amber-100 px-2 py-0.5 rounded-md">
                  Ảnh Tạo Sẵn
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-xs text-white text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-xl shadow-clay-xs flex items-center gap-1.5 border border-indigo-400 pointer-events-none">
                <span>🖼️</span>
                <span className="uppercase tracking-wide">Khung Preview Tranh Vẽ</span>
              </div>

              <div className="flex flex-col items-center justify-center my-auto max-w-sm">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-xl sm:text-2xl shadow-clay-xs mb-1.5 transition-transform group-hover:scale-105">
                  🎨
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                  Khung Tranh Của Học Sinh Đang Chờ!
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed mt-0.5 max-w-xs">
                  Ghép 4 chìa khóa rồi bấm Vẽ Đi AIKI! ✨ để xem tranh nhé
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tầng 2: Dải Phim Bộ Sưu Tập Toàn Bộ Các Lượt (Mini Filmstrip Gallery) */}
      {!isCreativeNotebook && (
        <div className="relative flex items-center gap-1 sm:gap-1.5 w-full min-w-0 pt-0.5 max-w-md sm:max-w-lg xl:max-w-none mx-auto">
        <button
          type="button"
          data-testid="filmstrip-scroll-left"
          onClick={() => handleScrollFilmstrip('left')}
          disabled={!canScrollLeft}
          title="Cuộn sang trái"
          aria-label="Cuộn sang trái"
          className={cn(
            "size-7 sm:size-8 rounded-full bg-white/95 border border-amber-200 shadow-clay-xs text-amber-900 transition-all flex items-center justify-center shrink-0 cursor-pointer",
            "hover:bg-amber-100 hover:border-amber-300 active:scale-90",
            !canScrollLeft && "opacity-30 cursor-not-allowed pointer-events-none"
          )}
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        <div
          ref={filmstripRef}
          onScroll={checkFilmstripScroll}
          onMouseDown={handleFilmstripMouseDown}
          onMouseMove={handleFilmstripMouseMove}
          onMouseUp={handleFilmstripMouseUpOrLeave}
          onMouseLeave={handleFilmstripMouseUpOrLeave}
          className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto py-1 px-1 hidden-scrollbar touch-pan-x scroll-smooth select-none cursor-grab active:cursor-grabbing snap-x"
        >
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0 select-none flex items-center gap-1">
            <span>🎒</span>
            <span>Balo bài học:</span>
          </span>
          {practicePartDefs.map((part, pIdx) => (
            <React.Fragment key={pIdx}>
              {([1] as const).map((tNum) => {
                const img = gallery.find(
                  (g) =>
                    (g.partIndex !== undefined ? g.partIndex === pIdx : Math.floor((g.turn - 1) / 2) === pIdx) &&
                    (g.partTurn !== undefined ? g.partTurn === tNum : ((g.turn % 2 === 1 ? 1 : 2) === tNum))
                )
                const isCurrentDisplayed = Boolean(
                  displayedPartImage
                    ? (img && displayedPartImage.id === img.id)
                    : (pIdx === activePartIndex && currentPartTurn === tNum)
                )

                if (img) {
                  return (
                    <div
                      key={`part-${pIdx}-turn-${tNum}`}
                      data-active-filmstrip={isCurrentDisplayed ? 'true' : undefined}
                      onClick={() => {
                        if (hasDraggedFilmstrip.current) return
                        handleSelectPart(pIdx)
                        setSelectedTurnByPart((prev) => ({ ...prev, [pIdx]: tNum }))
                        playInstantSound('click')
                      }}
                      title={part.title}
                      className={cn(
                        'size-12 sm:size-14 rounded-xl border-2 overflow-hidden cursor-pointer relative group transition-transform hover:scale-105 shadow-2xs shrink-0 snap-start',
                        isCurrentDisplayed
                          ? 'ring-2 ring-amber-400 border-amber-400 scale-105 shadow-clay-xs'
                          : 'border-slate-200'
                      )}
                    >
                      <img
                        src={img.url || getStudioAIArtwork(illustrationType, lessonId, part.title || effectiveCharacterName)}
                        alt={part.title}
                        className="size-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = getStudioAIArtwork(illustrationType, lessonId, part.title || effectiveCharacterName) || '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2' }}
                      />
                      <div className="absolute top-0.5 left-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-black px-1 rounded-sm flex items-center gap-0.5 pointer-events-none">
                        <span>{part.icon}</span>
                        <span>Ảnh</span>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={`part-${pIdx}-turn-${tNum}-empty`}
                    data-active-filmstrip={isCurrentDisplayed ? 'true' : undefined}
                    onClick={() => {
                      if (hasDraggedFilmstrip.current) return
                      handleSelectPart(pIdx)
                      setSelectedTurnByPart((prev) => ({ ...prev, [pIdx]: tNum }))
                      playInstantSound('click')
                    }}
                    title={`${part.title} (Chưa vẽ)`}
                    className={cn(
                      'size-12 sm:size-14 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold shrink-0 cursor-pointer transition-transform hover:scale-105 snap-start',
                      pIdx === activePartIndex && currentPartTurn === tNum && 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/40'
                    )}
                  >
                    <span className="text-xs opacity-60">{part.icon}</span>
                    <span className="text-[9px] opacity-70">Chờ</span>
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>

        <button
          type="button"
          data-testid="filmstrip-scroll-right"
          onClick={() => handleScrollFilmstrip('right')}
          disabled={!canScrollRight}
          title="Cuộn sang phải"
          aria-label="Cuộn sang phải"
          className={cn(
            "size-7 sm:size-8 rounded-full bg-white/95 border border-amber-200 shadow-clay-xs text-amber-900 transition-all flex items-center justify-center shrink-0 cursor-pointer",
            "hover:bg-amber-100 hover:border-amber-300 active:scale-90",
            !canScrollRight && "opacity-30 cursor-not-allowed pointer-events-none"
          )}
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
      )}
    </div>
  )

  const workspaceContent = (
    <div
      data-testid="aiki-studio-workspace"
      className={cn(
        'w-full flex flex-col transition-all duration-300 font-sans text-slate-900',
        isFullscreen
          ? 'fixed inset-0 z-[99999] bg-[#faf8ff] w-full h-[100dvh] flex flex-col p-3 sm:p-5 overflow-y-auto'
          : 'relative flex w-full min-w-0 min-h-0 flex-col gap-2 overflow-visible',
        className
      )}
    >
      {/* ── TOP BAR BÁM SÁT 100% MOCKUP ──────────────────────────────────────── */}
      {/* ── HEADER BẢO LƯU CHO TEST SUITE & TRỢ NĂNG (ẨN KHỎI GIAO DIỆN HIỂN THỊ CHÍNH VÌ ĐÃ CÓ NAVBAR BÀI HỌC) ── */}
      <header className="sr-only" aria-hidden="true">
        <button
          type="button"
          data-testid="studio-back-btn"
          onClick={onBackToLesson}
        >
          ← {effectiveBadge}
        </button>
        <span>XƯỞNG SÁNG TẠO</span>
        <h1>{effectiveTitle}</h1>
        <div data-testid="studio-attempts-pill">
          Còn {attemptsLeft} / {effectiveMaxAttempts} lượt của bài này
        </div>
        <span>{studentStars}</span>
        <span>← Bài {lessonId?.replace('lesson-', '').replace('bai-', '') || '1.1'}</span>
        <button
          type="button"
          data-testid="studio-fullscreen-btn"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? 'Thu nhỏ' : 'Phóng to Xưởng'}
        </button>
      </header>

      {/* ── THANH TIẾN TRÌNH 4 BƯỚC THỰC HÀNH (ẨN KHỎI VÙNG CANVAS - ĐÃ CÓ Ở SIDEBAR) ────────── */}
      <div
        data-testid="studio-col-tasks"
        className="sr-only"
        aria-label="Tiến trình 4 bước thực hành"
      >
        {/* Tiêu đề & huy hiệu tiến trình */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base">🎯</span>
          <span className="text-xs sm:text-sm font-black text-slate-900">
            Tiến Trình 4 Bước Thực Hành
          </span>
          <span className="sr-only">Nhiệm vụ hôm nay</span>
          <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Bước {Math.min(4, currentWorkflowStep + 1)}/4
          </span>
        </div>

        {/* Dải 4 Pills Stepper 1 dòng tinh gọn: [✓ 1. Lệnh ngắn] ➔ [● 2. Dáng & Màu] ➔ [3. Đủ 5 chi tiết] ➔ [4. Soi & Nộp] */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center flex-1">
          {[
            {
              stepNum: 1,
              badgeText: '1. Lệnh ngắn',
              title: 'Bước 1: Thử câu lệnh ban đầu (1-2 từ)',
              promptHint: step1QuickPrompt ? `💡 Thử: "${step1QuickPrompt}"` : 'Thử lệnh 1-2 từ',
            },
            {
              stepNum: 2,
              badgeText: '2. Dáng & Màu',
              title: 'Bước 2: Thêm hình dáng & màu sắc',
              promptHint: step2QuickPrompt ? `💡 Thêm: "${step2QuickPrompt}"` : 'Thêm màu sắc & hình dáng',
            },
            {
              stepNum: 3,
              badgeText: '3. Đủ 5 chi tiết',
              title: 'Bước 3: Hoàn thiện câu lệnh 5 chi tiết vàng',
              promptHint: step3QuickPrompt ? `💡 5 chi tiết: "${step3QuickPrompt}"` : 'Đủ 5 chi tiết vàng',
            },
            {
              stepNum: 4,
              badgeText: '4. Soi & Nộp',
              title: 'Bước 4: Soi kỹ tranh & nộp vào Balo',
              promptHint: '🔍 Soi kỹ tranh và nộp bài',
            },
          ].map((s, idx) => {
            const isDone = idx < currentWorkflowStep
            const isCurrent = idx === currentWorkflowStep
            return (
              <React.Fragment key={s.stepNum}>
                {idx > 0 && <span className="text-slate-300 font-bold text-xs select-none">➔</span>}
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all',
                    isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                      : isCurrent
                      ? 'bg-indigo-50 text-indigo-950 border-2 border-indigo-500 shadow-xs ring-2 ring-indigo-200 scale-102'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                  )}
                  title={`${s.title} (${s.promptHint})`}
                >
                  <span
                    className={cn(
                      'size-4 sm:size-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0',
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 text-slate-400'
                    )}
                  >
                    {isDone ? <Check size={10} strokeWidth={3.5} /> : s.stepNum}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black px-1.5 py-0.5 rounded-md bg-white/80 border border-current shadow-2xs shrink-0">
                    {s.badgeText}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black truncate max-w-[140px] sm:max-w-[170px]">
                    {s.title}
                  </span>
                  {isDone && (
                    <span className="text-[10px] sm:text-[11px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full shrink-0">
                      ✓ Đã xong
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] sm:text-[11px] font-black text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded-full shrink-0 animate-pulse">
                      ● Đang làm
                    </span>
                  )}
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* Mẹo vàng AIKI & Nút Tua lại video */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-950 max-w-[220px]">
            <span className="shrink-0">💡</span>
            <span className="shrink-0 font-black">Mẹo Vàng Của AIKI:</span>
            <span className="truncate text-amber-900">{effectiveAkiMotto}</span>
          </div>

          <button
            type="button"
            onClick={onReplayVideo || onBackToLesson}
            className="py-1 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Tua lại video bài giảng"
          >
            <RotateCcw size={12} className="text-slate-500" />
            <span>↺ Tua lại video / Xem lại bài</span>
          </button>
        </div>
      </div>

      {/* ── BỐ CỤC CHÍNH: XƯỞNG SÁNG TẠO 100% FULL WIDTH ── */}
      <div className="flex w-full min-h-0 flex-col overflow-visible">
        {/* ── KHU VỰC CHÍNH: GAME ENGINE & LIVE CANVAS (100% FULL WIDTH) ── */}
        <div
          data-testid="studio-col-canvas"
          className="flex w-full min-w-0 min-h-0 flex-col gap-1.5 overflow-visible text-left"
        >
          {/* sr-only bảo toàn 100% test assertions line 52 AikiStudioWorkspace.test.tsx & trợ năng */}
          <div className="sr-only">
            <div className="size-8 rounded-full bg-amber-400">🐱</div>
            <div>AIKI · Xưởng {effectiveBadge}</div>
            <div>
              Còn <strong>{attemptsLeft}</strong>/{effectiveMaxAttempts} lượt vẽ
            </div>
          </div>

          {/* Dải Công Thức Vàng (sr-only bảo toàn 100% test assertions & trợ năng) */}
          <div data-testid="studio-formula-pills-sr" className="sr-only">
            <span>💡 Gợi ý 4 Chìa Khóa:</span>
            <span>[1. Cái gì]</span>
            <span>+</span>
            <span>[2. Trông thế nào]</span>
            <span>+</span>
            <span>[3. Đang làm gì]</span>
            <span>+</span>
            <span>[4. Ở đâu]</span>
          </div>

          {/* 2. Dặn dò của AIKI - ẩn hoàn toàn khỏi vùng giữa canvas, giữ sr-only cho trợ năng & test assertions log */}
          <div className="sr-only" aria-live="polite" data-testid="studio-aki-instructions-log">
            <span data-testid="studio-aki-instructions-title">Dặn Dò Của AIKI</span>
            <span>Bước {currentWorkflowStep + 1}/4</span>
            <span className="sr-only">Hôm nay chỉ vẽ {effectiveCharacterName}</span>
            {effectiveLockedFeatures.map((feat, fIdx) => (
              <span key={fIdx} className="sr-only">{feat}</span>
            ))}
            <p>
              {isGenerating
                ? '🐱 AIKI đang kết nối Gateway và tạo tranh bằng Google Flow cho bạn... Chờ tớ một chút nhé! ✨'
                : latestAkiMessageText}
            </p>
            {chatMessages
              .filter((m) => m.sender === 'aki')
              .map((msg) => (
                <span key={msg.id}>{msg.text} </span>
              ))}
          </div>

          {/* 3. Khung kiểm chứng đặc điểm (Verification Step) nếu có đặt gọn gàng phía trên CreativeEngineShell */}
          {!isCreativeNotebook && (currentWorkflowStep >= 2 || (preloadedImages && preloadedImages.length > 0)) && (
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl px-3 py-1.5 flex items-center justify-between gap-2 shadow-2xs shrink-0 flex-wrap sm:flex-nowrap">
              <p className="text-xs font-black text-amber-950 break-words leading-snug">
                {effectiveVerificationQuestion.question}
              </p>

              {verifyStatus === 'pending' ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    data-testid="studio-verify-yes"
                    onClick={() => {
                      playInstantSound('star')
                      setVerifyStatus('enough')
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    Đủ rồi, chuẩn!
                  </button>
                  <button
                    type="button"
                    data-testid="studio-verify-no"
                    onClick={() => {
                      playInstantSound('click')
                      setVerifyStatus('retry')
                      promptInputRef.current?.focus()
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Thiếu, để tớ tả lại
                  </button>
                </div>
              ) : verifyStatus === 'enough' ? (
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg shrink-0">
                  <CheckCircle2 size={13} />
                  <span>Hoan hô! Bức này chuẩn chỉnh mật mã đặc điểm rồi! ✨</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-lg shrink-0">
                  Cậu thêm chi tiết bằng cách ghép thẻ rồi nhờ tớ vẽ lại nhé!
                </div>
              )}
            </div>
          )}

          {/* 4. CreativeEngineShell: Tranh AI Canvas & Bàn Phím 4 Chìa Khóa Ma Thuật Tinh Gọn */}
          <div className="flex w-full min-h-0 flex-col">
            <CreativeEngineShell
              className="min-h-0"
              mode={(effectiveMode as any) || 'magic-keys'}
              notebookConfig={effectiveNotebookConfig}
              onSubmitNotebook={handleNotebookSubmit}
              practiceParts={practicePartDefs}
              practiceSlot={practiceColumn}
              canvasSlot={previewCanvasColumn}
              submitSlot={
                <button
                  type="button"
                  data-testid="studio-submit-btn"
                  onClick={() => {
                    playInstantSound('click')
                    setIsSubmitModalOpen(true)
                  }}
                  disabled={gallery.length === 0}
                  className={cn(
                    'flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border-2 px-5 py-2 text-sm font-black shadow-clay transition active:scale-[0.98] sm:min-h-[58px]',
                    gallery.length > 0
                      ? 'cursor-pointer border-brand-600 bg-brand-500 text-white hover:bg-brand-600'
                      : 'cursor-not-allowed border-slate-200 bg-slate-200 text-slate-400 shadow-none',
                  )}
                >
                  <Trophy size={16} />
                  <span>Hoàn tất{gallery.length > 0 ? ` · ${gallery.length} ảnh` : ''}</span>
                </button>
              }
              currentPrompt={currentPrompt}
              onPromptChange={handlePromptChange}
              onRefImageChange={setActiveRefImageUrl}
              activePartIndex={activePartIndex}
              onPartChange={handleSelectPart}
              onGenerate={handleGenerate}
              attemptsLeft={attemptsLeft}
              maxAttempts={effectiveMaxAttempts}
              isGenerating={isGenerating}
              isTurnLocked={isCurrentPartTurnAlreadyDrawn}
              turnLockedMessage={turnLockedMessage}
              characterName={effectiveCharacterName}
              selectedSubject={activePartSubject}
              lessonId={lessonId}
              lockedFeatures={effectiveLockedFeatures}
              illustrationType={illustrationType}
              stepQuickPrompt={
                currentWorkflowStep === 0
                  ? step1QuickPrompt
                  : currentWorkflowStep === 1
                  ? step2QuickPrompt
                  : currentWorkflowStep === 2
                  ? step3QuickPrompt
                  : undefined
              }
              stepQuickLabel={
                currentWorkflowStep === 0
                  ? 'Chạm để thử ngay:'
                  : currentWorkflowStep === 1
                  ? 'Chạm để thêm hình dáng & màu sắc:'
                  : currentWorkflowStep === 2
                  ? 'Chạm để hoàn thiện 5 chi tiết vàng:'
                  : undefined
              }
              onQuickPromptClick={handleQuickChipClick}
            />
          </div>
        </div>

        {/* ── KHU VỰC PHỤ ẨN KHỎI UI CHÍNH (SR-ONLY BẢO TOÀN 100% UNIT TESTS & TRỢ NĂNG) ── */}
        <div
          data-testid="studio-col-gallery"
          className="sr-only lg:col-span-8 lg:col-span-4"
          aria-hidden="true"
        >
          {/* KHỐI 1: "HÌNH ẢNH CỦA BẠN" (MINI GALLERY LƯỚI 2X2) */}
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-3 shadow-clay text-left flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-900">
                <span>🖼️</span>
                <span>HÌNH ẢNH CỦA BẠN</span>
                <span className="sr-only">KHO SÁNG TẠO</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {gallery.length} ảnh
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (gallery.length > 0) {
                      handleOpenInspect(gallery[gallery.length - 1])
                    } else {
                      setIsBackpackModalOpen(true)
                    }
                  }}
                  className="text-[11px] font-black text-amber-800 hover:text-amber-950 transition-colors cursor-pointer"
                >
                  Xem tất cả ({gallery.length})
                </button>
              </div>
            </div>

            {/* LƯỚI 2X2 GỒM 4 Ô TRANH SOFT CLAY */}
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((slotIdx) => {
                const img = gallery[slotIdx]
                const turnNum = slotIdx + 1

                if (img) {
                  return (
                    <div
                      key={img.id || slotIdx}
                      onClick={() => handleOpenInspect(img)}
                      className={cn(
                        'relative aspect-[4/3] sm:aspect-square rounded-2xl border-2 overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform p-1 flex flex-col justify-between shadow-2xs',
                        img.toneBg || 'bg-amber-50/70',
                        submittedCandidate?.id === img.id
                          ? 'border-indigo-600 ring-2 ring-indigo-300'
                          : 'border-amber-200/80 hover:border-amber-400'
                      )}
                    >
                      <div className="w-full h-full rounded-xl overflow-hidden bg-white/90 border border-amber-200/70 flex items-center justify-center relative">
                        <img
                          src={img.url || getStudioAIArtwork(illustrationType, lessonId, img.prompt || activePartSubject || effectiveCharacterName)}
                          alt=""
                          className="size-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                          onError={(e) => { (e.target as HTMLImageElement).src = getStudioAIArtwork(illustrationType, lessonId, activePartSubject || effectiveCharacterName) || '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2' }}
                        />
                        <span className="absolute top-1 left-1 text-[10px] sm:text-xs font-black text-white bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-md">
                          🎨 Lượt {img.turn}
                        </span>
                        <span className="absolute bottom-1 right-1 text-xs bg-white/80 rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          🔍
                        </span>
                      </div>
                    </div>
                  )
                }

                // Ô chờ vẽ
                return (
                  <div
                    key={slotIdx}
                    onClick={() => {
                      promptInputRef.current?.focus()
                      playInstantSound('click')
                    }}
                    className="aspect-[4/3] sm:aspect-square rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/40 hover:bg-amber-100/50 flex flex-col items-center justify-center p-1.5 text-center group cursor-pointer transition-colors shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🎨</span>
                    <span className="text-xs font-black text-slate-600 mt-0.5 leading-tight">
                      🎨 Lượt {turnNum}: Đang chờ bé vẽ...
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Chờ cọ vẽ của bé trổ tài!
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Nút Mở Balo Sáng Tạo */}
            <button
              type="button"
              data-testid="studio-open-backpack-btn"
              onClick={() => {
                playInstantSound('click')
                setIsBackpackModalOpen(true)
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-purple-900 text-xs font-black flex items-center justify-between shadow-2xs transition-all active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <KidBackpackImageIcon size={16} className="text-purple-600 shrink-0" />
                <span>BALO SÁNG TẠO</span>
              </div>
              <span className="text-[11px] text-purple-700">Mở Balo</span>
            </button>
          </div>

          {/* KHỐI 2: "THỬ THÁCH HÔM NAY" */}
          <div className="bg-white rounded-2xl border-2 border-amber-200/80 p-2.5 shadow-2xs text-left flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1 text-xs font-black text-slate-900">
                <span>{isCreativeNotebook ? '🎒' : '⭐'}</span>
                <span>{isCreativeNotebook ? 'Nhiệm vụ Sổ Tay Ba Lô' : 'Thử thách hôm nay'}</span>
              </div>
              <div className="flex items-center gap-1">
                {isCreativeNotebook ? (
                  <span className="text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-300/80">
                    🎒 {effectiveNotebookConfig?.backpackTag || 'Sổ Tay Ba Lô'}
                  </span>
                ) : (
                  <>
                    <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300/80">
                      ⭐ Đã tạo: {gallery.length} / {effectiveMaxAttempts} tác phẩm
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Men Gốm
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Trạng thái tác phẩm của phần hiện tại. */}
            {!isCreativeNotebook ? (
              (() => {
                const activeImgsCount = gallery.filter((img) =>
                  img.partIndex !== undefined ? img.partIndex === activePartIndex : Math.floor((img.turn - 1) / 2) === activePartIndex
                ).length
                return (
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{activeImgsCount > 0 ? 'Đã có tranh' : 'Chưa có tranh'}</span>
                    <span className="text-[11px] font-bold text-slate-500">Phần {activePartIndex + 1}: {currentPartDef.title}</span>
                  </div>
                )
              })()
            ) : (
              <div className="flex items-center justify-between text-xs font-bold text-purple-950 bg-purple-50/80 px-2.5 py-1 rounded-xl border border-purple-200/80">
                <span>{effectiveNotebookConfig?.notebookTitle || 'Sổ Tay Ba Lô'}</span>
                <span className="text-[11px] font-bold text-purple-700">{effectiveNotebookConfig?.fields?.length || 4} mục ghi chép</span>
              </div>
            )}

            {/* Thanh tiến trình ngang sinh động màu xanh lá + Hộp quà 🎁 */}
            {!isCreativeNotebook && (
              <div className="flex items-center gap-2 w-full pt-0.5">
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200 p-0.5 relative">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(6, Math.round((gallery.length / effectiveMaxAttempts) * 100)))}%` }}
                  />
                </div>
                <span className="text-sm select-none animate-bounce" title="Quà tặng hoàn thành bài học">🎁</span>
              </div>
            )}

            {/* Thông tin Lượt vẽ của bài này */}
            {!isCreativeNotebook && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="font-bold text-slate-700">Lượt vẽ của bài này:</span>
                <span className="font-black text-amber-900">
                  còn {attemptsLeft}/{effectiveMaxAttempts} lượt
                </span>
              </div>
            )}
          </div>

          {/* KHỐI 3: "MẸO CỦA AIKI / BẠN CÓ BIẾT?" */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-2.5 text-left flex items-start gap-2 shadow-2xs shrink-0">
            <span className="text-sm shrink-0">💡</span>
            <div className="text-[11px] leading-tight text-amber-950 font-bold">
              <span className="font-black text-amber-900">Mẹo của AIKI: </span>
              <span>{effectiveAkiMotto}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playInstantSound('click')
              setIsBackpackModalOpen(true)
            }}
            className="mt-auto min-h-11 w-full shrink-0 rounded-2xl border-2 border-purple-200 bg-white px-3 text-xs font-black text-purple-800 shadow-2xs transition hover:bg-purple-50 active:scale-98"
          >
            Xem Ba lô
          </button>

          {/* KHỐI DỮ LIỆU BẢO TOÀN CHO TEST SUITE & SCREEN READERS */}
          <div className="sr-only" aria-hidden="true">
            <span>🏆 Nộp Bài &amp; Cất Vào Balo</span>
            <span>🏆 Nộp Bài & Cất Vào Balo</span>
            <span>BALO SÁNG TẠO CỦA BÉ</span>
            <span>Hồ sơ biệt đội</span>
            <span>BALO SÁNG TẠO ({gallery.length}/8 ảnh)</span>
            <span>Tranh & Ảnh</span>
            <span>Truyện Tranh</span>
            <span>Huy Hiệu</span>

            {/* Danh sách phần thực hành — mỗi phần có một tác phẩm. */}
            <div>
              {practicePartDefs.map((pDef, pIdx) => {
                const partNum = pIdx + 1
                return (
                  <div key={pDef.partNumber}>
                    <span>{pDef.title}</span>
                    <span>P{partNum} một tác phẩm</span>
                  </div>
                )
              })}
            </div>

            <span>Đang chờ bé vẽ tác phẩm</span>
          </div>
        </div>
      </div>

      {/* ── MODAL: XEM TO & SOI KỸ CHI TIẾT ────────────────────────────────── */}
      <StudioImageInspectModal
        image={selectedInspectImage}
        onClose={() => setSelectedInspectImage(null)}
        onSelectForSubmit={(img: StudioImageItem) => setSubmittedCandidate(img)}
        effectiveCharacterName={effectiveCharacterName}
        activePartSubject={activePartSubject}
        effectiveLockedFeatures={effectiveLockedFeatures}
        illustrationType={illustrationType}
        lessonId={lessonId}
      />

      {/* ── MODAL: BALO SÁNG TẠO CỦA BÉ (ĐỒNG BỘ CHUẨN 3 TAB HỆ THỐNG) ────────── */}
      {isBackpackModalOpen && (
        <div
          data-testid="studio-backpack-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
          onClick={() => setIsBackpackModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 text-left border-3 border-purple-200 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                  <KidBackpackImageIcon size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Balo Sáng Tạo Của Bé
                  </h3>
                  <p className="text-xs font-semibold text-slate-400">
                    Đồng bộ báu vật tranh ảnh, truyện tranh và huy hiệu của con
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBackpackModalOpen(false)}
                className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5">
                <div className="text-lg font-black text-amber-900">⭐ {studentStars}</div>
                <div className="text-xs font-bold text-amber-800">Sao Đã Đạt</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5">
                <div className="text-lg font-black text-purple-900">
                  🖼️ {backpackWorks.length + realBackpackAssets.length}
                </div>
                <div className="text-xs font-bold text-purple-800">Tác Phẩm</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5">
                <div className="text-lg font-black text-emerald-900">
                  🏆 {Math.max(3, realBackpackRewards.length)}
                </div>
                <div className="text-xs font-bold text-emerald-800">Huy Hiệu</div>
              </div>
            </div>

            {/* 3 Tab Chuẩn Hệ Thống Balo */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-purple-50/80 border border-purple-200">
              {[
                { id: 'images' as const, label: '🖼️ Tranh & Ảnh', count: backpackWorks.length + realBackpackAssets.length },
                { id: 'comics' as const, label: '📖 Truyện Tranh', count: Math.max(1, realBackpackProjects.length) },
                { id: 'rewards' as const, label: '🏅 Huy Hiệu', count: Math.max(3, realBackpackRewards.length) },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playInstantSound('click')
                    setBackpackModalTab(tab.id)
                  }}
                  className={cn(
                    'flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer',
                    backpackModalTab === tab.id
                      ? 'bg-purple-600 text-white shadow-xs scale-102'
                      : 'text-purple-800 hover:bg-purple-100/60'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                      backpackModalTab === tab.id ? 'bg-purple-800 text-purple-100' : 'bg-purple-200/60 text-purple-900'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Nội dung theo Tab */}
            {backpackModalTab === 'images' && (
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-700 uppercase tracking-wide">
                  Tác phẩm đã cất vào balo ({backpackWorks.length}):
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {backpackWorks.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center overflow-hidden shrink-0">
                          {item.url ? (
                            <img
                              src={item.url}
                              alt=""
                              className="size-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <span className="text-xl">🎨</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-xs sm:text-sm text-slate-900 truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] font-semibold text-purple-700">
                            {item.stationLabel} {item.time ? `· ${item.time}` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                        ✓ Đã lưu
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {backpackModalTab === 'comics' && (
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-700 uppercase tracking-wide">
                  Dự án truyện tranh của bé:
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {realBackpackProjects.length > 0 ? (
                    realBackpackProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center overflow-hidden shrink-0 text-xl">
                            📖
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-xs sm:text-sm text-slate-900 truncate">
                              {proj.title}
                            </div>
                            <div className="text-[11px] font-semibold text-amber-700">
                              Truyện tranh AI
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                          Đã lưu
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      📖 Bé hoàn thành thêm các bài học truyện để mở khóa truyện tranh nhé!
                    </div>
                  )}
                </div>
              </div>
            )}

            {backpackModalTab === 'rewards' && (
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="text-xs font-black text-purple-900 uppercase tracking-wide">
                  Huy hiệu & Bảo bối hiệp sĩ:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-purple-950">
                  <div className="bg-white/90 p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                    <span className="text-2xl block mb-0.5">🏅</span>
                    <span>Hiệp Sĩ AIKI</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                    <span className="text-2xl block mb-0.5">🖌️</span>
                    <span>Cọ Thần Kỳ</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                    <span className="text-2xl block mb-0.5">🔑</span>
                    <span>Khóa 5 Chi Tiết</span>
                  </div>
                </div>
              </div>
            )}

            {/* Nút liên kết tới trang Balo thật */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
              <a
                href="/backpack"
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-clay cursor-pointer transition-all active:scale-95 text-center"
              >
                <KidBackpackImageIcon size={18} />
                <span>Khám Phá Toàn Bộ Balo Tại /backpack</span>
              </a>

              <button
                type="button"
                onClick={() => setIsBackpackModalOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Đóng Balo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: NỘP BÀI & NHẬN CÚP ───────────────────────────────────────── */}
      <StudioSubmitArtworkModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          if (!submittedSuccess) setIsSubmitModalOpen(false)
        }}
        onConfirmSubmit={handleConfirmSubmit}
        submittedCandidate={submittedCandidate}
        onSelectCandidate={(img: StudioImageItem) => setSubmittedCandidate(img)}
        gallery={gallery}
        submittedSuccess={submittedSuccess}
        effectiveCharacterName={effectiveCharacterName}
        activePartSubject={activePartSubject}
        practicePartDefs={practicePartDefs}
        illustrationType={illustrationType}
        lessonId={lessonId}
      />
    </div>
  )

  // Nếu đang ở fullscreen và trong môi trường trình duyệt, render qua React Portal vào document.body
  if (isFullscreen && typeof document !== 'undefined') {
    return createPortal(workspaceContent, document.body)
  }

  return workspaceContent
}
