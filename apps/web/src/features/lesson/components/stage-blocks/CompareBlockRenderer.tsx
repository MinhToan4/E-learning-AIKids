import React from 'react'
import { ChevronRight, ScanSearch, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  AiWarehouseVisual,
  KidBrainVisual,
} from '@/features/lesson/components/AikiRuleVisuals'
import type { LearnCardDraft, StageBlockItem } from '@/features/teacher/lib/authoring'

export interface CompareBlockRendererProps {
  block: StageBlockItem
  card: LearnCardDraft
  stageIndex: number
  isAikiRuleJourney: boolean
  isMobile: boolean
  onZoomImage?: (data: {
    title: string
    subtitle?: string
    url?: string
    description?: string
  }) => void
  onNextStage?: (nextStageIndex: number) => void
}

export function CompareBlockRenderer({
  block,
  card,
  stageIndex,
  isAikiRuleJourney,
  isMobile,
  onZoomImage,
  onNextStage,
}: CompareBlockRendererProps) {
  const compData = (block.compareData || card.compareData) as any
  const leftTitle = compData?.leftTitle || card.visualItems?.[0]?.label || 'Dữ liệu quen thuộc & chung chung'
  const leftText =
    compData?.leftText ||
    card.visualItems?.[0]?.text ||
    'AI chỉ lấy những hình ảnh quen thuộc trong kho hàng ngàn mẫu có sẵn. Ai gõ câu giống nhau thì kết quả cũng giống hệt nhau.'
  const leftImage =
    compData?.leftImage ||
    block.compareImages?.left ||
    card.compareImages?.left ||
    (isAikiRuleJourney ? '/assets/aiki-rules/aiki_compare_ai_warehouse.webp' : undefined)

  const rightTitle = compData?.rightTitle || card.visualItems?.[1]?.label || 'Ý tưởng độc nhất vô nhị'
  const rightText =
    compData?.rightText ||
    card.visualItems?.[1]?.text ||
    'Chỉ có con mới có kỷ niệm riêng, cảm xúc thật, gia đình và sự tưởng tượng độc đáo mà AI không thể tự nghĩ ra được!'
  const rightImage =
    compData?.rightImage ||
    block.compareImages?.right ||
    card.compareImages?.right ||
    (isAikiRuleJourney ? '/assets/aiki-rules/aiki_compare_kid_mind.webp' : undefined)

  return (
    <div
      key={block.id}
      data-testid="block-compare"
      className="rounded-3xl border-3 border-sky-200 bg-white p-5 sm:p-6 shadow-clay animate-fade-up text-left space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-3">
        <div className="flex items-center gap-2 text-sky-800 font-extrabold text-sm uppercase tracking-wider">
          <ScanSearch size={20} className="text-sky-600" />
          {block.title || 'Bảng So Sánh Hai Mặt Bản Chất'}
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-black text-sky-800">
          {isAikiRuleJourney ? `Chặng ${stageIndex + 1}/5` : 'So sánh'}
        </span>
      </div>

      {(block.body || card.body) && (
        <p className="font-display text-lg sm:text-xl font-bold text-text leading-relaxed">
          {block.body || card.body}
        </p>
      )}

      <div className={cn(isMobile ? "grid grid-cols-1 gap-3 items-start" : "grid grid-cols-1 md:grid-cols-2 gap-4 items-start")}>
        {/* Cột 1: Kho của AI */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-black uppercase text-slate-700">
              <span>🤖</span>
              Kho Dữ Liệu Của AI
            </div>
            <h4 className="mt-3 font-display text-lg sm:text-xl font-black text-slate-800">{leftTitle}</h4>
            <p className="mt-1.5 text-base sm:text-lg font-semibold leading-relaxed text-slate-600">
              {leftText}
            </p>
            <AiWarehouseVisual
              imageUrl={leftImage}
              onZoom={
                leftImage
                  ? () =>
                      onZoomImage?.({
                        title: leftTitle,
                        subtitle: 'So sánh bản chất · Kho dữ liệu AI',
                        url: leftImage,
                        description: leftText,
                      })
                  : undefined
              }
              className="mt-3.5"
            />
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-3 text-sm font-bold text-slate-500">
            ⚠️ Không có ký ức riêng của con
          </div>
        </div>

        {/* Cột 2: Bộ Não Sáng Tạo Của Con */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-brand-300 bg-gradient-to-br from-amber-50 to-brand-50 p-4 sm:p-5 shadow-clay">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-100 px-3 py-1 text-xs font-black uppercase text-brand-900">
              <Sparkles size={13} className="text-brand-600 fill-brand-400" />
              Bộ Não Sáng Tạo Của Con
            </div>
            <h4 className="mt-3 font-display text-lg sm:text-xl font-black text-brand-950">{rightTitle}</h4>
            <p className="mt-1.5 text-base sm:text-lg font-semibold leading-relaxed text-brand-900">
              {rightText}
            </p>
            <KidBrainVisual
              imageUrl={rightImage}
              onZoom={
                rightImage
                  ? () =>
                      onZoomImage?.({
                        title: rightTitle,
                        subtitle: 'So sánh bản chất · Bộ não sáng tạo của con',
                        url: rightImage,
                        description: rightText,
                      })
                  : undefined
              }
              className="mt-3.5"
            />
          </div>
          <div className="mt-4 rounded-xl border border-brand-200 bg-white/90 p-3 text-sm font-black text-brand-700">
            ✨ Con chính là thuyền trưởng chỉ huy AI!
          </div>
        </div>
      </div>

      {/* Hàng so sánh chi tiết nếu có rows */}
      {compData?.rows && compData.rows.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border-2 border-sky-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 text-xs uppercase font-black text-sky-900">
              <tr>
                <th className="p-3">Tiêu chí</th>
                <th className="p-3">{leftTitle}</th>
                <th className="p-3">{rightTitle}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 font-semibold">
              {compData.rows.map((row: { aspect: string; left: string; right: string }, rIdx: number) => (
                <tr key={rIdx} className="hover:bg-sky-50/40">
                  <td className="p-3 font-black text-sky-950">{row.aspect}</td>
                  <td className="p-3 text-slate-700">{row.left}</td>
                  <td className="p-3 text-brand-900 font-bold">{row.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(block.tip || card.tip) && (
        <div className="mt-4 rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 text-left shadow-xs">
          <div className="flex items-center gap-2 font-black text-brand-900 text-sm">
            <span>🐱</span>
            <span>Bật mí từ Mèo AIKI:</span>
          </div>
          <p className="mt-1 text-sm font-bold text-brand-950 leading-relaxed">
            {block.tip || card.tip}
          </p>
        </div>
      )}

      {onNextStage && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            className="h-12 px-6 font-extrabold border-2 border-sky-300 hover:bg-sky-100 text-sky-900 cursor-pointer"
            onClick={() => onNextStage(stageIndex + 1)}
          >
            Tiếp tục sang phần tiếp theo
            <ChevronRight size={20} />
          </Button>
        </div>
      )}
    </div>
  )
}
