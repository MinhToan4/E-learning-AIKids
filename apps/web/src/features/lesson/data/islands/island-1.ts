import type { IslandCurriculumLesson } from "./types"

export const ISLAND_1_LESSONS: IslandCurriculumLesson[] = [
  {
    "id": "bai-1-1",
    "slug": "bai-1-1-mot-tu-hay-nam-tu",
    "islandNumber": 1,
    "lessonNumber": "1.1",
    "title": "Bài 1.1 — Một từ hay năm từ?",
    "subtitle": "Tả càng rõ, AIKI vẽ càng đúng!",
    "imageUrl": "/assets/aiki-islands/island1_lesson1_cat.jpg?v=2",
    "objective": "Trẻ biết cách viết câu lệnh đầu tiên cho AI.",
    "skillLearned": "Biết thêm chi tiết để câu lệnh rõ ràng hơn.",
    "nextLessonSlug": "bai-1-2-bon-chiec-chia-khoa",
    "journey": {
      "stage1_goal": {
        "id": "bai-1-1-mot-tu-hay-nam-tu-stage1-goal",
        "title": "Mục tiêu bài học: Bài 1.1 — Một từ hay năm từ?",
        "goalText": "Trẻ biết cách viết câu lệnh đầu tiên cho AI.",
        "skillLearned": "Biết thêm chi tiết để câu lệnh rõ ràng hơn.",
        "imageUrl": "/assets/aiki-islands/island1_lesson1_cat.jpg?v=2",
        "speech": "Mimi: Xong! Đây là con mèo. Đúng là con mèo rồi đấy... Nhưng mà con mèo trong đầu tớ không phải con này!\nAKI: Các cậu ơi, các cậu nghĩ Mimi làm sai ở chỗ nào nhỉ? Vì Mimi chỉ gõ đúng hai chữ 'con mèo' thôi đấy!",
        "keyPoints": [
          "[1] MỘT TỪ: “Con mèo” (AKI phải tự đoán bốn phần còn lại)",
          "[2] NĂM Ý: “Con mèo mướp béo đang ngủ trên ghế mây cạnh cửa sổ” (AKI chẳng phải đoán gì cả)",
          "[3] CÂU THẦN CHÚ: “Chỗ nào mình không nói rõ, AI sẽ tự đoán.” (Nhớ suốt cả khoá)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-1-1-mot-tu-hay-nam-tu-stage2-confirm",
        "question": "Nếu các cậu chỉ viết “con mèo”, những chỗ chưa nói rõ thì AI sẽ làm gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Dừng lại và hỏi các cậu từng chỗ",
            "imageUrl": "/assets/aiki-islands/island1_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Tự đoán những chỗ các cậu chưa nói rõ",
            "imageUrl": "/assets/aiki-islands/island1_lesson1_opt_b.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng rồi! Chỗ nào mình chưa nói rõ, AI sẽ tự đoán.",
        "speech": "Chưa đúng rồi! AI có thể tự đoán những chỗ mình chưa nói rõ."
      },
      "stage3_video": {
        "id": "bai-1-1-mot-tu-hay-nam-tu-stage3-video",
        "title": "Video bài giảng: Bài 1.1 — Một từ hay năm từ?",
        "videoUrl": "https://www.youtube.com/embed/sRpHRsErlw8",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island1_lesson1_cat.jpg?v=2",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Mimi: Xong! Đây là con mèo. Đúng là con mèo rồi đấy... Nhưng mà con mèo trong đầu tớ không phải con này!\nAKI: Các cậu ơi, các cậu nghĩ Mimi làm sai ở chỗ nào nhỉ? Vì Mimi chỉ gõ đúng hai chữ 'con mèo' thôi đấy!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Chỗ nào các cậu bỏ trống, thì Ây Ai như tớ sẽ tự điền vào. Muốn tớ vẽ đúng ý thì đừng bỏ trống chỗ nào cả nhé!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Đến lượt các cậu rồi! Thử thách xưởng thực hành: Chọn một con vật, lần 1 gõ 1 từ, lần 2 gõ đủ 5 chi tiết vàng rồi so sánh kết quả nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-1-1-mot-tu-hay-nam-tu-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 1.1 — Một từ hay năm từ?",
        "questions": [
          {
            "id": "bai-1-1-q1",
            "prompt": "Câu thần chú của bài hôm nay là gì?",
            "options": [
              "A. Chỗ nào mình không nói rõ, AI sẽ tự đoán.",
              "B. Viết càng dài, AI càng dễ đáp",
              "C. Viết càng ngắn, AI càng hiểu"
            ],
            "correctIndex": 0,
            "explanation": "Đúng rồi! / Chưa đúng rồi!",
            "visualUrl": ""
          },
          {
            "id": "bai-1-1-q2",
            "prompt": "Câu tả “con mèo mướp béo đang ngủ trên ghế mây cạnh cửa sổ” có mấy ý?",
            "options": [
              "A. Ba ý",
              "B. Năm ý",
              "C. Một ý"
            ],
            "correctIndex": 1,
            "explanation": "Chính xác! / Thử lại nhé!",
            "visualUrl": ""
          },
          {
            "id": "bai-1-1-q3",
            "prompt": "Nếu con mèo chưa đúng ý, mình nên làm gì?",
            "options": [
              "A. Cứ bấm tạo lại nhiều lần",
              "B. Thêm chi tiết miêu tả rõ hơn",
              "C. Đổi sang con vật khác cho dễ"
            ],
            "correctIndex": 1,
            "explanation": "Đúng rồi! / Chưa đúng, thử lại nhé!",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-1-1-mot-tu-hay-nam-tu-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 1.1 — Một từ hay năm từ?",
        "subjectName": "Chú Mèo Mướp Béo",
        "badge": "Bài 1.1",
        "illustrationType": "cat-fat",
        "lockedFeatures": [
          "mèo mướp vàng béo tròn",
          "lông vằn cam trắng",
          "đang nằm ngủ cuộn tròn trên ghế mây"
        ],
        "akiMotto": "Chỗ nào các cậu bỏ trống, AI như tớ sẽ tự điền vào. Tả càng rõ thì AIKI vẽ càng đúng ý!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thực hành 01 — Một từ",
            "akiSpeech": "Bé chỉ cần gõ đúng một từ 'con mèo' thôi, rồi bấm tạo để xem tớ vẽ thế nào nhé!",
            "quickPrompt": "con mèo",
            "instruction": "Câu lệnh 1 từ: con mèo ▸ FIX"
          },
          {
            "step": 2,
            "title": "Thực hành 02 — Năm điều",
            "akiSpeech": "Bây giờ câu lệnh đã có đủ năm điều chi tiết, bé hãy bấm tạo để so sánh với bức ảnh trước nhé!",
            "quickPrompt": "con mèo · lông màu trắng · đang nằm · nhắm mắt · ở trước sân",
            "instruction": "Câu lệnh 5 điều chi tiết ▸ FIX"
          }
        ],
        "sampleUrl": "/assets/aiki-islands/island1_lesson1_cat.jpg?v=2",
        "creativeEngineMode": "magic-keys",
        "fourKeysOptions": {
          "what": ["con mèo"],
          "how": ["lông màu trắng"],
          "action": ["đang nằm nhắm mắt"],
          "where": ["ở trước sân"]
        },
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Con mèo",
            "icon": "🐱",
            "emoji": "🐱",
            "iconImage": "/assets/pregenerated-combos/cat/combo__sub-meo-muop.webp"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-1-1-mot-tu-hay-nam-tu-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 1.1 — Một từ hay năm từ?\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 1.1 — Một từ hay năm từ?",
          "iconUrl": "/assets/aiki-islands/island1_lesson1_cat.jpg?v=2",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-1-2-bon-chiec-chia-khoa"
      }
    }
  },
  {
    "id": "bai-1-2",
    "slug": "bai-1-2-bon-chiec-chia-khoa",
    "islandNumber": 1,
    "lessonNumber": "1.2",
    "title": "Bài 1.2 — Bốn chiếc chìa khoá",
    "subtitle": "Bộ khung 4 chìa khoá vạn năng để mở cánh cửa sáng tạo AI!",
    "imageUrl": "/assets/aiki-islands/island1_lesson2_keys_v2.jpg",
    "objective": "Trẻ biết viết một câu lệnh rõ ràng với đủ bốn phần.",
    "skillLearned": "Biết dùng 4 chìa khóa: Cái gì? – Trông như thế nào? – Đang làm gì? – Ở đâu?",
    "nextLessonSlug": "bai-1-3-um-ba-la-bien-hinh",
    "journey": {
      "stage1_goal": {
        "id": "bai-1-2-bon-chiec-chia-khoa-stage1-goal",
        "title": "Mục tiêu bài học: Bài 1.2 — Bốn chiếc chìa khoá",
        "goalText": "Trẻ biết viết một câu lệnh rõ ràng với đủ bốn phần.",
        "imageUrl": "/assets/aiki-islands/island1_lesson2_keys_v2.jpg",
        "speech": "Zico: Một con mèo rất đẹp, rất là đẹp, đẹp lắm luôn, tớ rất thích nó...\nAKI: Hả? Zico viết dài thế mà tranh vẫn chưa rõ kìa! Viết dài toàn từ khen chưa chắc đã rõ đâu nhé các cậu!",
        "keyPoints": [
          "[1] CÁI GÌ?: Con mèo, cái cốc, chiếc xe đạp...",
          "[2] TRÔNG NHƯ THẾ NÀO?: Béo, gầy, cao, bóng, xù xì...",
          "[3] ĐANG LÀM GÌ?: Ngủ, chạy, nhảy, bốc khói...",
          "[4] Ở ĐÂU?: Trên bàn, dưới tủ, trên cây..."
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-1-2-bon-chiec-chia-khoa-stage2-confirm",
        "question": "Đâu là bộ 4 chìa khóa giúp câu lệnh rõ ràng hơn?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Ai làm? / Làm lúc nào? / Làm ở đâu? / Làm bằng gì?"
          },
          {
            "id": "opt-b",
            "text": "B. Cái gì? / Trông như thế nào? / Đang làm gì? / Ở đâu?"
          },
          {
            "id": "opt-c",
            "text": "C. Cái gì? / Màu gì? / To hay nhỏ? / Của ai?"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng rồi! Đó chính là bộ 4 chìa khóa.",
        "speech": "Chưa đúng rồi! Nhớ nhé: Cái gì? – Trông như thế nào? – Đang làm gì? – Ở đâu?"
      },
      "stage3_video": {
        "id": "bai-1-2-bon-chiec-chia-khoa-stage3-video",
        "title": "Video bài giảng: Bài 1.2 — Bốn chiếc chìa khoá",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island1_lesson2_keys_v2.jpg",
        "timestamps": [
          {
            "label": "Tình huống",
            "startSec": 15,
            "endSec": 50,
            "speech": "Zico: Một con mèo rất đẹp, rất là đẹp, đẹp lắm luôn, tớ rất thích nó...\nAKI: Hả? Zico viết dài thế mà tranh vẫn chưa rõ kìa! Viết dài toàn từ khen chưa chắc đã rõ đâu nhé các cậu!"
          },
          {
            "label": "Cắt 4 màu",
            "startSec": 50,
            "endSec": 120,
            "speech": "Cắt 4 màu"
          },
          {
            "label": "Soi câu thiếu",
            "startSec": 120,
            "endSec": 180,
            "speech": "Các cậu vừa đọc xong ở chặng Mục tiêu đấy — nhớ lại xem nào! Bộ chìa khoá nào mở được một câu lệnh tốt?"
          },
          {
            "label": "Đọc cho thuộc",
            "startSec": 180,
            "endSec": 240,
            "speech": "Bốn chiếc chìa khoá: Xanh là CÁI GÌ, Vàng là TRÔNG NHƯ THẾ NÀO, Cam là ĐANG LÀM GÌ, Đỏ là Ở ĐÂU! Đủ bốn chìa khoá là AIKI hết chỗ đoán bừa!"
          },
          {
            "label": "Làm cùng",
            "startSec": 240,
            "endSec": 270,
            "speech": "Mình thử ngay với một thứ trong xưởng này nhé: Cái cốc của tớ đây. Ô một: Cái gì? Một cái cốc. Ô hai: Trông như thế nào? Cốc sứ trắng men bóng mẻ miệng. Ô ba: Đang làm gì? Đang bốc khói nghi ngút. Ô bốn: Ở đâu? Trên bàn gỗ cạnh cuốn sổ mở. Nút Tạo sáng lên rồi kìa!"
          },
          {
            "label": "Thử thách",
            "startSec": 270,
            "endSec": 300,
            "speech": "Nhớ bốn món đồ thật các cậu chọn hôm trước không? Lấy ra xoay một vòng, nhìn thật kỹ rồi điền đủ 4 chìa khoá để tạo nhé! Cho người nhà xem và đố họ đoán xem cậu tả gì!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-1-2-bon-chiec-chia-khoa-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 1.2 — Bốn chiếc chìa khoá",
        "questions": [
          {
            "id": "bai-1-2-q1",
            "prompt": "“Một con chó xù màu nâu đang chạy” còn thiếu chìa khóa nào?",
            "options": [
              "A. CÁI GÌ?",
              "B. ĐANG LÀM GÌ?",
              "C. Ở ĐÂU?"
            ],
            "correctIndex": 2,
            "explanation": "Đúng rồi! / Thử lại nhé!",
            "visualUrl": ""
          },
          {
            "id": "bai-1-2-q2",
            "prompt": "Vì sao câu của Zico rất dài mà vẫn chưa rõ?",
            "options": [
              "A. Vì câu dài nhưng chưa đủ 4 chìa khóa",
              "B. Vì Zico viết sai chính tả",
              "C. Vì AI không đọc được câu dài"
            ],
            "correctIndex": 0,
            "explanation": "Chính xác! / Chưa đúng rồi!",
            "visualUrl": ""
          },
          {
            "id": "bai-1-2-q3",
            "prompt": "Khi tả một đồ vật, chìa khóa nào dễ bị quên nhất?",
            "options": [
              "A. ĐANG LÀM GÌ?",
              "B. CÁI GÌ?",
              "C. TRÔNG NHƯ THẾ NÀO?"
            ],
            "correctIndex": 0,
            "explanation": "Đúng rồi! / Thử lại nhé!",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-1-2-bon-chiec-chia-khoa-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 1.2 — Bốn chiếc chìa khoá",
        "subjectName": "Cốc Sứ Trắng Mẻ Miệng Bốc Khói",
        "badge": "Bài 1.2",
        "illustrationType": "teacup",
        "lockedFeatures": [
          "cốc sứ trắng men bóng mẻ miệng",
          "hơi nóng bốc khói nghi ngút",
          "đặt trên bàn gỗ cạnh cuốn sổ mở"
        ],
        "akiMotto": "4 Chìa khóa vạn năng: Xanh (Cái gì) · Vàng (Trông như thế nào) · Cam (Đang làm gì) · Đỏ (Ở đâu). Đủ 4 chìa là hết đoán bừa!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Cốc Sứ\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Cốc Sứ",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Cốc Sứ cốc sứ trắng men bóng mẻ miệng",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Một cái cốc sứ trắng mẻ miệng đang bốc khói nghi ngút đặt trên bàn gỗ sồi cạnh cuốn sổ mở",
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
        "sampleUrl": "/assets/aiki-islands/island1_lesson2_keys_v2.jpg",
        "creativeEngineMode": "magic-keys",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Con cún",
            "icon": "🐶",
            "emoji": "🐶",
            "iconImage": "/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp"
          },
          {
            "partNumber": 2,
            "title": "Cái xe đạp",
            "icon": "🚲",
            "emoji": "🚲",
            "iconImage": "/assets/aiki-islands/island1_lesson2_bicycle.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-1-2-bon-chiec-chia-khoa-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 1.2 — Bốn chiếc chìa khoá\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 1.2 — Bốn chiếc chìa khoá",
          "iconUrl": "/assets/aiki-islands/island1_lesson2_keys_v2.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-1-3-um-ba-la-bien-hinh"
      }
    }
  },
  {
    "id": "bai-1-3",
    "slug": "bai-1-3-um-ba-la-bien-hinh",
    "islandNumber": 1,
    "lessonNumber": "1.3",
    "title": "Bài 1.3 — Úm ba la... Biến hình",
    "subtitle": "Khám phá 4 phong cách nghệ thuật biến hóa tranh thần kỳ!",
    "imageUrl": "/assets/aiki-islands/island1_lesson3_styles.jpg",
    "objective": "Trẻ biết chọn kiểu vẽ phù hợp và nói được vì sao mình chọn.",
    "skillLearned": "Biết thêm kiểu vẽ vào câu lệnh và chọn phong cách phù hợp với mục đích của mình.",
    "nextLessonSlug": "bai-1-4-ky-su-tai-ba",
    "journey": {
      "stage1_goal": {
        "id": "bai-1-3-um-ba-la-bien-hinh-stage1-goal",
        "title": "Mục tiêu bài học: Bài 1.3 — Úm ba la... Biến hình",
        "goalText": "Trẻ biết chọn kiểu vẽ phù hợp và nói được vì sao mình chọn.",
        "imageUrl": "/assets/aiki-islands/island1_lesson3_styles.jpg",
        "speech": "Sonet: AIKI ơi, tớ vẽ con trâu mà sao tranh nào cũng một màu chán ngắt thế này?\nAKI: Nhìn cái này đi Sonet! Tớ có bốn bức tranh con trâu. Tớ tả giống hệt nhau từng chữ một, thế mà bốn bức lại khác hẳn nhau!",
        "keyPoints": [
          "[1] GIỮ NGUYÊN CÂU TẢ: Không đổi phần nội dung đã viết.",
          "[2] THÊM KIỂU VẼ: Màu nước · Truyện tranh · Đất nặn · Tranh Đông Hồ",
          "→ Thêm vào cuối câu lệnh.",
          "[3] CHỌN MỘT BỨC: Trong các kết quả, chọn một bức mình thích nhất.",
          "[4] NÓI VÌ SAO: Ví dụ: “Tớ chọn bức này vì muốn treo ở đầu giường.”",
          "[5] BẢN QUYỀN: Có thể gọi tên kiểu vẽ, nhưng không yêu cầu AI vẽ y hệt phong cách của một họa sĩ còn sống."
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-1-3-um-ba-la-bien-hinh-stage2-confirm",
        "question": "Muốn thử một kiểu vẽ khác, mình nên làm gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Viết lại toàn bộ câu lệnh",
            "imageUrl": "/assets/aiki-islands/island1_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Giữ nguyên câu tả và thêm kiểu vẽ vào cuối",
            "imageUrl": "/assets/aiki-islands/island1_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Xóa bớt chi tiết trong câu tả",
            "imageUrl": "/assets/aiki-islands/island1_lesson3_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng rồi! Giữ nguyên câu tả, chỉ cần thêm kiểu vẽ vào cuối.",
        "speech": "Chưa đúng rồi! Không cần viết lại từ đầu. Chỉ cần thêm kiểu vẽ vào cuối câu."
      },
      "stage3_video": {
        "id": "bai-1-3-um-ba-la-bien-hinh-stage3-video",
        "title": "Video bài giảng: Bài 1.3 — Úm ba la... Biến hình",
        "videoUrl": "https://www.youtube.com/embed/GCtez_WirtU",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island1_lesson3_styles.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Sonet: AIKI ơi, tớ vẽ con trâu mà sao tranh nào cũng một màu chán ngắt thế này?\nAKI: Nhìn cái này đi Sonet! Tớ có bốn bức tranh con trâu. Tớ tả giống hệt nhau từng chữ một, thế mà bốn bức lại khác hẳn nhau!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Phong cách nghệ thuật giống như thay chiếc áo thần kỳ cho bức tranh! Chỉ cần thêm tên phong cách vào cuối câu tả bốn ô là xong!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Việc của các cậu hôm nay: Chọn một con vật, tạo cùng một nội dung theo cả 4 phong cách nghệ thuật. Xong rồi chọn lấy một bức và nói lý do vì sao cậu thích nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-1-3-um-ba-la-bien-hinh-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 1.3 — Úm ba la... Biến hình",
        "questions": [
          {
            "id": "bai-1-3-q1",
            "prompt": "Vì sao bốn bức con trâu của AKI trông khác nhau?",
            "options": [
              "A. Vì AKI đổi kiểu vẽ ở cuối câu lệnh",
              "B. Vì AKI tả bốn con trâu khác nhau",
              "C. Vì AKI bấm tạo nhiều lần"
            ],
            "correctIndex": 0,
            "explanation": "Đúng rồi! / Thử lại nhé!",
            "visualUrl": ""
          },
          {
            "id": "bai-1-3-q2",
            "prompt": "Điều nào mình không nên làm?",
            "options": [
              "A. Chọn kiểu vẽ như màu nước hoặc đất nặn",
              "B. Yêu cầu AI vẽ y hệt phong cách của một họa sĩ còn sống",
              "C. Thử cùng một nội dung với nhiều kiểu vẽ khác nhau"
            ],
            "correctIndex": 1,
            "explanation": "Chính xác! / Chưa đúng rồi!",
            "visualUrl": ""
          },
          {
            "id": "bai-1-3-q3",
            "prompt": "Vì sao AKI chọn bức màu nước?",
            "options": [
              "A. Vì màu nước lúc nào cũng đẹp nhất",
              "B. Vì AKI muốn treo ở đầu giường và thấy kiểu này nhẹ nhàng",
              "C. Vì màu nước tạo nhanh nhất"
            ],
            "correctIndex": 1,
            "explanation": "Đúng rồi! / Thử lại nhé!",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-1-3-um-ba-la-bien-hinh-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 1.3 — Úm ba la... Biến hình",
        "subjectName": "Bảng 4 Phong Cách Nghệ Thuật",
        "badge": "Bài 1.3",
        "illustrationType": "four-styles",
        "lockedFeatures": [
          "đất nặn Clay 3D tròn trịa",
          "màu nước Watercolor loang mềm mại",
          "pixel art cổ điển",
          "xé dán giấy Quilling tinh tế"
        ],
        "akiMotto": "Phong cách nghệ thuật giống như chiếc áo thần kỳ biến hóa bức tranh hoàn toàn mới!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thực hành 01 — Con trâu (4 kiểu vẽ)",
            "akiSpeech": "Cậu hãy giữ nguyên câu tả 'Con trâu' và lần lượt thử 4 kiểu vẽ: Màu nước, Truyện tranh, Đất nặn, và Tranh Đông Hồ nhé!",
            "quickPrompt": "Con trâu",
            "instruction": "Thử 4 kiểu vẽ với câu lệnh con trâu"
          },
          {
            "step": 2,
            "title": "Thực hành 02 — Con chuột (4 kiểu vẽ)",
            "akiSpeech": "Bây giờ chuyển sang 'Con chuột', cũng thử 4 kiểu vẽ để xem bức tranh biến hóa thế nào nhé!",
            "quickPrompt": "Con chuột",
            "instruction": "Thử 4 kiểu vẽ với câu lệnh con chuột"
          },
          {
            "step": 3,
            "title": "Thêm ánh sáng ma thuật",
            "akiSpeech": "Bây giờ hãy thêm ánh sáng ma thuật để bức tranh lung linh hơn nữa nhé!",
            "quickPrompt": "Chú trâu đất nặn Clay 3D dưới ánh trăng tròn phát sáng kỳ ảo",
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
        "sampleUrl": "/assets/aiki-islands/island1_lesson3_styles.jpg",
        "creativeEngineMode": "style-prism",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Con trâu",
            "icon": "🐃",
            "emoji": "🐃",
            "iconImage": "/assets/pregenerated-fallback/style-prism/buffalo_clay_v1.webp"
          },
          {
            "partNumber": 2,
            "title": "Con chuột",
            "icon": "🐭",
            "emoji": "🐭",
            "iconImage": "/assets/pregenerated-fallback/style-prism/mouse_clay_v1.webp"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-1-3-um-ba-la-bien-hinh-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 1.3 — Úm ba la... Biến hình\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 1.3 — Úm ba la... Biến hình",
          "iconUrl": "/assets/aiki-islands/island1_lesson3_styles.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-1-4-ky-su-tai-ba"
      }
    }
  },
  {
    "id": "bai-1-4",
    "slug": "bai-1-4-ky-su-tai-ba",
    "islandNumber": 1,
    "lessonNumber": "1.4",
    "title": "Bài 1.4 — Kỹ sư tài ba",
    "subtitle": "Bác sĩ câu lệnh: Tranh sai thì sửa chữ chứ không bấm nút bừa!",
    "imageUrl": "/assets/aiki-islands/island1_lesson4_engineer.jpg",
    "objective": "Trẻ biết sửa câu lệnh khi hình chưa đúng, thay vì cứ bấm tạo lại.",
    "skillLearned": "Biết sửa hình theo 3 bước: gọi tên lỗi – tìm chỗ thiếu – viết thêm rồi tạo lại.",
    "nextLessonSlug": "bai-2-1-buc-tranh-biet-noi",
    "journey": {
      "stage1_goal": {
        "id": "bai-1-4-ky-su-tai-ba-stage1-goal",
        "title": "Mục tiêu bài học: Bài 1.4 — Kỹ sư tài ba",
        "goalText": "Trẻ biết sửa câu lệnh khi hình chưa đúng, thay vì cứ bấm tạo lại.",
        "imageUrl": "/assets/aiki-islands/island1_lesson4_engineer.jpg",
        "speech": "Nabi: Bấm... vẫn sai! Bấm... lại sai! Bàn tay hiệp sĩ cứ ra sáu ngón hoài à AIKI ơi!\nAKI: Nabi bấm năm lần rồi đấy, hết cả lượt mà chả được gì! Nhìn bức tranh tay sáu ngón này xem, lỗi là do mình chưa sửa câu lệnh đấy!",
        "keyPoints": [
          "[1] GỌI TÊN LỖI: “Tay có sáu ngón” · “Mất cái mũ” · “Thừa ba con chim”",
          "[2] TÌM CHỖ THIẾU: Xem lại câu lệnh: mình đã nói rõ chỗ đó chưa?",
          "[3] VIẾT THÊM: Ví dụ: “Một bàn tay NĂM NGÓN đang cầm bút chì, NHÌN NGHIÊNG.”",
          "[4] CÂU ĐỂ NHỚ: AI làm sai, sửa câu trước khi bấm lại."
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-1-4-ky-su-tai-ba-stage2-confirm",
        "question": "Hình tạo ra chưa đúng. Mình nên làm gì trước tiên?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Bấm tạo lại ngay",
            "imageUrl": "/assets/aiki-islands/island1_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Gọi tên lỗi rồi tìm chỗ chưa rõ trong câu lệnh",
            "imageUrl": "/assets/aiki-islands/island1_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Đổi sang một đề tài khác",
            "imageUrl": "/assets/aiki-islands/island1_lesson4_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng rồi! Gọi tên lỗi – tìm chỗ thiếu – viết thêm rồi mới tạo lại.",
        "speech": "Chưa đúng rồi! Đừng vội bấm lại. Hãy xem hình sai ở đâu và sửa câu lệnh trước."
      },
      "stage3_video": {
        "id": "bai-1-4-ky-su-tai-ba-stage3-video",
        "title": "Video bài giảng: Bài 1.4 — Kỹ sư tài ba",
        "videoUrl": "https://www.youtube.com/embed/53OFMtjB0aM",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island1_lesson4_engineer.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Nabi: Bấm... vẫn sai! Bấm... lại sai! Bàn tay hiệp sĩ cứ ra sáu ngón hoài à AIKI ơi!\nAKI: Nabi bấm năm lần rồi đấy, hết cả lượt mà chả được gì! Nhìn bức tranh tay sáu ngón này xem, lỗi là do mình chưa sửa câu lệnh đấy!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Khi Ây Ai vẽ sai thì sửa chữ, đừng bấm nút bừa! Bác sĩ câu lệnh phải bắt đúng bệnh, kê đúng thuốc!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Mở lại ba bài trước, tìm lấy một bức tranh chưa ưng ý của các cậu. Viết câu chú thích hỏng vì sao, sửa câu lệnh rồi tạo lại một bản xịn sò nhé! Bác sĩ câu lệnh ra tay nào!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-1-4-ky-su-tai-ba-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 1.4 — Kỹ sư tài ba",
        "questions": [
          {
            "id": "bai-1-4-q1",
            "prompt": "Ba bước sửa hình theo đúng thứ tự là gì?",
            "options": [
              "A. Bấm lại → sửa câu → bấm lại",
              "B. Gọi tên lỗi → tìm chỗ thiếu → viết thêm rồi tạo lại",
              "C. Tìm chỗ thiếu → tạo lại → gọi tên lỗi"
            ],
            "correctIndex": 1,
            "explanation": "Đúng rồi! / Thử lại nhé!",
            "visualUrl": ""
          },
          {
            "id": "bai-1-4-q2",
            "prompt": "Vì sao AKI vẫn lưu lại những bức tranh bị lỗi?",
            "options": [
              "A. Để nhìn lại và biết tranh sai ở đâu",
              "B. Vì những bức tranh đó rất đẹp",
              "C. Vì AKI không biết cách xóa tranh"
            ],
            "correctIndex": 0,
            "explanation": "Chính xác! / Chưa đúng rồi!",
            "visualUrl": ""
          },
          {
            "id": "bai-1-4-q3",
            "prompt": "Vì sao bàn tay lại có sáu ngón?",
            "options": [
              "A. Vì câu lệnh chưa nói rõ số ngón tay",
              "B. Vì AKI cố tình vẽ sai",
              "C. Vì AKI sắp hết lượt tạo"
            ],
            "correctIndex": 0,
            "explanation": "Đúng rồi! / Thử lại nhé!",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-1-4-ky-su-tai-ba-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 1.4 — Kỹ sư tài ba",
        "subjectName": "Bác Sĩ Câu Lệnh Sửa Tay Hiệp Sĩ",
        "badge": "Bài 1.4",
        "illustrationType": "engineer-fix",
        "lockedFeatures": [
          "bàn tay hiệp sĩ đeo găng giáp bạc đúng 5 ngón",
          "viên ngọc xanh biếc bảo hộ phát sáng",
          "áo giáp kim loại phản chiếu ánh hào quang"
        ],
        "akiMotto": "Bác sĩ câu lệnh: Tranh chưa chuẩn thì sửa chữ chứ đừng bấm nút bừa!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Bác Sĩ\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Bác Sĩ",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Bác Sĩ bàn tay hiệp sĩ đeo găng giáp bạc đúng 5 ngón",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Bàn tay hiệp sĩ bọc găng giáp bạc đúng 5 ngón tay rõ ràng nắm chặt chuôi kiếm có viên ngọc xanh phát sáng",
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
        "sampleUrl": "/assets/aiki-doctor/doctor_hand_cured_v1.webp",
        "creativeEngineMode": "prompt-doctor",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Cách 1: Nhìn nghiêng tì bàn",
            "icon": "✍️",
            "emoji": "✍️",
            "iconImage": "/assets/aiki-doctor/doctor_hand_broken_6fingers.webp",
            "curedImageUrl": "/assets/aiki-doctor/doctor_hand_cured_side_desk.webp",
            "sampleResultUrl": "/assets/aiki-doctor/doctor_hand_cured_side_desk.webp",
            "cureText": "một bàn tay năm ngón đang cầm bút chì, nhìn nghiêng từ bên phải, cổ tay tì lên mặt bàn gỗ"
          },
          {
            "partNumber": 2,
            "title": "Cách 2: Hướng xuống giấy",
            "icon": "📝",
            "emoji": "📝",
            "iconImage": "/assets/aiki-doctor/doctor_hand_broken_6fingers.webp",
            "curedImageUrl": "/assets/aiki-doctor/doctor_hand_cured_paper_down.webp",
            "sampleResultUrl": "/assets/aiki-doctor/doctor_hand_cured_paper_down.webp",
            "cureText": "một bàn tay năm ngón tách rời rõ cầm bút chì đầu nhọn hướng xuống trang giấy trắng"
          },
          {
            "partNumber": 3,
            "title": "Cách 3: Giơ bút nhìn ngang",
            "icon": "✏️",
            "emoji": "✏️",
            "iconImage": "/assets/aiki-doctor/doctor_hand_broken_6fingers.webp",
            "curedImageUrl": "/assets/aiki-doctor/doctor_hand_cured_raised_up.webp",
            "sampleResultUrl": "/assets/aiki-doctor/doctor_hand_cured_raised_up.webp",
            "cureText": "một bàn tay năm ngón đang giơ bút chì lên nhìn ngang trên nền trơn"
          },
          {
            "partNumber": 4,
            "title": "Cách 4: Năm ngón chuẩn",
            "icon": "✋",
            "emoji": "✋",
            "iconImage": "/assets/aiki-doctor/doctor_hand_broken_6fingers.webp",
            "curedImageUrl": "/assets/aiki-doctor/doctor_hand_cured_v1.webp",
            "sampleResultUrl": "/assets/aiki-doctor/doctor_hand_cured_v1.webp",
            "cureText": "một bàn tay năm ngón chuẩn chỉnh đang cầm bút chì viết bài rõ từng ngón"
          }
        ],
        "promptDoctorCase": {
          "caseTitle": "Ca 1: Tay sáu ngón",
          "symptom": "Một bạn nhỏ đang vẫy tay nhưng bàn tay có tận 6 ngón tay!",
          "originalPrompt": "Một bạn nhỏ đang vẫy tay chào vui vẻ",
          "refImageUrl": "/assets/aiki-doctor/doctor_hand_broken_v1.webp",
          "curedImageUrl": "/assets/aiki-doctor/doctor_hand_cured_v1.webp",
          "cureCards": [
            "Đúng một bàn tay năm ngón rõ ràng",
            "Thêm đồng hồ đeo tay màu xanh lá",
            "Vẽ thêm chiếc nón lá trên đầu",
            "Đổi màu áo sang màu vàng cam"
          ]
        }
      },
      "stage6_completion": {
        "id": "bai-1-4-ky-su-tai-ba-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 1.4 — Kỹ sư tài ba\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 1.4 — Kỹ sư tài ba",
          "iconUrl": "/assets/aiki-islands/island1_lesson4_engineer.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-2-1-buc-tranh-biet-noi"
      }
    }
  },
]
