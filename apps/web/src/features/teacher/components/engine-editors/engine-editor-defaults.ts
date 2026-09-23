import type {
  SixStagePracticePartDef,
  SixStageFourKeysOptions,
  SixStageStylePrismOption,
  SixStagePromptDoctorCase,
  SixStageLayerStackingOptions,
  SixStageCardForgeOptions,
} from '../../../../shared/lib/api'

export const DEFAULT_MAGIC_KEYS_PARTS: SixStagePracticePartDef[] = [
  { partNumber: 1, title: 'Cái cốc sứ trắng', icon: '☕', emoji: '☕', iconImage: '/assets/aiki-islands/island1_lesson2_teacup.jpg' },
  { partNumber: 2, title: 'Cái xe đạp', icon: '🚲', emoji: '🚲', iconImage: '/assets/aiki-islands/island1_lesson2_bicycle.jpg' },
  { partNumber: 3, title: 'Cuốn sổ tay bìa da', icon: '📖', emoji: '📖', iconImage: '/assets/aiki-islands/island1_lesson2_notebook.jpg' },
]

export const DEFAULT_STYLE_PRISM_PARTS: SixStagePracticePartDef[] = [
  { partNumber: 1, title: 'Chú Trâu Đất Nặn', icon: '🐃', emoji: '🐃', iconImage: '/assets/aiki-keys/key_what_blue.jpg' },
  { partNumber: 2, title: 'Chú Mèo Béo Múp', icon: '🐱', emoji: '🐱', iconImage: '/assets/aiki-islands/island1_lesson1_cat.jpg' },
  { partNumber: 3, title: 'Bạn Robot Tí Hon', icon: '🤖', emoji: '🤖', iconImage: '/assets/aiki-keys/key_action_orange.jpg' },
  { partNumber: 4, title: 'Lâu Đài Cổ Tích', icon: '🏰', emoji: '🏰', iconImage: '/assets/aiki-keys/key_where_pink.jpg' },
]

export const DEFAULT_PROMPT_DOCTOR_PARTS: SixStagePracticePartDef[] = [
  { partNumber: 1, title: 'Ca 1: Hiệp Sĩ Bạc (Bàn tay 5 ngón)', icon: '✋', emoji: '✋', iconImage: '/assets/aiki-doctor/doctor_hand_broken_v1.webp' },
  { partNumber: 2, title: 'Ca 2: Sóc Bông (Mũ len đỏ quả bông)', icon: '🐿️', emoji: '🐿️', iconImage: '/assets/aiki-doctor/doctor_squirrel_shivering_v1.webp' },
  { partNumber: 3, title: 'Ca 3: Mèo Mướp (Ghế mây đệm êm)', icon: '🐱', emoji: '🐱', iconImage: '/assets/aiki-doctor/doctor_cat_floating_v1.webp' },
  { partNumber: 4, title: 'Ca 4: Tranh Lem Nhem (Dọn sạch nền)', icon: '🧹', emoji: '🧹', iconImage: '/assets/aiki-doctor/doctor_clutter_broken_v1.webp' },
]

export const DEFAULT_LAYER_STACKING_PARTS: SixStagePracticePartDef[] = [
  { partNumber: 1, title: 'Hiệp Sĩ Cáo Lửa (Điểm vàng 1/3)', icon: '🦊', emoji: '🦊', iconImage: '/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp' },
  { partNumber: 2, title: 'Sóc Bông Hạt Dẻ (Điểm vàng 1/3)', icon: '🐿️', emoji: '🐿️', iconImage: '/assets/pregenerated-fallback/layer-stacking/squirrel_star_v1.webp' },
  { partNumber: 3, title: 'Thuyền Buồm Vàng (Điểm vàng 1/3)', icon: '⛵', emoji: '⛵', iconImage: '/assets/pregenerated-fallback/layer-stacking/ship_sunset_v1.webp' },
  { partNumber: 4, title: 'Mèo Phi Hành Gia (Điểm vàng 1/3)', icon: '🐱', emoji: '🐱', iconImage: '/assets/pregenerated-fallback/magic-keys/cat_astronaut_v1.webp' },
]

