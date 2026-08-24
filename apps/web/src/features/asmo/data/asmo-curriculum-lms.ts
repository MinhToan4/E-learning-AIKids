import type { AikidCatPose } from '@/shared/components/ui/AikidCatCharacter'

export type AsmoLmsVisualType =
  | 'apple_drop'
  | 'balloon_pop'
  | 'make10'
  | 'column_add'
  | 'column_sub'
  | 'cake_tray'
  | 'times_table_25'
  | 'times_table_69'
  | 'candy_division'
  | 'div_remainder'
  | 'pizza_fraction'
  | 'compare_fractions'
  | 'fraction_add_sub'
  | 'fraction_of_number'
  | 'analog_clock'
  | 'elapsed_time'
  | 'balance_scale'
  | 'perimeter_area'
  | 'cube_3d'
  | 'cube_net'
  | 'grid_maze'
  | 'matchstick'
  | 'olympic_arena'

export interface AsmoLmsQuizOption {
  id: string
  label: string
  text: string
  isCorrect: boolean
}

export interface AsmoLmsQuiz {
  questionTitle: string
  questionText: string
  options: AsmoLmsQuizOption[]
  correctExplanation: string
  formulaExplanation?: string
}

export interface AsmoLmsTheory {
  title: string
  summary: string
  keyTakeaways: string[]
  formulaLatex?: string
  visualHint?: string
}

export interface AsmoLmsMeeTip {
  pose: AikidCatPose
  quote: string
  storyAdvice: string
}

export interface AsmoLmsPracticeChallenge {
  id: string
  level: 1 | 2 | 3
  levelLabel: string
  title: string
  instruction: string
  hint?: string
  taskType: string
  taskConfig: Record<string, unknown>
  successFeedback: string
  initialState?: Record<string, unknown>
}

export interface AsmoLmsPractice {
  instruction: string
  taskType: string
  taskConfig: Record<string, unknown>
  successFeedback: string
  challenges?: AsmoLmsPracticeChallenge[]
}

export interface AsmoLmsLesson {
  id: string
  stageId: string
  stageNumber: number
  lessonNumber: number
  title: string
  subtitle: string
  icon: string
  xpReward: number
  visualType: AsmoLmsVisualType
  visualizerConfig?: Record<string, unknown>
  theory: AsmoLmsTheory
  meeTip: AsmoLmsMeeTip
  interactivePractice: AsmoLmsPractice
  quiz: AsmoLmsQuiz
}

export interface AsmoLmsStage {
  id: string
  stageNumber: number
  title: string
  subtitle: string
  icon: string
  themeColor: string
  gradient: string
  description: string
  requiredStarsToUnlock: number
  lessons: AsmoLmsLesson[]
}

export interface AsmoLmsLessonProgress {
  lessonId: string
  completed: boolean
  stars: number
  xpEarned: number
  completedAt?: string
}

export interface AsmoLmsProgressState {
  lessons: Record<string, AsmoLmsLessonProgress>
  totalStars: number
  totalXp: number
  unlockedStages: string[]
}

// ════════════════════════════════════════════════════════════════════════════
// 5 LMS STAGES CURRICULUM DEFINITION
// ════════════════════════════════════════════════════════════════════════════

