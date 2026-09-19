import { useState, useMemo } from 'react'
import {
  SoftClaySproutIcon,
  SoftClayPlantIcon,
  SoftClayFlowerIcon,
} from './ProgressPassportIcons'

export type CompetencyMap = {
  status: 'ready' | 'configuration_required'
  frameworks: Array<{
    id: string
    name: string
    disclaimer: string
    domains: Array<{
      id: string
      name: string
      skills: Array<{
        id: string
        name: string
        learnerLabel: string
        result: {
          level: 'no_data' | 'not_met' | 'developing' | 'achieved'
          scorePercent: number | null
          evidenceCount: number
        }
      }>
    }>
  }>
}

export interface SkillGardenSectionProps {
  competency: CompetencyMap | null
}

type SkillFilter = 'all' | 'achieved' | 'developing' | 'not_met'

export function SkillGardenSection({ competency }: SkillGardenSectionProps) {
  const [filter, setFilter] = useState<SkillFilter>('all')

  const allSkills = useMemo(() => {
    if (!competency || competency.status === 'configuration_required') return []
    return competency.frameworks.flatMap((framework) =>
      framework.domains.flatMap((domain) =>
        domain.skills.map((skill) => ({
          ...skill,
          domainName: domain.name,
        }))
      )
    )
  }, [competency])

  const counts = useMemo(() => {
    let achieved = 0
    let developing = 0
    let notMet = 0

    allSkills.forEach((s) => {
      if (s.result.level === 'achieved') achieved++
      else if (s.result.level === 'developing') developing++
      else notMet++
    })

    return { achieved, developing, notMet, total: allSkills.length }
  }, [allSkills])

  const filteredSkills = useMemo(() => {
    if (filter === 'all') return allSkills
    if (filter === 'achieved') return allSkills.filter((s) => s.result.level === 'achieved')
    if (filter === 'developing') return allSkills.filter((s) => s.result.level === 'developing')
    return allSkills.filter((s) => s.result.level !== 'achieved' && s.result.level !== 'developing')
  }, [allSkills, filter])

  function getGrowthConfig(level: string) {
    if (level === 'achieved') {
      return {
        label: 'Đã tỏa sáng',
        description: 'Học sinh đã làm chủ và thể hiện kỹ năng xuất sắc trong các bài học.',
        icon: <SoftClayFlowerIcon size={26} />,
        cardClass: 'border-pink-200 bg-linear-to-br from-pink-50/60 via-white to-rose-50/30 hover:border-pink-300',
        badgeClass: 'bg-pink-100 text-pink-800 border-pink-200',
        fillClass: 'bg-pink-500',
        stepCount: 3,
      }
    }
    if (level === 'developing') {
      return {
        label: 'Đang lớn lên',
        description: 'Mỗi lần luyện tập thêm sẽ giúp kỹ năng này ngày càng vững vàng hơn.',
        icon: <SoftClayPlantIcon size={26} />,
        cardClass: 'border-amber-200 bg-linear-to-br from-amber-50/60 via-white to-yellow-50/30 hover:border-amber-300',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
        fillClass: 'bg-amber-400',
        stepCount: 2,
      }
    }
    return {
      label: 'Mới nảy mầm',
      description: 'Hạt mầm tri thức đã bắt đầu đâm chồi, chờ học sinh cùng chăm sóc mỗi ngày.',
      icon: <SoftClaySproutIcon size={26} />,
      cardClass: 'border-emerald-200 bg-linear-to-br from-emerald-50/60 via-white to-teal-50/30 hover:border-emerald-300',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fillClass: 'bg-emerald-400',
      stepCount: 1,
    }
  }

  return (
    <section
      className="ui-card rounded-3xl border-3 border-white/90 bg-linear-to-br from-white via-slate-50/60 to-emerald-50/20 p-5 sm:p-7 shadow-clay w-full min-w-0"
      aria-labelledby="skill-garden-title"
    >
      {/* Header khu vườn */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-700">
            <SoftClayPlantIcon size={18} />
            <span>Khu Vườn Tri Thức Montessori</span>
          </div>
          <h2
            id="skill-garden-title"
            className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mt-1"
          >
            Khu Vườn Kỹ Năng Đang Nở Rộ
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 max-w-xl">
            Mỗi bài học học sinh vượt qua như một hạt giống được tưới tắm để vươn mình thành bông hoa rực rỡ.
          </p>
        </div>

        {/* 3 Thống kê giai đoạn */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 rounded-2xl border border-pink-200 bg-pink-50/80 px-3 py-1.5 shadow-2xs">
            <SoftClayFlowerIcon size={20} />
            <div>
              <p className="text-2xs font-extrabold text-pink-700 leading-none">Tỏa sáng</p>
              <p className="font-display text-base font-black text-pink-900">{counts.achieved}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 shadow-2xs">
            <SoftClayPlantIcon size={20} />
            <div>
              <p className="text-2xs font-extrabold text-amber-800 leading-none">Đang lớn</p>
              <p className="font-display text-base font-black text-amber-950">{counts.developing}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 shadow-2xs">
            <SoftClaySproutIcon size={20} />
            <div>
              <p className="text-2xs font-extrabold text-emerald-700 leading-none">Nảy mầm</p>
              <p className="font-display text-base font-black text-emerald-950">{counts.notMet}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất Cả ({allSkills.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('achieved')}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all border ${
            filter === 'achieved'
              ? 'bg-pink-500 text-white border-pink-600 shadow-xs'
              : 'bg-white text-pink-800 border-pink-200 hover:bg-pink-50'
          }`}
        >
          <SoftClayFlowerIcon size={16} />
          <span>Đã Tỏa Sáng ({counts.achieved})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('developing')}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all border ${
            filter === 'developing'
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <SoftClayPlantIcon size={16} />
          <span>Đang Lớn Lên ({counts.developing})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('not_met')}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all border ${
            filter === 'not_met'
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <SoftClaySproutIcon size={16} />
          <span>Mới Nảy Mầm ({counts.notMet})</span>
        </button>
      </div>

      {/* Lưới thẻ kỹ năng */}
      {filteredSkills.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-8 text-center">
          <p className="font-bold text-slate-600">
            Kỹ năng của học sinh sẽ sáng lên ngay sau những chặng học đầu tiên.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredSkills.map((skill) => {
            const growth = getGrowthConfig(skill.result.level)

            return (
              <article
                key={skill.id}
                className={`min-w-0 rounded-3xl border-2 p-4 sm:p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft ${growth.cardClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0 p-1.5 rounded-xl bg-white shadow-2xs">
                      {growth.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-2">
                        {skill.learnerLabel || skill.name}
                      </h3>
                      <p className="text-2xs font-bold text-slate-500 truncate">
                        {skill.domainName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-xl border px-2 py-0.5 text-2xs font-black uppercase ${growth.badgeClass}`}
                  >
                    {growth.label}
                  </span>
                </div>

                {/* 3 Nấc Thang Giọt Sương Tiến Bộ */}
                <div
                  className="mt-4 grid grid-cols-3 gap-1.5"
                  aria-label={`${skill.learnerLabel || skill.name}: ${growth.label}`}
                >
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        step <= growth.stepCount ? growth.fillClass : 'bg-slate-200/70'
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                  {growth.description}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
