import React, { type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Paginator } from '@/shared/components/ui/Paginator'
import { cn } from '@/shared/lib/cn'
import {
  CmsAnalyticsIcon,
  CmsCoursesIcon,
  CmsLecturesIcon,
  CmsUsersIcon,
} from '@/shared/components/icons/CmsIcons'
import type { usePagination } from '@/shared/hooks/usePagination'

export type ClassStats = {
  className: string
  code: string
  studentCount: number
  totalCompletedQuests: number
  openQuestCount: number
  projectCount: number
  students: Array<{
    id: string
    nickname: string | null
    level: number
    xp: number
    completedQuests: number
    currentQuest: string | null
    currentPhase: string | null
    lastActiveAt: string | null
    needsSupport: boolean
    supportReason: string | null
  }>
}

export function StatCard({ label, value, icon }: { label: string; value: number | string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <span aria-hidden="true">{icon}</span>
      </div>
      <p className="font-display text-3xl text-sky-600">{value}</p>
    </div>
  )
}

export interface TeacherStatsTabProps {
  stats: ClassStats | null
  statsSearch: string
  setStatsSearch: (v: string) => void
  statsSupportFilter: '' | 'needs' | 'ok'
  setStatsSupportFilter: (v: '' | 'needs' | 'ok') => void
  filteredStatStudents: ClassStats['students']
  statStudents: ClassStats['students']
  statsPag: ReturnType<typeof usePagination<ClassStats['students'][number]>>
  viewProgress: (id: string) => Promise<void>
  formatActivity: (value: string | null) => string
  phaseLabels: Record<string, string>
}

export function TeacherStatsTab({
  stats,
  statsSearch,
  setStatsSearch,
  statsSupportFilter,
  setStatsSupportFilter,
  filteredStatStudents,
  statStudents,
  statsPag,
  viewProgress,
  formatActivity,
  phaseLabels,
}: TeacherStatsTabProps) {
  return (
    <div className="ui-card min-w-0 p-3 sm:p-5">
      <h2 className="font-display mb-4 text-xl">Thống kê lớp học</h2>
      {!stats ? (
        <EmptyState
          title="Chưa có dữ liệu thống kê"
          description="Hãy tạo lớp học và thêm học sinh để xem thống kê tiến trình tại đây."
        />
      ) : (
        <>
          <p className="mb-4 font-bold">{stats.className} · <span className="font-mono text-sky-600">{stats.code}</span></p>
          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <StatCard label="Học sinh" value={stats.studentCount} icon={<CmsUsersIcon />} />
            <StatCard label="Trạm hoàn thành" value={stats.totalCompletedQuests} icon={<CmsAnalyticsIcon />} />
            <StatCard label="Bài học đang mở" value={stats.openQuestCount} icon={<CmsLecturesIcon />} />
            <StatCard label="Sản phẩm" value={stats.projectCount} icon={<CmsCoursesIcon />} />
          </div>
          {/* Stats search + support filter */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[200px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                <Search size={17} aria-hidden="true" />
              </span>
              <input
                type="search"
                aria-label="Tìm học sinh trong thống kê"
                placeholder="Tìm học sinh..."
                value={statsSearch}
                onChange={(e) => setStatsSearch(e.target.value)}
                className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
              />
            </div>
            <select
              aria-label="Lọc học sinh cần hỗ trợ"
              className="min-h-11 w-full rounded-xl border-2 border-border bg-white px-3 text-sm font-bold sm:w-auto"
              value={statsSupportFilter}
              onChange={(e) => setStatsSupportFilter(e.target.value as '' | 'needs' | 'ok')}
            >
              <option value="">Tất cả</option>
              <option value="needs">Cần hỗ trợ</option>
              <option value="ok">Tiến triển tốt</option>
            </select>
            {(statsSearch || statsSupportFilter) && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
                {filteredStatStudents.length} / {statStudents.length} học sinh
              </span>
            )}
            {(statsSearch || statsSupportFilter) && (
              <button
                type="button"
                className="text-xs font-bold text-muted underline cursor-pointer"
                onClick={() => { setStatsSearch(''); setStatsSupportFilter('') }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="border-b border-border bg-sky-50/60">
                <tr>
                  <th className="px-3 py-2 font-extrabold">Học sinh</th>
                  <th className="px-3 py-2 font-extrabold">Trạm hoàn thành</th>
                  <th className="px-3 py-2 font-extrabold">Đang học</th>
                  <th className="px-3 py-2 font-extrabold">Hoạt động gần nhất</th>
                  <th className="px-3 py-2 font-extrabold">Gợi ý hỗ trợ</th>
                </tr>
              </thead>
              <tbody>
                {statsPag.slice.map((s) => (
                  <tr key={s.id} className={cn('border-b border-border/40 transition hover:bg-gray-50/40', s.needsSupport && 'bg-sun-50/30')}>
                    <td className="px-4 py-3 font-bold">{s.nickname}</td>
                    <td className="px-4 py-3 text-center text-muted">{s.completedQuests}</td>
                    <td className="px-4 py-3">
                      <span className="block font-medium">{s.currentQuest ?? '—'}</span>
                      {s.currentPhase && <span className="text-xs text-muted">{phaseLabels[s.currentPhase] ?? 'Đang thực hiện'}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatActivity(s.lastActiveAt)}</td>
                    <td className="px-4 py-3">
                      {s.needsSupport
                        ? <button type="button" className="rounded-lg border border-warning/20 bg-white px-3 py-1 text-xs font-bold text-warning shadow-sm hover:bg-warning/10 cursor-pointer" onClick={() => void viewProgress(s.id)}>Cần xem</button>
                        : <span className="px-2 text-xs font-semibold text-success">Ổn</span>}
                      {s.supportReason && <span className="mt-1 block max-w-48 text-xs text-muted">{s.supportReason}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border p-2">
              <Paginator
                page={statsPag.page}
                totalPages={statsPag.totalPages}
                totalItems={filteredStatStudents.length}
                pageSize={15}
                onPrev={statsPag.prev}
                onNext={statsPag.next}
                onGoTo={statsPag.goTo}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
