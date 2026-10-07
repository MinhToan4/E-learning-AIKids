import React from 'react'
import { Search, X, Shield, Clock } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Paginator } from '@/shared/components/ui/Paginator'
import { cn } from '@/shared/lib/cn'
import type { usePagination } from '@/shared/hooks/usePagination'
import { getAvatarColor, type StudentRow, type ClassStatsStudent } from './types'

export interface ClassStudentsTabProps {
  students: StudentRow[]
  filteredStudents: StudentRow[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  quickFilter: 'all' | 'knight' | 'support'
  setQuickFilter: (f: 'all' | 'knight' | 'support') => void
  sortOption: 'xp' | 'quests' | 'name'
  setSortOption: (s: 'xp' | 'quests' | 'name') => void
  statsStudentMap: Map<string, ClassStatsStudent>
  studentPagination: ReturnType<typeof usePagination<StudentRow>>
  canManageClass: boolean
  handleOpenProgress: (studentId: string) => Promise<void>
  setRemoveTarget: (s: StudentRow | null) => void
}

export function ClassStudentsTab({
  students,
  filteredStudents,
  searchQuery,
  setSearchQuery,
  quickFilter,
  setQuickFilter,
  sortOption,
  setSortOption,
  statsStudentMap,
  studentPagination,
  canManageClass,
  handleOpenProgress,
  setRemoveTarget,
}: ClassStudentsTabProps) {
  return (
    <section className="ui-card overflow-hidden border border-border shadow-xs">
      {/* Smart Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3.5 bg-slate-50/50">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            <Search size={16} aria-hidden="true" />
          </span>
          <input
            type="search"
            aria-label="Tìm học sinh"
            placeholder="Tìm biệt danh hoặc ID học sinh…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-10 rounded-xl border-2 border-border bg-white pl-9 pr-8 text-sm outline-none transition focus:border-brand-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5" role="group" aria-label="Bộ lọc nhanh">
          <button
            type="button"
            onClick={() => setQuickFilter('all')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition border cursor-pointer',
              quickFilter === 'all'
                ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                : 'bg-white text-slate-600 border-border hover:bg-slate-50',
            )}
          >
            Tất cả
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter('knight')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition border cursor-pointer flex items-center gap-1',
              quickFilter === 'knight'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-border hover:bg-emerald-50 hover:text-emerald-700',
            )}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Đạt Hiệp Sĩ</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter('support')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition border cursor-pointer flex items-center gap-1',
              quickFilter === 'support'
                ? 'bg-coral-600 text-white border-coral-600 shadow-xs'
                : 'bg-white text-slate-600 border-border hover:bg-coral-50 hover:text-coral-700',
            )}
          >
            <span className="h-2 w-2 rounded-full bg-coral-500 inline-block" />
            <span>Cần hỗ trợ</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <select
          aria-label="Sắp xếp danh sách học sinh"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as 'xp' | 'quests' | 'name')}
          className="min-h-10 rounded-xl border-2 border-border bg-white px-3 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="xp">Theo XP cao nhất</option>
          <option value="quests">Theo số trạm hoàn thành</option>
          <option value="name">Biệt danh A-Z</option>
        </select>

        {/* Filter Results Count Indicator */}
        {(searchQuery || quickFilter !== 'all') && (
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 border border-brand-200">
            {filteredStudents.length} / {students.length} học sinh
          </span>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm" aria-label="Bảng học sinh">
          <thead className="bg-sky-50/70 text-slate-700 text-xs font-extrabold uppercase tracking-wide border-b border-border">
            <tr>
              <th className="px-4 py-3">Học sinh</th>
              <th className="px-4 py-3">Cấp độ & XP</th>
              <th className="px-4 py-3">Thành tích</th>
              <th className="px-4 py-3">Quy tắc Vàng</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-white">
            {studentPagination.slice.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  {students.length === 0 ? (
                    <div className="space-y-2">
                      <p className="font-bold text-slate-700">Chưa có học sinh nào trong lớp</p>
                      <p className="text-xs">Nhấn "+ Thêm học sinh" hoặc chia sẻ mã lớp để các bé tham gia.</p>
                    </div>
                  ) : (
                    'Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại'
                  )}
                </td>
              </tr>
            ) : (
              studentPagination.slice.map((s) => {
                const isKnight = s.completedQuests > 0
                const statInfo = statsStudentMap.get(s.id)
                const needsSupport = statInfo?.needsSupport ?? false
                const nickname = s.nickname || 'Học sinh'
                const initial = (nickname.trim()[0] || 'K').toUpperCase()

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    {/* Student Name & Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-base font-black',
                            getAvatarColor(nickname),
                          )}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 truncate">{nickname}</span>
                            {needsSupport && (
                              <span
                                className="rounded-full bg-coral-100 px-1.5 py-0.2 text-[10px] font-bold text-coral-700 border border-coral-200"
                                title={statInfo?.supportReason || 'Cần hỗ trợ sư phạm'}
                              >
                                Cần hỗ trợ
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted font-mono">ID: {s.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>

                    {/* Level & XP */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-black text-purple-700 border border-purple-200">
                            Lv{s.level}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{s.xp} XP</span>
                        </div>
                        <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-brand-500"
                            style={{ width: `${Math.min((s.xp % 100), 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Achievements */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-700">
                        {s.completedQuests} trạm · {s.totalStars} ⭐ · {s.projectCount} 🎨
                      </span>
                    </td>

                    {/* Golden Rule Knight Status */}
                    <td className="px-4 py-3">
                      {isKnight ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                          <Shield className="h-3.5 w-3.5 text-emerald-600" />
                          <span>🛡️ Hiệp Sĩ AIKI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>⏳ Đang học quy tắc</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          className="!min-h-8 !px-2.5 !text-xs font-bold text-brand-700 hover:bg-brand-50"
                          onClick={() => void handleOpenProgress(s.id)}
                        >
                          🔍 Chi tiết
                        </Button>
                        {canManageClass && (
                          <Button
                            variant="ghost"
                            className="!min-h-8 !px-2.5 !text-xs font-bold text-danger hover:bg-rose-50"
                            onClick={() => setRemoveTarget(s)}
                          >
                            🗑️ Gỡ
                          </Button>
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

      {/* Mobile Card List View */}
      <div className="divide-y divide-border/60 sm:hidden">
        {studentPagination.slice.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            {students.length === 0 ? 'Chưa có học sinh nào' : 'Không có học sinh khớp tìm kiếm'}
          </p>
        ) : (
          studentPagination.slice.map((s) => {
            const isKnight = s.completedQuests > 0
            const statInfo = statsStudentMap.get(s.id)
            const needsSupport = statInfo?.needsSupport ?? false
            const nickname = s.nickname || 'Học sinh'
            const initial = (nickname.trim()[0] || 'K').toUpperCase()

            return (
              <article key={s.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black',
                        getAvatarColor(nickname),
                      )}
                    >
                      {initial}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{nickname}</p>
                      <p className="text-[11px] text-muted font-mono">ID: {s.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-black text-purple-700 border border-purple-200">
                    Lv{s.level} · {s.xp} XP
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700">
                    {s.completedQuests} trạm · {s.totalStars} ⭐ · {s.projectCount} 🎨
                  </span>
                  {needsSupport && (
                    <span className="rounded-full bg-coral-100 px-2 py-0.5 font-bold text-coral-800 border border-coral-200">
                      Cần hỗ trợ
                    </span>
                  )}
                </div>

                <div className="pt-1">
                  {isKnight ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                      🛡️ Hiệp Sĩ AIKI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                      ⏳ Đang học quy tắc
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="secondary"
                    className="w-full !text-xs !min-h-9"
                    onClick={() => void handleOpenProgress(s.id)}
                  >
                    🔍 Chi tiết
                  </Button>
                  {canManageClass && (
                    <Button
                      variant="ghost"
                      className="w-full !text-xs !min-h-9 text-danger"
                      onClick={() => setRemoveTarget(s)}
                    >
                      🗑️ Gỡ
                    </Button>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>

      {/* Pagination */}
      <Paginator
        page={studentPagination.page}
        totalPages={studentPagination.totalPages}
        totalItems={filteredStudents.length}
        pageSize={10}
        onPrev={studentPagination.prev}
        onNext={studentPagination.next}
        onGoTo={studentPagination.goTo}
      />
    </section>
  )
}
