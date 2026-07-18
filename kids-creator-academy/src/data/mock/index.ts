import type {
  Approval,
  Asset,
  ComicPage,
  LearnCard,
  PromptChip,
  Quest,
  SkillMastery,
  StudentRow,
  VideoScene,
} from '@/types'
import { buildAvatarSvg, buildMascotSvg, buildSceneSvg } from '@/lib/svg-scenes'

export const MASCOT_SRC = buildMascotSvg()
/** Cute map character (generated asset) */
export const MAP_MASCOT_SRC = '/assets/mascot-map.jpg'

export const AVATARS = [
  { id: 'cloud-fox', label: 'Cáo Mây', src: buildAvatarSvg('cloud', ['#7C6CF0', '#5ED0FF']) },
  { id: 'mint-bot', label: 'Bot Bạc Hà', src: buildAvatarSvg('mint', ['#5EE4B0', '#5ED0FF']) },
  { id: 'sun-owl', label: 'Cú Nắng', src: buildAvatarSvg('sun', ['#FFD56A', '#FF8FA3']) },
  { id: 'coral-whale', label: 'Cá Voi Hồng', src: buildAvatarSvg('whale', ['#FF8FA3', '#7C6CF0']) },
  { id: 'sky-bear', label: 'Gấu Trời', src: buildAvatarSvg('bear', ['#5ED0FF', '#FFD56A']) },
  { id: 'ink-rabbit', label: 'Thỏ Mực', src: buildAvatarSvg('rabbit', ['#7C6CF0', '#FF8FA3']) },
  { id: 'leaf-panda', label: 'Gấu Lá', src: buildAvatarSvg('panda', ['#5EE4B0', '#FFD56A']) },
  { id: 'star-otter', label: 'Rái Sao', src: buildAvatarSvg('otter', ['#FFD56A', '#5ED0FF']) },
]

export const NICKNAME_SUGGESTIONS = ['Mây', 'Bắp', 'Sóc', 'Nắng', 'Bo', 'Kẹo', 'Sao', 'Mít']

/**
 * Course redesign for ages 8–11 (AI literacy + creative production)
 * Principles (UNESCO / Common Sense / project-based learning):
 * 1) AI is a tool, human decides
 * 2) Clear instructions (prompt)
 * 3) AI can be wrong — check
 * 4) Privacy & kindness
 * 5) Make a real product every few steps
 * Language: short VN sentences, no scary failure, one mission per step
 */
export const COURSE_TITLE = 'Hành trình Mèo Sao: Học AI bằng cách sáng tạo'
export const COURSE_TAGLINE = '8 nhiệm vụ vui · Tạo truyện tranh & video của riêng con'

const learn = (
  cards: [string, string, string, LearnCard['kind']][],
): LearnCard[] =>
  cards.map(([title, body, tip, kind], i) => ({
    id: `lc-${i}`,
    title,
    body,
    tip,
    kind,
  }))

