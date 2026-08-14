import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import { api } from '@/shared/lib/api'
import { designerAssets } from '@/shared/config/assets'
import {
  KidCreativeImageIcon,
  KidProgressImageIcon,
  KidProfileImageIcon,
  KidStorybookImageIcon,
} from '@/shared/components/icons/KidImageIcons'
import { BookSpread } from '../components/BookSpread'
import { GalleryWall } from '../components/GalleryWall'
import { InteractionBoard } from '../components/InteractionBoard'
import { SocialLeaderboard } from '../components/SocialLeaderboard'
import { STORYBOOK_PAGES, type StorybookPage } from '../storybook-data'
import { safeChapterColors, uniqueRewardIds, uniqueStorybookIds } from '../storybook-contract'

type View = 'book' | 'gallery' | 'leaderboard' | 'interaction'
const views: Array<{
  id: View
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}> = [
  { id: 'book', label: 'Cuốn sách', icon: KidStorybookImageIcon },
  { id: 'gallery', label: 'Triển lãm', icon: KidCreativeImageIcon },
  { id: 'leaderboard', label: 'Vinh danh', icon: KidProgressImageIcon },
  { id: 'interaction', label: 'Tương tác', icon: KidProfileImageIcon },
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

  return (
    <PageMotion className="flex flex-col gap-5 sm:gap-6">
      <header className="student-feature-hero storybook-hero ui-card" data-tone="coral">
        <div className="student-feature-hero-row">
          <div className="max-w-2xl">
            <div className="eyebrow-chip">
              <KidStorybookImageIcon size={22} />
              Huyền thoại
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.08] text-text sm:text-4xl">Cuốn sách của con</h1>
            <p className="mt-3 text-base font-semibold leading-relaxed text-muted sm:text-lg">
              Mọi trang đều mở sẵn. Con tự chọn hành trình, sưu tầm sticker và lan tỏa
              những lời động viên tích cực.
            </p>
            <Link to="/home" className="mt-3 inline-flex min-h-11 items-center font-extrabold text-brand-700 hover:underline">
              ← Về sảnh
            </Link>
          </div>
          <div className="storybook-hero-count" aria-label={`${publishedEarnedCount} trên ${publishedStickerIds.size} sticker đã mở`}>
            <span className="student-feature-hero-icon" aria-hidden="true"><KidStorybookImageIcon size={42} /></span>
            <p>
              <strong className="block font-display text-2xl text-text">{loading ? '…' : `${publishedEarnedCount}/${publishedStickerIds.size}`}</strong>
              <span className="text-sm font-bold text-muted">sticker đã mở</span>
            </p>
          </div>
        </div>
        <div className="student-feature-scene" aria-hidden="true">
          <img src={designerAssets.worldScenes.storyIsland} alt="" />
          <ImportantCardMascot pose="thinking" className="important-card-mascot--scene" />
        </div>
      </header>

      <div className="storybook-view-tabs" role="tablist" aria-label="Chọn khu vực Huyền thoại">
        {views.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              onClick={() => setView(item.id)}
              className="storybook-view-tab"
            >
              <Icon size={24} />
              {item.label}
            </button>
          )
        })}
      </div>

      {notice && (
        <p className="rounded-2xl border border-sun-200 bg-sun-50 p-4 text-base font-semibold text-warning">
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
