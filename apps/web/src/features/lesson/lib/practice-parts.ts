import {
  DEFAULT_MAGIC_KEYS_PARTS,
  DEFAULT_STYLE_PRISM_PARTS,
  DEFAULT_PROMPT_DOCTOR_PARTS,
  DEFAULT_LAYER_STACKING_PARTS,
  DEFAULT_CARD_FORGE_PARTS,
} from '@/features/teacher/components/engine-editors/engine-editor-defaults'

export interface StudioImageItem {
  id: string
  url?: string
  turn: number
  prompt: string
  time: string
  toneBg: string
  aspectRatio?: string
  verifiedFeatures?: boolean
  partIndex?: number
  partTurn?: 1 | 2
}

export interface PracticePartDef {
  id?: string
  partNumber: number
  title: string
  icon?: string
  iconImage?: string
  emoji?: string
}

export const DEFAULT_IDENTITY_LOCK_PARTS: PracticePartDef[] = [
  { partNumber: 1, title: 'Chú Sóc Bông Hạt Dẻ', icon: '🐿️', iconImage: '/assets/aiki-islands/island3_lesson2_opt_b.jpg' },
  { partNumber: 2, title: 'Cáo Lửa Zico Hiệp Sĩ', icon: '🦊', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
  { partNumber: 3, title: 'Chú Bé Robot Leo', icon: '🤖', iconImage: '/assets/aiki-keys/key_what_blue.jpg' },
  { partNumber: 4, title: 'Mèo Thám Tử AIKI', icon: '🐱', iconImage: '/assets/aiki-islands/island1_lesson1_cat.jpg' },
]

export interface PracticePartState extends PracticePartDef {
  images: StudioImageItem[]
  isDone: boolean
  isActive: boolean
}

export const NOTEBOOK_LESSONS = ['2.1', '3.1', '4.1', '4.2', '4.3', '4.5', '5.1', '5.2', '5.4', '5.5']

function extractLessonNumber(lessonId?: string): string {
  if (!lessonId) return ''
  const m = lessonId.match(/(\d)[-._](\d)/)
  if (m) return `${m[1]}.${m[2]}`
  return lessonId.trim().toLowerCase()
}

export function getDefaultPracticeParts(
  lessonId?: string,
  subjectName?: string,
  mode?: string
): PracticePartDef[] {
  const normMode = (mode || '').toLowerCase()
  const normId = (lessonId || '').toLowerCase()
  const normSub = (subjectName || '').toLowerCase()
  const lessonNum = extractLessonNumber(lessonId)

  // 0. Các bài Ba Lô (creative-notebook hoặc lesson 2.1, 3.1, 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 5.4, 5.5): trả về [] (0 món đồ tạo ảnh)
  if (
    normMode === 'creative-notebook' ||
    normMode === 'notebook' ||
    NOTEBOOK_LESSONS.includes(lessonNum) ||
    normId.includes('notebook') ||
    normId.includes('ba-lo')
  ) {
    return []
  }

  // 1. Bài 1.1: Đúng 3 món đồ: Con mèo (🐱), Con cá vàng (🐠), Con cún (🐶)
  if (lessonNum === '1.1' || normId.includes('1-1') || normId.includes('1.1')) {
    return [
      { partNumber: 1, title: 'Con mèo', icon: '🐱', emoji: '🐱', iconImage: '/assets/aiki-keys/key_subject_cat.jpg' },
      { partNumber: 2, title: 'Con cá vàng', icon: '🐠', emoji: '🐠', iconImage: '/assets/pregenerated-fallback/magic-keys/goldfish_full_details_v1.webp' },
      { partNumber: 3, title: 'Con cún', icon: '🐶', emoji: '🐶', iconImage: '/assets/pregenerated-fallback/magic-keys/dog_one_word_v1.webp' },
    ]
  }

  // 2. Bài 1.2: Đúng 2 món đồ: Con cún (🐶), Cái xe đạp (🚲)
  if (lessonNum === '1.2' || normId.includes('1-2') || normId.includes('1.2')) {
    return [
      { partNumber: 1, title: 'Con cún', icon: '🐶', emoji: '🐶', iconImage: '/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp' },
      { partNumber: 2, title: 'Cái xe đạp', icon: '🚲', emoji: '🚲', iconImage: '/assets/aiki-islands/island1_lesson2_bicycle.jpg' },
    ]
  }

  // 3. Bài 1.3: Đúng 4 phong cách: Phong cách Màu nước, Phong cách Truyện tranh, Phong cách Đất nặn, Phong cách Tranh Đông Hồ
  if (lessonNum === '1.3' || normId.includes('1-3') || normId.includes('1.3')) {
    return [
      { partNumber: 1, title: 'Phong cách Màu nước', icon: '🎨', emoji: '🎨', iconImage: '/assets/pregenerated-fallback/style-prism/buffalo_watercolor_v1.webp' },
      { partNumber: 2, title: 'Phong cách Truyện tranh', icon: '✨', emoji: '✨', iconImage: '/assets/pregenerated-fallback/style-prism/buffalo_chibi_v1.webp' },
      { partNumber: 3, title: 'Phong cách Đất nặn', icon: '🧸', emoji: '🧸', iconImage: '/assets/pregenerated-fallback/style-prism/buffalo_clay_v1.webp' },
      { partNumber: 4, title: 'Phong cách Tranh Đông Hồ', icon: '🏮', emoji: '🏮', iconImage: '/assets/pregenerated-fallback/style-prism/buffalo_dongho_v1.webp' },
    ]
  }

  // 4. Bài 1.4 hoặc prompt-doctor: Đúng 4 ca bệnh (DEFAULT_PROMPT_DOCTOR_PARTS)
  if (normMode === 'prompt-doctor' || lessonNum === '1.4' || normId.includes('1-4') || normId.includes('1.4')) {
    return DEFAULT_PROMPT_DOCTOR_PARTS
  }

  // 5. Bài 2.2: Đúng 1 món đồ duy nhất: 'Bức tranh ba lớp của bé (Hậu cảnh - Ngôi sao - Tiền cảnh)'
  if (lessonNum === '2.2' || normId.includes('2-2') || normId.includes('2.2')) {
    return [
      { partNumber: 1, title: 'Bức tranh ba lớp của bé (Hậu cảnh - Ngôi sao - Tiền cảnh)', icon: '🌟', emoji: '🌟', iconImage: '/assets/aiki-islands/island2_lesson2_star.jpg' },
    ]
  }

  // 6. Bài 2.3: Đúng 4 món đồ ánh sáng: Buổi sáng, Giữa trưa, Chiều muộn, Buổi tối
  if (lessonNum === '2.3' || normId.includes('2-3') || normId.includes('2.3')) {
    return [
      { partNumber: 1, title: 'Buổi sáng (nắng vàng nhạt)', icon: '🌅', emoji: '🌅', iconImage: '/assets/pregenerated-fallback/light-atmosphere/light_morning_v1.webp' },
      { partNumber: 2, title: 'Giữa trưa (ánh sáng mạnh, bóng đậm)', icon: '☀️', emoji: '☀️', iconImage: '/assets/pregenerated-fallback/light-atmosphere/light_noon_v1.webp' },
      { partNumber: 3, title: 'Chiều muộn (nắng vàng cam, bóng dài)', icon: '🌇', emoji: '🌇', iconImage: '/assets/pregenerated-fallback/light-atmosphere/light_sunset_v1.webp' },
      { partNumber: 4, title: 'Buổi tối (xung quanh tối, một vùng sáng nhỏ)', icon: '🌙', emoji: '🌙', iconImage: '/assets/pregenerated-fallback/light-atmosphere/light_moon_v1.webp' },
    ]
  }

  // 7. Bài 2.4: Đúng 1 món đồ duy nhất: 'Bức tranh của bé (Ghép 4 mảnh)'
  if (lessonNum === '2.4' || normId.includes('2-4') || normId.includes('2.4')) {
    return [
      { partNumber: 1, title: 'Bức tranh của bé (Ghép 4 mảnh)', icon: '🧩', emoji: '🧩', iconImage: '/assets/aiki-islands/island2_lesson4_masterpiece.jpg' },
    ]
  }

  // 8. Bài 3.2: Đúng 1 món đồ duy nhất: 'Chọn nhân vật của bé & Nhận ảnh mẫu'
  if (lessonNum === '3.2' || normId.includes('3-2') || normId.includes('3.2')) {
    return [
      { partNumber: 1, title: 'Chọn nhân vật của bé & Nhận ảnh mẫu', icon: '👤', emoji: '👤', iconImage: '/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp' },
    ]
  }

  // 9. Bài 3.3: Đúng 6 biểu cảm: Vui 😊, Buồn 😢, Sợ 😨, Giận 😠, Ngạc nhiên 😲, Buồn ngủ 😴
  if (lessonNum === '3.3' || normId.includes('3-3') || normId.includes('3.3')) {
    return [
      { partNumber: 1, title: 'Biểu cảm Vui 😊', icon: '😊', emoji: '😊', iconImage: '/assets/pregenerated-fallback/identity-lock/fox_zico_happy_v1.webp' },
      { partNumber: 2, title: 'Biểu cảm Buồn 😢', icon: '😢', emoji: '😢', iconImage: '/assets/pregenerated-fallback/identity-lock/fox_zico_sad_v1.webp' },
      { partNumber: 3, title: 'Biểu cảm Sợ 😨', icon: '😨', emoji: '😨', iconImage: '/assets/pregenerated-fallback/identity-lock/fox_zico_scared_v1.webp' },
      { partNumber: 4, title: 'Biểu cảm Giận 😠', icon: '😠', emoji: '😠', iconImage: '/assets/pregenerated-fallback/identity-lock/fox_zico_angry_v1.webp' },
      { partNumber: 5, title: 'Biểu cảm Ngạc nhiên 😲', icon: '😲', emoji: '😲', iconImage: '/assets/pregenerated-fallback/identity-lock/fox_zico_surprised_v1.webp' },
      { partNumber: 6, title: 'Biểu cảm Buồn ngủ 😴', icon: '😴', emoji: '😴', iconImage: '/assets/pregenerated-fallback/identity-lock/fox_zico_sleepy_v1.webp' },
    ]
  }

  // 10. Bài 3.4: Đúng 1 món đồ duy nhất: 'Căn cứ bí mật của bạn ấy'
  if (lessonNum === '3.4' || normId.includes('3-4') || normId.includes('3.4')) {
    return [
      { partNumber: 1, title: 'Căn cứ bí mật của bạn ấy', icon: '🏰', emoji: '🏰', iconImage: '/assets/aiki-keys/key_where_pink.jpg' },
    ]
  }

  // 11. Bài 4.4: Đúng 8 khung storyboard truyện tranh (Khung 1 đến Khung 8)
  if (lessonNum === '4.4' || normId.includes('4-4') || normId.includes('4.4')) {
    return [
      { partNumber: 1, title: 'Khung 1', icon: '🎬', emoji: '🎬', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
      { partNumber: 2, title: 'Khung 2', icon: '🎬', emoji: '🎬', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
      { partNumber: 3, title: 'Khung 3', icon: '🎬', emoji: '🎬', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
      { partNumber: 4, title: 'Khung 4', icon: '🎬', emoji: '🎬', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
      { partNumber: 5, title: 'Khung 5', icon: '🎬', emoji: '🎬', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
      { partNumber: 6, title: 'Khung 6', icon: '🎬', emoji: '🎬', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
      { partNumber: 7, title: 'Khung 7', icon: '🎬', emoji: '🎬', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
      { partNumber: 8, title: 'Khung 8', icon: '🎬', emoji: '🎬', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
    ]
  }

  // 12. Bài 5.3: Đúng 12 lá thẻ sưu tập (Lá 1 đến Lá 12)
  if (lessonNum === '5.3' || normId.includes('5-3') || normId.includes('5.3')) {
    return Array.from({ length: 12 }, (_, i) => ({
      partNumber: i + 1,
      title: `Lá ${i + 1}`,
      icon: '🎴',
      emoji: '🎴',
      iconImage: '/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp',
    }))
  }

  // 13. Fallback theo mode nếu không truyền lessonId
  if (normMode === 'layer-stacking') {
    return DEFAULT_LAYER_STACKING_PARTS
  }

  if (normMode === 'card-forge') {
    return DEFAULT_CARD_FORGE_PARTS
  }

  if (normMode === 'identity-lock') {
    return DEFAULT_IDENTITY_LOCK_PARTS
  }

  if (normMode === 'style-prism') {
    return [
      { partNumber: 1, title: 'Phong cách Màu nước', icon: '🎨', emoji: '🎨', iconImage: '/assets/pregenerated-fallback/style-prism/buffalo_watercolor_v1.webp' },
      { partNumber: 2, title: 'Phong cách Truyện tranh', icon: '✨', emoji: '✨', iconImage: '/assets/pregenerated-fallback/style-prism/buffalo_chibi_v1.webp' },
      { partNumber: 3, title: 'Phong cách Đất nặn', icon: '🧸', emoji: '🧸', iconImage: '/assets/pregenerated-fallback/style-prism/buffalo_clay_v1.webp' },
      { partNumber: 4, title: 'Phong cách Tranh Đông Hồ', icon: '🏮', emoji: '🏮', iconImage: '/assets/pregenerated-fallback/style-prism/buffalo_dongho_v1.webp' },
    ]
  }

  // 14. Fallback mặc định magic-keys (hoặc gán subjectName nếu có)
  if (subjectName && subjectName !== 'Cái cốc sứ trắng' && !normSub.includes('cốc')) {
    return [
      { partNumber: 1, title: subjectName, icon: '🎨', iconImage: '/assets/aiki-islands/island1_lesson2_teacup.jpg' },
      { partNumber: 2, title: 'Cái xe đạp', icon: '🚲', iconImage: '/assets/aiki-islands/island1_lesson2_bicycle.jpg' },
    ]
  }

  return DEFAULT_MAGIC_KEYS_PARTS
}
