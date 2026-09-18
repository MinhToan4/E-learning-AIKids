import React, { useState, useEffect, useCallback } from 'react'
import { Stethoscope, CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeBlock } from '../types'
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
  refImageUrl: string
  curedImageUrl: string
}

export interface PromptDoctorEngineProps extends EngineProps {
  onRefImageChange?: (url: string) => void
  activeCaseIndex?: number
  onCaseChange?: (index: number) => void
}

const CLINIC_CASES: ClinicCase[] = [
  {
    id: 'case-hand',
    title: 'Bàn Tay Hiệp Sĩ Biến Dạng',
    patientName: 'Hiệp Sĩ Bạc',
    problemText: 'Úi chà! Bàn tay hiệp sĩ bị dị tật kỳ quặc! Bé hãy kê đơn thuốc chữa chuẩn 5 ngón tay bọc giáp bạc nhé!',
    brokenPrompt: 'Hiệp sĩ bọc giáp cầm kiếm thần',
    expectedCureId: 'cure-5-ngon-tay',
    icon: '✋',
    sampleIllustration: 'Bàn tay biến dạng dị tật',
    refImageUrl: '/assets/aiki-doctor/doctor_hand_broken_v1.webp',
    curedImageUrl: '/assets/aiki-doctor/doctor_hand_cured_v1.webp',
  },
  {
    id: 'case-squirrel',
    title: 'Sóc Bông Bị Mất Mũ Len',
    patientName: 'Sóc Bông',
    problemText: 'Ôi lạnh quá! Sóc Bông bị gió thổi bay mất chiếc mũ len đỏ quả bông trắng rồi! Hãy kê đơn đội lại mũ ấm nào!',
    brokenPrompt: 'Sóc Bông đang ôm quả thông trong rừng',
    expectedCureId: 'cure-mu-len',
    icon: '🐿️',
    sampleIllustration: 'Sóc đầu trần',
    refImageUrl: '/assets/aiki-doctor/doctor_squirrel_shivering_v1.webp',
    curedImageUrl: '/assets/aiki-doctor/doctor_squirrel_cured_v1.webp',
  },
  {
    id: 'case-cat',
    title: 'Mèo Mướp Trôi Lơ Lửng',
    patientName: 'Mèo Mướp',
    problemText: 'Mèo béo đang trôi lơ lửng giữa nền trắng không có chỗ nằm ngủ khò khò! Hãy kê đơn thêm chiếc ghế mây êm ái!',
    brokenPrompt: 'Mèo mướp vàng béo tròn đang ngủ',
    expectedCureId: 'cure-them-nen-ghe',
    icon: '🐱',
    sampleIllustration: 'Mèo lơ lửng',
    refImageUrl: '/assets/aiki-doctor/doctor_cat_floating_v1.webp',
    curedImageUrl: '/assets/aiki-doctor/doctor_cat_cured_v1.webp',
  },
  {
    id: 'case-trash',
    title: 'Tranh Lem Nhem Nhiều Rác',
    patientName: 'Bức Tranh Lem Nhem',
    problemText: 'Úi chà! Phông nền có quá nhiều chi tiết rác thừa lem nhem làm rối mắt! Bé hãy kê đơn dọn sạch phông nền sáng ngời nhé!',
    brokenPrompt: 'Một bức tranh có nhiều đồ vật rác thừa lộn xộn',
    expectedCureId: 'cure-xoa-rac',
    icon: '🧹',
    sampleIllustration: 'Tranh lem nhem chi tiết thừa',
    refImageUrl: '/assets/aiki-doctor/doctor_clutter_broken_v1.webp',
    curedImageUrl: '/assets/aiki-doctor/doctor_clutter_cured_v1.webp',
  },
]

