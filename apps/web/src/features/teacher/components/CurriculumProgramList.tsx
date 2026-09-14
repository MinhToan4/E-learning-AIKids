import { useState, useMemo } from 'react'
import { Plus, Sparkles, Search, Compass, Layers, ArrowRight, Shield } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { programArtworkHint } from '@/shared/config/assets'
import type { LearningProgram } from '../types'

type CurriculumProgramListProps = {
  programs: LearningProgram[]
  selectedSpace: LearningProgram['source']
  onSelectSpace: (space: LearningProgram['source']) => void
  onSelectProgram: (programId: string) => void
  onOpenCreateProgram: () => void
  onOpenScriptGenerator: () => void
  onOpenRulePicker: () => void
}

const LEARNING_SPACES = [
  {
    id: 'aikid_official' as const,
    label: 'AiKid chính thức',
    caption: 'Nền tảng chuẩn hóa quốc tế',
    icon: '🏰',
  },
  {
    id: 'workspace' as const,
    label: 'Trường học',
    caption: 'Tổ chức, trường học & lớp',
    icon: '🏫',
  },
  {
    id: 'creator_marketplace' as const,
    label: 'Học tự do',
    caption: 'Giáo viên & xưởng sáng tạo',
    icon: '🎨',
  },
]

export function CurriculumProgramList({
  programs,
  selectedSpace,
  onSelectSpace,
  onSelectProgram,
  onOpenCreateProgram,
  onOpenScriptGenerator,
  onOpenRulePicker,
}: CurriculumProgramListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const visiblePrograms = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('vi')
    return programs.filter((program) => {
      if (program.source !== selectedSpace) return false
      if (!q) return true
      const searchable = `${program.title} ${program.description} ${program.regions.map((r) => r.title).join(' ')}`.toLocaleLowerCase('vi')
      return searchable.includes(q)
    })
  }, [programs, selectedSpace, searchQuery])

  return (
    <div className="flex flex-col gap-5">
      {/* Header cấp 1 & Hành động chính */}
      <section className="rounded-3xl border-2 border-border/80 bg-white p-4 sm:p-5 shadow-xs" aria-labelledby="program-tier-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-brand-100 text-sm font-black text-brand-700 shadow-2xs">
              1
            </span>
            <div>
              <h2 id="program-tier-title" className="font-display text-base sm:text-lg font-black text-slate-900">
                Cấp 1: Chương Trình Học (Learning Programs)
              </h2>
              <p className="text-xs text-muted font-bold">
                Chọn Không Gian và Chương Trình Khung để quản lý các Vùng học & Trạm kiến thức
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              id="open-course-modal-btn"
              variant="secondary"
              className="!min-h-9 !text-xs font-black border-brand-300 bg-white text-brand-800 hover:bg-brand-50 shadow-2xs cursor-pointer"
              onClick={onOpenCreateProgram}
            >
              <Plus size={14} />
              <span>Tạo giáo trình</span>
            </Button>

            <Button
              type="button"
              className="!min-h-9 !text-xs font-black shadow-xs gap-1.5 cursor-pointer"
              onClick={onOpenScriptGenerator}
            >
              <Sparkles size={14} />
              <span>🪄 Tạo từ kịch bản AI</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="!min-h-9 !text-xs font-black border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-2xs gap-1.5 cursor-pointer"
              onClick={onOpenRulePicker}
            >
              <Shield size={14} className="text-amber-700" />
              <span>Soạn 10 Quy Tắc Vàng</span>
            </Button>
          </div>
        </div>

        {/* 3 Không gian học tập */}
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3" role="tablist" aria-label="Không gian học tập">
          {LEARNING_SPACES.map((space) => {
            const count = programs.filter((p) => p.source === space.id).length
            const isSelected = selectedSpace === space.id
            return (
              <button
                key={space.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectSpace(space.id)}
                className={cn(
                  'rounded-2xl border-2 p-3 text-left transition cursor-pointer flex items-center justify-between gap-2',
                  isSelected
                    ? 'border-brand-500 bg-brand-50/80 text-brand-950 shadow-xs ring-2 ring-brand-200'
                    : 'border-border bg-slate-50/50 text-slate-700 hover:border-brand-200 hover:bg-white'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl" aria-hidden="true">{space.icon}</span>
                  <div>
                    <span className="block font-black text-xs sm:text-sm">{space.label}</span>
                    <span className="block text-[11px] text-muted font-semibold mt-0.5">{space.caption}</span>
                  </div>
                </div>
                <span className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-black',
                  isSelected ? 'bg-brand-500 text-white' : 'bg-white border border-border text-muted'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search bar */}
        <div className="mt-4 relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            <Search size={16} aria-hidden="true" />
          </span>
          <input
            type="search"
            aria-label="Tìm kiếm chương trình"
            placeholder="Tìm theo tên chương trình, mô tả hoặc vùng học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-10 rounded-xl border border-border bg-slate-50/70 pl-9 pr-3 text-xs sm:text-sm font-bold outline-none transition focus:border-brand-400 focus:bg-white"
          />
        </div>
      </section>

      {/* Danh sách thẻ Programs */}
      {visiblePrograms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visiblePrograms.map((program) => {
            const artwork = programArtworkHint({ id: program.id, title: program.title, imageUrl: program.imageUrl })
            const totalStations = program.regions.reduce(
              (sum, region) => sum + region.lectures.filter((l) => !l.archived).length,
              0
            )

            return (
              <article
                key={program.id}
                className="group flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-white p-5 shadow-xs transition hover:border-brand-300 hover:shadow-md"
              >
                <div>
                  {/* Top line: Icon / Artwork + Badge mở khóa */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/60 overflow-hidden shadow-2xs">
                      {artwork ? (
                        <img src={artwork} alt="" className="size-full object-cover" />
                      ) : (
                        <Compass className="size-6 text-brand-600" />
                      )}
                    </div>
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider',
                      program.unlockMode === 'parallel'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    )}>
                      {program.unlockMode === 'parallel' ? 'Mở song song' : 'Mở tuần tự'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display text-base font-black text-slate-900 group-hover:text-brand-700 transition">
                    {program.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted font-medium line-clamp-2 leading-relaxed">
                    {program.description || 'Chương trình giảng dạy đa phương tiện và game engine AiKid.'}
                  </p>

                  {/* Metadata chips */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">
                      <Layers size={13} className="text-slate-500" />
                      <span>{program.regions.length} Vùng học</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-800 border border-amber-200/60">
                      <span>🎯 {totalStations} Trạm</span>
                    </span>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-5 pt-3.5 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => onSelectProgram(program.id)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white py-2.5 px-4 text-xs font-black shadow-xs transition cursor-pointer"
                  >
                    <span>Quản lý các Vùng ➔</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-8 sm:p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-2xs mb-3.5">
            <Sparkles size={28} />
          </div>
          <h3 className="font-display text-base sm:text-lg font-black text-slate-900">
            {selectedSpace === 'workspace'
              ? 'Chưa có chương trình nào trong không gian Trường học'
              : selectedSpace === 'creator_marketplace'
                ? 'Chưa có chương trình nào trong không gian Học tự do'
                : 'Chưa có chương trình nào trong không gian AiKid chính thức'}
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-xs font-bold text-muted leading-relaxed">
            {selectedSpace === 'workspace'
              ? 'Tạo các chương trình học tùy biến theo giáo án hoặc khối lớp của trường bạn.'
              : 'Bắt đầu biên soạn chương trình sáng tạo mới hoặc dùng AI trợ lý phân tích giáo án.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="!min-h-10 text-xs font-black border-brand-300 bg-white text-brand-800 hover:bg-brand-50 shadow-xs cursor-pointer"
              onClick={onOpenCreateProgram}
            >
              <Plus size={14} />
              <span>+ Tạo giáo trình</span>
            </Button>
            <Button
              type="button"
              className="!min-h-10 text-xs font-black shadow-xs gap-1.5 cursor-pointer"
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
