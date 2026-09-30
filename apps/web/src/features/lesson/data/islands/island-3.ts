import type { IslandCurriculumLesson } from "./types"

export const ISLAND_3_LESSONS: IslandCurriculumLesson[] = [
  {
    "id": "bai-3-1",
    "slug": "bai-3-1-ho-so-biet-doi",
    "islandNumber": 3,
    "lessonNumber": "3.1",
    "title": "Bài 3.1 — Hồ sơ biệt đội",
    "subtitle": "Bảng ADN 6 ô: Bí quyết để nhân vật có linh hồn!",
    "imageUrl": "/assets/aiki-islands/island3_lesson1_profile.jpg",
    "objective": "Trẻ viết được hồ sơ tính cách trước khi có bất kỳ hình nào.",
    "skillLearned": "Sáu câu hồ sơ: tên gì, thích gì, sợ gì, giỏi gì, dở gì, ước mơ gì.",
    "nextLessonSlug": "bai-3-2-mat-ma-nhan-dien",
    "journey": {
      "stage1_goal": {
        "id": "bai-3-1-ho-so-biet-doi-stage1-goal",
        "title": "Mục tiêu bài học: Bài 3.1 — Hồ sơ biệt đội",
        "goalText": "Trẻ viết được hồ sơ tính cách trước khi có bất kỳ hình nào.",
        "imageUrl": "/assets/aiki-islands/island3_lesson1_profile.jpg",
        "speech": "Sonet: AIKI ơi vẽ cho tớ một siêu hiệp sĩ cực mạnh, bay nhanh hơn gió, đấm vỡ núi đá, không sợ cái gì hết!\nAKI: Ơ... nhân vật cái gì cũng giỏi, chẳng sợ gì thì chán lắm Sonet ơi! Một nhân vật hay phải có điểm yếu và tính cách riêng cơ!",
        "keyPoints": [
          "[1] TÊN GÌ — \"Tép\": (Một chú chuột nhỏ, tai hơi lệch)",
          "[2] THÍCH GÌ — \"nhặt nắp chai rồi xếp theo màu\": (Càng riêng càng dễ nhớ)",
          "[3] SỢ GÌ ⭐ — \"sợ đi ngang cái cống\": (Đừng viết “sợ nhiều thứ” — thử “sợ tiếng máy sấy tóc”)",
          "[4] GIỎI GÌ — \"rất giỏi nhớ đường\"",
          "[5] DỞ GÌ ⭐ — \"cực dở buộc dây giày\": (Nhân vật cái gì cũng giỏi thì còn gì để kể)",
          "[6] ƯỚC MƠ GÌ — \"đi hết một con đường chưa ai từng đi hết\""
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-3-1-ho-so-biet-doi-stage2-confirm",
        "question": "Trong sáu ô hồ sơ, hai ô nào không được bỏ trống?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Ô TÊN GÌ và ô THÍCH GÌ",
            "imageUrl": "/assets/aiki-islands/island3_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Ô SỢ GÌ và ô DỞ GÌ",
            "imageUrl": "/assets/aiki-islands/island3_lesson1_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Ô GIỎI GÌ và ô ƯỚC MƠ GÌ",
            "imageUrl": "/assets/aiki-islands/island3_lesson1_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Nghe hơi ngược nhỉ — nhưng đó là chỗ câu chuyện mọc ra.",
        "speech": "Chưa đúng. Ô SỢ và ô DỞ mới là hai ô không được bỏ trống."
      },
      "stage3_video": {
        "id": "bai-3-1-ho-so-biet-doi-stage3-video",
        "title": "Video bài giảng: Bài 3.1 — Hồ sơ biệt đội",
        "videoUrl": "https://www.youtube.com/embed/x2k-VyO-GTc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island3_lesson1_profile.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Sonet: AIKI ơi vẽ cho tớ một siêu hiệp sĩ cực mạnh, bay nhanh hơn gió, đấm vỡ núi đá, không sợ cái gì hết!\nAKI: Ơ... nhân vật cái gì cũng giỏi, chẳng sợ gì thì chán lắm Sonet ơi! Một nhân vật hay phải có điểm yếu và tính cách riêng cơ!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "QT1: Hãy nghĩ ý tưởng của cậu trước! Bảng ADN 6 ô là bảo bối giúp nhân vật đi qua 100 bức tranh vẫn giữ đúng linh hồn!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Bây giờ đến lượt các cậu. Hãy mở sổ và điền đủ 6 ô hồ sơ cho nhân vật của mình. Đọc to cho một người trong nhà nghe và hỏi họ xem họ hình dung bạn ấy trông thế nào nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-3-1-ho-so-biet-doi-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 3.1 — Hồ sơ biệt đội",
        "questions": [
          {
            "id": "bai-3-1-q1",
            "prompt": "Kỹ năng hôm nay là gì?",
            "options": [
              "A. Viết hồ sơ trước — vẽ hình sau",
              "B. Vẽ hình trước — viết hồ sơ sau",
              "C. Vẽ và viết cùng lúc"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Đọc hồ sơ cho bố mẹ nghe, người nghe vẫn tưởng tượng ra nhân vật dù chưa vẽ gì.",
            "visualUrl": ""
          },
          {
            "id": "bai-3-1-q2",
            "prompt": "Vì sao Tép dễ nghĩ ra câu chuyện hơn siêu anh hùng áo choàng đỏ?",
            "options": [
              "A. Vì mình đã biết tính cách của Tép",
              "B. Vì Tép nhỏ hơn",
              "C. Vì Tép dễ vẽ hơn"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Nhân vật hay không phải vì đẹp, mà vì có tính cách.",
            "visualUrl": ""
          },
          {
            "id": "bai-3-1-q3",
            "prompt": "Viết “sợ nhiều thứ” vào ô SỢ GÌ thì sao?",
            "options": [
              "A. Chung chung quá — nên viết thật cụ thể như “sợ tiếng máy sấy tóc”",
              "B. Tốt, vì ai cũng hiểu",
              "C. Sai luật, không được viết chữ sợ"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Càng riêng thì nhân vật càng dễ nhớ.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-3-1-ho-so-biet-doi-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 3.1 — Hồ sơ biệt đội",
        "subjectName": "Hồ Sơ ADN Hiệp Sĩ Cáo Lửa",
        "badge": "Bài 3.1",
        "illustrationType": "profile-dna",
        "lockedFeatures": [
          "Hiệp Sĩ Cáo Lửa Red lông đỏ cam rực rỡ",
          "áo choàng xanh thẫm viền vàng thêu sao",
          "thanh kiếm gỗ đeo bên hông"
        ],
        "akiMotto": "Bảng ADN 6 ô là bảo bối giúp nhân vật đi qua 100 bức tranh vẫn là chính mình!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Hồ Sơ\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Hồ Sơ",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Hồ Sơ Hiệp Sĩ Cáo Lửa Red lông đỏ cam rực rỡ",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Chân dung Hiệp Sĩ Cáo Lửa Red lông đỏ cam, áo choàng xanh thẫm viền vàng, thanh kiếm gỗ bên hông, phong cách soft clay",
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
        "sampleUrl": "/assets/aiki-islands/island3_lesson1_profile.jpg",
        "creativeEngineMode": "creative-notebook",
        "notebookConfig": {
          "notebookTitle": "Hồ sơ nhân vật của tớ",
          "akiAdvice": "Hãy tạo một nhân vật bất kỳ: người, con vật, đồ vật, thậm chí một cái thang máy cũng được. Dù chưa vẽ gì, người nghe vẫn có thể tưởng tượng ra nhân vật trong đầu nhờ tính cách!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: Hồ sơ 7 dòng",
          "sampleTemplate": "Tên: Sóc Bông Quả Cảm\nThích: Hạt dẻ nướng thơm lừng và trèo cành sồi cao vút\nSợ: Tiếng máy sấy tóc và tiếng sấm sét đùng đoàng trong đêm\nGiỏi: Bật nhảy thoăn thoắt qua các cành cây và ngửi mùi hạt dẻ từ xa\nDở: Cực kỳ hậu đậu, hay quên để chìa khóa ở đâu\nƯớc mơ: Khám phá vương quốc hạt dẻ trên mây\nNgười nhà tớ tả bạn ấy là: Một bạn sóc nhỏ màu cam vừa dũng cảm vừa buồn cười",
          "backpackCategory": "character-dna",
          "backpackTag": "Hồ sơ nhân vật",
          "characterName": "Sóc Bông Quả Cảm",
          "challengeSummary": [
            "Tạo một nhân vật bất kỳ: người, con vật, đồ vật — thậm chí một cái thang máy cũng được",
            "Điền đủ các ô: Tên – Thích – Sợ – Giỏi – Dở – Ước mơ",
            "Đừng bỏ trống hai ô SỢ và DỞ, và viết thật cụ thể (\"sợ tiếng máy sấy tóc\" thay vì \"sợ nhiều thứ\")",
            "Đọc hồ sơ ấy cho bố hoặc mẹ nghe và hỏi: \"Theo mẹ, bạn này trông như thế nào?\""
          ],
          "checklist": [
            {
              "id": "cl-3-1-1",
              "label": "Tạo một nhân vật bất kỳ: người, con vật, đồ vật — thậm chí một cái thang máy"
            },
            {
              "id": "cl-3-1-2",
              "label": "Điền đủ các ô — ĐẶC BIỆT không bỏ trống hai ô SỢ và DỞ (viết cụ thể)"
            },
            {
              "id": "cl-3-1-3",
              "label": "Đọc hồ sơ cho bố/mẹ nghe và ghi lại câu trả lời vào ô số 7"
            }
          ],
          "fields": [
            {
              "id": "char-name",
              "label": "1. Tên nhân vật",
              "prefix": "Tên: ",
              "placeholder": "Người, con vật, đồ vật — thậm chí một cái thang máy...",
              "helperTip": "💡 Nhân vật bất kỳ: người, con vật, đồ vật, cái bút chì, cái thang máy...",
              "rows": 1
            },
            {
              "id": "char-likes",
              "label": "2. Sở thích đặc trưng",
              "prefix": "Thích: ",
              "placeholder": "Sở thích nổi bật nhất của bạn ấy...",
              "rows": 2
            },
            {
              "id": "char-fears",
              "label": "3. Nỗi sợ hãi",
              "prefix": "Sợ: ",
              "placeholder": "Sợ tiếng máy sấy tóc thay vì sợ nhiều thứ...",
              "badge": "Quan trọng",
              "helperTip": "💡 Đừng bỏ trống! Viết thật cụ thể: sợ tiếng máy sấy tóc thay vì sợ nhiều thứ",
              "rows": 2
            },
            {
              "id": "char-strength",
              "label": "4. Sở trường / Điểm giỏi",
              "prefix": "Giỏi: ",
              "placeholder": "Bạn ấy giỏi nhất việc gì...",
              "rows": 2
            },
            {
              "id": "char-weakness",
              "label": "5. Điểm dở / Vụng về đáng yêu",
              "prefix": "Dở: ",
              "placeholder": "Hay quên chìa khóa, hậu đậu...",
              "badge": "Quan trọng",
              "helperTip": "💡 Đừng bỏ trống! Điểm dở/tật xấu đáng yêu làm nhân vật thật hơn siêu nhân hoàn hảo",
              "rows": 2
            },
            {
              "id": "char-dream",
              "label": "6. Ước mơ",
              "prefix": "Ước mơ: ",
              "placeholder": "Ước mơ lớn nhất của bạn ấy...",
              "rows": 2
            },
            {
              "id": "char-family-feedback",
              "label": "7. Người nhà tớ tả bạn ấy là",
              "prefix": "Người nhà tớ tả bạn ấy là: ",
              "placeholder": "Ghi lại câu trả lời của bố/mẹ sau khi nghe đọc...",
              "badge": "Hỏi người nhà",
              "helperTip": "💡 Đọc hồ sơ cho bố hoặc mẹ nghe và hỏi: \"Theo mẹ, bạn này trông như thế nào?\" rồi ghi lại",
              "rows": 3,
              "colSpan": 2,
              "spanFull": true
            }
          ]
        },
        "practiceParts": []
      },
      "stage6_completion": {
        "id": "bai-3-1-ho-so-biet-doi-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 3.1 — Hồ sơ biệt đội\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 3.1 — Hồ sơ biệt đội",
          "iconUrl": "/assets/aiki-islands/island3_lesson1_profile.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-3-2-mat-ma-nhan-dien"
      }
    }
  },
  {
    "id": "bai-3-2",
    "slug": "bai-3-2-mat-ma-nhan-dien",
    "islandNumber": 3,
    "lessonNumber": "3.2",
    "title": "Bài 3.2 — Mật mã nhận diện",
    "subtitle": "Khóa chặt 3 điểm nhận diện bất biến để nhân vật không bị trôi!",
    "imageUrl": "/assets/aiki-islands/island3_lesson2_dna.jpg",
    "objective": "Trẻ chọn được ba đặc điểm nhận dạng cố định cho nhân vật.",
    "skillLearned": "Khái niệm nhất quán nhân vật.",
    "nextLessonSlug": "bai-3-3-bien-hoa-bieu-cam",
    "journey": {
      "stage1_goal": {
        "id": "bai-3-2-mat-ma-nhan-dien-stage1-goal",
        "title": "Mục tiêu bài học: Bài 3.2 — Mật mã nhận diện",
        "goalText": "Trẻ chọn được ba đặc điểm nhận dạng cố định cho nhân vật.",
        "imageUrl": "/assets/aiki-islands/island3_lesson2_dna.jpg",
        "speech": "Tina: Ối AIKI ơi! Bức một Sóc Bông của tớ đội mũ len đỏ đuôi to xù. Sang bức hai tự nhiên biến thành sóc đội nón lá đuôi chuột cống! Làm sao để giữ đúng một bạn bây giờ?\nAKI: Vì Tina chưa có Mật Mã Nhận Diện đấy! AI mà không được khóa đặc điểm thì mỗi lần bấm lại vẽ ra một người lạ hoắc!",
        "keyPoints": [
          "[1] ẢNH MẪU — một bức duy nhất để AKI biết “à, đúng bạn này”: (Không phải cứ chọn bức ngầu nhất)",
          "[2] ẢNH MẪU TỐT — nền đơn giản · chỉ một nhân vật · đứng trực diện hoặc nghiêng nhẹ: (Rõ mặt, tóc, quần áo, toàn thân; không bị che; màu sáng rõ)",
          "[3] BA ĐẶC ĐIỂM NHẬN DIỆN — \"mũ len đỏ có quả bông trắng · áo khoác xanh dương hai túi lớn · ủng cao su màu vàng\": (Ba thứ này không được đổi)",
          "[4] ĐỪNG CHỌN — \"mắt đẹp\" · \"tóc dài\" · \"trông ngầu\" · kể cả \"mũ đỏ\": (Chưa đủ rõ để AKI biết phải giữ lại điều gì)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-3-2-mat-ma-nhan-dien-stage2-confirm",
        "question": "Để AKI vẽ đúng một nhân vật qua nhiều lần, con cần đưa cho AKI mấy thứ?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Chỉ cần tả bằng lời là đủ",
            "imageUrl": "/assets/aiki-islands/island3_lesson2_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Hai thứ: ảnh mẫu và ba đặc điểm nhận diện",
            "imageUrl": "/assets/aiki-islands/island3_lesson2_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Chỉ cần ảnh mẫu là đủ",
            "imageUrl": "/assets/aiki-islands/island3_lesson2_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Ảnh mẫu để biết đúng bạn nào, ba đặc điểm để biết điều gì phải giữ nguyên.",
        "speech": "Chưa đúng. Cần cả hai: ảnh mẫu VÀ ba đặc điểm nhận diện."
      },
      "stage3_video": {
        "id": "bai-3-2-mat-ma-nhan-dien-stage3-video",
        "title": "Video bài giảng: Bài 3.2 — Mật mã nhận diện",
        "videoUrl": "https://www.youtube.com/embed/LtRW4JX8HWE",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island3_lesson2_dna.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Tina: Ối AIKI ơi! Bức một Sóc Bông của tớ đội mũ len đỏ đuôi to xù. Sang bức hai tự nhiên biến thành sóc đội nón lá đuôi chuột cống! Làm sao để giữ đúng một bạn bây giờ?\nAKI: Vì Tina chưa có Mật Mã Nhận Diện đấy! AI mà không được khóa đặc điểm thì mỗi lần bấm lại vẽ ra một người lạ hoắc!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Mật mã 3 điểm khóa: Đổi góc nhìn, không đổi đặc điểm nhận diện! Cả ba đặc điểm phải viết vào Bản Luật vẽ nhân vật và dán vào mọi câu lệnh!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Bây giờ đến lượt các cậu. Chọn và tả 3 đặc điểm thật cụ thể (từ 5 từ trở lên mỗi ô), viết vào Bản Luật vẽ nhân vật, ký tên rồi tạo bức chân dung đầu tiên nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-3-2-mat-ma-nhan-dien-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 3.2 — Mật mã nhận diện",
        "questions": [
          {
            "id": "bai-3-2-q1",
            "prompt": "Một ảnh mẫu tốt trông thế nào?",
            "options": [
              "A. Nền đơn giản, chỉ một nhân vật, nhìn rõ mặt và toàn thân",
              "B. Nhiều nhân vật cho sinh động",
              "C. Nền tối và nhiều hiệu ứng cho ngầu"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Ảnh mẫu càng rõ, AKI càng ít phải đoán.",
            "visualUrl": ""
          },
          {
            "id": "bai-3-2-q2",
            "prompt": "Đặc điểm nào dùng làm “mật mã nhận diện” được?",
            "options": [
              "A. Mắt đẹp",
              "B. Mũ len đỏ có quả bông trắng",
              "C. Trông ngầu"
            ],
            "correctIndex": 1,
            "explanation": "Giải thích: Kể cả “mũ đỏ” cũng chưa đủ rõ — phải nói được chính xác cái gì không được đổi.",
            "visualUrl": ""
          },
          {
            "id": "bai-3-2-q3",
            "prompt": "Mẹo chọn ba đặc điểm cho chuẩn là gì?",
            "options": [
              "A. Tưởng tượng nhân vật đứng giữa đám đông — con sẽ nói ba điều gì để chỉ ra bạn ấy?",
              "B. Chọn thứ mình thích nhất",
              "C. Chọn thứ AKI gợi ý"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Ba điều ấy chính là ba đặc điểm nhận diện.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-3-2-mat-ma-nhan-dien-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 3.2 — Mật mã nhận diện",
        "subjectName": "Sóc Bông Khóa 3 Điểm",
        "badge": "Bài 3.2",
        "illustrationType": "soc-bong",
        "lockedFeatures": [
          "mũ len đỏ quả bông trắng",
          "đuôi to xù màu cam",
          "túi vải nâu đeo chéo"
        ],
        "akiMotto": "Mật mã 3 điểm khóa: Mũ len đỏ quả bông trắng · Đuôi to xù cam · Túi vải nâu đeo chéo. Không bao giờ đổi!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Sóc Bông\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Sóc Bông",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Sóc Bông mũ len đỏ quả bông trắng",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Chú Sóc Bông đội mũ len đỏ quả bông trắng, đuôi to xù màu cam, đeo túi vải nâu chéo đứng trên hàng rào gỗ ngập nắng",
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
        "sampleUrl": "/assets/aiki-islands/island3_lesson2_dna.jpg",
        "creativeEngineMode": "identity-lock",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Chọn nhân vật của bé & Nhận ảnh mẫu",
            "icon": "👤",
            "emoji": "👤",
            "iconImage": "/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-3-2-mat-ma-nhan-dien-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 3.2 — Mật mã nhận diện\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 3.2 — Mật mã nhận diện",
          "iconUrl": "/assets/aiki-islands/island3_lesson2_dna.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-3-3-bien-hoa-bieu-cam"
      }
    }
  },
  {
    "id": "bai-3-3",
    "slug": "bai-3-3-bien-hoa-bieu-cam",
    "islandNumber": 3,
    "lessonNumber": "3.3",
    "title": "Bài 3.3 — Biến hoá biểu cảm",
    "subtitle": "Đổi mặt, không đổi người! Giữ vững nhân vật qua 6 sắc thái cảm xúc!",
    "imageUrl": "/assets/aiki-islands/island3_lesson3_expressions.jpg",
    "objective": "Trẻ tạo được sáu biểu cảm mà nhân vật vẫn là một người.",
    "skillLearned": "Giữ nhất quán qua nhiều hình bằng cách khoá ba đặc điểm vào mọi câu lệnh.",
    "nextLessonSlug": "bai-3-4-can-cu-bi-mat-cua-biet-doi",
    "journey": {
      "stage1_goal": {
        "id": "bai-3-3-bien-hoa-bieu-cam-stage1-goal",
        "title": "Mục tiêu bài học: Bài 3.3 — Biến hoá biểu cảm",
        "goalText": "Trẻ tạo được sáu biểu cảm mà nhân vật vẫn là một người.",
        "imageUrl": "/assets/aiki-islands/island3_lesson3_expressions.jpg",
        "speech": "Tina: Hôm qua tớ làm bộ sáu biểu cảm cho Bông: vui, buồn, sợ, giận, ngạc nhiên, buồn ngủ. Làm xong nhìn lại... ơ? Hình thì Bông có chuông vàng, hình lại mất chuông, hình vòng cổ đỏ hình lại đổi màu! Cứ như sáu chú chó khác nhau ấy!\nAKI: Vì Tina chỉ bảo tớ 'Bông đang vui', 'Bông đang giận' mà quên gửi kèm ảnh mẫu và luật vẽ nhân vật đấy!",
        "keyPoints": [
          "[1] GỬI KÈM ẢNH MẪU — mỗi lần tạo đều đính kèm: (Để AKI biết đúng bạn nào)",
          "[2] NHẮC LẠI ĐẶC ĐIỂM — \"vòng cổ đỏ, chuông vàng…\": (Những thứ trong Luật vẽ nhân vật)",
          "[3] RỒI MỚI THÊM BIỂU CẢM — \"Bông đang giận, lông mày chụm lại, hai chân trước chống xuống đất\": (Đừng chỉ nói “Bông đang giận”)",
          "[4] CÂU ĐỂ NHỚ — Đổi mặt, không đổi người: (Sáu cái mặt khác nhau, vừa nhìn là biết ngay vẫn là một bạn)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-3-3-bien-hoa-bieu-cam-stage2-confirm",
        "question": "Muốn nhân vật đổi biểu cảm mà vẫn là một bạn, con phải làm gì mỗi lần tạo?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Chỉ cần viết “bạn ấy đang giận” là đủ",
            "imageUrl": "/assets/aiki-islands/island3_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Gửi kèm ảnh mẫu, nhắc lại đặc điểm nhận diện, rồi mới thêm biểu cảm",
            "imageUrl": "/assets/aiki-islands/island3_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Tạo lại nhân vật mới cho mỗi biểu cảm",
            "imageUrl": "/assets/aiki-islands/island3_lesson3_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng rồi! Thiếu ảnh mẫu và luật vẽ là AKI dễ vẽ ra một bạn khác.",
        "speech": "Chưa đúng. Nếu chỉ nói “đang giận” thì AKI rất dễ vẽ ra một bạn khác."
      },
      "stage3_video": {
        "id": "bai-3-3-bien-hoa-bieu-cam-stage3-video",
        "title": "Video bài giảng: Bài 3.3 — Biến hoá biểu cảm",
        "videoUrl": "https://www.youtube.com/embed/Crrd59K_C2M",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island3_lesson3_expressions.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Tina: Hôm qua tớ làm bộ sáu biểu cảm cho Bông: vui, buồn, sợ, giận, ngạc nhiên, buồn ngủ. Làm xong nhìn lại... ơ? Hình thì Bông có chuông vàng, hình lại mất chuông, hình vòng cổ đỏ hình lại đổi màu! Cứ như sáu chú chó khác nhau ấy!\nAKI: Vì Tina chỉ bảo tớ 'Bông đang vui', 'Bông đang giận' mà quên gửi kèm ảnh mẫu và luật vẽ nhân vật đấy!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Câu thần chú của bài hôm nay: ĐỔI MẶT, KHÔNG ĐỔI NGƯỜI! Biểu cảm có thể thay đổi liên tục nhưng mật mã 3 điểm khóa tuyệt đối không được mất!"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Bây giờ đến lượt các cậu. Hãy tạo trọn bộ 6 biểu cảm: vui, buồn, sợ, giận, ngạc nhiên và buồn ngủ. Sau mỗi hình nhớ soi kỹ lại Bản luật vẽ xem có bị trôi điểm nào không nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-3-3-bien-hoa-bieu-cam-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 3.3 — Biến hoá biểu cảm",
        "questions": [
          {
            "id": "bai-3-3-q1",
            "prompt": "Câu để nhớ của bài này là gì?",
            "options": [
              "A. Đổi mặt, không đổi người",
              "B. Đổi người cho đỡ chán",
              "C. Mặt nào cũng được, miễn là đẹp"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Sáu biểu cảm khác nhau nhưng vẫn phải là cùng một nhân vật.",
            "visualUrl": ""
          },
          {
            "id": "bai-3-3-q2",
            "prompt": "Sau mỗi hình con phải làm gì?",
            "options": [
              "A. Nhìn lại ảnh mẫu và Luật vẽ xem đặc điểm quan trọng còn đủ không",
              "B. Làm ngay hình tiếp theo cho nhanh",
              "C. Xoá hình cũ đi"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Thiếu một thứ nghĩa là nhân vật đã bị trôi — sửa câu lệnh rồi tạo lại.",
            "visualUrl": ""
          },
          {
            "id": "bai-3-3-q3",
            "prompt": "Thử thách thật sự của bài này là gì?",
            "options": [
              "A. Sáu biểu cảm khác nhau nhưng vẫn phải là cùng một nhân vật",
              "B. Làm sáu cái mặt thật đẹp",
              "C. Làm thật nhanh trong một lượt"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Ngoài màn hình, thử soi gương làm sáu biểu cảm này xem.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-3-3-bien-hoa-bieu-cam-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 3.3 — Biến hoá biểu cảm",
        "subjectName": "Lưới 6 Biểu Cảm Của Sóc Bông",
        "badge": "Bài 3.3",
        "illustrationType": "six-expressions",
        "lockedFeatures": [
          "mũ len đỏ quả bông trắng",
          "đuôi to xù màu cam",
          "túi vải nâu đeo chéo"
        ],
        "akiMotto": "Đổi mặt, không đổi người! Giữ nguyên mật mã 3 điểm khóa thì dù Sóc Bông vui, buồn, sợ, giận vẫn nhận ra ngay!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Lưới 6\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Lưới 6",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Lưới 6 mũ len đỏ quả bông trắng",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Sóc Bông vui sướng nhảy cẫng lên ăn mừng, giữ nguyên mũ len đỏ quả bông trắng, đuôi to xù cam và túi vải nâu chéo",
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
        "sampleUrl": "/assets/aiki-islands/island3_lesson3_expressions.jpg",
        "creativeEngineMode": "identity-lock",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Biểu cảm Vui 😊",
            "icon": "😊",
            "emoji": "😊",
            "iconImage": "/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp"
          },
          {
            "partNumber": 2,
            "title": "Biểu cảm Buồn 😢",
            "icon": "😢",
            "emoji": "😢",
            "iconImage": "/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp"
          },
          {
            "partNumber": 3,
            "title": "Biểu cảm Sợ 😨",
            "icon": "😨",
            "emoji": "😨",
            "iconImage": "/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp"
          },
          {
            "partNumber": 4,
            "title": "Biểu cảm Giận 😠",
            "icon": "😠",
            "emoji": "😠",
            "iconImage": "/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp"
          },
          {
            "partNumber": 5,
            "title": "Biểu cảm Ngạc nhiên 😲",
            "icon": "😲",
            "emoji": "😲",
            "iconImage": "/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp"
          },
          {
            "partNumber": 6,
            "title": "Biểu cảm Buồn ngủ 😴",
            "icon": "😴",
            "emoji": "😴",
            "iconImage": "/assets/pregenerated-fallback/identity-lock/fox_zico_v1.webp"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-3-3-bien-hoa-bieu-cam-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 3.3 — Biến hoá biểu cảm\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 3.3 — Biến hoá biểu cảm",
          "iconUrl": "/assets/aiki-islands/island3_lesson3_expressions.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-3-4-can-cu-bi-mat-cua-biet-doi"
      }
    }
  },
  {
    "id": "bai-3-4",
    "slug": "bai-3-4-can-cu-bi-mat-cua-biet-doi",
    "islandNumber": 3,
    "lessonNumber": "3.4",
    "title": "Bài 3.4 — Căn cứ bí mật của biệt đội",
    "subtitle": "Nơi ở phải kể được tính cách của nhân vật!",
    "imageUrl": "/assets/aiki-islands/island3_lesson4_lair.jpg",
    "objective": "Trẻ dựng được nơi ở và đồ vật riêng cho nhân vật.",
    "skillLearned": "Câu lệnh hai tầng: nhân vật đã khoá cộng bối cảnh dùng từ bố cục của Module 2.",
    "nextLessonSlug": "bai-4-1-3-cong-cua-vuong-quoc",
    "journey": {
      "stage1_goal": {
        "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-stage1-goal",
        "title": "Mục tiêu bài học: Bài 3.4 — Căn cứ bí mật của biệt đội",
        "goalText": "Trẻ dựng được nơi ở và đồ vật riêng cho nhân vật.",
        "imageUrl": "/assets/aiki-islands/island3_lesson4_lair.jpg",
        "speech": "Sonet: AIKI ơi xem phòng bí mật tớ dựng cho chú mèo Bum này: đèn chùm pha lê lung linh, ngai vàng dát bạc, tường đầy sách cổ... Đẹp mê ly luôn!\nAKI: Đẹp thật đấy Sonet... Nhưng Bum là chú mèo thích trèo cây đuổi bướm và sợ bóng tối. Ngồi trên ngai vàng nhìn Bum ngơ ngác như đi lạc vào nhà người khác ấy!",
        "keyPoints": [
          "[1] NƠI Ở KỂ TÍNH CÁCH — Tép ngồi ngai vàng thì chẳng giống Tép chút nào: (Căn cứ không cần to hay đẹp, nó cần ĐÚNG với người sống trong đó)",
          "[2] CÂU HỎI TRƯỚC KHI THÊM ĐỒ — \"Thứ này liên quan đến điều gì của bạn ấy?\": (Thích gì? Giỏi gì? Sợ gì? Mơ ước gì?)",
          "[3] VÍ DỤ CĂN CỨ CỦA TÉP — hộp thiếc đựng nắp chai · bản đồ vẽ tay · sợi dây giày cũ · ô cửa bé nhìn ra cái cống: (Mỗi món khớp một ô hồ sơ)",
          "[4] VẪN PHẢI ĐÚNG MỘT BẠN — đính kèm ảnh mẫu, giữ đặc điểm trong Luật vẽ: (Phòng đổi, tư thế đổi — nhân vật thì không)"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-stage2-confirm",
        "question": "Trước khi thêm một món đồ vào căn cứ, con phải tự hỏi câu gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "A. Món này có đẹp không?",
            "imageUrl": "/assets/aiki-islands/island3_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "B. Thứ này liên quan đến điều gì của bạn ấy?",
            "imageUrl": "/assets/aiki-islands/island3_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "C. Món này có đắt không?",
            "imageUrl": "/assets/aiki-islands/island3_lesson4_opt_c.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Nếu chẳng liên quan gì cả, có lẽ món đồ ấy không cần xuất hiện.",
        "speech": "Chưa đúng. Căn cứ không cần đẹp — nó cần ĐÚNG với người sống trong đó."
      },
      "stage3_video": {
        "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-stage3-video",
        "title": "Video bài giảng: Bài 3.4 — Căn cứ bí mật của biệt đội",
        "videoUrl": "https://www.youtube.com/embed/Hxk4NmtL3IY",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island3_lesson4_lair.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Sonet: AIKI ơi xem phòng bí mật tớ dựng cho chú mèo Bum này: đèn chùm pha lê lung linh, ngai vàng dát bạc, tường đầy sách cổ... Đẹp mê ly luôn!\nAKI: Đẹp thật đấy Sonet... Nhưng Bum là chú mèo thích trèo cây đuổi bướm và sợ bóng tối. Ngồi trên ngai vàng nhìn Bum ngơ ngác như đi lạc vào nhà người khác ấy!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Nơi ở cũng phải kể được tính cách của nhân vật! Trước khi thêm một món đồ, hãy nhìn lại Hồ sơ và hỏi: 'Thứ này liên quan đến điều gì của bạn ấy?'"
          },
          {
            "label": "Thực hành cùng AIKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Mở Hồ sơ ra, chọn vài chi tiết quan trọng để biến thành đồ vật trong căn cứ. Đính kèm ảnh mẫu và luật vẽ để tạo căn cứ riêng, rồi ghép thành Thẻ nhân vật 2 mặt hoàn chỉnh nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 3.4 — Căn cứ bí mật của biệt đội",
        "questions": [
          {
            "id": "bai-3-4-q1",
            "prompt": "Vì sao lâu đài pha lê có ngai vàng lại không hợp với Tép?",
            "options": [
              "A. Vì Tép là chú chuột thích nhặt nắp chai, giỏi nhớ đường — ngai vàng chẳng giống Tép chút nào",
              "B. Vì lâu đài khó vẽ",
              "C. Vì Tép không thích màu vàng"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Một góc dưới cầu thang có hộp thiếc đựng nắp chai mới đúng chất Tép.",
            "visualUrl": ""
          },
          {
            "id": "bai-3-4-q2",
            "prompt": "Kỹ năng hôm nay là gì?",
            "options": [
              "A. Nơi ở cũng phải kể được tính cách của nhân vật",
              "B. Nơi ở phải thật to và thật đẹp",
              "C. Nơi ở nên giống nhà thật của mình"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Nhìn lại Hồ sơ trước khi thêm bất cứ món đồ nào.",
            "visualUrl": ""
          },
          {
            "id": "bai-3-4-q3",
            "prompt": "Làm sao biết căn cứ của con đã đúng?",
            "options": [
              "A. Nếu chỉ nhìn căn phòng mà người khác đoán được bạn ấy thích gì, sợ gì",
              "B. Nếu căn phòng có nhiều đồ nhất",
              "C. Nếu căn phòng sáng nhất"
            ],
            "correctIndex": 0,
            "explanation": "Giải thích: Câu chốt cả chương: nhân vật hay không phải vì đẹp, mà vì có tính cách.",
            "visualUrl": ""
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 3.4 — Căn cứ bí mật của biệt đội",
        "subjectName": "Căn Cứ Hốc Cây Của Sóc Bông",
        "badge": "Bài 3.4",
        "illustrationType": "tree-hollow-base",
        "lockedFeatures": [
          "hốc cây sồi già ấm cúng có kệ hạt dẻ",
          "tấm bản đồ rừng tự vẽ treo tường",
          "đèn đom đóm vàng lung linh",
          "Sóc Bông mũ len đỏ đuôi xù túi chéo"
        ],
        "akiMotto": "Nơi ở phải kể được tính cách của nhân vật! Nhìn căn cứ là đoán ngay bạn ấy thích gì, sợ gì và mơ ước gì.",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Căn Cứ\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Căn Cứ",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AIKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Căn Cứ hốc cây sồi già ấm cúng có kệ hạt dẻ",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Sóc Bông cầm kính lúp soi bản đồ cổ trên bàn gỗ trong căn cứ hốc cây sồi ấm cúng có kệ hạt dẻ dưới ánh đèn đom đóm",
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
        "sampleUrl": "/assets/aiki-islands/island3_lesson4_lair.jpg",
        "creativeEngineMode": "layer-stacking",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Căn cứ bí mật của bạn ấy",
            "icon": "🏰",
            "emoji": "🏰",
            "iconImage": "/assets/aiki-keys/key_where_pink.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 3.4 — Căn cứ bí mật của biệt đội\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 3.4 — Căn cứ bí mật của biệt đội",
          "iconUrl": "/assets/aiki-islands/island3_lesson4_lair.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-4-1-3-cong-cua-vuong-quoc"
      }
    }
  },
]
