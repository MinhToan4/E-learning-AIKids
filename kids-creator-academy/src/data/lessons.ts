/**
 * Canonical lesson pipeline per quest:
 * THEORY (video + cards) → PRACTICE (studio/task) → QUIZ (short MC)
 *
 * Inspired by: Code.org Watch/Do/Check, Duolingo skill steps,
 * Khan Academy Kids lesson loop, BrainPOP video+quiz.
 * Sources: docs/RESEARCH-SOURCES.md
 */

import type { LearnCard } from '@/types'
import { QUESTS } from '@/data/mock'
import { findQuestAnywhere } from '@/data/courses'
import { CHALLENGES, type ChallengeQuestion } from '@/data/challenges'

export type LessonPhase = 'theory' | 'practice' | 'quiz' | 'done'

export type LessonVideo = {
  title: string
  durationSec: number
  beats: { t: number; text: string }[]
}

export type LessonDef = {
  questId: string
  /** Kid-facing lesson title */
  title: string
  emoji: string
  skill: string
  video: LessonVideo
  theoryCards: LearnCard[]
  /** Where “Làm thử” navigates */
  practicePath: string
  practiceLabel: string
  practiceHint: string
  quiz: ChallengeQuestion[]
  starsMax: 3
  starsReward: number
}

function cardsFromQuest(questId: string): LearnCard[] {
  const found = findQuestAnywhere(questId)
  if (found) return found.quest.learnCards
  const q = QUESTS.find((x) => x.id === questId)
  return q?.learnCards ?? []
}

function quizFromChallenge(afterQuestId: string): ChallengeQuestion[] {
  const ch = CHALLENGES.find((c) => c.afterQuestId === afterQuestId)
  return ch?.questions ?? []
}

const defaultQuiz = (topic: string): ChallengeQuestion[] => [
  {
    id: `${topic}-q1`,
    prompt: 'Con nhớ gì quan trọng nhất?',
    options: [
      { id: 'a', label: 'Làm chậm, làm rõ, giữ an toàn', correct: true },
      { id: 'b', label: 'Bỏ qua hướng dẫn cho nhanh', correct: false },
      { id: 'c', label: 'Đưa tên thật cho AI', correct: false },
    ],
    explain: 'Đúng! Rõ ràng + an toàn là chìa khóa.',
  },
  {
    id: `${topic}-q2`,
    prompt: 'AI có thể sai không?',
    options: [
      { id: 'a', label: 'Không bao giờ sai', correct: false },
      { id: 'b', label: 'Có thể sai — con cần kiểm tra', correct: true },
      { id: 'c', label: 'Chỉ sai khi hết pin', correct: false },
    ],
    explain: 'Giỏi! Con là thám tử kiểm tra AI.',
  },
]

