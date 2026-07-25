import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
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

// ΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

// ΓöÇΓöÇ Main Component ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
            Phß╗Ñ huynh
          </p>
          <h1 className="font-display text-2xl md:text-3xl">
            Xin ch├áo, {(user?.nickname || user?.name) ?? 'Ba/Mß║╣'} ≡ƒæï
          </h1>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            await logout()
            navigate('/')
          }}
        >
          ─É─âng xuß║Ñt
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

// ΓöÇΓöÇ Plan Tab (g├│i gia ─æ├¼nh) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
      showToast(e instanceof Error ? e.message : 'Kh├┤ng tß║úi ─æ╞░ß╗úc g├│i', 'error')
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
      showToast(e instanceof Error ? e.message : 'Kh├┤ng ─æß╗òi ─æ╞░ß╗úc g├│i', 'error')
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
          G├│i hß╗ìc gia ─æ├¼nh
        </p>
        <h2 className="font-display text-2xl">Chß╗ìn g├│i ph├╣ hß╗úp</h2>
        <p className="mt-1 text-sm text-muted">
          Ba/mß║╣ chß╗ìn g├│i, tß║ío hß╗ô s╞í cho tß╗½ng con. Con v├áo hß╗ìc bß║▒ng biß╗çt danh (v├á PIN nß║┐u c├│)
          ΓÇö kh├┤ng d├╣ng mß║¡t khß║⌐u cß╗ºa ba/mß║╣.
        </p>
        {sub && (
          <p className="mt-3 rounded-xl bg-mint-100 px-3 py-2 text-sm font-bold text-success">
            ─Éang d├╣ng: {sub.planName} ┬╖ {sub.childCount}/{sub.maxChildren} con ┬╖ tß╗æi ─æa{' '}
            {sub.maxOpenCoursesPerChild} kh├│a/con
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
                  ? 'Miß╗àn ph├¡'
                  : `${p.priceMonthly.toLocaleString('vi-VN')} ${p.currency}/th├íng`}
              </p>
              <ul className="mt-1 flex-1 space-y-1 text-sm text-muted">
                {p.features.map((f) => (
                  <li key={f}>ΓÇó {f}</li>
                ))}
              </ul>
              <Button
                disabled={current || busy === p.code}
                onClick={() => void activate(p.code)}
              >
                {current ? '─Éang d├╣ng' : busy === p.code ? '─ÉangΓÇª' : 'Chß╗ìn g├│i'}
              </Button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

// ΓöÇΓöÇ Dashboard Tab ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
        <StatCard icon={ParentKidsIcon} label="Sß╗æ con" value={kids.length} color="brand" />
        <StatCard icon={NavBadgeIcon} label="Tß╗òng sao" value={totalStars} color="sun" />
        <StatCard icon={NavLeaderboardIcon} label="Quests xong" value={totalQuests} color="mint" />
        <StatCard icon={ParentApprovalIcon} label="Chß╗¥ duyß╗çt" value={pendingCount} color="coral" />
      </div>

      {/* XP summary */}
      <div className="ui-card p-4">
        <h3 className="mb-3 font-display text-lg">≡ƒÄ« Tß╗òng XP gia ─æ├¼nh: {totalXp}</h3>
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
                Lv.{k.level} ┬╖ {k.xp} XP
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
          <span className="text-3xl">≡ƒæº</span>
          <div>
            <p className="font-bold">Quß║ún l├╜ con</p>
            <p className="text-xs text-muted">Th├¬m, sß╗¡a, xem tiß║┐n tr├¼nh</p>
          </div>
        </Link>
        <Link
          to="/parent/approvals"
          className="ui-card flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-coral-300"
        >
          <span className="text-3xl">≡ƒöö</span>
          <div>
            <p className="font-bold">Duyß╗çt chia sß║╗</p>
            <p className="text-xs text-muted">{pendingCount} y├¬u cß║ºu ─æang chß╗¥</p>
          </div>
        </Link>
      </div>
    </div>
  )
}


