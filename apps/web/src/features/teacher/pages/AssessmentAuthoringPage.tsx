import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookPlus, ClipboardCheck, Plus, Save } from 'lucide-react'
import { QuestionContentEditor } from '@/features/teacher/components/QuestionContentEditor'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'drag_drop'
  | 'short_text'
  | 'ordering'
  | 'artifact'
type QuestionVersion = {
  id: string
  version: number
  type: QuestionType
  promptJson: Record<string, unknown>
  answerKeyJson: Record<string, unknown>
  rubricJson: Record<string, unknown>
  explanation: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  ageBands: string[]
  status: string
}
type Question = {
  id: string
  code: string
  courseId: string | null
  title: string
  tags: string[]
  versions: QuestionVersion[]
}
type AssessmentItem = {
  questionVersionId: string
  order: number
  points: number
  required: boolean
}
type AssessmentVersion = {
  id: string
  version: number
  instructionsJson: Record<string, unknown>
  durationMinutes: number
  passScore: number
  maxAttempts: number
  cooldownMinutes: number
  allowResume: boolean
  randomizeQuestions: boolean
  feedbackPolicy: string
  status: string
  items: AssessmentItem[]
}
type Assessment = {
  id: string
  code: string
  courseId: string
  questId: string | null
  title: string
  kind: string
  versions: AssessmentVersion[]
}
type Course = { id: string; title: string; shortTitle: string }
type AuthoringTab = 'questions' | 'assessments'

const typeLabels: Record<QuestionType, string> = {
  single_choice: 'Một đáp án',
  multiple_choice: 'Nhiều đáp án',
  drag_drop: 'Kéo thả',
  short_text: 'Trả lời ngắn',
  ordering: 'Sắp xếp',
  artifact: 'Nộp sản phẩm',
}

function json(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function parseObject(value: string, label: string) {
  const result: unknown = JSON.parse(value)
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error(`${label} phải là JSON object.`)
  }
  return result as Record<string, unknown>
}

function questionSkeleton(type: QuestionType) {
  if (type === 'single_choice' || type === 'multiple_choice') {
    return {
      prompt: { stem: '', options: [{ id: 'a', text: '' }, { id: 'b', text: '' }] },
      answerKey: { correctOptionIds: [] },
      rubric: {},
    }
  }
  if (type === 'ordering') {
    return {
      prompt: { stem: '', items: [{ id: 'step-1', text: '' }, { id: 'step-2', text: '' }] },
      answerKey: { correctOrder: ['step-1', 'step-2'] },
      rubric: {},
    }
  }
  if (type === 'drag_drop') {
    return {
      prompt: {
        stem: '',
        items: [{ id: 'item-1', text: '' }],
        targets: [{ id: 'target-1', text: '' }],
      },
      answerKey: { 'item-1': 'target-1' },
      rubric: {},
    }
  }
  if (type === 'short_text') {
    return {
      prompt: { stem: '', minLength: 1, maxLength: 1_000 },
      answerKey: {},
      rubric: { criteria: [{ id: 'quality', label: '', maxPoints: 10 }] },
    }
  }
  return {
    prompt: { stem: '', allowedSources: ['project'] },
    answerKey: {},
    rubric: { criteria: [{ id: 'quality', label: '', maxPoints: 10 }] },
  }
}

function initialQuestionForm() {
  const skeleton = questionSkeleton('single_choice')
  return {
    questionId: '',
    code: '',
    courseId: '',
    title: '',
    tags: '',
    type: 'single_choice' as QuestionType,
    prompt: json(skeleton.prompt),
    answerKey: json(skeleton.answerKey),
    rubric: json(skeleton.rubric),
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    ageBands: [] as string[],
    status: 'draft' as 'draft' | 'published',
    reason: '',
  }
}

function initialAssessmentForm() {
  return {
    assessmentId: '',
    code: '',
    courseId: '',
    title: '',
    kind: 'course_final',
    instructions: '',
    durationMinutes: 30,
    passScore: 70,
    maxAttempts: 3,
    cooldownMinutes: 0,
    allowResume: true,
    randomizeQuestions: false,
    feedbackPolicy: 'after_publish',
    status: 'draft' as 'draft' | 'published',
    reason: '',
    items: [] as AssessmentItem[],
  }
}

