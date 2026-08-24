import type { AsmoExplanationStep, AsmoQuestion, AsmoTemplateKey, AsmoVisualSpec } from '../types'

export const GRID_MAZE_10_PATHS: Array<{
  name: string
  code: string
  points: [number, number][]
  description: string
}> = [
  {
    name: 'Đường 1',
    code: '→ → → ↑ ↑',
    points: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2]],
    description: 'Đi hết 3 bước sang phải rồi đi 2 bước lên trên.',
  },
  {
    name: 'Đường 2',
    code: '→ → ↑ → ↑',
    points: [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [3, 2]],
    description: 'Sang phải 2 bước, lên 1 bước, sang phải 1 bước, lên 1 bước.',
  },
  {
    name: 'Đường 3',
    code: '→ → ↑ ↑ →',
    points: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2]],
    description: 'Sang phải 2 bước, lên 2 bước, sang phải 1 bước.',
  },
  {
    name: 'Đường 4',
    code: '→ ↑ → → ↑',
    points: [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]],
    description: 'Sang phải 1 bước, lên 1 bước, sang phải 2 bước, lên 1 bước.',
  },
  {
    name: 'Đường 5',
    code: '→ ↑ → ↑ →',
    points: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
    description: 'Đi zíc-zắc: sang phải, lên, sang phải, lên, sang phải.',
  },
  {
    name: 'Đường 6',
    code: '→ ↑ ↑ → →',
    points: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2], [3, 2]],
    description: 'Sang phải 1 bước, lên hết 2 bước, sang phải 2 bước.',
  },
  {
    name: 'Đường 7',
    code: '↑ → → → ↑',
    points: [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],
    description: 'Lên 1 bước, sang phải 3 bước, lên 1 bước.',
  },
  {
    name: 'Đường 8',
    code: '↑ → → ↑ →',
    points: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [3, 2]],
    description: 'Lên 1 bước, sang phải 2 bước, lên 1 bước, sang phải 1 bước.',
  },
  {
    name: 'Đường 9',
    code: '↑ → ↑ → →',
    points: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [3, 2]],
    description: 'Lên 1 bước, sang phải 1 bước, lên 1 bước, sang phải 2 bước.',
  },
  {
    name: 'Đường 10',
    code: '↑ ↑ → → →',
    points: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2]],
    description: 'Đi hết 2 bước lên trên rồi đi 3 bước sang phải.',
  },
]

export type Asmo3DTemplateConfig = {
  key: AsmoTemplateKey
  title: string
  subtitle: string
  icon: string
  difficulty: 'Cơ bản' | 'Trung bình' | 'Thử thách'
  topicBadge: string
  renderSpec: AsmoVisualSpec
  problem: AsmoQuestion
  interactiveActions: Array<{
    id: string
    label: string
    icon: string
    description: string
  }>
}

