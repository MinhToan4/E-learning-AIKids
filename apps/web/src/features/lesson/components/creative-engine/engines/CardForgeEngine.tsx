import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Swords, Shield, Wand2, Award, Zap } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeBlock } from '../types'
import { CARD_ELEMENTS } from '../data/creative-blocks-dataset'

export interface ChampionDef {
  id: string
  name: string
  icon: string
  element?: { name?: string }
}

export const FALLBACK_CHAMPIONS: ChampionDef[] = [
  { id: 'champ-fox', name: 'Hiệp Sĩ Cáo Lửa', icon: '🦊' },
  { id: 'champ-dragon', name: 'Rồng Băng Bão Tuyết', icon: '🐉' },
  { id: 'champ-lion', name: 'Sư Tử Lửa Cuồng Nộ', icon: '🦁' },
  { id: 'champ-eagle', name: 'Đại Bàng Lôi Thần', icon: '🦅' },
]

export const CardForgeEngine: React.FC<EngineProps> = ({
  onPromptChange,
  characterName,
  practiceParts,
  activePartIndex,
  onPartChange,
}) => {
  // Trích xuất danh sách chiến tướng từ practiceParts (DB) hoặc fallback
  const champions = useMemo<ChampionDef[]>(() => {
    if (practiceParts && practiceParts.length > 0) {
      return practiceParts.map((p, idx) => {
        const cleanName = p.title.replace(/\s*\(.*?\)/, '').trim() || p.title
        return {
          id: p.id || `champ-${p.partNumber || idx + 1}`,
          name: cleanName,
          icon: p.icon || p.emoji || '🎴',
        }
      })
    }
    return FALLBACK_CHAMPIONS
  }, [practiceParts])

  const [selectedChampIndex, setSelectedChampIndex] = useState<number>(activePartIndex ?? 0)

  // Tên thẻ bài hiện tại
  const initialCardName =
    champions[selectedChampIndex]?.name || characterName || FALLBACK_CHAMPIONS[0].name
  const [cardName, setCardName] = useState<string>(initialCardName)

  // Đồng bộ khi activePartIndex thay đổi từ bên ngoài
  useEffect(() => {
    if (
      activePartIndex !== undefined &&
      activePartIndex >= 0 &&
      activePartIndex < champions.length
    ) {
      setSelectedChampIndex(activePartIndex)
      setCardName(champions[activePartIndex].name)
    }
  }, [activePartIndex, champions])

  const [selectedElement, setSelectedElement] = useState(CARD_ELEMENTS[0])
  const [attack, setAttack] = useState(8)
  const [defense, setDefense] = useState(6)
  const [magic, setMagic] = useState(6)

  const totalPoints = attack + defense + magic
  const maxBudget = 20
  const isBalanced = totalPoints <= maxBudget

  const syncPrompt = useCallback(
    (name: string, elem: typeof CARD_ELEMENTS[0], atk: number, def: number, mag: number) => {
      const activeBlocks: CreativeBlock[] = [
        {
          id: 'card-subject',
          label: name,
          text: name,
          category: 'subject',
          icon: '🎴',
          colorScheme: 'indigo',
        },
        {
          id: 'card-elem',
          label: `Hệ ${elem.name}`,
          text: `nguyên tố ${elem.name}`,
          category: 'stat-trait',
          icon: elem.icon,
          colorScheme: 'sky',
        },
        {
          id: 'card-stats',
          label: `⚔️${atk} 🛡️${def} 🔮${mag}`,
          text: `chỉ số Công ${atk} Thủ ${def} Phép ${mag}`,
          category: 'stat-trait',
          icon: '📊',
          colorScheme: 'amber',
        },
      ]

      const assembled = `thẻ bài TCG minh họa ${name}, hệ nguyên tố ${elem.name}, viền thẻ kim loại ma thuật lấp lánh, chỉ số Công ${atk} Thủ ${def} Phép ${mag}, kỹ năng ${elem.skill}`
      onPromptChange(assembled, activeBlocks)
    },
    [onPromptChange]
  )

  useEffect(() => {
    syncPrompt(cardName, selectedElement, attack, defense, magic)
  }, [cardName, selectedElement, attack, defense, magic, syncPrompt])

  const handleSelectChampion = (idx: number) => {
    playInstantSound('click')
    setSelectedChampIndex(idx)
    const champ = champions[idx]
    if (champ) {
      setCardName(champ.name)
    }
    onPartChange?.(idx)
  }

  const handleSelectElement = (elem: typeof CARD_ELEMENTS[0]) => {
    playInstantSound('star')
    setSelectedElement(elem)
  }

  const handleApplyPreset = (atk: number, def: number, mag: number) => {
    playInstantSound('click')
    setAttack(atk)
    setDefense(def)
    setMagic(mag)
  }

  return (
    <div data-testid="card-forge-engine" className="flex flex-col gap-3 text-left">
      {/* Header Xưởng Đúc Thẻ */}
      <div className="bg-linear-to-r from-violet-50 via-indigo-50 to-sky-50 rounded-2xl border-2 border-violet-300 p-3.5 sm:p-4 shadow-2xs flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Award className="text-violet-700" size={18} />
            <span className="font-black text-xs sm:text-sm text-violet-950">
              Xưởng Đúc Thẻ Bài TCG: Cân Bằng Chỉ Số
            </span>
          </div>
          <span className="text-[11px] font-black text-violet-900 bg-violet-100/90 px-2 py-0.5 rounded-full">
            Thẻ Bài Đấu Trường 🃏
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-500">
          Mỗi lá bài có tối đa <strong>20 điểm</strong> sức mạnh. Hãy hoàn thành 3 bước bên dưới để tạo thẻ bài hoàn chỉnh!
        </p>
      </div>

      {/* ── BƯỚC 1: 🎴 CHỌN CHIẾN TƯỚNG (CHỦ THỂ) ── */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-white text-[11px] font-black">
              1
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-800">
              🎴 CHỌN CHIẾN TƯỚNG (CHỦ THỂ)
            </span>
          </div>
          <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-200">
            {champions[selectedChampIndex]?.icon} {cardName}
          </span>
        </div>

        {/* Lưới 4 Card chiến tướng nhỏ gọn, vừa vặn không bị scroll */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {champions.map((champ, idx) => {
            const isSelected = selectedChampIndex === idx

            return (
              <button
                key={champ.id}
                type="button"
                data-testid={`champion-button-${champ.id}`}
                onClick={() => handleSelectChampion(idx)}
                className={cn(
                  'p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 select-none min-h-[54px] group',
                  isSelected
                    ? 'bg-violet-50/80 border-violet-600 shadow-clay-xs ring-2 ring-violet-300 scale-[1.01]'
                    : 'bg-white/95 border-slate-200 hover:border-violet-300 hover:bg-violet-50/30 text-slate-700 shadow-2xs'
                )}
              >
                <div
                  className={cn(
                    'size-9 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105',
                    isSelected ? 'bg-violet-100 text-violet-900 shadow-2xs' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {champ.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'text-xs font-black leading-tight break-words line-clamp-2',
                      isSelected ? 'text-violet-950' : 'text-slate-800'
                    )}
                  >
                    {champ.name}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 leading-tight break-words line-clamp-1">
                    Hệ {champ.element?.name || 'Nguyên Tố'}
                  </div>
                </div>
                {isSelected && (
                  <div className="size-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Ô nhập text nhỏ để trẻ tùy biến biệt danh nếu muốn */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-500 shrink-0">Biệt danh tùy biến:</span>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 focus:border-violet-500 focus:outline-hidden bg-slate-50/50"
            placeholder="Nhập hoặc chỉnh sửa tên linh thú thẻ bài..."
          />
        </div>
      </div>

      {/* ── BƯỚC 2: ⚡ CHỌN HỆ NGUYÊN TỐ ── */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-white text-[11px] font-black">
            2
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-800">
            ⚡ CHỌN HỆ NGUYÊN TỐ (KỸ NĂNG)
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {CARD_ELEMENTS.map((elem) => {
            const isSelected = selectedElement.id === elem.id

            return (
              <button
                key={elem.id}
                type="button"
                data-testid={`element-${elem.id}`}
                onClick={() => handleSelectElement(elem)}
                className={cn(
                  'px-2.5 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer min-h-[34px]',
                  isSelected
                    ? 'bg-violet-600 text-white shadow-xs scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <span>{elem.icon}</span>
                <span>{elem.name}</span>
              </button>
            )
          })}
        </div>

        {/* Kỹ năng hiện tại */}
        <div className="text-[11px] font-bold text-violet-900 bg-violet-50 p-2 rounded-xl border border-violet-200 flex items-center gap-1.5">
          <Zap size={14} className="text-violet-600 shrink-0" />
          <span>{selectedElement.skill}</span>
        </div>
      </div>

      {/* ── BƯỚC 3: 📊 PHÂN BỔ 3 CHỈ SỐ ── */}
      <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-white text-[11px] font-black">
              3
            </span>
            <span className="font-black text-xs sm:text-sm text-slate-800">
              📊 PHÂN BỔ 3 CHỈ SỐ (Tổng: {totalPoints}/{maxBudget} sao)
            </span>
          </div>
          <span
            className={cn(
              'text-xs font-black px-2 py-0.5 rounded-full',
              isBalanced
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800 animate-pulse'
            )}
          >
            {isBalanced ? '✓ Chuẩn Cân Bằng' : '⚠️ Vượt Quá Hạn Mức'}
          </span>
        </div>

        {/* Presets cân bằng nhanh */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500">Mẫu nhanh:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset(10, 5, 5)}
            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Chiến Binh (10-5-5)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(5, 10, 5)}
            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Phòng Thủ (5-10-5)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(6, 7, 7)}
            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Tam Hợp (6-7-7)
          </button>
        </div>

        {/* 3 Sliders */}
        <div className="space-y-2.5 pt-1">
          {/* Sức Tấn Công */}
          <div className="bg-white p-2.5 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
            <span className="font-black text-xs text-rose-700 flex items-center gap-1 min-w-[110px]">
              <Swords size={14} className="text-rose-500" /> TẤN CÔNG (ATK)
            </span>
            <input
              type="range"
              min={1}
              max={15}
              value={attack}
              aria-label="Chỉ số Tấn Công"
              onChange={(e) => setAttack(Number(e.target.value))}
              className="flex-1 accent-rose-500 cursor-pointer h-2 bg-rose-100 rounded-lg"
            />
            <span className="text-xs font-black text-rose-900 min-w-[32px] text-right">
              {attack} ⭐
            </span>
          </div>

          {/* Phòng Thủ */}
          <div className="bg-white p-2.5 rounded-xl border border-sky-200 flex items-center justify-between gap-3">
            <span className="font-black text-xs text-sky-700 flex items-center gap-1 min-w-[110px]">
              <Shield size={14} className="text-sky-500" /> PHÒNG THỦ (DEF)
            </span>
            <input
              type="range"
              min={1}
              max={15}
              value={defense}
              aria-label="Chỉ số Phòng Thủ"
              onChange={(e) => setDefense(Number(e.target.value))}
              className="flex-1 accent-sky-500 cursor-pointer h-2 bg-sky-100 rounded-lg"
            />
            <span className="text-xs font-black text-sky-900 min-w-[32px] text-right">
              {defense} ⭐
            </span>
          </div>

          {/* Phép Thuật / Trí Tuệ */}
          <div className="bg-white p-2.5 rounded-xl border border-purple-200 flex items-center justify-between gap-3">
            <span className="font-black text-xs text-purple-700 flex items-center gap-1 min-w-[110px]">
              <Wand2 size={14} className="text-purple-500" /> TRÍ TUỆ (MAG)
            </span>
            <input
              type="range"
              min={1}
              max={15}
              value={magic}
              aria-label="Chỉ số Trí Tuệ"
              onChange={(e) => setMagic(Number(e.target.value))}
              className="flex-1 accent-purple-500 cursor-pointer h-2 bg-purple-100 rounded-lg"
            />
            <span className="text-xs font-black text-purple-900 min-w-[32px] text-right">
              {magic} ⭐
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
