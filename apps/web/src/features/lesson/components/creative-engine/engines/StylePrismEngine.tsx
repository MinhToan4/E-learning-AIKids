import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Wand2, Sparkles, Check, SunMedium } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeBlock } from '../types'
import { STYLE_BLOCKS } from '../data/creative-blocks-dataset'

export interface PrismSubjectDef {
  id: string
  name: string
  icon: string
}

export const FALLBACK_PRISM_SUBJECTS: PrismSubjectDef[] = [
  { id: 'sub-cat', name: 'Chú Mèo Mướp Béo', icon: '🐱' },
  { id: 'sub-fox', name: 'Hiệp Sĩ Cáo Lửa', icon: '🦊' },
  { id: 'sub-robot', name: 'Chú Bé Robot Leo', icon: '🤖' },
  { id: 'sub-dragon', name: 'Rồng Băng Con', icon: '🐉' },
]

export const PRISM_LIGHTING_OPTIONS: CreativeBlock[] = [
  {
    id: 'light-moon',
    label: 'Ánh Trăng Kỳ Ảo',
    text: 'dưới ánh trăng tròn phát sáng kỳ ảo ma mị',
    category: 'lighting-mood',
    icon: '🌕',
    colorScheme: 'purple',
    hint: 'Không gian đêm huyền ảo lung linh',
  },
  {
    id: 'light-dawn',
    label: 'Bình Minh Ấm Áp',
    text: 'ánh bình minh vàng ấm áp rực rỡ ban mai',
    category: 'lighting-mood',
    icon: '🌅',
    colorScheme: 'amber',
    hint: 'Tia nắng sớm dịu dàng',
  },
  {
    id: 'light-sun',
    label: 'Tia Nắng Rực Rỡ',
    text: 'tia nắng mặt trời lung linh xuyên qua tán lá',
    category: 'lighting-mood',
    icon: '☀️',
    colorScheme: 'sky',
    hint: 'Ánh nắng trưa bừng sáng tràn đầy năng lượng',
  },
  {
    id: 'light-magic',
    label: 'Bụi Sao Lấp Lánh',
    text: 'bụi sao ma thuật lấp lánh lung linh huyền diệu',
    category: 'lighting-mood',
    icon: '✨',
    colorScheme: 'mint',
    hint: 'Hạt bụi phép thuật bay lơ lửng',
  },
]

