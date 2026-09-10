import React, { useState, useEffect, useCallback } from 'react'
import { Wand2, Sparkles, Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeBlock } from '../types'
import { STYLE_BLOCKS, SUBJECT_BLOCKS } from '../data/creative-blocks-dataset'

export const StylePrismEngine: React.FC<EngineProps> = ({
  onPromptChange,
  characterName = 'Chú Mèo Mướp Béo',
}) => {
  const [selectedStyle, setSelectedStyle] = useState<CreativeBlock>(STYLE_BLOCKS[0])
  const [selectedSubject, setSelectedSubject] = useState<string>(characterName)

  // Cập nhật prompt tự động
  const updatePrompt = useCallback(
    (style: CreativeBlock, subject: string) => {
      const activeBlocks: CreativeBlock[] = [
        {
          id: `sub-${subject}`,
          label: subject,
          text: subject,
          category: 'subject',
          icon: '🎨',
          colorScheme: 'sky',
        },
        style,
      ]

      const assembled = `${subject}, ${style.text}`
      onPromptChange(assembled, activeBlocks)
    },
    [onPromptChange]
  )

  useEffect(() => {
    updatePrompt(selectedStyle, selectedSubject)
  }, [selectedStyle, selectedSubject, updatePrompt])

  const handleSelectStyle = (style: CreativeBlock) => {
    playInstantSound('star')
    setSelectedStyle(style)
  }

  return (
    <div data-testid="style-prism-engine" className="flex flex-col gap-3 text-left">
      {/* Khung đối tượng biến hình */}
      <div className="bg-linear-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border-2 border-purple-200 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            <Wand2 className="text-purple-600 animate-pulse" size={18} />
            <span className="font-black text-xs sm:text-sm text-purple-950">
              Lăng Kính Phù Thủy: "Úm ba la... Biến hình!"
            </span>
          </div>
          <span className="text-[11px] font-black text-purple-800 bg-purple-100/90 px-2 py-0.5 rounded-full">
            Bài 1.3 & 5.3
          </span>
        </div>

        {/* Thẻ đối tượng đang được biến hình */}
        <div className="flex items-center gap-2 bg-white/90 rounded-xl p-2.5 border border-purple-200/80">
          <span className="text-xl">🪄</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-800">
              Đối tượng biến hình: <span className="text-purple-700">{selectedSubject}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              Chạm vào 1 trong 4 Lăng Kính bên dưới để đổi ngay phong cách vẽ!
            </div>
          </div>
        </div>
      </div>

      {/* 4 Lăng Kính Phong Cách Lớn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {STYLE_BLOCKS.map((style) => {
          const isSelected = selectedStyle.id === style.id

          return (
            <div
              key={style.id}
              role="button"
              tabIndex={0}
              data-testid={`prism-card-${style.id}`}
              onClick={() => handleSelectStyle(style)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectStyle(style)
                }
              }}
              className={cn(
                'min-h-[76px] rounded-2xl border-2 p-3.5 transition-all duration-200 cursor-pointer select-none relative flex items-start gap-3',
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-md ring-2 ring-purple-400 scale-[1.01]'
                  : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30 shadow-2xs active:scale-98'
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

      {/* Khung đổi nhân vật nhanh nếu muốn */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-black text-slate-600">Đổi nhân vật:</span>
        {SUBJECT_BLOCKS.slice(0, 4).map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => {
              playInstantSound('click')
              setSelectedSubject(sub.text)
            }}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer',
              selectedSubject === sub.text
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            )}
          >
            {sub.icon} {sub.label}
          </button>
        ))}
      </div>
    </div>
  )
}
