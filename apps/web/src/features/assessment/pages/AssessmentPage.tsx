import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Save,
  Send,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useAgeExperience } from '@/shared/age-experience/AgeExperienceProvider'
import { useToast } from '@/shared/hooks/useToast'
import { api, type CourseSummary } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'drag_drop'
  | 'short_text'
  | 'ordering'
  | 'artifact'

type Option = { id: string; text: string }
type Prompt = {
  stem: string
  options?: Option[]
  items?: Option[]
  targets?: Option[]
  minLength?: number
  maxLength?: number
  allowedSources?: Array<'project' | 'asset' | 'upload'>
}
type AttemptItem = {
  questionVersionId: string
  points: number
  required: boolean
  question: { id: string; type: QuestionType; prompt: Prompt }
  response: { responseJson: Record<string, unknown> } | null
}
type Attempt = {
  id: string
  assessment: { id: string; title: string; courseId: string }
  status: string
  attemptNumber: number
  version: number
  startedAt: string
  expiresAt: string
  durationMinutes: number
  scorePercent: number | null
  passed: boolean | null
  items: AttemptItem[]
}
type AssessmentSummary = {
  id: string
  title: string
  kind: string
  latestAttempt: {
    id: string
    status: string
    attemptNumber: number
    scorePercent: number | null
    passed: boolean | null
    updatedAt: string
  } | null
  versions: Array<{
    id: string
    version: number
    durationMinutes: number
    passScore: number
    maxAttempts: number
    cooldownMinutes: number
    allowResume: boolean
    _count: { items: number }
  }>
}
type AssessmentWithCourse = AssessmentSummary & {
  course: Pick<CourseSummary, 'id' | 'title' | 'shortTitle' | 'accent'>
}
type ArtifactOption = {
  id: string
  label: string
  sourceType: 'project' | 'asset'
}
type PublishedResult = {
  id: string
  assessment: { title: string }
  attemptNumber: number
  scorePercent: number | null
  passed: boolean | null
  responses: Array<{
    question: { prompt: Prompt }
    points: number
    ratio: number | null
    feedback: string | null
  }>
}

function responseFromItem(item: AttemptItem): Record<string, unknown> {
  if (item.response?.responseJson) return item.response.responseJson
  if (item.question.type === 'ordering') {
    return {
      orderedItemIds: (item.question.prompt.items ?? []).map((row) => row.id),
    }
  }
  if (item.question.type === 'drag_drop') return { placements: {} }
  if (item.question.type === 'short_text') return { text: '' }
  if (item.question.type === 'artifact') {
    return { sourceType: 'project', sourceId: '' }
  }
  return { selectedOptionIds: [] }
}

function secondsLeft(expiresAt: string) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1_000))
}