export const CASE_CURES: Record<string, CreativeBlock[]> = {
  'case-hand': [
    {
      id: 'cure-5-ngon-tay',
      label: 'Vẽ chuẩn 5 ngón tay giáp',
      text: 'bàn tay bọc găng giáp bạc có đầy đủ chuẩn xác đúng 5 ngón tay rõ ràng',
      category: 'cure',
      icon: '✋',
      colorScheme: 'indigo',
      hint: 'Chữa dứt điểm dị tật thừa ngón',
    },
    {
      id: 'cure-mu-len',
      label: 'Đội mũ len đỏ quả bông',
      text: 'đội ngay ngắn chiếc mũ len đỏ quả bông trắng ấm áp trên đầu',
      category: 'cure',
      icon: '🧶',
      colorScheme: 'rose',
      hint: 'Ủ ấm đầu mùa đông (Thuốc của Sóc Bông)',
    },
    {
      id: 'cure-them-nen-ghe',
      label: 'Ghế mây đệm êm ái',
      text: 'đang nằm ngủ cuộn tròn trên chiếc ghế mây lót đệm êm ái cạnh cửa sổ',
      category: 'cure',
      icon: '🪑',
      colorScheme: 'amber',
      hint: 'Chỗ ngủ êm ái (Thuốc của Mèo Mướp)',
    },
    {
      id: 'cure-xoa-rac',
      label: 'Dọn sạch phông nền',
      text: 'phông nền xưởng rèn sạch sẽ gọn gàng ánh sáng rạng ngời không chi tiết thừa',
      category: 'cure',
      icon: '🧹',
      colorScheme: 'mint',
      hint: 'Dọn dẹp rác nền (Thuốc của Tranh Lem Nhem)',
    },
  ],
  'case-squirrel': [
    {
      id: 'cure-mu-len',
      label: 'Đội mũ len đỏ quả bông',
      text: 'đội ngay ngắn chiếc mũ len đỏ quả bông trắng ấm áp trên đầu',
      category: 'cure',
      icon: '🧶',
      colorScheme: 'rose',
      hint: 'Ủ ấm đầu mùa đông cho Sóc Bông',
    },
    {
      id: 'cure-5-ngon-tay',
      label: 'Vẽ chuẩn 5 ngón tay giáp',
      text: 'bàn tay bọc găng giáp bạc có đầy đủ chuẩn xác đúng 5 ngón tay rõ ràng',
      category: 'cure',
      icon: '✋',
      colorScheme: 'indigo',
      hint: 'Chữa dị tật tay (Thuốc của Hiệp Sĩ)',
    },
    {
      id: 'cure-them-nen-ghe',
      label: 'Ghế mây đệm êm ái',
      text: 'đang nằm ngủ cuộn tròn trên chiếc ghế mây lót đệm êm ái cạnh cửa sổ',
      category: 'cure',
      icon: '🪑',
      colorScheme: 'amber',
      hint: 'Chỗ ngủ êm ái (Thuốc của Mèo Mướp)',
    },
    {
      id: 'cure-xoa-rac',
      label: 'Dọn sạch phông nền',
      text: 'phông nền khu rừng tuyết trắng sạch sẽ gọn gàng tinh khôi',
      category: 'cure',
      icon: '🧹',
      colorScheme: 'mint',
      hint: 'Dọn dẹp rác nền',
    },
  ],
  'case-cat': [
    {
      id: 'cure-them-nen-ghe',
      label: 'Ghế mây đệm êm ái',
      text: 'đang nằm ngủ cuộn tròn trên chiếc ghế mây lót đệm êm ái cạnh cửa sổ',
      category: 'cure',
      icon: '🪑',
      colorScheme: 'amber',
      hint: 'Chỗ ngủ êm ái cho Mèo Mướp',
    },
    {
      id: 'cure-5-ngon-tay',
      label: 'Vẽ chuẩn 5 ngón tay giáp',
      text: 'bàn tay bọc găng giáp bạc có đầy đủ chuẩn xác đúng 5 ngón tay rõ ràng',
      category: 'cure',
      icon: '✋',
      colorScheme: 'indigo',
      hint: 'Chữa dị tật tay (Thuốc của Hiệp Sĩ)',
    },
    {
      id: 'cure-mu-len',
      label: 'Đội mũ len đỏ quả bông',
      text: 'đội ngay ngắn chiếc mũ len đỏ quả bông trắng ấm áp trên đầu',
      category: 'cure',
      icon: '🧶',
      colorScheme: 'rose',
      hint: 'Ủ ấm đầu mùa đông (Thuốc của Sóc Bông)',
    },
    {
      id: 'cure-xoa-rac',
      label: 'Dọn sạch phông nền',
      text: 'phông nền căn phòng ấm cúng sạch sẽ gọn gàng ánh nắng ngập tràn',
      category: 'cure',
      icon: '🧹',
      colorScheme: 'mint',
      hint: 'Dọn dẹp rác nền',
    },
  ],
  'case-trash': [
    {
      id: 'cure-xoa-rac',
      label: 'Dọn sạch phông nền',
      text: 'phông nền xưởng rèn sạch sẽ gọn gàng ánh sáng rạng ngời không chi tiết thừa',
      category: 'cure',
      icon: '🧹',
      colorScheme: 'mint',
      hint: 'Dọn dẹp rác nền sáng ngời',
    },
    {
      id: 'cure-5-ngon-tay',
      label: 'Vẽ chuẩn 5 ngón tay giáp',
      text: 'bàn tay bọc găng giáp bạc có đầy đủ chuẩn xác đúng 5 ngón tay rõ ràng',
      category: 'cure',
      icon: '✋',
      colorScheme: 'indigo',
      hint: 'Chữa dị tật tay (Thuốc của Hiệp Sĩ)',
    },
    {
      id: 'cure-mu-len',
      label: 'Đội mũ len đỏ quả bông',
      text: 'đội ngay ngắn chiếc mũ len đỏ quả bông trắng ấm áp trên đầu',
      category: 'cure',
      icon: '🧶',
      colorScheme: 'rose',
      hint: 'Ủ ấm đầu mùa đông (Thuốc của Sóc Bông)',
    },
    {
      id: 'cure-them-nen-ghe',
      label: 'Ghế mây đệm êm ái',
      text: 'đang nằm ngủ cuộn tròn trên chiếc ghế mây lót đệm êm ái cạnh cửa sổ',
      category: 'cure',
      icon: '🪑',
      colorScheme: 'amber',
      hint: 'Chỗ ngủ êm ái (Thuốc của Mèo Mướp)',
    },
  ],
}

