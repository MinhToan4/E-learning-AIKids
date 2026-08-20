import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import {
  ChevronLeft,
  Box,
  Compass,
  Trophy,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Zap,
  Lightbulb,
  GraduationCap,
  Calendar,
  Filter,
  Search,
} from 'lucide-react'
import { ASMO_JOURNEY_TOPICS, type AsmoJourneyTopic, type JourneyLevelId } from '../data/asmo-journey-topics'
import { ASMO_SUBJECTS, ASMO_GRADES, ASMO_GRADE_TIERS, type AsmoGradeTier } from '../data/asmo-curriculum'
import { ASMO_3D_TEMPLATES } from '../data/asmo-3d-templates'
import type { AsmoSubject, AsmoGrade, AsmoVisualSpec } from '../types'
import { AsmoThreeViewer } from '../components/AsmoThreeViewer'
import { AsmoMathVisualizer } from '../components/AsmoMathVisualizer'
import { AsmoTrigLabVisualizer } from '../components/AsmoTrigLabVisualizer'
import { AsmoFormula } from '../components/AsmoFormula'
import { AsmoMeeTutor } from '../components/AsmoMeeTutor'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export type AsmoTopicCategoryGroup =
  | 'all'
  | 'primary-visual'
  | 'secondary-stem'
  | 'high-olympic'
  | 'trig-geometry'
  | 'algebra'
  | '3d-spatial'
  | 'combinatorics'

export const ASMO_TOPIC_GROUPS: {
  id: AsmoTopicCategoryGroup
  label: string
  shortLabel: string
  icon: string
  grades: string
  topicIds?: string[]
}[] = [
  {
    id: 'all',
    label: 'Tất Cả Chuyên Đề Olympic',
    shortLabel: 'Tất Cả',
    icon: '🌟',
    grades: 'Khối 1–12',
  },
  {
    id: 'primary-visual',
    label: '🎒 Khối Tiểu Học (Toán Trực Quan & 3D)',
    shortLabel: '🎒 Tiểu Học',
    icon: '🎒',
    grades: 'Khối 1–5',
    topicIds: [
      'elem-addition',
      'elem-subtraction',
      'elem-multiplication',
      'elem-division',
      'elementary-arithmetic',
      'cube-cluster',
      'interactive-clock',
      'shaded-fractions',
      'balance-scale',
      'matchstick-geometry',
      'grid-maze',
      'cube-nets',
    ],
  },
  {
    id: 'secondary-stem',
    label: '🏫 Khối THCS (4 Chuyên Đề Trọng Điểm)',
    shortLabel: '🏫 THCS',
    icon: '🏫',
    grades: 'Khối 6–9',
    topicIds: [
      'number-theory-divisibility',
      'algebra-polynomials',
      'pythagoras-geometry',
      'combinatorics-probability',
    ],
  },
  {
    id: 'high-olympic',
    label: '🎓 Khối THPT (4 Chuyên Đề Chuyên Sâu)',
    shortLabel: '🎓 THPT',
    icon: '🎓',
    grades: 'Khối 10–12',
    topicIds: [
      'trigonometry',
      'exp-logarithm',
      'algebra-viete',
      'spatial-polyhedron',
    ],
  },
  {
    id: 'trig-geometry',
    label: 'Lượng Giác & Hình Học Phẳng (Khối 7–12)',
    shortLabel: 'Lượng Giác & Hình Học',
    icon: '📐',
    grades: 'Khối 7–12',
    topicIds: ['trigonometry', 'pythagoras-geometry', 'spatial-polyhedron', 'shaded-fractions'],
  },
  {
    id: 'algebra',
    label: 'Đại Số, Phép Tính & Số Học (Khối 1–12)',
    shortLabel: 'Đại Số & Số Học',
    icon: '🧮',
    grades: 'Khối 1–12',
    topicIds: [
      'elem-addition',
      'elem-subtraction',
      'elem-multiplication',
      'elem-division',
      'elementary-arithmetic',
      'algebra-polynomials',
      'algebra-viete',
      'exp-logarithm',
      'number-theory-divisibility',
      'balance-scale',
    ],
  },
  {
    id: '3d-spatial',
    label: 'Không Gian 3D & Trực Quan (Khối 1–5)',
    shortLabel: 'Không Gian 3D',
    icon: '🧊',
    grades: 'Khối 1–5',
    topicIds: ['cube-cluster', 'cube-nets', 'matchstick-geometry', 'shaded-fractions', 'interactive-clock', 'grid-maze'],
  },
  {
    id: 'combinatorics',
    label: 'Tổ Hợp, Xác Suất & Logic (Khối 1–12)',
    shortLabel: 'Tổ Hợp & Số Học',
    icon: '🎲',
    grades: 'Khối 1–12',
    topicIds: ['combinatorics-probability', 'number-theory-divisibility', 'grid-maze'],
  },
]

