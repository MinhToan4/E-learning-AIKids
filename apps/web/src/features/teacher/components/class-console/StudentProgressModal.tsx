import React from 'react'
import { X, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { StudentProgressData } from './types'

export interface StudentProgressModalProps {
  progressTargetId: string | null
  onClose: () => void
  progressLoading: boolean
  studentProgress: StudentProgressData | null
}

export function StudentProgressModal({
  progressTargetId,
  onClose,
  progressLoading,
  studentProgress,
}: StudentProgressModalProps) {
  if (!progressTargetId) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">LỘ TRÌNH HỌC TẬP</p>
            <h3 id="progress-modal-title" className="font-display text-lg text-slate-900">
              {studentProgress?.student?.nickname || 'Học sinh'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {progressLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <span className="text-xs font-bold text-muted">Đang tải chi tiết lộ trình…</span>
          </div>
        ) : studentProgress ? (
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Status Golden Rules Island */}
            {(() => {
              const quests = studentProgress.progress
              const ruleQuests = quests.filter((q) => {
                const t = q.questTitle.toLowerCase()
                return t.includes('quy tắc') || t.includes('quy tac') || t.includes('rule')
              })
              const isRuleDone =
                ruleQuests.length > 0
                  ? ruleQuests.every((q) => q.status === 'completed')
                  : quests.some((q) => q.status === 'completed')

              const stuckQuest = quests.find(
                (q) => q.status === 'in_progress' || q.status === 'available',
              )

              return (
                <div className="space-y-2">
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-2xl p-3 text-xs font-black border',
                      isRuleDone
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-amber-200 bg-amber-50 text-amber-900',
                    )}
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    <span>
                      {isRuleDone
                        ? '🛡️ Đã hoàn thành Đảo Quy Tắc Vàng AIKI (Huy hiệu Hiệp Sĩ)'
                        : '⏳ Chưa hoàn thành Đảo Quy Tắc — Chưa mở khóa thế giới sáng tạo'}
                    </span>
                  </div>

                  {stuckQuest && (
                    <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-bold text-rose-900">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>
                        📍 Trạm đang học / kẹt:{' '}
                        <strong className="text-rose-950">{stuckQuest.questTitle}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Stations List */}
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-muted mb-2">
                Các trạm học ({studentProgress.progress.length})
              </p>

              {studentProgress.progress.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">Bé chưa bắt đầu trạm nào</p>
              ) : (
                <ul className="space-y-1.5">
                  {studentProgress.progress.map((q, idx) => {
                    const isCompleted = q.status === 'completed'
                    return (
                      <li
                        key={idx}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs transition border',
                          isCompleted
                            ? 'bg-emerald-50/50 border-emerald-100 text-slate-800'
                            : 'bg-slate-50 border-border text-slate-600',
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                              isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600',
                            )}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate font-medium">{q.questTitle}</span>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {q.stars > 0 && (
                            <span className="font-bold text-amber-600">{q.stars} ⭐</span>
                          )}
                          <span
                            className={cn(
                              'rounded-lg px-2 py-0.5 text-[10px] font-extrabold',
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700',
                            )}
                          >
                            {isCompleted ? 'Hoàn thành' : q.status}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        <div className="border-t border-border pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2.5 shrink-0 w-full">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto h-11 px-5 whitespace-nowrap inline-flex items-center justify-center"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
