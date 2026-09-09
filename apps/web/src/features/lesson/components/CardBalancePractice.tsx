import { useState } from 'react'
import { Shield, Zap, Sparkles, AlertCircle, CheckCircle2, Award } from 'lucide-react'

export type CardStatValues = {
  name: string
  power: number // Sức
  speed: number // Nhanh
  agility: number // Khéo
  skill: string
}

export const MAX_STAT_BUDGET = 20

export const DEFAULT_CARD_STATS: CardStatValues = {
  name: 'Cái Chảo Gang',
  power: 8,
  speed: 2,
  agility: 2,
  skill: 'Phản đòn dầu sôi — Chặn một đòn tấn công của đối thủ',
}

export function validateCardStats(stats: CardStatValues): {
  isValid: boolean
  total: number
  error: string | null
} {
  const total = stats.power + stats.speed + stats.agility
  if (!stats.name.trim()) {
    return { isValid: false, total, error: 'Hãy đặt tên cho thẻ bài của con nhé!' }
  }
  if (total <= 0) {
    return { isValid: false, total, error: 'Hãy phân bổ điểm cho ít nhất một chỉ số!' }
  }
  if (total > MAX_STAT_BUDGET) {
    return {
      isValid: false,
      total,
      error: `Tổng điểm (${total}/${MAX_STAT_BUDGET}) vượt quá quy định! Trò chơi sẽ mất cân bằng. Hãy giảm bớt điểm nhé!`,
    }
  }
  return { isValid: true, total, error: null }
}

type Props = {
  initialValues?: Partial<CardStatValues>
  onSave?: (values: CardStatValues) => void
}

