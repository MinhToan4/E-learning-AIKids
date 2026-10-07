import React from 'react'
import {
  Clock3,
  MoveRight,
  Volume2,
  ZoomIn,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import type { LearnCardDraft, StageBlockItem } from '@/features/teacher/lib/authoring'

function readableFormula(value: string): string {
  return value
    .replace(/^\s*\$\$?|\$\$?\s*$/g, '')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\(?:cdot|times)/g, '×')
    .replace(/\\(?:Rightarrow|rightarrow)/g, '→')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .trim()
}

export interface LayoutBlocksRendererProps {
  block: StageBlockItem
  card: LearnCardDraft
  isMobile: boolean
  onZoomImage?: (data: {
    title: string
    subtitle?: string
    url?: string
    description?: string
  }) => void
}

export function LayoutBlocksRenderer({
  block,
  card,
  isMobile,
  onZoomImage,
}: LayoutBlocksRendererProps) {
  // ── BLOCK: LAYOUT-CALLOUT ─────────────────────────────────
  if (block.type === 'layout-callout') {
    return (
      <div
        key={block.id}
        data-testid="block-layout-callout"
        className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 sm:p-5 text-amber-950 shadow-2xs text-left"
      >
        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-amber-900 mb-1.5">
          <span>💡</span>
          <span>{block.title || 'Hộp Ghi Nhớ Nổi Bật'}</span>
        </div>
        <p className="text-base font-bold text-amber-950 leading-relaxed">
          {block.tip || block.body || card.tip || 'Bí kíp ghi nhớ quan trọng cho con!'}
        </p>
      </div>
    )
  }

  // ── BLOCK: LAYOUT-FORMULA ─────────────────────────────────
  if (block.type === 'layout-formula') {
    const formulaLatex = block.formula || block.body || card.body || '$$x = a + b$$'
    return (
      <div
        key={block.id}
        data-testid="block-layout-formula"
        className="rounded-2xl border-2 border-brand-200 bg-brand-50/80 p-4 sm:p-5 shadow-sm text-center"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-black uppercase text-brand-800 mb-2">
          <span>📐</span>
          <span>{block.title || 'Công thức'}</span>
        </div>
        <div className="py-2 text-lg sm:text-xl font-bold text-brand-950 flex items-center justify-center">
          <span>{readableFormula(formulaLatex)}</span>
        </div>
      </div>
    )
  }

  // ── BLOCK: LAYOUT-SPLIT ───────────────────────────────────
  if (block.type === 'layout-split') {
    const splitImage = block.imageUrl || card.imageUrl
    return (
      <div
        key={block.id}
        data-testid="block-layout-split"
        className="rounded-3xl border-2 border-orange-200 bg-white/90 p-4 sm:p-5 shadow-sm"
      >
        <div className={cn(isMobile ? "grid grid-cols-1 gap-3 items-start" : "grid grid-cols-1 md:grid-cols-2 gap-4 items-start md:items-center")}>
          <div className="flex flex-col justify-center text-left">
            {block.title && (
              <h3 className="font-display text-xl sm:text-2xl font-black text-text mb-2">
                {block.title}
              </h3>
            )}
            <p className="whitespace-pre-line text-base font-semibold leading-relaxed text-text">
              {block.body || card.body}
            </p>
            {(block.tip || card.tip) && (
              <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50/80 p-3 text-xs font-bold text-orange-900">
                💡 {block.tip || card.tip}
              </div>
            )}
          </div>
          <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-2 group/art flex items-center justify-center min-h-[220px] self-start w-full">
            {splitImage ? (
              <img
                src={splitImage}
                alt={block.imageAlt || block.title || 'Minh họa'}
                className="max-h-[320px] w-auto max-w-full object-contain rounded-xl transition-transform duration-300 group-hover/art:scale-105"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div className="text-sm font-bold text-muted">Chưa có ảnh minh họa</div>
            )}
            {splitImage && (
              <button
                type="button"
                onClick={() =>
                  onZoomImage?.({
                    title: block.title || 'Minh họa',
                    url: splitImage,
                    description: block.body || card.body,
                  })
                }
                className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-black text-white backdrop-blur-xs transition hover:bg-black/85 active:scale-95 shadow-xs cursor-pointer"
              >
                <ZoomIn size={14} />
                <span>🔍 Xem to</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── BLOCK: LAYOUT-GRID ────────────────────────────────────
  if (block.type === 'layout-grid') {
    const items = block.visualItems || card.visualItems || []
    return (
      <div
        key={block.id}
        data-testid="block-layout-grid"
        className="rounded-3xl border-2 border-border bg-white/90 p-4 sm:p-5 shadow-sm text-left"
      >
        {block.title && (
          <h3 className="font-display text-xl sm:text-2xl font-black text-text mb-3">
            {block.title}
          </h3>
        )}
        <div className={cn(isMobile ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3")}>
          {items.map((item, i) => {
            const tone = item.tone || 'brand'
            const toneCls = {
              brand: 'border-brand-200 bg-brand-50/80 text-brand-900',
              sky: 'border-sky-200 bg-sky-50/80 text-sky-900',
              mint: 'border-mint-200 bg-mint-50/80 text-mint-900',
              sun: 'border-sun-200 bg-sun-50/80 text-sun-900',
              coral: 'border-coral-200 bg-coral-50/80 text-coral-900',
              rose: 'border-rose-200 bg-rose-50/80 text-rose-900',
            }[tone] || 'border-brand-200 bg-brand-50/80 text-brand-900'

            return (
              <div
                key={i}
                className={cn('rounded-2xl border-2 p-4 shadow-2xs flex flex-col justify-between', toneCls)}
              >
                <div className="flex items-center gap-2 mb-2 font-black text-base">
                  <span className="grid size-6 place-items-center rounded-full bg-white/80 text-xs font-black">
                    {i + 1}
                  </span>
                  <span>{item.label}</span>
                </div>
                <p className="text-sm font-semibold leading-relaxed opacity-90">{item.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── BLOCK: LAYOUT-FOUR-KEYS ───────────────────────────────
  if (block.type === 'layout-four-keys') {
    const items = (block.visualItems || []).slice(0, 4)
    const keyPresets = [
      { border: 'border-sky-300', bg: 'bg-sky-50 text-sky-950', badge: 'bg-blue-600 text-white', defaultImage: '/assets/aiki-keys/key_what_blue.jpg', defaultSub: 'Ai, đồ vật gì' },
      { border: 'border-amber-300', bg: 'bg-amber-50 text-amber-950', badge: 'bg-amber-600 text-white', defaultImage: '/assets/aiki-keys/key_how_yellow.jpg', defaultSub: 'Màu sắc, hình dáng' },
      { border: 'border-orange-300', bg: 'bg-orange-50 text-orange-950', badge: 'bg-orange-600 text-white', defaultImage: '/assets/aiki-keys/key_action_orange.jpg', defaultSub: 'Hành động' },
      { border: 'border-rose-300', bg: 'bg-rose-50 text-rose-950', badge: 'bg-rose-600 text-white', defaultImage: '/assets/aiki-keys/key_where_pink.jpg', defaultSub: 'Bối cảnh, nơi chốn' },
    ]
    return (
      <section key={block.id} data-testid="block-layout-four-keys" className="rounded-3xl bg-white p-4 shadow-clay sm:p-6 text-left">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="inline-flex min-h-10 items-center rounded-full bg-brand-100 px-4 text-xs font-black uppercase tracking-wide text-brand-800">Bộ khung câu lệnh</span>
            <h3 className="mt-3 font-display text-2xl font-black text-text sm:text-3xl">{block.title || 'Bốn chiếc chìa khóa mở câu lệnh'}</h3>
            {block.body && <p className="mx-auto mt-2 max-w-2xl text-base font-semibold leading-relaxed text-slate-700">{block.body}</p>}
          </div>
          <div className={cn("mt-5", isMobile ? "grid grid-cols-1 gap-2.5" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4")}>
            {items.map((item, index) => {
              const preset = keyPresets[index % keyPresets.length]
              const keyImg = item.keyImage || preset.defaultImage
              const subText = item.sub
              return (
                <article key={`${block.id}-${index}`} className={cn('min-h-40 rounded-3xl border-2 p-4 shadow-sm flex flex-col justify-between', preset.border, preset.bg)}>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="grid size-10 place-items-center rounded-2xl bg-white font-black shadow-sm text-sm" aria-hidden="true">{index + 1}</span>
                      <div className="flex items-center gap-1.5">
                        {keyImg && (
                          <img src={keyImg} alt={item.label} className="w-7 h-7 rounded-lg object-contain bg-white/90 p-0.5 border border-amber-200 shadow-2xs" />
                        )}
                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-black uppercase">Chìa khóa {index + 1}</span>
                      </div>
                    </div>
                    <h4 className="mt-3 text-lg font-black leading-tight">{item.label}</h4>
                    <p className="mt-1.5 text-sm font-semibold leading-relaxed opacity-90">{item.text}</p>
                  </div>
                  {subText && (
                    <span className="mt-2.5 text-xs font-bold text-slate-500/90 block">({subText})</span>
                  )}
                </article>
              )
            })}
          </div>
          {block.tip && <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-center text-sm font-black text-brand-900">{block.tip}</p>}
        </div>
      </section>
    )
  }

  // ── BLOCK: LAYOUT-CONFIRM-OPTION ──────────────────────────
  if (block.type === 'layout-confirm-option') {
    return (
      <div
        key={block.id}
        data-testid="block-layout-confirm-option"
        className={cn(
          "rounded-3xl border-2 bg-white p-4 sm:p-5 shadow-sm text-left transition-all",
          block.isCorrect ? "border-emerald-400 bg-emerald-50/20 ring-2 ring-emerald-200" : "border-border"
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-800">
            {block.title || 'Phương án lựa chọn'}
          </span>
          {block.isCorrect && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 flex items-center gap-1">
              ✓ Đáp án đúng
            </span>
          )}
        </div>
        {block.imageUrl && (
          <div className="aspect-[16/10] sm:aspect-[2/1] w-full rounded-2xl overflow-hidden mb-3 bg-slate-50 border border-slate-200/80 flex items-center justify-center">
            <img
              src={block.imageUrl}
              alt={block.title || 'Hình ảnh phương án'}
              className="size-full object-contain p-2"
            />
          </div>
        )}
        {block.body && (
          <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed">
            {block.body}
          </p>
        )}
      </div>
    )
  }

  // ── BLOCK: LAYOUT-STORYBOARD ──────────────────────────────
  if (block.type === 'layout-storyboard') {
    const items = block.visualItems || card.visualItems || []
    return (
      <div
        key={block.id}
        data-testid="block-layout-storyboard"
        className="rounded-3xl border-2 border-border bg-white/90 p-4 sm:p-5 shadow-sm text-left"
      >
        {block.title && (
          <h3 className="font-display text-xl sm:text-2xl font-black text-text mb-3">
            {block.title}
          </h3>
        )}
        <div className={cn(isMobile ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3")}>
          {items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="rounded-2xl border-2 border-brand-200 bg-white p-4 shadow-sm flex flex-col justify-between"
            >
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl border-2 border-text/20 bg-sky-50">
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-mint-100" />
                <AikidCatCharacter
                  pose="walking"
                  className={cn(
                    'absolute bottom-[12%] h-[58%] w-[48%] object-contain drop-shadow-sm',
                    itemIndex === 0 ? 'left-[5%]' : itemIndex === 1 ? 'left-[22%]' : 'left-[38%]'
                  )}
                />
                {item.shot && (
                  <span className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-extrabold text-text">
                    {item.shot}
                  </span>
                )}
              </div>
              <p className="font-extrabold text-base leading-tight text-text">{item.label}</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-text/80">{item.text}</p>
              {(item.duration || item.sound || item.direction) && (
                <dl className="mt-2.5 grid gap-1 border-t border-slate-100 pt-2 text-xs font-bold text-muted">
                  {item.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock3 size={13} /> {item.duration}
                    </div>
                  )}
                  {item.sound && (
                    <div className="flex items-center gap-1.5">
                      <Volume2 size={13} /> {item.sound}
                    </div>
                  )}
                  {item.direction && (
                    <div className="flex items-center gap-1.5">
                      <MoveRight size={13} /> {item.direction}
                    </div>
                  )}
                </dl>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
