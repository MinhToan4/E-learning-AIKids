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
}

/**
 * Thuật toán tính sao tổng quát cho mọi Template (từ 1 đến N bước).
 * Không phụ thuộc vào stages.length === 3 hay stages.length === 6.
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
  } = input

  if (isCompletedLesson) {
    return previousStars && previousStars >= 1 ? previousStars : 3
  }

  const count = stages.length || 1
  const indices = getStageTypeIndices(stages)
  let stars = 0

  // ⭐ NGÔI SAO 1: Nắm vững bài giảng / Kiến thức nền
  let star1Earned = false
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
  if (star1Earned) stars += 1

  // ⭐⭐ NGÔI SAO 2: Thử tài kiến thức / Thực hành tương tác
  let star2Earned = false
  if (indices.quizIdx >= 0) {
    const quizTotal = effectiveQuizQuestions.length || 1
    star2Earned =
      completedStages.has(indices.quizIdx) ||
      currentStage > indices.quizIdx ||
      (quizScore / quizTotal >= 0.7) ||
      (quizSubmitted && quizScore >= 1)
  } else if (indices.practiceIdx >= 0) {
    star2Earned =
      Boolean(submittedArtwork) ||
      completedStages.has(indices.practiceIdx) ||
      currentStage > indices.practiceIdx
  } else {
    // Nếu template không có quiz/practice, hoàn thành >= 66% số bước là được sao 2
    const twoThirds = Math.max(2, Math.floor((count * 2) / 3))
    star2Earned = currentStage >= twoThirds || completedStages.size >= twoThirds
  }
  if (star2Earned) stars += 1

  // ⭐⭐⭐ NGÔI SAO 3: Hoàn thành bài học / Chạm chặng Reward
  let star3Earned = false
  const finalIdx = count - 1
  if (indices.rewardIdx >= 0) {
    star3Earned =
      currentStage === indices.rewardIdx ||
      completedStages.has(indices.rewardIdx)
  } else {
    star3Earned = currentStage >= finalIdx || completedStages.has(finalIdx)
  }
  if (star3Earned) stars += 1

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
