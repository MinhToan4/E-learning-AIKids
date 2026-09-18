import { useEffect, useState, useCallback } from 'react'
import { api } from '@/shared/lib/api'
import {
  CmsAnalyticsIcon,
  CmsCoursesIcon,
  CmsLecturesIcon,
  CmsUsersIcon,
} from '@/shared/components/icons/CmsIcons'
import { StatCard, MiniBar, TrendChart } from '../AdminUiHelpers'
import { ROLE_LABELS, type Analytics } from '../../types'

export function AdminAnalyticsTab() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ analytics: Analytics }>('/api/admin/analytics')
      setAnalytics(data.analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải số liệu phân tích')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAnalytics()
  }, [fetchAnalytics])

  if (loading && !analytics) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="ui-skeleton h-12 w-52 rounded-2xl" />
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <div className="ui-card p-6 text-center border-2 border-coral-200 bg-coral-50">
        <p className="text-sm font-bold text-danger">{error}</p>
        <button
          type="button"
          onClick={() => void fetchAnalytics()}
          className="mt-3 rounded-xl bg-brand-500 px-4 py-2 text-xs font-black text-white hover:bg-brand-600 transition"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="flex flex-col gap-5">
      {/* ── Chỉ số tổng quan ───────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Người dùng hoạt động" value={analytics.users.active} icon={<CmsUsersIcon />} />
        <StatCard label="Khóa học đang mở" value={analytics.courses.open} icon={<CmsCoursesIcon />} />
        <StatCard label="Lượt tham gia khóa" value={analytics.learning.enrollments} icon={<CmsAnalyticsIcon />} />
        <StatCard label="Bài học đang dùng" value={analytics.quests.active} icon={<CmsLecturesIcon />} />
        <StatCard label="Bài học đang ẩn" value={analytics.quests.archived} icon={<CmsLecturesIcon />} />
        <StatCard label="Trạm đã hoàn thành" value={analytics.learning.completedProgress} icon={<CmsAnalyticsIcon />} />
        <StatCard label="Sản phẩm học tập" value={analytics.learning.projects} icon={<CmsCoursesIcon />} />
      </div>

      {/* ── Biểu đồ xu hướng và phân bổ ───────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart rows={analytics.trends ?? []} />

        {/* Người dùng theo vai trò */}
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">
            Người dùng theo vai trò
          </p>
          <div className="flex flex-col gap-3">
            {Object.entries(analytics.users.byRole).map(([role, n]) => {
              const max = Math.max(...Object.values(analytics.users.byRole), 1)
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

        {/* Tiến trình học tập */}
        <div className="ui-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-extrabold uppercase tracking-wide text-muted">
              Tiến độ đào tạo & Thực hành
            </p>
            <button
              type="button"
              onClick={() => void fetchAnalytics()}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 transition"
            >
              Cập nhật lại
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Hoàn thành trạm', value: analytics.learning.completedProgress },
              { label: 'Lượt tham gia khóa', value: analytics.learning.enrollments },
              { label: 'Dự án hoàn thành', value: analytics.learning.projects },
            ].map((item) => {
              const max = Math.max(
                analytics.learning.completedProgress,
                analytics.learning.enrollments,
                analytics.learning.projects,
                1,
              )
              return (
                <MiniBar
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  max={max}
                  color="bg-mint-400"
                />
              )
            })}
          </div>
          <p className="mt-4 pt-3 border-t border-border/40 text-xs text-muted">
            Dữ liệu tổng hợp lúc {new Date(analytics.time).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  )
}