export const ASMO_3D_TEMPLATES: Record<AsmoTemplateKey, Asmo3DTemplateConfig> = {
  '3D_CUBE_CLUSTER': {
    key: '3D_CUBE_CLUSTER',
    title: '1. Đếm Khối Lập Phương 3D',
    subtitle: 'Đếm các khối nhìn thấy và khối bị che khuất theo tầng',
    icon: '🧱',
    difficulty: 'Cơ bản',
    topicBadge: 'MATH_GEO_3D_COUNT',
    renderSpec: {
      template: '3D_CUBE_CLUSTER',
      camera: { x: 4.5, y: 3.5, z: 4.5 },
      autoRotate: false,
      cubes: [
        [0, 0, 0],
        [1, 0, 0],
        [0, 0, 1],
        [1, 0, 1],
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 1],
        [0, 2, 0],
      ],
    },
    problem: {
      id: 'asmo-math-g1-q05',
      subject: 'math',
      grade: 1,
      topicCode: 'MATH_GEO_3D_COUNT',
      topicName: 'Đếm khối lập phương',
      title: 'Đếm Khối Lập Phương Xếp Tầng (ASMO Toán Lớp 1)',
      text: 'Hình khối không gian dưới đây được xếp từ bao nhiêu khối lập phương nhỏ cùng kích thước $(1\\text{ cm}^3)$?',
      options: [
        { id: 'A', label: 'A', text: '6 khối' },
        { id: 'B', label: 'B', text: '7 khối' },
        { id: 'C', label: 'C', text: '8 khối' },
        { id: 'D', label: 'D', text: '9 khối' },
      ],
      correctAnswer: 'C',
      meeHint: 'Mèo Mee gợi ý: Con hãy đếm từ tầng dưới cùng lên tầng trên cùng nhé! Tầng 1 (đáy) có 4 khối, tầng 2 có 3 khối và tầng 3 có 1 khối.',
      explanation: 'Ta đếm số khối theo từng tầng:\n• Tầng 1 (đáy): $2 \\times 2 = 4\\text{ khối}$\n• Tầng 2 (giữa): $3\\text{ khối}$\n• Tầng 3 (đỉnh): $1\\text{ khối}$\n➔ Tổng số khối $= 4 + 3 + 1 = 8\\text{ khối}$.',
      points: 4,
      diagramDescription: 'Khối tháp 3D xếp bằng các hình lập phương nhỏ',
      explanationSteps: [
        { stepIndex: 1, title: 'Tầng 1 (Đáy)', description: 'Tầng đáy gồm 4 khối lập phương xếp 2x2.', layerIndex: 0 },
        { stepIndex: 2, title: 'Tầng 2 (Giữa)', description: 'Tầng giữa có 3 khối (1 khối góc bị khuyết).', layerIndex: 1 },
        { stepIndex: 3, title: 'Tầng 3 (Đỉnh)', description: 'Tầng đỉnh có 1 khối trên cao nhất.', layerIndex: 2 },
        { stepIndex: 4, title: 'Tổng cộng', description: '4 + 3 + 1 = 8 khối lập phương.', layerIndex: -1 },
      ],
    },
    interactiveActions: [
      { id: 'highlight', label: 'Tô màu từng khối', icon: '✨', description: 'Đổi màu từng khối để không bị đếm sót' },
      { id: 'xray', label: 'Chế độ X-Ray', icon: '📦', description: 'Xem xuyên thấu các khối bị che ở phía sau' },
      { id: 'reset', label: 'Góc nhìn chuẩn', icon: '🔄', description: 'Đặt lại vị trí camera ban đầu' },
    ],
  },

  'GRID_PATH_MAZE': {
    key: 'GRID_PATH_MAZE',
    title: '2. Đường Đi Ngắn Nhất Trên Lưới',
    subtitle: 'Tìm số cách di chuyển từ điểm A đến B trên lưới ô vuông',
    icon: '🗺️',
    difficulty: 'Trung bình',
    topicBadge: 'MATH_COMB_GRID_PATH',
    renderSpec: {
      template: 'GRID_PATH_MAZE',
      camera: { x: 0, y: 0, z: 5.5 },
      autoRotate: false,
      gridSize: [3, 2],
      start: [0, 0],
      target: [3, 2],
    },
    problem: {
      id: 'asmo-math-g1-q22',
      subject: 'math',
      grade: 1,
      topicCode: 'MATH_COMB_GRID_PATH',
      topicName: 'Tổ hợp đường đi lưới',
      title: 'Tìm Đường Đi Ngắn Nhất (ASMO Toán Lớp 1-2)',
      text: 'Chú kiến cần đi từ điểm $A(0,0)$ đến điểm $B(3,2)$ trên lưới ô vuông. Nếu chú kiến chỉ được đi sang phải $(\\rightarrow)$ hoặc đi lên trên $(\\uparrow)$, có tất cả bao nhiêu con đường đi khác nhau?',
      options: [
        { id: 'A', label: 'A', text: '6 đường' },
        { id: 'B', label: 'B', text: '8 đường' },
        { id: 'C', label: 'C', text: '10 đường' },
        { id: 'D', label: 'D', text: '12 đường' },
      ],
      correctAnswer: 'C',
      meeHint: 'Mèo Mee gợi ý: Để đi từ A đến B, chú kiến phải đi đúng 3 bước sang phải và 2 bước lên trên (tổng cộng 5 bước). Con hãy bấm vào từng con đường bên dưới để xem mô phỏng nhé!',
      explanation: 'Tổng số bước chú kiến phải đi là: $3 + 2 = 5\\text{ bước}$.\nSố con đường đi chính là số cách chọn 2 bước đi lên trong 5 bước:\n$$\\binom{5}{2} = \\frac{5 \\times 4}{2 \\times 1} = 10\\text{ con đường}.$$',
      points: 5,
      explanationSteps: GRID_MAZE_10_PATHS.map((p, idx) => ({
        stepIndex: idx + 1,
        title: `${p.name}: ${p.code}`,
        description: p.description,
        code: p.code,
        points: p.points,
      })),
    },
    interactiveActions: [
      { id: 'toggle-path', label: 'Bật/Tắt mẫu đường đi', icon: '🛣️', description: 'Xem mẫu đường đi mẫu phát sáng màu Cyan' },
      { id: 'reset', label: 'Đặt lại góc nhìn', icon: '🔄', description: 'Căn chỉnh lưới nhìn trực diện' },
    ],
  },

  'INTERACTIVE_CLOCK': {
    key: 'INTERACTIVE_CLOCK',
    title: '3. Đồng Hồ Kim 3D & Góc Quay',
    subtitle: 'Đọc giờ chính xác và quan sát góc tạo bởi kim giờ và kim phút',
    icon: '⏰',
    difficulty: 'Cơ bản',
    topicBadge: 'MATH_TIME_CLOCK',
    renderSpec: {
      template: 'INTERACTIVE_CLOCK',
      camera: { x: 0, y: 0, z: 5.5 },
      autoRotate: false,
      hour: 4,
      minute: 10,
    },
    problem: {
      id: 'asmo-math-g1-q17',
      subject: 'math',
      grade: 1,
      topicCode: 'MATH_TIME_CLOCK',
      topicName: 'Thời gian & Mặt đồng hồ',
      title: 'Đọc Giờ Trên Đồng Hồ (ASMO Toán Lớp 1)',
      text: 'Mặt đồng hồ 3D trong hình bên đang chỉ mấy giờ buổi chiều?',
      options: [
        { id: 'A', label: 'A', text: '4:10 p.m.' },
        { id: 'B', label: 'B', text: '5:10 p.m.' },
        { id: 'C', label: 'C', text: '4:11 p.m.' },
        { id: 'D', label: 'D', text: '5:11 p.m.' },
      ],
      correctAnswer: 'A',
      meeHint: 'Mèo Mee gợi ý: Kim ngắn màu đỏ chỉ giờ (ở giữa số 4 và 5), kim dài màu xanh chỉ phút (chỉ vào số 2 tương ứng $2 \\times 5 = 10\\text{ phút}$).',
      explanation: '• Kim giờ ngắn (màu đỏ) vừa qua vạch số 4 ➔ 4 giờ.\n• Kim phút dài (màu xanh lam) chỉ vào số 2 ➔ $2 \\times 5 = 10\\text{ phút}$.\n• Buổi chiều ➔ Thời gian chính xác là 4:10 p.m.',
      points: 3,
      explanationSteps: [
        { stepIndex: 1, title: 'Kim giờ (Màu đỏ)', description: 'Kim ngắn màu đỏ nằm qua vạch số 4 ➔ 4 giờ.', hour: 4, minute: 0 },
        { stepIndex: 2, title: 'Kim phút (Màu xanh)', description: 'Kim dài màu xanh chỉ số 2 ➔ 2 x 5 = 10 phút.', hour: 4, minute: 10 },
        { stepIndex: 3, title: 'Thời gian hoàn chỉnh', description: 'Đồng hồ chỉ chính xác 4:10 p.m.', hour: 4, minute: 10 },
      ],
    },
    interactiveActions: [
      { id: 'advance-time', label: '+15 phút', icon: '⏩', description: 'Tua kim đồng hồ về phía trước' },
      { id: 'reset', label: 'Giờ ban đầu', icon: '🔄', description: 'Khôi phục về 4:10' },
    ],
  },

  'SHADED_AREA_FRACTION': {
    key: 'SHADED_AREA_FRACTION',
    title: '4. Phân Số Diện Tích Hình Học',
    subtitle: 'Xác định tỉ lệ phần diện tích được tô màu và phần còn lại',
    icon: '🍕',
    difficulty: 'Trung bình',
    topicBadge: 'MATH_GEO_FRACTION',
    renderSpec: {
      template: 'SHADED_AREA_FRACTION',
      camera: { x: 0, y: 0, z: 5.5 },
      autoRotate: false,
      totalSlices: 10,
      shadedSlices: 7,
    },
    problem: {
      id: 'asmo-math-g3-q03',
      subject: 'math',
      grade: 3,
      topicCode: 'MATH_GEO_FRACTION',
      topicName: 'Phân số hình học',
      title: 'Phân Số Phần Còn Lại (ASMO Toán Lớp 3)',
      text: 'Một chiếc bánh pizza tròn được chia đều thành 10 phần bằng nhau. Người ta đã ăn 3 phần. Hỏi phân số biểu thị phần bánh còn lại là bao nhiêu?',
      options: [
        { id: 'A', label: 'A', text: '$\\frac{3}{10}$' },
        { id: 'B', label: 'B', text: '$\\frac{5}{10}$' },
        { id: 'C', label: 'C', text: '$\\frac{7}{10}$' },
        { id: 'D', label: 'D', text: '$\\frac{8}{10}$' },
      ],
      correctAnswer: 'C',
      meeHint: 'Mèo Mee gợi ý: Chiếc bánh có tất cả 10 phần. Đã ăn 3 phần thì còn lại bao nhiêu phần màu xanh nhỉ? Lấy $10 - 3$ con nhé!',
      explanation: 'Tổng số phần bằng nhau là 10.\nSố phần còn lại sau khi ăn 3 phần: $10 - 3 = 7\\text{ phần}$.\nPhân số biểu thị phần còn lại là: $\\frac{7}{10}$.',
      points: 4,
      explanationSteps: [
        { stepIndex: 1, title: 'Toàn bộ chiếc bánh', description: 'Chiếc bánh tròn chia làm 10 phần bằng nhau (10/10).', shadedCount: 10 },
        { stepIndex: 2, title: 'Đã ăn 3 phần', description: '3 phần bị ăn mất (màu xám tối).', shadedCount: 7 },
        { stepIndex: 3, title: 'Phần còn lại', description: 'Còn lại đúng 7 phần màu xanh ➔ Phân số 7/10.', shadedCount: 7 },
      ],
    },
    interactiveActions: [
      { id: 'rotate', label: 'Xoay góc 3D', icon: '🌀', description: 'Nghiêng góc nhìn để xem độ dày khối' },
      { id: 'reset', label: 'Nhìn trực diện', icon: '🔄', description: 'Xem thẳng từ phía trước' },
    ],
  },

  'MATCHSTICK_FIGURE': {
    key: 'MATCHSTICK_FIGURE',
    title: '5. Que Diêm Tư Duy Logic',
    subtitle: 'Đếm số que diêm và suy luận cấu trúc cánh cối xay gió',
    icon: '🥢',
    difficulty: 'Cơ bản',
    topicBadge: 'MATH_LOGIC_MATCHES',
    renderSpec: {
      template: 'MATCHSTICK_FIGURE',
      camera: { x: 0, y: 0, z: 5.5 },
      autoRotate: false,
      matches: [
        { from: [0, 0, 0], to: [1.5, 0, 0] },
        { from: [1.5, 0, 0], to: [1.5, 1.5, 0] },
        { from: [1.5, 1.5, 0], to: [0, 0, 0] },
        { from: [0, 0, 0], to: [0, 1.5, 0] },
        { from: [0, 1.5, 0], to: [-1.5, 1.5, 0] },
        { from: [-1.5, 1.5, 0], to: [0, 0, 0] },
        { from: [0, 0, 0], to: [-1.5, 0, 0] },
        { from: [-1.5, 0, 0], to: [-1.5, -1.5, 0] },
        { from: [-1.5, -1.5, 0], to: [0, 0, 0] },
        { from: [0, 0, 0], to: [0, -1.5, 0] },
        { from: [0, -1.5, 0], to: [1.5, -1.5, 0] },
        { from: [1.5, -1.5, 0], to: [0, 0, 0] },
      ],
    },
    problem: {
      id: 'asmo-math-g1-q09',
      subject: 'math',
      grade: 1,
      topicCode: 'MATH_LOGIC_MATCHES',
      topicName: 'Toán que diêm',
      title: 'Đếm Que Diêm Hình Cối Xay Gió (ASMO Toán Lớp 1)',
      text: 'Hình cối xay gió 3D bên dưới được xếp từ tất cả bao nhiêu que diêm?',
      options: [
        { id: 'A', label: 'A', text: '8 que' },
        { id: 'B', label: 'B', text: '10 que' },
        { id: 'C', label: 'C', text: '12 que' },
        { id: 'D', label: 'D', text: '14 que' },
      ],
      correctAnswer: 'C',
      meeHint: 'Mèo Mee gợi ý: Cối xay gió có 4 cánh hình tam giác đối xứng. Mỗi cánh được tạo bởi 3 que diêm. Con hãy nhân lên nhé!',
      explanation: 'Hình gồm 4 cánh tam giác riêng biệt cùng chung tâm O.\nMỗi cánh tam giác gồm 3 que diêm.\nTổng số que diêm $= 4 \\times 3 = 12\\text{ que diêm}$.',
      points: 3,
      explanationSteps: [
        { stepIndex: 1, title: 'Cánh 1 (Góc trên-phải)', description: '3 que diêm tạo thành tam giác 1.', activeIndices: [0, 1, 2] },
        { stepIndex: 2, title: 'Cánh 2 (Góc trên-trái)', description: '3 que diêm tạo thành tam giác 2.', activeIndices: [3, 4, 5] },
        { stepIndex: 3, title: 'Cánh 3 (Góc dưới-trái)', description: '3 que diêm tạo thành tam giác 3.', activeIndices: [6, 7, 8] },
        { stepIndex: 4, title: 'Cánh 4 (Góc dưới-phải)', description: '3 que diêm tạo thành tam giác 4.', activeIndices: [9, 10, 11] },
        { stepIndex: 5, title: 'Tổng cộng', description: '4 cánh x 3 que = 12 que diêm.', activeIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
      ],
    },
    interactiveActions: [
      { id: 'reset', label: 'Căn chỉnh góc nhìn', icon: '🔄', description: 'Xem góc chính diện' },
    ],
  },

  'NET_CUBE_FOLDING': {
    key: 'NET_CUBE_FOLDING',
    title: '6. Gấp Tấm Bìa Hình Khối 3D (Nets)',
    subtitle: 'Quy luật mặt đối diện khi gấp tấm trải phẳng thành hình lập phương',
    icon: '📦',
    difficulty: 'Thử thách',
    topicBadge: 'MATH_GEO_NETS',
    renderSpec: {
      template: 'NET_CUBE_FOLDING',
      camera: { x: 0, y: 0, z: 5.5 },
      autoRotate: false,
      faces: [
        { id: 1, pos: [0, 0.5, 0], color: 0x4f46e5, label: '1' },
        { id: 2, pos: [1, 0.5, 0], color: 0x06b6d4, label: '2' },
        { id: 3, pos: [-1, 0.5, 0], color: 0xec4899, label: '3' },
        { id: 4, pos: [0, 1.5, 0], color: 0x10b981, label: '4' },
        { id: 5, pos: [0, -0.5, 0], color: 0x059669, label: '5' },
        { id: 6, pos: [0, -1.5, 0], color: 0xf59e0b, label: '6' },
      ],
    },
    problem: {
      id: 'asmo-math-g5-q02',
      subject: 'math',
      grade: 5,
      topicCode: 'MATH_GEO_NETS',
      topicName: 'Trải phẳng lập phương (Nets)',
      title: 'Tìm Mặt Đối Diện Khi Gấp Hộp (ASMO Toán Lớp 4-5)',
      text: 'Khi gấp tấm bìa chữ thập gồm 6 mặt vuông lại thành một khối lập phương 3D, mặt nào sẽ nằm **đối diện** với Mặt số 1?',
      options: [
        { id: 'A', label: 'A', text: 'Mặt số 3' },
        { id: 'B', label: 'B', text: 'Mặt số 4' },
        { id: 'C', label: 'C', text: 'Mặt số 5' },
        { id: 'D', label: 'D', text: 'Mặt số 6' },
      ],
      correctAnswer: 'D',
      meeHint: 'Mèo Mee gợi ý: Quy tắc vàng của hình trải phẳng lập phương là hai mặt cách nhau 1 ô trên cùng hàng hoặc cùng cột sẽ luôn đối diện nhau khi gấp lại!',
      explanation: 'Theo quy luật trải phẳng của hình lập phương:\n• Mặt 2 và Mặt 3 đối diện nhau (cách Mặt 1).\n• Mặt 4 và Mặt 5 đối diện nhau (cách Mặt 1 theo chiều dọc).\n• Khi gập Mặt 5 vuông góc và gập tiếp Mặt 6 thì Mặt 6 sẽ nằm song song và đối diện với Mặt 1.\n➔ Mặt 1 đối diện với Mặt 6.',
      points: 5,
      explanationSteps: [
        { stepIndex: 1, title: 'Trải phẳng', description: 'Tấm bìa gồm 6 mặt hình chữ thập.' },
        { stepIndex: 2, title: 'Mặt 2 & Mặt 3', description: 'Cách nhau 1 ô ngang ➔ Đối diện nhau.' },
        { stepIndex: 3, title: 'Mặt 4 & Mặt 5', description: 'Cách nhau 1 ô dọc ➔ Đối diện nhau.' },
        { stepIndex: 4, title: 'Mặt 1 & Mặt 6', description: 'Mặt 6 nằm sau Mặt 5 ➔ Đối diện Mặt 1.' },
      ],
    },
    interactiveActions: [
      { id: 'fold-step', label: 'Mô phỏng gập', icon: '📐', description: 'Gấp các mặt 90 độ vào không gian 3D' },
      { id: 'reset', label: 'Trải phẳng lại', icon: '🔄', description: 'Mở lại dạng 2D phẳng' },
    ],
  },

  '3D_BALANCE_SCALE': {
    key: '3D_BALANCE_SCALE',
    title: '7. Cân Thăng Bằng & Đại Số Sơ Cấp',
    subtitle: 'Suy luận khối lượng tương đương qua đĩa cân thăng bằng',
    icon: '⚖️',
    difficulty: 'Trung bình',
    topicBadge: 'MATH_LOGIC_WEIGHT',
    renderSpec: {
      template: '3D_BALANCE_SCALE',
      camera: { x: 0, y: 0.2, z: 7.0 },
      autoRotate: false,
      leftWeightCount: 2,
      rightWeightCount: 6,
      leftItemLabel: 'Dưa hấu',
      rightItemLabel: 'Cam',
    },
    problem: {
      id: 'asmo-math-g2-q15',
      subject: 'math',
      grade: 2,
      topicCode: 'MATH_LOGIC_WEIGHT',
      topicName: 'Cân thăng bằng',
      title: 'Tính Khối Lượng Tương Đương (ASMO Toán Lớp 2)',
      text: 'Đĩa cân bên trái có 2 quả dưa hấu. Đĩa cân bên phải có 6 quả cam để đĩa cân ở trạng thái thăng bằng hoàn toàn. Hỏi 1 quả dưa hấu nặng bằng mấy quả cam?',
      options: [
        { id: 'A', label: 'A', text: '2 quả cam' },
        { id: 'B', label: 'B', text: '3 quả cam' },
        { id: 'C', label: 'C', text: '4 quả cam' },
        { id: 'D', label: 'D', text: '5 quả cam' },
      ],
      correctAnswer: 'B',
      meeHint: 'Mèo Mee gợi ý: 2 quả dưa = 6 quả cam. Vậy muốn biết 1 quả dưa bằng mấy quả cam, con hãy làm phép chia $6 : 2$ nhé!',
      explanation: 'Theo đề bài:\n$$2\\text{ quả Dưa hấu} = 6\\text{ quả Cam}$$\nChia cả hai vế cho 2:\n$$1\\text{ quả Dưa hấu} = 6 : 2 = 3\\text{ quả Cam}.$$',
      points: 4,
      explanationSteps: [
        { stepIndex: 1, title: 'Ban đầu', description: '2 quả Dưa hấu = 6 quả Cam (Đĩa cân thăng bằng).' },
        { stepIndex: 2, title: 'Chia đôi', description: 'Chia cả hai vế cho 2: (2 dưa : 2) = (6 cam : 2).' },
        { stepIndex: 3, title: 'Kết quả', description: '1 quả Dưa hấu = 3 quả Cam.' },
      ],
    },
    interactiveActions: [
      { id: 'tilt', label: 'Nghiêng cân kiểm tra', icon: '⚖️', description: 'Mô phỏng chuyển động đong đưa của đĩa cân' },
      { id: 'reset', label: 'Cân bằng lại', icon: '🔄', description: 'Trở về trạng thái thăng bằng chuẩn' },
    ],
  },
}
