import { useEffect, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  Baby,
  Bell,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Gamepad2,
  Info,
  KeyRound,
  Languages,
  Lock,
  Palette,
  PartyPopper,
  Pencil,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
  TrendingUp,
  UserPlus,
  UsersRound,
  Video,
  X,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import {
  STUDENT_AVATARS,
  avatarEmoji as avatarEmojiFromCatalog,
} from '@/shared/config/avatars'
import {
  buildCourseAgeGroups,
  courseAgeGroupId,
} from '@/features/parent/lib/course-age-groups'

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
  ageBand?: string | null
  avatarId: string | null
  level: number
  xp: number
  active: boolean
  hasPin?: boolean
  allowAiCreate?: boolean
  allowPhoto?: boolean
  allowExport?: boolean
  completedQuests?: number
  totalStars?: number
  projectCount?: number
}

type ConsentEvent = {
  id: string
  policyVersion: string
  locale: string
  method: string
  beforeState: Record<string, boolean>
  afterState: Record<string, boolean>
  createdAt: string
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

type ChildPlanUsage = {
  id: string
  nickname: string | null
  openCourses: number
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
  ParentPlanIcon,
  ParentLearningIcon,
  ParentStarsIcon,
  ParentQuestIcon,
  ParentTipIcon,
  ParentProfileIcon,
  ShieldLockIcon,
} from '@/shared/components/icons/ParentIcons'
import { StatMetricCard } from '@/shared/components/charts/StatMetricCard'
import { ProfileSharingPanel } from '@/features/parent/components/ProfileSharingPanel'
import {
  ParentSubscriptionCheckoutModal,
  CREDIT_PACKS,
  type CheckoutProductMode,
} from '@/features/parent/components/ParentSubscriptionCheckoutModal'

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



// ── ConsentTooltip — card có cấu trúc, không phải đoạn văn ──────────
// badge   : dòng tóm tắt quan trọng nhất (in đậm, màu brand)
// on/off  : trạng thái ngắn gọn — màu xanh / đỏ để phân biệt nhanh
// WHY: Phụ huynh không đọc đoạn văn. Card 3 dòng scan được trong 2 giây.
type ConsentTipProps = {
  badge: string
  on: string
  off: string
  onLabel?: string
  offLabel?: string
}
function ConsentTooltip({ badge, on, off, onLabel = 'BẬT', offLabel = 'TẮT' }: ConsentTipProps) {
  return (
    <span className="consent-tip-wrap" style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <span
        role="img"
        aria-label="Giải thích tính năng"
        className="consent-tip-icon"
        style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', color: '#6d5efc', opacity: 0.5, transition: 'opacity 0.15s' }}
      >
        <Info size={13} aria-hidden="true" />
      </span>
      <span
        role="tooltip"
        className="consent-tip-bubble"
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '252px',
          background: '#fff',
          border: '1px solid #ebe8ff',
          borderRadius: '14px',
          padding: '12px 13px 10px',
          boxShadow: '0 8px 28px rgba(109,94,252,0.14)',
          pointerEvents: 'none',
          zIndex: 50,
          opacity: 0,
          visibility: 'hidden' as const,
          transition: 'opacity 0.18s, visibility 0.18s',
        }}
      >
        {/* Badge — thông tin quan trọng nhất */}
        <span style={{
          display: 'block',
          fontWeight: 700,
          fontSize: 11,
          color: '#5646e8',
          background: '#f0eeff',
          borderRadius: 8,
          padding: '4px 8px',
          marginBottom: 9,
          letterSpacing: '0.01em',
        }}>
          {badge}
        </span>
        {/* Trạng thái BẬT */}
        <span style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{
            flexShrink: 0,
            fontWeight: 700,
            fontSize: 10,
            color: '#fff',
            background: '#178a5c',
            borderRadius: 5,
            padding: '1px 5px',
            marginTop: 1,
            lineHeight: '14px',
          }}>✓ {onLabel}</span>
          <span style={{ fontSize: 11.5, color: '#2d2558', lineHeight: '1.5' }}>{on}</span>
        </span>
        {/* Trạng thái TẮT */}
        <span style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
          <span style={{
            flexShrink: 0,
            fontWeight: 700,
            fontSize: 10,
            color: '#fff',
            background: '#b0342a',
            borderRadius: 5,
            padding: '1px 5px',
            marginTop: 1,
            lineHeight: '14px',
          }}>✕ {offLabel}</span>
          <span style={{ fontSize: 11.5, color: '#5c5272', lineHeight: '1.5' }}>{off}</span>
        </span>
        {/* Arrow */}
        <span style={{
          position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid #fff',
        }} aria-hidden="true" />
      </span>
    </span>
  )
}


// ── Main Component ────────────────────────────────────────────
export function ParentPage({
  tab: initTab = 'dashboard',
}: {
  tab?: TabKey
}) {
  const [tab, setTab] = useState<TabKey>(initTab)
  const user = useAuth((s) => s.user)

  // Checkout modal state shared across tabs
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState<CheckoutProductMode>('sub')
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | undefined>()
  const [checkoutPlanAmount, setCheckoutPlanAmount] = useState<number | undefined>()
  const [checkoutPlanName, setCheckoutPlanName] = useState<string | undefined>()
  const [checkoutPackId, setCheckoutPackId] = useState<string | undefined>()

  const handleOpenCheckout = useCallback(
    (
      mode: CheckoutProductMode = 'sub',
      planId?: string,
      amount?: number,
      planName?: string,
      packId?: string,
    ) => {
      setCheckoutMode(mode)
      setCheckoutPlanId(planId)
      setCheckoutPlanAmount(amount)
      setCheckoutPlanName(planName)
      setCheckoutPackId(packId)
      setIsCheckoutOpen(true)
    },
    [],
  )

  useEffect(() => {
    setTab(initTab)
  }, [initTab])

  return (
    <div className="flex flex-col gap-6">
      {/* Only the active route owns effects and server state. */}
      {tab === 'dashboard' && <DashboardTab onOpenCheckout={handleOpenCheckout} />}
      {tab === 'kids' && <KidsTab />}
      {tab === 'plan' && <PlanTab onOpenCheckout={handleOpenCheckout} />}
      {tab === 'approvals' && <ApprovalsTab />}
      {tab === 'profile' && <ProfileTab />}

      <ParentSubscriptionCheckoutModal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false)
          window.dispatchEvent(new CustomEvent('parent:reload-data'))
        }}
        initialMode={checkoutMode}
        defaultPlanId={checkoutPlanId || 'aikids_official_129k'}
        planAmount={checkoutPlanAmount}
        planName={checkoutPlanName}
        initialPackId={checkoutPackId}
      />
    </div>
  )
}

