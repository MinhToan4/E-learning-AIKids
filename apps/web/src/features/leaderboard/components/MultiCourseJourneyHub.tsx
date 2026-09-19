import { useState, useMemo } from 'react'
import type { LearningPathwayCourse } from '@/shared/lib/learning-api'
import {
  SoftClayStarIcon,
  SoftClayFlagIcon,
  SoftClayCheckIcon,
  SoftClayLockIcon,
} from './ProgressPassportIcons'

export interface MultiCourseJourneyHubProps {
  courses: LearningPathwayCourse[]
  selectedCourseId: string | null
  onSelectCourse: (courseId: string) => void
}

type TabType = 'active' | 'completed' | 'available'

export function MultiCourseJourneyHub({
  courses,
  selectedCourseId,
  onSelectCourse,
}: MultiCourseJourneyHubProps) {
  // Phân loại các khóa học vào 3 nhóm
  const categorized = useMemo(() => {
    const active: LearningPathwayCourse[] = []
    const completed: LearningPathwayCourse[] = []
    const available: LearningPathwayCourse[] = []

    courses.forEach((c) => {
      const isCompleted = c.status === 'completed' || c.completionPercent >= 100
      if (isCompleted) {
        completed.push(c)
      } else if (c.status === 'active' || c.enrolled) {
        active.push(c)
      } else {
        available.push(c)
      }
    })

    return { active, completed, available }
  }, [courses])

  // Chọn tab khởi tạo hợp lý
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (categorized.active.length > 0) return 'active'
    if (categorized.completed.length > 0) return 'completed'
    return 'available'
  })

  // Đảm bảo nếu tab hiện tại rỗng nhưng tab khác có dữ liệu thì chuyển nếu cần,
  // hoặc giữ nguyên tab người dùng vừa click
  const currentList = categorized[activeTab]

  return (
    <section
      className="ui-card rounded-3xl border-3 border-white/90 bg-linear-to-br from-white via-slate-50/70 to-brand-50/30 p-5 sm:p-6 md:p-7 shadow-clay w-full min-w-0"
      aria-labelledby="journey-hub-title"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-brand-700">
            <span className="flex h-2.5 w-2.5 rounded-full bg-brand-500" />
            <span>Trung Tâm Đa Khóa Học</span>
          </div>
          <h2
            id="journey-hub-title"
            className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mt-1"
          >
            Hành Trình Khám Phá Của Học Sinh
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            Chọn một khóa học bên dưới để mở sổ tay bản đồ trạm học chi tiết.
          </p>
        </div>

        {/* 3 Tabs Phân Nhóm Khóa Học */}
        <div
          role="tablist"
          aria-label="Phân loại hành trình khóa học"
          className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100/90 p-1.5 border border-slate-200/80 shrink-0"
        >
          {/* Tab 1: Đang học */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'active'}
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all ${
              activeTab === 'active'
                ? 'bg-white text-brand-700 shadow-sm border border-brand-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <SoftClayFlagIcon size={16} />
            <span>Đang Học</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-2xs font-extrabold ${
                activeTab === 'active' ? 'bg-brand-100 text-brand-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {categorized.active.length}
            </span>
          </button>

          {/* Tab 2: Đã Chinh Phục */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'completed'}
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <SoftClayCheckIcon size={16} />
            <span>Đã Chinh Phục</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-2xs font-extrabold ${
                activeTab === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {categorized.completed.length}
            </span>
          </button>

          {/* Tab 3: Sắp Khám Phá */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'available'}
            onClick={() => setActiveTab('available')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all ${
              activeTab === 'available'
                ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <SoftClayLockIcon size={16} />
            <span>Sắp Khám Phá</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-2xs font-extrabold ${
                activeTab === 'available' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {categorized.available.length}
            </span>
          </button>
        </div>
      </div>

      {/* Lưới thẻ khóa học Soft Clay */}
      <div className="mt-5">
        {currentList.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-8 text-center">
            <p className="font-display text-base sm:text-lg font-bold text-slate-700">
              {activeTab === 'completed'
                ? 'Học sinh chưa hoàn thành khóa học nào. Hãy tiếp tục kiên trì học từng trạm nhé!'
                : activeTab === 'active'
                ? 'Hiện chưa có khóa học đang mở dở. Cùng khám phá các hành trình mới bên dưới nào!'
                : 'Tất cả các khóa học hiện tại đã được học sinh bắt đầu khám phá!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {currentList.map((course) => {
              const isSelected = course.id === selectedCourseId
              const percent = Math.min(100, Math.max(0, Math.round(course.completionPercent)))
              const totalQuests = course.questCount ?? (course.stations ? course.stations.length : 0)
              const completedQuests = course.completedCount ?? 0

              return (
                <article
                  key={course.id}
                  onClick={() => onSelectCourse(course.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectCourse(course.id)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  className={`group relative flex flex-col justify-between rounded-3xl border-3 p-4 sm:p-5 text-left transition-all cursor-pointer focus:outline-hidden min-w-0 ${
                    isSelected
                      ? 'border-brand-500 bg-linear-to-b from-brand-50/80 to-purple-50/50 shadow-clay ring-4 ring-brand-300/40 translate-y-[-2px]'
                      : 'border-slate-200/90 bg-white hover:border-brand-300 hover:shadow-soft active:scale-[0.99]'
                  }`}
                >
                  {/* Badge "Đang xem bản đồ" khi được chọn */}
                  {isSelected && (
                    <div className="absolute -top-3 right-4 rounded-full border-2 border-white bg-brand-500 px-3 py-0.5 text-2xs font-black text-white shadow-xs">
                      Đang xem bản đồ
                    </div>
                  )}

                  <div>
                    {/* Header Thẻ: Icon/Bìa + Status */}
                    <div className="flex items-center gap-3">
                      {course.coverImage ? (
                        <img
                          src={course.coverImage}
                          alt=""
                          className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                      ) : (
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                            isSelected
                              ? 'bg-brand-100 border-brand-300 text-brand-700'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          <SoftClayFlagIcon size={24} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-2">
                          {course.shortTitle || course.title}
                        </h3>
                        <p className="text-2xs font-bold text-slate-500 mt-0.5">
                          {course.status === 'completed' || percent >= 100
                            ? 'Đã chinh phục'
                            : course.status === 'active' || course.enrolled
                            ? 'Đang phiêu lưu'
                            : 'Sắp tới'}
                        </p>
                      </div>
                    </div>

                    {/* Chỉ số trạm & sao */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-700">
                      {totalQuests > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100/90 px-2.5 py-1 text-slate-700">
                          <SoftClayFlagIcon size={14} />
                          <span>
                            {completedQuests}/{totalQuests} Trạm
                          </span>
                        </span>
                      )}

                      {typeof course.totalStars === 'number' && course.totalStars > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-amber-800 border border-amber-200">
                          <SoftClayStarIcon size={14} />
                          <span>{course.totalStars} Sao</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thanh tiến độ bên dưới */}
                  <div className="mt-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Tiến độ</span>
                      <span className="font-black text-brand-700">{percent}%</span>
                    </div>
                    <div
                      className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 100 ? 'bg-emerald-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
