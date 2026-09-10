import type { CreativeEngineMode, EngineConfigInfo } from '../types'

export const ENGINE_CONFIGS: Record<CreativeEngineMode, EngineConfigInfo> = {
  'magic-keys': {
    mode: 'magic-keys',
    title: '4 Chìa Khóa Ma Thuật',
    shortName: '4 Chìa Khóa',
    icon: '🔑',
    description: 'Ghép 4 chìa khóa vàng: Ai? + Trông thế nào? + Đang làm gì? + Ở đâu?',
    badge: 'M1.1 · M1.2',
  },
  'style-prism': {
    mode: 'style-prism',
    title: 'Lăng Kính Phù Thủy',
    shortName: 'Lăng Kính',
    icon: '🔮',
    description: 'Xoay 4 lăng kính phong cách mỹ thuật: Đất nặn, Màu nước, Chibi, Đông Hồ',
    badge: 'M1.3 · M5.3',
  },
  'prompt-doctor': {
    mode: 'prompt-doctor',
    title: 'Bác Sĩ Câu Lệnh',
    shortName: 'Bác Sĩ AKI',
    icon: '🩺',
    description: 'Bắt bệnh tranh hỏng và gắn thẻ thuốc chữa lành câu lệnh',
    badge: 'M1.4 · Sửa Lỗi',
  },
  'layer-stacking': {
    mode: 'layer-stacking',
    title: '3 Tầng Sân Khấu',
    shortName: '3 Tầng',
    icon: '🎭',
    description: 'Xếp bố cục không gian 3 tầng: Hậu cảnh - Ngôi sao 1/3 - Tiền cảnh',
    badge: 'M2.2 · M2.4',
  },
  'identity-lock': {
    mode: 'identity-lock',
    title: 'Khóa 3 Mật Mã & Biểu Cảm',
    shortName: 'Khóa Mật Mã',
    icon: '🔒',
    description: 'Khóa chặt 3 mật mã ADN bất biến và xoay bánh xe 6 biểu cảm',
    badge: 'M3.2 · M3.3',
  },
  'card-forge': {
    mode: 'card-forge',
    title: 'Xưởng Đúc Thẻ Bài TCG',
    shortName: 'Đúc Thẻ Bài',
    icon: '🃏',
    description: 'Phù phép mặt thẻ bài, hệ nguyên tố và cân bằng chỉ số sức mạnh',
    badge: 'M5.2 · TCG',
  },
}

export function getCreativeEngineMode(lessonId?: string, illustrationType?: string): CreativeEngineMode {
  if (!lessonId && !illustrationType) return 'magic-keys'

  const normalizedLesson = (lessonId || '').toLowerCase()
  const normalizedType = (illustrationType || '').toLowerCase()

  // 1. Check style prism
  if (
    normalizedLesson.includes('1-3') ||
    normalizedLesson.includes('5-3') ||
    normalizedType.includes('candy-castle') ||
    normalizedType.includes('four-styles')
  ) {
    return 'style-prism'
  }

  // 2. Check prompt doctor
  if (
    normalizedLesson.includes('1-4') ||
    normalizedType.includes('knight-hand') ||
    normalizedType.includes('engineer-fix')
  ) {
    return 'prompt-doctor'
  }

  // 3. Check layer stacking
  if (
    normalizedLesson.includes('2-2') ||
    normalizedLesson.includes('2-4') ||
    normalizedType.includes('sun-ship') ||
    normalizedType.includes('layer-composition') ||
    normalizedType.includes('animal-family') ||
    normalizedType.includes('gallery-frame')
  ) {
    return 'layer-stacking'
  }

  // 4. Check identity lock
  if (
    normalizedLesson.includes('3-2') ||
    normalizedLesson.includes('3-3') ||
    normalizedLesson.includes('3-4') ||
    normalizedType.includes('soc-bong') ||
    normalizedType.includes('fire-fox') ||
    normalizedType.includes('profile-dna')
  ) {
    return 'identity-lock'
  }

  // 5. Check card forge
  if (
    normalizedLesson.includes('5-2') ||
    normalizedLesson.includes('5-1') ||
    normalizedType.includes('dragon-card')
  ) {
    return 'card-forge'
  }

  // 6. Magic keys default (M1.1, M1.2, or default fallback)
  return 'magic-keys'
}
