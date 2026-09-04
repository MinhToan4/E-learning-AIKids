/**
 * Quản Lý Hàng Đợi Thẩm Định Từ Chối Của AI (AI Rejections & False-Positive Review) - SSOT Data
 *
 * Cung cấp:
 * - Types định nghĩa sự cố chặn của AI (AiRejectionIncident, AiRejectionCategory, AiRejectionStatus)
 * - Dữ liệu mẫu thực tế DEFAULT_REJECTION_INCIDENTS phản ánh các trường hợp học sinh bị chặn nhầm (False Positives)
 * - Tiện ích loadRejectionIncidents, saveRejectionIncidents với LocalStorage persistence
 */

export type AiRejectionStatus = 'pending' | 'approved_override' | 'confirmed_rejected'

export type AiRejectionCategory =
  | 'VIOLENCE_WEAPONS'
  | 'SCARY_HORROR'
  | 'PROFANITY'
  | 'ADULT_CONTENT'
  | 'SENSITIVE_THEME'
  | 'FALSE_POSITIVE_SUSPECTED'

export interface AiRejectionIncident {
  id: string
  createdAt: string
  studentName: string
  grade: string
  parentEmail: string
  featureScope: 'sketch_to_art' | 'character_mascot' | 'comic_script' | 'story_narrative' | 'asmo_math_visual'
  scopeLabelVi: string
  promptText: string
  sketchThumbnailUrl?: string
  rejectedBy: string
  rejectionCategory: AiRejectionCategory
  categoryLabelVi: string
  flaggedTrigger: string // từ khóa hoặc cụm từ bị kích hoạt chặn
  aiReasonDetail: string
  pedagogicalRecommendation: string
  status: AiRejectionStatus
  adminNote?: string
  reviewedAt?: string
  refinedPrompt?: string
}

export const STORAGE_KEY_AI_REJECTIONS = 'aikids_admin_ai_rejection_incidents_v1'

