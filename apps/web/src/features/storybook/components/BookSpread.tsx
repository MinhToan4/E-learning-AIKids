import { useEffect, useState, type CSSProperties } from 'react'
import type { StorybookPage } from '../storybook-data'
import { ChapterRewardCard } from './ChapterRewardCard'

type MobileBookPage = 'chapter' | 'stickers'

const stickerPlacements = [
  { x: 18, y: 18, rotate: -7, scale: 1.05 },
  { x: 50, y: 14, rotate: 4, scale: 0.9 },
  { x: 81, y: 22, rotate: 8, scale: 0.86 },
  { x: 25, y: 48, rotate: 6, scale: 1 },
  { x: 63, y: 43, rotate: -5, scale: 0.94 },
  { x: 48, y: 64, rotate: 5, scale: 1.08 },
  { x: 17, y: 78, rotate: -8, scale: 0.88 },
  { x: 80, y: 72, rotate: 7, scale: 0.96 },
  { x: 52, y: 87, rotate: -2, scale: 1.22 },
] as const

function BookFrameDecoration() {
  return (
    <svg
      className="storybook-frame-decoration"
      viewBox="0 0 1200 72"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M28 58C28 30 48 14 78 14H548C573 14 590 25 600 43C610 25 627 14 652 14H1122C1152 14 1172 30 1172 58" />
      <path d="M28 58H548C573 58 590 63 600 70C610 63 627 58 652 58H1172" />
    </svg>
  )
}

export function BookSpread({
  page,
  earned,
  onClaimed,
}: {
  page: StorybookPage
  earned: ReadonlySet<string>
  onClaimed?: () => void
}) {
  const [mobilePage, setMobilePage] = useState<MobileBookPage>('chapter')
  const [selectedStickerIndex, setSelectedStickerIndex] = useState<number | null>(null)
  const [showStickerGuide, setShowStickerGuide] = useState(false)
  const earnedCount = page.stickers.filter((item) => earned.has(item.id)).length

  useEffect(() => {
    setMobilePage('chapter')
    setSelectedStickerIndex(null)
    setShowStickerGuide(false)
  }, [page.slug])

  const selectedSticker = selectedStickerIndex === null
    ? null
    : page.stickers[selectedStickerIndex]

  return (
    <section className="storybook-book" aria-labelledby={`page-${page.slug}`}>
      <BookFrameDecoration />
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

      <div className="storybook-pages">
        <div
          id={`chapter-${page.slug}`}
          role="tabpanel"
          className={`storybook-page storybook-page-left ${mobilePage === 'chapter' ? '' : 'storybook-mobile-hidden'}`}
          style={{
            backgroundImage: page.leftBackgroundUrl
              ? `linear-gradient(0deg, rgba(15,23,42,.84), rgba(15,23,42,.08)), url("${page.leftBackgroundUrl}")`
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
          </div>
          <div className="relative mt-auto pt-6">
            <ChapterRewardCard page={page} earned={earned} onClaimed={onClaimed} embedded />
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
          style={{
            backgroundImage: page.stickerPageUrl
              ? `linear-gradient(rgba(255,253,243,.88), rgba(247,237,201,.88)), url("${page.stickerPageUrl}")`
              : 'radial-gradient(circle at center, #fffdf3, #f7edc9)',
          }}
        >
          <div className="storybook-sticker-canvas">
            <svg className="storybook-sticker-trail" viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true">
              <path d="M15 18C42 4 82 9 82 28C81 48 22 35 22 53C22 68 78 54 80 73C81 90 54 91 51 106" />
            </svg>
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
              const placement = stickerPlacements[index]
              return (
                <button
                  type="button"
                  key={item.id}
                  aria-label={`${item.name}. ${unlocked ? 'Đã mở' : 'Chưa mở'}`}
                  aria-pressed={selectedStickerIndex === index}
                  onClick={() => {
                    setShowStickerGuide(false)
                    setSelectedStickerIndex(index)
                  }}
                  className={`storybook-loose-sticker ${
                    unlocked
                      ? 'storybook-loose-sticker-unlocked'
                      : 'storybook-loose-sticker-locked'
                  } ${item.boss ? 'storybook-loose-sticker-boss' : ''}`}
                  style={{
                    '--sticker-x': `${placement.x}%`,
                    '--sticker-y': `${placement.y}%`,
                    '--sticker-rotate': `${placement.rotate}deg`,
                    '--sticker-scale': placement.scale,
                  } as CSSProperties}
                >
                  <span className="storybook-loose-sticker-art">
                    {unlocked && item.imageUrl ? (
                      <img src={item.imageUrl} alt="" />
                    ) : page.stickerSheetUrl ? (
                      <span
                        className="storybook-sticker-art"
                        style={{
                          backgroundImage: `url("${page.stickerSheetUrl}")`,
                          backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%`,
                        }}
                        aria-hidden="true"
                      />
                    ) : !unlocked && item.placeholderUrl ? (
                      <img src={item.placeholderUrl} alt="" />
                    ) : (
                      <span aria-hidden>{item.icon}</span>
                    )}
                  </span>
                  {!unlocked && <span className="storybook-sticker-lock" aria-hidden>•</span>}
                </button>
              )
            })}

            {(selectedSticker || showStickerGuide) && (
              <div className="storybook-sticker-detail" role="dialog" aria-modal="false" aria-live="polite">
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
                    <p>
                      {earned.has(selectedSticker.id)
                        ? 'Sticker đã được dán vào trang huyền thoại của con.'
                        : selectedSticker.boss && earnedCount < 6
                          ? 'Sưu tầm thêm sticker trong chương để mở gợi ý bí mật.'
                          : selectedSticker.hint}
                    </p>
                    <span className={earned.has(selectedSticker.id)
                      ? 'storybook-sticker-status-unlocked'
                      : 'storybook-sticker-status-locked'}>
                      {earned.has(selectedSticker.id) ? 'Đã sưu tầm' : `${earnedCount}/9 trong chương`}
                    </span>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