export const LESSONS: Record<string, LessonDef> = {
  'meet-mascot': {
    questId: 'meet-mascot',
    title: 'Làm quen AI bạn tốt',
    emoji: '👋',
    skill: 'AI là công cụ — con là chỉ huy',
    video: {
      title: 'Video: AI giúp gì?',
      durationSec: 24,
      beats: [
        { t: 0, text: 'AI là máy làm theo lời mô tả của con.' },
        { t: 6, text: 'Con chọn ý tưởng — AI giúp vẽ, kể, gợi ý.' },
        { t: 12, text: 'AI có thể sai. Con được kiểm tra!' },
        { t: 18, text: 'Không đưa tên thật hay số điện thoại.' },
      ],
    },
    theoryCards: cardsFromQuest('meet-mascot'),
    practicePath: '/quest/meet-mascot',
    practiceLabel: 'Chơi nhiệm vụ chào AI',
    practiceHint: 'Làm quen mascot và nhận thẻ Nhà sáng tạo.',
    quiz: defaultQuiz('meet'),
    starsMax: 3,
    starsReward: 15,
  },
  character: {
    questId: 'character',
    title: 'Tạo nhân vật đồng hành',
    emoji: '🐱',
    skill: 'Mô tả rõ ai là nhân vật chính',
    video: {
      title: 'Video: Tạo nhân vật an toàn',
      durationSec: 28,
      beats: [
        { t: 0, text: 'Chọn loài / hình dáng vui, tưởng tượng.' },
        { t: 7, text: 'Thêm trang phục và tính cách.' },
        { t: 14, text: 'Không dùng mặt thật hay người nổi tiếng.' },
        { t: 21, text: 'Xong rồi sẽ ghép thẻ để AI vẽ!' },
      ],
    },
    theoryCards: cardsFromQuest('character'),
    practicePath: '/quest/character',
    practiceLabel: 'Tạo nhân vật ngay',
    practiceHint: 'Chọn loài · trang phục · tính cách.',
    quiz: quizFromChallenge('character').length
      ? quizFromChallenge('character')
      : defaultQuiz('character'),
    starsMax: 3,
    starsReward: 15,
  },
  'world-build': {
    questId: 'world-build',
    title: 'Chọn nơi câu chuyện xảy ra',
    emoji: '🪐',
    skill: 'Bối cảnh giúp AI (và truyện) rõ hơn',
    video: {
      title: 'Video: Thế giới truyện',
      durationSec: 22,
      beats: [
        { t: 0, text: 'Nơi chốn = sân khấu của nhân vật.' },
        { t: 7, text: 'Chọn nơi vui: hành tinh kẹo, thư viện mây…' },
        { t: 14, text: 'Ghi nhớ nơi này khi ghép thẻ “Ở đâu”.' },
      ],
    },
    theoryCards: cardsFromQuest('world-build'),
    practicePath: '/quest/world-build',
    practiceLabel: 'Chọn nơi chơi',
    practiceHint: 'Chọn 1 thế giới và nhớ lý do.',
    quiz: defaultQuiz('world'),
    starsMax: 3,
    starsReward: 12,
  },
  'prompt-lab': {
    questId: 'prompt-lab',
    title: 'Ghép thẻ để AI vẽ ảnh',
    emoji: '🎨',
    skill: 'Prompt = Ai + làm gì + ở đâu',
    video: {
      title: 'Video: Ghép thẻ tạo ảnh',
      durationSec: 30,
      beats: [
        { t: 0, text: 'Kéo hoặc chọn thẻ vào 5 ô.' },
        { t: 8, text: 'Ai · Làm gì · Ở đâu · Cảm xúc · Kiểu vẽ.' },
        { t: 16, text: 'Đọc câu mô tả — rõ thì ảnh đẹp hơn.' },
        { t: 24, text: 'Bấm Tạo 3 ảnh — chọn ảnh ưng nhất sau.' },
      ],
    },
    theoryCards: cardsFromQuest('prompt-lab'),
    practicePath: '/studio/prompt',
    practiceLabel: 'Mở xưởng ghép thẻ',
    practiceHint: 'Ghép đủ thẻ và tạo 3 ảnh minh họa.',
    quiz: quizFromChallenge('prompt-lab').length
      ? quizFromChallenge('prompt-lab')
      : defaultQuiz('prompt'),
    starsMax: 3,
    starsReward: 20,
  },
  detective: {
    questId: 'detective',
    title: 'Thám tử AI — chọn ảnh đúng ý',
    emoji: '🔎',
    skill: 'AI có thể sai — con kiểm tra',
    video: {
      title: 'Video: Kiểm tra ảnh AI',
      durationSec: 26,
      beats: [
        { t: 0, text: 'So sánh 3 ảnh — tìm chi tiết lạ.' },
        { t: 8, text: 'AI có thể vẽ thừa / sai — không sao!' },
        { t: 16, text: 'Chọn 1 ảnh ưng, lưu vào ba lô.' },
        { t: 22, text: 'Tiếp theo sẽ viết cốt truyện.' },
      ],
    },
    theoryCards: cardsFromQuest('detective'),
    practicePath: '/studio/compare',
    practiceLabel: 'So sánh 3 ảnh',
    practiceHint: 'Tìm chi tiết lạ và chọn ảnh tốt nhất.',
    quiz: quizFromChallenge('detective').length
      ? quizFromChallenge('detective')
      : defaultQuiz('detective'),
    starsMax: 3,
    starsReward: 20,
  },
  plot: {
    questId: 'plot',
    title: 'Viết cốt truyện 3 mảnh',
    emoji: '⚡',
    skill: 'Mở đầu · vấn đề · kết thúc',
    video: {
      title: 'Video: Cốt truyện trước 4 khung',
      durationSec: 28,
      beats: [
        { t: 0, text: 'Truyện hay cần 3 mảnh rõ ràng.' },
        { t: 8, text: 'Mở đầu: ai ở đâu?' },
        { t: 14, text: 'Vấn đề: chuyện gì bất ngờ?' },
        { t: 20, text: 'Kết: giải quyết vui và an toàn.' },
      ],
    },
    theoryCards: cardsFromQuest('plot'),
    practicePath: '/studio/story',
    practiceLabel: 'Tạo nội dung truyện',
    practiceHint: 'Chọn 3 mảnh rồi xem trước 4 khung.',
    quiz: defaultQuiz('plot'),
    starsMax: 3,
    starsReward: 18,
  },
  comic: {
    questId: 'comic',
    title: 'Làm truyện tranh 4 khung',
    emoji: '📖',
    skill: 'Xếp ảnh + lời thoại theo cốt truyện',
    video: {
      title: 'Video: Truyện 4 khung',
      durationSec: 30,
      beats: [
        { t: 0, text: 'Mỗi khung = 1 nhịp câu chuyện.' },
        { t: 8, text: 'Đặt ảnh nhân vật vào khung 1→4.' },
        { t: 16, text: 'Thêm bong bóng thoại ngắn.' },
        { t: 24, text: 'Xem trước rồi sang làm video.' },
      ],
    },
    theoryCards: cardsFromQuest('comic'),
    practicePath: '/studio/comic',
    practiceLabel: 'Mở studio 4 khung',
    practiceHint: 'Xếp theo cốt truyện đã viết.',
    quiz: defaultQuiz('comic'),
    starsMax: 3,
    starsReward: 25,
  },
  cinema: {
    questId: 'cinema',
    title: 'Làm video kể chuyện',
    emoji: '🎬',
    skill: 'Ghép cảnh + giọng kể + phụ đề',
    video: {
      title: 'Video: Mini cinema',
      durationSec: 26,
      beats: [
        { t: 0, text: 'Mỗi cảnh có 1 câu kể.' },
        { t: 8, text: 'Chọn giọng và nhạc nhẹ.' },
        { t: 16, text: 'Bật phụ đề — dễ xem hơn.' },
        { t: 22, text: 'Xuất video demo và khoe gia đình.' },
      ],
    },
    theoryCards: cardsFromQuest('cinema'),
    practicePath: '/studio/video',
    practiceLabel: 'Mở studio video',
    practiceHint: 'Ghép cảnh và xem trước.',
    quiz: defaultQuiz('cinema'),
    starsMax: 3,
    starsReward: 25,
  },
}

