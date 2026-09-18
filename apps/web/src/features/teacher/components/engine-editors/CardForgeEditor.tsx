import React from 'react'
import { Sparkles, Swords, Shield, Zap, Gem } from 'lucide-react'
import type { SixStageCardForgeOptions } from '../../../../shared/lib/api'
import {
  DEFAULT_CARD_FORGE_OPTIONS,
  CARD_FORGE_ELEMENT_PRESETS,
  CARD_FORGE_TIER_PRESETS,
  type CardForgeElementPreset,
  type CardForgeTierPreset,
} from './engine-editor-defaults'

interface CardForgeEditorProps {
  cardForgeOptions?: SixStageCardForgeOptions
  onChange: (options: SixStageCardForgeOptions) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
}

const CARD_BORDERS = [
  'Bạc Tinh Xảo',
  'Vàng Hoàng Kim',
  'Pha Lê Thần Thoại',
]

export function CardForgeEditor({
  cardForgeOptions,
  onChange,
  showToast,
}: CardForgeEditorProps) {
  const currentOptions = cardForgeOptions || DEFAULT_CARD_FORGE_OPTIONS

  const handleUpdateElement = (index: number, patch: Partial<{ id: string; name: string; icon: string }>) => {
    const nextElems = [...currentOptions.elements]
    nextElems[index] = { ...nextElems[index], ...patch }
    onChange({
      ...currentOptions,
      elements: nextElems,
    })
  }

  const handleUpdateStats = (patch: Partial<SixStageCardForgeOptions['stats']>) => {
    onChange({
      ...currentOptions,
      stats: {
        ...currentOptions.stats,
        ...patch,
      },
    })
  }

  const handleSelectBorder = (border: string) => {
    onChange({
      ...currentOptions,
      cardBorder: border,
    })
  }

  const handleSelectElementPreset = (preset: CardForgeElementPreset) => {
    // Cập nhật tên tuyệt chiêu và chỉ số mẫu của nguyên tố đó
    onChange({
      ...currentOptions,
      stats: {
        ...currentOptions.stats,
        skillName: preset.skill,
        hp: preset.hp,
        atk: preset.atk,
      },
    })
    showToast(`🃏 Đã nạp tuyệt chiêu: ${preset.skill} (${preset.name})`, 'success')
  }

  const handleSelectTierPreset = (tier: CardForgeTierPreset) => {
    onChange({
      ...currentOptions,
      stats: {
        ...currentOptions.stats,
        hp: tier.hp,
        atk: tier.atk,
      },
    })
    showToast(`⚔️ Đã thiết lập cấp bậc ${tier.name}: HP ${tier.hp} / ATK ${tier.atk}`, 'success')
  }

  const handleLoadDefaults = () => {
    onChange(DEFAULT_CARD_FORGE_OPTIONS)
    showToast('🪄 Đã tạo mẫu thẻ bài TCG chuẩn Hallmark', 'success')
  }

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-white p-4 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
        <div>
          <h4 className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
            <span>🃏 Xưởng Đúc Thẻ Bài TCG (Card Forge Editor)</span>
            <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-black">
              Game Thẻ Bài
            </span>
          </h4>
          <p className="text-[11px] font-medium text-slate-600 mt-0.5">
            Biên soạn 4 Hệ nguyên tố, chỉ số sức mạnh HP/ATK và khung viền thần thoại theo các cụm prompt có sẵn.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadDefaults}
          className="rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-800 shadow-2xs hover:bg-amber-100 transition cursor-pointer flex items-center gap-1"
        >
          <Sparkles size={12} className="text-amber-600" />
          <span>🪄 Tạo mẫu thẻ bài TCG</span>
        </button>
      </div>

      {/* ── KHAY NGUYÊN TỐ & TUYỆT CHIÊU CÓ SẴN ──────────────────────── */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-900 flex items-center gap-1">
            ⚡ Ngân Hàng Tuyệt Chiêu &amp; Hệ Nguyên Tố (1-Chạm Nạp Nhanh):
          </span>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            {CARD_FORGE_ELEMENT_PRESETS.length} chiêu thức
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CARD_FORGE_ELEMENT_PRESETS.map((p) => {
            const isCurrentSkill = currentOptions.stats.skillName === p.skill
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectElementPreset(p)}
                className={`rounded-full px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                  isCurrentSkill
                    ? 'bg-amber-500 text-white border border-amber-600 shadow-xs'
                    : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 active:scale-95'
                }`}
                title={`HP: ${p.hp} | ATK: ${p.atk}`}
              >
                <span>{p.icon}</span>
                <span>{p.name}: {p.skill}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 1. 4 Hệ Nguyên Tố ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase">
          <Zap size={14} className="text-amber-700" />
          <span>🔮 4 Hệ Nguyên Tố</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentOptions.elements.map((elem, idx) => (
            <div
              key={elem.id || idx}
              className="flex items-center gap-2 bg-white rounded-xl border border-amber-200 p-2 shadow-2xs"
            >
              <input
                type="text"
                value={elem.icon}
                onChange={(e) => handleUpdateElement(idx, { icon: e.target.value })}
                title="Icon hệ"
                className="size-8 text-center rounded-lg border border-amber-200 bg-slate-50 text-base shrink-0 font-bold"
              />
              <input
                type="text"
                value={elem.name}
                onChange={(e) => handleUpdateElement(idx, { name: e.target.value })}
                placeholder="Tên hệ nguyên tố..."
                className="flex-1 min-w-0 rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Chỉ Số Sức Mạnh & Kỹ Năng ────────────────────────────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase">
            <Swords size={14} className="text-amber-700" />
            <span>⚔️ Chỉ Số Sức Mạnh &amp; Kỹ Năng</span>
          </div>

          {/* Khay Cấp Bậc & Chỉ Số Mẫu */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 mr-1">Cấp bậc mẫu:</span>
            {CARD_FORGE_TIER_PRESETS.map((tier, tIdx) => {
              const isMatch = currentOptions.stats.hp === tier.hp && currentOptions.stats.atk === tier.atk
              return (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => handleSelectTierPreset(tier)}
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-black transition border cursor-pointer ${
                    isMatch
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/70'
                  }`}
                >
                  {tier.name}: {tier.hp}/{tier.atk}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase flex items-center gap-1">
              <Shield size={12} className="text-sky-600" />
              <span>HP (Máu: 800 - 1500):</span>
            </label>
            <input
              type="number"
              min={800}
              max={1500}
              value={currentOptions.stats.hp}
              onChange={(e) => handleUpdateStats({ hp: parseInt(e.target.value, 10) || 1000 })}
              className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-black text-emerald-700 font-mono focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase flex items-center gap-1">
              <Swords size={12} className="text-rose-600" />
              <span>ATK (Tấn công: 500 - 1200):</span>
            </label>
            <input
              type="number"
              min={500}
              max={1200}
              value={currentOptions.stats.atk}
              onChange={(e) => handleUpdateStats({ atk: parseInt(e.target.value, 10) || 700 })}
              className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-black text-rose-700 font-mono focus:border-amber-400 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-700 uppercase">
            Tên tuyệt chiêu thẻ bài:
          </label>
          <input
            type="text"
            value={currentOptions.stats.skillName}
            onChange={(e) => handleUpdateStats({ skillName: e.target.value })}
            placeholder="VD: Bão Băng Tinh Thể Khúc Xạ, Hỏa Long Cuồng Nộ..."
            className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-950 focus:border-amber-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* ── 3. Khung Viền Thẻ Bài ────────────────────────────────────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase">
          <Gem size={14} className="text-purple-600" />
          <span>💎 Khung Viền Thẻ Bài</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {CARD_BORDERS.map((border) => {
            const isSelected = currentOptions.cardBorder === border
            return (
              <button
                key={border}
                type="button"
                onClick={() => handleSelectBorder(border)}
                className={`rounded-xl p-2 text-center text-xs font-bold transition border cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500 text-white shadow-2xs'
                    : 'border-amber-200 bg-white text-slate-700 hover:bg-amber-100/50'
                }`}
              >
                {border}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
