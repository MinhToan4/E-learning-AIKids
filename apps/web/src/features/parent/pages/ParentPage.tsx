import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import {
  STUDENT_AVATARS,
  avatarEmoji as avatarEmojiFromCatalog,
} from '@/shared/config/avatars'

// ── Types ─────────────────────────────────────────────────────
type Approval = {
  id: string
  status: string
  destination: string
  shareStatus: string
  project: { id: string; title: string; kind: string; thumbnail: string }
  child: { id: string; nickname: string | null }
}

type Child = {
  id: string
  nickname: string | null
  avatarId: string | null
  level: number
  xp: number
  active: boolean
  hasPin?: boolean
  completedQuests?: number
  totalStars?: number
  projectCount?: number
}

type HouseholdSub = {
  planCode: string
  planName: string
  status: string
  maxChildren: number
  maxOpenCoursesPerChild: number
  childCount: number
  seatsRemaining: number
  features: string[]
  currentPeriodEnd: string | null
}

type PlanRow = {
  code: string
  name: string
  tagline: string
  maxChildren: number
  maxOpenCoursesPerChild: number
  priceMonthly: number
  currency: string
  features: string[]
}

type QuestProg = {
  id: string
  order: number
  title: string
  status: string
  stars: number
  videoUrl: string | null
}

type ChildProgress = {
  child: { id: string; nickname: string | null; level: number; xp: number }
  courseId: string | null
  courses: Array<{ id: string; title: string; shortTitle: string; ageLabel: string }>
  summary: {
    completed: number
    total: number
    totalStars: number
    currentPhase: string | null
  }
  insights: {
    strengths: string[]
    nextFocus: string | null
    outcomes: string[]
  }
  quests: QuestProg[]
}

type ParentProfileData = {
  phone: string | null
  preferredLanguage: string
  notificationPrefs: Record<string, unknown>
  maxChildren: number
}

import {
  ParentApprovalIcon,
  ParentKidsIcon,
} from '@/shared/components/icons/ParentIcons'
import {
  NavBadgeIcon,
  NavLeaderboardIcon,
} from '@/shared/components/icons/KidNavIcons'

type TabKey = 'dashboard' | 'kids' | 'approvals' | 'plan' | 'profile'

const AVATARS = STUDENT_AVATARS.map((a) => ({
  id: a.id,
  emoji: a.emoji,
  label: a.label,
  image: a.image,
}))

function avatarEmoji(id: string | null) {
  return avatarEmojiFromCatalog(id)
}

// ── Main Component ────────────────────────────────────────────
export function ParentPage({
  tab: initTab = 'dashboard',
}: {
  tab?: TabKey
}) {
  const [tab, setTab] = useState<TabKey>(initTab)
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  useEffect(() => {
    setTab(initTab)
  }, [initTab])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-400">
            Phụ huynh
          </p>
          <h1 className="font-display text-2xl md:text-3xl">
            Xin chào, {user?.nickname ?? 'Ba/Mẹ'} 👋
          </h1>
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

      {/* Tab content */}
      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'kids' && <KidsTab />}
      {tab === 'plan' && <PlanTab />}
      {tab === 'approvals' && <ApprovalsTab />}
      {tab === 'profile' && <ProfileTab />}
    </div>
  )
}

