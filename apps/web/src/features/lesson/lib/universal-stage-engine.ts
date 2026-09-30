import type { JourneyStageDefinition } from '../types/stage-schema'

export interface StageTypeIndices {
  goalIdx: number
  confirmIdx: number
  videoIdx: number
  quizIdx: number
  practiceIdx: number
  rewardIdx: number
}

export function getStageTypeIndices(stages: JourneyStageDefinition[]): StageTypeIndices {
  return {
    goalIdx: stages.findIndex((s) => s.type === 'GOAL'),
    confirmIdx: stages.findIndex((s) => s.type === 'CONFIRM'),
    videoIdx: stages.findIndex((s) => s.type === 'VIDEO'),
    quizIdx: stages.findIndex((s) => s.type === 'QUIZ'),
    practiceIdx: stages.findIndex((s) => s.type === 'PRACTICE'),
    rewardIdx: stages.findIndex((s) => s.type === 'REWARD'),
  }
}

export interface UniversalStarsInput {
  stages: JourneyStageDefinition[]
  currentStage: number
  completedStages: Set<number>
  isVideoCompleted: boolean
  quizScore: number
  effectiveQuizQuestions: any[]
  quizSubmitted: boolean
  submittedArtwork: any | null
  isCompletedLesson: boolean
  previousStars?: number | null
  defaultStars?: number
  isPracticeCompleted?: boolean
}

/**
 * Thuật toán tính sao tổng quát cho mọi Template (từ 1 đến N bước).
 * Không phụ thuộc vào stages.length === 3 hay stages.length === 6.
 * Tuân thủ quy tắc phân tầng sao động & ràng buộc Thực hành cho Sao thứ 3.
 */
