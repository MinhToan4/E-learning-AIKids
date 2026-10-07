import React, { lazy, Suspense, useEffect, useState, useCallback, useMemo } from 'react'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { AdminBillingPos } from '../AdminBillingPos'
import { AdminInvoiceManager } from './AdminInvoiceManager'
import { PendingIntentDetailModal } from '../PendingIntentDetailModal'
import { AdminSubscribersView } from '../billing/AdminSubscribersView'
import { AdminPlansCatalogView } from '../billing/AdminPlansCatalogView'
import { AdminBillingLogsView, type BillingTransactionLog } from '../billing/AdminBillingLogsView'
import type { VietQrModalData } from '../VietQrModal'
import {
  ROLE_LABELS,
  getCachedBillingPlans,
  normalizePlanDef,
  type AdminUser,
  type BillingStats,
  type PendingIntent,
  type PlanDef,
  type SubscriptionRow,
} from '../../types'

export type { BillingTransactionLog } from '../billing/AdminBillingLogsView'

const VietQrModal = lazy(() =>
  import('../VietQrModal').then((m) => ({ default: m.VietQrModal })),
)
const PlanEditorModal = lazy(() =>
  import('../PlanEditorModal').then((m) => ({ default: m.PlanEditorModal })),
)

const PLAN_BADGE_COLORS: Record<string, string> = {
  free: 'bg-slate-100 text-slate-600',
  starter: 'bg-sky-100 text-sky-700',
  aikids_official_129k: 'bg-amber-100 text-amber-800',
  premium_family: 'bg-violet-100 text-violet-700',
  pro: 'bg-amber-100 text-amber-700',
}