// ── Plan Tab (gói gia đình) ───────────────────────────────────
function PlanTab() {
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [p, s] = await Promise.all([
        api<{ plans: PlanRow[] }>('/api/parent/plans'),
        api<{ subscription: HouseholdSub }>('/api/parent/subscription'),
      ])
      setPlans(p.plans)
      setSub(s.subscription)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải gói')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function activate(code: string) {
    setBusy(code)
    setMsg(null)
    setError(null)
    try {
      const data = await api<{
        subscription: HouseholdSub
        message: string
      }>('/api/parent/subscription', {
        method: 'POST',
        body: JSON.stringify({ planCode: code }),
      })
      setSub(data.subscription)
      setMsg(data.message)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không đổi được gói')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-4">
      <Toast
        msg={msg}
        error={error}
        onClear={() => {
          setMsg(null)
          setError(null)
        }}
      />
      <header className="ui-card p-5">
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
          Gói học gia đình
        </p>
        <h2 className="font-display text-2xl">Chọn gói phù hợp</h2>
        <p className="mt-1 text-sm text-muted">
          Ba/mẹ chọn gói, tạo hồ sơ cho từng con. Con vào học bằng biệt danh (và PIN nếu có)
          — không dùng mật khẩu của ba/mẹ.
        </p>
        {sub && (
          <p className="mt-3 rounded-xl bg-mint-100 px-3 py-2 text-sm font-bold text-success">
            Đang dùng: {sub.planName} · {sub.childCount}/{sub.maxChildren} con · tối đa{' '}
            {sub.maxOpenCoursesPerChild} khóa/con
          </p>
        )}
      </header>
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((p) => {
          const current = sub?.planCode === p.code
          return (
            <article
              key={p.code}
              className={cn(
                'ui-card flex flex-col gap-2 p-4',
                current && 'ring-2 ring-brand-500',
              )}
            >
              <h3 className="font-display text-xl">{p.name}</h3>
              <p className="text-sm text-muted">{p.tagline}</p>
              <p className="font-display text-2xl text-brand-600">
                {p.priceMonthly === 0
                  ? 'Miễn phí'
                  : `${p.priceMonthly.toLocaleString('vi-VN')} ${p.currency}/tháng`}
              </p>
              <ul className="mt-1 flex-1 space-y-1 text-sm text-muted">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Button
                disabled={current || busy === p.code}
                onClick={() => void activate(p.code)}
              >
                {current ? 'Đang dùng' : busy === p.code ? 'Đang…' : 'Chọn gói'}
              </Button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

// ── Dashboard Tab ─────────────────────────────────────────────
function DashboardTab() {
  const [kids, setKids] = useState<Child[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [childrenData, approvalsData] = await Promise.allSettled([
          api<{ children: Child[] }>('/api/parent/children'),
          api<{ approvals: Approval[] }>('/api/parent/approvals?status=pending'),
        ])
        if (childrenData.status === 'fulfilled') {
          setKids(childrenData.value.children)
        }
        if (approvalsData.status === 'fulfilled') {
          setPendingCount(approvalsData.value.approvals.length)
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) {
    return <LoadingSkeleton count={3} />
  }

  const totalXp = kids.reduce((s, k) => s + k.xp, 0)
  const totalStars = kids.reduce((s, k) => s + (k.totalStars ?? 0), 0)
  const totalQuests = kids.reduce((s, k) => s + (k.completedQuests ?? 0), 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={ParentKidsIcon} label="Số con" value={kids.length} color="brand" />
        <StatCard icon={NavBadgeIcon} label="Tổng sao" value={totalStars} color="sun" />
        <StatCard icon={NavLeaderboardIcon} label="Quests xong" value={totalQuests} color="mint" />
        <StatCard icon={ParentApprovalIcon} label="Chờ duyệt" value={pendingCount} color="coral" />
      </div>

      {/* XP summary */}
      <div className="ui-card p-4">
        <h3 className="mb-3 font-display text-lg">🎮 Tổng XP gia đình: {totalXp}</h3>
        <div className="flex flex-col gap-2">
          {kids.map((k) => (
            <div key={k.id} className="flex items-center gap-3">
              <span className="text-2xl">{avatarEmoji(k.avatarId)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{k.nickname}</p>
                <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-brand-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500 transition-all duration-500"
                    style={{ width: `${Math.min((k.xp / Math.max(totalXp, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-muted">
                Lv.{k.level} · {k.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/parent/kids"
          className="ui-card flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-brand-300"
        >
          <span className="text-3xl">👧</span>
          <div>
            <p className="font-bold">Quản lý con</p>
            <p className="text-xs text-muted">Thêm, sửa, xem tiến trình</p>
          </div>
        </Link>
        <Link
          to="/parent/approvals"
          className="ui-card flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-coral-300"
        >
          <span className="text-3xl">🔔</span>
          <div>
            <p className="font-bold">Duyệt chia sẻ</p>
            <p className="text-xs text-muted">{pendingCount} yêu cầu đang chờ</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

// ── Kids Tab ──────────────────────────────────────────────────
function KidsTab() {
  const [kids, setKids] = useState<Child[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [progress, setProgress] = useState<ChildProgress | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editChild, setEditChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enterPin, setEnterPin] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null)
  const enterAsChild = useAuth((s) => s.enterAsChild)
  const navigate = useNavigate()

  const loadKids = useCallback(async () => {
    setError(null)
    try {
      const data = await api<{
        children: Child[]
        subscription: HouseholdSub
      }>('/api/parent/children')
      setKids(data.children)
      setSub(data.subscription)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadKids()
  }, [loadKids])

  async function viewProgress(childId: string, courseId?: string) {
    setSelectedChild(childId)
    setProgress(null)
    try {
      const data = await api<ChildProgress>(
        `/api/parent/children/${childId}/progress${courseId ? `?courseId=${encodeURIComponent(courseId)}` : ''}`,
      )
      setProgress(data)
    } catch {
      setProgress(null)
    }
  }

  async function deleteChild(childId: string) {
    try {
      await api(`/api/parent/children/${childId}`, { method: 'DELETE' })
      setMsg('Tài khoản con đã được vô hiệu hóa.')
      await loadKids()
      setDeleteTarget(null)
      if (selectedChild === childId) {
        setSelectedChild(null)
        setProgress(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi')
      setDeleteTarget(null)
    }
  }

  async function playAsChild(child: Child) {
    try {
      const pin = child.hasPin ? enterPin : undefined
      if (child.hasPin && (!pin || pin.length !== 6)) {
        setSelectedChild(child.id)
        setError('Cần mã PIN đủ 6 số để mở hồ sơ con')
        return
      }
      await enterAsChild(child.id, pin || undefined)
      navigate('/home')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không vào được hồ sơ con')
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  const maxKids = sub?.maxChildren ?? 5
  const seatsLeft = sub?.seatsRemaining ?? Math.max(0, maxKids - kids.length)

  return (
    <div className="flex flex-col gap-4">
      <Toast msg={msg} error={error} onClear={() => { setMsg(null); setError(null) }} />

      {sub && (
        <div className="ui-card flex flex-wrap items-center justify-between gap-2 bg-brand-50/50 p-4">
          <div>
            <p className="text-xs font-bold uppercase text-muted">Gói gia đình</p>
            <p className="font-display text-lg text-brand-600">
              {sub.planName} · {sub.childCount}/{sub.maxChildren} ghế con
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/kids">
              <Button className="!min-h-10 !text-sm">Cho con học</Button>
            </Link>
            <Link
              to="/parent/plan"
              className="text-sm font-bold text-brand-500 hover:underline self-center"
            >
              Đổi gói →
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl">
          👧 Con của tôi ({kids.filter((k) => k.active !== false).length}/{maxKids})
        </h2>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditChild(null)
          }}
          disabled={seatsLeft <= 0}
        >
          + Thêm con
        </Button>
      </div>
      <p className="text-sm text-muted">
        Ba/mẹ tạo hồ sơ cho con. Trên máy ở nhà, bấm “Vào học” để đưa máy cho con — không cần mật khẩu
        ba/mẹ.
      </p>

      {showForm && (
        <ChildForm
          child={editChild}
          onSuccess={async () => {
            setShowForm(false)
            setEditChild(null)
            setMsg(editChild ? 'Đã cập nhật!' : 'Đã tạo tài khoản con!')
            await loadKids()
          }}
          onCancel={() => { setShowForm(false); setEditChild(null) }}
          onError={(e) => setError(e)}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Child list */}
        <div className="flex flex-col gap-3">
          {kids.length === 0 && (
            <div className="ui-card p-6 text-center">
              <p className="text-3xl">👶</p>
              <p className="mt-2 font-bold">Chưa có con nào</p>
              <p className="text-sm text-muted">Nhấn "Thêm con" để bắt đầu</p>
            </div>
          )}
          {kids.map((k) => (
            <div
              key={k.id}
              className={cn(
                'ui-card flex items-center gap-3 p-4 transition',
                selectedChild === k.id && 'ring-2 ring-brand-500',
                !k.active && 'opacity-50',
              )}
            >
              <button
                type="button"
                onClick={() => void viewProgress(k.id)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span className="text-3xl">{avatarEmoji(k.avatarId)}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-lg">{k.nickname}</p>
                  <p className="text-sm text-muted">
                    Cấp {k.level} · {k.xp} XP · {k.completedQuests ?? 0} trạm · {k.totalStars ?? 0} ⭐
                  </p>
                </div>
              </button>
              <div className="flex flex-col items-end gap-1">
                {k.hasPin && (
                  <input
                    className="w-20 rounded-lg border border-border px-1 py-0.5 font-mono text-xs"
                    placeholder="PIN"
                    maxLength={6}
                    value={selectedChild === k.id ? enterPin : ''}
                    onChange={(e) => {
                      setSelectedChild(k.id)
                      setEnterPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }}
                  />
                )}
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    className="!min-h-9 !px-2 !text-xs"
                    onClick={() => void playAsChild(k)}
                  >
                    Vào học
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditChild(k)
                      setShowForm(true)
                    }}
                    className="rounded-lg p-2 text-sm hover:bg-brand-50"
                    title="Sửa"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(k)}
                    className="rounded-lg p-2 text-sm hover:bg-coral-50"
                    title="Vô hiệu hóa"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress panel */}
        <div className="ui-card p-4">
          <h3 className="mb-3 font-display text-lg">📈 Tiến trình học</h3>
          {!selectedChild && (
            <p className="text-sm text-muted">Chọn một con để xem tiến trình.</p>
          )}
          {selectedChild && !progress && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
            </div>
          )}
          {progress && (
            <div className="flex flex-col gap-2">
              <div className="mb-2 rounded-xl bg-brand-50 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold">{progress.child.nickname}</span>
                  {progress.courses.length > 0 && (
                    <select
                      className="min-h-10 rounded-xl border-2 border-brand-100 bg-white px-2 text-xs font-bold"
                      value={progress.courseId ?? ''}
                      onChange={(event) => void viewProgress(progress.child.id, event.target.value)}
                      aria-label="Chọn khóa học để xem tiến trình"
                    >
                      {progress.courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.shortTitle || course.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <span className="ml-2 text-xs text-muted">
                  Lv.{progress.child.level} · {progress.child.xp} XP
                </span>
              </div>
              <div className="mb-2 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-mint-100/60 p-3 text-center">
                  <p className="font-display text-2xl text-success">{progress.summary.completed}/{progress.summary.total}</p>
                  <p className="text-[11px] font-bold text-muted">Bài hoàn thành</p>
                </div>
                <div className="rounded-2xl bg-sun-100/60 p-3 text-center">
                  <p className="font-display text-2xl text-warning">{progress.summary.totalStars}</p>
                  <p className="text-[11px] font-bold text-muted">Sao nỗ lực</p>
                </div>
                <div className="rounded-2xl bg-sky-100/60 p-3 text-center">
                  <p className="font-display text-lg text-sky-700">
                    {progress.summary.currentPhase === 'game'
                      ? 'Đang chơi'
                      : progress.summary.currentPhase === 'practice'
                        ? 'Đang làm'
                        : progress.summary.currentPhase === 'check'
                          ? 'Đang thử tài'
                          : 'Sẵn sàng'}
                  </p>
                  <p className="text-[11px] font-bold text-muted">Nhịp hiện tại</p>
                </div>
              </div>
              {(progress.insights.strengths.length > 0 || progress.insights.nextFocus) && (
                <div className="mb-2 grid gap-3 rounded-2xl bg-gradient-to-br from-sky-50 to-mint-100/40 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-success">Điều con đang làm tốt</p>
                    {progress.insights.strengths.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm">
                        {progress.insights.strengths.map((skill) => <li key={skill}>🌱 {skill}</li>)}
                      </ul>
                    ) : <p className="mt-2 text-sm text-muted">Con đang bắt đầu hành trình; hãy ghi nhận lần thử đầu tiên.</p>}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-sky-700">Ba/mẹ có thể hỏi con</p>
                    <p className="mt-2 text-sm leading-relaxed text-text">
                      {progress.insights.nextFocus
                        ? `“Con muốn kể cho ba/mẹ nghe về ${progress.insights.nextFocus.toLowerCase()} không?”`
                        : '“Sản phẩm nào trong khóa học làm con tự hào nhất?”'}
                    </p>
                  </div>
                </div>
              )}
              {progress.insights.outcomes.length > 0 && (
                <details className="mb-2 rounded-2xl border border-border bg-white p-3">
                  <summary className="cursor-pointer text-sm font-extrabold text-brand-600">Khóa học hướng tới những năng lực nào?</summary>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {progress.insights.outcomes.map((outcome) => <li key={outcome}>• {outcome}</li>)}
                  </ul>
                </details>
              )}
              {progress.courses.length === 0 && (
                <p className="rounded-2xl bg-page p-4 text-sm text-muted">
                  Con chưa tham gia khóa học nào. Ba/mẹ có thể vào hồ sơ của con để chọn khóa phù hợp.
                </p>
              )}
              {progress.quests.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                      q.status === 'completed'
                        ? 'bg-mint-100 text-mint-700'
                        : q.status === 'in_progress'
                          ? 'bg-sun-100 text-sun-700'
                          : 'bg-gray-100 text-gray-400',
                    )}>
                      {q.order}
                    </span>
                    <span className="text-sm font-bold">{q.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {q.status === 'completed' && <span>{'⭐'.repeat(q.stars)}</span>}
                    {q.videoUrl && <span>🎬</span>}
                    <span className={cn(
                      'rounded-md px-1.5 py-0.5 font-bold',
                      q.status === 'completed' && 'bg-mint-100 text-mint-700',
                      q.status === 'in_progress' && 'bg-sun-100 text-sun-700',
                      q.status === 'available' && 'bg-sky-100 text-sky-700',
                      q.status === 'locked' && 'bg-gray-100 text-gray-500',
                    )}>
                      {q.status === 'completed' ? 'Hoàn thành' : q.status === 'in_progress' ? 'Đang học' : q.status === 'available' ? 'Sẵn sàng' : 'Khóa'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Tạm khóa hồ sơ của con?"
        description="Con sẽ chưa thể vào học, nhưng toàn bộ tiến trình và sản phẩm vẫn được giữ để khôi phục sau."
        confirmLabel="Tạm khóa hồ sơ"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deleteChild(deleteTarget.id)
        }}
      />
    </div>
  )
}

// ── Child Form (Create / Edit) ────────────────────────────────
function ChildForm({
  child,
  onSuccess,
  onCancel,
  onError,
}: {
  child: Child | null
  onSuccess: () => void
  onCancel: () => void
  onError: (msg: string) => void
}) {
  const [nickname, setNickname] = useState(child?.nickname ?? '')
  const [avatarId, setAvatarId] = useState(child?.avatarId ?? 'avatar-robot')
  const [goal, setGoal] = useState<string>('comic')
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) {
      onError('Vui lòng nhập tên hiển thị.')
      return
    }
    if (pin && !/^\d{6}$/.test(pin)) {
      onError('Mã PIN cần đủ 6 chữ số, hoặc để trống nếu chưa dùng PIN.')
      return
    }
    setSaving(true)
    try {
      const pinPayload = pin ? { pin } : {}
      if (child) {
        await api(`/api/parent/children/${child.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            ...pinPayload,
          }),
        })
        if (pin) {
          await api(`/api/parent/children/${child.id}/pin`, {
            method: 'POST',
            body: JSON.stringify({ pin }),
          })
        }
      } else {
        const created = await api<{ child: { id: string } }>('/api/parent/children', {
          method: 'POST',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            goal,
            ...pinPayload,
          }),
        })
        if (pin && created.child?.id) {
          await api(`/api/parent/children/${created.child.id}/pin`, {
            method: 'POST',
            body: JSON.stringify({ pin }),
          })
        }
      }
      onSuccess()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Lỗi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="ui-card flex flex-col gap-4 p-5"
    >
      <h3 className="font-display text-lg">{child ? '✏️ Sửa thông tin con' : '👶 Thêm con mới'}</h3>

      <div>
        <label className="mb-1 block text-sm font-bold" htmlFor="child-nickname">
          Tên hiển thị
        </label>
        <input
          id="child-nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="VD: MựcCon, Bé An…"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold">Avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAvatarId(a.id)}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition',
                avatarId === a.id
                  ? 'bg-brand-100 ring-2 ring-brand-500 scale-110'
                  : 'bg-brand-50 hover:bg-brand-100',
              )}
            >
              {a.emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold" htmlFor="child-pin">
          Mã PIN 6 số (tuỳ chọn — khi cả nhà dùng chung máy)
        </label>
        <input
          id="child-pin"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full max-w-[12rem] rounded-xl border border-brand-200 px-3 py-2.5 font-mono tracking-widest"
          placeholder="······"
        />
        <p className="mt-1 text-xs text-muted">
          Con nhập PIN khi vào học. Không chia sẻ mật khẩu email của ba/mẹ.
        </p>
      </div>

      {!child && (
        <div>
          <label className="mb-1 block text-sm font-bold">Mục tiêu sáng tạo</label>
          <div className="flex gap-2">
            {[
              { value: 'comic', label: '📖 Truyện tranh', color: 'bg-sky-50' },
              { value: 'video', label: '🎬 Video', color: 'bg-mint-50' },
              { value: 'character', label: '🎨 Nhân vật', color: 'bg-sun-50' },
            ].map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGoal(g.value)}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-bold transition',
                  goal === g.value
                    ? 'bg-brand-100 ring-2 ring-brand-500'
                    : `${g.color} hover:ring-1 hover:ring-brand-300`,
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Đang lưu…' : child ? 'Cập nhật' : 'Tạo tài khoản'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  )
}

// ── Approvals Tab ─────────────────────────────────────────────
function ApprovalsTab() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await api<{ approvals: Approval[] }>('/api/parent/approvals?status=pending')
      setApprovals(data.approvals)
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function decide(id: string, decision: 'approved' | 'rejected') {
    await api(`/api/parent/approvals/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    })
    setMsg(decision === 'approved' ? '✅ Đã cho phép chia sẻ' : '🔒 Đã giữ riêng tư')
    await load()
    setTimeout(() => setMsg(null), 3000)
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-xl">🔔 Yêu cầu chia sẻ</h2>
      <p className="text-sm text-muted">
        Sáng tạo của trẻ mặc định riêng tư — chỉ hiện khi ba/mẹ đồng ý.
      </p>

      {msg && (
        <div className="rounded-xl bg-mint-100 px-4 py-2.5 text-sm font-bold text-mint-700 animate-in">
          {msg}
        </div>
      )}

      {approvals.length === 0 && (
        <div className="ui-card p-8 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 font-bold">Không có yêu cầu nào!</p>
          <p className="text-sm text-muted">Tất cả đã được xử lý.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {approvals.map((a) => (
          <div
            key={a.id}
            className="ui-card flex flex-wrap items-center gap-4 p-4 transition hover:shadow-lg"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-50 text-3xl">
              {a.project.kind === 'comic' ? '📖' : a.project.kind === 'video' ? '🎬' : '🎨'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{a.project.title}</p>
              <p className="text-sm text-muted">
                <span className="font-bold">{a.child.nickname}</span> muốn chia sẻ tới{' '}
                <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-bold text-sky-700">
                  {a.destination === 'family' ? 'Gia đình' : a.destination === 'class' ? 'Lớp học' : 'Công khai'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void decide(a.id, 'approved')}>
                ✅ Cho phép
              </Button>
              <Button variant="secondary" onClick={() => void decide(a.id, 'rejected')}>
                🔒 Giữ riêng
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Profile Tab ───────────────────────────────────────────────
function ProfileTab() {
  const user = useAuth((s) => s.user)
  const [profile, setProfile] = useState<ParentProfileData | null>(null)
  const [phone, setPhone] = useState('')
  const [lang, setLang] = useState('vi')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [changingPw, setChangingPw] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState<string | null>(null)
  const [pwErr, setPwErr] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await api<{ profile: ParentProfileData }>('/api/parent/profile')
        setProfile(data.profile)
        setPhone(data.profile.phone ?? '')
        setLang(data.profile.preferredLanguage)
      } catch {
        /* silent */
      }
    }
    void load()
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api('/api/parent/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          phone: phone || undefined,
          preferredLanguage: lang,
        }),
      })
      setMsg('✅ Đã lưu hồ sơ!')
      setTimeout(() => setMsg(null), 3000)
    } catch {
      setMsg('❌ Lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwErr(null)
    setPwMsg(null)
    if (newPw.length < 8) {
      setPwErr('Mật khẩu mới phải ≥ 8 ký tự')
      return
    }
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      setPwMsg('✅ Đã đổi mật khẩu!')
      setCurrentPw('')
      setNewPw('')
      setChangingPw(false)
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : 'Mật khẩu cũ không đúng')
    }
  }

  if (!profile) return <LoadingSkeleton count={2} />

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-xl">⚙️ Hồ sơ phụ huynh</h2>

      {msg && (
        <div className="rounded-xl bg-mint-100 px-4 py-2.5 text-sm font-bold text-mint-700">
          {msg}
        </div>
      )}

      <form onSubmit={(e) => void saveProfile(e)} className="ui-card flex flex-col gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold" htmlFor="prof-email">
              Email
            </label>
            <input
              id="prof-email"
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-muted"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold" htmlFor="prof-phone">
              Số điện thoại
            </label>
            <input
              id="prof-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={15}
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="0909 xxx xxx"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">Ngôn ngữ ưa thích</label>
          <div className="flex gap-2">
            {[
              { value: 'vi', label: '🇻🇳 Tiếng Việt' },
              { value: 'en', label: '🇬🇧 English' },
              { value: 'bilingual', label: '🌐 Song ngữ' },
            ].map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLang(l.value)}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-bold transition',
                  lang === l.value
                    ? 'bg-brand-100 ring-2 ring-brand-500'
                    : 'bg-brand-50 hover:ring-1 hover:ring-brand-300',
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-sky-50 px-3 py-2 text-sm">
          Tối đa <strong>{profile.maxChildren}</strong> tài khoản con
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Đang lưu…' : 'Lưu hồ sơ'}
        </Button>
      </form>

      {/* Password change */}
      <div className="ui-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">🔐 Mật khẩu</h3>
          {!changingPw && (
            <Button variant="secondary" onClick={() => setChangingPw(true)}>
              Đổi mật khẩu
            </Button>
          )}
        </div>

        {pwMsg && (
          <div className="mt-2 rounded-xl bg-mint-100 px-3 py-2 text-sm font-bold text-mint-700">
            {pwMsg}
          </div>
        )}
        {pwErr && (
          <div className="mt-2 rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-danger">
            {pwErr}
          </div>
        )}

        {changingPw && (
          <form
            onSubmit={(e) => void changePassword(e)}
            className="mt-3 flex flex-col gap-3"
          >
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Mật khẩu hiện tại"
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Mật khẩu mới (≥8 ký tự)"
              minLength={8}
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
            <div className="flex gap-2">
              <Button type="submit">Xác nhận</Button>
              <Button type="button" variant="secondary" onClick={() => setChangingPw(false)}>
                Hủy
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Shared UI ─────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: number
  color: string
}) {
  return (
    <div className="ui-card flex items-center gap-3 p-4 shadow-soft transition-all duration-150 hover:scale-[1.02]">
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-xs',
          color === 'brand' && 'bg-brand-50 text-brand-600',
          color === 'sun' && 'bg-sun-50 text-sun-600',
          color === 'mint' && 'bg-mint-50 text-mint-600',
          color === 'coral' && 'bg-coral-50 text-coral-600',
        )}
      >
        <Icon size={26} />
      </div>
      <div>
        <p className="text-2xl font-extrabold">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}

function LoadingSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ui-card h-20 animate-pulse bg-brand-50/50" />
      ))}
    </div>
  )
}

function Toast({
  msg,
  error,
  onClear,
}: {
  msg: string | null
  error: string | null
  onClear: () => void
}) {
  useEffect(() => {
    if (msg || error) {
      const t = setTimeout(onClear, 4000)
      return () => clearTimeout(t)
    }
  }, [msg, error, onClear])

  if (!msg && !error) return null
  return (
    <>
      {msg && (
        <div className="rounded-xl bg-mint-100 px-4 py-2.5 text-sm font-bold text-mint-700">
          {msg}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-coral-100 px-4 py-2.5 text-sm font-bold text-danger">
          {error}
        </div>
      )}
    </>
  )
}
