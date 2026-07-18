import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  Gamepad2,
  Lock,
  Map as MapIcon,
  Sparkles,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import { MissionBanner } from '@/components/ui/MissionBanner'
import { CheerOverlay, useCheer } from '@/components/game/CheerBurst'
import { LessonVideoPlayer } from '@/components/game/LessonVideoPlayer'
import {
  ensureLesson,
  emptyLessonProgress,
  starsFromQuiz,
  type LessonPhase,
} from '@/data/lessons'
import {
  getNextQuestAfter,
  isCourseComplete,
  nextLessonPath,
} from '@/lib/course-flow'
import { useDemoStore } from '@/store/demo-store'
import { cn } from '@/lib/cn'

/**
 * Professional lesson shell: Theory/Video → Practice → Short quiz.
 * On finish: go to NEXT station lesson (not catalog mid-course).
 */
export function LessonPage() {
  const { questId = '' } = useParams()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const lesson = useMemo(() => ensureLesson(questId), [questId])
  const progressMap = useDemoStore((s) => s.lessonProgress)
  const setLessonPhaseDone = useDemoStore((s) => s.setLessonPhaseDone)
  const setLessonVideoSec = useDemoStore((s) => s.setLessonVideoSec)
  const completeLessonQuiz = useDemoStore((s) => s.completeLessonQuiz)
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const selectedCourseId = useDemoStore((s) => s.selectedCourseId)
  const completedQuestIds = useDemoStore((s) => s.completedQuestIds)
  const addToast = useDemoStore((s) => s.addToast)
  const { cheer, fire } = useCheer()

  const progress = progressMap[questId] ?? emptyLessonProgress()
  const nextQuest = useMemo(
    () => getNextQuestAfter(selectedCourseId, questId),
    [selectedCourseId, questId],
  )
  const courseDone = useMemo(
    () => isCourseComplete(selectedCourseId, completedQuestIds),
    [selectedCourseId, completedQuestIds],
  )

  const stepParam = search.get('step') as LessonPhase | null
  const initialPhase: LessonPhase = (() => {
    if (stepParam === 'quiz' && (progress.practiceDone || progress.quizDone))
      return progress.quizDone ? 'done' : 'quiz'
    if (stepParam === 'practice' && progress.theoryDone) return 'practice'
    if (progress.quizDone) return 'done'
    if (progress.practiceDone) return 'quiz'
    if (progress.theoryDone) return 'practice'
    return 'theory'
  })()

  const [phase, setPhase] = useState<LessonPhase>(initialPhase)
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [advancing, setAdvancing] = useState(false)

  // Reset phase when switching quests
  useEffect(() => {
    setPhase(initialPhase)
    setQi(0)
    setPicked(null)
    setFeedback(null)
    setCorrectCount(0)
    setAdvancing(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questId])

  useEffect(() => {
    if (stepParam === 'quiz') {
      setPhase(progress.quizDone ? 'done' : 'quiz')
      if (!progress.quizDone) {
        setQi(0)
        setCorrectCount(0)
      }
    } else if (stepParam === 'practice' && progress.theoryDone) {
      setPhase('practice')
    }
  }, [stepParam, questId, progress.quizDone, progress.theoryDone])

  const quiz = lesson.quiz
  const totalQ = quiz.length
  const q = phase === 'quiz' && qi < totalQ ? quiz[qi] : undefined

  const phases: { id: LessonPhase; label: string; icon: string }[] = [
    { id: 'theory', label: 'Lý thuyết', icon: '1' },
    { id: 'practice', label: 'Thực hành', icon: '2' },
    { id: 'quiz', label: 'Kiểm tra', icon: '3' },
  ]

  const goPractice = () => {
    if (!progress.theoryDone) {
      addToast({
        type: 'warning',
        title: 'Xem lý thuyết trước đã!',
        description: 'Xem video hoặc bấm “Đánh dấu đã xem”.',
      })
      return
    }
    setPhase('practice')
    setCurrentQuest(questId)
    navigate(lesson.practicePath)
  }

  const goNextStation = () => {
    const path = nextLessonPath(selectedCourseId, questId)
    if (nextQuest) {
      setCurrentQuest(nextQuest.id)
      addToast({
        type: 'info',
        title: `Chặng ${nextQuest.order}: ${nextQuest.title}`,
        description: 'Tiếp tục: video → thực hành → kiểm tra.',
      })
    }
    navigate(path)
  }

  const answer = (optId: string) => {
    if (!q || advancing || feedback) return
    setPicked(optId)
    const opt = q.options.find((o) => o.id === optId)
    const ok = !!opt?.correct
    setFeedback(q.explain)
    if (ok) setCorrectCount((c) => c + 1)
    setAdvancing(true)
    window.setTimeout(() => {
      setPicked(null)
      setFeedback(null)
      setAdvancing(false)
      if (qi + 1 >= totalQ) {
        const finalCorrect = correctCount + (ok ? 1 : 0)
        const stars = starsFromQuiz(finalCorrect, totalQ)
        completeLessonQuiz(questId, stars, lesson.starsReward)
        fire(stars >= 3 ? 'Xuất sắc 3 sao!' : 'Vượt kiểm tra!')
        setPhase('done')
        addToast({
          type: 'success',
          title: `+${lesson.starsReward} sao · ${stars}/3 ★`,
          description: nextQuest
            ? 'Bấm “Chặng tiếp theo” để tiếp tục!'
            : 'Khóa học sắp hoàn thành!',
        })
      } else {
        setQi((i) => i + 1)
      }
    }, 900)
  }

  return (
    <div className="stage-shell mx-auto max-w-3xl space-y-5 pb-28 sm:pb-10">
      <CheerOverlay message={cheer} />

      <button
        type="button"
        onClick={() => navigate('/world?view=adventure')}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-600"
      >
        <MapIcon className="size-4" /> Về khóa học · Bản đồ
      </button>

      <div>
        <p className="text-sm font-bold text-brand-500">Bài học 3 bước</p>
        <h1 className="font-display text-2xl text-text sm:text-3xl">
          {lesson.emoji} {lesson.title}
        </h1>
        <p className="mt-1 text-base font-semibold text-muted">{lesson.skill}</p>
      </div>

      <nav aria-label="Các bước bài học" className="grid grid-cols-3 gap-2">
        {phases.map((p) => {
          const unlocked =
            p.id === 'theory' ||
            (p.id === 'practice' && progress.theoryDone) ||
            (p.id === 'quiz' && progress.practiceDone) ||
            progress.quizDone
          const active = phase === p.id || (phase === 'done' && p.id === 'quiz')
          const doneFlag =
            (p.id === 'theory' && progress.theoryDone) ||
            (p.id === 'practice' && progress.practiceDone) ||
            (p.id === 'quiz' && progress.quizDone)
          return (
            <button
              key={p.id}
              type="button"
              disabled={!unlocked}
              onClick={() =>
                unlocked &&
                setPhase(p.id === 'quiz' && progress.quizDone ? 'done' : p.id)
              }
              className={cn(
                'flex min-h-14 flex-col items-center justify-center rounded-2xl border-2 px-2 py-2 text-center text-xs font-bold sm:text-sm',
                active && 'border-brand-500 bg-brand-50 shadow-clay',
                doneFlag && !active && 'border-mint-400/50 bg-mint-100/50',
                !unlocked && 'cursor-not-allowed opacity-50',
                unlocked && !active && 'cursor-pointer border-border bg-white',
              )}
            >
              <span className="mb-0.5 flex size-7 items-center justify-center rounded-full bg-white text-sm shadow-soft">
                {doneFlag ? (
                  <Check className="size-4 text-success" />
                ) : unlocked ? (
                  p.icon
                ) : (
                  <Lock className="size-3.5" />
                )}
              </span>
              {p.label}
            </button>
          )
        })}
      </nav>

      <MissionBanner
        doing={
          phase === 'theory'
            ? 'Xem video + thẻ lý thuyết'
            : phase === 'practice'
              ? 'Làm thực hành'
              : phase === 'quiz'
                ? 'Trả lời trắc nghiệm ngắn'
                : 'Hoàn thành bài học'
        }
        why="Học rõ → làm thử → kiểm tra"
        reward={`${lesson.starsReward} sao · tối đa ${lesson.starsMax}★`}
      />

      {phase === 'theory' && (
        <div className="space-y-4">
          <Card className="space-y-3 border-2 border-brand-100">
            <div className="flex items-center gap-2 text-brand-600">
              <BookOpen className="size-5" />
              <h2 className="font-display text-xl">Bước 1 · Lý thuyết</h2>
            </div>
            <LessonVideoPlayer
              video={lesson.video}
              completed={progress.theoryDone}
              onProgress={(sec) => setLessonVideoSec(questId, sec)}
              onComplete={() => {
                setLessonPhaseDone(questId, 'theory', true)
                fire('Đã xem hướng dẫn!')
              }}
            />
          </Card>

          {lesson.theoryCards.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-display text-lg">Thẻ kiến thức</h3>
              {lesson.theoryCards.map((c) => (
                <Card key={c.id} className="p-4">
                  <p className="text-xs font-bold uppercase text-brand-500">
                    {c.kind}
                  </p>
                  <p className="font-display text-lg">{c.title}</p>
                  <p className="mt-1 text-sm font-semibold text-muted">{c.body}</p>
                  <p className="mt-2 rounded-xl bg-sun-100 px-3 py-2 text-sm font-bold">
                    💡 {c.tip}
                  </p>
                </Card>
              ))}
            </div>
          ) : null}

          <Button
            size="lg"
            fullWidth
            className="min-h-14"
            disabled={!progress.theoryDone}
            onClick={() => setPhase('practice')}
          >
            Xong lý thuyết · Sang thực hành
            <ArrowRight className="size-5" />
          </Button>
        </div>
      )}

      {phase === 'practice' && (
        <div className="space-y-4">
          <Card className="space-y-4 border-2 border-sky-100 bg-gradient-to-br from-white to-sky-50">
            <div className="flex items-center gap-2 text-sky-500">
              <Gamepad2 className="size-5" />
              <h2 className="font-display text-xl text-text">Bước 2 · Thực hành</h2>
            </div>
            <p className="text-base font-semibold text-text">{lesson.practiceHint}</p>
            {progress.practiceDone ? (
              <div className="rounded-2xl bg-mint-100 px-4 py-3 text-sm font-bold text-success">
                ✓ Đã hoàn thành thực hành
              </div>
            ) : (
              <Button size="lg" fullWidth className="min-h-14" onClick={goPractice}>
                <Sparkles className="size-5" />
                {lesson.practiceLabel}
                <ArrowRight className="size-5" />
              </Button>
            )}
            {progress.practiceDone ? (
              <Button size="lg" fullWidth onClick={() => setPhase('quiz')}>
                Sang kiểm tra trắc nghiệm
                <ArrowRight className="size-5" />
              </Button>
            ) : (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setLessonPhaseDone(questId, 'practice', true)
                  fire('Thực hành xong!')
                  setPhase('quiz')
                }}
              >
                Tôi đã làm xong · Vào kiểm tra
              </Button>
            )}
          </Card>
        </div>
      )}

      {phase === 'quiz' && q && (
        <div className="space-y-4">
          <Card className="space-y-4 border-2 border-sun-400/40">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl">Bước 3 · Kiểm tra</h2>
              <span className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold">
                Câu {qi + 1}/{totalQ}
              </span>
            </div>
            <p className="text-lg font-bold text-text">{q.prompt}</p>
            <div className="grid gap-2">
              {q.options.map((o) => {
                const selected = picked === o.id
                const show = !!feedback
                return (
                  <ChoiceCard
                    key={o.id}
                    selected={selected}
                    onClick={() => answer(o.id)}
                    className={cn(
                      'min-h-14 p-4 text-left',
                      show && o.correct && 'border-mint-400 bg-mint-100/60',
                      show &&
                        selected &&
                        !o.correct &&
                        'border-coral-400 bg-coral-100/50',
                    )}
                  >
                    <span className="font-bold">{o.label}</span>
                  </ChoiceCard>
                )
              })}
            </div>
            {feedback ? (
              <p
                className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold"
                aria-live="polite"
              >
                {feedback}
              </p>
            ) : null}
          </Card>
        </div>
      )}

      {phase === 'done' && (
        <Card className="space-y-4 border-2 border-mint-400/50 bg-gradient-to-br from-white to-mint-100/40 text-center">
          <p className="text-5xl" aria-hidden>
            🏆
          </p>
          <h2 className="font-display text-3xl text-brand-600">Bài học hoàn thành!</h2>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-8',
                  i < (progress.starsEarned || starsFromQuiz(correctCount, totalQ))
                    ? 'fill-sun-400 text-sun-400'
                    : 'text-border',
                )}
              />
            ))}
          </div>
          <p className="font-semibold text-muted">
            Lý thuyết ✓ · Thực hành ✓ · Kiểm tra ✓
          </p>

          {nextQuest ? (
            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 px-4 py-3 text-left">
              <p className="text-xs font-bold uppercase text-brand-600">Chặng tiếp theo</p>
              <p className="font-display text-lg text-text">
                {nextQuest.order}. {nextQuest.title}
              </p>
              <p className="text-sm text-muted">{nextQuest.skill}</p>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-mint-400 bg-mint-100 px-4 py-3">
              <p className="font-display text-lg text-success">
                🎉 Đã xong chặng cuối của khóa!
              </p>
              <p className="text-sm font-semibold text-muted">
                {courseDone
                  ? 'Khóa học đã hoàn thành 100%.'
                  : 'Về bản đồ để nhận huy hiệu khóa học.'}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" className="min-h-14 flex-1" onClick={goNextStation}>
              {nextQuest ? (
                <>
                  Chặng tiếp theo
                  <ArrowRight className="size-5" />
                </>
              ) : (
                <>
                  <MapIcon className="size-5" /> Về bản đồ · Kết thúc khóa
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(`/lesson/${questId}`)}
            >
              Học lại chặng này
            </Button>
          </div>
          <Button
            variant="soft"
            fullWidth
            onClick={() => navigate('/world?view=adventure')}
          >
            Chỉ xem bản đồ (không chuyển chặng)
          </Button>
          {questId === 'cinema' ? (
            <Button fullWidth onClick={() => navigate('/portfolio/star-cat')}>
              Mở Portfolio
            </Button>
          ) : null}
        </Card>
      )}
    </div>
  )
}
