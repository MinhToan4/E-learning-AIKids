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
import { AikidCatCharacter, type AikidCatPose } from '@/shared/components/ui/AikidCatCharacter'
import { renderClockSvg, renderBalanceScaleSvg } from './AsmoDiagramEngine'
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
  const [rectWidth, setRectWidth] = useState<number>(4)
  const [rectHeight, setRectHeight] = useState<number>(3)
  const [cubeLayersCount, setCubeLayersCount] = useState<number[]>([4, 2, 1])
  const [matchstickSquares, setMatchstickSquares] = useState<number>(3)
  const [gridMazeDim, setGridMazeDim] = useState<{ rows: number; cols: number }>({ rows: 2, cols: 2 })
  const [selectedNetFace, setSelectedNetFace] = useState<number | null>(null)
  const [symbolSign, setSymbolSign] = useState<string | null>(null)
  const [numericAnswer, setNumericAnswer] = useState<number>(0)

  const currentChallenge = challenges[currentChallengeIdx] || challenges[0]

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
      setColumnCarryA(typeof init.columnCarryA === 'number' ? init.columnCarryA : 5)
      setColumnCarryB(typeof init.columnCarryB === 'number' ? init.columnCarryB : 3)
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
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                Thử thách {currentChallengeIdx + 1}/{challenges.length}: {currentChallenge.title}
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
                  <span>{c.levelLabel.split(':')[0]}</span>
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
          <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
            <AsmoFormula text={currentChallenge.instruction} />
          </p>
          {currentChallenge.hint && (
            <p className="text-xs font-semibold text-slate-500 pt-0.5">
              💡 Gợi ý của Mee: <AsmoFormula text={currentChallenge.hint} />
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. HANDS-ON INTERACTIVE MANIPULATIVE CONTROLLER (BỘ ĐIỀU KHIỂN THỰC TẾ)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl bg-slate-50 border-2 border-slate-200 p-5 sm:p-6 flex flex-col items-center justify-center space-y-5 min-h-[300px]">
        {/* ── 1. APPLE DROP MANIPULATOR ── */}
        {lesson.visualType === 'apple_drop' && (
          <div className="w-full max-w-xl space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Basket A: Red Apples */}
              <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 flex flex-col items-center space-y-3 shadow-xs">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-rose-900">
                    Giỏ A (Táo Đỏ): <span className="text-sm text-rose-600 font-extrabold">{applesA}</span> quả
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Bớt táo đỏ giỏ A"
                      onClick={() => setApplesA((prev) => (prev > 0 ? prev - 1 : 0))}
                      className="size-8 rounded-xl bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 font-black flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <Minus className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Thêm táo đỏ giỏ A"
                      onClick={() => setApplesA((prev) => (prev < 10 ? prev + 1 : 10))}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="size-3.5" />
                      <span>🍎 Thêm</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-16 p-3 bg-white/90 rounded-2xl w-full border border-rose-200">
                  {applesA === 0 ? (
                    <span className="text-xs font-bold text-slate-400 italic">Giỏ đang trống</span>
                  ) : (
                    Array.from({ length: applesA }).map((_, i) => (
                      <span key={`apple-a-${i}`} className="text-2xl animate-in zoom-in-50 select-none">
                        🍎
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Basket B: Green Apples */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-4 flex flex-col items-center space-y-3 shadow-xs">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-emerald-900">
                    Giỏ B (Táo Xanh): <span className="text-sm text-emerald-600 font-extrabold">{applesB}</span> quả
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Bớt táo xanh giỏ B"
                      onClick={() => setApplesB((prev) => (prev > 0 ? prev - 1 : 0))}
                      className="size-8 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-black flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    >
                      <Minus className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Thêm táo xanh giỏ B"
                      onClick={() => setApplesB((prev) => (prev < 10 ? prev + 1 : 10))}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="size-3.5" />
                      <span>🍏 Thêm</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-16 p-3 bg-white/90 rounded-2xl w-full border border-emerald-200">
                  {applesB === 0 ? (
                    <span className="text-xs font-bold text-slate-400 italic">Giỏ đang trống</span>
                  ) : (
                    Array.from({ length: applesB }).map((_, i) => (
                      <span key={`apple-b-${i}`} className="text-2xl animate-in zoom-in-50 select-none">
                        🍏
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Math Formula Display */}
            <div className="bg-gradient-to-r from-rose-50 via-white to-emerald-50 border-2 border-brand-300 rounded-2xl p-4 text-center shadow-xs">
              <span className="font-display font-black text-slate-800 text-base sm:text-lg">
                {applesA} quả đỏ 🍎 + {applesB} quả xanh 🍏 ={' '}
                <span className="text-brand-600 font-black underline decoration-brand-400 decoration-2">
                  {applesA + applesB} quả táo
                </span>{' '}
                tổng cộng
              </span>
            </div>
          </div>
        )}

        {/* ── 2. BALLOON POP MANIPULATOR ── */}
        {lesson.visualType === 'balloon_pop' && (
          <div className="w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-600">
                Bấm trực tiếp vào bóng để làm nổ 💥 hoặc khôi phục 🎈
              </span>
              <button
                type="button"
                onClick={() => setPoppedBalloons([])}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Bơm lại</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3 p-4 bg-sky-50/60 rounded-3xl border-2 border-sky-200 justify-items-center">
              {Array.from({ length: 10 }).map((_, idx) => {
                const id = idx + 1
                const isPopped = poppedBalloons.includes(id)
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
                      'size-14 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-2 select-none active:scale-90',
                      isPopped
                        ? 'bg-slate-200/80 border-slate-300 text-slate-400 opacity-50 scale-90'
                        : 'bg-gradient-to-b from-sky-400 to-sky-600 hover:from-sky-300 hover:to-sky-500 border-sky-300 text-white shadow-clay scale-100',
                    )}
                  >
                    <span className="text-2xl">{isPopped ? '💥' : '🎈'}</span>
                    <span className="text-[10px] font-black">{id}</span>
                  </button>
                )
              })}
            </div>

            <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-3.5 text-center font-display font-extrabold text-sky-950 text-base">
              10 (ban đầu) − {poppedBalloons.length} (nổ mất) ={' '}
              <span className="text-sky-600 font-black underline">{10 - poppedBalloons.length} quả bóng</span> còn lại
            </div>
          </div>
        )}

        {/* ── 3. CAKE TRAY MANIPULATOR ── */}
        {lesson.visualType === 'cake_tray' && (
          <div className="w-full max-w-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-2xl border-2 border-amber-200">
              {/* Row Adjuster */}
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-700">Số Hàng:</span>
                <button
                  type="button"
                  aria-label="Bớt hàng bánh"
                  onClick={() => setCakeRows((r) => (r > 1 ? r - 1 : 1))}
                  className="size-8 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-black text-amber-800 text-base px-1.5">{cakeRows}</span>
                <button
                  type="button"
                  aria-label="Thêm hàng bánh"
                  onClick={() => setCakeRows((r) => (r < 6 ? r + 1 : 6))}
                  className="size-8 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Col Adjuster */}
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-700">Số Cột:</span>
                <button
                  type="button"
                  aria-label="Bớt cột bánh"
                  onClick={() => setCakeCols((c) => (c > 1 ? c - 1 : 1))}
                  className="size-8 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-black text-emerald-800 text-base px-1.5">{cakeCols}</span>
                <button
                  type="button"
                  aria-label="Thêm cột bánh"
                  onClick={() => setCakeCols((c) => (c < 6 ? c + 1 : 6))}
                  className="size-8 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tray Matrix */}
            <div
              className="grid gap-2 justify-center p-4 bg-amber-50/70 rounded-3xl border-2 border-amber-300"
              style={{ gridTemplateColumns: `repeat(${cakeCols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cakeRows }).map((_, r) =>
                Array.from({ length: cakeCols }).map((_, c) => (
                  <div
                    key={`practice-cake-${r}-${c}`}
                    className="size-12 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-2xl shadow-xs animate-in zoom-in-50 select-none"
                  >
                    🍰
                  </div>
                )),
              )}
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 text-center font-display font-extrabold text-amber-950 text-base">
              {cakeRows} hàng × {cakeCols} cột ={' '}
              <span className="text-amber-700 font-black underline">{cakeRows * cakeCols} chiếc bánh</span> thơm ngon
            </div>
          </div>
        )}

        {/* ── 4. CANDY DIVISION MANIPULATOR ── */}
        {(lesson.visualType === 'candy_division' || lesson.visualType === 'div_remainder') && (
          <div className="w-full max-w-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-2xl border-2 border-brand-200">
              {/* Candies Adjuster */}
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-700">Số kẹo 🍬:</span>
                <button
                  type="button"
                  onClick={() => setCandyTotal((t) => (t > 6 ? t - 1 : 6))}
                  className="size-8 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-black text-rose-800 text-base px-1">{candyTotal}</span>
                <button
                  type="button"
                  onClick={() => setCandyTotal((t) => (t < 24 ? t + 1 : 24))}
                  className="size-8 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Plates Adjuster */}
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-700">Số đĩa 🍽️:</span>
                <button
                  type="button"
                  onClick={() => setCandyPlates((p) => (p > 2 ? p - 1 : 2))}
                  className="size-8 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-black text-brand-800 text-base px-1">{candyPlates}</span>
                <button
                  type="button"
                  onClick={() => setCandyPlates((p) => (p < 5 ? p + 1 : 5))}
                  className="size-8 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Plates Rendering */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-center">
              {Array.from({ length: candyPlates }).map((_, plateIdx) => {
                const candiesPerPlate = Math.floor(candyTotal / candyPlates)
                return (
                  <div
                    key={`prac-plate-${plateIdx}`}
                    className="bg-white border-2 border-brand-200 rounded-3xl p-3 flex flex-col items-center space-y-2 shadow-xs"
                  >
                    <span className="text-xs font-black text-brand-700">Đĩa {plateIdx + 1}</span>
                    <div className="flex items-center justify-center gap-1 flex-wrap min-h-12">
                      {Array.from({ length: candiesPerPlate }).map((_, cIdx) => (
                        <span key={`plate-candy-${cIdx}`} className="text-xl">
                          🍬
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-extrabold text-slate-600">{candiesPerPlate} cái</span>
                  </div>
                )
              })}
            </div>

            {candyTotal % candyPlates !== 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-2 text-center text-xs font-extrabold text-amber-900">
                🍬 Kẹo dư chưa chia: {candyTotal % candyPlates} cái
              </div>
            )}

            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3.5 text-center font-display font-extrabold text-rose-950 text-base">
              {candyTotal} kẹo ÷ {candyPlates} đĩa ={' '}
              <span className="text-rose-700 font-black underline">
                {Math.floor(candyTotal / candyPlates)} kẹo mỗi đĩa
              </span>
              {candyTotal % candyPlates !== 0 && ` (dư ${candyTotal % candyPlates} kẹo)`}
            </div>
          </div>
        )}

        {/* ── 5. PIZZA FRACTION MANIPULATOR ── */}
        {(lesson.visualType === 'pizza_fraction' ||
          lesson.visualType === 'compare_fractions' ||
          lesson.visualType === 'fraction_add_sub' ||
          lesson.visualType === 'fraction_of_number') && (
          <div className="w-full max-w-md space-y-4 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-white p-3 rounded-2xl border-2 border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-700">Số lát cắt:</span>
                {[4, 6, 8, 10].map((num) => (
                  <button
                    key={`slice-btn-${num}`}
                    type="button"
                    onClick={() => {
                      setPizzaSlices(num)
                      if (pizzaShaded > num) setPizzaShaded(num)
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-xl font-black text-xs cursor-pointer border transition-all',
                      pizzaSlices === num
                        ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className="font-extrabold text-slate-700">Đã chọn:</span>
                <button
                  type="button"
                  onClick={() => setPizzaShaded((s) => (s > 0 ? s - 1 : 0))}
                  className="size-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-black"
                >
                  -
                </button>
                <span className="font-black text-emerald-800 text-sm px-1">{pizzaShaded}</span>
                <button
                  type="button"
                  onClick={() => setPizzaShaded((s) => (s < pizzaSlices ? s + 1 : pizzaSlices))}
                  className="size-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-black"
                >
                  +
                </button>
              </div>
            </div>

            {/* Interactive SVG Pizza Pie */}
            <svg viewBox="0 0 160 160" className="size-44 select-none drop-shadow-md cursor-pointer">
              <circle cx="80" cy="80" r="70" fill="#f59e0b" stroke="#78350f" strokeWidth="4" />
              {Array.from({ length: pizzaSlices }).map((_, i) => {
                const startAngle = (i * 360) / pizzaSlices
                const endAngle = ((i + 1) * 360) / pizzaSlices
                const isShaded = i < pizzaShaded

                const x1 = 80 + 66 * Math.cos(((startAngle - 90) * Math.PI) / 180)
                const y1 = 80 + 66 * Math.sin(((startAngle - 90) * Math.PI) / 180)
                const x2 = 80 + 66 * Math.cos(((endAngle - 90) * Math.PI) / 180)
                const y2 = 80 + 66 * Math.sin(((endAngle - 90) * Math.PI) / 180)

                const largeArc = endAngle - startAngle > 180 ? 1 : 0
                const d = `M 80,80 L ${x1},${y1} A 66,66 0 ${largeArc},1 ${x2},${y2} Z`

                return (
                  <path
                    key={`prac-slice-${i}`}
                    d={d}
                    fill={isShaded ? '#ef4444' : '#fef3c7'}
                    stroke="#78350f"
                    strokeWidth="1.5"
                    onClick={() => {
                      if (isShaded) {
                        setPizzaShaded(i)
                      } else {
                        setPizzaShaded(i + 1)
                      }
                    }}
                    className="transition-colors duration-200 hover:opacity-80"
                  />
                )
              })}
              <circle cx="80" cy="80" r="4" fill="#78350f" />
            </svg>

            {lesson.visualType === 'compare_fractions' && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Chọn dấu so sánh:</span>
                {['>', '<', '='].map((sign) => (
                  <button
                    key={sign}
                    type="button"
                    onClick={() => setSymbolSign(sign)}
                    className={cn(
                      'size-9 rounded-xl font-black text-base transition-all cursor-pointer border-2',
                      symbolSign === sign
                        ? 'bg-brand-500 text-white border-brand-500 shadow-clay'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-brand-50',
                    )}
                  >
                    {sign}
                  </button>
                ))}
              </div>
            )}

            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 text-center font-display font-extrabold text-emerald-950 text-base">
              Phân số biểu thị: $\frac{`{${pizzaShaded}}`}{`{${pizzaSlices}}`}$ chiếc bánh pizza
            </div>
          </div>
        )}

        {/* ── 6. ANALOG CLOCK MANIPULATOR ── */}
        {(lesson.visualType === 'analog_clock' || lesson.visualType === 'elapsed_time') && (
          <div className="w-full max-w-md space-y-4 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-white p-3 rounded-2xl border-2 border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-700">Chỉnh Giờ:</span>
                <button
                  type="button"
                  onClick={() => setClockHour((h) => (h > 1 ? h - 1 : 12))}
                  className="size-8 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-black text-sky-800 text-sm px-1.5">{clockHour}h</span>
                <button
                  type="button"
                  onClick={() => setClockHour((h) => (h < 12 ? h + 1 : 1))}
                  className="size-8 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-xl font-black flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="font-extrabold text-slate-700">Chỉnh Phút:</span>
                {[0, 15, 30, 45].map((min) => (
                  <button
                    key={`min-btn-${min}`}
                    type="button"
                    onClick={() => setClockMinute(min)}
                    className={cn(
                      'px-2 py-1 rounded-xl font-black text-xs cursor-pointer border transition-all',
                      clockMinute === min
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
                    )}
                  >
                    {min}p
                  </button>
                ))}
              </div>
            </div>

            <div className="size-44 bg-white rounded-full p-2 shadow-md border-2 border-slate-200 flex items-center justify-center">
              {renderClockSvg(clockHour, clockMinute, { size: 160 })}
            </div>

            <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-3.5 text-center font-display font-extrabold text-sky-950 text-base">
              Thời gian hiển thị: {clockHour}:{clockMinute < 10 ? `0${clockMinute}` : clockMinute}
            </div>
          </div>
        )}

        {/* ── 7. MAKE 10 MANIPULATOR ── */}
        {lesson.visualType === 'make10' && (
          <div className="w-full max-w-md space-y-4">
            <div className="text-center text-xs font-bold text-slate-500">
              Bấm chọn 2 số có tổng bằng 10 để ghép đôi chúng nhé!
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap p-4 bg-purple-50/60 rounded-3xl border-2 border-purple-200">
              {[1, 9, 2, 8, 3, 7, 4, 6, 5, 5].map((num, idx) => {
                const isPaired = pairedMake10.some((p) => p.includes(idx))
                const isSelected = selectedMake10.includes(idx)

                return (
                  <button
                    key={`make10-${idx}`}
                    type="button"
                    onClick={() => {
                      if (isPaired) return
                      if (isSelected) {
                        setSelectedMake10(selectedMake10.filter((i) => i !== idx))
                      } else if (selectedMake10.length === 0) {
                        setSelectedMake10([idx])
                      } else if (selectedMake10.length === 1) {
                        const firstIdx = selectedMake10[0]
                        const firstVal = [1, 9, 2, 8, 3, 7, 4, 6, 5, 5][firstIdx]
                        if (firstVal + num === 10) {
                          setPairedMake10([...pairedMake10, [firstIdx, idx]])
                          setSelectedMake10([])
                        } else {
                          setSelectedMake10([idx])
                        }
                      }
                    }}
                    className={cn(
                      'size-12 rounded-2xl font-black text-base flex items-center justify-center transition-all cursor-pointer border-2 select-none',
                      isPaired
                        ? 'bg-emerald-500 text-white border-emerald-400 opacity-60 shadow-xs'
                        : isSelected
                          ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-300 scale-110 shadow-clay'
                          : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-100 shadow-xs',
                    )}
                  >
                    {num}
                  </button>
                )
              })}
            </div>

            <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-3 text-center font-display font-extrabold text-purple-950 text-sm">
              Đã ghép: {pairedMake10.length} cặp tròn 10
            </div>
          </div>
        )}

        {/* ── 8. BALANCE SCALE MANIPULATOR ── */}
        {lesson.visualType === 'balance_scale' && (
          <div className="w-full max-w-md space-y-4 flex flex-col items-center">
            <div className="flex items-center gap-4 text-xs bg-white p-3 rounded-2xl border-2 border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-700">Đĩa Trái (Dưa 🍉):</span>
                <span className="font-black text-emerald-800 text-sm">{scaleLeft} quả</span>
              </div>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="font-extrabold text-slate-700">Đĩa Phải (Táo 🍎):</span>
                <button
                  type="button"
                  onClick={() => setScaleRight((r) => (r > 1 ? r - 1 : 1))}
                  className="size-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-black"
                >
                  -
                </button>
                <span className="font-black text-rose-800 text-sm px-1">{scaleRight}</span>
                <button
                  type="button"
                  onClick={() => setScaleRight((r) => (r < 12 ? r + 1 : 12))}
                  className="size-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-black"
                >
                  +
                </button>
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
          </div>
        )}

        {/* ── 9. FALLBACK FOR OTHER VISUAL TYPES ── */}
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
          lesson.visualType !== 'balance_scale' && (
            <div className="w-full max-w-md space-y-4 text-center">
              <span className="text-6xl animate-bounce select-none">{lesson.icon}</span>
              <h3 className="text-base font-extrabold text-slate-800">{lesson.theory.title}</h3>
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
            className="gap-2 rounded-2xl bg-white border-slate-300 text-slate-700 font-bold px-5 py-3 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="size-4 text-slate-500" />
            <span>⟳ Đặt lại thao tác</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleCheckChallenge}
            className="gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-clay px-8 py-3.5 text-sm sm:text-base cursor-pointer active:scale-95"
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
              <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-400 p-5 sm:p-6 text-center space-y-3.5 shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <AikidCatCharacter pose="celebrate" className="size-16 drop-shadow-sm" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950">
                    🎉 XUẤT SẮC BÉ ƠI! BẠN ĐÃ VƯỢT QUA THỬ THÁCH {currentChallengeIdx + 1}!
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-emerald-800 mt-1">
                    <AsmoFormula text={practiceFeedback.feedback} />
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                  {currentChallengeIdx < challenges.length - 1 ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleNextChallenge}
                      className="gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-clay px-6 py-3 cursor-pointer"
                    >
                      <span>Tiếp Tục Thử Thách {currentChallengeIdx + 2}/3</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={onAdvanceToQuiz}
                      className="gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black shadow-clay px-7 py-3 cursor-pointer"
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
