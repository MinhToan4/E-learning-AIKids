import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, Check, Plus, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import {
  buildCourseAgeGroups,
  courseAgeGroupId,
} from '@/features/parent/lib/course-age-groups'
import type { Child, CourseItem, CoursePaymentState } from '@/features/parent/types/parent.types'

export function CourseSelectModal({
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
        ? (rawStatus as CoursePaymentState['status'])
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
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
              ) : (
                visibleCourses.map((course) => {
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
                        onClick={() =>
                          void (isPaid
                            ? payment && payment.status !== 'failed'
                              ? refreshPaymentStatus(course, payment)
                              : purchaseCourse(course)
                            : toggleCourse(course.id, course.enrolled))
                        }
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
                        aria-label={`${course.enrolled ? 'Bỏ' : isPaid ? (isPaymentPending ? 'Kiểm tra thanh toán' : 'Mua và mở khóa') : 'Thêm'} khóa ${course.title}`}
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
                })
              )}
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
