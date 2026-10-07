import type React from 'react'
import type {
  StageBlockItem,
  LearnCardDraft,
} from '../../lib/authoring'

export const LECTURE_GESTURES = [
  { id: 'presentation', label: '🤲 Thuyết trình cơ bản' },
  { id: 'point-left', label: '👈 Chỉ bảng bài học' },
  { id: 'think', label: '💡 Cùng suy nghĩ (đố vui)' },
  { id: 'idea', label: '💡 Aha! Nêu mẹo (quy tắc)' },
  { id: 'celebrate-1', label: '🎉 Hoan hô ăn mừng' },
  { id: 'explain', label: '👐 Diễn giải mở rộng' },
] as const

export const KEY_COLOR_PRESETS = [
  { tone: 'sky' as const, name: 'Xanh Sky', icon: '🔵', image: '/assets/aiki-keys/key_what_blue.jpg', bg: 'bg-blue-50/80 border-blue-200 text-blue-950', badge: 'bg-blue-600 text-white' },
  { tone: 'sun' as const, name: 'Vàng Sun', icon: '🟡', image: '/assets/aiki-keys/key_how_yellow.jpg', bg: 'bg-amber-50/80 border-amber-200 text-amber-950', badge: 'bg-amber-600 text-white' },
  { tone: 'coral' as const, name: 'Cam Mango', icon: '🟠', image: '/assets/aiki-keys/key_action_orange.jpg', bg: 'bg-orange-50/80 border-orange-200 text-orange-950', badge: 'bg-orange-600 text-white' },
  { tone: 'rose' as const, name: 'Hồng Gum', icon: '🔴', image: '/assets/aiki-keys/key_where_pink.jpg', bg: 'bg-rose-50/80 border-rose-200 text-rose-950', badge: 'bg-rose-600 text-white' },
] as const

export interface StageBlockEditorBaseProps {
  block: StageBlockItem
  stageIndex: number
  card: LearnCardDraft
  readOnly?: boolean
  updateBlockItem: (stageIndex: number, blockId: string, patch: Partial<StageBlockItem>) => void
  updateLearnCard: (index: number, patch: Partial<LearnCardDraft>) => void
  uploadingStageMedia: string | null
  setUploadingStageMedia: (val: string | null) => void
  uploadLearnCardMedia: (stageIndex: number, field: any, file: File) => Promise<void>
  courseId: string
  inputStyle: React.CSSProperties
  textareaStyle: React.CSSProperties
  showToast: (msg: string, type?: any) => void
}
