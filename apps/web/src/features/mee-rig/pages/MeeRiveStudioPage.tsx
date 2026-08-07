import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { MEE_CATEGORIES, type MeeCategory } from '../contract'
import { MeeRiveCanvas } from '../components/MeeRiveCanvas'

const SWATCHES = ['#ffad92', '#f5b77e', '#d99159', '#9d6849', '#603719']

export function MeeRiveStudioPage() {
  const [category, setCategory] = useState<MeeCategory>('body')
  const [swatch, setSwatch] = useState(2)
  const [options, setOptions] = useState<Record<MeeCategory, number>>({ body: 0, eyes: 0, hair: 0, shirt: 0, pants: 0, accessory: 0 })
  const [contractReady, setContractReady] = useState(false)
  const handleContractReady = useCallback((ready: boolean) => setContractReady(ready), [])
  const selectedOption = options[category]

  return (
    <main
      className="relative min-h-[calc(100vh-2.5rem)] overflow-hidden rounded-[2rem] bg-sky-300 bg-cover bg-center shadow-soft"
      style={{ backgroundImage: "url('/assets/designer/lobby/bg-character.webp')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/5 via-transparent to-emerald-900/10" aria-hidden="true" />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
        <Link to="/profile" className="inline-flex min-h-11 items-center rounded-2xl bg-white/95 px-4 font-extrabold text-brand-700 shadow-soft">
          ← Hồ sơ
        </Link>
        <div className="rounded-2xl bg-white/90 px-4 py-2 text-right shadow-soft backdrop-blur">
          <h1 className="font-display text-xl text-text sm:text-2xl">Mee Avatar Studio</h1>
          <p className="text-sm font-bold text-brand-700">Xưởng tạo Mee chuyển động</p>
        </div>
      </header>

      <div className="relative z-10 grid min-h-[calc(100vh-9rem)] items-stretch gap-4 p-4 pt-0 sm:p-6 sm:pt-0 lg:grid-cols-[minmax(24rem,1fr)_minmax(22rem,30rem)] lg:gap-6">
        <section className="relative min-h-[32rem] overflow-hidden rounded-[2rem] lg:min-h-0" aria-label="Sân khấu nhân vật">
          <div className="absolute inset-x-[8%] bottom-[5%] h-8 rounded-[50%] bg-emerald-950/20 blur-sm" aria-hidden="true" />
          <div className="absolute inset-0">
            <MeeRiveCanvas selection={{ category, option: selectedOption, swatch }} onContractReady={handleContractReady} />
          </div>
          <p className="absolute bottom-4 left-4 max-w-xs rounded-2xl bg-slate-950/65 px-4 py-2 text-xs font-bold text-white backdrop-blur">
            {contractReady ? 'Mee Rig v1 đã kết nối đủ các điều khiển.' : 'Đang xem runtime mẫu. Source vector Mee Rig v1 đã sẵn sàng để import vào Rive Editor.'}
          </p>
        </section>

        <aside className="self-center overflow-hidden rounded-[2rem] bg-white/95 shadow-xl backdrop-blur lg:max-h-[42rem]" aria-label="Tủ đồ Mee">
          <nav className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-3" aria-label="Danh mục tùy chỉnh">
            {MEE_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={`min-h-16 min-w-16 rounded-t-2xl px-2 text-xl transition-colors ${category === item.id ? 'border-b-4 border-brand-600 bg-brand-50' : 'text-slate-400 hover:bg-slate-50'}`}
                aria-label={item.label}
                aria-pressed={category === item.id}
              >
                <MeeCategoryIcon category={item.id} />
              </button>
            ))}
          </nav>

          <div className="p-5 sm:p-6">
            <h2 className="font-display text-2xl text-text">{MEE_CATEGORIES.find((item) => item.id === category)?.label}</h2>
            <p className="mt-1 text-sm font-bold text-muted">Chọn màu và mẫu để thử luồng thay đồ.</p>
            <div className="mt-5 flex flex-wrap gap-3" aria-label="Màu sắc">
              {SWATCHES.map((color, index) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSwatch(index)}
                  className={`h-14 w-14 rounded-full border-4 border-white shadow-soft ring-offset-2 ${swatch === index ? 'ring-4 ring-brand-600' : ''}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Màu ${index + 1}`}
                  aria-pressed={swatch === index}
                />
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOptions((current) => ({ ...current, [category]: item }))}
                  className={`aspect-square rounded-3xl border-2 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 motion-reduce:transform-none ${selectedOption === item ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-100'}`}
                  aria-label={`Mẫu ${item + 1}`}
                  aria-pressed={selectedOption === item}
                >
                  <MeeCategoryIcon category={category} size={38} />
                </button>
              ))}
            </div>
            <button type="button" className="mt-8 min-h-12 w-full rounded-2xl bg-brand-600 px-5 font-extrabold text-white shadow-press hover:bg-brand-700">
              Lưu Mee
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}

function MeeCategoryIcon({ category, size = 28 }: { category: MeeCategory; size?: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="mx-auto text-brand-700">
      {category === 'body' && <><circle cx="16" cy="9" r="5" {...common} /><path d="M8 27c0-7 3-11 8-11s8 4 8 11" {...common} /></>}
      {category === 'eyes' && <><ellipse cx="10" cy="16" rx="7" ry="5" {...common} /><ellipse cx="22" cy="16" rx="7" ry="5" {...common} /><circle cx="10" cy="16" r="2" fill="currentColor" /><circle cx="22" cy="16" r="2" fill="currentColor" /></>}
      {category === 'hair' && <><path d="M7 17C5 7 11 3 16 3c7 0 11 5 9 15-3-1-5-4-6-8-3 4-7 6-12 7Z" {...common} /><path d="M9 17v8M23 17v8" {...common} /></>}
      {category === 'shirt' && <path d="m11 6 5 3 5-3 7 6-4 5-2-2v12H10V15l-2 2-4-5 7-6Z" {...common} />}
      {category === 'pants' && <path d="M9 5h14l2 22h-7l-2-13-2 13H7L9 5Z" {...common} />}
      {category === 'accessory' && <><rect x="7" y="10" width="18" height="17" rx="5" {...common} /><path d="M11 11V9a5 5 0 0 1 10 0v2M11 19h10" {...common} /></>}
    </svg>
  )
}
