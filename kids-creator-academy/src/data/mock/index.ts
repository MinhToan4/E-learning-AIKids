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

export const AVATARS = [
  { id: 'cloud-fox', label: 'Cáo Mây', src: buildAvatarSvg('cloud', ['#6C5CE7', '#45C4F9']) },
  { id: 'mint-bot', label: 'Bot Bạc Hà', src: buildAvatarSvg('mint', ['#58D8A3', '#45C4F9']) },
  { id: 'sun-owl', label: 'Cú Nắng', src: buildAvatarSvg('sun', ['#FFD166', '#FF7A90']) },
  { id: 'coral-whale', label: 'Cá Voi San Hô', src: buildAvatarSvg('whale', ['#FF7A90', '#6C5CE7']) },
  { id: 'sky-bear', label: 'Gấu Trời', src: buildAvatarSvg('bear', ['#45C4F9', '#FFD166']) },
  { id: 'ink-rabbit', label: 'Thỏ Mực', src: buildAvatarSvg('rabbit', ['#6C5CE7', '#FF7A90']) },
  { id: 'leaf-panda', label: 'Gấu Trúc Lá', src: buildAvatarSvg('panda', ['#58D8A3', '#FFD166']) },
  { id: 'star-otter', label: 'Rái Cá Sao', src: buildAvatarSvg('otter', ['#FFD166', '#45C4F9']) },
]

export const NICKNAME_SUGGESTIONS = ['Mây', 'Bắp', 'Sóc', 'Nắng', 'Bo', 'Kẹo', 'Sao', 'Mít']

