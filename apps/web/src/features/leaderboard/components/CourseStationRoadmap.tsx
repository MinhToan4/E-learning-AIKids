import { Link } from 'react-router'
import type { QuestProgress } from '@/shared/lib/api'
import type { LearningPathwayCourse } from '@/shared/lib/learning-api'
import {
  SoftClayStarIcon,
  SoftClayFlagIcon,
  SoftClayLockIcon,
  SoftClayCheckIcon,
  SoftClayRocketIcon,
  SoftClaySproutIcon,
} from './ProgressPassportIcons'

export interface CourseStationRoadmapProps {
  course: LearningPathwayCourse
  stations: QuestProgress[]
  loading?: boolean
}

export function CourseStationRoadmap({
  course,
  stations,
  loading = false,
}: CourseStationRoadmapProps) {
  // Tìm trạm đang học dở hoặc trạm available đầu tiên
  const currentStationIndex = stations.findIndex(
    (s) => s.status === 'in_progress' || s.status === 'available'
  )

  const activeStationIndex = currentStationIndex !== -1
    ? currentStationIndex
    : stations.findIndex((s) => s.status !== 'completed')

  return (
    <section
      className="course-station-roadmap ui-card rounded-3xl border-3 border-white/90 bg-linear-to-br from-[#fcfbf7] via-white to-amber-50/30 p-5 sm:p-7 shadow-clay w-full min-w-0"
      aria-labelledby="course-roadmap-title"
    >
      {/* Header Sổ Tay Lộ Trình */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-black text-brand-800">
            <SoftClayFlagIcon size={16} />
            <span>Sổ Tay Lộ Trình Trạm Học</span>
          </div>
          <h3
            id="course-roadmap-title"
            className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-2"
          >
            {course.shortTitle || course.title}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            Chinh phục từng trạm nhỏ để tích lũy ngôi sao và mở khóa tri thức mới.
          </p>
        </div>

        {/* Tóm tắt số trạm */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-center shadow-2xs">
            <p className="text-2xs font-extrabold text-slate-500 uppercase tracking-wide">Số trạm</p>
            <p className="font-display text-lg font-black text-slate-800">
              {stations.length}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-center shadow-2xs">
            <p className="text-2xs font-extrabold text-amber-700 uppercase tracking-wide">Đã đạt</p>
            <p className="font-display text-lg font-black text-amber-900 flex items-center justify-center gap-1">
              <span>{stations.filter((s) => s.status === 'completed' || s.stars > 0).length}</span>
              <SoftClayStarIcon size={16} />
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách trạm học hoặc Loading */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="font-display text-base font-bold text-brand-700">
            Đang mở sổ tay trạm học…
          </p>
        </div>
      ) : stations.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/70 p-8 text-center mt-5">
          <p className="font-bold text-slate-600">
            Khóa học này đang được chuẩn bị các trạm phiêu lưu mới.
          </p>
          <Link
            to="/world"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-brand-600"
          >
            Xem Bản Đồ Thế Giới
          </Link>
        </div>
      ) : (
        <div className="relative mt-7 space-y-6">
          {/* Trục nối giữa các trạm */}
          <div
            className="absolute top-6 bottom-6 left-5 sm:left-6 w-1 -translate-x-1/2 bg-linear-to-b from-emerald-400 via-brand-400 to-slate-200 rounded-full"
            aria-hidden="true"
          />

          {stations.map((station, index) => {
            const isCompleted = station.status === 'completed' || station.stars > 0
            const isCurrent = index === activeStationIndex
            const isLocked = !isCompleted && !isCurrent

            const lessonUrl = `/world/${encodeURIComponent(course.id)}/lesson/${encodeURIComponent(station.id)}`

            return (
              <div
                key={station.id}
                className={`relative flex items-start gap-3.5 sm:gap-5 min-w-0 transition-all ${
                  isCurrent ? 'scale-[1.01]' : ''
                }`}
              >
                {/* Node Icon đại diện cho trạm */}
                <div className="relative z-1 shrink-0">
                  {isCompleted ? (
                    <div
                      className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-500 border-2 border-emerald-600 text-white shadow-clay"
                      aria-label={`Trạm ${station.order}: Hoàn thành`}
                    >
                      <SoftClayCheckIcon size={24} />
                    </div>
                  ) : isCurrent ? (
                    <div
                      className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-brand-500 border-2 border-brand-600 text-white shadow-clay ring-4 ring-brand-300 animate-pulse"
                      aria-label={`Trạm ${station.order}: Đang học ở đây`}
                    >
                      <SoftClayFlagIcon size={24} />
                    </div>
                  ) : (
                    <div
                      className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-400 shadow-2xs"
                      aria-label={`Trạm ${station.order}: Chưa mở`}
                    >
                      <SoftClayLockIcon size={20} />
                    </div>
                  )}
                </div>

                {/* Nội dung thẻ trạm học */}
                <article
                  className={`flex-1 min-w-0 rounded-2xl sm:rounded-3xl border-2 p-4 sm:p-5 transition-all ${
                    isCurrent
                      ? 'border-brand-400 bg-white shadow-clay ring-2 ring-brand-200'
                      : isCompleted
                      ? 'border-emerald-200 bg-linear-to-r from-emerald-50/40 via-white to-white hover:border-emerald-300'
                      : 'border-slate-200/80 bg-slate-50/60 opacity-85'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Huy hiệu trạm */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`rounded-lg px-2.5 py-0.5 text-2xs font-black uppercase ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCurrent
                              ? 'bg-brand-100 text-brand-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          Trạm {station.order}
                        </span>

                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2.5 py-0.5 text-2xs font-extrabold text-white">
                            <span>Đang học ở đây</span>
                          </span>
                        )}

                        {isCompleted && (
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3].map((starIdx) => (
                              <span
                                key={starIdx}
                                className={starIdx <= (station.stars || 3) ? 'opacity-100' : 'opacity-25'}
                              >
                                <SoftClayStarIcon size={14} />
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tiêu đề trạm */}
                      <h4 className="font-display text-base sm:text-lg font-black text-slate-900 leading-snug break-words">
                        {station.title}
                      </h4>

                      {/* Thông tin kỹ năng & thời lượng */}
                      <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-600">
                        {station.skill && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 border border-slate-200/70 text-slate-700">
                            <SoftClaySproutIcon size={14} />
                            <span>{station.skill}</span>
                          </span>
                        )}
                        {station.duration && (
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <span className="font-bold">Thời lượng:</span>
                            <span>{station.duration}</span>
                          </span>
                        )}
                        {station.reward && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 border border-amber-200/80 text-amber-800 font-bold">
                            <SoftClayStarIcon size={14} />
                            <span>{station.reward}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="shrink-0 pt-1 md:pt-0">
                      {isCurrent ? (
                        <Link
                          to={lessonUrl}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] px-4 sm:px-5 py-2.5 text-sm sm:text-base font-extrabold text-white shadow-clay border-2 border-brand-600 transition-all"
                        >
                          <SoftClayRocketIcon size={18} />
                          <span>Vào Học Ngay</span>
                        </Link>
                      ) : isCompleted ? (
                        <Link
                          to={lessonUrl}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-emerald-50 active:scale-[0.98] px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-800 border-2 border-emerald-200 shadow-2xs transition-all"
                        >
                          <span>Ôn tập lại</span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                          <SoftClayLockIcon size={14} />
                          <span>Sắp mở</span>
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
