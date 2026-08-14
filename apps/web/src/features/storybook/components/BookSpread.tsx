import { useEffect, useState, type CSSProperties } from 'react'
import type { StorybookPage } from '../storybook-data'
import { ChapterRewardCard } from './ChapterRewardCard'
import { safeStorybookAssetUrl } from '../storybook-contract'

type MobileBookPage = 'chapter' | 'stickers'

function safeMediaUrl(value?: string): string | undefined {
  return safeStorybookAssetUrl(value)
}

export function storybookChapterState(page: StorybookPage, earned: ReadonlySet<string>) {
  const earnedCount = page.stickers.filter((sticker) => earned.has(sticker.id)).length
  const complete = earned.has(`${page.slug}-S9`)
  const ready = !complete && page.stickers.slice(0, 8).every((sticker) => earned.has(sticker.id))
  return { earnedCount, complete, ready }
}

export function BookSpread({
  page,
  pages,
  pageIndex,
  onPageChange,
  earned,
  ownedRewards,
  onClaimed,
}: {
  page: StorybookPage
  pages: readonly StorybookPage[]
  pageIndex: number
  onPageChange: (index: number) => void
  earned: ReadonlySet<string>
  ownedRewards: ReadonlySet<string>
  onClaimed?: () => void | Promise<void>
}) {
  const [mobilePage, setMobilePage] = useState<MobileBookPage>('chapter')
  const [selectedStickerIndex, setSelectedStickerIndex] = useState<number | null>(null)
  const [detailVersion, setDetailVersion] = useState(0)
  const [showStickerGuide, setShowStickerGuide] = useState(false)
  const earnedCount = page.stickers.filter((item) => earned.has(item.id)).length

  useEffect(() => {
    setMobilePage('chapter')
    setSelectedStickerIndex(null)
    setShowStickerGuide(false)
  }, [page.slug])

  useEffect(() => {
    if (selectedStickerIndex === null) return
    const timer = window.setTimeout(() => setSelectedStickerIndex(null), 3_000)
    return () => window.clearTimeout(timer)
  }, [detailVersion, selectedStickerIndex])

  const selectedSticker = selectedStickerIndex === null
    ? null
    : page.stickers[selectedStickerIndex]
  const chapterComplete = earned.has(`${page.slug}-S9`)
  const completionVideo = safeMediaUrl(page.completionMedia?.videoUrl)
  const completionWebm = safeMediaUrl(page.completionMedia?.webmUrl)
  const completionPoster = safeMediaUrl(page.completionMedia?.posterUrl)
  const completionCaptions = safeMediaUrl(page.completionMedia?.captionsUrl)
  const stickerPageBackground = safeStorybookAssetUrl(page.stickerPageUrl)

  return (
    <section className="storybook-book" aria-labelledby={`page-${page.slug}`}>
      <div className="storybook-mobile-tabs" role="tablist" aria-label="Chọn mặt sách">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePage === 'chapter'}
          aria-controls={`chapter-${page.slug}`}
          onClick={() => setMobilePage('chapter')}
        >
          Nội dung chương
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePage === 'stickers'}
          aria-controls={`stickers-${page.slug}`}
          onClick={() => setMobilePage('stickers')}
        >
          Sticker · {earnedCount}/9
        </button>
      </div>

      <div className="storybook-book-layout">
        <div className="storybook-pages" key={page.slug}>
          <div
          id={`chapter-${page.slug}`}
          role="tabpanel"
          className={`storybook-page storybook-page-left ${mobilePage === 'chapter' ? '' : 'storybook-mobile-hidden'}`}
          style={{
            backgroundImage: safeStorybookAssetUrl(page.leftBackgroundUrl)
              ? `linear-gradient(180deg, rgba(30,39,64,.3) 0%, rgba(30,39,64,.04) 44%, rgba(30,39,64,.82) 100%), url("${safeStorybookAssetUrl(page.leftBackgroundUrl)}")`
              : `linear-gradient(145deg, ${page.colors[0]}, ${page.colors[1]})`,
          }}
        >
          <span className="pointer-events-none absolute -right-5 -top-8 text-[10rem] opacity-20" aria-hidden>
            {page.emoji}
          </span>
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              Chương {page.slug.replace('P', '')}
            </p>
            <h2 id={`page-${page.slug}`} className="mt-1 font-display text-3xl sm:text-4xl">
              {page.title}
            </h2>
            <p className="mt-3 max-w-md text-base font-semibold leading-relaxed text-white/90">
              {page.story}
            </p>
            {chapterComplete ? (
              completionVideo || completionWebm ? (
                <div className="mt-5 overflow-hidden rounded-3xl border-2 border-white/50 bg-slate-950/80 shadow-clay">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={completionPoster}
                    className="aspect-video w-full bg-slate-950 object-cover"
                    aria-label={`Phim kết chương ${page.title}`}
                  >
                    {completionWebm && <source src={completionWebm} type="video/webm" />}
                    {completionVideo && <source src={completionVideo} type="video/mp4" />}
                    {completionCaptions && <track src={completionCaptions} kind="captions" srcLang="vi" label="Tiếng Việt" default />}
                    Trình duyệt chưa hỗ trợ video này.
                  </video>
                  <p className="px-4 py-3 text-sm font-extrabold text-white">🎬 Phim kết chương · Đã mở cùng S9</p>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/40 bg-white/15 p-3 text-sm font-bold text-white/90">
                  🎬 S9 đã mở. Phim kết chương đang được chuẩn bị.
                </div>
              )
            ) : (
              <div className="mt-5 rounded-2xl border border-white/35 bg-black/15 p-3 text-sm font-bold text-white/90">
                🎬 Phim kết chương sẽ xuất hiện tại đây sau khi con mở S9.
              </div>
            )}
          </div>
          <div className="relative mt-auto pt-6">
            <ChapterRewardCard page={page} earned={earned} ownedRewards={ownedRewards} onClaimed={onClaimed} embedded />
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-white/25"
              role="progressbar"
              aria-label="Tiến độ sticker trong chương"
              aria-valuemin={0}
              aria-valuemax={9}
              aria-valuenow={earnedCount}
            >
              <div
                className="h-full rounded-full bg-white transition-all motion-reduce:transition-none"
                style={{ width: `${(earnedCount / 9) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-sm font-bold">{earnedCount}/9 sticker đã mở</p>
          </div>
          </div>

          <div
          id={`stickers-${page.slug}`}
          role="tabpanel"
          className={`storybook-page storybook-page-right ${mobilePage === 'stickers' ? '' : 'storybook-mobile-hidden'}`}
          style={stickerPageBackground
            ? { backgroundImage: `url("${stickerPageBackground}")` }
            : undefined}
        >
          <div
            className="storybook-sticker-canvas"
            data-layout={page.stickers.every((sticker) => sticker.placement) ? 'figma-scatter' : undefined}
          >
            <button
              type="button"
              className="storybook-sticker-help"
              aria-label="Cách mở sticker"
              aria-expanded={showStickerGuide}
              onClick={() => {
                setSelectedStickerIndex(null)
                setShowStickerGuide((open) => !open)
              }}
            >
              ?
            </button>
            {page.stickers.map((item, index) => {
              const unlocked = earned.has(item.id)
              return (
                <button
                  type="button"
                  key={item.id}
                  aria-label={`${item.name}. ${unlocked ? 'Đã mở' : 'Chưa mở'}`}
                  aria-pressed={selectedStickerIndex === index}
                  onClick={() => {
                    setShowStickerGuide(false)
                    setSelectedStickerIndex(index)
                    setDetailVersion((version) => version + 1)
                  }}
                  className={`storybook-sticker-slot ${
                    unlocked
                      ? 'storybook-loose-sticker-unlocked'
                      : 'storybook-loose-sticker-locked'
                  } ${item.boss ? 'storybook-loose-sticker-boss' : ''}`}
                  style={item.placement ? {
                    '--sticker-left': `${item.placement.left}%`,
                    '--sticker-top': `${item.placement.top}%`,
                    '--sticker-width': `${item.placement.width}%`,
                    '--sticker-height': `${item.placement.height}%`,
                  } as CSSProperties : undefined}
                >
                  <span className="storybook-loose-sticker-art">
                    {unlocked && safeStorybookAssetUrl(item.imageUrl) ? (
                      <img src={safeStorybookAssetUrl(item.imageUrl)} alt="" />
                    ) : safeStorybookAssetUrl(page.stickerSheetUrl) ? (
                      <span
                        className="storybook-sticker-art"
                        style={{
                          backgroundImage: `url("${safeStorybookAssetUrl(page.stickerSheetUrl)}")`,
                          backgroundPosition: `${((item.sheetIndex ?? index) % 3) * 50}% ${Math.floor((item.sheetIndex ?? index) / 3) * 50}%`,
                        }}
                        aria-hidden="true"
                      />
                    ) : !unlocked && safeStorybookAssetUrl(item.placeholderUrl) ? (
                      <img src={safeStorybookAssetUrl(item.placeholderUrl)} alt="" />
                    ) : (
                      <span aria-hidden>{item.icon}</span>
                    )}
                  </span>
                  {!unlocked && <span className="storybook-sticker-lock" aria-hidden>•</span>}
                </button>
              )
            })}

            {(selectedSticker || showStickerGuide) && (
              <div
                className="storybook-sticker-detail"
                role="dialog"
                aria-modal="false"
                aria-live="polite"
                data-auto-dismiss={selectedSticker ? 'true' : undefined}
              >
                <button
                  type="button"
                  className="storybook-sticker-detail-close"
                  aria-label="Đóng thông tin sticker"
                  onClick={() => {
                    setSelectedStickerIndex(null)
                    setShowStickerGuide(false)
                  }}
                >
                  ×
                </button>
                {showStickerGuide ? (
                  <>
                    <p className="storybook-sticker-detail-eyebrow">Cách dùng trang sticker</p>
                    <h3>Chạm vào một hình</h3>
                    <p>Con sẽ thấy tên, nhiệm vụ cần làm và trạng thái mở khóa của sticker đó.</p>
                  </>
                ) : selectedSticker ? (
                  <>
                    <p className="storybook-sticker-detail-eyebrow">
                      {earned.has(selectedSticker.id) ? 'Sticker đã mở' : 'Nhiệm vụ mở khóa'}
                    </p>
                    <h3>{selectedSticker.name}</h3>
                    {!earned.has(selectedSticker.id) && (
                      <p className="line-clamp-2">
                        {selectedSticker.boss && earnedCount < 6
                          ? 'Sưu tầm thêm sticker để mở gợi ý.'
                          : selectedSticker.hint}
                      </p>
                    )}
                    <span className={earned.has(selectedSticker.id)
                      ? 'storybook-sticker-status-unlocked'
                      : 'storybook-sticker-status-locked'}>
                      {earned.has(selectedSticker.id) ? 'Đã sưu tầm' : `${earnedCount}/9 sticker`}
                    </span>
                  </>
                ) : null}
              </div>
            )}
          </div>
          </div>
        </div>
        <nav className="storybook-chapter-rail" aria-label="Chọn chương Storybook">
          <button
            type="button"
            className="storybook-rail-arrow"
            aria-label="Chương trước"
            disabled={pageIndex === 0}
            onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
          >
            <span className="storybook-rail-arrow-glyph" data-direction="previous" aria-hidden="true" />
          </button>
          <div className="storybook-rail-tabs">
            {pages.map((bookPage, index) => {
              const { earnedCount: chapterEarned, complete, ready } = storybookChapterState(bookPage, earned)
              return (
              <button
                key={bookPage.slug}
                type="button"
                className="storybook-rail-tab"
                aria-label={`Mở ${bookPage.title}. ${complete ? 'Đã hoàn thành' : `${chapterEarned}/9 sticker`}`}
                aria-current={index === pageIndex ? 'page' : undefined}
                data-complete={complete || undefined}
                data-ready={ready || undefined}
                title={bookPage.title}
                onClick={() => onPageChange(index)}
                style={{
                  '--chapter-color': bookPage.colors[0],
                  '--chapter-progress': `${(chapterEarned / 9) * 360}deg`,
                } as CSSProperties}
              >
                <span className="storybook-rail-cover" aria-hidden style={safeStorybookAssetUrl(bookPage.coverUrl) ? { backgroundImage: `url("${safeStorybookAssetUrl(bookPage.coverUrl)}")` } : undefined}>
                  <span className="storybook-rail-shine" />
                  {!safeStorybookAssetUrl(bookPage.coverUrl) && (
                    <span className="storybook-rail-emoji">{bookPage.emoji}</span>
                  )}
                </span>
                <span className="storybook-rail-progress" aria-hidden>
                  <span>{complete ? '✓' : ready ? '★' : ''}</span>
                </span>
              </button>
              )
            })}
          </div>
          <button
            type="button"
            className="storybook-rail-arrow"
            aria-label="Chương sau"
            disabled={pageIndex === pages.length - 1}
            onClick={() => onPageChange(Math.min(pages.length - 1, pageIndex + 1))}
          >
            <span className="storybook-rail-arrow-glyph" data-direction="next" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </section>
  )
}