export const ASMO_LMS_STAGES: AsmoLmsStage[] = [
  // ── 🚩 CHẶNG 1: THẾ GIỚI PHÉP CỘNG & PHÉP TRỪ ──
  {
    id: 'stage-1',
    stageNumber: 1,
    title: 'Chặng 1: Thế Giới Phép Cộng & Phép Trừ',
    subtitle: 'Nền tảng phép tính số học $0-100$, gộp tách trực quan & đặt cột dọc có nhớ',
    icon: '🍎',
    themeColor: 'rose',
    gradient: 'from-rose-500 via-pink-500 to-amber-500',
    description: 'Bắt đầu hành trình toán học với các quả táo ngọt ngào, bóng bay sắc màu và bí kíp làm tròn 10 siêu tốc cùng Mèo Mee!',
    requiredStarsToUnlock: 0,
    lessons: [
      {
        id: 's1-apples',
        stageId: 'stage-1',
        stageNumber: 1,
        lessonNumber: 1,
        title: 'Gộp Táo $0-10$: Bản Chất Phép Cộng',
        subtitle: 'Thả táo vào 2 giỏ và quan sát tổng số lượng nhảy số trực quan',
        icon: '🍎',
        xpReward: 50,
        visualType: 'apple_drop',
        theory: {
          title: 'Bản Chất Phép Cộng: Gộp Hai Nhóm Đồ Vật',
          summary: 'Phép cộng là hành động gộp chung hai hay nhiều nhóm đồ vật lại với nhau để tìm ra tổng số lượng.',
          keyTakeaways: [
            'Dấu cộng (+) thể hiện hành động thêm vào hoặc gộp chung.',
            'Thứ tự các số hạng không làm thay đổi tổng: $a + b = b + a$.',
            'Số 0 cộng với bất kỳ số nào cũng bằng chính số đó: $a + 0 = a$.',
          ],
          formulaLatex: 'a + b = c \\quad (\\text{Số hạng} + \\text{Số hạng} = \\text{Tổng})',
          visualHint: 'Bấm nút "+ Thêm" để thả từng quả táo vào giỏ đỏ và giỏ xanh để xem tổng biến đổi!',
        },
        meeTip: {
          pose: 'welcome',
          quote: 'Mèo Mee có 4 quả táo đỏ, mẹ cho thêm 3 quả táo xanh. Tổng cộng Mee có 7 quả táo thơm ngon!',
          storyAdvice: 'Khi học cộng, con chỉ cần đếm tiếp từ số lớn hơn. Ví dụ 4 + 3 thì bắt đầu từ 4: "5, 6, 7" là ra ngay đáp án!',
        },
        interactivePractice: {
          instruction: 'Hãy điều chỉnh giỏ A có 5 quả táo đỏ và giỏ B có 4 quả táo xanh để đạt tổng 9 quả.',
          taskType: 'target_sum',
          taskConfig: { targetA: 5, targetB: 4, targetSum: 9 },
          successFeedback: 'Tuyệt vời! 5 quả đỏ + 4 quả xanh = 9 quả táo hoàn hảo!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Đếm Táo Trong Vườn',
          questionText: 'Trong giỏ thứ nhất có $6$ quả táo đỏ, giỏ thứ hai có $4$ quả táo xanh. Hỏi cả hai giỏ có tất cả bao nhiêu quả táo?',
          options: [
            { id: 'A', label: 'A', text: '8 quả táo', isCorrect: false },
            { id: 'B', label: 'B', text: '9 quả táo', isCorrect: false },
            { id: 'C', label: 'C', text: '10 quả táo', isCorrect: true },
            { id: 'D', label: 'D', text: '12 quả táo', isCorrect: false },
          ],
          correctExplanation: 'Ta thực hiện phép tính gộp: $6 + 4 = 10$ quả táo.',
          formulaExplanation: '6 + 4 = 10',
        },
      },
      {
        id: 's1-balloons',
        stageId: 'stage-1',
        stageNumber: 1,
        lessonNumber: 2,
        title: 'Nổ Bóng Trừ $0-10$: Bản Chất Phép Trừ',
        subtitle: 'Bấm nổ bóng bay 🎈 để xem số lượng bớt đi và kết quả còn lại',
        icon: '🎈',
        xpReward: 50,
        visualType: 'balloon_pop',
        theory: {
          title: 'Bản Chất Phép Trừ: Bớt Đi Hoặc Tìm Phần Còn Lại',
          summary: 'Phép trừ là việc lấy bớt đi một số lượng từ một tập hợp ban đầu hoặc tìm sự chênh lệch giữa hai đại lượng.',
          keyTakeaways: [
            'Dấu trừ (-) thể hiện hành động bớt đi, bay mất hoặc ăn bớt.',
            'Số bị trừ luôn lớn hơn hoặc bằng số trừ (trong phạm vi số tự nhiên).',
            'Một số trừ đi chính nó luôn bằng 0: $a - a = 0$.',
          ],
          formulaLatex: 'a - b = c \\quad (\\text{Số bị trừ} - \\text{Số trừ} = \\text{Hiệu})',
          visualHint: 'Bấm vào từng quả bóng để nổ chúng và xem phép trừ thời gian thực.',
        },
        meeTip: {
          pose: 'guide',
          quote: 'Có 10 quả bóng bay rực rỡ, lỡ tay làm nổ mất 3 quả thì còn lại đúng 7 quả!',
          storyAdvice: 'Phép trừ chính là phép tính ngược lại của phép cộng. Muốn biết $10 - 3 = ?$, con hãy tự hỏi: "3 cộng mấy bằng 10?"',
        },
        interactivePractice: {
          instruction: 'Hãy bấm nổ 4 quả bóng để còn lại đúng 6 quả bóng bay trên bầu trời.',
          taskType: 'pop_balloons',
          taskConfig: { total: 10, targetPop: 4, targetRemaining: 6 },
          successFeedback: 'Xuất sắc! $10 - 4 = 6$ quả bóng còn nguyên vẹn!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Chùm Bóng Bay Sinh Nhật',
          questionText: 'Bé Lan cầm một chùm gồm $10$ quả bóng bay. Gió thổi làm bay mất $4$ quả. Hỏi Lan còn lại bao nhiêu quả bóng bay?',
          options: [
            { id: 'A', label: 'A', text: '5 quả', isCorrect: false },
            { id: 'B', label: 'B', text: '6 quả', isCorrect: true },
            { id: 'C', label: 'C', text: '7 quả', isCorrect: false },
            { id: 'D', label: 'D', text: '4 quả', isCorrect: false },
          ],
          correctExplanation: 'Phép trừ: $10 - 4 = 6$ quả bóng bay còn lại.',
          formulaExplanation: '10 - 4 = 6',
        },
      },
      {
        id: 's1-make10',
        stageId: 'stage-1',
        stageNumber: 1,
        lessonNumber: 3,
        title: 'Kết Bạn Tròn 10: Ghép Cặp Thần Tốc',
        subtitle: 'Bí kíp nhẩm siêu tốc ASMO: $1+9=10$, $2+8=10$, $3+7=10$, $4+6=10$, $5+5=10$',
        icon: '🔟',
        xpReward: 60,
        visualType: 'make10',
        theory: {
          title: 'Bí Kíp Ghép Cặp Tròn 10 (Make 10 Friends)',
          summary: 'Trong toán Olympic ASMO, việc ghép các số thành từng cặp có tổng bằng 10 giúp giải nhanh các dãy tính dài.',
          keyTakeaways: [
            'Cặp bạn thân: $(1, 9), (2, 8), (3, 7), (4, 6), (5, 5)$.',
            'Tính chất giao hoán và kết hợp: nhóm các cặp tròn chục trước.',
            'Áp dụng giải tổng: $1 + 3 + 5 + 7 + 9 = (1 + 9) + (3 + 7) + 5 = 25$.',
          ],
          formulaLatex: '(a + b) + c = a + (b + c) \\quad (\\text{Ưu tiên nhóm tổng } = 10)',
          visualHint: 'Bấm chọn 2 quả bóng có tổng bằng 10 để ghép đôi chúng.',
        },
        meeTip: {
          pose: 'thinking',
          quote: 'Mỗi chữ số đều có một "người bạn thân" để cùng nhau tạo thành số 10 tròn trĩnh!',
          storyAdvice: 'Nhớ câu thần chú: 1 đi với 9, 2 sánh cùng 8, 3 kết đôi 7, 4 tìm bạn 6, còn 5 bắt tay 5 nhé!',
        },
        interactivePractice: {
          instruction: 'Ghép cặp đôi (1, 9) và (3, 7) để tính tổng biểu thức $1 + 3 + 5 + 7 + 9$.',
          taskType: 'match_pairs',
          taskConfig: { pairs: [[1, 9], [3, 7]], leftover: 5, expectedSum: 25 },
          successFeedback: 'Đúng rồi! $(1+9) + (3+7) + 5 = 10 + 10 + 5 = 25$!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Tính Nhanh Dãy Số Tròn Chục',
          questionText: 'Tính giá trị của biểu thức: $2 + 4 + 6 + 8 + 10 = ?$',
          options: [
            { id: 'A', label: 'A', text: '28', isCorrect: false },
            { id: 'B', label: 'B', text: '30', isCorrect: true },
            { id: 'C', label: 'C', text: '32', isCorrect: false },
            { id: 'D', label: 'D', text: '26', isCorrect: false },
          ],
          correctExplanation: 'Ghép cặp tròn 10: $(2 + 8) + (4 + 6) + 10 = 10 + 10 + 10 = 30$.',
          formulaExplanation: '(2 + 8) + (4 + 6) + 10 = 30',
        },
      },
      {
        id: 's1-column-add',
        stageId: 'stage-1',
        stageNumber: 1,
        lessonNumber: 4,
        title: 'Cộng Có Nhớ: Đặt Tính Cột Dọc',
        subtitle: 'Quy tắc cộng từ phải sang trái, nhớ 1 sang hàng chục khi tổng $\\ge 10$',
        icon: '🧮',
        xpReward: 70,
        visualType: 'column_add',
        theory: {
          title: 'Quy Trình Đặt Tính Phép Cộng Có Nhớ Cột Dọc',
          summary: 'Đặt thẳng cột hàng đơn vị và hàng chục. Cộng hàng đơn vị trước; nếu tổng $\\ge 10$, viết chữ số đơn vị và nhớ 1 sang hàng chục.',
          keyTakeaways: [
            'Bước 1: Đặt thẳng hàng đơn vị dưới hàng đơn vị, hàng chục dưới hàng chục.',
            'Bước 2: Cộng hàng đơn vị: $8 + 7 = 15$, viết 5 nhớ 1 sang hàng chục.',
            'Bước 3: Cộng hàng chục: $4 + 3 = 7$, thêm 1 nhớ thành 8. Kết quả là 85.',
          ],
          formulaLatex: '\\begin{array}{r} 48 \\\\ +\\, 37 \\\\ \\hline 85 \\end{array}',
          visualHint: 'Điều chỉnh chữ số hàng đơn vị và hàng chục để kiểm tra quy luật nhớ 1.',
        },
        meeTip: {
          pose: 'celebrate',
          quote: 'Khi hàng đơn vị đầy 10 viên ngọc, ta đổi lấy 1 đồng tiền vàng để mang sang túi hàng chục!',
          storyAdvice: 'Đừng quên cộng thêm số 1 nhớ vào hàng chục sau khi tính xong hàng đơn vị nhé!',
        },
        interactivePractice: {
          instruction: 'Tìm chữ số còn thiếu để hoàn thành phép tính: $4\\square + \\square 7 = 85$.',
          taskType: 'column_fill',
          taskConfig: { targetA: 8, targetB: 3, result: 85 },
          successFeedback: 'Chính xác! $48 + 37 = 85$ với 1 nhớ sang hàng chục!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Điền Số Bí Ẩn Cột Dọc',
          questionText: 'Cho phép tính cộng cột dọc: $5A + B6 = 93$. Biết $A$ và $B$ là các chữ số. Giá trị của $A + B$ là bao nhiêu?',
          options: [
            { id: 'A', label: 'A', text: '10', isCorrect: true },
            { id: 'B', label: 'B', text: '9', isCorrect: false },
            { id: 'C', label: 'C', text: '11', isCorrect: false },
            { id: 'D', label: 'D', text: '8', isCorrect: false },
          ],
          correctExplanation: 'Hàng đơn vị: $A + 6 = 13 \\Rightarrow A = 7$ (nhớ 1). Hàng chục: $5 + B + 1 = 9 \\Rightarrow B = 3$. Vậy $A + B = 7 + 3 = 10$.',
          formulaExplanation: 'A = 7, B = 3 \\Rightarrow A + B = 10',
        },
      },
      {
        id: 's1-column-sub',
        stageId: 'stage-1',
        stageNumber: 1,
        lessonNumber: 5,
        title: 'Trừ Mượn 1 Chục: Phép Trừ Cột Dọc',
        subtitle: 'Khi chữ số bị trừ nhỏ hơn, mượn 1 chục ($10$) từ hàng chục sang hàng đơn vị',
        icon: '💥',
        xpReward: 80,
        visualType: 'column_sub',
        theory: {
          title: 'Quy Trình Đặt Tính Phép Trừ Có Mượn Cột Dọc',
          summary: 'Nếu chữ số hàng đơn vị ở số bị trừ nhỏ hơn số trừ, ta mượn 1 chục (10 đơn vị) từ hàng chục, sau đó nhớ trả 1 vào hàng chục.',
          keyTakeaways: [
            'Bước 1: So sánh hàng đơn vị: ví dụ $2 < 7$, không trừ được.',
            'Bước 2: Mượn 1 chục thành $12$, lấy $12 - 7 = 5$, viết 5.',
            'Bước 3: Hàng chục bớt đi 1 (hoặc trả 1 vào số trừ dưới): $7 - 1 - 3 = 3$. Kết quả là 35.',
          ],
          formulaLatex: '\\begin{array}{r} 72 \\\\ -\\, 37 \\\\ \\hline 35 \\end{array}',
          visualHint: 'Xem mô hình phân rã 1 thanh chục thành 10 khối đơn vị rời.',
        },
        meeTip: {
          pose: 'guide',
          quote: 'Hàng đơn vị thiếu kẹo thì sang hàng chục "vay" 1 túi 10 cái kẹo để chia tiếp nha!',
          storyAdvice: 'Mượn thì nhớ phải trả: khi tính hàng chục, nhớ bớt đi 1 đã mượn nhé!',
        },
        interactivePractice: {
          instruction: 'Thực hiện phép trừ có mượn: $63 - 28 = ?$.',
          taskType: 'column_sub_solver',
          taskConfig: { numA: 63, numB: 28, expectedResult: 35 },
          successFeedback: 'Rất chuẩn xác! $63 - 28 = 35$ ($13 - 8 = 5$ nhớ 1; $6 - 2 - 1 = 3$).',
        },
        quiz: {
          questionTitle: 'Thử Thách: Phép Trừ Có Mượn ASMO',
          questionText: 'Tính kết quả của phép trừ: $81 - 47 = ?$',
          options: [
            { id: 'A', label: 'A', text: '44', isCorrect: false },
            { id: 'B', label: 'B', text: '34', isCorrect: true },
            { id: 'C', label: 'C', text: '36', isCorrect: false },
            { id: 'D', label: 'D', text: '46', isCorrect: false },
          ],
          correctExplanation: 'Mượn 1 chục: $11 - 7 = 4$. Hàng chục: $8 - 1 - 4 = 3$. Kết quả là $34$.',
          formulaExplanation: '81 - 47 = 34',
        },
      },
    ],
  },

  // ── 🚩 CHẶNG 2: VƯƠNG QUỐC PHÉP NHÂN & PHÉP CHIA ──
  {
    id: 'stage-2',
    stageNumber: 2,
    title: 'Chặng 2: Vương Quốc Phép Nhân & Phép Chia',
    subtitle: 'Mô hình khay bánh hàng $\\times$ cột, bảng cửu chương trực quan & chia kẹo đều',
    icon: '🍰',
    themeColor: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    description: 'Khám phá bí mật phép nhân là phép cộng các phần bằng nhau và phép chia là chia đều đồ vật vào từng đĩa xinh xắn!',
    requiredStarsToUnlock: 12,
    lessons: [
      {
        id: 's2-cake-tray',
        stageId: 'stage-2',
        stageNumber: 2,
        lessonNumber: 1,
        title: 'Khay Bánh $3 \\times 4$: Bản Chất Phép Nhân',
        subtitle: 'Xếp bánh theo hàng và cột: Phép nhân là tổng của các số hạng bằng nhau',
        icon: '🍰',
        xpReward: 60,
        visualType: 'cake_tray',
        theory: {
          title: 'Bản Chất Phép Nhân: Tổng Của Các Nhóm Bằng Nhau',
          summary: 'Phép nhân $a \\times b$ thể hiện việc lấy $a$ nhóm, mỗi nhóm có đúng $b$ đồ vật (hoặc $a$ hàng $\\times$ $b$ cột).',
          keyTakeaways: [
            'Phép nhân là cách viết gọn của phép cộng lặp lại: $4 + 4 + 4 = 3 \\times 4 = 12$.',
            'Tính chất giao hoán: $3 \\times 4 = 4 \\times 3 = 12$ (xoay khay bánh 90 độ).',
            'Bất kỳ số nào nhân với 1 cũng bằng chính nó: $a \\times 1 = a$.',
            'Bất kỳ số nào nhân với 0 đều bằng 0: $a \\times 0 = 0$.',
          ],
          formulaLatex: 'a \\times b = \\underbrace{b + b + \\dots + b}_{a \\text{ lần}}',
          visualHint: 'Tùy chỉnh số hàng và số cột của khay bánh để thấy số lượng thay đổi tức thì.',
        },
        meeTip: {
          pose: 'celebrate',
          quote: 'Mỗi hàng có 4 chiếc bánh kem dâu, có 3 hàng như thế thì có tất cả $3 \\times 4 = 12$ chiếc bánh ngon lành!',
          storyAdvice: 'Nhìn vào hàng và cột giúp con không bao giờ bị đếm sót một chiếc bánh nào!',
        },
        interactivePractice: {
          instruction: 'Tạo khay bánh gồm 4 hàng, mỗi hàng có 5 chiếc bánh để có tổng 20 chiếc bánh.',
          taskType: 'grid_resize',
          taskConfig: { targetRows: 4, targetCols: 5, targetTotal: 20 },
          successFeedback: 'Xuất sắc! 4 hàng $\\times$ 5 cột = 20 chiếc bánh thơm ngon!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Đếm Hộp Kẹo Sô-cô-la',
          questionText: 'Một hộp sô-cô-la có $5$ hàng, mỗi hàng chứa $6$ viên kẹo. Hỏi trong hộp có tất cả bao nhiêu viên kẹo?',
          options: [
            { id: 'A', label: 'A', text: '25 viên', isCorrect: false },
            { id: 'B', label: 'B', text: '30 viên', isCorrect: true },
            { id: 'C', label: 'C', text: '35 viên', isCorrect: false },
            { id: 'D', label: 'D', text: '28 viên', isCorrect: false },
          ],
          correctExplanation: 'Phép nhân: $5 \\times 6 = 30$ viên kẹo.',
          formulaExplanation: '5 \\times 6 = 30',
        },
      },
      {
        id: 's2-times-table-25',
        stageId: 'stage-2',
        stageNumber: 2,
        lessonNumber: 2,
        title: 'Bảng Nhân 2 – 5: Nhịp Nhảy Số Học',
        subtitle: 'Học thuộc bảng cửu chương 2, 3, 4, 5 qua bước nhảy con ếch trên trục số',
        icon: '🐸',
        xpReward: 70,
        visualType: 'times_table_25',
        theory: {
          title: 'Quy Luật Bảng Nhân 2, 3, 4, 5',
          summary: 'Bảng nhân 2 là các số chẵn cách nhau 2 đơn vị ($2, 4, 6, 8, 10...$). Bảng nhân 5 luôn có tận cùng là 0 hoặc 5.',
          keyTakeaways: [
            'Bảng 2: Gấp đôi một số ($2 \\times n = n + n$).',
            'Bảng 5: Nhảy từng bước 5 đơn vị ($5, 10, 15, 20, 25, 30, 35, 40, 45, 50$).',
            'Số chẵn nhân 5 luôn tận cùng bằng 0; số lẻ nhân 5 luôn tận cùng bằng 5.',
          ],
          formulaLatex: '5 \\times k \\in \\{0, 5, 10, 15, \\dots, 50\\}',
          visualHint: 'Quan sát chú ếch nhảy từng bước đều đặn trên trục số.',
        },
        meeTip: {
          pose: 'guide',
          quote: 'Đếm tiền 5 nghìn đồng: 5, 10, 15, 20, 25... thật là dễ nhớ đúng không nào!',
          storyAdvice: 'Khi nhân với 4, con chỉ cần gấp đôi số đó rồi lại gấp đôi thêm một lần nữa ($4 \\times 6 = 6 \\times 2 \\times 2 = 12 \\times 2 = 24$).',
        },
        interactivePractice: {
          instruction: 'Tìm tích của phép tính: $4 \\times 7 = ?$.',
          taskType: 'multiplication_step',
          taskConfig: { factorA: 4, factorB: 7, targetProduct: 28 },
          successFeedback: 'Chính xác! $4 \\times 7 = 28$!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Số Chân Của Đàn Thỏ',
          questionText: 'Trong vườn có $5$ chú thỏ trắng dễ thương. Biết mỗi chú thỏ có $4$ cái chân. Hỏi đàn thỏ có tất cả bao nhiêu cái chân?',
          options: [
            { id: 'A', label: 'A', text: '16 cái chân', isCorrect: false },
            { id: 'B', label: 'B', text: '18 cái chân', isCorrect: false },
            { id: 'C', label: 'C', text: '20 cái chân', isCorrect: true },
            { id: 'D', label: 'D', text: '24 cái chân', isCorrect: false },
          ],
          correctExplanation: 'Phép nhân: $5 \\times 4 = 20$ cái chân.',
          formulaExplanation: '5 \\times 4 = 20',
        },
      },
      {
        id: 's2-times-table-69',
        stageId: 'stage-2',
        stageNumber: 2,
        lessonNumber: 3,
        title: 'Bảng Nhân 6 – 9: Bí Thuật Bàn Tay & Số 9 Kỳ Diệu',
        subtitle: 'Bí kíp bảng nhân 9: Tổng các chữ số luôn bằng 9 ($9, 18, 27, 36, 45, 54, 63, 72, 81$)',
        icon: '🪄',
        xpReward: 80,
        visualType: 'times_table_69',
        theory: {
          title: 'Bí Mật Bảng Nhân 6, 7, 8, 9',
          summary: 'Bảng nhân 9 có quy luật đối xứng thần kỳ: hàng chục tăng dần từ 0 đến 9, hàng đơn vị giảm dần từ 9 về 0.',
          keyTakeaways: [
            'Bảng 9: $9 \\times n = (n-1)$ ở hàng chục và $[9 - (n-1)]$ ở hàng đơn vị.',
            'Ví dụ: $9 \\times 7 = 63$ (vì $7 - 1 = 6$ và $9 - 6 = 3$).',
            'Nhân với 8: Gấp đôi 3 lần liên tiếp ($8 \\times n = n \\times 2 \\times 2 \\times 2$).',
          ],
          formulaLatex: '9 \\times k = 10k - k',
          visualHint: 'Xem sơ đồ 10 ngón tay gập ngón thứ k để đọc ngay kết quả $9 \\times k$.',
        },
        meeTip: {
          pose: 'thinking',
          quote: 'Muốn tính $9 \\times 6$, Mèo Mee lấy $10 \\times 6 = 60$ rồi trừ bớt 6 là ra 54 ngay!',
          storyAdvice: 'Toán học luôn có các đường tắt thông minh, đừng học vẹt mà hãy nắm lấy quy luật nhé!',
        },
        interactivePractice: {
          instruction: 'Áp dụng quy luật số 9: Tính $9 \\times 8 = ?$.',
          taskType: 'fast_table',
          taskConfig: { factorA: 9, factorB: 8, targetProduct: 72 },
          successFeedback: 'Quá đỉnh! $9 \\times 8 = 72$ ($7 + 2 = 9$).',
        },
        quiz: {
          questionTitle: 'Thử Thách: Số Bánh Trong Hộp Quà',
          questionText: 'Cô giáo có $7$ túi kẹo, mỗi túi chứa $8$ chiếc kẹo bắp ngọt. Hỏi cô giáo có tổng cộng bao nhiêu chiếc kẹo?',
          options: [
            { id: 'A', label: 'A', text: '54 chiếc', isCorrect: false },
            { id: 'B', label: 'B', text: '56 chiếc', isCorrect: true },
            { id: 'C', label: 'C', text: '58 chiếc', isCorrect: false },
            { id: 'D', label: 'D', text: '64 chiếc', isCorrect: false },
          ],
          correctExplanation: 'Phép nhân: $7 \\times 8 = 56$ chiếc kẹo.',
          formulaExplanation: '7 \\times 8 = 56',
        },
      },
      {
        id: 's2-candy-split',
        stageId: 'stage-2',
        stageNumber: 2,
        lessonNumber: 4,
        title: 'Chia Kẹo Đều: Bản Chất Phép Chia Hết',
        subtitle: 'Chia 12 chiếc kẹo vào 3 đĩa: Mỗi bạn nhận được đúng 4 chiếc kẹo',
        icon: '🍽️',
        xpReward: 80,
        visualType: 'candy_division',
        theory: {
          title: 'Bản Chất Phép Chia Hết: Chia Thành Các Phần Bằng Nhau',
          summary: 'Phép chia $a : b$ là việc chia đều tổng số lượng $a$ vào $b$ nhóm để tìm số lượng trong mỗi nhóm (hoặc tìm số nhóm).',
          keyTakeaways: [
            'Phép chia là phép tính ngược lại của phép nhân: nếu $3 \\times 4 = 12$ thì $12 : 3 = 4$ và $12 : 4 = 3$.',
            'Số bị chia : Số chia = Thương.',
            'Không thể chia cho số 0 ($a : 0$ là không xác định).',
          ],
          formulaLatex: 'a : b = c \\iff b \\times c = a',
          visualHint: 'Thử thay đổi số kẹo và số đĩa để quan sát kẹo tự động chia đều.',
        },
        meeTip: {
          pose: 'guide',
          quote: 'Muốn chia đều kẹo cho các bạn, Mee chia từng lượt một vòng quanh bàn cho đến khi hết kẹo!',
          storyAdvice: 'Khi gặp bài toán chia, con hãy nhớ lại bảng nhân tương ứng để tìm ra thương số ngay nhé!',
        },
        interactivePractice: {
          instruction: 'Chia đều 15 chiếc kẹo vào 3 đĩa để mỗi đĩa có 5 chiếc kẹo.',
          taskType: 'equal_split',
          taskConfig: { totalCandies: 15, plates: 3, candiesPerPlate: 5 },
          successFeedback: 'Chính xác! $15 : 3 = 5$ cái kẹo trên mỗi đĩa!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Chia Táo Cho Các Tổ',
          questionText: 'Có $24$ quả táo được chia đều cho $4$ tổ học sinh. Hỏi mỗi tổ nhận được bao nhiêu quả táo?',
          options: [
            { id: 'A', label: 'A', text: '5 quả', isCorrect: false },
            { id: 'B', label: 'B', text: '6 quả', isCorrect: true },
            { id: 'C', label: 'C', text: '7 quả', isCorrect: false },
            { id: 'D', label: 'D', text: '8 quả', isCorrect: false },
          ],
          correctExplanation: 'Phép chia: $24 : 4 = 6$ quả táo.',
          formulaExplanation: '24 : 4 = 6',
        },
      },
      {
        id: 's2-div-remainder',
        stageId: 'stage-2',
        stageNumber: 2,
        lessonNumber: 5,
        title: 'Phép Chia Có Dư: Phần Thừa Chưa Đủ Chia',
        subtitle: 'Chia 14 kẹo cho 3 bạn: Mỗi bạn 4 cái và còn dư 2 cái kẹo ngọt ngào',
        icon: '🍬',
        xpReward: 90,
        visualType: 'div_remainder',
        theory: {
          title: 'Quy Tắc Phép Chia Có Dư Trong Toán Olympic',
          summary: 'Khi số bị chia không chia hết cho số chia, ta thu được thương và số dư. Số dư luôn luôn phải NHỎ HƠN số chia ($r < b$).',
          keyTakeaways: [
            'Công thức Euclid: $\\text{Số bị chia} = (\\text{Thương} \\times \\text{Số chia}) + \\text{Số dư}$.',
            'Điều kiện bắt buộc: $0 \\le r < b$.',
            'Số dư lớn nhất luôn bằng $(\\text{Số chia} - 1)$.',
          ],
          formulaLatex: 'a = b \\times q + r \\quad (0 \\le r < b)',
          visualHint: 'Quan sát những chiếc kẹo còn thừa lại ở ngoài các đĩa.',
        },
        meeTip: {
          pose: 'thinking',
          quote: 'Nếu số kẹo thừa còn nhiều hơn hoặc bằng số đĩa, nghĩa là con vẫn có thể chia tiếp cho mỗi đĩa thêm 1 cái nữa đấy!',
          storyAdvice: 'Số dư luôn nhỏ hơn số chia! Đây là bí kíp then chốt để giải mọi bài toán chia có dư ASMO!',
        },
        interactivePractice: {
          instruction: 'Thực hiện phép chia: $17 : 5 = ?$ tìm thương và số dư.',
          taskType: 'division_remainder_solver',
          taskConfig: { dividend: 17, divisor: 5, quotient: 3, remainder: 2 },
          successFeedback: 'Đúng rồi! $17 : 5 = 3$ (dư 2), vì $17 = 5 \\times 3 + 2$!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Số Dư Lớn Nhất Trong Phép Chia',
          questionText: 'Trong một phép chia cho $7$, số dư lớn nhất có thể có là bao nhiêu?',
          options: [
            { id: 'A', label: 'A', text: '7', isCorrect: false },
            { id: 'B', label: 'B', text: '6', isCorrect: true },
            { id: 'C', label: 'C', text: '5', isCorrect: false },
            { id: 'D', label: 'D', text: '8', isCorrect: false },
          ],
          correctExplanation: 'Vì số dư luôn nhỏ hơn số chia, nên trong phép chia cho 7, số dư lớn nhất là $7 - 1 = 6$.',
          formulaExplanation: 'r_{\\max} = b - 1 = 7 - 1 = 6',
        },
      },
    ],
  },

  // ── 🚩 CHẶNG 3: VÙNG ĐẤT PHÂN SỐ & TỈ SỐ TRỰC QUAN ──
  {
    id: 'stage-3',
    stageNumber: 3,
    title: 'Chặng 3: Vùng Đất Phân Số & Tỉ Số Trực Quan',
    subtitle: 'Cắt bánh Pizza $\\frac{1}{2}, \\frac{1}{4}, \\frac{3}{8}$, so sánh và cộng trừ phân số cùng mẫu',
    icon: '🍕',
    themeColor: 'emerald',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    description: 'Biến khái niệm phân số trừu tượng thành những miếng bánh pizza thơm lừng, các thanh sô-cô-la chia ô trực quan!',
    requiredStarsToUnlock: 24,
    lessons: [
      {
        id: 's3-pizza-fractions',
        stageId: 'stage-3',
        stageNumber: 3,
        lessonNumber: 1,
        title: 'Bánh Pizza Phân Số: $\\frac{1}{2}, \\frac{1}{4}, \\frac{3}{8}$',
        subtitle: 'Khám phá tử số (số phần lấy) và mẫu số (tổng số phần bằng nhau)',
        icon: '🍕',
        xpReward: 70,
        visualType: 'pizza_fraction',
        theory: {
          title: 'Khái Niệm Phân Số Trực Quan',
          summary: 'Phân số $\\frac{a}{b}$ biểu thị $a$ phần bằng nhau được lấy ra từ một tổng thể chia thành $b$ phần bằng nhau.',
          keyTakeaways: [
            'Mẫu số $b$ (dưới): Tổng số phần bằng nhau được chia ra.',
            'Tử số $a$ (trên): Số phần được tô màu hoặc lấy đi.',
            'Khi tử số bằng mẫu số: $\\frac{b}{b} = 1$ (trọn vẹn một chiếc bánh).',
          ],
          formulaLatex: '\\frac{a}{b} \\quad (a: \\text{Tử số}, b: \\text{Mẫu số}, b \\neq 0)',
          visualHint: 'Bấm chọn số lát cắt pizza để quan sát phân số thay đổi theo thời gian thực.',
        },
        meeTip: {
          pose: 'celebrate',
          quote: 'Một chiếc bánh pizza thơm ngon cắt làm 8 miếng, Mee ăn 3 miếng tức là Mee đã ăn $\\frac{3}{8}$ chiếc bánh!',
          storyAdvice: 'Mẫu số là "Mẹ" - nâng đỡ toàn bộ chiếc bánh, còn Tử số là "Tử" (con) - phần ta đang quan sát nhé!',
        },
        interactivePractice: {
          instruction: 'Tô màu 3 miếng trên chiếc bánh chia làm 8 phần để tạo phân số $\\frac{3}{8}$.',
          taskType: 'slice_selector',
          taskConfig: { totalSlices: 8, targetShaded: 3 },
          successFeedback: 'Tuyệt đẹp! Bạn đã tạo ra phân số $\\frac{3}{8}$ chiếc bánh pizza!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Đọc Phân Số Miếng Bánh',
          questionText: 'Một thanh sô-cô-la chia đều thành $6$ ô vuông bằng nhau. Nam đã ăn $2$ ô vuông. Hỏi Nam đã ăn bao nhiêu phần thanh sô-cô-la?',
          options: [
            { id: 'A', label: 'A', text: '$\\frac{2}{6}$ thanh sô-cô-la', isCorrect: true },
            { id: 'B', label: 'B', text: '$\\frac{4}{6}$ thanh sô-cô-la', isCorrect: false },
            { id: 'C', label: 'C', text: '$\\frac{2}{4}$ thanh sô-cô-la', isCorrect: false },
            { id: 'D', label: 'D', text: '$\\frac{6}{2}$ thanh sô-cô-la', isCorrect: false },
          ],
          correctExplanation: 'Tổng số ô là 6 (mẫu số), Nam ăn 2 ô (tử số). Vậy Nam ăn $\\frac{2}{6}$ thanh sô-cô-la (rút gọn thành $\\frac{1}{3}$).',
          formulaExplanation: '\\frac{2}{6} = \\frac{1}{3}',
        },
      },
      {
        id: 's3-compare-fractions',
        stageId: 'stage-3',
        stageNumber: 3,
        lessonNumber: 2,
        title: 'So Sánh Phân Số: Ai Được Nhiều Bánh Hơn?',
        subtitle: 'So sánh phân số cùng mẫu (so sánh tử) và cùng tử (mẫu càng nhỏ miếng càng to)',
        icon: '⚖️',
        xpReward: 80,
        visualType: 'compare_fractions',
        theory: {
          title: 'Quy Tắc So Sánh Phân Số',
          summary: 'Khi cùng mẫu số, phân số nào có tử số lớn hơn thì lớn hơn. Khi cùng tử số, phân số nào có mẫu số nhỏ hơn thì lớn hơn.',
          keyTakeaways: [
            'Cùng mẫu số: $\\frac{3}{7} < \\frac{5}{7}$ (vì 3 < 5).',
            'Cùng tử số: $\\frac{1}{2} > \\frac{1}{4}$ (chia cho 2 người được miếng to hơn chia 4 người).',
            'Quy đồng mẫu số khi khác cả tử và mẫu: $\\frac{a}{b}$ và $\\frac{c}{d} \\Rightarrow ad$ so với $bc$.',
          ],
          formulaLatex: '\\frac{1}{2} > \\frac{1}{3} > \\frac{1}{4} > \\frac{1}{8}',
          visualHint: 'So sánh 2 thanh phân số nằm song song để nhận biết độ dài phần tô màu.',
        },
        meeTip: {
          pose: 'guide',
          quote: 'Chia bánh cho càng ít bạn ăn thì mỗi bạn nhận được miếng bánh càng to bự!',
          storyAdvice: 'Hãy luôn tưởng tượng hình ảnh miếng bánh pizza: $\\frac{1}{2}$ nửa cái bánh luôn lớn hơn $\\frac{1}{4}$ góc phần tư!',
        },
        interactivePractice: {
          instruction: 'Kéo dấu so sánh thích hợp giữa $\\frac{3}{5}$ và $\\frac{2}{5}$.',
          taskType: 'comparison_symbol',
          taskConfig: { leftFraction: [3, 5], rightFraction: [2, 5], correctSign: '>' },
          successFeedback: 'Chính xác! $\\frac{3}{5} > \\frac{2}{5}$ vì cùng mẫu số và $3 > 2$!',
        },
        quiz: {
          questionTitle: 'Thử Thách: So Sánh Hai Phân Số',
          questionText: 'Phân số nào sau đây lớn nhất?',
          options: [
            { id: 'A', label: 'A', text: '$\\frac{1}{8}$', isCorrect: false },
            { id: 'B', label: 'B', text: '$\\frac{1}{4}$', isCorrect: false },
            { id: 'C', label: 'C', text: '$\\frac{1}{2}$', isCorrect: true },
            { id: 'D', label: 'D', text: '$\\frac{1}{6}$', isCorrect: false },
          ],
          correctExplanation: 'Các phân số có cùng tử số là 1. Mẫu số càng nhỏ thì phân số càng lớn. Vì $2 < 4 < 6 < 8$ nên $\\frac{1}{2}$ là lớn nhất.',
          formulaExplanation: '\\frac{1}{2} > \\frac{1}{4} > \\frac{1}{6} > \\frac{1}{8}',
        },
      },
      {
        id: 's3-add-sub-fractions',
        stageId: 'stage-3',
        stageNumber: 3,
        lessonNumber: 3,
        title: 'Cộng Trừ Phân Số Cùng Mẫu Số',
        subtitle: 'Quy tắc vàng: Giữ nguyên mẫu số, cộng hoặc trừ các tử số với nhau',
        icon: '➕',
        xpReward: 90,
        visualType: 'fraction_add_sub',
        theory: {
          title: 'Cộng Trừ Phân Số Cùng Mẫu',
          summary: 'Muốn cộng (hoặc trừ) hai phân số có cùng mẫu số, ta cộng (hoặc trừ) hai tử số với nhau và giữ nguyên mẫu số.',
          keyTakeaways: [
            'Công thức cộng: $\\frac{a}{m} + \\frac{b}{m} = \\frac{a+b}{m}$.',
            'Công thức trừ: $\\frac{a}{m} - \\frac{b}{m} = \\frac{a-b}{m}$.',
            'Rút gọn phân số kết quả về dạng tối giản nếu có thể.',
          ],
          formulaLatex: '\\frac{2}{7} + \\frac{3}{7} = \\frac{2+3}{7} = \\frac{5}{7}',
          visualHint: 'Ghép các lát bánh có cùng kích thước lại với nhau vào chung một đĩa.',
        },
        meeTip: {
          pose: 'thinking',
          quote: 'Mẫu số là họ tên của chiếc bánh, khi cộng ta chỉ tính số lát (tử số) thôi chứ không cộng mẫu nhé!',
          storyAdvice: 'Lỗi sai phổ biến: $\\frac{1}{3} + \\frac{1}{3} \\neq \\frac{2}{6}$! Đáp án đúng phải là $\\frac{2}{3}$ nha các bạn!',
        },
        interactivePractice: {
          instruction: 'Tính kết quả: $\\frac{3}{8} + \\frac{2}{8} = ?$.',
          taskType: 'fraction_input',
          taskConfig: { numA: [3, 8], numB: [2, 8], op: '+', expectedNum: 5, expectedDen: 8 },
          successFeedback: 'Rất giỏi! $\\frac{3}{8} + \\frac{2}{8} = \\frac{5}{8}$!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Phép Tính Bánh Pizza',
          questionText: 'Mèo Mee có $\\frac{5}{9}$ chiếc bánh pizza, Mee ăn bớt $\\frac{2}{9}$ chiếc bánh. Hỏi Mee còn lại bao nhiêu phần bánh pizza?',
          options: [
            { id: 'A', label: 'A', text: '$\\frac{3}{9}$ chiếc bánh', isCorrect: true },
            { id: 'B', label: 'B', text: '$\\frac{7}{9}$ chiếc bánh', isCorrect: false },
            { id: 'C', label: 'C', text: '$\\frac{3}{0}$ chiếc bánh', isCorrect: false },
            { id: 'D', label: 'D', text: '$\\frac{3}{18}$ chiếc bánh', isCorrect: false },
          ],
          correctExplanation: 'Phép trừ phân số cùng mẫu: $\\frac{5}{9} - \\frac{2}{9} = \\frac{5-2}{9} = \\frac{3}{9}$ (hay $\\frac{1}{3}$).',
          formulaExplanation: '\\frac{5}{9} - \\frac{2}{9} = \\frac{3}{9}',
        },
      },
      {
        id: 's3-fraction-of-number',
        stageId: 'stage-3',
        stageNumber: 3,
        lessonNumber: 4,
        title: 'Tìm Phân Số Của Một Số: Ứng Dụng Thực Tế',
        subtitle: 'Tìm $\\frac{2}{3}$ của $12$ quả cam: Chia làm 3 phần bằng nhau rồi nhân với 2',
        icon: '🍊',
        xpReward: 90,
        visualType: 'fraction_of_number',
        theory: {
          title: 'Quy Tắc Tìm Phân Số Của Một Số',
          summary: 'Muốn tìm $\\frac{a}{b}$ của số $N$, ta lấy số $N$ chia cho mẫu số $b$ rồi nhân với tử số $a$ (hoặc lấy $N \\times \\frac{a}{b}$).',
          keyTakeaways: [
            'Bước 1: Tìm giá trị của 1 phần: $N : b$.',
            'Bước 2: Tìm giá trị của $a$ phần: $(N : b) \\times a$.',
            'Ví dụ: $\\frac{3}{4}$ của 20 viên kẹo là $(20 : 4) \\times 3 = 5 \\times 3 = 15$ viên kẹo.',
          ],
          formulaLatex: '\\frac{a}{b} \\text{ của } N = \\frac{N \\times a}{b} = (N : b) \\times a',
          visualHint: 'Gom 12 quả cam thành 3 hàng bằng nhau, sau đó chọn lấy 2 hàng.',
        },
        meeTip: {
          pose: 'celebrate',
          quote: 'Chia đều thành $b$ nhóm bằng nhau rồi gom $a$ nhóm lại là tìm ra ngay đáp án!',
          storyAdvice: 'Đây là dạng toán xuất hiện trong 90% các kỳ thi Olympic ASMO cấp Tiểu học đấy!',
        },
        interactivePractice: {
          instruction: 'Tìm $\\frac{2}{5}$ của $25$ quả dâu tây.',
          taskType: 'fraction_of_quantity',
          taskConfig: { quantity: 25, fraction: [2, 5], expectedResult: 10 },
          successFeedback: 'Chính xác! $(25 : 5) \\times 2 = 5 \\times 2 = 10$ quả dâu tây!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Số Học Sinh Nữ Trong Lớp',
          questionText: 'Lớp 3A có $30$ học sinh, trong đó số học sinh nữ chiếm $\\frac{3}{5}$ tổng số học sinh cả lớp. Hỏi lớp 3A có bao nhiêu học sinh nữ?',
          options: [
            { id: 'A', label: 'A', text: '16 học sinh', isCorrect: false },
            { id: 'B', label: 'B', text: '18 học sinh', isCorrect: true },
            { id: 'C', label: 'C', text: '20 học sinh', isCorrect: false },
            { id: 'D', label: 'D', text: '15 học sinh', isCorrect: false },
          ],
          correctExplanation: 'Số học sinh nữ là: $(30 : 5) \\times 3 = 6 \\times 3 = 18$ học sinh.',
          formulaExplanation: '30 \\times \\frac{3}{5} = 18',
        },
      },
    ],
  },

  // ── 🚩 CHẶNG 4: THỜI GIAN, ĐỒNG HỒ & ĐO LƯỜNG ──
  {
    id: 'stage-4',
    stageNumber: 4,
    title: 'Chặng 4: Thời Gian, Đồng Hồ & Đo Lường',
    subtitle: 'Xem kim giờ kim phút, khoảng thời gian trôi qua, cân đĩa thăng bằng & chu vi diện tích',
    icon: '⏰',
    themeColor: 'sky',
    gradient: 'from-sky-500 via-indigo-500 to-blue-600',
    description: 'Trở thành bậc thầy quản lý thời gian và đo lường không gian với đồng hồ kim tương tác, cân thăng bằng logic!',
    requiredStarsToUnlock: 36,
    lessons: [
      {
        id: 's4-analog-clock',
        stageId: 'stage-4',
        stageNumber: 4,
        lessonNumber: 1,
        title: 'Xem Giờ Kim Đồng Hồ: Giờ Đúng & Giờ Rưỡi',
        subtitle: 'Kim ngắn chỉ giờ, kim dài chỉ phút (mỗi khoảng số là 5 phút)',
        icon: '⏰',
        xpReward: 70,
        visualType: 'analog_clock',
        theory: {
          title: 'Cấu Tạo Và Nguyên Lý Mặt Đồng Hồ',
          summary: 'Mặt đồng hồ có 12 số lớn. Kim ngắn quay 1 vòng hết 12 giờ, kim dài quay 1 vòng hết 60 phút. Khi kim dài đi từ số này sang số liền kề là 5 phút.',
          keyTakeaways: [
            '1 giờ = 60 phút, 1 ngày = 24 giờ.',
            'Giờ đúng: Kim dài chỉ đúng số 12 (ví dụ: 3 giờ đúng).',
            'Giờ rưỡi (30 phút): Kim dài chỉ đúng số 6 (ví dụ: 3 giờ 30 phút).',
          ],
          formulaLatex: '\\text{Góc quay kim phút} = \\text{Số phút} \\times 6^\\circ',
          visualHint: 'Kéo kim phút hoặc bấm chọn giờ để xem mặt đồng hồ chuyển động chân thực.',
        },
        meeTip: {
          pose: 'guide',
          quote: 'Kim ngắn đi chậm rãi từng bước, kim dài chạy thoăn thoắt 5 phút mỗi số!',
          storyAdvice: 'Nhìn kim ngắn trước để biết số giờ, rồi nhìn kim dài nhân với 5 để biết số phút nhé!',
        },
        interactivePractice: {
          instruction: 'Chỉnh kim đồng hồ về đúng thời gian $8$ giờ $15$ phút sáng.',
          taskType: 'clock_setter',
          taskConfig: { targetHour: 8, targetMinute: 15 },
          successFeedback: 'Chuẩn xác! Đồng hồ đang chỉ đúng 8:15!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Đọc Giờ Trên Đồng Hồ',
          questionText: 'Khi kim ngắn chỉ ở giữa số 4 và số 5, kim dài chỉ đúng số 6. Lúc đó là mấy giờ?',
          options: [
            { id: 'A', label: 'A', text: '4 giờ 6 phút', isCorrect: false },
            { id: 'B', label: 'B', text: '4 giờ 30 phút', isCorrect: true },
            { id: 'C', label: 'C', text: '5 giờ 30 phút', isCorrect: false },
            { id: 'D', label: 'D', text: '6 giờ 20 phút', isCorrect: false },
          ],
          correctExplanation: 'Kim ngắn ở giữa 4 và 5 nghĩa là đã qua 4 giờ. Kim dài chỉ số 6 nghĩa là $6 \\times 5 = 30$ phút. Vậy là 4 giờ 30 phút.',
          formulaExplanation: '4:30',
        },
      },
      {
        id: 's4-elapsed-time',
        stageId: 'stage-4',
        stageNumber: 4,
        lessonNumber: 2,
        title: 'Khoảng Thời Gian Trôi Qua: Bắt Đầu & Kết Thúc',
        subtitle: 'Tính thời gian làm bài thi, thời gian đi học: $\\text{Thời gian trôi qua} = \\text{Kết thúc} - \\text{Bắt đầu}$',
        icon: '⏳',
        xpReward: 80,
        visualType: 'elapsed_time',
        theory: {
          title: 'Tính Khoảng Thời Gian Trôi Qua (Elapsed Time)',
          summary: 'Muốn biết một sự kiện diễn ra trong bao lâu, ta lấy thời điểm kết thúc trừ đi thời điểm bắt đầu.',
          keyTakeaways: [
            'Công thức: $\\text{Thời gian thực hiện} = \\text{Giờ kết thúc} - \\text{Giờ bắt đầu}$.',
            'Khi trừ phút mà không đủ, mượn 1 giờ đổi thành 60 phút.',
            'Cộng thời gian: $\\text{Giờ kết thúc} = \\text{Giờ bắt đầu} + \\text{Thời lượng}$.',
          ],
          formulaLatex: '\\Delta t = t_{\\text{end}} - t_{\\text{start}}',
          visualHint: 'So sánh 2 mặt đồng hồ lúc bắt đầu và lúc kết thúc.',
        },
        meeTip: {
          pose: 'thinking',
          quote: 'Mee bắt đầu làm bài lúc 9:00 và hoàn thành lúc 9:45, vậy Mee đã làm trong 45 phút tập trung cao độ!',
          storyAdvice: 'Đổi 1 giờ thành 60 phút khi cần làm phép tính mượn giờ con nhé!',
        },
        interactivePractice: {
          instruction: 'Tính khoảng thời gian từ $2:15$ chiều đến $3:45$ chiều.',
          taskType: 'time_diff',
          taskConfig: { start: '14:15', end: '15:45', expectedMinutes: 90 },
          successFeedback: 'Đúng rồi! Khoảng thời gian trôi qua là 1 giờ 30 phút (90 phút)!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Thời Gian Bộ Phim Hoạt Hình',
          questionText: 'Một bộ phim hoạt hình bắt đầu chiếu lúc $7$ giờ $15$ phút tối và kết thúc lúc $8$ giờ $45$ phút tối cùng ngày. Bộ phim kéo dài bao lâu?',
          options: [
            { id: 'A', label: 'A', text: '1 giờ 15 phút', isCorrect: false },
            { id: 'B', label: 'B', text: '1 giờ 30 phút', isCorrect: true },
            { id: 'C', label: 'C', text: '1 giờ 45 phút', isCorrect: false },
            { id: 'D', label: 'D', text: '2 giờ', isCorrect: false },
          ],
          correctExplanation: 'Thời gian = 8 giờ 45 phút - 7 giờ 15 phút = 1 giờ 30 phút.',
          formulaExplanation: '8h45 - 7h15 = 1h30',
        },
      },
      {
        id: 's4-balance-scale',
        stageId: 'stage-4',
        stageNumber: 4,
        lessonNumber: 3,
        title: 'Cân Thăng Bằng Logic: So Sánh Khối Lượng',
        subtitle: '1 quả dưa hấu nặng bằng 4 quả táo: Tư duy đại số thay thế ẩn số sơ cấp',
        icon: '🍉',
        xpReward: 90,
        visualType: 'balance_scale',
        theory: {
          title: 'Tư Duy Cân Đĩa Thăng Bằng (Balance Scale Logic)',
          summary: 'Khi cân thăng bằng nằm ngang, tổng khối lượng bên đĩa trái bằng tổng khối lượng bên đĩa phải. Ta có thể thay thế hoặc triệt tiêu các vật phẩm giống nhau ở 2 vế.',
          keyTakeaways: [
            'Thăng bằng $\\Rightarrow$ Vế trái = Vế phải ($A = B$).',
            'Nghiêng về bên nào $\\Rightarrow$ Bên đó nặng hơn ($A > B$).',
            'Phương pháp thế: Nếu $1 \\text{ Dưa} = 4 \\text{ Táo}$ và $1 \\text{ Táo} = 2 \\text{ Mận}$, thì $1 \\text{ Dưa} = 4 \\times 2 = 8 \\text{ Mận}$.',
          ],
          formulaLatex: '\\text{Đĩa Trái} = \\text{Đĩa Phải} \\iff \\sum W_{\\text{left}} = \\sum W_{\\text{right}}',
          visualHint: 'Thả các loại quả vào 2 đĩa cân để quan sát đĩa nghiêng lên xuống.',
        },
        meeTip: {
          pose: 'celebrate',
          quote: 'Cân thăng bằng chính là chiếc cầu nối kỳ diệu dẫn vào thế giới đại số Olympic đấy!',
          storyAdvice: 'Bỏ bớt 1 vật giống nhau ở cả hai đĩa thì cân vẫn luôn luôn giữ thăng bằng nhé!',
        },
        interactivePractice: {
          instruction: 'Tìm số quả táo cần đặt vào đĩa phải để cân thăng bằng với 2 quả dưa hấu (biết 1 dưa = 3 táo).',
          taskType: 'balance_loader',
          taskConfig: { leftItems: '2 Dưa', ratio: 3, expectedRightApples: 6 },
          successFeedback: 'Chính xác! 2 quả dưa hấu thăng bằng với $2 \\times 3 = 6$ quả táo!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Cân Đĩa Hoa Quả ASMO',
          questionText: 'Biết $1$ quả dứa nặng bằng $3$ quả cam, và $1$ quả cam nặng bằng $2$ quả chanh. Hỏi $1$ quả dứa nặng bằng bao nhiêu quả chanh?',
          options: [
            { id: 'A', label: 'A', text: '4 quả chanh', isCorrect: false },
            { id: 'B', label: 'B', text: '5 quả chanh', isCorrect: false },
            { id: 'C', label: 'C', text: '6 quả chanh', isCorrect: true },
            { id: 'D', label: 'D', text: '8 quả chanh', isCorrect: false },
          ],
          correctExplanation: 'Thay thế: $1 \\text{ dứa} = 3 \\text{ cam} = 3 \\times 2 \\text{ chanh} = 6 \\text{ quả chanh}$.',
          formulaExplanation: '1 \\text{ Dứa} = 3 \\times 2 = 6 \\text{ Chanh}',
        },
      },
      {
        id: 's4-perimeter-area',
        stageId: 'stage-4',
        stageNumber: 4,
        lessonNumber: 4,
        title: 'Chu Vi & Diện Tích: Lưới Ô Vuông Trực Quan',
        subtitle: 'Chu vi là viền bao quanh (hàng rào), diện tích là toàn bộ bề mặt bên trong (thảm cỏ)',
        icon: '📐',
        xpReward: 90,
        visualType: 'perimeter_area',
        theory: {
          title: 'Phân Biệt Chu Vi & Diện Tích',
          summary: 'Chu vi là tổng độ dài đường viền bao quanh hình (đơn vị: cm, m). Diện tích là độ lớn của bề mặt bên trong hình (đơn vị: cm², m²).',
          keyTakeaways: [
            'Chu vi hình chữ nhật: $P = (a + b) \\times 2$.',
            'Diện tích hình chữ nhật: $S = a \\times b$.',
            'Chu vi hình vuông: $P = a \\times 4$; Diện tích hình vuông: $S = a \\times a$.',
          ],
          formulaLatex: 'P = (a+b) \\times 2, \\quad S = a \\times b',
          visualHint: 'Đếm các đoạn thẳng bao quanh viền (chu vi) và đếm số ô vuông đơn vị bên trong (diện tích).',
        },
        meeTip: {
          pose: 'guide',
          quote: 'Chu vi là bước chân đi dạo quanh bờ rào, diện tích là tấm thảm cỏ xanh mướt trải bên trong!',
          storyAdvice: 'Đừng nhầm lẫn đơn vị: Chu vi dùng cm, còn Diện tích phải có số 2 nhỏ trên đầu là cm² nhé!',
        },
        interactivePractice: {
          instruction: 'Tính diện tích hình chữ nhật có chiều dài 6 cm và chiều rộng 4 cm.',
          taskType: 'area_calc',
          taskConfig: { length: 6, width: 4, expectedArea: 24, expectedPerimeter: 20 },
          successFeedback: 'Quá chuẩn! Diện tích $S = 6 \\times 4 = 24\\text{ cm}^2$, Chu vi $P = (6+4) \\times 2 = 20\\text{ cm}$!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Diện Tích Khu Vườn',
          questionText: 'Một khu vườn hình vuông có chu vi là $20\\text{ m}$. Hỏi diện tích của khu vườn đó là bao nhiêu?',
          options: [
            { id: 'A', label: 'A', text: '$20\\text{ m}^2$', isCorrect: false },
            { id: 'B', label: 'B', text: '$25\\text{ m}^2$', isCorrect: true },
            { id: 'C', label: 'C', text: '$16\\text{ m}^2$', isCorrect: false },
            { id: 'D', label: 'D', text: '$36\\text{ m}^2$', isCorrect: false },
          ],
          correctExplanation: 'Cạnh vườn hình vuông: $20 : 4 = 5\\text{ m}$. Diện tích vườn: $5 \\times 5 = 25\\text{ m}^2$.',
          formulaExplanation: 'a = 20:4 = 5 \\Rightarrow S = 5 \\times 5 = 25\\text{ m}^2',
        },
      },
    ],
  },

  // ── 🚩 CHẶNG 5: HÌNH HỌC KHÔNG GIAN 3D & ĐẤU TRƯỜNG OLYMPIC ──
  {
    id: 'stage-5',
    stageNumber: 5,
    title: 'Chặng 5: Hình Học Không Gian 3D & Đấu Trường Olympic',
    subtitle: 'Đếm khối 3D theo tầng, gấp hộp 3D cube nets, mê cung toạ độ, đố que diêm & chung kết ASMO',
    icon: '🏆',
    themeColor: 'purple',
    gradient: 'from-purple-600 via-indigo-600 to-pink-600',
    description: 'Chinh phục các dạng toán tư duy không gian 3D đỉnh cao của kỳ thi Olympic ASMO Quốc Tế cùng cúp vô địch Mèo Mee!',
    requiredStarsToUnlock: 48,
    lessons: [
      {
        id: 's5-cube-layers',
        stageId: 'stage-5',
        stageNumber: 5,
        lessonNumber: 1,
        title: 'Đếm Khối 3D Theo Tầng: Nhìn Xuyên Không Gian',
        subtitle: 'Bí kíp đếm khối lập phương bị che khuất bằng phương pháp bóc tách từng tầng',
        icon: '🧊',
        xpReward: 100,
        visualType: 'cube_3d',
        theory: {
          title: 'Phương Pháp Đếm Khối 3D Theo Tầng (Layer Method)',
          summary: 'Trong không gian 3D, các khối lập phương ở tầng trên luôn phải có khối đỡ ở tầng dưới. Đếm lần lượt từ Tầng 1 (đáy) lên Tầng 2, Tầng 3 để không bao giờ bị sót khối ẩn.',
          keyTakeaways: [
            'Nguyên lý trọng lực: Khối ở tầng 2 bắt buộc phải có khối nằm ngay dưới nó ở tầng 1.',
            'Công thức tổng: $\\text{Tổng khối} = \\text{Khối tầng 1} + \\text{Khối tầng 2} + \\text{Khối tầng 3}$.',
            'Xoay mô hình 3D 360 độ để quan sát mặt sau và góc khuất.',
          ],
          formulaLatex: 'N_{\\text{total}} = \\sum_{k=1}^h N_{\\text{layer } k}',
          visualHint: 'Dùng chuột hoặc ngón tay xoay mô hình khối 3D trong không gian Three.js.',
        },
        meeTip: {
          pose: 'celebrate',
          quote: 'Xây nhà thì phải xây từ móng! Đếm khối 3D con cũng đếm từ tầng 1 trệt lên tầng lầu nhé!',
          storyAdvice: 'Khối ở tầng cao không thể bay lơ lửng trong không khí được, bên dưới nó chắc chắn có khối đỡ!',
        },
        interactivePractice: {
          instruction: 'Đếm tổng số khối lập phương đơn vị trong khối tháp 3 tầng.',
          taskType: 'cube_counter',
          taskConfig: { layers: [6, 3, 1], expectedTotal: 10 },
          successFeedback: 'Tuyệt đỉnh! Tầng 1 (6) + Tầng 2 (3) + Tầng 3 (1) = 10 khối lập phương!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Đếm Khối Lập Phương Ẩn ASMO',
          questionText: 'Một khối kiến trúc xếp từ các hình lập phương nhỏ gồm: Tầng 1 có $9$ khối, Tầng 2 có $4$ khối, Tầng 3 có $1$ khối. Hỏi có tất cả bao nhiêu khối lập phương nhỏ?',
          options: [
            { id: 'A', label: 'A', text: '12 khối', isCorrect: false },
            { id: 'B', label: 'B', text: '13 khối', isCorrect: false },
            { id: 'C', label: 'C', text: '14 khối', isCorrect: true },
            { id: 'D', label: 'D', text: '15 khối', isCorrect: false },
          ],
          correctExplanation: 'Tổng số khối = $9 + 4 + 1 = 14$ khối lập phương.',
          formulaExplanation: '9 + 4 + 1 = 14',
        },
      },
      {
        id: 's5-cube-nets',
        stageId: 'stage-5',
        stageNumber: 5,
        lessonNumber: 2,
        title: 'Gấp Hộp 3D Cube Nets: Trải Phẳng & Gấp Khối',
        subtitle: 'Nhận biết 11 dạng lưới trải phẳng (Cube Nets) có thể gấp thành hình lập phương',
        icon: '📦',
        xpReward: 100,
        visualType: 'cube_net',
        theory: {
          title: 'Quy Tắc Lưới Trải Phẳng Hình Lập Phương',
          summary: 'Hình lập phương có đúng 6 mặt vuông bằng nhau. Có đúng 11 hình dạng lưới trải phẳng 2D có thể gấp khít thành một khối lập phương kín mà không bị đè mặt.',
          keyTakeaways: [
            'Hai mặt đối diện không bao giờ có chung cạnh ở lưới trải phẳng.',
            'Dạng phổ biến 1-4-1 (hàng giữa 4 ô, 2 ô hai bên).',
            'Không có cụm 4 ô vuông tạo thành hình vuông lớn $2 \\times 2$.',
          ],
          formulaLatex: '\\text{Cube Nets} \\in \\{11 \\text{ mẫu hợp lệ}\\}',
          visualHint: 'Bấm nút "Gấp Hộp" để xem hoạt hình 6 mặt vuông tự động gập thành khối 3D.',
        },
        meeTip: {
          pose: 'thinking',
          quote: 'Mỗi chiếc hộp giấy gói quà sinh nhật đều được cắt ra từ một tấm lưới trải phẳng xinh xắn!',
          storyAdvice: 'Nhìn nhanh: nếu thấy 4 ô vuông dính thành khối vuông $2 \\times 2$ thì chắc chắn không gấp thành hộp được!',
        },
        interactivePractice: {
          instruction: 'Chọn mặt đối diện với mặt số 1 khi gấp lưới trải phẳng 1-4-1.',
          taskType: 'opposite_face',
          taskConfig: { netType: '1-4-1', targetFace: 1, expectedOpposite: 3 },
          successFeedback: 'Chính xác! Mặt 1 đối diện với mặt 3 qua 1 bước nhảy ô!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Tìm Mặt Đối Diện Khối Lập Phương',
          questionText: 'Trong một lưới trải phẳng gồm 6 mặt đánh số từ 1 đến 6 xếp thẳng hàng 4 ô (2, 3, 4, 5) cùng ô 1 ở trên ô 3 và ô 6 ở dưới ô 4. Mặt nào đối diện với mặt 2?',
          options: [
            { id: 'A', label: 'A', text: 'Mặt số 3', isCorrect: false },
            { id: 'B', label: 'B', text: 'Mặt số 4', isCorrect: true },
            { id: 'C', label: 'C', text: 'Mặt số 5', isCorrect: false },
            { id: 'D', label: 'D', text: 'Mặt số 6', isCorrect: false },
          ],
          correctExplanation: 'Trên hàng 4 ô liên tiếp (2, 3, 4, 5), hai ô cách nhau một ô sẽ đối diện nhau. Vậy mặt 2 đối diện mặt 4.',
          formulaExplanation: '2 \\leftrightarrow 4, 3 \\leftrightarrow 5, 1 \\leftrightarrow 6',
        },
      },
      {
        id: 's5-grid-maze',
        stageId: 'stage-5',
        stageNumber: 5,
        lessonNumber: 3,
        title: 'Mê Cung Toạ Độ: Tìm Đường Đi Ngắn Nhất',
        subtitle: 'Quy luật đi sang phải và đi lên: Đếm số đường đi bằng quy tắc cộng tam giác Pascal',
        icon: '🧭',
        xpReward: 110,
        visualType: 'grid_maze',
        theory: {
          title: 'Quy Tắc Đếm Đường Đi Trên Lưới Toạ Độ (Grid Path)',
          summary: 'Muốn đi từ góc dưới-trái $(0,0)$ đến góc trên-phải $(m,n)$ chỉ bằng các bước sang phải và đi lên, số cách đến một nút bằng tổng số cách đến 2 nút liền kề trước nó.',
          keyTakeaways: [
            'Quy tắc cộng Pascal: $C(x, y) = C(x-1, y) + C(x, y-1)$.',
            'Tất cả các điểm trên cạnh biên chỉ có đúng 1 cách đi.',
            'Công thức tổ hợp tổng quát: $N = \\binom{m+n}{m} = \\frac{(m+n)!}{m! n!}$.',
          ],
          formulaLatex: '\\text{Số đường đi} = \\binom{m+n}{m} = \\frac{(m+n)!}{m! n!}',
          visualHint: 'Quan sát các con số nhảy trên từng giao điểm của lưới toạ độ.',
        },
        meeTip: {
          pose: 'guide',
          quote: 'Mỗi ngã tư là một điểm cộng! Con chỉ cần cộng số cách từ hướng trái sang và hướng dưới lên thôi!',
          storyAdvice: 'Phương pháp cộng dồn từng nút của Pascal là vũ khí tối thượng giúp giải mọi bài mê cung ASMO!',
        },
        interactivePractice: {
          instruction: 'Tìm số cách đi từ điểm A đến điểm B trên lưới $2 \\times 2$.',
          taskType: 'grid_path_counter',
          taskConfig: { rows: 2, cols: 2, expectedWays: 6 },
          successFeedback: 'Đúng rồi! Có tất cả 6 đường đi ngắn nhất trên lưới $2 \\times 2$!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Số Đường Đi Lưới $3 \\times 2$',
          questionText: 'Có bao nhiêu cách đi từ góc dưới bên trái đến góc trên bên phải của một lưới ô vuông kích thước $3 \\times 2$ nếu chỉ được đi sang phải và đi lên?',
          options: [
            { id: 'A', label: 'A', text: '8 cách', isCorrect: false },
            { id: 'B', label: 'B', text: '10 cách', isCorrect: true },
            { id: 'C', label: 'C', text: '12 cách', isCorrect: false },
            { id: 'D', label: 'D', text: '15 cách', isCorrect: false },
          ],
          correctExplanation: 'Công thức tổ hợp: $\\binom{3+2}{2} = \\binom{5}{2} = \\frac{5 \\times 4}{2} = 10$ cách đi.',
          formulaExplanation: '\\binom{5}{2} = 10',
        },
      },
      {
        id: 's5-matchstick',
        stageId: 'stage-5',
        stageNumber: 5,
        lessonNumber: 4,
        title: 'Đố Que Diêm Hình Học: Tư Duy Biến Hình',
        subtitle: 'Di chuyển 1 que diêm để biến phép tính sai thành đúng hoặc tạo thêm hình vuông',
        icon: '🪵',
        xpReward: 110,
        visualType: 'matchstick',
        theory: {
          title: 'Nghệ Thuật Giải Đố Que Diêm (Matchstick Puzzles)',
          summary: 'Trò chơi que diêm rèn luyện tư duy linh hoạt và trí tưởng tượng hình học không gian. Đếm số cạnh chung giữa các hình vuông/tam giác ghép cạnh.',
          keyTakeaways: [
            '1 hình vuông độc lập cần 4 que diêm.',
            '2 hình vuông ghép chung 1 cạnh chỉ cần: $4 + 3 = 7$ que diêm.',
            'Công thức $n$ hình vuông liền kề: $\\text{Số que} = 3n + 1$.',
          ],
          formulaLatex: '\\text{Số que diêm} = 4k - \\text{Số cạnh chung}',
          visualHint: 'Bấm vào que diêm để nhấc lên và đặt vào vị trí mới.',
        },
        meeTip: {
          pose: 'celebrate',
          quote: 'Mỗi que diêm có một đầu đỏ xinh, ghép chung cạnh giúp chúng mình tiết kiệm que diêm tối đa!',
          storyAdvice: 'Hãy đếm số cạnh chung trước: cứ 2 hình dính nhau là tiết kiệm được 1 que diêm đấy!',
        },
        interactivePractice: {
          instruction: 'Tính số que diêm cần thiết để xếp thành 3 hình vuông liền kề thẳng hàng.',
          taskType: 'matchstick_row',
          taskConfig: { squares: 3, expectedMatches: 10 },
          successFeedback: 'Tuyệt vời! $3 \\times 3 + 1 = 10$ que diêm!',
        },
        quiz: {
          questionTitle: 'Thử Thách: Xếp Hình Vuông Que Diêm ASMO',
          questionText: 'Để xếp thành một hàng gồm $5$ hình vuông liền kề nhau, cần dùng ít nhất bao nhiêu que diêm cùng độ dài?',
          options: [
            { id: 'A', label: 'A', text: '15 que diêm', isCorrect: false },
            { id: 'B', label: 'B', text: '16 que diêm', isCorrect: true },
            { id: 'C', label: 'C', text: '18 que diêm', isCorrect: false },
            { id: 'D', label: 'D', text: '20 que diêm', isCorrect: false },
          ],
          correctExplanation: 'Hình đầu tiên cần 4 que, mỗi hình tiếp theo chỉ cần thêm 3 que: $4 + 4 \\times 3 = 16$ que diêm (hoặc $3 \\times 5 + 1 = 16$).',
          formulaExplanation: '3 \\times 5 + 1 = 16',
        },
      },
      {
        id: 's5-olympic-arena',
        stageId: 'stage-5',
        stageNumber: 5,
        lessonNumber: 5,
        title: 'Đấu Trường Vô Địch Olympic ASMO: Vinh Quang Đỉnh Cao',
        subtitle: 'Thử thách tổng hợp 5 chuyên đề trọng điểm: Nhận cúp vàng & danh hiệu Thần Đồng Toán Học!',
        icon: '👑',
        xpReward: 150,
        visualType: 'olympic_arena',
        theory: {
          title: 'Tổng Kết Toàn Diện Kiến Thức LMS ASMO',
          summary: 'Chúc mừng bạn đã vượt qua 4 chặng học kiên cường! Đây là bài kiểm tra vinh quang kết hợp toàn bộ kỹ năng: Số học, Phép nhân chia, Phân số, Đo lường và Hình học 3D.',
          keyTakeaways: [
            'Tự tin đọc kỹ đề bài và vẽ phác sơ đồ tư duy.',
            'Áp dụng linh hoạt các mẹo tính nhanh của Mèo Mee.',
            'Kiểm tra lại kết quả và quản lý thời gian thi đấu khoa học.',
          ],
          formulaLatex: '\\text{Thần Đồng ASMO} = \\text{Chăm chỉ} + \\text{Phương pháp đúng} + \\text{Mèo Mee}',
          visualHint: 'Sẵn sàng bước lên bục vinh quang rực rỡ pháo hoa!',
        },
        meeTip: {
          pose: 'celebrate',
          quote: 'Mèo Mee vô cùng tự hào về con! Con đã sẵn sàng cho mọi kỳ thi Olympic Toán Quốc Tế rồi!',
          storyAdvice: 'Bình tĩnh, tự tin, đọc kỹ đề bài và tỏa sáng rực rỡ nhé nhà vô địch tương lai!',
        },
        interactivePractice: {
          instruction: 'Vượt qua câu hỏi cuối cùng để mở khóa Cúp Vàng Vô Địch Olympic ASMO!',
          taskType: 'champion_step',
          taskConfig: { finalStage: true },
          successFeedback: '🎉 CHÚC MỪNG BẠN ĐÃ TỐT NGHIỆP XUẤT SẮC TOÀN BỘ LỘ TRÌNH LMS ASMO!',
        },
        quiz: {
          questionTitle: 'Thử Thách Đỉnh Cao: Câu Đố Logic Tổng Hợp ASMO',
          questionText: 'Một đoàn tàu có $120$ hành khách. Ở ga thứ nhất có $\\frac{1}{4}$ số khách xuống tàu và có $15$ khách mới lên tàu. Hỏi trên tàu lúc này có bao nhiêu hành khách?',
          options: [
            { id: 'A', label: 'A', text: '100 hành khách', isCorrect: false },
            { id: 'B', label: 'B', text: '105 hành khách', isCorrect: true },
            { id: 'C', label: 'C', text: '110 hành khách', isCorrect: false },
            { id: 'D', label: 'D', text: '95 hành khách', isCorrect: false },
          ],
          correctExplanation: 'Số khách xuống tàu: $120 : 4 = 30$ người. Số khách còn lại: $120 - 30 = 90$ người. Sau khi thêm 15 người: $90 + 15 = 105$ hành khách.',
          formulaExplanation: '120 - (120 : 4) + 15 = 120 - 30 + 15 = 105',
        },
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// PROGRESS & LOCAL STORAGE PERSISTENCE HELPERS
// ════════════════════════════════════════════════════════════════════════════

const LMS_STORAGE_KEY = 'asmo_curriculum_lms_progress_v1'

export function getLmsProgress(): AsmoLmsProgressState {
  if (typeof window === 'undefined') {
    return {
      lessons: {},
      totalStars: 0,
      totalXp: 0,
      unlockedStages: ['stage-1'],
    }
  }

  try {
    const raw = localStorage.getItem(LMS_STORAGE_KEY)
    if (!raw) {
      return {
        lessons: {},
        totalStars: 0,
        totalXp: 0,
        unlockedStages: ['stage-1'],
      }
    }
    const parsed = JSON.parse(raw) as AsmoLmsProgressState
    return parsed
  } catch {
    return {
      lessons: {},
      totalStars: 0,
      totalXp: 0,
      unlockedStages: ['stage-1'],
    }
  }
}

export function saveLmsLessonCompletion(
  lessonId: string,
  stars: number,
  xpEarned: number,
): AsmoLmsProgressState {
  const current = getLmsProgress()
  const existing = current.lessons[lessonId]

  const bestStars = Math.max(existing?.stars || 0, Math.min(Math.max(stars, 1), 3))
  const newXp = existing?.completed ? current.totalXp : current.totalXp + xpRewardForStars(xpEarned, bestStars)

  const updatedLessons: Record<string, AsmoLmsLessonProgress> = {
    ...current.lessons,
    [lessonId]: {
      lessonId,
      completed: true,
      stars: bestStars,
      xpEarned: xpRewardForStars(xpEarned, bestStars),
      completedAt: new Date().toISOString(),
    },
  }

  // Calculate new total stars
  const totalStars = Object.values(updatedLessons).reduce((sum, item) => sum + item.stars, 0)

  // Determine unlocked stages
  const unlockedStages = ASMO_LMS_STAGES.filter(
    (stage) => totalStars >= stage.requiredStarsToUnlock || stage.stageNumber === 1,
  ).map((stage) => stage.id)

  const newState: AsmoLmsProgressState = {
    lessons: updatedLessons,
    totalStars,
    totalXp: newXp,
    unlockedStages,
  }

  try {
    localStorage.setItem(LMS_STORAGE_KEY, JSON.stringify(newState))
  } catch {
    // ignore quota errors
  }

  return newState
}

function xpRewardForStars(baseXp: number, stars: number): number {
  if (stars === 3) return baseXp
  if (stars === 2) return Math.round(baseXp * 0.8)
  return Math.round(baseXp * 0.6)
}

export function isLessonUnlocked(
  lesson: AsmoLmsLesson,
  progress: AsmoLmsProgressState,
): boolean {
  // First lesson of Stage 1 is always unlocked
  if (lesson.stageNumber === 1 && lesson.lessonNumber === 1) return true

  // Check if stage is unlocked
  const stage = ASMO_LMS_STAGES.find((s) => s.id === lesson.stageId)
  if (!stage) return false
  if (progress.totalStars < stage.requiredStarsToUnlock && stage.stageNumber > 1) return false

  // Within the same stage, previous lesson must be completed
  if (lesson.lessonNumber > 1) {
    const prevLesson = stage.lessons.find((l) => l.lessonNumber === lesson.lessonNumber - 1)
    if (prevLesson && !progress.lessons[prevLesson.id]?.completed) {
      return false
    }
  } else if (stage.stageNumber > 1) {
    // If it's the first lesson of a subsequent stage, the last lesson of the previous stage or required stars
    const prevStage = ASMO_LMS_STAGES.find((s) => s.stageNumber === stage.stageNumber - 1)
    if (prevStage) {
      const lastLessonOfPrevStage = prevStage.lessons[prevStage.lessons.length - 1]
      if (lastLessonOfPrevStage && !progress.lessons[lastLessonOfPrevStage.id]?.completed) {
        return progress.totalStars >= stage.requiredStarsToUnlock
      }
    }
  }

  return true
}

export function resetLmsProgress(): AsmoLmsProgressState {
  const empty: AsmoLmsProgressState = {
    lessons: {},
    totalStars: 0,
    totalXp: 0,
    unlockedStages: ['stage-1'],
  }
  try {
    localStorage.removeItem(LMS_STORAGE_KEY)
  } catch {
    // ignore
  }
  return empty
}

export function getStageStats(stageId: string, progress: AsmoLmsProgressState) {
  const stage = ASMO_LMS_STAGES.find((s) => s.id === stageId)
  if (!stage) return { totalLessons: 0, completedLessons: 0, totalStars: 0, maxStars: 0, isUnlocked: false }

  const totalLessons = stage.lessons.length
  const maxStars = totalLessons * 3
  const completedLessons = stage.lessons.filter((l) => progress.lessons[l.id]?.completed).length
  const totalStars = stage.lessons.reduce((acc, l) => acc + (progress.lessons[l.id]?.stars || 0), 0)
  const isUnlocked = progress.totalStars >= stage.requiredStarsToUnlock || stage.stageNumber === 1

  return {
    totalLessons,
    completedLessons,
    totalStars,
    maxStars,
    isUnlocked,
    isCompleted: completedLessons === totalLessons,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 3-TIER MULTI-LEVEL PRACTICE CHALLENGES GENERATOR & DIAGNOSTIC VALIDATOR
// ════════════════════════════════════════════════════════════════════════════

export function getLessonPracticeChallenges(lesson: AsmoLmsLesson): AsmoLmsPracticeChallenge[] {
  if (lesson.interactivePractice.challenges && lesson.interactivePractice.challenges.length === 3) {
    return lesson.interactivePractice.challenges
  }

  const { visualType, id } = lesson

  // 1. Apple Drop (Gộp Táo)
  if (visualType === 'apple_drop') {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Gộp Táo Khởi Động',
        instruction: 'Bé hãy bấm thêm vào Giỏ A có 3 quả táo đỏ 🍎 và Giỏ B có 4 quả táo xanh 🍏 để tính tổng!',
        hint: 'Bấm nút [+ 🍎 Thêm] để Giỏ A có 3 quả và Giỏ B có 4 quả nhé.',
        taskType: 'target_sum',
        taskConfig: { targetA: 3, targetB: 4, targetSum: 7 },
        initialState: { applesA: 1, applesB: 1 },
        successFeedback: 'Tuyệt vời bé ơi! 3 quả đỏ + 4 quả xanh = 7 quả táo thơm ngon!',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Tìm Ẩn Số Giỏ Xanh',
        instruction: 'Mèo Mee cần 8 quả táo. Giỏ A đã có sẵn 5 quả đỏ 🍎. Bé hãy bấm thêm vào Giỏ B số táo xanh 🍏 cần thiết để đạt đúng 8 quả!',
        hint: 'Ta có $5 + ? = 8$. Bé hãy bấm thêm táo xanh vào Giỏ B để tổng bằng 8 nhé!',
        taskType: 'missing_addend',
        taskConfig: { targetA: 5, targetB: 3, targetSum: 8 },
        initialState: { applesA: 5, applesB: 1 },
        successFeedback: 'Xuất sắc! 5 quả đỏ + 3 quả xanh = đúng 8 quả táo Mèo Mee cần!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Sáng Tạo Phép Cộng Tròn 10',
        instruction: 'Thử thách IQ: Bé hãy tạo một phép cộng tự do giữa Giỏ A và Giỏ B sao cho tổng đúng bằng 10 quả táo!',
        hint: 'Bé có thể chọn 1+9, 2+8, 3+7, 4+6 hoặc 5+5 quả táo nhé!',
        taskType: 'free_sum_10',
        taskConfig: { targetSum: 10, minEach: 1 },
        initialState: { applesA: 2, applesB: 2 },
        successFeedback: 'Đỉnh cao toán học! Bé đã tạo thành công phép cộng tròn 10 tuyệt đẹp!',
      },
    ]
  }

  // 2. Balloon Pop (Nổ Bóng Trừ)
  if (visualType === 'balloon_pop') {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Nổ Bóng Khởi Động',
        instruction: 'Bé hãy bấm nổ 4 quả bóng bay 🎈 để còn lại đúng 6 quả bóng bay trên bầu trời ($10 - 4 = 6$)!',
        hint: 'Bấm trực tiếp vào 4 quả bóng bất kỳ để làm chúng nổ 💥 nhé!',
        taskType: 'pop_balloons',
        taskConfig: { targetPop: 4, targetRemaining: 6 },
        initialState: { poppedBalloons: [] },
        successFeedback: 'Chuẩn xác! 10 - 4 = 6 quả bóng còn lại nguyên vẹn!',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Tìm Ẩn Số Bóng Bay',
        instruction: 'Bầu trời đang có 10 quả bóng. Bé hãy bấm nổ số bóng cần thiết để chỉ còn lại đúng 3 quả bóng bay!',
        hint: 'Muốn còn lại 3 quả bóng, ta lấy $10 - 3 = 7$ quả bóng cần nổ!',
        taskType: 'pop_to_target',
        taskConfig: { targetPop: 7, targetRemaining: 3 },
        initialState: { poppedBalloons: [] },
        successFeedback: 'Rất giỏi! Nổ 7 quả thì 10 - 7 = 3 quả bóng còn lại trên bầu trời!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Thử Thách IQ: Chia Đôi Chùm Bóng',
        instruction: 'Thử thách IQ: Bé hãy làm nổ đúng 5 quả bóng để số bóng nổ bằng đúng số bóng còn lại ($10 - 5 = 5$)!',
        hint: 'Bấm nổ đúng 5 quả bóng để chùm bóng chia làm 2 nửa bằng nhau nhé!',
        taskType: 'pop_half',
        taskConfig: { targetPop: 5, targetRemaining: 5 },
        initialState: { poppedBalloons: [] },
        successFeedback: 'Xuất sắc! 10 - 5 = 5, chùm bóng đã được chia đôi hoàn hảo!',
      },
    ]
  }

  // 3. Make 10 Friends (Kết Bạn Tròn 10: Ghép Cặp Thần Tốc)
  if (visualType === 'make10') {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Ghép Cặp Tròn 10 Khởi Động',
        instruction: 'Cho 4 số [1, 9, 3, 7]. Bé hãy bấm chọn ghép 2 cặp bạn thân có tổng bằng 10: (1, 9) và (3, 7)!',
        hint: '1 đi với 9 ($1 + 9 = 10$) và 3 đi với 7 ($3 + 7 = 10$) nhé!',
        taskType: 'make10_pairs',
        taskConfig: {
          numbers: [1, 9, 3, 7],
          targetPairs: [[1, 9], [3, 7]],
          expectedPairCount: 2,
        },
        initialState: { numbers: [1, 9, 3, 7], pairedMake10: [] },
        successFeedback: 'Xuất sắc bé ơi! 1 + 9 = 10 và 3 + 7 = 10, đúng 2 cặp bạn thân tròn 10!',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Tìm Ẩn Số 3 Cặp Bạn Thân',
        instruction: 'Cho 6 số [2, 8, 4, 6, 5, 5]. Bé hãy tìm và ghép đủ 3 cặp bạn thân tròn 10: (2, 8), (4, 6) và (5, 5)!',
        hint: '2 đi với 8 ($2+8=10$), 4 đi với 6 ($4+6=10$) và 5 đi với 5 ($5+5=10$) nhé!',
        taskType: 'make10_pairs',
        taskConfig: {
          numbers: [2, 8, 4, 6, 5, 5],
          targetPairs: [[2, 8], [4, 6], [5, 5]],
          expectedPairCount: 3,
        },
        initialState: { numbers: [2, 8, 4, 6, 5, 5], pairedMake10: [] },
        successFeedback: 'Tuyệt vời! Bé đã tìm ra đủ 3 cặp bạn thân: (2, 8), (4, 6) và (5, 5)!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Chinh Phục IQ: Tính Nhanh Dãy Số ASMO',
        instruction: 'Thử thách IQ: Cho dãy 5 số [1, 3, 5, 7, 9]. Bé hãy ghép 2 cặp tròn 10: (1, 9) và (3, 7), tính tổng $(1+9) + (3+7) + 5 = 25$!',
        hint: 'Ghép 1 với 9 thành 10, 3 với 7 thành 10, rồi cộng thêm 5 còn lại: $10 + 10 + 5 = 25$!',
        taskType: 'make10_sequence',
        taskConfig: {
          numbers: [1, 3, 5, 7, 9],
          targetPairs: [[1, 9], [3, 7]],
          leftover: 5,
          expectedSum: 25,
          expectedPairCount: 2,
        },
        initialState: { numbers: [1, 3, 5, 7, 9], pairedMake10: [] },
        successFeedback: 'Đỉnh cao Olympic ASMO! (1+9) + (3+7) + 5 = 10 + 10 + 5 = 25 tuyệt đẹp!',
      },
    ]
  }

  // 4. Cake Tray (Khay Bánh Phép Nhân)
  if (visualType === 'cake_tray') {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Xếp Khay Bánh $3 \\times 4$',
        instruction: 'Bé hãy chỉnh khay bánh có đúng 3 hàng và 4 cột để tạo ra 12 chiếc bánh 🍰 ($3 \\times 4 = 12$)!',
        hint: 'Bấm nút [+] hoặc [-] ở mục Số Hàng thành 3 và Số Cột thành 4 nhé.',
        taskType: 'grid_resize',
        taskConfig: { targetRows: 3, targetCols: 4, targetTotal: 12 },
        initialState: { cakeRows: 2, cakeCols: 2 },
        successFeedback: 'Chính xác! 3 hàng × 4 cột = 12 chiếc bánh thơm ngon!',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Tìm Ẩn Số Cột Bánh',
        instruction: 'Mèo Mee có 4 hàng bánh. Bé hãy điều chỉnh số cột để tạo đúng 20 chiếc bánh kem dâu thơm ngon!',
        hint: 'Ta có $4 \\times ? = 20$. Bé hãy tìm số cột bánh phù hợp nhé!',
        taskType: 'missing_factor',
        taskConfig: { targetRows: 4, targetCols: 5, targetTotal: 20 },
        initialState: { cakeRows: 4, cakeCols: 2 },
        successFeedback: 'Tuyệt vời! 4 hàng × 5 cột = 20 chiếc bánh kem dâu!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Thử Thách IQ: Tạo 24 Chiếc Bánh',
        instruction: 'Thử thách IQ: Bé hãy tạo một khay bánh có tổng đúng bằng 24 chiếc bánh (ví dụ 4×6 hoặc 3×8)!',
        hint: 'Bé có thể chọn 4 hàng 6 cột ($4 \\times 6 = 24$) nhé!',
        taskType: 'free_product_24',
        taskConfig: { targetTotal: 24 },
        initialState: { cakeRows: 3, cakeCols: 3 },
        successFeedback: 'Quá đỉnh! Bé đã tạo thành công khay 24 chiếc bánh tuyệt ngon!',
      },
    ]
  }

  // 4. Candy Division & Remainder
  if (visualType === 'candy_division' || visualType === 'div_remainder') {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Chia Kẹo Đều Khởi Động',
        instruction: 'Bé hãy chỉnh 12 chiếc kẹo chia đều vào 3 đĩa để mỗi đĩa nhận được 4 chiếc kẹo ($12 : 3 = 4$)!',
        hint: 'Chỉnh tổng số kẹo thành 12 và số đĩa thành 3 nhé.',
        taskType: 'equal_split',
        taskConfig: { candyTotal: 12, candyPlates: 3, candiesPerPlate: 4 },
        initialState: { candyTotal: 9, candyPlates: 3 },
        successFeedback: 'Chính xác! 12 : 3 = 4 cái kẹo trên mỗi đĩa!',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Chia 15 Kẹo Cho 3 Bạn',
        instruction: 'Có 15 chiếc kẹo 🍬. Bé hãy chia vào 3 đĩa để mỗi đĩa có đúng 5 chiếc kẹo ($15 : 3 = 5$)!',
        hint: 'Chỉnh số kẹo thành 15 và số đĩa thành 3 nhé.',
        taskType: 'split_15',
        taskConfig: { candyTotal: 15, candyPlates: 3, candiesPerPlate: 5 },
        initialState: { candyTotal: 12, candyPlates: 2 },
        successFeedback: 'Rất tốt! 15 : 3 = 5 cái kẹo trên mỗi đĩa!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Phép Chia Có Dư Thần Tốc',
        instruction: 'Thử thách IQ: Chỉnh 14 cái kẹo chia vào 3 đĩa để xem mỗi đĩa có 4 cái và còn dư 2 cái ($14 = 3 \\times 4 + 2$)!',
        hint: 'Chỉnh tổng kẹo là 14 và số đĩa là 3.',
        taskType: 'remainder_split',
        taskConfig: { candyTotal: 14, candyPlates: 3, candiesPerPlate: 4, remainder: 2 },
        initialState: { candyTotal: 12, candyPlates: 3 },
        successFeedback: 'Tuyệt vời! 14 : 3 = 4 (dư 2 kẹo), đúng quy tắc chia có dư!',
      },
    ]
  }

  // 5. Pizza Fraction (Phân Số Pizza)
  if (
    visualType === 'pizza_fraction' ||
    visualType === 'compare_fractions' ||
    visualType === 'fraction_add_sub' ||
    visualType === 'fraction_of_number'
  ) {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Tạo Phân Số $\\frac{3}{8}$ Pizza',
        instruction: 'Bé hãy chọn 8 lát cắt và bấm chọn 3 lát pizza 🍕 để tạo phân số $\\frac{3}{8}$!',
        hint: 'Chọn số lát cắt là 8, sau đó bấm vào 3 lát bánh pizza để tô màu đỏ nhé.',
        taskType: 'slice_selector',
        taskConfig: { pizzaSlices: 8, pizzaShaded: 3 },
        initialState: { pizzaSlices: 8, pizzaShaded: 1 },
        successFeedback: 'Xuất sắc! Bạn đã tạo thành công phân số 3/8 chiếc bánh pizza!',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Tạo Nửa Chiếc Bánh $\\frac{1}{2}$',
        instruction: 'Bé hãy chọn 4 lát cắt và lấy 2 lát để tạo phân số $\\frac{2}{4}$ (tức $\\frac{1}{2}$ nửa chiếc bánh)!',
        hint: 'Chọn 4 lát cắt và bấm chọn 2 lát bánh nhé.',
        taskType: 'half_pizza',
        taskConfig: { pizzaSlices: 4, pizzaShaded: 2 },
        initialState: { pizzaSlices: 4, pizzaShaded: 1 },
        successFeedback: 'Tuyệt vời! 2/4 chính là 1/2 nửa chiếc bánh pizza thơm ngon!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Thử Thách IQ: Tạo Phân Số $\\frac{5}{6}$',
        instruction: 'Thử thách IQ: Bé hãy chọn 6 lát cắt và lấy 5 lát để biểu thị phân số $\\frac{5}{6}$ chiếc bánh pizza!',
        hint: 'Chọn 6 lát cắt và chọn 5 lát bánh.',
        taskType: 'fraction_5_6',
        taskConfig: { pizzaSlices: 6, pizzaShaded: 5 },
        initialState: { pizzaSlices: 6, pizzaShaded: 2 },
        successFeedback: 'Đỉnh cao! Bạn đã tạo ra phân số 5/6 chiếc bánh pizza!',
      },
    ]
  }

  // 6. Analog Clock (Đồng Hồ Kim)
  if (visualType === 'analog_clock' || visualType === 'elapsed_time') {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Chỉnh Giờ 8:15',
        instruction: 'Bé hãy chỉnh kim đồng hồ ⏰ về đúng 8 giờ 15 phút sáng!',
        hint: 'Bấm nút Chỉnh Giờ thành 8 và nút Chỉnh Phút thành 15p nhé.',
        taskType: 'clock_setter',
        taskConfig: { clockHour: 8, clockMinute: 15 },
        initialState: { clockHour: 12, clockMinute: 0 },
        successFeedback: 'Chính xác! Đồng hồ đang chỉ đúng 8:15!',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Chỉnh Giờ Rưỡi 3:30',
        instruction: 'Bé hãy chỉnh kim đồng hồ về đúng 3 giờ 30 phút chiều (3 giờ rưỡi)!',
        hint: 'Kim ngắn ở giữa 3 và 4, kim dài chỉ số 6 (30 phút).',
        taskType: 'clock_half',
        taskConfig: { clockHour: 3, clockMinute: 30 },
        initialState: { clockHour: 1, clockMinute: 0 },
        successFeedback: 'Chuẩn xác! Đồng hồ đang chỉ đúng 3:30 (3 giờ rưỡi)!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Thử Thách IQ: Chỉnh Giờ 10:45',
        instruction: 'Thử thách IQ: Bé hãy chỉnh đồng hồ về đúng 10 giờ 45 phút (11 giờ kém 15 phút)!',
        hint: 'Chỉnh giờ thành 10 và phút thành 45p nhé.',
        taskType: 'clock_45',
        taskConfig: { clockHour: 10, clockMinute: 45 },
        initialState: { clockHour: 12, clockMinute: 0 },
        successFeedback: 'Xuất sắc! Bé đã làm chủ hoàn toàn mặt đồng hồ kim!',
      },
    ]
  }

  // 7. Balance Scale (Cân Thăng Bằng)
  if (visualType === 'balance_scale') {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Cân Thăng Bằng 2 Quả Dưa',
        instruction: 'Biết 1 Dưa = 3 Táo. Đĩa trái có 2 quả Dưa, bé hãy chỉnh đĩa phải có 6 quả Táo để cân thăng bằng!',
        hint: 'Ta có $2 \\times 3 = 6$ quả táo.',
        taskType: 'scale_balance',
        taskConfig: { scaleLeft: 2, scaleRight: 6 },
        initialState: { scaleLeft: 2, scaleRight: 2 },
        successFeedback: 'Chính xác! 2 quả Dưa thăng bằng với đúng 6 quả Táo!',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Cân Thăng Bằng 3 Quả Dưa',
        instruction: 'Biết 1 Dưa = 3 Táo. Đĩa trái có 3 quả Dưa, bé hãy chỉnh đĩa phải có số Táo thích hợp để cân thăng bằng!',
        hint: 'Ta có $3 \\times 3 = 9$ quả táo.',
        taskType: 'scale_balance',
        taskConfig: { scaleLeft: 3, scaleRight: 9 },
        initialState: { scaleLeft: 3, scaleRight: 3 },
        successFeedback: 'Tuyệt vời! 3 quả Dưa thăng bằng với 9 quả Táo!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Thử Thách IQ: Cân Đại Số ASMO',
        instruction: 'Thử thách IQ: Biết 1 Dưa = 4 Táo. Đĩa trái có 2 quả Dưa, bé hãy chỉnh đĩa phải có 8 quả Táo!',
        hint: 'Ta có $2 \\times 4 = 8$ quả táo.',
        taskType: 'scale_balance',
        taskConfig: { scaleLeft: 2, scaleRight: 8 },
        initialState: { scaleLeft: 2, scaleRight: 4 },
        successFeedback: 'Đỉnh cao! Tư duy cân thăng bằng đại số của bé thật xuất sắc!',
      },
    ]
  }

  // 8. Column Addition (Cộng Có Nhớ Cột Dọc)
  if (visualType === 'column_add') {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Hoàn Thành Phép Cộng $4\\square + \\square 7 = 85$',
        instruction: 'Bé hãy tìm 2 chữ số còn thiếu trong phép tính đặt tính cột dọc: $4\\square + \\square 7 = 85$!',
        hint: 'Hàng đơn vị: $\\square + 7 = 15 \\Rightarrow \\square = 8$ (nhớ 1). Hàng chục: $4 + \\square + 1 = 8 \\Rightarrow \\square = 3$.',
        taskType: 'column_add_fill',
        taskConfig: { targetA: 8, targetB: 3, expectedResult: 85 },
        initialState: { columnCarryA: 0, columnCarryB: 0 },
        successFeedback: 'Chính xác! $48 + 37 = 85$ với 1 nhớ sang hàng chục!',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Tìm Ẩn Số $5\\square + 28 = 84$',
        instruction: 'Bé hãy tìm chữ số hàng đơn vị để hoàn thành phép cộng có nhớ: $5\\square + 28 = 84$!',
        hint: 'Hàng đơn vị: $\\square + 8 = 14 \\Rightarrow \\square = 6$ (nhớ 1 sang hàng chục: $5 + 2 + 1 = 8$).',
        taskType: 'column_add_fill',
        taskConfig: { targetA: 6, targetB: 2, expectedResult: 84 },
        initialState: { columnCarryA: 0, columnCarryB: 2 },
        successFeedback: 'Tuyệt vời! $56 + 28 = 84$ rất chuẩn xác!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Thử Thách IQ: Điền Số $\\square 9 + 3\\square = 92$',
        instruction: 'Thử thách IQ: Tìm 2 chữ số bí ẩn để phép tính $\\square 9 + 3\\square = 92$ chính xác!',
        hint: 'Hàng đơn vị: $9 + \\square = 12 \\Rightarrow \\square = 3$ (nhớ 1). Hàng chục: $\\square + 3 + 1 = 9 \\Rightarrow \\square = 5$.',
        taskType: 'column_add_fill',
        taskConfig: { targetA: 5, targetB: 3, expectedResult: 92 },
        initialState: { columnCarryA: 0, columnCarryB: 0 },
        successFeedback: 'Đỉnh cao Olympic! $59 + 33 = 92$ hoàn hảo!',
      },
    ]
  }

  // 9. Column Subtraction (Trừ Có Mượn Cột Dọc)
  if (visualType === 'column_sub') {
    return [
      {
        id: `${id}-c1`,
        level: 1,
        levelLabel: '🥉 Thử thách 1: Khởi động',
        title: 'Đặt Tính Phép Trừ $63 - 28 = 35$',
        instruction: 'Bé hãy thực hiện phép trừ có mượn: $63 - 28 = ?$ (mượn 1 chục thành 13 đơn vị).',
        hint: '$13 - 8 = 5$, hàng chục bớt 1 còn $5 - 2 = 3$. Kết quả là 35.',
        taskType: 'column_sub_fill',
        taskConfig: { targetA: 3, targetB: 5, expectedResult: 35 },
        initialState: { columnCarryA: 0, columnCarryB: 0 },
        successFeedback: 'Rất chuẩn xác! $63 - 28 = 35$ ($13 - 8 = 5$ nhớ 1; $6 - 2 - 1 = 3$).',
      },
      {
        id: `${id}-c2`,
        level: 2,
        levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
        title: 'Tìm Ẩn Số $72 - \\square 7 = 35$',
        instruction: 'Bé hãy tìm chữ số hàng chục của số trừ để phép tính $72 - \\square 7 = 35$ đúng!',
        hint: '$12 - 7 = 5$. Hàng chục $7$ bớt $1$ còn $6$, $6 - \\square = 3 \\Rightarrow \\square = 3$.',
        taskType: 'column_sub_fill',
        taskConfig: { targetA: 3, targetB: 7, expectedResult: 35 },
        initialState: { columnCarryA: 0, columnCarryB: 7 },
        successFeedback: 'Xuất sắc! $72 - 37 = 35$ chính xác!',
      },
      {
        id: `${id}-c3`,
        level: 3,
        levelLabel: '🥇 Thử thách 3: Thử thách IQ',
        title: 'Thử Thách IQ: Điền Số $8\\square - 47 = 34$',
        instruction: 'Thử thách IQ: Tìm chữ số hàng đơn vị của số bị trừ để $8\\square - 47 = 34$!',
        hint: 'Hàng đơn vị: mượn 1 chục thành $1\\square - 7 = 4 \\Rightarrow 1\\square = 11 \\Rightarrow \\square = 1$. Hàng chục: $7 - 4 = 3$.',
        taskType: 'column_sub_fill',
        taskConfig: { targetA: 1, targetB: 4, expectedResult: 34 },
        initialState: { columnCarryA: 0, columnCarryB: 4 },
        successFeedback: 'Đỉnh cao Olympic! $81 - 47 = 34$ cực kỳ thông minh!',
      },
    ]
  }

  // Generic fallback for any other visual types
  return [
    {
      id: `${id}-c1`,
      level: 1,
      levelLabel: '🥉 Thử thách 1: Khởi động',
      title: 'Khởi Động Thao Tác',
      instruction: lesson.interactivePractice.instruction,
      hint: lesson.theory.keyTakeaways[0] || 'Quan sát mô hình và thực hiện theo yêu cầu.',
      taskType: lesson.interactivePractice.taskType,
      taskConfig: lesson.interactivePractice.taskConfig,
      initialState: {},
      successFeedback: lesson.interactivePractice.successFeedback,
    },
    {
      id: `${id}-c2`,
      level: 2,
      levelLabel: '🥈 Thử thách 2: Tìm ẩn số',
      title: 'Tìm Ẩn Số Bài Toán',
      instruction: `Áp dụng bí kíp Mèo Mee để giải quyết yêu cầu tìm ẩn số của bài ${lesson.title}.`,
      hint: lesson.meeTip.storyAdvice,
      taskType: 'advanced_step',
      taskConfig: lesson.interactivePractice.taskConfig,
      initialState: {},
      successFeedback: 'Rất giỏi! Bé đã tìm ra đúng ẩn số của bài toán!',
    },
    {
      id: `${id}-c3`,
      level: 3,
      levelLabel: '🥇 Thử thách 3: Thử thách IQ',
      title: 'Chinh Phục Thử Thách IQ',
      instruction: 'Vượt qua thử thách IQ đỉnh cao để sẵn sàng bước vào Đấu Trường Olympic ASMO!',
      hint: 'Tự tin áp dụng các bước giải đã học.',
      taskType: 'iq_mastery',
      taskConfig: lesson.interactivePractice.taskConfig,
      initialState: {},
      successFeedback: 'Xuất sắc! Bé đã làm chủ hoàn toàn kỹ năng của bài học này!',
    },
  ]
}