export function CardBalancePractice({ initialValues, onSave }: Props) {
  const [stats, setStats] = useState<CardStatValues>({
    ...DEFAULT_CARD_STATS,
    ...initialValues,
  })
  const [saved, setSaved] = useState(false)

  const validation = validateCardStats(stats)
  const remainingPoints = MAX_STAT_BUDGET - validation.total

  const updateStat = (field: keyof CardStatValues, value: string | number) => {
    setStats((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const presets = [
    { label: 'Chiến Binh Sức Mạnh', p: 10, s: 4, a: 4 },
    { label: 'Thích Khách Tốc Độ', p: 4, s: 10, a: 4 },
    { label: 'Ảo Thuật Gia Khéo Léo', p: 4, s: 4, a: 10 },
    { label: 'Cân Bằng Tam Hợp', p: 6, s: 6, a: 6 },
  ]

  return (
    <div className="flex flex-col gap-6 rounded-[2rem] border-4 border-violet-200 bg-violet-50/60 p-5 sm:p-7 shadow-sm" data-testid="card-balance-practice">
      <div>
        <div className="flex items-center gap-2">
          <Award className="text-violet-600" size={26} />
          <h3 className="font-display text-2xl font-black text-violet-900">
            Phù Phép Mặt Thẻ · Cân Bằng Chỉ Số (Đảo 5)
          </h3>
        </div>
        <p className="mt-1 text-sm font-bold text-violet-700">
          Mỗi lá bài được cấp một túi điểm tối đa <strong>20 điểm</strong>. Mạnh chỗ này thì bớt chỗ khác để trò chơi luôn công bằng!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column: Controls */}
        <div className="flex flex-col gap-4">
          {/* Card Name */}
          <label className="flex flex-col gap-1 text-sm font-black text-slate-700">
            Tên thẻ bài:
            <input
              type="text"
              value={stats.name}
              maxLength={40}
              placeholder="Ví dụ: Cái Chảo Gang, Ấm Hú Còi..."
              className="min-h-12 rounded-xl border-2 border-violet-200 bg-white px-4 font-bold text-slate-800 focus:border-violet-500 focus:outline-none"
              onChange={(e) => updateStat('name', e.target.value)}
            />
          </label>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-black uppercase text-slate-500">Bộ số cân bằng gợi ý:</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setStats((prev) => ({
                      ...prev,
                      power: preset.p,
                      speed: preset.s,
                      agility: preset.a,
                    }))
                    setSaved(false)
                  }}
                  className="rounded-xl border border-violet-300 bg-white px-3 py-1.5 text-xs font-black text-violet-700 hover:bg-violet-100 hover:border-violet-400 transition-colors shadow-2xs"
                >
                  {preset.label} ({preset.p}-{preset.s}-{preset.a})
                </button>
              ))}
            </div>
          </div>

          {/* Stat 1: Sức (Power) */}
          <div className="flex flex-col gap-1.5 rounded-2xl border-2 border-rose-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-black text-sm text-rose-700">
                <Shield size={18} className="text-rose-500" /> SỨC (Sức mạnh tấn công)
              </span>
              <span className="rounded-lg bg-rose-100 px-2.5 py-0.5 text-sm font-black text-rose-800">
                {stats.power} điểm
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={stats.power}
              aria-label="Chỉ số Sức"
              className="accent-rose-500 cursor-pointer h-2 bg-rose-100 rounded-lg"
              onChange={(e) => updateStat('power', Number(e.target.value))}
            />
          </div>

          {/* Stat 2: Nhanh (Speed) */}
          <div className="flex flex-col gap-1.5 rounded-2xl border-2 border-amber-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-black text-sm text-amber-700">
                <Zap size={18} className="text-amber-500" /> NHANH (Tốc độ ra đòn)
              </span>
              <span className="rounded-lg bg-amber-100 px-2.5 py-0.5 text-sm font-black text-amber-800">
                {stats.speed} điểm
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={stats.speed}
              aria-label="Chỉ số Nhanh"
              className="accent-amber-500 cursor-pointer h-2 bg-amber-100 rounded-lg"
              onChange={(e) => updateStat('speed', Number(e.target.value))}
            />
          </div>

          {/* Stat 3: Khéo (Agility) */}
          <div className="flex flex-col gap-1.5 rounded-2xl border-2 border-sky-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-black text-sm text-sky-700">
                <Sparkles size={18} className="text-sky-500" /> KHÉO (Khéo léo né tránh)
              </span>
              <span className="rounded-lg bg-sky-100 px-2.5 py-0.5 text-sm font-black text-sky-800">
                {stats.agility} điểm
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={stats.agility}
              aria-label="Chỉ số Khéo"
              className="accent-sky-500 cursor-pointer h-2 bg-sky-100 rounded-lg"
              onChange={(e) => updateStat('agility', Number(e.target.value))}
            />
          </div>

          {/* Skill description */}
          <label className="flex flex-col gap-1 text-sm font-black text-slate-700">
            Kỹ năng riêng của thẻ:
            <input
              type="text"
              value={stats.skill}
              maxLength={80}
              placeholder="Ví dụ: Hú còi - đối thủ mất 1 lượt..."
              className="min-h-11 rounded-xl border-2 border-violet-200 bg-white px-4 font-semibold text-sm text-slate-800 focus:border-violet-500 focus:outline-none"
              onChange={(e) => updateStat('skill', e.target.value)}
            />
          </label>
        </div>

        {/* Right column: Card Preview & Balance Meter */}
        <div className="flex flex-col items-center justify-between gap-4">
          {/* Card Mockup */}
          <div className="w-full max-w-[260px] aspect-[2/3] rounded-3xl border-4 border-amber-300 bg-gradient-to-b from-amber-50 via-white to-violet-50 p-4 shadow-clay flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2">
              <span className="font-display font-black text-base text-amber-950 truncate">
                {stats.name || 'Thẻ Chưa Đặt Tên'}
              </span>
              <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[11px] font-black text-white">
                {validation.total}đ
              </span>
            </div>

            {/* Center Art Placeholder */}
            <div className="my-auto flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-100/40 p-2 text-center">
              <span className="text-4xl">🎴</span>
              <span className="mt-1 text-[11px] font-bold text-amber-800 line-clamp-2">
                {stats.name}
              </span>
            </div>

            {/* Stat Badges */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-xl bg-rose-50 border border-rose-200 py-1">
                <p className="text-[10px] font-black text-rose-500">SỨC</p>
                <p className="text-sm font-black text-rose-700">{stats.power}</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 py-1">
                <p className="text-[10px] font-black text-amber-500">NHANH</p>
                <p className="text-sm font-black text-amber-700">{stats.speed}</p>
              </div>
              <div className="rounded-xl bg-sky-50 border border-sky-200 py-1">
                <p className="text-[10px] font-black text-sky-500">KHÉO</p>
                <p className="text-sm font-black text-sky-700">{stats.agility}</p>
              </div>
            </div>

            {/* Special Skill */}
            {stats.skill && (
              <p className="mt-2 text-[10px] font-semibold text-slate-600 bg-white/80 p-1.5 rounded-lg border border-slate-200 line-clamp-2">
                ✨ <strong>Kỹ năng:</strong> {stats.skill}
              </p>
            )}
          </div>

          {/* Balance Indicator */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span>Túi điểm cân bằng:</span>
              <span className={validation.isValid ? 'text-emerald-700' : 'text-rose-700'}>
                {validation.total} / {MAX_STAT_BUDGET} điểm
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  validation.isValid
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-r from-rose-500 to-red-600'
                }`}
                style={{ width: `${Math.min(100, (validation.total / MAX_STAT_BUDGET) * 100)}%` }}
              />
            </div>

            {/* Validation Message */}
            {validation.isValid ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>
                  Chỉ số cân bằng hoàn hảo! Con còn lại <strong>{remainingPoints}</strong> điểm tự do.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                <span>{validation.error}</span>
              </div>
            )}

            {/* Action button */}
            <button
              type="button"
              disabled={!validation.isValid}
              onClick={() => {
                if (validation.isValid) {
                  onSave?.(stats)
                  setSaved(true)
                }
              }}
              className={`w-full py-3 px-4 rounded-xl font-black text-sm transition-all border-2 ${
                validation.isValid
                  ? 'bg-violet-600 hover:bg-violet-700 active:translate-y-0.5 text-white border-violet-800 shadow-sm cursor-pointer'
                  : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
              }`}
            >
              {saved ? '✅ Đã Lưu Vào Bộ Thẻ Game!' : '💾 Khóa & Lưu Thẻ Bài Này'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
