import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Lock, Smile } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeBlock } from '../types'
import { EXPRESSION_BLOCKS, ACTION_BLOCKS } from '../data/creative-blocks-dataset'

export interface IdentityCharacterDef {
  id: string
  name: string
  patientName?: string
  role: string
  type: 'animal' | 'human' | 'fantasy'
  icon: string
  imageUrl: string
  lockedFeatures: string[]
  defaultActionId: string
}

export const IDENTITY_CHARACTERS: IdentityCharacterDef[] = [
  {
    id: 'char-bi',
    name: 'Bí',
    role: 'Bạn nhỏ',
    type: 'human',
    icon: '🧒',
    imageUrl: '/assets/aiki-characters/bi.webp',
    lockedFeatures: [
      'Mũ len đỏ có quả bông trắng',
      'Áo khoác xanh dương hai túi',
      'Ủng cao su vàng',
    ],
    defaultActionId: 'act-vay-tay',
  },
  {
    id: 'char-tep',
    name: 'Tép',
    role: 'Chuột nhắt',
    type: 'animal',
    icon: '🐭',
    imageUrl: '/assets/aiki-characters/tep.webp',
    lockedFeatures: [
      'Một tai gãy gập',
      'Khăn quàng ca-rô đỏ',
      'Hộp thiếc đựng nắp chai sau lưng',
    ],
    defaultActionId: 'act-vay-tay',
  },
  {
    id: 'char-bong',
    name: 'Bông',
    role: 'Cún lông vàng',
    type: 'animal',
    icon: '🐶',
    imageUrl: '/assets/aiki-characters/bong.webp',
    lockedFeatures: [
      'Cún lông vàng',
      'Vòng cổ đỏ có chuông vàng',
      'Một tai cụp',
    ],
    defaultActionId: 'act-vay-tay',
  },
  {
    id: 'char-ro',
    name: 'Rô',
    role: 'Robot nhỏ',
    type: 'fantasy',
    icon: '🤖',
    imageUrl: '/assets/aiki-characters/ro.webp',
    lockedFeatures: [
      'Thân thiếc xám vá ba miếng',
      'Hai ăng-ten cong',
      'Bánh xe gỗ',
    ],
    defaultActionId: 'act-bay-luon',
  },
]

export interface IdentityLockEngineProps extends EngineProps {
  activeCharacterIndex?: number
  onCharacterChange?: (index: number) => void
}

