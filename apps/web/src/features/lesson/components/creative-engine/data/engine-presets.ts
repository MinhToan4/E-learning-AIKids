import type { CreativeEngineMode, EngineConfigInfo } from '../types'

export const ALL_CREATIVE_ENGINE_MODES: CreativeEngineMode[] = [
  'magic-keys',
  'style-prism',
  'prompt-doctor',
  'layer-stacking',
  'identity-lock',
  'card-forge',
]

export const ENGINE_CONFIGS: Record<CreativeEngineMode, EngineConfigInfo> = {
  'magic-keys': {
    mode: 'magic-keys',
    title: '4 Chìa Khóa Ma Thuật',
    shortName: '4 Chìa Khóa',
    icon: '🔑',
    description: 'Ghép 4 chìa khóa vàng: Ai? + Trông thế nào? + Đang làm gì? + Ở đâu?',
    badge: 'M1.1 · M1.2 · M4.2 · M5.1',
  },
  'style-prism': {
    mode: 'style-prism',
    title: 'Lăng Kính Phù Thủy',
    shortName: 'Lăng Kính',
    icon: '🔮',
    description: 'Xoay 4 lăng kính phong cách mỹ thuật: Đất nặn, Màu nước, Chibi, Đông Hồ',
    badge: 'M1.3 · M2.1 · M4.5 · M5.3',
  },
  'prompt-doctor': {
    mode: 'prompt-doctor',
    title: 'Bác Sĩ Câu Lệnh',
    shortName: 'Bác Sĩ AKI',
    icon: '🩺',
    description: 'Bắt bệnh tranh hỏng và gắn thẻ thuốc chữa lành câu lệnh',
    badge: 'M1.4 · M4.1 · M5.4',
  },
  'layer-stacking': {
    mode: 'layer-stacking',
    title: '3 Tầng Sân Khấu',
    shortName: '3 Tầng',
    icon: '🎭',
    description: 'Xếp bố cục không gian 3 tầng: Hậu cảnh - Ngôi sao 1/3 - Tiền cảnh',
    badge: 'M2.2 · M2.4 · M3.4 · M4.3',
  },
  'identity-lock': {
    mode: 'identity-lock',
    title: 'Khóa 3 Mật Mã & Biểu Cảm',
    shortName: 'Khóa Mật Mã',
    icon: '🔒',
    description: 'Khóa chặt 3 mật mã ADN bất biến và xoay bánh xe 6 biểu cảm',
    badge: 'M2.3 · M3.2 · M3.3 · M4.4',
  },
  'card-forge': {
    mode: 'card-forge',
    title: 'Xưởng Đúc Thẻ Bài TCG',
    shortName: 'Đúc Thẻ Bài',
    icon: '🃏',
    description: 'Phù phép mặt thẻ bài, hệ nguyên tố và cân bằng chỉ số sức mạnh',
    badge: 'M3.1 · M5.2 · M5.5',
  },
}

/**
 * Phân phối cố định cả 6 Game Engines cho toàn bộ 22 bài học từ M1.1 đến M5.5
 */
export const LESSON_ENGINE_MAP: Record<string, CreativeEngineMode> = {
  // M1: Khám Phá & Đặt Nền Móng
  '1.1': 'magic-keys',
  '1.2': 'magic-keys',
  '1.3': 'style-prism',
  '1.4': 'prompt-doctor',

  // M2: Không Gian & Bố Cục
  '2.1': 'style-prism',
  '2.2': 'layer-stacking',
  '2.3': 'identity-lock',
  '2.4': 'layer-stacking',

  // M3: Nhân Vật & Nhận Diện Nhất Quán
  '3.1': 'card-forge',
  '3.2': 'identity-lock',
  '3.3': 'identity-lock',
  '3.4': 'layer-stacking',

  // M4: Thế Giới Truyện Tranh & Khung Hình
  '4.1': 'prompt-doctor',
  '4.2': 'magic-keys',
  '4.3': 'layer-stacking',
  '4.4': 'identity-lock',
  '4.5': 'style-prism',

  // M5: Đấu Trường Thẻ Bài & Trò Chơi
  '5.1': 'magic-keys',
  '5.2': 'card-forge',
  '5.3': 'style-prism',
  '5.4': 'prompt-doctor',
  '5.5': 'card-forge',
}

/**
 * Trích xuất module và lesson key (dạng 'X.Y') từ lessonId (hỗ trợ bai-X-Y, mX.Y, islandX_lessonY, ...)
 */
