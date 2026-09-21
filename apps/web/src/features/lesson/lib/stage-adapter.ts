import type { LessonSixStageJourney } from '@/shared/lib/api'
import type {
  JourneyStageDefinition,
  GoalStageConfig,
  ConfirmStageConfig,
  VideoStageConfig,
  QuizStageConfig,
  PracticeStageConfig,
  RewardStageConfig,
  FormulaCardItem,
  ConfirmOptionItem,
  ParsedGoalCard,
} from '../types/stage-schema'
import { getAikiStudioConfig } from '../data/aiki-studio-configs'
import { getDefaultPracticeParts } from './practice-parts'
import { getCreativeEngineMode } from '../components/creative-engine/data/engine-presets'
import { DEFAULT_NOTEBOOK_CONFIGS } from '../data/island-curriculum-registry'
import type { CreativeNotebookConfig } from '../components/creative-engine/types'

export const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false
  const trimmed = url.trim()
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  )
}

export function parseGoalCard(raw: string, defaultIdx: number): ParsedGoalCard {
  let text = raw.trim()
  let index = defaultIdx + 1
  const idxMatch = text.match(/^\[(\d+)\]\s*/)
  if (idxMatch) {
    index = parseInt(idxMatch[1], 10)
    text = text.slice(idxMatch[0].length).trim()
  }

  let note: string | undefined
  const noteMatch = text.match(/\s*\(([^)]+)\)\s*$/)
  if (noteMatch) {
    note = noteMatch[1].trim()
    text = text.slice(0, noteMatch.index).trim()
  }

  let title = text
  let content: string | undefined
  if (text.includes('—')) {
    const parts = text.split('—')
    title = parts[0].trim()
    content = parts.slice(1).join('—').trim()
  } else if (text.includes(':')) {
    const parts = text.split(':')
    title = parts[0].trim()
    content = parts.slice(1).join(':').trim()
  }

  return { index, title, content, note }
}

export const GOAL_CARD_STYLES = [
  {
    bg: 'bg-blue-50/90 border-blue-200 text-blue-950',
    badge: 'bg-blue-500 text-white shadow-2xs',
  },
  {
    bg: 'bg-amber-50/90 border-amber-200 text-amber-950',
    badge: 'bg-amber-500 text-white shadow-2xs',
  },
  {
    bg: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
    badge: 'bg-emerald-500 text-white shadow-2xs',
  },
  {
    bg: 'bg-orange-50/90 border-orange-200 text-orange-950',
    badge: 'bg-orange-500 text-white shadow-2xs',
  },
  {
    bg: 'bg-rose-50/90 border-rose-200 text-rose-950',
    badge: 'bg-rose-500 text-white shadow-2xs',
  },
  {
    bg: 'bg-purple-50/90 border-purple-200 text-purple-950',
    badge: 'bg-purple-500 text-white shadow-2xs',
  },
] as const

export function buildVideoEmbedUrl(url?: string, seekSec?: number | null): string {
  let raw = url || ''
  if (raw) {
    const youtuBeMatch = raw.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
    if (youtuBeMatch) {
      raw = `https://www.youtube-nocookie.com/embed/${youtuBeMatch[1]}`
    } else {
      const watchMatch = raw.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
      if (watchMatch) {
        raw = `https://www.youtube-nocookie.com/embed/${watchMatch[1]}`
      } else if (!raw.includes('/embed/')) {
        if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
          raw = `https://www.youtube-nocookie.com/embed/${raw}`
        }
      }
    }
  } else {
    raw = 'https://www.youtube-nocookie.com/embed/NMdHhsLY5jc'
  }

  if (seekSec === null || seekSec === undefined) {
    return raw
  }
  const delimiter = raw.includes('?') ? '&' : '?'
  return `${raw}${delimiter}start=${seekSec}&autoplay=1`
}

