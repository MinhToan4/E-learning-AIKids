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
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  Filter,
  Layers,
  ArrowDown,
} from 'lucide-react'
import { ASMO_JOURNEY_TOPICS, type AsmoJourneyTopic, type JourneyLevelId } from '../data/asmo-journey-topics'
import { ASMO_SUBJECTS, ASMO_GRADE_TIERS, type AsmoGradeTier } from '../data/asmo-curriculum'
import { ASMO_3D_TEMPLATES } from '../data/asmo-3d-templates'
import type { AsmoSubject, AsmoVisualSpec } from '../types'
import { AsmoThreeViewer } from '../components/AsmoThreeViewer'
import { AsmoMathVisualizer } from '../components/AsmoMathVisualizer'
import { AsmoFormula } from '../components/AsmoFormula'
import { FlatClayIcon } from '../components/AsmoFlatClayIcons'
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

  // Find active topic
  const currentTopic = useMemo(() => {
    return ASMO_JOURNEY_TOPICS.find((t) => t.id === currentTopicId) || ASMO_JOURNEY_TOPICS[0]
  }, [currentTopicId])

  // Current level problem data
  const currentLevelData = currentTopic.levels[currentLevel]
  const currentProblem = currentLevelData.problem

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
  const dynamicSpec: AsmoVisualSpec | null = useMemo(() => {
    if (currentTopic.visualMode !== 'three_3d') return null
    const baseSpec =
      currentLevelData.dynamicVisualSpec ||
      currentProblem.renderSpec ||
      (templateConfig ? templateConfig.renderSpec : null)
    if (!baseSpec) return null
    return {
      ...baseSpec,
      explanationStep: activePedagogicalStep - 1,
    }
  }, [currentTopic, currentLevelData, currentProblem, templateConfig, activePedagogicalStep])

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
                  <FlatClayIcon name={subj.icon} size={16} />
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

        {/* Category Group Filter Tabs */}
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
                  <FlatClayIcon name={group.icon} size={16} />
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
                  <FlatClayIcon name={topic.icon} size={28} className="shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('text-xs font-black truncate', isCurrent ? 'text-white' : 'text-slate-900')}>
                        <AsmoFormula text={topic.shortTitle} className="truncate inline" />
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
                    <div className={cn('text-[11px] truncate mt-0.5', isCurrent ? 'text-indigo-100' : 'text-slate-500')}>
                      <AsmoFormula text={topic.subtitle} className="truncate inline" />
                    </div>
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
          <FlatClayIcon name={currentTopic.icon} size={36} className="shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg font-extrabold text-slate-900">
                <AsmoFormula text={currentTopic.title} className="inline" />
              </h2>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                {currentTopic.topicCode}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                Lớp {currentTopic.targetGrades.join(', ')}
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              <AsmoFormula text={currentTopic.description} className="inline" />
            </div>
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

      {/* ── MAIN WORKSPACE: UNIFIED VISUAL CANVAS (LEFT) & QUESTION/MEE TUTOR (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* CỘT TRÁI: KHÔNG GIAN TRỰC QUAN HÓA & TIẾN TRÌNH BƯỚC GIẢI LIỀN MẠCH (7 cols) */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* TẦNG 1 (Phía trên): Biểu đồ SVG / 3D to full cột */}
          <div className="w-full">
            {currentTopic.visualMode === 'three_3d' && dynamicSpec ? (
              <div className="rounded-3xl border-2 border-brand-100 bg-white p-2 shadow-clay">
                <AsmoThreeViewer
                  key={`${currentTopic.id}-${currentLevel}-${activePedagogicalStep}`}
                  spec={dynamicSpec}
                  height={400}
                  interactive
                  onStepChange={(stepIdx) => {
                    if (stepIdx >= 0 && stepIdx < 3) {
                      setActivePedagogicalStep((stepIdx + 1) as 1 | 2 | 3)
                    }
                  }}
                />
              </div>
            ) : (
              <AsmoMathVisualizer
                key={`${currentTopic.id}-${currentLevel}`}
                topicId={currentTopic.id}
                level={currentLevel}
                activeStep={activePedagogicalStep}
                onStepChange={(step) => setActivePedagogicalStep(step)}
              />
            )}
          </div>

          {/* TẦNG 2 (Phía dưới): TIẾN TRÌNH CÁC BƯỚC PHÂN TÍCH RA ĐÁP ÁN (Step-by-Step Visual Walkthrough Cards) */}
          <div className="rounded-3xl border-2 border-indigo-100 bg-white/95 p-5 sm:p-6 shadow-clay space-y-4">
            {/* Header & Visual Flow Progression Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {isElementary ? (
                  <span className="text-lg">🎈</span>
                ) : (
                  <BookOpen className="size-4.5 text-indigo-600" />
                )}
                <div>
                  <h3 className="font-display text-sm font-extrabold text-indigo-950 uppercase tracking-wider">
                    {isElementary
                      ? '🎈 3 BƯỚC KHÁM PHÁ CÙNG MÈO MEE'
                      : '📐 TIẾN TRÌNH PHÂN TÍCH BƯỚC GIẢI LIỀN MẠCH'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Học sinh nhìn rõ từng bước: Biểu đồ ➔ Bước 1 ➔ Bước 2 ➔ Bước 3 ➔ Ra đáp án
                  </p>
                </div>
              </div>

              {/* Natural Flow Breadcrumb */}
              <div className="flex items-center gap-1 text-[11px] font-bold bg-indigo-50 px-2.5 py-1 rounded-xl text-indigo-800 border border-indigo-200 shrink-0">
                <span>Biểu đồ</span>
                <span>➔</span>
                <span>B1</span>
                <span>➔</span>
                <span>B2</span>
                <span>➔</span>
                <span>B3</span>
                <span>➔</span>
                <span className="text-emerald-700 font-black">Đáp án {currentProblem.correctAnswer}</span>
              </div>
            </div>

            {/* 3 Continuous Walkthrough Cards */}
            <div className="space-y-3">
              {/* 📌 BƯỚC 1: DỮ KIỆN & NHẬN DIỆN */}
              <div
                onClick={() => setActivePedagogicalStep(1)}
                className={cn(
                  'rounded-2xl border-2 p-4 transition-all cursor-pointer text-left',
                  activePedagogicalStep === 1
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-200'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/30',
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full text-xs font-black',
                        activePedagogicalStep === 1
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700',
                      )}
                    >
                      1
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950">
                      {currentLevelData.analysisStep.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    📌 Bước 1: Dữ kiện
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-8">
                  <AsmoFormula text={currentLevelData.analysisStep.description} />
                </div>
              </div>

              {/* ⚙️ BƯỚC 2: PHƯƠNG PHÁP & CÔNG THỨC THEN CHỐT */}
              <div
                onClick={() => setActivePedagogicalStep(2)}
                className={cn(
                  'rounded-2xl border-2 p-4 transition-all cursor-pointer text-left',
                  activePedagogicalStep === 2
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-200'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/30',
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full text-xs font-black',
                        activePedagogicalStep === 2
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700',
                      )}
                    >
                      2
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950">
                      {currentLevelData.methodStep.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    ⚙️ Bước 2: Phương pháp
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-8">
                  <AsmoFormula text={currentLevelData.methodStep.description} />
                </div>
              </div>

              {/* 🎯 BƯỚC 3: TÍNH TOÁN & RA ĐÁP ÁN */}
              <div
                onClick={() => setActivePedagogicalStep(3)}
                className={cn(
                  'rounded-2xl border-2 p-4 transition-all cursor-pointer text-left',
                  activePedagogicalStep === 3
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-200'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/30',
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full text-xs font-black',
                        activePedagogicalStep === 3
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700',
                      )}
                    >
                      3
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950">
                      {currentLevelData.calcStep.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    🎯 Bước 3: Ra Đáp Án {currentProblem.correctAnswer}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-8 whitespace-pre-line">
                  <AsmoFormula text={currentLevelData.calcStep.description} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════ */}
        {/* CỘT PHẢI: TRẮC NGHIỆM & TRỢ GIẢNG MÈO MEE TẬP TRUNG DUY NHẤT (5 cols)     */}
        {/* ══════════════════════════════════════════════════════════════════════════ */}
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

            {/* Options List (A, B, C, D) */}
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

            {/* ── TRỢ GIẢNG MÈO MEE DUY NHẤT (UNIFIED MEE TUTOR & SPEED TIPS) ── */}
            <AsmoMeeTutor
              pose={!isAnswered ? 'guide' : isCorrect ? 'celebrate' : 'support'}
              speech={
                !isAnswered
                  ? isElementary
                    ? 'Con hãy quan sát kỹ mô hình và các bước giải sư phạm ở cột bên trái trước khi chọn đáp án nhé! 🌟'
                    : 'Hãy quan sát kỹ mô hình trực quan và tiến trình 3 bước giải ở cột bên trái trước khi chọn đáp án nhé!'
                  : isCorrect
                  ? isElementary
                    ? 'Tuyệt vời lắm! Con đã chọn đáp án hoàn toàn chính xác! 🏆'
                    : 'Xuất sắc! Đáp án chính xác! Chúc mừng bạn đã làm chủ bài toán này! 🌟'
                  : isElementary
                  ? 'Chưa chính xác rồi con ơi! Hãy xem lại Bước 2 và Bước 3 ở cột bên trái để nắm chắc phương pháp nhé!'
                  : 'Chưa chính xác! Hãy quan sát lại Bước 2 & Bước 3 ở cột tiến trình trực quan bên trái nhé!'
              }
              hint={!isAnswered ? currentProblem.meeHint : undefined}
              secretTip={!isAnswered ? currentLevelData.meeAdvice : currentProblem.explanation}
              compact
            />

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
