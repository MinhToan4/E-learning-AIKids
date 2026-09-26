import React, { useMemo, useState } from 'react'
import { Lock } from 'lucide-react'
import type { CourseSummary } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { designerAssets } from '@/shared/config/assets'
import {
  getCanonicalAikidCourseSlug,
  getCourseStationCount,
} from '@/shared/lib/course-station-count'

export interface SecondaryCoursesSectionProps {
  courses?: CourseSummary[]
  onSelectCourse?: (course: CourseSummary) => void
  onUnlockCourse?: (course: CourseSummary) => void
  className?: string
}

export type CourseFilterTab = 'all' | 'purchased' | 'available'

export const DEFAULT_SECONDARY_COURSES: CourseSummary[] = [
  {
    id: 'course-comic-ai',
    title: 'Sáng Tạo Truyện Tranh AI',
    shortTitle: 'Truyện Tranh AI',
    tagline: 'Vẽ truyện tranh phân khung đa dạng cùng AI',
    description: 'Xây dựng kịch bản, thiết kế nhân vật truyện tranh và xuất bản tập truyện của riêng con.',
    coverFrom: '#ffedd5',
    coverTo: '#fef3c7',
    accent: '#f59e0b',
    coverImage: designerAssets.course.comic,
    ageLabel: '7–12 tuổi',
    ageTrack: 'L2',
    courseKey: 'comic-ai',
    durationLabel: '16 trạm',
    productLabel: 'Truyện Tranh',
    status: 'open',
    recommended: true,
    skills: ['Storyboarding', 'Nhân vật AI', 'Lời thoại'],
    questCount: 16,
    enrolled: true,
    completedCount: 6,
    totalStars: 18,
    progressPct: 38,
    quests: [],
  },
  {
    id: 'course-math-asmo',
    title: 'Toán Tư Duy Montessori & ASMO',
    shortTitle: 'Toán ASMO',
    tagline: 'Luyện thi Olympic toán học qua mô hình trực quan đất nặn',
    description: 'Cân thăng bằng, mô hình đồng hồ và ma trận logic giúp bé yêu thích toán tư duy tự nhiên.',
    coverFrom: '#eff6ff',
    coverTo: '#dbeafe',
    accent: '#3b82f6',
    coverImage: designerAssets.asmoScenes.appleForest,
    ageLabel: '6–10 tuổi',
    ageTrack: 'L1',
    courseKey: 'math-asmo',
    durationLabel: '20 trạm',
    productLabel: 'Toán Olympic',
    status: 'open',
    recommended: false,
    skills: ['Tư duy logic', 'Cân thăng bằng', 'Mô hình khối'],
    questCount: 20,
    enrolled: false,
    completedCount: 0,
    totalStars: 0,
    progressPct: 0,
    quests: [],
  },
  {
    id: 'course-game-kids',
    title: 'Lập Trình Game Nhí',
    shortTitle: 'Game Nhí',
    tagline: 'Tự tay làm game 2D tương tác và đấu trường trí tuệ',
    description: 'Khám phá thế giới lập trình khối lệnh, thiết kế màn chơi và thử thách tư duy giải thuật.',
    coverFrom: '#f3e8ff',
    coverTo: '#ede9fe',
    accent: '#8b5cf6',
    coverImage: designerAssets.worldScenes.gameArena,
    ageLabel: '8–14 tuổi',
    ageTrack: 'L2',
    courseKey: 'game-kids',
    durationLabel: '12 trạm',
    productLabel: 'Lập Trình Game',
    status: 'open',
    recommended: false,
    skills: ['Logic khối lệnh', 'Game Design', 'Giải quyết vấn đề'],
    questCount: 12,
    enrolled: false,
    completedCount: 0,
    totalStars: 0,
    progressPct: 0,
    quests: [],
  },
]

