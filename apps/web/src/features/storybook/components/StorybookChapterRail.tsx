import React, { type CSSProperties } from 'react'
import type { StorybookPage } from '../storybook-data'
import { safeStorybookAssetUrl } from '../storybook-contract'
import { storybookChapterState } from './BookSpread'

export interface StorybookChapterRailProps {
  page: StorybookPage
  pages: readonly StorybookPage[]
  pageIndex: number
  onPageChange: (index: number) => void
  earned: ReadonlySet<string>
}

export const StorybookChapterRail: React.FC<StorybookChapterRailProps> = ({
  page,
  pages,
  pageIndex,
  onPageChange,
  earned,
}) => {
  return (
    <nav className="storybook-chapter-rail" aria-label="Chọn chương Storybook">
      <button
        type="button"
        className="storybook-rail-arrow"
        aria-label="Chương trước"
        disabled={pageIndex === 0}
        onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
        style={
          safeStorybookAssetUrl(page.buttonAssets?.previousUrl)
            ? {
                backgroundImage: `url("${safeStorybookAssetUrl(page.buttonAssets?.previousUrl)}")`,
                backgroundSize: 'cover',
              }
            : undefined
        }
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
              style={
                {
                  '--chapter-color': bookPage.colors[0],
                  '--chapter-progress': `${(chapterEarned / 9) * 360}deg`,
                } as CSSProperties
              }
            >
              <span
                className="storybook-rail-cover"
                aria-hidden
                style={
                  safeStorybookAssetUrl(bookPage.coverUrl)
                    ? { backgroundImage: `url("${safeStorybookAssetUrl(bookPage.coverUrl)}")` }
                    : undefined
                }
              >
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
        style={
          safeStorybookAssetUrl(page.buttonAssets?.nextUrl)
            ? {
                backgroundImage: `url("${safeStorybookAssetUrl(page.buttonAssets?.nextUrl)}")`,
                backgroundSize: 'cover',
              }
            : undefined
        }
      >
        <span className="storybook-rail-arrow-glyph" data-direction="next" aria-hidden="true" />
      </button>
    </nav>
  )
}

export default StorybookChapterRail
