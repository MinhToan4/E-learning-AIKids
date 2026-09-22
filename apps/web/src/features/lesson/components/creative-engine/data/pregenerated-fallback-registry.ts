import type { CreativeEngineMode } from '../types'

export interface FallbackImageEntry {
  id: string
  engineMode: CreativeEngineMode
  keywords: string[]
  variants: [string, string, ...string[]] // Ít nhất 2 ảnh khác nhau cho mỗi entry
  description: string
}

/**
 * Kho ảnh tạo sẵn dự phòng (Pregenerated Fallback Registry)
 * Đảm bảo 100% các chủ đề bài học của 6 Creative Engine tạo ảnh đều có ít nhất 2 biến thể khác nhau.
 */
export const PREGENERATED_FALLBACK_REGISTRY: FallbackImageEntry[] = [
  // ── 1. PROMPT DOCTOR (BÁC SĨ CÂU LỆNH) ──────────────────────────────────
  {
    id: 'doctor-hand-cured',
    engineMode: 'prompt-doctor',
    keywords: ['tay', 'ngón tay', '5 ngón', 'hiệp sĩ', 'giáp bạc', 'bàn tay', 'knight', 'hand', 'năm ngón'],
    variants: [
      '/assets/aiki-doctor/doctor_hand_cured_v1.webp',
      '/assets/aiki-doctor/doctor_hand_cured_v2.webp',
    ],
    description: 'Bàn tay hiệp sĩ 5 ngón giáp bạc chuẩn chỉnh (chữa dị tật thừa ngón)',
  },
  {
    id: 'doctor-squirrel-cured',
    engineMode: 'prompt-doctor',
    keywords: ['sóc', 'mũ len', 'quả bông', 'sóc bông', 'mũ đỏ', 'squirrel', 'đội mũ'],
    variants: [
      '/assets/aiki-doctor/doctor_squirrel_cured_v1.webp',
      '/assets/aiki-doctor/doctor_squirrel_cured_v2.webp',
    ],
    description: 'Sóc Bông đội mũ len đỏ quả bông ấm áp trong rừng thông',
  },
  {
    id: 'doctor-cat-cured',
    engineMode: 'prompt-doctor',
    keywords: ['ghế mây', 'nằm ngủ', 'mèo mướp', 'đệm', 'cửa sổ', 'mèo', 'cat', 'bay lơ lửng'],
    variants: [
      '/assets/aiki-doctor/doctor_cat_cured_v1.webp',
      '/assets/aiki-doctor/doctor_cat_cured_v2.webp',
    ],
    description: 'Mèo Mướp vàng béo tròn ngủ êm ái trên ghế mây lót đệm',
  },
  {
    id: 'doctor-clutter-cured',
    engineMode: 'prompt-doctor',
    keywords: ['dọn sạch', 'phông nền', 'gọn gàng', 'rác thừa', 'không chi tiết thừa', 'clean', 'spotless', 'tranh lem nhem', 'xưởng rèn'],
    variants: [
      '/assets/aiki-doctor/doctor_clutter_cured_v1.webp',
      '/assets/aiki-doctor/doctor_clutter_cured_v2.webp',
    ],
    description: 'Bức tranh xưởng vẽ sạch sẽ tinh tươm, ánh sáng ngập tràn không chi tiết thừa',
  },

  // ── 2. MAGIC KEYS (4 CHÌA KHÓA MA THUẬT) ────────────────────────────────
  {
    id: 'magic-cat-details',
    engineMode: 'magic-keys',
    keywords: ['ghế mây', 'cửa sổ', 'ngủ', 'nằm ngủ', 'đệm bông', 'đệm', 'mèo ngủ', 'ngủ khò', 'cat sleeping'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/cat_full_details_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/cat_full_details_v2.webp',
      '/assets/pregenerated-fallback/magic-keys/cat_fat_sleeping_v1.webp',
    ],
    description: 'Mèo mướp vàng béo tròn ngủ êm ái trên ghế mây lót đệm bông',
  },
  {
    id: 'magic-cat-butterfly',
    engineMode: 'magic-keys',
    keywords: ['bắt bướm', 'vườn hoa', 'nắng vàng', 'butterfly', 'vườn nắng', 'chú bướm', 'vờn bướm'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/cat_butterfly_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/cat_butterfly_v2.webp',
    ],
    description: 'Chú mèo mướp nhảy tung tăng vồ bướm vàng giữa vườn hoa nắng',
  },
  {
    id: 'magic-cat-astronaut',
    engineMode: 'magic-keys',
    keywords: ['phi hành gia', 'vũ trụ', 'không gian', 'astronaut', 'mũ kính', 'hành tinh', 'sao thổ', 'space'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/cat_astronaut_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/cat_astronaut_v2.webp',
    ],
    description: 'Mèo phi hành gia trôi lơ lửng ngoài vũ trụ chơi đùa với các hành tinh',
  },
  {
    id: 'magic-cat-oneword',
    engineMode: 'magic-keys',
    keywords: ['mèo', 'con mèo', 'cat'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/cat_one_word_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/cat_one_word_v2.webp',
    ],
    description: 'Mèo đơn sắc (1 từ thử nghiệm)',
  },
  {
    id: 'magic-dog-details',
    engineMode: 'magic-keys',
    keywords: ['chó lông xù', 'chó vàng', 'sân cỏ', 'cắn bóng', 'chạy đuổi quả bóng', 'dog details'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/dog_full_details_v2.webp',
    ],
    description: 'Chú cún lông vàng tinh nghịch vờn bóng trên sân gạch cỏ xanh',
  },
  {
    id: 'magic-dog-oneword',
    engineMode: 'magic-keys',
    keywords: ['chó', 'con chó', 'chú cún', 'dog', 'puppy'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/dog_one_word_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/dog_one_word_v2.webp',
    ],
    description: 'Chú chó đơn sắc (1 từ thử nghiệm)',
  },
  {
    id: 'magic-rabbit-details',
    engineMode: 'magic-keys',
    keywords: ['thỏ trắng', 'lái xe', 'cà rốt', 'xe cà rốt', 'rabbit details'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/rabbit_full_details_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/rabbit_full_details_v2.webp',
    ],
    description: 'Bé thỏ trắng lái chiếc xe hơi cà rốt cam rực rỡ',
  },
  {
    id: 'magic-rabbit-oneword',
    engineMode: 'magic-keys',
    keywords: ['thỏ', 'con thỏ', 'rabbit', 'bunny'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/rabbit_one_word_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/rabbit_one_word_v2.webp',
    ],
    description: 'Chú thỏ đơn sắc (1 từ thử nghiệm)',
  },
  {
    id: 'magic-goldfish-details',
    engineMode: 'magic-keys',
    keywords: ['cá vàng', 'bơi lội', 'bong bóng', 'goldfish', 'chú cá', 'bể cá', 'cá'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/goldfish_full_details_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/goldfish_one_word_v1.webp',
    ],
    description: 'Chú cá vàng béo tròn bơi lội tung tăng trong làn nước trong vắt với bọt khí đất nặn',
  },
  {
    id: 'magic-teacup',
    engineMode: 'magic-keys',
    keywords: ['tách trà', 'khói sao', 'mẻ miệng', 'teacup', 'ngôi sao lấp lánh', 'trà'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/teacup_steam_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/teacup_steam_v2.webp',
    ],
    description: 'Tách trà sứ men trắng mẻ miệng tỏa làn khói hình ngôi sao ma thuật',
  },
  {
    id: 'magic-bicycle',
    engineMode: 'magic-keys',
    keywords: ['xe đạp', 'mini', 'giỏ hoa', 'hoa cúc', 'bicycle', 'xe đạp hoa'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/bicycle_mini_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/bicycle_mini_v2.webp',
    ],
    description: 'Chiếc xe đạp mini màu pastel chở giỏ hoa cúc họa mi',
  },
  {
    id: 'magic-notebook',
    engineMode: 'magic-keys',
    keywords: ['sổ tay', 'bìa da', 'bản vẽ', 'đất nặn', 'notebook', 'nhật ký'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/notebook_leather_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/notebook_leather_v2.webp',
    ],
    description: 'Cuốn sổ tay bìa da nâu mở ra những trang vẽ hình đất nặn rực rỡ',
  },
  {
    id: 'magic-clock',
    engineMode: 'magic-keys',
    keywords: ['đồng hồ', 'báo thức', 'mắt cười', 'vintage', 'clock', 'bàn học'],
    variants: [
      '/assets/pregenerated-fallback/magic-keys/clock_vintage_v1.webp',
      '/assets/pregenerated-fallback/magic-keys/clock_vintage_v2.webp',
    ],
    description: 'Chiếc đồng hồ báo thức cổ điển có khuôn mặt cười ngộ nghĩnh',
  },

  // ── 3. STYLE PRISM (LĂNG KÍNH PHÙ THỦY) ─────────────────────────────────
  {
    id: 'style-buffalo-clay',
    engineMode: 'style-prism',
    keywords: ['trâu', 'con trâu', 'đất nặn', 'soft clay', 'ruộng lúa', 'buffalo clay'],
    variants: [
      '/assets/pregenerated-fallback/style-prism/buffalo_clay_v1.webp',
      '/assets/pregenerated-fallback/style-prism/buffalo_clay_v2.webp',
    ],
    description: 'Chú trâu đất nặn Soft Clay bo tròn gặm cỏ bờ ruộng lúa vàng',
  },
  {
    id: 'style-buffalo-watercolor',
    engineMode: 'style-prism',
    keywords: ['trâu', 'con trâu', 'màu nước', 'watercolor', 'loang', 'buffalo watercolor'],
    variants: [
      '/assets/pregenerated-fallback/style-prism/buffalo_watercolor_v1.webp',
      '/assets/pregenerated-fallback/style-prism/buffalo_watercolor_v2.webp',
    ],
    description: 'Tranh màu nước loang mềm mại trong trẻo về chú trâu bên hồ sen',
  },
  {
    id: 'style-buffalo-chibi',
    engineMode: 'style-prism',
    keywords: ['trâu', 'con trâu', 'chibi', 'truyện tranh', 'manga', 'anime', 'buffalo chibi'],
    variants: [
      '/assets/pregenerated-fallback/style-prism/buffalo_chibi_v1.webp',
      '/assets/pregenerated-fallback/style-prism/buffalo_chibi_v2.webp',
    ],
    description: 'Chú nghé con chibi truyện tranh mắt tròn xoe long lanh',
  },
  {
    id: 'style-buffalo-dongho',
    engineMode: 'style-prism',
    keywords: ['trâu', 'con trâu', 'đông hồ', 'dân gian', 'giấy điệp', 'giấy dó', 'buffalo dong ho'],
    variants: [
      '/assets/pregenerated-fallback/style-prism/buffalo_dongho_v1.webp',
      '/assets/pregenerated-fallback/style-prism/buffalo_dongho_v2.webp',
    ],
    description: 'Tranh khắc gỗ dân gian Đông Hồ chú trâu gặm cỏ trên giấy điệp',
  },
  {
    id: 'style-dog-clay',
    engineMode: 'style-prism',
    keywords: ['cún', 'chó', 'quả bóng', 'sân gạch', 'đất nặn', 'dog clay'],
    variants: [
      '/assets/pregenerated-fallback/style-prism/dog_clay_v1.webp',
      '/assets/pregenerated-fallback/style-prism/dog_clay_v2.webp',
    ],
    description: 'Chú cún đất nặn nhảy nhót đuổi bóng đỏ trên sân gạch ấm áp',
  },
  {
    id: 'style-dog-watercolor',
    engineMode: 'style-prism',
    keywords: ['cún', 'chó', 'màu nước', 'watercolor', 'dog watercolor'],
    variants: [
      '/assets/pregenerated-fallback/style-prism/dog_watercolor_v1.webp',
      '/assets/pregenerated-fallback/style-prism/dog_watercolor_v2.webp',
    ],
    description: 'Tranh màu nước loang mềm nghệ thuật chú cún vờn bóng đỏ',
  },
  {
    id: 'style-dog-chibi',
    engineMode: 'style-prism',
    keywords: ['cún', 'chó', 'chibi', 'manga', 'anime', 'dog chibi'],
    variants: [
      '/assets/pregenerated-fallback/style-prism/dog_chibi_v1.webp',
      '/assets/pregenerated-fallback/style-prism/dog_chibi_v2.webp',
    ],
    description: 'Chú cún chibi nét vẽ phẳng tươi sáng ngộ nghĩnh',
  },
  {
    id: 'style-dog-dongho',
    engineMode: 'style-prism',
    keywords: ['cún', 'chó', 'đông hồ', 'dân gian', 'dog dong ho'],
    variants: [
      '/assets/pregenerated-fallback/style-prism/dog_dongho_v1.webp',
      '/assets/pregenerated-fallback/style-prism/dog_dongho_v2.webp',
    ],
    description: 'Tranh dân gian Đông Hồ chú chó vằn hoa văn chơi bóng đỏ',
  },

  // ── 4. LAYER STACKING (3 TẦNG SÂN KHẤU) ─────────────────────────────────
  {
    id: 'layer-sun-ship',
    engineMode: 'layer-stacking',
    keywords: ['thuyền', 'mặt trời', 'sân khấu', 'tiền cảnh', 'hậu cảnh', 'ngôi sao', 'ship', 'sun', '1/3'],
    variants: [
      '/assets/pregenerated-fallback/layer-stacking/ship_sunset_v1.webp',
      '/assets/pregenerated-fallback/layer-stacking/ship_sunset_v2.webp',
      '/assets/aiki-islands/island2_lesson2_opt_a.jpg',
    ],
    description: 'Thuyền buồm mặt trời nổi bật ở vị trí 1/3 với chiều sâu 3 tầng bố cục',
  },
  {
    id: 'layer-squirrel-star',
    engineMode: 'layer-stacking',
    keywords: ['sóc', 'sóc bông', 'quả thông', 'rừng thông', 'sân khấu', 'bố cục 1/3'],
    variants: [
      '/assets/pregenerated-fallback/layer-stacking/squirrel_star_v1.webp',
      '/assets/pregenerated-fallback/layer-stacking/squirrel_star_v2.webp',
    ],
    description: 'Sóc Bông giữ vị trí Ngôi Sao 1/3 với 3 tầng sân khấu rừng thông',
  },
  {
    id: 'layer-hot-air-balloon',
    engineMode: 'layer-stacking',
    keywords: ['khinh khí cầu', 'bầu trời', 'cầu vồng', 'mây', 'balloon', 'bay'],
    variants: [
      '/assets/pregenerated-fallback/layer-stacking/balloon_layer_v1.webp',
      '/assets/pregenerated-fallback/layer-stacking/balloon_layer_v2.webp',
    ],
    description: 'Khinh khí cầu sắc màu nổi bật giữa 3 tầng mây và thung lũng',
  },
  {
    id: 'layer-lighting-atmosphere',
    engineMode: 'layer-stacking',
    keywords: ['ban mai', 'nắng trưa', 'hoàng hôn', 'ánh trăng', 'mặt trời', 'buổi sáng', 'buổi tối', 'morning', 'sunset', 'noon', 'moonlight', 'ánh sáng'],
    variants: [
      '/assets/pregenerated-fallback/light-atmosphere/light_morning_v1.webp',
      '/assets/pregenerated-fallback/light-atmosphere/light_noon_v1.webp',
      '/assets/pregenerated-fallback/light-atmosphere/light_sunset_v1.webp',
      '/assets/pregenerated-fallback/light-atmosphere/light_moon_v1.webp',
    ],
    description: 'Các tầng ánh sáng cảm xúc: Ban Mai, Nắng Trưa, Hoàng Hôn và Đêm Trăng Soft Clay',
  },

  // ── 5. IDENTITY LOCK (KHÓA 3 MẬT MÃ & BIỂU CẢM) ─────────────────────────
  {
    id: 'identity-fox-zico',
    engineMode: 'identity-lock',
    keywords: ['cáo', 'cáo lửa', 'zico', 'áo choàng đỏ', 'sao vàng', 'khăn rằn', 'hiệp sĩ', 'fox'],
    variants: [
      '/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp',
      '/assets/pregenerated-fallback/identity-lock/fox_zico_v2.webp',
    ],
    description: 'Cáo Lửa Zico Hiệp Sĩ giữ trọn vẹn 3 mật mã ADN (áo choàng đỏ sao vàng)',
  },
  {
    id: 'identity-fox-emotions',
    engineMode: 'identity-lock',
    keywords: ['biểu cảm', 'vui', 'buồn', 'sợ', 'giận', 'ngạc nhiên', 'buồn ngủ', 'cảm xúc', 'khóc', 'cười', 'hờn dỗi'],
    variants: [
      '/assets/pregenerated-fallback/identity-lock/fox_zico_happy_v1.webp',
      '/assets/pregenerated-fallback/identity-lock/fox_zico_sad_v1.webp',
      '/assets/pregenerated-fallback/identity-lock/fox_zico_scared_v1.webp',
      '/assets/pregenerated-fallback/identity-lock/fox_zico_angry_v1.webp',
      '/assets/pregenerated-fallback/identity-lock/fox_zico_surprised_v1.webp',
      '/assets/pregenerated-fallback/identity-lock/fox_zico_sleepy_v1.webp',
    ],
    description: 'Trọn bộ 6 biểu cảm ADN của Cáo Lửa Zico (Vui, Buồn, Sợ, Giận, Ngạc nhiên, Buồn ngủ)',
  },
  {
    id: 'identity-robot-leo',
    engineMode: 'identity-lock',
    keywords: ['robot', 'leo', 'số 7', 'mắt xanh', 'ăng ten', 'giáp bạc'],
    variants: [
      '/assets/pregenerated-fallback/identity-lock/robot_leo_v1.webp',
      '/assets/pregenerated-fallback/identity-lock/robot_leo_v2.webp',
    ],
    description: 'Chú Bé Robot Leo với 3 mật mã nhận diện (mắt kính phát sáng, áo giáp số 7)',
  },
  {
    id: 'identity-cat-mimi',
    engineMode: 'identity-lock',
    keywords: ['mèo', 'thám tử', 'mimi', 'mũ bê rê', 'kính lúp', 'nơ cổ'],
    variants: [
      '/assets/pregenerated-fallback/identity-lock/cat_mimi_v1.webp',
      '/assets/pregenerated-fallback/identity-lock/cat_mimi_v2.webp',
    ],
    description: 'Mèo Thám Tử Mimi với mũ bê rê ca rô và kính lúp phá án',
  },

  // ── 6. CARD FORGE (XƯỞNG ĐÚC THẺ BÀI TCG) ───────────────────────────────
  {
    id: 'card-frost-dragon',
    engineMode: 'card-forge',
    keywords: ['thẻ bài', 'rồng', 'băng', 'rồng băng', 'tuyết', 'frost dragon', 'tcg', 'card'],
    variants: [
      '/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp',
      '/assets/pregenerated-fallback/card-forge/card_frost_dragon_v2.webp',
    ],
    description: 'Thẻ bài TCG Rồng Băng Bão Tuyết viền vàng lấp lánh chỉ số cân bằng',
  },
  {
    id: 'card-fire-fox',
    engineMode: 'card-forge',
    keywords: ['thẻ bài', 'cáo lửa', 'hỏa', 'kiếm lửa', 'fire fox', 'warrior', 'card'],
    variants: [
      '/assets/pregenerated-fallback/card-forge/card_fire_fox_v1.webp',
      '/assets/pregenerated-fallback/card-forge/card_fire_fox_v2.webp',
    ],
    description: 'Thẻ bài TCG Hiệp Sĩ Cáo Lửa nguyên tố Hỏa với chỉ số chiến đấu',
  },
  {
    id: 'card-thunder-dragon',
    engineMode: 'card-forge',
    keywords: ['thẻ bài', 'lôi long', 'sấm sét', 'sét', 'rồng sét', 'thunder dragon', 'lightning', 'card'],
    variants: [
      '/assets/pregenerated-fallback/card-forge/card_thunder_dragon_v1.webp',
      '/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp',
    ],
    description: 'Thẻ bài TCG Rồng Sấm Sét viền vàng lấp lánh hệ Lôi',
  },
]

