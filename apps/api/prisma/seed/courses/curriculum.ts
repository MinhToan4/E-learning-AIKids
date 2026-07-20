/**
 * Full L1 (6–8) + L2 (9–11) catalog aligned to courses/ markdowns.
 * Each course has curriculum stations (video→game→practice→check)
 * and ideate/produce stage split. Representative deep quests for
 * proof paths; all K1–K6 present with open status for pilot.
 */
import type { CourseSeed, PracticeKindSeed, QuestSeed } from '../types.js'

const ACCENTS = {
  L1: ['#6d5efc', '#3dbfff', '#3ed9a0', '#ff7b93', '#ffc94a', '#a78bfa'],
  L2: ['#5646e8', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'],
} as const

const COVERS = {
  K1: '/assets/designer/hub/art-image.jpeg',
  K2: '/assets/designer/hub/home-character.jpeg',
  K3: '/assets/story-workshop.jpg',
  K4: '/assets/designer/hub/art-comic.jpeg',
  K5: '/assets/adventure-map.jpg',
  K6: '/assets/course-voice.jpg',
} as const

type Track = 'L1' | 'L2'
type Key = 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6'

const META: Record<
  Key,
  { title: string; short: string; product: string; skills: string[] }
> = {
  K1: {
    title: 'Vẽ Thế Giới Tưởng Tượng',
    short: 'Thế giới',
    product: 'Bản đồ thế giới tưởng tượng',
    skills: ['Tưởng tượng nơi chốn', 'Màu & cảm xúc', 'Mô tả trước AI'],
  },
  K2: {
    title: 'Thiết Kế Nhân Vật',
    short: 'Nhân vật',
    product: 'Nhân vật clay của em',
    skills: ['Đặc điểm nhân vật', 'Tính cách', 'Art style Soft Clay'],
  },
  K3: {
    title: 'Kể Chuyện',
    short: 'Câu chuyện',
    product: 'Cốt truyện 5 phần',
    skills: ['Mở–sự cố–kết', 'Nhân vật hành động', 'Kể an toàn'],
  },
  K4: {
    title: 'Truyện Tranh',
    short: 'Comic',
    product: 'Truyện tranh nhiều khung',
    skills: ['Góc máy', 'Phân khung', 'Thoại bubble'],
  },
  K5: {
    title: 'Đạo Diễn Chuyển Động',
    short: 'Chuyển động',
    product: 'Clip chuyển động ngắn',
    skills: ['Nhịp điệu', 'Cắt cảnh', 'Chỉ đạo AI motion'],
  },
  K6: {
    title: 'Phim Ngắn Đầu Tay',
    short: 'Phim ngắn',
    product: 'Phim ngắn đầu tay',
    skills: ['Kịch bản', 'Dàn dựng', 'Xuất bản an toàn'],
  },
}

const SLUG: Record<Key, string> = {
  K1: 'the-gioi',
  K2: 'nhan-vat',
  K3: 'ke-chuyen',
  K4: 'truyen-tranh',
  K5: 'chuyen-dong',
  K6: 'phim-ngan',
}

function q(
  track: Track,
  key: Key,
  order: number,
  title: string,
  practiceKind: PracticeKindSeed,
  stage: 'ideate' | 'produce',
  skill: string,
  concept: string,
  example: string,
): QuestSeed {
  const id = `${track.toLowerCase()}-${key.toLowerCase()}-q${order}`
  return {
    id,
    order,
    title,
    skill,
    reward: `Huy hiệu · ${title}`,
    duration: track === 'L1' ? '18 phút' : '20 phút',
    hook: stage === 'ideate'
      ? 'Bé cầm lái — chưa dùng AI, chỉ ý tưởng của con!'
      : 'Lấy đúng ý tưởng đã chốt, cùng AI hoàn thiện.',
    accent: ACCENTS[track][(order - 1) % 6],
    practiceKind,
    stage,
    videoUrl:
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    goals: [
      stage === 'ideate' ? 'Tự nghĩ ý trước AI' : 'Chọn lọc kết quả AI',
      skill,
      'Lưu sản phẩm vào Vũ trụ của em',
    ],
    concept,
    example,
    stations: {
      stage,
      stations: [
        {
          id: `${id}-v`,
          kind: 'video',
          durationMin: track === 'L1' ? 3 : 4,
          title: 'Video lý thuyết',
          videoUrl:
            'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `${id}-g`,
          kind: 'game',
          durationMin: track === 'L1' ? 5 : 4,
          title: 'Game tương tác',
          gameType:
            practiceKind === 'spin'
              ? 'spin'
              : practiceKind === 'match' || practiceKind === 'drag'
                ? 'match'
                : 'pick',
        },
        {
          id: `${id}-p`,
          kind: 'practice',
          durationMin: track === 'L1' ? 8 : 10,
          title: 'Thực hành',
          practiceKind,
        },
        {
          id: `${id}-c`,
          kind: 'check',
          durationMin: 2,
          title: 'Kiểm tra nhanh',
        },
      ],
    },
  }
}

/** Deep path: 6–8 quests per course covering ideate → produce */
function questsFor(track: Track, key: Key): QuestSeed[] {
  const deep: Record<Key, () => QuestSeed[]> = {
    K1: () => [
      q(track, key, 1, 'Mọi thế giới bắt đầu từ câu hỏi', 'spin', 'ideate', 'Chọn thế giới tưởng tượng', 'Thế giới bắt đầu từ một ý tưởng rõ ràng của con.', 'Rừng phép thuật / đại dương / vũ trụ kẹo.'),
      q(track, key, 2, 'Vẽ nét đầu tiên bằng lời', 'journal', 'ideate', 'Mô tả thế giới bằng lời', 'Mô tả cụ thể giúp người khác (và AI) hình dung đúng.', 'To hay nhỏ? Sáng hay tối? Điều đặc biệt?'),
      q(track, key, 3, 'Màu sắc kể chuyện', 'palette', 'ideate', 'Chọn bảng màu cảm xúc', 'Màu tạo cảm giác vui, bí ẩn hoặc yên bình.', '3 màu chính cho thế giới của con.'),
      q(track, key, 4, 'Sinh vật đặc biệt & chốt hồ sơ', 'journal', 'ideate', 'Hoàn thiện hồ sơ ý tưởng', 'Trước khi nhờ AI, hồ sơ ý tưởng phải đủ.', 'Sinh vật + cảnh + màu đã chốt.'),
      q(track, key, 5, 'Từ lời tả thành hình cảnh', 'ai_pick', 'produce', 'Tạo hình cảnh cùng AI', 'AI vẽ theo mô tả con đã chốt — con chọn bản đúng ý.', 'Chọn 1 trong 2–3 bản AI.'),
      q(track, key, 6, 'Tạo hình sinh vật cùng AI', 'ai_pick', 'produce', 'Tạo sinh vật clay', 'Chỉnh prompt khi chưa khớp ý — bé cầm lái.', 'Sinh vật soft clay, không nhựa bóng.'),
      q(track, key, 7, 'Ghép bản đồ thế giới', track === 'L1' ? 'comic' : 'chips', 'produce', 'Hoàn thiện bản đồ', 'Gom sản phẩm thành bản đồ thế giới riêng.', 'Cảnh + sinh vật + màu.'),
      q(track, key, 8, 'Tự kiểm & chia sẻ an toàn', 'reflect', 'produce', 'Phản hồi & an toàn', 'Không dùng tên thật; hỏi ba mẹ trước khi chia sẻ.', 'Sản phẩm private-by-default.'),
    ],
    K2: () => [
      q(track, key, 1, 'Nhân vật cần gì?', 'intro', 'ideate', 'Hiểu cấu trúc nhân vật', 'Hình dáng + tính cách + biệt danh an toàn.', 'Mèo tò mò đội mũ sao.'),
      q(track, key, 2, 'Chọn hình dạng & vibe', 'character', 'ideate', 'Thiết kế đặc điểm', 'Con chọn trước khi AI vẽ.', 'Robot mực thân thiện.'),
      q(track, key, 3, 'Chọn phong cách Soft Clay', 'style', 'ideate', 'Art style không nhựa', 'Clay/màu nước/chibi khác chrome bóng.', 'Chọn clay handmade.'),
      q(track, key, 4, 'Tính cách qua hành động', 'match', 'ideate', 'Gắn vibe với hành động', 'Tính cách hiện qua việc nhân vật làm.', 'Tò mò → khám phá hang.'),
      q(track, key, 5, 'AI vẽ nhân vật theo hồ sơ', 'ai_pick', 'produce', 'Sinh hình nhân vật', 'Prompt từ hồ sơ đã chốt.', 'Chọn bản giống ý nhất.'),
      q(track, key, 6, 'Chỉnh & lưu thẻ nhân vật', 'character', 'produce', 'Lưu vào ba lô', 'Thẻ nhân vật private trong portfolio.', 'Biệt danh không PII.'),
    ],
    K3: () => [
      q(track, key, 1, 'Câu chuyện 3–5 nhịp', 'intro', 'ideate', 'Cấu trúc kể chuyện', 'Mở – sự cố – kết (L2: 5 phần).', 'Bạn mèo mất cầu vồng.'),
      q(track, key, 2, 'Chọn sự cố vui', 'story', 'ideate', 'Xây cốt truyện', 'Sự cố phải an toàn và vui.', 'Máy cầu vồng hỏng.'),
      q(track, key, 3, 'Thoại & cảm xúc', 'journal', 'ideate', 'Viết lời thoại', 'Thoại ngắn, rõ cảm xúc.', 'Ôi không! Mình sửa nhé!'),
      q(track, key, 4, 'Thám tử AI sai', 'detective', 'produce', 'Kiểm tra kết quả AI', 'AI có thể sai — con kiểm tra.', 'Chọn mô tả khớp hình.'),
      q(track, key, 5, 'Kể lại bằng thẻ prompt', 'chips', 'produce', 'Prompt kể chuyện', 'Ghép thẻ thành prompt đủ.', '5 thẻ: nhân vật–hành động–nơi…'),
      q(track, key, 6, 'Lưu outline câu chuyện', 'story', 'produce', 'Portfolio story', 'Outline sẵn sàng cho K4 comic.', '5 phần đã chốt.'),
    ],
    K4: () => [
      q(track, key, 1, 'Góc máy kể chuyện', 'match', 'ideate', 'Toàn cảnh vs cận cảnh', 'Góc máy đổi cảm xúc người đọc.', 'Cận = cảm xúc; toàn = bối cảnh.'),
      q(track, key, 2, 'Nhịp đọc & kích thước khung', 'drag', 'ideate', 'Bố cục khung', 'Khung to = quan trọng; nhỏ = chuyển nhanh.', 'Đánh dấu khoảnh khắc khung to.'),
      q(track, key, 3, 'Phân khung 8–10 cảnh', 'journal', 'ideate', 'Panel script', 'Chia câu chuyện thành khung vẽ.', 'Danh sách 8 khoảnh khắc.'),
      q(track, key, 4, 'Thoại bubble an toàn', 'comic', 'ideate', 'Viết thoại khung', 'Không PII; thoại ngắn rõ.', '4 bubble vui.'),
      q(track, key, 5, 'AI vẽ từng khung', 'ai_pick', 'produce', 'Gen panel', 'Mỗi khung một prompt từ script.', 'Chọn bản đúng góc máy.'),
      q(track, key, 6, 'Hoàn thiện truyện tranh', 'comic', 'produce', 'Xuất comic', 'Gom 4–8 khung thành project.', 'Private + xin ba mẹ chia sẻ.'),
    ],
    K5: () => [
      q(track, key, 1, 'Chuyển động là gì?', 'intro', 'ideate', 'Hiểu motion', 'Chuyển động kể cảm xúc.', 'Nhảy mừng vs chậm buồn.'),
      q(track, key, 2, 'Chọn nhịp cảnh', 'match', 'ideate', 'Timing', 'Nhanh/chậm theo cảm xúc.', 'Sự cố = nhịp nhanh.'),
      q(track, key, 3, 'Storyboard chuyển động', 'journal', 'ideate', 'Kế hoạch shot', '3–5 shot trước khi gen video.', 'Shot list đã chốt.'),
      q(track, key, 4, 'AI motion clip', 'video', 'produce', 'Tạo clip', 'Prompt motion + style clay.', 'Clip ngắn an toàn.'),
      q(track, key, 5, 'Chọn lọc & cắt ý', 'reflect', 'produce', 'Biên tập ý', 'Con quyết định shot giữ lại.', '1 clip final private.'),
    ],
    K6: () => [
      q(track, key, 1, 'Phim ngắn cần gì?', 'intro', 'ideate', 'Cấu trúc phim', 'Mở–giữa–kết + thông điệp vui.', '90 giây kể một ý.'),
      q(track, key, 2, 'Kịch bản đầu tay', 'story', 'ideate', 'Viết kịch bản', 'Dựa K3–K5 đã học.', 'Script 5 beat.'),
      q(track, key, 3, 'Cast & bối cảnh', 'character', 'ideate', 'Chọn asset có sẵn', 'Tái sử dụng nhân vật/thế giới.', 'Cast từ ba lô.'),
      q(track, key, 4, 'Dàn dựng shot list', 'journal', 'ideate', 'Đạo diễn', 'Thứ tự shot rõ ràng.', 'Shot list 6–8.'),
      q(track, key, 5, 'AI dựng cảnh/phim', 'video', 'produce', 'Sản xuất', 'Gen theo shot list.', 'Xuất project video.'),
      q(track, key, 6, 'Công chiếu an toàn', 'reflect', 'produce', 'Chia sẻ có kiểm soát', 'Chỉ family sau parent approve.', 'Private-by-default.'),
    ],
  }
  return deep[key]()
}

function buildCourse(track: Track, key: Key, index: number): CourseSeed {
  const m = META[key]
  const ageLabel = track === 'L1' ? '6–8 tuổi' : '9–11 tuổi'
  const sortOrder = (track === 'L1' ? 0 : 100) + index
  return {
    id: `${track.toLowerCase()}-${key.toLowerCase()}-${SLUG[key]}`,
    title: `${track === 'L1' ? 'L1' : 'L2'} · ${m.title}`,
    shortTitle: m.short,
    tagline:
      track === 'L1'
        ? 'Khám phá & lên ý tưởng → hoàn thiện cùng AI (6–8 tuổi)'
        : 'Đạo diễn sáng tạo nâng cao với AI (9–11 tuổi)',
    description: `Lộ trình chuẩn ${ageLabel}: ${m.title}. Giai đoạn 1 không AI (ideate), giai đoạn 2 cùng AI (produce). Mỗi bài ~${track === 'L1' ? 18 : 20} phút: video → game → thực hành → kiểm tra.`,
    coverFrom: ACCENTS[track][0],
    coverTo: ACCENTS[track][1],
    accent: ACCENTS[track][index % 6],
    coverImage: COVERS[key],
    ageLabel,
    ageTrack: track,
    courseKey: key,
    durationLabel: track === 'L1' ? '4 buổi · 8 bài' : '6–8 buổi · 12+ bài',
    productLabel: m.product,
    status: 'open',
    recommended: key === 'K1' || key === 'K4',
    skills: m.skills,
    outcomes: [
      m.product,
      'Portfolio private trong Vũ trụ của em',
      'Hiểu bé cầm lái, AI hỗ trợ',
      'Huy hiệu + sao theo trạm',
    ],
    sortOrder,
    quests: questsFor(track, key),
  }
}

const KEYS: Key[] = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6']

export const curriculumCourses: CourseSeed[] = [
  ...KEYS.map((k, i) => buildCourse('L1', k, i + 1)),
  ...KEYS.map((k, i) => buildCourse('L2', k, i + 1)),
]

/** Legacy 4-course ids → keep as aliases mapped into L tracks if needed */
export const LEGACY_COURSE_IDS = [
  'course-comic',
  'course-robot',
  'course-safety',
  'course-voice',
] as const