export function AssessmentAuthoringPage() {
  const [tab, setTab] = useState<AuthoringTab>('questions')
  const [courses, setCourses] = useState<Course[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [courseId, setCourseId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [courseResult, questionResult, assessmentResult] = await Promise.all([
        api<{ courses: Course[] }>('/api/teacher/lectures'),
        api<{ questions: Question[] }>('/api/teacher/question-bank?limit=100'),
        api<{ assessments: Assessment[] }>('/api/teacher/assessments'),
      ])
      setCourses(courseResult.courses)
      setQuestions(questionResult.questions)
      setAssessments(assessmentResult.assessments)
      setCourseId((current) => current || courseResult.courses[0]?.id || '')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được kho bài test.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  const visibleQuestions = useMemo(
    () => questions.filter((question) => !courseId || question.courseId === courseId),
    [courseId, questions],
  )
  const visibleAssessments = useMemo(
    () => assessments.filter((assessment) => !courseId || assessment.courseId === courseId),
    [assessments, courseId],
  )

  if (loading) return <PageSkeleton rows={6} />
  if (error) return <ErrorState message={error} onRetry={() => setRefreshKey((key) => key + 1)} />

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="ui-card flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-sky-600">
            Assessment Engine
          </p>
          <h1 className="font-display text-2xl sm:text-3xl">Biên soạn bài test</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            Kho câu hỏi có phiên bản, sáu dạng câu hỏi, rubric chấm tay và chính sách
            thi. Đáp án chỉ lưu ở máy chủ và không xuất hiện trong API làm bài.
          </p>
        </div>
        <label className="grid min-w-56 gap-1 text-sm font-bold">
          Khóa học
          <select
            className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="flex gap-2" role="tablist">
        {(
          [
            ['questions', 'Kho câu hỏi', BookPlus],
            ['assessments', 'Đề kiểm tra', ClipboardCheck],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold',
              tab === key ? 'bg-sky-500 text-white shadow-soft' : 'bg-white text-muted',
            )}
            onClick={() => setTab(key)}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'questions' ? (
        <QuestionAuthoring
          courseId={courseId}
          questions={visibleQuestions}
          onDone={() => {
            showToast('Đã lưu phiên bản câu hỏi.', 'success')
            setRefreshKey((key) => key + 1)
          }}
          onError={(message) => showToast(message, 'error')}
        />
      ) : (
        <AssessmentAuthoring
          courseId={courseId}
          questions={visibleQuestions}
          assessments={visibleAssessments}
          onDone={() => {
            showToast('Đã lưu phiên bản đề kiểm tra.', 'success')
            setRefreshKey((key) => key + 1)
          }}
          onError={(message) => showToast(message, 'error')}
        />
      )}
    </div>
  )
}

function QuestionAuthoring({
  courseId,
  questions,
  onDone,
  onError,
}: {
  courseId: string
  questions: Question[]
  onDone: () => void
  onError: (message: string) => void
}) {
  const [form, setForm] = useState(initialQuestionForm)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setForm((current) => ({ ...current, courseId }))
  }, [courseId])

  function changeType(type: QuestionType) {
    const skeleton = questionSkeleton(type)
    setForm({
      ...form,
      type,
      prompt: json(skeleton.prompt),
      answerKey: json(skeleton.answerKey),
      rubric: json(skeleton.rubric),
    })
  }

  function edit(question: Question) {
    const latest = question.versions[0]
    if (!latest) return
    const authoringAnswerKey =
      latest.type === 'drag_drop' &&
      latest.answerKeyJson.correctPlacements &&
      typeof latest.answerKeyJson.correctPlacements === 'object'
        ? latest.answerKeyJson.correctPlacements
        : latest.answerKeyJson
    setForm({
      questionId: question.id,
      code: question.code,
      courseId: question.courseId ?? '',
      title: question.title,
      tags: question.tags.join(', '),
      type: latest.type,
      prompt: json(latest.promptJson),
      answerKey: json(authoringAnswerKey),
      rubric: json(latest.rubricJson),
      explanation: latest.explanation ?? '',
      difficulty: latest.difficulty,
      ageBands: latest.ageBands,
      status: 'draft',
      reason: '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      const common = {
        type: form.type,
        prompt: parseObject(form.prompt, 'Nội dung câu hỏi'),
        answerKey: parseObject(form.answerKey, 'Đáp án'),
        rubric: parseObject(form.rubric, 'Rubric'),
        explanation: form.explanation || null,
        difficulty: form.difficulty,
        ageBands: form.ageBands,
        status: form.status,
        reason: form.reason,
      }
      await api(
        form.questionId
          ? `/api/teacher/question-bank/${form.questionId}/versions`
          : '/api/teacher/question-bank',
        {
          method: 'POST',
          body: JSON.stringify(
            form.questionId
              ? common
              : {
                  ...common,
                  code: form.code,
                  courseId: form.courseId || null,
                  title: form.title,
                  tags: form.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                },
          ),
        },
      )
      setForm({ ...initialQuestionForm(), courseId })
      onDone()
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'Không lưu được câu hỏi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(25rem,0.9fr)_minmax(0,1.1fr)]">
      <form className="ui-card grid h-fit gap-4 p-5" onSubmit={(event) => void submit(event)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">
              {form.questionId ? 'Tạo phiên bản câu hỏi' : 'Câu hỏi mới'}
            </h2>
            <p className="text-sm text-muted">
              Bản đã công bố không bị sửa tại chỗ; thay đổi luôn tạo phiên bản mới.
            </p>
          </div>
          {form.questionId && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm({ ...initialQuestionForm(), courseId })}
            >
              <Plus size={16} /> Mới
            </Button>
          )}
        </div>
        {!form.questionId && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mã câu hỏi">
              <input
                required
                pattern="[a-z0-9-]+"
                className="field-input"
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value })}
              />
            </Field>
            <Field label="Tên nội bộ">
              <input
                required
                className="field-input"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </Field>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Dạng câu hỏi">
            <select
              className="field-input"
              value={form.type}
              onChange={(event) => changeType(event.target.value as QuestionType)}
            >
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Độ khó">
            <select
              className="field-input"
              value={form.difficulty}
              onChange={(event) =>
                setForm({
                  ...form,
                  difficulty: event.target.value as 'easy' | 'medium' | 'hard',
                })
              }
            >
              <option value="easy">Dễ</option>
              <option value="medium">Vừa</option>
              <option value="hard">Khó</option>
            </select>
          </Field>
        </div>
        <AgeBandChecks value={form.ageBands} onChange={(ageBands) => setForm({ ...form, ageBands })} />
        {!form.questionId && (
          <Field label="Nhãn, phân cách bằng dấu phẩy">
            <input
              className="field-input"
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
            />
          </Field>
        )}
        <QuestionContentEditor
          type={form.type}
          prompt={form.prompt}
          answerKey={form.answerKey}
          rubric={form.rubric}
          onPromptChange={(prompt) =>
            setForm((current) => ({ ...current, prompt }))
          }
          onAnswerKeyChange={(answerKey) =>
            setForm((current) => ({ ...current, answerKey }))
          }
          onRubricChange={(rubric) =>
            setForm((current) => ({ ...current, rubric }))
          }
        />
        <Field label="Giải thích sau khi được phép xem">
          <textarea
            className="min-h-20 rounded-xl border-2 border-border p-3"
            value={form.explanation}
            onChange={(event) => setForm({ ...form, explanation: event.target.value })}
          />
        </Field>
        <PublishFields
          status={form.status}
          reason={form.reason}
          onStatus={(status) => setForm({ ...form, status })}
          onReason={(reason) => setForm({ ...form, reason })}
        />
        <Button type="submit" disabled={busy || form.ageBands.length === 0}>
          <Save size={17} />
          {busy ? 'Đang lưu…' : 'Lưu câu hỏi'}
        </Button>
      </form>

      <section className="ui-card p-5">
        <h2 className="font-display text-xl">Kho câu hỏi ({questions.length})</h2>
        {questions.length === 0 ? (
          <EmptyState title="Chưa có câu hỏi" description="Tạo câu hỏi đầu tiên cho khóa học này." />
        ) : (
          <div className="mt-4 space-y-3">
            {questions.map((question) => {
              const latest = question.versions[0]
              return (
                <article key={question.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-muted">{question.code}</p>
                      <h3 className="font-bold">{question.title}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {latest ? typeLabels[latest.type] : 'Chưa có phiên bản'} · v
                        {latest?.version ?? 0} · {latest?.status ?? 'draft'}
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => edit(question)}>
                      Tạo phiên bản mới
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function AssessmentAuthoring({
  courseId,
  questions,
  assessments,
  onDone,
  onError,
}: {
  courseId: string
  questions: Question[]
  assessments: Assessment[]
  onDone: () => void
  onError: (message: string) => void
}) {
  const [form, setForm] = useState(initialAssessmentForm)
  const [busy, setBusy] = useState(false)
  useEffect(() => setForm((current) => ({ ...current, courseId })), [courseId])

  const selectable = questions
    .map((question) => ({ question, version: question.versions[0] }))
    .filter((row): row is { question: Question; version: QuestionVersion } => Boolean(row.version))

  function toggleItem(versionId: string, checked: boolean) {
    const items = checked
      ? [
          ...form.items,
          {
            questionVersionId: versionId,
            order: form.items.length + 1,
            points: 10,
            required: true,
          },
        ]
      : form.items
          .filter((item) => item.questionVersionId !== versionId)
          .map((item, index) => ({ ...item, order: index + 1 }))
    setForm({ ...form, items })
  }

  function edit(assessment: Assessment) {
    const latest = assessment.versions[0]
    if (!latest) return
    setForm({
      assessmentId: assessment.id,
      code: assessment.code,
      courseId: assessment.courseId,
      title: assessment.title,
      kind: assessment.kind,
      instructions:
        typeof latest.instructionsJson.text === 'string'
          ? latest.instructionsJson.text
          : json(latest.instructionsJson),
      durationMinutes: latest.durationMinutes,
      passScore: latest.passScore,
      maxAttempts: latest.maxAttempts,
      cooldownMinutes: latest.cooldownMinutes,
      allowResume: latest.allowResume,
      randomizeQuestions: latest.randomizeQuestions,
      feedbackPolicy: latest.feedbackPolicy,
      status: 'draft',
      reason: '',
      items: latest.items,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      const common = {
        instructions: { text: form.instructions },
        durationMinutes: form.durationMinutes,
        passScore: form.passScore,
        maxAttempts: form.maxAttempts,
        cooldownMinutes: form.cooldownMinutes,
        allowResume: form.allowResume,
        randomizeQuestions: form.randomizeQuestions,
        feedbackPolicy: form.feedbackPolicy,
        status: form.status,
        items: form.items,
        reason: form.reason,
      }
      await api(
        form.assessmentId
          ? `/api/teacher/assessments/${form.assessmentId}/versions`
          : '/api/teacher/assessments',
        {
          method: 'POST',
          body: JSON.stringify(
            form.assessmentId
              ? common
              : {
                  ...common,
                  code: form.code,
                  courseId: form.courseId,
                  title: form.title,
                  kind: form.kind,
                },
          ),
        },
      )
      setForm({ ...initialAssessmentForm(), courseId })
      onDone()
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'Không lưu được đề kiểm tra.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(25rem,0.9fr)_minmax(0,1.1fr)]">
      <form className="ui-card grid h-fit gap-4 p-5" onSubmit={(event) => void submit(event)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">
              {form.assessmentId ? 'Tạo phiên bản đề' : 'Đề kiểm tra mới'}
            </h2>
            <p className="text-sm text-muted">
              Chọn phiên bản câu hỏi và trọng số. Tổng điểm được chuẩn hóa về 100.
            </p>
          </div>
          {form.assessmentId && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm({ ...initialAssessmentForm(), courseId })}
            >
              <Plus size={16} /> Mới
            </Button>
          )}
        </div>
        {!form.assessmentId && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mã đề">
              <input
                required
                pattern="[a-z0-9-]+"
                className="field-input"
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value })}
              />
            </Field>
            <Field label="Tên đề">
              <input
                required
                className="field-input"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </Field>
          </div>
        )}
        {!form.assessmentId && (
          <Field label="Loại đề">
            <select
              className="field-input"
              value={form.kind}
              onChange={(event) => setForm({ ...form, kind: event.target.value })}
            >
              <option value="lesson_check">Kiểm tra bài học</option>
              <option value="course_final">Cuối khóa</option>
              <option value="diagnostic">Đầu vào</option>
              <option value="practice">Luyện tập</option>
            </select>
          </Field>
        )}
        <Field label="Hướng dẫn">
          <textarea
            required
            className="min-h-20 rounded-xl border-2 border-border p-3"
            value={form.instructions}
            onChange={(event) => setForm({ ...form, instructions: event.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumberField label="Phút" value={form.durationMinutes} min={1} max={480} onChange={(durationMinutes) => setForm({ ...form, durationMinutes })} />
          <NumberField label="Điểm đạt" value={form.passScore} min={0} max={100} onChange={(passScore) => setForm({ ...form, passScore })} />
          <NumberField label="Số lượt" value={form.maxAttempts} min={1} max={100} onChange={(maxAttempts) => setForm({ ...form, maxAttempts })} />
          <NumberField label="Chờ (phút)" value={form.cooldownMinutes} min={0} max={525_600} onChange={(cooldownMinutes) => setForm({ ...form, cooldownMinutes })} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Check label="Cho phép tiếp tục lượt dở" checked={form.allowResume} onChange={(allowResume) => setForm({ ...form, allowResume })} />
          <Check label="Trộn thứ tự câu hỏi" checked={form.randomizeQuestions} onChange={(randomizeQuestions) => setForm({ ...form, randomizeQuestions })} />
        </div>
        <Field label="Thời điểm hiện phản hồi">
          <select
            className="field-input"
            value={form.feedbackPolicy}
            onChange={(event) => setForm({ ...form, feedbackPolicy: event.target.value })}
          >
            <option value="after_submit">Sau khi nộp</option>
            <option value="after_grade">Sau khi chấm</option>
            <option value="after_publish">Sau khi công bố</option>
            <option value="never">Không hiển thị</option>
          </select>
        </Field>
        <fieldset className="rounded-2xl border-2 border-border p-3">
          <legend className="px-2 text-sm font-bold">Câu hỏi và điểm</legend>
          <div className="space-y-2">
            {selectable.map(({ question, version }) => {
              const item = form.items.find((row) => row.questionVersionId === version.id)
              return (
                <div key={version.id} className="grid items-center gap-2 rounded-xl bg-page p-3 sm:grid-cols-[1fr_7rem]">
                  <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={Boolean(item)}
                      disabled={form.status === 'published' && version.status !== 'published'}
                      onChange={(event) => toggleItem(version.id, event.target.checked)}
                    />
                    <span>
                      {question.title} <span className="text-muted">v{version.version} · {version.status}</span>
                    </span>
                  </label>
                  {item && (
                    <label className="text-xs font-bold">
                      Điểm
                      <input
                        type="number"
                        min={0.1}
                        max={100}
                        step={0.1}
                        className="field-input"
                        value={item.points}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            items: form.items.map((row) =>
                              row.questionVersionId === version.id
                                ? { ...row, points: Number(event.target.value) }
                                : row,
                            ),
                          })
                        }
                      />
                    </label>
                  )}
                </div>
              )
            })}
          </div>
        </fieldset>
        <PublishFields
          status={form.status}
          reason={form.reason}
          onStatus={(status) => setForm({ ...form, status })}
          onReason={(reason) => setForm({ ...form, reason })}
        />
        <Button type="submit" disabled={busy || form.items.length === 0}>
          <Save size={17} />
          {busy ? 'Đang lưu…' : 'Lưu đề kiểm tra'}
        </Button>
      </form>

      <section className="ui-card p-5">
        <h2 className="font-display text-xl">Danh sách đề ({assessments.length})</h2>
        {assessments.length === 0 ? (
          <EmptyState title="Chưa có đề" description="Tạo đề kiểm tra đầu tiên cho khóa học." />
        ) : (
          <div className="mt-4 space-y-3">
            {assessments.map((assessment) => {
              const latest = assessment.versions[0]
              return (
                <article key={assessment.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-muted">{assessment.code}</p>
                      <h3 className="font-bold">{assessment.title}</h3>
                      <p className="mt-1 text-sm text-muted">
                        v{latest?.version ?? 0} · {latest?.status ?? 'draft'} ·{' '}
                        {latest?.items.length ?? 0} câu
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => edit(assessment)}>
                      Tạo phiên bản mới
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-sm font-bold">{label}{children}</label>
}

function AgeBandChecks({
  value,
  onChange,
}: {
  value: string[]
  onChange: (value: string[]) => void
}) {
  const options = [
    ['6_8', '6–8 tuổi'],
    ['9_11', '9–11 tuổi'],
    ['11_plus', '12–17 tuổi'],
  ]
  return (
    <fieldset className="rounded-xl border-2 border-border p-3">
      <legend className="px-2 text-sm font-bold">Nhóm tuổi</legend>
      <div className="flex flex-wrap gap-4">
        {options.map(([key, label]) => (
          <Check
            key={key}
            label={label}
            checked={value.includes(key)}
            onChange={(checked) =>
              onChange(checked ? [...value, key] : value.filter((row) => row !== key))
            }
          />
        ))}
      </div>
    </fieldset>
  )
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        required
        min={min}
        max={max}
        className="field-input"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </Field>
  )
}

function PublishFields({
  status,
  reason,
  onStatus,
  onReason,
}: {
  status: 'draft' | 'published'
  reason: string
  onStatus: (status: 'draft' | 'published') => void
  onReason: (reason: string) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[11rem_1fr]">
      <Field label="Trạng thái">
        <select
          className="field-input"
          value={status}
          onChange={(event) => onStatus(event.target.value as 'draft' | 'published')}
        >
          <option value="draft">Bản nháp</option>
          <option value="published">Công bố</option>
        </select>
      </Field>
      <Field label="Lý do thay đổi">
        <input
          required
          minLength={5}
          maxLength={500}
          className="field-input"
          value={reason}
          onChange={(event) => onReason(event.target.value)}
        />
      </Field>
    </div>
  )
}
