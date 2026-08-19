import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import { designerAssets } from '@/shared/config/assets'
import { GalleryWall } from '../components/GalleryWall'
import { InteractionBoard } from '../components/InteractionBoard'
import { SocialLeaderboard } from '../components/SocialLeaderboard'

export type CommunityView = 'gallery' | 'leaderboard' | 'interaction'

export const COMMUNITY_DESTINATIONS = [
  {
    id: 'gallery' as const,
    label: 'Triển lãm',
    action: 'Đi xem tranh',
    artwork: designerAssets.community.islands.gallery,
    emoji: '🎨',
  },
  {
    id: 'leaderboard' as const,
    label: 'Vinh danh',
    action: 'Tỏa sáng cùng nhau',
    artwork: designerAssets.community.islands.honor,
    emoji: '🏅',
  },
  {
    id: 'interaction' as const,
    label: 'Tương tác',
    action: 'Cùng chơi sáng tạo',
    artwork: designerAssets.community.islands.interaction,
    emoji: '🤝',
  },
]

function safeInitialView(value: string | null): CommunityView {
  return value === 'leaderboard' || value === 'interaction' ? value : 'gallery'
}

export function CommunityPage() {
  const [searchParams] = useSearchParams()
  const [view, setView] = useState<CommunityView>(() => safeInitialView(searchParams.get('view')))

  return (
    <PageMotion className="flex flex-col gap-5 sm:gap-6">
      <header className="student-feature-hero storybook-community-hero ui-card" data-tone="mint">
        <div className="student-feature-hero-row">
          <div className="max-w-2xl">
            <div className="eyebrow-chip">🏝️ Một thế giới riêng</div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.08] text-text sm:text-4xl">Đảo cộng đồng</h1>
            <p className="mt-3 text-base font-semibold leading-relaxed text-muted sm:text-lg">
              Mee dẫn con ghé ba hòn đảo nhỏ để xem tác phẩm, chúc mừng điều tốt và cùng nhau sáng tạo.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link to="/storybook" className="storybook-back-to-book">
                📖 Về Cuốn sách của con
              </Link>
              <span className="rounded-full border border-mint-200 bg-white/80 px-3 py-2 text-sm font-extrabold text-mint-800">
                🛡️ Có phụ huynh đồng hành
              </span>
            </div>
          </div>
        </div>
        <div className="student-feature-scene storybook-community-scene" aria-hidden="true">
          <img src={designerAssets.game.mapSmall} alt="" />
          <ImportantCardMascot pose="welcome" className="important-card-mascot--scene" />
        </div>
      </header>

      <section className="community-destination-section" aria-labelledby="community-destination-title">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-mint-700">Chọn một điểm đến</p>
          <h2 id="community-destination-title" className="mt-1 font-display text-2xl text-text">Con muốn ghé đảo nào?</h2>
        </div>
        <div className="community-destination-map" role="tablist" aria-label="Ba điểm đến trên Đảo cộng đồng">
          {COMMUNITY_DESTINATIONS.map((destination, index) => (
            <button
              key={destination.id}
              type="button"
              role="tab"
              aria-selected={view === destination.id}
              className="community-destination"
              data-tone={destination.id}
              onClick={() => setView(destination.id)}
            >
              <img className="community-island-image" src={destination.artwork} alt="" aria-hidden="true" />
              <span className="community-destination-sign">
                <strong><span aria-hidden="true">{destination.emoji}</span> {destination.label}</strong>
                <small>{destination.action}</small>
              </span>
              <span className="community-destination-step" aria-hidden="true">{index + 1}</span>
            </button>
          ))}
        </div>
      </section>

      {view === 'gallery' ? <GalleryWall /> : view === 'leaderboard' ? <SocialLeaderboard /> : <InteractionBoard />}
    </PageMotion>
  )
}
