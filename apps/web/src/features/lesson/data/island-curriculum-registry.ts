// SSOT Thư viện Giáo trình 6 Chặng cho toàn bộ 22 bài học Aiki Islands (Module 1 - Module 5)
// Tự động đồng bộ và chuẩn hóa từ aiki-islands-curriculum.ts
import type { QuestDetail, LessonSixStageJourney } from '@/shared/lib/api'
import { LESSON_ENGINE_MAP } from '@/features/lesson/components/creative-engine/data/engine-presets'
import type { CreativeNotebookConfig } from '@/features/lesson/components/creative-engine/types'
import {
  DEFAULT_FOUR_KEYS_OPTIONS,
  DEFAULT_STYLE_PRISM_OPTIONS,
  DEFAULT_PROMPT_DOCTOR_CASE,
  DEFAULT_LAYER_STACKING_OPTIONS,
  DEFAULT_LOCKED_FEATURES,
  DEFAULT_EXPRESSIONS,
  DEFAULT_CARD_FORGE_OPTIONS,
} from '@/features/teacher/components/engine-editors/engine-editor-defaults'

export interface IslandCurriculumLesson {
  id: string
  slug: string
  islandNumber: number
  lessonNumber: string
  title: string
  subtitle: string
  imageUrl: string
  objective: string
  skillLearned: string
  nextLessonSlug?: string
  journey: LessonSixStageJourney
}

