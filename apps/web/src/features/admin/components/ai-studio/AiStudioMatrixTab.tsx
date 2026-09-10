import React from 'react'
import { Layers } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { AiPlanPolicy } from '@/shared/lib/api'
import { KNOWN_PROVIDERS, PLANS_CONFIG } from './types'

export interface AiStudioMatrixTabProps {
  saving: boolean
  planMatrix: Record<string, AiPlanPolicy>
  onTogglePlanProvider: (planId: string, providerId: string) => void
  onDefaultRouteSelect: (planId: string, primaryProvider: string) => void
  onSavePlanMatrix: () => Promise<void>
}

export function AiStudioMatrixTab({
  saving,
  planMatrix,
  onTogglePlanProvider,
  onDefaultRouteSelect,
  onSavePlanMatrix,
}: AiStudioMatrixTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="ui-card p-4 border-2 border-border/80 bg-surface shadow-soft rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-brand-600 font-extrabold text-[11px] uppercase tracking-wider">
              <Layers size={14} />
              <span>Plan Provider Policy Matrix</span>
            </div>
            <h3 className="font-display text-lg font-bold text-text mt-0.5">
              Ma Trận Phân Quyền AI Theo Gói Học (AI Kids Plans)
            </h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed max-w-2xl">
              Kiểm soát chính xác nhà cung cấp nào được phép sử dụng cho từng hạng học sinh (Free vs Pro). Giúp tối ưu hóa chi phí vận hành mà vẫn đảm bảo trải nghiệm VIP.
            </p>
          </div>

          <Button onClick={() => void onSavePlanMatrix()} disabled={saving} className="min-h-9 px-4 text-xs font-bold">
            Lưu ma trận gói học
          </Button>
        </div>

        {/* Matrix Table - High Density */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-border/80 text-[11px] font-extrabold uppercase tracking-wider text-muted">
                <th className="py-2.5 px-3 min-w-[180px]">Gói Học AI Kids</th>
                <th className="py-2.5 px-2 text-center">Gemini Native</th>
                <th className="py-2.5 px-2 text-center">Vertex AI</th>
                <th className="py-2.5 px-2 text-center">Vidtory SDK</th>
                <th className="py-2.5 px-2 text-center">Google Flow</th>
                <th className="py-2.5 px-2 text-center">Dreamina</th>
                <th className="py-2.5 px-2 text-center">OpenAI</th>
                <th className="py-2.5 px-3 min-w-[160px]">Tuyến Tạo Ảnh Mặc Định</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {PLANS_CONFIG.map((plan) => {
                const currentPlan = planMatrix[plan.id] || {
                  allowedProviders: [],
                  defaultImageRoute: [],
                }
                const allowed = currentPlan.allowedProviders || []
                const defaultRoute = currentPlan.defaultImageRoute?.[0] || allowed[0] || 'gflow'

                return (
                  <tr key={plan.id} className="hover:bg-brand-50/30 transition">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-display font-bold text-sm text-text">
                          {plan.name}
                        </span>
                        <span
                          className={cn(
                            'inline-block w-fit mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                            plan.color,
                          )}
                        >
                          {plan.badge}
                        </span>
                        {currentPlan.note && (
                          <span className="text-[10px] text-muted mt-0.5 italic">
                            {currentPlan.note}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Provider Checkboxes */}
                    {['gemini-native', 'vertex', 'vidtory-sdk', 'gflow', 'dreamina', 'openai'].map(
                      (provId) => {
                        const isChecked = allowed.includes(provId)
                        return (
                          <td key={provId} className="py-3 px-2 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer p-0.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onTogglePlanProvider(plan.id, provId)}
                                className="w-4 h-4 rounded-md border-2 border-border text-brand-600 accent-brand-500 cursor-pointer"
                              />
                            </label>
                          </td>
                        )
                      },
                    )}

                    {/* Default Image Route Select */}
                    <td className="py-3 px-3">
                      <select
                        value={defaultRoute}
                        onChange={(e) => onDefaultRouteSelect(plan.id, e.target.value)}
                        className="w-full min-h-8 rounded-xl border-2 border-border px-2 text-xs font-bold bg-surface"
                      >
                        {allowed.map((provId) => {
                          const meta = KNOWN_PROVIDERS.find((p) => p.id === provId)
                          return (
                            <option key={provId} value={provId}>
                              {meta?.displayName || provId}
                            </option>
                          )
                        })}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
