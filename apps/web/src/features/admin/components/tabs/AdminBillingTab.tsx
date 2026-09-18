import React, { lazy, Suspense, useEffect, useState, useCallback, useMemo } from 'react'
import { Search, RotateCcw, History, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { AdminBillingPos } from '../AdminBillingPos'
import { PendingIntentDetailModal } from '../PendingIntentDetailModal'
import type { VietQrModalData } from '../VietQrModal'
import {
  ROLE_LABELS,
  DEFAULT_CATALOG_PLANS,
  getCachedBillingPlans,
  normalizePlanDef,
  type AdminUser,
  type BillingStats,
  type PendingIntent,
  type PlanDef,
  type SubscriptionRow,
} from '../../types'

const VietQrModal = lazy(() =>
  import('../VietQrModal').then((m) => ({ default: m.VietQrModal })),
)
const PlanEditorModal = lazy(() =>
  import('../PlanEditorModal').then((m) => ({ default: m.PlanEditorModal })),
)

const PLAN_BADGE_COLORS: Record<string, string> = {
  free: 'bg-slate-100 text-slate-600',
  starter: 'bg-sky-100 text-sky-700',
  premium_family: 'bg-violet-100 text-violet-700',
  pro: 'bg-amber-100 text-amber-700',
}

const PURPOSE_LABELS: Record<string, string> = {
  user_sub: 'Gói cá nhân',
  credit_pack: 'Gói lượt AI',
  course_purchase: 'Mua khóa học',
}

export type BillingTransactionLog = {
  id: string
  timestamp: string
  userEmail: string
  userName?: string
  type: 'checkout_paid' | 'vietqr_intent' | 'grant_scholarship' | 'intent_confirmed'
  typeLabel: string
  planId: string
  planName: string
  amount: number
  paymentMethod: string
  note?: string
}

const BILLING_TX_LOGS_KEY = 'aikids_billing_tx_logs'

function getStoredBillingLogs(): BillingTransactionLog[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return []
    const raw = localStorage.getItem(BILLING_TX_LOGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveBillingLogs(logs: BillingTransactionLog[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    localStorage.setItem(BILLING_TX_LOGS_KEY, JSON.stringify(logs.slice(0, 100)))
  } catch {
    /* ignore */
  }
}

function formatVnd(minor: number) {
  return minor === 0 ? 'Miễn phí' : `${minor.toLocaleString('vi-VN')}₫/tháng`
}

export function AdminBillingTab() {
  const { toasts, showToast, dismissToast } = useToast()

  const [billingStats, setBillingStats] = useState<BillingStats>({
    totalPaid: 0,
    totalFree: 0,
    totalPending: 0,
    totalExpired: 0,
  })
  const [billingPlans, setBillingPlans] = useState<PlanDef[]>(getCachedBillingPlans)
  const [billingSubs, setBillingSubs] = useState<SubscriptionRow[]>([])
  const [pendingIntents, setPendingIntents] = useState<PendingIntent[]>([])
  const [loading, setLoading] = useState(true)

  // Sub-nav view: subscribers, plans, or logs
  const [billingPlanView, setBillingPlanView] = useState<'subscribers' | 'plans' | 'logs'>('subscribers')
  const [billingSubSearch, setBillingSubSearch] = useState('')
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'paid' | 'free' | 'expired'>('all')
  const [isPosCollapsed, setIsPosCollapsed] = useState(false)

  // Transaction logs state
  const [txLogs, setTxLogs] = useState<BillingTransactionLog[]>(getStoredBillingLogs)

  // Plan editor modal state
  const [editingPlan, setEditingPlan] = useState<PlanDef | null>(null)
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false)

  // POS & Grant state
  const [billingAdminMode, setBillingAdminMode] = useState<'checkout' | 'vietqr' | 'grant'>('checkout')
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer')
  const [grantForm, setGrantForm] = useState({
    userEmail: '',
    planId: 'starter',
    durationMonths: 1,
    reason: '',
  })
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantSelectedUser, setGrantSelectedUser] = useState<AdminUser | null>(null)
  const [grantUserResults, setGrantUserResults] = useState<AdminUser[]>([])
  const [grantUserSearching, setGrantUserSearching] = useState(false)

  // Modals & Confirmation
  const [vietQrModalIntent, setVietQrModalIntent] = useState<VietQrModalData | null>(null)
  const [billingConfirmIntent, setBillingConfirmIntent] = useState<PendingIntent | null>(null)
  const [selectedDetailIntent, setSelectedDetailIntent] = useState<PendingIntent | null>(null)
  const [detailConfirming, setDetailConfirming] = useState(false)

  const recordBillingLog = useCallback(
    (log: Omit<BillingTransactionLog, 'id' | 'timestamp'>) => {
      const newEntry: BillingTransactionLog = {
        ...log,
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
      }
      setTxLogs((prev) => {
        const next = [newEntry, ...prev].slice(0, 100)
        saveBillingLogs(next)
        return next
      })
    },
    [],
  )

  const planLabels = useMemo(() => {
    const base: Record<string, string> = {
      free: 'Miễn phí',
      starter: 'Gói Tiêu Chuẩn 129K',
      premium_family: 'Premium Gia Đình',
      pro: 'Pro',
      credits_10: '10 lượt AI',
      credits_25: '25 lượt AI',
      credits_50: '50 lượt AI',
      credits_100: '100 lượt AI',
      credits_200: '200 lượt AI',
    }
    billingPlans.forEach((p) => {
      base[p.id] = p.name
    })
    return base
  }, [billingPlans])

  const fetchBillingData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, subsRes, intentsRes, dbPlansRes, publicPlansRes] = await Promise.allSettled([
        api<{ stats: BillingStats; plans: PlanDef[] }>('/api/admin/billing/subscriptions/stats'),
        api<SubscriptionRow[]>('/api/admin/billing/subscriptions'),
        api<PendingIntent[]>('/api/admin/billing/subscriptions/pending-intents'),
        api<PlanDef[]>('/api/admin/billing/plans'),
        api<{ plans: PlanDef[] }>('/api/parent/plans'),
      ])

      // 1. Process plans
      let resolvedPlans: PlanDef[] | null = null
      if (dbPlansRes.status === 'fulfilled' && Array.isArray(dbPlansRes.value) && dbPlansRes.value.length > 0) {
        resolvedPlans = dbPlansRes.value
      } else if (
        publicPlansRes.status === 'fulfilled' &&
        Array.isArray(publicPlansRes.value?.plans) &&
        publicPlansRes.value.plans.length > 0
      ) {
        resolvedPlans = publicPlansRes.value.plans
      } else if (statsRes.status === 'fulfilled' && Array.isArray(statsRes.value?.plans) && statsRes.value.plans.length > 0) {
        resolvedPlans = statsRes.value.plans
      }

      if (resolvedPlans && resolvedPlans.length > 0) {
        const normalized = resolvedPlans.map(normalizePlanDef)
        setBillingPlans(normalized)
        try {
          localStorage.setItem('aikids_admin_billing_plans', JSON.stringify(normalized))
        } catch {
          /* ignore */
        }
      } else {
        setBillingPlans(getCachedBillingPlans())
      }

      // 2. Process subs & pending intents
      const subsData = subsRes.status === 'fulfilled' && Array.isArray(subsRes.value) ? subsRes.value : []
      const intentsData = intentsRes.status === 'fulfilled' && Array.isArray(intentsRes.value) ? intentsRes.value : []
      setBillingSubs(subsData)
      setPendingIntents(intentsData)

      // 3. Process stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
        setBillingStats(statsRes.value.stats)
      } else {
        const now = new Date()
        setBillingStats({
          totalPaid: subsData.filter((s) => s.plan !== 'free' && (!s.expiresAt || new Date(s.expiresAt) > now)).length,
          totalFree: subsData.filter((s) => s.plan === 'free').length,
          totalPending: intentsData.length,
          totalExpired: subsData.filter((s) => s.expiresAt && new Date(s.expiresAt) <= now).length,
        })
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tải dữ liệu gói & thanh toán', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void fetchBillingData()
  }, [fetchBillingData])

  const filteredBillingSubs = useMemo(() => {
    return billingSubs.filter((s) => {
      // 1. Text search
      if (billingSubSearch.trim()) {
        const q = billingSubSearch.toLowerCase()
        const matchesEmail = (s.email ?? '').toLowerCase().includes(q)
        const matchesName = (s.name ?? '').toLowerCase().includes(q)
        if (!matchesEmail && !matchesName) return false
      }
      // 2. Plan filter
      if (selectedPlanFilter !== 'all') {
        if (s.plan !== selectedPlanFilter) return false
      }
      // 3. Status filter
      if (selectedStatusFilter !== 'all') {
        const now = new Date()
        const isExpired = s.expiresAt ? new Date(s.expiresAt) <= now : false
        if (selectedStatusFilter === 'free' && s.plan !== 'free') return false
        if (selectedStatusFilter === 'expired' && !isExpired) return false
        if (selectedStatusFilter === 'paid') {
          if (s.plan === 'free' || isExpired) return false
        }
      }
      return true
    })
  }, [billingSubs, billingSubSearch, selectedPlanFilter, selectedStatusFilter])

  function generateSuggestedReason(
    mode: 'checkout' | 'vietqr' | 'grant',
    method: 'transfer' | 'cash',
    planName: string,
    durationMonths: number,
  ): string {
    const today = new Date().toLocaleDateString('vi-VN')
    if (mode === 'grant') {
      return `Học bổng ${planName} ${durationMonths} tháng - Admin cấp ngày ${today}`
    }
    const methodText = method === 'transfer' ? 'Chuyển khoản MBBank' : 'Tiền mặt tại quầy'
    if (mode === 'vietqr') {
      return `Thu tiền qua VietQR (${planName} ${durationMonths}T) - ${today}`
    }
    return `Đã thu tiền qua ${methodText} (${planName} ${durationMonths}T) - ${today}`
  }

  async function searchGrantUser(query: string) {
    const q = query.trim()
    if (q.length < 2) {
      setGrantUserResults([])
      return
    }
    setGrantUserSearching(true)
    try {
      const data = await api<{ users: AdminUser[] }>(`/api/admin/users?search=${encodeURIComponent(q)}`)
      if (Array.isArray(data.users) && data.users.length > 0) {
        setGrantUserResults(data.users.slice(0, 8))
      }
    } catch {
      /* ignore */
    } finally {
      setGrantUserSearching(false)
    }
  }

  function resetGrantForm() {
    setGrantForm({ userEmail: '', planId: 'starter', durationMonths: 1, reason: '' })
    setGrantSelectedUser(null)
    setGrantUserResults([])
  }

  async function handlePosSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!grantSelectedUser || !grantForm.planId) {
      showToast('Vui lòng chọn phụ huynh hoặc người học', 'error')
      return
    }

    const pName = planLabels[grantForm.planId] ?? grantForm.planId
    const autoReason =
      grantForm.reason.trim() ||
      generateSuggestedReason(billingAdminMode, paymentMethod, pName, grantForm.durationMonths)

    setGrantLoading(true)
    try {
      if (billingAdminMode === 'checkout') {
        const payload = {
          targetUserId: grantSelectedUser.id,
          planId: grantForm.planId,
          durationMonths: Number(grantForm.durationMonths) || 1,
          immediatePaid: true,
          paymentMethod,
          note: autoReason,
        }
        const res = await api<{ message?: string }>(
          '/api/admin/billing/subscriptions/checkout',
          { method: 'POST', body: JSON.stringify(payload) },
        )
        showToast(
          res.message || `Đã thu tiền và kích hoạt gói ${pName} thành công cho ${grantSelectedUser.email}!`,
          'success',
        )
        const curPlan = billingPlans.find((p) => p.id === grantForm.planId)
        const unitPrice =
          curPlan?.amountMinor ??
          (grantForm.planId === 'starter'
            ? 129000
            : grantForm.planId === 'premium_family'
              ? 149000
              : 349000)
        const totalAmount = unitPrice * grantForm.durationMonths
        recordBillingLog({
          userEmail: grantSelectedUser.email ?? '',
          userName: grantSelectedUser.nickname ?? grantSelectedUser.email ?? 'Khách hàng',
          type: 'checkout_paid',
          typeLabel: 'Thu tiền trực tiếp',
          planId: grantForm.planId,
          planName: pName,
          amount: totalAmount,
          paymentMethod: paymentMethod === 'transfer' ? 'Chuyển khoản MBBank' : 'Tiền mặt tại quầy',
          note: autoReason,
        })
        resetGrantForm()
        await fetchBillingData()
      } else if (billingAdminMode === 'vietqr') {
        const payload = {
          targetUserId: grantSelectedUser.id,
          planId: grantForm.planId,
          durationMonths: Number(grantForm.durationMonths) || 1,
          immediatePaid: false,
          paymentMethod: 'vietqr',
          note: autoReason,
        }
        const res = await api<{
          message?: string
          data?: {
            paymentIntent?: { id: string; publicId: string; amountMinor: string | number }
            vietqr?: { paymentCode: string; amount: number }
          }
        }>('/api/admin/billing/subscriptions/checkout', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        const data = res.data
        const curPlan = billingPlans.find((p) => p.id === grantForm.planId)
        const unitPrice =
          curPlan?.amountMinor ??
          (grantForm.planId === 'starter'
            ? 129000
            : grantForm.planId === 'premium_family'
              ? 149000
              : 349000)
        const totalAmount = unitPrice * grantForm.durationMonths
        const paymentCode =
          data?.vietqr?.paymentCode ||
          data?.paymentIntent?.publicId?.replace(/^pi_/, '').slice(0, 16).toUpperCase() ||
          'AIKIDS'
        const publicId = data?.paymentIntent?.publicId || ''

        recordBillingLog({
          userEmail: grantSelectedUser.email ?? '',
          userName: grantSelectedUser.nickname ?? grantSelectedUser.email ?? 'Khách hàng',
          type: 'vietqr_intent',
          typeLabel: 'Tạo mã VietQR',
          planId: grantForm.planId,
          planName: pName,
          amount: data?.vietqr?.amount || Number(data?.paymentIntent?.amountMinor || totalAmount),
          paymentMethod: 'VietQR MBBank',
          note: autoReason,
        })

        setVietQrModalIntent({
          publicId,
          paymentCode,
          amount: data?.vietqr?.amount || Number(data?.paymentIntent?.amountMinor || totalAmount),
          planId: grantForm.planId,
          planName: pName,
          userName: grantSelectedUser.nickname ?? grantSelectedUser.email ?? 'Phụ huynh',
          userEmail: grantSelectedUser.email ?? '',
          durationMonths: grantForm.durationMonths,
        })
        showToast(res.message || 'Đã tạo đơn chờ thanh toán VietQR!', 'success')
        await fetchBillingData()
      } else {
        // Mode grant (Học bổng 0đ)
        const payload = {
          targetUserId: grantSelectedUser.id,
          planId: grantForm.planId,
          durationMonths: Number(grantForm.durationMonths) || 1,
          reason: autoReason,
        }
        const res = await api<{ message?: string }>(
          '/api/admin/billing/subscriptions/grant',
          { method: 'POST', body: JSON.stringify(payload) },
        )
        showToast(
          res.message || `Đã cấp gói học bổng ${pName} thành công cho ${grantSelectedUser.email}!`,
          'success',
        )
        recordBillingLog({
          userEmail: grantSelectedUser.email ?? '',
          userName: grantSelectedUser.nickname ?? grantSelectedUser.email ?? 'Khách hàng',
          type: 'grant_scholarship',
          typeLabel: 'Cấp học bổng 0đ',
          planId: grantForm.planId,
          planName: pName,
          amount: 0,
          paymentMethod: 'Học bổng AI Kids',
          note: autoReason,
        })
        resetGrantForm()
        await fetchBillingData()
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi xử lý lên gói', 'error')
    } finally {
      setGrantLoading(false)
    }
  }

  async function handleConfirmVietQrPaid(publicId: string) {
    try {
      const res = await api<{ message?: string }>(
        `/api/admin/billing/subscriptions/intents/${encodeURIComponent(publicId)}/complete`,
        { method: 'POST' },
      )
      showToast(res.message || 'Xác nhận thanh toán VietQR thành công!', 'success')
      if (vietQrModalIntent) {
        recordBillingLog({
          userEmail: vietQrModalIntent.userEmail,
          userName: vietQrModalIntent.userName,
          type: 'intent_confirmed',
          typeLabel: 'Duyệt VietQR',
          planId: vietQrModalIntent.planId,
          planName: vietQrModalIntent.planName,
          amount: vietQrModalIntent.amount,
          paymentMethod: 'VietQR đã khớp',
          note: `Mã TT: ${vietQrModalIntent.paymentCode}`,
        })
      }
      setVietQrModalIntent(null)
      await fetchBillingData()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi xác nhận nhận tiền', 'error')
    }
  }

  function quickGrant(sub: SubscriptionRow) {
    setIsPosCollapsed(false)
    setGrantSelectedUser({
      id: sub.userId,
      email: sub.email,
      nickname: sub.name,
      role: sub.role,
      active: sub.active,
      level: 1,
      xp: 0,
      createdAt: sub.createdAt,
    })
    const targetPlan = sub.plan && sub.plan !== 'free' ? sub.plan : 'starter'
    const planName = planLabels[targetPlan] ?? targetPlan
    const suggested = generateSuggestedReason(
      billingAdminMode,
      paymentMethod,
      planName,
      grantForm.durationMonths,
    )
    setGrantForm((f) => ({
      ...f,
      userEmail: sub.email ?? '',
      planId: targetPlan,
      reason: suggested,
    }))
    document.getElementById('billing-grant-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function confirmIntent(intent: PendingIntent) {
    setBillingConfirmIntent(null)
    try {
      const res = await api<{ message: string }>(
        `/api/admin/billing/subscriptions/intents/${encodeURIComponent(intent.publicId)}/complete`,
        { method: 'POST' },
      )
      showToast(res.message ?? 'Thanh toán đã được xác nhận', 'success')
      recordBillingLog({
        userEmail: intent.userEmail ?? '',
        userName: intent.userName ?? 'Khách hàng',
        type: 'intent_confirmed',
        typeLabel: 'Duyệt đơn chờ',
        planId: intent.purpose,
        planName: PURPOSE_LABELS[intent.purpose] ?? intent.courseTitle ?? intent.purpose,
        amount: Number(intent.amountMinor) || 0,
        paymentMethod: (intent.provider || 'VIETQR').toUpperCase(),
        note: `Mã ĐH: ${intent.paymentCode ?? intent.id.slice(0, 8)}`,
      })
      await fetchBillingData()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi xác nhận đơn', 'error')
    }
  }

  async function handleTogglePlan(plan: PlanDef) {
    if (plan.id === 'free') {
      showToast('Không được phép ẩn gói miễn phí (free)', 'error')
      return
    }
    const nextActive = plan.isActive === false
    try {
      const res = await api<{ message?: string }>(
        `/api/admin/billing/plans/${encodeURIComponent(plan.id)}/toggle`,
        { method: 'PATCH' },
      )
      showToast(res?.message || `Đã thay đổi trạng thái gói ${plan.name}`, 'success')
      await fetchBillingData()
    } catch {
      setBillingPlans((prev) => {
        const updated = prev.map((p) => (p.id === plan.id ? { ...p, isActive: nextActive } : p))
        try {
          localStorage.setItem('aikids_admin_billing_plans', JSON.stringify(updated))
        } catch {
          /* ignore */
        }
        return updated
      })
      showToast(
        `Đã thay đổi trạng thái gói ${plan.name} (${nextActive ? 'Đang mở bán' : 'Tạm ẩn'})`,
        'success',
      )
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header: Thống kê tổng quan ────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Đang trả phí',
            value: billingStats.totalPaid,
            color: 'text-success',
            bg: 'bg-mint-50',
            icon: '✓',
          },
          {
            label: 'Gói miễn phí',
            value: billingStats.totalFree,
            color: 'text-brand-600',
            bg: 'bg-brand-50',
            icon: '○',
          },
          {
            label: 'Chờ xác nhận',
            value: billingStats.totalPending,
            color: 'text-warning',
            bg: 'bg-sun-50',
            icon: '⏳',
          },
          {
            label: 'Hết hạn',
            value: billingStats.totalExpired,
            color: 'text-danger',
            bg: 'bg-coral-50',
            icon: '✕',
          },
        ].map((s) => (
          <div key={s.label} className={cn('ui-card flex items-center gap-4 p-4 shadow-sm', s.bg)}>
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black',
                s.color,
              )}
              style={{ background: 'rgba(255,255,255,0.85)' }}
            >
              {s.icon}
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted">{s.label}</p>
              <p className={cn('font-display text-3xl font-black', s.color)}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sub-nav: Thuê bao | Catalog gói cước | Lịch sử Logs ─────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-2xl bg-brand-50 p-1 w-fit border border-brand-100">
          {[
            { id: 'subscribers', label: 'Danh sách thuê bao' },
            { id: 'plans', label: 'Catalog gói cước & Package Builder' },
            { id: 'logs', label: 'Lịch sử cấp & bán gói (Logs)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBillingPlanView(tab.id as 'subscribers' | 'plans' | 'logs')}
              className={cn(
                'rounded-xl px-4 sm:px-5 py-2 text-sm font-bold transition cursor-pointer',
                billingPlanView === tab.id
                  ? 'bg-white text-brand-700 shadow-sm font-black'
                  : 'text-muted hover:text-text',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsPosCollapsed((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm transition hover:bg-brand-50 active:scale-95 cursor-pointer ml-auto"
        >
          <span>{isPosCollapsed ? '📦 Mở POS Thu Ngân' : '📐 Thu gọn POS'}</span>
        </button>
      </div>

      {/* ── Layout chính: Trái (Data/Catalog/Logs) | Phải (Admin POS) ── */}
      <div className={cn('grid gap-5', isPosCollapsed ? 'grid-cols-1' : 'xl:grid-cols-[1fr_410px]')}>
        {/* ─── CỘT TRÁI ─── */}
        <div className="flex flex-col gap-5">
          {/* Danh sách thuê bao */}
          {billingPlanView === 'subscribers' && (
            <div className="ui-card overflow-hidden shadow-sm">
              <div className="flex flex-wrap items-center gap-2.5 border-b border-border/60 px-4 py-3 bg-brand-50/20">
                <div className="relative flex-1 min-w-[200px]">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                    <Search size={16} aria-hidden="true" />
                  </span>
                  <input
                    type="search"
                    aria-label="Tìm tài khoản trong danh sách thuê bao"
                    placeholder="Tìm tên hoặc email..."
                    value={billingSubSearch}
                    onChange={(e) => setBillingSubSearch(e.target.value)}
                    className="w-full min-h-10 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
                  />
                </div>

                {/* Bộ lọc gói cước */}
                <div className="flex items-center gap-1">
                  <select
                    value={selectedPlanFilter}
                    onChange={(e) => setSelectedPlanFilter(e.target.value)}
                    aria-label="Lọc theo gói cước"
                    className="min-h-10 rounded-xl border-2 border-border bg-white px-3 py-1.5 text-xs font-bold text-text outline-none transition focus:border-brand-400 cursor-pointer shadow-sm"
                  >
                    <option value="all">Tất cả gói cước</option>
                    <option value="free">Gói Miễn phí</option>
                    <option value="starter">Gói Tiêu Chuẩn 129K</option>
                    <option value="premium_family">Premium Gia Đình</option>
                    <option value="pro">Pro</option>
                    {billingPlans
                      .filter((p) => !['free', 'starter', 'premium_family', 'pro'].includes(p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Bộ lọc trạng thái */}
                <div className="flex items-center gap-1">
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value as 'all' | 'paid' | 'free' | 'expired')}
                    aria-label="Lọc theo trạng thái"
                    className="min-h-10 rounded-xl border-2 border-border bg-white px-3 py-1.5 text-xs font-bold text-text outline-none transition focus:border-brand-400 cursor-pointer shadow-sm"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="paid">Đang trả phí</option>
                    <option value="free">Miễn phí</option>
                    <option value="expired">Đã hết hạn</option>
                  </select>
                </div>

                {(billingSubSearch || selectedPlanFilter !== 'all' || selectedStatusFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setBillingSubSearch('')
                      setSelectedPlanFilter('all')
                      setSelectedStatusFilter('all')
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-2.5 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
                    title="Xóa bộ lọc"
                  >
                    <RotateCcw size={13} />
                    <span>Đặt lại</span>
                  </button>
                )}

                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 border border-brand-200">
                  {filteredBillingSubs.length}/{billingSubs.length} thuê bao
                </span>

                <Button variant="secondary" onClick={() => void fetchBillingData()} className="rounded-xl">
                  Làm mới
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-brand-50/60 text-xs">
                      <th className="px-4 py-2.5 font-extrabold">Tài khoản</th>
                      <th className="px-4 py-2.5 font-extrabold">Vai trò</th>
                      <th className="px-4 py-2.5 font-extrabold">Gói hiện tại</th>
                      <th className="px-4 py-2.5 font-extrabold">Lượt AI còn</th>
                      <th className="px-4 py-2.5 font-extrabold">Hết hạn</th>
                      <th className="px-4 py-2.5 font-extrabold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && billingSubs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted">
                          Đang tải dữ liệu thuê bao...
                        </td>
                      </tr>
                    ) : filteredBillingSubs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted">
                          Chưa có dữ liệu thuê bao
                        </td>
                      </tr>
                    ) : (
                      filteredBillingSubs.map((s) => (
                        <tr
                          key={s.userId}
                          className="group border-b border-border/30 hover:bg-brand-50/30 transition"
                        >
                          <td className="px-4 py-3">
                            <p className="font-bold">{s.name ?? '—'}</p>
                            <p className="text-xs text-muted font-mono">{s.email ?? s.userId.slice(0, 14)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                              {ROLE_LABELS[s.role] ?? s.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs font-extrabold',
                                PLAN_BADGE_COLORS[s.plan] ?? 'bg-brand-50 text-brand-600',
                              )}
                            >
                              {planLabels[s.plan] ?? s.plan}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'font-mono text-sm font-bold',
                                s.remainingCreateCredits === 0 ? 'text-danger' : 'text-text',
                              )}
                            >
                              {s.remainingCreateCredits}
                            </span>
                            <span className="text-xs text-muted">/{s.monthlyCreateCredits}</span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {s.expiresAt ? (
                              <span
                                className={cn(
                                  new Date(s.expiresAt) < new Date() ? 'text-danger font-bold' : 'text-muted',
                                )}
                              >
                                {new Date(s.expiresAt).toLocaleDateString('vi-VN')}
                              </span>
                            ) : (
                              <span className="text-success font-bold">Không hết hạn</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="secondary"
                              className="text-xs py-1 px-3 shadow-sm"
                              onClick={() => quickGrant(s)}
                            >
                              Cấp gói mới
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Catalog Gói Bán & Tùy biến (Package Builder) */}
          {billingPlanView === 'plans' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📦</span>
                    <h3 className="font-display text-lg font-black text-text">
                      Quản trị danh mục gói bán & Tùy biến (Package Builder)
                    </h3>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Tùy chỉnh định mức lượt tạo AI, giới hạn tài khoản con, chính sách bảo toàn quyền lợi và
                    trạng thái mở bán.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null)
                    setIsPlanEditorOpen(true)
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-95 px-4 py-2.5 text-sm font-black text-white shadow-clay transition shrink-0 cursor-pointer"
                >
                  <span className="text-lg leading-none">+</span>
                  <span>Tạo gói bán mới</span>
                </button>
              </div>

              {/* Grid cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {(billingPlans.length > 0 ? billingPlans : DEFAULT_CATALOG_PLANS).map((plan) => {
                  const userCount =
                    plan.activeSubscribers ?? billingSubs.filter((s) => s.plan === plan.id).length
                  const isPlanActive = plan.isActive !== false
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        'ui-card flex flex-col gap-3 p-5 transition hover:shadow-md',
                        plan.id !== 'free' ? 'border-2' : 'border border-dashed border-border',
                        !isPlanActive && 'opacity-75 bg-page/50',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <span
                              className={cn(
                                'inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold',
                                PLAN_BADGE_COLORS[plan.id] ?? 'bg-brand-50 text-brand-600',
                              )}
                            >
                              {plan.id.toUpperCase()}
                            </span>
                            {plan.badge && (
                              <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800 border border-amber-300">
                                {plan.badge}
                              </span>
                            )}
                            <span className="inline-block rounded-full bg-border/60 px-2 py-0.5 text-[10px] font-bold text-muted">
                              v{plan.version ?? 1}
                            </span>
                          </div>
                          <h4 className="font-display text-lg text-text font-bold">{plan.name}</h4>
                          {plan.tagline && (
                            <p className="text-xs text-muted line-clamp-1">{plan.tagline}</p>
                          )}
                          <p className="text-2xl font-black text-brand-600 mt-1">
                            {formatVnd(plan.amountMinor)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display text-2xl text-text font-black">{userCount}</p>
                          <p className="text-xs text-muted">phụ huynh</p>
                          <div className="mt-1">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                                isPlanActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-stone-100 text-stone-600 border border-stone-200',
                              )}
                            >
                              <span>{isPlanActive ? '🟢' : '⚪'}</span>
                              <span>{isPlanActive ? 'Đang mở bán' : 'Tạm ẩn'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-brand-50/70 border border-brand-100/80 p-3 text-center">
                        <div className="rounded-xl bg-white/80 p-2 shadow-sm">
                          <p className="font-display text-xl font-black text-brand-700">{plan.monthlyCreateCredits}</p>
                          <p className="text-xs font-bold text-slate-600 mt-0.5">lượt AI/tháng</p>
                        </div>
                        <div className="rounded-xl bg-white/80 p-2 shadow-sm">
                          <p className="font-display text-xl font-black text-brand-700">{plan.maxChildren}</p>
                          <p className="text-xs font-bold text-slate-600 mt-0.5">hồ sơ trẻ</p>
                        </div>
                        <div className="rounded-xl bg-white/80 p-2 shadow-sm">
                          <p className="font-display text-xl font-black text-brand-700">
                            {plan.maxOpenCoursesPerChild === 999
                              ? '∞'
                              : (plan.maxOpenCoursesPerChild ?? '?')}
                          </p>
                          <p className="text-xs font-bold text-slate-600 mt-0.5">khóa/trẻ</p>
                        </div>
                      </div>

                      <ul className="flex flex-col gap-2">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-700">
                            <span className="text-emerald-600 font-black text-sm shrink-0">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-3 border-t border-border/60 flex flex-col gap-2.5">
                        <p className="text-xs text-muted">
                          {plan.requiresPayment ? '💳 Yêu cầu thanh toán' : '🎁 Miễn phí, tự động kích hoạt'}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlan(plan)
                              setIsPlanEditorOpen(true)
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-border/80 bg-surface px-3 py-1.5 text-xs font-black text-text shadow-sm transition hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 active:scale-95 cursor-pointer"
                          >
                            <span>✏️</span>
                            <span>Chỉnh sửa gói</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleTogglePlan(plan)}
                            disabled={plan.id === 'free'}
                            title={
                              plan.id === 'free'
                                ? 'Không được phép ẩn gói miễn phí (free)'
                                : isPlanActive
                                  ? 'Ẩn gói khỏi danh mục'
                                  : 'Mở bán lại gói này'
                            }
                            className={cn(
                              'inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-border/80 bg-surface px-3 py-1.5 text-xs font-black shadow-sm transition active:scale-95 cursor-pointer',
                              plan.id === 'free'
                                ? 'opacity-40 cursor-not-allowed text-muted'
                                : isPlanActive
                                  ? 'text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                                  : 'text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300',
                            )}
                          >
                            <span>👁️</span>
                            <span>{isPlanActive ? 'Ẩn gói' : 'Hiện gói'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Plan Editor Modal */}
              {isPlanEditorOpen && (
                <Suspense fallback={null}>
                  <PlanEditorModal
                    isOpen={isPlanEditorOpen}
                    onClose={() => setIsPlanEditorOpen(false)}
                    onSaved={(savedPlan?: PlanDef) => {
                      setIsPlanEditorOpen(false)
                      if (savedPlan) {
                        setBillingPlans((prev) => {
                          const idx = prev.findIndex((p) => p.id === savedPlan.id)
                          const updated =
                            idx >= 0
                              ? prev.map((p, i) => (i === idx ? savedPlan : p))
                              : [...prev, savedPlan]
                          try {
                            localStorage.setItem('aikids_admin_billing_plans', JSON.stringify(updated))
                          } catch {
                            /* ignore */
                          }
                          return updated
                        })
                      }
                      void fetchBillingData()
                    }}
                    plan={editingPlan}
                    subscriberCount={
                      editingPlan
                        ? (editingPlan.activeSubscribers ??
                            billingSubs.filter((s) => s.plan === editingPlan.id).length)
                        : 0
                    }
                  />
                </Suspense>
              )}
            </div>
          )}

          {/* Lịch sử cấp & bán gói (Logs) */}
          {billingPlanView === 'logs' && (
            <div className="ui-card overflow-hidden shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 bg-brand-50/30">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold">
                    <History size={18} />
                  </span>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-black text-text">
                      Lịch sử Cấp & Bán Gói (Transaction Logs)
                    </h3>
                    <p className="text-xs text-muted">
                      Lưu trữ nhật ký giao dịch thu tiền trực tiếp, tạo VietQR, duyệt đơn đối soát và cấp học bổng.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-700">
                    {txLogs.length} giao dịch
                  </span>
                  {txLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nhật ký giao dịch hiển thị?')) {
                          setTxLogs([])
                          saveBillingLogs([])
                          showToast('Đã xóa nhật ký giao dịch', 'success')
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-danger hover:bg-rose-50 transition cursor-pointer shadow-sm"
                    >
                      <Trash2 size={13} />
                      <span>Xóa lịch sử</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-brand-50/60 text-xs">
                      <th className="px-4 py-3 font-extrabold">Thời gian</th>
                      <th className="px-4 py-3 font-extrabold">Khách hàng</th>
                      <th className="px-4 py-3 font-extrabold">Loại giao dịch</th>
                      <th className="px-4 py-3 font-extrabold">Gói cước</th>
                      <th className="px-4 py-3 font-extrabold">Số tiền</th>
                      <th className="px-4 py-3 font-extrabold">Hình thức</th>
                      <th className="px-4 py-3 font-extrabold">Ghi chú / Đối soát</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center text-muted">
                          <p className="font-bold text-sm text-text">Chưa có nhật ký giao dịch nào</p>
                          <p className="text-xs text-muted mt-1">
                            Các giao dịch lên gói tại POS hoặc duyệt đơn VietQR sẽ tự động ghi vào đây.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      txLogs.map((log) => {
                        const isScholarship = log.type === 'grant_scholarship'
                        const isConfirmed = log.type === 'intent_confirmed'
                        const isVietQr = log.type === 'vietqr_intent'

                        return (
                          <tr
                            key={log.id}
                            className="border-b border-border/30 hover:bg-brand-50/30 transition text-xs"
                          >
                            <td className="px-4 py-3 text-muted whitespace-nowrap font-medium">
                              {new Date(log.timestamp).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-text">{log.userName || 'Khách hàng'}</p>
                              <p className="text-muted font-mono text-[11px]">{log.userEmail}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={cn(
                                  'rounded-full px-2.5 py-0.5 font-extrabold text-[11px]',
                                  isScholarship
                                    ? 'bg-violet-100 text-violet-800'
                                    : isConfirmed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isVietQr
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-sky-100 text-sky-800',
                                )}
                              >
                                {log.typeLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-text">{log.planName}</td>
                            <td className="px-4 py-3 whitespace-nowrap font-display font-black text-sm">
                              {log.amount === 0 ? (
                                <span className="text-violet-700">0₫ (Học bổng)</span>
                              ) : (
                                <span className="text-brand-700">
                                  {log.amount.toLocaleString('vi-VN')}₫
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                {log.paymentMethod}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted max-w-xs truncate" title={log.note}>
                              {log.note || '—'}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ─── CỘT PHẢI: TRUNG TÂM LÊN GÓI & THU NGÂN (ADMIN POS) ─── */}
        {!isPosCollapsed && (
          <AdminBillingPos
            billingAdminMode={billingAdminMode}
            setBillingAdminMode={setBillingAdminMode}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            grantForm={grantForm}
            setGrantForm={setGrantForm}
            grantLoading={grantLoading}
            grantSelectedUser={grantSelectedUser}
            setGrantSelectedUser={setGrantSelectedUser}
            grantUserResults={grantUserResults}
            setGrantUserResults={setGrantUserResults}
            grantUserSearching={grantUserSearching}
            searchGrantUser={searchGrantUser}
            availablePlans={billingPlans}
            planLabels={planLabels}
            planBadgeColors={PLAN_BADGE_COLORS}
            roleLabels={ROLE_LABELS}
            handlePosSubmit={handlePosSubmit}
            generateSuggestedReason={generateSuggestedReason}
            pendingIntents={pendingIntents}
            onConfirmPendingIntent={(intent) => setBillingConfirmIntent(intent)}
            onViewPendingIntentDetail={(intent) => setSelectedDetailIntent(intent)}
          />
        )}
      </div>

      {/* Confirm payment intent dialog */}
      <ConfirmDialog
        open={!!billingConfirmIntent}
        title={`Xác nhận đã nhận tiền từ ${billingConfirmIntent?.userName ?? billingConfirmIntent?.userEmail ?? 'user'}?`}
        description={`Mục đích: ${PURPOSE_LABELS[billingConfirmIntent?.purpose ?? ''] ?? billingConfirmIntent?.purpose} · Số tiền: ${Number(billingConfirmIntent?.amountMinor ?? 0).toLocaleString('vi-VN')}₫. Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận đã nhận tiền"
        onConfirm={() => billingConfirmIntent && void confirmIntent(billingConfirmIntent)}
        onCancel={() => setBillingConfirmIntent(null)}
      />

      {/* Detail modal for Pending Intent */}
      <PendingIntentDetailModal
        intent={selectedDetailIntent}
        isOpen={!!selectedDetailIntent}
        onClose={() => setSelectedDetailIntent(null)}
        confirming={detailConfirming}
        onConfirm={async (intent) => {
          setDetailConfirming(true)
          try {
            await confirmIntent(intent)
            setSelectedDetailIntent(null)
          } finally {
            setDetailConfirming(false)
          }
        }}
      />

      {/* VietQR Modal */}
      {vietQrModalIntent && (
        <Suspense fallback={null}>
          <VietQrModal
            intent={vietQrModalIntent}
            onClose={() => setVietQrModalIntent(null)}
            onConfirmPaid={handleConfirmVietQrPaid}
          />
        </Suspense>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
