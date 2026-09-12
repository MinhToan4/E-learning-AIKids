import type {
  QuestDetail,
  LessonSixStageJourney,
  SixStageGoal,
  SixStageConfirmGoal,
  SixStageVideo,
  SixStageQuiz,
  SixStagePractice,
  SixStageCompletion,
} from '@/shared/lib/api'
import { getAikiStudioConfig } from '../data/aiki-studio-configs'
import {
  findIslandCurriculum,
  ISLAND_CURRICULUM_MAP,
} from '../data/island-curriculum-registry'

/**
 * Tính toán slug bài học tiếp theo cho các Đảo M1-M5
 */
export function computeNextIslandLessonSlug(questId: string): string | undefined {
  const match = questId.match(/bai[-_](\d+)[-_](\d+)/i)
  if (match) {
    const island = parseInt(match[1], 10)
    const lesson = parseInt(match[2], 10)

    // Đảo 4 có 5 bài (4.1 -> 4.2 -> 4.3 -> 4.4 -> 4.5 -> 5.1)
    if (island === 4) {
      if (lesson < 5) return `bai-4-${lesson + 1}`
      return 'bai-5-1'
    }
    // Đảo 5 có 5 bài (5.1 -> 5.2 -> 5.3 -> 5.4 -> 5.5 -> undefined)
    if (island === 5) {
      if (lesson < 5) return `bai-5-${lesson + 1}`
      return undefined
    }

    if (lesson < 4) {
      return `bai-${island}-${lesson + 1}`
    } else if (island < 5) {
      return `bai-${island + 1}-1`
    }
  }
  return undefined
}

/**
 * Kiểm tra xem một đối tượng có đầy đủ 6 chặng hợp lệ hay không
 */
export function isValidSixStageJourney(journey?: unknown): journey is LessonSixStageJourney {
  if (!journey || typeof journey !== 'object') return false
  const j = journey as Record<string, unknown>
  return Boolean(
    j.stage1_goal &&
    j.stage2_confirmGoal &&
    j.stage3_video &&
    j.stage4_quiz &&
    j.stage5_practice &&
    j.stage6_completion
  )
}

/**
 * Resolver hoàn hảo:
 * 1. ƯU TIÊN HÀNG ĐẦU: Tra cứu từ SSOT `island-curriculum-registry` cho tất cả các bài học Đảo M1-M5
 *    để lấy trọn vẹn dữ liệu SSOT sư phạm và hình ảnh 3D Soft Clay mới, ngăn dữ liệu slide ASMO cũ
 *    trong DB ghi đè. Giữ nguyên videoUrl tùy biến và nextLessonSlug nếu có.
 * 2. Nếu quest ngoài giáo trình Đảo nhưng có `sixStageJourney` hợp lệ do backend/custom cung cấp: Dùng ngay.
 * 3. Fallback: Tự động phục hồi linh hoạt từ metadata, learnCards, check, coverImage của quest.
 */