const PURPOSE_LABELS: Record<string, string> = {
  user_sub: 'Gói cá nhân',
  credit_pack: 'Gói lượt AI',
  course_purchase: 'Mua khóa học',
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

  // Sub-nav view: subscribers, pos_orders, plans, invoices, or logs
  const [billingPlanView, setBillingPlanView] = useState<'subscribers' | 'pos_orders' | 'plans' | 'invoices' | 'logs'>('subscribers')


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

  // Payment Provider Mode: manual (default) or sepay
  const [paymentProviderMode, setPaymentProviderMode] = useState<'manual' | 'sepay'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (localStorage.getItem('aikids_payment_provider_mode') as 'manual' | 'sepay') || 'manual'
    }
    return 'manual'
  })

  function handlePaymentProviderModeChange(mode: 'manual' | 'sepay') {
    setPaymentProviderMode(mode)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('aikids_payment_provider_mode', mode)
    }
    showToast(
      mode === 'sepay'
        ? 'Đã chuyển sang Cổng Thanh toán Tự động SePay'
        : 'Đã chuyển sang Thanh toán Chuyển khoản Thủ công Vietcombank',
      'success',
    )
  }

  async function handleCancelPendingIntent(intent: PendingIntent) {
    const code = intent.paymentCode || intent.publicId || intent.id
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn ${code}?`)) return
    try {
      await api(
        `/api/v1/billing/admin/subscriptions/intents/${encodeURIComponent(intent.publicId || intent.id)}/cancel`,
        { method: 'POST' },
      )
      setPendingIntents((prev) =>
        prev.filter((p) => (p.publicId || p.id) !== (intent.publicId || intent.id)),
      )
      showToast('Đã hủy đơn chờ thanh toán thành công', 'success')
      if (
        selectedDetailIntent &&
        (selectedDetailIntent.publicId || selectedDetailIntent.id) === (intent.publicId || intent.id)
      ) {
        setSelectedDetailIntent(null)
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi khi hủy đơn', 'error')
    }
  }

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
      starter: 'Starter (69K)',
      aikids_official_129k: 'AI Kid Chính Thức (129K)',
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
        api<{ stats: BillingStats; plans: PlanDef[] } | { status: string; data: { stats: BillingStats; plans: PlanDef[] } }>('/api/v1/billing/admin/subscriptions/stats'),
        api<SubscriptionRow[] | { status: string; data: SubscriptionRow[] }>('/api/v1/billing/admin/subscriptions'),
        api<PendingIntent[] | { status: string; data: PendingIntent[] }>('/api/v1/billing/admin/subscriptions/pending-intents'),
        api<PlanDef[] | { status: string; data: PlanDef[] }>('/api/v1/billing/admin/plans'),
        api<{ plans: PlanDef[] }>('/api/parent/plans'),
      ])

      const subsRaw = subsRes.status === 'fulfilled' ? subsRes.value : null
      const subsData: SubscriptionRow[] = Array.isArray(subsRaw)
        ? subsRaw
        : Array.isArray((subsRaw as any)?.data)
          ? (subsRaw as any).data
          : []

      const intentsRaw = intentsRes.status === 'fulfilled' ? intentsRes.value : null
      const intentsData: PendingIntent[] = Array.isArray(intentsRaw)
        ? intentsRaw
        : Array.isArray((intentsRaw as any)?.data)
          ? (intentsRaw as any).data
          : []

      const dbPlansRaw = dbPlansRes.status === 'fulfilled' ? dbPlansRes.value : null
      const dbPlansData: PlanDef[] = Array.isArray(dbPlansRaw)
        ? dbPlansRaw
        : Array.isArray((dbPlansRaw as any)?.data)
          ? (dbPlansRaw as any).data
          : []

      // 1. Process plans
      let resolvedPlans: PlanDef[] | null = null
      if (dbPlansData.length > 0) {
        resolvedPlans = dbPlansData
      } else if (
        publicPlansRes.status === 'fulfilled' &&
        Array.isArray(publicPlansRes.value?.plans) &&
        publicPlansRes.value.plans.length > 0
      ) {
        resolvedPlans = publicPlansRes.value.plans
      } else {
        const statsVal = statsRes.status === 'fulfilled' ? statsRes.value : null
        const statsPlans = (statsVal as any)?.plans || (statsVal as any)?.data?.plans
        if (Array.isArray(statsPlans) && statsPlans.length > 0) {
          resolvedPlans = statsPlans
        }
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
      setBillingSubs(subsData)
      setPendingIntents(intentsData)

      // 3. Process stats
      const statsVal = statsRes.status === 'fulfilled' ? statsRes.value : null
      const statsObj: BillingStats | null = (statsVal as any)?.stats || (statsVal as any)?.data?.stats || null
      if (statsObj) {
        setBillingStats(statsObj)
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') return
      void fetchBillingData()
    }, 10000)
    return () => clearInterval(interval)
  }, [fetchBillingData])

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
          '/api/v1/billing/admin/subscriptions/checkout',
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
            ? 69000
            : grantForm.planId === 'aikids_official_129k'
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
        }>('/api/v1/billing/admin/subscriptions/checkout', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        const data = res.data
        const curPlan = billingPlans.find((p) => p.id === grantForm.planId)
        const unitPrice =
          curPlan?.amountMinor ??
          (grantForm.planId === 'starter'
            ? 69000
            : grantForm.planId === 'aikids_official_129k'
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
          '/api/v1/billing/admin/subscriptions/grant',
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
        `/api/v1/billing/admin/subscriptions/intents/${encodeURIComponent(publicId)}/complete`,
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
    setBillingPlanView('pos_orders')
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
        `/api/v1/billing/admin/subscriptions/intents/${encodeURIComponent(intent.publicId)}/complete`,
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
        `/api/v1/billing/admin/plans/${encodeURIComponent(plan.id)}/toggle`,
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

      {/* ── Sub-nav: Thuê bao | Trung tâm lên gói & Đơn thanh toán | Catalog | HĐ MISA | Logs ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-2xl bg-brand-50 p-1 w-fit border border-brand-100 flex-wrap">
          {[
            { id: 'subscribers', label: 'Danh sách thuê bao' },
            { id: 'pos_orders', label: 'Trung tâm lên gói & Đơn thanh toán' },
            { id: 'plans', label: 'Catalog gói cước & Package Builder' },
            { id: 'invoices', label: 'Hóa đơn & Thuế VN (MISA)' },
            { id: 'logs', label: 'Lịch sử cấp & bán gói (Logs)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBillingPlanView(tab.id as 'subscribers' | 'pos_orders' | 'plans' | 'invoices' | 'logs')}
              className={cn(
                'rounded-xl px-4 sm:px-5 py-2 text-sm font-bold transition cursor-pointer flex items-center gap-1.5',
                billingPlanView === tab.id
                  ? 'bg-white text-brand-700 shadow-sm font-black'
                  : 'text-muted hover:text-text',
              )}
            >
              <span>{tab.label}</span>
              {tab.id === 'pos_orders' && pendingIntents.length > 0 && (
                <span className="flex h-5 px-1.5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white shadow-2xs">
                  {pendingIntents.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Layout chính: Toàn màn hình rộng rãi cho từng Tab ── */}
      <div className="grid gap-5 grid-cols-1">
        {/* ─── CỘT TRÁI ─── */}
        <div className="flex flex-col gap-5">
          {/* Danh sách thuê bao */}
          {billingPlanView === 'subscribers' && (
            <AdminSubscribersView
              billingSubs={billingSubs}
              billingPlans={billingPlans}
              loading={loading}
              planLabels={planLabels}
              planBadgeColors={PLAN_BADGE_COLORS}
              roleLabels={ROLE_LABELS}
              onRefresh={() => void fetchBillingData()}
              onQuickGrant={quickGrant}
            />
          )}

          {/* Catalog Gói Bán & Tùy biến (Package Builder) */}
          {billingPlanView === 'plans' && (
            <div className="flex flex-col gap-4">
              <AdminPlansCatalogView
                paymentProviderMode={paymentProviderMode}
                onPaymentProviderModeChange={handlePaymentProviderModeChange}
                billingPlans={billingPlans}
                billingSubs={billingSubs}
                planBadgeColors={PLAN_BADGE_COLORS}
                onEditPlan={(plan) => {
                  setEditingPlan(plan)
                  setIsPlanEditorOpen(true)
                }}
                onTogglePlan={(plan) => void handleTogglePlan(plan)}
              />

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

          {/* Quản lý Hóa đơn điện tử MISA & Kế toán thuế VN */}
          {billingPlanView === 'invoices' && (
            <AdminInvoiceManager onNotify={(msg, type) => showToast(msg, type || 'info')} />
          )}

          {/* Lịch sử cấp & bán gói (Logs) */}
          {billingPlanView === 'logs' && (
            <AdminBillingLogsView
              txLogs={txLogs}
              onClearLogs={() => {
                if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nhật ký giao dịch hiển thị?')) {
                  setTxLogs([])
                  saveBillingLogs([])
                  showToast('Đã xóa nhật ký giao dịch', 'success')
                }
              }}
            />
          )}


          {/* ─── TAB: TRUNG TÂM LÊN GÓI & ĐƠN THANH TOÁN (ADMIN POS) ─── */}
          {billingPlanView === 'pos_orders' && (
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
              onCancelPendingIntent={handleCancelPendingIntent}
              onViewPendingIntentDetail={(intent) => setSelectedDetailIntent(intent)}
            />
          )}
        </div>
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
        onCancelIntent={handleCancelPendingIntent}
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
