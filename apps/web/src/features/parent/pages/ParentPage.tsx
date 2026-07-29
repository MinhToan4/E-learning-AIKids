import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router'
import {
  Baby,
  Bell,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Check,
  Gamepad2,
  KeyRound,
  Languages,
  LogIn,
  Lock,
  Palette,
  PartyPopper,
  Pencil,
  Plus,
  Settings,
  Sprout,
  Trash2,
  TrendingUp,
  UserPlus,
  UsersRound,
  Video,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PinPadModal } from '@/shared/components/ui/PinPadModal'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
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
  birthDate?: string | null
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
            Xin chào, {(user?.nickname || user?.name) ?? 'Ba/Mẹ'} 👋
          </h1>
        </div>
      </div>

      {/* Only the active route owns effects and server state. */}
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
  const [busy, setBusy] = useState<string | null>(null)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([
        api<{ plans: PlanRow[] }>('/api/parent/plans'),
        api<{ subscription: HouseholdSub }>('/api/parent/subscription'),
      ])
      setPlans(p.plans)
      setSub(s.subscription)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không tải được gói', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  async function activate(code: string) {
    setBusy(code)
    try {
      const data = await api<{
        subscription?: HouseholdSub
        message: string
      }>('/api/parent/subscription', {
        method: 'POST',
        body: JSON.stringify({ planCode: code }),
      })
      if (data.subscription) setSub(data.subscription)
      showToast(data.message, 'success')
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không đổi được gói', 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
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
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg">
          <Gamepad2 size={20} aria-hidden="true" />
          Tổng XP gia đình: {totalXp}
        </h3>
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
          <ParentKidsIcon size={32} aria-hidden="true" />
          <div>
            <p className="font-bold">Quản lý con</p>
            <p className="text-xs text-muted">Thêm, sửa, xem tiến trình</p>
          </div>
        </Link>
        <Link
          to="/parent/approvals"
          className="ui-card flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-coral-300"
        >
          <Bell size={30} className="text-coral-500" aria-hidden="true" />
          <div>
            <p className="font-bold">Duyệt chia sẻ</p>
            <p className="text-xs text-muted">{pendingCount} yêu cầu đang chờ</p>
          </div>
        </Link>
      </div>
    </div>
  )
}