export function verifyPracticeChallenge(
  lesson: AsmoLmsLesson,
  challengeIndex: number,
  state: Record<string, unknown>,
): { isCorrect: boolean; feedback: string; hint?: string } {
  const challenges = getLessonPracticeChallenges(lesson)
  const challenge = challenges[challengeIndex] || challenges[0]
  const config = challenge.taskConfig || {}

  // 1. Apple Drop
  if (lesson.visualType === 'apple_drop') {
    const applesA = typeof state.applesA === 'number' ? state.applesA : 0
    const applesB = typeof state.applesB === 'number' ? state.applesB : 0
    const total = applesA + applesB

    if (challengeIndex === 0) {
      if (applesA === 3 && applesB === 4) {
        return { isCorrect: true, feedback: 'Tuyệt vời bé ơi! 3 quả đỏ + 4 quả xanh = 7 quả táo thơm ngon!' }
      }
      if (applesA !== 3) {
        return { isCorrect: false, feedback: `Chưa đúng rồi bé ơi! Giỏ A đang có ${applesA} quả đỏ, bé bấm điều chỉnh thành 3 quả nhé!` }
      }
      return { isCorrect: false, feedback: `Chưa đúng rồi bé ơi! Giỏ B đang có ${applesB} quả xanh, bé bấm điều chỉnh thành 4 quả nhé!` }
    }

    if (challengeIndex === 1) {
      if (applesA === 5 && applesB === 3) {
        return { isCorrect: true, feedback: 'Xuất sắc! 5 quả đỏ + 3 quả xanh = đúng 8 quả táo Mèo Mee cần!' }
      }
      return {
        isCorrect: false,
        feedback: `Tổng hiện tại đang là ${total} quả. Giỏ A có 5 quả đỏ, bé cần chỉnh Giỏ B có 3 quả xanh để tổng bằng 8 nhé!`,
      }
    }

    if (challengeIndex === 2) {
      if (total === 10 && applesA > 0 && applesB > 0) {
        return { isCorrect: true, feedback: `Đỉnh cao toán học! ${applesA} quả đỏ + ${applesB} quả xanh = 10 quả táo tròn trĩnh!` }
      }
      return {
        isCorrect: false,
        feedback: `Tổng hiện tại đang là ${total} quả táo. Bé hãy điều chỉnh sao cho tổng hai giỏ bằng đúng 10 quả táo nhé!`,
      }
    }
  }

  // 2. Balloon Pop
  if (lesson.visualType === 'balloon_pop') {
    const popped = Array.isArray(state.poppedBalloons) ? state.poppedBalloons.length : 0
    const remaining = 10 - popped

    if (challengeIndex === 0) {
      if (popped === 4) {
        return { isCorrect: true, feedback: 'Chuẩn xác! 10 - 4 = 6 quả bóng còn lại nguyên vẹn!' }
      }
      if (popped < 4) {
        return { isCorrect: false, feedback: `Bé mới nổ ${popped} quả bóng. Hãy bấm nổ thêm ${4 - popped} quả nữa nhé!` }
      }
      return { isCorrect: false, feedback: `Bé đã nổ ${popped} quả bóng (quá 4 quả). Hãy bấm vào quả bóng nổ để khôi phục lại nhé!` }
    }

    if (challengeIndex === 1) {
      if (remaining === 3 || popped === 7) {
        return { isCorrect: true, feedback: 'Rất giỏi! Nổ 7 quả thì 10 - 7 = 3 quả bóng còn lại trên bầu trời!' }
      }
      return {
        isCorrect: false,
        feedback: `Hiện còn ${remaining} quả bóng trên trời. Bé hãy làm nổ đúng 7 quả để còn lại 3 quả nhé!`,
      }
    }

    if (challengeIndex === 2) {
      if (popped === 5) {
        return { isCorrect: true, feedback: 'Xuất sắc! 10 - 5 = 5, chùm bóng đã được chia đôi hoàn hảo!' }
      }
      return { isCorrect: false, feedback: `Bé đang nổ ${popped} quả bóng. Hãy điều chỉnh để nổ đúng 5 quả bóng nhé!` }
    }
  }

  // 3. Make 10 Friends (Ghép Cặp Bạn Thân Tròn 10)
  if (lesson.visualType === 'make10') {
    const rawPairs = Array.isArray(state.pairedMake10) ? (state.pairedMake10 as number[][]) : []
    const numbers: number[] =
      Array.isArray(config.numbers) && config.numbers.length > 0
        ? (config.numbers as number[])
        : challengeIndex === 0
          ? [1, 9, 3, 7]
          : challengeIndex === 1
            ? [2, 8, 4, 6, 5, 5]
            : [1, 3, 5, 7, 9]

    const validPairs = rawPairs.filter((p) => {
      if (Array.isArray(p) && p.length === 2) {
        const v1 = typeof p[0] === 'number' ? numbers[p[0]] : 0
        const v2 = typeof p[1] === 'number' ? numbers[p[1]] : 0
        return typeof v1 === 'number' && typeof v2 === 'number' && v1 + v2 === 10
      }
      return false
    })

    if (challengeIndex === 0) {
      if (validPairs.length === 2) {
        return {
          isCorrect: true,
          feedback: 'Xuất sắc bé ơi! 1 + 9 = 10 và 3 + 7 = 10, đúng 2 cặp bạn thân tròn 10!',
        }
      }
      return {
        isCorrect: false,
        feedback: `Bé mới ghép được ${validPairs.length}/2 cặp bạn thân. Hãy bấm chọn 2 quả bóng có tổng bằng 10 để ghép đủ 2 cặp nhé!`,
      }
    }

    if (challengeIndex === 1) {
      if (validPairs.length === 3) {
        return {
          isCorrect: true,
          feedback: 'Tuyệt vời! Bé đã tìm ra đủ 3 cặp bạn thân: (2, 8), (4, 6) và (5, 5)!',
        }
      }
      return {
        isCorrect: false,
        feedback: `Bé mới ghép được ${validPairs.length}/3 cặp. Hãy tìm và ghép đủ cả 3 cặp bạn thân (2, 8), (4, 6) và (5, 5) nhé!`,
      }
    }

    if (challengeIndex === 2) {
      if (validPairs.length === 2) {
        return {
          isCorrect: true,
          feedback: 'Đỉnh cao Olympic ASMO! (1+9) + (3+7) + 5 = 10 + 10 + 5 = 25 tuyệt đẹp!',
        }
      }
      return {
        isCorrect: false,
        feedback: `Bé mới ghép được ${validPairs.length}/2 cặp tròn 10. Hãy ghép cặp (1, 9) và (3, 7) trong dãy số [1, 3, 5, 7, 9] nhé!`,
      }
    }
  }

  // 4. Cake Tray
  if (lesson.visualType === 'cake_tray') {
    const rows = typeof state.cakeRows === 'number' ? state.cakeRows : 0
    const cols = typeof state.cakeCols === 'number' ? state.cakeCols : 0
    const total = rows * cols

    if (challengeIndex === 0) {
      if (rows === 3 && cols === 4) {
        return { isCorrect: true, feedback: 'Chính xác! 3 hàng × 4 cột = 12 chiếc bánh thơm ngon!' }
      }
      return { isCorrect: false, feedback: `Khay bánh đang có ${rows} hàng và ${cols} cột. Bé hãy chỉnh thành 3 hàng và 4 cột nhé!` }
    }

    if (challengeIndex === 1) {
      if (rows === 4 && cols === 5) {
        return { isCorrect: true, feedback: 'Tuyệt vời! 4 hàng × 5 cột = 20 chiếc bánh kem dâu!' }
      }
      return { isCorrect: false, feedback: `Khay đang có ${total} chiếc bánh. Bé hãy chỉnh thành 4 hàng và 5 cột để có 20 chiếc bánh nhé!` }
    }

    if (challengeIndex === 2) {
      if (total === 24) {
        return { isCorrect: true, feedback: `Quá đỉnh! ${rows} hàng × ${cols} cột = 24 chiếc bánh thơm ngon!` }
      }
      return { isCorrect: false, feedback: `Khay đang có ${total} chiếc bánh (chưa bằng 24). Bé hãy thử 4 hàng 6 cột xem sao!` }
    }
  }

  // 4. Candy Division & Remainder
  if (lesson.visualType === 'candy_division' || lesson.visualType === 'div_remainder') {
    const total = typeof state.candyTotal === 'number' ? state.candyTotal : 0
    const plates = typeof state.candyPlates === 'number' ? state.candyPlates : 1

    if (challengeIndex === 0) {
      if (total === 12 && plates === 3) {
        return { isCorrect: true, feedback: 'Chính xác! 12 : 3 = 4 cái kẹo trên mỗi đĩa!' }
      }
      return { isCorrect: false, feedback: `Bé hãy chỉnh tổng số kẹo là 12 và số đĩa là 3 nhé!` }
    }

    if (challengeIndex === 1) {
      if (total === 15 && plates === 3) {
        return { isCorrect: true, feedback: 'Rất tốt! 15 : 3 = 5 cái kẹo trên mỗi đĩa!' }
      }
      return { isCorrect: false, feedback: `Bé hãy chỉnh 15 cái kẹo chia vào 3 đĩa để mỗi đĩa có 5 cái nhé!` }
    }

    if (challengeIndex === 2) {
      if (total === 14 && plates === 3) {
        return { isCorrect: true, feedback: 'Tuyệt vời! 14 : 3 = 4 (dư 2 kẹo), đúng quy tắc chia có dư!' }
      }
      return { isCorrect: false, feedback: `Bé hãy chỉnh 14 cái kẹo chia vào 3 đĩa nhé!` }
    }
  }

  // 5. Pizza Fraction
  if (
    lesson.visualType === 'pizza_fraction' ||
    lesson.visualType === 'compare_fractions' ||
    lesson.visualType === 'fraction_add_sub' ||
    lesson.visualType === 'fraction_of_number'
  ) {
    const slices = typeof state.pizzaSlices === 'number' ? state.pizzaSlices : 8
    const shaded = typeof state.pizzaShaded === 'number' ? state.pizzaShaded : 0

    if (challengeIndex === 0) {
      if (slices === 8 && shaded === 3) {
        return { isCorrect: true, feedback: 'Xuất sắc! Bạn đã tạo phân số 3/8 chiếc bánh pizza!' }
      }
      return { isCorrect: false, feedback: `Hiện đang có ${shaded}/${slices} lát. Bé hãy chọn 8 lát cắt và tô màu 3 lát nhé!` }
    }

    if (challengeIndex === 1) {
      if ((slices === 4 && shaded === 2) || (shaded > 0 && shaded / slices === 0.5)) {
        return { isCorrect: true, feedback: 'Tuyệt vời! 2/4 chính là 1/2 nửa chiếc bánh pizza!' }
      }
      return { isCorrect: false, feedback: `Bé hãy chọn 4 lát cắt và tô màu 2 lát nhé!` }
    }

    if (challengeIndex === 2) {
      if (slices === 6 && shaded === 5) {
        return { isCorrect: true, feedback: 'Đỉnh cao! Bạn đã tạo ra phân số 5/6 chiếc bánh pizza!' }
      }
      return { isCorrect: false, feedback: `Bé hãy chọn 6 lát cắt và tô màu 5 lát nhé!` }
    }
  }

  // 6. Analog Clock
  if (lesson.visualType === 'analog_clock' || lesson.visualType === 'elapsed_time') {
    const hour = typeof state.clockHour === 'number' ? state.clockHour : 12
    const minute = typeof state.clockMinute === 'number' ? state.clockMinute : 0

    if (challengeIndex === 0) {
      if (hour === 8 && minute === 15) {
        return { isCorrect: true, feedback: 'Chính xác! Đồng hồ đang chỉ đúng 8:15!' }
      }
      return { isCorrect: false, feedback: `Đồng hồ đang chỉ ${hour}:${minute < 10 ? '0' + minute : minute}. Bé hãy chỉnh về 8:15 nhé!` }
    }

    if (challengeIndex === 1) {
      if (hour === 3 && minute === 30) {
        return { isCorrect: true, feedback: 'Chuẩn xác! Đồng hồ đang chỉ đúng 3:30 (3 giờ rưỡi)!' }
      }
      return { isCorrect: false, feedback: `Đồng hồ đang chỉ ${hour}:${minute < 10 ? '0' + minute : minute}. Bé hãy chỉnh về 3:30 nhé!` }
    }

    if (challengeIndex === 2) {
      if (hour === 10 && minute === 45) {
        return { isCorrect: true, feedback: 'Xuất sắc! Đồng hồ đang chỉ đúng 10:45!' }
      }
      return { isCorrect: false, feedback: `Đồng hồ đang chỉ ${hour}:${minute < 10 ? '0' + minute : minute}. Bé hãy chỉnh về 10:45 nhé!` }
    }
  }

  // 7. Balance Scale
  if (lesson.visualType === 'balance_scale') {
    const left = typeof state.scaleLeft === 'number' ? state.scaleLeft : 0
    const right = typeof state.scaleRight === 'number' ? state.scaleRight : 0

    if (challengeIndex === 0) {
      if (left === 2 && right === 6) {
        return { isCorrect: true, feedback: 'Chính xác! 2 quả Dưa thăng bằng với đúng 6 quả Táo!' }
      }
      return { isCorrect: false, feedback: `Đĩa phải đang có ${right} quả táo. Bé hãy chỉnh thành 6 quả táo để thăng bằng với 2 quả dưa nhé!` }
    }

    if (challengeIndex === 1) {
      if (left === 3 && right === 9) {
        return { isCorrect: true, feedback: 'Tuyệt vời! 3 quả Dưa thăng bằng với 9 quả Táo!' }
      }
      return { isCorrect: false, feedback: `Bé hãy chỉnh đĩa phải có 9 quả táo để thăng bằng với 3 quả dưa nhé!` }
    }

    if (challengeIndex === 2) {
      if (left === 2 && right === 8) {
        return { isCorrect: true, feedback: 'Đỉnh cao! 2 quả Dưa thăng bằng với 8 quả Táo!' }
      }
      return { isCorrect: false, feedback: `Bé hãy chỉnh đĩa phải có 8 quả táo nhé!` }
    }
  }

  // 8. Column Addition (Cộng Có Nhớ Cột Dọc)
  if (lesson.visualType === 'column_add') {
    const carryA = typeof state.columnCarryA === 'number' ? state.columnCarryA : 0
    const carryB = typeof state.columnCarryB === 'number' ? state.columnCarryB : 0

    if (challengeIndex === 0) {
      if (carryA === 8 && carryB === 3) {
        return { isCorrect: true, feedback: 'Chính xác! $48 + 37 = 85$ với 1 nhớ sang hàng chục!' }
      }
      if (carryA !== 8) {
        return { isCorrect: false, feedback: `Hàng đơn vị: $\\square + 7 = 15$ nên ô trống thứ nhất phải là 8 (hiện đang là ${carryA})!` }
      }
      return { isCorrect: false, feedback: `Hàng chục: $4 + \\square + 1\\text{ (nhớ)} = 8$ nên ô trống thứ hai phải là 3 (hiện đang là ${carryB})!` }
    }

    if (challengeIndex === 1) {
      if (carryA === 6) {
        return { isCorrect: true, feedback: 'Tuyệt vời! $56 + 28 = 84$ rất chuẩn xác!' }
      }
      return { isCorrect: false, feedback: `Hàng đơn vị: $\\square + 8 = 14$ nên ô trống phải là 6 (hiện đang là ${carryA})!` }
    }

    if (challengeIndex === 2) {
      if (carryA === 5 && carryB === 3) {
        return { isCorrect: true, feedback: 'Đỉnh cao Olympic! $59 + 33 = 92$ hoàn hảo!' }
      }
      if (carryB !== 3) {
        return { isCorrect: false, feedback: `Hàng đơn vị: $9 + \\square = 12$ nên ô trống thứ hai phải là 3 (hiện đang là ${carryB})!` }
      }
      return { isCorrect: false, feedback: `Hàng chục: $\\square + 3 + 1\\text{ (nhớ)} = 9$ nên ô trống thứ nhất phải là 5 (hiện đang là ${carryA})!` }
    }
  }

  // 9. Column Subtraction (Trừ Có Mượn Cột Dọc)
  if (lesson.visualType === 'column_sub') {
    const carryA = typeof state.columnCarryA === 'number' ? state.columnCarryA : 0
    const carryB = typeof state.columnCarryB === 'number' ? state.columnCarryB : 0

    if (challengeIndex === 0) {
      if (carryA === 3 && carryB === 5) {
        return { isCorrect: true, feedback: 'Rất chuẩn xác! $63 - 28 = 35$ ($13 - 8 = 5$ nhớ 1; $6 - 2 - 1 = 3$).' }
      }
      return { isCorrect: false, feedback: `Bé hãy tính kết quả $63 - 28$: Hàng chục là 3 và Hàng đơn vị là 5 nhé!` }
    }

    if (challengeIndex === 1) {
      if (carryA === 3) {
        return { isCorrect: true, feedback: 'Xuất sắc! $72 - 37 = 35$ chính xác!' }
      }
      return { isCorrect: false, feedback: `Hàng chục: $7$ bớt 1 mượn còn $6$, $6 - \\square = 3 \\Rightarrow \\square = 3$ (hiện đang là ${carryA})!` }
    }

    if (challengeIndex === 2) {
      if (carryA === 1) {
        return { isCorrect: true, feedback: 'Đỉnh cao Olympic! $81 - 47 = 34$ cực kỳ thông minh!' }
      }
      return { isCorrect: false, feedback: `Hàng đơn vị mượn 1 chục: $1\\square - 7 = 4 \\Rightarrow \\square = 1$ (hiện đang là ${carryA})!` }
    }
  }

  // Default fallback for any custom visual challenge
  return {
    isCorrect: true,
    feedback: challenge.successFeedback || 'Rất giỏi! Bé đã vượt qua thử thách thực hành thành công!',
  }
}

