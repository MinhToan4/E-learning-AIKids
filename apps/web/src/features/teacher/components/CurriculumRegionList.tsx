import { Plus, Sparkles, MapPin, ArrowRight, Edit, Layers, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { CourseLectures, LearningProgram } from '../types'

type CurriculumRegionListProps = {
  program: LearningProgram
  onSelectRegion: (regionId: string) => void
  onEditRegion: (region: CourseLectures) => void
  onOpenCreateRegion: () => void
  onOpenScriptGenerator: () => void
  onBackToPrograms: () => void
}

export function CurriculumRegionList({
  program,
  onSelectRegion,
  onEditRegion,
  onOpenCreateRegion,
  onOpenScriptGenerator,
  onBackToPrograms,
}: CurriculumRegionListProps) {
  const totalStations = program.regions.reduce(
    (sum, r) => sum + r.lectures.filter((l) => !l.archived).length,
    0
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Header cấp 2: Thông tin chương trình & Quản lý các Vùng */}
      <section className="rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-50/50 via-white to-white p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToPrograms}
              className="flex size-8 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-700 hover:bg-sky-50 transition cursor-pointer shadow-2xs"
              title="Quay lại danh sách chương trình"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="flex size-8 items-center justify-center rounded-xl bg-sky-500 text-sm font-black text-white shadow-2xs">
              2
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-base sm:text-lg font-black text-slate-900">
                  {program.title}
                </h2>
                <span className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider',
                  program.unlockMode === 'parallel'
                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                )}>
                  {program.unlockMode === 'parallel' ? 'Mở song song các vùng' : 'Mở lần lượt từng vùng'}
                </span>
              </div>
              <p className="text-xs text-muted font-bold mt-0.5">
                Cấp 2: Quản lý các Vùng học ({program.regions.length} vùng · {totalStations} trạm kiến thức)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!program.readOnly && (
              <Button
                type="button"
                variant="secondary"
                className="!min-h-9 !text-xs font-black border-sky-300 bg-white text-sky-800 hover:bg-sky-50 shadow-2xs cursor-pointer"
                onClick={onOpenCreateRegion}
              >
                <Plus size={14} />
                <span>+ Thêm vùng</span>
              </Button>
            )}
            <Button
              type="button"
              className="!min-h-9 !text-xs font-black shadow-xs gap-1.5 cursor-pointer"
              onClick={onOpenScriptGenerator}
            >
              <Sparkles size={14} />
              <span>🪄 Tạo từ kịch bản AI</span>
            </Button>
          </div>
        </div>

        {program.description && (
          <p className="mt-3 text-xs text-slate-600 font-medium leading-relaxed max-w-3xl">
            {program.description}
          </p>
        )}
      </section>

      {/* Danh sách các Vùng */}
      {program.regions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {program.regions.map((region, rIdx) => {
            const stationCount = region.lectures.filter((l) => !l.archived).length
            const isOpen = region.status === 'open'

            return (
              <article
                key={region.id}
                className="group flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-white p-5 shadow-xs transition hover:border-sky-300 hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Số thứ tự Vùng + Trạng thái */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-xl bg-sky-100 text-xs font-black text-sky-700">
                        {rIdx + 1}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-600">
                        Vùng {rIdx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                        isOpen ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning'
                      )}>
                        {isOpen ? 'Đang mở' : 'Đang ẩn'}
                      </span>
                      {!region.readOnly && (
                        <button
                          type="button"
                          onClick={() => onEditRegion(region)}
                          className="flex size-7 items-center justify-center rounded-lg border border-border/70 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                          title="Sửa thông tin vùng"
                        >
                          <Edit size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-display text-base font-black text-slate-900 group-hover:text-sky-700 transition">
                    {region.shortTitle || region.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted font-medium line-clamp-2 leading-relaxed">
                    {region.tagline || region.description || 'Chặng khám phá năng lực và sản phẩm AIKid.'}
                  </p>

                  {/* Badges */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">
                      <MapPin size={12} className="text-slate-500" />
                      <span>{stationCount} Trạm học</span>
                    </span>
                    {region.ageTrack && (
                      <span className="rounded-xl bg-brand-50 px-2 py-1 text-[11px] font-extrabold text-brand-700">
                        Lớp {region.ageTrack}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectRegion(region.id)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white py-2.5 px-4 text-xs font-black shadow-xs transition cursor-pointer"
                  >
                    <span>Quản lý Trạm học ➔</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/40 p-8 sm:p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-2xs mb-3.5">
            <Layers size={28} />
          </div>
          <h3 className="font-display text-base sm:text-lg font-black text-slate-900">
            Chương trình này chưa có Vùng học nào
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-xs font-bold text-muted leading-relaxed">
            Mỗi chương trình gồm nhiều Vùng học theo cấp độ tăng dần. Hãy tạo vùng đầu tiên để bắt đầu thêm các trạm học.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              className="!min-h-10 text-xs font-black shadow-xs gap-1.5 cursor-pointer"
              onClick={onOpenCreateRegion}
            >
              <Plus size={14} />
              <span>+ Thêm vùng đầu tiên</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="!min-h-10 text-xs font-black border-sky-300 bg-white text-sky-800 hover:bg-sky-50 shadow-xs cursor-pointer"
              onClick={onOpenScriptGenerator}
            >
              <Sparkles size={14} />
              <span>🪄 Tạo từ kịch bản AI</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