export const QUESTS: Quest[] = [
  {
    id: 'meet-mascot',
    order: 1,
    title: 'Chào AI bạn tốt',
    skill: 'AI là công cụ giúp việc, không phải bạn bè thật',
    reward: 'Thẻ Nhà sáng tạo',
    duration: '5–7 phút',
    hook: 'Robot Mực Màu nói: “AI vẽ theo lời con — con là chỉ huy!”',
    goals: ['Biết AI giúp gì', 'Biết AI có thể sai', 'Nhận thẻ sáng tạo'],
    learnCards: learn([
      ['AI là gì?', 'AI là máy làm theo mô tả của con.', 'Con chọn, AI giúp.', 'concept'],
      ['Ví dụ vui', 'Con nói “mèo đội mũ”, AI vẽ mèo đội mũ.', 'Không ưng thì thử lại.', 'example'],
      ['Giữ bí mật', 'Không ghi tên thật, số điện thoại, trường học.', 'Dùng biệt danh vui!', 'safety'],
    ]),
    status: 'completed',
    accent: '#7C6CF0',
    icon: 'sparkles',
  },
  {
    id: 'character',
    order: 2,
    title: 'Tạo bạn đồng hành',
    skill: 'Mô tả rõ ai là nhân vật chính',
    reward: 'Thẻ nhân vật',
    duration: '8 phút',
    hook: 'Tạo Mèo Sao — phi hành gia tò mò trên hành tinh kẹo!',
    goals: ['Chọn hình dáng', 'Chọn tính cách', 'Lưu thẻ nhân vật'],
    learnCards: learn([
      ['Nhân vật', 'Cần biết: trông thế nào + tính cách ra sao.', 'Một ý chính là đủ.', 'concept'],
      ['Ví dụ', 'Mèo Sao đội mũ vũ trụ, rất hay hỏi “vì sao?”', 'Thêm chi tiết vui.', 'example'],
      ['An toàn', 'Chỉ nhân vật tưởng tượng — không vẽ người thật.', 'Không tên người nổi tiếng.', 'safety'],
    ]),
    status: 'available',
    accent: '#5ED0FF',
    icon: 'cat',
  },
  {
    id: 'world-build',
    order: 3,
    title: 'Chọn nơi phiêu lưu',
    skill: 'Bối cảnh giúp câu chuyện dễ hiểu',
    reward: 'Phông nền',
    duration: '7 phút',
    hook: 'Mèo Sao cần một nơi: hành tinh tím, thư viện mây, hay rừng pha lê?',
    goals: ['Chọn nơi', 'Chọn màu cảm xúc', 'Lưu bối cảnh'],
    learnCards: learn([
      ['Ở đâu?', 'Nơi chốn trả lời: nhân vật đang đứng chỗ nào?', 'Hỏi: đang ở đâu vậy?', 'concept'],
      ['Ví dụ', 'Thư viện trên mây, ánh sáng vàng ấm.', 'Màu cũng kể chuyện.', 'example'],
      ['An toàn', 'Không viết địa chỉ nhà hay tên trường thật.', 'Chọn nơi tưởng tượng.', 'safety'],
    ]),
    status: 'locked',
    accent: '#5EE4B0',
    icon: 'globe',
  },
  {
    id: 'plot',
    order: 4,
    title: 'Có chuyện gì xảy ra?',
    skill: 'Mở đầu → vấn đề → cách giải quyết',
    reward: 'Dàn ý truyện',
    duration: '8 phút',
    hook: 'Máy tạo cầu vồng hỏng rồi! Làm sao hai bạn sửa được?',
    goals: ['Chọn sự cố', 'Chọn cách sửa', 'Lưu dàn ý'],
    learnCards: learn([
      ['3 bước truyện', 'Bắt đầu → gặp khó → giải quyết vui.', 'Ngắn gọn là hay.', 'concept'],
      ['Ví dụ', 'Máy hỏng → tìm bản đồ ánh sáng → cầu vồng trở lại.', 'Kết thúc tích cực.', 'example'],
      ['An toàn', 'Không bạo lực. Dùng trí khôn và hợp tác.', 'Bạn bè giúp nhau.', 'safety'],
    ]),
    status: 'locked',
    accent: '#FFD56A',
    icon: 'zap',
  },
  {
    id: 'prompt-lab',
    order: 5,
    title: 'Nói cho AI hiểu',
    skill: 'Ghép 5 mảnh: ai, làm gì, ở đâu, cảm xúc, phong cách',
    reward: 'Công thức mô tả',
    duration: '10 phút',
    hook: 'AI không đọc suy nghĩ — con ghép thẻ để AI hiểu đúng!',
    goals: ['Đủ 5 ô thẻ', 'Tạo 3 ảnh thử', 'Chọn ảnh ưng'],
    learnCards: learn([
      ['Mô tả rõ', 'Càng rõ “ai + làm gì + ở đâu”, ảnh càng đúng.', 'Đủ 5 ô là tuyệt.', 'concept'],
      ['Ví dụ', 'Mèo sửa tàu / hành tinh tím / vui / màu nước.', 'Thử vài cách.', 'example'],
      ['An toàn', 'Không ghi thông tin cá nhân vào ô chữ.', 'Chỉ chi tiết tưởng tượng.', 'safety'],
    ]),
    status: 'locked',
    accent: '#FF8FA3',
    icon: 'flask',
  },
  {
    id: 'detective',
    order: 6,
    title: 'Thám tử kiểm tra AI',
    skill: 'AI có thể sai — con so sánh và chọn',
    reward: 'Huy hiệu Thám tử AI',
    duration: '8 phút',
    hook: 'Ba bức vẽ — bức nào khớp ý con? Có chi tiết lạ không?',
    goals: ['So 3 ảnh', 'Tìm điểm lạ', 'Chọn ảnh tốt'],
    learnCards: learn([
      ['AI sai được', 'AI không phải lúc nào cũng đúng.', 'Con là người kiểm tra.', 'concept'],
      ['Ví dụ', 'Câu chuyện 1 mặt trăng nhưng ảnh có 3!', 'Hỏi: khớp ý chưa?', 'example'],
      ['An toàn', 'Không tin mọi thứ AI tạo ra.', 'Được chọn lại bất cứ lúc nào.', 'safety'],
    ]),
    status: 'locked',
    accent: '#7C6CF0',
    icon: 'search',
  },
  {
    id: 'comic',
    order: 7,
    title: 'Làm truyện 4 khung',
    skill: 'Sắp cảnh + lời thoại ngắn',
    reward: 'Truyện tranh',
    duration: '12 phút',
    hook: 'Kéo nhân vật vào khung, thêm lời nói — truyện của con ra đời!',
    goals: ['Đặt ảnh vào khung', 'Thêm bong bóng', 'Xem trước'],
    learnCards: learn([
      ['Khung truyện', 'Mỗi khung một nhịp: trái → phải.', '4 khung là đủ vui.', 'concept'],
      ['Ví dụ', 'Gặp nhau → sự cố → tìm cách → vui vẻ.', 'Lời thoại ngắn.', 'example'],
      ['An toàn', 'Không viết tên thật trong thoại.', 'Tối đa 80 ký tự.', 'safety'],
    ]),
    status: 'locked',
    accent: '#5ED0FF',
    icon: 'layout',
  },
  {
    id: 'cinema',
    order: 8,
    title: 'Kể thành video',
    skill: 'Sắp thời gian + lời kể + phụ đề',
    reward: 'Video mini',
    duration: '12 phút',
    hook: 'Biến truyện tranh thành phim ngắn 30–45 giây để khoe gia đình!',
    goals: ['Chọn giọng kể', 'Bật phụ đề', 'Tạo video thử'],
    learnCards: learn([
      ['Video kể chuyện', 'Mỗi cảnh vài giây + lời kể rõ.', 'Phụ đề giúp dễ hiểu.', 'concept'],
      ['Ví dụ', 'Giọng ấm + chữ dưới màn hình.', 'Nghe thử trước khi xong.', 'example'],
      ['An toàn', 'Dùng giọng giả lập — không copy giọng người thật.', 'Chia sẻ cần phụ huynh duyệt.', 'safety'],
    ]),
    status: 'locked',
    accent: '#5EE4B0',
    icon: 'clapperboard',
  },
]