export const IdentityLockEngine: React.FC<IdentityLockEngineProps> = ({
  onPromptChange,
  characterName,
  lockedFeatures,
  activeCharacterIndex,
  onCharacterChange,
  practiceParts,
  activePartIndex,
  onPartChange,
}) => {
  // Trích xuất danh sách nhân vật từ practiceParts (DB) hoặc fallback sang IDENTITY_CHARACTERS
  const characters = useMemo<IdentityCharacterDef[]>(() => {
    if (practiceParts && practiceParts.length > 0) {
      return practiceParts.map((p, idx) => {
        const fallback = IDENTITY_CHARACTERS[idx % IDENTITY_CHARACTERS.length]
        const cleanName = p.title.replace(/\s*\(.*?\)/, '').trim() || p.title
        return {
          id: p.id || `char-part-${p.partNumber || idx + 1}`,
          name: cleanName,
          role: fallback?.role || 'Nhân vật bài học',
          type: fallback?.type || 'animal',
          icon: p.icon || p.emoji || fallback?.icon || '👤',
          imageUrl: p.iconImage || fallback?.imageUrl || '',
          lockedFeatures: fallback?.lockedFeatures || [
            'đặc điểm nhận diện 1',
            'đặc điểm nhận diện 2',
            'đặc điểm nhận diện 3',
          ],
          defaultActionId: fallback?.defaultActionId || 'act-vay-tay',
        }
      })
    }
    return IDENTITY_CHARACTERS
  }, [practiceParts])

  const [internalCharIndex, setInternalCharIndex] = useState(0)
  const effectiveCharIndex =
    activePartIndex !== undefined
      ? activePartIndex
      : activeCharacterIndex !== undefined
      ? activeCharacterIndex
      : internalCharIndex

  const currentCharacter = characters[effectiveCharIndex] || characters[0]

  const activeFeatures =
    effectiveCharIndex === 0 && lockedFeatures && lockedFeatures.length > 0
      ? lockedFeatures
      : currentCharacter.lockedFeatures

  const [selectedExpression, setSelectedExpression] = useState<CreativeBlock>(EXPRESSION_BLOCKS[0])
  const [selectedAction, setSelectedAction] = useState<CreativeBlock>(ACTION_BLOCKS[0])

  const syncPrompt = useCallback(
    (char: IdentityCharacterDef, expr: CreativeBlock, act: CreativeBlock) => {
      const features =
        effectiveCharIndex === 0 && lockedFeatures && lockedFeatures.length > 0
          ? lockedFeatures
          : char.lockedFeatures

      // Thẻ Chủ thể nhân vật luôn đứng đầu
      const charBlock: CreativeBlock = {
        id: `sub-${char.id}`,
        label: char.name,
        text: char.name,
        category: 'subject',
        icon: char.icon,
        colorScheme: 'indigo',
        hint: 'Chủ thể nhân vật',
      }

      // Thẻ 3 Ổ khóa ADN
      const dnaBlock: CreativeBlock = {
        id: `dna-${char.id}`,
        label: '3 Ổ khóa ADN',
        text: features.join(', '),
        category: 'modifier',
        icon: '🔒',
        colorScheme: 'purple',
        hint: 'Đặc điểm nhận diện bất biến',
      }

      const activeBlocks: CreativeBlock[] = [charBlock, dnaBlock, expr, act]
      const assembled = `${char.name}, ${features.join(', ')}, ${expr.text}, ${act.text}`
      onPromptChange(assembled, activeBlocks)
    },
    [effectiveCharIndex, lockedFeatures, onPromptChange]
  )

  useEffect(() => {
    syncPrompt(currentCharacter, selectedExpression, selectedAction)
  }, [currentCharacter, selectedExpression, selectedAction, syncPrompt])

  const handleSwitchCharacter = (idx: number) => {
    playInstantSound('click')
    setInternalCharIndex(idx)
    onCharacterChange?.(idx)
    onPartChange?.(idx)
  }

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
      {/* ── BƯỚC 1: 👤 CHỌN CHỦ THỂ NHÂN VẬT ── */}
      <div className="bg-purple-50/70 rounded-2xl border-2 border-purple-200 p-2.5 sm:p-3 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-white text-[11px] font-black">
              1
            </span>
            <span className="font-black text-xs sm:text-sm text-purple-950">
              👤 BƯỚC 1: BỘ CHỦ THỂ NHÂN VẬT (Khóa nhận diện ADN)
            </span>
          </div>
          <span className="text-[11px] font-bold text-purple-800 bg-purple-100/90 px-2 py-0.5 rounded-full">
            {currentCharacter.icon} {currentCharacter.name}
          </span>
        </div>

        {/* Lưới 4 Card nhân vật nhỏ gọn, vừa vặn không bị scroll */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {characters.map((char, idx) => {
            const isSelected = effectiveCharIndex === idx
            return (
              <button
                key={char.id}
                type="button"
                data-testid={`character-button-${char.id}`}
                onClick={() => handleSwitchCharacter(idx)}
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
                  {char.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-xs font-black leading-tight break-words line-clamp-2',
                      isSelected ? 'text-purple-950' : 'text-slate-800'
                    )}
                  >
                    {char.name}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 leading-tight break-words line-clamp-1">
                    {char.role || `Nhân vật ${idx + 1}`}
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
      </div>

      {/* ── BƯỚC 2: 🔒 3 Ổ KHÓA VÀNG VIP BẤT BIẾN (ADN) ── */}
      <div className="bg-linear-to-r from-purple-50 via-amber-50 to-pink-50 rounded-2xl border-2 border-purple-300 p-3.5 sm:p-4 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-white text-[11px] font-black">
              2
            </span>
            <Lock className="text-purple-700" size={16} />
            <span className="font-black text-xs sm:text-sm text-purple-950">
              3 Ổ Khóa Vàng VIP Bất Biến: {currentCharacter.name}
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
          {activeFeatures.map((feat, idx) => (
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

      {/* ── BƯỚC 3: 😄 BÁNH XE 6 BIỂU CẢM ── */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-white text-[11px] font-black">
              3
            </span>
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-800">
              <Smile size={16} className="text-amber-500" />
              <span>Bánh Xe 6 Biểu Cảm (Chạm để đổi nét mặt):</span>
            </div>
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
                draggable={true}
                data-testid={`expression-card-${expr.id}`}
                onDragStart={(e) => {
                  try {
                    e.dataTransfer.setData('application/json', JSON.stringify(expr))
                    e.dataTransfer.setData('text/plain', expr.id)
                  } catch {}
                }}
                onClick={() => handleSelectExpression(expr)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectExpression(expr)
                  }
                }}
                className={cn(
                  'min-h-[54px] p-2.5 rounded-xl border-2 transition-all duration-150 select-none flex items-center gap-2',
                  'cursor-grab active:cursor-grabbing hover:scale-102 active:scale-95',
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 text-amber-950 shadow-xs ring-2 ring-amber-300'
                    : 'border-slate-200 bg-white hover:border-amber-300 text-slate-800 shadow-2xs'
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

      {/* ── BƯỚC 4: 🏃 HÀNH ĐỘNG KÈM THEO ── */}
      <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-3 shadow-2xs flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-white text-[11px] font-black">
            4
          </span>
          <span className="text-[11px] font-black text-slate-600">Đang làm gì:</span>
        </div>
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