/** Safety / other courses — light lessons */
export function ensureLesson(questId: string): LessonDef {
  if (LESSONS[questId]) return LESSONS[questId]
  const found = findQuestAnywhere(questId)
  const q = found?.quest ?? QUESTS.find((x) => x.id === questId)
  return {
    questId,
    title: q?.title ?? 'Nhiệm vụ',
    emoji: '✨',
    skill: q?.skill ?? 'Học và làm thử',
    video: {
      title: `Video: ${q?.title ?? 'Hướng dẫn'}`,
      durationSec: 20,
      beats: [
        { t: 0, text: q?.hook ?? 'Xem nhanh rồi làm thử nhé!' },
        { t: 8, text: q?.skill ?? 'Làm chậm, không sao nếu thử lại.' },
        { t: 14, text: 'Không dùng thông tin cá nhân.' },
      ],
    },
    theoryCards: q?.learnCards ?? [],
    practicePath: `/quest/${questId}`,
    practiceLabel: 'Vào làm thử',
    practiceHint: q?.hook ?? 'Hoàn thành nhiệm vụ ngắn.',
    quiz: defaultQuiz(questId),
    starsMax: 3,
    starsReward: 12,
  }
}

/** Lessons for a course = one drill per quest in that course only */
export function lessonsForCourseQuests(questIds: string[]): LessonDef[] {
  return questIds.map((id) => ensureLesson(id))
}

export type LessonProgress = {
  theoryDone: boolean
  practiceDone: boolean
  quizDone: boolean
  /** 0–3 stars earned on quiz */
  starsEarned: number
  videoWatchedSec: number
}

export function emptyLessonProgress(): LessonProgress {
  return {
    theoryDone: false,
    practiceDone: false,
    quizDone: false,
    starsEarned: 0,
    videoWatchedSec: 0,
  }
}

/** Stars from quiz accuracy: 3 = all correct, 2 = majority, 1 = passed with misses */
export function starsFromQuiz(correct: number, total: number): number {
  if (total <= 0) return 1
  const ratio = correct / total
  if (ratio >= 1) return 3
  if (ratio >= 0.5) return 2
  return 1
}
