import React, { useState, useEffect, useCallback } from 'react'
import { Stethoscope, CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeBlock, BlockSlot } from '../types'
import { CURE_BLOCKS } from '../data/creative-blocks-dataset'

interface ClinicCase {
  id: string
  title: string
  patientName: string
  problemText: string
  brokenPrompt: string
  expectedCureId: string
  icon: string
  sampleIllustration: string
}

const CLINIC_CASES: ClinicCase[] = [
  {
    id: 'case-hand',
    title: 'Bàn Tay Hiệp Sĩ Biến Dạng',
    patientName: 'Hiệp Sĩ Bạc',
    problemText: 'Úi chà! Bàn tay hiệp sĩ chỉ có 3 ngón tay dị tật kỳ quặc! Bé hãy kê đơn thuốc chữa chuẩn 5 ngón tay nhé!',
    brokenPrompt: 'Hiệp sĩ bọc giáp cầm kiếm thần',
    expectedCureId: 'cure-5-ngon-tay',
    icon: '✋',
    sampleIllustration: 'Bàn tay thiếu ngón',
  },
  {
    id: 'case-squirrel',
    title: 'Sóc Bông Bị Mất Mũ Len',
    patientName: 'Sóc Bông',
    problemText: 'Ôi lạnh quá! Sóc Bông bị gió thổi bay mất chiếc mũ len đỏ quả bông trắng rồi! Hãy kê đơn đội lại mũ nào!',
    brokenPrompt: 'Sóc Bông đang ôm quả thông trong rừng',
    expectedCureId: 'cure-mu-len',
    icon: '🐿️',
    sampleIllustration: 'Sóc đầu trần',
  },
  {
    id: 'case-cat',
    title: 'Mèo Mướp Trôi Lơ Lửng',
    patientName: 'Mèo Mướp',
    problemText: 'Mèo béo đang trôi lơ lửng giữa hư không không có chỗ nằm ngủ khò khò! Hãy kê đơn thêm chiếc ghế mây êm ái!',
    brokenPrompt: 'Mèo mướp vàng béo tròn đang ngủ',
    expectedCureId: 'cure-them-nen-ghe',
    icon: '🐱',
    sampleIllustration: 'Mèo lơ lửng',
  },
]

export const PromptDoctorEngine: React.FC<EngineProps> = ({
  onPromptChange,
}) => {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0)
  const [slottedCure, setSlottedCure] = useState<CreativeBlock | null>(null)

  const currentCase = CLINIC_CASES[activeCaseIndex]
  const isCured = slottedCure?.id === currentCase.expectedCureId

  const syncPrompt = useCallback(
    (cure: CreativeBlock | null, clinicCase: ClinicCase) => {
      const activeBlocks: CreativeBlock[] = []
      let fullPrompt = clinicCase.brokenPrompt

      if (cure) {
        activeBlocks.push(cure)
        fullPrompt = `${clinicCase.brokenPrompt}, ${cure.text}`
      }

      onPromptChange(fullPrompt, activeBlocks)
    },
    [onPromptChange]
  )

  useEffect(() => {
    syncPrompt(slottedCure, currentCase)
  }, [slottedCure, currentCase, syncPrompt])

  const handleSelectCure = (cure: CreativeBlock) => {
    playInstantSound('click')
    setSlottedCure(cure)
    if (cure.id === currentCase.expectedCureId) {
      playInstantSound('correct')
    }
  }

  const handleRemoveCure = () => {
    playInstantSound('click')
    setSlottedCure(null)
  }

  const handleSwitchCase = (idx: number) => {
    playInstantSound('click')
    setActiveCaseIndex(idx)
    setSlottedCure(null)
  }

  return (
    <div data-testid="prompt-doctor-engine" className="flex flex-col gap-3 text-left">
      {/* Hồ sơ bệnh án tranh hỏng */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border-2 border-emerald-300 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="text-emerald-700" size={18} />
            <span className="font-black text-xs sm:text-sm text-emerald-950">
              Bệnh Viện Câu Lệnh AIKids · Bác Sĩ Bắt Bệnh
            </span>
          </div>
          <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
            Bài 1.4: Kỹ sư tài ba
          </span>
        </div>

        {/* Thanh chọn ca bệnh */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {CLINIC_CASES.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSwitchCase(idx)}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-all cursor-pointer min-h-[34px]',
                activeCaseIndex === idx
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-emerald-100/60 border border-slate-200'
              )}
            >
              <span>{c.icon}</span>
              <span>Ca {idx + 1}: {c.patientName}</span>
            </button>
          ))}
        </div>

        {/* Thẻ chẩn đoán bệnh */}
        <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-2xs flex items-start gap-3">
          <div className="size-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-xl shrink-0">
            <AlertTriangle className="text-rose-600" size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-900">
              Chẩn đoán ca bệnh: <span className="text-rose-600">{currentCase.title}</span>
            </div>
            <p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed">
              {currentCase.problemText}
            </p>
            <div className="mt-2 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
              Câu lệnh gốc bị lỗi: "{currentCase.brokenPrompt}"
            </div>
          </div>
        </div>
      </div>

      {/* Ô Kê Đơn Thuốc Chữa Bệnh */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-black text-xs sm:text-sm text-slate-800">
            💊 Đơn Thuốc Chữa Bệnh Cho Tranh
          </span>
          {isCured && (
            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full animate-bounce">
              <CheckCircle2 size={13} strokeWidth={3} />
              Đã bốc đúng thuốc! Tranh sẽ hết lỗi!
            </span>
          )}
        </div>

        <div
          data-testid="doctor-cure-slot"
          className={cn(
            'min-h-[58px] rounded-2xl border-2 p-3 flex items-center justify-between transition-all duration-200',
            slottedCure
              ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
              : 'border-dashed border-slate-300 bg-slate-50/70 text-slate-400'
          )}
        >
          {slottedCure ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xl">{slottedCure.icon}</span>
                <div>
                  <div className="text-xs font-black text-slate-900">{slottedCure.label}</div>
                  <div className="text-[11px] font-bold text-emerald-800">{slottedCure.text}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCure}
                className="size-7 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <div className="w-full text-center text-xs font-semibold italic text-slate-400">
              👉 Chạm vào 1 liều thuốc bên dưới để kê đơn chữa bệnh!
            </div>
          )}
        </div>
      </div>

      {/* Tủ Thuốc Câu Lệnh */}
      <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center gap-1.5 font-black text-xs text-slate-700">
          <Sparkles size={14} className="text-amber-500" />
          <span>Tủ Thuốc Thần Kỳ (Chạm thẻ thuốc để nạp vào đơn)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CURE_BLOCKS.map((cure) => {
            const isSelected = slottedCure?.id === cure.id

            return (
              <div
                key={cure.id}
                role="button"
                tabIndex={0}
                data-testid={`cure-card-${cure.id}`}
                onClick={() => handleSelectCure(cure)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectCure(cure)
                  }
                }}
                className={cn(
                  'p-2.5 rounded-xl border-2 transition-all duration-150 cursor-pointer flex items-center gap-2.5 select-none active:scale-95',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-emerald-300 text-slate-800'
                )}
              >
                <span className="text-xl shrink-0">{cure.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black truncate">{cure.label}</div>
                  <div className="text-[10px] font-semibold text-slate-400 truncate">
                    {cure.hint}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
