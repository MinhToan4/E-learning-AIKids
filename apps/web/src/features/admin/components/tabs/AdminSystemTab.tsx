import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import {
  CmsAiIcon,
  CmsClassesIcon,
  CmsCoursesIcon,
  CmsLecturesIcon,
  CmsLogsIcon,
  CmsUsersIcon,
} from '@/shared/components/icons/CmsIcons'
import { StatCard, MiniBar } from '../AdminUiHelpers'
import { ROLE_LABELS, type SystemInfo } from '../../types'

export function AdminSystemTab() {
  const navigate = useNavigate()
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSystemInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ system: SystemInfo }>('/api/admin/system')
      setSystem(data.system)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin hệ thống')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSystemInfo()
  }, [fetchSystemInfo])

  if (loading && !system) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="ui-skeleton h-12 w-52 rounded-2xl" />
      </div>
    )
  }

  if (error && !system) {
    return (
      <div className="ui-card p-6 text-center border-2 border-coral-200 bg-coral-50">
        <p className="text-sm font-bold text-danger">{error}</p>
        <button
          type="button"
          onClick={() => void fetchSystemInfo()}
          className="mt-3 rounded-xl bg-brand-500 px-4 py-2 text-xs font-black text-white hover:bg-brand-600 transition"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!system) return null

  return (
    <div className="flex flex-col gap-5">
      {/* ── Ưu tiên hôm nay / Việc cần xử lý ────────────────── */}
      <section className="ui-card p-5" aria-labelledby="admin-attention-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              Ưu tiên hôm nay
            </p>
            <h2 id="admin-attention-title" className="mt-1 font-display text-xl text-text">
              Việc cần xử lý & Điều phối
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-muted">
              Cập nhật {new Date(system.time).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            className="min-h-24 rounded-2xl border-2 border-border bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50 cursor-pointer"
            onClick={() => navigate('/admin/users')}
          >
            <span className="flex items-center gap-2 font-bold text-text">
              <CmsUsersIcon /> Tài khoản chờ duyệt
            </span>
            <span className="mt-2 block text-2xl font-display text-brand-600">
              {system.counts.pendingApprovals}
            </span>
            <span className="mt-1 block text-xs text-muted">Xem và xử lý tài khoản mới</span>
          </button>

          <button
            type="button"
            className="min-h-24 rounded-2xl border-2 border-border bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50 cursor-pointer"
            onClick={() => navigate('/admin/logs')}
          >
            <span className="flex items-center gap-2 font-bold text-text">
              <CmsLogsIcon /> Kiểm tra đăng nhập
            </span>
            <span className="mt-2 block text-sm font-bold text-brand-600">
              Xem sự cố trong 24 giờ
            </span>
            <span className="mt-1 block text-xs text-muted">Tìm đăng nhập thất bại hoặc bị khóa</span>
          </button>

          <button
            type="button"
            className={cn(
              'min-h-24 rounded-2xl border-2 p-4 text-left transition cursor-pointer',
              system.vidtory?.configured
                ? 'border-mint-200 bg-mint-100/50 hover:bg-mint-100'
                : 'border-sun-200 bg-sun-50 hover:bg-sun-100',
            )}
            onClick={() => navigate('/admin/ai')}
          >
            <span className="flex items-center gap-2 font-bold text-text">
              <CmsAiIcon /> Dịch vụ tạo nội dung AI
            </span>
            <span
              className={cn(
                'mt-2 block text-sm font-bold',
                system.vidtory?.configured ? 'text-success' : 'text-warning',
              )}
            >
              {system.vidtory?.configured ? 'Đã kết nối' : 'Cần cấu hình'}
            </span>
            <span className="mt-1 block text-xs text-muted">Mở thiết lập & kiểm tra kết nối</span>
          </button>
        </div>
      </section>

      {/* ── Thống kê tổng số lượng (Stat Cards) ──────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Khóa học', value: system.counts.courses, icon: <CmsCoursesIcon /> },
          { label: 'Bài học', value: system.counts.quests, icon: <CmsLecturesIcon /> },
          { label: 'Lớp học', value: system.counts.classes, icon: <CmsClassesIcon /> },
          { label: 'Tài khoản chờ duyệt', value: system.counts.pendingApprovals, icon: <CmsUsersIcon /> },
        ].map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Trạng thái Microservices & Phân bố tài khoản ─────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Người dùng theo vai trò */}
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">
            Người dùng theo vai trò
          </p>
          <div className="flex flex-col gap-3">
            {Object.entries(system.counts.usersByRole).map(([role, n]) => {
              const max = Math.max(...Object.values(system.counts.usersByRole), 1)
              const colorMap: Record<string, string> = {
                student: 'bg-brand-500',
                child: 'bg-brand-500',
                teacher: 'bg-sky-400',
                parent: 'bg-mint-400',
                admin: 'bg-coral-400',
              }
              return (
                <MiniBar
                  key={role}
                  label={ROLE_LABELS[role] ?? role}
                  value={n}
                  max={max}
                  color={colorMap[role] ?? 'bg-brand-500'}
                />
              )
            })}
          </div>
        </div>

        {/* Trạng thái Microservices & Kết nối */}
        <div className="ui-card p-5 flex flex-col justify-between">
          <div>
            <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted">
              Hạ Tầng Microservices & NATS
            </p>

            <div className="space-y-3">
              {/* Vidtory AI Engine */}
              <div
                className={cn(
                  'flex items-center gap-3 rounded-2xl p-3 border',
                  system.vidtory?.configured
                    ? 'border-mint-200 bg-mint-50'
                    : 'border-sun-200 bg-sun-50',
                )}
              >
                <CmsAiIcon size={26} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-text">Vidtory AI Gateway</p>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-black',
                        system.vidtory?.configured
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800',
                      )}
                    >
                      {system.vidtory?.configured ? 'Active' : 'Unconfigured'}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">
                    {system.vidtory?.configured
                      ? `Hint: ${system.vidtory.maskedHint ?? '••••'} · Nguồn: ${system.vidtory.source}`
                      : 'Cần thiết lập API Key trong tab Điều phối AI'}
                  </p>
                </div>
              </div>

              {/* NATS Event Bus & Backend Service */}
              <div className="flex items-center gap-3 rounded-2xl p-3 border border-sky-100 bg-sky-50/50">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 text-sm font-black">
                  ⚡
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-text">NATS Event Mesh & Core API</p>
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">
                    Dịch vụ: {system.service} · Đang phục vụ các trạm học real-time
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted">
            <span>Phiên bản CMS: 2.1.0-softclay</span>
            <span>Giờ hệ thống: {new Date(system.time).toLocaleTimeString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
