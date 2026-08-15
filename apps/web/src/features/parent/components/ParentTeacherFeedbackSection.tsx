import { useEffect, useState } from 'react'
import { MessageSquareText } from 'lucide-react'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { api } from '@/shared/lib/api'

type Feedback = {
  id: string
  body: string
  strengths: string[]
  development: string[]
  scorePercent: number | null
  publishedAt: string | null
  teacher: { name: string | null }
}

type Props = { childId: string }

function formatDate(value: string | null) {
  if (!value) return 'Vừa cập nhật'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function ParentTeacherFeedbackSection({ childId }: Props) {
  const [child, setChild] = useState<{ name: string | null; ageBand: string | null; level: number | null } | null>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void api<{ child: typeof child; feedback: Feedback[] }>(`/api/v1/lms/family/children/${encodeURIComponent(childId)}/teacher-feedback`)
      .then((result) => {
        if (cancelled) return
        setChild(result.child)
        setFeedback(result.feedback)
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Không tải được nhận xét giáo viên.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [childId])

  return (
    <section className="grid gap-5">
      <div className="ui-card flex flex-wrap items-start justify-between gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><MessageSquareText size={21} /></span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Cập nhật từ giáo viên</p>
            <h2 className="font-display text-2xl">Nhận xét giáo viên</h2>
            <p className="mt-1 text-sm text-muted">{child?.name ?? 'Học sinh'}</p>
          </div>
        </div>
        {child && <div className="rounded-2xl bg-brand-50 px-4 py-3 text-right text-sm text-brand-800"><p className="font-bold">Cấp {child.level ?? 1}</p><p>{child.ageBand ?? 'Đang cập nhật độ tuổi'}</p></div>}
      </div>

      {loading ? <div className="ui-card p-5 text-sm text-muted">Đang tải nhận xét…</div> : error ? <div className="ui-card p-5 text-sm text-rose-700">{error}</div> : feedback.length === 0 ? <EmptyState title="Chưa có nhận xét mới" description="Khi giáo viên công bố nhận xét, nội dung sẽ xuất hiện tại đây." /> : <div className="grid gap-4">{feedback.map((item) => <article key={item.id} className="ui-card grid gap-4 p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-extrabold text-slate-900">{item.teacher.name ?? 'Giáo viên'}</p><p className="mt-1 text-xs text-muted">{formatDate(item.publishedAt)}</p></div>{item.scorePercent !== null && <span className="rounded-full bg-mint-50 px-3 py-1 text-sm font-extrabold text-mint-700">Tiến bộ {item.scorePercent}%</span>}</div><p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{item.body}</p><div className="grid gap-3 sm:grid-cols-2">{item.strengths.length > 0 && <div className="rounded-2xl bg-mint-50 p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-mint-700">Điểm mạnh</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{item.strengths.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>}{item.development.length > 0 && <div className="rounded-2xl bg-sun-50 p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-amber-700">Rèn thêm</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{item.development.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>}</div></article>)}</div>}
    </section>
  )
}