/** Kid-facing journey stages for UI (maps to quests) */
export const JOURNEY_CHAPTERS = [
  { title: 'Làm quen AI', questIds: ['meet-mascot'] },
  { title: 'Tạo ý tưởng', questIds: ['character', 'world-build', 'plot'] },
  { title: 'Làm việc với AI', questIds: ['prompt-lab', 'detective'] },
  { title: 'Sản phẩm của con', questIds: ['comic', 'cinema'] },
] as const

export const PROMPT_CHIPS: PromptChip[] = [
  { id: 'c-cat', slot: 'character', label: 'Mèo phi hành gia', emoji: '🐱', description: 'Mèo Sao đội mũ vũ trụ' },
  { id: 'c-fox', slot: 'character', label: 'Cáo kỹ sư', emoji: '🦊', description: 'Cáo đeo kính bảo hộ' },
  { id: 'c-bot', slot: 'character', label: 'Robot làm vườn', emoji: '🤖', description: 'Robot tưới cây ánh sáng' },
  { id: 'c-dragon', slot: 'character', label: 'Rồng tí hon', emoji: '🐉', description: 'Rồng nhỏ thân thiện' },
  { id: 'a-ship', slot: 'action', label: 'Sửa tàu', emoji: '🛠️', description: 'Đang sửa tàu vũ trụ' },
  { id: 'a-map', slot: 'action', label: 'Tìm bản đồ', emoji: '🗺️', description: 'Tìm bản đồ ánh sáng' },
  { id: 'a-plant', slot: 'action', label: 'Trồng cây ánh sáng', emoji: '🌱', description: 'Trồng cây phát sáng' },
  { id: 'a-puzzle', slot: 'action', label: 'Giải câu đố', emoji: '🧩', description: 'Giải câu đố an toàn' },
  { id: 'e-purple', slot: 'environment', label: 'Hành tinh tím', emoji: '🪐', description: 'Hành tinh màu tím' },
  { id: 'e-cloud', slot: 'environment', label: 'Thư viện trên mây', emoji: '📚', description: 'Thư viện bay trên mây' },
  { id: 'e-crystal', slot: 'environment', label: 'Khu rừng pha lê', emoji: '✨', description: 'Rừng pha lê lấp lánh' },
  { id: 'e-sea', slot: 'environment', label: 'Thành phố dưới biển', emoji: '🌊', description: 'Thành phố dưới nước' },
  { id: 'm-brave', slot: 'mood', label: 'Dũng cảm', emoji: '💪', description: 'Cảm giác dũng cảm' },
  { id: 'm-curious', slot: 'mood', label: 'Tò mò', emoji: '🔍', description: 'Cảm giác tò mò' },
  { id: 'm-happy', slot: 'mood', label: 'Vui vẻ', emoji: '😊', description: 'Cảm giác vui vẻ' },
  { id: 'm-calm', slot: 'mood', label: 'Bình tĩnh', emoji: '😌', description: 'Cảm giác bình tĩnh' },
  { id: 's-comic', slot: 'style', label: 'Truyện tranh thiếu nhi', emoji: '📖', description: 'Nét truyện tranh vui' },
  { id: 's-paper', slot: 'style', label: 'Cắt giấy', emoji: '✂️', description: 'Phong cách cắt giấy' },
  { id: 's-water', slot: 'style', label: 'Màu nước', emoji: '🎨', description: 'Màu nước mềm' },
  { id: 's-soft3d', slot: 'style', label: '3D mềm mại', emoji: '🧸', description: '3D bo tròn dễ thương' },
]

