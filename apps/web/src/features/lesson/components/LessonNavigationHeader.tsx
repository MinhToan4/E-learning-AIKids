import React from 'react'
import { ChevronLeft, Sparkles, Star } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { AIKI_RULE_STAGE_METAS } from '@/features/teacher/lib/authoring'

export interface LessonNavigationHeaderProps {
  phase: string
  isAikiRuleJourney: boolean
  is5StageJourney: boolean
  isIslandJourney?: boolean
  quest: {
    order?: number
    title: string
    courseId?: string
    courseTitle?: string
  }
  aikiRuleStage: number
  hydratedLearnCardsCount: number
  isSidebarCollapsed: boolean
  onToggleSidebarCollapse: (collapsed: boolean) => void
  onNavigateBack: () => void
  onSelectAikiRuleStage?: (stage: number) => void
  practiceStation?: { product?: string } | null
  liveStars?: number
  starBurst?: { id: number; count: number } | null
  children?: React.ReactNode
}

export function LessonNavigationHeader({
  phase,
  isAikiRuleJourney,
  is5StageJourney,
  isIslandJourney,
  quest,
  aikiRuleStage,
  hydratedLearnCardsCount,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onNavigateBack,
  onSelectAikiRuleStage,
  practiceStation,
  liveStars = 0,
  starBurst,
  children,
}: LessonNavigationHeaderProps) {
  if (phase === 'practice') return null

  if (isAikiRuleJourney) {
    return (
      <header className="shrink-0 flex items-center justify-between gap-2 px-1 py-0.5 min-h-[36px] sm:min-h-[38px] w-full">
        {/* Trái: Nút [← Bản đồ] + Badge [Trạm X · Quy tắc] + Tiêu đề đầy đủ */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 flex-wrap">
          <button
            type="button"
            onClick={onNavigateBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-black text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer shrink-0"
            title="Quay lại bản đồ"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Bản đồ</span>
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 border border-brand-200 px-2.5 sm:px-3 py-1 text-xs font-black text-brand-800 uppercase tracking-wider shadow-2xs shrink-0">
            <Sparkles size={13} className="text-brand-600" />
            <span>Trạm {quest.order || 1} · Quy tắc</span>
          </span>
          <h1 className="font-display text-base sm:text-lg font-black text-slate-900 leading-tight">
            {quest.title}
          </h1>
        </div>

        {/* Phải: Badge [⭐ 3 Sao] + Nút Thu gọn/Bảng tương tác */}
        <div className="sr-only">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-900 shadow-2xs shrink-0">
            <Star className="size-3.5 fill-amber-400 text-amber-500" />
            <span>3 Sao</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleSidebarCollapse(!isSidebarCollapsed)}
            className="sr-only"
            title={isSidebarCollapsed ? "Hiển thị bảng tương tác" : "Thu gọn bảng tương tác"}
          >
            <span>
              {isSidebarCollapsed ? "⛶ Bảng tương tác" : "⛶ Thu gọn"}
            </span>
          </button>
        </div>
      </header>
    )
  }

  if (is5StageJourney) {
    return (
      <header className="shrink-0 flex flex-col gap-2 px-1">
        {/* Tầng 1: Meta Tag & Huy Hiệu Mục Tiêu & Nút Mở Rộng */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onNavigateBack}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer"
              title="Quay lại bản đồ"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              <span>Bản đồ</span>
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 border border-brand-200 px-3 py-1 text-xs font-black text-brand-800 uppercase tracking-wider shadow-2xs">
              <Sparkles size={13} className="text-brand-600" />
              {isIslandJourney
                ? `🏝️ ${quest.courseTitle || (quest.courseId?.startsWith('dao-') ? `ĐẢO ${quest.courseId.replace('dao-', '').toUpperCase()}` : 'ĐẢO AIKIDS')} · BÀI ${quest.order || ''}`
                : `Trạm ${quest.order || 1} · Quy tắc sáng tạo`}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-50 border border-mint-200 px-3 py-1 text-xs font-black text-mint-800 shadow-2xs">
              <span className="size-2 rounded-full bg-mint-500 animate-pulse" />
              Chặng {aikiRuleStage + 1} / {Math.max(5, hydratedLearnCardsCount)}: {AIKI_RULE_STAGE_METAS[aikiRuleStage]?.shortLabel || AIKI_RULE_STAGE_METAS[aikiRuleStage]?.label || `Chặng ${aikiRuleStage + 1}`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => onToggleSidebarCollapse(!isSidebarCollapsed)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95",
                isSidebarCollapsed
                  ? "bg-brand-500 border-brand-600 text-white hover:bg-brand-600 ring-2 ring-brand-200"
                  : "bg-white border-brand-200 text-brand-800 hover:bg-brand-50"
              )}
              title={isSidebarCollapsed ? "Hiển thị trợ lý Mèo Mee bên cạnh" : "Mở rộng toàn màn hình không gian học"}
            >
              <span>{isSidebarCollapsed ? "📖 Hiện Trợ Lý Mee" : "↔️ Mở Rộng Không Gian Học"}</span>
            </button>

            <div className="sr-only">
              <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-black text-amber-900 shadow-2xs shrink-0">
                <span className="text-xs font-black">⭐ 3 Sao</span>
                <span className="text-amber-300">•</span>
                <span className="flex items-center gap-1 text-xs font-black">
                  <span>🏆</span>
                  <span>Hiệp Sĩ AIKI</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tầng 2: Tiêu Đề Trạm */}
        <h1 className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl font-black text-text leading-tight">
          {quest.title}
        </h1>

        {/* Tầng 3: Story Stream Step Tracker */}
        <div className="mt-2 flex items-center justify-between gap-2 overflow-x-auto hidden-scrollbar py-1">
          <div className="flex items-center gap-1 sm:gap-2 flex-1 max-w-2xl" aria-label={`Tiến độ chặng ${aikiRuleStage + 1} trên 5`}>
            {[
              { label: 'Tình huống', num: '1' },
              { label: 'Câu đố', num: '2' },
              { label: 'Quy tắc', num: '3' },
              { label: 'Giải thích', num: '4' },
              { label: 'Chốt', num: '5' },
            ].map((step, stageIdx) => {
              const isDone = stageIdx < aikiRuleStage
              const isActive = stageIdx === aikiRuleStage
              return (
                <React.Fragment key={stageIdx}>
                  <button
                    type="button"
                    onClick={() => onSelectAikiRuleStage?.(stageIdx)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shrink-0 shadow-2xs",
                      isActive
                        ? "bg-brand-500 text-white ring-2 ring-brand-200 shadow-sm scale-105"
                        : isDone
                          ? "bg-mint-500 text-white hover:bg-mint-600"
                          : "bg-white border border-slate-200 text-slate-500 hover:border-brand-300"
                    )}
                    title={`Chặng ${stageIdx + 1}: ${step.label}`}
                  >
                    <span className={cn(
                      "size-4 sm:size-4.5 rounded-full grid place-items-center text-[10px] font-black",
                      isActive ? "bg-white text-brand-700" : isDone ? "bg-mint-600 text-white" : "bg-slate-100 text-slate-600"
                    )}>
                      {isDone ? '✓' : step.num}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                  {stageIdx < 4 && (
                    <div className={cn(
                      "h-1 flex-1 min-w-3 sm:min-w-6 rounded-full transition-colors",
                      stageIdx < aikiRuleStage ? "bg-mint-500" : "bg-slate-200"
                    )} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
          <span className="text-xs font-black text-brand-700 shrink-0 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full shadow-2xs">
            {Math.round(((aikiRuleStage + 1) / 5) * 100)}%
          </span>
        </div>
      </header>
    )
  }

  return (
    <div className="ui-card p-4 shrink-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={onNavigateBack}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer"
              title="Quay lại bản đồ"
            >
              <ChevronLeft size={15} aria-hidden="true" />
              <span>Bản đồ</span>
            </button>
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Trạm {quest.order}</p>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-text">{quest.title}</h1>
          {practiceStation?.product && (
            <p className="mt-1 text-xs font-semibold text-muted">
              Sản phẩm của trạm: <strong className="text-text">{practiceStation.product}</strong>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onToggleSidebarCollapse(!isSidebarCollapsed)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95",
              isSidebarCollapsed
                ? "bg-brand-500 border-brand-600 text-white hover:bg-brand-600 ring-2 ring-brand-200"
                : "bg-white border-brand-200 text-brand-800 hover:bg-brand-50"
            )}
            title={isSidebarCollapsed ? "Hiển thị trợ lý Mèo Mee bên cạnh" : "Mở rộng toàn màn hình không gian học"}
          >
            <span>{isSidebarCollapsed ? "📖 Hiện Trợ Lý Mee" : "↔️ Mở Rộng Không Gian Học"}</span>
          </button>
          {phase !== 'done' && liveStars > 0 && (
            <div className="lesson-star-rack" aria-label={`Sao của trạm: ${liveStars} sao đã nhận`}>
              <span className="lesson-star-rack-label">Sao của trạm</span>
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  size={28}
                  className={cn(
                    'lesson-star-placeholder',
                    star <= liveStars && 'lesson-star-earned',
                  )}
                  aria-hidden="true"
                />
              ))}
              {starBurst && Array.from({ length: starBurst.count }, (_, index) => (
                <span
                  key={`${starBurst.id}-${index}`}
                  className="lesson-star-fly"
                  aria-hidden="true"
                >
                  ⭐
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
