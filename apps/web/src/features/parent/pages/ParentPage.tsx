import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'

type Approval = {
  id: string
  status: string
  destination: string
  project: { id: string; title: string; kind: string; thumbnail: string }
  child: { id: string; nickname: string | null }
}

type Child = {
  id: string
  nickname: string | null
  avatarId: string | null
  level: number
  xp: number
  completedQuests?: number
  totalStars?: number
  projectCount?: number
}

type ChildProgress = {
  child: { id: string; nickname: string | null; level: number; xp: number }
  courseId: string
  quests: Array<{
    id: string
    order: number
    title: string
    status: string
    stars: number
    videoUrl: string | null
  }>
}

export function ParentPage({
  tab = 'approvals',
}: {
  tab?: 'approvals' | 'kids'
}) {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [kids, setKids] = useState<Child[]>([])
  const [progress, setProgress] = useState<ChildProgress | null>(null)
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  async function load() {
    setError(null)
    if (tab === 'kids') {
      const data = await api<{ children: Child[] }>('/api/parent/children')
      setKids(data.children)
    } else {
      const data = await api<{ approvals: Approval[] }>(
        '/api/parent/approvals?status=pending',
      )
      setApprovals(data.approvals)
    }
  }

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Lỗi'))
  }, [tab])

  async function decide(id: string, decision: 'approved' | 'rejected') {
    await api(`/api/parent/approvals/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    })
    setMsg(decision === 'approved' ? 'Đã cho phép chia sẻ' : 'Đã giữ riêng tư')
    await load()
  }

  async function viewProgress(childId: string) {
    setSelectedChild(childId)
    const data = await api<ChildProgress>(
      `/api/parent/children/${childId}/progress?courseId=course-comic`,
    )
    setProgress(data)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mint-500">
            CMS · Phụ huynh
          </p>
          <h1 className="font-display text-3xl">
            {tab === 'kids' ? 'Con của tôi' : 'Duyệt chia sẻ'}
          </h1>
          <p className="text-muted text-sm">
            Sáng tạo của trẻ mặc định riêng tư — chỉ hiện khi ba/mẹ đồng ý.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            await logout()
            navigate('/')
          }}
        >
          Đăng xuất
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/parent"
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-extrabold',
            tab === 'approvals'
              ? 'bg-white text-brand-600 shadow-soft'
              : 'bg-brand-50 text-muted',
          )}
        >
          Duyệt chia sẻ
        </Link>
        <Link
          to="/parent/kids"
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-extrabold',
            tab === 'kids'
              ? 'bg-white text-brand-600 shadow-soft'
              : 'bg-brand-50 text-muted',
          )}
        >
          Con của tôi
        </Link>
      </div>

      {msg && <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm">{msg}</p>}
      {error && (
        <p className="rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {tab === 'kids' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            {kids.length === 0 && (
              <p className="text-muted">Chưa có hồ sơ con liên kết.</p>
            )}
            {kids.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => void viewProgress(k.id)}
                className={cn(
                  'ui-card p-4 text-left transition hover:ring-2 hover:ring-brand-500',
                  selectedChild === k.id && 'ring-2 ring-brand-500',
                )}
              >
                <p className="font-extrabold text-lg">{k.nickname}</p>
                <p className="text-sm text-muted">
                  Cấp {k.level} · {k.xp} XP · {k.completedQuests ?? 0} trạm ·{' '}
                  {k.totalStars ?? 0} sao
                </p>
              </button>
            ))}
          </div>
          <div className="ui-card p-4">
            <h2 className="mb-2 font-display text-xl">Tiến độ khóa truyện tranh</h2>
            {!progress && (
              <p className="text-sm text-muted">Chọn một con để xem tiến độ.</p>
            )}
            {progress && (
              <ul className="space-y-2 text-sm">
                {progress.quests.map((q) => (
                  <li
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50/70 px-3 py-2"
                  >
                    <span className="font-bold">
                      #{q.order} {q.title}
                    </span>
                    <span className="text-xs text-muted">
                      {q.status} · ⭐ {q.stars}
                      {q.videoUrl ? ' · 🎬' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {approvals.length === 0 && (
            <p className="text-muted">Không có yêu cầu chờ duyệt.</p>
          )}
          {approvals.map((a) => (
            <div
              key={a.id}
              className="ui-card flex flex-wrap items-center gap-4 p-4"
            >
              <img
                src={a.project.thumbnail}
                alt=""
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-extrabold">{a.project.title}</p>
                <p className="text-sm text-muted">
                  {a.child.nickname} · gửi tới {a.destination}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => void decide(a.id, 'approved')}>
                  Cho phép
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void decide(a.id, 'rejected')}
                >
                  Giữ riêng
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
