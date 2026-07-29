export type PromptSlotKey =
  | 'character'
  | 'action'
  | 'environment'
  | 'mood'
  | 'style'

export type PromptChip = {
  id: string
  slot: PromptSlotKey
  label: string
  emoji: string
  description?: string
}

export type PromptParts = Partial<Record<PromptSlotKey, PromptChip>> & {
  freeText?: string
}
