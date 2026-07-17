export type Role = 'student' | 'parent' | 'teacher'

export type QuestStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'review_suggested'

export type AssetType =
  | 'character'
  | 'background'
  | 'comic'
  | 'video'
  | 'badge'
  | 'sticker'
  | 'voice'
  | 'panel'

export type PromptSlotKey =
  | 'character'
  | 'action'
  | 'environment'
  | 'mood'
  | 'style'

export interface ChildProfile {
  id: string
  nickname: string
  avatarId: string
  level: number
  xp: number
  goal: 'comic' | 'video' | 'character' | null
  currentCourse: string
  onboarded: boolean
}

export interface SkillMastery {
  skillId: string
  label: string
  level: 0 | 1 | 2 | 3 | 4
  confidence: number
}

export interface Quest {
  id: string
  order: number
  title: string
  skill: string
  reward: string
  duration: string
  hook: string
  goals: string[]
  learnCards: LearnCard[]
  status: QuestStatus
  accent: string
  icon: string
}

export interface LearnCard {
  id: string
  title: string
  body: string
  tip: string
  kind: 'concept' | 'example' | 'safety'
}

export interface PromptChip {
  id: string
  slot: PromptSlotKey
  label: string
  emoji: string
  description: string
}

export interface PromptParts {
  character?: PromptChip
  action?: PromptChip
  environment?: PromptChip
  mood?: PromptChip
  style?: PromptChip
  freeText?: string
}

export interface GeneratedResult {
  id: string
  title: string
  imageDataUrl: string
  matches: {
    character: boolean
    action: boolean
    environment: boolean
  }
  oddDetail?: string
}

export interface Asset {
  id: string
  type: AssetType
  name: string
  questId?: string
  thumbnail: string
  createdAt: string
  private: boolean
  meta?: Record<string, string>
}

export interface ComicElement {
  id: string
  type: 'image' | 'text' | 'bubble' | 'sticker'
  panelId: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  content: string
  color?: string
}

export interface ComicPanel {
  id: string
  label: string
  background?: string
}

export interface ComicPage {
  id: string
  panels: ComicPanel[]
  elements: ComicElement[]
}

export interface VideoScene {
  id: string
  panelId: string
  title: string
  duration: number
  motion: 'pan' | 'zoom' | 'float' | 'none'
  narration: string
  thumbnail: string
}

export interface Approval {
  id: string
  projectId: string
  projectTitle: string
  thumbnail: string
  destination: 'family' | 'class' | 'none'
  status: 'pending' | 'approved' | 'changes_requested'
  aiAssisted: boolean
  requestedAt: string
  feedback?: string
}

export interface StudentRow {
  id: string
  nickname: string
  avatarId: string
  progress: number
  skillsNeedHelp: string[]
  latestProject: string
  status: 'on_track' | 'needs_support' | 'ahead'
}

export interface CreativeProject {
  id: string
  title: string
  cover: string
  characterName: string
  reflection: string
  skillsLearned: string[]
  shareStatus: 'private' | 'pending' | 'family' | 'class'
  approvalStatus: 'none' | 'pending' | 'approved' | 'changes_requested'
  comicReady: boolean
  videoReady: boolean
}

export interface PrivacySettings {
  allowClassGallery: boolean
  allowFreeText: boolean
  allowAudioNarration: boolean
}

export interface ToastMessage {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  description?: string
}

export interface DemoState {
  currentRole: Role
  child: ChildProfile
  completedQuestIds: string[]
  currentQuestId: string | null
  currentProject: CreativeProject
  backpackAssets: Asset[]
  selectedPromptParts: PromptParts
  generatedResults: GeneratedResult[]
  selectedResultId?: string
  comicPages: ComicPage[]
  videoScenes: VideoScene[]
  approvals: Approval[]
  students: StudentRow[]
  skills: SkillMastery[]
  privacy: PrivacySettings
  xp: number
  badges: string[]
  selectedVoiceId: string
  selectedMusicId: string
  subtitlesOn: boolean
  videoRendered: boolean
  generationStage: string | null
  demoErrorMode: boolean
  toasts: ToastMessage[]
  helperOpen: boolean
}
