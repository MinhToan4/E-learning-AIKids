import React, { useState, useEffect, useCallback } from 'react'
import { Lock, Smile, Sparkles, Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeBlock } from '../types'
import { EXPRESSION_BLOCKS, ACTION_BLOCKS } from '../data/creative-blocks-dataset'

export const IdentityLockEngine: React.FC<EngineProps> = ({
  onPromptChange,
  characterName = 'Sóc Bông',
  lockedFeatures = [
    'đội mũ len đỏ có quả bông trắng tinh',
    'chiếc đuôi to xù màu cam uốn cong',
    'đeo túi vải thô màu nâu chéo qua ngực',
  ],
}) => {
  const [selectedExpression, setSelectedExpression] = useState<CreativeBlock>(EXPRESSION_BLOCKS[0])
  const [selectedAction, setSelectedAction] = useState<CreativeBlock>(ACTION_BLOCKS[0])

  const syncPrompt = useCallback(
    (expr: CreativeBlock, act: CreativeBlock) => {
      const activeBlocks: CreativeBlock[] = [expr, act]
      const lockedStr = lockedFeatures.join(', ')
      const assembled = `${characterName} ${lockedStr}, ${expr.text}, ${act.text}`
      onPromptChange(assembled, activeBlocks)
    },
    [characterName, lockedFeatures, onPromptChange]
  )

  useEffect(() => {
    syncPrompt(selectedExpression, selectedAction)
  }, [selectedExpression, selectedAction, syncPrompt])

  const handleSelectExpression = (expr: CreativeBlock) => {
    playInstantSound('click')
    setSelectedExpression(expr)
  }

  const handleSelectAction = (act: CreativeBlock) => {
    playInstantSound('click')
    setSelectedAction(act)
  }

  return (
    <div data-testid="identity-lock-engine" className="flex flex-col gap-3 text-left">
      {/* 3 Ổ Khóa Vàng VIP Bất Biến */}
      <div className="bg-linear-to-r from-purple-50 via-amber-50 to-pink-50 rounded-2xl border-2 border-purple-300 p-3.5 sm:p-4 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Lock className="text-purple-700" size={18} />
            <span className="font-black text-xs sm:text-sm text-purple-950">
              3 Ổ Khóa Vàng VIP Bất Biến: {characterName}
            </span>
          </div>
          <span className="text-[11px] font-black text-purple-900 bg-purple-100/90 px-2 py-0.5 rounded-full">
            Mật mã ADN 🔒
          </span>
        </div>

        <p className="text-[11px] font-bold text-slate-500">
          3 đặc điểm nhận diện này luôn được AKI khóa chặt để nhân vật không bao giờ bị "trôi hình"!
        </p>

        {/* Danh sách 3 đặc điểm khóa */}
        <div className="flex flex-wrap gap-2 pt-1">
          {lockedFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-purple-200 text-purple-900 text-xs font-black shadow-2xs"
            >
              <div className="size-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                🔒
              </div>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bánh Xe 6 Biểu Cảm */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-800">
            <Smile size={16} className="text-amber-500" />
            <span>Bánh Xe 6 Biểu Cảm (Chạm để đổi nét mặt):</span>
          </div>
          <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
            {selectedExpression.label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EXPRESSION_BLOCKS.map((expr) => {
            const isSelected = selectedExpression.id === expr.id

            return (
              <div
                key={expr.id}
                role="button"
                tabIndex={0}
                data-testid={`expression-card-${expr.id}`}
                onClick={() => handleSelectExpression(expr)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectExpression(expr)
                  }
                }}
                className={cn(
                  'min-h-[52px] p-2.5 rounded-xl border-2 transition-all duration-150 cursor-pointer flex items-center gap-2 select-none active:scale-95',
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 text-amber-950 shadow-xs ring-2 ring-amber-300'
                    : 'border-slate-200 bg-white hover:border-amber-300 text-slate-800'
                )}
              >
                <span className="text-2xl shrink-0">{expr.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black truncate">{expr.label}</div>
                  <div className="text-[10px] font-semibold text-slate-400 truncate">
                    {expr.text}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hành động kèm theo */}
      <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-3 shadow-2xs flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-black text-slate-600">Đang làm gì:</span>
        {ACTION_BLOCKS.slice(0, 4).map((act) => {
          const isSelected = selectedAction.id === act.id
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => handleSelectAction(act)}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[32px]',
                isSelected
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              )}
            >
              {act.icon} {act.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