// ── Edit Child Modal — Full-screen — tên, avatar, mục tiêu, PIN ────
// Ba/mẹ bấm ✏️ → modal này mở toàn màn hình, bao gồm cả đổi PIN
function EditChildModal({
  child,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: {
  child: Child | null     // null = tạo mới
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const [nickname, setNickname] = useState('')
  const [avatarId, setAvatarId] = useState('avatar-robot')
  const [goal, setGoal] = useState('comic')
  const [pin, setPin] = useState('')
  // birthDate bắt buộc khi tạo con mới (backend validate 6–17 tuổi)
  const [birthDate, setBirthDate] = useState('')
  const [saving, setSaving] = useState(false)

  // Khi mở modal, điền sẵn giá trị hiện tại (nếu đang sửa)
  useEffect(() => {
    if (isOpen) {
      setNickname(child?.nickname ?? '')
      setAvatarId(child?.avatarId ?? 'avatar-robot')
      setGoal('comic')
      setPin('')
      // Điền sẵn birthDate nếu đang sửa; để trống nếu tạo mới
      setBirthDate(
        child?.birthDate
          ? new Date(child.birthDate).toISOString().split('T')[0]
          : ''
      )
    }
  }, [isOpen, child])

  // Khóa scroll nền khi modal mở
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Đóng khi nhấn Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) { onError('Vui lòng nhập tên hiển thị.'); return }
    if (pin && !/^\d{6}$/.test(pin)) { onError('Mã PIN cần đủ 6 chữ số, hoặc để trống.'); return }
    // birthDate bắt buộc khi tạo con mới — backend validate độ tuổi 6-17
    if (!child && !birthDate) { onError('Vui lòng nhập ngày sinh của con.'); return }
    setSaving(true)
    try {
      if (child) {
        // Cập nhật hồ sơ con — PIN được gộp vào PATCH để giảm số request
        await api(`/api/parent/children/${child.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            // Chỉ gửi pin nếu ba/mẹ điền; chuỗi rỗng = xóa PIN
            ...(pin ? { pin } : {}),
          }),
        })
      } else {
        // Tạo hồ sơ mới — birthDate bắt buộc theo domain rule
        const created = await api<{ child: { id: string } }>('/api/parent/children', {
          method: 'POST',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            goal,
            birthDate,
            // Gửi PIN kèm lúc tạo nếu ba/mẹ đặt ngay
            ...(pin ? { pin } : {}),
          }),
        })
        // Nếu backend không nhận pin trong body tạo con, gọi route /pin riêng
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

  if (!isOpen) return null

  return createPortal(
    // Backdrop toàn màn hình — render ra document.body để thoát AppShell stacking context
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl" style={{ maxHeight: '90dvh' }}>
        {/* Header — cố định */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 font-display text-xl">
            {child ? (
              <>
                <Pencil size={20} aria-hidden="true" />
                Chỉnh sửa — {child.nickname}
              </>
            ) : (
              <>
                <UserPlus size={20} aria-hidden="true" />
                Thêm con mới
              </>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted transition hover:bg-brand-50"
            aria-label="Đóng"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body — cuộn được khi nội dung dài */}
        <form
          onSubmit={(e) => void submit(e)}
          className="flex flex-col gap-5 overflow-y-auto px-6 py-5"
        >
          {/* Tên hiển thị */}
          <div>
            <label className="mb-1 block text-sm font-bold" htmlFor="edit-nickname">Tên hiển thị</label>
            <input
              id="edit-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="VD: MựcCon, Bé An…"
              required
              autoFocus
            />
            <p className="mt-1 text-xs text-muted">
              Gợi ý: Đặt biệt danh gần gũi nên có số hoặc ký tự đặc biệt (Ví dụ: Tom123, Bống_nhỏ).
            </p>
          </div>

          {/* Avatar */}
          <div>
            <label className="mb-2 block text-sm font-bold">Avatar</label>
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

          {/* Ngày sinh — bắt buộc khi tạo mới, hiển thị nhưng readonly khi sửa */}
          {!child && (
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="edit-birthdate">
                Ngày sinh của con <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date(Date.now() - 6 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                min={new Date(Date.now() - 17 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                required
              />
              <p className="mt-1 text-xs text-muted">Con từ 6 đến 17 tuổi.</p>
            </div>
          )}

          {/* Mục tiêu (chỉ khi tạo mới) */}
          {!child && (
            <div>
              <label className="mb-2 block text-sm font-bold">Mục tiêu sáng tạo</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'comic', label: 'Truyện tranh', color: 'bg-sky-50', icon: BookOpen },
                  { value: 'video', label: 'Video', color: 'bg-mint-50', icon: Video },
                  { value: 'character', label: 'Nhân vật', color: 'bg-sun-50', icon: Palette },
                ].map((g) => {
                  const GoalIcon = g.icon
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGoal(g.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition',
                        goal === g.value ? 'bg-brand-100 ring-2 ring-brand-500' : `${g.color} hover:ring-1 hover:ring-brand-300`,
                      )}
                    >
                      <GoalIcon size={17} aria-hidden="true" />
                      {g.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Đổi mã PIN — field nhập bình thường */}
          <div className="rounded-2xl border border-border bg-brand-50/40 p-4">
            <label className="mb-1 block text-sm font-bold" htmlFor="edit-pin">
              {child?.hasPin ? 'Đổi mã PIN (tùy chọn)' : 'Tạo mã PIN (tùy chọn)'}
            </label>
            <input
              id="edit-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full max-w-[14rem] rounded-xl border border-brand-200 px-3 py-2.5 font-mono tracking-[0.4em] text-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="••••••"
            />
            <p className="mt-1.5 text-xs text-muted">
              {child?.hasPin
                ? 'Nhập PIN mới để đổi. Để trống nếu không muốn thay đổi.'
                : '6 chữ số. Con nhập khi vào học. Để trống nếu không cần PIN.'}
            </p>
          </div>

          {/* Actions — cố định cuối form */}
          <div className="flex flex-shrink-0 gap-3 pb-1">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Đang lưu…' : child ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

// ── Play Pin Modal — nhập PIN trước khi vào hồ sơ con ─────────
function PlayPinModal({
  child,
  isOpen,
  onClose,
  onEntered,
}: {
  child: Child
  isOpen: boolean
  onClose: () => void
  onEntered: (pin: string) => void
}) {
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (isOpen) setPin('')
  }, [isOpen])

  return (
    <PinPadModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={(value) => onEntered(value)}
      title={`Xin chào ${child.nickname ?? 'bạn nhỏ'}!`}
      subtitle="Nhập mã PIN 6 số để vào học"
      avatarContent={<span className="text-5xl">{avatarEmoji(child.avatarId)}</span>}
      pin={pin}
      setPin={setPin}
    />
  )
}

// ── Kids Tab ──────────────────────────────────────────────────
type CourseItem = {
  id: string
  title: string
  shortTitle: string
  ageLabel: string
  ageTrack: string
  tagline: string
  coverImage: string | null
  enrolled: boolean
  parentAllowed: boolean | null
}

function KidsTab() {
  const [kids, setKids] = useState<Child[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [progress, setProgress] = useState<ChildProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null)
  // editTarget: null = tạo mới; Child object = đang sửa; undefined = đóng
  const [editTarget, setEditTarget] = useState<Child | null | undefined>(undefined)
  const [playPinTarget, setPlayPinTarget] = useState<Child | null>(null)
  // courseSelectTarget: child đang chọn khóa học; null = đóng modal
  const [courseSelectTarget, setCourseSelectTarget] = useState<Child | null>(null)
  const { toasts, showToast, dismissToast } = useToast()
  const enterAsChild = useAuth((s) => s.enterAsChild)
  const navigate = useNavigate()
  const showCourseSuccess = useCallback(
    (message: string) => showToast(message, 'success'),
    [showToast],
  )
  const showCourseError = useCallback(
    (message: string) => showToast(message, 'error'),
    [showToast],
  )

  const loadKids = useCallback(async () => {
    try {
      const data = await api<{
        children: Child[]
        subscription: HouseholdSub
      }>('/api/parent/children')
      setKids(data.children)
      setSub(data.subscription)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi tải dữ liệu', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

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
      const child = kids.find((item) => item.id === childId)
      setProgress(child ? {
        ...data,
        child: {
          ...data.child,
          nickname: child.nickname,
          level: child.level,
          xp: child.xp,
        },
      } : data)
    } catch {
      setProgress(null)
    }
  }

  async function deleteChild(childId: string) {
    try {
      await api(`/api/parent/children/${childId}`, { method: 'DELETE' })
      showToast('Tài khoản con đã được tạm khóa.', 'success')
      await loadKids()
      setDeleteTarget(null)
      if (selectedChild === childId) {
        setSelectedChild(null)
        setProgress(null)
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi', 'error')
      setDeleteTarget(null)
    }
  }

  // Vào hồ sơ con — nếu có PIN thì mở modal xác nhận trước
  async function playAsChild(child: Child, pin?: string) {
    try {
      await enterAsChild(child.id, pin || undefined)
      navigate('/home')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không vào được hồ sơ con', 'error')
    }
  }

  function handlePlayPress(child: Child) {
    if (child.hasPin) {
      setPlayPinTarget(child)
    } else {
      void playAsChild(child)
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  const maxKids = sub?.maxChildren ?? 5
  const seatsLeft = sub?.seatsRemaining ?? Math.max(0, maxKids - kids.length)

  return (
    <div className="flex flex-col gap-4">
      {/* Toast nổi */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

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
        <h2 className="flex items-center gap-2 font-display text-xl">
          <UsersRound size={22} aria-hidden="true" />
          Con của tôi ({kids.filter((k) => k.active !== false).length}/{maxKids})
        </h2>
        <Button
          onClick={() => setEditTarget(null)}
          disabled={seatsLeft <= 0}
        >
          + Thêm con
        </Button>
      </div>
      <p className="text-sm text-muted">
        Ba/mẹ tạo hồ sơ cho con. Trên máy ở nhà, bấm “Vào học” để đưa máy cho con — không cần mật khẩu ba/mẹ.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Child list */}
        <div className="flex flex-col gap-3">
          {kids.length === 0 && (
            <div className="ui-card p-6 text-center">
              <Baby className="mx-auto text-brand-500" size={36} aria-hidden="true" />
              <p className="mt-2 font-bold">Chưa có con nào</p>
              <p className="text-sm text-muted">Nhấn "Thêm con" để bắt đầu</p>
            </div>
          )}
          {kids.map((k) => (
            <div
              key={k.id}
              className={cn(
                'ui-card p-4 transition',
                selectedChild === k.id && 'ring-2 ring-brand-500',
                !k.active && 'opacity-50',
              )}
            >
              {/* Avatar + tên + stats */}
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 text-3xl">{avatarEmoji(k.avatarId)}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-lg leading-tight">{k.nickname}</p>
                  <p className="text-sm text-muted">
                    Cấp {k.level} · {k.xp} XP · {k.completedQuests ?? 0} trạm · {k.totalStars ?? 0} ⭐
                  </p>
                </div>
              </div>

              {/* Hàng nút */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  className="!min-h-9 !px-3 !text-xs"
                  onClick={() => void viewProgress(k.id)}
                >
                  <TrendingUp size={16} aria-hidden="true" />
                  Xem tiến trình
                </Button>

                {/* Chọn khóa học cho con */}
                <Button
                  variant="secondary"
                  className="!min-h-9 !px-3 !text-xs"
                  onClick={() => setCourseSelectTarget(k)}
                >
                  <BookOpen size={16} aria-hidden="true" />
                  Chọn khóa học
                </Button>

                <Button
                  variant="secondary"
                  className="!min-h-9 !px-3 !text-xs"
                  onClick={() => handlePlayPress(k)}
                >
                  <LogIn size={16} aria-hidden="true" />
                  Vào học
                </Button>

                {/* Bút chì — mở EditChildModal (tên + avatar + PIN) */}
                <button
                  type="button"
                  onClick={() => setEditTarget(k)}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-sm transition hover:bg-brand-50"
                  title="Chỉnh sửa hồ sơ"
                  aria-label="Chỉnh sửa hồ sơ con"
                >
                  <Pencil size={17} aria-hidden="true" />
                </button>

                {/* Tạm khóa */}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(k)}
                  className="ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-xl text-sm transition hover:bg-coral-50"
                  title="Tạm khóa hồ sơ"
                  aria-label="Tạm khóa hồ sơ con"
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Panel tiến trình — luôn hiện hướng dẫn rõ khi chưa chọn */}
        <div className="ui-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg">
            <TrendingUp size={19} aria-hidden="true" />
            Tiến trình học
          </h3>
          {!selectedChild && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <ChartNoAxesColumnIncreasing
                className="text-brand-500"
                size={40}
                aria-hidden="true"
              />
              <p className="font-bold text-text">Chọn con để xem tiến trình</p>
              <p className="text-sm text-muted">
                Bấm nút <strong>“Xem tiến trình”</strong> trên thẻ của từng con
              </p>
            </div>
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
                        {progress.insights.strengths.map((skill) => (
                          <li key={skill} className="flex items-start gap-2">
                            <Sprout className="mt-0.5 shrink-0 text-success" size={16} aria-hidden="true" />
                            <span>{skill}</span>
                          </li>
                        ))}
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
                    {q.videoUrl && <Video size={15} aria-label="Có video" />}
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

      {/* EditChildModal — full-screen, triggered bằng nút bút chì */}
      <EditChildModal
        child={editTarget ?? null}
        isOpen={editTarget !== undefined}
        onClose={() => setEditTarget(undefined)}
        onSuccess={async () => {
          setEditTarget(undefined)
          showToast(editTarget ? 'Đã cập nhật hồ sơ con!' : 'Đã tạo tài khoản con!', 'success')
          await loadKids()
        }}
        onError={(e) => showToast(e, 'error')}
      />

      {/* Modal: nhập PIN để vào hồ sơ con */}
      {playPinTarget && (
        <PlayPinModal
          child={playPinTarget}
          isOpen={Boolean(playPinTarget)}
          onClose={() => setPlayPinTarget(null)}
          onEntered={(pin) => {
            void playAsChild(playPinTarget, pin)
            setPlayPinTarget(null)
          }}
        />
      )}

      {/* Modal: ba/mẹ chọn khóa học cho con */}
      {courseSelectTarget && (
        <CourseSelectModal
          child={courseSelectTarget}
          onClose={() => setCourseSelectTarget(null)}
          onSuccess={showCourseSuccess}
          onError={showCourseError}
        />
      )}
    </div>
  )
}

// ── CourseSelectModal ──────────────────────────────────────────
/**
 * Modal để ba/mẹ bật/tắt từng khóa học cho con.
 * Toggle ON  → POST /api/parent/children/:id/courses { enroll: true }  → con học ngay
 * Toggle OFF → POST /api/parent/children/:id/courses { enroll: false } → ẩn khỏi lộ trình
 */
function CourseSelectModal({
  child,
  onClose,
  onSuccess,
  onError,
}: {
  child: Child
  onClose: () => void
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}) {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void (async () => {
      try {
        const data = await api<{
          child: { id: string; nickname: string | null; ageBand: string | null }
          courses: CourseItem[]
        }>(`/api/parent/children/${child.id}/courses`, {
          signal: controller.signal,
        })
        setCourses(data.courses)
      } catch (e) {
        if (controller.signal.aborted) return
        onError(e instanceof Error ? e.message : 'Không tải được danh sách khóa học')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [child.id, onError])

  async function toggleCourse(courseId: string, currentlyEnrolled: boolean) {
    setToggling(courseId)
    try {
      await api(`/api/parent/children/${child.id}/courses`, {
        method: 'POST',
        body: JSON.stringify({ courseId, enroll: !currentlyEnrolled }),
      })
      // Cập nhật state local ngay lập tức (optimistic)
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, enrolled: !currentlyEnrolled, parentAllowed: !currentlyEnrolled ? true : null }
            : c,
        ),
      )
      onSuccess(
        !currentlyEnrolled
          ? `Đã thêm khóa học cho ${child.nickname ?? 'con'}!`
          : `Đã bỏ khóa học khỏi lộ trình của ${child.nickname ?? 'con'}.`,
      )
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Lỗi cập nhật')
    } finally {
      setToggling(null)
    }
  }

  const trackLabel: Record<string, string> = { L1: '6–9 tuổi', L2: '9–11 tuổi' }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Chọn khóa học cho ${child.nickname ?? 'con'}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-border">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
              <span className="flex items-center gap-2">
                <BookOpen size={16} aria-hidden="true" />
                Chọn khóa học
              </span>
            </p>
            <h2 className="font-display text-xl leading-tight">
              Lộ trình của {child.nickname ?? 'con'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Bật khóa học → con thấy và học được ngay. Tắt → ẩn khỏi lộ trình.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 flex-shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-page"
            aria-label="Đóng"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
            </div>
          ) : courses.length === 0 ? (
            <p className="py-8 text-center text-muted">Không có khóa học nào đang mở.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {courses.map((course) => {
                const isToggling = toggling === course.id
                return (
                  <div
                    key={course.id}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition',
                      course.enrolled
                        ? 'border-brand-300 bg-brand-50'
                        : 'border-border bg-white hover:border-brand-200',
                    )}
                  >
                    {/* Thông tin khóa */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm leading-tight truncate">{course.title}</p>
                      <p className="text-xs text-muted mt-0.5">
                        <span className="inline-block rounded-full bg-brand-100 px-2 py-0.5 font-bold text-brand-700 mr-1">
                          {trackLabel[course.ageTrack] ?? course.ageTrack}
                        </span>
                        {course.ageLabel}
                      </p>
                    </div>

                    {/* Toggle button */}
                    <button
                      type="button"
                      id={`course-toggle-${course.id}`}
                      disabled={isToggling}
                      onClick={() => void toggleCourse(course.id, course.enrolled)}
                      className={cn(
                        'flex-shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition',
                        course.enrolled
                          ? 'bg-brand-500 text-white hover:bg-brand-600'
                          : 'bg-page text-muted hover:bg-brand-50 border border-border',
                        isToggling && 'opacity-50 cursor-wait',
                      )}
                      aria-pressed={course.enrolled}
                      aria-label={`${course.enrolled ? 'Bỏ' : 'Thêm'} khóa ${course.title}`}
                    >
                      {isToggling ? (
                        '...'
                      ) : course.enrolled ? (
                        <span className="flex items-center gap-1.5">
                          <Check size={15} aria-hidden="true" />
                          Đang học
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Plus size={15} aria-hidden="true" />
                          Thêm
                        </span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <Button className="w-full" onClick={onClose}>
            Xong
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── Approvals Tab ─────────────────────────────────────────────

function ApprovalsTab() {

  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const { toasts, showToast, dismissToast } = useToast()

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
    try {
      await api(`/api/parent/approvals/${id}/decide`, {
        method: 'POST',
        body: JSON.stringify({ decision }),
      })
      showToast(
        decision === 'approved' ? 'Đã cho phép chia sẻ' : 'Đã giữ riêng tư',
        decision === 'approved' ? 'success' : 'info',
      )
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi', 'error')
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <h2 className="flex items-center gap-2 font-display text-xl">
        <Bell size={20} aria-hidden="true" />
        Yêu cầu chia sẻ
      </h2>
      <p className="text-sm text-muted">
        Sáng tạo của trẻ mặc định riêng tư — chỉ hiện khi ba/mẹ đồng ý.
      </p>

      {approvals.length === 0 && (
        <div className="ui-card p-8 text-center">
          <PartyPopper className="mx-auto text-brand-500" size={40} aria-hidden="true" />
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
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              {a.project.kind === 'comic' ? (
                <BookOpen size={30} aria-hidden="true" />
              ) : a.project.kind === 'video' ? (
                <Video size={30} aria-hidden="true" />
              ) : (
                <Palette size={30} aria-hidden="true" />
              )}
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
                <Check size={17} aria-hidden="true" />
                Cho phép
              </Button>
              <Button variant="secondary" onClick={() => void decide(a.id, 'rejected')}>
                <Lock size={17} aria-hidden="true" />
                Giữ riêng
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
  const [changingPw, setChangingPw] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const { toasts, showToast, dismissToast } = useToast()

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
        body: JSON.stringify({ phone: phone || undefined, preferredLanguage: lang }),
      })
      showToast('Đã lưu hồ sơ!', 'success')
    } catch {
      showToast('Lỗi khi lưu hồ sơ', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw.length < 8) {
      showToast('Mật khẩu mới phải ≥ 8 ký tự', 'error')
      return
    }
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      showToast('Đã đổi mật khẩu!', 'success')
      setCurrentPw('')
      setNewPw('')
      setChangingPw(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Mật khẩu cũ không đúng', 'error')
    }
  }

  if (!profile) return <LoadingSkeleton count={2} />

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <h2 className="flex items-center gap-2 font-display text-xl">
        <Settings size={20} aria-hidden="true" />
        Hồ sơ phụ huynh
      </h2>

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
          <label className="mb-1 flex items-center gap-2 text-sm font-bold">
            <Languages size={17} aria-hidden="true" />
            Ngôn ngữ ưa thích
          </label>
          <div className="flex gap-2">
            {[
              { value: 'vi', label: 'Tiếng Việt' },
              { value: 'en', label: 'English' },
              { value: 'bilingual', label: 'Song ngữ' },
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
          <h3 className="flex items-center gap-2 font-display text-lg">
            <KeyRound size={19} aria-hidden="true" />
            Mật khẩu
          </h3>
          {!changingPw && (
            <Button variant="secondary" onClick={() => setChangingPw(true)}>
              Đổi mật khẩu
            </Button>
          )}
        </div>
        {changingPw && (
          <form
            onSubmit={(e) => void changePassword(e)}
            className="mt-3 flex flex-col gap-3"
          >
            <input
              type="password"
              aria-label="Mật khẩu hiện tại"
              autoComplete="current-password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Mật khẩu hiện tại"
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
            <input
              type="password"
              aria-label="Mật khẩu mới"
              autoComplete="new-password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Mật khẩu mới (≥8 ký tự)"
              minLength={8}
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
            <div className="flex gap-2">
              <Button type="submit">Xác nhận</Button>
              <Button type="button" variant="secondary" onClick={() => setChangingPw(false)}>Hủy</Button>
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
    <div className="flex flex-col gap-3" role="status" aria-label="Đang tải dữ liệu…">
      {Array.from({ length: count }).map((_, i) => (
        // WHY: varied widths give a more natural skeleton appearance (avoids uniform "bar" look)
        <div key={i} className="ui-card flex animate-pulse flex-col gap-2 p-4">
          <div className="h-3 w-24 rounded-full bg-brand-100" />
          <div className={`h-5 rounded-full bg-brand-50 ${i % 2 === 0 ? 'w-3/4' : 'w-1/2'}`} />
        </div>
      ))}
    </div>
  )
}

