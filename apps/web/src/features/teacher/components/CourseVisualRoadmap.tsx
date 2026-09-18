/**
 * CourseVisualRoadmap.tsx
 * Bản đồ lộ trình trực quan các Trạm học (Visual Cards Grid)
 *
 * Cho phép giáo viên:
 * 1. Xem toàn cảnh tiến trình các trạm học theo thứ tự trực quan.
 * 2. 1-Click vào bất kỳ trạm nào để chuyển ngay sang chế độ Focus Studio soạn thảo.
 * 3. Phân biệt rõ ràng trạm đang mở và trạm cũ đã ẩn.
 * 4. Thao tác nhanh: Ẩn/Hiện trạm, Di chuyển thứ tự trạm, Thêm trạm mới, Mở AI Script Studio.
 */

import React, { useMemo, useState } from 'react'
import {
  Sparkles,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit3,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Archive,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { LectureRow } from '@/shared/lib/api'

export type RoadmapStation = {
  id: string
  title: string
  archived?: boolean
  stage?: string
  skill?: string
  hook?: string
  reward?: string
  duration?: string
  learnCards?: unknown
  checkQuestions?: unknown
  practiceKind?: string
  videoUrl?: string | null
  [key: string]: unknown
}

interface CourseVisualRoadmapProps<T extends RoadmapStation = RoadmapStation> {
  courseTitle: string
  courseDescription?: string
  stations: T[]
  readOnly?: boolean
  onSelectStation: (stationId: string) => void
  onAddStation: () => void
  onToggleArchiveStation?: (station: T) => void
  onMoveStation?: (stationId: string, dir: -1 | 1) => void
  onOpenScriptGenerator?: () => void
}

export function CourseVisualRoadmap<T extends RoadmapStation = RoadmapStation>({
  courseTitle,
  courseDescription,
  stations,
  readOnly = false,
  onSelectStation,
  onAddStation,
  onToggleArchiveStation,
  onMoveStation,
  onOpenScriptGenerator,
}: CourseVisualRoadmapProps<T>) {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'archived'>('all')

  const activeStations = useMemo(() => stations.filter((s) => !s.archived), [stations])
  const archivedStations = useMemo(() => stations.filter((s) => s.archived), [stations])

  // Kiểm tra độ sẵn sàng của trạm
  const getStationStatus = (station: RoadmapStation) => {
    if (station.archived) {
      return {
        label: 'Đang ẩn',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: <EyeOff size={13} className="text-amber-700" />,
        type: 'archived',
      }
    }

    const hasCards = Array.isArray(station.learnCards) && station.learnCards.length > 0
    const isReady = hasCards || Boolean(station.videoUrl) || Boolean(station.practiceKind)

    if (isReady) {
      return {
        label: 'Sẵn sàng',
        color: 'bg-mint-100 text-emerald-800 border-mint-300',
        icon: <CheckCircle2 size={13} className="text-emerald-700" />,
        type: 'ready',
      }
    }

    return {
      label: 'Cần nội dung',
      color: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <AlertTriangle size={13} className="text-rose-700" />,
      type: 'missing',
    }
  }

  // Render card cho từng trạm
  const renderStationCard = (station: T, displayIndex: number, isArchived: boolean) => {
    const status = getStationStatus(station)
    const cardsCount = Array.isArray(station.learnCards) ? station.learnCards.length : 0
    const globalIndex = stations.findIndex((s) => s.id === station.id)

    return (
      <div
        key={station.id}
        className={cn(
          'group relative flex flex-col justify-between rounded-2xl border-2 transition-all shadow-xs p-4.5',
          isArchived
            ? 'border-slate-300 bg-slate-50/90 opacity-65 grayscale-[30%] hover:opacity-100 hover:grayscale-0'
            : 'border-border/80 bg-white hover:border-brand-400 hover:shadow-md hover:-translate-y-0.5'
        )}
      >
        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black',
                  isArchived ? 'bg-slate-200 text-slate-700' : 'bg-sky-100 text-sky-800'
                )}
              >
                {displayIndex}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted">
                Trạm {displayIndex}
              </span>
            </div>

            {isArchived ? (
              <span className="flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2.5 py-0.5 text-[10px] font-black text-rose-800 shadow-2xs">
                <span>🚫 ĐÃ ẨN KHỎI HỌC SINH</span>
                <span className="hidden sm:inline">({status.label})</span>
              </span>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-black',
                  status.color
                )}
              >
                {status.icon}
                <span>{status.label}</span>
              </span>
            )}
          </div>

          {/* Title & Click to edit */}
          <button
            type="button"
            onClick={() => onSelectStation(station.id)}
            className="w-full text-left group-hover:text-brand-600 transition cursor-pointer"
            title={`Chỉnh sửa Trạm ${displayIndex}: ${station.title}`}
          >
            <h3 className="font-display text-base font-bold leading-snug line-clamp-2 text-text">
              {station.title}
            </h3>
          </button>

          {/* Hook / Skill */}
          {station.skill && (
            <p className="mt-1 text-xs font-medium text-brand-700 bg-brand-50/80 rounded-md px-2 py-0.5 w-fit line-clamp-1">
              🎯 {station.skill}
            </p>
          )}

          {station.hook && (
            <p className="mt-2 text-xs text-muted line-clamp-2 italic">
              "{station.hook}"
            </p>
          )}
        </div>

        {/* Meta details & Actions */}
        <div className="mt-4 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between text-[11px] text-muted mb-3 font-medium">
            <span className="flex items-center gap-1" title="Số chặng khám phá">
              <Layers size={13} className="text-sky-600" />
              <span>{cardsCount > 0 ? `${cardsCount} chặng` : '0 chặng'}</span>
            </span>
            {station.duration && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                <span>{station.duration}</span>
              </span>
            )}
            {station.reward && (
              <span className="flex items-center gap-1">
                <Award size={12} className="text-amber-500" />
                <span className="truncate max-w-[80px]">{station.reward}</span>
              </span>
            )}
          </div>

          {/* Button bar */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              type="button"
              onClick={() => onSelectStation(station.id)}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-8.5 rounded-xl bg-brand-50 hover:bg-brand-500 hover:text-white text-brand-700 font-extrabold text-xs transition active:scale-98 cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Soạn trạm</span>
            </button>

            {!readOnly && (
              <div className="flex items-center gap-1">
                {!isArchived && onMoveStation && (
                  <>
                    <button
                      type="button"
                      disabled={globalIndex <= 0}
                      onClick={() => onMoveStation(station.id, -1)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/70 hover:bg-sky-50 text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      title="Chuyển lên trước"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={globalIndex >= stations.length - 1}
                      onClick={() => onMoveStation(station.id, 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/70 hover:bg-sky-50 text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      title="Chuyển xuống sau"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </>
                )}

                {onToggleArchiveStation && (
                  isArchived ? (
                    <button
                      type="button"
                      onClick={() => onToggleArchiveStation(station)}
                      className="flex items-center gap-1 min-h-8.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 font-extrabold text-xs px-2.5 border border-emerald-300 transition active:scale-98 cursor-pointer shadow-2xs"
                      title="Khôi phục trạm vào lộ trình"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Khôi phục</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleArchiveStation(station)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/70 hover:bg-rose-50 text-muted hover:text-rose-600 transition cursor-pointer"
                      title="Ẩn trạm khỏi học sinh"
                    >
                      <EyeOff size={13} />
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Roadmap Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-sky-100 bg-gradient-to-r from-sky-50 via-white to-sky-50/60 p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-black text-brand-700">
              🗺️ Lộ trình trạm học
            </span>
            <span className="text-xs font-bold text-muted">
              {stations.length} trạm · {activeStations.length} đang mở
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl text-text font-black tracking-tight">{courseTitle}</h2>
          {courseDescription && (
            <p className="mt-0.5 text-sm text-muted max-w-2xl">{courseDescription}</p>
          )}

          {/* Bộ lọc Tabs trên Roadmap Header Bar */}
          <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-sky-100/70 p-1 border border-sky-200/80 w-fit">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-black transition cursor-pointer',
                filterTab === 'all'
                  ? 'bg-white text-brand-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              Tất cả ({stations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('active')}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-black transition cursor-pointer',
                filterTab === 'active'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              🟢 Đang mở ({activeStations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('archived')}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-black transition cursor-pointer',
                filterTab === 'archived'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              📦 Đã ẩn ({archivedStations.length})
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenScriptGenerator && !readOnly && (
            <Button
              type="button"
              variant="secondary"
              className="gap-2 border-2 border-brand-200 bg-white hover:bg-brand-50 text-brand-700 font-extrabold shadow-xs cursor-pointer"
              onClick={onOpenScriptGenerator}
            >
              <Sparkles size={16} className="text-brand-600 animate-pulse" />
              <span>🪄 Tạo từ kịch bản AI</span>
            </Button>
          )}

          {!readOnly && (
            <Button
              type="button"
              className="gap-2 shadow-sm font-extrabold cursor-pointer"
              onClick={onAddStation}
            >
              <Plus size={16} />
              <span>+ Thêm trạm mới</span>
            </Button>
          )}
        </div>
      </div>

      {/* Empty state: Không có trạm nào */}
      {stations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/40 p-12 text-center">
          <div className="text-5xl mb-3">🚀</div>
          <h3 className="font-display text-xl text-text font-black">Chưa có trạm học nào trong lộ trình</h3>
          <p className="mt-1 max-w-md text-sm text-muted">
            Hãy bắt đầu tạo trạm học đầu tiên hoặc dùng công cụ sinh lộ trình tự động từ kịch bản bài giảng.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {onOpenScriptGenerator && !readOnly && (
              <Button
                variant="secondary"
                className="gap-2 border-brand-200 bg-white text-brand-700"
                onClick={onOpenScriptGenerator}
              >
                <Sparkles size={16} />
                <span>Nhập kịch bản AI</span>
              </Button>
            )}
            {!readOnly && (
              <Button onClick={onAddStation} className="gap-2">
                <Plus size={16} />
                <span>+ Thêm trạm đầu tiên</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KHU VỰC 1: 🟢 LỘ TRÌNH TRẠM ĐANG MỞ */}
          {(filterTab === 'all' || filterTab === 'active') && (
            <div className="space-y-3">
              {archivedStations.length > 0 && filterTab === 'all' && (
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black shadow-2xs">
                    🟢
                  </span>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                    Lộ Trình Trạm Đang Mở ({activeStations.length} trạm)
                  </h3>
                </div>
              )}

              {activeStations.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-8 text-center">
                  <p className="text-sm font-bold text-slate-600">Hiện không có trạm nào đang mở.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {activeStations.map((station, index) =>
                    renderStationCard(station, index + 1, false)
                  )}

                  {/* Quick Add Station Card ở cuối danh sách đang mở */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={onAddStation}
                      className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 p-6 text-sky-700 transition hover:border-brand-500 hover:bg-sky-50 hover:text-brand-600 active:scale-98 cursor-pointer"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                        <Plus size={20} />
                      </div>
                      <span className="font-display text-sm font-black">+ Thêm Trạm Học Mới</span>
                      <span className="text-xs text-muted">Bấm để tạo thêm trạm vào lộ trình</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* KHU VỰC 2: 📦 TRẠM CŨ / ĐÃ ẨN KHỎI LỘ TRÌNH */}
          {(filterTab === 'all' || filterTab === 'archived') && (
            archivedStations.length > 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/70 p-4 space-y-3">
                {/* Header section */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-700 shadow-2xs">
                      <Archive size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                        📦 TRẠM CŨ / ĐÃ ẨN KHỎI HỌC SINH ({archivedStations.length})
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Các trạm này đang bị ẩn, học sinh trên bản đồ Đảo sẽ không thấy. Bạn có thể khôi phục lại bất cứ lúc nào.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cards grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-1">
                  {archivedStations.map((station, index) => {
                    const originalIdx = stations.findIndex((s) => s.id === station.id)
                    const displayNum = originalIdx >= 0 ? originalIdx + 1 : activeStations.length + index + 1
                    return renderStationCard(station, displayNum, true)
                  })}
                </div>
              </div>
            ) : filterTab === 'archived' ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-bold text-slate-600">Không có trạm nào đang bị ẩn.</p>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
