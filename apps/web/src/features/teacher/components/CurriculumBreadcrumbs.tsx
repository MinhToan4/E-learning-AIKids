import { ChevronRight, ArrowLeft, Layers, MapPin, Compass, Edit3 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type CurriculumLevel = 1 | 2 | 3 | 4

type CurriculumBreadcrumbsProps = {
  currentLevel: CurriculumLevel
  programTitle?: string
  regionTitle?: string
  stationTitle?: string
  onBack: () => void
  onNavigateLevel: (level: 1 | 2 | 3) => void
}

const LEVEL_CONFIG: Record<
  CurriculumLevel,
  { label: string; badge: string; color: string; backLabel: string }
> = {
  1: {
    label: 'Không gian & Chương trình',
    badge: 'Cấp 1',
    color: 'bg-brand-50 text-brand-700 border-brand-200',
    backLabel: '',
  },
  2: {
    label: 'Quản lý Vùng học',
    badge: 'Cấp 2',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    backLabel: 'Quay lại Chương trình',
  },
  3: {
    label: 'Lộ trình Trạm học',
    badge: 'Cấp 3',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    backLabel: 'Quay lại Các Vùng',
  },
  4: {
    label: 'Studio Soạn Trạm',
    badge: 'Cấp 4',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    backLabel: 'Quay lại Bản đồ Trạm',
  },
}

export function CurriculumBreadcrumbs({
  currentLevel,
  programTitle,
  regionTitle,
  stationTitle,
  onBack,
  onNavigateLevel,
}: CurriculumBreadcrumbsProps) {
  const currentConfig = LEVEL_CONFIG[currentLevel]

  return (
    <nav
      aria-label="Đường dẫn phân cấp giáo trình"
      className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-border/80 bg-white/95 px-3.5 py-2 shadow-2xs backdrop-blur-xs"
    >
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {currentLevel > 1 && (
          <button
            type="button"
            onClick={onBack}
            className="mr-1 inline-flex items-center gap-1 rounded-xl border border-border bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-700 transition hover:border-brand-300 hover:bg-white hover:text-brand-700 cursor-pointer shadow-2xs"
            title={currentConfig.backLabel}
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">{currentConfig.backLabel}</span>
            <span className="sm:hidden">Quay lại</span>
          </button>
        )}

        {/* Cấp 1: Chương trình */}
        <button
          type="button"
          onClick={() => onNavigateLevel(1)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-black transition cursor-pointer',
            currentLevel === 1
              ? 'bg-brand-50 text-brand-900 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          <Layers size={13} className="text-brand-600" />
          <span>Biên soạn</span>
        </button>

        {/* Cấp 2: Tên chương trình */}
        {currentLevel >= 2 && programTitle && (
          <>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => onNavigateLevel(2)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-black transition max-w-[200px] truncate cursor-pointer',
                currentLevel === 2
                  ? 'bg-sky-50 text-sky-900 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              title={programTitle}
            >
              <Compass size={13} className="text-sky-600 shrink-0" />
              <span className="truncate">{programTitle}</span>
            </button>
          </>
        )}

        {/* Cấp 3: Tên vùng */}
        {currentLevel >= 3 && regionTitle && (
          <>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => onNavigateLevel(3)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-black transition max-w-[220px] truncate cursor-pointer',
                currentLevel === 3
                  ? 'bg-emerald-50 text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              title={regionTitle}
            >
              <MapPin size={13} className="text-emerald-600 shrink-0" />
              <span className="truncate">{regionTitle}</span>
            </button>
          </>
        )}

        {/* Cấp 4: Đang soạn trạm */}
        {currentLevel === 4 && (
          <>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <div
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-900 shadow-2xs max-w-[240px] truncate"
              title={stationTitle || 'Soạn trạm'}
            >
              <Edit3 size={13} className="text-amber-600 shrink-0" />
              <span className="truncate">{stationTitle ? `Soạn: ${stationTitle}` : 'Soạn trạm mới'}</span>
            </div>
          </>
        )}
      </div>

      {/* Badge định vị cấp độ */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider',
            currentConfig.color
          )}
        >
          <span>{currentConfig.badge}</span>
          <span className="hidden md:inline">· {currentConfig.label}</span>
        </span>
      </div>
    </nav>
  )
}
