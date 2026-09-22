import type { AikiRule } from '@/features/rules/types'
import type {
  JourneyStageDefinition,
  QuizStageConfig,
  RewardStageConfig,
  VideoStageConfig,
} from '../types/stage-schema'
import { buildVideoEmbedUrl } from './stage-view-utils'

export function adaptRuleToStages(rule: AikiRule): JourneyStageDefinition[] {
  const nextLessonId = rule.id < 10 ? `rule-${rule.id + 1}` : undefined
  const videoConfig: VideoStageConfig = {
    title: rule.title,
    videoUrl: rule.videoUrl || '',
    videoEmbedUrl: buildVideoEmbedUrl(rule.videoUrl),
    durationSec: rule.durationSec || 60,
    posterUrl: rule.posterImage,
    slides: rule.slides,
    timestamps: rule.slides.map((slide, index) => ({
      label: slide.stage,
      startSec: index * 12,
      endSec: (index + 1) * 12,
      speech: slide.dialogue,
    })),
    isDedicatedLessonVideo: true,
    speech: rule.audioVoiceText || rule.slides?.[0]?.dialogue || 'Cùng Mèo AIKI khám phá quy tắc vàng nhé!',
  }
  const quizConfig: QuizStageConfig = {
    title: `Thử tài phản xạ: ${rule.shortTitle}`,
    questions: (rule.questions || []).map((question, index) => ({
      id: question.id || `rule-${rule.id}-q-${index + 1}`,
      prompt: question.prompt,
      options: question.options,
      correctIndex: question.correctIndex,
      explanation: question.successFeedback || question.hint,
      visualUrl: question.visualUrl || (index === 0 ? (rule.slides[1]?.image || rule.slides[0]?.image) : rule.posterImage),
    })),
    passScore: 1,
    speech: 'Cùng AIKI trả lời câu hỏi trắc nghiệm phản xạ để nhận huy hiệu vàng nhé!',
  }
  const rewardConfig: RewardStageConfig = {
    title: `Chúc mừng Hiệp Sĩ Quy Tắc ${rule.id}!`,
    congratsMessage: `Tuyệt vời! Con đã làm chủ "${rule.shortTitle}" và sẵn sàng sáng tạo cùng AIKI!`,
    rewardBadge: { name: `Huy hiệu ${rule.code}: ${rule.shortTitle}`, iconUrl: rule.posterImage, stars: 3, xp: 50 },
    nextLessonId,
    nextLessonSlug: nextLessonId,
    speech: rule.akiTip || `Chúc mừng con đã hoàn thành xuất sắc Quy Tắc ${rule.id}!`,
  }
  return [
    { id: `rule-${rule.id}-stage-video`, type: 'VIDEO', title: rule.shortTitle || rule.title || 'Rạp chiếu Quy tắc vàng', stepNumber: 1, icon: '🎬', mascotRole: 'Mèo AIKI Kể Chuyện', instruction: 'Theo dõi các hoạt cảnh 16:9 và lắng nghe Mèo AIKI giải thích quy tắc vàng nhé!', speech: videoConfig.speech, config: videoConfig },
    { id: `rule-${rule.id}-stage-quiz`, type: 'QUIZ', title: 'Thử tài phản xạ', stepNumber: 2, icon: '⚡', mascotRole: 'Giám Khảo AIKI', instruction: 'Chọn phương án đúng để khắc sâu quy tắc vàng và nhận cúp vinh danh.', speech: quizConfig.speech, config: quizConfig },
    { id: `rule-${rule.id}-stage-reward`, type: 'REWARD', title: 'Vinh danh Hiệp Sĩ', stepNumber: 3, icon: '🏆', mascotRole: 'Thần Đèn AIKI', instruction: 'Chiêm ngưỡng Huy Hiệu Poster vàng và sẵn sàng cho bài tiếp theo nhé!', speech: rewardConfig.speech, config: rewardConfig },
  ]
}
