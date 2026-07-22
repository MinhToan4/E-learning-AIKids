import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { designerAssets } from '@/shared/config/assets'
import type { WorkshopStep } from '../lib/workshop-types'

type HubCard = {
  id: WorkshopStep
  label: string
  desc: string
  img: string
  comingSoon?: boolean
}

const HUB_CARDS: HubCard[] = [
  {
    id: 'style',
    label: 'Vẽ Tranh AI',
    desc: 'Vẽ phác thảo, chọn phong cách rồi để AI biến nó thành tác phẩm nghệ thuật.',
    img: designerAssets.workshop.comic,
  },
  {
    id: 'story-genre',
    label: 'Sáng Tác Truyện',
    desc: 'Chọn thể loại, thêm ý tưởng rồi để AI giúp con viết câu chuyện của riêng mình.',
    img: designerAssets.workshop.mee,
  },
  {
    id: 'hub',
    label: 'Làm Video',
    desc: 'Sắp ra mắt — biến truyện thành video rực rỡ với AI.',
    img: designerAssets.workshop.style,
    comingSoon: true,
  },
]

type Props = {
  onGo: (step: WorkshopStep) => void
}

export function WorkshopHub({ onGo }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <img
          src={designerAssets.brand.mascot}
          alt="Mascot AI Kids"
          className="h-14 w-14 rounded-2xl object-cover shadow-soft"
        />
        <div>
          <h1 className="font-display text-3xl text-text">Xưởng Sáng Tạo</h1>
          <p className="mt-1 text-sm text-muted">
            Hôm nay con muốn tạo ra điều gì? Chọn một hoạt động bên dưới nhé!
          </p>
        </div>
      </div>

      {/* Cards — natural height, no stretching */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {HUB_CARDS.map((card) => (
          <button
            key={card.id + card.label}
            type="button"
            disabled={card.comingSoon}
            onClick={() => !card.comingSoon && onGo(card.id)}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-3xl border-2 text-left transition',
              card.comingSoon
                ? 'cursor-not-allowed border-border bg-white opacity-60'
                : 'border-border bg-white shadow-soft hover:border-brand-400 hover:shadow-clay active:scale-[0.98]',
            )}
          >
            {/* Cover image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
              <img
                src={card.img}
                alt=""
                aria-hidden
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              {card.comingSoon && (
                <div className="absolute inset-0 flex items-center justify-center bg-text/30 backdrop-blur-sm">
                  <span className="rounded-full bg-sun-400 px-3 py-1 text-xs font-extrabold text-text">
                    Sắp ra mắt
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 p-4">
              <h2 className="font-display text-xl text-text">{card.label}</h2>
              <p className="flex-1 text-sm text-muted">{card.desc}</p>
              {!card.comingSoon && (
                <div className="mt-3 flex items-center gap-1 text-sm font-extrabold text-brand-600">
                  Bắt đầu <ChevronRight size={14} />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
