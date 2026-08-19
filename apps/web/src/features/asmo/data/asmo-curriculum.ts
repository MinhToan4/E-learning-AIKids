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
    description: 'Rèn luyện tư duy số học, hình học không gian 3D, quy luật dãy số, toán logic và tổ hợp.',
    icon: '📐',
    totalWeeks: 36,
    totalTopics: 18,
  },
  science: {
    id: 'science',
    name: 'Khoa Học Tự Nhiên',
    englishName: 'Science Olympiad',
    badgeText: 'ASMO-SCI',
    accentColor: '#059669',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    description: 'Khám phá thế giới sinh vật, hệ sinh thái, năng lượng, quang học, lực học và các hiện tượng tự nhiên.',
    icon: '🔬',
    totalWeeks: 36,
    totalTopics: 14,
  },
  english: {
    id: 'english',
    name: 'Tiếng Anh Học Thuật',
    englishName: 'English Olympiad',
    badgeText: 'ASMO-ENG',
    accentColor: '#ea580c',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
    description: 'Phát triển vốn từ vựng ngữ cảnh, ngữ pháp chuyên sâu, tư duy đọc hiểu và suy luận logic bằng Anh ngữ.',
    icon: '🔤',
    totalWeeks: 36,
    totalTopics: 16,
  },
}

export const ASMO_GRADES: Array<{ grade: AsmoGrade; label: string; ageRange: string }> = [
  { grade: 1, label: 'Lớp 1 (Grade 1)', ageRange: '6–7 tuổi' },
  { grade: 2, label: 'Lớp 2 (Grade 2)', ageRange: '7–8 tuổi' },
  { grade: 3, label: 'Lớp 3 (Grade 3)', ageRange: '8–9 tuổi' },
  { grade: 4, label: 'Lớp 4 (Grade 4)', ageRange: '9–10 tuổi' },
  { grade: 5, label: 'Lớp 5 (Grade 5)', ageRange: '10–11 tuổi' },
]

