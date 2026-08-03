import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { api } from '@/shared/lib/api'
import { BookSpread } from '../components/BookSpread'
import { GalleryWall } from '../components/GalleryWall'
import { InteractionBoard } from '../components/InteractionBoard'
import { SocialLeaderboard } from '../components/SocialLeaderboard'
import { STORYBOOK_PAGES, type StorybookPage } from '../storybook-data'
import { safeChapterColors, uniqueRewardIds, uniqueStorybookIds } from '../storybook-contract'

type View = 'book' | 'gallery' | 'leaderboard' | 'interaction'
const views: Array<{ id: View; label: string }> = [
  { id: 'book', label: '📖 Cuốn sách' },
  { id: 'gallery', label: '🖼️ Triển lãm' },
  { id: 'leaderboard', label: '🏆 Vinh danh' },
  { id: 'interaction', label: '🤝 Tương tác' },
]

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
    }
    displayConfig?: {
      colors?: [string, string]
      emoji?: string
      coverUrl?: string
      leftBackgroundUrl?: string
      stickerPageUrl?: string
      stickerSheetUrl?: string
    }
    assets?: {
      completionMedia?: StorybookPage['completionMedia']
    }
  }>>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const requestedView = searchParams.get('view')
  const initialView: View = requestedView === 'gallery' ||
    requestedView === 'leaderboard' ||
    requestedView === 'interaction'
    ? requestedView
    : 'book'
  const [view, setView] = useState<View>(initialView)
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

  return (
    <PageMotion className="flex flex-col gap-6">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-800 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
        <span className="absolute -right-6 -top-10 text-[12rem] opacity-15" aria-hidden>📖</span>
        <div className="relative max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
            Storybook of Legends
          </p>
          <h1 className="mt-1 font-display text-4xl">Cuốn sách huyền thoại của con</h1>
          <p className="mt-2 text-sm font-semibold text-white/85">
            Mọi trang đều mở sẵn. Con tự chọn hành trình, sưu tầm sticker và lan tỏa
            những lời động viên tích cực.
          </p>
          <Link to="/home" className="mt-4 inline-block text-sm font-bold text-amber-200 hover:underline">
            ← Về sảnh
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1" role="tablist">
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              onClick={() => setView(item.id)}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-extrabold ${
                view === item.id ? 'bg-white shadow-sm' : 'text-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {view === 'book' && (
          <p className="rounded-full bg-amber-100 px-4 py-2 text-sm font-extrabold text-amber-900">
            {loading
              ? 'Đang ghép sticker…'
              : `${publishedEarnedCount}/${publishedStickerIds.size} sticker đã mở`}
          </p>
        )}
      </div>

      {notice && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          {notice}
        </p>
      )}

      {view === 'gallery' ? <GalleryWall /> : view === 'leaderboard' ? (
        <SocialLeaderboard />
      ) : view === 'interaction' ? (
        <InteractionBoard />
      ) : (
        <>
          <BookSpread
            page={currentPage}
            pages={pages}
            pageIndex={pageIndex}
            onPageChange={setPageIndex}
            earned={earned}
            ownedRewards={ownedRewards}
            onClaimed={load}
          />
        </>
      )}
    </PageMotion>
  )
}