export const DEFAULT_REJECTION_INCIDENTS: AiRejectionIncident[] = [
  {
    id: 'inc_001',
    createdAt: '2026-09-04 15:42',
    studentName: 'Bé Minh Triết',
    grade: 'Lớp 3',
    parentEmail: 'triet.parent@example.com',
    featureScope: 'sketch_to_art',
    scopeLabelVi: 'Phác thảo Canvas sang Tranh vẽ',
    promptText: 'Thanh kiếm gỗ đồ chơi của hiệp sĩ tí hon cưỡi ngựa thần trên mây',
    sketchThumbnailUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FFF5EA"/><path d="M50 15 L55 30 L53 75 L47 75 L45 30 Z" stroke="%23374151" stroke-width="3" fill="%23D97706"/><line x1="35" y1="75" x2="65" y2="75" stroke="%23374151" stroke-width="4"/><circle cx="50" cy="85" r="5" fill="%23D97706"/></svg>',
    rejectedBy: 'Google Gemini Native Safety Filter (HarmCategory: HARM_CATEGORY_DANGEROUS_CONTENT)',
    rejectionCategory: 'FALSE_POSITIVE_SUSPECTED',
    categoryLabelVi: 'Nghi ngờ chặn nhầm (Đồ chơi thiếu nhi)',
    flaggedTrigger: 'kiếm gỗ',
    aiReasonDetail:
      'Mô hình gắn cờ từ khóa vũ khí "kiếm" (weapons trigger), phân loại rủi ro nguy hiểm mức HIGH.',
    pedagogicalRecommendation:
      'Đây là kiếm gỗ đồ chơi trong ngữ cảnh hiệp sĩ tưởng tượng của học sinh lớp 3, hoàn toàn lành mạnh và mang tính kích thích trí tưởng tượng hiệp nghĩa.',
    status: 'pending',
  },
  {
    id: 'inc_002',
    createdAt: '2026-09-04 15:20',
    studentName: 'Bé Bảo An',
    grade: 'Lớp 2',
    parentEmail: 'baoan.mom@example.com',
    featureScope: 'sketch_to_art',
    scopeLabelVi: 'Phác thảo Canvas sang Tranh vẽ',
    promptText: 'Chú khủng long bạo chúa đeo kính cận đang ăn kem dâu tây bên bãi cỏ hoa',
    sketchThumbnailUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23EBF8FF"/><ellipse cx="50" cy="55" rx="30" ry="25" fill="%2334D399" stroke="%23065F46" stroke-width="2.5"/><circle cx="65" cy="40" r="14" fill="%2334D399" stroke="%23065F46" stroke-width="2.5"/><circle cx="68" cy="38" r="4" fill="%231E293B"/><circle cx="60" cy="38" r="4" fill="%231E293B"/><polygon points="40,80 48,95 35,95" fill="%23F59E0B"/></svg>',
    rejectedBy: 'Vertex AI Content Moderation API',
    rejectionCategory: 'FALSE_POSITIVE_SUSPECTED',
    categoryLabelVi: 'Nghi ngờ chặn nhầm (Sinh vật tiền sử ngộ nghĩnh)',
    flaggedTrigger: 'khủng long bạo chúa',
    aiReasonDetail:
      'Bộ lọc nhận diện cụm từ "bạo chúa" (tyrant/violence) kết hợp hàm răng khủng long, kích hoạt bộ cảnh báo horror/threat.',
    pedagogicalRecommendation:
      'Bé muốn vẽ một chú khủng long ăn kem dễ thương và hiền lành. Không có yếu tố đe dọa hay kinh dị thực tế.',
    status: 'pending',
  },
  {
    id: 'inc_003',
    createdAt: '2026-09-04 14:55',
    studentName: 'Bé Gia Huy',
    grade: 'Lớp 4',
    parentEmail: 'giahuy.dad@example.com',
    featureScope: 'comic_script',
    scopeLabelVi: 'Kịch bản truyện tranh 4 khung',
    promptText: 'Bác gấu đen to lớn hái quả mọng bị ong đuổi chạy té khói trong khu rừng sắc màu',
    rejectedBy: 'Universal Negative Prompt Filter',
    rejectionCategory: 'FALSE_POSITIVE_SUSPECTED',
    categoryLabelVi: 'Nghi ngờ chặn nhầm (Hoạt cảnh ngộ nghĩnh)',
    flaggedTrigger: 'ong đuổi / scary',
    aiReasonDetail:
      'Cụm từ rượt đuổi hoảng loạn kích hoạt cảnh báo nguy hiểm sinh học hoặc tình huống kinh hãi (scary panic).',
    pedagogicalRecommendation:
      'Mô-típ kinh điển của phim hoạt hình thiếu nhi vui nhộn (tương tự Gấu Pooh / Tom & Jerry), an toàn cho trẻ.',
    status: 'pending',
  },
  {
    id: 'inc_004',
    createdAt: '2026-09-04 11:30',
    studentName: 'Bé Thảo My',
    grade: 'Lớp 1',
    parentEmail: 'thaomy.family@example.com',
    featureScope: 'character_mascot',
    scopeLabelVi: 'Xưởng tạo Nhân vật Mascot',
    promptText: 'Công chúa hoa hồng cầm đũa thần phép thuật cứu bạn nhỏ bị lạc trong sương mù',
    rejectedBy: 'Google Gemini Native Safety Filter',
    rejectionCategory: 'FALSE_POSITIVE_SUSPECTED',
    categoryLabelVi: 'Đã gỡ chặn (Ngoại lệ phép thuật cổ tích)',
    flaggedTrigger: 'đũa thần',
    aiReasonDetail:
      'Hệ thống AI nhận định nhầm cụm "cứu bạn nhỏ bị lạc" vào danh mục rủi ro trẻ em (child danger).',
    pedagogicalRecommendation:
      'Chủ đề nhân ái giúp đỡ bạn bè, rất phù hợp và khuyến khích phát triển tâm hồn trẻ.',
    status: 'approved_override',
    adminNote: 'Đã thẩm định: Kịch bản cổ tích nhân văn, đã cấp cờ bypass an toàn cho bé.',
    reviewedAt: '2026-09-04 11:45',
  },
  {
    id: 'inc_005',
    createdAt: '2026-09-04 10:15',
    studentName: 'Bé Quốc Anh',
    grade: 'Lớp 5',
    parentEmail: 'quocanh.p@example.com',
    featureScope: 'comic_script',
    scopeLabelVi: 'Kịch bản truyện tranh 4 khung',
    promptText: 'Robot đại chiến phá hủy thành phố đổ máu tan hoang và tiêu diệt kẻ thù',
    rejectedBy: 'Universal Negative Prompt Filter + Gemini Safety',
    rejectionCategory: 'VIOLENCE_WEAPONS',
    categoryLabelVi: 'Xác nhận vi phạm (Bạo lực / Phá hủy nặng)',
    flaggedTrigger: 'đổ máu tan hoang',
    aiReasonDetail:
      'Chứa từ khóa cấm trực tiếp "đổ máu", "tiêu diệt kẻ thù", "phá hủy thành phố". Vi phạm quy chuẩn an toàn thiếu nhi.',
    pedagogicalRecommendation:
      'Giữ nguyên quyết định từ chối. Gợi ý phụ huynh hướng dẫn bé đổi kịch bản sang robot thi đấu thể thao hoặc bảo vệ môi trường.',
    status: 'confirmed_rejected',
    adminNote: 'Xác nhận AI chặn đúng. Nội dung bạo lực đẫm máu không phù hợp lứa tuổi học sinh tiểu học.',
    reviewedAt: '2026-09-04 10:25',
  },
  {
    id: 'inc_006',
    createdAt: '2026-09-04 09:05',
    studentName: 'Bé Tuệ Mẫn',
    grade: 'Lớp 3',
    parentEmail: 'tueman.edu@example.com',
    featureScope: 'asmo_math_visual',
    scopeLabelVi: 'Trực quan hóa Toán Olympic ASMO',
    promptText: 'Cân đĩa thăng bằng chia quả dưa hấu và 5 quả táo để tìm khối lượng quả dưa',
    rejectedBy: 'Vertex AI Content Moderation',
    rejectionCategory: 'FALSE_POSITIVE_SUSPECTED',
    categoryLabelVi: 'Đã gỡ chặn (Toán học trực quan)',
    flaggedTrigger: 'cắt chia dưa hấu',
    aiReasonDetail:
      'Từ khóa "chia cắt" bị hệ thống gán nhầm vào hành động gây tổn hại thể chất.',
    pedagogicalRecommendation:
      'Bài toán cân đĩa tư duy Olympic ASMO chuẩn mực của lớp 3, kích thích tư duy đại số trực quan.',
    status: 'approved_override',
    adminNote: 'Đã thẩm định: Bài toán cân đĩa ASMO chuẩn, đã cho phép chạy lại prompt.',
    reviewedAt: '2026-09-04 09:20',
  },
]

/**
 * Tải danh sách sự cố từ chối của AI từ LocalStorage hoặc trả về danh sách mẫu
 */
export function loadRejectionIncidents(): AiRejectionIncident[] {
  if (typeof window === 'undefined') return DEFAULT_REJECTION_INCIDENTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AI_REJECTIONS)
    if (!raw) return DEFAULT_REJECTION_INCIDENTS
    const parsed = JSON.parse(raw) as AiRejectionIncident[]
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge với default để bảo toàn dữ liệu nếu có ca mới
      return DEFAULT_REJECTION_INCIDENTS.map((defItem) => {
        const saved = parsed.find((p) => p.id === defItem.id)
        return saved ? { ...defItem, ...saved } : defItem
      })
    }
  } catch {
    // Ignore JSON parse errors
  }
  return DEFAULT_REJECTION_INCIDENTS
}

/**
 * Lưu danh sách sự cố vào LocalStorage
 */
export function saveRejectionIncidents(incidents: AiRejectionIncident[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_AI_REJECTIONS, JSON.stringify(incidents, null, 2))
  } catch {
    // Ignore storage quota errors
  }
}
