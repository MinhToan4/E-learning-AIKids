import React, { useState } from 'react'
import {
  Smartphone,
  Tablet,
  Monitor,
  Settings,
  Star,
  Zap,
  Lock,
} from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'

type DemoMainTab = 'home' | 'islands' | 'lesson' | 'profile'
type LessonStep = 1 | 2 | 3 | 4 // 1: Video & Bí Kíp, 2: Xác Nhận Nhanh, 3: Thử Thách Test, 4: Xưởng Sáng Tạo
type DeviceMode = 'tablet' | 'mobile' | 'desktop'

interface DogOption {
  id: string
  label: string
}

const DOG_LOOKS: DogOption[] = [
  { id: 'cs-dog-long-vang', label: 'Lông vàng hai tai cụp' },
  { id: 'cs-dog-trang-dom', label: 'Trắng đốm nâu quanh mắt' },
  { id: 'cs-dog-long-xu', label: 'Lông xù bông xốp' },
]

const DOG_ACTIONS: DogOption[] = [
  { id: 'act-dog-duoi-bong', label: 'Đang chạy đuổi quả bóng' },
  { id: 'act-dog-ngoi-cho', label: 'Đang ngồi vẫy đuôi chờ' },
  { id: 'act-dog-tha-dep', label: 'Đang tha một chiếc dép' },
]

const DOG_PLACES: DogOption[] = [
  { id: 'ctx-dog-san-gach', label: 'Ở góc sân gạch đỏ' },
  { id: 'ctx-dog-tham-phong', label: 'Trên thảm phòng khách' },
  { id: 'ctx-dog-cay-bang', label: 'Dưới gốc cây bàng râm mát' },
]

interface OfficialIslandItem {
  id: string
  number: string
  title: string
  subtitle: string
  desc: string
  lessonsCount: number
  starsEarned: number
  totalStars: number
  scene: string
  status: 'active' | 'ready' | 'locked'
}

const OFFICIAL_5_ISLANDS: OfficialIslandItem[] = [
  {
    id: 'dao-1',
    number: 'ĐẢO 1',
    title: 'Đảo Khám Phá',
    subtitle: 'Nhà Thám Hiểm AI',
    desc: 'Bốn Chiếc Chìa Khóa Vàng (Cái gì? Trông thế nào? Đang làm gì? Ở đâu?)',
    lessonsCount: 4,
    starsEarned: 3,
    totalStars: 12,
    scene: designerAssets.worldScenes.aiValley,
    status: 'active',
  },
  {
    id: 'dao-2',
    number: 'ĐẢO 2',
    title: 'Đảo Nhiếp Ảnh',
    subtitle: 'Nhiếp Ảnh Gia Nhí',
    desc: 'Ánh Sáng & Góc Máy AI (Toàn cảnh, cận cảnh, góc flycam trên cao)',
    lessonsCount: 6,
    starsEarned: 0,
    totalStars: 18,
    scene: designerAssets.worldScenes.promptKeys,
    status: 'ready',
  },
  {
    id: 'dao-3',
    number: 'ĐẢO 3',
    title: 'Đảo Họa Sĩ',
    subtitle: 'Họa Sĩ Kỹ Thuật Số',
    desc: 'Phong Cách Nghệ Thuật & Bút Pháp (Màu nước, Anime, Đất nặn 3D)',
    lessonsCount: 8,
    starsEarned: 0,
    totalStars: 24,
    scene: designerAssets.worldScenes.creativeMountain,
    status: 'ready',
  },
  {
    id: 'dao-4',
    number: 'ĐẢO 4',
    title: 'Đảo Âm Nhạc',
    subtitle: 'Phù Thủy Âm Thanh',
    desc: 'Lồng Tiếng Nhân Vật, Hiệu Ứng Âm Thanh & Giai Điệu Bài Hát AI',
    lessonsCount: 6,
    starsEarned: 0,
    totalStars: 18,
    scene: designerAssets.worldScenes.characterLab,
    status: 'ready',
  },
  {
    id: 'dao-5',
    number: 'ĐẢO 5',
    title: 'Đảo Điện Ảnh',
    subtitle: 'Đạo Diễn Hoạt Hình',
    desc: 'Kịch Bản, Storyboard 8 Ô & Sản Xuất Phim Hoạt Hình Hoàn Chỉnh',
    lessonsCount: 8,
    starsEarned: 0,
    totalStars: 24,
    scene: designerAssets.worldScenes.storyIsland,
    status: 'ready',
  },
]

export interface IslandStation {
  id: string
  number: string
  title: string
  desc: string
  status: 'completed' | 'current' | 'locked'
  starsEarned: number
  totalStars: number
}

export const DAO_1_STATIONS: IslandStation[] = [
  {
    id: 'station-1-1',
    number: 'Bài 1.1',
    title: 'Làm quen với AI & Mèo Mee',
    desc: 'Khám phá thế giới trí tuệ nhân tạo, hiểu cách AI vẽ tranh và làm quen người bạn đồng hành.',
    status: 'completed',
    starsEarned: 3,
    totalStars: 3,
  },
  {
    id: 'station-1-2',
    number: 'Bài 1.2',
    title: 'Bốn Chiếc Chìa Khóa Vàng',
    desc: 'Bí kíp 4 câu hỏi vàng: Cái gì? Trông thế nào? Đang làm gì? Ở đâu? để AI vẽ đúng ý.',
    status: 'current',
    starsEarned: 0,
    totalStars: 3,
  },
  {
    id: 'station-1-3',
    number: 'Bài 1.3',
    title: 'Thử Thách Mắt Tinh: AI Vẽ Đúng Hay Sai?',
    desc: 'Luyện mắt tinh anh phát hiện chi tiết thừa thiếu trong tranh AI vẽ theo câu thần chú.',
    status: 'locked',
    starsEarned: 0,
    totalStars: 3,
  },
  {
    id: 'station-1-4',
    number: 'Bài 1.4',
    title: 'Tốt Nghiệp Đảo 1: Đạo Diễn Nhí Đầu Tay',
    desc: 'Tự tay sáng tạo bộ sưu tập nhân vật đầu tiên và nhận Huy Hiệu Nhà Thám Hiểm AI.',
    status: 'locked',
    starsEarned: 0,
    totalStars: 3,
  },
]