export const DEFAULT_IDENTITY_LOCK_PARTS: SixStagePracticePartDef[] = [
  { partNumber: 1, title: 'Chú Sóc Bông Hạt Dẻ', icon: '🐿️', emoji: '🐿️', iconImage: '/assets/aiki-doctor/doctor_squirrel_cured_v1.webp' },
  { partNumber: 2, title: 'Cáo Lửa Zico Hiệp Sĩ', icon: '🦊', emoji: '🦊', iconImage: '/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp' },
  { partNumber: 3, title: 'Chú Bé Robot Leo', icon: '🤖', emoji: '🤖', iconImage: '/assets/pregenerated-fallback/identity-lock/robot_leo_v1.webp' },
  { partNumber: 4, title: 'Mèo Thám Tử Mimi', icon: '🐱', emoji: '🐱', iconImage: '/assets/pregenerated-fallback/identity-lock/cat_mimi_v1.webp' },
]

export const DEFAULT_CARD_FORGE_PARTS: SixStagePracticePartDef[] = [
  { partNumber: 1, title: 'Rồng Băng Bão Tuyết (Chiến tướng Hệ Băng)', icon: '🐉', emoji: '🐉', iconImage: '/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp' },
  { partNumber: 2, title: 'Hiệp Sĩ Cáo Lửa (Chiến tướng Hệ Hỏa)', icon: '🦊', emoji: '🦊', iconImage: '/assets/pregenerated-fallback/card-forge/card_fire_fox_v1.webp' },
  { partNumber: 3, title: 'Đại Bàng Lôi Thần (Chiến tướng Hệ Sét)', icon: '🦅', emoji: '🦅', iconImage: '/assets/aiki-keys/key_how_yellow.jpg' },
  { partNumber: 4, title: 'Rùa Thần Cổ Đại Gai Mộc (Chiến tướng Hệ Mộc)', icon: '🐢', emoji: '🐢', iconImage: '/assets/aiki-keys/key_where_pink.jpg' },
]

export const DEFAULT_PRACTICE_PARTS: SixStagePracticePartDef[] = DEFAULT_MAGIC_KEYS_PARTS

export function getDefaultPartsForMode(mode?: string): SixStagePracticePartDef[] {
  switch (mode) {
    case 'style-prism':
      return DEFAULT_STYLE_PRISM_PARTS
    case 'prompt-doctor':
      return DEFAULT_PROMPT_DOCTOR_PARTS
    case 'layer-stacking':
      return DEFAULT_LAYER_STACKING_PARTS
    case 'identity-lock':
      return DEFAULT_IDENTITY_LOCK_PARTS
    case 'card-forge':
      return DEFAULT_CARD_FORGE_PARTS
    case 'creative-notebook':
      return []
    case 'magic-keys':
    default:
      return DEFAULT_MAGIC_KEYS_PARTS
  }
}

export interface EngineConfigMeta {
  title: string
  desc: string
  badge: string
  pipelineLabel: string
}

