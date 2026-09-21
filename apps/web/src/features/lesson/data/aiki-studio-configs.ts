export interface StudioWorkflowStep {
  stepIndex: number
  taskLabel: string
  akiInstruction: string
  quickPrompt: string
  sampleResultUrl: string
  akiFeedback: string
  lockedFeaturesAtStep?: string[]
}

export interface PracticeWorkflow {
  steps: StudioWorkflowStep[]
}

export interface AikiStudioConfig {
  lessonId: string
  sampleUrl?: string
  subjectName: string
  badge: string
  missionChecklist: Array<{ id: string; label: string; done?: boolean; inProgress?: boolean }>
  featuresAvailable: {
    opened: Array<{ title: string; desc: string }>
    locked: Array<{ title: string; desc: string }>
  }
  lockedFeatures: string[]
  pinnedTags: string[]
  quickSuggestions: string[]
  akiMotto: string
  initialAkiMessage: string
  initialPrompt: string
  practiceWorkflow?: PracticeWorkflow
  preloadedImages: Array<{
    id: string
    turn: number
    prompt: string
    time: string
    toneBg: string
    url: string
  }>
  verificationQuestion: {
    question: string
    criteria: string[]
  }
  illustrationType?:
    | 'soc-bong'
    | 'cat-fat'
    | 'teacup'
    | 'rabbit-car'
    | 'four-styles'
    | 'candy-castle'
    | 'engineer-fix'
    | 'knight-hand'
    | 'storytelling'
    | 'magic-forest'
    | 'layer-composition'
    | 'sun-ship'
    | 'color-emotions'
    | 'lighthouse'
    | 'gallery-frame'
    | 'animal-family'
    | 'profile-dna'
    | 'fire-fox'
    | 'six-expressions'
    | 'tree-hollow-base'
    | 'three-gates'
    | 'four-challenges'
    | 'storyboard-panels'
    | 'comic-crown'
    | 'comic-strip'
    | 'dragon-card'
    | 'stat-budget'
    | 'magic-gear-back'
    | 'elemental-duo'
    | 'board-game-arena'
    | 'generic'
  maxTurnsPerItem?: number
  notebookConfig?: any
}

export function createDefaultPracticeWorkflow(config: {
  subjectName?: string
  lockedFeatures?: string[]
  preloadedImages?: Array<{ url: string }>
  missionChecklist?: Array<{ id: string; label: string; done?: boolean; inProgress?: boolean }>
}): PracticeWorkflow {
  const subject = config.subjectName || 'Tác phẩm của con'
  const locked = config.lockedFeatures && config.lockedFeatures.length > 0
    ? config.lockedFeatures
    : ['đặc điểm nổi bật 1', 'đặc điểm nổi bật 2']
  const firstWord = subject.split(' ').slice(0, 2).join(' ')
  const imgs = config.preloadedImages || []

  return {
    steps: [
      {
        stepIndex: 1,
        taskLabel: 'Thử câu lệnh ban đầu (1-2 từ)',
        akiInstruction: `Chào bé! Đầu tiên, bé hãy thử gõ lệnh thật ngắn chỉ 1-2 từ "${firstWord}" xem tớ vẽ ra thế nào nhé!`,
        quickPrompt: firstWord,
        sampleResultUrl: imgs[0]?.url || '/assets/aiki-islands/island1_lesson1_opt_a.jpg',
        akiFeedback: 'Úi chà! Bé thấy không? Tớ vẽ ra một bức tranh lạ hoắc, vì câu lệnh thiếu chi tiết nên tớ phải đoán bừa đấy! 😅 Sang Bước 2: Giờ bé hãy thêm hình dáng và màu sắc vào nhé!',
        lockedFeaturesAtStep: [firstWord],
      },
      {
        stepIndex: 2,
        taskLabel: 'Thêm hình dáng & màu sắc',
        akiInstruction: `Bây giờ bé hãy thêm hình dáng và màu sắc vào câu lệnh: "${firstWord} ${locked[0] || 'màu sắc rõ nét'}" nhé!`,
        quickPrompt: `${firstWord} ${locked[0] || 'màu sắc rõ nét'}`.trim(),
        sampleResultUrl: imgs[1]?.url || imgs[0]?.url || '/assets/aiki-islands/island1_lesson1_opt_b.jpg',
        akiFeedback: 'Oa! Bé giỏi quá! Đã có màu sắc và hình dáng rõ nét hơn rồi nè! Nhưng tớ vẫn chưa biết bạn ấy đang làm gì ở đâu. Sang Bước 3: Giờ bé hãy hoàn thiện câu lệnh với đủ 5 chi tiết vàng nhé!',
        lockedFeaturesAtStep: [firstWord, locked[0] || 'đặc điểm nổi bật'],
      },
      {
        stepIndex: 3,
        taskLabel: 'Hoàn thiện câu lệnh 5 chi tiết vàng',
        akiInstruction: `Bước quyết định nè! Bé hãy thêm hành động và bối cảnh đầy đủ: "${subject} ${locked.join(', ')}" nhé!`,
        quickPrompt: `${subject} ${locked.join(', ')}`.trim(),
        sampleResultUrl: imgs[imgs.length - 1]?.url || imgs[0]?.url || '/assets/aiki-islands/island1_lesson1_cat.jpg',
        akiFeedback: '🎉 Xuất sắc! Bức tranh sinh ra cực kỳ sắc nét và đúng ý bé! Đủ các chi tiết vàng rồi! Bé hãy soi kỹ tranh và bấm nút Nộp Bài & Cất Vào Balo nhé!',
        lockedFeaturesAtStep: locked,
      },
      {
        stepIndex: 4,
        taskLabel: 'Soi kỹ tranh & nộp vào Balo',
        akiInstruction: 'Bé hãy soi kỹ bức tranh xem đã đủ các chi tiết vàng chưa và bấm Nộp Bài để cất an toàn vào Balo Sáng Tạo nhé!',
        quickPrompt: '',
        sampleResultUrl: imgs[imgs.length - 1]?.url || imgs[0]?.url || '/assets/aiki-islands/island1_lesson1_cat.jpg',
        akiFeedback: 'Bức tranh đã đạt chuẩn Hiệp Sĩ AIKI! Bé hãy bấm Nộp Bài & Nhận Cúp để cất an toàn vào Balo Sáng Tạo ngay nào!',
        lockedFeaturesAtStep: locked,
      },
    ],
  }
}

