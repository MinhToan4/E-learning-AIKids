import type React from 'react'

export type CreativeEngineMode =
  | 'magic-keys'
  | 'style-prism'
  | 'prompt-doctor'
  | 'layer-stacking'
  | 'identity-lock'
  | 'card-forge'
  | 'creative-notebook'

export interface CreativeNotebookField {
  id: string
  label: string
  prefix?: string // Tiền tố cố định hiển thị trước ô nhập (VD: "Tên: ", "Muốn: bạn ấy muốn ")
  placeholder?: string
  defaultValue?: string
  helperTip?: string // Mẹo sư phạm / lưu ý quan trọng (VD: "Đừng bỏ trống hai ô SỢ và DỞ...")
  badge?: string // Nhãn nhỏ (VD: "Quan trọng", "Hỏi người nhà", "Bắt buộc", "Tổng = 12")
  category?: string // Phân loại trường
  rows?: number
  colSpan?: 1 | 2
  spanFull?: boolean
}

export interface CreativeNotebookChecklistItem {
  id: string
  label: string
  hint?: string
}

export interface CreativeNotebookConfig {
  notebookTitle: string
  challengeSummary?: string[]
  checklist?: CreativeNotebookChecklistItem[] // Danh sách tiêu chí tự kiểm tra
  sampleTemplate?: string
  sampleHelperTitle?: string
  fields?: CreativeNotebookField[]
  akiAdvice?: string
  backpackCategory?: string
  backpackTag?: string
  characterName?: string
}

export type CreativeBlockCategory =
  | 'subject'
  | 'color-shape'
  | 'action'
  | 'context'
  | 'lighting-mood'
  | 'style'
  | 'expression'
  | 'foreground'
  | 'background'
  | 'cure'
  | 'stat-trait'
  | 'modifier'

export interface CreativeBlock {
  id: string
  label: string
  text: string
  category: CreativeBlockCategory
  icon?: string
  colorScheme?: 'sky' | 'amber' | 'mint' | 'rose' | 'purple' | 'emerald' | 'indigo' | 'slate'
  badge?: string
  hint?: string
}

export interface BlockSlot {
  id: string
  keyId: string
  label: string
  keyNumber?: number
  keyTitle?: string
  required?: boolean
  locked?: boolean
  category?: CreativeBlockCategory
  currentBlock?: CreativeBlock | null
  colorScheme?: 'sky' | 'amber' | 'mint' | 'rose' | 'purple' | 'emerald' | 'indigo' | 'slate'
  hint?: string
  lockImage?: string
  subjectImage?: string
}

export interface EngineProps {
  onPromptChange: (prompt: string, blocks: CreativeBlock[]) => void
  characterName?: string
  selectedSubject?: string
  lessonId?: string
  currentPrompt?: string
  lockedFeatures?: string[]
  illustrationType?: string
  activeBlocks?: CreativeBlock[]
  canvasSlot?: React.ReactNode
  practiceSlot?: React.ReactNode
  promptSlot?: React.ReactNode
  practiceParts?: Array<{
    id?: string
    partNumber: number
    title: string
    icon?: string
    iconImage?: string
    emoji?: string
  }>
  activePartIndex?: number
  onPartChange?: (index: number) => void
  notebookConfig?: CreativeNotebookConfig
  onSubmitNotebook?: (content: string, structuredData?: Record<string, string>) => void
  onSaveDraft?: (content: string, structuredData?: Record<string, string>) => void
}

export interface EngineConfigInfo {
  mode: CreativeEngineMode
  title: string
  shortName: string
  icon: string
  description: string
  badge: string
}