// ── Plan Tab (gói gia đình) ───────────────────────────────────
function PlanTab({
  onOpenCheckout,
}: {
  onOpenCheckout?: (
    mode: CheckoutProductMode,
    planId?: string,
    amount?: number,
    name?: string,
    packId?: string,
  ) => void
}) {
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [usage, setUsage] = useState<ChildPlanUsage[]>([])
  const [checkout, setCheckout] = useState<{ payUrl: string | null; transferHint: string | null } | null>(null)
  const [pricingTab, setPricingTab] = useState<'plans' | 'credits'>('plans')
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    try {
      const [p, s, family] = await Promise.all([
        api<{ plans: PlanRow[] }>('/api/parent/plans'),
        api<{ subscription: HouseholdSub }>('/api/parent/subscription'),
        api<{ children: Child[] }>('/api/parent/children'),
      ])
      setPlans(p.plans)
      setSub({ ...s.subscription, childCount: family.children.length, seatsRemaining: Math.max(0, s.subscription.maxChildren - family.children.length) })
      const childUsage = await Promise.all(family.children.map(async (child) => {
        const result = await api<{ courses: Array<{ enrolled?: boolean }> }>(`/api/parent/children/${child.id}/courses`)
        return { id: child.id, nickname: child.nickname, openCourses: result.courses.filter((course) => course.enrolled).length }
      }))
      setUsage(childUsage)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không tải được gói', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const handleReload = () => void load()
    window.addEventListener('parent:reload-data', handleReload)
    return () => window.removeEventListener('parent:reload-data', handleReload)
  }, [load])

  async function activate(code: string, planName?: string, priceMonthly?: number) {
    setBusy(code)
    if (typeof priceMonthly === 'number' && priceMonthly > 0 && onOpenCheckout) {
      onOpenCheckout('sub', code, priceMonthly, planName)
    }
    try {
      const data = await api<{
        subscription?: HouseholdSub
        message: string
        checkout?: { payUrl?: string | null; transferHint?: string | null; paymentReady?: boolean }
      }>('/api/parent/subscription', {
        method: 'POST',
        body: JSON.stringify({ planCode: code }),
      })
      if (data.subscription) setSub(data.subscription)
      const rawPayUrl = data.checkout?.payUrl ?? null
      let payUrl: string | null = null
      if (rawPayUrl) {
        try {
          const parsed = new URL(rawPayUrl)
          if (parsed.protocol === 'https:') payUrl = parsed.toString()
        } catch {
          payUrl = null
        }
      }
      setCheckout(data.checkout ? { payUrl, transferHint: data.checkout.transferHint ?? null } : null)
      showToast(data.message || (data.checkout ? 'Đã tạo yêu cầu nâng gói.' : 'Đã cập nhật gói học.'), 'success')
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không đổi được gói', 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/60 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-black text-brand-700">
              <Sparkles size={12} /> 👨👩👧 Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              Gói học gia đình
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setPricingTab('plans')}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-black transition',
                pricingTab === 'plans' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted hover:text-text',
              )}
            >
              Gói học định kỳ
            </button>
            <button
              type="button"
              onClick={() => setPricingTab('credits')}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-black transition',
                pricingTab === 'credits' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted hover:text-text',
              )}
            >
              Lượt sáng tạo AI
            </button>
          </div>
        </div>
        <h1 className="font-display text-2xl font-black text-slate-900 mt-3 sm:text-3xl">
          Chọn gói học phù hợp
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl leading-relaxed">
          Gói học quyết định số hồ sơ con và số vùng học mỗi con được mở cùng lúc. Chương trình là nội dung; chỉ vùng đã đăng ký mới xuất hiện trong lộ trình của con.
        </p>
        {sub && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-mint-200/80 bg-mint-50/60 p-4 shadow-2xs">
              <p className="text-xs font-extrabold uppercase tracking-wide text-success">Gói hiện tại</p>
              <p className="mt-1 font-display text-xl font-black text-slate-900">{sub.planName}</p>
              <p className="mt-1 text-xs sm:text-sm text-muted">{sub.childCount}/{sub.maxChildren} hồ sơ con</p>
            </div>
            <div className="rounded-2xl border border-brand-200/80 bg-brand-50/60 p-4 shadow-2xs">
              <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Quyền học</p>
              <p className="mt-1 font-display text-xl font-black text-slate-900">{sub.maxOpenCoursesPerChild} vùng / con</p>
              <p className="mt-1 text-xs sm:text-sm text-muted">Vùng đã hoàn thành vẫn được giữ tiến độ khi đổi gói.</p>
            </div>
          </div>
        )}
      </header>

      {sub && usage.length > 0 && (
        <section className="ui-card p-5">
          <h3 className="font-display text-xl">Mức sử dụng của gia đình</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {usage.map((child) => {
              const percent = sub.maxOpenCoursesPerChild > 0 ? Math.min(100, Math.round((child.openCourses / sub.maxOpenCoursesPerChild) * 100)) : 100
              return (
                <article key={child.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{child.nickname ?? 'Học viên'}</p>
                    <span className="text-sm font-extrabold text-brand-700">{child.openCourses}/{sub.maxOpenCoursesPerChild} vùng</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-50" role="progressbar" aria-label={`${child.nickname ?? 'Học viên'} đã mở ${child.openCourses}/${sub.maxOpenCoursesPerChild} vùng`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                    <div className={cn('h-full rounded-full', percent >= 100 ? 'bg-coral-400' : 'bg-brand-500')} style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {child.openCourses >= sub.maxOpenCoursesPerChild ? 'Đã dùng hết hạn mức. Nâng gói để mở thêm vùng.' : `Còn ${sub.maxOpenCoursesPerChild - child.openCourses} vùng có thể mở.`}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {checkout && (
        <section className="ui-card border-2 border-sun-200 bg-sun-50 p-5">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 text-warning" aria-hidden="true" />
            <div>
              <h3 className="font-display text-xl">Hoàn tất nâng gói</h3>
              {checkout.transferHint && (
                <p className="mt-1 text-sm text-muted">
                  Nội dung thanh toán: <strong className="text-text">{checkout.transferHint}</strong>
                </p>
              )}
              {checkout.payUrl ? (
                <a className="ui-btn ui-btn-primary mt-3" href={checkout.payUrl} target="_blank" rel="noreferrer">
                  Mở trang thanh toán <ExternalLink size={16} />
                </a>
              ) : (
                <p className="mt-2 text-sm text-muted">Yêu cầu đang chờ hệ thống thanh toán xác nhận.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {pricingTab === 'plans' ? (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => {
            const current = sub?.planCode === p.code
            return (
              <article
                key={p.code}
                className={cn(
                  'ui-card flex flex-col justify-between p-5 rounded-3xl border-2 transition hover:shadow-soft',
                  current ? 'border-brand-500 ring-2 ring-brand-300 bg-brand-50/20' : 'border-border/70',
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-black text-slate-900">{p.name}</h3>
                    {current && (
                      <span className="rounded-full bg-brand-100 text-brand-700 px-2.5 py-0.5 text-xs font-black">
                        Đang dùng
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">{p.tagline}</p>
                  <p className="mt-3 font-display text-2xl font-black text-brand-600">
                    {p.priceMonthly === 0
                      ? 'Miễn phí'
                      : `${p.priceMonthly.toLocaleString('vi-VN')} ${p.currency}/tháng`}
                  </p>
                  <div className="grid gap-1 rounded-2xl bg-page p-3 text-xs sm:text-sm my-3 border border-border/50">
                    <p><strong>{p.maxChildren}</strong> hồ sơ con</p>
                    <p><strong>{p.maxOpenCoursesPerChild}</strong> vùng học mở cùng lúc / con</p>
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-muted mb-4">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  disabled={current || busy === p.code}
                  onClick={() => void activate(p.code, p.name, p.priceMonthly)}
                  className={cn(
                    'w-full py-2.5 font-black text-sm rounded-2xl shadow-clay transition',
                    current ? 'bg-slate-200 text-slate-600 cursor-default' : 'bg-brand-500 hover:bg-brand-600 text-white',
                  )}
                >
                  {current ? 'Gói hiện tại' : busy === p.code ? 'Đang tạo yêu cầu…' : sub && p.maxOpenCoursesPerChild > sub.maxOpenCoursesPerChild ? 'Nâng lên gói này' : 'Chọn gói'}
                </Button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {CREDIT_PACKS.map((pack) => (
            <article key={pack.id} className="ui-card flex flex-col justify-between p-4 relative overflow-hidden rounded-3xl border border-border/80 shadow-2xs">
              {pack.badge && (
                <span className="absolute top-2 right-2 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-black">
                  {pack.badge}
                </span>
              )}
              <div>
                <div className="text-2xl mb-1">🎨</div>
                <h4 className="font-display text-base font-black text-text">{pack.label}</h4>
                <p className="text-xs text-muted">{pack.unitPriceText}</p>
                <p className="mt-2 font-display text-lg font-black text-brand-600">{pack.priceFormatted}</p>
              </div>
              <Button
                variant="primary"
                className="mt-3 !py-1.5 !text-xs font-bold w-full rounded-xl"
                onClick={() => onOpenCheckout?.('credits', undefined, pack.price, pack.label, pack.id)}
              >
                Mua lượt
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Dashboard Tab ─────────────────────────────────────────────
function DashboardTab({
  onOpenCheckout,
}: {
  onOpenCheckout: (
    mode: CheckoutProductMode,
    planId?: string,
    amount?: number,
    name?: string,
    packId?: string,
  ) => void
}) {
  const [kids, setKids] = useState<Child[]>([])
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashPricingMode, setDashPricingMode] = useState<'sub' | 'credits'>('sub')
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [childrenData, approvalsData, subData, plansData] = await Promise.allSettled([
      api<{ children: Child[] }>('/api/parent/children'),
      api<{ approvals: Approval[] }>('/api/parent/approvals?status=pending'),
      api<{ subscription: HouseholdSub }>('/api/parent/subscription'),
      api<{ plans: PlanRow[] }>('/api/parent/plans'),
    ])
    if (childrenData.status === 'rejected') {
      setError('Chưa tải được dữ liệu của các con. Ba / Mẹ thử lại nhé.')
      setLoading(false)
      return
    }
    setKids(childrenData.value.children)
    setApprovals(approvalsData.status === 'fulfilled' ? approvalsData.value.approvals : [])
    if (subData.status === 'fulfilled') {
      setSub(subData.value.subscription)
    }
    if (plansData.status === 'fulfilled') {
      setPlans(plansData.value.plans)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const handleReload = () => void load()
    window.addEventListener('parent:reload-data', handleReload)
    return () => window.removeEventListener('parent:reload-data', handleReload)
  }, [load])

  if (loading) {
    return <LoadingSkeleton count={3} />
  }

  if (error) return <ErrorState message={error} onRetry={() => void load()} inline />

  const totalXp = kids.reduce((s, k) => s + k.xp, 0)
  const totalStars = kids.reduce((s, k) => s + (k.totalStars ?? 0), 0)
  const totalQuests = kids.reduce((s, k) => s + (k.completedQuests ?? 0), 0)
  const pendingCount = approvals.length

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Household Status Banner & Cockpit ──────────────── */}
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/70 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-black text-brand-700">
              <Sparkles size={12} /> 👨👩👧 Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              Tổng quan gia đình
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="gap-2 !text-xs font-bold"
              onClick={() => navigate('/parent/kids')}
            >
              <ParentKidsIcon size={18} /> Quản lý con
            </Button>
            <Button
              variant="ghost"
              className="gap-2 !text-xs font-bold"
              onClick={() => void load()}
            >
              <RefreshCw size={13} /> Làm mới
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">
              Chào Ba / Mẹ {(user?.nickname || user?.name) ?? ''}! ✨
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl leading-relaxed">
              Cùng theo dõi sự tiến bộ, khích lệ sáng tạo và đồng hành trên từng trạm học của con.
            </p>
          </div>

          {/* Subscription Cockpit Capsule */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50/80 to-purple-50/80 p-3.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white shadow-clay text-lg">
                👑
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wide text-brand-700">
                    Gói học hiện tại
                  </span>
                  <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-black text-brand-800">
                    {sub?.planName || 'Khởi Đầu'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700">
                  {kids.length}/{sub?.maxChildren ?? 1} hồ sơ con · {sub?.maxOpenCoursesPerChild ?? 2} vùng mở cùng lúc
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="primary"
                className="gap-1.5 !text-xs font-black shadow-clay bg-brand-500 hover:bg-brand-600 text-white rounded-xl"
                onClick={() => onOpenCheckout('sub', 'aikids_pro', 129000, 'AI Kids Pro')}
              >
                <Sparkles size={13} /> ⭐ Nâng cấp gói
              </Button>
              <Button
                variant="secondary"
                className="gap-1.5 !text-xs font-bold rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                onClick={() => onOpenCheckout('credits', undefined, 100000, '50 lượt tạo ảnh AI', 'credits_50')}
              >
                ⚡ Nạp lượt AI
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Metric KPI Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatMetricCard
          label="Số con theo học"
          value={kids.length}
          icon={<ParentKidsIcon size={32} />}
          color="sky"
          trend={kids.length > 0 ? { value: `${kids.length} hồ sơ`, isPositive: true } : undefined}
          sparklineData={[kids.length]}
          subtext="Học an toàn bằng biệt danh & PIN"
          onClick={() => navigate('/parent/kids')}
        />
        <StatMetricCard
          label="Tổng sao tích lũy"
          value={totalStars}
          icon={<ParentStarsIcon size={32} />}
          color="sun"
          trend={totalStars > 0 ? { value: `${totalStars} sao`, isPositive: true } : undefined}
          sparklineData={[totalStars]}
          subtext={`${totalStars} sao đạt từ các bài quiz`}
        />
        <StatMetricCard
          label="Nhiệm vụ hoàn thành"
          value={totalQuests}
          icon={<ParentQuestIcon size={32} />}
          color="mint"
          trend={totalQuests > 0 ? { value: `${totalQuests} trạm`, isPositive: true } : undefined}
          sparklineData={[totalQuests]}
          subtext={`${totalQuests} trạm học đã chinh phục`}
          onClick={() => navigate('/parent/learning')}
        />
        <StatMetricCard
          label="Chờ duyệt sáng tạo"
          value={pendingCount}
          icon={<ParentApprovalIcon size={32} />}
          color={pendingCount > 0 ? 'coral' : 'brand'}
          badge={pendingCount > 0 ? 'Cần duyệt ngay' : 'Đã duyệt hết'}
          sparklineData={[pendingCount]}
          subtext={
            pendingCount > 0
              ? `${pendingCount} tác phẩm con muốn chia sẻ`
              : 'Tất cả tác phẩm đã sẵn sàng'
          }
          onClick={() => navigate('/parent/approvals')}
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/parent/kids"
          className="ui-card flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-brand-300"
        >
          <ParentKidsIcon size={32} aria-hidden="true" />
          <div>
            <p className="font-bold">Quản lý hồ sơ con</p>
            <p className="text-xs text-muted">Danh tính, PIN và quyền an toàn</p>
          </div>
        </Link>
        <Link
          to="/parent/learning"
          className="ui-card flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-brand-300"
        >
          <BookOpen size={30} className="text-brand-500" aria-hidden="true" />
          <div>
            <p className="font-bold">Theo dõi học tập</p>
            <p className="text-xs text-muted">Lộ trình, hoạt động và năng lực</p>
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

      {/* ── 3. Per-Child Progress — dữ liệu thực từ API ─────────── */}
      {kids.length > 0 && (
        <div className="ui-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-text">Tiến độ từng con</h3>
              <p className="text-xs text-muted">Số trạm học đã chinh phục — dữ liệu thực từ hệ thống</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-700">
              Tổng: {totalQuests} trạm
            </span>
          </div>
          <div className="flex items-end gap-4">
            {kids.map((kid) => {
              const quests = kid.completedQuests ?? 0
              const maxQuests = Math.max(...kids.map((k) => k.completedQuests ?? 0), 1)
              const pct = Math.round((quests / maxQuests) * 100)
              return (
                <div key={kid.id} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-extrabold text-text">{quests}</span>
                  <div className="relative w-full overflow-hidden rounded-xl bg-slate-100" style={{ height: 80 }}>
                    <div
                      className="absolute bottom-0 w-full rounded-xl bg-gradient-to-t from-brand-500 to-brand-300 transition-all duration-700"
                      style={{ height: `${Math.max(pct, 8)}%` }}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="max-w-[72px] truncate text-center text-[11px] font-bold text-text">
                      {kid.nickname}
                    </span>
                    <span className="text-[10px] text-muted">Cấp {kid.level ?? 1}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 4. Children Deep-Dive Journey Cards ──────────────── */}
      <section aria-label="Tiến trình chi tiết từng con">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-text">Hành trình học tập của các con</h3>
            <p className="text-xs text-muted">Chi tiết cấp độ, kinh nghiệm và cài đặt an toàn</p>
          </div>
          <Button
            variant="ghost"
            className="!text-xs font-bold text-brand-600"
            onClick={() => navigate('/parent/kids')}
          >
            Quản lý hồ sơ
          </Button>
        </div>

        {kids.length === 0 ? (
          <div className="ui-card flex flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="text-4xl">👶</span>
            <p className="font-display text-base font-bold">Chưa có hồ sơ con nào</p>
            <p className="max-w-md text-xs text-muted">
              Ba / Mẹ hãy tạo hồ sơ cho con để bé có thể bắt đầu đăng nhập bằng biệt danh và học tập.
            </p>
            <Button onClick={() => navigate('/parent/kids')} className="gap-2">
              <Plus size={16} /> Thêm hồ sơ con
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {kids.map((k) => {
              const nextLevelXp = Math.max(k.level * 200, 100)
              const currentLvlXp = k.xp % nextLevelXp
              const progressPct = Math.min(Math.round((currentLvlXp / nextLevelXp) * 100), 100)

              return (
                <div
                  key={k.id}
                  className="ui-card flex flex-col justify-between p-5 transition hover:shadow-md"
                >
                  {/* Top: Child Avatar + Level + Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span
                          className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-3xl shadow-sm"
                          role="img"
                          aria-label="Avatar"
                        >
                          {avatarEmoji(k.avatarId)}
                        </span>
                        <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                          Lv.{k.level}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-base font-bold text-text">
                            {k.nickname || 'Bé yêu'}
                          </h4>
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              k.active ? 'bg-emerald-500' : 'bg-slate-300',
                            )}
                            title={k.active ? 'Đang hoạt động' : 'Tạm dừng'}
                          />
                        </div>
                        <p className="text-xs text-muted">
                          {k.ageBand ? `Nhóm tuổi: ${k.ageBand}` : 'Nhóm tuổi: 8-11'} · {k.xp} XP
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-sun-50 px-2.5 py-1 text-xs font-black text-amber-700">
                        ⭐ {k.totalStars ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                        🚀 {k.completedQuests ?? 0} trạm
                      </span>
                    </div>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-muted">Tiến độ lên Cấp {k.level + 1}</span>
                      <span className="font-black text-brand-600">
                        {currentLvlXp} / {nextLevelXp} XP ({progressPct}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-400 transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Safety & Permissions Badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold',
                        k.allowAiCreate
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      <Sparkles size={11} /> AI Sáng tạo: {k.allowAiCreate ? 'Bật' : 'Tắt'}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold',
                        k.hasPin
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60',
                      )}
                    >
                      <Lock size={11} /> {k.hasPin ? 'Có PIN bảo vệ' : 'Chưa đặt PIN'}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold',
                        k.allowExport
                          ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      Xuất tác phẩm: {k.allowExport ? 'Cho phép' : 'Khóa'}
                    </span>
                  </div>

                  {/* Action Link to Learning Portal */}
                  <div className="mt-3 flex items-center justify-between pt-2">
                    <span className="text-[11px] text-muted font-medium">Lộ trình học theo nhóm tuổi</span>
                    <Link
                      to={`/parent/learning?childId=${encodeURIComponent(k.id)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition"
                    >
                      <span>Xem chi tiết học tập</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 5. Direct Subscription & Credits Showcase Hub ─────── */}
      <section aria-label="Gói học và nâng cấp cho gia đình">
        <div className="ui-card p-5 sm:p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <h3 className="font-display text-lg sm:text-xl font-black text-text">
                  Gói học & Nâng cấp cho gia đình
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Mở khóa toàn bộ chương trình Toán Olympic ASMO, vẽ tranh truyện AI và vùng học không giới hạn.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setDashPricingMode('sub')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-black transition',
                  dashPricingMode === 'sub' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted hover:text-text',
                )}
              >
                Gói học gia đình
              </button>
              <button
                type="button"
                onClick={() => setDashPricingMode('credits')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-black transition',
                  dashPricingMode === 'credits' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted hover:text-text',
                )}
              >
                Lượt sáng tạo AI
              </button>
            </div>
          </div>

          {dashPricingMode === 'sub' ? (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Free plan */}
              <div className={cn(
                'rounded-3xl border-2 p-5 flex flex-col justify-between transition',
                sub?.planCode === 'free' ? 'border-brand-400 bg-brand-50/30' : 'border-border/70 bg-white',
              )}>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg font-black text-text">Khởi Đầu</h4>
                    <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-extrabold">Miễn phí</span>
                  </div>
                  <p className="text-xs text-muted mt-1">Trải nghiệm các trạm học cơ bản</p>
                  <p className="font-display text-2xl font-black text-slate-900 mt-2">0 đ</p>
                  <div className="mt-3 space-y-1.5 text-xs text-muted border-t border-border/50 pt-3">
                    <p>• 1 hồ sơ con</p>
                    <p>• 1 vùng học mở cùng lúc</p>
                    <p>• 10 lượt tạo truyện AI dùng thử</p>
                  </div>
                </div>
                <Button
                  disabled={sub?.planCode === 'free'}
                  variant="secondary"
                  className="mt-4 w-full !text-xs font-bold rounded-xl"
                  onClick={() => navigate('/parent/plan')}
                >
                  {sub?.planCode === 'free' ? 'Gói hiện tại' : 'Xem chi tiết'}
                </Button>
              </div>

              {/* Pro plan */}
              <div className="rounded-3xl border-2 border-brand-500 bg-gradient-to-b from-brand-50/40 via-white to-white p-5 flex flex-col justify-between relative shadow-clay">
                <span className="absolute -top-3 right-4 rounded-full bg-brand-500 text-white px-3 py-0.5 text-[11px] font-black shadow-sm">
                  ⭐ Khuyên dùng
                </span>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg font-black text-brand-700">AI Kids Pro</h4>
                    <span className="rounded-full bg-brand-100 text-brand-800 px-2 py-0.5 text-[10px] font-black">Phổ biến</span>
                  </div>
                  <p className="text-xs text-muted mt-1">Đầy đủ Toán Olympic & Sáng tạo AI</p>
                  <p className="font-display text-2xl font-black text-brand-600 mt-2">
                    129.000 đ <span className="text-xs text-muted font-normal">/tháng</span>
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-700 border-t border-brand-100 pt-3">
                    <p className="font-bold text-brand-700">• 2 hồ sơ con theo học</p>
                    <p className="font-bold">• 5 vùng học mở cùng lúc / con</p>
                    <p>• Trọn bộ luyện thi Olympic ASMO, TIMO</p>
                    <p>• 50 lượt tạo tranh/truyện AI mỗi tháng</p>
                    <p>• Báo cáo sư phạm hàng tuần cho Ba / Mẹ</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="mt-4 w-full !text-xs font-black shadow-clay bg-brand-500 hover:bg-brand-600 text-white rounded-xl gap-1.5"
                  onClick={() => onOpenCheckout('sub', 'aikids_pro', 129000, 'AI Kids Pro')}
                >
                  <Sparkles size={14} /> Nâng cấp ngay
                </Button>
              </div>

              {/* Family Hero plan */}
              <div className="rounded-3xl border-2 border-purple-300 bg-white p-5 flex flex-col justify-between transition hover:border-purple-400">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg font-black text-purple-900">Family Hero</h4>
                    <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-black">Toàn diện</span>
                  </div>
                  <p className="text-xs text-muted mt-1">Dành cho gia đình có nhiều bé</p>
                  <p className="font-display text-2xl font-black text-purple-700 mt-2">
                    249.000 đ <span className="text-xs text-muted font-normal">/tháng</span>
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-700 border-t border-border/50 pt-3">
                    <p className="font-bold text-purple-800">• Lên tới 5 hồ sơ con</p>
                    <p className="font-bold">• Không giới hạn vùng học mở</p>
                    <p>• 150 lượt sáng tạo tranh & comic AI</p>
                    <p>• Đấu trường Olympic trực tuyến không giới hạn</p>
                    <p>• Hỗ trợ riêng từ chuyên gia giáo dục</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="mt-4 w-full !text-xs font-bold rounded-xl border border-purple-200 text-purple-800 hover:bg-purple-50"
                  onClick={() => onOpenCheckout('sub', 'aikids_family', 249000, 'Family Hero')}
                >
                  Nâng lên Family Hero
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {CREDIT_PACKS.map((pack) => (
                <div key={pack.id} className="rounded-2xl border border-border/70 p-3.5 flex flex-col justify-between bg-page/50">
                  <div>
                    <span className="text-xl">🎨</span>
                    <h4 className="font-display text-sm font-black text-text mt-1">{pack.label}</h4>
                    <p className="text-[11px] text-muted">{pack.unitPriceText}</p>
                    <p className="font-display text-base font-black text-brand-600 mt-1">{pack.priceFormatted}</p>
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-3 !py-1 !text-xs font-bold rounded-lg w-full"
                    onClick={() => onOpenCheckout('credits', undefined, pack.price, pack.label, pack.id)}
                  >
                    Nạp ngay
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 6. Creative Approvals Showcase Widget ────────────── */}
      <section aria-label="Trung tâm phê duyệt tác phẩm">
        <div className="ui-card overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 bg-coral-50/40 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <ParentApprovalIcon size={22} />
              <div>
                <h3 className="font-display text-base font-bold text-text">
                  Duyệt chia sẻ tác phẩm của con
                </h3>
                <p className="text-xs text-muted">
                  Bảo vệ an toàn và quyền riêng tư cho các tác phẩm AI do con sáng tạo
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="!text-xs font-bold text-rose-600"
              onClick={() => navigate('/parent/approvals')}
            >
              Xem tất cả ({pendingCount})
            </Button>
          </div>

          {approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-mint-50 text-2xl">
                🎨
              </div>
              <p className="font-display text-sm font-bold text-emerald-800">
                Tất cả tác phẩm đều đã được xử lý an toàn
              </p>
              <p className="max-w-sm text-xs text-muted">
                Khi con hoàn thành truyện tranh hoặc tranh vẽ AI mới và muốn chia sẻ, yêu cầu sẽ xuất hiện tại đây để Ba / Mẹ phê duyệt.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {approvals.slice(0, 3).map((appr) => (
                <div
                  key={appr.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-rose-50/20"
                >
                  <div className="flex items-center gap-3">
                    {appr.project.thumbnail ? (
                      <img
                        src={appr.project.thumbnail}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-100 text-xl">
                        🎨
                      </div>
                    )}
                    <div>
                      <p className="font-display text-sm font-bold text-text">
                        {appr.project.title || 'Tác phẩm sáng tạo AI'}
                      </p>
                      <p className="text-xs text-muted">
                        Tác giả: <strong>{appr.child.nickname || 'Bé'}</strong> · Loại: {appr.project.kind || 'Truyện tranh'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    className="gap-1.5 !px-3 !py-1 !text-xs font-bold text-rose-700"
                    onClick={() => navigate('/parent/approvals')}
                  >
                    <CheckCircle2 size={13} /> Duyệt tác phẩm
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}


// ── Fallback age bands — dùng khi chưa có con nào hoặc API chưa trả về kịp
const FALLBACK_AGE_BANDS = [
  { value: '8-11', label: '8–11 tuổi' },
  { value: '9-12', label: '9–12 tuổi' },
  { value: '13-15', label: '13–15 tuổi' },
]

// ── Edit Child Modal — Full-screen — tên, avatar, mục tiêu, PIN ────
// Ba / Mẹ bấm ✏️ → modal này mở toàn màn hình, bao gồm cả đổi PIN
function EditChildModal({
  child,
  isOpen,
  referenceChildId, // id của con đầu tiên để fetch danh sách nhóm tuổi từ courses thực tế
  onClose,
  onSuccess,
  onError,
}: {
  child: Child | null     // null = tạo mới
  isOpen: boolean
  referenceChildId?: string
  onClose: () => void
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const [nickname, setNickname] = useState('')
  const [ageBand, setAgeBand] = useState('8-11')
  const [avatarId, setAvatarId] = useState('avatar-robot')
  const [goal, setGoal] = useState('comic')
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)
  // Danh sách nhóm tuổi lấy động từ API courses; fallback về hằng số nếu không có data
  const [ageBandOptions, setAgeBandOptions] = useState(FALLBACK_AGE_BANDS)

  // Khi mở modal, điền sẵn giá trị hiện tại (nếu đang sửa)
  useEffect(() => {
    if (isOpen) {
      setNickname(child?.nickname ?? '')
      setAgeBand(child?.ageBand ?? '8-11')
      setAvatarId(child?.avatarId ?? 'avatar-robot')
      setGoal('comic')
      setPin('')
    }
  }, [isOpen, child])

  // WHY: Load nhóm tuổi động từ danh sách courses thực tế thay vì hardcode.
  // Dùng referenceChildId (thường là con đầu tiên) để gọi endpoint có sẵn.
  // Nếu không có child nào hoặc API lỗi → giữ nguyên FALLBACK_AGE_BANDS, không crash.
  useEffect(() => {
    if (!isOpen || !referenceChildId) return
    const controller = new AbortController()
    void (async () => {
      try {
        const data = await api<{
          courses: Array<{ ageLabel: string; ageTrack: string }>
        }>(`/api/parent/children/${referenceChildId}/courses`, { signal: controller.signal })
        const seen = new Map<string, string>()
        for (const course of data.courses) {
          // Dùng cùng logic courseAgeGroupId: ưu tiên ageTrack, fallback ageLabel
          const id = (course.ageTrack?.trim() || course.ageLabel?.trim()) || ''
          const label = course.ageLabel?.trim() || id
          if (id && label && !seen.has(id)) seen.set(id, label)
        }
        if (seen.size > 0) {
          // Sắp xếp theo số tuổi nhỏ nhất trong label (giống buildCourseAgeGroups)
          const sorted = [...seen.entries()]
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => {
              const na = Number(a.label.match(/\d+/)?.[0] ?? 999)
              const nb = Number(b.label.match(/\d+/)?.[0] ?? 999)
              return na - nb || a.label.localeCompare(b.label, 'vi')
            })
          setAgeBandOptions(sorted)
        }
      } catch {
        // Fetch thất bại hoặc bị abort → giữ nguyên fallback, không hiện lỗi
      }
    })()
    return () => controller.abort()
  }, [isOpen, referenceChildId])

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
    if (!child) {
      if (!pin || !/^\d{6}$/.test(pin)) {
        onError('Mã PIN cần đúng 6 chữ số để con đăng nhập vào học.')
        return
      }
    } else {
      if (pin && !/^\d{6}$/.test(pin)) {
        onError('Mã PIN cần đủ 6 chữ số, hoặc để trống.')
        return
      }
    }
    setSaving(true)
    try {
      if (child) {
        // Cập nhật hồ sơ con; PIN có contract riêng để không bị bỏ qua ở
        // gateway adapter và để backend áp dụng rate-limit/step-up policy.
        await api(`/api/parent/children/${child.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            ageBand,
          }),
        })
        if (pin) {
          await api(`/api/parent/children/${child.id}/pin`, {
            method: 'POST',
            body: JSON.stringify({ pin }),
          })
        }
      } else {
        await api<{ child: { id: string } }>('/api/parent/children', {
          method: 'POST',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            ageBand,
            goal,
            // Gửi PIN kèm lúc tạo nếu Ba / Mẹ đặt ngay
            ...(pin ? { pin } : {}),
          }),
        })
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
          </div>

          <div>
            <label className='mb-1 block text-sm font-bold' htmlFor='edit-age-band'>Nhóm tuổi học tập</label>
            <select
              id='edit-age-band'
              value={ageBandOptions.some((o) => o.value === ageBand) ? ageBand : ageBandOptions[0]?.value ?? ageBand}
              onChange={(e) => setAgeBand(e.target.value)}
              className='w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm'
            >
              {ageBandOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className='mt-1 text-xs text-muted'>Hệ thống gợi ý nội dung phù hợp theo nhóm tuổi này.</p>
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
              {child?.hasPin ? 'Đổi mã PIN (tùy chọn)' : 'Mã PIN đăng nhập (6 số) *'}
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
                : '6 chữ số. Con dùng để đăng nhập vào học và giữ riêng tư giữa các bé.'}
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
  accessPolicy: string
  priceAmountMinor: string
  priceCurrency: string
}

type CoursePaymentState = {
  publicId: string
  status: 'pending' | 'succeeded' | 'failed' | 'unknown'
}

function KidsTab() {
  const [kids, setKids] = useState<Child[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null)
  const [consentHistoryChild, setConsentHistoryChild] = useState<string | null>(null)
  const [consentHistory, setConsentHistory] = useState<Record<string, ConsentEvent[]>>({})
  const [consentHistoryLoading, setConsentHistoryLoading] = useState(false)
  const [editTarget, setEditTarget] = useState<Child | null | undefined>(undefined)
  const [qrModalTarget, setQrModalTarget] = useState<Child | null>(null)
  const { toasts, showToast, dismissToast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

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

  const maxKids = sub?.maxChildren ?? 5
  const seatsLeft = sub?.seatsRemaining ?? Math.max(0, maxKids - kids.length)

  useEffect(() => {
    if (searchParams.get('action') === 'new' && editTarget === undefined && seatsLeft > 0) {
      setEditTarget(null)
      // Xóa query param để không lặp lại khi đóng modal
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('action')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, editTarget, seatsLeft, setSearchParams])

  useEffect(() => {
    const handleReload = () => void loadKids()
    window.addEventListener('parent:reload-data', handleReload)
    return () => window.removeEventListener('parent:reload-data', handleReload)
  }, [loadKids])

  async function deleteChild(childId: string) {
    try {
      await api(`/api/parent/children/${childId}`, { method: 'DELETE' })
      showToast('Tài khoản con đã được tạm khóa.', 'success')
      await loadKids()
      setDeleteTarget(null)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi', 'error')
      setDeleteTarget(null)
    }
  }

  async function updateConsent(
    child: Child,
    capability: 'allowAiCreate' | 'allowPhoto' | 'allowExport',
    enabled: boolean,
  ) {
    try {
      await api(`/api/parent/children/${child.id}/consent`, {
        method: 'PATCH',
        body: JSON.stringify({
          [capability]: enabled,
          policyVersion: 'aikids-child-safety-v1',
          locale: 'vi-VN',
        }),
      })
      setKids((prev) => prev.map((item) => item.id === child.id
        ? { ...item, [capability]: enabled }
        : item))
      setConsentHistory((prev) => {
        const next = { ...prev }
        delete next[child.id]
        return next
      })
      showToast('Đã cập nhật quyền an toàn cho con.', 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không cập nhật được quyền', 'error')
    }
  }

  async function toggleConsentHistory(childId: string) {
    if (consentHistoryChild === childId) {
      setConsentHistoryChild(null)
      return
    }
    setConsentHistoryChild(childId)
    if (consentHistory[childId]) return
    setConsentHistoryLoading(true)
    try {
      const result = await api<{ events: ConsentEvent[] }>(
        `/api/parent/children/${childId}/consent/events`,
      )
      setConsentHistory((prev) => ({ ...prev, [childId]: result.events }))
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không tải được lịch sử quyền', 'error')
    } finally {
      setConsentHistoryLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header Cockpit */}
      <header className="rounded-3xl border-2 border-cream-300 bg-gradient-to-b from-cream-50 via-sun-50/40 to-white p-5 sm:p-6 shadow-clay text-text">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-black text-amber-900">
              <Sparkles size={12} className="text-amber-600" /> 👨‍👩‍👧‍👦 Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs font-black text-brand-700">
              Hồ sơ con ({kids.filter((k) => k.active !== false).length}/{maxKids} ghế)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/parent/plan"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-black text-amber-900 shadow-soft hover:bg-amber-100 transition"
            >
              ⭐ Đổi gói / Mở thêm ghế
            </Link>
            <Button
              onClick={() => setEditTarget(null)}
              disabled={seatsLeft <= 0}
              className="!text-xs !min-h-9 font-black shadow-clay"
            >
              + Thêm con
            </Button>
          </div>
        </div>

        <h1 className="font-display text-2xl font-black text-text mt-3 sm:text-3xl">
          Quản lý tài khoản các con
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl leading-relaxed">
          Quản lý danh tính, mã PIN, quyền an toàn và cách con đăng nhập. Tiến trình và chương trình học được quản lý riêng tại Trung tâm học tập.
        </p>

        {/* Family Safety Shield & Seat Meter */}
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-cream-300/80 bg-white/80 p-4 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-mint-600" />
              <p className="text-xs font-black text-mint-800">
                🛡️ 100% tài khoản đã được bảo vệ mã PIN & kiểm duyệt AI an toàn
              </p>
            </div>
            {sub && (
              <span className="text-xs font-bold text-muted">
                Gói {sub.planName} · Còn {seatsLeft} ghế trống
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from({ length: maxKids }).map((_, i) => {
              const k = kids.filter((child) => child.active !== false)[i]
              if (k) {
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-2xl bg-cream-50 px-3 py-1.5 shadow-soft border border-cream-200"
                    title={k.nickname || 'Bé'}
                  >
                    <span className="text-xl">{avatarEmoji(k.avatarId)}</span>
                    <span className="text-xs font-black max-w-[5rem] truncate text-text">{k.nickname}</span>
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-black text-amber-900">
                      Lv.{k.level || 1}
                    </span>
                  </div>
                )
              }
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-2xl bg-white/60 px-3 py-1.5 border-2 border-dashed border-cream-300 opacity-70"
                >
                  <div className="w-5 h-5 rounded-full bg-cream-100 flex items-center justify-center text-xs text-muted">
                    <Plus size={12} />
                  </div>
                  <span className="text-xs font-bold text-muted">Ghế trống</span>
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* Grid of child cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kids.length === 0 && (
          <div className="ui-card p-6 text-center sm:col-span-2 xl:col-span-3">
            <Baby className="mx-auto text-brand-500" size={36} aria-hidden="true" />
            <p className="mt-2 font-bold">Chưa có con nào</p>
            <p className="text-sm text-muted">Nhấn "Thêm con" để bắt đầu</p>
          </div>
        )}
        {kids.map((k) => {
          const courseCount = (k as any).openCourses ?? 2
          return (
            <div
              key={k.id}
              className={cn(
                'flex flex-col gap-3.5 p-5 transition rounded-3xl border-2 border-cream-300 shadow-clay bg-gradient-to-b from-white via-cream-50/30 to-white text-text',
                !k.active && 'opacity-50',
              )}
            >
              {/* Card Header: Avatar, Name, Level & Quick Actions */}
              <div className="flex items-start gap-3.5">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-sun-100 to-cream-100 text-4xl shadow-soft border-2 border-cream-200">
                    {avatarEmoji(k.avatarId)}
                  </div>
                  <span className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-amber-950 shadow-soft">
                    Lv.{k.level || 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-black text-text leading-tight truncate">{k.nickname}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditTarget(k)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-cream-100 hover:text-text transition"
                        title="Chỉnh sửa hồ sơ"
                        aria-label="Chỉnh sửa hồ sơ con"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(k)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-coral-50 hover:text-coral-600 transition"
                        title="Tạm khóa"
                        aria-label="Tạm khóa hồ sơ con"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted font-bold mt-0.5">{k.ageBand || 'Chưa đặt nhóm tuổi'}</p>

                  {/* Level XP Bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 bg-cream-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(10, ((k.xp % 1000) / 1000) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-brand-700">
                      Cấp {k.level || 1} · {k.xp || 0} XP
                    </span>
                  </div>

                  {/* PIN Safety status */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold">
                    {k.hasPin ? (
                      <button
                        type="button"
                        onClick={() => setEditTarget(k)}
                        className="inline-flex items-center gap-1 text-mint-700 hover:underline"
                      >
                        <Lock size={12} className="text-mint-600" />
                        <span>🔒 Đã có mã PIN (Bảo vệ an toàn)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditTarget(k)}
                        className="inline-flex items-center gap-1 text-amber-800 hover:underline"
                      >
                        <KeyRound size={12} className="text-amber-600" />
                        <span>⚠️ Chưa tạo mã PIN</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Quick Stat Badges */}
              <div className="grid grid-cols-3 gap-2 bg-cream-50/80 rounded-2xl p-2.5 border border-cream-200 shadow-soft">
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase font-black text-muted">Hoàn thành</span>
                  <span className="text-xs font-black text-text">🚀 {k.completedQuests ?? 0} trạm</span>
                </div>
                <div className="flex flex-col items-center text-center border-l border-r border-cream-200">
                  <span className="text-[10px] uppercase font-black text-muted">Tích lũy</span>
                  <span className="text-xs font-black text-text">⭐ {k.totalStars ?? 0} sao</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase font-black text-muted">Mở khóa</span>
                  <span className="text-xs font-black text-text">📚 {courseCount} vùng học</span>
                </div>
              </div>

              {/* Safety Control Board */}
              <div className="rounded-2xl border border-cream-300/80 bg-white/90 p-3 shadow-soft space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-brand-800">
                  Bảng điều khiển quyền an toàn
                </p>
                <div className="grid gap-1.5 text-xs">
                  <label className="flex items-start gap-2.5 rounded-xl bg-cream-50/60 px-2.5 py-2 border border-cream-200 hover:border-brand-200 transition cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-brand-500"
                      checked={Boolean(k.allowAiCreate)}
                      onChange={(event) => void updateConsent(k, 'allowAiCreate', event.target.checked)}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-1 font-bold text-text">
                        🤖 Phòng sáng tạo AI
                        <ConsentTooltip
                          badge="🤖 Nội dung AI được kiểm duyệt tự động"
                          on="Con vào được Studio AI, tạo câu chuyện & nhân vật."
                          off="Nút 'Tạo với AI' bị ẩn hoàn toàn với con."
                        />
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 rounded-xl bg-cream-50/60 px-2.5 py-2 border border-cream-200 hover:border-brand-200 transition cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-brand-500"
                      checked={Boolean(k.allowPhoto)}
                      onChange={(event) => void updateConsent(k, 'allowPhoto', event.target.checked)}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-1 font-bold text-text">
                        📷 Cho phép dùng ảnh & camera
                        <ConsentTooltip
                          badge="📷 Ảnh chỉ lưu trong ứng dụng, không chia sẻ ra ngoài"
                          on="Con dùng được camera & thư viện ảnh thiết bị."
                          off="Chỉ dùng ảnh có sẵn trong thư viện hệ thống."
                        />
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 rounded-xl bg-cream-50/60 px-2.5 py-2 border border-cream-200 hover:border-brand-200 transition cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-brand-500"
                      checked={!Boolean(k.allowExport)}
                      onChange={(event) => void updateConsent(k, 'allowExport', !event.target.checked)}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-1 font-bold text-text">
                        📤 Tắt xuất / chia sẻ
                        <ConsentTooltip
                          badge="📤 Mọi chia sẻ vẫn cần phụ huynh duyệt"
                          on="Nút chia sẻ bị ẩn hoàn toàn — con không thể chia sẻ."
                          off="Con thấy nút chia sẻ, phụ huynh duyệt từng lần."
                          onLabel="ĐÃ TẮT"
                          offLabel="ĐANG BẬT"
                        />
                      </span>
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted bg-cream-100/60 px-2.5 py-1.5 rounded-xl border border-cream-200">
                  ⏱️ 45 phút / ngày · Nhắc nghỉ mắt 20 phút
                </div>
              </div>

              {/* Consent history toggle */}
              <div className="flex flex-col">
                <button
                  type="button"
                  className="text-left text-[11px] font-black text-brand-600 hover:underline w-fit"
                  onClick={() => void toggleConsentHistory(k.id)}
                  aria-expanded={consentHistoryChild === k.id}
                >
                  {consentHistoryChild === k.id ? 'Ẩn lịch sử thay đổi quyền' : 'Xem lịch sử thay đổi quyền'}
                </button>
                {consentHistoryChild === k.id && (
                  <div className="mt-2 rounded-xl border border-cream-300 bg-cream-50/80 p-2.5 text-[11px]" role="region" aria-label="Lịch sử quyền an toàn">
                    {consentHistoryLoading && !consentHistory[k.id] ? (
                      <p className="text-muted">Đang tải lịch sử...</p>
                    ) : consentHistory[k.id]?.length ? (
                      <ol className="flex flex-col gap-1.5">
                        {consentHistory[k.id].map((event) => (
                          <li key={event.id} className="rounded-lg bg-white px-2 py-1.5 shadow-soft border border-cream-200">
                            <p className="font-bold text-text">{new Date(event.createdAt).toLocaleString('vi-VN')}</p>
                            <p className="text-muted">Chính sách {event.policyVersion} · {event.method}</p>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-muted">Chưa có bản ghi thay đổi.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/parent/learning?childId=${encodeURIComponent(k.id)}`}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-brand-500 py-2.5 px-3 text-xs font-black text-white shadow-clay transition hover:bg-brand-600 active:scale-95 text-center"
                  >
                    <BookOpen size={15} />
                    <span>Xem học tập</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => navigate('/kids')}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border-2 border-brand-200 bg-brand-50/70 py-2.5 px-3 text-xs font-black text-brand-700 shadow-soft transition hover:bg-brand-100 active:scale-95 text-center"
                  >
                    <span>🚀 Chuyển sang con</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setQrModalTarget(k)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-2xl border border-cream-300 bg-white py-2 px-3 text-xs font-black text-muted shadow-soft transition hover:text-text hover:bg-cream-50 active:scale-95"
                >
                  <span>📲 Thẻ QR học sinh</span>
                </button>
              </div>
            </div>
          )
        })}

        {/* Empty Seat Slot Card */}
        {seatsLeft > 0 && (
          <div className="flex flex-col justify-center items-center text-center p-6 rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50/30 transition hover:bg-brand-50/50 shadow-soft min-h-[360px]">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-soft border border-brand-100 mb-4">
              <Plus size={24} className="text-brand-500" />
            </div>
            <h3 className="font-display text-lg font-black text-brand-800 mb-1">
              ➕ Ghế học sinh còn trống ({seatsLeft} ghế)
            </h3>
            <p className="text-xs text-muted mb-5 leading-relaxed px-4 max-w-xs">
              Gói học của gia đình còn {seatsLeft} ghế chưa dùng. Thêm hồ sơ cho bé tiếp theo để học cùng nhau!
            </p>
            <Button
              onClick={() => setEditTarget(null)}
              className="!text-xs font-black shadow-clay"
            >
              + Thêm con ngay
            </Button>
          </div>
        )}
      </div>

      {/* 3 Login Methods Guide */}
      <div className="mt-6 rounded-3xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-sun-50/50 to-orange-50/80 p-5 sm:p-6 shadow-soft text-text">
        <h3 className="font-display text-lg sm:text-xl font-black text-amber-950 mb-3 flex items-center gap-2">
          <Gamepad2 size={22} className="text-amber-600" />
          Hướng dẫn 3 cách cho con vào học
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="bg-white/85 rounded-2xl p-4 border border-amber-100 shadow-soft">
            <div className="text-2xl mb-2">📲</div>
            <p className="font-black text-sm text-amber-950 mb-1">1. Quét mã QR thẻ học sinh</p>
            <p className="text-xs text-muted leading-relaxed font-bold">
              Bấm "Thẻ QR học sinh" ở trên. Con dùng iPad hoặc điện thoại quét để đăng nhập tức thì không cần mật khẩu.
            </p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 border border-amber-100 shadow-soft">
            <div className="text-2xl mb-2">🚀</div>
            <p className="font-black text-sm text-amber-950 mb-1">2. Chuyển chế độ thiết bị chung</p>
            <p className="text-xs text-muted leading-relaxed font-bold">
              Ba / Mẹ bấm "Chuyển sang con" trên máy này. Giao diện quản lý phụ huynh sẽ tự động khóa bằng PIN an toàn.
            </p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 border border-amber-100 shadow-soft">
            <div className="text-2xl mb-2">🔢</div>
            <p className="font-black text-sm text-amber-950 mb-1">3. Chọn tên & nhập mã PIN</p>
            <p className="text-xs text-muted leading-relaxed font-bold">
              Khi mở ứng dụng, con tự chọn tên mình và nhập mã PIN 4-6 số đã cài đặt để vào không gian học tập riêng.
            </p>
          </div>
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
        referenceChildId={kids[0]?.id}
        onClose={() => setEditTarget(undefined)}
        onSuccess={async () => {
          setEditTarget(undefined)
          showToast(editTarget ? 'Đã cập nhật hồ sơ con!' : 'Đã tạo tài khoản con!', 'success')
          await loadKids()
        }}
        onError={(e) => showToast(e, 'error')}
      />

      {/* StudentQrCardModal — hiển thị thẻ học sinh & mã QR đăng nhập nhanh */}
      <StudentQrCardModal
        child={qrModalTarget}
        isOpen={qrModalTarget !== null}
        onClose={() => setQrModalTarget(null)}
      />
    </div>
  )
}

// ── CourseSelectModal ──────────────────────────────────────────
/**
 * Modal để Ba / Mẹ bật/tắt từng khóa học cho con.
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
  const [paymentHint, setPaymentHint] = useState<string | null>(null)
  const [paymentByCourse, setPaymentByCourse] = useState<Record<string, CoursePaymentState>>({})
  const [activeAgeGroup, setActiveAgeGroup] = useState<string | null>(null)

  const loadCourses = useCallback(async (signal?: AbortSignal) => {
    const data = await api<{
      child: { id: string; nickname: string | null; ageBand: string | null }
      courses: CourseItem[]
    }>(`/api/parent/children/${child.id}/courses`, { signal })
    setCourses(data.courses)
  }, [child.id])

  useEffect(() => {
    const controller = new AbortController()
    void (async () => {
      try {
        await loadCourses(controller.signal)
      } catch (e) {
        if (controller.signal.aborted) return
        onError(e instanceof Error ? e.message : 'Không tải được danh sách khóa học')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [loadCourses, onError])

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

  async function purchaseCourse(course: CourseItem) {
    setToggling(course.id)
    setPaymentHint(null)
    try {
      const result = await api<{
        quote: { amountMinor: string; currency: string }
        paymentIntent?: { publicId?: string; status?: string }
        checkout?: {
          transferHint?: string | null
          payUrl?: string | null
          paymentReady?: boolean
        }
      }>('/api/parent/course-checkout', {
        method: 'POST',
        body: JSON.stringify({ courseId: course.id, childProfileId: child.id }),
      })
      const paymentIntentId = result.paymentIntent?.publicId
      if (paymentIntentId) {
        setPaymentByCourse((prev) => ({
          ...prev,
          [course.id]: { publicId: paymentIntentId, status: 'pending' },
        }))
      }
      const checkout = result.checkout
      const hint = checkout?.payUrl
        ? `Đã tạo trang thanh toán: ${checkout.payUrl}`
        : checkout?.transferHint
          ? `Đã tạo mã thanh toán. Nội dung chuyển khoản: ${checkout.transferHint}`
          : 'Đã tạo yêu cầu thanh toán. Hoàn tất thanh toán để mở khóa cho con.'
      setPaymentHint(hint)
      onSuccess(hint)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Không tạo được thanh toán')
    } finally {
      setToggling(null)
    }
  }

  async function refreshPaymentStatus(course: CourseItem, payment: CoursePaymentState) {
    setToggling(course.id)
    try {
      const result = await api<{
        paymentIntent: { status: CoursePaymentState['status'] }
      }>(`/api/parent/course-checkout/${encodeURIComponent(payment.publicId)}`)
      const rawStatus = String(result.paymentIntent.status)
      const status: CoursePaymentState['status'] = ['pending', 'succeeded', 'failed'].includes(rawStatus)
        ? rawStatus as CoursePaymentState['status']
        : 'unknown'
      setPaymentByCourse((prev) => ({
        ...prev,
        [course.id]: { ...payment, status },
      }))

      // WHY: payment success is not the LMS entitlement. Refresh the canonical
      // course list and only show learning access if LMS confirms the grant.
      await loadCourses()
      if (status === 'succeeded') {
        setPaymentHint('Đã nhận thanh toán. Hệ thống đang đồng bộ quyền học cho con; hãy kiểm tra lại sau ít giây.')
      } else if (status === 'failed') {
        setPaymentHint('Thanh toán chưa thành công. Bạn có thể thử lại.')
      } else {
        setPaymentHint('Thanh toán đang chờ xác nhận. Khóa học sẽ tự mở sau khi hệ thống nhận được xác nhận.')
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Không kiểm tra được trạng thái thanh toán')
    } finally {
      setToggling(null)
    }
  }

  const ageGroups = useMemo(() => buildCourseAgeGroups(courses), [courses])
  const selectedAgeGroup =
    ageGroups.some((group) => group.id === activeAgeGroup)
      ? activeAgeGroup
      : ageGroups[0]?.id ?? null
  const visibleCourses = selectedAgeGroup
    ? courses.filter((course) => courseAgeGroupId(course) === selectedAgeGroup)
    : courses
  const activeAgeLabel =
    ageGroups.find((group) => group.id === selectedAgeGroup)?.label ?? ''

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
          {paymentHint && (
            <div className="mb-3 rounded-2xl bg-sun-50 px-4 py-3 text-sm font-bold text-warning" role="status">
              {paymentHint}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
            </div>
          ) : courses.length === 0 ? (
            <p className="py-8 text-center text-muted">Không có khóa học nào đang mở.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div
                className="grid grid-cols-3 gap-2"
                role="group"
                aria-label="Nhóm tuổi khóa học"
              >
                {ageGroups.map((group) => {
                  const count = courses.filter(
                    (course) => courseAgeGroupId(course) === group.id,
                  ).length
                  return (
                    <button
                      key={group.id}
                      type="button"
                      aria-pressed={selectedAgeGroup === group.id}
                      onClick={() => setActiveAgeGroup(group.id)}
                      className={cn(
                        'min-h-11 rounded-xl border px-2 py-2 text-xs font-extrabold transition',
                        selectedAgeGroup === group.id
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-border bg-white text-muted hover:border-brand-300',
                      )}
                    >
                      {group.label}
                      <span className="ml-1 opacity-75">({count})</span>
                    </button>
                  )
                })}
              </div>

              {visibleCourses.length === 0 ? (
                <p className="rounded-2xl bg-page px-4 py-8 text-center text-sm text-muted">
                  Chưa có khóa học {activeAgeLabel} đang mở.
                </p>
              ) : visibleCourses.map((course) => {
                const isToggling = toggling === course.id
                const isPaid = course.accessPolicy === 'paid' && !course.enrolled
                const payment = paymentByCourse[course.id]
                const isPaymentPending = payment?.status === 'pending'
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
                          {course.ageLabel}
                        </span>
                        {course.shortTitle}
                      </p>
                      <p className="mt-1 text-xs font-extrabold text-brand-600">
                        {isPaid
                          ? `${Number(course.priceAmountMinor).toLocaleString('vi-VN')} ${course.priceCurrency.toUpperCase()}`
                          : 'Miễn phí / đã được cấp quyền'}
                      </p>
                      {payment && !course.enrolled && (
                        <p className="text-xs font-semibold text-warning" role="status">
                          {payment.status === 'pending'
                            ? 'Đang chờ xác nhận thanh toán'
                            : payment.status === 'succeeded'
                              ? 'Đã nhận tiền, đang đồng bộ quyền học'
                              : payment.status === 'failed'
                                ? 'Thanh toán chưa thành công'
                                : 'Chưa xác định được trạng thái thanh toán'}
                        </p>
                      )}
                    </div>

                    {/* Toggle button */}
                    <button
                      type="button"
                      id={`course-toggle-${course.id}`}
                      disabled={isToggling}
                      onClick={() => void (isPaid
                        ? payment && payment.status !== 'failed'
                          ? refreshPaymentStatus(course, payment)
                          : purchaseCourse(course)
                        : toggleCourse(course.id, course.enrolled))}
                      className={cn(
                        'flex-shrink-0 rounded-xl px-4 py-2 text-xs font-extrabold transition',
                        course.enrolled
                          ? 'bg-brand-500 text-white hover:bg-brand-600'
                          : isPaid
                            ? 'bg-sun-400 text-white hover:bg-sun-500'
                            : 'bg-page text-muted hover:bg-brand-50 border border-border',
                        isToggling && 'opacity-50 cursor-wait',
                      )}
                      aria-pressed={course.enrolled}
                      aria-label={`${course.enrolled ? 'Bỏ' : isPaid ? isPaymentPending ? 'Kiểm tra thanh toán' : 'Mua và mở khóa' : 'Thêm'} khóa ${course.title}`}
                    >
                      {isToggling ? (
                        '...'
                      ) : course.enrolled ? (
                        <span className="flex items-center gap-1.5">
                          <Check size={15} aria-hidden="true" />
                          Đang học
                        </span>
                      ) : isPaid ? (
                        <span className="flex items-center gap-1.5">
                          {isPaymentPending ? 'Kiểm tra' : payment?.status === 'succeeded' ? 'Làm mới' : 'Mua & mở khóa'}
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
  const [friendInvites, setFriendInvites] = useState<Array<{
    id: string
    sender: { name: string; avatarUrl?: string | null }
    recipient: { name: string; avatarUrl?: string | null }
  }>>([])
  const [loading, setLoading] = useState(true)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    try {
      const [sharing, friends] = await Promise.allSettled([
        api<{ approvals: Approval[] }>('/api/parent/approvals?status=pending'),
        api<{ invites: typeof friendInvites }>('/api/gamification/social/invites/pending-review'),
      ])
      if (sharing.status === 'fulfilled') setApprovals(sharing.value.approvals)
      if (friends.status === 'fulfilled') setFriendInvites(friends.value.invites)
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

  async function decideFriend(id: string, approved: boolean) {
    try {
      await api(`/api/gamification/social/invites/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ approved }),
      })
      showToast(approved ? 'Đã duyệt lời mời kết bạn' : 'Đã từ chối lời mời', approved ? 'success' : 'info')
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi', 'error')
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/60 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-black text-brand-700">
              <Sparkles size={12} /> 👨👩👧 Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              Phê duyệt an toàn
            </span>
          </div>
        </div>
        <h1 className="font-display text-2xl font-black text-slate-900 mt-3 sm:text-3xl">
          Yêu cầu chia sẻ & Kết nối bạn bè
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl leading-relaxed">
          Xem và duyệt các yêu cầu kết bạn, chia sẻ sản phẩm sáng tạo từ các con nhằm bảo đảm môi trường học tập an toàn.
        </p>
      </header>


      <ProfileSharingPanel />

      {approvals.length === 0 && friendInvites.length === 0 && (
        <div className="ui-card p-8 text-center">
          <PartyPopper className="mx-auto text-brand-500" size={40} aria-hidden="true" />
          <p className="mt-2 font-bold">Không có yêu cầu nào</p>
        </div>
      )}

      {friendInvites.map((invite) => (
        <div key={invite.id} className="ui-card flex flex-wrap items-center gap-4 p-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-violet-50 text-3xl">🧑‍🤝‍🧑</span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">Lời mời kết bạn</p>
            <p className="text-sm text-muted">
              <strong>{invite.sender.name}</strong> và <strong>{invite.recipient.name}</strong> muốn vào vòng tròn an toàn của nhau.
            </p>
            <p className="text-xs text-muted">Chỉ kích hoạt sau khi phụ huynh hai bên cùng đồng ý.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void decideFriend(invite.id, true)}><Check size={17} /> Đồng ý</Button>
            <Button variant="secondary" onClick={() => void decideFriend(invite.id, false)}><Lock size={17} /> Từ chối</Button>
          </div>
        </div>
      ))}

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
  const updateAccountPassword = useAuth((s) => s.changePassword)
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
      await updateAccountPassword(currentPw, newPw)
      showToast('Đã đổi mật khẩu!', 'success')
      setCurrentPw('')
      setNewPw('')
      setChangingPw(false)
    } catch {
      showToast('Không thể đổi mật khẩu. Hãy kiểm tra mật khẩu hiện tại và thử lại.', 'error')
    }
  }

  if (!profile) return <LoadingSkeleton count={2} />

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/60 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-black text-brand-700">
              <Sparkles size={12} /> 👨👩👧 Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              Cài đặt tài khoản
            </span>
          </div>
        </div>
        <h1 className="font-display text-2xl font-black text-slate-900 mt-3 sm:text-3xl">
          Hồ sơ & Bảo mật tài khoản
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl leading-relaxed">
          Cập nhật thông tin liên hệ, ngôn ngữ hiển thị và quản lý mật khẩu tài khoản phụ huynh.
        </p>
      </header>

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

function StudentQrCardModal({
  child,
  isOpen,
  onClose,
}: {
  child: Child | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !child) return null

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    JSON.stringify({ type: 'aikids_student_login', studentId: child.id, nickname: child.nickname }),
  )}`

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(20, 26, 48, 0.65)' }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-clay border-2 border-cream-300 overflow-hidden animate-in zoom-in-95 duration-200 text-text">
        <div className="bg-gradient-to-b from-brand-100/70 via-brand-50/40 to-white p-6 pb-4 text-center relative border-b border-cream-200">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-muted hover:bg-white hover:text-text transition shadow-xs"
          >
            <X size={16} />
          </button>
          <div className="mx-auto w-20 h-20 bg-white rounded-2xl shadow-soft border-2 border-brand-200 flex items-center justify-center text-5xl mb-3 relative">
            {avatarEmoji(child.avatarId)}
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
              Lv.{child.level || 1}
            </div>
          </div>
          <h2 className="font-display text-2xl font-black text-text">{child.nickname}</h2>
          <p className="text-xs font-bold text-brand-600 mt-1 uppercase tracking-wider">Thẻ Học Sinh Thông Minh</p>
        </div>

        <div className="p-6 text-center bg-cream-50/50">
          <p className="text-sm font-black text-text mb-3">Quét mã QR để vào học ngay</p>
          <div className="mx-auto w-48 h-48 bg-white rounded-2xl shadow-clay border-2 border-brand-100 flex items-center justify-center mb-4 p-2 relative overflow-hidden">
            <img
              src={qrCodeUrl}
              alt={`QR Đăng nhập cho bé ${child.nickname}`}
              className="w-full h-full object-contain rounded-xl"
              loading="eager"
            />
          </div>
          <p className="text-xs text-muted mb-4 px-2 leading-relaxed font-bold">
            Mở camera trên máy tính bảng hoặc điện thoại của con và quét mã này để đăng nhập nhanh không cần mật khẩu.
          </p>
          <Button variant="secondary" className="w-full font-black text-sm shadow-soft" onClick={onClose}>
            Đóng lại
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
