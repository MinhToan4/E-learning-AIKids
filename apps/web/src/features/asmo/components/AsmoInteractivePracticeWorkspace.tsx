import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Gamepad2,
  Trophy,
  Star,
  Plus,
  Minus,
  Lightbulb,
  Zap,
  HelpCircle,
  Clock,
  Scale,
  Smile,
  Layers,
  Box,
  Compass,
} from 'lucide-react'
import {
  type AsmoLmsLesson,
  type AsmoLmsPracticeChallenge,
  getLessonPracticeChallenges,
  verifyPracticeChallenge,
} from '../data/asmo-curriculum-lms'
import { AsmoFormula } from './AsmoFormula'
import { AsmoInteractiveAppleTreeCanvas } from './AsmoInteractiveAppleTreeCanvas'
import { AikidCatCharacter, type AikidCatPose } from '@/shared/components/ui/AikidCatCharacter'
import { renderClockSvg, renderBalanceScaleSvg } from './AsmoDiagramEngine'
import {
  FlatClayBalloon,
  FlatClayPopBurst,
  FlatClayCupcake,
  FlatClayCandy,
  FlatClayWatermelon,
  FlatClayPizzaSlice,
  FlatClayCube,
  FlatClayRedApple,
  FlatClayGreenApple,
} from './AsmoFlatClayIcons'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

type Props = {
  lesson: AsmoLmsLesson
  onCompleteAllChallenges: () => void
  onAdvanceToQuiz: () => void
}