export function extractLessonKey(lessonId: string): string | null {
  if (!lessonId) return null
  const normalized = lessonId.toLowerCase().trim()

  // Match islandX_lessonY hoặc islandX-lessonY
  const islandMatch = normalized.match(/island[_-]?([1-5])[_-]?(?:lesson[_-]?|b[_-]?)([1-5])/)
  if (islandMatch) {
    return `${islandMatch[1]}.${islandMatch[2]}`
  }

  // Match prefix bắt đầu với bai-X-Y, lesson-X-Y, mX-Y, mX.Y
  const prefixMatch = normalized.match(/^(?:bai|lesson|m)[_-]?([1-5])[-._]([1-5])/)
  if (prefixMatch) {
    return `${prefixMatch[1]}.${prefixMatch[2]}`
  }

  // Match dạng đứng độc lập X.Y hoặc X-Y ở đầu hoặc sau ký tự ngăn cách
  const generalMatch = normalized.match(/(?:^|[^0-9])([1-5])[-._]([1-5])(?:[^0-9]|$)/)
  if (generalMatch) {
    return `${generalMatch[1]}.${generalMatch[2]}`
  }

  return null
}

/**
 * Hàm băm chuỗi thành số nguyên dương để làm seed ngẫu nhiên ổn định (deterministic hash)
 */
export function hashStringToSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Chọn ngẫu nhiên 1 trong 6 creative engine mode.
 * Nếu truyền excludeCurrent, kết quả trả về chắc chắn khác với excludeCurrent.
 */
export function getRandomCreativeEngineMode(excludeCurrent?: CreativeEngineMode): CreativeEngineMode {
  const pool = excludeCurrent
    ? ALL_CREATIVE_ENGINE_MODES.filter((m) => m !== excludeCurrent)
    : ALL_CREATIVE_ENGINE_MODES
  const randomIndex = Math.floor(Math.random() * pool.length)
  return pool[randomIndex]
}

/**
 * Lấy Creative Engine Mode phù hợp nhất cho bài học hoặc dựa trên illustrationType / randomSeed
 */
export function getCreativeEngineMode(
  lessonId?: string,
  illustrationType?: string,
  randomSeed?: string | number
): CreativeEngineMode {
  // 1. Kiểm tra mapping cố định cho 22 bài học từ M1.1 đến M5.5
  if (lessonId) {
    const key = extractLessonKey(lessonId)
    if (key && LESSON_ENGINE_MAP[key]) {
      return LESSON_ENGINE_MAP[key]
    }
  }

  // 2. Tra cứu theo illustrationType đặc thù nếu không khớp mã bài học
  if (illustrationType) {
    const normalizedType = illustrationType.toLowerCase().trim()
    if (
      normalizedType.includes('dragon-card') ||
      normalizedType.includes('stat-budget') ||
      normalizedType.includes('magic-gear-back') ||
      normalizedType.includes('board-game-arena')
    ) {
      return 'card-forge'
    }

    if (
      normalizedType.includes('soc-bong') ||
      normalizedType.includes('fire-fox') ||
      normalizedType.includes('profile-dna') ||
      normalizedType.includes('six-expressions')
    ) {
      return 'identity-lock'
    }

    if (
      normalizedType.includes('sun-ship') ||
      normalizedType.includes('layer-composition') ||
      normalizedType.includes('animal-family') ||
      normalizedType.includes('gallery-frame') ||
      normalizedType.includes('tree-hollow-base') ||
      normalizedType.includes('storyboard-panels')
    ) {
      return 'layer-stacking'
    }

    if (
      normalizedType.includes('candy-castle') ||
      normalizedType.includes('four-styles') ||
      normalizedType.includes('color-emotions')
    ) {
      return 'style-prism'
    }

    if (
      normalizedType.includes('knight-hand') ||
      normalizedType.includes('engineer-fix')
    ) {
      return 'prompt-doctor'
    }

    if (
      normalizedType.includes('cat-fat') ||
      normalizedType.includes('rabbit-car') ||
      normalizedType.includes('teacup')
    ) {
      return 'magic-keys'
    }
  }

  // 3. Hỗ trợ randomSeed hoặc hash ngẫu nhiên khi bài học chưa có cấu hình cố định
  if (randomSeed !== undefined && randomSeed !== null) {
    const seedNum = typeof randomSeed === 'number' ? Math.abs(randomSeed) : hashStringToSeed(String(randomSeed))
    return ALL_CREATIVE_ENGINE_MODES[seedNum % ALL_CREATIVE_ENGINE_MODES.length]
  }

  if (lessonId && lessonId.trim()) {
    const hash = hashStringToSeed(lessonId.trim().toLowerCase())
    return ALL_CREATIVE_ENGINE_MODES[hash % ALL_CREATIVE_ENGINE_MODES.length]
  }

  // 4. Mặc định dự phòng
  return 'magic-keys'
}