export const DEFAULT_SKILLS: SkillMastery[] = [
  { skillId: 'AI.Foundation', label: 'Hiểu AI', level: 2, confidence: 0.7 },
  { skillId: 'Prompt.Subject', label: 'Nhân vật', level: 1, confidence: 0.5 },
  { skillId: 'Prompt.Environment', label: 'Bối cảnh', level: 1, confidence: 0.4 },
  { skillId: 'CriticalThinking.Compare', label: 'Kiểm tra AI', level: 0, confidence: 0.2 },
  { skillId: 'Media.Composition', label: 'Kể bằng hình', level: 0, confidence: 0.1 },
  { skillId: 'Safety.PersonalData', label: 'Giữ bí mật', level: 2, confidence: 0.8 },
]

export const DEFAULT_COMIC: ComicPage = {
  id: 'page-1',
  panels: [
    { id: 'p1', label: 'Khung 1' },
    { id: 'p2', label: 'Khung 2' },
    { id: 'p3', label: 'Khung 3' },
    { id: 'p4', label: 'Khung 4' },
  ],
  elements: [],
}

export const STICKERS = [
  { id: 'st-star', label: 'Sao', content: '⭐' },
  { id: 'st-heart', label: 'Tim', content: '💜' },
  { id: 'st-bolt', label: 'Tia', content: '⚡' },
  { id: 'st-ok', label: 'OK', content: '✅' },
]

export const VOICES = [
  { id: 'voice-warm', label: 'Giọng ấm', description: 'Nhẹ nhàng, dễ nghe' },
  { id: 'voice-bright', label: 'Giọng tươi', description: 'Vui và rõ ràng' },
  { id: 'voice-story', label: 'Giọng kể chuyện', description: 'Nhịp chậm, ấm áp' },
]

export const MUSIC_TRACKS = [
  { id: 'music-soft', label: 'Giai điệu êm', description: 'Nhạc nền nhẹ' },
  { id: 'music-adventure', label: 'Phiêu lưu', description: 'Nhịp vừa phải' },
  { id: 'music-none', label: 'Không nhạc', description: 'Chỉ giọng kể' },
]

export const PARENT_FEEDBACK_TEMPLATES = [
  'Con hãy kiểm tra lại phần chữ.',
  'Con hãy đổi tên nhân vật để không dùng tên thật.',
  'Sản phẩm rất sáng tạo, hãy thêm lời kết nhé.',
]

/** Demo accounts — no real PII (COPPA-friendly prototype) */
export const DEMO_CHILD_PROFILES = [
  { id: 'child_may', nickname: 'Mây', avatarId: 'cloud-fox', label: 'Học sinh Mây' },
  { id: 'child_bap', nickname: 'Bắp', avatarId: 'mint-bot', label: 'Học sinh Bắp' },
  { id: 'child_soc', nickname: 'Sóc', avatarId: 'sun-owl', label: 'Học sinh Sóc' },
]

/** Adult demo PIN (prototype only) */
export const DEMO_ADULT_PIN = '2468'