export function isMainIslandCourse(course: CourseSummary): boolean {
  if (getCanonicalAikidCourseSlug(course) !== null) return true
  const key = `${course.courseKey ?? ''} ${course.id ?? ''}`.toLowerCase()
  const title = `${course.title ?? ''} ${course.shortTitle ?? ''}`.toLowerCase()
  return (
    key.includes('dao-') ||
    key.includes('module-') ||
    key.includes('muoi-quy-tac') ||
    key.includes('aiki-rules') ||
    key.includes('rule-gold') ||
    key.includes('scratch') ||
    title.includes('hải trình 6 đảo') ||
    title.includes('chương trình chính')
  )
}

export function resolveSecondaryCourses(courses: CourseSummary[] = []): CourseSummary[] {
  const secondary = courses.filter((c) => !isMainIslandCourse(c))
  if (secondary.length === 0) {
    return DEFAULT_SECONDARY_COURSES
  }
  if (secondary.length >= 3) {
    return secondary
  }
  const existingIds = new Set(secondary.map((c) => c.id))
  const existingTitles = new Set(secondary.map((c) => c.title.toLowerCase()))
  const supplements = DEFAULT_SECONDARY_COURSES.filter(
    (c) => !existingIds.has(c.id) && !existingTitles.has(c.title.toLowerCase()),
  )
  return [...secondary, ...supplements].slice(0, Math.max(3, secondary.length))
}