export const StylePrismEngine: React.FC<EngineProps> = ({
  onPromptChange,
  characterName,
  selectedSubject: propSelectedSubject,
  practiceParts,
  activePartIndex,
  onPartChange,
}) => {
  // Trích xuất danh sách chủ thể từ practiceParts (DB) hoặc fallback
  const subjects = useMemo<PrismSubjectDef[]>(() => {
    if (practiceParts && practiceParts.length > 0) {
      return practiceParts.map((p, idx) => {
        const cleanName = p.title.replace(/\s*\(.*?\)/, '').trim() || p.title
        return {
          id: p.id || `sub-${p.partNumber || idx + 1}`,
          name: cleanName,
          icon: p.icon || p.emoji || '🎨',
        }
      })
    }
    return FALLBACK_PRISM_SUBJECTS
  }, [practiceParts])

  const [selectedSubIndex, setSelectedSubIndex] = useState<number>(activePartIndex ?? 0)

  const initialSubjectName =
    subjects[selectedSubIndex]?.name || propSelectedSubject || characterName || FALLBACK_PRISM_SUBJECTS[0].name
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectName)

  const [selectedStyle, setSelectedStyle] = useState<CreativeBlock>(STYLE_BLOCKS[0])
  const [selectedLighting, setSelectedLighting] = useState<CreativeBlock>(PRISM_LIGHTING_OPTIONS[0])

  // Đồng bộ khi activePartIndex thay đổi từ bên ngoài
  useEffect(() => {
    if (
      activePartIndex !== undefined &&
      activePartIndex >= 0 &&
      activePartIndex < subjects.length
    ) {
      setSelectedSubIndex(activePartIndex)
      setSelectedSubject(subjects[activePartIndex].name)
    }
  }, [activePartIndex, subjects])

  // Cập nhật prompt tự động gồm 3 blocks: Chủ thể + Phong cách + Ánh sáng
  const updatePrompt = useCallback(
    (style: CreativeBlock, subject: string, lighting: CreativeBlock) => {
      const subjectBlock: CreativeBlock = {
        id: 'prism-subject',
        label: subject,
        text: subject,
        category: 'subject',
        icon: '🎨',
        colorScheme: 'indigo',
      }

      const activeBlocks: CreativeBlock[] = [subjectBlock, style, lighting]
      const assembled = `${subject}, ${style.text}, ${lighting.text}`
      onPromptChange(assembled, activeBlocks)
    },
    [onPromptChange]
  )

  useEffect(() => {
    updatePrompt(selectedStyle, selectedSubject, selectedLighting)
  }, [selectedStyle, selectedSubject, selectedLighting, updatePrompt])

  const handleSelectSubject = (idx: number) => {
    playInstantSound('click')
    setSelectedSubIndex(idx)
    const sub = subjects[idx]
    if (sub) {
      setSelectedSubject(sub.name)
    }
    onPartChange?.(idx)
  }

  const handleSelectStyle = (style: CreativeBlock) => {
    playInstantSound('star')
    setSelectedStyle(style)
  }

  const handleSelectLighting = (light: CreativeBlock) => {
    playInstantSound('click')
    setSelectedLighting(light)
  }

  return (
    <div data-testid="style-prism-engine" className="flex flex-col gap-3 text-left">
      {/* Header Lăng Kính Phù Thủy */}
      <div className="bg-linear-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border-2 border-purple-200 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center gap-2">
            <Wand2 className="text-purple-600 animate-pulse" size={18} />
            <span className="font-black text-xs sm:text-sm text-purple-950">
              Lăng Kính Phù Thủy: "Úm ba la... Biến hình!"
            </span>
          </div>
          <span className="text-[11px] font-black text-purple-800 bg-purple-100/90 px-2 py-0.5 rounded-full">
            Biến Hình Phong Cách ✨
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-500">
          Hãy chọn <strong>Chủ thể</strong>, xoay <strong>Lăng kính phong cách</strong> và thêm <strong>Ánh sáng ma thuật</strong>!
        </p>
      </div>

      {/* ── BƯỚC 1: 🎨 CHỌN ĐỐI TƯỢNG BIẾN HÌNH (CHỦ THỂ) ── */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-white text-[11px] font-black">
              1
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-800">
              🎨 CHỌN ĐỐI TƯỢNG BIẾN HÌNH (CHỦ THỂ)
            </span>
          </div>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
            {subjects[selectedSubIndex]?.icon} {selectedSubject}
          </span>
        </div>

        {/* Lưới 4 Card đối tượng nhỏ gọn, vừa vặn không bị scroll */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {subjects.map((sub, idx) => {
            const isSelected = selectedSubIndex === idx

            return (
              <button
                key={sub.id}
                type="button"
                data-testid={`subject-button-${sub.id}`}
                onClick={() => handleSelectSubject(idx)}
                className={cn(
                  'p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 select-none min-h-[54px] group',
                  isSelected
                    ? 'bg-purple-50/80 border-purple-600 shadow-clay-xs ring-2 ring-purple-300 scale-[1.01]'
                    : 'bg-white/95 border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 text-slate-700 shadow-2xs'
                )}
              >
                <div
                  className={cn(
                    'size-9 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105',
                    isSelected ? 'bg-purple-100 text-purple-900 shadow-2xs' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {sub.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-xs font-black leading-tight break-words line-clamp-2',
                      isSelected ? 'text-purple-950' : 'text-slate-800'
                    )}
                  >
                    {sub.name}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 leading-tight break-words line-clamp-1">
                    Món đồ {idx + 1}
                  </div>
                </div>
                {isSelected && (
                  <div className="size-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Thẻ đối tượng đang được biến hình (Hỗ trợ thả style vào đây) */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
          }}
          onDrop={(e) => {
            e.preventDefault()
            try {
              const data = e.dataTransfer.getData('application/json')
              if (data) handleSelectStyle(JSON.parse(data))
            } catch {}
          }}
          className="flex items-center gap-2 bg-purple-50/50 rounded-xl p-2.5 border border-purple-200/80 transition-all"
        >
          <span className="text-xl">🪄</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-800">
              Đang chọn: <span className="text-purple-700 font-extrabold">{selectedSubject}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              Kéo hoặc chạm vào 1 trong 4 Lăng Kính bên dưới để đổi ngay phong cách vẽ!
            </div>
          </div>
        </div>
      </div>

      {/* ── BƯỚC 2: 🪄 CHỌN LĂNG KÍNH PHONG CÁCH ── */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-white text-[11px] font-black">
            2
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-800">
            🪄 CHỌN LĂNG KÍNH PHONG CÁCH
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {STYLE_BLOCKS.map((style) => {
            const isSelected = selectedStyle.id === style.id

            return (
              <div
                key={style.id}
                role="button"
                tabIndex={0}
                draggable={true}
                data-testid={`prism-card-${style.id}`}
                onDragStart={(e) => {
                  try {
                    e.dataTransfer.setData('application/json', JSON.stringify(style))
                    e.dataTransfer.setData('text/plain', style.id)
                  } catch {}
                }}
                onClick={() => handleSelectStyle(style)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectStyle(style)
                  }
                }}
                className={cn(
                  'min-h-[76px] rounded-2xl border-2 p-3.5 transition-all duration-150 select-none relative flex items-start gap-3',
                  'cursor-grab active:cursor-grabbing hover:scale-102 active:scale-95',
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10 shadow-md ring-2 ring-purple-400 scale-[1.01]'
                    : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 shadow-2xs'
                )}
              >
                <div className="size-11 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-2xl shrink-0">
                  {style.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-xs sm:text-sm text-slate-900">
                      {style.label}
                    </span>
                    {isSelected && (
                      <div className="size-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {style.hint || style.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── BƯỚC 3: ✨ TÙY CHỌN ÁNH SÁNG & KHÔNG GIAN ── */}
      <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-white text-[11px] font-black">
              3
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-800">
              ✨ TÙY CHỌN ÁNH SÁNG & KHÔNG GIAN
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-lg border border-amber-200">
            {selectedLighting.icon} {selectedLighting.label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRISM_LIGHTING_OPTIONS.map((light) => {
            const isSelected = selectedLighting.id === light.id

            return (
              <button
                key={light.id}
                type="button"
                data-testid={`lighting-btn-${light.id}`}
                onClick={() => handleSelectLighting(light)}
                className={cn(
                  'p-2.5 rounded-xl border-2 text-left transition-all duration-150 flex flex-col gap-1 cursor-pointer select-none',
                  isSelected
                    ? 'border-amber-500 bg-amber-50 shadow-xs ring-2 ring-amber-300 scale-102'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{light.icon}</span>
                  <span className="text-xs font-black text-slate-900 truncate">
                    {light.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 line-clamp-1">
                  {light.hint}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
