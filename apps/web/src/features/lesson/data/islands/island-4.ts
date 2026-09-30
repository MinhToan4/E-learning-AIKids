import type { IslandCurriculumLesson } from "./types"

export const ISLAND_4_LESSONS: IslandCurriculumLesson[] = [
  {
    "id": "bai-4-1",
    "slug": "bai-4-1-3-cong-cua-vuong-quoc",
    "islandNumber": 4,
    "lessonNumber": "4.1",
    "title": "Bài 4.1 — 3 Cổng của Vương Quốc",
    "subtitle": "Mọi câu chuyện cuốn hút đều đi qua 3 Cổng!",
    "imageUrl": "/assets/aiki-islands/island4_lesson1_3gates.jpg",
    "objective": "Trẻ kể miệng được một chuyện có đủ ba phần.",
    "skillLearned": "Ba phần: bình thường, có chuyện, giải quyết.",
    "nextLessonSlug": "bai-4-2-04-chang-thu-thach",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-1-3-cong-cua-vuong-quoc-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.1 — 3 Cổng của Vương Quốc",
        "goalText": "Trẻ kể miệng được một chuyện có đủ ba phần.",
        "imageUrl": "/assets/aiki-islands/island4_lesson1_3gates.jpg",
        "speech": "Bona: Hôm qua tớ kể chuyện về Chíp cho AIKI nghe: 'Chíp thức dậy. Chíp ăn sáng. Chíp ra sân chơi. Chíp ăn trưa. Chíp về nhà ngủ. Hết!'\nAKI: Ơ... nghe xong tớ thấy thiếu thiếu Bona ơi! Mọi việc đều đúng, nhưng phẳng lì như tờ giấy vì chẳng có biến cố gì xảy ra cả!",
        "keyPoints": [
          "[1] CỔNG 1 — BÌNH THƯỜNG — \"Chíp mang quả bóng yêu thích ra sân chơi như mọi hôm\": (Lúc đầu nhân vật đang làm gì?)",
          "[2] CỔNG 2 — CÓ CHUYỆN — \"quả bóng lăn qua khe, mắc bên kia hàng rào\": (Điều gì bất ngờ xảy ra?)",
          "[3] CỔNG 3 — GIẢI QUYẾT — \"Chíp tìm một cành cây dài, khều quả bóng trở lại\": (Nhân vật làm gì để xử lý, cuối cùng ra sao?)",
          "[4] LUẬT CỦA AKI — AKI không nghĩ câu chuyện thay con: (Bí thì AKI chỉ hỏi: Rồi sao nữa? · Lúc ấy bạn ấy cảm thấy thế nào? · Cuối cùng thì sao?)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-1-3-cong-cua-vuong-quoc-stage2-confirm",
        "question": "Chuyện nào sau đây là một CÂU CHUYỆN?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Chíp ngủ dậy, đánh răng, ăn sáng, đi học, về nhà",
            "imageUrl": "/assets/aiki-islands/island4_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Chíp ra sân chơi bóng, bóng mắc bên kia hàng rào, Chíp khều lại bằng cành cây",
            "imageUrl": "/assets/aiki-islands/island4_lesson1_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Chíp có quả bóng đỏ, áo xanh, giày trắng",
            "imageUrl": "/assets/aiki-islands/island4_lesson1_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Câu chuyện đó đã đi qua đủ ba cổng.",
        "speech": "Chưa đúng. Chuỗi việc suôn sẻ hay bản mô tả đều chưa phải câu chuyện."
      },
      "stage3_video": {
        "id": "bai-4-1-3-cong-cua-vuong-quoc-stage3-video",
        "title": "Video bài giảng: Bài 4.1 — 3 Cổng của Vương Quốc",
        "videoUrl": "https://www.youtube.com/embed/OGS7gaPTcc4",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island4_lesson1_3gates.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Bona: Hôm qua tớ kể chuyện về Chíp cho AIKI nghe: 'Chíp thức dậy. Chíp ăn sáng. Chíp ra sân chơi. Chíp ăn trưa. Chíp về nhà ngủ. Hết!'\nAKI: Ơ... nghe xong tớ thấy thiếu thiếu Bona ơi! Mọi việc đều đúng, nhưng phẳng lì như tờ giấy vì chẳng có biến cố gì xảy ra cả!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Mọi câu chuyện vĩ đại đều đi qua 3 Cổng: Cổng 1 Khởi đầu bình thường · Cổng 2 Thắt nút sự cố · Cổng 3 Mở nút giải quyết!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Lấy Thẻ nhân vật ra, nhìn lại Hồ sơ rồi kể một câu chuyện bằng miệng. Nhớ đủ ba cổng: Bình thường – Có chuyện – Giải quyết. Ghi âm lại, nghe một lần và tự sửa nếu thấy thiếu cổng nào nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-4-1-3-cong-cua-vuong-quoc-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 4.1 — 3 Cổng của Vương Quốc",
        "questions": [
          {
            "id": "bai-4-1-q1",
            "prompt": "Ba cổng của một câu chuyện là gì?",
            "options": [
              "A. Bình thường — Có chuyện — Giải quyết",
              "B. Mở — Thân — Kết bài",
              "C. Ai — Ở đâu — Khi nào"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Chỉ cần nhớ ba chữ: Bình thường – Có chuyện – Giải quyết.",
            "visualUrl": ""
          },
          {
            "id": "bai-4-1-q2",
            "prompt": "Cổng hai hỏi điều gì?",
            "options": [
              "A. Điều gì bất ngờ xảy ra?",
              "B. Nhân vật tên là gì?",
              "C. Chuyện xảy ra ở đâu?"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Không có cổng hai thì chỉ là kể việc, chưa thành chuyện.",
            "visualUrl": ""
          },
          {
            "id": "bai-4-1-q3",
            "prompt": "Khi con bí, AKI được làm gì?",
            "options": [
              "A. Chỉ gợi ý bằng ba câu hỏi, không nghĩ chuyện thay con",
              "B. Viết luôn câu chuyện cho con",
              "C. Chọn giúp con một chuyện có sẵn"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Vì câu chuyện hay nhất phải bắt đầu từ ý tưởng của chính con.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-4-1-3-cong-cua-vuong-quoc-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 4.1 — 3 Cổng của Vương Quốc",
        "subjectName": "Cốt Truyện 3 Cổng Của Vương Quốc",
        "badge": "Bài 4.1",
        "illustrationType": "three-gates",
        "lockedFeatures": [
          "bộ 3 khung truyện nối tiếp",
          "Cổng 1 Khởi đầu bình thường",
          "Cổng 2 Thắt nút sự cố",
          "Cổng 3 Mở nút giải quyết"
        ],
        "akiMotto": "Mọi câu chuyện vĩ đại đều đi qua 3 cổng: Khởi đầu mở màn · Thắt nút cao trào · Mở nút thắng lợi!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Cốt Truyện\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Cốt Truyện",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Cốt Truyện bộ 3 khung truyện nối tiếp",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Truyện tranh 3 khung về Sóc Bông tìm hạt dẻ vàng: ôm bóng ra sân, bóng kẹt hàng rào và dùng cành cây khều bóng vui vẻ",
            "instruction": "Hoàn thiện câu lệnh đầy đủ chi tiết"
          },
          {
            "step": 4,
            "title": "Soi kỹ tranh & Cất Balo",
            "akiSpeech": "Tuyệt đẹp! Bé hãy soi kỹ xem đã đạt chuẩn chưa và bấm Nộp Bài để cất vào Balo nhé!",
            "quickPrompt": "",
            "instruction": "Kiểm tra tranh và bấm nộp bài"
          }
        ],
        "sampleUrl": "/assets/aiki-islands/island4_lesson1_3gates.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Câu chuyện ba cổng của nhân vật tớ",
          "akiAdvice": "Bình thường – Có chuyện – Giải quyết. Ba cổng này sẽ giúp những việc bình thường biến thành một câu chuyện có đầu, có giữa và có kết thúc!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: Ba cổng của câu chuyện",
          "sampleTemplate": "Bình thường: mọi hôm bạn ấy sống yên bình trong hốc cây sồi, mỗi sáng đi nhặt hạt dẻ...\nCó chuyện: một hôm toàn bộ kho hạt dẻ biến mất, chỉ để lại một vệt chân kỳ lạ phát sáng...\nGiải quyết: thế là bạn ấy dũng cảm lần theo dấu chân, kết bạn với Nhím và cùng tìm lại hạt dẻ!",
          "backpackCategory": "story-arc",
          "backpackTag": "3 Cổng Cốt Truyện",
          "characterName": "Nhân vật truyện",
          "challengeSummary": [
            "Lấy thẻ nhân vật ra, nhìn lại Hồ sơ rồi kể một câu chuyện về bạn ấy",
            "Nhớ đủ ba cổng: BÌNH THƯỜNG – CÓ CHUYỆN – GIẢI QUYẾT",
            "Kể xong đọc lại một lượt, kiểm tra xem có bỏ quên cổng nào không. Thiếu thì kể lại lần nữa"
          ],
          "checklist": [
            {
              "id": "cl-4-1-1",
              "label": "Đủ cả 3 cổng: Bình thường – Có chuyện – Giải quyết"
            },
            {
              "id": "cl-4-1-2",
              "label": "Đọc to câu chuyện và tự kiểm tra xem có quên cổng nào không"
            }
          ],
          "fields": [
            {
              "id": "gate-1",
              "label": "Cổng 1: Bình thường",
              "prefix": "Bình thường: mọi hôm bạn ấy ",
              "placeholder": "mọi hôm bạn ấy sống yên bình, mỗi sáng đi nhặt hạt dẻ...",
              "rows": 2
            },
            {
              "id": "gate-2",
              "label": "Cổng 2: Có chuyện!",
              "prefix": "Có chuyện: một hôm ",
              "placeholder": "toàn bộ kho hạt dẻ biến mất, xuất hiện biến cố làm đảo lộn...",
              "badge": "Biến cố",
              "helperTip": "💡 Tạo ra biến cố bất ngờ kích thích hành động của nhân vật",
              "rows": 3
            },
            {
              "id": "gate-3",
              "label": "Cổng 3: Giải quyết",
              "prefix": "Giải quyết: thế là bạn ấy ",
              "placeholder": "dũng cảm lần theo dấu chân và tìm lại được kho hạt dẻ...",
              "badge": "Mở nút",
              "helperTip": "💡 Tìm lối thoát bất ngờ nhưng hợp lý, giải quyết trọn vẹn câu chuyện",
              "rows": 3
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-4-1-3-cong-cua-vuong-quoc-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 4.1 — 3 Cổng của Vương Quốc\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 4.1 — 3 Cổng của Vương Quốc",
          "iconUrl": "/assets/aiki-islands/island4_lesson1_3gates.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-4-2-04-chang-thu-thach"
      }
    }
  },
  {
    "id": "bai-4-2",
    "slug": "bai-4-2-04-chang-thu-thach",
    "islandNumber": 4,
    "lessonNumber": "4.2",
    "title": "Bài 4.2 — 4 Chặng thử thách",
    "subtitle": "Khung xương 4 Chặng: Muốn -> Cản -> Làm -> Kết!",
    "imageUrl": "/assets/aiki-islands/island4_lesson2_4beats.jpg",
    "objective": "Trẻ viết được khung xương truyện bốn dòng.",
    "skillLearned": "Bốn dòng: muốn gì, gì cản, làm cách nào, kết ra sao.",
    "nextLessonSlug": "bai-4-3-ban-do-8-o-p1-mo",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-2-04-chang-thu-thach-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.2 — 4 Chặng thử thách",
        "goalText": "Trẻ viết được khung xương truyện bốn dòng.",
        "imageUrl": "/assets/aiki-islands/island4_lesson2_4beats.jpg",
        "speech": "Lala: Hôm qua tớ viết chuyện cho Bơ thế này: 'Bơ muốn tìm chiếc huy hiệu bị mất. Bơ đi tìm. Bơ tìm thấy ngay. Hết!'\nAKI: Ơ... nhanh quá Lala ơi! Tớ còn chưa kịp lo cho Bơ thì câu chuyện đã xong rồi! Tìm thấy ngay thì đâu còn là cuộc phiêu lưu nữa!",
        "keyPoints": [
          "[1] MUỐN — nhân vật đang muốn làm gì hoặc tìm thứ gì?: (Chặng một)",
          "[2] CẢN ⭐ — \"Bơ rất sợ tiếng sấm, mà huy hiệu lại ở ngoài sân lúc trời có sấm\": (Chặng hai — nhìn vào ô SỢ hoặc DỞ trong Hồ sơ)",
          "[3] LÀM — nhân vật thử làm gì để vượt qua?: (Chặng ba)",
          "[4] KẾT — cuối cùng chuyện thế nào?: (Chặng bốn)",
          "[5] CÂU ĐỂ NHỚ — MUỐN — CẢN — LÀM — KẾT: (Bộ xương cho storyboard ở bài sau)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-2-04-chang-thu-thach-stage2-confirm",
        "question": "Chặng CẢN nên lấy ý từ đâu?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Từ thời tiết hay chuyện tình cờ",
            "imageUrl": "/assets/aiki-islands/island4_lesson2_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Từ ô SỢ hoặc ô DỞ trong Hồ sơ nhân vật",
            "imageUrl": "/assets/aiki-islands/island4_lesson2_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Từ gợi ý của AKI",
            "imageUrl": "/assets/aiki-islands/island4_lesson2_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Lúc ấy câu chuyện mới thật sự là chuyện của nhân vật đó.",
        "speech": "Chưa đúng. Hồ sơ nhân vật mới là nơi có sẵn cái cản hay nhất."
      },
      "stage3_video": {
        "id": "bai-4-2-04-chang-thu-thach-stage3-video",
        "title": "Video bài giảng: Bài 4.2 — 4 Chặng thử thách",
        "videoUrl": "https://www.youtube.com/embed/35kC8Lw31C0",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island4_lesson2_4beats.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Lala: Hôm qua tớ viết chuyện cho Bơ thế này: 'Bơ muốn tìm chiếc huy hiệu bị mất. Bơ đi tìm. Bơ tìm thấy ngay. Hết!'\nAKI: Ơ... nhanh quá Lala ơi! Tớ còn chưa kịp lo cho Bơ thì câu chuyện đã xong rồi! Tìm thấy ngay thì đâu còn là cuộc phiêu lưu nữa!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Khung xương 4 Chặng: MUỐN – CẢN – LÀM – KẾT! Thử thách càng lớn thì chiến thắng càng ngọt ngào! Nếu chưa nghĩ ra CẢN, hãy nhìn vào ô Sợ hoặc Dở trong Hồ sơ nhé!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Mở Hồ sơ nhân vật và viết 4 dòng: Bạn ấy muốn gì? Điều gì cản lại? Bạn ấy làm cách nào? Cuối cùng ra sao? Đọc to lên xem đã thấy hồi hộp chưa nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-4-2-04-chang-thu-thach-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 4.2 — 4 Chặng thử thách",
        "questions": [
          {
            "id": "bai-4-2-q1",
            "prompt": "Bốn chặng theo đúng thứ tự là gì?",
            "options": [
              "A. MUỐN — CẢN — LÀM — KẾT",
              "B. KẾT — MUỐN — CẢN — LÀM",
              "C. AI — Ở ĐÂU — LÀM GÌ — BAO GIỜ"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Bốn chặng này chính là bộ xương cho storyboard ở bài 4.3.",
            "visualUrl": ""
          },
          {
            "id": "bai-4-2-q2",
            "prompt": "Vì sao chặng CẢN lại quan trọng nhất?",
            "options": [
              "A. Vì không có cản thì mọi việc quá dễ, câu chuyện hết hấp dẫn",
              "B. Vì nó dài nhất",
              "C. Vì nó đứng đầu tiên"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Huy hiệu nằm dưới gầm bàn thì dễ quá — ngoài sân lúc có sấm mới thành chuyện của Bơ.",
            "visualUrl": ""
          },
          {
            "id": "bai-4-2-q3",
            "prompt": "Viết xong bốn dòng, việc bắt buộc tiếp theo là gì?",
            "options": [
              "A. Đọc to cả bốn dòng một lần, chỗ nào nghe quá dễ thì làm khó hơn",
              "B. Gửi ngay cho AKI vẽ",
              "C. In ra đóng khung"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Tai bắt lỗi giỏi hơn mắt.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-4-2-04-chang-thu-thach-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 4.2 — 4 Chặng thử thách",
        "subjectName": "Hành Trình 4 Chặng Thử Thách",
        "badge": "Bài 4.2",
        "illustrationType": "four-challenges",
        "lockedFeatures": [
          "4 chặng truyện: Muốn - Cản - Làm - Kết",
          "Sóc Bông muốn tìm Hạt Dẻ Vàng",
          "vượt suối đá cuộn xiết và sấm sét"
        ],
        "akiMotto": "Khung xương 4 Chặng: Muốn -> Cản -> Làm -> Kết. Thử thách càng lớn thì chiến thắng càng ngọt ngào!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Hành Trình\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Hành Trình",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Hành Trình 4 chặng truyện: Muốn - Cản - Làm - Kết",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Hành trình 4 chặng thử thách của Sóc Bông: muốn tìm hạt dẻ vàng, suối đá cuộn xiết, bắc cầu gỗ vượt suối, tìm thấy hạt dẻ vinh quang",
            "instruction": "Hoàn thiện câu lệnh đầy đủ chi tiết"
          },
          {
            "step": 4,
            "title": "Soi kỹ tranh & Cất Balo",
            "akiSpeech": "Tuyệt đẹp! Bé hãy soi kỹ xem đã đạt chuẩn chưa và bấm Nộp Bài để cất vào Balo nhé!",
            "quickPrompt": "",
            "instruction": "Kiểm tra tranh và bấm nộp bài"
          }
        ],
        "sampleUrl": "/assets/aiki-islands/island4_lesson2_4beats.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Bốn chặng của câu chuyện tớ",
          "akiAdvice": "MUỐN - CẢN - LÀM - KẾT. Bốn chặng này chính là bộ xương để buổi sau chúng mình bắt đầu chia câu chuyện thành từng khung truyện!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: Bốn chặng Muốn - Cản - Làm - Kết",
          "sampleTemplate": "Muốn: bạn ấy muốn hái bông hoa Băng Tuyết trên đỉnh núi cao để chữa bệnh cho mẹ\nCản: nhưng dòng suối băng lạnh buốt và bạn ấy cực kỳ sợ bóng tối\nLàm: bạn ấy thử chế tạo ván trượt từ vỏ cây thông và dùng ngọn đuốc sưởi ấm để vượt qua\nKết: cuối cùng bạn ấy đã hái được hoa tuyết kịp thời, mẹ khỏi bệnh và cả khu rừng ăn mừng",
          "backpackCategory": "story-challenges",
          "backpackTag": "4 Chặng Thử Thách",
          "characterName": "Hiệp sĩ nhí",
          "challengeSummary": [
            "Mở Hồ sơ nhân vật và viết bốn dòng: MUỐN – CẢN – LÀM – KẾT",
            "Chưa nghĩ được CẢN thì nhìn vào ô SỢ hoặc ô DỞ xem có dùng được không",
            "Viết xong đọc to cả bốn dòng một lần. Chỗ nào nghe quá dễ hoặc quá nhanh thì làm cho thử thách khó hơn một chút"
          ],
          "checklist": [
            {
              "id": "cl-4-2-1",
              "label": "Đủ 4 chặng: Muốn – Cản – Làm – Kết"
            },
            {
              "id": "cl-4-2-2",
              "label": "Ô Cản có thử thách lấy từ ô Sợ hoặc ô Dở của bài 3.1"
            },
            {
              "id": "cl-4-2-3",
              "label": "Đọc to cả 4 dòng, không quá dễ hoặc quá nhanh"
            }
          ],
          "fields": [
            {
              "id": "stage-want",
              "label": "1. Muốn (Mong muốn của nhân vật)",
              "prefix": "Muốn: bạn ấy muốn ",
              "placeholder": "đạt được điều gì hoặc đi tới đâu...",
              "rows": 2
            },
            {
              "id": "stage-obstacle",
              "label": "2. Cản (Trở ngại cản bước)",
              "prefix": "Cản: nhưng ",
              "placeholder": "gặp phải khó khăn, trở ngại hoặc nỗi sợ gì...",
              "badge": "Thử thách",
              "helperTip": "💡 Chưa nghĩ được CẢN thì nhìn vào ô SỢ hoặc ô DỞ của bài 3.1 xem có dùng được không!",
              "rows": 2
            },
            {
              "id": "stage-action",
              "label": "3. Làm (Hành động vượt qua)",
              "prefix": "Làm: bạn ấy thử ",
              "placeholder": "thử dùng cách gì, mưu trí hay lòng dũng cảm...",
              "rows": 2
            },
            {
              "id": "stage-resolution",
              "label": "4. Kết (Kết cục câu chuyện)",
              "prefix": "Kết: cuối cùng ",
              "placeholder": "kết quả ra sao và nhân vật học được điều gì...",
              "rows": 2
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-4-2-04-chang-thu-thach-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 4.2 — 4 Chặng thử thách\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 4.2 — 4 Chặng thử thách",
          "iconUrl": "/assets/aiki-islands/island4_lesson2_4beats.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-4-3-ban-do-8-o-p1-mo"
      }
    }
  },
  {
    "id": "bai-4-3",
    "slug": "bai-4-3-ban-do-8-o-p1-mo",
    "islandNumber": 4,
    "lessonNumber": "4.3",
    "title": "Bài 4.3 — Bản đồ 8 Ô - Phần 1: Mở",
    "subtitle": "Storyboard hình que: Bản vẽ xương sống của đạo diễn truyện tranh!",
    "imageUrl": "/assets/aiki-islands/island4_lesson3_storyboard1.jpg",
    "objective": "Trẻ chia được chuyện thành tám khung, mỗi khung một việc.",
    "skillLearned": "Storyboard vẽ tay bằng hình que.",
    "nextLessonSlug": "bai-4-4-ban-do-8-o-p2-khoa",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.3 — Bản đồ 8 Ô - Phần 1: Mở",
        "goalText": "Trẻ chia được chuyện thành tám khung, mỗi khung một việc.",
        "imageUrl": "/assets/aiki-islands/island4_lesson3_storyboard1.jpg",
        "speech": "Nina: Hôm qua tớ sốt ruột quá nên tạo luôn tám bức cho chuyện của Mít. Bức nào cũng đẹp lung linh!\nAKI: Nhưng khi xếp tám bức cạnh nhau thì... ơ? Có hai bức Mít đang chạy giống hệt nhau, rồi tự nhiên từ đang tìm đồ nhảy vọt sang ăn mừng chiến thắng! Mất hẳn đoạn vượt khó rồi Nina ơi!",
        "keyPoints": [
          "[1] STORYBOARD LÀ GÌ — bản nháp để nhìn được cả câu chuyện trước khi làm tranh thật: (Không cần đẹp, chỉ cần nhìn vào là hiểu)",
          "[2] VẼ THẾ NÀO — chia tờ giấy thành tám ô, vẽ nhanh bằng hình que: (Đầu tròn, người một nét, tay chân vài nét)",
          "[3] TỪ BỐN CHẶNG RA TÁM Ô — MUỐN – CẢN – LÀM – KẾT kéo ra thành tám ô: (Câu chuyện phải tiến lên từng bước)",
          "[4] LUẬT — MỘT Ô – MỘT VIỆC: (Đừng nhét nhiều việc vào một ô, cũng đừng vẽ hai ô giống hệt nhau)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage2-confirm",
        "question": "Mỗi ô trong storyboard chứa bao nhiêu việc?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Càng nhiều càng đỡ tốn ô",
            "imageUrl": "/assets/aiki-islands/island4_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Một việc",
            "imageUrl": "/assets/aiki-islands/island4_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Hai việc cho nhanh",
            "imageUrl": "/assets/aiki-islands/island4_lesson3_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Một ô – một việc.",
        "speech": "Chưa đúng. Nhét nhiều việc vào một ô là hình sẽ rối."
      },
      "stage3_video": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage3-video",
        "title": "Video bài giảng: Bài 4.3 — Bản đồ 8 Ô - Phần 1: Mở",
        "videoUrl": "https://www.youtube.com/embed/reY6-ZLR3eM",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island4_lesson3_storyboard1.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Nina: Hôm qua tớ sốt ruột quá nên tạo luôn tám bức cho chuyện của Mít. Bức nào cũng đẹp lung linh!\nAKI: Nhưng khi xếp tám bức cạnh nhau thì... ơ? Có hai bức Mít đang chạy giống hệt nhau, rồi tự nhiên từ đang tìm đồ nhảy vọt sang ăn mừng chiến thắng! Mất hẳn đoạn vượt khó rồi Nina ơi!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Bản đồ 8 ô (Storyboard) là bản nháp xương sống để mình nhìn được cả cuốn truyện trước khi làm thật! Vẽ hình que thật nhanh: đầu tròn, người một nét là đủ!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Lấy một tờ giấy, chia thành 8 ô. Vẽ hình que thật nhanh cho 4 ô đầu và viết một câu ngắn dưới mỗi ô xem chuyện gì đang xảy ra. Xong xuôi nhớ chụp ảnh nộp cho AIKI nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 4.3 — Bản đồ 8 Ô - Phần 1: Mở",
        "questions": [
          {
            "id": "bai-4-3-q1",
            "prompt": "Storyboard dùng để làm gì?",
            "options": [
              "A. Là bản nháp để nhìn được cả câu chuyện trước khi làm tranh thật",
              "B. Là bức tranh cuối cùng để in ra",
              "C. Là bìa của cuốn truyện"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Nó không cần đẹp, chỉ cần nhìn vào là hiểu chuyện gì đang xảy ra.",
            "visualUrl": ""
          },
          {
            "id": "bai-4-3-q2",
            "prompt": "Vẽ storyboard nên vẽ như thế nào?",
            "options": [
              "A. Vẽ nhanh bằng hình que — đầu tròn, người một nét",
              "B. Vẽ thật đẹp và tô màu đầy đủ",
              "C. Nhờ AKI vẽ hộ"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Gạch đi, vẽ lại thoải mái — đây chính là lúc để sửa.",
            "visualUrl": ""
          },
          {
            "id": "bai-4-3-q3",
            "prompt": "Soi lại tám ô, con kiểm tra những gì?",
            "options": [
              "A. Có ô nào bị trùng không, có đoạn nào nhảy quá nhanh không, nhìn tám ô có hiểu chuyện không",
              "B. Vẽ có đẹp không, có đủ màu không",
              "C. Chữ có sạch không, giấy có thẳng không"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Chưa ổn thì sửa ngay trên giấy.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 4.3 — Bản đồ 8 Ô - Phần 1: Mở",
        "subjectName": "Bản Đồ Storyboard 8 Ô - Phần 1: Mở",
        "badge": "Bài 4.3",
        "illustrationType": "storyboard-panels",
        "lockedFeatures": [
          "4 ô đầu phân cảnh storyboard hình que",
          "ô 1 khởi hành từ làng yên bình",
          "ô 2 cơn gió lạ cuốn bay bản đồ",
          "ô 3 dừng chân trước đầm lầy bí hiểm"
        ],
        "akiMotto": "Storyboard hình que 8 ô là bí kíp của các đạo diễn lừng danh để giữ nhịp điệu hồi hộp cho câu chuyện!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Bản Đồ\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Bản Đồ",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Bản Đồ 4 ô đầu phân cảnh storyboard hình que",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Phân cảnh 4 ô đầu của storyboard 8 ô: Sóc Bông xuất phát từ nhà cây, nhận nhiệm vụ, gió cuốn bản đồ và tiến vào rừng sâu",
            "instruction": "Hoàn thiện câu lệnh đầy đủ chi tiết"
          },
          {
            "step": 4,
            "title": "Soi kỹ tranh & Cất Balo",
            "akiSpeech": "Tuyệt đẹp! Bé hãy soi kỹ xem đã đạt chuẩn chưa và bấm Nộp Bài để cất vào Balo nhé!",
            "quickPrompt": "",
            "instruction": "Kiểm tra tranh và bấm nộp bài"
          }
        ],
        "sampleUrl": "/assets/aiki-islands/island4_lesson3_storyboard1.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Bản đồ 8 ô của tớ",
          "akiAdvice": "Một ô – một việc. Storyboard càng rõ thì lúc tạo tranh thật càng dễ. Gạch đi, vẽ lại thoải mái nhé — đây chính là lúc để sửa!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: Bản đồ 8 ô Storyboard",
          "sampleTemplate": "Ô 1: Sóc Bông thức dậy vươn vai trong hốc cây sồi.\nÔ 2: Phát hiện toàn bộ kho hạt dẻ đã biến mất không dấu vết.\nÔ 3: Lần theo dấu chân nhỏ dẫn ra bìa rừng u tối.\nÔ 4: Gặp bạn Nhím đang sửa chiếc xe gỗ bị gãy bánh.\nÔ 5: Cả hai cùng rơi vào hang đá đen ngòm đầy tiếng gió rít.\nÔ 6: Nhớ ra ánh sáng từ quả bông len thần kỳ trên mũ và thắp sáng.\nÔ 7: Tìm thấy kho hạt dẻ và giúp chuột chũi chia sẻ thức ăn.\nÔ 8: Sóc Bông cùng các bạn ngắm hoàng hôn ấm áp trên đỉnh đồi.",
          "backpackCategory": "storyboard",
          "backpackTag": "Bản đồ 8 ô",
          "characterName": "Biệt đội phiêu lưu",
          "challengeSummary": [
            "Lấy câu chuyện MUỐN – CẢN – LÀM – KẾT của buổi trước và chia thành tám ô",
            "Trên giấy: chia tờ giấy làm tám ô, vẽ nhanh bằng hình que. Không cần đẹp",
            "Dưới mỗi ô viết một câu ngắn xem chuyện gì đang xảy ra",
            "Soi lại: có ô nào bị trùng không? có đoạn nào nhảy quá nhanh không? nhìn tám ô có hiểu được chuyện không?",
            "Luật: MỘT Ô – MỘT VIỆC"
          ],
          "checklist": [
            {
              "id": "cl-4-3-1",
              "label": "Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước"
            },
            {
              "id": "cl-4-3-2",
              "label": "Dưới mỗi ô viết một câu ngắn (Một ô — Một việc)"
            },
            {
              "id": "cl-4-3-3",
              "label": "Soi lại: không có ô nào trùng việc, nhìn 8 ô hiểu được chuyện"
            }
          ],
          "fields": [
            {
              "id": "panel-1",
              "label": "Ô 1",
              "prefix": "Ô 1: ",
              "placeholder": "Chuyện gì xảy ra ở ô 1...",
              "helperTip": "💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây",
              "rows": 2
            },
            {
              "id": "panel-2",
              "label": "Ô 2",
              "prefix": "Ô 2: ",
              "placeholder": "Chuyện gì xảy ra ở ô 2...",
              "helperTip": "💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây",
              "rows": 2
            },
            {
              "id": "panel-3",
              "label": "Ô 3",
              "prefix": "Ô 3: ",
              "placeholder": "Chuyện gì xảy ra ở ô 3...",
              "helperTip": "💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây",
              "rows": 2
            },
            {
              "id": "panel-4",
              "label": "Ô 4",
              "prefix": "Ô 4: ",
              "placeholder": "Chuyện gì xảy ra ở ô 4...",
              "helperTip": "💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây",
              "rows": 2
            },
            {
              "id": "panel-5",
              "label": "Ô 5",
              "prefix": "Ô 5: ",
              "placeholder": "Chuyện gì xảy ra ở ô 5...",
              "helperTip": "💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây",
              "rows": 2
            },
            {
              "id": "panel-6",
              "label": "Ô 6",
              "prefix": "Ô 6: ",
              "placeholder": "Chuyện gì xảy ra ở ô 6...",
              "helperTip": "💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây",
              "rows": 2
            },
            {
              "id": "panel-7",
              "label": "Ô 7",
              "prefix": "Ô 7: ",
              "placeholder": "Chuyện gì xảy ra ở ô 7...",
              "helperTip": "💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây",
              "rows": 2
            },
            {
              "id": "panel-8",
              "label": "Ô 8",
              "prefix": "Ô 8: ",
              "placeholder": "Chuyện gì xảy ra ở ô 8...",
              "helperTip": "💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây",
              "rows": 2
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 4.3 — Bản đồ 8 Ô - Phần 1: Mở\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 4.3 — Bản đồ 8 Ô - Phần 1: Mở",
          "iconUrl": "/assets/aiki-islands/island4_lesson3_storyboard1.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-4-4-ban-do-8-o-p2-khoa"
      }
    }
  },
  {
    "id": "bai-4-4",
    "slug": "bai-4-4-ban-do-8-o-p2-khoa",
    "islandNumber": 4,
    "lessonNumber": "4.4",
    "title": "Bài 4.4 — Bản đồ 8 Ô - Phần 2: Khoá",
    "subtitle": "Khóa 3 yếu tố: Đúng nhân vật · Đúng việc · Đúng phong cách!",
    "imageUrl": "/assets/aiki-islands/island4_lesson4_storyboard2.jpg",
    "objective": "Trẻ tả được từng khung mà nhân vật vẫn giữ nguyên qua cả tám hình.",
    "skillLearned": "Câu lệnh theo storyboard, khoá ba đặc điểm nhân vật vào mọi khung.",
    "nextLessonSlug": "bai-4-5-vuong-mien-hoan-hao",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.4 — Bản đồ 8 Ô - Phần 2: Khoá",
        "goalText": "Trẻ tả được từng khung mà nhân vật vẫn giữ nguyên qua cả tám hình.",
        "imageUrl": "/assets/aiki-islands/island4_lesson4_storyboard2.jpg",
        "speech": "Nina: Tớ có Storyboard rồi nên bắt đầu tạo hình. Khung một, ổn. Khung hai, ổn. Đến khung năm thì... ơ? Mít tự nhiên đổi áo! Khung sáu đổi kiểu tóc! Khung bảy còn chuyển sang kiểu vẽ khác hẳn!\nAKI: Vì Nina mải nhìn vào từng bức mà quên đối chiếu với Storyboard và Luật vẽ nhân vật đấy!",
        "keyPoints": [
          "[1] ĐÚNG NGƯỜI — dùng ảnh mẫu và giữ các đặc điểm trong Luật vẽ: (Thứ nhất)",
          "[2] ĐÚNG VIỆC — nhìn vào storyboard xem ô đó đang xảy ra chuyện gì: (Thứ hai)",
          "[3] ĐÚNG KIỂU — khung đầu là truyện tranh nét rõ màu phẳng thì cả tám khung giữ như vậy: (Thứ ba)",
          "[4] MẸO NHỎ — xong khung nào đặt ngay cạnh khung trước để soi: (Đừng chờ đủ tám khung mới kiểm tra)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage2-confirm",
        "question": "Mỗi khung truyện cần giữ đúng ba thứ nào?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Đúng người — Đúng việc — Đúng kiểu",
            "imageUrl": "/assets/aiki-islands/island4_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Đúng màu — Đúng nét — Đúng bóng",
            "imageUrl": "/assets/aiki-islands/island4_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Đúng tên — Đúng tuổi — Đúng nghề",
            "imageUrl": "/assets/aiki-islands/island4_lesson4_opt_c.jpg"
          }
        ],
        "correctIndex": 0,
        "explanation": "Chuẩn! Ba thứ này giữ cho cả tám khung là một bộ.",
        "speech": "Chưa đúng. Ba thứ là: đúng người, đúng việc, đúng kiểu."
      },
      "stage3_video": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage3-video",
        "title": "Video bài giảng: Bài 4.4 — Bản đồ 8 Ô - Phần 2: Khoá",
        "videoUrl": "https://www.youtube.com/embed/UzvinFjseRE",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island4_lesson4_storyboard2.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Nina: Tớ có Storyboard rồi nên bắt đầu tạo hình. Khung một, ổn. Khung hai, ổn. Đến khung năm thì... ơ? Mít tự nhiên đổi áo! Khung sáu đổi kiểu tóc! Khung bảy còn chuyển sang kiểu vẽ khác hẳn!\nAKI: Vì Nina mải nhìn vào từng bức mà quên đối chiếu với Storyboard và Luật vẽ nhân vật đấy!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Mỗi khung cần giữ ba thứ: Một: ĐÚNG NHÂN VẬT — dùng ảnh mẫu và giữ các đặc điểm trong Luật vẽ. Hai: ĐÚNG VIỆC — nhìn vào storyboard. Ba: ĐÚNG PHONG CÁCH — giữ nguyên từ khóa phong cách!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Làm lần lượt từ ô một đến ô tám. Trước mỗi khung hãy nhìn Storyboard chứ đừng nghĩ lại từ đầu. Sau mỗi khung, kiểm tra ngay: Nhân vật có đổi không? Việc có đúng không? Cùng hoàn thiện 8 khung truyện nào!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 4.4 — Bản đồ 8 Ô - Phần 2: Khoá",
        "questions": [
          {
            "id": "bai-4-4-q1",
            "prompt": "Trước mỗi khung con nên nhìn vào đâu?",
            "options": [
              "A. Nhìn storyboard, đừng nghĩ lại câu chuyện từ đầu",
              "B. Nhìn khung cuối cùng",
              "C. Nhắm mắt tưởng tượng lại"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Storyboard chỉ đường cho câu chuyện.",
            "visualUrl": ""
          },
          {
            "id": "bai-4-4-q2",
            "prompt": "Mẹo để phát hiện lỗi sớm là gì?",
            "options": [
              "A. Xong khung nào đặt ngay cạnh khung trước để soi",
              "B. Làm đủ tám khung rồi mới kiểm tra một lượt",
              "C. Nhờ bố mẹ kiểm tra hộ"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Phát hiện sớm một chiếc áo đổi màu thì sửa nhanh hơn nhiều.",
            "visualUrl": ""
          },
          {
            "id": "bai-4-4-q3",
            "prompt": "Phát hiện nhân vật bị đổi ở một khung, con làm gì?",
            "options": [
              "A. Sửa câu lệnh rồi mới tạo lại",
              "B. Bấm tạo lại ngay",
              "C. Bỏ khung đó đi"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Ảnh mẫu và Luật vẽ giúp nhân vật đi hết câu chuyện mà vẫn là chính mình.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 4.4 — Bản đồ 8 Ô - Phần 2: Khoá",
        "subjectName": "Bản Đồ Storyboard 8 Ô - Phần 2: Khóa",
        "badge": "Bài 4.4",
        "illustrationType": "storyboard-panels",
        "lockedFeatures": [
          "4 ô sau của storyboard cao trào và kết thúc",
          "khóa 3 yếu tố: đúng nhân vật, đúng hành động ô, đúng phong cách",
          "tìm thấy Hạt Dẻ Vàng vinh quang"
        ],
        "akiMotto": "Khóa chặt 3 thứ: Đúng nhân vật, Đúng hành động theo storyboard, Đúng phong cách thì 8 khung tranh sẽ như một bộ phim hoạt hình!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Bản Đồ\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Bản Đồ",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Bản Đồ 4 ô sau của storyboard cao trào và kết thúc",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Phân cảnh 4 ô cuối của storyboard 8 ô: Sóc Bông đối mặt thử thách đỉnh điểm, tìm thấy hạt dẻ vàng vinh quang và trở về trong tiếng hoan hô",
            "instruction": "Hoàn thiện câu lệnh đầy đủ chi tiết"
          },
          {
            "step": 4,
            "title": "Soi kỹ tranh & Cất Balo",
            "akiSpeech": "Tuyệt đẹp! Bé hãy soi kỹ xem đã đạt chuẩn chưa và bấm Nộp Bài để cất vào Balo nhé!",
            "quickPrompt": "",
            "instruction": "Kiểm tra tranh và bấm nộp bài"
          }
        ],
        "sampleUrl": "/assets/aiki-islands/island4_lesson4_storyboard2.jpg",
        "creativeEngineMode": "identity-lock",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Khung 1",
            "icon": "🎬",
            "emoji": "🎬",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 2,
            "title": "Khung 2",
            "icon": "🎬",
            "emoji": "🎬",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 3,
            "title": "Khung 3",
            "icon": "🎬",
            "emoji": "🎬",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 4,
            "title": "Khung 4",
            "icon": "🎬",
            "emoji": "🎬",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 5,
            "title": "Khung 5",
            "icon": "🎬",
            "emoji": "🎬",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 6,
            "title": "Khung 6",
            "icon": "🎬",
            "emoji": "🎬",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 7,
            "title": "Khung 7",
            "icon": "🎬",
            "emoji": "🎬",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 8,
            "title": "Khung 8",
            "icon": "🎬",
            "emoji": "🎬",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 4.4 — Bản đồ 8 Ô - Phần 2: Khoá\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 4.4 — Bản đồ 8 Ô - Phần 2: Khoá",
          "iconUrl": "/assets/aiki-islands/island4_lesson4_storyboard2.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-4-5-vuong-mien-hoan-hao"
      }
    }
  },
  {
    "id": "bai-4-5",
    "slug": "bai-4-5-vuong-mien-hoan-hao",
    "islandNumber": 4,
    "lessonNumber": "4.5",
    "title": "Bài 4.5 — Vương miện hoàn hảo",
    "subtitle": "Tự viết lời thoại, đặt tên truyện và xuất bản cuốn Comic đầu tay!",
    "imageUrl": "/assets/aiki-islands/island4_lesson5_comicbook.jpg",
    "objective": "Trẻ viết được toàn bộ lời thoại và hoàn thành cuốn truyện.",
    "skillLearned": "Đặt chữ lên hình. Đặt tên truyện.",
    "nextLessonSlug": "bai-5-1-san-lung-bo-suu-tap",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-5-vuong-mien-hoan-hao-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.5 — Vương miện hoàn hảo",
        "goalText": "Trẻ viết được toàn bộ lời thoại và hoàn thành cuốn truyện.",
        "imageUrl": "/assets/aiki-islands/island4_lesson5_comicbook.jpg",
        "speech": "Mika: Hôm trước tớ xếp đủ tám khung rồi bảo: 'AIKI ơi, viết lời thoại hộ tớ nhé!' Thế là AIKI viết một loạt câu: lúc gặp quái vật nhân vật cũng 'Tuyệt quá!', lúc buồn cũng 'Tuyệt quá!'... Nghe giả tạo ghê luôn!\nAKI: Ha ha! Vì AI làm sao hiểu được cảm xúc thật của nhân vật bằng chính tác giả nhí là Mika chứ! Lời thoại là phần việc của các cậu mà!",
        "keyPoints": [
          "[1] HỎI TỪNG KHUNG — \"Lúc này nhân vật thật sự muốn nói gì?\": (Viết thật ngắn, giống cách mình nói ngoài đời)",
          "[2] TỐI ĐA HAI BONG BÓNG — ❌ bốn câu che gần hết tranh → ✅ \"Kia rồi!\" và \"Nhưng... làm sao lấy xuống đây?\": (Để chữ không che mất hình)",
          "[3] ĐỌC THÀNH TIẾNG — nghe dài hoặc không giống nhân vật thì rút lại: (Tranh đã kể được thì không cần chữ kể lại lần nữa)",
          "[4] TÊN TRUYỆN — ❌ \"Truyện của Lumi\" → ✅ \"Có gì đó mắc lại trên cành cây!\": (Tên hay nên gợi thêm một chút chuyện)",
          "[5] BÌA — tên truyện · nhân vật chính · tên tác giả là chính con"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-5-vuong-mien-hoan-hao-stage2-confirm",
        "question": "Mỗi khung nên có tối đa mấy bong bóng thoại?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Một",
            "imageUrl": "/assets/aiki-islands/island4_lesson5_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Hai",
            "imageUrl": "/assets/aiki-islands/island4_lesson5_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Bao nhiêu cũng được",
            "imageUrl": "/assets/aiki-islands/island4_lesson5_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Nhiều hơn là chữ che mất hình.",
        "speech": "Chưa đúng. Tối đa hai bong bóng một khung."
      },
      "stage3_video": {
        "id": "bai-4-5-vuong-mien-hoan-hao-stage3-video",
        "title": "Video bài giảng: Bài 4.5 — Vương miện hoàn hảo",
        "videoUrl": "https://www.youtube.com/embed/V4OodQ9gGC8",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island4_lesson5_comicbook.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Mika: Hôm trước tớ xếp đủ tám khung rồi bảo: 'AIKI ơi, viết lời thoại hộ tớ nhé!' Thế là AIKI viết một loạt câu: lúc gặp quái vật nhân vật cũng 'Tuyệt quá!', lúc buồn cũng 'Tuyệt quá!'... Nghe giả tạo ghê luôn!\nAKI: Ha ha! Vì AI làm sao hiểu được cảm xúc thật của nhân vật bằng chính tác giả nhí là Mika chứ! Lời thoại là phần việc của các cậu mà!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "QT2: Nội dung là do cậu viết, hãy đảm bảo viết xong mới gửi cho AIKI! Bìa sách chính là vương miện của tác phẩm! Tự viết lời thoại thật ngắn và đặt tên truyện thật kêu!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Hoàn thiện cuốn truyện nào các tác giả nhí! Viết lời thoại cho tám khung, đặt tên truyện, làm bìa có tên mình, xuất file rồi nhờ người lớn in, gấp và đóng gáy sách nhé! Tớ nóng lòng được đọc truyện của các cậu lắm rồi!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-4-5-vuong-mien-hoan-hao-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 4.5 — Vương miện hoàn hảo",
        "questions": [
          {
            "id": "bai-4-5-q1",
            "prompt": "Viết lời thoại thì nên viết thế nào?",
            "options": [
              "A. Thật ngắn, giống cách mình nói ngoài đời",
              "B. Thật dài cho đầy bong bóng",
              "C. Chép lại câu dưới ô storyboard"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Tranh đã kể được thì không cần chữ kể lại lần nữa.",
            "visualUrl": ""
          },
          {
            "id": "bai-4-5-q2",
            "prompt": "Tên truyện nào hấp dẫn hơn?",
            "options": [
              "A. Truyện của Lumi",
              "B. Có gì đó mắc lại trên cành cây!",
              "C. Truyện tranh số 1"
            ],
            "correctIndex": 1,
            "explanation": "Giải thích: Tên hay khiến người ta tò mò: thứ gì mắc ở đó? chuyện gì đã xảy ra?",
            "visualUrl": ""
          },
          {
            "id": "bai-4-5-q3",
            "prompt": "Câu quan trọng nhất của cả chương là gì?",
            "options": [
              "A. AKI giúp vẽ truyện, nhưng con mới là người nghĩ ra câu chuyện",
              "B. AKI nghĩ chuyện hay hơn con",
              "C. Truyện đẹp là truyện nhiều màu"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Nhân vật, chuyện gì xảy ra, nhân vật nói gì, tên truyện — đều là ý tưởng của con.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-4-5-vuong-mien-hoan-hao-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 4.5 — Vương miện hoàn hảo",
        "subjectName": "Vương Miện Hoàn Hảo - Bìa Comic Book",
        "badge": "Bài 4.5",
        "illustrationType": "comic-crown",
        "lockedFeatures": [
          "trang bìa comic rực rỡ có tiêu đề chữ nổi 3D",
          "bong bóng thoại tối đa 2 bóng mỗi khung",
          "khung tranh đóng gáy chuyên nghiệp"
        ],
        "akiMotto": "Bìa sách là vương miện của tác phẩm! Tự viết lời thoại ngắn gọn và đặt tên truyện thật kêu nhé!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Vương Miện\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Vương Miện",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Vương Miện trang bìa comic rực rỡ có tiêu đề chữ nổi 3D",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Bìa truyện tranh Comic Book: Sóc Bông đội vương miện lá sồi cầm hạt dẻ vàng phát sáng, tiêu đề chữ nổi 3D rực rỡ và tên tác giả nhí",
            "instruction": "Hoàn thiện câu lệnh đầy đủ chi tiết"
          },
          {
            "step": 4,
            "title": "Soi kỹ tranh & Cất Balo",
            "akiSpeech": "Tuyệt đẹp! Bé hãy soi kỹ xem đã đạt chuẩn chưa và bấm Nộp Bài để cất vào Balo nhé!",
            "quickPrompt": "",
            "instruction": "Kiểm tra tranh và bấm nộp bài"
          }
        ],
        "sampleUrl": "/assets/aiki-islands/island4_lesson5_comicbook.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Lời thoại và tên truyện của tớ",
          "akiAdvice": "Tớ có thể giúp các cậu vẽ truyện, nhưng các cậu mới là người nghĩ ra câu chuyện. Nhân vật, chuyện gì xảy ra, nhân vật nói gì và cuốn truyện có tên gì — những phần ấy mang ý tưởng của các cậu!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: Lời thoại 8 khung & Tên truyện",
          "sampleTemplate": "Khung 1: \"Một buổi sáng thật trong lành!\"\nKhung 2: \"Á! Có dấu chân ai dưới gốc sồi thế này?\"\nKhung 3: \"Đừng chạm vào, coi chừng nguy hiểm đấy!\"\nKhung 4: \"Cậu là ai? Đừng sợ, tớ tới giúp đây!\"\nKhung 5: \"Ôi không, trời bắt đầu tối đen rồi!\"\nKhung 6: \"Nắm lấy tay tớ! Chúng ta cùng bật đèn soi đường!\"\nKhung 7: \"A! Kho hạt dẻ ở đây rồi!\"\nKhung 8: \"Cảm ơn cậu nhé, người bạn dũng cảm nhất!\"\nTên truyện: Bí Ẩn Dấu Chân Bìa Rừng\nTác giả: Họa sĩ & Nhà văn nhí Sóc Bông",
          "backpackCategory": "comic-script",
          "backpackTag": "Lời thoại truyện tranh",
          "characterName": "Tác giả truyện",
          "challengeSummary": [
            "Viết lời thoại cho tám khung, tối đa hai bong bóng mỗi khung",
            "Viết thật ngắn, giống cách mình nói ngoài đời. Tranh đã kể được thì không cần chữ kể lại lần nữa",
            "Đọc to toàn bộ một lượt rồi rút gọn những câu còn dài",
            "Đặt tên truyện — tên hay nên gợi thêm một chút chuyện, đừng chỉ nói thứ mình đã nhìn thấy",
            "Làm bìa có tên truyện, nhân vật chính và tên tác giả là chính con"
          ],
          "checklist": [
            {
              "id": "cl-4-5-1",
              "label": "Viết lời thoại 8 khung (tối đa 2 bong bóng/khung, ngắn như lời nói ngoài đời)"
            },
            {
              "id": "cl-4-5-2",
              "label": "Đọc to toàn bộ một lượt rồi rút gọn câu còn dài"
            },
            {
              "id": "cl-4-5-3",
              "label": "Đặt tên truyện & ghi rõ tên tác giả"
            }
          ],
          "fields": [
            {
              "id": "dialogue-1",
              "label": "Khung 1",
              "prefix": "Khung 1: ",
              "placeholder": "“……”  /  “……”",
              "helperTip": "💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời",
              "rows": 2
            },
            {
              "id": "dialogue-2",
              "label": "Khung 2",
              "prefix": "Khung 2: ",
              "placeholder": "“……”  /  “……”",
              "helperTip": "💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời",
              "rows": 2
            },
            {
              "id": "dialogue-3",
              "label": "Khung 3",
              "prefix": "Khung 3: ",
              "placeholder": "“……”  /  “……”",
              "helperTip": "💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời",
              "rows": 2
            },
            {
              "id": "dialogue-4",
              "label": "Khung 4",
              "prefix": "Khung 4: ",
              "placeholder": "“……”  /  “……”",
              "helperTip": "💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời",
              "rows": 2
            },
            {
              "id": "dialogue-5",
              "label": "Khung 5",
              "prefix": "Khung 5: ",
              "placeholder": "“……”  /  “……”",
              "helperTip": "💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời",
              "rows": 2
            },
            {
              "id": "dialogue-6",
              "label": "Khung 6",
              "prefix": "Khung 6: ",
              "placeholder": "“……”  /  “……”",
              "helperTip": "💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời",
              "rows": 2
            },
            {
              "id": "dialogue-7",
              "label": "Khung 7",
              "prefix": "Khung 7: ",
              "placeholder": "“……”  /  “……”",
              "helperTip": "💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời",
              "rows": 2
            },
            {
              "id": "dialogue-8",
              "label": "Khung 8",
              "prefix": "Khung 8: ",
              "placeholder": "“……”  /  “……”",
              "helperTip": "💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời",
              "rows": 2
            },
            {
              "id": "comic-title",
              "label": "Tên truyện",
              "prefix": "Tên truyện: ",
              "placeholder": "Đặt tên truyện gợi thêm chuyện...",
              "badge": "Quan trọng",
              "helperTip": "💡 Tên hay nên gợi thêm một chút chuyện, đừng chỉ nói thứ đã nhìn thấy",
              "rows": 1
            },
            {
              "id": "comic-author",
              "label": "Tác giả",
              "prefix": "Tác giả: ",
              "placeholder": "Tên tác giả là chính con...",
              "rows": 1
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-4-5-vuong-mien-hoan-hao-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 4.5 — Vương miện hoàn hảo\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 4.5 — Vương miện hoàn hảo",
          "iconUrl": "/assets/aiki-islands/island4_lesson5_comicbook.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-5-1-san-lung-bo-suu-tap"
      }
    }
  },
]
