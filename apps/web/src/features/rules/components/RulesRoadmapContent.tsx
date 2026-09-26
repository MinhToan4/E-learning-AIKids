import { Link, useNavigate } from 'react-router'
import { ArrowLeft, CheckCircle2, Lock, Star, Award, Printer } from 'lucide-react'
import { AIKI_RULES_DATA } from '../data/rules-data'
import { useRulesProgress } from '../hooks/useRulesProgress'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { cn } from '@/shared/lib/cn'

export type RulesRoadmapContentProps = {
  courseId?: string
  backUrl?: string
  onBack?: () => void
  onSelectRule?: (ruleId: number) => void
  ruleUrlPattern?: (ruleId: number) => string
}

export function RulesRoadmapContent({
  courseId = 'aiki-rules',
  backUrl = '/world',
  onBack,
  onSelectRule,
  ruleUrlPattern,
}: RulesRoadmapContentProps) {
  const navigate = useNavigate()
  const { progress, completedCount, totalCount } = useRulesProgress()

  // First available uncompleted rule is the "current" rule
  const currentRuleId = AIKI_RULES_DATA.find((r) => progress.rules[r.id]?.status === 'available')?.id ?? 1

  const handleGoToRule = (ruleId: number) => {
    if (onSelectRule) {
      onSelectRule(ruleId)
      return
    }
    if (ruleUrlPattern) {
      navigate(ruleUrlPattern(ruleId))
      return
    }
    navigate(`/world/${courseId || 'aiki-rules'}/lesson/rule-${ruleId}`)
  }

  return (
    <div className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#f3f0ff] text-text selection:bg-brand-500 selection:text-white">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 px-3 sm:px-4 md:px-6 py-3 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-[1024px] w-full items-center justify-between gap-3">
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-border bg-white px-3.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-brand-300 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Nhà sáng tạo</span>
                <span className="sm:hidden">Quay lại</span>
              </button>
            ) : (
              <Link
                to={backUrl}
                className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-border bg-white px-3.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-brand-300 hover:bg-slate-50"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Nhà sáng tạo</span>
                <span className="sm:hidden">Quay lại</span>
              </Link>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold text-text sm:text-lg">
                  Phần 1 · 5 Quy Tắc Vàng Cốt Lõi
                </span>
                <span className="rounded-full border border-brand-200 bg-brand-100 px-2.5 py-0.5 text-[11px] font-extrabold text-brand-800">
                  8 - 11 tuổi
                </span>
              </div>
              <p className="hidden text-xs text-muted sm:block">
                Khám phá 5 bí quyết an toàn cốt lõi để trở thành Nhà Sáng Tạo AI nhí thông thái
              </p>
              <div className="sr-only" aria-hidden="true">
                <span>Phần 1 · Mười quy tắc của Xưởng</span>
              </div>
            </div>
          </div>

          {/* Right: Badge, Stars & Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 md:inline-flex">
              Miễn phí trọn đời
            </span>

            <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 shadow-xs">
              <Star size={15} className="fill-amber-500 text-amber-500" />
              <span>{progress.totalStars} sao</span>
            </div>

            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brand-200 bg-brand-50 shadow-xs">
              <AikidCatCharacter pose="welcome" className="h-full w-full object-cover scale-125 translate-y-1" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <main className="mx-auto max-w-[1024px] w-full px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ══════════════════════════════════════════════════════════
              CỘT TRÁI (8 COLS): 10 THẺ QUY TẮC + THANH TIẾN ĐỘ
             ══════════════════════════════════════════════════════════ */}
          <div className="space-y-6 lg:col-span-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-black uppercase tracking-wider mb-2">
                  🛡️ 10 Quy Tắc Vàng
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Lộ trình 10 Quy Tắc Vàng
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                  Hoàn thành từng quy tắc để tích lũy ngôi sao và mở khóa toàn bộ Xưởng sáng tạo
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="font-display text-xl font-black text-brand-600 sm:text-2xl">
                  {completedCount}/{totalCount}
                </span>
                <span className="block text-[11px] font-bold text-muted uppercase tracking-wider">
                  Đã hoàn thành
                </span>
              </div>
            </div>

            {/* List of 10 Rule Cards */}
            <div className="space-y-3.5">
              {AIKI_RULES_DATA.map((rule) => {
                const ruleProgress = progress.rules[rule.id]
                const status = ruleProgress?.status ?? (rule.id === 1 ? 'available' : 'locked')
                const isCompleted = status === 'completed'
                const isCurrent = status === 'available' && rule.id === currentRuleId
                const isAvailable = status === 'available'
                const isLocked = status === 'locked'

                return (
                  <div
                    key={rule.id}
                    className={cn(
                      'group relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all duration-300 clay-card-subtle',
                      // Completed card
                      isCompleted &&
                        'border-mint-300/80 bg-white [--clay-shadow:rgba(5,150,105,0.15)] hover:border-mint-400',
                      // Current (Active) card
                      isCurrent &&
                        'border-amber-300 bg-[#fffbeb] [--clay-shadow:rgba(245,158,11,0.22)] ring-1 ring-amber-200',
                      // Available (other uncompleted)
                      isAvailable &&
                        !isCurrent &&
                        'border-slate-200/80 bg-white [--clay-shadow:rgba(0,0,0,0.06)] hover:border-brand-300',
                      // Locked card
                      isLocked && 'border-slate-200/60 bg-slate-50/80 text-slate-400 opacity-75',
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Status Icon */}
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-100 border border-mint-200 text-mint-700">
                              <CheckCircle2 size={24} className="stroke-[2.5]" />
                            </div>
                          ) : isCurrent ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 font-black text-sm">
                              {rule.id}
                            </div>
                          ) : isLocked ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200/80 border border-slate-300 text-slate-400">
                              <Lock size={20} />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 border border-brand-200 text-brand-700">
                              <span className="font-black text-sm">{rule.id}</span>
                            </div>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                'text-xs font-black tracking-wider uppercase',
                                isCompleted && 'text-mint-700',
                                isCurrent && 'text-amber-800',
                                isLocked && 'text-slate-400',
                                isAvailable && !isCurrent && 'text-brand-600',
                              )}
                            >
                              Quy tắc {rule.id < 10 ? `0${rule.id}` : rule.id}
                            </span>

                            {isCurrent && (
                              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-2xs animate-bounce">
                                Tới lượt con
                              </span>
                            )}

                            {isCompleted && (
                              <span className="rounded-full bg-mint-100 border border-mint-200 px-2.5 py-0.5 text-[10px] font-bold text-mint-800">
                                Đúng 2/2 câu · +3 ⭐
                              </span>
                            )}
                          </div>

                          <h3
                            className={cn(
                              'mt-1 font-display text-base sm:text-lg leading-snug',
                              isCompleted && 'text-text font-bold',
                              isCurrent && 'text-text font-black',
                              isLocked && 'text-slate-400 font-bold',
                              isAvailable && !isCurrent && 'text-text font-bold',
                            )}
                          >
                            {rule.title}
                          </h3>

                          <p
                            className={cn(
                              'mt-1 text-xs sm:text-[13px] line-clamp-2 sm:line-clamp-none leading-relaxed',
                              isCompleted && 'text-muted',
                              isCurrent && 'text-amber-900/80 font-medium',
                              isLocked && 'text-slate-400',
                              isAvailable && !isCurrent && 'text-muted',
                            )}
                          >
                            {rule.skill}
                          </p>
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="shrink-0 self-end sm:self-center">
                        {isCompleted ? (
                          <button
                            type="button"
                            onClick={() => handleGoToRule(rule.id)}
                            className="inline-flex items-center gap-1 rounded-2xl border border-mint-200 bg-mint-50 px-3.5 py-2 min-h-[40px] text-xs font-black text-mint-800 transition-all hover:bg-mint-100 cursor-pointer shadow-2xs active:scale-95"
                          >
                            <span>Xem lại</span>
                          </button>
                        ) : isCurrent ? (
                          <button
                            type="button"
                            onClick={() => handleGoToRule(rule.id)}
                            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#f59e0b] hover:bg-[#d97706] px-4 py-2.5 min-h-[44px] text-xs font-black text-white clay-card-subtle [--clay-shadow:rgba(245,158,11,0.25)] active:scale-95 transition-all cursor-pointer shadow-sm"
                          >
                            <span>Xem ngay</span>
                          </button>
                        ) : isAvailable ? (
                          <button
                            type="button"
                            onClick={() => handleGoToRule(rule.id)}
                            className="inline-flex items-center gap-1 rounded-2xl border border-brand-200 bg-brand-100 px-3.5 py-2 min-h-[40px] text-xs font-bold text-brand-800 hover:bg-brand-200 cursor-pointer shadow-2xs transition-all active:scale-95"
                          >
                            <span>Khám phá</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-2xl bg-slate-200 px-3 py-1.5 min-h-[36px] text-xs font-semibold text-slate-500">
                            <Lock size={13} />
                            <span>Chưa mở</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Progress Bar */}
            <div className="rounded-3xl border border-border bg-white p-5 shadow-clay clay-card-subtle [--clay-shadow:rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-text font-bold">
                  {completedCount} / {totalCount} quy tắc · mở lần lượt từng cái một
                </span>
                <span className="text-brand-600 font-extrabold">{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="mt-2.5 h-3.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                <div
                  className="h-full rounded-full bg-[#059669] transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              CỘT PHẢI (4 COLS): 3 THẺ TƯƠNG TÁC CỦA MÈO AIKI
             ══════════════════════════════════════════════════════════ */}
          <div className="space-y-5 lg:col-span-4">
            {/* Card 1: AIKI Nhắn Con */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-white p-5 sm:p-6 shadow-clay clay-card-subtle [--clay-shadow:rgba(0,0,0,0.06)] text-text">
              <div className="flex items-center gap-2.5 text-brand-700">
                <span className="text-2xl">🐱</span>
                <h2 className="font-display text-base font-extrabold uppercase tracking-wide text-brand-900">
                  AIKI Nhắn Con
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text font-medium">
                "Mười quy tắc này ngắn thôi, xem một loáng là xong. Xong hết là cửa Khoá học mở ra cho cậu ngay!"
              </p>
              <div className="mt-4 flex items-center justify-end">
                <span className="text-[11px] font-bold text-brand-600 italic">— Bạn Mèo AIKI thân mến</span>
              </div>
            </div>

            {/* Card 2: Bộ Sưu Tập Poster Vàng */}
            <div className="rounded-3xl border border-border bg-white p-5 sm:p-6 shadow-clay clay-card-subtle [--clay-shadow:rgba(245,158,11,0.12)] text-text">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600">
                  <Award size={20} className="text-amber-500" />
                  <h2 className="font-display text-base font-extrabold uppercase tracking-wide text-amber-900">
                    Bộ sưu tập Poster Vàng
                  </h2>
                </div>
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-800">
                  {progress.unlockedPosters.length}/10
                </span>
              </div>

              {/* 10 Thumbnail Poster Slots Grid */}
              <div className="mt-4 grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => {
                  const ruleNumber = i + 1
                  const isUnlocked = progress.unlockedPosters.includes(ruleNumber)
                  return (
                    <div
                      key={ruleNumber}
                      title={isUnlocked ? `Poster Quy tắc ${ruleNumber}` : `Chưa mở khóa Quy tắc ${ruleNumber}`}
                      className={cn(
                        'aspect-[3/4] rounded-2xl flex flex-col items-center justify-center transition-all',
                        isUnlocked
                          ? 'border border-amber-300 bg-amber-50 text-amber-950 font-black shadow-2xs scale-105'
                          : 'border border-slate-200 bg-slate-100/70 text-slate-400 font-bold',
                      )}
                    >
                      {isUnlocked ? (
                        <>
                          <span className="text-xs">{ruleNumber}</span>
                          <span className="text-[9px] text-amber-500">★</span>
                        </>
                      ) : (
                        <span className="text-xs">?</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted font-medium">
                Đủ 10 tấm là con in được cả bộ, ký tên rồi dán ở bàn học.
              </p>

              {completedCount === totalCount && (
                <button
                  type="button"
                  onClick={() => alert('Chúc mừng con đã xuất sắc mở trọn bộ 10 Poster Vàng! Tải và in ngay nhé!')}
                  className="mt-3.5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] hover:bg-[#d97706] py-2.5 text-xs font-black text-white clay-card-subtle [--clay-shadow:rgba(245,158,11,0.25)] cursor-pointer transition-all"
                >
                  <Printer size={14} />
                  <span>In trọn bộ 10 Poster</span>
                </button>
              )}
            </div>

            {/* Card 3: Vì sao phải xem hết? */}
            <div className="rounded-3xl border border-border bg-white p-5 sm:p-6 shadow-clay clay-card-subtle [--clay-shadow:rgba(0,0,0,0.06)] text-text">
              <h2 className="font-display text-base font-extrabold uppercase tracking-wide text-brand-900">
                Vì sao phải xem hết?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted font-medium">
                Mười quy tắc này quay lại ở mọi bài thực hành trong Khoá học. Con nhớ trước thì vào Xưởng làm mới nhanh.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
