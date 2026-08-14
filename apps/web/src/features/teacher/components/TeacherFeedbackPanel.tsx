import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Check, MessageSquareText, Search, Send } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { api } from '@/shared/lib/api'

type ClassroomLearner = {
  id: string
  nickname: string | null
  ageBand?: string
  level?: number
}

type Classroom = {
  id: string
  name: string
  learners: ClassroomLearner[]
}

type StudentContext = {
  student: {
    nickname: string | null
    profile: {
      name: string | null
      avatarUrl: string | null
      ageBand: string | null
      interests: string[]
      level: number
      xp: number
    }
  }
  recipient: { name: string | null; role: 'parent' | 'account_holder' }
  summary: {
    completedQuests: number
    totalQuests: number
    totalStars: number
    totalXp: number
    currentQuest: string | null
    currentPhase: string | null
    lastActiveAt: string | null
  }
}

type TeacherFeedback = {
  id: string
  body: string
  strengths: string[]
  development: string[]
  scorePercent: number | null
  status: 'draft' | 'published'
  version: number
  updatedAt: string
  student?: { name: string | null }
}

type Props = {
  classes: Classroom[]
  initialLearnerId?: string
  showToast: (message: string, kind: 'success' | 'error') => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function splitLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function TeacherFeedbackPanel({ classes, initialLearnerId, showToast }: Props) {
  const learners = useMemo(
    () => [...new Map(classes.flatMap((classroom) => classroom.learners).map((learner) => [learner.id, learner])).values()],
    [classes],
  )
  const [query, setQuery] = useState('')
  const [learnerId, setLearnerId] = useState(initialLearnerId ?? learners[0]?.id ?? '')
  const [feedback, setFeedback] = useState<TeacherFeedback[]>([])
  const [context, setContext] = useState<StudentContext | null>(null)
  const [editing, setEditing] = useState<TeacherFeedback | null>(null)
  const [body, setBody] = useState('')
  const [strengths, setStrengths] = useState('')
  const [development, setDevelopment] = useState('')
  const [scorePercent, setScorePercent] = useState<number | ''>('')
  const [busy, setBusy] = useState(false)

  const selectedClass = classes.find((classroom) => classroom.learners.some((learner) => learner.id === learnerId))
  const selectedClassId = selectedClass?.id ?? ''
  const filteredLearners = learners.filter((learner) => {
    const needle = query.trim().toLocaleLowerCase()
    return !needle || (learner.nickname ?? 'Học viên').toLocaleLowerCase().includes(needle)
  })

  useEffect(() => {
    if (!learnerId) return
    const load = async () => {
      try {
        const [studentResult, feedbackResult] = await Promise.all([
          api<StudentContext>(`/api/v1/lms/aikids/teacher/students/${encodeURIComponent(learnerId)}/progress`),
          selectedClassId
            ? api<{ feedback: TeacherFeedback[] }>(`/api/v1/lms/classrooms/${encodeURIComponent(selectedClassId)}/learners/${encodeURIComponent(learnerId)}/teacher-feedback`)
            : Promise.resolve({ feedback: [] }),
        ])
        setContext(studentResult)
        setFeedback(feedbackResult.feedback)
      } catch (cause) {
        setContext(null)
        setFeedback([])
        showToast(cause instanceof Error ? cause.message : 'Không tải được dữ liệu học sinh.', 'error')
      }
    }
    void load()
  }, [learnerId, selectedClassId, showToast])

  function resetForm() {
    setEditing(null)
    setBody('')
    setStrengths('')
    setDevelopment('')
    setScorePercent('')
  }

  function edit(item: TeacherFeedback) {
    setEditing(item)
    setBody(item.body)
    setStrengths(item.strengths.join('\n'))
    setDevelopment(item.development.join('\n'))
    setScorePercent(item.scorePercent ?? '')
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!selectedClass || !learnerId || !body.trim()) return
    setBusy(true)
    try {
      const base = `/api/v1/lms/classrooms/${encodeURIComponent(selectedClass.id)}/learners/${encodeURIComponent(learnerId)}/teacher-feedback`
      const payload = {
        body: body.trim(),
        strengths: splitLines(strengths),
        development: splitLines(development),
        scorePercent: scorePercent === '' ? null : scorePercent,
      }
      if (editing) {
        await api(`${base}/${encodeURIComponent(editing.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...payload, expectedVersion: editing.version }),
        })
      } else {
        await api(base, { method: 'POST', body: JSON.stringify(payload) })
      }
      resetForm()
      const result = await api<{ feedback: TeacherFeedback[] }>(base)
      setFeedback(result.feedback)
      showToast(editing ? 'Đã cập nhật bản nháp.' : 'Đã lưu bản nháp nhận xét.', 'success')
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không lưu được nhận xét.', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function publish(item: TeacherFeedback) {
    if (!selectedClass) return
    setBusy(true)
    try {
      await api(`/api/v1/lms/classrooms/${encodeURIComponent(selectedClass.id)}/learners/${encodeURIComponent(learnerId)}/teacher-feedback/${encodeURIComponent(item.id)}/publish`, {
        method: 'POST',
        body: JSON.stringify({ expectedVersion: item.version, reason: 'Đánh giá tiến bộ học tập' }),
      })
      const result = await api<{ feedback: TeacherFeedback[] }>(`/api/v1/lms/classrooms/${encodeURIComponent(selectedClass.id)}/learners/${encodeURIComponent(learnerId)}/teacher-feedback`)
      setFeedback(result.feedback)
      showToast('Đã công bố nhận xét cho phụ huynh.', 'success')
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không công bố được nhận xét.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="ui-card grid gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><MessageSquareText size={21} /></span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Kết nối gia đình</p>
            <h2 className="font-display text-2xl">Nhận xét cho phụ huynh</h2>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{feedback.length} bản ghi</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="rounded-2xl border border-border bg-slate-50 p-3">
          <label className="relative block">
            <span className="sr-only">Tìm học sinh</span>
            <Search size={17} className="absolute left-3 top-3 text-muted" />
            <input className="min-h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên học sinh" />
          </label>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto" role="listbox" aria-label="Chọn học sinh">
            {filteredLearners.map((learner) => (
              <button key={learner.id} type="button" role="option" aria-selected={learner.id === learnerId} onClick={() => setLearnerId(learner.id)} className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-bold ${learner.id === learnerId ? 'bg-brand-500 text-white' : 'bg-white text-slate-700 hover:bg-brand-50'}`}>
                <span>{learner.nickname ?? 'Học viên'}</span>
                {learner.id === learnerId && <Check size={16} />}
              </button>
            ))}
            {!filteredLearners.length && <p className="p-3 text-xs text-muted">Không tìm thấy học sinh.</p>}
          </div>
        </div>

        <div className="grid gap-4">
          {context && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-brand-700">Đang nhận xét cho</p>
                  <h3 className="mt-1 font-display text-xl text-slate-900">{context.student.profile.name ?? context.student.nickname ?? 'Học viên'}</h3>
                  <p className="mt-1 text-sm text-slate-600">Phụ huynh: {context.recipient.name ?? 'Tài khoản gia đình'} · Cấp {context.student.profile.level} · {context.student.profile.xp} XP</p>
                </div>
                <div className="text-right text-xs text-slate-600"><p>{context.summary.completedQuests}/{context.summary.totalQuests} bài hoàn thành</p><p>{context.summary.totalStars} sao · {context.summary.totalXp} XP</p></div>
              </div>
            </div>
          )}

          <form className="grid gap-3 rounded-2xl border border-border p-4" onSubmit={(event) => void save(event)}>
            <textarea className="min-h-28 rounded-xl border border-border p-3 text-sm" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Viết nhận xét cụ thể, tích cực và dễ hiểu cho gia đình…" maxLength={10_000} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <textarea className="min-h-20 rounded-xl border border-border p-3 text-sm" value={strengths} onChange={(event) => setStrengths(event.target.value)} placeholder="Điểm mạnh (mỗi ý một dòng)" />
              <textarea className="min-h-20 rounded-xl border border-border p-3 text-sm" value={development} onChange={(event) => setDevelopment(event.target.value)} placeholder="Điểm cần rèn thêm (mỗi ý một dòng)" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-bold">Mức tiến bộ (%)<input className="min-h-10 w-24 rounded-xl border border-border px-3" type="number" min="0" max="100" value={scorePercent} onChange={(event) => setScorePercent(event.target.value === '' ? '' : Number(event.target.value))} /></label>
              <div className="flex gap-2"><Button type="button" variant="ghost" onClick={resetForm} disabled={busy}>Xóa form</Button><Button type="submit" disabled={busy || !learnerId}>{editing ? 'Lưu bản nháp' : 'Lưu nhận xét'} </Button></div>
            </div>
          </form>

          <div className="space-y-3">
            {feedback.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{item.status === 'draft' ? 'Bản nháp' : 'Đã gửi phụ huynh'}</span><p className="mt-2 text-xs text-muted">Cập nhật {formatDate(item.updatedAt)}</p></div>{item.status === 'draft' && <div className="flex gap-2"><Button variant="secondary" onClick={() => edit(item)} disabled={busy}>Chỉnh sửa</Button><Button onClick={() => void publish(item)} disabled={busy}><Send size={16} />Gửi phụ huynh</Button></div>}</div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p>
              </article>
            ))}
            {!feedback.length && <p className="rounded-2xl bg-slate-50 p-5 text-sm text-muted">Chưa có nhận xét cho học sinh này.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
