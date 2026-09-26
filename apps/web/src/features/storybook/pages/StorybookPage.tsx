import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { api } from '@/shared/lib/api'
import { BookSpread } from '../components/BookSpread'
import { StorybookHero } from '../components/StorybookHero'
import { STORYBOOK_PAGES, type StorybookPage } from '../storybook-data'
import { safeChapterColors, uniqueRewardIds, uniqueStorybookIds } from '../storybook-contract'

export function StorybookPage() {
  const [searchParams] = useSearchParams()
  const [earnedStickerIds, setEarnedStickerIds] = useState<string[]>([])
  const [ownedRewardIds, setOwnedRewardIds] = useState<string[]>([])
  const [studioChapters, setStudioChapters] = useState<Array<{
    code: string
    name: string
    description: string
    content?: {
      slug?: string
      story?: string
      group?: StorybookPage['group']
      stickers?: StorybookPage['stickers']
      rewardId?: string
      buttonAssets?: StorybookPage['buttonAssets']
    }
    displayConfig?: {
      colors?: [string, string]
      emoji?: string
      coverUrl?: string
      leftBackgroundUrl?: string
      stickerPageUrl?: string
      stickerSheetUrl?: string
      themeKey?: string
    }
    assets?: {
      completionMedia?: StorybookPage['completionMedia']
    }
  }>>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const requestedView = searchParams.get('view')
  const requestedPage = searchParams.get('page')
  const initialPageIndex = STORYBOOK_PAGES.findIndex((page) => page.slug === requestedPage)
  const [pageIndex, setPageIndex] = useState(initialPageIndex >= 0 ? initialPageIndex : 0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<{
        earnedStickerIds: string[]
        inventory?: Array<{ rewardId: string }>
        studio?: { chapters?: typeof studioChapters }
      }>(
        '/api/gamification/storybook',
      )
      setEarnedStickerIds(uniqueStorybookIds(
        Array.isArray(data.earnedStickerIds) ? data.earnedStickerIds : [],
      ))
      setOwnedRewardIds(uniqueRewardIds(
        Array.isArray(data.inventory) ? data.inventory.map((item) => item?.rewardId) : [],
      ))
      setStudioChapters(Array.isArray(data.studio?.chapters) ? data.studio.chapters : [])
      setNotice('')
    } catch {
      setNotice('Chưa đồng bộ được tiến trình. Cuốn sách vẫn mở để con khám phá.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const earned = useMemo(() => new Set(earnedStickerIds), [earnedStickerIds])
  const ownedRewards = useMemo(() => new Set(ownedRewardIds), [ownedRewardIds])
  const pages = useMemo(() => {
    const basePages = STORYBOOK_PAGES.map((page): StorybookPage => {
      const override = studioChapters.find((item) =>
        item.content?.slug?.toUpperCase() === page.slug || item.code.toUpperCase() === page.slug)
      if (!override) return page
      return {
        ...page,
        title: override.name || page.title,
        story: override.content?.story || override.description || page.story,
        group: override.content?.group || page.group,
        stickers: override.content?.stickers?.length === 9 ? override.content.stickers : page.stickers,
        emoji: override.displayConfig?.emoji || page.emoji,
        colors: safeChapterColors(override.displayConfig?.colors, page.colors),
        coverUrl: override.displayConfig?.coverUrl || page.coverUrl,
        leftBackgroundUrl: override.displayConfig?.leftBackgroundUrl || page.leftBackgroundUrl,
        stickerPageUrl: override.displayConfig?.stickerPageUrl || page.stickerPageUrl,
        stickerSheetUrl: override.displayConfig?.stickerSheetUrl || page.stickerSheetUrl,
        rewardId: override.content?.rewardId || page.rewardId,
        themeKey: override.displayConfig?.themeKey || page.themeKey,
        buttonAssets: override.content?.buttonAssets || page.buttonAssets,
        completionMedia: override.assets?.completionMedia || page.completionMedia,
      }
    })
    const existingSlugs = new Set(basePages.map((page) => page.slug))
    const addedPages = studioChapters.flatMap((item): StorybookPage[] => {
      const slug = item.content?.slug?.toUpperCase() || item.code.toUpperCase()
      if (existingSlugs.has(slug) || !item.content?.story || item.content.stickers?.length !== 9) return []
      return [{
        slug,
        title: item.name,
        story: item.content.story,
        group: item.content.group || 'learning',
        stickers: item.content.stickers,
        emoji: item.displayConfig?.emoji || '📖',
        colors: safeChapterColors(item.displayConfig?.colors, ['#4338CA', '#F59E0B']),
        coverUrl: item.displayConfig?.coverUrl,
        leftBackgroundUrl: item.displayConfig?.leftBackgroundUrl,
        stickerPageUrl: item.displayConfig?.stickerPageUrl,
        stickerSheetUrl: item.displayConfig?.stickerSheetUrl,
        rewardId: item.content?.rewardId,
        themeKey: item.displayConfig?.themeKey,
        buttonAssets: item.content?.buttonAssets,
        completionMedia: item.assets?.completionMedia,
      }]
    })
    return [...basePages, ...addedPages]
  }, [studioChapters])
  const currentPage = pages[pageIndex]
  const publishedStickerIds = useMemo(
    () => new Set(pages.flatMap((page) => page.stickers.map((sticker) => sticker.id))),
    [pages],
  )
  const publishedEarnedCount = useMemo(
    () => earnedStickerIds.filter((id) => publishedStickerIds.has(id)).length,
    [earnedStickerIds, publishedStickerIds],
  )

  if (requestedView === 'gallery' || requestedView === 'leaderboard' || requestedView === 'interaction') {
    return <Navigate to={`/community?view=${requestedView}`} replace />
  }

  return (
    <PageMotion className="max-w-[1080px] mx-auto w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-32 sm:pb-36 flex flex-col gap-4 sm:gap-6 min-w-0">
      <StorybookHero
        publishedEarnedCount={publishedEarnedCount}
        totalStickersCount={publishedStickerIds.size}
        loading={loading}
      />

      {notice && (
        <p className="rounded-2xl border border-sun-200 bg-sun-50 p-4 text-base font-semibold text-warning shadow-2xs">
          {notice}
        </p>
      )}

      <div className="w-full flex flex-col items-center justify-center">
        <BookSpread
          page={currentPage}
          pages={pages}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          earned={earned}
          ownedRewards={ownedRewards}
          onClaimed={load}
        />
      </div>
    </PageMotion>
  )
}
