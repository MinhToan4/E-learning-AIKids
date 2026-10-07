import type { IslandCurriculumLesson } from "./types"

export const ISLAND_2_LESSONS: IslandCurriculumLesson[] = [
  {
    "id": "bai-2-1",
    "slug": "bai-2-1-buc-tranh-biet-noi",
    "islandNumber": 2,
    "lessonNumber": "2.1",
    "title": "Trạm 1 — Bức tranh biết nói",
    "subtitle": "Bức tranh đẹp là bức tranh biết kể chuyện!",
    "imageUrl": "/assets/aiki-islands/island2_lesson1_story.jpg",
    "objective": "Trẻ kể được câu chuyện ẩn trong một bức tranh.",
    "skillLearned": "Nhìn ra ba dấu hiệu của một bức tranh biết kể chuyện.",
    "nextLessonSlug": "bai-2-2-ai-la-ngoi-sao",
    "journey": {
      "stage1_goal": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage1-goal",
        "title": "Mục tiêu bài học: Trạm 1 — Bức tranh biết nói",
        "goalText": "Trẻ kể được câu chuyện ẩn trong một bức tranh.",
        "imageUrl": "/assets/aiki-islands/island2_lesson1_story.jpg",
        "speech": "Nabi: AIKI ơi xem này, tớ vẽ rất nhiều tranh đẹp lung linh luôn!\nAKI: Đẹp thật đấy Nabi! Nhưng xem xong một lúc tớ chẳng nhớ nổi bức nào. Vì các bức tranh này chỉ có hình đứng yên mà không có chuyện gì xảy ra cả!",
        "keyPoints": [
          "[1] ĐANG LÀM GÌ? — \"đang trèo lên ghế\" · \"đang giấu gì đó sau lưng\": (Không phải chỉ đứng cười hay nhìn máy ảnh)",
          "[2] CÓ GÌ LẠ? — \"ghế bị đổ\" · \"dấu chân bùn\" · \"cửa mở mà chẳng thấy ai\": (Manh mối cho biết chuyện gì vừa xảy ra)",
          "[3] RỒI SAO? — \"Ai vừa chạy ra khỏi cửa?\": (Nghĩ xem chuyện gì sẽ xảy ra tiếp theo)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage2-confirm",
        "question": "Thế nào là một bức tranh “biết kể chuyện”?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Bức có nhiều đồ vật và nhiều màu",
            "imageUrl": "/assets/aiki-islands/island2_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Bức khiến người xem tự hỏi “chuyện gì đang xảy ra ở đây nhỉ?”",
            "imageUrl": "/assets/aiki-islands/island2_lesson1_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Bức vẽ càng giống thật càng tốt",
            "imageUrl": "/assets/aiki-islands/island2_lesson1_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng rồi! Đẹp chưa đủ — phải kể được một chuyện.",
        "speech": "Chưa đúng. Nhiều đồ vật và giống thật vẫn có thể là một bức rỗng."
      },
      "stage3_video": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage3-video",
        "title": "Video bài giảng: Trạm 1 — Bức tranh biết nói",
        "videoUrl": "https://www.youtube.com/embed/XeIBZyKmoDo",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island2_lesson1_story.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Nabi: AIKI ơi xem này, tớ vẽ rất nhiều tranh đẹp lung linh luôn!\nAKI: Đẹp thật đấy Nabi! Nhưng xem xong một lúc tớ chẳng nhớ nổi bức nào. Vì các bức tranh này chỉ có hình đứng yên mà không có chuyện gì xảy ra cả!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Bức tranh đẹp là bức tranh biết nói! Chỉ cần tự hỏi 3 câu: ĐANG LÀM GÌ? — CÓ GÌ LẠ? — RỒI SAO?"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Trong Xưởng hôm nay có 4 bức tranh. Các cậu hãy nhìn thật kỹ rồi kể bằng miệng câu chuyện mình nhìn thấy nhé! Hôm nay chúng mình luyện mắt nhìn chuyện của người họa sĩ!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage4-quiz",
        "title": "Thử tài kiến thức: Trạm 1 — Bức tranh biết nói",
        "questions": [
          {
            "id": "bai-2-1-q1",
            "prompt": "Ba câu hỏi để tìm chuyện trong tranh là gì?",
            "options": [
              "A. Ai vẽ / vẽ bằng gì / vẽ lúc nào",
              "B. Đang làm gì? / Có gì lạ? / Rồi sao?",
              "C. Màu gì / to hay nhỏ / đẹp hay xấu"
            ],
            "correctIndex": 1,
            "explanation": "Giải thích: Ba câu này dùng lại suốt cả chương.",
            "visualUrl": ""
          },
          {
            "id": "bai-2-1-q2",
            "prompt": "Chi tiết nào sau đây là “CÓ GÌ LẠ”?",
            "options": [
              "A. Một cái ghế bị đổ, dấu chân bùn chạy vào nhà",
              "B. Bầu trời màu xanh",
              "C. Nhân vật mặc áo đẹp"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Những chi tiết lạ chính là manh mối để đoán chuyện gì vừa xảy ra.",
            "visualUrl": ""
          },
          {
            "id": "bai-2-1-q3",
            "prompt": "Hôm nay con có tạo bức tranh nào không?",
            "options": [
              "A. Có, tạo bốn bức",
              "B. Không — hôm nay chỉ học cách NHÌN ra câu chuyện trong tranh",
              "C. Có, tạo một bức duy nhất"
            ],
            "correctIndex": 1,
            "explanation": "Giải thích: Từ bài sau, trước khi bấm TẠO hãy nghĩ: trong tranh của mình đang có chuyện gì?",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Trạm 1 — Bức tranh biết nói",
        "subjectName": "Bức Tranh Biết Nói",
        "badge": "Trạm 1",
        "illustrationType": "storytelling",
        "lockedFeatures": [
          "chú cáo lông đỏ ngậm phong thư phát sáng",
          "dấu chân in trên nền tuyết trắng xóa",
          "khu rừng thông mờ sương buổi sớm"
        ],
        "akiMotto": "Bức tranh đẹp là bức tranh biết nói! 3 câu hỏi tìm chuyện: Đang làm gì? Có gì lạ? Rồi sao?",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Bức Tranh\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Bức Tranh",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Bức Tranh chú cáo lông đỏ ngậm phong thư phát sáng",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Chú cáo lông đỏ ngậm phong thư phát sáng bí ẩn bước vội vã qua nền tuyết trắng trong rừng thông sớm",
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
        "sampleUrl": "/assets/aiki-islands/island2_lesson1_story.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Câu chuyện trong tấm ảnh cũ nhà tớ",
          "akiAdvice": "Một bức tranh hay còn phải khiến người xem muốn hỏi: “Chuyện gì đang xảy ra ở đây nhỉ?” Hãy tìm một tấm ảnh cũ của gia đình, hỏi bố mẹ/ông bà xem hôm đó có chuyện gì xảy ra rồi ngồi nghe nhé!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: Ba câu hỏi nhìn ảnh",
          "sampleTemplate": "Trong ảnh, mọi người đang ngồi câu cá bên bờ sông chiều nắng vàng...\nĐiều lạ tớ nhìn thấy là một chú cá nhỏ nhảy vọt khỏi mặt nước bắn tung tóe...\nBố / mẹ / ông / bà kể rằng sau đó bố cười toe toét khoe hàm răng sún ngày xưa...",
          "backpackCategory": "story",
          "backpackTag": "Ảnh gia đình",
          "characterName": "Gia đình tớ",
          "challengeSummary": [
            "Hôm nay chưa cần tạo bức tranh nào — mình học cách NHÌN ra câu chuyện trong tranh",
            "Nhớ ba câu hỏi: ĐANG LÀM GÌ? — CÓ GÌ LẠ? — RỒI SAO?",
            "Tìm trong nhà một tấm ảnh cũ của gia đình. Ảnh hơi mờ hay cũ càng thú vị",
            "Cầm ảnh đến hỏi bố mẹ hoặc ông bà: \"Hôm chụp tấm này có chuyện gì xảy ra thế ạ?\" rồi ngồi nghe"
          ],
          "checklist": [
            {
              "id": "cl-2-1-1",
              "label": "Tìm trong nhà một tấm ảnh cũ của gia đình (ảnh mờ hay cũ càng thú vị)"
            },
            {
              "id": "cl-2-1-2",
              "label": "Cầm ảnh hỏi người lớn xem hôm chụp có chuyện gì xảy ra"
            },
            {
              "id": "cl-2-1-3",
              "label": "Trả lời đủ ba câu hỏi: Đang làm gì? — Có gì lạ? — Rồi sao?"
            }
          ],
          "fields": [
            {
              "id": "what-action",
              "label": "1. Trong ảnh, mọi người đang làm gì?",
              "prefix": "Trong ảnh, mọi người đang ",
              "placeholder": "ngồi câu cá bên bờ sông chiều nắng vàng...",
              "rows": 2
            },
            {
              "id": "weird-clue",
              "label": "2. Điều lạ tớ nhìn thấy trong ảnh là gì?",
              "prefix": "Điều lạ tớ nhìn thấy là ",
              "placeholder": "một chú cá nhỏ nhảy vọt khỏi mặt nước bắn tung tóe...",
              "badge": "Quan trọng",
              "helperTip": "💡 Chi tiết lạ hoặc dấu vết đặc biệt nhất làm người ta tò mò",
              "rows": 2
            },
            {
              "id": "what-next",
              "label": "3. Bố/mẹ/ông/bà kể rằng sau đó chuyện gì xảy ra?",
              "prefix": "Bố / mẹ / ông / bà kể rằng sau đó ",
              "placeholder": "bố cười toe toét khoe hàm răng sún ngày xưa...",
              "badge": "Hỏi người nhà",
              "helperTip": "💡 Cầm ảnh đến hỏi người lớn: \"Hôm chụp tấm này có chuyện gì xảy ra thế ạ?\" rồi ngồi nghe",
              "rows": 3
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Trạm 1 — Bức tranh biết nói\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Trạm 1 — Bức tranh biết nói",
          "iconUrl": "/assets/aiki-islands/island2_lesson1_story.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-2-2-ai-la-ngoi-sao"
      }
    }
  },
  {
    "id": "bai-2-2",
    "slug": "bai-2-2-ai-la-ngoi-sao",
    "islandNumber": 2,
    "lessonNumber": "2.2",
    "title": "Trạm 2 — Ai là ngôi sao?",
    "subtitle": "Bố cục 3 lớp và điểm vàng 1/3 để tôn vinh nhân vật chính!",
    "imageUrl": "/assets/aiki-islands/island2_lesson2_star.jpg",
    "objective": "Trẻ sắp xếp được nhân vật chính, nhân vật phụ và nền trong một bức.",
    "skillLearned": "Bốn từ chỉ bố cục: tiền cảnh, ở giữa, phía sau, góc trái góc phải.",
    "nextLessonSlug": "bai-2-3-cam-xuc-cua-sac-mau",
    "journey": {
      "stage1_goal": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage1-goal",
        "title": "Mục tiêu bài học: Trạm 2 — Ai là ngôi sao?",
        "goalText": "Trẻ sắp xếp được nhân vật chính, nhân vật phụ và nền trong một bức.",
        "imageUrl": "/assets/aiki-islands/island2_lesson2_star.jpg",
        "speech": "Mimi: AIKI ơi, tớ vẽ tranh sinh nhật cho em Bống mà tớ kể tận 20 thứ: bánh kem, bóng bay, gấu bông, quà, nến, pháo hoa... Tranh ra rối tinh mù chẳng thấy em Bống đâu cả!\nAKI: Mimi ơi, nhiều thứ quá thì chẳng ai biết ai là ngôi sao của bức tranh cả! Mình phải xếp chỗ cho từng bạn chứ!",
        "keyPoints": [
          "[1] PHÍA TRƯỚC — thứ gần người xem hơn: (Thường trông TO hơn)",
          "[2] Ở GIỮA — chỗ của NGÔI SAO: (Thứ cậu muốn mọi người nhìn thấy đầu tiên)",
          "[3] PHÍA SAU — thứ ở xa hơn: (Thường nhỏ hơn và bớt nổi bật hơn)",
          "[4] LUẬT — Một bức tranh — một ngôi sao: (Không phải chỉ được có một nhân vật, mà là biết rõ muốn người xem nhìn vào ai trước)",
          "[5] CÂU ĐỂ NHỚ — Xếp chỗ trước, miêu tả cho tớ sau"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage2-confirm",
        "question": "Một bức tranh nên có mấy “ngôi sao”?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Càng nhiều càng vui",
            "imageUrl": "/assets/aiki-islands/island2_lesson2_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Một ngôi sao chính",
            "imageUrl": "/assets/aiki-islands/island2_lesson2_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Ít nhất ba thì bức mới đầy",
            "imageUrl": "/assets/aiki-islands/island2_lesson2_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Một bức tranh — một ngôi sao.",
        "speech": "Chưa đúng. Cậu cần biết rõ muốn người xem nhìn vào ai TRƯỚC."
      },
      "stage3_video": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage3-video",
        "title": "Video bài giảng: Trạm 2 — Ai là ngôi sao?",
        "videoUrl": "https://www.youtube.com/embed/wmn8pf6GUdo",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island2_lesson2_star.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Mimi: AIKI ơi, tớ vẽ tranh sinh nhật cho em Bống mà tớ kể tận 20 thứ: bánh kem, bóng bay, gấu bông, quà, nến, pháo hoa... Tranh ra rối tinh mù chẳng thấy em Bống đâu cả!\nAKI: Mimi ơi, nhiều thứ quá thì chẳng ai biết ai là ngôi sao của bức tranh cả! Mình phải xếp chỗ cho từng bạn chứ!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Bố cục là xếp chỗ cho mọi thứ trong tranh! Nhớ 3 lớp: Tiền cảnh (ở gần) · Ở giữa (ngôi sao chính) · Phía sau (hậu cảnh). Và đặt ngôi sao ở vị trí một phần ba nhé!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Lấy một tờ giấy cắt ba hình: một ngôi sao và hai cảnh vật. Xếp ba lớp trên bàn, chụp ảnh nộp cho AIKI rồi mới tả đúng thứ tự đó để tạo tranh nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage4-quiz",
        "title": "Thử tài kiến thức: Trạm 2 — Ai là ngôi sao?",
        "questions": [
          {
            "id": "bai-2-2-q1",
            "prompt": "Bố cục nghĩa là gì?",
            "options": [
              "A. Xếp chỗ cho mọi thứ trong tranh",
              "B. Chọn màu cho tranh",
              "C. Đặt tên cho tranh"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Nghe hơi oai, nhưng hiểu đơn giản thôi: bố cục là xếp chỗ.",
            "visualUrl": ""
          },
          {
            "id": "bai-2-2-q2",
            "prompt": "Thứ ở PHÍA TRƯỚC thường trông thế nào?",
            "options": [
              "A. To hơn",
              "B. Nhỏ hơn",
              "C. Mờ hẳn đi"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Phía trước là những thứ gần người xem hơn nên trông to hơn; phía sau thì nhỏ và bớt nổi bật.",
            "visualUrl": ""
          },
          {
            "id": "bai-2-2-q3",
            "prompt": "Tạo xong thấy đồ vật chạy nhầm chỗ, con nên làm gì?",
            "options": [
              "A. Xem lại câu miêu tả còn thiếu gì rồi sửa trước, đừng vội tạo lại",
              "B. Bấm tạo lại ngay",
              "C. Bỏ bức đó, vẽ bức khác"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Đúng ba bước sửa đã học ở bài 1.4.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Trạm 2 — Ai là ngôi sao?",
        "subjectName": "Thuyền Buồm Ánh Dương Ngôi Sao 1/3",
        "badge": "Trạm 2",
        "illustrationType": "layer-composition",
        "lockedFeatures": [
          "tiền cảnh sóng biển ngọc bích tung bọt trắng",
          "ở giữa thuyền buồm cánh vàng thêu mặt trời lệch 1/3",
          "phía sau chân trời bình minh mây hồng"
        ],
        "akiMotto": "Ai là ngôi sao thì đặt vào điểm vàng 1/3, xếp bố cục 3 lớp tiền cảnh - ở giữa - phía sau nhé!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Thuyền Buồm\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Thuyền Buồm",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Thuyền Buồm tiền cảnh sóng biển ngọc bích tung bọt trắng",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Thuyền buồm cánh vàng thêu mặt trời ở vị trí 1/3 khung hình lướt trên sóng biển ngọc bích tiền cảnh tung bọt trắng",
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
        "sampleUrl": "/assets/aiki-islands/island2_lesson2_star.jpg",
        "creativeEngineMode": "layer-stacking",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Bức tranh ba lớp của bé (Hậu cảnh - Ngôi sao - Tiền cảnh)",
            "icon": "🌟",
            "emoji": "🌟",
            "iconImage": "/assets/aiki-islands/island2_lesson2_star.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Trạm 2 — Ai là ngôi sao?\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Trạm 2 — Ai là ngôi sao?",
          "iconUrl": "/assets/aiki-islands/island2_lesson2_star.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-2-3-cam-xuc-cua-sac-mau"
      }
    }
  },
  {
    "id": "bai-2-3",
    "slug": "bai-2-3-cam-xuc-cua-sac-mau",
    "islandNumber": 2,
    "lessonNumber": "2.3",
    "title": "Trạm 3 — Cảm xúc của Sắc màu",
    "subtitle": "Chọn cảm xúc trước -> Chọn 4 tông ánh sáng sau!",
    "imageUrl": "/assets/aiki-islands/island2_lesson3_colors.jpg",
    "objective": "Trẻ chọn được ánh sáng theo đúng cảm xúc mình muốn truyền.",
    "skillLearned": "Chọn cảm xúc trước, chọn tông ánh sáng sau.",
    "nextLessonSlug": "bai-2-4-manh-ghep-hoan-hao",
    "journey": {
      "stage1_goal": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage1-goal",
        "title": "Mục tiêu bài học: Trạm 3 — Cảm xúc của Sắc màu",
        "goalText": "Trẻ chọn được ánh sáng theo đúng cảm xúc mình muốn truyền.",
        "imageUrl": "/assets/aiki-islands/island2_lesson3_colors.jpg",
        "speech": "Mimi: Lớp tớ đang làm phim kinh dị giật gân, tớ nhận làm poster và bảo AIKI vẽ ngôi nhà cũ màu xanh... Thế mà tranh ra trông như khu resort nghỉ dưỡng mùa hè ấy!\nAKI: Ha ha! Vì Mimi chưa chọn cảm xúc mà đã chọn màu rồi! Ánh sáng ban ngày chan hòa thì làm sao kinh dị được!",
        "keyPoints": [
          "[1] BUỔI SÁNG — nắng vàng nhạt: (Cảnh trông nhẹ nhàng)",
          "[2] GIỮA TRƯA — ánh sáng mạnh, bóng đậm: (Thấy nóng, bức bối)",
          "[3] CHIỀU MUỘN — nắng vàng cam, bóng dài: (Hơi buồn, hơi nhớ)",
          "[4] BUỔI TỐI — xung quanh tối, chỉ còn một vùng sáng nhỏ: (Hơi đáng sợ, dù chẳng có con ma nào)",
          "[5] CÂU ĐỂ NHỚ — Chọn cảm xúc trước, chọn ánh sáng sau: (Hỏi: mình muốn người xem thấy gì?)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage2-confirm",
        "question": "Thứ tự đúng khi làm bài hôm nay là gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Chọn ánh sáng đẹp trước, xem ra cảm xúc gì sau",
            "imageUrl": "/assets/aiki-islands/island2_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Chọn cảm xúc trước, chọn ánh sáng sau",
            "imageUrl": "/assets/aiki-islands/island2_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Tạo cả bốn kiểu ánh sáng rồi chọn bức đẹp nhất",
            "imageUrl": "/assets/aiki-islands/island2_lesson3_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng thứ tự rồi!",
        "speech": "Chưa đúng. Phải hỏi “mình muốn người xem thấy gì?” trước đã."
      },
      "stage3_video": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage3-video",
        "title": "Video bài giảng: Trạm 3 — Cảm xúc của Sắc màu",
        "videoUrl": "https://www.youtube.com/embed/voAsCD7THtI",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island2_lesson3_colors.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Mimi: Lớp tớ đang làm phim kinh dị giật gân, tớ nhận làm poster và bảo AIKI vẽ ngôi nhà cũ màu xanh... Thế mà tranh ra trông như khu resort nghỉ dưỡng mùa hè ấy!\nAKI: Ha ha! Vì Mimi chưa chọn cảm xúc mà đã chọn màu rồi! Ánh sáng ban ngày chan hòa thì làm sao kinh dị được!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Chọn cảm xúc trước, chọn tông ánh sáng sau! 4 tông ánh sáng bảo bối: Bình minh nắng vàng ấm áp · Hoàng hôn cam tím lắng đọng · Đêm xanh trăng huyền bí · Đèn nến tương phản gay cấn!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Chọn một cảnh đơn giản như ngọn hải đăng hay căn phòng nhỏ. Đầu tiên, chọn một cảm xúc cậu muốn. Sau đó thử tạo cùng cảnh đó với bốn tông ánh sáng rồi chọn bức rung động nhất nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage4-quiz",
        "title": "Thử tài kiến thức: Trạm 3 — Cảm xúc của Sắc màu",
        "questions": [
          {
            "id": "bai-2-3-q1",
            "prompt": "Cùng một cảnh, ánh sáng làm thay đổi cái gì?",
            "options": [
              "A. Cảm giác của người xem",
              "B. Số đồ vật trong tranh",
              "C. Kích thước bức tranh"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Bậc cửa, đôi dép và cái quạt nan vẫn nguyên — chỉ ánh sáng đổi.",
            "visualUrl": ""
          },
          {
            "id": "bai-2-3-q2",
            "prompt": "Ánh sáng nào khiến cảnh trông hơi buồn, hơi nhớ?",
            "options": [
              "A. Buổi sáng, nắng vàng nhạt",
              "B. Chiều muộn, nắng vàng cam và bóng dài",
              "C. Giữa trưa, ánh sáng mạnh bóng đậm"
            ],
            "correctIndex": 1,
            "explanation": "Giải thích: Còn buổi tối chỉ còn một vùng sáng nhỏ thì thấy hơi đáng sợ.",
            "visualUrl": ""
          },
          {
            "id": "bai-2-3-q3",
            "prompt": "Cuối bài con chọn bức nào?",
            "options": [
              "A. Bức đúng nhất với cảm xúc ban đầu",
              "B. Bức đẹp nhất",
              "C. Bức sáng nhất"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Nếu muốn vui mà tranh lại buồn thì đổi ánh sáng, cứ nhìn — so sánh — rồi sửa.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Trạm 3 — Cảm xúc của Sắc màu",
        "subjectName": "Ngọn Hải Đăng Đêm Giông Tương Phản",
        "badge": "Trạm 3",
        "illustrationType": "color-emotions",
        "lockedFeatures": [
          "Cảm xúc: Vui · Buồn · Nhớ · Sợ",
          "Thứ tự: Chọn cảm xúc trước -> Chọn ánh sáng sau",
          "Mục tiêu: Chọn bức ĐÚNG với cảm xúc, không chỉ bức đẹp nhất"
        ],
        "akiMotto": "Chọn cảm xúc trước -> Chọn ánh sáng sau! 4 kiểu ánh sáng: Buổi sáng (nắng vàng nhạt), Giữa trưa (bóng đậm), Chiều muộn (nắng vàng cam), Buổi tối (vùng sáng nhỏ).",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Ngọn Hải\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Ngọn Hải",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Ngọn Hải ngọn hải đăng sọc đỏ trắng sừng sững",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Ngọn hải đăng sọc đỏ trắng chiếu luồng sáng vàng rực rỡ xuyên qua đêm bão giông tím thẫm và sóng cuộn trên vách đá",
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
        "sampleUrl": "/assets/aiki-islands/island2_lesson3_colors.jpg",
        "creativeEngineMode": "style-prism",
        "stylePrismOptions": [
          {
            "id": "morning",
            "name": "Buổi sáng (nắng vàng nhạt)",
            "icon": "🌅",
            "desc": "Cảnh trông nhẹ nhàng, nắng vàng nhạt trong trẻo",
            "promptStyle": "ánh sáng buổi sáng, nắng vàng nhạt trong trẻo nhẹ nhàng"
          },
          {
            "id": "noon",
            "name": "Giữa trưa (ánh sáng mạnh, bóng đậm)",
            "icon": "☀️",
            "desc": "Thấy nóng, bức bối, ánh sáng mạnh và bóng đổ đậm",
            "promptStyle": "ánh sáng giữa trưa gay gắt, bóng đậm rõ nét"
          },
          {
            "id": "sunset",
            "name": "Chiều muộn (nắng vàng cam, bóng dài)",
            "icon": "🌇",
            "desc": "Hơi buồn, hơi nhớ, nắng vàng cam rực và bóng đổ dài",
            "promptStyle": "ánh sáng chiều muộn, nắng vàng cam bóng dài hoài niệm"
          },
          {
            "id": "night",
            "name": "Buổi tối (xung quanh tối, một vùng sáng nhỏ)",
            "icon": "🌙",
            "desc": "Hơi đáng sợ, xung quanh tối chỉ còn một vùng sáng nhỏ",
            "promptStyle": "buổi tối xung quanh tối thẫm, chỉ có một vùng sáng nhỏ tương phản"
          }
        ],
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Buổi sáng (nắng vàng nhạt)",
            "icon": "🌅",
            "emoji": "🌅",
            "iconImage": "/assets/aiki-islands/island2_lesson3_colors.jpg"
          },
          {
            "partNumber": 2,
            "title": "Giữa trưa (ánh sáng mạnh, bóng đậm)",
            "icon": "☀️",
            "emoji": "☀️",
            "iconImage": "/assets/aiki-islands/island2_lesson3_colors.jpg"
          },
          {
            "partNumber": 3,
            "title": "Chiều muộn (nắng vàng cam, bóng dài)",
            "icon": "🌇",
            "emoji": "🌇",
            "iconImage": "/assets/aiki-islands/island2_lesson3_colors.jpg"
          },
          {
            "partNumber": 4,
            "title": "Buổi tối (xung quanh tối, một vùng sáng nhỏ)",
            "icon": "🌙",
            "emoji": "🌙",
            "iconImage": "/assets/aiki-islands/island2_lesson3_colors.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Trạm 3 — Cảm xúc của Sắc màu\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Trạm 3 — Cảm xúc của Sắc màu",
          "iconUrl": "/assets/aiki-islands/island2_lesson3_colors.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-2-4-manh-ghep-hoan-hao"
      }
    }
  },
  {
    "id": "bai-2-4",
    "slug": "bai-2-4-manh-ghep-hoan-hao",
    "islandNumber": 2,
    "lessonNumber": "2.4",
    "title": "Trạm 4 — Mảnh ghép hoàn hảo",
    "subtitle": "Ghép đủ 4 mảnh, đặt tên tranh và xuất khung tranh A3!",
    "imageUrl": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg",
    "objective": "Trẻ hoàn thành một bức tranh, đặt tên và kể được nội dung.",
    "skillLearned": "Gộp ba kỹ năng đã học là câu lệnh bốn ô, bố cục và ánh sáng. Cộng thêm kỹ năng đặt tên tranh.",
    "nextLessonSlug": "bai-3-1-ho-so-biet-doi",
    "journey": {
      "stage1_goal": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage1-goal",
        "title": "Mục tiêu bài học: Trạm 4 — Mảnh ghép hoàn hảo",
        "goalText": "Trẻ hoàn thành một bức tranh, đặt tên và kể được nội dung.",
        "imageUrl": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg",
        "speech": "Zico: Tớ tạo xong bức tranh cậu bé thả diều trên sân thượng rồi, lưu về máy xong tắt luôn nhé AIKI!\nAKI: Ơ kìa Zico! Tranh đẹp thế này mà không có tên, không được lồng khung thì sao thành tác phẩm triển lãm được! Mình phải ghép đủ bốn mảnh chứ!",
        "keyPoints": [
          "[1] CHUYỆN GÌ ĐANG XẢY RA? — \"cậu bé thả diều ngày cuối kỳ nghỉ hè\": (Mảnh thứ nhất)",
          "[2] AI LÀ NGÔI SAO? — \"cậu bé — người mình nhìn thấy đầu tiên\": (Mảnh thứ hai)",
          "[3] CẢM XÚC LÀ GÌ? — \"hơi buồn và tiếc → ánh sáng chiều muộn\": (Mảnh thứ ba)",
          "[4] TÊN TRANH — ❌ \"Cậu bé thả diều\" → ✅ \"Chiếc diều cuối cùng của mùa hè\": (Mảnh cuối — tên nên kể thêm một chút chuyện)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage2-confirm",
        "question": "Tên tranh nào tốt hơn cho bức vẽ một cậu bé thả diều cuối mùa hè?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Cậu bé thả diều",
            "imageUrl": "/assets/aiki-islands/island2_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Chiếc diều cuối cùng của mùa hè",
            "imageUrl": "/assets/aiki-islands/island2_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Bức tranh số 4",
            "imageUrl": "/assets/aiki-islands/island2_lesson4_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Cái tên khiến người xem bắt đầu tò mò.",
        "speech": "Chưa đúng. Tên đó chỉ nói lại thứ mắt mình đã thấy."
      },
      "stage3_video": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage3-video",
        "title": "Video bài giảng: Trạm 4 — Mảnh ghép hoàn hảo",
        "videoUrl": "https://www.youtube.com/embed/B_tbjS0Msnc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Zico: Tớ tạo xong bức tranh cậu bé thả diều trên sân thượng rồi, lưu về máy xong tắt luôn nhé AIKI!\nAKI: Ơ kìa Zico! Tranh đẹp thế này mà không có tên, không được lồng khung thì sao thành tác phẩm triển lãm được! Mình phải ghép đủ bốn mảnh chứ!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Ghép đủ bốn mảnh: Chuyện gì xảy ra? Ai là ngôi sao? Muốn người xem cảm thấy gì? Góc nhìn nào? Và nhớ đặt tên tranh thật hay nhé!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Đến lượt các cậu làm bức tranh cuối chương! Ghép đủ bốn mảnh, đặt tên tranh, trả lời ba câu hỏi chấm điểm của AIKI rồi bấm In A3 đóng khung treo lên góc học tập nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage4-quiz",
        "title": "Thử tài kiến thức: Trạm 4 — Mảnh ghép hoàn hảo",
        "questions": [
          {
            "id": "bai-2-4-q1",
            "prompt": "Bốn mảnh ghép của một bức tranh hoàn chỉnh là gì?",
            "options": [
              "A. Chuyện gì đang xảy ra / Ai là ngôi sao / Cảm xúc là gì / Tên tranh",
              "B. Màu / nét / bóng / khung",
              "C. Cái gì / màu gì / to hay nhỏ / của ai"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Nếu cả bốn cùng nói về một câu chuyện, bức tranh đã hoàn chỉnh.",
            "visualUrl": ""
          },
          {
            "id": "bai-2-4-q2",
            "prompt": "Luật đặt tên tranh là gì?",
            "options": [
              "A. Tên nên kể thêm một chút chuyện, đừng chỉ gọi tên thứ có trong tranh",
              "B. Tên phải thật dài cho đầy đủ",
              "C. Tên phải có tên người vẽ"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: “Chiếc diều cuối cùng của mùa hè” khiến người xem nghĩ: mùa hè sắp hết à?",
            "visualUrl": ""
          },
          {
            "id": "bai-2-4-q3",
            "prompt": "Câu chốt của cả chương là gì?",
            "options": [
              "A. Bức tranh đẹp là bức tranh kể được một chuyện",
              "B. Bức tranh đẹp là bức tranh nhiều màu",
              "C. Bức tranh đẹp là bức tranh giống thật"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Chương sau con sẽ bước vào Biệt đội nhân vật AI.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Trạm 4 — Mảnh ghép hoàn hảo",
        "subjectName": "Khung Tranh A3 Gia Đình Thú Hoàn Hảo",
        "badge": "Trạm 4",
        "illustrationType": "gallery-frame",
        "lockedFeatures": [
          "bàn tiệc sinh nhật bánh kem 3 tầng rực rỡ",
          "gia đình gấu và thỏ đội mũ chóp nhọn vui vẻ",
          "khung tranh triển lãm A3 toàn cảnh có tên tác phẩm"
        ],
        "akiMotto": "Ghép đủ 4 mảnh ghép: Chuyện gì, Ngôi sao, Cảm xúc, Góc nhìn và đặt tên tranh thật kêu trước khi xuất bản A3!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Khung Tranh\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Khung Tranh",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Khung Tranh bàn tiệc sinh nhật bánh kem 3 tầng rực rỡ",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Khung tranh A3 toàn cảnh gia đình gấu và thỏ đội mũ chóp quây quần bên bàn tiệc bánh kem 3 tầng ấm áp dưới ánh nến",
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
        "sampleUrl": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg",
        "creativeEngineMode": "magic-keys",
        "fourKeysOptions": {
          "what": [
            "một cậu bé đang thả diều ngày cuối kỳ nghỉ hè",
            "một bạn nhỏ đang tìm con mèo trốn sau bụi cây",
            "một bạn nhỏ đang tưới cây trước hiên nhà",
            "một bạn nhỏ đang chờ xe buýt dưới cơn mưa"
          ],
          "how": [
            "cậu bé thả diều",
            "bạn nhỏ đang tìm mèo",
            "bạn nhỏ cầm bình tưới",
            "bạn nhỏ cầm ô đứng chờ"
          ],
          "action": [
            "hơi buồn và tiếc + chiều muộn",
            "vui + buổi sáng nắng vàng nhạt",
            "hồi hộp + buổi tối một vùng sáng nhỏ",
            "sốt ruột + giữa trưa bóng đậm"
          ],
          "where": [
            "Chiếc diều cuối cùng của mùa hè",
            "Ngày mai tớ đi học rồi",
            "Gió chiều nay hơi buồn",
            "Cậu bé thả diều"
          ]
        },
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Bức tranh của bé (Ghép 4 mảnh)",
            "icon": "🧩",
            "emoji": "🧩",
            "iconImage": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Trạm 4 — Mảnh ghép hoàn hảo\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Trạm 4 — Mảnh ghép hoàn hảo",
          "iconUrl": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-3-1-ho-so-biet-doi"
      }
    }
  },
]