export function resolveIslandSixStageJourney(quest: QuestDetail): LessonSixStageJourney {
  // 1. Ưu tiên hàng đầu: Tìm kiếm trong thư viện SSOT 22 bài học Aiki Islands (M1-M5)
  const curriculumItem = findIslandCurriculum(quest)
  if (curriculumItem) {
    const journey = curriculumItem.journey
    const customVideoUrl =
      (quest.videoUrl && quest.videoUrl.trim() !== '' ? quest.videoUrl : undefined) ||
      (quest.sixStageJourney?.stage3_video?.videoUrl && quest.sixStageJourney.stage3_video.videoUrl.trim() !== ''
        ? quest.sixStageJourney.stage3_video.videoUrl
        : undefined)

    const customNextSlug =
      journey.stage6_completion?.nextLessonSlug ||
      quest.sixStageJourney?.stage6_completion?.nextLessonSlug ||
      computeNextIslandLessonSlug(quest.id)

    return {
      ...journey,
      stage3_video: {
        ...journey.stage3_video,
        videoUrl: customVideoUrl || journey.stage3_video.videoUrl,
      },
      stage6_completion: {
        ...journey.stage6_completion,
        nextLessonSlug: customNextSlug,
      },
    }
  }

  // 2. Nếu bài học ngoài SSOT nhưng quest đã có sixStageJourney hợp lệ: giữ nguyên
  if (isValidSixStageJourney(quest.sixStageJourney)) {
    return quest.sixStageJourney
  }

  // 3. Fallback khôi phục từ Studio Config và dữ liệu bài học cho các bài ngoài SSOT
  const studioCfgBase = getAikiStudioConfig(quest.id, quest.title, quest.courseId)
  const lessonSub = quest.id.replace(/^bai-\d+-/, '') || '1'
  const islandMatch = quest.id.match(/bai-(\d+)/i)
  const islandNum = islandMatch ? islandMatch[1] : '1'

  const defaultCover = `/assets/aiki-islands/island${islandNum}_lesson${lessonSub}_cat.jpg`
  const resolvedCover = quest.coverImage || quest.media?.[0]?.url || quest.learnCards?.[0]?.imageUrl || defaultCover

  // ── Chặng 1: stage1_goal ──
  const stage1_goal: SixStageGoal = {
    id: `${quest.id}-goal`,
    title: quest.title,
    goalText: quest.goals?.[0] || (quest as any).description || quest.hook || 'Nắm vững kỹ năng sáng tạo AI',
    imageUrl: resolvedCover,
    speech: quest.learnCards?.[0]?.mee?.readText || quest.learnCards?.[0]?.body || 'Chào mừng bé đến với bài học!',
    keyPoints: quest.goals && quest.goals.length > 0
      ? quest.goals
      : ['Quan sát kỹ', 'Làm chủ câu lệnh', 'Tự tin sáng tạo'],
  }

  // ── Chặng 2: stage2_confirmGoal ──
  const riddleCard = quest.learnCards?.[1]
  const cardBodyLines = riddleCard?.body?.split('\n\n') || []
  const confirmQuestion = (cardBodyLines.length > 1 ? cardBodyLines[1] : null) ||
    quest.check?.[0]?.question ||
    riddleCard?.body ||
    'Bé hãy sẵn sàng trả lời câu đố xác nhận mục tiêu!'

  const optionADesc = riddleCard?.optionDescs?.[0] || quest.check?.[0]?.options?.[0] || 'Tùy chọn A cụ thể'
  const optionBDesc = riddleCard?.optionDescs?.[1] || quest.check?.[0]?.options?.[1] || 'Tùy chọn B cụ thể'
  const optionAImg = riddleCard?.optionImages?.[0] || `/assets/aiki-islands/island${islandNum}_lesson${lessonSub}_opt_a.jpg`
  const optionBImg = riddleCard?.optionImages?.[1] || `/assets/aiki-islands/island${islandNum}_lesson${lessonSub}_opt_b.jpg`

  const stage2_confirmGoal: SixStageConfirmGoal = {
    id: `${quest.id}-confirm`,
    question: confirmQuestion,
    options: [
      {
        id: 'opt-a',
        text: optionADesc,
        imageUrl: optionAImg,
      },
      {
        id: 'opt-b',
        text: optionBDesc,
        imageUrl: optionBImg,
      },
    ],
    correctIndex: 1, // Default option B
    explanation: quest.learnCards?.[2]?.body || quest.check?.[0]?.mee?.strategy || 'Chính xác! Câu lệnh cụ thể giúp AKI hiểu rõ ý tưởng của bé nhất!',
    speech: riddleCard?.mee?.readText || 'Hãy chọn đáp án đúng để mở khóa video bài học nhé!',
  }

  // ── Chặng 3: stage3_video ──
  const stage3_video: SixStageVideo = {
    id: `${quest.id}-video`,
    title: `Video hướng dẫn: ${quest.title}`,
    videoUrl: quest.videoUrl || quest.learnCards?.find((c) => Boolean(c.videoUrl))?.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    durationSec: 180,
    posterUrl: resolvedCover,
    timestamps: [
      { label: 'Giới thiệu & Tình huống', startSec: 0, endSec: 45, speech: quest.learnCards?.[0]?.body },
      { label: 'Quy tắc vàng', startSec: 45, endSec: 120, speech: quest.learnCards?.[2]?.body },
      { label: 'Tóm tắt & Ứng dụng', startSec: 120, endSec: 180, speech: quest.learnCards?.[4]?.body },
    ],
  }

  // ── Chặng 4: stage4_quiz ──
  const stage4_quiz: SixStageQuiz = {
    id: `${quest.id}-quiz`,
    title: 'Thử tài hiểu biết',
    questions: quest.check && quest.check.length > 0
      ? quest.check.map((c, i) => ({
          id: c.id || `${quest.id}-q-${i + 1}`,
          prompt: c.question,
          options: c.options || ['Câu lệnh chi tiết rõ ràng', 'Câu lệnh quá ngắn chung chung'],
          correctIndex: 0,
          explanation: 'Chúc mừng bé đã trả lời rất chuẩn xác!',
          visualUrl: resolvedCover,
        }))
      : [
          {
            id: `${quest.id}-quiz-1`,
            prompt: 'Quy tắc quan trọng nhất trong bài học này là gì?',
            options: [
              'Tả càng rõ, AKI vẽ càng đúng',
              'Chỉ cần gõ ngắn 1 từ là đủ',
            ],
            correctIndex: 0,
            explanation: 'Tuyệt vời! Cùng bắt tay vào xưởng thực hành nhé!',
            visualUrl: resolvedCover,
          },
        ],
    passScore: 1,
  }

  // ── Chặng 5: stage5_practice ──
  const questStudio = (quest as any).studioConfig || (quest as any).metadata?.studioConfig
  const subjectName = questStudio?.subjectName || studioCfgBase.subjectName || quest.title
  const badge = questStudio?.badge || studioCfgBase.badge || `Bài ${lessonSub}`
  const lockedFeatures = questStudio?.lockedFeatures && questStudio.lockedFeatures.length > 0
    ? questStudio.lockedFeatures
    : (studioCfgBase.lockedFeatures?.length ? studioCfgBase.lockedFeatures : ['Từ khóa chính xác', 'Chi tiết rõ ràng', 'Bối cảnh sinh động'])
  const akiMotto = questStudio?.akiMotto || studioCfgBase.akiMotto || 'Chỗ nào bỏ trống AI sẽ đoán bừa, miêu tả càng rõ tranh càng đúng ý!'
  const illustrationType = questStudio?.illustrationType || studioCfgBase.illustrationType || 'gflow'
  const firstWords = subjectName.split(' ').slice(0, 2).join(' ')

  const workflowSteps = studioCfgBase.practiceWorkflow?.steps?.length
    ? studioCfgBase.practiceWorkflow.steps.map((st, i) => ({
        step: st.stepIndex || i + 1,
        title: st.taskLabel,
        akiSpeech: st.akiInstruction,
        quickPrompt: st.quickPrompt,
        instruction: st.akiFeedback,
      }))
    : [
        {
          step: 1,
          title: 'Thử câu lệnh ban đầu (1-2 từ)',
          akiSpeech: `Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn "${firstWords}" xem tớ vẽ thế nào nhé!`,
          quickPrompt: firstWords,
          instruction: 'Gõ từ khóa ngắn khởi đầu để thử thách AKI',
        },
        {
          step: 2,
          title: 'Thêm hình dáng & màu sắc',
          akiSpeech: `Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!`,
          quickPrompt: `${firstWords} ${lockedFeatures[0] || 'màu sắc rõ nét'}`.trim(),
          instruction: 'Bổ sung màu sắc, hình dáng đặc trưng',
        },
        {
          step: 3,
          title: 'Hoàn thiện 5 chi tiết vàng',
          akiSpeech: `Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!`,
          quickPrompt: `${firstWords} ${lockedFeatures.join(', ')}`.trim(),
          instruction: 'Bổ sung hành động, bối cảnh và cảm xúc',
        },
        {
          step: 4,
          title: 'Kiểm tra & Xuất bản tác phẩm',
          akiSpeech: `Tuyệt tác đã sẵn sàng! Con hãy kiểm tra lại theo checklist và lưu vào bộ sưu tập nhé!`,
          quickPrompt: `${firstWords} phong cách hoạt hình sắc nét 3D`,
          instruction: 'Tự đánh giá, xuất bản và khoe thành quả',
        },
      ]

  const stage5_practice: SixStagePractice = {
    id: `${quest.id}-stage5-practice`,
    title: `Xưởng Sáng Tạo AI: ${quest.title}`,
    subjectName,
    badge,
    illustrationType,
    lockedFeatures,
    akiMotto,
    maxAttempts: 6,
    workflowSteps,
    sampleUrl: resolvedCover,
  }

  // ── Chặng 6: stage6_completion ──
  const stage6_completion: SixStageCompletion = {
    id: `${quest.id}-complete`,
    title: 'Chúc mừng bé hoàn thành bài học!',
    congratsMessage: `Tuyệt vời! Con đã xuất sắc vượt qua cả 6 chặng của bài ${quest.title}!`,
    rewardBadge: {
      name: quest.title,
      stars: 3,
      xp: 50,
      iconUrl: '/assets/icons/badge-gold.svg',
    },
    nextLessonSlug: computeNextIslandLessonSlug(quest.id),
  }

  return {
    stage1_goal,
    stage2_confirmGoal,
    stage3_video,
    stage4_quiz,
    stage5_practice,
    stage6_completion,
  }
}