export function AssessmentPage() {
  const [assessments, setAssessments] = useState<AssessmentWithCourse[]>([])
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [publishedResult, setPublishedResult] =
    useState<PublishedResult | null>(null)
  const [responses, setResponses] = useState<Record<string, Record<string, unknown>>>({})
  const [artifacts, setArtifacts] = useState<ArtifactOption[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const { toasts, showToast, dismissToast } = useToast()
  const { policy: agePolicy, status: agePolicyStatus, actionLabel } =
    useAgeExperience()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const courseData = await api<{ courses: CourseSummary[] }>('/api/courses')
      const enrolled = courseData.courses.filter((course) => course.enrolled)
      const rows = await Promise.all(
        enrolled.map(async (course) => {
          const data = await api<{ assessments: AssessmentSummary[] }>(
            `/api/assessments/course/${encodeURIComponent(course.id)}`,
          )
          return data.assessments.map((assessment) => ({
            ...assessment,
            course,
          }))
        }),
      )
      setAssessments(rows.flat())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được bài đánh giá.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!attempt) return
    setRemaining(secondsLeft(attempt.expiresAt))
    const timer = window.setInterval(
      () => setRemaining(secondsLeft(attempt.expiresAt)),
      1_000,
    )
    return () => window.clearInterval(timer)
  }, [attempt])

  useEffect(() => {
    if (!attempt?.items.some((item) => item.question.type === 'artifact')) return
    void Promise.allSettled([
      api<{ projects: Array<{ id: string; title: string }> }>('/api/projects'),
      api<{ assets: Array<{ id: string; name: string }> }>('/api/backpack'),
    ]).then(([projects, assets]) => {
      setArtifacts([
        ...(projects.status === 'fulfilled'
          ? projects.value.projects.map((project) => ({
              id: project.id,
              label: project.title,
              sourceType: 'project' as const,
            }))
          : []),
        ...(assets.status === 'fulfilled'
          ? assets.value.assets.map((asset) => ({
              id: asset.id,
              label: asset.name,
              sourceType: 'asset' as const,
            }))
          : []),
      ])
    })
  }, [attempt])

  async function start(assessmentId: string) {
    setBusy(assessmentId)
    try {
      const data = await api<{ attempt: Attempt }>(
        `/api/assessments/${assessmentId}/attempts`,
        {
          method: 'POST',
          body: JSON.stringify({ clientAttemptId: crypto.randomUUID() }),
        },
      )
      setAttempt(data.attempt)
      setCurrentQuestion(0)
      setResponses(
        Object.fromEntries(
          data.attempt.items.map((item) => [
            item.questionVersionId,
            responseFromItem(item),
          ]),
        ),
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (cause) {
      showToast(
        cause instanceof Error ? cause.message : 'Không thể bắt đầu bài đánh giá.',
        'error',
      )
    } finally {
      setBusy(null)
    }
  }

  async function viewResult(
    latestAttempt: NonNullable<AssessmentSummary['latestAttempt']>,
  ) {
    setBusy(`result-${latestAttempt.id}`)
    try {
      const data = await api<{ result: PublishedResult }>(
        `/api/assessment-attempts/${latestAttempt.id}/result`,
      )
      setPublishedResult(data.result)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (cause) {
      showToast(
        cause instanceof Error ? cause.message : 'Chưa mở được kết quả.',
        'error',
      )
    } finally {
      setBusy(null)
    }
  }

  function setResponse(questionId: string, value: Record<string, unknown>) {
    setResponses((current) => ({ ...current, [questionId]: value }))
  }

  async function save(item: AttemptItem) {
    if (!attempt) return
    setBusy(item.questionVersionId)
    try {
      const data = await api<{ saved: { attemptVersion: number } }>(
        `/api/assessment-attempts/${attempt.id}/responses/${item.questionVersionId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            attemptVersion: attempt.version,
            response: responses[item.questionVersionId],
          }),
        },
      )
      setAttempt({ ...attempt, version: data.saved.attemptVersion })
      showToast('Đã lưu câu trả lời.', 'success')
    } catch (cause) {
      showToast(
        cause instanceof Error ? cause.message : 'Không lưu được câu trả lời.',
        'error',
      )
    } finally {
      setBusy(null)
    }
  }

  async function submit() {
    if (!attempt) return
    setBusy('submit')
    try {
      const data = await api<{ attempt: Attempt }>(
        `/api/assessment-attempts/${attempt.id}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({
            attemptVersion: attempt.version,
            clientSubmissionId: crypto.randomUUID(),
          }),
        },
      )
      setAttempt(data.attempt)
      showToast('Đã nộp bài an toàn.', 'success')
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không nộp được bài.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const answeredCount = useMemo(
    () =>
      attempt?.items.filter((item) => {
        const value = responses[item.questionVersionId]
        if (!value) return false
        if (typeof value.text === 'string') return value.text.trim().length > 0
        if (Array.isArray(value.selectedOptionIds)) return value.selectedOptionIds.length > 0
        if (Array.isArray(value.orderedItemIds)) return value.orderedItemIds.length > 0
        if (value.placements && typeof value.placements === 'object') {
          return Object.keys(value.placements).length > 0
        }
        return typeof value.sourceId === 'string' && value.sourceId.length > 0
      }).length ?? 0,
    [attempt, responses],
  )

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-44 rounded-3xl" />
      </div>
    )
  }
  if (error) return <ErrorState title="Chưa mở được bài đánh giá" message={error} onRetry={() => void load()} />

  if (attempt) {
    const editable = attempt.status === 'in_progress' && remaining > 0
    const oneQuestionPerScreen =
      agePolicy?.assessmentPolicy.preferOneQuestionPerScreen === true ||
      agePolicy?.uiPolicy.oneActivityPerScreen === true
    const visibleItems = oneQuestionPerScreen
      ? attempt.items
          .map((item, index) => ({ item, index }))
          .slice(currentQuestion, currentQuestion + 1)
      : attempt.items.map((item, index) => ({ item, index }))
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <header className="ui-card sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 p-4 shadow-lg">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
              Lần làm {attempt.attemptNumber}
            </p>
            <h1 className="font-display text-2xl">{attempt.assessment.title}</h1>
            <p className="mt-1 text-sm text-muted">
              Đã trả lời {answeredCount}/{attempt.items.length} câu
            </p>
          </div>
          <div
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-2xl px-4 font-extrabold',
              remaining < 300 ? 'bg-coral-100 text-danger' : 'bg-sky-100 text-sky-700',
            )}
            role="timer"
          >
            <Clock3 size={19} aria-hidden="true" />
            {Math.floor(remaining / 60)
              .toString()
              .padStart(2, '0')}
            :{(remaining % 60).toString().padStart(2, '0')}
          </div>
        </header>

        {visibleItems.map(({ item, index }) => (
          <QuestionCard
            key={item.questionVersionId}
            index={index}
            item={item}
            value={responses[item.questionVersionId] ?? responseFromItem(item)}
            artifacts={artifacts}
            disabled={!editable}
            saving={busy === item.questionVersionId}
            maxShortTextLength={
              agePolicy?.assessmentPolicy.maxShortTextLength
            }
            onChange={(value) => setResponse(item.questionVersionId, value)}
            onSave={() => void save(item)}
          />
        ))}

        {oneQuestionPerScreen && attempt.items.length > 1 && (
          <nav
            className="ui-card flex items-center justify-between gap-3 p-4"
            aria-label="Điều hướng câu hỏi"
          >
            <Button
              variant="secondary"
              disabled={currentQuestion === 0}
              onClick={() =>
                setCurrentQuestion((value) => Math.max(0, value - 1))
              }
            >
              <ChevronLeft size={18} aria-hidden="true" />
              {actionLabel('previousQuestion', 'Câu trước')}
            </Button>
            <span className="text-sm font-extrabold text-muted">
              {currentQuestion + 1}/{attempt.items.length}
            </span>
            <Button
              variant="secondary"
              disabled={currentQuestion === attempt.items.length - 1}
              onClick={() =>
                setCurrentQuestion((value) =>
                  Math.min(attempt.items.length - 1, value + 1),
                )
              }
            >
              {actionLabel('nextQuestion', 'Câu tiếp')}
              <ChevronRight size={18} aria-hidden="true" />
            </Button>
          </nav>
        )}

        <section className="ui-card flex flex-wrap items-center justify-between gap-3 p-4">
          {editable ? (
            <>
              <p className="max-w-xl text-sm text-muted">
                Hãy bấm “Lưu câu trả lời” ở từng câu trước khi nộp. Hệ thống giữ
                nguyên phiên bản đề và không hiển thị đáp án trước khi công bố.
              </p>
              <Button disabled={busy === 'submit'} onClick={() => void submit()}>
                <Send size={18} aria-hidden="true" />
                {busy === 'submit' ? 'Đang nộp…' : 'Nộp bài'}
              </Button>
            </>
          ) : (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 text-success" aria-hidden="true" />
              <div>
                <p className="font-bold">
                  {attempt.status === 'published'
                    ? 'Kết quả đã được công bố'
                    : 'Bài đã nộp và đang được xử lý'}
                </p>
                <p className="text-sm text-muted">
                  {attempt.status === 'published' && attempt.scorePercent !== null
                    ? `${attempt.scorePercent}% · ${attempt.passed ? 'Đạt' : 'Chưa đạt'}`
                    : 'Giáo viên sẽ công bố khi hoàn tất phần cần chấm thủ công.'}
                </p>
              </div>
            </div>
          )}
          <Button variant="ghost" onClick={() => setAttempt(null)}>
            Về danh sách
          </Button>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="ui-card overflow-hidden p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="rounded-3xl bg-brand-100 p-3 text-brand-600">
            <ClipboardCheck size={30} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
              Thử tài
            </p>
            <h1 className="font-display text-2xl sm:text-3xl">Bài đánh giá của con</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Mỗi lần làm giữ đúng phiên bản đề, thời gian và câu trả lời đã lưu.
              Kết quả cần chấm tay sẽ chỉ hiện sau khi giáo viên công bố.
            </p>
          </div>
        </div>
      </header>
      {publishedResult && (
        <section className="ui-card border-mint-200 bg-mint-50 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-success">
                Kết quả lần {publishedResult.attemptNumber}
              </p>
              <h2 className="mt-1 font-display text-2xl">
                {publishedResult.assessment.title}
              </h2>
              <p className="mt-1 font-extrabold text-success">
                {publishedResult.scorePercent ?? 0}% ·{' '}
                {publishedResult.passed ? 'Đạt' : 'Mình cùng luyện thêm nhé'}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setPublishedResult(null)}
            >
              Đóng kết quả
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {publishedResult.responses.map((response, index) => (
              <article
                key={`${publishedResult.id}-${index}`}
                className="rounded-2xl bg-white p-4"
              >
                <p className="font-bold">
                  Câu {index + 1}: {response.question.prompt.stem}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {Math.round((response.ratio ?? 0) * response.points * 10) / 10}/
                  {response.points} điểm
                </p>
                {response.feedback && (
                  <p className="mt-2 rounded-xl bg-sky-50 p-3 text-sm">
                    <span className="font-bold">Góp ý của giáo viên:</span>{' '}
                    {response.feedback}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      {agePolicyStatus === 'configuration_required' && (
        <section className="ui-card border-sun-200 bg-sun-50 p-4 text-sm font-semibold text-warning">
          Nhà trường chưa công bố cấu hình bài đánh giá cho nhóm tuổi của con.
          Hệ thống sẽ chưa mở bài để tránh áp dụng quy tắc chưa được duyệt.
        </section>
      )}
      {assessments.length === 0 ? (
        <EmptyState
          title="Chưa có bài đánh giá"
          description="Bài đánh giá sẽ xuất hiện khi khóa học đã ghi danh có đề được công bố."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assessments.map((assessment) => {
            const version = assessment.versions[0]
            const latestAttempt = assessment.latestAttempt
            return (
              <article key={assessment.id} className="ui-card flex flex-col gap-4 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    {assessment.course.shortTitle}
                  </p>
                  <h2 className="mt-1 font-display text-xl">{assessment.title}</h2>
                </div>
                {version && (
                  <dl className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-2xl bg-sky-50 p-2">
                      <dt className="text-xs text-muted">Thời gian</dt>
                      <dd className="font-bold">{version.durationMinutes} phút</dd>
                    </div>
                    <div className="rounded-2xl bg-mint-50 p-2">
                      <dt className="text-xs text-muted">Số câu</dt>
                      <dd className="font-bold">{version._count.items}</dd>
                    </div>
                    <div className="rounded-2xl bg-sun-50 p-2">
                      <dt className="text-xs text-muted">Số lần</dt>
                      <dd className="font-bold">{version.maxAttempts}</dd>
                    </div>
                  </dl>
                )}
                {latestAttempt && (
                  <div
                    className={cn(
                      'rounded-2xl p-3 text-sm',
                      latestAttempt.status === 'published'
                        ? 'bg-mint-50 text-success'
                        : latestAttempt.status === 'in_progress'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-sun-50 text-warning',
                    )}
                  >
                    <p className="font-extrabold">
                      {latestAttempt.status === 'published'
                        ? `Kết quả lần ${latestAttempt.attemptNumber}: ${latestAttempt.scorePercent ?? 0}%`
                        : latestAttempt.status === 'in_progress'
                          ? `Lần ${latestAttempt.attemptNumber} đang làm dở`
                          : `Lần ${latestAttempt.attemptNumber} đã nộp, đang chờ công bố`}
                    </p>
                    {latestAttempt.status === 'published' && (
                      <Button
                        className="mt-2"
                        variant="secondary"
                        disabled={busy === `result-${latestAttempt.id}`}
                        onClick={() => void viewResult(latestAttempt)}
                      >
                        {busy === `result-${latestAttempt.id}`
                          ? 'Đang mở…'
                          : 'Xem kết quả và góp ý'}
                      </Button>
                    )}
                  </div>
                )}
                <Button
                  className="mt-auto w-full"
                  disabled={
                    !version ||
                    busy === assessment.id ||
                    agePolicyStatus !== 'ready'
                  }
                  onClick={() => void start(assessment.id)}
                >
                  {busy === assessment.id
                    ? 'Đang mở…'
                    : version?.allowResume
                      ? 'Bắt đầu hoặc tiếp tục'
                      : 'Bắt đầu làm bài'}
                </Button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function QuestionCard({
  index,
  item,
  value,
  artifacts,
  disabled,
  saving,
  maxShortTextLength,
  onChange,
  onSave,
}: {
  index: number
  item: AttemptItem
  value: Record<string, unknown>
  artifacts: ArtifactOption[]
  disabled: boolean
  saving: boolean
  maxShortTextLength?: number
  onChange: (value: Record<string, unknown>) => void
  onSave: () => void
}) {
  const { type, prompt } = item.question
  const selected = Array.isArray(value.selectedOptionIds)
    ? value.selectedOptionIds.map(String)
    : []
  const ordered = Array.isArray(value.orderedItemIds)
    ? value.orderedItemIds.map(String)
    : []
  const placements =
    value.placements && typeof value.placements === 'object'
      ? (value.placements as Record<string, string>)
      : {}
  function move(itemId: string, direction: -1 | 1) {
    const next = [...ordered]
    const current = next.indexOf(itemId)
    const target = current + direction
    if (current < 0 || target < 0 || target >= next.length) return
    ;[next[current], next[target]] = [next[target]!, next[current]!]
    onChange({ orderedItemIds: next })
  }
  return (
    <article className="ui-card p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
            Câu {index + 1} · {item.points} điểm
          </p>
          <h2
            id={`question-${item.question.id}`}
            className="mt-1 text-lg font-bold leading-relaxed"
          >
            {prompt.stem}
          </h2>
        </div>
        {item.required && (
          <span className="shrink-0 rounded-full bg-coral-50 px-2 py-1 text-xs font-bold text-danger">
            Bắt buộc
          </span>
        )}
      </div>

      {(type === 'single_choice' || type === 'multiple_choice') && (
        <fieldset className="space-y-2" disabled={disabled}>
          <legend className="sr-only">Chọn câu trả lời</legend>
          {(prompt.options ?? []).map((option) => {
            const checked = selected.includes(option.id)
            return (
              <label
                key={option.id}
                className={cn(
                  'flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition',
                  checked ? 'border-brand-400 bg-brand-50' : 'border-border bg-white',
                )}
              >
                <input
                  type={type === 'single_choice' ? 'radio' : 'checkbox'}
                  name={type === 'single_choice' ? item.questionVersionId : undefined}
                  checked={checked}
                  onChange={() => {
                    const next =
                      type === 'single_choice'
                        ? [option.id]
                        : checked
                          ? selected.filter((id) => id !== option.id)
                          : [...selected, option.id]
                    onChange({ selectedOptionIds: next })
                  }}
                />
                <span className="font-semibold">{option.text}</span>
              </label>
            )
          })}
        </fieldset>
      )}

      {type === 'short_text' && (
        <textarea
          aria-labelledby={`question-${item.question.id}`}
          className="min-h-36 w-full rounded-2xl border-2 border-border bg-white p-4 outline-none focus:border-brand-400"
          value={typeof value.text === 'string' ? value.text : ''}
          minLength={prompt.minLength}
          maxLength={
            maxShortTextLength === undefined
              ? prompt.maxLength
              : Math.min(
                  prompt.maxLength ?? maxShortTextLength,
                  maxShortTextLength,
                )
          }
          disabled={disabled}
          onChange={(event) => onChange({ text: event.target.value })}
          placeholder="Viết câu trả lời của con…"
        />
      )}

      {type === 'ordering' && (
        <ol className="space-y-2">
          {ordered.map((itemId, orderIndex) => {
            const row = prompt.items?.find((candidate) => candidate.id === itemId)
            return (
              <li
                key={itemId}
                className="flex min-h-12 items-center gap-3 rounded-2xl border-2 border-border bg-white px-3 py-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 font-bold text-brand-700">
                  {orderIndex + 1}
                </span>
                <span className="min-w-0 flex-1 font-semibold">{row?.text}</span>
                <button
                  type="button"
                  className="min-h-11 min-w-11 rounded-xl hover:bg-sky-50 disabled:opacity-30"
                  disabled={disabled || orderIndex === 0}
                  onClick={() => move(itemId, -1)}
                  aria-label={`Đưa ${row?.text} lên`}
                >
                  <ArrowUp className="mx-auto" size={18} />
                </button>
                <button
                  type="button"
                  className="min-h-11 min-w-11 rounded-xl hover:bg-sky-50 disabled:opacity-30"
                  disabled={disabled || orderIndex === ordered.length - 1}
                  onClick={() => move(itemId, 1)}
                  aria-label={`Đưa ${row?.text} xuống`}
                >
                  <ArrowDown className="mx-auto" size={18} />
                </button>
              </li>
            )
          })}
        </ol>
      )}

      {type === 'drag_drop' && (
        <div className="space-y-3">
          {(prompt.items ?? []).map((row) => (
            <label key={row.id} className="grid gap-1 sm:grid-cols-[1fr_1fr] sm:items-center">
              <span className="font-semibold">{row.text}</span>
              <select
                className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
                disabled={disabled}
                value={placements[row.id] ?? ''}
                onChange={(event) =>
                  onChange({
                    placements: { ...placements, [row.id]: event.target.value },
                  })
                }
              >
                <option value="">Chọn nhóm phù hợp</option>
                {(prompt.targets ?? []).map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.text}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      {type === 'artifact' && (
        <label className="grid gap-2">
          <span className="font-bold">Chọn tác phẩm trong portfolio</span>
          <select
            className="min-h-12 rounded-2xl border-2 border-border bg-white px-4"
            disabled={disabled}
            value={`${String(value.sourceType ?? 'project')}:${String(value.sourceId ?? '')}`}
            onChange={(event) => {
              const [sourceType, sourceId] = event.target.value.split(':')
              onChange({ sourceType, sourceId })
            }}
          >
            <option value="project:">Chọn một tác phẩm</option>
            {artifacts
              .filter((row) => prompt.allowedSources?.includes(row.sourceType))
              .map((row) => (
                <option key={`${row.sourceType}:${row.id}`} value={`${row.sourceType}:${row.id}`}>
                  {row.label}
                </option>
              ))}
          </select>
          {artifacts.length === 0 && (
            <span className="text-sm text-muted">
              Chưa có tác phẩm phù hợp. Con có thể tạo trong Xưởng sáng tạo trước.
            </span>
          )}
        </label>
      )}

      {disabled ? null : (
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" disabled={saving} onClick={onSave}>
            <Save size={18} aria-hidden="true" />
            {saving ? 'Đang lưu…' : 'Lưu câu trả lời'}
          </Button>
        </div>
      )}
    </article>
  )
}