export const ASMO_CURRICULUM_WEEKS: AsmoCurriculumWeek[] = [
  // ── MATH GRADE 1-2 ──
  {
    week: 1,
    subject: 'math',
    grade: 1,
    topic: 'MATH_GEO_3D_COUNT',
    title: 'Đếm Khối Lập Phương 3D Cơ Bản',
    summary: 'Nhận biết hình khối 3D xếp chồng, đếm khối nhìn thấy và khối bị che khuất theo từng tầng.',
    keyCompetencies: ['Tư duy không gian 3D', 'Phân tích đa góc nhìn', 'Đếm logic theo tầng'],
    visualTemplate: '3D_CUBE_CLUSTER',
    sampleQuestionIds: ['asmo-math-g1-q01', 'asmo-math-g1-q05'],
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
    sampleQuestionIds: ['asmo-math-g1-q02', 'asmo-math-g1-q22'],
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
    sampleQuestionIds: ['asmo-math-g1-q03', 'asmo-math-g1-q17'],
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
    sampleQuestionIds: ['asmo-math-g2-q01', 'asmo-math-g2-q15'],
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
    sampleQuestionIds: ['asmo-math-g2-q02', 'asmo-math-g1-q09'],
  },

  // ── MATH GRADE 3-5 ──
  {
    week: 6,
    subject: 'math',
    grade: 3,
    topic: 'MATH_GEO_FRACTION',
    title: 'Phân Số Diện Tích Phần Tô Đậm',
    summary: 'Xác định phân số biểu thị phần diện tích được tô màu trong hình tròn, hình vuông chia phần.',
    keyCompetencies: ['Khái niệm phân số hình học', 'So sánh tỉ lệ diện tích', 'Tính toán phần bù'],
    visualTemplate: 'SHADED_AREA_FRACTION',
    sampleQuestionIds: ['asmo-math-g3-q01', 'asmo-math-g3-q03'],
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
    sampleQuestionIds: ['asmo-math-g4-q01', 'asmo-math-g5-q02'],
  },
  {
    week: 8,
    subject: 'math',
    grade: 5,
    topic: 'MATH_COMB_PERMUTATION',
    title: 'Tổ Hợp & Nguyên Lý Dirichlet (Ngăn Kéo)',
    summary: 'Giải các bài toán bốc bi, sắp xếp vị trí và chứng minh sự tồn tại trong các tình huống thi đấu Olympic.',
    keyCompetencies: ['Nguyên lý bồ câu / ngăn kéo', 'Tổ hợp đếm trường hợp xấu nhất', 'Lập luận chặt chẽ'],
    sampleQuestionIds: ['asmo-math-g5-q03'],
  },

  // ── SCIENCE CURRICULUM ──
  {
    week: 9,
    subject: 'science',
    grade: 1,
    topic: 'SCI_PLANT_ANIMALS',
    title: 'Thế Giới Thực Vật & Động Vật Quanh Em',
    summary: 'Tìm hiểu vòng đời của bướm, cây hoa, các bộ phận của cây và môi trường sống của muôn loài.',
    keyCompetencies: ['Quan sát sinh học', 'Phân loại sinh vật', 'Hiểu chu trình sống'],
    sampleQuestionIds: ['asmo-sci-l1-q01', 'asmo-sci-l1-q02'],
  },
  {
    week: 10,
    subject: 'science',
    grade: 3,
    topic: 'SCI_STATES_OF_MATTER',
    title: 'Các Thể Của Vật Chất & Vòng Tuần Hoàn Nước',
    summary: 'Rắn, lỏng, khí và các quá trình bay hơi, ngưng tụ, đông đặc trong tự nhiên.',
    keyCompetencies: ['Hiện tượng vật lý cơ bản', 'Thí nghiệm nhiệt độ', 'Vòng tuần hoàn nước'],
    sampleQuestionIds: ['asmo-sci-l2-q01', 'asmo-sci-l2-q02'],
  },
  {
    week: 11,
    subject: 'science',
    grade: 4,
    topic: 'SCI_LIGHT_SHADOW',
    title: 'Ánh Sáng, Bóng Tối & Hệ Mặt Trời',
    summary: 'Đặc tính truyền thẳng của ánh sáng, nguồn sáng, sự hình thành bóng râm và các hành tinh trong Thái Dương Hệ.',
    keyCompetencies: ['Quang học trực quan', 'Thiên văn học cơ bản', 'Suy luận hình học bóng chiếu'],
    sampleQuestionIds: ['asmo-sci-l3-q01'],
  },

  // ── ENGLISH CURRICULUM ──
  {
    week: 12,
    subject: 'english',
    grade: 1,
    topic: 'ENG_VOCAB_PHONICS',
    title: 'Phonics & Từ Vựng Ngữ Cảnh Đời Sống',
    summary: 'Nhận diện phát âm, ghép từ, tìm từ đồng nghĩa/trái nghĩa trong các chủ đề gia đình, trường học, thiên nhiên.',
    keyCompetencies: ['Nhận diện âm vị', 'Vốn từ vựng nền tảng', 'Chính tả chuẩn xác'],
    sampleQuestionIds: ['asmo-eng-l1-q01', 'asmo-eng-l1-q02'],
  },
  {
    week: 13,
    subject: 'english',
    grade: 3,
    topic: 'ENG_GRAMMAR_TENSES',
    title: 'Ngữ Pháp Chuyên Sâu & Thì Động Từ',
    summary: 'Hiện tại đơn, hiện tại tiếp diễn, quá khứ đơn, câu điều kiện loại 0/1 và liên từ chỉ nguyên nhân - kết quả.',
    keyCompetencies: ['Cấu trúc ngữ pháp', 'Chia thì chuẩn xác', 'Liên kết câu mạch lạc'],
    sampleQuestionIds: ['asmo-eng-l2-q01', 'asmo-eng-l2-q02'],
  },
  {
    week: 14,
    subject: 'english',
    grade: 5,
    topic: 'ENG_READING_INFERENCE',
    title: 'Đọc Hiểu & Suy Luận Đoạn Văn Olympic',
    summary: 'Kỹ thuật đọc lướt (Skimming), đọc quét (Scanning) và tìm ý ẩn sâu (Inference) trong bài đọc học thuật.',
    keyCompetencies: ['Đọc hiểu nâng cao', 'Phân tích luận điểm', 'Suy luận logic Anh ngữ'],
    sampleQuestionIds: ['asmo-eng-l3-q01'],
  },
]