export const COURSE_TITLE = 'Tạo truyện tranh AI đầu tiên'

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
    title: 'Gặp Robot Mực Màu',
    skill: 'AI là công cụ, không phải con người',
    reward: 'Thẻ Creator',
    duration: 'Khoảng 6 phút',
    hook: 'Robot Mực Màu mời con vào xưởng vẽ an toàn!',
    goals: ['Hiểu AI giúp gì', 'Biết AI có thể sai', 'Nhận thẻ Creator'],
    learnCards: learn([
      ['AI là gì?', 'AI là công cụ vẽ theo mô tả của con.', 'Con là người quyết định.', 'concept'],
      ['Ví dụ', 'Con nói “mèo bay”, AI vẽ mèo bay.', 'Con có thể chọn lại.', 'example'],
      ['An toàn', 'Không chia sẻ tên thật hay số điện thoại.', 'Dùng biệt danh vui!', 'safety'],
    ]),
    status: 'completed',
    accent: '#6C5CE7',
    icon: 'sparkles',
  },
  {
    id: 'character',
    order: 2,
    title: 'Tạo nhân vật',
    skill: 'Chủ thể, tính cách, ngoại hình',
    reward: 'Character Card',
    duration: 'Khoảng 8 phút',
    hook: 'Hãy tạo Mèo Sao — phi hành gia dũng cảm!',
    goals: ['Chọn loài vật', 'Ghép prompt', 'Lưu thẻ nhân vật'],
    learnCards: learn([
      ['Nhân vật', 'Nhân vật cần ngoại hình và tính cách rõ.', 'Một nhân vật một ý chính.', 'concept'],
      ['Ví dụ', 'Mèo Sao đội mũ phi hành gia, rất tò mò.', 'Thêm chi tiết vui!', 'example'],
      ['An toàn', 'Chỉ dùng nhân vật tưởng tượng.', 'Không vẽ người thật.', 'safety'],
    ]),
    status: 'available',
    accent: '#45C4F9',
    icon: 'cat',
  },
  {
    id: 'world-build',
    order: 3,
    title: 'Xây thế giới',
    skill: 'Bối cảnh, thời gian, màu sắc',
    reward: 'Background',
    duration: 'Khoảng 8 phút',
    hook: 'Hành tinh tím đang chờ con trang trí!',
    goals: ['Chọn nơi chốn', 'Chọn màu', 'Lưu bối cảnh'],
    learnCards: learn([
      ['Bối cảnh', 'Nơi chốn giúp câu chuyện dễ hiểu.', 'Hỏi: đang ở đâu?', 'concept'],
      ['Ví dụ', 'Thư viện trên mây, ánh sáng vàng.', 'Màu giúp tạo cảm xúc.', 'example'],
      ['An toàn', 'Không dùng địa chỉ thật.', 'Chọn nơi tưởng tượng.', 'safety'],
    ]),
    status: 'locked',
    accent: '#58D8A3',
    icon: 'globe',
  },
  {
    id: 'plot',
    order: 4,
    title: 'Sự cố bất ngờ',
    skill: 'Mở đầu, vấn đề, giải pháp',
    reward: 'Story outline',
    duration: 'Khoảng 8 phút',
    hook: 'Máy tạo cầu vồng bị hỏng — ai sẽ sửa?',
    goals: ['Tạo vấn đề', 'Tìm giải pháp', 'Lưu dàn ý'],
    learnCards: learn([
      ['Cốt truyện', 'Mở đầu → vấn đề → giải pháp.', 'Giữ ngắn và vui.', 'concept'],
      ['Ví dụ', 'Máy hỏng, hai bạn tìm bản đồ ánh sáng.', 'Kết thúc tích cực.', 'example'],
      ['An toàn', 'Không bạo lực.', 'Giải quyết bằng trí tuệ.', 'safety'],
    ]),
    status: 'locked',
    accent: '#FFD166',
    icon: 'zap',
  },
  {
    id: 'prompt-lab',
    order: 5,
    title: 'Phòng thí nghiệm Prompt',
    skill: 'Subject + Action + Place + Mood + Style',
    reward: 'Prompt recipe',
    duration: 'Khoảng 10 phút',
    hook: 'Ghép 5 thẻ để AI hiểu đúng ý con!',
    goals: ['Đủ 5 slot', 'Tạo 3 phiên bản', 'Chọn bản tốt'],
    learnCards: learn([
      ['Prompt', 'Prompt là mô tả để AI vẽ.', 'Càng rõ càng đẹp.', 'concept'],
      ['Ví dụ', 'Mèo sửa tàu trên hành tinh tím, vui, màu nước.', 'Đủ 5 phần.', 'example'],
      ['An toàn', 'Không nhập thông tin cá nhân.', 'Chỉ chi tiết tưởng tượng.', 'safety'],
    ]),
    status: 'locked',
    accent: '#FF7A90',
    icon: 'flask',
  },
  {
    id: 'detective',
    order: 6,
    title: 'Thám tử AI',
    skill: 'Phát hiện chi tiết sai',
    reward: 'Detective badge',
    duration: 'Khoảng 8 phút',
    hook: 'AI đôi khi vẽ sai — con là thám tử!',
    goals: ['So sánh 3 ảnh', 'Tìm chi tiết lạ', 'Chọn ảnh đúng'],
    learnCards: learn([
      ['AI có thể sai', 'AI không luôn đúng.', 'Con được kiểm tra.', 'concept'],
      ['Ví dụ', 'Ba mặt trăng thay vì một.', 'Hỏi: có khớp ý không?', 'example'],
      ['An toàn', 'Không tin mọi chi tiết AI tạo.', 'Tự chọn và sửa.', 'safety'],
    ]),
    status: 'locked',
    accent: '#6C5CE7',
    icon: 'search',
  },
  {
    id: 'comic',
    order: 7,
    title: 'Xưởng truyện tranh',
    skill: 'Panel, caption, speech bubble',
    reward: 'Comic',
    duration: 'Khoảng 12 phút',
    hook: 'Kéo cảnh vào 4 khung và thêm hội thoại!',
    goals: ['Đặt 4 khung', 'Thêm bong bóng', 'Xem trước'],
    learnCards: learn([
      ['Panel', 'Mỗi khung là một nhịp câu chuyện.', 'Trái sang phải.', 'concept'],
      ['Ví dụ', 'Khung 1 gặp nhau, khung 4 chiến thắng.', 'Lời thoại ngắn.', 'example'],
      ['An toàn', 'Không dùng tên thật trong thoại.', 'Tối đa 80 ký tự.', 'safety'],
    ]),
    status: 'locked',
    accent: '#45C4F9',
    icon: 'layout',
  },
  {
    id: 'cinema',
    order: 8,
    title: 'Rạp phim mini',
    skill: 'Storyboard, voice, subtitle',
    reward: 'Video',
    duration: 'Khoảng 12 phút',
    hook: 'Biến truyện tranh thành video kể chuyện!',
    goals: ['Chọn giọng', 'Thêm lời kể', 'Render thử'],
    learnCards: learn([
      ['Storyboard', 'Sắp xếp cảnh theo thời gian.', 'Mỗi cảnh 2–6 giây.', 'concept'],
      ['Ví dụ', 'Giọng ấm + phụ đề giúp dễ hiểu.', 'Bật phụ đề mặc định.', 'example'],
      ['An toàn', 'Không clone giọng người thật.', 'Dùng giọng giả lập.', 'safety'],
    ]),
    status: 'locked',
    accent: '#58D8A3',
    icon: 'clapperboard',
  },
]

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
  { skillId: 'CriticalThinking.Compare', label: 'So sánh', level: 0, confidence: 0.2 },
  { skillId: 'Media.Composition', label: 'Bố cục', level: 0, confidence: 0.1 },
  { skillId: 'Safety.PersonalData', label: 'Bảo vệ dữ liệu', level: 2, confidence: 0.8 },
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
    skillsNeedHelp: ['Prompt', 'So sánh'],
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
    skillsNeedHelp: ['Cốt truyện', 'An toàn dữ liệu'],
    latestProject: 'Thư Viện Mây',
    status: 'needs_support',
  },
]

export function createSeedAssets(): Asset[] {
  return [
    {
      id: 'asset-creator-card',
      type: 'badge',
      name: 'Thẻ Creator',
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
  reflection: 'Con học được AI có thể sai và con được chọn lại.',
  skillsLearned: [
    'Ghép prompt',
    'So sánh kết quả AI',
    'Kể chuyện bằng panel',
    'Thêm lời kể an toàn',
  ],
  shareStatus: 'private' as const,
  approvalStatus: 'none' as const,
  comicReady: false,
  videoReady: false,
}
