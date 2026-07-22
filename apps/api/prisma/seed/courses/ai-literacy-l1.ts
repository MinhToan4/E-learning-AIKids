/**
 * L1 AI Literacy Course: "AI Bạn Của Em"
 * Ages 6–8 · 8 quests · ~18 min/quest
 *
 * Pedagogy: Inspired by Little Thinkers AI (littlethinkersai.com) and
 * Little AI Master (app.littleaimaster.com):
 * - Concept-first: understand AI ideas BEFORE using AI tools
 * - Game-based: each quest has an interactive game (sort, match, detect...)
 * - Build a tiny "AI scientist" identity (badges, stars, streak)
 * - Safety: all content age-appropriate, no personal data
 *
 * Structure per quest: Learn (video) → Play (game) → Practice → Check
 * Mirrors Little Thinkers' flow: "Read the lesson → Play the activity → Build the project → Tick it off"
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
      question: 'AI có thể sai không?',
      options: ['Không, AI luôn đúng 100%', 'Có, con cần kiểm tra kết quả', 'AI không cần kiểm tra'],
      correctIndex: 1,
      explain: 'AI học từ ví dụ — đôi khi nó đoán sai! Con là người kiểm tra cuối cùng.',
    },
  ]
}

// ──────────────────────────────────────────────────────────────────────────────
// Course definition
// ──────────────────────────────────────────────────────────────────────────────

export const courseAILiteracyL1: CourseSeed = {
  id: 'l1-k7-ai-ban-cua-em',
  title: 'L1 · AI Bạn Của Em',
  shortTitle: 'AI Bạn Của Em',
  tagline: 'Khám phá AI qua trò chơi — phân loại, nhận biết, và huấn luyện máy như một nhà khoa học tí hon.',
  description:
    '8 bài học ngắn 18 phút: mỗi bài có video ngắn, trò chơi tương tác, thực hành và kiểm tra nhanh. Con sẽ hiểu AI học như thế nào, tại sao đôi khi AI sai, và cách dùng AI thông minh và an toàn.',
  coverFrom: '#7C6CF0',
  coverTo: '#22d3ee',
  accent: '#7C6CF0',
  coverImage: '/assets/designer/hub/art-image.jpeg',
  ageLabel: '6–8 tuổi',
  ageTrack: 'L1',
  courseKey: 'K6', // Bonus course using K6 slot — unique ID distinguishes it
  durationLabel: '4 buổi · 8 bài',
  productLabel: 'Huy hiệu Nhà Khoa Học AI Tí Hon',
  status: 'open',
  recommended: false,
  skills: [
    'Hiểu AI học từ ví dụ',
    'Phân loại và nhận biết mẫu',
    'Kiểm tra và chỉnh kết quả AI',
    'Dùng AI an toàn và đúng cách',
  ],
  outcomes: [
    'Giải thích được AI học như thế nào bằng lời đơn giản',
    'Biết phân loại và nhận biết mẫu như AI',
    'Hiểu tại sao AI đôi khi sai và cách giúp AI tốt hơn',
    'Huy hiệu Nhà Khoa Học AI Tí Hon lưu trong Vũ trụ của em',
  ],
  recognition: {
    issuer: 'AI Kids Creator Academy',
    credential: 'Huy hiệu số: 🤖 Nhà Khoa Học AI Tí Hon',
    finalAssessment: 'Con giải thích được AI là gì và chỉ ra ví dụ AI trong cuộc sống',
    frameworks: [
      { code: 'AI4K12', title: 'Five Big Ideas in AI – Concept 1: Perception, Representation & Reasoning' },
      { code: 'Thông tư 02/2025/TT-BGDĐT', title: 'Khung năng lực số cho người học' },
    ],
    disclaimer:
      'Khóa học được thiết kế có tham chiếu khung năng lực AI4K12 và chương trình thí điểm AI của Bộ GD&ĐT; đây không phải chứng nhận chính thức.',
  },
  sortOrder: 70,
  quests: [
    // ──────────────── BUỔI 1: AI LÀ GÌ? ─────────────────────────────────────
    {
      id: 'l1-k7-q1',
      order: 1,
      title: 'Máy học được không?',
      skill: 'Hiểu sự khác biệt giữa máy móc thông thường và máy biết học',
      reward: 'Huy hiệu Nhà Khám Phá AI',
      duration: '18 phút',
      hook: 'Đồng hồ bấm giờ thì không học được. Máy học AI thì có! Tại sao vậy?',
      accent: '#7C6CF0',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Phân biệt được máy thông thường và máy học AI',
        'Cho được 1 ví dụ AI trong cuộc sống',
        'Hiểu AI không nghĩ như người',
      ],
      concept:
        'AI (Trí tuệ nhân tạo) là máy tính được huấn luyện bằng rất nhiều ví dụ để nhận ra và đoán điều gì đó. Giống như con học nhận biết con mèo sau khi thấy nhiều con mèo — AI cũng học từ ví dụ!',
      example:
        'Trợ lý giọng nói nghe được "hẹn giờ 5 phút" → biết phải bấm đồng hồ. AI học từ hàng ngàn câu nói mẫu để hiểu được điều con muốn.',
      check: check(
        'Con mèo hay AI: ai học được từ ví dụ?',
        ['Chỉ con mèo', 'Cả hai đều học từ ví dụ theo cách riêng', 'Không ai học được'],
        1,
        'Cả con mèo và AI đều học từ ví dụ — nhưng AI học từ hàng triệu ví dụ kỹ thuật số!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l1-k7-q1-video',
            kind: 'video',
            durationMin: 3,
            title: 'Video: Máy học được không?',
            content:
              'Host đặt câu hỏi: "Con robot chơi cờ, máy giữ nhiệt độ — cái nào học từ ví dụ?" Giải thích bằng hình ảnh đơn giản.',
            outcome: 'Phân biệt máy thực hiện lệnh cố định vs máy học từ ví dụ',
            videoUrl: null,
          },
          {
            id: 'l1-k7-q1-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Máy Học Hay Không Học?',
            instruction:
              'Nhìn vào từng thứ: Tủ lạnh, Gợi ý bài hát, Máy tính bỏ túi, Nhận diện khuôn mặt, Đèn tự động, Bộ lọc ảnh AI. Kéo vào đúng nhóm: "Học từ ví dụ" hay "Chỉ làm theo lệnh cố định"?',
            outcome: 'Phân loại được ví dụ AI học và không học',
            gameType: 'match',
            gameConfig: {
              pairs: [
                { left: 'Gợi ý bài hát', right: 'Học từ ví dụ' },
                { left: 'Nhận diện khuôn mặt', right: 'Học từ ví dụ' },
                { left: 'Bộ lọc ảnh AI', right: 'Học từ ví dụ' },
                { left: 'Máy tính bỏ túi', right: 'Chỉ làm theo lệnh cố định' },
                { left: 'Tủ lạnh thường', right: 'Chỉ làm theo lệnh cố định' },
              ],
            },
          },
          {
            id: 'l1-k7-q1-practice',
            kind: 'practice',
            durationMin: 8,
            title: '✏️ Thực hành: Nhật ký AI của em',
            instruction:
              'Viết/nói 2 điều: (1) Một thứ AI con thấy hôm nay. (2) Con nghĩ nó học từ đâu?',
            outcome: 'Liên kết khái niệm AI với cuộc sống thực của bé',
            practiceKind: 'journal',
          },
          {
            id: 'l1-k7-q1-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Trả lời 2 câu hỏi nhanh về AI học từ ví dụ',
            outcome: 'Xác nhận hiểu đúng khái niệm AI cơ bản',
          },
        ],
      },
    },
    {
      id: 'l1-k7-q2',
      order: 2,
      title: 'Máy phân loại giỏi lắm!',
      skill: 'Hiểu phân loại là kỹ năng cốt lõi của AI',
      reward: 'Huy hiệu Máy Phân Loại',
      duration: '18 phút',
      hook: 'AI nhìn vào ngàn bức ảnh và phân loại siêu nhanh. Hãy thử làm như AI!',
      accent: '#3dbfff',
      practiceKind: 'drag',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Hiểu phân loại là việc cho thứ vào đúng nhóm',
        'Thực hành phân loại theo nhiều tiêu chí',
        'Hiểu AI giỏi phân loại vì được huấn luyện nhiều',
      ],
      concept:
        'Phân loại là một trong những việc AI làm giỏi nhất. Giống như con biết phân loại đồ chơi vào đúng hộp — AI được dạy phân loại email rác, nhận biết ảnh mèo/chó, phát hiện từ bị sai chính tả.',
      example:
        'Bỏ thư vào đúng hộp: thư từ bạn bè, thư quảng cáo, thư quan trọng. AI cũng phân loại email theo cách tương tự!',
      check: check(
        'Con nhìn vào ảnh và biết đó là con mèo. Đây là gì?',
        ['Con đang tính toán', 'Con đang phân loại', 'Con đang đoán mò'],
        1,
        'Nhận ra và phân loại đúng loại — đó là điều cả con và AI đều làm!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l1-k7-q2-video',
            kind: 'video',
            durationMin: 3,
            title: 'Video: Máy Phân Loại Giỏi Lắm!',
            content:
              'Host dùng ví dụ phân loại trái cây: màu, hình dạng, mùi vị. Giải thích AI camera phân loại ảnh theo đặc điểm tương tự.',
            outcome: 'Hiểu phân loại theo đặc điểm là kỹ năng cốt lõi của AI',
            videoUrl: null,
          },
          {
            id: 'l1-k7-q2-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Máy Phân Loại (Sorting Machine)',
            instruction:
              'Kéo từng thứ vào đúng hộp! Hộp xanh: con vật. Hộp đỏ: đồ ăn. Hộp vàng: đồ vật. Nhanh lên — máy phân loại đang hoạt động!',
            outcome: 'Thực hành phân loại nhanh và chính xác như AI',
            gameType: 'match',
            gameConfig: {
              pairs: [
                { left: '🐱 Mèo', right: 'Con vật' },
                { left: '🍎 Táo', right: 'Đồ ăn' },
                { left: '✏️ Bút chì', right: 'Đồ vật' },
                { left: '🐶 Chó', right: 'Con vật' },
                { left: '🍊 Cam', right: 'Đồ ăn' },
                { left: '📚 Sách', right: 'Đồ vật' },
              ],
            },
          },
          {
            id: 'l1-k7-q2-practice',
            kind: 'practice',
            durationMin: 8,
            title: '✏️ Thực hành: Con là Máy Phân Loại',
            instruction:
              'Nhìn quanh phòng và liệt kê 6 thứ. Phân loại chúng theo 2 tiêu chí con tự đặt ra (ví dụ: màu sắc, công dụng, vật liệu).',
            outcome: 'Sáng tạo tiêu chí phân loại, hiểu AI cũng cần "quy tắc" để phân loại',
            practiceKind: 'journal',
          },
          {
            id: 'l1-k7-q2-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Trả lời: Phân loại là gì? Tại sao AI giỏi việc này?',
            outcome: 'Xác nhận hiểu phân loại là kỹ năng cốt lõi của AI',
          },
        ],
      },
    },

    // ──────────────── BUỔI 2: AI HỌC TỪ ĐÂU? ─────────────────────────────────
    {
      id: 'l1-k7-q3',
      order: 3,
      title: 'Ví dụ ví dụ ví dụ!',
      skill: 'Hiểu AI học từ rất nhiều ví dụ (dữ liệu)',
      reward: 'Huy hiệu Nhà Huấn Luyện AI',
      duration: '18 phút',
      hook: 'Con dạy AI mèo bằng cách cho AI xem... 10.000 ảnh mèo!',
      accent: '#3ed9a0',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Hiểu AI học từ ví dụ (dữ liệu)',
        'Hiểu tại sao cần nhiều ví dụ đa dạng',
        'Biết "ví dụ tệ → AI học tệ" (rubbish in, rubbish out)',
      ],
      concept:
        'AI học giống như con học nhận ra bạn bè: sau khi gặp Minh nhiều lần ở nhiều nơi, con nhớ mặt Minh. AI được "gặp" hàng triệu ví dụ để học. Càng nhiều ví dụ tốt → AI càng giỏi!',
      example:
        'Muốn AI nhận biết mèo: cho AI xem 10.000 ảnh mèo (mèo lớn, nhỏ, nhiều màu, nhiều dáng). Nếu chỉ cho xem mèo trắng — AI sẽ nghĩ mèo đen không phải mèo!',
      check: check(
        'Muốn AI nhận biết hoa tốt, con nên làm gì?',
        ['Chỉ cho AI xem 3 ảnh hoa hồng', 'Cho AI xem nhiều ảnh nhiều loại hoa khác nhau', 'Không cần dạy AI gì cả'],
        1,
        'Càng nhiều ví dụ đa dạng, AI càng học được nhiều và nhận biết chính xác hơn!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l1-k7-q3-video',
            kind: 'video',
            durationMin: 3,
            title: 'Video: Dạy AI như Dạy Bạn',
            content:
              'Giải thích bằng hình ảnh vui: AI là một bạn chưa biết gì, cần được "dạy" bằng rất nhiều ví dụ. Tương tự trẻ học nhận biết chữ cái.',
            outcome: 'Hiểu AI học từ ví dụ, không phải từ sách vở hay người dạy trực tiếp',
            videoUrl: null,
          },
          {
            id: 'l1-k7-q3-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Dạy Robot Nhận Biết Mèo',
            instruction:
              'Con là giáo viên! Hãy chọn ảnh nào là mèo để dạy robot. Sau đó robot đoán — đúng hay sai? Thêm ví dụ mới để giúp robot học tốt hơn!',
            outcome: 'Trải nghiệm chu kỳ dạy-kiểm tra-cải thiện của AI',
            gameType: 'detective',
            gameConfig: {
              pairs: [
                { left: 'Ảnh mèo cam to', right: 'Mèo ✓' },
                { left: 'Ảnh mèo nhỏ đen', right: 'Mèo ✓' },
                { left: 'Ảnh chó vàng', right: 'Không phải mèo ✗' },
                { left: 'Ảnh mèo đang ngủ', right: 'Mèo ✓' },
                { left: 'Ảnh con hổ', right: 'Không phải mèo ✗' },
              ],
            },
          },
          {
            id: 'l1-k7-q3-practice',
            kind: 'practice',
            durationMin: 8,
            title: '✏️ Thực hành: Con Là Giáo Viên AI',
            instruction:
              'Nếu con phải dạy AI nhận biết "trái cây ngon" — con sẽ cho AI xem những ảnh gì? Vẽ hoặc viết 5 ví dụ con sẽ dùng và giải thích tại sao.',
            outcome: 'Hiểu cần chọn ví dụ tốt và đa dạng để AI học đúng',
            practiceKind: 'journal',
          },
          {
            id: 'l1-k7-q3-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Trả lời: Nếu AI học từ ví dụ tệ, chuyện gì xảy ra?',
            outcome: 'Nắm vững nguyên tắc "garbage in, garbage out"',
          },
        ],
      },
    },
    {
      id: 'l1-k7-q4',
      order: 4,
      title: 'Tìm mẫu như thám tử',
      skill: 'Nhận biết và áp dụng mẫu (pattern) như AI',
      reward: 'Huy hiệu Thám Tử Mẫu',
      duration: '18 phút',
      hook: 'Thám tử tìm manh mối. AI tìm mẫu. Cả hai đều cần kỹ năng quan sát!',
      accent: '#ff7b93',
      practiceKind: 'detective',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Nhận biết mẫu lặp lại trong chuỗi',
        'Dự đoán điều tiếp theo dựa vào mẫu',
        'Hiểu AI dùng mẫu để đưa ra dự đoán',
      ],
      concept:
        'Mẫu (pattern) là sự lặp lại có quy luật. Con nhìn thấy "mặt trời mọc mỗi sáng" → đó là mẫu! AI tìm mẫu trong dữ liệu để dự đoán: bài hát tiếp theo con muốn nghe, chữ tiếp theo trong câu...',
      example:
        'Con nghe: "lạnh, mưa, nắng, lạnh, mưa, ?" → Con đoán "nắng". AI làm việc tương tự với thời tiết, giọng nói, ảnh!',
      check: check(
        'Nhìn vào chuỗi: 🔴🔵🟡🔴🔵? AI sẽ đoán gì tiếp theo?',
        ['🔴', '🟡', '🔵'],
        2,
        'Mẫu lặp lại: đỏ-xanh-vàng-đỏ-xanh → tiếp theo là vàng!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l1-k7-q4-video',
            kind: 'video',
            durationMin: 3,
            title: 'Video: Thám Tử Mẫu',
            content:
              'Host cùng con tìm mẫu trong thiên nhiên: vân ngón tay, cánh hoa, sóng biển. Giải thích AI tìm mẫu tương tự trong dữ liệu số.',
            outcome: 'Nhận biết mẫu là hiện tượng phổ biến, AI dùng mẫu để học và dự đoán',
            videoUrl: null,
          },
          {
            id: 'l1-k7-q4-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Tìm Mẫu Tiếp Theo (Pattern Finder)',
            instruction:
              'Nhìn vào chuỗi và chọn cái tiếp theo! Mỗi lần đúng, thám tử AI của con lên cấp!',
            outcome: 'Thực hành nhận biết và áp dụng mẫu',
            gameType: 'pick',
            gameConfig: {
              pairs: [
                { left: '🔴🔵🟡🔴🔵__?', right: '🟡' },
                { left: '1 2 3 1 2 __?', right: '3' },
                { left: '☀️🌙☀️🌙__?', right: '☀️' },
                { left: 'to nhỏ to nhỏ __?', right: 'to' },
              ],
            },
          },
          {
            id: 'l1-k7-q4-practice',
            kind: 'practice',
            durationMin: 8,
            title: '✏️ Thực hành: Tạo Mẫu Của Em',
            instruction:
              'Tạo một mẫu lặp lại (dùng hình vẽ, màu sắc, hoặc chữ) và đố bạn/bố mẹ đoán cái tiếp theo!',
            outcome: 'Củng cố hiểu biết về mẫu bằng cách tự tạo',
            practiceKind: 'journal',
          },
          {
            id: 'l1-k7-q4-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Mẫu giúp AI làm gì? Cho 1 ví dụ AI dùng mẫu trong cuộc sống.',
            outcome: 'Kết nối khái niệm mẫu với ứng dụng AI thực tế',
          },
        ],
      },
    },

    // ──────────────── BUỔI 3: AI CÓ THỂ SAI ─────────────────────────────────
    {
      id: 'l1-k7-q5',
      order: 5,
      title: 'AI cũng sai đấy!',
      skill: 'Hiểu AI có thể sai và cách kiểm tra kết quả',
      reward: 'Kính Thám Tử AI',
      duration: '18 phút',
      hook: 'Khi AI nhận ra mèo là chó, chuyện gì xảy ra? Con là người kiểm tra!',
      accent: '#ffc94a',
      practiceKind: 'detective',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Hiểu AI đôi khi đưa ra kết quả sai',
        'Biết cách kiểm tra kết quả AI',
        'Hiểu con người cần kiểm soát AI',
      ],
      concept:
        'AI học từ ví dụ — nhưng nếu ví dụ không đủ tốt, hoặc gặp tình huống mới lạ, AI có thể đoán sai! Giống như con học từ sách — vẫn có thể nhầm khi gặp bài toán khó. Đó là lý do con người cần kiểm tra kết quả AI.',
      example:
        'AI dịch "bank" tiếng Anh → có thể dịch nhầm là "ngân hàng" khi thực ra nghĩa là "bờ sông". AI không hiểu ngữ cảnh như người!',
      check: check(
        'AI nhận ra chó là mèo. Con nên làm gì?',
        ['Tin AI và không kiểm tra', 'Kiểm tra lại và báo cáo lỗi', 'Xóa AI đi'],
        1,
        'Con người cần kiểm tra AI và giúp AI học tốt hơn. Con là "giám đốc kiểm tra" AI!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l1-k7-q5-video',
            kind: 'video',
            durationMin: 3,
            title: 'Video: Những Lần AI "Trật Đường Ray"',
            content:
              'Kể chuyện vui về những lần AI sai ngộ nghĩnh: AI nhận ra bánh mì là mèo, AI dịch câu bị lộn ngữ nghĩa... Giải thích tại sao AI sai.',
            outcome: 'Hiểu AI sai là chuyện bình thường, quan trọng là con người kiểm tra',
            videoUrl: null,
          },
          {
            id: 'l1-k7-q5-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Thám Tử Lỗi AI (Spot the AI Mistake)',
            instruction:
              'AI đã nhận dạng các thứ này. Con hãy tìm lỗi! AI gọi "táo" là gì? Đúng hay sai? Giải thích tại sao AI có thể sai!',
            outcome: 'Thực hành kiểm tra kết quả AI một cách phê phán',
            gameType: 'detective',
            gameConfig: {
              pairs: [
                { left: 'AI gọi con mèo là "con chó"', right: 'Sai — mèo và chó có điểm giống nhau nhưng khác loài' },
                { left: 'AI nhận ra cái ô (dù) là "cây"', right: 'Sai — hình dáng giống cây nhưng đây là đồ vật' },
                { left: 'AI nhận ra quả táo là "quả táo"', right: 'Đúng rồi!' },
                { left: 'AI gọi ảnh mặt trời là "quả bóng màu vàng"', right: 'Sai — mặt trời không phải đồ vật' },
              ],
            },
          },
          {
            id: 'l1-k7-q5-practice',
            kind: 'practice',
            durationMin: 8,
            title: '✏️ Thực hành: Con Là Người Kiểm Tra AI',
            instruction:
              'Hỏi AI (với sự giúp đỡ của bố mẹ) một câu hỏi đơn giản. Kiểm tra câu trả lời: Đúng không? Có gì thiếu không? Ghi lại nhận xét của con.',
            outcome: 'Rèn thói quen kiểm tra và đặt câu hỏi về kết quả AI',
            practiceKind: 'journal',
          },
          {
            id: 'l1-k7-q5-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Tại sao phải kiểm tra kết quả AI? Con có thể nêu 2 lý do không?',
            outcome: 'Nắm vững tầm quan trọng của việc kiểm tra kết quả AI',
          },
        ],
      },
    },
    {
      id: 'l1-k7-q6',
      order: 6,
      title: 'Ai dạy AI phải công bằng',
      skill: 'Hiểu AI cần được dạy công bằng (fairness & bias)',
      reward: 'Huy hiệu Người Bảo Vệ Công Bằng',
      duration: '18 phút',
      hook: 'Nếu chỉ dạy AI nhận biết mèo trắng, AI có thể nghĩ mèo đen không phải mèo. Đó là BẤT CÔNG!',
      accent: '#a78bfa',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Hiểu khái niệm thiên lệch (bias) trong AI',
        'Biết dữ liệu không đủ đa dạng gây ra thiên lệch',
        'Hiểu AI công bằng cần dữ liệu đa dạng và đại diện',
      ],
      concept:
        'Khi AI học từ ví dụ không đầy đủ, nó có thể "thiên lệch" — ưu tiên một số nhóm hơn nhóm khác. Ví dụ: AI nhận diện giọng nói chỉ học từ người lớn → khó nghe giọng trẻ em. Đây gọi là "bias" hay thiên lệch.',
      example:
        'AI chọn người thắng cuộc thi chỉ nhìn vào ảnh — nếu AI chỉ học từ người cao to, người thấp bé có thể bị loại oan! Đó không công bằng. Con cần dạy AI từ ví dụ của MỌI người.',
      check: check(
        'AI chọn người dẫn chương trình và luôn chọn người mặc áo xanh. Vấn đề gì?',
        ['AI hoạt động đúng rồi', 'AI có thể bị thiên lệch với màu áo', 'Màu áo xanh đúng là đẹp nhất'],
        1,
        'AI bị "bias" khi học từ dữ liệu lệch! Màu áo không nên quyết định ai giỏi.',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l1-k7-q6-video',
            kind: 'video',
            durationMin: 3,
            title: 'Video: AI Công Bằng',
            content:
              'Kể chuyện: Cookie Machine — máy phát bánh quy chỉ cho nhóm mèo cam, bỏ quên mèo đen. Giải thích đây là thiên lệch và cách sửa: thêm ví dụ đủ mọi loại mèo.',
            outcome: 'Hiểu thiên lệch AI bằng ví dụ cụ thể, gần gũi với trẻ',
            videoUrl: null,
          },
          {
            id: 'l1-k7-q6-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Kiểm Tra Công Bằng (Spot the Bias)',
            instruction:
              'AI tuyển học sinh vào trường năng khiếu. Nhìn vào cách AI chọn và tìm điểm bất công! Giúp sửa lại dữ liệu để AI công bằng hơn.',
            outcome: 'Nhận biết thiên lệch và thực hành tư duy công bằng',
            gameType: 'detective',
            gameConfig: {
              pairs: [
                { left: 'AI chỉ chọn học sinh cao trên 1m4 → 10 ứng viên thấp hơn bị loại', right: 'Bất công! Chiều cao không liên quan đến tài năng' },
                { left: 'AI chọn ai vẽ đẹp nhất sau khi xem bài vẽ → có 20 ứng viên được chọn', right: 'Công bằng hơn! Chọn theo tài năng thực sự' },
                { left: 'AI chỉ học từ học sinh thành phố → học sinh nông thôn ít được chọn hơn', right: 'Bất công! AI cần học từ học sinh mọi nơi' },
              ],
            },
          },
          {
            id: 'l1-k7-q6-practice',
            kind: 'practice',
            durationMin: 8,
            title: '✏️ Thực hành: Quy Tắc AI Công Bằng Của Em',
            instruction:
              'Viết 3 quy tắc để AI công bằng hơn. Ví dụ: "AI phải xem ví dụ từ mọi người, không chỉ một nhóm."',
            outcome: 'Phát triển tư duy về công bằng và trách nhiệm với AI',
            practiceKind: 'journal',
          },
          {
            id: 'l1-k7-q6-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: '"Thiên lệch AI" nghĩa là gì? Cách nào giúp AI công bằng hơn?',
            outcome: 'Nắm vững khái niệm fairness trong AI',
          },
        ],
      },
    },

    // ──────────────── BUỔI 4: AI AN TOÀN VÀ THẾ GIỚI ─────────────────────────
    {
      id: 'l1-k7-q7',
      order: 7,
      title: 'AI ở khắp nơi!',
      skill: 'Nhận biết AI trong cuộc sống hàng ngày',
      reward: 'Huy hiệu Thám Tử AI',
      duration: '18 phút',
      hook: 'AI ẩn ở đâu trong nhà con? Trong trường học? Trong thành phố?',
      accent: '#10b981',
      practiceKind: 'journal',
      stage: 'ideate',
      videoUrl: null,
      goals: [
        'Nhận biết AI trong 5+ lĩnh vực cuộc sống',
        'Hiểu AI giúp ích cho con người',
        'Biết con người luôn quyết định cuối cùng',
      ],
      concept:
        'AI đang giúp đỡ con người ở rất nhiều nơi: bác sĩ dùng AI tìm bệnh, nông dân dùng AI chăm cây trồng, ô tô dùng AI tránh tai nạn. Nhưng AI chỉ là công cụ — con người luôn là người quyết định!',
      example:
        'AI trong điện thoại: gợi ý emoji khi nhắn tin. AI trong nhà bếp: gợi ý công thức nấu ăn. AI trong bệnh viện: giúp bác sĩ đọc kết quả xét nghiệm nhanh hơn.',
      check: check(
        'Bác sĩ dùng AI để đọc kết quả xét nghiệm. Ai quyết định chữa trị cho bệnh nhân?',
        ['AI quyết định hoàn toàn', 'Bác sĩ quyết định với sự trợ giúp của AI', 'Không cần ai quyết định'],
        1,
        'AI là công cụ trợ giúp, nhưng bác sĩ — con người — luôn là người chịu trách nhiệm cuối cùng!',
      ),
      stations: {
        stage: 'ideate',
        stations: [
          {
            id: 'l1-k7-q7-video',
            kind: 'video',
            durationMin: 3,
            title: 'Video: Safari AI Trong Cuộc Sống',
            content:
              'Host cùng con "săn" AI trong 1 ngày bình thường: báo thức thông minh, gợi ý nhạc, bản đồ chỉ đường, bộ lọc ảnh. AI ở khắp nơi!',
            outcome: 'Nhận biết AI trong cuộc sống hàng ngày, không chỉ trong robot hay phim khoa học viễn tưởng',
            videoUrl: null,
          },
          {
            id: 'l1-k7-q7-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Safari Tìm AI (AI Hunt)',
            instruction:
              'Nhìn vào ảnh: Bệnh viện, Nông trại, Trường học, Siêu thị, Xe hơi. Kéo "thẻ AI" vào đúng nơi AI đang giúp ích!',
            outcome: 'Liên kết ứng dụng AI với các lĩnh vực cuộc sống cụ thể',
            gameType: 'match',
            gameConfig: {
              pairs: [
                { left: 'AI đọc X-quang nhanh', right: 'Bệnh viện' },
                { left: 'AI tưới cây đúng lúc', right: 'Nông trại' },
                { left: 'AI gợi ý bài học phù hợp', right: 'Trường học' },
                { left: 'AI quản lý kho hàng', right: 'Siêu thị' },
                { left: 'AI tránh va chạm tự động', right: 'Xe hơi' },
              ],
            },
          },
          {
            id: 'l1-k7-q7-practice',
            kind: 'practice',
            durationMin: 8,
            title: '✏️ Thực hành: Bản Đồ AI Của Em',
            instruction:
              'Vẽ sơ đồ đơn giản một ngày của con và đánh dấu nơi AI xuất hiện. Chia sẻ với bố mẹ!',
            outcome: 'Tổng hợp nhận biết AI trong cuộc sống cá nhân',
            practiceKind: 'sketch',
          },
          {
            id: 'l1-k7-q7-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra nhanh',
            instruction: 'Kể 3 nơi AI đang giúp con người. AI có thay thế được con người không?',
            outcome: 'Hiểu vai trò hỗ trợ của AI, con người luôn quyết định',
          },
        ],
      },
    },
    {
      id: 'l1-k7-q8',
      order: 8,
      title: 'Con là Nhà Khoa Học AI!',
      skill: 'Tổng hợp kiến thức AI và trình bày hiểu biết',
      reward: 'Huy hiệu Nhà Khoa Học AI Tí Hon + Sao hoàn thành',
      duration: '18 phút',
      hook: 'Con đã học được rất nhiều về AI. Hãy chia sẻ với thế giới!',
      accent: '#f59e0b',
      practiceKind: 'reflect',
      stage: 'produce',
      videoUrl: null,
      goals: [
        'Tổng hợp 7 điều đã học về AI',
        'Trình bày ngắn gọn AI là gì bằng lời của mình',
        'Nhận huy hiệu Nhà Khoa Học AI Tí Hon',
      ],
      concept:
        'Con đã học: AI học từ ví dụ, AI phân loại và tìm mẫu, AI có thể sai, AI cần công bằng, AI giúp ích ở khắp nơi. Bây giờ con có thể giải thích AI cho bạn bè và gia đình!',
      example:
        'Khi bạn hỏi "AI là gì?", con có thể nói: "AI là máy tính học từ nhiều ví dụ để nhận biết, phân loại và dự đoán. Giống như con học nhận biết bạn bè, nhưng AI học từ hàng triệu ví dụ!"',
      check: check(
        'Con giải thích cho bạn về AI trong 1 câu. Câu nào hay nhất?',
        [
          'AI là robot thông minh như trong phim',
          'AI là máy học từ ví dụ để giúp đỡ con người',
          'AI là phần mềm trên điện thoại',
        ],
        1,
        'Câu B nắm đúng bản chất: AI học từ ví dụ và giúp đỡ — không phải robot hay chỉ là phần mềm!',
      ),
      stations: {
        stage: 'produce',
        stations: [
          {
            id: 'l1-k7-q8-video',
            kind: 'video',
            durationMin: 3,
            title: 'Video: Tổng Kết Hành Trình',
            content:
              'Nhìn lại 7 bài học: phân loại, ví dụ, mẫu, AI sai, công bằng, AI ở khắp nơi. Con đã trở thành Nhà Khoa Học AI Tí Hon!',
            outcome: 'Củng cố tổng thể kiến thức đã học',
            videoUrl: null,
          },
          {
            id: 'l1-k7-q8-game',
            kind: 'game',
            durationMin: 5,
            title: '🎮 Game: Quiz Nhà Khoa Học AI',
            instruction:
              '7 câu hỏi nhanh về những gì con đã học. Đúng mỗi câu nhận được 1 sao. Đủ 7 sao = Nhà Khoa Học AI Tí Hon!',
            outcome: 'Kiểm tra toàn diện kiến thức AI literacy',
            gameType: 'pick',
            gameConfig: {
              pairs: [
                { left: 'AI học từ gì?', right: 'Nhiều ví dụ (dữ liệu)' },
                { left: 'Phân loại là gì?', right: 'Cho thứ vào đúng nhóm' },
                { left: 'Mẫu giúp AI làm gì?', right: 'Dự đoán điều tiếp theo' },
                { left: 'AI có thể sai không?', right: 'Có, cần con kiểm tra' },
                { left: 'Thiên lệch AI là gì?', right: 'AI ưu tiên một nhóm hơn nhóm khác' },
              ],
            },
          },
          {
            id: 'l1-k7-q8-practice',
            kind: 'practice',
            durationMin: 8,
            title: '✏️ Thực hành: Thư Nhỏ Của Nhà Khoa Học',
            instruction:
              'Ghi âm hoặc viết một đoạn ngắn 3-4 câu: "Con tên là... Hôm nay con học được rằng AI là..." Chia sẻ với gia đình!',
            outcome: 'Trình bày kiến thức AI bằng ngôn ngữ riêng của bé',
            practiceKind: 'reflect',
          },
          {
            id: 'l1-k7-q8-check',
            kind: 'check',
            durationMin: 2,
            title: '✅ Kiểm tra tốt nghiệp',
            instruction:
              'Tự rà soát: Con giải thích được AI là gì, AI học thế nào, và tại sao AI cần công bằng chưa?',
            outcome: 'Xác nhận hoàn thành khóa học AI Literacy L1',
          },
        ],
      },
    },
  ],
}
