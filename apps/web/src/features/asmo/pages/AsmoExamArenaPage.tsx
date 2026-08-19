import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Sparkles,
  HelpCircle,
  Layers,
} from 'lucide-react'
import { ASMO_SAMPLE_EXAMS } from '../data/asmo-sample-exams'
import type { AsmoVisualSpec } from '../types'
import { AsmoThreeViewer } from '../components/AsmoThreeViewer'
import { AsmoQuestionCard } from '../components/AsmoQuestionCard'
import { AsmoExamTimer } from '../components/AsmoExamTimer'
import { AsmoMeeTutor } from '../components/AsmoMeeTutor'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export function AsmoExamArenaPage() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()

  const exam = useMemo(() => {
    return ASMO_SAMPLE_EXAMS.find((e) => e.id === examId) || ASMO_SAMPLE_EXAMS[0]
  }, [examId])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const currentQuestion = exam.questions[currentIndex]

  useEffect(() => {
    setActiveStepIndex(0)
  }, [currentIndex])

  const currentStepData = currentQuestion.explanationSteps?.[activeStepIndex]
  const dynamicSpec: AsmoVisualSpec | undefined = currentQuestion.renderSpec ? {
    ...currentQuestion.renderSpec,
    activePathIndex: activeStepIndex,
    explanationStep: currentStepData?.layerIndex !== undefined ? currentStepData.layerIndex : activeStepIndex,
    customPathPoints: currentStepData?.points,
    hour: currentStepData?.hour !== undefined ? currentStepData.hour : currentQuestion.renderSpec.hour,
    minute: currentStepData?.minute !== undefined ? currentStepData.minute : currentQuestion.renderSpec.minute,
    shadedSlices: currentStepData?.shadedCount !== undefined ? currentStepData.shadedCount : currentQuestion.renderSpec.shadedSlices,
  } : undefined

  const handleAnswer = (optionId: string) => {
    if (isSubmitted) return
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }))
  }

  const answeredCount = Object.keys(answers).length
  const totalCount = exam.questions.length

  // Calculate score upon submission
  const results = useMemo(() => {
    let score = 0
    let correctCount = 0

    exam.questions.forEach((q) => {
      const userAns = answers[q.id]
      if (userAns === q.correctAnswer) {
        score += q.points
        correctCount++
      }
    })

    const scorePct = Math.round((score / exam.totalPoints) * 100)
    const isPassed = scorePct >= exam.passScore

    return { score, correctCount, scorePct, isPassed }
  }, [exam, answers])

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const handleRetake = () => {
    setAnswers({})
    setIsSubmitted(false)
    setCurrentIndex(0)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ── TOP HEADER BAR ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/80 bg-white/90 p-4 sm:p-5 shadow-clay backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            to="/asmo"
            className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-extrabold text-brand-700">
                {exam.code}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {exam.round} · {exam.year}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
              {exam.title}
            </h1>
          </div>
        </div>

        {/* Timer & Action */}
        <div className="flex items-center gap-3">
          {!isSubmitted && (
            <AsmoExamTimer
              durationMinutes={exam.durationMinutes}
              onTimeUp={handleSubmit}
            />
          )}

          {!isSubmitted ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="gap-2 rounded-2xl px-5 font-bold shadow-md"
            >
              <Send className="size-4" />
              <span>Nộp bài ({answeredCount}/{totalCount})</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={handleRetake}
              className="gap-2 rounded-2xl border border-brand-200 bg-brand-50 text-brand-700 font-bold"
            >
              <RotateCcw className="size-4" />
              <span>Làm lại đề này</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── EXAM BODY / RESULTS ── */}
      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question & 3D Area (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Embedded 3D Viewer if Question has RenderSpec */}
            {dynamicSpec && (
              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-2 shadow-2xl">
                <AsmoThreeViewer
                  key={currentQuestion.id}
                  spec={dynamicSpec}
                  height={320}
                  interactive
                  onPathChange={(newPath) => setActiveStepIndex(newPath)}
                />
              </div>
            )}

            {/* Question Card */}
            <AsmoQuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionIndex={currentIndex}
              totalQuestions={totalCount}
              selectedAnswer={answers[currentQuestion.id] || null}
              onSelectAnswer={handleAnswer}
              showSolutionImmediately={false}
              activeInteractiveStep={activeStepIndex}
              onInteractiveStepChange={setActiveStepIndex}
              onNext={
                currentIndex < totalCount - 1
                  ? () => setCurrentIndex((prev) => prev + 1)
                  : undefined
              }
            />

            {/* Prev / Next Bottom Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="gap-1.5 rounded-2xl font-bold"
              >
                <ChevronLeft className="size-4" />
                <span>Câu trước</span>
              </Button>

              <span className="text-xs font-bold text-slate-500">
                Câu {currentIndex + 1} / {totalCount}
              </span>

              <Button
                type="button"
                variant="secondary"
                disabled={currentIndex === totalCount - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="gap-1.5 rounded-2xl font-bold"
              >
                <span>Câu sau</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Right Sidebar: Question Palette & Mee Tutor (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Question Navigation Grid */}
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-clay backdrop-blur-md">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Bảng Điều Hướng Câu Hỏi
                </span>
                <span className="text-xs font-bold text-brand-600">
                  {answeredCount}/{totalCount} đã làm
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex
                  const isDone = Boolean(answers[q.id])

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        'flex size-10 items-center justify-center rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer',
                        isCurrent
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-400'
                          : isDone
                            ? 'bg-mint-100 text-mint-800 border border-mint-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200',
                      )}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-brand-600" /> Đang xem
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-mint-400" /> Đã chọn
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-slate-300" /> Chưa làm
                </span>
              </div>
            </div>

            {/* Mèo Mee Live Proctor */}
            <AsmoMeeTutor
              pose={answeredCount === totalCount ? 'celebrate' : 'thinking'}
              speech={
                answeredCount === 0
                  ? 'Chào mừng con đến với Đấu Trường Olympic ASMO! Hãy đọc kỹ từng câu và tự tin làm bài nhé!'
                  : answeredCount === totalCount
                    ? `Tuyệt vời! Con đã trả lời đủ ${totalCount}/${totalCount} câu hỏi. Hãy rà soát lại kỹ lưỡng trước khi bấm nút Nộp bài nhé!`
                    : `Mee đang cùng con làm bài! Con đã hoàn thành ${answeredCount}/${totalCount} câu rồi, tiếp tục cố gắng nhé!`
              }
              hint={currentQuestion.meeHint}
            />
          </div>
        </div>
      ) : (
        /* ── RESULT REPORT CARD ── */
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Certificate Header Banner */}
          <div
            className={cn(
              'relative overflow-hidden rounded-3xl p-8 text-center shadow-clay border',
              results.isPassed
                ? 'bg-gradient-to-br from-mint-500 via-emerald-600 to-teal-700 text-white border-mint-300'
                : 'bg-gradient-to-br from-indigo-600 via-brand-600 to-purple-700 text-white border-brand-300',
            )}
          >
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-white/20 shadow-inner backdrop-blur-md mb-4">
                <Trophy className="size-10 text-sun-300 animate-bounce" />
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="size-3.5" />
                {results.isPassed ? 'Chứng Nhận Đạt Chuẩn Olympic' : 'Hoàn Thành Bài Thi Thử'}
              </span>

              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold">
                {results.isPassed ? 'Chúc Mừng Chiến Binh Olympic! 🎉' : 'Cố Lên Nhé! Con Đã Hoàn Thành Rất Tốt! 💪'}
              </h2>

              <p className="mt-2 text-sm sm:text-base opacity-90">
                {exam.title}
              </p>

              {/* Score Badges */}
              <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-md">
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md">
                  <p className="text-[11px] uppercase font-bold opacity-80">Điểm số</p>
                  <p className="text-xl sm:text-2xl font-black">{results.score}/{exam.totalPoints}</p>
                </div>
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md">
                  <p className="text-[11px] uppercase font-bold opacity-80">Tỉ lệ đúng</p>
                  <p className="text-xl sm:text-2xl font-black">{results.scorePct}%</p>
                </div>
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md">
                  <p className="text-[11px] uppercase font-bold opacity-80">Số câu đúng</p>
                  <p className="text-xl sm:text-2xl font-black">{results.correctCount}/{totalCount}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRetake}
                  className="rounded-2xl bg-white text-slate-950 hover:bg-white/90 font-extrabold"
                >
                  <RotateCcw className="size-4" />
                  <span>Làm lại để nâng điểm</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate('/asmo')}
                  className="rounded-2xl bg-sun-400 text-slate-950 hover:bg-sun-300 font-extrabold border-0"
                >
                  <span>Khám phá đề thi khác</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Mèo Mee Review Feedback */}
          <AsmoMeeTutor
            pose={results.isPassed ? 'celebrate' : 'support'}
            speech={
              results.isPassed
                ? `Mee vô cùng tự hào về con! Con đã đạt ${results.score} điểm và vượt qua tiêu chuẩn ASMO. Hãy tiếp tục giải thêm các bài 3D nhé!`
                : `Con đã nỗ lực rất tuyệt vời! Dưới đây là lời giải chi tiết từng câu, con hãy cùng Mee xem lại để hiểu bài hơn nhé!`
            }
          />

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-brand-600" />
              <span>Xem Lại Chi Tiết Từng Câu Hỏi & Lời Giải</span>
            </h3>

            {exam.questions.map((q, idx) => {
              const userAns = answers[q.id]
              const isCorrect = userAns === q.correctAnswer

              return (
                <div
                  key={q.id}
                  className={cn(
                    'rounded-3xl border p-5 shadow-xs transition-all',
                    isCorrect
                      ? 'border-mint-200 bg-mint-50/40'
                      : 'border-coral-200 bg-coral-50/30',
                  )}
                >
                  <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200/60">
                    <span className="font-bold text-sm text-slate-800">
                      Câu {idx + 1}: {q.title}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-xl px-2.5 py-0.5 text-xs font-bold',
                        isCorrect
                          ? 'bg-mint-100 text-mint-800'
                          : 'bg-coral-100 text-coral-800',
                      )}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="size-3.5" /> Đúng (+{q.points}đ)
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3.5" /> Sai (0đ)
                        </>
                      )}
                    </span>
                  </div>

                  {q.renderSpec && (
                    <div className="mb-4 rounded-3xl border border-slate-700 bg-slate-950 p-2 shadow-xl">
                      <AsmoThreeViewer
                        key={q.id}
                        spec={q.renderSpec}
                        height={260}
                        interactive
                      />
                    </div>
                  )}

                  <AsmoQuestionCard
                    question={q}
                    selectedAnswer={userAns}
                    showSolutionImmediately
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