export const MOCK_STUDENTS: StudentRow[] = [
  {
    id: 'st-may',
    nickname: 'Mây',
    avatarId: 'cloud-fox',
    progress: 62,
    skillsNeedHelp: ['Bối cảnh'],
    latestProject: 'Mèo Sao và Hành tinh Kẹo',
    status: 'on_track',
  },
  {
    id: 'st-bap',
    nickname: 'Bắp',
    avatarId: 'mint-bot',
    progress: 40,
    skillsNeedHelp: ['Mô tả cho AI', 'Kiểm tra AI'],
    latestProject: 'Robot Vườn Sao',
    status: 'needs_support',
  },
  {
    id: 'st-soc',
    nickname: 'Sóc',
    avatarId: 'sun-owl',
    progress: 78,
    skillsNeedHelp: [],
    latestProject: 'Cáo Kỹ Sư Bay',
    status: 'ahead',
  },
  {
    id: 'st-nang',
    nickname: 'Nắng',
    avatarId: 'coral-whale',
    progress: 55,
    skillsNeedHelp: ['Hội thoại'],
    latestProject: 'Rồng Tí Hon',
    status: 'on_track',
  },
  {
    id: 'st-bo',
    nickname: 'Bo',
    avatarId: 'sky-bear',
    progress: 33,
    skillsNeedHelp: ['Cốt truyện', 'Giữ bí mật'],
    latestProject: 'Thư Viện Mây',
    status: 'needs_support',
  },
]

export function createSeedAssets(): Asset[] {
  return [
    {
      id: 'asset-creator-card',
      type: 'badge',
      name: 'Thẻ Nhà sáng tạo',
      questId: 'meet-mascot',
      thumbnail: MASCOT_SRC,
      createdAt: new Date().toISOString(),
      private: true,
    },
  ]
}

export function createDefaultApprovals(): Approval[] {
  return [
    {
      id: 'ap-1',
      projectId: 'star-cat',
      projectTitle: 'Mèo Sao và Hành tinh Kẹo',
      thumbnail: buildSceneSvg('preview', 0),
      destination: 'family',
      status: 'pending',
      aiAssisted: true,
      requestedAt: new Date().toISOString(),
    },
  ]
}

export function createDefaultVideoScenes(thumbnail: string): VideoScene[] {
  return [
    {
      id: 'vs1',
      panelId: 'p1',
      title: 'Gặp Mèo Sao',
      duration: 4,
      motion: 'zoom',
      narration: 'Trên hành tinh tím, Mèo Sao chuẩn bị sửa tàu.',
      thumbnail,
    },
    {
      id: 'vs2',
      panelId: 'p2',
      title: 'Phát hiện sự cố',
      duration: 5,
      motion: 'pan',
      narration: 'Máy tạo cầu vồng kêu lạch cạch và tắt.',
      thumbnail,
    },
    {
      id: 'vs3',
      panelId: 'p3',
      title: 'Tìm bản đồ',
      duration: 5,
      motion: 'float',
      narration: 'Hai bạn tìm bản đồ ánh sáng trong thư viện mây.',
      thumbnail,
    },
    {
      id: 'vs4',
      panelId: 'p4',
      title: 'Sửa xong!',
      duration: 6,
      motion: 'zoom',
      narration: 'Cầu vồng trở lại. Mèo Sao cười vui!',
      thumbnail,
    },
  ]
}

export const PROJECT_SEED = {
  id: 'star-cat',
  title: 'Mèo Sao và Hành tinh Kẹo',
  cover: buildSceneSvg('cover', 0),
  characterName: 'Mèo Sao',
  reflection: 'Con học được: AI có thể sai và con được chọn lại.',
  skillsLearned: [
    'Mô tả cho AI',
    'Kiểm tra kết quả AI',
    'Kể chuyện bằng khung',
    'Thêm lời kể an toàn',
  ],
  shareStatus: 'private' as const,
  approvalStatus: 'none' as const,
  comicReady: false,
  videoReady: false,
}

/**
 * Resolve route for a quest id.
 * IMPORTANT: detective is compare-results, NOT prompt again (avoids loop after quiz).
 */
/**
 * All course stations enter the lesson shell first:
 * Theory/Video → Practice → Quiz (Code.org Watch/Do/Check).
 * Practice destinations live inside each lesson's practicePath.
 */
export function questRoute(questId: string): string {
  return `/lesson/${questId}`
}

/** Direct practice routes (after theory unlocked) */
export function practiceRoute(questId: string): string {
  switch (questId) {
    case 'character':
      return '/quest/character'
    case 'prompt-lab':
      return '/studio/prompt'
    case 'detective':
      return '/studio/compare'
    case 'comic':
      return '/studio/comic'
    case 'cinema':
      return '/studio/video'
    case 'plot':
      return '/studio/story'
    case 'world-build':
    case 'meet-mascot':
      return `/quest/${questId}`
    default:
      return `/quest/${questId}`
  }
}
