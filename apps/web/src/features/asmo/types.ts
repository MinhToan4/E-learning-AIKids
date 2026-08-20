import type { AikidCatPose } from '@/shared/components/ui/AikidCatCharacter'

export type AsmoSubject = 'math' | 'science' | 'english'

export type AsmoGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type AsmoTemplateKey =
  | '3D_CUBE_CLUSTER'
  | 'GRID_PATH_MAZE'
  | 'INTERACTIVE_CLOCK'
  | 'SHADED_AREA_FRACTION'
  | 'MATCHSTICK_FIGURE'
  | 'NET_CUBE_FOLDING'
  | '3D_BALANCE_SCALE'

export type CubeCoordinate = [number, number, number]

export type MatchstickSegment = {
  from: [number, number, number]
  to: [number, number, number]
}

export type NetFace = {
  id: number
  pos: [number, number, number]
  color: number
  label?: string
}

export type AsmoVisualSpec = {
  template: AsmoTemplateKey
  camera: { x: number; y: number; z: number }
  cubes?: CubeCoordinate[]
  gridSize?: [number, number]
  start?: [number, number]
  target?: [number, number]
  hour?: number
  minute?: number
  totalSlices?: number
  shadedSlices?: number
  matches?: MatchstickSegment[]
  faces?: NetFace[]
  leftWeightCount?: number
  rightWeightCount?: number
  leftItemLabel?: string
  rightItemLabel?: string
  autoRotate?: boolean
  activePathIndex?: number
  explanationStep?: number
  customPathPoints?: [number, number][]
  cubeCount?: number
  fractionTotal?: number
  fractionShaded?: number
  matchCount?: number
}

export type AsmoExplanationStep = {
  stepIndex: number
  title: string
  description: string
  code?: string
  points?: [number, number][]
  layerIndex?: number
  hour?: number
  minute?: number
  shadedCount?: number
  activeIndices?: number[]
}

export type AsmoQuestionOption = {
  id: string
  label: string
  text: string
  imageUrl?: string | null
  svgDiagramKey?: string | null
}

export type AsmoDomainType =
  | 'FORMULA'
  | 'GEOMETRY_VISUAL'
  | 'ARITHMETIC'
  | 'REAL_WORLD'
  | 'LOGIC_PUZZLE'

export type AsmoQuestion = {
  id: string
  subject: AsmoSubject
  grade: AsmoGrade
  topicCode: string
  topicName: string
  domainType?: AsmoDomainType
  title: string
  text: string
  options: AsmoQuestionOption[]
  correctAnswer: string
  explanation: string
  meeHint: string
  points: number
  imageUrl?: string | null
  svgDiagramKey?: string | null
  renderSpec?: AsmoVisualSpec
  diagramDescription?: string
  explanationSteps?: AsmoExplanationStep[]
}

export type AsmoExam = {
  id: string
  code: string
  title: string
  subject: AsmoSubject
  grade: AsmoGrade
  year: number
  round: string
  durationMinutes: number
  passScore: number
  totalPoints: number
  description: string
  questions: AsmoQuestion[]
}

export type AsmoCurriculumWeek = {
  week: number
  subject: AsmoSubject
  grade: AsmoGrade
  topic: string
  title: string
  summary: string
  keyCompetencies: string[]
  visualTemplate?: AsmoTemplateKey
  sampleQuestionIds: string[]
}

export type AsmoMeeEmotion = AikidCatPose

export type AsmoMeeDialogue = {
  pose: AsmoMeeEmotion
  speech: string
  hint?: string
}