export const AIKI_STUDIO_CONFIGS: Record<string, AikiStudioConfig> = {
  // ──────────────────────────────────────────────────────────────────────────
  // ĐẢO 1: KHỞI NGUYÊN CÂU LỆNH (1.1 -> 1.4)
  // ──────────────────────────────────────────────────────────────────────────
  'bai-1-1': {
    lessonId: 'bai-1-1-mot-tu-hay-nam-tu',
    subjectName: 'Chú Mèo Mướp Béo',
    badge: 'Bài 1.1',
    missionChecklist: [
      { id: '1', label: 'So sánh câu lệnh 1 từ và 5 chi tiết', done: true },
      { id: '2', label: 'Điền đủ 5 chi tiết vào câu lệnh', done: true },
      { id: '3', label: 'Bắt AIKI vẽ chú mèo mướp rồi soi thật kỹ', inProgress: true },
      { id: '4', label: 'Chọn bức tranh ưng nhất rồi nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Vẽ chú mèo mướp béo 5 chi tiết', desc: 'Mèo lông vằn cam, béo tròn, nằm ngủ cuộn tròn' },
        { title: 'Thêm bối cảnh ghế mây & cửa sổ nắng', desc: 'Chiếc ghế mây êm ái cạnh cửa sổ buổi sớm' },
      ],
      locked: [
        { title: 'Đổi phong cách nghệ thuật — cất cho bài 1.3', desc: 'Hôm nay tập trung tả đủ chi tiết trước' },
        { title: 'Sửa lỗi ngón tay — cất cho bài 1.4', desc: 'Bài 1.4 làm bác sĩ câu lệnh' },
        { title: 'Tạo thú cưng mới — hôm nay chỉ vẽ Mèo Mướp thôi', desc: 'Tập trung luyện lệnh 5 chi tiết' },
      ],
    },
    lockedFeatures: ['mèo mướp vàng béo tròn', 'lông vằn cam trắng', 'đang nằm ngủ cuộn tròn'],
    pinnedTags: ['mèo mướp béo tròn', 'lông vằn cam', 'nằm ngủ cuộn tròn'],
    quickSuggestions: [
      'trên chiếc ghế mây êm ái',
      'cạnh cửa sổ ngập nắng vàng buổi sớm',
      'đang lim dim mắt ngáy khò khò ngon lành',
    ],
    akiMotto: 'Chỗ nào các cậu bỏ trống, AI như tớ sẽ tự điền vào. Tả càng rõ thì AIKI vẽ càng đúng ý!',
    initialAkiMessage:
      'Chào các cậu! Hãy giúp tớ vẽ chú mèo mướp béo bằng câu lệnh đủ 5 chi tiết: Ai, hình dáng, hành động, đồ vật, nơi chốn nhé!',
    initialPrompt: 'Con mèo mướp béo đang nằm ngủ cuộn tròn trên chiếc ghế mây cạnh cửa sổ ngập nắng',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Thử câu lệnh ban đầu (1-2 từ)',
          akiInstruction: 'Chào bé! Đầu tiên, bé thử gõ lệnh thật ngắn chỉ 1 từ "con mèo" xem tớ vẽ ra thế nào nhé!',
          quickPrompt: 'con mèo',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson1_opt_a.jpg',
          akiFeedback: 'Úi chà! Bé thấy không? Tớ vẽ ra một con mèo lạ hoắc, vì câu lệnh thiếu chi tiết nên tớ phải đoán bừa đấy! 😅 Sang Bước 2: Giờ bé hãy thêm hình dáng và màu sắc vào nhé!',
          lockedFeaturesAtStep: ['con mèo'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Thêm hình dáng & màu sắc',
          akiInstruction: 'Bây giờ bé hãy thêm hình dáng và màu sắc vào câu lệnh: "mèo mướp vàng béo tròn" nhé!',
          quickPrompt: 'mèo mướp vàng béo tròn',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson1_opt_b.jpg',
          akiFeedback: 'Oa! Bé giỏi quá! Đã ra đúng chú mèo mướp béo rồi nè! Nhưng tớ vẫn chưa biết bạn ấy đang làm gì ở đâu. Sang Bước 3: Giờ bé hãy hoàn thiện câu lệnh đủ 5 chi tiết vàng nhé!',
          lockedFeaturesAtStep: ['mèo mướp vàng béo tròn', 'lông vằn cam trắng'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Hoàn thiện câu lệnh 5 chi tiết vàng',
          akiInstruction: 'Bước quyết định nè! Bé hãy thêm hành động và nơi chốn: "mèo mướp vàng béo tròn đang ngủ cuộn tròn trên ghế mây bên cửa sổ nắng"!',
          quickPrompt: 'mèo mướp vàng béo tròn đang ngủ cuộn tròn trên ghế mây bên cửa sổ nắng',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
          akiFeedback: '🎉 Xuất sắc! Đủ 5 chi tiết vàng rồi! Chú mèo nằm ngủ cuộn tròn trên ghế mây đón nắng xinh quá! Bé hãy soi kỹ tranh và bấm nút Nộp Bài & Cất Vào Balo nhé!',
          lockedFeaturesAtStep: ['mèo mướp vàng béo tròn', 'lông vằn cam trắng', 'đang nằm ngủ cuộn tròn', 'ghế mây', 'cửa sổ nắng'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi kỹ tranh & nộp vào Balo',
          akiInstruction: 'Bé hãy soi kỹ bức tranh xem đã đủ 5 chi tiết vàng chưa và bấm Nộp Bài để cất an toàn vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
          akiFeedback: 'Bức tranh chú mèo mướp béo đã đạt chuẩn Hiệp Sĩ AIKI! Bé hãy bấm Nộp Bài & Nhận Cúp để cất an toàn vào Balo Sáng Tạo ngay nào! 🏆',
          lockedFeaturesAtStep: ['mèo mướp vàng béo tròn', 'lông vằn cam trắng', 'đang nằm ngủ cuộn tròn', 'ghế mây', 'cửa sổ nắng'],
        },
      ],
    },
    preloadedImages: [
      {
        id: 'img-1-1-1',
        turn: 1,
        prompt: 'Con mèo',
        time: '08:15',
        toneBg: 'bg-amber-100',
        url: '/assets/aiki-islands/island1_lesson1_opt_a.jpg',
      },
      {
        id: 'img-1-1-2',
        turn: 2,
        prompt: 'Con mèo mướp béo nằm trên ghế mây',
        time: '08:21',
        toneBg: 'bg-orange-100',
        url: '/assets/aiki-islands/island1_lesson1_opt_b.jpg',
      },
      {
        id: 'img-1-1-3',
        turn: 3,
        prompt: 'Con mèo mướp béo đang nằm ngủ cuộn tròn trên ghế mây cạnh cửa sổ ngập nắng ấm',
        time: '08:28',
        toneBg: 'bg-pink-100',
        url: '/assets/aiki-islands/island1_lesson1_cat.jpg',
      },
    ],
    verificationQuestion: {
      question: 'Bức tranh này đã có đủ 5 chi tiết (Mèo mướp, béo tròn, ngủ cuộn tròn, ghế mây, cửa sổ nắng) chưa?',
      criteria: ['Mèo mướp lông vằn', 'Béo tròn đáng yêu', 'Nằm ngủ trên ghế mây', 'Cửa sổ ngập nắng'],
    },
    illustrationType: 'cat-fat',
  },

  'bai-1-2': {
    lessonId: 'bai-1-2-bon-chiec-chia-khoa',
    subjectName: 'Cỗ Xe Bay Cà Rốt Của Thỏ Trắng',
    badge: 'Bài 1.2',
    missionChecklist: [
      { id: '1', label: 'Tra chìa khóa Xanh (Ai: Thỏ trắng mắt hồng)', done: true },
      { id: '2', label: 'Tra chìa khóa Vàng (Thế nào: Cỗ xe cà rốt chong chóng quay)', done: true },
      { id: '3', label: 'Tra chìa khóa Cam & Đỏ (Bay lượn giữa mây ngũ sắc)', inProgress: true },
      { id: '4', label: 'Chọn bức tranh cỗ xe thỏ trắng đẹp nhất nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Lắp ghép 4 chìa khoá vạn năng', desc: 'Xanh (Thỏ trắng), Vàng (Cỗ xe cà rốt có chong chóng), Cam (Đang bay lượn), Đỏ (Giữa những đám mây ngũ sắc)' },
        { title: 'Biến hóa theo trí tưởng tượng', desc: 'Tự do sáng tạo những phương tiện bay kỳ thú' },
      ],
      locked: [
        { title: 'Đổi phong cách đất nặn clay — cất cho bài 1.3', desc: 'Bài sau sẽ biến hóa phong cách' },
        { title: 'Sửa lỗi ngón tay — cất cho bài 1.4', desc: 'Bài 1.4 làm bác sĩ câu lệnh' },
      ],
    },
    lockedFeatures: ['chú thỏ trắng mắt hồng', 'cỗ xe hình củ cà rốt có chong chóng quay', 'đang bay giữa những đám mây ngũ sắc'],
    pinnedTags: ['thỏ trắng mắt hồng', 'cỗ xe bay cà rốt', 'mây ngũ sắc', '4 chìa khóa vàng'],
    quickSuggestions: [
      'chú thỏ trắng mắt hồng lái cỗ xe hình củ cà rốt bay',
      'cỗ xe có cánh quạt chong chóng quay tít trên mây ngũ sắc',
      '4 chiếc chìa khóa vàng vạn năng',
    ],
    akiMotto: '4 Chìa khóa vạn năng: Xanh (Ai/Cái gì) · Vàng (Trông như thế nào) · Cam (Đang làm gì) · Đỏ (Ở đâu). Đủ 4 chìa là cỗ xe cà rốt bay vút lên mây!',
    initialAkiMessage:
      'Chào bé! Hãy cùng Mimi lắp ghép đủ 4 chìa khoá vạn năng để tạo nên Cỗ Xe Bay Cà Rốt Của Thỏ Trắng bay giữa mây ngũ sắc nhé!',
    initialPrompt: 'Một chú thỏ trắng mắt hồng đang lái cỗ xe bay hình củ cà rốt có cánh quạt chong chóng quay tít giữa những đám mây ngũ sắc',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Tra chìa khóa Xanh (Ai / Cái gì)',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy tra chìa khoá Xanh đầu tiên: "thỏ trắng" xem tớ vẽ thế nào nhé!',
          quickPrompt: 'thỏ trắng',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson2_keys.jpg',
          akiFeedback: 'Tốt lắm! Đã có bạn thỏ trắng rồi nè! Nhưng tớ chưa biết bạn ấy có gì đặc biệt. Sang Bước 2: Tra tiếp chìa khoá Vàng nhé!',
          lockedFeaturesAtStep: ['thỏ trắng'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Tra chìa khóa Vàng (Trông như thế nào)',
          akiInstruction: 'Bé hãy tra chìa khóa Vàng: "thỏ trắng mắt hồng lái cỗ xe hình củ cà rốt"!',
          quickPrompt: 'thỏ trắng mắt hồng lái cỗ xe hình củ cà rốt',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson2_opt_b.jpg',
          akiFeedback: 'Oa! Cỗ xe cà rốt đáng yêu quá! Nhưng xe đang làm gì ở đâu? Sang Bước 3: Tra nốt chìa khóa Cam & Đỏ nhé!',
          lockedFeaturesAtStep: ['thỏ trắng mắt hồng', 'cỗ xe hình củ cà rốt'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Tra chìa khóa Cam & Đỏ hoàn thiện 4 chìa',
          akiInstruction: 'Bước quyết định nè! Tra nốt chìa khóa Cam & Đỏ: "chú thỏ trắng mắt hồng đang lái cỗ xe bay hình củ cà rốt có chong chóng quay tít giữa những đám mây ngũ sắc"!',
          quickPrompt: 'chú thỏ trắng mắt hồng đang lái cỗ xe bay hình củ cà rốt có chong chóng quay tít giữa những đám mây ngũ sắc',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson2_keys.jpg',
          akiFeedback: '🎉 Hoan hô! Đủ 4 chiếc chìa khoá vạn năng rồi! Cỗ xe cà rốt bay vút giữa những đám mây ngũ sắc hiện ra cực kỳ chuẩn xác! Bé hãy soi kỹ và bấm Nộp Bài nhé!',
          lockedFeaturesAtStep: ['chú thỏ trắng mắt hồng', 'cỗ xe củ cà rốt', 'chong chóng quay', 'mây ngũ sắc'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi kỹ tranh & nộp vào Balo',
          akiInstruction: 'Bé hãy soi kỹ xem cỗ xe cà rốt của thỏ trắng đã có đủ 4 chìa khoá chưa rồi bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson2_keys.jpg',
          akiFeedback: 'Bức tranh cỗ xe bay cà rốt 4 chìa khoá đã hoàn thành xuất sắc! Bé hãy cất an toàn vào Balo nào! 🏆',
          lockedFeaturesAtStep: ['chú thỏ trắng mắt hồng', 'cỗ xe củ cà rốt', 'chong chóng quay', 'mây ngũ sắc'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-1-2-1', turn: 1, prompt: 'Thỏ trắng', time: '08:40', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island1_lesson2_opt_a.jpg' },
      { id: 'img-1-2-2', turn: 2, prompt: 'Thỏ trắng mắt hồng lái cỗ xe củ cà rốt', time: '08:45', toneBg: 'bg-orange-100', url: '/assets/aiki-islands/island1_lesson2_opt_b.jpg' },
      { id: 'img-1-2-3', turn: 3, prompt: 'Chú thỏ trắng mắt hồng đang lái cỗ xe bay hình củ cà rốt có chong chóng quay tít giữa những đám mây ngũ sắc', time: '08:52', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island1_lesson2_keys.jpg' },
    ],
    verificationQuestion: {
      question: 'Bức tranh này đã có đủ 4 chìa khóa (Thỏ trắng, cỗ xe cà rốt chong chóng, đang bay, giữa mây ngũ sắc) chưa?',
      criteria: ['Thỏ trắng mắt hồng', 'Cỗ xe hình củ cà rốt có cánh quạt', 'Đang bay giữa những đám mây ngũ sắc'],
    },
    illustrationType: 'rabbit-car',
  },

  'bai-1-3': {
    lessonId: 'bai-1-3-um-ba-la-bien-hinh',
    subjectName: 'Bảng 4 Phong Cách Nghệ Thuật',
    badge: 'Bài 1.3',
    missionChecklist: [
      { id: '1', label: 'Thử phong cách Đất nặn Clay 3D', done: true },
      { id: '2', label: 'Biến hình sang Màu nước Watercolor', done: true },
      { id: '3', label: 'Đổi sang Pixel Art hoặc Xé dán Quilling', inProgress: true },
      { id: '4', label: 'Chọn phong cách ưng ý nhất nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: '4 Phong cách nghệ thuật thần kỳ', desc: 'Đất nặn Clay, Màu nước Watercolor, Pixel Art, Xé dán Quilling' },
        { title: 'Thêm chất liệu tranh vào cuối câu lệnh', desc: 'Giữ nguyên nội dung, đổi phong cách' },
      ],
      locked: [
        { title: 'Sửa ngón tay hiệp sĩ — cất cho bài 1.4', desc: 'Bài 1.4 làm bác sĩ câu lệnh' },
      ],
    },
    lockedFeatures: ['đất nặn Clay 3D tròn trịa', 'màu nước Watercolor loang mềm mại', 'pixel art cổ điển', 'xé dán giấy Quilling tinh tế'],
    pinnedTags: ['phong cách nghệ thuật', 'đất nặn clay', 'màu nước watercolor', 'pixel art'],
    quickSuggestions: [
      'phong cách đất nặn claymation 3D tròn trịa',
      'phong cách màu nước watercolor loang màu mềm mại',
      'phong cách xé dán giấy quilling 3D nghệ thuật',
    ],
    akiMotto: 'Phong cách nghệ thuật giống như thay chiếc áo thần kỳ biến hóa bức tranh hoàn toàn mới!',
    initialAkiMessage:
      'Chào bé! Hôm nay chúng mình cùng biến hóa một con vật qua 4 phong cách nghệ thuật độc đáo nhé!',
    initialPrompt: 'Chú trâu đất nặn Clay 3D tròn trịa đáng yêu với sừng uốn cong trên đồng cỏ xanh',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Thử phong cách Đất Nặn Clay 3D',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy thử vẽ chú trâu bằng phong cách Đất nặn Clay 3D tròn trịa nhé!',
          quickPrompt: 'chú trâu trên đồng cỏ xanh, phong cách đất nặn Clay 3D tròn trịa đáng yêu',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson3_styles.jpg',
          akiFeedback: 'Tuyệt đẹp! Chú trâu đất nặn tròn trịa bóng bẩy cưng xỉu! Sang Bước 2: Giờ bé hãy đổi chiếc áo màu nước xem sao nhé!',
          lockedFeaturesAtStep: ['chú trâu trên cỏ', 'đất nặn clay 3d'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Biến hình sang Màu Nước Watercolor',
          akiInstruction: 'Giữ nguyên câu lệnh, chỉ đổi chữ cuối thành "phong cách màu nước Watercolor loang mềm mại" nhé!',
          quickPrompt: 'chú trâu trên đồng cỏ xanh, phong cách màu nước Watercolor loang màu mềm mại',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson3_opt_a.jpg',
          akiFeedback: 'Oa! Màu nước loang ra êm dịu và nghệ thuật quá! Sang Bước 3: Bé hãy thử tiếp phong cách Pixel Art hoặc Xé dán Quilling nhé!',
          lockedFeaturesAtStep: ['chú trâu trên cỏ', 'màu nước watercolor'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Đổi sang Xé Dán Giấy Quilling / Pixel',
          akiInstruction: 'Bé hãy thử biến hình sang phong cách xé dán giấy Quilling 3D nghệ thuật!',
          quickPrompt: 'chú trâu trên đồng cỏ xanh, phong cách xé dán giấy Quilling 3D nghệ thuật tinh xảo',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson3_opt_b.jpg',
          akiFeedback: '🎉 Vi diệu! Từng thớ giấy uốn lượn nổi 3D cực kỳ tinh tế! 4 phong cách mang lại 4 cảm xúc hoàn toàn khác biệt! Bé hãy chọn bức ưng nhất và nộp bài nhé!',
          lockedFeaturesAtStep: ['chú trâu trên cỏ', 'xé dán giấy quilling'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Chọn phong cách ưng ý nhất & nộp vào Balo',
          akiInstruction: 'Bé hãy chọn bức tranh phong cách mà bé thích nhất và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson3_styles.jpg',
          akiFeedback: 'Tác phẩm biến hóa phong cách nghệ thuật đã được ghi nhận xuất sắc! Bé nhận cúp và cất vào Balo ngay nào! 🏆',
          lockedFeaturesAtStep: ['bảng 4 phong cách', 'tác phẩm ưng ý nhất'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-1-3-1', turn: 1, prompt: 'Chú trâu đất nặn Clay 3D', time: '09:05', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island1_lesson3_styles.jpg' },
      { id: 'img-1-3-2', turn: 2, prompt: 'Chú trâu màu nước Watercolor loang màu', time: '09:12', toneBg: 'bg-sky-100', url: '/assets/aiki-islands/island1_lesson3_opt_a.jpg' },
      { id: 'img-1-3-3', turn: 3, prompt: 'Chú trâu xé dán giấy Quilling 3D nghệ thuật', time: '09:18', toneBg: 'bg-rose-100', url: '/assets/aiki-islands/island1_lesson3_opt_b.jpg' },
    ],
    verificationQuestion: {
      question: 'Bức tranh này đã thể hiện rõ phong cách nghệ thuật đặc trưng chưa?',
      criteria: ['Phong cách nghệ thuật rõ nét', 'Đường nét chất liệu chân thực', 'Màu sắc hài hòa đúng kiểu'],
    },
    illustrationType: 'four-styles',
  },

  'bai-1-4': {
    lessonId: 'bai-1-4-ky-su-tai-ba',
    subjectName: 'Bác Sĩ Câu Lệnh Sửa Tay Hiệp Sĩ',
    badge: 'Bài 1.4',
    missionChecklist: [
      { id: '1', label: 'Xem tranh lỗi 6 ngón và gọi tên lỗi', done: true },
      { id: '2', label: 'Tìm chỗ thiếu trong câu lệnh cần kê đơn', done: true },
      { id: '3', label: 'Tạo lại câu lệnh chữa lỗi đúng 5 ngón', inProgress: true },
      { id: '4', label: 'Soi bàn tay 5 ngón hoàn hảo nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: '3 Bước sửa lỗi của bác sĩ câu lệnh', desc: 'Gọi tên lỗi -> Tìm chỗ thiếu -> Viết thêm vào câu lệnh' },
        { title: 'Sửa lỗi bàn tay hiệp sĩ 6 ngón', desc: 'Thêm găng tay giáp bạc đúng 5 ngón tay rõ ràng' },
      ],
      locked: [
        { title: 'Bố cục 3 lớp ngôi sao — cất cho Đảo 2', desc: 'Đảo 2 sẽ học làm hoạ sĩ AI' },
      ],
    },
    lockedFeatures: ['bàn tay hiệp sĩ đeo găng giáp bạc đúng 5 ngón', 'viên ngọc xanh biếc bảo hộ phát sáng', 'áo giáp kim loại phản chiếu ánh hào quang'],
    pinnedTags: ['bác sĩ câu lệnh', 'đúng 5 ngón tay', 'găng tay giáp bạc'],
    quickSuggestions: [
      'đeo găng tay giáp bạc đúng 5 ngón tay rõ ràng',
      'nắm chặt chuôi kiếm có viên ngọc xanh phát sáng',
      'hào quang bảo vệ phát ra từ lòng bàn tay',
    ],
    akiMotto: 'Bác sĩ câu lệnh: Tranh chưa chuẩn thì sửa chữ chứ đừng bấm nút bừa!',
    initialAkiMessage:
      'Chào Kỹ Sư Nhí! Đừng bấm nút tạo bừa nhé! Hãy cùng áp dụng 3 bước bác sĩ câu lệnh để chữa lành bàn tay hiệp sĩ nào!',
    initialPrompt: 'Bàn tay hiệp sĩ bọc găng giáp bạc đúng 5 ngón tay rõ ràng nắm chặt chuôi kiếm có viên ngọc xanh phát sáng',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Xem tranh lỗi và gọi tên lỗi',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy nhìn bức tranh hiệp sĩ bị lỗi 6 ngón và gọi tên đúng căn bệnh nhé!',
          quickPrompt: 'bàn tay hiệp sĩ đang cầm kiếm',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson4_opt_a.jpg',
          akiFeedback: 'Chính xác! Lỗi là: Bàn tay có 6 ngón tay! Càng bấm tạo lại càng bị lỗi vì câu lệnh thiếu chi tiết. Sang Bước 2: Tìm chỗ thiếu nhé!',
          lockedFeaturesAtStep: ['bàn tay hiệp sĩ', 'bị lỗi 6 ngón'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Tìm chỗ thiếu & kê đơn sửa câu lệnh',
          akiInstruction: 'Trong câu cũ chưa nói số ngón và loại găng tay! Giờ bé hãy thêm vào: "đeo găng tay giáp bạc đúng 5 ngón tay rõ ràng"!',
          quickPrompt: 'bàn tay hiệp sĩ đeo găng giáp bạc đúng 5 ngón tay rõ ràng cầm kiếm',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson4_engineer.jpg',
          akiFeedback: 'Hay lắm! Bé đã kê đúng đơn thuốc rồi! Sang Bước 3: Thêm chi tiết ngọc xanh phát sáng để hoàn thiện bức tranh hiệp sĩ nào!',
          lockedFeaturesAtStep: ['đúng 5 ngón tay rõ ràng', 'găng giáp bạc'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Tạo lại câu lệnh hoàn thiện chuẩn 5 ngón',
          akiInstruction: 'Bước quyết định: "bàn tay hiệp sĩ bọc găng giáp bạc đúng 5 ngón tay rõ ràng nắm chặt chuôi kiếm có viên ngọc xanh phát sáng"!',
          quickPrompt: 'bàn tay hiệp sĩ bọc găng giáp bạc đúng 5 ngón tay rõ ràng nắm chặt chuôi kiếm có viên ngọc xanh phát sáng',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson4_engineer.jpg',
          akiFeedback: '🎉 Xuất sắc! Bàn tay hiệp sĩ bọc giáp bạc đúng 5 ngón tay rõ mồn một, viên ngọc xanh phát sáng rực rỡ! Bác sĩ câu lệnh ra tay chuẩn không cần chỉnh! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['đúng 5 ngón tay', 'găng giáp bạc', 'ngọc xanh phát sáng'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi kỹ tranh & nộp vào Balo',
          akiInstruction: 'Bé hãy đếm kỹ lại xem đủ 5 ngón tay chưa và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island1_lesson4_engineer.jpg',
          akiFeedback: 'Chúc mừng Kỹ Sư AI tài ba đã chữa lành bức tranh thành công và tốt nghiệp Đảo 1! 🏆',
          lockedFeaturesAtStep: ['đúng 5 ngón tay', 'găng giáp bạc', 'ngọc xanh phát sáng'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-1-4-1', turn: 1, prompt: 'Bàn tay hiệp sĩ cầm kiếm (lỗi 6 ngón)', time: '09:30', toneBg: 'bg-rose-100', url: '/assets/aiki-islands/island1_lesson4_opt_a.jpg' },
      { id: 'img-1-4-2', turn: 2, prompt: 'Bàn tay hiệp sĩ đeo găng giáp bạc đúng 5 ngón tay cầm kiếm', time: '09:35', toneBg: 'bg-sky-100', url: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
      { id: 'img-1-4-3', turn: 3, prompt: 'Bàn tay hiệp sĩ bọc găng giáp bạc đúng 5 ngón tay rõ ràng nắm chuôi kiếm đính ngọc xanh phát sáng', time: '09:42', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
    ],
    verificationQuestion: {
      question: 'Bàn tay hiệp sĩ trong tranh đã có đúng 5 ngón tay rõ ràng chưa?',
      criteria: ['Đúng 5 ngón tay rõ ràng', 'Đeo găng giáp bạc chuẩn xác', 'Không còn ngón thừa hay biến dạng'],
    },
    illustrationType: 'engineer-fix',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ĐẢO 2: TỚ LÀ HOẠ SĨ AI! (2.1 -> 2.4)
  // ──────────────────────────────────────────────────────────────────────────
  'bai-2-1': {
    lessonId: 'bai-2-1-buc-tranh-biet-noi',
    subjectName: 'Bức Tranh Biết Nói',
    badge: 'Bài 2.1',
    missionChecklist: [
      { id: '1', label: 'Trả lời câu hỏi 1: Đang làm gì?', done: true },
      { id: '2', label: 'Trả lời câu hỏi 2: Có gì lạ?', done: true },
      { id: '3', label: 'Trả lời câu hỏi 3: Rồi sao?', inProgress: true },
      { id: '4', label: 'Kể trọn vẹn câu chuyện trong tranh nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: '3 Câu hỏi tìm chuyện của hoạ sĩ', desc: 'Đang làm gì? · Có gì lạ? · Rồi sao?' },
        { title: 'Bức tranh biết kể chuyện', desc: 'Hành động, điểm lạ và diễn biến tiếp theo' },
      ],
      locked: [
        { title: 'Bố cục 3 lớp — cất cho bài 2.2', desc: 'Bài 2.2 sẽ học xếp chỗ cho ngôi sao' },
      ],
    },
    lockedFeatures: ['chú cáo lông đỏ ngậm phong thư phát sáng', 'dấu chân in trên nền tuyết trắng xóa', 'khu rừng thông mờ sương buổi sớm'],
    pinnedTags: ['bức tranh biết nói', 'cáo lông đỏ ngậm thư', 'rừng thông tuyết'],
    quickSuggestions: [
      'chú cáo lông đỏ ngậm phong thư phát sáng bí ẩn',
      'dấu chân vội vã in trên nền tuyết trắng xóa',
      'khu rừng thông mờ sương trong sớm mùa đông lạnh giá',
    ],
    akiMotto: 'Bức tranh đẹp là bức tranh biết nói! 3 câu hỏi tìm chuyện: Đang làm gì? Có gì lạ? Rồi sao?',
    initialAkiMessage:
      'Chào Hoạ Sĩ Nhí! Một bức tranh đẹp không chỉ có hình vẽ tĩnh, mà phải biết kể một câu chuyện kỳ diệu! Cùng tìm chuyện nào!',
    initialPrompt: 'Chú cáo lông đỏ ngậm phong thư phát sáng bí ẩn bước vội vã qua nền tuyết trắng trong rừng thông sớm',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Câu hỏi 1: Đang làm gì? (Hành động)',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy trả lời câu hỏi 1: Chú cáo đang làm gì trên nền tuyết trắng?',
          quickPrompt: 'chú cáo lông đỏ đang chạy vội vã trên nền tuyết trắng',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson1_opt_a.jpg',
          akiFeedback: 'Hay lắm! Chú cáo đang chạy trên tuyết rồi! Nhưng bức tranh vẫn bình thường. Sang Bước 2: Hỏi câu hỏi Có gì lạ nhé!',
          lockedFeaturesAtStep: ['chú cáo lông đỏ', 'chạy trên tuyết'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Câu hỏi 2: Có gì lạ? (Chi tiết bất ngờ)',
          akiInstruction: 'Bé hãy thêm chi tiết lạ: Chú cáo ngậm một phong thư phát sáng ánh vàng lấp lánh!',
          quickPrompt: 'chú cáo lông đỏ ngậm phong thư phát sáng ánh vàng lấp lánh chạy trên tuyết',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson1_story.jpg',
          akiFeedback: 'Oa! Phong thư phát sáng lạ kỳ quá! Người xem bắt đầu tò mò rồi đấy! Sang Bước 3: Hỏi câu hỏi Rồi sao nhé!',
          lockedFeaturesAtStep: ['chú cáo lông đỏ', 'phong thư phát sáng'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Câu hỏi 3: Rồi sao? (Kể trọn vẹn câu chuyện)',
          akiInstruction: 'Hoàn thiện câu chuyện: Chú cáo vội vã đưa thư mật vượt rừng thông đến hang bác Gấu trước mùa đông!',
          quickPrompt: 'chú cáo lông đỏ ngậm phong thư phát sáng bí ẩn bước vội vã qua nền tuyết trắng trong rừng thông sớm để đưa thư cho bác gấu',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson1_story.jpg',
          akiFeedback: '🎉 Tuyệt tác! Bức tranh đã thực sự biết nói và kể được một câu chuyện phiêu lưu vô cùng hấp dẫn! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['cáo lông đỏ ngậm thư', 'tuyết trắng', 'rừng thông mờ sương'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi tranh kể chuyện & nộp vào Balo',
          akiInstruction: 'Bé hãy ngắm kỹ bức tranh biết nói của mình và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson1_story.jpg',
          akiFeedback: 'Tác phẩm Bức Tranh Biết Nói đã hoàn thành xuất sắc! Bé nhận cúp và cất vào Balo nào! 🏆',
          lockedFeaturesAtStep: ['bức tranh biết nói', 'câu chuyện hoàn chỉnh'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-2-1-1', turn: 1, prompt: 'Chú cáo chạy trên tuyết', time: '10:00', toneBg: 'bg-sky-100', url: '/assets/aiki-islands/island2_lesson1_opt_a.jpg' },
      { id: 'img-2-1-2', turn: 2, prompt: 'Chú cáo ngậm phong thư phát sáng trên tuyết', time: '10:08', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island2_lesson1_story.jpg' },
      { id: 'img-2-1-3', turn: 3, prompt: 'Chú cáo lông đỏ ngậm phong thư phát sáng bí ẩn bước vội qua tuyết trong rừng thông sớm', time: '10:15', toneBg: 'bg-purple-100', url: '/assets/aiki-islands/island2_lesson1_story.jpg' },
    ],
    verificationQuestion: {
      question: 'Bức tranh này đã có đủ 3 dấu hiệu biết nói (Đang làm gì, có gì lạ, gợi mở diễn biến) chưa?',
      criteria: ['Hành động của nhân vật rõ ràng', 'Có chi tiết lạ gây tò mò', 'Gợi mở câu chuyện tiếp diễn'],
    },
    illustrationType: 'storytelling',
  },

  'bai-2-2': {
    lessonId: 'bai-2-2-ai-la-ngoi-sao',
    subjectName: 'Thuyền Buồm Ánh Dương Ngôi Sao 1/3',
    badge: 'Bài 2.2',
    missionChecklist: [
      { id: '1', label: 'Tạo Lớp 1: Tiền cảnh sóng biển ngọc bích', done: true },
      { id: '2', label: 'Đặt Lớp 2: Ngôi sao thuyền buồm tại vị trí 1/3', done: true },
      { id: '3', label: 'Hoàn thiện Lớp 3: Hậu cảnh mây hồng bình minh', inProgress: true },
      { id: '4', label: 'Soi bố cục 3 lớp hài hòa nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Bố cục 3 lớp không gian', desc: 'Tiền cảnh (sát mắt) · Ở giữa (ngôi sao) · Phía sau (hậu cảnh)' },
        { title: 'Điểm vàng một phần ba', desc: 'Đặt nhân vật chính lệch 1/3 để tranh thoáng đãng' },
      ],
      locked: [
        { title: 'Ánh sáng cảm xúc — cất cho bài 2.3', desc: 'Bài 2.3 sẽ học điều khiển ánh sáng' },
      ],
    },
    lockedFeatures: ['tiền cảnh sóng biển ngọc bích tung bọt trắng', 'ở giữa thuyền buồm cánh vàng thêu mặt trời lệch 1/3', 'phía sau chân trời bình minh mây hồng'],
    pinnedTags: ['bố cục 3 lớp', 'ngôi sao 1/3', 'thuyền buồm ánh dương'],
    quickSuggestions: [
      'thuyền buồm cánh vàng ở vị trí 1/3 bên phải',
      'tiền cảnh sóng biển ngọc bích tung bọt trắng xóa',
      'phía sau bầu trời bình minh rực rỡ mây hồng tím',
    ],
    akiMotto: 'Ai là ngôi sao thì đặt vào điểm vàng 1/3, xếp bố cục 3 lớp tiền cảnh - ở giữa - phía sau nhé!',
    initialAkiMessage:
      'Chào Hoạ Sĩ Bố Cục! Đừng nhét mọi thứ vào giữa nhé! Hãy xếp tranh thành 3 lớp và đặt ngôi sao vào vị trí một phần ba nào!',
    initialPrompt: 'Thuyền buồm cánh vàng thêu mặt trời ở vị trí 1/3 khung hình lướt trên sóng biển ngọc bích tiền cảnh tung bọt trắng',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Lớp 1: Tạo tiền cảnh sát mắt người xem',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy tạo Lớp 1 Tiền cảnh: "sóng biển ngọc bích tung bọt trắng xóa ở tiền cảnh" nhé!',
          quickPrompt: 'sóng biển ngọc bích tung bọt trắng xóa ở tiền cảnh khung hình',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson2_opt_a.jpg',
          akiFeedback: 'Tuyệt vời! Tiền cảnh cuộn sóng rất có chiều sâu! Sang Bước 2: Đặt ngôi sao chính ở lớp giữa nhé!',
          lockedFeaturesAtStep: ['tiền cảnh sóng biển'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Lớp 2: Đặt ngôi sao chính lệch ở vị trí 1/3',
          akiInstruction: 'Bé hãy thêm thuyền buồm cánh vàng ở vị trí 1/3 khung hình: "thuyền buồm cánh vàng thêu mặt trời ở vị trí một phần ba lướt trên sóng"!',
          quickPrompt: 'thuyền buồm cánh vàng thêu mặt trời ở vị trí 1/3 khung hình lướt trên sóng ngọc bích',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson2_star.jpg',
          akiFeedback: 'Oa! Đặt ở vị trí 1/3 nhìn chuyên nghiệp và hút mắt hơn hẳn chính giữa! Sang Bước 3: Thêm lớp phía sau nhé!',
          lockedFeaturesAtStep: ['thuyền buồm ngôi sao 1/3', 'sóng ngọc bích'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Lớp 3: Thêm hậu cảnh chân trời bình minh mây hồng',
          akiInstruction: 'Hoàn thiện 3 lớp: "tiền cảnh sóng ngọc bích, ở giữa thuyền buồm cánh vàng tại vị trí 1/3, phía sau chân trời bình minh mây hồng tím xa xăm"!',
          quickPrompt: 'tiền cảnh sóng biển ngọc bích tung bọt trắng, ở giữa thuyền buồm cánh vàng ở vị trí 1/3, phía sau bầu trời bình minh mây hồng tím',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson2_star.jpg',
          akiFeedback: '🎉 Hoàn hảo! Bố cục 3 lớp với chiều sâu không gian kỳ ảo, ngôi sao thuyền buồm nổi bật rực rỡ! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['tiền cảnh sóng', 'ở giữa thuyền buồm 1/3', 'phía sau chân trời mây hồng'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi bố cục 3 lớp & nộp vào Balo',
          akiInstruction: 'Bé hãy soi lại 3 lớp không gian xem đã cân đối chưa và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson2_star.jpg',
          akiFeedback: 'Bức tranh bố cục 3 lớp ngôi sao đã đạt chuẩn Hoạ Sĩ AI! Bé cất an toàn vào Balo nào! 🏆',
          lockedFeaturesAtStep: ['bố cục 3 lớp', 'ngôi sao 1/3'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-2-2-1', turn: 1, prompt: 'Sóng biển tiền cảnh tung bọt trắng', time: '10:30', toneBg: 'bg-sky-100', url: '/assets/aiki-islands/island2_lesson2_opt_a.jpg' },
      { id: 'img-2-2-2', turn: 2, prompt: 'Thuyền buồm ở vị trí 1/3 trên sóng biển', time: '10:38', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island2_lesson2_star.jpg' },
      { id: 'img-2-2-3', turn: 3, prompt: 'Bố cục 3 lớp: tiền cảnh sóng bọt trắng, thuyền buồm ở 1/3, chân trời bình minh mây hồng', time: '10:45', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island2_lesson2_star.jpg' },
    ],
    verificationQuestion: {
      question: 'Bức tranh này đã có đủ 3 lớp (tiền cảnh, ngôi sao 1/3 ở giữa, hậu cảnh phía sau) chưa?',
      criteria: ['Tiền cảnh rõ nét sát mắt', 'Ngôi sao đặt ở vị trí lệch 1/3', 'Hậu cảnh mờ nhẹ tạo chiều sâu'],
    },
    illustrationType: 'layer-composition',
  },

  'bai-2-3': {
    lessonId: 'bai-2-3-cam-xuc-cua-sac-mau',
    subjectName: 'Ngọn Hải Đăng Đêm Giông Tương Phản',
    badge: 'Bài 2.3',
    missionChecklist: [
      { id: '1', label: 'Chọn cảm xúc kịch tính & quả cảm', done: true },
      { id: '2', label: 'Thử tông ánh sáng đêm bão giông tím thẫm', done: true },
      { id: '3', label: 'Thổi bùng luồng sáng tương phản mạnh mẽ', inProgress: true },
      { id: '4', label: 'Soi tranh cảm xúc tương phản nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: '4 Tông ánh sáng cốt lõi', desc: 'Bình minh vàng ấm · Hoàng hôn cam tím · Đêm xanh trăng · Đèn nến tương phản' },
        { title: 'Chọn cảm xúc trước, chọn ánh sáng sau', desc: 'Ánh sáng là đòn bẩy thổi bùng cảm xúc' },
      ],
      locked: [
        { title: 'Đóng khung tranh A3 — cất cho bài 2.4', desc: 'Bài 2.4 sẽ hoàn thiện tác phẩm' },
      ],
    },
    lockedFeatures: ['ngọn hải đăng sọc đỏ trắng sừng sững', 'luồng sáng vàng rực rỡ xuyên qua màn đêm', 'bầu trời đêm bão giông tím thẫm sóng dữ'],
    pinnedTags: ['ánh sáng cảm xúc', 'ngọn hải đăng đêm giông', 'tương phản ánh sáng'],
    quickSuggestions: [
      'ngọn hải đăng sọc đỏ trắng sừng sững trên vách đá',
      'chiếu luồng sáng vàng rực rỡ xuyên qua đêm bão giông',
      'bầu trời đêm tím thẫm và những đợt sóng biển dữ dội',
    ],
    akiMotto: 'Chọn cảm xúc trước -> Chọn ánh sáng sau! 4 tông ánh sáng: Bình minh vàng, Hoàng hôn cam tím, Đêm xanh trăng, Đèn nến tương phản.',
    initialAkiMessage:
      'Chào Hoạ Sĩ Ánh Sáng! Nhớ nhé: Chọn cảm xúc trước, rồi mới chọn ánh sáng! Hôm nay cùng thắp sáng ngọn hải đăng quả cảm trong đêm giông nào!',
    initialPrompt: 'Ngọn hải đăng sọc đỏ trắng chiếu luồng sáng vàng rực rỡ xuyên qua đêm bão giông tím thẫm và sóng cuộn trên vách đá',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Chọn cảm xúc kịch tính & chủ thể ngọn hải đăng',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy chọn cảm xúc hồi hộp quả cảm cho ngọn hải đăng sọc đỏ trắng trên vách đá nhé!',
          quickPrompt: 'ngọn hải đăng sọc đỏ trắng đứng trên vách đá sừng sững',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson3_opt_a.jpg',
          akiFeedback: 'Tốt lắm! Ngọn hải đăng sừng sững rồi! Giờ hãy chọn ánh sáng để tạo cảm xúc kịch tính. Sang Bước 2 nhé!',
          lockedFeaturesAtStep: ['ngọn hải đăng trên vách đá'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Chọn tông ánh sáng đêm bão giông tím thẫm',
          akiInstruction: 'Bé hãy thêm bối cảnh đêm giông: "bầu trời đêm bão giông tím thẫm, sóng biển cuộn trào tung bọt"!',
          quickPrompt: 'ngọn hải đăng đứng trên vách đá trong đêm bão giông tím thẫm sóng biển cuộn trào',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson3_colors.jpg',
          akiFeedback: 'Cảm xúc hồi hộp dâng trào rồi nè! Sang Bước 3: Thắp sáng luồng đèn vàng tương phản để tạo điểm nhấn quả cảm nhé!',
          lockedFeaturesAtStep: ['ngọn hải đăng', 'đêm bão giông tím thẫm'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Thổi bùng luồng sáng tương phản rực rỡ',
          akiInstruction: 'Bước quyết định: "ngọn hải đăng chiếu luồng sáng vàng rực rỡ xuyên qua màn đêm bão giông tím thẫm, độ tương phản ánh sáng mạnh mẽ"!',
          quickPrompt: 'ngọn hải đăng sọc đỏ trắng chiếu luồng sáng vàng rực rỡ xuyên qua đêm bão giông tím thẫm và sóng cuộn trên vách đá',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson3_colors.jpg',
          akiFeedback: '🎉 Quá đỉnh cao! Luồng sáng vàng rực cắt ngang màn đêm tím thẫm tạo nên độ tương phản cảm xúc nghẹt thở và hào hùng! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['luồng sáng vàng rực', 'đêm tím thẫm', 'sóng cuộn vách đá'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi tranh cảm xúc & nộp vào Balo',
          akiInstruction: 'Bé hãy ngắm kỹ bức tranh cảm xúc ánh sáng của mình và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson3_colors.jpg',
          akiFeedback: 'Tác phẩm Cảm Xúc Sắc Màu đã hoàn thành rực rỡ! Bé nhận cúp và cất vào Balo nào! 🏆',
          lockedFeaturesAtStep: ['cảm xúc ánh sáng', 'độ tương phản cao'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-2-3-1', turn: 1, prompt: 'Ngọn hải đăng trên vách đá ban ngày', time: '11:00', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island2_lesson3_opt_a.jpg' },
      { id: 'img-2-3-2', turn: 2, prompt: 'Ngọn hải đăng trong đêm bão giông tím thẫm', time: '11:08', toneBg: 'bg-purple-100', url: '/assets/aiki-islands/island2_lesson3_colors.jpg' },
      { id: 'img-2-3-3', turn: 3, prompt: 'Ngọn hải đăng chiếu luồng sáng vàng xuyên qua đêm bão giông tím thẫm và sóng cuộn', time: '11:15', toneBg: 'bg-indigo-100', url: '/assets/aiki-islands/island2_lesson3_colors.jpg' },
    ],
    verificationQuestion: {
      question: 'Bức tranh này đã có độ tương phản mạnh mẽ giữa luồng sáng vàng và đêm tím bão giông chưa?',
      criteria: ['Luồng sáng vàng rực rỡ nổi bật', 'Bầu trời đêm tím thẫm bão bùng', 'Cảm xúc kịch tính quả cảm rõ rệt'],
    },
    illustrationType: 'color-emotions',
  },

  'bai-2-4': {
    lessonId: 'bai-2-4-manh-ghep-hoan-hao',
    subjectName: 'Khung Tranh A3 Gia Đình Thú Hoàn Hảo',
    badge: 'Bài 2.4',
    missionChecklist: [
      { id: '1', label: 'Ghép Mảnh 1 (Chuyện gì) & Mảnh 2 (Ngôi sao)', done: true },
      { id: '2', label: 'Ghép Mảnh 3 (Ánh sáng) & Mảnh 4 (Góc toàn cảnh)', done: true },
      { id: '3', label: 'Đặt tên tranh gợi mở cảm xúc', inProgress: true },
      { id: '4', label: 'Trả lời 3 câu chấm điểm & xuất khung A3 nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: '4 Mảnh ghép hoàn hảo', desc: 'Chuyện gì · Ai là ngôi sao · Cảm xúc & ánh sáng · Góc toàn cảnh' },
        { title: 'Kỹ năng đặt tên tranh gợi cảm xúc', desc: 'Tên tranh là linh hồn đưa tác phẩm vào triển lãm' },
      ],
      locked: [
        { title: 'Hồ sơ ADN nhân vật — cất cho Đảo 3', desc: 'Đảo 3 sẽ sáng tạo Biệt đội nhân vật AI' },
      ],
    },
    lockedFeatures: ['bàn tiệc sinh nhật bánh kem 3 tầng rực rỡ', 'gia đình gấu và thỏ đội mũ chóp nhọn vui vẻ', 'khung tranh triển lãm A3 toàn cảnh có tên tác phẩm'],
    pinnedTags: ['4 mảnh ghép hoàn hảo', 'khung tranh A3', 'đặt tên tranh'],
    quickSuggestions: [
      'góc rộng A3 toàn cảnh gia đình gấu thỏ đội mũ chóp',
      'quây quần quanh bàn tiệc bánh kem 3 tầng lung linh ánh nến',
      'khung tranh gỗ mạ vàng trang trọng đề tên tác phẩm',
    ],
    akiMotto: 'Ghép đủ 4 mảnh ghép: Chuyện gì, Ngôi sao, Cảm xúc, Góc nhìn và đặt tên tranh thật kêu trước khi xuất bản A3!',
    initialAkiMessage:
      'Chào Nghệ Sĩ Triển Lãm! Hôm nay là ngày xuất xưởng kiệt tác A3! Hãy ghép đủ 4 mảnh ghép và đặt một cái tên thật ý nghĩa cho tác phẩm nhé!',
    initialPrompt: 'Khung tranh A3 toàn cảnh gia đình gấu và thỏ đội mũ chóp quây quần bên bàn tiệc bánh kem 3 tầng ấm áp dưới ánh nến',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Ghép Mảnh 1 & Mảnh 2 (Chuyện gì & Ngôi sao)',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy ghép chuyện gia đình thú mừng sinh nhật với ngôi sao bánh kem 3 tầng ở giữa nhé!',
          quickPrompt: 'gia đình gấu và thỏ mừng sinh nhật quanh bánh kem 3 tầng ở giữa',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson4_opt_a.jpg',
          akiFeedback: 'Rất ấm cúng! Ngôi sao bánh kem 3 tầng đã tỏa sáng! Sang Bước 2: Ghép tiếp Ánh sáng nến và Góc toàn cảnh A3 nhé!',
          lockedFeaturesAtStep: ['gia đình thú sinh nhật', 'bánh kem 3 tầng'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Ghép Mảnh 3 & Mảnh 4 (Ánh sáng nến & Góc rộng A3)',
          akiInstruction: 'Bé hãy thêm ánh nến ấm áp và góc toàn cảnh: "góc rộng toàn cảnh A3, ánh nến lung linh ấm áp trên nền rừng thông pastel"!',
          quickPrompt: 'góc rộng A3 toàn cảnh gia đình gấu thỏ đội mũ chóp quanh bánh kem 3 tầng lung linh ánh nến ấm áp',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson4_masterpiece.jpg',
          akiFeedback: 'Tuyệt đẹp! Không ai bị lọt ra ngoài mép khung hình! Sang Bước 3: Đặt một cái tên thật kêu cho kiệt tác nhé!',
          lockedFeaturesAtStep: ['góc toàn cảnh A3', 'ánh nến ấm áp'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Đặt tên tranh gợi cảm xúc & lồng khung A3',
          akiInstruction: 'Đừng đặt tên là "Gia đình thú", hãy đặt một cái tên gợi mở: "Bữa Tiệc Ấm Áp Dưới Rừng Thông" đóng trong khung tranh gỗ A3!',
          quickPrompt: 'Bức tranh Bữa Tiệc Ấm Áp Dưới Rừng Thông: toàn cảnh gia đình thú đội mũ chóp quanh bánh kem lung linh trong khung tranh triển lãm A3',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson4_masterpiece.jpg',
          akiFeedback: '🎉 Kiệt tác triển lãm hoàn hảo! Tên tranh đầy cảm xúc, hình ảnh tròn vẹn 4 mảnh ghép! Bé hãy trả lời 3 câu hỏi chấm điểm và xuất khung tranh A3 nộp bài nhé!',
          lockedFeaturesAtStep: ['khung tranh A3', 'tên tranh Bữa Tiệc Ấm Áp', 'đủ 4 mảnh ghép'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi tranh A3 & nộp vào Balo',
          akiInstruction: 'Bé hãy ngắm nhìn tác phẩm triển lãm A3 của mình và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island2_lesson4_masterpiece.jpg',
          akiFeedback: 'Chúc mừng Tân Hoạ Sĩ AI đã hoàn thành tác phẩm Đảo 2 xuất sắc! Cúp Vàng danh dự thuộc về bé! 🏆',
          lockedFeaturesAtStep: ['khung tranh A3', 'kiệt tác hoàn chỉnh'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-2-4-1', turn: 1, prompt: 'Gia đình thú quanh bánh kem sinh nhật', time: '11:30', toneBg: 'bg-rose-100', url: '/assets/aiki-islands/island2_lesson4_opt_a.jpg' },
      { id: 'img-2-4-2', turn: 2, prompt: 'Toàn cảnh góc rộng gia đình thú mừng sinh nhật ấm áp dưới ánh nến', time: '11:38', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island2_lesson4_masterpiece.jpg' },
      { id: 'img-2-4-3', turn: 3, prompt: 'Khung tranh A3 toàn cảnh Bữa Tiệc Ấm Áp Dưới Rừng Thông rực rỡ ánh nến', time: '11:45', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island2_lesson4_masterpiece.jpg' },
    ],
    verificationQuestion: {
      question: 'Tác phẩm này đã ghép đủ 4 mảnh và có tên tranh ý nghĩa chưa?',
      criteria: ['Đủ 4 mảnh ghép hoàn hảo', 'Góc toàn cảnh rộng khổ A3', 'Có tên tranh gợi cảm xúc sâu sắc'],
    },
    illustrationType: 'gallery-frame',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ĐẢO 3: BIỆT ĐỘI NHÂN VẬT AI (3.1 -> 3.4)
  // ──────────────────────────────────────────────────────────────────────────
  'bai-3-1': {
    lessonId: 'bai-3-1-ho-so-biet-doi',
    subjectName: 'Hồ Sơ ADN Hiệp Sĩ Cáo Lửa',
    badge: 'Bài 3.1',
    missionChecklist: [
      { id: '1', label: 'Điền 3 ô đầu hồ sơ (Tên, Thích, Sợ)', done: true },
      { id: '2', label: 'Điền 3 ô sau hồ sơ (Giỏi, Dở, Ước mơ)', done: true },
      { id: '3', label: 'Phác thảo chân dung từ hồ sơ ADN', inProgress: true },
      { id: '4', label: 'Soi chân dung khớp tính cách nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Bảng ADN 6 ô nhân vật', desc: 'Tên · Thích gì · Sợ gì · Giỏi gì · Dở gì · Ước mơ gì' },
        { title: 'Nhân vật có tính cách và chiều sâu', desc: 'Không hoàn hảo nhưng đáng yêu và sống động' },
      ],
      locked: [
        { title: 'Mật mã 3 điểm khóa — cất cho bài 3.2', desc: 'Bài 3.2 sẽ khóa ngoại hình bất biến' },
      ],
    },
    lockedFeatures: ['Hiệp Sĩ Cáo Lửa Red lông đỏ cam rực rỡ', 'áo choàng xanh thẫm viền vàng thêu sao', 'thanh kiếm gỗ đeo bên hông'],
    pinnedTags: ['hồ sơ ADN', 'hiệp sĩ cáo lửa', 'tính cách nhân vật'],
    quickSuggestions: [
      'Hiệp Sĩ Cáo Lửa Red lông cam đỏ, áo choàng xanh thẫm',
      'thanh kiếm gỗ bên hông, vẻ mặt quả cảm pha chút hậu đậu',
      'chân dung phong cách soft clay hoạt hình 3D sống động',
    ],
    akiMotto: 'Bảng ADN 6 ô là bảo bối giúp nhân vật đi qua 100 bức tranh vẫn là chính mình!',
    initialAkiMessage:
      'Chào Nhà Sáng Tạo Nhân Vật! Đừng vội vẽ ngay! Hãy cùng điền đủ 6 ô Hồ sơ ADN để nhân vật của cậu có linh hồn và tính cách riêng nhé!',
    initialPrompt: 'Chân dung Hiệp Sĩ Cáo Lửa Red lông đỏ cam, áo choàng xanh thẫm viền vàng, thanh kiếm gỗ bên hông, phong cách soft clay',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Điền 3 ô đầu hồ sơ ADN (Tên, Thích, Sợ)',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy xác định: Tên (Red Cáo Lửa), Thích (nhặt quả thông), Sợ (tiếng sấm) nhé!',
          quickPrompt: 'chân dung chú cáo nhỏ lông đỏ cam tên Red',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson1_opt_a.jpg',
          akiFeedback: 'Tốt lắm! Đã có bạn Cáo Red rồi! Sang Bước 2: Điền tiếp 3 ô Giỏi, Dở và Ước mơ nhé!',
          lockedFeaturesAtStep: ['tên Red', 'cáo lông cam đỏ'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Điền 3 ô sau hồ sơ ADN (Giỏi, Dở, Ước mơ)',
          akiInstruction: 'Thêm tính cách: Giỏi leo trèo, dở buộc dây giày, ước mơ làm hộ vệ rừng xanh với thanh kiếm gỗ bên hông!',
          quickPrompt: 'chú cáo Red đeo thanh kiếm gỗ bên hông, vẻ mặt dũng cảm pha chút hậu đậu đáng yêu',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson1_profile.jpg',
          akiFeedback: 'Oa! Nhân vật có chiều sâu và cá tính rõ rệt rồi! Sang Bước 3: Hoàn thiện chân dung hiệp sĩ nào!',
          lockedFeaturesAtStep: ['thanh kiếm gỗ', 'tính cách dũng cảm hậu đậu'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Phác thảo chân dung hoàn chỉnh từ hồ sơ ADN',
          akiInstruction: 'Hoàn thiện chân dung: "Chân dung Hiệp Sĩ Cáo Lửa Red lông đỏ cam, áo choàng xanh thẫm viền vàng, thanh kiếm gỗ bên hông, phong cách soft clay"!',
          quickPrompt: 'Chân dung Hiệp Sĩ Cáo Lửa Red lông đỏ cam, áo choàng xanh thẫm viền vàng, thanh kiếm gỗ bên hông, phong cách soft clay',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson1_profile.jpg',
          akiFeedback: '🎉 Quá xuất sắc! Hiệp Sĩ Cáo Lửa Red hiện lên vô cùng sống động, vừa dũng cảm vừa dễ thương! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['lông đỏ cam', 'áo choàng xanh viền vàng', 'kiếm gỗ bên hông'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi chân dung hồ sơ & nộp vào Balo',
          akiInstruction: 'Bé hãy soi kỹ chân dung xem đã đúng chất tính cách trong hồ sơ chưa và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson1_profile.jpg',
          akiFeedback: 'Hồ sơ ADN nhân vật đã được phê duyệt chính thức! Cất an toàn vào Balo nào! 🏆',
          lockedFeaturesAtStep: ['hồ sơ ADN', 'chân dung hoàn chỉnh'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-3-1-1', turn: 1, prompt: 'Chú cáo lông đỏ cam', time: '14:00', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island3_lesson1_opt_a.jpg' },
      { id: 'img-3-1-2', turn: 2, prompt: 'Hiệp sĩ Cáo Lửa Red áo choàng xanh thẫm thanh kiếm gỗ', time: '14:10', toneBg: 'bg-orange-100', url: '/assets/aiki-islands/island3_lesson1_profile.jpg' },
    ],
    verificationQuestion: {
      question: 'Nhân vật này đã thể hiện được tính cách trong hồ sơ ADN 6 ô chưa?',
      criteria: ['Có tên gọi và ngoại hình đặc trưng', 'Có điểm mạnh và điểm yếu thú vị', 'Thể hiện được ước mơ của nhân vật'],
    },
    illustrationType: 'profile-dna',
  },

  'bai-3-2': {
    lessonId: 'bai-3-2-mat-ma-nhan-dien',
    subjectName: 'Sóc Bông',
    badge: 'Bài 3.2',
    missionChecklist: [
      { id: '1', label: 'Chọn ảnh mẫu chuẩn', done: true },
      { id: '2', label: 'Viết ba đặc điểm nhận diện', done: true },
      { id: '3', label: 'Bắt AIKI vẽ rồi soi thật kỹ', inProgress: true },
      { id: '4', label: 'Chọn bức ưng nhất rồi nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Vẽ chân dung Sóc Bông', desc: 'Giữ nguyên 3 đặc điểm nhận diện mật mã' },
        { title: 'Đổi tư thế, đổi bối cảnh nhẹ', desc: 'Cho Sóc Bông hoạt động vui tươi trong rừng' },
      ],
      locked: [
        { title: 'Vẽ biểu cảm — cất cho bài 3.3', desc: 'Bài sau sẽ vẽ 6 biểu cảm khác nhau' },
        { title: 'Đổi bối cảnh lớn — cất cho bài 3.4', desc: 'Bài 3.4 sẽ khám phá căn cứ bí mật' },
        { title: 'Tạo bạn mới — hôm nay chỉ một bạn thôi', desc: 'Tập trung luyện giữ tính nhất quán' },
      ],
    },
    lockedFeatures: ['mũ len đỏ quả bông trắng', 'đuôi to xù màu cam', 'túi vải nâu đeo chéo'],
    pinnedTags: ['mũ len đỏ quả bông trắng', 'đuôi to xù màu cam', 'túi vải nâu đeo chéo'],
    quickSuggestions: [
      'trong rừng thông ngập nắng',
      'đang đứng vẫy tay tươi cười',
      'đang ôm một quả thông to bên gốc cây',
    ],
    akiMotto: 'Tả càng rõ càng đỡ tốn lượt. "Đang ôm quả thông to" nghe ngon lành hơn "đang chơi" nhiều đấy!',
    initialAkiMessage:
      'Chào các cậu! Ba đặc điểm vừa khoá, tớ dán sẵn vào mọi lệnh vẽ rồi — khỏi lo tớ quên: Giờ các cậu chỉ việc kể bạn ấy đang làm gì, ở đâu là tớ vẽ liền!',
    initialPrompt: 'Sóc Bông đứng trên hàng rào gỗ, nắng chiều',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Thử câu lệnh ban đầu (1-2 từ)',
          akiInstruction: 'Chào bé! Đầu tiên hãy thử ra lệnh ngắn 1-2 từ "Sóc Bông" xem tớ vẽ thế nào nhé!',
          quickPrompt: 'Sóc Bông',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson2_opt_a.jpg',
          akiFeedback: 'Úi chà! Bé thấy không? Tớ vẽ ra một con sóc lạ hoắc, vì câu lệnh thiếu chi tiết nên tớ phải đoán bừa đấy! 😅 Sang Bước 2: Giờ bé hãy thêm hình dáng và màu sắc vào nhé!',
          lockedFeaturesAtStep: ['Sóc Bông'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Thêm hình dáng & màu sắc',
          akiInstruction: 'Bây giờ hãy dán ba đặc điểm mật mã: mũ len đỏ quả bông trắng, đuôi to xù cam, túi vải nâu nhé!',
          quickPrompt: 'Sóc Bông mũ len đỏ quả bông trắng, đuôi to xù cam, túi vải nâu đeo chéo',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson2_opt_b.jpg',
          akiFeedback: 'Oa! Bé giỏi quá! Chuẩn chỉnh 3 đặc điểm mật mã rồi! Giờ sang Bước 3: Cho Sóc Bông đổi tư thế và thêm bối cảnh thật chi tiết nhé!',
          lockedFeaturesAtStep: ['mũ len đỏ quả bông trắng', 'đuôi to xù màu cam', 'túi vải nâu đeo chéo'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Hoàn thiện câu lệnh 5 chi tiết vàng',
          akiInstruction: 'Tuyệt vời! Hãy thêm bối cảnh rừng thông ngập nắng đang ôm quả thông to nhé!',
          quickPrompt: 'Sóc Bông đang ôm quả thông to trong rừng thông ngập nắng',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson2_code3.jpg',
          akiFeedback: '🎉 XUẤT SẮC! Ba đặc điểm tớ giữ nguyên si, không sót cái nào! Đủ các chi tiết vàng rồi! Bé hãy soi kỹ tranh và bấm nút Nộp Bài & Cất Vào Balo nhé!',
          lockedFeaturesAtStep: ['mũ len đỏ quả bông trắng', 'đuôi to xù màu cam', 'túi vải nâu đeo chéo'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi kỹ tranh & nộp vào Balo',
          akiInstruction: 'Soi hộ tớ cái: bức này đủ ba đặc điểm chưa các cậu? Nếu đủ rồi thì nộp bài vào Balo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson2_code3.jpg',
          akiFeedback: 'Hoan hô! Bức này chuẩn chỉnh mật mã đặc điểm rồi! Cậu hãy nộp bài nhận cúp nhé! ✨',
          lockedFeaturesAtStep: ['mũ len đỏ quả bông trắng', 'đuôi to xù màu cam', 'túi vải nâu đeo chéo'],
        },
      ],
    },
    preloadedImages: [
      {
        id: 'img-3-2-1',
        turn: 1,
        prompt: 'Sóc Bông ngồi bên gốc cây sồi cổ thụ, chào buổi sớm',
        time: '08:29',
        toneBg: 'bg-amber-100',
        url: '/assets/aiki-islands/island3_lesson2_opt_a.jpg',
      },
      {
        id: 'img-3-2-2',
        turn: 2,
        prompt: 'Sóc Bông chạy nhảy trên thảm cỏ xanh mướt',
        time: '08:36',
        toneBg: 'bg-purple-100',
        url: '/assets/aiki-islands/island3_lesson2_opt_b.jpg',
      },
      {
        id: 'img-3-2-3',
        turn: 3,
        prompt: 'Vẽ Sóc Bông đang ôm một quả thông to, ngồi trên gốc cây trong rừng buổi sáng',
        time: '08:42',
        toneBg: 'bg-pink-100',
        url: '/assets/aiki-islands/island3_lesson2_code3.jpg',
      },
    ],
    verificationQuestion: {
      question: 'Soi hộ tớ cái: bức này đủ ba đặc điểm chưa các cậu?',
      criteria: ['Mũ len đỏ quả bông trắng', 'Đuôi to xù màu cam', 'Túi vải nâu đeo chéo'],
    },
    illustrationType: 'soc-bong',
  },

  'bai-3-3': {
    lessonId: 'bai-3-3-bien-hoa-bieu-cam',
    subjectName: 'Lưới 6 Biểu Cảm Của Sóc Bông',
    badge: 'Bài 3.3',
    missionChecklist: [
      { id: '1', label: 'Tạo biểu cảm Vui sướng mắt long lanh', done: true },
      { id: '2', label: 'Tạo biểu cảm Sợ hãi hoặc Giận dữ', done: true },
      { id: '3', label: 'Hoàn thiện lưới 6 biểu cảm nhất quán', inProgress: true },
      { id: '4', label: 'Soi Bản Luật vẽ nhân vật nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Đổi mặt, không đổi người', desc: 'Biểu cảm thay đổi liên tục nhưng mật mã 3 điểm luôn giữ nguyên' },
        { title: 'Bộ 6 biểu cảm thần thái', desc: 'Vui · Buồn · Giận · Sợ · Ngạc nhiên · Buồn ngủ' },
      ],
      locked: [
        { title: 'Căn cứ bí mật hốc cây — cất cho bài 3.4', desc: 'Bài 3.4 sẽ thiết kế nơi ở riêng' },
      ],
    },
    lockedFeatures: ['mũ len đỏ quả bông trắng', 'đuôi to xù màu cam', 'túi vải nâu đeo chéo'],
    pinnedTags: ['đổi mặt không đổi người', '6 biểu cảm Sóc Bông', 'khóa 3 điểm nhận diện'],
    quickSuggestions: [
      'Sóc Bông nhảy cẫng lên vui sướng mắt sáng long lanh',
      'Sóc Bông sợ hãi tròn xoe mắt miệng há hốc',
      'giữ nguyên mũ len đỏ quả bông trắng, đuôi xù cam, túi nâu',
    ],
    akiMotto: 'Đổi mặt, không đổi người! Giữ nguyên mật mã 3 điểm khóa thì dù Sóc Bông vui, buồn, sợ, giận vẫn nhận ra ngay!',
    initialAkiMessage:
      'Chào bé! Hôm nay nhân vật của chúng mình sẽ đổi mặt liên tục, nhưng tuyệt đối không được đổi thành người khác nhaaa! Nhớ thần chú: Đổi mặt, không đổi người!',
    initialPrompt: 'Sóc Bông vui sướng nhảy cẫng lên ăn mừng, giữ nguyên mũ len đỏ quả bông trắng, đuôi to xù cam và túi vải nâu chéo',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Tạo biểu cảm 1: Vui sướng nhảy cẫng lên',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy tạo biểu cảm Vui sướng cho Sóc Bông và khóa chặt 3 điểm nhận diện nhé!',
          quickPrompt: 'Sóc Bông nhảy cẫng lên vui sướng mắt sáng long lanh, mũ len đỏ quả bông trắng, đuôi to xù cam, túi vải nâu chéo',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson3_expressions.jpg',
          akiFeedback: 'Tuyệt vời! Sóc Bông vui sướng toe toét mà vẫn giữ đúng mũ đỏ, đuôi xù và túi nâu! Sang Bước 2: Thử biểu cảm Sợ hãi nhé!',
          lockedFeaturesAtStep: ['biểu cảm vui sướng', 'mũ đỏ quả bông trắng', 'đuôi xù cam', 'túi vải nâu'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Tạo biểu cảm 2: Sợ hãi hoặc Giận dữ',
          akiInstruction: 'Bé hãy thử đổi mặt sang Sợ hãi: "Sóc Bông sợ hãi ôm đầu tròn xoe mắt, giữ nguyên mũ len đỏ quả bông trắng, đuôi to xù cam, túi vải nâu chéo"!',
          quickPrompt: 'Sóc Bông sợ hãi ôm đầu tròn xoe mắt, mũ len đỏ quả bông trắng, đuôi to xù cam, túi vải nâu chéo',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson3_opt_a.jpg',
          akiFeedback: 'Hay lắm! Nhìn cái biết ngay vẫn là Sóc Bông đang sợ hãi! Không hề bị biến thành chú sóc khác! Sang Bước 3: Hoàn thiện lưới 6 biểu cảm nhé!',
          lockedFeaturesAtStep: ['biểu cảm sợ hãi', 'mũ đỏ quả bông trắng', 'đuôi xù cam', 'túi vải nâu'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Hoàn thiện trọn bộ lưới 6 biểu cảm',
          akiInstruction: 'Hoàn thiện lưới 6 biểu cảm: Vui, Buồn, Giận, Sợ, Ngạc nhiên, Buồn ngủ với 100% đồng nhất nhận diện!',
          quickPrompt: 'Bộ 6 biểu cảm của Sóc Bông: vui, buồn, giận, sợ, ngạc nhiên, buồn ngủ, giữ nguyên mũ len đỏ quả bông trắng, đuôi to xù cam, túi vải nâu chéo',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson3_expressions.jpg',
          akiFeedback: '🎉 Xuất sắc phi thường! 6 biểu cảm sống động mà nhìn vào nhận ra ngay Sóc Bông thân yêu! Đổi mặt không đổi người thành công 100%! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['lưới 6 biểu cảm', 'mũ đỏ quả bông trắng', 'đuôi to xù cam', 'túi vải nâu chéo'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi Bản Luật vẽ & nộp vào Balo',
          akiInstruction: 'Bé hãy soi lại từng hình theo Bản Luật vẽ nhân vật xem có bị trôi điểm nào không rồi bấm Nộp Bài nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson3_expressions.jpg',
          akiFeedback: 'Trọn bộ 6 biểu cảm của Sóc Bông đã được cấp chứng nhận Nhất Quán Tuyệt Đối! Cất vào Balo nào! 🏆',
          lockedFeaturesAtStep: ['lưới 6 biểu cảm', 'nhất quán nhân vật'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-3-3-1', turn: 1, prompt: 'Sóc Bông vui sướng nhảy cẫng lên mũ đỏ đuôi xù túi nâu', time: '14:30', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island3_lesson3_expressions.jpg' },
      { id: 'img-3-3-2', turn: 2, prompt: 'Sóc Bông sợ hãi tròn xoe mắt ôm đầu mũ đỏ đuôi xù túi nâu', time: '14:38', toneBg: 'bg-rose-100', url: '/assets/aiki-islands/island3_lesson3_opt_a.jpg' },
      { id: 'img-3-3-3', turn: 3, prompt: 'Bộ 6 biểu cảm của Sóc Bông nhất quán 3 điểm khóa', time: '14:45', toneBg: 'bg-purple-100', url: '/assets/aiki-islands/island3_lesson3_expressions.jpg' },
    ],
    verificationQuestion: {
      question: 'Cả 6 biểu cảm đều giữ đúng 3 điểm nhận diện (Mũ len đỏ bông trắng, đuôi to xù cam, túi vải nâu) chưa?',
      criteria: ['Biểu cảm phong phú chân thực', 'Không bị trôi màu sắc trang phục', 'Giữ nguyên 3 điểm khóa nhận diện'],
    },
    illustrationType: 'six-expressions',
  },

  'bai-3-4': {
    lessonId: 'bai-3-4-can-cu-bi-mat-cua-biet-doi',
    subjectName: 'Căn Cứ Hốc Cây Của Sóc Bông',
    badge: 'Bài 3.4',
    missionChecklist: [
      { id: '1', label: 'Tạo góc sở thích kệ gỗ xếp hạt dẻ', done: true },
      { id: '2', label: 'Tạo góc bản đồ rừng & đèn đom đóm', done: true },
      { id: '3', label: 'Đặt Sóc Bông vào căn cứ hốc cây ấm cúng', inProgress: true },
      { id: '4', label: 'Ghép Thẻ nhân vật 2 mặt nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Căn cứ kể được tính cách', desc: 'Nơi ở phản ánh sở thích, thói quen và nỗi sợ của nhân vật' },
        { title: 'Câu lệnh hai tầng', desc: 'Nhân vật đã khóa + Bối cảnh căn cứ kể chuyện' },
      ],
      locked: [
        { title: 'Cốt truyện 3 Cổng — cất cho Đảo 4', desc: 'Đảo 4 sẽ bước vào Vương quốc truyện tranh' },
      ],
    },
    lockedFeatures: ['hốc cây sồi già ấm cúng có kệ hạt dẻ', 'tấm bản đồ rừng tự vẽ treo tường', 'đèn đom đóm vàng lung linh', 'Sóc Bông mũ len đỏ đuôi xù túi chéo'],
    pinnedTags: ['căn cứ hốc cây', 'Sóc Bông', 'nơi ở kể tính cách'],
    quickSuggestions: [
      'căn cứ hốc cây sồi ấm cúng có kệ hạt dẻ và bản đồ rừng',
      'Sóc Bông cầm kính lúp soi bản đồ dưới ánh đèn đom đóm',
      'giữ đúng mũ len đỏ quả bông trắng, đuôi to xù cam, túi nâu',
    ],
    akiMotto: 'Nơi ở phải kể được tính cách của nhân vật! Nhìn căn cứ là đoán ngay bạn ấy thích gì, sợ gì và mơ ước gì.',
    initialAkiMessage:
      'Chào bé! Hãy tạo một căn cứ bí mật mà vừa nhìn vào là biết: "À, đây đúng là chỗ của Sóc Bông!" nào!',
    initialPrompt: 'Sóc Bông cầm kính lúp soi bản đồ cổ trên bàn gỗ trong căn cứ hốc cây sồi ấm cúng có kệ hạt dẻ dưới ánh đèn đom đóm',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Tạo góc sở thích & thói quen trong hốc cây',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy tạo góc sở thích: Kệ gỗ xếp đầy hạt dẻ theo kích cỡ trong hốc cây sồi kín gió nhé!',
          quickPrompt: 'hốc cây sồi già ấm cúng có kệ gỗ xếp đầy hạt dẻ theo kích cỡ',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson4_opt_a.jpg',
          akiFeedback: 'Ấm áp quá! Đúng chất của một chú sóc mê hạt dẻ rồi! Sang Bước 2: Thêm bản đồ và đèn đom đóm nhé!',
          lockedFeaturesAtStep: ['hốc cây sồi', 'kệ gỗ hạt dẻ'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Tạo góc kỹ năng & bối cảnh ấm cúng',
          akiInstruction: 'Bé hãy thêm tấm bản đồ rừng tự vẽ treo tường và chiếc đèn đom đóm lung linh!',
          quickPrompt: 'hốc cây sồi ấm cúng có bản đồ rừng vẽ tay treo tường và đèn đom đóm vàng lung linh',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson4_lair.jpg',
          akiFeedback: 'Lung linh huyền ảo quá! Giờ căn cứ đã có đủ dấu vết tính cách! Sang Bước 3: Đặt Sóc Bông vào giữa căn cứ nào!',
          lockedFeaturesAtStep: ['bản đồ rừng tự vẽ', 'đèn đom đóm'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Đặt Sóc Bông vào căn cứ hoàn chỉnh',
          akiInstruction: 'Bước quyết định: "Sóc Bông mũ len đỏ đuôi xù túi nâu cầm kính lúp soi bản đồ cổ trong căn cứ hốc cây sồi ấm cúng có kệ hạt dẻ dưới đèn đom đóm"!',
          quickPrompt: 'Sóc Bông cầm kính lúp soi bản đồ cổ trên bàn gỗ trong căn cứ hốc cây sồi ấm cúng có kệ hạt dẻ dưới ánh đèn đom đóm, mũ len đỏ quả bông trắng, đuôi xù cam, túi nâu',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson4_lair.jpg',
          akiFeedback: '🎉 Đẹp tuyệt vời! Căn cứ không chỉ đẹp mà còn kể cho người xem biết Sóc Bông là ai, thích gì và sống thế nào! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['Sóc Bông 3 điểm khóa', 'căn cứ hốc cây', 'kệ hạt dẻ', 'đèn đom đóm'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Ghép Thẻ nhân vật 2 mặt & nộp vào Balo',
          akiInstruction: 'Bé hãy ghép tác phẩm căn cứ vào Thẻ nhân vật 2 mặt hoàn chỉnh và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island3_lesson4_lair.jpg',
          akiFeedback: 'Chúc mừng bé đã hoàn thành xuất sắc toàn bộ Đảo 3 Biệt Đội Nhân Vật AI! Sẵn sàng bước sang Đảo 4 làm truyện tranh nào! 🏆',
          lockedFeaturesAtStep: ['thẻ nhân vật 2 mặt', 'căn cứ hoàn chỉnh'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-3-4-1', turn: 1, prompt: 'Căn cứ hốc cây có kệ hạt dẻ', time: '15:00', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island3_lesson4_opt_a.jpg' },
      { id: 'img-3-4-2', turn: 2, prompt: 'Sóc Bông soi bản đồ trong căn cứ hốc cây sồi ấm cúng', time: '15:15', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island3_lesson4_lair.jpg' },
    ],
    verificationQuestion: {
      question: 'Căn cứ bí mật này đã kể được tính cách và sở thích của Sóc Bông chưa?',
      criteria: ['Có kệ hạt dẻ và bản đồ rừng quen thuộc', 'Ánh sáng đom đóm ấm áp đúng chất', 'Sóc Bông giữ nguyên 3 điểm khóa bất biến'],
    },
    illustrationType: 'tree-hollow-base',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ĐẢO 4: VƯƠNG QUỐC TRUYỆN TRANH AI (4.1 -> 4.5)
  // ──────────────────────────────────────────────────────────────────────────
  'bai-4-1': {
    lessonId: 'bai-4-1-3-cong-cua-vuong-quoc',
    subjectName: 'Cốt Truyện 3 Cổng Của Vương Quốc',
    badge: 'Bài 4.1',
    missionChecklist: [
      { id: '1', label: 'Cổng 1: Khởi đầu bình thường mang bóng ra sân', done: true },
      { id: '2', label: 'Cổng 2: Biến cố bóng kẹt khe hàng rào gai', done: true },
      { id: '3', label: 'Cổng 3: Dùng cành cây khều bóng giải quyết êm', inProgress: true },
      { id: '4', label: 'Soi bộ 3 khung truyện 3 cổng nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Cốt truyện 3 Cổng kinh điển', desc: 'Cổng 1 Bình thường -> Cổng 2 Có chuyện -> Cổng 3 Giải quyết' },
        { title: 'Bộ 3 khung truyện tranh nối tiếp', desc: 'Có khởi đầu, cao trào và kết thúc trọn vẹn' },
      ],
      locked: [
        { title: 'Khung xương 4 chặng — cất cho bài 4.2', desc: 'Bài 4.2 sẽ phát triển 4 chặng thử thách' },
      ],
    },
    lockedFeatures: ['bộ 3 khung truyện nối tiếp', 'Cổng 1 Khởi đầu bình thường', 'Cổng 2 Thắt nút sự cố', 'Cổng 3 Mở nút giải quyết'],
    pinnedTags: ['3 cổng cốt truyện', 'truyện tranh 3 khung', 'Sóc Bông tìm bóng'],
    quickSuggestions: [
      'Cổng 1: Sóc Bông ôm quả bóng yêu thích ra sân chơi',
      'Cổng 2: Quả bóng lăn kẹt vào hàng rào gai trời sắp mưa',
      'Cổng 3: Sóc Bông dùng cành cây khều bóng ra và vui vẻ ôm về',
    ],
    akiMotto: 'Mọi câu chuyện vĩ đại đều đi qua 3 cổng: Khởi đầu mở màn · Thắt nút cao trào · Mở nút thắng lợi!',
    initialAkiMessage:
      'Chào Tác Giả Truyện Tranh! Một câu chuyện hay bắt buộc phải có biến cố! Hãy cùng Sóc Bông bước qua 3 Cổng của Vương Quốc nào!',
    initialPrompt: 'Truyện tranh 3 khung về Sóc Bông tìm hạt dẻ vàng: ôm bóng ra sân, bóng kẹt hàng rào và dùng cành cây khều bóng vui vẻ',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Cổng 1: Khởi đầu mở màn bình thường',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy tạo Cổng 1: Sóc Bông ôm quả bóng yêu thích tung tăng ra sân chơi bình thường nhé!',
          quickPrompt: 'Khung 1: Sóc Bông ôm quả bóng yêu thích tung tăng ra sân chơi cỏ xanh nắng ấm',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson1_opt_a.jpg',
          akiFeedback: 'Rất bình yên! Nhưng nếu cứ thế này thì chuyện nhạt lắm! Sang Bước 2: Cho biến cố xảy ra ở Cổng 2 nào!',
          lockedFeaturesAtStep: ['Cổng 1 bình thường', 'Sóc Bông ôm bóng'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Cổng 2: Thắt nút biến cố kẹt bóng',
          akiInstruction: 'Bé hãy tạo Cổng 2: "Quả bóng bất ngờ lăn qua khe nhỏ kẹt vào hàng rào gai, trời bắt đầu nổi sấm giông"!',
          quickPrompt: 'Khung 2: Quả bóng lăn qua khe kẹt vào hàng rào gai, Sóc Bông lo lắng trời nổi sấm',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson1_3gates.jpg',
          akiFeedback: 'Hồi hộp quá! Sóc Bông sợ sấm mà bóng lại kẹt! Sang Bước 3: Xem bạn ấy giải quyết thế nào ở Cổng 3 nhé!',
          lockedFeaturesAtStep: ['Cổng 2 biến cố', 'bóng kẹt hàng rào'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Cổng 3: Mở nút giải quyết thông minh',
          akiInstruction: 'Hoàn thiện Cổng 3: "Sóc Bông thông minh tìm cành cây khô khéo léo khều bóng ra và tươi cười ôm bóng chạy về nhà"!',
          quickPrompt: 'Khung 3: Sóc Bông dùng cành cây khéo léo khều bóng ra và vui vẻ ôm bóng chạy về nhà',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson1_3gates.jpg',
          akiFeedback: '🎉 Hoan hô! Bộ 3 khung truyện đi qua đúng 3 Cổng: Bình thường -> Có chuyện -> Giải quyết! Cốt truyện mạch lạc và cuốn hút tuyệt đối! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['Cổng 3 giải quyết', 'bộ 3 khung truyện 3 cổng'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi truyện 3 cổng & nộp vào Balo',
          akiInstruction: 'Bé hãy soi kỹ lại diễn biến 3 cổng xem đã đủ mở bài, thân bài, kết bài chưa và bấm Nộp Bài nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson1_3gates.jpg',
          akiFeedback: 'Truyện tranh 3 Cổng đầu tiên đã hoàn thành xuất sắc! Cất an toàn vào Balo nào! 🏆',
          lockedFeaturesAtStep: ['cốt truyện 3 cổng', 'truyện tranh hoàn chỉnh'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-4-1-1', turn: 1, prompt: 'Sóc Bông ôm bóng ra sân chơi', time: '16:00', toneBg: 'bg-sky-100', url: '/assets/aiki-islands/island4_lesson1_opt_a.jpg' },
      { id: 'img-4-1-2', turn: 2, prompt: 'Bộ 3 khung truyện 3 cổng Sóc Bông tìm bóng', time: '16:15', toneBg: 'bg-purple-100', url: '/assets/aiki-islands/island4_lesson1_3gates.jpg' },
    ],
    verificationQuestion: {
      question: 'Câu chuyện tranh này đã đi qua đủ 3 Cổng (Bình thường -> Có chuyện -> Giải quyết) chưa?',
      criteria: ['Cổng 1 khởi đầu bình thường', 'Cổng 2 có biến cố cản trở hồi hộp', 'Cổng 3 giải quyết vấn đề trọn vẹn'],
    },
    illustrationType: 'three-gates',
  },

  'bai-4-2': {
    lessonId: 'bai-4-2-04-chang-thu-thach',
    subjectName: 'Hành Trình 4 Chặng Thử Thách',
    badge: 'Bài 4.2',
    missionChecklist: [
      { id: '1', label: 'Chặng 1 MUỐN: Tìm Hạt Dẻ Vàng cổ xưa', done: true },
      { id: '2', label: 'Chặng 2 CẢN: Dòng suối đá cuộn xiết & sấm sét', done: true },
      { id: '3', label: 'Chặng 3 LÀM & Chặng 4 KẾT: Bắc cầu vượt suối', inProgress: true },
      { id: '4', label: 'Đọc lại 4 chặng kịch bản nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Khung xương 4 Chặng', desc: 'Muốn -> Cản -> Làm -> Kết' },
        { title: 'Khai thác điểm yếu trong hồ sơ', desc: 'Nỗi sợ sấm biến thành thử thách nghẹt thở' },
      ],
      locked: [
        { title: 'Bản đồ 8 ô Storyboard — cất cho bài 4.3', desc: 'Bài 4.3 sẽ vẽ storyboard hình que' },
      ],
    },
    lockedFeatures: ['4 chặng truyện: Muốn - Cản - Làm - Kết', 'Sóc Bông muốn tìm Hạt Dẻ Vàng', 'vượt suối đá cuộn xiết và sấm sét'],
    pinnedTags: ['khung xương 4 chặng', 'Muốn Cản Làm Kết', 'Hạt Dẻ Vàng'],
    quickSuggestions: [
      'MUỐN: Sóc Bông muốn tìm Hạt Dẻ Vàng cổ xưa trên vách đá',
      'CẢN: Dòng suối đá cuộn xiết và bầu trời nổi sấm đùng đoàng',
      'LÀM & KẾT: Bắc cầu cành gỗ vượt suối, chạm tay vào Hạt Dẻ Vàng',
    ],
    akiMotto: 'Khung xương 4 Chặng: Muốn -> Cản -> Làm -> Kết. Thử thách càng lớn thì chiến thắng càng ngọt ngào!',
    initialAkiMessage:
      'Chào Nhà Biên Kịch Nhí! Đừng để nhân vật đạt được mục tiêu quá dễ dàng! Hãy cùng dựng Khung Xương 4 Chặng đầy thử thách nào!',
    initialPrompt: 'Hành trình 4 chặng thử thách của Sóc Bông: muốn tìm hạt dẻ vàng, suối đá cuộn xiết, bắc cầu gỗ vượt suối, tìm thấy hạt dẻ vinh quang',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Chặng 1 MUỐN: Nhân vật muốn làm gì?',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy xác định mục tiêu của nhân vật: Sóc Bông muốn tìm Hạt Dẻ Vàng cổ xưa trên đỉnh vách đá!',
          quickPrompt: 'MUỐN: Sóc Bông nhìn lên đỉnh vách đá muốn tìm Hạt Dẻ Vàng cổ xưa',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson2_opt_a.jpg',
          akiFeedback: 'Mục tiêu rõ ràng rồi! Nhưng đường đi không hề dễ dàng. Sang Bước 2: Dựng chướng ngại vật ở chặng CẢN nào!',
          lockedFeaturesAtStep: ['chặng 1 MUỐN', 'Hạt Dẻ Vàng'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Chặng 2 CẢN: Điều gì cản trở gay gắt?',
          akiInstruction: 'Bé hãy thêm trở ngại từ nỗi sợ của Sóc Bông: "CẢN: Dòng suối đá cuộn xiết chắn đường, trời lại nổi sấm sét đùng đoàng!"',
          quickPrompt: 'CẢN: Dòng suối đá cuộn xiết chắn đường, bầu trời nổi sấm sét đùng đoàng khiến Sóc Bông run rẩy',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson2_4beats.jpg',
          akiFeedback: 'Nghẹt thở quá! Thử thách đã được đẩy lên cao trào! Sang Bước 3: Xem Sóc Bông LÀM cách nào để KẾT thúc có hậu nhé!',
          lockedFeaturesAtStep: ['chặng 2 CẢN', 'suối đá sấm sét'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Chặng 3 LÀM & Chặng 4 KẾT: Hành động & Thắng lợi',
          akiInstruction: 'Hoàn thiện 4 chặng: "LÀM: Sóc Bông dũng cảm bắc cành gỗ mục làm cầu và dùng túi che mưa vượt suối. KẾT: Chạm tay vào Hạt Dẻ Vàng phát sáng rực rỡ!"',
          quickPrompt: 'Hành trình 4 chặng: Sóc Bông muốn tìm hạt dẻ vàng, gặp suối đá và sấm cản đường, bắc cầu cành gỗ vượt qua và tìm thấy hạt dẻ vàng vinh quang',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson2_4beats.jpg',
          akiFeedback: '🎉 Quá xuất sắc! Khung xương 4 Chặng Muốn -> Cản -> Làm -> Kết hoàn hảo, câu chuyện hồi hộp và chiến thắng ngọt ngào vô cùng! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['chặng 3 LÀM', 'chặng 4 KẾT', 'khung xương 4 chặng'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Đọc lại 4 chặng & nộp vào Balo',
          akiInstruction: 'Bé hãy đọc to lại 4 dòng kịch bản xem đã đủ kịch tính chưa và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson2_4beats.jpg',
          akiFeedback: 'Kịch bản 4 Chặng Thử Thách đã được ghi danh! Chuẩn bị vẽ Storyboard ở bài sau nào! 🏆',
          lockedFeaturesAtStep: ['khung xương 4 chặng', 'kịch bản hoàn chỉnh'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-4-2-1', turn: 1, prompt: 'Sóc Bông muốn tìm Hạt Dẻ Vàng', time: '16:30', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island4_lesson2_opt_a.jpg' },
      { id: 'img-4-2-2', turn: 2, prompt: 'Hành trình 4 chặng Muốn Cản Làm Kết của Sóc Bông', time: '16:45', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island4_lesson2_4beats.jpg' },
    ],
    verificationQuestion: {
      question: 'Kịch bản này đã có đủ 4 chặng (Muốn -> Cản -> Làm -> Kết) chưa?',
      criteria: ['Mục tiêu muốn gì rõ ràng', 'Có chướng ngại vật cản đường kịch tính', 'Hành động vượt khó và kết quả xứng đáng'],
    },
    illustrationType: 'four-challenges',
  },

  'bai-4-3': {
    lessonId: 'bai-4-3-ban-do-8-o-p1-mo',
    subjectName: 'Bản Đồ Storyboard 8 Ô - Phần 1: Mở',
    badge: 'Bài 4.3',
    missionChecklist: [
      { id: '1', label: 'Phác thảo Ô 1: Xuất phát từ nhà cây', done: true },
      { id: '2', label: 'Phác thảo Ô 2: Cơn gió lạ cuốn bản đồ', done: true },
      { id: '3', label: 'Phác thảo Ô 3 & Ô 4: Dừng chân & Quyết tâm', inProgress: true },
      { id: '4', label: 'Chụp ảnh nộp bản vẽ Storyboard tay' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Storyboard 8 ô hình que', desc: 'Bản thiết kế xương sống của đạo diễn truyện tranh' },
        { title: 'Phân bổ nhịp điệu 4 ô đầu', desc: 'Ô 1 Mở -> Ô 2 Gió -> Ô 3 Cản -> Ô 4 Lên đường' },
      ],
      locked: [
        { title: 'Tạo hình AI 8 khung — cất cho bài 4.4', desc: 'Bài 4.4 mới mở nút tạo hình AI' },
      ],
    },
    lockedFeatures: ['4 ô đầu phân cảnh storyboard hình que', 'ô 1 khởi hành từ làng yên bình', 'ô 2 cơn gió lạ cuốn bay bản đồ', 'ô 3 dừng chân trước đầm lầy bí hiểm'],
    pinnedTags: ['storyboard hình que', 'bản đồ 8 ô', 'phân cảnh truyện tranh'],
    quickSuggestions: [
      'Ô 1: Sóc Bông vui vẻ xuất phát từ căn cứ nhà cây',
      'Ô 2: Cơn gió lốc mạnh bất ngờ cuốn bay tấm bản đồ',
      'Ô 3 & 4: Dừng chân trước rừng rậm và kiên quyết lên đường',
    ],
    akiMotto: 'Storyboard hình que 8 ô là bí kíp của các đạo diễn lừng danh để giữ nhịp điệu hồi hộp cho câu chuyện!',
    initialAkiMessage:
      'Chào Đạo Diễn Nhí! Chuẩn bị giấy và bút chì nào! Hãy vẽ phác Storyboard bằng hình que cho 4 ô đầu tiên trước khi bấm máy nhé!',
    initialPrompt: 'Phân cảnh 4 ô đầu của storyboard 8 ô: Sóc Bông xuất phát từ nhà cây, nhận nhiệm vụ, gió cuốn bản đồ và tiến vào rừng sâu',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Phác thảo Ô 1 & Ô 2 (Xuất phát & Biến cố gió)',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy vẽ phác Ô 1 (Sóc Bông xuất phát từ nhà cây) và Ô 2 (Gió lốc cuốn bay bản đồ) bằng hình que nhé!',
          quickPrompt: 'Storyboard Ô 1: Sóc Bông chào tạm biệt nhà cây. Ô 2: Gió lốc cuốn bản đồ bay qua hàng rào',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson3_opt_a.jpg',
          akiFeedback: 'Nét vẽ hình que nhanh và rõ ràng lắm! Nhịp điệu mở đầu rất chuẩn! Sang Bước 2: Phác tiếp Ô 3 và Ô 4 nhé!',
          lockedFeaturesAtStep: ['ô 1 xuất phát', 'ô 2 gió cuốn'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Phác thảo Ô 3 & Ô 4 (Cản đường & Quyết tâm lên đường)',
          akiInstruction: 'Bé hãy vẽ phác Ô 3 (Dừng chân trước đầm lầy) và Ô 4 (Sóc Bông xách ba lô kiên quyết tiến vào rừng sâu)!',
          quickPrompt: 'Storyboard Ô 3: Đứng trước đầm lầy hiểm trở. Ô 4: Sóc Bông xách ba lô kiên quyết tiến bước',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson3_storyboard1.jpg',
          akiFeedback: 'Tuyệt vời! 4 ô đầu tiến triển mượt mà không hề bị lặp hành động! Sang Bước 3: Ghép thành bản vẽ 4 ô hoàn chỉnh nhé!',
          lockedFeaturesAtStep: ['ô 3 cản đường', 'ô 4 quyết tâm lên đường'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Hoàn thiện bản vẽ Storyboard 4 ô đầu',
          akiInstruction: 'Hoàn thiện bảng Storyboard 4 ô đầu tiên với một câu mô tả ngắn dưới mỗi ô: "Phân cảnh 4 ô đầu của storyboard 8 ô: Sóc Bông xuất phát, gió cuốn bản đồ, gặp đầm lầy và lên đường"!',
          quickPrompt: 'Phân cảnh 4 ô đầu của storyboard 8 ô: Sóc Bông xuất phát từ nhà cây, nhận nhiệm vụ, gió cuốn bản đồ và tiến vào rừng sâu',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson3_storyboard1.jpg',
          akiFeedback: '🎉 Chuẩn đạo diễn truyện tranh! 4 ô đầu tiên đã định hình nhịp điệu kịch bản vững chắc! Bé hãy chụp ảnh nộp bài để mở khóa bài tiếp theo nhé!',
          lockedFeaturesAtStep: ['storyboard 4 ô đầu', 'bản vẽ hình que'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Chụp ảnh nộp Storyboard & mở bài 4.4',
          akiInstruction: 'Bé hãy kiểm tra lại 4 ô vẽ tay trên giấy và bấm Nộp Bài để mở khóa bài thực hành AI tiếp theo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson3_storyboard1.jpg',
          akiFeedback: 'Bản vẽ Storyboard tay đã được duyệt thông qua! Nút tạo hình AI ở bài 4.4 đã sẵn sàng mở cửa đón bé! 🏆',
          lockedFeaturesAtStep: ['storyboard hình que', 'mở khóa bài 4.4'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-4-3-1', turn: 1, prompt: 'Phác thảo storyboard hình que ô 1 và ô 2', time: '17:00', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island4_lesson3_opt_a.jpg' },
      { id: 'img-4-3-2', turn: 2, prompt: 'Storyboard 4 ô đầu tiên phân cảnh hành trình Sóc Bông', time: '17:15', toneBg: 'bg-sky-100', url: '/assets/aiki-islands/island4_lesson3_storyboard1.jpg' },
    ],
    verificationQuestion: {
      question: 'Storyboard 4 ô này đã có đủ hành động khác nhau và câu mô tả ngắn dưới mỗi ô chưa?',
      criteria: ['Mỗi ô thể hiện một hành động riêng biệt', 'Có câu mô tả ngắn dưới từng ô', 'Giữ đúng nhịp điệu câu chuyện'],
    },
    illustrationType: 'storyboard-panels',
  },

  'bai-4-4': {
    lessonId: 'bai-4-4-ban-do-8-o-p2-khoa',
    subjectName: 'Bản Đồ Storyboard 8 Ô - Phần 2: Khóa',
    badge: 'Bài 4.4',
    missionChecklist: [
      { id: '1', label: 'Khóa Ô 5: Đối mặt thử thách tột cùng', done: true },
      { id: '2', label: 'Khóa Ô 6 & Ô 7: Giải pháp thông minh vượt nguy', done: true },
      { id: '3', label: 'Khóa Ô 8: Tìm thấy Hạt Dẻ Vàng vinh quang', inProgress: true },
      { id: '4', label: 'Soi đủ 8 khung truyện tranh đồng nhất nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Khóa 3 yếu tố sống còn', desc: 'Đúng nhân vật (ảnh mẫu + luật vẽ) · Đúng việc (storyboard) · Đúng phong cách' },
        { title: 'Hoàn thiện 8 khung truyện tranh AI', desc: 'Liền mạch như một bộ phim hoạt hình' },
      ],
      locked: [
        { title: 'Lời thoại & bìa sách — cất cho bài 4.5', desc: 'Bài 4.5 sẽ đóng sách và làm bìa' },
      ],
    },
    lockedFeatures: ['4 ô sau của storyboard cao trào và kết thúc', 'khóa 3 yếu tố: đúng nhân vật, đúng hành động ô, đúng phong cách', 'tìm thấy Hạt Dẻ Vàng vinh quang'],
    pinnedTags: ['khóa 3 yếu tố', 'bản đồ 8 ô', 'truyện tranh liền mạch'],
    quickSuggestions: [
      'Ô 5: Sóc Bông đối mặt vách đá hiểm trở sấm sét nổi lên',
      'Ô 6 & 7: Vượt suối đá cuộn xiết tiến vào hang pha lê',
      'Ô 8: Chạm tay vào Hạt Dẻ Vàng trong tiếng reo hò',
    ],
    akiMotto: 'Khóa chặt 3 thứ: Đúng nhân vật, Đúng hành động theo storyboard, Đúng phong cách thì 8 khung tranh sẽ như một bộ phim hoạt hình!',
    initialAkiMessage:
      'Nút tạo hình AI mở rồi! Nhưng nhớ để storyboard và ảnh mẫu ngay cạnh nhé! Khóa chặt 3 thứ: Đúng nhân vật, Đúng việc, Đúng phong cách nào!',
    initialPrompt: 'Phân cảnh 4 ô cuối của storyboard 8 ô: Sóc Bông đối mặt thử thách đỉnh điểm, tìm thấy hạt dẻ vàng vinh quang và trở về trong tiếng hoan hô',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Khóa Ô 5: Đúng nhân vật & Đúng việc storyboard',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy tạo Ô 5 bám sát storyboard: Sóc Bông đối mặt với vách đá hiểm trở trong giông bão, giữ đúng 3 điểm khóa nhé!',
          quickPrompt: 'Khung 5: Sóc Bông mũ len đỏ đuôi xù túi nâu đứng trước vách đá hiểm trở trong đêm giông, phong cách comic hoạt hình',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson4_opt_a.jpg',
          akiFeedback: 'Nhân vật đúng! Việc đúng! Phong cách đúng! Không hề bị đổi áo hay đổi tóc! Sang Bước 2: Tạo Ô 6 và Ô 7 nhé!',
          lockedFeaturesAtStep: ['khung 5', 'khóa 3 yếu tố'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Khóa Ô 6 & Ô 7: Cao trào & Giải pháp thông minh',
          akiInstruction: 'Bé hãy tạo Ô 6 và 7: Sóc Bông bắc cầu vượt suối và tiến vào hang pha lê tìm kiếm Hạt Dẻ Vàng!',
          quickPrompt: 'Khung 6 và 7: Sóc Bông bắc cầu vượt suối đá cuộn và tiến vào hang pha lê lấp lánh, giữ đúng mũ đỏ đuôi xù túi nâu',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson4_storyboard2.jpg',
          akiFeedback: 'Cực kỳ ly kỳ và liền mạch! Giữ vững phong cách từ ô 1 đến ô 7 rồi! Sang Bước 3: Tạo Ô 8 chiến thắng vinh quang nào!',
          lockedFeaturesAtStep: ['khung 6 và 7', 'cao trào giải pháp'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Khóa Ô 8: Hoàn thành trọn bộ 8 khung truyện',
          akiInstruction: 'Ô 8 chiến thắng: "Khung 8: Sóc Bông chạm tay vào Hạt Dẻ Vàng phát sáng rực rỡ và trở về trong tiếng reo hò của muôn thú, phong cách comic tươi sáng"!',
          quickPrompt: 'Khung 8: Sóc Bông cầm Hạt Dẻ Vàng phát sáng rực rỡ trên tay giữa muôn thú hoan hô, mũ len đỏ quả bông trắng, đuôi to xù cam, túi vải nâu',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson4_storyboard2.jpg',
          akiFeedback: '🎉 Tuyệt tác truyện tranh! Đủ 8 khung truyện liền mạch như một bộ phim hoạt hình thu nhỏ! Nhân vật không hề bị trôi một milimet nào! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['khung 8 chiến thắng', 'trọn bộ 8 khung truyện'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi 8 khung truyện & nộp vào Balo',
          akiInstruction: 'Bé hãy soi kỹ lại cả 8 khung xem nhân vật và phong cách đã đồng bộ 100% chưa và bấm Nộp Bài nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson4_storyboard2.jpg',
          akiFeedback: '8 Khung truyện tranh hoàn chỉnh đã được khóa an toàn trong Balo Sáng Tạo! Chuẩn bị làm bìa và đóng sách ở bài cuối nào! 🏆',
          lockedFeaturesAtStep: ['bộ 8 khung truyện', 'khóa 3 yếu tố thành công'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-4-4-1', turn: 1, prompt: 'Khung 5 Sóc Bông đối mặt vách đá hiểm trở', time: '17:30', toneBg: 'bg-indigo-100', url: '/assets/aiki-islands/island4_lesson4_opt_a.jpg' },
      { id: 'img-4-4-2', turn: 2, prompt: 'Phân cảnh 4 ô sau của storyboard 8 ô Sóc Bông tìm hạt dẻ vàng', time: '17:45', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island4_lesson4_storyboard2.jpg' },
    ],
    verificationQuestion: {
      question: 'Cả 8 khung truyện đã đồng bộ nhân vật, đúng việc theo storyboard và giữ một phong cách chưa?',
      criteria: ['Đúng nhân vật qua tất cả các khung', 'Bám sát hành động trong storyboard', 'Giữ nguyên một phong cách vẽ đồng nhất'],
    },
    illustrationType: 'storyboard-panels',
  },

  'bai-4-5': {
    lessonId: 'bai-4-5-vuong-mien-hoan-hao',
    subjectName: 'Vương Miện Hoàn Hảo - Bìa Comic Book',
    badge: 'Bài 4.5',
    missionChecklist: [
      { id: '1', label: 'Tự viết lời thoại ngắn gọn cho 8 khung', done: true },
      { id: '2', label: 'Đặt tên truyện hấp dẫn và ý nghĩa', done: true },
      { id: '3', label: 'Thiết kế trang bìa Comic Book rực rỡ', inProgress: true },
      { id: '4', label: 'Xuất bản cuốn truyện hoàn chỉnh nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Tự viết lời thoại chân thực', desc: 'Tối đa 2 bong bóng thoại mỗi khung, ngắn gọn tự nhiên' },
        { title: 'Thiết kế bìa Comic Book chuyên nghiệp', desc: 'Tiêu đề chữ nổi 3D, vương miện và tên tác giả nhí' },
      ],
      locked: [
        { title: 'Săn lùng bộ sưu tập thẻ game — cất cho Đảo 5', desc: 'Đảo 5 sẽ trở thành Nhà phát minh trò chơi AI' },
      ],
    },
    lockedFeatures: ['trang bìa comic rực rỡ có tiêu đề chữ nổi 3D', 'bong bóng thoại tối đa 2 bóng mỗi khung', 'khung tranh đóng gáy chuyên nghiệp'],
    pinnedTags: ['vương miện hoàn hảo', 'bìa Comic Book', 'tự viết lời thoại'],
    quickSuggestions: [
      'Trang bìa Comic Book: Sóc Bông đội vương miện lá sồi',
      'tiêu đề chữ nổi 3D "SÓC BÔNG VÀ HẠT DẺ THẦN KỲ"',
      'tên tác giả nhí và khung viền đóng sách chuyên nghiệp',
    ],
    akiMotto: 'Bìa sách là vương miện của tác phẩm! Tự viết lời thoại ngắn gọn và đặt tên truyện thật kêu nhé!',
    initialAkiMessage:
      'Chào Tác Giả Xuất Bản! Hôm nay là ngày cuốn truyện tranh đầu tay của bé ra đời! Hãy tự viết lời thoại và thiết kế trang bìa vương miện lộng lẫy nào!',
    initialPrompt: 'Bìa truyện tranh Comic Book: Sóc Bông đội vương miện lá sồi cầm hạt dẻ vàng phát sáng, tiêu đề chữ nổi 3D rực rỡ và tên tác giả nhí',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Tự viết lời thoại ngắn gọn cho các khung',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy tự viết lời thoại ngắn gọn cho nhân vật (tối đa 2 bong bóng thoại/khung, nói đúng cách mình nói ngoài đời) nhé!',
          quickPrompt: 'Khung truyện với bong bóng thoại ngắn gọn: "Cao quá... nhưng mình không bỏ cuộc đâu!"',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson5_opt_a.jpg',
          akiFeedback: 'Lời thoại rất tự nhiên và tràn đầy cảm xúc! Sang Bước 2: Đặt tên truyện thật kêu nào!',
          lockedFeaturesAtStep: ['lời thoại tự viết', 'tối đa 2 bong bóng'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Đặt tên truyện hấp dẫn & ý nghĩa',
          akiInstruction: 'Bé hãy đặt một cái tên gợi mở và cuốn hút cho tác phẩm, ví dụ: "SÓC BÔNG VÀ HẠT DẺ THẦN KỲ"!',
          quickPrompt: 'Tiêu đề truyện tranh chữ 3D rực rỡ: SÓC BÔNG VÀ HẠT DẺ THẦN KỲ',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson5_comicbook.jpg',
          akiFeedback: 'Tên truyện nghe là muốn mở ra đọc ngay! Sang Bước 3: Thiết kế trang bìa Comic Book vương miện nhé!',
          lockedFeaturesAtStep: ['tên truyện Sóc Bông Và Hạt Dẻ Thần Kỳ'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Thiết kế trang bìa Comic Book rực rỡ',
          akiInstruction: 'Bước quyết định: "Trang bìa Comic Book: Sóc Bông đội vương miện lá sồi cầm hạt dẻ vàng phát sáng, tiêu đề chữ 3D rực rỡ và ghi tên tác giả nhí"!',
          quickPrompt: 'Bìa truyện tranh Comic Book: Sóc Bông đội vương miện lá sồi cầm hạt dẻ vàng phát sáng, tiêu đề chữ nổi 3D rực rỡ và tên tác giả nhí',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson5_comicbook.jpg',
          akiFeedback: '🎉 Quá lộng lẫy! Bìa sách đúng chuẩn vương miện của tác phẩm! Cuốn truyện tranh đầu tay của bé đã hoàn thành mỹ mãn! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['bìa comic book', 'vương miện lá sồi', 'tên tác giả nhí'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Xuất bản cuốn truyện & nộp vào Balo',
          akiInstruction: 'Bé hãy ngắm nhìn cuốn truyện hoàn chỉnh, xuất file in ấn và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island4_lesson5_comicbook.jpg',
          akiFeedback: 'Chúc mừng Tác Giả Truyện Tranh AI đã tốt nghiệp Đảo 4 xuất sắc! Cuốn truyện của bé thật đáng tự hào! 🏆',
          lockedFeaturesAtStep: ['cuốn truyện hoàn chỉnh', 'xuất bản thành công'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-4-5-1', turn: 1, prompt: 'Khung truyện với bong bóng thoại tự viết ngắn gọn', time: '18:00', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island4_lesson5_opt_a.jpg' },
      { id: 'img-4-5-2', turn: 2, prompt: 'Bìa truyện tranh Comic Book Sóc Bông đội vương miện lá sồi rực rỡ', time: '18:15', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island4_lesson5_comicbook.jpg' },
    ],
    verificationQuestion: {
      question: 'Cuốn truyện đã có đủ lời thoại ngắn gọn, tên truyện và trang bìa Comic Book mang tên tác giả chưa?',
      criteria: ['Lời thoại tối đa 2 bóng mỗi khung', 'Có tiêu đề truyện tranh ấn tượng', 'Trang bìa hoàn chỉnh ghi rõ tên tác giả nhí'],
    },
    illustrationType: 'comic-crown',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ĐẢO 5: NHÀ PHÁT MINH TRÒ CHƠI AI (5.1 -> 5.5)
  // ──────────────────────────────────────────────────────────────────────────
  'bai-5-1': {
    lessonId: 'bai-5-1-san-lung-bo-suu-tap',
    subjectName: 'Thẻ Bài Rồng Băng Tinh Thể',
    badge: 'Bài 5.1',
    missionChecklist: [
      { id: '1', label: 'Tự chọn chủ đề riêng gần gũi và yêu thích', done: true },
      { id: '2', label: 'Liệt kê đủ 12 thứ cùng một họ nguyên tố', done: true },
      { id: '3', label: 'Thiết kế lá bài số 01 Rồng Băng Tinh Thể', inProgress: true },
      { id: '4', label: 'Soi lá bài số 01 tiên phong nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Săn lùng bộ sưu tập từ đời thực', desc: 'Đi hỏi, đi nhìn thế giới quanh mình chứ không để AI nghĩ hộ' },
        { title: '12 Món cùng một họ chủ đề', desc: 'Thống nhất, độc đáo và không trùng lặp' },
      ],
      locked: [
        { title: 'Cân bằng điểm chỉ số — cất cho bài 5.2', desc: 'Bài 5.2 sẽ phân bổ ngân sách điểm' },
      ],
    },
    lockedFeatures: ['thẻ bài rồng băng vảy pha lê xanh ngọc', 'viền thẻ nguyên tố Băng bạc', 'danh sách 12 linh thú cùng họ nguyên tố thần thoại'],
    pinnedTags: ['săn lùng bộ sưu tập', '12 thẻ bài nguyên tố', 'thẻ bài rồng băng vảy pha lê xanh ngọc', 'viền thẻ nguyên tố Băng bạc'],
    quickSuggestions: [
      'thẻ bài rồng băng vảy pha lê xanh ngọc',
      'viền thẻ nguyên tố Băng bạc, biểu tượng bông tuyết 6 cánh',
      'danh sách 12 linh thú nguyên tố thần thoại đồng bộ',
    ],
    akiMotto: 'Một bộ thẻ bài huyền thoại bắt đầu từ chủ đề tự săn lùng và lá bài nguyên tố đầu tiên được trau chuốt tỉ mỉ!',
    initialAkiMessage:
      'Chào Nhà Sáng Chế Trò Chơi! Đừng nhờ AI nghĩ hộ chủ đề nhé! Hãy tự săn lùng 12 món cùng một họ và tạo lá bài số 01 tiên phong nào!',
    initialPrompt: 'Thẻ bài game ma thuật lá 01: thẻ bài rồng băng vảy pha lê xanh ngọc, viền thẻ nguyên tố Băng bạc lấp lánh, khung thẻ bài TCG sắc nét',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Tự chọn chủ đề riêng & lập danh sách 12 món',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy tự chọn chủ đề mình say mê (ví dụ: Bộ 12 Linh thú nguyên tố) và ghi đủ 12 cái tên nhé!',
          quickPrompt: 'Danh sách 12 linh thú nguyên tố: Rồng Băng, Phượng Hoàng Lửa, Thủy Long, Thạch Quy...',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson1_opt_a.jpg',
          akiFeedback: 'Tuyệt vời! 12 cái tên cùng một họ nguyên tố rất đồng nhất! Sang Bước 2: Thiết kế lá bài số 01 tiên phong nhé!',
          lockedFeaturesAtStep: ['danh sách 12 thẻ', 'chủ đề nguyên tố'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Thiết kế khung thẻ bài số 01 tiên phong',
          akiInstruction: 'Bé hãy tạo lá số 01: "Thẻ bài game ma thuật: Rồng Băng Tinh Thể vảy lam ngọc viền bạc tuyết huyền thoại"!',
          quickPrompt: 'Thẻ bài game ma thuật: Rồng Băng Tinh Thể vảy lam ngọc lấp lánh, viền bạc tuyết huyền thoại',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson1_hunting.jpg',
          akiFeedback: 'Oa! Rồng Băng hiện lên dũng mãnh với vảy băng xanh ngọc sắc sảo! Sang Bước 3: Hoàn thiện biểu tượng nguyên tố nhé!',
          lockedFeaturesAtStep: ['lá bài 01 Rồng Băng', 'viền bạc tuyết'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Hoàn thiện lá bài số 01 mở màn bộ sưu tập',
          akiInstruction: 'Hoàn thiện lá bài mẫu: Thêm biểu tượng bông tuyết 6 cánh và khung thẻ TCG chuẩn quốc tế!',
          quickPrompt: 'Thẻ bài game ma thuật lá 01: Rồng Băng Tinh Thể vảy lam ngọc lấp lánh, viền bạc tuyết huyền thoại, khung thẻ bài TCG sắc nét',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson1_hunting.jpg',
          akiFeedback: '🎉 Xuất sắc! Lá bài số 01 mở màn bộ sưu tập đã hoàn thiện cực kỳ chuyên nghiệp! 11 lá còn lại đã có kim chỉ nam! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['lá 01 hoàn chỉnh', 'khung TCG chuẩn'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi lá bài số 01 & nộp vào Balo',
          akiInstruction: 'Bé hãy soi kỹ lá bài mở màn bộ sưu tập và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson1_hunting.jpg',
          akiFeedback: 'Lá bài số 01 đã được ghi danh vào Kho Bảo Vật Game! Sẵn sàng phù phép chỉ số ở bài sau nào! 🏆',
          lockedFeaturesAtStep: ['lá bài số 01', 'bộ sưu tập 12 thẻ'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-5-1-1', turn: 1, prompt: 'Danh sách 12 linh thú nguyên tố thần thoại', time: '19:00', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island5_lesson1_opt_a.jpg' },
      { id: 'img-5-1-2', turn: 2, prompt: 'Thẻ bài ma thuật Rồng Băng Tinh Thể viền tuyết bạc', time: '19:15', toneBg: 'bg-sky-100', url: '/assets/aiki-islands/island5_lesson1_hunting.jpg' },
    ],
    verificationQuestion: {
      question: 'Lá bài này đã thuộc một bộ sưu tập 12 món cùng một họ thống nhất chưa?',
      criteria: ['Thuộc chủ đề thống nhất', 'Hình ảnh sắc nét chuẩn phong cách thẻ bài', 'Có tên và biểu tượng rõ ràng'],
    },
    illustrationType: 'dragon-card',
  },

  'bai-5-2': {
    lessonId: 'bai-5-2-phu-phep-mat-the',
    subjectName: 'Phù Phép Mặt Thẻ Ngân Sách 20 Điểm',
    badge: 'Bài 5.2',
    missionChecklist: [
      { id: '1', label: 'Phân bổ ngân sách: Sức 9, Nhanh 6, Khéo 5 = 20đ', done: true },
      { id: '2', label: 'Viết kỹ năng riêng độc đáo cho thẻ bài', done: true },
      { id: '3', label: 'Thiết kế mặt trước thẻ bài TCG cân bằng', inProgress: true },
      { id: '4', label: 'Soi mặt thẻ chuẩn luật ngân sách nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Luật ngân sách 20 điểm', desc: 'Sức + Nhanh + Khéo = đúng 20 điểm cho cả 12 lá bài' },
        { title: 'Trò chơi hay là trò chơi công bằng', desc: 'Không có lá bài nào quá bá đạo hoặc quá yếu' },
      ],
      locked: [
        { title: 'Khóa mặt lưng ma thuật — cất cho bài 5.3', desc: 'Bài 5.3 sẽ khóa mặt lưng bánh răng' },
      ],
    },
    lockedFeatures: ['luật ngân sách 20 điểm: Sức + Nhanh + Khéo <= 20', 'chỉ số HP và ATK cân bằng công bằng', 'khung kỹ năng riêng độc đáo'],
    pinnedTags: ['ngân sách 20 điểm', 'cân bằng chỉ số', 'mặt thẻ TCG'],
    quickSuggestions: [
      'Sức 9, Nhanh 6, Khéo 5 (Tổng đúng 20 điểm công bằng)',
      'kỹ năng riêng: ❄ Hơi Thở Băng Giá - đóng băng đối thủ 1 lượt',
      'mặt thẻ TCG hiển thị rõ 3 thanh chỉ số và khung kỹ năng',
    ],
    akiMotto: 'Luật ngân sách điểm số: Sức + Nhanh + Khéo bằng nhau cho cả 12 lá! Trò chơi hay là trò chơi công bằng!',
    initialAkiMessage:
      'Chào Nhà Cân Bằng Trò Chơi! Không được cho lá bài điểm 10-10-10 đâu nhé! Hãy áp dụng Luật Ngân Sách 20 Điểm để trận đấu luôn kịch tính nào!',
    initialPrompt: 'Mặt thẻ bài game TCG: Rồng Băng với chỉ số cân bằng Sức 9 Nhanh 6 Khéo 5 tổng 20 điểm và kỹ năng Hơi Thở Băng Giá',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Phân bổ ngân sách 20 điểm cho 3 chỉ số',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy chia đúng 20 điểm cho Rồng Băng: Sức 9 (rất mạnh), Nhanh 6 (bay vừa), Khéo 5 (thân to) nhé!',
          quickPrompt: 'Rồng Băng Tinh Thể với 3 chỉ số: Sức 9, Nhanh 6, Khéo 5, tổng 20 điểm',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson2_opt_a.jpg',
          akiFeedback: 'Tuyệt đối công bằng! Tổng 9 + 6 + 5 đúng bằng 20 điểm! Sang Bước 2: Viết một kỹ năng riêng đặc sắc nhé!',
          lockedFeaturesAtStep: ['Sức 9 Nhanh 6 Khéo 5', 'tổng 20 điểm'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Viết kỹ năng riêng độc đáo cho lá bài',
          akiInstruction: 'Bé hãy thêm kỹ năng riêng: "❄ Hơi Thở Băng Giá - đóng băng đối thủ 1 lượt không thể tấn công"!',
          quickPrompt: 'Rồng Băng với kỹ năng đặc biệt: ❄ Hơi Thở Băng Giá đóng băng đối thủ 1 lượt',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson2_stats.jpg',
          akiFeedback: 'Kỹ năng quá lợi hại và hợp với nguyên tố Băng! Sang Bước 3: Đưa toàn bộ chỉ số và kỹ năng lên mặt thẻ TCG nhé!',
          lockedFeaturesAtStep: ['kỹ năng Hơi Thở Băng Giá', 'cân bằng chỉ số'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Hoàn thiện mặt thẻ TCG cân bằng chỉ số',
          akiInstruction: 'Bước quyết định: "Mặt thẻ bài game TCG: Rồng Băng với chỉ số cân bằng Sức 9 Nhanh 6 Khéo 5 tổng 20 điểm và kỹ năng Hơi Thở Băng Giá"!',
          quickPrompt: 'Mặt thẻ bài game TCG: Rồng Băng với chỉ số cân bằng Sức 9 Nhanh 6 Khéo 5 tổng 20 điểm và kỹ năng Hơi Thở Băng Giá',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson2_stats.jpg',
          akiFeedback: '🎉 Chuẩn chỉnh tuyệt đối! Mặt thẻ hiển thị rõ 3 thanh chỉ số công bằng và khung kỹ năng sắc nét! Trò chơi đã có linh hồn cân bằng! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['mặt thẻ TCG hoàn chỉnh', 'luật ngân sách 20đ'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi mặt thẻ & nộp vào Balo',
          akiInstruction: 'Bé hãy soi kỹ lại tổng điểm 3 chỉ số xem đúng bằng 20 chưa và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson2_stats.jpg',
          akiFeedback: 'Mặt thẻ bài cân bằng chỉ số đã được cấp phép thi đấu chính thức! Cất an toàn vào Balo nào! 🏆',
          lockedFeaturesAtStep: ['luật ngân sách 20đ', 'mặt thẻ TCG'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-5-2-1', turn: 1, prompt: 'Bảng phân bổ chỉ số Sức 9 Nhanh 6 Khéo 5 tổng 20 điểm', time: '19:30', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island5_lesson2_opt_a.jpg' },
      { id: 'img-5-2-2', turn: 2, prompt: 'Mặt thẻ bài TCG Rồng Băng với chỉ số cân bằng và kỹ năng Hơi Thở Băng Giá', time: '19:45', toneBg: 'bg-sky-100', url: '/assets/aiki-islands/island5_lesson2_stats.jpg' },
    ],
    verificationQuestion: {
      question: 'Tổng 3 chỉ số Sức + Nhanh + Khéo của thẻ bài có đúng bằng ngân sách 20 điểm không?',
      criteria: ['Tổng 3 chỉ số đúng bằng 20 điểm', 'Có kỹ năng riêng độc đáo', 'Bố cục mặt thẻ TCG rõ ràng dễ đọc'],
    },
    illustrationType: 'stat-budget',
  },

  'bai-5-3': {
    lessonId: 'bai-5-3-khoa-the',
    subjectName: 'Khóa Lưng Thẻ Bánh Răng Ma Thuật',
    badge: 'Bài 5.3',
    missionChecklist: [
      { id: '1', label: 'Cố định công thức nền chung cho mặt trước', done: true },
      { id: '2', label: 'Thiết kế mặt lưng bánh răng đối xứng tâm 100%', done: true },
      { id: '3', label: 'Ghép 12 lá bài và mặt lưng đồng nhất', inProgress: true },
      { id: '4', label: 'Soi toàn bộ 12 lá bài cùng một bộ nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Công thức nền chung', desc: 'Giữ nguyên khung viền, font chữ và góc nhìn cho cả bộ thẻ' },
        { title: 'Mặt lưng ma thuật đối xứng 100%', desc: 'Họa tiết bánh răng đối xứng tâm không lộ bài úp' },
      ],
      locked: [
        { title: 'Luật chơi 5 phần — cất cho bài 5.4', desc: 'Bài 5.4 sẽ soạn thảo luật chơi' },
      ],
    },
    lockedFeatures: ['mặt lưng họa tiết bánh răng vàng kim đối xứng tâm 100%', 'vòng tròn ma thuật cổ ngữ bảo vệ', 'nền lam thẫm bí ẩn đồng nhất cho cả 12 lá'],
    pinnedTags: ['khóa thẻ đồng nhất', 'mặt lưng bánh răng', 'đối xứng tâm 100%'],
    quickSuggestions: [
      'mặt lưng thẻ bài đối xứng tâm hoàn hảo 100%',
      'họa tiết bánh răng vàng kim và vòng tròn ma thuật cổ ngữ',
      'nền màu xanh lam thẫm huyền bí đồng nhất cho cả 12 lá',
    ],
    akiMotto: 'Mặt lưng phải giống hệt nhau 100% để đảm bảo tính công bằng tuyệt đối, không ai đoán trước được lá bài úp!',
    initialAkiMessage:
      'Chào Nghệ Nhân Khóa Thẻ! Đừng để bài úp bị lộ tẩy nhé! Mặt lưng phải giống hệt nhau 100% và đối xứng tâm hoàn hảo! Cùng khóa thẻ nào!',
    initialPrompt: 'Mặt lưng thẻ bài game đối xứng tâm hoàn hảo: họa tiết bánh răng vàng kim và vòng tròn ma thuật cổ ngữ nền lam thẫm huyền bí',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Cố định công thức nền chung cho mặt trước',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy ghi lại Công thức nền: Khung viền bạc tuyết, ánh sáng pha lê lam ngọc, góc nhìn chính diện cho cả 12 lá nhé!',
          quickPrompt: 'Công thức nền thẻ bài: viền bạc tuyết, ánh sáng pha lê lam ngọc, góc nhìn chính diện',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson3_opt_a.jpg',
          akiFeedback: 'Rất chuẩn! Công thức nền đã cố định xong! Sang Bước 2: Thiết kế mặt lưng bánh răng ma thuật nào!',
          lockedFeaturesAtStep: ['công thức nền chung', 'khung viền đồng nhất'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Thiết kế mặt lưng ma thuật bánh răng đối xứng',
          akiInstruction: 'Bé hãy tạo mặt lưng: Họa tiết bánh răng vàng kim và vòng tròn ma thuật cổ ngữ đối xứng tâm hoàn hảo trên nền lam thẫm!',
          quickPrompt: 'mặt lưng thẻ bài đối xứng tâm: họa tiết bánh răng vàng kim và vòng tròn ma thuật cổ ngữ nền lam thẫm',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson3_lockcards.jpg',
          akiFeedback: 'Huyền bí và đối xứng tuyệt đối! Xoay chiều nào nhìn cũng y hệt nhau, không ai đoán được bài úp! Sang Bước 3: Ghép cả bộ 12 lá nhé!',
          lockedFeaturesAtStep: ['mặt lưng bánh răng', 'đối xứng tâm 100%'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Ghép trọn bộ 12 lá bài và mặt lưng đồng nhất',
          akiInstruction: 'Bước quyết định: "Mặt lưng thẻ bài game đối xứng tâm hoàn hảo: họa tiết bánh răng vàng kim và vòng tròn ma thuật cổ ngữ nền lam thẫm huyền bí"!',
          quickPrompt: 'Mặt lưng thẻ bài game đối xứng tâm hoàn hảo: họa tiết bánh răng vàng kim và vòng tròn ma thuật cổ ngữ nền lam thẫm huyền bí',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson3_lockcards.jpg',
          akiFeedback: '🎉 Cả bộ 12 lá bài nhìn như một tác phẩm chuyên nghiệp xuất xưởng từ nhà máy game danh tiếng! Không còn một lá nào bị lạc phong cách! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['mặt lưng ma thuật đối xứng', 'bộ 12 thẻ khóa phong cách'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi cả bộ 12 thẻ & nộp vào Balo',
          akiInstruction: 'Bé hãy soi kỹ mặt lưng và phong cách của bộ thẻ xem đã đồng bộ 100% chưa và bấm Nộp Bài nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson3_lockcards.jpg',
          akiFeedback: 'Bộ 12 thẻ bài đã được khóa phong cách vĩnh cửu và cất an toàn vào Balo Sáng Tạo! 🏆',
          lockedFeaturesAtStep: ['khóa thẻ thành công', 'mặt lưng đồng nhất'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-5-3-1', turn: 1, prompt: 'Bộ 12 thẻ bài xếp hàng đồng bộ công thức nền', time: '20:00', toneBg: 'bg-indigo-100', url: '/assets/aiki-islands/island5_lesson3_opt_a.jpg' },
      { id: 'img-5-3-2', turn: 2, prompt: 'Mặt lưng thẻ bài bánh răng ma thuật đối xứng tâm hoàn hảo nền lam thẫm', time: '20:15', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island5_lesson3_lockcards.jpg' },
    ],
    verificationQuestion: {
      question: 'Mặt lưng của bộ thẻ bài có đối xứng tâm 100% và đồng nhất trên nền lam thẫm chưa?',
      criteria: ['Mặt lưng đối xứng tâm hoàn hảo', 'Không có chi tiết định hướng để đoán bài úp', 'Cả 12 lá cùng một phong cách nền'],
    },
    illustrationType: 'magic-gear-back',
  },

  'bai-5-4': {
    lessonId: 'bai-5-4-luat-choi',
    subjectName: 'Bộ Đôi Thẻ Tương Khắc & Bộ Luật 5 Phần',
    badge: 'Bài 5.4',
    missionChecklist: [
      { id: '1', label: 'Thiết lập hệ thống tương khắc Lửa vs Nước', done: true },
      { id: '2', label: 'Soạn thảo 5 câu trả lời luật chơi rõ ràng', done: true },
      { id: '3', label: 'Tạo bộ đôi thẻ bài tương khắc đối kháng', inProgress: true },
      { id: '4', label: 'Chơi thử 1 ván & in bản luật chơi nộp bài' },
    ],
    featuresAvailable: {
      opened: [
        { title: '5 Phần cốt lõi của luật chơi', desc: 'Số người · Ai đi trước · Mỗi lượt làm gì · So thẻ thế nào · Khi nào thắng' },
        { title: 'Hệ thống tương khắc nguyên tố', desc: 'Tạo cơ hội lật kèo ngoạn mục cho lá bài yếu' },
      ],
      locked: [
        { title: 'Bàn cờ & đấu trường khai mở — cất cho bài 5.5', desc: 'Bài 5.5 sẽ thiết kế bàn cờ A3 và hộp game' },
      ],
    },
    lockedFeatures: ['bộ đôi thẻ bài tương khắc Lửa và Nước', 'vòng tròn mũi tên nguyên tố đối kháng', 'bảng 5 câu hỏi luật chơi chuẩn chỉnh'],
    pinnedTags: ['luật chơi 5 phần', 'bộ đôi tương khắc', 'Lửa vs Nước'],
    quickSuggestions: [
      'Bộ đôi thẻ tương khắc: Phượng Hoàng Lửa đối đầu Thủy Long',
      'vòng tròn ngũ hành mũi tên nguyên tố đối kháng',
      '5 câu hỏi luật chơi ngắn gọn, công bằng và dễ hiểu',
    ],
    akiMotto: 'Luật chơi là linh hồn của trò chơi! 5 câu hỏi luật chơi rõ ràng và quy tắc tương khắc giúp trận đấu kịch tính đến phút cuối!',
    initialAkiMessage:
      'Chào Nhà Thiết Kế Luật Chơi! Thẻ đẹp đến mấy mà không có luật thì cũng chẳng chơi được! Cùng trả lời 5 câu hỏi và tạo bộ đôi tương khắc nào!',
    initialPrompt: 'Bộ đôi thẻ bài ma thuật tương khắc Lửa và Nước: Phượng Hoàng Lửa đối đầu Thủy Long với vòng tròn mũi tên nguyên tố',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Thiết lập quy tắc tương khắc nguyên tố',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy thiết lập quy tắc tương khắc: Nước dập Lửa (+3 điểm thưởng), Lửa đốt Cây, Cây hút Nước nhé!',
          quickPrompt: 'Quy tắc tương khắc: Hệ Nước khắc chế Hệ Lửa được cộng 3 điểm',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson4_opt_a.jpg',
          akiFeedback: 'Rất kịch tính! Lá bài yếu hơn hoàn toàn có thể lật kèo nhờ hệ tương khắc! Sang Bước 2: Trả lời 5 câu hỏi luật chơi nào!',
          lockedFeaturesAtStep: ['tương khắc nguyên tố', 'điểm thưởng khắc hệ'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Soạn thảo 5 câu hỏi luật chơi cốt lõi',
          akiInstruction: 'Bé hãy trả lời 5 câu: 1. 2 người chơi · 2. Oẳn tù tì đi trước · 3. Mỗi lượt rút 1 lá chọn chỉ số · 4. So điểm + tương khắc · 5. Thắng 5 vòng là thắng!',
          quickPrompt: 'Bộ luật 5 phần: 2 người chơi, oẳn tù tì đi trước, so chỉ số và tương khắc, thắng 5 vòng',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson4_rules.jpg',
          akiFeedback: 'Luật chơi cực kỳ rõ ràng, ai đọc vào cũng hiểu ngay! Sang Bước 3: Tạo bộ đôi thẻ bài tương khắc nhé!',
          lockedFeaturesAtStep: ['5 câu hỏi luật chơi', 'điều kiện thắng 5 vòng'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Tạo bộ đôi thẻ bài tương khắc Lửa vs Nước',
          akiInstruction: 'Bước quyết định: "Bộ đôi thẻ bài ma thuật tương khắc Lửa và Nước: Phượng Hoàng Lửa đối đầu Thủy Long với vòng tròn mũi tên nguyên tố"!',
          quickPrompt: 'Bộ đôi thẻ bài ma thuật tương khắc Lửa và Nước: Phượng Hoàng Lửa đối đầu Thủy Long với vòng tròn mũi tên nguyên tố',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson4_rules.jpg',
          akiFeedback: '🎉 Trận đối đầu rực lửa và cuộn sóng! Bộ đôi tương khắc hoàn hảo kèm bản luật chơi 5 phần rõ ràng! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['bộ đôi Phượng Hoàng Lửa và Thủy Long', 'vòng tròn tương khắc'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Soi bản luật & nộp vào Balo',
          akiInstruction: 'Bé hãy chơi thử 1 ván với người thân, kiểm tra lại luật chơi và bấm Nộp Bài để cất vào Balo Sáng Tạo nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson4_rules.jpg',
          akiFeedback: 'Bộ Luật Đấu Trường chính thức có hiệu lực thi đấu! Sẵn sàng khai mở đấu trường ở bài tốt nghiệp cuối cùng nào! 🏆',
          lockedFeaturesAtStep: ['bộ luật 5 phần', 'bộ đôi tương khắc'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-5-4-1', turn: 1, prompt: 'Vòng tròn ngũ hành mũi tên nguyên tố tương khắc', time: '20:30', toneBg: 'bg-rose-100', url: '/assets/aiki-islands/island5_lesson4_opt_a.jpg' },
      { id: 'img-5-4-2', turn: 2, prompt: 'Bộ đôi thẻ bài tương khắc Phượng Hoàng Lửa và Thủy Long kèm bản luật chơi', time: '20:45', toneBg: 'bg-sky-100', url: '/assets/aiki-islands/island5_lesson4_rules.jpg' },
    ],
    verificationQuestion: {
      question: 'Bộ luật đã trả lời đủ 5 câu hỏi cốt lõi và có quy tắc tương khắc nguyên tố công bằng chưa?',
      criteria: ['Đủ 5 câu hỏi luật chơi ngắn gọn', 'Quy tắc tương khắc nguyên tố rõ ràng', 'Không có điểm gây tranh cãi khi chơi thật'],
    },
    illustrationType: 'elemental-duo',
  },

  'bai-5-5': {
    lessonId: 'bai-5-5-dau-truong-khai-mo',
    subjectName: 'Hộp Game & Đấu Trường Thần Thoại',
    badge: 'Bài 5.5',
    missionChecklist: [
      { id: '1', label: 'Thiết kế bàn cờ 4 thành phần (Xuất phát - Đích)', done: true },
      { id: '2', label: 'Thiết kế vỏ hộp gấp đựng trọn bộ 12 thẻ bài', done: true },
      { id: '3', label: 'Hoàn thiện Đấu trường thần thoại kèm Cúp Vô Địch', inProgress: true },
      { id: '4', label: 'Chơi thật 1 ván với gia đình tốt nghiệp khóa học' },
    ],
    featuresAvailable: {
      opened: [
        { title: 'Bàn cờ 4 thành phần hoàn chỉnh', desc: 'Xuất phát · Đường đi các ô · Ô sự kiện thử thách · Ô Đích vinh quang' },
        { title: 'Vỏ hộp game gấp được & Cúp tốt nghiệp', desc: 'Đóng gói trọn vẹn bộ game để chơi cùng gia đình' },
      ],
      locked: [
        { title: 'Khóa học hoàn tất 100%!', desc: 'Chúc mừng bé đã tốt nghiệp xuất sắc tất cả 5 Đảo AI Kids!' },
      ],
    },
    lockedFeatures: ['bàn cờ A3 đủ 4 thành phần: Xuất phát - Đường đi - Ô đặc biệt - Đích', 'vỏ hộp game gấp được đựng trọn bộ 12 thẻ', 'cúp vô địch giải đấu gia đình'],
    pinnedTags: ['đấu trường khai mở', 'bàn cờ A3', 'vỏ hộp game', 'tốt nghiệp AI Kids'],
    quickSuggestions: [
      'Bàn cờ A3 Đấu trường thần thoại đủ 4 thành phần hoàn chỉnh',
      'vỏ hộp game gấp được in màu rực rỡ đựng trọn bộ thẻ bài',
      'chiếc cúp vàng vô địch giải đấu gia đình rực rỡ pháo hoa',
    ],
    akiMotto: 'Sản phẩm chỉ thật sự hoàn thành khi được mang ra chơi thật với cả nhà! Khai mạc giải đấu gia đình và cùng cười thật to nhé!',
    initialAkiMessage:
      'Chúc mừng Nhà Phát Minh Trò Chơi Đại Tài! Hôm nay là bài CUỐI CÙNG của cả khóa học! Cùng làm nốt bàn cờ, vỏ hộp và khai mạc giải đấu gia đình để nâng Cúp Vô Địch nào!',
    initialPrompt: 'Bàn cờ A3 Đấu trường thần thoại với vạch xuất phát, đường đi ziczac, ô sự kiện kho báu và ô đích vinh quang cùng cúp vàng chiến thắng',
    practiceWorkflow: {
      steps: [
        {
          stepIndex: 1,
          taskLabel: 'Thiết kế bàn cờ 4 thành phần trên khổ A3',
          akiInstruction: 'Chào bé! Đầu tiên bé hãy thiết kế bàn cờ đủ 4 thứ: 1. Ô Xuất phát · 2. Đường đi 24 ô · 3. Ô đặc biệt (Rương kho báu / Bẫy) · 4. Ô ĐÍCH Đỉnh Băng nhé!',
          quickPrompt: 'Bàn cờ A3 Đấu trường thần thoại với vạch xuất phát, 24 ô đường đi, ô kho báu và ô Đích vinh quang',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson5_opt_a.jpg',
          akiFeedback: 'Tuyệt đẹp! Có ô Đích thì người chơi mới biết đi đến đâu là thắng! Sang Bước 2: Thiết kế vỏ hộp đựng game nào!',
          lockedFeaturesAtStep: ['bàn cờ 4 thành phần', 'ô xuất phát và ô đích'],
        },
        {
          stepIndex: 2,
          taskLabel: 'Thiết kế vỏ hộp game gấp được chuyên nghiệp',
          akiInstruction: 'Bé hãy thiết kế bản rập vỏ hộp game: Đựng vừa 12 lá bài, xúc xắc và bản luật chơi gập gọn!',
          quickPrompt: 'Vỏ hộp game bài gấp được in hình Rồng Băng Tinh Thể rực rỡ và logo Nhà Phát Minh Trò Chơi',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson5_arena.jpg',
          akiFeedback: 'Oa! Chiếc hộp game xịn sò như mua ở hiệu sách lớn! Sang Bước 3: Hoàn thiện đấu trường và Cúp Vô Địch nhé!',
          lockedFeaturesAtStep: ['vỏ hộp game gấp được', 'đựng trọn bộ 12 thẻ'],
        },
        {
          stepIndex: 3,
          taskLabel: 'Hoàn thiện Đấu trường thần thoại & Cúp Vô Địch',
          akiInstruction: 'Bước quyết định: "Bàn cờ A3 Đấu trường thần thoại với vạch xuất phát, đường đi ziczac, ô sự kiện kho báu và ô đích vinh quang cùng cúp vàng chiến thắng"!',
          quickPrompt: 'Bàn cờ A3 Đấu trường thần thoại với vạch xuất phát, đường đi ziczac, ô sự kiện kho báu và ô đích vinh quang cùng cúp vàng chiến thắng',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson5_arena.jpg',
          akiFeedback: '🎉 Trọn bộ sản phẩm trò chơi hoàn hảo: Thẻ bài, Bàn cờ A3, Luật chơi và Vỏ hộp gấp! Cúp Vô Địch Vàng rực rỡ đã sẵn sàng trao tay bé! Bé hãy soi kỹ và nộp bài nhé!',
          lockedFeaturesAtStep: ['trọn bộ game bàn cờ A3', 'cúp vô địch vàng'],
        },
        {
          stepIndex: 4,
          taskLabel: 'Chơi thật với gia đình & nhận Cúp Tốt Nghiệp',
          akiInstruction: 'Nhiệm vụ tối thượng: Rủ cả nhà chơi 1 ván thật, quay clip kỷ niệm 30 giây và bấm Nộp Bài để chính thức Tốt Nghiệp Khóa Học AI Kids nhé!',
          quickPrompt: '',
          sampleResultUrl: '/assets/aiki-islands/island5_lesson5_arena.jpg',
          akiFeedback: '🎉 🏆 CHÚC MỪNG BÉ ĐÃ TỐT NGHIỆP XUẤT SẮC TOÀN BỘ KHÓA HỌC AI KIDS! BÉ LÀ MỘT NHÀ SÁNG TẠO AI ĐẦY TÀI NĂNG VÀ TRÁCH NHIỆM! TỚ TỰ HÀO VỀ BÉ! 🌟',
          lockedFeaturesAtStep: ['tốt nghiệp xuất sắc', 'cúp vàng vô địch'],
        },
      ],
    },
    preloadedImages: [
      { id: 'img-5-5-1', turn: 1, prompt: 'Bàn cờ A3 đủ 4 thành phần Xuất phát, Đường đi, Ô sự kiện, Đích', time: '21:00', toneBg: 'bg-amber-100', url: '/assets/aiki-islands/island5_lesson5_opt_a.jpg' },
      { id: 'img-5-5-2', turn: 2, prompt: 'Trọn bộ sản phẩm trò chơi bàn cờ A3, vỏ hộp game gấp và cúp vô địch vàng', time: '21:15', toneBg: 'bg-emerald-100', url: '/assets/aiki-islands/island5_lesson5_arena.jpg' },
    ],
    verificationQuestion: {
      question: 'Bộ trò chơi đã hoàn thiện trọn bộ (Bàn cờ 4 thành phần, 12 thẻ bài, luật chơi, vỏ hộp) và sẵn sàng chơi thật chưa?',
      criteria: ['Bàn cờ có đủ Xuất phát, Đường đi, Ô đặc biệt, Đích', 'Vỏ hộp đựng vừa vặn trọn bộ game', 'Đã rủ gia đình chơi thử thật'],
    },
    illustrationType: 'board-game-arena',
  },
};


function resolveRawAikiStudioConfig(
  questId?: string,
  questTitle?: string,
  courseId?: string
): AikiStudioConfig {
  const cleanId = (questId || '').toLowerCase().trim()
  const cleanTitle = (questTitle || '').toLowerCase().trim()
  const cleanCourse = (courseId || '').toLowerCase().trim()

  // 1. Khớp exact key trong dictionary
  if (cleanId && AIKI_STUDIO_CONFIGS[cleanId]) {
    return AIKI_STUDIO_CONFIGS[cleanId]
  }

  // 2. Tìm theo slug của bài học đảo (dạng bai-X-Y)
  for (const [key, config] of Object.entries(AIKI_STUDIO_CONFIGS)) {
    if (cleanId === config.lessonId || cleanId.includes(key)) {
      return config
    }
  }

  // 3. Phân tích regex dạng "bai-1-1", "bai-1.1", "1.1", "1-1", "bài 1.1", "bai 1 1"
  const islandMatch =
    cleanId.match(/(?:bai|island|bài)[-_ ]?([1-5])[-_. ]([1-5])/) ||
    cleanId.match(/^([1-5])[-_. ]([1-5])$/) ||
    cleanTitle.match(/(?:bài|bai)[-_ ]?([1-5])[-_. ]([1-5])/) ||
    cleanTitle.match(/^([1-5])[-_. ]([1-5])/)

  if (islandMatch) {
    const key = `bai-${islandMatch[1]}-${islandMatch[2]}`
    if (AIKI_STUDIO_CONFIGS[key]) {
      return AIKI_STUDIO_CONFIGS[key]
    }
  }

  // 4. Khớp theo từ khóa tiêu đề hoặc nhân vật
  if (cleanTitle.includes('mèo') || cleanTitle.includes('năm từ') || cleanTitle.includes('1.1')) {
    return AIKI_STUDIO_CONFIGS['bai-1-1']
  }
  if (cleanTitle.includes('chìa khoá') || cleanTitle.includes('cà rốt') || cleanTitle.includes('1.2')) {
    return AIKI_STUDIO_CONFIGS['bai-1-2']
  }
  if (cleanTitle.includes('biến hình') || cleanTitle.includes('kẹo ngọt') || cleanTitle.includes('1.3')) {
    return AIKI_STUDIO_CONFIGS['bai-1-3']
  }
  if (cleanTitle.includes('kỹ sư') || cleanTitle.includes('bàn tay') || cleanTitle.includes('1.4')) {
    return AIKI_STUDIO_CONFIGS['bai-1-4']
  }
  if (cleanTitle.includes('bức tranh biết nói') || cleanTitle.includes('khu rừng') || cleanTitle.includes('2.1')) {
    return AIKI_STUDIO_CONFIGS['bai-2-1']
  }
  if (cleanTitle.includes('ngôi sao') || cleanTitle.includes('thuyền buồm') || cleanTitle.includes('2.2')) {
    return AIKI_STUDIO_CONFIGS['bai-2-2']
  }
  if (cleanTitle.includes('sắc màu') || cleanTitle.includes('hải đăng') || cleanTitle.includes('2.3')) {
    return AIKI_STUDIO_CONFIGS['bai-2-3']
  }
  if (cleanTitle.includes('mảnh ghép') || cleanTitle.includes('sinh nhật') || cleanTitle.includes('2.4')) {
    return AIKI_STUDIO_CONFIGS['bai-2-4']
  }
  if (cleanTitle.includes('hồ sơ') || cleanTitle.includes('cáo lửa') || cleanTitle.includes('3.1')) {
    return AIKI_STUDIO_CONFIGS['bai-3-1']
  }
  if (cleanTitle.includes('mật mã') || cleanTitle.includes('sóc bông') || cleanTitle.includes('3.2')) {
    return AIKI_STUDIO_CONFIGS['bai-3-2']
  }
  if (cleanTitle.includes('biểu cảm') || cleanTitle.includes('3.3')) {
    return AIKI_STUDIO_CONFIGS['bai-3-3']
  }
  if (cleanTitle.includes('căn cứ') || cleanTitle.includes('3.4')) {
    return AIKI_STUDIO_CONFIGS['bai-3-4']
  }
  if (cleanTitle.includes('3 cổng') || cleanTitle.includes('vương quốc') || cleanTitle.includes('4.1')) {
    return AIKI_STUDIO_CONFIGS['bai-4-1']
  }
  if (cleanTitle.includes('4 chặng') || cleanTitle.includes('thử thách') || cleanTitle.includes('4.2')) {
    return AIKI_STUDIO_CONFIGS['bai-4-2']
  }
  if (cleanTitle.includes('bản đồ 8 ô - p1') || cleanTitle.includes('phần 1: mở') || cleanTitle.includes('4.3')) {
    return AIKI_STUDIO_CONFIGS['bai-4-3']
  }
  if (cleanTitle.includes('bản đồ 8 ô - p2') || cleanTitle.includes('phần 2: khoá') || cleanTitle.includes('4.4')) {
    return AIKI_STUDIO_CONFIGS['bai-4-4']
  }
  if (cleanTitle.includes('vương miện') || cleanTitle.includes('bìa') || cleanTitle.includes('4.5')) {
    return AIKI_STUDIO_CONFIGS['bai-4-5']
  }
  if (cleanTitle.includes('săn lùng') || cleanTitle.includes('bộ sưu tập') || cleanTitle.includes('5.1')) {
    return AIKI_STUDIO_CONFIGS['bai-5-1']
  }
  if (cleanTitle.includes('mặt thẻ') || cleanTitle.includes('phù phép') || cleanTitle.includes('5.2')) {
    return AIKI_STUDIO_CONFIGS['bai-5-2']
  }
  if (cleanTitle.includes('khoá thẻ') || cleanTitle.includes('lưng thẻ') || cleanTitle.includes('5.3')) {
    return AIKI_STUDIO_CONFIGS['bai-5-3']
  }
  if (cleanTitle.includes('luật chơi') || cleanTitle.includes('tương khắc') || cleanTitle.includes('5.4')) {
    return AIKI_STUDIO_CONFIGS['bai-5-4']
  }
  if (cleanTitle.includes('đấu trường') || cleanTitle.includes('hộp game') || cleanTitle.includes('5.5')) {
    return AIKI_STUDIO_CONFIGS['bai-5-5']
  }

  // 5. Nếu liên quan đến 10 Quy Tắc Vàng (QT1 -> QT10)
  if (cleanId.includes('qt') || cleanId.includes('rule') || cleanCourse.includes('rules') || cleanTitle.includes('quy tắc')) {
    const ruleMatch = cleanId.match(/(?:qt|rule)[-_ ]?(\d+)/) || cleanTitle.match(/(?:quy tắc|qt|rule)[-_ ]?(\d+)/)
    const ruleNum = ruleMatch ? parseInt(ruleMatch[1], 10) : 1

    if (ruleNum === 1) {
      return {
        lessonId: `rule-${ruleNum}`,
        subjectName: 'Siêu Anh Hùng Bố Với Chiếc Vợt Muỗi',
        badge: 'QT 1',
        missionChecklist: [
          { id: '1', label: 'Dừng lại 30 giây nghĩ ý tưởng riêng', done: true },
          { id: '2', label: 'Viết ra điểm độc nhất vô nhị (Bố sợ gián, vợt muỗi)', done: true },
          { id: '3', label: 'Bắt AIKI vẽ siêu anh hùng có một không hai', inProgress: true },
          { id: '4', label: 'Nộp tác phẩm độc bản nhận huy hiệu QT1' },
        ],
        featuresAvailable: {
          opened: [
            { title: 'Vẽ siêu anh hùng bố với chiếc vợt muỗi', desc: 'Chi tiết độc đáo do chính em nghĩ ra' },
            { title: 'Thêm áo choàng hoa văn tạp dề ngộ nghĩnh', desc: 'Tôn vinh trí tưởng tượng không giới hạn' },
          ],
          locked: [
            { title: 'Dùng mẫu có sẵn trên mạng — cấm sao chép', desc: 'Quy tắc 1 bắt buộc nghĩ ý tưởng trước' },
          ],
        },
        lockedFeatures: ['siêu anh hùng bố cầm chiếc vợt muỗi', 'áo choàng hoa văn ngộ nghĩnh', 'vẻ mặt hài hước dũng cảm'],
        pinnedTags: ['ý tưởng riêng độc đáo', 'siêu anh hùng bố', 'vợt muỗi thần kỳ'],
        quickSuggestions: [
          'đang giơ chiếc vợt muỗi phát sáng giải cứu căn bếp',
          'áo choàng tung bay trong ánh đèn phòng khách ấm áp',
          'vẻ mặt quyết tâm pha chút hóm hỉnh đáng yêu',
        ],
        akiMotto: 'Hãy nghĩ ý tưởng của cậu, rồi mới chia sẻ với AIKI nhé! Cậu nghĩ trước thì tranh mới độc nhất vô nhị!',
        initialAkiMessage:
          'Chào Hiệp Sĩ Ý Tưởng! Đừng để tớ chọn hộ nhân vật quen thuộc, hãy cho tớ biết ý tưởng độc nhất của riêng cậu nào!',
        initialPrompt: 'Siêu anh hùng bố cầm chiếc vợt muỗi phát sáng, áo choàng hoa văn bay phấp phới trong phòng khách ấm cúng',
        preloadedImages: [
          {
            id: 'img-qt-1-1',
            turn: 1,
            prompt: 'Siêu anh hùng cầm vợt muỗi',
            time: '08:00',
            toneBg: 'bg-amber-100',
            url: '/assets/aiki-rules/rule1_opt_sonet.jpg',
          },
          {
            id: 'img-qt-1-2',
            turn: 2,
            prompt: 'Siêu anh hùng bố vỗ khẽ chiếc vợt muỗi giải cứu gian bếp',
            time: '08:08',
            toneBg: 'bg-rose-100',
            url: '/assets/aiki-rules/rule1_superhero_dad.jpg',
          },
        ],
        verificationQuestion: {
          question: 'Ý tưởng này đã có chi tiết độc nhất vô nhị mà chỉ riêng em nghĩ ra chưa?',
          criteria: ['Siêu anh hùng bố thân quen', 'Chiếc vợt muỗi độc đáo', 'Trí tưởng tượng riêng biệt'],
        },
        illustrationType: 'generic',
      }
    }

    const mappedIslandKey =
      ruleNum === 2 ? 'bai-1-2' :
      ruleNum === 3 ? 'bai-1-3' :
      ruleNum === 4 ? 'bai-1-4' :
      ruleNum === 5 ? 'bai-2-1' :
      ruleNum === 6 ? 'bai-2-2' :
      ruleNum === 7 ? 'bai-3-2' :
      ruleNum === 8 ? 'bai-3-3' :
      ruleNum === 9 ? 'bai-4-1' :
      'bai-5-4'

    const baseConfig = AIKI_STUDIO_CONFIGS[mappedIslandKey]
    return {
      ...baseConfig,
      badge: `QT ${ruleNum}`,
      lessonId: `rule-${ruleNum}`,
    }
  }

  // 6. Default fallback: Bài 3.2 Sóc Bông chuẩn mực (khớp 100% test và mockup)
  return AIKI_STUDIO_CONFIGS['bai-3-2']
}

// ────────────────────────────────────────────────────────────────────────────
// HÀM TRA CỨU CONFIG CHUẨN XÁC VÀ THÔNG MINH KÈM WORKFLOW ĐỒNG BỘ
// ────────────────────────────────────────────────────────────────────────────
export function getAikiStudioConfig(
  questId?: string,
  questTitle?: string,
  courseId?: string
): AikiStudioConfig {
  const raw = resolveRawAikiStudioConfig(questId, questTitle, courseId)
  if (!raw.practiceWorkflow) {
    return {
      ...raw,
      practiceWorkflow: createDefaultPracticeWorkflow(raw),
    }
  }
  return raw
}