export function getEngineConfigMeta(mode?: string): EngineConfigMeta {
  switch (mode) {
    case 'creative-notebook':
      return {
        title: '🎒 SỔ TAY SÁNG TẠO BA LÔ (TEXT ENGINE)',
        desc: 'Học sinh sẽ thực hành viết hồ sơ, cốt truyện, phân cảnh storyboard và cân bằng luật chơi cất vào Ba Lô.',
        badge: 'Sổ tay Ba Lô',
        pipelineLabel: 'Biên soạn nội dung sáng tạo: [Tiêu đề sổ tay] + [Ô thông minh / Viết tự do] -> [Cất vào Ba Lô]',
      }
    case 'prompt-doctor':
      return {
        title: '🩺 NGÂN HÀNG CA BỆNH TRANH HỎNG',
        desc: 'Học sinh sẽ lần lượt nhận khám và kê đơn thuốc chữa lành cho từng ca bệnh (1..4).',
        badge: 'Ca bệnh',
        pipelineLabel: 'Toa thuốc thẻ chữ ghép vào chữa lành: [Câu lệnh cũ] + [Đơn thuốc]',
      }
    case 'layer-stacking':
      return {
        title: '🌟 NGÂN HÀNG NGÔI SAO CHÍNH 1/3',
        desc: 'Học sinh sẽ lần lượt đưa từng ngôi sao chính vào vị trí 1/3 khung hình qua các lượt vẽ.',
        badge: 'Ngôi sao 1/3',
        pipelineLabel: 'Bố cục 3 tầng bọc quanh Ngôi Sao: [Hậu cảnh] + [Ngôi sao 1/3] + [Tiền cảnh]',
      }
    case 'card-forge':
      return {
        title: '⚔️ NGÂN HÀNG CHIẾN TƯỚNG THẺ BÀI',
        desc: 'Học sinh sẽ lần lượt đúc thẻ TCG cho từng chiến tướng huyền thoại qua các lượt (1..4).',
        badge: 'Chiến tướng',
        pipelineLabel: 'Thuộc tính TCG ghép vào đúc thẻ: [Chiến tướng] + [Hệ nguyên tố] + [Tuyệt chiêu] + [Khung viền]',
      }
    case 'identity-lock':
      return {
        title: '🧬 NGÂN HÀNG DANH TÍNH NHÂN VẬT & BIỂU CẢM',
        desc: 'Học sinh sẽ lần lượt tạo hình nhân vật qua các sắc thái biểu cảm khác nhau (1..4).',
        badge: 'Nhân vật & Biểu cảm',
        pipelineLabel: 'Mật mã ADN bất biến ghép nối: [Nhân vật & Biểu cảm] + [3 Khóa ADN] + [Hành động]',
      }
    case 'style-prism':
      return {
        title: '🔮 NGÂN HÀNG CHỦ THỂ NGHỆ THUẬT',
        desc: 'Học sinh sẽ lần lượt biến hóa phong cách nghệ thuật cho từng chủ thể qua các lượt (1..4).',
        badge: 'Chủ thể nghệ thuật',
        pipelineLabel: 'Lăng kính phong cách khoác lên chủ thể: [Chủ thể] + [Chất liệu & Trường phái]',
      }
    case 'magic-keys':
    default:
      return {
        title: '🔑 BỘ CHỦ THỂ CẦN MỞ KHÓA (CHÌA KHÓA 1: CÁI GÌ - WHAT)',
        desc: 'Học sinh sẽ thực hành vẽ lần lượt từng món đồ này (1..4) trong xưởng sáng tạo AI.',
        badge: 'Món đồ',
        pipelineLabel: '3 Chìa khóa ghép vào sau chủ thể: [Cái gì] + [Trông thế nào] + [Làm gì] + [Ở đâu]',
      }
  }
}

export const DEFAULT_FOUR_KEYS_OPTIONS: SixStageFourKeysOptions = {
  what: ['Cốc sứ trắng', 'Cái xe đạp', 'Cuốn sổ tay bìa da'],
  how: ['men bóng mẻ miệng', 'cũ sơn xanh bong từng mảng', 'bìa da nâu sờn góc'],
  action: ['đang bốc khói nghi ngút', 'đang dựa nghiêng vào tường', 'đang mở dở ở trang giữa'],
  where: ['trên bàn gỗ mộc', 'ở góc sân gạch đỏ', 'trên bàn học cạnh đèn'],
}

export const DEFAULT_LOCKED_FEATURES: string[] = [
  'Đội mũ len đỏ có quả bông trắng',
  'Đuôi to xù màu cam uốn cong',
  'Túi vải thô đeo chéo',
]

export const DEFAULT_EXPRESSIONS: string[] = [
  '😊 Cười tít mắt vui vẻ',
  '😉 Nháy mắt tinh nghịch',
  '😲 Mắt tròn xoe ngạc nhiên',
  '😴 Ngủ gật mơ màng',
  '✊ Quyết tâm giương nắm đấm',
  '😌 Thư thái bình yên',
]

