import { cn } from '@/shared/lib/cn'
import { ART_STYLES } from '../lib/workshop-types'
import type { WorkshopStep } from '../lib/workshop-types'

type Props = {
  selectedStyle: string
  onSelect: (styleId: string) => void
  onContinue: (step: WorkshopStep) => void
  onBack: () => void
}

export function WorkshopStylePicker({ selectedStyle, onSelect, onContinue, onBack }: Props) {
  const current = ART_STYLES.find((s) => s.id === selectedStyle) ?? ART_STYLES[0]!

  return (
    <div className="flex h-full flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-brand-500">
            Bước 1 / 2
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-text">Chọn phong cách vẽ</h2>
          <p className="mt-1 text-sm sm:text-base text-muted">
            Bấm vào phong cách con thích, rồi bấm <strong className="text-text font-bold">Tiếp tục</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border-2 border-border bg-white px-4 py-2.5 text-sm font-bold text-muted transition hover:border-brand-300 hover:text-text focus-visible:ring-2 focus-visible:ring-brand-200"
        >
          ← Trở về
        </button>
      </div>

      {/* Style grid - 5 per row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5 pb-4">
        {ART_STYLES.map((style) => {
          const active = style.id === selectedStyle
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelect(style.id)}
              aria-pressed={active}
              className={cn(
                'group flex flex-col items-center gap-2.5 rounded-2xl border-2 p-2.5 sm:p-3 text-center transition-all duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
                active
                  ? 'border-brand-500 bg-brand-50/80 shadow-clay ring-2 ring-brand-400/20'
                  : 'border-border/80 bg-white hover:border-brand-300 hover:bg-brand-50/30 hover:shadow-md',
              )}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-sm">
                <img
                  src={style.img}
                  alt={style.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                />
                {active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-600/25 backdrop-blur-[1px]">
                    <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-brand-500 text-xs sm:text-sm font-black text-white shadow-md ring-2 ring-white">
                      ✓
                    </span>
                  </div>
                )}
              </div>
              <span
                className={cn(
                  'text-xs sm:text-sm font-extrabold tracking-wide transition-colors',
                  active ? 'text-brand-700' : 'text-text group-hover:text-brand-600',
                )}
              >
                {style.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm sm:text-base text-muted">
          Đã chọn:{' '}
          <strong className="text-brand-600 font-extrabold">{current.label}</strong>
        </p>
        <button
          type="button"
          onClick={() => onContinue('canvas')}
          className="ui-btn ui-btn-primary px-6 py-3 text-base font-extrabold shadow-clay"
        >
          Tiếp tục → Vẽ tranh
        </button>
      </div>
    </div>
  )
}
