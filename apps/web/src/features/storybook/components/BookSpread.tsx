import type { StorybookPage } from '../storybook-data'

export function BookSpread({
  page,
  earned,
}: {
  page: StorybookPage
  earned: ReadonlySet<string>
}) {
  const earnedCount = page.stickers.filter((item) => earned.has(item.id)).length
  return (
    <section
      className="relative mx-auto max-w-5xl overflow-hidden rounded-[1.5rem] border-[8px] border-[#6f351d] bg-[#fff9df] shadow-[0_24px_60px_rgba(75,36,20,0.32)] sm:rounded-[2rem]"
      aria-labelledby={`page-${page.slug}`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-8 -translate-x-1/2 bg-gradient-to-r from-black/10 via-white/40 to-black/10 md:block" />
      <div className="grid md:grid-cols-2">
        <div
          className="relative flex min-h-[27rem] flex-col justify-end overflow-hidden bg-cover bg-center p-7 text-white"
          style={{
            backgroundImage: page.leftBackgroundUrl
              ? `linear-gradient(0deg, rgba(15,23,42,.82), rgba(15,23,42,.05)), url("${page.leftBackgroundUrl}")`
              : `linear-gradient(145deg, ${page.colors[0]}, ${page.colors[1]})`,
          }}
        >
          <span className="absolute -right-5 -top-8 text-[10rem] opacity-20" aria-hidden>
            {page.emoji}
          </span>
          <p className="relative text-xs font-black uppercase tracking-[0.2em]">
            {page.slug} · {page.group}
          </p>
          <h2 id={`page-${page.slug}`} className="relative font-display text-3xl">
            {page.title}
          </h2>
          <p className="relative mt-2 max-w-md text-sm font-semibold text-white/90">
            {page.story}
          </p>
          <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${(earnedCount / 9) * 100}%` }}
            />
          </div>
          <p className="relative mt-1 text-xs font-bold">{earnedCount}/9 sticker</p>
        </div>

        <div
          className="grid min-h-[27rem] grid-cols-3 gap-2 bg-cover bg-center p-4 sm:gap-3 sm:p-6"
          style={{
            backgroundImage: page.stickerPageUrl
              ? `linear-gradient(rgba(255,253,243,.84), rgba(247,237,201,.84)), url("${page.stickerPageUrl}")`
              : 'radial-gradient(circle at center, #fffdf3, #f7edc9)',
          }}
        >
          {page.stickers.map((item, index) => {
            const unlocked = earned.has(item.id)
            const revealHint = !item.boss || earnedCount >= 6
            return (
              <article
                key={item.id}
                className={`group flex min-h-28 flex-col items-center justify-center rounded-2xl border-2 p-2 text-center transition ${
                  unlocked
                    ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-100 shadow-sm'
                    : item.boss
                      ? 'border-violet-200 bg-violet-50/70'
                      : 'border-dashed border-slate-200 bg-white/70'
                }`}
              >
                {unlocked && item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="h-12 w-12 object-contain" />
                ) : !unlocked && item.placeholderUrl ? (
                  <img src={item.placeholderUrl} alt="" className="h-12 w-12 object-contain opacity-45 grayscale" />
                ) : (
                  <span className={`text-3xl ${unlocked ? '' : 'grayscale opacity-35'}`} aria-hidden>
                    {unlocked || revealHint ? item.icon : '❔'}
                  </span>
                )}
                <h3 className="mt-1 text-xs font-extrabold leading-tight">
                  {unlocked ? item.name : item.boss ? 'Boss bí ẩn' : `Sticker ${index + 1}`}
                </h3>
                <p className="mt-1 text-[10px] leading-tight text-muted">
                  {unlocked ? 'Đã mở ✨' : revealHint ? item.hint : 'Thu thập thêm sticker để mở hint'}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
