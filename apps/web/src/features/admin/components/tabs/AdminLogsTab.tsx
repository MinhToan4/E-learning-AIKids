import { useEffect, useState, useCallback, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Paginator } from '@/shared/components/ui/Paginator'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { usePagination } from '@/shared/hooks/usePagination'
import { api } from '@/shared/lib/api'
import {
  CmsLogsIcon,
  CmsSessionsIcon,
} from '@/shared/components/icons/CmsIcons'
import { StatCard, OutcomeBadge } from '../AdminUiHelpers'
import type { AdminUser, LoginLogItem, LoginLogSummary } from '../../types'

export function AdminLogsTab() {
  const { toasts, showToast, dismissToast } = useToast()
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>([])
  const [logSummary, setLogSummary] = useState<LoginLogSummary | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [logFilter, setLogFilter] = useState('')
  const [logSearch, setLogSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const q = logFilter ? `?outcome=${encodeURIComponent(logFilter)}` : ''
      const [logsData, usersData] = await Promise.all([
        api<{ logs: LoginLogItem[]; summary: LoginLogSummary }>(`/api/admin/login-logs${q}`),
        api<{ users: AdminUser[] }>('/api/admin/users'),
      ])
      setLoginLogs(logsData.logs)
      setLogSummary(logsData.summary)
      setUsers(usersData.users)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tải nhật ký đăng nhập', 'error')
    } finally {
      setLoading(false)
    }
  }, [logFilter, showToast])

  useEffect(() => {
    void fetchLogs()
  }, [fetchLogs])

  const filteredLogs = useMemo(() => {
    if (!logSearch.trim()) return loginLogs
    const q = logSearch.toLowerCase()
    return loginLogs.filter(
      (log) =>
        (log.email ?? '').toLowerCase().includes(q) ||
        (log.ipAddress ?? '').toLowerCase().includes(q) ||
        (log.reason ?? '').toLowerCase().includes(q),
    )
  }, [loginLogs, logSearch])

  const logsPag = usePagination(filteredLogs, 20)

  async function purgeLogs() {
    try {
      const data = await api<{ deleted: number; message: string }>('/api/admin/login-logs', {
        method: 'DELETE',
      })
      showToast(data.message ?? `Đã dọn dẹp ${data.deleted} log cũ`, 'success')
      await fetchLogs()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể xóa log', 'error')
    }
  }

  async function toggleActive(u: AdminUser) {
    try {
      await api(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !u.active }),
      })
      showToast(`Đã ${u.active ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản ${u.email ?? u.nickname}`, 'success')
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, active: !item.active } : item)),
      )
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể cập nhật trạng thái', 'error')
    }
  }

  const toggleBtnStyleCompact = (active: boolean): React.CSSProperties => ({
    background: active ? 'var(--color-coral-600)' : 'var(--color-mint-600)',
    color: 'white',
    borderColor: active ? 'var(--color-coral-600)' : 'var(--color-mint-600)',
    minHeight: 0,
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: 700,
    lineHeight: '1.25rem',
  })

  return (
    <div className="flex flex-col gap-5">
      {/* ── Thống kê tóm tắt ─────────────────────────────────── */}
      {logSummary && (
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Tổng trong 24 giờ" value={logSummary.total} icon={<CmsLogsIcon />} />
          <StatCard
            label="Thành công"
            value={logSummary.byOutcome['success'] ?? 0}
            icon={<CmsSessionsIcon />}
          />
          <StatCard
            label="Thất bại"
            value={logSummary.byOutcome['failed'] ?? 0}
            icon={<CmsLogsIcon />}
          />
          <StatCard
            label="Bị khóa"
            value={logSummary.byOutcome['locked'] ?? 0}
            icon={<CmsSessionsIcon />}
          />
        </div>
      )}

      {/* ── Bảng nhật ký & Bộ lọc ────────────────────────────── */}
      <div className="ui-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
          <div className="relative flex-1 min-w-[180px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              <Search size={17} aria-hidden="true" />
            </span>
            <input
              type="search"
              aria-label="Tìm nhật ký đăng nhập"
              placeholder="Tìm email, IP, lý do..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
            />
          </div>

          <select
            aria-label="Lọc nhật ký theo kết quả"
            className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold bg-white"
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
          >
            <option value="">Tất cả kết quả</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
            <option value="locked">Bị khóa</option>
          </select>

          <Button variant="secondary" onClick={() => void fetchLogs()}>
            Làm mới
          </Button>

          <Button variant="ghost" className="text-muted" onClick={() => void purgeLogs()}>
            Xóa nhật ký cũ
          </Button>
        </div>

        {/* ── Auto-purge & Security Status Banner ──────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-brand-50/40 px-4 py-2 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>Chính sách lưu trữ: Tự động dọn sau {logSummary?.windowHours ?? 24} giờ</span>
          </div>
          {logSummary?.purgedAt && (
            <span>Lần dọn gần nhất: {new Date(logSummary.purgedAt).toLocaleString('vi-VN')}</span>
          )}
        </div>

        {/* ── Desktop table (md+) ─────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-brand-50/80">
              <tr>
                <th className="px-4 py-3 font-extrabold">Thời gian</th>
                <th className="px-4 py-3 font-extrabold">Email / Tài khoản</th>
                <th className="px-4 py-3 font-extrabold">Kết quả</th>
                <th className="px-4 py-3 font-extrabold">IP Nguồn</th>
                <th className="px-4 py-3 font-extrabold">Chi tiết / Lý do</th>
                <th className="px-4 py-3 font-extrabold text-right">Khóa / Mở</th>
              </tr>
            </thead>
            <tbody>
              {loading && loginLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    Đang tải nhật ký...
                  </td>
                </tr>
              ) : logsPag.slice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    {loginLogs.length === 0
                      ? 'Chưa có log nào trong 24 giờ qua'
                      : 'Không có log khớp bộ lọc'}
                  </td>
                </tr>
              ) : (
                logsPag.slice.map((log) => {
                  const logUser = log.userId ? users.find((u) => u.id === log.userId) : undefined
                  return (
                    <tr key={log.id} className="border-b border-border/40 hover:bg-brand-50/30">
                      <td className="px-4 py-2 text-xs text-muted whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">{log.email ?? '—'}</td>
                      <td className="px-4 py-2">
                        <OutcomeBadge outcome={log.outcome} />
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-muted">{log.ipAddress ?? '—'}</td>
                      <td className="px-4 py-2 text-xs text-muted">{log.reason ?? '—'}</td>
                      <td className="px-4 py-2 text-right">
                        {logUser && (
                          <Button
                            variant="secondary"
                            style={toggleBtnStyleCompact(logUser.active)}
                            onClick={() => void toggleActive(logUser)}
                            aria-label={
                              logUser.active
                                ? `Vô hiệu hóa tài khoản ${log.email ?? logUser.id}`
                                : `Kích hoạt tài khoản ${log.email ?? logUser.id}`
                            }
                          >
                            {logUser.active ? 'Tắt' : 'Bật'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile card list (<md) ──────────────────────────── */}
        <div className="md:hidden divide-y divide-border/40">
          {logsPag.slice.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              {loginLogs.length === 0
                ? 'Chưa có log nào trong 24 giờ qua'
                : 'Không có log khớp bộ lọc'}
            </p>
          ) : (
            logsPag.slice.map((log) => {
              const logUser = log.userId ? users.find((u) => u.id === log.userId) : undefined
              return (
                <div key={log.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <OutcomeBadge outcome={log.outcome} />
                      <span className="truncate font-mono text-xs text-text font-semibold">
                        {log.email ?? '—'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {log.ipAddress ?? '—'}
                      {log.reason ? ` · ${log.reason}` : ''}
                    </p>
                  </div>
                  {logUser && (
                    <Button
                      variant="secondary"
                      style={toggleBtnStyleCompact(logUser.active)}
                      onClick={() => void toggleActive(logUser)}
                      aria-label={
                        logUser.active
                          ? `Vô hiệu hóa ${log.email ?? logUser.id}`
                          : `Kích hoạt ${log.email ?? logUser.id}`
                      }
                    >
                      {logUser.active ? 'Tắt' : 'Bật'}
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>

        <Paginator
          page={logsPag.page}
          totalPages={logsPag.totalPages}
          totalItems={filteredLogs.length}
          pageSize={20}
          onPrev={logsPag.prev}
          onNext={logsPag.next}
          onGoTo={logsPag.goTo}
        />
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
