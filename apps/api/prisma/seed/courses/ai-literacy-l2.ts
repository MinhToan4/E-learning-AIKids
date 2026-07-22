/**
 * L2 AI Literacy Course: "Hiểu Và Dùng AI"
 * Ages 9–11 · 12 quests · ~20 min/quest
 *
 * Pedagogy: Inspired by Little Thinkers AI (Young Creators level) and
 * Little AI Master's advanced quest system:
 * - Builds on L1 AI Literacy concepts with deeper exploration
 * - Introduces: data types, ML pipeline, ethics, neural networks basics, prompt engineering
 * - Uses Little AI Master's "daily flow": Learn → Play → Create → Check
 * - Prepares for responsible AI use in creative projects
 *
 * Structure: Quest unlock after previous quest. Capstone = mini AI project presentation.
 */
import type { CourseSeed, CheckQuestion } from '../types.js'

// ──────────────────────────────────────────────────────────────────────────────
// Check helpers
// ──────────────────────────────────────────────────────────────────────────────

function check(
  question: string,
  options: [string, string, string],
  correctIndex: 0 | 1 | 2,
  explain: string,
): CheckQuestion[] {
  return [
    { id: 'q1', question, options, correctIndex, explain },
    {
      id: 'q2',
      question: 'Theo em, con người hay AI nên ra quyết định cuối cùng?',
      options: ['AI vì AI luôn đúng', 'Con người vì AI là công cụ hỗ trợ', 'Bất kỳ ai cũng được'],
      correctIndex: 1,
      explain:
        'AI là công cụ mạnh mẽ nhưng con người phải chịu trách nhiệm về quyết định. Đây là nguyên tắc "Human-in-the-Loop".',
    },
  ]
}

// ──────────────────────────────────────────────────────────────────────────────
// Course definition
// ──────────────────────────────────────────────────────────────────────────────

