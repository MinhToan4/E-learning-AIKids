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
import { AsmoFormula } from '../components/AsmoFormula'
import { AsmoMeeTutor } from '../components/AsmoMeeTutor'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

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

  // Filter topics
  const filteredTopics = useMemo(() => {
    return ASMO_JOURNEY_TOPICS.filter((t) => {
      if (selectedSubject && t.subject !== selectedSubject) return false
      if (selectedTier !== 'all' && t.gradeTier !== selectedTier) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchDesc = t.description.toLowerCase().includes(q)
        const matchCode = t.topicCode.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchCode) return false
      }
      return true
    })
  }, [selectedSubject, selectedTier, searchQuery])

  const handleSelectTopic = (topic: AsmoJourneyTopic) => {
    setCurrentTopicId(topic.id)
    setCurrentLevel(1)
    setSelectedOption(null)
    setShowSolution(false)
    setActivePedagogicalStep(1)
    setSearchParams({ topic: topic.id })
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
            Khám Phá 12 Chuyên Đề Trọng Điểm ASMO Lớp 1 – 12 🚀
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-2xl">
            Lộ trình học tập 3 bước chuẩn sư phạm kết hợp mô hình không gian 3D Three.js tương tác 360°, đồ thị hàm số KaTeX và trợ giảng AI Mèo Mee đồng hành từng bước giải!
          </p>
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

          {/* Tier Pills (3 Cấp Học) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
              Cấp Lớp:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTier('all')}
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
                onClick={() => setSelectedTier(tier.id)}
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

        {/* 12 Topics Horizontal Scrollable Grid */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-indigo-600" />
              <span>12 Chuyên Đề Không Gian 3D & Dạng Bài Trọng Điểm ({filteredTopics.length} chuyên đề)</span>
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {filteredTopics.map((topic) => {
              const isCurrent = topic.id === currentTopic.id
              const doneCount = [1, 2, 3].filter((lvl) => completedLevels[`${topic.id}-lvl${lvl}`]).length
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 rounded-2xl p-3 text-left transition-all active:scale-95 cursor-pointer border max-w-[260px]',
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
                      {doneCount > 0 && (
                        <span className={cn('text-[10px] font-extrabold px-1.5 py-0.2 rounded-md', isCurrent ? 'bg-white/20 text-sun-300' : 'bg-emerald-100 text-emerald-800')}>
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
            />
          )}

          {/* 3-Step Pedagogical KaTeX Breakdown */}
          <div className="rounded-3xl border border-indigo-100 bg-white/95 p-5 shadow-clay space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-indigo-600" />
                <h3 className="font-display text-sm font-extrabold text-indigo-950 uppercase tracking-wider">
                  Phân Tích Giải Bài 3 Bước Sư Phạm Chuẩn ASMO
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
                <span className="truncate">1. Phân tích</span>
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
                <span className="truncate">2. Phương pháp</span>
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
                <span className="truncate">3. Tính toán</span>
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

            {/* Mèo Mee Live Feedback Coach */}
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