export const DEFAULT_STYLE_PRISM_OPTIONS: SixStageStylePrismOption[] = [
  {
    id: 'clay',
    name: 'Đất nặn Claymation (Soft Clay)',
    icon: '🧸',
    desc: 'Bề mặt đất nặn handmade bo tròn mịn màng màu pastel ấm áp',
    promptStyle: 'phong cách đất nặn 3D Soft Clay bo tròn mịn màng màu pastel ấm áp',
  },
  {
    id: 'watercolor',
    name: 'Màu nước Trong trẻo (Màu nước loang mềm)',
    icon: '🎨',
    desc: 'Nét vẽ màu nước loang mềm mại, sắc màu tươi sáng trong trẻo',
    promptStyle: 'phong cách tranh vẽ màu nước watercolor viền loang mềm mại trong trẻo',
  },
  {
    id: 'pixar',
    name: 'Hoạt hình Chibi 3D Pixar (Truyện tranh Chibi)',
    icon: '✨',
    desc: 'Nét vẽ sắc sảo, mắt to long lanh ngộ nghĩnh vui tươi',
    promptStyle: 'phong cách truyện tranh manga chibi nét vẽ phẳng tươi sáng ngộ nghĩnh',
  },
  {
    id: 'dongho',
    name: 'Tranh dân gian Đông Hồ',
    icon: '🏮',
    desc: 'Nét khắc gỗ mộc mạc trên giấy điệp truyền thống',
    promptStyle: 'phong cách tranh dân gian Đông Hồ nét mộc truyền thống trên nền giấy dó',
  },
]

export const DEFAULT_PROMPT_DOCTOR_CASE: SixStagePromptDoctorCase = {
  caseTitle: 'Bàn tay hiệp sĩ bị dị tật (Hiệp Sĩ Bạc)',
  symptom: 'Tranh vẽ hiệp sĩ nhưng bàn tay bị dị tật chỉ có 3 ngón tay và thiếu mất chiếc mũ len đỏ!',
  originalPrompt: 'Hiệp sĩ bọc giáp cầm kiếm thần đứng giữa rừng cây',
  refImageUrl: '/assets/aiki-islands/island1_lesson4_opt_a.jpg',
  curedImageUrl: '/assets/aiki-islands/island1_lesson4_engineer.jpg',
  cureCards: [
    '✋ Kê đơn 5 ngón tay đầy đủ chuẩn xác',
    '🧶 Đội mũ len đỏ quả bông trắng',
    '🪑 Thêm ghế mây ấm cúng',
    '🦊 Đuôi cam to xù kiêu hãnh',
  ],
}

export const DEFAULT_LAYER_STACKING_OPTIONS: SixStageLayerStackingOptions = {
  background: [
    '🪐 Bầu trời dải ngân hà vũ trụ lung linh',
    'Rừng thông ngút ngàn buổi sớm có sương mù giăng',
    'Hoàng hôn mây hồng rực rỡ ánh cam ấm áp',
    'Đáy đại dương pha lê lung linh tia sáng',
  ],
  hero: [
    'Nhân vật chính ở vị trí điểm vàng 1/3',
    'Hiệp Sĩ Cáo Lửa giương cao kiếm ánh sáng (1/3)',
    'Con thuyền buồm vàng căng gió rẽ sóng (1/3)',
  ],
  foreground: [
    'Cành lá phong mùa thu đỏ thắm bay ngang tầm mắt',
    'Bụi cỏ xanh mướt đọng giọt sương mai',
    'Cánh hoa đào hồng bay lướt qua ống kính',
  ],
}

export const DEFAULT_CARD_FORGE_OPTIONS: SixStageCardForgeOptions = {
  elements: [
    { id: 'fire', name: 'Hệ Hỏa (Lửa Đỏ)', icon: '🔥' },
    { id: 'ice', name: 'Hệ Băng (Pha Lê)', icon: '❄️' },
    { id: 'thunder', name: 'Hệ Sét (Lôi Thần)', icon: '⚡' },
    { id: 'nature', name: 'Hệ Mộc (Cây Cối)', icon: '🌿' },
  ],
  stats: {
    hp: 1200,
    atk: 8,
    skillName: 'Bão Băng Tinh Thể Khúc Xạ',
  },
  cardBorder: 'pha lê',
}

// ── 1. STYLE PRISM PRESETS (LĂNG KÍNH PHÙ THỦY) ──────────────────────
export interface StylePrismPreset {
  id: string
  name: string
  icon: string
  desc: string
  promptStyle: string
}

