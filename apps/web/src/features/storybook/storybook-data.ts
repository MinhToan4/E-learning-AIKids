import type { ReactionType } from '@/shared/lib/creation/social-rules'

export type StorybookGroup = 'learning' | 'creative' | 'milestone' | 'social'

export interface StorybookSticker {
  id: string
  name: string
  icon: string
  hint: string
  legacyType?: string
  boss?: boolean
  imageUrl?: string
  placeholderUrl?: string
}

export interface StorybookPage {
  slug: string
  title: string
  group: StorybookGroup
  emoji: string
  colors: [string, string]
  story: string
  stickers: StorybookSticker[]
  coverUrl?: string
  leftBackgroundUrl?: string
  stickerPageUrl?: string
  stickerSheetUrl?: string
  rewardId?: string
}

const sticker = (
  page: string,
  slot: number,
  name: string,
  icon: string,
  hint: string,
  legacyType?: string,
  boss = false,
): StorybookSticker => ({
  id: `${page}-S${slot}`, name, icon, hint, legacyType, boss,
})

export const STORYBOOK_PAGES: readonly StorybookPage[] = [
  {
    slug: 'P01', title: 'Cánh Cổng Thế Giới AI', group: 'learning',
    emoji: '🚪', colors: ['#6b46c1', '#f6e05e'],
    stickerSheetUrl: '/assets/storybook/generated/p01-stickers-alpha.webp',
    story: 'Mỗi bài học thắp lên một ngôi sao trên con đường của Paco.',
    stickers: [
      sticker('P01', 1, 'Bước Chân Đầu Tiên', '👟', 'Hoàn thành quest đầu tiên', 'first_quest'),
      sticker('P01', 2, 'Người Đặt Câu Hỏi', '💬', 'Hỏi AI lần đầu'),
      sticker('P01', 3, 'Ngôi Sao Đầu Tiên', '⭐', 'Đạt 2 sao lần đầu'),
      sticker('P01', 4, '3 Ngày Liên Tiếp', '🔥', 'Giữ streak 3 ngày', 'streak_3'),
      sticker('P01', 5, 'Tốt Nghiệp Chương 1', '🎓', 'Hoàn thành Chương 1'),
      sticker('P01', 6, 'Nhà Sưu Tầm Sao', '🌠', 'Đạt tổng 10 sao', 'star_10'),
      sticker('P01', 7, 'Tuần Lễ Chăm Chỉ', '⚡', 'Giữ streak 7 ngày', 'streak_7'),
      sticker('P01', 8, 'Người Khám Phá', '🗺️', 'Tham gia 2 khóa học'),
      sticker('P01', 9, "Paco's Chosen One", '🌟', 'Paco đang chờ con hoàn thiện hành trình', undefined, true),
    ],
  },
  {
    slug: 'P02', title: 'Vương Quốc Ngôn Ngữ', group: 'learning',
    emoji: '📚', colors: ['#276749', '#d4a017'],
    stickerSheetUrl: '/assets/storybook/generated/p02-stickers-alpha.webp',
    story: 'Từng từ mới mở thêm một căn phòng trong thư viện cổ.',
    stickers: [
      sticker('P02', 1, 'Từ Mới Đầu Tiên', '📝', 'Học một từ mới'),
      sticker('P02', 2, 'Kể Chuyện Ngắn', '📖', 'Hoàn thành quest viết truyện'),
      sticker('P02', 3, 'Bạn Đọc Sách', '🔖', 'Đọc xong một unit'),
      sticker('P02', 4, 'Nhà Văn Nhỏ', '✍️', 'Tạo câu chuyện đầu tiên'),
      sticker('P02', 5, '10 Quest', '🏅', 'Hoàn thành 10 quest'),
      sticker('P02', 6, 'Song Ngữ', '🌍', 'Học ngôn ngữ thứ hai'),
      sticker('P02', 7, 'Được Yêu Thích', '💌', 'Nhận 10 reactions'),
      sticker('P02', 8, '30 Ngôi Sao', '👑', 'Sưu tầm thật nhiều sao', 'star_50'),
      sticker('P02', 9, "Paco's Storyteller", '📜', 'Kể một câu chuyện khiến Paco bất ngờ', undefined, true),
    ],
  },
  {
    slug: 'P03', title: 'Đại Dương Hình Ảnh', group: 'creative',
    emoji: '🌊', colors: ['#0369a1', '#fb7185'],
    stickerSheetUrl: '/assets/storybook/generated/p03-stickers-alpha.webp',
    story: 'Ý tưởng của con nổi lên như những hòn đảo chưa ai khám phá.',
    stickers: [
      sticker('P03', 1, 'Họa Sĩ Nhỏ', '🎨', 'Tạo ảnh AI đầu tiên'),
      sticker('P03', 2, 'Nhân Vật Đầu Tiên', '🧑‍🎨', 'Tạo nhân vật đầu tiên'),
      sticker('P03', 3, 'Mee Ra Đời', '🤖', 'Tạo Mee đầu tiên'),
      sticker('P03', 4, 'Bộ Sưu Tập 5', '🖼️', 'Tạo 5 hình ảnh'),
      sticker('P03', 5, 'Phong Cách Khác Biệt', '🎭', 'Thử 3 phong cách'),
      sticker('P03', 6, 'Tác Phẩm Bay Xa', '📡', 'Được chia sẻ 3 lần'),
      sticker('P03', 7, 'Nghệ Sĩ 10 Tác Phẩm', '🖌️', 'Tạo 10 tác phẩm'),
      sticker('P03', 8, 'Nhà Sáng Tạo Comic', '💥', 'Hoàn thiện một comic'),
      sticker('P03', 9, 'Ocean Artist', '🐚', 'Để trí tưởng tượng vượt đại dương', undefined, true),
    ],
  },
  {
    slug: 'P04', title: 'Đỉnh Núi Tri Thức', group: 'milestone',
    emoji: '⛰️', colors: ['#78350f', '#fbbf24'],
    stickerSheetUrl: '/assets/storybook/generated/p04-stickers-alpha.webp',
    story: 'Nhìn lại quãng đường con đã bền bỉ leo lên.',
    stickers: [
      sticker('P04', 1, 'Học Sinh Kiên Trì', '💎', 'Streak 14 ngày'),
      sticker('P04', 2, 'Tốt Nghiệp Khóa 1', '🏫', 'Hoàn thành một khóa học', 'course_complete'),
      sticker('P04', 3, '100 Ngôi Sao', '👑', 'Đạt 100 sao'),
      sticker('P04', 4, 'Nhà Vô Địch Tuần', '🥇', 'Vào top 3 tuần'),
      sticker('P04', 5, 'Bộ Sưu Tập Hoàn Hảo', '✨', '10 quest liên tiếp đạt 3 sao'),
      sticker('P04', 6, 'Ngọn Hải Đăng', '🏮', 'Truyền cảm hứng 5 lần'),
      sticker('P04', 7, 'Người Truyền Cảm Hứng', '🤝', 'Mời 5 bạn cùng học'),
      sticker('P04', 8, 'Streak Huyền Thoại', '🔥', 'Streak 30 ngày', 'streak_30'),
      sticker('P04', 9, 'The Summit', '🏔️', 'Chinh phục bằng sự kiên trì của riêng con', undefined, true),
    ],
  },
  {
    slug: 'P05', title: 'Xưởng Của Paco', group: 'creative',
    emoji: '🛠️', colors: ['#c2410c', '#fcd34d'],
    stickerSheetUrl: '/assets/storybook/generated/p05-stickers-alpha.webp',
    story: 'Nơi những bản nháp vụng về biến thành phát minh tuyệt vời.',
    stickers: [
      sticker('P05', 1, 'Mở Cửa Xưởng', '🔑', 'Tạo dự án đầu tiên', 'project_first'),
      sticker('P05', 2, 'Bản Vẽ Đầu Tiên', '📐', 'Lưu một bản thiết kế'),
      sticker('P05', 3, 'Ý Tưởng Lấp Lánh', '💡', 'Dùng 3 công cụ sáng tạo'),
      sticker('P05', 4, 'Tác Phẩm Đầu Tay Được Yêu', '💌', 'Nhận 5 reactions'),
      sticker('P05', 5, 'Ngôi Sao Của Lớp', '🌟', 'Vào top 3 lớp'),
      sticker('P05', 6, 'Paco Tự Hào', '🐾', 'Nhận một Paco Pick'),
      sticker('P05', 7, 'Nhà Thiết Kế', '🧰', 'Hoàn thành 10 dự án'),
      sticker('P05', 8, 'Bậc Thầy Xưởng', '⚙️', 'Thử mọi công cụ'),
      sticker('P05', 9, 'Master Inventor', '🏆', 'Tạo thứ chưa ai từng nghĩ tới', undefined, true),
    ],
  },
  {
    slug: 'P06', title: 'Rừng Nhân Vật', group: 'creative',
    emoji: '🌳', colors: ['#166534', '#a3e635'],
    stickerSheetUrl: '/assets/storybook/generated/p06-stickers-alpha.webp',
    story: 'Mỗi nhân vật có một tiếng nói và câu chuyện riêng.',
    stickers: [
      sticker('P06', 1, 'Người Bạn Đầu Tiên', '🧑', 'Tạo một nhân vật'),
      sticker('P06', 2, 'Tủ Trang Phục', '👗', 'Thử 3 diện mạo'),
      sticker('P06', 3, 'Biểu Cảm', '😊', 'Tạo 5 biểu cảm'),
      sticker('P06', 4, 'Đội Phiêu Lưu', '🧑‍🤝‍🧑', 'Tạo 3 nhân vật'),
      sticker('P06', 5, 'Tiểu Sử Bí Mật', '📓', 'Viết tiểu sử nhân vật'),
      sticker('P06', 6, 'Bạn Được Yêu', '💚', 'Nhân vật nhận 10 reactions'),
      sticker('P06', 7, 'Dàn Diễn Viên', '🎭', 'Dùng nhân vật trong truyện'),
      sticker('P06', 8, 'Người Thổi Hồn', '✨', 'Tạo 10 nhân vật'),
      sticker('P06', 9, 'Forest Guardian', '🦉', 'Khiến một nhân vật trở nên thật sống động', undefined, true),
    ],
  },
  {
    slug: 'P07', title: 'Thiên Hà Câu Chuyện', group: 'creative',
    emoji: '🌌', colors: ['#312e81', '#c084fc'],
    stickerSheetUrl: '/assets/storybook/generated/p07-stickers-alpha.webp',
    story: 'Mỗi câu chuyện là một hành tinh đang chờ được gọi tên.',
    stickers: [
      sticker('P07', 1, 'Trang Đầu Tiên', '📄', 'Viết trang truyện đầu tiên'),
      sticker('P07', 2, 'Có Mở Có Kết', '📕', 'Hoàn thành một truyện'),
      sticker('P07', 3, 'Cú Ngoặt Bất Ngờ', '🌀', 'Thêm plot twist'),
      sticker('P07', 4, 'Ba Chương', '📚', 'Viết truyện 3 chương'),
      sticker('P07', 5, 'Người Kể Chuyện', '🎙️', 'Thêm lời kể'),
      sticker('P07', 6, 'Truyền Cảm Hứng', '📡', 'Được share 3 lần'),
      sticker('P07', 7, 'Tác Giả Nhí', '✍️', 'Hoàn thành 5 truyện'),
      sticker('P07', 8, 'Viral Nhỏ', '💫', 'Nhận 20 reactions trong 48 giờ'),
      sticker('P07', 9, 'Galaxy Storyteller', '🌠', 'Viết câu chuyện con luôn muốn được đọc', undefined, true),
    ],
  },
  {
    slug: 'P08', title: 'Trái Tim Kết Nối', group: 'social',
    emoji: '💞', colors: ['#be185d', '#f9a8d4'],
    stickerSheetUrl: '/assets/storybook/generated/p08-stickers-alpha.webp',
    story: 'Huyền thoại lớn lên khi con nâng đỡ sự sáng tạo của người khác.',
    stickers: [
      sticker('P08', 1, 'Người Đặt Tim Đầu Tiên', '💝', 'React cho bạn lần đầu'),
      sticker('P08', 2, 'Cổ Động Viên', '📣', 'React cho 10 tác phẩm'),
      sticker('P08', 3, 'Ngôi Sao Nổi', '🌟', 'Vào Gallery Wall'),
      sticker('P08', 4, 'Người Chia Sẻ', '📤', 'Chia sẻ 5 tác phẩm'),
      sticker('P08', 5, 'Paco Tự Hào', '🐾', 'Nhận 3 Paco Picks'),
      sticker('P08', 6, 'Truyền Cảm Hứng', '✨', 'Được 5 bạn chia sẻ'),
      sticker('P08', 7, 'Trái Tim Vàng', '💛', 'Top người lan tỏa tuần'),
      sticker('P08', 8, 'Nghệ Sĩ Được Yêu', '🎨', 'Nhận 100 reactions'),
      sticker('P08', 9, 'Community Legend', '🏅', 'Giúp người khác muốn sáng tạo theo', undefined, true),
    ],
  },
]

export const REACTIONS: readonly {
  type: ReactionType
  emoji: string
  label: string
}[] = [
  { type: 'EXCELLENT', emoji: '🌟', label: 'Xuất sắc' },
  { type: 'CREATIVE', emoji: '🎨', label: 'Sáng tạo' },
  { type: 'HOT', emoji: '🔥', label: 'Nóng bỏng' },
  { type: 'LOVE', emoji: '🤩', label: 'Mình thích' },
  { type: 'INSIGHTFUL', emoji: '💡', label: 'Ý tưởng hay' },
  { type: 'PACO_PICK', emoji: '🐾', label: 'Paco tự hào' },
]

export const GALLERY_WORKS = [
  { id: 'forest', title: 'Khu Rừng Biết Hát', author: 'An · 11 tuổi', emoji: '🌳', tone: '#dcfce7' },
  { id: 'dragon', title: 'Chú Rồng Xanh', author: 'Minh · 10 tuổi', emoji: '🐉', tone: '#dbeafe' },
  { id: 'city', title: 'Thành Phố Tương Lai', author: 'Lan · 12 tuổi', emoji: '🌆', tone: '#f3e8ff' },
] as const