export function AsmoInteractivePracticeWorkspace({
  lesson,
  onCompleteAllChallenges,
  onAdvanceToQuiz,
}: Props) {
  const challenges: AsmoLmsPracticeChallenge[] = useMemo(() => {
    return getLessonPracticeChallenges(lesson)
  }, [lesson])

  const [currentChallengeIdx, setCurrentChallengeIdx] = useState<number>(0)
  const [completedChallenges, setCompletedChallenges] = useState<boolean[]>([false, false, false])
  const [practiceFeedback, setPracticeFeedback] = useState<{
    isCorrect: boolean
    feedback: string
    hint?: string
  } | null>(null)

  // ── Manipulative States ──
  const [applesA, setApplesA] = useState<number>(1)
  const [applesB, setApplesB] = useState<number>(1)
  const [poppedBalloons, setPoppedBalloons] = useState<number[]>([])
  const [cakeRows, setCakeRows] = useState<number>(2)
  const [cakeCols, setCakeCols] = useState<number>(2)
  const [clockHour, setClockHour] = useState<number>(12)
  const [clockMinute, setClockMinute] = useState<number>(0)
  const [pizzaSlices, setPizzaSlices] = useState<number>(8)
  const [pizzaShaded, setPizzaShaded] = useState<number>(1)
  const [candyTotal, setCandyTotal] = useState<number>(12)
  const [candyPlates, setCandyPlates] = useState<number>(3)
  const [tableMultiplier, setTableMultiplier] = useState<number>(1)
  const [tableBase, setTableBase] = useState<number>(4)
  const [scaleLeft, setScaleLeft] = useState<number>(2)
  const [scaleRight, setScaleRight] = useState<number>(2)
  const [pairedMake10, setPairedMake10] = useState<number[][]>([])
  const [selectedMake10, setSelectedMake10] = useState<number[]>([])
  const [columnCarryA, setColumnCarryA] = useState<number>(0)
  const [columnCarryB, setColumnCarryB] = useState<number>(0)
  const [activeCarrySlot, setActiveCarrySlot] = useState<'A' | 'B'>('A')
  const [rectWidth, setRectWidth] = useState<number>(4)
  const [rectHeight, setRectHeight] = useState<number>(3)
  const [cubeLayersCount, setCubeLayersCount] = useState<number[]>([4, 2, 1])
  const [matchstickSquares, setMatchstickSquares] = useState<number>(3)
  const [gridMazeDim, setGridMazeDim] = useState<{ rows: number; cols: number }>({ rows: 2, cols: 2 })
  const [selectedNetFace, setSelectedNetFace] = useState<number | null>(null)
  const [symbolSign, setSymbolSign] = useState<string | null>(null)
  const [numericAnswer, setNumericAnswer] = useState<number>(0)

  const currentChallenge = challenges[currentChallengeIdx] || challenges[0]

  const currentMake10Numbers: number[] = useMemo(() => {
    if (lesson.visualType === 'make10') {
      const conf = currentChallenge?.taskConfig as { numbers?: number[] } | undefined
      if (conf?.numbers && Array.isArray(conf.numbers) && conf.numbers.length > 0) {
        return conf.numbers
      }
      if (currentChallengeIdx === 0) return [1, 9, 3, 7]
      if (currentChallengeIdx === 1) return [2, 8, 4, 6, 5, 5]
      if (currentChallengeIdx === 2) return [1, 3, 5, 7, 9]
    }
    return [1, 9, 2, 8, 3, 7, 4, 6, 5, 5]
  }, [lesson.visualType, currentChallenge, currentChallengeIdx])

  // Initialize or reset manipulative when challenge changes
  useEffect(() => {
    setPracticeFeedback(null)
    if (!currentChallenge) return

    const init = currentChallenge.initialState || {}

    if (lesson.visualType === 'apple_drop') {
      setApplesA(typeof init.applesA === 'number' ? init.applesA : 1)
      setApplesB(typeof init.applesB === 'number' ? init.applesB : 1)
    } else if (lesson.visualType === 'balloon_pop') {
      setPoppedBalloons(Array.isArray(init.poppedBalloons) ? (init.poppedBalloons as number[]) : [])
    } else if (lesson.visualType === 'cake_tray') {
      setCakeRows(typeof init.cakeRows === 'number' ? init.cakeRows : 2)
      setCakeCols(typeof init.cakeCols === 'number' ? init.cakeCols : 2)
    } else if (lesson.visualType === 'analog_clock' || lesson.visualType === 'elapsed_time') {
      setClockHour(typeof init.clockHour === 'number' ? init.clockHour : 12)
      setClockMinute(typeof init.clockMinute === 'number' ? init.clockMinute : 0)
    } else if (
      lesson.visualType === 'pizza_fraction' ||
      lesson.visualType === 'compare_fractions' ||
      lesson.visualType === 'fraction_add_sub' ||
      lesson.visualType === 'fraction_of_number'
    ) {
      setPizzaSlices(typeof init.pizzaSlices === 'number' ? init.pizzaSlices : 8)
      setPizzaShaded(typeof init.pizzaShaded === 'number' ? init.pizzaShaded : 1)
      setSymbolSign(null)
    } else if (lesson.visualType === 'candy_division' || lesson.visualType === 'div_remainder') {
      setCandyTotal(typeof init.candyTotal === 'number' ? init.candyTotal : 12)
      setCandyPlates(typeof init.candyPlates === 'number' ? init.candyPlates : 3)
    } else if (lesson.visualType === 'times_table_25' || lesson.visualType === 'times_table_69') {
      setTableBase(typeof init.tableBase === 'number' ? init.tableBase : lesson.visualType === 'times_table_25' ? 4 : 9)
      setTableMultiplier(typeof init.tableMultiplier === 'number' ? init.tableMultiplier : 1)
    } else if (lesson.visualType === 'balance_scale') {
      setScaleLeft(typeof init.scaleLeft === 'number' ? init.scaleLeft : 2)
      setScaleRight(typeof init.scaleRight === 'number' ? init.scaleRight : 1)
    } else if (lesson.visualType === 'make10') {
      setPairedMake10([])
      setSelectedMake10([])
    } else if (lesson.visualType === 'column_add' || lesson.visualType === 'column_sub') {
      setColumnCarryA(typeof init.columnCarryA === 'number' ? init.columnCarryA : 0)
      setColumnCarryB(typeof init.columnCarryB === 'number' ? init.columnCarryB : 0)
      setActiveCarrySlot('A')
    } else if (lesson.visualType === 'perimeter_area') {
      setRectWidth(typeof init.rectWidth === 'number' ? init.rectWidth : 4)
      setRectHeight(typeof init.rectHeight === 'number' ? init.rectHeight : 3)
    } else if (lesson.visualType === 'cube_3d') {
      setCubeLayersCount([6, 3, 1])
    } else if (lesson.visualType === 'matchstick') {
      setMatchstickSquares(typeof init.matchstickSquares === 'number' ? init.matchstickSquares : 3)
    } else if (lesson.visualType === 'grid_maze') {
      setGridMazeDim({ rows: 2, cols: 2 })
    } else if (lesson.visualType === 'cube_net') {
      setSelectedNetFace(null)
    }
  }, [lesson, currentChallengeIdx, currentChallenge])

  // Current user manipulative state bundle
  const currentState = useMemo(() => {
    return {
      applesA,
      applesB,
      poppedBalloons,
      cakeRows,
      cakeCols,
      clockHour,
      clockMinute,
      pizzaSlices,
      pizzaShaded,
      candyTotal,
      candyPlates,
      tableBase,
      tableMultiplier,
      scaleLeft,
      scaleRight,
      pairedMake10,
      selectedMake10,
      columnCarryA,
      columnCarryB,
      rectWidth,
      rectHeight,
      cubeLayersCount,
      matchstickSquares,
      gridMazeDim,
      selectedNetFace,
      symbolSign,
      numericAnswer,
    }
  }, [
    applesA,
    applesB,
    poppedBalloons,
    cakeRows,
    cakeCols,
    clockHour,
    clockMinute,
    pizzaSlices,
    pizzaShaded,
    candyTotal,
    candyPlates,
    tableBase,
    tableMultiplier,
    scaleLeft,
    scaleRight,
    pairedMake10,
    selectedMake10,
    columnCarryA,
    columnCarryB,
    rectWidth,
    rectHeight,
    cubeLayersCount,
    matchstickSquares,
    gridMazeDim,
    selectedNetFace,
    symbolSign,
    numericAnswer,
  ])

  // Handle Verify Practice Button
  const handleCheckChallenge = () => {
    const result = verifyPracticeChallenge(lesson, currentChallengeIdx, currentState)
    setPracticeFeedback(result)

    if (result.isCorrect) {
      const nextCompleted = [...completedChallenges]
      nextCompleted[currentChallengeIdx] = true
      setCompletedChallenges(nextCompleted)

      // If all 3 challenges completed
      if (nextCompleted.every(Boolean) || currentChallengeIdx === challenges.length - 1) {
        onCompleteAllChallenges()
      }
    }
  }

  // Handle Move to next challenge
  const handleNextChallenge = () => {
    if (currentChallengeIdx < challenges.length - 1) {
      setCurrentChallengeIdx((prev) => prev + 1)
      setPracticeFeedback(null)
    } else {
      onAdvanceToQuiz()
    }
  }

  // Handle Reset Current Challenge State
  const handleResetChallenge = () => {
    setPracticeFeedback(null)
    if (lesson.visualType === 'apple_drop') {
      setApplesA(1)
      setApplesB(1)
    } else if (lesson.visualType === 'balloon_pop') {
      setPoppedBalloons([])
    } else if (lesson.visualType === 'cake_tray') {
      setCakeRows(2)
      setCakeCols(2)
    } else if (lesson.visualType === 'analog_clock' || lesson.visualType === 'elapsed_time') {
      setClockHour(12)
      setClockMinute(0)
    } else if (lesson.visualType === 'pizza_fraction') {
      setPizzaShaded(1)
    } else if (lesson.visualType === 'candy_division' || lesson.visualType === 'div_remainder') {
      setCandyTotal(12)
      setCandyPlates(3)
    } else if (lesson.visualType === 'make10') {
      setPairedMake10([])
      setSelectedMake10([])
    } else if (lesson.visualType === 'column_add' || lesson.visualType === 'column_sub') {
      const init = currentChallenge?.initialState || {}
      setColumnCarryA(typeof init.columnCarryA === 'number' ? init.columnCarryA : 0)
      setColumnCarryB(typeof init.columnCarryB === 'number' ? init.columnCarryB : 0)
      setActiveCarrySlot('A')
    }
  }

  const isAllChallengesCompleted = completedChallenges.every(Boolean)

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MULTI-LEVEL PRACTICE CHALLENGE PROGRESS TRACKER (1 ➔ 2 ➔ 3)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-50 border-2 border-emerald-300 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Header & Challenge Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-600 text-white shadow-xs">
              <Gamepad2 className="size-5" />
            </span>
            <div>
              <div className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                Phòng Thực Hành Tương Tác Đa Cấp Độ
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug flex items-center gap-1.5 flex-wrap">
                <span>Thử thách {currentChallengeIdx + 1}/{challenges.length}:</span>
                <AsmoFormula text={currentChallenge.title} className="inline" />
              </h2>
            </div>
          </div>

          {/* 3 Step Progress Indicators */}
          <div className="flex items-center gap-2">
            {challenges.map((c, idx) => {
              const isCompleted = completedChallenges[idx]
              const isCurrent = idx === currentChallengeIdx

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCurrentChallengeIdx(idx)
                    setPracticeFeedback(null)
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 select-none',
                    isCurrent
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-clay scale-105'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                        : 'bg-white/80 text-slate-500 border-slate-200 hover:bg-white',
                  )}
                >
                  <span>{c.level === 1 ? '🥉' : c.level === 2 ? '🥈' : '🥇'}</span>
                  <AsmoFormula text={c.levelLabel.split(':')[0]} className="inline" />
                  {isCompleted && <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Challenge Instruction Card */}
        <div className="bg-white/90 rounded-2xl border border-emerald-200 p-4 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase">
            <Sparkles className="size-4 text-amber-500 fill-amber-400" />
            <span>Nhiệm Vụ Thử Thách:</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
            <AsmoFormula text={currentChallenge.instruction} />
          </div>
          {currentChallenge.hint && (
            <div className="text-xs font-semibold text-slate-500 pt-0.5 flex items-center gap-1 flex-wrap">
              <span>💡 Gợi ý của Mee:</span>
              <AsmoFormula text={currentChallenge.hint} className="inline" />
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. HANDS-ON INTERACTIVE MANIPULATIVE CONTROLLER (BỘ ĐIỀU KHIỂN THỰC TẾ)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl bg-slate-50 border-2 border-slate-200 p-5 sm:p-6 flex flex-col items-center justify-center space-y-5 min-h-[300px]">
        {/* ── 1. APPLE DROP MANIPULATOR (VƯỜN CÂY TÁO TƯƠNG TÁC KÉO THẢ TÁO VÀO GIỎ) ── */}
        {lesson.visualType === 'apple_drop' && (
          <div className="w-full max-w-xl">
            <AsmoInteractiveAppleTreeCanvas
              applesA={applesA}
              applesB={applesB}
              onAddApple={(basket) => {
                if (basket === 'A') setApplesA((prev) => (prev < 10 ? prev + 1 : 10))
                else setApplesB((prev) => (prev < 10 ? prev + 1 : 10))
              }}
              onSubApple={(basket) => {
                if (basket === 'A') setApplesA((prev) => (prev > 0 ? prev - 1 : 0))
                else setApplesB((prev) => (prev > 0 ? prev - 1 : 0))
              }}
              onReset={() => {
                const init = currentChallenge?.initialState || {}
                setApplesA(typeof init.applesA === 'number' ? init.applesA : 1)
                setApplesB(typeof init.applesB === 'number' ? init.applesB : 1)
              }}
              title={`Thử thách ${currentChallengeIdx + 1}: ${currentChallenge.title}`}
              instruction={currentChallenge.instruction}
              meeQuote="🐱 Mèo Mee: Bé hãy chạm vào quả táo trên cây hoặc kéo thả vào giỏ để hoàn thành nhiệm vụ nhé!"
            />
          </div>
        )}

        {/* ── 2. BALLOON POP MANIPULATOR ── */}
        {lesson.visualType === 'balloon_pop' && (
          <div className="w-full max-w-lg space-y-3.5">
            {/* Balloon Sky Container */}
            <div className="w-full bg-gradient-to-b from-sky-100/90 via-sky-50/70 to-mint-50/80 border-2 border-sky-200 rounded-3xl p-4 sm:p-5 shadow-clay flex flex-col items-center space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between w-full z-10 px-1">
                <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
                  <FlatClayBalloon color="sky" size={18} showString={false} />
                  <span>Chạm vào bóng để nổ hoặc bơm lại</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPoppedBalloons([])}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-black text-xs flex items-center gap-1 cursor-pointer border border-sky-200 shadow-2xs active:scale-95"
                >
                  <RotateCcw className="size-3 text-sky-600" />
                  <span>Bơm lại</span>
                </button>
              </div>

              {/* 10 Giant Soft Clay Balloons */}
              <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5 z-10 w-full justify-items-center">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const id = idx + 1
                  const isPopped = poppedBalloons.includes(id)
                  const colorKeys = [
                    'rose', 'amber', 'emerald', 'sky', 'purple',
                    'pink', 'indigo', 'teal', 'orange', 'lime',
                  ] as const
                  const colorKey = colorKeys[idx % colorKeys.length]

                  return (
                    <button
                      key={`balloon-${id}`}
                      type="button"
                      onClick={() => {
                        if (isPopped) {
                          setPoppedBalloons(poppedBalloons.filter((b) => b !== id))
                        } else {
                          setPoppedBalloons([...poppedBalloons, id])
                        }
                      }}
                      className={cn(
                        'relative size-14 sm:size-16 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer border-2 select-none active:scale-90',
                        isPopped
                          ? 'bg-slate-100/80 border-slate-300 opacity-50 scale-85 shadow-none'
                          : 'bg-white border-sky-200 shadow-clay hover:scale-110 active:scale-95',
                      )}
                    >
                      {isPopped ? (
                        <FlatClayPopBurst size={38} />
                      ) : (
                        <FlatClayBalloon color={colorKey} number={id} size={46} showString={false} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Sub-counter */}
              <div className="z-10 flex items-center justify-center gap-3 bg-white/95 px-4 py-1.5 rounded-full border border-sky-200 shadow-2xs text-xs font-black text-slate-800">
                <span className="flex items-center gap-1">
                  <FlatClayBalloon color="sky" size={16} showString={false} /> Ban đầu: <strong>10 quả</strong>
                </span>
                <span className="flex items-center gap-1">
                  <FlatClayPopBurst size={16} /> Nổ: <strong className="text-rose-600">{poppedBalloons.length}</strong>
                </span>
                <span className="flex items-center gap-1">
                  ✨ Còn: <strong className="text-emerald-600">{10 - poppedBalloons.length}</strong>
                </span>
              </div>
            </div>

            {/* Giant Montessori Toy Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-800 shadow-clay">
                  <FlatClayBalloon color="sky" size={28} showString={false} />
                  <span className="font-display font-black text-2xl sm:text-3xl text-sky-800">10</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  −
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 shadow-clay">
                  <FlatClayPopBurst size={28} />
                  <span className="font-display font-black text-2xl sm:text-3xl text-rose-700">{poppedBalloons.length}</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  =
                </div>

                <div className={cn(
                  'flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl bg-brand-500 text-white font-black text-2xl sm:text-3xl shadow-clay border-2 border-brand-600 transition-all duration-300',
                  10 - poppedBalloons.length > 0 && 'scale-105 ring-4 ring-brand-200 animate-pulse',
                )}>
                  <span className="font-display font-black text-2xl sm:text-3xl text-white">{10 - poppedBalloons.length}</span>
                  <FlatClayBalloon color="rose" size={28} showString={false} className="animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. CAKE TRAY MANIPULATOR ── */}
        {lesson.visualType === 'cake_tray' && (
          <div className="w-full max-w-lg space-y-3.5">
            {/* Tactile Grid Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-amber-50/90 p-3.5 rounded-2xl border-2 border-amber-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800">Số Hàng:</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-amber-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt hàng bánh"
                    disabled={cakeRows <= 1}
                    onClick={() => setCakeRows((r) => (r > 1 ? r - 1 : 1))}
                    className="size-8 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-amber-950 select-none">{cakeRows}</span>
                  <button
                    type="button"
                    aria-label="Thêm hàng bánh"
                    disabled={cakeRows >= 5}
                    onClick={() => setCakeRows((r) => (r < 5 ? r + 1 : 5))}
                    className="size-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800">Số Cột:</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-amber-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt cột bánh"
                    disabled={cakeCols <= 1}
                    onClick={() => setCakeCols((c) => (c > 1 ? c - 1 : 1))}
                    className="size-8 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-amber-950 select-none">{cakeCols}</span>
                  <button
                    type="button"
                    aria-label="Thêm cột bánh"
                    disabled={cakeCols >= 5}
                    onClick={() => setCakeCols((c) => (c < 5 ? c + 1 : 5))}
                    className="size-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Soft Clay Cupcake Tray Grid */}
            <div
              className="grid gap-2.5 justify-center p-4 sm:p-5 bg-gradient-to-b from-amber-100/90 via-amber-50/70 to-orange-50/80 rounded-3xl border-2 border-amber-300 shadow-clay"
              style={{ gridTemplateColumns: `repeat(${cakeCols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cakeRows }).map((_, r) =>
                Array.from({ length: cakeCols }).map((_, c) => (
                  <div
                    key={`practice-cake-${r}-${c}`}
                    className="size-12 sm:size-14 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center shadow-clay animate-in zoom-in-50 select-none hover:scale-110 transition-transform cursor-pointer"
                  >
                    <FlatClayCupcake size={36} flavor={r % 2 === 0 ? 'strawberry' : 'vanilla'} />
                  </div>
                )),
              )}
            </div>

            {/* Giant Montessori Toy Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-800 shadow-clay">
                  <FlatClayCupcake size={28} flavor="strawberry" />
                  <span className="font-display font-black text-2xl sm:text-3xl text-amber-800">{cakeRows} hàng</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  ×
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 shadow-clay">
                  <FlatClayCupcake size={28} flavor="vanilla" />
                  <span className="font-display font-black text-2xl sm:text-3xl text-emerald-800">{cakeCols} cột</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  =
                </div>

                <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl bg-brand-500 text-white font-black text-2xl sm:text-3xl shadow-clay border-2 border-brand-600 transition-all duration-300">
                  <span className="font-display font-black text-2xl sm:text-3xl text-white">{cakeRows * cakeCols}</span>
                  <FlatClayCupcake size={28} flavor="strawberry" className="animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. CANDY DIVISION MANIPULATOR ── */}
        {(lesson.visualType === 'candy_division' || lesson.visualType === 'div_remainder') && (
          <div className="w-full max-w-lg space-y-3.5">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-2xl border-2 border-brand-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800 flex items-center gap-1">
                  <FlatClayCandy size={16} />
                  <span>Số kẹo:</span>
                </span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-rose-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt kẹo"
                    disabled={candyTotal <= 4}
                    onClick={() => setCandyTotal((t) => (t > 4 ? t - 1 : 4))}
                    className="size-8 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-rose-950 select-none">{candyTotal}</span>
                  <button
                    type="button"
                    aria-label="Thêm kẹo"
                    disabled={candyTotal >= 24}
                    onClick={() => setCandyTotal((t) => (t < 24 ? t + 1 : 24))}
                    className="size-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800">Số đĩa 🍽️:</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-brand-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt đĩa"
                    disabled={candyPlates <= 2}
                    onClick={() => setCandyPlates((p) => (p > 2 ? p - 1 : 2))}
                    className="size-8 rounded-xl bg-brand-100 hover:bg-brand-200 text-brand-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-brand-950 select-none">{candyPlates}</span>
                  <button
                    type="button"
                    aria-label="Thêm đĩa"
                    disabled={candyPlates >= 6}
                    onClick={() => setCandyPlates((p) => (p < 6 ? p + 1 : 6))}
                    className="size-8 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Porcelain Plates Stage */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-center bg-gradient-to-b from-sky-50/80 to-emerald-50/80 p-4 rounded-3xl border-2 border-brand-200 shadow-clay">
              {Array.from({ length: candyPlates }).map((_, plateIdx) => {
                const candiesPerPlate = Math.floor(candyTotal / candyPlates)
                return (
                  <div
                    key={`prac-plate-${plateIdx}`}
                    className="bg-white border-3 border-brand-200 rounded-3xl p-3 flex flex-col items-center space-y-1.5 shadow-clay hover:scale-105 transition-transform"
                  >
                    <span className="text-xs font-black text-brand-800">Đĩa {plateIdx + 1}</span>
                    <div className="flex items-center justify-center gap-1 flex-wrap min-h-12">
                      {Array.from({ length: candiesPerPlate }).map((_, cIdx) => (
                        <FlatClayCandy key={`plate-candy-${cIdx}`} size={20} className="animate-in zoom-in-50" />
                      ))}
                    </div>
                    <span className="text-xs font-extrabold text-slate-600">{candiesPerPlate} cái</span>
                  </div>
                )
              })}
            </div>

            {candyTotal % candyPlates !== 0 && (
              <div className="flex items-center justify-center gap-1 bg-amber-100/80 border-2 border-amber-300 rounded-2xl p-2 text-center text-xs font-black text-amber-900 shadow-2xs">
                <FlatClayCandy size={16} />
                <span>Kẹo dư chưa chia: {candyTotal % candyPlates} cái</span>
              </div>
            )}

            {/* Giant Montessori Toy Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 shadow-clay">
                  <FlatClayCandy size={28} />
                  <span className="font-display font-black text-2xl sm:text-3xl text-rose-800">{candyTotal}</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  ÷
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-800 shadow-clay">
                  <span className="text-2xl sm:text-3xl">🍽️</span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-sky-800">{candyPlates} đĩa</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  =
                </div>

                <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl bg-brand-500 text-white font-black text-2xl sm:text-3xl shadow-clay border-2 border-brand-600 transition-all duration-300">
                  <span className="font-display font-black text-2xl sm:text-3xl text-white">{Math.floor(candyTotal / candyPlates)}</span>
                  <FlatClayCandy size={24} className="animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. PIZZA FRACTION MANIPULATOR ── */}
        {(lesson.visualType === 'pizza_fraction' ||
          lesson.visualType === 'compare_fractions' ||
          lesson.visualType === 'fraction_add_sub' ||
          lesson.visualType === 'fraction_of_number') && (
          <div className="w-full max-w-md space-y-4 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-white p-3 rounded-2xl border-2 border-brand-100 shadow-clay">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-700">Số lát cắt:</span>
                {[4, 6, 8, 10].map((num) => (
                  <button
                    key={`slice-btn-${num}`}
                    type="button"
                    onClick={() => {
                      setPizzaSlices(num)
                      if (pizzaShaded > num) setPizzaShaded(num)
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-xl font-black text-xs cursor-pointer border-2 transition-all active:scale-95',
                      pizzaSlices === num
                        ? 'bg-brand-500 text-white border-brand-600 shadow-clay'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs',
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className="font-black text-slate-700">Đã chọn:</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-emerald-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt lát pizza"
                    disabled={pizzaShaded <= 0}
                    onClick={() => setPizzaShaded((s) => (s > 0 ? s - 1 : 0))}
                    className="size-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-emerald-950 select-none">{pizzaShaded}</span>
                  <button
                    type="button"
                    aria-label="Thêm lát pizza"
                    disabled={pizzaShaded >= pizzaSlices}
                    onClick={() => setPizzaShaded((s) => (s < pizzaSlices ? s + 1 : pizzaSlices))}
                    className="size-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive SVG Pizza Pie Soft Clay */}
            <div className="relative p-3 bg-gradient-to-b from-amber-50 to-orange-50 rounded-full border-4 border-amber-200 shadow-clay">
              <svg viewBox="0 0 160 160" className="size-48 select-none drop-shadow-md cursor-pointer overflow-visible">
                <defs>
                  <filter id="pizzaShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#78350f" floodOpacity="0.25" />
                  </filter>
                </defs>
                <circle cx="80" cy="80" r="72" fill="#d97706" stroke="#92400e" strokeWidth="4" filter="url(#pizzaShadow)" />
                <circle cx="80" cy="80" r="66" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                {Array.from({ length: pizzaSlices }).map((_, i) => {
                  const startAngle = (i * 360) / pizzaSlices
                  const endAngle = ((i + 1) * 360) / pizzaSlices
                  const isShaded = i < pizzaShaded

                  const x1 = 80 + 64 * Math.cos(((startAngle - 90) * Math.PI) / 180)
                  const y1 = 80 + 64 * Math.sin(((startAngle - 90) * Math.PI) / 180)
                  const x2 = 80 + 64 * Math.cos(((endAngle - 90) * Math.PI) / 180)
                  const y2 = 80 + 64 * Math.sin(((endAngle - 90) * Math.PI) / 180)

                  const largeArc = endAngle - startAngle > 180 ? 1 : 0
                  const d = `M 80,80 L ${x1},${y1} A 64,64 0 ${largeArc},1 ${x2},${y2} Z`

                  return (
                    <g key={`prac-slice-${i}`}>
                      <path
                        d={d}
                        fill={isShaded ? '#ef4444' : '#fef08a'}
                        stroke="#92400e"
                        strokeWidth="2"
                        onClick={() => {
                          if (isShaded) {
                            setPizzaShaded(i)
                          } else {
                            setPizzaShaded(i + 1)
                          }
                        }}
                        className="transition-all duration-200 hover:opacity-85 active:scale-98"
                      />
                    </g>
                  )
                })}
                <circle cx="80" cy="80" r="5" fill="#78350f" />
              </svg>
            </div>

            {lesson.visualType === 'compare_fractions' && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-700">Chọn dấu so sánh:</span>
                {['>', '<', '='].map((sign) => (
                  <button
                    key={sign}
                    type="button"
                    onClick={() => setSymbolSign(sign)}
                    className={cn(
                      'size-10 rounded-2xl font-black text-lg transition-all cursor-pointer border-2 shadow-clay active:scale-95',
                      symbolSign === sign
                        ? 'bg-brand-500 text-white border-brand-600'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-brand-50',
                    )}
                  >
                    {sign}
                  </button>
                ))}
              </div>
            )}

            {/* KaTeX Fraction Board */}
            <div className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-3.5 text-center font-display font-extrabold text-emerald-950 text-base shadow-clay">
              <AsmoFormula text={`Phân số biểu thị: $\\frac{${pizzaShaded}}{${pizzaSlices}}$ chiếc bánh pizza 🍕`} />
            </div>
          </div>
        )}

        {/* ── 6. ANALOG CLOCK MANIPULATOR ── */}
        {(lesson.visualType === 'analog_clock' || lesson.visualType === 'elapsed_time') && (
          <div className="w-full max-w-md space-y-4 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-clay">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-700">Chỉnh Giờ:</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-sky-200 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Lùi 1 giờ"
                    onClick={() => setClockHour((h) => (h > 1 ? h - 1 : 12))}
                    className="size-8 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 font-black flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-8 text-center font-display font-black text-sm text-sky-950 select-none">{clockHour}h</span>
                  <button
                    type="button"
                    aria-label="Tiến 1 giờ"
                    onClick={() => setClockHour((h) => (h < 12 ? h + 1 : 1))}
                    className="size-8 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="font-black text-slate-700">Chỉnh Phút:</span>
                {[0, 15, 30, 45].map((min) => (
                  <button
                    key={`min-btn-${min}`}
                    type="button"
                    onClick={() => setClockMinute(min)}
                    className={cn(
                      'px-2 py-1 rounded-xl font-black text-xs cursor-pointer border-2 transition-all active:scale-95',
                      clockMinute === min
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-clay'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs',
                    )}
                  >
                    {min}p
                  </button>
                ))}
              </div>
            </div>

            <div className="size-44 bg-white rounded-full p-2 shadow-clay border-3 border-sky-200 flex items-center justify-center">
              {renderClockSvg(clockHour, clockMinute, { size: 160 })}
            </div>

            <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-3.5 text-center font-display font-extrabold text-sky-950 text-base shadow-2xs">
              Thời gian hiển thị: {clockHour}:{clockMinute < 10 ? `0${clockMinute}` : clockMinute}
            </div>
          </div>
        )}

        {/* ── 7. MAKE 10 MANIPULATOR ── */}
        {lesson.visualType === 'make10' && (
          <div className="w-full max-w-xl space-y-4">
            {/* Header & Reset Button */}
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border-2 border-purple-200 text-xs shadow-clay">
              <div className="flex items-center gap-2">
                <span className="font-black text-purple-900 flex items-center gap-1.5 flex-wrap">
                  {currentChallengeIdx === 0 && <AsmoFormula text="🥉 Thử thách 1: Ghép 2 cặp bạn thân từ 4 số" className="inline" />}
                  {currentChallengeIdx === 1 && <AsmoFormula text="🥈 Thử thách 2: Ghép đủ 3 cặp bạn thân từ 6 số" className="inline" />}
                  {currentChallengeIdx === 2 && <AsmoFormula text="🥇 Thử thách 3: Ghép 2 cặp tròn 10 để tính tổng dãy số 25" className="inline" />}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPairedMake10([])
                  setSelectedMake10([])
                }}
                className="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="size-3" />
                <span>Ghép lại</span>
              </button>
            </div>

            {/* Instruction Tip */}
            <div className="text-center text-xs font-black text-purple-800">
              🐾 Bé hãy bấm chọn 2 quả bóng có tổng bằng 10 để ghép thành 1 cặp bạn thân nhé!
            </div>

            {/* Dynamic Large Number Balls Grid */}
            <div className="flex items-center justify-center gap-3.5 sm:gap-4 flex-wrap p-5 sm:p-6 bg-gradient-to-br from-purple-50 via-pink-50/50 to-amber-50/50 rounded-3xl border-2 border-purple-200 shadow-clay">
              {currentMake10Numbers.map((num, idx) => {
                const isPaired = pairedMake10.some((p) => p.includes(idx))
                const isSelected = selectedMake10.includes(idx)

                // Dynamic vibrant colors per number matching the 5 friend pairs
                const colorClass =
                  num === 1 || num === 9
                    ? 'from-rose-500 to-pink-600 text-white border-rose-300'
                    : num === 2 || num === 8
                      ? 'from-amber-500 to-orange-600 text-white border-amber-300'
                      : num === 3 || num === 7
                        ? 'from-yellow-400 to-amber-500 text-slate-950 border-yellow-300'
                        : num === 4 || num === 6
                          ? 'from-emerald-500 to-teal-600 text-white border-emerald-300'
                          : 'from-purple-500 to-indigo-600 text-white border-purple-300'

                const fruitEmoji =
                  num === 1 || num === 9
                    ? '🍎'
                    : num === 2 || num === 8
                      ? '🍊'
                      : num === 3 || num === 7
                        ? '🍋'
                        : num === 4 || num === 6
                          ? '🍏'
                          : '🍇'

                return (
                  <button
                    key={`make10-ball-${currentChallengeIdx}-${idx}`}
                    type="button"
                    onClick={() => {
                      if (isPaired) return
                      if (isSelected) {
                        setSelectedMake10(selectedMake10.filter((i) => i !== idx))
                      } else if (selectedMake10.length === 0) {
                        setSelectedMake10([idx])
                      } else if (selectedMake10.length === 1) {
                        const firstIdx = selectedMake10[0]
                        const firstVal = currentMake10Numbers[firstIdx]
                        if (firstVal + num === 10) {
                          setPairedMake10([...pairedMake10, [firstIdx, idx]])
                          setSelectedMake10([])
                        } else {
                          setSelectedMake10([idx])
                        }
                      }
                    }}
                    className={cn(
                      'relative size-16 sm:size-18 rounded-full font-black text-xl sm:text-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-4 border-white select-none active:scale-90',
                      isPaired
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-600 border-emerald-300 text-white opacity-75 shadow-xs scale-95'
                        : isSelected
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-white ring-4 ring-amber-400 scale-110 shadow-clay animate-pulse'
                          : cn('bg-gradient-to-br shadow-clay hover:scale-105', colorClass),
                    )}
                  >
                    <span className="text-xl sm:text-2xl leading-none">{num}</span>
                    <span className="text-xs leading-none opacity-90 mt-0.5">{fruitEmoji}</span>
                    {isPaired && (
                      <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full size-5 text-[10px] font-black flex items-center justify-center border border-white shadow-xs">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Pairs Summary & Sequence Calculation */}
            <div className="bg-purple-50/90 border-2 border-purple-300 rounded-2xl p-4 text-center space-y-2 shadow-xs">
              <div className="flex items-center justify-center gap-2 flex-wrap text-xs sm:text-sm font-extrabold text-purple-950">
                <span>Đã ghép:</span>
                {pairedMake10.length === 0 ? (
                  <span className="text-slate-400 italic">Chưa chọn cặp nào</span>
                ) : (
                  pairedMake10.map(([i1, i2], pIdx) => {
                    const v1 = currentMake10Numbers[i1]
                    const v2 = currentMake10Numbers[i2]
                    return (
                      <span
                        key={`paired-badge-${pIdx}`}
                        className="inline-flex items-center gap-1 bg-white border border-purple-300 rounded-xl px-2.5 py-1 text-purple-900 shadow-2xs font-black"
                      >
                        <span>({v1} + {v2} = 10)</span>
                        <span className="text-emerald-600">✓</span>
                      </span>
                    )
                  })
                )}
              </div>

              {currentChallengeIdx === 2 && (
                <div className="pt-2 border-t border-purple-200/80 text-xs sm:text-sm font-black text-slate-800">
                  Biểu thức tính nhanh: (1 + 9) + (3 + 7) + 5 ={' '}
                  <span className="text-emerald-700 font-black">10 + 10 + 5 = 25</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 8. BALANCE SCALE MANIPULATOR (Trạm 7: Cân Thăng Bằng Soft Clay) ── */}
        {lesson.visualType === 'balance_scale' && (
          <div className="w-full max-w-lg space-y-3.5 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-2xl border-2 border-brand-200 shadow-2xs w-full">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800">Đĩa Trái (Dưa 🍉):</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-emerald-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt dưa"
                    disabled={scaleLeft <= 1}
                    onClick={() => setScaleLeft((s) => (s > 1 ? s - 1 : 1))}
                    className="size-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-emerald-950 select-none">{scaleLeft}</span>
                  <button
                    type="button"
                    aria-label="Thêm dưa"
                    disabled={scaleLeft >= 5}
                    onClick={() => setScaleLeft((s) => (s < 5 ? s + 1 : 5))}
                    className="size-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800 flex items-center gap-1">
                  <span>Đĩa Phải:</span>
                  <FlatClayRedApple size={20} />
                </span>
                <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-2xl border-2 border-rose-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt táo đĩa phải"
                    disabled={scaleRight <= 1}
                    onClick={() => setScaleRight((r) => (r > 1 ? r - 1 : 1))}
                    className="size-8 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-rose-950 select-none">{scaleRight}</span>
                  <button
                    type="button"
                    aria-label="Thêm táo đĩa phải"
                    disabled={scaleRight >= 15}
                    onClick={() => setScaleRight((r) => (r < 15 ? r + 1 : 15))}
                    className="size-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full">
              {renderBalanceScaleSvg({
                left: { emoji: '🍉', text: `${scaleLeft} Quả Dưa` },
                right: { emoji: '🍎', text: `${scaleRight} Quả Táo` },
                tilt: scaleLeft * 3 === scaleRight ? 'equal' : scaleLeft * 3 > scaleRight ? 'left' : 'right',
                label: `Đĩa trái: ${scaleLeft} Dưa — Đĩa phải: ${scaleRight} Táo`,
              })}
            </div>

            {/* Giant Montessori Toy Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 shadow-clay">
                  <FlatClayWatermelon size={28} />
                  <span className="font-display font-black text-2xl sm:text-3xl text-emerald-800">{scaleLeft} dưa</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  {scaleLeft * 3 === scaleRight ? '=' : scaleLeft * 3 > scaleRight ? '>' : '<'}
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 shadow-clay">
                  <FlatClayRedApple size={28} />
                  <span className="font-display font-black text-2xl sm:text-3xl text-rose-800">{scaleRight} táo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 9. 3D CUBE MANIPULATOR (Trạm 8: Khối Lập Phương Soft Clay) ── */}
        {lesson.visualType === 'cube_3d' && (
          <div className="w-full max-w-lg space-y-4 text-center">
            {/* Layer Controls */}
            <div className="grid grid-cols-3 gap-2.5 bg-indigo-50/80 p-3 rounded-2xl border-2 border-indigo-200 shadow-2xs">
              {[
                { label: 'Tầng 1 (Dưới)', idx: 0 },
                { label: 'Tầng 2 (Giữa)', idx: 1 },
                { label: 'Tầng 3 (Trên)', idx: 2 },
              ].map((tier) => (
                <div key={tier.label} className="flex flex-col items-center gap-1.5 bg-white p-2 rounded-2xl border-2 border-indigo-100 shadow-xs">
                  <span className="text-[11px] font-black text-slate-700">{tier.label}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Bớt khối ${tier.label}`}
                      disabled={cubeLayersCount[tier.idx] <= 0}
                      onClick={() => {
                        const next = [...cubeLayersCount]
                        next[tier.idx] = Math.max(0, next[tier.idx] - 1)
                        setCubeLayersCount(next)
                      }}
                      className="size-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-90"
                    >
                      <Minus className="size-3.5 stroke-[3]" />
                    </button>
                    <span className="w-5 text-center font-display font-black text-sm text-indigo-950">
                      {cubeLayersCount[tier.idx]}
                    </span>
                    <button
                      type="button"
                      aria-label={`Thêm khối ${tier.label}`}
                      disabled={cubeLayersCount[tier.idx] >= 6}
                      onClick={() => {
                        const next = [...cubeLayersCount]
                        next[tier.idx] = Math.min(6, next[tier.idx] + 1)
                        setCubeLayersCount(next)
                      }}
                      className="size-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-90"
                    >
                      <Plus className="size-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Isometric 2D Flat Soft Clay Layer Stacking Illustration */}
            <div className="p-4 bg-gradient-to-b from-indigo-100/90 via-indigo-50/70 to-purple-50/80 rounded-3xl border-2 border-indigo-200 shadow-clay flex flex-col items-center justify-center gap-2">
              {/* Tier 3 (Top) */}
              {cubeLayersCount[2] > 0 && (
                <div className="flex items-center justify-center gap-1.5 animate-in zoom-in-50">
                  {Array.from({ length: cubeLayersCount[2] }).map((_, i) => (
                    <FlatClayCube key={`prac-t3-${i}`} size={36} color="pink" />
                  ))}
                </div>
              )}
              {/* Tier 2 (Middle) */}
              {cubeLayersCount[1] > 0 && (
                <div className="flex items-center justify-center gap-1.5 animate-in zoom-in-50">
                  {Array.from({ length: cubeLayersCount[1] }).map((_, i) => (
                    <FlatClayCube key={`prac-t2-${i}`} size={36} color="purple" />
                  ))}
                </div>
              )}
              {/* Tier 1 (Bottom) */}
              {cubeLayersCount[0] > 0 && (
                <div className="flex items-center justify-center gap-1.5 animate-in zoom-in-50">
                  {Array.from({ length: cubeLayersCount[0] }).map((_, i) => (
                    <FlatClayCube key={`prac-t1-${i}`} size={36} color="indigo" />
                  ))}
                </div>
              )}
            </div>

            {/* Giant Montessori Toy Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-900 shadow-clay">
                  <FlatClayCube size={22} color="indigo" />
                  <span className="font-display font-black text-xl text-indigo-900">{cubeLayersCount[0]} (dưới)</span>
                </div>
                <span className="font-black text-xl text-indigo-500">+</span>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-900 shadow-clay">
                  <FlatClayCube size={22} color="purple" />
                  <span className="font-display font-black text-xl text-purple-900">{cubeLayersCount[1]} (giữa)</span>
                </div>
                <span className="font-black text-xl text-purple-500">+</span>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-pink-50 border-2 border-pink-200 text-pink-900 shadow-clay">
                  <FlatClayCube size={22} color="pink" />
                  <span className="font-display font-black text-xl text-pink-900">{cubeLayersCount[2]} (trên)</span>
                </div>
                <span className="font-black text-xl text-indigo-500">=</span>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-brand-500 text-white font-black text-2xl shadow-clay border-2 border-brand-600">
                  <span className="font-display font-black text-2xl text-white">{cubeLayersCount[0] + cubeLayersCount[1] + cubeLayersCount[2]}</span>
                  <FlatClayCube size={24} color="rose" className="animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 10. COLUMN ARITHMETIC MANIPULATOR (BẢNG ĐẶT TÍNH CỘT DỌC MONTESSORI SOFT CLAY) ── */}
        {(lesson.visualType === 'column_add' || lesson.visualType === 'column_sub') && (
          <div className="w-full max-w-lg space-y-4">
            {/* Header / Sub-title & Active Slot Guide */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-2xl border-2 border-brand-200 shadow-2xs text-xs">
              <span className="font-black text-brand-900 flex items-center gap-1.5">
                <span>🧮</span>
                <span>Bảng Đặt Tính Cột Dọc Montessori Điền Ô Trống</span>
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                {lesson.visualType === 'column_add' ? 'Phép Cộng Có Nhớ' : 'Phép Trừ Có Mượn'}
              </span>
            </div>

            {/* Giant Montessori Calculation Board */}
            <div
              className={cn(
                'p-5 sm:p-6 rounded-3xl border-2 shadow-clay flex flex-col items-center justify-center space-y-4 relative overflow-hidden transition-all',
                lesson.visualType === 'column_add'
                  ? 'bg-gradient-to-b from-rose-50/90 via-pink-50/50 to-amber-50/60 border-rose-200'
                  : 'bg-gradient-to-b from-amber-50/90 via-orange-50/50 to-sun-50/60 border-amber-200',
              )}
            >
              {/* Carry / Borrow Glow Indicator Badge */}
              <div className="flex items-center justify-center min-h-6">
                {lesson.visualType === 'column_add' ? (
                  (currentChallengeIdx === 0 && columnCarryA + 7 >= 10) ||
                  (currentChallengeIdx === 1 && columnCarryA + 8 >= 10) ||
                  (currentChallengeIdx === 2 && 9 + columnCarryB >= 10) ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs shadow-clay animate-bounce">
                      ✨ Nhớ 1 sang hàng chục!
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">
                      💡 Chạm vào ô trống để điền chữ số 0..9
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs shadow-clay">
                    💥 Mượn 1 chục ($10$) từ hàng chục
                  </span>
                )}
              </div>

              {/* Grid Column Calculations */}
              <div className="font-mono flex flex-col items-center justify-center space-y-2 select-none">
                {/* ── ROW 1 (TOP NUMBER) ── */}
                <div className="flex items-center justify-end gap-3 w-48 sm:w-56 pr-2">
                  {/* Tens Digit */}
                  {lesson.visualType === 'column_add' ? (
                    currentChallengeIdx === 2 ? (
                      /* Challenge 3: Top tens is box A */
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400 mb-0.5">Hàng chục</span>
                        <button
                          type="button"
                          onClick={() => setActiveCarrySlot('A')}
                          className={cn(
                            'size-14 sm:size-16 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-all cursor-pointer shadow-clay',
                            activeCarrySlot === 'A'
                              ? 'bg-brand-500 text-white border-brand-600 ring-4 ring-brand-200 scale-105 animate-pulse'
                              : 'bg-white text-brand-800 border-brand-300 hover:bg-brand-50',
                          )}
                        >
                          {columnCarryA}
                        </button>
                      </div>
                    ) : (
                      /* Challenge 1: 4 | Challenge 2: 5 */
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400 mb-0.5">Hàng chục</span>
                        <div className="size-14 sm:size-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-800 shadow-2xs">
                          {currentChallengeIdx === 0 ? '4' : '5'}
                        </div>
                      </div>
                    )
                  ) : (
                    /* column_sub: Challenge 1: 6 | Challenge 2: 7 | Challenge 3: 8 */
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-sans font-bold text-slate-400 mb-0.5">Hàng chục</span>
                      <div className="size-14 sm:size-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-800 shadow-2xs">
                        {currentChallengeIdx === 0 ? '6' : currentChallengeIdx === 1 ? '7' : '8'}
                      </div>
                    </div>
                  )}

                  {/* Units Digit */}
                  {lesson.visualType === 'column_add' ? (
                    currentChallengeIdx === 2 ? (
                      /* Challenge 3: Top unit is static 9 */
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400 mb-0.5">Đơn vị</span>
                        <div className="size-14 sm:size-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-800 shadow-2xs">
                          9
                        </div>
                      </div>
                    ) : (
                      /* Challenge 1 & 2: Top unit is box A */
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400 mb-0.5">Đơn vị</span>
                        <button
                          type="button"
                          onClick={() => setActiveCarrySlot('A')}
                          className={cn(
                            'size-14 sm:size-16 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-all cursor-pointer shadow-clay',
                            activeCarrySlot === 'A'
                              ? 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-200 scale-105 animate-pulse'
                              : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50',
                          )}
                        >
                          {columnCarryA}
                        </button>
                      </div>
                    )
                  ) : (
                    /* column_sub */
                    currentChallengeIdx === 2 ? (
                      /* Challenge 3: Top unit is box A */
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400 mb-0.5">Đơn vị</span>
                        <button
                          type="button"
                          onClick={() => setActiveCarrySlot('A')}
                          className={cn(
                            'size-14 sm:size-16 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-all cursor-pointer shadow-clay',
                            activeCarrySlot === 'A'
                              ? 'bg-amber-500 text-white border-amber-600 ring-4 ring-amber-200 scale-105 animate-pulse'
                              : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50',
                          )}
                        >
                          {columnCarryA}
                        </button>
                      </div>
                    ) : (
                      /* Challenge 1: 3 | Challenge 2: 2 */
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-sans font-bold text-slate-400 mb-0.5">Đơn vị</span>
                        <div className="size-14 sm:size-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-800 shadow-2xs">
                          {currentChallengeIdx === 0 ? '3' : '2'}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* ── ROW 2 (OPERATOR + BOTTOM NUMBER) ── */}
                <div className="flex items-center justify-end gap-3 w-48 sm:w-56 pr-2 relative">
                  {/* Operator Symbol (+ or −) */}
                  <span
                    className={cn(
                      'font-black text-3xl sm:text-4xl absolute -left-2 top-2',
                      lesson.visualType === 'column_add' ? 'text-rose-500' : 'text-amber-500',
                    )}
                  >
                    {lesson.visualType === 'column_add' ? '+' : '−'}
                  </span>

                  {/* Tens Digit */}
                  {lesson.visualType === 'column_add' ? (
                    currentChallengeIdx === 0 ? (
                      /* Challenge 1: Bottom tens is box B */
                      <button
                        type="button"
                        onClick={() => setActiveCarrySlot('B')}
                        className={cn(
                          'size-14 sm:size-16 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-all cursor-pointer shadow-clay',
                          activeCarrySlot === 'B'
                            ? 'bg-brand-500 text-white border-brand-600 ring-4 ring-brand-200 scale-105 animate-pulse'
                            : 'bg-white text-brand-800 border-brand-300 hover:bg-brand-50',
                        )}
                      >
                        {columnCarryB}
                      </button>
                    ) : (
                      /* Challenge 2: 2 | Challenge 3: 3 */
                      <div className="size-14 sm:size-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-800 shadow-2xs">
                        {currentChallengeIdx === 1 ? '2' : '3'}
                      </div>
                    )
                  ) : (
                    /* column_sub */
                    currentChallengeIdx === 1 ? (
                      /* Challenge 2: Bottom tens is box A */
                      <button
                        type="button"
                        onClick={() => setActiveCarrySlot('A')}
                        className={cn(
                          'size-14 sm:size-16 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-all cursor-pointer shadow-clay',
                          activeCarrySlot === 'A'
                            ? 'bg-amber-500 text-white border-amber-600 ring-4 ring-amber-200 scale-105 animate-pulse'
                            : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50',
                        )}
                      >
                        {columnCarryA}
                      </button>
                    ) : (
                      /* Challenge 1: 2 | Challenge 3: 4 */
                      <div className="size-14 sm:size-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-800 shadow-2xs">
                        {currentChallengeIdx === 0 ? '2' : '4'}
                      </div>
                    )
                  )}

                  {/* Units Digit */}
                  {lesson.visualType === 'column_add' ? (
                    currentChallengeIdx === 2 ? (
                      /* Challenge 3: Bottom unit is box B */
                      <button
                        type="button"
                        onClick={() => setActiveCarrySlot('B')}
                        className={cn(
                          'size-14 sm:size-16 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-all cursor-pointer shadow-clay',
                          activeCarrySlot === 'B'
                            ? 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-200 scale-105 animate-pulse'
                            : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50',
                        )}
                      >
                        {columnCarryB}
                      </button>
                    ) : (
                      /* Challenge 1: 7 | Challenge 2: 8 */
                      <div className="size-14 sm:size-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-800 shadow-2xs">
                        {currentChallengeIdx === 0 ? '7' : '8'}
                      </div>
                    )
                  ) : (
                    /* column_sub: Challenge 1: 8 | Challenge 2: 7 | Challenge 3: 7 */
                    <div className="size-14 sm:size-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-800 shadow-2xs">
                      {currentChallengeIdx === 0 ? '8' : '7'}
                    </div>
                  )}
                </div>

                {/* ── ROW 3 (SOFT CLAY HORIZONTAL LINE) ── */}
                <div className="w-52 sm:w-60 h-1.5 rounded-full bg-slate-800 my-1 shadow-xs" />

                {/* ── ROW 4 (RESULT ROW) ── */}
                <div className="flex items-center justify-end gap-3 w-48 sm:w-56 pr-2">
                  {lesson.visualType === 'column_add' ? (
                    /* Target Sum: 85 (C1), 84 (C2), 92 (C3) */
                    <div className="flex items-center gap-3">
                      <div className="size-14 sm:size-16 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center font-black text-2xl sm:text-3xl text-emerald-800 shadow-clay">
                        {currentChallengeIdx === 0 ? '8' : currentChallengeIdx === 1 ? '8' : '9'}
                      </div>
                      <div className="size-14 sm:size-16 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center font-black text-2xl sm:text-3xl text-emerald-800 shadow-clay">
                        {currentChallengeIdx === 0 ? '5' : currentChallengeIdx === 1 ? '4' : '2'}
                      </div>
                    </div>
                  ) : (
                    /* column_sub */
                    currentChallengeIdx === 0 ? (
                      /* Challenge 1: Result tens is box A, unit is box B */
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveCarrySlot('A')}
                          className={cn(
                            'size-14 sm:size-16 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-all cursor-pointer shadow-clay',
                            activeCarrySlot === 'A'
                              ? 'bg-amber-500 text-white border-amber-600 ring-4 ring-amber-200 scale-105 animate-pulse'
                              : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50',
                          )}
                        >
                          {columnCarryA}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCarrySlot('B')}
                          className={cn(
                            'size-14 sm:size-16 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-all cursor-pointer shadow-clay',
                            activeCarrySlot === 'B'
                              ? 'bg-amber-500 text-white border-amber-600 ring-4 ring-amber-200 scale-105 animate-pulse'
                              : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50',
                          )}
                        >
                          {columnCarryB}
                        </button>
                      </div>
                    ) : (
                      /* Challenge 2: 35 | Challenge 3: 34 */
                      <div className="flex items-center gap-3">
                        <div className="size-14 sm:size-16 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center font-black text-2xl sm:text-3xl text-emerald-800 shadow-clay">
                          3
                        </div>
                        <div className="size-14 sm:size-16 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center font-black text-2xl sm:text-3xl text-emerald-800 shadow-clay">
                          {currentChallengeIdx === 1 ? '5' : '4'}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Interactive Digit Stepper & Touchpad */}
              <div className="w-full bg-white/90 p-3 rounded-2xl border border-slate-200 space-y-2 text-center">
                <div className="flex items-center justify-between px-1 text-xs font-black text-slate-700">
                  <span>Chọn số cho ô {activeCarrySlot === 'A' ? 'Ô [ ? ] (A)' : 'Ô [ ? ] (B)'}:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeCarrySlot === 'A') setColumnCarryA((prev) => (prev > 0 ? prev - 1 : 9))
                        else setColumnCarryB((prev) => (prev > 0 ? prev - 1 : 9))
                      }}
                      className="size-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center cursor-pointer active:scale-90"
                    >
                      <Minus className="size-3.5 stroke-[3]" />
                    </button>
                    <span className="w-6 text-center font-mono font-black text-sm text-brand-900">
                      {activeCarrySlot === 'A' ? columnCarryA : columnCarryB}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeCarrySlot === 'A') setColumnCarryA((prev) => (prev < 9 ? prev + 1 : 0))
                        else setColumnCarryB((prev) => (prev < 9 ? prev + 1 : 0))
                      }}
                      className="size-7 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black flex items-center justify-center cursor-pointer active:scale-90"
                    >
                      <Plus className="size-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* 0..9 Quick Pick Buttons */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5 justify-items-center">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                    const currentVal = activeCarrySlot === 'A' ? columnCarryA : columnCarryB
                    const isSelected = currentVal === digit

                    return (
                      <button
                        key={`col-digit-${digit}`}
                        type="button"
                        onClick={() => {
                          if (activeCarrySlot === 'A') setColumnCarryA(digit)
                          else setColumnCarryB(digit)
                        }}
                        className={cn(
                          'size-8 sm:size-9 rounded-xl font-mono font-black text-sm flex items-center justify-center transition-all cursor-pointer border-2 active:scale-90 select-none',
                          isSelected
                            ? 'bg-brand-500 text-white border-brand-600 shadow-clay scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                        )}
                      >
                        {digit}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Calculation Status Summary Card */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 text-center shadow-clay space-y-1">
              <div className="text-xs font-black text-slate-800">
                {lesson.visualType === 'column_add' ? (
                  currentChallengeIdx === 0 ? (
                    <span>Phép tính đang tạo: <strong className="text-rose-600">4{columnCarryA}</strong> + <strong className="text-brand-600">{columnCarryB}7</strong> = <strong className="text-emerald-700">{40 + columnCarryA + columnCarryB * 10 + 7}</strong> (Mục tiêu: 85)</span>
                  ) : currentChallengeIdx === 1 ? (
                    <span>Phép tính đang tạo: <strong className="text-rose-600">5{columnCarryA}</strong> + 28 = <strong className="text-emerald-700">{50 + columnCarryA + 28}</strong> (Mục tiêu: 84)</span>
                  ) : (
                    <span>Phép tính đang tạo: <strong className="text-brand-600">{columnCarryA}9</strong> + <strong className="text-rose-600">3{columnCarryB}</strong> = <strong className="text-emerald-700">{columnCarryA * 10 + 9 + 30 + columnCarryB}</strong> (Mục tiêu: 92)</span>
                  )
                ) : (
                  currentChallengeIdx === 0 ? (
                    <span>Phép tính: 63 − 28 = <strong className="text-amber-700">{columnCarryA}{columnCarryB}</strong> (Mục tiêu: 35)</span>
                  ) : currentChallengeIdx === 1 ? (
                    <span>Phép tính: 72 − <strong className="text-amber-700">{columnCarryA}7</strong> = <strong className="text-emerald-700">{72 - (columnCarryA * 10 + 7)}</strong> (Mục tiêu: 35)</span>
                  ) : (
                    <span>Phép tính: <strong className="text-amber-700">8{columnCarryA}</strong> − 47 = <strong className="text-emerald-700">{80 + columnCarryA - 47}</strong> (Mục tiêu: 34)</span>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 11. FALLBACK FOR OTHER VISUAL TYPES ── */}
        {lesson.visualType !== 'apple_drop' &&
          lesson.visualType !== 'balloon_pop' &&
          lesson.visualType !== 'cake_tray' &&
          lesson.visualType !== 'candy_division' &&
          lesson.visualType !== 'div_remainder' &&
          lesson.visualType !== 'pizza_fraction' &&
          lesson.visualType !== 'compare_fractions' &&
          lesson.visualType !== 'fraction_add_sub' &&
          lesson.visualType !== 'fraction_of_number' &&
          lesson.visualType !== 'analog_clock' &&
          lesson.visualType !== 'elapsed_time' &&
          lesson.visualType !== 'make10' &&
          lesson.visualType !== 'balance_scale' &&
          lesson.visualType !== 'column_add' &&
          lesson.visualType !== 'column_sub' &&
          lesson.visualType !== 'cube_3d' && (
            <div className="w-full max-w-md space-y-4 text-center">
              <span className="text-6xl animate-bounce select-none">{lesson.icon}</span>
              <h3 className="text-base font-extrabold text-slate-800">
                <AsmoFormula text={lesson.theory.title} className="inline" />
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-sm mx-auto">
                <AsmoFormula text={currentChallenge.instruction} />
              </p>
            </div>
          )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3. CHECK RESULT BUTTON & DIAGNOSTIC FEEDBACK BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Buttons Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleResetChallenge}
            className="gap-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 font-extrabold px-5 py-3 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="size-4 text-slate-500" />
            <span>⟳ Đặt lại thao tác</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleCheckChallenge}
            className="gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold shadow-clay px-8 py-3.5 text-sm sm:text-base cursor-pointer active:scale-95 transition-all"
          >
            <CheckCircle2 className="size-5" />
            <span>Kiểm Tra Kết Quả Thử Thách</span>
          </Button>
        </div>

        {/* Dynamic Verification Result Banner (Only shown AFTER child clicks check) */}
        {practiceFeedback && (
          <div className="animate-in zoom-in-95 duration-200">
            {practiceFeedback.isCorrect ? (
              /* Success Banner */
              <div className="rounded-3xl bg-mint-50 border-2 border-mint-200 p-5 sm:p-6 text-center space-y-3.5 shadow-clay">
                <div className="flex items-center justify-center gap-2">
                  <AikidCatCharacter pose="celebrate" className="size-16 drop-shadow-sm" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-mint-950">
                    🎉 XUẤT SẮC BÉ ƠI! BẠN ĐÃ VƯỢT QUA THỬ THÁCH {currentChallengeIdx + 1}!
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-mint-900 mt-1">
                    <AsmoFormula text={practiceFeedback.feedback} />
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                  {currentChallengeIdx < challenges.length - 1 ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleNextChallenge}
                      className="gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold shadow-clay px-6 py-3 cursor-pointer"
                    >
                      <span>Tiếp Tục Thử Thách {currentChallengeIdx + 2}/3</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={onAdvanceToQuiz}
                      className="gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold shadow-clay px-7 py-3 cursor-pointer animate-pop"
                    >
                      <Trophy className="size-5 text-amber-200" />
                      <span>🎉 Hoàn Thành Thực Hành ➔ Vào Thử Tài Olympic</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Diagnostic Feedback Banner (Helpful guidance) */
              <div className="rounded-3xl bg-amber-50 border-2 border-amber-300 p-5 text-center space-y-3 shadow-xs">
                <div className="flex items-center justify-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                  <AikidCatCharacter pose="thinking" className="size-12 drop-shadow-sm" />
                  <span>💡 Mèo Mee Hướng Dẫn Bé:</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-amber-950 leading-relaxed max-w-md mx-auto">
                  <AsmoFormula text={practiceFeedback.feedback} />
                </p>
                <div className="pt-1">
                  <span className="text-[11px] font-extrabold text-amber-800 bg-amber-200/80 px-3 py-1 rounded-full">
                    🐾 Bé hãy điều chỉnh các nút bấm ở trên rồi bấm &quot;Kiểm Tra Kết Quả&quot; lại nhé!
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