export const STYLE_PRISM_PRESETS: StylePrismPreset[] = [
  {
    id: 'clay',
    name: 'Đất nặn Soft Clay',
    icon: '🧸',
    desc: 'Bề mặt đất nặn handmade bo tròn mịn màng màu pastel ấm áp',
    promptStyle: 'phong cách đất nặn 3D Soft Clay bo tròn pastel mịn màng',
  },
  {
    id: 'watercolor',
    name: 'Màu nước loang',
    icon: '🎨',
    desc: 'Nét vẽ màu nước loang mềm mại nghệ thuật trong trẻo',
    promptStyle: 'phong cách màu nước loang nghệ thuật mềm mại',
  },
  {
    id: 'chibi3d',
    name: 'Chibi Manga 3D',
    icon: '✨',
    desc: 'Nhân vật 3D hoạt hình chibi dễ thương mắt to sáng',
    promptStyle: 'phong cách 3D hoạt hình chibi dễ thương mắt to sáng',
  },
  {
    id: 'dongho',
    name: 'Dân gian Đông Hồ',
    icon: '🏮',
    desc: 'Nét mộc truyền thống trên nền giấy điệp mộc mạc',
    promptStyle: 'phong cách tranh dân gian Đông Hồ nét mộc truyền thống',
  },
  {
    id: 'quilling',
    name: 'Xé dán Quilling',
    icon: '📜',
    desc: 'Nghệ thuật cuộn giấy xé dán quilling nổi khối',
    promptStyle: 'phong cách nghệ thuật cuộn giấy xé dán quilling nổi khối',
  },
  {
    id: 'pixar',
    name: '3D Pixar Cinematic',
    icon: '🎬',
    desc: 'Ánh sáng điện ảnh 3D Pixar ấm áp',
    promptStyle: 'phong cách hoạt hình 3D Pixar ánh sáng điện ảnh ấm áp',
  },
  {
    id: 'crayon',
    name: 'Sáp màu ngây thơ',
    icon: '🖍️',
    desc: 'Nét vẽ sáp màu nét chì mộc mạc trẻ thơ',
    promptStyle: 'phong cách tranh vẽ sáp màu nét chì mộc mạc trẻ thơ',
  },
  {
    id: 'oil',
    name: 'Sơn dầu cổ điển',
    icon: '🖼️',
    desc: 'Nét cọ sơn dầu cổ điển nét cọ dày nghệ thuật',
    promptStyle: 'phong cách sơn dầu cổ điển nét cọ dày nghệ thuật',
  },
]

// ── 2. PROMPT DOCTOR PRESETS (BÁC SĨ CÂU LỆNH) ──────────────────────
export interface PromptDoctorCasePreset {
  id: string
  title: string
  symptom: string
  brokenPrompt: string
  refImageUrl?: string
  suggestedCures?: string[]
}

export const PROMPT_DOCTOR_CASE_PRESETS: PromptDoctorCasePreset[] = [
  {
    id: 'hand_3_fingers',
    title: 'Bàn tay 3 ngón dị tật',
    symptom: 'Bàn tay nhân vật vẽ thiếu ngón kỳ quặc',
    brokenPrompt: 'chú mèo cầm cốc nước',
    refImageUrl: '/assets/aiki-islands/island1_lesson4_opt_a.jpg',
    suggestedCures: ['✋ Vẽ chuẩn 5 ngón tay', '🧶 Đội mũ len quả bông', '🪑 Ghế mây đệm êm'],
  },
  {
    id: 'squirrel_lost_beanie',
    title: 'Sóc mất mũ len',
    symptom: 'Sóc bị thiếu chiếc mũ len ấm áp ngày đông',
    brokenPrompt: 'chú sóc nhỏ đứng trong tuyết lạnh',
    refImageUrl: '/assets/game-engines/prompt-color-error.webp',
    suggestedCures: ['🧶 Đội mũ len quả bông', '🧣 Khăn quàng cổ kẻ caro', '🦊 Thêm đuôi cam to xù'],
  },
  {
    id: 'floating_cat',
    title: 'Mèo trôi nổi không ghế',
    symptom: 'Chú mèo lơ lửng giữa không trung không có chỗ ngồi',
    brokenPrompt: 'chú mèo con trong phòng khách',
    refImageUrl: '/assets/aiki-islands/island1_lesson1_opt_a.jpg',
    suggestedCures: ['🪑 Ghế mây đệm êm', '🧹 Dọn sạch phông nền', '✨ Thêm ánh sáng lung linh'],
  },
  {
    id: 'messy_scene',
    title: 'Tranh lem nhem chi tiết thừa',
    symptom: 'Phông nền lộn xộn có nhiều vật thể kỳ lạ',
    brokenPrompt: 'góc học tập bừa bộn nhiều đồ vật lạ',
    suggestedCures: ['🧹 Dọn sạch phông nền', '✨ Thêm ánh sáng lung linh', '✋ Vẽ chuẩn 5 ngón tay'],
  },
]

