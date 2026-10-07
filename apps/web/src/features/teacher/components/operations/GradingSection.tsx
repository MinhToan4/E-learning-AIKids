import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { api } from '@/shared/lib/api'
import { reviewResponseSummary } from '../../lib/grading'
import type { Review } from './types'

export interface GradingSectionProps {
  reviews: Review[]
  onDone: () => void
  showToast: (message: string, kind: 'success' | 'error') => void
}

export function GradingSection({
  reviews,
  onDone,
  showToast,
}: GradingSectionProps) {
  const [forms, setForms] = useState<
    Record<string, { scores: Record<string, number>; feedback: string }>
  >({})
  const [busy, setBusy] = useState<string | null>(null)
  const [resubmitReasons, setResubmitReasons] = useState<Record<string, string>>({})
  const [publishReasons, setPublishReasons] = useState<Record<string, string>>({})

  function form(review: Review) {
    return (
      forms[review.id] ?? {
        scores: review.rubricScores ?? {},
        feedback: review.feedback ?? '',
      }
    )
  }

  async function save(review: Review) {
    setBusy(review.id)
    try {
      const current = form(review)
      await api(`/api/teacher/grading/reviews/${review.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          version: review.version,
          rubricScores: current.scores,
          feedback: current.feedback,
        }),
      })
      showToast('Đã lưu phiếu chấm.', 'success')
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không lưu được phiếu chấm.', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function publish(attemptId: string) {
    const reason = publishReasons[attemptId]?.trim() ?? ''
    if (reason.length < 5) {
      showToast('Hãy nhập lý do công bố ít nhất 5 ký tự.', 'error')
      return
    }
    setBusy(attemptId)
    try {
      await api(`/api/teacher/grading/attempts/${attemptId}/publish`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      showToast('Đã công bố kết quả cho học viên và phụ huynh.', 'success')
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Chưa thể công bố.', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function requestResubmission(attemptId: string) {
    const reason = resubmitReasons[attemptId]?.trim() ?? ''
    if (reason.length < 5) {
      showToast('Hãy nhập lý do nộp lại ít nhất 5 ký tự.', 'error')
      return
    }
    setBusy(attemptId)
    try {
      await api(`/api/teacher/grading/attempts/${attemptId}/request-resubmission`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      showToast('Đã trả bài và mở lượt nộp lại theo chính sách đề.', 'success')
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không thể yêu cầu nộp lại.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const grouped = [...new Set(reviews.map((review) => review.attemptId))]
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="Không có bài chờ chấm"
        description="Câu tự luận và sản phẩm cần rubric sẽ xuất hiện tại đây."
      />
    )
  }

  return (
    <div className="space-y-5">
      {grouped.map((attemptId) => {
        const rows = reviews.filter((review) => review.attemptId === attemptId)
        const ready = rows.every((review) => review.status === 'reviewed')
        const first = rows[0]
        const canResubmit = Boolean(
          first && first.attemptNumber < first.maxAttempts,
        )
        return (
          <section key={attemptId} className="ui-card p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-sky-600">
                  {rows[0]?.student.nickname ?? 'Học viên'}
                </p>
                <h2 className="font-display text-xl">{rows[0]?.assessment.title}</h2>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <label className="grid min-w-64 gap-1 text-sm font-bold">
                  Lý do công bố
                  <input
                    minLength={5}
                    maxLength={500}
                    className="field-input"
                    value={publishReasons[attemptId] ?? ''}
                    onChange={(event) =>
                      setPublishReasons({
                        ...publishReasons,
                        [attemptId]: event.target.value,
                      })
                    }
                  />
                </label>
                <Button
                  className="self-end"
                  disabled={
                    !ready ||
                    busy === attemptId ||
                    (publishReasons[attemptId]?.trim().length ?? 0) < 5
                  }
                  onClick={() => void publish(attemptId)}
                >
                  {busy === attemptId ? 'Đang xử lý…' : 'Công bố kết quả'}
                </Button>
              </div>
            </div>
            {canResubmit && (
              <div className="mb-4 grid gap-2 rounded-2xl border border-sun-200 bg-sun-50 p-3 sm:grid-cols-[1fr_auto]">
                <label className="grid gap-1 text-sm font-bold">
                  Lý do yêu cầu nộp lại (lượt {first!.attemptNumber}/{first!.maxAttempts})
                  <input
                    minLength={5}
                    maxLength={2_000}
                    className="field-input bg-white"
                    value={resubmitReasons[attemptId] ?? ''}
                    onChange={(event) =>
                      setResubmitReasons({
                        ...resubmitReasons,
                        [attemptId]: event.target.value,
                      })
                    }
                  />
                </label>
                <Button
                  variant="secondary"
                  className="self-end"
                  disabled={
                    busy === attemptId ||
                    (resubmitReasons[attemptId]?.trim().length ?? 0) < 5
                  }
                  onClick={() => void requestResubmission(attemptId)}
                >
                  Yêu cầu nộp lại
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {rows.map((review, index) => {
                const current = form(review)
                const criteria = review.question.rubric.criteria ?? []
                const responseSummary = reviewResponseSummary({
                  questionType: review.question.type,
                  response: review.response,
                  artifact: review.artifact,
                })
                return (
                  <article key={review.id} className="rounded-2xl bg-sky-50/60 p-4">
                    <p className="text-xs font-bold text-muted">Nội dung {index + 1}</p>
                    <h3 className="mt-1 font-bold">
                      {review.question.prompt.stem ?? 'Sản phẩm học tập'}
                    </h3>
                    <div className="mt-2 rounded-xl bg-white p-3">
                      <p className="text-xs font-bold text-muted">
                        {responseSummary.label}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                        {responseSummary.value}
                      </p>
                      {responseSummary.detail && (
                        <p className="mt-1 text-xs text-muted">
                          {responseSummary.detail}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {criteria.map((criterion) => (
                        <label key={criterion.id} className="grid gap-1 text-sm font-bold">
                          {criterion.label} / {criterion.maxPoints}
                          <input
                            type="number"
                            min={0}
                            max={criterion.maxPoints}
                            step="0.5"
                            disabled={review.status === 'published'}
                            className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
                            value={current.scores[criterion.id] ?? ''}
                            onChange={(event) =>
                              setForms({
                                ...forms,
                                [review.id]: {
                                  ...current,
                                  scores: {
                                    ...current.scores,
                                    [criterion.id]: Number(event.target.value),
                                  },
                                },
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <label className="mt-3 grid gap-1 text-sm font-bold">
                      Phản hồi cho học viên
                      <textarea
                        minLength={2}
                        maxLength={2_000}
                        disabled={review.status === 'published'}
                        className="min-h-24 rounded-xl border-2 border-border bg-white p-3"
                        value={current.feedback}
                        onChange={(event) =>
                          setForms({
                            ...forms,
                            [review.id]: { ...current, feedback: event.target.value },
                          })
                        }
                      />
                    </label>
                    {review.status !== 'published' && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="secondary"
                          disabled={busy === review.id}
                          onClick={() => void save(review)}
                        >
                          {busy === review.id ? 'Đang lưu…' : 'Lưu phiếu chấm'}
                        </Button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
