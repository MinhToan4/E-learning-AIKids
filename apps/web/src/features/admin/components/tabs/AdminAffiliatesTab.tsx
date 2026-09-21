import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
  Plus,
  Copy,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  AlertTriangle,
  Building2,
  CreditCard,
  Percent,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import type {
  AffiliateRow,
  AffiliateCommissionRow,
  AffiliateStats,
} from '../../types'

function formatVnd(minor?: number | null): string {
  if (!minor || minor <= 0) return '0₫'
  return `${Number(minor).toLocaleString('vi-VN')}₫`
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(dateStr)
  }
}

interface AffiliateModalData {
  id?: string
  name: string
  phone: string
  email: string
  ref_code: string
  commission_rate: number
  bank_name: string
  bank_account: string
  bank_account_name: string
  status: 'active' | 'inactive'
}

const DEFAULT_FORM_DATA: AffiliateModalData = {
  name: '',
  phone: '',
  email: '',
  ref_code: '',
  commission_rate: 10.0,
  bank_name: '',
  bank_account: '',
  bank_account_name: '',
  status: 'active',
}

export function AdminAffiliatesTab() {
  const { toasts, showToast, dismissToast } = useToast()

  // Data states
  const [stats, setStats] = useState<AffiliateStats>({
    total_affiliates: 0,
    total_active_affiliates: 0,
    total_orders: 0,
    total_revenue_minor: 0,
    total_commission_minor: 0,
    pending_commission_minor: 0,
    approved_commission_minor: 0,
    paid_commission_minor: 0,
    rejected_commission_minor: 0,
  })
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([])
  const [commissions, setCommissions] = useState<AffiliateCommissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Sub-tabs: 'affiliates' | 'commissions'
  const [activeSubTab, setActiveSubTab] = useState<'affiliates' | 'commissions'>('affiliates')

  // Affiliate list filters
  const [affiliateSearch, setAffiliateSearch] = useState('')

  // Commissions filters
  const [commissionStatusFilter, setCommissionStatusFilter] = useState<string>('all')
  const [commissionSearch, setCommissionSearch] = useState('')

  // Modal create/edit affiliate state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState<AffiliateModalData>(DEFAULT_FORM_DATA)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Confirm delete / deactivate affiliate
  const [deletingAffiliate, setDeletingAffiliate] = useState<AffiliateRow | null>(null)

  // Confirm commission action
  const [rejectingCommission, setRejectingCommission] = useState<AffiliateCommissionRow | null>(null)
  const [updatingCommissionId, setUpdatingCommissionId] = useState<string | null>(null)

  // Copy indicator state
  const [copiedRefCode, setCopiedRefCode] = useState<string | null>(null)

  // Load all data
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    setRefreshing(true)
    try {
      const [statsRes, affsRes, commsRes] = await Promise.all([
        api<AffiliateStats>('/api/v1/billing/admin/affiliate-stats').catch(() => null),
        api<AffiliateRow[]>('/api/v1/billing/admin/affiliates').catch(() => []),
        api<AffiliateCommissionRow[]>('/api/v1/billing/admin/affiliate-orders').catch(() => []),
      ])

      if (statsRes) {
        setStats(statsRes)
      }
      if (Array.isArray(affsRes)) {
        setAffiliates(affsRes)
      }
      if (Array.isArray(commsRes)) {
        setCommissions(commsRes)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu CTV'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [showToast])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // Copy ref link helper
  const handleCopyRefLink = (refCode: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.aikid.vn'
    const link = `${origin}/?ref=${encodeURIComponent(refCode)}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedRefCode(refCode)
        showToast(`Đã sao chép link CTV: ${link}`, 'success')
        setTimeout(() => setCopiedRefCode(null), 2500)
      }).catch(() => {
        showToast(`Link giới thiệu: ${link}`, 'info')
      })
    } else {
      showToast(`Link giới thiệu: ${link}`, 'info')
    }
  }

  // Open modal create
  const handleOpenCreateModal = () => {
    setModalMode('create')
    setFormData(DEFAULT_FORM_DATA)
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open modal edit
  const handleOpenEditModal = (aff: AffiliateRow) => {
    setModalMode('edit')
    setFormData({
      id: aff.id,
      name: aff.name,
      phone: aff.phone || '',
      email: aff.email || '',
      ref_code: aff.ref_code,
      commission_rate: aff.commission_rate ?? 10.0,
      bank_name: aff.bank_name || '',
      bank_account: aff.bank_account || '',
      bank_account_name: aff.bank_account_name || '',
      status: aff.status === 'inactive' ? 'inactive' : 'active',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  // Submit create or edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập Họ và tên CTV')
      return
    }
    if (!formData.ref_code.trim()) {
      setFormError('Vui lòng nhập Mã giới thiệu (Ref Code)')
      return
    }

    setFormSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        ref_code: formData.ref_code.trim().toUpperCase(),
        commission_rate: Number(formData.commission_rate) || 10.0,
        bank_name: formData.bank_name.trim() || undefined,
        bank_account: formData.bank_account.trim() || undefined,
        bank_account_name: formData.bank_account_name.trim() || undefined,
        status: formData.status,
      }

      if (modalMode === 'create') {
        await api('/api/v1/billing/admin/affiliates', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        showToast(`Đã thêm CTV ${payload.name} thành công!`, 'success')
      } else if (formData.id) {
        await api(`/api/v1/billing/admin/affiliates/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        showToast(`Đã cập nhật CTV ${payload.name} thành công!`, 'success')
      }

      setIsModalOpen(false)
      await fetchData(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu thông tin CTV'
      setFormError(msg)
      showToast(msg, 'error')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Confirm deactivate/delete affiliate
  const handleConfirmDeleteAffiliate = async () => {
    if (!deletingAffiliate) return
    try {
      await api(`/api/v1/billing/admin/affiliates/${deletingAffiliate.id}`, {
        method: 'DELETE',
      })
      showToast(`Đã hủy kích hoạt CTV ${deletingAffiliate.name}`, 'success')
      setDeletingAffiliate(null)
      await fetchData(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa CTV'
      showToast(msg, 'error')
    }
  }

  // Update commission status (approve, pay, reject)
  const handleUpdateCommissionStatus = async (
    commissionId: string,
    newStatus: 'approved' | 'paid' | 'rejected',
    note?: string,
  ) => {
    setUpdatingCommissionId(commissionId)
    try {
      await api(`/api/v1/billing/admin/affiliate-commissions/${commissionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, note }),
      })

      const statusLabels: Record<string, string> = {
        approved: 'Đã duyệt hoa hồng',
        paid: 'Đã xác nhận chuyển tiền hoa hồng',
        rejected: 'Đã từ chối hoa hồng',
      }
      showToast(statusLabels[newStatus] || 'Đã cập nhật trạng thái', 'success')
      setRejectingCommission(null)
      await fetchData(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi cập nhật trạng thái hoa hồng'
      showToast(msg, 'error')
    } finally {
      setUpdatingCommissionId(null)
    }
  }

  // Filtered affiliates
  const filteredAffiliates = useMemo(() => {
    const q = affiliateSearch.toLowerCase().trim()
    if (!q) return affiliates
    return affiliates.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.ref_code?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q),
    )
  }, [affiliates, affiliateSearch])

  // Filtered commissions
  const filteredCommissions = useMemo(() => {
    let list = commissions
    if (commissionStatusFilter !== 'all') {
      list = list.filter((c) => c.status === commissionStatusFilter)
    }
    const q = commissionSearch.toLowerCase().trim()
    if (q) {
      list = list.filter(
        (c) =>
          c.order_code?.toLowerCase().includes(q) ||
          c.customer_name?.toLowerCase().includes(q) ||
          c.customer_phone?.toLowerCase().includes(q) ||
          c.customer_email?.toLowerCase().includes(q) ||
          c.affiliate_name?.toLowerCase().includes(q) ||
          c.affiliate_ref_code?.toLowerCase().includes(q),
      )
    }
    return list
  }, [commissions, commissionStatusFilter, commissionSearch])

  return (
    <div className="flex flex-col gap-6 pb-12">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── 1. Header Toolbar ── */}
      <div className="ui-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-border/80 shadow-clay bg-surface">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
              <Users className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-black text-text tracking-tight">
              Quản Trị Cộng Tác Viên & Đối Soát Hoa Hồng
            </h2>
          </div>
          <p className="text-xs text-muted max-w-2xl pl-11">
            Quản lý danh sách CTV, mã giới thiệu, đối soát các đơn hàng đăng ký và xét duyệt chi trả hoa hồng minh bạch.
          </p>
        </div>

        <div className="flex items-center gap-2 pl-11 md:pl-0">
          <Button
            variant="secondary"
            className="flex items-center gap-1.5 text-xs font-bold"
            onClick={() => fetchData()}
            disabled={refreshing}
          >
            <RotateCcw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Làm mới
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-1.5 text-xs font-black shadow-clay bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleOpenCreateModal}
          >
            <Plus className="h-4 w-4" />
            + Thêm CTV Mới
          </Button>
        </div>
      </div>

      {/* ── 2. Hàng Thẻ Thống Kê (5 Cards Soft Clay) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Tổng CTV */}
        <div className="ui-card p-4 flex flex-col justify-between rounded-3xl border-2 border-sky-100 bg-gradient-to-br from-sky-50/50 to-white shadow-clay">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Tổng số CTV</span>
            <span className="h-8 w-8 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-sm">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl font-black text-text">{stats.total_affiliates}</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              {stats.total_active_affiliates} đang hoạt động
            </p>
          </div>
        </div>

        {/* Card 2: Tổng đơn Ref */}
        <div className="ui-card p-4 flex flex-col justify-between rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white shadow-clay">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Tổng đơn Ref</span>
            <span className="h-8 w-8 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-sm">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl font-black text-text">{stats.total_orders}</p>
            <p className="text-[11px] font-medium text-muted mt-0.5">Từ link giới thiệu CTV</p>
          </div>
        </div>

        {/* Card 3: Doanh số phát sinh */}
        <div className="ui-card p-4 flex flex-col justify-between rounded-3xl border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white shadow-clay">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Doanh số Ref</span>
            <span className="h-8 w-8 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-sm">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-display text-xl font-black text-text truncate" title={formatVnd(stats.total_revenue_minor)}>
              {formatVnd(stats.total_revenue_minor)}
            </p>
            <p className="text-[11px] font-medium text-muted mt-0.5">Tổng giá trị đơn Ref</p>
          </div>
        </div>

        {/* Card 4: Hoa hồng chờ duyệt */}
        <div className="ui-card p-4 flex flex-col justify-between rounded-3xl border-2 border-amber-100 bg-gradient-to-br from-amber-50/50 to-white shadow-clay">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Hoa hồng chờ duyệt</span>
            <span className="h-8 w-8 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-display text-xl font-black text-amber-700 truncate" title={formatVnd(stats.pending_commission_minor)}>
              {formatVnd(stats.pending_commission_minor)}
            </p>
            <p className="text-[11px] font-medium text-amber-600 mt-0.5">Cần đối soát & duyệt</p>
          </div>
        </div>

        {/* Card 5: Hoa hồng đã chi trả */}
        <div className="ui-card p-4 flex flex-col justify-between rounded-3xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white shadow-clay">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Đã chi trả</span>
            <span className="h-8 w-8 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="font-display text-xl font-black text-emerald-700 truncate" title={formatVnd(stats.paid_commission_minor)}>
              {formatVnd(stats.paid_commission_minor)}
            </p>
            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Đã giải ngân cho CTV</p>
          </div>
        </div>
      </div>

      {/* ── 3. Sub-Tabs Switcher ── */}
      <div className="flex border-b border-border/80 gap-2 px-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('affiliates')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-black border-b-2 transition-all cursor-pointer',
            activeSubTab === 'affiliates'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-2xl'
              : 'border-transparent text-muted hover:text-text hover:bg-page/50 rounded-t-2xl',
          )}
        >
          <Users className="h-4 w-4" />
          <span>Danh Sách CTV</span>
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">
            {affiliates.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('commissions')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-black border-b-2 transition-all cursor-pointer',
            activeSubTab === 'commissions'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-2xl'
              : 'border-transparent text-muted hover:text-text hover:bg-page/50 rounded-t-2xl',
          )}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Đơn Hàng & Đối Soát Hoa Hồng</span>
          <span className="rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-xs font-bold">
            {commissions.length}
          </span>
        </button>
      </div>

      {/* ── 4. Sub-Tab Content ── */}
      {activeSubTab === 'affiliates' ? (
        /* TAB 1: DANH SÁCH CTV */
        <div className="flex flex-col gap-4">
          {/* Search bar & count */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                value={affiliateSearch}
                onChange={(e) => setAffiliateSearch(e.target.value)}
                placeholder="Tìm CTV theo tên, SĐT, mã ref…"
                className="w-full rounded-2xl border-2 border-border/80 bg-surface pl-10 pr-4 py-2 text-xs font-medium text-text placeholder:text-muted focus:border-emerald-500 focus:outline-none transition shadow-sm"
              />
              {affiliateSearch && (
                <button
                  type="button"
                  onClick={() => setAffiliateSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs font-bold text-muted self-end sm:self-center">
              Hiển thị {filteredAffiliates.length} / {affiliates.length} CTV
            </div>
          </div>

          {/* Table CTV */}
          <div className="ui-card overflow-hidden rounded-3xl border-2 border-border/80 shadow-clay bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-page/50 font-black text-muted uppercase text-[11px] tracking-wider">
                    <th className="p-4">Mã Ref</th>
                    <th className="p-4">Họ & Tên</th>
                    <th className="p-4">Liên Hệ</th>
                    <th className="p-4 text-center">% Hoa Hồng</th>
                    <th className="p-4">Tài Khoản Ngân Hàng</th>
                    <th className="p-4 text-right">Doanh Số</th>
                    <th className="p-4 text-right">Hoa Hồng</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          <span>Đang tải danh sách CTV…</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAffiliates.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-muted/50" />
                          <p className="font-bold text-sm">Chưa có Cộng Tác Viên nào</p>
                          <p className="text-xs">Bấm "+ Thêm CTV Mới" để tạo đối tác giới thiệu đầu tiên.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAffiliates.map((aff) => {
                      const isCopied = copiedRefCode === aff.ref_code
                      const isActive = aff.status === 'active'

                      return (
                        <tr key={aff.id} className="hover:bg-page/40 transition">
                          {/* Mã Ref */}
                          <td className="p-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1 font-black text-emerald-800 text-xs shadow-sm">
                                {aff.ref_code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyRefLink(aff.ref_code)}
                                title="Sao chép link ref"
                                className="rounded-lg p-1 text-muted hover:bg-surface hover:text-emerald-700 transition"
                              >
                                {isCopied ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Họ & Tên */}
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-white text-xs shadow-sm">
                                {aff.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-black text-text">{aff.name}</p>
                                <p className="text-[10px] text-muted">
                                  Tạo ngày {formatDate(aff.created_at)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Liên Hệ */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              {aff.phone && (
                                <p className="font-semibold text-text">{aff.phone}</p>
                              )}
                              {aff.email && (
                                <p className="text-muted text-[11px]">{aff.email}</p>
                              )}
                              {!aff.phone && !aff.email && (
                                <span className="text-muted text-[11px] italic">Chưa cập nhật</span>
                              )}
                            </div>
                          </td>

                          {/* % Hoa hồng */}
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 rounded-xl bg-purple-50 px-2 py-1 text-xs font-black text-purple-700 border border-purple-200">
                              <Percent className="h-3 w-3" />
                              {aff.commission_rate}%
                            </span>
                          </td>

                          {/* Ngân hàng */}
                          <td className="p-4">
                            {aff.bank_name || aff.bank_account ? (
                              <div className="space-y-0.5">
                                <p className="font-black text-text flex items-center gap-1">
                                  <Building2 className="h-3 w-3 text-muted" />
                                  {aff.bank_name || 'Ngân hàng'}
                                </p>
                                <p className="font-mono text-[11px] text-muted flex items-center gap-1">
                                  <CreditCard className="h-3 w-3 text-muted" />
                                  {aff.bank_account} {aff.bank_account_name ? `(${aff.bank_account_name})` : ''}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted italic text-[11px]">Chưa cài đặt</span>
                            )}
                          </td>

                          {/* Doanh số */}
                          <td className="p-4 text-right">
                            <p className="font-black text-text">
                              {formatVnd(aff.total_revenue_minor)}
                            </p>
                            <p className="text-[10px] text-muted">
                              {aff.total_orders || 0} đơn hàng
                            </p>
                          </td>

                          {/* Hoa hồng tích lũy */}
                          <td className="p-4 text-right">
                            <p className="font-black text-emerald-700">
                              {formatVnd(aff.total_commission_minor)}
                            </p>
                            <div className="flex justify-end gap-1 mt-0.5">
                              {(aff.pending_commission_minor ?? 0) > 0 && (
                                <span className="text-[10px] text-amber-600 font-bold" title="Chờ duyệt">
                                  ⏳ {formatVnd(aff.pending_commission_minor)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Trạng thái */}
                          <td className="p-4 text-center">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-2xl px-2.5 py-1 text-[11px] font-bold border shadow-xs',
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200',
                              )}
                            >
                              <span
                                className={cn(
                                  'h-1.5 w-1.5 rounded-full',
                                  isActive ? 'bg-emerald-500' : 'bg-slate-400',
                                )}
                              />
                              {isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                            </span>
                          </td>

                          {/* Thao tác */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyRefLink(aff.ref_code)}
                                title="Copy link ref"
                                className="rounded-xl border border-border bg-page p-1.5 text-muted hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(aff)}
                                title="Chỉnh sửa thông tin CTV"
                                className="rounded-xl border border-border bg-page p-1.5 text-muted hover:text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50 transition"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingAffiliate(aff)}
                                title="Hủy kích hoạt CTV"
                                className="rounded-xl border border-border bg-page p-1.5 text-muted hover:text-coral-600 hover:border-coral-200 hover:bg-coral-50 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: ĐƠN HÀNG & ĐỐI SOÁT HOA HỒNG */
        <div className="flex flex-col gap-4">
          {/* Filter Toolbar */}
          <div className="ui-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-border/80 shadow-clay bg-surface">
            {/* Status pills filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'pending', label: 'Chờ duyệt (Pending)' },
                { key: 'approved', label: 'Đã duyệt (Approved)' },
                { key: 'paid', label: 'Đã chi trả (Paid)' },
                { key: 'rejected', label: 'Từ chối (Rejected)' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCommissionStatusFilter(tab.key)}
                  className={cn(
                    'rounded-2xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer',
                    commissionStatusFilter === tab.key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-page text-muted hover:text-text hover:bg-border/40',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                value={commissionSearch}
                onChange={(e) => setCommissionSearch(e.target.value)}
                placeholder="Tìm mã đơn, tên khách, CTV…"
                className="w-full rounded-2xl border-2 border-border/80 bg-surface pl-10 pr-4 py-1.5 text-xs font-medium text-text placeholder:text-muted focus:border-emerald-500 focus:outline-none transition"
              />
              {commissionSearch && (
                <button
                  type="button"
                  onClick={() => setCommissionSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Table Đơn hàng & Hoa hồng */}
          <div className="ui-card overflow-hidden rounded-3xl border-2 border-border/80 shadow-clay bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-page/50 font-black text-muted uppercase text-[11px] tracking-wider">
                    <th className="p-4">Mã Đơn</th>
                    <th className="p-4">Thời Gian</th>
                    <th className="p-4">Khách Hàng</th>
                    <th className="p-4">SĐT / Email</th>
                    <th className="p-4 text-right">Doanh Số</th>
                    <th className="p-4">Mã Ref & CTV</th>
                    <th className="p-4 text-right">Hoa Hồng</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          <span>Đang tải danh sách đơn hàng đối soát…</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingBag className="h-8 w-8 text-muted/50" />
                          <p className="font-bold text-sm">Không có đơn hàng nào</p>
                          <p className="text-xs">
                            {commissionStatusFilter !== 'all'
                              ? `Chưa có đơn hàng nào ở trạng thái '${commissionStatusFilter}'.`
                              : 'Chưa có đơn hàng nào được ghi nhận qua mã giới thiệu.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCommissions.map((comm) => {
                      const isPending = comm.status === 'pending'
                      const isApproved = comm.status === 'approved'
                      const isPaid = comm.status === 'paid'
                      const isRejected = comm.status === 'rejected'
                      const isUpdating = updatingCommissionId === comm.id

                      return (
                        <tr key={comm.id} className="hover:bg-page/40 transition">
                          {/* Mã Đơn */}
                          <td className="p-4 font-mono font-bold text-text">
                            <span className="rounded-xl bg-page px-2 py-1 border border-border/80">
                              #{comm.order_code}
                            </span>
                            {comm.is_self_referral && (
                              <span
                                className="ml-1.5 inline-block text-[10px] text-coral-600 font-bold bg-coral-50 border border-coral-200 rounded px-1"
                                title="Trùng SĐT/Email giữa CTV và Khách hàng"
                              >
                                Tự ref!
                              </span>
                            )}
                          </td>

                          {/* Thời Gian */}
                          <td className="p-4 text-muted">
                            <p className="font-medium">{formatDate(comm.created_at)}</p>
                          </td>

                          {/* Khách Hàng */}
                          <td className="p-4 font-bold text-text">
                            {comm.customer_name || 'Khách vãng lai'}
                          </td>

                          {/* SĐT / Email */}
                          <td className="p-4 text-muted">
                            <div className="space-y-0.5">
                              {comm.customer_phone && (
                                <p className="font-semibold text-text">{comm.customer_phone}</p>
                              )}
                              {comm.customer_email && (
                                <p className="text-[11px]">{comm.customer_email}</p>
                              )}
                              {!comm.customer_phone && !comm.customer_email && (
                                <span className="italic text-[11px]">-</span>
                              )}
                            </div>
                          </td>

                          {/* Doanh Số */}
                          <td className="p-4 text-right font-black text-text">
                            {formatVnd(comm.order_total_minor)}
                          </td>

                          {/* Mã Ref & CTV */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 font-mono text-[11px] font-black">
                                {comm.affiliate_ref_code || '-'}
                              </span>
                              <p className="font-bold text-text text-[11px] mt-0.5">
                                {comm.affiliate_name || 'CTV'}
                              </p>
                            </div>
                          </td>

                          {/* Tiền hoa hồng */}
                          <td className="p-4 text-right">
                            <p className="font-black text-emerald-700 text-sm">
                              {formatVnd(comm.commission_amount_minor)}
                            </p>
                          </td>

                          {/* Trạng Thái */}
                          <td className="p-4 text-center">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 text-[11px] font-bold">
                                <Clock className="h-3 w-3 text-amber-600" />
                                Chờ duyệt
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 text-[11px] font-bold">
                                <CheckCircle2 className="h-3 w-3 text-sky-600" />
                                Đã duyệt
                              </span>
                            )}
                            {isPaid && (
                              <span className="inline-flex items-center gap-1 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                Đã chi trả
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 rounded-2xl bg-coral-50 text-coral-800 border border-coral-200 px-2.5 py-1 text-[11px] font-bold">
                                <XCircle className="h-3 w-3 text-coral-600" />
                                Từ chối
                              </span>
                            )}
                          </td>

                          {/* Thao Tác */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isPending && (
                                <>
                                  <Button
                                    variant="primary"
                                    className="px-2.5 py-1 text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateCommissionStatus(comm.id, 'approved')}
                                  >
                                    Duyệt
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="px-2.5 py-1 text-[11px] font-black text-coral-600 hover:bg-coral-50 rounded-xl"
                                    disabled={isUpdating}
                                    onClick={() => setRejectingCommission(comm)}
                                  >
                                    Từ chối
                                  </Button>
                                </>
                              )}

                              {isApproved && (
                                <Button
                                  variant="primary"
                                  className="px-3 py-1 text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateCommissionStatus(comm.id, 'paid')}
                                >
                                  <CreditCard className="h-3 w-3" />
                                  Đã chuyển tiền
                                </Button>
                              )}

                              {isPaid && (
                                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 justify-center">
                                  <Check className="h-3.5 w-3.5" /> Hoàn tất
                                </span>
                              )}

                              {isRejected && (
                                <span className="text-[11px] font-bold text-coral-500">
                                  {comm.note || 'Bị từ chối'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Modal Thêm / Sửa CTV ── */}
      {isModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
            <div
              className="ui-card w-full max-w-lg overflow-hidden rounded-3xl border-2 border-brand-100 bg-surface shadow-clay animate-in zoom-in-95"
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-page/60">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-black text-base text-text">
                      {modalMode === 'create' ? 'Thêm Cộng Tác Viên Mới' : 'Cập Nhật Thông Tin CTV'}
                    </h3>
                    <p className="text-[11px] text-muted">
                      {modalMode === 'create'
                        ? 'Cấp mã giới thiệu và thiết lập hoa hồng cho đối tác'
                        : 'Điều chỉnh mã ref, tỉ lệ hoa hồng và tài khoản nhận tiền'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl p-1.5 text-muted hover:bg-surface hover:text-text transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {formError && (
                  <div className="flex items-center gap-2 rounded-2xl bg-coral-50 p-3 text-xs font-bold text-coral-700 border border-coral-200">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Họ tên */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-text">
                    Họ và tên CTV <span className="text-coral-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-medium text-text focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                {/* SĐT & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-text">Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-medium text-text focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-text">Email</label>
                    <input
                      type="email"
                      placeholder="ctv@aikid.vn"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-medium text-text focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Mã Ref & Tỉ lệ hoa hồng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-text">
                      Mã Ref (Viết hoa) <span className="text-coral-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: MEELAN, VIP99"
                      value={formData.ref_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ref_code: e.target.value.toUpperCase().replace(/\s+/g, ''),
                        })
                      }
                      className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-mono font-bold text-emerald-800 uppercase focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-text">% Hoa hồng</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={formData.commission_rate}
                        onChange={(e) =>
                          setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full rounded-2xl border-2 border-border/80 bg-surface pl-4 pr-8 py-2 text-xs font-bold text-text focus:border-emerald-500 focus:outline-none transition"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ngân hàng */}
                <div className="space-y-3 pt-2 border-t border-border/60">
                  <p className="text-xs font-black text-muted uppercase tracking-wider">
                    Thông Tin Tài Khoản Nhận Hoa Hồng
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-text">Tên ngân hàng</label>
                    <input
                      type="text"
                      placeholder="MBBank, Techcombank, Vietcombank…"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-medium text-text focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-text">Số tài khoản</label>
                      <input
                        type="text"
                        placeholder="Số TK ngân hàng"
                        value={formData.bank_account}
                        onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                        className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-mono font-medium text-text focus:border-emerald-500 focus:outline-none transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-text">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN AN"
                        value={formData.bank_account_name}
                        onChange={(e) =>
                          setFormData({ ...formData, bank_account_name: e.target.value.toUpperCase() })
                        }
                        className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-bold text-text uppercase focus:border-emerald-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Trạng thái nếu edit */}
                {modalMode === 'edit' && (
                  <div className="space-y-1 pt-2 border-t border-border/60">
                    <label className="text-xs font-black text-text">Trạng thái kích hoạt</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={() => setFormData({ ...formData, status: 'active' })}
                          className="accent-emerald-600"
                        />
                        Hoạt động
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={formData.status === 'inactive'}
                          onChange={() => setFormData({ ...formData, status: 'inactive' })}
                          className="accent-coral-600"
                        />
                        Tạm khóa
                      </label>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/80">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={formSubmitting}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-clay"
                    disabled={formSubmitting}
                  >
                    {formSubmitting
                      ? 'Đang lưu…'
                      : modalMode === 'create'
                        ? 'Tạo CTV Mới'
                        : 'Lưu Cập Nhật'}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* ── 6. Confirm Dialog Vô hiệu hóa CTV ── */}
      <ConfirmDialog
        open={Boolean(deletingAffiliate)}
        danger
        title="Vô hiệu hóa Cộng Tác Viên?"
        description={`Bạn có chắc muốn vô hiệu hóa đối tác "${deletingAffiliate?.name}" (Mã Ref: ${deletingAffiliate?.ref_code})? Link giới thiệu của đối tác này sẽ tạm thời ngừng ghi nhận hoa hồng.`}
        confirmLabel="Vô hiệu hóa"
        cancelLabel="Hủy"
        onConfirm={handleConfirmDeleteAffiliate}
        onCancel={() => setDeletingAffiliate(null)}
      />

      {/* ── 7. Confirm Dialog Từ chối hoa hồng ── */}
      <ConfirmDialog
        open={Boolean(rejectingCommission)}
        danger
        title="Từ chối duyệt hoa hồng?"
        description={`Bạn có chắc muốn từ chối hoa hồng đơn hàng #${rejectingCommission?.order_code} (Số tiền: ${formatVnd(rejectingCommission?.commission_amount_minor)})? Hành động này sẽ đánh dấu hoa hồng bị từ chối.`}
        confirmLabel="Từ chối hoa hồng"
        cancelLabel="Đóng"
        onConfirm={() => {
          if (rejectingCommission) {
            void handleUpdateCommissionStatus(
              rejectingCommission.id,
              'rejected',
              'Quản trị viên từ chối hoa hồng',
            )
          }
        }}
        onCancel={() => setRejectingCommission(null)}
      />
    </div>
  )
}