export interface PromptDoctorCurePreset {
  name: string
  prompt: string
  role?: 'cure' | 'trap'
  targetCase?: string
}

export const PROMPT_DOCTOR_CURE_PRESETS: PromptDoctorCurePreset[] = [
  {
    name: '✋ Vẽ chuẩn 5 ngón tay',
    prompt: 'bàn tay bọc găng giáp bạc có đầy đủ chuẩn xác đúng 5 ngón tay rõ ràng',
    role: 'cure',
    targetCase: 'Đặc trị: Hiệp Sĩ Bạc',
  },
  {
    name: '🧶 Đội mũ len quả bông',
    prompt: 'đội ngay ngắn chiếc mũ len đỏ quả bông trắng ấm áp trên đầu',
    role: 'trap',
    targetCase: 'Bẫy: Thuốc của Sóc Bông',
  },
  {
    name: '🪑 Ghế mây đệm êm',
    prompt: 'đang nằm ngủ cuộn tròn trên chiếc ghế mây lót đệm êm ái cạnh cửa sổ',
    role: 'trap',
    targetCase: 'Bẫy: Thuốc của Mèo Mướp',
  },
  {
    name: '🧹 Dọn sạch phông nền',
    prompt: 'phông nền xưởng rèn sạch sẽ gọn gàng ánh sáng rạng ngời không chi tiết thừa',
    role: 'trap',
    targetCase: 'Bẫy: Thuốc của Tranh Lem Nhem',
  },
  {
    name: '🦊 Thêm đuôi cam to xù',
    prompt: 'chiếc đuôi vằn to xù ấm áp uốn lượn',
    role: 'trap',
    targetCase: 'Bẫy phụ kiện',
  },
  {
    name: '✨ Thêm ánh sáng lung linh',
    prompt: 'ánh sáng lung linh huyền ảo dịu mắt',
    role: 'trap',
    targetCase: 'Bẫy phụ kiện',
  },
]

// ── 3. LAYER STACKING PRESETS (3 TẦNG SÂN KHẤU) ──────────────────────
export const LAYER_STACKING_PRESETS = {
  background: [
    '🪐 Bầu trời dải ngân hà vũ trụ lung linh',
    '🌅 Hoàng hôn mây hồng',
    '🌲 Rừng thông tuyết phủ',
    '🌌 Bầu trời đêm sao băng',
    '🏰 Cung điện kẹo ngọt',
    '🌊 Bãi biển mùa hè',
  ],
  hero: [
    '⭐ Chủ thể đứng chính diện 1/3',
    '✨ Ánh hào quang chiếu rọi',
    '🦊 Hiệp Sĩ tạo dáng dũng cảm',
    '🐱 Chú Mèo ôm cốc sữa',
  ],
  foreground: [
    '🌸 Cánh hoa đào bay',
    '💡 Đom đóm lấp lánh',
    '🌿 Bụi hoa dại rung rinh',
    '💧 Giọt sương mai đọng lá',
    '✨ Bụi sao lấp lánh',
  ],
}

// ── 4. IDENTITY LOCK PRESETS (KHÓA MẬT MÃ ADN & BIỂU CẢM) ───────────
export const IDENTITY_LOCK_DNA_PRESETS: string[] = [
  '☕ Cốc sứ trắng men bóng',
  '🦊 Bộ lông vằn cam trắng',
  '🧶 Mũ len đỏ quả bông',
  '👓 Cặp kính cận gọng tròn',
  '🧣 Khăn quàng cổ kẻ caro',
  '⭐ Vết bớt ngôi sao ở má',
]

