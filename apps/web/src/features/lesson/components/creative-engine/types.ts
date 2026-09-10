export type CreativeEngineMode =
  | 'magic-keys'
  | 'style-prism'
  | 'prompt-doctor'
  | 'layer-stacking'
  | 'identity-lock'
  | 'card-forge'

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
  required?: boolean
  category?: CreativeBlockCategory
  currentBlock?: CreativeBlock | null
  colorScheme?: 'sky' | 'amber' | 'mint' | 'rose' | 'purple' | 'emerald' | 'indigo' | 'slate'
  hint?: string
}

export interface EngineProps {
  onPromptChange: (prompt: string, blocks: CreativeBlock[]) => void
  characterName?: string
  lessonId?: string
  currentPrompt?: string
  lockedFeatures?: string[]
  illustrationType?: string
  activeBlocks?: CreativeBlock[]
}

export interface EngineConfigInfo {
  mode: CreativeEngineMode
  title: string
  shortName: string
  icon: string
  description: string
  badge: string
}