/**
 * Biến thể mặc định tổng quát khi câu lệnh không khớp với bất kỳ từ khóa chuyên biệt nào
 */
export const DEFAULT_FALLBACK_VARIANTS: [string, string, ...string[]] = [
  '/assets/pregenerated-fallback/magic-keys/cat_full_details_v1.webp',
  '/assets/pregenerated-fallback/style-prism/buffalo_clay_v1.webp',
  '/assets/pregenerated-fallback/layer-stacking/ship_sunset_v1.webp',
  '/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp',
  '/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp',
  '/assets/aiki-doctor/doctor_hand_cured_v1.webp',
  '/assets/aiki-doctor/doctor_squirrel_cured_v1.webp',
  '/assets/aiki-doctor/doctor_cat_cured_v1.webp',
]

/**
 * Chuẩn hóa chuỗi tìm kiếm (chuyển chữ thường, cắt khoảng trắng, loại bỏ dấu thanh để tra cứu linh hoạt)
 */
function normalizeSearchText(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Tra cứu ảnh fallback không bao giờ lặp lại ảnh vừa hiển thị (Non-Repeating Fallback)
 *
 * @param prompt - Câu lệnh hoặc ngữ cảnh tạo ảnh hiện tại
 * @param lastImageUrl - Đường dẫn ảnh vừa được hiển thị ở lần bấm gần nhất
 * @param engineMode - Chế độ Creative Engine tương ứng (tùy chọn để lọc nhanh hơn)
 * @returns Đường dẫn ảnh mới từ kho tạo sẵn, chắc chắn KHÁC với lastImageUrl
 */
export function getNonRepeatingFallbackImage(
  prompt: string,
  lastImageUrl?: string,
  engineMode?: CreativeEngineMode | string
): string {
  const normPrompt = normalizeSearchText(prompt)

  // 1. Tìm entry phù hợp nhất dựa trên Trọng số độ đặc thù (Specificity Scoring)
  let matchedEntry: FallbackImageEntry | undefined

  if (normPrompt) {
    const candidates = engineMode
      ? PREGENERATED_FALLBACK_REGISTRY.filter((e) => e.engineMode === engineMode)
      : PREGENERATED_FALLBACK_REGISTRY

    let bestScore = 0

    for (const entry of candidates) {
      let score = 0
      let matchedCount = 0

      for (const kw of entry.keywords) {
        const normKw = normalizeSearchText(kw)
        if (normKw && normPrompt.includes(normKw)) {
          matchedCount++
          // Trọng số theo độ dài từ khóa: từ khóa càng dài càng đặc thù (ví dụ "phi hanh gia" > "meo")
          score += normKw.length * 3
        }
      }

      if (matchedCount > 0) {
        // Xử lý thông minh cho các entry "1 từ" (oneword):
        // Nếu là entry 1 từ (như magic-cat-oneword), nhưng câu lệnh của bé lại dài và có các chìa khóa mô tả chi tiết,
        // thì ưu tiên các entry chi tiết thay vì rơi vào entry 1 từ!
        const isOneWordEntry = entry.id.includes('-oneword')
        if (isOneWordEntry) {
          const words = normPrompt.split(/\s+/).filter(Boolean)
          if (words.length <= 2) {
            // Đúng là bé chỉ nhập 1-2 từ ngắn (chưa đủ 4 chìa khóa) -> Cộng điểm cao cho entry 1 từ!
            score += 50
          } else {
            // Bé đã ghép nhiều chìa khóa -> Giảm điểm entry 1 từ để nhường cho entry chi tiết
            score = Math.max(1, score - 20)
          }
        }

        if (score > bestScore) {
          bestScore = score
          matchedEntry = entry
        }
      }
    }
  }

  const pool: string[] = matchedEntry ? matchedEntry.variants : DEFAULT_FALLBACK_VARIANTS

  // 2. Lọc bỏ ảnh vừa được hiển thị để chống lặp tuyệt đối
  const eligibleVariants = lastImageUrl
    ? pool.filter((img) => img !== lastImageUrl)
    : pool

  // 3. Nếu còn ứng viên, bốc ngẫu nhiên một ứng viên
  if (eligibleVariants.length > 0) {
    const randomIndex = Math.floor(Math.random() * eligibleVariants.length)
    return eligibleVariants[randomIndex]
  }

  // 4. Nếu toàn bộ pool trùng với lastImageUrl (trường hợp cực hiếm), fallback sang pool mặc định
  const defaultEligible = lastImageUrl
    ? DEFAULT_FALLBACK_VARIANTS.filter((img) => img !== lastImageUrl)
    : DEFAULT_FALLBACK_VARIANTS

  if (defaultEligible.length > 0) {
    const randomIndex = Math.floor(Math.random() * defaultEligible.length)
    return defaultEligible[randomIndex]
  }

  return pool[0]
}