// ΓöÇΓöÇ Edit Child Modal ΓÇö Full-screen ΓÇö t├¬n, avatar, mß╗Ñc ti├¬u, PIN ΓöÇΓöÇΓöÇΓöÇ
// Ba/mß║╣ bß║Ñm Γ£Å∩╕Å ΓåÆ modal n├áy mß╗ƒ to├án m├án h├¼nh, bao gß╗ôm cß║ú ─æß╗òi PIN
function EditChildModal({
  child,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: {
  child: Child | null     // null = tß║ío mß╗¢i
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const [nickname, setNickname] = useState('')
  const [avatarId, setAvatarId] = useState('avatar-robot')
  const [goal, setGoal] = useState('comic')
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)

  // Khi mß╗ƒ modal, ─æiß╗ün sß║╡n gi├í trß╗ï hiß╗çn tß║íi (nß║┐u ─æang sß╗¡a)
  useEffect(() => {
    if (isOpen) {
      setNickname(child?.nickname ?? '')
      setAvatarId(child?.avatarId ?? 'avatar-robot')
      setGoal('comic')
      setPin('')
    }
  }, [isOpen, child])

  // Kh├│a scroll nß╗ün khi modal mß╗ƒ
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ─É├│ng khi nhß║Ñn Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) { onError('Vui l├▓ng nhß║¡p t├¬n hiß╗ân thß╗ï.'); return }
    if (pin && !/^\d{6}$/.test(pin)) { onError('M├ú PIN cß║ºn ─æß╗º 6 chß╗» sß╗æ, hoß║╖c ─æß╗â trß╗æng.'); return }
    setSaving(true)
    try {
      if (child) {
        // Cß║¡p nhß║¡t hß╗ô s╞í con
        await api(`/api/parent/children/${child.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ nickname: nickname.trim(), avatarId }),
        })
        // Cß║¡p nhß║¡t PIN nß║┐u ba/mß║╣ ─æiß╗ün
        if (pin) {
          await api(`/api/parent/children/${child.id}/pin`, {
            method: 'POST',
            body: JSON.stringify({ pin }),
          })
        }
      } else {
        // Tß║ío hß╗ô s╞í mß╗¢i
        const created = await api<{ child: { id: string } }>('/api/parent/children', {
          method: 'POST',
          body: JSON.stringify({ nickname: nickname.trim(), avatarId, goal }),
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
      onError(err instanceof Error ? err.message : 'Lß╗ùi')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    // Backdrop to├án m├án h├¼nh ΓÇö render ra document.body ─æß╗â tho├ít AppShell stacking context
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl" style={{ maxHeight: '90dvh' }}>
        {/* Header ΓÇö cß╗æ ─æß╗ïnh */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-xl">
            {child ? `Γ£Å∩╕Å Chß╗ënh sß╗¡a ΓÇö ${child.nickname}` : '≡ƒæ╢ Th├¬m con mß╗¢i'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted transition hover:bg-brand-50"
            aria-label="─É├│ng"
          >
            Γ£ò
          </button>
        </div>

        {/* Body ΓÇö cuß╗Ön ─æ╞░ß╗úc khi nß╗Öi dung d├ái */}
        <form
          onSubmit={(e) => void submit(e)}
          className="flex flex-col gap-5 overflow-y-auto px-6 py-5"
        >
          {/* T├¬n hiß╗ân thß╗ï */}
          <div>
            <label className="mb-1 block text-sm font-bold" htmlFor="edit-nickname">T├¬n hiß╗ân thß╗ï</label>
            <input
              id="edit-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="VD: Mß╗▒cCon, B├⌐ AnΓÇª"
              required
              autoFocus
            />
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

          {/* Mß╗Ñc ti├¬u (chß╗ë khi tß║ío mß╗¢i) */}
          {!child && (
            <div>
              <label className="mb-2 block text-sm font-bold">Mß╗Ñc ti├¬u s├íng tß║ío</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'comic', label: '≡ƒôû Truyß╗çn tranh', color: 'bg-sky-50' },
                  { value: 'video', label: '≡ƒÄÑ Video', color: 'bg-mint-50' },
                  { value: 'character', label: '≡ƒÄ¿ Nh├ón vß║¡t', color: 'bg-sun-50' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm font-bold transition',
                      goal === g.value ? 'bg-brand-100 ring-2 ring-brand-500' : `${g.color} hover:ring-1 hover:ring-brand-300`,
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─Éß╗òi m├ú PIN ΓÇö field nhß║¡p b├¼nh th╞░ß╗¥ng */}
          <div className="rounded-2xl border border-border bg-brand-50/40 p-4">
            <label className="mb-1 block text-sm font-bold" htmlFor="edit-pin">
              {child?.hasPin ? '─Éß╗òi m├ú PIN (t├╣y chß╗ìn)' : 'Tß║ío m├ú PIN (t├╣y chß╗ìn)'}
            </label>
            <input
              id="edit-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full max-w-[14rem] rounded-xl border border-brand-200 px-3 py-2.5 font-mono tracking-[0.4em] text-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
            />
            <p className="mt-1.5 text-xs text-muted">
              {child?.hasPin
                ? 'Nhß║¡p PIN mß╗¢i ─æß╗â ─æß╗òi. ─Éß╗â trß╗æng nß║┐u kh├┤ng muß╗æn thay ─æß╗òi.'
                : '6 chß╗» sß╗æ. Con nhß║¡p khi v├áo hß╗ìc. ─Éß╗â trß╗æng nß║┐u kh├┤ng cß║ºn PIN.'}
            </p>
          </div>

          {/* Actions ΓÇö cß╗æ ─æß╗ïnh cuß╗æi form */}
          <div className="flex flex-shrink-0 gap-3 pb-1">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? '─Éang l╞░uΓÇª' : child ? 'L╞░u thay ─æß╗òi' : 'Tß║ío t├ái khoß║ún'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Hß╗ºy
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

// ΓöÇΓöÇ Play Pin Modal ΓÇö nhß║¡p PIN tr╞░ß╗¢c khi v├áo hß╗ô s╞í con ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
      title={`Xin ch├áo ${child.nickname ?? 'bß║ín nhß╗Å'}!`}
      subtitle="Nhß║¡p m├ú PIN 6 sß╗æ ─æß╗â v├áo hß╗ìc"
      avatarContent={<span className="text-5xl">{avatarEmoji(child.avatarId)}</span>}
      pin={pin}
      setPin={setPin}
    />
  )
}

// ΓöÇΓöÇ Kids Tab ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function KidsTab() {
  const [kids, setKids] = useState<Child[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [progress, setProgress] = useState<ChildProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null)
  // editTarget: null = tß║ío mß╗¢i; Child object = ─æang sß╗¡a; undefined = ─æ├│ng
  const [editTarget, setEditTarget] = useState<Child | null | undefined>(undefined)
  const [playPinTarget, setPlayPinTarget] = useState<Child | null>(null)
  const { toasts, showToast, dismissToast } = useToast()
  const enterAsChild = useAuth((s) => s.enterAsChild)
  const navigate = useNavigate()

  const loadKids = useCallback(async () => {
    try {
      const data = await api<{
        children: Child[]
        subscription: HouseholdSub
      }>('/api/parent/children')
      setKids(data.children)
      setSub(data.subscription)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lß╗ùi tß║úi dß╗» liß╗çu', 'error')
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
      showToast('T├ái khoß║ún con ─æ├ú ─æ╞░ß╗úc tß║ím kh├│a.', 'success')
      await loadKids()
      setDeleteTarget(null)
      if (selectedChild === childId) {
        setSelectedChild(null)
        setProgress(null)
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lß╗ùi', 'error')
      setDeleteTarget(null)
    }
  }

  // V├áo hß╗ô s╞í con ΓÇö nß║┐u c├│ PIN th├¼ mß╗ƒ modal x├íc nhß║¡n tr╞░ß╗¢c
  async function playAsChild(child: Child, pin?: string) {
    try {
      await enterAsChild(child.id, pin || undefined)
      navigate('/home')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Kh├┤ng v├áo ─æ╞░ß╗úc hß╗ô s╞í con', 'error')
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
      {/* Toast nß╗òi */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {sub && (
        <div className="ui-card flex flex-wrap items-center justify-between gap-2 bg-brand-50/50 p-4">
          <div>
            <p className="text-xs font-bold uppercase text-muted">G├│i gia ─æ├¼nh</p>
            <p className="font-display text-lg text-brand-600">
              {sub.planName} ┬╖ {sub.childCount}/{sub.maxChildren} ghß║┐ con
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/kids">
              <Button className="!min-h-10 !text-sm">Cho con hß╗ìc</Button>
            </Link>
            <Link
              to="/parent/plan"
              className="text-sm font-bold text-brand-500 hover:underline self-center"
            >
              ─Éß╗òi g├│i ΓåÆ
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl">
          ≡ƒæº Con cß╗ºa t├┤i ({kids.filter((k) => k.active !== false).length}/{maxKids})
        </h2>
        <Button
          onClick={() => setEditTarget(null)}
          disabled={seatsLeft <= 0}
        >
          + Th├¬m con
        </Button>
      </div>
      <p className="text-sm text-muted">
        Ba/mß║╣ tß║ío hß╗ô s╞í cho con. Tr├¬n m├íy ß╗ƒ nh├á, bß║Ñm ΓÇ£V├áo hß╗ìcΓÇ¥ ─æß╗â ─æ╞░a m├íy cho con ΓÇö kh├┤ng cß║ºn mß║¡t khß║⌐u ba/mß║╣.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Child list */}
        <div className="flex flex-col gap-3">
          {kids.length === 0 && (
            <div className="ui-card p-6 text-center">
              <p className="text-3xl">≡ƒæ╢</p>
              <p className="mt-2 font-bold">Ch╞░a c├│ con n├áo</p>
              <p className="text-sm text-muted">Nhß║Ñn "Th├¬m con" ─æß╗â bß║»t ─æß║ºu</p>
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
              {/* Avatar + t├¬n + stats */}
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 text-3xl">{avatarEmoji(k.avatarId)}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-lg leading-tight">{k.nickname}</p>
                  <p className="text-sm text-muted">
                    Cß║Ñp {k.level} ┬╖ {k.xp} XP ┬╖ {k.completedQuests ?? 0} trß║ím ┬╖ {k.totalStars ?? 0} Γ¡É
                  </p>
                </div>
              </div>

              {/* H├áng n├║t */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  className="!min-h-9 !px-3 !text-xs"
                  onClick={() => void viewProgress(k.id)}
                >
                  ≡ƒôê Xem tiß║┐n tr├¼nh
                </Button>

                <Button
                  variant="secondary"
                  className="!min-h-9 !px-3 !text-xs"
                  onClick={() => handlePlayPress(k)}
                >
                  Γû╢ V├áo hß╗ìc
                </Button>

                {/* B├║t ch├¼ ΓÇö mß╗ƒ EditChildModal (t├¬n + avatar + PIN) */}
                <button
                  type="button"
                  onClick={() => setEditTarget(k)}
                  className="rounded-lg p-2 text-sm transition hover:bg-brand-50"
                  title="Chß╗ënh sß╗¡a hß╗ô s╞í"
                  aria-label="Chß╗ënh sß╗¡a hß╗ô s╞í con"
                >
                  Γ£Å∩╕Å
                </button>

                {/* Tß║ím kh├│a */}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(k)}
                  className="ml-auto rounded-lg p-2 text-sm transition hover:bg-coral-50"
                  title="Tß║ím kh├│a hß╗ô s╞í"
                  aria-label="Tß║ím kh├│a hß╗ô s╞í con"
                >
                  ≡ƒùæ∩╕Å
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Panel tiß║┐n tr├¼nh ΓÇö lu├┤n hiß╗çn h╞░ß╗¢ng dß║½n r├╡ khi ch╞░a chß╗ìn */}
        <div className="ui-card p-4">
          <h3 className="mb-3 font-display text-lg">≡ƒôê Tiß║┐n tr├¼nh hß╗ìc</h3>
          {!selectedChild && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="text-4xl">≡ƒôè</span>
              <p className="font-bold text-text">Chß╗ìn con ─æß╗â xem tiß║┐n tr├¼nh</p>
              <p className="text-sm text-muted">
                Bß║Ñm n├║t <strong>"≡ƒôê Xem tiß║┐n tr├¼nh"</strong> tr├¬n thß║╗ cß╗ºa tß╗½ng con
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
                      aria-label="Chß╗ìn kh├│a hß╗ìc ─æß╗â xem tiß║┐n tr├¼nh"
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
                  Lv.{progress.child.level} ┬╖ {progress.child.xp} XP
                </span>
              </div>
              <div className="mb-2 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-mint-100/60 p-3 text-center">
                  <p className="font-display text-2xl text-success">{progress.summary.completed}/{progress.summary.total}</p>
                  <p className="text-[11px] font-bold text-muted">B├ái ho├án th├ánh</p>
                </div>
                <div className="rounded-2xl bg-sun-100/60 p-3 text-center">
                  <p className="font-display text-2xl text-warning">{progress.summary.totalStars}</p>
                  <p className="text-[11px] font-bold text-muted">Sao nß╗ù lß╗▒c</p>
                </div>
                <div className="rounded-2xl bg-sky-100/60 p-3 text-center">
                  <p className="font-display text-lg text-sky-700">
                    {progress.summary.currentPhase === 'game'
                      ? '─Éang ch╞íi'
                      : progress.summary.currentPhase === 'practice'
                        ? '─Éang l├ám'
                        : progress.summary.currentPhase === 'check'
                          ? '─Éang thß╗¡ t├ái'
                          : 'Sß║╡n s├áng'}
                  </p>
                  <p className="text-[11px] font-bold text-muted">Nhß╗ïp hiß╗çn tß║íi</p>
                </div>
              </div>
              {(progress.insights.strengths.length > 0 || progress.insights.nextFocus) && (
                <div className="mb-2 grid gap-3 rounded-2xl bg-gradient-to-br from-sky-50 to-mint-100/40 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-success">─Éiß╗üu con ─æang l├ám tß╗æt</p>
                    {progress.insights.strengths.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm">
                        {progress.insights.strengths.map((skill) => <li key={skill}>≡ƒî▒ {skill}</li>)}
                      </ul>
                    ) : <p className="mt-2 text-sm text-muted">Con ─æang bß║»t ─æß║ºu h├ánh tr├¼nh; h├úy ghi nhß║¡n lß║ºn thß╗¡ ─æß║ºu ti├¬n.</p>}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-sky-700">Ba/mß║╣ c├│ thß╗â hß╗Åi con</p>
                    <p className="mt-2 text-sm leading-relaxed text-text">
                      {progress.insights.nextFocus
                        ? `ΓÇ£Con muß╗æn kß╗â cho ba/mß║╣ nghe vß╗ü ${progress.insights.nextFocus.toLowerCase()} kh├┤ng?ΓÇ¥`
                        : 'ΓÇ£Sß║ún phß║⌐m n├áo trong kh├│a hß╗ìc l├ám con tß╗▒ h├áo nhß║Ñt?ΓÇ¥'}
                    </p>
                  </div>
                </div>
              )}
              {progress.insights.outcomes.length > 0 && (
                <details className="mb-2 rounded-2xl border border-border bg-white p-3">
                  <summary className="cursor-pointer text-sm font-extrabold text-brand-600">Kh├│a hß╗ìc h╞░ß╗¢ng tß╗¢i nhß╗»ng n─âng lß╗▒c n├áo?</summary>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {progress.insights.outcomes.map((outcome) => <li key={outcome}>ΓÇó {outcome}</li>)}
                  </ul>
                </details>
              )}
              {progress.courses.length === 0 && (
                <p className="rounded-2xl bg-page p-4 text-sm text-muted">
                  Con ch╞░a tham gia kh├│a hß╗ìc n├áo. Ba/mß║╣ c├│ thß╗â v├áo hß╗ô s╞í cß╗ºa con ─æß╗â chß╗ìn kh├│a ph├╣ hß╗úp.
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
                    {q.status === 'completed' && <span>{'Γ¡É'.repeat(q.stars)}</span>}
                    {q.videoUrl && <span>≡ƒÄ¼</span>}
                    <span className={cn(
                      'rounded-md px-1.5 py-0.5 font-bold',
                      q.status === 'completed' && 'bg-mint-100 text-mint-700',
                      q.status === 'in_progress' && 'bg-sun-100 text-sun-700',
                      q.status === 'available' && 'bg-sky-100 text-sky-700',
                      q.status === 'locked' && 'bg-gray-100 text-gray-500',
                    )}>
                      {q.status === 'completed' ? 'Ho├án th├ánh' : q.status === 'in_progress' ? '─Éang hß╗ìc' : q.status === 'available' ? 'Sß║╡n s├áng' : 'Kh├│a'}
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
        title="Tß║ím kh├│a hß╗ô s╞í cß╗ºa con?"
        description="Con sß║╜ ch╞░a thß╗â v├áo hß╗ìc, nh╞░ng to├án bß╗Ö tiß║┐n tr├¼nh v├á sß║ún phß║⌐m vß║½n ─æ╞░ß╗úc giß╗» ─æß╗â kh├┤i phß╗Ñc sau."
        confirmLabel="Tß║ím kh├│a hß╗ô s╞í"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deleteChild(deleteTarget.id)
        }}
      />

      {/* EditChildModal ΓÇö full-screen, triggered bß║▒ng n├║t b├║t ch├¼ */}
      <EditChildModal
        child={editTarget ?? null}
        isOpen={editTarget !== undefined}
        onClose={() => setEditTarget(undefined)}
        onSuccess={async () => {
          setEditTarget(undefined)
          showToast(editTarget ? 'Γ£à ─É├ú cß║¡p nhß║¡t hß╗ô s╞í con!' : 'Γ£à ─É├ú tß║ío t├ái khoß║ún con!', 'success')
          await loadKids()
        }}
        onError={(e) => showToast(e, 'error')}
      />

      {/* Modal: nhß║¡p PIN ─æß╗â v├áo hß╗ô s╞í con */}
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
    </div>
  )
}

// ΓöÇΓöÇ Approvals Tab ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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
        decision === 'approved' ? 'Γ£à ─É├ú cho ph├⌐p chia sß║╗' : '≡ƒöÆ ─É├ú giß╗» ri├¬ng t╞░',
        decision === 'approved' ? 'success' : 'info',
      )
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lß╗ùi', 'error')
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <h2 className="font-display text-xl">≡ƒöö Y├¬u cß║ºu chia sß║╗</h2>
      <p className="text-sm text-muted">
        S├íng tß║ío cß╗ºa trß║╗ mß║╖c ─æß╗ïnh ri├¬ng t╞░ ΓÇö chß╗ë hiß╗çn khi ba/mß║╣ ─æß╗ông ├╜.
      </p>

      {approvals.length === 0 && (
        <div className="ui-card p-8 text-center">
          <p className="text-4xl">≡ƒÄë</p>
          <p className="mt-2 font-bold">Kh├┤ng c├│ y├¬u cß║ºu n├áo!</p>
          <p className="text-sm text-muted">Tß║Ñt cß║ú ─æ├ú ─æ╞░ß╗úc xß╗¡ l├╜.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {approvals.map((a) => (
          <div
            key={a.id}
            className="ui-card flex flex-wrap items-center gap-4 p-4 transition hover:shadow-lg"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-50 text-3xl">
              {a.project.kind === 'comic' ? '≡ƒôû' : a.project.kind === 'video' ? '≡ƒÄ¼' : '≡ƒÄ¿'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{a.project.title}</p>
              <p className="text-sm text-muted">
                <span className="font-bold">{a.child.nickname}</span> muß╗æn chia sß║╗ tß╗¢i{' '}
                <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-bold text-sky-700">
                  {a.destination === 'family' ? 'Gia ─æ├¼nh' : a.destination === 'class' ? 'Lß╗¢p hß╗ìc' : 'C├┤ng khai'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void decide(a.id, 'approved')}>
                Γ£à Cho ph├⌐p
              </Button>
              <Button variant="secondary" onClick={() => void decide(a.id, 'rejected')}>
                ≡ƒöÆ Giß╗» ri├¬ng
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ΓöÇΓöÇ Profile Tab ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
      showToast('Γ£à ─É├ú l╞░u hß╗ô s╞í!', 'success')
    } catch {
      showToast('Γ¥î Lß╗ùi khi l╞░u hß╗ô s╞í', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw.length < 8) {
      showToast('Mß║¡t khß║⌐u mß╗¢i phß║úi ΓëÑ 8 k├╜ tß╗▒', 'error')
      return
    }
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      showToast('Γ£à ─É├ú ─æß╗òi mß║¡t khß║⌐u!', 'success')
      setCurrentPw('')
      setNewPw('')
      setChangingPw(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Mß║¡t khß║⌐u c┼⌐ kh├┤ng ─æ├║ng', 'error')
    }
  }

  if (!profile) return <LoadingSkeleton count={2} />

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <h2 className="font-display text-xl">ΓÜÖ∩╕Å Hß╗ô s╞í phß╗Ñ huynh</h2>

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
              Sß╗æ ─æiß╗çn thoß║íi
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
          <label className="mb-1 block text-sm font-bold">Ng├┤n ngß╗» ╞░a th├¡ch</label>
          <div className="flex gap-2">
            {[
              { value: 'vi', label: '≡ƒç╗≡ƒç│ Tiß║┐ng Viß╗çt' },
              { value: 'en', label: '≡ƒç¼≡ƒçº English' },
              { value: 'bilingual', label: '≡ƒîÉ Song ngß╗»' },
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
          Tß╗æi ─æa <strong>{profile.maxChildren}</strong> t├ái khoß║ún con
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? '─Éang l╞░uΓÇª' : 'L╞░u hß╗ô s╞í'}
        </Button>
      </form>

      {/* Password change */}
      <div className="ui-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">≡ƒöÉ Mß║¡t khß║⌐u</h3>
          {!changingPw && (
            <Button variant="secondary" onClick={() => setChangingPw(true)}>
              ─Éß╗òi mß║¡t khß║⌐u
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
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Mß║¡t khß║⌐u hiß╗çn tß║íi"
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Mß║¡t khß║⌐u mß╗¢i (ΓëÑ8 k├╜ tß╗▒)"
              minLength={8}
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
            <div className="flex gap-2">
              <Button type="submit">X├íc nhß║¡n</Button>
              <Button type="button" variant="secondary" onClick={() => setChangingPw(false)}>Hß╗ºy</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ΓöÇΓöÇ Shared UI ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