export const PromptDoctorEngine: React.FC<PromptDoctorEngineProps> = ({
  onPromptChange,
  onRefImageChange,
  activeCaseIndex: propActiveCaseIndex,
  onCaseChange,
  practiceParts,
  activePartIndex,
  onPartChange,
}) => {
  // Trích xuất danh sách ca bệnh từ practiceParts (DB) hoặc fallback sang CLINIC_CASES
  const cases = React.useMemo<ClinicCase[]>(() => {
    if (practiceParts && practiceParts.length > 0) {
      return practiceParts.map((p, idx) => {
        const fallback = CLINIC_CASES[idx % CLINIC_CASES.length]
        const cleanName = p.title.replace(/\s*\(.*?\)/, '').trim() || p.title
        return {
          id: p.id || `case-${p.partNumber || idx + 1}`,
          title: p.title || fallback.title,
          patientName: cleanName,
          problemText: fallback.problemText,
          brokenPrompt: fallback.brokenPrompt,
          expectedCureId: fallback.expectedCureId,
          icon: p.icon || p.emoji || fallback.icon,
          sampleIllustration: fallback.sampleIllustration,
          refImageUrl: p.iconImage || fallback.refImageUrl,
          curedImageUrl: fallback.curedImageUrl,
        }
      })
    }
    return CLINIC_CASES
  }, [practiceParts])

  const [internalCaseIndex, setInternalCaseIndex] = useState(0)
  const effectiveCaseIndex =
    activePartIndex !== undefined
      ? activePartIndex
      : propActiveCaseIndex !== undefined
      ? propActiveCaseIndex
      : internalCaseIndex

  const currentCase = cases[effectiveCaseIndex] || cases[0]
  const currentCures = CASE_CURES[currentCase.id] || CASE_CURES[CLINIC_CASES[0].id] || CURE_BLOCKS

  const [curesByCase, setCuresByCase] = useState<Record<string, CreativeBlock | null>>({})
  const selectedCure = curesByCase[currentCase.id] || null
  const isCured = selectedCure?.id === currentCase.expectedCureId

  const [isDragOver, setIsDragOver] = useState(false)
  const [zoomRef, setZoomRef] = useState(false)

  // Tự động đồng bộ refImageUrl ngầm cho media API
  useEffect(() => {
    onRefImageChange?.(currentCase.refImageUrl)
  }, [currentCase.refImageUrl, onRefImageChange])

  const syncPrompt = useCallback(
    (cure: CreativeBlock | null, clinicCase: ClinicCase) => {
      const brokenBlock: CreativeBlock = {
        id: `broken-${clinicCase.id}`,
        label: clinicCase.brokenPrompt,
        text: clinicCase.brokenPrompt,
        category: 'subject',
        icon: '📜',
        colorScheme: 'amber',
        hint: 'Bệnh án tranh lỗi (câu lệnh cũ)',
      }

      const fullPrompt = cure
        ? `${clinicCase.brokenPrompt}, ${cure.text}`
        : clinicCase.brokenPrompt
      const activeBlocks: CreativeBlock[] = cure ? [brokenBlock, cure] : [brokenBlock]

      onPromptChange(fullPrompt, activeBlocks)
    },
    [onPromptChange]
  )

  useEffect(() => {
    syncPrompt(selectedCure, currentCase)
  }, [selectedCure, currentCase, syncPrompt])

  const handleSelectCure = (cure: CreativeBlock) => {
    if (selectedCure?.id === cure.id) {
      playInstantSound('click')
      setCuresByCase((prev) => ({
        ...prev,
        [currentCase.id]: null,
      }))
      return
    }

    const isCorrect = cure.id === currentCase.expectedCureId
    if (isCorrect) {
      playInstantSound('correct')
    } else {
      playInstantSound('click')
    }
    setCuresByCase((prev) => ({
      ...prev,
      [currentCase.id]: cure,
    }))
  }

  const handleDropCure = (cure: CreativeBlock) => {
    const isCorrect = cure.id === currentCase.expectedCureId
    if (isCorrect) {
      playInstantSound('correct')
    } else {
      playInstantSound('click')
    }
    setCuresByCase((prev) => ({
      ...prev,
      [currentCase.id]: cure,
    }))
  }

  const handleRemoveCure = () => {
    playInstantSound('click')
    setCuresByCase((prev) => ({
      ...prev,
      [currentCase.id]: null,
    }))
  }

  const handleSwitchCase = (idx: number) => {
    playInstantSound('click')
    setInternalCaseIndex(idx)
    onCaseChange?.(idx)
    onPartChange?.(idx)
  }

  return (
    <div data-testid="prompt-doctor-engine" className="flex flex-col gap-2.5 text-left">
      {/* ── BƯỚC 1: 🩺 CHỌN CA BỆNH (CHỦ THỂ BỊ LỖI) ── */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border-2 border-emerald-300 p-2.5 sm:p-3 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-black">
              1
            </span>
            <Stethoscope className="text-emerald-700" size={16} />
            <span className="font-black text-xs sm:text-sm text-emerald-950">
              Bệnh Viện Câu Lệnh AIKids · Bác Sĩ Bắt Bệnh
            </span>
          </div>
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
            Bác Sĩ Bắt Bệnh 🩺
          </span>
        </div>

        {/* Lưới 4 Card ca bệnh nhỏ gọn, vừa vặn không bị scroll */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {cases.map((c, idx) => {
            const isSelected = effectiveCaseIndex === idx
            return (
              <button
                key={c.id}
                type="button"
                data-testid={`clinic-case-button-${c.id}`}
                onClick={() => handleSwitchCase(idx)}
                className={cn(
                  'p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 select-none min-h-[54px] group',
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-clay-xs ring-2 ring-emerald-300 scale-[1.01]'
                    : 'bg-white/95 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-700 shadow-2xs'
                )}
              >
                <div
                  className={cn(
                    'size-9 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105',
                    isSelected ? 'bg-emerald-100 text-emerald-900 shadow-2xs' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {c.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-xs font-black leading-tight break-words line-clamp-2',
                      isSelected ? 'text-emerald-950' : 'text-slate-800'
                    )}
                  >
                    Ca {idx + 1}: {c.patientName}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 leading-tight break-words line-clamp-1">
                    Bệnh án {idx + 1}
                  </div>
                </div>
                {isSelected && (
                  <div className="size-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* ── BƯỚC 2: 🚨 SOI BỆNH ÁN TRANH LỖI (ẢNH REF) ── */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-rose-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          {/* Thumbnail Ảnh Bệnh Án Có Thể Phóng To */}
          <div
            data-testid="doctor-patient-frame"
            onClick={() => setZoomRef(true)}
            className="relative w-full sm:w-28 sm:h-28 aspect-4/3 sm:aspect-square rounded-xl overflow-hidden border-2 border-rose-300 shrink-0 group cursor-pointer bg-rose-50"
            title="Bấm để xem ảnh bệnh án phóng to soi lỗi"
          >
            <img
              src={currentCase.refImageUrl}
              alt={currentCase.title}
              data-testid="doctor-patient-image"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-black">
              <span>🔍 Soi lỗi</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 uppercase tracking-wide mb-1 flex-wrap">
              <span className="flex size-4 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-black shrink-0">
                2
              </span>
              <AlertTriangle size={15} className="shrink-0" />
              <span>🏥 BỆNH VIỆN TRANH LỖI · ẢNH BỆNH NHÂN CẦN KHÁM</span>
              <span className="text-[11px] font-bold text-rose-800 lowercase">
                (BỆNH ÁN: {currentCase.title})
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {currentCase.problemText}
            </p>
            <div className="mt-2 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 inline-block">
              Lỗi câu lệnh cũ: <span className="text-rose-600 italic font-black">&ldquo;{currentCase.brokenPrompt}&rdquo;</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BƯỚC 3: 💊 KÊ ĐƠN THUỐC ĐẶC TRỊ ── */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-2.5 sm:p-3 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-black">
              3
            </span>
            <span className="font-black text-xs sm:text-sm text-slate-800">
              💊 ĐƠN THUỐC ĐẶC TRỊ CHO TRANH (KÊ 1 LIỀU DUY NHẤT)
            </span>
          </div>
          {selectedCure && (
            selectedCure.id === currentCase.expectedCureId ? (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full animate-bounce">
                <CheckCircle2 size={13} strokeWidth={3} />
                🎉 ĐÃ BỐC ĐÚNG THUỐC ĐẶC TRỊ! TRANH SẼ HẾT LỖI!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                <AlertTriangle size={13} strokeWidth={3} />
                ⚠️ BỐC NHẦM THUỐC RỒI! BÉ HÃY THỬ LẠI NHÉ!
              </span>
            )
          )}
        </div>

        <div
          data-testid="doctor-cure-slot"
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            try {
              const dataStr = e.dataTransfer.getData('application/json')
              if (dataStr) {
                const cure: CreativeBlock = JSON.parse(dataStr)
                handleDropCure(cure)
              }
            } catch {}
          }}
          className={cn(
            'min-h-[64px] rounded-2xl transition-all duration-200',
            isDragOver && 'border-2 border-emerald-500 bg-emerald-100/90 ring-4 ring-emerald-300 scale-101 shadow-md p-3',
            !isDragOver && (!selectedCure
              ? 'border-2 border-dashed border-rose-300/80 rounded-2xl p-4 text-center bg-white/70'
              : selectedCure.id === currentCase.expectedCureId
              ? 'border-2 border-emerald-400 bg-emerald-50/70 p-2.5 sm:p-3 shadow-2xs'
              : 'border-2 border-amber-400 bg-amber-50/70 p-2.5 sm:p-3 shadow-2xs')
          )}
        >
          {!selectedCure ? (
            <div className="w-full text-center text-xs font-bold text-slate-400 select-none">
              {isDragOver
                ? '✨ Thả liều thuốc đặc trị vào đây ngay! ✨'
                : '🎯 Chạm hoặc kéo 1 liều thuốc đặc trị bên dưới vào đây để chữa bệnh'}
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              {selectedCure.id !== currentCase.expectedCureId && (
                <div className="text-[11px] sm:text-xs font-bold text-amber-900 bg-amber-100/90 px-3 py-1.5 rounded-xl border border-amber-300/80 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                  <span>
                    Bé ơi, thuốc này không chữa được bệnh của {currentCase.patientName} đâu! Hãy tìm đúng thuốc đặc trị nhé!
                  </span>
                </div>
              )}
              <div
                className={cn(
                  'flex items-center justify-between gap-3 bg-white px-3.5 py-2 rounded-xl border shadow-2xs text-left',
                  selectedCure.id === currentCase.expectedCureId
                    ? 'border-emerald-300'
                    : 'border-amber-300'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl sm:text-3xl shrink-0 drop-shadow-xs">
                    {selectedCure.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {selectedCure.label}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-800 truncate mt-0.5">
                      {selectedCure.text}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCure}
                  className="size-7 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-1"
                  title="Gỡ liều thuốc này"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tủ Thuốc Câu Lệnh (To bản, dễ nhìn, Drag & Drop siêu mượt) */}
      <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-2.5 sm:p-3 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center gap-1.5 font-black text-xs text-slate-700">
          <Sparkles size={14} className="text-amber-500" />
          <span>Tủ Thuốc Thần Kỳ (Kéo thả hoặc chạm thẻ thuốc để nạp vào đơn)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          {currentCures.map((cure) => {
            const isSelected = selectedCure?.id === cure.id

            return (
              <div
                key={cure.id}
                role="button"
                tabIndex={0}
                draggable={true}
                data-testid={`cure-card-${cure.id}`}
                onDragStart={(e) => {
                  try {
                    e.dataTransfer.setData('application/json', JSON.stringify(cure))
                    e.dataTransfer.setData('text/plain', cure.id)
                    e.dataTransfer.effectAllowed = 'copy'
                  } catch {}
                }}
                onClick={() => handleSelectCure(cure)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectCure(cure)
                  }
                }}
                className={cn(
                  'min-h-[58px] p-2.5 sm:p-3 rounded-2xl border-2 transition-all duration-150 select-none flex items-center gap-3',
                  'cursor-grab active:cursor-grabbing hover:scale-102 active:scale-95 shadow-xs',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-300 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-800'
                )}
              >
                <span className="text-2xl sm:text-3xl shrink-0 drop-shadow-xs">{cure.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-black truncate text-slate-900">{cure.label}</div>
                  <div className="text-[11px] font-bold text-emerald-800 truncate mt-0.5">
                    {cure.hint}
                  </div>
                </div>
                {isSelected ? (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white flex items-center gap-1 shrink-0 shadow-2xs">
                    <CheckCircle2 size={12} strokeWidth={3} />
                    <span>✓ Đang kê đơn</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 shrink-0 transition-colors">
                    + Kê đơn
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Lightbox Phóng To Ảnh Bệnh Án Soi Lỗi */}
      {zoomRef && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomRef(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl p-4 shadow-2xl flex flex-col items-center gap-3 border-3 border-rose-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-rose-700 uppercase flex items-center gap-1.5">
                <span>🚨</span>
                <span>Bệnh Án Tham Chiếu: {currentCase.title}</span>
              </span>
              <button
                type="button"
                onClick={() => setZoomRef(false)}
                className="size-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-700 font-black flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img
              src={currentCase.refImageUrl}
              alt={currentCase.title}
              className="w-full aspect-4/3 object-cover rounded-2xl border-2 border-rose-200"
            />
            <p className="text-xs sm:text-sm text-rose-950 font-bold text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200 w-full">
              {currentCase.problemText}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