export function calculateUniversalStars(input: UniversalStarsInput): number {
  const {
    stages,
    currentStage,
    completedStages,
    isVideoCompleted,
    quizScore,
    effectiveQuizQuestions,
    quizSubmitted,
    submittedArtwork,
    isCompletedLesson,
    previousStars,
    defaultStars = 3,
    isPracticeCompleted = false,
  } = input

  if (isCompletedLesson) {
    return previousStars && previousStars >= 1 ? previousStars : 3
  }

  const count = stages.length || 1
  const indices = getStageTypeIndices(stages)
  let stars = 0

  const hasCustomStars = stages.some((stage) => stage.awardsStar != null)
  const hasPracticeStage = indices.practiceIdx >= 0
  const hasQuizStage = indices.quizIdx >= 0
  const hasCompletedPractice =
    Boolean(submittedArtwork) ||
    (hasPracticeStage && completedStages.has(indices.practiceIdx)) ||
    Boolean(isPracticeCompleted)

  // 1. Kiểm tra cờ awardsStar trực tiếp trên từng stage khi stage đó hoàn thành
  let star1ByFlag = false
  let star2ByFlag = false
  let star3ByFlag = false

  stages.forEach((stage, idx) => {
    if (completedStages.has(idx)) {
      if (stage.awardsStar === 1) star1ByFlag = true
      if (stage.awardsStar === 2) star2ByFlag = true
      if (stage.awardsStar === 3) star3ByFlag = true
    }
  })

  // 2. Quy tắc phân tầng thông minh (Semantic Fallback)

  // ⭐ Sao 1: Khi xong chặng Video
  let star1Earned = star1ByFlag
  if (!star1Earned) {
    if (indices.videoIdx >= 0) {
      star1Earned =
        isVideoCompleted ||
        completedStages.has(indices.videoIdx) ||
        currentStage > indices.videoIdx
    } else {
      // Nếu template không có video, hoàn thành >= 33% số bước đầu tiên là được sao 1
      const oneThird = Math.max(1, Math.floor(count / 3))
      star1Earned = currentStage >= oneThird || completedStages.size >= oneThird
    }
  }
  if (star1Earned) stars += 1

  // ⭐⭐ Sao 2: Khi xong chặng Quiz (hoặc Practice nếu template không có Quiz)
  let star2Earned = star2ByFlag
  if (!star2Earned) {
    if (hasQuizStage) {
      const quizTotal = effectiveQuizQuestions.length || 1
      const quizDone =
        completedStages.has(indices.quizIdx) ||
        currentStage > indices.quizIdx
      star2Earned =
        quizDone ||
        (quizScore / quizTotal >= 0.7) ||
        (quizSubmitted && quizScore >= 1)
    } else if (hasPracticeStage) {
      // Template không có Quiz nhưng có Practice -> Practice là chặng kiếm Sao 2
      star2Earned =
        hasCompletedPractice ||
        currentStage > indices.practiceIdx
    } else {
      // Nếu template không có quiz/practice, hoàn thành >= 66% số bước là được sao 2
      const twoThirds = Math.max(2, Math.floor((count * 2) / 3))
      star2Earned = currentStage >= twoThirds || completedStages.size >= twoThirds
    }
  }
  if (star2Earned) stars += 1

  // ⭐⭐⭐ Sao 3:
  // - Nếu bài học CÓ cả Quiz và Thực hành (khóa học chính 6 chặng):
  //   CHỈ ĐƯỢC SAO THỨ 3 KHI ĐÃ LÀM XONG THỰC HÀNH:
  //   Boolean(submittedArtwork) || completedStages.has(indices.practiceIdx) || hasCompletedPractice
  //   Nếu học sinh đang ở chặng Reward mà CHƯA làm thực hành -> TỐI ĐA CHỈ ĐƯỢC 2 SAO! Không tự động nhảy lên 3 sao!
  // - Nếu bài học KHÔNG CÓ chặng Thực hành (như Aiki Rule 3 chặng) hoặc template 3 chặng (Video + Practice + Reward):
  //   Khi tới chặng Reward (currentStage === indices.rewardIdx || completedStages.has(indices.rewardIdx)) -> Nhận trọn 3 sao.
  const finalIdx = count - 1
  const stageWithStar3 = stages.find((s) => s.awardsStar === 3)
  let star3Earned = star3ByFlag

  if (!star3Earned) {
    if (stageWithStar3) {
      if (hasPracticeStage && hasQuizStage) {
        // Khóa học chính: Có Quiz (Sao 2) và Practice (Sao 3)
        star3Earned = hasCompletedPractice
      }
    } else if (hasPracticeStage && hasQuizStage) {
      // Khóa học chính: Có Quiz (Sao 2) và Practice (Sao 3)
      star3Earned = hasCompletedPractice
    } else if (indices.rewardIdx >= 0) {
      star3Earned =
        currentStage === indices.rewardIdx ||
        completedStages.has(indices.rewardIdx)
    } else {
      star3Earned = currentStage >= finalIdx || completedStages.has(finalIdx)
    }
  }

  if (star3Earned) stars += 1

  // Khóa học chính có chặng Thực Hành mà chưa làm xong thực hành -> TỐI ĐA CHỈ ĐƯỢC 2 SAO!
  if (hasPracticeStage && hasQuizStage && !hasCompletedPractice) {
    return Math.min(2, Math.max(0, stars))
  }

  // Nếu stage có khai báo awardsStar rõ ràng, tôn trọng số sao theo stage đã hoàn thành
  if (hasCustomStars) {
    return Math.min(3, Math.max(0, stars))
  }

  // Fallback defaultStars khi tới chặng cuối nếu không có practice hoặc practice đã hoàn thành
  if ((currentStage === finalIdx || (indices.rewardIdx >= 0 && currentStage === indices.rewardIdx)) && stars < 3) {
    return defaultStars
  }

  return Math.min(3, Math.max(0, stars))
}

export function isStageStepDone(
  idx: number,
  stages: JourneyStageDefinition[],
  currentStage: number,
  completedStages: Set<number>,
  isVideoCompleted: boolean,
  quizScore: number,
  isCompletedLesson: boolean,
): boolean {
  if (isCompletedLesson) {
    return currentStage !== idx
  }
  const stage = stages[idx]
  if (!stage) return false

  if (stage.type === 'VIDEO') {
    return isVideoCompleted || completedStages.has(idx) || currentStage > idx
  }
  if (stage.type === 'QUIZ') {
    return quizScore >= 1 || completedStages.has(idx) || currentStage > idx
  }
  if (stage.type === 'REWARD') {
    return completedStages.has(idx)
  }

  return completedStages.has(idx) || currentStage > idx
}