export interface LessonAdaptInfo {
  lessonId?: string
  lessonTitle?: string
  stationInfo?: {
    lessonNumber?: string
    stationLabel?: string
  }
  matchedCurriculum?: {
    lessonNumber?: string
    journey?: Partial<LessonSixStageJourney>
  }
}

/**
 * Transforms a LessonSixStageJourney + lessonInfo into an array of JourneyStageDefinition.
 * All lesson-specific heuristics (e.g., 4-keys rules, fallback images, lock prompts)
 * are processed and bundled here so that the render tree stays completely declarative.
 */
export function adaptSixStageJourneyToStages(
  journey: LessonSixStageJourney,
  info: LessonAdaptInfo = {}
): JourneyStageDefinition[] {
  const { lessonId = '', lessonTitle = '', stationInfo, matchedCurriculum } = info

  // Heuristic detections isolated in adapter
  const isLesson1_1 =
    stationInfo?.lessonNumber === '1.1' ||
    matchedCurriculum?.lessonNumber === '1.1' ||
    lessonId === 'bai-1-1' ||
    lessonId.startsWith('bai-1-1-') ||
    (lessonTitle.includes('1.1') && !lessonTitle.includes('1.2')) ||
    ((journey.stage1_goal?.title || '').includes('1.1') && !(journey.stage1_goal?.title || '').includes('1.2')) ||
    (lessonTitle.toLowerCase().includes('mèo') &&
      !lessonTitle.includes('1.') &&
      !lessonTitle.includes('2.') &&
      !lessonTitle.includes('3.') &&
      !lessonTitle.includes('4.') &&
      !lessonTitle.includes('5.'))

  const isLesson1_2 =
    stationInfo?.lessonNumber === '1.2' ||
    matchedCurriculum?.lessonNumber === '1.2' ||
    lessonId === 'bai-1-2' ||
    lessonId.startsWith('bai-1-2-') ||
    lessonTitle.includes('1.2') ||
    (journey.stage1_goal?.title || '').includes('1.2') ||
    (!isLesson1_1 &&
      (lessonTitle.toLowerCase().includes('bốn chiếc chìa khoá') ||
        lessonTitle.toLowerCase().includes('bốn chiếc chìa khóa') ||
        (journey.stage1_goal?.title || '').toLowerCase().includes('bốn chiếc chìa khoá') ||
        (journey.stage1_goal?.title || '').toLowerCase().includes('bốn chiếc chìa khóa') ||
        (lessonId.includes('1-2') && !lessonId.includes('1-1'))))

  const isFourKeysLesson = isLesson1_1 || isLesson1_2

  // Stage 0: Goal
  const cleanPoint = (raw?: string, fallback = '') => {
    if (!raw) return fallback
    const match = raw.match(/:\s*['"“](.+?)['"”]$/) || raw.match(/:\s*(.+)$/)
    return match ? `“${match[1]}”` : raw
  }
  const kp = journey.stage1_goal?.keyPoints || []
  const formulaCards: FormulaCardItem[] = [
    {
      id: 'slot-1',
      icon: '🔵',
      code: 'CÁI GÌ',
      sub: 'Ai, đồ vật gì',
      val: cleanPoint(kp[0], 'Chủ thể chính của bức tranh'),
      color: '#3FA9F5',
      bg: 'bg-blue-50/80 border-blue-200 text-blue-950',
      badge: 'bg-blue-600 text-white',
      image: isLesson1_1
        ? '/assets/aiki-keys/key_subject_cat.jpg'
        : '/assets/aiki-keys/key_what_blue.jpg',
    },
    {
      id: 'slot-2',
      icon: '🟡',
      code: 'TRÔNG THẾ NÀO',
      sub: 'Màu sắc, hình dáng',
      val: cleanPoint(kp[1], 'Đặc điểm ngoại hình, màu sắc'),
      color: '#F5C93E',
      bg: 'bg-amber-50/80 border-amber-200 text-amber-950',
      badge: 'bg-amber-600 text-white',
      image: '/assets/aiki-keys/key_how_yellow.jpg',
    },
    {
      id: 'slot-3',
      icon: '🟠',
      code: 'ĐANG LÀM GÌ',
      sub: 'Hành động',
      val: cleanPoint(kp[2], 'Hành động hoặc tư thế'),
      color: '#FF9427',
      bg: 'bg-orange-50/80 border-orange-200 text-orange-950',
      badge: 'bg-orange-600 text-white',
      image: '/assets/aiki-keys/key_action_orange.jpg',
    },
    {
      id: 'slot-4',
      icon: '🔴',
      code: 'Ở ĐÂU',
      sub: 'Bối cảnh, nơi chốn',
      val: cleanPoint(kp[3], 'Khung cảnh xung quanh'),
      color: '#FF6FA5',
      bg: 'bg-rose-50/80 border-rose-200 text-rose-950',
      badge: 'bg-rose-600 text-white',
      image: '/assets/aiki-keys/key_where_pink.jpg',
    },
  ]
  const parsedCards: ParsedGoalCard[] = kp.map((p, idx) => parseGoalCard(p, idx))

  const goalConfig: GoalStageConfig = {
    title: journey.stage1_goal?.title || 'Mục tiêu bài học',
    goalText: journey.stage1_goal?.goalText || '',
    imageUrl: journey.stage1_goal?.imageUrl || '',
    fallbackImageUrl: isLesson1_2
      ? '/assets/aiki-islands/island1_lesson2_keys_v2.jpg'
      : '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
    speech: journey.stage1_goal?.speech || 'Chào bạn nhỏ! Cùng AIKI khám phá mục tiêu và điểm vàng bài học hôm nay nhé!',
    isFourKeys: isFourKeysLesson,
    formulaCards,
    parsedCards,
    keyPoints: kp,
  }

  // Stage 1: Confirm Goal
  const confirmOptions: ConfirmOptionItem[] = (journey.stage2_confirmGoal?.options || []).map(
    (option, idx) => {
      const optId = option.id || `opt-${idx}`
      if (option.imageUrl) {
        return { id: optId, text: option.text, imageUrl: option.imageUrl, keyItems: option.keyItems }
      }
      if (option.keyItems && option.keyItems.length > 0) {
        return { id: optId, text: option.text, imageUrl: option.imageUrl, keyItems: option.keyItems }
      }
      if (option.text && option.text.includes('·')) {
        const parts = option.text.split(':')
        const title = parts[0]?.trim() || option.text
        const keys = (parts[1] || '').split('·').map((k) => k.trim()).filter(Boolean)
        if (keys.length > 0) {
          const colors = ['#3FA9F5', '#F5C93E', '#FF9427', '#FF6FA5']
          return {
            id: optId,
            text: title,
            imageUrl: option.imageUrl,
            keyItems: keys.map((k, i) => ({ label: k, color: colors[i % colors.length] })),
          }
        }
      }
      return { id: optId, text: option.text, imageUrl: option.imageUrl, keyItems: option.keyItems }
    }
  )

  const hasKeyOptions =
    !isLesson1_1 &&
    (isLesson1_2 ||
      confirmOptions.some(
        (opt) =>
          (opt.keyItems && opt.keyItems.length > 0) ||
          Boolean(opt.imageUrl && (opt.imageUrl.includes('key') || opt.imageUrl.includes('4keys'))) ||
          opt.text.toLowerCase().includes('chìa khoá') ||
          opt.text.toLowerCase().includes('chìa khóa')
      ))

  const subPrompt = isLesson1_2
    ? 'Chiếc Rương Thần Kỳ ở chặng trước có 3 ổ khóa (A, B, C). Bạn hãy dùng đúng 4 Chiếc Chìa Khóa Vàng vừa tìm thấy để mở Ổ Khóa B nhé!'
    : 'Học sinh hãy chọn 1 đáp án chính xác nhất để chuẩn bị bước vào xem video nhé!'

  const confirmConfig: ConfirmStageConfig = {
    question: journey.stage2_confirmGoal?.question || '',
    subPrompt,
    hasKeyOptions,
    options: confirmOptions,
    correctIndex: journey.stage2_confirmGoal?.correctIndex ?? 0,
    explanation: journey.stage2_confirmGoal?.explanation || '',
    speech: journey.stage2_confirmGoal?.speech || 'Bé hãy chọn phương án chính xác nhất để chuẩn bị bước vào xem video nhé!',
  }

  // Stage 2: Video
  const isDedicatedLessonVideo = (() => {
    const num = stationInfo?.lessonNumber
    if (num === '1.2' || num === '1.3') return true
    if (isLesson1_2) return true
    const lId = lessonId.toLowerCase()
    if (lId.includes('1-2') || lId.includes('1.2') || lId.includes('1-3') || lId.includes('1.3')) return true
    const sId = (journey.stage3_video?.id || '').toLowerCase()
    if (sId.includes('bai-1-2') || sId.includes('bai-1-3') || sId.includes('1-2') || sId.includes('1-3')) return true
    const vid = journey.stage3_video?.videoUrl || ''
    if (vid.includes('GCtez_WirtU')) return true
    const title = ((stationInfo?.stationLabel || '') + ' ' + lessonTitle).toLowerCase()
    if (
      title.includes('1.2') ||
      title.includes('1.3') ||
      title.includes('bốn chiếc chìa khoá') ||
      title.includes('bốn chiếc chìa khóa') ||
      title.includes('úm ba la')
    ) {
      return true
    }
    return false
  })()

  const videoChapters =
    journey.stage3_video?.timestamps && journey.stage3_video.timestamps.length > 0
      ? journey.stage3_video.timestamps
      : [
          { label: 'Tình huống mở đầu', startSec: 0, endSec: 30 },
          { label: 'Khám phá bí kíp', startSec: 30, endSec: 75 },
          { label: 'Quy tắc 4 chìa khóa', startSec: 75, endSec: 120 },
          { label: 'Thực hành cùng AIKI', startSec: 120, endSec: 150 },
          { label: 'Mẹo tránh lỗi đoán mò', startSec: 150, endSec: 175 },
          { label: 'Tổng kết bài học', startSec: 175, endSec: 180 },
        ]

  const totalDurationSec =
    journey.stage3_video?.durationSec && journey.stage3_video.durationSec > 0
      ? journey.stage3_video.durationSec
      : videoChapters[videoChapters.length - 1]?.endSec || 180

  const videoConfig: VideoStageConfig = {
    title: journey.stage3_video?.title || 'Video Bài Giảng',
    videoUrl: journey.stage3_video?.videoUrl || '',
    videoEmbedUrl: buildVideoEmbedUrl(journey.stage3_video?.videoUrl),
    durationSec: totalDurationSec,
    posterUrl: journey.stage3_video?.posterUrl,
    timestamps: videoChapters,
    isDedicatedLessonVideo,
    speech:
      journey.stage3_video?.timestamps?.[0]?.speech ||
      'Cùng AIKI xem video bài giảng để mở khóa các bí kíp câu lệnh thần kỳ nào!',
  }

  // Stage 3: Quiz
  const quizQuestions = (journey.stage4_quiz?.questions || []).map((q, idx) => ({
    id: q.id || `quiz-q-${idx}`,
    prompt: q.prompt,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    visualUrl: q.visualUrl,
  }))

  const quizConfig: QuizStageConfig = {
    title: journey.stage4_quiz?.title || 'Bài Test Thử Tài',
    questions: quizQuestions,
    passScore: journey.stage4_quiz?.passScore ?? 2,
    speech: 'Thử tài trí nhớ của bé qua các câu hỏi trắc nghiệm để mở khóa Xưởng Sáng Tạo AI!',
  }

  // Stage 4: Practice
  const effectiveCreativeMode =
    journey.stage5_practice?.creativeEngineMode ||
    matchedCurriculum?.journey?.stage5_practice?.creativeEngineMode ||
    getCreativeEngineMode(matchedCurriculum?.lessonNumber || lessonId)
  const isCreativeNotebook = effectiveCreativeMode === 'creative-notebook'

  const defaultPracticeParts = isCreativeNotebook
    ? []
    : journey.stage5_practice?.practiceParts && journey.stage5_practice.practiceParts.length > 0
    ? journey.stage5_practice.practiceParts.map((p, idx) => ({
        id: p.id,
        partNumber: p.partNumber || idx + 1,
        title: p.title,
        icon: p.icon || p.emoji || '🎨',
        iconImage: p.iconImage,
        emoji: p.emoji || p.icon || '🎨',
      }))
    : getDefaultPracticeParts(lessonId, journey.stage5_practice?.subjectName || lessonTitle, effectiveCreativeMode)

  const baseStudioConfig = getAikiStudioConfig(lessonId, lessonTitle)
  const practiceData = journey.stage5_practice
  const studioConfig = practiceData
    ? {
        ...baseStudioConfig,
        subjectName: practiceData.subjectName || baseStudioConfig.subjectName,
        badge: practiceData.badge || baseStudioConfig.badge,
        lockedFeatures: practiceData.lockedFeatures?.length ? practiceData.lockedFeatures : baseStudioConfig.lockedFeatures,
        akiMotto: practiceData.akiMotto || baseStudioConfig.akiMotto,
        illustrationType: (practiceData.illustrationType as any) || baseStudioConfig.illustrationType,
        notebookConfig: practiceData.notebookConfig,
        practiceWorkflow: practiceData.workflowSteps?.length
          ? {
              steps: practiceData.workflowSteps.map((ws, i) => ({
                stepIndex: ws.step || i + 1,
                taskLabel: ws.title,
                akiInstruction: ws.akiSpeech,
                quickPrompt: ws.quickPrompt,
                sampleResultUrl:
                  practiceData.sampleUrl ||
                  baseStudioConfig.preloadedImages?.[i]?.url ||
                  baseStudioConfig.preloadedImages?.[0]?.url ||
                  '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
                akiFeedback: ws.instruction,
              })),
            }
          : baseStudioConfig.practiceWorkflow,
      }
    : baseStudioConfig

  const matchedKey = matchedCurriculum?.lessonNumber
  const effectiveNotebookConfig: CreativeNotebookConfig | undefined =
    journey.stage5_practice?.notebookConfig ||
    matchedCurriculum?.journey?.stage5_practice?.notebookConfig ||
    (matchedKey ? DEFAULT_NOTEBOOK_CONFIGS[matchedKey] : undefined) ||
    (lessonId ? DEFAULT_NOTEBOOK_CONFIGS[lessonId] : undefined) ||
    (lessonId ? DEFAULT_NOTEBOOK_CONFIGS[lessonId.replace('bai-', '').replace('lesson-', '').replace('-', '.')] : undefined) ||
    studioConfig?.notebookConfig

  const practiceConfig: PracticeStageConfig = {
    title: journey.stage5_practice?.title || 'Xưởng Sáng Tạo AI',
    badge: journey.stage5_practice?.badge || 'Bài thực hành',
    subjectName: journey.stage5_practice?.subjectName || lessonTitle,
    lockedFeatures: journey.stage5_practice?.lockedFeatures,
    creativeEngineMode: effectiveCreativeMode,
    notebookConfig: effectiveNotebookConfig,
    studioConfig,
    defaultPracticeParts,
    sampleUrl: journey.stage5_practice?.sampleUrl,
    akiMotto: journey.stage5_practice?.akiMotto,
    speech:
      journey.stage5_practice?.workflowSteps?.[0]?.akiSpeech ||
      journey.stage5_practice?.akiMotto ||
      'Cùng AIKI bắt tay sáng tạo tranh trong Xưởng Sáng Tạo AI nào!',
  }

  // Stage 5: Reward / Completion
  const rewardConfig: RewardStageConfig = {
    title: journey.stage6_completion?.title || 'Chúc mừng Nhà Sáng Tạo Tí Hon!',
    congratsMessage:
      journey.stage6_completion?.congratsMessage ||
      'Bé đã hoàn thành xuất sắc bài học và làm chủ bí kíp câu lệnh!',
    rewardBadge: {
      name: journey.stage6_completion?.rewardBadge?.name || 'Huy hiệu Sáng Tạo',
      iconUrl:
        journey.stage6_completion?.rewardBadge?.iconUrl ||
        journey.stage1_goal?.imageUrl ||
        '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
      stars: journey.stage6_completion?.rewardBadge?.stars ?? 3,
      xp: journey.stage6_completion?.rewardBadge?.xp ?? 50,
    },
    nextLessonSlug: journey.stage6_completion?.nextLessonSlug,
    speech:
      journey.stage6_completion?.congratsMessage ||
      'Chúc mừng Nhà Sáng Tạo Tí Hon đã xuất sắc hoàn thành trạm học!',
  }

  return [
    {
      id: journey.stage1_goal?.id || 'stage-goal',
      type: 'GOAL',
      title: 'Mục tiêu',
      stepNumber: 1,
      icon: '🎯',
      mascotRole: 'AIKI Đồng Hành',
      instruction: 'Đọc kỹ mục tiêu bài học và ghi nhớ 3 điểm vàng quan trọng.',
      speech: goalConfig.speech,
      config: goalConfig,
    },
    {
      id: journey.stage2_confirmGoal?.id || 'stage-confirm',
      type: 'CONFIRM',
      title: 'Xác nhận mục tiêu',
      stepNumber: 2,
      icon: '🧐',
      mascotRole: 'AIKI Cố Vấn',
      instruction: 'Quan sát tranh minh họa và chọn phương án chuẩn xác nhất.',
      speech: confirmConfig.speech,
      config: confirmConfig,
    },
    {
      id: journey.stage3_video?.id || 'stage-video',
      type: 'VIDEO',
      title: 'Video bài giảng',
      stepNumber: 3,
      icon: '🎬',
      mascotRole: 'Thầy Giáo AIKI',
      instruction: 'Theo dõi video bài giảng và nắm chắc các mốc phân đoạn.',
      speech: videoConfig.speech,
      config: videoConfig,
    },
    {
      id: journey.stage4_quiz?.id || 'stage-quiz',
      type: 'QUIZ',
      title: 'Bài test',
      stepNumber: 4,
      icon: '📝',
      mascotRole: 'Giám Khảo AIKI',
      instruction: 'Hoàn thành các câu hỏi trắc nghiệm để mở khóa xưởng vẽ.',
      speech: quizConfig.speech,
      config: quizConfig,
    },
    {
      id: journey.stage5_practice?.id || 'stage-practice',
      type: 'PRACTICE',
      title: 'Thực hành',
      stepNumber: 5,
      icon: '🎨',
      mascotRole: 'Bậc Thầy AIKI',
      instruction: 'Thực hành tạo tranh bằng câu lệnh và nộp bài vào Balo.',
      speech: practiceConfig.speech,
      config: practiceConfig,
    },
    {
      id: journey.stage6_completion?.id || 'stage-completion',
      type: 'REWARD',
      title: 'Hoàn thành',
      stepNumber: 6,
      icon: '🏆',
      mascotRole: 'Thần Đèn AIKI',
      instruction: 'Chiêm ngưỡng cúp vàng, tác phẩm và sẵn sàng bài học mới!',
      speech: rewardConfig.speech,
      config: rewardConfig,
    },
  ]
}
