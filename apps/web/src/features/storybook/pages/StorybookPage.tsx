import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { api } from '@/shared/lib/api'
import { BookSpread } from '../components/BookSpread'
import { GalleryWall } from '../components/GalleryWall'
import { InteractionBoard } from '../components/InteractionBoard'
import { SocialLeaderboard } from '../components/SocialLeaderboard'
import { STORYBOOK_PAGES, type StorybookPage } from '../storybook-data'
import { ChapterRewardCard } from '../components/ChapterRewardCard'

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
  const [studioChapters, setStudioChapters] = useState<Array<{
    code: string
    name: string
    description: string
    content?: { slug?: string; story?: string }
    displayConfig?: { colors?: [string, string]; emoji?: string }
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
        studio?: { chapters?: typeof studioChapters }
      }>(
        '/api/gamification/storybook',
      )
      setEarnedStickerIds(data.earnedStickerIds)
      setStudioChapters(data.studio?.chapters ?? [])
      setNotice('')
    } catch {
      setNotice('Chưa đồng bộ được tiến trình. Cuốn sách vẫn mở để con khám phá.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const earned = useMemo(() => new Set(earnedStickerIds), [earnedStickerIds])
  const pages = useMemo(() => STORYBOOK_PAGES.map((page): StorybookPage => {
    const override = studioChapters.find((item) =>
      item.content?.slug?.toUpperCase() === page.slug || item.code.toUpperCase() === page.slug)
    if (!override) return page
    return {
      ...page,
      title: override.name || page.title,
      story: override.content?.story || override.description || page.story,
      emoji: override.displayConfig?.emoji || page.emoji,
      colors: override.displayConfig?.colors || page.colors,
    }
  }), [studioChapters])
  const currentPage = pages[pageIndex]

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
            {loading ? 'Đang ghép sticker…' : `${earned.size}/72 sticker đã mở`}
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
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
              disabled={pageIndex === 0}
              className="rounded-full border-2 border-amber-700 bg-[#fff9df] px-4 py-2 text-sm font-black text-amber-900 disabled:opacity-30"
            >
              ← Trang trước
            </button>
            <div className="flex items-center gap-1.5" aria-label="Chọn trang sách">
              {pages.map((page, index) => (
                <button
                  key={page.slug}
                  type="button"
                  title={page.title}
                  aria-label={`Mở ${page.title}`}
                  aria-pressed={index === pageIndex}
                  onClick={() => setPageIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === pageIndex ? 'w-8 bg-amber-700' : 'w-2.5 bg-amber-200'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPageIndex((index) => Math.min(pages.length - 1, index + 1))}
              disabled={pageIndex === pages.length - 1}
              className="rounded-full border-2 border-amber-700 bg-[#fff9df] px-4 py-2 text-sm font-black text-amber-900 disabled:opacity-30"
            >
              Trang sau →
            </button>
          </div>
          <BookSpread page={currentPage} earned={earned} />
          <ChapterRewardCard page={currentPage} earned={earned} onClaimed={() => void load()} />
          <div className="flex justify-center gap-2">
            {pages.map((page, index) => (
              <button
                key={page.slug}
                type="button"
                onClick={() => setPageIndex(index)}
                className={`rounded-xl px-2 py-1 text-xs font-bold ${
                  index === pageIndex ? 'bg-amber-100 text-amber-900' : 'text-muted'
                }`}
              >
                {page.emoji} {page.slug}
              </button>
            ))}
          </div>
        </>
      )}
    </PageMotion>
  )
}