export function AsmoLearningJourneyPage() {
  const navigate = useNavigate()
  const params = useParams<{ topicId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. Topic selection from route param or search param or default to first topic
  const initialTopicId = params.topicId || searchParams.get('topic') || ASMO_JOURNEY_TOPICS[0].id
  const [currentTopicId, setCurrentTopicId] = useState<string>(
    ASMO_JOURNEY_TOPICS.some((t) => t.id === initialTopicId) ? initialTopicId : ASMO_JOURNEY_TOPICS[0].id,
  )

  // 2. Filters state
  const [selectedSubject, setSelectedSubject] = useState<AsmoSubject>('math')
  const [selectedTier, setSelectedTier] = useState<AsmoGradeTier | 'all'>('all')
  const [selectedGroup, setSelectedGroup] = useState<AsmoTopicCategoryGroup>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 3. Level & interactive step state
  const [currentLevel, setCurrentLevel] = useState<JourneyLevelId>(1)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [activePedagogicalStep, setActivePedagogicalStep] = useState<1 | 2 | 3>(1)
  const [userScore, setUserScore] = useState(0)
  const [completedLevels, setCompletedLevels] = useState<Record<string, boolean>>({})

  // 4. Lab interactive solver control state (Trigonometry & Math Visualizers)
  const [labAngle, setLabAngle] = useState<number | undefined>(undefined)
  const [labTab, setLabTab] = useState<'circle' | 'wave' | 'formula' | undefined>(undefined)
  const [labHighlight, setLabHighlight] = useState<string | null>(null)
  const [labDemoSin, setLabDemoSin] = useState<number | undefined>(undefined)
  const [activeLabAction, setActiveLabAction] = useState<string | null>(null)

  // Find active topic
  const currentTopic = useMemo(() => {
    return ASMO_JOURNEY_TOPICS.find((t) => t.id === currentTopicId) || ASMO_JOURNEY_TOPICS[0]
  }, [currentTopicId])

  // Current level problem data
  const currentLevelData = currentTopic.levels[currentLevel]
  const currentProblem = currentLevelData.problem

  // Synchronize interactive lab defaults when topic or level changes
  useEffect(() => {
    if (currentTopic.id === 'trigonometry') {
      if (currentLevel === 1) {
        setLabAngle(150)
        setLabTab('circle')
        setLabHighlight('sin')
        setLabDemoSin(undefined)
        setActiveLabAction('sin150')
      } else if (currentLevel === 2) {
        setLabAngle(30)
        setLabTab('formula')
        setLabHighlight('double')
        setLabDemoSin(1 / 3)
        setActiveLabAction('double-sin-third')
      } else if (currentLevel === 3) {
        setLabAngle(7.5)
        setLabTab('circle')
        setLabHighlight('tan')
        setLabDemoSin(undefined)
        setActiveLabAction('olympic-7.5')
      }
    } else if (currentTopic.id === 'algebra-viete') {
      setLabAngle(undefined)
      setLabTab(undefined)
      setLabHighlight('viete')
      setLabDemoSin(undefined)
      setActiveLabAction(
        currentLevel === 1 ? 'viete-diff-square' : currentLevel === 2 ? 'viete-sp' : 'viete-frac',
      )
    } else if (currentTopic.id === 'pythagoras-geometry') {
      setLabAngle(undefined)
      setLabTab(undefined)
      setLabHighlight('pythagoras')
      setLabDemoSin(undefined)
      setActiveLabAction(
        currentLevel === 1 ? 'pyth-c10' : currentLevel === 2 ? 'pyth-oxy' : 'pyth-alt',
      )
    } else if (currentTopic.id === 'algebra-polynomials') {
      setLabAngle(undefined)
      setLabTab(undefined)
      setLabHighlight('polynomials')
      setLabDemoSin(undefined)
      setActiveLabAction(
        currentLevel === 1 ? 'poly-diff-sq' : currentLevel === 2 ? 'poly-factor' : 'poly-sq-complete',
      )
    } else if (currentTopic.id === 'spatial-polyhedron') {
      setLabAngle(undefined)
      setLabTab(undefined)
      setLabHighlight('polyhedron')
      setLabDemoSin(undefined)
      setActiveLabAction(
        currentLevel === 1 ? 'polyh-newton' : currentLevel === 2 ? 'polyh-pyr-vol' : 'polyh-euler',
      )
    } else if (currentTopic.id === 'exp-logarithm') {
      setLabAngle(undefined)
      setLabTab(undefined)
      setLabHighlight('logarithm')
      setLabDemoSin(undefined)
      setActiveLabAction(
        currentLevel === 1 ? 'log-calc' : currentLevel === 2 ? 'log-sub-t' : 'log-merge',
      )
    } else if (currentTopic.id === 'combinatorics-probability') {
      setLabAngle(undefined)
      setLabTab(undefined)
      setLabHighlight('probability')
      setLabDemoSin(undefined)
      setActiveLabAction(
        currentLevel === 1 ? 'comb-perm' : currentLevel === 2 ? 'comb-dice7' : 'comb-dirichlet',
      )
    } else if (currentTopic.id === 'number-theory-divisibility') {
      setLabAngle(undefined)
      setLabTab(undefined)
      setLabHighlight('number-theory')
      setLabDemoSin(undefined)
      setActiveLabAction(
        currentLevel === 1 ? 'num-cycle' : currentLevel === 2 ? 'num-group5' : 'num-factor-fermat',
      )
    } else {
      setLabAngle(undefined)
      setLabTab(undefined)
      setLabHighlight(null)
      setLabDemoSin(undefined)
      setActiveLabAction(null)
    }
  }, [currentTopic.id, currentLevel])

  // Update current topic when route params change
  useEffect(() => {
    if (params.topicId && ASMO_JOURNEY_TOPICS.some((t) => t.id === params.topicId)) {
      setCurrentTopicId(params.topicId)
      setCurrentLevel(1)
      setSelectedOption(null)
      setShowSolution(false)
      setActivePedagogicalStep(1)
    }
  }, [params.topicId])

  // Filter topics with group categorization
  const filteredTopics = useMemo(() => {
    let list = ASMO_JOURNEY_TOPICS.filter((t) => {
      if (selectedSubject && t.subject !== selectedSubject) return false
      if (selectedTier !== 'all' && t.gradeTier !== selectedTier) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchDesc = t.description.toLowerCase().includes(q)
        const matchCode = t.topicCode.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchCode) return false
      }
      if (selectedGroup !== 'all') {
        const groupDef = ASMO_TOPIC_GROUPS.find((g) => g.id === selectedGroup)
        if (groupDef?.topicIds && !groupDef.topicIds.includes(t.id)) return false
      }
      return true
    })

    // If trig-geometry group selected, prioritize trigonometry at the top
    if (selectedGroup === 'trig-geometry') {
      list = [...list].sort((a, b) => {
        if (a.id === 'trigonometry') return -1
        if (b.id === 'trigonometry') return 1
        return 0
      })
    }

    return list
  }, [selectedSubject, selectedTier, searchQuery, selectedGroup])

  const handleSelectTopic = (topic: AsmoJourneyTopic) => {
    setCurrentTopicId(topic.id)
    setCurrentLevel(1)
    setSelectedOption(null)
    setShowSolution(false)
    setActivePedagogicalStep(1)
    setSearchParams({ topic: topic.id })
  }

  const handleSelectTier = (tier: AsmoGradeTier | 'all') => {
    setSelectedTier(tier)
    // Auto-activate representative topic for tier
    if (tier === 'primary') {
      const primaryTopic = ASMO_JOURNEY_TOPICS.find((t) => t.id === 'elementary-arithmetic') || ASMO_JOURNEY_TOPICS[0]
      handleSelectTopic(primaryTopic)
    } else if (tier === 'secondary') {
      const secTopic = ASMO_JOURNEY_TOPICS.find((t) => t.id === 'number-theory-divisibility') || ASMO_JOURNEY_TOPICS[8]
      if (secTopic) handleSelectTopic(secTopic)
    } else if (tier === 'high') {
      const trigTopic = ASMO_JOURNEY_TOPICS.find((t) => t.id === 'trigonometry')
      if (trigTopic) handleSelectTopic(trigTopic)
    }
  }

  const handleSelectGroup = (groupId: AsmoTopicCategoryGroup) => {
    setSelectedGroup(groupId)
    if (groupId === 'primary-visual') {
      const elemTopic = ASMO_JOURNEY_TOPICS.find((t) => t.id === 'elementary-arithmetic')
      if (elemTopic) handleSelectTopic(elemTopic)
    } else if (groupId === 'secondary-stem') {
      const secTopic = ASMO_JOURNEY_TOPICS.find((t) => t.id === 'number-theory-divisibility')
      if (secTopic) handleSelectTopic(secTopic)
    } else if (groupId === 'high-olympic' || groupId === 'trig-geometry') {
      const trigTopic = ASMO_JOURNEY_TOPICS.find((t) => t.id === 'trigonometry')
      if (trigTopic) handleSelectTopic(trigTopic)
    }
  }

  const handleSelectLevel = (lvl: JourneyLevelId) => {
    setCurrentLevel(lvl)
    setSelectedOption(null)
    setShowSolution(false)
    setActivePedagogicalStep(1)
  }

  const handleSelectOption = (optId: string) => {
    setSelectedOption(optId)
    setShowSolution(true)
    if (optId === currentProblem.correctAnswer) {
      const key = `${currentTopic.id}-lvl${currentLevel}`
      if (!completedLevels[key]) {
        setCompletedLevels((prev) => ({ ...prev, [key]: true }))
        setUserScore((prev) => prev + currentProblem.points)
      }
    }
  }

  const isAnswered = selectedOption !== null
  const isCorrect = isAnswered && selectedOption === currentProblem.correctAnswer
  const isElementary = currentTopic.gradeTier === 'primary' || (currentTopic.targetGrades && currentTopic.targetGrades.some((g) => g <= 5))

  // Dynamic visual spec for 3D Viewer if applicable
  const templateConfig = currentTopic.threeTemplateKey ? ASMO_3D_TEMPLATES[currentTopic.threeTemplateKey] : null
  const dynamicSpec: AsmoVisualSpec | null = templateConfig
    ? {
        ...templateConfig.renderSpec,
        explanationStep: activePedagogicalStep - 1,
      }
    : null

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ── TOP NAV & BREADCRUMB ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/asmo"
          className="inline-flex items-center gap-1.5 rounded-2xl bg-white/90 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-white transition-all border border-slate-200"
        >
          <ChevronLeft className="size-4" />
          <span>Cổng Olympic ASMO</span>
        </Link>

        {/* Global Progress Mastery Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-black text-amber-800 shadow-2xs">
            <Trophy className="size-4 text-amber-600" />
            <span>Điểm Tích Lũy: {userScore} XP</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 text-xs font-bold text-indigo-700 shadow-2xs">
            <CheckCircle2 className="size-4 text-indigo-600" />
            <span>Hoàn thành: {Object.keys(completedLevels).length}/{ASMO_JOURNEY_TOPICS.length * 3} Cấp độ</span>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white shadow-clay sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold backdrop-blur-md">
            <Compass className="size-3.5 text-sun-300" />
            <span>Chặng Học Olympic 3D (ASMO 3D Learning Journey)</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Khám Phá Các Chuyên Đề Trọng Điểm ASMO Lớp 1 – 12 🚀
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-2xl">
            Lộ trình học tập 3 bước chuẩn sư phạm kết hợp mô phỏng phép tính nhẩm tiểu học, mô hình không gian 3D Three.js 360°, đồ thị hàm số KaTeX và trợ giảng AI Mèo Mee đồng hành từng bước giải!
          </p>

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <Link
              to="/asmo/curriculum"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-400 text-slate-950 px-3.5 py-1.5 text-xs font-black shadow-md hover:bg-amber-300 transition-all"
            >
              <Compass className="size-3.5 text-slate-950" />
              <span>🗺️ Lộ Trình Học Tuần Tự (LMS)</span>
            </Link>

            <Link
              to="/asmo"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 text-white hover:bg-white/30 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md transition-all border border-white/20"
            >
              <Trophy className="size-3.5 text-sun-300" />
              <span>⚡ Đấu Trường Thi Đấu (Exam Arena)</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-15 pointer-events-none">
          <Box className="size-80 text-white" />
        </div>
      </div>

      {/* ── FILTER & TOPIC SELECTOR TOOLBAR ── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-clay backdrop-blur-md space-y-4">
        {/* Subject and Tier Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Subject Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
              Môn Học:
            </span>
            {(Object.keys(ASMO_SUBJECTS) as AsmoSubject[]).map((subjKey) => {
              const subj = ASMO_SUBJECTS[subjKey]
              const isSelected = selectedSubject === subjKey
              return (
                <button
                  key={subjKey}
                  type="button"
                  onClick={() => setSelectedSubject(subjKey)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer',
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                  )}
                >
                  <span>{subj.icon}</span>
                  <span>{subj.name}</span>
                </button>
              )
            })}
          </div>

          {/* Tier Pills (3 Cấp Học: Tiểu Học, THCS, THPT) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
              Cấp Lớp:
            </span>
            <button
              type="button"
              onClick={() => handleSelectTier('all')}
              className={cn(
                'rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                selectedTier === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600',
              )}
            >
              Tất cả (Lớp 1-12)
            </button>
            {ASMO_GRADE_TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleSelectTier(tier.id)}
                className={cn(
                  'rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                  selectedTier === tier.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                )}
              >
                <span>{tier.emoji}</span>
                <span>{tier.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Group Filter Tabs (School Tier Groups & STEM Topics) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Filter className="size-3.5 text-indigo-600" />
              <span>Phân Nhóm Chuyên Đề Theo Khối Học &amp; Trọng Tâm:</span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {ASMO_TOPIC_GROUPS.map((group) => {
              const isGroupActive = selectedGroup === group.id
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleSelectGroup(group.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border',
                    isGroupActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-sm ring-2 ring-indigo-300'
                      : 'bg-slate-50 hover:bg-indigo-50/60 text-slate-700 border-slate-200/80',
                  )}
                >
                  <span className="text-sm">{group.icon}</span>
                  <span className="font-extrabold">{group.shortLabel}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.2 rounded-md font-mono', isGroupActive ? 'bg-white/20 text-indigo-100' : 'bg-slate-200/70 text-slate-600')}>
                    {group.grades}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Topics Horizontal Scrollable Grid */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-indigo-600" />
              <span>Danh Sách Chuyên Đề ({filteredTopics.length} chuyên đề)</span>
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {filteredTopics.map((topic) => {
              const isCurrent = topic.id === currentTopic.id
              const doneCount = [1, 2, 3].filter((lvl) => completedLevels[`${topic.id}-lvl${lvl}`]).length
              const tierBadge = topic.gradeTier === 'primary' ? '🎒 Cấp 1' : topic.gradeTier === 'secondary' ? '🏫 Cấp 2' : '🎓 Cấp 3'

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 rounded-2xl p-3 text-left transition-all active:scale-95 cursor-pointer border max-w-[270px]',
                    isCurrent
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-300'
                      : 'bg-white hover:bg-indigo-50/60 border-slate-200/80 text-slate-800 shadow-2xs',
                  )}
                >
                  <span className="text-2xl shrink-0">{topic.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('text-xs font-black truncate', isCurrent ? 'text-white' : 'text-slate-900')}>
                        {topic.shortTitle}
                      </span>
                      <span className={cn('text-[9px] font-extrabold px-1 rounded-md shrink-0', isCurrent ? 'bg-white/20 text-indigo-100' : 'bg-slate-100 text-slate-600')}>
                        {tierBadge}
                      </span>
                      {doneCount > 0 && (
                        <span className={cn('text-[10px] font-extrabold px-1 py-0.2 rounded-md shrink-0', isCurrent ? 'bg-white/20 text-sun-300' : 'bg-emerald-100 text-emerald-800')}>
                          {doneCount}/3 ★
                        </span>
                      )}
                    </div>
                    <p className={cn('text-[11px] truncate mt-0.5', isCurrent ? 'text-indigo-100' : 'text-slate-500')}>
                      {topic.subtitle}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── ACTIVE TOPIC HEADER INFO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentTopic.icon}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg font-extrabold text-slate-900">
                {currentTopic.title}
              </h2>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                {currentTopic.topicCode}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                Lớp {currentTopic.targetGrades.join(', ')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {currentTopic.description}
            </p>
          </div>
        </div>

        {/* Level 1, 2, 3 Selector Pills */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
          {([1, 2, 3] as JourneyLevelId[]).map((lvl) => {
            const isLvlActive = currentLevel === lvl
            const isDone = completedLevels[`${currentTopic.id}-lvl${lvl}`]
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleSelectLevel(lvl)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer',
                  isLvlActive
                    ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-indigo-300'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                <span>{lvl === 1 ? '🥉 L1' : lvl === 2 ? '🥈 L2' : '🥇 L3'}</span>
                <span>{lvl === 1 ? 'Khởi động' : lvl === 2 ? 'Nâng cao' : 'Olympic'}</span>
                {isDone && <CheckCircle2 className="size-3 text-emerald-600" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── MAIN WORKSPACE: 3D/MATH VIEWPORT ON LEFT, QUESTION & PEDAGOGY ON RIGHT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Viewport & 3-Step Pedagogical Explanation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Viewport Box */}
          {currentTopic.visualMode === 'three_3d' && dynamicSpec ? (
            <div className="rounded-3xl border border-slate-700/80 bg-slate-950 p-2 shadow-2xl">
              <AsmoThreeViewer
                key={`${currentTopic.id}-${currentLevel}-${activePedagogicalStep}`}
                spec={dynamicSpec}
                height={400}
                interactive
              />
            </div>
          ) : (
            <AsmoMathVisualizer
              key={`${currentTopic.id}-${currentLevel}`}
              topicId={currentTopic.id}
              level={currentLevel}
              externalAngle={labAngle}
              externalTab={labTab}
              highlightTarget={labHighlight}
              activeAction={activeLabAction}
              demoSinValue={labDemoSin}
              onAngleChange={(deg) => setLabAngle(deg)}
            />
          )}

          {/* 3-Step Pedagogical KaTeX Breakdown */}
          <div className="rounded-3xl border border-indigo-100 bg-white/95 p-5 shadow-clay space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {isElementary ? (
                  <span className="text-base">🎈</span>
                ) : (
                  <BookOpen className="size-4 text-indigo-600" />
                )}
                <h3 className="font-display text-sm font-extrabold text-indigo-950 uppercase tracking-wider">
                  {isElementary
                    ? '🎈 3 BƯỚC KHÁM PHÁ CÙNG MÈO MEE'
                    : 'Phân Tích Giải Bài 3 Bước Sư Phạm Chuẩn ASMO'}
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-700">
                {currentLevelData.difficultyLabel}
              </span>
            </div>

            {/* 3 Step Tabs Navigation */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActivePedagogicalStep(1)}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-2xl py-2.5 px-2 text-xs font-bold transition-all cursor-pointer border',
                  activePedagogicalStep === 1
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700',
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px]">
                  1
                </span>
                <span className="truncate">
                  {isElementary ? '🔍 1. Đề bài cho gì nhỉ?' : '1. Phân tích'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActivePedagogicalStep(2)}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-2xl py-2.5 px-2 text-xs font-bold transition-all cursor-pointer border',
                  activePedagogicalStep === 2
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700',
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px]">
                  2
                </span>
                <span className="truncate">
                  {isElementary ? '💡 2. Mẹo của Mèo Mee' : '2. Phương pháp'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActivePedagogicalStep(3)}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-2xl py-2.5 px-2 text-xs font-bold transition-all cursor-pointer border',
                  activePedagogicalStep === 3
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700',
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px]">
                  3
                </span>
                <span className="truncate">
                  {isElementary ? '🎉 3. Cùng tính nào!' : '3. Tính toán'}
                </span>
              </button>
            </div>

            {/* Step Content Preview */}
            <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 space-y-2">
              {activePedagogicalStep === 1 && (
                <div>
                  <h4 className="text-xs font-extrabold text-indigo-900 mb-1">
                    {currentLevelData.analysisStep.title}
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    <AsmoFormula text={currentLevelData.analysisStep.description} />
                  </div>
                </div>
              )}

              {activePedagogicalStep === 2 && (
                <div>
                  <h4 className="text-xs font-extrabold text-indigo-900 mb-1">
                    {currentLevelData.methodStep.title}
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    <AsmoFormula text={currentLevelData.methodStep.description} />
                  </div>
                </div>
              )}

              {activePedagogicalStep === 3 && (
                <div>
                  <h4 className="text-xs font-extrabold text-indigo-900 mb-1">
                    {currentLevelData.calcStep.title}
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    <AsmoFormula text={currentLevelData.calcStep.description} />
                  </div>
                </div>
              )}
            </div>

            {/* Mèo Mee Pedagogical Advice */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
              <Lightbulb className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-black text-amber-950 block mb-0.5">Lời Khuyên Của Mèo Mee:</span>
                <p className="italic text-amber-800">{currentLevelData.meeAdvice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question Card & Practice Solver (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 sm:p-6 shadow-clay backdrop-blur-md space-y-4">
            {/* Header / Badges */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-extrabold text-indigo-700">
                {currentLevelData.levelBadge}
              </span>
              <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-800">
                <Award className="size-3.5 text-amber-600" />
                +{currentProblem.points} Điểm
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                <AsmoFormula text={currentProblem.title} />
              </h3>
              <div className="text-sm text-slate-700 leading-relaxed font-medium">
                <AsmoFormula text={currentProblem.text} />
              </div>
            </div>

            {/* 🔍 Interactive Lab Solver Helper (Phòng Thí Nghiệm Trực Tuyến Hỗ Trợ Giải Nhanh) */}
            {/* 1. LƯỢNG GIÁC */}
            {currentTopic.id === 'trigonometry' && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-rose-50/60 p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                      🔍
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Dùng Phòng Thí Nghiệm Giải Nhanh Bài Này
                      </h4>
                      <p className="text-[11px] text-indigo-700 font-semibold">
                        Bấm nút bên dưới để kim quay và bảng công thức bên trái tự động sáng đèn!
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                    <Sparkles className="size-3 text-amber-500" />
                    Lab Helper
                  </span>
                </div>

                {/* Level 1: Special Angles & Quadrant Signs */}
                {currentLevel === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLabAngle(150)
                          setLabTab('circle')
                          setLabHighlight('sin')
                          setActiveLabAction('sin150')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'sin150'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-300 scale-[1.02]'
                            : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔴</span>
                          <span>Soi sin(150°)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'sin150' ? 'text-rose-100' : 'text-rose-600')}>
                          = 1/2 = +0.500
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLabAngle(120)
                          setLabTab('circle')
                          setLabHighlight('cos')
                          setActiveLabAction('cos120')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'cos120'
                            ? 'bg-sky-500 text-white border-sky-600 shadow-md ring-2 ring-sky-300 scale-[1.02]'
                            : 'bg-white hover:bg-sky-50 text-sky-800 border-sky-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔵</span>
                          <span>Soi cos(120°)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'cos120' ? 'text-sky-100' : 'text-sky-600')}>
                          = -1/2 (Góc II &lt; 0)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLabAngle(135)
                          setLabTab('circle')
                          setLabHighlight('tan')
                          setActiveLabAction('tan135')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'tan135'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300 scale-[1.02]'
                            : 'bg-white hover:bg-purple-50 text-purple-800 border-purple-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🟣</span>
                          <span>Soi tan(135°)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'tan135' ? 'text-purple-100' : 'text-purple-600')}>
                          = -1 (sin/cos)
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Ghép kết quả trực quan từ phòng thí nghiệm:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$P = \frac{1}{2} + \left(-\frac{1}{2}\right) - (-1) = 1 \quad \text{và} \quad \cos(150^\circ) < 0 \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2: Double Angle Formula */}
                {currentLevel === 2 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLabTab('formula')
                          setLabHighlight('double')
                          setLabDemoSin(1 / 3)
                          setActiveLabAction('double-sin-third')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'double-sin-third'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>📐</span>
                          <span>Bật Công Thức Nhân Đôi &amp; Thử sin(x) = 1/3</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'double-sin-third' ? 'text-indigo-100' : 'text-indigo-700')}>
                          cos(2x) = 1 - 2sin²(x) = 7/9 ≈ 0.778
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLabAngle(19.47)
                          setLabTab('circle')
                          setLabHighlight('sin')
                          setActiveLabAction('circle-sin-third')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'circle-sin-third'
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-300 scale-[1.02]'
                            : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🎯</span>
                          <span>Soi Góc x ≈ 19.5° Trên Đường Tròn</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'circle-sin-third' ? 'text-slate-950' : 'text-amber-700')}>
                          sin(19.47°) ≈ 0.333 = 1/3
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$\cos(2x) = 1 - 2\cdot\left(\frac{1}{3}\right)^2 = 1 - \frac{2}{9} = \frac{7}{9} \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 3: Olympic Equation */}
                {currentLevel === 3 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLabAngle(7.5)
                          setLabTab('circle')
                          setLabHighlight('tan')
                          setActiveLabAction('olympic-7.5')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'olympic-7.5'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🌊</span>
                          <span>Soi Nghiệm x = π/24 (7.5°)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'olympic-7.5' ? 'text-indigo-100' : 'text-indigo-700')}>
                          x = 7.5° ∈ (0, π/4)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLabAngle(30)
                          setLabTab('circle')
                          setLabHighlight('sin')
                          setActiveLabAction('olympic-30')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'olympic-30'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-300 scale-[1.02]'
                            : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔴</span>
                          <span>Soi Góc 4x = π/6 (30°)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'olympic-30' ? 'text-rose-100' : 'text-rose-600')}>
                          sin(4x) = sin(30°) = 1/2
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Biến đổi Olympic then chốt:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$\tan(x) + \cot(x) = \frac{2}{\sin(2x)} = 8\cos(2x) \Rightarrow \sin(4x) = \frac{1}{2} \Rightarrow x = \frac{\pi}{24} \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. ĐẠI SỐ VIÈTE */}
            {currentTopic.id === 'algebra-viete' && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-emerald-50/60 p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                      🔍
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Dùng Mô Hình Trực Quan Giải Nhanh Bài Này
                      </h4>
                      <p className="text-[11px] text-indigo-700 font-semibold">
                        Bấm nút bên dưới để mô hình đồ thị Parabol và hệ thức Viète bên trái tự động giải mã!
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                    <Sparkles className="size-3 text-amber-500" />
                    Viète Helper
                  </span>
                </div>

                {/* Level 1: Identities & Diff of Squares */}
                {currentLevel === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('viete-diff-square')
                          setLabHighlight('viete')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'viete-diff-square'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🧮</span>
                          <span>Soi Hằng Đẳng Thức (x+3)² - (x-3)²</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'viete-diff-square' ? 'text-indigo-100' : 'text-indigo-700')}>
                          a² - b² = (a-b)(a+b)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('viete-expand')
                          setLabHighlight('viete')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'viete-expand'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>⚡</span>
                          <span>Khai Triển: 6x - (-6x) = 12x</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'viete-expand' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = 6 × 2x = 12x
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$P = [(x+3) - (x-3)][(x+3) + (x-3)] = (6)(2x) = 12x \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2: Viete S=5, P=3 */}
                {currentLevel === 2 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('viete-sp')
                          setLabHighlight('viete')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'viete-sp'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔍</span>
                          <span>Soi Định lý Viète S=5, P=3</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'viete-sp' ? 'text-indigo-100' : 'text-indigo-700')}>
                          S = -(-5)/1 = 5, P = 3/1 = 3
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('viete-sq-sum')
                          setLabHighlight('viete')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'viete-sq-sum'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🎯</span>
                          <span>Tính x₁² + x₂² = S² - 2P = 19</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'viete-sq-sum' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = 5² - 2(3) = 25 - 6 = 19
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$A = x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = 5^2 - 2(3) = 19 \Rightarrow \text{Chọn A}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 3: Higher Order Symmetric (S^2 - 2P)/P */}
                {currentLevel === 3 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('viete-frac')
                          setLabHighlight('viete')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'viete-frac'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🏆</span>
                          <span>Soi Phân Thức: (S² - 2P)/P</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'viete-frac' ? 'text-indigo-100' : 'text-indigo-700')}>
                          S = 3, P = 1/2
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('viete-frac-calc')
                          setLabHighlight('viete')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'viete-frac-calc'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>⚡</span>
                          <span>Tính M = (3² - 1)/0.5 = 16</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'viete-frac-calc' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = 8 / 0.5 = 16
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$M = \frac{x_1^2 + x_2^2}{x_1 x_2} = \frac{3^2 - 2(0.5)}{0.5} = \frac{8}{0.5} = 16 \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. PYTHAGORAS & GEOMETRY */}
            {currentTopic.id === 'pythagoras-geometry' && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-emerald-50/60 p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                      🔍
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Dùng Mô Hình Trực Quan Giải Nhanh Bài Này
                      </h4>
                      <p className="text-[11px] text-indigo-700 font-semibold">
                        Bấm nút bên dưới để mô hình hình học và hệ thức lượng bên trái tự động sáng đèn!
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                    <Sparkles className="size-3 text-amber-500" />
                    Pythagoras Helper
                  </span>
                </div>

                {/* Level 1: Right Triangle c = 10 cm */}
                {currentLevel === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('pyth-c10')
                          setLabHighlight('pythagoras')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'pyth-c10'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>📐</span>
                          <span>Tính Cạnh Huyền c = 10 cm (a=6, b=8)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'pyth-c10' ? 'text-indigo-100' : 'text-indigo-700')}>
                          c² = 6² + 8² = 36 + 64 = 100
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('pyth-triplet')
                          setLabHighlight('pythagoras')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'pyth-triplet'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔄</span>
                          <span>Nhận Diện Bộ Ba (3,4,5) × 2</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'pyth-triplet' ? 'text-emerald-100' : 'text-emerald-700')}>
                          6 - 8 - 10 (cm)
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$c = \sqrt{a^2 + b^2} = \sqrt{6^2 + 8^2} = \sqrt{100} = 10\text{ cm} \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2: Oxy Distance AB = 5 */}
                {currentLevel === 2 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('pyth-oxy')
                          setLabHighlight('pythagoras')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'pyth-oxy'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>📍</span>
                          <span>Soi Khoảng Cách A(1,2) ➔ B(4,6)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'pyth-oxy' ? 'text-indigo-100' : 'text-indigo-700')}>
                          Δx = 3, Δy = 4
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('pyth-dist')
                          setLabHighlight('pythagoras')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'pyth-dist'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>📏</span>
                          <span>Tính d = √(3² + 4²) = 5</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'pyth-dist' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = √25 = 5 đơn vị
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$AB = \sqrt{(4-1)^2 + (6-2)^2} = \sqrt{3^2 + 4^2} = \sqrt{25} = 5 \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 3: Altitude h = 7.2 cm */}
                {currentLevel === 3 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('pyth-c15')
                          setLabHighlight('pythagoras')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'pyth-c15'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>📏</span>
                          <span>Tính Cạnh Huyền c = 15 cm (a=9, b=12)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'pyth-c15' ? 'text-indigo-100' : 'text-indigo-700')}>
                          c = √(9² + 12²) = 15
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('pyth-alt')
                          setLabHighlight('pythagoras')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'pyth-alt'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>⚡</span>
                          <span>Đường Cao h = ab/c = 7.2 cm</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'pyth-alt' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = (9 × 12) / 15 = 7.2 cm
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$h = \frac{a \cdot b}{c} = \frac{9 \times 12}{15} = \frac{108}{15} = 7.2\text{ cm} \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. ALGEBRAIC IDENTITIES & POLYNOMIALS */}
            {currentTopic.id === 'algebra-polynomials' && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-emerald-50/60 p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                      🔍
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Dùng Mô Hình Trực Quan Giải Nhanh Bài Này
                      </h4>
                      <p className="text-[11px] text-indigo-700 font-semibold">
                        Bấm nút bên dưới để mô hình gạch diện tích và phân tích đa thức tự động sáng đèn!
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                    <Sparkles className="size-3 text-amber-500" />
                    Polynomial Helper
                  </span>
                </div>

                {/* Level 1: (2x+1)^2 - (2x-1)^2 = 8x */}
                {currentLevel === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('poly-diff-sq')
                          setLabHighlight('polynomials')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'poly-diff-sq'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🧮</span>
                          <span>Khai Triển Hiệu Hai Bình Phương P = 8x</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'poly-diff-sq' ? 'text-indigo-100' : 'text-indigo-700')}>
                          a² - b² = (a-b)(a+b)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('poly-tile')
                          setLabHighlight('polynomials')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'poly-tile'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🧱</span>
                          <span>Soi Mô Hình Diện Tích (a+b)²</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'poly-tile' ? 'text-emerald-100' : 'text-emerald-700')}>
                          a² + 2ab + b²
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$P = [(2x+1) - (2x-1)][(2x+1) + (2x-1)] = 2 \times 4x = 8x \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2: x^2 - 7x + 12 = (x-3)(x-4) */}
                {currentLevel === 2 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('poly-factor')
                          setLabHighlight('polynomials')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'poly-factor'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔍</span>
                          <span>Tách Hạng Tử: (x - 3)(x - 4) = 0</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'poly-factor' ? 'text-indigo-100' : 'text-indigo-700')}>
                          Tổng = -7, Tích = 12
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('poly-roots')
                          setLabHighlight('polynomials')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'poly-roots'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>➕</span>
                          <span>Tổng Hai Nghiệm = 3 + 4 = 7</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'poly-roots' ? 'text-emerald-100' : 'text-emerald-700')}>
                          x₁ = 3, x₂ = 4
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$P(x) = (x-3)(x-4) = 0 \Rightarrow x_1 = 3, x_2 = 4 \Rightarrow x_1 + x_2 = 7 \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 3: A = x^2 - 6x + 14 = (x-3)^2 + 5 >= 5 */}
                {currentLevel === 3 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('poly-sq-complete')
                          setLabHighlight('polynomials')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'poly-sq-complete'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🎯</span>
                          <span>Hoàn Thành Bình Phương: (x - 3)² + 5</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'poly-sq-complete' ? 'text-indigo-100' : 'text-indigo-700')}>
                          x² - 6x + 9 + 5
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('poly-min')
                          setLabHighlight('polynomials')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'poly-min'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🏆</span>
                          <span>Đánh Giá GTNN: A_min = 5</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'poly-min' ? 'text-emerald-100' : 'text-emerald-700')}>
                          (x-3)² ≥ 0 ⇒ A ≥ 5
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$A = (x - 3)^2 + 5 \ge 5 \Rightarrow A_{\min} = 5 \quad (\text{tại } x = 3) \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. SPATIAL GEOMETRY & POLYHEDRON */}
            {currentTopic.id === 'spatial-polyhedron' && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-emerald-50/60 p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                      🔍
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Dùng Mô Hình Trực Quan Giải Nhanh Bài Này
                      </h4>
                      <p className="text-[11px] text-indigo-700 font-semibold">
                        Bấm nút bên dưới để mô hình hình học 3D và định lý Euler tự động sáng đèn!
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                    <Sparkles className="size-3 text-amber-500" />
                    Spatial Helper
                  </span>
                </div>

                {/* Level 1: (x+2)^5 -> C_5^2 * 2^2 = 40 */}
                {currentLevel === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('polyh-newton')
                          setLabHighlight('polyhedron')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'polyh-newton'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>📐</span>
                          <span>Soi Khai Triển (x + 2)⁵</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'polyh-newton' ? 'text-indigo-100' : 'text-indigo-700')}>
                          T = C₅ᵏ x⁵⁻ᵏ 2ᵏ
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('polyh-coeff')
                          setLabHighlight('polyhedron')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'polyh-coeff'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🎯</span>
                          <span>Hệ Số x³: C₅² × 2² = 40</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'polyh-coeff' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = 10 × 4 = 40
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$a_3 = C_5^2 \cdot 2^2 = 10 \times 4 = 40 \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2: Pyramid Volume V = 48 cm^3 */}
                {currentLevel === 2 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('polyh-pyr-vol')
                          setLabHighlight('polyhedron')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'polyh-pyr-vol'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🧊</span>
                          <span>Tính Thể Tích Khối Chóp V = ⅓ B·h</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'polyh-pyr-vol' ? 'text-indigo-100' : 'text-indigo-700')}>
                          B = 6² = 36 cm², h = 4 cm
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('polyh-pyr-calc')
                          setLabHighlight('polyhedron')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'polyh-pyr-calc'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>⚡</span>
                          <span>V = ⅓ × 36 × 4 = 48 cm³</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'polyh-pyr-calc' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = 12 × 4 = 48 cm³
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$V = \frac{1}{3} \cdot 6^2 \cdot 4 = \frac{1}{3} \times 36 \times 4 = 48\text{ cm}^3 \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 3: Euler Formula E = 30 */}
                {currentLevel === 3 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('polyh-euler')
                          setLabHighlight('polyhedron')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'polyh-euler'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🌐</span>
                          <span>Soi Định Lý Euler: V - E + F = 2</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'polyh-euler' ? 'text-indigo-100' : 'text-indigo-700')}>
                          V = 12, F = 20
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('polyh-euler-calc')
                          setLabHighlight('polyhedron')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'polyh-euler-calc'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🏆</span>
                          <span>Tính Số Cạnh E = 12 + 20 - 2 = 30</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'polyh-euler-calc' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = 32 - 2 = 30 cạnh
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$E = V + F - 2 = 12 + 20 - 2 = 30\text{ cạnh} \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. EXPONENT & LOGARITHM */}
            {currentTopic.id === 'exp-logarithm' && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-emerald-50/60 p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                      🔍
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Dùng Mô Hình Trực Quan Giải Nhanh Bài Này
                      </h4>
                      <p className="text-[11px] text-indigo-700 font-semibold">
                        Bấm nút bên dưới để đồ thị hàm số mũ và logarit đối xứng bên trái tự động giải mã!
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                    <Sparkles className="size-3 text-amber-500" />
                    Log Helper
                  </span>
                </div>

                {/* Level 1: log_2(32) + log_3(81) = 9 */}
                {currentLevel === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('log-graph')
                          setLabHighlight('logarithm')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'log-graph'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>📈</span>
                          <span>Soi Đồ Thị Đối Xứng y = 2ˣ &amp; y = log₂x</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'log-graph' ? 'text-indigo-100' : 'text-indigo-700')}>
                          Đối xứng qua trục y = x
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('log-calc')
                          setLabHighlight('logarithm')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'log-calc'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>⚡</span>
                          <span>Tính K = log₂(32) + log₃(81) = 9</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'log-calc' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = 5 + 4 = 9
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$K = \log_2(2^5) + \log_3(3^4) = 5 + 4 = 9 \Rightarrow \text{Chọn C}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2: 4^x - 6*2^x + 8 = 0 -> S = {1, 2} */}
                {currentLevel === 2 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('log-sub-t')
                          setLabHighlight('logarithm')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'log-sub-t'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🎯</span>
                          <span>Đặt Ẩn Phụ t = 2ˣ &gt; 0: t² - 6t + 8 = 0</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'log-sub-t' ? 'text-indigo-100' : 'text-indigo-700')}>
                          (t - 2)(t - 4) = 0
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('log-roots')
                          setLabHighlight('logarithm')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'log-roots'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔑</span>
                          <span>Nghiệm: 2ˣ = 2 ➔ x=1, 2ˣ = 4 ➔ x=2</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'log-roots' ? 'text-emerald-100' : 'text-emerald-700')}>
                          Tập nghiệm S = {'{1, 2}'}
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$t \in \{2, 4\} \Rightarrow 2^x = 2 \text{ hoặc } 2^x = 4 \Rightarrow x \in \{1, 2\} \Rightarrow \text{Chọn A}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 3: log_2[(x-1)(x+2)] = 2 -> x = 2 */}
                {currentLevel === 3 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('log-merge')
                          setLabHighlight('logarithm')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'log-merge'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔍</span>
                          <span>Gộp Logarit Tích: log₂[(x-1)(x+2)] = 2</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'log-merge' ? 'text-indigo-100' : 'text-indigo-700')}>
                          x² + x - 2 = 4 ⇔ x² + x - 6 = 0
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('log-domain')
                          setLabHighlight('logarithm')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'log-domain'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>⚠️</span>
                          <span>Đối Chiếu ĐKXĐ x &gt; 1 ➔ Nhận x = 2</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'log-domain' ? 'text-emerald-100' : 'text-emerald-700')}>
                          x = 2 (nhận), x = -3 (loại)
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$(x-1)(x+2) = 4 \Rightarrow x^2 + x - 6 = 0 \Rightarrow x = 2 \text{ (vì } x > 1) \Rightarrow \text{Chọn A}$" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. COMBINATORICS & PROBABILITY */}
            {currentTopic.id === 'combinatorics-probability' && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-emerald-50/60 p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                      🔍
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Dùng Mô Hình Trực Quan Giải Nhanh Bài Này
                      </h4>
                      <p className="text-[11px] text-indigo-700 font-semibold">
                        Bấm nút bên dưới để ma trận 36 ô xúc xắc và chỉnh hợp bên trái tự động sáng đèn!
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                    <Sparkles className="size-3 text-amber-500" />
                    Prob Helper
                  </span>
                </div>

                {/* Level 1: A_10^2 = 90 */}
                {currentLevel === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('comb-perm')
                          setLabHighlight('probability')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'comb-perm'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>👥</span>
                          <span>Chọn Ban Cán Sự: Chỉnh Hợp A₁₀² = 90</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'comb-perm' ? 'text-indigo-100' : 'text-indigo-700')}>
                          10 × 9 = 90 cách
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('comb-compare')
                          setLabHighlight('probability')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'comb-compare'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>⚖️</span>
                          <span>So Sánh Với Tổ Hợp C₁₀² = 45</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'comb-compare' ? 'text-emerald-100' : 'text-emerald-700')}>
                          Phân biệt chức vụ ➔ Dùng A
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$A_{10}^2 = \frac{10!}{(10-2)!} = 10 \times 9 = 90\text{ cách chọn} \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2: Dice Sum = 7 -> P = 6/36 = 1/6 */}
                {currentLevel === 2 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('comb-dice7')
                          setLabHighlight('probability')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'comb-dice7'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🎲</span>
                          <span>Soi Ma Trận 36 Ô Xúc Xắc Tổng = 7</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'comb-dice7' ? 'text-indigo-100' : 'text-indigo-700')}>
                          6 cặp: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('comb-prob7')
                          setLabHighlight('probability')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'comb-prob7'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🎯</span>
                          <span>Xác Suất P = 6/36 = 1/6 ≈ 16.67%</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'comb-prob7' ? 'text-emerald-100' : 'text-emerald-700')}>
                          P = n(A) / n(Ω)
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$P(A) = \frac{n(A)}{n(\Omega)} = \frac{6}{36} = \frac{1}{6} \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 3: Dirichlet N = 3*(4-1) + 1 = 10 */}
                {currentLevel === 3 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('comb-dirichlet')
                          setLabHighlight('probability')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'comb-dirichlet'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🗃️</span>
                          <span>Bốc Bi Dirichlet: Trường Hợp Xấu Nhất</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'comb-dirichlet' ? 'text-indigo-100' : 'text-indigo-700')}>
                          3 đỏ + 3 xanh + 3 vàng = 9 viên
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('comb-dirichlet-calc')
                          setLabHighlight('probability')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'comb-dirichlet-calc'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🏆</span>
                          <span>Công Thức: N = 3(4 - 1) + 1 = 10</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'comb-dirichlet-calc' ? 'text-emerald-100' : 'text-emerald-700')}>
                          = 9 + 1 = 10 viên
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$N_{\min} = 3 \times (4 - 1) + 1 = 9 + 1 = 10\text{ viên bi} \Rightarrow \text{Chọn B}$" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. NUMBER THEORY & DIVISIBILITY */}
            {currentTopic.id === 'number-theory-divisibility' && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-emerald-50/60 p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                      🔍
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        Dùng Mô Hình Trực Quan Giải Nhanh Bài Này
                      </h4>
                      <p className="text-[11px] text-indigo-700 font-semibold">
                        Bấm nút bên dưới để vòng tròn chu kỳ luỹ thừa và đồng dư thức bên trái tự động giải mã!
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                    <Sparkles className="size-3 text-amber-500" />
                    Number Helper
                  </span>
                </div>

                {/* Level 1: 2^2024 mod 10 = 6 */}
                {currentLevel === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('num-cycle')
                          setLabHighlight('number-theory')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'num-cycle'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔄</span>
                          <span>Soi Chu Kỳ 2ⁿ: (2 ➔ 4 ➔ 8 ➔ 6)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'num-cycle' ? 'text-indigo-100' : 'text-indigo-700')}>
                          Độ dài chu kỳ T = 4
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('num-ending6')
                          setLabHighlight('number-theory')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'num-ending6'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>⚡</span>
                          <span>2024 ⋮ 4 ➔ Tận Cùng Là 6</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'num-ending6' ? 'text-emerald-100' : 'text-emerald-700')}>
                          2024 = 4 × 506 + 0
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$2^{2024} \equiv 2^4 \equiv 6 \pmod{10} \Rightarrow \text{Chọn C}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2: S = 3^1 + ... + 3^2024 mod 5 = 0 */}
                {currentLevel === 2 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('num-group5')
                          setLabHighlight('number-theory')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'num-group5'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>📦</span>
                          <span>Nhóm 4 Số Hạng: 3¹+3²+3³+3⁴ = 120 ⋮ 5</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'num-group5' ? 'text-indigo-100' : 'text-indigo-700')}>
                          3 + 9 + 27 + 81 = 120
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('num-rem0')
                          setLabHighlight('number-theory')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'num-rem0'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🎯</span>
                          <span>2024 Chia Hết Cho 4 ➔ Số Dư Bằng 0</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'num-rem0' ? 'text-emerald-100' : 'text-emerald-700')}>
                          506 nhóm tròn ⋮ 5
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$S = 120 \times (1 + 3^4 + \dots + 3^{2020}) \equiv 0 \pmod 5 \Rightarrow \text{Chọn A}$" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 3: n^5 - n mod 30 = 0 */}
                {currentLevel === 3 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('num-factor-fermat')
                          setLabHighlight('number-theory')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'num-factor-fermat'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 scale-[1.02]'
                            : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🔬</span>
                          <span>Phân Tích: (n-1)n(n+1)(n²+1)</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'num-factor-fermat' ? 'text-indigo-100' : 'text-indigo-700')}>
                          Tích 3 số nguyên liên tiếp ⋮ 6
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLabAction('num-fermat30')
                          setLabHighlight('number-theory')
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none',
                          activeLabAction === 'num-fermat30'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs',
                        )}
                      >
                        <div className="flex items-center gap-1 text-xs font-black">
                          <span>🏆</span>
                          <span>Định Lý Fermat: n⁵ - n ⋮ 5 ➔ ⋮ 30</span>
                        </div>
                        <span className={cn('text-[11px] font-mono font-bold mt-0.5', activeLabAction === 'num-fermat30' ? 'text-emerald-100' : 'text-emerald-700')}>
                          ƯCLN(6, 5) = 1 ➔ Chia hết cho 30
                        </span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-white/95 border border-slate-200 p-2.5 text-center shadow-2xs">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kết quả giải tức thì từ mô hình:
                      </div>
                      <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                        <AsmoFormula text="$n^5 - n \vdots 6 \text{ và } n^5 - n \vdots 5 \Rightarrow n^5 - n \vdots 30 \Rightarrow \text{Chọn C}$" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {currentProblem.options?.map((opt) => {
                const isSelected = selectedOption === opt.id
                const isCorrectOpt = opt.id === currentProblem.correctAnswer

                let optStyle = 'border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-800'
                if (showSolution && isAnswered) {
                  if (isCorrectOpt) {
                    optStyle = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-300'
                  } else if (isSelected && !isCorrectOpt) {
                    optStyle = 'border-rose-300 bg-rose-50 text-rose-950 font-bold'
                  }
                } else if (isSelected) {
                  optStyle = 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-300'
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={cn(
                      'group flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.99] cursor-pointer',
                      optStyle,
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-xl font-black text-xs transition-colors',
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 group-hover:border-indigo-400',
                        )}
                      >
                        {opt.label || opt.id}
                      </span>
                      <div className="text-xs sm:text-sm font-medium leading-snug">
                        <AsmoFormula text={opt.text} />
                      </div>
                    </div>

                    {showSolution && isAnswered && (
                      <div className="shrink-0">
                        {isCorrectOpt ? (
                          <CheckCircle2 className="size-5 text-emerald-600 animate-in zoom-in-50" />
                        ) : isSelected ? (
                          <XCircle className="size-5 text-rose-500 animate-in zoom-in-50" />
                        ) : null}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Mèo Mee Live Feedback Coach & Secret Tips */}
            <AsmoMeeTutor
              pose={!isAnswered ? 'guide' : isCorrect ? 'celebrate' : 'support'}
              speech={
                !isAnswered
                  ? 'Con hãy quan sát kỹ mô hình và các bước giải sư phạm trước khi chọn đáp án nhé!'
                  : isCorrect
                  ? 'Tuyệt vời lắm! Con đã chọn đáp án hoàn toàn chính xác! 🌟'
                  : 'Chưa chính xác rồi! Con hãy xem lại bước 2 và bước 3 trong phần phân tích để nắm rõ nhé!'
              }
              hint={currentProblem.meeHint}
              secretTip={currentLevelData.meeAdvice}
              compact
            />

            {/* Detailed Explanation Reveal */}
            {showSolution && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 text-xs uppercase tracking-wider">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Lời Giải Chi Tiết</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700">
                    Đáp án đúng: {currentProblem.correctAnswer}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                  <AsmoFormula text={currentProblem.explanation} />
                </div>
              </div>
            )}

            {/* Level Navigation Footer */}
            {isAnswered && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedOption(null)
                    setShowSolution(false)
                  }}
                  className="gap-1.5 text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Làm lại</span>
                </Button>

                {currentLevel < 3 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleSelectLevel((currentLevel + 1) as JourneyLevelId)}
                    className="gap-1.5 text-xs font-bold py-1.5 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <span>Lên Level {currentLevel + 1}</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      const currentIdx = ASMO_JOURNEY_TOPICS.findIndex((t) => t.id === currentTopic.id)
                      const nextTopic = ASMO_JOURNEY_TOPICS[(currentIdx + 1) % ASMO_JOURNEY_TOPICS.length]
                      handleSelectTopic(nextTopic)
                    }}
                    className="gap-1.5 text-xs font-bold py-1.5 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <span>Chuyên đề tiếp theo</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