export const courseAILiteracyL2: CourseSeed = {
  id: 'l2-k7-hieu-va-dung-ai',
  title: 'L2 · Hiểu Và Dùng AI',
  shortTitle: 'Hiểu Và Dùng AI',
  tagline:
    'Khám phá sâu về AI: dữ liệu, mô hình, đạo đức, mạng nơ-ron và kỹ thuật ra lệnh cho AI — dành cho creator tương lai.',
  description:
    '12 bài học 20 phút: từ "AI là gì" đến xây dựng tư duy phê phán về AI. Con sẽ hiểu ML pipeline, thực hành prompt engineering, nhận biết thiên lệch AI và chuẩn bị sẵn sàng dùng AI như một công cụ sáng tạo có trách nhiệm.',
  coverFrom: '#5646e8',
  coverTo: '#0ea5e9',
  accent: '#5646e8',
  coverImage: '/assets/designer/hub/home-character.jpeg',
  ageLabel: '9–11 tuổi',
  ageTrack: 'L2',
  courseKey: 'K6', // Bonus course using K6 slot — unique ID distinguishes it
  durationLabel: '6 buổi · 12 bài',
  productLabel: 'Dự Án AI Nhỏ + Huy Hiệu AI Creator',
  status: 'open',
  recommended: false,
  skills: [
    'Hiểu ML pipeline từ dữ liệu đến mô hình',
    'Nhận biết và phân tích thiên lệch AI',
    'Kỹ thuật prompt engineering cơ bản',
    'Đánh giá ứng dụng AI có đạo đức',
  ],
  outcomes: [
    'Giải thích được quá trình AI học (thu thập dữ liệu → huấn luyện → kiểm tra → triển khai)',
    'Nhận biết thiên lệch và đặt câu hỏi phê phán về AI',
    'Viết được prompt hiệu quả cho AI tạo sinh',
    'Hoàn thành 1 dự án AI nhỏ và trình bày được',
    'Huy hiệu AI Creator lưu trong Vũ trụ của em',
  ],
  recognition: {
    issuer: 'AI Kids Creator Academy',
    credential: 'Huy hiệu số: 🧠 AI Creator — Người Dùng AI Có Trách Nhiệm',
    finalAssessment:
      'Con thiết kế một ứng dụng AI giả định, phân tích dữ liệu cần thiết và xác định rủi ro thiên lệch tiềm tàng',
    frameworks: [
      {
        code: 'AI4K12',
        title: 'Five Big Ideas in AI – Concept 1-5: Perception, Representation, Learning, Interaction, Societal Impact',
      },
      { code: 'Thông tư 02/2025/TT-BGDĐT', title: 'Khung năng lực số cho người học' },
      { code: 'Quyết định 3439/QĐ-BGDĐT', title: 'Khung nội dung thí điểm giáo dục AI cho học sinh phổ thông' },
    ],
    disclaimer:
      'Khóa học được thiết kế có tham chiếu khung năng lực AI4K12 và Bộ GD&ĐT; đây không phải chứng nhận chính thức.',
  },
  sortOrder: 170,
  quests: [
    // ──────────────── BUỔI 1: AI LÀ GÌ THỰC SỰ? ────────────────────────────
    {
      id: 'l2-k7-q1',
      order: 1,
      title: 'AI không phải robot!',
      skill: 'Phân biệt AI thực tế với AI trong phim khoa học viễn tưởng',
      reward: 'Huy Hiệu Tư Duy Phê Phán AI',
      duration: '20 phút',
      hook: 'R2-D2, JARVIS, HAL 9000 — đây có phải AI thực tế không? Cùng tìm hiểu!',
      accent: '#5646e8',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Phân biệt AI hư cấu và AI thực tế',
        'Hiểu 3 loại AI: Narrow AI, General AI, Superintelligence',
        'Biết AI hiện tại là Narrow AI — rất giỏi 1 việc',
      ],
      concept:
        'AI trong phim (robot cảm xúc, máy thống trị thế giới) là AI hư cấu. AI thực tế ngày nay là "Narrow AI" — rất giỏi một việc cụ thể nhưng không thể làm được mọi thứ như người. GPT giỏi viết nhưng không thể lái xe. AI lái xe tự động không thể viết thơ!',
      example:
        'ChatGPT: Narrow AI về ngôn ngữ. AlphaGo: Narrow AI về cờ vây. AI phát hiện ung thư: Narrow AI về hình ảnh y tế. Chúng rất giỏi trong lĩnh vực của mình nhưng không thể làm việc của nhau.',
      check: check(
        'AI có thể làm MỌI việc như con người không?',
        ['Có, AI ngày nay rất toàn năng', 'Không, AI hiện tại chỉ giỏi một việc cụ thể', 'AI không làm được gì cả'],
        1,
        'AI ngày nay là "Narrow AI" — rất giỏi một lĩnh vực nhưng không thể làm tất cả. Chỉ có con người mới linh hoạt và sáng tạo thực sự!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l2-k7-q1-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: AI Thực Tế vs AI Phim Ảnh',
            content:
              'So sánh AI trong phim (Terminator, JARVIS) với AI thực tế (Siri, gợi ý YouTube). Giải thích tại sao AI thực tế không đáng sợ nhưng rất hữu ích.',
            outcome: 'Phân biệt AI hư cấu và thực tế, tránh hiểu lầm phổ biến',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q1-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Phim Hay Thực Tế? (Fact or Fiction)',
            instruction:
              'Mỗi mô tả về AI: "Thực tế" hay "Hư cấu trong phim"? Giải thích lý do!',
            outcome: 'Phân tích và phân loại thông tin về AI chính xác',
            gameType: 'detective',
            gameConfig: {
              pairs: [
                {
                  left: 'AI nhận diện khuôn mặt mở điện thoại',
                  right: 'Thực tế — Narrow AI về hình ảnh',
                },
                {
                  left: 'Robot có cảm xúc và kết bạn với người',
                  right: 'Hư cấu — AI không có cảm xúc thực sự',
                },
                {
                  left: 'AI gợi ý bài hát dựa trên lịch sử nghe',
                  right: 'Thực tế — Narrow AI về recommendation',
                },
                {
                  left: 'AI muốn chiếm quyền kiểm soát thế giới',
                  right: 'Hư cấu — AI không có mục tiêu riêng',
                },
                {
                  left: 'AI dịch ngôn ngữ trong thời gian thực',
                  right: 'Thực tế — Narrow AI về ngôn ngữ',
                },
              ],
            },
          },
          {
            id: 'l2-k7-q1-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Phóng Viên AI',
            instruction:
              'Viết 1 đoạn ngắn (4-5 câu) giải thích sự khác biệt giữa AI trong phim và AI thực tế cho một người chưa biết gì về AI. Sử dụng ít nhất 1 ví dụ cụ thể.',
            outcome: 'Tổng hợp kiến thức bằng ngôn ngữ rõ ràng, phê phán thông tin sai về AI',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q1-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'AI hiện tại là loại AI nào? Giải thích "Narrow AI" trong 1 câu.',
            outcome: 'Nắm vững phân loại AI và hiểu giới hạn của AI hiện tại',
          },
        ],
      },
    },
    {
      id: 'l2-k7-q2',
      order: 2,
      title: 'Dữ liệu là nhiên liệu của AI',
      skill: 'Hiểu vai trò của dữ liệu trong việc huấn luyện AI',
      reward: 'Huy Hiệu Nhà Khoa Học Dữ Liệu',
      duration: '20 phút',
      hook: 'AI không ăn cơm — AI "ăn" dữ liệu! Dữ liệu tốt → AI tốt.',
      accent: '#0ea5e9',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Phân loại được 3 loại dữ liệu: có cấu trúc, phi cấu trúc, bán cấu trúc',
        'Hiểu tại sao chất lượng dữ liệu quan trọng',
        'Biết quyền riêng tư dữ liệu là vấn đề đạo đức AI',
      ],
      concept:
        'Dữ liệu là "thức ăn" của AI. Có 3 loại: Có cấu trúc (bảng tính, số liệu), Phi cấu trúc (ảnh, văn bản, âm thanh), Bán cấu trúc (email, JSON). AI cần dữ liệu sạch, đủ nhiều, và đa dạng để học tốt. Nhưng dữ liệu thường là thông tin cá nhân — cần xử lý có đạo đức!',
      example:
        'AI gợi ý video cho con dùng: lịch sử xem (có cấu trúc), nội dung video (phi cấu trúc), siêu dữ liệu (bán cấu trúc). Nhưng điều này có nghĩa là YouTube biết con thích gì, xem bao lâu, khi nào. Con có thoải mái với điều đó không?',
      check: check(
        'Để AI dự báo thời tiết chính xác, cần loại dữ liệu nào?',
        [
          'Chỉ cần ảnh chụp bầu trời từ người dùng',
          'Nhiều loại: số liệu khí hậu, hình ảnh vệ tinh, dữ liệu lịch sử',
          'Không cần dữ liệu nếu AI đủ thông minh',
        ],
        1,
        'AI dự báo thời tiết cần nhiều loại dữ liệu đa dạng — càng đủ dữ liệu, AI càng chính xác!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l2-k7-q2-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: Cuộc Phiêu Lưu Của Dữ Liệu',
            content:
              'Trực quan hóa dữ liệu đi từ nguồn → làm sạch → huấn luyện AI → kết quả. Giới thiệu 3 loại dữ liệu bằng ví dụ thực tế vui nhộn.',
            outcome: 'Hiểu vai trò của dữ liệu và phân loại được các loại dữ liệu',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q2-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Phân Loại Dữ Liệu (Data Sort)',
            instruction:
              'Kéo từng loại dữ liệu vào đúng hộp! Có cấu trúc / Phi cấu trúc / Bán cấu trúc.',
            outcome: 'Nhận biết và phân loại các loại dữ liệu AI sử dụng',
            gameType: 'match',
            gameConfig: {
              pairs: [
                { left: 'Bảng điểm học sinh (tên, điểm, lớp)', right: 'Có cấu trúc' },
                { left: 'Ảnh chụp từ camera', right: 'Phi cấu trúc' },
                { left: 'Email với trường "Người gửi", "Tiêu đề"', right: 'Bán cấu trúc' },
                { left: 'Bài viết blog không có định dạng cố định', right: 'Phi cấu trúc' },
                { left: 'Bảng nhiệt độ theo ngày và giờ', right: 'Có cấu trúc' },
                { left: 'File JSON với các trường linh hoạt', right: 'Bán cấu trúc' },
              ],
            },
          },
          {
            id: 'l2-k7-q2-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Audit Dữ Liệu',
            instruction:
              'Chọn 1 ứng dụng AI con dùng thường xuyên (gợi ý nhạc, chatbot, bộ lọc ảnh). Liệt kê: (1) AI này cần dữ liệu gì để hoạt động? (2) Dữ liệu đó có thể thu thập từ đâu? (3) Có vấn đề quyền riêng tư nào không?',
            outcome: 'Phân tích chuỗi dữ liệu AI và nhận ra vấn đề quyền riêng tư',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q2-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Giải thích tại sao "rác vào, rác ra" (GIGO) trong AI. Cho 1 ví dụ.',
            outcome: 'Nắm vững nguyên tắc chất lượng dữ liệu ảnh hưởng trực tiếp đến AI',
          },
        ],
      },
    },

    // ──────────────── BUỔI 2: AI HỌC NHƯ THẾ NÀO? ──────────────────────────
    {
      id: 'l2-k7-q3',
      order: 3,
      title: 'Huấn luyện AI như huấn luyện thú cưng',
      skill: 'Hiểu quá trình huấn luyện Machine Learning',
      reward: 'Huy Hiệu Huấn Luyện Viên ML',
      duration: '20 phút',
      hook: 'Huấn luyện chó ngồi = đưa ví dụ → thưởng → lặp lại. AI học tương tự vậy!',
      accent: '#10b981',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Hiểu 3 loại học máy: supervised, unsupervised, reinforcement',
        'Nắm chu kỳ: thu thập → nhãn → huấn luyện → kiểm tra',
        'Biết tại sao cần tập dữ liệu kiểm tra riêng',
      ],
      concept:
        '3 cách AI học: (1) Học có giám sát (supervised): dạy bằng ví dụ có nhãn đúng/sai. (2) Học không giám sát (unsupervised): AI tự tìm nhóm từ dữ liệu chưa có nhãn. (3) Học tăng cường (reinforcement): AI thử → nhận điểm thưởng/phạt → cải thiện (như game!)',
      example:
        'AI phát hiện email rác: học có giám sát (dán nhãn "rác" / "không rác" cho hàng ngàn email). AI gợi ý sản phẩm: học không giám sát (tự nhóm người mua có sở thích tương tự). AI chơi cờ: học tăng cường (thắng ván = điểm thưởng).',
      check: check(
        'AI được cho xem 10.000 ảnh với nhãn "mèo" / "không phải mèo". Đây là loại học gì?',
        ['Học không giám sát', 'Học có giám sát', 'Học tăng cường'],
        1,
        'Học có giám sát = dạy bằng ví dụ có nhãn rõ ràng. AI học từ cặp (ảnh, nhãn)!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l2-k7-q3-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: 3 Cách AI Học',
            content:
              'Minh họa bằng analogy: chó học (supervised), trẻ em khám phá (unsupervised), game mario (reinforcement). Trực quan, dễ hiểu.',
            outcome: 'Phân biệt 3 loại học máy với ví dụ gần gũi',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q3-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Phân Loại Cách Học AI',
            instruction:
              'Mỗi ứng dụng AI này đang dùng loại học nào? Kéo vào đúng hộp!',
            outcome: 'Nhận biết và phân loại 3 phương pháp học máy trong ứng dụng thực tế',
            gameType: 'match',
            gameConfig: {
              pairs: [
                { left: 'AI dạy từ ảnh chó/không phải chó có nhãn', right: 'Supervised Learning' },
                { left: 'AI tự phân nhóm khách hàng không biết trước', right: 'Unsupervised Learning' },
                { left: 'AI chơi game, học từ điểm thắng/thua', right: 'Reinforcement Learning' },
                { left: 'AI dự báo giá nhà từ dữ liệu giá cũ có nhãn', right: 'Supervised Learning' },
                { left: 'AI tự phát hiện chủ đề trong hàng ngàn bài viết', right: 'Unsupervised Learning' },
              ],
            },
          },
          {
            id: 'l2-k7-q3-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Thiết Kế Hệ Thống Huấn Luyện AI',
            instruction:
              'Giả sử con muốn tạo AI nhận biết "trái cây chín" hay "chưa chín". Lên kế hoạch: (1) Cần bao nhiêu ảnh? (2) Ai sẽ dán nhãn? (3) Kiểm tra bằng cách nào? (4) Điều gì có thể sai?',
            outcome: 'Áp dụng chu kỳ ML pipeline vào bài toán thực tế',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q3-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Tại sao phải giữ riêng tập dữ liệu kiểm tra? Không dùng luôn cho huấn luyện?',
            outcome: 'Hiểu nguyên tắc train/test split để đánh giá AI trung thực',
          },
        ],
      },
    },
    {
      id: 'l2-k7-q4',
      order: 4,
      title: 'Mạng nơ-ron là gì?',
      skill: 'Hiểu khái niệm cơ bản về mạng nơ-ron nhân tạo',
      reward: 'Huy Hiệu Nhà Khoa Học Não Bộ',
      duration: '20 phút',
      hook: 'Não người có 86 tỷ nơ-ron. AI có mạng nơ-ron nhân tạo học theo cách tương tự!',
      accent: '#f43f5e',
      practiceKind: 'sketch',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Hiểu mạng nơ-ron nhân tạo (ANN) là gì',
        'Biết cơ chế cơ bản: input → xử lý → output',
        'Hiểu "deep learning" là nhiều tầng nơ-ron',
      ],
      concept:
        'Mạng nơ-ron nhân tạo mô phỏng não người: gồm các "nút" (nơ-ron) kết nối. Dữ liệu vào → đi qua nhiều tầng xử lý → kết quả ra. "Deep Learning" = mạng nhiều tầng, giỏi nhận diện ảnh, giọng nói, ngôn ngữ. Không phải não thật — chỉ là toán học!',
      example:
        'Nhận diện ảnh mèo: Tầng 1 nhận biết cạnh, đường nét. Tầng 2 ghép thành tai, mắt, mũi. Tầng 3 kết hợp thành "khuôn mặt mèo". Tầng cuối: "Đây là mèo, xác suất 95%!"',
      check: check(
        '"Deep Learning" có nghĩa là gì?',
        ['AI học rất chăm chỉ và lâu dài', 'Mạng nơ-ron có nhiều tầng xử lý', 'AI học ở độ sâu dưới nước'],
        1,
        'Deep Learning = nhiều tầng (layers) nơ-ron xử lý. Càng sâu, AI càng nhận ra được các đặc điểm phức tạp hơn!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l2-k7-q4-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: Xây Mạng Nơ-Ron Đơn Giản',
            content:
              'Vẽ trực tiếp mạng nơ-ron 3 tầng đơn giản. Dùng analogy: tầng 1 = "phát hiện nét vẽ", tầng 2 = "ghép hình dạng", tầng 3 = "nhận ra vật thể". Không cần công thức toán.',
            outcome: 'Hình dung cơ chế mạng nơ-ron bằng trực quan không cần toán học phức tạp',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q4-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Xây Mạng Nơ-Ron (Neuron Lab)',
            instruction:
              'Kéo từng bước vào đúng tầng trong mạng nơ-ron! Tầng đầu vào / Tầng ẩn 1 / Tầng ẩn 2 / Tầng đầu ra.',
            outcome: 'Hiểu luồng xử lý thông tin qua mạng nơ-ron',
            gameType: 'order',
            gameConfig: {
              cards: [
                'Tầng đầu vào: Nhận ảnh thô',
                'Tầng ẩn 1: Phát hiện cạnh và màu sắc',
                'Tầng ẩn 2: Ghép thành hình dạng (tai, mắt)',
                'Tầng đầu ra: "Đây là mèo" (xác suất)',
              ],
            },
          },
          {
            id: 'l2-k7-q4-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Vẽ Mạng Nơ-Ron Của Em',
            instruction:
              'Thiết kế mạng nơ-ron đơn giản để nhận biết "thức ăn ngon / không ngon". Vẽ sơ đồ với ít nhất 3 tầng và giải thích mỗi tầng làm gì.',
            outcome: 'Áp dụng khái niệm mạng nơ-ron vào bài toán tự chọn',
            practiceKind: 'sketch',
          },
          {
            id: 'l2-k7-q4-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Mạng nơ-ron nhân tạo có giống não người không? Điểm giống và khác là gì?',
            outcome: 'Phân biệt mạng nơ-ron nhân tạo và não người, tránh nhân cách hóa AI',
          },
        ],
      },
    },

    // ──────────────── BUỔI 3: AI VÀ ĐẠO ĐỨC ────────────────────────────────
    {
      id: 'l2-k7-q5',
      order: 5,
      title: 'AI có thể bất công!',
      skill: 'Phân tích thiên lệch AI và tác động xã hội',
      reward: 'Huy Hiệu Người Bảo Vệ Công Bằng AI',
      duration: '20 phút',
      hook: 'AI tuyển dụng tại Amazon từng loại CV của phụ nữ. Đây không phải lỗi robot — đây là lỗi dữ liệu!',
      accent: '#f59e0b',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Hiểu thiên lệch AI (AI bias) xuất phát từ đâu',
        'Phân tích 3 loại thiên lệch: dữ liệu, thuật toán, thiết kế',
        'Đề xuất giải pháp giảm thiên lệch',
      ],
      concept:
        'AI bias (thiên lệch) là khi AI đưa ra kết quả không công bằng với một số nhóm người. Nguồn gốc: (1) Thiên lệch dữ liệu: dữ liệu huấn luyện không đại diện cho tất cả. (2) Thiên lệch thuật toán: mô hình ưu tiên một số đặc điểm. (3) Thiên lệch thiết kế: người thiết kế không nhận ra vấn đề.',
      example:
        'AI nhận diện giọng nói của Google: ban đầu kém với giọng nữ và tiếng Anh không phải bản ngữ vì dữ liệu huấn luyện có nhiều giọng nam bản ngữ hơn. Giải pháp: thu thập thêm dữ liệu đa dạng.',
      check: check(
        'AI cho vay tiền thường từ chối người ở một số khu vực. Đây có thể là vấn đề gì?',
        ['AI hoạt động đúng theo dữ liệu', 'Thiên lệch dữ liệu lịch sử đã bất công được lặp lại', 'Người ở khu vực đó không xứng đáng'],
        1,
        'Dữ liệu lịch sử có thể phản ánh bất công xã hội cũ. AI lặp lại bất công đó nếu không được kiểm tra!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l2-k7-q5-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: 3 Trường Hợp AI Bất Công Nổi Tiếng',
            content:
              'Phân tích 3 case study thực tế: (1) AI tuyển dụng Amazon, (2) AI nhận diện khuôn mặt kém hơn với da tối màu, (3) AI dự đoán tái phạm tội tội phạm. Mỗi case: vấn đề gì, từ đâu, sửa thế nào.',
            outcome: 'Nhận biết thiên lệch AI qua case study thực tế, hình thành tư duy phê phán',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q5-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Thám Tử Thiên Lệch (Bias Detective)',
            instruction:
              'Đọc mô tả mỗi AI và xác định: (1) Có thiên lệch không? (2) Từ đâu? (3) Giải pháp là gì?',
            outcome: 'Phân tích thiên lệch AI theo đa chiều: nguồn gốc và giải pháp',
            gameType: 'detective',
            gameConfig: {
              pairs: [
                {
                  left: 'AI gợi ý nghề nghiệp: luôn gợi y tá cho nữ, bác sĩ cho nam',
                  right: 'Thiên lệch dữ liệu! Dữ liệu lịch sử phản ánh định kiến giới tính.',
                },
                {
                  left: 'AI dịch thuật: "bác sĩ" → "he" (anh ấy), "y tá" → "she" (cô ấy) dù không biết giới tính',
                  right: 'Thiên lệch dữ liệu! Cần thêm ví dụ đa dạng về giới tính và nghề nghiệp.',
                },
                {
                  left: 'AI nhận diện khuôn mặt: chính xác 99% với người châu Âu, 83% với người châu Phi',
                  right: 'Thiên lệch dữ liệu! Cần thêm ảnh đa dạng sắc tộc vào tập huấn luyện.',
                },
              ],
            },
          },
          {
            id: 'l2-k7-q5-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Kiểm Tra Công Bằng AI',
            instruction:
              'Chọn 1 AI con biết (gợi ý bài hát, tìm kiếm, chatbot). Phân tích: (1) AI này có thể thiên lệch với nhóm nào? (2) Dữ liệu huấn luyện có thể thiếu gì? (3) Em đề xuất cải thiện thế nào?',
            outcome: 'Áp dụng tư duy phê phán về thiên lệch AI vào ứng dụng thực tế',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q5-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Liệt kê 3 loại thiên lệch AI. Cách nào giúp giảm thiên lệch hiệu quả nhất?',
            outcome: 'Tổng hợp kiến thức về nguồn gốc và giải pháp cho thiên lệch AI',
          },
        ],
      },
    },
    {
      id: 'l2-k7-q6',
      order: 6,
      title: 'AI đạo đức là AI thế nào?',
      skill: 'Đánh giá AI theo 5 tiêu chí đạo đức',
      reward: 'Huy Hiệu AI Đạo Đức',
      duration: '20 phút',
      hook: 'Khi AI ra quyết định ảnh hưởng đến cuộc sống, cần phải có đạo đức. Nhưng "đạo đức AI" nghĩa là gì?',
      accent: '#8b5cf6',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Hiểu 5 tiêu chí đạo đức AI: fairness, transparency, privacy, safety, accountability',
        'Đánh giá một hệ thống AI theo 5 tiêu chí',
        'Biết "con người phải kiểm soát AI" là nguyên tắc cốt lõi',
      ],
      concept:
        'AI đạo đức cần 5 tiêu chí: (1) Fairness: công bằng với mọi người. (2) Transparency: giải thích được quyết định. (3) Privacy: bảo vệ thông tin cá nhân. (4) Safety: không gây hại. (5) Accountability: có người chịu trách nhiệm. Không có AI nào hoàn hảo — nhưng thiết kế tốt có thể cải thiện!',
      example:
        'AI tín dụng ngân hàng: Fairness (có phân biệt?) → Transparency (giải thích tại sao từ chối?) → Privacy (lưu trữ gì?) → Safety (tác động xã hội?) → Accountability (ai chịu trách nhiệm nếu sai?).',
      check: check(
        'AI từ chối cho vay nhưng không giải thích lý do. Vi phạm tiêu chí nào?',
        ['Safety — AI gây hại', 'Transparency — AI không giải thích được', 'Privacy — AI lấy dữ liệu'],
        1,
        'Transparency đòi hỏi AI phải giải thích được quyết định. "Hộp đen" (black box) không chấp nhận được trong quyết định quan trọng!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l2-k7-q6-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: 5 Nguyên Tắc AI Đạo Đức',
            content:
              'Giới thiệu 5 nguyên tắc với ví dụ cụ thể mỗi nguyên tắc. Dùng thang điểm trực quan để đánh giá 1 AI mẫu.',
            outcome: 'Biết 5 tiêu chí đánh giá AI đạo đức và ứng dụng chúng',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q6-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Tòa Án AI',
            instruction:
              'Mỗi hành vi của AI: Vi phạm tiêu chí đạo đức nào? Fairness / Transparency / Privacy / Safety / Accountability?',
            outcome: 'Vận dụng 5 tiêu chí đạo đức AI vào phân tích tình huống',
            gameType: 'match',
            gameConfig: {
              pairs: [
                { left: 'AI đọc tin nhắn cá nhân mà không xin phép', right: 'Privacy' },
                { left: 'AI ra quyết định y tế và không ai biết tại sao', right: 'Transparency' },
                { left: 'AI chỉ phát hiện ung thư chính xác với bệnh nhân da sáng', right: 'Fairness' },
                { left: 'AI xe tự lái gặp sự cố, không ai chịu trách nhiệm', right: 'Accountability' },
                { left: 'AI đề xuất thực phẩm không phù hợp với người dị ứng', right: 'Safety' },
              ],
            },
          },
          {
            id: 'l2-k7-q6-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Bảng Điểm AI',
            instruction:
              'Chọn 1 ứng dụng AI. Chấm điểm từ 1-5 cho mỗi tiêu chí đạo đức. Giải thích lý do cho mỗi điểm. Đề xuất 1 cải tiến.',
            outcome: 'Đánh giá AI theo khung đạo đức có hệ thống',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q6-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Tại sao "Human-in-the-Loop" (con người trong vòng kiểm soát) quan trọng với AI quyết định lớn?',
            outcome: 'Nắm vững nguyên tắc con người kiểm soát AI quan trọng',
          },
        ],
      },
    },

    // ──────────────── BUỔI 4: PROMPT ENGINEERING ────────────────────────────
    {
      id: 'l2-k7-q7',
      order: 7,
      title: 'Nói chuyện với AI như thế nào?',
      skill: 'Hiểu cấu trúc prompt hiệu quả cho AI tạo sinh',
      reward: 'Huy Hiệu Prompt Engineer',
      duration: '20 phút',
      hook: '"Vẽ mèo" vs "Vẽ mèo cam vui vẻ, phong cách anime, nền trắng" — kết quả hoàn toàn khác nhau!',
      accent: '#f43f5e',
      practiceKind: 'chips',
      stage: 'produce',
      videoUrl: null,
      goals: [
        'Hiểu cấu trúc prompt: vai trò, nhiệm vụ, ngữ cảnh, định dạng',
        'Thực hành viết prompt tốt hơn qua thử nghiệm',
        'Nhận biết prompt nào sẽ cho kết quả tốt',
      ],
      concept:
        'Prompt engineering là kỹ năng viết lệnh cho AI để có kết quả tốt nhất. Cấu trúc hay: (1) Vai trò: "Hãy đóng vai giáo viên giỏi..." (2) Nhiệm vụ: "...giải thích phân số cho học sinh lớp 4..." (3) Ngữ cảnh: "...bằng ví dụ liên quan đến pizza..." (4) Định dạng: "...trong 3 bước ngắn gọn."',
      example:
        'Yếu: "Viết truyện." Tốt hơn: "Viết truyện ngắn 100 từ về một robot tìm bạn, phong cách vui nhộn cho trẻ em 8 tuổi, kết thúc ấm áp." Prompt càng rõ → AI càng hiểu đúng ý!',
      check: check(
        'Prompt nào sẽ cho kết quả tốt hơn từ AI vẽ ảnh?',
        ['Vẽ con chó', 'Vẽ chú chó beagle màu nâu đang chạy trên bãi biển, phong cách tranh màu nước, ánh sáng chiều tà'],
        1,
        'Prompt B cung cấp: giống chó, màu sắc, hành động, bối cảnh, phong cách, ánh sáng. AI có đủ thông tin để vẽ đúng ý!',
      ),
      stations: {
        stage: 'produce',
        stations: [
          {
            id: 'l2-k7-q7-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: Nghệ Thuật Nói Chuyện Với AI',
            content:
              'Demo trực tiếp: cùng prompt nhưng 3 mức độ chi tiết khác nhau → 3 kết quả khác nhau. Phân tích cấu trúc prompt hiệu quả.',
            outcome: 'Thấy trực tiếp mối liên hệ giữa chất lượng prompt và chất lượng kết quả AI',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q7-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Xây Prompt (Prompt Builder)',
            instruction:
              'Kéo từng thành phần vào đúng vị trí trong cấu trúc prompt! Vai trò / Nhiệm vụ / Ngữ cảnh / Định dạng.',
            outcome: 'Nhớ và áp dụng cấu trúc 4 phần của prompt hiệu quả',
            gameType: 'order',
            gameConfig: {
              cards: [
                'Vai trò: Hãy đóng vai giáo viên lịch sử',
                'Nhiệm vụ: Giải thích cuộc chiến tranh Thế giới thứ 2',
                'Ngữ cảnh: Cho học sinh lớp 6, tập trung vào nhân vật chính',
                'Định dạng: Trong 5 câu ngắn gọn với bullet points',
              ],
            },
          },
          {
            id: 'l2-k7-q7-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Prompt Lab',
            instruction:
              'Viết 3 prompt: (1) Prompt yếu (1-2 từ). (2) Prompt trung bình (1 câu). (3) Prompt tốt (dùng cấu trúc 4 phần). So sánh và giải thích tại sao prompt 3 tốt hơn.',
            outcome: 'Thực hành viết và so sánh prompt ở nhiều mức độ',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q7-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Cấu trúc 4 phần của prompt tốt là gì? Cho 1 ví dụ hoàn chỉnh.',
            outcome: 'Nắm vững và áp dụng được cấu trúc prompt engineering',
          },
        ],
      },
    },
    {
      id: 'l2-k7-q8',
      order: 8,
      title: 'AI tạo sinh là gì?',
      skill: 'Hiểu AI tạo sinh (Generative AI) và cách dùng có trách nhiệm',
      reward: 'Huy Hiệu Creator AI',
      duration: '20 phút',
      hook: 'ChatGPT, DALL-E, Midjourney — đây là AI tạo sinh. Chúng tạo ra từ đâu?',
      accent: '#0ea5e9',
      practiceKind: 'journal',
      stage: 'produce',
      videoUrl: null,
      goals: [
        'Hiểu AI tạo sinh học từ dữ liệu và tạo nội dung mới',
        'Biết 3 loại: text (ChatGPT), image (DALL-E), audio (ElevenLabs)',
        'Hiểu rủi ro: deepfake, hallucination, copyright',
      ],
      concept:
        'AI tạo sinh (Generative AI) học từ hàng tỷ văn bản/ảnh và tạo nội dung MỚI (không copy nguyên). Có 3 loại: Văn bản (ChatGPT, Claude), Hình ảnh (DALL-E, Midjourney), Âm thanh/Giọng nói. Nguy hiểm: "Ảo giác" (hallucination = bịa ra thông tin), Deepfake (giả mạo người thật), vấn đề bản quyền.',
      example:
        'ChatGPT đôi khi "bịa" thông tin nghe rất tự tin: tên sách giả, sự kiện không có thật. Đây là "hallucination" — AI không biết mình đang sai! Luôn kiểm tra thông tin quan trọng.',
      check: check(
        '"Hallucination" trong AI có nghĩa là gì?',
        ['AI bị lỗi kỹ thuật và ngừng hoạt động', 'AI tạo ra thông tin sai nhưng nghe có vẻ đúng', 'AI bị virus tấn công'],
        1,
        'Hallucination = AI tự tin tạo ra thông tin không có thật. Luôn kiểm tra nguồn khi dùng AI cho thông tin quan trọng!',
      ),
      stations: {
        stage: 'produce',
        stations: [
          {
            id: 'l2-k7-q8-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: AI Tạo Sinh — Siêu Năng Lực Và Rủi Ro',
            content:
              'Demo AI tạo văn bản, ảnh, giọng nói. Giải thích rủi ro: hallucination (ví dụ thực tế), deepfake (giải thích ngắn gọn), copyright. Nhấn mạnh: luôn kiểm tra!',
            outcome: 'Hiểu khả năng và giới hạn của AI tạo sinh, nhận biết rủi ro',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q8-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Thật Hay AI Tạo? (Real or AI)',
            instruction:
              'Mỗi văn bản/thông tin: do con người viết hay AI tạo? Nếu AI, có dấu hiệu "ảo giác" không?',
            outcome: 'Phát triển kỹ năng nhận biết nội dung AI và kiểm tra thông tin',
            gameType: 'detective',
            gameConfig: {
              pairs: [
                {
                  left: 'Sách "Truyện Kiều" xuất bản năm 1987 bởi Nguyễn Du (sic)',
                  right: 'AI hallucination! Nguyễn Du sống thế kỷ 18-19, không thể xuất bản 1987.',
                },
                {
                  left: 'Hà Nội là thủ đô của Việt Nam, nằm ở miền Bắc',
                  right: 'Có thể thật. Thông tin này có thể kiểm chứng.',
                },
                {
                  left: '"Nhà khoa học AI tiên phong Minh Nguyễn, giải Nobel 2022" (không tồn tại)',
                  right: 'AI hallucination! Cần kiểm tra — người này không có trong dữ liệu thực.',
                },
              ],
            },
          },
          {
            id: 'l2-k7-q8-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Hướng Dẫn Dùng AI An Toàn',
            instruction:
              'Viết "5 quy tắc vàng dùng AI tạo sinh có trách nhiệm" dành cho bạn cùng tuổi. Ngôn ngữ rõ ràng, thực tế, có ví dụ.',
            outcome: 'Tổng hợp kiến thức về rủi ro AI và phát triển tư duy sử dụng có trách nhiệm',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q8-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Khi dùng AI viết bài tập, con cần lưu ý điều gì về "hallucination"?',
            outcome: 'Áp dụng kiến thức về AI hallucination vào học tập hàng ngày',
          },
        ],
      },
    },

    // ──────────────── BUỔI 5: AI VÀ XÃ HỘI ─────────────────────────────────
    {
      id: 'l2-k7-q9',
      order: 9,
      title: 'AI thay đổi thế giới',
      skill: 'Phân tích tác động tích cực và tiêu cực của AI lên xã hội',
      reward: 'Huy Hiệu Nhà Phân Tích Xã Hội AI',
      duration: '20 phút',
      hook: 'AI cứu sống nhiều người (phát hiện ung thư sớm) nhưng cũng có thể mất việc làm nhiều người. Đánh giá thế nào?',
      accent: '#10b981',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Nhận biết 5 lĩnh vực AI tác động mạnh: y tế, giáo dục, giao thông, nông nghiệp, nghệ thuật',
        'Phân tích lợi ích và rủi ro của AI trong từng lĩnh vực',
        'Đặt câu hỏi: AI nên được dùng ở đâu, ai quyết định?',
      ],
      concept:
        'AI đang thay đổi nhiều lĩnh vực: Y tế (phát hiện bệnh sớm), Giáo dục (học cá nhân hóa), Giao thông (xe tự lái), Nông nghiệp (tưới cây tự động), Nghệ thuật (tạo nhạc/ảnh). Nhưng cũng tạo thách thức: thất nghiệp tự động, quyền riêng tư, phụ thuộc vào AI.',
      example:
        'AI trong y tế: phát hiện ung thư vú chính xác hơn 20% so với bác sĩ trung bình. Nhưng: ai chịu trách nhiệm nếu AI sai? Bệnh nhân có quyền biết AI đưa ra kết quả không? Chi phí ai trả?',
      check: check(
        'AI phát hiện bệnh tốt hơn bác sĩ trong một số trường hợp. Điều này có nghĩa là:',
        ['AI nên thay thế bác sĩ hoàn toàn', 'AI là công cụ hỗ trợ bác sĩ ra quyết định tốt hơn', 'Không nên dùng AI trong y tế'],
        1,
        'AI là công cụ mạnh mẽ NHƯNG bác sĩ (con người) phải chịu trách nhiệm. AI + chuyên gia = kết hợp tốt nhất!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l2-k7-q9-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: AI 2030 — Thế Giới Của Em Sẽ Thế Nào?',
            content:
              'Dự đoán 5 lĩnh vực AI sẽ thay đổi đến 2030. Phân tích cân bằng: lợi ích và rủi ro. Nhấn mạnh: con người vẫn quyết định AI được dùng như thế nào.',
            outcome: 'Nhìn xa về tương lai AI với tư duy cân bằng, không cực đoan',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q9-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Lợi Ích Hay Rủi Ro?',
            instruction:
              'Mỗi tình huống AI: kéo vào "Lợi ích" hoặc "Rủi ro" (hoặc "Cả hai")!',
            outcome: 'Phân tích tác động AI nhiều chiều, tránh nhìn đơn giản',
            gameType: 'match',
            gameConfig: {
              pairs: [
                { left: 'AI phát hiện ung thư sớm hơn', right: 'Lợi ích — cứu sống người' },
                { left: 'Robot AI thay thế công nhân nhà máy', right: 'Cả hai — hiệu quả hơn nhưng người mất việc' },
                { left: 'AI tạo video giả mạo người thật (deepfake)', right: 'Rủi ro — đe dọa sự thật' },
                { left: 'AI cá nhân hóa bài học cho từng học sinh', right: 'Lợi ích — giáo dục tốt hơn' },
                { left: 'AI theo dõi mọi hành vi người dùng', right: 'Rủi ro — xâm phạm quyền riêng tư' },
              ],
            },
          },
          {
            id: 'l2-k7-q9-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Tranh Luận AI',
            instruction:
              'Chọn 1 ứng dụng AI gây tranh cãi. Viết 2 đoạn ngắn: (1) Ủng hộ: tại sao AI này có lợi. (2) Phản đối: tại sao cần cẩn thận. Kết luận: em đề xuất dùng AI này thế nào?',
            outcome: 'Phát triển tư duy tranh luận cân bằng về ứng dụng AI trong xã hội',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q9-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Khi AI tạo ra lợi ích nhưng cũng gây rủi ro, ai nên quyết định có dùng không?',
            outcome: 'Hiểu vai trò của xã hội và chính sách trong quản lý AI',
          },
        ],
      },
    },
    {
      id: 'l2-k7-q10',
      order: 10,
      title: 'Quyền riêng tư trong thời đại AI',
      skill: 'Hiểu và bảo vệ quyền riêng tư cá nhân khi dùng AI',
      reward: 'Huy Hiệu Bảo Vệ Quyền Riêng Tư',
      duration: '20 phút',
      hook: 'Mỗi lần con tìm kiếm, scroll mạng xã hội — AI đang học về con. Con muốn AI biết gì về mình?',
      accent: '#f59e0b',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Hiểu AI thu thập và dùng dữ liệu cá nhân như thế nào',
        'Biết quyền riêng tư kỹ thuật số của mình',
        'Thực hành thói quen bảo vệ quyền riêng tư',
      ],
      concept:
        'Mỗi khi dùng internet: điện thoại ghi lại nơi con ở, app ghi lại con nhấn vào đâu, AI phân tích thói quen con. Đây là dữ liệu cá nhân — thuộc về con! Con có quyền: biết ai thu thập gì, yêu cầu xóa, lựa chọn không chia sẻ.',
      example:
        'Khi dùng TikTok: AI ghi lại con xem video gì bao lâu, bạn bè nào, vị trí nào. AI dùng để gợi ý video tiếp theo — nhưng cũng bán cho nhà quảng cáo. Con có biết điều này không?',
      check: check(
        'App yêu cầu truy cập vị trí GPS, danh bạ và camera. Con nên làm gì?',
        ['Cho phép tất cả — nhanh hơn', 'Chỉ cho phép quyền thực sự cần thiết cho app', 'Không dùng app nào cả'],
        1,
        'Nguyên tắc "ít quyền nhất cần thiết": chỉ cho phép quyền app thực sự cần. Đọc điều khoản và nghĩ kỹ trước khi nhấn "Đồng ý"!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l2-k7-q10-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: Dấu Vết Số Của Con',
            content:
              'Trực quan hóa "digital footprint": mỗi hành động online để lại dấu vết. Giải thích AI thu thập gì, dùng để làm gì. Hướng dẫn thực hành bảo vệ quyền riêng tư.',
            outcome: 'Nhận thức về dấu vết số và quyền riêng tư trong thời đại AI',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q10-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: An Toàn Hay Nguy Hiểm? (Privacy Check)',
            instruction:
              'Mỗi hành động: có nguy cơ quyền riêng tư cao không?',
            outcome: 'Nhận biết hành vi nguy cơ quyền riêng tư và thói quen an toàn',
            gameType: 'match',
            gameConfig: {
              pairs: [
                { left: 'Đăng ảnh kèm địa chỉ nhà lên mạng xã hội', right: 'Nguy hiểm! AI và người xấu có thể biết nơi ở.' },
                { left: 'Dùng mật khẩu khác nhau cho mỗi app', right: 'An toàn — hạn chế thiệt hại nếu 1 app bị hack.' },
                { left: 'Cho phép app game truy cập danh bạ điện thoại', right: 'Nguy hiểm! Game không cần danh bạ của con.' },
                { left: 'Đọc trước xem app thu thập dữ liệu gì', right: 'An toàn — biết trước để quyết định có dùng không.' },
              ],
            },
          },
          {
            id: 'l2-k7-q10-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Kiểm Tra Quyền Riêng Tư',
            instruction:
              'Cùng bố mẹ kiểm tra cài đặt quyền riêng tư trên 1 thiết bị. Liệt kê: (1) App nào có quyền gì? (2) Quyền nào không cần thiết? (3) Điều chỉnh cài đặt phù hợp.',
            outcome: 'Thực hành bảo vệ quyền riêng tư kỹ thuật số trong cuộc sống thực',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q10-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Liệt kê 3 cách bảo vệ quyền riêng tư khi dùng AI và internet.',
            outcome: 'Nắm vững thói quen bảo vệ quyền riêng tư kỹ thuật số',
          },
        ],
      },
    },

    // ──────────────── BUỔI 6: DỰ ÁN AI ─────────────────────────────────────
    {
      id: 'l2-k7-q11',
      order: 11,
      title: 'Thiết kế dự án AI của em',
      skill: 'Áp dụng kiến thức AI vào thiết kế dự án có ý nghĩa',
      reward: 'Huy Hiệu Nhà Thiết Kế AI',
      duration: '20 phút',
      hook: 'Bây giờ con hiểu AI. Hãy thiết kế ứng dụng AI giải quyết một vấn đề thực sự!',
      accent: '#5646e8',
      practiceKind: 'journal',
      stage: 'produce',
      videoUrl: null,
      goals: [
        'Xác định bài toán xã hội cần giải quyết',
        'Thiết kế giải pháp AI với dữ liệu, mô hình, đạo đức',
        'Phân tích rủi ro và đề xuất biện pháp giảm thiểu',
      ],
      concept:
        'Thiết kế AI tốt = xác định vấn đề → thu thập dữ liệu phù hợp → chọn loại học máy → kiểm tra công bằng → đảm bảo an toàn và minh bạch. Không cần code! Con chỉ cần nghĩ như một nhà thiết kế AI có đạo đức.',
      example:
        'Dự án: "AI giúp học sinh lựa chọn sách phù hợp". (1) Vấn đề: học sinh khó tìm sách đúng trình độ. (2) Dữ liệu: lịch sử đọc sách, đánh giá, tuổi. (3) Học: supervised (gợi ý dựa trên sách đã thích). (4) Công bằng: đảm bảo gợi ý đa dạng thể loại. (5) An toàn: không lưu thông tin cá nhân của trẻ em.',
      check: check(
        'Bước QUAN TRỌNG nhất khi thiết kế AI là gì?',
        ['Chọn thuật toán phức tạp nhất', 'Xác định vấn đề cần giải quyết và ai sẽ bị ảnh hưởng', 'Thu thập càng nhiều dữ liệu càng tốt'],
        1,
        'Không có bài toán rõ ràng → AI dù mạnh đến đâu cũng không giải quyết được gì! Bắt đầu từ VẤN ĐỀ, không phải công nghệ.',
      ),
      stations: {
        stage: 'produce',
        stations: [
          {
            id: 'l2-k7-q11-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: Thiết Kế AI Như Kỹ Sư',
            content:
              'Hướng dẫn framework thiết kế AI đơn giản: Vấn đề → Dữ liệu → Mô hình → Kiểm tra → Triển khai. Ví dụ thực tế từ một dự án AI học sinh thực hiện.',
            outcome: 'Nắm được quy trình thiết kế AI từ ý tưởng đến kế hoạch',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q11-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Điền Vào Kế Hoạch AI',
            instruction:
              'Sắp xếp đúng thứ tự các bước thiết kế AI!',
            outcome: 'Nhớ quy trình thiết kế AI theo thứ tự logic',
            gameType: 'order',
            gameConfig: {
              cards: [
                'Bước 1: Xác định vấn đề và người dùng',
                'Bước 2: Xác định dữ liệu cần thu thập',
                'Bước 3: Chọn loại học máy phù hợp',
                'Bước 4: Kiểm tra công bằng và đạo đức',
                'Bước 5: Lên kế hoạch triển khai và giám sát',
              ],
            },
          },
          {
            id: 'l2-k7-q11-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Bản Thiết Kế AI Của Em',
            instruction:
              'Điền vào template: (1) Vấn đề: ... (2) Người dùng: ... (3) Dữ liệu cần: ... (4) Loại học máy: ... (5) Nguy cơ thiên lệch: ... (6) Biện pháp an toàn: ...',
            outcome: 'Thiết kế ứng dụng AI hoàn chỉnh với tư duy có đạo đức',
            practiceKind: 'journal',
          },
          {
            id: 'l2-k7-q11-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Dự án AI của con giải quyết vấn đề gì? Ai hưởng lợi? Rủi ro nào?',
            outcome: 'Xác nhận dự án AI thiết kế đầy đủ và có tư duy đạo đức',
          },
        ],
      },
    },
    {
      id: 'l2-k7-q12',
      order: 12,
      title: 'Trình bày dự án AI của em!',
      skill: 'Trình bày dự án AI rõ ràng, thuyết phục và có trách nhiệm',
      reward: 'Huy Hiệu AI Creator — Người Dùng AI Có Trách Nhiệm 🧠',
      duration: '20 phút',
      hook: 'Demo Day! Hãy giới thiệu dự án AI của em như một nhà sáng lập startup AI thực thụ!',
      accent: '#f59e0b',
      practiceKind: 'reflect',
      stage: 'produce',
      videoUrl: null,
      goals: [
        'Trình bày dự án AI theo cấu trúc: vấn đề → giải pháp → dữ liệu → đạo đức',
        'Trả lời câu hỏi phản biện về AI một cách tự tin',
        'Nhận huy hiệu AI Creator',
      ],
      concept:
        'Trình bày dự án AI tốt = giải thích rõ vấn đề (why), giải pháp AI (how), tác động (what). Và quan trọng: thừa nhận giới hạn và rủi ro — đây là dấu hiệu của nhà thiết kế AI có trách nhiệm!',
      example:
        'Pitch ngắn 2 phút: "Vấn đề: nhiều học sinh khó tìm sách phù hợp. Giải pháp: AI gợi ý sách cá nhân hóa. Dữ liệu: lịch sử đọc, đánh giá. Giới hạn: cần dữ liệu đủ đa dạng để tránh thiên lệch. Bước tiếp: thử nghiệm với 50 học sinh đầu tiên."',
      check: [
        {
          id: 'q1-rubric',
          question: 'Dự án AI của con xác định rõ vấn đề và đối tượng hưởng lợi',
          options: ['Đã có trong dự án của em', 'Em cần hoàn thiện thêm'],
          correctIndex: 0,
          explain: 'Vấn đề rõ ràng = nền tảng của mọi dự án AI tốt!',
        },
        {
          id: 'q2-rubric',
          question: 'Dự án của con phân tích được ít nhất 1 nguy cơ thiên lệch',
          options: ['Đã có trong dự án của em', 'Em cần hoàn thiện thêm'],
          correctIndex: 0,
          explain: 'Nhận ra nguy cơ thiên lệch = dấu hiệu tư duy AI có đạo đức!',
        },
        {
          id: 'q3-rubric',
          question: 'Con có thể giải thích dự án AI của mình bằng lời đơn giản cho người không biết gì về AI',
          options: ['Có, em có thể giải thích rõ ràng', 'Em cần luyện tập thêm'],
          correctIndex: 0,
          explain: 'Khả năng giải thích đơn giản = hiểu sâu thực sự. Nếu giải thích được, con đã thực sự hiểu!',
        },
      ],
      stations: {
        stage: 'produce',
        stations: [
          {
            id: 'l2-k7-q12-video',
            kind: 'video',
            durationMin: 4,
            title: 'Video: Cách Pitch Dự Án AI Như Pro',
            content:
              'Demo một bản trình bày dự án AI mẫu 2 phút. Breakdown: hook → vấn đề → giải pháp → dữ liệu → đạo đức → kêu gọi hành động.',
            outcome: 'Nắm được cấu trúc và phong cách trình bày dự án AI tự tin',
            videoUrl: null,
          },
          {
            id: 'l2-k7-q12-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Quiz Tốt Nghiệp AI Creator',
            instruction:
              'Trả lời 12 câu hỏi tổng hợp từ tất cả bài học! Mỗi câu đúng = 1 sao. 10+ sao = AI Creator!',
            outcome: 'Đánh giá toàn diện kiến thức AI từ khóa học',
            gameType: 'pick',
            gameConfig: {
              pairs: [
                { left: 'AI hiện tại là loại AI nào?', right: 'Narrow AI' },
                { left: 'GIGO trong AI có nghĩa là gì?', right: 'Rác vào, rác ra — dữ liệu tệ → AI tệ' },
                { left: 'Supervised learning là gì?', right: 'Học từ ví dụ có nhãn đúng/sai' },
                { left: 'Hallucination trong AI là gì?', right: 'AI tạo ra thông tin sai nhưng tự tin' },
                { left: 'Transparency trong AI đạo đức nghĩa là gì?', right: 'AI phải giải thích được quyết định' },
              ],
            },
          },
          {
            id: 'l2-k7-q12-practice',
            kind: 'practice',
            durationMin: 9,
            title: '✏️ Thực hành: Demo Day!',
            instruction:
              'Ghi âm hoặc quay video 2 phút trình bày dự án AI của em. Bao gồm: vấn đề, giải pháp AI, dữ liệu, nguy cơ thiên lệch, và điều em tự hào nhất!',
            outcome: 'Tổng kết hành trình với sản phẩm trình bày hoàn chỉnh',
            practiceKind: 'reflect',
          },
          {
            id: 'l2-k7-q12-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra tốt nghiệp AI Creator',
            instruction:
              'Tự rà soát 3 tiêu chí: dự án rõ vấn đề, phân tích thiên lệch, giải thích được đơn giản?',
            outcome: 'Xác nhận hoàn thành khóa AI Literacy L2 với đầy đủ kỹ năng AI Creator',
          },
        ],
      },
    },
  ],
}