export const IDENTITY_LOCK_EXPRESSION_PRESETS: string[] = [
  '😄 Cười tít mắt vui vẻ',
  '😉 Nháy mắt tinh nghịch',
  '😲 Mắt tròn ngạc nhiên',
  '😴 Ngái ngủ thư thái',
  '✊ Quyết tâm tập trung',
  '🤩 Mắt lấp lánh sao',
  '🤔 Nghiêng đầu suy nghĩ',
]

// ── 5. CARD FORGE PRESETS (XƯỞNG ĐÚC THẺ BÀI TCG) ───────────────────
export interface CardForgeElementPreset {
  id: string
  name: string
  icon: string
  skill: string
  hp: number
  atk: number
}

export const CARD_FORGE_ELEMENT_PRESETS: CardForgeElementPreset[] = [
  { id: 'ice', name: '❄️ Băng Tuyết', icon: '❄️', skill: 'Hơi Thở Băng Giá', hp: 1200, atk: 850 },
  { id: 'fire', name: '🔥 Lửa Thiêng', icon: '🔥', skill: 'Bão Lửa Cuồng Phong', hp: 1100, atk: 950 },
  { id: 'nature', name: '🌿 Rừng Xanh', icon: '🌿', skill: 'Khiên Gai Độc Mộc', hp: 1400, atk: 750 },
  { id: 'thunder', name: '⚡ Sấm Sét', icon: '⚡', skill: 'Lôi Thần Giáng Lâm', hp: 1000, atk: 1100 },
  { id: 'crystal', name: '💎 Pha Lê', icon: '💎', skill: 'Ánh Sáng Khúc Xạ', hp: 1300, atk: 900 },
]

export interface CardForgeTierPreset {
  name: string
  hp: number
  atk: number
}

export const CARD_FORGE_TIER_PRESETS: CardForgeTierPreset[] = [
  { name: 'Tập Sự', hp: 800, atk: 500 },
  { name: 'Tinh Anh', hp: 1000, atk: 750 },
  { name: 'Chiến Tướng', hp: 1200, atk: 950 },
  { name: 'Huyền Thoại', hp: 1500, atk: 1200 },
]

export function suggestFourKeysForSubject(subjectName: string): {
  parts: SixStagePracticePartDef[]
  fourKeys: SixStageFourKeysOptions
} {
  const norm = (subjectName || '').toLowerCase()
  if (norm.includes('mèo') || norm.includes('cat')) {
    return {
      parts: [
        { partNumber: 1, title: 'Chú Mèo Mướp Vàng', icon: '🐱', emoji: '🐱', iconImage: '/assets/aiki-keys/key_subject_cat.jpg' },
        { partNumber: 2, title: 'Mèo Béo Ngủ Ghế Mây', icon: '🪑', emoji: '🪑', iconImage: '/assets/aiki-keys/key_what_blue.jpg' },
        { partNumber: 3, title: 'Mèo Bắt Bướm Nắng Vàng', icon: '🦋', emoji: '🦋', iconImage: '/assets/aiki-keys/key_action_orange.jpg' },
        { partNumber: 4, title: 'Mèo Phi Hành Gia', icon: '🚀', emoji: '🚀', iconImage: '/assets/aiki-keys/key_where_pink.jpg' },
      ],
      fourKeys: {
        what: ['Chú Mèo Mướp Vàng', 'Mèo Béo Ngủ Ghế Mây', 'Mèo Bắt Bướm Nắng Vàng', 'Mèo Phi Hành Gia'],
        how: ['Lông vằn vàng cam', 'Béo tròn bụ bẫm', 'Cuộn tròn như cuộn len', 'Bộ đồ phi hành gia trắng'],
        action: ['Ngồi liếm láp bàn chân', 'Ngủ khò say sưa', 'Bật nhảy chộp bướm', 'Bay lơ lửng không trọng lực'],
        where: ['Bên thềm nhà đón nắng', 'Trên chiếc ghế mây tròn', 'Giữa vườn hoa bướm rực rỡ', 'Giữa dải ngân hà kỳ ảo'],
      },
    }
  }
  return {
    parts: DEFAULT_PRACTICE_PARTS,
    fourKeys: DEFAULT_FOUR_KEYS_OPTIONS,
  }
}
