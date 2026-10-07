import React from 'react'
import { Compass, Shield, Lock, Unlock } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { IslandGovernanceItem } from '../tabs/AdminOfficialProgramTab'

export interface AdminIslandsGovernanceViewProps {
  islands: IslandGovernanceItem[]
  pacingMode: 'self_paced' | 'scheduled'
  safetyShieldEnabled: boolean
  onTogglePacing: () => void
  onToggleSafetyShield: () => void
  onToggleIslandStatus: (id: number) => void
}

export function AdminIslandsGovernanceView({
  islands,
  pacingMode,
  safetyShieldEnabled,
  onTogglePacing,
  onToggleSafetyShield,
  onToggleIslandStatus,
}: AdminIslandsGovernanceViewProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-600">
            <Compass className="w-4 h-4" />
            <span>Phân Khu 1: Unlock & Pacing Governance</span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            🗺️ Quản Trị 6 Vùng Đảo & Điều Phối Mở Trạm Toàn Trường
          </h3>
        </div>

        {/* Các nút điều phối cấp trường */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle nhịp học */}
          <button
            type="button"
            onClick={onTogglePacing}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs',
              pacingMode === 'self_paced'
                ? 'bg-sky-50 text-sky-800 border-sky-300'
                : 'bg-indigo-50 text-indigo-800 border-indigo-300',
            )}
          >
            <span>
              {pacingMode === 'self_paced'
                ? '⚡ Tự do theo nhịp bé (Self-paced)'
                : '📅 Mở tuần tự theo lịch trường'}
            </span>
          </button>

          {/* Toggle Child Safety Shield */}
          <button
            type="button"
            onClick={onToggleSafetyShield}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs',
              safetyShieldEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300',
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>
              {safetyShieldEnabled ? '🛡️ AI Child-Safety Shield: BẬT' : '⚠️ AI Safety Shield: TẮT'}
            </span>
          </button>
        </div>
      </div>

      {/* Lưới 6 Vùng Đảo Chuẩn */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {islands.map((island) => {
          const isUnlocked = island.status === 'active'

          return (
            <div
              key={island.id}
              className={cn(
                'p-4 rounded-2xl border transition-all relative flex flex-col justify-between',
                isUnlocked
                  ? 'border-slate-200/90 bg-white hover:border-brand-400 hover:shadow-md'
                  : 'border-slate-200/60 bg-slate-50/60 opacity-80',
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{island.icon}</span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                        {island.code}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm leading-tight">
                        {island.name}
                      </h4>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                      isUnlocked
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600',
                    )}
                  >
                    {isUnlocked ? 'Đang mở' : 'Khóa trạm'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-brand-600">{island.subtitle}</p>
                <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                  {island.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {island.targetCohort}
                </span>

                <button
                  type="button"
                  onClick={() => onToggleIslandStatus(island.id)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer',
                    isUnlocked
                      ? 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                      : 'bg-brand-500 hover:bg-brand-600 text-white',
                  )}
                >
                  {isUnlocked ? (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Khóa trạm</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" />
                      <span>Mở khóa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