export const ISLAND_STATIONS_MAP: Record<string, IslandStation[]> = {
  'dao-1': DAO_1_STATIONS,
  'dao-2': [
    {
      id: 'station-2-1',
      number: 'Bài 2.1',
      title: 'Ống Kính Cận Cảnh (Close-up)',
      desc: 'Bắt trọn biểu cảm mắt mũi, nụ cười đáng yêu của nhân vật qua góc máy zoom sát.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-2-2',
      number: 'Bài 2.2',
      title: 'Góc Nhìn Toàn Cảnh (Wide Shot)',
      desc: 'Mở rộng khung hình để thấy toàn bộ lâu đài, cánh rừng và bầu trời bao la.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-2-3',
      number: 'Bài 2.3',
      title: 'Góc Chim Bay & Mắt Sâu Đo',
      desc: 'Khám phá góc nhìn từ trên mây nhìn xuống (Bird-eye) và góc ngước nhìn từ mặt đất.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-2-4',
      number: 'Bài 2.4',
      title: 'Ánh Sáng Vàng & Dạ Quang Neon',
      desc: 'Điều khiển giờ vàng hoàng hôn thơ mộng và luồng sáng kỳ ảo lung linh trong đêm.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-2-5',
      number: 'Bài 2.5',
      title: 'Bố Cục 1/3 Chuẩn Nhiếp Ảnh Gia',
      desc: 'Đặt nhân vật tại điểm vàng thị giác để bức ảnh hút mắt và sống động hơn.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-2-6',
      number: 'Bài 2.6',
      title: 'Tốt Nghiệp Đảo 2: Triển Lãm Ảnh Nhí',
      desc: 'Đạo diễn bộ sưu tập 3 bức ảnh đa góc máy và nhận Huy Hiệu Nhiếp Ảnh Gia Tài Ba.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
  ],
  'dao-3': [
    {
      id: 'station-3-1',
      number: 'Bài 3.1',
      title: 'Cọ Vẽ Màu Nước Thơ Mộng (Watercolor)',
      desc: 'Học cách biến các ý tưởng thành bức tranh loang màu nước mềm mại trong tranh cổ tích.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-3-2',
      number: 'Bài 3.2',
      title: 'Hoạt Hình 3D Đất Sét Phong Cách Pixar',
      desc: 'Tạo hình khối 3D phúng phính, tròn xoe dễ thương như trong phim hoạt hình chiếu rạp.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-3-3',
      number: 'Bài 3.3',
      title: 'Nét Vẽ Truyện Tranh Anime Nhật Bản',
      desc: 'Khám phá đôi mắt to lấp lánh, mái tóc biểu cảm và đường viền sắc nét của Anime.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-3-4',
      number: 'Bài 3.4',
      title: 'Tranh Sơn Dầu Nghệ Thuật Cổ Điển',
      desc: 'Thử nghiệm nét cọ dày, lớp màu đa tầng như danh họa Van Gogh và Claude Monet.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-3-5',
      number: 'Bài 3.5',
      title: 'Hòa Trộn Bảng Màu Tương Phản',
      desc: 'Kết hợp cặp màu nóng - lạnh đối lập để tranh bừng sáng sức sống và cuốn hút.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-3-6',
      number: 'Bài 3.6',
      title: 'Tốt Nghiệp Đảo 3: Họa Sĩ Đa Phong Cách',
      desc: 'Tạo 1 nhân vật với 3 phong cách cọ vẽ khác nhau và mở khóa Bộ Cọ Thần Kỳ.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
  ],
  'dao-4': [
    {
      id: 'station-4-1',
      number: 'Bài 4.1',
      title: 'Giọng Nói Nhân Vật Hoạt Hình',
      desc: 'Tạo giọng em bé lanh lợi, giọng robot kim loại hay giọng bác gấu trầm ấm.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-4-2',
      number: 'Bài 4.2',
      title: 'Tiếng Động Môi Trường & Âm Thanh Foley',
      desc: 'Thêm tiếng bước chân giòn tan trên lá, tiếng mưa rơi tí tách và tiếng gió vi vu.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-4-3',
      number: 'Bài 4.3',
      title: 'Giai Điệu Vui Nhộn & Kịch Tính (BGM)',
      desc: 'Chọn nhạc nền phù hợp với từng cảnh phiêu lưu, bí ẩn hay chiến thắng.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-4-4',
      number: 'Bài 4.4',
      title: 'Sáng Tác Lời Bài Hát Cùng AI',
      desc: 'Gợi ý từ khóa để AI hòa âm một khúc ca ngắn vui tươi mang tên của bé.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-4-5',
      number: 'Bài 4.5',
      title: 'Lồng Tiếng Khớp Nhịp Hoạt Hình',
      desc: 'Tự con thu âm giọng đọc và để AI làm mượt âm lượng ăn khớp với cử động.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-4-6',
      number: 'Bài 4.6',
      title: 'Tốt Nghiệp Đảo 4: Phù Thủy Âm Thanh',
      desc: 'Hoàn thiện đoạn phim có đủ nhạc nền, tiếng động và nhận Huy Hiệu Phù Thủy Âm Nhạc.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
  ],
  'dao-5': [
    {
      id: 'station-5-1',
      number: 'Bài 5.1',
      title: 'Kịch Bản Phim 3 Hồi Chuẩn Hollywood',
      desc: 'Mở đầu giới thiệu, Biến cố bất ngờ và Hồi kết ấm áp vui vẻ.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-5-2',
      number: 'Bài 5.2',
      title: 'Storyboard 4 Khung Hình Cơ Bản',
      desc: 'Phác thảo 4 bức ảnh then chốt kể trọn vẹn câu chuyện ngắn của bạn cún.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-5-3',
      number: 'Bài 5.3',
      title: 'Mở Rộng Storyboard 8 Khung Hình Chi Tiết',
      desc: 'Bổ sung các cảnh chuyển tiếp để câu chuyện mượt mà và kịch tính hơn.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-5-4',
      number: 'Bài 5.4',
      title: 'Ghép Cảnh & Hiệu Ứng Chuyển Cảnh Mượt Mà',
      desc: 'Sử dụng hiệu ứng mờ dần (Fade) và trượt cảnh như trong rạp chiếu phim.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-5-5',
      number: 'Bài 5.5',
      title: 'Dựng Phim & Hòa Âm Hoàn Chỉnh',
      desc: 'Khớp hình ảnh, lồng tiếng và nhạc nền thành file video chất lượng cao.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-5-6',
      number: 'Bài 5.6',
      title: 'Thiết Kế Áp Phích & Bìa Phim Chiếu Rạp',
      desc: 'Tự tay đạo diễn poster phim hoạt hình với tên tác giả là chính bé.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-5-7',
      number: 'Bài 5.7',
      title: 'Rạp Chiếu Phim AIKid Premiere',
      desc: 'Chiếu thử phim cho bố mẹ và bạn bè cùng xem và nhận những lời chúc mừng.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
    {
      id: 'station-5-8',
      number: 'Bài 5.8',
      title: 'Tốt Nghiệp Đạo Diễn Xuất Sắc',
      desc: 'Nhận Cúp Vàng Đạo Diễn Hoạt Hình Nhí & Chứng Chỉ Tốt Nghiệp Toàn Khóa.',
      status: 'locked',
      starsEarned: 0,
      totalStars: 3,
    },
  ],
}

interface CourseWorldItem {
  id: string
  title: string
  subtitle: string
  tag: string
  tagColor: string
  cover: string
  ageTrack: string
  stationsCount: string
  progressPct: number
  starsEarned: number
  desc: string
  isFlagship?: boolean
}

const ALL_COURSE_WORLDS: CourseWorldItem[] = [
  {
    id: 'course-aikid-flagship',
    title: 'Học Viện Sáng Tạo AIKid',
    subtitle: 'Chương Trình 5 Đảo Chính Thức 2026',
    tag: 'Đang Học',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    cover: designerAssets.worldScenes.aiValley,
    ageTrack: '8–11 tuổi',
    stationsCount: '5 Đảo • 32 Trạm',
    progressPct: 25,
    starsEarned: 48,
    desc: 'Bản đồ 5 hòn đảo kỳ thú: từ 4 câu hỏi chìa khóa, góc máy nhiếp ảnh, cọ vẽ phong cách tới đạo diễn hoạt hình hoàn chỉnh.',
    isFlagship: true,
  },
  {
    id: 'course-comic',
    title: 'Xưởng Sáng Tạo Truyện Tranh AI',
    subtitle: 'Comic & Manga Master',
    tag: 'Sẵn Sàng Học',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
    cover: designerAssets.lobby.artComic,
    ageTrack: '7–12 tuổi',
    stationsCount: '16 Trạm • Cấp L2',
    progressPct: 0,
    starsEarned: 0,
    desc: 'Xây dựng kịch bản tranh, thiết kế biểu cảm nhân vật nhất quán và tự tay xuất bản cuốn truyện tranh đầu tay của con.',
  },
  {
    id: 'course-montessori-asmo',
    title: 'Toán Tư Duy Montessori & ASMO',
    subtitle: 'Olympic Math & Logic',
    tag: 'Khóa VIP',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cover: designerAssets.asmoScenes.appleForest,
    ageTrack: '6–10 tuổi',
    stationsCount: '20 Trạm • Cấp L1',
    progressPct: 0,
    starsEarned: 0,
    desc: 'Cân thăng bằng, mô hình đồng hồ và ma trận logic giúp bé yêu thích toán tư duy tự nhiên không gò bó.',
  },
  {
    id: 'course-game',
    title: 'Xưởng Lập Trình Game Nhí',
    subtitle: 'AI Game Lab',
    tag: 'Khóa VIP',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cover: designerAssets.worldScenes.gameArena,
    ageTrack: '8–14 tuổi',
    stationsCount: '12 Trạm • Cấp L2',
    progressPct: 0,
    starsEarned: 0,
    desc: 'Khám phá thế giới khối lệnh, thiết kế mê cung và thử thách tư duy giải thuật AI cùng nhân vật bé tự tạo.',
  },
]

export const AiKidCourseDemoPage: React.FC = () => {
  // Device & Navigation state
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('tablet')
  const isMobile = deviceMode === 'mobile'
  const [mainTab, setMainTab] = useState<DemoMainTab>('lesson') // Default vào thẳng Bài Học như ảnh thiết kế
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course-aikid-flagship')
  const [selectedIslandId, setSelectedIslandId] = useState<string>('dao-1')
  const [selectedLesson, setSelectedLesson] = useState<string>('Bài 1.2')
  const [currentStep, setCurrentStep] = useState<LessonStep>(2) // Bước 2: Xác Nhận Nhanh (khớp ảnh thiết kế)

  // Gamification State (Level & Stars)
  const [stars, setStars] = useState<number>(49)
  const [level, setLevel] = useState<number>(5)
  const [xpPercent, setXpPercent] = useState<number>(75)

  // Star Celebration Modal State (Hiệu ứng nhận sao hoành tráng)
  const [starModalVisible, setStarModalVisible] = useState<boolean>(false)
  const [starModalData, setStarModalData] = useState<{
    starsAwarded: number
    title: string
    message: string
    onContinue: () => void
  } | null>(null)

  // Video State (Bước 1)
  const [isPinned, setIsPinned] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // P2 Mini Check-in State (Bước 2)
  const [p2Selected, setP2Selected] = useState<string | null>('A')
  const [p2Submitted, setP2Submitted] = useState<boolean>(true)

  // P4 Test State (Bước 3 - 3 câu hỏi từ Google Sheet)
  const p4Questions = [
    {
      id: 1,
      question: '“Một con chó xù màu nâu đang chạy” còn thiếu chìa khóa nào?',
      options: [
        { key: 'A', text: 'CÁI GÌ?', correct: false },
        { key: 'B', text: 'ĐANG LÀM GÌ?', correct: false },
        { key: 'C', text: 'Ở ĐÂU?', correct: true },
      ],
      explanation: 'Đúng rồi! Câu này chưa có địa điểm: ở công viên, trên bãi cỏ hay trong sân?',
    },
    {
      id: 2,
      question: 'Vì sao câu của Zico rất dài mà AI vẫn vẽ chưa rõ?',
      options: [
        { key: 'A', text: 'Vì câu dài nhưng chưa đủ 4 chìa khóa', correct: true },
        { key: 'B', text: 'Vì Zico viết sai chính tả', correct: false },
        { key: 'C', text: 'Vì AI không đọc được câu dài', correct: false },
      ],
      explanation: 'Chính xác! Dài dòng mà thiếu chìa khóa thì AI vẫn phải đoán mò.',
    },
    {
      id: 3,
      question: 'Khi tả một đồ vật, chìa khóa nào dễ bị quên nhất?',
      options: [
        { key: 'A', text: 'ĐANG LÀM GÌ? (dựa tường hay đang chạy)', correct: true },
        { key: 'B', text: 'CÁI GÌ?', correct: false },
        { key: 'C', text: 'TRÔNG NHƯ THẾ NÀO?', correct: false },
      ],
      explanation: 'Đúng rồi! Trạng thái đang làm gì của đồ vật rất dễ bị bỏ quên.',
    },
  ]
  const [testQuestionIdx, setTestQuestionIdx] = useState<number>(0)
  const [testSelected, setTestSelected] = useState<string | null>(null)
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false)

  // P5 Phân Xưởng Sáng Tạo State (Bước 4 - 4 Chìa Khóa Vàng & Hiển Thị Ảnh)
  const [selectedLook, setSelectedLook] = useState<string>('cs-dog-long-vang')
  const [selectedAction, setSelectedAction] = useState<string>('act-dog-duoi-bong')
  const [selectedPlace, setSelectedPlace] = useState<string>('ctx-dog-san-gach')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [hasGenerated, setHasGenerated] = useState<boolean>(true) // Hiển thị tranh ngay khi vào phân xưởng

  // Đường dẫn ảnh thật 100% khớp từ 27 combo ảnh đã kiểm tra trên đĩa
  const currentArtworkUrl = `/assets/pregenerated-combos/dog/combo__sub-con-cun__${selectedLook}__${selectedAction}__${selectedPlace}.webp`

  // Backpack State
  const [backpackTab, setBackpackTab] = useState<'notes' | 'art'>('notes')
  const [pinnedMantras, setPinnedMantras] = useState<string[]>([
    'Chỗ nào mình không nói rõ, AI sẽ tự đoán.',
    'Đủ 4 chìa khoá vàng, AI vẽ đúng ý con ngay!',
  ])

  // Trigger temporary toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Trigger Star Celebration Modal
  const awardStarsCelebration = (
    numStars: number,
    title: string,
    message: string,
    onContinue: () => void,
  ) => {
    setStars((prev) => prev + numStars)
    setXpPercent((prev) => Math.min(100, prev + numStars * 10))
    setStarModalData({
      starsAwarded: numStars,
      title,
      message,
      onContinue,
    })
    setStarModalVisible(true)
  }

  // Ghim Bí Kíp Vào Ba Lô
  const handleTogglePin = () => {
    if (!isPinned) {
      setIsPinned(true)
      setPinnedMantras((prev) => [
        'Đủ 4 chìa khoá vàng, AI vẽ đúng ý con ngay!',
        ...prev,
      ])
      triggerToast('Đã ghim Câu Thần Chú vào Ba Lô của bé!')
    } else {
      setIsPinned(false)
      triggerToast('Đã bỏ ghim khỏi Ba Lô.')
    }
  }

  // Xử lý nộp P2 (Bước 2)
  const handleP2Submit = () => {
    if (!p2Selected) return
    setP2Submitted(true)
    if (p2Selected === 'A') {
      awardStarsCelebration(
        1,
        'XUẤT SẮC! CON NHẬN ĐƯỢC 1 SAO VÀNG!',
        'Con đã nắm chắc 4 câu hỏi chìa khóa của Mèo Mee. Cùng sang bài test nhé!',
        () => {
          setStarModalVisible(false)
          setCurrentStep(3)
        },
      )
    }
  }

  // Xử lý nộp P4 (Bước 3)
  const currentP4 = p4Questions[testQuestionIdx]
  const handleP4Submit = () => {
    if (!testSelected) return
    setTestSubmitted(true)
    const isCorrect = currentP4.options.find((o) => o.key === testSelected)?.correct
    if (isCorrect) {
      if (testQuestionIdx < p4Questions.length - 1) {
        triggerToast('Chính xác! Cùng làm câu tiếp theo nhé!')
      } else {
        // Xong cả 3 câu test
        awardStarsCelebration(
          1,
          'THÔNG MINH LẮM! THƯỞNG THÊM 1 SAO VÀNG!',
          'Con đã hoàn thành xuất sắc 3 câu thử thách hiểu bài. Cùng mở Phân Xưởng Sáng Tạo nhé!',
          () => {
            setStarModalVisible(false)
            setCurrentStep(4)
          },
        )
      }
    }
  }

  // Xử lý tạo tranh trong Phân Xưởng P5 (Bước 4)
  const handleCreateArtwork = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setHasGenerated(true)
      awardStarsCelebration(
        1,
        'HOÀN TẤT TRỌN VẸN 3 SAO VÀNG!',
        'Bức tranh chú cún cưng do chính con làm đạo diễn đã hoàn thành và cất vào Ba Lô!',
        () => {
          setStarModalVisible(false)
          setMainTab('profile')
        },
      )
    }, 900)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center">
      {/* 1. TOP REVIEWER BAR */}
      <header className="w-full bg-slate-950/85 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-sm shadow-md shrink-0">
            M1
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-100 leading-tight">
              ĐẢO KHÁM PHÁ • MODULE 1 — NHÀ THÁM HIỂM AI
            </h1>
            <p className="text-[11px] text-slate-400">
              Khớp 100% Google Sheet: P1 Mục Tiêu → P2 Xác Nhận → P3 Video → P4 Test → P5 Thực Hành
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Device Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                deviceMode === 'tablet'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              iPad (1024px Chassis)
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mobile (390px)
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Desktop
            </button>
          </div>

          {/* Lesson Switcher (Khớp ảnh thiết kế) */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <span className="text-slate-400 px-2 font-medium">Bài:</span>
            {['Bài 1.1', 'Bài 1.2', 'Bài 1.3', 'Bài 1.4'].map((b) => (
              <button
                key={b}
                onClick={() => {
                  setSelectedLesson(b)
                  setMainTab('lesson')
                  if (b === 'Bài 1.2') {
                    setCurrentStep(2)
                  } else {
                    setCurrentStep(1)
                  }
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedLesson === b && mainTab === 'lesson'
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. CHASSIS CONTAINER (Khung máy 1024px / 390px) */}
      <main
        className="w-full flex-1 flex justify-center p-2 sm:p-4 overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 100%)',
        }}
      >
        <div
          className={`w-full transition-all duration-300 bg-[#f8fafc] text-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-300/40 h-[calc(100vh-76px)] ${
            deviceMode === 'tablet'
              ? 'max-w-[1024px]'
              : deviceMode === 'mobile'
              ? 'max-w-[390px]'
              : 'max-w-6xl'
          }`}
        >
          {/* A. HEADER ĐỒNG BỘ TỐI GIẢN */}
          <div className="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xs z-30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 border-2 border-white shadow-sm flex items-center justify-center text-xl shrink-0">
                🐱
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-slate-900 truncate">
                    Bé Bo Bo
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black shrink-0">
                    Online
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold truncate">
                  Đảo Khám Phá · Bài 1.2
                </div>
              </div>
            </div>

            {/* Level & Stars counter */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs">
                <span className="text-base leading-none">⭐</span>
                <span className="font-black text-xs sm:text-sm">{stars}</span>
                <span className="text-[10px] font-bold text-amber-600 hidden sm:inline">
                  Sao
                </span>
              </div>

              <div className="hidden xs:flex flex-col items-end">
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-purple-700">
                  <span>⚡ Cấp {level}: Thám Hiểm Nhí</span>
                </div>
                <div className="w-24 h-2 bg-purple-100 rounded-full overflow-hidden mt-0.5 border border-purple-200">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>

              <button
                title="Khu vực dành cho Phụ huynh"
                className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-200 transition-all shrink-0 font-bold"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* B. MAIN VIEWPORT (Single Scroll Context) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-5 flex flex-col gap-4">
            {/* VIEW: BÀI HỌC VỚI 4 BƯỚC LIỀN MẠCH (STEPPER CHUẨN) */}
            {mainTab === 'lesson' && (
              <div className="flex flex-col gap-4 w-full">
                {/* Thanh điều hướng quay lại Bản Đồ / Đảo Học */}
                <div className="flex items-center justify-between pb-1">
                  <button
                    onClick={() => setMainTab('islands')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 font-bold text-xs shadow-2xs transition-all"
                  >
                    <span>←</span>
                    <span>Quay Lại Bản Đồ Đảo</span>
                  </button>
                  <div className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                    🏝️ Đảo 1: Khám Phá • Bài 1.2
                  </div>
                </div>

                {/* 1. VIDEO PLAYER 16:9 (Ghim cố định ở đầu bài học như ảnh thiết kế) */}
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-clay flex flex-col justify-between p-4 group select-none shrink-0">
                  <img
                    src={designerAssets.worldScenes.promptKeys}
                    alt="Đảo Khám Phá"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-75"
                  />
                  <div className="relative z-10 flex items-center justify-between text-white text-xs">
                    <span className="bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg font-bold">
                      Bài 1.2: Bốn Chiếc Chìa Khóa Vàng
                    </span>
                    <span className="bg-purple-600 px-2 py-0.5 rounded text-[11px] font-bold">
                      BƯỚC {currentStep} / 4
                    </span>
                  </div>
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/95 text-purple-700 shadow-2xl flex items-center justify-center text-2xl font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all">
                      ▶
                    </div>
                  </div>
                  <div className="relative z-10 space-y-1 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-xl text-white text-xs">
                    <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full w-[45%]" />
                    </div>
                    <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                      <span>02:15 / 05:30</span>
                      <a
                        href="https://youtu.be/mF8mN-73yZc"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-purple-300 hover:text-white"
                      >
                        Mở trên YouTube ↗
                      </a>
                    </div>
                  </div>
                </div>

                {/* 2. TIÊU ĐỀ BÀI HỌC & NÚT GHIM BA LÔ */}
                <div className={`rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs flex justify-between gap-3 shrink-0 ${
                  isMobile ? 'flex-col items-stretch' : 'flex-col sm:flex-row sm:items-center'
                }`}>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      Bài 1.2 — Bốn chiếc chìa khoá vàng
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Bốn câu hỏi để không bao giờ bí từ khi nói chuyện với AI: Cái gì? Trông thế nào? Đang làm gì? Ở đâu?
                    </p>
                  </div>

                  <button
                    onClick={handleTogglePin}
                    className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 ${
                      isPinned
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300'
                    }`}
                  >
                    <span>🔖</span>
                    <span>{isPinned ? 'Đã Ghim Bí Kíp Vào Ba Lô' : 'Ghim Bí Kíp Vào Ba Lô'}</span>
                  </button>
                </div>

                {/* 3. THANH TABS P1 / P2 / P4 / P5 (Khớp ảnh thiết kế media_1790516714338.png) */}
                <div className="bg-white rounded-2xl p-1.5 sm:p-2 border border-slate-200 shadow-2xs shrink-0">
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    {[
                      { step: 1, label: isMobile ? 'P1 · Bí Kíp' : 'P1 · Mục Tiêu & Bí Kíp (4 Thẻ)' },
                      { step: 2, label: isMobile ? 'P2 · Xác Nhận' : 'P2 · Xác Nhận Nhanh (Kiểm Tra Hiểu)' },
                      { step: 3, label: isMobile ? 'P4 · Test' : 'P4 · Thử Thách Test' },
                      { step: 4, label: isMobile ? 'P5 · Xưởng Ghép' : 'P5 · Xưởng Ghép 4 Chìa Khóa Vàng' },
                    ].map((st) => {
                      const isActive = currentStep === st.step
                      return (
                        <button
                          key={st.step}
                          onClick={() => setCurrentStep(st.step as LessonStep)}
                          className={`flex-1 min-w-0 py-2 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1 font-bold text-xs ${
                            isActive
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                          }`}
                        >
                          <span className="truncate">{st.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 4. NỘI DUNG TỪNG TAB */}
                {/* === TAB 1: MỤC TIÊU & BÍ KÍP P1 === */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    {/* Mục tiêu & Kỹ năng (Khớp ảnh media_1790516731095.png) */}
                    <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-2">
                      <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-purple-800">
                        🎯 MỤC TIÊU & KỸ NĂNG:
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc font-medium">
                        <li>Trẻ biết một câu lệnh có đủ bốn thành phần cơ bản.</li>
                        <li>Đặt được bốn câu hỏi trước khi bấm tạo hình.</li>
                      </ul>
                    </div>

                    {/* 4 Thẻ Ghi Nhớ Trong Bài */}
                    <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-3">
                      <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-purple-800">
                        CÁC THẺ GHI NHỚ TRONG BÀI:
                      </p>
                      <div className={`grid gap-2.5 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                        {[
                          { key: 'Chìa khóa 1', label: 'Cái gì?', desc: 'Nhân vật / Đồ vật' },
                          { key: 'Chìa khóa 2', label: 'Trông thế nào?', desc: 'Màu sắc, hình dáng' },
                          { key: 'Chìa khóa 3', label: 'Đang làm gì?', desc: 'Hành động cụ thể' },
                          { key: 'Chìa khóa 4', label: 'Ở đâu?', desc: 'Địa điểm bối cảnh' },
                        ].map((c, i) => (
                          <div key={i} className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                            <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                              {c.key}
                            </span>
                            <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{c.label}</p>
                            <p className="text-[11px] text-slate-500">{c.desc}</p>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 font-bold text-xs">
                        📜 Câu Thần Chú: “Đủ 4 chìa khoá vàng, AI vẽ đúng ý con ngay!”
                      </div>
                    </div>

                    {/* Nút chuyển tiếp Bước 2 (Không SVG) */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-clay transition-all"
                      >
                        Sang Bước 2: Xác Nhận Nhanh
                      </button>
                    </div>
                  </div>
                )}

                {/* === BƯỚC 2: XÁC NHẬN NHANH (P2 MINI-CHECK) === */}
                {currentStep === 2 && (
                  <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-clay space-y-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                        BƯỚC 2 · CÂU HỎI XÁC NHẬN
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 mt-2">
                        Bốn chìa khóa của Mèo Mee gồm những gì?
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: 'A', text: 'Cái gì? — Trông thế nào? — Đang làm gì? — Ở đâu?', correct: true },
                        { key: 'B', text: 'Màu gì? — Đẹp không? — Vẽ nhanh lên!', correct: false },
                        { key: 'C', text: 'Tên là gì? — Mấy tuổi? — Đi đâu?', correct: false },
                      ].map((opt) => {
                        const isSelected = p2Selected === opt.key
                        const isCorrect = opt.correct
                        return (
                          <button
                            key={opt.key}
                            onClick={() => {
                              setP2Selected(opt.key)
                              if (p2Submitted && !isCorrect) {
                                setP2Submitted(false)
                              }
                            }}
                            className={`w-full p-4 rounded-2xl text-left font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? p2Submitted
                                  ? isCorrect
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                                    : 'border-rose-400 bg-rose-50 text-rose-950'
                                  : 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                                  isSelected
                                    ? p2Submitted
                                      ? isCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-rose-500 text-white'
                                      : 'bg-purple-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                            {isSelected && (
                              <span className="font-extrabold text-xs">
                                {p2Submitted ? (isCorrect ? '✓ Đúng' : '✗ Sai') : 'Đang chọn'}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Phản hồi khi nộp */}
                    {p2Submitted && (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                          p2Selected === 'A'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <div>
                          {p2Selected === 'A'
                            ? '✅ Chính xác! 4 chìa khóa vàng giúp AI hiểu con mà không phải đoán mò.'
                            : '❌ Chưa đúng rồi! Hãy nhớ 4 câu hỏi: Cái gì? Trông thế nào? Đang làm gì? Ở đâu?'}
                        </div>
                        {p2Selected !== 'A' && (
                          <button
                            onClick={() => {
                              setP2Submitted(false)
                              setP2Selected(null)
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-extrabold text-[11px] shrink-0 hover:bg-rose-100"
                          >
                            Thử Lại Nhé
                          </button>
                        )}
                      </div>
                    )}

                    {/* Nút hành động Bước 2 (Không SVG) */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs"
                      >
                        Quay Lại Video
                      </button>

                      {!p2Submitted ? (
                        <button
                          onClick={handleP2Submit}
                          disabled={!p2Selected}
                          className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-clay transition-all ${
                            p2Selected
                              ? 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Xác Nhận Đáp Án
                        </button>
                      ) : p2Selected === 'A' ? (
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-clay active:scale-95 transition-all"
                        >
                          Tiếp Tục Sang Bài Test P4 (+1 ⭐) &gt;
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setP2Submitted(false)
                            setP2Selected(null)
                          }}
                          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-clay active:scale-95 transition-all"
                        >
                          Chọn Lại & Thử Lại
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* === BƯỚC 3: THỬ THÁCH BÀI TEST P4 (3 CÂU) === */}
                {currentStep === 3 && (
                  <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-clay space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-black text-[10px]">
                        BƯỚC 3 · CÂU HỎI {testQuestionIdx + 1} / 3
                      </span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                        Thưởng +1 ⭐
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {currentP4.question}
                    </h3>

                    <div className="space-y-2">
                      {currentP4.options.map((opt) => {
                        const isSelected = testSelected === opt.key
                        const isCorrect = opt.correct
                        return (
                          <button
                            key={opt.key}
                            onClick={() => {
                              setTestSelected(opt.key)
                              if (testSubmitted && !isCorrect) {
                                setTestSubmitted(false)
                              }
                            }}
                            className={`w-full p-4 rounded-2xl text-left font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? testSubmitted
                                  ? isCorrect
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                                    : 'border-rose-400 bg-rose-50 text-rose-950'
                                  : 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                                  isSelected
                                    ? testSubmitted
                                      ? isCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-rose-500 text-white'
                                      : 'bg-purple-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                            {isSelected && (
                              <span className="font-extrabold text-xs">
                                {testSubmitted ? (isCorrect ? '✓ Đúng' : '✗ Thử lại') : 'Đang chọn'}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {testSubmitted && (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                          currentP4.options.find((o) => o.key === testSelected)?.correct
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <div>
                          {currentP4.options.find((o) => o.key === testSelected)?.correct
                            ? `💡 ${currentP4.explanation}`
                            : '🤔 Chưa đúng rồi! Con hãy đọc kỹ câu hỏi và bấm thử lại nhé!'}
                        </div>
                        {!currentP4.options.find((o) => o.key === testSelected)?.correct && (
                          <button
                            onClick={() => {
                              setTestSubmitted(false)
                              setTestSelected(null)
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-extrabold text-[11px] shrink-0 hover:bg-rose-100"
                          >
                            Thử Lại
                          </button>
                        )}
                      </div>
                    )}

                    {/* Nút hành động Bước 3 (Không SVG) */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs"
                      >
                        Quay Lại Bước 2
                      </button>

                      {!testSubmitted ? (
                        <button
                          onClick={handleP4Submit}
                          disabled={!testSelected}
                          className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-clay transition-all ${
                            testSelected
                              ? 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Nộp Đáp Án
                        </button>
                      ) : currentP4.options.find((o) => o.key === testSelected)?.correct ? (
                        testQuestionIdx < p4Questions.length - 1 ? (
                          <button
                            onClick={() => {
                              setTestQuestionIdx((i) => i + 1)
                              setTestSelected(null)
                              setTestSubmitted(false)
                            }}
                            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-clay active:scale-95 transition-all"
                          >
                            Câu Tiếp Theo
                          </button>
                        ) : (
                          <button
                            onClick={() => setCurrentStep(4)}
                            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-clay active:scale-95 transition-all"
                          >
                            Tiếp Tục Sang Xưởng Ghép P5 (+1 ⭐) &gt;
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            setTestSubmitted(false)
                            setTestSelected(null)
                          }}
                          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-clay active:scale-95 transition-all"
                        >
                          Chọn Lại & Thử Lại
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* === BƯỚC 4: PHÂN XƯỞNG SÁNG TẠO P5 (CÓ HIỂN THỊ ẢNH THỰC TẾ) === */}
                {currentStep === 4 && (
                  <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-clay space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px]">
                          BƯỚC 4 · PHÂN XƯỞNG SÁNG TẠO AI
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                          Thực Hành 01: Đạo Diễn Bức Tranh Chú Cún Cưng
                        </h3>
                      </div>
                      <span className="text-xs font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
                        Thưởng +1 ⭐ Hoàn Tất
                      </span>
                    </div>

                    {/* KHUNG HIỂN THỊ TRANH AI THỰC TẾ (100% ẢNH THẬT TRỰC QUAN) */}
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-purple-200 shadow-inner flex items-center justify-center">
                      {isGenerating ? (
                        <div className="flex flex-col items-center gap-2 text-white">
                          <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
                          <p className="font-extrabold text-sm text-purple-200">
                            AI đang vẽ bức tranh chú cún theo lệnh của con...
                          </p>
                        </div>
                      ) : (
                        <>
                          <img
                            src={currentArtworkUrl}
                            alt="Tranh chú cún do AI tạo"
                            className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-3 sm:p-4 text-white">
                            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full">
                              TRANH TẠO TỪ 4 CHÌA KHÓA VÀNG
                            </span>
                            <p className="font-bold text-xs sm:text-sm text-slate-100 mt-0.5">
                              “Một con cún, {DOG_LOOKS.find((l) => l.id === selectedLook)?.label.toLowerCase()}, {DOG_ACTIONS.find((a) => a.id === selectedAction)?.label.toLowerCase()}, {DOG_PLACES.find((p) => p.id === selectedPlace)?.label.toLowerCase()}.”
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* BẢNG CHỌN 4 CHÌA KHÓA VÀNG */}
                    <div className="space-y-3 pt-1">
                      <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-purple-800">
                        Chọn các chìa khóa để tranh tự động biến hóa:
                      </p>

                      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
                        {/* Chìa khóa 2: Trông thế nào */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 space-y-2">
                          <span className="text-[10px] font-black text-amber-800 uppercase">
                            Chìa khóa 2: Trông thế nào?
                          </span>
                          <div className="space-y-1.5">
                            {DOG_LOOKS.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => setSelectedLook(item.id)}
                                className={`w-full py-2 px-3 rounded-xl text-left text-xs font-bold transition-all ${
                                  selectedLook === item.id
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-white text-slate-700 hover:bg-amber-100'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Chìa khóa 3: Đang làm gì */}
                        <div className="p-3.5 rounded-2xl bg-purple-50/70 border-2 border-purple-200 space-y-2">
                          <span className="text-[10px] font-black text-purple-800 uppercase">
                            Chìa khóa 3: Đang làm gì?
                          </span>
                          <div className="space-y-1.5">
                            {DOG_ACTIONS.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => setSelectedAction(item.id)}
                                className={`w-full py-2 px-3 rounded-xl text-left text-xs font-bold transition-all ${
                                  selectedAction === item.id
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-white text-slate-700 hover:bg-purple-100'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Chìa khóa 4: Ở đâu */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-2">
                          <span className="text-[10px] font-black text-emerald-800 uppercase">
                            Chìa khóa 4: Ở đâu?
                          </span>
                          <div className="space-y-1.5">
                            {DOG_PLACES.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => setSelectedPlace(item.id)}
                                className={`w-full py-2 px-3 rounded-xl text-left text-xs font-bold transition-all ${
                                  selectedPlace === item.id
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white text-slate-700 hover:bg-emerald-100'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nút Tạo Tranh AI (Không SVG trong nút) */}
                    <div className={`flex items-center justify-between gap-3 pt-3 ${
                      isMobile ? 'flex-col-reverse w-full' : 'flex-col sm:flex-row'
                    }`}>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className={`py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs ${
                          isMobile ? 'w-full text-center' : 'px-4'
                        }`}
                      >
                        Quay Lại Bước 3
                      </button>

                      <button
                        onClick={handleCreateArtwork}
                        disabled={isGenerating}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm shadow-clay transition-all ${
                          !isGenerating
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white active:scale-95'
                            : 'bg-purple-300 text-white cursor-wait'
                        }`}
                      >
                        {isGenerating ? 'AI Đang Vẽ Tranh...' : 'Bấm Tạo Tranh AI Ngay (+1 ⭐)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: HỒ SƠ CỦA BÉ (CREATIVE PASSPORT & BA LÔ KHO BÁU BÊN TRONG) */}
            {mainTab === 'profile' && (
              <div className="flex flex-col gap-4 w-full">
                {/* 1. THẺ CĂN CƯỚC SÁNG TẠO CỦA BÉ (CREATIVE PASSPORT) */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 p-5 sm:p-6 text-white shadow-clay">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />

                  <div className={`relative z-10 flex justify-between gap-4 ${
                    isMobile ? 'flex-col items-start' : 'flex-col sm:flex-row sm:items-center'
                  }`}>
                    <div className="flex items-center gap-4">
                      {/* Avatar lớn của con */}
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 border-3 border-white shadow-lg flex items-center justify-center text-3xl sm:text-4xl">
                          🐱
                        </div>
                        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px] border-2 border-white shadow-xs">
                          Cấp 5
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-amber-200 text-[10px] font-black uppercase tracking-wider">
                          🌟 NHÀ THÁM HIỂM AI NHÍ
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          Bé Bo Bo (8 Tuổi)
                        </h2>
                        <p className="text-xs text-purple-100 font-medium">
                          Học viện Sáng Tạo AIKid • Mã học viên: #BO-2026
                        </p>
                      </div>
                    </div>

                    {/* 3 Chỉ số vinh danh của bé */}
                    <div className={`shrink-0 ${isMobile ? 'grid grid-cols-3 w-full gap-2' : 'flex items-center gap-2 sm:gap-2.5'}`}>
                      <div className="px-2 sm:px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 text-center">
                        <div className="text-[9px] sm:text-[10px] font-bold text-purple-200 uppercase">Sao Vàng</div>
                        <div className="text-xs sm:text-base font-black text-amber-300">⭐ {stars}</div>
                      </div>
                      <div className="px-2 sm:px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 text-center">
                        <div className="text-[9px] sm:text-[10px] font-bold text-purple-200 uppercase">Chuỗi Học</div>
                        <div className="text-xs sm:text-base font-black text-white">🔥 3 Ngày</div>
                      </div>
                      <div className="px-2 sm:px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 text-center">
                        <div className="text-[9px] sm:text-[10px] font-bold text-purple-200 uppercase">Huy Hiệu</div>
                        <div className="text-xs sm:text-base font-black text-white">1 / 5</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. KHU VỰC BA LÔ KHO BÁU (WIDGET / NÚT MỞ KHO ĐỒ CỦA CON) */}
                <div className="rounded-3xl bg-white p-4 sm:p-5 border-2 border-purple-200 shadow-clay space-y-4">
                  {/* Header của Ba Lô */}
                  <div className={`flex justify-between gap-3 border-b border-slate-100 pb-3 ${
                    isMobile ? 'flex-col items-start' : 'flex-col sm:flex-row sm:items-center'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                        🎒
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                            Ba Lô Kho Báu Của Bé
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                            {pinnedMantras.length + 1} Vật Phẩm
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Kho lưu trữ tranh con đã sáng tạo, các câu thần chú vàng và bộ sưu tập huy hiệu
                        </p>
                      </div>
                    </div>

                    {/* 2 Tab Ngăn Ba Lô (Thuần Text, Không SVG) */}
                    <div className={`flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl ${
                      isMobile ? 'w-full' : 'self-start sm:self-auto'
                    }`}>
                      <button
                        onClick={() => setBackpackTab('art')}
                        className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all text-center ${
                          backpackTab === 'art'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        🎨 Tranh Của Con (1)
                      </button>
                      <button
                        onClick={() => setBackpackTab('notes')}
                        className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all text-center ${
                          backpackTab === 'notes'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        📜 Bí Kíp ({pinnedMantras.length})
                      </button>
                    </div>
                  </div>

                  {/* Nội dung Ngăn Tranh Con Đã Vẽ */}
                  {backpackTab === 'art' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className={`grid gap-4 items-center ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-300 shadow-md">
                          <img
                            src={currentArtworkUrl}
                            alt="Tranh con vẽ"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-black">
                              TÁC PHẨM ĐẦU TAY
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
                              ⭐ 3 Sao
                            </span>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 text-white text-[11px] font-bold">
                            Đạo diễn bởi: Bé Bo Bo • Cấp 5
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                            <span className="text-[10px] font-black uppercase text-amber-800">
                              CÂU LỆNH TẠO TRANH (4 CHÌA KHÓA VÀNG)
                            </span>
                            <p className="font-bold text-xs text-slate-800">
                              “Một con cún, {DOG_LOOKS.find((l) => l.id === selectedLook)?.label.toLowerCase()}, {DOG_ACTIONS.find((a) => a.id === selectedAction)?.label.toLowerCase()}, {DOG_PLACES.find((p) => p.id === selectedPlace)?.label.toLowerCase()}.”
                            </p>
                          </div>

                          <div className={`flex gap-2 ${isMobile ? 'flex-col w-full' : 'flex-row'}`}>
                            <button
                              onClick={() => {
                                setMainTab('lesson')
                                setCurrentStep(4)
                              }}
                              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-black text-xs shadow-clay transition-all text-center"
                            >
                              Vào Phân Xưởng Sáng Tạo Tranh Mới
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nội dung Ngăn Bí Kíp Thần Chú */}
                  {backpackTab === 'notes' && (
                    <div className={`grid gap-3 animate-in fade-in duration-300 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {pinnedMantras.map((m, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                              BÍ KÍP ĐÃ GHIM #{i + 1}
                            </span>
                            <p className="font-extrabold text-slate-900 text-sm mt-1">“{m}”</p>
                          </div>
                          <button
                            onClick={() => {
                              setMainTab('lesson')
                              setCurrentStep(1)
                            }}
                            className="w-full py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 active:scale-95 transition-all text-center"
                          >
                            Mở Lại Video Ôn Bài
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. TỦ HUY HIỆU 5 ĐẢO SÁNG TẠO (MEDAL SHOWCASE) */}
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                        Bộ Sưu Tập Huy Hiệu 5 Đảo
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Phần thưởng danh giá khi hoàn thành tốt nghiệp từng hòn đảo
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                      1 / 5 Đã Mở
                    </span>
                  </div>

                  <div className={`grid gap-2.5 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-5'}`}>
                    <div className="p-3 rounded-2xl bg-white border-2 border-amber-300 shadow-2xs text-center space-y-1">
                      <div className="text-2xl">🏅</div>
                      <div className="font-black text-xs text-slate-900">Đảo Khám Phá</div>
                      <div className="text-[10px] font-bold text-emerald-600">✓ Đã Nhận</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/60 border border-slate-200 text-center space-y-1 opacity-70">
                      <div className="text-2xl grayscale">📷</div>
                      <div className="font-black text-xs text-slate-500">Đảo Nhiếp Ảnh</div>
                      <div className="text-[10px] font-medium text-slate-400">🔒 Chưa Mở</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/60 border border-slate-200 text-center space-y-1 opacity-70">
                      <div className="text-2xl grayscale">🎨</div>
                      <div className="font-black text-xs text-slate-500">Đảo Họa Sĩ</div>
                      <div className="text-[10px] font-medium text-slate-400">🔒 Chưa Mở</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/60 border border-slate-200 text-center space-y-1 opacity-70">
                      <div className="text-2xl grayscale">🎵</div>
                      <div className="font-black text-xs text-slate-500">Đảo Âm Nhạc</div>
                      <div className="text-[10px] font-medium text-slate-400">🔒 Chưa Mở</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/60 border border-slate-200 text-center space-y-1 opacity-70">
                      <div className="text-2xl grayscale">🎬</div>
                      <div className="font-black text-xs text-slate-500">Đảo Điện Ảnh</div>
                      <div className="text-[10px] font-medium text-slate-400">🔒 Chưa Mở</div>
                    </div>
                  </div>
                </div>

                {/* 4. GÓC PHỤ HUYNH & BẢO VỆ MẮT TRẺ EM (PARENT INSIGHTS) */}
                <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🛡️</span>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          Góc Giám Sát Phụ Huynh & Bảo Vệ Trẻ Em
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Theo dõi thời lượng màn hình và cài đặt an toàn cho con
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerToast('Cài đặt phụ huynh: Giới hạn 30 phút/ngày và xác thực tài khoản an toàn.')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 transition-all"
                    >
                      Cài Đặt Phụ Huynh ⚙️
                    </button>
                  </div>

                  <div className={`grid gap-3 pt-1 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Thời Gian Học Hôm Nay</div>
                      <div className="font-black text-base text-slate-900">15 / 30 Phút</div>
                      <div className="text-[10px] text-emerald-600 font-bold">✓ Đạt mức an toàn thị giác</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Bảo Mật Quyền Riêng Tư</div>
                      <div className="font-black text-base text-emerald-700">100% Kid-Safe</div>
                      <div className="text-[10px] text-slate-500 font-medium">Không mạng xã hội, không chat lạ</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Gói Bản Quyền</div>
                      <div className="font-black text-base text-orange-600">Bản Trải Nghiệm</div>
                      <button
                        onClick={() => triggerToast('Cổng phụ huynh: Mở khóa trọn gói 479.000đ sẽ mở trong phiên bản chính thức!')}
                        className="text-[10px] text-purple-700 font-bold hover:underline"
                      >
                        Nâng Cấp Trọn Gói 479k ➔
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: TRANG CHỦ (HOME SẢNH TỔNG — TINH GỌN, CHÀO ĐÓN BÉ) */}
            {mainTab === 'home' && (
              <div className="flex flex-col gap-5 w-full">
                {/* 1. HERO BANNER: THẾ GIỚI THÁM HIỂM SỐNG ĐỘNG (SCENIC ATMOSPHERE & MINIMAL WORDS) */}
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-5 sm:p-7 text-white shadow-clay border-2 border-amber-300/60">
                  {/* Hiệu ứng ánh sáng & đốm sao kỳ diệu */}
                  <div className="pointer-events-none absolute -top-16 -left-16 w-52 h-52 rounded-full bg-amber-200/30 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-rose-600/30 blur-3xl" />

                  {/* Đám mây Soft Clay lơ lửng */}
                  <div className="pointer-events-none absolute top-4 right-1/4 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold text-white shadow-2xs hidden sm:flex items-center gap-1.5 animate-pulse">
                    <span>☁️</span>
                    <span>Đảo 1: Khám Phá</span>
                  </div>

                  {/* Lớp nền đồi cỏ thoai thoải ở chân banner */}
                  <div className="pointer-events-none absolute bottom-0 inset-x-0 h-8 sm:h-10 bg-gradient-to-t from-emerald-600/25 via-emerald-600/10 to-transparent" />

                  <div className={`relative z-10 flex justify-between gap-4 ${isMobile ? 'flex-col' : 'flex-col md:flex-row items-center'}`}>
                    {/* Phần chữ: Tối giản, tập trung 100% vào sự hào hứng của con */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-white/25 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-2xs">
                          ✨ ĐẢO 1: KHÁM PHÁ • BÀI 1.2
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 text-[10px] font-black">
                          Đang Chờ Con
                        </span>
                      </div>

                      <h2 className={`font-black text-white leading-tight drop-shadow-sm ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
                        Săn Bốn Chiếc Chìa Khóa Vàng!
                      </h2>
                      <p className={`font-bold text-amber-100 max-w-lg ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Cùng Mèo Mee khám phá bí kíp giúp cọ vẽ AI tạo tranh đúng 100% ý con.
                      </p>

                      {/* Nhiệm vụ hôm nay tinh gọn */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/15 backdrop-blur-xs border border-white/20 text-xs text-white font-bold">
                        <span>🎯</span>
                        <span>Nhiệm vụ hôm nay: Hoàn thành bài nhận ngay</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-[11px]">
                          +3 ⭐ Vàng
                        </span>
                      </div>

                      {/* Nút Hành Động Lớn (Nút phồng Soft Clay siêu hút mắt, không SVG) */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            setMainTab('lesson')
                            setCurrentStep(1)
                          }}
                          className={`rounded-2xl bg-white hover:bg-amber-50 active:scale-95 text-orange-600 font-black shadow-clay transition-all flex items-center justify-center gap-2 group ${
                            isMobile ? 'w-full py-4 text-sm' : 'px-8 py-4 text-sm sm:text-base'
                          }`}
                        >
                          <span className="text-xl group-hover:scale-125 transition-transform">🔥</span>
                          <span>Vào Học Bài 1.2 Ngay (+3 ⭐)</span>
                        </button>

                        <button
                          onClick={() => setMainTab('islands')}
                          className={`rounded-2xl bg-black/20 hover:bg-black/30 active:scale-95 text-white font-bold border border-white/30 backdrop-blur-xs transition-all flex items-center justify-center gap-1.5 ${
                            isMobile ? 'w-full py-2.5 text-xs' : 'px-4 py-3.5 text-xs'
                          }`}
                        >
                          <span>🗺️</span>
                          <span>Xem Bản Đồ Đảo</span>
                        </button>
                      </div>
                    </div>

                    {/* Mascot Mèo Mee sống động kèm bóng thoại chào đón */}
                    <div className={`shrink-0 flex flex-col items-center justify-center gap-2 ${isMobile ? 'self-center pt-1' : 'self-center md:self-auto'}`}>
                      <div className="bg-white/95 text-orange-950 px-3.5 py-2 rounded-2xl rounded-br-xs text-xs font-black shadow-lg max-w-[210px] text-center border-2 border-amber-300 animate-in fade-in zoom-in-95">
                        “Bo ơi! Chìa khóa vàng đã sẵn sàng rồi, vào săn cùng tớ nhé! 🔑”
                      </div>
                      <img
                        src="/assets/aikid-ui/mascot-original/course-wave.webp"
                        alt="Mèo Mee chào bé"
                        className={`${isMobile ? 'w-28 h-28' : 'w-32 h-32 sm:w-40 sm:h-40'} object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-105 active:scale-95`}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. KHÓA HỌC CHÍNH (MEGA PROMOTE SHOWCASE TO NHẤT — TRAILER, MUA GÓI, HẢI TRÌNH 5 ĐẢO) */}
                <div className="relative overflow-hidden rounded-[32px] border-2 border-orange-400 ring-4 ring-orange-200/60 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-4 sm:p-6 shadow-clay space-y-4">
                  {/* Top Header of Showcase */}
                  <div className={`flex justify-between gap-3 border-b border-orange-100 pb-3 ${
                    isMobile ? 'flex-col items-start' : 'flex-col sm:flex-row sm:items-center'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-xs whitespace-nowrap">
                          {isMobile ? '⭐ KHÓA CHÍNH 2026' : '⭐ KHÓA HỌC CHÍNH 2026 · HỌC VIỆN SÁNG TẠO AIKID'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                          Đang Học
                        </span>
                      </div>
                      <h3 className="text-base sm:text-2xl font-black text-slate-900 leading-tight">
                        Hải Trình 5 Đảo: Từ Chìa Khóa Vàng Đến Đạo Diễn Hoạt Hình
                      </h3>
                      <p className="text-[11px] sm:text-sm text-slate-600 font-medium max-w-2xl">
                        Chương trình AI chuẩn mực dành riêng cho trẻ em Việt Nam, giúp con kích hoạt tư duy đạo diễn, mỹ thuật kỹ thuật số và sáng tạo an toàn 100%.
                      </p>
                    </div>

                    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 ${isMobile ? 'w-full' : ''}`}>
                      <div className="px-2.5 py-1 rounded-xl bg-orange-100 text-orange-900 font-extrabold text-[11px] sm:text-xs">
                        8–11 tuổi
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 font-extrabold text-[11px] sm:text-xs">
                        5 Đảo • 32 Trạm
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-[11px] sm:text-xs">
                        ⭐ 48 Sao (25%)
                      </div>
                    </div>
                  </div>

                  {/* Main Showcase Body (2 Cột Cân Bằng Hoàn Hảo - Không Còn Khoảng Trắng Thừa) */}
                  <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
                    {/* Cột Trái: Video Trailer + Tiến Độ + Nút Hành Động Của Bé (lg:col-span-7) */}
                    <div className={`${isMobile ? 'w-full' : 'lg:col-span-7'} flex flex-col justify-between gap-3`}>
                      <div className="space-y-3">
                        <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-950 border-2 border-orange-300 shadow-inner group">
                          <img
                            src={designerAssets.worldScenes.aiValley}
                            alt="Trailer 5 Đảo Sáng Tạo AIKid"
                            className="w-full h-full object-cover filter brightness-90 group-hover:scale-102 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

                          {/* Nút Play Trailer tròn Soft Clay to ở giữa */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              onClick={() => triggerToast('Đang phát Trailer 01:45: Giới thiệu toàn cảnh 5 Đảo Sáng Tạo AIKid...')}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-orange-600 shadow-2xl flex items-center justify-center font-black text-2xl sm:text-3xl hover:scale-110 active:scale-95 transition-all border-4 border-amber-300 ring-8 ring-white/20"
                              title="Bấm để xem Trailer giới thiệu 5 Đảo"
                            >
                              ▶
                            </button>
                          </div>

                          {/* Badge góc trên */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-black">
                              🎬 TRAILER CHÍNH THỨC
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
                              01:45
                            </span>
                          </div>

                          {/* Dải thông tin dưới trailer */}
                          <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center justify-between text-[11px] font-bold">
                            <span>Khám phá thế giới 5 Đảo cùng Mèo Mee</span>
                            <span className="text-amber-300 cursor-pointer hover:underline" onClick={() => triggerToast('Đang phát trailer...')}>
                              Xem toàn màn hình ▶
                            </span>
                          </div>
                        </div>

                        {/* Thước đo tiến độ hải trình */}
                        <div className="p-3 rounded-2xl bg-white border border-orange-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none">🗺️</span>
                            <span className="font-bold text-slate-800">
                              Hải trình hiện tại: <strong className="text-orange-600">Đảo 1 (Đảo Khám Phá)</strong>
                            </span>
                          </div>
                          <span className="font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                            ⭐ 3 / 12 Sao Hoàn Thành
                          </span>
                        </div>
                      </div>

                      {/* Cụm Nút Hành Động Cho Con (Nằm Gọn Ngay Dưới Video & Tiến Độ) */}
                      <div className={`grid gap-2 pt-0.5 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        <button
                          onClick={() => setMainTab('islands')}
                          className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs shadow-clay transition-all text-center flex items-center justify-center gap-1.5"
                        >
                          <span>🗺️</span>
                          <span>Mở Bản Đồ Hải Trình 5 Đảo</span>
                        </button>

                        <button
                          onClick={() => {
                            setMainTab('lesson')
                            setCurrentStep(1)
                          }}
                          className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs shadow-clay transition-all text-center flex items-center justify-center gap-1.5"
                        >
                          <span>🔥</span>
                          <span>Học Tiếp Bài 1.2 Ngay</span>
                        </button>
                      </div>
                    </div>

                    {/* Cột Phải: Lợi Ích Cốt Lõi, Hộp Gói Mua & Nút Phụ Huynh (lg:col-span-5) */}
                    <div className={`${isMobile ? 'w-full' : 'lg:col-span-5'} flex flex-col justify-between gap-3`}>
                      {/* 3 Lợi ích vàng của khóa */}
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200 flex items-start gap-2.5">
                          <span className="text-lg leading-none mt-0.5">🏝️</span>
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">Lộ Trình 5 Đảo Trực Quan</div>
                            <div className="text-[11px] text-slate-500 font-medium leading-tight">Từ câu lệnh chìa khóa, góc máy, cọ vẽ tới làm phim hoạt hình.</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200 flex items-start gap-2.5">
                          <span className="text-lg leading-none mt-0.5">🎯</span>
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">32 Trạm Học Montessori</div>
                            <div className="text-[11px] text-slate-500 font-medium leading-tight">Vừa xem video, làm thử thách hiểu bài, vừa tạo tranh thật 100%.</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200 flex items-start gap-2.5">
                          <span className="text-lg leading-none mt-0.5">🛡️</span>
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">Không Gian An Toàn Cho Trẻ</div>
                            <div className="text-[11px] text-slate-500 font-medium leading-tight">Phụ huynh kiểm soát tiến độ, không cần email riêng của con.</div>
                          </div>
                        </div>
                      </div>

                      {/* Hộp Gói Mua Bản Quyền Phụ Huynh */}
                      <div className="rounded-2xl bg-gradient-to-r from-orange-100/90 to-amber-100/90 border border-orange-300 p-3.5 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-purple-950 uppercase tracking-wide">
                            GÓI THÁM HIỂM TOÀN DIỆN
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                            Tiết kiệm 40%
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-xl sm:text-2xl font-black text-orange-600">479.000đ</span>
                          <span className="text-xs text-slate-400 line-through">799.000đ</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Sở hữu trọn đời
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-snug font-medium">
                          Mở khóa toàn bộ 5 Đảo, 32 trạm thực hành và phân xưởng sáng tạo AI không giới hạn.
                        </p>
                      </div>

                      {/* Cụm Nút Phụ Huynh Mở Khóa */}
                      <div className="space-y-1.5 pt-0.5">
                        <button
                          onClick={() => triggerToast('Cổng phụ huynh: Tính năng kích hoạt khóa học sẽ mở trong phiên bản chính thức!')}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black text-xs shadow-clay transition-all text-center flex items-center justify-center gap-1.5"
                        >
                          <span>🛡️</span>
                          <span>Phụ Huynh Mở Khóa Trọn Gói (479k)</span>
                        </button>
                        <div className="text-center text-[10px] text-slate-400 font-medium">
                          Cam kết an toàn 100% cho trẻ • Kích hoạt học ngay
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. CÁC KHÓA HỌC TIẾP THEO (NHỎ HƠN Ở DƯỚI — 3 KHÓA GỌN GÀNG) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                        <span>📚</span>
                        <span>Khám Phá Các Khóa Học Mở Rộng</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Các khóa học chuyên sâu giúp bé mở rộng năng lực sau khi hoàn thành khóa chính
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black border border-slate-200">
                      3 Khóa Mở Rộng
                    </span>
                  </div>

                  {/* Lưới 3 cột nhỏ gọn hơn cho các khóa phụ */}
                  <div className={`grid gap-3.5 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
                    {ALL_COURSE_WORLDS.filter((c) => !c.isFlagship).map((course) => (
                      <div
                        key={course.id}
                        className="rounded-2xl border border-slate-200 overflow-hidden bg-white p-3 flex flex-col justify-between gap-2.5 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all"
                      >
                        <div className="space-y-2">
                          {/* Bìa khóa học 16:9 nhỏ gọn */}
                          <div className="relative w-full aspect-16/9 rounded-xl overflow-hidden bg-slate-950">
                            <img
                              src={course.cover}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${course.tagColor}`}>
                                {course.tag}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold">
                                {course.ageTrack}
                              </span>
                            </div>
                            <div className="absolute bottom-1.5 left-2 right-2 text-white flex items-center justify-between text-[10px] font-bold">
                              <span>{course.stationsCount}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] font-black uppercase text-purple-700">
                              {course.subtitle}
                            </span>
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-1">
                              {course.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-0.5">
                              {course.desc}
                            </p>
                          </div>
                        </div>

                        {/* Nút hành động khóa phụ (Gọn gàng) */}
                        <div className="pt-0.5">
                          <button
                            onClick={() => triggerToast(`Khóa "${course.title}": Hãy hoàn thành Khóa Học Viện AIKid trước để mở khóa nhé!`)}
                            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all text-center"
                          >
                            Khám Phá Khóa Này
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. GÓC TỰ HÀO CỦA BÉ (MY CREATIONS SHOWCASE) */}
                <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/40 border-2 border-amber-200 p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎨</span>
                      <div>
                        <h4 className="font-black text-base text-amber-950">
                          Góc Sáng Tạo Của Bo (Tác Phẩm Mới Nhất)
                        </h4>
                        <p className="text-xs text-amber-800 font-medium">
                          Bức tranh chú cún do chính con đạo diễn ở Phân Xưởng AI đã được lồng khung!
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black shrink-0">
                      Đạt 3 Sao Vàng ⭐
                    </span>
                  </div>

                  {/* Khung tranh 16:9 lồng tác phẩm thật */}
                  <div className={`grid gap-4 items-center pt-1 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-300 shadow-md">
                      <img
                        src={currentArtworkUrl}
                        alt="Tranh con vừa vẽ"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-[11px] font-bold">
                        Đạo diễn bởi: Bé Bo Bo • Cấp 5
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-amber-800">
                          CÂU LỆNH TẠO TRANH CỦA BÉ
                        </span>
                        <p className="font-bold text-xs text-slate-800">
                          “Một con cún, {DOG_LOOKS.find((l) => l.id === selectedLook)?.label.toLowerCase()}, {DOG_ACTIONS.find((a) => a.id === selectedAction)?.label.toLowerCase()}, {DOG_PLACES.find((p) => p.id === selectedPlace)?.label.toLowerCase()}.”
                        </p>
                      </div>

                      <div className={`flex gap-2 ${isMobile ? 'flex-col w-full' : 'flex-row'}`}>
                        <button
                          onClick={() => setMainTab('profile')}
                          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs shadow-xs transition-all text-center"
                        >
                          Mở Hồ Sơ & Ba Lô Xem Tranh ({pinnedMantras.length + 1})
                        </button>
                        <button
                          onClick={() => {
                            setMainTab('lesson')
                            setCurrentStep(4)
                          }}
                          className="w-full py-2.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all text-center"
                        >
                          Vào Phân Xưởng Vẽ Tranh Mới
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: BẢN ĐỒ HẢI TRÌNH (WORLD MAP — HỖ TRỢ ĐA KHÓA HỌC & HẢI TRÌNH 5 ĐẢO SỐNG ĐỘNG) */}
            {mainTab === 'islands' && (() => {
              const currentCourse = ALL_COURSE_WORLDS.find((c) => c.id === selectedCourseId) || ALL_COURSE_WORLDS[0]

              return (
                <div className="flex flex-col gap-4 sm:gap-5 w-full">
                  {/* 1. BỘ CHỌN KHÓA HỌC (COURSE CONTEXT SWITCHER) — SCALABLE CHO NHIỀU KHÓA SAU NÀY */}
                  <div className={`p-3.5 sm:p-4 rounded-3xl bg-white border-2 border-purple-200 shadow-2xs flex justify-between gap-3 ${
                    isMobile ? 'flex-col items-start' : 'flex-col sm:flex-row sm:items-center'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl shrink-0">
                        📚
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Khóa Học Đang Chọn
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            Đang Học
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                          {currentCourse.title}
                        </h2>
                      </div>
                    </div>

                    {/* Bộ chọn / Chuyển nhanh giữa các khóa học */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0">
                      {ALL_COURSE_WORLDS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedCourseId(c.id)
                            if (c.id !== 'course-aikid-flagship') {
                              triggerToast(`Đang chuyển sang bản đồ lộ trình: ${c.title}`)
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                            selectedCourseId === c.id
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {c.isFlagship ? '🌟 Khóa Chính (5 Đảo)' : c.title.replace('Xưởng Sáng Tạo ', '').replace('Xưởng Lập Trình ', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. HEADER BẢN ĐỒ HẢI TRÌNH CỦA KHÓA CHỌN */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 p-4 sm:p-6 text-white shadow-clay">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute left-1/3 -bottom-10 h-36 w-36 rounded-full bg-sky-400/20 blur-xl" />

                    <div className={`relative z-10 flex justify-between gap-4 ${
                      isMobile ? 'flex-col items-start' : 'flex-col sm:flex-row sm:items-center'
                    }`}>
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                          🗺️ HẢI TRÌNH KHÁM PHÁ VŨ TRỤ AIKID
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          Hải Trình 5 Đảo Sáng Tạo
                        </h2>
                        <p className="text-xs sm:text-sm text-purple-100 font-semibold max-w-xl">
                          Chinh phục từng hòn đảo từ 4 Chìa Khóa Vàng đến Đạo Diễn Hoạt Hình Nhí cùng Mèo Mee!
                        </p>
                      </div>

                      {/* Thống kê tiến độ hải trình */}
                      <div className={`shrink-0 ${isMobile ? 'grid grid-cols-3 w-full gap-2' : 'flex items-center gap-2 sm:gap-3'}`}>
                        <div className="px-2 sm:px-3 py-2 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 text-center">
                          <div className="text-[9px] sm:text-[10px] font-bold text-purple-200 uppercase">Tiến Độ</div>
                          <div className="text-xs sm:text-base font-black text-white">1 / 5 Đảo</div>
                        </div>
                        <div className="px-2 sm:px-3 py-2 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 text-center">
                          <div className="text-[9px] sm:text-[10px] font-bold text-purple-200 uppercase">Sao Đảo 1</div>
                          <div className="text-xs sm:text-base font-black text-amber-300">⭐ 3 / 12</div>
                        </div>
                        <div className="px-2 sm:px-3 py-2 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 text-center">
                          <div className="text-[9px] sm:text-[10px] font-bold text-purple-200 uppercase">Tổng Trạm</div>
                          <div className="text-xs sm:text-base font-black text-white">32 Trạm</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. MASCOT MÈO MEE NAVIGATOR BANNER */}
                  <div className="rounded-2xl bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-2 border-amber-300 p-3 sm:p-4 flex items-center justify-between gap-2.5 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-white text-orange-600 shadow-sm flex items-center justify-center text-xl shrink-0 border border-amber-200">
                        ⛵
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-amber-950">
                            Đảo 1: Đảo Khám Phá
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-orange-500 text-white text-[9px] font-black shrink-0">
                            Trạm 1.2
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-900 font-medium line-clamp-1">
                          Thuyền Mèo Mee neo bến • Học nhận ngay +3 ⭐
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setMainTab('lesson')
                        setCurrentStep(1)
                      }}
                      className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs shadow-clay shrink-0 transition-all whitespace-nowrap"
                    >
                      Học Tiếp 🔥
                    </button>
                  </div>

                  {/* 4. HẢI TRÌNH KỲ THÚ 5 ĐẢO (INTERACTIVE ARCHIPELAGO ADVENTURE TRAIL) */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs sm:text-sm text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span>🏝️</span>
                        <span>Hải Trình 5 Đảo Kỳ Thú</span>
                      </h3>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                        Chạm vào đảo để xem lộ trình trạm
                      </span>
                    </div>

                    {/* Danh sách 5 Đảo dọc theo lộ trình hải trình */}
                    <div className="space-y-4">
                      {OFFICIAL_5_ISLANDS.map((island, index) => {
                        const isSelected = selectedIslandId === island.id
                        const isCurrentActive = island.id === 'dao-1'
                        const stations = ISLAND_STATIONS_MAP[island.id] || DAO_1_STATIONS

                        return (
                          <div key={island.id} className="space-y-3">
                            {/* Card hòn đảo */}
                            <div
                              className={`rounded-3xl border-2 transition-all overflow-hidden ${
                                isSelected
                                  ? 'border-orange-500 ring-4 ring-orange-200/80 bg-white shadow-clay'
                                  : isCurrentActive
                                  ? 'border-amber-300 bg-amber-50/30 hover:border-orange-300'
                                  : 'border-slate-200 bg-white/90 hover:border-purple-300'
                              }`}
                            >
                              {/* Banner ảnh cảnh quan hòn đảo */}
                              <div
                                onClick={() => setSelectedIslandId(isSelected ? '' : island.id)}
                                className="relative w-full aspect-21/9 sm:aspect-3/1 cursor-pointer group overflow-hidden bg-slate-950"
                              >
                                <img
                                  src={island.scene}
                                  alt={island.title}
                                  className="w-full h-full object-cover filter brightness-95 group-hover:scale-103 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                                {/* Badge góc trên */}
                                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`px-3 py-1 rounded-full text-white font-black text-[10px] sm:text-xs shadow-md ${
                                        isCurrentActive
                                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse'
                                          : isSelected
                                          ? 'bg-purple-600'
                                          : 'bg-black/60 backdrop-blur-xs'
                                      }`}
                                    >
                                      {island.number} · {island.title}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-amber-200 text-[10px] font-bold">
                                      {island.subtitle}
                                    </span>
                                  </div>

                                  <div>
                                    {isCurrentActive ? (
                                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs shadow-md flex items-center gap-1">
                                        <span>⛵</span>
                                        <span>Thuyền Mèo Mee</span>
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                                        <span>🔒</span>
                                        <span>{island.id === 'dao-2' ? 'Cần 12 ⭐ Đảo 1' : `Cấp L${index + 1}`}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Thông tin chân ảnh */}
                                <div className="absolute bottom-2 sm:bottom-3 inset-x-2.5 sm:inset-x-3 text-white flex items-end justify-between gap-2">
                                  <div className="min-w-0 pr-2">
                                    <h4 className="text-sm sm:text-xl font-black leading-tight text-white drop-shadow-md line-clamp-1">
                                      {island.title} — {island.subtitle}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs text-amber-200 font-semibold line-clamp-1">
                                      {island.desc}
                                    </p>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5">
                                    <span className="px-2 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs shadow-xs">
                                      ⭐ {island.starsEarned}/{island.totalStars}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Thân thẻ đảo: Tóm tắt & Nút mở trạm */}
                              <div className="p-3.5 sm:p-5 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-xs sm:text-sm font-bold text-slate-700">
                                    Lộ trình: <strong className="text-purple-700">{island.lessonsCount} Trạm Thực Hành</strong>
                                    {isCurrentActive && (
                                      <span className="ml-2 text-orange-600 font-extrabold">• Đang học Trạm 1.2 🔥</span>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => setSelectedIslandId(isSelected ? '' : island.id)}
                                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                                      isSelected
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-xs'
                                    }`}
                                  >
                                    {isSelected ? 'Thu Gọn Trạm ▴' : 'Xem Các Trạm ▾'}
                                  </button>
                                </div>

                                {/* Lộ trình Trạm Học khi được mở (Unfolded Station Journey) */}
                                {isSelected && (
                                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-900">
                                        {isCurrentActive
                                          ? `🎯 Danh sách trạm học trên ${island.title}:`
                                          : `🔒 Xem trước các trạm sắp mở trên ${island.title}:`}
                                      </span>
                                      <span className="text-[11px] font-bold text-slate-500">
                                        {isCurrentActive ? 'Hoàn tất bài nhận sao' : 'Mở khi hoàn thành đảo trước'}
                                      </span>
                                    </div>

                                    {/* Lưới các trạm học — Đảm bảo 1 cột trên mobile, 2 cột trên tablet/desktop */}
                                    <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                      {stations.map((station) => {
                                        const isCompleted = station.status === 'completed'
                                        const isCurrent = station.status === 'current'
                                        const isLocked = station.status === 'locked'

                                        return (
                                          <div
                                            key={station.id}
                                            className={`rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between gap-3 ${
                                              isCurrent
                                                ? 'border-orange-500 bg-orange-50/70 shadow-md ring-2 ring-orange-200'
                                                : isCompleted
                                                ? 'border-emerald-300 bg-emerald-50/40'
                                                : 'border-slate-200 bg-slate-50/80 opacity-80'
                                            }`}
                                          >
                                            <div className="space-y-1.5">
                                              <div className="flex items-center justify-between gap-2">
                                                <span
                                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                                    isCurrent
                                                      ? 'bg-orange-500 text-white'
                                                      : isCompleted
                                                      ? 'bg-emerald-600 text-white'
                                                      : 'bg-slate-200 text-slate-600'
                                                  }`}
                                                >
                                                  {station.number}
                                                </span>

                                                <span className="text-[11px] font-bold">
                                                  {isCompleted && (
                                                    <span className="text-emerald-700">✓ Đã đạt {station.starsEarned}/{station.totalStars} ⭐</span>
                                                  )}
                                                  {isCurrent && (
                                                    <span className="text-orange-700 font-extrabold">🔥 Đang Học (+3 ⭐)</span>
                                                  )}
                                                  {isLocked && (
                                                    <span className="text-slate-400">🔒 Chưa Mở</span>
                                                  )}
                                                </span>
                                              </div>

                                              <h5 className="font-black text-sm text-slate-900 leading-snug">
                                                {station.title}
                                              </h5>
                                              <p className="text-xs text-slate-600 font-medium line-clamp-2">
                                                {station.desc}
                                              </p>
                                            </div>

                                            {/* Nút vào bài tương ứng (Thuần Text, Không SVG) */}
                                            <div>
                                              {isCurrent ? (
                                                <button
                                                  onClick={() => {
                                                    setMainTab('lesson')
                                                    setCurrentStep(1)
                                                  }}
                                                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs shadow-xs transition-all text-center"
                                                >
                                                  Vào Học Bài 1.2 Ngay (+3 ⭐)
                                                </button>
                                              ) : isCompleted ? (
                                                <button
                                                  onClick={() => {
                                                    setMainTab('lesson')
                                                    setCurrentStep(1)
                                                  }}
                                                  className="w-full py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all text-center"
                                                >
                                                  Xem Lại Bài 1.1
                                                </button>
                                              ) : (
                                                <button
                                                  onClick={() => triggerToast(`Trạm "${station.number}": ${island.id === 'dao-1' ? 'Hoàn thành Bài 1.2 trước để mở khóa nhé!' : `Cần hoàn thành Đảo 1 trước để mở ${island.title}!`}`)}
                                                  className="w-full py-2 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed text-center"
                                                >
                                                  {island.id === 'dao-1' ? 'Khóa (Cần xong Bài 1.2)' : 'Khóa (Cần tốt nghiệp Đảo 1)'}
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Đoạn nối hải trình giữa các đảo */}
                            {index < OFFICIAL_5_ISLANDS.length - 1 && (
                              <div className="flex flex-col items-center justify-center py-2 select-none">
                                <div className="w-0.5 h-3 border-l-2 border-dashed border-purple-300" />
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] sm:text-xs font-black shadow-2xs">
                                  <span>〰️</span>
                                  <span>Hải trình biển khơi tiếp nối đến {OFFICIAL_5_ISLANDS[index + 1].number}</span>
                                  <span>⛵</span>
                                </div>
                                <div className="w-0.5 h-3 border-l-2 border-dashed border-purple-300" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 5. ROADMAP HẢI TRÌNH 5 MỐC TIẾN HÓA (BIRD-EYE TIMELINE) */}
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className={`flex justify-between gap-2 ${isMobile ? 'flex-col items-start' : 'items-center'}`}>
                      <span className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                        Đường Đến Ngôi Vị Đạo Diễn Hoạt Hình Nhí (5 Cấp Độ):
                      </span>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        Cấp Hiện Tại: L1 (Đang Học)
                      </span>
                    </div>

                    <div className={`grid gap-2 text-center text-xs ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-5'}`}>
                      <div className="p-2.5 rounded-xl bg-orange-100 border border-orange-300 text-orange-900 font-extrabold flex items-center justify-between sm:flex-col sm:justify-center gap-1">
                        <span>L1: Khám Phá AI</span>
                        <span className="text-[10px] text-orange-700 bg-white/70 px-1.5 py-0.5 rounded font-black">4 Chìa Khóa</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium flex items-center justify-between sm:flex-col sm:justify-center gap-1">
                        <span>L2: Nhiếp Ảnh Gia</span>
                        <span className="text-[10px] text-slate-400 bg-white/70 px-1.5 py-0.5 rounded font-bold">Góc Máy & Sáng</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium flex items-center justify-between sm:flex-col sm:justify-center gap-1">
                        <span>L3: Họa Sĩ Số</span>
                        <span className="text-[10px] text-slate-400 bg-white/70 px-1.5 py-0.5 rounded font-bold">Màu Nước, Anime</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium flex items-center justify-between sm:flex-col sm:justify-center gap-1">
                        <span>L4: Phù Thủy Âm</span>
                        <span className="text-[10px] text-slate-400 bg-white/70 px-1.5 py-0.5 rounded font-bold">Lồng Tiếng Nhạc</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium flex items-center justify-between sm:flex-col sm:justify-center gap-1">
                        <span>L5: Đạo Diễn Phim</span>
                        <span className="text-[10px] text-slate-400 bg-white/70 px-1.5 py-0.5 rounded font-bold">Cúp Vàng Nhí 🏆</span>
                      </div>
                    </div>
                  </div>

                  {/* 6. FOOTER QUICK ACTION */}
                  <div className={`p-4 rounded-2xl bg-orange-50 border border-orange-200 flex justify-between gap-3 shadow-2xs ${
                    isMobile ? 'flex-col items-stretch text-center' : 'flex-col sm:flex-row items-center'
                  }`}>
                    <div className="flex items-center gap-2.5 text-left">
                      <span className="text-2xl leading-none">🚀</span>
                      <div>
                        <div className="font-black text-xs sm:text-sm text-orange-950">
                          Sẵn Sàng Tiếp Tục Hải Trình?
                        </div>
                        <div className="text-[11px] text-orange-800 font-medium">
                          Bài 1.2 — Bốn Chiếc Chìa Khóa Vàng đang chờ con vượt qua!
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setMainTab('lesson')
                        setCurrentStep(1)
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs shadow-clay transition-all"
                    >
                      Vào Học Bài 1.2 Ngay (+3 ⭐)
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* C. BOTTOM NAVIGATION (Tách biệt rõ ràng 4 Tab độc lập) */}
          <nav className="shrink-0 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around z-30 shadow-2xs">
            <button
              onClick={() => setMainTab('home')}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all ${
                mainTab === 'home' ? 'text-purple-700 font-extrabold bg-purple-50/60' : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <span className="text-base leading-none">🏠</span>
              <span className="text-[11px]">Trang Chủ</span>
            </button>

            <button
              onClick={() => setMainTab('islands')}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all ${
                mainTab === 'islands' ? 'text-purple-700 font-extrabold bg-purple-50/60' : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <span className="text-base leading-none">🗺️</span>
              <span className="text-[11px]">Bản Đồ</span>
            </button>

            <button
              onClick={() => setMainTab('profile')}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all ${
                mainTab === 'profile' ? 'text-purple-700 font-extrabold bg-purple-50/60' : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <span className="text-base leading-none">👤</span>
              <span className="text-[11px]">Hồ Sơ</span>
            </button>
          </nav>
        </div>

        {/* 🌟 3. STAR CELEBRATION MODAL (HIỆU ỨNG NHẬN SAO BÙNG NỔ RÕ RÀNG) */}
        {starModalVisible && starModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-amber-50 to-white border-4 border-amber-300 p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-300">
              {/* Ngôi sao Soft Clay nảy tưng bừng */}
              <div className="relative flex justify-center pt-2">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-4 border-white shadow-xl flex items-center justify-center text-5xl animate-bounce">
                  ⭐
                </div>
                <div className="absolute -top-1 -right-2 w-8 h-8 rounded-full bg-purple-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                  +{starModalData.starsAwarded}
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-amber-950 tracking-tight leading-snug">
                  {starModalData.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {starModalData.message}
                </p>
              </div>

              {/* Nút Tiếp Tục (Thuần Text, Không SVG) */}
              <div className="pt-2">
                <button
                  onClick={starModalData.onContinue}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white font-black text-sm shadow-clay transition-all"
                >
                  Nhận Thưởng & Tiếp Tục Học
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Toast tạm thời */}
        {toastMessage && (
          <div className="fixed bottom-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-4">
            {toastMessage}
          </div>
        )}
      </main>
    </div>
  )
}
export default AiKidCourseDemoPage
