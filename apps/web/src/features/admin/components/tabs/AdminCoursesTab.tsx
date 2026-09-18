import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { Paginator } from '@/shared/components/ui/Paginator'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { usePagination } from '@/shared/hooks/usePagination'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import type { CourseOverview, CourseReadiness } from '../../types'

export function AdminCoursesTab() {
  const navigate = useNavigate()
  const { toasts, showToast, dismissToast } = useToast()
  const [courses, setCourses] = useState<CourseOverview[]>([])
  const [loading, setLoading] = useState(false)
  const coursesRef = useRef(courses)
  coursesRef.current = courses

  // Filters
  const [courseSearch, setCourseSearch] = useState('')
  const [courseStatusFilter, setCourseStatusFilter] = useState<'' | 'open' | 'soon'>('')

  // Course readiness & status toggle
  const [checkingCourseId, setCheckingCourseId] = useState<string | null>(null)
  const [courseReadiness, setCourseReadiness] = useState<CourseReadiness | null>(null)

  // Course offer / pricing panel
  const [offerTarget, setOfferTarget] = useState<string | null>(null)
  const [offerForm, setOfferForm] = useState({
    accessPolicy: 'free',
    priceAmountMinor: '0',
    priceCurrency: 'vnd',
    visibility: 'public',
    teacherGrantPolicy: 'allowed',
  })

  const fetchCourses = useCallback(async () => {
    if (coursesRef.current.length === 0) {
      setLoading(true)
    }
    try {
      const data = await api<{ courses: CourseOverview[] }>('/api/admin/courses')
      setCourses(data.courses)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tải danh sách khóa học', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void fetchCourses()
  }, [fetchCourses])

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        !courseSearch.trim() ||
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        (c.courseKey ?? '').toLowerCase().includes(courseSearch.toLowerCase())
      const matchStatus = !courseStatusFilter || c.status === courseStatusFilter
      return matchSearch && matchStatus
    })
  }, [courses, courseSearch, courseStatusFilter])

  const coursesPag = usePagination(filteredCourses, 8)

  async function setCourseStatus(id: string, status: 'open' | 'soon') {
    if (status === 'open') {
      setCheckingCourseId(id)
      try {
        const readiness = await api<CourseReadiness>(`/api/admin/courses/${id}/readiness`)
        if (!readiness.ready) {
          setCourseReadiness(readiness)
          showToast('Giáo trình chưa đạt tiêu chuẩn để mở cho học sinh', 'error')
          return
        }
      } catch {
        showToast('Không kiểm tra được tiêu chuẩn giáo trình', 'error')
        return
      } finally {
        setCheckingCourseId(null)
      }
    }
    try {
      await api(`/api/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      showToast(`Đã ${status === 'open' ? 'mở' : 'ẩn'} khóa học`, 'success')
      await fetchCourses()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không đổi được trạng thái', 'error')
    }
  }

  function openCourseOffer(course: CourseOverview) {
    setOfferTarget(course.id)
    setOfferForm({
      accessPolicy: course.accessPolicy ?? 'free',
      priceAmountMinor: course.priceAmountMinor ?? '0',
      priceCurrency: course.priceCurrency ?? 'vnd',
      visibility: course.visibility ?? 'public',
      teacherGrantPolicy: course.teacherGrantPolicy ?? 'allowed',
    })
  }

  async function saveCourseOffer() {
    if (!offerTarget) return
    try {
      await api(`/api/admin/courses/${offerTarget}`, {
        method: 'PATCH',
        body: JSON.stringify(offerForm),
      })
      showToast('Đã lưu cấu hình phân phối khóa học', 'success')
      setOfferTarget(null)
      await fetchCourses()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không lưu được cấu hình bán', 'error')
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-3">
        {/* Course search + status filter bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              <Search size={17} aria-hidden="true" />
            </span>
            <input
              type="search"
              aria-label="Tìm khóa học"
              placeholder="Tìm tên khóa học hoặc chặng..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
            />
          </div>

          <select
            aria-label="Lọc khóa học theo trạng thái"
            className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold bg-white"
            value={courseStatusFilter}
            onChange={(e) => setCourseStatusFilter(e.target.value as '' | 'open' | 'soon')}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="open">Đang mở</option>
            <option value="soon">Đang ẩn</option>
          </select>

          {(courseSearch || courseStatusFilter) && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
              {filteredCourses.length} khóa học
            </span>
          )}

          {(courseSearch || courseStatusFilter) && (
            <button
              type="button"
              className="text-xs font-bold text-muted underline cursor-pointer"
              onClick={() => {
                setCourseSearch('')
                setCourseStatusFilter('')
              }}
            >
              Xóa bộ lọc
            </button>
          )}

          <Button variant="secondary" onClick={() => void fetchCourses()}>
            Làm mới
          </Button>
        </div>

        {/* Course cards list */}
        {loading && courses.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <div className="ui-skeleton h-12 w-48 rounded-2xl" />
          </div>
        ) : coursesPag.slice.length === 0 ? (
          <div className="ui-card p-8 text-center text-muted">
            {courses.length === 0 ? 'Chưa có khóa học nào' : 'Không có khóa học khớp bộ lọc'}
          </div>
        ) : (
          coursesPag.slice.map((c) => (
            <div key={c.id} className="ui-card p-4 transition hover:shadow-md">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-text">{c.title}</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {c.ageLabel ?? c.ageTrack ?? 'Chưa cấu hình nhóm tuổi'}
                    {c.courseKey ? ` · Chặng ${c.courseKey}` : ''}
                    {c.enrollmentCount != null ? ` · ${c.enrollmentCount} lượt tham gia` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-3 py-0.5 text-xs font-extrabold',
                      c.status === 'open' ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning',
                    )}
                  >
                    {c.status === 'open' ? 'Đang mở' : 'Đang ẩn'} · {c.questCount} bài
                  </span>

                  <Button
                    variant="secondary"
                    disabled={checkingCourseId === c.id}
                    onClick={() => void setCourseStatus(c.id, c.status === 'open' ? 'soon' : 'open')}
                  >
                    {checkingCourseId === c.id
                      ? 'Đang kiểm tra...'
                      : c.status === 'open'
                        ? 'Ẩn khỏi học sinh'
                        : 'Mở cho học sinh'}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/teacher/courses?courseId=${encodeURIComponent(c.id)}`)}
                  >
                    ✏️ Soạn Trạm Học
                  </Button>

                  <Button variant="secondary" onClick={() => openCourseOffer(c)}>
                    Phân phối & bán
                  </Button>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold text-muted">
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">
                  {c.accessPolicy === 'paid'
                    ? `${Number(c.priceAmountMinor ?? 0).toLocaleString('vi-VN')} ${(c.priceCurrency ?? 'vnd').toUpperCase()}`
                    : 'Miễn phí'}
                </span>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
                  Hiển thị: {c.visibility ?? 'public'}
                </span>
                <span className="rounded-full bg-mint-50 px-2.5 py-1 text-mint-800">
                  Giáo viên cấp: {c.teacherGrantPolicy ?? 'allowed'}
                </span>
              </div>

              <ul className="space-y-1.5 text-sm">
                {c.quests.map((q) => (
                  <li
                    key={q.id}
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50/60 px-3 py-2 border border-brand-100/50',
                      q.archived ? 'opacity-50' : '',
                    )}
                  >
                    <span className="font-bold text-xs">
                      #{q.order} {q.title}
                      {q.archived ? ' [đã ẩn]' : ''}
                    </span>
                    <span className="max-w-[200px] truncate text-xs text-muted">
                      {q.videoUrl ? '✓ Đã có video' : '○ Chưa có video'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}

        <Paginator
          page={coursesPag.page}
          totalPages={coursesPag.totalPages}
          totalItems={filteredCourses.length}
          pageSize={8}
          onPrev={coursesPag.prev}
          onNext={coursesPag.next}
          onGoTo={coursesPag.goTo}
          className="rounded-2xl border border-border bg-white"
        />
      </div>

      {/* Side panel: Cấu hình bán và phân phối khóa học */}
      {offerTarget ? (
        <div className="ui-card h-fit p-5 xl:sticky xl:top-5 border-2 border-brand-200/80 shadow-clay">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-lg font-black text-text">Cấu hình bán & Cấp quyền</h2>
            <button
              type="button"
              onClick={() => setOfferTarget(null)}
              className="text-muted hover:text-text text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-muted mb-4">
            Thiết lập mô hình truy cập, học phí và chính sách để giáo viên cấp quyền vào lớp.
          </p>

          <div className="space-y-3 text-sm">
            <label className="block font-bold text-text">
              Mô hình truy cập
              <select
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-border px-3 bg-white"
                value={offerForm.accessPolicy}
                onChange={(e) =>
                  setOfferForm((v) => ({
                    ...v,
                    accessPolicy: e.target.value,
                    priceAmountMinor: e.target.value === 'free' ? '0' : v.priceAmountMinor,
                  }))
                }
              >
                <option value="free">Miễn phí</option>
                <option value="paid">Trả phí</option>
                <option value="invite_only">Chỉ được mời</option>
                <option value="organization_only">Theo trường/lớp</option>
              </select>
            </label>

            <label className="block font-bold text-text">
              Học phí (VND)
              <input
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-border px-3 bg-white"
                inputMode="numeric"
                value={offerForm.priceAmountMinor}
                onChange={(e) =>
                  setOfferForm((v) => ({
                    ...v,
                    priceAmountMinor: e.target.value.replace(/\D/g, ''),
                  }))
                }
                disabled={offerForm.accessPolicy !== 'paid'}
              />
            </label>

            <label className="block font-bold text-text">
              Chế độ hiển thị
              <select
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-border px-3 bg-white"
                value={offerForm.visibility}
                onChange={(e) => setOfferForm((v) => ({ ...v, visibility: e.target.value }))}
              >
                <option value="public">Công khai (Public)</option>
                <option value="unlisted">Có liên kết (Unlisted)</option>
                <option value="invite_only">Chỉ lời mời (Invite-only)</option>
                <option value="private">Riêng tư (Private)</option>
                <option value="organization">Theo tổ chức (School)</option>
              </select>
            </label>

            <label className="block font-bold text-text">
              Quyền giáo viên cấp khóa
              <select
                className="mt-1 min-h-11 w-full rounded-xl border-2 border-border px-3 bg-white"
                value={offerForm.teacherGrantPolicy}
                onChange={(e) =>
                  setOfferForm((v) => ({ ...v, teacherGrantPolicy: e.target.value }))
                }
              >
                <option value="allowed">Cho phép giáo viên cấp</option>
                <option value="admin_only">Chỉ quản trị viên tổ chức</option>
                <option value="disabled">Tắt cấp quyền</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <Button className="flex-1 font-bold shadow-clay" onClick={() => void saveCourseOffer()}>
              Lưu thay đổi
            </Button>
            <Button variant="secondary" onClick={() => setOfferTarget(null)}>
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <div className="ui-card h-fit p-5 hidden xl:block border border-dashed border-border text-center text-muted">
          <p className="text-sm font-bold">Chưa chọn khóa học để chỉnh sửa cấu hình bán</p>
          <p className="text-xs mt-1">Bấm "Phân phối & bán" trên một khóa học để mở bảng thiết lập.</p>
        </div>
      )}

      {/* ── Modal kiểm tra độ hoàn thiện của giáo trình ──────── */}
      <AdventureModal
        open={!!courseReadiness}
        tone="guidance"
        eyebrow="Kiểm tra nội dung"
        title="Chưa thể mở giáo trình"
        description="Admin và giáo viên đang dùng cùng một tiêu chuẩn backend. Hãy chuyển sang khu vực biên soạn để hoàn thiện các mục còn thiếu."
        showMascot={false}
        onClose={() => setCourseReadiness(null)}
        actions={
          <Button variant="secondary" onClick={() => setCourseReadiness(null)}>
            Đóng checklist
          </Button>
        }
      >
        <div className="max-h-[56vh] space-y-3 overflow-y-auto pr-1 text-left">
          {courseReadiness?.stations
            .filter((station) => !station.ready)
            .map((station) => (
              <article key={station.id} className="rounded-2xl border-2 border-sun-200 bg-sun-50 p-4">
                <h3 className="font-display text-lg text-text">{station.title}</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {station.missing.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-text"
                    >
                      Còn thiếu: {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
      </AdventureModal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
