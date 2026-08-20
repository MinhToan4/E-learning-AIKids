import type { AsmoCurriculumWeek, AsmoGrade, AsmoSubject } from '../types'

export type AsmoSubjectMetadata = {
  id: AsmoSubject
  name: string
  englishName: string
  badgeText: string
  accentColor: string
  bgGradient: string
  description: string
  icon: string
  totalWeeks: number
  totalTopics: number
}

export const ASMO_SUBJECTS: Record<AsmoSubject, AsmoSubjectMetadata> = {
  math: {
    id: 'math',
    name: 'Toán Olympic',
    englishName: 'Mathematics Olympiad',
    badgeText: 'ASMO-MATH',
    accentColor: '#4f46e5',
    bgGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    description: 'Rèn luyện tư duy số học, hình học không gian 3D, quy luật dãy số, toán logic, đại số và tổ hợp chuyên sâu từ Lớp 1 đến Lớp 12.',
    icon: '📐',
    totalWeeks: 48,
    totalTopics: 24,
  },
  science: {
    id: 'science',
    name: 'Khoa Học Tự Nhiên',
    englishName: 'Science Olympiad',
    badgeText: 'ASMO-SCI',
    accentColor: '#059669',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    description: 'Khám phá thế giới sinh vật, tế bào, hệ sinh thái, năng lượng, quang học, lực học, hoá học và thiên văn học đa cấp độ.',
    icon: '🔬',
    totalWeeks: 48,
    totalTopics: 20,
  },
  english: {
    id: 'english',
    name: 'Tiếng Anh Học Thuật',
    englishName: 'English Olympiad',
    badgeText: 'ASMO-ENG',
    accentColor: '#ea580c',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
    description: 'Phát triển vốn từ vựng ngữ cảnh, thành ngữ, mệnh đề phức, tư duy phản biện và đọc hiểu học thuật chuẩn quốc tế.',
    icon: '🔤',
    totalWeeks: 48,
    totalTopics: 22,
  },
}

export type AsmoGradeTier = 'primary' | 'secondary' | 'high'

export type AsmoGradeMeta = {
  grade: AsmoGrade
  label: string
  shortLabel: string
  ageRange: string
  tier: AsmoGradeTier
  tierLabel: string
  tierEmoji: string
}

export const ASMO_GRADE_TIERS: Array<{
  id: AsmoGradeTier
  label: string
  emoji: string
  grades: AsmoGrade[]
  description: string
}> = [
  { id: 'primary', label: 'Tiểu học', emoji: '🎒', grades: [1, 2, 3, 4, 5], description: 'Khối Lớp 1 – Lớp 5 (6–11 tuổi)' },
  { id: 'secondary', label: 'THCS', emoji: '🏫', grades: [6, 7, 8, 9], description: 'Khối Lớp 6 – Lớp 9 (11–15 tuổi)' },
  { id: 'high', label: 'THPT', emoji: '🎓', grades: [10, 11, 12], description: 'Khối Lớp 10 – Lớp 12 (15–18 tuổi)' },
]

