import {
  DEFAULT_MAGIC_KEYS_PARTS,
  DEFAULT_STYLE_PRISM_PARTS,
  DEFAULT_PROMPT_DOCTOR_PARTS,
  DEFAULT_LAYER_STACKING_PARTS,
  DEFAULT_CARD_FORGE_PARTS,
} from '@/features/teacher/components/engine-editors/engine-editor-defaults'

export interface StudioImageItem {
  id: string
  url?: string
  turn: number
  prompt: string
  time: string
  toneBg: string
  aspectRatio?: string
  verifiedFeatures?: boolean
  partIndex?: number
  partTurn?: 1 | 2
}

export interface PracticePartDef {
  id?: string
  partNumber: number
  title: string
  icon?: string
  iconImage?: string
  emoji?: string
}

export const DEFAULT_IDENTITY_LOCK_PARTS: PracticePartDef[] = [
  { partNumber: 1, title: 'Chú Sóc Bông Hạt Dẻ', icon: '🐿️', iconImage: '/assets/aiki-islands/island3_lesson2_opt_b.jpg' },
  { partNumber: 2, title: 'Cáo Lửa Zico Hiệp Sĩ', icon: '🦊', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
  { partNumber: 3, title: 'Chú Bé Robot Leo', icon: '🤖', iconImage: '/assets/aiki-keys/key_what_blue.jpg' },
  { partNumber: 4, title: 'Mèo Thám Tử Mimi', icon: '🐱', iconImage: '/assets/aiki-islands/island1_lesson1_cat.jpg' },
]

export interface PracticePartState extends PracticePartDef {
  images: StudioImageItem[]
  isDone: boolean
  isActive: boolean
}

export function getDefaultPracticeParts(
  lessonId?: string,
  subjectName?: string,
  mode?: string
): PracticePartDef[] {
  const normMode = (mode || '').toLowerCase()
  const normId = (lessonId || '').toLowerCase()
  const normSub = (subjectName || '').toLowerCase()

  // 0. Nếu mode là creative-notebook: Sổ tay Ba Lô là text engine, KHÔNG có ngân hàng món đồ chia lượt!
  if (normMode === 'creative-notebook' || normMode === 'notebook') {
    return []
  }

  // 1. Nếu mode là prompt-doctor hoặc lessonId là bài 1.4: Trả về DEFAULT_PROMPT_DOCTOR_PARTS
  if (normMode === 'prompt-doctor' || normId.includes('1-4') || normId.includes('1.4')) {
    return DEFAULT_PROMPT_DOCTOR_PARTS
  }

  // 2. Nếu mode là layer-stacking hoặc lessonId là bài 2.2: Trả về DEFAULT_LAYER_STACKING_PARTS
  if (normMode === 'layer-stacking' || normId.includes('2-2') || normId.includes('2.2')) {
    return DEFAULT_LAYER_STACKING_PARTS
  }

  // 3. Nếu là bài 3.1: Trả về 4 Chiến Tướng TCG của Bài 3.1
  if (normId.includes('3-1') || normId.includes('3.1')) {
    return [
      { partNumber: 1, title: 'Hiệp Sĩ Cáo Lửa (Chiến tướng Hệ Hỏa)', icon: '🦊', iconImage: '/assets/aiki-islands/island1_lesson4_engineer.jpg' },
      { partNumber: 2, title: 'Rồng Băng Bão Tuyết (Chiến tướng Hệ Băng)', icon: '🐉', iconImage: '/assets/aiki-keys/key_what_blue.jpg' },
      { partNumber: 3, title: 'Sư Tử Lửa Cuồng Nộ (Chiến tướng Hệ Hỏa)', icon: '🦁', iconImage: '/assets/aiki-keys/key_action_orange.jpg' },
      { partNumber: 4, title: 'Đại Bàng Lôi Thần (Chiến tướng Hệ Sét)', icon: '🦅', iconImage: '/assets/aiki-keys/key_how_yellow.jpg' },
    ]
  }

  // 4. Nếu mode là card-forge hoặc bài 4.4, 5.1: Trả về DEFAULT_CARD_FORGE_PARTS
  if (
    normMode === 'card-forge' ||
    normId.includes('4-4') ||
    normId.includes('4.4') ||
    normId.includes('5-1') ||
    normId.includes('5.1')
  ) {
    return DEFAULT_CARD_FORGE_PARTS
  }

  // 5. Nếu mode là identity-lock hoặc bài 3- / 3.: Trả về DEFAULT_IDENTITY_LOCK_PARTS
  if (
    normMode === 'identity-lock' ||
    normId.includes('3-') ||
    normId.includes('3.')
  ) {
    return DEFAULT_IDENTITY_LOCK_PARTS
  }

  // 5. Nếu mode là style-prism hoặc bài 1.3: Trả về DEFAULT_STYLE_PRISM_PARTS
  if (normMode === 'style-prism' || normId.includes('1-3') || normId.includes('1.3')) {
    return DEFAULT_STYLE_PRISM_PARTS
  }

  // 6. Nếu là bài 1.2 hoặc chìa khóa: Trả về DEFAULT_MAGIC_KEYS_PARTS
  if (normId.includes('1-2') || normId.includes('1.2') || normId.includes('chia-khoa')) {
    return DEFAULT_MAGIC_KEYS_PARTS
  }

  // 7. Kiểm tra bài học hoặc chủ thể đặc thù (Bài 1.1 / Mèo)
  if (normId.includes('1-1') || normId.includes('1.1') || normId.includes('meo-muop') || normSub.includes('mèo') || normSub.includes('cat')) {
    return [
      { partNumber: 1, title: 'Chú Mèo Mướp Vàng', icon: '🐱', iconImage: '/assets/aiki-keys/key_subject_cat.jpg' },
      { partNumber: 2, title: 'Mèo Béo Ngủ Ghế Mây', icon: '🪑', iconImage: '/assets/aiki-keys/key_what_blue.jpg' },
      { partNumber: 3, title: 'Mèo Bắt Bướm Nắng Vàng', icon: '🦋', iconImage: '/assets/aiki-keys/key_action_orange.jpg' },
      { partNumber: 4, title: 'Mèo Phi Hành Gia', icon: '🚀', iconImage: '/assets/aiki-keys/key_where_pink.jpg' },
    ]
  }

  // 7. Mặc định: Trả về DEFAULT_MAGIC_KEYS_PARTS (hoặc gán subjectName cho part 1 nếu có tên tùy chỉnh)
  if (subjectName && subjectName !== 'Cái cốc sứ trắng' && !normSub.includes('cốc')) {
    return [
      { partNumber: 1, title: subjectName, icon: '🎨', iconImage: '/assets/aiki-islands/island1_lesson2_teacup.jpg' },
      { partNumber: 2, title: 'Chiếc xe đạp mini', icon: '🚲', iconImage: '/assets/aiki-islands/island1_lesson2_bicycle.jpg' },
      { partNumber: 3, title: 'Cuốn sổ tay bìa da', icon: '📖', iconImage: '/assets/aiki-islands/island1_lesson2_notebook.jpg' },
      { partNumber: 4, title: 'Cái đồng hồ cổ', icon: '⏰', iconImage: '/assets/aiki-islands/island1_lesson2_clock.jpg' },
    ]
  }

  return DEFAULT_MAGIC_KEYS_PARTS
}
