import type { IslandCurriculumLesson } from "./types"

export const ISLAND_5_LESSONS: IslandCurriculumLesson[] = [
  {
    "id": "bai-5-1",
    "slug": "bai-5-1-san-lung-bo-suu-tap",
    "islandNumber": 5,
    "lessonNumber": "5.1",
    "title": "Bài 5.1 — Săn lùng Bộ sưu tập",
    "subtitle": "Săn lùng 12 món cùng một họ để khởi đầu bộ thẻ huyền thoại!",
    "imageUrl": "/assets/aiki-islands/island5_lesson1_hunting.jpg",
    "objective": "Trẻ chọn được chủ đề và liệt kê đủ mười hai thứ.",
    "skillLearned": "Chọn chủ đề riêng, và gỡ bí bằng cách đi hỏi đi nhìn chứ không hỏi AI.",
    "nextLessonSlug": "bai-5-2-phu-phep-mat-the",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-1-san-lung-bo-suu-tap-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.1 — Săn lùng Bộ sưu tập",
        "goalText": "Trẻ chọn được chủ đề và liệt kê đủ mười hai thứ.",
        "imageUrl": "/assets/aiki-islands/island5_lesson1_hunting.jpg",
        "speech": "Nami: AIKI ơi tớ muốn làm một bộ thẻ game bài nhưng nghĩ mãi chẳng biết chọn gì. Bạn bảo AI gợi ý chủ đề cho tớ với!\nAKI: Không được đâu Nami ơi! Ý tưởng phải là của cậu cơ! Đi hỏi, đi nhìn thế giới quanh mình chứ đừng hỏi AI. Bộ thẻ hay nhất là bộ thẻ về những thứ cậu yêu thích nhất!",
        "keyPoints": [
          "[1] CHỦ ĐỀ CỦA RIÊNG MÌNH — \"12 món ở hàng tạp hoá gần nhà Nami\": (Người khác cũng làm được, nhưng khó có bộ nào giống hệt)",
          "[2] BÍ THÌ ĐỨNG DẬY VÀ ĐI NHÌN — trong bếp · ngăn kéo của bà · góc bàn học · con ngõ trước nhà · trong cặp: (Đừng ngồi nhìn màn hình mãi)",
          "[3] HOẶC ĐI HỎI — bố mẹ, ông bà, một người bạn: (Ý tưởng ở ngay quanh mình mà trước giờ chưa để ý)",
          "[4] CÂU ĐỂ NHỚ — Bí thì đi nhìn, đi hỏi, rồi mới nhờ AKI giúp"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-1-san-lung-bo-suu-tap-stage2-confirm",
        "question": "Bí chưa nghĩ ra chủ đề, con nên làm gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Ngồi nhìn màn hình chờ ý tưởng",
            "imageUrl": "/assets/aiki-islands/island5_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Đứng dậy đi nhìn quanh nhà, hoặc đi hỏi một người",
            "imageUrl": "/assets/aiki-islands/island5_lesson1_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Nhờ AKI nghĩ hộ một chủ đề",
            "imageUrl": "/assets/aiki-islands/island5_lesson1_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Ý tưởng ở quanh con nhiều hơn con nghĩ đấy.",
        "speech": "Chưa đúng. Hãy đứng dậy đi nhìn, đi hỏi — rồi mới nhờ AKI giúp."
      },
      "stage3_video": {
        "id": "bai-5-1-san-lung-bo-suu-tap-stage3-video",
        "title": "Video bài giảng: Bài 5.1 — Săn lùng Bộ sưu tập",
        "videoUrl": "https://www.youtube.com/embed/CC8qli9iBD0",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island5_lesson1_hunting.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Nami: AIKI ơi tớ muốn làm một bộ thẻ game bài nhưng nghĩ mãi chẳng biết chọn gì. Bạn bảo AI gợi ý chủ đề cho tớ với!\nAKI: Không được đâu Nami ơi! Ý tưởng phải là của cậu cơ! Đi hỏi, đi nhìn thế giới quanh mình chứ đừng hỏi AI. Bộ thẻ hay nhất là bộ thẻ về những thứ cậu yêu thích nhất!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "QT1: Hãy nghĩ ý tưởng của cậu trước, rồi mới chia sẻ với AIKI! Săn lùng bộ sưu tập 12 thứ bằng cách quan sát và khám phá sở thích của chính mình!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Bây giờ đến lượt các cậu. Chọn một chủ đề thật gần gũi hoặc chủ đề cậu mê mẩn nhất. Liệt kê đủ 12 thứ. Đọc lại xem có món nào trùng hoặc nhạt nhòa không thì sửa lại nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-5-1-san-lung-bo-suu-tap-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 5.1 — Săn lùng Bộ sưu tập",
        "questions": [
          {
            "id": "bai-5-1-q1",
            "prompt": "Vì sao bộ thẻ “12 món ở hàng tạp hoá gần nhà” lại đặc biệt?",
            "options": [
              "A. Vì đó là những thứ chính con nhìn thấy mỗi ngày, khó có bộ nào giống hệt",
              "B. Vì hàng tạp hoá có nhiều đồ",
              "C. Vì đồ tạp hoá dễ vẽ"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Người khác cũng có thể làm bộ về hàng tạp hoá, nhưng không giống bộ của con.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-1-q2",
            "prompt": "Mười hai thứ trong bộ thẻ phải như thế nào?",
            "options": [
              "A. Cùng một nhóm",
              "B. Khác nhau hoàn toàn",
              "C. Cùng một màu"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Cùng nhóm thì mới so thẻ với nhau được.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-1-q3",
            "prompt": "Đọc lại danh sách, con kiểm tra điều gì?",
            "options": [
              "A. Có món nào trùng không, có món nào quá nhạt nhẽo không",
              "B. Có món nào đắt tiền không",
              "C. Có món nào màu đỏ không"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Sửa xong thì giữ thật kỹ danh sách này cho các bài sau.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-5-1-san-lung-bo-suu-tap-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 5.1 — Săn lùng Bộ sưu tập",
        "subjectName": "Bộ Sưu Tập 12 Thẻ Bài Nguyên Tố",
        "badge": "Bài 5.1",
        "illustrationType": "dragon-card",
        "lockedFeatures": [
          "lá bài 01 Rồng Băng Tinh Thể vảy pha lê lam",
          "khung viền nguyên tố băng tuyết bạc",
          "danh sách 12 linh thú cùng họ nguyên tố thần thoại"
        ],
        "akiMotto": "Một bộ thẻ bài huyền thoại bắt đầu từ chủ đề tự săn lùng và lá bài nguyên tố đầu tiên được trau chuốt tỉ mỉ!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Bộ Sưu\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Bộ Sưu",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Bộ Sưu lá bài 01 Rồng Băng Tinh Thể vảy pha lê lam",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Thẻ bài game ma thuật lá 01: Rồng Băng Tinh Thể vảy lam ngọc lấp lánh, viền bạc tuyết huyền thoại, khung thẻ bài TCG sắc nét",
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
        "sampleUrl": "/assets/aiki-islands/island5_lesson1_hunting.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Bộ sưu tập 12 món của tớ",
          "akiAdvice": "Bí thì đứng dậy đi nhìn — trong bếp, ngăn kéo của bà, góc bàn học, con ngõ trước nhà — hoặc đi hỏi một người. Chọn một chủ đề thật gần với mình nhé!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: Bộ sưu tập 12 món",
          "sampleTemplate": "Chủ đề của tớ: Những món đồ trong ngăn kéo của bà\n1. Chiếc kính lão gọng đồng   2. Cuộn chỉ ngũ sắc   3. Cúc áo ngọc bích   4. Chiếc kéo bấm hình chim sẻ\n5. Hộp dầu tràm thơm lừng    6. Thỏi sáp ong vàng óng  7. Thước dây mềm cuộn tròn  8. Chiếc chuông đồng tí hon\n9. Chiếc chìa khóa gỉ sét    10. Chiếc trâm cài tóc   11. Bút mực ngòi mạ vàng    12. Hạt ngọc trai phát sáng",
          "backpackCategory": "tcg-collection",
          "backpackTag": "Bộ sưu tập 12 món",
          "characterName": "Nhà sưu tập thẻ",
          "challengeSummary": [
            "Chọn một chủ đề thật gần với mình, hoặc chủ đề mình thích ơi là thích",
            "Tìm đủ 12 thứ cùng một nhóm",
            "Đọc lại cả danh sách: có món nào trùng không? có món nào quá nhạt nhẽo không?",
            "Bí thì đứng dậy đi nhìn — trong bếp, ngăn kéo của bà, góc bàn học, con ngõ trước nhà — hoặc đi hỏi một người"
          ],
          "checklist": [
            {
              "id": "cl-5-1-1",
              "label": "Chọn 1 chủ đề gần gũi"
            },
            {
              "id": "cl-5-1-2",
              "label": "Tìm đủ 12 thứ cùng một nhóm"
            },
            {
              "id": "cl-5-1-3",
              "label": "Đọc lại danh sách và không có món nào bị trùng hoặc quá nhạt"
            }
          ],
          "fields": [
            {
              "id": "collection-theme",
              "label": "Chủ đề của tớ",
              "prefix": "Chủ đề của tớ: ",
              "placeholder": "Ví dụ: Những món đồ trong ngăn kéo của bà / Thần thú rừng xanh...",
              "badge": "Bắt buộc",
              "helperTip": "💡 Chọn một chủ đề thật gần với mình hoặc chủ đề con thích mê",
              "rows": 1
            },
            {
              "id": "items-group-1",
              "label": "Nhóm 1 (Món 1 -> 4)",
              "prefix": "1. ……   2. ……   3. ……   4. ……",
              "placeholder": "1. Chiếc kính lão   2. Cuộn chỉ ngũ sắc   3. Cúc áo ngọc bích   4. Kéo bấm...",
              "rows": 2
            },
            {
              "id": "items-group-2",
              "label": "Nhóm 2 (Món 5 -> 8)",
              "prefix": "5. ……   6. ……   7. ……   8. ……",
              "placeholder": "5. Hộp dầu tràm   6. Thỏi sáp ong   7. Thước dây   8. Chuông đồng...",
              "rows": 2
            },
            {
              "id": "items-group-3",
              "label": "Nhóm 3 (Món 9 -> 12)",
              "prefix": "9. ……   10. ……  11. ……  12. ……",
              "placeholder": "9. Chìa khóa gỉ   10. Trâm cài   11. Bút mực vàng   12. Hạt ngọc trai...",
              "rows": 2
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-5-1-san-lung-bo-suu-tap-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 5.1 — Săn lùng Bộ sưu tập\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 5.1 — Săn lùng Bộ sưu tập",
          "iconUrl": "/assets/aiki-islands/island5_lesson1_hunting.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-5-2-phu-phep-mat-the"
      }
    }
  },
  {
    "id": "bai-5-2",
    "slug": "bai-5-2-phu-phep-mat-the",
    "islandNumber": 5,
    "lessonNumber": "5.2",
    "title": "Bài 5.2 — Phù phép Mặt thẻ",
    "subtitle": "Luật ngân sách 20 điểm: Bí quyết cân bằng trò chơi công bằng!",
    "imageUrl": "/assets/aiki-islands/island5_lesson2_stats.jpg",
    "objective": "Trẻ thiết kế mặt thẻ và cho điểm sao cho công bằng.",
    "skillLearned": "Cân bằng tổng điểm ba chỉ số.",
    "nextLessonSlug": "bai-5-3-khoa-the",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-2-phu-phep-mat-the-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.2 — Phù phép Mặt thẻ",
        "goalText": "Trẻ thiết kế mặt thẻ và cho điểm sao cho công bằng.",
        "imageUrl": "/assets/aiki-islands/island5_lesson2_stats.jpg",
        "speech": "Kora: Hôm trước tớ làm bộ thẻ rồi rủ bạn chơi. Lá Rồng Thần của tớ có Sức 10 – Nhanh 10 – Khéo 10! Ra trận là đè bẹp tất cả!\nAKI: Kết quả là chơi được hai ván bạn bè bỏ về hết đúng không? Vì chưa lật bài đã biết ai thắng rồi! Trò chơi mà không công bằng thì chẳng ai muốn chơi cả!",
        "keyPoints": [
          "[1] MỖI LÁ MỘT TÚI 12 ĐIỂM — chia vào ba ô: SỨC – NHANH – KHÉO: (12 dễ cộng và chia được nhiều kiểu: 8–2–2, 6–4–2, 5–5–2, 4–4–4)",
          "[2] LUẬT — Mạnh chỗ này thì phải bớt chỗ khác: (Không lá nào giỏi hết mọi thứ)",
          "[3] VÍ DỤ — chảo gang: Sức 8 – Nhanh 2 – Khéo 2  ·  đôi đũa: Sức 2 – Nhanh 6 – Khéo 4: (Hai lá khác hẳn nhau, tổng vẫn bằng 12)",
          "[4] MỖI LÁ GHI ĐỦ — Tên thẻ – Sức – Nhanh – Khéo – Tổng điểm – Kỹ năng riêng: (Lưu vào BẢNG THIẾT KẾ BỘ THẺ, nhớ chụp lại)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-2-phu-phep-mat-the-stage2-confirm",
        "question": "Mỗi lá thẻ được chia bao nhiêu điểm vào ba ô chỉ số?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Mỗi lá một số khác nhau cho phong phú",
            "imageUrl": "/assets/aiki-islands/island5_lesson2_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Tất cả các lá cùng một tổng điểm, ví dụ 12",
            "imageUrl": "/assets/aiki-islands/island5_lesson2_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Càng nhiều càng mạnh",
            "imageUrl": "/assets/aiki-islands/island5_lesson2_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Quan trọng là tất cả các lá phải có cùng một tổng điểm.",
        "speech": "Chưa đúng. Tổng điểm phải bằng nhau ở mọi lá thì mới công bằng."
      },
      "stage3_video": {
        "id": "bai-5-2-phu-phep-mat-the-stage3-video",
        "title": "Video bài giảng: Bài 5.2 — Phù phép Mặt thẻ",
        "videoUrl": "https://www.youtube.com/embed/PijX4EBOmkU",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island5_lesson2_stats.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Kora: Hôm trước tớ làm bộ thẻ rồi rủ bạn chơi. Lá Rồng Thần của tớ có Sức 10 – Nhanh 10 – Khéo 10! Ra trận là đè bẹp tất cả!\nAKI: Kết quả là chơi được hai ván bạn bè bỏ về hết đúng không? Vì chưa lật bài đã biết ai thắng rồi! Trò chơi mà không công bằng thì chẳng ai muốn chơi cả!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Trò chơi hay là trò chơi công bằng! Cả 12 lá bài đều phải có tổng điểm ba chỉ số bằng nhau! Có lá khỏe nhưng chậm, có lá nhanh nhẹn nhưng yếu sức!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Với từng lá bài trong 12 món, hãy ghi đủ: Tên thẻ – Sức – Nhanh – Khéo – Kỹ năng riêng. Nhớ cộng nhẩm kiểm tra: Cả 12 lá đều phải có tổng đúng bằng ngân sách quy định nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-5-2-phu-phep-mat-the-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 5.2 — Phù phép Mặt thẻ",
        "questions": [
          {
            "id": "bai-5-2-q1",
            "prompt": "Luật cân bằng của bài này là gì?",
            "options": [
              "A. Mạnh chỗ này thì phải bớt chỗ khác",
              "B. Lá nào cũng phải mạnh cả ba ô",
              "C. Lá nào cũng phải yếu cả ba ô"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Chảo gang Sức 8 nhưng Nhanh chỉ 2 — vì nó nặng.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-2-q2",
            "prompt": "Mỗi lá thẻ cần ghi đủ những gì?",
            "options": [
              "A. Tên thẻ – Sức – Nhanh – Khéo – Tổng điểm – Kỹ năng riêng",
              "B. Tên thẻ và một bức hình",
              "C. Tên thẻ và giá tiền"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Tất cả lưu vào Bảng thiết kế bộ thẻ, nhớ chụp lại cho bài sau.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-2-q3",
            "prompt": "Trò chơi hay là trò chơi như thế nào?",
            "options": [
              "A. Trò chơi mà chưa lật thẻ lên vẫn chưa biết chắc ai sẽ thắng",
              "B. Trò chơi mà mình luôn thắng",
              "C. Trò chơi có nhiều thẻ nhất"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Đó chính là ý nghĩa của công bằng.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-5-2-phu-phep-mat-the-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 5.2 — Phù phép Mặt thẻ",
        "subjectName": "Phù Phép Mặt Thẻ Ngân Sách 20 Điểm",
        "badge": "Bài 5.2",
        "illustrationType": "stat-budget",
        "lockedFeatures": [
          "luật ngân sách 20 điểm: Sức + Nhanh + Khéo <= 20",
          "chỉ số HP và ATK cân bằng công bằng",
          "khung kỹ năng riêng độc đáo"
        ],
        "akiMotto": "Luật ngân sách điểm số: Sức + Nhanh + Khéo bằng nhau cho cả 12 lá! Trò chơi hay là trò chơi công bằng!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Phù Phép\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Phù Phép",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Phù Phép luật ngân sách 20 điểm: Sức + Nhanh + Khéo <= 20",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Mặt thẻ bài game TCG: Rồng Băng với chỉ số cân bằng Sức 9 Nhanh 6 Khéo 5 tổng 20 điểm và kỹ năng Hơi Thở Băng Giá",
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
        "sampleUrl": "/assets/aiki-islands/island5_lesson2_stats.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Bảng thiết kế bộ thẻ của tớ",
          "akiAdvice": "Mỗi lá có cùng một túi điểm: đúng 12 điểm chia vào ba ô SỨC – NHANH – KHÉO. Mạnh chỗ này thì phải bớt chỗ khác. Không lá nào giỏi hết mọi thứ!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: 12 lá bài Tổng 12 điểm",
          "sampleTemplate": "Lá 1: Tên Sóc Bông · Sức 3 · Nhanh 6 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Nhảy vọt cành cây\nLá 2: Tên Gấu Bự · Sức 7 · Nhanh 2 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Đấm vỡ đá tảng\nLá 3: Tên Cáo Mẹo · Sức 2 · Nhanh 4 · Khéo 6 · Tổng 12 · Kỹ năng riêng: Ảo thuật đổi chỗ\nLá 4: Tên Nhím Gai · Sức 4 · Nhanh 3 · Khéo 5 · Tổng 12 · Kỹ năng riêng: Giáp gai phản đòn\n... (làm đủ đến Lá 12, mỗi lá Tổng điểm = đúng 12)",
          "backpackCategory": "tcg-balance",
          "backpackTag": "Bảng chỉ số thẻ bài",
          "characterName": "Nhà thiết kế game",
          "challengeSummary": [
            "Mỗi lá được phát đúng một túi 12 điểm, chia vào ba ô: SỨC – NHANH – KHÉO",
            "Luật: mạnh chỗ này thì phải bớt chỗ khác. Không lá nào giỏi hết mọi thứ",
            "Với từng lá ghi đủ: Tên thẻ – Sức – Nhanh – Khéo – Tổng điểm – Kỹ năng riêng",
            "Kiểm tra: cả 12 lá đều phải có tổng bằng 12. Có lá nào mạnh hết ba ô không? có lá nào yếu quá không?"
          ],
          "checklist": [
            {
              "id": "cl-5-2-1",
              "label": "Mỗi lá đủ: Tên, 3 chỉ số, Tổng 12, Kỹ năng riêng"
            },
            {
              "id": "cl-5-2-2",
              "label": "Cả 12 lá đều có Tổng điểm = đúng 12"
            },
            {
              "id": "cl-5-2-3",
              "label": "Không có lá nào quá mạnh hay quá yếu"
            }
          ],
          "fields": [
            {
              "id": "cards-tier-1",
              "label": "Lá 1 đến Lá 4",
              "prefix": "Lá 1 -> 4: Tên …… · Sức … · Nhanh … · Khéo … · Tổng 12 · Kỹ năng riêng: ……",
              "placeholder": "Lá 1: Tên Sóc Bông · Sức 3 · Nhanh 6 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Nhảy cành cây...",
              "badge": "Tổng = 12",
              "helperTip": "💡 Cả ba chỉ số Sức + Nhanh + Khéo cộng lại BẮT BUỘC bằng đúng 12",
              "rows": 4
            },
            {
              "id": "cards-tier-2",
              "label": "Lá 5 đến Lá 8",
              "prefix": "Lá 5 -> 8: Tên …… · Sức … · Nhanh … · Khéo … · Tổng 12 · Kỹ năng riêng: ……",
              "placeholder": "Lá 5: Tên Cáo Lửa · Sức 4 · Nhanh 5 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Phun lửa...",
              "badge": "Tổng = 12",
              "helperTip": "💡 Mạnh chỗ này thì phải bớt chỗ khác, không có lá nào giỏi cả ba ô",
              "rows": 4
            },
            {
              "id": "cards-tier-3",
              "label": "Lá 9 đến Lá 12",
              "prefix": "Lá 9 -> 12: Tên …… · Sức … · Nhanh … · Khéo … · Tổng 12 · Kỹ năng riêng: ……",
              "placeholder": "Lá 9: Tên Rồng Băng · Sức 6 · Nhanh 3 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Hơi thở băng...",
              "badge": "Tổng = 12",
              "helperTip": "💡 Kiểm tra lại: Không có lá nào quá mạnh hay quá yếu",
              "rows": 4
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-5-2-phu-phep-mat-the-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 5.2 — Phù phép Mặt thẻ\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 5.2 — Phù phép Mặt thẻ",
          "iconUrl": "/assets/aiki-islands/island5_lesson2_stats.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-5-3-khoa-the"
      }
    }
  },
  {
    "id": "bai-5-3",
    "slug": "bai-5-3-khoa-the",
    "islandNumber": 5,
    "lessonNumber": "5.3",
    "title": "Bài 5.3 — Khoá thẻ",
    "subtitle": "Khóa công thức nền và mặt lưng ma thuật đồng nhất 100%!",
    "imageUrl": "/assets/aiki-islands/island5_lesson3_lockcards.jpg",
    "objective": "Trẻ tạo được mười hai hình cùng một phong cách.",
    "skillLearned": "Công thức nền chung, app tự dán vào mọi câu lệnh, cậu chỉ gõ phần riêng.",
    "nextLessonSlug": "bai-5-4-luat-choi",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-3-khoa-the-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.3 — Khoá thẻ",
        "goalText": "Trẻ tạo được mười hai hình cùng một phong cách.",
        "imageUrl": "/assets/aiki-islands/island5_lesson3_lockcards.jpg",
        "speech": "Riko: Hôm trước tớ tạo liền mười hai hình thẻ bài, hình nào cũng đẹp mê li! Nhưng xếp cạnh nhau thì... ơ? Lá này giống tranh màu nước, lá kia lại giống hoạt hình 3D, lá nền đen lá nền trắng!\nAKI: 12 hình đẹp nhưng cứ như thuộc 12 bộ bài khác nhau ấy Riko ơi! Thẻ bài chuyên nghiệp là nhìn lướt qua phải biết ngay cùng một bộ chứ!",
        "keyPoints": [
          "[1] LÀM MỘT LÁ MẪU — chọn một món, làm thật cẩn thận đến khi ưng: (Giữ bức ấy làm Ảnh mẫu của bộ thẻ)",
          "[2] CÔNG THỨC NỀN — PHONG CÁCH – NỀN – GÓC NHÌN – KHUNG VIỀN: (Ví dụ: nét truyện tranh rõ màu phẳng – nền vàng nhạt – nhìn ngang vật ở giữa – khung bo tròn)",
          "[3] PHẦN RIÊNG · CÁCH 1 — tả bằng chữ: \"một cái rổ nhựa màu xanh, có quai, đan thưa\"",
          "[4] PHẦN RIÊNG · CÁCH 2 — chụp ảnh món đồ thật trong nhà rồi bảo AKI vẽ lại theo phong cách thẻ mẫu: (Chỉ chụp đồ vật, tránh để người hay thông tin riêng trong ảnh)",
          "[5] CÂU ĐỂ NHỚ — Ảnh mẫu giữ cả bộ cùng kiểu · Công thức nền giữ thứ không đổi · Chỉ thay phần riêng"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-3-khoa-the-stage2-confirm",
        "question": "Để cả mười hai lá nhìn như một bộ, con cần những gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Chỉ cần ảnh mẫu là đủ",
            "imageUrl": "/assets/aiki-islands/island5_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Ảnh mẫu VÀ công thức nền bốn thứ",
            "imageUrl": "/assets/aiki-islands/island5_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Chỉ cần tả thật dài cho mỗi lá",
            "imageUrl": "/assets/aiki-islands/island5_lesson3_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Ảnh mẫu cho AKI thấy bộ thẻ trông thế nào, công thức cho biết những gì không được đổi.",
        "speech": "Chưa đúng. Chỉ ảnh mẫu thôi vẫn chưa đủ."
      },
      "stage3_video": {
        "id": "bai-5-3-khoa-the-stage3-video",
        "title": "Video bài giảng: Bài 5.3 — Khoá thẻ",
        "videoUrl": "https://www.youtube.com/embed/StQ4ICE15No",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island5_lesson3_lockcards.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Riko: Hôm trước tớ tạo liền mười hai hình thẻ bài, hình nào cũng đẹp mê li! Nhưng xếp cạnh nhau thì... ơ? Lá này giống tranh màu nước, lá kia lại giống hoạt hình 3D, lá nền đen lá nền trắng!\nAKI: 12 hình đẹp nhưng cứ như thuộc 12 bộ bài khác nhau ấy Riko ơi! Thẻ bài chuyên nghiệp là nhìn lướt qua phải biết ngay cùng một bộ chứ!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Khóa thẻ bằng hai bảo bối: 1. Mặt trước dùng chung một CÔNG THỨC NỀN! 2. Mặt lưng phải GIỐNG HỆT NHAU 100% và đối xứng tâm để đảm bảo tính bí mật và công bằng!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Đầu tiên, chọn một món làm lá mẫu. Sau đó ghi lại Công thức nền. Tạo đủ 12 lá và kiểm tra: Có lá nào bị lạc không? Xong xuôi ghép vào khuôn thẻ và khóa mặt lưng bánh răng ma thuật nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-5-3-khoa-the-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 5.3 — Khoá thẻ",
        "questions": [
          {
            "id": "bai-5-3-q1",
            "prompt": "Công thức nền gồm bốn thứ nào?",
            "options": [
              "A. Phong cách – Nền – Góc nhìn – Khung viền",
              "B. Màu – Nét – Bóng – Kích thước",
              "C. Tên – Điểm – Kỹ năng – Hình"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Bốn thứ này không đổi suốt cả bộ.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-3-q2",
            "prompt": "Ngoài tả bằng chữ, con còn cách nào để làm phần riêng của một lá?",
            "options": [
              "A. Chụp ảnh món đồ thật trong nhà rồi nhờ AKI vẽ lại theo phong cách thẻ mẫu",
              "B. Vẽ tay rồi scan",
              "C. Không có cách nào khác"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Nhớ chỉ chụp đồ vật rõ ràng, tránh để người hay thông tin riêng xuất hiện trong ảnh.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-3-q3",
            "prompt": "“Lá lạc” là gì?",
            "options": [
              "A. Lá khác kiểu vẽ, khác nền, khác góc nhìn hoặc khác khung so với cả bộ",
              "B. Lá bị mất",
              "C. Lá có điểm cao nhất"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Thấy lá lạc thì sửa câu lệnh rồi mới tạo lại.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-5-3-khoa-the-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 5.3 — Khoá thẻ",
        "subjectName": "Khóa Lưng Thẻ Bánh Răng Ma Thuật",
        "badge": "Bài 5.3",
        "illustrationType": "magic-gear-back",
        "lockedFeatures": [
          "Bộ sưu tập: Bếp nhà tớ (12 món) · Ngăn kéo của bà (12 món) · Hàng tạp hoá đầu ngõ (12 món)",
          "Phong cách: Nét truyện tranh · Màu nước",
          "Công thức nền: Phong cách – Nền – Góc nhìn – Khung viền giữ cố định, chỉ thay phần riêng"
        ],
        "akiMotto": "Ảnh mẫu giữ cả bộ cùng kiểu · Công thức nền giữ thứ không đổi · Chỉ thay phần riêng của từng lá bài!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Khóa Lưng\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Khóa Lưng",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Khóa Lưng mặt lưng họa tiết bánh răng vàng kim đối xứng tâm 100%",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Mặt lưng thẻ bài game đối xứng tâm hoàn hảo: họa tiết bánh răng vàng kim và vòng tròn ma thuật cổ ngữ nền lam thẫm huyền bí",
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
        "sampleUrl": "/assets/aiki-islands/island5_lesson3_lockcards.jpg",
        "creativeEngineMode": "style-prism",
        "stylePrismOptions": [
          {
            "id": "comic",
            "name": "Nét truyện tranh",
            "icon": "🎨",
            "desc": "Nét đen rõ, màu phẳng, nền vàng nhạt, nhìn ngang, khung bo tròn",
            "promptStyle": "phong cách nét truyện tranh nét đen rõ màu phẳng nền vàng nhạt nhìn ngang khung bo tròn"
          },
          {
            "id": "watercolor",
            "name": "Màu nước",
            "icon": "🖌️",
            "desc": "Viền mềm loang nhẹ, nền giấy kraft nâu, nhìn chéo 45 độ, không khung chừa lề trắng",
            "promptStyle": "phong cách màu nước viền mềm loang nhẹ nền giấy kraft nâu nhìn chéo 45 độ"
          }
        ],
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Cái chảo gang",
            "icon": "🍳",
            "emoji": "🍳",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 2,
            "title": "Đôi đũa tre",
            "icon": "🥢",
            "emoji": "🥢",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 3,
            "title": "Cái rổ nhựa xanh",
            "icon": "🧺",
            "emoji": "🧺",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 4,
            "title": "Nồi cơm điện",
            "icon": "🍚",
            "emoji": "🍚",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 5,
            "title": "Chai nước mắm",
            "icon": "🍾",
            "emoji": "🍾",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 6,
            "title": "Lọ muối",
            "icon": "🧂",
            "emoji": "🧂",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 7,
            "title": "Cái thớt gỗ",
            "icon": "🪵",
            "emoji": "🪵",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 8,
            "title": "Muôi canh",
            "icon": "🥄",
            "emoji": "🥄",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 9,
            "title": "Hộp tăm",
            "icon": "📦",
            "emoji": "📦",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 10,
            "title": "Khăn lau bếp",
            "icon": "🧻",
            "emoji": "🧻",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 11,
            "title": "Bát sứ trắng",
            "icon": "🥣",
            "emoji": "🥣",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          },
          {
            "partNumber": 12,
            "title": "Ấm đun nước",
            "icon": "🫖",
            "emoji": "🫖",
            "iconImage": "/assets/pregenerated-fallback/card-forge/card_frost_dragon_v1.webp"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-5-3-khoa-the-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 5.3 — Khoá thẻ\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 5.3 — Khoá thẻ",
          "iconUrl": "/assets/aiki-islands/island5_lesson3_lockcards.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-5-4-luat-choi"
      }
    }
  },
  {
    "id": "bai-5-4",
    "slug": "bai-5-4-luat-choi",
    "islandNumber": 5,
    "lessonNumber": "5.4",
    "title": "Bài 5.4 — Luật chơi",
    "subtitle": "Bộ đôi tương khắc và 5 phần cốt lõi của một bộ luật rõ ràng!",
    "imageUrl": "/assets/aiki-islands/island5_lesson4_rules.jpg",
    "objective": "Trẻ viết được bộ luật rõ ràng và biết sửa nó sau khi chơi thử.",
    "skillLearned": "Năm phần của một bộ luật: mấy người, ai đi trước, mỗi lượt làm gì, so thẻ thế nào, khi nào thắng.",
    "nextLessonSlug": "bai-5-5-dau-truong-khai-mo",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-4-luat-choi-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.4 — Luật chơi",
        "goalText": "Trẻ viết được bộ luật rõ ràng và biết sửa nó sau khi chơi thử.",
        "imageUrl": "/assets/aiki-islands/island5_lesson4_rules.jpg",
        "speech": "Tomi: Hôm trước tớ mang bộ thẻ bài ra rủ cả nhà chơi. Bố hỏi: 'Mấy người chơi được?' Mẹ hỏi: 'Ai đi trước?' Em lại hỏi: 'Hai lá bằng điểm thì sao hả anh?' Tớ cứ ấp úng chẳng biết trả lời thế nào, thế là cãi nhau to!\nAKI: Thẻ đẹp đến mấy mà không có luật rõ ràng thì cũng không chơi được Tomi ơi! Luật chơi chính là linh hồn của trò chơi đấy!",
        "keyPoints": [
          "[1] CÓ MẤY NGƯỜI CHƠI? — \"Hai đến bốn người\": (Câu hỏi 1)",
          "[2] AI ĐI TRƯỚC? — \"Ai sinh nhật gần nhất đi trước\": (Câu hỏi 2)",
          "[3] MỖI LƯỢT LÀM GÌ? — \"Mỗi người lật một lá, người đi trước chọn Sức, Nhanh hoặc Khéo\": (Câu hỏi 3)",
          "[4] SO THẺ THẾ NÀO? — \"Ai điểm cao nhất thì lấy các lá. Nếu bằng nhau thì để giữa bàn\": (Câu hỏi 4 — chỗ hay phải bổ sung nhất)",
          "[5] KHI NÀO KẾT THÚC? — \"Khi hết bài, ai có nhiều lá nhất thì thắng\": (Câu hỏi 5)",
          "[6] CÂU ĐỂ NHỚ — Nói luật của cậu trước – AKI giúp viết cho rõ – rồi phải chơi thử"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-4-luat-choi-stage2-confirm",
        "question": "Vai trò của AKI trong bài này là gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. AKI nghĩ ra luật chơi cho con",
            "imageUrl": "/assets/aiki-islands/island5_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. AKI chỉ sắp xếp và viết lại cho dễ đọc, không tự thêm luật mới",
            "imageUrl": "/assets/aiki-islands/island5_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. AKI chấm điểm bộ luật của con",
            "imageUrl": "/assets/aiki-islands/island5_lesson4_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Ý tưởng là của con, AKI chỉ giúp viết cho rõ.",
        "speech": "Chưa đúng. Con quyết định luật — AKI chỉ giúp viết cho rõ hơn."
      },
      "stage3_video": {
        "id": "bai-5-4-luat-choi-stage3-video",
        "title": "Video bài giảng: Bài 5.4 — Luật chơi",
        "videoUrl": "https://www.youtube.com/embed/VIGcrhPzr5Q",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island5_lesson4_rules.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Tomi: Hôm trước tớ mang bộ thẻ bài ra rủ cả nhà chơi. Bố hỏi: 'Mấy người chơi được?' Mẹ hỏi: 'Ai đi trước?' Em lại hỏi: 'Hai lá bằng điểm thì sao hả anh?' Tớ cứ ấp úng chẳng biết trả lời thế nào, thế là cãi nhau to!\nAKI: Thẻ đẹp đến mấy mà không có luật rõ ràng thì cũng không chơi được Tomi ơi! Luật chơi chính là linh hồn của trò chơi đấy!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Luật chơi là linh hồn của trò chơi! Chỉ cần trả lời đủ 5 câu hỏi: 1. Mấy người chơi? 2. Ai đi trước? 3. Mỗi lượt làm gì? 4. So thẻ thế nào (tương khắc)? 5. Khi nào kết thúc và ai thắng!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Hãy trả lời đủ 5 câu hỏi bằng lời của mình, rồi rủ một người trong nhà chơi thử ngay một ván! Chỗ nào họ phải dừng lại hỏi hoặc cãi nhau thì đánh dấu bút đỏ, sửa lại luật cho rõ ràng rồi in ra nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-5-4-luat-choi-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 5.4 — Luật chơi",
        "questions": [
          {
            "id": "bai-5-4-q1",
            "prompt": "Một bộ luật cần trả lời mấy câu hỏi?",
            "options": [
              "A. Năm câu",
              "B. Ba câu",
              "C. Mười câu"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Mấy người chơi · ai đi trước · mỗi lượt làm gì · so thẻ thế nào · khi nào kết thúc và ai thắng.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-4-q2",
            "prompt": "Vì sao viết luật xong vẫn phải đem ra chơi thử?",
            "options": [
              "A. Vì chơi thử mới lộ ra những câu chưa rõ, ví dụ ba người cùng bằng điểm thì sao",
              "B. Vì chơi thử cho vui",
              "C. Vì AKI yêu cầu"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Chỗ nào người chơi phải dừng lại hỏi thì đánh dấu và bổ sung.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-4-q3",
            "prompt": "Câu để nhớ của bài này là gì?",
            "options": [
              "A. Nói luật của cậu trước – AKI giúp viết cho rõ – rồi phải chơi thử",
              "B. Luật càng dài càng tốt",
              "C. Cứ chơi rồi tính sau"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Luật chưa chơi thử thì chưa phải luật hoàn chỉnh.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-5-4-luat-choi-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 5.4 — Luật chơi",
        "subjectName": "Bộ Đôi Thẻ Tương Khắc & Bộ Luật 5 Phần",
        "badge": "Bài 5.4",
        "illustrationType": "elemental-duo",
        "lockedFeatures": [
          "bộ đôi thẻ bài tương khắc Lửa và Nước",
          "vòng tròn mũi tên nguyên tố đối kháng",
          "bảng 5 câu hỏi luật chơi chuẩn chỉnh"
        ],
        "akiMotto": "Luật chơi là linh hồn của trò chơi! 5 câu hỏi luật chơi rõ ràng và quy tắc tương khắc giúp trận đấu kịch tính đến phút cuối!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Bộ Đôi\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Bộ Đôi",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Bộ Đôi bộ đôi thẻ bài tương khắc Lửa và Nước",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Bộ đôi thẻ bài ma thuật tương khắc Lửa và Nước: Phượng Hoàng Lửa đối đầu Thủy Long với vòng tròn mũi tên nguyên tố",
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
        "sampleUrl": "/assets/aiki-islands/island5_lesson4_rules.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Luật chơi của tớ",
          "akiAdvice": "Nói luật của cậu trước – AIKI giúp viết cho rõ – rồi phải chơi thử. Luật chưa chơi thử thì chưa phải luật hoàn chỉnh!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: 5 câu hỏi vàng & Thử nghiệm",
          "sampleTemplate": "1. Có mấy người chơi: 2 người chơi đấu kháng\n2. Ai đi trước: Người đổ xúc xắc điểm cao hơn được đi trước\n3. Mỗi lượt người chơi làm gì: Lần lượt rút 1 thẻ trên tay và tung xúc xắc chọn chỉ số so tài\n4. So thẻ thế nào, nếu bằng nhau thì sao: Ai có điểm chỉ số cao hơn ăn thẻ của đối thủ; nếu bằng điểm thì mỗi bên rút thêm 1 thẻ để so tiếp\n5. Khi nào kết thúc và ai thắng: Ai ăn được 5 thẻ của đối thủ trước là người chiến thắng\nChỗ cả nhà phải dừng lại hỏi khi chơi thử: Khi tung vào mặt ngôi sao xúc xắc chưa biết tính sao, tớ đã bổ sung: Mặt sao được cộng thêm 3 điểm vào chỉ số bất kỳ!",
          "backpackCategory": "game-rules",
          "backpackTag": "Luật chơi 5 câu",
          "characterName": "Trọng tài game",
          "challengeSummary": [
            "Trả lời đủ 5 câu hỏi bằng lời của mình, ngắn cũng được",
            "Rồi nhờ AIKI viết lại thành một bộ luật ngắn, dễ hiểu — AIKI chỉ sắp xếp cho rõ, không tự thêm luật mới",
            "Rủ ít nhất một người trong nhà chơi thử",
            "Chỗ nào họ phải dừng lại hỏi “Tiếp theo làm gì?” hay “Thế này tính sao?” thì đánh dấu lại, bổ sung rồi nhờ AIKI sửa lần nữa"
          ],
          "checklist": [
            {
              "id": "cl-5-4-1",
              "label": "Trả lời đủ 5 câu hỏi luật chơi bằng lời của mình"
            },
            {
              "id": "cl-5-4-2",
              "label": "Rủ ít nhất 1 người nhà chơi thử thật một ván"
            },
            {
              "id": "cl-5-4-3",
              "label": "Ghi lại chỗ người nhà thắc mắc và đã bổ sung sửa luật"
            }
          ],
          "fields": [
            {
              "id": "q1-players",
              "label": "1. Có mấy người chơi?",
              "prefix": "1. Có mấy người chơi: ",
              "placeholder": "2 người chơi, hoặc 2-4 người...",
              "rows": 2
            },
            {
              "id": "q2-who-first",
              "label": "2. Ai đi trước?",
              "prefix": "2. Ai đi trước: ",
              "placeholder": "Oẳn tù tì, người đổ xúc xắc cao hơn...",
              "rows": 2
            },
            {
              "id": "q3-turn-action",
              "label": "3. Mỗi lượt người chơi làm gì?",
              "prefix": "3. Mỗi lượt người chơi làm gì: ",
              "placeholder": "Rút thẻ, tung xúc xắc, so điểm...",
              "rows": 2
            },
            {
              "id": "q4-compare-cards",
              "label": "4. So thẻ thế nào, nếu bằng nhau thì sao?",
              "prefix": "4. So thẻ thế nào, nếu bằng nhau thì sao: ",
              "placeholder": "So chỉ số Sức/Nhanh/Khéo, nếu bằng điểm thì...",
              "rows": 2
            },
            {
              "id": "q5-win-end",
              "label": "5. Khi nào kết thúc và ai thắng?",
              "prefix": "5. Khi nào kết thúc và ai thắng: ",
              "placeholder": "Ai hết bài trước, ai gom đủ điểm trước...",
              "rows": 2
            },
            {
              "id": "q6-test-play-notes",
              "label": "Chỗ cả nhà phải dừng lại hỏi khi chơi thử",
              "prefix": "Chỗ cả nhà phải dừng lại hỏi khi chơi thử: ",
              "placeholder": "Ghi lại chỗ mọi người dừng lại hỏi và luật con đã bổ sung...",
              "badge": "Bước quan trọng nhất",
              "helperTip": "💡 Rủ người nhà chơi thử thật một ván! Chỗ nào bị dừng lại hỏi thì ghi vào đây rồi sửa luật",
              "rows": 3
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-5-4-luat-choi-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 5.4 — Luật chơi\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 5.4 — Luật chơi",
          "iconUrl": "/assets/aiki-islands/island5_lesson4_rules.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-5-5-dau-truong-khai-mo"
      }
    }
  },
  {
    "id": "bai-5-5",
    "slug": "bai-5-5-dau-truong-khai-mo",
    "islandNumber": 5,
    "lessonNumber": "5.5",
    "title": "Bài 5.5 — Đấu trường khai mở",
    "subtitle": "Bàn cờ 4 thành phần, vỏ hộp game và khai mạc giải đấu gia đình!",
    "imageUrl": "/assets/aiki-islands/island5_lesson5_arena.jpg",
    "objective": "Trẻ hoàn thiện bộ game và chơi thật với gia đình.",
    "skillLearned": "Thiết kế bàn cờ bốn thành phần và vỏ hộp gấp được.",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-5-dau-truong-khai-mo-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.5 — Đấu trường khai mở",
        "goalText": "Trẻ hoàn thiện bộ game và chơi thật với gia đình.",
        "imageUrl": "/assets/aiki-islands/island5_lesson5_arena.jpg",
        "speech": "Dori: AIKI ơi xem bàn cờ tớ vẽ này: có đường đi ngoằn ngoèo, có ô số vẽ đẹp lắm! Cả nhà chơi được một lúc thì bố hỏi: 'Ơ thế đi đến đâu thì thắng hả con?' Tớ nhìn lại... quên mất ô Đích!\nAKI: Ha ha! Giống như chạy thi mà không có vạch đích thì chạy vòng quanh mãi sao được! Trước khi làm, tớ dẫn các cậu đến Kho Trò Chơi Ngủ Quên nhé!",
        "keyPoints": [
          "[1] XUẤT PHÁT — nơi bắt đầu: (Thành phần 1)",
          "[2] ĐƯỜNG ĐI — cho mình biết phải đi thế nào: (Thành phần 2)",
          "[3] Ô ĐẶC BIỆT ⭐ — \"MÈO CƯỚP ĐỒ ĂN – bỏ một lượt để đuổi mèo\": (Chỗ vui nhất — tự nghĩ luật riêng, lấy từ một chuyện vui trong nhà mình)",
          "[4] ĐÍCH — cho biết khi nào kết thúc: (Thành phần 4 — nhà Dori quên mất ô này, cả nhà cứ đi vòng vòng mãi)",
          "[5] VỎ HỘP — cất 12 thẻ, bàn cờ và luật chơi: (Phần in, cắt, gấp khó thì nhờ người lớn giúp)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-5-dau-truong-khai-mo-stage2-confirm",
        "question": "Một bàn cờ cần đủ bốn thứ nào?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Xuất phát – Đường đi – Ô đặc biệt – Đích",
            "imageUrl": "/assets/aiki-islands/island5_lesson5_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Tên – Hình – Màu – Viền",
            "imageUrl": "/assets/aiki-islands/island5_lesson5_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Thẻ – Xúc xắc – Quân cờ – Hộp",
            "imageUrl": "/assets/aiki-islands/island5_lesson5_opt_c.jpg"
          }
        ],
        "correctIndex": 0,
        "explanation": "Đúng! Nhà Dori quên mất ô ĐÍCH nên cả nhà cứ đi vòng vòng mãi.",
        "speech": "Chưa đúng. Bốn thứ là: xuất phát, đường đi, ô đặc biệt, đích."
      },
      "stage3_video": {
        "id": "bai-5-5-dau-truong-khai-mo-stage3-video",
        "title": "Video bài giảng: Bài 5.5 — Đấu trường khai mở",
        "videoUrl": "https://www.youtube.com/embed/6A1l9ybJu-Q",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island5_lesson5_arena.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Dori: AIKI ơi xem bàn cờ tớ vẽ này: có đường đi ngoằn ngoèo, có ô số vẽ đẹp lắm! Cả nhà chơi được một lúc thì bố hỏi: 'Ơ thế đi đến đâu thì thắng hả con?' Tớ nhìn lại... quên mất ô Đích!\nAKI: Ha ha! Giống như chạy thi mà không có vạch đích thì chạy vòng quanh mãi sao được! Trước khi làm, tớ dẫn các cậu đến Kho Trò Chơi Ngủ Quên nhé!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "QT3: Sản phẩm làm ra phải có giá trị và mang lại niềm vui cho ai đó! Trò chơi chỉ thật sự hoàn thành khi được mang ra chơi thật với cả nhà chứ không phải cất vào ngăn kéo!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Chúc mừng các Nhà phát minh trò chơi đại tài! Bước cuối cùng và quan trọng nhất: Rủ cả nhà chơi một ván thật, quay clip kỷ niệm ba mươi giây và cùng nâng cúp vô địch nhé! Các cậu đã chính thức tốt nghiệp khóa học AI Kids xuất sắc! Tớ tự hào về các cậu!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-5-5-dau-truong-khai-mo-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 5.5 — Đấu trường khai mở",
        "questions": [
          {
            "id": "bai-5-5-q1",
            "prompt": "Ô đặc biệt nên lấy ý từ đâu?",
            "options": [
              "A. Từ một chuyện vui có thật trong nhà mình",
              "B. Từ gợi ý của AKI",
              "C. Từ trò chơi bán ngoài hàng"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Nhà Dori có chú mèo hay nhảy lên bàn ăn nên có ô “MÈO CƯỚP ĐỒ ĂN – bỏ một lượt để đuổi mèo”.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-5-q2",
            "prompt": "Bước quan trọng nhất của bài cuối là gì?",
            "options": [
              "A. Rủ cả nhà chơi một ván thật từ đầu đến cuối",
              "B. In bàn cờ thật đẹp",
              "C. Đặt tên cho trò chơi"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Trong lúc chơi, chỗ nào chưa hiểu hay còn tranh luận thì sửa lại.",
            "visualUrl": ""
          },
          {
            "id": "bai-5-5-q3",
            "prompt": "Hai câu của chương cuối là gì?",
            "options": [
              "A. Trò chơi hay là trò chơi công bằng · Trò chơi chỉ thật sự hoàn thành khi có người chơi nó",
              "B. Trò chơi hay là trò chơi khó · Trò chơi đẹp là trò chơi nhiều màu",
              "C. Trò chơi hay là trò chơi nhanh · Trò chơi đẹp là trò chơi to"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Một trò chơi không phải để nằm đẹp trong hộp.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-5-5-dau-truong-khai-mo-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 5.5 — Đấu trường khai mở",
        "subjectName": "Đấu Trường Bàn Cờ Thần Thoại & Cúp Vô Địch",
        "badge": "Bài 5.5",
        "illustrationType": "board-game-arena",
        "lockedFeatures": [
          "bàn cờ A3 đủ 4 thành phần: Xuất phát - Đường đi - Ô đặc biệt - Đích",
          "vỏ hộp game gấp được đựng trọn bộ 12 thẻ",
          "cúp vô địch giải đấu gia đình"
        ],
        "akiMotto": "Sản phẩm chỉ thật sự hoàn thành khi được mang ra chơi thật với cả nhà! Khai mạc giải đấu gia đình và cùng cười thật to nhé!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Đấu Trường\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Đấu Trường",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Đấu Trường bàn cờ A3 đủ 4 thành phần: Xuất phát - Đường đi - Ô đặc biệt - Đích",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Bàn cờ A3 Đấu trường thần thoại với vạch xuất phát, đường đi ziczac, ô sự kiện kho báu và ô đích vinh quang cùng cúp vàng chiến thắng",
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
        "sampleUrl": "/assets/aiki-islands/island5_lesson5_arena.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Bàn cờ và ván chơi thật của tớ",
          "akiAdvice": "Trò chơi hay là trò chơi công bằng. Trò chơi chỉ thật sự hoàn thành khi có người chơi nó. Vì một trò chơi không phải để nằm đẹp trong hộp. Nó được làm ra để mọi người cùng chơi!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: Bàn cờ và ván chơi thật",
          "sampleTemplate": "Xuất phát: Ô Cổng Làng Rừng Sồi, mỗi người chọn một quân cờ hạt dẻ\nĐường đi: 20 ô, đánh số từ 1 đến 20 quanh bờ hồ Mùa Thu\nÔ đặc biệt của tớ: “MÈO CƯỚP ĐỒ ĂN” ở ô số 7 — luật: Bị mèo quấy rầy, phải bỏ một lượt để đuổi mèo\nĐích: Lâu đài Quả Sồi Vàng ở ô 20, ai về đích trước là người chiến thắng\nSau khi chơi thử với cả nhà, tớ đã sửa: Bố bảo đường đi hơi ngắn, tớ đã thêm ô số 12 \"Cơn lốc xoáy\" lùi lại 2 bước để gay cấn hơn!",
          "backpackCategory": "board-game",
          "backpackTag": "Bàn cờ sáng tạo",
          "characterName": "Kiến trúc sư bàn cờ",
          "challengeSummary": [
            "Làm bàn cờ đủ bốn thứ: XUẤT PHÁT – ĐƯỜNG ĐI – Ô ĐẶC BIỆT – ĐÍCH. (Nhà Dori quên mất ô ĐÍCH nên cả nhà cứ đi vòng vòng mãi)",
            "Ô đặc biệt là chỗ vui nhất — tự nghĩ luật riêng, tốt nhất lấy từ một chuyện vui trong nhà mình",
            "Làm vỏ hộp để cất 12 thẻ, bàn cờ và luật chơi. Phần in, cắt hoặc gấp khó thì nhờ người lớn giúp",
            "Rồi rủ cả nhà chơi một ván thật từ đầu đến cuối. Chỗ nào chưa hiểu, chưa vui hoặc còn tranh luận thì sửa lại"
          ],
          "checklist": [
            {
              "id": "cl-5-5-1",
              "label": "Bàn cờ đủ 4 thứ: Xuất phát – Đường đi – Ô đặc biệt – Đích"
            },
            {
              "id": "cl-5-5-2",
              "label": "Ô đặc biệt có luật riêng lấy từ chuyện trong nhà"
            },
            {
              "id": "cl-5-5-3",
              "label": "Đã chơi thử 1 ván thật với cả nhà và ghi lại chỗ đã sửa"
            }
          ],
          "fields": [
            {
              "id": "board-start",
              "label": "1. Xuất phát",
              "prefix": "Xuất phát: ",
              "placeholder": "Cổng làng, vị trí xuất phát, quân cờ...",
              "rows": 2
            },
            {
              "id": "board-path",
              "label": "2. Đường đi",
              "prefix": "Đường đi: ",
              "placeholder": "…… ô, đánh số từ 1 đến ……",
              "rows": 2
            },
            {
              "id": "board-special",
              "label": "3. Ô đặc biệt & luật riêng",
              "prefix": "Ô đặc biệt của tớ: “……” — luật: ",
              "placeholder": "Tên ô đặc biệt và luật chơi...",
              "badge": "Chỗ vui nhất",
              "helperTip": "💡 Tự nghĩ luật riêng, tốt nhất lấy từ một chuyện vui có thật trong nhà mình",
              "rows": 3
            },
            {
              "id": "board-finish",
              "label": "4. Đích",
              "prefix": "Đích: ",
              "placeholder": "Ô về đích, điều kiện chiến thắng...",
              "rows": 2
            },
            {
              "id": "board-playtest-revision",
              "label": "Sau khi chơi thử với cả nhà, tớ đã sửa...",
              "prefix": "Sau khi chơi thử với cả nhà, tớ đã sửa: ",
              "placeholder": "Chỗ mọi người thắc mắc hoặc chưa hiểu và cách con sửa lại...",
              "badge": "Quan trọng",
              "helperTip": "💡 Rủ cả nhà chơi 1 ván thật từ đầu đến cuối và ghi lại điểm cải tiến",
              "rows": 3
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-5-5-dau-truong-khai-mo-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 5.5 — Đấu trường khai mở\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 5.5 — Đấu trường khai mở",
          "iconUrl": "/assets/aiki-islands/island5_lesson5_arena.jpg",
          "stars": 3,
          "xp": 50
        }
      }
    }
  }
]