export const ASMO_GRADES: AsmoGradeMeta[] = [
  // 🎒 Tiểu học (Primary: Grades 1 - 5)
  { grade: 1, label: 'Lớp 1 (Grade 1)', shortLabel: 'Lớp 1', ageRange: '6–7 tuổi', tier: 'primary', tierLabel: 'Tiểu học', tierEmoji: '🎒' },
  { grade: 2, label: 'Lớp 2 (Grade 2)', shortLabel: 'Lớp 2', ageRange: '7–8 tuổi', tier: 'primary', tierLabel: 'Tiểu học', tierEmoji: '🎒' },
  { grade: 3, label: 'Lớp 3 (Grade 3)', shortLabel: 'Lớp 3', ageRange: '8–9 tuổi', tier: 'primary', tierLabel: 'Tiểu học', tierEmoji: '🎒' },
  { grade: 4, label: 'Lớp 4 (Grade 4)', shortLabel: 'Lớp 4', ageRange: '9–10 tuổi', tier: 'primary', tierLabel: 'Tiểu học', tierEmoji: '🎒' },
  { grade: 5, label: 'Lớp 5 (Grade 5)', shortLabel: 'Lớp 5', ageRange: '10–11 tuổi', tier: 'primary', tierLabel: 'Tiểu học', tierEmoji: '🎒' },

  // 🏫 THCS (Secondary: Grades 6 - 9)
  { grade: 6, label: 'Lớp 6 (Grade 6)', shortLabel: 'Lớp 6', ageRange: '11–12 tuổi', tier: 'secondary', tierLabel: 'THCS', tierEmoji: '🏫' },
  { grade: 7, label: 'Lớp 7 (Grade 7)', shortLabel: 'Lớp 7', ageRange: '12–13 tuổi', tier: 'secondary', tierLabel: 'THCS', tierEmoji: '🏫' },
  { grade: 8, label: 'Lớp 8 (Grade 8)', shortLabel: 'Lớp 8', ageRange: '13–14 tuổi', tier: 'secondary', tierLabel: 'THCS', tierEmoji: '🏫' },
  { grade: 9, label: 'Lớp 9 (Grade 9)', shortLabel: 'Lớp 9', ageRange: '14–15 tuổi', tier: 'secondary', tierLabel: 'THCS', tierEmoji: '🏫' },

  // 🎓 THPT (High School: Grades 10 - 12)
  { grade: 10, label: 'Lớp 10 (Grade 10)', shortLabel: 'Lớp 10', ageRange: '15–16 tuổi', tier: 'high', tierLabel: 'THPT', tierEmoji: '🎓' },
  { grade: 11, label: 'Lớp 11 (Grade 11)', shortLabel: 'Lớp 11', ageRange: '16–17 tuổi', tier: 'high', tierLabel: 'THPT', tierEmoji: '🎓' },
  { grade: 12, label: 'Lớp 12 (Grade 12)', shortLabel: 'Lớp 12', ageRange: '17–18 tuổi', tier: 'high', tierLabel: 'THPT', tierEmoji: '🎓' },
]

