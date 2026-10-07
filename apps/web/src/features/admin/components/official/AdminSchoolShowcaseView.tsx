import React from 'react'
import { Award, Star } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { SchoolShowcaseItem } from '../tabs/AdminOfficialProgramTab'

export interface AdminSchoolShowcaseViewProps {
  showcaseItems: SchoolShowcaseItem[]
  onApproveShowcase: (id: string) => void
  onAwardStar: (id: string) => void
}

export function AdminSchoolShowcaseView({
  showcaseItems,
  onApproveShowcase,
  onAwardStar,
}: AdminSchoolShowcaseViewProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600">
            <Award className="w-4 h-4" />
            <span>Phân Khu 4: School Showcase & Hall of Fame</span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            🏆 Bảng Vinh Danh & Triển Lãm Tác Phẩm Cấp Trường
          </h3>
        </div>
        <span className="text-xs font-medium text-slate-500">
          Duyệt các tác phẩm xuất sắc để vinh danh trang chủ AIKids
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {showcaseItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-brand-600 uppercase">
                  {item.category === 'art'
                    ? '🎨 Tranh AI'
                    : item.category === 'comic'
                      ? '🎬 Truyện AI'
                      : '🎮 Game AI'}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                    item.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200',
                  )}
                >
                  {item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Tác giả: <strong className="text-slate-700">{item.authorName}</strong> (
                {item.authorAge} tuổi)
              </p>

              <div className="flex items-center gap-1 mt-2 text-amber-500">
                {Array.from({ length: Math.max(1, item.stars) }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-1">({item.stars} ⭐)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {item.status === 'pending' ? (
                <button
                  type="button"
                  onClick={() => onApproveShowcase(item.id)}
                  className="w-full py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer text-center"
                >
                  Duyệt Showcase
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onAwardStar(item.id)}
                  className="w-full py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <Star className="w-3 h-3 fill-white" />
                  <span>Tặng sao vinh dự</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
