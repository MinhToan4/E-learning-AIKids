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
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
            Bước 1 / 2
          </p>
          <h2 className="font-display text-2xl text-text">Chọn phong cách vẽ</h2>
          <p className="mt-0.5 text-sm text-muted">
            Bấm vào phong cách con thích, rồi bấm <strong>Tiếp tục</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-bold text-muted transition hover:border-brand-300 hover:text-text focus-visible:ring-2 focus-visible:ring-brand-200"
        >
          ← Trở về
        </button>
      </div>

      {/* Style grid */}
      <div className="grid grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
        {ART_STYLES.map((style) => {
          const active = style.id === selectedStyle
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelect(style.id)}
              aria-pressed={active}
              className={cn(
                'group flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2 text-center transition focus-visible:ring-2 focus-visible:ring-brand-300',
                active
                  ? 'border-brand-500 bg-brand-50 shadow-clay'
                  : 'border-border bg-white hover:border-brand-300 hover:bg-brand-50/40',
              )}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                <img
                  src={style.img}
                  alt={style.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                />
                {active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-500/20">
                    <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-extrabold text-white">
                      ✓
                    </span>
                  </div>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-bold leading-tight',
                  active ? 'text-brand-600' : 'text-text',
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
        <p className="text-sm text-muted">
          Đã chọn:{' '}
          <strong className="text-brand-600">{current.label}</strong>
        </p>
        <button
          type="button"
          onClick={() => onContinue('canvas')}
          className="ui-btn ui-btn-primary"
        >
          Tiếp tục → Vẽ tranh
        </button>
      </div>
    </div>
  )
}
