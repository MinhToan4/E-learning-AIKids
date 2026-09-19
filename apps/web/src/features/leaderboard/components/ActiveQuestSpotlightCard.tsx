import { Link } from 'react-router'
import type { QuestProgress } from '@/shared/lib/api'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import {
  SoftClayFlagIcon,
  SoftClayStarIcon,
  SoftClayRocketIcon,
  SoftClayCheckIcon,
} from './ProgressPassportIcons'

export interface ActiveQuestSpotlightCardProps {
  courseId: string
  courseTitle: string
  activeQuest: QuestProgress | null
  completionPercent: number
  allQuestsCompleted?: boolean
  totalQuestsCount?: number
  completedQuestsCount?: number
}

export function ActiveQuestSpotlightCard({
  courseId,
  courseTitle,
  activeQuest,
  completionPercent,
  allQuestsCompleted = false,
  totalQuestsCount,
  completedQuestsCount,
}: ActiveQuestSpotlightCardProps) {
  const percent = Math.min(100, Math.max(0, Math.round(completionPercent)))

  // Đường link vào học 1 chạm
  const lessonUrl = activeQuest?.id
    ? `/world/${encodeURIComponent(courseId)}/lesson/${encodeURIComponent(activeQuest.id)}`
    : `/world/${encodeURIComponent(courseId)}`

  return (
    <section
      className="ui-card relative overflow-hidden rounded-3xl border-3 border-rose-200 bg-linear-to-br from-white via-rose-50/40 to-amber-50/50 p-5 sm:p-7 shadow-clay w-full min-w-0"
      aria-labelledby="active-quest-title"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-center">
        <div className="min-w-0 space-y-3">
          {/* Eyebrow badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white/95 px-3 py-1 text-xs font-black text-rose-600 shadow-2xs">
              {allQuestsCompleted ? (
                <>
                  <SoftClayCheckIcon size={16} />
                  <span>Hoàn Thành Xuất Sắc</span>
                </>
              ) : (
                <>
                  <SoftClayFlagIcon size={16} />
                  <span>Trạm Học Tiếp Theo Của Học Sinh</span>
                </>
              )}
            </span>
            <span className="rounded-xl border border-slate-200/80 bg-slate-100/80 px-2.5 py-1 text-xs font-bold text-slate-600">
              {courseTitle}
            </span>
          </div>

          {/* Heading */}
          <h2
            id="active-quest-title"
            className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug break-words"
          >
            {allQuestsCompleted ? (
              `Học sinh đã chinh phục trọn vẹn ${courseTitle}!`
            ) : activeQuest ? (
              `Trạm ${activeQuest.order}: ${activeQuest.title}`
            ) : (
              `Sẵn sàng khám phá ${courseTitle}`
            )}
          </h2>

          {/* Subtitle / Details */}
          {allQuestsCompleted ? (
            <p className="text-sm sm:text-base font-semibold text-slate-600 leading-relaxed">
              Chúc mừng học sinh xuất sắc! Toàn bộ các trạm học đã sáng rực rỡ. Học sinh có thể ôn luyện lại để giữ vững phong độ hoặc chọn thêm khóa học mới nhé!
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-700">
              {activeQuest?.skill && (
                <div className="flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1 border border-slate-200">
                  <span className="text-muted">Kỹ năng:</span>
                  <span className="font-bold text-brand-700">{activeQuest.skill}</span>
                </div>
              )}
              {activeQuest?.duration && (
                <div className="flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1 border border-slate-200">
                  <span className="text-muted">Thời lượng:</span>
                  <span className="font-bold text-slate-800">{activeQuest.duration}</span>
                </div>
              )}
              {activeQuest?.reward && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 border border-amber-200 text-amber-800">
                  <SoftClayStarIcon size={14} />
                  <span>{activeQuest.reward}</span>
                </div>
              )}
            </div>
          )}

          {/* Dewdrop Progress Bar */}
          <div className="pt-2 max-w-xl">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 mb-1.5">
              <span>Tiến độ khóa học</span>
              <span className="text-brand-700 font-black">
                {percent}% {totalQuestsCount ? `(${completedQuestsCount ?? 0}/${totalQuestsCount} trạm)` : ''}
              </span>
            </div>
            <div
              className="dewdrop-progress-track w-full bg-slate-200/90 rounded-full h-3.5 p-0.5"
              role="progressbar"
              aria-label={`Tiến độ khóa học ${courseTitle}`}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="dewdrop-progress-fill h-full rounded-full transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {allQuestsCompleted ? (
              <Link
                to={lessonUrl}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] px-6 py-3.5 text-base sm:text-lg font-extrabold text-white shadow-clay border-2 border-emerald-600 transition-all"
              >
                <SoftClayCheckIcon size={20} />
                <span>Xem Lại Hành Trình</span>
              </Link>
            ) : (
              <Link
                to={lessonUrl}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] px-6 py-3.5 text-base sm:text-lg font-extrabold text-white shadow-clay border-2 border-brand-600 transition-all"
              >
                <SoftClayRocketIcon size={20} />
                <span>
                  {activeQuest ? `Tiếp Tục Trạm ${activeQuest.order} Ngay` : 'Khám Phá Khóa Học Ngay'}
                </span>
              </Link>
            )}
            <Link
              to="/world"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] px-5 py-3 text-sm sm:text-base font-bold text-slate-700 border-2 border-slate-200 shadow-2xs transition-all"
            >
              <span>Khám Phá Thế Giới Học</span>
            </Link>
          </div>
        </div>

        {/* Mascot decoration */}
        <div className="hidden md:flex shrink-0 items-center justify-center p-2" aria-hidden="true">
          <ImportantCardMascot pose="guide" className="w-28 h-28 object-contain drop-shadow-md" />
        </div>
      </div>
    </section>
  )
}