export const ASMO_CURRICULUM_WEEKS: AsmoCurriculumWeek[] = [
  // ── TOÁN TIỂU HỌC (GRADES 1 - 5) ──
  {
    week: 1,
    subject: 'math',
    grade: 1,
    topic: 'MATH_GEO_3D_COUNT',
    title: 'Đếm Khối Lập Phương 3D Cơ Bản',
    summary: 'Nhận biết hình khối 3D xếp chồng, đếm khối nhìn thấy và khối bị che khuất theo từng tầng.',
    keyCompetencies: ['Tư duy không gian 3D', 'Phân tích đa góc nhìn', 'Đếm logic theo tầng'],
    visualTemplate: '3D_CUBE_CLUSTER',
    sampleQuestionIds: ['asmo-math-g1-2020-r1-q01', 'asmo-math-g1-2020-r1-q05'],
  },
  {
    week: 2,
    subject: 'math',
    grade: 1,
    topic: 'MATH_COMB_GRID_PATH',
    title: 'Đường Đi Ngắn Nhất Trên Lưới Ô Vuông',
    summary: 'Tìm số cách đi từ điểm A đến điểm B chỉ đi sang phải hoặc lên trên, tránh vật cản.',
    keyCompetencies: ['Tư duy quy hoạch đường đi', 'Phương pháp đếm cộng dồn', 'Nhận diện quy luật'],
    visualTemplate: 'GRID_PATH_MAZE',
    sampleQuestionIds: ['asmo-math-g1-2020-r1-q02', 'asmo-math-g1-2020-r1-q15'],
  },
  {
    week: 3,
    subject: 'math',
    grade: 1,
    topic: 'MATH_TIME_CLOCK',
    title: 'Đọc Mặt Đồng Hồ & Tính Góc Kim',
    summary: 'Đọc giờ chính xác, tính khoảng thời gian trôi qua và quan sát sự tương quan góc giữa kim giờ và kim phút.',
    keyCompetencies: ['Khái niệm thời gian', 'Góc quay hình học', 'Tính toán thời gian thực'],
    visualTemplate: 'INTERACTIVE_CLOCK',
    sampleQuestionIds: ['asmo-math-g1-2020-r1-q03', 'asmo-math-g1-2020-r1-q17'],
  },
  {
    week: 4,
    subject: 'math',
    grade: 2,
    topic: 'MATH_LOGIC_WEIGHT',
    title: 'Cân Đĩa Thăng Bằng & Đại Số Sơ Cấp',
    summary: 'Suy luận tương quan khối lượng giữa các vật qua hệ thống cân đĩa thăng bằng nhiều bước.',
    keyCompetencies: ['Quy đổi tương đương', 'Tư duy ẩn số sơ cấp', 'Suy luận bắc cầu'],
    visualTemplate: '3D_BALANCE_SCALE',
    sampleQuestionIds: ['asmo-math-g2-2020-r1-q01', 'asmo-math-g2-2020-r1-q04'],
  },
  {
    week: 5,
    subject: 'math',
    grade: 2,
    topic: 'MATH_LOGIC_MATCHES',
    title: 'Bài Toán Que Diêm Tư Duy',
    summary: 'Di chuyển, thêm bớt que diêm để tạo thành các hình vuông, hình tam giác hoặc phép tính đúng.',
    keyCompetencies: ['Tư duy biến đổi hình học', 'Thử nghiệm và điều chỉnh', 'Hình thành phản xạ không gian'],
    visualTemplate: 'MATCHSTICK_FIGURE',
    sampleQuestionIds: ['asmo-math-g2-2020-r1-q02', 'asmo-math-g2-2020-r1-q09'],
  },
  {
    week: 6,
    subject: 'math',
    grade: 3,
    topic: 'MATH_GEO_FRACTION',
    title: 'Phân Số Diện Tích Phần Tô Đậm',
    summary: 'Xác định phân số biểu thị phần diện tích được tô màu trong hình tròn, hình vuông chia phần.',
    keyCompetencies: ['Khái niệm phân số hình học', 'So sánh tỉ lệ diện tích', 'Tính toán phần bù'],
    visualTemplate: 'SHADED_AREA_FRACTION',
    sampleQuestionIds: ['asmo-math-g3-2020-r1-q01', 'asmo-math-g3-2020-r1-q03'],
  },
  {
    week: 7,
    subject: 'math',
    grade: 4,
    topic: 'MATH_GEO_NETS',
    title: 'Trải Phẳng & Gấp Hộp Lập Phương (Nets)',
    summary: 'Suy luận mặt đối diện và quy luật tương quan vị trí các mặt khi gấp tấm trải phẳng thành khối 3D.',
    keyCompetencies: ['Tưởng tượng gấp giấy không gian', 'Đối xứng và vị trí tương đối', 'Tư duy topology cơ bản'],
    visualTemplate: 'NET_CUBE_FOLDING',
    sampleQuestionIds: ['asmo-math-g4-2020-r1-q01', 'asmo-math-g5-2020-r1-q02'],
  },
  {
    week: 8,
    subject: 'math',
    grade: 5,
    topic: 'MATH_COMB_PERMUTATION',
    title: 'Tổ Hợp & Nguyên Lý Dirichlet (Ngăn Kéo)',
    summary: 'Giải các bài toán bốc bi, sắp xếp vị trí và chứng minh sự tồn tại trong các tình huống thi đấu Olympic.',
    keyCompetencies: ['Nguyên lý bồ câu / ngăn kéo', 'Tổ hợp đếm trường hợp xấu nhất', 'Lập luận chặt chẽ'],
    sampleQuestionIds: ['asmo-math-g5-2020-r1-q03'],
  },

  // ── TOÁN THCS (GRADES 6 - 9) ──
  {
    week: 9,
    subject: 'math',
    grade: 6,
    topic: 'MATH_NUM_THEORY_DIV',
    title: 'Số Học: Ước Bội & Dãy Số Cách Đều',
    summary: 'Phân tích thừa số nguyên tố, tìm ƯCLN/BCNN, quy luật tổng dãy số luân phiên và chữ số tận cùng.',
    keyCompetencies: ['Phân tích thừa số nguyên tố', 'Quy tắc chia hết nâng cao', 'Tính toán dãy số luân phiên'],
    sampleQuestionIds: ['asmo-math-g6-2020-r1-q01', 'asmo-math-g6-2020-r1-q10'],
  },
  {
    week: 10,
    subject: 'math',
    grade: 7,
    topic: 'MATH_ALG_SERIES_GEO',
    title: 'Đại Số & Hình Học Tam Giác Pythagoras',
    summary: 'Khai triển hằng đẳng thức hiệu hai bình phương, rút gọn chuỗi số đại số và áp dụng định lý Pythagoras.',
    keyCompetencies: ['Biến đổi đại số nâng cao', 'Định lý Pythagoras', 'Tính chất góc & diện tích'],
    sampleQuestionIds: ['asmo-math-g7-2020-r1-q01', 'asmo-math-g7-2020-r1-q05'],
  },
  {
    week: 11,
    subject: 'math',
    grade: 8,
    topic: 'MATH_ALG_IDENTITY_FACTOR',
    title: 'Hằng Đẳng Thức Đáng Nhớ & Tỉ Lệ Thales',
    summary: 'Phân tích đa thức thành nhân tử, đồng dư thức trong số học và ứng dụng định lý Thales trong hình học.',
    keyCompetencies: ['Phân tích nhân tử', 'Định lý Thales', 'Bất đẳng thức đại số'],
    sampleQuestionIds: ['asmo-math-g8-2023-r1-q01', 'asmo-math-g8-2013-r2-q01'],
  },
  {
    week: 12,
    subject: 'math',
    grade: 9,
    topic: 'MATH_QUADRATIC_CIRCLE',
    title: 'Phương Trình Bậc Hai, Hệ Viète & Tứ Giác Nội Tiếp',
    summary: 'Giải phương trình chứa căn thức, định lý Viète cho phương trình bậc hai và các bài toán góc nội tiếp đường tròn.',
    keyCompetencies: ['Phương trình chứa căn thức', 'Định lý Viète', 'Hình học đường tròn'],
    sampleQuestionIds: ['asmo-math-g9-2023-r1-q01'],
  },

  // ── TOÁN THPT (GRADES 10 - 12) ──
  {
    week: 13,
    subject: 'math',
    grade: 10,
    topic: 'MATH_FUNCTIONS_INEQ',
    title: 'Bất Đẳng Thức Cauchy-Schwarz & Hình Học Toạ Độ',
    summary: 'Đánh giá bất đẳng thức đối xứng, cực trị hàm số bậc hai, phương pháp toạ độ vectơ mặt phẳng Oxy.',
    keyCompetencies: ['Bất đẳng thức Cauchy-Schwarz', 'Vectơ toạ độ', 'Cực trị đại số'],
    sampleQuestionIds: ['asmo-math-g10-2020-r1-q01', 'asmo-math-g10-2023-r2-q01'],
  },
  {
    week: 14,
    subject: 'math',
    grade: 11,
    topic: 'MATH_TRIG_PROBABILITY',
    title: 'Lượng Giác, Cấp Số & Xác Suất Tổ Hợp Nâng Cao',
    summary: 'Biến đổi biểu thức lượng giác, tính tổng cấp số cộng/nhân và bài toán xác suất biến cố hợp/giao.',
    keyCompetencies: ['Lượng giác học', 'Cấp số cộng và cấp số nhân', 'Xác suất tổ hợp nâng cao'],
    sampleQuestionIds: ['asmo-math-g11-2023-r1-q01'],
  },
  {
    week: 15,
    subject: 'math',
    grade: 12,
    topic: 'MATH_CALCULUS_3D_OXYZ',
    title: 'Giải Tích Tích Phân & Hình Học Không Gian Oxyz',
    summary: 'Ứng dụng đạo hàm khảo sát hàm số, tính diện tích bằng tích phân và phương pháp toạ độ Oxyz trong không gian.',
    keyCompetencies: ['Giải tích đạo hàm & tích phân', 'Toạ độ không gian Oxyz', 'Tối ưu hoá hàm số'],
    sampleQuestionIds: ['asmo-math-g12-2023-r1-q01'],
  },

  // ── KHOA HỌC TỰ NHIÊN (GRADES 1 - 12) ──
  {
    week: 16,
    subject: 'science',
    grade: 3,
    topic: 'SCI_BIO_HUMAN_BODY',
    title: 'Cơ Thể Người, Dinh Dưỡng & Hệ Cơ Quan',
    summary: 'Chức năng các cơ quan tuần hoàn, tiêu hoá, bài tiết và vai trò của vi chất dinh dưỡng đối với sức khoẻ.',
    keyCompetencies: ['Sinh học cơ thể người', 'Chế độ dinh dưỡng', 'Phân tích chức năng sinh học'],
    sampleQuestionIds: ['asmo-sci-l1-2021-r1-q01'],
  },
  {
    week: 17,
    subject: 'science',
    grade: 5,
    topic: 'SCI_CHEM_MATTER_ENERGY',
    title: 'Áp Suất Khí, Nhiệt Học & Biến Đổi Vật Chất',
    summary: 'Các định luật về chất khí, sự truyền nhiệt qua dẫn nhiệt/đối lưu/bức xạ và các phản ứng hoá học cơ bản.',
    keyCompetencies: ['Vật lý nhiệt & áp suất', 'Trạng thái vật chất', 'Bảo toàn năng lượng'],
    sampleQuestionIds: ['asmo-sci-l2-2022-r1-q01'],
  },
  {
    week: 18,
    subject: 'science',
    grade: 7,
    topic: 'SCI_PHY_ELECTRIC_CIRCUITS',
    title: 'Điện Học: Mạch Điện, Công Suất & Định Luật Ohm',
    summary: 'Mạch điện nối tiếp và song song, tính điện trở tương đương, công suất điện và tác dụng của dòng điện.',
    keyCompetencies: ['Điện học thực nghiệm', 'Định luật Ohm', 'Tính toán mạch điện'],
    sampleQuestionIds: ['asmo-sci-l3-2022-r7-q01'],
  },
  {
    week: 19,
    subject: 'science',
    grade: 10,
    topic: 'SCI_BIO_GENETICS_CELL',
    title: 'Di Truyền Học, Cấu Trúc Tế Bào & Sinh Thái',
    summary: 'Cơ chế di truyền Mendel, ADN, phân bào nguyên phân/giảm phân và cân bằng hệ sinh thái toàn cầu.',
    keyCompetencies: ['Di truyền học phân tử', 'Sinh học tế bào', 'Sinh thái học'],
    sampleQuestionIds: ['asmo-sci-l4-2023-r1-q01'],
  },
  {
    week: 20,
    subject: 'science',
    grade: 11,
    topic: 'SCI_CHEM_ORGANIC_INORGANIC',
    title: 'Hoá Học Đại Cương: Axit - Bazơ & An Toàn Phòng Thí Nghiệm',
    summary: 'Quy tắc an toàn thao tác hoá chất, phản ứng trung hoà axit-bazơ, dung dịch đệm và cân bằng hoá học.',
    keyCompetencies: ['Hoá học thực nghiệm', 'An toàn thí nghiệm', 'Cân bằng phản ứng hoá học'],
    sampleQuestionIds: ['asmo-sci-l5-2023-r1-q01'],
  },
  {
    week: 21,
    subject: 'science',
    grade: 12,
    topic: 'SCI_CHEM_OXIDATION_REDUCTION',
    title: 'Phản Ứng Oxy Hoá - Khử & Động Học Phản Ứng',
    summary: 'Cơ chế phản ứng cháy của kim loại, định luật bảo toàn khối lượng trong phản ứng oxy hoá và hoá học hiện đại.',
    keyCompetencies: ['Phản ứng oxy hoá - khử', 'Nhiệt động học hoá học', 'Phân tích định lượng'],
    sampleQuestionIds: ['asmo-sci-l6-2023-r1-q01'],
  },

  // ── TIẾNG ANH HỌC THUẬT (GRADES 1 - 12) ──
  {
    week: 22,
    subject: 'english',
    grade: 1,
    topic: 'ENG_VOCAB_PHONICS',
    title: 'Phonics & Từ Vựng Ngữ Cảnh Nền Tảng',
    summary: 'Nhận diện phát âm chuẩn, từ vựng theo chủ đề gia đình, trường học, động vật và đồ vật thường nhật.',
    keyCompetencies: ['Nhận diện âm vị', 'Từ vựng nền tảng', 'Chính tả chuẩn xác'],
    sampleQuestionIds: ['asmo-eng-l1-2023-r1-q01'],
  },
  {
    week: 23,
    subject: 'english',
    grade: 3,
    topic: 'ENG_GRAMMAR_TENSES',
    title: 'Ngữ Pháp Chuyên Sâu & Thì Động Từ Cơ Bản',
    summary: 'Hiện tại đơn, hiện tại tiếp diễn, quá khứ đơn, câu hỏi Wh- và đại từ quan hệ cơ bản trong giao tiếp học thuật.',
    keyCompetencies: ['Chia thì chuẩn xác', 'Cấu trúc câu hỏi', 'Đại từ và giới từ'],
    sampleQuestionIds: ['asmo-eng-l2-2023-r1-q01'],
  },
  {
    week: 24,
    subject: 'english',
    grade: 5,
    topic: 'ENG_READING_COMP',
    title: 'Đọc Hiểu Văn Bản Học Thuật & Suy Luận Ngữ Nghĩa',
    summary: 'Kỹ thuật đọc lướt (Skimming), đọc quét (Scanning), phân tích luận điểm và trả lời câu hỏi đọc hiểu phức hợp.',
    keyCompetencies: ['Kỹ năng đọc hiểu', 'Suy luận ngữ nghĩa', 'Từ vựng đồng nghĩa/trái nghĩa'],
    sampleQuestionIds: ['asmo-eng-l3-2023-r1-q01'],
  },
  {
    week: 25,
    subject: 'english',
    grade: 7,
    topic: 'ENG_CLAUSES_CONDITIONAL',
    title: 'Mệnh Đề Quan Hệ, Câu Điều Kiện & Thể Bị Động',
    summary: 'Sử dụng Relative Clauses (who, whom, whose, which), câu điều kiện loại 1, 2, 3 và chuyển đổi thể chủ động - bị động.',
    keyCompetencies: ['Mệnh đề quan hệ', 'Câu điều kiện', 'Thể bị động nâng cao'],
    sampleQuestionIds: ['asmo-eng-l4-2022-r2-q01'],
  },
  {
    week: 26,
    subject: 'english',
    grade: 10,
    topic: 'ENG_ADVANCED_SYNTAX',
    title: 'Cấu Trúc Đảo Ngữ & Cụm Động Từ Học Thuật (Phrasal Verbs)',
    summary: 'Biến đổi cấu trúc câu đảo ngữ (Inversion), thành ngữ (Idioms), Collocations và cụm động từ chuyên sâu.',
    keyCompetencies: ['Cấu trúc đảo ngữ', 'Thành ngữ học thuật', 'Academic Collocations'],
    sampleQuestionIds: ['asmo-eng-l5-2023-r1-q01'],
  },
  {
    week: 27,
    subject: 'english',
    grade: 11,
    topic: 'ENG_SCHOLASTIC_RHETORIC',
    title: 'Tư Duy Ngôn Ngữ Học Thuật Quốc Tế & Viết Luận',
    summary: 'Phân tích ngữ cảnh tu từ, tư duy phản biện ngôn ngữ học và tổng hợp luận điểm trong đề thi ASMO cấp THPT.',
    keyCompetencies: ['Tư duy phản biện Anh ngữ', 'Phân tích văn phong học thuật', 'Tổng hợp luận điểm'],
    sampleQuestionIds: ['asmo-eng-l6-2023-r1-q01'],
  },
]