export const SecondaryCoursesSection: React.FC<SecondaryCoursesSectionProps> = ({
  courses = [],
  onSelectCourse,
  onUnlockCourse,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<CourseFilterTab>('all')

  const allCourses = useMemo(() => resolveSecondaryCourses(courses), [courses])

  const purchasedCount = useMemo(
    () => allCourses.filter((c) => c.enrolled).length,
    [allCourses],
  )
  const availableCount = useMemo(
    () => allCourses.filter((c) => !c.enrolled).length,
    [allCourses],
  )

  const displayedCourses = useMemo(() => {
    if (activeTab === 'purchased') {
      return allCourses.filter((c) => c.enrolled)
    }
    if (activeTab === 'available') {
      return allCourses.filter((c) => !c.enrolled)
    }
    return allCourses
  }, [allCourses, activeTab])

  return (
    <section
      className={cn(
        'w-full rounded-[2.25rem] bg-gradient-to-br from-[#eff8ff]/90 via-[#f7f5ff]/80 to-[#fff6eb]/90 p-4 sm:p-5 lg:p-6 shadow-sm border border-orange-100/80 min-w-0 transition-all space-y-4',
        className,
      )}
      aria-label="Khóa học bổ sung & khám phá mở rộng"
    >
      {/* ── HEADER & FILTER TABS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-200/60 px-2.5 py-0.5 text-[11px] font-black uppercase shadow-2xs tracking-wider">
              KHÓA HỌC BỔ SUNG
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
            Khám Phá Chuyên Đề &amp; Sáng Tạo
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Mở rộng kỹ năng AI, tư duy Olympic và sáng tác cùng Mèo Mee
          </p>
        </div>

        {/* ── BỘ LỌC FILTER TABS SOFT CLAY ── */}
        <div
          className="flex items-center gap-1 p-1 rounded-full bg-slate-100/90 border border-slate-200/80 shrink-0 self-start sm:self-auto overflow-x-auto max-w-full"
          role="tablist"
          aria-label="Bộ lọc khóa học bổ sung"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px]',
              activeTab === 'all'
                ? 'bg-amber-500 text-white font-black shadow-xs'
                : 'bg-slate-100 text-slate-600 font-bold hover:bg-slate-200/70',
            )}
          >
            <span>Tất cả</span>
            <span className="ml-1 text-[10px] opacity-85">({allCourses.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'purchased'}
            onClick={() => setActiveTab('purchased')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px]',
              activeTab === 'purchased'
                ? 'bg-amber-500 text-white font-black shadow-xs'
                : 'bg-slate-100 text-slate-600 font-bold hover:bg-slate-200/70',
            )}
          >
            <span>Đã sở hữu</span>
            <span className="ml-1 text-[10px] opacity-85">({purchasedCount})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'available'}
            onClick={() => setActiveTab('available')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px]',
              activeTab === 'available'
                ? 'bg-amber-500 text-white font-black shadow-xs'
                : 'bg-slate-100 text-slate-600 font-bold hover:bg-slate-200/70',
            )}
          >
            <span>Chưa mở khóa</span>
            <span className="ml-1 text-[10px] opacity-85">({availableCount})</span>
          </button>
        </div>
      </div>

      {/* ── COMPACT COURSE GRID ── */}
      {displayedCourses.length === 0 ? (
        <div className="py-8 text-center bg-white/70 rounded-2xl border border-dashed border-slate-200 p-6">
          <p className="text-xs sm:text-sm font-bold text-slate-500">
            Chưa có khóa học nào trong mục này.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className="mt-2 text-xs font-black text-amber-600 hover:underline cursor-pointer"
          >
            Xem tất cả các khóa học
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedCourses.map((course) => {
            const stationCount =
              course.questCount || getCourseStationCount(course) || 12

            return (
              <article
                key={course.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-w-0 group"
              >
                <div>
                  {/* Thumbnail 16:9 */}
                  <div className="relative w-full aspect-16/9 rounded-xl overflow-hidden bg-slate-100 mb-3">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-black text-slate-400 text-sm p-3 text-center"
                        style={{
                          background: `linear-gradient(135deg, ${course.coverFrom || '#f8fafc'}, ${course.coverTo || '#f1f5f9'})`,
                        }}
                      >
                        {course.shortTitle || course.title}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

                    {/* Corner Badge Phân Biệt Đã Mua / Chưa Mua */}
                    <div className="absolute top-2 left-2 z-10">
                      {course.enrolled ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs inline-flex items-center gap-1 border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Đã Sở Hữu
                        </span>
                      ) : (
                        <span className="bg-amber-50/95 text-amber-900 border border-amber-200/80 text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs inline-flex items-center gap-1 backdrop-blur-xs">
                          <Lock className="w-3 h-3 text-amber-700" />
                          Chưa Mở Khóa
                        </span>
                      )}
                    </div>

                    {/* Badge chủ đề / độ tuổi ở góc dưới */}
                    {course.productLabel && (
                      <div className="absolute bottom-2 right-2 z-10">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9.5px] font-bold">
                          {course.productLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tên khóa học ngắn gọn 1 dòng font đậm */}
                  <h3
                    className="text-sm sm:text-base font-black text-slate-800 line-clamp-1 min-w-0"
                    title={course.title}
                  >
                    {course.title}
                  </h3>

                  {/* Dòng thông tin phụ siêu ngắn: Số bài/trạm • Độ tuổi */}
                  <p className="mt-1 text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                    <span>{stationCount} trạm</span>
                    <span>•</span>
                    <span>{course.ageLabel || '6–12 tuổi'}</span>
                    {course.ageTrack && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 font-bold">{course.ageTrack}</span>
                      </>
                    )}
                  </p>

                  {/* Mô tả phụ ngắn gọn */}
                  {course.description && (
                    <p className="mt-1 text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Footer Action Card */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2 min-w-0">
                  {course.enrolled ? (
                    <>
                      {/* Thanh tiến độ nhỏ gọn */}
                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-600">
                          <span>Tiến độ</span>
                          <span className="text-emerald-700 font-black">
                            {course.progressPct ?? 0}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${Math.max(5, course.progressPct ?? 0)}%` }}
                          />
                        </div>
                      </div>

                      {/* Nút kẹo Học tiếp */}
                      <button
                        type="button"
                        onClick={() => onSelectCourse?.(course)}
                        className="w-full min-h-[38px] px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <span>Học tiếp</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Nút kẹo Mở khóa */}
                      <button
                        type="button"
                        onClick={() =>
                          onUnlockCourse ? onUnlockCourse(course) : onSelectCourse?.(course)
                        }
                        className="w-full min-h-[38px] px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <Lock className="w-3.5 h-3.5 text-white/90" />
                        <span>Mở khóa</span>
                      </button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default SecondaryCoursesSection
