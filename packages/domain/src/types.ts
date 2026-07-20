export type Role = 'student' | 'parent' | 'teacher' | 'admin'

export type QuestStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed'

export type Phase = 'learn' | 'practice' | 'check'

export type PromptSlotKey =
  | 'character'
  | 'action'
  | 'environment'
  | 'mood'
  | 'style'

export type AssetType =
  | 'character'
  | 'background'
  | 'comic'
  | 'video'
  | 'badge'
  | 'sticker'
  | 'panel'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface PromptChip {
  id: string
  slot: PromptSlotKey
  label: string
  emoji: string
  description?: string
}

export interface PromptParts {
  character?: PromptChip
  action?: PromptChip
  environment?: PromptChip
  mood?: PromptChip
  style?: PromptChip
  freeText?: string
}

export interface QuestNode {
  id: string
  order: number
  title: string
  skill: string
  reward: string
  duration: string
  hook: string
  accent: string
  practiceKind: string
  videoUrl?: string | null
}

export interface SafetyResult {
  ok: boolean
  reason?: string
  message?: string
}