export const ISLAND_CURRICULUM_LESSONS: IslandCurriculumLesson[] = [
  {
    "id": "bai-1-1",
    "slug": "bai-1-1-mot-tu-hay-nam-tu",
    "islandNumber": 1,
    "lessonNumber": "1.1",
    "title": "Bài 1.1 — Một từ hay năm từ?",
    "subtitle": "Tả càng rõ, AKI vẽ càng đúng!",
    "imageUrl": "/assets/aiki-islands/island1_lesson1_cat.jpg?v=2",
    "objective": "Trẻ đưa ra được câu lệnh đầu tiên cho AKI và hiểu sự khác biệt giữa câu lệnh 1 từ và 5 chi tiết vàng.",
    "skillLearned": "Tạo câu lệnh chuẩn đủ 5 chi tiết: Đối tượng, Hình dáng, Hành động, Đồ vật đi kèm, Nơi chốn.",
    "nextLessonSlug": "bai-1-2-bon-chiec-chia-khoa",
    "journey": {
      "stage1_goal": {
        "id": "bai-1-1-mot-tu-hay-nam-tu-stage1-goal",
        "title": "Mục tiêu bài học: Bài 1.1 — Một từ hay năm từ?",
        "goalText": "Trẻ đưa ra được câu lệnh đầu tiên cho AKI và hiểu sự khác biệt giữa câu lệnh 1 từ và 5 chi tiết vàng.",
        "imageUrl": "/assets/aiki-islands/island1_lesson1_cat.jpg?v=2",
        "speech": "Mimi: Xong! Đây là con mèo. Đúng là con mèo rồi đấy... Nhưng mà con mèo trong đầu tớ không phải con này!\nAKI: Các cậu ơi, các cậu nghĩ Mimi làm sai ở chỗ nào nhỉ? Vì Mimi chỉ gõ đúng hai chữ 'con mèo' thôi đấy!",
        "keyPoints": [
          "CÁI GÌ (Xanh Sky): 'một con mèo'",
          "TRÔNG NHƯ THẾ NÀO (Vàng Sun): 'mèo mướp vàng béo tròn'",
          "ĐANG LÀM GÌ (Cam Mango): 'đang nằm ngủ cuộn tròn'",
          "Ở ĐÂU (Hồng Gum): 'trên ghế mây cạnh cửa sổ'"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-1-1-mot-tu-hay-nam-tu-stage2-confirm",
        "question": "Nếu con chỉ viết đúng hai chữ “con mèo”, AKI sẽ làm gì với những chỗ con chưa tả?",
        "options": [
          {
            "id": "opt-a",
            "text": "AKI dừng lại và hỏi lại con cho bằng hết",
            "imageUrl": "/assets/aiki-islands/island1_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "AKI tự điền vào những chỗ con bỏ trống",
            "imageUrl": "/assets/aiki-islands/island1_lesson1_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "AKI để trống y như vậy trên bức tranh",
            "imageUrl": "/assets/aiki-islands/island1_lesson1_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Chuẩn rồi! Chỗ nào con bỏ trống, AI sẽ tự điền vào.",
        "speech": "Chưa đúng nhé. AKI không hỏi lại và cũng không để trống — AKI tự điền vào."
      },
      "stage3_video": {
        "id": "bai-1-1-mot-tu-hay-nam-tu-stage3-video",
        "title": "Video bài giảng: Bài 1.1 — Một từ hay năm từ?",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
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
            "label": "Thực hành cùng AKI",
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
            "id": "bai-1-1-mot-tu-hay-nam-tu-q1",
            "prompt": "Câu thần chú của bài hôm nay là gì?",
            "options": [
              "Chỗ nào các cậu bỏ trống, AI sẽ tự điền vào",
              "Cứ bấm nhiều lần là sẽ ra hình đẹp",
              "Viết càng ngắn thì AI càng hiểu nhanh"
            ],
            "correctIndex": 0,
            "explanation": "Đây là câu neo của cả chương, sẽ dùng lại ở bài 1.4.",
            "visualUrl": "/assets/aiki-islands/island1_lesson1_cat.jpg"
          },
          {
            "id": "bai-1-1-mot-tu-hay-nam-tu-q2",
            "prompt": "Câu tả của MIMI “con mèo mướp béo đang ngủ trên ghế mây cạnh cửa sổ” có mấy điều?",
            "options": [
              "Ba điều",
              "Năm điều",
              "Một điều"
            ],
            "correctIndex": 1,
            "explanation": "Mèo mướp — béo — đang ngủ — trên ghế mây — cạnh cửa sổ.",
            "visualUrl": "/assets/aiki-islands/island1_lesson1_opt_a.jpg"
          },
          {
            "id": "bai-1-1-mot-tu-hay-nam-tu-q3",
            "prompt": "AKI sửa con mèo bằng cách nào?",
            "options": [
              "Bấm tạo lại từ đầu nhiều lần cho tới khi ưng",
              "Thêm dần từng chi tiết vào câu tả, không bấm lại",
              "Đổi sang một con vật khác cho dễ vẽ"
            ],
            "correctIndex": 1,
            "explanation": "AKI chỉ thêm chữ: mướp → béo → đang ngủ → trên ghế mây → cạnh cửa sổ.",
            "visualUrl": "/assets/aiki-islands/island1_lesson1_opt_b.jpg"
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
        "akiMotto": "Chỗ nào các cậu bỏ trống, AI như tớ sẽ tự điền vào. Tả càng rõ thì AKI vẽ càng đúng ý!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Chú Mèo\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Chú Mèo",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Chú Mèo mèo mướp vàng béo tròn",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Con mèo mướp vàng béo tròn đang nằm ngủ cuộn tròn trên chiếc ghế mây cạnh cửa sổ ngập nắng",
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
        "sampleUrl": "/assets/aiki-islands/island1_lesson1_cat.jpg?v=2",
        "creativeEngineMode": "magic-keys",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Chú Mèo Mướp Vàng",
            "icon": "🐱",
            "emoji": "🐱",
            "iconImage": "/assets/aiki-keys/key_subject_cat.jpg"
          },
          {
            "partNumber": 2,
            "title": "Mèo Béo Ngủ Ghế Mây",
            "icon": "🪑",
            "emoji": "🪑",
            "iconImage": "/assets/aiki-keys/key_what_blue.jpg"
          },
          {
            "partNumber": 3,
            "title": "Mèo Bắt Bướm Nắng Vàng",
            "icon": "🦋",
            "emoji": "🦋",
            "iconImage": "/assets/aiki-keys/key_action_orange.jpg"
          },
          {
            "partNumber": 4,
            "title": "Mèo Phi Hành Gia",
            "icon": "🚀",
            "emoji": "🚀",
            "iconImage": "/assets/aiki-keys/key_where_pink.jpg"
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
    "objective": "Trẻ viết được một câu lệnh có đủ bốn phần: Cái gì, Trông như thế nào, Đang làm gì, Ở đâu.",
    "skillLearned": "Công thức bốn ô màu sắc: Xanh (Cái gì), Vàng (Trông như thế nào), Cam (Đang làm gì), Đỏ (Ở đâu).",
    "nextLessonSlug": "bai-1-3-um-ba-la-bien-hinh",
    "journey": {
      "stage1_goal": {
        "id": "bai-1-2-bon-chiec-chia-khoa-stage1-goal",
        "title": "Mục tiêu bài học: Bài 1.2 — Bốn chiếc chìa khoá",
        "goalText": "Trẻ viết được một câu lệnh có đủ bốn phần: Cái gì, Trông như thế nào, Đang làm gì, Ở đâu.",
        "imageUrl": "/assets/aiki-islands/island1_lesson2_keys_v2.jpg",
        "speech": "Zico: Một con mèo rất đẹp, rất là đẹp, đẹp lắm luôn, tớ rất thích nó...\nAKI: Hả? Zico viết dài thế mà tranh vẫn chưa rõ kìa! Viết dài toàn từ khen chưa chắc đã rõ đâu nhé các cậu!",
        "keyPoints": [
          "CÁI GÌ (Xanh Sky): 'một cái cốc'",
          "TRÔNG NHƯ THẾ NÀO (Vàng Sun): 'sứ trắng, có vết mẻ ở miệng'",
          "ĐANG LÀM GÌ (Cam Mango): 'đang bốc khói'",
          "Ở ĐÂU (Hồng Gum): 'trên bàn gỗ, cạnh cuốn sổ'"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-1-2-bon-chiec-chia-khoa-stage2-confirm",
        "question": "Bộ chìa khoá nào mở được một câu lệnh tốt?",
        "options": [
          {
            "id": "opt-a",
            "text": "Bộ chìa khoá A: Ai vẽ · Vẽ lúc nào · Vẽ ở đâu · Vẽ bằng gì",
            "imageUrl": "/assets/aiki-islands/island1_lesson2_keys_v2.jpg"
          },
          {
            "id": "opt-b",
            "text": "Bộ chìa khoá B: Cái gì · Trông như thế nào · Đang làm gì · Ở đâu",
            "imageUrl": "/assets/aiki-islands/island1_lesson2_keys_v2.jpg"
          },
          {
            "id": "opt-c",
            "text": "Bộ chìa khoá C: Cái gì · Màu gì · To hay nhỏ · Của ai",
            "imageUrl": "/assets/aiki-islands/island1_lesson2_keys_v2.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng bộ bốn chìa rồi!",
        "speech": "Chưa đúng. Bốn chìa là: CÁI GÌ · TRÔNG NHƯ THẾ NÀO · ĐANG LÀM GÌ · Ở ĐÂU."
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
            "speech": "Bốn chiếc chìa khoá: Xanh là CÁI GÌ, Vàng là TRÔNG NHƯ THẾ NÀO, Cam là ĐANG LÀM GÌ, Đỏ là Ở ĐÂU! Đủ bốn chìa khoá là AKI hết chỗ đoán bừa!"
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
            "id": "bai-1-2-bon-chiec-chia-khoa-q1",
            "prompt": "“Một con chó xù màu nâu đang chạy” — câu này thiếu chìa khoá nào?",
            "options": [
              "CÁI GÌ",
              "ĐANG LÀM GÌ",
              "Ở ĐÂU"
            ],
            "correctIndex": 2,
            "explanation": "Thiếu Ở ĐÂU nên AKI cho nó chạy giữa nền trắng trơn, chẳng ra đâu vào đâu.",
            "visualUrl": "/assets/aiki-islands/island1_lesson2_cat.jpg"
          },
          {
            "id": "bai-1-2-bon-chiec-chia-khoa-q2",
            "prompt": "Vì sao câu tả rất dài của Zico vẫn chưa rõ?",
            "options": [
              "Vì dài chưa chắc đã rõ — cậu ấy chỉ khen đẹp chứ không tả đủ bốn chìa khoá",
              "Vì Zico viết sai chính tả",
              "Vì AKI không đọc được câu dài"
            ],
            "correctIndex": 0,
            "explanation": "“Rất đẹp, đẹp lắm, đáng yêu vô cùng” không cho AKI biết gì thêm cả.",
            "visualUrl": "/assets/aiki-islands/island1_lesson2_opt_a.jpg"
          },
          {
            "id": "bai-1-2-bon-chiec-chia-khoa-q3",
            "prompt": "Chìa khoá nào hay bị quên nhất, nhất là khi tả đồ vật?",
            "options": [
              "ĐANG LÀM GÌ",
              "CÁI GÌ",
              "TRÔNG NHƯ THẾ NÀO"
            ],
            "correctIndex": 0,
            "explanation": "Đồ vật vẫn làm gì đó được: cốc đang bốc khói, xe đạp đang dựa vào tường, sách đang mở dở.",
            "visualUrl": "/assets/aiki-islands/island1_lesson2_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
            "title": "Cốc Sứ Trắng Mẻ Miệng Bốc Khói",
            "icon": "☕",
            "emoji": "☕",
            "iconImage": "/assets/aiki-islands/island1_lesson2_teacup.jpg"
          },
          {
            "partNumber": 2,
            "title": "Chiếc xe đạp mini",
            "icon": "🚲",
            "emoji": "🚲",
            "iconImage": "/assets/aiki-islands/island1_lesson2_bicycle.jpg"
          },
          {
            "partNumber": 3,
            "title": "Cuốn sổ tay bìa da",
            "icon": "📖",
            "emoji": "📖",
            "iconImage": "/assets/aiki-islands/island1_lesson2_notebook.jpg"
          },
          {
            "partNumber": 4,
            "title": "Cái đồng hồ cổ",
            "icon": "⏰",
            "emoji": "⏰",
            "iconImage": "/assets/aiki-islands/island1_lesson2_clock.jpg"
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
    "objective": "Trẻ phân biệt và áp dụng được 4 phong cách nghệ thuật (Đất nặn Clay, Màu nước Watercolor, Pixel Art, Xé dán Giấy Quilling) vào câu lệnh.",
    "skillLearned": "Thêm từ khóa phong cách nghệ thuật vào cuối câu lệnh 4 ô.",
    "nextLessonSlug": "bai-1-4-ky-su-tai-ba",
    "journey": {
      "stage1_goal": {
        "id": "bai-1-3-um-ba-la-bien-hinh-stage1-goal",
        "title": "Mục tiêu bài học: Bài 1.3 — Úm ba la... Biến hình",
        "goalText": "Trẻ phân biệt và áp dụng được 4 phong cách nghệ thuật (Đất nặn Clay, Màu nước Watercolor, Pixel Art, Xé dán Giấy Quilling) vào câu lệnh.",
        "imageUrl": "/assets/aiki-islands/island1_lesson3_styles.jpg",
        "speech": "Sonet: AKI ơi, tớ vẽ con trâu mà sao tranh nào cũng một màu chán ngắt thế này?\nAKI: Nhìn cái này đi Sonet! Tớ có bốn bức tranh con trâu. Tớ tả giống hệt nhau từng chữ một, thế mà bốn bức lại khác hẳn nhau!",
        "keyPoints": [
          "Trẻ phân biệt và áp dụng được 4 phong cách nghệ thuật (Đất nặn Clay, Màu nước Watercolor, Pixel Art, Xé dán Giấy Quilling) vào câu lệnh.",
          "Thêm từ khóa phong cách nghệ thuật vào cuối câu lệnh 4 ô.",
          "PHONG CÁCH NGHỆ THUẬT: Đất nặn Clay · Màu nước · Pixel Art · Xé dán Quilling"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-1-3-um-ba-la-bien-hinh-stage2-confirm",
        "question": "Muốn đổi kiểu vẽ, con làm gì với câu tả bốn ô của mình?",
        "options": [
          {
            "id": "opt-a",
            "text": "Viết lại toàn bộ câu tả từ đầu",
            "imageUrl": "/assets/aiki-islands/island1_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Giữ nguyên bốn ô, chỉ thêm tên kiểu vẽ vào cuối",
            "imageUrl": "/assets/aiki-islands/island1_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Xoá bớt chi tiết đi cho AI dễ đổi",
            "imageUrl": "/assets/aiki-islands/island1_lesson3_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng rồi, chỉ đổi chữ cuối thôi.",
        "speech": "Chưa đúng. Bốn ô giữ nguyên, chỉ thêm tên kiểu vẽ vào cuối câu."
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
            "speech": "Sonet: AKI ơi, tớ vẽ con trâu mà sao tranh nào cũng một màu chán ngắt thế này?\nAKI: Nhìn cái này đi Sonet! Tớ có bốn bức tranh con trâu. Tớ tả giống hệt nhau từng chữ một, thế mà bốn bức lại khác hẳn nhau!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Phong cách nghệ thuật giống như thay chiếc áo thần kỳ cho bức tranh! Chỉ cần thêm tên phong cách vào cuối câu tả bốn ô là xong!"
          },
          {
            "label": "Thực hành cùng AKI",
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
            "id": "bai-1-3-um-ba-la-bien-hinh-q1",
            "prompt": "Bốn bức con trâu của AKI khác nhau vì sao?",
            "options": [
              "Vì AKI đổi đúng một điều ở cuối câu — kiểu vẽ",
              "Vì AKI tả bốn con trâu khác nhau",
              "Vì AKI bấm tạo bốn lần"
            ],
            "correctIndex": 0,
            "explanation": "Kiểu vẽ không đổi con trâu. Kiểu vẽ đổi CÁCH vẽ con trâu.",
            "visualUrl": "/assets/aiki-islands/island1_lesson3_cat.jpg"
          },
          {
            "id": "bai-1-3-um-ba-la-bien-hinh-q2",
            "prompt": "Điều nào sau đây KHÔNG được làm?",
            "options": [
              "Gọi tên một kiểu vẽ như màu nước, đất nặn",
              "Bảo AKI vẽ giống hệt một cô chú hoạ sĩ còn đang sống",
              "Thử cùng một nội dung với bốn kiểu vẽ khác nhau"
            ],
            "correctIndex": 1,
            "explanation": "Kiểu vẽ thì chung. Tên người thì riêng — cách vẽ đó là của người ta, có khi mất cả đời mới tìm ra.",
            "visualUrl": "/assets/aiki-islands/island1_lesson3_opt_a.jpg"
          },
          {
            "id": "bai-1-3-um-ba-la-bien-hinh-q3",
            "prompt": "AKI chọn bức màu nước vì lý do gì?",
            "options": [
              "Vì màu nước là đẹp nhất",
              "Vì AKI định treo bức đó ở đầu giường, nhìn êm êm dễ ngủ",
              "Vì màu nước tạo nhanh nhất"
            ],
            "correctIndex": 1,
            "explanation": "Chọn xong là phải nói được vì sao, không phải kiểu “cái nào cũng được” rồi lấy đại.",
            "visualUrl": "/assets/aiki-islands/island1_lesson3_opt_b.jpg"
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
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Bảng 4\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Bảng 4",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
          },
          {
            "step": 2,
            "title": "Thêm hình dáng & màu sắc",
            "akiSpeech": "Giỏi lắm! Giờ hãy thêm chi tiết màu sắc và hình dáng để tớ không phải đoán bừa!",
            "quickPrompt": "Bảng 4 đất nặn Clay 3D tròn trịa",
            "instruction": "Bổ sung màu sắc, hình dáng đặc trưng"
          },
          {
            "step": 3,
            "title": "Hoàn thiện 5 chi tiết vàng",
            "akiSpeech": "Bây giờ hãy bổ sung hành động và bối cảnh để bức tranh thật sinh động nhé!",
            "quickPrompt": "Chú trâu đất nặn Clay 3D tròn trịa đáng yêu với sừng uốn cong trên đồng cỏ xanh",
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
            "title": "Chú Trâu Đất Nặn",
            "icon": "🐃",
            "emoji": "🐃",
            "iconImage": "/assets/aiki-keys/key_what_blue.jpg"
          },
          {
            "partNumber": 2,
            "title": "Chú Mèo Béo Múp",
            "icon": "🐱",
            "emoji": "🐱",
            "iconImage": "/assets/aiki-islands/island1_lesson1_cat.jpg"
          },
          {
            "partNumber": 3,
            "title": "Bạn Robot Tí Hon",
            "icon": "🤖",
            "emoji": "🤖",
            "iconImage": "/assets/aiki-keys/key_action_orange.jpg"
          },
          {
            "partNumber": 4,
            "title": "Lâu Đài Cổ Tích",
            "icon": "🏰",
            "emoji": "🏰",
            "iconImage": "/assets/aiki-keys/key_where_pink.jpg"
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
    "objective": "Trẻ nắm được quy trình 3 bước sửa câu lệnh khi hình ảnh AI sinh ra bị lỗi, không bấm tạo lại vô thức.",
    "skillLearned": "3 bước sửa lỗi: Gọi tên lỗi -> Tìm chỗ thiếu trong câu lệnh -> Viết thêm chi tiết rồi mới tạo lại.",
    "nextLessonSlug": "bai-2-1-buc-tranh-biet-noi",
    "journey": {
      "stage1_goal": {
        "id": "bai-1-4-ky-su-tai-ba-stage1-goal",
        "title": "Mục tiêu bài học: Bài 1.4 — Kỹ sư tài ba",
        "goalText": "Trẻ nắm được quy trình 3 bước sửa câu lệnh khi hình ảnh AI sinh ra bị lỗi, không bấm tạo lại vô thức.",
        "imageUrl": "/assets/aiki-islands/island1_lesson4_engineer.jpg",
        "speech": "Nabi: Bấm... vẫn sai! Bấm... lại sai! Bàn tay hiệp sĩ cứ ra sáu ngón hoài à AKI ơi!\nAKI: Nabi bấm năm lần rồi đấy, hết cả lượt mà chả được gì! Nhìn bức tranh tay sáu ngón này xem, lỗi là do mình chưa sửa câu lệnh đấy!",
        "keyPoints": [
          "Trẻ nắm được quy trình 3 bước sửa câu lệnh khi hình ảnh AI sinh ra bị lỗi, không bấm tạo lại vô thức.",
          "3 bước sửa lỗi: Gọi tên lỗi -> Tìm chỗ thiếu trong câu lệnh -> Viết thêm chi tiết rồi mới tạo lại.",
          "QUY TẮC SỬA LỖI: Gọi tên lỗi · Tìm chỗ thiếu · Viết thêm vào câu lệnh"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-1-4-ky-su-tai-ba-stage2-confirm",
        "question": "Hình ra sai. Con làm gì trước tiên?",
        "options": [
          {
            "id": "opt-a",
            "text": "Bấm tạo lại ngay xem lần này có may hơn không",
            "imageUrl": "/assets/aiki-islands/island1_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Gọi tên cái lỗi ra đã, rồi mới tìm chỗ thiếu trong câu tả",
            "imageUrl": "/assets/aiki-islands/island1_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Đổi sang đề tài khác cho dễ",
            "imageUrl": "/assets/aiki-islands/island1_lesson4_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Chuẩn. Gọi tên lỗi — tìm chỗ thiếu — viết thêm rồi mới tạo.",
        "speech": "Chưa đúng. Bấm lại là tiêu lượt mà lỗi vẫn còn nguyên."
      },
      "stage3_video": {
        "id": "bai-1-4-ky-su-tai-ba-stage3-video",
        "title": "Video bài giảng: Bài 1.4 — Kỹ sư tài ba",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island1_lesson4_engineer.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Nabi: Bấm... vẫn sai! Bấm... lại sai! Bàn tay hiệp sĩ cứ ra sáu ngón hoài à AKI ơi!\nAKI: Nabi bấm năm lần rồi đấy, hết cả lượt mà chả được gì! Nhìn bức tranh tay sáu ngón này xem, lỗi là do mình chưa sửa câu lệnh đấy!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Khi Ây Ai vẽ sai thì sửa chữ, đừng bấm nút bừa! Bác sĩ câu lệnh phải bắt đúng bệnh, kê đúng thuốc!"
          },
          {
            "label": "Thực hành cùng AKI",
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
            "id": "bai-1-4-ky-su-tai-ba-q1",
            "prompt": "Ba bước sửa theo đúng thứ tự là gì?",
            "options": [
              "Bấm lại → đổi lời tả → bấm lại",
              "Gọi tên lỗi → tìm chỗ thiếu trong câu → viết thêm rồi mới tạo",
              "Tìm chỗ thiếu → bấm tạo → gọi tên lỗi"
            ],
            "correctIndex": 1,
            "explanation": "Phải gọi được tên lỗi thì mới biết tìm chỗ nào.",
            "visualUrl": "/assets/aiki-islands/island1_lesson4_cat.jpg"
          },
          {
            "id": "bai-1-4-ky-su-tai-ba-q2",
            "prompt": "Vì sao AKI treo năm bức hỏng lên “Bảo tàng thất bại” chứ không giấu đi?",
            "options": [
              "Vì gọi được tên cái lỗi thì mới sửa được nó",
              "Vì năm bức đó đẹp",
              "Vì AKI hết chỗ lưu"
            ],
            "correctIndex": 0,
            "explanation": "Không gọi được tên lỗi thì chỉ biết bấm lại thôi.",
            "visualUrl": "/assets/aiki-islands/island1_lesson4_opt_a.jpg"
          },
          {
            "id": "bai-1-4-ky-su-tai-ba-q3",
            "prompt": "Vì sao AKI vẽ bàn tay có sáu ngón?",
            "options": [
              "Vì câu tả không nói gì về số ngón tay — chỗ bỏ trống thì AI tự điền",
              "Vì AKI cố tình trêu",
              "Vì hết lượt tạo"
            ],
            "correctIndex": 0,
            "explanation": "Nối lại đúng câu thần chú của bài 1.1.",
            "visualUrl": "/assets/aiki-islands/island1_lesson4_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
        "sampleUrl": "/assets/aiki-islands/island1_lesson4_engineer.jpg",
        "creativeEngineMode": "prompt-doctor",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Ca 1: Hiệp Sĩ Bạc (Bàn tay 5 ngón)",
            "icon": "✋",
            "emoji": "✋",
            "iconImage": "/assets/aiki-islands/island1_lesson4_opt_a.jpg"
          },
          {
            "partNumber": 2,
            "title": "Ca 2: Sóc Bông (Mũ len đỏ quả bông)",
            "icon": "🐿️",
            "emoji": "🐿️",
            "iconImage": "/assets/game-engines/prompt-color-error.webp"
          },
          {
            "partNumber": 3,
            "title": "Ca 3: Mèo Mướp (Ghế mây đệm êm)",
            "icon": "🐱",
            "emoji": "🐱",
            "iconImage": "/assets/aiki-islands/island1_lesson1_opt_a.jpg"
          },
          {
            "partNumber": 4,
            "title": "Ca 4: Tranh Lem Nhem (Dọn sạch nền)",
            "icon": "🧹",
            "emoji": "🧹",
            "iconImage": "/assets/aiki-keys/key_where_pink.jpg"
          }
        ],
        "promptDoctorCase": {
          "caseTitle": "Bàn tay hiệp sĩ bị dị tật (Hiệp Sĩ Bạc)",
          "symptom": "Tranh vẽ hiệp sĩ nhưng bàn tay bị dị tật chỉ có 3 ngón tay và thiếu mất chiếc mũ len đỏ!",
          "originalPrompt": "Hiệp sĩ bọc giáp cầm kiếm thần đứng giữa rừng cây",
          "refImageUrl": "/assets/aiki-islands/island1_lesson4_opt_a.jpg",
          "curedImageUrl": "/assets/aiki-islands/island1_lesson4_engineer.jpg",
          "cureCards": [
            "✋ Kê đơn 5 ngón tay đầy đủ chuẩn xác",
            "🧶 Đội mũ len đỏ quả bông trắng",
            "🪑 Thêm ghế mây ấm cúng",
            "🦊 Đuôi cam to xù kiêu hãnh"
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
  {
    "id": "bai-2-1",
    "slug": "bai-2-1-buc-tranh-biet-noi",
    "islandNumber": 2,
    "lessonNumber": "2.1",
    "title": "Bài 2.1 — Bức tranh biết nói",
    "subtitle": "Bức tranh đẹp là bức tranh biết kể chuyện!",
    "imageUrl": "/assets/aiki-islands/island2_lesson1_story.jpg",
    "objective": "Trẻ nhận ra một bức tranh đẹp cần có câu chuyện thông qua 3 câu hỏi tìm chuyện: Đang làm gì? Có gì lạ? Rồi sao?",
    "skillLearned": "Kỹ năng nhìn ra 3 dấu hiệu của một bức tranh biết kể chuyện: Hành động, Điểm lạ, Diễn biến tiếp theo.",
    "nextLessonSlug": "bai-2-2-ai-la-ngoi-sao",
    "journey": {
      "stage1_goal": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage1-goal",
        "title": "Mục tiêu bài học: Bài 2.1 — Bức tranh biết nói",
        "goalText": "Trẻ nhận ra một bức tranh đẹp cần có câu chuyện thông qua 3 câu hỏi tìm chuyện: Đang làm gì? Có gì lạ? Rồi sao?",
        "imageUrl": "/assets/aiki-islands/island2_lesson1_story.jpg",
        "speech": "Nabi: AKI ơi xem này, tớ vẽ rất nhiều tranh đẹp lung linh luôn!\nAKI: Đẹp thật đấy Nabi! Nhưng xem xong một lúc tớ chẳng nhớ nổi bức nào. Vì các bức tranh này chỉ có hình đứng yên mà không có chuyện gì xảy ra cả!",
        "keyPoints": [
          "Trẻ nhận ra một bức tranh đẹp cần có câu chuyện thông qua 3 câu hỏi tìm chuyện: Đang làm gì? Có gì lạ? Rồi sao?",
          "Kỹ năng nhìn ra 3 dấu hiệu của một bức tranh biết kể chuyện: Hành động, Điểm lạ, Diễn biến tiếp theo.",
          "3 CÂU HỎI TÌM CHUYỆN: Đang làm gì? · Có gì lạ? · Rồi sao?"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage2-confirm",
        "question": "Thế nào là một bức tranh “biết kể chuyện”?",
        "options": [
          {
            "id": "opt-a",
            "text": "Bức có nhiều đồ vật và nhiều màu",
            "imageUrl": "/assets/aiki-islands/island2_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Bức khiến người xem tự hỏi “chuyện gì đang xảy ra ở đây nhỉ?”",
            "imageUrl": "/assets/aiki-islands/island2_lesson1_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Bức vẽ càng giống thật càng tốt",
            "imageUrl": "/assets/aiki-islands/island2_lesson1_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng rồi! Đẹp chưa đủ — phải kể được một chuyện.",
        "speech": "Chưa đúng. Nhiều đồ vật và giống thật vẫn có thể là một bức rỗng."
      },
      "stage3_video": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage3-video",
        "title": "Video bài giảng: Bài 2.1 — Bức tranh biết nói",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island2_lesson1_story.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Nabi: AKI ơi xem này, tớ vẽ rất nhiều tranh đẹp lung linh luôn!\nAKI: Đẹp thật đấy Nabi! Nhưng xem xong một lúc tớ chẳng nhớ nổi bức nào. Vì các bức tranh này chỉ có hình đứng yên mà không có chuyện gì xảy ra cả!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Bức tranh đẹp là bức tranh biết nói! Chỉ cần tự hỏi 3 câu: ĐANG LÀM GÌ? — CÓ GÌ LẠ? — RỒI SAO?"
          },
          {
            "label": "Thực hành cùng AKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Trong Xưởng hôm nay có 4 bức tranh. Các cậu hãy nhìn thật kỹ rồi kể bằng miệng câu chuyện mình nhìn thấy nhé! Hôm nay chúng mình luyện mắt nhìn chuyện của người họa sĩ!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 2.1 — Bức tranh biết nói",
        "questions": [
          {
            "id": "bai-2-1-buc-tranh-biet-noi-q1",
            "prompt": "Ba câu hỏi để tìm chuyện trong tranh là gì?",
            "options": [
              "Ai vẽ / vẽ bằng gì / vẽ lúc nào",
              "Đang làm gì? / Có gì lạ? / Rồi sao?",
              "Màu gì / to hay nhỏ / đẹp hay xấu"
            ],
            "correctIndex": 1,
            "explanation": "Ba câu này dùng lại suốt cả chương.",
            "visualUrl": "/assets/aiki-islands/island2_lesson1_cat.jpg"
          },
          {
            "id": "bai-2-1-buc-tranh-biet-noi-q2",
            "prompt": "Chi tiết nào sau đây là “CÓ GÌ LẠ”?",
            "options": [
              "Một cái ghế bị đổ, dấu chân bùn chạy vào nhà",
              "Bầu trời màu xanh",
              "Nhân vật mặc áo đẹp"
            ],
            "correctIndex": 0,
            "explanation": "Những chi tiết lạ chính là manh mối để đoán chuyện gì vừa xảy ra.",
            "visualUrl": "/assets/aiki-islands/island2_lesson1_opt_a.jpg"
          },
          {
            "id": "bai-2-1-buc-tranh-biet-noi-q3",
            "prompt": "Hôm nay con có tạo bức tranh nào không?",
            "options": [
              "Có, tạo bốn bức",
              "Không — hôm nay chỉ học cách NHÌN ra câu chuyện trong tranh",
              "Có, tạo một bức duy nhất"
            ],
            "correctIndex": 1,
            "explanation": "Từ bài sau, trước khi bấm TẠO hãy nghĩ: trong tranh của mình đang có chuyện gì?",
            "visualUrl": "/assets/aiki-islands/island2_lesson1_opt_b.jpg"
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-2-1-buc-tranh-biet-noi-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 2.1 — Bức tranh biết nói",
        "subjectName": "Bức Tranh Biết Nói",
        "badge": "Bài 2.1",
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 2.1 — Bức tranh biết nói\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 2.1 — Bức tranh biết nói",
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
    "title": "Bài 2.2 — Ai là ngôi sao?",
    "subtitle": "Bố cục 3 lớp và điểm vàng 1/3 để tôn vinh nhân vật chính!",
    "imageUrl": "/assets/aiki-islands/island2_lesson2_star.jpg",
    "objective": "Trẻ hiểu và sử dụng được 4 từ chỉ bố cục: Tiền cảnh, Ở giữa, Phía sau, Góc trái/Góc phải.",
    "skillLearned": "Kỹ năng xếp đặt bố cục 3 lớp và đặt nhân vật chính ở vị trí lệch 1/3 (điểm vàng).",
    "nextLessonSlug": "bai-2-3-cam-xuc-cua-sac-mau",
    "journey": {
      "stage1_goal": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage1-goal",
        "title": "Mục tiêu bài học: Bài 2.2 — Ai là ngôi sao?",
        "goalText": "Trẻ hiểu và sử dụng được 4 từ chỉ bố cục: Tiền cảnh, Ở giữa, Phía sau, Góc trái/Góc phải.",
        "imageUrl": "/assets/aiki-islands/island2_lesson2_star.jpg",
        "speech": "Mimi: AKI ơi, tớ vẽ tranh sinh nhật cho em Bống mà tớ kể tận 20 thứ: bánh kem, bóng bay, gấu bông, quà, nến, pháo hoa... Tranh ra rối tinh mù chẳng thấy em Bống đâu cả!\nAKI: Mimi ơi, nhiều thứ quá thì chẳng ai biết ai là ngôi sao của bức tranh cả! Mình phải xếp chỗ cho từng bạn chứ!",
        "keyPoints": [
          "Trẻ hiểu và sử dụng được 4 từ chỉ bố cục: Tiền cảnh, Ở giữa, Phía sau, Góc trái/Góc phải.",
          "Kỹ năng xếp đặt bố cục 3 lớp và đặt nhân vật chính ở vị trí lệch 1/3 (điểm vàng).",
          "BỐ CỤC 3 LỚP: Tiền cảnh · Ở giữa (Ngôi sao 1/3) · Phía sau"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage2-confirm",
        "question": "Một bức tranh nên có mấy “ngôi sao”?",
        "options": [
          {
            "id": "opt-a",
            "text": "Càng nhiều càng vui",
            "imageUrl": "/assets/aiki-islands/island2_lesson2_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Một ngôi sao chính",
            "imageUrl": "/assets/aiki-islands/island2_lesson2_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Ít nhất ba thì bức mới đầy",
            "imageUrl": "/assets/aiki-islands/island2_lesson2_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Một bức tranh — một ngôi sao.",
        "speech": "Chưa đúng. Cậu cần biết rõ muốn người xem nhìn vào ai TRƯỚC."
      },
      "stage3_video": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage3-video",
        "title": "Video bài giảng: Bài 2.2 — Ai là ngôi sao?",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island2_lesson2_star.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Mimi: AKI ơi, tớ vẽ tranh sinh nhật cho em Bống mà tớ kể tận 20 thứ: bánh kem, bóng bay, gấu bông, quà, nến, pháo hoa... Tranh ra rối tinh mù chẳng thấy em Bống đâu cả!\nAKI: Mimi ơi, nhiều thứ quá thì chẳng ai biết ai là ngôi sao của bức tranh cả! Mình phải xếp chỗ cho từng bạn chứ!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Bố cục là xếp chỗ cho mọi thứ trong tranh! Nhớ 3 lớp: Tiền cảnh (ở gần) · Ở giữa (ngôi sao chính) · Phía sau (hậu cảnh). Và đặt ngôi sao ở vị trí một phần ba nhé!"
          },
          {
            "label": "Thực hành cùng AKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Lấy một tờ giấy cắt ba hình: một ngôi sao và hai cảnh vật. Xếp ba lớp trên bàn, chụp ảnh nộp cho AKI rồi mới tả đúng thứ tự đó để tạo tranh nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 2.2 — Ai là ngôi sao?",
        "questions": [
          {
            "id": "bai-2-2-ai-la-ngoi-sao-q1",
            "prompt": "Bố cục nghĩa là gì?",
            "options": [
              "Xếp chỗ cho mọi thứ trong tranh",
              "Chọn màu cho tranh",
              "Đặt tên cho tranh"
            ],
            "correctIndex": 0,
            "explanation": "Nghe hơi oai, nhưng hiểu đơn giản thôi: bố cục là xếp chỗ.",
            "visualUrl": "/assets/aiki-islands/island2_lesson2_cat.jpg"
          },
          {
            "id": "bai-2-2-ai-la-ngoi-sao-q2",
            "prompt": "Thứ ở PHÍA TRƯỚC thường trông thế nào?",
            "options": [
              "To hơn",
              "Nhỏ hơn",
              "Mờ hẳn đi"
            ],
            "correctIndex": 0,
            "explanation": "Phía trước là những thứ gần người xem hơn nên trông to hơn; phía sau thì nhỏ và bớt nổi bật.",
            "visualUrl": "/assets/aiki-islands/island2_lesson2_opt_a.jpg"
          },
          {
            "id": "bai-2-2-ai-la-ngoi-sao-q3",
            "prompt": "Tạo xong thấy đồ vật chạy nhầm chỗ, con nên làm gì?",
            "options": [
              "Xem lại câu miêu tả còn thiếu gì rồi sửa trước, đừng vội tạo lại",
              "Bấm tạo lại ngay",
              "Bỏ bức đó, vẽ bức khác"
            ],
            "correctIndex": 0,
            "explanation": "Đúng ba bước sửa đã học ở bài 1.4.",
            "visualUrl": "/assets/aiki-islands/island2_lesson2_opt_b.jpg"
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 2.2 — Ai là ngôi sao?",
        "subjectName": "Thuyền Buồm Ánh Dương Ngôi Sao 1/3",
        "badge": "Bài 2.2",
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
            "title": "Hiệp Sĩ Cáo Lửa (Điểm vàng 1/3)",
            "icon": "🦊",
            "emoji": "🦊",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 2,
            "title": "Sóc Bông Hạt Dẻ (Điểm vàng 1/3)",
            "icon": "🐿️",
            "emoji": "🐿️",
            "iconImage": "/assets/game-engines/prompt-color-error.webp"
          },
          {
            "partNumber": 3,
            "title": "Thuyền Buồm Vàng (Điểm vàng 1/3)",
            "icon": "⛵",
            "emoji": "⛵",
            "iconImage": "/assets/aiki-keys/key_what_blue.jpg"
          },
          {
            "partNumber": 4,
            "title": "Mèo Phi Hành Gia (Điểm vàng 1/3)",
            "icon": "🐱",
            "emoji": "🐱",
            "iconImage": "/assets/aiki-islands/island1_lesson1_cat.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-2-2-ai-la-ngoi-sao-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 2.2 — Ai là ngôi sao?\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 2.2 — Ai là ngôi sao?",
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
    "title": "Bài 2.3 — Cảm xúc của sắc màu",
    "subtitle": "Chọn cảm xúc trước -> Chọn 4 tông ánh sáng sau!",
    "imageUrl": "/assets/aiki-islands/island2_lesson3_colors.jpg",
    "objective": "Trẻ hiểu mối quan hệ giữa cảm xúc và ánh sáng, làm chủ 4 tông ánh sáng cốt lõi.",
    "skillLearned": "Chọn cảm xúc trước, chọn tông ánh sáng sau: Bình minh vàng, Hoàng hôn cam tím, Đêm xanh trăng, Đèn nến tương phản.",
    "nextLessonSlug": "bai-2-4-manh-ghep-hoan-hao",
    "journey": {
      "stage1_goal": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage1-goal",
        "title": "Mục tiêu bài học: Bài 2.3 — Cảm xúc của sắc màu",
        "goalText": "Trẻ hiểu mối quan hệ giữa cảm xúc và ánh sáng, làm chủ 4 tông ánh sáng cốt lõi.",
        "imageUrl": "/assets/aiki-islands/island2_lesson3_colors.jpg",
        "speech": "Mimi: Lớp tớ đang làm phim kinh dị giật gân, tớ nhận làm poster và bảo AKI vẽ ngôi nhà cũ màu xanh... Thế mà tranh ra trông như khu resort nghỉ dưỡng mùa hè ấy!\nAKI: Ha ha! Vì Mimi chưa chọn cảm xúc mà đã chọn màu rồi! Ánh sáng ban ngày chan hòa thì làm sao kinh dị được!",
        "keyPoints": [
          "Trẻ hiểu mối quan hệ giữa cảm xúc và ánh sáng, làm chủ 4 tông ánh sáng cốt lõi.",
          "Chọn cảm xúc trước, chọn tông ánh sáng sau: Bình minh vàng, Hoàng hôn cam tím, Đêm xanh trăng, Đèn nến tương phản.",
          "CẢM XÚC CỦA SẮC MÀU: Bình minh vàng · Hoàng hôn cam tím · Đêm xanh · Đèn nến"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage2-confirm",
        "question": "Thứ tự đúng khi làm bài hôm nay là gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "Chọn ánh sáng đẹp trước, xem ra cảm xúc gì sau",
            "imageUrl": "/assets/aiki-islands/island2_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Chọn cảm xúc trước, chọn ánh sáng sau",
            "imageUrl": "/assets/aiki-islands/island2_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Tạo cả bốn kiểu ánh sáng rồi chọn bức đẹp nhất",
            "imageUrl": "/assets/aiki-islands/island2_lesson3_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng thứ tự rồi!",
        "speech": "Chưa đúng. Phải hỏi “mình muốn người xem thấy gì?” trước đã."
      },
      "stage3_video": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage3-video",
        "title": "Video bài giảng: Bài 2.3 — Cảm xúc của sắc màu",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island2_lesson3_colors.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Mimi: Lớp tớ đang làm phim kinh dị giật gân, tớ nhận làm poster và bảo AKI vẽ ngôi nhà cũ màu xanh... Thế mà tranh ra trông như khu resort nghỉ dưỡng mùa hè ấy!\nAKI: Ha ha! Vì Mimi chưa chọn cảm xúc mà đã chọn màu rồi! Ánh sáng ban ngày chan hòa thì làm sao kinh dị được!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Chọn cảm xúc trước, chọn tông ánh sáng sau! 4 tông ánh sáng bảo bối: Bình minh nắng vàng ấm áp · Hoàng hôn cam tím lắng đọng · Đêm xanh trăng huyền bí · Đèn nến tương phản gay cấn!"
          },
          {
            "label": "Thực hành cùng AKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Chọn một cảnh đơn giản như ngọn hải đăng hay căn phòng nhỏ. Đầu tiên, chọn một cảm xúc cậu muốn. Sau đó thử tạo cùng cảnh đó với bốn tông ánh sáng rồi chọn bức rung động nhất nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 2.3 — Cảm xúc của sắc màu",
        "questions": [
          {
            "id": "bai-2-3-cam-xuc-cua-sac-mau-q1",
            "prompt": "Cùng một cảnh, ánh sáng làm thay đổi cái gì?",
            "options": [
              "Cảm giác của người xem",
              "Số đồ vật trong tranh",
              "Kích thước bức tranh"
            ],
            "correctIndex": 0,
            "explanation": "Bậc cửa, đôi dép và cái quạt nan vẫn nguyên — chỉ ánh sáng đổi.",
            "visualUrl": "/assets/aiki-islands/island2_lesson3_cat.jpg"
          },
          {
            "id": "bai-2-3-cam-xuc-cua-sac-mau-q2",
            "prompt": "Ánh sáng nào khiến cảnh trông hơi buồn, hơi nhớ?",
            "options": [
              "Buổi sáng, nắng vàng nhạt",
              "Chiều muộn, nắng vàng cam và bóng dài",
              "Giữa trưa, ánh sáng mạnh bóng đậm"
            ],
            "correctIndex": 1,
            "explanation": "Còn buổi tối chỉ còn một vùng sáng nhỏ thì thấy hơi đáng sợ.",
            "visualUrl": "/assets/aiki-islands/island2_lesson3_opt_a.jpg"
          },
          {
            "id": "bai-2-3-cam-xuc-cua-sac-mau-q3",
            "prompt": "Cuối bài con chọn bức nào?",
            "options": [
              "Bức đúng nhất với cảm xúc ban đầu",
              "Bức đẹp nhất",
              "Bức sáng nhất"
            ],
            "correctIndex": 0,
            "explanation": "Nếu muốn vui mà tranh lại buồn thì đổi ánh sáng, cứ nhìn — so sánh — rồi sửa.",
            "visualUrl": "/assets/aiki-islands/island2_lesson3_opt_b.jpg"
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 2.3 — Cảm xúc của sắc màu",
        "subjectName": "Ngọn Hải Đăng Đêm Giông Tương Phản",
        "badge": "Bài 2.3",
        "illustrationType": "color-emotions",
        "lockedFeatures": [
          "ngọn hải đăng sọc đỏ trắng sừng sững",
          "luồng sáng vàng rực rỡ xuyên qua màn đêm",
          "bầu trời đêm bão giông tím thẫm sóng dữ"
        ],
        "akiMotto": "Chọn cảm xúc trước -> Chọn ánh sáng sau! 4 tông ánh sáng: Bình minh vàng, Hoàng hôn cam tím, Đêm xanh trăng, Đèn nến tương phản.",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Ngọn Hải\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Ngọn Hải",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Chú Trâu Đất Nặn",
            "icon": "🐃",
            "emoji": "🐃",
            "iconImage": "/assets/aiki-keys/key_what_blue.jpg"
          },
          {
            "partNumber": 2,
            "title": "Chú Mèo Béo Múp",
            "icon": "🐱",
            "emoji": "🐱",
            "iconImage": "/assets/aiki-islands/island1_lesson1_cat.jpg"
          },
          {
            "partNumber": 3,
            "title": "Bạn Robot Tí Hon",
            "icon": "🤖",
            "emoji": "🤖",
            "iconImage": "/assets/aiki-keys/key_action_orange.jpg"
          },
          {
            "partNumber": 4,
            "title": "Lâu Đài Cổ Tích",
            "icon": "🏰",
            "emoji": "🏰",
            "iconImage": "/assets/aiki-keys/key_where_pink.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-2-3-cam-xuc-cua-sac-mau-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 2.3 — Cảm xúc của sắc màu\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 2.3 — Cảm xúc của sắc màu",
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
    "title": "Bài 2.4 — Mảnh ghép hoàn hảo",
    "subtitle": "Ghép đủ 4 mảnh, đặt tên tranh và xuất khung tranh A3!",
    "imageUrl": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg",
    "objective": "Trẻ gộp 4 kỹ năng: Câu lệnh 4 ô, Bố cục 3 lớp, Ánh sáng cảm xúc và Kỹ năng đặt tên tranh để hoàn thiện tác phẩm A3.",
    "skillLearned": "Đóng gói tác phẩm hoàn chỉnh: Ghép 4 mảnh, đặt tên tranh gợi cảm xúc và xuất khung tranh A3 triển lãm.",
    "nextLessonSlug": "bai-3-1-ho-so-biet-doi",
    "journey": {
      "stage1_goal": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage1-goal",
        "title": "Mục tiêu bài học: Bài 2.4 — Mảnh ghép hoàn hảo",
        "goalText": "Trẻ gộp 4 kỹ năng: Câu lệnh 4 ô, Bố cục 3 lớp, Ánh sáng cảm xúc và Kỹ năng đặt tên tranh để hoàn thiện tác phẩm A3.",
        "imageUrl": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg",
        "speech": "Zico: Tớ tạo xong bức tranh cậu bé thả diều trên sân thượng rồi, lưu về máy xong tắt luôn nhé AKI!\nAKI: Ơ kìa Zico! Tranh đẹp thế này mà không có tên, không được lồng khung thì sao thành tác phẩm triển lãm được! Mình phải ghép đủ bốn mảnh chứ!",
        "keyPoints": [
          "Trẻ gộp 4 kỹ năng: Câu lệnh 4 ô, Bố cục 3 lớp, Ánh sáng cảm xúc và Kỹ năng đặt tên tranh để hoàn thiện tác phẩm A3.",
          "Đóng gói tác phẩm hoàn chỉnh: Ghép 4 mảnh, đặt tên tranh gợi cảm xúc và xuất khung tranh A3 triển lãm.",
          "4 MẢNH GHÉP HOÀN HẢO: Chuyện gì · Ngôi sao · Cảm xúc · Tên tranh A3"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage2-confirm",
        "question": "Tên tranh nào tốt hơn cho bức vẽ một cậu bé thả diều cuối mùa hè?",
        "options": [
          {
            "id": "opt-a",
            "text": "Cậu bé thả diều",
            "imageUrl": "/assets/aiki-islands/island2_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Chiếc diều cuối cùng của mùa hè",
            "imageUrl": "/assets/aiki-islands/island2_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Bức tranh số 4",
            "imageUrl": "/assets/aiki-islands/island2_lesson4_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Cái tên khiến người xem bắt đầu tò mò.",
        "speech": "Chưa đúng. Tên đó chỉ nói lại thứ mắt mình đã thấy."
      },
      "stage3_video": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage3-video",
        "title": "Video bài giảng: Bài 2.4 — Mảnh ghép hoàn hảo",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Zico: Tớ tạo xong bức tranh cậu bé thả diều trên sân thượng rồi, lưu về máy xong tắt luôn nhé AKI!\nAKI: Ơ kìa Zico! Tranh đẹp thế này mà không có tên, không được lồng khung thì sao thành tác phẩm triển lãm được! Mình phải ghép đủ bốn mảnh chứ!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Ghép đủ bốn mảnh: Chuyện gì xảy ra? Ai là ngôi sao? Muốn người xem cảm thấy gì? Góc nhìn nào? Và nhớ đặt tên tranh thật hay nhé!"
          },
          {
            "label": "Thực hành cùng AKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Đến lượt các cậu làm bức tranh cuối chương! Ghép đủ bốn mảnh, đặt tên tranh, trả lời ba câu hỏi chấm điểm của AKI rồi bấm In A3 đóng khung treo lên góc học tập nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 2.4 — Mảnh ghép hoàn hảo",
        "questions": [
          {
            "id": "bai-2-4-manh-ghep-hoan-hao-q1",
            "prompt": "Bốn mảnh ghép của một bức tranh hoàn chỉnh là gì?",
            "options": [
              "Chuyện gì đang xảy ra / Ai là ngôi sao / Cảm xúc là gì / Tên tranh",
              "Màu / nét / bóng / khung",
              "Cái gì / màu gì / to hay nhỏ / của ai"
            ],
            "correctIndex": 0,
            "explanation": "Nếu cả bốn cùng nói về một câu chuyện, bức tranh đã hoàn chỉnh.",
            "visualUrl": "/assets/aiki-islands/island2_lesson4_cat.jpg"
          },
          {
            "id": "bai-2-4-manh-ghep-hoan-hao-q2",
            "prompt": "Luật đặt tên tranh là gì?",
            "options": [
              "Tên nên kể thêm một chút chuyện, đừng chỉ gọi tên thứ có trong tranh",
              "Tên phải thật dài cho đầy đủ",
              "Tên phải có tên người vẽ"
            ],
            "correctIndex": 0,
            "explanation": "“Chiếc diều cuối cùng của mùa hè” khiến người xem nghĩ: mùa hè sắp hết à?",
            "visualUrl": "/assets/aiki-islands/island2_lesson4_opt_a.jpg"
          },
          {
            "id": "bai-2-4-manh-ghep-hoan-hao-q3",
            "prompt": "Câu chốt của cả chương là gì?",
            "options": [
              "Bức tranh đẹp là bức tranh kể được một chuyện",
              "Bức tranh đẹp là bức tranh nhiều màu",
              "Bức tranh đẹp là bức tranh giống thật"
            ],
            "correctIndex": 0,
            "explanation": "Chương sau con sẽ bước vào Biệt đội nhân vật AI.",
            "visualUrl": "/assets/aiki-islands/island2_lesson4_opt_b.jpg"
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 2.4 — Mảnh ghép hoàn hảo",
        "subjectName": "Khung Tranh A3 Gia Đình Thú Hoàn Hảo",
        "badge": "Bài 2.4",
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
        "creativeEngineMode": "layer-stacking",
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Hiệp Sĩ Cáo Lửa (Điểm vàng 1/3)",
            "icon": "🦊",
            "emoji": "🦊",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 2,
            "title": "Sóc Bông Hạt Dẻ (Điểm vàng 1/3)",
            "icon": "🐿️",
            "emoji": "🐿️",
            "iconImage": "/assets/game-engines/prompt-color-error.webp"
          },
          {
            "partNumber": 3,
            "title": "Thuyền Buồm Vàng (Điểm vàng 1/3)",
            "icon": "⛵",
            "emoji": "⛵",
            "iconImage": "/assets/aiki-keys/key_what_blue.jpg"
          },
          {
            "partNumber": 4,
            "title": "Mèo Phi Hành Gia (Điểm vàng 1/3)",
            "icon": "🐱",
            "emoji": "🐱",
            "iconImage": "/assets/aiki-islands/island1_lesson1_cat.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-2-4-manh-ghep-hoan-hao-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 2.4 — Mảnh ghép hoàn hảo\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 2.4 — Mảnh ghép hoàn hảo",
          "iconUrl": "/assets/aiki-islands/island2_lesson4_masterpiece.jpg",
          "stars": 3,
          "xp": 50
        },
        "nextLessonSlug": "bai-3-1-ho-so-biet-doi"
      }
    }
  },
  {
    "id": "bai-3-1",
    "slug": "bai-3-1-ho-so-biet-doi",
    "islandNumber": 3,
    "lessonNumber": "3.1",
    "title": "Bài 3.1 — Hồ sơ biệt đội",
    "subtitle": "Bảng ADN 6 ô: Bí quyết để nhân vật có linh hồn!",
    "imageUrl": "/assets/aiki-islands/island3_lesson1_profile.jpg",
    "objective": "Trẻ hiểu nhân vật hay không phải vì ngoại hình đẹp mà vì có tính cách thông qua việc điền đủ 6 ô Hồ sơ ADN nhân vật.",
    "skillLearned": "Kỹ năng xây dựng hồ sơ ADN 6 ô: Tên, Thích gì, Sợ gì, Giỏi gì, Dở gì, Ước mơ gì.",
    "nextLessonSlug": "bai-3-2-mat-ma-nhan-dien",
    "journey": {
      "stage1_goal": {
        "id": "bai-3-1-ho-so-biet-doi-stage1-goal",
        "title": "Mục tiêu bài học: Bài 3.1 — Hồ sơ biệt đội",
        "goalText": "Trẻ hiểu nhân vật hay không phải vì ngoại hình đẹp mà vì có tính cách thông qua việc điền đủ 6 ô Hồ sơ ADN nhân vật.",
        "imageUrl": "/assets/aiki-islands/island3_lesson1_profile.jpg",
        "speech": "Sonet: AKI ơi vẽ cho tớ một siêu hiệp sĩ cực mạnh, bay nhanh hơn gió, đấm vỡ núi đá, không sợ cái gì hết!\nAKI: Ơ... nhân vật cái gì cũng giỏi, chẳng sợ gì thì chán lắm Sonet ơi! Một nhân vật hay phải có điểm yếu và tính cách riêng cơ!",
        "keyPoints": [
          "Trẻ hiểu nhân vật hay không phải vì ngoại hình đẹp mà vì có tính cách thông qua việc điền đủ 6 ô Hồ sơ ADN nhân vật.",
          "Kỹ năng xây dựng hồ sơ ADN 6 ô: Tên, Thích gì, Sợ gì, Giỏi gì, Dở gì, Ước mơ gì.",
          "HỒ SƠ ADN NHÂN VẬT: Tên · Thích · Sợ · Giỏi · Dở · Ước mơ"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-3-1-ho-so-biet-doi-stage2-confirm",
        "question": "Trong sáu ô hồ sơ, hai ô nào không được bỏ trống?",
        "options": [
          {
            "id": "opt-a",
            "text": "Ô TÊN GÌ và ô THÍCH GÌ",
            "imageUrl": "/assets/aiki-islands/island3_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Ô SỢ GÌ và ô DỞ GÌ",
            "imageUrl": "/assets/aiki-islands/island3_lesson1_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Ô GIỎI GÌ và ô ƯỚC MƠ GÌ",
            "imageUrl": "/assets/aiki-islands/island3_lesson1_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Nghe hơi ngược nhỉ — nhưng đó là chỗ câu chuyện mọc ra.",
        "speech": "Chưa đúng. Ô SỢ và ô DỞ mới là hai ô không được bỏ trống."
      },
      "stage3_video": {
        "id": "bai-3-1-ho-so-biet-doi-stage3-video",
        "title": "Video bài giảng: Bài 3.1 — Hồ sơ biệt đội",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island3_lesson1_profile.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Sonet: AKI ơi vẽ cho tớ một siêu hiệp sĩ cực mạnh, bay nhanh hơn gió, đấm vỡ núi đá, không sợ cái gì hết!\nAKI: Ơ... nhân vật cái gì cũng giỏi, chẳng sợ gì thì chán lắm Sonet ơi! Một nhân vật hay phải có điểm yếu và tính cách riêng cơ!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "QT1: Hãy nghĩ ý tưởng của cậu trước! Bảng ADN 6 ô là bảo bối giúp nhân vật đi qua 100 bức tranh vẫn giữ đúng linh hồn!"
          },
          {
            "label": "Thực hành cùng AKI",
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
            "id": "bai-3-1-ho-so-biet-doi-q1",
            "prompt": "Kỹ năng hôm nay là gì?",
            "options": [
              "Viết hồ sơ trước — vẽ hình sau",
              "Vẽ hình trước — viết hồ sơ sau",
              "Vẽ và viết cùng lúc"
            ],
            "correctIndex": 0,
            "explanation": "Đọc hồ sơ cho bố mẹ nghe, người nghe vẫn tưởng tượng ra nhân vật dù chưa vẽ gì.",
            "visualUrl": "/assets/aiki-islands/island3_lesson1_cat.jpg"
          },
          {
            "id": "bai-3-1-ho-so-biet-doi-q2",
            "prompt": "Vì sao Tép dễ nghĩ ra câu chuyện hơn siêu anh hùng áo choàng đỏ?",
            "options": [
              "Vì mình đã biết tính cách của Tép",
              "Vì Tép nhỏ hơn",
              "Vì Tép dễ vẽ hơn"
            ],
            "correctIndex": 0,
            "explanation": "Nhân vật hay không phải vì đẹp, mà vì có tính cách.",
            "visualUrl": "/assets/aiki-islands/island3_lesson1_opt_a.jpg"
          },
          {
            "id": "bai-3-1-ho-so-biet-doi-q3",
            "prompt": "Viết “sợ nhiều thứ” vào ô SỢ GÌ thì sao?",
            "options": [
              "Chung chung quá — nên viết thật cụ thể như “sợ tiếng máy sấy tóc”",
              "Tốt, vì ai cũng hiểu",
              "Sai luật, không được viết chữ sợ"
            ],
            "correctIndex": 0,
            "explanation": "Càng riêng thì nhân vật càng dễ nhớ.",
            "visualUrl": "/assets/aiki-islands/island3_lesson1_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
    "objective": "Trẻ hiểu khái niệm nhất quán nhân vật và xác lập được Bản luật vẽ nhân vật với 3 đặc điểm nhận diện bất biến.",
    "skillLearned": "Thiết lập Mật mã 3 điểm khóa nhận diện cụ thể (mỗi đặc điểm từ 5 từ trở lên).",
    "nextLessonSlug": "bai-3-3-bien-hoa-bieu-cam",
    "journey": {
      "stage1_goal": {
        "id": "bai-3-2-mat-ma-nhan-dien-stage1-goal",
        "title": "Mục tiêu bài học: Bài 3.2 — Mật mã nhận diện",
        "goalText": "Trẻ hiểu khái niệm nhất quán nhân vật và xác lập được Bản luật vẽ nhân vật với 3 đặc điểm nhận diện bất biến.",
        "imageUrl": "/assets/aiki-islands/island3_lesson2_dna.jpg",
        "speech": "Tina: Ối AKI ơi! Bức một Sóc Bông của tớ đội mũ len đỏ đuôi to xù. Sang bức hai tự nhiên biến thành sóc đội nón lá đuôi chuột cống! Làm sao để giữ đúng một bạn bây giờ?\nAKI: Vì Tina chưa có Mật Mã Nhận Diện đấy! AI mà không được khóa đặc điểm thì mỗi lần bấm lại vẽ ra một người lạ hoắc!",
        "keyPoints": [
          "Trẻ hiểu khái niệm nhất quán nhân vật và xác lập được Bản luật vẽ nhân vật với 3 đặc điểm nhận diện bất biến.",
          "Thiết lập Mật mã 3 điểm khóa nhận diện cụ thể (mỗi đặc điểm từ 5 từ trở lên).",
          "MẬT MÃ 3 ĐIỂM KHÓA: Mũ len đỏ bông trắng · Đuôi xù cam · Túi vải nâu chéo"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-3-2-mat-ma-nhan-dien-stage2-confirm",
        "question": "Để AKI vẽ đúng một nhân vật qua nhiều lần, con cần đưa cho AKI mấy thứ?",
        "options": [
          {
            "id": "opt-a",
            "text": "Chỉ cần tả bằng lời là đủ",
            "imageUrl": "/assets/aiki-islands/island3_lesson2_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Hai thứ: ảnh mẫu và ba đặc điểm nhận diện",
            "imageUrl": "/assets/aiki-islands/island3_lesson2_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Chỉ cần ảnh mẫu là đủ",
            "imageUrl": "/assets/aiki-islands/island3_lesson2_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Ảnh mẫu để biết đúng bạn nào, ba đặc điểm để biết điều gì phải giữ nguyên.",
        "speech": "Chưa đúng. Cần cả hai: ảnh mẫu VÀ ba đặc điểm nhận diện."
      },
      "stage3_video": {
        "id": "bai-3-2-mat-ma-nhan-dien-stage3-video",
        "title": "Video bài giảng: Bài 3.2 — Mật mã nhận diện",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island3_lesson2_dna.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Tina: Ối AKI ơi! Bức một Sóc Bông của tớ đội mũ len đỏ đuôi to xù. Sang bức hai tự nhiên biến thành sóc đội nón lá đuôi chuột cống! Làm sao để giữ đúng một bạn bây giờ?\nAKI: Vì Tina chưa có Mật Mã Nhận Diện đấy! AI mà không được khóa đặc điểm thì mỗi lần bấm lại vẽ ra một người lạ hoắc!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Mật mã 3 điểm khóa: Đổi góc nhìn, không đổi đặc điểm nhận diện! Cả ba đặc điểm phải viết vào Bản Luật vẽ nhân vật và dán vào mọi câu lệnh!"
          },
          {
            "label": "Thực hành cùng AKI",
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
            "id": "bai-3-2-mat-ma-nhan-dien-q1",
            "prompt": "Một ảnh mẫu tốt trông thế nào?",
            "options": [
              "Nền đơn giản, chỉ một nhân vật, nhìn rõ mặt và toàn thân",
              "Nhiều nhân vật cho sinh động",
              "Nền tối và nhiều hiệu ứng cho ngầu"
            ],
            "correctIndex": 0,
            "explanation": "Ảnh mẫu càng rõ, AKI càng ít phải đoán.",
            "visualUrl": "/assets/aiki-islands/island3_lesson2_cat.jpg"
          },
          {
            "id": "bai-3-2-mat-ma-nhan-dien-q2",
            "prompt": "Đặc điểm nào dùng làm “mật mã nhận diện” được?",
            "options": [
              "Mắt đẹp",
              "Mũ len đỏ có quả bông trắng",
              "Trông ngầu"
            ],
            "correctIndex": 1,
            "explanation": "Kể cả “mũ đỏ” cũng chưa đủ rõ — phải nói được chính xác cái gì không được đổi.",
            "visualUrl": "/assets/aiki-islands/island3_lesson2_opt_a.jpg"
          },
          {
            "id": "bai-3-2-mat-ma-nhan-dien-q3",
            "prompt": "Mẹo chọn ba đặc điểm cho chuẩn là gì?",
            "options": [
              "Tưởng tượng nhân vật đứng giữa đám đông — con sẽ nói ba điều gì để chỉ ra bạn ấy?",
              "Chọn thứ mình thích nhất",
              "Chọn thứ AKI gợi ý"
            ],
            "correctIndex": 0,
            "explanation": "Ba điều ấy chính là ba đặc điểm nhận diện.",
            "visualUrl": "/assets/aiki-islands/island3_lesson2_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
            "title": "Cáo Lửa Zico — Vui vẻ 😄",
            "icon": "😄",
            "emoji": "😄",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 2,
            "title": "Cáo Lửa Zico — Tinh nghịch 😉",
            "icon": "😉",
            "emoji": "😉",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 3,
            "title": "Cáo Lửa Zico — Ngạc nhiên 😲",
            "icon": "😲",
            "emoji": "😲",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 4,
            "title": "Cáo Lửa Zico — Quyết tâm ✊",
            "icon": "✊",
            "emoji": "✊",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
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
    "objective": "Trẻ tạo được bộ 6 biểu cảm khuôn mặt cho cùng một nhân vật mà không bị trôi đặc điểm nhận diện.",
    "skillLearned": "Đổi biểu cảm và hành động nhưng luôn khóa chặt 3 đặc điểm nhận diện trong câu lệnh.",
    "nextLessonSlug": "bai-3-4-can-cu-bi-mat-cua-biet-doi",
    "journey": {
      "stage1_goal": {
        "id": "bai-3-3-bien-hoa-bieu-cam-stage1-goal",
        "title": "Mục tiêu bài học: Bài 3.3 — Biến hoá biểu cảm",
        "goalText": "Trẻ tạo được bộ 6 biểu cảm khuôn mặt cho cùng một nhân vật mà không bị trôi đặc điểm nhận diện.",
        "imageUrl": "/assets/aiki-islands/island3_lesson3_expressions.jpg",
        "speech": "Tina: Hôm qua tớ làm bộ sáu biểu cảm cho Bông: vui, buồn, sợ, giận, ngạc nhiên, buồn ngủ. Làm xong nhìn lại... ơ? Hình thì Bông có chuông vàng, hình lại mất chuông, hình vòng cổ đỏ hình lại đổi màu! Cứ như sáu chú chó khác nhau ấy!\nAKI: Vì Tina chỉ bảo tớ 'Bông đang vui', 'Bông đang giận' mà quên gửi kèm ảnh mẫu và luật vẽ nhân vật đấy!",
        "keyPoints": [
          "Trẻ tạo được bộ 6 biểu cảm khuôn mặt cho cùng một nhân vật mà không bị trôi đặc điểm nhận diện.",
          "Đổi biểu cảm và hành động nhưng luôn khóa chặt 3 đặc điểm nhận diện trong câu lệnh.",
          "CÂU THẦN CHÚ: ĐỔI MẶT · KHÔNG ĐỔI NGƯỜI"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-3-3-bien-hoa-bieu-cam-stage2-confirm",
        "question": "Muốn nhân vật đổi biểu cảm mà vẫn là một bạn, con phải làm gì mỗi lần tạo?",
        "options": [
          {
            "id": "opt-a",
            "text": "Chỉ cần viết “bạn ấy đang giận” là đủ",
            "imageUrl": "/assets/aiki-islands/island3_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Gửi kèm ảnh mẫu, nhắc lại đặc điểm nhận diện, rồi mới thêm biểu cảm",
            "imageUrl": "/assets/aiki-islands/island3_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Tạo lại nhân vật mới cho mỗi biểu cảm",
            "imageUrl": "/assets/aiki-islands/island3_lesson3_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng rồi! Thiếu ảnh mẫu và luật vẽ là AKI dễ vẽ ra một bạn khác.",
        "speech": "Chưa đúng. Nếu chỉ nói “đang giận” thì AKI rất dễ vẽ ra một bạn khác."
      },
      "stage3_video": {
        "id": "bai-3-3-bien-hoa-bieu-cam-stage3-video",
        "title": "Video bài giảng: Bài 3.3 — Biến hoá biểu cảm",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
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
            "label": "Thực hành cùng AKI",
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
            "id": "bai-3-3-bien-hoa-bieu-cam-q1",
            "prompt": "Câu để nhớ của bài này là gì?",
            "options": [
              "Đổi mặt, không đổi người",
              "Đổi người cho đỡ chán",
              "Mặt nào cũng được, miễn là đẹp"
            ],
            "correctIndex": 0,
            "explanation": "Sáu biểu cảm khác nhau nhưng vẫn phải là cùng một nhân vật.",
            "visualUrl": "/assets/aiki-islands/island3_lesson3_cat.jpg"
          },
          {
            "id": "bai-3-3-bien-hoa-bieu-cam-q2",
            "prompt": "Sau mỗi hình con phải làm gì?",
            "options": [
              "Nhìn lại ảnh mẫu và Luật vẽ xem đặc điểm quan trọng còn đủ không",
              "Làm ngay hình tiếp theo cho nhanh",
              "Xoá hình cũ đi"
            ],
            "correctIndex": 0,
            "explanation": "Thiếu một thứ nghĩa là nhân vật đã bị trôi — sửa câu lệnh rồi tạo lại.",
            "visualUrl": "/assets/aiki-islands/island3_lesson3_opt_a.jpg"
          },
          {
            "id": "bai-3-3-bien-hoa-bieu-cam-q3",
            "prompt": "Thử thách thật sự của bài này là gì?",
            "options": [
              "Sáu biểu cảm khác nhau nhưng vẫn phải là cùng một nhân vật",
              "Làm sáu cái mặt thật đẹp",
              "Làm thật nhanh trong một lượt"
            ],
            "correctIndex": 0,
            "explanation": "Ngoài màn hình, thử soi gương làm sáu biểu cảm này xem.",
            "visualUrl": "/assets/aiki-islands/island3_lesson3_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
            "title": "Cáo Lửa Zico — Vui vẻ 😄",
            "icon": "😄",
            "emoji": "😄",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 2,
            "title": "Cáo Lửa Zico — Tinh nghịch 😉",
            "icon": "😉",
            "emoji": "😉",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 3,
            "title": "Cáo Lửa Zico — Ngạc nhiên 😲",
            "icon": "😲",
            "emoji": "😲",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 4,
            "title": "Cáo Lửa Zico — Quyết tâm ✊",
            "icon": "✊",
            "emoji": "✊",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
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
    "objective": "Trẻ tạo được căn cứ riêng và bối cảnh sống phản ánh đúng tính cách trong hồ sơ ADN của nhân vật.",
    "skillLearned": "Câu lệnh hai tầng: Nhân vật đã khóa đặc điểm + Bối cảnh căn cứ kể tính cách (vận dụng bố cục Đảo 2).",
    "nextLessonSlug": "bai-4-1-3-cong-cua-vuong-quoc",
    "journey": {
      "stage1_goal": {
        "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-stage1-goal",
        "title": "Mục tiêu bài học: Bài 3.4 — Căn cứ bí mật của biệt đội",
        "goalText": "Trẻ tạo được căn cứ riêng và bối cảnh sống phản ánh đúng tính cách trong hồ sơ ADN của nhân vật.",
        "imageUrl": "/assets/aiki-islands/island3_lesson4_lair.jpg",
        "speech": "Sonet: AKI ơi xem phòng bí mật tớ dựng cho chú mèo Bum này: đèn chùm pha lê lung linh, ngai vàng dát bạc, tường đầy sách cổ... Đẹp mê ly luôn!\nAKI: Đẹp thật đấy Sonet... Nhưng Bum là chú mèo thích trèo cây đuổi bướm và sợ bóng tối. Ngồi trên ngai vàng nhìn Bum ngơ ngác như đi lạc vào nhà người khác ấy!",
        "keyPoints": [
          "Trẻ tạo được căn cứ riêng và bối cảnh sống phản ánh đúng tính cách trong hồ sơ ADN của nhân vật.",
          "Câu lệnh hai tầng: Nhân vật đã khóa đặc điểm + Bối cảnh căn cứ kể tính cách (vận dụng bố cục Đảo 2).",
          "CĂN CỨ BÍ MẬT: NƠI Ở KỂ ĐƯỢC TÍNH CÁCH NHÂN VẬT"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-stage2-confirm",
        "question": "Trước khi thêm một món đồ vào căn cứ, con phải tự hỏi câu gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "Món này có đẹp không?",
            "imageUrl": "/assets/aiki-islands/island3_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Thứ này liên quan đến điều gì của bạn ấy?",
            "imageUrl": "/assets/aiki-islands/island3_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Món này có đắt không?",
            "imageUrl": "/assets/aiki-islands/island3_lesson4_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Nếu chẳng liên quan gì cả, có lẽ món đồ ấy không cần xuất hiện.",
        "speech": "Chưa đúng. Căn cứ không cần đẹp — nó cần ĐÚNG với người sống trong đó."
      },
      "stage3_video": {
        "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-stage3-video",
        "title": "Video bài giảng: Bài 3.4 — Căn cứ bí mật của biệt đội",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island3_lesson4_lair.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Sonet: AKI ơi xem phòng bí mật tớ dựng cho chú mèo Bum này: đèn chùm pha lê lung linh, ngai vàng dát bạc, tường đầy sách cổ... Đẹp mê ly luôn!\nAKI: Đẹp thật đấy Sonet... Nhưng Bum là chú mèo thích trèo cây đuổi bướm và sợ bóng tối. Ngồi trên ngai vàng nhìn Bum ngơ ngác như đi lạc vào nhà người khác ấy!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Nơi ở cũng phải kể được tính cách của nhân vật! Trước khi thêm một món đồ, hãy nhìn lại Hồ sơ và hỏi: 'Thứ này liên quan đến điều gì của bạn ấy?'"
          },
          {
            "label": "Thực hành cùng AKI",
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
            "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-q1",
            "prompt": "Vì sao lâu đài pha lê có ngai vàng lại không hợp với Tép?",
            "options": [
              "Vì Tép là chú chuột thích nhặt nắp chai, giỏi nhớ đường — ngai vàng chẳng giống Tép chút nào",
              "Vì lâu đài khó vẽ",
              "Vì Tép không thích màu vàng"
            ],
            "correctIndex": 0,
            "explanation": "Một góc dưới cầu thang có hộp thiếc đựng nắp chai mới đúng chất Tép.",
            "visualUrl": "/assets/aiki-islands/island3_lesson4_cat.jpg"
          },
          {
            "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-q2",
            "prompt": "Kỹ năng hôm nay là gì?",
            "options": [
              "Nơi ở cũng phải kể được tính cách của nhân vật",
              "Nơi ở phải thật to và thật đẹp",
              "Nơi ở nên giống nhà thật của mình"
            ],
            "correctIndex": 0,
            "explanation": "Nhìn lại Hồ sơ trước khi thêm bất cứ món đồ nào.",
            "visualUrl": "/assets/aiki-islands/island3_lesson4_opt_a.jpg"
          },
          {
            "id": "bai-3-4-can-cu-bi-mat-cua-biet-doi-q3",
            "prompt": "Làm sao biết căn cứ của con đã đúng?",
            "options": [
              "Nếu chỉ nhìn căn phòng mà người khác đoán được bạn ấy thích gì, sợ gì",
              "Nếu căn phòng có nhiều đồ nhất",
              "Nếu căn phòng sáng nhất"
            ],
            "correctIndex": 0,
            "explanation": "Câu chốt cả chương: nhân vật hay không phải vì đẹp, mà vì có tính cách.",
            "visualUrl": "/assets/aiki-islands/island3_lesson4_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
            "title": "Hiệp Sĩ Cáo Lửa (Điểm vàng 1/3)",
            "icon": "🦊",
            "emoji": "🦊",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 2,
            "title": "Sóc Bông Hạt Dẻ (Điểm vàng 1/3)",
            "icon": "🐿️",
            "emoji": "🐿️",
            "iconImage": "/assets/game-engines/prompt-color-error.webp"
          },
          {
            "partNumber": 3,
            "title": "Thuyền Buồm Vàng (Điểm vàng 1/3)",
            "icon": "⛵",
            "emoji": "⛵",
            "iconImage": "/assets/aiki-keys/key_what_blue.jpg"
          },
          {
            "partNumber": 4,
            "title": "Mèo Phi Hành Gia (Điểm vàng 1/3)",
            "icon": "🐱",
            "emoji": "🐱",
            "iconImage": "/assets/aiki-islands/island1_lesson1_cat.jpg"
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
  {
    "id": "bai-4-1",
    "slug": "bai-4-1-3-cong-cua-vuong-quoc",
    "islandNumber": 4,
    "lessonNumber": "4.1",
    "title": "Bài 4.1 — 3 Cổng của Vương Quốc",
    "subtitle": "Mọi câu chuyện cuốn hút đều đi qua 3 Cổng!",
    "imageUrl": "/assets/aiki-islands/island4_lesson1_3gates.jpg",
    "objective": "Trẻ hiểu cấu trúc cốt truyện 3 phần cơ bản: Khởi đầu (Bình thường), Thắt nút (Có chuyện/Sự cố), Mở nút (Giải quyết).",
    "skillLearned": "Kỹ năng kể chuyện theo cấu trúc 3 Cổng: Bình thường -> Có chuyện -> Giải quyết.",
    "nextLessonSlug": "bai-4-2-04-chang-thu-thach",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-1-3-cong-cua-vuong-quoc-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.1 — 3 Cổng của Vương Quốc",
        "goalText": "Trẻ hiểu cấu trúc cốt truyện 3 phần cơ bản: Khởi đầu (Bình thường), Thắt nút (Có chuyện/Sự cố), Mở nút (Giải quyết).",
        "imageUrl": "/assets/aiki-islands/island4_lesson1_3gates.jpg",
        "speech": "Bona: Hôm qua tớ kể chuyện về Chíp cho AKI nghe: 'Chíp thức dậy. Chíp ăn sáng. Chíp ra sân chơi. Chíp ăn trưa. Chíp về nhà ngủ. Hết!'\nAKI: Ơ... nghe xong tớ thấy thiếu thiếu Bona ơi! Mọi việc đều đúng, nhưng phẳng lì như tờ giấy vì chẳng có biến cố gì xảy ra cả!",
        "keyPoints": [
          "Trẻ hiểu cấu trúc cốt truyện 3 phần cơ bản: Khởi đầu (Bình thường), Thắt nút (Có chuyện/Sự cố), Mở nút (Giải quyết).",
          "Kỹ năng kể chuyện theo cấu trúc 3 Cổng: Bình thường -> Có chuyện -> Giải quyết.",
          "3 CỔNG CỐT TRUYỆN: Khởi đầu bình thường · Có chuyện xảy ra · Giải quyết xong xuôi"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-1-3-cong-cua-vuong-quoc-stage2-confirm",
        "question": "Chuyện nào sau đây là một CÂU CHUYỆN?",
        "options": [
          {
            "id": "opt-a",
            "text": "Chíp ngủ dậy, đánh răng, ăn sáng, đi học, về nhà",
            "imageUrl": "/assets/aiki-islands/island4_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Chíp ra sân chơi bóng, bóng mắc bên kia hàng rào, Chíp khều lại bằng cành cây",
            "imageUrl": "/assets/aiki-islands/island4_lesson1_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Chíp có quả bóng đỏ, áo xanh, giày trắng",
            "imageUrl": "/assets/aiki-islands/island4_lesson1_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Câu chuyện đó đã đi qua đủ ba cổng.",
        "speech": "Chưa đúng. Chuỗi việc suôn sẻ hay bản mô tả đều chưa phải câu chuyện."
      },
      "stage3_video": {
        "id": "bai-4-1-3-cong-cua-vuong-quoc-stage3-video",
        "title": "Video bài giảng: Bài 4.1 — 3 Cổng của Vương Quốc",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island4_lesson1_3gates.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Bona: Hôm qua tớ kể chuyện về Chíp cho AKI nghe: 'Chíp thức dậy. Chíp ăn sáng. Chíp ra sân chơi. Chíp ăn trưa. Chíp về nhà ngủ. Hết!'\nAKI: Ơ... nghe xong tớ thấy thiếu thiếu Bona ơi! Mọi việc đều đúng, nhưng phẳng lì như tờ giấy vì chẳng có biến cố gì xảy ra cả!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "Mọi câu chuyện vĩ đại đều đi qua 3 Cổng: Cổng 1 Khởi đầu bình thường · Cổng 2 Thắt nút sự cố · Cổng 3 Mở nút giải quyết!"
          },
          {
            "label": "Thực hành cùng AKI",
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
            "id": "bai-4-1-3-cong-cua-vuong-quoc-q1",
            "prompt": "Ba cổng của một câu chuyện là gì?",
            "options": [
              "Bình thường — Có chuyện — Giải quyết",
              "Mở — Thân — Kết bài",
              "Ai — Ở đâu — Khi nào"
            ],
            "correctIndex": 0,
            "explanation": "Chỉ cần nhớ ba chữ: Bình thường – Có chuyện – Giải quyết.",
            "visualUrl": "/assets/aiki-islands/island4_lesson1_cat.jpg"
          },
          {
            "id": "bai-4-1-3-cong-cua-vuong-quoc-q2",
            "prompt": "Cổng hai hỏi điều gì?",
            "options": [
              "Điều gì bất ngờ xảy ra?",
              "Nhân vật tên là gì?",
              "Chuyện xảy ra ở đâu?"
            ],
            "correctIndex": 0,
            "explanation": "Không có cổng hai thì chỉ là kể việc, chưa thành chuyện.",
            "visualUrl": "/assets/aiki-islands/island4_lesson1_opt_a.jpg"
          },
          {
            "id": "bai-4-1-3-cong-cua-vuong-quoc-q3",
            "prompt": "Khi con bí, AKI được làm gì?",
            "options": [
              "Chỉ gợi ý bằng ba câu hỏi, không nghĩ chuyện thay con",
              "Viết luôn câu chuyện cho con",
              "Chọn giúp con một chuyện có sẵn"
            ],
            "correctIndex": 0,
            "explanation": "Vì câu chuyện hay nhất phải bắt đầu từ ý tưởng của chính con.",
            "visualUrl": "/assets/aiki-islands/island4_lesson1_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
    "title": "Bài 4.2 — 04 Chặng thử thách",
    "subtitle": "Khung xương 4 Chặng: Muốn -> Cản -> Làm -> Kết!",
    "imageUrl": "/assets/aiki-islands/island4_lesson2_4beats.jpg",
    "objective": "Trẻ nắm được cấu trúc khung xương câu chuyện 4 chặng: Muốn làm gì, Cái gì cản lại, Làm cách nào, Kết quả ra sao.",
    "skillLearned": "Viết kịch bản 4 chặng: Muốn -> Cản -> Làm -> Kết, khai thác điểm yếu trong hồ sơ nhân vật làm chướng ngại vật.",
    "nextLessonSlug": "bai-4-3-ban-do-8-o-p1-mo",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-2-04-chang-thu-thach-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.2 — 04 Chặng thử thách",
        "goalText": "Trẻ nắm được cấu trúc khung xương câu chuyện 4 chặng: Muốn làm gì, Cái gì cản lại, Làm cách nào, Kết quả ra sao.",
        "imageUrl": "/assets/aiki-islands/island4_lesson2_4beats.jpg",
        "speech": "Lala: Hôm qua tớ viết chuyện cho Bơ thế này: 'Bơ muốn tìm chiếc huy hiệu bị mất. Bơ đi tìm. Bơ tìm thấy ngay. Hết!'\nAKI: Ơ... nhanh quá Lala ơi! Tớ còn chưa kịp lo cho Bơ thì câu chuyện đã xong rồi! Tìm thấy ngay thì đâu còn là cuộc phiêu lưu nữa!",
        "keyPoints": [
          "Trẻ nắm được cấu trúc khung xương câu chuyện 4 chặng: Muốn làm gì, Cái gì cản lại, Làm cách nào, Kết quả ra sao.",
          "Viết kịch bản 4 chặng: Muốn -> Cản -> Làm -> Kết, khai thác điểm yếu trong hồ sơ nhân vật làm chướng ngại vật.",
          "KHUNG XƯƠNG 4 CHẶNG: Muốn · Cản · Làm · Kết"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-2-04-chang-thu-thach-stage2-confirm",
        "question": "Chặng CẢN nên lấy ý từ đâu?",
        "options": [
          {
            "id": "opt-a",
            "text": "Từ thời tiết hay chuyện tình cờ",
            "imageUrl": "/assets/aiki-islands/island4_lesson2_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Từ ô SỢ hoặc ô DỞ trong Hồ sơ nhân vật",
            "imageUrl": "/assets/aiki-islands/island4_lesson2_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Từ gợi ý của AKI",
            "imageUrl": "/assets/aiki-islands/island4_lesson2_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Lúc ấy câu chuyện mới thật sự là chuyện của nhân vật đó.",
        "speech": "Chưa đúng. Hồ sơ nhân vật mới là nơi có sẵn cái cản hay nhất."
      },
      "stage3_video": {
        "id": "bai-4-2-04-chang-thu-thach-stage3-video",
        "title": "Video bài giảng: Bài 4.2 — 04 Chặng thử thách",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
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
            "label": "Thực hành cùng AKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Mở Hồ sơ nhân vật và viết 4 dòng: Bạn ấy muốn gì? Điều gì cản lại? Bạn ấy làm cách nào? Cuối cùng ra sao? Đọc to lên xem đã thấy hồi hộp chưa nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-4-2-04-chang-thu-thach-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 4.2 — 04 Chặng thử thách",
        "questions": [
          {
            "id": "bai-4-2-04-chang-thu-thach-q1",
            "prompt": "Bốn chặng theo đúng thứ tự là gì?",
            "options": [
              "MUỐN — CẢN — LÀM — KẾT",
              "KẾT — MUỐN — CẢN — LÀM",
              "AI — Ở ĐÂU — LÀM GÌ — BAO GIỜ"
            ],
            "correctIndex": 0,
            "explanation": "Bốn chặng này chính là bộ xương cho storyboard ở bài 4.3.",
            "visualUrl": "/assets/aiki-islands/island4_lesson2_cat.jpg"
          },
          {
            "id": "bai-4-2-04-chang-thu-thach-q2",
            "prompt": "Vì sao chặng CẢN lại quan trọng nhất?",
            "options": [
              "Vì không có cản thì mọi việc quá dễ, câu chuyện hết hấp dẫn",
              "Vì nó dài nhất",
              "Vì nó đứng đầu tiên"
            ],
            "correctIndex": 0,
            "explanation": "Huy hiệu nằm dưới gầm bàn thì dễ quá — ngoài sân lúc có sấm mới thành chuyện của Bơ.",
            "visualUrl": "/assets/aiki-islands/island4_lesson2_opt_a.jpg"
          },
          {
            "id": "bai-4-2-04-chang-thu-thach-q3",
            "prompt": "Viết xong bốn dòng, việc bắt buộc tiếp theo là gì?",
            "options": [
              "Đọc to cả bốn dòng một lần, chỗ nào nghe quá dễ thì làm khó hơn",
              "Gửi ngay cho AKI vẽ",
              "In ra đóng khung"
            ],
            "correctIndex": 0,
            "explanation": "Tai bắt lỗi giỏi hơn mắt.",
            "visualUrl": "/assets/aiki-islands/island4_lesson2_opt_b.jpg"
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-4-2-04-chang-thu-thach-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 4.2 — 04 Chặng thử thách",
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 4.2 — 04 Chặng thử thách\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 4.2 — 04 Chặng thử thách",
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
    "title": "Bài 4.3 — Bản đồ 8 Ô - P1: Mở",
    "subtitle": "Storyboard hình que: Bản vẽ xương sống của đạo diễn truyện tranh!",
    "imageUrl": "/assets/aiki-islands/island4_lesson3_storyboard1.jpg",
    "objective": "Trẻ biết cách chia kịch bản thành 8 ô storyboard vẽ tay bằng hình que trước khi bắt tay vào tạo hình AI.",
    "skillLearned": "Kỹ năng phác thảo Storyboard 8 ô vẽ tay bằng hình que: Phân bổ nhịp điệu truyện từ ô 1 đến ô 4.",
    "nextLessonSlug": "bai-4-4-ban-do-8-o-p2-khoa",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.3 — Bản đồ 8 Ô - P1: Mở",
        "goalText": "Trẻ biết cách chia kịch bản thành 8 ô storyboard vẽ tay bằng hình que trước khi bắt tay vào tạo hình AI.",
        "imageUrl": "/assets/aiki-islands/island4_lesson3_storyboard1.jpg",
        "speech": "Nina: Hôm qua tớ sốt ruột quá nên tạo luôn tám bức cho chuyện của Mít. Bức nào cũng đẹp lung linh!\nAKI: Nhưng khi xếp tám bức cạnh nhau thì... ơ? Có hai bức Mít đang chạy giống hệt nhau, rồi tự nhiên từ đang tìm đồ nhảy vọt sang ăn mừng chiến thắng! Mất hẳn đoạn vượt khó rồi Nina ơi!",
        "keyPoints": [
          "Trẻ biết cách chia kịch bản thành 8 ô storyboard vẽ tay bằng hình que trước khi bắt tay vào tạo hình AI.",
          "Kỹ năng phác thảo Storyboard 8 ô vẽ tay bằng hình que: Phân bổ nhịp điệu truyện từ ô 1 đến ô 4.",
          "STORYBOARD 8 Ô: VẼ HÌNH QUE · GIỮ ĐÚNG NHỊP ĐIỆU CỐT TRUYỆN"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage2-confirm",
        "question": "Mỗi ô trong storyboard chứa bao nhiêu việc?",
        "options": [
          {
            "id": "opt-a",
            "text": "Càng nhiều càng đỡ tốn ô",
            "imageUrl": "/assets/aiki-islands/island4_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Một việc",
            "imageUrl": "/assets/aiki-islands/island4_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Hai việc cho nhanh",
            "imageUrl": "/assets/aiki-islands/island4_lesson3_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Một ô – một việc.",
        "speech": "Chưa đúng. Nhét nhiều việc vào một ô là hình sẽ rối."
      },
      "stage3_video": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage3-video",
        "title": "Video bài giảng: Bài 4.3 — Bản đồ 8 Ô - P1: Mở",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
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
            "label": "Thực hành cùng AKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Lấy một tờ giấy, chia thành 8 ô. Vẽ hình que thật nhanh cho 4 ô đầu và viết một câu ngắn dưới mỗi ô xem chuyện gì đang xảy ra. Xong xuôi nhớ chụp ảnh nộp cho AKI nhé!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 4.3 — Bản đồ 8 Ô - P1: Mở",
        "questions": [
          {
            "id": "bai-4-3-ban-do-8-o-p1-mo-q1",
            "prompt": "Storyboard dùng để làm gì?",
            "options": [
              "Là bản nháp để nhìn được cả câu chuyện trước khi làm tranh thật",
              "Là bức tranh cuối cùng để in ra",
              "Là bìa của cuốn truyện"
            ],
            "correctIndex": 0,
            "explanation": "Nó không cần đẹp, chỉ cần nhìn vào là hiểu chuyện gì đang xảy ra.",
            "visualUrl": "/assets/aiki-islands/island4_lesson3_cat.jpg"
          },
          {
            "id": "bai-4-3-ban-do-8-o-p1-mo-q2",
            "prompt": "Vẽ storyboard nên vẽ như thế nào?",
            "options": [
              "Vẽ nhanh bằng hình que — đầu tròn, người một nét",
              "Vẽ thật đẹp và tô màu đầy đủ",
              "Nhờ AKI vẽ hộ"
            ],
            "correctIndex": 0,
            "explanation": "Gạch đi, vẽ lại thoải mái — đây chính là lúc để sửa.",
            "visualUrl": "/assets/aiki-islands/island4_lesson3_opt_a.jpg"
          },
          {
            "id": "bai-4-3-ban-do-8-o-p1-mo-q3",
            "prompt": "Soi lại tám ô, con kiểm tra những gì?",
            "options": [
              "Có ô nào bị trùng không, có đoạn nào nhảy quá nhanh không, nhìn tám ô có hiểu chuyện không",
              "Vẽ có đẹp không, có đủ màu không",
              "Chữ có sạch không, giấy có thẳng không"
            ],
            "correctIndex": 0,
            "explanation": "Chưa ổn thì sửa ngay trên giấy.",
            "visualUrl": "/assets/aiki-islands/island4_lesson3_opt_b.jpg"
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-4-3-ban-do-8-o-p1-mo-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 4.3 — Bản đồ 8 Ô - P1: Mở",
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 4.3 — Bản đồ 8 Ô - P1: Mở\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 4.3 — Bản đồ 8 Ô - P1: Mở",
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
    "title": "Bài 4.4 — Bản đồ 8 Ô - P2: Khoá",
    "subtitle": "Khóa 3 yếu tố: Đúng nhân vật · Đúng việc · Đúng phong cách!",
    "imageUrl": "/assets/aiki-islands/island4_lesson4_storyboard2.jpg",
    "objective": "Trẻ thực hiện tạo hình 8 khung truyện tranh bằng AI bám sát Storyboard tay, không để trôi nhân vật và phong cách.",
    "skillLearned": "Kỹ năng khóa 3 yếu tố trong từng câu lệnh: Đúng nhân vật (ảnh mẫu + luật vẽ), Đúng việc (theo storyboard), Đúng phong cách tranh.",
    "nextLessonSlug": "bai-4-5-vuong-mien-hoan-hao",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.4 — Bản đồ 8 Ô - P2: Khoá",
        "goalText": "Trẻ thực hiện tạo hình 8 khung truyện tranh bằng AI bám sát Storyboard tay, không để trôi nhân vật và phong cách.",
        "imageUrl": "/assets/aiki-islands/island4_lesson4_storyboard2.jpg",
        "speech": "Nina: Tớ có Storyboard rồi nên bắt đầu tạo hình. Khung một, ổn. Khung hai, ổn. Đến khung năm thì... ơ? Mít tự nhiên đổi áo! Khung sáu đổi kiểu tóc! Khung bảy còn chuyển sang kiểu vẽ khác hẳn!\nAKI: Vì Nina mải nhìn vào từng bức mà quên đối chiếu với Storyboard và Luật vẽ nhân vật đấy!",
        "keyPoints": [
          "Trẻ thực hiện tạo hình 8 khung truyện tranh bằng AI bám sát Storyboard tay, không để trôi nhân vật và phong cách.",
          "Kỹ năng khóa 3 yếu tố trong từng câu lệnh: Đúng nhân vật (ảnh mẫu + luật vẽ), Đúng việc (theo storyboard), Đúng phong cách tranh.",
          "KHÓA 3 YẾU TỐ: Đúng nhân vật · Đúng việc storyboard · Đúng phong cách"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage2-confirm",
        "question": "Mỗi khung truyện cần giữ đúng ba thứ nào?",
        "options": [
          {
            "id": "opt-a",
            "text": "Đúng người — Đúng việc — Đúng kiểu",
            "imageUrl": "/assets/aiki-islands/island4_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Đúng màu — Đúng nét — Đúng bóng",
            "imageUrl": "/assets/aiki-islands/island4_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Đúng tên — Đúng tuổi — Đúng nghề",
            "imageUrl": "/assets/aiki-islands/island4_lesson4_opt_a.jpg"
          }
        ],
        "correctIndex": 0,
        "explanation": "Chuẩn! Ba thứ này giữ cho cả tám khung là một bộ.",
        "speech": "Chưa đúng. Ba thứ là: đúng người, đúng việc, đúng kiểu."
      },
      "stage3_video": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage3-video",
        "title": "Video bài giảng: Bài 4.4 — Bản đồ 8 Ô - P2: Khoá",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
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
            "label": "Thực hành cùng AKI",
            "startSec": 120,
            "endSec": 180,
            "speech": "Làm lần lượt từ ô một đến ô tám. Trước mỗi khung hãy nhìn Storyboard chứ đừng nghĩ lại từ đầu. Sau mỗi khung, kiểm tra ngay: Nhân vật có đổi không? Việc có đúng không? Cùng hoàn thiện 8 khung truyện nào!"
          }
        ]
      },
      "stage4_quiz": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage4-quiz",
        "title": "Thử tài kiến thức: Bài 4.4 — Bản đồ 8 Ô - P2: Khoá",
        "questions": [
          {
            "id": "bai-4-4-ban-do-8-o-p2-khoa-q1",
            "prompt": "Trước mỗi khung con nên nhìn vào đâu?",
            "options": [
              "Nhìn storyboard, đừng nghĩ lại câu chuyện từ đầu",
              "Nhìn khung cuối cùng",
              "Nhắm mắt tưởng tượng lại"
            ],
            "correctIndex": 0,
            "explanation": "Storyboard chỉ đường cho câu chuyện.",
            "visualUrl": "/assets/aiki-islands/island4_lesson4_cat.jpg"
          },
          {
            "id": "bai-4-4-ban-do-8-o-p2-khoa-q2",
            "prompt": "Mẹo để phát hiện lỗi sớm là gì?",
            "options": [
              "Xong khung nào đặt ngay cạnh khung trước để soi",
              "Làm đủ tám khung rồi mới kiểm tra một lượt",
              "Nhờ bố mẹ kiểm tra hộ"
            ],
            "correctIndex": 0,
            "explanation": "Phát hiện sớm một chiếc áo đổi màu thì sửa nhanh hơn nhiều.",
            "visualUrl": "/assets/aiki-islands/island4_lesson4_opt_a.jpg"
          },
          {
            "id": "bai-4-4-ban-do-8-o-p2-khoa-q3",
            "prompt": "Phát hiện nhân vật bị đổi ở một khung, con làm gì?",
            "options": [
              "Sửa câu lệnh rồi mới tạo lại",
              "Bấm tạo lại ngay",
              "Bỏ khung đó đi"
            ],
            "correctIndex": 0,
            "explanation": "Ảnh mẫu và Luật vẽ giúp nhân vật đi hết câu chuyện mà vẫn là chính mình.",
            "visualUrl": "/assets/aiki-islands/island4_lesson4_opt_b.jpg"
          }
        ],
        "passScore": 2
      },
      "stage5_practice": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage5-practice",
        "title": "Xưởng Sáng Tạo AI: Bài 4.4 — Bản đồ 8 Ô - P2: Khoá",
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
            "title": "Cáo Lửa Zico — Vui vẻ 😄",
            "icon": "😄",
            "emoji": "😄",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 2,
            "title": "Cáo Lửa Zico — Tinh nghịch 😉",
            "icon": "😉",
            "emoji": "😉",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 3,
            "title": "Cáo Lửa Zico — Ngạc nhiên 😲",
            "icon": "😲",
            "emoji": "😲",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          },
          {
            "partNumber": 4,
            "title": "Cáo Lửa Zico — Quyết tâm ✊",
            "icon": "✊",
            "emoji": "✊",
            "iconImage": "/assets/aiki-islands/island1_lesson4_engineer.jpg"
          }
        ]
      },
      "stage6_completion": {
        "id": "bai-4-4-ban-do-8-o-p2-khoa-stage6-completion",
        "title": "Chúc mừng Nhà Sáng Tạo Tí Hon!",
        "congratsMessage": "Bé đã hoàn thành xuất sắc bài học \"Bài 4.4 — Bản đồ 8 Ô - P2: Khoá\" và xuất xưởng tác phẩm tuyệt đẹp vào Balo Sáng Tạo!",
        "rewardBadge": {
          "name": "Huy hiệu Bài 4.4 — Bản đồ 8 Ô - P2: Khoá",
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
    "objective": "Trẻ tự viết lời thoại ngắn gọn (tối đa 2 bong bóng/khung), đặt tên truyện, làm bìa sách và xuất bản cuốn truyện hoàn chỉnh.",
    "skillLearned": "Kỹ năng đặt chữ lên hình, tự viết lời thoại chân thực, thiết kế bìa sách Comic Book và đóng gáy sách.",
    "nextLessonSlug": "bai-5-1-san-lung-bo-suu-tap",
    "journey": {
      "stage1_goal": {
        "id": "bai-4-5-vuong-mien-hoan-hao-stage1-goal",
        "title": "Mục tiêu bài học: Bài 4.5 — Vương miện hoàn hảo",
        "goalText": "Trẻ tự viết lời thoại ngắn gọn (tối đa 2 bong bóng/khung), đặt tên truyện, làm bìa sách và xuất bản cuốn truyện hoàn chỉnh.",
        "imageUrl": "/assets/aiki-islands/island4_lesson5_comicbook.jpg",
        "speech": "Mika: Hôm trước tớ xếp đủ tám khung rồi bảo: 'AKI ơi, viết lời thoại hộ tớ nhé!' Thế là AKI viết một loạt câu: lúc gặp quái vật nhân vật cũng 'Tuyệt quá!', lúc buồn cũng 'Tuyệt quá!'... Nghe giả tạo ghê luôn!\nAKI: Ha ha! Vì AI làm sao hiểu được cảm xúc thật của nhân vật bằng chính tác giả nhí là Mika chứ! Lời thoại là phần việc của các cậu mà!",
        "keyPoints": [
          "Trẻ tự viết lời thoại ngắn gọn (tối đa 2 bong bóng/khung), đặt tên truyện, làm bìa sách và xuất bản cuốn truyện hoàn chỉnh.",
          "Kỹ năng đặt chữ lên hình, tự viết lời thoại chân thực, thiết kế bìa sách Comic Book và đóng gáy sách.",
          "VƯƠNG MIỆN HOÀN HẢO: Tự viết lời thoại · Đặt tên truyện · Xuất bản bìa Comic"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-4-5-vuong-mien-hoan-hao-stage2-confirm",
        "question": "Mỗi khung nên có tối đa mấy bong bóng thoại?",
        "options": [
          {
            "id": "opt-a",
            "text": "Một",
            "imageUrl": "/assets/aiki-islands/island4_lesson5_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Hai",
            "imageUrl": "/assets/aiki-islands/island4_lesson5_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Bao nhiêu cũng được",
            "imageUrl": "/assets/aiki-islands/island4_lesson5_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Nhiều hơn là chữ che mất hình.",
        "speech": "Chưa đúng. Tối đa hai bong bóng một khung."
      },
      "stage3_video": {
        "id": "bai-4-5-vuong-mien-hoan-hao-stage3-video",
        "title": "Video bài giảng: Bài 4.5 — Vương miện hoàn hảo",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island4_lesson5_comicbook.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Mika: Hôm trước tớ xếp đủ tám khung rồi bảo: 'AKI ơi, viết lời thoại hộ tớ nhé!' Thế là AKI viết một loạt câu: lúc gặp quái vật nhân vật cũng 'Tuyệt quá!', lúc buồn cũng 'Tuyệt quá!'... Nghe giả tạo ghê luôn!\nAKI: Ha ha! Vì AI làm sao hiểu được cảm xúc thật của nhân vật bằng chính tác giả nhí là Mika chứ! Lời thoại là phần việc của các cậu mà!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "QT2: Nội dung là do cậu viết, hãy đảm bảo viết xong mới gửi cho AKI! Bìa sách chính là vương miện của tác phẩm! Tự viết lời thoại thật ngắn và đặt tên truyện thật kêu!"
          },
          {
            "label": "Thực hành cùng AKI",
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
            "id": "bai-4-5-vuong-mien-hoan-hao-q1",
            "prompt": "Viết lời thoại thì nên viết thế nào?",
            "options": [
              "Thật ngắn, giống cách mình nói ngoài đời",
              "Thật dài cho đầy bong bóng",
              "Chép lại câu dưới ô storyboard"
            ],
            "correctIndex": 0,
            "explanation": "Tranh đã kể được thì không cần chữ kể lại lần nữa.",
            "visualUrl": "/assets/aiki-islands/island4_lesson5_cat.jpg"
          },
          {
            "id": "bai-4-5-vuong-mien-hoan-hao-q2",
            "prompt": "Tên truyện nào hấp dẫn hơn?",
            "options": [
              "Truyện của Lumi",
              "Có gì đó mắc lại trên cành cây!",
              "Truyện tranh số 1"
            ],
            "correctIndex": 1,
            "explanation": "Tên hay khiến người ta tò mò: thứ gì mắc ở đó? chuyện gì đã xảy ra?",
            "visualUrl": "/assets/aiki-islands/island4_lesson5_opt_a.jpg"
          },
          {
            "id": "bai-4-5-vuong-mien-hoan-hao-q3",
            "prompt": "Câu quan trọng nhất của cả chương là gì?",
            "options": [
              "AKI giúp vẽ truyện, nhưng con mới là người nghĩ ra câu chuyện",
              "AKI nghĩ chuyện hay hơn con",
              "Truyện đẹp là truyện nhiều màu"
            ],
            "correctIndex": 0,
            "explanation": "Nhân vật, chuyện gì xảy ra, nhân vật nói gì, tên truyện — đều là ý tưởng của con.",
            "visualUrl": "/assets/aiki-islands/island4_lesson5_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
  {
    "id": "bai-5-1",
    "slug": "bai-5-1-san-lung-bo-suu-tap",
    "islandNumber": 5,
    "lessonNumber": "5.1",
    "title": "Bài 5.1 — Săn lùng Bộ sưu tập",
    "subtitle": "Săn lùng 12 món cùng một họ để khởi đầu bộ thẻ huyền thoại!",
    "imageUrl": "/assets/aiki-islands/island5_lesson1_hunting.jpg",
    "objective": "Trẻ tự chọn được chủ đề riêng và liệt kê đủ 12 thứ cùng thuộc một nhóm mà không cần ỷ lại vào AI.",
    "skillLearned": "Kỹ năng săn lùng ý tưởng từ đời thực: Liệt kê danh sách 12 thứ cùng chủ đề, kiểm tra không trùng lặp và độc đáo.",
    "nextLessonSlug": "bai-5-2-phu-phep-mat-the",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-1-san-lung-bo-suu-tap-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.1 — Săn lùng Bộ sưu tập",
        "goalText": "Trẻ tự chọn được chủ đề riêng và liệt kê đủ 12 thứ cùng thuộc một nhóm mà không cần ỷ lại vào AI.",
        "imageUrl": "/assets/aiki-islands/island5_lesson1_hunting.jpg",
        "speech": "Nami: AKI ơi tớ muốn làm một bộ thẻ game bài nhưng nghĩ mãi chẳng biết chọn gì. Bạn bảo AI gợi ý chủ đề cho tớ với!\nAKI: Không được đâu Nami ơi! Ý tưởng phải là của cậu cơ! Đi hỏi, đi nhìn thế giới quanh mình chứ đừng hỏi AI. Bộ thẻ hay nhất là bộ thẻ về những thứ cậu yêu thích nhất!",
        "keyPoints": [
          "Trẻ tự chọn được chủ đề riêng và liệt kê đủ 12 thứ cùng thuộc một nhóm mà không cần ỷ lại vào AI.",
          "Kỹ năng săn lùng ý tưởng từ đời thực: Liệt kê danh sách 12 thứ cùng chủ đề, kiểm tra không trùng lặp và độc đáo.",
          "SĂN LÙNG BỘ SƯU TẬP: 12 THỨ CÙNG MỘT HỌ · Ý TƯỞNG CỦA CHÍNH CẬU"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-1-san-lung-bo-suu-tap-stage2-confirm",
        "question": "Bí chưa nghĩ ra chủ đề, con nên làm gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "Ngồi nhìn màn hình chờ ý tưởng",
            "imageUrl": "/assets/aiki-islands/island5_lesson1_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Đứng dậy đi nhìn quanh nhà, hoặc đi hỏi một người",
            "imageUrl": "/assets/aiki-islands/island5_lesson1_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Nhờ AKI nghĩ hộ một chủ đề",
            "imageUrl": "/assets/aiki-islands/island5_lesson1_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Ý tưởng ở quanh con nhiều hơn con nghĩ đấy.",
        "speech": "Chưa đúng. Hãy đứng dậy đi nhìn, đi hỏi — rồi mới nhờ AKI giúp."
      },
      "stage3_video": {
        "id": "bai-5-1-san-lung-bo-suu-tap-stage3-video",
        "title": "Video bài giảng: Bài 5.1 — Săn lùng Bộ sưu tập",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island5_lesson1_hunting.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Nami: AKI ơi tớ muốn làm một bộ thẻ game bài nhưng nghĩ mãi chẳng biết chọn gì. Bạn bảo AI gợi ý chủ đề cho tớ với!\nAKI: Không được đâu Nami ơi! Ý tưởng phải là của cậu cơ! Đi hỏi, đi nhìn thế giới quanh mình chứ đừng hỏi AI. Bộ thẻ hay nhất là bộ thẻ về những thứ cậu yêu thích nhất!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "QT1: Hãy nghĩ ý tưởng của cậu trước, rồi mới chia sẻ với AKI! Săn lùng bộ sưu tập 12 thứ bằng cách quan sát và khám phá sở thích của chính mình!"
          },
          {
            "label": "Thực hành cùng AKI",
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
            "id": "bai-5-1-san-lung-bo-suu-tap-q1",
            "prompt": "Vì sao bộ thẻ “12 món ở hàng tạp hoá gần nhà” lại đặc biệt?",
            "options": [
              "Vì đó là những thứ chính con nhìn thấy mỗi ngày, khó có bộ nào giống hệt",
              "Vì hàng tạp hoá có nhiều đồ",
              "Vì đồ tạp hoá dễ vẽ"
            ],
            "correctIndex": 0,
            "explanation": "Người khác cũng có thể làm bộ về hàng tạp hoá, nhưng không giống bộ của con.",
            "visualUrl": "/assets/aiki-islands/island5_lesson1_cat.jpg"
          },
          {
            "id": "bai-5-1-san-lung-bo-suu-tap-q2",
            "prompt": "Mười hai thứ trong bộ thẻ phải như thế nào?",
            "options": [
              "Cùng một nhóm",
              "Khác nhau hoàn toàn",
              "Cùng một màu"
            ],
            "correctIndex": 0,
            "explanation": "Cùng nhóm thì mới so thẻ với nhau được.",
            "visualUrl": "/assets/aiki-islands/island5_lesson1_opt_a.jpg"
          },
          {
            "id": "bai-5-1-san-lung-bo-suu-tap-q3",
            "prompt": "Đọc lại danh sách, con kiểm tra điều gì?",
            "options": [
              "Có món nào trùng không, có món nào quá nhạt nhẽo không",
              "Có món nào đắt tiền không",
              "Có món nào màu đỏ không"
            ],
            "correctIndex": 0,
            "explanation": "Sửa xong thì giữ thật kỹ danh sách này cho các bài sau.",
            "visualUrl": "/assets/aiki-islands/island5_lesson1_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
    "objective": "Trẻ nắm được quy tắc cân bằng trò chơi: Phân bổ tổng điểm 3 chỉ số (Sức - Nhanh - Khéo) bằng nhau cho tất cả 12 lá bài.",
    "skillLearned": "Cân bằng ngân sách chỉ số: Sức + Nhanh + Khéo = 20 điểm (hoặc 12 điểm) và sáng tạo 1 kỹ năng riêng biệt cho từng thẻ.",
    "nextLessonSlug": "bai-5-3-khoa-the",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-2-phu-phep-mat-the-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.2 — Phù phép Mặt thẻ",
        "goalText": "Trẻ nắm được quy tắc cân bằng trò chơi: Phân bổ tổng điểm 3 chỉ số (Sức - Nhanh - Khéo) bằng nhau cho tất cả 12 lá bài.",
        "imageUrl": "/assets/aiki-islands/island5_lesson2_stats.jpg",
        "speech": "Kora: Hôm trước tớ làm bộ thẻ rồi rủ bạn chơi. Lá Rồng Thần của tớ có Sức 10 – Nhanh 10 – Khéo 10! Ra trận là đè bẹp tất cả!\nAKI: Kết quả là chơi được hai ván bạn bè bỏ về hết đúng không? Vì chưa lật bài đã biết ai thắng rồi! Trò chơi mà không công bằng thì chẳng ai muốn chơi cả!",
        "keyPoints": [
          "Trẻ nắm được quy tắc cân bằng trò chơi: Phân bổ tổng điểm 3 chỉ số (Sức - Nhanh - Khéo) bằng nhau cho tất cả 12 lá bài.",
          "Cân bằng ngân sách chỉ số: Sức + Nhanh + Khéo = 20 điểm (hoặc 12 điểm) và sáng tạo 1 kỹ năng riêng biệt cho từng thẻ.",
          "LUẬT NGÂN SÁCH ĐIỂM: Sức + Nhanh + Khéo = 20 điểm công bằng"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-2-phu-phep-mat-the-stage2-confirm",
        "question": "Mỗi lá thẻ được chia bao nhiêu điểm vào ba ô chỉ số?",
        "options": [
          {
            "id": "opt-a",
            "text": "Mỗi lá một số khác nhau cho phong phú",
            "imageUrl": "/assets/aiki-islands/island5_lesson2_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Tất cả các lá cùng một tổng điểm, ví dụ 12",
            "imageUrl": "/assets/aiki-islands/island5_lesson2_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Càng nhiều càng mạnh",
            "imageUrl": "/assets/aiki-islands/island5_lesson2_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Quan trọng là tất cả các lá phải có cùng một tổng điểm.",
        "speech": "Chưa đúng. Tổng điểm phải bằng nhau ở mọi lá thì mới công bằng."
      },
      "stage3_video": {
        "id": "bai-5-2-phu-phep-mat-the-stage3-video",
        "title": "Video bài giảng: Bài 5.2 — Phù phép Mặt thẻ",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
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
            "label": "Thực hành cùng AKI",
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
            "id": "bai-5-2-phu-phep-mat-the-q1",
            "prompt": "Luật cân bằng của bài này là gì?",
            "options": [
              "Mạnh chỗ này thì phải bớt chỗ khác",
              "Lá nào cũng phải mạnh cả ba ô",
              "Lá nào cũng phải yếu cả ba ô"
            ],
            "correctIndex": 0,
            "explanation": "Chảo gang Sức 8 nhưng Nhanh chỉ 2 — vì nó nặng.",
            "visualUrl": "/assets/aiki-islands/island5_lesson2_cat.jpg"
          },
          {
            "id": "bai-5-2-phu-phep-mat-the-q2",
            "prompt": "Mỗi lá thẻ cần ghi đủ những gì?",
            "options": [
              "Tên thẻ – Sức – Nhanh – Khéo – Tổng điểm – Kỹ năng riêng",
              "Tên thẻ và một bức hình",
              "Tên thẻ và giá tiền"
            ],
            "correctIndex": 0,
            "explanation": "Tất cả lưu vào Bảng thiết kế bộ thẻ, nhớ chụp lại cho bài sau.",
            "visualUrl": "/assets/aiki-islands/island5_lesson2_opt_a.jpg"
          },
          {
            "id": "bai-5-2-phu-phep-mat-the-q3",
            "prompt": "Trò chơi hay là trò chơi như thế nào?",
            "options": [
              "Trò chơi mà chưa lật thẻ lên vẫn chưa biết chắc ai sẽ thắng",
              "Trò chơi mà mình luôn thắng",
              "Trò chơi có nhiều thẻ nhất"
            ],
            "correctIndex": 0,
            "explanation": "Đó chính là ý nghĩa của công bằng.",
            "visualUrl": "/assets/aiki-islands/island5_lesson2_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
    "objective": "Trẻ tạo được 12 hình thẻ bài đồng nhất một phong cách bằng Công thức nền chung và thiết kế Mặt lưng đối xứng tâm hoàn hảo.",
    "skillLearned": "Viết Công thức nền chung cho cả bộ thẻ và tạo Mặt lưng bánh răng ma thuật đồng nhất để không bị lộ bài úp.",
    "nextLessonSlug": "bai-5-4-luat-choi",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-3-khoa-the-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.3 — Khoá thẻ",
        "goalText": "Trẻ tạo được 12 hình thẻ bài đồng nhất một phong cách bằng Công thức nền chung và thiết kế Mặt lưng đối xứng tâm hoàn hảo.",
        "imageUrl": "/assets/aiki-islands/island5_lesson3_lockcards.jpg",
        "speech": "Riko: Hôm trước tớ tạo liền mười hai hình thẻ bài, hình nào cũng đẹp mê li! Nhưng xếp cạnh nhau thì... ơ? Lá này giống tranh màu nước, lá kia lại giống hoạt hình 3D, lá nền đen lá nền trắng!\nAKI: 12 hình đẹp nhưng cứ như thuộc 12 bộ bài khác nhau ấy Riko ơi! Thẻ bài chuyên nghiệp là nhìn lướt qua phải biết ngay cùng một bộ chứ!",
        "keyPoints": [
          "Trẻ tạo được 12 hình thẻ bài đồng nhất một phong cách bằng Công thức nền chung và thiết kế Mặt lưng đối xứng tâm hoàn hảo.",
          "Viết Công thức nền chung cho cả bộ thẻ và tạo Mặt lưng bánh răng ma thuật đồng nhất để không bị lộ bài úp.",
          "KHÓA THẺ CHUYÊN NGHIỆP: Chung công thức nền · Mặt lưng đối xứng 100%"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-3-khoa-the-stage2-confirm",
        "question": "Để cả mười hai lá nhìn như một bộ, con cần những gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "Chỉ cần ảnh mẫu là đủ",
            "imageUrl": "/assets/aiki-islands/island5_lesson3_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Ảnh mẫu VÀ công thức nền bốn thứ",
            "imageUrl": "/assets/aiki-islands/island5_lesson3_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Chỉ cần tả thật dài cho mỗi lá",
            "imageUrl": "/assets/aiki-islands/island5_lesson3_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Ảnh mẫu cho AKI thấy bộ thẻ trông thế nào, công thức cho biết những gì không được đổi.",
        "speech": "Chưa đúng. Chỉ ảnh mẫu thôi vẫn chưa đủ."
      },
      "stage3_video": {
        "id": "bai-5-3-khoa-the-stage3-video",
        "title": "Video bài giảng: Bài 5.3 — Khoá thẻ",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
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
            "label": "Thực hành cùng AKI",
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
            "id": "bai-5-3-khoa-the-q1",
            "prompt": "Công thức nền gồm bốn thứ nào?",
            "options": [
              "Phong cách – Nền – Góc nhìn – Khung viền",
              "Màu – Nét – Bóng – Kích thước",
              "Tên – Điểm – Kỹ năng – Hình"
            ],
            "correctIndex": 0,
            "explanation": "Bốn thứ này không đổi suốt cả bộ.",
            "visualUrl": "/assets/aiki-islands/island5_lesson3_cat.jpg"
          },
          {
            "id": "bai-5-3-khoa-the-q2",
            "prompt": "Ngoài tả bằng chữ, con còn cách nào để làm phần riêng của một lá?",
            "options": [
              "Chụp ảnh món đồ thật trong nhà rồi nhờ AKI vẽ lại theo phong cách thẻ mẫu",
              "Vẽ tay rồi scan",
              "Không có cách nào khác"
            ],
            "correctIndex": 0,
            "explanation": "Nhớ chỉ chụp đồ vật rõ ràng, tránh để người hay thông tin riêng xuất hiện trong ảnh.",
            "visualUrl": "/assets/aiki-islands/island5_lesson3_opt_a.jpg"
          },
          {
            "id": "bai-5-3-khoa-the-q3",
            "prompt": "“Lá lạc” là gì?",
            "options": [
              "Lá khác kiểu vẽ, khác nền, khác góc nhìn hoặc khác khung so với cả bộ",
              "Lá bị mất",
              "Lá có điểm cao nhất"
            ],
            "correctIndex": 0,
            "explanation": "Thấy lá lạc thì sửa câu lệnh rồi mới tạo lại.",
            "visualUrl": "/assets/aiki-islands/island5_lesson3_opt_b.jpg"
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
          "mặt lưng họa tiết bánh răng vàng kim đối xứng tâm 100%",
          "vòng tròn ma thuật cổ ngữ bảo vệ",
          "nền lam thẫm bí ẩn đồng nhất cho cả 12 lá"
        ],
        "akiMotto": "Mặt lưng phải giống hệt nhau 100% để đảm bảo tính công bằng tuyệt đối, không ai đoán trước được lá bài úp!",
        "maxAttempts": 6,
        "workflowSteps": [
          {
            "step": 1,
            "title": "Thử câu lệnh ban đầu (1-2 từ)",
            "akiSpeech": "Chào bé! Đầu tiên hãy thử gõ từ khóa ngắn \"Khóa Lưng\" xem tớ vẽ thế nào nhé!",
            "quickPrompt": "Khóa Lưng",
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
        "practiceParts": [
          {
            "partNumber": 1,
            "title": "Chú Trâu Đất Nặn",
            "icon": "🐃",
            "emoji": "🐃",
            "iconImage": "/assets/aiki-keys/key_what_blue.jpg"
          },
          {
            "partNumber": 2,
            "title": "Chú Mèo Béo Múp",
            "icon": "🐱",
            "emoji": "🐱",
            "iconImage": "/assets/aiki-islands/island1_lesson1_cat.jpg"
          },
          {
            "partNumber": 3,
            "title": "Bạn Robot Tí Hon",
            "icon": "🤖",
            "emoji": "🤖",
            "iconImage": "/assets/aiki-keys/key_action_orange.jpg"
          },
          {
            "partNumber": 4,
            "title": "Lâu Đài Cổ Tích",
            "icon": "🏰",
            "emoji": "🏰",
            "iconImage": "/assets/aiki-keys/key_where_pink.jpg"
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
    "objective": "Trẻ viết được bộ luật chơi rõ ràng gồm 5 phần và biết cách sửa luật sau khi chơi thử thực tế.",
    "skillLearned": "5 phần cốt lõi của luật chơi: Số người, Ai đi trước, Lượt làm gì, So thẻ thế nào (hệ tương khắc), Khi nào thắng.",
    "nextLessonSlug": "bai-5-5-dau-truong-khai-mo",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-4-luat-choi-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.4 — Luật chơi",
        "goalText": "Trẻ viết được bộ luật chơi rõ ràng gồm 5 phần và biết cách sửa luật sau khi chơi thử thực tế.",
        "imageUrl": "/assets/aiki-islands/island5_lesson4_rules.jpg",
        "speech": "Tomi: Hôm trước tớ mang bộ thẻ bài ra rủ cả nhà chơi. Bố hỏi: 'Mấy người chơi được?' Mẹ hỏi: 'Ai đi trước?' Em lại hỏi: 'Hai lá bằng điểm thì sao hả anh?' Tớ cứ ấp úng chẳng biết trả lời thế nào, thế là cãi nhau to!\nAKI: Thẻ đẹp đến mấy mà không có luật rõ ràng thì cũng không chơi được Tomi ơi! Luật chơi chính là linh hồn của trò chơi đấy!",
        "keyPoints": [
          "Trẻ viết được bộ luật chơi rõ ràng gồm 5 phần và biết cách sửa luật sau khi chơi thử thực tế.",
          "5 phần cốt lõi của luật chơi: Số người, Ai đi trước, Lượt làm gì, So thẻ thế nào (hệ tương khắc), Khi nào thắng.",
          "5 PHẦN LUẬT CHƠI: Số người · Đi trước · Lượt chơi · So thẻ tương khắc · Ai thắng"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-4-luat-choi-stage2-confirm",
        "question": "Vai trò của AKI trong bài này là gì?",
        "options": [
          {
            "id": "opt-a",
            "text": "AKI nghĩ ra luật chơi cho con",
            "imageUrl": "/assets/aiki-islands/island5_lesson4_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "AKI chỉ sắp xếp và viết lại cho dễ đọc, không tự thêm luật mới",
            "imageUrl": "/assets/aiki-islands/island5_lesson4_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "AKI chấm điểm bộ luật của con",
            "imageUrl": "/assets/aiki-islands/island5_lesson4_opt_a.jpg"
          }
        ],
        "correctIndex": 1,
        "explanation": "Đúng! Ý tưởng là của con, AKI chỉ giúp viết cho rõ.",
        "speech": "Chưa đúng. Con quyết định luật — AKI chỉ giúp viết cho rõ hơn."
      },
      "stage3_video": {
        "id": "bai-5-4-luat-choi-stage3-video",
        "title": "Video bài giảng: Bài 5.4 — Luật chơi",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
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
            "label": "Thực hành cùng AKI",
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
            "id": "bai-5-4-luat-choi-q1",
            "prompt": "Một bộ luật cần trả lời mấy câu hỏi?",
            "options": [
              "Năm câu",
              "Ba câu",
              "Mười câu"
            ],
            "correctIndex": 0,
            "explanation": "Mấy người chơi · ai đi trước · mỗi lượt làm gì · so thẻ thế nào · khi nào kết thúc và ai thắng.",
            "visualUrl": "/assets/aiki-islands/island5_lesson4_cat.jpg"
          },
          {
            "id": "bai-5-4-luat-choi-q2",
            "prompt": "Vì sao viết luật xong vẫn phải đem ra chơi thử?",
            "options": [
              "Vì chơi thử mới lộ ra những câu chưa rõ, ví dụ ba người cùng bằng điểm thì sao",
              "Vì chơi thử cho vui",
              "Vì AKI yêu cầu"
            ],
            "correctIndex": 0,
            "explanation": "Chỗ nào người chơi phải dừng lại hỏi thì đánh dấu và bổ sung.",
            "visualUrl": "/assets/aiki-islands/island5_lesson4_opt_a.jpg"
          },
          {
            "id": "bai-5-4-luat-choi-q3",
            "prompt": "Câu để nhớ của bài này là gì?",
            "options": [
              "Nói luật của cậu trước – AKI giúp viết cho rõ – rồi phải chơi thử",
              "Luật càng dài càng tốt",
              "Cứ chơi rồi tính sau"
            ],
            "correctIndex": 0,
            "explanation": "Luật chưa chơi thử thì chưa phải luật hoàn chỉnh.",
            "visualUrl": "/assets/aiki-islands/island5_lesson4_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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
          "akiAdvice": "Nói luật của cậu trước – AKI giúp viết cho rõ – rồi phải chơi thử. Luật chưa chơi thử thì chưa phải luật hoàn chỉnh!",
          "sampleHelperTitle": "Cách làm kịch bản mẫu: 5 câu hỏi vàng & Thử nghiệm",
          "sampleTemplate": "1. Có mấy người chơi: 2 người chơi đấu kháng\n2. Ai đi trước: Người đổ xúc xắc điểm cao hơn được đi trước\n3. Mỗi lượt người chơi làm gì: Lần lượt rút 1 thẻ trên tay và tung xúc xắc chọn chỉ số so tài\n4. So thẻ thế nào, nếu bằng nhau thì sao: Ai có điểm chỉ số cao hơn ăn thẻ của đối thủ; nếu bằng điểm thì mỗi bên rút thêm 1 thẻ để so tiếp\n5. Khi nào kết thúc và ai thắng: Ai ăn được 5 thẻ của đối thủ trước là người chiến thắng\nChỗ cả nhà phải dừng lại hỏi khi chơi thử: Khi tung vào mặt ngôi sao xúc xắc chưa biết tính sao, tớ đã bổ sung: Mặt sao được cộng thêm 3 điểm vào chỉ số bất kỳ!",
          "backpackCategory": "game-rules",
          "backpackTag": "Luật chơi 5 câu",
          "characterName": "Trọng tài game",
          "challengeSummary": [
            "Trả lời đủ 5 câu hỏi bằng lời của mình, ngắn cũng được",
            "Rồi nhờ AKI viết lại thành một bộ luật ngắn, dễ hiểu — AKI chỉ sắp xếp cho rõ, không tự thêm luật mới",
            "Rủ ít nhất một người trong nhà chơi thử",
            "Chỗ nào họ phải dừng lại hỏi “Tiếp theo làm gì?” hay “Thế này tính sao?” thì đánh dấu lại, bổ sung rồi nhờ AKI sửa lần nữa"
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
    "objective": "Trẻ hoàn thiện trọn bộ sản phẩm trò chơi (Bàn cờ 4 thành phần, vỏ hộp gấp được, 12 thẻ bài) và chơi thật một ván với gia đình.",
    "skillLearned": "Thiết kế bàn cờ 4 thành phần (Xuất phát, Đường đi, Ô đặc biệt, Đích), chế tạo vỏ hộp gấp và tổ chức giải đấu gia đình thực tế.",
    "journey": {
      "stage1_goal": {
        "id": "bai-5-5-dau-truong-khai-mo-stage1-goal",
        "title": "Mục tiêu bài học: Bài 5.5 — Đấu trường khai mở",
        "goalText": "Trẻ hoàn thiện trọn bộ sản phẩm trò chơi (Bàn cờ 4 thành phần, vỏ hộp gấp được, 12 thẻ bài) và chơi thật một ván với gia đình.",
        "imageUrl": "/assets/aiki-islands/island5_lesson5_arena.jpg",
        "speech": "Dori: AKI ơi xem bàn cờ tớ vẽ này: có đường đi ngoằn ngoèo, có ô số vẽ đẹp lắm! Cả nhà chơi được một lúc thì bố hỏi: 'Ơ thế đi đến đâu thì thắng hả con?' Tớ nhìn lại... quên mất ô Đích!\nAKI: Ha ha! Giống như chạy thi mà không có vạch đích thì chạy vòng quanh mãi sao được! Trước khi làm, tớ dẫn các cậu đến Kho Trò Chơi Ngủ Quên nhé!",
        "keyPoints": [
          "Trẻ hoàn thiện trọn bộ sản phẩm trò chơi (Bàn cờ 4 thành phần, vỏ hộp gấp được, 12 thẻ bài) và chơi thật một ván với gia đình.",
          "Thiết kế bàn cờ 4 thành phần (Xuất phát, Đường đi, Ô đặc biệt, Đích), chế tạo vỏ hộp gấp và tổ chức giải đấu gia đình thực tế.",
          "ĐẤU TRƯỜNG KHAI MỞ: Bàn cờ 4 thành phần · Chơi thật cùng gia đình"
        ]
      },
      "stage2_confirmGoal": {
        "id": "bai-5-5-dau-truong-khai-mo-stage2-confirm",
        "question": "Một bàn cờ cần đủ bốn thứ nào?",
        "options": [
          {
            "id": "opt-a",
            "text": "Xuất phát – Đường đi – Ô đặc biệt – Đích",
            "imageUrl": "/assets/aiki-islands/island5_lesson5_opt_a.jpg"
          },
          {
            "id": "opt-b",
            "text": "Tên – Hình – Màu – Viền",
            "imageUrl": "/assets/aiki-islands/island5_lesson5_opt_b.jpg"
          },
          {
            "id": "opt-c",
            "text": "Thẻ – Xúc xắc – Quân cờ – Hộp",
            "imageUrl": "/assets/aiki-islands/island5_lesson5_opt_a.jpg"
          }
        ],
        "correctIndex": 0,
        "explanation": "Đúng! Nhà Dori quên mất ô ĐÍCH nên cả nhà cứ đi vòng vòng mãi.",
        "speech": "Chưa đúng. Bốn thứ là: xuất phát, đường đi, ô đặc biệt, đích."
      },
      "stage3_video": {
        "id": "bai-5-5-dau-truong-khai-mo-stage3-video",
        "title": "Video bài giảng: Bài 5.5 — Đấu trường khai mở",
        "videoUrl": "https://www.youtube.com/embed/NMdHhsLY5jc",
        "durationSec": 180,
        "posterUrl": "/assets/aiki-islands/island5_lesson5_arena.jpg",
        "timestamps": [
          {
            "label": "Tình huống khám phá",
            "startSec": 0,
            "endSec": 45,
            "speech": "Dori: AKI ơi xem bàn cờ tớ vẽ này: có đường đi ngoằn ngoèo, có ô số vẽ đẹp lắm! Cả nhà chơi được một lúc thì bố hỏi: 'Ơ thế đi đến đâu thì thắng hả con?' Tớ nhìn lại... quên mất ô Đích!\nAKI: Ha ha! Giống như chạy thi mà không có vạch đích thì chạy vòng quanh mãi sao được! Trước khi làm, tớ dẫn các cậu đến Kho Trò Chơi Ngủ Quên nhé!"
          },
          {
            "label": "Quy tắc & Bí kíp vàng",
            "startSec": 45,
            "endSec": 120,
            "speech": "QT3: Sản phẩm làm ra phải có giá trị và mang lại niềm vui cho ai đó! Trò chơi chỉ thật sự hoàn thành khi được mang ra chơi thật với cả nhà chứ không phải cất vào ngăn kéo!"
          },
          {
            "label": "Thực hành cùng AKI",
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
            "id": "bai-5-5-dau-truong-khai-mo-q1",
            "prompt": "Ô đặc biệt nên lấy ý từ đâu?",
            "options": [
              "Từ một chuyện vui có thật trong nhà mình",
              "Từ gợi ý của AKI",
              "Từ trò chơi bán ngoài hàng"
            ],
            "correctIndex": 0,
            "explanation": "Nhà Dori có chú mèo hay nhảy lên bàn ăn nên có ô “MÈO CƯỚP ĐỒ ĂN – bỏ một lượt để đuổi mèo”.",
            "visualUrl": "/assets/aiki-islands/island5_lesson5_cat.jpg"
          },
          {
            "id": "bai-5-5-dau-truong-khai-mo-q2",
            "prompt": "Bước quan trọng nhất của bài cuối là gì?",
            "options": [
              "Rủ cả nhà chơi một ván thật từ đầu đến cuối",
              "In bàn cờ thật đẹp",
              "Đặt tên cho trò chơi"
            ],
            "correctIndex": 0,
            "explanation": "Trong lúc chơi, chỗ nào chưa hiểu hay còn tranh luận thì sửa lại.",
            "visualUrl": "/assets/aiki-islands/island5_lesson5_opt_a.jpg"
          },
          {
            "id": "bai-5-5-dau-truong-khai-mo-q3",
            "prompt": "Hai câu của chương cuối là gì?",
            "options": [
              "Trò chơi hay là trò chơi công bằng · Trò chơi chỉ thật sự hoàn thành khi có người chơi nó",
              "Trò chơi hay là trò chơi khó · Trò chơi đẹp là trò chơi nhiều màu",
              "Trò chơi hay là trò chơi nhanh · Trò chơi đẹp là trò chơi to"
            ],
            "correctIndex": 0,
            "explanation": "Một trò chơi không phải để nằm đẹp trong hộp.",
            "visualUrl": "/assets/aiki-islands/island5_lesson5_opt_b.jpg"
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
            "instruction": "Gõ từ khóa ngắn khởi đầu để thử thách AKI"
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

export const DEFAULT_NOTEBOOK_CONFIGS: Record<string, CreativeNotebookConfig> = {
  '2.1': {
    notebookTitle: 'Câu chuyện trong tấm ảnh cũ nhà tớ',
    akiAdvice:
      'Một bức tranh hay còn phải khiến người xem muốn hỏi: “Chuyện gì đang xảy ra ở đây nhỉ?” Hãy tìm một tấm ảnh cũ của gia đình, hỏi bố mẹ/ông bà xem hôm đó có chuyện gì xảy ra rồi ngồi nghe nhé!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Ba câu hỏi nhìn ảnh',
    sampleTemplate:
      'Trong ảnh, mọi người đang ngồi câu cá bên bờ sông chiều nắng vàng...\nĐiều lạ tớ nhìn thấy là một chú cá nhỏ nhảy vọt khỏi mặt nước bắn tung tóe...\nBố / mẹ / ông / bà kể rằng sau đó bố cười toe toét khoe hàm răng sún ngày xưa...',
    backpackCategory: 'story',
    backpackTag: 'Ảnh gia đình',
    characterName: 'Gia đình tớ',
    challengeSummary: [
      'Hôm nay chưa cần tạo bức tranh nào — mình học cách NHÌN ra câu chuyện trong tranh',
      'Nhớ ba câu hỏi: ĐANG LÀM GÌ? — CÓ GÌ LẠ? — RỒI SAO?',
      'Tìm trong nhà một tấm ảnh cũ của gia đình. Ảnh hơi mờ hay cũ càng thú vị',
      'Cầm ảnh đến hỏi bố mẹ hoặc ông bà: "Hôm chụp tấm này có chuyện gì xảy ra thế ạ?" rồi ngồi nghe',
    ],
    checklist: [
      {
        id: 'cl-2-1-1',
        label: 'Tìm trong nhà một tấm ảnh cũ của gia đình (ảnh mờ hay cũ càng thú vị)',
      },
      {
        id: 'cl-2-1-2',
        label: 'Cầm ảnh hỏi người lớn xem hôm chụp có chuyện gì xảy ra',
      },
      {
        id: 'cl-2-1-3',
        label: 'Trả lời đủ ba câu hỏi: Đang làm gì? — Có gì lạ? — Rồi sao?',
      },
    ],
    fields: [
      {
        id: 'what-action',
        label: '1. Trong ảnh, mọi người đang làm gì?',
        prefix: 'Trong ảnh, mọi người đang ',
        placeholder: 'ngồi câu cá bên bờ sông chiều nắng vàng...',
        rows: 2,
      },
      {
        id: 'weird-clue',
        label: '2. Điều lạ tớ nhìn thấy trong ảnh là gì?',
        prefix: 'Điều lạ tớ nhìn thấy là ',
        placeholder: 'một chú cá nhỏ nhảy vọt khỏi mặt nước bắn tung tóe...',
        badge: 'Quan trọng',
        helperTip: '💡 Chi tiết lạ hoặc dấu vết đặc biệt nhất làm người ta tò mò',
        rows: 2,
      },
      {
        id: 'what-next',
        label: '3. Bố/mẹ/ông/bà kể rằng sau đó chuyện gì xảy ra?',
        prefix: 'Bố / mẹ / ông / bà kể rằng sau đó ',
        placeholder: 'bố cười toe toét khoe hàm răng sún ngày xưa...',
        badge: 'Hỏi người nhà',
        helperTip:
          '💡 Cầm ảnh đến hỏi người lớn: "Hôm chụp tấm này có chuyện gì xảy ra thế ạ?" rồi ngồi nghe',
        rows: 3,
      },
    ],
  },
  '3.1': {
    notebookTitle: 'Hồ sơ nhân vật của tớ',
    akiAdvice:
      'Hãy tạo một nhân vật bất kỳ: người, con vật, đồ vật, thậm chí một cái thang máy cũng được. Dù chưa vẽ gì, người nghe vẫn có thể tưởng tượng ra nhân vật trong đầu nhờ tính cách!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Hồ sơ 7 dòng',
    sampleTemplate:
      'Tên: Sóc Bông Quả Cảm\nThích: Hạt dẻ nướng thơm lừng và trèo cành sồi cao vút\nSợ: Tiếng máy sấy tóc và tiếng sấm sét đùng đoàng trong đêm\nGiỏi: Bật nhảy thoăn thoắt qua các cành cây và ngửi mùi hạt dẻ từ xa\nDở: Cực kỳ hậu đậu, hay quên để chìa khóa ở đâu\nƯớc mơ: Khám phá vương quốc hạt dẻ trên mây\nNgười nhà tớ tả bạn ấy là: Một bạn sóc nhỏ màu cam vừa dũng cảm vừa buồn cười',
    backpackCategory: 'character-dna',
    backpackTag: 'Hồ sơ nhân vật',
    characterName: 'Sóc Bông Quả Cảm',
    challengeSummary: [
      'Tạo một nhân vật bất kỳ: người, con vật, đồ vật — thậm chí một cái thang máy cũng được',
      'Điền đủ các ô: Tên – Thích – Sợ – Giỏi – Dở – Ước mơ',
      'Đừng bỏ trống hai ô SỢ và DỞ, và viết thật cụ thể ("sợ tiếng máy sấy tóc" thay vì "sợ nhiều thứ")',
      'Đọc hồ sơ ấy cho bố hoặc mẹ nghe và hỏi: "Theo mẹ, bạn này trông như thế nào?"',
    ],
    checklist: [
      {
        id: 'cl-3-1-1',
        label: 'Tạo một nhân vật bất kỳ: người, con vật, đồ vật — thậm chí một cái thang máy',
      },
      {
        id: 'cl-3-1-2',
        label: 'Điền đủ các ô — ĐẶC BIỆT không bỏ trống hai ô SỢ và DỞ (viết cụ thể)',
      },
      {
        id: 'cl-3-1-3',
        label: 'Đọc hồ sơ cho bố/mẹ nghe và ghi lại câu trả lời vào ô số 7',
      },
    ],
    fields: [
      {
        id: 'char-name',
        label: '1. Tên nhân vật',
        prefix: 'Tên: ',
        placeholder: 'Người, con vật, đồ vật — thậm chí một cái thang máy...',
        helperTip: '💡 Nhân vật bất kỳ: người, con vật, đồ vật, cái bút chì, cái thang máy...',
        rows: 1,
      },
      {
        id: 'char-likes',
        label: '2. Sở thích đặc trưng',
        prefix: 'Thích: ',
        placeholder: 'Sở thích nổi bật nhất của bạn ấy...',
        rows: 2,
      },
      {
        id: 'char-fears',
        label: '3. Nỗi sợ hãi',
        prefix: 'Sợ: ',
        placeholder: 'Sợ tiếng máy sấy tóc thay vì sợ nhiều thứ...',
        badge: 'Quan trọng',
        helperTip: '💡 Đừng bỏ trống! Viết thật cụ thể: sợ tiếng máy sấy tóc thay vì sợ nhiều thứ',
        rows: 2,
      },
      {
        id: 'char-strength',
        label: '4. Sở trường / Điểm giỏi',
        prefix: 'Giỏi: ',
        placeholder: 'Bạn ấy giỏi nhất việc gì...',
        rows: 2,
      },
      {
        id: 'char-weakness',
        label: '5. Điểm dở / Vụng về đáng yêu',
        prefix: 'Dở: ',
        placeholder: 'Hay quên chìa khóa, hậu đậu...',
        badge: 'Quan trọng',
        helperTip:
          '💡 Đừng bỏ trống! Điểm dở/tật xấu đáng yêu làm nhân vật thật hơn siêu nhân hoàn hảo',
        rows: 2,
      },
      {
        id: 'char-dream',
        label: '6. Ước mơ',
        prefix: 'Ước mơ: ',
        placeholder: 'Ước mơ lớn nhất của bạn ấy...',
        rows: 2,
      },
      {
        id: 'char-family-feedback',
        label: '7. Người nhà tớ tả bạn ấy là',
        prefix: 'Người nhà tớ tả bạn ấy là: ',
        placeholder: 'Ghi lại câu trả lời của bố/mẹ sau khi nghe đọc...',
        badge: 'Hỏi người nhà',
        helperTip:
          '💡 Đọc hồ sơ cho bố hoặc mẹ nghe và hỏi: "Theo mẹ, bạn này trông như thế nào?" rồi ghi lại',
        rows: 3,
        colSpan: 2,
        spanFull: true,
      },
    ],
  },
  '4.1': {
    notebookTitle: 'Câu chuyện ba cổng của nhân vật tớ',
    akiAdvice:
      'Bình thường – Có chuyện – Giải quyết. Ba cổng này sẽ giúp những việc bình thường biến thành một câu chuyện có đầu, có giữa và có kết thúc!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Ba cổng của câu chuyện',
    sampleTemplate:
      'Bình thường: mọi hôm bạn ấy sống yên bình trong hốc cây sồi, mỗi sáng đi nhặt hạt dẻ...\nCó chuyện: một hôm toàn bộ kho hạt dẻ biến mất, chỉ để lại một vệt chân kỳ lạ phát sáng...\nGiải quyết: thế là bạn ấy dũng cảm lần theo dấu chân, kết bạn với Nhím và cùng tìm lại hạt dẻ!',
    backpackCategory: 'story-arc',
    backpackTag: '3 Cổng Cốt Truyện',
    characterName: 'Nhân vật truyện',
    challengeSummary: [
      'Lấy thẻ nhân vật ra, nhìn lại Hồ sơ rồi kể một câu chuyện về bạn ấy',
      'Nhớ đủ ba cổng: BÌNH THƯỜNG – CÓ CHUYỆN – GIẢI QUYẾT',
      'Kể xong đọc lại một lượt, kiểm tra xem có bỏ quên cổng nào không. Thiếu thì kể lại lần nữa',
    ],
    checklist: [
      {
        id: 'cl-4-1-1',
        label: 'Đủ cả 3 cổng: Bình thường – Có chuyện – Giải quyết',
      },
      {
        id: 'cl-4-1-2',
        label: 'Đọc to câu chuyện và tự kiểm tra xem có quên cổng nào không',
      },
    ],
    fields: [
      {
        id: 'gate-1',
        label: 'Cổng 1: Bình thường',
        prefix: 'Bình thường: mọi hôm bạn ấy ',
        placeholder: 'mọi hôm bạn ấy sống yên bình, mỗi sáng đi nhặt hạt dẻ...',
        rows: 2,
      },
      {
        id: 'gate-2',
        label: 'Cổng 2: Có chuyện!',
        prefix: 'Có chuyện: một hôm ',
        placeholder: 'toàn bộ kho hạt dẻ biến mất, xuất hiện biến cố làm đảo lộn...',
        badge: 'Biến cố',
        helperTip: '💡 Tạo ra biến cố bất ngờ kích thích hành động của nhân vật',
        rows: 3,
      },
      {
        id: 'gate-3',
        label: 'Cổng 3: Giải quyết',
        prefix: 'Giải quyết: thế là bạn ấy ',
        placeholder: 'dũng cảm lần theo dấu chân và tìm lại được kho hạt dẻ...',
        badge: 'Mở nút',
        helperTip: '💡 Tìm lối thoát bất ngờ nhưng hợp lý, giải quyết trọn vẹn câu chuyện',
        rows: 3,
      },
    ],
  },
  '4.2': {
    notebookTitle: 'Bốn chặng của câu chuyện tớ',
    akiAdvice:
      'MUỐN - CẢN - LÀM - KẾT. Bốn chặng này chính là bộ xương để buổi sau chúng mình bắt đầu chia câu chuyện thành từng khung truyện!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Bốn chặng Muốn - Cản - Làm - Kết',
    sampleTemplate:
      'Muốn: bạn ấy muốn hái bông hoa Băng Tuyết trên đỉnh núi cao để chữa bệnh cho mẹ\nCản: nhưng dòng suối băng lạnh buốt và bạn ấy cực kỳ sợ bóng tối\nLàm: bạn ấy thử chế tạo ván trượt từ vỏ cây thông và dùng ngọn đuốc sưởi ấm để vượt qua\nKết: cuối cùng bạn ấy đã hái được hoa tuyết kịp thời, mẹ khỏi bệnh và cả khu rừng ăn mừng',
    backpackCategory: 'story-challenges',
    backpackTag: '4 Chặng Thử Thách',
    characterName: 'Hiệp sĩ nhí',
    challengeSummary: [
      'Mở Hồ sơ nhân vật và viết bốn dòng: MUỐN – CẢN – LÀM – KẾT',
      'Chưa nghĩ được CẢN thì nhìn vào ô SỢ hoặc ô DỞ xem có dùng được không',
      'Viết xong đọc to cả bốn dòng một lần. Chỗ nào nghe quá dễ hoặc quá nhanh thì làm cho thử thách khó hơn một chút',
    ],
    checklist: [
      {
        id: 'cl-4-2-1',
        label: 'Đủ 4 chặng: Muốn – Cản – Làm – Kết',
      },
      {
        id: 'cl-4-2-2',
        label: 'Ô Cản có thử thách lấy từ ô Sợ hoặc ô Dở của bài 3.1',
      },
      {
        id: 'cl-4-2-3',
        label: 'Đọc to cả 4 dòng, không quá dễ hoặc quá nhanh',
      },
    ],
    fields: [
      {
        id: 'stage-want',
        label: '1. Muốn (Mong muốn của nhân vật)',
        prefix: 'Muốn: bạn ấy muốn ',
        placeholder: 'đạt được điều gì hoặc đi tới đâu...',
        rows: 2,
      },
      {
        id: 'stage-obstacle',
        label: '2. Cản (Trở ngại cản bước)',
        prefix: 'Cản: nhưng ',
        placeholder: 'gặp phải khó khăn, trở ngại hoặc nỗi sợ gì...',
        badge: 'Thử thách',
        helperTip:
          '💡 Chưa nghĩ được CẢN thì nhìn vào ô SỢ hoặc ô DỞ của bài 3.1 xem có dùng được không!',
        rows: 2,
      },
      {
        id: 'stage-action',
        label: '3. Làm (Hành động vượt qua)',
        prefix: 'Làm: bạn ấy thử ',
        placeholder: 'thử dùng cách gì, mưu trí hay lòng dũng cảm...',
        rows: 2,
      },
      {
        id: 'stage-resolution',
        label: '4. Kết (Kết cục câu chuyện)',
        prefix: 'Kết: cuối cùng ',
        placeholder: 'kết quả ra sao và nhân vật học được điều gì...',
        rows: 2,
      },
    ],
  },
  '4.3': {
    notebookTitle: 'Bản đồ 8 ô của tớ',
    akiAdvice:
      'Một ô – một việc. Storyboard càng rõ thì lúc tạo tranh thật càng dễ. Gạch đi, vẽ lại thoải mái nhé — đây chính là lúc để sửa!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Bản đồ 8 ô Storyboard',
    sampleTemplate:
      'Ô 1: Sóc Bông thức dậy vươn vai trong hốc cây sồi.\nÔ 2: Phát hiện toàn bộ kho hạt dẻ đã biến mất không dấu vết.\nÔ 3: Lần theo dấu chân nhỏ dẫn ra bìa rừng u tối.\nÔ 4: Gặp bạn Nhím đang sửa chiếc xe gỗ bị gãy bánh.\nÔ 5: Cả hai cùng rơi vào hang đá đen ngòm đầy tiếng gió rít.\nÔ 6: Nhớ ra ánh sáng từ quả bông len thần kỳ trên mũ và thắp sáng.\nÔ 7: Tìm thấy kho hạt dẻ và giúp chuột chũi chia sẻ thức ăn.\nÔ 8: Sóc Bông cùng các bạn ngắm hoàng hôn ấm áp trên đỉnh đồi.',
    backpackCategory: 'storyboard',
    backpackTag: 'Bản đồ 8 ô',
    characterName: 'Biệt đội phiêu lưu',
    challengeSummary: [
      'Lấy câu chuyện MUỐN – CẢN – LÀM – KẾT của buổi trước và chia thành tám ô',
      'Trên giấy: chia tờ giấy làm tám ô, vẽ nhanh bằng hình que. Không cần đẹp',
      'Dưới mỗi ô viết một câu ngắn xem chuyện gì đang xảy ra',
      'Soi lại: có ô nào bị trùng không? có đoạn nào nhảy quá nhanh không? nhìn tám ô có hiểu được chuyện không?',
      'Luật: MỘT Ô – MỘT VIỆC',
    ],
    checklist: [
      {
        id: 'cl-4-3-1',
        label: 'Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước',
      },
      {
        id: 'cl-4-3-2',
        label: 'Dưới mỗi ô viết một câu ngắn (Một ô — Một việc)',
      },
      {
        id: 'cl-4-3-3',
        label: 'Soi lại: không có ô nào trùng việc, nhìn 8 ô hiểu được chuyện',
      },
    ],
    fields: [
      {
        id: 'panel-1',
        label: 'Ô 1',
        prefix: 'Ô 1: ',
        placeholder: 'Chuyện gì xảy ra ở ô 1...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-2',
        label: 'Ô 2',
        prefix: 'Ô 2: ',
        placeholder: 'Chuyện gì xảy ra ở ô 2...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-3',
        label: 'Ô 3',
        prefix: 'Ô 3: ',
        placeholder: 'Chuyện gì xảy ra ở ô 3...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-4',
        label: 'Ô 4',
        prefix: 'Ô 4: ',
        placeholder: 'Chuyện gì xảy ra ở ô 4...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-5',
        label: 'Ô 5',
        prefix: 'Ô 5: ',
        placeholder: 'Chuyện gì xảy ra ở ô 5...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-6',
        label: 'Ô 6',
        prefix: 'Ô 6: ',
        placeholder: 'Chuyện gì xảy ra ở ô 6...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-7',
        label: 'Ô 7',
        prefix: 'Ô 7: ',
        placeholder: 'Chuyện gì xảy ra ở ô 7...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-8',
        label: 'Ô 8',
        prefix: 'Ô 8: ',
        placeholder: 'Chuyện gì xảy ra ở ô 8...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
    ],
  },
  '4.5': {
    notebookTitle: 'Lời thoại và tên truyện của tớ',
    akiAdvice:
      'Tớ có thể giúp các cậu vẽ truyện, nhưng các cậu mới là người nghĩ ra câu chuyện. Nhân vật, chuyện gì xảy ra, nhân vật nói gì và cuốn truyện có tên gì — những phần ấy mang ý tưởng của các cậu!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Lời thoại 8 khung & Tên truyện',
    sampleTemplate:
      'Khung 1: "Một buổi sáng thật trong lành!"\nKhung 2: "Á! Có dấu chân ai dưới gốc sồi thế này?"\nKhung 3: "Đừng chạm vào, coi chừng nguy hiểm đấy!"\nKhung 4: "Cậu là ai? Đừng sợ, tớ tới giúp đây!"\nKhung 5: "Ôi không, trời bắt đầu tối đen rồi!"\nKhung 6: "Nắm lấy tay tớ! Chúng ta cùng bật đèn soi đường!"\nKhung 7: "A! Kho hạt dẻ ở đây rồi!"\nKhung 8: "Cảm ơn cậu nhé, người bạn dũng cảm nhất!"\nTên truyện: Bí Ẩn Dấu Chân Bìa Rừng\nTác giả: Họa sĩ & Nhà văn nhí Sóc Bông',
    backpackCategory: 'comic-script',
    backpackTag: 'Lời thoại truyện tranh',
    characterName: 'Tác giả truyện',
    challengeSummary: [
      'Viết lời thoại cho tám khung, tối đa hai bong bóng mỗi khung',
      'Viết thật ngắn, giống cách mình nói ngoài đời. Tranh đã kể được thì không cần chữ kể lại lần nữa',
      'Đọc to toàn bộ một lượt rồi rút gọn những câu còn dài',
      'Đặt tên truyện — tên hay nên gợi thêm một chút chuyện, đừng chỉ nói thứ mình đã nhìn thấy',
      'Làm bìa có tên truyện, nhân vật chính và tên tác giả là chính con',
    ],
    checklist: [
      {
        id: 'cl-4-5-1',
        label: 'Viết lời thoại 8 khung (tối đa 2 bong bóng/khung, ngắn như lời nói ngoài đời)',
      },
      {
        id: 'cl-4-5-2',
        label: 'Đọc to toàn bộ một lượt rồi rút gọn câu còn dài',
      },
      {
        id: 'cl-4-5-3',
        label: 'Đặt tên truyện & ghi rõ tên tác giả',
      },
    ],
    fields: [
      {
        id: 'dialogue-1',
        label: 'Khung 1',
        prefix: 'Khung 1: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-2',
        label: 'Khung 2',
        prefix: 'Khung 2: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-3',
        label: 'Khung 3',
        prefix: 'Khung 3: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-4',
        label: 'Khung 4',
        prefix: 'Khung 4: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-5',
        label: 'Khung 5',
        prefix: 'Khung 5: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-6',
        label: 'Khung 6',
        prefix: 'Khung 6: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-7',
        label: 'Khung 7',
        prefix: 'Khung 7: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-8',
        label: 'Khung 8',
        prefix: 'Khung 8: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'comic-title',
        label: 'Tên truyện',
        prefix: 'Tên truyện: ',
        placeholder: 'Đặt tên truyện gợi thêm chuyện...',
        badge: 'Quan trọng',
        helperTip: '💡 Tên hay nên gợi thêm một chút chuyện, đừng chỉ nói thứ đã nhìn thấy',
        rows: 1,
      },
      {
        id: 'comic-author',
        label: 'Tác giả',
        prefix: 'Tác giả: ',
        placeholder: 'Tên tác giả là chính con...',
        rows: 1,
      },
    ],
  },
  '5.1': {
    notebookTitle: 'Bộ sưu tập 12 món của tớ',
    akiAdvice:
      'Bí thì đứng dậy đi nhìn — trong bếp, ngăn kéo của bà, góc bàn học, con ngõ trước nhà — hoặc đi hỏi một người. Chọn một chủ đề thật gần với mình nhé!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Bộ sưu tập 12 món',
    sampleTemplate:
      'Chủ đề của tớ: Những món đồ trong ngăn kéo của bà\n1. Chiếc kính lão gọng đồng   2. Cuộn chỉ ngũ sắc   3. Cúc áo ngọc bích   4. Chiếc kéo bấm hình chim sẻ\n5. Hộp dầu tràm thơm lừng    6. Thỏi sáp ong vàng óng  7. Thước dây mềm cuộn tròn  8. Chiếc chuông đồng tí hon\n9. Chiếc chìa khóa gỉ sét    10. Chiếc trâm cài tóc   11. Bút mực ngòi mạ vàng    12. Hạt ngọc trai phát sáng',
    backpackCategory: 'tcg-collection',
    backpackTag: 'Bộ sưu tập 12 món',
    characterName: 'Nhà sưu tập thẻ',
    challengeSummary: [
      'Chọn một chủ đề thật gần với mình, hoặc chủ đề mình thích ơi là thích',
      'Tìm đủ 12 thứ cùng một nhóm',
      'Đọc lại cả danh sách: có món nào trùng không? có món nào quá nhạt nhẽo không?',
      'Bí thì đứng dậy đi nhìn — trong bếp, ngăn kéo của bà, góc bàn học, con ngõ trước nhà — hoặc đi hỏi một người',
    ],
    checklist: [
      {
        id: 'cl-5-1-1',
        label: 'Chọn 1 chủ đề gần gũi',
      },
      {
        id: 'cl-5-1-2',
        label: 'Tìm đủ 12 thứ cùng một nhóm',
      },
      {
        id: 'cl-5-1-3',
        label: 'Đọc lại danh sách và không có món nào bị trùng hoặc quá nhạt',
      },
    ],
    fields: [
      {
        id: 'collection-theme',
        label: 'Chủ đề của tớ',
        prefix: 'Chủ đề của tớ: ',
        placeholder: 'Ví dụ: Những món đồ trong ngăn kéo của bà / Thần thú rừng xanh...',
        badge: 'Bắt buộc',
        helperTip: '💡 Chọn một chủ đề thật gần với mình hoặc chủ đề con thích mê',
        rows: 1,
      },
      {
        id: 'items-group-1',
        label: 'Nhóm 1 (Món 1 -> 4)',
        prefix: '1. ……   2. ……   3. ……   4. ……',
        placeholder: '1. Chiếc kính lão   2. Cuộn chỉ ngũ sắc   3. Cúc áo ngọc bích   4. Kéo bấm...',
        rows: 2,
      },
      {
        id: 'items-group-2',
        label: 'Nhóm 2 (Món 5 -> 8)',
        prefix: '5. ……   6. ……   7. ……   8. ……',
        placeholder: '5. Hộp dầu tràm   6. Thỏi sáp ong   7. Thước dây   8. Chuông đồng...',
        rows: 2,
      },
      {
        id: 'items-group-3',
        label: 'Nhóm 3 (Món 9 -> 12)',
        prefix: '9. ……   10. ……  11. ……  12. ……',
        placeholder: '9. Chìa khóa gỉ   10. Trâm cài   11. Bút mực vàng   12. Hạt ngọc trai...',
        rows: 2,
      },
    ],
  },
  '5.2': {
    notebookTitle: 'Bảng thiết kế bộ thẻ của tớ',
    akiAdvice:
      'Mỗi lá có cùng một túi điểm: đúng 12 điểm chia vào ba ô SỨC – NHANH – KHÉO. Mạnh chỗ này thì phải bớt chỗ khác. Không lá nào giỏi hết mọi thứ!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: 12 lá bài Tổng 12 điểm',
    sampleTemplate:
      'Lá 1: Tên Sóc Bông · Sức 3 · Nhanh 6 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Nhảy vọt cành cây\nLá 2: Tên Gấu Bự · Sức 7 · Nhanh 2 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Đấm vỡ đá tảng\nLá 3: Tên Cáo Mẹo · Sức 2 · Nhanh 4 · Khéo 6 · Tổng 12 · Kỹ năng riêng: Ảo thuật đổi chỗ\nLá 4: Tên Nhím Gai · Sức 4 · Nhanh 3 · Khéo 5 · Tổng 12 · Kỹ năng riêng: Giáp gai phản đòn\n... (làm đủ đến Lá 12, mỗi lá Tổng điểm = đúng 12)',
    backpackCategory: 'tcg-balance',
    backpackTag: 'Bảng chỉ số thẻ bài',
    characterName: 'Nhà thiết kế game',
    challengeSummary: [
      'Mỗi lá được phát đúng một túi 12 điểm, chia vào ba ô: SỨC – NHANH – KHÉO',
      'Luật: mạnh chỗ này thì phải bớt chỗ khác. Không lá nào giỏi hết mọi thứ',
      'Với từng lá ghi đủ: Tên thẻ – Sức – Nhanh – Khéo – Tổng điểm – Kỹ năng riêng',
      'Kiểm tra: cả 12 lá đều phải có tổng bằng 12. Có lá nào mạnh hết ba ô không? có lá nào yếu quá không?',
    ],
    checklist: [
      {
        id: 'cl-5-2-1',
        label: 'Mỗi lá đủ: Tên, 3 chỉ số, Tổng 12, Kỹ năng riêng',
      },
      {
        id: 'cl-5-2-2',
        label: 'Cả 12 lá đều có Tổng điểm = đúng 12',
      },
      {
        id: 'cl-5-2-3',
        label: 'Không có lá nào quá mạnh hay quá yếu',
      },
    ],
    fields: [
      {
        id: 'cards-tier-1',
        label: 'Lá 1 đến Lá 4',
        prefix: 'Lá 1 -> 4: Tên …… · Sức … · Nhanh … · Khéo … · Tổng 12 · Kỹ năng riêng: ……',
        placeholder:
          'Lá 1: Tên Sóc Bông · Sức 3 · Nhanh 6 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Nhảy cành cây...',
        badge: 'Tổng = 12',
        helperTip: '💡 Cả ba chỉ số Sức + Nhanh + Khéo cộng lại BẮT BUỘC bằng đúng 12',
        rows: 4,
      },
      {
        id: 'cards-tier-2',
        label: 'Lá 5 đến Lá 8',
        prefix: 'Lá 5 -> 8: Tên …… · Sức … · Nhanh … · Khéo … · Tổng 12 · Kỹ năng riêng: ……',
        placeholder:
          'Lá 5: Tên Cáo Lửa · Sức 4 · Nhanh 5 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Phun lửa...',
        badge: 'Tổng = 12',
        helperTip: '💡 Mạnh chỗ này thì phải bớt chỗ khác, không có lá nào giỏi cả ba ô',
        rows: 4,
      },
      {
        id: 'cards-tier-3',
        label: 'Lá 9 đến Lá 12',
        prefix: 'Lá 9 -> 12: Tên …… · Sức … · Nhanh … · Khéo … · Tổng 12 · Kỹ năng riêng: ……',
        placeholder:
          'Lá 9: Tên Rồng Băng · Sức 6 · Nhanh 3 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Hơi thở băng...',
        badge: 'Tổng = 12',
        helperTip: '💡 Kiểm tra lại: Không có lá nào quá mạnh hay quá yếu',
        rows: 4,
      },
    ],
  },
  '5.4': {
    notebookTitle: 'Luật chơi của tớ',
    akiAdvice:
      'Nói luật của cậu trước – AKI giúp viết cho rõ – rồi phải chơi thử. Luật chưa chơi thử thì chưa phải luật hoàn chỉnh!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: 5 câu hỏi vàng & Thử nghiệm',
    sampleTemplate:
      '1. Có mấy người chơi: 2 người chơi đấu kháng\n2. Ai đi trước: Người đổ xúc xắc điểm cao hơn được đi trước\n3. Mỗi lượt người chơi làm gì: Lần lượt rút 1 thẻ trên tay và tung xúc xắc chọn chỉ số so tài\n4. So thẻ thế nào, nếu bằng nhau thì sao: Ai có điểm chỉ số cao hơn ăn thẻ của đối thủ; nếu bằng điểm thì mỗi bên rút thêm 1 thẻ để so tiếp\n5. Khi nào kết thúc và ai thắng: Ai ăn được 5 thẻ của đối thủ trước là người chiến thắng\nChỗ cả nhà phải dừng lại hỏi khi chơi thử: Khi tung vào mặt ngôi sao xúc xắc chưa biết tính sao, tớ đã bổ sung: Mặt sao được cộng thêm 3 điểm vào chỉ số bất kỳ!',
    backpackCategory: 'game-rules',
    backpackTag: 'Luật chơi 5 câu',
    characterName: 'Trọng tài game',
    challengeSummary: [
      'Trả lời đủ 5 câu hỏi bằng lời của mình, ngắn cũng được',
      'Rồi nhờ AKI viết lại thành một bộ luật ngắn, dễ hiểu — AKI chỉ sắp xếp cho rõ, không tự thêm luật mới',
      'Rủ ít nhất một người trong nhà chơi thử',
      'Chỗ nào họ phải dừng lại hỏi “Tiếp theo làm gì?” hay “Thế này tính sao?” thì đánh dấu lại, bổ sung rồi nhờ AKI sửa lần nữa',
    ],
    checklist: [
      {
        id: 'cl-5-4-1',
        label: 'Trả lời đủ 5 câu hỏi luật chơi bằng lời của mình',
      },
      {
        id: 'cl-5-4-2',
        label: 'Rủ ít nhất 1 người nhà chơi thử thật một ván',
      },
      {
        id: 'cl-5-4-3',
        label: 'Ghi lại chỗ người nhà thắc mắc và đã bổ sung sửa luật',
      },
    ],
    fields: [
      {
        id: 'q1-players',
        label: '1. Có mấy người chơi?',
        prefix: '1. Có mấy người chơi: ',
        placeholder: '2 người chơi, hoặc 2-4 người...',
        rows: 2,
      },
      {
        id: 'q2-who-first',
        label: '2. Ai đi trước?',
        prefix: '2. Ai đi trước: ',
        placeholder: 'Oẳn tù tì, người đổ xúc xắc cao hơn...',
        rows: 2,
      },
      {
        id: 'q3-turn-action',
        label: '3. Mỗi lượt người chơi làm gì?',
        prefix: '3. Mỗi lượt người chơi làm gì: ',
        placeholder: 'Rút thẻ, tung xúc xắc, so điểm...',
        rows: 2,
      },
      {
        id: 'q4-compare-cards',
        label: '4. So thẻ thế nào, nếu bằng nhau thì sao?',
        prefix: '4. So thẻ thế nào, nếu bằng nhau thì sao: ',
        placeholder: 'So chỉ số Sức/Nhanh/Khéo, nếu bằng điểm thì...',
        rows: 2,
      },
      {
        id: 'q5-win-end',
        label: '5. Khi nào kết thúc và ai thắng?',
        prefix: '5. Khi nào kết thúc và ai thắng: ',
        placeholder: 'Ai hết bài trước, ai gom đủ điểm trước...',
        rows: 2,
      },
      {
        id: 'q6-test-play-notes',
        label: 'Chỗ cả nhà phải dừng lại hỏi khi chơi thử',
        prefix: 'Chỗ cả nhà phải dừng lại hỏi khi chơi thử: ',
        placeholder: 'Ghi lại chỗ mọi người dừng lại hỏi và luật con đã bổ sung...',
        badge: 'Bước quan trọng nhất',
        helperTip:
          '💡 Rủ người nhà chơi thử thật một ván! Chỗ nào bị dừng lại hỏi thì ghi vào đây rồi sửa luật',
        rows: 3,
      },
    ],
  },
  '5.5': {
    notebookTitle: 'Bàn cờ và ván chơi thật của tớ',
    akiAdvice:
      'Trò chơi hay là trò chơi công bằng. Trò chơi chỉ thật sự hoàn thành khi có người chơi nó. Vì một trò chơi không phải để nằm đẹp trong hộp. Nó được làm ra để mọi người cùng chơi!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Bàn cờ và ván chơi thật',
    sampleTemplate:
      'Xuất phát: Ô Cổng Làng Rừng Sồi, mỗi người chọn một quân cờ hạt dẻ\nĐường đi: 20 ô, đánh số từ 1 đến 20 quanh bờ hồ Mùa Thu\nÔ đặc biệt của tớ: “MÈO CƯỚP ĐỒ ĂN” ở ô số 7 — luật: Bị mèo quấy rầy, phải bỏ một lượt để đuổi mèo\nĐích: Lâu đài Quả Sồi Vàng ở ô 20, ai về đích trước là người chiến thắng\nSau khi chơi thử với cả nhà, tớ đã sửa: Bố bảo đường đi hơi ngắn, tớ đã thêm ô số 12 "Cơn lốc xoáy" lùi lại 2 bước để gay cấn hơn!',
    backpackCategory: 'board-game',
    backpackTag: 'Bàn cờ sáng tạo',
    characterName: 'Kiến trúc sư bàn cờ',
    challengeSummary: [
      'Làm bàn cờ đủ bốn thứ: XUẤT PHÁT – ĐƯỜNG ĐI – Ô ĐẶC BIỆT – ĐÍCH. (Nhà Dori quên mất ô ĐÍCH nên cả nhà cứ đi vòng vòng mãi)',
      'Ô đặc biệt là chỗ vui nhất — tự nghĩ luật riêng, tốt nhất lấy từ một chuyện vui trong nhà mình',
      'Làm vỏ hộp để cất 12 thẻ, bàn cờ và luật chơi. Phần in, cắt hoặc gấp khó thì nhờ người lớn giúp',
      'Rồi rủ cả nhà chơi một ván thật từ đầu đến cuối. Chỗ nào chưa hiểu, chưa vui hoặc còn tranh luận thì sửa lại',
    ],
    checklist: [
      {
        id: 'cl-5-5-1',
        label: 'Bàn cờ đủ 4 thứ: Xuất phát – Đường đi – Ô đặc biệt – Đích',
      },
      {
        id: 'cl-5-5-2',
        label: 'Ô đặc biệt có luật riêng lấy từ chuyện trong nhà',
      },
      {
        id: 'cl-5-5-3',
        label: 'Đã chơi thử 1 ván thật với cả nhà và ghi lại chỗ đã sửa',
      },
    ],
    fields: [
      {
        id: 'board-start',
        label: '1. Xuất phát',
        prefix: 'Xuất phát: ',
        placeholder: 'Cổng làng, vị trí xuất phát, quân cờ...',
        rows: 2,
      },
      {
        id: 'board-path',
        label: '2. Đường đi',
        prefix: 'Đường đi: ',
        placeholder: '…… ô, đánh số từ 1 đến ……',
        rows: 2,
      },
      {
        id: 'board-special',
        label: '3. Ô đặc biệt & luật riêng',
        prefix: 'Ô đặc biệt của tớ: “……” — luật: ',
        placeholder: 'Tên ô đặc biệt và luật chơi...',
        badge: 'Chỗ vui nhất',
        helperTip: '💡 Tự nghĩ luật riêng, tốt nhất lấy từ một chuyện vui có thật trong nhà mình',
        rows: 3,
      },
      {
        id: 'board-finish',
        label: '4. Đích',
        prefix: 'Đích: ',
        placeholder: 'Ô về đích, điều kiện chiến thắng...',
        rows: 2,
      },
      {
        id: 'board-playtest-revision',
        label: 'Sau khi chơi thử với cả nhà, tớ đã sửa...',
        prefix: 'Sau khi chơi thử với cả nhà, tớ đã sửa: ',
        placeholder: 'Chỗ mọi người thắc mắc hoặc chưa hiểu và cách con sửa lại...',
        badge: 'Quan trọng',
        helperTip: '💡 Rủ cả nhà chơi 1 ván thật từ đầu đến cuối và ghi lại điểm cải tiến',
        rows: 3,
      },
    ],
  },
}

// Chuẩn hóa và tự động điền creativeEngineMode & options cho 22 bài học theo LESSON_ENGINE_MAP
for (const lesson of ISLAND_CURRICULUM_LESSONS) {
  const mode = LESSON_ENGINE_MAP[lesson.lessonNumber] || 'magic-keys'
  const p = lesson.journey.stage5_practice
  p.creativeEngineMode = mode

  if (mode === 'creative-notebook') {
    p.practiceParts = []
    if (!p.notebookConfig && DEFAULT_NOTEBOOK_CONFIGS[lesson.lessonNumber]) {
      p.notebookConfig = DEFAULT_NOTEBOOK_CONFIGS[lesson.lessonNumber]
    }
  } else if (mode === 'magic-keys' && !p.fourKeysOptions) {
    p.fourKeysOptions = DEFAULT_FOUR_KEYS_OPTIONS
  } else if (mode === 'style-prism' && (!p.stylePrismOptions || p.stylePrismOptions.length < 4)) {
    p.stylePrismOptions = DEFAULT_STYLE_PRISM_OPTIONS
  } else if (mode === 'prompt-doctor' && !p.promptDoctorCase) {
    p.promptDoctorCase = DEFAULT_PROMPT_DOCTOR_CASE
  } else if (mode === 'layer-stacking' && !p.layerStackingOptions) {
    p.layerStackingOptions = DEFAULT_LAYER_STACKING_OPTIONS
  } else if (mode === 'identity-lock') {
    if (!p.lockedFeatures || p.lockedFeatures.length < 3) p.lockedFeatures = DEFAULT_LOCKED_FEATURES
    if (!p.expressionOptions || p.expressionOptions.length < 6) p.expressionOptions = DEFAULT_EXPRESSIONS
  } else if (mode === 'card-forge' && !p.cardForgeOptions) {
    p.cardForgeOptions = DEFAULT_CARD_FORGE_OPTIONS
  }
}

export const ISLAND_CURRICULUM_MAP: Record<string, IslandCurriculumLesson> = {}
for (const item of ISLAND_CURRICULUM_LESSONS) {
  ISLAND_CURRICULUM_MAP[item.id] = item
  ISLAND_CURRICULUM_MAP[item.slug] = item
  ISLAND_CURRICULUM_MAP[item.lessonNumber] = item
}

// Bảng từ khóa nhận diện bài học kể cả khi quest.id là database UUID
const LESSON_KEYWORD_PATTERNS: Array<{ key: string; keywords: string[] }> = [
  { key: '1.1', keywords: ['một từ hay năm từ', 'mot tu hay nam tu', '1 từ hay 5 từ', 'mèo mướp', 'chú mèo', '1.1'] },
  { key: '1.2', keywords: ['bốn chiếc chìa khoá', 'bốn chiếc chìa khóa', 'bon chiec chia khoa', '4 chìa', 'cốc sứ', '1.2'] },
  { key: '1.3', keywords: ['úm ba la', 'um ba la', 'biến hình', 'phong cách nghệ thuật', 'bảng 4 phong cách', '1.3'] },
  { key: '1.4', keywords: ['kỹ sư', 'bác sĩ sửa tranh', 'sửa tay hiệp sĩ', 'ky su tai ba', 'kỹ sư tài ba', '1.4'] },
  { key: '2.1', keywords: ['bức tranh biết nói', 'buc tranh biet noi', 'chú cáo lông đỏ', 'cáo lông đỏ', '2.1'] },
  { key: '2.2', keywords: ['ngôi sao và 3 lớp', 'ai là ngôi sao', 'thuyền buồm', '3 lớp', 'ngôi sao', '2.2'] },
  { key: '2.3', keywords: ['cảm xúc và ánh sáng', 'cảm xúc của sắc màu', 'ngọn hải đăng', 'sắc màu', 'ánh sáng', '2.3'] },
  { key: '2.4', keywords: ['khung tranh a3', 'mảnh ghép hoàn hảo', 'khung tranh', 'gia đình thú', '2.4'] },
  { key: '3.1', keywords: ['hồ sơ adn', 'hồ sơ biệt đội', 'hiệp sĩ cáo lửa', 'adn', '3.1'] },
  { key: '3.2', keywords: ['khóa 3 điểm', 'mật mã nhận diện', 'sóc bông', 'khoa 3 diem', 'mật mã', '3.2'] },
  { key: '3.3', keywords: ['lưới 6 biểu cảm', 'biến hoá biểu cảm', 'đổi mặt', 'biểu cảm', '3.3'] },
  { key: '3.4', keywords: ['căn cứ hốc cây', 'căn cứ bí mật', 'hốc cây', 'căn cứ', '3.4'] },
  { key: '4.1', keywords: ['mở lối 3 cổng', '3 cổng của vương quốc', '3 cổng', 'khởi đầu', 'thắt nút', '4.1'] },
  { key: '4.2', keywords: ['vượt 4 ải', '04 chặng thử thách', '4 chặng', 'muốn - cản', '4.2'] },
  { key: '4.3', keywords: ['storyboard 8 ô', 'bản đồ 8 ô - p1', 'bản đồ 8 ô - phần 1', 'hình que', '4.3'] },
  { key: '4.4', keywords: ['vương miện bìa truyện', 'bản đồ 8 ô - p2', 'bản đồ 8 ô - phần 2', 'khoá', '4.4'] },
  { key: '4.5', keywords: ['khai mạc hội chợ', 'vương miện hoàn hảo', 'comic book', 'hội chợ truyện tranh', '4.5'] },
  { key: '5.1', keywords: ['lá bài đầu tiên', 'săn lùng bộ sưu tập', 'rồng băng', 'thú cưng nguyên tố', '5.1'] },
  { key: '5.2', keywords: ['ngân sách 20 điểm', 'phù phép mặt thẻ', 'ngân sách 20', '5.2'] },
  { key: '5.3', keywords: ['lưng thẻ ma thuật', 'bánh răng ma thuật', 'khoá thẻ', 'khoa the', '5.3'] },
  { key: '5.4', keywords: ['tương khắc ngũ hành', 'luật 5 câu', 'luật chơi', 'luat choi', '5.4'] },
  { key: '5.5', keywords: ['đấu trường & giải đấu', 'đấu trường khai mở', 'giải đấu gia đình', 'bàn cờ', '5.5'] },
]

/**
 * Tìm bài học chuẩn trong thư viện SSOT 22 bài học Aiki Islands
 * Hỗ trợ nhận diện linh hoạt theo id, slug, số hiệu X.Y, hoặc từ khóa tiêu đề (ngay cả khi quest.id là database UUID)
 */
export function findIslandCurriculum(
  quest?: Partial<QuestDetail> | { id?: string; slug?: string; title?: string } | null
): IslandCurriculumLesson | undefined {
  if (!quest) return undefined

  const q = quest as Record<string, any>
  const id = (q.id || '').toLowerCase().trim()
  const slug = (q.slug || '').toLowerCase().trim()
  const title = (q.title || '').toLowerCase().trim()

  // 1. Khớp chính xác ID hoặc Slug
  if (ISLAND_CURRICULUM_MAP[id]) return ISLAND_CURRICULUM_MAP[id]
  if (ISLAND_CURRICULUM_MAP[slug]) return ISLAND_CURRICULUM_MAP[slug]

  // 2. Nhận diện qua mẫu regex bai-X-Y hoặc bai_X_Y
  const idOrSlug = `${id} ${slug}`
  const islandLessonMatch = idOrSlug.match(/bai[-_](\d+)[-_](\d+)/i)
  if (islandLessonMatch) {
    const key = `${islandLessonMatch[1]}.${islandLessonMatch[2]}`
    if (ISLAND_CURRICULUM_MAP[key]) return ISLAND_CURRICULUM_MAP[key]
    const idKey = `bai-${islandLessonMatch[1]}-${islandLessonMatch[2]}`
    if (ISLAND_CURRICULUM_MAP[idKey]) return ISLAND_CURRICULUM_MAP[idKey]
  }

  // 3. Nhận diện qua số bài X.Y trong tiêu đề hoặc slug
  const titleAndSlug = `${title} ${slug} ${id}`
  const dotMatch = titleAndSlug.match(/(\d+)\.(\d+)/)
  if (dotMatch) {
    const dotKey = `${dotMatch[1]}.${dotMatch[2]}`
    if (ISLAND_CURRICULUM_MAP[dotKey]) return ISLAND_CURRICULUM_MAP[dotKey]
  }

  // 4. Nhận diện bằng từ khóa tiêu đề (hữu hiệu khi quest.id là UUID của DB)
  for (const item of LESSON_KEYWORD_PATTERNS) {
    for (const kw of item.keywords) {
      if (title.includes(kw) || slug.includes(kw)) {
        return ISLAND_CURRICULUM_MAP[item.key]
      }
    }
  }

  return undefined
}
